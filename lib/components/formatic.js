'use strict';

var React = require('react/addons');
//var R = React.DOM;
var _ = require('underscore');

var fieldSuffix = '-field';

var defaultConfig = {
  factories: {
    'static-object-field': React.createFactory(require('./static-object-field')),
    'string-field': React.createFactory(require('./string-field')),
    'unknown-field': React.createFactory(require('./unknown-field')),
    field: React.createFactory(require('./field')),
    label: React.createFactory(require('./label')),
    help: React.createFactory(require('./help')),
  },
  createElement: function (name, props, children) {
    var config = props.config;
    if (!config) {
      throw new Error('Must pass config in props for: ' + name);
    }
    if (config.factories[name]) {
      return config.factories[name](props, children);
    }
    var unknownName = 'unknown';
    if (name.substring(name.length - fieldSuffix.length) === '-field') {
      unknownName = 'unknown-field';
    }
    if (config.factories[unknownName]) {
      return config.factories[unknownName](props, children);
    }
    throw new Error('Factory not found for: ' + name);
  },
  createField: function (props) {
    var config = props.config;
    if (!config) {
      throw new Error('Must pass config in props for field: ', JSON.stringify(props.field));
    }
    return config.createElement(props.field.type + '-field', props);
  },
  getClassName: function (componentName, moreClasses) {
      
  }
};

module.exports = React.createClass({

  displayName: 'Formatic',

  onChange: function (newValue, info) {
    if (!this.props.onChange) {
      return;
    }
    var isWrapped = !this.props.field;
    if (isWrapped) {
      info = _.extend({}, info);
      info.fields = info.fields.slice(1);
      info.field = info.fields[0];
    }
    this.props.onChange(newValue, info);
  },

  render: function () {
    var config = this.props.config || defaultConfig;
    var field = this.props.field;
    if (!field) {
      var fields = this.props.fields;
      if (!fields) {
        throw new Error('Must specify field or fields.');
      }
      field = {
        type: 'static-object',
        plain: true,
        fields: fields
      };
    }

    return config.createField({config: config, field: field, onChange: this.onChange});
  }

});
