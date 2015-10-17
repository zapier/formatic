!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Formatic=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/justin/Dropbox/git/formatic/index.js":[function(require,module,exports){
"use strict";

// # index

// Export the Formatic React class at the top level.
module.exports = require("./lib/formatic");

},{"./lib/formatic":"/Users/justin/Dropbox/git/formatic/lib/formatic.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/containers/object.js":[function(require,module,exports){
(function (global){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _defineProperty = function (obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); };

var React = _interopRequire((typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null));

var u = _interopRequire(require("../../undash"));

var ObjectContainer = React.createClass({
  displayName: "ObjectContainer",

  propTypes: {
    value: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired,
    components: React.PropTypes.object.isRequired
  },

  value: (function (_value) {
    var _valueWrapper = function value() {
      return _value.apply(this, arguments);
    };

    _valueWrapper.toString = function () {
      return _value.toString();
    };

    return _valueWrapper;
  })(function () {
    var value = this.props.value;

    if (u.isUndefined(value)) {
      return {};
    }
    return value;
  }),

  onChangeChild: function onChangeChild(newChildValue, info) {
    var key = info.path[0];
    var newValue = u.extend({}, this.value(), _defineProperty({}, key, newChildValue));
    this.props.onChange(newValue, info);
  },

  childContextTypes: {
    onChangeChild: React.PropTypes.func.isRequired,
    components: React.PropTypes.object.isRequired
  },

  getChildContext: function getChildContext() {
    return {
      onChangeChild: this.onChangeChild,
      components: this.props.components
    };
  },

  render: function render() {
    var children = this.props.children;

    if (u.isFunction(children)) {
      return children(this.getChildContext());
    }
    return children;
  }
});

module.exports = ObjectContainer;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../undash":"/Users/justin/Dropbox/git/formatic/lib/undash.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/create-field.js":[function(require,module,exports){
(function (global){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var React = _interopRequire((typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null));

var createField = function (Input) {
  var _ref = arguments[1] === undefined ? {} : arguments[1];

  var name = _ref.name;

  if (!name) {
    if (Input.displayName.indexOf("Input") > 0) {
      name = Input.displayName.substring(0, Input.displayName.indexOf("Input"));
    }
  }

  if (!name) {
    throw new Error("Field requires a displayName.");
  }

  var FieldInput = React.createClass({

    displayName: name,

    propTypes: {
      components: React.PropTypes.object.isRequired
    },

    render: function render() {
      var Field = this.props.components.Field;

      return React.createElement(
        Field,
        this.props,
        React.createElement(Input, this.props)
      );
    }
  });

  return FieldInput;
};

module.exports = createField;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/justin/Dropbox/git/formatic/lib/components/helpers/field.js":[function(require,module,exports){
(function (global){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var React = _interopRequire((typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null));

var Field = React.createClass({
  displayName: "Field",

  propTypes: {
    components: React.PropTypes.object.isRequired
  },

  render: function render() {
    var _props$components = this.props.components;
    var Label = _props$components.Label;
    var Help = _props$components.Help;

    return React.createElement(
      "div",
      null,
      React.createElement(Label, this.props),
      React.createElement(Help, this.props),
      this.props.children
    );
  }
});

module.exports = Field;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/justin/Dropbox/git/formatic/lib/components/helpers/help.js":[function(require,module,exports){
(function (global){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var React = _interopRequire((typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null));

var Help = React.createClass({
  displayName: "Help",

  render: function render() {
    var help = this.props.help;

    return !help ? null : React.createElement(
      "div",
      null,
      help
    );
  }
});

module.exports = Help;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/justin/Dropbox/git/formatic/lib/components/helpers/label.js":[function(require,module,exports){
(function (global){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var React = _interopRequire((typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null));

var Label = React.createClass({
  displayName: "Label",

  render: function render() {
    var _props$label = this.props.label;
    var label = _props$label === undefined ? "" : _props$label;

    return React.createElement(
      "div",
      null,
      label
    );
  }
});

module.exports = Label;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/justin/Dropbox/git/formatic/lib/components/index.js":[function(require,module,exports){
(function (global){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var React = _interopRequire((typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null));

var u = _interopRequire(require("../undash"));

var wrapInput = _interopRequire(require("./wrap-input"));

var wrapPure = _interopRequire(require("./wrap-pure"));

var wrapChildInput = _interopRequire(require("./wrap-child-input"));

var createField = _interopRequire(require("./create-field"));

var useContext = _interopRequire(require("./use-context"));

var StringInput = _interopRequire(require("./inputs/string"));

var ObjectContainer = _interopRequire(require("./containers/object"));

var Field = _interopRequire(require("./helpers/field"));

var Help = _interopRequire(require("./helpers/help"));

var Label = _interopRequire(require("./helpers/label"));

var rawInputComponents = {
  StringInput: StringInput
};

var components = {
  WithContext: {}
};

var useContextParam = {
  contextTypes: {
    onChangeChild: React.PropTypes.func.isRequired,
    components: React.PropTypes.object.isRequired
  },
  contextToProps: { onChangeChild: "onChange", components: "components" }
};

Object.keys(rawInputComponents).forEach(function (key) {
  var RawInputComponent = rawInputComponents[key];
  var PureComponent = wrapPure(RawInputComponent);
  PureComponent.hasEvent = RawInputComponent.hasEvent;
  var InputComponent = wrapInput(PureComponent);
  components[key] = InputComponent;
  var ChildInputComponent = wrapChildInput(InputComponent);
  components["Child" + key] = ChildInputComponent;
  components.WithContext["Child" + key] = useContext(ChildInputComponent, useContextParam);
});

var inputTypes = ["String"];

inputTypes.forEach(function (inputType) {
  var InputComponent = components["" + inputType + "Input"];
  var FieldComponent = createField(InputComponent);
  components["" + inputType + "Field"] = FieldComponent;
  var ChildFieldComponent = wrapChildInput(FieldComponent);
  components["Child" + inputType + "Field"] = ChildFieldComponent;
  components.WithContext["Child" + inputType + "Field"] = useContext(ChildFieldComponent, useContextParam);
});

console.log(components);

u.extend(components, {
  ObjectContainer: ObjectContainer,
  Field: Field,
  Help: Help,
  Label: Label
});

module.exports = components;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../undash":"/Users/justin/Dropbox/git/formatic/lib/undash.js","./containers/object":"/Users/justin/Dropbox/git/formatic/lib/components/containers/object.js","./create-field":"/Users/justin/Dropbox/git/formatic/lib/components/create-field.js","./helpers/field":"/Users/justin/Dropbox/git/formatic/lib/components/helpers/field.js","./helpers/help":"/Users/justin/Dropbox/git/formatic/lib/components/helpers/help.js","./helpers/label":"/Users/justin/Dropbox/git/formatic/lib/components/helpers/label.js","./inputs/string":"/Users/justin/Dropbox/git/formatic/lib/components/inputs/string.js","./use-context":"/Users/justin/Dropbox/git/formatic/lib/components/use-context.js","./wrap-child-input":"/Users/justin/Dropbox/git/formatic/lib/components/wrap-child-input.js","./wrap-input":"/Users/justin/Dropbox/git/formatic/lib/components/wrap-input.js","./wrap-pure":"/Users/justin/Dropbox/git/formatic/lib/components/wrap-pure.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/inputs/string.js":[function(require,module,exports){
(function (global){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var React = _interopRequire((typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null));

var StringInput = React.createClass({
  displayName: "StringInput",

  statics: {
    hasEvent: true
  },

  propTypes: {
    value: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired
  },

  render: function render() {
    var _props = this.props;
    var value = _props.value;
    var onChange = _props.onChange;
    var onFocus = _props.onFocus;
    var onBlur = _props.onBlur;

    return React.createElement("textarea", { value: value, onChange: onChange, onFocus: onFocus, onBlur: onBlur });
  }
});

module.exports = StringInput;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/justin/Dropbox/git/formatic/lib/components/use-context.js":[function(require,module,exports){
(function (global){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = _interopRequire((typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null));

var u = _interopRequire(require("../undash"));

var useContext = function (Component) {
  var _ref = arguments[1] === undefined ? {} : arguments[1];

  var _ref$contextTypes = _ref.contextTypes;
  var contextTypes = _ref$contextTypes === undefined ? {} : _ref$contextTypes;
  var _ref$contextToProps = _ref.contextToProps;
  var contextToProps = _ref$contextToProps === undefined ? {} : _ref$contextToProps;

  var UseContext = React.createClass({
    displayName: "UseContext",

    contextTypes: contextTypes,

    propsFromContext: function propsFromContext() {
      var _this = this;

      var pairs = Object.keys(contextToProps).map(function (contextKey) {
        var propKey = contextToProps[contextKey];
        return [propKey, _this.context[contextKey]];
      });
      return u.object(pairs);
    },

    render: function render() {
      return React.createElement(Component, _extends({}, this.props, this.propsFromContext()));
    }
  });

  return UseContext;
};

module.exports = useContext;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../undash":"/Users/justin/Dropbox/git/formatic/lib/undash.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/wrap-child-input.js":[function(require,module,exports){
(function (global){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = _interopRequire((typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null));

var u = _interopRequire(require("../undash"));

var wrapChildInput = function (Input) {
  var _ref = arguments[1] === undefined ? {} : arguments[1];

  var _ref$defaultValue = _ref.defaultValue;
  var defaultValue = _ref$defaultValue === undefined ? "" : _ref$defaultValue;

  var WrapChildInput = React.createClass({
    displayName: "WrapChildInput",

    mixins: [React.PureRenderMixin],

    propTypes: {
      parentValue: React.PropTypes.object.isRequired,
      childKey: React.PropTypes.string.isRequired,
      onChange: React.PropTypes.func.isRequired
    },

    childValue: (function (_childValue) {
      var _childValueWrapper = function childValue() {
        return _childValue.apply(this, arguments);
      };

      _childValueWrapper.toString = function () {
        return _childValue.toString();
      };

      return _childValueWrapper;
    })(function () {
      var _props = this.props;
      var parentValue = _props.parentValue;
      var childKey = _props.childKey;

      var childValue = parentValue[childKey];
      if (u.isUndefined(childValue)) {
        return defaultValue;
      }
      return childValue;
    }),

    onChange: (function (_onChange) {
      var _onChangeWrapper = function onChange(_x) {
        return _onChange.apply(this, arguments);
      };

      _onChangeWrapper.toString = function () {
        return _onChange.toString();
      };

      return _onChangeWrapper;
    })(function (newValue) {
      var _props = this.props;
      var onChange = _props.onChange;
      var childKey = _props.childKey;

      onChange(newValue, {
        path: [childKey]
      });
    }),

    render: function render() {
      var _ref2 = this;

      var childValue = _ref2.childValue;
      var onChange = _ref2.onChange;

      var value = childValue();
      return React.createElement(Input, _extends({}, this.props, { value: value, onChange: onChange }));
    }
  });

  return WrapChildInput;
};

module.exports = wrapChildInput;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../undash":"/Users/justin/Dropbox/git/formatic/lib/undash.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/wrap-input.js":[function(require,module,exports){
(function (global){
"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

module.exports = wrapInput;
var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var u = require("../undash");

function wrapInput(InputComponent) {

  var WrapInput = React.createClass({
    displayName: "WrapInput",

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

      if (InputComponent.hasEvent) {
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
      return React.createElement(InputComponent, _extends({}, this.props, {
        value: this.state.value,
        onChange: this.onChange
      }));
    }
  });

  return WrapInput;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../undash":"/Users/justin/Dropbox/git/formatic/lib/undash.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/wrap-pure.js":[function(require,module,exports){
(function (global){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var React = _interopRequire((typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null));

var wrapPure = function (Component) {

  var WrapPure = React.createClass({
    displayName: "WrapPure",

    mixins: [React.PureRenderMixin],

    render: function render() {
      return React.createElement(Component, this.props);
    }
  });

  return WrapPure;
};

module.exports = wrapPure;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/justin/Dropbox/git/formatic/lib/formatic.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var _ = require("./undash");
var Components = require("./components");
//const ComponentContainer = require('./component-container');

//ComponentContainer.setComponents(Components);

module.exports = React.createClass({
  displayName: "exports",

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
    throw new Error("You must provide exactly one child to the Formatic component.");
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

},{"./components":"/Users/justin/Dropbox/git/formatic/lib/components/index.js","./undash":"/Users/justin/Dropbox/git/formatic/lib/undash.js"}],"/Users/justin/Dropbox/git/formatic/lib/undash.js":[function(require,module,exports){
"use strict";

var _ = {};

_.assign = _.extend = require("object-assign");
_.isEqual = require("deep-equal");

// These are not necessarily complete implementations. They're just enough for
// what's used in formatic.

_.flatten = function (arrays) {
  return [].concat.apply([], arrays);
};

_.isString = function (value) {
  return typeof value === "string";
};
_.isUndefined = function (value) {
  return typeof value === "undefined";
};
_.isObject = function (value) {
  return typeof value === "object";
};
_.isArray = function (value) {
  return Object.prototype.toString.call(value) === "[object Array]";
};
_.isNumber = function (value) {
  return typeof value === "number";
};
_.isBoolean = function (value) {
  return typeof value === "boolean";
};
_.isNull = function (value) {
  return value === null;
};
_.isFunction = function (value) {
  return typeof value === "function";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2luZGV4LmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9jb250YWluZXJzL29iamVjdC5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvY3JlYXRlLWZpZWxkLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2ZpZWxkLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2hlbHAuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvbGFiZWwuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2luZGV4LmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9pbnB1dHMvc3RyaW5nLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy91c2UtY29udGV4dC5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvd3JhcC1jaGlsZC1pbnB1dC5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvd3JhcC1pbnB1dC5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvd3JhcC1wdXJlLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvZm9ybWF0aWMuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi91bmRhc2guanMiLCJub2RlX21vZHVsZXMvZGVlcC1lcXVhbC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kZWVwLWVxdWFsL2xpYi9pc19hcmd1bWVudHMuanMiLCJub2RlX21vZHVsZXMvZGVlcC1lcXVhbC9saWIva2V5cy5qcyIsIm5vZGVfbW9kdWxlcy9vYmplY3QtYXNzaWduL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7QUNHQSxNQUFNLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDOzs7Ozs7Ozs7O0lDSHBDLEtBQUssMkJBQU0sT0FBTzs7SUFDbEIsQ0FBQywyQkFBTSxjQUFjOztBQUU1QixJQUFNLGVBQWUsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDOzs7QUFFeEMsV0FBUyxFQUFFO0FBQ1QsU0FBSyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTTtBQUM3QixZQUFRLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVTtBQUN6QyxjQUFVLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtHQUM5Qzs7QUFFRCxPQUFLOzs7Ozs7Ozs7O0tBQUEsWUFBRztRQUNDLEtBQUssR0FBSSxJQUFJLENBQUMsS0FBSyxDQUFuQixLQUFLOztBQUNaLFFBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUN4QixhQUFPLEVBQUUsQ0FBQztLQUNYO0FBQ0QsV0FBTyxLQUFLLENBQUM7R0FDZCxDQUFBOztBQUVELGVBQWEsRUFBQSx1QkFBQyxhQUFhLEVBQUUsSUFBSSxFQUFFO0FBQ2pDLFFBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDekIsUUFBTSxRQUFRLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxzQkFDdkMsR0FBRyxFQUFHLGFBQWEsRUFDcEIsQ0FBQztBQUNILFFBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztHQUNyQzs7QUFFRCxtQkFBaUIsRUFBRTtBQUNqQixpQkFBYSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7QUFDOUMsY0FBVSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7R0FDOUM7O0FBRUQsaUJBQWUsRUFBQSwyQkFBRztBQUNoQixXQUFPO0FBQ0wsbUJBQWEsRUFBRSxJQUFJLENBQUMsYUFBYTtBQUNqQyxnQkFBVSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVTtLQUNsQyxDQUFDO0dBQ0g7O0FBRUQsUUFBTSxFQUFBLGtCQUFHO1FBQ0EsUUFBUSxHQUFJLElBQUksQ0FBQyxLQUFLLENBQXRCLFFBQVE7O0FBQ2YsUUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFO0FBQzFCLGFBQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDO0tBQ3pDO0FBQ0QsV0FBTyxRQUFRLENBQUM7R0FDakI7Q0FDRixDQUFDLENBQUM7O2lCQUVZLGVBQWU7Ozs7Ozs7Ozs7SUNoRHZCLEtBQUssMkJBQU0sT0FBTzs7QUFFekIsSUFBTSxXQUFXLEdBQUcsVUFBQyxLQUFLLEVBQWtCOzBDQUFQLEVBQUU7O01BQVYsSUFBSSxRQUFKLElBQUk7O0FBRS9CLE1BQUksQ0FBQyxJQUFJLEVBQUU7QUFDVCxRQUFJLEtBQUssQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUMxQyxVQUFJLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7S0FDM0U7R0FDRjs7QUFFRCxNQUFJLENBQUMsSUFBSSxFQUFFO0FBQ1QsVUFBTSxJQUFJLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0dBQ2xEOztBQUVELE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7O0FBRW5DLGVBQVcsRUFBRSxJQUFJOztBQUVqQixhQUFTLEVBQUU7QUFDVCxnQkFBVSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7S0FDOUM7O0FBRUQsVUFBTSxFQUFBLGtCQUFHO1VBRUEsS0FBSyxHQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUE5QixLQUFLOztBQUVaLGFBQ0U7QUFBQyxhQUFLO1FBQUssSUFBSSxDQUFDLEtBQUs7UUFDbkIsb0JBQUMsS0FBSyxFQUFLLElBQUksQ0FBQyxLQUFLLENBQUc7T0FDbEIsQ0FDUjtLQUNIO0dBQ0YsQ0FBQyxDQUFDOztBQUVILFNBQU8sVUFBVSxDQUFDO0NBQ25CLENBQUM7O2lCQUVhLFdBQVc7Ozs7Ozs7Ozs7SUNyQ25CLEtBQUssMkJBQU0sT0FBTzs7QUFFekIsSUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7O0FBRTlCLFdBQVMsRUFBRTtBQUNULGNBQVUsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0dBQzlDOztBQUVELFFBQU0sRUFBQSxrQkFBRzs0QkFDZSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVU7UUFBcEMsS0FBSyxxQkFBTCxLQUFLO1FBQUUsSUFBSSxxQkFBSixJQUFJOztBQUVsQixXQUNFOzs7TUFDRSxvQkFBQyxLQUFLLEVBQUssSUFBSSxDQUFDLEtBQUssQ0FBRztNQUN4QixvQkFBQyxJQUFJLEVBQUssSUFBSSxDQUFDLEtBQUssQ0FBRztNQUN0QixJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVE7S0FDaEIsQ0FDTjtHQUNIO0NBQ0YsQ0FBQyxDQUFDOztpQkFFWSxLQUFLOzs7Ozs7Ozs7O0lDckJiLEtBQUssMkJBQU0sT0FBTzs7QUFFekIsSUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7O0FBRTdCLFFBQU0sRUFBQSxrQkFBRztRQUNBLElBQUksR0FBSSxJQUFJLENBQUMsS0FBSyxDQUFsQixJQUFJOztBQUVYLFdBQU8sQ0FBQyxJQUFJLEdBQUcsSUFBSSxHQUNqQjs7O01BQ0csSUFBSTtLQUNELEFBQ1AsQ0FBQztHQUNIO0NBQ0YsQ0FBQyxDQUFDOztpQkFFWSxJQUFJOzs7Ozs7Ozs7O0lDZlosS0FBSywyQkFBTSxPQUFPOztBQUV6QixJQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDOzs7QUFFOUIsUUFBTSxFQUFBLGtCQUFHO3VCQUNjLElBQUksQ0FBQyxLQUFLLENBQXhCLEtBQUs7UUFBTCxLQUFLLGdDQUFHLEVBQUU7O0FBRWpCLFdBQ0U7OztNQUNHLEtBQUs7S0FDRixDQUNOO0dBQ0g7Q0FDRixDQUFDLENBQUM7O2lCQUVZLEtBQUs7Ozs7Ozs7Ozs7SUNmYixLQUFLLDJCQUFNLE9BQU87O0lBRWxCLENBQUMsMkJBQU0sV0FBVzs7SUFDbEIsU0FBUywyQkFBTSxjQUFjOztJQUM3QixRQUFRLDJCQUFNLGFBQWE7O0lBQzNCLGNBQWMsMkJBQU0sb0JBQW9COztJQUN4QyxXQUFXLDJCQUFNLGdCQUFnQjs7SUFDakMsVUFBVSwyQkFBTSxlQUFlOztJQUUvQixXQUFXLDJCQUFNLGlCQUFpQjs7SUFFbEMsZUFBZSwyQkFBTSxxQkFBcUI7O0lBRTFDLEtBQUssMkJBQU0saUJBQWlCOztJQUM1QixJQUFJLDJCQUFNLGdCQUFnQjs7SUFDMUIsS0FBSywyQkFBTSxpQkFBaUI7O0FBRW5DLElBQU0sa0JBQWtCLEdBQUc7QUFDekIsYUFBVyxFQUFYLFdBQVc7Q0FDWixDQUFDOztBQUVGLElBQU0sVUFBVSxHQUFHO0FBQ2pCLGFBQVcsRUFBRSxFQUFFO0NBQ2hCLENBQUM7O0FBRUYsSUFBTSxlQUFlLEdBQUc7QUFDdEIsY0FBWSxFQUFFO0FBQ1osaUJBQWEsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVO0FBQzlDLGNBQVUsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0dBQzlDO0FBQ0QsZ0JBQWMsRUFBRSxFQUFDLGFBQWEsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBQztDQUN0RSxDQUFDOztBQUVGLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQSxHQUFHLEVBQUk7QUFDN0MsTUFBTSxpQkFBaUIsR0FBRyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNsRCxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUNsRCxlQUFhLENBQUMsUUFBUSxHQUFHLGlCQUFpQixDQUFDLFFBQVEsQ0FBQztBQUNwRCxNQUFNLGNBQWMsR0FBRyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDaEQsWUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLGNBQWMsQ0FBQztBQUNqQyxNQUFNLG1CQUFtQixHQUFHLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUMzRCxZQUFVLFdBQVMsR0FBRyxDQUFHLEdBQUcsbUJBQW1CLENBQUM7QUFDaEQsWUFBVSxDQUFDLFdBQVcsV0FBUyxHQUFHLENBQUcsR0FBRyxVQUFVLENBQUMsbUJBQW1CLEVBQUUsZUFBZSxDQUFDLENBQUM7Q0FDMUYsQ0FBQyxDQUFDOztBQUVILElBQU0sVUFBVSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7O0FBRTlCLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBQSxTQUFTLEVBQUk7QUFDOUIsTUFBTSxjQUFjLEdBQUcsVUFBVSxNQUFJLFNBQVMsV0FBUSxDQUFDO0FBQ3ZELE1BQU0sY0FBYyxHQUFHLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNuRCxZQUFVLE1BQUksU0FBUyxXQUFRLEdBQUcsY0FBYyxDQUFDO0FBQ2pELE1BQU0sbUJBQW1CLEdBQUcsY0FBYyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQzNELFlBQVUsV0FBUyxTQUFTLFdBQVEsR0FBRyxtQkFBbUIsQ0FBQztBQUMzRCxZQUFVLENBQUMsV0FBVyxXQUFTLFNBQVMsV0FBUSxHQUFHLFVBQVUsQ0FBQyxtQkFBbUIsRUFBRSxlQUFlLENBQUMsQ0FBQztDQUNyRyxDQUFDLENBQUM7O0FBRUgsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFeEIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUU7QUFDbkIsaUJBQWUsRUFBZixlQUFlO0FBQ2YsT0FBSyxFQUFMLEtBQUs7QUFDTCxNQUFJLEVBQUosSUFBSTtBQUNKLE9BQUssRUFBTCxLQUFLO0NBQ04sQ0FBQyxDQUFDOztpQkFFWSxVQUFVOzs7Ozs7Ozs7O0lDaEVsQixLQUFLLDJCQUFNLE9BQU87O0FBRXpCLElBQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7OztBQUVwQyxTQUFPLEVBQUU7QUFDUCxZQUFRLEVBQUUsSUFBSTtHQUNmOztBQUVELFdBQVMsRUFBRTtBQUNULFNBQUssRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQ3hDLFlBQVEsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVO0dBQzFDOztBQUVELFFBQU0sRUFBQSxrQkFBRztpQkFDb0MsSUFBSSxDQUFDLEtBQUs7UUFBOUMsS0FBSyxVQUFMLEtBQUs7UUFBRSxRQUFRLFVBQVIsUUFBUTtRQUFFLE9BQU8sVUFBUCxPQUFPO1FBQUUsTUFBTSxVQUFOLE1BQU07O0FBQ3ZDLFdBQU8sa0NBQVUsS0FBSyxFQUFFLEtBQUssQUFBQyxFQUFDLFFBQVEsRUFBRSxRQUFRLEFBQUMsRUFBQyxPQUFPLEVBQUUsT0FBTyxBQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sQUFBQyxHQUFFLENBQUM7R0FDeEY7Q0FDRixDQUFDLENBQUM7O2lCQUVZLFdBQVc7Ozs7Ozs7Ozs7OztJQ25CbkIsS0FBSywyQkFBTSxPQUFPOztJQUNsQixDQUFDLDJCQUFNLFdBQVc7O0FBRXpCLElBQU0sVUFBVSxHQUFHLFVBQUMsU0FBUyxFQUFvRDswQ0FBUCxFQUFFOzsrQkFBNUMsWUFBWTtNQUFaLFlBQVkscUNBQUcsRUFBRTtpQ0FBRSxjQUFjO01BQWQsY0FBYyx1Q0FBRyxFQUFFOztBQUVwRSxNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDOzs7QUFFbkMsZ0JBQVksRUFBWixZQUFZOztBQUVaLG9CQUFnQixFQUFBLDRCQUFHOzs7QUFDakIsVUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQSxVQUFVLEVBQUk7QUFDMUQsWUFBTSxPQUFPLEdBQUcsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzNDLGVBQU8sQ0FBQyxPQUFPLEVBQUUsTUFBSyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztPQUM1QyxDQUFDLENBQUM7QUFDSCxhQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDeEI7O0FBRUQsVUFBTSxFQUFBLGtCQUFHO0FBQ1AsYUFBTyxvQkFBQyxTQUFTLGVBQUssSUFBSSxDQUFDLEtBQUssRUFBTSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsRUFBRyxDQUFDO0tBQ2xFO0dBQ0YsQ0FBQyxDQUFDOztBQUVILFNBQU8sVUFBVSxDQUFDO0NBQ25CLENBQUM7O2lCQUVhLFVBQVU7Ozs7Ozs7Ozs7OztJQ3pCbEIsS0FBSywyQkFBTSxPQUFPOztJQUNsQixDQUFDLDJCQUFNLFdBQVc7O0FBRXpCLElBQU0sY0FBYyxHQUFHLFVBQUMsS0FBSyxFQUErQjswQ0FBUCxFQUFFOzsrQkFBdkIsWUFBWTtNQUFaLFlBQVkscUNBQUcsRUFBRTs7QUFFL0MsTUFBTSxjQUFjLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7O0FBRXZDLFVBQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUM7O0FBRS9CLGFBQVMsRUFBRTtBQUNULGlCQUFXLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtBQUM5QyxjQUFRLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtBQUMzQyxjQUFRLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVTtLQUMxQzs7QUFFRCxjQUFVOzs7Ozs7Ozs7O09BQUEsWUFBRzttQkFDcUIsSUFBSSxDQUFDLEtBQUs7VUFBbkMsV0FBVyxVQUFYLFdBQVc7VUFBRSxRQUFRLFVBQVIsUUFBUTs7QUFDNUIsVUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3pDLFVBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsRUFBRTtBQUM3QixlQUFPLFlBQVksQ0FBQztPQUNyQjtBQUNELGFBQU8sVUFBVSxDQUFDO0tBQ25CLENBQUE7O0FBRUQsWUFBUTs7Ozs7Ozs7OztPQUFBLFVBQUMsUUFBUSxFQUFFO21CQUNZLElBQUksQ0FBQyxLQUFLO1VBQWhDLFFBQVEsVUFBUixRQUFRO1VBQUUsUUFBUSxVQUFSLFFBQVE7O0FBQ3pCLGNBQVEsQ0FBQyxRQUFRLEVBQUU7QUFDakIsWUFBSSxFQUFFLENBQUMsUUFBUSxDQUFDO09BQ2pCLENBQUMsQ0FBQztLQUNKLENBQUE7O0FBRUQsVUFBTSxFQUFBLGtCQUFHO2tCQUN3QixJQUFJOztVQUE1QixVQUFVLFNBQVYsVUFBVTtVQUFFLFFBQVEsU0FBUixRQUFROztBQUMzQixVQUFNLEtBQUssR0FBRyxVQUFVLEVBQUUsQ0FBQztBQUMzQixhQUFPLG9CQUFDLEtBQUssZUFBSyxJQUFJLENBQUMsS0FBSyxJQUFFLEtBQUssRUFBRSxLQUFLLEFBQUMsRUFBQyxRQUFRLEVBQUUsUUFBUSxBQUFDLElBQUUsQ0FBQztLQUNuRTtHQUNGLENBQUMsQ0FBQzs7QUFFSCxTQUFPLGNBQWMsQ0FBQztDQUN2QixDQUFDOztpQkFFYSxjQUFjOzs7Ozs7Ozs7O2lCQ3RDTCxTQUFTO0FBSGpDLElBQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMvQixJQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7O0FBRWhCLFNBQVMsU0FBUyxDQUFDLGNBQWMsRUFBRTs7QUFFaEQsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7O0FBRWxDLFVBQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUM7O0FBRS9CLG1CQUFlLEVBQUEsMkJBQUc7QUFDaEIsYUFBTztBQUNMLG9CQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQzlDLGFBQUssRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLO09BQ3BGLENBQUM7S0FDSDs7QUFFRCw2QkFBeUIsRUFBQyxtQ0FBQyxRQUFRLEVBQUU7QUFDbkMsVUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRTtBQUMzQixZQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDbEMsY0FBSSxDQUFDLFFBQVEsQ0FBQztBQUNaLGlCQUFLLEVBQUUsUUFBUSxDQUFDLEtBQUs7V0FDdEIsQ0FBQyxDQUFDO1NBQ0o7T0FDRjtLQUNGOztBQUVELFlBQVEsRUFBQyxrQkFBQyxRQUFRLEVBQUUsSUFBSSxFQUFFOztBQUV4QixVQUFJLGNBQWMsQ0FBQyxRQUFRLEVBQUU7QUFDM0IsWUFBTSxNQUFLLEdBQUcsUUFBUSxDQUFDO0FBQ3ZCLGdCQUFRLEdBQUcsTUFBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7T0FDL0I7O0FBRUQsVUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFO0FBQzVCLFlBQUksQ0FBQyxRQUFRLENBQUM7QUFDWixlQUFLLEVBQUUsUUFBUTtTQUNoQixDQUFDLENBQUM7T0FDSjtBQUNELFVBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRTtBQUN4QixlQUFPO09BQ1I7QUFDRCxVQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDckM7O0FBRUQsVUFBTSxFQUFBLGtCQUFHO0FBQ1AsYUFBTyxvQkFBQyxjQUFjLGVBQUssSUFBSSxDQUFDLEtBQUs7QUFDbkMsYUFBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxBQUFDO0FBQ3hCLGdCQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsQUFBQztTQUN4QixDQUFDO0tBQ0o7R0FDRixDQUFDLENBQUM7O0FBRUgsU0FBTyxTQUFTLENBQUM7Q0FDbEI7Ozs7Ozs7Ozs7SUNyRE0sS0FBSywyQkFBTSxPQUFPOztBQUV6QixJQUFNLFFBQVEsR0FBRyxVQUFDLFNBQVMsRUFBSzs7QUFFOUIsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7O0FBRWpDLFVBQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUM7O0FBRS9CLFVBQU0sRUFBQSxrQkFBRztBQUNQLGFBQU8sb0JBQUMsU0FBUyxFQUFLLElBQUksQ0FBQyxLQUFLLENBQUcsQ0FBQztLQUNyQztHQUNGLENBQUMsQ0FBQzs7QUFFSCxTQUFPLFFBQVEsQ0FBQztDQUNqQixDQUFDOztpQkFFYSxRQUFROzs7Ozs7OztBQ2hCdkIsSUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQy9CLElBQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUM5QixJQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7Ozs7O0FBSzNDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7O0FBRWpDLFNBQU8sRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDOzs7OztBQUtoQixjQUFVLEVBQUUsVUFBVTtHQUN2QixFQUNDLFVBQVUsQ0FDWDs7QUFFRCxXQUFTLEVBQUEsbUJBQUMsSUFBSSxFQUFFO0FBQ2QsUUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRTtBQUN4QixhQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ25DO0FBQ0QsUUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDNUUsUUFBSSxjQUFjLEVBQUU7QUFDbEIsYUFBTyxjQUFjLENBQUM7S0FDdkI7QUFDRCxXQUFPLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDO0dBQy9DOztBQUVELFFBQU0sRUFBQSxrQkFBRztBQUNQLFFBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUU7QUFDMUQsVUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQztBQUNwRSxhQUFPLEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDdkQ7QUFDRCxVQUFNLElBQUksS0FBSyxDQUFDLCtEQUErRCxDQUFDLENBQUM7R0FDbEY7O0NBRUYsQ0FBQyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN0Q0gsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDOztBQUVYLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDL0MsQ0FBQyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7Ozs7O0FBS2xDLENBQUMsQ0FBQyxPQUFPLEdBQUcsVUFBQyxNQUFNO1NBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQztDQUFBLENBQUM7O0FBRXBELENBQUMsQ0FBQyxRQUFRLEdBQUcsVUFBQSxLQUFLO1NBQUksT0FBTyxLQUFLLEtBQUssUUFBUTtDQUFBLENBQUM7QUFDaEQsQ0FBQyxDQUFDLFdBQVcsR0FBRyxVQUFBLEtBQUs7U0FBSSxPQUFPLEtBQUssS0FBSyxXQUFXO0NBQUEsQ0FBQztBQUN0RCxDQUFDLENBQUMsUUFBUSxHQUFHLFVBQUEsS0FBSztTQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVE7Q0FBQSxDQUFDO0FBQ2hELENBQUMsQ0FBQyxPQUFPLEdBQUcsVUFBQSxLQUFLO1NBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLGdCQUFnQjtDQUFBLENBQUM7QUFDaEYsQ0FBQyxDQUFDLFFBQVEsR0FBRyxVQUFBLEtBQUs7U0FBSSxPQUFPLEtBQUssS0FBSyxRQUFRO0NBQUEsQ0FBQztBQUNoRCxDQUFDLENBQUMsU0FBUyxHQUFHLFVBQUEsS0FBSztTQUFJLE9BQU8sS0FBSyxLQUFLLFNBQVM7Q0FBQSxDQUFDO0FBQ2xELENBQUMsQ0FBQyxNQUFNLEdBQUcsVUFBQSxLQUFLO1NBQUksS0FBSyxLQUFLLElBQUk7Q0FBQSxDQUFDO0FBQ25DLENBQUMsQ0FBQyxVQUFVLEdBQUcsVUFBQSxLQUFLO1NBQUksT0FBTyxLQUFLLEtBQUssVUFBVTtDQUFBLENBQUM7O0FBRXBELENBQUMsQ0FBQyxLQUFLLEdBQUcsVUFBQSxLQUFLLEVBQUk7QUFDakIsTUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDdEIsV0FBTyxLQUFLLENBQUM7R0FDZDtBQUNELFNBQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7Q0FDL0QsQ0FBQzs7QUFFRixDQUFDLENBQUMsSUFBSSxHQUFHLFVBQUMsS0FBSyxFQUFFLE1BQU0sRUFBSztBQUMxQixPQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNyQyxRQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUNwQixhQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNqQjtHQUNGO0FBQ0QsU0FBTyxLQUFLLENBQUMsQ0FBQztDQUNmLENBQUM7O0FBRUYsQ0FBQyxDQUFDLEtBQUssR0FBRyxVQUFDLEtBQUssRUFBRSxNQUFNLEVBQUs7QUFDM0IsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDckMsUUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUNyQixhQUFPLEtBQUssQ0FBQztLQUNkO0dBQ0Y7QUFDRCxTQUFPLElBQUksQ0FBQztDQUNiLENBQUM7O0FBRUYsQ0FBQyxDQUFDLElBQUksR0FBRyxVQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUs7QUFDM0IsUUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQSxHQUFHLEVBQUk7QUFDOUIsYUFBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztHQUMxQixDQUFDLENBQUM7Q0FDSixDQUFDOztBQUVGLENBQUMsQ0FBQyxNQUFNLEdBQUcsVUFBQyxLQUFLLEVBQUs7QUFDcEIsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDOztBQUVmLE9BQUssQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJLEVBQUk7QUFDcEIsT0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUN4QixDQUFDLENBQUM7O0FBRUgsU0FBTyxHQUFHLENBQUM7Q0FDWixDQUFDOztBQUVGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDOzs7QUM1RG5CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vICMgaW5kZXhcblxuLy8gRXhwb3J0IHRoZSBGb3JtYXRpYyBSZWFjdCBjbGFzcyBhdCB0aGUgdG9wIGxldmVsLlxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9mb3JtYXRpYycpO1xuIiwiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB1IGZyb20gJy4uLy4uL3VuZGFzaCc7XG5cbmNvbnN0IE9iamVjdENvbnRhaW5lciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBwcm9wVHlwZXM6IHtcbiAgICB2YWx1ZTogUmVhY3QuUHJvcFR5cGVzLm9iamVjdCxcbiAgICBvbkNoYW5nZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBjb21wb25lbnRzOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWRcbiAgfSxcblxuICB2YWx1ZSgpIHtcbiAgICBjb25zdCB7dmFsdWV9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAodS5pc1VuZGVmaW5lZCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9LFxuXG4gIG9uQ2hhbmdlQ2hpbGQobmV3Q2hpbGRWYWx1ZSwgaW5mbykge1xuICAgIGNvbnN0IGtleSA9IGluZm8ucGF0aFswXTtcbiAgICBjb25zdCBuZXdWYWx1ZSA9IHUuZXh0ZW5kKHt9LCB0aGlzLnZhbHVlKCksIHtcbiAgICAgIFtrZXldOiBuZXdDaGlsZFZhbHVlXG4gICAgfSk7XG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSwgaW5mbyk7XG4gIH0sXG5cbiAgY2hpbGRDb250ZXh0VHlwZXM6IHtcbiAgICBvbkNoYW5nZUNoaWxkOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIGNvbXBvbmVudHM6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZFxuICB9LFxuXG4gIGdldENoaWxkQ29udGV4dCgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgb25DaGFuZ2VDaGlsZDogdGhpcy5vbkNoYW5nZUNoaWxkLFxuICAgICAgY29tcG9uZW50czogdGhpcy5wcm9wcy5jb21wb25lbnRzXG4gICAgfTtcbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgY29uc3Qge2NoaWxkcmVufSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKHUuaXNGdW5jdGlvbihjaGlsZHJlbikpIHtcbiAgICAgIHJldHVybiBjaGlsZHJlbih0aGlzLmdldENoaWxkQ29udGV4dCgpKTtcbiAgICB9XG4gICAgcmV0dXJuIGNoaWxkcmVuO1xuICB9XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgT2JqZWN0Q29udGFpbmVyO1xuIiwiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuY29uc3QgY3JlYXRlRmllbGQgPSAoSW5wdXQsIHtuYW1lfSA9IHt9KSA9PiB7XG5cbiAgaWYgKCFuYW1lKSB7XG4gICAgaWYgKElucHV0LmRpc3BsYXlOYW1lLmluZGV4T2YoJ0lucHV0JykgPiAwKSB7XG4gICAgICBuYW1lID0gSW5wdXQuZGlzcGxheU5hbWUuc3Vic3RyaW5nKDAsIElucHV0LmRpc3BsYXlOYW1lLmluZGV4T2YoJ0lucHV0JykpO1xuICAgIH1cbiAgfVxuXG4gIGlmICghbmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcignRmllbGQgcmVxdWlyZXMgYSBkaXNwbGF5TmFtZS4nKTtcbiAgfVxuXG4gIGNvbnN0IEZpZWxkSW5wdXQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogbmFtZSxcblxuICAgIHByb3BUeXBlczoge1xuICAgICAgY29tcG9uZW50czogUmVhY3QuUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkXG4gICAgfSxcblxuICAgIHJlbmRlcigpIHtcblxuICAgICAgY29uc3Qge0ZpZWxkfSA9IHRoaXMucHJvcHMuY29tcG9uZW50cztcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPEZpZWxkIHsuLi50aGlzLnByb3BzfT5cbiAgICAgICAgICA8SW5wdXQgey4uLnRoaXMucHJvcHN9Lz5cbiAgICAgICAgPC9GaWVsZD5cbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gRmllbGRJbnB1dDtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNyZWF0ZUZpZWxkO1xuIiwiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuY29uc3QgRmllbGQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgcHJvcFR5cGVzOiB7XG4gICAgY29tcG9uZW50czogUmVhY3QuUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkXG4gIH0sXG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHtMYWJlbCwgSGVscH0gPSB0aGlzLnByb3BzLmNvbXBvbmVudHM7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdj5cbiAgICAgICAgPExhYmVsIHsuLi50aGlzLnByb3BzfS8+XG4gICAgICAgIDxIZWxwIHsuLi50aGlzLnByb3BzfS8+XG4gICAgICAgIHt0aGlzLnByb3BzLmNoaWxkcmVufVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IEZpZWxkO1xuIiwiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuY29uc3QgSGVscCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICByZW5kZXIoKSB7XG4gICAgY29uc3Qge2hlbHB9ID0gdGhpcy5wcm9wcztcblxuICAgIHJldHVybiAhaGVscCA/IG51bGwgOiAoXG4gICAgICA8ZGl2PlxuICAgICAgICB7aGVscH1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBIZWxwO1xuIiwiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuY29uc3QgTGFiZWwgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHtsYWJlbCA9ICcnfSA9IHRoaXMucHJvcHM7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdj5cbiAgICAgICAge2xhYmVsfVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IExhYmVsO1xuIiwiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuaW1wb3J0IHUgZnJvbSAnLi4vdW5kYXNoJztcbmltcG9ydCB3cmFwSW5wdXQgZnJvbSAnLi93cmFwLWlucHV0JztcbmltcG9ydCB3cmFwUHVyZSBmcm9tICcuL3dyYXAtcHVyZSc7XG5pbXBvcnQgd3JhcENoaWxkSW5wdXQgZnJvbSAnLi93cmFwLWNoaWxkLWlucHV0JztcbmltcG9ydCBjcmVhdGVGaWVsZCBmcm9tICcuL2NyZWF0ZS1maWVsZCc7XG5pbXBvcnQgdXNlQ29udGV4dCBmcm9tICcuL3VzZS1jb250ZXh0JztcblxuaW1wb3J0IFN0cmluZ0lucHV0IGZyb20gJy4vaW5wdXRzL3N0cmluZyc7XG5cbmltcG9ydCBPYmplY3RDb250YWluZXIgZnJvbSAnLi9jb250YWluZXJzL29iamVjdCc7XG5cbmltcG9ydCBGaWVsZCBmcm9tICcuL2hlbHBlcnMvZmllbGQnO1xuaW1wb3J0IEhlbHAgZnJvbSAnLi9oZWxwZXJzL2hlbHAnO1xuaW1wb3J0IExhYmVsIGZyb20gJy4vaGVscGVycy9sYWJlbCc7XG5cbmNvbnN0IHJhd0lucHV0Q29tcG9uZW50cyA9IHtcbiAgU3RyaW5nSW5wdXRcbn07XG5cbmNvbnN0IGNvbXBvbmVudHMgPSB7XG4gIFdpdGhDb250ZXh0OiB7fVxufTtcblxuY29uc3QgdXNlQ29udGV4dFBhcmFtID0ge1xuICBjb250ZXh0VHlwZXM6IHtcbiAgICBvbkNoYW5nZUNoaWxkOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIGNvbXBvbmVudHM6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZFxuICB9LFxuICBjb250ZXh0VG9Qcm9wczoge29uQ2hhbmdlQ2hpbGQ6ICdvbkNoYW5nZScsIGNvbXBvbmVudHM6ICdjb21wb25lbnRzJ31cbn07XG5cbk9iamVjdC5rZXlzKHJhd0lucHV0Q29tcG9uZW50cykuZm9yRWFjaChrZXkgPT4ge1xuICBjb25zdCBSYXdJbnB1dENvbXBvbmVudCA9IHJhd0lucHV0Q29tcG9uZW50c1trZXldO1xuICBjb25zdCBQdXJlQ29tcG9uZW50ID0gd3JhcFB1cmUoUmF3SW5wdXRDb21wb25lbnQpO1xuICBQdXJlQ29tcG9uZW50Lmhhc0V2ZW50ID0gUmF3SW5wdXRDb21wb25lbnQuaGFzRXZlbnQ7XG4gIGNvbnN0IElucHV0Q29tcG9uZW50ID0gd3JhcElucHV0KFB1cmVDb21wb25lbnQpO1xuICBjb21wb25lbnRzW2tleV0gPSBJbnB1dENvbXBvbmVudDtcbiAgY29uc3QgQ2hpbGRJbnB1dENvbXBvbmVudCA9IHdyYXBDaGlsZElucHV0KElucHV0Q29tcG9uZW50KTtcbiAgY29tcG9uZW50c1tgQ2hpbGQke2tleX1gXSA9IENoaWxkSW5wdXRDb21wb25lbnQ7XG4gIGNvbXBvbmVudHMuV2l0aENvbnRleHRbYENoaWxkJHtrZXl9YF0gPSB1c2VDb250ZXh0KENoaWxkSW5wdXRDb21wb25lbnQsIHVzZUNvbnRleHRQYXJhbSk7XG59KTtcblxuY29uc3QgaW5wdXRUeXBlcyA9IFsnU3RyaW5nJ107XG5cbmlucHV0VHlwZXMuZm9yRWFjaChpbnB1dFR5cGUgPT4ge1xuICBjb25zdCBJbnB1dENvbXBvbmVudCA9IGNvbXBvbmVudHNbYCR7aW5wdXRUeXBlfUlucHV0YF07XG4gIGNvbnN0IEZpZWxkQ29tcG9uZW50ID0gY3JlYXRlRmllbGQoSW5wdXRDb21wb25lbnQpO1xuICBjb21wb25lbnRzW2Ake2lucHV0VHlwZX1GaWVsZGBdID0gRmllbGRDb21wb25lbnQ7XG4gIGNvbnN0IENoaWxkRmllbGRDb21wb25lbnQgPSB3cmFwQ2hpbGRJbnB1dChGaWVsZENvbXBvbmVudCk7XG4gIGNvbXBvbmVudHNbYENoaWxkJHtpbnB1dFR5cGV9RmllbGRgXSA9IENoaWxkRmllbGRDb21wb25lbnQ7XG4gIGNvbXBvbmVudHMuV2l0aENvbnRleHRbYENoaWxkJHtpbnB1dFR5cGV9RmllbGRgXSA9IHVzZUNvbnRleHQoQ2hpbGRGaWVsZENvbXBvbmVudCwgdXNlQ29udGV4dFBhcmFtKTtcbn0pO1xuXG5jb25zb2xlLmxvZyhjb21wb25lbnRzKTtcblxudS5leHRlbmQoY29tcG9uZW50cywge1xuICBPYmplY3RDb250YWluZXIsXG4gIEZpZWxkLFxuICBIZWxwLFxuICBMYWJlbFxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IGNvbXBvbmVudHM7XG4iLCJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5jb25zdCBTdHJpbmdJbnB1dCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBzdGF0aWNzOiB7XG4gICAgaGFzRXZlbnQ6IHRydWVcbiAgfSxcblxuICBwcm9wVHlwZXM6IHtcbiAgICB2YWx1ZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIG9uQ2hhbmdlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkXG4gIH0sXG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHt2YWx1ZSwgb25DaGFuZ2UsIG9uRm9jdXMsIG9uQmx1cn0gPSB0aGlzLnByb3BzO1xuICAgIHJldHVybiA8dGV4dGFyZWEgdmFsdWU9e3ZhbHVlfSBvbkNoYW5nZT17b25DaGFuZ2V9IG9uRm9jdXM9e29uRm9jdXN9IG9uQmx1cj17b25CbHVyfS8+O1xuICB9XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgU3RyaW5nSW5wdXQ7XG4iLCJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHUgZnJvbSAnLi4vdW5kYXNoJztcblxuY29uc3QgdXNlQ29udGV4dCA9IChDb21wb25lbnQsIHtjb250ZXh0VHlwZXMgPSB7fSwgY29udGV4dFRvUHJvcHMgPSB7fX0gPSB7fSkgPT4ge1xuXG4gIGNvbnN0IFVzZUNvbnRleHQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBjb250ZXh0VHlwZXMsXG5cbiAgICBwcm9wc0Zyb21Db250ZXh0KCkge1xuICAgICAgY29uc3QgcGFpcnMgPSBPYmplY3Qua2V5cyhjb250ZXh0VG9Qcm9wcykubWFwKGNvbnRleHRLZXkgPT4ge1xuICAgICAgICBjb25zdCBwcm9wS2V5ID0gY29udGV4dFRvUHJvcHNbY29udGV4dEtleV07XG4gICAgICAgIHJldHVybiBbcHJvcEtleSwgdGhpcy5jb250ZXh0W2NvbnRleHRLZXldXTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHUub2JqZWN0KHBhaXJzKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgcmV0dXJuIDxDb21wb25lbnQgey4uLnRoaXMucHJvcHN9IHsuLi50aGlzLnByb3BzRnJvbUNvbnRleHQoKX0vPjtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBVc2VDb250ZXh0O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgdXNlQ29udGV4dDtcbiIsImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgdSBmcm9tICcuLi91bmRhc2gnO1xuXG5jb25zdCB3cmFwQ2hpbGRJbnB1dCA9IChJbnB1dCwge2RlZmF1bHRWYWx1ZSA9ICcnfSA9IHt9KSA9PiB7XG5cbiAgY29uc3QgV3JhcENoaWxkSW5wdXQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBtaXhpbnM6IFtSZWFjdC5QdXJlUmVuZGVyTWl4aW5dLFxuXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICBwYXJlbnRWYWx1ZTogUmVhY3QuUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgICAgY2hpbGRLZXk6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICAgIG9uQ2hhbmdlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkXG4gICAgfSxcblxuICAgIGNoaWxkVmFsdWUoKSB7XG4gICAgICBjb25zdCB7cGFyZW50VmFsdWUsIGNoaWxkS2V5fSA9IHRoaXMucHJvcHM7XG4gICAgICBjb25zdCBjaGlsZFZhbHVlID0gcGFyZW50VmFsdWVbY2hpbGRLZXldO1xuICAgICAgaWYgKHUuaXNVbmRlZmluZWQoY2hpbGRWYWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjaGlsZFZhbHVlO1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZShuZXdWYWx1ZSkge1xuICAgICAgY29uc3Qge29uQ2hhbmdlLCBjaGlsZEtleX0gPSB0aGlzLnByb3BzO1xuICAgICAgb25DaGFuZ2UobmV3VmFsdWUsIHtcbiAgICAgICAgcGF0aDogW2NoaWxkS2V5XVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJlbmRlcigpIHtcbiAgICAgIGNvbnN0IHtjaGlsZFZhbHVlLCBvbkNoYW5nZX0gPSB0aGlzO1xuICAgICAgY29uc3QgdmFsdWUgPSBjaGlsZFZhbHVlKCk7XG4gICAgICByZXR1cm4gPElucHV0IHsuLi50aGlzLnByb3BzfSB2YWx1ZT17dmFsdWV9IG9uQ2hhbmdlPXtvbkNoYW5nZX0vPjtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBXcmFwQ2hpbGRJbnB1dDtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHdyYXBDaGlsZElucHV0O1xuIiwiY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuY29uc3QgdSA9IHJlcXVpcmUoJy4uL3VuZGFzaCcpO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB3cmFwSW5wdXQoSW5wdXRDb21wb25lbnQpIHtcblxuICBjb25zdCBXcmFwSW5wdXQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBtaXhpbnM6IFtSZWFjdC5QdXJlUmVuZGVyTWl4aW5dLFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaXNDb250cm9sbGVkOiAhdS5pc1VuZGVmaW5lZCh0aGlzLnByb3BzLnZhbHVlKSxcbiAgICAgICAgdmFsdWU6IHUuaXNVbmRlZmluZWQodGhpcy5wcm9wcy52YWx1ZSkgPyB0aGlzLnByb3BzLmRlZmF1bHRWYWx1ZSA6IHRoaXMucHJvcHMudmFsdWVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMgKG5ld1Byb3BzKSB7XG4gICAgICBpZiAodGhpcy5zdGF0ZS5pc0NvbnRyb2xsZWQpIHtcbiAgICAgICAgaWYgKCF1LmlzVW5kZWZpbmVkKG5ld1Byb3BzLnZhbHVlKSkge1xuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgdmFsdWU6IG5ld1Byb3BzLnZhbHVlXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgb25DaGFuZ2UgKG5ld1ZhbHVlLCBpbmZvKSB7XG5cbiAgICAgIGlmIChJbnB1dENvbXBvbmVudC5oYXNFdmVudCkge1xuICAgICAgICBjb25zdCBldmVudCA9IG5ld1ZhbHVlO1xuICAgICAgICBuZXdWYWx1ZSA9IGV2ZW50LnRhcmdldC52YWx1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLnN0YXRlLmlzQ29udHJvbGxlZCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICB2YWx1ZTogbmV3VmFsdWVcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMucHJvcHMub25DaGFuZ2UpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSwgaW5mbyk7XG4gICAgfSxcblxuICAgIHJlbmRlcigpIHtcbiAgICAgIHJldHVybiA8SW5wdXRDb21wb25lbnQgey4uLnRoaXMucHJvcHN9XG4gICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLnZhbHVlfVxuICAgICAgICBvbkNoYW5nZT17dGhpcy5vbkNoYW5nZX1cbiAgICAgIC8+O1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIFdyYXBJbnB1dDtcbn1cbiIsImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmNvbnN0IHdyYXBQdXJlID0gKENvbXBvbmVudCkgPT4ge1xuXG4gIGNvbnN0IFdyYXBQdXJlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgbWl4aW5zOiBbUmVhY3QuUHVyZVJlbmRlck1peGluXSxcblxuICAgIHJlbmRlcigpIHtcbiAgICAgIHJldHVybiA8Q29tcG9uZW50IHsuLi50aGlzLnByb3BzfS8+O1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIFdyYXBQdXJlO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgd3JhcFB1cmU7XG4iLCJjb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5jb25zdCBfID0gcmVxdWlyZSgnLi91bmRhc2gnKTtcbmNvbnN0IENvbXBvbmVudHMgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMnKTtcbi8vY29uc3QgQ29tcG9uZW50Q29udGFpbmVyID0gcmVxdWlyZSgnLi9jb21wb25lbnQtY29udGFpbmVyJyk7XG5cbi8vQ29tcG9uZW50Q29udGFpbmVyLnNldENvbXBvbmVudHMoQ29tcG9uZW50cyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIHN0YXRpY3M6IF8uZXh0ZW5kKHtcbiAgICAvL3dyYXA6IHJlcXVpcmUoJy4vY29tcG9uZW50cy93cmFwLWNvbXBvbmVudCcpXG4gICAgLy9maWVsZDogcmVxdWlyZSgnLi9jb21wb25lbnRzL3dyYXAtZmllbGQnKSxcbiAgICAvL2hlbHBlcjogcmVxdWlyZSgnLi9jb21wb25lbnRzL3dyYXAtaGVscGVyJylcbiAgICAvL0NvbXBvbmVudENvbnRhaW5lcjogcmVxdWlyZSgnLi9jb21wb25lbnRzL2NvbnRhaW5lcnMvY29tcG9uZW50JylcbiAgICBjb21wb25lbnRzOiBDb21wb25lbnRzXG4gIH0sXG4gICAgQ29tcG9uZW50c1xuICApLFxuXG4gIGNvbXBvbmVudChuYW1lKSB7XG4gICAgaWYgKHRoaXMucHJvcHMuY29tcG9uZW50KSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wcy5jb21wb25lbnQobmFtZSk7XG4gICAgfVxuICAgIGNvbnN0IGNvbXBvbmVudENsYXNzID0gdGhpcy5wcm9wcy5jb21wb25lbnRzICYmIHRoaXMucHJvcHMuY29tcG9uZW50c1tuYW1lXTtcbiAgICBpZiAoY29tcG9uZW50Q2xhc3MpIHtcbiAgICAgIHJldHVybiBjb21wb25lbnRDbGFzcztcbiAgICB9XG4gICAgcmV0dXJuIENvbXBvbmVudHNbbmFtZV0gfHwgQ29tcG9uZW50cy5Vbmtub3duO1xuICB9LFxuXG4gIHJlbmRlcigpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5jaGlsZHJlbiAmJiAhXy5pc0FycmF5KHRoaXMucHJvcHMuY2hpbGRyZW4pKSB7XG4gICAgICBjb25zdCBwcm9wcyA9IF8uZXh0ZW5kKHt9LCB0aGlzLnByb3BzLCB7Y29tcG9uZW50OiB0aGlzLmNvbXBvbmVudH0pO1xuICAgICAgcmV0dXJuIFJlYWN0LmNsb25lRWxlbWVudCh0aGlzLnByb3BzLmNoaWxkcmVuLCBwcm9wcyk7XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcignWW91IG11c3QgcHJvdmlkZSBleGFjdGx5IG9uZSBjaGlsZCB0byB0aGUgRm9ybWF0aWMgY29tcG9uZW50LicpO1xuICB9XG5cbn0pO1xuXG5cbi8vIC8vICMgZm9ybWF0aWNcbi8vXG4vLyAvKlxuLy8gVGhlIHJvb3QgZm9ybWF0aWMgY29tcG9uZW50LlxuLy9cbi8vIFRoZSByb290IGZvcm1hdGljIGNvbXBvbmVudCBpcyBhY3R1YWxseSB0d28gY29tcG9uZW50cy4gVGhlIG1haW4gY29tcG9uZW50IGlzXG4vLyBhIGNvbnRyb2xsZWQgY29tcG9uZW50IHdoZXJlIHlvdSBtdXN0IHBhc3MgdGhlIHZhbHVlIGluIHdpdGggZWFjaCByZW5kZXIuIFRoaXNcbi8vIGlzIGFjdHVhbGx5IHdyYXBwZWQgaW4gYW5vdGhlciBjb21wb25lbnQgd2hpY2ggYWxsb3dzIHlvdSB0byB1c2UgZm9ybWF0aWMgYXNcbi8vIGFuIHVuY29udHJvbGxlZCBjb21wb25lbnQgd2hlcmUgaXQgcmV0YWlucyB0aGUgc3RhdGUgb2YgdGhlIHZhbHVlLiBUaGUgd3JhcHBlclxuLy8gaXMgd2hhdCBpcyBhY3R1YWxseSBleHBvcnRlZC5cbi8vICovXG4vL1xuLy8gJ3VzZSBzdHJpY3QnO1xuLy9cbi8vIHZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuLy8gdmFyIF8gPSByZXF1aXJlKCcuL3VuZGFzaCcpO1xuLy9cbi8vIHZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbi8vXG4vLyB2YXIgZGVmYXVsdENvbmZpZ1BsdWdpbiA9IHJlcXVpcmUoJy4vZGVmYXVsdC1jb25maWcnKTtcbi8vXG4vLyB2YXIgY3JlYXRlQ29uZmlnID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbi8vICAgdmFyIHBsdWdpbnMgPSBbZGVmYXVsdENvbmZpZ1BsdWdpbl0uY29uY2F0KGFyZ3MpO1xuLy9cbi8vICAgcmV0dXJuIHBsdWdpbnMucmVkdWNlKGZ1bmN0aW9uIChjb25maWcsIHBsdWdpbikge1xuLy8gICAgIGlmIChfLmlzRnVuY3Rpb24ocGx1Z2luKSkge1xuLy8gICAgICAgdmFyIGV4dGVuc2lvbnMgPSBwbHVnaW4oY29uZmlnKTtcbi8vICAgICAgIGlmIChleHRlbnNpb25zKSB7XG4vLyAgICAgICAgIF8uZXh0ZW5kKGNvbmZpZywgZXh0ZW5zaW9ucyk7XG4vLyAgICAgICB9XG4vLyAgICAgfSBlbHNlIHtcbi8vICAgICAgIF8uZXh0ZW5kKGNvbmZpZywgcGx1Z2luKTtcbi8vICAgICB9XG4vL1xuLy8gICAgIHJldHVybiBjb25maWc7XG4vLyAgIH0sIHt9KTtcbi8vIH07XG4vL1xuLy8gdmFyIGRlZmF1bHRDb25maWcgPSBjcmVhdGVDb25maWcoKTtcbi8vXG4vLyAvLyBUaGUgbWFpbiBmb3JtYXRpYyBjb21wb25lbnQgdGhhdCByZW5kZXJzIHRoZSBmb3JtLlxuLy8gdmFyIEZvcm1hdGljQ29udHJvbGxlZENsYXNzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuLy9cbi8vICAgZGlzcGxheU5hbWU6ICdGb3JtYXRpY0NvbnRyb2xsZWQnLFxuLy9cbi8vICAgLy8gUmVzcG9uZCB0byBhbnkgdmFsdWUgY2hhbmdlcy5cbi8vICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgaW5mbykge1xuLy8gICAgIGlmICghdGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuLy8gICAgICAgcmV0dXJuO1xuLy8gICAgIH1cbi8vICAgICBpbmZvID0gXy5leHRlbmQoe30sIGluZm8pO1xuLy8gICAgIGluZm8ucGF0aCA9IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkVmFsdWVQYXRoKGluZm8uZmllbGQpO1xuLy8gICAgIHRoaXMucHJvcHMub25DaGFuZ2UobmV3VmFsdWUsIGluZm8pO1xuLy8gICB9LFxuLy9cbi8vICAgLy8gUmVzcG9uZCB0byBhbnkgYWN0aW9ucyBvdGhlciB0aGFuIHZhbHVlIGNoYW5nZXMuIChGb3IgZXhhbXBsZSwgZm9jdXMgYW5kXG4vLyAgIC8vIGJsdXIuKVxuLy8gICBvbkFjdGlvbjogZnVuY3Rpb24gKGluZm8pIHtcbi8vICAgICBpZiAoIXRoaXMucHJvcHMub25BY3Rpb24pIHtcbi8vICAgICAgIHJldHVybjtcbi8vICAgICB9XG4vLyAgICAgaW5mbyA9IF8uZXh0ZW5kKHt9LCBpbmZvKTtcbi8vICAgICBpbmZvLnBhdGggPSB0aGlzLnByb3BzLmNvbmZpZy5maWVsZFZhbHVlUGF0aChpbmZvLmZpZWxkKTtcbi8vICAgICB0aGlzLnByb3BzLm9uQWN0aW9uKGluZm8pO1xuLy8gICB9LFxuLy9cbi8vICAgLy8gUmVuZGVyIHRoZSByb290IGNvbXBvbmVudCBieSBkZWxlZ2F0aW5nIHRvIHRoZSBjb25maWcuXG4vLyAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuLy9cbi8vICAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4vL1xuLy8gICAgIHJldHVybiBjb25maWcucmVuZGVyRm9ybWF0aWNDb21wb25lbnQodGhpcyk7XG4vLyAgIH1cbi8vIH0pO1xuLy9cbi8vIHZhciBGb3JtYXRpY0NvbnRyb2xsZWQgPSBSZWFjdC5jcmVhdGVGYWN0b3J5KEZvcm1hdGljQ29udHJvbGxlZENsYXNzKTtcbi8vXG4vLyAvLyBBIHdyYXBwZXIgY29tcG9uZW50IHRoYXQgaXMgYWN0dWFsbHkgZXhwb3J0ZWQgYW5kIGNhbiBhbGxvdyBmb3JtYXRpYyB0byBiZVxuLy8gLy8gdXNlZCBpbiBhbiBcInVuY29udHJvbGxlZFwiIG1hbm5lci4gKFNlZSB1bmNvbnRyb2xsZWQgY29tcG9uZW50cyBpbiB0aGUgUmVhY3Rcbi8vIC8vIGRvY3VtZW50YXRpb24gZm9yIGFuIGV4cGxhbmF0aW9uIG9mIHRoZSBkaWZmZXJlbmNlLilcbi8vIG1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuLy9cbi8vICAgLy8gRXhwb3J0IHNvbWUgc3R1ZmYgYXMgc3RhdGljcy5cbi8vICAgc3RhdGljczoge1xuLy8gICAgIGNyZWF0ZUNvbmZpZzogY3JlYXRlQ29uZmlnLFxuLy8gICAgIGF2YWlsYWJsZU1peGluczoge1xuLy8gICAgICAgY2xpY2tPdXRzaWRlOiByZXF1aXJlKCcuL21peGlucy9jbGljay1vdXRzaWRlLmpzJyksXG4vLyAgICAgICBmaWVsZDogcmVxdWlyZSgnLi9taXhpbnMvZmllbGQuanMnKSxcbi8vICAgICAgIGhlbHBlcjogcmVxdWlyZSgnLi9taXhpbnMvaGVscGVyLmpzJyksXG4vLyAgICAgICByZXNpemU6IHJlcXVpcmUoJy4vbWl4aW5zL3Jlc2l6ZS5qcycpLFxuLy8gICAgICAgc2Nyb2xsOiByZXF1aXJlKCcuL21peGlucy9zY3JvbGwuanMnKSxcbi8vICAgICAgIHVuZG9TdGFjazogcmVxdWlyZSgnLi9taXhpbnMvdW5kby1zdGFjay5qcycpXG4vLyAgICAgfSxcbi8vICAgICBwbHVnaW5zOiB7XG4vLyAgICAgICBib290c3RyYXA6IHJlcXVpcmUoJy4vcGx1Z2lucy9ib290c3RyYXAnKSxcbi8vICAgICAgIG1ldGE6IHJlcXVpcmUoJy4vcGx1Z2lucy9tZXRhJyksXG4vLyAgICAgICByZWZlcmVuY2U6IHJlcXVpcmUoJy4vcGx1Z2lucy9yZWZlcmVuY2UnKSxcbi8vICAgICAgIGVsZW1lbnRDbGFzc2VzOiByZXF1aXJlKCcuL3BsdWdpbnMvZWxlbWVudC1jbGFzc2VzJylcbi8vICAgICB9LFxuLy8gICAgIHV0aWxzOiB1dGlsc1xuLy8gICB9LFxuLy9cbi8vICAgZGlzcGxheU5hbWU6ICdGb3JtYXRpYycsXG4vL1xuLy8gICAvLyBJZiB3ZSBnb3QgYSB2YWx1ZSwgdHJlYXQgdGhpcyBjb21wb25lbnQgYXMgY29udHJvbGxlZC4gRWl0aGVyIHdheSwgcmV0YWluXG4vLyAgIC8vIHRoZSB2YWx1ZSBpbiB0aGUgc3RhdGUuXG4vLyAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuLy8gICAgIHJldHVybiB7XG4vLyAgICAgICBpc0NvbnRyb2xsZWQ6ICFfLmlzVW5kZWZpbmVkKHRoaXMucHJvcHMudmFsdWUpLFxuLy8gICAgICAgdmFsdWU6IF8uaXNVbmRlZmluZWQodGhpcy5wcm9wcy52YWx1ZSkgPyB0aGlzLnByb3BzLmRlZmF1bHRWYWx1ZSA6IHRoaXMucHJvcHMudmFsdWVcbi8vICAgICB9O1xuLy8gICB9LFxuLy9cbi8vICAgLy8gSWYgdGhpcyBpcyBhIGNvbnRyb2xsZWQgY29tcG9uZW50LCBjaGFuZ2Ugb3VyIHN0YXRlIHRvIHJlZmxlY3QgdGhlIG5ld1xuLy8gICAvLyB2YWx1ZS4gRm9yIHVuY29udHJvbGxlZCBjb21wb25lbnRzLCBpZ25vcmUgYW55IHZhbHVlIGNoYW5nZXMuXG4vLyAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXdQcm9wcykge1xuLy8gICAgIGlmICh0aGlzLnN0YXRlLmlzQ29udHJvbGxlZCkge1xuLy8gICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKG5ld1Byb3BzLnZhbHVlKSkge1xuLy8gICAgICAgICB0aGlzLnNldFN0YXRlKHtcbi8vICAgICAgICAgICB2YWx1ZTogbmV3UHJvcHMudmFsdWVcbi8vICAgICAgICAgfSk7XG4vLyAgICAgICB9XG4vLyAgICAgfVxuLy8gICB9LFxuLy9cbi8vICAgLy8gSWYgdGhpcyBpcyBhbiB1bmNvbnRyb2xsZWQgY29tcG9uZW50LCBzZXQgb3VyIHN0YXRlIHRvIHJlZmxlY3QgdGhlIG5ld1xuLy8gICAvLyB2YWx1ZS4gRWl0aGVyIHdheSwgY2FsbCB0aGUgb25DaGFuZ2UgY2FsbGJhY2suXG4vLyAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAobmV3VmFsdWUsIGluZm8pIHtcbi8vICAgICBpZiAoIXRoaXMuc3RhdGUuaXNDb250cm9sbGVkKSB7XG4vLyAgICAgICB0aGlzLnNldFN0YXRlKHtcbi8vICAgICAgICAgdmFsdWU6IG5ld1ZhbHVlXG4vLyAgICAgICB9KTtcbi8vICAgICB9XG4vLyAgICAgaWYgKCF0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4vLyAgICAgICByZXR1cm47XG4vLyAgICAgfVxuLy8gICAgIHRoaXMucHJvcHMub25DaGFuZ2UobmV3VmFsdWUsIGluZm8pO1xuLy8gICB9LFxuLy9cbi8vICAgLy8gQW55IGFjdGlvbnMgc2hvdWxkIGJlIHNlbnQgdG8gdGhlIGdlbmVyaWMgb25BY3Rpb24gY2FsbGJhY2sgYnV0IGFsc28gc3BsaXRcbi8vICAgLy8gaW50byBkaXNjcmVldCBjYWxsYmFja3MgcGVyIGFjdGlvbi5cbi8vICAgb25BY3Rpb246IGZ1bmN0aW9uIChpbmZvKSB7XG4vLyAgICAgaWYgKHRoaXMucHJvcHMub25BY3Rpb24pIHtcbi8vICAgICAgIHRoaXMucHJvcHMub25BY3Rpb24oaW5mbyk7XG4vLyAgICAgfVxuLy8gICAgIHZhciBhY3Rpb24gPSB1dGlscy5kYXNoVG9QYXNjYWwoaW5mby5hY3Rpb24pO1xuLy8gICAgIGlmICh0aGlzLnByb3BzWydvbicgKyBhY3Rpb25dKSB7XG4vLyAgICAgICB0aGlzLnByb3BzWydvbicgKyBhY3Rpb25dKGluZm8pO1xuLy8gICAgIH1cbi8vICAgfSxcbi8vXG4vLyAgIC8vIFJlbmRlciB0aGUgd3JhcHBlciBjb21wb25lbnQgKGJ5IGp1c3QgZGVsZWdhdGluZyB0byB0aGUgbWFpbiBjb21wb25lbnQpLlxuLy8gICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbi8vXG4vLyAgICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnIHx8IGRlZmF1bHRDb25maWc7XG4vLyAgICAgdmFyIHZhbHVlID0gdGhpcy5zdGF0ZS52YWx1ZTtcbi8vXG4vLyAgICAgaWYgKHRoaXMuc3RhdGUuaXNDb250cm9sbGVkKSB7XG4vLyAgICAgICBpZiAoIXRoaXMucHJvcHMub25DaGFuZ2UpIHtcbi8vICAgICAgICAgY29uc29sZS5sb2coJ1lvdSBzaG91bGQgc3VwcGx5IGFuIG9uQ2hhbmdlIGhhbmRsZXIgaWYgeW91IHN1cHBseSBhIHZhbHVlLicpO1xuLy8gICAgICAgfVxuLy8gICAgIH1cbi8vXG4vLyAgICAgdmFyIHByb3BzID0ge1xuLy8gICAgICAgY29uZmlnOiBjb25maWcsXG4vLyAgICAgICAvLyBBbGxvdyBmaWVsZCB0ZW1wbGF0ZXMgdG8gYmUgcGFzc2VkIGluIGFzIGBmaWVsZGAgb3IgYGZpZWxkc2AuIEFmdGVyIHRoaXMsIHN0b3Bcbi8vICAgICAgIC8vIGNhbGxpbmcgdGhlbSBmaWVsZHMuXG4vLyAgICAgICBmaWVsZFRlbXBsYXRlOiB0aGlzLnByb3BzLmZpZWxkLFxuLy8gICAgICAgZmllbGRUZW1wbGF0ZXM6IHRoaXMucHJvcHMuZmllbGRzLFxuLy8gICAgICAgdmFsdWU6IHZhbHVlLFxuLy8gICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsXG4vLyAgICAgICBvbkFjdGlvbjogdGhpcy5vbkFjdGlvblxuLy8gICAgIH07XG4vL1xuLy8gICAgIF8uZWFjaCh0aGlzLnByb3BzLCBmdW5jdGlvbiAocHJvcFZhbHVlLCBrZXkpIHtcbi8vICAgICAgIGlmICghKGtleSBpbiBwcm9wcykpIHtcbi8vICAgICAgICAgcHJvcHNba2V5XSA9IHByb3BWYWx1ZTtcbi8vICAgICAgIH1cbi8vICAgICB9KTtcbi8vXG4vLyAgICAgcmV0dXJuIEZvcm1hdGljQ29udHJvbGxlZChwcm9wcyk7XG4vLyAgIH1cbi8vXG4vLyB9KTtcbiIsInZhciBfID0ge307XG5cbl8uYXNzaWduID0gXy5leHRlbmQgPSByZXF1aXJlKCdvYmplY3QtYXNzaWduJyk7XG5fLmlzRXF1YWwgPSByZXF1aXJlKCdkZWVwLWVxdWFsJyk7XG5cbi8vIFRoZXNlIGFyZSBub3QgbmVjZXNzYXJpbHkgY29tcGxldGUgaW1wbGVtZW50YXRpb25zLiBUaGV5J3JlIGp1c3QgZW5vdWdoIGZvclxuLy8gd2hhdCdzIHVzZWQgaW4gZm9ybWF0aWMuXG5cbl8uZmxhdHRlbiA9IChhcnJheXMpID0+IFtdLmNvbmNhdC5hcHBseShbXSwgYXJyYXlzKTtcblxuXy5pc1N0cmluZyA9IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZyc7XG5fLmlzVW5kZWZpbmVkID0gdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJztcbl8uaXNPYmplY3QgPSB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnO1xuXy5pc0FycmF5ID0gdmFsdWUgPT4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbl8uaXNOdW1iZXIgPSB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInO1xuXy5pc0Jvb2xlYW4gPSB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJztcbl8uaXNOdWxsID0gdmFsdWUgPT4gdmFsdWUgPT09IG51bGw7XG5fLmlzRnVuY3Rpb24gPSB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbic7XG5cbl8uY2xvbmUgPSB2YWx1ZSA9PiB7XG4gIGlmICghXy5pc09iamVjdCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIF8uaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZS5zbGljZSgpIDogXy5hc3NpZ24oe30sIHZhbHVlKTtcbn07XG5cbl8uZmluZCA9IChpdGVtcywgdGVzdEZuKSA9PiB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAodGVzdEZuKGl0ZW1zW2ldKSkge1xuICAgICAgcmV0dXJuIGl0ZW1zW2ldO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdm9pZCAwO1xufTtcblxuXy5ldmVyeSA9IChpdGVtcywgdGVzdEZuKSA9PiB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoIXRlc3RGbihpdGVtc1tpXSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5fLmVhY2ggPSAob2JqLCBpdGVyYXRlRm4pID0+IHtcbiAgT2JqZWN0LmtleXMob2JqKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgaXRlcmF0ZUZuKG9ialtrZXldLCBrZXkpO1xuICB9KTtcbn07XG5cbl8ub2JqZWN0ID0gKGFycmF5KSA9PiB7XG4gIGNvbnN0IG9iaiA9IHt9O1xuXG4gIGFycmF5LmZvckVhY2gocGFpciA9PiB7XG4gICAgb2JqW3BhaXJbMF1dID0gcGFpclsxXTtcbiAgfSk7XG5cbiAgcmV0dXJuIG9iajtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gXztcbiIsInZhciBwU2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG52YXIgb2JqZWN0S2V5cyA9IHJlcXVpcmUoJy4vbGliL2tleXMuanMnKTtcbnZhciBpc0FyZ3VtZW50cyA9IHJlcXVpcmUoJy4vbGliL2lzX2FyZ3VtZW50cy5qcycpO1xuXG52YXIgZGVlcEVxdWFsID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYWN0dWFsLCBleHBlY3RlZCwgb3B0cykge1xuICBpZiAoIW9wdHMpIG9wdHMgPSB7fTtcbiAgLy8gNy4xLiBBbGwgaWRlbnRpY2FsIHZhbHVlcyBhcmUgZXF1aXZhbGVudCwgYXMgZGV0ZXJtaW5lZCBieSA9PT0uXG4gIGlmIChhY3R1YWwgPT09IGV4cGVjdGVkKSB7XG4gICAgcmV0dXJuIHRydWU7XG5cbiAgfSBlbHNlIGlmIChhY3R1YWwgaW5zdGFuY2VvZiBEYXRlICYmIGV4cGVjdGVkIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgIHJldHVybiBhY3R1YWwuZ2V0VGltZSgpID09PSBleHBlY3RlZC5nZXRUaW1lKCk7XG5cbiAgLy8gNy4zLiBPdGhlciBwYWlycyB0aGF0IGRvIG5vdCBib3RoIHBhc3MgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnLFxuICAvLyBlcXVpdmFsZW5jZSBpcyBkZXRlcm1pbmVkIGJ5ID09LlxuICB9IGVsc2UgaWYgKHR5cGVvZiBhY3R1YWwgIT0gJ29iamVjdCcgJiYgdHlwZW9mIGV4cGVjdGVkICE9ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIG9wdHMuc3RyaWN0ID8gYWN0dWFsID09PSBleHBlY3RlZCA6IGFjdHVhbCA9PSBleHBlY3RlZDtcblxuICAvLyA3LjQuIEZvciBhbGwgb3RoZXIgT2JqZWN0IHBhaXJzLCBpbmNsdWRpbmcgQXJyYXkgb2JqZWN0cywgZXF1aXZhbGVuY2UgaXNcbiAgLy8gZGV0ZXJtaW5lZCBieSBoYXZpbmcgdGhlIHNhbWUgbnVtYmVyIG9mIG93bmVkIHByb3BlcnRpZXMgKGFzIHZlcmlmaWVkXG4gIC8vIHdpdGggT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKSwgdGhlIHNhbWUgc2V0IG9mIGtleXNcbiAgLy8gKGFsdGhvdWdoIG5vdCBuZWNlc3NhcmlseSB0aGUgc2FtZSBvcmRlciksIGVxdWl2YWxlbnQgdmFsdWVzIGZvciBldmVyeVxuICAvLyBjb3JyZXNwb25kaW5nIGtleSwgYW5kIGFuIGlkZW50aWNhbCAncHJvdG90eXBlJyBwcm9wZXJ0eS4gTm90ZTogdGhpc1xuICAvLyBhY2NvdW50cyBmb3IgYm90aCBuYW1lZCBhbmQgaW5kZXhlZCBwcm9wZXJ0aWVzIG9uIEFycmF5cy5cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gb2JqRXF1aXYoYWN0dWFsLCBleHBlY3RlZCwgb3B0cyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWRPck51bGwodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIGlzQnVmZmVyICh4KSB7XG4gIGlmICgheCB8fCB0eXBlb2YgeCAhPT0gJ29iamVjdCcgfHwgdHlwZW9mIHgubGVuZ3RoICE9PSAnbnVtYmVyJykgcmV0dXJuIGZhbHNlO1xuICBpZiAodHlwZW9mIHguY29weSAhPT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgeC5zbGljZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAoeC5sZW5ndGggPiAwICYmIHR5cGVvZiB4WzBdICE9PSAnbnVtYmVyJykgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gb2JqRXF1aXYoYSwgYiwgb3B0cykge1xuICB2YXIgaSwga2V5O1xuICBpZiAoaXNVbmRlZmluZWRPck51bGwoYSkgfHwgaXNVbmRlZmluZWRPck51bGwoYikpXG4gICAgcmV0dXJuIGZhbHNlO1xuICAvLyBhbiBpZGVudGljYWwgJ3Byb3RvdHlwZScgcHJvcGVydHkuXG4gIGlmIChhLnByb3RvdHlwZSAhPT0gYi5wcm90b3R5cGUpIHJldHVybiBmYWxzZTtcbiAgLy9+fn5JJ3ZlIG1hbmFnZWQgdG8gYnJlYWsgT2JqZWN0LmtleXMgdGhyb3VnaCBzY3Jld3kgYXJndW1lbnRzIHBhc3NpbmcuXG4gIC8vICAgQ29udmVydGluZyB0byBhcnJheSBzb2x2ZXMgdGhlIHByb2JsZW0uXG4gIGlmIChpc0FyZ3VtZW50cyhhKSkge1xuICAgIGlmICghaXNBcmd1bWVudHMoYikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgYSA9IHBTbGljZS5jYWxsKGEpO1xuICAgIGIgPSBwU2xpY2UuY2FsbChiKTtcbiAgICByZXR1cm4gZGVlcEVxdWFsKGEsIGIsIG9wdHMpO1xuICB9XG4gIGlmIChpc0J1ZmZlcihhKSkge1xuICAgIGlmICghaXNCdWZmZXIoYikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGEubGVuZ3RoICE9PSBiLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICAgIGZvciAoaSA9IDA7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoYVtpXSAhPT0gYltpXSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICB0cnkge1xuICAgIHZhciBrYSA9IG9iamVjdEtleXMoYSksXG4gICAgICAgIGtiID0gb2JqZWN0S2V5cyhiKTtcbiAgfSBjYXRjaCAoZSkgey8vaGFwcGVucyB3aGVuIG9uZSBpcyBhIHN0cmluZyBsaXRlcmFsIGFuZCB0aGUgb3RoZXIgaXNuJ3RcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy8gaGF2aW5nIHRoZSBzYW1lIG51bWJlciBvZiBvd25lZCBwcm9wZXJ0aWVzIChrZXlzIGluY29ycG9yYXRlc1xuICAvLyBoYXNPd25Qcm9wZXJ0eSlcbiAgaWYgKGthLmxlbmd0aCAhPSBrYi5sZW5ndGgpXG4gICAgcmV0dXJuIGZhbHNlO1xuICAvL3RoZSBzYW1lIHNldCBvZiBrZXlzIChhbHRob3VnaCBub3QgbmVjZXNzYXJpbHkgdGhlIHNhbWUgb3JkZXIpLFxuICBrYS5zb3J0KCk7XG4gIGtiLnNvcnQoKTtcbiAgLy9+fn5jaGVhcCBrZXkgdGVzdFxuICBmb3IgKGkgPSBrYS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGlmIChrYVtpXSAhPSBrYltpXSlcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvL2VxdWl2YWxlbnQgdmFsdWVzIGZvciBldmVyeSBjb3JyZXNwb25kaW5nIGtleSwgYW5kXG4gIC8vfn5+cG9zc2libHkgZXhwZW5zaXZlIGRlZXAgdGVzdFxuICBmb3IgKGkgPSBrYS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGtleSA9IGthW2ldO1xuICAgIGlmICghZGVlcEVxdWFsKGFba2V5XSwgYltrZXldLCBvcHRzKSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0eXBlb2YgYSA9PT0gdHlwZW9mIGI7XG59XG4iLCJ2YXIgc3VwcG9ydHNBcmd1bWVudHNDbGFzcyA9IChmdW5jdGlvbigpe1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFyZ3VtZW50cylcbn0pKCkgPT0gJ1tvYmplY3QgQXJndW1lbnRzXSc7XG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHN1cHBvcnRzQXJndW1lbnRzQ2xhc3MgPyBzdXBwb3J0ZWQgOiB1bnN1cHBvcnRlZDtcblxuZXhwb3J0cy5zdXBwb3J0ZWQgPSBzdXBwb3J0ZWQ7XG5mdW5jdGlvbiBzdXBwb3J0ZWQob2JqZWN0KSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqZWN0KSA9PSAnW29iamVjdCBBcmd1bWVudHNdJztcbn07XG5cbmV4cG9ydHMudW5zdXBwb3J0ZWQgPSB1bnN1cHBvcnRlZDtcbmZ1bmN0aW9uIHVuc3VwcG9ydGVkKG9iamVjdCl7XG4gIHJldHVybiBvYmplY3QgJiZcbiAgICB0eXBlb2Ygb2JqZWN0ID09ICdvYmplY3QnICYmXG4gICAgdHlwZW9mIG9iamVjdC5sZW5ndGggPT0gJ251bWJlcicgJiZcbiAgICBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCAnY2FsbGVlJykgJiZcbiAgICAhT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKG9iamVjdCwgJ2NhbGxlZScpIHx8XG4gICAgZmFsc2U7XG59O1xuIiwiZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gdHlwZW9mIE9iamVjdC5rZXlzID09PSAnZnVuY3Rpb24nXG4gID8gT2JqZWN0LmtleXMgOiBzaGltO1xuXG5leHBvcnRzLnNoaW0gPSBzaGltO1xuZnVuY3Rpb24gc2hpbSAob2JqKSB7XG4gIHZhciBrZXlzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBvYmopIGtleXMucHVzaChrZXkpO1xuICByZXR1cm4ga2V5cztcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gVG9PYmplY3QodmFsKSB7XG5cdGlmICh2YWwgPT0gbnVsbCkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ09iamVjdC5hc3NpZ24gY2Fubm90IGJlIGNhbGxlZCB3aXRoIG51bGwgb3IgdW5kZWZpbmVkJyk7XG5cdH1cblxuXHRyZXR1cm4gT2JqZWN0KHZhbCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0LCBzb3VyY2UpIHtcblx0dmFyIGZyb207XG5cdHZhciBrZXlzO1xuXHR2YXIgdG8gPSBUb09iamVjdCh0YXJnZXQpO1xuXG5cdGZvciAodmFyIHMgPSAxOyBzIDwgYXJndW1lbnRzLmxlbmd0aDsgcysrKSB7XG5cdFx0ZnJvbSA9IGFyZ3VtZW50c1tzXTtcblx0XHRrZXlzID0gT2JqZWN0LmtleXMoT2JqZWN0KGZyb20pKTtcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dG9ba2V5c1tpXV0gPSBmcm9tW2tleXNbaV1dO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiB0bztcbn07XG4iXX0=
