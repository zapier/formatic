'use strict';

var React = require('react/addons');
var R = React.DOM;
var _ = require('underscore');

var utils = require('./utils');

var defaultConfig = require('./default-config');

var valuePath = function (fields) {
  return fields.map(function (field) {
    return field.key;
  }).filter(function (key) {
    return !_.isUndefined(key);
  });
};

var FormaticControlledClass = React.createClass({

  displayName: 'FormaticControlled',

  onChange: function (newValue, info) {
    if (!this.props.onChange) {
      return;
    }
    var isWrapped = !this.props.field;
    info = _.extend({}, info);
    if (isWrapped) {
      info.fields = info.fields.slice(1);
      info.field = info.fields[0];
    }
    info.path = valuePath(info.fields);
    this.props.onChange(newValue, info);
  },

  onAction: function (info) {
    if (!this.props.onAction) {
      return;
    }
    var isWrapped = !this.props.field;
    info = _.extend({}, info);
    if (isWrapped) {
      info.fields = info.fields.slice(1);
      info.field = info.fields[0];
    }
    info.path = valuePath(info.fields);
    this.props.onAction(info);
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
        type: 'fields',
        plain: true,
        fields: fields
      };
    }

    if (_.isUndefined(value)) {
      throw new Error('You must supply a value to the root Formatic component.');
    }

    return R.div({className: 'formatic'},
      config.createField({config: config, field: field, value: value, onChange: this.onChange, onAction: this.onAction})
    );
  }

});

var FormaticControlled = React.createFactory(FormaticControlledClass);

module.exports = React.createClass({

  statics: {
    createConfig: function () {
      var args = _.toArray(arguments);
      var config = _.extend({}, defaultConfig);

      if (args.length === 0) {
        return config;
      }
      var configs = [config].concat(args);
      return configs.reduce(function (prev, curr) {
        if (_.isFunction(curr)) {
          curr(prev);
          return prev;
        }
        return _.extend(prev, curr);
      });
    },
    plugins: {
      bootstrap: require('./plugins/bootstrap')
    },
    utils: utils
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

  onAction: function (info) {
    if (this.props.onAction) {
      this.props.onAction(info);
    }
    var action = utils.dashToPascal(info.action);
    if (this.props['on' + action]) {
      this.props['on' + action](info);
    }
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
      onChange: this.onChange,
      onAction: this.onAction
    });
  }

});
