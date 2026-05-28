let content = `
<div class="modal" id="gaugeModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-body">
      <h2>What does this icon mean?</h2>
      <hr/>
        <div class="clearfix">

          <div style="float:left; margin-right:1rem;">
          <div style="mask: url(img/tracker-imgs/file-lines-solid-full.svg);display:inline-block;" class="gauge-low"></div>
          <div style="mask: url(img/tracker-imgs/file-lines-solid-full.svg);display:inline-block;" class="gauge-medium-low"></div>
          <div class="gauge-medium" style="mask: url(img/tracker-imgs/file-lines-solid-full.svg);display:inline-block;"></div>
          <div class="gauge-medium-high" style="mask: url(img/tracker-imgs/file-lines-solid-full.svg);display:inline-block;"></div>
          <div class="gauge-high" style="mask: url(img/tracker-imgs/file-lines-solid-full.svg);display:inline-block;"></div>
          </div>

          <p>The paper icon illustrates Asheville For All's position on <b>the proposed agenda item</b>, at the time of the hearing.</p>
          <p> The color reflects whether the agenda item was generally pro-housing or anti-housing. An intermediate color suggests that there may have been potentially complicating or confusing circumstances involved.</p>
          
      </div>
      <hr/>

      <div class="clearfix">

          <div style="float:left; margin-right:1rem;">
          <div style="mask: url(img/tracker-imgs/gavel-solid-full.svg);display:inline-block;" class="gauge-low"></div><div style="mask: url(img/tracker-imgs/gavel-solid-full.svg);display:inline-block;" class="gauge-medium-low"></div>
          <div class="gauge-medium" style="mask: url(img/tracker-imgs/gavel-solid-full.svg);display:inline-block;"></div><div style="mask: url(img/tracker-imgs/gavel-solid-full.svg);display:inline-block;" class="gauge-medium-high"></div>
          <div class="gauge-high" style="mask: url(img/tracker-imgs/gavel-solid-full.svg);display:inline-block;"></div>
          </div>

          <p>The gavel icon illustrates Asheville For All's assessment of <b>the final decision, or <i>motion</i></b> associated with the agenda item.</p>
          <p> The color reflects whether the outcome was pro-housing or anti-housing. An intermediate color suggests an ambiguous outcome, or that there were complicating circumstances involved.</p>
          
      </div>


      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>
`

document.body.insertAdjacentHTML('beforeend', content);

