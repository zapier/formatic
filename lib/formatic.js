'use strict';

var React = require('react/addons');
//var R = React.DOM;
var _ = require('underscore');

var utils = require('./utils');

var fieldSuffix = '-field';

var defaultConfig = {
  components: {
    'static-object-field': {
      factory: React.createFactory(require('./components/static-object-field'))
    },
    'string-field': {
      factory: React.createFactory(require('./components/string-field'))
    },
    'unknown-field': {
      factory: React.createFactory(require('./components/unknown-field'))
    },
    'copy-field': {
      factory: React.createFactory(require('./components/copy-field'))
    },
    field: {
      factory: React.createFactory(require('./components/field'))
    },
    label: {
      factory: React.createFactory(require('./components/label'))
    },
    help: {
      factory: React.createFactory(require('./components/help'))
    }
  },
  dataTypes: {
    object: {
      default: {}
    }
  },
  types: {
    'static-object': {
      dataType: 'object'
    }
  },
  getDefaultValue: function (type) {
    var config = this;
    if (!config.types[type]) {
      if (config.dataTypes[type]) {
        return config.dataTypes[type].default || '';
      }
      return '';
    }
    var dataType = config.types[type].dataType;
    if (!config.dataTypes[dataType]) {
      return '';
    }
    return config.dataTypes[dataType].default || '';
  },
  getFactory: function (name) {
    var config = this;
    return (config.components[name] && config.components[name].factory) || null;
  },
  createElement: function (name, props, children) {
    var config = this;
    if (!props.config) {
      throw new Error('Must pass config in props for: ' + name);
    }
    var factory = config.getFactory(name);
    if (factory) {
      return factory(props, children);
    }
    var unknownName = 'unknown';
    if (name.substring(name.length - fieldSuffix.length) === '-field') {
      unknownName = 'unknown-field';
    }
    factory = config.getFactory(unknownName);
    if (factory) {
      return factory(props, children);
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

  },
  getFieldChoices: function (field) {

  },
  getFieldLabel: function (field) {
    return field.label;
  },
  getFieldHelpText: function (field) {
    return field.help_text_html || field.help_text || field.helpText || field.helpTextHtml;
  }
};

// Smash one config onto another, best we can.
var mergeConfig = function (destConfig, sourceConfig) {
  // For arrays, concatentate.
  if (_.isArray(sourceConfig) && _.isArray(destConfig)) {
    sourceConfig = utils.deepCopy(sourceConfig);
    return destConfig.push(sourceConfig);
  } else if (_.isObject(sourceConfig) && _.isObject(destConfig)) {
    // For objects, loop through and copy or merge, as necessary.
    _.each(sourceConfig, function (sourceValue, key) {
      var destValue = destConfig[key];
      // If key isn't in destination, or not mergeable, then copy source value.
      if (
        !(key in destConfig) ||
        destConfig[key] === null ||
        !_.isObject(destValue) || !_.isObject(sourceValue) ||
        _.isFunction(destValue) || _.isFunction(sourceValue)
      ) {
        destConfig[key] = utils.deepCopy(sourceValue);
      } else {
        // Merge nested objects or arrays.
        if (_.isArray(destValue) && _.isArray(sourceValue)) {
          return mergeConfig(destValue, sourceValue);
        } else if (!_.isArray(destValue) && !_.isArray(sourceValue)) {
          return mergeConfig(destValue, sourceValue);
        }
      }
    });
  }
  return destConfig;
};

var FormaticControlledClass = React.createClass({

  displayName: 'FormaticControlled',

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
    var config = this.props.config;
    var field = this.props.field;
    var value = this.props.value;

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

    if (_.isUndefined(value)) {
      throw new Error('You must supply a value to the root Formatic component.');
    }

    return config.createField({config: config, field: field, value: value, onChange: this.onChange});
  }

});

var FormaticControlled = React.createFactory(FormaticControlledClass);

module.exports = React.createClass({

  statics: {
    createConfig: function () {
      var args = _.toArray(arguments);
      var config = utils.deepCopy(defaultConfig);

      if (args.length === 0) {
        return config;
      }
      var configs = [config].concat(args);
      return configs.reduce(function (prev, curr) {
        if (_.isFunction(curr)) {
          var result = curr(prev);
          return result || prev;
        }
        return mergeConfig(prev, curr);
      });
    },
    plugins: {
      bootstrap: require('./plugins/bootstrap')
    }
  },

  displayName: 'Formatic',

  getInitialState: function () {
    return {
      isControlled: !_.isUndefined(this.props.value),
      value: _.isUndefined(this.props.value) ? this.props.defaultValue : this.props.value
    };
  },

  componentWillReceiveProps: function (newProps) {
    if (this.state.isControlled) {
      if (!_.isUndefined(newProps.value)) {
        this.setState({
          value: newProps.value
        });
      }
    }
  },

  onChange: function (newValue, info) {
    if (!this.state.isControlled) {
      this.setState({
        value: newValue
      });
    }
    if (!this.props.onChange) {
      return;
    }
    this.props.onChange(newValue, info);
  },

  render: function () {

    var config = this.props.config || defaultConfig;
    var value = this.state.value;

    if (this.state.isControlled) {
      if (!this.props.onChange) {
        console.log('You should supply an onChange handler if you supply a value.');
      }
    }

    return FormaticControlled({
      config: config,
      field: this.props.field,
      fields: this.props.fields,
      value: value,
      onChange: this.onChange
    });
  }

});
