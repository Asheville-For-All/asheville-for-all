window.onload = function() {
    filterResponses();
};

function filterResponses(){

    const urlParams = new URLSearchParams(window.location.search);
    const myParam = urlParams.get('name');

    if (myParam === null || myParam == ""){
        return;
    }

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

    var questionnaireInfo = document.getElementById("questionnaire-info");

    var disclaimer = document.createElement('p');
    disclaimer.innerHTML = "Now showing responses for " + name + ". <a href='" + url + "'>Click here to reset the page.</a>";

    questionnaireInfo.append(disclaimer);
}