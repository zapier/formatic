!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Formatic=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/justin/Dropbox/git/formatic/index.js":[function(require,module,exports){
"use strict";

// # index

// Export the Formatic React class at the top level.
module.exports = require("./lib/formatic");

},{"./lib/formatic":"/Users/justin/Dropbox/git/formatic/lib/formatic.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/containers/uncontrolled.js":[function(require,module,exports){
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

},{"../../undash":"/Users/justin/Dropbox/git/formatic/lib/undash.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/index.js":[function(require,module,exports){
"use strict";

//const wrap = require('./wrap-component');
//const createField = require('./create-field');
//const createInput = require('./create-input');

module.exports = {
  UncontrolledContainer: require("./containers/uncontrolled"),
  //InputContainer: require('./containers/input') //,
  StringInput: require("./inputs/string")
  //StringField: require('./fields/string')
  // FieldsField: createField('Fields'),
  // StringField: createField('String'),
  // FieldsInput: wrap(require('./inputs/fields')),
  //StringInput: createInput('String')
  // Field: wrap(require('./helpers/field')),
  // Label: wrap(require('./helpers/label')),
  // Help: wrap(require('./helpers/help'))
};

},{"./containers/uncontrolled":"/Users/justin/Dropbox/git/formatic/lib/components/containers/uncontrolled.js","./inputs/string":"/Users/justin/Dropbox/git/formatic/lib/components/inputs/string.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/inputs/string.js":[function(require,module,exports){
(function (global){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

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
    var _props = this.props;
    var value = _props.value;
    var defaultValue = _props.defaultValue;

    return React.createElement("textarea", { onChange: this.onChange, value: value, defaultValue: defaultValue, onFocus: this.onFocus, onBlur: this.onBlur });

    // const Input = this.props.component('Input');
    // return (
    //   <Input onChange={this.props.onChange}>
    //     {
    //       ({onChange, value}) => <textarea value={value} onChange={onChange}/>
    //     }
    //   </Input>
    // );
  }
});

module.exports = StringInput;

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

  statics: _.extend({}, Components),

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

//wrap: require('./components/wrap-component')
//field: require('./components/wrap-field'),
//helper: require('./components/wrap-helper')

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2luZGV4LmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9jb250YWluZXJzL3VuY29udHJvbGxlZC5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaW5kZXguanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2lucHV0cy9zdHJpbmcuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9mb3JtYXRpYy5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL3VuZGFzaC5qcyIsIm5vZGVfbW9kdWxlcy9kZWVwLWVxdWFsL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RlZXAtZXF1YWwvbGliL2lzX2FyZ3VtZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9kZWVwLWVxdWFsL2xpYi9rZXlzLmpzIiwibm9kZV9tb2R1bGVzL29iamVjdC1hc3NpZ24vaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztBQ0dBLE1BQU0sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7Ozs7OztBQ0gzQyxJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDL0IsSUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDOztBQUVsQyxNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7O0FBRWpDLGFBQVcsRUFBRSx1QkFBdUI7O0FBRXBDLGlCQUFlLEVBQUEsMkJBQUc7QUFDaEIsV0FBTztBQUNMLGtC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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vICMgaW5kZXhcblxuLy8gRXhwb3J0IHRoZSBGb3JtYXRpYyBSZWFjdCBjbGFzcyBhdCB0aGUgdG9wIGxldmVsLlxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9mb3JtYXRpYycpO1xuIiwiY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuY29uc3QgXyA9IHJlcXVpcmUoJy4uLy4uL3VuZGFzaCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ1VuY29udHJvbGxlZENvbnRhaW5lcicsXG5cbiAgZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpc0NvbnRyb2xsZWQ6ICFfLmlzVW5kZWZpbmVkKHRoaXMucHJvcHMudmFsdWUpLFxuICAgICAgdmFsdWU6IF8uaXNVbmRlZmluZWQodGhpcy5wcm9wcy52YWx1ZSkgPyB0aGlzLnByb3BzLmRlZmF1bHRWYWx1ZSA6IHRoaXMucHJvcHMudmFsdWVcbiAgICB9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV3UHJvcHMpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5pc0NvbnRyb2xsZWQpIHtcbiAgICAgIGlmICghXy5pc1VuZGVmaW5lZChuZXdQcm9wcy52YWx1ZSkpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgdmFsdWU6IG5ld1Byb3BzLnZhbHVlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBvbkNoYW5nZShldmVudCkge1xuICAgIGNvbnN0IHtvbkNoYW5nZX0gPSB0aGlzLnByb3BzO1xuICAgIGlmICghdGhpcy5zdGF0ZS5pc0NvbnRyb2xsZWQpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICB2YWx1ZTogZXZlbnQudmFsdWVcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoIW9uQ2hhbmdlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIG9uQ2hhbmdlKGV2ZW50KTtcbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgY29uc3Qge2NoaWxkcmVufSA9IHRoaXMucHJvcHM7XG5cbiAgICBjb25zdCBjaGlsZCA9IFJlYWN0LkNoaWxkcmVuLm9ubHkoY2hpbGRyZW4pO1xuXG4gICAgY29uc3QgY2hpbGRQcm9wcyA9IF8uZXh0ZW5kKHt9LCB0aGlzLnByb3BzLCB7XG4gICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZVxuICAgIH0pO1xuXG4gICAgY29uc3QgY2xvbmVkQ2hpbGQgPSBSZWFjdC5jbG9uZUVsZW1lbnQoY2hpbGQsIGNoaWxkUHJvcHMpO1xuXG4gICAgcmV0dXJuIGNsb25lZENoaWxkO1xuICB9XG59KTtcbiIsIi8vY29uc3Qgd3JhcCA9IHJlcXVpcmUoJy4vd3JhcC1jb21wb25lbnQnKTtcbi8vY29uc3QgY3JlYXRlRmllbGQgPSByZXF1aXJlKCcuL2NyZWF0ZS1maWVsZCcpO1xuLy9jb25zdCBjcmVhdGVJbnB1dCA9IHJlcXVpcmUoJy4vY3JlYXRlLWlucHV0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBVbmNvbnRyb2xsZWRDb250YWluZXI6IHJlcXVpcmUoJy4vY29udGFpbmVycy91bmNvbnRyb2xsZWQnKSxcbiAgLy9JbnB1dENvbnRhaW5lcjogcmVxdWlyZSgnLi9jb250YWluZXJzL2lucHV0JykgLy8sXG4gIFN0cmluZ0lucHV0OiByZXF1aXJlKCcuL2lucHV0cy9zdHJpbmcnKVxuICAvL1N0cmluZ0ZpZWxkOiByZXF1aXJlKCcuL2ZpZWxkcy9zdHJpbmcnKVxuICAvLyBGaWVsZHNGaWVsZDogY3JlYXRlRmllbGQoJ0ZpZWxkcycpLFxuICAvLyBTdHJpbmdGaWVsZDogY3JlYXRlRmllbGQoJ1N0cmluZycpLFxuICAvLyBGaWVsZHNJbnB1dDogd3JhcChyZXF1aXJlKCcuL2lucHV0cy9maWVsZHMnKSksXG4gIC8vU3RyaW5nSW5wdXQ6IGNyZWF0ZUlucHV0KCdTdHJpbmcnKVxuICAvLyBGaWVsZDogd3JhcChyZXF1aXJlKCcuL2hlbHBlcnMvZmllbGQnKSksXG4gIC8vIExhYmVsOiB3cmFwKHJlcXVpcmUoJy4vaGVscGVycy9sYWJlbCcpKSxcbiAgLy8gSGVscDogd3JhcChyZXF1aXJlKCcuL2hlbHBlcnMvaGVscCcpKVxufTtcbiIsImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmNvbnN0IFN0cmluZ0lucHV0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnU3RyaW5nSW5wdXQnLFxuXG4gIC8vIHByb3BUeXBlczoge1xuICAvLyAgIGNvbXBvbmVudDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMucmVxdWlyZWRcbiAgLy8gfSxcblxuICBvbkNoYW5nZShldmVudCkge1xuICAgIGNvbnN0IHtvbkNoYW5nZX0gPSB0aGlzLnByb3BzO1xuXG4gICAgaWYgKG9uQ2hhbmdlKSB7XG4gICAgICBvbkNoYW5nZSh7XG4gICAgICAgIHZhbHVlOiBldmVudC50YXJnZXQudmFsdWVcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcblxuICBvbkZvY3VzKCkge1xuICAgIGNvbnN0IHtvbkZvY3VzfSA9IHRoaXMucHJvcHM7XG5cbiAgICBpZiAob25Gb2N1cykge1xuICAgICAgb25Gb2N1cyh7fSk7XG4gICAgfVxuICB9LFxuXG4gIG9uQmx1cigpIHtcbiAgICBjb25zdCB7b25CbHVyfSA9IHRoaXMucHJvcHM7XG5cbiAgICBpZiAob25CbHVyKSB7XG4gICAgICBvbkJsdXIoe30pO1xuICAgIH1cbiAgfSxcblxuICByZW5kZXIoKSB7XG5cbiAgICBjb25zdCB7dmFsdWUsIGRlZmF1bHRWYWx1ZX0gPSB0aGlzLnByb3BzO1xuXG4gICAgcmV0dXJuIDx0ZXh0YXJlYSBvbkNoYW5nZT17dGhpcy5vbkNoYW5nZX0gdmFsdWU9e3ZhbHVlfSBkZWZhdWx0VmFsdWU9e2RlZmF1bHRWYWx1ZX0gb25Gb2N1cz17dGhpcy5vbkZvY3VzfSBvbkJsdXI9e3RoaXMub25CbHVyfS8+O1xuXG4gICAgLy8gY29uc3QgSW5wdXQgPSB0aGlzLnByb3BzLmNvbXBvbmVudCgnSW5wdXQnKTtcbiAgICAvLyByZXR1cm4gKFxuICAgIC8vICAgPElucHV0IG9uQ2hhbmdlPXt0aGlzLnByb3BzLm9uQ2hhbmdlfT5cbiAgICAvLyAgICAge1xuICAgIC8vICAgICAgICh7b25DaGFuZ2UsIHZhbHVlfSkgPT4gPHRleHRhcmVhIHZhbHVlPXt2YWx1ZX0gb25DaGFuZ2U9e29uQ2hhbmdlfS8+XG4gICAgLy8gICAgIH1cbiAgICAvLyAgIDwvSW5wdXQ+XG4gICAgLy8gKTtcbiAgfVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IFN0cmluZ0lucHV0O1xuIiwiY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuY29uc3QgXyA9IHJlcXVpcmUoJy4vdW5kYXNoJyk7XG5jb25zdCBDb21wb25lbnRzID0gcmVxdWlyZSgnLi9jb21wb25lbnRzJyk7XG4vL2NvbnN0IENvbXBvbmVudENvbnRhaW5lciA9IHJlcXVpcmUoJy4vY29tcG9uZW50LWNvbnRhaW5lcicpO1xuXG4vL0NvbXBvbmVudENvbnRhaW5lci5zZXRDb21wb25lbnRzKENvbXBvbmVudHMpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBzdGF0aWNzOiBfLmV4dGVuZCh7XG4gICAgLy93cmFwOiByZXF1aXJlKCcuL2NvbXBvbmVudHMvd3JhcC1jb21wb25lbnQnKVxuICAgIC8vZmllbGQ6IHJlcXVpcmUoJy4vY29tcG9uZW50cy93cmFwLWZpZWxkJyksXG4gICAgLy9oZWxwZXI6IHJlcXVpcmUoJy4vY29tcG9uZW50cy93cmFwLWhlbHBlcicpXG4gIH0sXG4gICAgQ29tcG9uZW50c1xuICApLFxuXG4gIGNvbXBvbmVudChuYW1lKSB7XG4gICAgaWYgKHRoaXMucHJvcHMuY29tcG9uZW50KSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wcy5jb21wb25lbnQobmFtZSk7XG4gICAgfVxuICAgIGNvbnN0IGNvbXBvbmVudENsYXNzID0gdGhpcy5wcm9wcy5jb21wb25lbnRzICYmIHRoaXMucHJvcHMuY29tcG9uZW50c1tuYW1lXTtcbiAgICBpZiAoY29tcG9uZW50Q2xhc3MpIHtcbiAgICAgIHJldHVybiBjb21wb25lbnRDbGFzcztcbiAgICB9XG4gICAgcmV0dXJuIENvbXBvbmVudHNbbmFtZV0gfHwgQ29tcG9uZW50cy5Vbmtub3duO1xuICB9LFxuXG4gIHJlbmRlcigpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5jaGlsZHJlbiAmJiAhXy5pc0FycmF5KHRoaXMucHJvcHMuY2hpbGRyZW4pKSB7XG4gICAgICBjb25zdCBwcm9wcyA9IF8uZXh0ZW5kKHt9LCB0aGlzLnByb3BzLCB7Y29tcG9uZW50OiB0aGlzLmNvbXBvbmVudH0pO1xuICAgICAgcmV0dXJuIFJlYWN0LmNsb25lRWxlbWVudCh0aGlzLnByb3BzLmNoaWxkcmVuLCBwcm9wcyk7XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcignWW91IG11c3QgcHJvdmlkZSBleGFjdGx5IG9uZSBjaGlsZCB0byB0aGUgRm9ybWF0aWMgY29tcG9uZW50LicpO1xuICB9XG5cbn0pO1xuXG5cbi8vIC8vICMgZm9ybWF0aWNcbi8vXG4vLyAvKlxuLy8gVGhlIHJvb3QgZm9ybWF0aWMgY29tcG9uZW50LlxuLy9cbi8vIFRoZSByb290IGZvcm1hdGljIGNvbXBvbmVudCBpcyBhY3R1YWxseSB0d28gY29tcG9uZW50cy4gVGhlIG1haW4gY29tcG9uZW50IGlzXG4vLyBhIGNvbnRyb2xsZWQgY29tcG9uZW50IHdoZXJlIHlvdSBtdXN0IHBhc3MgdGhlIHZhbHVlIGluIHdpdGggZWFjaCByZW5kZXIuIFRoaXNcbi8vIGlzIGFjdHVhbGx5IHdyYXBwZWQgaW4gYW5vdGhlciBjb21wb25lbnQgd2hpY2ggYWxsb3dzIHlvdSB0byB1c2UgZm9ybWF0aWMgYXNcbi8vIGFuIHVuY29udHJvbGxlZCBjb21wb25lbnQgd2hlcmUgaXQgcmV0YWlucyB0aGUgc3RhdGUgb2YgdGhlIHZhbHVlLiBUaGUgd3JhcHBlclxuLy8gaXMgd2hhdCBpcyBhY3R1YWxseSBleHBvcnRlZC5cbi8vICovXG4vL1xuLy8gJ3VzZSBzdHJpY3QnO1xuLy9cbi8vIHZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuLy8gdmFyIF8gPSByZXF1aXJlKCcuL3VuZGFzaCcpO1xuLy9cbi8vIHZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbi8vXG4vLyB2YXIgZGVmYXVsdENvbmZpZ1BsdWdpbiA9IHJlcXVpcmUoJy4vZGVmYXVsdC1jb25maWcnKTtcbi8vXG4vLyB2YXIgY3JlYXRlQ29uZmlnID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbi8vICAgdmFyIHBsdWdpbnMgPSBbZGVmYXVsdENvbmZpZ1BsdWdpbl0uY29uY2F0KGFyZ3MpO1xuLy9cbi8vICAgcmV0dXJuIHBsdWdpbnMucmVkdWNlKGZ1bmN0aW9uIChjb25maWcsIHBsdWdpbikge1xuLy8gICAgIGlmIChfLmlzRnVuY3Rpb24ocGx1Z2luKSkge1xuLy8gICAgICAgdmFyIGV4dGVuc2lvbnMgPSBwbHVnaW4oY29uZmlnKTtcbi8vICAgICAgIGlmIChleHRlbnNpb25zKSB7XG4vLyAgICAgICAgIF8uZXh0ZW5kKGNvbmZpZywgZXh0ZW5zaW9ucyk7XG4vLyAgICAgICB9XG4vLyAgICAgfSBlbHNlIHtcbi8vICAgICAgIF8uZXh0ZW5kKGNvbmZpZywgcGx1Z2luKTtcbi8vICAgICB9XG4vL1xuLy8gICAgIHJldHVybiBjb25maWc7XG4vLyAgIH0sIHt9KTtcbi8vIH07XG4vL1xuLy8gdmFyIGRlZmF1bHRDb25maWcgPSBjcmVhdGVDb25maWcoKTtcbi8vXG4vLyAvLyBUaGUgbWFpbiBmb3JtYXRpYyBjb21wb25lbnQgdGhhdCByZW5kZXJzIHRoZSBmb3JtLlxuLy8gdmFyIEZvcm1hdGljQ29udHJvbGxlZENsYXNzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuLy9cbi8vICAgZGlzcGxheU5hbWU6ICdGb3JtYXRpY0NvbnRyb2xsZWQnLFxuLy9cbi8vICAgLy8gUmVzcG9uZCB0byBhbnkgdmFsdWUgY2hhbmdlcy5cbi8vICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgaW5mbykge1xuLy8gICAgIGlmICghdGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuLy8gICAgICAgcmV0dXJuO1xuLy8gICAgIH1cbi8vICAgICBpbmZvID0gXy5leHRlbmQoe30sIGluZm8pO1xuLy8gICAgIGluZm8ucGF0aCA9IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkVmFsdWVQYXRoKGluZm8uZmllbGQpO1xuLy8gICAgIHRoaXMucHJvcHMub25DaGFuZ2UobmV3VmFsdWUsIGluZm8pO1xuLy8gICB9LFxuLy9cbi8vICAgLy8gUmVzcG9uZCB0byBhbnkgYWN0aW9ucyBvdGhlciB0aGFuIHZhbHVlIGNoYW5nZXMuIChGb3IgZXhhbXBsZSwgZm9jdXMgYW5kXG4vLyAgIC8vIGJsdXIuKVxuLy8gICBvbkFjdGlvbjogZnVuY3Rpb24gKGluZm8pIHtcbi8vICAgICBpZiAoIXRoaXMucHJvcHMub25BY3Rpb24pIHtcbi8vICAgICAgIHJldHVybjtcbi8vICAgICB9XG4vLyAgICAgaW5mbyA9IF8uZXh0ZW5kKHt9LCBpbmZvKTtcbi8vICAgICBpbmZvLnBhdGggPSB0aGlzLnByb3BzLmNvbmZpZy5maWVsZFZhbHVlUGF0aChpbmZvLmZpZWxkKTtcbi8vICAgICB0aGlzLnByb3BzLm9uQWN0aW9uKGluZm8pO1xuLy8gICB9LFxuLy9cbi8vICAgLy8gUmVuZGVyIHRoZSByb290IGNvbXBvbmVudCBieSBkZWxlZ2F0aW5nIHRvIHRoZSBjb25maWcuXG4vLyAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuLy9cbi8vICAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4vL1xuLy8gICAgIHJldHVybiBjb25maWcucmVuZGVyRm9ybWF0aWNDb21wb25lbnQodGhpcyk7XG4vLyAgIH1cbi8vIH0pO1xuLy9cbi8vIHZhciBGb3JtYXRpY0NvbnRyb2xsZWQgPSBSZWFjdC5jcmVhdGVGYWN0b3J5KEZvcm1hdGljQ29udHJvbGxlZENsYXNzKTtcbi8vXG4vLyAvLyBBIHdyYXBwZXIgY29tcG9uZW50IHRoYXQgaXMgYWN0dWFsbHkgZXhwb3J0ZWQgYW5kIGNhbiBhbGxvdyBmb3JtYXRpYyB0byBiZVxuLy8gLy8gdXNlZCBpbiBhbiBcInVuY29udHJvbGxlZFwiIG1hbm5lci4gKFNlZSB1bmNvbnRyb2xsZWQgY29tcG9uZW50cyBpbiB0aGUgUmVhY3Rcbi8vIC8vIGRvY3VtZW50YXRpb24gZm9yIGFuIGV4cGxhbmF0aW9uIG9mIHRoZSBkaWZmZXJlbmNlLilcbi8vIG1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuLy9cbi8vICAgLy8gRXhwb3J0IHNvbWUgc3R1ZmYgYXMgc3RhdGljcy5cbi8vICAgc3RhdGljczoge1xuLy8gICAgIGNyZWF0ZUNvbmZpZzogY3JlYXRlQ29uZmlnLFxuLy8gICAgIGF2YWlsYWJsZU1peGluczoge1xuLy8gICAgICAgY2xpY2tPdXRzaWRlOiByZXF1aXJlKCcuL21peGlucy9jbGljay1vdXRzaWRlLmpzJyksXG4vLyAgICAgICBmaWVsZDogcmVxdWlyZSgnLi9taXhpbnMvZmllbGQuanMnKSxcbi8vICAgICAgIGhlbHBlcjogcmVxdWlyZSgnLi9taXhpbnMvaGVscGVyLmpzJyksXG4vLyAgICAgICByZXNpemU6IHJlcXVpcmUoJy4vbWl4aW5zL3Jlc2l6ZS5qcycpLFxuLy8gICAgICAgc2Nyb2xsOiByZXF1aXJlKCcuL21peGlucy9zY3JvbGwuanMnKSxcbi8vICAgICAgIHVuZG9TdGFjazogcmVxdWlyZSgnLi9taXhpbnMvdW5kby1zdGFjay5qcycpXG4vLyAgICAgfSxcbi8vICAgICBwbHVnaW5zOiB7XG4vLyAgICAgICBib290c3RyYXA6IHJlcXVpcmUoJy4vcGx1Z2lucy9ib290c3RyYXAnKSxcbi8vICAgICAgIG1ldGE6IHJlcXVpcmUoJy4vcGx1Z2lucy9tZXRhJyksXG4vLyAgICAgICByZWZlcmVuY2U6IHJlcXVpcmUoJy4vcGx1Z2lucy9yZWZlcmVuY2UnKSxcbi8vICAgICAgIGVsZW1lbnRDbGFzc2VzOiByZXF1aXJlKCcuL3BsdWdpbnMvZWxlbWVudC1jbGFzc2VzJylcbi8vICAgICB9LFxuLy8gICAgIHV0aWxzOiB1dGlsc1xuLy8gICB9LFxuLy9cbi8vICAgZGlzcGxheU5hbWU6ICdGb3JtYXRpYycsXG4vL1xuLy8gICAvLyBJZiB3ZSBnb3QgYSB2YWx1ZSwgdHJlYXQgdGhpcyBjb21wb25lbnQgYXMgY29udHJvbGxlZC4gRWl0aGVyIHdheSwgcmV0YWluXG4vLyAgIC8vIHRoZSB2YWx1ZSBpbiB0aGUgc3RhdGUuXG4vLyAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuLy8gICAgIHJldHVybiB7XG4vLyAgICAgICBpc0NvbnRyb2xsZWQ6ICFfLmlzVW5kZWZpbmVkKHRoaXMucHJvcHMudmFsdWUpLFxuLy8gICAgICAgdmFsdWU6IF8uaXNVbmRlZmluZWQodGhpcy5wcm9wcy52YWx1ZSkgPyB0aGlzLnByb3BzLmRlZmF1bHRWYWx1ZSA6IHRoaXMucHJvcHMudmFsdWVcbi8vICAgICB9O1xuLy8gICB9LFxuLy9cbi8vICAgLy8gSWYgdGhpcyBpcyBhIGNvbnRyb2xsZWQgY29tcG9uZW50LCBjaGFuZ2Ugb3VyIHN0YXRlIHRvIHJlZmxlY3QgdGhlIG5ld1xuLy8gICAvLyB2YWx1ZS4gRm9yIHVuY29udHJvbGxlZCBjb21wb25lbnRzLCBpZ25vcmUgYW55IHZhbHVlIGNoYW5nZXMuXG4vLyAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXdQcm9wcykge1xuLy8gICAgIGlmICh0aGlzLnN0YXRlLmlzQ29udHJvbGxlZCkge1xuLy8gICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKG5ld1Byb3BzLnZhbHVlKSkge1xuLy8gICAgICAgICB0aGlzLnNldFN0YXRlKHtcbi8vICAgICAgICAgICB2YWx1ZTogbmV3UHJvcHMudmFsdWVcbi8vICAgICAgICAgfSk7XG4vLyAgICAgICB9XG4vLyAgICAgfVxuLy8gICB9LFxuLy9cbi8vICAgLy8gSWYgdGhpcyBpcyBhbiB1bmNvbnRyb2xsZWQgY29tcG9uZW50LCBzZXQgb3VyIHN0YXRlIHRvIHJlZmxlY3QgdGhlIG5ld1xuLy8gICAvLyB2YWx1ZS4gRWl0aGVyIHdheSwgY2FsbCB0aGUgb25DaGFuZ2UgY2FsbGJhY2suXG4vLyAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAobmV3VmFsdWUsIGluZm8pIHtcbi8vICAgICBpZiAoIXRoaXMuc3RhdGUuaXNDb250cm9sbGVkKSB7XG4vLyAgICAgICB0aGlzLnNldFN0YXRlKHtcbi8vICAgICAgICAgdmFsdWU6IG5ld1ZhbHVlXG4vLyAgICAgICB9KTtcbi8vICAgICB9XG4vLyAgICAgaWYgKCF0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4vLyAgICAgICByZXR1cm47XG4vLyAgICAgfVxuLy8gICAgIHRoaXMucHJvcHMub25DaGFuZ2UobmV3VmFsdWUsIGluZm8pO1xuLy8gICB9LFxuLy9cbi8vICAgLy8gQW55IGFjdGlvbnMgc2hvdWxkIGJlIHNlbnQgdG8gdGhlIGdlbmVyaWMgb25BY3Rpb24gY2FsbGJhY2sgYnV0IGFsc28gc3BsaXRcbi8vICAgLy8gaW50byBkaXNjcmVldCBjYWxsYmFja3MgcGVyIGFjdGlvbi5cbi8vICAgb25BY3Rpb246IGZ1bmN0aW9uIChpbmZvKSB7XG4vLyAgICAgaWYgKHRoaXMucHJvcHMub25BY3Rpb24pIHtcbi8vICAgICAgIHRoaXMucHJvcHMub25BY3Rpb24oaW5mbyk7XG4vLyAgICAgfVxuLy8gICAgIHZhciBhY3Rpb24gPSB1dGlscy5kYXNoVG9QYXNjYWwoaW5mby5hY3Rpb24pO1xuLy8gICAgIGlmICh0aGlzLnByb3BzWydvbicgKyBhY3Rpb25dKSB7XG4vLyAgICAgICB0aGlzLnByb3BzWydvbicgKyBhY3Rpb25dKGluZm8pO1xuLy8gICAgIH1cbi8vICAgfSxcbi8vXG4vLyAgIC8vIFJlbmRlciB0aGUgd3JhcHBlciBjb21wb25lbnQgKGJ5IGp1c3QgZGVsZWdhdGluZyB0byB0aGUgbWFpbiBjb21wb25lbnQpLlxuLy8gICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbi8vXG4vLyAgICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnIHx8IGRlZmF1bHRDb25maWc7XG4vLyAgICAgdmFyIHZhbHVlID0gdGhpcy5zdGF0ZS52YWx1ZTtcbi8vXG4vLyAgICAgaWYgKHRoaXMuc3RhdGUuaXNDb250cm9sbGVkKSB7XG4vLyAgICAgICBpZiAoIXRoaXMucHJvcHMub25DaGFuZ2UpIHtcbi8vICAgICAgICAgY29uc29sZS5sb2coJ1lvdSBzaG91bGQgc3VwcGx5IGFuIG9uQ2hhbmdlIGhhbmRsZXIgaWYgeW91IHN1cHBseSBhIHZhbHVlLicpO1xuLy8gICAgICAgfVxuLy8gICAgIH1cbi8vXG4vLyAgICAgdmFyIHByb3BzID0ge1xuLy8gICAgICAgY29uZmlnOiBjb25maWcsXG4vLyAgICAgICAvLyBBbGxvdyBmaWVsZCB0ZW1wbGF0ZXMgdG8gYmUgcGFzc2VkIGluIGFzIGBmaWVsZGAgb3IgYGZpZWxkc2AuIEFmdGVyIHRoaXMsIHN0b3Bcbi8vICAgICAgIC8vIGNhbGxpbmcgdGhlbSBmaWVsZHMuXG4vLyAgICAgICBmaWVsZFRlbXBsYXRlOiB0aGlzLnByb3BzLmZpZWxkLFxuLy8gICAgICAgZmllbGRUZW1wbGF0ZXM6IHRoaXMucHJvcHMuZmllbGRzLFxuLy8gICAgICAgdmFsdWU6IHZhbHVlLFxuLy8gICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsXG4vLyAgICAgICBvbkFjdGlvbjogdGhpcy5vbkFjdGlvblxuLy8gICAgIH07XG4vL1xuLy8gICAgIF8uZWFjaCh0aGlzLnByb3BzLCBmdW5jdGlvbiAocHJvcFZhbHVlLCBrZXkpIHtcbi8vICAgICAgIGlmICghKGtleSBpbiBwcm9wcykpIHtcbi8vICAgICAgICAgcHJvcHNba2V5XSA9IHByb3BWYWx1ZTtcbi8vICAgICAgIH1cbi8vICAgICB9KTtcbi8vXG4vLyAgICAgcmV0dXJuIEZvcm1hdGljQ29udHJvbGxlZChwcm9wcyk7XG4vLyAgIH1cbi8vXG4vLyB9KTtcbiIsInZhciBfID0ge307XG5cbl8uYXNzaWduID0gXy5leHRlbmQgPSByZXF1aXJlKCdvYmplY3QtYXNzaWduJyk7XG5fLmlzRXF1YWwgPSByZXF1aXJlKCdkZWVwLWVxdWFsJyk7XG5cbi8vIFRoZXNlIGFyZSBub3QgbmVjZXNzYXJpbHkgY29tcGxldGUgaW1wbGVtZW50YXRpb25zLiBUaGV5J3JlIGp1c3QgZW5vdWdoIGZvclxuLy8gd2hhdCdzIHVzZWQgaW4gZm9ybWF0aWMuXG5cbl8uZmxhdHRlbiA9IChhcnJheXMpID0+IFtdLmNvbmNhdC5hcHBseShbXSwgYXJyYXlzKTtcblxuXy5pc1N0cmluZyA9IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZyc7XG5fLmlzVW5kZWZpbmVkID0gdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJztcbl8uaXNPYmplY3QgPSB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnO1xuXy5pc0FycmF5ID0gdmFsdWUgPT4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbl8uaXNOdW1iZXIgPSB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInO1xuXy5pc0Jvb2xlYW4gPSB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJztcbl8uaXNOdWxsID0gdmFsdWUgPT4gdmFsdWUgPT09IG51bGw7XG5fLmlzRnVuY3Rpb24gPSB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbic7XG5cbl8uY2xvbmUgPSB2YWx1ZSA9PiB7XG4gIGlmICghXy5pc09iamVjdCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIF8uaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZS5zbGljZSgpIDogXy5hc3NpZ24oe30sIHZhbHVlKTtcbn07XG5cbl8uZmluZCA9IChpdGVtcywgdGVzdEZuKSA9PiB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAodGVzdEZuKGl0ZW1zW2ldKSkge1xuICAgICAgcmV0dXJuIGl0ZW1zW2ldO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdm9pZCAwO1xufTtcblxuXy5ldmVyeSA9IChpdGVtcywgdGVzdEZuKSA9PiB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoIXRlc3RGbihpdGVtc1tpXSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5fLmVhY2ggPSAob2JqLCBpdGVyYXRlRm4pID0+IHtcbiAgT2JqZWN0LmtleXMob2JqKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgaXRlcmF0ZUZuKG9ialtrZXldLCBrZXkpO1xuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gXztcbiIsInZhciBwU2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG52YXIgb2JqZWN0S2V5cyA9IHJlcXVpcmUoJy4vbGliL2tleXMuanMnKTtcbnZhciBpc0FyZ3VtZW50cyA9IHJlcXVpcmUoJy4vbGliL2lzX2FyZ3VtZW50cy5qcycpO1xuXG52YXIgZGVlcEVxdWFsID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYWN0dWFsLCBleHBlY3RlZCwgb3B0cykge1xuICBpZiAoIW9wdHMpIG9wdHMgPSB7fTtcbiAgLy8gNy4xLiBBbGwgaWRlbnRpY2FsIHZhbHVlcyBhcmUgZXF1aXZhbGVudCwgYXMgZGV0ZXJtaW5lZCBieSA9PT0uXG4gIGlmIChhY3R1YWwgPT09IGV4cGVjdGVkKSB7XG4gICAgcmV0dXJuIHRydWU7XG5cbiAgfSBlbHNlIGlmIChhY3R1YWwgaW5zdGFuY2VvZiBEYXRlICYmIGV4cGVjdGVkIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgIHJldHVybiBhY3R1YWwuZ2V0VGltZSgpID09PSBleHBlY3RlZC5nZXRUaW1lKCk7XG5cbiAgLy8gNy4zLiBPdGhlciBwYWlycyB0aGF0IGRvIG5vdCBib3RoIHBhc3MgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnLFxuICAvLyBlcXVpdmFsZW5jZSBpcyBkZXRlcm1pbmVkIGJ5ID09LlxuICB9IGVsc2UgaWYgKHR5cGVvZiBhY3R1YWwgIT0gJ29iamVjdCcgJiYgdHlwZW9mIGV4cGVjdGVkICE9ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIG9wdHMuc3RyaWN0ID8gYWN0dWFsID09PSBleHBlY3RlZCA6IGFjdHVhbCA9PSBleHBlY3RlZDtcblxuICAvLyA3LjQuIEZvciBhbGwgb3RoZXIgT2JqZWN0IHBhaXJzLCBpbmNsdWRpbmcgQXJyYXkgb2JqZWN0cywgZXF1aXZhbGVuY2UgaXNcbiAgLy8gZGV0ZXJtaW5lZCBieSBoYXZpbmcgdGhlIHNhbWUgbnVtYmVyIG9mIG93bmVkIHByb3BlcnRpZXMgKGFzIHZlcmlmaWVkXG4gIC8vIHdpdGggT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKSwgdGhlIHNhbWUgc2V0IG9mIGtleXNcbiAgLy8gKGFsdGhvdWdoIG5vdCBuZWNlc3NhcmlseSB0aGUgc2FtZSBvcmRlciksIGVxdWl2YWxlbnQgdmFsdWVzIGZvciBldmVyeVxuICAvLyBjb3JyZXNwb25kaW5nIGtleSwgYW5kIGFuIGlkZW50aWNhbCAncHJvdG90eXBlJyBwcm9wZXJ0eS4gTm90ZTogdGhpc1xuICAvLyBhY2NvdW50cyBmb3IgYm90aCBuYW1lZCBhbmQgaW5kZXhlZCBwcm9wZXJ0aWVzIG9uIEFycmF5cy5cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gb2JqRXF1aXYoYWN0dWFsLCBleHBlY3RlZCwgb3B0cyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWRPck51bGwodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIGlzQnVmZmVyICh4KSB7XG4gIGlmICgheCB8fCB0eXBlb2YgeCAhPT0gJ29iamVjdCcgfHwgdHlwZW9mIHgubGVuZ3RoICE9PSAnbnVtYmVyJykgcmV0dXJuIGZhbHNlO1xuICBpZiAodHlwZW9mIHguY29weSAhPT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgeC5zbGljZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAoeC5sZW5ndGggPiAwICYmIHR5cGVvZiB4WzBdICE9PSAnbnVtYmVyJykgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gb2JqRXF1aXYoYSwgYiwgb3B0cykge1xuICB2YXIgaSwga2V5O1xuICBpZiAoaXNVbmRlZmluZWRPck51bGwoYSkgfHwgaXNVbmRlZmluZWRPck51bGwoYikpXG4gICAgcmV0dXJuIGZhbHNlO1xuICAvLyBhbiBpZGVudGljYWwgJ3Byb3RvdHlwZScgcHJvcGVydHkuXG4gIGlmIChhLnByb3RvdHlwZSAhPT0gYi5wcm90b3R5cGUpIHJldHVybiBmYWxzZTtcbiAgLy9+fn5JJ3ZlIG1hbmFnZWQgdG8gYnJlYWsgT2JqZWN0LmtleXMgdGhyb3VnaCBzY3Jld3kgYXJndW1lbnRzIHBhc3NpbmcuXG4gIC8vICAgQ29udmVydGluZyB0byBhcnJheSBzb2x2ZXMgdGhlIHByb2JsZW0uXG4gIGlmIChpc0FyZ3VtZW50cyhhKSkge1xuICAgIGlmICghaXNBcmd1bWVudHMoYikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgYSA9IHBTbGljZS5jYWxsKGEpO1xuICAgIGIgPSBwU2xpY2UuY2FsbChiKTtcbiAgICByZXR1cm4gZGVlcEVxdWFsKGEsIGIsIG9wdHMpO1xuICB9XG4gIGlmIChpc0J1ZmZlcihhKSkge1xuICAgIGlmICghaXNCdWZmZXIoYikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGEubGVuZ3RoICE9PSBiLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICAgIGZvciAoaSA9IDA7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoYVtpXSAhPT0gYltpXSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICB0cnkge1xuICAgIHZhciBrYSA9IG9iamVjdEtleXMoYSksXG4gICAgICAgIGtiID0gb2JqZWN0S2V5cyhiKTtcbiAgfSBjYXRjaCAoZSkgey8vaGFwcGVucyB3aGVuIG9uZSBpcyBhIHN0cmluZyBsaXRlcmFsIGFuZCB0aGUgb3RoZXIgaXNuJ3RcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy8gaGF2aW5nIHRoZSBzYW1lIG51bWJlciBvZiBvd25lZCBwcm9wZXJ0aWVzIChrZXlzIGluY29ycG9yYXRlc1xuICAvLyBoYXNPd25Qcm9wZXJ0eSlcbiAgaWYgKGthLmxlbmd0aCAhPSBrYi5sZW5ndGgpXG4gICAgcmV0dXJuIGZhbHNlO1xuICAvL3RoZSBzYW1lIHNldCBvZiBrZXlzIChhbHRob3VnaCBub3QgbmVjZXNzYXJpbHkgdGhlIHNhbWUgb3JkZXIpLFxuICBrYS5zb3J0KCk7XG4gIGtiLnNvcnQoKTtcbiAgLy9+fn5jaGVhcCBrZXkgdGVzdFxuICBmb3IgKGkgPSBrYS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGlmIChrYVtpXSAhPSBrYltpXSlcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvL2VxdWl2YWxlbnQgdmFsdWVzIGZvciBldmVyeSBjb3JyZXNwb25kaW5nIGtleSwgYW5kXG4gIC8vfn5+cG9zc2libHkgZXhwZW5zaXZlIGRlZXAgdGVzdFxuICBmb3IgKGkgPSBrYS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGtleSA9IGthW2ldO1xuICAgIGlmICghZGVlcEVxdWFsKGFba2V5XSwgYltrZXldLCBvcHRzKSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0eXBlb2YgYSA9PT0gdHlwZW9mIGI7XG59XG4iLCJ2YXIgc3VwcG9ydHNBcmd1bWVudHNDbGFzcyA9IChmdW5jdGlvbigpe1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFyZ3VtZW50cylcbn0pKCkgPT0gJ1tvYmplY3QgQXJndW1lbnRzXSc7XG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHN1cHBvcnRzQXJndW1lbnRzQ2xhc3MgPyBzdXBwb3J0ZWQgOiB1bnN1cHBvcnRlZDtcblxuZXhwb3J0cy5zdXBwb3J0ZWQgPSBzdXBwb3J0ZWQ7XG5mdW5jdGlvbiBzdXBwb3J0ZWQob2JqZWN0KSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqZWN0KSA9PSAnW29iamVjdCBBcmd1bWVudHNdJztcbn07XG5cbmV4cG9ydHMudW5zdXBwb3J0ZWQgPSB1bnN1cHBvcnRlZDtcbmZ1bmN0aW9uIHVuc3VwcG9ydGVkKG9iamVjdCl7XG4gIHJldHVybiBvYmplY3QgJiZcbiAgICB0eXBlb2Ygb2JqZWN0ID09ICdvYmplY3QnICYmXG4gICAgdHlwZW9mIG9iamVjdC5sZW5ndGggPT0gJ251bWJlcicgJiZcbiAgICBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCAnY2FsbGVlJykgJiZcbiAgICAhT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKG9iamVjdCwgJ2NhbGxlZScpIHx8XG4gICAgZmFsc2U7XG59O1xuIiwiZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gdHlwZW9mIE9iamVjdC5rZXlzID09PSAnZnVuY3Rpb24nXG4gID8gT2JqZWN0LmtleXMgOiBzaGltO1xuXG5leHBvcnRzLnNoaW0gPSBzaGltO1xuZnVuY3Rpb24gc2hpbSAob2JqKSB7XG4gIHZhciBrZXlzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBvYmopIGtleXMucHVzaChrZXkpO1xuICByZXR1cm4ga2V5cztcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gVG9PYmplY3QodmFsKSB7XG5cdGlmICh2YWwgPT0gbnVsbCkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ09iamVjdC5hc3NpZ24gY2Fubm90IGJlIGNhbGxlZCB3aXRoIG51bGwgb3IgdW5kZWZpbmVkJyk7XG5cdH1cblxuXHRyZXR1cm4gT2JqZWN0KHZhbCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0LCBzb3VyY2UpIHtcblx0dmFyIGZyb207XG5cdHZhciBrZXlzO1xuXHR2YXIgdG8gPSBUb09iamVjdCh0YXJnZXQpO1xuXG5cdGZvciAodmFyIHMgPSAxOyBzIDwgYXJndW1lbnRzLmxlbmd0aDsgcysrKSB7XG5cdFx0ZnJvbSA9IGFyZ3VtZW50c1tzXTtcblx0XHRrZXlzID0gT2JqZWN0LmtleXMoT2JqZWN0KGZyb20pKTtcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dG9ba2V5c1tpXV0gPSBmcm9tW2tleXNbaV1dO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiB0bztcbn07XG4iXX0=
