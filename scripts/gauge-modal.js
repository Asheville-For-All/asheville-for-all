let content = `
<div class="modal" id="gaugeModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-body">
      <h2>What does this icon mean?</h2>
      <hr/>
        <div class="clearfix">

          <div style="float:left; margin-right:1rem;"><img src="img/tracker-imgs/file-lines-solid-full.svg" class="gauge-low"/>
          <img class="gauge-medium" src="img/tracker-imgs/file-lines-solid-full.svg"/>
          <img class="gauge-high" src="img/tracker-imgs/file-lines-solid-full.svg"/></div>

          <p>The paper icon illustrates Asheville For All's position on <b>the proposed agenda item</b>, at the time of the hearing.</p>
          <p> The color reflects whether the agenda item was generally pro-housing, anti-housing, or something that Asheville For All was unable to determine by the time of the hearing.</p>
          
      </div>
      <hr/>

      <div class="clearfix">

          <div style="float:left; margin-right:1rem;"><img class="gauge-low" src="img/tracker-imgs/gavel-solid-full.svg"/>
          <img class="gauge-medium" src="img/tracker-imgs/gavel-solid-full.svg"/>
          <img class="gauge-high" src="img/tracker-imgs/gavel-solid-full.svg"/></div>

          <p>The gavel icon illustrates Asheville For All's assessment of <b>the final decision, or <i>motion</i></b> associated with the agenda item.</p>
          <p> The color reflects whether the outcome was pro-housing, anti-housing, or something more complicated and/or ambiguous.</p>
          
      </div>


      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>
`

document.body.insertAdjacentHTML('beforeend', content);

