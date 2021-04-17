<ccda-section>
  <allergies if={ opts.current.tagName == 'allergies' } section={ opts.current } data={ data } />
  <medications if={ opts.current.tagName == 'medications' } section={ opts.current } data={ data } />
  <generic if={ opts.current.tagName == 'generic' } section={ opts.current } data={ data } />
  
  <script>
    var options = {
      section: opts.current,
      data: opts.parent.opts.data[opts.current.key]
    };

    var self = this;
    Object.assign({}, this.parent, opts.parent);
    this.current = opts.current;
    this.data = self.parent.opts.data[self.current.key];  
    this.on('update', function() {
      self.data = self.parent.opts.data[self.current.key];
    });
  </script>
</ccda-section>
