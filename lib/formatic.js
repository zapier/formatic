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

  Form.prototype.method('init', function () {

  });

  _.each(arguments, function (plugin) {
    formatic.plugin(plugin);
  });

  return formatic;
};

module.exports = Formatic;

Formatic.plugins = {
  coreData: require('./plugins/core-data'),
  coreMeta: require('./plugins/core-meta'),
  coreType: require('./plugins/core-type'),
  coreView: require('./plugins/core-view'),
  coreValidation: require('./plugins/core-validation'),
  core: require('./plugins/core'),
  terse: require('./plugins/terse'),
  react: require('./plugins/react'),
  zapier: require('./plugins/zapier'),
  reactViewer: require('./plugins/react-viewer'),
  readOnly: require('./plugins/read-only'),
  required: require('./plugins/required')
};

Formatic.types = {
  code: require('./types/code'),
  form: require('./types/form'),
  select: require('./types/select'),
  text: require('./types/text'),
  textarea: require('./types/text'),
  password: require('./types/text'),
  checkbox: require('./types/checkbox'),

  dropdown: require('./types/select'),

  string: require('./types/text'),
  float: require('./types/number'),
  integer: require('./types/number'),
  number: require('./types/number'),

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
    textarea: require('./views/react/textarea'),
    password: require('./views/react/text'),
    checkbox: require('./views/react/checkbox'),
    'boolean-checkbox': require('./views/react/boolean-checkbox'),
    'pretty-textarea': require('./views/react/pretty-textarea'),

    dropdown: require('./views/react/dropdown'),

    float: require('./types/text'),
    integer: require('./types/text'),
    number: require('./types/text')
  }
};
