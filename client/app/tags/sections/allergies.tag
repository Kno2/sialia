<allergies>
  <panel section={ opts.section } data={ opts.data }>
    <div class="row" if={ opts.data.entries.length }>
      <div each={ opts.data.entries } class="col-sm-4">
        <div class="alert alert-mild clearfix " role="alert">
          <h4>{ allergen.name }</h4>
          <div class="pull-left">{ reaction.name }</div>
          <div class="pull-right">{ severity }</div>
        </div>
      </div>
    </div>
    <empty if={ !opts.dat.entries.length } />
  </panel>
</allergies>
