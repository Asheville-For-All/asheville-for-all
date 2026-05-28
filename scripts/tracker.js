import { scoreCardCollection } from "./tracker-data.js";

import multipliers from '../json/multipliers.json' with { type: 'json' };
import AshevilleCouncilRoster from '../json/AshevilleCouncilRoster.json' with { type: 'json' };

import { hideHorizontalScrollers, setHorizontalScrollers, setHorizScrollEventHandlers } from "./tracker_horizontal_scrollers.js";

import { ImageLoader } from "./tracker_imageLoader.js";

import * as Helper from "./tracker_helpers.js";

//**** VARIABLES *********/

var loadingStartTime = Date.now();

let params = new URLSearchParams(document.location.search);
var debug = false;
if (params.get("debug") == true || params.get("debug") == "true" || params.get("debug") == "y"){debug = true;console.log("Debug mode is activated.");}

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
];

const minimumVotesToShow = 3;

const scoreMaps = {
        "Approved":{
            "for": 1,
            "against": -1,
            "abstain": -1,
            "recused": 0,
            "absent": 0
            },
        "Amended and Approved":{
            "for": 1,
            "against": -1,
            "abstain": -1,
            "recused": 0,
            "absent": 0
            },
        "Denied":{
            "for": 1,
            "against": -1,
            "abstain": -1,
            "recused": 0,
            "absent": 0
            },
        "Continued":{
            "for": 1,
            "against": -1,
            "abstain": -1,
            "recused": 0,
            "absent": 0
            },
        "Failed":{
            "for": -1,
            "against": 1,
            "abstain": 1,
            "recused": 0,
            "absent": 0
            }
    };

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

    let maxGrade = -2.0;
    let minGrade = 2.0;

    $.each(AshevilleCouncilRoster, function(i, v){

        if (v.totalEligiblePoints < minimumVotesToShow){
            v.notEnoughData = true;
            v.grade = -2.0;
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

        v. adjustedGrade = (v.grade + 1) / 2;

        v.scaledGrade = Helper.scaleBetween(v.grade, 0.0, 1.0, minGrade, maxGrade);

        let roundedGradeInt = Math.round(v.scaledGrade * 10);
        v.color = gradeColors[roundedGradeInt];
        }
    });

    AshevilleCouncilRoster.sort((a, b) => b.grade - a.grade || b.totalEligiblePoints - a.totalEligiblePoints);

}

function assignScoresFromSingleScorecard(scorecard){

    scorecard.councilorStats = {};

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
                if (v == w.name){
                    pointsAtStake = pointsAtStake * w.value;
                }
            });
        });
    }

    scorecard.pointsAtStake = pointsAtStake;

    $.each(scoreMaps[scorecard.outcome], function(k,v){

        if (k in scorecard){ //k is "for" or "against" or ... etc

            $.each(scorecard[k], function(i, x){ //x is the councilor string name here

                let c = retrieveCouncilorFromName(x);

                c.totalEligiblePoints += Math.abs(scoreMaps[scorecard.outcome][k] * pointsAtStake * scorecard.pro_housing_scale__motion);

                c.totalVoteInstancesInTerm += 1;

                if (k == "absent"){c.totalVoteInstancesInTerm -= 1;}

                scorecard.councilorStats[x] = scoreMaps[scorecard.outcome][k] * pointsAtStake * scorecard.pro_housing_scale__motion;

                c.points += scorecard.councilorStats[x];

            });
        }

    });

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

        let gradientStop1 = Math.min(Math.round(v.adjustedGrade * 360), 355)
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

    let outcomeMap = scoreMaps[scorecard.outcome];

    let newString = "";

    let colorList = ["vote-viz-red", "vote-viz-neutral", "vote-viz-green"]

    $.each(outcomeMap, function(k, v){

        if(k == "for" || k == "against"){

            if (k in scorecard){

                let box = `
                <div class="vote-viz ${colorList[outcomeMap[k] * scorecard.pro_housing_scale__motion + 1]}">
                    <div class="vote-viz-label">${k.toUpperCase()}:&nbsp;</div>`

                $.each(scorecard[k], function(i, v){

                    box += `<div class="mini-pic" style="background-image: url('${retrieveCouncilorFromName(v).pic}')"></div>`;
                });

                box += `</div>`;

                newString += box;

            }

        }

    });

    return newString;   

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

    return `<div class="gauge-icon-outer" data-bs-toggle='modal' data-bs-target='#gaugeModal'><div class='gauge-icon ${gaugeClasses[proposalScale + 1]}' style="mask: url(img/tracker-imgs/file-lines-solid-full.svg);"></div><div class='gauge-icon ${gaugeClasses[motionScale + 1]}' style="mask: url(img/tracker-imgs/gavel-solid-full.svg);"></div></div>`;
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

      let t = event.target;

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

                let debugStr = "";
                if(debug){
                    debugStr = " " + String(data.councilorStats[w]);
                }

                outer.append(`<div class='row mb-1' style='flex-wrap:nowrap;'><div style="height:2.5rem;max-width:2.5rem;background-size: cover;background-position: 50% 50%;aspect-ratio: 1 / 1; border-radius:0.25rem;background-image: url('${retrieveCouncilorFromName(w).pic}')"></div><div>${w}${debugStr}</div>`);

            });

    }

    });

    if(debug){
        outer.append("<p>Points at stake: " + data.pointsAtStake + "</p>");
    }

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
    let jqBadge = $("<div style='vertical-align:middle;'></div>");
    jqBadge.append($(cardThatTriggered).find('.badge').clone());
    let jqName = $('<h2 style="clear:both;">' + data.name + '</h2>');
    let jqVoteDate = $('<div class="vote-date"></div>');
    jqVoteDate.append($(cardThatTriggered).find(".vote-date").html());

    jqTitle.html("");

    let infoBar = $("<div class='sidePaneInfoBar mb-2 mt-2'></div>");
    infoBar.append(jqBadge);
    infoBar.append(getGaugeString(data.pro_housing_scale__proposal, data.pro_housing_scale__motion));

    jqTitle.append(infoBar);
    jqTitle.append(jqName);
    jqTitle.append(jqVoteDate);

    $("#voteSidePanel").find(".offcanvas-body").html(body);

    if(data.pro_housing_scale__proposal == -1){
        $("#voteSidePanel").find(".offcanvas-title").addClass("bad-proposal");
    }else{
        $("#voteSidePanel").find(".offcanvas-title").removeClass("bad-proposal");
    }

    jqBadge.css("vertical-align", "center");

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
        
        rightColumnText = `<p>${data.name}${termText}</p><p>Total housing-related votes recorded in the selected duration: ${data.totalVoteInstancesInTerm}</p>`;

    }
    else{
        
        rightColumnText = `<p>${data.name}${termText}</p><p>* Not enough data available for this profile for the selected duration.</p>`;
    }

    if(debug){
        rightColumnText += `<p>Grade: ${data.grade}</p><p>Scaled grade: ${data.scaledGrade}</p>
        <p>Adjusted grade: ${data.adjustedGrade}</p>`
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

        let outcomeMap = scoreMaps[cardData.outcome];

        $.each(outcomeMap, function(k, v){

            if (k in cardData){

                $.each(cardData[k], function(i, c){

                    if (c == councilorName){

                        let pts = v * cardData.pro_housing_scale__motion;
                        if (pts > 0){
                            currentCard.addClass("highlight-green");
                        }
                        else if (pts < 0){
                            currentCard.addClass("highlight-red");
                        }
                    }
                });
            }

        });

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