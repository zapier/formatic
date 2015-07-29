!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Formatic=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/justin/Dropbox/git/formatic/index.js":[function(require,module,exports){
"use strict";

// # index

// Export the Formatic React class at the top level.
module.exports = require("./lib/formatic");

},{"./lib/formatic":"/Users/justin/Dropbox/git/formatic/lib/formatic.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/containers/component.js":[function(require,module,exports){
(function (global){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var React = _interopRequire((typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null));

var _ = _interopRequire(require("../../undash"));

var createContextComponent = _interopRequire(require("../create-context-component"));

var ComponentContainer = React.createClass({
  displayName: "ComponentContainer",

  render: function render() {
    var children = this.props.children;

    var Component = createContextComponent(this.props);

    if (_.isFunction(children)) {
      return children(Component);
    }

    return React.createElement(
      "span",
      null,
      React.Children.map(function (child) {
        return React.cloneElement(child, { Component: Component });
      })
    );
  }
});

module.exports = ComponentContainer;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../undash":"/Users/justin/Dropbox/git/formatic/lib/undash.js","../create-context-component":"/Users/justin/Dropbox/git/formatic/lib/components/create-context-component.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/containers/uncontrolled.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var _ = require("../../undash");

module.exports = React.createClass({

  displayName: "UncontrolledContainer",

  getInitialState: function getInitialState() {
    return {
      isControlled: !_.isUndefined(this.props.value),
      value: _.isUndefined(this.props.value) ? this.props.defaultValue : this.props.value
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(newProps) {
    if (this.state.isControlled) {
      if (!_.isUndefined(newProps.value)) {
        this.setState({
          value: newProps.value
        });
      }
    }
  },

  onChange: (function (_onChange) {
    var _onChangeWrapper = function onChange(_x) {
      return _onChange.apply(this, arguments);
    };

    _onChangeWrapper.toString = function () {
      return _onChange.toString();
    };

    return _onChangeWrapper;
  })(function (event) {
    var onChange = this.props.onChange;

    if (!this.state.isControlled) {
      this.setState({
        value: event.value
      });
    }
    if (!onChange) {
      return;
    }
    onChange(event);
  }),

  render: function render() {
    var children = this.props.children;

    var child = React.Children.only(children);

    var childProps = _.extend({}, this.props, {
      onChange: this.onChange
    });

    var clonedChild = React.cloneElement(child, childProps);

    return clonedChild;
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../undash":"/Users/justin/Dropbox/git/formatic/lib/undash.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/create-context-component.js":[function(require,module,exports){
(function (global){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = _interopRequire((typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null));

var _ = _interopRequire(require("../undash"));

var Components = _interopRequire(require("./"));

module.exports = function (containerProps) {

  var containerComponents = containerProps.components || {};

  var Component = (function (_React$Component) {
    function Component(props, context) {
      _classCallCheck(this, Component);

      _get(Object.getPrototypeOf(Component.prototype), "constructor", this).call(this, props, context);
    }

    _inherits(Component, _React$Component);

    _prototypeProperties(Component, null, {
      matchedComponentClass: {
        value: function matchedComponentClass() {
          if (_.isFunction(this.props.$type)) {
            return this.props.$type;
          }
          if (_.isString(this.props.$type)) {
            var MatchedComponent = containerComponents[this.props.$type] || Components[this.props.$type];
            if (!MatchedComponent) {
              throw new Error("Component not found: " + this.props.$type);
            }
            return MatchedComponent;
          }
          throw new Error("Component requires $type to be a component class or name.");
        },
        writable: true,
        configurable: true
      },
      render: {
        value: function render() {
          var _this = this;

          var MatchedComponent = this.matchedComponentClass();
          var propsWithoutName = {};
          Object.keys(this.props).forEach(function (propKey) {
            if (propKey === "$type") {
              return;
            }
            propsWithoutName[propKey] = _this.props[propKey];
          });
          return React.createElement(MatchedComponent, _extends({}, propsWithoutName, { Component: Component }));
        },
        writable: true,
        configurable: true
      }
    });

    return Component;
  })(React.Component);

  Component.prototype.displayName = "Component";

  return Component;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../undash":"/Users/justin/Dropbox/git/formatic/lib/undash.js","./":"/Users/justin/Dropbox/git/formatic/lib/components/index.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/index.js":[function(require,module,exports){
"use strict";

//const wrap = require('./wrap-component');
//const createField = require('./create-field');
//const createInput = require('./create-input');

module.exports = {
  UncontrolledContainer: require("./containers/uncontrolled"),
  //InputContainer: require('./containers/input') //,
  StringInput: require("./inputs/string"),
  StringInputView: require("./views/string-input")
  //StringField: require('./fields/string')
  // FieldsField: createField('Fields'),
  // StringField: createField('String'),
  // FieldsInput: wrap(require('./inputs/fields')),
  //StringInput: createInput('String')
  // Field: wrap(require('./helpers/field')),
  // Label: wrap(require('./helpers/label')),
  // Help: wrap(require('./helpers/help'))
};

},{"./containers/uncontrolled":"/Users/justin/Dropbox/git/formatic/lib/components/containers/uncontrolled.js","./inputs/string":"/Users/justin/Dropbox/git/formatic/lib/components/inputs/string.js","./views/string-input":"/Users/justin/Dropbox/git/formatic/lib/components/views/string-input.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/inputs/string.js":[function(require,module,exports){
(function (global){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = _interopRequire((typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null));

var StringInput = React.createClass({

  displayName: "StringInput",

  // propTypes: {
  //   component: React.PropTypes.func.required
  // },

  onChange: (function (_onChange) {
    var _onChangeWrapper = function onChange(_x) {
      return _onChange.apply(this, arguments);
    };

    _onChangeWrapper.toString = function () {
      return _onChange.toString();
    };

    return _onChangeWrapper;
  })(function (event) {
    var onChange = this.props.onChange;

    if (onChange) {
      onChange({
        value: event.target.value
      });
    }
  }),

  onFocus: (function (_onFocus) {
    var _onFocusWrapper = function onFocus() {
      return _onFocus.apply(this, arguments);
    };

    _onFocusWrapper.toString = function () {
      return _onFocus.toString();
    };

    return _onFocusWrapper;
  })(function () {
    var onFocus = this.props.onFocus;

    if (onFocus) {
      onFocus({});
    }
  }),

  onBlur: (function (_onBlur) {
    var _onBlurWrapper = function onBlur() {
      return _onBlur.apply(this, arguments);
    };

    _onBlurWrapper.toString = function () {
      return _onBlur.toString();
    };

    return _onBlurWrapper;
  })(function () {
    var onBlur = this.props.onBlur;

    if (onBlur) {
      onBlur({});
    }
  }),

  render: function render() {
    var Component = this.props.Component;

    var _ref = this;

    var onChange = _ref.onChange;
    var onFocus = _ref.onFocus;
    var onBlur = _ref.onBlur;

    return React.createElement(Component, _extends({ $type: "StringInputView" }, this.props, { onChange: onChange, onFocus: onFocus, onBlur: onBlur }));
  }
});

module.exports = StringInput;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/justin/Dropbox/git/formatic/lib/components/views/string-input.js":[function(require,module,exports){
(function (global){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var React = _interopRequire((typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null));

var StringInputView = React.createClass({
  displayName: "StringInputView",

  render: function render() {
    return React.createElement("textarea", this.props);
  }
});

module.exports = StringInputView;

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
    ComponentContainer: require("./components/containers/component")
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

},{"./components":"/Users/justin/Dropbox/git/formatic/lib/components/index.js","./components/containers/component":"/Users/justin/Dropbox/git/formatic/lib/components/containers/component.js","./undash":"/Users/justin/Dropbox/git/formatic/lib/undash.js"}],"/Users/justin/Dropbox/git/formatic/lib/undash.js":[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2luZGV4LmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9jb250YWluZXJzL2NvbXBvbmVudC5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvY29udGFpbmVycy91bmNvbnRyb2xsZWQuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2NyZWF0ZS1jb250ZXh0LWNvbXBvbmVudC5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaW5kZXguanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2lucHV0cy9zdHJpbmcuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL3ZpZXdzL3N0cmluZy1pbnB1dC5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2Zvcm1hdGljLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvdW5kYXNoLmpzIiwibm9kZV9tb2R1bGVzL2RlZXAtZXF1YWwvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZGVlcC1lcXVhbC9saWIvaXNfYXJndW1lbnRzLmpzIiwibm9kZV9tb2R1bGVzL2RlZXAtZXF1YWwvbGliL2tleXMuanMiLCJub2RlX21vZHVsZXMvb2JqZWN0LWFzc2lnbi9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0FDR0EsTUFBTSxDQUFDLE9BQU8sR0FBRyxPQUFPLENB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QUMsSUFBSSxHQUFHLFVBQUMsR0FBRyxFQUFFLFNBQVMsRUFBSztBQUMzQixRQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLEdBQUcsRUFBSTtBQUM5QixhQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0dBQzFCLENBQUMsQ0FBQztDQUNKLENBQUM7O0FBRUYsTUFBTSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7OztBQ2xEbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gIyBpbmRleFxuXG4vLyBFeHBvcnQgdGhlIEZvcm1hdGljIFJlYWN0IGNsYXNzIGF0IHRoZSB0b3AgbGV2ZWwuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL2Zvcm1hdGljJyk7XG4iLCJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IF8gZnJvbSAnLi4vLi4vdW5kYXNoJztcbmltcG9ydCBjcmVhdGVDb250ZXh0Q29tcG9uZW50IGZyb20gJy4uL2NyZWF0ZS1jb250ZXh0LWNvbXBvbmVudCc7XG5cbmNvbnN0IENvbXBvbmVudENvbnRhaW5lciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICByZW5kZXIoKSB7XG4gICAgY29uc3Qge2NoaWxkcmVufSA9IHRoaXMucHJvcHM7XG5cbiAgICBjb25zdCBDb21wb25lbnQgPSBjcmVhdGVDb250ZXh0Q29tcG9uZW50KHRoaXMucHJvcHMpO1xuXG4gICAgaWYgKF8uaXNGdW5jdGlvbihjaGlsZHJlbikpIHtcbiAgICAgIHJldHVybiBjaGlsZHJlbihDb21wb25lbnQpO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8c3Bhbj5cbiAgICAgIHtcbiAgICAgICAgUmVhY3QuQ2hpbGRyZW4ubWFwKGNoaWxkID0+IFJlYWN0LmNsb25lRWxlbWVudChjaGlsZCwge0NvbXBvbmVudH0pKVxuICAgICAgfVxuICAgICAgPC9zcGFuPlxuICAgICk7XG4gIH1cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBDb21wb25lbnRDb250YWluZXI7XG4iLCJjb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5jb25zdCBfID0gcmVxdWlyZSgnLi4vLi4vdW5kYXNoJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnVW5jb250cm9sbGVkQ29udGFpbmVyJyxcblxuICBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlzQ29udHJvbGxlZDogIV8uaXNVbmRlZmluZWQodGhpcy5wcm9wcy52YWx1ZSksXG4gICAgICB2YWx1ZTogXy5pc1VuZGVmaW5lZCh0aGlzLnByb3BzLnZhbHVlKSA/IHRoaXMucHJvcHMuZGVmYXVsdFZhbHVlIDogdGhpcy5wcm9wcy52YWx1ZVxuICAgIH07XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXdQcm9wcykge1xuICAgIGlmICh0aGlzLnN0YXRlLmlzQ29udHJvbGxlZCkge1xuICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKG5ld1Byb3BzLnZhbHVlKSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICB2YWx1ZTogbmV3UHJvcHMudmFsdWVcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIG9uQ2hhbmdlKGV2ZW50KSB7XG4gICAgY29uc3Qge29uQ2hhbmdlfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKCF0aGlzLnN0YXRlLmlzQ29udHJvbGxlZCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHZhbHVlOiBldmVudC52YWx1ZVxuICAgICAgfSk7XG4gICAgfVxuICAgIGlmICghb25DaGFuZ2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgb25DaGFuZ2UoZXZlbnQpO1xuICB9LFxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7Y2hpbGRyZW59ID0gdGhpcy5wcm9wcztcblxuICAgIGNvbnN0IGNoaWxkID0gUmVhY3QuQ2hpbGRyZW4ub25seShjaGlsZHJlbik7XG5cbiAgICBjb25zdCBjaGlsZFByb3BzID0gXy5leHRlbmQoe30sIHRoaXMucHJvcHMsIHtcbiAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlXG4gICAgfSk7XG5cbiAgICBjb25zdCBjbG9uZWRDaGlsZCA9IFJlYWN0LmNsb25lRWxlbWVudChjaGlsZCwgY2hpbGRQcm9wcyk7XG5cbiAgICByZXR1cm4gY2xvbmVkQ2hpbGQ7XG4gIH1cbn0pO1xuIiwiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBfIGZyb20gJy4uL3VuZGFzaCc7XG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tICcuLyc7XG5cbmV4cG9ydCBkZWZhdWx0IChjb250YWluZXJQcm9wcykgPT4ge1xuXG4gIGNvbnN0IGNvbnRhaW5lckNvbXBvbmVudHMgPSBjb250YWluZXJQcm9wcy5jb21wb25lbnRzIHx8IHt9O1xuXG4gIGNvbnN0IENvbXBvbmVudCA9IGNsYXNzIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzLCBjb250ZXh0KSB7XG4gICAgICBzdXBlcihwcm9wcywgY29udGV4dCk7XG4gICAgfVxuXG4gICAgbWF0Y2hlZENvbXBvbmVudENsYXNzKCkge1xuICAgICAgaWYgKF8uaXNGdW5jdGlvbih0aGlzLnByb3BzLiR0eXBlKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy4kdHlwZTtcbiAgICAgIH1cbiAgICAgIGlmIChfLmlzU3RyaW5nKHRoaXMucHJvcHMuJHR5cGUpKSB7XG4gICAgICAgIGNvbnN0IE1hdGNoZWRDb21wb25lbnQgPSBjb250YWluZXJDb21wb25lbnRzW3RoaXMucHJvcHMuJHR5cGVdIHx8IENvbXBvbmVudHNbdGhpcy5wcm9wcy4kdHlwZV07XG4gICAgICAgIGlmICghTWF0Y2hlZENvbXBvbmVudCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ29tcG9uZW50IG5vdCBmb3VuZDogJHt0aGlzLnByb3BzLiR0eXBlfWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBNYXRjaGVkQ29tcG9uZW50O1xuICAgICAgfVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb21wb25lbnQgcmVxdWlyZXMgJHR5cGUgdG8gYmUgYSBjb21wb25lbnQgY2xhc3Mgb3IgbmFtZS4nKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICBjb25zdCBNYXRjaGVkQ29tcG9uZW50ID0gdGhpcy5tYXRjaGVkQ29tcG9uZW50Q2xhc3MoKTtcbiAgICAgIGNvbnN0IHByb3BzV2l0aG91dE5hbWUgPSB7fTtcbiAgICAgIE9iamVjdC5rZXlzKHRoaXMucHJvcHMpLmZvckVhY2gocHJvcEtleSA9PiB7XG4gICAgICAgIGlmIChwcm9wS2V5ID09PSAnJHR5cGUnKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHByb3BzV2l0aG91dE5hbWVbcHJvcEtleV0gPSB0aGlzLnByb3BzW3Byb3BLZXldO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gPE1hdGNoZWRDb21wb25lbnQgey4uLnByb3BzV2l0aG91dE5hbWV9IHsuLi57Q29tcG9uZW50fX0vPjtcbiAgICB9XG5cbiAgfTtcblxuICBDb21wb25lbnQucHJvdG90eXBlLmRpc3BsYXlOYW1lID0gJ0NvbXBvbmVudCc7XG5cbiAgcmV0dXJuIENvbXBvbmVudDtcbn07XG4iLCIvL2NvbnN0IHdyYXAgPSByZXF1aXJlKCcuL3dyYXAtY29tcG9uZW50Jyk7XG4vL2NvbnN0IGNyZWF0ZUZpZWxkID0gcmVxdWlyZSgnLi9jcmVhdGUtZmllbGQnKTtcbi8vY29uc3QgY3JlYXRlSW5wdXQgPSByZXF1aXJlKCcuL2NyZWF0ZS1pbnB1dCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgVW5jb250cm9sbGVkQ29udGFpbmVyOiByZXF1aXJlKCcuL2NvbnRhaW5lcnMvdW5jb250cm9sbGVkJyksXG4gIC8vSW5wdXRDb250YWluZXI6IHJlcXVpcmUoJy4vY29udGFpbmVycy9pbnB1dCcpIC8vLFxuICBTdHJpbmdJbnB1dDogcmVxdWlyZSgnLi9pbnB1dHMvc3RyaW5nJyksXG4gIFN0cmluZ0lucHV0VmlldzogcmVxdWlyZSgnLi92aWV3cy9zdHJpbmctaW5wdXQnKVxuICAvL1N0cmluZ0ZpZWxkOiByZXF1aXJlKCcuL2ZpZWxkcy9zdHJpbmcnKVxuICAvLyBGaWVsZHNGaWVsZDogY3JlYXRlRmllbGQoJ0ZpZWxkcycpLFxuICAvLyBTdHJpbmdGaWVsZDogY3JlYXRlRmllbGQoJ1N0cmluZycpLFxuICAvLyBGaWVsZHNJbnB1dDogd3JhcChyZXF1aXJlKCcuL2lucHV0cy9maWVsZHMnKSksXG4gIC8vU3RyaW5nSW5wdXQ6IGNyZWF0ZUlucHV0KCdTdHJpbmcnKVxuICAvLyBGaWVsZDogd3JhcChyZXF1aXJlKCcuL2hlbHBlcnMvZmllbGQnKSksXG4gIC8vIExhYmVsOiB3cmFwKHJlcXVpcmUoJy4vaGVscGVycy9sYWJlbCcpKSxcbiAgLy8gSGVscDogd3JhcChyZXF1aXJlKCcuL2hlbHBlcnMvaGVscCcpKVxufTtcbiIsImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmNvbnN0IFN0cmluZ0lucHV0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnU3RyaW5nSW5wdXQnLFxuXG4gIC8vIHByb3BUeXBlczoge1xuICAvLyAgIGNvbXBvbmVudDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMucmVxdWlyZWRcbiAgLy8gfSxcblxuICBvbkNoYW5nZShldmVudCkge1xuICAgIGNvbnN0IHtvbkNoYW5nZX0gPSB0aGlzLnByb3BzO1xuXG4gICAgaWYgKG9uQ2hhbmdlKSB7XG4gICAgICBvbkNoYW5nZSh7XG4gICAgICAgIHZhbHVlOiBldmVudC50YXJnZXQudmFsdWVcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcblxuICBvbkZvY3VzKCkge1xuICAgIGNvbnN0IHtvbkZvY3VzfSA9IHRoaXMucHJvcHM7XG5cbiAgICBpZiAob25Gb2N1cykge1xuICAgICAgb25Gb2N1cyh7fSk7XG4gICAgfVxuICB9LFxuXG4gIG9uQmx1cigpIHtcbiAgICBjb25zdCB7b25CbHVyfSA9IHRoaXMucHJvcHM7XG5cbiAgICBpZiAob25CbHVyKSB7XG4gICAgICBvbkJsdXIoe30pO1xuICAgIH1cbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgY29uc3Qge0NvbXBvbmVudH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHtvbkNoYW5nZSwgb25Gb2N1cywgb25CbHVyfSA9IHRoaXM7XG4gICAgcmV0dXJuIDxDb21wb25lbnQgJHR5cGU9XCJTdHJpbmdJbnB1dFZpZXdcIiB7Li4udGhpcy5wcm9wc30gey4uLntvbkNoYW5nZSwgb25Gb2N1cywgb25CbHVyfX0vPjtcbiAgfVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IFN0cmluZ0lucHV0O1xuIiwiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuY29uc3QgU3RyaW5nSW5wdXRWaWV3ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIDx0ZXh0YXJlYSB7Li4udGhpcy5wcm9wc30vPjtcbiAgfVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IFN0cmluZ0lucHV0VmlldztcbiIsImNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbmNvbnN0IF8gPSByZXF1aXJlKCcuL3VuZGFzaCcpO1xuY29uc3QgQ29tcG9uZW50cyA9IHJlcXVpcmUoJy4vY29tcG9uZW50cycpO1xuLy9jb25zdCBDb21wb25lbnRDb250YWluZXIgPSByZXF1aXJlKCcuL2NvbXBvbmVudC1jb250YWluZXInKTtcblxuLy9Db21wb25lbnRDb250YWluZXIuc2V0Q29tcG9uZW50cyhDb21wb25lbnRzKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgc3RhdGljczogXy5leHRlbmQoe1xuICAgIC8vd3JhcDogcmVxdWlyZSgnLi9jb21wb25lbnRzL3dyYXAtY29tcG9uZW50JylcbiAgICAvL2ZpZWxkOiByZXF1aXJlKCcuL2NvbXBvbmVudHMvd3JhcC1maWVsZCcpLFxuICAgIC8vaGVscGVyOiByZXF1aXJlKCcuL2NvbXBvbmVudHMvd3JhcC1oZWxwZXInKVxuICAgIENvbXBvbmVudENvbnRhaW5lcjogcmVxdWlyZSgnLi9jb21wb25lbnRzL2NvbnRhaW5lcnMvY29tcG9uZW50JylcbiAgfSxcbiAgICBDb21wb25lbnRzXG4gICksXG5cbiAgY29tcG9uZW50KG5hbWUpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5jb21wb25lbnQpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3BzLmNvbXBvbmVudChuYW1lKTtcbiAgICB9XG4gICAgY29uc3QgY29tcG9uZW50Q2xhc3MgPSB0aGlzLnByb3BzLmNvbXBvbmVudHMgJiYgdGhpcy5wcm9wcy5jb21wb25lbnRzW25hbWVdO1xuICAgIGlmIChjb21wb25lbnRDbGFzcykge1xuICAgICAgcmV0dXJuIGNvbXBvbmVudENsYXNzO1xuICAgIH1cbiAgICByZXR1cm4gQ29tcG9uZW50c1tuYW1lXSB8fCBDb21wb25lbnRzLlVua25vd247XG4gIH0sXG5cbiAgcmVuZGVyKCkge1xuICAgIGlmICh0aGlzLnByb3BzLmNoaWxkcmVuICYmICFfLmlzQXJyYXkodGhpcy5wcm9wcy5jaGlsZHJlbikpIHtcbiAgICAgIGNvbnN0IHByb3BzID0gXy5leHRlbmQoe30sIHRoaXMucHJvcHMsIHtjb21wb25lbnQ6IHRoaXMuY29tcG9uZW50fSk7XG4gICAgICByZXR1cm4gUmVhY3QuY2xvbmVFbGVtZW50KHRoaXMucHJvcHMuY2hpbGRyZW4sIHByb3BzKTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKCdZb3UgbXVzdCBwcm92aWRlIGV4YWN0bHkgb25lIGNoaWxkIHRvIHRoZSBGb3JtYXRpYyBjb21wb25lbnQuJyk7XG4gIH1cblxufSk7XG5cblxuLy8gLy8gIyBmb3JtYXRpY1xuLy9cbi8vIC8qXG4vLyBUaGUgcm9vdCBmb3JtYXRpYyBjb21wb25lbnQuXG4vL1xuLy8gVGhlIHJvb3QgZm9ybWF0aWMgY29tcG9uZW50IGlzIGFjdHVhbGx5IHR3byBjb21wb25lbnRzLiBUaGUgbWFpbiBjb21wb25lbnQgaXNcbi8vIGEgY29udHJvbGxlZCBjb21wb25lbnQgd2hlcmUgeW91IG11c3QgcGFzcyB0aGUgdmFsdWUgaW4gd2l0aCBlYWNoIHJlbmRlci4gVGhpc1xuLy8gaXMgYWN0dWFsbHkgd3JhcHBlZCBpbiBhbm90aGVyIGNvbXBvbmVudCB3aGljaCBhbGxvd3MgeW91IHRvIHVzZSBmb3JtYXRpYyBhc1xuLy8gYW4gdW5jb250cm9sbGVkIGNvbXBvbmVudCB3aGVyZSBpdCByZXRhaW5zIHRoZSBzdGF0ZSBvZiB0aGUgdmFsdWUuIFRoZSB3cmFwcGVyXG4vLyBpcyB3aGF0IGlzIGFjdHVhbGx5IGV4cG9ydGVkLlxuLy8gKi9cbi8vXG4vLyAndXNlIHN0cmljdCc7XG4vL1xuLy8gdmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG4vLyB2YXIgXyA9IHJlcXVpcmUoJy4vdW5kYXNoJyk7XG4vL1xuLy8gdmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuLy9cbi8vIHZhciBkZWZhdWx0Q29uZmlnUGx1Z2luID0gcmVxdWlyZSgnLi9kZWZhdWx0LWNvbmZpZycpO1xuLy9cbi8vIHZhciBjcmVhdGVDb25maWcgPSBmdW5jdGlvbiAoLi4uYXJncykge1xuLy8gICB2YXIgcGx1Z2lucyA9IFtkZWZhdWx0Q29uZmlnUGx1Z2luXS5jb25jYXQoYXJncyk7XG4vL1xuLy8gICByZXR1cm4gcGx1Z2lucy5yZWR1Y2UoZnVuY3Rpb24gKGNvbmZpZywgcGx1Z2luKSB7XG4vLyAgICAgaWYgKF8uaXNGdW5jdGlvbihwbHVnaW4pKSB7XG4vLyAgICAgICB2YXIgZXh0ZW5zaW9ucyA9IHBsdWdpbihjb25maWcpO1xuLy8gICAgICAgaWYgKGV4dGVuc2lvbnMpIHtcbi8vICAgICAgICAgXy5leHRlbmQoY29uZmlnLCBleHRlbnNpb25zKTtcbi8vICAgICAgIH1cbi8vICAgICB9IGVsc2Uge1xuLy8gICAgICAgXy5leHRlbmQoY29uZmlnLCBwbHVnaW4pO1xuLy8gICAgIH1cbi8vXG4vLyAgICAgcmV0dXJuIGNvbmZpZztcbi8vICAgfSwge30pO1xuLy8gfTtcbi8vXG4vLyB2YXIgZGVmYXVsdENvbmZpZyA9IGNyZWF0ZUNvbmZpZygpO1xuLy9cbi8vIC8vIFRoZSBtYWluIGZvcm1hdGljIGNvbXBvbmVudCB0aGF0IHJlbmRlcnMgdGhlIGZvcm0uXG4vLyB2YXIgRm9ybWF0aWNDb250cm9sbGVkQ2xhc3MgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4vL1xuLy8gICBkaXNwbGF5TmFtZTogJ0Zvcm1hdGljQ29udHJvbGxlZCcsXG4vL1xuLy8gICAvLyBSZXNwb25kIHRvIGFueSB2YWx1ZSBjaGFuZ2VzLlxuLy8gICBvbkNoYW5nZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBpbmZvKSB7XG4vLyAgICAgaWYgKCF0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4vLyAgICAgICByZXR1cm47XG4vLyAgICAgfVxuLy8gICAgIGluZm8gPSBfLmV4dGVuZCh7fSwgaW5mbyk7XG4vLyAgICAgaW5mby5wYXRoID0gdGhpcy5wcm9wcy5jb25maWcuZmllbGRWYWx1ZVBhdGgoaW5mby5maWVsZCk7XG4vLyAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSwgaW5mbyk7XG4vLyAgIH0sXG4vL1xuLy8gICAvLyBSZXNwb25kIHRvIGFueSBhY3Rpb25zIG90aGVyIHRoYW4gdmFsdWUgY2hhbmdlcy4gKEZvciBleGFtcGxlLCBmb2N1cyBhbmRcbi8vICAgLy8gYmx1ci4pXG4vLyAgIG9uQWN0aW9uOiBmdW5jdGlvbiAoaW5mbykge1xuLy8gICAgIGlmICghdGhpcy5wcm9wcy5vbkFjdGlvbikge1xuLy8gICAgICAgcmV0dXJuO1xuLy8gICAgIH1cbi8vICAgICBpbmZvID0gXy5leHRlbmQoe30sIGluZm8pO1xuLy8gICAgIGluZm8ucGF0aCA9IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkVmFsdWVQYXRoKGluZm8uZmllbGQpO1xuLy8gICAgIHRoaXMucHJvcHMub25BY3Rpb24oaW5mbyk7XG4vLyAgIH0sXG4vL1xuLy8gICAvLyBSZW5kZXIgdGhlIHJvb3QgY29tcG9uZW50IGJ5IGRlbGVnYXRpbmcgdG8gdGhlIGNvbmZpZy5cbi8vICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4vL1xuLy8gICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbi8vXG4vLyAgICAgcmV0dXJuIGNvbmZpZy5yZW5kZXJGb3JtYXRpY0NvbXBvbmVudCh0aGlzKTtcbi8vICAgfVxuLy8gfSk7XG4vL1xuLy8gdmFyIEZvcm1hdGljQ29udHJvbGxlZCA9IFJlYWN0LmNyZWF0ZUZhY3RvcnkoRm9ybWF0aWNDb250cm9sbGVkQ2xhc3MpO1xuLy9cbi8vIC8vIEEgd3JhcHBlciBjb21wb25lbnQgdGhhdCBpcyBhY3R1YWxseSBleHBvcnRlZCBhbmQgY2FuIGFsbG93IGZvcm1hdGljIHRvIGJlXG4vLyAvLyB1c2VkIGluIGFuIFwidW5jb250cm9sbGVkXCIgbWFubmVyLiAoU2VlIHVuY29udHJvbGxlZCBjb21wb25lbnRzIGluIHRoZSBSZWFjdFxuLy8gLy8gZG9jdW1lbnRhdGlvbiBmb3IgYW4gZXhwbGFuYXRpb24gb2YgdGhlIGRpZmZlcmVuY2UuKVxuLy8gbW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4vL1xuLy8gICAvLyBFeHBvcnQgc29tZSBzdHVmZiBhcyBzdGF0aWNzLlxuLy8gICBzdGF0aWNzOiB7XG4vLyAgICAgY3JlYXRlQ29uZmlnOiBjcmVhdGVDb25maWcsXG4vLyAgICAgYXZhaWxhYmxlTWl4aW5zOiB7XG4vLyAgICAgICBjbGlja091dHNpZGU6IHJlcXVpcmUoJy4vbWl4aW5zL2NsaWNrLW91dHNpZGUuanMnKSxcbi8vICAgICAgIGZpZWxkOiByZXF1aXJlKCcuL21peGlucy9maWVsZC5qcycpLFxuLy8gICAgICAgaGVscGVyOiByZXF1aXJlKCcuL21peGlucy9oZWxwZXIuanMnKSxcbi8vICAgICAgIHJlc2l6ZTogcmVxdWlyZSgnLi9taXhpbnMvcmVzaXplLmpzJyksXG4vLyAgICAgICBzY3JvbGw6IHJlcXVpcmUoJy4vbWl4aW5zL3Njcm9sbC5qcycpLFxuLy8gICAgICAgdW5kb1N0YWNrOiByZXF1aXJlKCcuL21peGlucy91bmRvLXN0YWNrLmpzJylcbi8vICAgICB9LFxuLy8gICAgIHBsdWdpbnM6IHtcbi8vICAgICAgIGJvb3RzdHJhcDogcmVxdWlyZSgnLi9wbHVnaW5zL2Jvb3RzdHJhcCcpLFxuLy8gICAgICAgbWV0YTogcmVxdWlyZSgnLi9wbHVnaW5zL21ldGEnKSxcbi8vICAgICAgIHJlZmVyZW5jZTogcmVxdWlyZSgnLi9wbHVnaW5zL3JlZmVyZW5jZScpLFxuLy8gICAgICAgZWxlbWVudENsYXNzZXM6IHJlcXVpcmUoJy4vcGx1Z2lucy9lbGVtZW50LWNsYXNzZXMnKVxuLy8gICAgIH0sXG4vLyAgICAgdXRpbHM6IHV0aWxzXG4vLyAgIH0sXG4vL1xuLy8gICBkaXNwbGF5TmFtZTogJ0Zvcm1hdGljJyxcbi8vXG4vLyAgIC8vIElmIHdlIGdvdCBhIHZhbHVlLCB0cmVhdCB0aGlzIGNvbXBvbmVudCBhcyBjb250cm9sbGVkLiBFaXRoZXIgd2F5LCByZXRhaW5cbi8vICAgLy8gdGhlIHZhbHVlIGluIHRoZSBzdGF0ZS5cbi8vICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4vLyAgICAgcmV0dXJuIHtcbi8vICAgICAgIGlzQ29udHJvbGxlZDogIV8uaXNVbmRlZmluZWQodGhpcy5wcm9wcy52YWx1ZSksXG4vLyAgICAgICB2YWx1ZTogXy5pc1VuZGVmaW5lZCh0aGlzLnByb3BzLnZhbHVlKSA/IHRoaXMucHJvcHMuZGVmYXVsdFZhbHVlIDogdGhpcy5wcm9wcy52YWx1ZVxuLy8gICAgIH07XG4vLyAgIH0sXG4vL1xuLy8gICAvLyBJZiB0aGlzIGlzIGEgY29udHJvbGxlZCBjb21wb25lbnQsIGNoYW5nZSBvdXIgc3RhdGUgdG8gcmVmbGVjdCB0aGUgbmV3XG4vLyAgIC8vIHZhbHVlLiBGb3IgdW5jb250cm9sbGVkIGNvbXBvbmVudHMsIGlnbm9yZSBhbnkgdmFsdWUgY2hhbmdlcy5cbi8vICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gKG5ld1Byb3BzKSB7XG4vLyAgICAgaWYgKHRoaXMuc3RhdGUuaXNDb250cm9sbGVkKSB7XG4vLyAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQobmV3UHJvcHMudmFsdWUpKSB7XG4vLyAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuLy8gICAgICAgICAgIHZhbHVlOiBuZXdQcm9wcy52YWx1ZVxuLy8gICAgICAgICB9KTtcbi8vICAgICAgIH1cbi8vICAgICB9XG4vLyAgIH0sXG4vL1xuLy8gICAvLyBJZiB0aGlzIGlzIGFuIHVuY29udHJvbGxlZCBjb21wb25lbnQsIHNldCBvdXIgc3RhdGUgdG8gcmVmbGVjdCB0aGUgbmV3XG4vLyAgIC8vIHZhbHVlLiBFaXRoZXIgd2F5LCBjYWxsIHRoZSBvbkNoYW5nZSBjYWxsYmFjay5cbi8vICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgaW5mbykge1xuLy8gICAgIGlmICghdGhpcy5zdGF0ZS5pc0NvbnRyb2xsZWQpIHtcbi8vICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuLy8gICAgICAgICB2YWx1ZTogbmV3VmFsdWVcbi8vICAgICAgIH0pO1xuLy8gICAgIH1cbi8vICAgICBpZiAoIXRoaXMucHJvcHMub25DaGFuZ2UpIHtcbi8vICAgICAgIHJldHVybjtcbi8vICAgICB9XG4vLyAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSwgaW5mbyk7XG4vLyAgIH0sXG4vL1xuLy8gICAvLyBBbnkgYWN0aW9ucyBzaG91bGQgYmUgc2VudCB0byB0aGUgZ2VuZXJpYyBvbkFjdGlvbiBjYWxsYmFjayBidXQgYWxzbyBzcGxpdFxuLy8gICAvLyBpbnRvIGRpc2NyZWV0IGNhbGxiYWNrcyBwZXIgYWN0aW9uLlxuLy8gICBvbkFjdGlvbjogZnVuY3Rpb24gKGluZm8pIHtcbi8vICAgICBpZiAodGhpcy5wcm9wcy5vbkFjdGlvbikge1xuLy8gICAgICAgdGhpcy5wcm9wcy5vbkFjdGlvbihpbmZvKTtcbi8vICAgICB9XG4vLyAgICAgdmFyIGFjdGlvbiA9IHV0aWxzLmRhc2hUb1Bhc2NhbChpbmZvLmFjdGlvbik7XG4vLyAgICAgaWYgKHRoaXMucHJvcHNbJ29uJyArIGFjdGlvbl0pIHtcbi8vICAgICAgIHRoaXMucHJvcHNbJ29uJyArIGFjdGlvbl0oaW5mbyk7XG4vLyAgICAgfVxuLy8gICB9LFxuLy9cbi8vICAgLy8gUmVuZGVyIHRoZSB3cmFwcGVyIGNvbXBvbmVudCAoYnkganVzdCBkZWxlZ2F0aW5nIHRvIHRoZSBtYWluIGNvbXBvbmVudCkuXG4vLyAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuLy9cbi8vICAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWcgfHwgZGVmYXVsdENvbmZpZztcbi8vICAgICB2YXIgdmFsdWUgPSB0aGlzLnN0YXRlLnZhbHVlO1xuLy9cbi8vICAgICBpZiAodGhpcy5zdGF0ZS5pc0NvbnRyb2xsZWQpIHtcbi8vICAgICAgIGlmICghdGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuLy8gICAgICAgICBjb25zb2xlLmxvZygnWW91IHNob3VsZCBzdXBwbHkgYW4gb25DaGFuZ2UgaGFuZGxlciBpZiB5b3Ugc3VwcGx5IGEgdmFsdWUuJyk7XG4vLyAgICAgICB9XG4vLyAgICAgfVxuLy9cbi8vICAgICB2YXIgcHJvcHMgPSB7XG4vLyAgICAgICBjb25maWc6IGNvbmZpZyxcbi8vICAgICAgIC8vIEFsbG93IGZpZWxkIHRlbXBsYXRlcyB0byBiZSBwYXNzZWQgaW4gYXMgYGZpZWxkYCBvciBgZmllbGRzYC4gQWZ0ZXIgdGhpcywgc3RvcFxuLy8gICAgICAgLy8gY2FsbGluZyB0aGVtIGZpZWxkcy5cbi8vICAgICAgIGZpZWxkVGVtcGxhdGU6IHRoaXMucHJvcHMuZmllbGQsXG4vLyAgICAgICBmaWVsZFRlbXBsYXRlczogdGhpcy5wcm9wcy5maWVsZHMsXG4vLyAgICAgICB2YWx1ZTogdmFsdWUsXG4vLyAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbi8vICAgICAgIG9uQWN0aW9uOiB0aGlzLm9uQWN0aW9uXG4vLyAgICAgfTtcbi8vXG4vLyAgICAgXy5lYWNoKHRoaXMucHJvcHMsIGZ1bmN0aW9uIChwcm9wVmFsdWUsIGtleSkge1xuLy8gICAgICAgaWYgKCEoa2V5IGluIHByb3BzKSkge1xuLy8gICAgICAgICBwcm9wc1trZXldID0gcHJvcFZhbHVlO1xuLy8gICAgICAgfVxuLy8gICAgIH0pO1xuLy9cbi8vICAgICByZXR1cm4gRm9ybWF0aWNDb250cm9sbGVkKHByb3BzKTtcbi8vICAgfVxuLy9cbi8vIH0pO1xuIiwidmFyIF8gPSB7fTtcblxuXy5hc3NpZ24gPSBfLmV4dGVuZCA9IHJlcXVpcmUoJ29iamVjdC1hc3NpZ24nKTtcbl8uaXNFcXVhbCA9IHJlcXVpcmUoJ2RlZXAtZXF1YWwnKTtcblxuLy8gVGhlc2UgYXJlIG5vdCBuZWNlc3NhcmlseSBjb21wbGV0ZSBpbXBsZW1lbnRhdGlvbnMuIFRoZXkncmUganVzdCBlbm91Z2ggZm9yXG4vLyB3aGF0J3MgdXNlZCBpbiBmb3JtYXRpYy5cblxuXy5mbGF0dGVuID0gKGFycmF5cykgPT4gW10uY29uY2F0LmFwcGx5KFtdLCBhcnJheXMpO1xuXG5fLmlzU3RyaW5nID0gdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJztcbl8uaXNVbmRlZmluZWQgPSB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnO1xuXy5pc09iamVjdCA9IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCc7XG5fLmlzQXJyYXkgPSB2YWx1ZSA9PiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpID09PSAnW29iamVjdCBBcnJheV0nO1xuXy5pc051bWJlciA9IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcic7XG5fLmlzQm9vbGVhbiA9IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nO1xuXy5pc051bGwgPSB2YWx1ZSA9PiB2YWx1ZSA9PT0gbnVsbDtcbl8uaXNGdW5jdGlvbiA9IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJztcblxuXy5jbG9uZSA9IHZhbHVlID0+IHtcbiAgaWYgKCFfLmlzT2JqZWN0KHZhbHVlKSkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICByZXR1cm4gXy5pc0FycmF5KHZhbHVlKSA/IHZhbHVlLnNsaWNlKCkgOiBfLmFzc2lnbih7fSwgdmFsdWUpO1xufTtcblxuXy5maW5kID0gKGl0ZW1zLCB0ZXN0Rm4pID0+IHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuICAgIGlmICh0ZXN0Rm4oaXRlbXNbaV0pKSB7XG4gICAgICByZXR1cm4gaXRlbXNbaV07XG4gICAgfVxuICB9XG4gIHJldHVybiB2b2lkIDA7XG59O1xuXG5fLmV2ZXJ5ID0gKGl0ZW1zLCB0ZXN0Rm4pID0+IHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuICAgIGlmICghdGVzdEZuKGl0ZW1zW2ldKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbl8uZWFjaCA9IChvYmosIGl0ZXJhdGVGbikgPT4ge1xuICBPYmplY3Qua2V5cyhvYmopLmZvckVhY2goa2V5ID0+IHtcbiAgICBpdGVyYXRlRm4ob2JqW2tleV0sIGtleSk7XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBfO1xuIiwidmFyIHBTbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcbnZhciBvYmplY3RLZXlzID0gcmVxdWlyZSgnLi9saWIva2V5cy5qcycpO1xudmFyIGlzQXJndW1lbnRzID0gcmVxdWlyZSgnLi9saWIvaXNfYXJndW1lbnRzLmpzJyk7XG5cbnZhciBkZWVwRXF1YWwgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChhY3R1YWwsIGV4cGVjdGVkLCBvcHRzKSB7XG4gIGlmICghb3B0cykgb3B0cyA9IHt9O1xuICAvLyA3LjEuIEFsbCBpZGVudGljYWwgdmFsdWVzIGFyZSBlcXVpdmFsZW50LCBhcyBkZXRlcm1pbmVkIGJ5ID09PS5cbiAgaWYgKGFjdHVhbCA9PT0gZXhwZWN0ZWQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcblxuICB9IGVsc2UgaWYgKGFjdHVhbCBpbnN0YW5jZW9mIERhdGUgJiYgZXhwZWN0ZWQgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgcmV0dXJuIGFjdHVhbC5nZXRUaW1lKCkgPT09IGV4cGVjdGVkLmdldFRpbWUoKTtcblxuICAvLyA3LjMuIE90aGVyIHBhaXJzIHRoYXQgZG8gbm90IGJvdGggcGFzcyB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcsXG4gIC8vIGVxdWl2YWxlbmNlIGlzIGRldGVybWluZWQgYnkgPT0uXG4gIH0gZWxzZSBpZiAodHlwZW9mIGFjdHVhbCAhPSAnb2JqZWN0JyAmJiB0eXBlb2YgZXhwZWN0ZWQgIT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gb3B0cy5zdHJpY3QgPyBhY3R1YWwgPT09IGV4cGVjdGVkIDogYWN0dWFsID09IGV4cGVjdGVkO1xuXG4gIC8vIDcuNC4gRm9yIGFsbCBvdGhlciBPYmplY3QgcGFpcnMsIGluY2x1ZGluZyBBcnJheSBvYmplY3RzLCBlcXVpdmFsZW5jZSBpc1xuICAvLyBkZXRlcm1pbmVkIGJ5IGhhdmluZyB0aGUgc2FtZSBudW1iZXIgb2Ygb3duZWQgcHJvcGVydGllcyAoYXMgdmVyaWZpZWRcbiAgLy8gd2l0aCBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwpLCB0aGUgc2FtZSBzZXQgb2Yga2V5c1xuICAvLyAoYWx0aG91Z2ggbm90IG5lY2Vzc2FyaWx5IHRoZSBzYW1lIG9yZGVyKSwgZXF1aXZhbGVudCB2YWx1ZXMgZm9yIGV2ZXJ5XG4gIC8vIGNvcnJlc3BvbmRpbmcga2V5LCBhbmQgYW4gaWRlbnRpY2FsICdwcm90b3R5cGUnIHByb3BlcnR5LiBOb3RlOiB0aGlzXG4gIC8vIGFjY291bnRzIGZvciBib3RoIG5hbWVkIGFuZCBpbmRleGVkIHByb3BlcnRpZXMgb24gQXJyYXlzLlxuICB9IGVsc2Uge1xuICAgIHJldHVybiBvYmpFcXVpdihhY3R1YWwsIGV4cGVjdGVkLCBvcHRzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZE9yTnVsbCh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gaXNCdWZmZXIgKHgpIHtcbiAgaWYgKCF4IHx8IHR5cGVvZiB4ICE9PSAnb2JqZWN0JyB8fCB0eXBlb2YgeC5sZW5ndGggIT09ICdudW1iZXInKSByZXR1cm4gZmFsc2U7XG4gIGlmICh0eXBlb2YgeC5jb3B5ICE9PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiB4LnNsaWNlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICh4Lmxlbmd0aCA+IDAgJiYgdHlwZW9mIHhbMF0gIT09ICdudW1iZXInKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBvYmpFcXVpdihhLCBiLCBvcHRzKSB7XG4gIHZhciBpLCBrZXk7XG4gIGlmIChpc1VuZGVmaW5lZE9yTnVsbChhKSB8fCBpc1VuZGVmaW5lZE9yTnVsbChiKSlcbiAgICByZXR1cm4gZmFsc2U7XG4gIC8vIGFuIGlkZW50aWNhbCAncHJvdG90eXBlJyBwcm9wZXJ0eS5cbiAgaWYgKGEucHJvdG90eXBlICE9PSBiLnByb3RvdHlwZSkgcmV0dXJuIGZhbHNlO1xuICAvL35+fkkndmUgbWFuYWdlZCB0byBicmVhayBPYmplY3Qua2V5cyB0aHJvdWdoIHNjcmV3eSBhcmd1bWVudHMgcGFzc2luZy5cbiAgLy8gICBDb252ZXJ0aW5nIHRvIGFycmF5IHNvbHZlcyB0aGUgcHJvYmxlbS5cbiAgaWYgKGlzQXJndW1lbnRzKGEpKSB7XG4gICAgaWYgKCFpc0FyZ3VtZW50cyhiKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBhID0gcFNsaWNlLmNhbGwoYSk7XG4gICAgYiA9IHBTbGljZS5jYWxsKGIpO1xuICAgIHJldHVybiBkZWVwRXF1YWwoYSwgYiwgb3B0cyk7XG4gIH1cbiAgaWYgKGlzQnVmZmVyKGEpKSB7XG4gICAgaWYgKCFpc0J1ZmZlcihiKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoYS5sZW5ndGggIT09IGIubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gICAgZm9yIChpID0gMDsgaSA8IGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChhW2ldICE9PSBiW2ldKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHRyeSB7XG4gICAgdmFyIGthID0gb2JqZWN0S2V5cyhhKSxcbiAgICAgICAga2IgPSBvYmplY3RLZXlzKGIpO1xuICB9IGNhdGNoIChlKSB7Ly9oYXBwZW5zIHdoZW4gb25lIGlzIGEgc3RyaW5nIGxpdGVyYWwgYW5kIHRoZSBvdGhlciBpc24ndFxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvLyBoYXZpbmcgdGhlIHNhbWUgbnVtYmVyIG9mIG93bmVkIHByb3BlcnRpZXMgKGtleXMgaW5jb3Jwb3JhdGVzXG4gIC8vIGhhc093blByb3BlcnR5KVxuICBpZiAoa2EubGVuZ3RoICE9IGtiLmxlbmd0aClcbiAgICByZXR1cm4gZmFsc2U7XG4gIC8vdGhlIHNhbWUgc2V0IG9mIGtleXMgKGFsdGhvdWdoIG5vdCBuZWNlc3NhcmlseSB0aGUgc2FtZSBvcmRlciksXG4gIGthLnNvcnQoKTtcbiAga2Iuc29ydCgpO1xuICAvL35+fmNoZWFwIGtleSB0ZXN0XG4gIGZvciAoaSA9IGthLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgaWYgKGthW2ldICE9IGtiW2ldKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vZXF1aXZhbGVudCB2YWx1ZXMgZm9yIGV2ZXJ5IGNvcnJlc3BvbmRpbmcga2V5LCBhbmRcbiAgLy9+fn5wb3NzaWJseSBleHBlbnNpdmUgZGVlcCB0ZXN0XG4gIGZvciAoaSA9IGthLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAga2V5ID0ga2FbaV07XG4gICAgaWYgKCFkZWVwRXF1YWwoYVtrZXldLCBiW2tleV0sIG9wdHMpKSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHR5cGVvZiBhID09PSB0eXBlb2YgYjtcbn1cbiIsInZhciBzdXBwb3J0c0FyZ3VtZW50c0NsYXNzID0gKGZ1bmN0aW9uKCl7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYXJndW1lbnRzKVxufSkoKSA9PSAnW29iamVjdCBBcmd1bWVudHNdJztcblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gc3VwcG9ydHNBcmd1bWVudHNDbGFzcyA/IHN1cHBvcnRlZCA6IHVuc3VwcG9ydGVkO1xuXG5leHBvcnRzLnN1cHBvcnRlZCA9IHN1cHBvcnRlZDtcbmZ1bmN0aW9uIHN1cHBvcnRlZChvYmplY3QpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmplY3QpID09ICdbb2JqZWN0IEFyZ3VtZW50c10nO1xufTtcblxuZXhwb3J0cy51bnN1cHBvcnRlZCA9IHVuc3VwcG9ydGVkO1xuZnVuY3Rpb24gdW5zdXBwb3J0ZWQob2JqZWN0KXtcbiAgcmV0dXJuIG9iamVjdCAmJlxuICAgIHR5cGVvZiBvYmplY3QgPT0gJ29iamVjdCcgJiZcbiAgICB0eXBlb2Ygb2JqZWN0Lmxlbmd0aCA9PSAnbnVtYmVyJyAmJlxuICAgIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsICdjYWxsZWUnKSAmJlxuICAgICFPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwob2JqZWN0LCAnY2FsbGVlJykgfHxcbiAgICBmYWxzZTtcbn07XG4iLCJleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSB0eXBlb2YgT2JqZWN0LmtleXMgPT09ICdmdW5jdGlvbidcbiAgPyBPYmplY3Qua2V5cyA6IHNoaW07XG5cbmV4cG9ydHMuc2hpbSA9IHNoaW07XG5mdW5jdGlvbiBzaGltIChvYmopIHtcbiAgdmFyIGtleXMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikga2V5cy5wdXNoKGtleSk7XG4gIHJldHVybiBrZXlzO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBUb09iamVjdCh2YWwpIHtcblx0aWYgKHZhbCA9PSBudWxsKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignT2JqZWN0LmFzc2lnbiBjYW5ub3QgYmUgY2FsbGVkIHdpdGggbnVsbCBvciB1bmRlZmluZWQnKTtcblx0fVxuXG5cdHJldHVybiBPYmplY3QodmFsKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQsIHNvdXJjZSkge1xuXHR2YXIgZnJvbTtcblx0dmFyIGtleXM7XG5cdHZhciB0byA9IFRvT2JqZWN0KHRhcmdldCk7XG5cblx0Zm9yICh2YXIgcyA9IDE7IHMgPCBhcmd1bWVudHMubGVuZ3RoOyBzKyspIHtcblx0XHRmcm9tID0gYXJndW1lbnRzW3NdO1xuXHRcdGtleXMgPSBPYmplY3Qua2V5cyhPYmplY3QoZnJvbSkpO1xuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR0b1trZXlzW2ldXSA9IGZyb21ba2V5c1tpXV07XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHRvO1xufTtcbiJdfQ==
