<sialia>
  <header data={ opts.data } sections={ opts.sections } documents={ opts.documents }/>
  <div class="container-fluid sialia-body" if={ opts.data }>
    <div class="row">
      <div class="col-lg-4 col-sm-4">
        <demographics demographics={ opts.data.demographics }/>
      </div>
      <div class="col-lg-9 col-sm-8" id="right" if={ showPreferences && !showNonXml}>
        <preferences sections={ opts.sections } pref={ opts.pref } />
      </div>
      <div class="col-lg-9 col-sm-8" id="right" if={ !showPreferences && !showNonXml }>
        <ccda-section each={ section in opts.sections } current={ section } parent={ parent }/>
      </div>
        <div class="col-lg-9 col-sm-8" id="right" if={ showNonXml }>
            <nonxml nonxml={ data.document.type.nonXmlBody } />
        </div>
    </div>
  </div>

  <script>
    var self = this;
    
    this.on('update', function() {
      // ML - Not showing preferences when the body type is nonXmL.  We just want to show
      // a link to the document.
      self.showNonXml = self.data && self.data.document.type.nonXmlBody.type;
    });
  </script>
</sialia>
