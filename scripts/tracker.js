import { scoreCardCollection } from "./tracker-data.js";

import multipliers from '../json/multipliers.json' with { type: 'json' };
import AshevilleCouncilRoster from '../json/AshevilleCouncilRoster.json' with { type: 'json' };

import { hideHorizontalScrollers, setHorizontalScrollers, setHorizScrollEventHandlers } from "./tracker_horizontal_scrollers.js";

import { ImageLoader } from "./tracker_imageLoader.js";

import * as Helper from "./tracker_helpers.js";

//**** VARIABLES *********/

var loadingStartTime = Date.now();

const loadingTotalCount = scoreCardCollection.length + AshevilleCouncilRoster.length;

var loadingCount = 0;

const defaultNumYears = 3;
const defaultShowCouncilors = "no";

var settings = {};
settings.numYears = defaultNumYears;
settings.showCouncilors = defaultShowCouncilors;

const gradeColors = [
    [255, 0, 0],
    [255, 50, 0],
    [255, 102, 0],
    [255, 153, 0],
    [255, 204, 0],
    [255, 255, 0],
    [204, 255, 0],
    [153, 255, 0],
    [101, 255, 0],
    [50, 255, 0],
    [0, 255, 0]
]

const minimumVotesToShow = 3;

// ******* Initiating Function ************//

$(function() {

    globalThis.imgLoader = new ImageLoader();

    addBootstrapScripts();

    setHorizScrollEventHandlers();

    reBoot();

});


// *********FUNCTION DEFINITIONS****************** //

function reBoot(){

    loadingStartTime = Date.now();
    loadingCount = 0;

    $('council-list-outer').html("");
    $('vote-list-outer').html("");
    $(".show-after-load").addClass("d-none");

    hideHorizontalScrollers();

    endHighlights();

    setUpPlaceHolders();

    setUpCouncilors();

    assignScores();

    populateCouncilContainer();

    populateVoteItemsContainer();

    readyToShow();    
}

function readyToShow(){

    if (Date.now() - loadingStartTime > 1000 && globalThis.imgLoader.doneCount >= globalThis.imgLoader.images.length){
        $("#loading-info").addClass("d-none");

        $(".show-after-load").removeClass("d-none");

        setHorizontalScrollers();
    }
    else{
        let elapsed = Date.now() - loadingStartTime;

        let progressPercent1 = Math.round(elapsed / 10);

        $("#loading-bar-one").width(progressPercent1.toString() + "%");

        setTimeout(function(){readyToShow();}, 1000/30);
    }

}

function manageLoading(isDone = false){

    if(loadingTotalCount > loadingCount){
        loadingCount += 1;
    }

    let elapsed = Date.now() - loadingStartTime;

    let progressPercent1 = Math.round(elapsed / 10);

    $("#loading-bar-one").width(progressPercent1.toString() + "%");

    let progressPercent2 = Math.round( 100 * (loadingCount / loadingTotalCount));

    $("#loading-bar-two").width([progressPercent2.toString() + "%"]);
}

function setUpPlaceHolders(){

    $("#loading-info").removeClass("d-none");

    let loadingString = `<div class="mt-3"><p><span class="spinner-border spinner-border-sm" aria-hidden="true"></span> Loading</p><div class="progress mb-3" role="progressbar">
  <div class="progress-bar progress-bar-striped progress-bar-animated" id="loading-bar-one" style="width: 0%"></div>
</div><div class="progress" role="progressbar">
  <div class="progress-bar progress-bar-striped progress-bar-animated" id="loading-bar-two" style="width: 0%"></div>
</div></div>`

    $("#loading-info").html(loadingString);
}

function setUpCouncilors(){

    $.each(AshevilleCouncilRoster, function(index, councilor){

        councilor.points = 0;
        councilor.totalEligiblePoints = 0;
        councilor.totalVoteInstancesInTerm = 0;
        councilor.totalVotesRecorded = 0;
        councilor.notEnoughData = false;

        manageLoading();
    });
}

function retrieveCouncilorFromName(name){

    return AshevilleCouncilRoster.find(function(x){return name === x.name;});
}

function assignScores(){

    $.each(scoreCardCollection, function(i, scorecard){

        if (Helper.isDateRecent(settings.numYears, scorecard.date)){

         assignScoresFromSingleScorecard(scorecard);
        }
        
    });

    let maxGrade = 0.0;
    let minGrade = 1.0;

    $.each(AshevilleCouncilRoster, function(i, v){

        if (v.totalEligiblePoints < minimumVotesToShow){
            v.notEnoughData = true;
            v.grade = -1;
        }
        else{
            v.grade = v.points / v.totalEligiblePoints
            if (v.grade < minGrade){minGrade = v.grade};
            if (v.grade > maxGrade){maxGrade = v.grade};
        }

    });

    $.each(AshevilleCouncilRoster, function(i, v){

        if (v.notEnoughData){
            v.scaledGrade = -1;
        }
        else{
        v.scaledGrade = Helper.scaleBetween(v.grade, 0.0, 1.0, minGrade, maxGrade);

        let roundedGradeInt = Math.round(v.scaledGrade * 10);
        v.color = gradeColors[roundedGradeInt];
        }
    });

    AshevilleCouncilRoster.sort((a, b) => b.grade - a.grade || b.totalEligiblePoints - a.totalEligiblePoints);

}

function assignScoresFromSingleScorecard(scorecard){

    if("pro_housing_scale__motion" in scorecard == false){
        scorecard.pro_housing_scale__motion = 1;
    }
    if("pro_housing_scale__proposal" in scorecard == false){
        scorecard.pro_housing_scale__proposal = 1;
    }

    let pointsAtStake = 1;

    if("scoreFlags" in scorecard){
        $.each(scorecard.scoreFlags, function(i, v){

            $.each(multipliers, function(j, w){
                if (v = w.name){
                    pointsAtStake = pointsAtStake * w.value;
                }
            });
        });
    }

    $.each(scorecard["for"], function(i, v){

        var c = retrieveCouncilorFromName(v);

        if (c != undefined){

            if (scorecard.pro_housing_scale__motion == 1){
                c.points += pointsAtStake;
            }

            c.totalEligiblePoints += pointsAtStake;
            c.totalVoteInstancesInTerm += 1;
            c.totalVotesRecorded += 1;
        }
    });

    if ("against" in scorecard){

        $.each(scorecard["against"], function(i, v){

            var c = retrieveCouncilorFromName(v)

            if (c != undefined){

                if (scorecard.pro_housing_scale__motion == -1){
                c.points += pointsAtStake;
                }

                c.points += 0;
                c.totalEligiblePoints += pointsAtStake;
                c.totalVoteInstancesInTerm += 1;
                c.totalVotesRecorded += 1;
            }
        });
    }

    if ("absent" in scorecard){

        $.each(scorecard["absent"], function(i, v){

            if (c != undefined){

            var c = retrieveCouncilorFromName(v)

            c.points += 0;
            c.totalEligiblePoints += 0;
            c.totalVoteInstancesInTerm += 1;
            }
        });
    }

    if ("recused" in scorecard){
        $.each(scorecard["recused"], function(i, v){

            if (c != undefined){

            var c = retrieveCouncilorFromName(v)

            c.points += 0;
            c.totalEligiblePoints += 0;
            c.totalVoteInstancesInTerm += 1;
            }
        });
    }
    if ("abstain" in scorecard){
        $.each(scorecard["abstain"], function(i, v){

            var c = retrieveCouncilorFromName(v)

            if (c != undefined){

                c.points += 0;
                c.totalEligiblePoints += pointsAtStake;
                c.totalVoteInstancesInTerm += 1;
                c.totalVotesRecorded += 1;
            }
        });
    }

}

function checkIfCurrentCouncilor(councilorData){

    var current = false;
    let now = new Date();

    $.each(councilorData.terms, function(i, v){

        let start = new Date(v.start);
        let end = new Date(v.end);

        if (now > start && now < end){
            current = true;
            return true;
        }
    });

    return current;

}

function checkIfRelevantCouncilor(councilorData){
    //Just like the checkIfCurrentCouncilor function, but this one will return true if councilor served at all during the selected duration, even if not presently serving.

    var relevant = false;

    let now = new Date();
    let durationStartDate = now.add(-parseInt(settings.numYears)).years();

    $.each(councilorData.terms, function(i, v){
        let start = new Date(v.start);
        let end = new Date(v.end);

        if (now > start && durationStartDate < end){
            relevant = true;
            return true;
        }
    });

    return relevant;
}

function populateCouncilContainer(){

    $("council-list-outer").html("");

    let relevantCouncilors = [];

    $.each(AshevilleCouncilRoster, function(i, v){

        if(checkIfCurrentCouncilor(v)){

            let profilePic = addCouncilorProfile(v);

            if (v.notEnoughData){
                let asteriskBadge = $("<img src='img/tracker-imgs/asterisk.svg' class='asterisk-badge'></img>");
                profilePic.append(asteriskBadge);
            }
        }
        else if (checkIfRelevantCouncilor(v)){
            relevantCouncilors.push(v);
        }

    });

    if (relevantCouncilors.length > 0 && settings.showCouncilors == "yes"){

        let divider = $("<div id='divider'></div>");

        $("council-list-outer").append(divider);

        $.each(relevantCouncilors, function(i, v){

            let profilePic = addCouncilorProfile(v);

            let clockBadge = $("<img src='img/tracker-imgs/clock-rotate-left-solid.svg' class='clock-badge'></img>");

            profilePic.append(clockBadge);

            if(v.notEnoughData){
                let asteriskBadge = $("<img src='img/tracker-imgs/asterisk.svg' class='asterisk-badge'></img>");
                profilePic.append(asteriskBadge);
            }

        });
    }

}

function addCouncilorProfile(councilorData){

    let v = councilorData;

    if(v.notEnoughData == false){

        let colorStr = "rgb(" + v.color[0] + ", " + v.color[1] + ", " + v.color[2] + ")"

        let gradientStop1 = Math.min(Math.round(v.grade * 360), 355)
        let gradientStop2 = Math.min(gradientStop1 + 5, 359)

        let conicGradientStr = `${colorStr} 0deg, ${colorStr} ${gradientStop1}deg, snow ${gradientStop2}deg, snow 360deg`

        let newElem = $(`<div class="profile-pic-outer" title= "${v.name}" style="background-image: conic-gradient(${conicGradientStr});"><div class="profile-pic-inner" style="background-image:url('${v.pic}')"></div></div>`);

        $("council-list-outer").append(newElem);

        newElem.data("councilor", v);

        return newElem;

    }
    else{
        let newElem = $(`<div class="profile-pic-outer" title= "${v.name}" style="background-color:gray;"><div class="profile-pic-inner" style="background-image:url('${v.pic}')"></div></div>`);

        $("council-list-outer").append(newElem);

        newElem.data("councilor", v);

        return newElem;

    }

}

function buildIconString(scorecard){

    let iconStr = "<p class='vote-icons'>"

    if(Helper.isKeyAndArr(scorecard, "mediaCoverage")){
        iconStr += `<img class="vote-icon-media" src="img/newspaper.svg"/>`;
    }
    if(Helper.isKeyAndArr(scorecard, "afaLinks")){
        iconStr += `<img class="vote-icon-afalink" src="img/afa-small.svg"/>`;
    }
    if(Helper.isKeyAndArr(scorecard, "govLinks")){
        iconStr += `<img class="vote-icon-govt" src="img/dome-building.svg"/>`;
    }
    iconStr += `</p>`;

    return iconStr;
}

function buildVoteVizBox(scorecard){

    let forStr = "<div class='vote-viz-label'>FOR:&nbsp;</div>"

    if ("for" in scorecard){

        scorecard.for.sort( () => Math.random()-0.5 );
        
        $.each(scorecard.for, function(i, v){

            forStr += `<div class="mini-pic" style="background-image: url('${retrieveCouncilorFromName(v).pic}')"></div>`
        });
    }

    let forStrOuter = `<div class="vote-viz vote-viz-for vote-viz-neutral">${forStr}</div>`

    if (scorecard.pro_housing_scale__motion == -1){
        forStrOuter = `<div class="vote-viz vote-viz-for vote-viz-red">${forStr}</div>`
    }
    if (scorecard.pro_housing_scale__motion == 1){
        forStrOuter = `<div class="vote-viz vote-viz-for vote-viz-green">${forStr}</div>`
    }

    let againstStr = `<div class='vote-viz-label'>AGAINST:&nbsp;</div>`

    if ("against" in scorecard){

        scorecard.against.sort( () => Math.random()-0.5 );

        $.each(scorecard.against, function(i, v){

            againstStr += `<div class="mini-pic" style="background-image: url('${retrieveCouncilorFromName(v).pic}')"></div>`
        });

    }

    let againstStrOuter = `<div class="vote-viz vote-viz-against vote-viz-neutral">${againstStr}</div>`

    if (scorecard.pro_housing_scale__motion == -1){
        againstStrOuter = `<div class="vote-viz vote-viz-against vote-viz-green">${againstStr}</div>`
    }
    if (scorecard.pro_housing_scale__motion == 1){
        againstStrOuter = `<div class="vote-viz vote-viz-against vote-viz-red">${againstStr}</div>`
    }

    let newStr = forStrOuter

    if("against" in scorecard){
        newStr += againstStrOuter
    }

    return newStr
}

function populateVoteItemsContainer(){

    $("vote-list-outer").html("");

    let cardHolder = $('<div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-2"></div>');

    $("vote-list-outer").append(cardHolder);

    $.each(scoreCardCollection, function(i, v){

        if (Helper.isDateRecent(settings.numYears, v.date)){

            let newCol = $('<div class="col"></div>');

            cardHolder.append(newCol);

            let badgeString = `<div class='badge bg-primary type'>${v.type}</div>`

            let d = Date.parse(v.date).toString("MMMM dS, yyyy")

            let iconString = buildIconString(v);

            let badProposal = "";
            if (v.pro_housing_scale__proposal == -1){
                badProposal = " bad-proposal"
            }

            let gaugeString = getGaugeString(v.pro_housing_scale__proposal, v.pro_housing_scale__motion);

            let newCardHTML = `<div class="card h-100"><div class="card-body">${badgeString}${gaugeString}<h3 class="card-title ${badProposal}">${v.name}</h3><p class="vote-date">${d}</p><p class="vote-outcome">Outcome: ${v.outcome}</p> ${buildVoteVizBox(v)}</div><div class="card-footer">${iconString}</div></div>`;

            let newCard = $(newCardHTML);

            newCard.data("scorecard", v);

            newCol.append(newCard);
        }

        manageLoading();

    });

    $("vote-list-outer").append("<div class='container-40 container mt-4'><p>Visit the <i>settings</i> menu to adjust the number of years that are displayed.</p></div>");

}

function getGaugeString(proposalScale, motionScale){

    let gaugeClasses = ["gauge-low", "gauge-medium", "gauge-high"];

    return `<div class="gauge-icon-outer" data-bs-toggle='modal' data-bs-target='#gaugeModal' style='float:right;border-radius:0.2rem;border:0.5px solid gray; background:white;padding-left:0.25rem;padding-right:0.25rem;padding-bottom:0.25rem;'><img class='gauge-icon ${gaugeClasses[proposalScale + 1]}' src='img/tracker-imgs/file-lines-solid-full.svg'/><img class='gauge-icon ${gaugeClasses[motionScale + 1]}' src='img/tracker-imgs/gavel-solid-full.svg'/></div>`;
}

function addBootstrapScripts() {

    const myModalEl = document.getElementById('settings-modal');
    myModalEl.addEventListener('hidden.bs.modal', event => {

        let needReboot = false;

        let newNumYears = $("input[name='btnradiotime']:checked").val();

        let newShowCouncilors = $("input[name='btnradioshowallcouncilors']:checked").val();

        if (newNumYears != settings.numYears) {
            settings.numYears = newNumYears;
            needReboot = true;
        }

        if (newShowCouncilors != settings.showCouncilors) {
            settings.showCouncilors = newShowCouncilors;
            needReboot = true;
        }

        if (needReboot == true){
            reBoot();
        }

    });

    $("#tracker-frame-2").on("click", ".card", function(event){

      let t = event.target; //#TODO - this is the innermost element that was clicked. I should check if it's in the icon box with the scale icons...

      if(t.classList.contains('gauge-icon') || t.classList.contains('gauge-icon-outer')){

      }
      else{
      loadSidePanel(this);
      }
    });

    $('#tracker-frame-3').on("click", ".profile-pic-outer", function(){

        loadCouncilPanel(this);

    });
}

function createLinkLists(scorecard){

    let s = "<div class='container container-40 vote-link-list-container mt-4'>";

    let govImg = "img/dome-building.svg";
    let afaImg = "img/afa-small.svg";
    let mediaImg = "img/newspaper.svg";

    if("afaLinks" in scorecard){

        s += `<h3><img class="img-fluid voteLinkListImg" src="${afaImg}"/>&nbsp;Asheville For All Links</h3>`;
        
        s+= "<ul>";

        $.each(scorecard.afaLinks, function(i, v){

            s+= `<li><a href="${v.url}" target="_blank">${v.name}</a></li>`;

        });

        s+= "</ul>";

    }

    if("govLinks" in scorecard){

        s += `<h3><img class="img-fluid voteLinkListImg" src="${govImg}"/>&nbsp;Government Links</h3>`;;
        
        s+="<ul>";

        $.each(scorecard.govLinks, function(i, v){

            s+= `<li><a href="${v.url}" target="_blank">${v.type}</a></li>`;
        });

        s+= "</ul>";

    }
    if("mediaCoverage" in scorecard){

        s += `<h3><img class="img-fluid voteLinkListImg" src="${mediaImg}"/>&nbsp;Media Links</h3>`;

        s+= "<ul>";

        $.each(scorecard.mediaCoverage, function(i, v){

            s += `<li><a href="${v.url}" target="_blank">${v.publication}: ${v.headline}</a></li>`;
        });

        s+= '</ul>';

    }

    return s += "</div>";

}

function populateVoteItemRecordDetailOuter(data){

    let map = ["for", "against", "recused", "abstain", "absent"];

    let outer = $("<div id='voteItemRecordDetailOuter' class='container container-40'></div>");

    $.each(map, function(i, v){

        if (v in data && data.for.length > 0){
            outer.append(`<div class='row header-row'>${v.toUpperCase()}:</div>`);

            $.each(data[v], function(j,w){
                outer.append(`<div class='row'>${w}</div>`);
            });
    }

    });

    return outer;

}

function loadSidePanel(cardThatTriggered) {

    $("#voteSidePanel").find(".offcanvas-title").html(`<div class="spinner-border spinner-border-sm" role="status">
  <span class="visually-hidden">Loading...</span>
</div>`);

    let bsOffcanvas = new bootstrap.Offcanvas('#voteSidePanel');

    let data = $(cardThatTriggered).data("scorecard");

    let body = $(`<div></div>`);

    body.append($(cardThatTriggered).find(".vote-outcome").clone());

    let voteItemRecordDetailOuter = populateVoteItemRecordDetailOuter(data);

    body.append(voteItemRecordDetailOuter);

    body.append(`${createLinkLists(data)}`);

    let lateralNavsOuter = $("<div class='side-panel-lateral-navs mt-4'></div>");

    let previousCard = $(cardThatTriggered).parent().prev().children();
    let nextCard = $(cardThatTriggered).parent().next().children();

    if(previousCard.length){

            let d = Date.parse(previousCard.data("scorecard").date).toString("MMMM dS, yyyy");

            let jq_a = $(`<a href="javascript:void(0)">← ${previousCard.data("scorecard").name} / <em>${d}</em></a>`);
            let outerD = $(`<div class="mb-2"></div>`);

            lateralNavsOuter.append(outerD);
            outerD.append(jq_a);

            addListenerToLateralLink(jq_a, previousCard[0]);
    }
    if(nextCard.length){

            let d = Date.parse(nextCard.data("scorecard").date).toString("MMMM dS, yyyy");

            let jq_a = $(`<a href="javascript:void(0)">${nextCard.data("scorecard").name} / <em>${d}</em> →</a>`);
            let outerD = $(`<div class="mb-2"></div>`);

            lateralNavsOuter.append(outerD);
            outerD.append(jq_a);

            addListenerToLateralLink(jq_a, nextCard[0]);
    }
    body.append(lateralNavsOuter);

    let jqTitle = $("#voteSidePanel").find(".offcanvas-title");
    let jqBadge = $("<div class='mb-2'></div>");
    jqBadge.append($(cardThatTriggered).find('.badge').clone());
    let jqName = $('<h2>' + data.name + '</h2>');
    let jqVoteDate = $('<div class="vote-date"></div>');
    jqVoteDate.append($(cardThatTriggered).find(".vote-date").html());

    jqTitle.html("");
    jqTitle.append(jqBadge);
    jqTitle.append(jqName);
    jqTitle.append(jqVoteDate);

    $("#voteSidePanel").find(".offcanvas-body").html(body);

    if(data.pro_housing_scale__proposal == -1){
        $("#voteSidePanel").find(".offcanvas-title").addClass("bad-proposal");
    }else{
        $("#voteSidePanel").find(".offcanvas-title").removeClass("bad-proposal");
    }

    bsOffcanvas.show();
}

function lateralVoteLinkClicked(e){

    $("#voteSidePanel").find(".offcanvas-title").html("");
    $("#voteSidePanel").find(".offcanvas-body").html("");

    let bsOffcanvas = bootstrap.Offcanvas.getOrCreateInstance('#voteSidePanel');

    $('.modal-backdrop').remove();

    loadSidePanel(e.data.destinationCard);
}

function addListenerToLateralLink(jq_ATag, destinationCard){

    jq_ATag.on("click", {destinationCard: destinationCard}, lateralVoteLinkClicked);
}

function loadCouncilPanel(profileThatTriggered) {

    let bsOffcanvas = new bootstrap.Offcanvas('#councilBottomPanel');

    let t = $(profileThatTriggered).attr('title');

    $('#councilBottomPanel').find(".offcanvas-title").html(t);

    let profileClone = $(profileThatTriggered).clone();

    let data = $(profileThatTriggered).data('councilor');

    let termText = ""

    $.each(data.terms, function (i, v) {
        termText += `<br/>${v.start.slice(0, 4)} - ${v.end.slice(0, 4)}`
    });

      let rightColumnText = "";

    if (data.notEnoughData == false){
        
        rightColumnText = `<p>${data.name}${termText}</p><p>Total housing-related votes recorded in the selected duration: ${data.totalVotesRecorded}</p>`;

    }
    else{
        
        rightColumnText = `<p>${data.name}${termText}</p><p>* Not enough data available for this profile for the selected duration.</p>`;
    }

   

    let highlightModeButton = $('<button data-bs-toggle="offcanvas" href="#councilBottomPanel" class="btn btn-outline-secondary">Enter Highlight Mode</button>');

    $('#councilBottomPanel').find("#bs-oc-left-col").html(profileClone);
    $('#councilBottomPanel').find("#bs-oc-left-col").append(highlightModeButton);
    $('#councilBottomPanel').find("#bs-oc-right-col").html(rightColumnText);

    highlightModeButton.on("click", function(){
        let o = $(profileThatTriggered);
        switchOnHighlights(o)
    });

    bsOffcanvas.show();

}

function switchOnHighlights(jqObjProfilePicOuter){

    let councilorName = jqObjProfilePicOuter.data("councilor").name;

    let jqCardList = $("#tracker-frame-2").find('.card');

    jqCardList.each(function(i){

        let currentCard = $(this);

        let cardData = $(this).data("scorecard");

        if ("for" in cardData){

            $.each(cardData.for, function(i, v){
                if (councilorName == v){

                    if("pro_housing_scale__motion" in cardData && cardData.pro_housing_scale__motion == -1){
                    currentCard.addClass("highlight-red");
                    }
                    else{
                        currentCard.addClass("highlight-green");
                    }
                }
            });

        }

        if ("against" in cardData){

            $.each(cardData.against, function(i, v){
                if (councilorName == v){

                    if("pro_housing_scale__motion" in cardData && cardData.pro_housing_scale__motion == -1){
                    currentCard.addClass("highlight-green");
                    }
                    else{
                        currentCard.addClass("highlight-red");
                    }
                }
            });

        }

        if("abstain" in cardData){

            $.each(cardData.against, function(i, v){
                if (councilorName == v){

                    currentCard.addClass("highlight-orange");
                    }
            });            

        }
    });

    let clonePic = jqObjProfilePicOuter.clone();

    $('#highlight-mode').prepend(clonePic);

    $('#highlight-mode').removeClass("d-none");

    $('#tracker-frame-3').addClass("d-none");

    hideHorizontalScrollers();

    $('#highlight-mode').find('button').on("click", endHighlights);

}

function endHighlights(){
    //remove class on all scorecards
    let jqCardList = $("#tracker-frame-2").find('.card');
    jqCardList.removeClass('highlight-green');
    jqCardList.removeClass('highlight-red');

    //hide highlight-mode box and remove profile pic from it
    $('#highlight-mode').find('.profile-pic-outer').remove();
    $('#highlight-mode').addClass("d-none");

    //show council panel again.
    $('#tracker-frame-3').removeClass("d-none");
    setHorizontalScrollers();
}