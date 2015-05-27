!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Formatic=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/justin/Dropbox/git/formatic/index.js":[function(require,module,exports){
"use strict";

// # index

// Export the Formatic React class at the top level.
module.exports = require("./lib/formatic");

},{"./lib/formatic":"/Users/justin/Dropbox/git/formatic/lib/formatic.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/fields/string.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var defaultConfig = require("../../default-config");

module.exports = React.createClass({
  displayName: "exports",

  render: function render() {
    var config = this.props.config || defaultConfig;

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

},{"../../default-config":"/Users/justin/Dropbox/git/formatic/lib/default-config.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/helpers/field.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

module.exports = React.createClass({
  displayName: "exports",

  render: function render() {
    var config = this.props.config;

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

},{}],"/Users/justin/Dropbox/git/formatic/lib/components/helpers/help.js":[function(require,module,exports){
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

console.log("components:");

module.exports = {
  // fields
  StringField: require("./fields/string"),

  // helpers
  Field: require("./helpers/field"),
  Label: require("./helpers/label"),
  Help: require("./helpers/help")
};

},{"./fields/string":"/Users/justin/Dropbox/git/formatic/lib/components/fields/string.js","./helpers/field":"/Users/justin/Dropbox/git/formatic/lib/components/helpers/field.js","./helpers/help":"/Users/justin/Dropbox/git/formatic/lib/components/helpers/help.js","./helpers/label":"/Users/justin/Dropbox/git/formatic/lib/components/helpers/label.js"}],"/Users/justin/Dropbox/git/formatic/lib/create-config.js":[function(require,module,exports){
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

},{"./undash":"/Users/justin/Dropbox/git/formatic/lib/undash.js"}],"/Users/justin/Dropbox/git/formatic/lib/default-config.js":[function(require,module,exports){
"use strict";

var createConfig = require("./create-config");
var defaultConfigPlugin = require("./plugins/default-config");

module.exports = createConfig(defaultConfigPlugin);

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

},{"./create-config":"/Users/justin/Dropbox/git/formatic/lib/create-config.js","./plugins/default-config":"/Users/justin/Dropbox/git/formatic/lib/plugins/default-config.js"}],"/Users/justin/Dropbox/git/formatic/lib/formatic.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var _ = require("./undash");
var Components = require("./components");
var createConfig = require("./create-config");
var defaultConfig = require("./default-config");
var defaultConfigPlugin = require("./plugins/default-config");

module.exports = React.createClass({
  displayName: "exports",

  statics: _.extend({
    createConfig: createConfig.bind(null, defaultConfigPlugin)
  }, Components),

  render: function render() {
    var config = this.props.config || defaultConfig;

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

},{"./components":"/Users/justin/Dropbox/git/formatic/lib/components/index.js","./create-config":"/Users/justin/Dropbox/git/formatic/lib/create-config.js","./default-config":"/Users/justin/Dropbox/git/formatic/lib/default-config.js","./plugins/default-config":"/Users/justin/Dropbox/git/formatic/lib/plugins/default-config.js","./undash":"/Users/justin/Dropbox/git/formatic/lib/undash.js"}],"/Users/justin/Dropbox/git/formatic/lib/plugins/default-config.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var _ = require("../undash");

console.log("require---");
var Components = require("../components");

console.log(Components);

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
      if (Components[name]) {
        return Components[name];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2luZGV4LmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9maWVsZHMvc3RyaW5nLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2ZpZWxkLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2hlbHAuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvbGFiZWwuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2luZGV4LmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY3JlYXRlLWNvbmZpZy5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2RlZmF1bHQtY29uZmlnLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvZm9ybWF0aWMuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9wbHVnaW5zL2RlZmF1bHQtY29uZmlnLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvdW5kYXNoLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvdXRpbHMuanMiLCJub2RlX21vZHVsZXMvZGVlcC1lcXVhbC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kZWVwLWVxdWFsL2xpYi9pc19hcmd1bWVudHMuanMiLCJub2RlX21vZHVsZXMvZGVlcC1lcXVhbC9saWIva2V5cy5qcyIsIm5vZGVfbW9kdWxlcy9vYmplY3QtYXNzaWduL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7QUNHQSxNQUFNLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDOzs7Ozs7QUNIM0MsSUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQy9CLElBQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDOztBQUV0RCxNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7OztBQUVqQyxRQUFNLEVBQUEsa0JBQUc7QUFDUCxRQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxhQUFhLENBQUM7O0FBRWxELFFBQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7O0FBRTFDLFdBQ0U7QUFBQyxXQUFLO01BQUssSUFBSSxDQUFDLEtBQUs7TUFDbkIsa0NBQVUsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxBQUFDLEdBQUU7S0FDOUIsQ0FDUjtHQUNIOztDQUVGLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2pCSCxJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7O0FBRS9CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7O0FBRWpDLFFBQU0sRUFBQSxrQkFBRztBQUNQLFFBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDOztBQUVqQyxRQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzFDLFFBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7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Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vICMgaW5kZXhcblxuLy8gRXhwb3J0IHRoZSBGb3JtYXRpYyBSZWFjdCBjbGFzcyBhdCB0aGUgdG9wIGxldmVsLlxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9mb3JtYXRpYycpO1xuIiwiY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuY29uc3QgZGVmYXVsdENvbmZpZyA9IHJlcXVpcmUoJy4uLy4uL2RlZmF1bHQtY29uZmlnJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZyB8fCBkZWZhdWx0Q29uZmlnO1xuXG4gICAgY29uc3QgRmllbGQgPSBjb25maWcuaGVscGVyQ2xhc3MoJ2ZpZWxkJyk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPEZpZWxkIHsuLi50aGlzLnByb3BzfT5cbiAgICAgICAgPHRleHRhcmVhIHZhbHVlPXt0aGlzLnByb3BzLnZhbHVlfS8+XG4gICAgICA8L0ZpZWxkPlxuICAgICk7XG4gIH1cblxufSk7XG5cbi8vIC8vICMgc3RyaW5nIGNvbXBvbmVudFxuLy9cbi8vIC8qXG4vLyBSZW5kZXIgYSBmaWVsZCB0aGF0IGNhbiBlZGl0IGEgc3RyaW5nIHZhbHVlLlxuLy8gKi9cbi8vXG4vLyAndXNlIHN0cmljdCc7XG4vL1xuLy8gdmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG4vLyB2YXIgUiA9IFJlYWN0LkRPTTtcbi8vIHZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcbi8vXG4vLyBtb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbi8vXG4vLyAgIGRpc3BsYXlOYW1lOiAnU3RyaW5nJyxcbi8vXG4vLyAgIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcbi8vXG4vLyAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbi8vICAgICB0aGlzLm9uQ2hhbmdlVmFsdWUoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbi8vICAgfSxcbi8vXG4vLyAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuLy8gICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbi8vICAgfSxcbi8vXG4vLyAgIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbi8vXG4vLyAgICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuLy8gICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG4vL1xuLy8gICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQnLCB7XG4vLyAgICAgICBjb25maWc6IGNvbmZpZywgZmllbGQ6IGZpZWxkLCBwbGFpbjogdGhpcy5wcm9wcy5wbGFpblxuLy8gICAgIH0sIFIudGV4dGFyZWEoe1xuLy8gICAgICAgdmFsdWU6IGZpZWxkLnZhbHVlLFxuLy8gICAgICAgY2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpLFxuLy8gICAgICAgcm93czogZmllbGQucm93cyB8fCB0aGlzLnByb3BzLnJvd3MsXG4vLyAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbi8vICAgICAgIG9uRm9jdXM6IHRoaXMub25Gb2N1c0FjdGlvbixcbi8vICAgICAgIG9uQmx1cjogdGhpcy5vbkJsdXJBY3Rpb25cbi8vICAgICB9KSk7XG4vLyAgIH1cbi8vIH0pO1xuIiwiY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG5cbiAgICBjb25zdCBMYWJlbCA9IGNvbmZpZy5oZWxwZXJDbGFzcygnbGFiZWwnKTtcbiAgICBjb25zdCBIZWxwID0gY29uZmlnLmhlbHBlckNsYXNzKCdoZWxwJyk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdj5cbiAgICAgICAgPExhYmVsIHsuLi50aGlzLnByb3BzfS8+XG4gICAgICAgIDxIZWxwIHsuLi50aGlzLnByb3BzfS8+XG4gICAgICAgIHt0aGlzLnByb3BzLmNoaWxkcmVufVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG59KTtcblxuLy8gLy8gIyBmaWVsZCBjb21wb25lbnRcbi8vXG4vLyAvKlxuLy8gVXNlZCBieSBhbnkgZmllbGRzIHRvIHB1dCB0aGUgbGFiZWwgYW5kIGhlbHAgdGV4dCBhcm91bmQgdGhlIGZpZWxkLlxuLy8gKi9cbi8vXG4vLyAndXNlIHN0cmljdCc7XG4vL1xuLy8gdmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG4vLyB2YXIgUiA9IFJlYWN0LkRPTTtcbi8vIHZhciBfID0gcmVxdWlyZSgnLi4vLi4vdW5kYXNoJyk7XG4vLyB2YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG4vL1xuLy8gdmFyIENTU1RyYW5zaXRpb25Hcm91cCA9IFJlYWN0LmNyZWF0ZUZhY3RvcnkoUmVhY3QuYWRkb25zLkNTU1RyYW5zaXRpb25Hcm91cCk7XG4vL1xuLy8gbW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4vL1xuLy8gICBkaXNwbGF5TmFtZTogJ0ZpZWxkJyxcbi8vXG4vLyAgIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG4vL1xuLy8gICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbi8vICAgICByZXR1cm4ge1xuLy8gICAgICAgY29sbGFwc2VkOiB0aGlzLnByb3BzLmNvbmZpZy5maWVsZElzQ29sbGFwc2VkKHRoaXMucHJvcHMuZmllbGQpID8gdHJ1ZSA6IGZhbHNlXG4vLyAgICAgfTtcbi8vICAgfSxcbi8vXG4vLyAgIG9uQ2xpY2tMYWJlbDogZnVuY3Rpb24gKCkge1xuLy8gICAgIHRoaXMuc2V0U3RhdGUoe1xuLy8gICAgICAgY29sbGFwc2VkOiAhdGhpcy5zdGF0ZS5jb2xsYXBzZWRcbi8vICAgICB9KTtcbi8vICAgfSxcbi8vXG4vLyAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuLy8gICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbi8vICAgfSxcbi8vXG4vLyAgIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbi8vXG4vLyAgICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuLy9cbi8vICAgICBpZiAodGhpcy5wcm9wcy5wbGFpbikge1xuLy8gICAgICAgcmV0dXJuIHRoaXMucHJvcHMuY2hpbGRyZW47XG4vLyAgICAgfVxuLy9cbi8vICAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuLy9cbi8vICAgICB2YXIgaW5kZXggPSB0aGlzLnByb3BzLmluZGV4O1xuLy8gICAgIGlmICghXy5pc051bWJlcihpbmRleCkpIHtcbi8vICAgICAgIHZhciBrZXkgPSB0aGlzLnByb3BzLmZpZWxkLmtleTtcbi8vICAgICAgIGluZGV4ID0gXy5pc051bWJlcihrZXkpID8ga2V5IDogdW5kZWZpbmVkO1xuLy8gICAgIH1cbi8vXG4vLyAgICAgdmFyIGNsYXNzZXMgPSBfLmV4dGVuZCh7fSwgdGhpcy5wcm9wcy5jbGFzc2VzKTtcbi8vXG4vLyAgICAgdmFyIGVycm9ycyA9IGNvbmZpZy5maWVsZEVycm9ycyhmaWVsZCk7XG4vL1xuLy8gICAgIGVycm9ycy5mb3JFYWNoKGZ1bmN0aW9uIChlcnJvcikge1xuLy8gICAgICAgY2xhc3Nlc1sndmFsaWRhdGlvbi1lcnJvci0nICsgZXJyb3IudHlwZV0gPSB0cnVlO1xuLy8gICAgIH0pO1xuLy9cbi8vICAgICBpZiAoY29uZmlnLmZpZWxkSXNSZXF1aXJlZChmaWVsZCkpIHtcbi8vICAgICAgIGNsYXNzZXMucmVxdWlyZWQgPSB0cnVlO1xuLy8gICAgIH0gZWxzZSB7XG4vLyAgICAgICBjbGFzc2VzLm9wdGlvbmFsID0gdHJ1ZTtcbi8vICAgICB9XG4vL1xuLy8gICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiBjeChjbGFzc2VzKSwgc3R5bGU6IHtkaXNwbGF5OiAoZmllbGQuaGlkZGVuID8gJ25vbmUnIDogJycpfX0sXG4vLyAgICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgnbGFiZWwnLCB7XG4vLyAgICAgICAgIGNvbmZpZzogY29uZmlnLCBmaWVsZDogZmllbGQsXG4vLyAgICAgICAgIGluZGV4OiBpbmRleCwgb25DbGljazogY29uZmlnLmZpZWxkSXNDb2xsYXBzaWJsZShmaWVsZCkgPyB0aGlzLm9uQ2xpY2tMYWJlbCA6IG51bGxcbi8vICAgICAgIH0pLFxuLy8gICAgICAgQ1NTVHJhbnNpdGlvbkdyb3VwKHt0cmFuc2l0aW9uTmFtZTogJ3JldmVhbCd9LFxuLy8gICAgICAgICB0aGlzLnN0YXRlLmNvbGxhcHNlZCA/IFtdIDogW1xuLy8gICAgICAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdoZWxwJywge1xuLy8gICAgICAgICAgICAgY29uZmlnOiBjb25maWcsIGZpZWxkOiBmaWVsZCxcbi8vICAgICAgICAgICAgIGtleTogJ2hlbHAnXG4vLyAgICAgICAgICAgfSksXG4vLyAgICAgICAgICAgdGhpcy5wcm9wcy5jaGlsZHJlblxuLy8gICAgICAgICBdXG4vLyAgICAgICApXG4vLyAgICAgKTtcbi8vICAgfVxuLy8gfSk7XG4iLCJjb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIHJlbmRlcigpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5oZWxwVGV4dCkge1xuICAgICAgcmV0dXJuIDxkaXY+e3RoaXMucHJvcHMuaGVscFRleHR9PC9kaXY+O1xuICAgIH1cblxuICAgIHJldHVybiA8c3Bhbi8+O1xuICB9XG5cbn0pO1xuXG4vLyAvLyAjIGhlbHAgY29tcG9uZW50XG4vL1xuLy8gLypcbi8vIEp1c3QgdGhlIGhlbHAgdGV4dCBibG9jay5cbi8vICovXG4vL1xuLy8gJ3VzZSBzdHJpY3QnO1xuLy9cbi8vIHZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuLy8gdmFyIFIgPSBSZWFjdC5ET007XG4vLyB2YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG4vL1xuLy8gbW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4vL1xuLy8gICBkaXNwbGF5TmFtZTogJ0hlbHAnLFxuLy9cbi8vICAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcbi8vXG4vLyAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuLy8gICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbi8vICAgfSxcbi8vXG4vLyAgIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbi8vXG4vLyAgICAgdmFyIGhlbHBUZXh0ID0gdGhpcy5wcm9wcy5jb25maWcuZmllbGRIZWxwVGV4dCh0aGlzLnByb3BzLmZpZWxkKTtcbi8vXG4vLyAgICAgcmV0dXJuIGhlbHBUZXh0ID9cbi8vICAgICAgIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcyksIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MOiB7X19odG1sOiBoZWxwVGV4dH19KSA6XG4vLyAgICAgICBSLnNwYW4obnVsbCk7XG4vLyAgIH1cbi8vIH0pO1xuIiwiY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgbGFiZWwgPSB0aGlzLnByb3BzLmxhYmVsIHx8ICcnO1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2PlxuICAgICAgICB7bGFiZWx9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbn0pO1xuXG4vLyAvLyAjIGxhYmVsIGNvbXBvbmVudFxuLy9cbi8vIC8qXG4vLyBKdXN0IHRoZSBsYWJlbCBmb3IgYSBmaWVsZC5cbi8vICovXG4vL1xuLy8gJ3VzZSBzdHJpY3QnO1xuLy9cbi8vIHZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuLy8gdmFyIFIgPSBSZWFjdC5ET007XG4vLyB2YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG4vL1xuLy8gbW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4vL1xuLy8gICBkaXNwbGF5TmFtZTogJ0xhYmVsJyxcbi8vXG4vLyAgIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG4vL1xuLy8gICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbi8vICAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4vLyAgIH0sXG4vL1xuLy8gICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4vLyAgICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuLy8gICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG4vL1xuLy8gICAgIHZhciBmaWVsZExhYmVsID0gY29uZmlnLmZpZWxkTGFiZWwoZmllbGQpO1xuLy9cbi8vICAgICB2YXIgbGFiZWwgPSBudWxsO1xuLy8gICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wcy5pbmRleCA9PT0gJ251bWJlcicpIHtcbi8vICAgICAgIGxhYmVsID0gJycgKyAodGhpcy5wcm9wcy5pbmRleCArIDEpICsgJy4nO1xuLy8gICAgICAgaWYgKGZpZWxkTGFiZWwpIHtcbi8vICAgICAgICAgbGFiZWwgPSBsYWJlbCArICcgJyArIGZpZWxkTGFiZWw7XG4vLyAgICAgICB9XG4vLyAgICAgfVxuLy9cbi8vICAgICBpZiAoZmllbGRMYWJlbCB8fCBsYWJlbCkge1xuLy8gICAgICAgdmFyIHRleHQgPSBsYWJlbCB8fCBmaWVsZExhYmVsO1xuLy8gICAgICAgaWYgKHRoaXMucHJvcHMub25DbGljaykge1xuLy8gICAgICAgICB0ZXh0ID0gUi5hKHtocmVmOiAnSmF2YVNjcmlwdCcgKyAnOicsIG9uQ2xpY2s6IHRoaXMucHJvcHMub25DbGlja30sIHRleHQpO1xuLy8gICAgICAgfVxuLy8gICAgICAgbGFiZWwgPSBSLmxhYmVsKHt9LCB0ZXh0KTtcbi8vICAgICB9XG4vL1xuLy8gICAgIHZhciByZXF1aXJlZE9yTm90O1xuLy9cbi8vICAgICBpZiAoIWNvbmZpZy5maWVsZEhhc1ZhbHVlQ2hpbGRyZW4oZmllbGQpKSB7XG4vLyAgICAgICByZXF1aXJlZE9yTm90ID0gUi5zcGFuKHtcbi8vICAgICAgICAgY2xhc3NOYW1lOiBjb25maWcuZmllbGRJc1JlcXVpcmVkKGZpZWxkKSA/ICdyZXF1aXJlZC10ZXh0JyA6ICdub3QtcmVxdWlyZWQtdGV4dCdcbi8vICAgICAgIH0pO1xuLy8gICAgIH1cbi8vXG4vLyAgICAgcmV0dXJuIFIuZGl2KHtcbi8vICAgICAgIGNsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKVxuLy8gICAgIH0sXG4vLyAgICAgICBsYWJlbCxcbi8vICAgICAgICcgJyxcbi8vICAgICAgIHJlcXVpcmVkT3JOb3Rcbi8vICAgICApO1xuLy8gICB9XG4vLyB9KTtcbiIsImNvbnNvbGUubG9nKCdjb21wb25lbnRzOicpXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAvLyBmaWVsZHNcbiAgU3RyaW5nRmllbGQ6IHJlcXVpcmUoJy4vZmllbGRzL3N0cmluZycpLFxuXG4gIC8vIGhlbHBlcnNcbiAgRmllbGQ6IHJlcXVpcmUoJy4vaGVscGVycy9maWVsZCcpLFxuICBMYWJlbDogcmVxdWlyZSgnLi9oZWxwZXJzL2xhYmVsJyksXG4gIEhlbHA6IHJlcXVpcmUoJy4vaGVscGVycy9oZWxwJylcbn07XG4iLCJ2YXIgXyA9IHJlcXVpcmUoJy4vdW5kYXNoJyk7XG5cbmNvbnN0IGNyZWF0ZUNvbmZpZyA9IGZ1bmN0aW9uICguLi5wbHVnaW5zKSB7XG4gIHJldHVybiBwbHVnaW5zLnJlZHVjZShmdW5jdGlvbiAoY29uZmlnLCBwbHVnaW4pIHtcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKHBsdWdpbikpIHtcbiAgICAgIHZhciBleHRlbnNpb25zID0gcGx1Z2luKGNvbmZpZyk7XG4gICAgICBpZiAoZXh0ZW5zaW9ucykge1xuICAgICAgICBfLmV4dGVuZChjb25maWcsIGV4dGVuc2lvbnMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBfLmV4dGVuZChjb25maWcsIHBsdWdpbik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbmZpZztcbiAgfSwge30pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVDb25maWc7XG4iLCIvLyAjIGRlZmF1bHQtY29uZmlnXG5cbi8qXG5UaGlzIGlzIHRoZSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gcGx1Z2luIGZvciBmb3JtYXRpYy4gVG8gY2hhbmdlIGZvcm1hdGljJ3NcbmJlaGF2aW9yLCBqdXN0IGNyZWF0ZSB5b3VyIG93biBwbHVnaW4gZnVuY3Rpb24gdGhhdCByZXR1cm5zIGFuIG9iamVjdCB3aXRoXG5tZXRob2RzIHlvdSB3YW50IHRvIGFkZCBvciBvdmVycmlkZS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxuY29uc3QgY3JlYXRlQ29uZmlnID0gcmVxdWlyZSgnLi9jcmVhdGUtY29uZmlnJyk7XG5jb25zdCBkZWZhdWx0Q29uZmlnUGx1Z2luID0gcmVxdWlyZSgnLi9wbHVnaW5zL2RlZmF1bHQtY29uZmlnJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlQ29uZmlnKGRlZmF1bHRDb25maWdQbHVnaW4pO1xuXG4vLyBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjb25maWcpIHtcbi8vXG4vLyAgIHZhciBkZWxlZ2F0ZVRvID0gdXRpbHMuZGVsZWdhdG9yKGNvbmZpZyk7XG4vL1xuLy8gICByZXR1cm4ge1xuLy9cbi8vICAgICAvLyBOb3JtYWxpemUgYW4gZWxlbWVudCBuYW1lLlxuLy8gICAgIGVsZW1lbnROYW1lKG5hbWUpIHtcbi8vICAgICAgIHJldHVybiB1dGlscy5kYXNoVG9QYXNjYWwobmFtZSk7XG4vLyAgICAgfSxcbi8vXG4vLyAgICAgY2xhc3MobmFtZSkge1xuLy8gICAgICAgaWYgKCFuYW1lKSB7XG4vLyAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ29tcG9uZW50IGNsYXNzIG5hbWUgbXVzdCBiZSBzcGVjaWZpZWQgdG8gcmV0cmlldmUgY29tcG9uZW50IGNsYXNzLicpO1xuLy8gICAgICAgfVxuLy8gICAgICAgbmFtZSA9IGNvbmZpZy5lbGVtZW50TmFtZShuYW1lKTtcbi8vICAgICAgIGlmIChDb21wb25lbnRzW25hbWVdKSB7XG4vLyAgICAgICAgIHJldHVybiBDb21wb25lbnRzW25hbWVdO1xuLy8gICAgICAgfVxuLy8gICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb21wb25lbnQgY2xhc3MgJHtuYW1lfSBub3QgZm91bmQuYCk7XG4vLyAgICAgfSxcbi8vXG4vLyAgICAgaGVscGVyQ2xhc3MobmFtZSkge1xuLy8gICAgICAgaWYgKCFuYW1lKSB7XG4vLyAgICAgICAgIHRocm93IG5ldyBFcnJvcignSGVscGVyIGNsYXNzIG5hbWUgbXVzdCBiZSBzcGVjaWZpZWQgdG8gcmV0cmlldmUgY29tcG9uZW50IGNsYXNzLicpO1xuLy8gICAgICAgfVxuLy8gICAgICAgbmFtZSA9IGNvbmZpZy5lbGVtZW50TmFtZShuYW1lKTtcbi8vICAgICAgIHJldHVybiBjb25maWcuY2xhc3MobmFtZSk7XG4vLyAgICAgfSxcbi8vXG4vLyAgICAgZmllbGRDbGFzcyhuYW1lKSB7XG4vLyAgICAgICBpZiAoIW5hbWUpIHtcbi8vICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGaWVsZCBjbGFzcyBuYW1lIG11c3QgYmUgc3BlY2lmaWVkIHRvIHJldHJpZXZlIGNvbXBvbmVudCBjbGFzcy4nKTtcbi8vICAgICAgIH1cbi8vICAgICAgIG5hbWUgKz0gJy1maWVsZCc7XG4vLyAgICAgICBuYW1lID0gY29uZmlnLmVsZW1lbnROYW1lKG5hbWUpO1xuLy8gICAgICAgcmV0dXJuIGNvbmZpZy5jbGFzcyhuYW1lKTtcbi8vICAgICB9XG5cbiAgICAvLyAvLyBSZW5kZXIgdGhlIHJvb3QgZm9ybWF0aWMgY29tcG9uZW50XG4gICAgLy8gcmVuZGVyRm9ybWF0aWNDb21wb25lbnQ6IGZ1bmN0aW9uIChjb21wb25lbnQpIHtcbiAgICAvL1xuICAgIC8vICAgY29uc3QgcHJvcHMgPSBjb21wb25lbnQucHJvcHM7XG4gICAgLy9cbiAgICAvLyAgIC8vdmFyIGZpZWxkID0gY29uZmlnLmNyZWF0ZVJvb3RGaWVsZChwcm9wcyk7XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiAoXG4gICAgLy8gICAgIDxkaXYgY2xhc3NOYW1lPVwiZm9ybWF0aWNcIj5cbiAgICAvL1xuICAgIC8vICAgICA8L2Rpdj5cbiAgICAvLyAgICk7XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiAnZm9ybWF0aWMnfSxcbiAgICAvLyAgICAgY29uZmlnLmNyZWF0ZUZpZWxkRWxlbWVudCh7ZmllbGQ6IGZpZWxkLCBvbkNoYW5nZTogY29tcG9uZW50Lm9uQ2hhbmdlLCBvbkFjdGlvbjogY29tcG9uZW50Lm9uQWN0aW9ufSlcbiAgICAvLyAgICk7XG4gICAgLy8gfSxcblxuICAgIC8vIC8vIENyZWF0ZSBhIGZpZWxkIGVsZW1lbnQgZ2l2ZW4gc29tZSBwcm9wcy4gVXNlIGNvbnRleHQgdG8gZGV0ZXJtaW5lIG5hbWUuXG4gICAgLy8gY3JlYXRlRmllbGRFbGVtZW50OiBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAvL1xuICAgIC8vICAgdmFyIG5hbWUgPSBjb25maWcuZmllbGRUeXBlTmFtZShwcm9wcy5maWVsZCk7XG4gICAgLy9cbiAgICAvLyAgIGlmIChjb25maWcuaGFzRWxlbWVudEZhY3RvcnkobmFtZSkpIHtcbiAgICAvLyAgICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KG5hbWUsIHByb3BzKTtcbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdVbmtub3duRmllbGQnLCBwcm9wcyk7XG4gICAgLy8gfSxcblxuICAgIC8vXG4gICAgLy8gLy8gRmllbGQgZWxlbWVudCBmYWN0b3JpZXMuIENyZWF0ZSBmaWVsZCBlbGVtZW50cy5cbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfRmllbGRzOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvZmllbGRzJykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9TdHJpbmc6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9zdHJpbmcnKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X1NpbmdsZUxpbmVTdHJpbmc6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9zaW5nbGUtbGluZS1zdHJpbmcnKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X1NlbGVjdDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL3NlbGVjdCcpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfUHJldHR5U2VsZWN0OiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvcHJldHR5LXNlbGVjdCcpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfQm9vbGVhbjogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL2Jvb2xlYW4nKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X1ByZXR0eUJvb2xlYW46IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9wcmV0dHktYm9vbGVhbicpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfQ2hlY2tib3hCb29sZWFuOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvY2hlY2tib3gtYm9vbGVhbicpKSxcbiAgICAvL1xuICAgIC8vIC8vIGNyZWF0ZUVsZW1lbnRfUHJldHR5VGV4dDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL3ByZXR0eS10ZXh0JykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9QcmV0dHlUZXh0OiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvcHJldHR5LXRleHQyJykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9BcnJheTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL2FycmF5JykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9DaGVja2JveEFycmF5OiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvY2hlY2tib3gtYXJyYXknKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X09iamVjdDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL29iamVjdCcpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfSnNvbjogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL2pzb24nKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X1Vua25vd25GaWVsZDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL3Vua25vd24nKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X0NvcHk6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9jb3B5JykpLFxuICAgIC8vXG4gICAgLy9cbiAgICAvLyAvLyBPdGhlciBlbGVtZW50IGZhY3Rvcmllcy4gQ3JlYXRlIGhlbHBlciBlbGVtZW50cyB1c2VkIGJ5IGZpZWxkIGNvbXBvbmVudHMuXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X0ZpZWxkOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2ZpZWxkJykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9MYWJlbDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9sYWJlbCcpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfSGVscDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9oZWxwJykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9DaG9pY2VzOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2Nob2ljZXMnKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X0xvYWRpbmdDaG9pY2VzOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2xvYWRpbmctY2hvaWNlcycpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfQXJyYXlDb250cm9sOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2FycmF5LWNvbnRyb2wnKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X0FycmF5SXRlbUNvbnRyb2w6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvYXJyYXktaXRlbS1jb250cm9sJykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9BcnJheUl0ZW1WYWx1ZTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9hcnJheS1pdGVtLXZhbHVlJykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9BcnJheUl0ZW06IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvYXJyYXktaXRlbScpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfRmllbGRUZW1wbGF0ZUNob2ljZXM6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvZmllbGQtdGVtcGxhdGUtY2hvaWNlcycpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfQWRkSXRlbTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9hZGQtaXRlbScpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfUmVtb3ZlSXRlbTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9yZW1vdmUtaXRlbScpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfTW92ZUl0ZW1Gb3J3YXJkOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL21vdmUtaXRlbS1mb3J3YXJkJykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9Nb3ZlSXRlbUJhY2s6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvbW92ZS1pdGVtLWJhY2snKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X09iamVjdENvbnRyb2w6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWNvbnRyb2wnKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X09iamVjdEl0ZW1Db250cm9sOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL29iamVjdC1pdGVtLWNvbnRyb2wnKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X09iamVjdEl0ZW1WYWx1ZTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9vYmplY3QtaXRlbS12YWx1ZScpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfT2JqZWN0SXRlbUtleTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9vYmplY3QtaXRlbS1rZXknKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X09iamVjdEl0ZW06IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWl0ZW0nKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X1NlbGVjdFZhbHVlOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL3NlbGVjdC12YWx1ZScpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfUHJldHR5U2VsZWN0VmFsdWU6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvcHJldHR5LXNlbGVjdC12YWx1ZScpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfU2FtcGxlOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL3NhbXBsZScpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfSW5zZXJ0QnV0dG9uOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2luc2VydC1idXR0b24nKSksXG4gICAgLy9cbiAgICAvL1xuICAgIC8vIC8vIEZpZWxkIGRlZmF1bHQgdmFsdWUgZmFjdG9yaWVzLiBHaXZlIGEgZGVmYXVsdCB2YWx1ZSBmb3IgYSBzcGVjaWZpYyB0eXBlLlxuICAgIC8vXG4gICAgLy8gY3JlYXRlRGVmYXVsdFZhbHVlX1N0cmluZzogZnVuY3Rpb24gKC8qIGZpZWxkVGVtcGxhdGUgKi8pIHtcbiAgICAvLyAgIHJldHVybiAnJztcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRGVmYXVsdFZhbHVlX09iamVjdDogZnVuY3Rpb24gKC8qIGZpZWxkVGVtcGxhdGUgKi8pIHtcbiAgICAvLyAgIHJldHVybiB7fTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRGVmYXVsdFZhbHVlX0FycmF5OiBmdW5jdGlvbiAoLyogZmllbGRUZW1wbGF0ZSAqLykge1xuICAgIC8vICAgcmV0dXJuIFtdO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyBjcmVhdGVEZWZhdWx0VmFsdWVfQm9vbGVhbjogZnVuY3Rpb24gKC8qIGZpZWxkVGVtcGxhdGUgKi8pIHtcbiAgICAvLyAgIHJldHVybiBmYWxzZTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRGVmYXVsdFZhbHVlX0ZpZWxkczogZGVsZWdhdGVUbygnY3JlYXRlRGVmYXVsdFZhbHVlX09iamVjdCcpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRGVmYXVsdFZhbHVlX1NpbmdsZUxpbmVTdHJpbmc6IGRlbGVnYXRlVG8oJ2NyZWF0ZURlZmF1bHRWYWx1ZV9TdHJpbmcnKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZURlZmF1bHRWYWx1ZV9TZWxlY3Q6IGRlbGVnYXRlVG8oJ2NyZWF0ZURlZmF1bHRWYWx1ZV9TdHJpbmcnKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZURlZmF1bHRWYWx1ZV9Kc29uOiBkZWxlZ2F0ZVRvKCdjcmVhdGVEZWZhdWx0VmFsdWVfT2JqZWN0JyksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVEZWZhdWx0VmFsdWVfQ2hlY2tib3hBcnJheTogZGVsZWdhdGVUbygnY3JlYXRlRGVmYXVsdFZhbHVlX0FycmF5JyksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVEZWZhdWx0VmFsdWVfQ2hlY2tib3hCb29sZWFuOiBkZWxlZ2F0ZVRvKCdjcmVhdGVEZWZhdWx0VmFsdWVfQm9vbGVhbicpLFxuICAgIC8vXG4gICAgLy9cbiAgICAvLyAvLyBGaWVsZCB2YWx1ZSBjb2VyY2Vycy4gQ29lcmNlIGEgdmFsdWUgaW50byBhIHZhbHVlIGFwcHJvcHJpYXRlIGZvciBhIHNwZWNpZmljIHR5cGUuXG4gICAgLy9cbiAgICAvLyBjb2VyY2VWYWx1ZV9TdHJpbmc6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlLCB2YWx1ZSkge1xuICAgIC8vICAgaWYgKF8uaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgLy8gICAgIHJldHVybiB2YWx1ZTtcbiAgICAvLyAgIH1cbiAgICAvLyAgIGlmIChfLmlzVW5kZWZpbmVkKHZhbHVlKSB8fCB2YWx1ZSA9PT0gbnVsbCkge1xuICAgIC8vICAgICByZXR1cm4gJyc7XG4gICAgLy8gICB9XG4gICAgLy8gICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyBjb2VyY2VWYWx1ZV9PYmplY3Q6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlLCB2YWx1ZSkge1xuICAgIC8vICAgaWYgKCFfLmlzT2JqZWN0KHZhbHVlKSkge1xuICAgIC8vICAgICByZXR1cm4ge307XG4gICAgLy8gICB9XG4gICAgLy8gICByZXR1cm4gdmFsdWU7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIGNvZXJjZVZhbHVlX0FycmF5OiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSwgdmFsdWUpIHtcbiAgICAvLyAgIGlmICghXy5pc0FycmF5KHZhbHVlKSkge1xuICAgIC8vICAgICByZXR1cm4gW3ZhbHVlXTtcbiAgICAvLyAgIH1cbiAgICAvLyAgIHJldHVybiB2YWx1ZTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gY29lcmNlVmFsdWVfQm9vbGVhbjogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUsIHZhbHVlKSB7XG4gICAgLy8gICByZXR1cm4gY29uZmlnLmNvZXJjZVZhbHVlVG9Cb29sZWFuKHZhbHVlKTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gY29lcmNlVmFsdWVfRmllbGRzOiBkZWxlZ2F0ZVRvKCdjb2VyY2VWYWx1ZV9PYmplY3QnKSxcbiAgICAvL1xuICAgIC8vIGNvZXJjZVZhbHVlX1NpbmdsZUxpbmVTdHJpbmc6IGRlbGVnYXRlVG8oJ2NvZXJjZVZhbHVlX1N0cmluZycpLFxuICAgIC8vXG4gICAgLy8gY29lcmNlVmFsdWVfU2VsZWN0OiBkZWxlZ2F0ZVRvKCdjb2VyY2VWYWx1ZV9TdHJpbmcnKSxcbiAgICAvL1xuICAgIC8vIGNvZXJjZVZhbHVlX0pzb246IGRlbGVnYXRlVG8oJ2NvZXJjZVZhbHVlX09iamVjdCcpLFxuICAgIC8vXG4gICAgLy8gY29lcmNlVmFsdWVfQ2hlY2tib3hBcnJheTogZGVsZWdhdGVUbygnY29lcmNlVmFsdWVfQXJyYXknKSxcbiAgICAvL1xuICAgIC8vIGNvZXJjZVZhbHVlX0NoZWNrYm94Qm9vbGVhbjogZGVsZWdhdGVUbygnY29lcmNlVmFsdWVfQm9vbGVhbicpLFxuICAgIC8vXG4gICAgLy9cbiAgICAvLyAvLyBGaWVsZCBjaGlsZCBmaWVsZHMgZmFjdG9yaWVzLCBzbyBzb21lIHR5cGVzIGNhbiBoYXZlIGR5bmFtaWMgY2hpbGRyZW4uXG4gICAgLy9cbiAgICAvLyBjcmVhdGVDaGlsZEZpZWxkc19BcnJheTogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiBmaWVsZC52YWx1ZS5tYXAoZnVuY3Rpb24gKGFycmF5SXRlbSwgaSkge1xuICAgIC8vICAgICB2YXIgY2hpbGRGaWVsZFRlbXBsYXRlID0gY29uZmlnLmNoaWxkRmllbGRUZW1wbGF0ZUZvclZhbHVlKGZpZWxkLCBhcnJheUl0ZW0pO1xuICAgIC8vXG4gICAgLy8gICAgIHZhciBjaGlsZEZpZWxkID0gY29uZmlnLmNyZWF0ZUNoaWxkRmllbGQoZmllbGQsIHtcbiAgICAvLyAgICAgICBmaWVsZFRlbXBsYXRlOiBjaGlsZEZpZWxkVGVtcGxhdGUsIGtleTogaSwgZmllbGRJbmRleDogaSwgdmFsdWU6IGFycmF5SXRlbVxuICAgIC8vICAgICB9KTtcbiAgICAvL1xuICAgIC8vICAgICByZXR1cm4gY2hpbGRGaWVsZDtcbiAgICAvLyAgIH0pO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyBjcmVhdGVDaGlsZEZpZWxkc19PYmplY3Q6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIC8vXG4gICAgLy8gICByZXR1cm4gT2JqZWN0LmtleXMoZmllbGQudmFsdWUpLm1hcChmdW5jdGlvbiAoa2V5LCBpKSB7XG4gICAgLy8gICAgIHZhciBjaGlsZEZpZWxkVGVtcGxhdGUgPSBjb25maWcuY2hpbGRGaWVsZFRlbXBsYXRlRm9yVmFsdWUoZmllbGQsIGZpZWxkLnZhbHVlW2tleV0pO1xuICAgIC8vXG4gICAgLy8gICAgIHZhciBjaGlsZEZpZWxkID0gY29uZmlnLmNyZWF0ZUNoaWxkRmllbGQoZmllbGQsIHtcbiAgICAvLyAgICAgICBmaWVsZFRlbXBsYXRlOiBjaGlsZEZpZWxkVGVtcGxhdGUsIGtleToga2V5LCBmaWVsZEluZGV4OiBpLCB2YWx1ZTogZmllbGQudmFsdWVba2V5XVxuICAgIC8vICAgICB9KTtcbiAgICAvL1xuICAgIC8vICAgICByZXR1cm4gY2hpbGRGaWVsZDtcbiAgICAvLyAgIH0pO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBDaGVjayBpZiB0aGVyZSBpcyBhIGZhY3RvcnkgZm9yIHRoZSBuYW1lLlxuICAgIC8vIGhhc0VsZW1lbnRGYWN0b3J5OiBmdW5jdGlvbiAobmFtZSkge1xuICAgIC8vXG4gICAgLy8gICByZXR1cm4gY29uZmlnWydjcmVhdGVFbGVtZW50XycgKyBuYW1lXSA/IHRydWUgOiBmYWxzZTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gQ3JlYXRlIGFuIGVsZW1lbnQgZ2l2ZW4gYSBuYW1lLCBwcm9wcywgYW5kIGNoaWxkcmVuLlxuICAgIC8vIGNyZWF0ZUVsZW1lbnQ6IGZ1bmN0aW9uIChuYW1lLCBwcm9wcywgY2hpbGRyZW4pIHtcbiAgICAvL1xuICAgIC8vICAgaWYgKCFwcm9wcy5jb25maWcpIHtcbiAgICAvLyAgICAgcHJvcHMgPSBfLmV4dGVuZCh7fSwgcHJvcHMsIHtjb25maWc6IGNvbmZpZ30pO1xuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICBuYW1lID0gY29uZmlnLmVsZW1lbnROYW1lKG5hbWUpO1xuICAgIC8vXG4gICAgLy8gICBpZiAoY29uZmlnWydjcmVhdGVFbGVtZW50XycgKyBuYW1lXSkge1xuICAgIC8vICAgICByZXR1cm4gY29uZmlnWydjcmVhdGVFbGVtZW50XycgKyBuYW1lXShwcm9wcywgY2hpbGRyZW4pO1xuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICBpZiAobmFtZSAhPT0gJ1Vua25vd24nKSB7XG4gICAgLy8gICAgIGlmIChjb25maWcuaGFzRWxlbWVudEZhY3RvcnkoJ1Vua25vd24nKSkge1xuICAgIC8vICAgICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnVW5rbm93bicsIHByb3BzLCBjaGlsZHJlbik7XG4gICAgLy8gICAgIH1cbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgdGhyb3cgbmV3IEVycm9yKCdGYWN0b3J5IG5vdCBmb3VuZCBmb3I6ICcgKyBuYW1lKTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gQ3JlYXRlIGEgZmllbGQgZWxlbWVudCBnaXZlbiBzb21lIHByb3BzLiBVc2UgY29udGV4dCB0byBkZXRlcm1pbmUgbmFtZS5cbiAgICAvLyBjcmVhdGVGaWVsZEVsZW1lbnQ6IGZ1bmN0aW9uIChwcm9wcykge1xuICAgIC8vXG4gICAgLy8gICB2YXIgbmFtZSA9IGNvbmZpZy5maWVsZFR5cGVOYW1lKHByb3BzLmZpZWxkKTtcbiAgICAvL1xuICAgIC8vICAgaWYgKGNvbmZpZy5oYXNFbGVtZW50RmFjdG9yeShuYW1lKSkge1xuICAgIC8vICAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQobmFtZSwgcHJvcHMpO1xuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ1Vua25vd25GaWVsZCcsIHByb3BzKTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gUmVuZGVyIHRoZSByb290IGZvcm1hdGljIGNvbXBvbmVudFxuICAgIC8vIHJlbmRlckZvcm1hdGljQ29tcG9uZW50OiBmdW5jdGlvbiAoY29tcG9uZW50KSB7XG4gICAgLy9cbiAgICAvLyAgIHZhciBwcm9wcyA9IGNvbXBvbmVudC5wcm9wcztcbiAgICAvL1xuICAgIC8vICAgdmFyIGZpZWxkID0gY29uZmlnLmNyZWF0ZVJvb3RGaWVsZChwcm9wcyk7XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiAnZm9ybWF0aWMnfSxcbiAgICAvLyAgICAgY29uZmlnLmNyZWF0ZUZpZWxkRWxlbWVudCh7ZmllbGQ6IGZpZWxkLCBvbkNoYW5nZTogY29tcG9uZW50Lm9uQ2hhbmdlLCBvbkFjdGlvbjogY29tcG9uZW50Lm9uQWN0aW9ufSlcbiAgICAvLyAgICk7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIFJlbmRlciBhbnkgY29tcG9uZW50LlxuICAgIC8vIHJlbmRlckNvbXBvbmVudDogZnVuY3Rpb24gKGNvbXBvbmVudCkge1xuICAgIC8vXG4gICAgLy8gICB2YXIgbmFtZSA9IGNvbXBvbmVudC5jb25zdHJ1Y3Rvci5kaXNwbGF5TmFtZTtcbiAgICAvL1xuICAgIC8vICAgaWYgKGNvbmZpZ1sncmVuZGVyQ29tcG9uZW50XycgKyBuYW1lXSkge1xuICAgIC8vICAgICByZXR1cm4gY29uZmlnWydyZW5kZXJDb21wb25lbnRfJyArIG5hbWVdKGNvbXBvbmVudCk7XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiBjb21wb25lbnQucmVuZGVyRGVmYXVsdCgpO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBSZW5kZXIgZmllbGQgY29tcG9uZW50cy5cbiAgICAvLyByZW5kZXJGaWVsZENvbXBvbmVudDogZnVuY3Rpb24gKGNvbXBvbmVudCkge1xuICAgIC8vXG4gICAgLy8gICByZXR1cm4gY29uZmlnLnJlbmRlckNvbXBvbmVudChjb21wb25lbnQpO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBOb3JtYWxpemUgYW4gZWxlbWVudCBuYW1lLlxuICAgIC8vIGVsZW1lbnROYW1lOiBmdW5jdGlvbiAobmFtZSkge1xuICAgIC8vICAgcmV0dXJuIHV0aWxzLmRhc2hUb1Bhc2NhbChuYW1lKTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gVHlwZSBhbGlhc2VzLlxuICAgIC8vXG4gICAgLy8gYWxpYXNfRGljdDogJ09iamVjdCcsXG4gICAgLy9cbiAgICAvLyBhbGlhc19Cb29sOiAnQm9vbGVhbicsXG4gICAgLy9cbiAgICAvLyBhbGlhc19QcmV0dHlUZXh0YXJlYTogJ1ByZXR0eVRleHQnLFxuICAgIC8vXG4gICAgLy8gYWxpYXNfU2luZ2xlTGluZVN0cmluZzogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcbiAgICAvLyAgIGlmIChmaWVsZFRlbXBsYXRlLnJlcGxhY2VDaG9pY2VzKSB7XG4gICAgLy8gICAgIHJldHVybiAnUHJldHR5VGV4dCc7XG4gICAgLy8gICB9IGVsc2UgaWYgKGZpZWxkVGVtcGxhdGUuY2hvaWNlcykge1xuICAgIC8vICAgICByZXR1cm4gJ1NlbGVjdCc7XG4gICAgLy8gICB9XG4gICAgLy8gICByZXR1cm4gJ1NpbmdsZUxpbmVTdHJpbmcnO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyBhbGlhc19TdHJpbmc6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgLy9cbiAgICAvLyAgIGlmIChmaWVsZFRlbXBsYXRlLnJlcGxhY2VDaG9pY2VzKSB7XG4gICAgLy8gICAgIHJldHVybiAnUHJldHR5VGV4dCc7XG4gICAgLy8gICB9IGVsc2UgaWYgKGZpZWxkVGVtcGxhdGUuY2hvaWNlcykge1xuICAgIC8vICAgICByZXR1cm4gJ1NlbGVjdCc7XG4gICAgLy8gICB9IGVsc2UgaWYgKGNvbmZpZy5maWVsZFRlbXBsYXRlSXNTaW5nbGVMaW5lKGZpZWxkVGVtcGxhdGUpKSB7XG4gICAgLy8gICAgIHJldHVybiAnU2luZ2xlTGluZVN0cmluZyc7XG4gICAgLy8gICB9XG4gICAgLy8gICByZXR1cm4gJ1N0cmluZyc7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIGFsaWFzX1RleHQ6IGRlbGVnYXRlVG8oJ2FsaWFzX1N0cmluZycpLFxuICAgIC8vXG4gICAgLy8gYWxpYXNfVW5pY29kZTogZGVsZWdhdGVUbygnYWxpYXNfU2luZ2xlTGluZVN0cmluZycpLFxuICAgIC8vXG4gICAgLy8gYWxpYXNfU3RyOiBkZWxlZ2F0ZVRvKCdhbGlhc19TaW5nbGVMaW5lU3RyaW5nJyksXG4gICAgLy9cbiAgICAvLyBhbGlhc19MaXN0OiAnQXJyYXknLFxuICAgIC8vXG4gICAgLy8gYWxpYXNfQ2hlY2tib3hMaXN0OiAnQ2hlY2tib3hBcnJheScsXG4gICAgLy9cbiAgICAvLyBhbGlhc19GaWVsZHNldDogJ0ZpZWxkcycsXG4gICAgLy9cbiAgICAvLyBhbGlhc19DaGVja2JveDogJ0NoZWNrYm94Qm9vbGVhbicsXG4gICAgLy9cbiAgICAvLyAvLyBGaWVsZCBmYWN0b3J5XG4gICAgLy9cbiAgICAvLyAvLyBHaXZlbiBhIGZpZWxkLCBleHBhbmQgYWxsIGNoaWxkIGZpZWxkcyByZWN1cnNpdmVseSB0byBnZXQgdGhlIGRlZmF1bHRcbiAgICAvLyAvLyB2YWx1ZXMgb2YgYWxsIGZpZWxkcy5cbiAgICAvLyBpbmZsYXRlRmllbGRWYWx1ZTogZnVuY3Rpb24gKGZpZWxkLCBmaWVsZEhhbmRsZXIpIHtcbiAgICAvL1xuICAgIC8vICAgaWYgKGZpZWxkSGFuZGxlcikge1xuICAgIC8vICAgICB2YXIgc3RvcCA9IGZpZWxkSGFuZGxlcihmaWVsZCk7XG4gICAgLy8gICAgIGlmIChzdG9wID09PSBmYWxzZSkge1xuICAgIC8vICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgLy8gICAgIH1cbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgaWYgKGNvbmZpZy5maWVsZEhhc1ZhbHVlQ2hpbGRyZW4oZmllbGQpKSB7XG4gICAgLy8gICAgIHZhciB2YWx1ZSA9IF8uY2xvbmUoZmllbGQudmFsdWUpO1xuICAgIC8vICAgICB2YXIgY2hpbGRGaWVsZHMgPSBjb25maWcuY3JlYXRlQ2hpbGRGaWVsZHMoZmllbGQpO1xuICAgIC8vICAgICBjaGlsZEZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uIChjaGlsZEZpZWxkKSB7XG4gICAgLy8gICAgICAgaWYgKGNvbmZpZy5pc0tleShjaGlsZEZpZWxkLmtleSkpIHtcbiAgICAvLyAgICAgICAgIHZhbHVlW2NoaWxkRmllbGQua2V5XSA9IGNvbmZpZy5pbmZsYXRlRmllbGRWYWx1ZShjaGlsZEZpZWxkLCBmaWVsZEhhbmRsZXIpO1xuICAgIC8vICAgICAgIH1cbiAgICAvLyAgICAgfSk7XG4gICAgLy8gICAgIHJldHVybiB2YWx1ZTtcbiAgICAvLyAgIH0gZWxzZSB7XG4gICAgLy8gICAgIHJldHVybiBmaWVsZC52YWx1ZTtcbiAgICAvLyAgIH1cbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gSW5pdGlhbGl6ZSB0aGUgcm9vdCBmaWVsZC5cbiAgICAvLyBpbml0Um9vdEZpZWxkOiBmdW5jdGlvbiAoLyogZmllbGQsIHByb3BzICovKSB7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIEluaXRpYWxpemUgZXZlcnkgZmllbGQuXG4gICAgLy8gaW5pdEZpZWxkOiBmdW5jdGlvbiAoLyogZmllbGQgKi8pIHtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gSWYgYW4gYXJyYXkgb2YgZmllbGQgdGVtcGxhdGVzIGFyZSBwYXNzZWQgaW4sIHRoaXMgbWV0aG9kIGlzIHVzZWQgdG9cbiAgICAvLyAvLyB3cmFwIHRoZSBmaWVsZHMgaW5zaWRlIGEgc2luZ2xlIHJvb3QgZmllbGQgdGVtcGxhdGUuXG4gICAgLy8gd3JhcEZpZWxkVGVtcGxhdGVzOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZXMpIHtcbiAgICAvLyAgIHJldHVybiB7XG4gICAgLy8gICAgIHR5cGU6ICdmaWVsZHMnLFxuICAgIC8vICAgICBwbGFpbjogdHJ1ZSxcbiAgICAvLyAgICAgZmllbGRzOiBmaWVsZFRlbXBsYXRlc1xuICAgIC8vICAgfTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gR2l2ZW4gdGhlIHByb3BzIHRoYXQgYXJlIHBhc3NlZCBpbiwgY3JlYXRlIHRoZSByb290IGZpZWxkLlxuICAgIC8vIGNyZWF0ZVJvb3RGaWVsZDogZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgLy9cbiAgICAvLyAgIHZhciBmaWVsZFRlbXBsYXRlID0gcHJvcHMuZmllbGRUZW1wbGF0ZSB8fCBwcm9wcy5maWVsZFRlbXBsYXRlcyB8fCBwcm9wcy5maWVsZCB8fCBwcm9wcy5maWVsZHM7XG4gICAgLy8gICB2YXIgdmFsdWUgPSBwcm9wcy52YWx1ZTtcbiAgICAvL1xuICAgIC8vICAgaWYgKCFmaWVsZFRlbXBsYXRlKSB7XG4gICAgLy8gICAgIGZpZWxkVGVtcGxhdGUgPSBjb25maWcuY3JlYXRlRmllbGRUZW1wbGF0ZUZyb21WYWx1ZSh2YWx1ZSk7XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIGlmIChfLmlzQXJyYXkoZmllbGRUZW1wbGF0ZSkpIHtcbiAgICAvLyAgICAgZmllbGRUZW1wbGF0ZSA9IGNvbmZpZy53cmFwRmllbGRUZW1wbGF0ZXMoZmllbGRUZW1wbGF0ZSk7XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIHZhciBmaWVsZCA9IF8uZXh0ZW5kKHt9LCBmaWVsZFRlbXBsYXRlLCB7cmF3RmllbGRUZW1wbGF0ZTogZmllbGRUZW1wbGF0ZX0pO1xuICAgIC8vICAgaWYgKGNvbmZpZy5oYXNWYWx1ZShmaWVsZFRlbXBsYXRlLCB2YWx1ZSkpIHtcbiAgICAvLyAgICAgZmllbGQudmFsdWUgPSBjb25maWcuY29lcmNlVmFsdWUoZmllbGRUZW1wbGF0ZSwgdmFsdWUpO1xuICAgIC8vICAgfSBlbHNlIHtcbiAgICAvLyAgICAgZmllbGQudmFsdWUgPSBjb25maWcuY3JlYXRlRGVmYXVsdFZhbHVlKGZpZWxkVGVtcGxhdGUpO1xuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICBjb25maWcuaW5pdFJvb3RGaWVsZChmaWVsZCwgcHJvcHMpO1xuICAgIC8vICAgY29uZmlnLmluaXRGaWVsZChmaWVsZCk7XG4gICAgLy9cbiAgICAvLyAgIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCBjb25maWcuaXNFbXB0eU9iamVjdCh2YWx1ZSkgfHwgXy5pc1VuZGVmaW5lZCh2YWx1ZSkpIHtcbiAgICAvLyAgICAgZmllbGQudmFsdWUgPSBjb25maWcuaW5mbGF0ZUZpZWxkVmFsdWUoZmllbGQpO1xuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICByZXR1cm4gZmllbGQ7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIEdpdmVuIHRoZSBwcm9wcyB0aGF0IGFyZSBwYXNzZWQgaW4sIGNyZWF0ZSB0aGUgdmFsdWUgdGhhdCB3aWxsIGJlIGRpc3BsYXllZFxuICAgIC8vIC8vIGJ5IGFsbCB0aGUgY29tcG9uZW50cy5cbiAgICAvLyBjcmVhdGVSb290VmFsdWU6IGZ1bmN0aW9uIChwcm9wcywgZmllbGRIYW5kbGVyKSB7XG4gICAgLy9cbiAgICAvLyAgIHZhciBmaWVsZCA9IGNvbmZpZy5jcmVhdGVSb290RmllbGQocHJvcHMpO1xuICAgIC8vXG4gICAgLy8gICByZXR1cm4gY29uZmlnLmluZmxhdGVGaWVsZFZhbHVlKGZpZWxkLCBmaWVsZEhhbmRsZXIpO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyB2YWxpZGF0ZVJvb3RWYWx1ZTogZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgLy9cbiAgICAvLyAgIHZhciBlcnJvcnMgPSBbXTtcbiAgICAvL1xuICAgIC8vICAgY29uZmlnLmNyZWF0ZVJvb3RWYWx1ZShwcm9wcywgZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgLy8gICAgIHZhciBmaWVsZEVycm9ycyA9IGNvbmZpZy5maWVsZEVycm9ycyhmaWVsZCk7XG4gICAgLy8gICAgIGlmIChmaWVsZEVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgLy8gICAgICAgZXJyb3JzLnB1c2goe1xuICAgIC8vICAgICAgICAgcGF0aDogY29uZmlnLmZpZWxkVmFsdWVQYXRoKGZpZWxkKSxcbiAgICAvLyAgICAgICAgIGVycm9yczogZmllbGRFcnJvcnNcbiAgICAvLyAgICAgICB9KTtcbiAgICAvLyAgICAgfVxuICAgIC8vICAgfSk7XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiBlcnJvcnM7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIGlzVmFsaWRSb290VmFsdWU6IGZ1bmN0aW9uIChwcm9wcykge1xuICAgIC8vXG4gICAgLy8gICB2YXIgaXNWYWxpZCA9IHRydWU7XG4gICAgLy9cbiAgICAvLyAgIGNvbmZpZy5jcmVhdGVSb290VmFsdWUocHJvcHMsIGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIC8vICAgICBpZiAoY29uZmlnLmZpZWxkRXJyb3JzKGZpZWxkKS5sZW5ndGggPiAwKSB7XG4gICAgLy8gICAgICAgaXNWYWxpZCA9IGZhbHNlO1xuICAgIC8vICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAvLyAgICAgfVxuICAgIC8vICAgfSk7XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiBpc1ZhbGlkO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyB2YWxpZGF0ZUZpZWxkOiBmdW5jdGlvbiAoZmllbGQsIGVycm9ycykge1xuICAgIC8vXG4gICAgLy8gICBpZiAoZmllbGQudmFsdWUgPT09IHVuZGVmaW5lZCB8fCBmaWVsZC52YWx1ZSA9PT0gJycpIHtcbiAgICAvLyAgICAgaWYgKGNvbmZpZy5maWVsZElzUmVxdWlyZWQoZmllbGQpKSB7XG4gICAgLy8gICAgICAgZXJyb3JzLnB1c2goe1xuICAgIC8vICAgICAgICAgdHlwZTogJ3JlcXVpcmVkJ1xuICAgIC8vICAgICAgIH0pO1xuICAgIC8vICAgICB9XG4gICAgLy8gICB9XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIENyZWF0ZSBkeW5hbWljIGNoaWxkIGZpZWxkcyBmb3IgYSBmaWVsZC5cbiAgICAvLyBjcmVhdGVDaGlsZEZpZWxkczogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgLy9cbiAgICAvLyAgIHZhciB0eXBlTmFtZSA9IGNvbmZpZy5maWVsZFR5cGVOYW1lKGZpZWxkKTtcbiAgICAvL1xuICAgIC8vICAgaWYgKGNvbmZpZ1snY3JlYXRlQ2hpbGRGaWVsZHNfJyArIHR5cGVOYW1lXSkge1xuICAgIC8vICAgICByZXR1cm4gY29uZmlnWydjcmVhdGVDaGlsZEZpZWxkc18nICsgdHlwZU5hbWVdKGZpZWxkKTtcbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgcmV0dXJuIGNvbmZpZy5maWVsZENoaWxkRmllbGRUZW1wbGF0ZXMoZmllbGQpLm1hcChmdW5jdGlvbiAoY2hpbGRGaWVsZCwgaSkge1xuICAgIC8vICAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUNoaWxkRmllbGQoZmllbGQsIHtcbiAgICAvLyAgICAgICBmaWVsZFRlbXBsYXRlOiBjaGlsZEZpZWxkLCBrZXk6IGNoaWxkRmllbGQua2V5LCBmaWVsZEluZGV4OiBpLCB2YWx1ZTogZmllbGQudmFsdWVbY2hpbGRGaWVsZC5rZXldXG4gICAgLy8gICAgIH0pO1xuICAgIC8vICAgfSk7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIENyZWF0ZSBhIHNpbmdsZSBjaGlsZCBmaWVsZCBmb3IgYSBwYXJlbnQgZmllbGQuXG4gICAgLy8gY3JlYXRlQ2hpbGRGaWVsZDogZnVuY3Rpb24gKHBhcmVudEZpZWxkLCBvcHRpb25zKSB7XG4gICAgLy9cbiAgICAvLyAgIHZhciBjaGlsZFZhbHVlID0gb3B0aW9ucy52YWx1ZTtcbiAgICAvL1xuICAgIC8vICAgdmFyIGNoaWxkRmllbGQgPSBfLmV4dGVuZCh7fSwgb3B0aW9ucy5maWVsZFRlbXBsYXRlLCB7XG4gICAgLy8gICAgIGtleTogb3B0aW9ucy5rZXksIHBhcmVudDogcGFyZW50RmllbGQsIGZpZWxkSW5kZXg6IG9wdGlvbnMuZmllbGRJbmRleCxcbiAgICAvLyAgICAgcmF3RmllbGRUZW1wbGF0ZTogb3B0aW9ucy5maWVsZFRlbXBsYXRlXG4gICAgLy8gICB9KTtcbiAgICAvL1xuICAgIC8vICAgaWYgKGNvbmZpZy5oYXNWYWx1ZShvcHRpb25zLmZpZWxkVGVtcGxhdGUsIGNoaWxkVmFsdWUpKSB7XG4gICAgLy8gICAgIGNoaWxkRmllbGQudmFsdWUgPSBjb25maWcuY29lcmNlVmFsdWUob3B0aW9ucy5maWVsZFRlbXBsYXRlLCBjaGlsZFZhbHVlKTtcbiAgICAvLyAgIH0gZWxzZSB7XG4gICAgLy8gICAgIGNoaWxkRmllbGQudmFsdWUgPSBjb25maWcuY3JlYXRlRGVmYXVsdFZhbHVlKG9wdGlvbnMuZmllbGRUZW1wbGF0ZSk7XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIGNvbmZpZy5pbml0RmllbGQoY2hpbGRGaWVsZCk7XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiBjaGlsZEZpZWxkO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBDcmVhdGUgYSB0ZW1wb3JhcnkgZmllbGQgYW5kIGV4dHJhY3QgaXRzIHZhbHVlLlxuICAgIC8vIGNyZWF0ZU5ld0NoaWxkRmllbGRWYWx1ZTogZnVuY3Rpb24gKHBhcmVudEZpZWxkLCBpdGVtRmllbGRJbmRleCkge1xuICAgIC8vXG4gICAgLy8gICB2YXIgY2hpbGRGaWVsZFRlbXBsYXRlID0gY29uZmlnLmZpZWxkSXRlbUZpZWxkVGVtcGxhdGVzKHBhcmVudEZpZWxkKVtpdGVtRmllbGRJbmRleF07XG4gICAgLy9cbiAgICAvLyAgIHZhciBuZXdWYWx1ZSA9IGNvbmZpZy5maWVsZFRlbXBsYXRlVmFsdWUoY2hpbGRGaWVsZFRlbXBsYXRlKTtcbiAgICAvL1xuICAgIC8vICAgLy8gSnVzdCBhIHBsYWNlaG9sZGVyIGtleS4gU2hvdWxkIG5vdCBiZSBpbXBvcnRhbnQuXG4gICAgLy8gICB2YXIga2V5ID0gJ19fdW5rbm93bl9rZXlfXyc7XG4gICAgLy9cbiAgICAvLyAgIGlmIChfLmlzQXJyYXkocGFyZW50RmllbGQudmFsdWUpKSB7XG4gICAgLy8gICAgIC8vIEp1c3QgYSBwbGFjZWhvbGRlciBwb3NpdGlvbiBmb3IgYW4gYXJyYXkuXG4gICAgLy8gICAgIGtleSA9IHBhcmVudEZpZWxkLnZhbHVlLmxlbmd0aDtcbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgLy8gSnVzdCBhIHBsYWNlaG9sZGVyIGZpZWxkIGluZGV4LiBTaG91bGQgbm90IGJlIGltcG9ydGFudC5cbiAgICAvLyAgIHZhciBmaWVsZEluZGV4ID0gMDtcbiAgICAvLyAgIGlmIChfLmlzT2JqZWN0KHBhcmVudEZpZWxkLnZhbHVlKSkge1xuICAgIC8vICAgICBmaWVsZEluZGV4ID0gT2JqZWN0LmtleXMocGFyZW50RmllbGQudmFsdWUpLmxlbmd0aDtcbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgdmFyIGNoaWxkRmllbGQgPSBjb25maWcuY3JlYXRlQ2hpbGRGaWVsZChwYXJlbnRGaWVsZCwge1xuICAgIC8vICAgICBmaWVsZFRlbXBsYXRlOiBjaGlsZEZpZWxkVGVtcGxhdGUsIGtleToga2V5LCBmaWVsZEluZGV4OiBmaWVsZEluZGV4LCB2YWx1ZTogbmV3VmFsdWVcbiAgICAvLyAgIH0pO1xuICAgIC8vXG4gICAgLy8gICBuZXdWYWx1ZSA9IGNvbmZpZy5pbmZsYXRlRmllbGRWYWx1ZShjaGlsZEZpZWxkKTtcbiAgICAvL1xuICAgIC8vICAgcmV0dXJuIG5ld1ZhbHVlO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBHaXZlbiBhIHZhbHVlLCBjcmVhdGUgYSBmaWVsZCB0ZW1wbGF0ZSBmb3IgdGhhdCB2YWx1ZS5cbiAgICAvLyBjcmVhdGVGaWVsZFRlbXBsYXRlRnJvbVZhbHVlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAvL1xuICAgIC8vICAgdmFyIGZpZWxkID0ge1xuICAgIC8vICAgICB0eXBlOiAnanNvbidcbiAgICAvLyAgIH07XG4gICAgLy8gICBpZiAoXy5pc1N0cmluZyh2YWx1ZSkpIHtcbiAgICAvLyAgICAgZmllbGQgPSB7XG4gICAgLy8gICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAvLyAgICAgfTtcbiAgICAvLyAgIH0gZWxzZSBpZiAoXy5pc051bWJlcih2YWx1ZSkpIHtcbiAgICAvLyAgICAgZmllbGQgPSB7XG4gICAgLy8gICAgICAgdHlwZTogJ251bWJlcidcbiAgICAvLyAgICAgfTtcbiAgICAvLyAgIH0gZWxzZSBpZiAoXy5pc0Jvb2xlYW4odmFsdWUpKSB7XG4gICAgLy8gICAgIGZpZWxkID0ge1xuICAgIC8vICAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgIC8vICAgICB9O1xuICAgIC8vICAgfSBlbHNlIGlmIChfLmlzQXJyYXkodmFsdWUpKSB7XG4gICAgLy8gICAgIHZhciBhcnJheUl0ZW1GaWVsZHMgPSB2YWx1ZS5tYXAoZnVuY3Rpb24gKGNoaWxkVmFsdWUsIGkpIHtcbiAgICAvLyAgICAgICB2YXIgY2hpbGRGaWVsZCA9IGNvbmZpZy5jcmVhdGVGaWVsZFRlbXBsYXRlRnJvbVZhbHVlKGNoaWxkVmFsdWUpO1xuICAgIC8vICAgICAgIGNoaWxkRmllbGQua2V5ID0gaTtcbiAgICAvLyAgICAgICByZXR1cm4gY2hpbGRGaWVsZDtcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gICAgIGZpZWxkID0ge1xuICAgIC8vICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgLy8gICAgICAgZmllbGRzOiBhcnJheUl0ZW1GaWVsZHNcbiAgICAvLyAgICAgfTtcbiAgICAvLyAgIH0gZWxzZSBpZiAoXy5pc09iamVjdCh2YWx1ZSkpIHtcbiAgICAvLyAgICAgdmFyIG9iamVjdEl0ZW1GaWVsZHMgPSBPYmplY3Qua2V5cyh2YWx1ZSkubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAvLyAgICAgICB2YXIgY2hpbGRGaWVsZCA9IGNvbmZpZy5jcmVhdGVGaWVsZFRlbXBsYXRlRnJvbVZhbHVlKHZhbHVlW2tleV0pO1xuICAgIC8vICAgICAgIGNoaWxkRmllbGQua2V5ID0ga2V5O1xuICAgIC8vICAgICAgIGNoaWxkRmllbGQubGFiZWwgPSBjb25maWcuaHVtYW5pemUoa2V5KTtcbiAgICAvLyAgICAgICByZXR1cm4gY2hpbGRGaWVsZDtcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gICAgIGZpZWxkID0ge1xuICAgIC8vICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgIC8vICAgICAgIGZpZWxkczogb2JqZWN0SXRlbUZpZWxkc1xuICAgIC8vICAgICB9O1xuICAgIC8vICAgfSBlbHNlIGlmIChfLmlzTnVsbCh2YWx1ZSkpIHtcbiAgICAvLyAgICAgZmllbGQgPSB7XG4gICAgLy8gICAgICAgdHlwZTogJ2pzb24nXG4gICAgLy8gICAgIH07XG4gICAgLy8gICB9XG4gICAgLy8gICByZXR1cm4gZmllbGQ7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIERlZmF1bHQgdmFsdWUgZmFjdG9yeVxuICAgIC8vXG4gICAgLy8gY3JlYXRlRGVmYXVsdFZhbHVlOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSkge1xuICAgIC8vXG4gICAgLy8gICB2YXIgZGVmYXVsdFZhbHVlID0gY29uZmlnLmZpZWxkVGVtcGxhdGVEZWZhdWx0VmFsdWUoZmllbGRUZW1wbGF0ZSk7XG4gICAgLy9cbiAgICAvLyAgIGlmICghXy5pc1VuZGVmaW5lZChkZWZhdWx0VmFsdWUpKSB7XG4gICAgLy8gICAgIHJldHVybiB1dGlscy5kZWVwQ29weShkZWZhdWx0VmFsdWUpO1xuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICB2YXIgdHlwZU5hbWUgPSBjb25maWcuZmllbGRUeXBlTmFtZShmaWVsZFRlbXBsYXRlKTtcbiAgICAvL1xuICAgIC8vICAgaWYgKGNvbmZpZ1snY3JlYXRlRGVmYXVsdFZhbHVlXycgKyB0eXBlTmFtZV0pIHtcbiAgICAvLyAgICAgcmV0dXJuIGNvbmZpZ1snY3JlYXRlRGVmYXVsdFZhbHVlXycgKyB0eXBlTmFtZV0oZmllbGRUZW1wbGF0ZSk7XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiAnJztcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gRmllbGQgaGVscGVyc1xuICAgIC8vXG4gICAgLy8gLy8gRGV0ZXJtaW5lIGlmIGEgdmFsdWUgXCJleGlzdHNcIi5cbiAgICAvLyBoYXNWYWx1ZTogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUsIHZhbHVlKSB7XG4gICAgLy8gICByZXR1cm4gdmFsdWUgIT09IG51bGwgJiYgIV8uaXNVbmRlZmluZWQodmFsdWUpO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBDb2VyY2UgYSB2YWx1ZSB0byB2YWx1ZSBhcHByb3ByaWF0ZSBmb3IgYSBmaWVsZC5cbiAgICAvLyBjb2VyY2VWYWx1ZTogZnVuY3Rpb24gKGZpZWxkLCB2YWx1ZSkge1xuICAgIC8vXG4gICAgLy8gICB2YXIgdHlwZU5hbWUgPSBjb25maWcuZmllbGRUeXBlTmFtZShmaWVsZCk7XG4gICAgLy9cbiAgICAvLyAgIGlmIChjb25maWdbJ2NvZXJjZVZhbHVlXycgKyB0eXBlTmFtZV0pIHtcbiAgICAvLyAgICAgcmV0dXJuIGNvbmZpZ1snY29lcmNlVmFsdWVfJyArIHR5cGVOYW1lXShmaWVsZCwgdmFsdWUpO1xuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICByZXR1cm4gdmFsdWU7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIEdpdmVuIGEgZmllbGQgYW5kIGEgY2hpbGQgdmFsdWUsIGZpbmQgdGhlIGFwcHJvcHJpYXRlIGZpZWxkIHRlbXBsYXRlIGZvclxuICAgIC8vIC8vIHRoYXQgY2hpbGQgdmFsdWUuXG4gICAgLy8gY2hpbGRGaWVsZFRlbXBsYXRlRm9yVmFsdWU6IGZ1bmN0aW9uIChmaWVsZCwgY2hpbGRWYWx1ZSkge1xuICAgIC8vXG4gICAgLy8gICB2YXIgZmllbGRUZW1wbGF0ZTtcbiAgICAvL1xuICAgIC8vICAgdmFyIGZpZWxkVGVtcGxhdGVzID0gY29uZmlnLmZpZWxkSXRlbUZpZWxkVGVtcGxhdGVzKGZpZWxkKTtcbiAgICAvL1xuICAgIC8vICAgZmllbGRUZW1wbGF0ZSA9IF8uZmluZChmaWVsZFRlbXBsYXRlcywgZnVuY3Rpb24gKGl0ZW1GaWVsZFRlbXBsYXRlKSB7XG4gICAgLy8gICAgIHJldHVybiBjb25maWcubWF0Y2hlc0ZpZWxkVGVtcGxhdGVUb1ZhbHVlKGl0ZW1GaWVsZFRlbXBsYXRlLCBjaGlsZFZhbHVlKTtcbiAgICAvLyAgIH0pO1xuICAgIC8vXG4gICAgLy8gICBpZiAoZmllbGRUZW1wbGF0ZSkge1xuICAgIC8vICAgICByZXR1cm4gZmllbGRUZW1wbGF0ZTtcbiAgICAvLyAgIH0gZWxzZSB7XG4gICAgLy8gICAgIHJldHVybiBjb25maWcuY3JlYXRlRmllbGRUZW1wbGF0ZUZyb21WYWx1ZShjaGlsZFZhbHVlKTtcbiAgICAvLyAgIH1cbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBtYXRjaCBmb3IgYSBmaWVsZCB0ZW1wbGF0ZS5cbiAgICAvLyBtYXRjaGVzRmllbGRUZW1wbGF0ZVRvVmFsdWU6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlLCB2YWx1ZSkge1xuICAgIC8vICAgdmFyIG1hdGNoID0gZmllbGRUZW1wbGF0ZS5tYXRjaDtcbiAgICAvLyAgIGlmICghbWF0Y2gpIHtcbiAgICAvLyAgICAgcmV0dXJuIHRydWU7XG4gICAgLy8gICB9XG4gICAgLy8gICByZXR1cm4gXy5ldmVyeShPYmplY3Qua2V5cyhtYXRjaCksIGZ1bmN0aW9uIChrZXkpIHtcbiAgICAvLyAgICAgcmV0dXJuIF8uaXNFcXVhbChtYXRjaFtrZXldLCB2YWx1ZVtrZXldKTtcbiAgICAvLyAgIH0pO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBGaWVsZCB0ZW1wbGF0ZSBoZWxwZXJzXG4gICAgLy9cbiAgICAvLyAvLyBOb3JtYWxpemVkIChQYXNjYWxDYXNlKSB0eXBlIG5hbWUgZm9yIGEgZmllbGQuXG4gICAgLy8gZmllbGRUZW1wbGF0ZVR5cGVOYW1lOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSkge1xuICAgIC8vXG4gICAgLy8gICB2YXIgdHlwZU5hbWUgPSB1dGlscy5kYXNoVG9QYXNjYWwoZmllbGRUZW1wbGF0ZS50eXBlIHx8ICd1bmRlZmluZWQnKTtcbiAgICAvL1xuICAgIC8vICAgdmFyIGFsaWFzID0gY29uZmlnWydhbGlhc18nICsgdHlwZU5hbWVdO1xuICAgIC8vXG4gICAgLy8gICBpZiAoYWxpYXMpIHtcbiAgICAvLyAgICAgaWYgKF8uaXNGdW5jdGlvbihhbGlhcykpIHtcbiAgICAvLyAgICAgICByZXR1cm4gYWxpYXMuY2FsbChjb25maWcsIGZpZWxkVGVtcGxhdGUpO1xuICAgIC8vICAgICB9IGVsc2Uge1xuICAgIC8vICAgICAgIHJldHVybiBhbGlhcztcbiAgICAvLyAgICAgfVxuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICBpZiAoZmllbGRUZW1wbGF0ZS5saXN0KSB7XG4gICAgLy8gICAgIHR5cGVOYW1lID0gJ0FycmF5JztcbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgcmV0dXJuIHR5cGVOYW1lO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBEZWZhdWx0IHZhbHVlIGZvciBhIGZpZWxkIHRlbXBsYXRlLlxuICAgIC8vIGZpZWxkVGVtcGxhdGVEZWZhdWx0VmFsdWU6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiBmaWVsZFRlbXBsYXRlLmRlZmF1bHQ7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIFZhbHVlIGZvciBhIGZpZWxkIHRlbXBsYXRlLiBVc2VkIHRvIGRldGVybWluZSB0aGUgdmFsdWUgb2YgYSBuZXcgY2hpbGRcbiAgICAvLyAvLyBmaWVsZC5cbiAgICAvLyBmaWVsZFRlbXBsYXRlVmFsdWU6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgLy9cbiAgICAvLyAgIC8vIFRoaXMgbG9naWMgbWlnaHQgYmUgYnJpdHRsZS5cbiAgICAvL1xuICAgIC8vICAgdmFyIGRlZmF1bHRWYWx1ZSA9IGNvbmZpZy5maWVsZFRlbXBsYXRlRGVmYXVsdFZhbHVlKGZpZWxkVGVtcGxhdGUpO1xuICAgIC8vXG4gICAgLy8gICB2YXIgbWF0Y2ggPSBjb25maWcuZmllbGRUZW1wbGF0ZU1hdGNoKGZpZWxkVGVtcGxhdGUpO1xuICAgIC8vXG4gICAgLy8gICB2YXIgdmFsdWU7XG4gICAgLy9cbiAgICAvLyAgIGlmIChfLmlzVW5kZWZpbmVkKGRlZmF1bHRWYWx1ZSkgJiYgIV8uaXNVbmRlZmluZWQobWF0Y2gpKSB7XG4gICAgLy8gICAgIHJldHVybiB1dGlscy5kZWVwQ29weShtYXRjaCk7XG4gICAgLy8gICB9IGVsc2Uge1xuICAgIC8vICAgICByZXR1cm4gY29uZmlnLmNyZWF0ZURlZmF1bHRWYWx1ZShmaWVsZFRlbXBsYXRlKTtcbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgcmV0dXJuIHZhbHVlO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBNYXRjaCBydWxlIGZvciBhIGZpZWxkIHRlbXBsYXRlLlxuICAgIC8vIGZpZWxkVGVtcGxhdGVNYXRjaDogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcbiAgICAvLyAgIHJldHVybiBmaWVsZFRlbXBsYXRlLm1hdGNoO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBEZXRlcm1pbmUgaWYgYSBmaWVsZCB0ZW1wbGF0ZSBoYXMgYSBzaW5nbGUtbGluZSB2YWx1ZS5cbiAgICAvLyBmaWVsZFRlbXBsYXRlSXNTaW5nbGVMaW5lOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSkge1xuICAgIC8vICAgcmV0dXJuIGZpZWxkVGVtcGxhdGUuaXNTaW5nbGVMaW5lIHx8IGZpZWxkVGVtcGxhdGUuaXNfc2luZ2xlX2xpbmUgfHxcbiAgICAvLyAgICAgICAgICAgZmllbGRUZW1wbGF0ZS50eXBlID09PSAnc2luZ2xlLWxpbmUtc3RyaW5nJyB8fCBmaWVsZFRlbXBsYXRlLnR5cGUgPT09ICdTaW5nbGVMaW5lU3RyaW5nJztcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gRmllbGQgaGVscGVyc1xuICAgIC8vXG4gICAgLy8gLy8gR2V0IGFuIGFycmF5IG9mIGtleXMgcmVwcmVzZW50aW5nIHRoZSBwYXRoIHRvIGEgdmFsdWUuXG4gICAgLy8gZmllbGRWYWx1ZVBhdGg6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIC8vXG4gICAgLy8gICB2YXIgcGFyZW50UGF0aCA9IFtdO1xuICAgIC8vXG4gICAgLy8gICBpZiAoZmllbGQucGFyZW50KSB7XG4gICAgLy8gICAgIHBhcmVudFBhdGggPSBjb25maWcuZmllbGRWYWx1ZVBhdGgoZmllbGQucGFyZW50KTtcbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgcmV0dXJuIHBhcmVudFBhdGguY29uY2F0KGZpZWxkLmtleSkuZmlsdGVyKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAvLyAgICAgcmV0dXJuICFfLmlzVW5kZWZpbmVkKGtleSkgJiYga2V5ICE9PSAnJztcbiAgICAvLyAgIH0pO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBDbG9uZSBhIGZpZWxkIHdpdGggYSBkaWZmZXJlbnQgdmFsdWUuXG4gICAgLy8gZmllbGRXaXRoVmFsdWU6IGZ1bmN0aW9uIChmaWVsZCwgdmFsdWUpIHtcbiAgICAvLyAgIHJldHVybiBfLmV4dGVuZCh7fSwgZmllbGQsIHt2YWx1ZTogdmFsdWV9KTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gZmllbGRUeXBlTmFtZTogZGVsZWdhdGVUbygnZmllbGRUZW1wbGF0ZVR5cGVOYW1lJyksXG4gICAgLy9cbiAgICAvLyAvLyBHZXQgdGhlIGNob2ljZXMgZm9yIGEgZHJvcGRvd24gZmllbGQuXG4gICAgLy8gZmllbGRDaG9pY2VzOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAvL1xuICAgIC8vICAgcmV0dXJuIGNvbmZpZy5ub3JtYWxpemVDaG9pY2VzKGZpZWxkLmNob2ljZXMpO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBHZXQgdGhlIGNob2ljZXMgZm9yIGEgcHJldHR5IGRyb3Bkb3duIGZpZWxkLlxuICAgIC8vIGZpZWxkUHJldHR5Q2hvaWNlczogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiBjb25maWcubm9ybWFsaXplUHJldHR5Q2hvaWNlcyhmaWVsZC5jaG9pY2VzKTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gR2V0IGEgc2V0IG9mIGJvb2xlYW4gY2hvaWNlcyBmb3IgYSBmaWVsZC5cbiAgICAvLyBmaWVsZEJvb2xlYW5DaG9pY2VzOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAvL1xuICAgIC8vICAgdmFyIGNob2ljZXMgPSBjb25maWcuZmllbGRDaG9pY2VzKGZpZWxkKTtcbiAgICAvL1xuICAgIC8vICAgaWYgKGNob2ljZXMubGVuZ3RoID09PSAwKSB7XG4gICAgLy8gICAgIHJldHVybiBbe1xuICAgIC8vICAgICAgIGxhYmVsOiAneWVzJyxcbiAgICAvLyAgICAgICB2YWx1ZTogdHJ1ZVxuICAgIC8vICAgICB9LCB7XG4gICAgLy8gICAgICAgbGFiZWw6ICdubycsXG4gICAgLy8gICAgICAgdmFsdWU6IGZhbHNlXG4gICAgLy8gICAgIH1dO1xuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICByZXR1cm4gY2hvaWNlcy5tYXAoZnVuY3Rpb24gKGNob2ljZSkge1xuICAgIC8vICAgICBpZiAoXy5pc0Jvb2xlYW4oY2hvaWNlLnZhbHVlKSkge1xuICAgIC8vICAgICAgIHJldHVybiBjaG9pY2U7XG4gICAgLy8gICAgIH1cbiAgICAvLyAgICAgcmV0dXJuIF8uZXh0ZW5kKHt9LCBjaG9pY2UsIHtcbiAgICAvLyAgICAgICB2YWx1ZTogY29uZmlnLmNvZXJjZVZhbHVlVG9Cb29sZWFuKGNob2ljZS52YWx1ZSlcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gICB9KTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gR2V0IGEgc2V0IG9mIHJlcGxhY2VtZW50IGNob2ljZXMgZm9yIGEgZmllbGQuXG4gICAgLy8gZmllbGRSZXBsYWNlQ2hvaWNlczogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiBjb25maWcubm9ybWFsaXplQ2hvaWNlcyhmaWVsZC5yZXBsYWNlQ2hvaWNlcyk7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIEdldCBhIGxhYmVsIGZvciBhIGZpZWxkLlxuICAgIC8vIGZpZWxkTGFiZWw6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIC8vICAgcmV0dXJuIGZpZWxkLmxhYmVsO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBHZXQgYSBwbGFjZWhvbGRlciAoanVzdCBhIGRlZmF1bHQgZGlzcGxheSB2YWx1ZSwgbm90IGEgZGVmYXVsdCB2YWx1ZSkgZm9yIGEgZmllbGQuXG4gICAgLy8gZmllbGRQbGFjZWhvbGRlcjogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgLy8gICByZXR1cm4gZmllbGQucGxhY2Vob2xkZXI7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIEdldCB0aGUgaGVscCB0ZXh0IGZvciBhIGZpZWxkLlxuICAgIC8vIGZpZWxkSGVscFRleHQ6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIC8vICAgcmV0dXJuIGZpZWxkLmhlbHBfdGV4dF9odG1sIHx8IGZpZWxkLmhlbHBfdGV4dCB8fCBmaWVsZC5oZWxwVGV4dCB8fCBmaWVsZC5oZWxwVGV4dEh0bWw7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIEdldCB3aGV0aGVyIG9yIG5vdCBhIGZpZWxkIGlzIHJlcXVpcmVkLlxuICAgIC8vIGZpZWxkSXNSZXF1aXJlZDogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgLy8gICByZXR1cm4gZmllbGQucmVxdWlyZWQgPyB0cnVlIDogZmFsc2U7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIERldGVybWluZSBpZiB2YWx1ZSBmb3IgdGhpcyBmaWVsZCBpcyBub3QgYSBsZWFmIHZhbHVlLlxuICAgIC8vIGZpZWxkSGFzVmFsdWVDaGlsZHJlbjogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgLy9cbiAgICAvLyAgIHZhciBkZWZhdWx0VmFsdWUgPSBjb25maWcuY3JlYXRlRGVmYXVsdFZhbHVlKGZpZWxkKTtcbiAgICAvL1xuICAgIC8vICAgaWYgKF8uaXNPYmplY3QoZGVmYXVsdFZhbHVlKSB8fCBfLmlzQXJyYXkoZGVmYXVsdFZhbHVlKSkge1xuICAgIC8vICAgICByZXR1cm4gdHJ1ZTtcbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgcmV0dXJuIGZhbHNlO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBHZXQgdGhlIGNoaWxkIGZpZWxkIHRlbXBsYXRlcyBmb3IgdGhpcyBmaWVsZC5cbiAgICAvLyBmaWVsZENoaWxkRmllbGRUZW1wbGF0ZXM6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIC8vICAgcmV0dXJuIGZpZWxkLmZpZWxkcyB8fCBbXTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gR2V0IHRoZSBmaWVsZCB0ZW1wbGF0ZXMgZm9yIGVhY2ggaXRlbSBvZiB0aGlzIGZpZWxkLiAoRm9yIGR5bmFtaWMgY2hpbGRyZW4sXG4gICAgLy8gLy8gbGlrZSBhcnJheXMuKVxuICAgIC8vIGZpZWxkSXRlbUZpZWxkVGVtcGxhdGVzOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAvLyAgIGlmICghZmllbGQuaXRlbUZpZWxkcykge1xuICAgIC8vICAgICByZXR1cm4gW3t0eXBlOiAndGV4dCd9XTtcbiAgICAvLyAgIH1cbiAgICAvLyAgIGlmICghXy5pc0FycmF5KGZpZWxkLml0ZW1GaWVsZHMpKSB7XG4gICAgLy8gICAgIHJldHVybiBbZmllbGQuaXRlbUZpZWxkc107XG4gICAgLy8gICB9XG4gICAgLy8gICByZXR1cm4gZmllbGQuaXRlbUZpZWxkcztcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gZmllbGRJc1NpbmdsZUxpbmU6IGRlbGVnYXRlVG8oJ2ZpZWxkVGVtcGxhdGVJc1NpbmdsZUxpbmUnKSxcbiAgICAvL1xuICAgIC8vIC8vIEdldCB3aGV0aGVyIG9yIG5vdCBhIGZpZWxkIGlzIGNvbGxhcHNlZC5cbiAgICAvLyBmaWVsZElzQ29sbGFwc2VkOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAvLyAgIHJldHVybiBmaWVsZC5jb2xsYXBzZWQgPyB0cnVlIDogZmFsc2U7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIEdldCB3aGV0ZXIgb3Igbm90IGEgZmllbGQgY2FuIGJlIGNvbGxhcHNlZC5cbiAgICAvLyBmaWVsZElzQ29sbGFwc2libGU6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIC8vICAgcmV0dXJuIGZpZWxkLmNvbGxhcHNpYmxlIHx8ICFfLmlzVW5kZWZpbmVkKGZpZWxkLmNvbGxhcHNlZCk7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIEdldCB0aGUgbnVtYmVyIG9mIHJvd3MgZm9yIGEgZmllbGQuXG4gICAgLy8gZmllbGRSb3dzOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAvLyAgIHJldHVybiBmaWVsZC5yb3dzO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyBmaWVsZEVycm9yczogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgLy9cbiAgICAvLyAgIHZhciBlcnJvcnMgPSBbXTtcbiAgICAvL1xuICAgIC8vICAgaWYgKGNvbmZpZy5pc0tleShmaWVsZC5rZXkpKSB7XG4gICAgLy8gICAgIGNvbmZpZy52YWxpZGF0ZUZpZWxkKGZpZWxkLCBlcnJvcnMpO1xuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICByZXR1cm4gZXJyb3JzO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyBmaWVsZE1hdGNoOiBkZWxlZ2F0ZVRvKCdmaWVsZFRlbXBsYXRlTWF0Y2gnKSxcbiAgICAvL1xuICAgIC8vIC8vIE90aGVyIGhlbHBlcnNcbiAgICAvL1xuICAgIC8vIC8vIENvbnZlcnQgYSBrZXkgdG8gYSBuaWNlIGh1bWFuLXJlYWRhYmxlIHZlcnNpb24uXG4gICAgLy8gaHVtYW5pemU6IGZ1bmN0aW9uKHByb3BlcnR5KSB7XG4gICAgLy8gICBwcm9wZXJ0eSA9IHByb3BlcnR5LnJlcGxhY2UoL1xce1xcey9nLCAnJyk7XG4gICAgLy8gICBwcm9wZXJ0eSA9IHByb3BlcnR5LnJlcGxhY2UoL1xcfVxcfS9nLCAnJyk7XG4gICAgLy8gICByZXR1cm4gcHJvcGVydHkucmVwbGFjZSgvXy9nLCAnICcpXG4gICAgLy8gICAucmVwbGFjZSgvKFxcdyspL2csIGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgLy8gICAgIHJldHVybiBtYXRjaC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIG1hdGNoLnNsaWNlKDEpO1xuICAgIC8vICAgfSk7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIE5vcm1hbGl6ZSBzb21lIGNob2ljZXMgZm9yIGEgZHJvcC1kb3duLlxuICAgIC8vIG5vcm1hbGl6ZUNob2ljZXM6IGZ1bmN0aW9uIChjaG9pY2VzKSB7XG4gICAgLy9cbiAgICAvLyAgIGlmICghY2hvaWNlcykge1xuICAgIC8vICAgICByZXR1cm4gW107XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIC8vIENvbnZlcnQgY29tbWEgc2VwYXJhdGVkIHN0cmluZyB0byBhcnJheSBvZiBzdHJpbmdzLlxuICAgIC8vICAgaWYgKF8uaXNTdHJpbmcoY2hvaWNlcykpIHtcbiAgICAvLyAgICAgY2hvaWNlcyA9IGNob2ljZXMuc3BsaXQoJywnKTtcbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgLy8gQ29udmVydCBvYmplY3QgdG8gYXJyYXkgb2Ygb2JqZWN0cyB3aXRoIGB2YWx1ZWAgYW5kIGBsYWJlbGAgcHJvcGVydGllcy5cbiAgICAvLyAgIGlmICghXy5pc0FycmF5KGNob2ljZXMpICYmIF8uaXNPYmplY3QoY2hvaWNlcykpIHtcbiAgICAvLyAgICAgY2hvaWNlcyA9IE9iamVjdC5rZXlzKGNob2ljZXMpLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgLy8gICAgICAgcmV0dXJuIHtcbiAgICAvLyAgICAgICAgIHZhbHVlOiBrZXksXG4gICAgLy8gICAgICAgICBsYWJlbDogY2hvaWNlc1trZXldXG4gICAgLy8gICAgICAgfTtcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIC8vIENvcHkgdGhlIGFycmF5IG9mIGNob2ljZXMgc28gd2UgY2FuIG1hbmlwdWxhdGUgdGhlbS5cbiAgICAvLyAgIGNob2ljZXMgPSBjaG9pY2VzLnNsaWNlKDApO1xuICAgIC8vXG4gICAgLy8gICAvLyBBcnJheSBvZiBjaG9pY2UgYXJyYXlzIHNob3VsZCBiZSBmbGF0dGVuZWQuXG4gICAgLy8gICBjaG9pY2VzID0gXy5mbGF0dGVuKGNob2ljZXMpO1xuICAgIC8vXG4gICAgLy8gICBjaG9pY2VzLmZvckVhY2goZnVuY3Rpb24gKGNob2ljZSwgaSkge1xuICAgIC8vICAgICAvLyBDb252ZXJ0IGFueSBzdHJpbmcgY2hvaWNlcyB0byBvYmplY3RzIHdpdGggYHZhbHVlYCBhbmQgYGxhYmVsYFxuICAgIC8vICAgICAvLyBwcm9wZXJ0aWVzLlxuICAgIC8vICAgICBpZiAoXy5pc1N0cmluZyhjaG9pY2UpKSB7XG4gICAgLy8gICAgICAgY2hvaWNlc1tpXSA9IHtcbiAgICAvLyAgICAgICAgIHZhbHVlOiBjaG9pY2UsXG4gICAgLy8gICAgICAgICBsYWJlbDogY29uZmlnLmh1bWFuaXplKGNob2ljZSlcbiAgICAvLyAgICAgICB9O1xuICAgIC8vICAgICB9XG4gICAgLy8gICAgIGlmICghY2hvaWNlc1tpXS5sYWJlbCkge1xuICAgIC8vICAgICAgIGNob2ljZXNbaV0ubGFiZWwgPSBjb25maWcuaHVtYW5pemUoY2hvaWNlc1tpXS52YWx1ZSk7XG4gICAgLy8gICAgIH1cbiAgICAvLyAgIH0pO1xuICAgIC8vXG4gICAgLy8gICByZXR1cm4gY2hvaWNlcztcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gTm9ybWFsaXplIGNob2ljZXMgZm9yIGEgcHJldHR5IGRyb3AgZG93biwgd2l0aCAnc2FtcGxlJyB2YWx1ZXNcbiAgICAvLyBub3JtYWxpemVQcmV0dHlDaG9pY2VzOiBmdW5jdGlvbiAoY2hvaWNlcykge1xuICAgIC8vICAgaWYgKCFfLmlzQXJyYXkoY2hvaWNlcykgJiYgXy5pc09iamVjdChjaG9pY2VzKSkge1xuICAgIC8vICAgICBjaG9pY2VzID0gT2JqZWN0LmtleXMoY2hvaWNlcykubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAvLyAgICAgICByZXR1cm4ge1xuICAgIC8vICAgICAgICAgdmFsdWU6IGtleSxcbiAgICAvLyAgICAgICAgIGxhYmVsOiBjaG9pY2VzW2tleV0sXG4gICAgLy8gICAgICAgICBzYW1wbGU6IGtleVxuICAgIC8vICAgICAgIH07XG4gICAgLy8gICAgIH0pO1xuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICByZXR1cm4gY29uZmlnLm5vcm1hbGl6ZUNob2ljZXMoY2hvaWNlcyk7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIENvZXJjZSBhIHZhbHVlIHRvIGEgYm9vbGVhblxuICAgIC8vIGNvZXJjZVZhbHVlVG9Cb29sZWFuOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAvLyAgIGlmICghXy5pc1N0cmluZyh2YWx1ZSkpIHtcbiAgICAvLyAgICAgLy8gSnVzdCB1c2UgdGhlIGRlZmF1bHQgdHJ1dGhpbmVzcy5cbiAgICAvLyAgICAgcmV0dXJuIHZhbHVlID8gdHJ1ZSA6IGZhbHNlO1xuICAgIC8vICAgfVxuICAgIC8vICAgdmFsdWUgPSB2YWx1ZS50b0xvd2VyQ2FzZSgpO1xuICAgIC8vICAgaWYgKHZhbHVlID09PSAnJyB8fCB2YWx1ZSA9PT0gJ25vJyB8fCB2YWx1ZSA9PT0gJ29mZicgfHwgdmFsdWUgPT09ICdmYWxzZScpIHtcbiAgICAvLyAgICAgcmV0dXJuIGZhbHNlO1xuICAgIC8vICAgfVxuICAgIC8vICAgcmV0dXJuIHRydWU7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgdmFsaWQga2V5LlxuICAgIC8vIGlzS2V5OiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgLy8gICByZXR1cm4gKF8uaXNOdW1iZXIoa2V5KSAmJiBrZXkgPj0gMCkgfHwgKF8uaXNTdHJpbmcoa2V5KSAmJiBrZXkgIT09ICcnKTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gRmFzdCB3YXkgdG8gY2hlY2sgZm9yIGVtcHR5IG9iamVjdC5cbiAgICAvLyBpc0VtcHR5T2JqZWN0OiBmdW5jdGlvbiAob2JqKSB7XG4gICAgLy8gICBmb3IodmFyIGtleSBpbiBvYmopIHtcbiAgICAvLyAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgLy8gICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIC8vICAgICB9XG4gICAgLy8gICB9XG4gICAgLy8gICByZXR1cm4gdHJ1ZTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gYWN0aW9uQ2hvaWNlTGFiZWw6IGZ1bmN0aW9uIChhY3Rpb24pIHtcbiAgICAvLyAgIHJldHVybiB1dGlscy5jYXBpdGFsaXplKGFjdGlvbikucmVwbGFjZSgvWy1dL2csICcgJyk7XG4gICAgLy8gfVxuLy8gICB9O1xuLy8gfTtcbiIsImNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbmNvbnN0IF8gPSByZXF1aXJlKCcuL3VuZGFzaCcpO1xuY29uc3QgQ29tcG9uZW50cyA9IHJlcXVpcmUoJy4vY29tcG9uZW50cycpO1xuY29uc3QgY3JlYXRlQ29uZmlnID0gcmVxdWlyZSgnLi9jcmVhdGUtY29uZmlnJyk7XG5jb25zdCBkZWZhdWx0Q29uZmlnID0gcmVxdWlyZSgnLi9kZWZhdWx0LWNvbmZpZycpO1xuY29uc3QgZGVmYXVsdENvbmZpZ1BsdWdpbiA9IHJlcXVpcmUoJy4vcGx1Z2lucy9kZWZhdWx0LWNvbmZpZycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBzdGF0aWNzOiBfLmV4dGVuZCh7XG4gICAgY3JlYXRlQ29uZmlnOiBjcmVhdGVDb25maWcuYmluZChudWxsLCBkZWZhdWx0Q29uZmlnUGx1Z2luKVxuICB9LFxuICAgIENvbXBvbmVudHNcbiAgKSxcblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWcgfHwgZGVmYXVsdENvbmZpZztcblxuICAgIHJldHVybiBjb25maWcucmVuZGVyRm9ybWF0aWNDb21wb25lbnQodGhpcyk7XG4gIH1cblxufSk7XG5cblxuLy8gLy8gIyBmb3JtYXRpY1xuLy9cbi8vIC8qXG4vLyBUaGUgcm9vdCBmb3JtYXRpYyBjb21wb25lbnQuXG4vL1xuLy8gVGhlIHJvb3QgZm9ybWF0aWMgY29tcG9uZW50IGlzIGFjdHVhbGx5IHR3byBjb21wb25lbnRzLiBUaGUgbWFpbiBjb21wb25lbnQgaXNcbi8vIGEgY29udHJvbGxlZCBjb21wb25lbnQgd2hlcmUgeW91IG11c3QgcGFzcyB0aGUgdmFsdWUgaW4gd2l0aCBlYWNoIHJlbmRlci4gVGhpc1xuLy8gaXMgYWN0dWFsbHkgd3JhcHBlZCBpbiBhbm90aGVyIGNvbXBvbmVudCB3aGljaCBhbGxvd3MgeW91IHRvIHVzZSBmb3JtYXRpYyBhc1xuLy8gYW4gdW5jb250cm9sbGVkIGNvbXBvbmVudCB3aGVyZSBpdCByZXRhaW5zIHRoZSBzdGF0ZSBvZiB0aGUgdmFsdWUuIFRoZSB3cmFwcGVyXG4vLyBpcyB3aGF0IGlzIGFjdHVhbGx5IGV4cG9ydGVkLlxuLy8gKi9cbi8vXG4vLyAndXNlIHN0cmljdCc7XG4vL1xuLy8gdmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG4vLyB2YXIgXyA9IHJlcXVpcmUoJy4vdW5kYXNoJyk7XG4vL1xuLy8gdmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuLy9cbi8vIHZhciBkZWZhdWx0Q29uZmlnUGx1Z2luID0gcmVxdWlyZSgnLi9kZWZhdWx0LWNvbmZpZycpO1xuLy9cbi8vIHZhciBjcmVhdGVDb25maWcgPSBmdW5jdGlvbiAoLi4uYXJncykge1xuLy8gICB2YXIgcGx1Z2lucyA9IFtkZWZhdWx0Q29uZmlnUGx1Z2luXS5jb25jYXQoYXJncyk7XG4vL1xuLy8gICByZXR1cm4gcGx1Z2lucy5yZWR1Y2UoZnVuY3Rpb24gKGNvbmZpZywgcGx1Z2luKSB7XG4vLyAgICAgaWYgKF8uaXNGdW5jdGlvbihwbHVnaW4pKSB7XG4vLyAgICAgICB2YXIgZXh0ZW5zaW9ucyA9IHBsdWdpbihjb25maWcpO1xuLy8gICAgICAgaWYgKGV4dGVuc2lvbnMpIHtcbi8vICAgICAgICAgXy5leHRlbmQoY29uZmlnLCBleHRlbnNpb25zKTtcbi8vICAgICAgIH1cbi8vICAgICB9IGVsc2Uge1xuLy8gICAgICAgXy5leHRlbmQoY29uZmlnLCBwbHVnaW4pO1xuLy8gICAgIH1cbi8vXG4vLyAgICAgcmV0dXJuIGNvbmZpZztcbi8vICAgfSwge30pO1xuLy8gfTtcbi8vXG4vLyB2YXIgZGVmYXVsdENvbmZpZyA9IGNyZWF0ZUNvbmZpZygpO1xuLy9cbi8vIC8vIFRoZSBtYWluIGZvcm1hdGljIGNvbXBvbmVudCB0aGF0IHJlbmRlcnMgdGhlIGZvcm0uXG4vLyB2YXIgRm9ybWF0aWNDb250cm9sbGVkQ2xhc3MgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4vL1xuLy8gICBkaXNwbGF5TmFtZTogJ0Zvcm1hdGljQ29udHJvbGxlZCcsXG4vL1xuLy8gICAvLyBSZXNwb25kIHRvIGFueSB2YWx1ZSBjaGFuZ2VzLlxuLy8gICBvbkNoYW5nZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBpbmZvKSB7XG4vLyAgICAgaWYgKCF0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4vLyAgICAgICByZXR1cm47XG4vLyAgICAgfVxuLy8gICAgIGluZm8gPSBfLmV4dGVuZCh7fSwgaW5mbyk7XG4vLyAgICAgaW5mby5wYXRoID0gdGhpcy5wcm9wcy5jb25maWcuZmllbGRWYWx1ZVBhdGgoaW5mby5maWVsZCk7XG4vLyAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSwgaW5mbyk7XG4vLyAgIH0sXG4vL1xuLy8gICAvLyBSZXNwb25kIHRvIGFueSBhY3Rpb25zIG90aGVyIHRoYW4gdmFsdWUgY2hhbmdlcy4gKEZvciBleGFtcGxlLCBmb2N1cyBhbmRcbi8vICAgLy8gYmx1ci4pXG4vLyAgIG9uQWN0aW9uOiBmdW5jdGlvbiAoaW5mbykge1xuLy8gICAgIGlmICghdGhpcy5wcm9wcy5vbkFjdGlvbikge1xuLy8gICAgICAgcmV0dXJuO1xuLy8gICAgIH1cbi8vICAgICBpbmZvID0gXy5leHRlbmQoe30sIGluZm8pO1xuLy8gICAgIGluZm8ucGF0aCA9IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkVmFsdWVQYXRoKGluZm8uZmllbGQpO1xuLy8gICAgIHRoaXMucHJvcHMub25BY3Rpb24oaW5mbyk7XG4vLyAgIH0sXG4vL1xuLy8gICAvLyBSZW5kZXIgdGhlIHJvb3QgY29tcG9uZW50IGJ5IGRlbGVnYXRpbmcgdG8gdGhlIGNvbmZpZy5cbi8vICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4vL1xuLy8gICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbi8vXG4vLyAgICAgcmV0dXJuIGNvbmZpZy5yZW5kZXJGb3JtYXRpY0NvbXBvbmVudCh0aGlzKTtcbi8vICAgfVxuLy8gfSk7XG4vL1xuLy8gdmFyIEZvcm1hdGljQ29udHJvbGxlZCA9IFJlYWN0LmNyZWF0ZUZhY3RvcnkoRm9ybWF0aWNDb250cm9sbGVkQ2xhc3MpO1xuLy9cbi8vIC8vIEEgd3JhcHBlciBjb21wb25lbnQgdGhhdCBpcyBhY3R1YWxseSBleHBvcnRlZCBhbmQgY2FuIGFsbG93IGZvcm1hdGljIHRvIGJlXG4vLyAvLyB1c2VkIGluIGFuIFwidW5jb250cm9sbGVkXCIgbWFubmVyLiAoU2VlIHVuY29udHJvbGxlZCBjb21wb25lbnRzIGluIHRoZSBSZWFjdFxuLy8gLy8gZG9jdW1lbnRhdGlvbiBmb3IgYW4gZXhwbGFuYXRpb24gb2YgdGhlIGRpZmZlcmVuY2UuKVxuLy8gbW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4vL1xuLy8gICAvLyBFeHBvcnQgc29tZSBzdHVmZiBhcyBzdGF0aWNzLlxuLy8gICBzdGF0aWNzOiB7XG4vLyAgICAgY3JlYXRlQ29uZmlnOiBjcmVhdGVDb25maWcsXG4vLyAgICAgYXZhaWxhYmxlTWl4aW5zOiB7XG4vLyAgICAgICBjbGlja091dHNpZGU6IHJlcXVpcmUoJy4vbWl4aW5zL2NsaWNrLW91dHNpZGUuanMnKSxcbi8vICAgICAgIGZpZWxkOiByZXF1aXJlKCcuL21peGlucy9maWVsZC5qcycpLFxuLy8gICAgICAgaGVscGVyOiByZXF1aXJlKCcuL21peGlucy9oZWxwZXIuanMnKSxcbi8vICAgICAgIHJlc2l6ZTogcmVxdWlyZSgnLi9taXhpbnMvcmVzaXplLmpzJyksXG4vLyAgICAgICBzY3JvbGw6IHJlcXVpcmUoJy4vbWl4aW5zL3Njcm9sbC5qcycpLFxuLy8gICAgICAgdW5kb1N0YWNrOiByZXF1aXJlKCcuL21peGlucy91bmRvLXN0YWNrLmpzJylcbi8vICAgICB9LFxuLy8gICAgIHBsdWdpbnM6IHtcbi8vICAgICAgIGJvb3RzdHJhcDogcmVxdWlyZSgnLi9wbHVnaW5zL2Jvb3RzdHJhcCcpLFxuLy8gICAgICAgbWV0YTogcmVxdWlyZSgnLi9wbHVnaW5zL21ldGEnKSxcbi8vICAgICAgIHJlZmVyZW5jZTogcmVxdWlyZSgnLi9wbHVnaW5zL3JlZmVyZW5jZScpLFxuLy8gICAgICAgZWxlbWVudENsYXNzZXM6IHJlcXVpcmUoJy4vcGx1Z2lucy9lbGVtZW50LWNsYXNzZXMnKVxuLy8gICAgIH0sXG4vLyAgICAgdXRpbHM6IHV0aWxzXG4vLyAgIH0sXG4vL1xuLy8gICBkaXNwbGF5TmFtZTogJ0Zvcm1hdGljJyxcbi8vXG4vLyAgIC8vIElmIHdlIGdvdCBhIHZhbHVlLCB0cmVhdCB0aGlzIGNvbXBvbmVudCBhcyBjb250cm9sbGVkLiBFaXRoZXIgd2F5LCByZXRhaW5cbi8vICAgLy8gdGhlIHZhbHVlIGluIHRoZSBzdGF0ZS5cbi8vICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4vLyAgICAgcmV0dXJuIHtcbi8vICAgICAgIGlzQ29udHJvbGxlZDogIV8uaXNVbmRlZmluZWQodGhpcy5wcm9wcy52YWx1ZSksXG4vLyAgICAgICB2YWx1ZTogXy5pc1VuZGVmaW5lZCh0aGlzLnByb3BzLnZhbHVlKSA/IHRoaXMucHJvcHMuZGVmYXVsdFZhbHVlIDogdGhpcy5wcm9wcy52YWx1ZVxuLy8gICAgIH07XG4vLyAgIH0sXG4vL1xuLy8gICAvLyBJZiB0aGlzIGlzIGEgY29udHJvbGxlZCBjb21wb25lbnQsIGNoYW5nZSBvdXIgc3RhdGUgdG8gcmVmbGVjdCB0aGUgbmV3XG4vLyAgIC8vIHZhbHVlLiBGb3IgdW5jb250cm9sbGVkIGNvbXBvbmVudHMsIGlnbm9yZSBhbnkgdmFsdWUgY2hhbmdlcy5cbi8vICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gKG5ld1Byb3BzKSB7XG4vLyAgICAgaWYgKHRoaXMuc3RhdGUuaXNDb250cm9sbGVkKSB7XG4vLyAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQobmV3UHJvcHMudmFsdWUpKSB7XG4vLyAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuLy8gICAgICAgICAgIHZhbHVlOiBuZXdQcm9wcy52YWx1ZVxuLy8gICAgICAgICB9KTtcbi8vICAgICAgIH1cbi8vICAgICB9XG4vLyAgIH0sXG4vL1xuLy8gICAvLyBJZiB0aGlzIGlzIGFuIHVuY29udHJvbGxlZCBjb21wb25lbnQsIHNldCBvdXIgc3RhdGUgdG8gcmVmbGVjdCB0aGUgbmV3XG4vLyAgIC8vIHZhbHVlLiBFaXRoZXIgd2F5LCBjYWxsIHRoZSBvbkNoYW5nZSBjYWxsYmFjay5cbi8vICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgaW5mbykge1xuLy8gICAgIGlmICghdGhpcy5zdGF0ZS5pc0NvbnRyb2xsZWQpIHtcbi8vICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuLy8gICAgICAgICB2YWx1ZTogbmV3VmFsdWVcbi8vICAgICAgIH0pO1xuLy8gICAgIH1cbi8vICAgICBpZiAoIXRoaXMucHJvcHMub25DaGFuZ2UpIHtcbi8vICAgICAgIHJldHVybjtcbi8vICAgICB9XG4vLyAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSwgaW5mbyk7XG4vLyAgIH0sXG4vL1xuLy8gICAvLyBBbnkgYWN0aW9ucyBzaG91bGQgYmUgc2VudCB0byB0aGUgZ2VuZXJpYyBvbkFjdGlvbiBjYWxsYmFjayBidXQgYWxzbyBzcGxpdFxuLy8gICAvLyBpbnRvIGRpc2NyZWV0IGNhbGxiYWNrcyBwZXIgYWN0aW9uLlxuLy8gICBvbkFjdGlvbjogZnVuY3Rpb24gKGluZm8pIHtcbi8vICAgICBpZiAodGhpcy5wcm9wcy5vbkFjdGlvbikge1xuLy8gICAgICAgdGhpcy5wcm9wcy5vbkFjdGlvbihpbmZvKTtcbi8vICAgICB9XG4vLyAgICAgdmFyIGFjdGlvbiA9IHV0aWxzLmRhc2hUb1Bhc2NhbChpbmZvLmFjdGlvbik7XG4vLyAgICAgaWYgKHRoaXMucHJvcHNbJ29uJyArIGFjdGlvbl0pIHtcbi8vICAgICAgIHRoaXMucHJvcHNbJ29uJyArIGFjdGlvbl0oaW5mbyk7XG4vLyAgICAgfVxuLy8gICB9LFxuLy9cbi8vICAgLy8gUmVuZGVyIHRoZSB3cmFwcGVyIGNvbXBvbmVudCAoYnkganVzdCBkZWxlZ2F0aW5nIHRvIHRoZSBtYWluIGNvbXBvbmVudCkuXG4vLyAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuLy9cbi8vICAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWcgfHwgZGVmYXVsdENvbmZpZztcbi8vICAgICB2YXIgdmFsdWUgPSB0aGlzLnN0YXRlLnZhbHVlO1xuLy9cbi8vICAgICBpZiAodGhpcy5zdGF0ZS5pc0NvbnRyb2xsZWQpIHtcbi8vICAgICAgIGlmICghdGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuLy8gICAgICAgICBjb25zb2xlLmxvZygnWW91IHNob3VsZCBzdXBwbHkgYW4gb25DaGFuZ2UgaGFuZGxlciBpZiB5b3Ugc3VwcGx5IGEgdmFsdWUuJyk7XG4vLyAgICAgICB9XG4vLyAgICAgfVxuLy9cbi8vICAgICB2YXIgcHJvcHMgPSB7XG4vLyAgICAgICBjb25maWc6IGNvbmZpZyxcbi8vICAgICAgIC8vIEFsbG93IGZpZWxkIHRlbXBsYXRlcyB0byBiZSBwYXNzZWQgaW4gYXMgYGZpZWxkYCBvciBgZmllbGRzYC4gQWZ0ZXIgdGhpcywgc3RvcFxuLy8gICAgICAgLy8gY2FsbGluZyB0aGVtIGZpZWxkcy5cbi8vICAgICAgIGZpZWxkVGVtcGxhdGU6IHRoaXMucHJvcHMuZmllbGQsXG4vLyAgICAgICBmaWVsZFRlbXBsYXRlczogdGhpcy5wcm9wcy5maWVsZHMsXG4vLyAgICAgICB2YWx1ZTogdmFsdWUsXG4vLyAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbi8vICAgICAgIG9uQWN0aW9uOiB0aGlzLm9uQWN0aW9uXG4vLyAgICAgfTtcbi8vXG4vLyAgICAgXy5lYWNoKHRoaXMucHJvcHMsIGZ1bmN0aW9uIChwcm9wVmFsdWUsIGtleSkge1xuLy8gICAgICAgaWYgKCEoa2V5IGluIHByb3BzKSkge1xuLy8gICAgICAgICBwcm9wc1trZXldID0gcHJvcFZhbHVlO1xuLy8gICAgICAgfVxuLy8gICAgIH0pO1xuLy9cbi8vICAgICByZXR1cm4gRm9ybWF0aWNDb250cm9sbGVkKHByb3BzKTtcbi8vICAgfVxuLy9cbi8vIH0pO1xuIiwiLypcblRoaXMgaXMgdGhlIGRlZmF1bHQgY29uZmlndXJhdGlvbiBwbHVnaW4gZm9yIGZvcm1hdGljLiBUbyBjaGFuZ2UgZm9ybWF0aWMnc1xuYmVoYXZpb3IsIGp1c3QgY3JlYXRlIHlvdXIgb3duIHBsdWdpbiBmdW5jdGlvbiB0aGF0IHJldHVybnMgYW4gb2JqZWN0IHdpdGhcbm1ldGhvZHMgeW91IHdhbnQgdG8gYWRkIG9yIG92ZXJyaWRlLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBfID0gcmVxdWlyZSgnLi4vdW5kYXNoJyk7XG5cbmNvbnNvbGUubG9nKCdyZXF1aXJlLS0tJylcbnZhciBDb21wb25lbnRzID0gcmVxdWlyZSgnLi4vY29tcG9uZW50cycpO1xuXG5jb25zb2xlLmxvZyhDb21wb25lbnRzKTtcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgdmFyIGRlbGVnYXRlVG8gPSB1dGlscy5kZWxlZ2F0b3IoY29uZmlnKTtcblxuICByZXR1cm4ge1xuXG4gICAgLy8gTm9ybWFsaXplIGFuIGVsZW1lbnQgbmFtZS5cbiAgICBlbGVtZW50TmFtZShuYW1lKSB7XG4gICAgICByZXR1cm4gdXRpbHMuZGFzaFRvUGFzY2FsKG5hbWUpO1xuICAgIH0sXG5cbiAgICBjbGFzcyhuYW1lKSB7XG4gICAgICBpZiAoIW5hbWUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb21wb25lbnQgY2xhc3MgbmFtZSBtdXN0IGJlIHNwZWNpZmllZCB0byByZXRyaWV2ZSBjb21wb25lbnQgY2xhc3MuJyk7XG4gICAgICB9XG4gICAgICBuYW1lID0gY29uZmlnLmVsZW1lbnROYW1lKG5hbWUpO1xuICAgICAgaWYgKENvbXBvbmVudHNbbmFtZV0pIHtcbiAgICAgICAgcmV0dXJuIENvbXBvbmVudHNbbmFtZV07XG4gICAgICB9XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENvbXBvbmVudCBjbGFzcyAke25hbWV9IG5vdCBmb3VuZC5gKTtcbiAgICB9LFxuXG4gICAgaGVscGVyQ2xhc3MobmFtZSkge1xuICAgICAgaWYgKCFuYW1lKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSGVscGVyIGNsYXNzIG5hbWUgbXVzdCBiZSBzcGVjaWZpZWQgdG8gcmV0cmlldmUgY29tcG9uZW50IGNsYXNzLicpO1xuICAgICAgfVxuICAgICAgbmFtZSA9IGNvbmZpZy5lbGVtZW50TmFtZShuYW1lKTtcbiAgICAgIHJldHVybiBjb25maWcuY2xhc3MobmFtZSk7XG4gICAgfSxcblxuICAgIGZpZWxkQ2xhc3MobmFtZSkge1xuICAgICAgaWYgKCFuYW1lKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRmllbGQgY2xhc3MgbmFtZSBtdXN0IGJlIHNwZWNpZmllZCB0byByZXRyaWV2ZSBjb21wb25lbnQgY2xhc3MuJyk7XG4gICAgICB9XG4gICAgICBuYW1lICs9ICctZmllbGQnO1xuICAgICAgbmFtZSA9IGNvbmZpZy5lbGVtZW50TmFtZShuYW1lKTtcbiAgICAgIHJldHVybiBjb25maWcuY2xhc3MobmFtZSk7XG4gICAgfVxuICB9O1xufTtcbiIsInZhciBfID0ge307XG5cbl8uYXNzaWduID0gXy5leHRlbmQgPSByZXF1aXJlKCdvYmplY3QtYXNzaWduJyk7XG5fLmlzRXF1YWwgPSByZXF1aXJlKCdkZWVwLWVxdWFsJyk7XG5cbi8vIFRoZXNlIGFyZSBub3QgbmVjZXNzYXJpbHkgY29tcGxldGUgaW1wbGVtZW50YXRpb25zLiBUaGV5J3JlIGp1c3QgZW5vdWdoIGZvclxuLy8gd2hhdCdzIHVzZWQgaW4gZm9ybWF0aWMuXG5cbl8uZmxhdHRlbiA9IChhcnJheXMpID0+IFtdLmNvbmNhdC5hcHBseShbXSwgYXJyYXlzKTtcblxuXy5pc1N0cmluZyA9IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZyc7XG5fLmlzVW5kZWZpbmVkID0gdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJztcbl8uaXNPYmplY3QgPSB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnO1xuXy5pc0FycmF5ID0gdmFsdWUgPT4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbl8uaXNOdW1iZXIgPSB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInO1xuXy5pc0Jvb2xlYW4gPSB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJztcbl8uaXNOdWxsID0gdmFsdWUgPT4gdmFsdWUgPT09IG51bGw7XG5fLmlzRnVuY3Rpb24gPSB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbic7XG5cbl8uY2xvbmUgPSB2YWx1ZSA9PiB7XG4gIGlmICghXy5pc09iamVjdCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIF8uaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZS5zbGljZSgpIDogXy5hc3NpZ24oe30sIHZhbHVlKTtcbn07XG5cbl8uZmluZCA9IChpdGVtcywgdGVzdEZuKSA9PiB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAodGVzdEZuKGl0ZW1zW2ldKSkge1xuICAgICAgcmV0dXJuIGl0ZW1zW2ldO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdm9pZCAwO1xufTtcblxuXy5ldmVyeSA9IChpdGVtcywgdGVzdEZuKSA9PiB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoIXRlc3RGbihpdGVtc1tpXSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5fLmVhY2ggPSAob2JqLCBpdGVyYXRlRm4pID0+IHtcbiAgT2JqZWN0LmtleXMob2JqKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgaXRlcmF0ZUZuKG9ialtrZXldLCBrZXkpO1xuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gXztcbiIsIi8vICMgdXRpbHNcblxuLypcbkp1c3Qgc29tZSBzaGFyZWQgdXRpbGl0eSBmdW5jdGlvbnMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gcmVxdWlyZSgnLi91bmRhc2gnKTtcblxudmFyIHV0aWxzID0gZXhwb3J0cztcblxuLy8gQ29weSBvYmogcmVjdXJzaW5nIGRlZXBseS5cbnV0aWxzLmRlZXBDb3B5ID0gZnVuY3Rpb24gKG9iaikge1xuICBpZiAoXy5pc0FycmF5KG9iaikpIHtcbiAgICByZXR1cm4gb2JqLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgcmV0dXJuIHV0aWxzLmRlZXBDb3B5KGl0ZW0pO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKF8uaXNGdW5jdGlvbihvYmopKSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfSBlbHNlIGlmIChfLmlzTnVsbChvYmopKSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfSBlbHNlIGlmIChfLmlzT2JqZWN0KG9iaikpIHtcbiAgICB2YXIgY29weSA9IHt9O1xuICAgIF8uZWFjaChvYmosIGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICBjb3B5W2tleV0gPSB1dGlscy5kZWVwQ29weSh2YWx1ZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGNvcHk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfVxufTtcblxuLy8gQ2FjaGUgZm9yIHN0cmluZ3MgY29udmVydGVkIHRvIFBhc2NhbCBDYXNlLiBUaGlzIHNob3VsZCBiZSBhIGZpbml0ZSBsaXN0LCBzb1xuLy8gbm90IG11Y2ggZmVhciB0aGF0IHdlIHdpbGwgcnVuIG91dCBvZiBtZW1vcnkuXG52YXIgZGFzaFRvUGFzY2FsQ2FjaGUgPSB7fTtcblxuLy8gQ29udmVydCBmb28tYmFyIHRvIEZvb0Jhci5cbnV0aWxzLmRhc2hUb1Bhc2NhbCA9IGZ1bmN0aW9uIChzKSB7XG4gIGlmIChzID09PSAnJykge1xuICAgIHJldHVybiAnJztcbiAgfVxuICBpZiAoIWRhc2hUb1Bhc2NhbENhY2hlW3NdKSB7XG4gICAgZGFzaFRvUGFzY2FsQ2FjaGVbc10gPSBzLnNwbGl0KCctJykubWFwKGZ1bmN0aW9uIChwYXJ0KSB7XG4gICAgICByZXR1cm4gcGFydFswXS50b1VwcGVyQ2FzZSgpICsgcGFydC5zdWJzdHJpbmcoMSk7XG4gICAgfSkuam9pbignJyk7XG4gIH1cbiAgcmV0dXJuIGRhc2hUb1Bhc2NhbENhY2hlW3NdO1xufTtcblxuLy8gQ29weSBhbGwgY29tcHV0ZWQgc3R5bGVzIGZyb20gb25lIERPTSBlbGVtZW50IHRvIGFub3RoZXIuXG51dGlscy5jb3B5RWxlbWVudFN0eWxlID0gZnVuY3Rpb24gKGZyb21FbGVtZW50LCB0b0VsZW1lbnQpIHtcbiAgdmFyIGZyb21TdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGZyb21FbGVtZW50LCAnJyk7XG5cbiAgaWYgKGZyb21TdHlsZS5jc3NUZXh0ICE9PSAnJykge1xuICAgIHRvRWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gZnJvbVN0eWxlLmNzc1RleHQ7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGNzc1J1bGVzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZnJvbVN0eWxlLmxlbmd0aDsgaSsrKSB7XG4gICAgY3NzUnVsZXMucHVzaChmcm9tU3R5bGVbaV0gKyAnOicgKyBmcm9tU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShmcm9tU3R5bGVbaV0pICsgJzsnKTtcbiAgfVxuICB2YXIgY3NzVGV4dCA9IGNzc1J1bGVzLmpvaW4oJycpO1xuXG4gIHRvRWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gY3NzVGV4dDtcbn07XG5cbi8vIE9iamVjdCB0byBob2xkIGJyb3dzZXIgc25pZmZpbmcgaW5mby5cbnZhciBicm93c2VyID0ge1xuICBpc0Nocm9tZTogZmFsc2UsXG4gIGlzTW96aWxsYTogZmFsc2UsXG4gIGlzT3BlcmE6IGZhbHNlLFxuICBpc0llOiBmYWxzZSxcbiAgaXNTYWZhcmk6IGZhbHNlLFxuICBpc1Vua25vd246IGZhbHNlXG59O1xuXG4vLyBTbmlmZiB0aGUgYnJvd3Nlci5cbnZhciB1YSA9ICcnO1xuXG5pZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgdWEgPSBuYXZpZ2F0b3IudXNlckFnZW50O1xufVxuXG5pZih1YS5pbmRleE9mKCdDaHJvbWUnKSA+IC0xKSB7XG4gIGJyb3dzZXIuaXNDaHJvbWUgPSB0cnVlO1xufSBlbHNlIGlmICh1YS5pbmRleE9mKCdTYWZhcmknKSA+IC0xKSB7XG4gIGJyb3dzZXIuaXNTYWZhcmkgPSB0cnVlO1xufSBlbHNlIGlmICh1YS5pbmRleE9mKCdPcGVyYScpID4gLTEpIHtcbiAgYnJvd3Nlci5pc09wZXJhID0gdHJ1ZTtcbn0gZWxzZSBpZiAodWEuaW5kZXhPZignRmlyZWZveCcpID4gLTEpIHtcbiAgYnJvd3Nlci5pc01vemlsbGEgPSB0cnVlO1xufSBlbHNlIGlmICh1YS5pbmRleE9mKCdNU0lFJykgPiAtMSkge1xuICBicm93c2VyLmlzSWUgPSB0cnVlO1xufSBlbHNlIHtcbiAgYnJvd3Nlci5pc1Vua25vd24gPSB0cnVlO1xufVxuXG4vLyBFeHBvcnQgc25pZmZlZCBicm93c2VyIGluZm8uXG51dGlscy5icm93c2VyID0gYnJvd3NlcjtcblxuLy8gQ3JlYXRlIGEgbWV0aG9kIHRoYXQgZGVsZWdhdGVzIHRvIGFub3RoZXIgbWV0aG9kIG9uIHRoZSBzYW1lIG9iamVjdC4gVGhlXG4vLyBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gdXNlcyB0aGlzIGZ1bmN0aW9uIHRvIGRlbGVnYXRlIG9uZSBtZXRob2QgdG8gYW5vdGhlci5cbnV0aWxzLmRlbGVnYXRlVG8gPSBmdW5jdGlvbiAobmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzW25hbWVdLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH07XG59O1xuXG51dGlscy5kZWxlZ2F0b3IgPSBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiBmdW5jdGlvbiAobmFtZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gb2JqW25hbWVdLmFwcGx5KG9iaiwgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9O1xufTtcblxudXRpbHMuY2FwaXRhbGl6ZSA9IGZ1bmN0aW9uKHMpIHtcbiAgcmV0dXJuIHMuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzLnN1YnN0cmluZygxKS50b0xvd2VyQ2FzZSgpO1xufTtcbiIsInZhciBwU2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG52YXIgb2JqZWN0S2V5cyA9IHJlcXVpcmUoJy4vbGliL2tleXMuanMnKTtcbnZhciBpc0FyZ3VtZW50cyA9IHJlcXVpcmUoJy4vbGliL2lzX2FyZ3VtZW50cy5qcycpO1xuXG52YXIgZGVlcEVxdWFsID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYWN0dWFsLCBleHBlY3RlZCwgb3B0cykge1xuICBpZiAoIW9wdHMpIG9wdHMgPSB7fTtcbiAgLy8gNy4xLiBBbGwgaWRlbnRpY2FsIHZhbHVlcyBhcmUgZXF1aXZhbGVudCwgYXMgZGV0ZXJtaW5lZCBieSA9PT0uXG4gIGlmIChhY3R1YWwgPT09IGV4cGVjdGVkKSB7XG4gICAgcmV0dXJuIHRydWU7XG5cbiAgfSBlbHNlIGlmIChhY3R1YWwgaW5zdGFuY2VvZiBEYXRlICYmIGV4cGVjdGVkIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgIHJldHVybiBhY3R1YWwuZ2V0VGltZSgpID09PSBleHBlY3RlZC5nZXRUaW1lKCk7XG5cbiAgLy8gNy4zLiBPdGhlciBwYWlycyB0aGF0IGRvIG5vdCBib3RoIHBhc3MgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnLFxuICAvLyBlcXVpdmFsZW5jZSBpcyBkZXRlcm1pbmVkIGJ5ID09LlxuICB9IGVsc2UgaWYgKHR5cGVvZiBhY3R1YWwgIT0gJ29iamVjdCcgJiYgdHlwZW9mIGV4cGVjdGVkICE9ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIG9wdHMuc3RyaWN0ID8gYWN0dWFsID09PSBleHBlY3RlZCA6IGFjdHVhbCA9PSBleHBlY3RlZDtcblxuICAvLyA3LjQuIEZvciBhbGwgb3RoZXIgT2JqZWN0IHBhaXJzLCBpbmNsdWRpbmcgQXJyYXkgb2JqZWN0cywgZXF1aXZhbGVuY2UgaXNcbiAgLy8gZGV0ZXJtaW5lZCBieSBoYXZpbmcgdGhlIHNhbWUgbnVtYmVyIG9mIG93bmVkIHByb3BlcnRpZXMgKGFzIHZlcmlmaWVkXG4gIC8vIHdpdGggT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKSwgdGhlIHNhbWUgc2V0IG9mIGtleXNcbiAgLy8gKGFsdGhvdWdoIG5vdCBuZWNlc3NhcmlseSB0aGUgc2FtZSBvcmRlciksIGVxdWl2YWxlbnQgdmFsdWVzIGZvciBldmVyeVxuICAvLyBjb3JyZXNwb25kaW5nIGtleSwgYW5kIGFuIGlkZW50aWNhbCAncHJvdG90eXBlJyBwcm9wZXJ0eS4gTm90ZTogdGhpc1xuICAvLyBhY2NvdW50cyBmb3IgYm90aCBuYW1lZCBhbmQgaW5kZXhlZCBwcm9wZXJ0aWVzIG9uIEFycmF5cy5cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gb2JqRXF1aXYoYWN0dWFsLCBleHBlY3RlZCwgb3B0cyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWRPck51bGwodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIGlzQnVmZmVyICh4KSB7XG4gIGlmICgheCB8fCB0eXBlb2YgeCAhPT0gJ29iamVjdCcgfHwgdHlwZW9mIHgubGVuZ3RoICE9PSAnbnVtYmVyJykgcmV0dXJuIGZhbHNlO1xuICBpZiAodHlwZW9mIHguY29weSAhPT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgeC5zbGljZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAoeC5sZW5ndGggPiAwICYmIHR5cGVvZiB4WzBdICE9PSAnbnVtYmVyJykgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gb2JqRXF1aXYoYSwgYiwgb3B0cykge1xuICB2YXIgaSwga2V5O1xuICBpZiAoaXNVbmRlZmluZWRPck51bGwoYSkgfHwgaXNVbmRlZmluZWRPck51bGwoYikpXG4gICAgcmV0dXJuIGZhbHNlO1xuICAvLyBhbiBpZGVudGljYWwgJ3Byb3RvdHlwZScgcHJvcGVydHkuXG4gIGlmIChhLnByb3RvdHlwZSAhPT0gYi5wcm90b3R5cGUpIHJldHVybiBmYWxzZTtcbiAgLy9+fn5JJ3ZlIG1hbmFnZWQgdG8gYnJlYWsgT2JqZWN0LmtleXMgdGhyb3VnaCBzY3Jld3kgYXJndW1lbnRzIHBhc3NpbmcuXG4gIC8vICAgQ29udmVydGluZyB0byBhcnJheSBzb2x2ZXMgdGhlIHByb2JsZW0uXG4gIGlmIChpc0FyZ3VtZW50cyhhKSkge1xuICAgIGlmICghaXNBcmd1bWVudHMoYikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgYSA9IHBTbGljZS5jYWxsKGEpO1xuICAgIGIgPSBwU2xpY2UuY2FsbChiKTtcbiAgICByZXR1cm4gZGVlcEVxdWFsKGEsIGIsIG9wdHMpO1xuICB9XG4gIGlmIChpc0J1ZmZlcihhKSkge1xuICAgIGlmICghaXNCdWZmZXIoYikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGEubGVuZ3RoICE9PSBiLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICAgIGZvciAoaSA9IDA7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoYVtpXSAhPT0gYltpXSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICB0cnkge1xuICAgIHZhciBrYSA9IG9iamVjdEtleXMoYSksXG4gICAgICAgIGtiID0gb2JqZWN0S2V5cyhiKTtcbiAgfSBjYXRjaCAoZSkgey8vaGFwcGVucyB3aGVuIG9uZSBpcyBhIHN0cmluZyBsaXRlcmFsIGFuZCB0aGUgb3RoZXIgaXNuJ3RcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy8gaGF2aW5nIHRoZSBzYW1lIG51bWJlciBvZiBvd25lZCBwcm9wZXJ0aWVzIChrZXlzIGluY29ycG9yYXRlc1xuICAvLyBoYXNPd25Qcm9wZXJ0eSlcbiAgaWYgKGthLmxlbmd0aCAhPSBrYi5sZW5ndGgpXG4gICAgcmV0dXJuIGZhbHNlO1xuICAvL3RoZSBzYW1lIHNldCBvZiBrZXlzIChhbHRob3VnaCBub3QgbmVjZXNzYXJpbHkgdGhlIHNhbWUgb3JkZXIpLFxuICBrYS5zb3J0KCk7XG4gIGtiLnNvcnQoKTtcbiAgLy9+fn5jaGVhcCBrZXkgdGVzdFxuICBmb3IgKGkgPSBrYS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGlmIChrYVtpXSAhPSBrYltpXSlcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvL2VxdWl2YWxlbnQgdmFsdWVzIGZvciBldmVyeSBjb3JyZXNwb25kaW5nIGtleSwgYW5kXG4gIC8vfn5+cG9zc2libHkgZXhwZW5zaXZlIGRlZXAgdGVzdFxuICBmb3IgKGkgPSBrYS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGtleSA9IGthW2ldO1xuICAgIGlmICghZGVlcEVxdWFsKGFba2V5XSwgYltrZXldLCBvcHRzKSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0eXBlb2YgYSA9PT0gdHlwZW9mIGI7XG59XG4iLCJ2YXIgc3VwcG9ydHNBcmd1bWVudHNDbGFzcyA9IChmdW5jdGlvbigpe1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFyZ3VtZW50cylcbn0pKCkgPT0gJ1tvYmplY3QgQXJndW1lbnRzXSc7XG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHN1cHBvcnRzQXJndW1lbnRzQ2xhc3MgPyBzdXBwb3J0ZWQgOiB1bnN1cHBvcnRlZDtcblxuZXhwb3J0cy5zdXBwb3J0ZWQgPSBzdXBwb3J0ZWQ7XG5mdW5jdGlvbiBzdXBwb3J0ZWQob2JqZWN0KSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqZWN0KSA9PSAnW29iamVjdCBBcmd1bWVudHNdJztcbn07XG5cbmV4cG9ydHMudW5zdXBwb3J0ZWQgPSB1bnN1cHBvcnRlZDtcbmZ1bmN0aW9uIHVuc3VwcG9ydGVkKG9iamVjdCl7XG4gIHJldHVybiBvYmplY3QgJiZcbiAgICB0eXBlb2Ygb2JqZWN0ID09ICdvYmplY3QnICYmXG4gICAgdHlwZW9mIG9iamVjdC5sZW5ndGggPT0gJ251bWJlcicgJiZcbiAgICBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCAnY2FsbGVlJykgJiZcbiAgICAhT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKG9iamVjdCwgJ2NhbGxlZScpIHx8XG4gICAgZmFsc2U7XG59O1xuIiwiZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gdHlwZW9mIE9iamVjdC5rZXlzID09PSAnZnVuY3Rpb24nXG4gID8gT2JqZWN0LmtleXMgOiBzaGltO1xuXG5leHBvcnRzLnNoaW0gPSBzaGltO1xuZnVuY3Rpb24gc2hpbSAob2JqKSB7XG4gIHZhciBrZXlzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBvYmopIGtleXMucHVzaChrZXkpO1xuICByZXR1cm4ga2V5cztcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gVG9PYmplY3QodmFsKSB7XG5cdGlmICh2YWwgPT0gbnVsbCkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ09iamVjdC5hc3NpZ24gY2Fubm90IGJlIGNhbGxlZCB3aXRoIG51bGwgb3IgdW5kZWZpbmVkJyk7XG5cdH1cblxuXHRyZXR1cm4gT2JqZWN0KHZhbCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0LCBzb3VyY2UpIHtcblx0dmFyIGZyb207XG5cdHZhciBrZXlzO1xuXHR2YXIgdG8gPSBUb09iamVjdCh0YXJnZXQpO1xuXG5cdGZvciAodmFyIHMgPSAxOyBzIDwgYXJndW1lbnRzLmxlbmd0aDsgcysrKSB7XG5cdFx0ZnJvbSA9IGFyZ3VtZW50c1tzXTtcblx0XHRrZXlzID0gT2JqZWN0LmtleXMoT2JqZWN0KGZyb20pKTtcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dG9ba2V5c1tpXV0gPSBmcm9tW2tleXNbaV1dO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiB0bztcbn07XG4iXX0=
