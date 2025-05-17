import { multipliers, AshevilleCouncilRoster, scoreCardCollection } from "./tracker-data.js";

//**** GLOBALS *********/

var loadingStartTime = Date.now();

const loadingTotalCount = scoreCardCollection.length + AshevilleCouncilRoster.length;

var loadingCount = 0;

const defaultNumYears = 3;

var settings = {};
settings.numYears = defaultNumYears;

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

// ******* Initiating Function ************//

$(function() {

    addBootstrapScripts();

    reBoot();

});


// *********FUNCTION DEFINITIONS****************** //

/**
 * Given an object and a key, this function will check if the key is valid, if the key points to an array, and if that array has at least one value in it.
 * @param {object} objct - the parent object, which you already know exists.
 * @param {string} key - the attribute of the parent object, which may or may not exist but is expected to point to an array if it exists.
 */
function isKeyAndArr(objct, key){

    if(key in objct && Array.isArray(objct[key]) && objct[key].length > 0){
        return true;
    }
    else{
        return false;
    }
}

function isDateRecent(cutoffInYears, dateString){
  let diff = new Date() - new Date(dateString);
  let diffInYears = diff / (365.25 * 24 * 60 * 60 * 1000);
  if (diffInYears > cutoffInYears){
    return false;
  }
  else{
    return true;
  }
}

function reBoot(){

    loadingStartTime = Date.now();
    loadingCount = 0;

    $('council-list-outer').html("");
    $('vote-list-outer').html("");
    $(".show-after-load").addClass("d-none");


    setUpPlaceHolders();

    setUpCouncilors();

    assignScores();

    populateCouncilContainer();

    populateVoteItemsContainer();

    readyToShow();    
}

function readyToShow(){

    if (Date.now() - loadingStartTime > 1000){
        $("#loading-info").addClass("d-none");

        $(".show-after-load").removeClass("d-none");
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

        manageLoading();
    });
}

function retrieveCouncilorFromName(name){

    return AshevilleCouncilRoster.find(function(x){return name === x.name;});
}

function assignScores(){

    $.each(scoreCardCollection, function(i, scorecard){

        if (isDateRecent(settings.numYears, scorecard.date)){

         assignScoresFromSingleScorecard(scorecard);
        }
        
    });

    let maxGrade = 0.0;
    let minGrade = 1.0;

    $.each(AshevilleCouncilRoster, function(i, v){

        v.grade = v.points / v.totalEligiblePoints
        if (v.grade < minGrade){minGrade = v.grade};
        if (v.grade > maxGrade){maxGrade = v.grade};

    });

    function scaleBetween(unscaledNum, minAllowed, maxAllowed, min, max) {
        return (maxAllowed - minAllowed) * (unscaledNum - min) / (max - min) + minAllowed;
      }

    $.each(AshevilleCouncilRoster, function(i, v){
        v.scaledGrade = scaleBetween(v.grade, 0.0, 1.0, minGrade, maxGrade);

        let roundedGradeInt = Math.round(v.scaledGrade * 10);
        v.color = gradeColors[roundedGradeInt];
    });

    AshevilleCouncilRoster.sort((a, b) => b.grade - a.grade || b.totalEligiblePoints - a.totalEligiblePoints)

}

function assignScoresFromSingleScorecard(scorecard){

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

        var c = retrieveCouncilorFromName(v)

        if (c != undefined){
            c.points += pointsAtStake;
            c.totalEligiblePoints += pointsAtStake;
            c.totalVoteInstancesInTerm += 1;
        }
    });

    if ("against" in scorecard){

        $.each(scorecard["against"], function(i, v){

            var c = retrieveCouncilorFromName(v)

            if (c != undefined){

                c.points += 0;
                c.totalEligiblePoints += pointsAtStake;
                c.totalVoteInstancesInTerm += 1;
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
            }
        });
    }

}

function populateCouncilContainer(){

    $("council-list-outer").html("");

    $.each(AshevilleCouncilRoster, function(i, v){

        if("past" in v == false || v.past == false){

            let colorStr = "rgb(" + v.color[0] + ", " + v.color[1] + ", " + v.color[2] + ")"

            let gradientStop1 = Math.min(Math.round(v.grade * 360), 355)
            let gradientStop2 = Math.min(gradientStop1 + 5, 359)

            let conicGradientStr = `${colorStr} 0deg, ${colorStr} ${gradientStop1}deg, snow ${gradientStop2}deg, snow 360deg`

            let newElem = $(`<div class="profile-pic-outer" title= "${v.name}" style="background-image: conic-gradient(${conicGradientStr});"><div class="profile-pic-inner" style="background-image:url('${v.pic}')"></div></div>`);

            $("council-list-outer").append(newElem);

            newElem.data("councilor", v);
        }

    });

}

function buildIconString(scorecard){

    let iconStr = "<p class='vote-icons'>"

    if(isKeyAndArr(scorecard, "mediaCoverage")){
        iconStr += `<img class="vote-icon-media" src="img/newspaper.svg"/>`;
    }
    if(isKeyAndArr(scorecard, "afaLinks")){
        iconStr += `<img class="vote-icon-afalink" src="img/afa-small.svg"/>`;
    }
    if(isKeyAndArr(scorecard, "govLinks")){
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

    let forStrOuter = `<div class="vote-viz vote-viz-for vote-viz-green">${forStr}</div>`

    let againstStr = `<div class='vote-viz-label'>AGAINST:&nbsp;</div>`

    if ("against" in scorecard){

        scorecard.against.sort( () => Math.random()-0.5 );

        $.each(scorecard.against, function(i, v){

            againstStr += `<div class="mini-pic" style="background-image: url('${retrieveCouncilorFromName(v).pic}')"></div>`
        });

    }

    let againstStrOuter = `<div class="vote-viz vote-viz-against vote-viz-red">${againstStr}</div>`

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

        if (isDateRecent(settings.numYears, v.date)){

            let newCol = $('<div class="col"></div>');

            cardHolder.append(newCol);

            let badgeString = `<div class='badge bg-primary type'>${v.type}</div>`

            let d = Date.parse(v.date).toString("MMMM dS, yyyy")

            let iconString = buildIconString(v);

            let newCardHTML = `<div class="card h-100"><div class="card-body">${badgeString}<h3 class="card-title">${v.name}</h3><p class="vote-date">${d}</p><p class="vote-outcome">Outcome: ${v.outcome}</p> ${buildVoteVizBox(v)}</div><div class="card-footer">${iconString}</div></div>`;

            let newCard = $(newCardHTML);

            newCard.data("scorecard", v);

            newCol.append(newCard);
        }

        manageLoading();

    });

    $("vote-list-outer").append("<div class='container-40 container mt-4'><p>Visit the <i>settings</i> menu to adjust the number of years that are displayed.</p></div>");

}

function addBootstrapScripts() {

    const myModalEl = document.getElementById('settings-modal');
    myModalEl.addEventListener('hidden.bs.modal', event => {

        let newNumYears = $("input[name='btnradio']:checked").val();

        if (newNumYears != settings.numYears) {
            settings.numYears = newNumYears;
            reBoot();
        }

    })

    $("#tracker-frame-2").on("click", ".card", function(){

       loadSidePanel(this);
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

function loadSidePanel(cardThatTriggered) {

    let bsOffcanvas = new bootstrap.Offcanvas('#voteSidePanel');

    let data = $(cardThatTriggered).data("scorecard");
    let d = $(cardThatTriggered).find(".vote-date").html();

    let t = `${data.name}<div class="vote-date">${d}</div>`

    let body = $(`<div></div>`);

    let voteVizCloneFor = $(cardThatTriggered).find(".vote-viz-for").clone();
    let voteVizCloneAgainst = $(cardThatTriggered).find(".vote-viz-against").clone();

    body.append($(cardThatTriggered).find(".vote-outcome").clone());

    body.append(voteVizCloneFor);
    body.append(voteVizCloneAgainst);
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

    $("#voteSidePanel").find(".offcanvas-title").html(t);
    $("#voteSidePanel").find(".offcanvas-body").html(body);

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

    let rightColumnText = `<p>${data.name}${termText}</p>`;

    $('#councilBottomPanel').find("#bs-oc-left-col").html(profileClone);
    $('#councilBottomPanel').find("#bs-oc-right-col").html(rightColumnText);

    bsOffcanvas.show();

}