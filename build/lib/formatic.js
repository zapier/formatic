// # formatic

/*
The root formatic component.

The root formatic component is actually two components. The main component is
a controlled component where you must pass the value in with each render. This
is actually wrapped in another component which allows you to use formatic as
an uncontrolled component where it retains the state of the value. The wrapper
is what is actually exported.
*/

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _undash = require('./undash');

var _undash2 = _interopRequireDefault(_undash);

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _defaultConfig = require('./default-config');

var _defaultConfig2 = _interopRequireDefault(_defaultConfig);

var _clickOutside = require('./mixins/click-outside.js');

var _clickOutside2 = _interopRequireDefault(_clickOutside);

var _field = require('./mixins/field.js');

var _field2 = _interopRequireDefault(_field);

var _helper = require('./mixins/helper.js');

var _helper2 = _interopRequireDefault(_helper);

var _resize = require('./mixins/resize.js');

var _resize2 = _interopRequireDefault(_resize);

var _scroll = require('./mixins/scroll.js');

var _scroll2 = _interopRequireDefault(_scroll);

var _undoStack = require('./mixins/undo-stack.js');

var _undoStack2 = _interopRequireDefault(_undoStack);

var _bootstrap = require('./plugins/bootstrap');

var _bootstrap2 = _interopRequireDefault(_bootstrap);

var _meta = require('./plugins/meta');

var _meta2 = _interopRequireDefault(_meta);

var _reference = require('./plugins/reference');

var _reference2 = _interopRequireDefault(_reference);

var _elementClasses = require('./plugins/element-classes');

var _elementClasses2 = _interopRequireDefault(_elementClasses);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createConfig = function createConfig() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var plugins = [_defaultConfig2.default].concat(args);

  return plugins.reduce(function (config, plugin) {
    if (_undash2.default.isFunction(plugin)) {
      var extensions = plugin(config);
      if (extensions) {
        _undash2.default.extend(config, extensions);
      }
    } else {
      _undash2.default.extend(config, plugin);
    }

    return config;
  }, {});
};

var defaultConfig = createConfig();

// The main formatic component that renders the form.
var FormaticControlledClass = (0, _createReactClass2.default)({

  displayName: 'FormaticControlled',

  // Respond to any value changes.
  onChange: function onChange(newValue, info) {
    if (!this.props.onChange) {
      return;
    }
    info = _undash2.default.extend({}, info);
    info.path = this.props.config.fieldValuePath(info.field);
    this.props.onChange(newValue, info);
  },

  // Respond to any actions other than value changes. (For example, focus and
  // blur.)
  onAction: function onAction(info) {
    if (!this.props.onAction) {
      return;
    }
    info = _undash2.default.extend({}, info);
    info.path = this.props.config.fieldValuePath(info.field);
    this.props.onAction(info);
  },

  // Render the root component by delegating to the config.
  render: function render() {

    var config = this.props.config;

    return config.renderFormaticComponent(this);
  }
});

var FormaticControlled = _react2.default.createFactory(FormaticControlledClass);

// A wrapper component that is actually exported and can allow formatic to be
// used in an "uncontrolled" manner. (See uncontrolled components in the React
// documentation for an explanation of the difference.)
exports.default = (0, _createReactClass2.default)({

  displayName: 'Formatic',

  // Export some stuff as statics.
  statics: {
    createConfig: createConfig,
    availableMixins: {
      clickOutside: _clickOutside2.default,
      field: _field2.default,
      helper: _helper2.default,
      resize: _resize2.default,
      scroll: _scroll2.default,
      undoStack: _undoStack2.default
    },
    plugins: {
      bootstrap: _bootstrap2.default,
      meta: _meta2.default,
      reference: _reference2.default,
      elementClasses: _elementClasses2.default
    },
    utils: _utils2.default
  },

  // If we got a value, treat this component as controlled. Either way, retain
  // the value in the state.
  getInitialState: function getInitialState() {
    return {
      isControlled: !_undash2.default.isUndefined(this.props.value),
      value: _undash2.default.isUndefined(this.props.value) ? this.props.defaultValue : this.props.value
    };
  },

  // If this is a controlled component, change our state to reflect the new
  // value. For uncontrolled components, ignore any value changes.
  componentWillReceiveProps: function componentWillReceiveProps(newProps) {
    if (this.state.isControlled) {
      if (!_undash2.default.isUndefined(newProps.value)) {
        this.setState({
          value: newProps.value
        });
      }
    }
  },

  // If this is an uncontrolled component, set our state to reflect the new
  // value. Either way, call the onChange callback.
  onChange: function onChange(newValue, info) {
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

  // Any actions should be sent to the generic onAction callback but also split
  // into discreet callbacks per action.
  onAction: function onAction(info) {
    if (this.props.onAction) {
      this.props.onAction(info);
    }
    var action = _utils2.default.dashToPascal(info.action);
    if (this.props['on' + action]) {
      this.props['on' + action](info);
    }
  },

  // Render the wrapper component (by just delegating to the main component).
  render: function render() {

    var config = this.props.config || defaultConfig;
    var value = this.state.value;

    if (this.state.isControlled) {
      if (!this.props.onChange) {
        console.info('You should supply an onChange handler if you supply a value.');
      }
    }

    var props = {
      config: config,
      // Allow field templates to be passed in as `field` or `fields`. After this, stop
      // calling them fields.
      fieldTemplate: this.props.field,
      fieldTemplates: this.props.fields,
      value: value,
      onChange: this.onChange,
      onAction: this.onAction
    };

    _undash2.default.each(this.props, function (propValue, key) {
      if (!(key in props)) {
        props[key] = propValue;
      }
    });

    return FormaticControlled(props);
  }

});