//import { scoreCardCollection } from "./scorecards.js";

$(function() {

    for (let i=0; i< scoreCardCollection.length; i++){

        s = scoreCardCollection[i].name

        $("#vote-list-outer").append("<p>" + s + "</p>");

    }
  });