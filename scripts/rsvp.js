btn = document.getElementById("rsvp-button");
btn.addEventListener("click", async (event) => {

    if (document.getElementById("input-email").validity.valid == false){
        alert("Please check required fields.");
        return;
    }
    if (document.getElementById("input-zip").validity.valid == false){
        alert("Please check required fields.");
        return;
    }

    let myform = document.getElementById("rsvp-form");

    let myformdata = new FormData(document.getElementById("rsvp-form"));
    myformdata.append("eventcode", myform.dataset.eventcode);

    myform.classList.add("d-none");

    const resultalert = document.createElement("div");
    myform.after(resultalert);

    resultalert.classList.add("alert", "alert-primary");
    
    resultalert.innerHTML = "Loading . . .";

    const fetch_url = "https://us-central1-ashevilleforall.cloudfunctions.net/rsvpv2";

    try{
        const response = await fetch(fetch_url, {
            method: "POST",
            body: myformdata
        });

        if (response.ok){
            resultalert.innerHTML = "Thank you for your RSVP!";
        }
        else{
            resultalert.innerHTML = `<p>An error may have occurred:</p><p>${response.status} - ${response.statusText}</p>`;
        }
    }
    catch(e){
        console.error(e);
        resultalert.innerHTML = `<p>An error may have occurred:</p><p>${e.name}: ${e.message}</p>`;
        
    }

});