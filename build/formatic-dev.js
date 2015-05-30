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
  displayName: "exports",

  render: function render() {
    var config = this.props.config;

    var Field = config.helperClass("field");

    return React.createElement(
      Field,
      this.props,
      React.createElement("textarea", { value: this.props.value })
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
  displayName: "exports",

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
  displayName: "exports",

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
  displayName: "exports",

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

module.exports = function (FieldComponent) {

  var WrapField = (function (_React$Component) {
    function WrapField(props, context) {
      _classCallCheck(this, WrapField);

      _get(Object.getPrototypeOf(WrapField.prototype), "constructor", this).call(this, props, context);

      this.state = {
        config: Config.forComponent(this)
      };
    }

    _inherits(WrapField, _React$Component);

    _prototypeProperties(WrapField, null, {
      render: {
        value: function render() {
          return React.createElement(Component, _extends({}, this.props, this.state));
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

},{"../config":"/Users/justin/Dropbox/git/formatic/lib/config.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/wrap-helper.js":[function(require,module,exports){
(function (global){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var Config = require("../config");

module.exports = function (FieldComponent) {

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
          return React.createElement(Component, _extends({}, this.props, this.state));
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
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var _ = require("../undash");

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

  var delegateTo = utils.delegator(config);

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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../components":"/Users/justin/Dropbox/git/formatic/lib/components/index.js","../undash":"/Users/justin/Dropbox/git/formatic/lib/undash.js","../utils":"/Users/justin/Dropbox/git/formatic/lib/utils.js"}],"/Users/justin/Dropbox/git/formatic/lib/undash.js":[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2luZGV4LmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9maWVsZHMvc3RyaW5nLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2ZpZWxkLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2hlbHAuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvbGFiZWwuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2luZGV4LmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy93cmFwLWZpZWxkLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy93cmFwLWhlbHBlci5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbmZpZy5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NyZWF0ZS1jb25maWcuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9mb3JtYXRpYy5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL3BsdWdpbnMvZGVmYXVsdC1jb25maWcuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi91bmRhc2guanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi91dGlscy5qcyIsIm5vZGVfbW9kdWxlcy9kZWVwLWVxdWFsL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RlZXAtZXF1YWwvbGliL2lzX2FyZ3VtZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9kZWVwLWVxdWFsL2xpYi9rZXlzLmpzIiwibm9kZV9tb2R1bGVzL29iamVjdC1hc3NpZ24vaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztBQ0dBLE1BQU0sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7Ozs7OztBQ0gzQyxJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7O0FBRS9CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7O0FBRWpDLFFBQU0sRUFBQSxrQkFBRztBQUNQLFFBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDOztBQUVqQyxRQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUUxQyxXQUNFO0FBQUMsV0FBSztNQUFLLElBQUksQ0FBQyxLQUFLO01BQ25CLGtDQUFVLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQUFBQyxHQUFFO0tBQzlCLENBQ1I7R0FDSDs7Q0FFRixDQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNoQkgsSUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQy9CLElBQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQzs7QUFFdkMsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDOzs7QUFFakMsUUFBTSxFQUFBLGtCQUFHO0FBQ1AsUUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFekMsUUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMxQyxRQUFNLElBQUksR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUV4QyxXQUNFOzs7TUFDRSxvQkFBQyxLQUFLLEVBQUssSUFBSSxDQUFDLEtBQUssQ0FBRztNQUN4QixvQkFBQyxJQUFJLEVBQUssSUFBSSxDQUFDLEtBQUssQ0FBRztNQUN0QixJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVE7S0FDaEIsQ0FDTjtHQUNIOztDQUVGLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDcEJILElBQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFL0IsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDOzs7QUFFakMsUUFBTSxFQUFBLGtCQUFHO0FBQ1AsUUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRTtBQUN2QixhQUFPOzs7UUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVE7T0FBTyxDQUFDO0tBQ3pDOztBQUVELFdBQU8saUNBQU8sQ0FBQztHQUNoQjs7Q0FFRixDQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNaSCxJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7O0FBRS9CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7O0FBRWpDLFFBQU0sRUFBQSxrQkFBRztBQUNQLFFBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQztBQUNyQyxXQUNFOzs7TUFDRyxLQUFLO0tBQ0YsQ0FDTjtHQUNIOztDQUVGLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDYkgsSUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQzFDLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQzs7QUFFNUMsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLFFBQU0sRUFBRTtBQUNOLFVBQU0sRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7R0FDOUM7QUFDRCxTQUFPLEVBQUU7QUFDUCxTQUFLLEVBQUUsVUFBVSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQzdDLFNBQUssRUFBRSxVQUFVLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDN0MsUUFBSSxFQUFFLFVBQVUsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztHQUM1QztDQUNGLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7QUNaRixJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDL0IsSUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDOztpQkFFckIsVUFBQyxjQUFjLEVBQUs7O0FBRWpDLE1BQU0sU0FBUztBQUVGLGFBRlAsU0FBUyxDQUVELEtBQUssRUFBRSxPQUFPOzRCQUZ0QixTQUFTOztBQUdYLGlDQUhFLFNBQVMsNkNBR0wsS0FBSyxFQUFFLE9BQU8sRUFBRTs7QUFFdEIsVUFBSSxDQUFDLEtBQUssR0FBRztBQUNYLGNBQU0sRUFBRSxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQztPQUNsQyxDQUFDO0tBQ0g7O2NBUkcsU0FBUzs7eUJBQVQsU0FBUztBQVViLFlBQU07ZUFBQSxrQkFBRztBQUNQLGlCQUFPLG9CQUFDLFNBQVMsZUFBSyxJQUFJLENBQUMsS0FBSyxFQUFNLElBQUksQ0FBQyxLQUFLLEVBQUcsQ0FBQztTQUNyRDs7Ozs7O1dBWkcsU0FBUztLQUFpQixLQUFLLENBQUMsU0FBUyxDQWM5QyxDQUFDOztBQUVGLFNBQU8sU0FBUyxDQUFDO0NBQ2xCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN0QkQsSUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQy9CLElBQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQzs7aUJBRXJCLFVBQUMsY0FBYyxFQUFLOztBQUVqQyxNQUFNLFVBQVU7QUFFSCxhQUZQLFVBQVUsQ0FFRixLQUFLLEVBQUUsT0FBTzs0QkFGdEIsVUFBVTs7QUFHWixpQ0FIRSxVQUFVLDZDQUdOLEtBQUssRUFBRSxPQUFPLEVBQUU7O0FBRXRCLFVBQUksQ0FBQyxLQUFLLEdBQUc7QUFDWCxjQUFNLEVBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7T0FDbEMsQ0FBQztLQUNIOztjQVJHLFVBQVU7O3lCQUFWLFVBQVU7QUFVZCxZQUFNO2VBQUEsa0JBQUc7QUFDUCxpQkFBTyxvQkFBQyxTQUFTLGVBQUssSUFBSSxDQUFDLEtBQUssRUFBTSxJQUFJLENBQUMsS0FBSyxFQUFHLENBQUM7U0FDckQ7Ozs7OztXQVpHLFVBQVU7S0FBaUIsS0FBSyxDQUFDLFNBQVMsQ0FjL0MsQ0FBQzs7QUFFRixTQUFPLFVBQVUsQ0FBQztDQUNuQjs7Ozs7OztBQ1pELElBQUksYUFBYSxHQUFHLEVBQUUsQ0FBQzs7QUFFdkIsSUFBTSxNQUFNLEdBQUc7QUFDYixjQUFZLEVBQUEsc0JBQUMsU0FBUyxFQUFFO0FBQ3RCLFFBQUksU0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUU7QUFDMUIsYUFBTyxTQUFTLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztLQUMvQjtBQUNELFdBQU8sYUFBYSxDQUFDO0dBQ3RCO0FBQ0Qsa0JBQWdCLEVBQUEsMEJBQUMsTUFBTSxFQUFFO0FBQ3ZCLGlCQUFhLEdBQUcsTUFBTSxDQUFDO0dBQ3hCO0NBQ0YsQ0FBQzs7QUFFRixNQUFNLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gIyBpbmRleFxuXG4vLyBFeHBvcnQgdGhlIEZvcm1hdGljIFJlYWN0IGNsYXNzIGF0IHRoZSB0b3AgbGV2ZWwuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL2Zvcm1hdGljJyk7XG4iLCJjb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblxuICAgIGNvbnN0IEZpZWxkID0gY29uZmlnLmhlbHBlckNsYXNzKCdmaWVsZCcpO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxGaWVsZCB7Li4udGhpcy5wcm9wc30+XG4gICAgICAgIDx0ZXh0YXJlYSB2YWx1ZT17dGhpcy5wcm9wcy52YWx1ZX0vPlxuICAgICAgPC9GaWVsZD5cbiAgICApO1xuICB9XG5cbn0pO1xuXG4vLyAvLyAjIHN0cmluZyBjb21wb25lbnRcbi8vXG4vLyAvKlxuLy8gUmVuZGVyIGEgZmllbGQgdGhhdCBjYW4gZWRpdCBhIHN0cmluZyB2YWx1ZS5cbi8vICovXG4vL1xuLy8gJ3VzZSBzdHJpY3QnO1xuLy9cbi8vIHZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuLy8gdmFyIFIgPSBSZWFjdC5ET007XG4vLyB2YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG4vL1xuLy8gbW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4vL1xuLy8gICBkaXNwbGF5TmFtZTogJ1N0cmluZycsXG4vL1xuLy8gICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG4vL1xuLy8gICBvbkNoYW5nZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4vLyAgICAgdGhpcy5vbkNoYW5nZVZhbHVlKGV2ZW50LnRhcmdldC52YWx1ZSk7XG4vLyAgIH0sXG4vL1xuLy8gICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbi8vICAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4vLyAgIH0sXG4vL1xuLy8gICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4vL1xuLy8gICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbi8vICAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuLy9cbi8vICAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywge1xuLy8gICAgICAgY29uZmlnOiBjb25maWcsIGZpZWxkOiBmaWVsZCwgcGxhaW46IHRoaXMucHJvcHMucGxhaW5cbi8vICAgICB9LCBSLnRleHRhcmVhKHtcbi8vICAgICAgIHZhbHVlOiBmaWVsZC52YWx1ZSxcbi8vICAgICAgIGNsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSxcbi8vICAgICAgIHJvd3M6IGZpZWxkLnJvd3MgfHwgdGhpcy5wcm9wcy5yb3dzLFxuLy8gICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsXG4vLyAgICAgICBvbkZvY3VzOiB0aGlzLm9uRm9jdXNBY3Rpb24sXG4vLyAgICAgICBvbkJsdXI6IHRoaXMub25CbHVyQWN0aW9uXG4vLyAgICAgfSkpO1xuLy8gICB9XG4vLyB9KTtcbiIsImNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbmNvbnN0IENvbmZpZyA9IHJlcXVpcmUoJy4uLy4uL2NvbmZpZycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgY29uZmlnID0gQ29uZmlnLmZvckNvbXBvbmVudCh0aGlzKTtcblxuICAgIGNvbnN0IExhYmVsID0gY29uZmlnLmhlbHBlckNsYXNzKCdsYWJlbCcpO1xuICAgIGNvbnN0IEhlbHAgPSBjb25maWcuaGVscGVyQ2xhc3MoJ2hlbHAnKTtcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2PlxuICAgICAgICA8TGFiZWwgey4uLnRoaXMucHJvcHN9Lz5cbiAgICAgICAgPEhlbHAgey4uLnRoaXMucHJvcHN9Lz5cbiAgICAgICAge3RoaXMucHJvcHMuY2hpbGRyZW59XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbn0pO1xuXG4vLyAvLyAjIGZpZWxkIGNvbXBvbmVudFxuLy9cbi8vIC8qXG4vLyBVc2VkIGJ5IGFueSBmaWVsZHMgdG8gcHV0IHRoZSBsYWJlbCBhbmQgaGVscCB0ZXh0IGFyb3VuZCB0aGUgZmllbGQuXG4vLyAqL1xuLy9cbi8vICd1c2Ugc3RyaWN0Jztcbi8vXG4vLyB2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbi8vIHZhciBSID0gUmVhY3QuRE9NO1xuLy8gdmFyIF8gPSByZXF1aXJlKCcuLi8uLi91bmRhc2gnKTtcbi8vIHZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcbi8vXG4vLyB2YXIgQ1NTVHJhbnNpdGlvbkdyb3VwID0gUmVhY3QuY3JlYXRlRmFjdG9yeShSZWFjdC5hZGRvbnMuQ1NTVHJhbnNpdGlvbkdyb3VwKTtcbi8vXG4vLyBtb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbi8vXG4vLyAgIGRpc3BsYXlOYW1lOiAnRmllbGQnLFxuLy9cbi8vICAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcbi8vXG4vLyAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuLy8gICAgIHJldHVybiB7XG4vLyAgICAgICBjb2xsYXBzZWQ6IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkSXNDb2xsYXBzZWQodGhpcy5wcm9wcy5maWVsZCkgPyB0cnVlIDogZmFsc2Vcbi8vICAgICB9O1xuLy8gICB9LFxuLy9cbi8vICAgb25DbGlja0xhYmVsOiBmdW5jdGlvbiAoKSB7XG4vLyAgICAgdGhpcy5zZXRTdGF0ZSh7XG4vLyAgICAgICBjb2xsYXBzZWQ6ICF0aGlzLnN0YXRlLmNvbGxhcHNlZFxuLy8gICAgIH0pO1xuLy8gICB9LFxuLy9cbi8vICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4vLyAgICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuLy8gICB9LFxuLy9cbi8vICAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuLy9cbi8vICAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4vL1xuLy8gICAgIGlmICh0aGlzLnByb3BzLnBsYWluKSB7XG4vLyAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5jaGlsZHJlbjtcbi8vICAgICB9XG4vL1xuLy8gICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG4vL1xuLy8gICAgIHZhciBpbmRleCA9IHRoaXMucHJvcHMuaW5kZXg7XG4vLyAgICAgaWYgKCFfLmlzTnVtYmVyKGluZGV4KSkge1xuLy8gICAgICAgdmFyIGtleSA9IHRoaXMucHJvcHMuZmllbGQua2V5O1xuLy8gICAgICAgaW5kZXggPSBfLmlzTnVtYmVyKGtleSkgPyBrZXkgOiB1bmRlZmluZWQ7XG4vLyAgICAgfVxuLy9cbi8vICAgICB2YXIgY2xhc3NlcyA9IF8uZXh0ZW5kKHt9LCB0aGlzLnByb3BzLmNsYXNzZXMpO1xuLy9cbi8vICAgICB2YXIgZXJyb3JzID0gY29uZmlnLmZpZWxkRXJyb3JzKGZpZWxkKTtcbi8vXG4vLyAgICAgZXJyb3JzLmZvckVhY2goZnVuY3Rpb24gKGVycm9yKSB7XG4vLyAgICAgICBjbGFzc2VzWyd2YWxpZGF0aW9uLWVycm9yLScgKyBlcnJvci50eXBlXSA9IHRydWU7XG4vLyAgICAgfSk7XG4vL1xuLy8gICAgIGlmIChjb25maWcuZmllbGRJc1JlcXVpcmVkKGZpZWxkKSkge1xuLy8gICAgICAgY2xhc3Nlcy5yZXF1aXJlZCA9IHRydWU7XG4vLyAgICAgfSBlbHNlIHtcbi8vICAgICAgIGNsYXNzZXMub3B0aW9uYWwgPSB0cnVlO1xuLy8gICAgIH1cbi8vXG4vLyAgICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IGN4KGNsYXNzZXMpLCBzdHlsZToge2Rpc3BsYXk6IChmaWVsZC5oaWRkZW4gPyAnbm9uZScgOiAnJyl9fSxcbi8vICAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdsYWJlbCcsIHtcbi8vICAgICAgICAgY29uZmlnOiBjb25maWcsIGZpZWxkOiBmaWVsZCxcbi8vICAgICAgICAgaW5kZXg6IGluZGV4LCBvbkNsaWNrOiBjb25maWcuZmllbGRJc0NvbGxhcHNpYmxlKGZpZWxkKSA/IHRoaXMub25DbGlja0xhYmVsIDogbnVsbFxuLy8gICAgICAgfSksXG4vLyAgICAgICBDU1NUcmFuc2l0aW9uR3JvdXAoe3RyYW5zaXRpb25OYW1lOiAncmV2ZWFsJ30sXG4vLyAgICAgICAgIHRoaXMuc3RhdGUuY29sbGFwc2VkID8gW10gOiBbXG4vLyAgICAgICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2hlbHAnLCB7XG4vLyAgICAgICAgICAgICBjb25maWc6IGNvbmZpZywgZmllbGQ6IGZpZWxkLFxuLy8gICAgICAgICAgICAga2V5OiAnaGVscCdcbi8vICAgICAgICAgICB9KSxcbi8vICAgICAgICAgICB0aGlzLnByb3BzLmNoaWxkcmVuXG4vLyAgICAgICAgIF1cbi8vICAgICAgIClcbi8vICAgICApO1xuLy8gICB9XG4vLyB9KTtcbiIsImNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgcmVuZGVyKCkge1xuICAgIGlmICh0aGlzLnByb3BzLmhlbHBUZXh0KSB7XG4gICAgICByZXR1cm4gPGRpdj57dGhpcy5wcm9wcy5oZWxwVGV4dH08L2Rpdj47XG4gICAgfVxuXG4gICAgcmV0dXJuIDxzcGFuLz47XG4gIH1cblxufSk7XG5cbi8vIC8vICMgaGVscCBjb21wb25lbnRcbi8vXG4vLyAvKlxuLy8gSnVzdCB0aGUgaGVscCB0ZXh0IGJsb2NrLlxuLy8gKi9cbi8vXG4vLyAndXNlIHN0cmljdCc7XG4vL1xuLy8gdmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG4vLyB2YXIgUiA9IFJlYWN0LkRPTTtcbi8vIHZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcbi8vXG4vLyBtb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbi8vXG4vLyAgIGRpc3BsYXlOYW1lOiAnSGVscCcsXG4vL1xuLy8gICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuLy9cbi8vICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4vLyAgICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuLy8gICB9LFxuLy9cbi8vICAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuLy9cbi8vICAgICB2YXIgaGVscFRleHQgPSB0aGlzLnByb3BzLmNvbmZpZy5maWVsZEhlbHBUZXh0KHRoaXMucHJvcHMuZmllbGQpO1xuLy9cbi8vICAgICByZXR1cm4gaGVscFRleHQgP1xuLy8gICAgICAgUi5kaXYoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSwgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw6IHtfX2h0bWw6IGhlbHBUZXh0fX0pIDpcbi8vICAgICAgIFIuc3BhbihudWxsKTtcbi8vICAgfVxuLy8gfSk7XG4iLCJjb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBsYWJlbCA9IHRoaXMucHJvcHMubGFiZWwgfHwgJyc7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+XG4gICAgICAgIHtsYWJlbH1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxufSk7XG5cbi8vIC8vICMgbGFiZWwgY29tcG9uZW50XG4vL1xuLy8gLypcbi8vIEp1c3QgdGhlIGxhYmVsIGZvciBhIGZpZWxkLlxuLy8gKi9cbi8vXG4vLyAndXNlIHN0cmljdCc7XG4vL1xuLy8gdmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG4vLyB2YXIgUiA9IFJlYWN0LkRPTTtcbi8vIHZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcbi8vXG4vLyBtb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbi8vXG4vLyAgIGRpc3BsYXlOYW1lOiAnTGFiZWwnLFxuLy9cbi8vICAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcbi8vXG4vLyAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuLy8gICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbi8vICAgfSxcbi8vXG4vLyAgIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbi8vICAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4vLyAgICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcbi8vXG4vLyAgICAgdmFyIGZpZWxkTGFiZWwgPSBjb25maWcuZmllbGRMYWJlbChmaWVsZCk7XG4vL1xuLy8gICAgIHZhciBsYWJlbCA9IG51bGw7XG4vLyAgICAgaWYgKHR5cGVvZiB0aGlzLnByb3BzLmluZGV4ID09PSAnbnVtYmVyJykge1xuLy8gICAgICAgbGFiZWwgPSAnJyArICh0aGlzLnByb3BzLmluZGV4ICsgMSkgKyAnLic7XG4vLyAgICAgICBpZiAoZmllbGRMYWJlbCkge1xuLy8gICAgICAgICBsYWJlbCA9IGxhYmVsICsgJyAnICsgZmllbGRMYWJlbDtcbi8vICAgICAgIH1cbi8vICAgICB9XG4vL1xuLy8gICAgIGlmIChmaWVsZExhYmVsIHx8IGxhYmVsKSB7XG4vLyAgICAgICB2YXIgdGV4dCA9IGxhYmVsIHx8IGZpZWxkTGFiZWw7XG4vLyAgICAgICBpZiAodGhpcy5wcm9wcy5vbkNsaWNrKSB7XG4vLyAgICAgICAgIHRleHQgPSBSLmEoe2hyZWY6ICdKYXZhU2NyaXB0JyArICc6Jywgb25DbGljazogdGhpcy5wcm9wcy5vbkNsaWNrfSwgdGV4dCk7XG4vLyAgICAgICB9XG4vLyAgICAgICBsYWJlbCA9IFIubGFiZWwoe30sIHRleHQpO1xuLy8gICAgIH1cbi8vXG4vLyAgICAgdmFyIHJlcXVpcmVkT3JOb3Q7XG4vL1xuLy8gICAgIGlmICghY29uZmlnLmZpZWxkSGFzVmFsdWVDaGlsZHJlbihmaWVsZCkpIHtcbi8vICAgICAgIHJlcXVpcmVkT3JOb3QgPSBSLnNwYW4oe1xuLy8gICAgICAgICBjbGFzc05hbWU6IGNvbmZpZy5maWVsZElzUmVxdWlyZWQoZmllbGQpID8gJ3JlcXVpcmVkLXRleHQnIDogJ25vdC1yZXF1aXJlZC10ZXh0J1xuLy8gICAgICAgfSk7XG4vLyAgICAgfVxuLy9cbi8vICAgICByZXR1cm4gUi5kaXYoe1xuLy8gICAgICAgY2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpXG4vLyAgICAgfSxcbi8vICAgICAgIGxhYmVsLFxuLy8gICAgICAgJyAnLFxuLy8gICAgICAgcmVxdWlyZWRPck5vdFxuLy8gICAgICk7XG4vLyAgIH1cbi8vIH0pO1xuIiwiY29uc3Qgd3JhcEZpZWxkID0gcmVxdWlyZSgnLi93cmFwLWZpZWxkJyk7XG5jb25zdCB3cmFwSGVscGVyID0gcmVxdWlyZSgnLi93cmFwLWhlbHBlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZmllbGRzOiB7XG4gICAgU3RyaW5nOiB3cmFwRmllbGQocmVxdWlyZSgnLi9maWVsZHMvc3RyaW5nJykpXG4gIH0sXG4gIGhlbHBlcnM6IHtcbiAgICBGaWVsZDogd3JhcEhlbHBlcihyZXF1aXJlKCcuL2hlbHBlcnMvZmllbGQnKSksXG4gICAgTGFiZWw6IHdyYXBIZWxwZXIocmVxdWlyZSgnLi9oZWxwZXJzL2xhYmVsJykpLFxuICAgIEhlbHA6IHdyYXBIZWxwZXIocmVxdWlyZSgnLi9oZWxwZXJzL2hlbHAnKSlcbiAgfVxufTtcbiIsImNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbmNvbnN0IENvbmZpZyA9IHJlcXVpcmUoJy4uL2NvbmZpZycpO1xuXG5leHBvcnQgZGVmYXVsdCAoRmllbGRDb21wb25lbnQpID0+IHtcblxuICBjb25zdCBXcmFwRmllbGQgPSBjbGFzcyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcywgY29udGV4dCkge1xuICAgICAgc3VwZXIocHJvcHMsIGNvbnRleHQpO1xuXG4gICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICBjb25maWc6IENvbmZpZy5mb3JDb21wb25lbnQodGhpcylcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgcmV0dXJuIDxDb21wb25lbnQgey4uLnRoaXMucHJvcHN9IHsuLi50aGlzLnN0YXRlfS8+O1xuICAgIH1cblxuICB9O1xuXG4gIHJldHVybiBXcmFwRmllbGQ7XG59O1xuIiwiY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuY29uc3QgQ29uZmlnID0gcmVxdWlyZSgnLi4vY29uZmlnJyk7XG5cbmV4cG9ydCBkZWZhdWx0IChGaWVsZENvbXBvbmVudCkgPT4ge1xuXG4gIGNvbnN0IFdyYXBIZWxwZXIgPSBjbGFzcyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcywgY29udGV4dCkge1xuICAgICAgc3VwZXIocHJvcHMsIGNvbnRleHQpO1xuXG4gICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICBjb25maWc6IENvbmZpZy5mb3JDb21wb25lbnQodGhpcylcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgcmV0dXJuIDxDb21wb25lbnQgey4uLnRoaXMucHJvcHN9IHsuLi50aGlzLnN0YXRlfS8+O1xuICAgIH1cblxuICB9O1xuXG4gIHJldHVybiBXcmFwSGVscGVyO1xufTtcbiIsIi8vICMgZGVmYXVsdC1jb25maWdcblxuLypcblRoaXMgaXMgdGhlIGRlZmF1bHQgY29uZmlndXJhdGlvbiBwbHVnaW4gZm9yIGZvcm1hdGljLiBUbyBjaGFuZ2UgZm9ybWF0aWMnc1xuYmVoYXZpb3IsIGp1c3QgY3JlYXRlIHlvdXIgb3duIHBsdWdpbiBmdW5jdGlvbiB0aGF0IHJldHVybnMgYW4gb2JqZWN0IHdpdGhcbm1ldGhvZHMgeW91IHdhbnQgdG8gYWRkIG9yIG92ZXJyaWRlLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5sZXQgZGVmYXVsdENvbmZpZyA9IHt9O1xuXG5jb25zdCBDb25maWcgPSB7XG4gIGZvckNvbXBvbmVudChjb21wb25lbnQpIHtcbiAgICBpZiAoY29tcG9uZW50LnByb3BzLmNvbmZpZykge1xuICAgICAgcmV0dXJuIGNvbXBvbmVudC5wcm9wcy5jb25maWc7XG4gICAgfVxuICAgIHJldHVybiBkZWZhdWx0Q29uZmlnO1xuICB9LFxuICBzZXREZWZhdWx0Q29uZmlnKGNvbmZpZykge1xuICAgIGRlZmF1bHRDb25maWcgPSBjb25maWc7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ29uZmlnO1xuXG4vLyBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjb25maWcpIHtcbi8vXG4vLyAgIHZhciBkZWxlZ2F0ZVRvID0gdXRpbHMuZGVsZWdhdG9yKGNvbmZpZyk7XG4vL1xuLy8gICByZXR1cm4ge1xuLy9cbi8vICAgICAvLyBOb3JtYWxpemUgYW4gZWxlbWVudCBuYW1lLlxuLy8gICAgIGVsZW1lbnROYW1lKG5hbWUpIHtcbi8vICAgICAgIHJldHVybiB1dGlscy5kYXNoVG9QYXNjYWwobmFtZSk7XG4vLyAgICAgfSxcbi8vXG4vLyAgICAgY2xhc3MobmFtZSkge1xuLy8gICAgICAgaWYgKCFuYW1lKSB7XG4vLyAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ29tcG9uZW50IGNsYXNzIG5hbWUgbXVzdCBiZSBzcGVjaWZpZWQgdG8gcmV0cmlldmUgY29tcG9uZW50IGNsYXNzLicpO1xuLy8gICAgICAgfVxuLy8gICAgICAgbmFtZSA9IGNvbmZpZy5lbGVtZW50TmFtZShuYW1lKTtcbi8vICAgICAgIGlmIChDb21wb25lbnRzW25hbWVdKSB7XG4vLyAgICAgICAgIHJldHVybiBDb21wb25lbnRzW25hbWVdO1xuLy8gICAgICAgfVxuLy8gICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb21wb25lbnQgY2xhc3MgJHtuYW1lfSBub3QgZm91bmQuYCk7XG4vLyAgICAgfSxcbi8vXG4vLyAgICAgaGVscGVyQ2xhc3MobmFtZSkge1xuLy8gICAgICAgaWYgKCFuYW1lKSB7XG4vLyAgICAgICAgIHRocm93IG5ldyBFcnJvcignSGVscGVyIGNsYXNzIG5hbWUgbXVzdCBiZSBzcGVjaWZpZWQgdG8gcmV0cmlldmUgY29tcG9uZW50IGNsYXNzLicpO1xuLy8gICAgICAgfVxuLy8gICAgICAgbmFtZSA9IGNvbmZpZy5lbGVtZW50TmFtZShuYW1lKTtcbi8vICAgICAgIHJldHVybiBjb25maWcuY2xhc3MobmFtZSk7XG4vLyAgICAgfSxcbi8vXG4vLyAgICAgZmllbGRDbGFzcyhuYW1lKSB7XG4vLyAgICAgICBpZiAoIW5hbWUpIHtcbi8vICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGaWVsZCBjbGFzcyBuYW1lIG11c3QgYmUgc3BlY2lmaWVkIHRvIHJldHJpZXZlIGNvbXBvbmVudCBjbGFzcy4nKTtcbi8vICAgICAgIH1cbi8vICAgICAgIG5hbWUgKz0gJy1maWVsZCc7XG4vLyAgICAgICBuYW1lID0gY29uZmlnLmVsZW1lbnROYW1lKG5hbWUpO1xuLy8gICAgICAgcmV0dXJuIGNvbmZpZy5jbGFzcyhuYW1lKTtcbi8vICAgICB9XG5cbiAgICAvLyAvLyBSZW5kZXIgdGhlIHJvb3QgZm9ybWF0aWMgY29tcG9uZW50XG4gICAgLy8gcmVuZGVyRm9ybWF0aWNDb21wb25lbnQ6IGZ1bmN0aW9uIChjb21wb25lbnQpIHtcbiAgICAvL1xuICAgIC8vICAgY29uc3QgcHJvcHMgPSBjb21wb25lbnQucHJvcHM7XG4gICAgLy9cbiAgICAvLyAgIC8vdmFyIGZpZWxkID0gY29uZmlnLmNyZWF0ZVJvb3RGaWVsZChwcm9wcyk7XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiAoXG4gICAgLy8gICAgIDxkaXYgY2xhc3NOYW1lPVwiZm9ybWF0aWNcIj5cbiAgICAvL1xuICAgIC8vICAgICA8L2Rpdj5cbiAgICAvLyAgICk7XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiAnZm9ybWF0aWMnfSxcbiAgICAvLyAgICAgY29uZmlnLmNyZWF0ZUZpZWxkRWxlbWVudCh7ZmllbGQ6IGZpZWxkLCBvbkNoYW5nZTogY29tcG9uZW50Lm9uQ2hhbmdlLCBvbkFjdGlvbjogY29tcG9uZW50Lm9uQWN0aW9ufSlcbiAgICAvLyAgICk7XG4gICAgLy8gfSxcblxuICAgIC8vIC8vIENyZWF0ZSBhIGZpZWxkIGVsZW1lbnQgZ2l2ZW4gc29tZSBwcm9wcy4gVXNlIGNvbnRleHQgdG8gZGV0ZXJtaW5lIG5hbWUuXG4gICAgLy8gY3JlYXRlRmllbGRFbGVtZW50OiBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAvL1xuICAgIC8vICAgdmFyIG5hbWUgPSBjb25maWcuZmllbGRUeXBlTmFtZShwcm9wcy5maWVsZCk7XG4gICAgLy9cbiAgICAvLyAgIGlmIChjb25maWcuaGFzRWxlbWVudEZhY3RvcnkobmFtZSkpIHtcbiAgICAvLyAgICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KG5hbWUsIHByb3BzKTtcbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdVbmtub3duRmllbGQnLCBwcm9wcyk7XG4gICAgLy8gfSxcblxuICAgIC8vXG4gICAgLy8gLy8gRmllbGQgZWxlbWVudCBmYWN0b3JpZXMuIENyZWF0ZSBmaWVsZCBlbGVtZW50cy5cbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfRmllbGRzOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvZmllbGRzJykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9TdHJpbmc6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9zdHJpbmcnKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X1NpbmdsZUxpbmVTdHJpbmc6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9zaW5nbGUtbGluZS1zdHJpbmcnKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X1NlbGVjdDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL3NlbGVjdCcpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfUHJldHR5U2VsZWN0OiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvcHJldHR5LXNlbGVjdCcpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfQm9vbGVhbjogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL2Jvb2xlYW4nKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X1ByZXR0eUJvb2xlYW46IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9wcmV0dHktYm9vbGVhbicpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfQ2hlY2tib3hCb29sZWFuOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvY2hlY2tib3gtYm9vbGVhbicpKSxcbiAgICAvL1xuICAgIC8vIC8vIGNyZWF0ZUVsZW1lbnRfUHJldHR5VGV4dDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL3ByZXR0eS10ZXh0JykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9QcmV0dHlUZXh0OiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvcHJldHR5LXRleHQyJykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9BcnJheTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL2FycmF5JykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9DaGVja2JveEFycmF5OiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvY2hlY2tib3gtYXJyYXknKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X09iamVjdDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL29iamVjdCcpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfSnNvbjogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL2pzb24nKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X1Vua25vd25GaWVsZDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL3Vua25vd24nKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X0NvcHk6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9jb3B5JykpLFxuICAgIC8vXG4gICAgLy9cbiAgICAvLyAvLyBPdGhlciBlbGVtZW50IGZhY3Rvcmllcy4gQ3JlYXRlIGhlbHBlciBlbGVtZW50cyB1c2VkIGJ5IGZpZWxkIGNvbXBvbmVudHMuXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X0ZpZWxkOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2ZpZWxkJykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9MYWJlbDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9sYWJlbCcpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfSGVscDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9oZWxwJykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9DaG9pY2VzOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2Nob2ljZXMnKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X0xvYWRpbmdDaG9pY2VzOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2xvYWRpbmctY2hvaWNlcycpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfQXJyYXlDb250cm9sOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2FycmF5LWNvbnRyb2wnKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X0FycmF5SXRlbUNvbnRyb2w6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvYXJyYXktaXRlbS1jb250cm9sJykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9BcnJheUl0ZW1WYWx1ZTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9hcnJheS1pdGVtLXZhbHVlJykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9BcnJheUl0ZW06IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvYXJyYXktaXRlbScpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfRmllbGRUZW1wbGF0ZUNob2ljZXM6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvZmllbGQtdGVtcGxhdGUtY2hvaWNlcycpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfQWRkSXRlbTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9hZGQtaXRlbScpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfUmVtb3ZlSXRlbTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9yZW1vdmUtaXRlbScpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfTW92ZUl0ZW1Gb3J3YXJkOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL21vdmUtaXRlbS1mb3J3YXJkJykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9Nb3ZlSXRlbUJhY2s6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvbW92ZS1pdGVtLWJhY2snKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X09iamVjdENvbnRyb2w6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWNvbnRyb2wnKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X09iamVjdEl0ZW1Db250cm9sOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL29iamVjdC1pdGVtLWNvbnRyb2wnKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X09iamVjdEl0ZW1WYWx1ZTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9vYmplY3QtaXRlbS12YWx1ZScpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfT2JqZWN0SXRlbUtleTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9vYmplY3QtaXRlbS1rZXknKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X09iamVjdEl0ZW06IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWl0ZW0nKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X1NlbGVjdFZhbHVlOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL3NlbGVjdC12YWx1ZScpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfUHJldHR5U2VsZWN0VmFsdWU6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvcHJldHR5LXNlbGVjdC12YWx1ZScpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfU2FtcGxlOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL3NhbXBsZScpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfSW5zZXJ0QnV0dG9uOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2luc2VydC1idXR0b24nKSksXG4gICAgLy9cbiAgICAvL1xuICAgIC8vIC8vIEZpZWxkIGRlZmF1bHQgdmFsdWUgZmFjdG9yaWVzLiBHaXZlIGEgZGVmYXVsdCB2YWx1ZSBmb3IgYSBzcGVjaWZpYyB0eXBlLlxuICAgIC8vXG4gICAgLy8gY3JlYXRlRGVmYXVsdFZhbHVlX1N0cmluZzogZnVuY3Rpb24gKC8qIGZpZWxkVGVtcGxhdGUgKi8pIHtcbiAgICAvLyAgIHJldHVybiAnJztcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRGVmYXVsdFZhbHVlX09iamVjdDogZnVuY3Rpb24gKC8qIGZpZWxkVGVtcGxhdGUgKi8pIHtcbiAgICAvLyAgIHJldHVybiB7fTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRGVmYXVsdFZhbHVlX0FycmF5OiBmdW5jdGlvbiAoLyogZmllbGRUZW1wbGF0ZSAqLykge1xuICAgIC8vICAgcmV0dXJuIFtdO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyBjcmVhdGVEZWZhdWx0VmFsdWVfQm9vbGVhbjogZnVuY3Rpb24gKC8qIGZpZWxkVGVtcGxhdGUgKi8pIHtcbiAgICAvLyAgIHJldHVybiBmYWxzZTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRGVmYXVsdFZhbHVlX0ZpZWxkczogZGVsZWdhdGVUbygnY3JlYXRlRGVmYXVsdFZhbHVlX09iamVjdCcpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRGVmYXVsdFZhbHVlX1NpbmdsZUxpbmVTdHJpbmc6IGRlbGVnYXRlVG8oJ2NyZWF0ZURlZmF1bHRWYWx1ZV9TdHJpbmcnKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZURlZmF1bHRWYWx1ZV9TZWxlY3Q6IGRlbGVnYXRlVG8oJ2NyZWF0ZURlZmF1bHRWYWx1ZV9TdHJpbmcnKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZURlZmF1bHRWYWx1ZV9Kc29uOiBkZWxlZ2F0ZVRvKCdjcmVhdGVEZWZhdWx0VmFsdWVfT2JqZWN0JyksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVEZWZhdWx0VmFsdWVfQ2hlY2tib3hBcnJheTogZGVsZWdhdGVUbygnY3JlYXRlRGVmYXVsdFZhbHVlX0FycmF5JyksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVEZWZhdWx0VmFsdWVfQ2hlY2tib3hCb29sZWFuOiBkZWxlZ2F0ZVRvKCdjcmVhdGVEZWZhdWx0VmFsdWVfQm9vbGVhbicpLFxuICAgIC8vXG4gICAgLy9cbiAgICAvLyAvLyBGaWVsZCB2YWx1ZSBjb2VyY2Vycy4gQ29lcmNlIGEgdmFsdWUgaW50byBhIHZhbHVlIGFwcHJvcHJpYXRlIGZvciBhIHNwZWNpZmljIHR5cGUuXG4gICAgLy9cbiAgICAvLyBjb2VyY2VWYWx1ZV9TdHJpbmc6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlLCB2YWx1ZSkge1xuICAgIC8vICAgaWYgKF8uaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgLy8gICAgIHJldHVybiB2YWx1ZTtcbiAgICAvLyAgIH1cbiAgICAvLyAgIGlmIChfLmlzVW5kZWZpbmVkKHZhbHVlKSB8fCB2YWx1ZSA9PT0gbnVsbCkge1xuICAgIC8vICAgICByZXR1cm4gJyc7XG4gICAgLy8gICB9XG4gICAgLy8gICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyBjb2VyY2VWYWx1ZV9PYmplY3Q6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlLCB2YWx1ZSkge1xuICAgIC8vICAgaWYgKCFfLmlzT2JqZWN0KHZhbHVlKSkge1xuICAgIC8vICAgICByZXR1cm4ge307XG4gICAgLy8gICB9XG4gICAgLy8gICByZXR1cm4gdmFsdWU7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIGNvZXJjZVZhbHVlX0FycmF5OiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSwgdmFsdWUpIHtcbiAgICAvLyAgIGlmICghXy5pc0FycmF5KHZhbHVlKSkge1xuICAgIC8vICAgICByZXR1cm4gW3ZhbHVlXTtcbiAgICAvLyAgIH1cbiAgICAvLyAgIHJldHVybiB2YWx1ZTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gY29lcmNlVmFsdWVfQm9vbGVhbjogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUsIHZhbHVlKSB7XG4gICAgLy8gICByZXR1cm4gY29uZmlnLmNvZXJjZVZhbHVlVG9Cb29sZWFuKHZhbHVlKTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gY29lcmNlVmFsdWVfRmllbGRzOiBkZWxlZ2F0ZVRvKCdjb2VyY2VWYWx1ZV9PYmplY3QnKSxcbiAgICAvL1xuICAgIC8vIGNvZXJjZVZhbHVlX1NpbmdsZUxpbmVTdHJpbmc6IGRlbGVnYXRlVG8oJ2NvZXJjZVZhbHVlX1N0cmluZycpLFxuICAgIC8vXG4gICAgLy8gY29lcmNlVmFsdWVfU2VsZWN0OiBkZWxlZ2F0ZVRvKCdjb2VyY2VWYWx1ZV9TdHJpbmcnKSxcbiAgICAvL1xuICAgIC8vIGNvZXJjZVZhbHVlX0pzb246IGRlbGVnYXRlVG8oJ2NvZXJjZVZhbHVlX09iamVjdCcpLFxuICAgIC8vXG4gICAgLy8gY29lcmNlVmFsdWVfQ2hlY2tib3hBcnJheTogZGVsZWdhdGVUbygnY29lcmNlVmFsdWVfQXJyYXknKSxcbiAgICAvL1xuICAgIC8vIGNvZXJjZVZhbHVlX0NoZWNrYm94Qm9vbGVhbjogZGVsZWdhdGVUbygnY29lcmNlVmFsdWVfQm9vbGVhbicpLFxuICAgIC8vXG4gICAgLy9cbiAgICAvLyAvLyBGaWVsZCBjaGlsZCBmaWVsZHMgZmFjdG9yaWVzLCBzbyBzb21lIHR5cGVzIGNhbiBoYXZlIGR5bmFtaWMgY2hpbGRyZW4uXG4gICAgLy9cbiAgICAvLyBjcmVhdGVDaGlsZEZpZWxkc19BcnJheTogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiBmaWVsZC52YWx1ZS5tYXAoZnVuY3Rpb24gKGFycmF5SXRlbSwgaSkge1xuICAgIC8vICAgICB2YXIgY2hpbGRGaWVsZFRlbXBsYXRlID0gY29uZmlnLmNoaWxkRmllbGRUZW1wbGF0ZUZvclZhbHVlKGZpZWxkLCBhcnJheUl0ZW0pO1xuICAgIC8vXG4gICAgLy8gICAgIHZhciBjaGlsZEZpZWxkID0gY29uZmlnLmNyZWF0ZUNoaWxkRmllbGQoZmllbGQsIHtcbiAgICAvLyAgICAgICBmaWVsZFRlbXBsYXRlOiBjaGlsZEZpZWxkVGVtcGxhdGUsIGtleTogaSwgZmllbGRJbmRleDogaSwgdmFsdWU6IGFycmF5SXRlbVxuICAgIC8vICAgICB9KTtcbiAgICAvL1xuICAgIC8vICAgICByZXR1cm4gY2hpbGRGaWVsZDtcbiAgICAvLyAgIH0pO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyBjcmVhdGVDaGlsZEZpZWxkc19PYmplY3Q6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIC8vXG4gICAgLy8gICByZXR1cm4gT2JqZWN0LmtleXMoZmllbGQudmFsdWUpLm1hcChmdW5jdGlvbiAoa2V5LCBpKSB7XG4gICAgLy8gICAgIHZhciBjaGlsZEZpZWxkVGVtcGxhdGUgPSBjb25maWcuY2hpbGRGaWVsZFRlbXBsYXRlRm9yVmFsdWUoZmllbGQsIGZpZWxkLnZhbHVlW2tleV0pO1xuICAgIC8vXG4gICAgLy8gICAgIHZhciBjaGlsZEZpZWxkID0gY29uZmlnLmNyZWF0ZUNoaWxkRmllbGQoZmllbGQsIHtcbiAgICAvLyAgICAgICBmaWVsZFRlbXBsYXRlOiBjaGlsZEZpZWxkVGVtcGxhdGUsIGtleToga2V5LCBmaWVsZEluZGV4OiBpLCB2YWx1ZTogZmllbGQudmFsdWVba2V5XVxuICAgIC8vICAgICB9KTtcbiAgICAvL1xuICAgIC8vICAgICByZXR1cm4gY2hpbGRGaWVsZDtcbiAgICAvLyAgIH0pO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBDaGVjayBpZiB0aGVyZSBpcyBhIGZhY3RvcnkgZm9yIHRoZSBuYW1lLlxuICAgIC8vIGhhc0VsZW1lbnRGYWN0b3J5OiBmdW5jdGlvbiAobmFtZSkge1xuICAgIC8vXG4gICAgLy8gICByZXR1cm4gY29uZmlnWydjcmVhdGVFbGVtZW50XycgKyBuYW1lXSA/IHRydWUgOiBmYWxzZTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gQ3JlYXRlIGFuIGVsZW1lbnQgZ2l2ZW4gYSBuYW1lLCBwcm9wcywgYW5kIGNoaWxkcmVuLlxuICAgIC8vIGNyZWF0ZUVsZW1lbnQ6IGZ1bmN0aW9uIChuYW1lLCBwcm9wcywgY2hpbGRyZW4pIHtcbiAgICAvL1xuICAgIC8vICAgaWYgKCFwcm9wcy5jb25maWcpIHtcbiAgICAvLyAgICAgcHJvcHMgPSBfLmV4dGVuZCh7fSwgcHJvcHMsIHtjb25maWc6IGNvbmZpZ30pO1xuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICBuYW1lID0gY29uZmlnLmVsZW1lbnROYW1lKG5hbWUpO1xuICAgIC8vXG4gICAgLy8gICBpZiAoY29uZmlnWydjcmVhdGVFbGVtZW50XycgKyBuYW1lXSkge1xuICAgIC8vICAgICByZXR1cm4gY29uZmlnWydjcmVhdGVFbGVtZW50XycgKyBuYW1lXShwcm9wcywgY2hpbGRyZW4pO1xuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICBpZiAobmFtZSAhPT0gJ1Vua25vd24nKSB7XG4gICAgLy8gICAgIGlmIChjb25maWcuaGFzRWxlbWVudEZhY3RvcnkoJ1Vua25vd24nKSkge1xuICAgIC8vICAgICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnVW5rbm93bicsIHByb3BzLCBjaGlsZHJlbik7XG4gICAgLy8gICAgIH1cbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgdGhyb3cgbmV3IEVycm9yKCdGYWN0b3J5IG5vdCBmb3VuZCBmb3I6ICcgKyBuYW1lKTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gQ3JlYXRlIGEgZmllbGQgZWxlbWVudCBnaXZlbiBzb21lIHByb3BzLiBVc2UgY29udGV4dCB0byBkZXRlcm1pbmUgbmFtZS5cbiAgICAvLyBjcmVhdGVGaWVsZEVsZW1lbnQ6IGZ1bmN0aW9uIChwcm9wcykge1xuICAgIC8vXG4gICAgLy8gICB2YXIgbmFtZSA9IGNvbmZpZy5maWVsZFR5cGVOYW1lKHByb3BzLmZpZWxkKTtcbiAgICAvL1xuICAgIC8vICAgaWYgKGNvbmZpZy5oYXNFbGVtZW50RmFjdG9yeShuYW1lKSkge1xuICAgIC8vICAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQobmFtZSwgcHJvcHMpO1xuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ1Vua25vd25GaWVsZCcsIHByb3BzKTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gUmVuZGVyIHRoZSByb290IGZvcm1hdGljIGNvbXBvbmVudFxuICAgIC8vIHJlbmRlckZvcm1hdGljQ29tcG9uZW50OiBmdW5jdGlvbiAoY29tcG9uZW50KSB7XG4gICAgLy9cbiAgICAvLyAgIHZhciBwcm9wcyA9IGNvbXBvbmVudC5wcm9wcztcbiAgICAvL1xuICAgIC8vICAgdmFyIGZpZWxkID0gY29uZmlnLmNyZWF0ZVJvb3RGaWVsZChwcm9wcyk7XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiAnZm9ybWF0aWMnfSxcbiAgICAvLyAgICAgY29uZmlnLmNyZWF0ZUZpZWxkRWxlbWVudCh7ZmllbGQ6IGZpZWxkLCBvbkNoYW5nZTogY29tcG9uZW50Lm9uQ2hhbmdlLCBvbkFjdGlvbjogY29tcG9uZW50Lm9uQWN0aW9ufSlcbiAgICAvLyAgICk7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIFJlbmRlciBhbnkgY29tcG9uZW50LlxuICAgIC8vIHJlbmRlckNvbXBvbmVudDogZnVuY3Rpb24gKGNvbXBvbmVudCkge1xuICAgIC8vXG4gICAgLy8gICB2YXIgbmFtZSA9IGNvbXBvbmVudC5jb25zdHJ1Y3Rvci5kaXNwbGF5TmFtZTtcbiAgICAvL1xuICAgIC8vICAgaWYgKGNvbmZpZ1sncmVuZGVyQ29tcG9uZW50XycgKyBuYW1lXSkge1xuICAgIC8vICAgICByZXR1cm4gY29uZmlnWydyZW5kZXJDb21wb25lbnRfJyArIG5hbWVdKGNvbXBvbmVudCk7XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiBjb21wb25lbnQucmVuZGVyRGVmYXVsdCgpO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBSZW5kZXIgZmllbGQgY29tcG9uZW50cy5cbiAgICAvLyByZW5kZXJGaWVsZENvbXBvbmVudDogZnVuY3Rpb24gKGNvbXBvbmVudCkge1xuICAgIC8vXG4gICAgLy8gICByZXR1cm4gY29uZmlnLnJlbmRlckNvbXBvbmVudChjb21wb25lbnQpO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBOb3JtYWxpemUgYW4gZWxlbWVudCBuYW1lLlxuICAgIC8vIGVsZW1lbnROYW1lOiBmdW5jdGlvbiAobmFtZSkge1xuICAgIC8vICAgcmV0dXJuIHV0aWxzLmRhc2hUb1Bhc2NhbChuYW1lKTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gVHlwZSBhbGlhc2VzLlxuICAgIC8vXG4gICAgLy8gYWxpYXNfRGljdDogJ09iamVjdCcsXG4gICAgLy9cbiAgICAvLyBhbGlhc19Cb29sOiAnQm9vbGVhbicsXG4gICAgLy9cbiAgICAvLyBhbGlhc19QcmV0dHlUZXh0YXJlYTogJ1ByZXR0eVRleHQnLFxuICAgIC8vXG4gICAgLy8gYWxpYXNfU2luZ2xlTGluZVN0cmluZzogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcbiAgICAvLyAgIGlmIChmaWVsZFRlbXBsYXRlLnJlcGxhY2VDaG9pY2VzKSB7XG4gICAgLy8gICAgIHJldHVybiAnUHJldHR5VGV4dCc7XG4gICAgLy8gICB9IGVsc2UgaWYgKGZpZWxkVGVtcGxhdGUuY2hvaWNlcykge1xuICAgIC8vICAgICByZXR1cm4gJ1NlbGVjdCc7XG4gICAgLy8gICB9XG4gICAgLy8gICByZXR1cm4gJ1NpbmdsZUxpbmVTdHJpbmcnO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyBhbGlhc19TdHJpbmc6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgLy9cbiAgICAvLyAgIGlmIChmaWVsZFRlbXBsYXRlLnJlcGxhY2VDaG9pY2VzKSB7XG4gICAgLy8gICAgIHJldHVybiAnUHJldHR5VGV4dCc7XG4gICAgLy8gICB9IGVsc2UgaWYgKGZpZWxkVGVtcGxhdGUuY2hvaWNlcykge1xuICAgIC8vICAgICByZXR1cm4gJ1NlbGVjdCc7XG4gICAgLy8gICB9IGVsc2UgaWYgKGNvbmZpZy5maWVsZFRlbXBsYXRlSXNTaW5nbGVMaW5lKGZpZWxkVGVtcGxhdGUpKSB7XG4gICAgLy8gICAgIHJldHVybiAnU2luZ2xlTGluZVN0cmluZyc7XG4gICAgLy8gICB9XG4gICAgLy8gICByZXR1cm4gJ1N0cmluZyc7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIGFsaWFzX1RleHQ6IGRlbGVnYXRlVG8oJ2FsaWFzX1N0cmluZycpLFxuICAgIC8vXG4gICAgLy8gYWxpYXNfVW5pY29kZTogZGVsZWdhdGVUbygnYWxpYXNfU2luZ2xlTGluZVN0cmluZycpLFxuICAgIC8vXG4gICAgLy8gYWxpYXNfU3RyOiBkZWxlZ2F0ZVRvKCdhbGlhc19TaW5nbGVMaW5lU3RyaW5nJyksXG4gICAgLy9cbiAgICAvLyBhbGlhc19MaXN0OiAnQXJyYXknLFxuICAgIC8vXG4gICAgLy8gYWxpYXNfQ2hlY2tib3hMaXN0OiAnQ2hlY2tib3hBcnJheScsXG4gICAgLy9cbiAgICAvLyBhbGlhc19GaWVsZHNldDogJ0ZpZWxkcycsXG4gICAgLy9cbiAgICAvLyBhbGlhc19DaGVja2JveDogJ0NoZWNrYm94Qm9vbGVhbicsXG4gICAgLy9cbiAgICAvLyAvLyBGaWVsZCBmYWN0b3J5XG4gICAgLy9cbiAgICAvLyAvLyBHaXZlbiBhIGZpZWxkLCBleHBhbmQgYWxsIGNoaWxkIGZpZWxkcyByZWN1cnNpdmVseSB0byBnZXQgdGhlIGRlZmF1bHRcbiAgICAvLyAvLyB2YWx1ZXMgb2YgYWxsIGZpZWxkcy5cbiAgICAvLyBpbmZsYXRlRmllbGRWYWx1ZTogZnVuY3Rpb24gKGZpZWxkLCBmaWVsZEhhbmRsZXIpIHtcbiAgICAvL1xuICAgIC8vICAgaWYgKGZpZWxkSGFuZGxlcikge1xuICAgIC8vICAgICB2YXIgc3RvcCA9IGZpZWxkSGFuZGxlcihmaWVsZCk7XG4gICAgLy8gICAgIGlmIChzdG9wID09PSBmYWxzZSkge1xuICAgIC8vICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgLy8gICAgIH1cbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgaWYgKGNvbmZpZy5maWVsZEhhc1ZhbHVlQ2hpbGRyZW4oZmllbGQpKSB7XG4gICAgLy8gICAgIHZhciB2YWx1ZSA9IF8uY2xvbmUoZmllbGQudmFsdWUpO1xuICAgIC8vICAgICB2YXIgY2hpbGRGaWVsZHMgPSBjb25maWcuY3JlYXRlQ2hpbGRGaWVsZHMoZmllbGQpO1xuICAgIC8vICAgICBjaGlsZEZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uIChjaGlsZEZpZWxkKSB7XG4gICAgLy8gICAgICAgaWYgKGNvbmZpZy5pc0tleShjaGlsZEZpZWxkLmtleSkpIHtcbiAgICAvLyAgICAgICAgIHZhbHVlW2NoaWxkRmllbGQua2V5XSA9IGNvbmZpZy5pbmZsYXRlRmllbGRWYWx1ZShjaGlsZEZpZWxkLCBmaWVsZEhhbmRsZXIpO1xuICAgIC8vICAgICAgIH1cbiAgICAvLyAgICAgfSk7XG4gICAgLy8gICAgIHJldHVybiB2YWx1ZTtcbiAgICAvLyAgIH0gZWxzZSB7XG4gICAgLy8gICAgIHJldHVybiBmaWVsZC52YWx1ZTtcbiAgICAvLyAgIH1cbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gSW5pdGlhbGl6ZSB0aGUgcm9vdCBmaWVsZC5cbiAgICAvLyBpbml0Um9vdEZpZWxkOiBmdW5jdGlvbiAoLyogZmllbGQsIHByb3BzICovKSB7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIEluaXRpYWxpemUgZXZlcnkgZmllbGQuXG4gICAgLy8gaW5pdEZpZWxkOiBmdW5jdGlvbiAoLyogZmllbGQgKi8pIHtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gSWYgYW4gYXJyYXkgb2YgZmllbGQgdGVtcGxhdGVzIGFyZSBwYXNzZWQgaW4sIHRoaXMgbWV0aG9kIGlzIHVzZWQgdG9cbiAgICAvLyAvLyB3cmFwIHRoZSBmaWVsZHMgaW5zaWRlIGEgc2luZ2xlIHJvb3QgZmllbGQgdGVtcGxhdGUuXG4gICAgLy8gd3JhcEZpZWxkVGVtcGxhdGVzOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZXMpIHtcbiAgICAvLyAgIHJldHVybiB7XG4gICAgLy8gICAgIHR5cGU6ICdmaWVsZHMnLFxuICAgIC8vICAgICBwbGFpbjogdHJ1ZSxcbiAgICAvLyAgICAgZmllbGRzOiBmaWVsZFRlbXBsYXRlc1xuICAgIC8vICAgfTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gR2l2ZW4gdGhlIHByb3BzIHRoYXQgYXJlIHBhc3NlZCBpbiwgY3JlYXRlIHRoZSByb290IGZpZWxkLlxuICAgIC8vIGNyZWF0ZVJvb3RGaWVsZDogZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgLy9cbiAgICAvLyAgIHZhciBmaWVsZFRlbXBsYXRlID0gcHJvcHMuZmllbGRUZW1wbGF0ZSB8fCBwcm9wcy5maWVsZFRlbXBsYXRlcyB8fCBwcm9wcy5maWVsZCB8fCBwcm9wcy5maWVsZHM7XG4gICAgLy8gICB2YXIgdmFsdWUgPSBwcm9wcy52YWx1ZTtcbiAgICAvL1xuICAgIC8vICAgaWYgKCFmaWVsZFRlbXBsYXRlKSB7XG4gICAgLy8gICAgIGZpZWxkVGVtcGxhdGUgPSBjb25maWcuY3JlYXRlRmllbGRUZW1wbGF0ZUZyb21WYWx1ZSh2YWx1ZSk7XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIGlmIChfLmlzQXJyYXkoZmllbGRUZW1wbGF0ZSkpIHtcbiAgICAvLyAgICAgZmllbGRUZW1wbGF0ZSA9IGNvbmZpZy53cmFwRmllbGRUZW1wbGF0ZXMoZmllbGRUZW1wbGF0ZSk7XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIHZhciBmaWVsZCA9IF8uZXh0ZW5kKHt9LCBmaWVsZFRlbXBsYXRlLCB7cmF3RmllbGRUZW1wbGF0ZTogZmllbGRUZW1wbGF0ZX0pO1xuICAgIC8vICAgaWYgKGNvbmZpZy5oYXNWYWx1ZShmaWVsZFRlbXBsYXRlLCB2YWx1ZSkpIHtcbiAgICAvLyAgICAgZmllbGQudmFsdWUgPSBjb25maWcuY29lcmNlVmFsdWUoZmllbGRUZW1wbGF0ZSwgdmFsdWUpO1xuICAgIC8vICAgfSBlbHNlIHtcbiAgICAvLyAgICAgZmllbGQudmFsdWUgPSBjb25maWcuY3JlYXRlRGVmYXVsdFZhbHVlKGZpZWxkVGVtcGxhdGUpO1xuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICBjb25maWcuaW5pdFJvb3RGaWVsZChmaWVsZCwgcHJvcHMpO1xuICAgIC8vICAgY29uZmlnLmluaXRGaWVsZChmaWVsZCk7XG4gICAgLy9cbiAgICAvLyAgIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCBjb25maWcuaXNFbXB0eU9iamVjdCh2YWx1ZSkgfHwgXy5pc1VuZGVmaW5lZCh2YWx1ZSkpIHtcbiAgICAvLyAgICAgZmllbGQudmFsdWUgPSBjb25maWcuaW5mbGF0ZUZpZWxkVmFsdWUoZmllbGQpO1xuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICByZXR1cm4gZmllbGQ7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIEdpdmVuIHRoZSBwcm9wcyB0aGF0IGFyZSBwYXNzZWQgaW4sIGNyZWF0ZSB0aGUgdmFsdWUgdGhhdCB3aWxsIGJlIGRpc3BsYXllZFxuICAgIC8vIC8vIGJ5IGFsbCB0aGUgY29tcG9uZW50cy5cbiAgICAvLyBjcmVhdGVSb290VmFsdWU6IGZ1bmN0aW9uIChwcm9wcywgZmllbGRIYW5kbGVyKSB7XG4gICAgLy9cbiAgICAvLyAgIHZhciBmaWVsZCA9IGNvbmZpZy5jcmVhdGVSb290RmllbGQocHJvcHMpO1xuICAgIC8vXG4gICAgLy8gICByZXR1cm4gY29uZmlnLmluZmxhdGVGaWVsZFZhbHVlKGZpZWxkLCBmaWVsZEhhbmRsZXIpO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyB2YWxpZGF0ZVJvb3RWYWx1ZTogZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgLy9cbiAgICAvLyAgIHZhciBlcnJvcnMgPSBbXTtcbiAgICAvL1xuICAgIC8vICAgY29uZmlnLmNyZWF0ZVJvb3RWYWx1ZShwcm9wcywgZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgLy8gICAgIHZhciBmaWVsZEVycm9ycyA9IGNvbmZpZy5maWVsZEVycm9ycyhmaWVsZCk7XG4gICAgLy8gICAgIGlmIChmaWVsZEVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgLy8gICAgICAgZXJyb3JzLnB1c2goe1xuICAgIC8vICAgICAgICAgcGF0aDogY29uZmlnLmZpZWxkVmFsdWVQYXRoKGZpZWxkKSxcbiAgICAvLyAgICAgICAgIGVycm9yczogZmllbGRFcnJvcnNcbiAgICAvLyAgICAgICB9KTtcbiAgICAvLyAgICAgfVxuICAgIC8vICAgfSk7XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiBlcnJvcnM7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIGlzVmFsaWRSb290VmFsdWU6IGZ1bmN0aW9uIChwcm9wcykge1xuICAgIC8vXG4gICAgLy8gICB2YXIgaXNWYWxpZCA9IHRydWU7XG4gICAgLy9cbiAgICAvLyAgIGNvbmZpZy5jcmVhdGVSb290VmFsdWUocHJvcHMsIGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIC8vICAgICBpZiAoY29uZmlnLmZpZWxkRXJyb3JzKGZpZWxkKS5sZW5ndGggPiAwKSB7XG4gICAgLy8gICAgICAgaXNWYWxpZCA9IGZhbHNlO1xuICAgIC8vICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAvLyAgICAgfVxuICAgIC8vICAgfSk7XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiBpc1ZhbGlkO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyB2YWxpZGF0ZUZpZWxkOiBmdW5jdGlvbiAoZmllbGQsIGVycm9ycykge1xuICAgIC8vXG4gICAgLy8gICBpZiAoZmllbGQudmFsdWUgPT09IHVuZGVmaW5lZCB8fCBmaWVsZC52YWx1ZSA9PT0gJycpIHtcbiAgICAvLyAgICAgaWYgKGNvbmZpZy5maWVsZElzUmVxdWlyZWQoZmllbGQpKSB7XG4gICAgLy8gICAgICAgZXJyb3JzLnB1c2goe1xuICAgIC8vICAgICAgICAgdHlwZTogJ3JlcXVpcmVkJ1xuICAgIC8vICAgICAgIH0pO1xuICAgIC8vICAgICB9XG4gICAgLy8gICB9XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIENyZWF0ZSBkeW5hbWljIGNoaWxkIGZpZWxkcyBmb3IgYSBmaWVsZC5cbiAgICAvLyBjcmVhdGVDaGlsZEZpZWxkczogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgLy9cbiAgICAvLyAgIHZhciB0eXBlTmFtZSA9IGNvbmZpZy5maWVsZFR5cGVOYW1lKGZpZWxkKTtcbiAgICAvL1xuICAgIC8vICAgaWYgKGNvbmZpZ1snY3JlYXRlQ2hpbGRGaWVsZHNfJyArIHR5cGVOYW1lXSkge1xuICAgIC8vICAgICByZXR1cm4gY29uZmlnWydjcmVhdGVDaGlsZEZpZWxkc18nICsgdHlwZU5hbWVdKGZpZWxkKTtcbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgcmV0dXJuIGNvbmZpZy5maWVsZENoaWxkRmllbGRUZW1wbGF0ZXMoZmllbGQpLm1hcChmdW5jdGlvbiAoY2hpbGRGaWVsZCwgaSkge1xuICAgIC8vICAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUNoaWxkRmllbGQoZmllbGQsIHtcbiAgICAvLyAgICAgICBmaWVsZFRlbXBsYXRlOiBjaGlsZEZpZWxkLCBrZXk6IGNoaWxkRmllbGQua2V5LCBmaWVsZEluZGV4OiBpLCB2YWx1ZTogZmllbGQudmFsdWVbY2hpbGRGaWVsZC5rZXldXG4gICAgLy8gICAgIH0pO1xuICAgIC8vICAgfSk7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIENyZWF0ZSBhIHNpbmdsZSBjaGlsZCBmaWVsZCBmb3IgYSBwYXJlbnQgZmllbGQuXG4gICAgLy8gY3JlYXRlQ2hpbGRGaWVsZDogZnVuY3Rpb24gKHBhcmVudEZpZWxkLCBvcHRpb25zKSB7XG4gICAgLy9cbiAgICAvLyAgIHZhciBjaGlsZFZhbHVlID0gb3B0aW9ucy52YWx1ZTtcbiAgICAvL1xuICAgIC8vICAgdmFyIGNoaWxkRmllbGQgPSBfLmV4dGVuZCh7fSwgb3B0aW9ucy5maWVsZFRlbXBsYXRlLCB7XG4gICAgLy8gICAgIGtleTogb3B0aW9ucy5rZXksIHBhcmVudDogcGFyZW50RmllbGQsIGZpZWxkSW5kZXg6IG9wdGlvbnMuZmllbGRJbmRleCxcbiAgICAvLyAgICAgcmF3RmllbGRUZW1wbGF0ZTogb3B0aW9ucy5maWVsZFRlbXBsYXRlXG4gICAgLy8gICB9KTtcbiAgICAvL1xuICAgIC8vICAgaWYgKGNvbmZpZy5oYXNWYWx1ZShvcHRpb25zLmZpZWxkVGVtcGxhdGUsIGNoaWxkVmFsdWUpKSB7XG4gICAgLy8gICAgIGNoaWxkRmllbGQudmFsdWUgPSBjb25maWcuY29lcmNlVmFsdWUob3B0aW9ucy5maWVsZFRlbXBsYXRlLCBjaGlsZFZhbHVlKTtcbiAgICAvLyAgIH0gZWxzZSB7XG4gICAgLy8gICAgIGNoaWxkRmllbGQudmFsdWUgPSBjb25maWcuY3JlYXRlRGVmYXVsdFZhbHVlKG9wdGlvbnMuZmllbGRUZW1wbGF0ZSk7XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIGNvbmZpZy5pbml0RmllbGQoY2hpbGRGaWVsZCk7XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiBjaGlsZEZpZWxkO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBDcmVhdGUgYSB0ZW1wb3JhcnkgZmllbGQgYW5kIGV4dHJhY3QgaXRzIHZhbHVlLlxuICAgIC8vIGNyZWF0ZU5ld0NoaWxkRmllbGRWYWx1ZTogZnVuY3Rpb24gKHBhcmVudEZpZWxkLCBpdGVtRmllbGRJbmRleCkge1xuICAgIC8vXG4gICAgLy8gICB2YXIgY2hpbGRGaWVsZFRlbXBsYXRlID0gY29uZmlnLmZpZWxkSXRlbUZpZWxkVGVtcGxhdGVzKHBhcmVudEZpZWxkKVtpdGVtRmllbGRJbmRleF07XG4gICAgLy9cbiAgICAvLyAgIHZhciBuZXdWYWx1ZSA9IGNvbmZpZy5maWVsZFRlbXBsYXRlVmFsdWUoY2hpbGRGaWVsZFRlbXBsYXRlKTtcbiAgICAvL1xuICAgIC8vICAgLy8gSnVzdCBhIHBsYWNlaG9sZGVyIGtleS4gU2hvdWxkIG5vdCBiZSBpbXBvcnRhbnQuXG4gICAgLy8gICB2YXIga2V5ID0gJ19fdW5rbm93bl9rZXlfXyc7XG4gICAgLy9cbiAgICAvLyAgIGlmIChfLmlzQXJyYXkocGFyZW50RmllbGQudmFsdWUpKSB7XG4gICAgLy8gICAgIC8vIEp1c3QgYSBwbGFjZWhvbGRlciBwb3NpdGlvbiBmb3IgYW4gYXJyYXkuXG4gICAgLy8gICAgIGtleSA9IHBhcmVudEZpZWxkLnZhbHVlLmxlbmd0aDtcbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgLy8gSnVzdCBhIHBsYWNlaG9sZGVyIGZpZWxkIGluZGV4LiBTaG91bGQgbm90IGJlIGltcG9ydGFudC5cbiAgICAvLyAgIHZhciBmaWVsZEluZGV4ID0gMDtcbiAgICAvLyAgIGlmIChfLmlzT2JqZWN0KHBhcmVudEZpZWxkLnZhbHVlKSkge1xuICAgIC8vICAgICBmaWVsZEluZGV4ID0gT2JqZWN0LmtleXMocGFyZW50RmllbGQudmFsdWUpLmxlbmd0aDtcbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgdmFyIGNoaWxkRmllbGQgPSBjb25maWcuY3JlYXRlQ2hpbGRGaWVsZChwYXJlbnRGaWVsZCwge1xuICAgIC8vICAgICBmaWVsZFRlbXBsYXRlOiBjaGlsZEZpZWxkVGVtcGxhdGUsIGtleToga2V5LCBmaWVsZEluZGV4OiBmaWVsZEluZGV4LCB2YWx1ZTogbmV3VmFsdWVcbiAgICAvLyAgIH0pO1xuICAgIC8vXG4gICAgLy8gICBuZXdWYWx1ZSA9IGNvbmZpZy5pbmZsYXRlRmllbGRWYWx1ZShjaGlsZEZpZWxkKTtcbiAgICAvL1xuICAgIC8vICAgcmV0dXJuIG5ld1ZhbHVlO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBHaXZlbiBhIHZhbHVlLCBjcmVhdGUgYSBmaWVsZCB0ZW1wbGF0ZSBmb3IgdGhhdCB2YWx1ZS5cbiAgICAvLyBjcmVhdGVGaWVsZFRlbXBsYXRlRnJvbVZhbHVlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAvL1xuICAgIC8vICAgdmFyIGZpZWxkID0ge1xuICAgIC8vICAgICB0eXBlOiAnanNvbidcbiAgICAvLyAgIH07XG4gICAgLy8gICBpZiAoXy5pc1N0cmluZyh2YWx1ZSkpIHtcbiAgICAvLyAgICAgZmllbGQgPSB7XG4gICAgLy8gICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAvLyAgICAgfTtcbiAgICAvLyAgIH0gZWxzZSBpZiAoXy5pc051bWJlcih2YWx1ZSkpIHtcbiAgICAvLyAgICAgZmllbGQgPSB7XG4gICAgLy8gICAgICAgdHlwZTogJ251bWJlcidcbiAgICAvLyAgICAgfTtcbiAgICAvLyAgIH0gZWxzZSBpZiAoXy5pc0Jvb2xlYW4odmFsdWUpKSB7XG4gICAgLy8gICAgIGZpZWxkID0ge1xuICAgIC8vICAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgIC8vICAgICB9O1xuICAgIC8vICAgfSBlbHNlIGlmIChfLmlzQXJyYXkodmFsdWUpKSB7XG4gICAgLy8gICAgIHZhciBhcnJheUl0ZW1GaWVsZHMgPSB2YWx1ZS5tYXAoZnVuY3Rpb24gKGNoaWxkVmFsdWUsIGkpIHtcbiAgICAvLyAgICAgICB2YXIgY2hpbGRGaWVsZCA9IGNvbmZpZy5jcmVhdGVGaWVsZFRlbXBsYXRlRnJvbVZhbHVlKGNoaWxkVmFsdWUpO1xuICAgIC8vICAgICAgIGNoaWxkRmllbGQua2V5ID0gaTtcbiAgICAvLyAgICAgICByZXR1cm4gY2hpbGRGaWVsZDtcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gICAgIGZpZWxkID0ge1xuICAgIC8vICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgLy8gICAgICAgZmllbGRzOiBhcnJheUl0ZW1GaWVsZHNcbiAgICAvLyAgICAgfTtcbiAgICAvLyAgIH0gZWxzZSBpZiAoXy5pc09iamVjdCh2YWx1ZSkpIHtcbiAgICAvLyAgICAgdmFyIG9iamVjdEl0ZW1GaWVsZHMgPSBPYmplY3Qua2V5cyh2YWx1ZSkubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAvLyAgICAgICB2YXIgY2hpbGRGaWVsZCA9IGNvbmZpZy5jcmVhdGVGaWVsZFRlbXBsYXRlRnJvbVZhbHVlKHZhbHVlW2tleV0pO1xuICAgIC8vICAgICAgIGNoaWxkRmllbGQua2V5ID0ga2V5O1xuICAgIC8vICAgICAgIGNoaWxkRmllbGQubGFiZWwgPSBjb25maWcuaHVtYW5pemUoa2V5KTtcbiAgICAvLyAgICAgICByZXR1cm4gY2hpbGRGaWVsZDtcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gICAgIGZpZWxkID0ge1xuICAgIC8vICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgIC8vICAgICAgIGZpZWxkczogb2JqZWN0SXRlbUZpZWxkc1xuICAgIC8vICAgICB9O1xuICAgIC8vICAgfSBlbHNlIGlmIChfLmlzTnVsbCh2YWx1ZSkpIHtcbiAgICAvLyAgICAgZmllbGQgPSB7XG4gICAgLy8gICAgICAgdHlwZTogJ2pzb24nXG4gICAgLy8gICAgIH07XG4gICAgLy8gICB9XG4gICAgLy8gICByZXR1cm4gZmllbGQ7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIERlZmF1bHQgdmFsdWUgZmFjdG9yeVxuICAgIC8vXG4gICAgLy8gY3JlYXRlRGVmYXVsdFZhbHVlOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSkge1xuICAgIC8vXG4gICAgLy8gICB2YXIgZGVmYXVsdFZhbHVlID0gY29uZmlnLmZpZWxkVGVtcGxhdGVEZWZhdWx0VmFsdWUoZmllbGRUZW1wbGF0ZSk7XG4gICAgLy9cbiAgICAvLyAgIGlmICghXy5pc1VuZGVmaW5lZChkZWZhdWx0VmFsdWUpKSB7XG4gICAgLy8gICAgIHJldHVybiB1dGlscy5kZWVwQ29weShkZWZhdWx0VmFsdWUpO1xuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICB2YXIgdHlwZU5hbWUgPSBjb25maWcuZmllbGRUeXBlTmFtZShmaWVsZFRlbXBsYXRlKTtcbiAgICAvL1xuICAgIC8vICAgaWYgKGNvbmZpZ1snY3JlYXRlRGVmYXVsdFZhbHVlXycgKyB0eXBlTmFtZV0pIHtcbiAgICAvLyAgICAgcmV0dXJuIGNvbmZpZ1snY3JlYXRlRGVmYXVsdFZhbHVlXycgKyB0eXBlTmFtZV0oZmllbGRUZW1wbGF0ZSk7XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiAnJztcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gRmllbGQgaGVscGVyc1xuICAgIC8vXG4gICAgLy8gLy8gRGV0ZXJtaW5lIGlmIGEgdmFsdWUgXCJleGlzdHNcIi5cbiAgICAvLyBoYXNWYWx1ZTogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUsIHZhbHVlKSB7XG4gICAgLy8gICByZXR1cm4gdmFsdWUgIT09IG51bGwgJiYgIV8uaXNVbmRlZmluZWQodmFsdWUpO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBDb2VyY2UgYSB2YWx1ZSB0byB2YWx1ZSBhcHByb3ByaWF0ZSBmb3IgYSBmaWVsZC5cbiAgICAvLyBjb2VyY2VWYWx1ZTogZnVuY3Rpb24gKGZpZWxkLCB2YWx1ZSkge1xuICAgIC8vXG4gICAgLy8gICB2YXIgdHlwZU5hbWUgPSBjb25maWcuZmllbGRUeXBlTmFtZShmaWVsZCk7XG4gICAgLy9cbiAgICAvLyAgIGlmIChjb25maWdbJ2NvZXJjZVZhbHVlXycgKyB0eXBlTmFtZV0pIHtcbiAgICAvLyAgICAgcmV0dXJuIGNvbmZpZ1snY29lcmNlVmFsdWVfJyArIHR5cGVOYW1lXShmaWVsZCwgdmFsdWUpO1xuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICByZXR1cm4gdmFsdWU7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIEdpdmVuIGEgZmllbGQgYW5kIGEgY2hpbGQgdmFsdWUsIGZpbmQgdGhlIGFwcHJvcHJpYXRlIGZpZWxkIHRlbXBsYXRlIGZvclxuICAgIC8vIC8vIHRoYXQgY2hpbGQgdmFsdWUuXG4gICAgLy8gY2hpbGRGaWVsZFRlbXBsYXRlRm9yVmFsdWU6IGZ1bmN0aW9uIChmaWVsZCwgY2hpbGRWYWx1ZSkge1xuICAgIC8vXG4gICAgLy8gICB2YXIgZmllbGRUZW1wbGF0ZTtcbiAgICAvL1xuICAgIC8vICAgdmFyIGZpZWxkVGVtcGxhdGVzID0gY29uZmlnLmZpZWxkSXRlbUZpZWxkVGVtcGxhdGVzKGZpZWxkKTtcbiAgICAvL1xuICAgIC8vICAgZmllbGRUZW1wbGF0ZSA9IF8uZmluZChmaWVsZFRlbXBsYXRlcywgZnVuY3Rpb24gKGl0ZW1GaWVsZFRlbXBsYXRlKSB7XG4gICAgLy8gICAgIHJldHVybiBjb25maWcubWF0Y2hlc0ZpZWxkVGVtcGxhdGVUb1ZhbHVlKGl0ZW1GaWVsZFRlbXBsYXRlLCBjaGlsZFZhbHVlKTtcbiAgICAvLyAgIH0pO1xuICAgIC8vXG4gICAgLy8gICBpZiAoZmllbGRUZW1wbGF0ZSkge1xuICAgIC8vICAgICByZXR1cm4gZmllbGRUZW1wbGF0ZTtcbiAgICAvLyAgIH0gZWxzZSB7XG4gICAgLy8gICAgIHJldHVybiBjb25maWcuY3JlYXRlRmllbGRUZW1wbGF0ZUZyb21WYWx1ZShjaGlsZFZhbHVlKTtcbiAgICAvLyAgIH1cbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBtYXRjaCBmb3IgYSBmaWVsZCB0ZW1wbGF0ZS5cbiAgICAvLyBtYXRjaGVzRmllbGRUZW1wbGF0ZVRvVmFsdWU6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlLCB2YWx1ZSkge1xuICAgIC8vICAgdmFyIG1hdGNoID0gZmllbGRUZW1wbGF0ZS5tYXRjaDtcbiAgICAvLyAgIGlmICghbWF0Y2gpIHtcbiAgICAvLyAgICAgcmV0dXJuIHRydWU7XG4gICAgLy8gICB9XG4gICAgLy8gICByZXR1cm4gXy5ldmVyeShPYmplY3Qua2V5cyhtYXRjaCksIGZ1bmN0aW9uIChrZXkpIHtcbiAgICAvLyAgICAgcmV0dXJuIF8uaXNFcXVhbChtYXRjaFtrZXldLCB2YWx1ZVtrZXldKTtcbiAgICAvLyAgIH0pO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBGaWVsZCB0ZW1wbGF0ZSBoZWxwZXJzXG4gICAgLy9cbiAgICAvLyAvLyBOb3JtYWxpemVkIChQYXNjYWxDYXNlKSB0eXBlIG5hbWUgZm9yIGEgZmllbGQuXG4gICAgLy8gZmllbGRUZW1wbGF0ZVR5cGVOYW1lOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSkge1xuICAgIC8vXG4gICAgLy8gICB2YXIgdHlwZU5hbWUgPSB1dGlscy5kYXNoVG9QYXNjYWwoZmllbGRUZW1wbGF0ZS50eXBlIHx8ICd1bmRlZmluZWQnKTtcbiAgICAvL1xuICAgIC8vICAgdmFyIGFsaWFzID0gY29uZmlnWydhbGlhc18nICsgdHlwZU5hbWVdO1xuICAgIC8vXG4gICAgLy8gICBpZiAoYWxpYXMpIHtcbiAgICAvLyAgICAgaWYgKF8uaXNGdW5jdGlvbihhbGlhcykpIHtcbiAgICAvLyAgICAgICByZXR1cm4gYWxpYXMuY2FsbChjb25maWcsIGZpZWxkVGVtcGxhdGUpO1xuICAgIC8vICAgICB9IGVsc2Uge1xuICAgIC8vICAgICAgIHJldHVybiBhbGlhcztcbiAgICAvLyAgICAgfVxuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICBpZiAoZmllbGRUZW1wbGF0ZS5saXN0KSB7XG4gICAgLy8gICAgIHR5cGVOYW1lID0gJ0FycmF5JztcbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgcmV0dXJuIHR5cGVOYW1lO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBEZWZhdWx0IHZhbHVlIGZvciBhIGZpZWxkIHRlbXBsYXRlLlxuICAgIC8vIGZpZWxkVGVtcGxhdGVEZWZhdWx0VmFsdWU6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiBmaWVsZFRlbXBsYXRlLmRlZmF1bHQ7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIFZhbHVlIGZvciBhIGZpZWxkIHRlbXBsYXRlLiBVc2VkIHRvIGRldGVybWluZSB0aGUgdmFsdWUgb2YgYSBuZXcgY2hpbGRcbiAgICAvLyAvLyBmaWVsZC5cbiAgICAvLyBmaWVsZFRlbXBsYXRlVmFsdWU6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgLy9cbiAgICAvLyAgIC8vIFRoaXMgbG9naWMgbWlnaHQgYmUgYnJpdHRsZS5cbiAgICAvL1xuICAgIC8vICAgdmFyIGRlZmF1bHRWYWx1ZSA9IGNvbmZpZy5maWVsZFRlbXBsYXRlRGVmYXVsdFZhbHVlKGZpZWxkVGVtcGxhdGUpO1xuICAgIC8vXG4gICAgLy8gICB2YXIgbWF0Y2ggPSBjb25maWcuZmllbGRUZW1wbGF0ZU1hdGNoKGZpZWxkVGVtcGxhdGUpO1xuICAgIC8vXG4gICAgLy8gICB2YXIgdmFsdWU7XG4gICAgLy9cbiAgICAvLyAgIGlmIChfLmlzVW5kZWZpbmVkKGRlZmF1bHRWYWx1ZSkgJiYgIV8uaXNVbmRlZmluZWQobWF0Y2gpKSB7XG4gICAgLy8gICAgIHJldHVybiB1dGlscy5kZWVwQ29weShtYXRjaCk7XG4gICAgLy8gICB9IGVsc2Uge1xuICAgIC8vICAgICByZXR1cm4gY29uZmlnLmNyZWF0ZURlZmF1bHRWYWx1ZShmaWVsZFRlbXBsYXRlKTtcbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgcmV0dXJuIHZhbHVlO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBNYXRjaCBydWxlIGZvciBhIGZpZWxkIHRlbXBsYXRlLlxuICAgIC8vIGZpZWxkVGVtcGxhdGVNYXRjaDogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcbiAgICAvLyAgIHJldHVybiBmaWVsZFRlbXBsYXRlLm1hdGNoO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBEZXRlcm1pbmUgaWYgYSBmaWVsZCB0ZW1wbGF0ZSBoYXMgYSBzaW5nbGUtbGluZSB2YWx1ZS5cbiAgICAvLyBmaWVsZFRlbXBsYXRlSXNTaW5nbGVMaW5lOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSkge1xuICAgIC8vICAgcmV0dXJuIGZpZWxkVGVtcGxhdGUuaXNTaW5nbGVMaW5lIHx8IGZpZWxkVGVtcGxhdGUuaXNfc2luZ2xlX2xpbmUgfHxcbiAgICAvLyAgICAgICAgICAgZmllbGRUZW1wbGF0ZS50eXBlID09PSAnc2luZ2xlLWxpbmUtc3RyaW5nJyB8fCBmaWVsZFRlbXBsYXRlLnR5cGUgPT09ICdTaW5nbGVMaW5lU3RyaW5nJztcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gRmllbGQgaGVscGVyc1xuICAgIC8vXG4gICAgLy8gLy8gR2V0IGFuIGFycmF5IG9mIGtleXMgcmVwcmVzZW50aW5nIHRoZSBwYXRoIHRvIGEgdmFsdWUuXG4gICAgLy8gZmllbGRWYWx1ZVBhdGg6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIC8vXG4gICAgLy8gICB2YXIgcGFyZW50UGF0aCA9IFtdO1xuICAgIC8vXG4gICAgLy8gICBpZiAoZmllbGQucGFyZW50KSB7XG4gICAgLy8gICAgIHBhcmVudFBhdGggPSBjb25maWcuZmllbGRWYWx1ZVBhdGgoZmllbGQucGFyZW50KTtcbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgcmV0dXJuIHBhcmVudFBhdGguY29uY2F0KGZpZWxkLmtleSkuZmlsdGVyKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAvLyAgICAgcmV0dXJuICFfLmlzVW5kZWZpbmVkKGtleSkgJiYga2V5ICE9PSAnJztcbiAgICAvLyAgIH0pO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBDbG9uZSBhIGZpZWxkIHdpdGggYSBkaWZmZXJlbnQgdmFsdWUuXG4gICAgLy8gZmllbGRXaXRoVmFsdWU6IGZ1bmN0aW9uIChmaWVsZCwgdmFsdWUpIHtcbiAgICAvLyAgIHJldHVybiBfLmV4dGVuZCh7fSwgZmllbGQsIHt2YWx1ZTogdmFsdWV9KTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gZmllbGRUeXBlTmFtZTogZGVsZWdhdGVUbygnZmllbGRUZW1wbGF0ZVR5cGVOYW1lJyksXG4gICAgLy9cbiAgICAvLyAvLyBHZXQgdGhlIGNob2ljZXMgZm9yIGEgZHJvcGRvd24gZmllbGQuXG4gICAgLy8gZmllbGRDaG9pY2VzOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAvL1xuICAgIC8vICAgcmV0dXJuIGNvbmZpZy5ub3JtYWxpemVDaG9pY2VzKGZpZWxkLmNob2ljZXMpO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBHZXQgdGhlIGNob2ljZXMgZm9yIGEgcHJldHR5IGRyb3Bkb3duIGZpZWxkLlxuICAgIC8vIGZpZWxkUHJldHR5Q2hvaWNlczogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiBjb25maWcubm9ybWFsaXplUHJldHR5Q2hvaWNlcyhmaWVsZC5jaG9pY2VzKTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gR2V0IGEgc2V0IG9mIGJvb2xlYW4gY2hvaWNlcyBmb3IgYSBmaWVsZC5cbiAgICAvLyBmaWVsZEJvb2xlYW5DaG9pY2VzOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAvL1xuICAgIC8vICAgdmFyIGNob2ljZXMgPSBjb25maWcuZmllbGRDaG9pY2VzKGZpZWxkKTtcbiAgICAvL1xuICAgIC8vICAgaWYgKGNob2ljZXMubGVuZ3RoID09PSAwKSB7XG4gICAgLy8gICAgIHJldHVybiBbe1xuICAgIC8vICAgICAgIGxhYmVsOiAneWVzJyxcbiAgICAvLyAgICAgICB2YWx1ZTogdHJ1ZVxuICAgIC8vICAgICB9LCB7XG4gICAgLy8gICAgICAgbGFiZWw6ICdubycsXG4gICAgLy8gICAgICAgdmFsdWU6IGZhbHNlXG4gICAgLy8gICAgIH1dO1xuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICByZXR1cm4gY2hvaWNlcy5tYXAoZnVuY3Rpb24gKGNob2ljZSkge1xuICAgIC8vICAgICBpZiAoXy5pc0Jvb2xlYW4oY2hvaWNlLnZhbHVlKSkge1xuICAgIC8vICAgICAgIHJldHVybiBjaG9pY2U7XG4gICAgLy8gICAgIH1cbiAgICAvLyAgICAgcmV0dXJuIF8uZXh0ZW5kKHt9LCBjaG9pY2UsIHtcbiAgICAvLyAgICAgICB2YWx1ZTogY29uZmlnLmNvZXJjZVZhbHVlVG9Cb29sZWFuKGNob2ljZS52YWx1ZSlcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gICB9KTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gR2V0IGEgc2V0IG9mIHJlcGxhY2VtZW50IGNob2ljZXMgZm9yIGEgZmllbGQuXG4gICAgLy8gZmllbGRSZXBsYWNlQ2hvaWNlczogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiBjb25maWcubm9ybWFsaXplQ2hvaWNlcyhmaWVsZC5yZXBsYWNlQ2hvaWNlcyk7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIEdldCBhIGxhYmVsIGZvciBhIGZpZWxkLlxuICAgIC8vIGZpZWxkTGFiZWw6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIC8vICAgcmV0dXJuIGZpZWxkLmxhYmVsO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBHZXQgYSBwbGFjZWhvbGRlciAoanVzdCBhIGRlZmF1bHQgZGlzcGxheSB2YWx1ZSwgbm90IGEgZGVmYXVsdCB2YWx1ZSkgZm9yIGEgZmllbGQuXG4gICAgLy8gZmllbGRQbGFjZWhvbGRlcjogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgLy8gICByZXR1cm4gZmllbGQucGxhY2Vob2xkZXI7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIEdldCB0aGUgaGVscCB0ZXh0IGZvciBhIGZpZWxkLlxuICAgIC8vIGZpZWxkSGVscFRleHQ6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIC8vICAgcmV0dXJuIGZpZWxkLmhlbHBfdGV4dF9odG1sIHx8IGZpZWxkLmhlbHBfdGV4dCB8fCBmaWVsZC5oZWxwVGV4dCB8fCBmaWVsZC5oZWxwVGV4dEh0bWw7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIEdldCB3aGV0aGVyIG9yIG5vdCBhIGZpZWxkIGlzIHJlcXVpcmVkLlxuICAgIC8vIGZpZWxkSXNSZXF1aXJlZDogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgLy8gICByZXR1cm4gZmllbGQucmVxdWlyZWQgPyB0cnVlIDogZmFsc2U7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIERldGVybWluZSBpZiB2YWx1ZSBmb3IgdGhpcyBmaWVsZCBpcyBub3QgYSBsZWFmIHZhbHVlLlxuICAgIC8vIGZpZWxkSGFzVmFsdWVDaGlsZHJlbjogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgLy9cbiAgICAvLyAgIHZhciBkZWZhdWx0VmFsdWUgPSBjb25maWcuY3JlYXRlRGVmYXVsdFZhbHVlKGZpZWxkKTtcbiAgICAvL1xuICAgIC8vICAgaWYgKF8uaXNPYmplY3QoZGVmYXVsdFZhbHVlKSB8fCBfLmlzQXJyYXkoZGVmYXVsdFZhbHVlKSkge1xuICAgIC8vICAgICByZXR1cm4gdHJ1ZTtcbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgcmV0dXJuIGZhbHNlO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBHZXQgdGhlIGNoaWxkIGZpZWxkIHRlbXBsYXRlcyBmb3IgdGhpcyBmaWVsZC5cbiAgICAvLyBmaWVsZENoaWxkRmllbGRUZW1wbGF0ZXM6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIC8vICAgcmV0dXJuIGZpZWxkLmZpZWxkcyB8fCBbXTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gR2V0IHRoZSBmaWVsZCB0ZW1wbGF0ZXMgZm9yIGVhY2ggaXRlbSBvZiB0aGlzIGZpZWxkLiAoRm9yIGR5bmFtaWMgY2hpbGRyZW4sXG4gICAgLy8gLy8gbGlrZSBhcnJheXMuKVxuICAgIC8vIGZpZWxkSXRlbUZpZWxkVGVtcGxhdGVzOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAvLyAgIGlmICghZmllbGQuaXRlbUZpZWxkcykge1xuICAgIC8vICAgICByZXR1cm4gW3t0eXBlOiAndGV4dCd9XTtcbiAgICAvLyAgIH1cbiAgICAvLyAgIGlmICghXy5pc0FycmF5KGZpZWxkLml0ZW1GaWVsZHMpKSB7XG4gICAgLy8gICAgIHJldHVybiBbZmllbGQuaXRlbUZpZWxkc107XG4gICAgLy8gICB9XG4gICAgLy8gICByZXR1cm4gZmllbGQuaXRlbUZpZWxkcztcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gZmllbGRJc1NpbmdsZUxpbmU6IGRlbGVnYXRlVG8oJ2ZpZWxkVGVtcGxhdGVJc1NpbmdsZUxpbmUnKSxcbiAgICAvL1xuICAgIC8vIC8vIEdldCB3aGV0aGVyIG9yIG5vdCBhIGZpZWxkIGlzIGNvbGxhcHNlZC5cbiAgICAvLyBmaWVsZElzQ29sbGFwc2VkOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAvLyAgIHJldHVybiBmaWVsZC5jb2xsYXBzZWQgPyB0cnVlIDogZmFsc2U7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIEdldCB3aGV0ZXIgb3Igbm90IGEgZmllbGQgY2FuIGJlIGNvbGxhcHNlZC5cbiAgICAvLyBmaWVsZElzQ29sbGFwc2libGU6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIC8vICAgcmV0dXJuIGZpZWxkLmNvbGxhcHNpYmxlIHx8ICFfLmlzVW5kZWZpbmVkKGZpZWxkLmNvbGxhcHNlZCk7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIEdldCB0aGUgbnVtYmVyIG9mIHJvd3MgZm9yIGEgZmllbGQuXG4gICAgLy8gZmllbGRSb3dzOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAvLyAgIHJldHVybiBmaWVsZC5yb3dzO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyBmaWVsZEVycm9yczogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgLy9cbiAgICAvLyAgIHZhciBlcnJvcnMgPSBbXTtcbiAgICAvL1xuICAgIC8vICAgaWYgKGNvbmZpZy5pc0tleShmaWVsZC5rZXkpKSB7XG4gICAgLy8gICAgIGNvbmZpZy52YWxpZGF0ZUZpZWxkKGZpZWxkLCBlcnJvcnMpO1xuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICByZXR1cm4gZXJyb3JzO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyBmaWVsZE1hdGNoOiBkZWxlZ2F0ZVRvKCdmaWVsZFRlbXBsYXRlTWF0Y2gnKSxcbiAgICAvL1xuICAgIC8vIC8vIE90aGVyIGhlbHBlcnNcbiAgICAvL1xuICAgIC8vIC8vIENvbnZlcnQgYSBrZXkgdG8gYSBuaWNlIGh1bWFuLXJlYWRhYmxlIHZlcnNpb24uXG4gICAgLy8gaHVtYW5pemU6IGZ1bmN0aW9uKHByb3BlcnR5KSB7XG4gICAgLy8gICBwcm9wZXJ0eSA9IHByb3BlcnR5LnJlcGxhY2UoL1xce1xcey9nLCAnJyk7XG4gICAgLy8gICBwcm9wZXJ0eSA9IHByb3BlcnR5LnJlcGxhY2UoL1xcfVxcfS9nLCAnJyk7XG4gICAgLy8gICByZXR1cm4gcHJvcGVydHkucmVwbGFjZSgvXy9nLCAnICcpXG4gICAgLy8gICAucmVwbGFjZSgvKFxcdyspL2csIGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgLy8gICAgIHJldHVybiBtYXRjaC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIG1hdGNoLnNsaWNlKDEpO1xuICAgIC8vICAgfSk7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIE5vcm1hbGl6ZSBzb21lIGNob2ljZXMgZm9yIGEgZHJvcC1kb3duLlxuICAgIC8vIG5vcm1hbGl6ZUNob2ljZXM6IGZ1bmN0aW9uIChjaG9pY2VzKSB7XG4gICAgLy9cbiAgICAvLyAgIGlmICghY2hvaWNlcykge1xuICAgIC8vICAgICByZXR1cm4gW107XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIC8vIENvbnZlcnQgY29tbWEgc2VwYXJhdGVkIHN0cmluZyB0byBhcnJheSBvZiBzdHJpbmdzLlxuICAgIC8vICAgaWYgKF8uaXNTdHJpbmcoY2hvaWNlcykpIHtcbiAgICAvLyAgICAgY2hvaWNlcyA9IGNob2ljZXMuc3BsaXQoJywnKTtcbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgLy8gQ29udmVydCBvYmplY3QgdG8gYXJyYXkgb2Ygb2JqZWN0cyB3aXRoIGB2YWx1ZWAgYW5kIGBsYWJlbGAgcHJvcGVydGllcy5cbiAgICAvLyAgIGlmICghXy5pc0FycmF5KGNob2ljZXMpICYmIF8uaXNPYmplY3QoY2hvaWNlcykpIHtcbiAgICAvLyAgICAgY2hvaWNlcyA9IE9iamVjdC5rZXlzKGNob2ljZXMpLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgLy8gICAgICAgcmV0dXJuIHtcbiAgICAvLyAgICAgICAgIHZhbHVlOiBrZXksXG4gICAgLy8gICAgICAgICBsYWJlbDogY2hvaWNlc1trZXldXG4gICAgLy8gICAgICAgfTtcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIC8vIENvcHkgdGhlIGFycmF5IG9mIGNob2ljZXMgc28gd2UgY2FuIG1hbmlwdWxhdGUgdGhlbS5cbiAgICAvLyAgIGNob2ljZXMgPSBjaG9pY2VzLnNsaWNlKDApO1xuICAgIC8vXG4gICAgLy8gICAvLyBBcnJheSBvZiBjaG9pY2UgYXJyYXlzIHNob3VsZCBiZSBmbGF0dGVuZWQuXG4gICAgLy8gICBjaG9pY2VzID0gXy5mbGF0dGVuKGNob2ljZXMpO1xuICAgIC8vXG4gICAgLy8gICBjaG9pY2VzLmZvckVhY2goZnVuY3Rpb24gKGNob2ljZSwgaSkge1xuICAgIC8vICAgICAvLyBDb252ZXJ0IGFueSBzdHJpbmcgY2hvaWNlcyB0byBvYmplY3RzIHdpdGggYHZhbHVlYCBhbmQgYGxhYmVsYFxuICAgIC8vICAgICAvLyBwcm9wZXJ0aWVzLlxuICAgIC8vICAgICBpZiAoXy5pc1N0cmluZyhjaG9pY2UpKSB7XG4gICAgLy8gICAgICAgY2hvaWNlc1tpXSA9IHtcbiAgICAvLyAgICAgICAgIHZhbHVlOiBjaG9pY2UsXG4gICAgLy8gICAgICAgICBsYWJlbDogY29uZmlnLmh1bWFuaXplKGNob2ljZSlcbiAgICAvLyAgICAgICB9O1xuICAgIC8vICAgICB9XG4gICAgLy8gICAgIGlmICghY2hvaWNlc1tpXS5sYWJlbCkge1xuICAgIC8vICAgICAgIGNob2ljZXNbaV0ubGFiZWwgPSBjb25maWcuaHVtYW5pemUoY2hvaWNlc1tpXS52YWx1ZSk7XG4gICAgLy8gICAgIH1cbiAgICAvLyAgIH0pO1xuICAgIC8vXG4gICAgLy8gICByZXR1cm4gY2hvaWNlcztcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gTm9ybWFsaXplIGNob2ljZXMgZm9yIGEgcHJldHR5IGRyb3AgZG93biwgd2l0aCAnc2FtcGxlJyB2YWx1ZXNcbiAgICAvLyBub3JtYWxpemVQcmV0dHlDaG9pY2VzOiBmdW5jdGlvbiAoY2hvaWNlcykge1xuICAgIC8vICAgaWYgKCFfLmlzQXJyYXkoY2hvaWNlcykgJiYgXy5pc09iamVjdChjaG9pY2VzKSkge1xuICAgIC8vICAgICBjaG9pY2VzID0gT2JqZWN0LmtleXMoY2hvaWNlcykubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAvLyAgICAgICByZXR1cm4ge1xuICAgIC8vICAgICAgICAgdmFsdWU6IGtleSxcbiAgICAvLyAgICAgICAgIGxhYmVsOiBjaG9pY2VzW2tleV0sXG4gICAgLy8gICAgICAgICBzYW1wbGU6IGtleVxuICAgIC8vICAgICAgIH07XG4gICAgLy8gICAgIH0pO1xuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICByZXR1cm4gY29uZmlnLm5vcm1hbGl6ZUNob2ljZXMoY2hvaWNlcyk7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIENvZXJjZSBhIHZhbHVlIHRvIGEgYm9vbGVhblxuICAgIC8vIGNvZXJjZVZhbHVlVG9Cb29sZWFuOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAvLyAgIGlmICghXy5pc1N0cmluZyh2YWx1ZSkpIHtcbiAgICAvLyAgICAgLy8gSnVzdCB1c2UgdGhlIGRlZmF1bHQgdHJ1dGhpbmVzcy5cbiAgICAvLyAgICAgcmV0dXJuIHZhbHVlID8gdHJ1ZSA6IGZhbHNlO1xuICAgIC8vICAgfVxuICAgIC8vICAgdmFsdWUgPSB2YWx1ZS50b0xvd2VyQ2FzZSgpO1xuICAgIC8vICAgaWYgKHZhbHVlID09PSAnJyB8fCB2YWx1ZSA9PT0gJ25vJyB8fCB2YWx1ZSA9PT0gJ29mZicgfHwgdmFsdWUgPT09ICdmYWxzZScpIHtcbiAgICAvLyAgICAgcmV0dXJuIGZhbHNlO1xuICAgIC8vICAgfVxuICAgIC8vICAgcmV0dXJuIHRydWU7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgdmFsaWQga2V5LlxuICAgIC8vIGlzS2V5OiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgLy8gICByZXR1cm4gKF8uaXNOdW1iZXIoa2V5KSAmJiBrZXkgPj0gMCkgfHwgKF8uaXNTdHJpbmcoa2V5KSAmJiBrZXkgIT09ICcnKTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gRmFzdCB3YXkgdG8gY2hlY2sgZm9yIGVtcHR5IG9iamVjdC5cbiAgICAvLyBpc0VtcHR5T2JqZWN0OiBmdW5jdGlvbiAob2JqKSB7XG4gICAgLy8gICBmb3IodmFyIGtleSBpbiBvYmopIHtcbiAgICAvLyAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgLy8gICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIC8vICAgICB9XG4gICAgLy8gICB9XG4gICAgLy8gICByZXR1cm4gdHJ1ZTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gYWN0aW9uQ2hvaWNlTGFiZWw6IGZ1bmN0aW9uIChhY3Rpb24pIHtcbiAgICAvLyAgIHJldHVybiB1dGlscy5jYXBpdGFsaXplKGFjdGlvbikucmVwbGFjZSgvWy1dL2csICcgJyk7XG4gICAgLy8gfVxuLy8gICB9O1xuLy8gfTtcbiIsInZhciBfID0gcmVxdWlyZSgnLi91bmRhc2gnKTtcblxuY29uc3QgY3JlYXRlQ29uZmlnID0gZnVuY3Rpb24gKC4uLnBsdWdpbnMpIHtcbiAgcmV0dXJuIHBsdWdpbnMucmVkdWNlKGZ1bmN0aW9uIChjb25maWcsIHBsdWdpbikge1xuICAgIGlmIChfLmlzRnVuY3Rpb24ocGx1Z2luKSkge1xuICAgICAgdmFyIGV4dGVuc2lvbnMgPSBwbHVnaW4oY29uZmlnKTtcbiAgICAgIGlmIChleHRlbnNpb25zKSB7XG4gICAgICAgIF8uZXh0ZW5kKGNvbmZpZywgZXh0ZW5zaW9ucyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIF8uZXh0ZW5kKGNvbmZpZywgcGx1Z2luKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29uZmlnO1xuICB9LCB7fSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUNvbmZpZztcbiIsImNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbmNvbnN0IF8gPSByZXF1aXJlKCcuL3VuZGFzaCcpO1xuY29uc3QgQ29uZmlnID0gcmVxdWlyZSgnLi9jb25maWcnKTtcbmNvbnN0IENvbXBvbmVudHMgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMnKTtcbmNvbnN0IGNyZWF0ZUNvbmZpZyA9IHJlcXVpcmUoJy4vY3JlYXRlLWNvbmZpZycpO1xuY29uc3QgZGVmYXVsdENvbmZpZ1BsdWdpbiA9IHJlcXVpcmUoJy4vcGx1Z2lucy9kZWZhdWx0LWNvbmZpZycpO1xuQ29uZmlnLnNldERlZmF1bHRDb25maWcoY3JlYXRlQ29uZmlnKGRlZmF1bHRDb25maWdQbHVnaW4pKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgc3RhdGljczogXy5leHRlbmQoe1xuICAgIGNyZWF0ZUNvbmZpZzogY3JlYXRlQ29uZmlnLmJpbmQobnVsbCwgZGVmYXVsdENvbmZpZ1BsdWdpbilcbiAgfSxcbiAgICBDb21wb25lbnRzXG4gICksXG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IGNvbmZpZyA9IENvbmZpZy5mb3JDb21wbmVudCh0aGlzKTtcblxuICAgIHJldHVybiBjb25maWcucmVuZGVyRm9ybWF0aWNDb21wb25lbnQodGhpcyk7XG4gIH1cblxufSk7XG5cblxuLy8gLy8gIyBmb3JtYXRpY1xuLy9cbi8vIC8qXG4vLyBUaGUgcm9vdCBmb3JtYXRpYyBjb21wb25lbnQuXG4vL1xuLy8gVGhlIHJvb3QgZm9ybWF0aWMgY29tcG9uZW50IGlzIGFjdHVhbGx5IHR3byBjb21wb25lbnRzLiBUaGUgbWFpbiBjb21wb25lbnQgaXNcbi8vIGEgY29udHJvbGxlZCBjb21wb25lbnQgd2hlcmUgeW91IG11c3QgcGFzcyB0aGUgdmFsdWUgaW4gd2l0aCBlYWNoIHJlbmRlci4gVGhpc1xuLy8gaXMgYWN0dWFsbHkgd3JhcHBlZCBpbiBhbm90aGVyIGNvbXBvbmVudCB3aGljaCBhbGxvd3MgeW91IHRvIHVzZSBmb3JtYXRpYyBhc1xuLy8gYW4gdW5jb250cm9sbGVkIGNvbXBvbmVudCB3aGVyZSBpdCByZXRhaW5zIHRoZSBzdGF0ZSBvZiB0aGUgdmFsdWUuIFRoZSB3cmFwcGVyXG4vLyBpcyB3aGF0IGlzIGFjdHVhbGx5IGV4cG9ydGVkLlxuLy8gKi9cbi8vXG4vLyAndXNlIHN0cmljdCc7XG4vL1xuLy8gdmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG4vLyB2YXIgXyA9IHJlcXVpcmUoJy4vdW5kYXNoJyk7XG4vL1xuLy8gdmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuLy9cbi8vIHZhciBkZWZhdWx0Q29uZmlnUGx1Z2luID0gcmVxdWlyZSgnLi9kZWZhdWx0LWNvbmZpZycpO1xuLy9cbi8vIHZhciBjcmVhdGVDb25maWcgPSBmdW5jdGlvbiAoLi4uYXJncykge1xuLy8gICB2YXIgcGx1Z2lucyA9IFtkZWZhdWx0Q29uZmlnUGx1Z2luXS5jb25jYXQoYXJncyk7XG4vL1xuLy8gICByZXR1cm4gcGx1Z2lucy5yZWR1Y2UoZnVuY3Rpb24gKGNvbmZpZywgcGx1Z2luKSB7XG4vLyAgICAgaWYgKF8uaXNGdW5jdGlvbihwbHVnaW4pKSB7XG4vLyAgICAgICB2YXIgZXh0ZW5zaW9ucyA9IHBsdWdpbihjb25maWcpO1xuLy8gICAgICAgaWYgKGV4dGVuc2lvbnMpIHtcbi8vICAgICAgICAgXy5leHRlbmQoY29uZmlnLCBleHRlbnNpb25zKTtcbi8vICAgICAgIH1cbi8vICAgICB9IGVsc2Uge1xuLy8gICAgICAgXy5leHRlbmQoY29uZmlnLCBwbHVnaW4pO1xuLy8gICAgIH1cbi8vXG4vLyAgICAgcmV0dXJuIGNvbmZpZztcbi8vICAgfSwge30pO1xuLy8gfTtcbi8vXG4vLyB2YXIgZGVmYXVsdENvbmZpZyA9IGNyZWF0ZUNvbmZpZygpO1xuLy9cbi8vIC8vIFRoZSBtYWluIGZvcm1hdGljIGNvbXBvbmVudCB0aGF0IHJlbmRlcnMgdGhlIGZvcm0uXG4vLyB2YXIgRm9ybWF0aWNDb250cm9sbGVkQ2xhc3MgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4vL1xuLy8gICBkaXNwbGF5TmFtZTogJ0Zvcm1hdGljQ29udHJvbGxlZCcsXG4vL1xuLy8gICAvLyBSZXNwb25kIHRvIGFueSB2YWx1ZSBjaGFuZ2VzLlxuLy8gICBvbkNoYW5nZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBpbmZvKSB7XG4vLyAgICAgaWYgKCF0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4vLyAgICAgICByZXR1cm47XG4vLyAgICAgfVxuLy8gICAgIGluZm8gPSBfLmV4dGVuZCh7fSwgaW5mbyk7XG4vLyAgICAgaW5mby5wYXRoID0gdGhpcy5wcm9wcy5jb25maWcuZmllbGRWYWx1ZVBhdGgoaW5mby5maWVsZCk7XG4vLyAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSwgaW5mbyk7XG4vLyAgIH0sXG4vL1xuLy8gICAvLyBSZXNwb25kIHRvIGFueSBhY3Rpb25zIG90aGVyIHRoYW4gdmFsdWUgY2hhbmdlcy4gKEZvciBleGFtcGxlLCBmb2N1cyBhbmRcbi8vICAgLy8gYmx1ci4pXG4vLyAgIG9uQWN0aW9uOiBmdW5jdGlvbiAoaW5mbykge1xuLy8gICAgIGlmICghdGhpcy5wcm9wcy5vbkFjdGlvbikge1xuLy8gICAgICAgcmV0dXJuO1xuLy8gICAgIH1cbi8vICAgICBpbmZvID0gXy5leHRlbmQoe30sIGluZm8pO1xuLy8gICAgIGluZm8ucGF0aCA9IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkVmFsdWVQYXRoKGluZm8uZmllbGQpO1xuLy8gICAgIHRoaXMucHJvcHMub25BY3Rpb24oaW5mbyk7XG4vLyAgIH0sXG4vL1xuLy8gICAvLyBSZW5kZXIgdGhlIHJvb3QgY29tcG9uZW50IGJ5IGRlbGVnYXRpbmcgdG8gdGhlIGNvbmZpZy5cbi8vICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4vL1xuLy8gICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbi8vXG4vLyAgICAgcmV0dXJuIGNvbmZpZy5yZW5kZXJGb3JtYXRpY0NvbXBvbmVudCh0aGlzKTtcbi8vICAgfVxuLy8gfSk7XG4vL1xuLy8gdmFyIEZvcm1hdGljQ29udHJvbGxlZCA9IFJlYWN0LmNyZWF0ZUZhY3RvcnkoRm9ybWF0aWNDb250cm9sbGVkQ2xhc3MpO1xuLy9cbi8vIC8vIEEgd3JhcHBlciBjb21wb25lbnQgdGhhdCBpcyBhY3R1YWxseSBleHBvcnRlZCBhbmQgY2FuIGFsbG93IGZvcm1hdGljIHRvIGJlXG4vLyAvLyB1c2VkIGluIGFuIFwidW5jb250cm9sbGVkXCIgbWFubmVyLiAoU2VlIHVuY29udHJvbGxlZCBjb21wb25lbnRzIGluIHRoZSBSZWFjdFxuLy8gLy8gZG9jdW1lbnRhdGlvbiBmb3IgYW4gZXhwbGFuYXRpb24gb2YgdGhlIGRpZmZlcmVuY2UuKVxuLy8gbW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4vL1xuLy8gICAvLyBFeHBvcnQgc29tZSBzdHVmZiBhcyBzdGF0aWNzLlxuLy8gICBzdGF0aWNzOiB7XG4vLyAgICAgY3JlYXRlQ29uZmlnOiBjcmVhdGVDb25maWcsXG4vLyAgICAgYXZhaWxhYmxlTWl4aW5zOiB7XG4vLyAgICAgICBjbGlja091dHNpZGU6IHJlcXVpcmUoJy4vbWl4aW5zL2NsaWNrLW91dHNpZGUuanMnKSxcbi8vICAgICAgIGZpZWxkOiByZXF1aXJlKCcuL21peGlucy9maWVsZC5qcycpLFxuLy8gICAgICAgaGVscGVyOiByZXF1aXJlKCcuL21peGlucy9oZWxwZXIuanMnKSxcbi8vICAgICAgIHJlc2l6ZTogcmVxdWlyZSgnLi9taXhpbnMvcmVzaXplLmpzJyksXG4vLyAgICAgICBzY3JvbGw6IHJlcXVpcmUoJy4vbWl4aW5zL3Njcm9sbC5qcycpLFxuLy8gICAgICAgdW5kb1N0YWNrOiByZXF1aXJlKCcuL21peGlucy91bmRvLXN0YWNrLmpzJylcbi8vICAgICB9LFxuLy8gICAgIHBsdWdpbnM6IHtcbi8vICAgICAgIGJvb3RzdHJhcDogcmVxdWlyZSgnLi9wbHVnaW5zL2Jvb3RzdHJhcCcpLFxuLy8gICAgICAgbWV0YTogcmVxdWlyZSgnLi9wbHVnaW5zL21ldGEnKSxcbi8vICAgICAgIHJlZmVyZW5jZTogcmVxdWlyZSgnLi9wbHVnaW5zL3JlZmVyZW5jZScpLFxuLy8gICAgICAgZWxlbWVudENsYXNzZXM6IHJlcXVpcmUoJy4vcGx1Z2lucy9lbGVtZW50LWNsYXNzZXMnKVxuLy8gICAgIH0sXG4vLyAgICAgdXRpbHM6IHV0aWxzXG4vLyAgIH0sXG4vL1xuLy8gICBkaXNwbGF5TmFtZTogJ0Zvcm1hdGljJyxcbi8vXG4vLyAgIC8vIElmIHdlIGdvdCBhIHZhbHVlLCB0cmVhdCB0aGlzIGNvbXBvbmVudCBhcyBjb250cm9sbGVkLiBFaXRoZXIgd2F5LCByZXRhaW5cbi8vICAgLy8gdGhlIHZhbHVlIGluIHRoZSBzdGF0ZS5cbi8vICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4vLyAgICAgcmV0dXJuIHtcbi8vICAgICAgIGlzQ29udHJvbGxlZDogIV8uaXNVbmRlZmluZWQodGhpcy5wcm9wcy52YWx1ZSksXG4vLyAgICAgICB2YWx1ZTogXy5pc1VuZGVmaW5lZCh0aGlzLnByb3BzLnZhbHVlKSA/IHRoaXMucHJvcHMuZGVmYXVsdFZhbHVlIDogdGhpcy5wcm9wcy52YWx1ZVxuLy8gICAgIH07XG4vLyAgIH0sXG4vL1xuLy8gICAvLyBJZiB0aGlzIGlzIGEgY29udHJvbGxlZCBjb21wb25lbnQsIGNoYW5nZSBvdXIgc3RhdGUgdG8gcmVmbGVjdCB0aGUgbmV3XG4vLyAgIC8vIHZhbHVlLiBGb3IgdW5jb250cm9sbGVkIGNvbXBvbmVudHMsIGlnbm9yZSBhbnkgdmFsdWUgY2hhbmdlcy5cbi8vICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gKG5ld1Byb3BzKSB7XG4vLyAgICAgaWYgKHRoaXMuc3RhdGUuaXNDb250cm9sbGVkKSB7XG4vLyAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQobmV3UHJvcHMudmFsdWUpKSB7XG4vLyAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuLy8gICAgICAgICAgIHZhbHVlOiBuZXdQcm9wcy52YWx1ZVxuLy8gICAgICAgICB9KTtcbi8vICAgICAgIH1cbi8vICAgICB9XG4vLyAgIH0sXG4vL1xuLy8gICAvLyBJZiB0aGlzIGlzIGFuIHVuY29udHJvbGxlZCBjb21wb25lbnQsIHNldCBvdXIgc3RhdGUgdG8gcmVmbGVjdCB0aGUgbmV3XG4vLyAgIC8vIHZhbHVlLiBFaXRoZXIgd2F5LCBjYWxsIHRoZSBvbkNoYW5nZSBjYWxsYmFjay5cbi8vICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgaW5mbykge1xuLy8gICAgIGlmICghdGhpcy5zdGF0ZS5pc0NvbnRyb2xsZWQpIHtcbi8vICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuLy8gICAgICAgICB2YWx1ZTogbmV3VmFsdWVcbi8vICAgICAgIH0pO1xuLy8gICAgIH1cbi8vICAgICBpZiAoIXRoaXMucHJvcHMub25DaGFuZ2UpIHtcbi8vICAgICAgIHJldHVybjtcbi8vICAgICB9XG4vLyAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSwgaW5mbyk7XG4vLyAgIH0sXG4vL1xuLy8gICAvLyBBbnkgYWN0aW9ucyBzaG91bGQgYmUgc2VudCB0byB0aGUgZ2VuZXJpYyBvbkFjdGlvbiBjYWxsYmFjayBidXQgYWxzbyBzcGxpdFxuLy8gICAvLyBpbnRvIGRpc2NyZWV0IGNhbGxiYWNrcyBwZXIgYWN0aW9uLlxuLy8gICBvbkFjdGlvbjogZnVuY3Rpb24gKGluZm8pIHtcbi8vICAgICBpZiAodGhpcy5wcm9wcy5vbkFjdGlvbikge1xuLy8gICAgICAgdGhpcy5wcm9wcy5vbkFjdGlvbihpbmZvKTtcbi8vICAgICB9XG4vLyAgICAgdmFyIGFjdGlvbiA9IHV0aWxzLmRhc2hUb1Bhc2NhbChpbmZvLmFjdGlvbik7XG4vLyAgICAgaWYgKHRoaXMucHJvcHNbJ29uJyArIGFjdGlvbl0pIHtcbi8vICAgICAgIHRoaXMucHJvcHNbJ29uJyArIGFjdGlvbl0oaW5mbyk7XG4vLyAgICAgfVxuLy8gICB9LFxuLy9cbi8vICAgLy8gUmVuZGVyIHRoZSB3cmFwcGVyIGNvbXBvbmVudCAoYnkganVzdCBkZWxlZ2F0aW5nIHRvIHRoZSBtYWluIGNvbXBvbmVudCkuXG4vLyAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuLy9cbi8vICAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWcgfHwgZGVmYXVsdENvbmZpZztcbi8vICAgICB2YXIgdmFsdWUgPSB0aGlzLnN0YXRlLnZhbHVlO1xuLy9cbi8vICAgICBpZiAodGhpcy5zdGF0ZS5pc0NvbnRyb2xsZWQpIHtcbi8vICAgICAgIGlmICghdGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuLy8gICAgICAgICBjb25zb2xlLmxvZygnWW91IHNob3VsZCBzdXBwbHkgYW4gb25DaGFuZ2UgaGFuZGxlciBpZiB5b3Ugc3VwcGx5IGEgdmFsdWUuJyk7XG4vLyAgICAgICB9XG4vLyAgICAgfVxuLy9cbi8vICAgICB2YXIgcHJvcHMgPSB7XG4vLyAgICAgICBjb25maWc6IGNvbmZpZyxcbi8vICAgICAgIC8vIEFsbG93IGZpZWxkIHRlbXBsYXRlcyB0byBiZSBwYXNzZWQgaW4gYXMgYGZpZWxkYCBvciBgZmllbGRzYC4gQWZ0ZXIgdGhpcywgc3RvcFxuLy8gICAgICAgLy8gY2FsbGluZyB0aGVtIGZpZWxkcy5cbi8vICAgICAgIGZpZWxkVGVtcGxhdGU6IHRoaXMucHJvcHMuZmllbGQsXG4vLyAgICAgICBmaWVsZFRlbXBsYXRlczogdGhpcy5wcm9wcy5maWVsZHMsXG4vLyAgICAgICB2YWx1ZTogdmFsdWUsXG4vLyAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbi8vICAgICAgIG9uQWN0aW9uOiB0aGlzLm9uQWN0aW9uXG4vLyAgICAgfTtcbi8vXG4vLyAgICAgXy5lYWNoKHRoaXMucHJvcHMsIGZ1bmN0aW9uIChwcm9wVmFsdWUsIGtleSkge1xuLy8gICAgICAgaWYgKCEoa2V5IGluIHByb3BzKSkge1xuLy8gICAgICAgICBwcm9wc1trZXldID0gcHJvcFZhbHVlO1xuLy8gICAgICAgfVxuLy8gICAgIH0pO1xuLy9cbi8vICAgICByZXR1cm4gRm9ybWF0aWNDb250cm9sbGVkKHByb3BzKTtcbi8vICAgfVxuLy9cbi8vIH0pO1xuIiwiLypcblRoaXMgaXMgdGhlIGRlZmF1bHQgY29uZmlndXJhdGlvbiBwbHVnaW4gZm9yIGZvcm1hdGljLiBUbyBjaGFuZ2UgZm9ybWF0aWMnc1xuYmVoYXZpb3IsIGp1c3QgY3JlYXRlIHlvdXIgb3duIHBsdWdpbiBmdW5jdGlvbiB0aGF0IHJldHVybnMgYW4gb2JqZWN0IHdpdGhcbm1ldGhvZHMgeW91IHdhbnQgdG8gYWRkIG9yIG92ZXJyaWRlLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBfID0gcmVxdWlyZSgnLi4vdW5kYXNoJyk7XG5cbmNvbnN0IENvbXBvbmVudHMgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzJyk7XG5cbmNvbnN0IGNvbXBvbmVudHMgPSB7fTtcblxuT2JqZWN0LmtleXMoQ29tcG9uZW50cy5maWVsZHMpLmZvckVhY2gobmFtZSA9PiB7XG4gIGNvbXBvbmVudHNbbmFtZSArICdGaWVsZCddID0gQ29tcG9uZW50cy5maWVsZHNbbmFtZV07XG59KTtcblxuT2JqZWN0LmtleXMoQ29tcG9uZW50cy5oZWxwZXJzKS5mb3JFYWNoKG5hbWUgPT4ge1xuICBjb21wb25lbnRzW25hbWVdID0gQ29tcG9uZW50cy5oZWxwZXJzW25hbWVdO1xufSk7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNvbmZpZykge1xuXG4gIHZhciBkZWxlZ2F0ZVRvID0gdXRpbHMuZGVsZWdhdG9yKGNvbmZpZyk7XG5cbiAgcmV0dXJuIHtcblxuICAgIC8vIE5vcm1hbGl6ZSBhbiBlbGVtZW50IG5hbWUuXG4gICAgZWxlbWVudE5hbWUobmFtZSkge1xuICAgICAgcmV0dXJuIHV0aWxzLmRhc2hUb1Bhc2NhbChuYW1lKTtcbiAgICB9LFxuXG4gICAgY2xhc3MobmFtZSkge1xuICAgICAgaWYgKCFuYW1lKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ29tcG9uZW50IGNsYXNzIG5hbWUgbXVzdCBiZSBzcGVjaWZpZWQgdG8gcmV0cmlldmUgY29tcG9uZW50IGNsYXNzLicpO1xuICAgICAgfVxuICAgICAgbmFtZSA9IGNvbmZpZy5lbGVtZW50TmFtZShuYW1lKTtcbiAgICAgIGlmIChjb21wb25lbnRzW25hbWVdKSB7XG4gICAgICAgIHJldHVybiBjb21wb25lbnRzW25hbWVdO1xuICAgICAgfVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb21wb25lbnQgY2xhc3MgJHtuYW1lfSBub3QgZm91bmQuYCk7XG4gICAgfSxcblxuICAgIGhlbHBlckNsYXNzKG5hbWUpIHtcbiAgICAgIGlmICghbmFtZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0hlbHBlciBjbGFzcyBuYW1lIG11c3QgYmUgc3BlY2lmaWVkIHRvIHJldHJpZXZlIGNvbXBvbmVudCBjbGFzcy4nKTtcbiAgICAgIH1cbiAgICAgIG5hbWUgPSBjb25maWcuZWxlbWVudE5hbWUobmFtZSk7XG4gICAgICByZXR1cm4gY29uZmlnLmNsYXNzKG5hbWUpO1xuICAgIH0sXG5cbiAgICBmaWVsZENsYXNzKG5hbWUpIHtcbiAgICAgIGlmICghbmFtZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZpZWxkIGNsYXNzIG5hbWUgbXVzdCBiZSBzcGVjaWZpZWQgdG8gcmV0cmlldmUgY29tcG9uZW50IGNsYXNzLicpO1xuICAgICAgfVxuICAgICAgbmFtZSArPSAnLWZpZWxkJztcbiAgICAgIG5hbWUgPSBjb25maWcuZWxlbWVudE5hbWUobmFtZSk7XG4gICAgICByZXR1cm4gY29uZmlnLmNsYXNzKG5hbWUpO1xuICAgIH1cbiAgfTtcbn07XG4iLCJ2YXIgXyA9IHt9O1xuXG5fLmFzc2lnbiA9IF8uZXh0ZW5kID0gcmVxdWlyZSgnb2JqZWN0LWFzc2lnbicpO1xuXy5pc0VxdWFsID0gcmVxdWlyZSgnZGVlcC1lcXVhbCcpO1xuXG4vLyBUaGVzZSBhcmUgbm90IG5lY2Vzc2FyaWx5IGNvbXBsZXRlIGltcGxlbWVudGF0aW9ucy4gVGhleSdyZSBqdXN0IGVub3VnaCBmb3Jcbi8vIHdoYXQncyB1c2VkIGluIGZvcm1hdGljLlxuXG5fLmZsYXR0ZW4gPSAoYXJyYXlzKSA9PiBbXS5jb25jYXQuYXBwbHkoW10sIGFycmF5cyk7XG5cbl8uaXNTdHJpbmcgPSB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnO1xuXy5pc1VuZGVmaW5lZCA9IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCc7XG5fLmlzT2JqZWN0ID0gdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jztcbl8uaXNBcnJheSA9IHZhbHVlID0+IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG5fLmlzTnVtYmVyID0gdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJztcbl8uaXNCb29sZWFuID0gdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbic7XG5fLmlzTnVsbCA9IHZhbHVlID0+IHZhbHVlID09PSBudWxsO1xuXy5pc0Z1bmN0aW9uID0gdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nO1xuXG5fLmNsb25lID0gdmFsdWUgPT4ge1xuICBpZiAoIV8uaXNPYmplY3QodmFsdWUpKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIHJldHVybiBfLmlzQXJyYXkodmFsdWUpID8gdmFsdWUuc2xpY2UoKSA6IF8uYXNzaWduKHt9LCB2YWx1ZSk7XG59O1xuXG5fLmZpbmQgPSAoaXRlbXMsIHRlc3RGbikgPT4ge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHRlc3RGbihpdGVtc1tpXSkpIHtcbiAgICAgIHJldHVybiBpdGVtc1tpXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHZvaWQgMDtcbn07XG5cbl8uZXZlcnkgPSAoaXRlbXMsIHRlc3RGbikgPT4ge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKCF0ZXN0Rm4oaXRlbXNbaV0pKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufTtcblxuXy5lYWNoID0gKG9iaiwgaXRlcmF0ZUZuKSA9PiB7XG4gIE9iamVjdC5rZXlzKG9iaikuZm9yRWFjaChrZXkgPT4ge1xuICAgIGl0ZXJhdGVGbihvYmpba2V5XSwga2V5KTtcbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IF87XG4iLCIvLyAjIHV0aWxzXG5cbi8qXG5KdXN0IHNvbWUgc2hhcmVkIHV0aWxpdHkgZnVuY3Rpb25zLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vdW5kYXNoJyk7XG5cbnZhciB1dGlscyA9IGV4cG9ydHM7XG5cbi8vIENvcHkgb2JqIHJlY3Vyc2luZyBkZWVwbHkuXG51dGlscy5kZWVwQ29weSA9IGZ1bmN0aW9uIChvYmopIHtcbiAgaWYgKF8uaXNBcnJheShvYmopKSB7XG4gICAgcmV0dXJuIG9iai5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHJldHVybiB1dGlscy5kZWVwQ29weShpdGVtKTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmIChfLmlzRnVuY3Rpb24ob2JqKSkge1xuICAgIHJldHVybiBvYmo7XG4gIH0gZWxzZSBpZiAoXy5pc051bGwob2JqKSkge1xuICAgIHJldHVybiBvYmo7XG4gIH0gZWxzZSBpZiAoXy5pc09iamVjdChvYmopKSB7XG4gICAgdmFyIGNvcHkgPSB7fTtcbiAgICBfLmVhY2gob2JqLCBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgY29weVtrZXldID0gdXRpbHMuZGVlcENvcHkodmFsdWUpO1xuICAgIH0pO1xuICAgIHJldHVybiBjb3B5O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBvYmo7XG4gIH1cbn07XG5cbi8vIENhY2hlIGZvciBzdHJpbmdzIGNvbnZlcnRlZCB0byBQYXNjYWwgQ2FzZS4gVGhpcyBzaG91bGQgYmUgYSBmaW5pdGUgbGlzdCwgc29cbi8vIG5vdCBtdWNoIGZlYXIgdGhhdCB3ZSB3aWxsIHJ1biBvdXQgb2YgbWVtb3J5LlxudmFyIGRhc2hUb1Bhc2NhbENhY2hlID0ge307XG5cbi8vIENvbnZlcnQgZm9vLWJhciB0byBGb29CYXIuXG51dGlscy5kYXNoVG9QYXNjYWwgPSBmdW5jdGlvbiAocykge1xuICBpZiAocyA9PT0gJycpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbiAgaWYgKCFkYXNoVG9QYXNjYWxDYWNoZVtzXSkge1xuICAgIGRhc2hUb1Bhc2NhbENhY2hlW3NdID0gcy5zcGxpdCgnLScpLm1hcChmdW5jdGlvbiAocGFydCkge1xuICAgICAgcmV0dXJuIHBhcnRbMF0udG9VcHBlckNhc2UoKSArIHBhcnQuc3Vic3RyaW5nKDEpO1xuICAgIH0pLmpvaW4oJycpO1xuICB9XG4gIHJldHVybiBkYXNoVG9QYXNjYWxDYWNoZVtzXTtcbn07XG5cbi8vIENvcHkgYWxsIGNvbXB1dGVkIHN0eWxlcyBmcm9tIG9uZSBET00gZWxlbWVudCB0byBhbm90aGVyLlxudXRpbHMuY29weUVsZW1lbnRTdHlsZSA9IGZ1bmN0aW9uIChmcm9tRWxlbWVudCwgdG9FbGVtZW50KSB7XG4gIHZhciBmcm9tU3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShmcm9tRWxlbWVudCwgJycpO1xuXG4gIGlmIChmcm9tU3R5bGUuY3NzVGV4dCAhPT0gJycpIHtcbiAgICB0b0VsZW1lbnQuc3R5bGUuY3NzVGV4dCA9IGZyb21TdHlsZS5jc3NUZXh0O1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBjc3NSdWxlcyA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGZyb21TdHlsZS5sZW5ndGg7IGkrKykge1xuICAgIGNzc1J1bGVzLnB1c2goZnJvbVN0eWxlW2ldICsgJzonICsgZnJvbVN0eWxlLmdldFByb3BlcnR5VmFsdWUoZnJvbVN0eWxlW2ldKSArICc7Jyk7XG4gIH1cbiAgdmFyIGNzc1RleHQgPSBjc3NSdWxlcy5qb2luKCcnKTtcblxuICB0b0VsZW1lbnQuc3R5bGUuY3NzVGV4dCA9IGNzc1RleHQ7XG59O1xuXG4vLyBPYmplY3QgdG8gaG9sZCBicm93c2VyIHNuaWZmaW5nIGluZm8uXG52YXIgYnJvd3NlciA9IHtcbiAgaXNDaHJvbWU6IGZhbHNlLFxuICBpc01vemlsbGE6IGZhbHNlLFxuICBpc09wZXJhOiBmYWxzZSxcbiAgaXNJZTogZmFsc2UsXG4gIGlzU2FmYXJpOiBmYWxzZSxcbiAgaXNVbmtub3duOiBmYWxzZVxufTtcblxuLy8gU25pZmYgdGhlIGJyb3dzZXIuXG52YXIgdWEgPSAnJztcblxuaWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnKSB7XG4gIHVhID0gbmF2aWdhdG9yLnVzZXJBZ2VudDtcbn1cblxuaWYodWEuaW5kZXhPZignQ2hyb21lJykgPiAtMSkge1xuICBicm93c2VyLmlzQ2hyb21lID0gdHJ1ZTtcbn0gZWxzZSBpZiAodWEuaW5kZXhPZignU2FmYXJpJykgPiAtMSkge1xuICBicm93c2VyLmlzU2FmYXJpID0gdHJ1ZTtcbn0gZWxzZSBpZiAodWEuaW5kZXhPZignT3BlcmEnKSA+IC0xKSB7XG4gIGJyb3dzZXIuaXNPcGVyYSA9IHRydWU7XG59IGVsc2UgaWYgKHVhLmluZGV4T2YoJ0ZpcmVmb3gnKSA+IC0xKSB7XG4gIGJyb3dzZXIuaXNNb3ppbGxhID0gdHJ1ZTtcbn0gZWxzZSBpZiAodWEuaW5kZXhPZignTVNJRScpID4gLTEpIHtcbiAgYnJvd3Nlci5pc0llID0gdHJ1ZTtcbn0gZWxzZSB7XG4gIGJyb3dzZXIuaXNVbmtub3duID0gdHJ1ZTtcbn1cblxuLy8gRXhwb3J0IHNuaWZmZWQgYnJvd3NlciBpbmZvLlxudXRpbHMuYnJvd3NlciA9IGJyb3dzZXI7XG5cbi8vIENyZWF0ZSBhIG1ldGhvZCB0aGF0IGRlbGVnYXRlcyB0byBhbm90aGVyIG1ldGhvZCBvbiB0aGUgc2FtZSBvYmplY3QuIFRoZVxuLy8gZGVmYXVsdCBjb25maWd1cmF0aW9uIHVzZXMgdGhpcyBmdW5jdGlvbiB0byBkZWxlZ2F0ZSBvbmUgbWV0aG9kIHRvIGFub3RoZXIuXG51dGlscy5kZWxlZ2F0ZVRvID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpc1tuYW1lXS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9O1xufTtcblxudXRpbHMuZGVsZWdhdG9yID0gZnVuY3Rpb24gKG9iaikge1xuICByZXR1cm4gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG9ialtuYW1lXS5hcHBseShvYmosIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfTtcbn07XG5cbnV0aWxzLmNhcGl0YWxpemUgPSBmdW5jdGlvbihzKSB7XG4gIHJldHVybiBzLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcy5zdWJzdHJpbmcoMSkudG9Mb3dlckNhc2UoKTtcbn07XG4iLCJ2YXIgcFNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xudmFyIG9iamVjdEtleXMgPSByZXF1aXJlKCcuL2xpYi9rZXlzLmpzJyk7XG52YXIgaXNBcmd1bWVudHMgPSByZXF1aXJlKCcuL2xpYi9pc19hcmd1bWVudHMuanMnKTtcblxudmFyIGRlZXBFcXVhbCA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGFjdHVhbCwgZXhwZWN0ZWQsIG9wdHMpIHtcbiAgaWYgKCFvcHRzKSBvcHRzID0ge307XG4gIC8vIDcuMS4gQWxsIGlkZW50aWNhbCB2YWx1ZXMgYXJlIGVxdWl2YWxlbnQsIGFzIGRldGVybWluZWQgYnkgPT09LlxuICBpZiAoYWN0dWFsID09PSBleHBlY3RlZCkge1xuICAgIHJldHVybiB0cnVlO1xuXG4gIH0gZWxzZSBpZiAoYWN0dWFsIGluc3RhbmNlb2YgRGF0ZSAmJiBleHBlY3RlZCBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICByZXR1cm4gYWN0dWFsLmdldFRpbWUoKSA9PT0gZXhwZWN0ZWQuZ2V0VGltZSgpO1xuXG4gIC8vIDcuMy4gT3RoZXIgcGFpcnMgdGhhdCBkbyBub3QgYm90aCBwYXNzIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0JyxcbiAgLy8gZXF1aXZhbGVuY2UgaXMgZGV0ZXJtaW5lZCBieSA9PS5cbiAgfSBlbHNlIGlmICh0eXBlb2YgYWN0dWFsICE9ICdvYmplY3QnICYmIHR5cGVvZiBleHBlY3RlZCAhPSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBvcHRzLnN0cmljdCA/IGFjdHVhbCA9PT0gZXhwZWN0ZWQgOiBhY3R1YWwgPT0gZXhwZWN0ZWQ7XG5cbiAgLy8gNy40LiBGb3IgYWxsIG90aGVyIE9iamVjdCBwYWlycywgaW5jbHVkaW5nIEFycmF5IG9iamVjdHMsIGVxdWl2YWxlbmNlIGlzXG4gIC8vIGRldGVybWluZWQgYnkgaGF2aW5nIHRoZSBzYW1lIG51bWJlciBvZiBvd25lZCBwcm9wZXJ0aWVzIChhcyB2ZXJpZmllZFxuICAvLyB3aXRoIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCksIHRoZSBzYW1lIHNldCBvZiBrZXlzXG4gIC8vIChhbHRob3VnaCBub3QgbmVjZXNzYXJpbHkgdGhlIHNhbWUgb3JkZXIpLCBlcXVpdmFsZW50IHZhbHVlcyBmb3IgZXZlcnlcbiAgLy8gY29ycmVzcG9uZGluZyBrZXksIGFuZCBhbiBpZGVudGljYWwgJ3Byb3RvdHlwZScgcHJvcGVydHkuIE5vdGU6IHRoaXNcbiAgLy8gYWNjb3VudHMgZm9yIGJvdGggbmFtZWQgYW5kIGluZGV4ZWQgcHJvcGVydGllcyBvbiBBcnJheXMuXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG9iakVxdWl2KGFjdHVhbCwgZXhwZWN0ZWQsIG9wdHMpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkT3JOdWxsKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBpc0J1ZmZlciAoeCkge1xuICBpZiAoIXggfHwgdHlwZW9mIHggIT09ICdvYmplY3QnIHx8IHR5cGVvZiB4Lmxlbmd0aCAhPT0gJ251bWJlcicpIHJldHVybiBmYWxzZTtcbiAgaWYgKHR5cGVvZiB4LmNvcHkgIT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIHguc2xpY2UgIT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKHgubGVuZ3RoID4gMCAmJiB0eXBlb2YgeFswXSAhPT0gJ251bWJlcicpIHJldHVybiBmYWxzZTtcbiAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIG9iakVxdWl2KGEsIGIsIG9wdHMpIHtcbiAgdmFyIGksIGtleTtcbiAgaWYgKGlzVW5kZWZpbmVkT3JOdWxsKGEpIHx8IGlzVW5kZWZpbmVkT3JOdWxsKGIpKVxuICAgIHJldHVybiBmYWxzZTtcbiAgLy8gYW4gaWRlbnRpY2FsICdwcm90b3R5cGUnIHByb3BlcnR5LlxuICBpZiAoYS5wcm90b3R5cGUgIT09IGIucHJvdG90eXBlKSByZXR1cm4gZmFsc2U7XG4gIC8vfn5+SSd2ZSBtYW5hZ2VkIHRvIGJyZWFrIE9iamVjdC5rZXlzIHRocm91Z2ggc2NyZXd5IGFyZ3VtZW50cyBwYXNzaW5nLlxuICAvLyAgIENvbnZlcnRpbmcgdG8gYXJyYXkgc29sdmVzIHRoZSBwcm9ibGVtLlxuICBpZiAoaXNBcmd1bWVudHMoYSkpIHtcbiAgICBpZiAoIWlzQXJndW1lbnRzKGIpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGEgPSBwU2xpY2UuY2FsbChhKTtcbiAgICBiID0gcFNsaWNlLmNhbGwoYik7XG4gICAgcmV0dXJuIGRlZXBFcXVhbChhLCBiLCBvcHRzKTtcbiAgfVxuICBpZiAoaXNCdWZmZXIoYSkpIHtcbiAgICBpZiAoIWlzQnVmZmVyKGIpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmIChhLmxlbmd0aCAhPT0gYi5sZW5ndGgpIHJldHVybiBmYWxzZTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgYS5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGFbaV0gIT09IGJbaV0pIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgdHJ5IHtcbiAgICB2YXIga2EgPSBvYmplY3RLZXlzKGEpLFxuICAgICAgICBrYiA9IG9iamVjdEtleXMoYik7XG4gIH0gY2F0Y2ggKGUpIHsvL2hhcHBlbnMgd2hlbiBvbmUgaXMgYSBzdHJpbmcgbGl0ZXJhbCBhbmQgdGhlIG90aGVyIGlzbid0XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vIGhhdmluZyB0aGUgc2FtZSBudW1iZXIgb2Ygb3duZWQgcHJvcGVydGllcyAoa2V5cyBpbmNvcnBvcmF0ZXNcbiAgLy8gaGFzT3duUHJvcGVydHkpXG4gIGlmIChrYS5sZW5ndGggIT0ga2IubGVuZ3RoKVxuICAgIHJldHVybiBmYWxzZTtcbiAgLy90aGUgc2FtZSBzZXQgb2Yga2V5cyAoYWx0aG91Z2ggbm90IG5lY2Vzc2FyaWx5IHRoZSBzYW1lIG9yZGVyKSxcbiAga2Euc29ydCgpO1xuICBrYi5zb3J0KCk7XG4gIC8vfn5+Y2hlYXAga2V5IHRlc3RcbiAgZm9yIChpID0ga2EubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBpZiAoa2FbaV0gIT0ga2JbaV0pXG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy9lcXVpdmFsZW50IHZhbHVlcyBmb3IgZXZlcnkgY29ycmVzcG9uZGluZyBrZXksIGFuZFxuICAvL35+fnBvc3NpYmx5IGV4cGVuc2l2ZSBkZWVwIHRlc3RcbiAgZm9yIChpID0ga2EubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBrZXkgPSBrYVtpXTtcbiAgICBpZiAoIWRlZXBFcXVhbChhW2tleV0sIGJba2V5XSwgb3B0cykpIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHlwZW9mIGEgPT09IHR5cGVvZiBiO1xufVxuIiwidmFyIHN1cHBvcnRzQXJndW1lbnRzQ2xhc3MgPSAoZnVuY3Rpb24oKXtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhcmd1bWVudHMpXG59KSgpID09ICdbb2JqZWN0IEFyZ3VtZW50c10nO1xuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBzdXBwb3J0c0FyZ3VtZW50c0NsYXNzID8gc3VwcG9ydGVkIDogdW5zdXBwb3J0ZWQ7XG5cbmV4cG9ydHMuc3VwcG9ydGVkID0gc3VwcG9ydGVkO1xuZnVuY3Rpb24gc3VwcG9ydGVkKG9iamVjdCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iamVjdCkgPT0gJ1tvYmplY3QgQXJndW1lbnRzXSc7XG59O1xuXG5leHBvcnRzLnVuc3VwcG9ydGVkID0gdW5zdXBwb3J0ZWQ7XG5mdW5jdGlvbiB1bnN1cHBvcnRlZChvYmplY3Qpe1xuICByZXR1cm4gb2JqZWN0ICYmXG4gICAgdHlwZW9mIG9iamVjdCA9PSAnb2JqZWN0JyAmJlxuICAgIHR5cGVvZiBvYmplY3QubGVuZ3RoID09ICdudW1iZXInICYmXG4gICAgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgJ2NhbGxlZScpICYmXG4gICAgIU9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChvYmplY3QsICdjYWxsZWUnKSB8fFxuICAgIGZhbHNlO1xufTtcbiIsImV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHR5cGVvZiBPYmplY3Qua2V5cyA9PT0gJ2Z1bmN0aW9uJ1xuICA/IE9iamVjdC5rZXlzIDogc2hpbTtcblxuZXhwb3J0cy5zaGltID0gc2hpbTtcbmZ1bmN0aW9uIHNoaW0gKG9iaikge1xuICB2YXIga2V5cyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSBrZXlzLnB1c2goa2V5KTtcbiAgcmV0dXJuIGtleXM7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIFRvT2JqZWN0KHZhbCkge1xuXHRpZiAodmFsID09IG51bGwpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdPYmplY3QuYXNzaWduIGNhbm5vdCBiZSBjYWxsZWQgd2l0aCBudWxsIG9yIHVuZGVmaW5lZCcpO1xuXHR9XG5cblx0cmV0dXJuIE9iamVjdCh2YWwpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCwgc291cmNlKSB7XG5cdHZhciBmcm9tO1xuXHR2YXIga2V5cztcblx0dmFyIHRvID0gVG9PYmplY3QodGFyZ2V0KTtcblxuXHRmb3IgKHZhciBzID0gMTsgcyA8IGFyZ3VtZW50cy5sZW5ndGg7IHMrKykge1xuXHRcdGZyb20gPSBhcmd1bWVudHNbc107XG5cdFx0a2V5cyA9IE9iamVjdC5rZXlzKE9iamVjdChmcm9tKSk7XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHRvW2tleXNbaV1dID0gZnJvbVtrZXlzW2ldXTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gdG87XG59O1xuIl19
