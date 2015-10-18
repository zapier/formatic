!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Formatic=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/justin/Dropbox/git/formatic/index.js":[function(require,module,exports){
// # index

// Export the Formatic React class at the top level.
'use strict';

module.exports = require('./lib/formatic');

},{"./lib/formatic":"/Users/justin/Dropbox/git/formatic/lib/formatic.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/containers/object.js":[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _react = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

var _react2 = _interopRequireDefault(_react);

var _undash = require('../../undash');

var _undash2 = _interopRequireDefault(_undash);

var ObjectContainer = _react2['default'].createClass({
  displayName: 'ObjectContainer',

  propTypes: {
    value: _react2['default'].PropTypes.object,
    onChange: _react2['default'].PropTypes.func.isRequired,
    components: _react2['default'].PropTypes.object.isRequired
  },

  value: function value() {
    var value = this.props.value;

    if (_undash2['default'].isUndefined(value)) {
      return {};
    }
    return value;
  },

  onChangeChild: function onChangeChild(newChildValue, info) {
    var key = info.path[0];
    var newValue = _undash2['default'].extend({}, this.value(), _defineProperty({}, key, newChildValue));
    this.props.onChange(newValue, info);
  },

  childContextTypes: {
    onChangeChild: _react2['default'].PropTypes.func.isRequired,
    components: _react2['default'].PropTypes.object.isRequired
  },

  getChildContext: function getChildContext() {
    return {
      onChangeChild: this.onChangeChild,
      components: this.props.components
    };
  },

  render: function render() {
    var children = this.props.children;

    if (_undash2['default'].isFunction(children)) {
      return children(this.getChildContext());
    }
    return children;
  }
});

exports['default'] = ObjectContainer;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../undash":"/Users/justin/Dropbox/git/formatic/lib/undash.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/containers/string-input.js":[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var _react = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

var _react2 = _interopRequireDefault(_react);

var _reactUtils = require('../../react-utils');

var StringInputContainer = _react2['default'].createClass({
  displayName: 'StringInputContainer',

  propTypes: {
    value: _react2['default'].PropTypes.string.isRequired,
    onChange: _react2['default'].PropTypes.func.isRequired
  },

  render: function render() {
    var _props = this.props;
    var children = _props.children;

    var props = _objectWithoutProperties(_props, ['children']);

    return (0, _reactUtils.cloneChild)(this.props.children, props);
  }
});

exports['default'] = StringInputContainer;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../react-utils":"/Users/justin/Dropbox/git/formatic/lib/react-utils.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/create-field.js":[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

var _react2 = _interopRequireDefault(_react);

var createField = function createField(Input) {
  var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var name = _ref.name;

  if (!name) {
    if (Input.displayName.indexOf('Input') > 0) {
      name = Input.displayName.substring(0, Input.displayName.indexOf('Input'));
    }
  }

  if (!name) {
    throw new Error('Field requires a displayName.');
  }

  var FieldInput = _react2['default'].createClass({

    displayName: name,

    propTypes: {
      components: _react2['default'].PropTypes.object.isRequired
    },

    render: function render() {
      var Field = this.props.components.Field;

      return _react2['default'].createElement(
        Field,
        this.props,
        _react2['default'].createElement(Input, this.props)
      );
    }
  });

  return FieldInput;
};

exports['default'] = createField;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/justin/Dropbox/git/formatic/lib/components/helpers/field.js":[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

var _react2 = _interopRequireDefault(_react);

var Field = _react2['default'].createClass({
  displayName: 'Field',

  propTypes: {
    components: _react2['default'].PropTypes.object.isRequired
  },

  render: function render() {
    var _props$components = this.props.components;
    var Label = _props$components.Label;
    var Help = _props$components.Help;

    return _react2['default'].createElement(
      'div',
      null,
      _react2['default'].createElement(Label, this.props),
      _react2['default'].createElement(Help, this.props),
      this.props.children
    );
  }
});

exports['default'] = Field;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/justin/Dropbox/git/formatic/lib/components/helpers/help.js":[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

var _react2 = _interopRequireDefault(_react);

var Help = _react2['default'].createClass({
  displayName: 'Help',

  render: function render() {
    var help = this.props.help;

    return !help ? null : _react2['default'].createElement(
      'div',
      null,
      help
    );
  }
});

exports['default'] = Help;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/justin/Dropbox/git/formatic/lib/components/helpers/label.js":[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

var _react2 = _interopRequireDefault(_react);

var Label = _react2['default'].createClass({
  displayName: 'Label',

  render: function render() {
    var _props$label = this.props.label;
    var label = _props$label === undefined ? '' : _props$label;

    return _react2['default'].createElement(
      'div',
      null,
      label
    );
  }
});

exports['default'] = Label;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/justin/Dropbox/git/formatic/lib/components/index.js":[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

var _react2 = _interopRequireDefault(_react);

var _undash = require('../undash');

var _undash2 = _interopRequireDefault(_undash);

var _wrapInput = require('./wrap-input');

var _wrapInput2 = _interopRequireDefault(_wrapInput);

var _wrapPure = require('./wrap-pure');

var _wrapPure2 = _interopRequireDefault(_wrapPure);

var _wrapChildInput = require('./wrap-child-input');

var _wrapChildInput2 = _interopRequireDefault(_wrapChildInput);

var _createField = require('./create-field');

var _createField2 = _interopRequireDefault(_createField);

var _useContext = require('./use-context');

var _useContext2 = _interopRequireDefault(_useContext);

var _inputsString = require('./inputs/string');

var _inputsString2 = _interopRequireDefault(_inputsString);

var _containersStringInput = require('./containers/string-input');

var _containersStringInput2 = _interopRequireDefault(_containersStringInput);

var _containersObject = require('./containers/object');

var _containersObject2 = _interopRequireDefault(_containersObject);

var _helpersField = require('./helpers/field');

var _helpersField2 = _interopRequireDefault(_helpersField);

var _helpersHelp = require('./helpers/help');

var _helpersHelp2 = _interopRequireDefault(_helpersHelp);

var _helpersLabel = require('./helpers/label');

var _helpersLabel2 = _interopRequireDefault(_helpersLabel);

var rawInputComponents = {
  StringInput: _inputsString2['default'],
  StringInputContainer: _containersStringInput2['default']
};

var components = {
  WithContext: {}
};

var useContextParam = {
  contextTypes: {
    onChangeChild: _react2['default'].PropTypes.func.isRequired,
    components: _react2['default'].PropTypes.object.isRequired
  },
  contextToProps: { onChangeChild: 'onChange', components: 'components' }
};

Object.keys(rawInputComponents).forEach(function (key) {
  var RawInputComponent = rawInputComponents[key];
  var PureComponent = (0, _wrapPure2['default'])(RawInputComponent);
  PureComponent.hasEvent = RawInputComponent.hasEvent;
  var InputComponent = (0, _wrapInput2['default'])(PureComponent);
  components[key] = InputComponent;
  var ChildInputComponent = (0, _wrapChildInput2['default'])(InputComponent);
  components['Child' + key] = ChildInputComponent;
  components.WithContext['Child' + key] = (0, _useContext2['default'])(ChildInputComponent, useContextParam);
});

var inputTypes = ['String'];

inputTypes.forEach(function (inputType) {
  var InputComponent = components[inputType + 'Input'];
  var FieldComponent = (0, _createField2['default'])(InputComponent);
  components[inputType + 'Field'] = FieldComponent;
  var ChildFieldComponent = (0, _wrapChildInput2['default'])(FieldComponent);
  components['Child' + inputType + 'Field'] = ChildFieldComponent;
  components.WithContext['Child' + inputType + 'Field'] = (0, _useContext2['default'])(ChildFieldComponent, useContextParam);
});

console.log(components);

_undash2['default'].extend(components, {
  ObjectContainer: _containersObject2['default'],
  Field: _helpersField2['default'],
  Help: _helpersHelp2['default'],
  Label: _helpersLabel2['default']
});

exports['default'] = components;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../undash":"/Users/justin/Dropbox/git/formatic/lib/undash.js","./containers/object":"/Users/justin/Dropbox/git/formatic/lib/components/containers/object.js","./containers/string-input":"/Users/justin/Dropbox/git/formatic/lib/components/containers/string-input.js","./create-field":"/Users/justin/Dropbox/git/formatic/lib/components/create-field.js","./helpers/field":"/Users/justin/Dropbox/git/formatic/lib/components/helpers/field.js","./helpers/help":"/Users/justin/Dropbox/git/formatic/lib/components/helpers/help.js","./helpers/label":"/Users/justin/Dropbox/git/formatic/lib/components/helpers/label.js","./inputs/string":"/Users/justin/Dropbox/git/formatic/lib/components/inputs/string.js","./use-context":"/Users/justin/Dropbox/git/formatic/lib/components/use-context.js","./wrap-child-input":"/Users/justin/Dropbox/git/formatic/lib/components/wrap-child-input.js","./wrap-input":"/Users/justin/Dropbox/git/formatic/lib/components/wrap-input.js","./wrap-pure":"/Users/justin/Dropbox/git/formatic/lib/components/wrap-pure.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/inputs/string.js":[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

var _react2 = _interopRequireDefault(_react);

var StringInput = _react2['default'].createClass({
  displayName: 'StringInput',

  statics: {
    hasEvent: true
  },

  propTypes: {
    value: _react2['default'].PropTypes.string.isRequired,
    onChange: _react2['default'].PropTypes.func.isRequired
  },

  render: function render() {
    var _props = this.props;
    var value = _props.value;
    var onChange = _props.onChange;
    var onFocus = _props.onFocus;
    var onBlur = _props.onBlur;

    return _react2['default'].createElement('textarea', { value: value, onChange: onChange, onFocus: onFocus, onBlur: onBlur });
  }
});

exports['default'] = StringInput;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/justin/Dropbox/git/formatic/lib/components/use-context.js":[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

var _react2 = _interopRequireDefault(_react);

var _undash = require('../undash');

var _undash2 = _interopRequireDefault(_undash);

var useContext = function useContext(Component) {
  var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var _ref$contextTypes = _ref.contextTypes;
  var contextTypes = _ref$contextTypes === undefined ? {} : _ref$contextTypes;
  var _ref$contextToProps = _ref.contextToProps;
  var contextToProps = _ref$contextToProps === undefined ? {} : _ref$contextToProps;

  var UseContext = _react2['default'].createClass({
    displayName: 'UseContext',

    contextTypes: contextTypes,

    propsFromContext: function propsFromContext() {
      var _this = this;

      var pairs = Object.keys(contextToProps).map(function (contextKey) {
        var propKey = contextToProps[contextKey];
        return [propKey, _this.context[contextKey]];
      });
      return _undash2['default'].object(pairs);
    },

    render: function render() {
      return _react2['default'].createElement(Component, _extends({}, this.props, this.propsFromContext()));
    }
  });

  return UseContext;
};

exports['default'] = useContext;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../undash":"/Users/justin/Dropbox/git/formatic/lib/undash.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/wrap-child-input.js":[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var _react = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

var _react2 = _interopRequireDefault(_react);

var _undash = require('../undash');

var _undash2 = _interopRequireDefault(_undash);

var wrapChildInput = function wrapChildInput(Input) {
  var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var _ref$defaultValue = _ref.defaultValue;
  var defaultValue = _ref$defaultValue === undefined ? '' : _ref$defaultValue;

  var WrapChildInput = _react2['default'].createClass({
    displayName: 'WrapChildInput',

    mixins: [_react2['default'].PureRenderMixin],

    propTypes: {
      parentValue: _react2['default'].PropTypes.object.isRequired,
      childKey: _react2['default'].PropTypes.string.isRequired,
      onChange: _react2['default'].PropTypes.func.isRequired
    },

    childValue: function childValue() {
      var _props = this.props;
      var parentValue = _props.parentValue;
      var childKey = _props.childKey;

      var childValue = parentValue[childKey];
      if (_undash2['default'].isUndefined(childValue)) {
        return defaultValue;
      }
      return childValue;
    },

    onChange: function onChange(newValue) {
      var _props2 = this.props;
      var onChange = _props2.onChange;
      var childKey = _props2.childKey;

      onChange(newValue, {
        path: [childKey]
      });
    },

    render: function render() {
      var childValue = this.childValue;
      var onChange = this.onChange;

      var value = childValue();
      var _props3 = this.props;
      var parentKey = _props3.parentKey;
      var childKey = _props3.childKey;

      var props = _objectWithoutProperties(_props3, ['parentKey', 'childKey']);

      return _react2['default'].createElement(Input, _extends({}, props, { value: value, onChange: onChange }));
    }
  });

  return WrapChildInput;
};

exports['default'] = wrapChildInput;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../undash":"/Users/justin/Dropbox/git/formatic/lib/undash.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/wrap-input.js":[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports['default'] = wrapInput;

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var u = require('../undash');

function wrapInput(InputComponent) {

  var WrapInput = React.createClass({
    displayName: 'WrapInput',

    mixins: [React.PureRenderMixin],

    getInitialState: function getInitialState() {
      return {
        isControlled: !u.isUndefined(this.props.value),
        value: u.isUndefined(this.props.value) ? this.props.defaultValue : this.props.value
      };
    },

    componentWillReceiveProps: function componentWillReceiveProps(newProps) {
      if (this.state.isControlled) {
        if (!u.isUndefined(newProps.value)) {
          this.setState({
            value: newProps.value
          });
        }
      }
    },

    onChange: function onChange(newValue, info) {

      if (InputComponent.hasEvent || this.props.hasEvent) {
        var _event = newValue;
        newValue = _event.target.value;
      }

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

    render: function render() {
      var _props = this.props;
      var hasEvent = _props.hasEvent;

      var props = _objectWithoutProperties(_props, ['hasEvent']);

      return React.createElement(InputComponent, _extends({}, props, {
        value: this.state.value,
        onChange: this.onChange
      }));
    }
  });

  return WrapInput;
}

module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../undash":"/Users/justin/Dropbox/git/formatic/lib/undash.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/wrap-pure.js":[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

var _react2 = _interopRequireDefault(_react);

var wrapPure = function wrapPure(Component) {

  var WrapPure = _react2['default'].createClass({
    displayName: 'WrapPure',

    mixins: [_react2['default'].PureRenderMixin],

    render: function render() {
      return _react2['default'].createElement(Component, this.props);
    }
  });

  return WrapPure;
};

exports['default'] = wrapPure;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/justin/Dropbox/git/formatic/lib/formatic.js":[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var _ = require('./undash');
var Components = require('./components');
//const ComponentContainer = require('./component-container');

//ComponentContainer.setComponents(Components);

module.exports = React.createClass({
  displayName: 'exports',

  statics: _.extend({
    //wrap: require('./components/wrap-component')
    //field: require('./components/wrap-field'),
    //helper: require('./components/wrap-helper')
    //ComponentContainer: require('./components/containers/component')
    components: Components
  }, Components),

  component: function component(name) {
    if (this.props.component) {
      return this.props.component(name);
    }
    var componentClass = this.props.components && this.props.components[name];
    if (componentClass) {
      return componentClass;
    }
    return Components[name] || Components.Unknown;
  },

  render: function render() {
    if (this.props.children && !_.isArray(this.props.children)) {
      var props = _.extend({}, this.props, { component: this.component });
      return React.cloneElement(this.props.children, props);
    }
    throw new Error('You must provide exactly one child to the Formatic component.');
  }

});

// // # formatic
//
// /*
// The root formatic component.
//
// The root formatic component is actually two components. The main component is
// a controlled component where you must pass the value in with each render. This
// is actually wrapped in another component which allows you to use formatic as
// an uncontrolled component where it retains the state of the value. The wrapper
// is what is actually exported.
// */
//
// 'use strict';
//
// var React = require('react/addons');
// var _ = require('./undash');
//
// var utils = require('./utils');
//
// var defaultConfigPlugin = require('./default-config');
//
// var createConfig = function (...args) {
//   var plugins = [defaultConfigPlugin].concat(args);
//
//   return plugins.reduce(function (config, plugin) {
//     if (_.isFunction(plugin)) {
//       var extensions = plugin(config);
//       if (extensions) {
//         _.extend(config, extensions);
//       }
//     } else {
//       _.extend(config, plugin);
//     }
//
//     return config;
//   }, {});
// };
//
// var defaultConfig = createConfig();
//
// // The main formatic component that renders the form.
// var FormaticControlledClass = React.createClass({
//
//   displayName: 'FormaticControlled',
//
//   // Respond to any value changes.
//   onChange: function (newValue, info) {
//     if (!this.props.onChange) {
//       return;
//     }
//     info = _.extend({}, info);
//     info.path = this.props.config.fieldValuePath(info.field);
//     this.props.onChange(newValue, info);
//   },
//
//   // Respond to any actions other than value changes. (For example, focus and
//   // blur.)
//   onAction: function (info) {
//     if (!this.props.onAction) {
//       return;
//     }
//     info = _.extend({}, info);
//     info.path = this.props.config.fieldValuePath(info.field);
//     this.props.onAction(info);
//   },
//
//   // Render the root component by delegating to the config.
//   render: function () {
//
//     var config = this.props.config;
//
//     return config.renderFormaticComponent(this);
//   }
// });
//
// var FormaticControlled = React.createFactory(FormaticControlledClass);
//
// // A wrapper component that is actually exported and can allow formatic to be
// // used in an "uncontrolled" manner. (See uncontrolled components in the React
// // documentation for an explanation of the difference.)
// module.exports = React.createClass({
//
//   // Export some stuff as statics.
//   statics: {
//     createConfig: createConfig,
//     availableMixins: {
//       clickOutside: require('./mixins/click-outside.js'),
//       field: require('./mixins/field.js'),
//       helper: require('./mixins/helper.js'),
//       resize: require('./mixins/resize.js'),
//       scroll: require('./mixins/scroll.js'),
//       undoStack: require('./mixins/undo-stack.js')
//     },
//     plugins: {
//       bootstrap: require('./plugins/bootstrap'),
//       meta: require('./plugins/meta'),
//       reference: require('./plugins/reference'),
//       elementClasses: require('./plugins/element-classes')
//     },
//     utils: utils
//   },
//
//   displayName: 'Formatic',
//
//   // If we got a value, treat this component as controlled. Either way, retain
//   // the value in the state.
//   getInitialState: function () {
//     return {
//       isControlled: !_.isUndefined(this.props.value),
//       value: _.isUndefined(this.props.value) ? this.props.defaultValue : this.props.value
//     };
//   },
//
//   // If this is a controlled component, change our state to reflect the new
//   // value. For uncontrolled components, ignore any value changes.
//   componentWillReceiveProps: function (newProps) {
//     if (this.state.isControlled) {
//       if (!_.isUndefined(newProps.value)) {
//         this.setState({
//           value: newProps.value
//         });
//       }
//     }
//   },
//
//   // If this is an uncontrolled component, set our state to reflect the new
//   // value. Either way, call the onChange callback.
//   onChange: function (newValue, info) {
//     if (!this.state.isControlled) {
//       this.setState({
//         value: newValue
//       });
//     }
//     if (!this.props.onChange) {
//       return;
//     }
//     this.props.onChange(newValue, info);
//   },
//
//   // Any actions should be sent to the generic onAction callback but also split
//   // into discreet callbacks per action.
//   onAction: function (info) {
//     if (this.props.onAction) {
//       this.props.onAction(info);
//     }
//     var action = utils.dashToPascal(info.action);
//     if (this.props['on' + action]) {
//       this.props['on' + action](info);
//     }
//   },
//
//   // Render the wrapper component (by just delegating to the main component).
//   render: function () {
//
//     var config = this.props.config || defaultConfig;
//     var value = this.state.value;
//
//     if (this.state.isControlled) {
//       if (!this.props.onChange) {
//         console.log('You should supply an onChange handler if you supply a value.');
//       }
//     }
//
//     var props = {
//       config: config,
//       // Allow field templates to be passed in as `field` or `fields`. After this, stop
//       // calling them fields.
//       fieldTemplate: this.props.field,
//       fieldTemplates: this.props.fields,
//       value: value,
//       onChange: this.onChange,
//       onAction: this.onAction
//     };
//
//     _.each(this.props, function (propValue, key) {
//       if (!(key in props)) {
//         props[key] = propValue;
//       }
//     });
//
//     return FormaticControlled(props);
//   }
//
// });

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./components":"/Users/justin/Dropbox/git/formatic/lib/components/index.js","./undash":"/Users/justin/Dropbox/git/formatic/lib/undash.js"}],"/Users/justin/Dropbox/git/formatic/lib/react-utils.js":[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

var _react2 = _interopRequireDefault(_react);

var _undash = require('./undash');

var _undash2 = _interopRequireDefault(_undash);

var cloneChild = function cloneChild(children, props) {
  if (_undash2['default'].isFunction(children)) {
    return children(props);
  }

  var child = _react2['default'].Children.only(children);

  return _react2['default'].cloneElement(child, props);
};

exports.cloneChild = cloneChild;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./undash":"/Users/justin/Dropbox/git/formatic/lib/undash.js"}],"/Users/justin/Dropbox/git/formatic/lib/undash.js":[function(require,module,exports){
'use strict';

var _ = {};

_.assign = _.extend = require('object-assign');
_.isEqual = require('deep-equal');

// These are not necessarily complete implementations. They're just enough for
// what's used in formatic.

_.flatten = function (arrays) {
  return [].concat.apply([], arrays);
};

_.isString = function (value) {
  return typeof value === 'string';
};
_.isUndefined = function (value) {
  return typeof value === 'undefined';
};
_.isObject = function (value) {
  return typeof value === 'object';
};
_.isArray = function (value) {
  return Object.prototype.toString.call(value) === '[object Array]';
};
_.isNumber = function (value) {
  return typeof value === 'number';
};
_.isBoolean = function (value) {
  return typeof value === 'boolean';
};
_.isNull = function (value) {
  return value === null;
};
_.isFunction = function (value) {
  return typeof value === 'function';
};

_.clone = function (value) {
  if (!_.isObject(value)) {
    return value;
  }
  return _.isArray(value) ? value.slice() : _.assign({}, value);
};

_.find = function (items, testFn) {
  for (var i = 0; i < items.length; i++) {
    if (testFn(items[i])) {
      return items[i];
    }
  }
  return void 0;
};

_.every = function (items, testFn) {
  for (var i = 0; i < items.length; i++) {
    if (!testFn(items[i])) {
      return false;
    }
  }
  return true;
};

_.each = function (obj, iterateFn) {
  Object.keys(obj).forEach(function (key) {
    iterateFn(obj[key], key);
  });
};

_.object = function (array) {
  var obj = {};

  array.forEach(function (pair) {
    obj[pair[0]] = pair[1];
  });

  return obj;
};

module.exports = _;

},{"deep-equal":"/Users/justin/Dropbox/git/formatic/node_modules/deep-equal/index.js","object-assign":"/Users/justin/Dropbox/git/formatic/node_modules/object-assign/index.js"}],"/Users/justin/Dropbox/git/formatic/node_modules/deep-equal/index.js":[function(require,module,exports){
var pSlice = Array.prototype.slice;
var objectKeys = require('./lib/keys.js');
var isArguments = require('./lib/is_arguments.js');

var deepEqual = module.exports = function (actual, expected, opts) {
  if (!opts) opts = {};
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();

  // 7.3. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (typeof actual != 'object' && typeof expected != 'object') {
    return opts.strict ? actual === expected : actual == expected;

  // 7.4. For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected, opts);
  }
}

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isBuffer (x) {
  if (!x || typeof x !== 'object' || typeof x.length !== 'number') return false;
  if (typeof x.copy !== 'function' || typeof x.slice !== 'function') {
    return false;
  }
  if (x.length > 0 && typeof x[0] !== 'number') return false;
  return true;
}

function objEquiv(a, b, opts) {
  var i, key;
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return deepEqual(a, b, opts);
  }
  if (isBuffer(a)) {
    if (!isBuffer(b)) {
      return false;
    }
    if (a.length !== b.length) return false;
    for (i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b);
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!deepEqual(a[key], b[key], opts)) return false;
  }
  return typeof a === typeof b;
}

},{"./lib/is_arguments.js":"/Users/justin/Dropbox/git/formatic/node_modules/deep-equal/lib/is_arguments.js","./lib/keys.js":"/Users/justin/Dropbox/git/formatic/node_modules/deep-equal/lib/keys.js"}],"/Users/justin/Dropbox/git/formatic/node_modules/deep-equal/lib/is_arguments.js":[function(require,module,exports){
var supportsArgumentsClass = (function(){
  return Object.prototype.toString.call(arguments)
})() == '[object Arguments]';

exports = module.exports = supportsArgumentsClass ? supported : unsupported;

exports.supported = supported;
function supported(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
};

exports.unsupported = unsupported;
function unsupported(object){
  return object &&
    typeof object == 'object' &&
    typeof object.length == 'number' &&
    Object.prototype.hasOwnProperty.call(object, 'callee') &&
    !Object.prototype.propertyIsEnumerable.call(object, 'callee') ||
    false;
};

},{}],"/Users/justin/Dropbox/git/formatic/node_modules/deep-equal/lib/keys.js":[function(require,module,exports){
exports = module.exports = typeof Object.keys === 'function'
  ? Object.keys : shim;

exports.shim = shim;
function shim (obj) {
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
}

},{}],"/Users/justin/Dropbox/git/formatic/node_modules/object-assign/index.js":[function(require,module,exports){
'use strict';

function ToObject(val) {
	if (val == null) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

module.exports = Object.assign || function (target, source) {
	var from;
	var keys;
	var to = ToObject(target);

	for (var s = 1; s < arguments.length; s++) {
		from = arguments[s];
		keys = Object.keys(Object(from));

		for (var i = 0; i < keys.length; i++) {
			to[keys[i]] = from[keys[i]];
		}
	}

	return to;
};

},{}]},{},["/Users/justin/Dropbox/git/formatic/index.js"])("/Users/justin/Dropbox/git/formatic/index.js")
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2luZGV4LmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9jb250YWluZXJzL29iamVjdC5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvY29udGFpbmVycy9zdHJpbmctaW5wdXQuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2NyZWF0ZS1maWVsZC5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9maWVsZC5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9oZWxwLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2xhYmVsLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9pbmRleC5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaW5wdXRzL3N0cmluZy5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvdXNlLWNvbnRleHQuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL3dyYXAtY2hpbGQtaW5wdXQuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL3dyYXAtaW5wdXQuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL3dyYXAtcHVyZS5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2Zvcm1hdGljLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvcmVhY3QtdXRpbHMuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi91bmRhc2guanMiLCJub2RlX21vZHVsZXMvZGVlcC1lcXVhbC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kZWVwLWVxdWFsL2xpYi9pc19hcmd1bWVudHMuanMiLCJub2RlX21vZHVsZXMvZGVlcC1lcXVhbC9saWIva2V5cy5qcyIsIm5vZGVfbW9kdWxlcy9vYmplY3QtYXNzaWduL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7QUNHQSxNQUFNLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDOzs7Ozs7Ozs7Ozs7OztxQkNIekIsT0FBTzs7OztzQkFDWCxjQUFjOzs7O0FBRTVCLElBQU0sZUFBZSxHQUFHLG1CQUFNLFdBQVcsQ0FBQzs7O0FBRXhDLFdBQVMsRUFBRTtBQUNULFNBQUssRUFBRSxtQkFBTSxTQUFTLENBQUMsTUFBTTtBQUM3QixZQUFRLEVBQUUsbUJBQU0sU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVO0FBQ3pDLGNBQVUsRUFBRSxtQkFBTSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7R0FDOUM7O0FBRUQsT0FBSyxFQUFBLGlCQUFHO1FBQ0MsS0FBSyxHQUFJLElBQUksQ0FBQyxLQUFLLENBQW5CLEtBQUs7O0FBQ1osUUFBSSxvQkFBRSxXQUFXLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDeEIsYUFBTyxFQUFFLENBQUM7S0FDWDtBQUNELFdBQU8sS0FBSyxDQUFDO0dBQ2Q7O0FBRUQsZUFBYSxFQUFBLHVCQUFDLGFBQWEsRUFBRSxJQUFJLEVBQUU7QUFDakMs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bmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vICMgaW5kZXhcblxuLy8gRXhwb3J0IHRoZSBGb3JtYXRpYyBSZWFjdCBjbGFzcyBhdCB0aGUgdG9wIGxldmVsLlxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9mb3JtYXRpYycpO1xuIiwiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB1IGZyb20gJy4uLy4uL3VuZGFzaCc7XG5cbmNvbnN0IE9iamVjdENvbnRhaW5lciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBwcm9wVHlwZXM6IHtcbiAgICB2YWx1ZTogUmVhY3QuUHJvcFR5cGVzLm9iamVjdCxcbiAgICBvbkNoYW5nZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBjb21wb25lbnRzOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWRcbiAgfSxcblxuICB2YWx1ZSgpIHtcbiAgICBjb25zdCB7dmFsdWV9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAodS5pc1VuZGVmaW5lZCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9LFxuXG4gIG9uQ2hhbmdlQ2hpbGQobmV3Q2hpbGRWYWx1ZSwgaW5mbykge1xuICAgIGNvbnN0IGtleSA9IGluZm8ucGF0aFswXTtcbiAgICBjb25zdCBuZXdWYWx1ZSA9IHUuZXh0ZW5kKHt9LCB0aGlzLnZhbHVlKCksIHtcbiAgICAgIFtrZXldOiBuZXdDaGlsZFZhbHVlXG4gICAgfSk7XG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSwgaW5mbyk7XG4gIH0sXG5cbiAgY2hpbGRDb250ZXh0VHlwZXM6IHtcbiAgICBvbkNoYW5nZUNoaWxkOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIGNvbXBvbmVudHM6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZFxuICB9LFxuXG4gIGdldENoaWxkQ29udGV4dCgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgb25DaGFuZ2VDaGlsZDogdGhpcy5vbkNoYW5nZUNoaWxkLFxuICAgICAgY29tcG9uZW50czogdGhpcy5wcm9wcy5jb21wb25lbnRzXG4gICAgfTtcbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgY29uc3Qge2NoaWxkcmVufSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKHUuaXNGdW5jdGlvbihjaGlsZHJlbikpIHtcbiAgICAgIHJldHVybiBjaGlsZHJlbih0aGlzLmdldENoaWxkQ29udGV4dCgpKTtcbiAgICB9XG4gICAgcmV0dXJuIGNoaWxkcmVuO1xuICB9XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgT2JqZWN0Q29udGFpbmVyO1xuIiwiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuaW1wb3J0IHtjbG9uZUNoaWxkfSBmcm9tICcuLi8uLi9yZWFjdC11dGlscyc7XG5cbmNvbnN0IFN0cmluZ0lucHV0Q29udGFpbmVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIHByb3BUeXBlczoge1xuICAgIHZhbHVlOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgb25DaGFuZ2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWRcbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgY29uc3Qge2NoaWxkcmVuLCAuLi5wcm9wc30gPSB0aGlzLnByb3BzO1xuXG4gICAgcmV0dXJuIGNsb25lQ2hpbGQodGhpcy5wcm9wcy5jaGlsZHJlbiwgcHJvcHMpO1xuICB9XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgU3RyaW5nSW5wdXRDb250YWluZXI7XG4iLCJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5jb25zdCBjcmVhdGVGaWVsZCA9IChJbnB1dCwge25hbWV9ID0ge30pID0+IHtcblxuICBpZiAoIW5hbWUpIHtcbiAgICBpZiAoSW5wdXQuZGlzcGxheU5hbWUuaW5kZXhPZignSW5wdXQnKSA+IDApIHtcbiAgICAgIG5hbWUgPSBJbnB1dC5kaXNwbGF5TmFtZS5zdWJzdHJpbmcoMCwgSW5wdXQuZGlzcGxheU5hbWUuaW5kZXhPZignSW5wdXQnKSk7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdGaWVsZCByZXF1aXJlcyBhIGRpc3BsYXlOYW1lLicpO1xuICB9XG5cbiAgY29uc3QgRmllbGRJbnB1dCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGRpc3BsYXlOYW1lOiBuYW1lLFxuXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICBjb21wb25lbnRzOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWRcbiAgICB9LFxuXG4gICAgcmVuZGVyKCkge1xuXG4gICAgICBjb25zdCB7RmllbGR9ID0gdGhpcy5wcm9wcy5jb21wb25lbnRzO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8RmllbGQgey4uLnRoaXMucHJvcHN9PlxuICAgICAgICAgIDxJbnB1dCB7Li4udGhpcy5wcm9wc30vPlxuICAgICAgICA8L0ZpZWxkPlxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBGaWVsZElucHV0O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY3JlYXRlRmllbGQ7XG4iLCJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5jb25zdCBGaWVsZCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBwcm9wVHlwZXM6IHtcbiAgICBjb21wb25lbnRzOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWRcbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgY29uc3Qge0xhYmVsLCBIZWxwfSA9IHRoaXMucHJvcHMuY29tcG9uZW50cztcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2PlxuICAgICAgICA8TGFiZWwgey4uLnRoaXMucHJvcHN9Lz5cbiAgICAgICAgPEhlbHAgey4uLnRoaXMucHJvcHN9Lz5cbiAgICAgICAge3RoaXMucHJvcHMuY2hpbGRyZW59XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgRmllbGQ7XG4iLCJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5jb25zdCBIZWxwID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7aGVscH0gPSB0aGlzLnByb3BzO1xuXG4gICAgcmV0dXJuICFoZWxwID8gbnVsbCA6IChcbiAgICAgIDxkaXY+XG4gICAgICAgIHtoZWxwfVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IEhlbHA7XG4iLCJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5jb25zdCBMYWJlbCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICByZW5kZXIoKSB7XG4gICAgY29uc3Qge2xhYmVsID0gJyd9ID0gdGhpcy5wcm9wcztcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2PlxuICAgICAgICB7bGFiZWx9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgTGFiZWw7XG4iLCJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5pbXBvcnQgdSBmcm9tICcuLi91bmRhc2gnO1xuaW1wb3J0IHdyYXBJbnB1dCBmcm9tICcuL3dyYXAtaW5wdXQnO1xuaW1wb3J0IHdyYXBQdXJlIGZyb20gJy4vd3JhcC1wdXJlJztcbmltcG9ydCB3cmFwQ2hpbGRJbnB1dCBmcm9tICcuL3dyYXAtY2hpbGQtaW5wdXQnO1xuaW1wb3J0IGNyZWF0ZUZpZWxkIGZyb20gJy4vY3JlYXRlLWZpZWxkJztcbmltcG9ydCB1c2VDb250ZXh0IGZyb20gJy4vdXNlLWNvbnRleHQnO1xuXG5pbXBvcnQgU3RyaW5nSW5wdXQgZnJvbSAnLi9pbnB1dHMvc3RyaW5nJztcbmltcG9ydCBTdHJpbmdJbnB1dENvbnRhaW5lciBmcm9tICcuL2NvbnRhaW5lcnMvc3RyaW5nLWlucHV0JztcblxuaW1wb3J0IE9iamVjdENvbnRhaW5lciBmcm9tICcuL2NvbnRhaW5lcnMvb2JqZWN0JztcblxuaW1wb3J0IEZpZWxkIGZyb20gJy4vaGVscGVycy9maWVsZCc7XG5pbXBvcnQgSGVscCBmcm9tICcuL2hlbHBlcnMvaGVscCc7XG5pbXBvcnQgTGFiZWwgZnJvbSAnLi9oZWxwZXJzL2xhYmVsJztcblxuY29uc3QgcmF3SW5wdXRDb21wb25lbnRzID0ge1xuICBTdHJpbmdJbnB1dCxcbiAgU3RyaW5nSW5wdXRDb250YWluZXJcbn07XG5cbmNvbnN0IGNvbXBvbmVudHMgPSB7XG4gIFdpdGhDb250ZXh0OiB7fVxufTtcblxuY29uc3QgdXNlQ29udGV4dFBhcmFtID0ge1xuICBjb250ZXh0VHlwZXM6IHtcbiAgICBvbkNoYW5nZUNoaWxkOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIGNvbXBvbmVudHM6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZFxuICB9LFxuICBjb250ZXh0VG9Qcm9wczoge29uQ2hhbmdlQ2hpbGQ6ICdvbkNoYW5nZScsIGNvbXBvbmVudHM6ICdjb21wb25lbnRzJ31cbn07XG5cbk9iamVjdC5rZXlzKHJhd0lucHV0Q29tcG9uZW50cykuZm9yRWFjaChrZXkgPT4ge1xuICBjb25zdCBSYXdJbnB1dENvbXBvbmVudCA9IHJhd0lucHV0Q29tcG9uZW50c1trZXldO1xuICBjb25zdCBQdXJlQ29tcG9uZW50ID0gd3JhcFB1cmUoUmF3SW5wdXRDb21wb25lbnQpO1xuICBQdXJlQ29tcG9uZW50Lmhhc0V2ZW50ID0gUmF3SW5wdXRDb21wb25lbnQuaGFzRXZlbnQ7XG4gIGNvbnN0IElucHV0Q29tcG9uZW50ID0gd3JhcElucHV0KFB1cmVDb21wb25lbnQpO1xuICBjb21wb25lbnRzW2tleV0gPSBJbnB1dENvbXBvbmVudDtcbiAgY29uc3QgQ2hpbGRJbnB1dENvbXBvbmVudCA9IHdyYXBDaGlsZElucHV0KElucHV0Q29tcG9uZW50KTtcbiAgY29tcG9uZW50c1tgQ2hpbGQke2tleX1gXSA9IENoaWxkSW5wdXRDb21wb25lbnQ7XG4gIGNvbXBvbmVudHMuV2l0aENvbnRleHRbYENoaWxkJHtrZXl9YF0gPSB1c2VDb250ZXh0KENoaWxkSW5wdXRDb21wb25lbnQsIHVzZUNvbnRleHRQYXJhbSk7XG59KTtcblxuY29uc3QgaW5wdXRUeXBlcyA9IFsnU3RyaW5nJ107XG5cbmlucHV0VHlwZXMuZm9yRWFjaChpbnB1dFR5cGUgPT4ge1xuICBjb25zdCBJbnB1dENvbXBvbmVudCA9IGNvbXBvbmVudHNbYCR7aW5wdXRUeXBlfUlucHV0YF07XG4gIGNvbnN0IEZpZWxkQ29tcG9uZW50ID0gY3JlYXRlRmllbGQoSW5wdXRDb21wb25lbnQpO1xuICBjb21wb25lbnRzW2Ake2lucHV0VHlwZX1GaWVsZGBdID0gRmllbGRDb21wb25lbnQ7XG4gIGNvbnN0IENoaWxkRmllbGRDb21wb25lbnQgPSB3cmFwQ2hpbGRJbnB1dChGaWVsZENvbXBvbmVudCk7XG4gIGNvbXBvbmVudHNbYENoaWxkJHtpbnB1dFR5cGV9RmllbGRgXSA9IENoaWxkRmllbGRDb21wb25lbnQ7XG4gIGNvbXBvbmVudHMuV2l0aENvbnRleHRbYENoaWxkJHtpbnB1dFR5cGV9RmllbGRgXSA9IHVzZUNvbnRleHQoQ2hpbGRGaWVsZENvbXBvbmVudCwgdXNlQ29udGV4dFBhcmFtKTtcbn0pO1xuXG5jb25zb2xlLmxvZyhjb21wb25lbnRzKTtcblxudS5leHRlbmQoY29tcG9uZW50cywge1xuICBPYmplY3RDb250YWluZXIsXG4gIEZpZWxkLFxuICBIZWxwLFxuICBMYWJlbFxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IGNvbXBvbmVudHM7XG4iLCJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5jb25zdCBTdHJpbmdJbnB1dCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBzdGF0aWNzOiB7XG4gICAgaGFzRXZlbnQ6IHRydWVcbiAgfSxcblxuICBwcm9wVHlwZXM6IHtcbiAgICB2YWx1ZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIG9uQ2hhbmdlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkXG4gIH0sXG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHt2YWx1ZSwgb25DaGFuZ2UsIG9uRm9jdXMsIG9uQmx1cn0gPSB0aGlzLnByb3BzO1xuICAgIHJldHVybiA8dGV4dGFyZWEgdmFsdWU9e3ZhbHVlfSBvbkNoYW5nZT17b25DaGFuZ2V9IG9uRm9jdXM9e29uRm9jdXN9IG9uQmx1cj17b25CbHVyfS8+O1xuICB9XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgU3RyaW5nSW5wdXQ7XG4iLCJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHUgZnJvbSAnLi4vdW5kYXNoJztcblxuY29uc3QgdXNlQ29udGV4dCA9IChDb21wb25lbnQsIHtjb250ZXh0VHlwZXMgPSB7fSwgY29udGV4dFRvUHJvcHMgPSB7fX0gPSB7fSkgPT4ge1xuXG4gIGNvbnN0IFVzZUNvbnRleHQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBjb250ZXh0VHlwZXMsXG5cbiAgICBwcm9wc0Zyb21Db250ZXh0KCkge1xuICAgICAgY29uc3QgcGFpcnMgPSBPYmplY3Qua2V5cyhjb250ZXh0VG9Qcm9wcykubWFwKGNvbnRleHRLZXkgPT4ge1xuICAgICAgICBjb25zdCBwcm9wS2V5ID0gY29udGV4dFRvUHJvcHNbY29udGV4dEtleV07XG4gICAgICAgIHJldHVybiBbcHJvcEtleSwgdGhpcy5jb250ZXh0W2NvbnRleHRLZXldXTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHUub2JqZWN0KHBhaXJzKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgcmV0dXJuIDxDb21wb25lbnQgey4uLnRoaXMucHJvcHN9IHsuLi50aGlzLnByb3BzRnJvbUNvbnRleHQoKX0vPjtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBVc2VDb250ZXh0O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgdXNlQ29udGV4dDtcbiIsImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgdSBmcm9tICcuLi91bmRhc2gnO1xuXG5jb25zdCB3cmFwQ2hpbGRJbnB1dCA9IChJbnB1dCwge2RlZmF1bHRWYWx1ZSA9ICcnfSA9IHt9KSA9PiB7XG5cbiAgY29uc3QgV3JhcENoaWxkSW5wdXQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBtaXhpbnM6IFtSZWFjdC5QdXJlUmVuZGVyTWl4aW5dLFxuXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICBwYXJlbnRWYWx1ZTogUmVhY3QuUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgICAgY2hpbGRLZXk6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICAgIG9uQ2hhbmdlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkXG4gICAgfSxcblxuICAgIGNoaWxkVmFsdWUoKSB7XG4gICAgICBjb25zdCB7cGFyZW50VmFsdWUsIGNoaWxkS2V5fSA9IHRoaXMucHJvcHM7XG4gICAgICBjb25zdCBjaGlsZFZhbHVlID0gcGFyZW50VmFsdWVbY2hpbGRLZXldO1xuICAgICAgaWYgKHUuaXNVbmRlZmluZWQoY2hpbGRWYWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjaGlsZFZhbHVlO1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZShuZXdWYWx1ZSkge1xuICAgICAgY29uc3Qge29uQ2hhbmdlLCBjaGlsZEtleX0gPSB0aGlzLnByb3BzO1xuICAgICAgb25DaGFuZ2UobmV3VmFsdWUsIHtcbiAgICAgICAgcGF0aDogW2NoaWxkS2V5XVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJlbmRlcigpIHtcbiAgICAgIGNvbnN0IHtjaGlsZFZhbHVlLCBvbkNoYW5nZX0gPSB0aGlzO1xuICAgICAgY29uc3QgdmFsdWUgPSBjaGlsZFZhbHVlKCk7XG4gICAgICBjb25zdCB7cGFyZW50S2V5LCBjaGlsZEtleSwgLi4ucHJvcHN9ID0gdGhpcy5wcm9wcztcbiAgICAgIHJldHVybiA8SW5wdXQgey4uLnByb3BzfSB2YWx1ZT17dmFsdWV9IG9uQ2hhbmdlPXtvbkNoYW5nZX0vPjtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBXcmFwQ2hpbGRJbnB1dDtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHdyYXBDaGlsZElucHV0O1xuIiwiY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuY29uc3QgdSA9IHJlcXVpcmUoJy4uL3VuZGFzaCcpO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB3cmFwSW5wdXQoSW5wdXRDb21wb25lbnQpIHtcblxuICBjb25zdCBXcmFwSW5wdXQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBtaXhpbnM6IFtSZWFjdC5QdXJlUmVuZGVyTWl4aW5dLFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaXNDb250cm9sbGVkOiAhdS5pc1VuZGVmaW5lZCh0aGlzLnByb3BzLnZhbHVlKSxcbiAgICAgICAgdmFsdWU6IHUuaXNVbmRlZmluZWQodGhpcy5wcm9wcy52YWx1ZSkgPyB0aGlzLnByb3BzLmRlZmF1bHRWYWx1ZSA6IHRoaXMucHJvcHMudmFsdWVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMgKG5ld1Byb3BzKSB7XG4gICAgICBpZiAodGhpcy5zdGF0ZS5pc0NvbnRyb2xsZWQpIHtcbiAgICAgICAgaWYgKCF1LmlzVW5kZWZpbmVkKG5ld1Byb3BzLnZhbHVlKSkge1xuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgdmFsdWU6IG5ld1Byb3BzLnZhbHVlXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgb25DaGFuZ2UgKG5ld1ZhbHVlLCBpbmZvKSB7XG5cbiAgICAgIGlmIChJbnB1dENvbXBvbmVudC5oYXNFdmVudCB8fCB0aGlzLnByb3BzLmhhc0V2ZW50KSB7XG4gICAgICAgIGNvbnN0IGV2ZW50ID0gbmV3VmFsdWU7XG4gICAgICAgIG5ld1ZhbHVlID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuc3RhdGUuaXNDb250cm9sbGVkKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIHZhbHVlOiBuZXdWYWx1ZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG5ld1ZhbHVlLCBpbmZvKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgY29uc3Qge2hhc0V2ZW50LCAuLi5wcm9wc30gPSB0aGlzLnByb3BzO1xuXG4gICAgICByZXR1cm4gPElucHV0Q29tcG9uZW50IHsuLi5wcm9wc31cbiAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUudmFsdWV9XG4gICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uQ2hhbmdlfVxuICAgICAgLz47XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gV3JhcElucHV0O1xufVxuIiwiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuY29uc3Qgd3JhcFB1cmUgPSAoQ29tcG9uZW50KSA9PiB7XG5cbiAgY29uc3QgV3JhcFB1cmUgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBtaXhpbnM6IFtSZWFjdC5QdXJlUmVuZGVyTWl4aW5dLFxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgcmV0dXJuIDxDb21wb25lbnQgey4uLnRoaXMucHJvcHN9Lz47XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gV3JhcFB1cmU7XG59O1xuXG5leHBvcnQgZGVmYXVsdCB3cmFwUHVyZTtcbiIsImNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbmNvbnN0IF8gPSByZXF1aXJlKCcuL3VuZGFzaCcpO1xuY29uc3QgQ29tcG9uZW50cyA9IHJlcXVpcmUoJy4vY29tcG9uZW50cycpO1xuLy9jb25zdCBDb21wb25lbnRDb250YWluZXIgPSByZXF1aXJlKCcuL2NvbXBvbmVudC1jb250YWluZXInKTtcblxuLy9Db21wb25lbnRDb250YWluZXIuc2V0Q29tcG9uZW50cyhDb21wb25lbnRzKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgc3RhdGljczogXy5leHRlbmQoe1xuICAgIC8vd3JhcDogcmVxdWlyZSgnLi9jb21wb25lbnRzL3dyYXAtY29tcG9uZW50JylcbiAgICAvL2ZpZWxkOiByZXF1aXJlKCcuL2NvbXBvbmVudHMvd3JhcC1maWVsZCcpLFxuICAgIC8vaGVscGVyOiByZXF1aXJlKCcuL2NvbXBvbmVudHMvd3JhcC1oZWxwZXInKVxuICAgIC8vQ29tcG9uZW50Q29udGFpbmVyOiByZXF1aXJlKCcuL2NvbXBvbmVudHMvY29udGFpbmVycy9jb21wb25lbnQnKVxuICAgIGNvbXBvbmVudHM6IENvbXBvbmVudHNcbiAgfSxcbiAgICBDb21wb25lbnRzXG4gICksXG5cbiAgY29tcG9uZW50KG5hbWUpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5jb21wb25lbnQpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3BzLmNvbXBvbmVudChuYW1lKTtcbiAgICB9XG4gICAgY29uc3QgY29tcG9uZW50Q2xhc3MgPSB0aGlzLnByb3BzLmNvbXBvbmVudHMgJiYgdGhpcy5wcm9wcy5jb21wb25lbnRzW25hbWVdO1xuICAgIGlmIChjb21wb25lbnRDbGFzcykge1xuICAgICAgcmV0dXJuIGNvbXBvbmVudENsYXNzO1xuICAgIH1cbiAgICByZXR1cm4gQ29tcG9uZW50c1tuYW1lXSB8fCBDb21wb25lbnRzLlVua25vd247XG4gIH0sXG5cbiAgcmVuZGVyKCkge1xuICAgIGlmICh0aGlzLnByb3BzLmNoaWxkcmVuICYmICFfLmlzQXJyYXkodGhpcy5wcm9wcy5jaGlsZHJlbikpIHtcbiAgICAgIGNvbnN0IHByb3BzID0gXy5leHRlbmQoe30sIHRoaXMucHJvcHMsIHtjb21wb25lbnQ6IHRoaXMuY29tcG9uZW50fSk7XG4gICAgICByZXR1cm4gUmVhY3QuY2xvbmVFbGVtZW50KHRoaXMucHJvcHMuY2hpbGRyZW4sIHByb3BzKTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKCdZb3UgbXVzdCBwcm92aWRlIGV4YWN0bHkgb25lIGNoaWxkIHRvIHRoZSBGb3JtYXRpYyBjb21wb25lbnQuJyk7XG4gIH1cblxufSk7XG5cblxuLy8gLy8gIyBmb3JtYXRpY1xuLy9cbi8vIC8qXG4vLyBUaGUgcm9vdCBmb3JtYXRpYyBjb21wb25lbnQuXG4vL1xuLy8gVGhlIHJvb3QgZm9ybWF0aWMgY29tcG9uZW50IGlzIGFjdHVhbGx5IHR3byBjb21wb25lbnRzLiBUaGUgbWFpbiBjb21wb25lbnQgaXNcbi8vIGEgY29udHJvbGxlZCBjb21wb25lbnQgd2hlcmUgeW91IG11c3QgcGFzcyB0aGUgdmFsdWUgaW4gd2l0aCBlYWNoIHJlbmRlci4gVGhpc1xuLy8gaXMgYWN0dWFsbHkgd3JhcHBlZCBpbiBhbm90aGVyIGNvbXBvbmVudCB3aGljaCBhbGxvd3MgeW91IHRvIHVzZSBmb3JtYXRpYyBhc1xuLy8gYW4gdW5jb250cm9sbGVkIGNvbXBvbmVudCB3aGVyZSBpdCByZXRhaW5zIHRoZSBzdGF0ZSBvZiB0aGUgdmFsdWUuIFRoZSB3cmFwcGVyXG4vLyBpcyB3aGF0IGlzIGFjdHVhbGx5IGV4cG9ydGVkLlxuLy8gKi9cbi8vXG4vLyAndXNlIHN0cmljdCc7XG4vL1xuLy8gdmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG4vLyB2YXIgXyA9IHJlcXVpcmUoJy4vdW5kYXNoJyk7XG4vL1xuLy8gdmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuLy9cbi8vIHZhciBkZWZhdWx0Q29uZmlnUGx1Z2luID0gcmVxdWlyZSgnLi9kZWZhdWx0LWNvbmZpZycpO1xuLy9cbi8vIHZhciBjcmVhdGVDb25maWcgPSBmdW5jdGlvbiAoLi4uYXJncykge1xuLy8gICB2YXIgcGx1Z2lucyA9IFtkZWZhdWx0Q29uZmlnUGx1Z2luXS5jb25jYXQoYXJncyk7XG4vL1xuLy8gICByZXR1cm4gcGx1Z2lucy5yZWR1Y2UoZnVuY3Rpb24gKGNvbmZpZywgcGx1Z2luKSB7XG4vLyAgICAgaWYgKF8uaXNGdW5jdGlvbihwbHVnaW4pKSB7XG4vLyAgICAgICB2YXIgZXh0ZW5zaW9ucyA9IHBsdWdpbihjb25maWcpO1xuLy8gICAgICAgaWYgKGV4dGVuc2lvbnMpIHtcbi8vICAgICAgICAgXy5leHRlbmQoY29uZmlnLCBleHRlbnNpb25zKTtcbi8vICAgICAgIH1cbi8vICAgICB9IGVsc2Uge1xuLy8gICAgICAgXy5leHRlbmQoY29uZmlnLCBwbHVnaW4pO1xuLy8gICAgIH1cbi8vXG4vLyAgICAgcmV0dXJuIGNvbmZpZztcbi8vICAgfSwge30pO1xuLy8gfTtcbi8vXG4vLyB2YXIgZGVmYXVsdENvbmZpZyA9IGNyZWF0ZUNvbmZpZygpO1xuLy9cbi8vIC8vIFRoZSBtYWluIGZvcm1hdGljIGNvbXBvbmVudCB0aGF0IHJlbmRlcnMgdGhlIGZvcm0uXG4vLyB2YXIgRm9ybWF0aWNDb250cm9sbGVkQ2xhc3MgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4vL1xuLy8gICBkaXNwbGF5TmFtZTogJ0Zvcm1hdGljQ29udHJvbGxlZCcsXG4vL1xuLy8gICAvLyBSZXNwb25kIHRvIGFueSB2YWx1ZSBjaGFuZ2VzLlxuLy8gICBvbkNoYW5nZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBpbmZvKSB7XG4vLyAgICAgaWYgKCF0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4vLyAgICAgICByZXR1cm47XG4vLyAgICAgfVxuLy8gICAgIGluZm8gPSBfLmV4dGVuZCh7fSwgaW5mbyk7XG4vLyAgICAgaW5mby5wYXRoID0gdGhpcy5wcm9wcy5jb25maWcuZmllbGRWYWx1ZVBhdGgoaW5mby5maWVsZCk7XG4vLyAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSwgaW5mbyk7XG4vLyAgIH0sXG4vL1xuLy8gICAvLyBSZXNwb25kIHRvIGFueSBhY3Rpb25zIG90aGVyIHRoYW4gdmFsdWUgY2hhbmdlcy4gKEZvciBleGFtcGxlLCBmb2N1cyBhbmRcbi8vICAgLy8gYmx1ci4pXG4vLyAgIG9uQWN0aW9uOiBmdW5jdGlvbiAoaW5mbykge1xuLy8gICAgIGlmICghdGhpcy5wcm9wcy5vbkFjdGlvbikge1xuLy8gICAgICAgcmV0dXJuO1xuLy8gICAgIH1cbi8vICAgICBpbmZvID0gXy5leHRlbmQoe30sIGluZm8pO1xuLy8gICAgIGluZm8ucGF0aCA9IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkVmFsdWVQYXRoKGluZm8uZmllbGQpO1xuLy8gICAgIHRoaXMucHJvcHMub25BY3Rpb24oaW5mbyk7XG4vLyAgIH0sXG4vL1xuLy8gICAvLyBSZW5kZXIgdGhlIHJvb3QgY29tcG9uZW50IGJ5IGRlbGVnYXRpbmcgdG8gdGhlIGNvbmZpZy5cbi8vICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4vL1xuLy8gICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbi8vXG4vLyAgICAgcmV0dXJuIGNvbmZpZy5yZW5kZXJGb3JtYXRpY0NvbXBvbmVudCh0aGlzKTtcbi8vICAgfVxuLy8gfSk7XG4vL1xuLy8gdmFyIEZvcm1hdGljQ29udHJvbGxlZCA9IFJlYWN0LmNyZWF0ZUZhY3RvcnkoRm9ybWF0aWNDb250cm9sbGVkQ2xhc3MpO1xuLy9cbi8vIC8vIEEgd3JhcHBlciBjb21wb25lbnQgdGhhdCBpcyBhY3R1YWxseSBleHBvcnRlZCBhbmQgY2FuIGFsbG93IGZvcm1hdGljIHRvIGJlXG4vLyAvLyB1c2VkIGluIGFuIFwidW5jb250cm9sbGVkXCIgbWFubmVyLiAoU2VlIHVuY29udHJvbGxlZCBjb21wb25lbnRzIGluIHRoZSBSZWFjdFxuLy8gLy8gZG9jdW1lbnRhdGlvbiBmb3IgYW4gZXhwbGFuYXRpb24gb2YgdGhlIGRpZmZlcmVuY2UuKVxuLy8gbW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4vL1xuLy8gICAvLyBFeHBvcnQgc29tZSBzdHVmZiBhcyBzdGF0aWNzLlxuLy8gICBzdGF0aWNzOiB7XG4vLyAgICAgY3JlYXRlQ29uZmlnOiBjcmVhdGVDb25maWcsXG4vLyAgICAgYXZhaWxhYmxlTWl4aW5zOiB7XG4vLyAgICAgICBjbGlja091dHNpZGU6IHJlcXVpcmUoJy4vbWl4aW5zL2NsaWNrLW91dHNpZGUuanMnKSxcbi8vICAgICAgIGZpZWxkOiByZXF1aXJlKCcuL21peGlucy9maWVsZC5qcycpLFxuLy8gICAgICAgaGVscGVyOiByZXF1aXJlKCcuL21peGlucy9oZWxwZXIuanMnKSxcbi8vICAgICAgIHJlc2l6ZTogcmVxdWlyZSgnLi9taXhpbnMvcmVzaXplLmpzJyksXG4vLyAgICAgICBzY3JvbGw6IHJlcXVpcmUoJy4vbWl4aW5zL3Njcm9sbC5qcycpLFxuLy8gICAgICAgdW5kb1N0YWNrOiByZXF1aXJlKCcuL21peGlucy91bmRvLXN0YWNrLmpzJylcbi8vICAgICB9LFxuLy8gICAgIHBsdWdpbnM6IHtcbi8vICAgICAgIGJvb3RzdHJhcDogcmVxdWlyZSgnLi9wbHVnaW5zL2Jvb3RzdHJhcCcpLFxuLy8gICAgICAgbWV0YTogcmVxdWlyZSgnLi9wbHVnaW5zL21ldGEnKSxcbi8vICAgICAgIHJlZmVyZW5jZTogcmVxdWlyZSgnLi9wbHVnaW5zL3JlZmVyZW5jZScpLFxuLy8gICAgICAgZWxlbWVudENsYXNzZXM6IHJlcXVpcmUoJy4vcGx1Z2lucy9lbGVtZW50LWNsYXNzZXMnKVxuLy8gICAgIH0sXG4vLyAgICAgdXRpbHM6IHV0aWxzXG4vLyAgIH0sXG4vL1xuLy8gICBkaXNwbGF5TmFtZTogJ0Zvcm1hdGljJyxcbi8vXG4vLyAgIC8vIElmIHdlIGdvdCBhIHZhbHVlLCB0cmVhdCB0aGlzIGNvbXBvbmVudCBhcyBjb250cm9sbGVkLiBFaXRoZXIgd2F5LCByZXRhaW5cbi8vICAgLy8gdGhlIHZhbHVlIGluIHRoZSBzdGF0ZS5cbi8vICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4vLyAgICAgcmV0dXJuIHtcbi8vICAgICAgIGlzQ29udHJvbGxlZDogIV8uaXNVbmRlZmluZWQodGhpcy5wcm9wcy52YWx1ZSksXG4vLyAgICAgICB2YWx1ZTogXy5pc1VuZGVmaW5lZCh0aGlzLnByb3BzLnZhbHVlKSA/IHRoaXMucHJvcHMuZGVmYXVsdFZhbHVlIDogdGhpcy5wcm9wcy52YWx1ZVxuLy8gICAgIH07XG4vLyAgIH0sXG4vL1xuLy8gICAvLyBJZiB0aGlzIGlzIGEgY29udHJvbGxlZCBjb21wb25lbnQsIGNoYW5nZSBvdXIgc3RhdGUgdG8gcmVmbGVjdCB0aGUgbmV3XG4vLyAgIC8vIHZhbHVlLiBGb3IgdW5jb250cm9sbGVkIGNvbXBvbmVudHMsIGlnbm9yZSBhbnkgdmFsdWUgY2hhbmdlcy5cbi8vICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gKG5ld1Byb3BzKSB7XG4vLyAgICAgaWYgKHRoaXMuc3RhdGUuaXNDb250cm9sbGVkKSB7XG4vLyAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQobmV3UHJvcHMudmFsdWUpKSB7XG4vLyAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuLy8gICAgICAgICAgIHZhbHVlOiBuZXdQcm9wcy52YWx1ZVxuLy8gICAgICAgICB9KTtcbi8vICAgICAgIH1cbi8vICAgICB9XG4vLyAgIH0sXG4vL1xuLy8gICAvLyBJZiB0aGlzIGlzIGFuIHVuY29udHJvbGxlZCBjb21wb25lbnQsIHNldCBvdXIgc3RhdGUgdG8gcmVmbGVjdCB0aGUgbmV3XG4vLyAgIC8vIHZhbHVlLiBFaXRoZXIgd2F5LCBjYWxsIHRoZSBvbkNoYW5nZSBjYWxsYmFjay5cbi8vICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgaW5mbykge1xuLy8gICAgIGlmICghdGhpcy5zdGF0ZS5pc0NvbnRyb2xsZWQpIHtcbi8vICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuLy8gICAgICAgICB2YWx1ZTogbmV3VmFsdWVcbi8vICAgICAgIH0pO1xuLy8gICAgIH1cbi8vICAgICBpZiAoIXRoaXMucHJvcHMub25DaGFuZ2UpIHtcbi8vICAgICAgIHJldHVybjtcbi8vICAgICB9XG4vLyAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSwgaW5mbyk7XG4vLyAgIH0sXG4vL1xuLy8gICAvLyBBbnkgYWN0aW9ucyBzaG91bGQgYmUgc2VudCB0byB0aGUgZ2VuZXJpYyBvbkFjdGlvbiBjYWxsYmFjayBidXQgYWxzbyBzcGxpdFxuLy8gICAvLyBpbnRvIGRpc2NyZWV0IGNhbGxiYWNrcyBwZXIgYWN0aW9uLlxuLy8gICBvbkFjdGlvbjogZnVuY3Rpb24gKGluZm8pIHtcbi8vICAgICBpZiAodGhpcy5wcm9wcy5vbkFjdGlvbikge1xuLy8gICAgICAgdGhpcy5wcm9wcy5vbkFjdGlvbihpbmZvKTtcbi8vICAgICB9XG4vLyAgICAgdmFyIGFjdGlvbiA9IHV0aWxzLmRhc2hUb1Bhc2NhbChpbmZvLmFjdGlvbik7XG4vLyAgICAgaWYgKHRoaXMucHJvcHNbJ29uJyArIGFjdGlvbl0pIHtcbi8vICAgICAgIHRoaXMucHJvcHNbJ29uJyArIGFjdGlvbl0oaW5mbyk7XG4vLyAgICAgfVxuLy8gICB9LFxuLy9cbi8vICAgLy8gUmVuZGVyIHRoZSB3cmFwcGVyIGNvbXBvbmVudCAoYnkganVzdCBkZWxlZ2F0aW5nIHRvIHRoZSBtYWluIGNvbXBvbmVudCkuXG4vLyAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuLy9cbi8vICAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWcgfHwgZGVmYXVsdENvbmZpZztcbi8vICAgICB2YXIgdmFsdWUgPSB0aGlzLnN0YXRlLnZhbHVlO1xuLy9cbi8vICAgICBpZiAodGhpcy5zdGF0ZS5pc0NvbnRyb2xsZWQpIHtcbi8vICAgICAgIGlmICghdGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuLy8gICAgICAgICBjb25zb2xlLmxvZygnWW91IHNob3VsZCBzdXBwbHkgYW4gb25DaGFuZ2UgaGFuZGxlciBpZiB5b3Ugc3VwcGx5IGEgdmFsdWUuJyk7XG4vLyAgICAgICB9XG4vLyAgICAgfVxuLy9cbi8vICAgICB2YXIgcHJvcHMgPSB7XG4vLyAgICAgICBjb25maWc6IGNvbmZpZyxcbi8vICAgICAgIC8vIEFsbG93IGZpZWxkIHRlbXBsYXRlcyB0byBiZSBwYXNzZWQgaW4gYXMgYGZpZWxkYCBvciBgZmllbGRzYC4gQWZ0ZXIgdGhpcywgc3RvcFxuLy8gICAgICAgLy8gY2FsbGluZyB0aGVtIGZpZWxkcy5cbi8vICAgICAgIGZpZWxkVGVtcGxhdGU6IHRoaXMucHJvcHMuZmllbGQsXG4vLyAgICAgICBmaWVsZFRlbXBsYXRlczogdGhpcy5wcm9wcy5maWVsZHMsXG4vLyAgICAgICB2YWx1ZTogdmFsdWUsXG4vLyAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbi8vICAgICAgIG9uQWN0aW9uOiB0aGlzLm9uQWN0aW9uXG4vLyAgICAgfTtcbi8vXG4vLyAgICAgXy5lYWNoKHRoaXMucHJvcHMsIGZ1bmN0aW9uIChwcm9wVmFsdWUsIGtleSkge1xuLy8gICAgICAgaWYgKCEoa2V5IGluIHByb3BzKSkge1xuLy8gICAgICAgICBwcm9wc1trZXldID0gcHJvcFZhbHVlO1xuLy8gICAgICAgfVxuLy8gICAgIH0pO1xuLy9cbi8vICAgICByZXR1cm4gRm9ybWF0aWNDb250cm9sbGVkKHByb3BzKTtcbi8vICAgfVxuLy9cbi8vIH0pO1xuIiwiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB1IGZyb20gJy4vdW5kYXNoJztcblxuY29uc3QgY2xvbmVDaGlsZCA9IChjaGlsZHJlbiwgcHJvcHMpID0+IHtcbiAgaWYgKHUuaXNGdW5jdGlvbihjaGlsZHJlbikpIHtcbiAgICByZXR1cm4gY2hpbGRyZW4ocHJvcHMpO1xuICB9XG5cbiAgY29uc3QgY2hpbGQgPSBSZWFjdC5DaGlsZHJlbi5vbmx5KGNoaWxkcmVuKTtcblxuICByZXR1cm4gUmVhY3QuY2xvbmVFbGVtZW50KGNoaWxkLCBwcm9wcyk7XG59O1xuXG5leHBvcnQge1xuICBjbG9uZUNoaWxkXG59O1xuIiwidmFyIF8gPSB7fTtcblxuXy5hc3NpZ24gPSBfLmV4dGVuZCA9IHJlcXVpcmUoJ29iamVjdC1hc3NpZ24nKTtcbl8uaXNFcXVhbCA9IHJlcXVpcmUoJ2RlZXAtZXF1YWwnKTtcblxuLy8gVGhlc2UgYXJlIG5vdCBuZWNlc3NhcmlseSBjb21wbGV0ZSBpbXBsZW1lbnRhdGlvbnMuIFRoZXkncmUganVzdCBlbm91Z2ggZm9yXG4vLyB3aGF0J3MgdXNlZCBpbiBmb3JtYXRpYy5cblxuXy5mbGF0dGVuID0gKGFycmF5cykgPT4gW10uY29uY2F0LmFwcGx5KFtdLCBhcnJheXMpO1xuXG5fLmlzU3RyaW5nID0gdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJztcbl8uaXNVbmRlZmluZWQgPSB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnO1xuXy5pc09iamVjdCA9IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCc7XG5fLmlzQXJyYXkgPSB2YWx1ZSA9PiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpID09PSAnW29iamVjdCBBcnJheV0nO1xuXy5pc051bWJlciA9IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcic7XG5fLmlzQm9vbGVhbiA9IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nO1xuXy5pc051bGwgPSB2YWx1ZSA9PiB2YWx1ZSA9PT0gbnVsbDtcbl8uaXNGdW5jdGlvbiA9IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJztcblxuXy5jbG9uZSA9IHZhbHVlID0+IHtcbiAgaWYgKCFfLmlzT2JqZWN0KHZhbHVlKSkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICByZXR1cm4gXy5pc0FycmF5KHZhbHVlKSA/IHZhbHVlLnNsaWNlKCkgOiBfLmFzc2lnbih7fSwgdmFsdWUpO1xufTtcblxuXy5maW5kID0gKGl0ZW1zLCB0ZXN0Rm4pID0+IHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuICAgIGlmICh0ZXN0Rm4oaXRlbXNbaV0pKSB7XG4gICAgICByZXR1cm4gaXRlbXNbaV07XG4gICAgfVxuICB9XG4gIHJldHVybiB2b2lkIDA7XG59O1xuXG5fLmV2ZXJ5ID0gKGl0ZW1zLCB0ZXN0Rm4pID0+IHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuICAgIGlmICghdGVzdEZuKGl0ZW1zW2ldKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbl8uZWFjaCA9IChvYmosIGl0ZXJhdGVGbikgPT4ge1xuICBPYmplY3Qua2V5cyhvYmopLmZvckVhY2goa2V5ID0+IHtcbiAgICBpdGVyYXRlRm4ob2JqW2tleV0sIGtleSk7XG4gIH0pO1xufTtcblxuXy5vYmplY3QgPSAoYXJyYXkpID0+IHtcbiAgY29uc3Qgb2JqID0ge307XG5cbiAgYXJyYXkuZm9yRWFjaChwYWlyID0+IHtcbiAgICBvYmpbcGFpclswXV0gPSBwYWlyWzFdO1xuICB9KTtcblxuICByZXR1cm4gb2JqO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBfO1xuIiwidmFyIHBTbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcbnZhciBvYmplY3RLZXlzID0gcmVxdWlyZSgnLi9saWIva2V5cy5qcycpO1xudmFyIGlzQXJndW1lbnRzID0gcmVxdWlyZSgnLi9saWIvaXNfYXJndW1lbnRzLmpzJyk7XG5cbnZhciBkZWVwRXF1YWwgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChhY3R1YWwsIGV4cGVjdGVkLCBvcHRzKSB7XG4gIGlmICghb3B0cykgb3B0cyA9IHt9O1xuICAvLyA3LjEuIEFsbCBpZGVudGljYWwgdmFsdWVzIGFyZSBlcXVpdmFsZW50LCBhcyBkZXRlcm1pbmVkIGJ5ID09PS5cbiAgaWYgKGFjdHVhbCA9PT0gZXhwZWN0ZWQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcblxuICB9IGVsc2UgaWYgKGFjdHVhbCBpbnN0YW5jZW9mIERhdGUgJiYgZXhwZWN0ZWQgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgcmV0dXJuIGFjdHVhbC5nZXRUaW1lKCkgPT09IGV4cGVjdGVkLmdldFRpbWUoKTtcblxuICAvLyA3LjMuIE90aGVyIHBhaXJzIHRoYXQgZG8gbm90IGJvdGggcGFzcyB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcsXG4gIC8vIGVxdWl2YWxlbmNlIGlzIGRldGVybWluZWQgYnkgPT0uXG4gIH0gZWxzZSBpZiAodHlwZW9mIGFjdHVhbCAhPSAnb2JqZWN0JyAmJiB0eXBlb2YgZXhwZWN0ZWQgIT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gb3B0cy5zdHJpY3QgPyBhY3R1YWwgPT09IGV4cGVjdGVkIDogYWN0dWFsID09IGV4cGVjdGVkO1xuXG4gIC8vIDcuNC4gRm9yIGFsbCBvdGhlciBPYmplY3QgcGFpcnMsIGluY2x1ZGluZyBBcnJheSBvYmplY3RzLCBlcXVpdmFsZW5jZSBpc1xuICAvLyBkZXRlcm1pbmVkIGJ5IGhhdmluZyB0aGUgc2FtZSBudW1iZXIgb2Ygb3duZWQgcHJvcGVydGllcyAoYXMgdmVyaWZpZWRcbiAgLy8gd2l0aCBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwpLCB0aGUgc2FtZSBzZXQgb2Yga2V5c1xuICAvLyAoYWx0aG91Z2ggbm90IG5lY2Vzc2FyaWx5IHRoZSBzYW1lIG9yZGVyKSwgZXF1aXZhbGVudCB2YWx1ZXMgZm9yIGV2ZXJ5XG4gIC8vIGNvcnJlc3BvbmRpbmcga2V5LCBhbmQgYW4gaWRlbnRpY2FsICdwcm90b3R5cGUnIHByb3BlcnR5LiBOb3RlOiB0aGlzXG4gIC8vIGFjY291bnRzIGZvciBib3RoIG5hbWVkIGFuZCBpbmRleGVkIHByb3BlcnRpZXMgb24gQXJyYXlzLlxuICB9IGVsc2Uge1xuICAgIHJldHVybiBvYmpFcXVpdihhY3R1YWwsIGV4cGVjdGVkLCBvcHRzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZE9yTnVsbCh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gaXNCdWZmZXIgKHgpIHtcbiAgaWYgKCF4IHx8IHR5cGVvZiB4ICE9PSAnb2JqZWN0JyB8fCB0eXBlb2YgeC5sZW5ndGggIT09ICdudW1iZXInKSByZXR1cm4gZmFsc2U7XG4gIGlmICh0eXBlb2YgeC5jb3B5ICE9PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiB4LnNsaWNlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICh4Lmxlbmd0aCA+IDAgJiYgdHlwZW9mIHhbMF0gIT09ICdudW1iZXInKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBvYmpFcXVpdihhLCBiLCBvcHRzKSB7XG4gIHZhciBpLCBrZXk7XG4gIGlmIChpc1VuZGVmaW5lZE9yTnVsbChhKSB8fCBpc1VuZGVmaW5lZE9yTnVsbChiKSlcbiAgICByZXR1cm4gZmFsc2U7XG4gIC8vIGFuIGlkZW50aWNhbCAncHJvdG90eXBlJyBwcm9wZXJ0eS5cbiAgaWYgKGEucHJvdG90eXBlICE9PSBiLnByb3RvdHlwZSkgcmV0dXJuIGZhbHNlO1xuICAvL35+fkkndmUgbWFuYWdlZCB0byBicmVhayBPYmplY3Qua2V5cyB0aHJvdWdoIHNjcmV3eSBhcmd1bWVudHMgcGFzc2luZy5cbiAgLy8gICBDb252ZXJ0aW5nIHRvIGFycmF5IHNvbHZlcyB0aGUgcHJvYmxlbS5cbiAgaWYgKGlzQXJndW1lbnRzKGEpKSB7XG4gICAgaWYgKCFpc0FyZ3VtZW50cyhiKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBhID0gcFNsaWNlLmNhbGwoYSk7XG4gICAgYiA9IHBTbGljZS5jYWxsKGIpO1xuICAgIHJldHVybiBkZWVwRXF1YWwoYSwgYiwgb3B0cyk7XG4gIH1cbiAgaWYgKGlzQnVmZmVyKGEpKSB7XG4gICAgaWYgKCFpc0J1ZmZlcihiKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoYS5sZW5ndGggIT09IGIubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gICAgZm9yIChpID0gMDsgaSA8IGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChhW2ldICE9PSBiW2ldKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHRyeSB7XG4gICAgdmFyIGthID0gb2JqZWN0S2V5cyhhKSxcbiAgICAgICAga2IgPSBvYmplY3RLZXlzKGIpO1xuICB9IGNhdGNoIChlKSB7Ly9oYXBwZW5zIHdoZW4gb25lIGlzIGEgc3RyaW5nIGxpdGVyYWwgYW5kIHRoZSBvdGhlciBpc24ndFxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvLyBoYXZpbmcgdGhlIHNhbWUgbnVtYmVyIG9mIG93bmVkIHByb3BlcnRpZXMgKGtleXMgaW5jb3Jwb3JhdGVzXG4gIC8vIGhhc093blByb3BlcnR5KVxuICBpZiAoa2EubGVuZ3RoICE9IGtiLmxlbmd0aClcbiAgICByZXR1cm4gZmFsc2U7XG4gIC8vdGhlIHNhbWUgc2V0IG9mIGtleXMgKGFsdGhvdWdoIG5vdCBuZWNlc3NhcmlseSB0aGUgc2FtZSBvcmRlciksXG4gIGthLnNvcnQoKTtcbiAga2Iuc29ydCgpO1xuICAvL35+fmNoZWFwIGtleSB0ZXN0XG4gIGZvciAoaSA9IGthLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgaWYgKGthW2ldICE9IGtiW2ldKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vZXF1aXZhbGVudCB2YWx1ZXMgZm9yIGV2ZXJ5IGNvcnJlc3BvbmRpbmcga2V5LCBhbmRcbiAgLy9+fn5wb3NzaWJseSBleHBlbnNpdmUgZGVlcCB0ZXN0XG4gIGZvciAoaSA9IGthLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAga2V5ID0ga2FbaV07XG4gICAgaWYgKCFkZWVwRXF1YWwoYVtrZXldLCBiW2tleV0sIG9wdHMpKSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHR5cGVvZiBhID09PSB0eXBlb2YgYjtcbn1cbiIsInZhciBzdXBwb3J0c0FyZ3VtZW50c0NsYXNzID0gKGZ1bmN0aW9uKCl7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYXJndW1lbnRzKVxufSkoKSA9PSAnW29iamVjdCBBcmd1bWVudHNdJztcblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gc3VwcG9ydHNBcmd1bWVudHNDbGFzcyA/IHN1cHBvcnRlZCA6IHVuc3VwcG9ydGVkO1xuXG5leHBvcnRzLnN1cHBvcnRlZCA9IHN1cHBvcnRlZDtcbmZ1bmN0aW9uIHN1cHBvcnRlZChvYmplY3QpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmplY3QpID09ICdbb2JqZWN0IEFyZ3VtZW50c10nO1xufTtcblxuZXhwb3J0cy51bnN1cHBvcnRlZCA9IHVuc3VwcG9ydGVkO1xuZnVuY3Rpb24gdW5zdXBwb3J0ZWQob2JqZWN0KXtcbiAgcmV0dXJuIG9iamVjdCAmJlxuICAgIHR5cGVvZiBvYmplY3QgPT0gJ29iamVjdCcgJiZcbiAgICB0eXBlb2Ygb2JqZWN0Lmxlbmd0aCA9PSAnbnVtYmVyJyAmJlxuICAgIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsICdjYWxsZWUnKSAmJlxuICAgICFPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwob2JqZWN0LCAnY2FsbGVlJykgfHxcbiAgICBmYWxzZTtcbn07XG4iLCJleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSB0eXBlb2YgT2JqZWN0LmtleXMgPT09ICdmdW5jdGlvbidcbiAgPyBPYmplY3Qua2V5cyA6IHNoaW07XG5cbmV4cG9ydHMuc2hpbSA9IHNoaW07XG5mdW5jdGlvbiBzaGltIChvYmopIHtcbiAgdmFyIGtleXMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikga2V5cy5wdXNoKGtleSk7XG4gIHJldHVybiBrZXlzO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBUb09iamVjdCh2YWwpIHtcblx0aWYgKHZhbCA9PSBudWxsKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignT2JqZWN0LmFzc2lnbiBjYW5ub3QgYmUgY2FsbGVkIHdpdGggbnVsbCBvciB1bmRlZmluZWQnKTtcblx0fVxuXG5cdHJldHVybiBPYmplY3QodmFsKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQsIHNvdXJjZSkge1xuXHR2YXIgZnJvbTtcblx0dmFyIGtleXM7XG5cdHZhciB0byA9IFRvT2JqZWN0KHRhcmdldCk7XG5cblx0Zm9yICh2YXIgcyA9IDE7IHMgPCBhcmd1bWVudHMubGVuZ3RoOyBzKyspIHtcblx0XHRmcm9tID0gYXJndW1lbnRzW3NdO1xuXHRcdGtleXMgPSBPYmplY3Qua2V5cyhPYmplY3QoZnJvbSkpO1xuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR0b1trZXlzW2ldXSA9IGZyb21ba2V5c1tpXV07XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHRvO1xufTtcbiJdfQ==
