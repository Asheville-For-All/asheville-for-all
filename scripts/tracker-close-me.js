function closeMe(triggeringElem){
  let dialg;
  if($(triggeringElem).is("dialog")){
    dialg = $(triggeringElem);
  }else{
    dialg = $(triggeringElem).closest('dialog');
  }
  if (dialg.get(0).requestClose){
    console.log(dialg.attr('id'));
    console.log("request close function is present.");
    dialg.get(0).requestClose();
  }
  else{
    console.log(dialg.attr('id'));
    console.log("no request close function found.");
    dialg.get(0).close();
  }
}