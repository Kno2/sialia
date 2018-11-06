import * as _ from 'lodash';
import { DocumentsService } from '../services';
import { PreferencesService } from '../services';

<header>
  <nav class="navbar navbar-default navbar-fixed-top">
    <div class="container-fluid">
      <div class="navbar-header">
        <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar-collapse-1" aria-expanded="false">
          <span class="sr-only">Toggle navigation</span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
        <span class="navbar-brand" if={ opts.data }>
          { opts.data.document.title } -
          <name name={ opts.data.demographics.name } class="text-muted"/>
        </span>
        <span class="navbar-brand" if={ !opts.data }>
          Loading...
        </span>
      </div>

      <div class="collapse navbar-collapse" id="navbar-collapse-1">

        <!-- <form class="navbar-form navbar-right" role="search" id="search">
          <div class="input-group">
            <input type="text" class="form-control" placeholder="Search">
            <span class="input-group-btn">
              <button type="submit" class="btn btn-default" aria-label="Search">
                <i class="fa fa-search" aria-hidden="true"></i>
              </button>
            </span>
          </div>
        </form> -->

        <ul class="nav navbar-nav navbar-right" id="jump-nav">
          <li if={ opts.documents && opts.documents.length === 1 && opts.documents[0].name }>
            <span class="navbar-text">
              { opts.documents[0].name }
            </span>
          </li>
          <li class="dropdown" if={ opts.documents && opts.documents.length > 1 }>
            <a href="#" class="dropdown-toggle" id="jump" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
              Documents
              <span class="caret"></span>
            </a>
            <ul class="dropdown-menu" aria-labelledby="jump">
              <li each={ opts.documents } class={ active: active }>
                <a href="#" onclick={ load }>
                  { name }
                </a>
              </li>
            </ul>
          </li>
          <li class="dropdown" if={ opts.sections && opts.sections.length }>
            <a href="#" class="dropdown-toggle" id="jump" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
              Jump to
              <span class="caret"></span>
            </a>
            <ul class="dropdown-menu" aria-labelledby="jump">
              <li>
                <a href="#">Top</a>
              </li>
              <li role="separator" class="divider"></li>
              <li each={ opts.sections }>
                <a href="#{ key }">
                  <i class="fa fa-{ icon }" aria-hidden="true"></i>
                  { display }
                </a>
              </li>
            </ul>
          </li>
          <li class={ active: this.parent.showPreferences } if={ opts.sections }>
            <a href="#" onclick={ showPreferences }>
              <i class="fa fa-lg fa-cog"></i>
            </a>
          </li>
        </ul>

      </div>
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
