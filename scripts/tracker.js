//import { scoreCardCollection } from "./scorecards.js";

$(function() {

    for (let i=0; i< scoreCardCollection.length; i++){

        //TODO do something to test if my scoreCardCollection works!

        s = scoreCardCollection[i].name

        $("#vote-list-outer").append("<p>" + s + "</p>");

    }
  });