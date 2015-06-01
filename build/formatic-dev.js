!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Formatic=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/justin/Dropbox/git/formatic/index.js":[function(require,module,exports){
"use strict";

// # index

// Export the Formatic React class at the top level.
module.exports = require("./lib/formatic");

},{"./lib/formatic":"/Users/justin/Dropbox/git/formatic/lib/formatic.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/fields/string.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

module.exports = React.createClass({

  displayName: "StringField",

  onChange: function onChange(event) {
    this.props.onChange(event.target.value);
  },

  render: function render() {
    var config = this.props.config;

    var Field = config.helperClass("field");

    return React.createElement(
      Field,
      this.props,
      React.createElement("textarea", { value: this.props.value, onChange: this.onChange })
    );
  }

});

// // # string component
//
// /*
// Render a field that can edit a string value.
// */
//
// 'use strict';
//
// var React = require('react/addons');
// var R = React.DOM;
// var cx = require('classnames');
//
// module.exports = React.createClass({
//
//   displayName: 'String',
//
//   mixins: [require('../../mixins/field')],
//
//   onChange: function (event) {
//     this.onChangeValue(event.target.value);
//   },
//
//   render: function () {
//     return this.renderWithConfig();
//   },
//
//   renderDefault: function () {
//
//     var config = this.props.config;
//     var field = this.props.field;
//
//     return config.createElement('field', {
//       config: config, field: field, plain: this.props.plain
//     }, R.textarea({
//       value: field.value,
//       className: cx(this.props.classes),
//       rows: field.rows || this.props.rows,
//       onChange: this.onChange,
//       onFocus: this.onFocusAction,
//       onBlur: this.onBlurAction
//     }));
//   }
// });

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/justin/Dropbox/git/formatic/lib/components/helpers/field.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var Config = require("../../config");

module.exports = React.createClass({

  displayName: "Field",

  render: function render() {
    var config = Config.forComponent(this);

    var Label = config.helperClass("label");
    var Help = config.helperClass("help");

    return React.createElement(
      "div",
      null,
      React.createElement(Label, this.props),
      React.createElement(Help, this.props),
      this.props.children
    );
  }

});

// // # field component
//
// /*
// Used by any fields to put the label and help text around the field.
// */
//
// 'use strict';
//
// var React = require('react/addons');
// var R = React.DOM;
// var _ = require('../../undash');
// var cx = require('classnames');
//
// var CSSTransitionGroup = React.createFactory(React.addons.CSSTransitionGroup);
//
// module.exports = React.createClass({
//
//   displayName: 'Field',
//
//   mixins: [require('../../mixins/helper')],
//
//   getInitialState: function () {
//     return {
//       collapsed: this.props.config.fieldIsCollapsed(this.props.field) ? true : false
//     };
//   },
//
//   onClickLabel: function () {
//     this.setState({
//       collapsed: !this.state.collapsed
//     });
//   },
//
//   render: function () {
//     return this.renderWithConfig();
//   },
//
//   renderDefault: function () {
//
//     var config = this.props.config;
//
//     if (this.props.plain) {
//       return this.props.children;
//     }
//
//     var field = this.props.field;
//
//     var index = this.props.index;
//     if (!_.isNumber(index)) {
//       var key = this.props.field.key;
//       index = _.isNumber(key) ? key : undefined;
//     }
//
//     var classes = _.extend({}, this.props.classes);
//
//     var errors = config.fieldErrors(field);
//
//     errors.forEach(function (error) {
//       classes['validation-error-' + error.type] = true;
//     });
//
//     if (config.fieldIsRequired(field)) {
//       classes.required = true;
//     } else {
//       classes.optional = true;
//     }
//
//     return R.div({className: cx(classes), style: {display: (field.hidden ? 'none' : '')}},
//       config.createElement('label', {
//         config: config, field: field,
//         index: index, onClick: config.fieldIsCollapsible(field) ? this.onClickLabel : null
//       }),
//       CSSTransitionGroup({transitionName: 'reveal'},
//         this.state.collapsed ? [] : [
//           config.createElement('help', {
//             config: config, field: field,
//             key: 'help'
//           }),
//           this.props.children
//         ]
//       )
//     );
//   }
// });

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../config":"/Users/justin/Dropbox/git/formatic/lib/config.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/helpers/help.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

module.exports = React.createClass({

  displayName: "Help",

  render: function render() {
    if (this.props.helpText) {
      return React.createElement(
        "div",
        null,
        this.props.helpText
      );
    }

    return React.createElement("span", null);
  }

});

// // # help component
//
// /*
// Just the help text block.
// */
//
// 'use strict';
//
// var React = require('react/addons');
// var R = React.DOM;
// var cx = require('classnames');
//
// module.exports = React.createClass({
//
//   displayName: 'Help',
//
//   mixins: [require('../../mixins/helper')],
//
//   render: function () {
//     return this.renderWithConfig();
//   },
//
//   renderDefault: function () {
//
//     var helpText = this.props.config.fieldHelpText(this.props.field);
//
//     return helpText ?
//       R.div({className: cx(this.props.classes), dangerouslySetInnerHTML: {__html: helpText}}) :
//       R.span(null);
//   }
// });

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/justin/Dropbox/git/formatic/lib/components/helpers/label.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

module.exports = React.createClass({

  displayName: "Label",

  render: function render() {
    var label = this.props.label || "";
    return React.createElement(
      "div",
      null,
      label
    );
  }

});

// // # label component
//
// /*
// Just the label for a field.
// */
//
// 'use strict';
//
// var React = require('react/addons');
// var R = React.DOM;
// var cx = require('classnames');
//
// module.exports = React.createClass({
//
//   displayName: 'Label',
//
//   mixins: [require('../../mixins/helper')],
//
//   render: function () {
//     return this.renderWithConfig();
//   },
//
//   renderDefault: function () {
//     var config = this.props.config;
//     var field = this.props.field;
//
//     var fieldLabel = config.fieldLabel(field);
//
//     var label = null;
//     if (typeof this.props.index === 'number') {
//       label = '' + (this.props.index + 1) + '.';
//       if (fieldLabel) {
//         label = label + ' ' + fieldLabel;
//       }
//     }
//
//     if (fieldLabel || label) {
//       var text = label || fieldLabel;
//       if (this.props.onClick) {
//         text = R.a({href: 'JavaScript' + ':', onClick: this.props.onClick}, text);
//       }
//       label = R.label({}, text);
//     }
//
//     var requiredOrNot;
//
//     if (!config.fieldHasValueChildren(field)) {
//       requiredOrNot = R.span({
//         className: config.fieldIsRequired(field) ? 'required-text' : 'not-required-text'
//       });
//     }
//
//     return R.div({
//       className: cx(this.props.classes)
//     },
//       label,
//       ' ',
//       requiredOrNot
//     );
//   }
// });

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/justin/Dropbox/git/formatic/lib/components/index.js":[function(require,module,exports){
"use strict";

var wrapField = require("./wrap-field");
var wrapHelper = require("./wrap-helper");

module.exports = {
  fields: {
    String: wrapField(require("./fields/string"))
  },
  helpers: {
    Field: wrapHelper(require("./helpers/field")),
    Label: wrapHelper(require("./helpers/label")),
    Help: wrapHelper(require("./helpers/help"))
  }
};

},{"./fields/string":"/Users/justin/Dropbox/git/formatic/lib/components/fields/string.js","./helpers/field":"/Users/justin/Dropbox/git/formatic/lib/components/helpers/field.js","./helpers/help":"/Users/justin/Dropbox/git/formatic/lib/components/helpers/help.js","./helpers/label":"/Users/justin/Dropbox/git/formatic/lib/components/helpers/label.js","./wrap-field":"/Users/justin/Dropbox/git/formatic/lib/components/wrap-field.js","./wrap-helper":"/Users/justin/Dropbox/git/formatic/lib/components/wrap-helper.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/wrap-field.js":[function(require,module,exports){
(function (global){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var Config = require("../config");
var _ = require("../undash");

module.exports = function (FieldComponent) {

  var WrapField = (function (_React$Component) {
    function WrapField(props, context) {
      _classCallCheck(this, WrapField);

      _get(Object.getPrototypeOf(WrapField.prototype), "constructor", this).call(this, props, context);

      this.state = {
        config: Config.forComponent(this),
        isControlled: !_.isUndefined(this.props.value),
        value: _.isUndefined(this.props.value) ? this.props.defaultValue : this.props.value,
        onChange: this.onChange.bind(this)
      };
    }

    _inherits(WrapField, _React$Component);

    _prototypeProperties(WrapField, null, {
      componentWillReceiveProps: {
        value: function componentWillReceiveProps(newProps) {
          if (this.state.isControlled) {
            if (!_.isUndefined(newProps.value)) {
              this.setState({
                value: newProps.value
              });
            }
          }
        },
        writable: true,
        configurable: true
      },
      onChange: {
        value: function onChange(newValue) {
          if (!this.state.isControlled) {
            this.setState({
              value: newValue
            });
          }
          if (!this.props.onChange) {
            return;
          }
          this.props.onChange(newValue);
        },
        writable: true,
        configurable: true
      },
      render: {
        value: function render() {
          return React.createElement(FieldComponent, _extends({}, this.props, this.state));
        },
        writable: true,
        configurable: true
      }
    });

    return WrapField;
  })(React.Component);

  return WrapField;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../config":"/Users/justin/Dropbox/git/formatic/lib/config.js","../undash":"/Users/justin/Dropbox/git/formatic/lib/undash.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/wrap-helper.js":[function(require,module,exports){
(function (global){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var Config = require("../config");

module.exports = function (HelperComponent) {

  var WrapHelper = (function (_React$Component) {
    function WrapHelper(props, context) {
      _classCallCheck(this, WrapHelper);

      _get(Object.getPrototypeOf(WrapHelper.prototype), "constructor", this).call(this, props, context);

      this.state = {
        config: Config.forComponent(this)
      };
    }

    _inherits(WrapHelper, _React$Component);

    _prototypeProperties(WrapHelper, null, {
      render: {
        value: function render() {
          return React.createElement(HelperComponent, _extends({}, this.props, this.state));
        },
        writable: true,
        configurable: true
      }
    });

    return WrapHelper;
  })(React.Component);

  return WrapHelper;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../config":"/Users/justin/Dropbox/git/formatic/lib/config.js"}],"/Users/justin/Dropbox/git/formatic/lib/config.js":[function(require,module,exports){
"use strict";

var defaultConfig = {};

var Config = {
  forComponent: function forComponent(component) {
    if (component.props.config) {
      return component.props.config;
    }
    return defaultConfig;
  },
  setDefaultConfig: function setDefaultConfig(config) {
    defaultConfig = config;
  }
};

module.exports = Config;

// module.exports = function (config) {
//
//   var delegateTo = utils.delegator(config);
//
//   return {
//
//     // Normalize an element name.
//     elementName(name) {
//       return utils.dashToPascal(name);
//     },
//
//     class(name) {
//       if (!name) {
//         throw new Error('Component class name must be specified to retrieve component class.');
//       }
//       name = config.elementName(name);
//       if (Components[name]) {
//         return Components[name];
//       }
//       throw new Error(`Component class ${name} not found.`);
//     },
//
//     helperClass(name) {
//       if (!name) {
//         throw new Error('Helper class name must be specified to retrieve component class.');
//       }
//       name = config.elementName(name);
//       return config.class(name);
//     },
//
//     fieldClass(name) {
//       if (!name) {
//         throw new Error('Field class name must be specified to retrieve component class.');
//       }
//       name += '-field';
//       name = config.elementName(name);
//       return config.class(name);
//     }

// // Render the root formatic component
// renderFormaticComponent: function (component) {
//
//   const props = component.props;
//
//   //var field = config.createRootField(props);
//
//   return (
//     <div className="formatic">
//
//     </div>
//   );
//
//   return R.div({className: 'formatic'},
//     config.createFieldElement({field: field, onChange: component.onChange, onAction: component.onAction})
//   );
// },

// // Create a field element given some props. Use context to determine name.
// createFieldElement: function (props) {
//
//   var name = config.fieldTypeName(props.field);
//
//   if (config.hasElementFactory(name)) {
//     return config.createElement(name, props);
//   }
//
//   return config.createElement('UnknownField', props);
// },

//
// // Field element factories. Create field elements.
//
// createElement_Fields: React.createFactory(require('./components/fields/fields')),
//
// createElement_String: React.createFactory(require('./components/fields/string')),
//
// createElement_SingleLineString: React.createFactory(require('./components/fields/single-line-string')),
//
// createElement_Select: React.createFactory(require('./components/fields/select')),
//
// createElement_PrettySelect: React.createFactory(require('./components/fields/pretty-select')),
//
// createElement_Boolean: React.createFactory(require('./components/fields/boolean')),
//
// createElement_PrettyBoolean: React.createFactory(require('./components/fields/pretty-boolean')),
//
// createElement_CheckboxBoolean: React.createFactory(require('./components/fields/checkbox-boolean')),
//
// // createElement_PrettyText: React.createFactory(require('./components/fields/pretty-text')),
//
// createElement_PrettyText: React.createFactory(require('./components/fields/pretty-text2')),
//
// createElement_Array: React.createFactory(require('./components/fields/array')),
//
// createElement_CheckboxArray: React.createFactory(require('./components/fields/checkbox-array')),
//
// createElement_Object: React.createFactory(require('./components/fields/object')),
//
// createElement_Json: React.createFactory(require('./components/fields/json')),
//
// createElement_UnknownField: React.createFactory(require('./components/fields/unknown')),
//
// createElement_Copy: React.createFactory(require('./components/fields/copy')),
//
//
// // Other element factories. Create helper elements used by field components.
//
// createElement_Field: React.createFactory(require('./components/helpers/field')),
//
// createElement_Label: React.createFactory(require('./components/helpers/label')),
//
// createElement_Help: React.createFactory(require('./components/helpers/help')),
//
// createElement_Choices: React.createFactory(require('./components/helpers/choices')),
//
// createElement_LoadingChoices: React.createFactory(require('./components/helpers/loading-choices')),
//
// createElement_ArrayControl: React.createFactory(require('./components/helpers/array-control')),
//
// createElement_ArrayItemControl: React.createFactory(require('./components/helpers/array-item-control')),
//
// createElement_ArrayItemValue: React.createFactory(require('./components/helpers/array-item-value')),
//
// createElement_ArrayItem: React.createFactory(require('./components/helpers/array-item')),
//
// createElement_FieldTemplateChoices: React.createFactory(require('./components/helpers/field-template-choices')),
//
// createElement_AddItem: React.createFactory(require('./components/helpers/add-item')),
//
// createElement_RemoveItem: React.createFactory(require('./components/helpers/remove-item')),
//
// createElement_MoveItemForward: React.createFactory(require('./components/helpers/move-item-forward')),
//
// createElement_MoveItemBack: React.createFactory(require('./components/helpers/move-item-back')),
//
// createElement_ObjectControl: React.createFactory(require('./components/helpers/object-control')),
//
// createElement_ObjectItemControl: React.createFactory(require('./components/helpers/object-item-control')),
//
// createElement_ObjectItemValue: React.createFactory(require('./components/helpers/object-item-value')),
//
// createElement_ObjectItemKey: React.createFactory(require('./components/helpers/object-item-key')),
//
// createElement_ObjectItem: React.createFactory(require('./components/helpers/object-item')),
//
// createElement_SelectValue: React.createFactory(require('./components/helpers/select-value')),
//
// createElement_PrettySelectValue: React.createFactory(require('./components/helpers/pretty-select-value')),
//
// createElement_Sample: React.createFactory(require('./components/helpers/sample')),
//
// createElement_InsertButton: React.createFactory(require('./components/helpers/insert-button')),
//
//
// // Field default value factories. Give a default value for a specific type.
//
// createDefaultValue_String: function (/* fieldTemplate */) {
//   return '';
// },
//
// createDefaultValue_Object: function (/* fieldTemplate */) {
//   return {};
// },
//
// createDefaultValue_Array: function (/* fieldTemplate */) {
//   return [];
// },
//
// createDefaultValue_Boolean: function (/* fieldTemplate */) {
//   return false;
// },
//
// createDefaultValue_Fields: delegateTo('createDefaultValue_Object'),
//
// createDefaultValue_SingleLineString: delegateTo('createDefaultValue_String'),
//
// createDefaultValue_Select: delegateTo('createDefaultValue_String'),
//
// createDefaultValue_Json: delegateTo('createDefaultValue_Object'),
//
// createDefaultValue_CheckboxArray: delegateTo('createDefaultValue_Array'),
//
// createDefaultValue_CheckboxBoolean: delegateTo('createDefaultValue_Boolean'),
//
//
// // Field value coercers. Coerce a value into a value appropriate for a specific type.
//
// coerceValue_String: function (fieldTemplate, value) {
//   if (_.isString(value)) {
//     return value;
//   }
//   if (_.isUndefined(value) || value === null) {
//     return '';
//   }
//   return JSON.stringify(value);
// },
//
// coerceValue_Object: function (fieldTemplate, value) {
//   if (!_.isObject(value)) {
//     return {};
//   }
//   return value;
// },
//
// coerceValue_Array: function (fieldTemplate, value) {
//   if (!_.isArray(value)) {
//     return [value];
//   }
//   return value;
// },
//
// coerceValue_Boolean: function (fieldTemplate, value) {
//   return config.coerceValueToBoolean(value);
// },
//
// coerceValue_Fields: delegateTo('coerceValue_Object'),
//
// coerceValue_SingleLineString: delegateTo('coerceValue_String'),
//
// coerceValue_Select: delegateTo('coerceValue_String'),
//
// coerceValue_Json: delegateTo('coerceValue_Object'),
//
// coerceValue_CheckboxArray: delegateTo('coerceValue_Array'),
//
// coerceValue_CheckboxBoolean: delegateTo('coerceValue_Boolean'),
//
//
// // Field child fields factories, so some types can have dynamic children.
//
// createChildFields_Array: function (field) {
//
//   return field.value.map(function (arrayItem, i) {
//     var childFieldTemplate = config.childFieldTemplateForValue(field, arrayItem);
//
//     var childField = config.createChildField(field, {
//       fieldTemplate: childFieldTemplate, key: i, fieldIndex: i, value: arrayItem
//     });
//
//     return childField;
//   });
// },
//
// createChildFields_Object: function (field) {
//
//   return Object.keys(field.value).map(function (key, i) {
//     var childFieldTemplate = config.childFieldTemplateForValue(field, field.value[key]);
//
//     var childField = config.createChildField(field, {
//       fieldTemplate: childFieldTemplate, key: key, fieldIndex: i, value: field.value[key]
//     });
//
//     return childField;
//   });
// },
//
// // Check if there is a factory for the name.
// hasElementFactory: function (name) {
//
//   return config['createElement_' + name] ? true : false;
// },
//
// // Create an element given a name, props, and children.
// createElement: function (name, props, children) {
//
//   if (!props.config) {
//     props = _.extend({}, props, {config: config});
//   }
//
//   name = config.elementName(name);
//
//   if (config['createElement_' + name]) {
//     return config['createElement_' + name](props, children);
//   }
//
//   if (name !== 'Unknown') {
//     if (config.hasElementFactory('Unknown')) {
//       return config.createElement('Unknown', props, children);
//     }
//   }
//
//   throw new Error('Factory not found for: ' + name);
// },
//
// // Create a field element given some props. Use context to determine name.
// createFieldElement: function (props) {
//
//   var name = config.fieldTypeName(props.field);
//
//   if (config.hasElementFactory(name)) {
//     return config.createElement(name, props);
//   }
//
//   return config.createElement('UnknownField', props);
// },
//
// // Render the root formatic component
// renderFormaticComponent: function (component) {
//
//   var props = component.props;
//
//   var field = config.createRootField(props);
//
//   return R.div({className: 'formatic'},
//     config.createFieldElement({field: field, onChange: component.onChange, onAction: component.onAction})
//   );
// },
//
// // Render any component.
// renderComponent: function (component) {
//
//   var name = component.constructor.displayName;
//
//   if (config['renderComponent_' + name]) {
//     return config['renderComponent_' + name](component);
//   }
//
//   return component.renderDefault();
// },
//
// // Render field components.
// renderFieldComponent: function (component) {
//
//   return config.renderComponent(component);
// },
//
// // Normalize an element name.
// elementName: function (name) {
//   return utils.dashToPascal(name);
// },
//
// // Type aliases.
//
// alias_Dict: 'Object',
//
// alias_Bool: 'Boolean',
//
// alias_PrettyTextarea: 'PrettyText',
//
// alias_SingleLineString: function (fieldTemplate) {
//   if (fieldTemplate.replaceChoices) {
//     return 'PrettyText';
//   } else if (fieldTemplate.choices) {
//     return 'Select';
//   }
//   return 'SingleLineString';
// },
//
// alias_String: function (fieldTemplate) {
//
//   if (fieldTemplate.replaceChoices) {
//     return 'PrettyText';
//   } else if (fieldTemplate.choices) {
//     return 'Select';
//   } else if (config.fieldTemplateIsSingleLine(fieldTemplate)) {
//     return 'SingleLineString';
//   }
//   return 'String';
// },
//
// alias_Text: delegateTo('alias_String'),
//
// alias_Unicode: delegateTo('alias_SingleLineString'),
//
// alias_Str: delegateTo('alias_SingleLineString'),
//
// alias_List: 'Array',
//
// alias_CheckboxList: 'CheckboxArray',
//
// alias_Fieldset: 'Fields',
//
// alias_Checkbox: 'CheckboxBoolean',
//
// // Field factory
//
// // Given a field, expand all child fields recursively to get the default
// // values of all fields.
// inflateFieldValue: function (field, fieldHandler) {
//
//   if (fieldHandler) {
//     var stop = fieldHandler(field);
//     if (stop === false) {
//       return undefined;
//     }
//   }
//
//   if (config.fieldHasValueChildren(field)) {
//     var value = _.clone(field.value);
//     var childFields = config.createChildFields(field);
//     childFields.forEach(function (childField) {
//       if (config.isKey(childField.key)) {
//         value[childField.key] = config.inflateFieldValue(childField, fieldHandler);
//       }
//     });
//     return value;
//   } else {
//     return field.value;
//   }
// },
//
// // Initialize the root field.
// initRootField: function (/* field, props */) {
// },
//
// // Initialize every field.
// initField: function (/* field */) {
// },
//
// // If an array of field templates are passed in, this method is used to
// // wrap the fields inside a single root field template.
// wrapFieldTemplates: function (fieldTemplates) {
//   return {
//     type: 'fields',
//     plain: true,
//     fields: fieldTemplates
//   };
// },
//
// // Given the props that are passed in, create the root field.
// createRootField: function (props) {
//
//   var fieldTemplate = props.fieldTemplate || props.fieldTemplates || props.field || props.fields;
//   var value = props.value;
//
//   if (!fieldTemplate) {
//     fieldTemplate = config.createFieldTemplateFromValue(value);
//   }
//
//   if (_.isArray(fieldTemplate)) {
//     fieldTemplate = config.wrapFieldTemplates(fieldTemplate);
//   }
//
//   var field = _.extend({}, fieldTemplate, {rawFieldTemplate: fieldTemplate});
//   if (config.hasValue(fieldTemplate, value)) {
//     field.value = config.coerceValue(fieldTemplate, value);
//   } else {
//     field.value = config.createDefaultValue(fieldTemplate);
//   }
//
//   config.initRootField(field, props);
//   config.initField(field);
//
//   if (value === null || config.isEmptyObject(value) || _.isUndefined(value)) {
//     field.value = config.inflateFieldValue(field);
//   }
//
//   return field;
// },
//
// // Given the props that are passed in, create the value that will be displayed
// // by all the components.
// createRootValue: function (props, fieldHandler) {
//
//   var field = config.createRootField(props);
//
//   return config.inflateFieldValue(field, fieldHandler);
// },
//
// validateRootValue: function (props) {
//
//   var errors = [];
//
//   config.createRootValue(props, function (field) {
//     var fieldErrors = config.fieldErrors(field);
//     if (fieldErrors.length > 0) {
//       errors.push({
//         path: config.fieldValuePath(field),
//         errors: fieldErrors
//       });
//     }
//   });
//
//   return errors;
// },
//
// isValidRootValue: function (props) {
//
//   var isValid = true;
//
//   config.createRootValue(props, function (field) {
//     if (config.fieldErrors(field).length > 0) {
//       isValid = false;
//       return false;
//     }
//   });
//
//   return isValid;
// },
//
// validateField: function (field, errors) {
//
//   if (field.value === undefined || field.value === '') {
//     if (config.fieldIsRequired(field)) {
//       errors.push({
//         type: 'required'
//       });
//     }
//   }
// },
//
// // Create dynamic child fields for a field.
// createChildFields: function (field) {
//
//   var typeName = config.fieldTypeName(field);
//
//   if (config['createChildFields_' + typeName]) {
//     return config['createChildFields_' + typeName](field);
//   }
//
//   return config.fieldChildFieldTemplates(field).map(function (childField, i) {
//     return config.createChildField(field, {
//       fieldTemplate: childField, key: childField.key, fieldIndex: i, value: field.value[childField.key]
//     });
//   });
// },
//
// // Create a single child field for a parent field.
// createChildField: function (parentField, options) {
//
//   var childValue = options.value;
//
//   var childField = _.extend({}, options.fieldTemplate, {
//     key: options.key, parent: parentField, fieldIndex: options.fieldIndex,
//     rawFieldTemplate: options.fieldTemplate
//   });
//
//   if (config.hasValue(options.fieldTemplate, childValue)) {
//     childField.value = config.coerceValue(options.fieldTemplate, childValue);
//   } else {
//     childField.value = config.createDefaultValue(options.fieldTemplate);
//   }
//
//   config.initField(childField);
//
//   return childField;
// },
//
// // Create a temporary field and extract its value.
// createNewChildFieldValue: function (parentField, itemFieldIndex) {
//
//   var childFieldTemplate = config.fieldItemFieldTemplates(parentField)[itemFieldIndex];
//
//   var newValue = config.fieldTemplateValue(childFieldTemplate);
//
//   // Just a placeholder key. Should not be important.
//   var key = '__unknown_key__';
//
//   if (_.isArray(parentField.value)) {
//     // Just a placeholder position for an array.
//     key = parentField.value.length;
//   }
//
//   // Just a placeholder field index. Should not be important.
//   var fieldIndex = 0;
//   if (_.isObject(parentField.value)) {
//     fieldIndex = Object.keys(parentField.value).length;
//   }
//
//   var childField = config.createChildField(parentField, {
//     fieldTemplate: childFieldTemplate, key: key, fieldIndex: fieldIndex, value: newValue
//   });
//
//   newValue = config.inflateFieldValue(childField);
//
//   return newValue;
// },
//
// // Given a value, create a field template for that value.
// createFieldTemplateFromValue: function (value) {
//
//   var field = {
//     type: 'json'
//   };
//   if (_.isString(value)) {
//     field = {
//       type: 'string'
//     };
//   } else if (_.isNumber(value)) {
//     field = {
//       type: 'number'
//     };
//   } else if (_.isBoolean(value)) {
//     field = {
//       type: 'boolean'
//     };
//   } else if (_.isArray(value)) {
//     var arrayItemFields = value.map(function (childValue, i) {
//       var childField = config.createFieldTemplateFromValue(childValue);
//       childField.key = i;
//       return childField;
//     });
//     field = {
//       type: 'array',
//       fields: arrayItemFields
//     };
//   } else if (_.isObject(value)) {
//     var objectItemFields = Object.keys(value).map(function (key) {
//       var childField = config.createFieldTemplateFromValue(value[key]);
//       childField.key = key;
//       childField.label = config.humanize(key);
//       return childField;
//     });
//     field = {
//       type: 'object',
//       fields: objectItemFields
//     };
//   } else if (_.isNull(value)) {
//     field = {
//       type: 'json'
//     };
//   }
//   return field;
// },
//
// // Default value factory
//
// createDefaultValue: function (fieldTemplate) {
//
//   var defaultValue = config.fieldTemplateDefaultValue(fieldTemplate);
//
//   if (!_.isUndefined(defaultValue)) {
//     return utils.deepCopy(defaultValue);
//   }
//
//   var typeName = config.fieldTypeName(fieldTemplate);
//
//   if (config['createDefaultValue_' + typeName]) {
//     return config['createDefaultValue_' + typeName](fieldTemplate);
//   }
//
//   return '';
// },
//
// // Field helpers
//
// // Determine if a value "exists".
// hasValue: function (fieldTemplate, value) {
//   return value !== null && !_.isUndefined(value);
// },
//
// // Coerce a value to value appropriate for a field.
// coerceValue: function (field, value) {
//
//   var typeName = config.fieldTypeName(field);
//
//   if (config['coerceValue_' + typeName]) {
//     return config['coerceValue_' + typeName](field, value);
//   }
//
//   return value;
// },
//
// // Given a field and a child value, find the appropriate field template for
// // that child value.
// childFieldTemplateForValue: function (field, childValue) {
//
//   var fieldTemplate;
//
//   var fieldTemplates = config.fieldItemFieldTemplates(field);
//
//   fieldTemplate = _.find(fieldTemplates, function (itemFieldTemplate) {
//     return config.matchesFieldTemplateToValue(itemFieldTemplate, childValue);
//   });
//
//   if (fieldTemplate) {
//     return fieldTemplate;
//   } else {
//     return config.createFieldTemplateFromValue(childValue);
//   }
// },
//
// // Determine if a value is a match for a field template.
// matchesFieldTemplateToValue: function (fieldTemplate, value) {
//   var match = fieldTemplate.match;
//   if (!match) {
//     return true;
//   }
//   return _.every(Object.keys(match), function (key) {
//     return _.isEqual(match[key], value[key]);
//   });
// },
//
// // Field template helpers
//
// // Normalized (PascalCase) type name for a field.
// fieldTemplateTypeName: function (fieldTemplate) {
//
//   var typeName = utils.dashToPascal(fieldTemplate.type || 'undefined');
//
//   var alias = config['alias_' + typeName];
//
//   if (alias) {
//     if (_.isFunction(alias)) {
//       return alias.call(config, fieldTemplate);
//     } else {
//       return alias;
//     }
//   }
//
//   if (fieldTemplate.list) {
//     typeName = 'Array';
//   }
//
//   return typeName;
// },
//
// // Default value for a field template.
// fieldTemplateDefaultValue: function (fieldTemplate) {
//
//   return fieldTemplate.default;
// },
//
// // Value for a field template. Used to determine the value of a new child
// // field.
// fieldTemplateValue: function (fieldTemplate) {
//
//   // This logic might be brittle.
//
//   var defaultValue = config.fieldTemplateDefaultValue(fieldTemplate);
//
//   var match = config.fieldTemplateMatch(fieldTemplate);
//
//   var value;
//
//   if (_.isUndefined(defaultValue) && !_.isUndefined(match)) {
//     return utils.deepCopy(match);
//   } else {
//     return config.createDefaultValue(fieldTemplate);
//   }
//
//   return value;
// },
//
// // Match rule for a field template.
// fieldTemplateMatch: function (fieldTemplate) {
//   return fieldTemplate.match;
// },
//
// // Determine if a field template has a single-line value.
// fieldTemplateIsSingleLine: function (fieldTemplate) {
//   return fieldTemplate.isSingleLine || fieldTemplate.is_single_line ||
//           fieldTemplate.type === 'single-line-string' || fieldTemplate.type === 'SingleLineString';
// },
//
// // Field helpers
//
// // Get an array of keys representing the path to a value.
// fieldValuePath: function (field) {
//
//   var parentPath = [];
//
//   if (field.parent) {
//     parentPath = config.fieldValuePath(field.parent);
//   }
//
//   return parentPath.concat(field.key).filter(function (key) {
//     return !_.isUndefined(key) && key !== '';
//   });
// },
//
// // Clone a field with a different value.
// fieldWithValue: function (field, value) {
//   return _.extend({}, field, {value: value});
// },
//
// fieldTypeName: delegateTo('fieldTemplateTypeName'),
//
// // Get the choices for a dropdown field.
// fieldChoices: function (field) {
//
//   return config.normalizeChoices(field.choices);
// },
//
// // Get the choices for a pretty dropdown field.
// fieldPrettyChoices: function (field) {
//
//   return config.normalizePrettyChoices(field.choices);
// },
//
// // Get a set of boolean choices for a field.
// fieldBooleanChoices: function (field) {
//
//   var choices = config.fieldChoices(field);
//
//   if (choices.length === 0) {
//     return [{
//       label: 'yes',
//       value: true
//     }, {
//       label: 'no',
//       value: false
//     }];
//   }
//
//   return choices.map(function (choice) {
//     if (_.isBoolean(choice.value)) {
//       return choice;
//     }
//     return _.extend({}, choice, {
//       value: config.coerceValueToBoolean(choice.value)
//     });
//   });
// },
//
// // Get a set of replacement choices for a field.
// fieldReplaceChoices: function (field) {
//
//   return config.normalizeChoices(field.replaceChoices);
// },
//
// // Get a label for a field.
// fieldLabel: function (field) {
//   return field.label;
// },
//
// // Get a placeholder (just a default display value, not a default value) for a field.
// fieldPlaceholder: function (field) {
//   return field.placeholder;
// },
//
// // Get the help text for a field.
// fieldHelpText: function (field) {
//   return field.help_text_html || field.help_text || field.helpText || field.helpTextHtml;
// },
//
// // Get whether or not a field is required.
// fieldIsRequired: function (field) {
//   return field.required ? true : false;
// },
//
// // Determine if value for this field is not a leaf value.
// fieldHasValueChildren: function (field) {
//
//   var defaultValue = config.createDefaultValue(field);
//
//   if (_.isObject(defaultValue) || _.isArray(defaultValue)) {
//     return true;
//   }
//
//   return false;
// },
//
// // Get the child field templates for this field.
// fieldChildFieldTemplates: function (field) {
//   return field.fields || [];
// },
//
// // Get the field templates for each item of this field. (For dynamic children,
// // like arrays.)
// fieldItemFieldTemplates: function (field) {
//   if (!field.itemFields) {
//     return [{type: 'text'}];
//   }
//   if (!_.isArray(field.itemFields)) {
//     return [field.itemFields];
//   }
//   return field.itemFields;
// },
//
// fieldIsSingleLine: delegateTo('fieldTemplateIsSingleLine'),
//
// // Get whether or not a field is collapsed.
// fieldIsCollapsed: function (field) {
//   return field.collapsed ? true : false;
// },
//
// // Get wheter or not a field can be collapsed.
// fieldIsCollapsible: function (field) {
//   return field.collapsible || !_.isUndefined(field.collapsed);
// },
//
// // Get the number of rows for a field.
// fieldRows: function (field) {
//   return field.rows;
// },
//
// fieldErrors: function (field) {
//
//   var errors = [];
//
//   if (config.isKey(field.key)) {
//     config.validateField(field, errors);
//   }
//
//   return errors;
// },
//
// fieldMatch: delegateTo('fieldTemplateMatch'),
//
// // Other helpers
//
// // Convert a key to a nice human-readable version.
// humanize: function(property) {
//   property = property.replace(/\{\{/g, '');
//   property = property.replace(/\}\}/g, '');
//   return property.replace(/_/g, ' ')
//   .replace(/(\w+)/g, function(match) {
//     return match.charAt(0).toUpperCase() + match.slice(1);
//   });
// },
//
// // Normalize some choices for a drop-down.
// normalizeChoices: function (choices) {
//
//   if (!choices) {
//     return [];
//   }
//
//   // Convert comma separated string to array of strings.
//   if (_.isString(choices)) {
//     choices = choices.split(',');
//   }
//
//   // Convert object to array of objects with `value` and `label` properties.
//   if (!_.isArray(choices) && _.isObject(choices)) {
//     choices = Object.keys(choices).map(function (key) {
//       return {
//         value: key,
//         label: choices[key]
//       };
//     });
//   }
//
//   // Copy the array of choices so we can manipulate them.
//   choices = choices.slice(0);
//
//   // Array of choice arrays should be flattened.
//   choices = _.flatten(choices);
//
//   choices.forEach(function (choice, i) {
//     // Convert any string choices to objects with `value` and `label`
//     // properties.
//     if (_.isString(choice)) {
//       choices[i] = {
//         value: choice,
//         label: config.humanize(choice)
//       };
//     }
//     if (!choices[i].label) {
//       choices[i].label = config.humanize(choices[i].value);
//     }
//   });
//
//   return choices;
// },
//
// // Normalize choices for a pretty drop down, with 'sample' values
// normalizePrettyChoices: function (choices) {
//   if (!_.isArray(choices) && _.isObject(choices)) {
//     choices = Object.keys(choices).map(function (key) {
//       return {
//         value: key,
//         label: choices[key],
//         sample: key
//       };
//     });
//   }
//
//   return config.normalizeChoices(choices);
// },
//
// // Coerce a value to a boolean
// coerceValueToBoolean: function (value) {
//   if (!_.isString(value)) {
//     // Just use the default truthiness.
//     return value ? true : false;
//   }
//   value = value.toLowerCase();
//   if (value === '' || value === 'no' || value === 'off' || value === 'false') {
//     return false;
//   }
//   return true;
// },
//
// // Determine if a value is a valid key.
// isKey: function (key) {
//   return (_.isNumber(key) && key >= 0) || (_.isString(key) && key !== '');
// },
//
// // Fast way to check for empty object.
// isEmptyObject: function (obj) {
//   for(var key in obj) {
//     if (obj.hasOwnProperty(key)) {
//       return false;
//     }
//   }
//   return true;
// },
//
// actionChoiceLabel: function (action) {
//   return utils.capitalize(action).replace(/[-]/g, ' ');
// }
//   };
// };
// # default-config

/*
This is the default configuration plugin for formatic. To change formatic's
behavior, just create your own plugin function that returns an object with
methods you want to add or override.
*/

},{}],"/Users/justin/Dropbox/git/formatic/lib/create-config.js":[function(require,module,exports){
"use strict";

var _ = require("./undash");

var createConfig = function createConfig() {
  for (var _len = arguments.length, plugins = Array(_len), _key = 0; _key < _len; _key++) {
    plugins[_key] = arguments[_key];
  }

  return plugins.reduce(function (config, plugin) {
    if (_.isFunction(plugin)) {
      var extensions = plugin(config);
      if (extensions) {
        _.extend(config, extensions);
      }
    } else {
      _.extend(config, plugin);
    }

    return config;
  }, {});
};

module.exports = createConfig;

},{"./undash":"/Users/justin/Dropbox/git/formatic/lib/undash.js"}],"/Users/justin/Dropbox/git/formatic/lib/formatic.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var _ = require("./undash");
var Config = require("./config");
var Components = require("./components");
var createConfig = require("./create-config");
var defaultConfigPlugin = require("./plugins/default-config");
Config.setDefaultConfig(createConfig(defaultConfigPlugin));

module.exports = React.createClass({
  displayName: "exports",

  statics: _.extend({
    createConfig: createConfig.bind(null, defaultConfigPlugin)
  }, Components),

  render: function render() {
    var config = Config.forCompnent(this);

    return config.renderFormaticComponent(this);
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

},{"./components":"/Users/justin/Dropbox/git/formatic/lib/components/index.js","./config":"/Users/justin/Dropbox/git/formatic/lib/config.js","./create-config":"/Users/justin/Dropbox/git/formatic/lib/create-config.js","./plugins/default-config":"/Users/justin/Dropbox/git/formatic/lib/plugins/default-config.js","./undash":"/Users/justin/Dropbox/git/formatic/lib/undash.js"}],"/Users/justin/Dropbox/git/formatic/lib/plugins/default-config.js":[function(require,module,exports){
"use strict";

// var React = require('react/addons');
// var _ = require('../undash');

var Components = require("../components");

var components = {};

Object.keys(Components.fields).forEach(function (name) {
  components[name + "Field"] = Components.fields[name];
});

Object.keys(Components.helpers).forEach(function (name) {
  components[name] = Components.helpers[name];
});

var utils = require("../utils");

module.exports = function (config) {

  // var delegateTo = utils.delegator(config);

  return {

    // Normalize an element name.
    elementName: function elementName(name) {
      return utils.dashToPascal(name);
    },

    "class": function _class(name) {
      if (!name) {
        throw new Error("Component class name must be specified to retrieve component class.");
      }
      name = config.elementName(name);
      if (components[name]) {
        return components[name];
      }
      throw new Error("Component class " + name + " not found.");
    },

    helperClass: function helperClass(name) {
      if (!name) {
        throw new Error("Helper class name must be specified to retrieve component class.");
      }
      name = config.elementName(name);
      return config["class"](name);
    },

    fieldClass: function fieldClass(name) {
      if (!name) {
        throw new Error("Field class name must be specified to retrieve component class.");
      }
      name += "-field";
      name = config.elementName(name);
      return config["class"](name);
    }
  };
};
/*
This is the default configuration plugin for formatic. To change formatic's
behavior, just create your own plugin function that returns an object with
methods you want to add or override.
*/

},{"../components":"/Users/justin/Dropbox/git/formatic/lib/components/index.js","../utils":"/Users/justin/Dropbox/git/formatic/lib/utils.js"}],"/Users/justin/Dropbox/git/formatic/lib/undash.js":[function(require,module,exports){
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

},{"deep-equal":"/Users/justin/Dropbox/git/formatic/node_modules/deep-equal/index.js","object-assign":"/Users/justin/Dropbox/git/formatic/node_modules/object-assign/index.js"}],"/Users/justin/Dropbox/git/formatic/lib/utils.js":[function(require,module,exports){
"use strict";

var _ = require("./undash");

var utils = exports;

// Copy obj recursing deeply.
utils.deepCopy = function (obj) {
  if (_.isArray(obj)) {
    return obj.map(function (item) {
      return utils.deepCopy(item);
    });
  } else if (_.isFunction(obj)) {
    return obj;
  } else if (_.isNull(obj)) {
    return obj;
  } else if (_.isObject(obj)) {
    var copy = {};
    _.each(obj, function (value, key) {
      copy[key] = utils.deepCopy(value);
    });
    return copy;
  } else {
    return obj;
  }
};

// Cache for strings converted to Pascal Case. This should be a finite list, so
// not much fear that we will run out of memory.
var dashToPascalCache = {};

// Convert foo-bar to FooBar.
utils.dashToPascal = function (s) {
  if (s === "") {
    return "";
  }
  if (!dashToPascalCache[s]) {
    dashToPascalCache[s] = s.split("-").map(function (part) {
      return part[0].toUpperCase() + part.substring(1);
    }).join("");
  }
  return dashToPascalCache[s];
};

// Copy all computed styles from one DOM element to another.
utils.copyElementStyle = function (fromElement, toElement) {
  var fromStyle = window.getComputedStyle(fromElement, "");

  if (fromStyle.cssText !== "") {
    toElement.style.cssText = fromStyle.cssText;
    return;
  }

  var cssRules = [];
  for (var i = 0; i < fromStyle.length; i++) {
    cssRules.push(fromStyle[i] + ":" + fromStyle.getPropertyValue(fromStyle[i]) + ";");
  }
  var cssText = cssRules.join("");

  toElement.style.cssText = cssText;
};

// Object to hold browser sniffing info.
var browser = {
  isChrome: false,
  isMozilla: false,
  isOpera: false,
  isIe: false,
  isSafari: false,
  isUnknown: false
};

// Sniff the browser.
var ua = "";

if (typeof navigator !== "undefined") {
  ua = navigator.userAgent;
}

if (ua.indexOf("Chrome") > -1) {
  browser.isChrome = true;
} else if (ua.indexOf("Safari") > -1) {
  browser.isSafari = true;
} else if (ua.indexOf("Opera") > -1) {
  browser.isOpera = true;
} else if (ua.indexOf("Firefox") > -1) {
  browser.isMozilla = true;
} else if (ua.indexOf("MSIE") > -1) {
  browser.isIe = true;
} else {
  browser.isUnknown = true;
}

// Export sniffed browser info.
utils.browser = browser;

// Create a method that delegates to another method on the same object. The
// default configuration uses this function to delegate one method to another.
utils.delegateTo = function (name) {
  return function () {
    return this[name].apply(this, arguments);
  };
};

utils.delegator = function (obj) {
  return function (name) {
    return function () {
      return obj[name].apply(obj, arguments);
    };
  };
};

utils.capitalize = function (s) {
  return s.charAt(0).toUpperCase() + s.substring(1).toLowerCase();
};
// # utils

/*
Just some shared utility functions.
*/

},{"./undash":"/Users/justin/Dropbox/git/formatic/lib/undash.js"}],"/Users/justin/Dropbox/git/formatic/node_modules/deep-equal/index.js":[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2luZGV4LmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9maWVsZHMvc3RyaW5nLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2ZpZWxkLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2hlbHAuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvbGFiZWwuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2luZGV4LmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy93cmFwLWZpZWxkLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy93cmFwLWhlbHBlci5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbmZpZy5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NyZWF0ZS1jb25maWcuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9mb3JtYXRpYy5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL3BsdWdpbnMvZGVmYXVsdC1jb25maWcuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi91bmRhc2guanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi91dGlscy5qcyIsIm5vZGVfbW9kdWxlcy9kZWVwLWVxdWFsL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RlZXAtZXF1YWwvbGliL2lzX2FyZ3VtZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9kZWVwLWVxdWFsL2xpYi9rZXlzLmpzIiwibm9kZV9tb2R1bGVzL29iamVjdC1hc3NpZ24vaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztBQ0dBLE1BQU0sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7Ozs7OztBQ0gzQyxJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7O0FBRS9CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7QUFFakMsYUFBVyxFQUFFLGFBQWE7O0FBRTFCLFVBQVEsRUFBQSxrQkFBQyxLQUFLLEVBQUU7QUFDZCxRQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0dBQ3pDOztBQUVELFFBQU0sRUFBQSxrQkFBRztBQUNQLFFBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDOztBQUVqQyxRQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUUxQyxXQUNFO0FBQUMsV0FBSztNQUFLLElBQUksQ0FBQyxLQUFLO01BQ25CLGtDQUFVLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQUFBQyxFQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxBQUFDLEdBQUU7S0FDdkQsQ0FDUjtHQUNIOztDQUVGLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3RCSCxJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFD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TyxhQUFhLENBQUM7R0FDdEI7QUFDRCxrQkFBZ0IsRUFBQSwwQkFBQyxNQUFNLEVBQUU7QUFDdkIsaUJBQWEsR0FBRyxNQUFNLENBQUM7R0FDeEI7Q0FDRixDQUFDOztBQUVGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vICMgaW5kZXhcblxuLy8gRXhwb3J0IHRoZSBGb3JtYXRpYyBSZWFjdCBjbGFzcyBhdCB0aGUgdG9wIGxldmVsLlxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9mb3JtYXRpYycpO1xuIiwiY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ1N0cmluZ0ZpZWxkJyxcblxuICBvbkNoYW5nZShldmVudCkge1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG5cbiAgICBjb25zdCBGaWVsZCA9IGNvbmZpZy5oZWxwZXJDbGFzcygnZmllbGQnKTtcblxuICAgIHJldHVybiAoXG4gICAgICA8RmllbGQgey4uLnRoaXMucHJvcHN9PlxuICAgICAgICA8dGV4dGFyZWEgdmFsdWU9e3RoaXMucHJvcHMudmFsdWV9IG9uQ2hhbmdlPXt0aGlzLm9uQ2hhbmdlfS8+XG4gICAgICA8L0ZpZWxkPlxuICAgICk7XG4gIH1cblxufSk7XG5cbi8vIC8vICMgc3RyaW5nIGNvbXBvbmVudFxuLy9cbi8vIC8qXG4vLyBSZW5kZXIgYSBmaWVsZCB0aGF0IGNhbiBlZGl0IGEgc3RyaW5nIHZhbHVlLlxuLy8gKi9cbi8vXG4vLyAndXNlIHN0cmljdCc7XG4vL1xuLy8gdmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG4vLyB2YXIgUiA9IFJlYWN0LkRPTTtcbi8vIHZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcbi8vXG4vLyBtb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbi8vXG4vLyAgIGRpc3BsYXlOYW1lOiAnU3RyaW5nJyxcbi8vXG4vLyAgIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcbi8vXG4vLyAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbi8vICAgICB0aGlzLm9uQ2hhbmdlVmFsdWUoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbi8vICAgfSxcbi8vXG4vLyAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuLy8gICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbi8vICAgfSxcbi8vXG4vLyAgIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbi8vXG4vLyAgICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuLy8gICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG4vL1xuLy8gICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQnLCB7XG4vLyAgICAgICBjb25maWc6IGNvbmZpZywgZmllbGQ6IGZpZWxkLCBwbGFpbjogdGhpcy5wcm9wcy5wbGFpblxuLy8gICAgIH0sIFIudGV4dGFyZWEoe1xuLy8gICAgICAgdmFsdWU6IGZpZWxkLnZhbHVlLFxuLy8gICAgICAgY2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpLFxuLy8gICAgICAgcm93czogZmllbGQucm93cyB8fCB0aGlzLnByb3BzLnJvd3MsXG4vLyAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbi8vICAgICAgIG9uRm9jdXM6IHRoaXMub25Gb2N1c0FjdGlvbixcbi8vICAgICAgIG9uQmx1cjogdGhpcy5vbkJsdXJBY3Rpb25cbi8vICAgICB9KSk7XG4vLyAgIH1cbi8vIH0pO1xuIiwiY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuY29uc3QgQ29uZmlnID0gcmVxdWlyZSgnLi4vLi4vY29uZmlnJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnRmllbGQnLFxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBjb25maWcgPSBDb25maWcuZm9yQ29tcG9uZW50KHRoaXMpO1xuXG4gICAgY29uc3QgTGFiZWwgPSBjb25maWcuaGVscGVyQ2xhc3MoJ2xhYmVsJyk7XG4gICAgY29uc3QgSGVscCA9IGNvbmZpZy5oZWxwZXJDbGFzcygnaGVscCcpO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+XG4gICAgICAgIDxMYWJlbCB7Li4udGhpcy5wcm9wc30vPlxuICAgICAgICA8SGVscCB7Li4udGhpcy5wcm9wc30vPlxuICAgICAgICB7dGhpcy5wcm9wcy5jaGlsZHJlbn1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxufSk7XG5cbi8vIC8vICMgZmllbGQgY29tcG9uZW50XG4vL1xuLy8gLypcbi8vIFVzZWQgYnkgYW55IGZpZWxkcyB0byBwdXQgdGhlIGxhYmVsIGFuZCBoZWxwIHRleHQgYXJvdW5kIHRoZSBmaWVsZC5cbi8vICovXG4vL1xuLy8gJ3VzZSBzdHJpY3QnO1xuLy9cbi8vIHZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuLy8gdmFyIFIgPSBSZWFjdC5ET007XG4vLyB2YXIgXyA9IHJlcXVpcmUoJy4uLy4uL3VuZGFzaCcpO1xuLy8gdmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuLy9cbi8vIHZhciBDU1NUcmFuc2l0aW9uR3JvdXAgPSBSZWFjdC5jcmVhdGVGYWN0b3J5KFJlYWN0LmFkZG9ucy5DU1NUcmFuc2l0aW9uR3JvdXApO1xuLy9cbi8vIG1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuLy9cbi8vICAgZGlzcGxheU5hbWU6ICdGaWVsZCcsXG4vL1xuLy8gICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuLy9cbi8vICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4vLyAgICAgcmV0dXJuIHtcbi8vICAgICAgIGNvbGxhcHNlZDogdGhpcy5wcm9wcy5jb25maWcuZmllbGRJc0NvbGxhcHNlZCh0aGlzLnByb3BzLmZpZWxkKSA/IHRydWUgOiBmYWxzZVxuLy8gICAgIH07XG4vLyAgIH0sXG4vL1xuLy8gICBvbkNsaWNrTGFiZWw6IGZ1bmN0aW9uICgpIHtcbi8vICAgICB0aGlzLnNldFN0YXRlKHtcbi8vICAgICAgIGNvbGxhcHNlZDogIXRoaXMuc3RhdGUuY29sbGFwc2VkXG4vLyAgICAgfSk7XG4vLyAgIH0sXG4vL1xuLy8gICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbi8vICAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4vLyAgIH0sXG4vL1xuLy8gICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4vL1xuLy8gICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbi8vXG4vLyAgICAgaWYgKHRoaXMucHJvcHMucGxhaW4pIHtcbi8vICAgICAgIHJldHVybiB0aGlzLnByb3BzLmNoaWxkcmVuO1xuLy8gICAgIH1cbi8vXG4vLyAgICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcbi8vXG4vLyAgICAgdmFyIGluZGV4ID0gdGhpcy5wcm9wcy5pbmRleDtcbi8vICAgICBpZiAoIV8uaXNOdW1iZXIoaW5kZXgpKSB7XG4vLyAgICAgICB2YXIga2V5ID0gdGhpcy5wcm9wcy5maWVsZC5rZXk7XG4vLyAgICAgICBpbmRleCA9IF8uaXNOdW1iZXIoa2V5KSA/IGtleSA6IHVuZGVmaW5lZDtcbi8vICAgICB9XG4vL1xuLy8gICAgIHZhciBjbGFzc2VzID0gXy5leHRlbmQoe30sIHRoaXMucHJvcHMuY2xhc3Nlcyk7XG4vL1xuLy8gICAgIHZhciBlcnJvcnMgPSBjb25maWcuZmllbGRFcnJvcnMoZmllbGQpO1xuLy9cbi8vICAgICBlcnJvcnMuZm9yRWFjaChmdW5jdGlvbiAoZXJyb3IpIHtcbi8vICAgICAgIGNsYXNzZXNbJ3ZhbGlkYXRpb24tZXJyb3ItJyArIGVycm9yLnR5cGVdID0gdHJ1ZTtcbi8vICAgICB9KTtcbi8vXG4vLyAgICAgaWYgKGNvbmZpZy5maWVsZElzUmVxdWlyZWQoZmllbGQpKSB7XG4vLyAgICAgICBjbGFzc2VzLnJlcXVpcmVkID0gdHJ1ZTtcbi8vICAgICB9IGVsc2Uge1xuLy8gICAgICAgY2xhc3Nlcy5vcHRpb25hbCA9IHRydWU7XG4vLyAgICAgfVxuLy9cbi8vICAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogY3goY2xhc3NlcyksIHN0eWxlOiB7ZGlzcGxheTogKGZpZWxkLmhpZGRlbiA/ICdub25lJyA6ICcnKX19LFxuLy8gICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJywge1xuLy8gICAgICAgICBjb25maWc6IGNvbmZpZywgZmllbGQ6IGZpZWxkLFxuLy8gICAgICAgICBpbmRleDogaW5kZXgsIG9uQ2xpY2s6IGNvbmZpZy5maWVsZElzQ29sbGFwc2libGUoZmllbGQpID8gdGhpcy5vbkNsaWNrTGFiZWwgOiBudWxsXG4vLyAgICAgICB9KSxcbi8vICAgICAgIENTU1RyYW5zaXRpb25Hcm91cCh7dHJhbnNpdGlvbk5hbWU6ICdyZXZlYWwnfSxcbi8vICAgICAgICAgdGhpcy5zdGF0ZS5jb2xsYXBzZWQgPyBbXSA6IFtcbi8vICAgICAgICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgnaGVscCcsIHtcbi8vICAgICAgICAgICAgIGNvbmZpZzogY29uZmlnLCBmaWVsZDogZmllbGQsXG4vLyAgICAgICAgICAgICBrZXk6ICdoZWxwJ1xuLy8gICAgICAgICAgIH0pLFxuLy8gICAgICAgICAgIHRoaXMucHJvcHMuY2hpbGRyZW5cbi8vICAgICAgICAgXVxuLy8gICAgICAgKVxuLy8gICAgICk7XG4vLyAgIH1cbi8vIH0pO1xuIiwiY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0hlbHAnLFxuXG4gIHJlbmRlcigpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5oZWxwVGV4dCkge1xuICAgICAgcmV0dXJuIDxkaXY+e3RoaXMucHJvcHMuaGVscFRleHR9PC9kaXY+O1xuICAgIH1cblxuICAgIHJldHVybiA8c3Bhbi8+O1xuICB9XG5cbn0pO1xuXG4vLyAvLyAjIGhlbHAgY29tcG9uZW50XG4vL1xuLy8gLypcbi8vIEp1c3QgdGhlIGhlbHAgdGV4dCBibG9jay5cbi8vICovXG4vL1xuLy8gJ3VzZSBzdHJpY3QnO1xuLy9cbi8vIHZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuLy8gdmFyIFIgPSBSZWFjdC5ET007XG4vLyB2YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG4vL1xuLy8gbW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4vL1xuLy8gICBkaXNwbGF5TmFtZTogJ0hlbHAnLFxuLy9cbi8vICAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcbi8vXG4vLyAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuLy8gICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbi8vICAgfSxcbi8vXG4vLyAgIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbi8vXG4vLyAgICAgdmFyIGhlbHBUZXh0ID0gdGhpcy5wcm9wcy5jb25maWcuZmllbGRIZWxwVGV4dCh0aGlzLnByb3BzLmZpZWxkKTtcbi8vXG4vLyAgICAgcmV0dXJuIGhlbHBUZXh0ID9cbi8vICAgICAgIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcyksIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MOiB7X19odG1sOiBoZWxwVGV4dH19KSA6XG4vLyAgICAgICBSLnNwYW4obnVsbCk7XG4vLyAgIH1cbi8vIH0pO1xuIiwiY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0xhYmVsJyxcblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgbGFiZWwgPSB0aGlzLnByb3BzLmxhYmVsIHx8ICcnO1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2PlxuICAgICAgICB7bGFiZWx9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbn0pO1xuXG4vLyAvLyAjIGxhYmVsIGNvbXBvbmVudFxuLy9cbi8vIC8qXG4vLyBKdXN0IHRoZSBsYWJlbCBmb3IgYSBmaWVsZC5cbi8vICovXG4vL1xuLy8gJ3VzZSBzdHJpY3QnO1xuLy9cbi8vIHZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuLy8gdmFyIFIgPSBSZWFjdC5ET007XG4vLyB2YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG4vL1xuLy8gbW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4vL1xuLy8gICBkaXNwbGF5TmFtZTogJ0xhYmVsJyxcbi8vXG4vLyAgIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG4vL1xuLy8gICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbi8vICAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4vLyAgIH0sXG4vL1xuLy8gICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4vLyAgICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuLy8gICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG4vL1xuLy8gICAgIHZhciBmaWVsZExhYmVsID0gY29uZmlnLmZpZWxkTGFiZWwoZmllbGQpO1xuLy9cbi8vICAgICB2YXIgbGFiZWwgPSBudWxsO1xuLy8gICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wcy5pbmRleCA9PT0gJ251bWJlcicpIHtcbi8vICAgICAgIGxhYmVsID0gJycgKyAodGhpcy5wcm9wcy5pbmRleCArIDEpICsgJy4nO1xuLy8gICAgICAgaWYgKGZpZWxkTGFiZWwpIHtcbi8vICAgICAgICAgbGFiZWwgPSBsYWJlbCArICcgJyArIGZpZWxkTGFiZWw7XG4vLyAgICAgICB9XG4vLyAgICAgfVxuLy9cbi8vICAgICBpZiAoZmllbGRMYWJlbCB8fCBsYWJlbCkge1xuLy8gICAgICAgdmFyIHRleHQgPSBsYWJlbCB8fCBmaWVsZExhYmVsO1xuLy8gICAgICAgaWYgKHRoaXMucHJvcHMub25DbGljaykge1xuLy8gICAgICAgICB0ZXh0ID0gUi5hKHtocmVmOiAnSmF2YVNjcmlwdCcgKyAnOicsIG9uQ2xpY2s6IHRoaXMucHJvcHMub25DbGlja30sIHRleHQpO1xuLy8gICAgICAgfVxuLy8gICAgICAgbGFiZWwgPSBSLmxhYmVsKHt9LCB0ZXh0KTtcbi8vICAgICB9XG4vL1xuLy8gICAgIHZhciByZXF1aXJlZE9yTm90O1xuLy9cbi8vICAgICBpZiAoIWNvbmZpZy5maWVsZEhhc1ZhbHVlQ2hpbGRyZW4oZmllbGQpKSB7XG4vLyAgICAgICByZXF1aXJlZE9yTm90ID0gUi5zcGFuKHtcbi8vICAgICAgICAgY2xhc3NOYW1lOiBjb25maWcuZmllbGRJc1JlcXVpcmVkKGZpZWxkKSA/ICdyZXF1aXJlZC10ZXh0JyA6ICdub3QtcmVxdWlyZWQtdGV4dCdcbi8vICAgICAgIH0pO1xuLy8gICAgIH1cbi8vXG4vLyAgICAgcmV0dXJuIFIuZGl2KHtcbi8vICAgICAgIGNsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKVxuLy8gICAgIH0sXG4vLyAgICAgICBsYWJlbCxcbi8vICAgICAgICcgJyxcbi8vICAgICAgIHJlcXVpcmVkT3JOb3Rcbi8vICAgICApO1xuLy8gICB9XG4vLyB9KTtcbiIsImNvbnN0IHdyYXBGaWVsZCA9IHJlcXVpcmUoJy4vd3JhcC1maWVsZCcpO1xuY29uc3Qgd3JhcEhlbHBlciA9IHJlcXVpcmUoJy4vd3JhcC1oZWxwZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGZpZWxkczoge1xuICAgIFN0cmluZzogd3JhcEZpZWxkKHJlcXVpcmUoJy4vZmllbGRzL3N0cmluZycpKVxuICB9LFxuICBoZWxwZXJzOiB7XG4gICAgRmllbGQ6IHdyYXBIZWxwZXIocmVxdWlyZSgnLi9oZWxwZXJzL2ZpZWxkJykpLFxuICAgIExhYmVsOiB3cmFwSGVscGVyKHJlcXVpcmUoJy4vaGVscGVycy9sYWJlbCcpKSxcbiAgICBIZWxwOiB3cmFwSGVscGVyKHJlcXVpcmUoJy4vaGVscGVycy9oZWxwJykpXG4gIH1cbn07XG4iLCJjb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5jb25zdCBDb25maWcgPSByZXF1aXJlKCcuLi9jb25maWcnKTtcbmNvbnN0IF8gPSByZXF1aXJlKCcuLi91bmRhc2gnKTtcblxuZXhwb3J0IGRlZmF1bHQgKEZpZWxkQ29tcG9uZW50KSA9PiB7XG5cbiAgY29uc3QgV3JhcEZpZWxkID0gY2xhc3MgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMsIGNvbnRleHQpIHtcbiAgICAgIHN1cGVyKHByb3BzLCBjb250ZXh0KTtcblxuICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgY29uZmlnOiBDb25maWcuZm9yQ29tcG9uZW50KHRoaXMpLFxuICAgICAgICBpc0NvbnRyb2xsZWQ6ICFfLmlzVW5kZWZpbmVkKHRoaXMucHJvcHMudmFsdWUpLFxuICAgICAgICB2YWx1ZTogXy5pc1VuZGVmaW5lZCh0aGlzLnByb3BzLnZhbHVlKSA/IHRoaXMucHJvcHMuZGVmYXVsdFZhbHVlIDogdGhpcy5wcm9wcy52YWx1ZSxcbiAgICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UuYmluZCh0aGlzKVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzIChuZXdQcm9wcykge1xuICAgICAgaWYgKHRoaXMuc3RhdGUuaXNDb250cm9sbGVkKSB7XG4gICAgICAgIGlmICghXy5pc1VuZGVmaW5lZChuZXdQcm9wcy52YWx1ZSkpIHtcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHZhbHVlOiBuZXdQcm9wcy52YWx1ZVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgb25DaGFuZ2UgKG5ld1ZhbHVlKSB7XG4gICAgICBpZiAoIXRoaXMuc3RhdGUuaXNDb250cm9sbGVkKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIHZhbHVlOiBuZXdWYWx1ZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG5ld1ZhbHVlKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICByZXR1cm4gPEZpZWxkQ29tcG9uZW50IHsuLi50aGlzLnByb3BzfSB7Li4udGhpcy5zdGF0ZX0vPjtcbiAgICB9XG5cbiAgfTtcblxuICByZXR1cm4gV3JhcEZpZWxkO1xufTtcbiIsImNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbmNvbnN0IENvbmZpZyA9IHJlcXVpcmUoJy4uL2NvbmZpZycpO1xuXG5leHBvcnQgZGVmYXVsdCAoSGVscGVyQ29tcG9uZW50KSA9PiB7XG5cbiAgY29uc3QgV3JhcEhlbHBlciA9IGNsYXNzIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzLCBjb250ZXh0KSB7XG4gICAgICBzdXBlcihwcm9wcywgY29udGV4dCk7XG5cbiAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgIGNvbmZpZzogQ29uZmlnLmZvckNvbXBvbmVudCh0aGlzKVxuICAgICAgfTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICByZXR1cm4gPEhlbHBlckNvbXBvbmVudCB7Li4udGhpcy5wcm9wc30gey4uLnRoaXMuc3RhdGV9Lz47XG4gICAgfVxuXG4gIH07XG5cbiAgcmV0dXJuIFdyYXBIZWxwZXI7XG59O1xuIiwiLy8gIyBkZWZhdWx0LWNvbmZpZ1xuXG4vKlxuVGhpcyBpcyB0aGUgZGVmYXVsdCBjb25maWd1cmF0aW9uIHBsdWdpbiBmb3IgZm9ybWF0aWMuIFRvIGNoYW5nZSBmb3JtYXRpYydzXG5iZWhhdmlvciwganVzdCBjcmVhdGUgeW91ciBvd24gcGx1Z2luIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhbiBvYmplY3Qgd2l0aFxubWV0aG9kcyB5b3Ugd2FudCB0byBhZGQgb3Igb3ZlcnJpZGUuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbmxldCBkZWZhdWx0Q29uZmlnID0ge307XG5cbmNvbnN0IENvbmZpZyA9IHtcbiAgZm9yQ29tcG9uZW50KGNvbXBvbmVudCkge1xuICAgIGlmIChjb21wb25lbnQucHJvcHMuY29uZmlnKSB7XG4gICAgICByZXR1cm4gY29tcG9uZW50LnByb3BzLmNvbmZpZztcbiAgICB9XG4gICAgcmV0dXJuIGRlZmF1bHRDb25maWc7XG4gIH0sXG4gIHNldERlZmF1bHRDb25maWcoY29uZmlnKSB7XG4gICAgZGVmYXVsdENvbmZpZyA9IGNvbmZpZztcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb25maWc7XG5cbi8vIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNvbmZpZykge1xuLy9cbi8vICAgdmFyIGRlbGVnYXRlVG8gPSB1dGlscy5kZWxlZ2F0b3IoY29uZmlnKTtcbi8vXG4vLyAgIHJldHVybiB7XG4vL1xuLy8gICAgIC8vIE5vcm1hbGl6ZSBhbiBlbGVtZW50IG5hbWUuXG4vLyAgICAgZWxlbWVudE5hbWUobmFtZSkge1xuLy8gICAgICAgcmV0dXJuIHV0aWxzLmRhc2hUb1Bhc2NhbChuYW1lKTtcbi8vICAgICB9LFxuLy9cbi8vICAgICBjbGFzcyhuYW1lKSB7XG4vLyAgICAgICBpZiAoIW5hbWUpIHtcbi8vICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb21wb25lbnQgY2xhc3MgbmFtZSBtdXN0IGJlIHNwZWNpZmllZCB0byByZXRyaWV2ZSBjb21wb25lbnQgY2xhc3MuJyk7XG4vLyAgICAgICB9XG4vLyAgICAgICBuYW1lID0gY29uZmlnLmVsZW1lbnROYW1lKG5hbWUpO1xuLy8gICAgICAgaWYgKENvbXBvbmVudHNbbmFtZV0pIHtcbi8vICAgICAgICAgcmV0dXJuIENvbXBvbmVudHNbbmFtZV07XG4vLyAgICAgICB9XG4vLyAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENvbXBvbmVudCBjbGFzcyAke25hbWV9IG5vdCBmb3VuZC5gKTtcbi8vICAgICB9LFxuLy9cbi8vICAgICBoZWxwZXJDbGFzcyhuYW1lKSB7XG4vLyAgICAgICBpZiAoIW5hbWUpIHtcbi8vICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdIZWxwZXIgY2xhc3MgbmFtZSBtdXN0IGJlIHNwZWNpZmllZCB0byByZXRyaWV2ZSBjb21wb25lbnQgY2xhc3MuJyk7XG4vLyAgICAgICB9XG4vLyAgICAgICBuYW1lID0gY29uZmlnLmVsZW1lbnROYW1lKG5hbWUpO1xuLy8gICAgICAgcmV0dXJuIGNvbmZpZy5jbGFzcyhuYW1lKTtcbi8vICAgICB9LFxuLy9cbi8vICAgICBmaWVsZENsYXNzKG5hbWUpIHtcbi8vICAgICAgIGlmICghbmFtZSkge1xuLy8gICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZpZWxkIGNsYXNzIG5hbWUgbXVzdCBiZSBzcGVjaWZpZWQgdG8gcmV0cmlldmUgY29tcG9uZW50IGNsYXNzLicpO1xuLy8gICAgICAgfVxuLy8gICAgICAgbmFtZSArPSAnLWZpZWxkJztcbi8vICAgICAgIG5hbWUgPSBjb25maWcuZWxlbWVudE5hbWUobmFtZSk7XG4vLyAgICAgICByZXR1cm4gY29uZmlnLmNsYXNzKG5hbWUpO1xuLy8gICAgIH1cblxuICAgIC8vIC8vIFJlbmRlciB0aGUgcm9vdCBmb3JtYXRpYyBjb21wb25lbnRcbiAgICAvLyByZW5kZXJGb3JtYXRpY0NvbXBvbmVudDogZnVuY3Rpb24gKGNvbXBvbmVudCkge1xuICAgIC8vXG4gICAgLy8gICBjb25zdCBwcm9wcyA9IGNvbXBvbmVudC5wcm9wcztcbiAgICAvL1xuICAgIC8vICAgLy92YXIgZmllbGQgPSBjb25maWcuY3JlYXRlUm9vdEZpZWxkKHByb3BzKTtcbiAgICAvL1xuICAgIC8vICAgcmV0dXJuIChcbiAgICAvLyAgICAgPGRpdiBjbGFzc05hbWU9XCJmb3JtYXRpY1wiPlxuICAgIC8vXG4gICAgLy8gICAgIDwvZGl2PlxuICAgIC8vICAgKTtcbiAgICAvL1xuICAgIC8vICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6ICdmb3JtYXRpYyd9LFxuICAgIC8vICAgICBjb25maWcuY3JlYXRlRmllbGRFbGVtZW50KHtmaWVsZDogZmllbGQsIG9uQ2hhbmdlOiBjb21wb25lbnQub25DaGFuZ2UsIG9uQWN0aW9uOiBjb21wb25lbnQub25BY3Rpb259KVxuICAgIC8vICAgKTtcbiAgICAvLyB9LFxuXG4gICAgLy8gLy8gQ3JlYXRlIGEgZmllbGQgZWxlbWVudCBnaXZlbiBzb21lIHByb3BzLiBVc2UgY29udGV4dCB0byBkZXRlcm1pbmUgbmFtZS5cbiAgICAvLyBjcmVhdGVGaWVsZEVsZW1lbnQ6IGZ1bmN0aW9uIChwcm9wcykge1xuICAgIC8vXG4gICAgLy8gICB2YXIgbmFtZSA9IGNvbmZpZy5maWVsZFR5cGVOYW1lKHByb3BzLmZpZWxkKTtcbiAgICAvL1xuICAgIC8vICAgaWYgKGNvbmZpZy5oYXNFbGVtZW50RmFjdG9yeShuYW1lKSkge1xuICAgIC8vICAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQobmFtZSwgcHJvcHMpO1xuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ1Vua25vd25GaWVsZCcsIHByb3BzKTtcbiAgICAvLyB9LFxuXG4gICAgLy9cbiAgICAvLyAvLyBGaWVsZCBlbGVtZW50IGZhY3Rvcmllcy4gQ3JlYXRlIGZpZWxkIGVsZW1lbnRzLlxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9GaWVsZHM6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9maWVsZHMnKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X1N0cmluZzogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL3N0cmluZycpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfU2luZ2xlTGluZVN0cmluZzogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL3NpbmdsZS1saW5lLXN0cmluZycpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfU2VsZWN0OiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvc2VsZWN0JykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9QcmV0dHlTZWxlY3Q6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9wcmV0dHktc2VsZWN0JykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9Cb29sZWFuOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvYm9vbGVhbicpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfUHJldHR5Qm9vbGVhbjogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL3ByZXR0eS1ib29sZWFuJykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9DaGVja2JveEJvb2xlYW46IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9jaGVja2JveC1ib29sZWFuJykpLFxuICAgIC8vXG4gICAgLy8gLy8gY3JlYXRlRWxlbWVudF9QcmV0dHlUZXh0OiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvcHJldHR5LXRleHQnKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X1ByZXR0eVRleHQ6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9wcmV0dHktdGV4dDInKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X0FycmF5OiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvYXJyYXknKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X0NoZWNrYm94QXJyYXk6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9jaGVja2JveC1hcnJheScpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfT2JqZWN0OiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvb2JqZWN0JykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9Kc29uOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvanNvbicpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfVW5rbm93bkZpZWxkOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvdW5rbm93bicpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfQ29weTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL2NvcHknKSksXG4gICAgLy9cbiAgICAvL1xuICAgIC8vIC8vIE90aGVyIGVsZW1lbnQgZmFjdG9yaWVzLiBDcmVhdGUgaGVscGVyIGVsZW1lbnRzIHVzZWQgYnkgZmllbGQgY29tcG9uZW50cy5cbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfRmllbGQ6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvZmllbGQnKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X0xhYmVsOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2xhYmVsJykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9IZWxwOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2hlbHAnKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X0Nob2ljZXM6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvY2hvaWNlcycpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfTG9hZGluZ0Nob2ljZXM6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvbG9hZGluZy1jaG9pY2VzJykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9BcnJheUNvbnRyb2w6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvYXJyYXktY29udHJvbCcpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfQXJyYXlJdGVtQ29udHJvbDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9hcnJheS1pdGVtLWNvbnRyb2wnKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X0FycmF5SXRlbVZhbHVlOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2FycmF5LWl0ZW0tdmFsdWUnKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X0FycmF5SXRlbTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9hcnJheS1pdGVtJykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9GaWVsZFRlbXBsYXRlQ2hvaWNlczogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9maWVsZC10ZW1wbGF0ZS1jaG9pY2VzJykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9BZGRJdGVtOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2FkZC1pdGVtJykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9SZW1vdmVJdGVtOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL3JlbW92ZS1pdGVtJykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9Nb3ZlSXRlbUZvcndhcmQ6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvbW92ZS1pdGVtLWZvcndhcmQnKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X01vdmVJdGVtQmFjazogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9tb3ZlLWl0ZW0tYmFjaycpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfT2JqZWN0Q29udHJvbDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9vYmplY3QtY29udHJvbCcpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfT2JqZWN0SXRlbUNvbnRyb2w6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWl0ZW0tY29udHJvbCcpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfT2JqZWN0SXRlbVZhbHVlOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL29iamVjdC1pdGVtLXZhbHVlJykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9PYmplY3RJdGVtS2V5OiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL29iamVjdC1pdGVtLWtleScpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfT2JqZWN0SXRlbTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9vYmplY3QtaXRlbScpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfU2VsZWN0VmFsdWU6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvc2VsZWN0LXZhbHVlJykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9QcmV0dHlTZWxlY3RWYWx1ZTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9wcmV0dHktc2VsZWN0LXZhbHVlJykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9TYW1wbGU6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvc2FtcGxlJykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9JbnNlcnRCdXR0b246IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvaW5zZXJ0LWJ1dHRvbicpKSxcbiAgICAvL1xuICAgIC8vXG4gICAgLy8gLy8gRmllbGQgZGVmYXVsdCB2YWx1ZSBmYWN0b3JpZXMuIEdpdmUgYSBkZWZhdWx0IHZhbHVlIGZvciBhIHNwZWNpZmljIHR5cGUuXG4gICAgLy9cbiAgICAvLyBjcmVhdGVEZWZhdWx0VmFsdWVfU3RyaW5nOiBmdW5jdGlvbiAoLyogZmllbGRUZW1wbGF0ZSAqLykge1xuICAgIC8vICAgcmV0dXJuICcnO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyBjcmVhdGVEZWZhdWx0VmFsdWVfT2JqZWN0OiBmdW5jdGlvbiAoLyogZmllbGRUZW1wbGF0ZSAqLykge1xuICAgIC8vICAgcmV0dXJuIHt9O1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyBjcmVhdGVEZWZhdWx0VmFsdWVfQXJyYXk6IGZ1bmN0aW9uICgvKiBmaWVsZFRlbXBsYXRlICovKSB7XG4gICAgLy8gICByZXR1cm4gW107XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZURlZmF1bHRWYWx1ZV9Cb29sZWFuOiBmdW5jdGlvbiAoLyogZmllbGRUZW1wbGF0ZSAqLykge1xuICAgIC8vICAgcmV0dXJuIGZhbHNlO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyBjcmVhdGVEZWZhdWx0VmFsdWVfRmllbGRzOiBkZWxlZ2F0ZVRvKCdjcmVhdGVEZWZhdWx0VmFsdWVfT2JqZWN0JyksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVEZWZhdWx0VmFsdWVfU2luZ2xlTGluZVN0cmluZzogZGVsZWdhdGVUbygnY3JlYXRlRGVmYXVsdFZhbHVlX1N0cmluZycpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRGVmYXVsdFZhbHVlX1NlbGVjdDogZGVsZWdhdGVUbygnY3JlYXRlRGVmYXVsdFZhbHVlX1N0cmluZycpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRGVmYXVsdFZhbHVlX0pzb246IGRlbGVnYXRlVG8oJ2NyZWF0ZURlZmF1bHRWYWx1ZV9PYmplY3QnKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZURlZmF1bHRWYWx1ZV9DaGVja2JveEFycmF5OiBkZWxlZ2F0ZVRvKCdjcmVhdGVEZWZhdWx0VmFsdWVfQXJyYXknKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZURlZmF1bHRWYWx1ZV9DaGVja2JveEJvb2xlYW46IGRlbGVnYXRlVG8oJ2NyZWF0ZURlZmF1bHRWYWx1ZV9Cb29sZWFuJyksXG4gICAgLy9cbiAgICAvL1xuICAgIC8vIC8vIEZpZWxkIHZhbHVlIGNvZXJjZXJzLiBDb2VyY2UgYSB2YWx1ZSBpbnRvIGEgdmFsdWUgYXBwcm9wcmlhdGUgZm9yIGEgc3BlY2lmaWMgdHlwZS5cbiAgICAvL1xuICAgIC8vIGNvZXJjZVZhbHVlX1N0cmluZzogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUsIHZhbHVlKSB7XG4gICAgLy8gICBpZiAoXy5pc1N0cmluZyh2YWx1ZSkpIHtcbiAgICAvLyAgICAgcmV0dXJuIHZhbHVlO1xuICAgIC8vICAgfVxuICAgIC8vICAgaWYgKF8uaXNVbmRlZmluZWQodmFsdWUpIHx8IHZhbHVlID09PSBudWxsKSB7XG4gICAgLy8gICAgIHJldHVybiAnJztcbiAgICAvLyAgIH1cbiAgICAvLyAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIGNvZXJjZVZhbHVlX09iamVjdDogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUsIHZhbHVlKSB7XG4gICAgLy8gICBpZiAoIV8uaXNPYmplY3QodmFsdWUpKSB7XG4gICAgLy8gICAgIHJldHVybiB7fTtcbiAgICAvLyAgIH1cbiAgICAvLyAgIHJldHVybiB2YWx1ZTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gY29lcmNlVmFsdWVfQXJyYXk6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlLCB2YWx1ZSkge1xuICAgIC8vICAgaWYgKCFfLmlzQXJyYXkodmFsdWUpKSB7XG4gICAgLy8gICAgIHJldHVybiBbdmFsdWVdO1xuICAgIC8vICAgfVxuICAgIC8vICAgcmV0dXJuIHZhbHVlO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyBjb2VyY2VWYWx1ZV9Cb29sZWFuOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSwgdmFsdWUpIHtcbiAgICAvLyAgIHJldHVybiBjb25maWcuY29lcmNlVmFsdWVUb0Jvb2xlYW4odmFsdWUpO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyBjb2VyY2VWYWx1ZV9GaWVsZHM6IGRlbGVnYXRlVG8oJ2NvZXJjZVZhbHVlX09iamVjdCcpLFxuICAgIC8vXG4gICAgLy8gY29lcmNlVmFsdWVfU2luZ2xlTGluZVN0cmluZzogZGVsZWdhdGVUbygnY29lcmNlVmFsdWVfU3RyaW5nJyksXG4gICAgLy9cbiAgICAvLyBjb2VyY2VWYWx1ZV9TZWxlY3Q6IGRlbGVnYXRlVG8oJ2NvZXJjZVZhbHVlX1N0cmluZycpLFxuICAgIC8vXG4gICAgLy8gY29lcmNlVmFsdWVfSnNvbjogZGVsZWdhdGVUbygnY29lcmNlVmFsdWVfT2JqZWN0JyksXG4gICAgLy9cbiAgICAvLyBjb2VyY2VWYWx1ZV9DaGVja2JveEFycmF5OiBkZWxlZ2F0ZVRvKCdjb2VyY2VWYWx1ZV9BcnJheScpLFxuICAgIC8vXG4gICAgLy8gY29lcmNlVmFsdWVfQ2hlY2tib3hCb29sZWFuOiBkZWxlZ2F0ZVRvKCdjb2VyY2VWYWx1ZV9Cb29sZWFuJyksXG4gICAgLy9cbiAgICAvL1xuICAgIC8vIC8vIEZpZWxkIGNoaWxkIGZpZWxkcyBmYWN0b3JpZXMsIHNvIHNvbWUgdHlwZXMgY2FuIGhhdmUgZHluYW1pYyBjaGlsZHJlbi5cbiAgICAvL1xuICAgIC8vIGNyZWF0ZUNoaWxkRmllbGRzX0FycmF5OiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAvL1xuICAgIC8vICAgcmV0dXJuIGZpZWxkLnZhbHVlLm1hcChmdW5jdGlvbiAoYXJyYXlJdGVtLCBpKSB7XG4gICAgLy8gICAgIHZhciBjaGlsZEZpZWxkVGVtcGxhdGUgPSBjb25maWcuY2hpbGRGaWVsZFRlbXBsYXRlRm9yVmFsdWUoZmllbGQsIGFycmF5SXRlbSk7XG4gICAgLy9cbiAgICAvLyAgICAgdmFyIGNoaWxkRmllbGQgPSBjb25maWcuY3JlYXRlQ2hpbGRGaWVsZChmaWVsZCwge1xuICAgIC8vICAgICAgIGZpZWxkVGVtcGxhdGU6IGNoaWxkRmllbGRUZW1wbGF0ZSwga2V5OiBpLCBmaWVsZEluZGV4OiBpLCB2YWx1ZTogYXJyYXlJdGVtXG4gICAgLy8gICAgIH0pO1xuICAgIC8vXG4gICAgLy8gICAgIHJldHVybiBjaGlsZEZpZWxkO1xuICAgIC8vICAgfSk7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUNoaWxkRmllbGRzX09iamVjdDogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiBPYmplY3Qua2V5cyhmaWVsZC52YWx1ZSkubWFwKGZ1bmN0aW9uIChrZXksIGkpIHtcbiAgICAvLyAgICAgdmFyIGNoaWxkRmllbGRUZW1wbGF0ZSA9IGNvbmZpZy5jaGlsZEZpZWxkVGVtcGxhdGVGb3JWYWx1ZShmaWVsZCwgZmllbGQudmFsdWVba2V5XSk7XG4gICAgLy9cbiAgICAvLyAgICAgdmFyIGNoaWxkRmllbGQgPSBjb25maWcuY3JlYXRlQ2hpbGRGaWVsZChmaWVsZCwge1xuICAgIC8vICAgICAgIGZpZWxkVGVtcGxhdGU6IGNoaWxkRmllbGRUZW1wbGF0ZSwga2V5OiBrZXksIGZpZWxkSW5kZXg6IGksIHZhbHVlOiBmaWVsZC52YWx1ZVtrZXldXG4gICAgLy8gICAgIH0pO1xuICAgIC8vXG4gICAgLy8gICAgIHJldHVybiBjaGlsZEZpZWxkO1xuICAgIC8vICAgfSk7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIENoZWNrIGlmIHRoZXJlIGlzIGEgZmFjdG9yeSBmb3IgdGhlIG5hbWUuXG4gICAgLy8gaGFzRWxlbWVudEZhY3Rvcnk6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiBjb25maWdbJ2NyZWF0ZUVsZW1lbnRfJyArIG5hbWVdID8gdHJ1ZSA6IGZhbHNlO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBDcmVhdGUgYW4gZWxlbWVudCBnaXZlbiBhIG5hbWUsIHByb3BzLCBhbmQgY2hpbGRyZW4uXG4gICAgLy8gY3JlYXRlRWxlbWVudDogZnVuY3Rpb24gKG5hbWUsIHByb3BzLCBjaGlsZHJlbikge1xuICAgIC8vXG4gICAgLy8gICBpZiAoIXByb3BzLmNvbmZpZykge1xuICAgIC8vICAgICBwcm9wcyA9IF8uZXh0ZW5kKHt9LCBwcm9wcywge2NvbmZpZzogY29uZmlnfSk7XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIG5hbWUgPSBjb25maWcuZWxlbWVudE5hbWUobmFtZSk7XG4gICAgLy9cbiAgICAvLyAgIGlmIChjb25maWdbJ2NyZWF0ZUVsZW1lbnRfJyArIG5hbWVdKSB7XG4gICAgLy8gICAgIHJldHVybiBjb25maWdbJ2NyZWF0ZUVsZW1lbnRfJyArIG5hbWVdKHByb3BzLCBjaGlsZHJlbik7XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIGlmIChuYW1lICE9PSAnVW5rbm93bicpIHtcbiAgICAvLyAgICAgaWYgKGNvbmZpZy5oYXNFbGVtZW50RmFjdG9yeSgnVW5rbm93bicpKSB7XG4gICAgLy8gICAgICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdVbmtub3duJywgcHJvcHMsIGNoaWxkcmVuKTtcbiAgICAvLyAgICAgfVxuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICB0aHJvdyBuZXcgRXJyb3IoJ0ZhY3Rvcnkgbm90IGZvdW5kIGZvcjogJyArIG5hbWUpO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBDcmVhdGUgYSBmaWVsZCBlbGVtZW50IGdpdmVuIHNvbWUgcHJvcHMuIFVzZSBjb250ZXh0IHRvIGRldGVybWluZSBuYW1lLlxuICAgIC8vIGNyZWF0ZUZpZWxkRWxlbWVudDogZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgLy9cbiAgICAvLyAgIHZhciBuYW1lID0gY29uZmlnLmZpZWxkVHlwZU5hbWUocHJvcHMuZmllbGQpO1xuICAgIC8vXG4gICAgLy8gICBpZiAoY29uZmlnLmhhc0VsZW1lbnRGYWN0b3J5KG5hbWUpKSB7XG4gICAgLy8gICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudChuYW1lLCBwcm9wcyk7XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnVW5rbm93bkZpZWxkJywgcHJvcHMpO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBSZW5kZXIgdGhlIHJvb3QgZm9ybWF0aWMgY29tcG9uZW50XG4gICAgLy8gcmVuZGVyRm9ybWF0aWNDb21wb25lbnQ6IGZ1bmN0aW9uIChjb21wb25lbnQpIHtcbiAgICAvL1xuICAgIC8vICAgdmFyIHByb3BzID0gY29tcG9uZW50LnByb3BzO1xuICAgIC8vXG4gICAgLy8gICB2YXIgZmllbGQgPSBjb25maWcuY3JlYXRlUm9vdEZpZWxkKHByb3BzKTtcbiAgICAvL1xuICAgIC8vICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6ICdmb3JtYXRpYyd9LFxuICAgIC8vICAgICBjb25maWcuY3JlYXRlRmllbGRFbGVtZW50KHtmaWVsZDogZmllbGQsIG9uQ2hhbmdlOiBjb21wb25lbnQub25DaGFuZ2UsIG9uQWN0aW9uOiBjb21wb25lbnQub25BY3Rpb259KVxuICAgIC8vICAgKTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gUmVuZGVyIGFueSBjb21wb25lbnQuXG4gICAgLy8gcmVuZGVyQ29tcG9uZW50OiBmdW5jdGlvbiAoY29tcG9uZW50KSB7XG4gICAgLy9cbiAgICAvLyAgIHZhciBuYW1lID0gY29tcG9uZW50LmNvbnN0cnVjdG9yLmRpc3BsYXlOYW1lO1xuICAgIC8vXG4gICAgLy8gICBpZiAoY29uZmlnWydyZW5kZXJDb21wb25lbnRfJyArIG5hbWVdKSB7XG4gICAgLy8gICAgIHJldHVybiBjb25maWdbJ3JlbmRlckNvbXBvbmVudF8nICsgbmFtZV0oY29tcG9uZW50KTtcbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgcmV0dXJuIGNvbXBvbmVudC5yZW5kZXJEZWZhdWx0KCk7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIFJlbmRlciBmaWVsZCBjb21wb25lbnRzLlxuICAgIC8vIHJlbmRlckZpZWxkQ29tcG9uZW50OiBmdW5jdGlvbiAoY29tcG9uZW50KSB7XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiBjb25maWcucmVuZGVyQ29tcG9uZW50KGNvbXBvbmVudCk7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIE5vcm1hbGl6ZSBhbiBlbGVtZW50IG5hbWUuXG4gICAgLy8gZWxlbWVudE5hbWU6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgLy8gICByZXR1cm4gdXRpbHMuZGFzaFRvUGFzY2FsKG5hbWUpO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBUeXBlIGFsaWFzZXMuXG4gICAgLy9cbiAgICAvLyBhbGlhc19EaWN0OiAnT2JqZWN0JyxcbiAgICAvL1xuICAgIC8vIGFsaWFzX0Jvb2w6ICdCb29sZWFuJyxcbiAgICAvL1xuICAgIC8vIGFsaWFzX1ByZXR0eVRleHRhcmVhOiAnUHJldHR5VGV4dCcsXG4gICAgLy9cbiAgICAvLyBhbGlhc19TaW5nbGVMaW5lU3RyaW5nOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSkge1xuICAgIC8vICAgaWYgKGZpZWxkVGVtcGxhdGUucmVwbGFjZUNob2ljZXMpIHtcbiAgICAvLyAgICAgcmV0dXJuICdQcmV0dHlUZXh0JztcbiAgICAvLyAgIH0gZWxzZSBpZiAoZmllbGRUZW1wbGF0ZS5jaG9pY2VzKSB7XG4gICAgLy8gICAgIHJldHVybiAnU2VsZWN0JztcbiAgICAvLyAgIH1cbiAgICAvLyAgIHJldHVybiAnU2luZ2xlTGluZVN0cmluZyc7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIGFsaWFzX1N0cmluZzogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcbiAgICAvL1xuICAgIC8vICAgaWYgKGZpZWxkVGVtcGxhdGUucmVwbGFjZUNob2ljZXMpIHtcbiAgICAvLyAgICAgcmV0dXJuICdQcmV0dHlUZXh0JztcbiAgICAvLyAgIH0gZWxzZSBpZiAoZmllbGRUZW1wbGF0ZS5jaG9pY2VzKSB7XG4gICAgLy8gICAgIHJldHVybiAnU2VsZWN0JztcbiAgICAvLyAgIH0gZWxzZSBpZiAoY29uZmlnLmZpZWxkVGVtcGxhdGVJc1NpbmdsZUxpbmUoZmllbGRUZW1wbGF0ZSkpIHtcbiAgICAvLyAgICAgcmV0dXJuICdTaW5nbGVMaW5lU3RyaW5nJztcbiAgICAvLyAgIH1cbiAgICAvLyAgIHJldHVybiAnU3RyaW5nJztcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gYWxpYXNfVGV4dDogZGVsZWdhdGVUbygnYWxpYXNfU3RyaW5nJyksXG4gICAgLy9cbiAgICAvLyBhbGlhc19Vbmljb2RlOiBkZWxlZ2F0ZVRvKCdhbGlhc19TaW5nbGVMaW5lU3RyaW5nJyksXG4gICAgLy9cbiAgICAvLyBhbGlhc19TdHI6IGRlbGVnYXRlVG8oJ2FsaWFzX1NpbmdsZUxpbmVTdHJpbmcnKSxcbiAgICAvL1xuICAgIC8vIGFsaWFzX0xpc3Q6ICdBcnJheScsXG4gICAgLy9cbiAgICAvLyBhbGlhc19DaGVja2JveExpc3Q6ICdDaGVja2JveEFycmF5JyxcbiAgICAvL1xuICAgIC8vIGFsaWFzX0ZpZWxkc2V0OiAnRmllbGRzJyxcbiAgICAvL1xuICAgIC8vIGFsaWFzX0NoZWNrYm94OiAnQ2hlY2tib3hCb29sZWFuJyxcbiAgICAvL1xuICAgIC8vIC8vIEZpZWxkIGZhY3RvcnlcbiAgICAvL1xuICAgIC8vIC8vIEdpdmVuIGEgZmllbGQsIGV4cGFuZCBhbGwgY2hpbGQgZmllbGRzIHJlY3Vyc2l2ZWx5IHRvIGdldCB0aGUgZGVmYXVsdFxuICAgIC8vIC8vIHZhbHVlcyBvZiBhbGwgZmllbGRzLlxuICAgIC8vIGluZmxhdGVGaWVsZFZhbHVlOiBmdW5jdGlvbiAoZmllbGQsIGZpZWxkSGFuZGxlcikge1xuICAgIC8vXG4gICAgLy8gICBpZiAoZmllbGRIYW5kbGVyKSB7XG4gICAgLy8gICAgIHZhciBzdG9wID0gZmllbGRIYW5kbGVyKGZpZWxkKTtcbiAgICAvLyAgICAgaWYgKHN0b3AgPT09IGZhbHNlKSB7XG4gICAgLy8gICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAvLyAgICAgfVxuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICBpZiAoY29uZmlnLmZpZWxkSGFzVmFsdWVDaGlsZHJlbihmaWVsZCkpIHtcbiAgICAvLyAgICAgdmFyIHZhbHVlID0gXy5jbG9uZShmaWVsZC52YWx1ZSk7XG4gICAgLy8gICAgIHZhciBjaGlsZEZpZWxkcyA9IGNvbmZpZy5jcmVhdGVDaGlsZEZpZWxkcyhmaWVsZCk7XG4gICAgLy8gICAgIGNoaWxkRmllbGRzLmZvckVhY2goZnVuY3Rpb24gKGNoaWxkRmllbGQpIHtcbiAgICAvLyAgICAgICBpZiAoY29uZmlnLmlzS2V5KGNoaWxkRmllbGQua2V5KSkge1xuICAgIC8vICAgICAgICAgdmFsdWVbY2hpbGRGaWVsZC5rZXldID0gY29uZmlnLmluZmxhdGVGaWVsZFZhbHVlKGNoaWxkRmllbGQsIGZpZWxkSGFuZGxlcik7XG4gICAgLy8gICAgICAgfVxuICAgIC8vICAgICB9KTtcbiAgICAvLyAgICAgcmV0dXJuIHZhbHVlO1xuICAgIC8vICAgfSBlbHNlIHtcbiAgICAvLyAgICAgcmV0dXJuIGZpZWxkLnZhbHVlO1xuICAgIC8vICAgfVxuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBJbml0aWFsaXplIHRoZSByb290IGZpZWxkLlxuICAgIC8vIGluaXRSb290RmllbGQ6IGZ1bmN0aW9uICgvKiBmaWVsZCwgcHJvcHMgKi8pIHtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gSW5pdGlhbGl6ZSBldmVyeSBmaWVsZC5cbiAgICAvLyBpbml0RmllbGQ6IGZ1bmN0aW9uICgvKiBmaWVsZCAqLykge1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBJZiBhbiBhcnJheSBvZiBmaWVsZCB0ZW1wbGF0ZXMgYXJlIHBhc3NlZCBpbiwgdGhpcyBtZXRob2QgaXMgdXNlZCB0b1xuICAgIC8vIC8vIHdyYXAgdGhlIGZpZWxkcyBpbnNpZGUgYSBzaW5nbGUgcm9vdCBmaWVsZCB0ZW1wbGF0ZS5cbiAgICAvLyB3cmFwRmllbGRUZW1wbGF0ZXM6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlcykge1xuICAgIC8vICAgcmV0dXJuIHtcbiAgICAvLyAgICAgdHlwZTogJ2ZpZWxkcycsXG4gICAgLy8gICAgIHBsYWluOiB0cnVlLFxuICAgIC8vICAgICBmaWVsZHM6IGZpZWxkVGVtcGxhdGVzXG4gICAgLy8gICB9O1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBHaXZlbiB0aGUgcHJvcHMgdGhhdCBhcmUgcGFzc2VkIGluLCBjcmVhdGUgdGhlIHJvb3QgZmllbGQuXG4gICAgLy8gY3JlYXRlUm9vdEZpZWxkOiBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAvL1xuICAgIC8vICAgdmFyIGZpZWxkVGVtcGxhdGUgPSBwcm9wcy5maWVsZFRlbXBsYXRlIHx8IHByb3BzLmZpZWxkVGVtcGxhdGVzIHx8IHByb3BzLmZpZWxkIHx8IHByb3BzLmZpZWxkcztcbiAgICAvLyAgIHZhciB2YWx1ZSA9IHByb3BzLnZhbHVlO1xuICAgIC8vXG4gICAgLy8gICBpZiAoIWZpZWxkVGVtcGxhdGUpIHtcbiAgICAvLyAgICAgZmllbGRUZW1wbGF0ZSA9IGNvbmZpZy5jcmVhdGVGaWVsZFRlbXBsYXRlRnJvbVZhbHVlKHZhbHVlKTtcbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgaWYgKF8uaXNBcnJheShmaWVsZFRlbXBsYXRlKSkge1xuICAgIC8vICAgICBmaWVsZFRlbXBsYXRlID0gY29uZmlnLndyYXBGaWVsZFRlbXBsYXRlcyhmaWVsZFRlbXBsYXRlKTtcbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgdmFyIGZpZWxkID0gXy5leHRlbmQoe30sIGZpZWxkVGVtcGxhdGUsIHtyYXdGaWVsZFRlbXBsYXRlOiBmaWVsZFRlbXBsYXRlfSk7XG4gICAgLy8gICBpZiAoY29uZmlnLmhhc1ZhbHVlKGZpZWxkVGVtcGxhdGUsIHZhbHVlKSkge1xuICAgIC8vICAgICBmaWVsZC52YWx1ZSA9IGNvbmZpZy5jb2VyY2VWYWx1ZShmaWVsZFRlbXBsYXRlLCB2YWx1ZSk7XG4gICAgLy8gICB9IGVsc2Uge1xuICAgIC8vICAgICBmaWVsZC52YWx1ZSA9IGNvbmZpZy5jcmVhdGVEZWZhdWx0VmFsdWUoZmllbGRUZW1wbGF0ZSk7XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIGNvbmZpZy5pbml0Um9vdEZpZWxkKGZpZWxkLCBwcm9wcyk7XG4gICAgLy8gICBjb25maWcuaW5pdEZpZWxkKGZpZWxkKTtcbiAgICAvL1xuICAgIC8vICAgaWYgKHZhbHVlID09PSBudWxsIHx8IGNvbmZpZy5pc0VtcHR5T2JqZWN0KHZhbHVlKSB8fCBfLmlzVW5kZWZpbmVkKHZhbHVlKSkge1xuICAgIC8vICAgICBmaWVsZC52YWx1ZSA9IGNvbmZpZy5pbmZsYXRlRmllbGRWYWx1ZShmaWVsZCk7XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiBmaWVsZDtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gR2l2ZW4gdGhlIHByb3BzIHRoYXQgYXJlIHBhc3NlZCBpbiwgY3JlYXRlIHRoZSB2YWx1ZSB0aGF0IHdpbGwgYmUgZGlzcGxheWVkXG4gICAgLy8gLy8gYnkgYWxsIHRoZSBjb21wb25lbnRzLlxuICAgIC8vIGNyZWF0ZVJvb3RWYWx1ZTogZnVuY3Rpb24gKHByb3BzLCBmaWVsZEhhbmRsZXIpIHtcbiAgICAvL1xuICAgIC8vICAgdmFyIGZpZWxkID0gY29uZmlnLmNyZWF0ZVJvb3RGaWVsZChwcm9wcyk7XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiBjb25maWcuaW5mbGF0ZUZpZWxkVmFsdWUoZmllbGQsIGZpZWxkSGFuZGxlcik7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIHZhbGlkYXRlUm9vdFZhbHVlOiBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAvL1xuICAgIC8vICAgdmFyIGVycm9ycyA9IFtdO1xuICAgIC8vXG4gICAgLy8gICBjb25maWcuY3JlYXRlUm9vdFZhbHVlKHByb3BzLCBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAvLyAgICAgdmFyIGZpZWxkRXJyb3JzID0gY29uZmlnLmZpZWxkRXJyb3JzKGZpZWxkKTtcbiAgICAvLyAgICAgaWYgKGZpZWxkRXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAvLyAgICAgICBlcnJvcnMucHVzaCh7XG4gICAgLy8gICAgICAgICBwYXRoOiBjb25maWcuZmllbGRWYWx1ZVBhdGgoZmllbGQpLFxuICAgIC8vICAgICAgICAgZXJyb3JzOiBmaWVsZEVycm9yc1xuICAgIC8vICAgICAgIH0pO1xuICAgIC8vICAgICB9XG4gICAgLy8gICB9KTtcbiAgICAvL1xuICAgIC8vICAgcmV0dXJuIGVycm9ycztcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gaXNWYWxpZFJvb3RWYWx1ZTogZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgLy9cbiAgICAvLyAgIHZhciBpc1ZhbGlkID0gdHJ1ZTtcbiAgICAvL1xuICAgIC8vICAgY29uZmlnLmNyZWF0ZVJvb3RWYWx1ZShwcm9wcywgZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgLy8gICAgIGlmIChjb25maWcuZmllbGRFcnJvcnMoZmllbGQpLmxlbmd0aCA+IDApIHtcbiAgICAvLyAgICAgICBpc1ZhbGlkID0gZmFsc2U7XG4gICAgLy8gICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIC8vICAgICB9XG4gICAgLy8gICB9KTtcbiAgICAvL1xuICAgIC8vICAgcmV0dXJuIGlzVmFsaWQ7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIHZhbGlkYXRlRmllbGQ6IGZ1bmN0aW9uIChmaWVsZCwgZXJyb3JzKSB7XG4gICAgLy9cbiAgICAvLyAgIGlmIChmaWVsZC52YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IGZpZWxkLnZhbHVlID09PSAnJykge1xuICAgIC8vICAgICBpZiAoY29uZmlnLmZpZWxkSXNSZXF1aXJlZChmaWVsZCkpIHtcbiAgICAvLyAgICAgICBlcnJvcnMucHVzaCh7XG4gICAgLy8gICAgICAgICB0eXBlOiAncmVxdWlyZWQnXG4gICAgLy8gICAgICAgfSk7XG4gICAgLy8gICAgIH1cbiAgICAvLyAgIH1cbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gQ3JlYXRlIGR5bmFtaWMgY2hpbGQgZmllbGRzIGZvciBhIGZpZWxkLlxuICAgIC8vIGNyZWF0ZUNoaWxkRmllbGRzOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAvL1xuICAgIC8vICAgdmFyIHR5cGVOYW1lID0gY29uZmlnLmZpZWxkVHlwZU5hbWUoZmllbGQpO1xuICAgIC8vXG4gICAgLy8gICBpZiAoY29uZmlnWydjcmVhdGVDaGlsZEZpZWxkc18nICsgdHlwZU5hbWVdKSB7XG4gICAgLy8gICAgIHJldHVybiBjb25maWdbJ2NyZWF0ZUNoaWxkRmllbGRzXycgKyB0eXBlTmFtZV0oZmllbGQpO1xuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICByZXR1cm4gY29uZmlnLmZpZWxkQ2hpbGRGaWVsZFRlbXBsYXRlcyhmaWVsZCkubWFwKGZ1bmN0aW9uIChjaGlsZEZpZWxkLCBpKSB7XG4gICAgLy8gICAgIHJldHVybiBjb25maWcuY3JlYXRlQ2hpbGRGaWVsZChmaWVsZCwge1xuICAgIC8vICAgICAgIGZpZWxkVGVtcGxhdGU6IGNoaWxkRmllbGQsIGtleTogY2hpbGRGaWVsZC5rZXksIGZpZWxkSW5kZXg6IGksIHZhbHVlOiBmaWVsZC52YWx1ZVtjaGlsZEZpZWxkLmtleV1cbiAgICAvLyAgICAgfSk7XG4gICAgLy8gICB9KTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gQ3JlYXRlIGEgc2luZ2xlIGNoaWxkIGZpZWxkIGZvciBhIHBhcmVudCBmaWVsZC5cbiAgICAvLyBjcmVhdGVDaGlsZEZpZWxkOiBmdW5jdGlvbiAocGFyZW50RmllbGQsIG9wdGlvbnMpIHtcbiAgICAvL1xuICAgIC8vICAgdmFyIGNoaWxkVmFsdWUgPSBvcHRpb25zLnZhbHVlO1xuICAgIC8vXG4gICAgLy8gICB2YXIgY2hpbGRGaWVsZCA9IF8uZXh0ZW5kKHt9LCBvcHRpb25zLmZpZWxkVGVtcGxhdGUsIHtcbiAgICAvLyAgICAga2V5OiBvcHRpb25zLmtleSwgcGFyZW50OiBwYXJlbnRGaWVsZCwgZmllbGRJbmRleDogb3B0aW9ucy5maWVsZEluZGV4LFxuICAgIC8vICAgICByYXdGaWVsZFRlbXBsYXRlOiBvcHRpb25zLmZpZWxkVGVtcGxhdGVcbiAgICAvLyAgIH0pO1xuICAgIC8vXG4gICAgLy8gICBpZiAoY29uZmlnLmhhc1ZhbHVlKG9wdGlvbnMuZmllbGRUZW1wbGF0ZSwgY2hpbGRWYWx1ZSkpIHtcbiAgICAvLyAgICAgY2hpbGRGaWVsZC52YWx1ZSA9IGNvbmZpZy5jb2VyY2VWYWx1ZShvcHRpb25zLmZpZWxkVGVtcGxhdGUsIGNoaWxkVmFsdWUpO1xuICAgIC8vICAgfSBlbHNlIHtcbiAgICAvLyAgICAgY2hpbGRGaWVsZC52YWx1ZSA9IGNvbmZpZy5jcmVhdGVEZWZhdWx0VmFsdWUob3B0aW9ucy5maWVsZFRlbXBsYXRlKTtcbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgY29uZmlnLmluaXRGaWVsZChjaGlsZEZpZWxkKTtcbiAgICAvL1xuICAgIC8vICAgcmV0dXJuIGNoaWxkRmllbGQ7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIENyZWF0ZSBhIHRlbXBvcmFyeSBmaWVsZCBhbmQgZXh0cmFjdCBpdHMgdmFsdWUuXG4gICAgLy8gY3JlYXRlTmV3Q2hpbGRGaWVsZFZhbHVlOiBmdW5jdGlvbiAocGFyZW50RmllbGQsIGl0ZW1GaWVsZEluZGV4KSB7XG4gICAgLy9cbiAgICAvLyAgIHZhciBjaGlsZEZpZWxkVGVtcGxhdGUgPSBjb25maWcuZmllbGRJdGVtRmllbGRUZW1wbGF0ZXMocGFyZW50RmllbGQpW2l0ZW1GaWVsZEluZGV4XTtcbiAgICAvL1xuICAgIC8vICAgdmFyIG5ld1ZhbHVlID0gY29uZmlnLmZpZWxkVGVtcGxhdGVWYWx1ZShjaGlsZEZpZWxkVGVtcGxhdGUpO1xuICAgIC8vXG4gICAgLy8gICAvLyBKdXN0IGEgcGxhY2Vob2xkZXIga2V5LiBTaG91bGQgbm90IGJlIGltcG9ydGFudC5cbiAgICAvLyAgIHZhciBrZXkgPSAnX191bmtub3duX2tleV9fJztcbiAgICAvL1xuICAgIC8vICAgaWYgKF8uaXNBcnJheShwYXJlbnRGaWVsZC52YWx1ZSkpIHtcbiAgICAvLyAgICAgLy8gSnVzdCBhIHBsYWNlaG9sZGVyIHBvc2l0aW9uIGZvciBhbiBhcnJheS5cbiAgICAvLyAgICAga2V5ID0gcGFyZW50RmllbGQudmFsdWUubGVuZ3RoO1xuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICAvLyBKdXN0IGEgcGxhY2Vob2xkZXIgZmllbGQgaW5kZXguIFNob3VsZCBub3QgYmUgaW1wb3J0YW50LlxuICAgIC8vICAgdmFyIGZpZWxkSW5kZXggPSAwO1xuICAgIC8vICAgaWYgKF8uaXNPYmplY3QocGFyZW50RmllbGQudmFsdWUpKSB7XG4gICAgLy8gICAgIGZpZWxkSW5kZXggPSBPYmplY3Qua2V5cyhwYXJlbnRGaWVsZC52YWx1ZSkubGVuZ3RoO1xuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICB2YXIgY2hpbGRGaWVsZCA9IGNvbmZpZy5jcmVhdGVDaGlsZEZpZWxkKHBhcmVudEZpZWxkLCB7XG4gICAgLy8gICAgIGZpZWxkVGVtcGxhdGU6IGNoaWxkRmllbGRUZW1wbGF0ZSwga2V5OiBrZXksIGZpZWxkSW5kZXg6IGZpZWxkSW5kZXgsIHZhbHVlOiBuZXdWYWx1ZVxuICAgIC8vICAgfSk7XG4gICAgLy9cbiAgICAvLyAgIG5ld1ZhbHVlID0gY29uZmlnLmluZmxhdGVGaWVsZFZhbHVlKGNoaWxkRmllbGQpO1xuICAgIC8vXG4gICAgLy8gICByZXR1cm4gbmV3VmFsdWU7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIEdpdmVuIGEgdmFsdWUsIGNyZWF0ZSBhIGZpZWxkIHRlbXBsYXRlIGZvciB0aGF0IHZhbHVlLlxuICAgIC8vIGNyZWF0ZUZpZWxkVGVtcGxhdGVGcm9tVmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIC8vXG4gICAgLy8gICB2YXIgZmllbGQgPSB7XG4gICAgLy8gICAgIHR5cGU6ICdqc29uJ1xuICAgIC8vICAgfTtcbiAgICAvLyAgIGlmIChfLmlzU3RyaW5nKHZhbHVlKSkge1xuICAgIC8vICAgICBmaWVsZCA9IHtcbiAgICAvLyAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgIC8vICAgICB9O1xuICAgIC8vICAgfSBlbHNlIGlmIChfLmlzTnVtYmVyKHZhbHVlKSkge1xuICAgIC8vICAgICBmaWVsZCA9IHtcbiAgICAvLyAgICAgICB0eXBlOiAnbnVtYmVyJ1xuICAgIC8vICAgICB9O1xuICAgIC8vICAgfSBlbHNlIGlmIChfLmlzQm9vbGVhbih2YWx1ZSkpIHtcbiAgICAvLyAgICAgZmllbGQgPSB7XG4gICAgLy8gICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgLy8gICAgIH07XG4gICAgLy8gICB9IGVsc2UgaWYgKF8uaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAvLyAgICAgdmFyIGFycmF5SXRlbUZpZWxkcyA9IHZhbHVlLm1hcChmdW5jdGlvbiAoY2hpbGRWYWx1ZSwgaSkge1xuICAgIC8vICAgICAgIHZhciBjaGlsZEZpZWxkID0gY29uZmlnLmNyZWF0ZUZpZWxkVGVtcGxhdGVGcm9tVmFsdWUoY2hpbGRWYWx1ZSk7XG4gICAgLy8gICAgICAgY2hpbGRGaWVsZC5rZXkgPSBpO1xuICAgIC8vICAgICAgIHJldHVybiBjaGlsZEZpZWxkO1xuICAgIC8vICAgICB9KTtcbiAgICAvLyAgICAgZmllbGQgPSB7XG4gICAgLy8gICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAvLyAgICAgICBmaWVsZHM6IGFycmF5SXRlbUZpZWxkc1xuICAgIC8vICAgICB9O1xuICAgIC8vICAgfSBlbHNlIGlmIChfLmlzT2JqZWN0KHZhbHVlKSkge1xuICAgIC8vICAgICB2YXIgb2JqZWN0SXRlbUZpZWxkcyA9IE9iamVjdC5rZXlzKHZhbHVlKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgIC8vICAgICAgIHZhciBjaGlsZEZpZWxkID0gY29uZmlnLmNyZWF0ZUZpZWxkVGVtcGxhdGVGcm9tVmFsdWUodmFsdWVba2V5XSk7XG4gICAgLy8gICAgICAgY2hpbGRGaWVsZC5rZXkgPSBrZXk7XG4gICAgLy8gICAgICAgY2hpbGRGaWVsZC5sYWJlbCA9IGNvbmZpZy5odW1hbml6ZShrZXkpO1xuICAgIC8vICAgICAgIHJldHVybiBjaGlsZEZpZWxkO1xuICAgIC8vICAgICB9KTtcbiAgICAvLyAgICAgZmllbGQgPSB7XG4gICAgLy8gICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgLy8gICAgICAgZmllbGRzOiBvYmplY3RJdGVtRmllbGRzXG4gICAgLy8gICAgIH07XG4gICAgLy8gICB9IGVsc2UgaWYgKF8uaXNOdWxsKHZhbHVlKSkge1xuICAgIC8vICAgICBmaWVsZCA9IHtcbiAgICAvLyAgICAgICB0eXBlOiAnanNvbidcbiAgICAvLyAgICAgfTtcbiAgICAvLyAgIH1cbiAgICAvLyAgIHJldHVybiBmaWVsZDtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gRGVmYXVsdCB2YWx1ZSBmYWN0b3J5XG4gICAgLy9cbiAgICAvLyBjcmVhdGVEZWZhdWx0VmFsdWU6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgLy9cbiAgICAvLyAgIHZhciBkZWZhdWx0VmFsdWUgPSBjb25maWcuZmllbGRUZW1wbGF0ZURlZmF1bHRWYWx1ZShmaWVsZFRlbXBsYXRlKTtcbiAgICAvL1xuICAgIC8vICAgaWYgKCFfLmlzVW5kZWZpbmVkKGRlZmF1bHRWYWx1ZSkpIHtcbiAgICAvLyAgICAgcmV0dXJuIHV0aWxzLmRlZXBDb3B5KGRlZmF1bHRWYWx1ZSk7XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIHZhciB0eXBlTmFtZSA9IGNvbmZpZy5maWVsZFR5cGVOYW1lKGZpZWxkVGVtcGxhdGUpO1xuICAgIC8vXG4gICAgLy8gICBpZiAoY29uZmlnWydjcmVhdGVEZWZhdWx0VmFsdWVfJyArIHR5cGVOYW1lXSkge1xuICAgIC8vICAgICByZXR1cm4gY29uZmlnWydjcmVhdGVEZWZhdWx0VmFsdWVfJyArIHR5cGVOYW1lXShmaWVsZFRlbXBsYXRlKTtcbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgcmV0dXJuICcnO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBGaWVsZCBoZWxwZXJzXG4gICAgLy9cbiAgICAvLyAvLyBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBcImV4aXN0c1wiLlxuICAgIC8vIGhhc1ZhbHVlOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSwgdmFsdWUpIHtcbiAgICAvLyAgIHJldHVybiB2YWx1ZSAhPT0gbnVsbCAmJiAhXy5pc1VuZGVmaW5lZCh2YWx1ZSk7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIENvZXJjZSBhIHZhbHVlIHRvIHZhbHVlIGFwcHJvcHJpYXRlIGZvciBhIGZpZWxkLlxuICAgIC8vIGNvZXJjZVZhbHVlOiBmdW5jdGlvbiAoZmllbGQsIHZhbHVlKSB7XG4gICAgLy9cbiAgICAvLyAgIHZhciB0eXBlTmFtZSA9IGNvbmZpZy5maWVsZFR5cGVOYW1lKGZpZWxkKTtcbiAgICAvL1xuICAgIC8vICAgaWYgKGNvbmZpZ1snY29lcmNlVmFsdWVfJyArIHR5cGVOYW1lXSkge1xuICAgIC8vICAgICByZXR1cm4gY29uZmlnWydjb2VyY2VWYWx1ZV8nICsgdHlwZU5hbWVdKGZpZWxkLCB2YWx1ZSk7XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiB2YWx1ZTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gR2l2ZW4gYSBmaWVsZCBhbmQgYSBjaGlsZCB2YWx1ZSwgZmluZCB0aGUgYXBwcm9wcmlhdGUgZmllbGQgdGVtcGxhdGUgZm9yXG4gICAgLy8gLy8gdGhhdCBjaGlsZCB2YWx1ZS5cbiAgICAvLyBjaGlsZEZpZWxkVGVtcGxhdGVGb3JWYWx1ZTogZnVuY3Rpb24gKGZpZWxkLCBjaGlsZFZhbHVlKSB7XG4gICAgLy9cbiAgICAvLyAgIHZhciBmaWVsZFRlbXBsYXRlO1xuICAgIC8vXG4gICAgLy8gICB2YXIgZmllbGRUZW1wbGF0ZXMgPSBjb25maWcuZmllbGRJdGVtRmllbGRUZW1wbGF0ZXMoZmllbGQpO1xuICAgIC8vXG4gICAgLy8gICBmaWVsZFRlbXBsYXRlID0gXy5maW5kKGZpZWxkVGVtcGxhdGVzLCBmdW5jdGlvbiAoaXRlbUZpZWxkVGVtcGxhdGUpIHtcbiAgICAvLyAgICAgcmV0dXJuIGNvbmZpZy5tYXRjaGVzRmllbGRUZW1wbGF0ZVRvVmFsdWUoaXRlbUZpZWxkVGVtcGxhdGUsIGNoaWxkVmFsdWUpO1xuICAgIC8vICAgfSk7XG4gICAgLy9cbiAgICAvLyAgIGlmIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgLy8gICAgIHJldHVybiBmaWVsZFRlbXBsYXRlO1xuICAgIC8vICAgfSBlbHNlIHtcbiAgICAvLyAgICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVGaWVsZFRlbXBsYXRlRnJvbVZhbHVlKGNoaWxkVmFsdWUpO1xuICAgIC8vICAgfVxuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIG1hdGNoIGZvciBhIGZpZWxkIHRlbXBsYXRlLlxuICAgIC8vIG1hdGNoZXNGaWVsZFRlbXBsYXRlVG9WYWx1ZTogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUsIHZhbHVlKSB7XG4gICAgLy8gICB2YXIgbWF0Y2ggPSBmaWVsZFRlbXBsYXRlLm1hdGNoO1xuICAgIC8vICAgaWYgKCFtYXRjaCkge1xuICAgIC8vICAgICByZXR1cm4gdHJ1ZTtcbiAgICAvLyAgIH1cbiAgICAvLyAgIHJldHVybiBfLmV2ZXJ5KE9iamVjdC5rZXlzKG1hdGNoKSwgZnVuY3Rpb24gKGtleSkge1xuICAgIC8vICAgICByZXR1cm4gXy5pc0VxdWFsKG1hdGNoW2tleV0sIHZhbHVlW2tleV0pO1xuICAgIC8vICAgfSk7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIEZpZWxkIHRlbXBsYXRlIGhlbHBlcnNcbiAgICAvL1xuICAgIC8vIC8vIE5vcm1hbGl6ZWQgKFBhc2NhbENhc2UpIHR5cGUgbmFtZSBmb3IgYSBmaWVsZC5cbiAgICAvLyBmaWVsZFRlbXBsYXRlVHlwZU5hbWU6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgLy9cbiAgICAvLyAgIHZhciB0eXBlTmFtZSA9IHV0aWxzLmRhc2hUb1Bhc2NhbChmaWVsZFRlbXBsYXRlLnR5cGUgfHwgJ3VuZGVmaW5lZCcpO1xuICAgIC8vXG4gICAgLy8gICB2YXIgYWxpYXMgPSBjb25maWdbJ2FsaWFzXycgKyB0eXBlTmFtZV07XG4gICAgLy9cbiAgICAvLyAgIGlmIChhbGlhcykge1xuICAgIC8vICAgICBpZiAoXy5pc0Z1bmN0aW9uKGFsaWFzKSkge1xuICAgIC8vICAgICAgIHJldHVybiBhbGlhcy5jYWxsKGNvbmZpZywgZmllbGRUZW1wbGF0ZSk7XG4gICAgLy8gICAgIH0gZWxzZSB7XG4gICAgLy8gICAgICAgcmV0dXJuIGFsaWFzO1xuICAgIC8vICAgICB9XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIGlmIChmaWVsZFRlbXBsYXRlLmxpc3QpIHtcbiAgICAvLyAgICAgdHlwZU5hbWUgPSAnQXJyYXknO1xuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICByZXR1cm4gdHlwZU5hbWU7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIERlZmF1bHQgdmFsdWUgZm9yIGEgZmllbGQgdGVtcGxhdGUuXG4gICAgLy8gZmllbGRUZW1wbGF0ZURlZmF1bHRWYWx1ZTogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcbiAgICAvL1xuICAgIC8vICAgcmV0dXJuIGZpZWxkVGVtcGxhdGUuZGVmYXVsdDtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gVmFsdWUgZm9yIGEgZmllbGQgdGVtcGxhdGUuIFVzZWQgdG8gZGV0ZXJtaW5lIHRoZSB2YWx1ZSBvZiBhIG5ldyBjaGlsZFxuICAgIC8vIC8vIGZpZWxkLlxuICAgIC8vIGZpZWxkVGVtcGxhdGVWYWx1ZTogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcbiAgICAvL1xuICAgIC8vICAgLy8gVGhpcyBsb2dpYyBtaWdodCBiZSBicml0dGxlLlxuICAgIC8vXG4gICAgLy8gICB2YXIgZGVmYXVsdFZhbHVlID0gY29uZmlnLmZpZWxkVGVtcGxhdGVEZWZhdWx0VmFsdWUoZmllbGRUZW1wbGF0ZSk7XG4gICAgLy9cbiAgICAvLyAgIHZhciBtYXRjaCA9IGNvbmZpZy5maWVsZFRlbXBsYXRlTWF0Y2goZmllbGRUZW1wbGF0ZSk7XG4gICAgLy9cbiAgICAvLyAgIHZhciB2YWx1ZTtcbiAgICAvL1xuICAgIC8vICAgaWYgKF8uaXNVbmRlZmluZWQoZGVmYXVsdFZhbHVlKSAmJiAhXy5pc1VuZGVmaW5lZChtYXRjaCkpIHtcbiAgICAvLyAgICAgcmV0dXJuIHV0aWxzLmRlZXBDb3B5KG1hdGNoKTtcbiAgICAvLyAgIH0gZWxzZSB7XG4gICAgLy8gICAgIHJldHVybiBjb25maWcuY3JlYXRlRGVmYXVsdFZhbHVlKGZpZWxkVGVtcGxhdGUpO1xuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICByZXR1cm4gdmFsdWU7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIE1hdGNoIHJ1bGUgZm9yIGEgZmllbGQgdGVtcGxhdGUuXG4gICAgLy8gZmllbGRUZW1wbGF0ZU1hdGNoOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSkge1xuICAgIC8vICAgcmV0dXJuIGZpZWxkVGVtcGxhdGUubWF0Y2g7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIERldGVybWluZSBpZiBhIGZpZWxkIHRlbXBsYXRlIGhhcyBhIHNpbmdsZS1saW5lIHZhbHVlLlxuICAgIC8vIGZpZWxkVGVtcGxhdGVJc1NpbmdsZUxpbmU6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgLy8gICByZXR1cm4gZmllbGRUZW1wbGF0ZS5pc1NpbmdsZUxpbmUgfHwgZmllbGRUZW1wbGF0ZS5pc19zaW5nbGVfbGluZSB8fFxuICAgIC8vICAgICAgICAgICBmaWVsZFRlbXBsYXRlLnR5cGUgPT09ICdzaW5nbGUtbGluZS1zdHJpbmcnIHx8IGZpZWxkVGVtcGxhdGUudHlwZSA9PT0gJ1NpbmdsZUxpbmVTdHJpbmcnO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBGaWVsZCBoZWxwZXJzXG4gICAgLy9cbiAgICAvLyAvLyBHZXQgYW4gYXJyYXkgb2Yga2V5cyByZXByZXNlbnRpbmcgdGhlIHBhdGggdG8gYSB2YWx1ZS5cbiAgICAvLyBmaWVsZFZhbHVlUGF0aDogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgLy9cbiAgICAvLyAgIHZhciBwYXJlbnRQYXRoID0gW107XG4gICAgLy9cbiAgICAvLyAgIGlmIChmaWVsZC5wYXJlbnQpIHtcbiAgICAvLyAgICAgcGFyZW50UGF0aCA9IGNvbmZpZy5maWVsZFZhbHVlUGF0aChmaWVsZC5wYXJlbnQpO1xuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICByZXR1cm4gcGFyZW50UGF0aC5jb25jYXQoZmllbGQua2V5KS5maWx0ZXIoZnVuY3Rpb24gKGtleSkge1xuICAgIC8vICAgICByZXR1cm4gIV8uaXNVbmRlZmluZWQoa2V5KSAmJiBrZXkgIT09ICcnO1xuICAgIC8vICAgfSk7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIENsb25lIGEgZmllbGQgd2l0aCBhIGRpZmZlcmVudCB2YWx1ZS5cbiAgICAvLyBmaWVsZFdpdGhWYWx1ZTogZnVuY3Rpb24gKGZpZWxkLCB2YWx1ZSkge1xuICAgIC8vICAgcmV0dXJuIF8uZXh0ZW5kKHt9LCBmaWVsZCwge3ZhbHVlOiB2YWx1ZX0pO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyBmaWVsZFR5cGVOYW1lOiBkZWxlZ2F0ZVRvKCdmaWVsZFRlbXBsYXRlVHlwZU5hbWUnKSxcbiAgICAvL1xuICAgIC8vIC8vIEdldCB0aGUgY2hvaWNlcyBmb3IgYSBkcm9wZG93biBmaWVsZC5cbiAgICAvLyBmaWVsZENob2ljZXM6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIC8vXG4gICAgLy8gICByZXR1cm4gY29uZmlnLm5vcm1hbGl6ZUNob2ljZXMoZmllbGQuY2hvaWNlcyk7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIEdldCB0aGUgY2hvaWNlcyBmb3IgYSBwcmV0dHkgZHJvcGRvd24gZmllbGQuXG4gICAgLy8gZmllbGRQcmV0dHlDaG9pY2VzOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAvL1xuICAgIC8vICAgcmV0dXJuIGNvbmZpZy5ub3JtYWxpemVQcmV0dHlDaG9pY2VzKGZpZWxkLmNob2ljZXMpO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBHZXQgYSBzZXQgb2YgYm9vbGVhbiBjaG9pY2VzIGZvciBhIGZpZWxkLlxuICAgIC8vIGZpZWxkQm9vbGVhbkNob2ljZXM6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIC8vXG4gICAgLy8gICB2YXIgY2hvaWNlcyA9IGNvbmZpZy5maWVsZENob2ljZXMoZmllbGQpO1xuICAgIC8vXG4gICAgLy8gICBpZiAoY2hvaWNlcy5sZW5ndGggPT09IDApIHtcbiAgICAvLyAgICAgcmV0dXJuIFt7XG4gICAgLy8gICAgICAgbGFiZWw6ICd5ZXMnLFxuICAgIC8vICAgICAgIHZhbHVlOiB0cnVlXG4gICAgLy8gICAgIH0sIHtcbiAgICAvLyAgICAgICBsYWJlbDogJ25vJyxcbiAgICAvLyAgICAgICB2YWx1ZTogZmFsc2VcbiAgICAvLyAgICAgfV07XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiBjaG9pY2VzLm1hcChmdW5jdGlvbiAoY2hvaWNlKSB7XG4gICAgLy8gICAgIGlmIChfLmlzQm9vbGVhbihjaG9pY2UudmFsdWUpKSB7XG4gICAgLy8gICAgICAgcmV0dXJuIGNob2ljZTtcbiAgICAvLyAgICAgfVxuICAgIC8vICAgICByZXR1cm4gXy5leHRlbmQoe30sIGNob2ljZSwge1xuICAgIC8vICAgICAgIHZhbHVlOiBjb25maWcuY29lcmNlVmFsdWVUb0Jvb2xlYW4oY2hvaWNlLnZhbHVlKVxuICAgIC8vICAgICB9KTtcbiAgICAvLyAgIH0pO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBHZXQgYSBzZXQgb2YgcmVwbGFjZW1lbnQgY2hvaWNlcyBmb3IgYSBmaWVsZC5cbiAgICAvLyBmaWVsZFJlcGxhY2VDaG9pY2VzOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAvL1xuICAgIC8vICAgcmV0dXJuIGNvbmZpZy5ub3JtYWxpemVDaG9pY2VzKGZpZWxkLnJlcGxhY2VDaG9pY2VzKTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gR2V0IGEgbGFiZWwgZm9yIGEgZmllbGQuXG4gICAgLy8gZmllbGRMYWJlbDogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgLy8gICByZXR1cm4gZmllbGQubGFiZWw7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIEdldCBhIHBsYWNlaG9sZGVyIChqdXN0IGEgZGVmYXVsdCBkaXNwbGF5IHZhbHVlLCBub3QgYSBkZWZhdWx0IHZhbHVlKSBmb3IgYSBmaWVsZC5cbiAgICAvLyBmaWVsZFBsYWNlaG9sZGVyOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAvLyAgIHJldHVybiBmaWVsZC5wbGFjZWhvbGRlcjtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gR2V0IHRoZSBoZWxwIHRleHQgZm9yIGEgZmllbGQuXG4gICAgLy8gZmllbGRIZWxwVGV4dDogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgLy8gICByZXR1cm4gZmllbGQuaGVscF90ZXh0X2h0bWwgfHwgZmllbGQuaGVscF90ZXh0IHx8IGZpZWxkLmhlbHBUZXh0IHx8IGZpZWxkLmhlbHBUZXh0SHRtbDtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gR2V0IHdoZXRoZXIgb3Igbm90IGEgZmllbGQgaXMgcmVxdWlyZWQuXG4gICAgLy8gZmllbGRJc1JlcXVpcmVkOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAvLyAgIHJldHVybiBmaWVsZC5yZXF1aXJlZCA/IHRydWUgOiBmYWxzZTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gRGV0ZXJtaW5lIGlmIHZhbHVlIGZvciB0aGlzIGZpZWxkIGlzIG5vdCBhIGxlYWYgdmFsdWUuXG4gICAgLy8gZmllbGRIYXNWYWx1ZUNoaWxkcmVuOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAvL1xuICAgIC8vICAgdmFyIGRlZmF1bHRWYWx1ZSA9IGNvbmZpZy5jcmVhdGVEZWZhdWx0VmFsdWUoZmllbGQpO1xuICAgIC8vXG4gICAgLy8gICBpZiAoXy5pc09iamVjdChkZWZhdWx0VmFsdWUpIHx8IF8uaXNBcnJheShkZWZhdWx0VmFsdWUpKSB7XG4gICAgLy8gICAgIHJldHVybiB0cnVlO1xuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICByZXR1cm4gZmFsc2U7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIEdldCB0aGUgY2hpbGQgZmllbGQgdGVtcGxhdGVzIGZvciB0aGlzIGZpZWxkLlxuICAgIC8vIGZpZWxkQ2hpbGRGaWVsZFRlbXBsYXRlczogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgLy8gICByZXR1cm4gZmllbGQuZmllbGRzIHx8IFtdO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBHZXQgdGhlIGZpZWxkIHRlbXBsYXRlcyBmb3IgZWFjaCBpdGVtIG9mIHRoaXMgZmllbGQuIChGb3IgZHluYW1pYyBjaGlsZHJlbixcbiAgICAvLyAvLyBsaWtlIGFycmF5cy4pXG4gICAgLy8gZmllbGRJdGVtRmllbGRUZW1wbGF0ZXM6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIC8vICAgaWYgKCFmaWVsZC5pdGVtRmllbGRzKSB7XG4gICAgLy8gICAgIHJldHVybiBbe3R5cGU6ICd0ZXh0J31dO1xuICAgIC8vICAgfVxuICAgIC8vICAgaWYgKCFfLmlzQXJyYXkoZmllbGQuaXRlbUZpZWxkcykpIHtcbiAgICAvLyAgICAgcmV0dXJuIFtmaWVsZC5pdGVtRmllbGRzXTtcbiAgICAvLyAgIH1cbiAgICAvLyAgIHJldHVybiBmaWVsZC5pdGVtRmllbGRzO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyBmaWVsZElzU2luZ2xlTGluZTogZGVsZWdhdGVUbygnZmllbGRUZW1wbGF0ZUlzU2luZ2xlTGluZScpLFxuICAgIC8vXG4gICAgLy8gLy8gR2V0IHdoZXRoZXIgb3Igbm90IGEgZmllbGQgaXMgY29sbGFwc2VkLlxuICAgIC8vIGZpZWxkSXNDb2xsYXBzZWQ6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIC8vICAgcmV0dXJuIGZpZWxkLmNvbGxhcHNlZCA/IHRydWUgOiBmYWxzZTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gR2V0IHdoZXRlciBvciBub3QgYSBmaWVsZCBjYW4gYmUgY29sbGFwc2VkLlxuICAgIC8vIGZpZWxkSXNDb2xsYXBzaWJsZTogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgLy8gICByZXR1cm4gZmllbGQuY29sbGFwc2libGUgfHwgIV8uaXNVbmRlZmluZWQoZmllbGQuY29sbGFwc2VkKTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gR2V0IHRoZSBudW1iZXIgb2Ygcm93cyBmb3IgYSBmaWVsZC5cbiAgICAvLyBmaWVsZFJvd3M6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIC8vICAgcmV0dXJuIGZpZWxkLnJvd3M7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIGZpZWxkRXJyb3JzOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAvL1xuICAgIC8vICAgdmFyIGVycm9ycyA9IFtdO1xuICAgIC8vXG4gICAgLy8gICBpZiAoY29uZmlnLmlzS2V5KGZpZWxkLmtleSkpIHtcbiAgICAvLyAgICAgY29uZmlnLnZhbGlkYXRlRmllbGQoZmllbGQsIGVycm9ycyk7XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiBlcnJvcnM7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIGZpZWxkTWF0Y2g6IGRlbGVnYXRlVG8oJ2ZpZWxkVGVtcGxhdGVNYXRjaCcpLFxuICAgIC8vXG4gICAgLy8gLy8gT3RoZXIgaGVscGVyc1xuICAgIC8vXG4gICAgLy8gLy8gQ29udmVydCBhIGtleSB0byBhIG5pY2UgaHVtYW4tcmVhZGFibGUgdmVyc2lvbi5cbiAgICAvLyBodW1hbml6ZTogZnVuY3Rpb24ocHJvcGVydHkpIHtcbiAgICAvLyAgIHByb3BlcnR5ID0gcHJvcGVydHkucmVwbGFjZSgvXFx7XFx7L2csICcnKTtcbiAgICAvLyAgIHByb3BlcnR5ID0gcHJvcGVydHkucmVwbGFjZSgvXFx9XFx9L2csICcnKTtcbiAgICAvLyAgIHJldHVybiBwcm9wZXJ0eS5yZXBsYWNlKC9fL2csICcgJylcbiAgICAvLyAgIC5yZXBsYWNlKC8oXFx3KykvZywgZnVuY3Rpb24obWF0Y2gpIHtcbiAgICAvLyAgICAgcmV0dXJuIG1hdGNoLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgbWF0Y2guc2xpY2UoMSk7XG4gICAgLy8gICB9KTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gTm9ybWFsaXplIHNvbWUgY2hvaWNlcyBmb3IgYSBkcm9wLWRvd24uXG4gICAgLy8gbm9ybWFsaXplQ2hvaWNlczogZnVuY3Rpb24gKGNob2ljZXMpIHtcbiAgICAvL1xuICAgIC8vICAgaWYgKCFjaG9pY2VzKSB7XG4gICAgLy8gICAgIHJldHVybiBbXTtcbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgLy8gQ29udmVydCBjb21tYSBzZXBhcmF0ZWQgc3RyaW5nIHRvIGFycmF5IG9mIHN0cmluZ3MuXG4gICAgLy8gICBpZiAoXy5pc1N0cmluZyhjaG9pY2VzKSkge1xuICAgIC8vICAgICBjaG9pY2VzID0gY2hvaWNlcy5zcGxpdCgnLCcpO1xuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICAvLyBDb252ZXJ0IG9iamVjdCB0byBhcnJheSBvZiBvYmplY3RzIHdpdGggYHZhbHVlYCBhbmQgYGxhYmVsYCBwcm9wZXJ0aWVzLlxuICAgIC8vICAgaWYgKCFfLmlzQXJyYXkoY2hvaWNlcykgJiYgXy5pc09iamVjdChjaG9pY2VzKSkge1xuICAgIC8vICAgICBjaG9pY2VzID0gT2JqZWN0LmtleXMoY2hvaWNlcykubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAvLyAgICAgICByZXR1cm4ge1xuICAgIC8vICAgICAgICAgdmFsdWU6IGtleSxcbiAgICAvLyAgICAgICAgIGxhYmVsOiBjaG9pY2VzW2tleV1cbiAgICAvLyAgICAgICB9O1xuICAgIC8vICAgICB9KTtcbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgLy8gQ29weSB0aGUgYXJyYXkgb2YgY2hvaWNlcyBzbyB3ZSBjYW4gbWFuaXB1bGF0ZSB0aGVtLlxuICAgIC8vICAgY2hvaWNlcyA9IGNob2ljZXMuc2xpY2UoMCk7XG4gICAgLy9cbiAgICAvLyAgIC8vIEFycmF5IG9mIGNob2ljZSBhcnJheXMgc2hvdWxkIGJlIGZsYXR0ZW5lZC5cbiAgICAvLyAgIGNob2ljZXMgPSBfLmZsYXR0ZW4oY2hvaWNlcyk7XG4gICAgLy9cbiAgICAvLyAgIGNob2ljZXMuZm9yRWFjaChmdW5jdGlvbiAoY2hvaWNlLCBpKSB7XG4gICAgLy8gICAgIC8vIENvbnZlcnQgYW55IHN0cmluZyBjaG9pY2VzIHRvIG9iamVjdHMgd2l0aCBgdmFsdWVgIGFuZCBgbGFiZWxgXG4gICAgLy8gICAgIC8vIHByb3BlcnRpZXMuXG4gICAgLy8gICAgIGlmIChfLmlzU3RyaW5nKGNob2ljZSkpIHtcbiAgICAvLyAgICAgICBjaG9pY2VzW2ldID0ge1xuICAgIC8vICAgICAgICAgdmFsdWU6IGNob2ljZSxcbiAgICAvLyAgICAgICAgIGxhYmVsOiBjb25maWcuaHVtYW5pemUoY2hvaWNlKVxuICAgIC8vICAgICAgIH07XG4gICAgLy8gICAgIH1cbiAgICAvLyAgICAgaWYgKCFjaG9pY2VzW2ldLmxhYmVsKSB7XG4gICAgLy8gICAgICAgY2hvaWNlc1tpXS5sYWJlbCA9IGNvbmZpZy5odW1hbml6ZShjaG9pY2VzW2ldLnZhbHVlKTtcbiAgICAvLyAgICAgfVxuICAgIC8vICAgfSk7XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiBjaG9pY2VzO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBOb3JtYWxpemUgY2hvaWNlcyBmb3IgYSBwcmV0dHkgZHJvcCBkb3duLCB3aXRoICdzYW1wbGUnIHZhbHVlc1xuICAgIC8vIG5vcm1hbGl6ZVByZXR0eUNob2ljZXM6IGZ1bmN0aW9uIChjaG9pY2VzKSB7XG4gICAgLy8gICBpZiAoIV8uaXNBcnJheShjaG9pY2VzKSAmJiBfLmlzT2JqZWN0KGNob2ljZXMpKSB7XG4gICAgLy8gICAgIGNob2ljZXMgPSBPYmplY3Qua2V5cyhjaG9pY2VzKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgIC8vICAgICAgIHJldHVybiB7XG4gICAgLy8gICAgICAgICB2YWx1ZToga2V5LFxuICAgIC8vICAgICAgICAgbGFiZWw6IGNob2ljZXNba2V5XSxcbiAgICAvLyAgICAgICAgIHNhbXBsZToga2V5XG4gICAgLy8gICAgICAgfTtcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiBjb25maWcubm9ybWFsaXplQ2hvaWNlcyhjaG9pY2VzKTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gQ29lcmNlIGEgdmFsdWUgdG8gYSBib29sZWFuXG4gICAgLy8gY29lcmNlVmFsdWVUb0Jvb2xlYW46IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIC8vICAgaWYgKCFfLmlzU3RyaW5nKHZhbHVlKSkge1xuICAgIC8vICAgICAvLyBKdXN0IHVzZSB0aGUgZGVmYXVsdCB0cnV0aGluZXNzLlxuICAgIC8vICAgICByZXR1cm4gdmFsdWUgPyB0cnVlIDogZmFsc2U7XG4gICAgLy8gICB9XG4gICAgLy8gICB2YWx1ZSA9IHZhbHVlLnRvTG93ZXJDYXNlKCk7XG4gICAgLy8gICBpZiAodmFsdWUgPT09ICcnIHx8IHZhbHVlID09PSAnbm8nIHx8IHZhbHVlID09PSAnb2ZmJyB8fCB2YWx1ZSA9PT0gJ2ZhbHNlJykge1xuICAgIC8vICAgICByZXR1cm4gZmFsc2U7XG4gICAgLy8gICB9XG4gICAgLy8gICByZXR1cm4gdHJ1ZTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSB2YWxpZCBrZXkuXG4gICAgLy8gaXNLZXk6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAvLyAgIHJldHVybiAoXy5pc051bWJlcihrZXkpICYmIGtleSA+PSAwKSB8fCAoXy5pc1N0cmluZyhrZXkpICYmIGtleSAhPT0gJycpO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBGYXN0IHdheSB0byBjaGVjayBmb3IgZW1wdHkgb2JqZWN0LlxuICAgIC8vIGlzRW1wdHlPYmplY3Q6IGZ1bmN0aW9uIChvYmopIHtcbiAgICAvLyAgIGZvcih2YXIga2V5IGluIG9iaikge1xuICAgIC8vICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAvLyAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgLy8gICAgIH1cbiAgICAvLyAgIH1cbiAgICAvLyAgIHJldHVybiB0cnVlO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyBhY3Rpb25DaG9pY2VMYWJlbDogZnVuY3Rpb24gKGFjdGlvbikge1xuICAgIC8vICAgcmV0dXJuIHV0aWxzLmNhcGl0YWxpemUoYWN0aW9uKS5yZXBsYWNlKC9bLV0vZywgJyAnKTtcbiAgICAvLyB9XG4vLyAgIH07XG4vLyB9O1xuIiwidmFyIF8gPSByZXF1aXJlKCcuL3VuZGFzaCcpO1xuXG5jb25zdCBjcmVhdGVDb25maWcgPSBmdW5jdGlvbiAoLi4ucGx1Z2lucykge1xuICByZXR1cm4gcGx1Z2lucy5yZWR1Y2UoZnVuY3Rpb24gKGNvbmZpZywgcGx1Z2luKSB7XG4gICAgaWYgKF8uaXNGdW5jdGlvbihwbHVnaW4pKSB7XG4gICAgICB2YXIgZXh0ZW5zaW9ucyA9IHBsdWdpbihjb25maWcpO1xuICAgICAgaWYgKGV4dGVuc2lvbnMpIHtcbiAgICAgICAgXy5leHRlbmQoY29uZmlnLCBleHRlbnNpb25zKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgXy5leHRlbmQoY29uZmlnLCBwbHVnaW4pO1xuICAgIH1cblxuICAgIHJldHVybiBjb25maWc7XG4gIH0sIHt9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlQ29uZmlnO1xuIiwiY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuY29uc3QgXyA9IHJlcXVpcmUoJy4vdW5kYXNoJyk7XG5jb25zdCBDb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZycpO1xuY29uc3QgQ29tcG9uZW50cyA9IHJlcXVpcmUoJy4vY29tcG9uZW50cycpO1xuY29uc3QgY3JlYXRlQ29uZmlnID0gcmVxdWlyZSgnLi9jcmVhdGUtY29uZmlnJyk7XG5jb25zdCBkZWZhdWx0Q29uZmlnUGx1Z2luID0gcmVxdWlyZSgnLi9wbHVnaW5zL2RlZmF1bHQtY29uZmlnJyk7XG5Db25maWcuc2V0RGVmYXVsdENvbmZpZyhjcmVhdGVDb25maWcoZGVmYXVsdENvbmZpZ1BsdWdpbikpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBzdGF0aWNzOiBfLmV4dGVuZCh7XG4gICAgY3JlYXRlQ29uZmlnOiBjcmVhdGVDb25maWcuYmluZChudWxsLCBkZWZhdWx0Q29uZmlnUGx1Z2luKVxuICB9LFxuICAgIENvbXBvbmVudHNcbiAgKSxcblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgY29uZmlnID0gQ29uZmlnLmZvckNvbXBuZW50KHRoaXMpO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5yZW5kZXJGb3JtYXRpY0NvbXBvbmVudCh0aGlzKTtcbiAgfVxuXG59KTtcblxuXG4vLyAvLyAjIGZvcm1hdGljXG4vL1xuLy8gLypcbi8vIFRoZSByb290IGZvcm1hdGljIGNvbXBvbmVudC5cbi8vXG4vLyBUaGUgcm9vdCBmb3JtYXRpYyBjb21wb25lbnQgaXMgYWN0dWFsbHkgdHdvIGNvbXBvbmVudHMuIFRoZSBtYWluIGNvbXBvbmVudCBpc1xuLy8gYSBjb250cm9sbGVkIGNvbXBvbmVudCB3aGVyZSB5b3UgbXVzdCBwYXNzIHRoZSB2YWx1ZSBpbiB3aXRoIGVhY2ggcmVuZGVyLiBUaGlzXG4vLyBpcyBhY3R1YWxseSB3cmFwcGVkIGluIGFub3RoZXIgY29tcG9uZW50IHdoaWNoIGFsbG93cyB5b3UgdG8gdXNlIGZvcm1hdGljIGFzXG4vLyBhbiB1bmNvbnRyb2xsZWQgY29tcG9uZW50IHdoZXJlIGl0IHJldGFpbnMgdGhlIHN0YXRlIG9mIHRoZSB2YWx1ZS4gVGhlIHdyYXBwZXJcbi8vIGlzIHdoYXQgaXMgYWN0dWFsbHkgZXhwb3J0ZWQuXG4vLyAqL1xuLy9cbi8vICd1c2Ugc3RyaWN0Jztcbi8vXG4vLyB2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbi8vIHZhciBfID0gcmVxdWlyZSgnLi91bmRhc2gnKTtcbi8vXG4vLyB2YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG4vL1xuLy8gdmFyIGRlZmF1bHRDb25maWdQbHVnaW4gPSByZXF1aXJlKCcuL2RlZmF1bHQtY29uZmlnJyk7XG4vL1xuLy8gdmFyIGNyZWF0ZUNvbmZpZyA9IGZ1bmN0aW9uICguLi5hcmdzKSB7XG4vLyAgIHZhciBwbHVnaW5zID0gW2RlZmF1bHRDb25maWdQbHVnaW5dLmNvbmNhdChhcmdzKTtcbi8vXG4vLyAgIHJldHVybiBwbHVnaW5zLnJlZHVjZShmdW5jdGlvbiAoY29uZmlnLCBwbHVnaW4pIHtcbi8vICAgICBpZiAoXy5pc0Z1bmN0aW9uKHBsdWdpbikpIHtcbi8vICAgICAgIHZhciBleHRlbnNpb25zID0gcGx1Z2luKGNvbmZpZyk7XG4vLyAgICAgICBpZiAoZXh0ZW5zaW9ucykge1xuLy8gICAgICAgICBfLmV4dGVuZChjb25maWcsIGV4dGVuc2lvbnMpO1xuLy8gICAgICAgfVxuLy8gICAgIH0gZWxzZSB7XG4vLyAgICAgICBfLmV4dGVuZChjb25maWcsIHBsdWdpbik7XG4vLyAgICAgfVxuLy9cbi8vICAgICByZXR1cm4gY29uZmlnO1xuLy8gICB9LCB7fSk7XG4vLyB9O1xuLy9cbi8vIHZhciBkZWZhdWx0Q29uZmlnID0gY3JlYXRlQ29uZmlnKCk7XG4vL1xuLy8gLy8gVGhlIG1haW4gZm9ybWF0aWMgY29tcG9uZW50IHRoYXQgcmVuZGVycyB0aGUgZm9ybS5cbi8vIHZhciBGb3JtYXRpY0NvbnRyb2xsZWRDbGFzcyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbi8vXG4vLyAgIGRpc3BsYXlOYW1lOiAnRm9ybWF0aWNDb250cm9sbGVkJyxcbi8vXG4vLyAgIC8vIFJlc3BvbmQgdG8gYW55IHZhbHVlIGNoYW5nZXMuXG4vLyAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAobmV3VmFsdWUsIGluZm8pIHtcbi8vICAgICBpZiAoIXRoaXMucHJvcHMub25DaGFuZ2UpIHtcbi8vICAgICAgIHJldHVybjtcbi8vICAgICB9XG4vLyAgICAgaW5mbyA9IF8uZXh0ZW5kKHt9LCBpbmZvKTtcbi8vICAgICBpbmZvLnBhdGggPSB0aGlzLnByb3BzLmNvbmZpZy5maWVsZFZhbHVlUGF0aChpbmZvLmZpZWxkKTtcbi8vICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG5ld1ZhbHVlLCBpbmZvKTtcbi8vICAgfSxcbi8vXG4vLyAgIC8vIFJlc3BvbmQgdG8gYW55IGFjdGlvbnMgb3RoZXIgdGhhbiB2YWx1ZSBjaGFuZ2VzLiAoRm9yIGV4YW1wbGUsIGZvY3VzIGFuZFxuLy8gICAvLyBibHVyLilcbi8vICAgb25BY3Rpb246IGZ1bmN0aW9uIChpbmZvKSB7XG4vLyAgICAgaWYgKCF0aGlzLnByb3BzLm9uQWN0aW9uKSB7XG4vLyAgICAgICByZXR1cm47XG4vLyAgICAgfVxuLy8gICAgIGluZm8gPSBfLmV4dGVuZCh7fSwgaW5mbyk7XG4vLyAgICAgaW5mby5wYXRoID0gdGhpcy5wcm9wcy5jb25maWcuZmllbGRWYWx1ZVBhdGgoaW5mby5maWVsZCk7XG4vLyAgICAgdGhpcy5wcm9wcy5vbkFjdGlvbihpbmZvKTtcbi8vICAgfSxcbi8vXG4vLyAgIC8vIFJlbmRlciB0aGUgcm9vdCBjb21wb25lbnQgYnkgZGVsZWdhdGluZyB0byB0aGUgY29uZmlnLlxuLy8gICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbi8vXG4vLyAgICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuLy9cbi8vICAgICByZXR1cm4gY29uZmlnLnJlbmRlckZvcm1hdGljQ29tcG9uZW50KHRoaXMpO1xuLy8gICB9XG4vLyB9KTtcbi8vXG4vLyB2YXIgRm9ybWF0aWNDb250cm9sbGVkID0gUmVhY3QuY3JlYXRlRmFjdG9yeShGb3JtYXRpY0NvbnRyb2xsZWRDbGFzcyk7XG4vL1xuLy8gLy8gQSB3cmFwcGVyIGNvbXBvbmVudCB0aGF0IGlzIGFjdHVhbGx5IGV4cG9ydGVkIGFuZCBjYW4gYWxsb3cgZm9ybWF0aWMgdG8gYmVcbi8vIC8vIHVzZWQgaW4gYW4gXCJ1bmNvbnRyb2xsZWRcIiBtYW5uZXIuIChTZWUgdW5jb250cm9sbGVkIGNvbXBvbmVudHMgaW4gdGhlIFJlYWN0XG4vLyAvLyBkb2N1bWVudGF0aW9uIGZvciBhbiBleHBsYW5hdGlvbiBvZiB0aGUgZGlmZmVyZW5jZS4pXG4vLyBtb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbi8vXG4vLyAgIC8vIEV4cG9ydCBzb21lIHN0dWZmIGFzIHN0YXRpY3MuXG4vLyAgIHN0YXRpY3M6IHtcbi8vICAgICBjcmVhdGVDb25maWc6IGNyZWF0ZUNvbmZpZyxcbi8vICAgICBhdmFpbGFibGVNaXhpbnM6IHtcbi8vICAgICAgIGNsaWNrT3V0c2lkZTogcmVxdWlyZSgnLi9taXhpbnMvY2xpY2stb3V0c2lkZS5qcycpLFxuLy8gICAgICAgZmllbGQ6IHJlcXVpcmUoJy4vbWl4aW5zL2ZpZWxkLmpzJyksXG4vLyAgICAgICBoZWxwZXI6IHJlcXVpcmUoJy4vbWl4aW5zL2hlbHBlci5qcycpLFxuLy8gICAgICAgcmVzaXplOiByZXF1aXJlKCcuL21peGlucy9yZXNpemUuanMnKSxcbi8vICAgICAgIHNjcm9sbDogcmVxdWlyZSgnLi9taXhpbnMvc2Nyb2xsLmpzJyksXG4vLyAgICAgICB1bmRvU3RhY2s6IHJlcXVpcmUoJy4vbWl4aW5zL3VuZG8tc3RhY2suanMnKVxuLy8gICAgIH0sXG4vLyAgICAgcGx1Z2luczoge1xuLy8gICAgICAgYm9vdHN0cmFwOiByZXF1aXJlKCcuL3BsdWdpbnMvYm9vdHN0cmFwJyksXG4vLyAgICAgICBtZXRhOiByZXF1aXJlKCcuL3BsdWdpbnMvbWV0YScpLFxuLy8gICAgICAgcmVmZXJlbmNlOiByZXF1aXJlKCcuL3BsdWdpbnMvcmVmZXJlbmNlJyksXG4vLyAgICAgICBlbGVtZW50Q2xhc3NlczogcmVxdWlyZSgnLi9wbHVnaW5zL2VsZW1lbnQtY2xhc3NlcycpXG4vLyAgICAgfSxcbi8vICAgICB1dGlsczogdXRpbHNcbi8vICAgfSxcbi8vXG4vLyAgIGRpc3BsYXlOYW1lOiAnRm9ybWF0aWMnLFxuLy9cbi8vICAgLy8gSWYgd2UgZ290IGEgdmFsdWUsIHRyZWF0IHRoaXMgY29tcG9uZW50IGFzIGNvbnRyb2xsZWQuIEVpdGhlciB3YXksIHJldGFpblxuLy8gICAvLyB0aGUgdmFsdWUgaW4gdGhlIHN0YXRlLlxuLy8gICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbi8vICAgICByZXR1cm4ge1xuLy8gICAgICAgaXNDb250cm9sbGVkOiAhXy5pc1VuZGVmaW5lZCh0aGlzLnByb3BzLnZhbHVlKSxcbi8vICAgICAgIHZhbHVlOiBfLmlzVW5kZWZpbmVkKHRoaXMucHJvcHMudmFsdWUpID8gdGhpcy5wcm9wcy5kZWZhdWx0VmFsdWUgOiB0aGlzLnByb3BzLnZhbHVlXG4vLyAgICAgfTtcbi8vICAgfSxcbi8vXG4vLyAgIC8vIElmIHRoaXMgaXMgYSBjb250cm9sbGVkIGNvbXBvbmVudCwgY2hhbmdlIG91ciBzdGF0ZSB0byByZWZsZWN0IHRoZSBuZXdcbi8vICAgLy8gdmFsdWUuIEZvciB1bmNvbnRyb2xsZWQgY29tcG9uZW50cywgaWdub3JlIGFueSB2YWx1ZSBjaGFuZ2VzLlxuLy8gICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV3UHJvcHMpIHtcbi8vICAgICBpZiAodGhpcy5zdGF0ZS5pc0NvbnRyb2xsZWQpIHtcbi8vICAgICAgIGlmICghXy5pc1VuZGVmaW5lZChuZXdQcm9wcy52YWx1ZSkpIHtcbi8vICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4vLyAgICAgICAgICAgdmFsdWU6IG5ld1Byb3BzLnZhbHVlXG4vLyAgICAgICAgIH0pO1xuLy8gICAgICAgfVxuLy8gICAgIH1cbi8vICAgfSxcbi8vXG4vLyAgIC8vIElmIHRoaXMgaXMgYW4gdW5jb250cm9sbGVkIGNvbXBvbmVudCwgc2V0IG91ciBzdGF0ZSB0byByZWZsZWN0IHRoZSBuZXdcbi8vICAgLy8gdmFsdWUuIEVpdGhlciB3YXksIGNhbGwgdGhlIG9uQ2hhbmdlIGNhbGxiYWNrLlxuLy8gICBvbkNoYW5nZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBpbmZvKSB7XG4vLyAgICAgaWYgKCF0aGlzLnN0YXRlLmlzQ29udHJvbGxlZCkge1xuLy8gICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4vLyAgICAgICAgIHZhbHVlOiBuZXdWYWx1ZVxuLy8gICAgICAgfSk7XG4vLyAgICAgfVxuLy8gICAgIGlmICghdGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuLy8gICAgICAgcmV0dXJuO1xuLy8gICAgIH1cbi8vICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG5ld1ZhbHVlLCBpbmZvKTtcbi8vICAgfSxcbi8vXG4vLyAgIC8vIEFueSBhY3Rpb25zIHNob3VsZCBiZSBzZW50IHRvIHRoZSBnZW5lcmljIG9uQWN0aW9uIGNhbGxiYWNrIGJ1dCBhbHNvIHNwbGl0XG4vLyAgIC8vIGludG8gZGlzY3JlZXQgY2FsbGJhY2tzIHBlciBhY3Rpb24uXG4vLyAgIG9uQWN0aW9uOiBmdW5jdGlvbiAoaW5mbykge1xuLy8gICAgIGlmICh0aGlzLnByb3BzLm9uQWN0aW9uKSB7XG4vLyAgICAgICB0aGlzLnByb3BzLm9uQWN0aW9uKGluZm8pO1xuLy8gICAgIH1cbi8vICAgICB2YXIgYWN0aW9uID0gdXRpbHMuZGFzaFRvUGFzY2FsKGluZm8uYWN0aW9uKTtcbi8vICAgICBpZiAodGhpcy5wcm9wc1snb24nICsgYWN0aW9uXSkge1xuLy8gICAgICAgdGhpcy5wcm9wc1snb24nICsgYWN0aW9uXShpbmZvKTtcbi8vICAgICB9XG4vLyAgIH0sXG4vL1xuLy8gICAvLyBSZW5kZXIgdGhlIHdyYXBwZXIgY29tcG9uZW50IChieSBqdXN0IGRlbGVnYXRpbmcgdG8gdGhlIG1haW4gY29tcG9uZW50KS5cbi8vICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4vL1xuLy8gICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZyB8fCBkZWZhdWx0Q29uZmlnO1xuLy8gICAgIHZhciB2YWx1ZSA9IHRoaXMuc3RhdGUudmFsdWU7XG4vL1xuLy8gICAgIGlmICh0aGlzLnN0YXRlLmlzQ29udHJvbGxlZCkge1xuLy8gICAgICAgaWYgKCF0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4vLyAgICAgICAgIGNvbnNvbGUubG9nKCdZb3Ugc2hvdWxkIHN1cHBseSBhbiBvbkNoYW5nZSBoYW5kbGVyIGlmIHlvdSBzdXBwbHkgYSB2YWx1ZS4nKTtcbi8vICAgICAgIH1cbi8vICAgICB9XG4vL1xuLy8gICAgIHZhciBwcm9wcyA9IHtcbi8vICAgICAgIGNvbmZpZzogY29uZmlnLFxuLy8gICAgICAgLy8gQWxsb3cgZmllbGQgdGVtcGxhdGVzIHRvIGJlIHBhc3NlZCBpbiBhcyBgZmllbGRgIG9yIGBmaWVsZHNgLiBBZnRlciB0aGlzLCBzdG9wXG4vLyAgICAgICAvLyBjYWxsaW5nIHRoZW0gZmllbGRzLlxuLy8gICAgICAgZmllbGRUZW1wbGF0ZTogdGhpcy5wcm9wcy5maWVsZCxcbi8vICAgICAgIGZpZWxkVGVtcGxhdGVzOiB0aGlzLnByb3BzLmZpZWxkcyxcbi8vICAgICAgIHZhbHVlOiB2YWx1ZSxcbi8vICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuLy8gICAgICAgb25BY3Rpb246IHRoaXMub25BY3Rpb25cbi8vICAgICB9O1xuLy9cbi8vICAgICBfLmVhY2godGhpcy5wcm9wcywgZnVuY3Rpb24gKHByb3BWYWx1ZSwga2V5KSB7XG4vLyAgICAgICBpZiAoIShrZXkgaW4gcHJvcHMpKSB7XG4vLyAgICAgICAgIHByb3BzW2tleV0gPSBwcm9wVmFsdWU7XG4vLyAgICAgICB9XG4vLyAgICAgfSk7XG4vL1xuLy8gICAgIHJldHVybiBGb3JtYXRpY0NvbnRyb2xsZWQocHJvcHMpO1xuLy8gICB9XG4vL1xuLy8gfSk7XG4iLCIvKlxuVGhpcyBpcyB0aGUgZGVmYXVsdCBjb25maWd1cmF0aW9uIHBsdWdpbiBmb3IgZm9ybWF0aWMuIFRvIGNoYW5nZSBmb3JtYXRpYydzXG5iZWhhdmlvciwganVzdCBjcmVhdGUgeW91ciBvd24gcGx1Z2luIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhbiBvYmplY3Qgd2l0aFxubWV0aG9kcyB5b3Ugd2FudCB0byBhZGQgb3Igb3ZlcnJpZGUuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8vIHZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuLy8gdmFyIF8gPSByZXF1aXJlKCcuLi91bmRhc2gnKTtcblxuY29uc3QgQ29tcG9uZW50cyA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMnKTtcblxuY29uc3QgY29tcG9uZW50cyA9IHt9O1xuXG5PYmplY3Qua2V5cyhDb21wb25lbnRzLmZpZWxkcykuZm9yRWFjaChuYW1lID0+IHtcbiAgY29tcG9uZW50c1tuYW1lICsgJ0ZpZWxkJ10gPSBDb21wb25lbnRzLmZpZWxkc1tuYW1lXTtcbn0pO1xuXG5PYmplY3Qua2V5cyhDb21wb25lbnRzLmhlbHBlcnMpLmZvckVhY2gobmFtZSA9PiB7XG4gIGNvbXBvbmVudHNbbmFtZV0gPSBDb21wb25lbnRzLmhlbHBlcnNbbmFtZV07XG59KTtcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgLy8gdmFyIGRlbGVnYXRlVG8gPSB1dGlscy5kZWxlZ2F0b3IoY29uZmlnKTtcblxuICByZXR1cm4ge1xuXG4gICAgLy8gTm9ybWFsaXplIGFuIGVsZW1lbnQgbmFtZS5cbiAgICBlbGVtZW50TmFtZShuYW1lKSB7XG4gICAgICByZXR1cm4gdXRpbHMuZGFzaFRvUGFzY2FsKG5hbWUpO1xuICAgIH0sXG5cbiAgICBjbGFzcyhuYW1lKSB7XG4gICAgICBpZiAoIW5hbWUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb21wb25lbnQgY2xhc3MgbmFtZSBtdXN0IGJlIHNwZWNpZmllZCB0byByZXRyaWV2ZSBjb21wb25lbnQgY2xhc3MuJyk7XG4gICAgICB9XG4gICAgICBuYW1lID0gY29uZmlnLmVsZW1lbnROYW1lKG5hbWUpO1xuICAgICAgaWYgKGNvbXBvbmVudHNbbmFtZV0pIHtcbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudHNbbmFtZV07XG4gICAgICB9XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENvbXBvbmVudCBjbGFzcyAke25hbWV9IG5vdCBmb3VuZC5gKTtcbiAgICB9LFxuXG4gICAgaGVscGVyQ2xhc3MobmFtZSkge1xuICAgICAgaWYgKCFuYW1lKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSGVscGVyIGNsYXNzIG5hbWUgbXVzdCBiZSBzcGVjaWZpZWQgdG8gcmV0cmlldmUgY29tcG9uZW50IGNsYXNzLicpO1xuICAgICAgfVxuICAgICAgbmFtZSA9IGNvbmZpZy5lbGVtZW50TmFtZShuYW1lKTtcbiAgICAgIHJldHVybiBjb25maWcuY2xhc3MobmFtZSk7XG4gICAgfSxcblxuICAgIGZpZWxkQ2xhc3MobmFtZSkge1xuICAgICAgaWYgKCFuYW1lKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRmllbGQgY2xhc3MgbmFtZSBtdXN0IGJlIHNwZWNpZmllZCB0byByZXRyaWV2ZSBjb21wb25lbnQgY2xhc3MuJyk7XG4gICAgICB9XG4gICAgICBuYW1lICs9ICctZmllbGQnO1xuICAgICAgbmFtZSA9IGNvbmZpZy5lbGVtZW50TmFtZShuYW1lKTtcbiAgICAgIHJldHVybiBjb25maWcuY2xhc3MobmFtZSk7XG4gICAgfVxuICB9O1xufTtcbiIsInZhciBfID0ge307XG5cbl8uYXNzaWduID0gXy5leHRlbmQgPSByZXF1aXJlKCdvYmplY3QtYXNzaWduJyk7XG5fLmlzRXF1YWwgPSByZXF1aXJlKCdkZWVwLWVxdWFsJyk7XG5cbi8vIFRoZXNlIGFyZSBub3QgbmVjZXNzYXJpbHkgY29tcGxldGUgaW1wbGVtZW50YXRpb25zLiBUaGV5J3JlIGp1c3QgZW5vdWdoIGZvclxuLy8gd2hhdCdzIHVzZWQgaW4gZm9ybWF0aWMuXG5cbl8uZmxhdHRlbiA9IChhcnJheXMpID0+IFtdLmNvbmNhdC5hcHBseShbXSwgYXJyYXlzKTtcblxuXy5pc1N0cmluZyA9IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZyc7XG5fLmlzVW5kZWZpbmVkID0gdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJztcbl8uaXNPYmplY3QgPSB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnO1xuXy5pc0FycmF5ID0gdmFsdWUgPT4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbl8uaXNOdW1iZXIgPSB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInO1xuXy5pc0Jvb2xlYW4gPSB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJztcbl8uaXNOdWxsID0gdmFsdWUgPT4gdmFsdWUgPT09IG51bGw7XG5fLmlzRnVuY3Rpb24gPSB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbic7XG5cbl8uY2xvbmUgPSB2YWx1ZSA9PiB7XG4gIGlmICghXy5pc09iamVjdCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIF8uaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZS5zbGljZSgpIDogXy5hc3NpZ24oe30sIHZhbHVlKTtcbn07XG5cbl8uZmluZCA9IChpdGVtcywgdGVzdEZuKSA9PiB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAodGVzdEZuKGl0ZW1zW2ldKSkge1xuICAgICAgcmV0dXJuIGl0ZW1zW2ldO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdm9pZCAwO1xufTtcblxuXy5ldmVyeSA9IChpdGVtcywgdGVzdEZuKSA9PiB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoIXRlc3RGbihpdGVtc1tpXSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5fLmVhY2ggPSAob2JqLCBpdGVyYXRlRm4pID0+IHtcbiAgT2JqZWN0LmtleXMob2JqKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgaXRlcmF0ZUZuKG9ialtrZXldLCBrZXkpO1xuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gXztcbiIsIi8vICMgdXRpbHNcblxuLypcbkp1c3Qgc29tZSBzaGFyZWQgdXRpbGl0eSBmdW5jdGlvbnMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gcmVxdWlyZSgnLi91bmRhc2gnKTtcblxudmFyIHV0aWxzID0gZXhwb3J0cztcblxuLy8gQ29weSBvYmogcmVjdXJzaW5nIGRlZXBseS5cbnV0aWxzLmRlZXBDb3B5ID0gZnVuY3Rpb24gKG9iaikge1xuICBpZiAoXy5pc0FycmF5KG9iaikpIHtcbiAgICByZXR1cm4gb2JqLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgcmV0dXJuIHV0aWxzLmRlZXBDb3B5KGl0ZW0pO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKF8uaXNGdW5jdGlvbihvYmopKSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfSBlbHNlIGlmIChfLmlzTnVsbChvYmopKSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfSBlbHNlIGlmIChfLmlzT2JqZWN0KG9iaikpIHtcbiAgICB2YXIgY29weSA9IHt9O1xuICAgIF8uZWFjaChvYmosIGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICBjb3B5W2tleV0gPSB1dGlscy5kZWVwQ29weSh2YWx1ZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGNvcHk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfVxufTtcblxuLy8gQ2FjaGUgZm9yIHN0cmluZ3MgY29udmVydGVkIHRvIFBhc2NhbCBDYXNlLiBUaGlzIHNob3VsZCBiZSBhIGZpbml0ZSBsaXN0LCBzb1xuLy8gbm90IG11Y2ggZmVhciB0aGF0IHdlIHdpbGwgcnVuIG91dCBvZiBtZW1vcnkuXG52YXIgZGFzaFRvUGFzY2FsQ2FjaGUgPSB7fTtcblxuLy8gQ29udmVydCBmb28tYmFyIHRvIEZvb0Jhci5cbnV0aWxzLmRhc2hUb1Bhc2NhbCA9IGZ1bmN0aW9uIChzKSB7XG4gIGlmIChzID09PSAnJykge1xuICAgIHJldHVybiAnJztcbiAgfVxuICBpZiAoIWRhc2hUb1Bhc2NhbENhY2hlW3NdKSB7XG4gICAgZGFzaFRvUGFzY2FsQ2FjaGVbc10gPSBzLnNwbGl0KCctJykubWFwKGZ1bmN0aW9uIChwYXJ0KSB7XG4gICAgICByZXR1cm4gcGFydFswXS50b1VwcGVyQ2FzZSgpICsgcGFydC5zdWJzdHJpbmcoMSk7XG4gICAgfSkuam9pbignJyk7XG4gIH1cbiAgcmV0dXJuIGRhc2hUb1Bhc2NhbENhY2hlW3NdO1xufTtcblxuLy8gQ29weSBhbGwgY29tcHV0ZWQgc3R5bGVzIGZyb20gb25lIERPTSBlbGVtZW50IHRvIGFub3RoZXIuXG51dGlscy5jb3B5RWxlbWVudFN0eWxlID0gZnVuY3Rpb24gKGZyb21FbGVtZW50LCB0b0VsZW1lbnQpIHtcbiAgdmFyIGZyb21TdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGZyb21FbGVtZW50LCAnJyk7XG5cbiAgaWYgKGZyb21TdHlsZS5jc3NUZXh0ICE9PSAnJykge1xuICAgIHRvRWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gZnJvbVN0eWxlLmNzc1RleHQ7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGNzc1J1bGVzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZnJvbVN0eWxlLmxlbmd0aDsgaSsrKSB7XG4gICAgY3NzUnVsZXMucHVzaChmcm9tU3R5bGVbaV0gKyAnOicgKyBmcm9tU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShmcm9tU3R5bGVbaV0pICsgJzsnKTtcbiAgfVxuICB2YXIgY3NzVGV4dCA9IGNzc1J1bGVzLmpvaW4oJycpO1xuXG4gIHRvRWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gY3NzVGV4dDtcbn07XG5cbi8vIE9iamVjdCB0byBob2xkIGJyb3dzZXIgc25pZmZpbmcgaW5mby5cbnZhciBicm93c2VyID0ge1xuICBpc0Nocm9tZTogZmFsc2UsXG4gIGlzTW96aWxsYTogZmFsc2UsXG4gIGlzT3BlcmE6IGZhbHNlLFxuICBpc0llOiBmYWxzZSxcbiAgaXNTYWZhcmk6IGZhbHNlLFxuICBpc1Vua25vd246IGZhbHNlXG59O1xuXG4vLyBTbmlmZiB0aGUgYnJvd3Nlci5cbnZhciB1YSA9ICcnO1xuXG5pZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgdWEgPSBuYXZpZ2F0b3IudXNlckFnZW50O1xufVxuXG5pZih1YS5pbmRleE9mKCdDaHJvbWUnKSA+IC0xKSB7XG4gIGJyb3dzZXIuaXNDaHJvbWUgPSB0cnVlO1xufSBlbHNlIGlmICh1YS5pbmRleE9mKCdTYWZhcmknKSA+IC0xKSB7XG4gIGJyb3dzZXIuaXNTYWZhcmkgPSB0cnVlO1xufSBlbHNlIGlmICh1YS5pbmRleE9mKCdPcGVyYScpID4gLTEpIHtcbiAgYnJvd3Nlci5pc09wZXJhID0gdHJ1ZTtcbn0gZWxzZSBpZiAodWEuaW5kZXhPZignRmlyZWZveCcpID4gLTEpIHtcbiAgYnJvd3Nlci5pc01vemlsbGEgPSB0cnVlO1xufSBlbHNlIGlmICh1YS5pbmRleE9mKCdNU0lFJykgPiAtMSkge1xuICBicm93c2VyLmlzSWUgPSB0cnVlO1xufSBlbHNlIHtcbiAgYnJvd3Nlci5pc1Vua25vd24gPSB0cnVlO1xufVxuXG4vLyBFeHBvcnQgc25pZmZlZCBicm93c2VyIGluZm8uXG51dGlscy5icm93c2VyID0gYnJvd3NlcjtcblxuLy8gQ3JlYXRlIGEgbWV0aG9kIHRoYXQgZGVsZWdhdGVzIHRvIGFub3RoZXIgbWV0aG9kIG9uIHRoZSBzYW1lIG9iamVjdC4gVGhlXG4vLyBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gdXNlcyB0aGlzIGZ1bmN0aW9uIHRvIGRlbGVnYXRlIG9uZSBtZXRob2QgdG8gYW5vdGhlci5cbnV0aWxzLmRlbGVnYXRlVG8gPSBmdW5jdGlvbiAobmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzW25hbWVdLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH07XG59O1xuXG51dGlscy5kZWxlZ2F0b3IgPSBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiBmdW5jdGlvbiAobmFtZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gb2JqW25hbWVdLmFwcGx5KG9iaiwgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9O1xufTtcblxudXRpbHMuY2FwaXRhbGl6ZSA9IGZ1bmN0aW9uKHMpIHtcbiAgcmV0dXJuIHMuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzLnN1YnN0cmluZygxKS50b0xvd2VyQ2FzZSgpO1xufTtcbiIsInZhciBwU2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG52YXIgb2JqZWN0S2V5cyA9IHJlcXVpcmUoJy4vbGliL2tleXMuanMnKTtcbnZhciBpc0FyZ3VtZW50cyA9IHJlcXVpcmUoJy4vbGliL2lzX2FyZ3VtZW50cy5qcycpO1xuXG52YXIgZGVlcEVxdWFsID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYWN0dWFsLCBleHBlY3RlZCwgb3B0cykge1xuICBpZiAoIW9wdHMpIG9wdHMgPSB7fTtcbiAgLy8gNy4xLiBBbGwgaWRlbnRpY2FsIHZhbHVlcyBhcmUgZXF1aXZhbGVudCwgYXMgZGV0ZXJtaW5lZCBieSA9PT0uXG4gIGlmIChhY3R1YWwgPT09IGV4cGVjdGVkKSB7XG4gICAgcmV0dXJuIHRydWU7XG5cbiAgfSBlbHNlIGlmIChhY3R1YWwgaW5zdGFuY2VvZiBEYXRlICYmIGV4cGVjdGVkIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgIHJldHVybiBhY3R1YWwuZ2V0VGltZSgpID09PSBleHBlY3RlZC5nZXRUaW1lKCk7XG5cbiAgLy8gNy4zLiBPdGhlciBwYWlycyB0aGF0IGRvIG5vdCBib3RoIHBhc3MgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnLFxuICAvLyBlcXVpdmFsZW5jZSBpcyBkZXRlcm1pbmVkIGJ5ID09LlxuICB9IGVsc2UgaWYgKHR5cGVvZiBhY3R1YWwgIT0gJ29iamVjdCcgJiYgdHlwZW9mIGV4cGVjdGVkICE9ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIG9wdHMuc3RyaWN0ID8gYWN0dWFsID09PSBleHBlY3RlZCA6IGFjdHVhbCA9PSBleHBlY3RlZDtcblxuICAvLyA3LjQuIEZvciBhbGwgb3RoZXIgT2JqZWN0IHBhaXJzLCBpbmNsdWRpbmcgQXJyYXkgb2JqZWN0cywgZXF1aXZhbGVuY2UgaXNcbiAgLy8gZGV0ZXJtaW5lZCBieSBoYXZpbmcgdGhlIHNhbWUgbnVtYmVyIG9mIG93bmVkIHByb3BlcnRpZXMgKGFzIHZlcmlmaWVkXG4gIC8vIHdpdGggT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKSwgdGhlIHNhbWUgc2V0IG9mIGtleXNcbiAgLy8gKGFsdGhvdWdoIG5vdCBuZWNlc3NhcmlseSB0aGUgc2FtZSBvcmRlciksIGVxdWl2YWxlbnQgdmFsdWVzIGZvciBldmVyeVxuICAvLyBjb3JyZXNwb25kaW5nIGtleSwgYW5kIGFuIGlkZW50aWNhbCAncHJvdG90eXBlJyBwcm9wZXJ0eS4gTm90ZTogdGhpc1xuICAvLyBhY2NvdW50cyBmb3IgYm90aCBuYW1lZCBhbmQgaW5kZXhlZCBwcm9wZXJ0aWVzIG9uIEFycmF5cy5cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gb2JqRXF1aXYoYWN0dWFsLCBleHBlY3RlZCwgb3B0cyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWRPck51bGwodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIGlzQnVmZmVyICh4KSB7XG4gIGlmICgheCB8fCB0eXBlb2YgeCAhPT0gJ29iamVjdCcgfHwgdHlwZW9mIHgubGVuZ3RoICE9PSAnbnVtYmVyJykgcmV0dXJuIGZhbHNlO1xuICBpZiAodHlwZW9mIHguY29weSAhPT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgeC5zbGljZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAoeC5sZW5ndGggPiAwICYmIHR5cGVvZiB4WzBdICE9PSAnbnVtYmVyJykgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gb2JqRXF1aXYoYSwgYiwgb3B0cykge1xuICB2YXIgaSwga2V5O1xuICBpZiAoaXNVbmRlZmluZWRPck51bGwoYSkgfHwgaXNVbmRlZmluZWRPck51bGwoYikpXG4gICAgcmV0dXJuIGZhbHNlO1xuICAvLyBhbiBpZGVudGljYWwgJ3Byb3RvdHlwZScgcHJvcGVydHkuXG4gIGlmIChhLnByb3RvdHlwZSAhPT0gYi5wcm90b3R5cGUpIHJldHVybiBmYWxzZTtcbiAgLy9+fn5JJ3ZlIG1hbmFnZWQgdG8gYnJlYWsgT2JqZWN0LmtleXMgdGhyb3VnaCBzY3Jld3kgYXJndW1lbnRzIHBhc3NpbmcuXG4gIC8vICAgQ29udmVydGluZyB0byBhcnJheSBzb2x2ZXMgdGhlIHByb2JsZW0uXG4gIGlmIChpc0FyZ3VtZW50cyhhKSkge1xuICAgIGlmICghaXNBcmd1bWVudHMoYikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgYSA9IHBTbGljZS5jYWxsKGEpO1xuICAgIGIgPSBwU2xpY2UuY2FsbChiKTtcbiAgICByZXR1cm4gZGVlcEVxdWFsKGEsIGIsIG9wdHMpO1xuICB9XG4gIGlmIChpc0J1ZmZlcihhKSkge1xuICAgIGlmICghaXNCdWZmZXIoYikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGEubGVuZ3RoICE9PSBiLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICAgIGZvciAoaSA9IDA7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoYVtpXSAhPT0gYltpXSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICB0cnkge1xuICAgIHZhciBrYSA9IG9iamVjdEtleXMoYSksXG4gICAgICAgIGtiID0gb2JqZWN0S2V5cyhiKTtcbiAgfSBjYXRjaCAoZSkgey8vaGFwcGVucyB3aGVuIG9uZSBpcyBhIHN0cmluZyBsaXRlcmFsIGFuZCB0aGUgb3RoZXIgaXNuJ3RcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy8gaGF2aW5nIHRoZSBzYW1lIG51bWJlciBvZiBvd25lZCBwcm9wZXJ0aWVzIChrZXlzIGluY29ycG9yYXRlc1xuICAvLyBoYXNPd25Qcm9wZXJ0eSlcbiAgaWYgKGthLmxlbmd0aCAhPSBrYi5sZW5ndGgpXG4gICAgcmV0dXJuIGZhbHNlO1xuICAvL3RoZSBzYW1lIHNldCBvZiBrZXlzIChhbHRob3VnaCBub3QgbmVjZXNzYXJpbHkgdGhlIHNhbWUgb3JkZXIpLFxuICBrYS5zb3J0KCk7XG4gIGtiLnNvcnQoKTtcbiAgLy9+fn5jaGVhcCBrZXkgdGVzdFxuICBmb3IgKGkgPSBrYS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGlmIChrYVtpXSAhPSBrYltpXSlcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvL2VxdWl2YWxlbnQgdmFsdWVzIGZvciBldmVyeSBjb3JyZXNwb25kaW5nIGtleSwgYW5kXG4gIC8vfn5+cG9zc2libHkgZXhwZW5zaXZlIGRlZXAgdGVzdFxuICBmb3IgKGkgPSBrYS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGtleSA9IGthW2ldO1xuICAgIGlmICghZGVlcEVxdWFsKGFba2V5XSwgYltrZXldLCBvcHRzKSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0eXBlb2YgYSA9PT0gdHlwZW9mIGI7XG59XG4iLCJ2YXIgc3VwcG9ydHNBcmd1bWVudHNDbGFzcyA9IChmdW5jdGlvbigpe1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFyZ3VtZW50cylcbn0pKCkgPT0gJ1tvYmplY3QgQXJndW1lbnRzXSc7XG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHN1cHBvcnRzQXJndW1lbnRzQ2xhc3MgPyBzdXBwb3J0ZWQgOiB1bnN1cHBvcnRlZDtcblxuZXhwb3J0cy5zdXBwb3J0ZWQgPSBzdXBwb3J0ZWQ7XG5mdW5jdGlvbiBzdXBwb3J0ZWQob2JqZWN0KSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqZWN0KSA9PSAnW29iamVjdCBBcmd1bWVudHNdJztcbn07XG5cbmV4cG9ydHMudW5zdXBwb3J0ZWQgPSB1bnN1cHBvcnRlZDtcbmZ1bmN0aW9uIHVuc3VwcG9ydGVkKG9iamVjdCl7XG4gIHJldHVybiBvYmplY3QgJiZcbiAgICB0eXBlb2Ygb2JqZWN0ID09ICdvYmplY3QnICYmXG4gICAgdHlwZW9mIG9iamVjdC5sZW5ndGggPT0gJ251bWJlcicgJiZcbiAgICBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCAnY2FsbGVlJykgJiZcbiAgICAhT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKG9iamVjdCwgJ2NhbGxlZScpIHx8XG4gICAgZmFsc2U7XG59O1xuIiwiZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gdHlwZW9mIE9iamVjdC5rZXlzID09PSAnZnVuY3Rpb24nXG4gID8gT2JqZWN0LmtleXMgOiBzaGltO1xuXG5leHBvcnRzLnNoaW0gPSBzaGltO1xuZnVuY3Rpb24gc2hpbSAob2JqKSB7XG4gIHZhciBrZXlzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBvYmopIGtleXMucHVzaChrZXkpO1xuICByZXR1cm4ga2V5cztcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gVG9PYmplY3QodmFsKSB7XG5cdGlmICh2YWwgPT0gbnVsbCkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ09iamVjdC5hc3NpZ24gY2Fubm90IGJlIGNhbGxlZCB3aXRoIG51bGwgb3IgdW5kZWZpbmVkJyk7XG5cdH1cblxuXHRyZXR1cm4gT2JqZWN0KHZhbCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0LCBzb3VyY2UpIHtcblx0dmFyIGZyb207XG5cdHZhciBrZXlzO1xuXHR2YXIgdG8gPSBUb09iamVjdCh0YXJnZXQpO1xuXG5cdGZvciAodmFyIHMgPSAxOyBzIDwgYXJndW1lbnRzLmxlbmd0aDsgcysrKSB7XG5cdFx0ZnJvbSA9IGFyZ3VtZW50c1tzXTtcblx0XHRrZXlzID0gT2JqZWN0LmtleXMoT2JqZWN0KGZyb20pKTtcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dG9ba2V5c1tpXV0gPSBmcm9tW2tleXNbaV1dO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiB0bztcbn07XG4iXX0=
