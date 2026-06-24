export function isDateRecent(cutoffInYears, dateString){
  let diff = new Date() - new Date(dateString);
  let diffInYears = diff / (365.25 * 24 * 60 * 60 * 1000);
  if (diffInYears > cutoffInYears){
    return false;
  }
  else{
    return true;
  }
}

/**
 * Given an object and a key, this function will check if the key is valid, if the key points to an array, and if that array has at least one value in it.
 * @param {object} objct - the parent object, which you already know exists.
 * @param {string} key - the attribute of the parent object, which may or may not exist but is expected to point to an array if it exists.
 */
export function isKeyAndArr(objct, key){

    if(key in objct && Array.isArray(objct[key]) && objct[key].length > 0){
        return true;
    }
    else{
        return false;
    }
}

export function scaleBetween(unscaledNum, minAllowed, maxAllowed, min, max) {
    return (maxAllowed - minAllowed) * (unscaledNum - min) / (max - min) + minAllowed;
}

export function getGaugeString(proposalScale, motionScale){

    let gaugeClasses = ["gauge-low", "gauge-medium-low", "gauge-medium", "gauge-medium-high", "gauge-high"];

    let proposal_i = parseInt((proposalScale + 1) * 2);
    let motion_i = parseInt((motionScale + 1) * 2);

    return `<button class="btn gauge-icon-outer" commandfor="gauge-info-dialog" command="show-modal"><div class='gauge-icon ${gaugeClasses[proposal_i]}' style="mask: url(img/tracker-imgs/file-lines-solid-full.svg);"></div><div class='gauge-icon ${gaugeClasses[motion_i]}' style="mask: url(img/tracker-imgs/gavel-solid-full.svg);"></div></button>`;
}

export function retrieveCouncilorFromName(name, AshevilleCouncilRoster){

    return AshevilleCouncilRoster.find(function(x){return name === x.name;});
}