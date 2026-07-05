import * as Helper from "./helpers.js";

export class LeftPaneUIHelper{

    constructor(isDebugMode=false){
        this.isDebugMode = isDebugMode;
    }

    showPane(elemThatTriggered){

        let h2h = false;
        
        let jqETT = $(elemThatTriggered);

        let data = jqETT.data("scorecard");

        if (jqETT.hasClass('h2h-row')){
            h2h = true;
        }

        let jqHeader = $('#left-pane-header');
        jqHeader.html("");
        let jqBody = $('#left-pane-body');
        jqBody.html("");

        this.#buildHeader(jqHeader, data);
        this.#buildBody(jqBody, data, elemThatTriggered, h2h);

        $('.detail-active').removeClass('detail-active').addClass('detail-inactive');

        jqETT.removeClass('detail-inactive');

        jqETT.addClass('detail-active');

        $('#left-pane')[0].showModal();

        $('#left-pane-body').scrollTop(0);

    }

    #buildHeader(emptyJQHeader, scorecard){

        let closeBox = $("<button class='btn btn-close float-end' onclick='closeMe(this);'></button>");

        emptyJQHeader.append(closeBox);

        let badge = $(`<div class='badge bg-primary type'>${scorecard.type}</div>`);

        let infoBar = $("<div class='sidePaneInfoBar'></div>");

        emptyJQHeader.append(infoBar);

        infoBar.append(badge).append(Helper.getGaugeString(scorecard.pro_housing_scale__proposal, scorecard.pro_housing_scale__motion));

        emptyJQHeader.append("<h2 class='mt-2'>" + scorecard.name + "</h2>");
    }

    #buildBody(emptyJQBody, scorecard, elemThatTriggered, h2h){

        let date = $(`<p class='vote-date'>${Date.parse(scorecard.date).toString("MMMM dS, yyyy")}</p>`);
        let outcome = $(`<p>Outcome: ${scorecard.outcome}</p>`);

        emptyJQBody.append(date).append(outcome);

        let voteBreakdown = this.#buildVoteBreakdown(scorecard, scoreMaps, AshevilleCouncilRoster);

        let linkList = this.#buildLinks(scorecard);

        let lateralNavs = this.#buildLateralNavs(scorecard, elemThatTriggered, h2h);

        emptyJQBody.append(voteBreakdown).append(linkList).append(lateralNavs);

    }

    #buildVoteBreakdown(data){

        let self = this;

        const map = ["for", "against", "recused", "abstain", "absent"];

        let outer = $("<div id='voteItemRecordDetailOuter' class='container container-40'></div>");

        const headingMap = ["vote-viz-badge-red", "vote-viz-badge-orange", "vote-viz-badge-neutral", "vote-viz-badge-yellow", "vote-viz-badge-green"];

        if (self.isDebugMode){
            outer.append(`<p>pro_housing_scale__proposal: ${data.pro_housing_scale__proposal}<br/>pro_housing_scale__motion: ${data.pro_housing_scale__motion}</p>`)
        }

        $.each(map, function(i, v){

            if (v in data && data.for.length > 0){

                let points = data.pro_housing_scale__motion * scoreMaps[data.outcome][v];

                let style = headingMap[parseInt(points * 2 + 2)];

                let labelTxt = v.toUpperCase();

                if(data.outcome == "Denied"){
                    if (v == "for" || v == "against"){
                        labelTxt += " (denial)";
                    }
                }

                outer.append(`<div class='row header-row'><div class="col ps-0 mb-3"><div class="badge rounded-pill ${style} ms-0">${labelTxt}:</div></div></div>`);

                $.each(data[v], function(j,w){

                    let debugStr = "";
                    if(self.isDebugMode){
                        debugStr = " " + String(data.councilorStats[w]);
                    }

                    outer.append(`<div class='row mb-1' style='flex-wrap:nowrap;'><div class="col d-flex align-items-center"><div style="height:2.5rem;max-width:2.5rem;background-size: cover;background-position: 50% 50%;aspect-ratio: 1 / 1; border-radius:0.25rem;background-image: url('${Helper.retrieveCouncilorFromName(w, AshevilleCouncilRoster).pic}')"></div><div class="ms-2">${w}${debugStr}</div></div>`);

                });

        }

        });

        if(this.isDebugMode){
            outer.append("<p>Points at stake (given the motion): " + (data.pointsAtStake * Math.abs(data.pro_housing_scale__motion)) + "</p><p>Points at stake: " + data.pointsAtStake + "</p>");
        }

        return outer;
    }

    #buildLinks(scorecard){

        let s = "<div class='container container-40 vote-link-list-container mt-4'>";

        let govImg = "img/dome-building.svg";
        let afaImg = "img/tracker-imgs/building-green-clay.svg";
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

        s += "</div>";

        return $(s);

    }

    #buildLateralNavs(data, elemThatTriggered, isH2H=false){

        let prevNavCard = null;
        let nextNavCard = null;

        if(isH2H){
            let prevCard = $(elemThatTriggered).prev();
            let nextCard = $(elemThatTriggered).next();
            if(prevCard.length && prevCard.hasClass('h2h-row')){
                prevNavCard = prevCard;
            }
            if(nextCard.length && nextCard.hasClass('h2h-row')){
                nextNavCard = nextCard;
            }
        }
        else{
            let prevCard = $(elemThatTriggered).parent().prev().children();
            let nextCard = $(elemThatTriggered).parent().next().children();
            if(prevCard.length && prevCard.hasClass('card')){
                prevNavCard = prevCard;
            }
            if((nextCard).length && nextCard.hasClass('card')){
                nextNavCard = nextCard;
            }
        }

        let lateralNavsOuter = $("<div class='side-panel-lateral-navs mt-5'></div>");

        if(prevNavCard){
            let innerDiv = $(`<div class="mb-2"></div>`);

            let link = $(`<a href="javascript:void(0)">←&nbsp;${prevNavCard.data("scorecard").name} / ${Date.parse(prevNavCard.data("scorecard").date).toString("MMMM dS, yyyy")}</a>`);

            innerDiv.append(link);
            lateralNavsOuter.append(innerDiv);

            link.on("click", prevNavCard[0], function(e){

              $('#left-pane')[0].close();
              leftPaneUIHelper.showPane(e.data);
            });
        }
        if(nextNavCard){
            let innerDiv = $(`<div class="mb-2"></div>`);

            let link = $(`<a href="javascript:void(0)">${nextNavCard.data("scorecard").name} / ${Date.parse(nextNavCard.data("scorecard").date).toString("MMMM dS, yyyy")}&nbsp;→</a>`);

            innerDiv.append(link);

            lateralNavsOuter.append(innerDiv);

            link.on("click", nextNavCard[0], function(e){

              $('#left-pane')[0].close();
              leftPaneUIHelper.showPane(e.data);
            });
        }

        return lateralNavsOuter;

    }

    #loadHanders(){
        //TK I'm still not sure if I want to load ALL the handlers here? Or do it elsewhere? Have another module/class that handles all the handlers??
    }
}