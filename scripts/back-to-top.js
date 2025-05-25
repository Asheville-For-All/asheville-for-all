//Make the button:
var mybutton = document.createElement("button");
mybutton.innerHTML = '<div id="chevron" style="align-items:center;align-content:center;justify-content:center;"><svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" fill="#ABB2B9" class="bi bi-chevron-up" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708z"/></svg></div>'
document.body.appendChild(mybutton);
mybutton.setAttribute('id', 'back-to-top');
mybutton.setAttribute('onclick', 'topFunction()');
mybutton.setAttribute('title', 'back to top');
mybutton.setAttribute('display', 'flex');

window.addEventListener('scroll', scrollFunction);

function scrollFunction() {
  if (document.body.scrollTop > 400 || document.documentElement.scrollTop > 400) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}

scrollFunction()

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}