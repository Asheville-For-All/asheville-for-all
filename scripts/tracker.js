$(function() {

    //*******FUNCTION EXECUTION *************//

    setUpPlaceHolders();

    setUpCouncilors();

    assignScores();

    populateCouncilContainer();

    populateVoteItemsContainer();

});

// *********GLOBAL VARIABLES **********************//

//multipliers, scoreCardCollection, AshevilleCouncilRoster are implicitly imported

gradeColors = [
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

function setUpPlaceHolders(){

    $("#vote-list-outer").append("<p>Loading . . . </p>");


    $("#council-list-outer").append("<p>Loading . . . </p>")
}

function setUpCouncilors(){

    $.each(AshevilleCouncilRoster, function(index, councilor){
        councilor.points = 0;
        councilor.totalEligiblePoints = 0;
        councilor.totalVoteInstancesInTerm = 0;
    });
}

function retrieveCouncilorFromName(name){

    return AshevilleCouncilRoster.find(function(x){return name === x.name;});
}

function assignScores(){

    $.each(scoreCardCollection, function(i, scorecard){

        assignScoresFromSingleScorecard(scorecard);
        
    });

    maxGrade = 0.0;
    minGrade = 1.0;

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

        roundedGradeInt = Math.round(v.scaledGrade * 10);
        v.color = gradeColors[roundedGradeInt];
    });

    AshevilleCouncilRoster.sort((a, b) => b.grade - a.grade || b.totalEligiblePoints - a.totalEligiblePoints)

}

function assignScoresFromSingleScorecard(scorecard){

    pointsAtStake = 1;

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

        c = retrieveCouncilorFromName(v)

        if (c != undefined){
            c.points += pointsAtStake;
            c.totalEligiblePoints += pointsAtStake;
            c.totalVoteInstancesInTerm += 1;
        }
    });

    if ("against" in scorecard){

        $.each(scorecard["against"], function(i, v){

            c = retrieveCouncilorFromName(v)

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

            c = retrieveCouncilorFromName(v)

            c.points += 0;
            c.totalEligiblePoints += 0;
            c.totalVoteInstancesInTerm += 1;
            }
        });
    }

    //TODO continue iterating with abstain,recuse  etc...

}

function populateCouncilContainer(){

    $("#council-list-outer").html("");

    preCardText = `<div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-2">`
    postCardText = `</div>`

    newHTML = preCardText

    $.each(AshevilleCouncilRoster, function(i, v){

        if("past" in v == false || v.past == false){

            colorStr = "rgb(" + v.color[0] + ", " + v.color[1] + ", " + v.color[2] + ")"

            gradientStop1 = Math.min(Math.round(v.grade * 360), 355)
            gradientStop2 = Math.min(gradientStop1 + 5, 359)

            conicGradientStr = `${colorStr} 0deg, ${colorStr} ${gradientStop1}deg, snow ${gradientStop2}deg, snow 360deg`

            profilePicAndBorder = `<div class="profile-pic-outer" style="background-image: conic-gradient(${conicGradientStr});"><div class="profile-pic-inner" style="background-image:url('${v.pic}')"></div></div>`

            cardContent = `<div class="card-body"><h3 class="card-title">${v.name}</h3>${profilePicAndBorder}`

            newHTML += `<div class="col"><div class="card h-100">${cardContent}</div></div></div>`;
        }

    });

    newHTML += postCardText

    $("#council-list-outer").append(newHTML);

}

function buildIconString(scorecard){

    iconStr = "<p class='vote-icons'>"

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

    forStr = "<div class='vote-viz-label'>FOR:&nbsp;</div>"

    if ("for" in scorecard){
        
        $.each(scorecard.for, function(i, v){

            forStr += `<div class="mini-pic" style="background-image: url('${retrieveCouncilorFromName(v).pic}')"></div>`
        });
    }

    againstStr = `<div class='vote-viz-label'>AGAINST:&nbsp;</div>`

    if ("against" in scorecard){
        $.each(scorecard.against, function(i, v){

            againstStr += `<div class="mini-pic" style="background-image: url('${retrieveCouncilorFromName(v).pic}')"></div>`
        });

    }

    newStr = `<div class="vote-viz vote-viz-for">${forStr}</div><div class="vote-viz vote-viz-against">${againstStr}</div>` //TODO finish this

    return newStr
}

function populateVoteItemsContainer(){

    $("#vote-list-outer").html("");

    preCardText = `<div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-2">`
    postCardText = `</div>`

    newHTML = preCardText

    $.each(scoreCardCollection, function(i, v){

        badgeString = `<div class='badge bg-primary type'>${v.type}</div>`

        d = Date.parse(v.date).toString("MMMM dS, yyyy")

        iconString = buildIconString(v);

        newHTML += `<div class="col"><div class="card h-100"><div class="card-body">${badgeString}<h3 class="card-title">${v.name}</h3><p class="vote-date">${d}</p><p class="vote-outcome">Outcome: ${v.outcome}</p> ${buildVoteVizBox(v)}</div><div class="card-footer">${iconString}</div></div></div>`;


    });

    newHTML = newHTML + postCardText
    $("#vote-list-outer").html(newHTML);

}