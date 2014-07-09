'use strict';

var _ = require('underscore');

var utils = require('./utils');

var Formatic = function () {

  var formatic;

  formatic = function () {
    return formatic.form();
  };

  formatic.options = {};

  formatic.config = function (options) {
    _.extend(formatic.options, options);
  };

  formatic.plugin = function (plugin) {
    if (_.isString(plugin)) {
      plugin = Formatic.plugins[plugin];
    }
    plugin(formatic);
  };

  var Form = function () {
    this.init();
  };

  formatic.form = function () {
    return new Form();
  };

  Form.prototype = formatic.form;

  utils.hookable(formatic);
  utils.hookable(Form.prototype);

  Form.prototype.hook('init', function () {

  });

  _.each(arguments, function (plugin) {
    formatic.plugin(plugin);
  });

  return formatic;
};

module.exports = Formatic;

Formatic.plugins = {
  coreData: require('./plugins/core-data'),
  coreType: require('./plugins/core-type'),
  coreView: require('./plugins/core-view'),
  core: require('./plugins/core'),
  terse: require('./plugins/terse'),
  react: require('./plugins/react'),
  zapier: require('./plugins/zapier'),
  reactViewer: require('./plugins/react-viewer')
};

Formatic.types = {
  code: require('./types/code'),
  form: require('./types/form'),
  select: require('./types/select'),
  text: require('./types/text'),
  textarea: require('./types/text'),

  if: require('./types/if'),
  get: require('./types/get'),
  eq: require('./types/eq')
};

Formatic.views = {
  react: {
    code: require('./views/react/code'),
    form: require('./views/react/form'),
    select: require('./views/react/select'),
    text: require('./views/react/text'),
    textarea: require('./views/react/textarea')
  }
};
