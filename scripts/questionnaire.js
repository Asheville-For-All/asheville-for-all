window.onload = function() {

    checkParams();
    buildFilterButton();
    populateModal();
};

function checkParams(){

    const urlParams = new URLSearchParams(window.location.search);
    const myParam = urlParams.get('name');

    if (myParam === null || myParam == ""){
        return;
    }else{
        filterResponses(myParam)
    }

}

function filterResponses(myParam){

    const responseDivs = document.querySelectorAll("div .response");

    responseDivs.forEach((item) => {

        if (myParam == item.dataset.name){
            item.classList.remove('d-none');
        }else
        {
            item.classList.add('d-none');
        }
    });

    showDisclaimer(myParam);

}

function showDisclaimer(name){

    var url = window.location.href.split('?')[0];

    var filterInfo = document.getElementById("filter-info");

    filterInfo.innerHTML = "<p>Now showing responses for " + name + ". <a href='" + url + "'>Click here to reset the page.</a></p>"
}

function buildFilterButton(){
    var mybutton = document.createElement("button");
    mybutton.innerHTML = '<div id="filter-icon" style="align-items:center;align-content:center;justify-content:center;"><svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" fill="#ABB2B9" class="bi bi-filter" viewBox="0 0 16 16"><path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5"/></svg></div>'
    document.body.appendChild(mybutton);
    mybutton.setAttribute('id', 'filter-button');
    mybutton.setAttribute('title', 'filter');
    mybutton.setAttribute('display', 'flex');
    mybutton.setAttribute('data-bs-toggle', 'modal');
    mybutton.setAttribute('data-bs-target', '#filter-modal');
}

function getNames(){
    var s = new Set()
    const responseDivs = document.querySelectorAll("div .response");

    responseDivs.forEach((d) => {
        s.add(d.dataset.name)
    });
    return s
}

function setFilter(){
    console.log("button clicked.");
    var url = window.location.href.split('?')[0];
    const v = document.getElementById('filter-select').value;
    if (v=="all"){
        window.location.href = url;
    }else{
        window.location.href = url + "?name=" + encodeURI(v);
    }
}

function populateModal(){
    b = document.getElementById("filter-modal-body");
    names = getNames();
    s = document.getElementById("filter-select");
    for (const item of names) {
      o = document.createElement('option');
      o.innerHTML = item;
      o.setAttribute('val', item);
      s.append(o);

    //Activate filter-go-button
    var btn = document.getElementById("filter-go-button");
    btn.setAttribute('onclick', 'setFilter()');

    }
}