function closeMe(triggeringElem){
  let dialg;
  if($(triggeringElem).is("dialog")){
    dialg = $(triggeringElem);
  }else{
    dialg = $(triggeringElem).closest('dialog');
  }
  if (dialg.get(0).requestClose){
    dialg.get(0).requestClose();
  }
  else{
    dialg.get(0).close();
  }
}