import * as _ from 'lodash';
import { DocumentsService } from '../services';
import { PreferencesService } from '../services';

<header>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
      <span class="navbar-brand" if={ opts.data }>
        { opts.data.document.title } -
        <name name={ opts.data.demographics.name } class="text-muted"/>
      </span>
      <span class="navbar-brand" if={ !opts.data }>
        Loading...
      </span>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarText">
      <ul class="navbar-nav ml-auto">
          <li class="nav-item dropdown" if={ opts.sections && opts.sections.length }>
            <a class="jump-to nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Jump to
            </a>
            <div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
            <a class="dropdown-item" href="#">Top</a>
            <div class="dropdown-divider"></div>
                <a each={ opts.sections } class="dropdown-item" href="#{ key }">
                  <i class="fa fa-{ icon }" aria-hidden="true"></i>
                  { display }
                </a>
            </div>
          </li>
          <li class="{ active: this.parent.showPreferences }" if={ opts.sections }>
            <a class="nav-link dropdown-toggle" href="#" onclick={ showPreferences }>
              <i class="fa fa-lg fa-cog"></i>
            </a>
          </li>
        </ul>
    </div>
  </nav>
  
  <script>
    var self = this;
    self.service = new DocumentsService();

    if (opts.documents && opts.documents.length)
      opts.documents[0].active = true;

    self.load = function(e) {
      e.preventDefault();
      self.toggleActive(e.item);
      self.service.open(e.item).then(function(options) {
        if (!options) return;
        self.parent.showPreferences = !options.pref.isSet;
        self.parent.opts = Object.assign(self.parent.opts, options);
        self.parent.update();
      });
    }

    self.showPreferences = function(e) {
      e.preventDefault();
      self.parent.showPreferences = true;
      self.parent.update();
    }
    
    self.toggleActive = function(document) {
      _.each(self.opts.documents, function(d) {
        d.active = false;
      });
      document.active = true;
    }

    self.on('update', function() {
      var noneSelected = self.opts.documents && self.opts.documents.filter(function(x) { return x.active; }).length === 0;
      if (noneSelected && self.opts.documents.length)
        self.opts.documents[0].active = true;
    });
  </script>
</header>
