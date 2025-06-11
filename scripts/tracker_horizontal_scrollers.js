export function hideHorizontalScrollers(){

    $('.horiz-scroll-arrow').addClass('d-none');

}
export function setHorizontalScrollers(){

    if($('#tracker-frame-3').hasClass('#d-none')){
        hideHorizontalScrollers();
        return;
    }

    let windowWidth = window.innerWidth;

    let lastProfilePic = $('council-list-outer').find('.profile-pic-outer').last();

    if (lastProfilePic.length === 0){return;}

    let offset = lastProfilePic.offset().left;
    let width = lastProfilePic.width();

    let totalMaxWidth = offset + width;

    //Now I need to get scroll info

    let scrollVal = $('#tracker-frame-3').scrollLeft();

    if (scrollVal < 2){
        $('#horizontal-scroll-arrow-left').addClass('d-none');
    }
    else{
        $('#horizontal-scroll-arrow-left').removeClass('d-none');
    }

    if (scrollVal + windowWidth >= totalMaxWidth - 1){
        $('#horizontal-scroll-arrow-right').addClass('d-none');
    }
    else{
        $('#horizontal-scroll-arrow-right').removeClass('d-none');
    }

}

export function setHorizScrollEventHandlers(){

    //Need to set handlers for the horizontal scroll.

    $('#tracker-frame-3').on("scroll", setHorizontalScrollers);

    //Also need to set for resize window.

    $(window).on( "resize", setHorizontalScrollers);

}