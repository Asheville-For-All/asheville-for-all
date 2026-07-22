import multipliers from '../json/multipliers.json' with { type: 'json' };
import AshevilleCouncilRoster from '../json/AshevilleCouncilRoster.json' with { type: 'json' };
import scoreCardCollection from '../json/scorebox-export.json' with { type: 'json' };

import { ImageLoader } from "./tracker-modules/imageLoader.js";

import * as Helper from "./tracker-modules/helpers.js";

import {LeftPaneUIHelper} from "./tracker-modules/left-pane-ui-helper.js";

//**** VARIABLES *********/

var loadingStartTime = Date.now();

let params = new URLSearchParams(document.location.search);
var debug = false;
if (params.get("debug") == true || params.get("debug") == "true" || params.get("debug") == "y"){debug = true;}

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

    globalThis.leftPaneUIHelper = new LeftPaneUIHelper(debug);

    globalThis.AshevilleCouncilRoster = AshevilleCouncilRoster;

    globalThis.scoreMaps = scoreMaps;

    addEventScripts();

    reBoot();

});


// *********FUNCTION DEFINITIONS****************** //

function reBoot(){

    loadingStartTime = Date.now();
    loadingCount = 0;

    $('council-list-outer').html("");
    $('vote-list-outer').html("");
    $(".show-after-load").addClass("d-none");

    endHighlights();

    $('#tracker-frame-3').addClass('d-none');

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

            setHorizontalScrollGradients();
    }
    else{
        const elapsed = Date.now() - loadingStartTime;

        const progressPercent1 = Math.round(elapsed / 10);

        $("#loading-bar-one").width(progressPercent1.toString() + "%");

        setTimeout(function(){readyToShow();}, 1000/30);
    }

}

function manageLoading(isDone = false){

    if(loadingTotalCount > loadingCount){
        loadingCount += 1;
    }

    const elapsed = Date.now() - loadingStartTime;

    const progressPercent1 = Math.round(elapsed / 10);

    $("#loading-bar-one").width(progressPercent1.toString() + "%");

    const progressPercent2 = Math.round( 100 * (loadingCount / loadingTotalCount));

    $("#loading-bar-two").width([progressPercent2.toString() + "%"]);
}

function setUpPlaceHolders(){

    $("#loading-info").removeClass("d-none");

    const loadingString = `<div class="mt-3"><p><span class="spinner-border spinner-border-sm" aria-hidden="true"></span> Loading</p><div class="progress mb-3" role="progressbar">
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
        councilor.showMe = false;

        manageLoading();
    });
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

                let c = Helper.retrieveCouncilorFromName(x, AshevilleCouncilRoster);

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

    let current = false;
    const now = new Date();

    $.each(councilorData.terms, function(i, v){

        const start = new Date(v.start);
        const end = new Date(v.end);

        if (now > start && now < end){
            current = true;
            return true;
        }
    });

    return current;

}

function checkIfRelevantCouncilor(councilorData){
    //Just like the checkIfCurrentCouncilor function, but this one will return true if councilor served at all during the selected duration, even if not presently serving.

    let relevant = false;

    const now = new Date();
    const durationStartDate = now.add(-parseInt(settings.numYears)).years();

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

            v.showMe = true;

            const profilePic = addCouncilorProfile(v);

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

            v.showMe = true;

            let profilePic = addCouncilorProfile(v);

            let clockBadge = $("<img src='img/tracker-imgs/clock-rotate-left-solid.svg' class='clock-badge'></img>");

            profilePic.append(clockBadge);

            if(v.notEnoughData){
                let asteriskBadge = $("<img src='img/tracker-imgs/asterisk.svg' class='asterisk-badge'></img>");
                profilePic.append(asteriskBadge);
            }

        });
    }

    setHorizontalScrollGradients();

}

function addCouncilorProfile(councilorData){

    const v = councilorData;

    if(v.notEnoughData == false){

        const colorStr = "rgb(" + v.color[0] + ", " + v.color[1] + ", " + v.color[2] + ")"

        const gradientStop1 = Math.min(Math.round(v.adjustedGrade * 360), 355)
        const gradientStop2 = Math.min(gradientStop1 + 5, 359)

        const conicGradientStr = `${colorStr} 0deg, ${colorStr} ${gradientStop1}deg, snow ${gradientStop2}deg, snow 360deg`

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
        iconStr += `<img class="vote-icon-afalink" src="img/tracker-imgs/building-green-clay.svg"/>`;
    }
    if(Helper.isKeyAndArr(scorecard, "govLinks")){
        iconStr += `<img class="vote-icon-govt" src="img/dome-building.svg"/>`;
    }
    iconStr += `</p>`;

    return iconStr;
}

function buildVoteVizBox(scorecard){

    const outcomeMap = scoreMaps[scorecard.outcome];

    let newString = "";

    const colorList = ["vote-viz-red", "vote-viz-orange", "vote-viz-neutral", "vote-viz-yellow", "vote-viz-green"]

    $.each(outcomeMap, function(k, v){

        if(k == "for" || k == "against"){

            if (k in scorecard){

                let labelTxt = k.toUpperCase();

                if (scorecard.outcome == "Denied"){
                    labelTxt = k.toUpperCase() + " (denial)";
                }

                let box = `
                <div class="vote-viz ${colorList[parseInt(outcomeMap[k] * scorecard.pro_housing_scale__motion * 2 + 2)]}">
                    <div class="vote-viz-label">${labelTxt}:&nbsp;</div>`

                $.each(scorecard[k], function(i, v){

                    box += `<div class="mini-pic" style="background-image: url('${Helper.retrieveCouncilorFromName(v, AshevilleCouncilRoster).pic}')"></div>`;
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

        v.index = i;
        v.showMeH2H = false;

        if (Helper.isDateRecent(settings.numYears, v.date)){

            v.showMe = true;

            let newCol = $('<div class="col"></div>');

            cardHolder.append(newCol);

            let categoryBadge = $(`<div class='badge bg-primary type'>${v.type}</div>`);

            let gauges = $(Helper.getGaugeString(v.pro_housing_scale__proposal, v.pro_housing_scale__motion));

            let infoBar = $("<div class='info-bar'></div>").append(categoryBadge).append(gauges);

            let d = Date.parse(v.date).toString("MMMM dS, yyyy");

            const iconString = buildIconString(v);

            let badProposal = "";
            if (v.pro_housing_scale__proposal == -1){
                badProposal = " bad-proposal"
            }

            let newCard = $(`<div class="card h-100"></div`);
            let newCardInner = $(`<div class="card-body"></div>`);

            newCard.append(newCardInner);

            newCardInner.append(infoBar);

            newCardInner.append(`<h3 class="card-title ${badProposal}">${v.name}</h3><p class="vote-date">${d}</p><p class="vote-outcome">Outcome: ${v.outcome}</p> ${buildVoteVizBox(v)}</div>`);

            newCard.append(`<div class="card-footer">${iconString}</div>`);

            newCard.data("scorecard", v);

            newCol.append(newCard);
        }

        else{
            v.showMe = false;
        }

        manageLoading();

    });

    $("vote-list-outer").append("<div class='container-40 container mt-4'><p><a id='link-to-settings-menu' href='javascript:void(0)'>Visit the <i>settings</i> menu</a> to adjust the number of years that are displayed.</p></div>");
    $('#link-to-settings-menu').on("click", function(){openSettings()});

}

function addEventScripts() {

    $('#h2h-title-button').on("click", function(){
        populateH2hSetup("");
    });

    document.getElementById("info-modal").addEventListener("cancel", (event) => {
        $("#info-modal .dialog-body").scrollTop(0);
    });

    const myModalEl = document.getElementById('settings-modal');
    myModalEl.addEventListener('close', event => {

        let needReboot = false;

        const newNumYears = $("#past-years-selector").val();

        let newShowCouncilors = $("input[name='showCouncilors']:checked").val();

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

      const t = event.target;

      if(t.classList.contains('gauge-icon') || t.classList.contains('gauge-icon-outer')){

      }
      else{
      leftPaneUIHelper.showPane(this);
      }
    });

    $('#tracker-frame-3').on("click", ".profile-pic-outer", function(){

        loadCouncilorPanelDialog(this);

    });

    $('#councilor-detail-dialog').on("cancel", function(event){
        event.preventDefault();
        $(this).addClass("from-bottom-is-closing");
        
    });
    $('#info-modal').on("cancel", function(event){
        event.preventDefault();
        $(this).addClass("from-center-is-closing");
        
    });
    $('#settings-modal').on("cancel", function(event){
        event.preventDefault();
        $(this).addClass("from-center-is-closing");
        
    });
    $('#left-pane').on("cancel", function(event){
        event.preventDefault();
        $(this).addClass("from-left-is-closing");
        
    });
    $('#h2h-dialog').on("cancel", function(event){
        event.preventDefault();
        $(this).addClass("from-center-is-closing");
        
    });
        $('#h2h-popover-setup').on("cancel", function(event){
        event.preventDefault();
        $(this).addClass("from-center-is-closing");
        
    });

    $('#councilor-detail-dialog').on("animationend", function(){
        if($(this).hasClass("from-bottom-is-closing")){
            $(this).removeClass("from-bottom-is-closing");
            this.close();
        }
    });
    $('#info-modal').on("animationend", function(){
        if($(this).hasClass("from-center-is-closing")){
            $(this).removeClass("from-center-is-closing");
            this.close();
        }
    });
    $('#settings-modal').on("animationend", function(){
        if($(this).hasClass("from-center-is-closing")){
            $(this).removeClass("from-center-is-closing");
            this.close();
        }
    });
    $('#left-pane').on("animationend", function(){
        if($(this).hasClass("from-left-is-closing")){
            $('.detail-active').addClass("detail-inactive").removeClass('detail-active');
            $(this).removeClass("from-left-is-closing");
            this.close();
        }
    });
    $('#h2h-dialog').on("animationend", function(){
        if($(this).hasClass("from-center-is-closing")){
            $(this).removeClass("from-center-is-closing");
            this.close();
        }
    });
    $('#h2h-popover-setup').on("animationend", function(){
        if($(this).hasClass("from-center-is-closing")){
            $(this).removeClass("from-center-is-closing");
            this.close();
        }
    });

    $(window).on( "resize", function(){
        setHorizontalScrollGradients();
    });
    $('council-list-outer').on("scroll", function(){
        setHorizontalScrollGradients();
    });

}

function loadCouncilorPanelDialog(profileThatTriggered) {

    const t = $(profileThatTriggered).attr('title');

    $('#councilor-detail-dialog').find("#councilor-dialog-title").html(t);

    let profileClone = $(profileThatTriggered).clone();

    let data = $(profileThatTriggered).data('councilor');

    let termText = "";

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
        rightColumnText += `<p>Grade (scale from -1 to 1): ${data.grade}</p><p>Scaled grade (relative to others): ${data.scaledGrade}</p>
        <p>Adjusted grade (scale from 0 to 1): ${data.adjustedGrade}</p>`;
    }

    $('#councilor-detail-dialog').find("#council-pane-left-col").html(profileClone);

    $('#councilor-detail-dialog').find("#council-pane-right-col").html(rightColumnText);


    let btnGroup = $(`<div class="btn-group"></div>`);

    let startHighlightButton = $(`<button id="start-highlight-button" class="btn btn-outline-secondary" commandfor="councilor-detail-dialog" command="close">Enter Highlight Mode</button>`);

    let compareButton = $(`<button class='btn btn-outline-secondary' id="compare-button" commandfor="councilor-detail-dialog" command="close">Compare ...</button>`);

    $('#council-pane-button-group-outer').html(btnGroup);
    btnGroup.append(startHighlightButton);
    btnGroup.append(compareButton);

    $('#compare-button').on("click", function(){
        populateH2hSetup(data.name)});

    $('#start-highlight-button').on("click", function(){
        let o = $(profileThatTriggered);
        switchOnHighlights(o)
    });

    document.getElementById('councilor-detail-dialog').showModal();

    $('#councilor-detail-dialog .dialog-body').scrollTop(0);
}

function switchOnHighlights(jqObjProfilePicOuter){

    const councilorName = jqObjProfilePicOuter.data("councilor").name;

    let jqCardList = $("#tracker-frame-2").find('.card');

    jqCardList.each(function(i){

        let currentCard = $(this);

        let cardData = $(this).data("scorecard");

        const outcomeMap = scoreMaps[cardData.outcome];

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

    $('#highlight-mode').find('button').on("click", endHighlights);

}

function endHighlights(){
    let jqCardList = $("#tracker-frame-2").find('.card');
    jqCardList.removeClass('highlight-green');
    jqCardList.removeClass('highlight-red');
    $('#highlight-mode').find('.profile-pic-outer').remove();
    $('#highlight-mode').addClass("d-none");
    $('#tracker-frame-3').removeClass("d-none");
    setHorizontalScrollGradients();
}

function populateHeadToHeadPopup(scorecards, councilors, councilor1, councilor2){

    let profileContainer = $('#h2h-header-profile-container');

    profileContainer.html("");

    let clone1 = $(".profile-pic-outer[title='" + councilor1.name + "']").children().first().clone();
    let clone2 = $(".profile-pic-outer[title='" + councilor2.name + "']").children().first().clone();

    let col1 = $(`<div class='col-3'></div>`);
    let col2 = $(`<div class='col-6'></div>`);
    let col3 = $(`<div class='col-3'></div>`);

    col1.append(clone1);
    col3.append(clone2);

    profileContainer.append(col1).append(col2).append(col3);

    let bodyContainer = $('#h2h-dialog-body-container');
    bodyContainer.html("");

    let h2hRowCount = 0;

    $.each(scorecards, function(i, v){

        v.showMeH2H = false;

        if (v.showMe == true){

            if(councilor1.name in v.councilorStats && councilor2.name in v.councilorStats){

                v.showMeH2H = true;

                let newRow = $('<div class="row align-items-center h2h-row mt-2 mb-2"></div>');

                let col1 = $("<div class='col-2'></div");
                let col2 = $("<div class='col-8'></div");
                let col3 = $("<div class='col-2'></div");

                const iconStr = `<div class='star-gold'></div>`;

                if (v.councilorStats[councilor1.name] >= 1){
                    if (v.councilorStats[councilor1.name] > v.councilorStats[councilor2.name] && isRecusedOrAbsent(v, councilor2) =="false"){
                        col1.append(`<div style="position:relative;width:fit-content;margin-left:auto;margin-right:auto;"><div class='face-4'></div>${iconStr}</div>`);

                    }
                    else{
                        col1.append(`<div style="position:relative;width:fit-content;margin-left:auto;margin-right:auto;"><div class='face-4'></div></div>`);
                    }
                }
                else if (v.councilorStats[councilor1.name] < 1 && v.councilorStats[councilor1.name] > 0){
                    if (v.councilorStats[councilor1.name] > v.councilorStats[councilor2.name] && isRecusedOrAbsent(v, councilor2) == "false"){
                        col1.append(`<div style="position:relative;width:fit-content;margin-left:auto;margin-right:auto;"><div class='face-3'></div>${iconStr}</div>`);
                    }
                    else{
                        col1.append(`<div style="position:relative;width:fit-content;margin-left:auto;margin-right:auto;"><div class='face-3'></div></div>`);
                    }
                }
                else if (v.councilorStats[councilor1.name] == 0){
                    if(isRecusedOrAbsent(v, councilor1) != "false"){
                        col1.append(`<div style="position:relative;width:fit-content;margin-left:auto;margin-right:auto;"><em><small>${isRecusedOrAbsent(v, councilor1)}</small></em></div>`);
                    }
                    else{
                        col1.append(`<div style="position:relative;width:fit-content;margin-left:auto;margin-right:auto;"><div class='face-2'></div></div>`);
                    }                        
                }
                else if (v.councilorStats[councilor1.name] < 0 && v.councilorStats[councilor1.name] > -1){
                    col1.append(`<div style="position:relative;width:fit-content;margin-left:auto;margin-right:auto;"><div class='face-1'></div></div>`);
                }
                else if (v.councilorStats[councilor1.name] <= -1){
                    col1.append(`<div style="position:relative;width:fit-content;margin-left:auto;margin-right:auto;"><div class='face-0'></div></div>`);
                }

                if (v.councilorStats[councilor2.name] >= 1){
                    if (v.councilorStats[councilor2.name] > v.councilorStats[councilor1.name] && isRecusedOrAbsent(v, councilor1) =="false"){
                        col3.append(`<div style="position:relative;width:fit-content;margin-left:auto;margin-right:auto;"><div class='face-4'></div>${iconStr}</div>`);

                    }
                    else{
                        col3.append(`<div style="position:relative;width:fit-content;margin-left:auto;margin-right:auto;"><div class='face-4'></div></div>`);
                    }
                }
                else if (v.councilorStats[councilor2.name] < 1 && v.councilorStats[councilor2.name] > 0){
                    if (v.councilorStats[councilor2.name] > v.councilorStats[councilor1.name] && isRecusedOrAbsent(v, councilor1) == "false"){
                        col3.append(`<div style="position:relative;width:fit-content;margin-left:auto;margin-right:auto;"><div class='face-3'></div>${iconStr}</div>`);
                    }
                    else{
                        col3.append(`<div style="position:relative;width:fit-content;margin-left:auto;margin-right:auto;"><div class='face-3'></div></div>`);
                    }
                }
                else if (v.councilorStats[councilor2.name] == 0){
                    if(isRecusedOrAbsent(v, councilor2) != "false"){
                        col3.append(`<div style="position:relative;width:fit-content;margin-left:auto;margin-right:auto;"><em><small>${isRecusedOrAbsent(v, councilor2)}</small></em></div>`);
                    }
                    else{
                        col3.append(`<div style="position:relative;width:fit-content;margin-left:auto;margin-right:auto;"><div class='face-2'></div></div>`);
                    }                        
                }
                else if (v.councilorStats[councilor2.name] < 0 && v.councilorStats[councilor2.name] > -1){
                    col3.append(`<div style="position:relative;width:fit-content;margin-left:auto;margin-right:auto;"><div class='face-1'></div></div>`);
                }
                else if (v.councilorStats[councilor2.name] <= -1){
                    col3.append(`<div style="position:relative;width:fit-content;margin-left:auto;margin-right:auto;"><div class='face-0'></div></div>`);
                }

                col2.append("<div>" + v.name + "<br/><span class='vote-date'>" + Date.parse(v.date).toString("MMMM dS, yyyy") + "</span></div>");

                newRow.append(col1);
                newRow.append(col2);
                newRow.append(col3);

                bodyContainer.append(newRow);

                h2hRowCount += 1;

                newRow.data("scorecard", v);
            }
        }
    });

    if (h2hRowCount == 0){
        bodyContainer.append(`<div class="alert alert-warning mt-4">
  No relevant council meeting items were found. Try adjusting the settings.
</div>`);
    }
    else{
        let alert = $(`<div class="alert alert-primary mt-4">The above records include relevant council meeting items during which both councilors served on the council. Items may have been omitted based on selected settings. </div>`)
        let link = $(`<a href='javascript:void(0);'>Go to the settings menu.</a>`)
        alert.append(link);
        bodyContainer.append(alert);
        link.on("click", function(){openSettings();});

bodyContainer.prepend(`<div class="alert alert-primary"><div class="star-gold"></div>
  <div style="text-align:left;">A star indicates a relatively pro-housing vote that contrasts with the other councilor's vote on the same item.</div>
</div>`)
    }

    const oldDialog = document.getElementById("h2h-popover-setup");
    const newPpvr = document.getElementById("h2h-dialog");

    oldDialog.close();
    newPpvr.showModal();

    $('#h2h-dialog .dialog-body').scrollTop(0);

    $("#h2h-dialog-body-container").on("click", ".h2h-row", function(){

        leftPaneUIHelper.showPane(this);
    });

}

function populateH2hSetup(councilorName){

    let dialog = $("#h2h-popover-setup");

    dialog.children().remove();

    dialog.append(`<div class="dialog-header">
    <button class="btn btn-close float-end" onclick="closeMe(this);"></button><h2>Comparison Tool</h2></div>`);

    dialog.append("<p>Compare:</p>");

    let chooser = $("<select class='form-select mt-3 mb-3'></select>");

    chooser.append(`<option value='none' selected>Choose a councilor</option>`);

    $.each(AshevilleCouncilRoster, function(i, v){

        if(v.showMe){

            let option = $('<option value="'+ v.name + '">' + v.name + '</option>');
            chooser.append(option);
        }
        
    });

    dialog.append(chooser);

    dialog.append(`<p>with:</p>`);

    let chooser2 = $("<select class='form-select mt-3 mb-3' disabled></select>");

    chooser2.append(`<option value='none' selected>Choose another councilor</option>`);

    dialog.append(chooser2);

    let btnGroup = $('<div class="btn-group" role="group"></div>');

    let button1 = $("<button disabled class='btn btn-outline-secondary'>Show Comparison</button>");
    let button2 = $("<button onclick='closeMe(this);' class='btn btn-outline-secondary'>Cancel</button>");

    btnGroup.append(button1).append(button2);

    dialog.append(btnGroup);

    chooser.on("change", function(){
        if (chooser.val() != "none"){
            chooser2.prop("disabled", false);
            chooser2.html(`<option value='none' selected>Choose another councilor</option>`);
            $.each(AshevilleCouncilRoster, function(i, v){
                if(v.showMe && v.name != chooser.val()){
                    let option = $('<option value="'+ v.name + '">' + v.name + '</option>');
                    chooser2.append(option);
                }
            });
        }
        else{
            chooser2.prop("disabled", true);
            chooser2.val("none");
        }

        if(chooser.val() != "none" && chooser2.val() != "none"){
            button1.prop("disabled", false);
        }
        else{
            button1.prop("disabled", true);
        }
    });

    chooser2.on("change", function(){
        if(chooser.val() != "none" && chooser2.val() != "none"){
            button1.prop("disabled", false);
        }
        else{
            button1.prop("disabled", true);
        }
    });

    if (councilorName != "" && councilorName != null){
        chooser.val(councilorName).change();
    }

    button1.on("click", function(){
        populateHeadToHeadPopup(scoreCardCollection, AshevilleCouncilRoster, Helper.retrieveCouncilorFromName(chooser.val(), AshevilleCouncilRoster), Helper.retrieveCouncilorFromName(chooser2.val(), AshevilleCouncilRoster));
    });

    const dialg = document.getElementById("h2h-popover-setup");

    dialg.showModal();
}

function isRecusedOrAbsent(scorecard, councilorObj){

    let result = "false";

    if ("recused" in scorecard){
        $.each(scorecard.recused, function(i, v){
            if(councilorObj.name == v){
                result = "recused";
            }
        });
    }
    if ("absent" in scorecard){
        $.each(scorecard.absent, function(i, v){
            if(councilorObj.name == v){
                result = "absent";
            }
        });
    }

    return result;

}

function openSettings(){
    let dialogs = $("dialog");
    dialogs.each(function(){
        if ($(this).prop("open")){
            this.close();
        }
    });
    $("#settings-modal")[0].showModal();
}

function setHorizontalScrollGradients(){

    if (document.getElementById('council-list-outer').clientWidth >= document.getElementById('council-list-outer').scrollWidth - 2){
        $('#councilor-scroll-gradient-right').addClass("d-none");
        $('#councilor-scroll-gradient-left').addClass("d-none");
    }
    else{
        if ($('council-list-outer').scrollLeft() < 2){
            $('#councilor-scroll-gradient-left').addClass("d-none");
        }
        else{
            $('#councilor-scroll-gradient-left').removeClass("d-none");
        }
        if ($('council-list-outer').scrollLeft() < document.getElementById('council-list-outer').scrollWidth - document.getElementById('council-list-outer').clientWidth - 2){
            $('#councilor-scroll-gradient-right').removeClass("d-none");
        }
        else{
            $('#councilor-scroll-gradient-right').addClass("d-none");
        }

    }
}