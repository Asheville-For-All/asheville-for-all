let content = `
<div class="modal" id="gaugeModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-body">
      <h2>What does this icon mean?</h2>
        <div class="clearfix">
          <img class="me-3 mb-3 gauge-high float-start" style="height:2rem;" src="img/tracker-imgs/gauge-high.svg"/><p>We think that this agenda item is in support of or has the potential to support pro-housing goals.</p>
        </div>
        <div class="clearfix mt-3">
          <img class="gauge-low float-start me-3 mb-3" style="height:2rem;" src="img/tracker-imgs/gauge-low.svg"/><p>We think that this agenda item is in opposition or in conflict with pro-housing goals or policies.</p>
        </div>
        <div class="clearfix">
          <img class="gauge-medium me-3 mb-3 float-start" style="height:2rem;" src="img/tracker-imgs/gauge-medium.svg"/><p>This may signal that we are or were ambivalent, confused, or on-the-fence about the agenda item; that there were complicating details associated with the item; or that we did not have enough information or time to make a call.</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>
`

document.body.insertAdjacentHTML('beforeend', content);

