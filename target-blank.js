//This script adjusts any links that point outside the host to add "target='_blank" to them.

var links = document.links;

for (var i = 0, linksLength = links.length; i < linksLength; i++) {

    if (links[i].hostname != window.location.hostname) {
        links[i].target = '_blank';
    }
}