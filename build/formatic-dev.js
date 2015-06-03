!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Formatic=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/justin/Dropbox/git/formatic/index.js":[function(require,module,exports){
"use strict";

// # index

// Export the Formatic React class at the top level.
module.exports = require("./lib/formatic");

},{"./lib/formatic":"/Users/justin/Dropbox/git/formatic/lib/formatic.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/fields/fields.js":[function(require,module,exports){
(function (global){
"use strict";

var _defineProperty = function (obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

// # fields component

/*
Render a field to edit the values of an object with static properties.
*/

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var _ = require("../../undash");

module.exports = React.createClass({

  displayName: "FieldsField",

  onChange: function onChange(value, info) {
    this.props.onChange(_.extend({}, this.props.value, _defineProperty({}, info.key, value)));
  },

  render: function render() {
    var _this = this;

    var config = this.props.config;

    var childFieldElements = [];

    if (this.props.children) {
      childFieldElements = this.props.children.map(function (child) {
        return React.cloneElement(child, { key: child.props.fieldKey, config: config, onChange: _this.onChange });
      });
    } else if (this.props.fields) {
      childFieldElements = this.props.fields.map(function (field) {
        var ChildField = config.fieldClass(field.type);
        return React.createElement(ChildField, _extends({ key: field.key }, field, { config: config, onChange: _this.onChange }));
      });
    }

    return React.createElement(
      "fieldset",
      null,
      childFieldElements
    );
  }

});

// 'use strict';
//
// var React = require('react/addons');
// var R = React.DOM;
// var _ = require('../../undash');
// var cx = require('classnames');
//
// module.exports = React.createClass({
//
//   displayName: 'Fields',
//
//   mixins: [require('../../mixins/field')],
//
//   onChangeField: function (key, newValue, info) {
//     if (key) {
//       var newObjectValue = _.extend({}, this.props.field.value);
//       newObjectValue[key] = newValue;
//       this.onBubbleValue(newObjectValue, info);
//     }
//   },
//
//   render: function () {
//     return this.renderWithConfig();
//   },
//
//   renderDefault: function () {
//     var config = this.props.config;
//     var field = this.props.field;
//
//     var fields = config.createChildFields(field);
//
//     return config.createElement('field', {
//       config: config, field: field, plain: this.props.plain
//     },
//       R.fieldset({className: cx(this.props.classes)},
//         fields.map(function (childField, i) {
//           var key = childField.key || i;
//           return config.createFieldElement({
//             key: key || i,
//             field: childField,
//             onChange: this.onChangeField.bind(this, key), onAction: this.onBubbleAction
//           });
//         }.bind(this))
//       )
//     );
//   }
//
// });

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../undash":"/Users/justin/Dropbox/git/formatic/lib/undash.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/fields/string.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

module.exports = React.createClass({

  displayName: "StringField",

  onChange: function onChange(event) {
    this.props.onChange(event.target.value, { key: this.props.fieldKey });
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
    Fields: wrapField(require("./fields/fields")),
    String: wrapField(require("./fields/string"))
  },
  helpers: {
    Field: wrapHelper(require("./helpers/field")),
    Label: wrapHelper(require("./helpers/label")),
    Help: wrapHelper(require("./helpers/help"))
  }
};

},{"./fields/fields":"/Users/justin/Dropbox/git/formatic/lib/components/fields/fields.js","./fields/string":"/Users/justin/Dropbox/git/formatic/lib/components/fields/string.js","./helpers/field":"/Users/justin/Dropbox/git/formatic/lib/components/helpers/field.js","./helpers/help":"/Users/justin/Dropbox/git/formatic/lib/components/helpers/help.js","./helpers/label":"/Users/justin/Dropbox/git/formatic/lib/components/helpers/label.js","./wrap-field":"/Users/justin/Dropbox/git/formatic/lib/components/wrap-field.js","./wrap-helper":"/Users/justin/Dropbox/git/formatic/lib/components/wrap-helper.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/wrap-field.js":[function(require,module,exports){
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
        value: function onChange(newValue, info) {
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
    createConfig: createConfig.bind(null, defaultConfigPlugin),
    wrapField: require("./components/wrap-field"),
    wrapHelper: require("./components/wrap-helper")
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

},{"./components":"/Users/justin/Dropbox/git/formatic/lib/components/index.js","./components/wrap-field":"/Users/justin/Dropbox/git/formatic/lib/components/wrap-field.js","./components/wrap-helper":"/Users/justin/Dropbox/git/formatic/lib/components/wrap-helper.js","./config":"/Users/justin/Dropbox/git/formatic/lib/config.js","./create-config":"/Users/justin/Dropbox/git/formatic/lib/create-config.js","./plugins/default-config":"/Users/justin/Dropbox/git/formatic/lib/plugins/default-config.js","./undash":"/Users/justin/Dropbox/git/formatic/lib/undash.js"}],"/Users/justin/Dropbox/git/formatic/lib/plugins/default-config.js":[function(require,module,exports){
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

    componentClass: function componentClass(name) {
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
      return config.componentClass(name);
    },

    fieldClass: function fieldClass(name) {
      if (!name) {
        throw new Error("Field class name must be specified to retrieve component class.");
      }
      name += "-field";
      name = config.elementName(name);
      return config.componentClass(name);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2luZGV4LmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9maWVsZHMvZmllbGRzLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9maWVsZHMvc3RyaW5nLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2ZpZWxkLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2hlbHAuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvbGFiZWwuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2luZGV4LmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy93cmFwLWZpZWxkLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy93cmFwLWhlbHBlci5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbmZpZy5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NyZWF0ZS1jb25maWcuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9mb3JtYXRpYy5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL3BsdWdpbnMvZGVmYXVsdC1jb25maWcuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi91bmRhc2guanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi91dGlscy5qcyIsIm5vZGVfbW9kdWxlcy9kZWVwLWVxdWFsL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RlZXAtZXF1YWwvbGliL2lzX2FyZ3VtZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9kZWVwLWVxdWFsL2xpYi9rZXlzLmpzIiwibm9kZV9tb2R1bGVzL29iamVjdC1hc3NpZ24vaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztBQ0dBLE1BQU0sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7QUNHM0MsSUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQy9CLElBQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQzs7QUFFbEMsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDOztBQUVqQyxhQUFXLEVBQUUsYUFBYTs7QUFFMUIsVUFBUSxFQUFBLGtCQUFDLEtBQUssRUFBRSxJQUFJLEVBQUU7QUFDcEIsUUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLHNCQUFJLElBQUksQ0FBQyxHQUFHLEVBQUcsS0FBSyxFQUFFLENBQUMsQ0FBQztHQUMxRTs7QUFFRCxRQUFNLEVBQUEsa0JBQUc7OztBQUVQLFFBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDOztBQUVqQyxRQUFJLGtCQUFrQixHQUFHLEVBQUUsQ0FBQzs7QUFFNUIsUUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRTtBQUN2Qix3QkFBa0IsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEs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Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDeEJ4QixJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRTVCLElBQU0sWUFBWSxHQUFHLHdCQUFzQjtvQ0FBVCxPQUFPO0FBQVAsV0FBTzs7O0FBQ3ZDLFNBQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxVQUFVLE1BQU0sRUFBRSxNQUFNLEVBQUU7QUFDOUMsUUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFF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LEdBQUcsVUFBVSxHQUFHLEVBQUU7QUFDL0IsU0FBTyxVQUFVLElBQUksRUFBRTtBQUNyQixXQUFPLFlBQVk7QUFDakIsYUFBTyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQztLQUN4QyxDQUFDO0dBQ0gsQ0FBQztDQUNILENBQUM7O0FBRUYsS0FBSyxDQUFDLFVBQVUsR0FBRyxVQUFTLENBQUMsRUFBRTtBQUM3QixTQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztDQUNqRSxDQUFDOzs7Ozs7OztBQ3hIRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyAjIGluZGV4XG5cbi8vIEV4cG9ydCB0aGUgRm9ybWF0aWMgUmVhY3QgY2xhc3MgYXQgdGhlIHRvcCBsZXZlbC5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvZm9ybWF0aWMnKTtcbiIsIi8vICMgZmllbGRzIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIGEgZmllbGQgdG8gZWRpdCB0aGUgdmFsdWVzIG9mIGFuIG9iamVjdCB3aXRoIHN0YXRpYyBwcm9wZXJ0aWVzLlxuKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuY29uc3QgXyA9IHJlcXVpcmUoJy4uLy4uL3VuZGFzaCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0ZpZWxkc0ZpZWxkJyxcblxuICBvbkNoYW5nZSh2YWx1ZSwgaW5mbykge1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UoXy5leHRlbmQoe30sIHRoaXMucHJvcHMudmFsdWUsIHtbaW5mby5rZXldOiB2YWx1ZX0pKTtcbiAgfSxcblxuICByZW5kZXIoKSB7XG5cbiAgICBjb25zdCBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblxuICAgIGxldCBjaGlsZEZpZWxkRWxlbWVudHMgPSBbXTtcblxuICAgIGlmICh0aGlzLnByb3BzLmNoaWxkcmVuKSB7XG4gICAgICBjaGlsZEZpZWxkRWxlbWVudHMgPSB0aGlzLnByb3BzLmNoaWxkcmVuLm1hcChjaGlsZCA9PiAoXG4gICAgICAgIFJlYWN0LmNsb25lRWxlbWVudChjaGlsZCwge2tleTogY2hpbGQucHJvcHMuZmllbGRLZXksIGNvbmZpZzogY29uZmlnLCBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZX0pXG4gICAgICApKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMuZmllbGRzKSB7XG4gICAgICBjaGlsZEZpZWxkRWxlbWVudHMgPSB0aGlzLnByb3BzLmZpZWxkcy5tYXAoZmllbGQgPT4ge1xuICAgICAgICBjb25zdCBDaGlsZEZpZWxkID0gY29uZmlnLmZpZWxkQ2xhc3MoZmllbGQudHlwZSk7XG4gICAgICAgIHJldHVybiA8Q2hpbGRGaWVsZCBrZXk9e2ZpZWxkLmtleX0gey4uLmZpZWxkfSBjb25maWc9e2NvbmZpZ30gb25DaGFuZ2U9IHt0aGlzLm9uQ2hhbmdlfS8+O1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxmaWVsZHNldD5cbiAgICAgIHtcbiAgICAgICAgY2hpbGRGaWVsZEVsZW1lbnRzXG4gICAgICB9XG4gICAgICA8L2ZpZWxkc2V0PlxuICAgICk7XG4gIH1cblxufSk7XG5cbi8vICd1c2Ugc3RyaWN0Jztcbi8vXG4vLyB2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbi8vIHZhciBSID0gUmVhY3QuRE9NO1xuLy8gdmFyIF8gPSByZXF1aXJlKCcuLi8uLi91bmRhc2gnKTtcbi8vIHZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcbi8vXG4vLyBtb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbi8vXG4vLyAgIGRpc3BsYXlOYW1lOiAnRmllbGRzJyxcbi8vXG4vLyAgIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcbi8vXG4vLyAgIG9uQ2hhbmdlRmllbGQ6IGZ1bmN0aW9uIChrZXksIG5ld1ZhbHVlLCBpbmZvKSB7XG4vLyAgICAgaWYgKGtleSkge1xuLy8gICAgICAgdmFyIG5ld09iamVjdFZhbHVlID0gXy5leHRlbmQoe30sIHRoaXMucHJvcHMuZmllbGQudmFsdWUpO1xuLy8gICAgICAgbmV3T2JqZWN0VmFsdWVba2V5XSA9IG5ld1ZhbHVlO1xuLy8gICAgICAgdGhpcy5vbkJ1YmJsZVZhbHVlKG5ld09iamVjdFZhbHVlLCBpbmZvKTtcbi8vICAgICB9XG4vLyAgIH0sXG4vL1xuLy8gICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbi8vICAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4vLyAgIH0sXG4vL1xuLy8gICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4vLyAgICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuLy8gICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG4vL1xuLy8gICAgIHZhciBmaWVsZHMgPSBjb25maWcuY3JlYXRlQ2hpbGRGaWVsZHMoZmllbGQpO1xuLy9cbi8vICAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywge1xuLy8gICAgICAgY29uZmlnOiBjb25maWcsIGZpZWxkOiBmaWVsZCwgcGxhaW46IHRoaXMucHJvcHMucGxhaW5cbi8vICAgICB9LFxuLy8gICAgICAgUi5maWVsZHNldCh7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpfSxcbi8vICAgICAgICAgZmllbGRzLm1hcChmdW5jdGlvbiAoY2hpbGRGaWVsZCwgaSkge1xuLy8gICAgICAgICAgIHZhciBrZXkgPSBjaGlsZEZpZWxkLmtleSB8fCBpO1xuLy8gICAgICAgICAgIHJldHVybiBjb25maWcuY3JlYXRlRmllbGRFbGVtZW50KHtcbi8vICAgICAgICAgICAgIGtleToga2V5IHx8IGksXG4vLyAgICAgICAgICAgICBmaWVsZDogY2hpbGRGaWVsZCxcbi8vICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlRmllbGQuYmluZCh0aGlzLCBrZXkpLCBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvblxuLy8gICAgICAgICAgIH0pO1xuLy8gICAgICAgICB9LmJpbmQodGhpcykpXG4vLyAgICAgICApXG4vLyAgICAgKTtcbi8vICAgfVxuLy9cbi8vIH0pO1xuIiwiY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ1N0cmluZ0ZpZWxkJyxcblxuICBvbkNoYW5nZShldmVudCkge1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UoZXZlbnQudGFyZ2V0LnZhbHVlLCB7a2V5OiB0aGlzLnByb3BzLmZpZWxkS2V5fSk7XG4gIH0sXG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuXG4gICAgY29uc3QgRmllbGQgPSBjb25maWcuaGVscGVyQ2xhc3MoJ2ZpZWxkJyk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPEZpZWxkIHsuLi50aGlzLnByb3BzfT5cbiAgICAgICAgPHRleHRhcmVhIHZhbHVlPXt0aGlzLnByb3BzLnZhbHVlfSBvbkNoYW5nZT17dGhpcy5vbkNoYW5nZX0vPlxuICAgICAgPC9GaWVsZD5cbiAgICApO1xuICB9XG5cbn0pO1xuXG4vLyAvLyAjIHN0cmluZyBjb21wb25lbnRcbi8vXG4vLyAvKlxuLy8gUmVuZGVyIGEgZmllbGQgdGhhdCBjYW4gZWRpdCBhIHN0cmluZyB2YWx1ZS5cbi8vICovXG4vL1xuLy8gJ3VzZSBzdHJpY3QnO1xuLy9cbi8vIHZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuLy8gdmFyIFIgPSBSZWFjdC5ET007XG4vLyB2YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG4vL1xuLy8gbW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4vL1xuLy8gICBkaXNwbGF5TmFtZTogJ1N0cmluZycsXG4vL1xuLy8gICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG4vL1xuLy8gICBvbkNoYW5nZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4vLyAgICAgdGhpcy5vbkNoYW5nZVZhbHVlKGV2ZW50LnRhcmdldC52YWx1ZSk7XG4vLyAgIH0sXG4vL1xuLy8gICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbi8vICAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4vLyAgIH0sXG4vL1xuLy8gICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4vL1xuLy8gICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbi8vICAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuLy9cbi8vICAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywge1xuLy8gICAgICAgY29uZmlnOiBjb25maWcsIGZpZWxkOiBmaWVsZCwgcGxhaW46IHRoaXMucHJvcHMucGxhaW5cbi8vICAgICB9LCBSLnRleHRhcmVhKHtcbi8vICAgICAgIHZhbHVlOiBmaWVsZC52YWx1ZSxcbi8vICAgICAgIGNsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSxcbi8vICAgICAgIHJvd3M6IGZpZWxkLnJvd3MgfHwgdGhpcy5wcm9wcy5yb3dzLFxuLy8gICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsXG4vLyAgICAgICBvbkZvY3VzOiB0aGlzLm9uRm9jdXNBY3Rpb24sXG4vLyAgICAgICBvbkJsdXI6IHRoaXMub25CbHVyQWN0aW9uXG4vLyAgICAgfSkpO1xuLy8gICB9XG4vLyB9KTtcbiIsImNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbmNvbnN0IENvbmZpZyA9IHJlcXVpcmUoJy4uLy4uL2NvbmZpZycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0ZpZWxkJyxcblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgY29uZmlnID0gQ29uZmlnLmZvckNvbXBvbmVudCh0aGlzKTtcblxuICAgIGNvbnN0IExhYmVsID0gY29uZmlnLmhlbHBlckNsYXNzKCdsYWJlbCcpO1xuICAgIGNvbnN0IEhlbHAgPSBjb25maWcuaGVscGVyQ2xhc3MoJ2hlbHAnKTtcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2PlxuICAgICAgICA8TGFiZWwgey4uLnRoaXMucHJvcHN9Lz5cbiAgICAgICAgPEhlbHAgey4uLnRoaXMucHJvcHN9Lz5cbiAgICAgICAge3RoaXMucHJvcHMuY2hpbGRyZW59XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbn0pO1xuXG4vLyAvLyAjIGZpZWxkIGNvbXBvbmVudFxuLy9cbi8vIC8qXG4vLyBVc2VkIGJ5IGFueSBmaWVsZHMgdG8gcHV0IHRoZSBsYWJlbCBhbmQgaGVscCB0ZXh0IGFyb3VuZCB0aGUgZmllbGQuXG4vLyAqL1xuLy9cbi8vICd1c2Ugc3RyaWN0Jztcbi8vXG4vLyB2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbi8vIHZhciBSID0gUmVhY3QuRE9NO1xuLy8gdmFyIF8gPSByZXF1aXJlKCcuLi8uLi91bmRhc2gnKTtcbi8vIHZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcbi8vXG4vLyB2YXIgQ1NTVHJhbnNpdGlvbkdyb3VwID0gUmVhY3QuY3JlYXRlRmFjdG9yeShSZWFjdC5hZGRvbnMuQ1NTVHJhbnNpdGlvbkdyb3VwKTtcbi8vXG4vLyBtb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbi8vXG4vLyAgIGRpc3BsYXlOYW1lOiAnRmllbGQnLFxuLy9cbi8vICAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcbi8vXG4vLyAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuLy8gICAgIHJldHVybiB7XG4vLyAgICAgICBjb2xsYXBzZWQ6IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkSXNDb2xsYXBzZWQodGhpcy5wcm9wcy5maWVsZCkgPyB0cnVlIDogZmFsc2Vcbi8vICAgICB9O1xuLy8gICB9LFxuLy9cbi8vICAgb25DbGlja0xhYmVsOiBmdW5jdGlvbiAoKSB7XG4vLyAgICAgdGhpcy5zZXRTdGF0ZSh7XG4vLyAgICAgICBjb2xsYXBzZWQ6ICF0aGlzLnN0YXRlLmNvbGxhcHNlZFxuLy8gICAgIH0pO1xuLy8gICB9LFxuLy9cbi8vICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4vLyAgICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuLy8gICB9LFxuLy9cbi8vICAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuLy9cbi8vICAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4vL1xuLy8gICAgIGlmICh0aGlzLnByb3BzLnBsYWluKSB7XG4vLyAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5jaGlsZHJlbjtcbi8vICAgICB9XG4vL1xuLy8gICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG4vL1xuLy8gICAgIHZhciBpbmRleCA9IHRoaXMucHJvcHMuaW5kZXg7XG4vLyAgICAgaWYgKCFfLmlzTnVtYmVyKGluZGV4KSkge1xuLy8gICAgICAgdmFyIGtleSA9IHRoaXMucHJvcHMuZmllbGQua2V5O1xuLy8gICAgICAgaW5kZXggPSBfLmlzTnVtYmVyKGtleSkgPyBrZXkgOiB1bmRlZmluZWQ7XG4vLyAgICAgfVxuLy9cbi8vICAgICB2YXIgY2xhc3NlcyA9IF8uZXh0ZW5kKHt9LCB0aGlzLnByb3BzLmNsYXNzZXMpO1xuLy9cbi8vICAgICB2YXIgZXJyb3JzID0gY29uZmlnLmZpZWxkRXJyb3JzKGZpZWxkKTtcbi8vXG4vLyAgICAgZXJyb3JzLmZvckVhY2goZnVuY3Rpb24gKGVycm9yKSB7XG4vLyAgICAgICBjbGFzc2VzWyd2YWxpZGF0aW9uLWVycm9yLScgKyBlcnJvci50eXBlXSA9IHRydWU7XG4vLyAgICAgfSk7XG4vL1xuLy8gICAgIGlmIChjb25maWcuZmllbGRJc1JlcXVpcmVkKGZpZWxkKSkge1xuLy8gICAgICAgY2xhc3Nlcy5yZXF1aXJlZCA9IHRydWU7XG4vLyAgICAgfSBlbHNlIHtcbi8vICAgICAgIGNsYXNzZXMub3B0aW9uYWwgPSB0cnVlO1xuLy8gICAgIH1cbi8vXG4vLyAgICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IGN4KGNsYXNzZXMpLCBzdHlsZToge2Rpc3BsYXk6IChmaWVsZC5oaWRkZW4gPyAnbm9uZScgOiAnJyl9fSxcbi8vICAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdsYWJlbCcsIHtcbi8vICAgICAgICAgY29uZmlnOiBjb25maWcsIGZpZWxkOiBmaWVsZCxcbi8vICAgICAgICAgaW5kZXg6IGluZGV4LCBvbkNsaWNrOiBjb25maWcuZmllbGRJc0NvbGxhcHNpYmxlKGZpZWxkKSA/IHRoaXMub25DbGlja0xhYmVsIDogbnVsbFxuLy8gICAgICAgfSksXG4vLyAgICAgICBDU1NUcmFuc2l0aW9uR3JvdXAoe3RyYW5zaXRpb25OYW1lOiAncmV2ZWFsJ30sXG4vLyAgICAgICAgIHRoaXMuc3RhdGUuY29sbGFwc2VkID8gW10gOiBbXG4vLyAgICAgICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2hlbHAnLCB7XG4vLyAgICAgICAgICAgICBjb25maWc6IGNvbmZpZywgZmllbGQ6IGZpZWxkLFxuLy8gICAgICAgICAgICAga2V5OiAnaGVscCdcbi8vICAgICAgICAgICB9KSxcbi8vICAgICAgICAgICB0aGlzLnByb3BzLmNoaWxkcmVuXG4vLyAgICAgICAgIF1cbi8vICAgICAgIClcbi8vICAgICApO1xuLy8gICB9XG4vLyB9KTtcbiIsImNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdIZWxwJyxcblxuICByZW5kZXIoKSB7XG4gICAgaWYgKHRoaXMucHJvcHMuaGVscFRleHQpIHtcbiAgICAgIHJldHVybiA8ZGl2Pnt0aGlzLnByb3BzLmhlbHBUZXh0fTwvZGl2PjtcbiAgICB9XG5cbiAgICByZXR1cm4gPHNwYW4vPjtcbiAgfVxuXG59KTtcblxuLy8gLy8gIyBoZWxwIGNvbXBvbmVudFxuLy9cbi8vIC8qXG4vLyBKdXN0IHRoZSBoZWxwIHRleHQgYmxvY2suXG4vLyAqL1xuLy9cbi8vICd1c2Ugc3RyaWN0Jztcbi8vXG4vLyB2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbi8vIHZhciBSID0gUmVhY3QuRE9NO1xuLy8gdmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuLy9cbi8vIG1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuLy9cbi8vICAgZGlzcGxheU5hbWU6ICdIZWxwJyxcbi8vXG4vLyAgIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG4vL1xuLy8gICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbi8vICAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4vLyAgIH0sXG4vL1xuLy8gICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4vL1xuLy8gICAgIHZhciBoZWxwVGV4dCA9IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkSGVscFRleHQodGhpcy5wcm9wcy5maWVsZCk7XG4vL1xuLy8gICAgIHJldHVybiBoZWxwVGV4dCA/XG4vLyAgICAgICBSLmRpdih7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpLCBkYW5nZXJvdXNseVNldElubmVySFRNTDoge19faHRtbDogaGVscFRleHR9fSkgOlxuLy8gICAgICAgUi5zcGFuKG51bGwpO1xuLy8gICB9XG4vLyB9KTtcbiIsImNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdMYWJlbCcsXG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IGxhYmVsID0gdGhpcy5wcm9wcy5sYWJlbCB8fCAnJztcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdj5cbiAgICAgICAge2xhYmVsfVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG59KTtcblxuLy8gLy8gIyBsYWJlbCBjb21wb25lbnRcbi8vXG4vLyAvKlxuLy8gSnVzdCB0aGUgbGFiZWwgZm9yIGEgZmllbGQuXG4vLyAqL1xuLy9cbi8vICd1c2Ugc3RyaWN0Jztcbi8vXG4vLyB2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbi8vIHZhciBSID0gUmVhY3QuRE9NO1xuLy8gdmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuLy9cbi8vIG1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuLy9cbi8vICAgZGlzcGxheU5hbWU6ICdMYWJlbCcsXG4vL1xuLy8gICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuLy9cbi8vICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4vLyAgICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuLy8gICB9LFxuLy9cbi8vICAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuLy8gICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbi8vICAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuLy9cbi8vICAgICB2YXIgZmllbGRMYWJlbCA9IGNvbmZpZy5maWVsZExhYmVsKGZpZWxkKTtcbi8vXG4vLyAgICAgdmFyIGxhYmVsID0gbnVsbDtcbi8vICAgICBpZiAodHlwZW9mIHRoaXMucHJvcHMuaW5kZXggPT09ICdudW1iZXInKSB7XG4vLyAgICAgICBsYWJlbCA9ICcnICsgKHRoaXMucHJvcHMuaW5kZXggKyAxKSArICcuJztcbi8vICAgICAgIGlmIChmaWVsZExhYmVsKSB7XG4vLyAgICAgICAgIGxhYmVsID0gbGFiZWwgKyAnICcgKyBmaWVsZExhYmVsO1xuLy8gICAgICAgfVxuLy8gICAgIH1cbi8vXG4vLyAgICAgaWYgKGZpZWxkTGFiZWwgfHwgbGFiZWwpIHtcbi8vICAgICAgIHZhciB0ZXh0ID0gbGFiZWwgfHwgZmllbGRMYWJlbDtcbi8vICAgICAgIGlmICh0aGlzLnByb3BzLm9uQ2xpY2spIHtcbi8vICAgICAgICAgdGV4dCA9IFIuYSh7aHJlZjogJ0phdmFTY3JpcHQnICsgJzonLCBvbkNsaWNrOiB0aGlzLnByb3BzLm9uQ2xpY2t9LCB0ZXh0KTtcbi8vICAgICAgIH1cbi8vICAgICAgIGxhYmVsID0gUi5sYWJlbCh7fSwgdGV4dCk7XG4vLyAgICAgfVxuLy9cbi8vICAgICB2YXIgcmVxdWlyZWRPck5vdDtcbi8vXG4vLyAgICAgaWYgKCFjb25maWcuZmllbGRIYXNWYWx1ZUNoaWxkcmVuKGZpZWxkKSkge1xuLy8gICAgICAgcmVxdWlyZWRPck5vdCA9IFIuc3Bhbih7XG4vLyAgICAgICAgIGNsYXNzTmFtZTogY29uZmlnLmZpZWxkSXNSZXF1aXJlZChmaWVsZCkgPyAncmVxdWlyZWQtdGV4dCcgOiAnbm90LXJlcXVpcmVkLXRleHQnXG4vLyAgICAgICB9KTtcbi8vICAgICB9XG4vL1xuLy8gICAgIHJldHVybiBSLmRpdih7XG4vLyAgICAgICBjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3Nlcylcbi8vICAgICB9LFxuLy8gICAgICAgbGFiZWwsXG4vLyAgICAgICAnICcsXG4vLyAgICAgICByZXF1aXJlZE9yTm90XG4vLyAgICAgKTtcbi8vICAgfVxuLy8gfSk7XG4iLCJjb25zdCB3cmFwRmllbGQgPSByZXF1aXJlKCcuL3dyYXAtZmllbGQnKTtcbmNvbnN0IHdyYXBIZWxwZXIgPSByZXF1aXJlKCcuL3dyYXAtaGVscGVyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBmaWVsZHM6IHtcbiAgICBGaWVsZHM6IHdyYXBGaWVsZChyZXF1aXJlKCcuL2ZpZWxkcy9maWVsZHMnKSksXG4gICAgU3RyaW5nOiB3cmFwRmllbGQocmVxdWlyZSgnLi9maWVsZHMvc3RyaW5nJykpXG4gIH0sXG4gIGhlbHBlcnM6IHtcbiAgICBGaWVsZDogd3JhcEhlbHBlcihyZXF1aXJlKCcuL2hlbHBlcnMvZmllbGQnKSksXG4gICAgTGFiZWw6IHdyYXBIZWxwZXIocmVxdWlyZSgnLi9oZWxwZXJzL2xhYmVsJykpLFxuICAgIEhlbHA6IHdyYXBIZWxwZXIocmVxdWlyZSgnLi9oZWxwZXJzL2hlbHAnKSlcbiAgfVxufTtcbiIsImNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbmNvbnN0IENvbmZpZyA9IHJlcXVpcmUoJy4uL2NvbmZpZycpO1xuY29uc3QgXyA9IHJlcXVpcmUoJy4uL3VuZGFzaCcpO1xuXG5leHBvcnQgZGVmYXVsdCAoRmllbGRDb21wb25lbnQpID0+IHtcblxuICBjb25zdCBXcmFwRmllbGQgPSBjbGFzcyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcywgY29udGV4dCkge1xuICAgICAgc3VwZXIocHJvcHMsIGNvbnRleHQpO1xuXG4gICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICBjb25maWc6IENvbmZpZy5mb3JDb21wb25lbnQodGhpcyksXG4gICAgICAgIGlzQ29udHJvbGxlZDogIV8uaXNVbmRlZmluZWQodGhpcy5wcm9wcy52YWx1ZSksXG4gICAgICAgIHZhbHVlOiBfLmlzVW5kZWZpbmVkKHRoaXMucHJvcHMudmFsdWUpID8gdGhpcy5wcm9wcy5kZWZhdWx0VmFsdWUgOiB0aGlzLnByb3BzLnZhbHVlLFxuICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZS5iaW5kKHRoaXMpXG4gICAgICB9O1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMgKG5ld1Byb3BzKSB7XG4gICAgICBpZiAodGhpcy5zdGF0ZS5pc0NvbnRyb2xsZWQpIHtcbiAgICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKG5ld1Byb3BzLnZhbHVlKSkge1xuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgdmFsdWU6IG5ld1Byb3BzLnZhbHVlXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBvbkNoYW5nZSAobmV3VmFsdWUsIGluZm8pIHtcbiAgICAgIGlmICghdGhpcy5zdGF0ZS5pc0NvbnRyb2xsZWQpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgdmFsdWU6IG5ld1ZhbHVlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UobmV3VmFsdWUsIGluZm8pO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgIHJldHVybiA8RmllbGRDb21wb25lbnQgey4uLnRoaXMucHJvcHN9IHsuLi50aGlzLnN0YXRlfS8+O1xuICAgIH1cblxuICB9O1xuXG4gIHJldHVybiBXcmFwRmllbGQ7XG59O1xuIiwiY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuY29uc3QgQ29uZmlnID0gcmVxdWlyZSgnLi4vY29uZmlnJyk7XG5cbmV4cG9ydCBkZWZhdWx0IChIZWxwZXJDb21wb25lbnQpID0+IHtcblxuICBjb25zdCBXcmFwSGVscGVyID0gY2xhc3MgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMsIGNvbnRleHQpIHtcbiAgICAgIHN1cGVyKHByb3BzLCBjb250ZXh0KTtcblxuICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgY29uZmlnOiBDb25maWcuZm9yQ29tcG9uZW50KHRoaXMpXG4gICAgICB9O1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgIHJldHVybiA8SGVscGVyQ29tcG9uZW50IHsuLi50aGlzLnByb3BzfSB7Li4udGhpcy5zdGF0ZX0vPjtcbiAgICB9XG5cbiAgfTtcblxuICByZXR1cm4gV3JhcEhlbHBlcjtcbn07XG4iLCIvLyAjIGRlZmF1bHQtY29uZmlnXG5cbi8qXG5UaGlzIGlzIHRoZSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gcGx1Z2luIGZvciBmb3JtYXRpYy4gVG8gY2hhbmdlIGZvcm1hdGljJ3NcbmJlaGF2aW9yLCBqdXN0IGNyZWF0ZSB5b3VyIG93biBwbHVnaW4gZnVuY3Rpb24gdGhhdCByZXR1cm5zIGFuIG9iamVjdCB3aXRoXG5tZXRob2RzIHlvdSB3YW50IHRvIGFkZCBvciBvdmVycmlkZS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxubGV0IGRlZmF1bHRDb25maWcgPSB7fTtcblxuY29uc3QgQ29uZmlnID0ge1xuICBmb3JDb21wb25lbnQoY29tcG9uZW50KSB7XG4gICAgaWYgKGNvbXBvbmVudC5wcm9wcy5jb25maWcpIHtcbiAgICAgIHJldHVybiBjb21wb25lbnQucHJvcHMuY29uZmlnO1xuICAgIH1cbiAgICByZXR1cm4gZGVmYXVsdENvbmZpZztcbiAgfSxcbiAgc2V0RGVmYXVsdENvbmZpZyhjb25maWcpIHtcbiAgICBkZWZhdWx0Q29uZmlnID0gY29uZmlnO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbmZpZztcblxuLy8gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4vL1xuLy8gICB2YXIgZGVsZWdhdGVUbyA9IHV0aWxzLmRlbGVnYXRvcihjb25maWcpO1xuLy9cbi8vICAgcmV0dXJuIHtcbi8vXG4vLyAgICAgLy8gTm9ybWFsaXplIGFuIGVsZW1lbnQgbmFtZS5cbi8vICAgICBlbGVtZW50TmFtZShuYW1lKSB7XG4vLyAgICAgICByZXR1cm4gdXRpbHMuZGFzaFRvUGFzY2FsKG5hbWUpO1xuLy8gICAgIH0sXG4vL1xuLy8gICAgIGNsYXNzKG5hbWUpIHtcbi8vICAgICAgIGlmICghbmFtZSkge1xuLy8gICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvbXBvbmVudCBjbGFzcyBuYW1lIG11c3QgYmUgc3BlY2lmaWVkIHRvIHJldHJpZXZlIGNvbXBvbmVudCBjbGFzcy4nKTtcbi8vICAgICAgIH1cbi8vICAgICAgIG5hbWUgPSBjb25maWcuZWxlbWVudE5hbWUobmFtZSk7XG4vLyAgICAgICBpZiAoQ29tcG9uZW50c1tuYW1lXSkge1xuLy8gICAgICAgICByZXR1cm4gQ29tcG9uZW50c1tuYW1lXTtcbi8vICAgICAgIH1cbi8vICAgICAgIHRocm93IG5ldyBFcnJvcihgQ29tcG9uZW50IGNsYXNzICR7bmFtZX0gbm90IGZvdW5kLmApO1xuLy8gICAgIH0sXG4vL1xuLy8gICAgIGhlbHBlckNsYXNzKG5hbWUpIHtcbi8vICAgICAgIGlmICghbmFtZSkge1xuLy8gICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0hlbHBlciBjbGFzcyBuYW1lIG11c3QgYmUgc3BlY2lmaWVkIHRvIHJldHJpZXZlIGNvbXBvbmVudCBjbGFzcy4nKTtcbi8vICAgICAgIH1cbi8vICAgICAgIG5hbWUgPSBjb25maWcuZWxlbWVudE5hbWUobmFtZSk7XG4vLyAgICAgICByZXR1cm4gY29uZmlnLmNsYXNzKG5hbWUpO1xuLy8gICAgIH0sXG4vL1xuLy8gICAgIGZpZWxkQ2xhc3MobmFtZSkge1xuLy8gICAgICAgaWYgKCFuYW1lKSB7XG4vLyAgICAgICAgIHRocm93IG5ldyBFcnJvcignRmllbGQgY2xhc3MgbmFtZSBtdXN0IGJlIHNwZWNpZmllZCB0byByZXRyaWV2ZSBjb21wb25lbnQgY2xhc3MuJyk7XG4vLyAgICAgICB9XG4vLyAgICAgICBuYW1lICs9ICctZmllbGQnO1xuLy8gICAgICAgbmFtZSA9IGNvbmZpZy5lbGVtZW50TmFtZShuYW1lKTtcbi8vICAgICAgIHJldHVybiBjb25maWcuY2xhc3MobmFtZSk7XG4vLyAgICAgfVxuXG4gICAgLy8gLy8gUmVuZGVyIHRoZSByb290IGZvcm1hdGljIGNvbXBvbmVudFxuICAgIC8vIHJlbmRlckZvcm1hdGljQ29tcG9uZW50OiBmdW5jdGlvbiAoY29tcG9uZW50KSB7XG4gICAgLy9cbiAgICAvLyAgIGNvbnN0IHByb3BzID0gY29tcG9uZW50LnByb3BzO1xuICAgIC8vXG4gICAgLy8gICAvL3ZhciBmaWVsZCA9IGNvbmZpZy5jcmVhdGVSb290RmllbGQocHJvcHMpO1xuICAgIC8vXG4gICAgLy8gICByZXR1cm4gKFxuICAgIC8vICAgICA8ZGl2IGNsYXNzTmFtZT1cImZvcm1hdGljXCI+XG4gICAgLy9cbiAgICAvLyAgICAgPC9kaXY+XG4gICAgLy8gICApO1xuICAgIC8vXG4gICAgLy8gICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogJ2Zvcm1hdGljJ30sXG4gICAgLy8gICAgIGNvbmZpZy5jcmVhdGVGaWVsZEVsZW1lbnQoe2ZpZWxkOiBmaWVsZCwgb25DaGFuZ2U6IGNvbXBvbmVudC5vbkNoYW5nZSwgb25BY3Rpb246IGNvbXBvbmVudC5vbkFjdGlvbn0pXG4gICAgLy8gICApO1xuICAgIC8vIH0sXG5cbiAgICAvLyAvLyBDcmVhdGUgYSBmaWVsZCBlbGVtZW50IGdpdmVuIHNvbWUgcHJvcHMuIFVzZSBjb250ZXh0IHRvIGRldGVybWluZSBuYW1lLlxuICAgIC8vIGNyZWF0ZUZpZWxkRWxlbWVudDogZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgLy9cbiAgICAvLyAgIHZhciBuYW1lID0gY29uZmlnLmZpZWxkVHlwZU5hbWUocHJvcHMuZmllbGQpO1xuICAgIC8vXG4gICAgLy8gICBpZiAoY29uZmlnLmhhc0VsZW1lbnRGYWN0b3J5KG5hbWUpKSB7XG4gICAgLy8gICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudChuYW1lLCBwcm9wcyk7XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnVW5rbm93bkZpZWxkJywgcHJvcHMpO1xuICAgIC8vIH0sXG5cbiAgICAvL1xuICAgIC8vIC8vIEZpZWxkIGVsZW1lbnQgZmFjdG9yaWVzLiBDcmVhdGUgZmllbGQgZWxlbWVudHMuXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X0ZpZWxkczogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL2ZpZWxkcycpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfU3RyaW5nOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvc3RyaW5nJykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9TaW5nbGVMaW5lU3RyaW5nOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvc2luZ2xlLWxpbmUtc3RyaW5nJykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9TZWxlY3Q6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9zZWxlY3QnKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X1ByZXR0eVNlbGVjdDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL3ByZXR0eS1zZWxlY3QnKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X0Jvb2xlYW46IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9ib29sZWFuJykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9QcmV0dHlCb29sZWFuOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvcHJldHR5LWJvb2xlYW4nKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X0NoZWNrYm94Qm9vbGVhbjogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL2NoZWNrYm94LWJvb2xlYW4nKSksXG4gICAgLy9cbiAgICAvLyAvLyBjcmVhdGVFbGVtZW50X1ByZXR0eVRleHQ6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9wcmV0dHktdGV4dCcpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfUHJldHR5VGV4dDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL3ByZXR0eS10ZXh0MicpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfQXJyYXk6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9hcnJheScpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfQ2hlY2tib3hBcnJheTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL2NoZWNrYm94LWFycmF5JykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9PYmplY3Q6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9vYmplY3QnKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X0pzb246IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9qc29uJykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9Vbmtub3duRmllbGQ6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy91bmtub3duJykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9Db3B5OiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvY29weScpKSxcbiAgICAvL1xuICAgIC8vXG4gICAgLy8gLy8gT3RoZXIgZWxlbWVudCBmYWN0b3JpZXMuIENyZWF0ZSBoZWxwZXIgZWxlbWVudHMgdXNlZCBieSBmaWVsZCBjb21wb25lbnRzLlxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9GaWVsZDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9maWVsZCcpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfTGFiZWw6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvbGFiZWwnKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X0hlbHA6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvaGVscCcpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfQ2hvaWNlczogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9jaG9pY2VzJykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9Mb2FkaW5nQ2hvaWNlczogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9sb2FkaW5nLWNob2ljZXMnKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X0FycmF5Q29udHJvbDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9hcnJheS1jb250cm9sJykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9BcnJheUl0ZW1Db250cm9sOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2FycmF5LWl0ZW0tY29udHJvbCcpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfQXJyYXlJdGVtVmFsdWU6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvYXJyYXktaXRlbS12YWx1ZScpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfQXJyYXlJdGVtOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2FycmF5LWl0ZW0nKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X0ZpZWxkVGVtcGxhdGVDaG9pY2VzOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2ZpZWxkLXRlbXBsYXRlLWNob2ljZXMnKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X0FkZEl0ZW06IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvYWRkLWl0ZW0nKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X1JlbW92ZUl0ZW06IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvcmVtb3ZlLWl0ZW0nKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X01vdmVJdGVtRm9yd2FyZDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9tb3ZlLWl0ZW0tZm9yd2FyZCcpKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZUVsZW1lbnRfTW92ZUl0ZW1CYWNrOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL21vdmUtaXRlbS1iYWNrJykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9PYmplY3RDb250cm9sOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL29iamVjdC1jb250cm9sJykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9PYmplY3RJdGVtQ29udHJvbDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9vYmplY3QtaXRlbS1jb250cm9sJykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9PYmplY3RJdGVtVmFsdWU6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWl0ZW0tdmFsdWUnKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X09iamVjdEl0ZW1LZXk6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWl0ZW0ta2V5JykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9PYmplY3RJdGVtOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL29iamVjdC1pdGVtJykpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRWxlbWVudF9TZWxlY3RWYWx1ZTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9zZWxlY3QtdmFsdWUnKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X1ByZXR0eVNlbGVjdFZhbHVlOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL3ByZXR0eS1zZWxlY3QtdmFsdWUnKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X1NhbXBsZTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9zYW1wbGUnKSksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVFbGVtZW50X0luc2VydEJ1dHRvbjogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9pbnNlcnQtYnV0dG9uJykpLFxuICAgIC8vXG4gICAgLy9cbiAgICAvLyAvLyBGaWVsZCBkZWZhdWx0IHZhbHVlIGZhY3Rvcmllcy4gR2l2ZSBhIGRlZmF1bHQgdmFsdWUgZm9yIGEgc3BlY2lmaWMgdHlwZS5cbiAgICAvL1xuICAgIC8vIGNyZWF0ZURlZmF1bHRWYWx1ZV9TdHJpbmc6IGZ1bmN0aW9uICgvKiBmaWVsZFRlbXBsYXRlICovKSB7XG4gICAgLy8gICByZXR1cm4gJyc7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZURlZmF1bHRWYWx1ZV9PYmplY3Q6IGZ1bmN0aW9uICgvKiBmaWVsZFRlbXBsYXRlICovKSB7XG4gICAgLy8gICByZXR1cm4ge307XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZURlZmF1bHRWYWx1ZV9BcnJheTogZnVuY3Rpb24gKC8qIGZpZWxkVGVtcGxhdGUgKi8pIHtcbiAgICAvLyAgIHJldHVybiBbXTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRGVmYXVsdFZhbHVlX0Jvb2xlYW46IGZ1bmN0aW9uICgvKiBmaWVsZFRlbXBsYXRlICovKSB7XG4gICAgLy8gICByZXR1cm4gZmFsc2U7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZURlZmF1bHRWYWx1ZV9GaWVsZHM6IGRlbGVnYXRlVG8oJ2NyZWF0ZURlZmF1bHRWYWx1ZV9PYmplY3QnKSxcbiAgICAvL1xuICAgIC8vIGNyZWF0ZURlZmF1bHRWYWx1ZV9TaW5nbGVMaW5lU3RyaW5nOiBkZWxlZ2F0ZVRvKCdjcmVhdGVEZWZhdWx0VmFsdWVfU3RyaW5nJyksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVEZWZhdWx0VmFsdWVfU2VsZWN0OiBkZWxlZ2F0ZVRvKCdjcmVhdGVEZWZhdWx0VmFsdWVfU3RyaW5nJyksXG4gICAgLy9cbiAgICAvLyBjcmVhdGVEZWZhdWx0VmFsdWVfSnNvbjogZGVsZWdhdGVUbygnY3JlYXRlRGVmYXVsdFZhbHVlX09iamVjdCcpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRGVmYXVsdFZhbHVlX0NoZWNrYm94QXJyYXk6IGRlbGVnYXRlVG8oJ2NyZWF0ZURlZmF1bHRWYWx1ZV9BcnJheScpLFxuICAgIC8vXG4gICAgLy8gY3JlYXRlRGVmYXVsdFZhbHVlX0NoZWNrYm94Qm9vbGVhbjogZGVsZWdhdGVUbygnY3JlYXRlRGVmYXVsdFZhbHVlX0Jvb2xlYW4nKSxcbiAgICAvL1xuICAgIC8vXG4gICAgLy8gLy8gRmllbGQgdmFsdWUgY29lcmNlcnMuIENvZXJjZSBhIHZhbHVlIGludG8gYSB2YWx1ZSBhcHByb3ByaWF0ZSBmb3IgYSBzcGVjaWZpYyB0eXBlLlxuICAgIC8vXG4gICAgLy8gY29lcmNlVmFsdWVfU3RyaW5nOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSwgdmFsdWUpIHtcbiAgICAvLyAgIGlmIChfLmlzU3RyaW5nKHZhbHVlKSkge1xuICAgIC8vICAgICByZXR1cm4gdmFsdWU7XG4gICAgLy8gICB9XG4gICAgLy8gICBpZiAoXy5pc1VuZGVmaW5lZCh2YWx1ZSkgfHwgdmFsdWUgPT09IG51bGwpIHtcbiAgICAvLyAgICAgcmV0dXJuICcnO1xuICAgIC8vICAgfVxuICAgIC8vICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gY29lcmNlVmFsdWVfT2JqZWN0OiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSwgdmFsdWUpIHtcbiAgICAvLyAgIGlmICghXy5pc09iamVjdCh2YWx1ZSkpIHtcbiAgICAvLyAgICAgcmV0dXJuIHt9O1xuICAgIC8vICAgfVxuICAgIC8vICAgcmV0dXJuIHZhbHVlO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyBjb2VyY2VWYWx1ZV9BcnJheTogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUsIHZhbHVlKSB7XG4gICAgLy8gICBpZiAoIV8uaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAvLyAgICAgcmV0dXJuIFt2YWx1ZV07XG4gICAgLy8gICB9XG4gICAgLy8gICByZXR1cm4gdmFsdWU7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIGNvZXJjZVZhbHVlX0Jvb2xlYW46IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlLCB2YWx1ZSkge1xuICAgIC8vICAgcmV0dXJuIGNvbmZpZy5jb2VyY2VWYWx1ZVRvQm9vbGVhbih2YWx1ZSk7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIGNvZXJjZVZhbHVlX0ZpZWxkczogZGVsZWdhdGVUbygnY29lcmNlVmFsdWVfT2JqZWN0JyksXG4gICAgLy9cbiAgICAvLyBjb2VyY2VWYWx1ZV9TaW5nbGVMaW5lU3RyaW5nOiBkZWxlZ2F0ZVRvKCdjb2VyY2VWYWx1ZV9TdHJpbmcnKSxcbiAgICAvL1xuICAgIC8vIGNvZXJjZVZhbHVlX1NlbGVjdDogZGVsZWdhdGVUbygnY29lcmNlVmFsdWVfU3RyaW5nJyksXG4gICAgLy9cbiAgICAvLyBjb2VyY2VWYWx1ZV9Kc29uOiBkZWxlZ2F0ZVRvKCdjb2VyY2VWYWx1ZV9PYmplY3QnKSxcbiAgICAvL1xuICAgIC8vIGNvZXJjZVZhbHVlX0NoZWNrYm94QXJyYXk6IGRlbGVnYXRlVG8oJ2NvZXJjZVZhbHVlX0FycmF5JyksXG4gICAgLy9cbiAgICAvLyBjb2VyY2VWYWx1ZV9DaGVja2JveEJvb2xlYW46IGRlbGVnYXRlVG8oJ2NvZXJjZVZhbHVlX0Jvb2xlYW4nKSxcbiAgICAvL1xuICAgIC8vXG4gICAgLy8gLy8gRmllbGQgY2hpbGQgZmllbGRzIGZhY3Rvcmllcywgc28gc29tZSB0eXBlcyBjYW4gaGF2ZSBkeW5hbWljIGNoaWxkcmVuLlxuICAgIC8vXG4gICAgLy8gY3JlYXRlQ2hpbGRGaWVsZHNfQXJyYXk6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIC8vXG4gICAgLy8gICByZXR1cm4gZmllbGQudmFsdWUubWFwKGZ1bmN0aW9uIChhcnJheUl0ZW0sIGkpIHtcbiAgICAvLyAgICAgdmFyIGNoaWxkRmllbGRUZW1wbGF0ZSA9IGNvbmZpZy5jaGlsZEZpZWxkVGVtcGxhdGVGb3JWYWx1ZShmaWVsZCwgYXJyYXlJdGVtKTtcbiAgICAvL1xuICAgIC8vICAgICB2YXIgY2hpbGRGaWVsZCA9IGNvbmZpZy5jcmVhdGVDaGlsZEZpZWxkKGZpZWxkLCB7XG4gICAgLy8gICAgICAgZmllbGRUZW1wbGF0ZTogY2hpbGRGaWVsZFRlbXBsYXRlLCBrZXk6IGksIGZpZWxkSW5kZXg6IGksIHZhbHVlOiBhcnJheUl0ZW1cbiAgICAvLyAgICAgfSk7XG4gICAgLy9cbiAgICAvLyAgICAgcmV0dXJuIGNoaWxkRmllbGQ7XG4gICAgLy8gICB9KTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gY3JlYXRlQ2hpbGRGaWVsZHNfT2JqZWN0OiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAvL1xuICAgIC8vICAgcmV0dXJuIE9iamVjdC5rZXlzKGZpZWxkLnZhbHVlKS5tYXAoZnVuY3Rpb24gKGtleSwgaSkge1xuICAgIC8vICAgICB2YXIgY2hpbGRGaWVsZFRlbXBsYXRlID0gY29uZmlnLmNoaWxkRmllbGRUZW1wbGF0ZUZvclZhbHVlKGZpZWxkLCBmaWVsZC52YWx1ZVtrZXldKTtcbiAgICAvL1xuICAgIC8vICAgICB2YXIgY2hpbGRGaWVsZCA9IGNvbmZpZy5jcmVhdGVDaGlsZEZpZWxkKGZpZWxkLCB7XG4gICAgLy8gICAgICAgZmllbGRUZW1wbGF0ZTogY2hpbGRGaWVsZFRlbXBsYXRlLCBrZXk6IGtleSwgZmllbGRJbmRleDogaSwgdmFsdWU6IGZpZWxkLnZhbHVlW2tleV1cbiAgICAvLyAgICAgfSk7XG4gICAgLy9cbiAgICAvLyAgICAgcmV0dXJuIGNoaWxkRmllbGQ7XG4gICAgLy8gICB9KTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gQ2hlY2sgaWYgdGhlcmUgaXMgYSBmYWN0b3J5IGZvciB0aGUgbmFtZS5cbiAgICAvLyBoYXNFbGVtZW50RmFjdG9yeTogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAvL1xuICAgIC8vICAgcmV0dXJuIGNvbmZpZ1snY3JlYXRlRWxlbWVudF8nICsgbmFtZV0gPyB0cnVlIDogZmFsc2U7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIENyZWF0ZSBhbiBlbGVtZW50IGdpdmVuIGEgbmFtZSwgcHJvcHMsIGFuZCBjaGlsZHJlbi5cbiAgICAvLyBjcmVhdGVFbGVtZW50OiBmdW5jdGlvbiAobmFtZSwgcHJvcHMsIGNoaWxkcmVuKSB7XG4gICAgLy9cbiAgICAvLyAgIGlmICghcHJvcHMuY29uZmlnKSB7XG4gICAgLy8gICAgIHByb3BzID0gXy5leHRlbmQoe30sIHByb3BzLCB7Y29uZmlnOiBjb25maWd9KTtcbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgbmFtZSA9IGNvbmZpZy5lbGVtZW50TmFtZShuYW1lKTtcbiAgICAvL1xuICAgIC8vICAgaWYgKGNvbmZpZ1snY3JlYXRlRWxlbWVudF8nICsgbmFtZV0pIHtcbiAgICAvLyAgICAgcmV0dXJuIGNvbmZpZ1snY3JlYXRlRWxlbWVudF8nICsgbmFtZV0ocHJvcHMsIGNoaWxkcmVuKTtcbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgaWYgKG5hbWUgIT09ICdVbmtub3duJykge1xuICAgIC8vICAgICBpZiAoY29uZmlnLmhhc0VsZW1lbnRGYWN0b3J5KCdVbmtub3duJykpIHtcbiAgICAvLyAgICAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ1Vua25vd24nLCBwcm9wcywgY2hpbGRyZW4pO1xuICAgIC8vICAgICB9XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIHRocm93IG5ldyBFcnJvcignRmFjdG9yeSBub3QgZm91bmQgZm9yOiAnICsgbmFtZSk7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIENyZWF0ZSBhIGZpZWxkIGVsZW1lbnQgZ2l2ZW4gc29tZSBwcm9wcy4gVXNlIGNvbnRleHQgdG8gZGV0ZXJtaW5lIG5hbWUuXG4gICAgLy8gY3JlYXRlRmllbGRFbGVtZW50OiBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAvL1xuICAgIC8vICAgdmFyIG5hbWUgPSBjb25maWcuZmllbGRUeXBlTmFtZShwcm9wcy5maWVsZCk7XG4gICAgLy9cbiAgICAvLyAgIGlmIChjb25maWcuaGFzRWxlbWVudEZhY3RvcnkobmFtZSkpIHtcbiAgICAvLyAgICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KG5hbWUsIHByb3BzKTtcbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdVbmtub3duRmllbGQnLCBwcm9wcyk7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIFJlbmRlciB0aGUgcm9vdCBmb3JtYXRpYyBjb21wb25lbnRcbiAgICAvLyByZW5kZXJGb3JtYXRpY0NvbXBvbmVudDogZnVuY3Rpb24gKGNvbXBvbmVudCkge1xuICAgIC8vXG4gICAgLy8gICB2YXIgcHJvcHMgPSBjb21wb25lbnQucHJvcHM7XG4gICAgLy9cbiAgICAvLyAgIHZhciBmaWVsZCA9IGNvbmZpZy5jcmVhdGVSb290RmllbGQocHJvcHMpO1xuICAgIC8vXG4gICAgLy8gICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogJ2Zvcm1hdGljJ30sXG4gICAgLy8gICAgIGNvbmZpZy5jcmVhdGVGaWVsZEVsZW1lbnQoe2ZpZWxkOiBmaWVsZCwgb25DaGFuZ2U6IGNvbXBvbmVudC5vbkNoYW5nZSwgb25BY3Rpb246IGNvbXBvbmVudC5vbkFjdGlvbn0pXG4gICAgLy8gICApO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBSZW5kZXIgYW55IGNvbXBvbmVudC5cbiAgICAvLyByZW5kZXJDb21wb25lbnQ6IGZ1bmN0aW9uIChjb21wb25lbnQpIHtcbiAgICAvL1xuICAgIC8vICAgdmFyIG5hbWUgPSBjb21wb25lbnQuY29uc3RydWN0b3IuZGlzcGxheU5hbWU7XG4gICAgLy9cbiAgICAvLyAgIGlmIChjb25maWdbJ3JlbmRlckNvbXBvbmVudF8nICsgbmFtZV0pIHtcbiAgICAvLyAgICAgcmV0dXJuIGNvbmZpZ1sncmVuZGVyQ29tcG9uZW50XycgKyBuYW1lXShjb21wb25lbnQpO1xuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICByZXR1cm4gY29tcG9uZW50LnJlbmRlckRlZmF1bHQoKTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gUmVuZGVyIGZpZWxkIGNvbXBvbmVudHMuXG4gICAgLy8gcmVuZGVyRmllbGRDb21wb25lbnQ6IGZ1bmN0aW9uIChjb21wb25lbnQpIHtcbiAgICAvL1xuICAgIC8vICAgcmV0dXJuIGNvbmZpZy5yZW5kZXJDb21wb25lbnQoY29tcG9uZW50KTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gTm9ybWFsaXplIGFuIGVsZW1lbnQgbmFtZS5cbiAgICAvLyBlbGVtZW50TmFtZTogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAvLyAgIHJldHVybiB1dGlscy5kYXNoVG9QYXNjYWwobmFtZSk7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIFR5cGUgYWxpYXNlcy5cbiAgICAvL1xuICAgIC8vIGFsaWFzX0RpY3Q6ICdPYmplY3QnLFxuICAgIC8vXG4gICAgLy8gYWxpYXNfQm9vbDogJ0Jvb2xlYW4nLFxuICAgIC8vXG4gICAgLy8gYWxpYXNfUHJldHR5VGV4dGFyZWE6ICdQcmV0dHlUZXh0JyxcbiAgICAvL1xuICAgIC8vIGFsaWFzX1NpbmdsZUxpbmVTdHJpbmc6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgLy8gICBpZiAoZmllbGRUZW1wbGF0ZS5yZXBsYWNlQ2hvaWNlcykge1xuICAgIC8vICAgICByZXR1cm4gJ1ByZXR0eVRleHQnO1xuICAgIC8vICAgfSBlbHNlIGlmIChmaWVsZFRlbXBsYXRlLmNob2ljZXMpIHtcbiAgICAvLyAgICAgcmV0dXJuICdTZWxlY3QnO1xuICAgIC8vICAgfVxuICAgIC8vICAgcmV0dXJuICdTaW5nbGVMaW5lU3RyaW5nJztcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gYWxpYXNfU3RyaW5nOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSkge1xuICAgIC8vXG4gICAgLy8gICBpZiAoZmllbGRUZW1wbGF0ZS5yZXBsYWNlQ2hvaWNlcykge1xuICAgIC8vICAgICByZXR1cm4gJ1ByZXR0eVRleHQnO1xuICAgIC8vICAgfSBlbHNlIGlmIChmaWVsZFRlbXBsYXRlLmNob2ljZXMpIHtcbiAgICAvLyAgICAgcmV0dXJuICdTZWxlY3QnO1xuICAgIC8vICAgfSBlbHNlIGlmIChjb25maWcuZmllbGRUZW1wbGF0ZUlzU2luZ2xlTGluZShmaWVsZFRlbXBsYXRlKSkge1xuICAgIC8vICAgICByZXR1cm4gJ1NpbmdsZUxpbmVTdHJpbmcnO1xuICAgIC8vICAgfVxuICAgIC8vICAgcmV0dXJuICdTdHJpbmcnO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyBhbGlhc19UZXh0OiBkZWxlZ2F0ZVRvKCdhbGlhc19TdHJpbmcnKSxcbiAgICAvL1xuICAgIC8vIGFsaWFzX1VuaWNvZGU6IGRlbGVnYXRlVG8oJ2FsaWFzX1NpbmdsZUxpbmVTdHJpbmcnKSxcbiAgICAvL1xuICAgIC8vIGFsaWFzX1N0cjogZGVsZWdhdGVUbygnYWxpYXNfU2luZ2xlTGluZVN0cmluZycpLFxuICAgIC8vXG4gICAgLy8gYWxpYXNfTGlzdDogJ0FycmF5JyxcbiAgICAvL1xuICAgIC8vIGFsaWFzX0NoZWNrYm94TGlzdDogJ0NoZWNrYm94QXJyYXknLFxuICAgIC8vXG4gICAgLy8gYWxpYXNfRmllbGRzZXQ6ICdGaWVsZHMnLFxuICAgIC8vXG4gICAgLy8gYWxpYXNfQ2hlY2tib3g6ICdDaGVja2JveEJvb2xlYW4nLFxuICAgIC8vXG4gICAgLy8gLy8gRmllbGQgZmFjdG9yeVxuICAgIC8vXG4gICAgLy8gLy8gR2l2ZW4gYSBmaWVsZCwgZXhwYW5kIGFsbCBjaGlsZCBmaWVsZHMgcmVjdXJzaXZlbHkgdG8gZ2V0IHRoZSBkZWZhdWx0XG4gICAgLy8gLy8gdmFsdWVzIG9mIGFsbCBmaWVsZHMuXG4gICAgLy8gaW5mbGF0ZUZpZWxkVmFsdWU6IGZ1bmN0aW9uIChmaWVsZCwgZmllbGRIYW5kbGVyKSB7XG4gICAgLy9cbiAgICAvLyAgIGlmIChmaWVsZEhhbmRsZXIpIHtcbiAgICAvLyAgICAgdmFyIHN0b3AgPSBmaWVsZEhhbmRsZXIoZmllbGQpO1xuICAgIC8vICAgICBpZiAoc3RvcCA9PT0gZmFsc2UpIHtcbiAgICAvLyAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIC8vICAgICB9XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIGlmIChjb25maWcuZmllbGRIYXNWYWx1ZUNoaWxkcmVuKGZpZWxkKSkge1xuICAgIC8vICAgICB2YXIgdmFsdWUgPSBfLmNsb25lKGZpZWxkLnZhbHVlKTtcbiAgICAvLyAgICAgdmFyIGNoaWxkRmllbGRzID0gY29uZmlnLmNyZWF0ZUNoaWxkRmllbGRzKGZpZWxkKTtcbiAgICAvLyAgICAgY2hpbGRGaWVsZHMuZm9yRWFjaChmdW5jdGlvbiAoY2hpbGRGaWVsZCkge1xuICAgIC8vICAgICAgIGlmIChjb25maWcuaXNLZXkoY2hpbGRGaWVsZC5rZXkpKSB7XG4gICAgLy8gICAgICAgICB2YWx1ZVtjaGlsZEZpZWxkLmtleV0gPSBjb25maWcuaW5mbGF0ZUZpZWxkVmFsdWUoY2hpbGRGaWVsZCwgZmllbGRIYW5kbGVyKTtcbiAgICAvLyAgICAgICB9XG4gICAgLy8gICAgIH0pO1xuICAgIC8vICAgICByZXR1cm4gdmFsdWU7XG4gICAgLy8gICB9IGVsc2Uge1xuICAgIC8vICAgICByZXR1cm4gZmllbGQudmFsdWU7XG4gICAgLy8gICB9XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIEluaXRpYWxpemUgdGhlIHJvb3QgZmllbGQuXG4gICAgLy8gaW5pdFJvb3RGaWVsZDogZnVuY3Rpb24gKC8qIGZpZWxkLCBwcm9wcyAqLykge1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBJbml0aWFsaXplIGV2ZXJ5IGZpZWxkLlxuICAgIC8vIGluaXRGaWVsZDogZnVuY3Rpb24gKC8qIGZpZWxkICovKSB7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIElmIGFuIGFycmF5IG9mIGZpZWxkIHRlbXBsYXRlcyBhcmUgcGFzc2VkIGluLCB0aGlzIG1ldGhvZCBpcyB1c2VkIHRvXG4gICAgLy8gLy8gd3JhcCB0aGUgZmllbGRzIGluc2lkZSBhIHNpbmdsZSByb290IGZpZWxkIHRlbXBsYXRlLlxuICAgIC8vIHdyYXBGaWVsZFRlbXBsYXRlczogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGVzKSB7XG4gICAgLy8gICByZXR1cm4ge1xuICAgIC8vICAgICB0eXBlOiAnZmllbGRzJyxcbiAgICAvLyAgICAgcGxhaW46IHRydWUsXG4gICAgLy8gICAgIGZpZWxkczogZmllbGRUZW1wbGF0ZXNcbiAgICAvLyAgIH07XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIEdpdmVuIHRoZSBwcm9wcyB0aGF0IGFyZSBwYXNzZWQgaW4sIGNyZWF0ZSB0aGUgcm9vdCBmaWVsZC5cbiAgICAvLyBjcmVhdGVSb290RmllbGQ6IGZ1bmN0aW9uIChwcm9wcykge1xuICAgIC8vXG4gICAgLy8gICB2YXIgZmllbGRUZW1wbGF0ZSA9IHByb3BzLmZpZWxkVGVtcGxhdGUgfHwgcHJvcHMuZmllbGRUZW1wbGF0ZXMgfHwgcHJvcHMuZmllbGQgfHwgcHJvcHMuZmllbGRzO1xuICAgIC8vICAgdmFyIHZhbHVlID0gcHJvcHMudmFsdWU7XG4gICAgLy9cbiAgICAvLyAgIGlmICghZmllbGRUZW1wbGF0ZSkge1xuICAgIC8vICAgICBmaWVsZFRlbXBsYXRlID0gY29uZmlnLmNyZWF0ZUZpZWxkVGVtcGxhdGVGcm9tVmFsdWUodmFsdWUpO1xuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICBpZiAoXy5pc0FycmF5KGZpZWxkVGVtcGxhdGUpKSB7XG4gICAgLy8gICAgIGZpZWxkVGVtcGxhdGUgPSBjb25maWcud3JhcEZpZWxkVGVtcGxhdGVzKGZpZWxkVGVtcGxhdGUpO1xuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICB2YXIgZmllbGQgPSBfLmV4dGVuZCh7fSwgZmllbGRUZW1wbGF0ZSwge3Jhd0ZpZWxkVGVtcGxhdGU6IGZpZWxkVGVtcGxhdGV9KTtcbiAgICAvLyAgIGlmIChjb25maWcuaGFzVmFsdWUoZmllbGRUZW1wbGF0ZSwgdmFsdWUpKSB7XG4gICAgLy8gICAgIGZpZWxkLnZhbHVlID0gY29uZmlnLmNvZXJjZVZhbHVlKGZpZWxkVGVtcGxhdGUsIHZhbHVlKTtcbiAgICAvLyAgIH0gZWxzZSB7XG4gICAgLy8gICAgIGZpZWxkLnZhbHVlID0gY29uZmlnLmNyZWF0ZURlZmF1bHRWYWx1ZShmaWVsZFRlbXBsYXRlKTtcbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgY29uZmlnLmluaXRSb290RmllbGQoZmllbGQsIHByb3BzKTtcbiAgICAvLyAgIGNvbmZpZy5pbml0RmllbGQoZmllbGQpO1xuICAgIC8vXG4gICAgLy8gICBpZiAodmFsdWUgPT09IG51bGwgfHwgY29uZmlnLmlzRW1wdHlPYmplY3QodmFsdWUpIHx8IF8uaXNVbmRlZmluZWQodmFsdWUpKSB7XG4gICAgLy8gICAgIGZpZWxkLnZhbHVlID0gY29uZmlnLmluZmxhdGVGaWVsZFZhbHVlKGZpZWxkKTtcbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgcmV0dXJuIGZpZWxkO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBHaXZlbiB0aGUgcHJvcHMgdGhhdCBhcmUgcGFzc2VkIGluLCBjcmVhdGUgdGhlIHZhbHVlIHRoYXQgd2lsbCBiZSBkaXNwbGF5ZWRcbiAgICAvLyAvLyBieSBhbGwgdGhlIGNvbXBvbmVudHMuXG4gICAgLy8gY3JlYXRlUm9vdFZhbHVlOiBmdW5jdGlvbiAocHJvcHMsIGZpZWxkSGFuZGxlcikge1xuICAgIC8vXG4gICAgLy8gICB2YXIgZmllbGQgPSBjb25maWcuY3JlYXRlUm9vdEZpZWxkKHByb3BzKTtcbiAgICAvL1xuICAgIC8vICAgcmV0dXJuIGNvbmZpZy5pbmZsYXRlRmllbGRWYWx1ZShmaWVsZCwgZmllbGRIYW5kbGVyKTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gdmFsaWRhdGVSb290VmFsdWU6IGZ1bmN0aW9uIChwcm9wcykge1xuICAgIC8vXG4gICAgLy8gICB2YXIgZXJyb3JzID0gW107XG4gICAgLy9cbiAgICAvLyAgIGNvbmZpZy5jcmVhdGVSb290VmFsdWUocHJvcHMsIGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIC8vICAgICB2YXIgZmllbGRFcnJvcnMgPSBjb25maWcuZmllbGRFcnJvcnMoZmllbGQpO1xuICAgIC8vICAgICBpZiAoZmllbGRFcnJvcnMubGVuZ3RoID4gMCkge1xuICAgIC8vICAgICAgIGVycm9ycy5wdXNoKHtcbiAgICAvLyAgICAgICAgIHBhdGg6IGNvbmZpZy5maWVsZFZhbHVlUGF0aChmaWVsZCksXG4gICAgLy8gICAgICAgICBlcnJvcnM6IGZpZWxkRXJyb3JzXG4gICAgLy8gICAgICAgfSk7XG4gICAgLy8gICAgIH1cbiAgICAvLyAgIH0pO1xuICAgIC8vXG4gICAgLy8gICByZXR1cm4gZXJyb3JzO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyBpc1ZhbGlkUm9vdFZhbHVlOiBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAvL1xuICAgIC8vICAgdmFyIGlzVmFsaWQgPSB0cnVlO1xuICAgIC8vXG4gICAgLy8gICBjb25maWcuY3JlYXRlUm9vdFZhbHVlKHByb3BzLCBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAvLyAgICAgaWYgKGNvbmZpZy5maWVsZEVycm9ycyhmaWVsZCkubGVuZ3RoID4gMCkge1xuICAgIC8vICAgICAgIGlzVmFsaWQgPSBmYWxzZTtcbiAgICAvLyAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgLy8gICAgIH1cbiAgICAvLyAgIH0pO1xuICAgIC8vXG4gICAgLy8gICByZXR1cm4gaXNWYWxpZDtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gdmFsaWRhdGVGaWVsZDogZnVuY3Rpb24gKGZpZWxkLCBlcnJvcnMpIHtcbiAgICAvL1xuICAgIC8vICAgaWYgKGZpZWxkLnZhbHVlID09PSB1bmRlZmluZWQgfHwgZmllbGQudmFsdWUgPT09ICcnKSB7XG4gICAgLy8gICAgIGlmIChjb25maWcuZmllbGRJc1JlcXVpcmVkKGZpZWxkKSkge1xuICAgIC8vICAgICAgIGVycm9ycy5wdXNoKHtcbiAgICAvLyAgICAgICAgIHR5cGU6ICdyZXF1aXJlZCdcbiAgICAvLyAgICAgICB9KTtcbiAgICAvLyAgICAgfVxuICAgIC8vICAgfVxuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBDcmVhdGUgZHluYW1pYyBjaGlsZCBmaWVsZHMgZm9yIGEgZmllbGQuXG4gICAgLy8gY3JlYXRlQ2hpbGRGaWVsZHM6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIC8vXG4gICAgLy8gICB2YXIgdHlwZU5hbWUgPSBjb25maWcuZmllbGRUeXBlTmFtZShmaWVsZCk7XG4gICAgLy9cbiAgICAvLyAgIGlmIChjb25maWdbJ2NyZWF0ZUNoaWxkRmllbGRzXycgKyB0eXBlTmFtZV0pIHtcbiAgICAvLyAgICAgcmV0dXJuIGNvbmZpZ1snY3JlYXRlQ2hpbGRGaWVsZHNfJyArIHR5cGVOYW1lXShmaWVsZCk7XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiBjb25maWcuZmllbGRDaGlsZEZpZWxkVGVtcGxhdGVzKGZpZWxkKS5tYXAoZnVuY3Rpb24gKGNoaWxkRmllbGQsIGkpIHtcbiAgICAvLyAgICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVDaGlsZEZpZWxkKGZpZWxkLCB7XG4gICAgLy8gICAgICAgZmllbGRUZW1wbGF0ZTogY2hpbGRGaWVsZCwga2V5OiBjaGlsZEZpZWxkLmtleSwgZmllbGRJbmRleDogaSwgdmFsdWU6IGZpZWxkLnZhbHVlW2NoaWxkRmllbGQua2V5XVxuICAgIC8vICAgICB9KTtcbiAgICAvLyAgIH0pO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBDcmVhdGUgYSBzaW5nbGUgY2hpbGQgZmllbGQgZm9yIGEgcGFyZW50IGZpZWxkLlxuICAgIC8vIGNyZWF0ZUNoaWxkRmllbGQ6IGZ1bmN0aW9uIChwYXJlbnRGaWVsZCwgb3B0aW9ucykge1xuICAgIC8vXG4gICAgLy8gICB2YXIgY2hpbGRWYWx1ZSA9IG9wdGlvbnMudmFsdWU7XG4gICAgLy9cbiAgICAvLyAgIHZhciBjaGlsZEZpZWxkID0gXy5leHRlbmQoe30sIG9wdGlvbnMuZmllbGRUZW1wbGF0ZSwge1xuICAgIC8vICAgICBrZXk6IG9wdGlvbnMua2V5LCBwYXJlbnQ6IHBhcmVudEZpZWxkLCBmaWVsZEluZGV4OiBvcHRpb25zLmZpZWxkSW5kZXgsXG4gICAgLy8gICAgIHJhd0ZpZWxkVGVtcGxhdGU6IG9wdGlvbnMuZmllbGRUZW1wbGF0ZVxuICAgIC8vICAgfSk7XG4gICAgLy9cbiAgICAvLyAgIGlmIChjb25maWcuaGFzVmFsdWUob3B0aW9ucy5maWVsZFRlbXBsYXRlLCBjaGlsZFZhbHVlKSkge1xuICAgIC8vICAgICBjaGlsZEZpZWxkLnZhbHVlID0gY29uZmlnLmNvZXJjZVZhbHVlKG9wdGlvbnMuZmllbGRUZW1wbGF0ZSwgY2hpbGRWYWx1ZSk7XG4gICAgLy8gICB9IGVsc2Uge1xuICAgIC8vICAgICBjaGlsZEZpZWxkLnZhbHVlID0gY29uZmlnLmNyZWF0ZURlZmF1bHRWYWx1ZShvcHRpb25zLmZpZWxkVGVtcGxhdGUpO1xuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICBjb25maWcuaW5pdEZpZWxkKGNoaWxkRmllbGQpO1xuICAgIC8vXG4gICAgLy8gICByZXR1cm4gY2hpbGRGaWVsZDtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gQ3JlYXRlIGEgdGVtcG9yYXJ5IGZpZWxkIGFuZCBleHRyYWN0IGl0cyB2YWx1ZS5cbiAgICAvLyBjcmVhdGVOZXdDaGlsZEZpZWxkVmFsdWU6IGZ1bmN0aW9uIChwYXJlbnRGaWVsZCwgaXRlbUZpZWxkSW5kZXgpIHtcbiAgICAvL1xuICAgIC8vICAgdmFyIGNoaWxkRmllbGRUZW1wbGF0ZSA9IGNvbmZpZy5maWVsZEl0ZW1GaWVsZFRlbXBsYXRlcyhwYXJlbnRGaWVsZClbaXRlbUZpZWxkSW5kZXhdO1xuICAgIC8vXG4gICAgLy8gICB2YXIgbmV3VmFsdWUgPSBjb25maWcuZmllbGRUZW1wbGF0ZVZhbHVlKGNoaWxkRmllbGRUZW1wbGF0ZSk7XG4gICAgLy9cbiAgICAvLyAgIC8vIEp1c3QgYSBwbGFjZWhvbGRlciBrZXkuIFNob3VsZCBub3QgYmUgaW1wb3J0YW50LlxuICAgIC8vICAgdmFyIGtleSA9ICdfX3Vua25vd25fa2V5X18nO1xuICAgIC8vXG4gICAgLy8gICBpZiAoXy5pc0FycmF5KHBhcmVudEZpZWxkLnZhbHVlKSkge1xuICAgIC8vICAgICAvLyBKdXN0IGEgcGxhY2Vob2xkZXIgcG9zaXRpb24gZm9yIGFuIGFycmF5LlxuICAgIC8vICAgICBrZXkgPSBwYXJlbnRGaWVsZC52YWx1ZS5sZW5ndGg7XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIC8vIEp1c3QgYSBwbGFjZWhvbGRlciBmaWVsZCBpbmRleC4gU2hvdWxkIG5vdCBiZSBpbXBvcnRhbnQuXG4gICAgLy8gICB2YXIgZmllbGRJbmRleCA9IDA7XG4gICAgLy8gICBpZiAoXy5pc09iamVjdChwYXJlbnRGaWVsZC52YWx1ZSkpIHtcbiAgICAvLyAgICAgZmllbGRJbmRleCA9IE9iamVjdC5rZXlzKHBhcmVudEZpZWxkLnZhbHVlKS5sZW5ndGg7XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIHZhciBjaGlsZEZpZWxkID0gY29uZmlnLmNyZWF0ZUNoaWxkRmllbGQocGFyZW50RmllbGQsIHtcbiAgICAvLyAgICAgZmllbGRUZW1wbGF0ZTogY2hpbGRGaWVsZFRlbXBsYXRlLCBrZXk6IGtleSwgZmllbGRJbmRleDogZmllbGRJbmRleCwgdmFsdWU6IG5ld1ZhbHVlXG4gICAgLy8gICB9KTtcbiAgICAvL1xuICAgIC8vICAgbmV3VmFsdWUgPSBjb25maWcuaW5mbGF0ZUZpZWxkVmFsdWUoY2hpbGRGaWVsZCk7XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiBuZXdWYWx1ZTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gR2l2ZW4gYSB2YWx1ZSwgY3JlYXRlIGEgZmllbGQgdGVtcGxhdGUgZm9yIHRoYXQgdmFsdWUuXG4gICAgLy8gY3JlYXRlRmllbGRUZW1wbGF0ZUZyb21WYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgLy9cbiAgICAvLyAgIHZhciBmaWVsZCA9IHtcbiAgICAvLyAgICAgdHlwZTogJ2pzb24nXG4gICAgLy8gICB9O1xuICAgIC8vICAgaWYgKF8uaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgLy8gICAgIGZpZWxkID0ge1xuICAgIC8vICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgLy8gICAgIH07XG4gICAgLy8gICB9IGVsc2UgaWYgKF8uaXNOdW1iZXIodmFsdWUpKSB7XG4gICAgLy8gICAgIGZpZWxkID0ge1xuICAgIC8vICAgICAgIHR5cGU6ICdudW1iZXInXG4gICAgLy8gICAgIH07XG4gICAgLy8gICB9IGVsc2UgaWYgKF8uaXNCb29sZWFuKHZhbHVlKSkge1xuICAgIC8vICAgICBmaWVsZCA9IHtcbiAgICAvLyAgICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAvLyAgICAgfTtcbiAgICAvLyAgIH0gZWxzZSBpZiAoXy5pc0FycmF5KHZhbHVlKSkge1xuICAgIC8vICAgICB2YXIgYXJyYXlJdGVtRmllbGRzID0gdmFsdWUubWFwKGZ1bmN0aW9uIChjaGlsZFZhbHVlLCBpKSB7XG4gICAgLy8gICAgICAgdmFyIGNoaWxkRmllbGQgPSBjb25maWcuY3JlYXRlRmllbGRUZW1wbGF0ZUZyb21WYWx1ZShjaGlsZFZhbHVlKTtcbiAgICAvLyAgICAgICBjaGlsZEZpZWxkLmtleSA9IGk7XG4gICAgLy8gICAgICAgcmV0dXJuIGNoaWxkRmllbGQ7XG4gICAgLy8gICAgIH0pO1xuICAgIC8vICAgICBmaWVsZCA9IHtcbiAgICAvLyAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgIC8vICAgICAgIGZpZWxkczogYXJyYXlJdGVtRmllbGRzXG4gICAgLy8gICAgIH07XG4gICAgLy8gICB9IGVsc2UgaWYgKF8uaXNPYmplY3QodmFsdWUpKSB7XG4gICAgLy8gICAgIHZhciBvYmplY3RJdGVtRmllbGRzID0gT2JqZWN0LmtleXModmFsdWUpLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgLy8gICAgICAgdmFyIGNoaWxkRmllbGQgPSBjb25maWcuY3JlYXRlRmllbGRUZW1wbGF0ZUZyb21WYWx1ZSh2YWx1ZVtrZXldKTtcbiAgICAvLyAgICAgICBjaGlsZEZpZWxkLmtleSA9IGtleTtcbiAgICAvLyAgICAgICBjaGlsZEZpZWxkLmxhYmVsID0gY29uZmlnLmh1bWFuaXplKGtleSk7XG4gICAgLy8gICAgICAgcmV0dXJuIGNoaWxkRmllbGQ7XG4gICAgLy8gICAgIH0pO1xuICAgIC8vICAgICBmaWVsZCA9IHtcbiAgICAvLyAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAvLyAgICAgICBmaWVsZHM6IG9iamVjdEl0ZW1GaWVsZHNcbiAgICAvLyAgICAgfTtcbiAgICAvLyAgIH0gZWxzZSBpZiAoXy5pc051bGwodmFsdWUpKSB7XG4gICAgLy8gICAgIGZpZWxkID0ge1xuICAgIC8vICAgICAgIHR5cGU6ICdqc29uJ1xuICAgIC8vICAgICB9O1xuICAgIC8vICAgfVxuICAgIC8vICAgcmV0dXJuIGZpZWxkO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBEZWZhdWx0IHZhbHVlIGZhY3RvcnlcbiAgICAvL1xuICAgIC8vIGNyZWF0ZURlZmF1bHRWYWx1ZTogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcbiAgICAvL1xuICAgIC8vICAgdmFyIGRlZmF1bHRWYWx1ZSA9IGNvbmZpZy5maWVsZFRlbXBsYXRlRGVmYXVsdFZhbHVlKGZpZWxkVGVtcGxhdGUpO1xuICAgIC8vXG4gICAgLy8gICBpZiAoIV8uaXNVbmRlZmluZWQoZGVmYXVsdFZhbHVlKSkge1xuICAgIC8vICAgICByZXR1cm4gdXRpbHMuZGVlcENvcHkoZGVmYXVsdFZhbHVlKTtcbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgdmFyIHR5cGVOYW1lID0gY29uZmlnLmZpZWxkVHlwZU5hbWUoZmllbGRUZW1wbGF0ZSk7XG4gICAgLy9cbiAgICAvLyAgIGlmIChjb25maWdbJ2NyZWF0ZURlZmF1bHRWYWx1ZV8nICsgdHlwZU5hbWVdKSB7XG4gICAgLy8gICAgIHJldHVybiBjb25maWdbJ2NyZWF0ZURlZmF1bHRWYWx1ZV8nICsgdHlwZU5hbWVdKGZpZWxkVGVtcGxhdGUpO1xuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICByZXR1cm4gJyc7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIEZpZWxkIGhlbHBlcnNcbiAgICAvL1xuICAgIC8vIC8vIERldGVybWluZSBpZiBhIHZhbHVlIFwiZXhpc3RzXCIuXG4gICAgLy8gaGFzVmFsdWU6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlLCB2YWx1ZSkge1xuICAgIC8vICAgcmV0dXJuIHZhbHVlICE9PSBudWxsICYmICFfLmlzVW5kZWZpbmVkKHZhbHVlKTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gQ29lcmNlIGEgdmFsdWUgdG8gdmFsdWUgYXBwcm9wcmlhdGUgZm9yIGEgZmllbGQuXG4gICAgLy8gY29lcmNlVmFsdWU6IGZ1bmN0aW9uIChmaWVsZCwgdmFsdWUpIHtcbiAgICAvL1xuICAgIC8vICAgdmFyIHR5cGVOYW1lID0gY29uZmlnLmZpZWxkVHlwZU5hbWUoZmllbGQpO1xuICAgIC8vXG4gICAgLy8gICBpZiAoY29uZmlnWydjb2VyY2VWYWx1ZV8nICsgdHlwZU5hbWVdKSB7XG4gICAgLy8gICAgIHJldHVybiBjb25maWdbJ2NvZXJjZVZhbHVlXycgKyB0eXBlTmFtZV0oZmllbGQsIHZhbHVlKTtcbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgcmV0dXJuIHZhbHVlO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBHaXZlbiBhIGZpZWxkIGFuZCBhIGNoaWxkIHZhbHVlLCBmaW5kIHRoZSBhcHByb3ByaWF0ZSBmaWVsZCB0ZW1wbGF0ZSBmb3JcbiAgICAvLyAvLyB0aGF0IGNoaWxkIHZhbHVlLlxuICAgIC8vIGNoaWxkRmllbGRUZW1wbGF0ZUZvclZhbHVlOiBmdW5jdGlvbiAoZmllbGQsIGNoaWxkVmFsdWUpIHtcbiAgICAvL1xuICAgIC8vICAgdmFyIGZpZWxkVGVtcGxhdGU7XG4gICAgLy9cbiAgICAvLyAgIHZhciBmaWVsZFRlbXBsYXRlcyA9IGNvbmZpZy5maWVsZEl0ZW1GaWVsZFRlbXBsYXRlcyhmaWVsZCk7XG4gICAgLy9cbiAgICAvLyAgIGZpZWxkVGVtcGxhdGUgPSBfLmZpbmQoZmllbGRUZW1wbGF0ZXMsIGZ1bmN0aW9uIChpdGVtRmllbGRUZW1wbGF0ZSkge1xuICAgIC8vICAgICByZXR1cm4gY29uZmlnLm1hdGNoZXNGaWVsZFRlbXBsYXRlVG9WYWx1ZShpdGVtRmllbGRUZW1wbGF0ZSwgY2hpbGRWYWx1ZSk7XG4gICAgLy8gICB9KTtcbiAgICAvL1xuICAgIC8vICAgaWYgKGZpZWxkVGVtcGxhdGUpIHtcbiAgICAvLyAgICAgcmV0dXJuIGZpZWxkVGVtcGxhdGU7XG4gICAgLy8gICB9IGVsc2Uge1xuICAgIC8vICAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUZpZWxkVGVtcGxhdGVGcm9tVmFsdWUoY2hpbGRWYWx1ZSk7XG4gICAgLy8gICB9XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgbWF0Y2ggZm9yIGEgZmllbGQgdGVtcGxhdGUuXG4gICAgLy8gbWF0Y2hlc0ZpZWxkVGVtcGxhdGVUb1ZhbHVlOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSwgdmFsdWUpIHtcbiAgICAvLyAgIHZhciBtYXRjaCA9IGZpZWxkVGVtcGxhdGUubWF0Y2g7XG4gICAgLy8gICBpZiAoIW1hdGNoKSB7XG4gICAgLy8gICAgIHJldHVybiB0cnVlO1xuICAgIC8vICAgfVxuICAgIC8vICAgcmV0dXJuIF8uZXZlcnkoT2JqZWN0LmtleXMobWF0Y2gpLCBmdW5jdGlvbiAoa2V5KSB7XG4gICAgLy8gICAgIHJldHVybiBfLmlzRXF1YWwobWF0Y2hba2V5XSwgdmFsdWVba2V5XSk7XG4gICAgLy8gICB9KTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gRmllbGQgdGVtcGxhdGUgaGVscGVyc1xuICAgIC8vXG4gICAgLy8gLy8gTm9ybWFsaXplZCAoUGFzY2FsQ2FzZSkgdHlwZSBuYW1lIGZvciBhIGZpZWxkLlxuICAgIC8vIGZpZWxkVGVtcGxhdGVUeXBlTmFtZTogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcbiAgICAvL1xuICAgIC8vICAgdmFyIHR5cGVOYW1lID0gdXRpbHMuZGFzaFRvUGFzY2FsKGZpZWxkVGVtcGxhdGUudHlwZSB8fCAndW5kZWZpbmVkJyk7XG4gICAgLy9cbiAgICAvLyAgIHZhciBhbGlhcyA9IGNvbmZpZ1snYWxpYXNfJyArIHR5cGVOYW1lXTtcbiAgICAvL1xuICAgIC8vICAgaWYgKGFsaWFzKSB7XG4gICAgLy8gICAgIGlmIChfLmlzRnVuY3Rpb24oYWxpYXMpKSB7XG4gICAgLy8gICAgICAgcmV0dXJuIGFsaWFzLmNhbGwoY29uZmlnLCBmaWVsZFRlbXBsYXRlKTtcbiAgICAvLyAgICAgfSBlbHNlIHtcbiAgICAvLyAgICAgICByZXR1cm4gYWxpYXM7XG4gICAgLy8gICAgIH1cbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgaWYgKGZpZWxkVGVtcGxhdGUubGlzdCkge1xuICAgIC8vICAgICB0eXBlTmFtZSA9ICdBcnJheSc7XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiB0eXBlTmFtZTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gRGVmYXVsdCB2YWx1ZSBmb3IgYSBmaWVsZCB0ZW1wbGF0ZS5cbiAgICAvLyBmaWVsZFRlbXBsYXRlRGVmYXVsdFZhbHVlOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSkge1xuICAgIC8vXG4gICAgLy8gICByZXR1cm4gZmllbGRUZW1wbGF0ZS5kZWZhdWx0O1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBWYWx1ZSBmb3IgYSBmaWVsZCB0ZW1wbGF0ZS4gVXNlZCB0byBkZXRlcm1pbmUgdGhlIHZhbHVlIG9mIGEgbmV3IGNoaWxkXG4gICAgLy8gLy8gZmllbGQuXG4gICAgLy8gZmllbGRUZW1wbGF0ZVZhbHVlOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSkge1xuICAgIC8vXG4gICAgLy8gICAvLyBUaGlzIGxvZ2ljIG1pZ2h0IGJlIGJyaXR0bGUuXG4gICAgLy9cbiAgICAvLyAgIHZhciBkZWZhdWx0VmFsdWUgPSBjb25maWcuZmllbGRUZW1wbGF0ZURlZmF1bHRWYWx1ZShmaWVsZFRlbXBsYXRlKTtcbiAgICAvL1xuICAgIC8vICAgdmFyIG1hdGNoID0gY29uZmlnLmZpZWxkVGVtcGxhdGVNYXRjaChmaWVsZFRlbXBsYXRlKTtcbiAgICAvL1xuICAgIC8vICAgdmFyIHZhbHVlO1xuICAgIC8vXG4gICAgLy8gICBpZiAoXy5pc1VuZGVmaW5lZChkZWZhdWx0VmFsdWUpICYmICFfLmlzVW5kZWZpbmVkKG1hdGNoKSkge1xuICAgIC8vICAgICByZXR1cm4gdXRpbHMuZGVlcENvcHkobWF0Y2gpO1xuICAgIC8vICAgfSBlbHNlIHtcbiAgICAvLyAgICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVEZWZhdWx0VmFsdWUoZmllbGRUZW1wbGF0ZSk7XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiB2YWx1ZTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gTWF0Y2ggcnVsZSBmb3IgYSBmaWVsZCB0ZW1wbGF0ZS5cbiAgICAvLyBmaWVsZFRlbXBsYXRlTWF0Y2g6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgLy8gICByZXR1cm4gZmllbGRUZW1wbGF0ZS5tYXRjaDtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gRGV0ZXJtaW5lIGlmIGEgZmllbGQgdGVtcGxhdGUgaGFzIGEgc2luZ2xlLWxpbmUgdmFsdWUuXG4gICAgLy8gZmllbGRUZW1wbGF0ZUlzU2luZ2xlTGluZTogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcbiAgICAvLyAgIHJldHVybiBmaWVsZFRlbXBsYXRlLmlzU2luZ2xlTGluZSB8fCBmaWVsZFRlbXBsYXRlLmlzX3NpbmdsZV9saW5lIHx8XG4gICAgLy8gICAgICAgICAgIGZpZWxkVGVtcGxhdGUudHlwZSA9PT0gJ3NpbmdsZS1saW5lLXN0cmluZycgfHwgZmllbGRUZW1wbGF0ZS50eXBlID09PSAnU2luZ2xlTGluZVN0cmluZyc7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIEZpZWxkIGhlbHBlcnNcbiAgICAvL1xuICAgIC8vIC8vIEdldCBhbiBhcnJheSBvZiBrZXlzIHJlcHJlc2VudGluZyB0aGUgcGF0aCB0byBhIHZhbHVlLlxuICAgIC8vIGZpZWxkVmFsdWVQYXRoOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAvL1xuICAgIC8vICAgdmFyIHBhcmVudFBhdGggPSBbXTtcbiAgICAvL1xuICAgIC8vICAgaWYgKGZpZWxkLnBhcmVudCkge1xuICAgIC8vICAgICBwYXJlbnRQYXRoID0gY29uZmlnLmZpZWxkVmFsdWVQYXRoKGZpZWxkLnBhcmVudCk7XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiBwYXJlbnRQYXRoLmNvbmNhdChmaWVsZC5rZXkpLmZpbHRlcihmdW5jdGlvbiAoa2V5KSB7XG4gICAgLy8gICAgIHJldHVybiAhXy5pc1VuZGVmaW5lZChrZXkpICYmIGtleSAhPT0gJyc7XG4gICAgLy8gICB9KTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gQ2xvbmUgYSBmaWVsZCB3aXRoIGEgZGlmZmVyZW50IHZhbHVlLlxuICAgIC8vIGZpZWxkV2l0aFZhbHVlOiBmdW5jdGlvbiAoZmllbGQsIHZhbHVlKSB7XG4gICAgLy8gICByZXR1cm4gXy5leHRlbmQoe30sIGZpZWxkLCB7dmFsdWU6IHZhbHVlfSk7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIGZpZWxkVHlwZU5hbWU6IGRlbGVnYXRlVG8oJ2ZpZWxkVGVtcGxhdGVUeXBlTmFtZScpLFxuICAgIC8vXG4gICAgLy8gLy8gR2V0IHRoZSBjaG9pY2VzIGZvciBhIGRyb3Bkb3duIGZpZWxkLlxuICAgIC8vIGZpZWxkQ2hvaWNlczogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiBjb25maWcubm9ybWFsaXplQ2hvaWNlcyhmaWVsZC5jaG9pY2VzKTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gR2V0IHRoZSBjaG9pY2VzIGZvciBhIHByZXR0eSBkcm9wZG93biBmaWVsZC5cbiAgICAvLyBmaWVsZFByZXR0eUNob2ljZXM6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIC8vXG4gICAgLy8gICByZXR1cm4gY29uZmlnLm5vcm1hbGl6ZVByZXR0eUNob2ljZXMoZmllbGQuY2hvaWNlcyk7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIEdldCBhIHNldCBvZiBib29sZWFuIGNob2ljZXMgZm9yIGEgZmllbGQuXG4gICAgLy8gZmllbGRCb29sZWFuQ2hvaWNlczogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgLy9cbiAgICAvLyAgIHZhciBjaG9pY2VzID0gY29uZmlnLmZpZWxkQ2hvaWNlcyhmaWVsZCk7XG4gICAgLy9cbiAgICAvLyAgIGlmIChjaG9pY2VzLmxlbmd0aCA9PT0gMCkge1xuICAgIC8vICAgICByZXR1cm4gW3tcbiAgICAvLyAgICAgICBsYWJlbDogJ3llcycsXG4gICAgLy8gICAgICAgdmFsdWU6IHRydWVcbiAgICAvLyAgICAgfSwge1xuICAgIC8vICAgICAgIGxhYmVsOiAnbm8nLFxuICAgIC8vICAgICAgIHZhbHVlOiBmYWxzZVxuICAgIC8vICAgICB9XTtcbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgcmV0dXJuIGNob2ljZXMubWFwKGZ1bmN0aW9uIChjaG9pY2UpIHtcbiAgICAvLyAgICAgaWYgKF8uaXNCb29sZWFuKGNob2ljZS52YWx1ZSkpIHtcbiAgICAvLyAgICAgICByZXR1cm4gY2hvaWNlO1xuICAgIC8vICAgICB9XG4gICAgLy8gICAgIHJldHVybiBfLmV4dGVuZCh7fSwgY2hvaWNlLCB7XG4gICAgLy8gICAgICAgdmFsdWU6IGNvbmZpZy5jb2VyY2VWYWx1ZVRvQm9vbGVhbihjaG9pY2UudmFsdWUpXG4gICAgLy8gICAgIH0pO1xuICAgIC8vICAgfSk7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIEdldCBhIHNldCBvZiByZXBsYWNlbWVudCBjaG9pY2VzIGZvciBhIGZpZWxkLlxuICAgIC8vIGZpZWxkUmVwbGFjZUNob2ljZXM6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIC8vXG4gICAgLy8gICByZXR1cm4gY29uZmlnLm5vcm1hbGl6ZUNob2ljZXMoZmllbGQucmVwbGFjZUNob2ljZXMpO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBHZXQgYSBsYWJlbCBmb3IgYSBmaWVsZC5cbiAgICAvLyBmaWVsZExhYmVsOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAvLyAgIHJldHVybiBmaWVsZC5sYWJlbDtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gR2V0IGEgcGxhY2Vob2xkZXIgKGp1c3QgYSBkZWZhdWx0IGRpc3BsYXkgdmFsdWUsIG5vdCBhIGRlZmF1bHQgdmFsdWUpIGZvciBhIGZpZWxkLlxuICAgIC8vIGZpZWxkUGxhY2Vob2xkZXI6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIC8vICAgcmV0dXJuIGZpZWxkLnBsYWNlaG9sZGVyO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBHZXQgdGhlIGhlbHAgdGV4dCBmb3IgYSBmaWVsZC5cbiAgICAvLyBmaWVsZEhlbHBUZXh0OiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAvLyAgIHJldHVybiBmaWVsZC5oZWxwX3RleHRfaHRtbCB8fCBmaWVsZC5oZWxwX3RleHQgfHwgZmllbGQuaGVscFRleHQgfHwgZmllbGQuaGVscFRleHRIdG1sO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBHZXQgd2hldGhlciBvciBub3QgYSBmaWVsZCBpcyByZXF1aXJlZC5cbiAgICAvLyBmaWVsZElzUmVxdWlyZWQ6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIC8vICAgcmV0dXJuIGZpZWxkLnJlcXVpcmVkID8gdHJ1ZSA6IGZhbHNlO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBEZXRlcm1pbmUgaWYgdmFsdWUgZm9yIHRoaXMgZmllbGQgaXMgbm90IGEgbGVhZiB2YWx1ZS5cbiAgICAvLyBmaWVsZEhhc1ZhbHVlQ2hpbGRyZW46IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIC8vXG4gICAgLy8gICB2YXIgZGVmYXVsdFZhbHVlID0gY29uZmlnLmNyZWF0ZURlZmF1bHRWYWx1ZShmaWVsZCk7XG4gICAgLy9cbiAgICAvLyAgIGlmIChfLmlzT2JqZWN0KGRlZmF1bHRWYWx1ZSkgfHwgXy5pc0FycmF5KGRlZmF1bHRWYWx1ZSkpIHtcbiAgICAvLyAgICAgcmV0dXJuIHRydWU7XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIHJldHVybiBmYWxzZTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gLy8gR2V0IHRoZSBjaGlsZCBmaWVsZCB0ZW1wbGF0ZXMgZm9yIHRoaXMgZmllbGQuXG4gICAgLy8gZmllbGRDaGlsZEZpZWxkVGVtcGxhdGVzOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAvLyAgIHJldHVybiBmaWVsZC5maWVsZHMgfHwgW107XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIEdldCB0aGUgZmllbGQgdGVtcGxhdGVzIGZvciBlYWNoIGl0ZW0gb2YgdGhpcyBmaWVsZC4gKEZvciBkeW5hbWljIGNoaWxkcmVuLFxuICAgIC8vIC8vIGxpa2UgYXJyYXlzLilcbiAgICAvLyBmaWVsZEl0ZW1GaWVsZFRlbXBsYXRlczogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgLy8gICBpZiAoIWZpZWxkLml0ZW1GaWVsZHMpIHtcbiAgICAvLyAgICAgcmV0dXJuIFt7dHlwZTogJ3RleHQnfV07XG4gICAgLy8gICB9XG4gICAgLy8gICBpZiAoIV8uaXNBcnJheShmaWVsZC5pdGVtRmllbGRzKSkge1xuICAgIC8vICAgICByZXR1cm4gW2ZpZWxkLml0ZW1GaWVsZHNdO1xuICAgIC8vICAgfVxuICAgIC8vICAgcmV0dXJuIGZpZWxkLml0ZW1GaWVsZHM7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIGZpZWxkSXNTaW5nbGVMaW5lOiBkZWxlZ2F0ZVRvKCdmaWVsZFRlbXBsYXRlSXNTaW5nbGVMaW5lJyksXG4gICAgLy9cbiAgICAvLyAvLyBHZXQgd2hldGhlciBvciBub3QgYSBmaWVsZCBpcyBjb2xsYXBzZWQuXG4gICAgLy8gZmllbGRJc0NvbGxhcHNlZDogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgLy8gICByZXR1cm4gZmllbGQuY29sbGFwc2VkID8gdHJ1ZSA6IGZhbHNlO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBHZXQgd2hldGVyIG9yIG5vdCBhIGZpZWxkIGNhbiBiZSBjb2xsYXBzZWQuXG4gICAgLy8gZmllbGRJc0NvbGxhcHNpYmxlOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAvLyAgIHJldHVybiBmaWVsZC5jb2xsYXBzaWJsZSB8fCAhXy5pc1VuZGVmaW5lZChmaWVsZC5jb2xsYXBzZWQpO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBHZXQgdGhlIG51bWJlciBvZiByb3dzIGZvciBhIGZpZWxkLlxuICAgIC8vIGZpZWxkUm93czogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgLy8gICByZXR1cm4gZmllbGQucm93cztcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gZmllbGRFcnJvcnM6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIC8vXG4gICAgLy8gICB2YXIgZXJyb3JzID0gW107XG4gICAgLy9cbiAgICAvLyAgIGlmIChjb25maWcuaXNLZXkoZmllbGQua2V5KSkge1xuICAgIC8vICAgICBjb25maWcudmFsaWRhdGVGaWVsZChmaWVsZCwgZXJyb3JzKTtcbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgcmV0dXJuIGVycm9ycztcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gZmllbGRNYXRjaDogZGVsZWdhdGVUbygnZmllbGRUZW1wbGF0ZU1hdGNoJyksXG4gICAgLy9cbiAgICAvLyAvLyBPdGhlciBoZWxwZXJzXG4gICAgLy9cbiAgICAvLyAvLyBDb252ZXJ0IGEga2V5IHRvIGEgbmljZSBodW1hbi1yZWFkYWJsZSB2ZXJzaW9uLlxuICAgIC8vIGh1bWFuaXplOiBmdW5jdGlvbihwcm9wZXJ0eSkge1xuICAgIC8vICAgcHJvcGVydHkgPSBwcm9wZXJ0eS5yZXBsYWNlKC9cXHtcXHsvZywgJycpO1xuICAgIC8vICAgcHJvcGVydHkgPSBwcm9wZXJ0eS5yZXBsYWNlKC9cXH1cXH0vZywgJycpO1xuICAgIC8vICAgcmV0dXJuIHByb3BlcnR5LnJlcGxhY2UoL18vZywgJyAnKVxuICAgIC8vICAgLnJlcGxhY2UoLyhcXHcrKS9nLCBmdW5jdGlvbihtYXRjaCkge1xuICAgIC8vICAgICByZXR1cm4gbWF0Y2guY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBtYXRjaC5zbGljZSgxKTtcbiAgICAvLyAgIH0pO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBOb3JtYWxpemUgc29tZSBjaG9pY2VzIGZvciBhIGRyb3AtZG93bi5cbiAgICAvLyBub3JtYWxpemVDaG9pY2VzOiBmdW5jdGlvbiAoY2hvaWNlcykge1xuICAgIC8vXG4gICAgLy8gICBpZiAoIWNob2ljZXMpIHtcbiAgICAvLyAgICAgcmV0dXJuIFtdO1xuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICAvLyBDb252ZXJ0IGNvbW1hIHNlcGFyYXRlZCBzdHJpbmcgdG8gYXJyYXkgb2Ygc3RyaW5ncy5cbiAgICAvLyAgIGlmIChfLmlzU3RyaW5nKGNob2ljZXMpKSB7XG4gICAgLy8gICAgIGNob2ljZXMgPSBjaG9pY2VzLnNwbGl0KCcsJyk7XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIC8vIENvbnZlcnQgb2JqZWN0IHRvIGFycmF5IG9mIG9iamVjdHMgd2l0aCBgdmFsdWVgIGFuZCBgbGFiZWxgIHByb3BlcnRpZXMuXG4gICAgLy8gICBpZiAoIV8uaXNBcnJheShjaG9pY2VzKSAmJiBfLmlzT2JqZWN0KGNob2ljZXMpKSB7XG4gICAgLy8gICAgIGNob2ljZXMgPSBPYmplY3Qua2V5cyhjaG9pY2VzKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgIC8vICAgICAgIHJldHVybiB7XG4gICAgLy8gICAgICAgICB2YWx1ZToga2V5LFxuICAgIC8vICAgICAgICAgbGFiZWw6IGNob2ljZXNba2V5XVxuICAgIC8vICAgICAgIH07XG4gICAgLy8gICAgIH0pO1xuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICAvLyBDb3B5IHRoZSBhcnJheSBvZiBjaG9pY2VzIHNvIHdlIGNhbiBtYW5pcHVsYXRlIHRoZW0uXG4gICAgLy8gICBjaG9pY2VzID0gY2hvaWNlcy5zbGljZSgwKTtcbiAgICAvL1xuICAgIC8vICAgLy8gQXJyYXkgb2YgY2hvaWNlIGFycmF5cyBzaG91bGQgYmUgZmxhdHRlbmVkLlxuICAgIC8vICAgY2hvaWNlcyA9IF8uZmxhdHRlbihjaG9pY2VzKTtcbiAgICAvL1xuICAgIC8vICAgY2hvaWNlcy5mb3JFYWNoKGZ1bmN0aW9uIChjaG9pY2UsIGkpIHtcbiAgICAvLyAgICAgLy8gQ29udmVydCBhbnkgc3RyaW5nIGNob2ljZXMgdG8gb2JqZWN0cyB3aXRoIGB2YWx1ZWAgYW5kIGBsYWJlbGBcbiAgICAvLyAgICAgLy8gcHJvcGVydGllcy5cbiAgICAvLyAgICAgaWYgKF8uaXNTdHJpbmcoY2hvaWNlKSkge1xuICAgIC8vICAgICAgIGNob2ljZXNbaV0gPSB7XG4gICAgLy8gICAgICAgICB2YWx1ZTogY2hvaWNlLFxuICAgIC8vICAgICAgICAgbGFiZWw6IGNvbmZpZy5odW1hbml6ZShjaG9pY2UpXG4gICAgLy8gICAgICAgfTtcbiAgICAvLyAgICAgfVxuICAgIC8vICAgICBpZiAoIWNob2ljZXNbaV0ubGFiZWwpIHtcbiAgICAvLyAgICAgICBjaG9pY2VzW2ldLmxhYmVsID0gY29uZmlnLmh1bWFuaXplKGNob2ljZXNbaV0udmFsdWUpO1xuICAgIC8vICAgICB9XG4gICAgLy8gICB9KTtcbiAgICAvL1xuICAgIC8vICAgcmV0dXJuIGNob2ljZXM7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIE5vcm1hbGl6ZSBjaG9pY2VzIGZvciBhIHByZXR0eSBkcm9wIGRvd24sIHdpdGggJ3NhbXBsZScgdmFsdWVzXG4gICAgLy8gbm9ybWFsaXplUHJldHR5Q2hvaWNlczogZnVuY3Rpb24gKGNob2ljZXMpIHtcbiAgICAvLyAgIGlmICghXy5pc0FycmF5KGNob2ljZXMpICYmIF8uaXNPYmplY3QoY2hvaWNlcykpIHtcbiAgICAvLyAgICAgY2hvaWNlcyA9IE9iamVjdC5rZXlzKGNob2ljZXMpLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgLy8gICAgICAgcmV0dXJuIHtcbiAgICAvLyAgICAgICAgIHZhbHVlOiBrZXksXG4gICAgLy8gICAgICAgICBsYWJlbDogY2hvaWNlc1trZXldLFxuICAgIC8vICAgICAgICAgc2FtcGxlOiBrZXlcbiAgICAvLyAgICAgICB9O1xuICAgIC8vICAgICB9KTtcbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgcmV0dXJuIGNvbmZpZy5ub3JtYWxpemVDaG9pY2VzKGNob2ljZXMpO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBDb2VyY2UgYSB2YWx1ZSB0byBhIGJvb2xlYW5cbiAgICAvLyBjb2VyY2VWYWx1ZVRvQm9vbGVhbjogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgLy8gICBpZiAoIV8uaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgLy8gICAgIC8vIEp1c3QgdXNlIHRoZSBkZWZhdWx0IHRydXRoaW5lc3MuXG4gICAgLy8gICAgIHJldHVybiB2YWx1ZSA/IHRydWUgOiBmYWxzZTtcbiAgICAvLyAgIH1cbiAgICAvLyAgIHZhbHVlID0gdmFsdWUudG9Mb3dlckNhc2UoKTtcbiAgICAvLyAgIGlmICh2YWx1ZSA9PT0gJycgfHwgdmFsdWUgPT09ICdubycgfHwgdmFsdWUgPT09ICdvZmYnIHx8IHZhbHVlID09PSAnZmFsc2UnKSB7XG4gICAgLy8gICAgIHJldHVybiBmYWxzZTtcbiAgICAvLyAgIH1cbiAgICAvLyAgIHJldHVybiB0cnVlO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyAvLyBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIHZhbGlkIGtleS5cbiAgICAvLyBpc0tleTogZnVuY3Rpb24gKGtleSkge1xuICAgIC8vICAgcmV0dXJuIChfLmlzTnVtYmVyKGtleSkgJiYga2V5ID49IDApIHx8IChfLmlzU3RyaW5nKGtleSkgJiYga2V5ICE9PSAnJyk7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIC8vIEZhc3Qgd2F5IHRvIGNoZWNrIGZvciBlbXB0eSBvYmplY3QuXG4gICAgLy8gaXNFbXB0eU9iamVjdDogZnVuY3Rpb24gKG9iaikge1xuICAgIC8vICAgZm9yKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgLy8gICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgIC8vICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAvLyAgICAgfVxuICAgIC8vICAgfVxuICAgIC8vICAgcmV0dXJuIHRydWU7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIGFjdGlvbkNob2ljZUxhYmVsOiBmdW5jdGlvbiAoYWN0aW9uKSB7XG4gICAgLy8gICByZXR1cm4gdXRpbHMuY2FwaXRhbGl6ZShhY3Rpb24pLnJlcGxhY2UoL1stXS9nLCAnICcpO1xuICAgIC8vIH1cbi8vICAgfTtcbi8vIH07XG4iLCJ2YXIgXyA9IHJlcXVpcmUoJy4vdW5kYXNoJyk7XG5cbmNvbnN0IGNyZWF0ZUNvbmZpZyA9IGZ1bmN0aW9uICguLi5wbHVnaW5zKSB7XG4gIHJldHVybiBwbHVnaW5zLnJlZHVjZShmdW5jdGlvbiAoY29uZmlnLCBwbHVnaW4pIHtcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKHBsdWdpbikpIHtcbiAgICAgIHZhciBleHRlbnNpb25zID0gcGx1Z2luKGNvbmZpZyk7XG4gICAgICBpZiAoZXh0ZW5zaW9ucykge1xuICAgICAgICBfLmV4dGVuZChjb25maWcsIGV4dGVuc2lvbnMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBfLmV4dGVuZChjb25maWcsIHBsdWdpbik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbmZpZztcbiAgfSwge30pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVDb25maWc7XG4iLCJjb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5jb25zdCBfID0gcmVxdWlyZSgnLi91bmRhc2gnKTtcbmNvbnN0IENvbmZpZyA9IHJlcXVpcmUoJy4vY29uZmlnJyk7XG5jb25zdCBDb21wb25lbnRzID0gcmVxdWlyZSgnLi9jb21wb25lbnRzJyk7XG5jb25zdCBjcmVhdGVDb25maWcgPSByZXF1aXJlKCcuL2NyZWF0ZS1jb25maWcnKTtcbmNvbnN0IGRlZmF1bHRDb25maWdQbHVnaW4gPSByZXF1aXJlKCcuL3BsdWdpbnMvZGVmYXVsdC1jb25maWcnKTtcbkNvbmZpZy5zZXREZWZhdWx0Q29uZmlnKGNyZWF0ZUNvbmZpZyhkZWZhdWx0Q29uZmlnUGx1Z2luKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIHN0YXRpY3M6IF8uZXh0ZW5kKHtcbiAgICBjcmVhdGVDb25maWc6IGNyZWF0ZUNvbmZpZy5iaW5kKG51bGwsIGRlZmF1bHRDb25maWdQbHVnaW4pLFxuICAgIHdyYXBGaWVsZDogcmVxdWlyZSgnLi9jb21wb25lbnRzL3dyYXAtZmllbGQnKSxcbiAgICB3cmFwSGVscGVyOiByZXF1aXJlKCcuL2NvbXBvbmVudHMvd3JhcC1oZWxwZXInKVxuICB9LFxuICAgIENvbXBvbmVudHNcbiAgKSxcblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgY29uZmlnID0gQ29uZmlnLmZvckNvbXBuZW50KHRoaXMpO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5yZW5kZXJGb3JtYXRpY0NvbXBvbmVudCh0aGlzKTtcbiAgfVxuXG59KTtcblxuXG4vLyAvLyAjIGZvcm1hdGljXG4vL1xuLy8gLypcbi8vIFRoZSByb290IGZvcm1hdGljIGNvbXBvbmVudC5cbi8vXG4vLyBUaGUgcm9vdCBmb3JtYXRpYyBjb21wb25lbnQgaXMgYWN0dWFsbHkgdHdvIGNvbXBvbmVudHMuIFRoZSBtYWluIGNvbXBvbmVudCBpc1xuLy8gYSBjb250cm9sbGVkIGNvbXBvbmVudCB3aGVyZSB5b3UgbXVzdCBwYXNzIHRoZSB2YWx1ZSBpbiB3aXRoIGVhY2ggcmVuZGVyLiBUaGlzXG4vLyBpcyBhY3R1YWxseSB3cmFwcGVkIGluIGFub3RoZXIgY29tcG9uZW50IHdoaWNoIGFsbG93cyB5b3UgdG8gdXNlIGZvcm1hdGljIGFzXG4vLyBhbiB1bmNvbnRyb2xsZWQgY29tcG9uZW50IHdoZXJlIGl0IHJldGFpbnMgdGhlIHN0YXRlIG9mIHRoZSB2YWx1ZS4gVGhlIHdyYXBwZXJcbi8vIGlzIHdoYXQgaXMgYWN0dWFsbHkgZXhwb3J0ZWQuXG4vLyAqL1xuLy9cbi8vICd1c2Ugc3RyaWN0Jztcbi8vXG4vLyB2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbi8vIHZhciBfID0gcmVxdWlyZSgnLi91bmRhc2gnKTtcbi8vXG4vLyB2YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG4vL1xuLy8gdmFyIGRlZmF1bHRDb25maWdQbHVnaW4gPSByZXF1aXJlKCcuL2RlZmF1bHQtY29uZmlnJyk7XG4vL1xuLy8gdmFyIGNyZWF0ZUNvbmZpZyA9IGZ1bmN0aW9uICguLi5hcmdzKSB7XG4vLyAgIHZhciBwbHVnaW5zID0gW2RlZmF1bHRDb25maWdQbHVnaW5dLmNvbmNhdChhcmdzKTtcbi8vXG4vLyAgIHJldHVybiBwbHVnaW5zLnJlZHVjZShmdW5jdGlvbiAoY29uZmlnLCBwbHVnaW4pIHtcbi8vICAgICBpZiAoXy5pc0Z1bmN0aW9uKHBsdWdpbikpIHtcbi8vICAgICAgIHZhciBleHRlbnNpb25zID0gcGx1Z2luKGNvbmZpZyk7XG4vLyAgICAgICBpZiAoZXh0ZW5zaW9ucykge1xuLy8gICAgICAgICBfLmV4dGVuZChjb25maWcsIGV4dGVuc2lvbnMpO1xuLy8gICAgICAgfVxuLy8gICAgIH0gZWxzZSB7XG4vLyAgICAgICBfLmV4dGVuZChjb25maWcsIHBsdWdpbik7XG4vLyAgICAgfVxuLy9cbi8vICAgICByZXR1cm4gY29uZmlnO1xuLy8gICB9LCB7fSk7XG4vLyB9O1xuLy9cbi8vIHZhciBkZWZhdWx0Q29uZmlnID0gY3JlYXRlQ29uZmlnKCk7XG4vL1xuLy8gLy8gVGhlIG1haW4gZm9ybWF0aWMgY29tcG9uZW50IHRoYXQgcmVuZGVycyB0aGUgZm9ybS5cbi8vIHZhciBGb3JtYXRpY0NvbnRyb2xsZWRDbGFzcyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbi8vXG4vLyAgIGRpc3BsYXlOYW1lOiAnRm9ybWF0aWNDb250cm9sbGVkJyxcbi8vXG4vLyAgIC8vIFJlc3BvbmQgdG8gYW55IHZhbHVlIGNoYW5nZXMuXG4vLyAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAobmV3VmFsdWUsIGluZm8pIHtcbi8vICAgICBpZiAoIXRoaXMucHJvcHMub25DaGFuZ2UpIHtcbi8vICAgICAgIHJldHVybjtcbi8vICAgICB9XG4vLyAgICAgaW5mbyA9IF8uZXh0ZW5kKHt9LCBpbmZvKTtcbi8vICAgICBpbmZvLnBhdGggPSB0aGlzLnByb3BzLmNvbmZpZy5maWVsZFZhbHVlUGF0aChpbmZvLmZpZWxkKTtcbi8vICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG5ld1ZhbHVlLCBpbmZvKTtcbi8vICAgfSxcbi8vXG4vLyAgIC8vIFJlc3BvbmQgdG8gYW55IGFjdGlvbnMgb3RoZXIgdGhhbiB2YWx1ZSBjaGFuZ2VzLiAoRm9yIGV4YW1wbGUsIGZvY3VzIGFuZFxuLy8gICAvLyBibHVyLilcbi8vICAgb25BY3Rpb246IGZ1bmN0aW9uIChpbmZvKSB7XG4vLyAgICAgaWYgKCF0aGlzLnByb3BzLm9uQWN0aW9uKSB7XG4vLyAgICAgICByZXR1cm47XG4vLyAgICAgfVxuLy8gICAgIGluZm8gPSBfLmV4dGVuZCh7fSwgaW5mbyk7XG4vLyAgICAgaW5mby5wYXRoID0gdGhpcy5wcm9wcy5jb25maWcuZmllbGRWYWx1ZVBhdGgoaW5mby5maWVsZCk7XG4vLyAgICAgdGhpcy5wcm9wcy5vbkFjdGlvbihpbmZvKTtcbi8vICAgfSxcbi8vXG4vLyAgIC8vIFJlbmRlciB0aGUgcm9vdCBjb21wb25lbnQgYnkgZGVsZWdhdGluZyB0byB0aGUgY29uZmlnLlxuLy8gICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbi8vXG4vLyAgICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuLy9cbi8vICAgICByZXR1cm4gY29uZmlnLnJlbmRlckZvcm1hdGljQ29tcG9uZW50KHRoaXMpO1xuLy8gICB9XG4vLyB9KTtcbi8vXG4vLyB2YXIgRm9ybWF0aWNDb250cm9sbGVkID0gUmVhY3QuY3JlYXRlRmFjdG9yeShGb3JtYXRpY0NvbnRyb2xsZWRDbGFzcyk7XG4vL1xuLy8gLy8gQSB3cmFwcGVyIGNvbXBvbmVudCB0aGF0IGlzIGFjdHVhbGx5IGV4cG9ydGVkIGFuZCBjYW4gYWxsb3cgZm9ybWF0aWMgdG8gYmVcbi8vIC8vIHVzZWQgaW4gYW4gXCJ1bmNvbnRyb2xsZWRcIiBtYW5uZXIuIChTZWUgdW5jb250cm9sbGVkIGNvbXBvbmVudHMgaW4gdGhlIFJlYWN0XG4vLyAvLyBkb2N1bWVudGF0aW9uIGZvciBhbiBleHBsYW5hdGlvbiBvZiB0aGUgZGlmZmVyZW5jZS4pXG4vLyBtb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbi8vXG4vLyAgIC8vIEV4cG9ydCBzb21lIHN0dWZmIGFzIHN0YXRpY3MuXG4vLyAgIHN0YXRpY3M6IHtcbi8vICAgICBjcmVhdGVDb25maWc6IGNyZWF0ZUNvbmZpZyxcbi8vICAgICBhdmFpbGFibGVNaXhpbnM6IHtcbi8vICAgICAgIGNsaWNrT3V0c2lkZTogcmVxdWlyZSgnLi9taXhpbnMvY2xpY2stb3V0c2lkZS5qcycpLFxuLy8gICAgICAgZmllbGQ6IHJlcXVpcmUoJy4vbWl4aW5zL2ZpZWxkLmpzJyksXG4vLyAgICAgICBoZWxwZXI6IHJlcXVpcmUoJy4vbWl4aW5zL2hlbHBlci5qcycpLFxuLy8gICAgICAgcmVzaXplOiByZXF1aXJlKCcuL21peGlucy9yZXNpemUuanMnKSxcbi8vICAgICAgIHNjcm9sbDogcmVxdWlyZSgnLi9taXhpbnMvc2Nyb2xsLmpzJyksXG4vLyAgICAgICB1bmRvU3RhY2s6IHJlcXVpcmUoJy4vbWl4aW5zL3VuZG8tc3RhY2suanMnKVxuLy8gICAgIH0sXG4vLyAgICAgcGx1Z2luczoge1xuLy8gICAgICAgYm9vdHN0cmFwOiByZXF1aXJlKCcuL3BsdWdpbnMvYm9vdHN0cmFwJyksXG4vLyAgICAgICBtZXRhOiByZXF1aXJlKCcuL3BsdWdpbnMvbWV0YScpLFxuLy8gICAgICAgcmVmZXJlbmNlOiByZXF1aXJlKCcuL3BsdWdpbnMvcmVmZXJlbmNlJyksXG4vLyAgICAgICBlbGVtZW50Q2xhc3NlczogcmVxdWlyZSgnLi9wbHVnaW5zL2VsZW1lbnQtY2xhc3NlcycpXG4vLyAgICAgfSxcbi8vICAgICB1dGlsczogdXRpbHNcbi8vICAgfSxcbi8vXG4vLyAgIGRpc3BsYXlOYW1lOiAnRm9ybWF0aWMnLFxuLy9cbi8vICAgLy8gSWYgd2UgZ290IGEgdmFsdWUsIHRyZWF0IHRoaXMgY29tcG9uZW50IGFzIGNvbnRyb2xsZWQuIEVpdGhlciB3YXksIHJldGFpblxuLy8gICAvLyB0aGUgdmFsdWUgaW4gdGhlIHN0YXRlLlxuLy8gICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbi8vICAgICByZXR1cm4ge1xuLy8gICAgICAgaXNDb250cm9sbGVkOiAhXy5pc1VuZGVmaW5lZCh0aGlzLnByb3BzLnZhbHVlKSxcbi8vICAgICAgIHZhbHVlOiBfLmlzVW5kZWZpbmVkKHRoaXMucHJvcHMudmFsdWUpID8gdGhpcy5wcm9wcy5kZWZhdWx0VmFsdWUgOiB0aGlzLnByb3BzLnZhbHVlXG4vLyAgICAgfTtcbi8vICAgfSxcbi8vXG4vLyAgIC8vIElmIHRoaXMgaXMgYSBjb250cm9sbGVkIGNvbXBvbmVudCwgY2hhbmdlIG91ciBzdGF0ZSB0byByZWZsZWN0IHRoZSBuZXdcbi8vICAgLy8gdmFsdWUuIEZvciB1bmNvbnRyb2xsZWQgY29tcG9uZW50cywgaWdub3JlIGFueSB2YWx1ZSBjaGFuZ2VzLlxuLy8gICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV3UHJvcHMpIHtcbi8vICAgICBpZiAodGhpcy5zdGF0ZS5pc0NvbnRyb2xsZWQpIHtcbi8vICAgICAgIGlmICghXy5pc1VuZGVmaW5lZChuZXdQcm9wcy52YWx1ZSkpIHtcbi8vICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4vLyAgICAgICAgICAgdmFsdWU6IG5ld1Byb3BzLnZhbHVlXG4vLyAgICAgICAgIH0pO1xuLy8gICAgICAgfVxuLy8gICAgIH1cbi8vICAgfSxcbi8vXG4vLyAgIC8vIElmIHRoaXMgaXMgYW4gdW5jb250cm9sbGVkIGNvbXBvbmVudCwgc2V0IG91ciBzdGF0ZSB0byByZWZsZWN0IHRoZSBuZXdcbi8vICAgLy8gdmFsdWUuIEVpdGhlciB3YXksIGNhbGwgdGhlIG9uQ2hhbmdlIGNhbGxiYWNrLlxuLy8gICBvbkNoYW5nZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBpbmZvKSB7XG4vLyAgICAgaWYgKCF0aGlzLnN0YXRlLmlzQ29udHJvbGxlZCkge1xuLy8gICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4vLyAgICAgICAgIHZhbHVlOiBuZXdWYWx1ZVxuLy8gICAgICAgfSk7XG4vLyAgICAgfVxuLy8gICAgIGlmICghdGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuLy8gICAgICAgcmV0dXJuO1xuLy8gICAgIH1cbi8vICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG5ld1ZhbHVlLCBpbmZvKTtcbi8vICAgfSxcbi8vXG4vLyAgIC8vIEFueSBhY3Rpb25zIHNob3VsZCBiZSBzZW50IHRvIHRoZSBnZW5lcmljIG9uQWN0aW9uIGNhbGxiYWNrIGJ1dCBhbHNvIHNwbGl0XG4vLyAgIC8vIGludG8gZGlzY3JlZXQgY2FsbGJhY2tzIHBlciBhY3Rpb24uXG4vLyAgIG9uQWN0aW9uOiBmdW5jdGlvbiAoaW5mbykge1xuLy8gICAgIGlmICh0aGlzLnByb3BzLm9uQWN0aW9uKSB7XG4vLyAgICAgICB0aGlzLnByb3BzLm9uQWN0aW9uKGluZm8pO1xuLy8gICAgIH1cbi8vICAgICB2YXIgYWN0aW9uID0gdXRpbHMuZGFzaFRvUGFzY2FsKGluZm8uYWN0aW9uKTtcbi8vICAgICBpZiAodGhpcy5wcm9wc1snb24nICsgYWN0aW9uXSkge1xuLy8gICAgICAgdGhpcy5wcm9wc1snb24nICsgYWN0aW9uXShpbmZvKTtcbi8vICAgICB9XG4vLyAgIH0sXG4vL1xuLy8gICAvLyBSZW5kZXIgdGhlIHdyYXBwZXIgY29tcG9uZW50IChieSBqdXN0IGRlbGVnYXRpbmcgdG8gdGhlIG1haW4gY29tcG9uZW50KS5cbi8vICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4vL1xuLy8gICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZyB8fCBkZWZhdWx0Q29uZmlnO1xuLy8gICAgIHZhciB2YWx1ZSA9IHRoaXMuc3RhdGUudmFsdWU7XG4vL1xuLy8gICAgIGlmICh0aGlzLnN0YXRlLmlzQ29udHJvbGxlZCkge1xuLy8gICAgICAgaWYgKCF0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4vLyAgICAgICAgIGNvbnNvbGUubG9nKCdZb3Ugc2hvdWxkIHN1cHBseSBhbiBvbkNoYW5nZSBoYW5kbGVyIGlmIHlvdSBzdXBwbHkgYSB2YWx1ZS4nKTtcbi8vICAgICAgIH1cbi8vICAgICB9XG4vL1xuLy8gICAgIHZhciBwcm9wcyA9IHtcbi8vICAgICAgIGNvbmZpZzogY29uZmlnLFxuLy8gICAgICAgLy8gQWxsb3cgZmllbGQgdGVtcGxhdGVzIHRvIGJlIHBhc3NlZCBpbiBhcyBgZmllbGRgIG9yIGBmaWVsZHNgLiBBZnRlciB0aGlzLCBzdG9wXG4vLyAgICAgICAvLyBjYWxsaW5nIHRoZW0gZmllbGRzLlxuLy8gICAgICAgZmllbGRUZW1wbGF0ZTogdGhpcy5wcm9wcy5maWVsZCxcbi8vICAgICAgIGZpZWxkVGVtcGxhdGVzOiB0aGlzLnByb3BzLmZpZWxkcyxcbi8vICAgICAgIHZhbHVlOiB2YWx1ZSxcbi8vICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuLy8gICAgICAgb25BY3Rpb246IHRoaXMub25BY3Rpb25cbi8vICAgICB9O1xuLy9cbi8vICAgICBfLmVhY2godGhpcy5wcm9wcywgZnVuY3Rpb24gKHByb3BWYWx1ZSwga2V5KSB7XG4vLyAgICAgICBpZiAoIShrZXkgaW4gcHJvcHMpKSB7XG4vLyAgICAgICAgIHByb3BzW2tleV0gPSBwcm9wVmFsdWU7XG4vLyAgICAgICB9XG4vLyAgICAgfSk7XG4vL1xuLy8gICAgIHJldHVybiBGb3JtYXRpY0NvbnRyb2xsZWQocHJvcHMpO1xuLy8gICB9XG4vL1xuLy8gfSk7XG4iLCIvKlxuVGhpcyBpcyB0aGUgZGVmYXVsdCBjb25maWd1cmF0aW9uIHBsdWdpbiBmb3IgZm9ybWF0aWMuIFRvIGNoYW5nZSBmb3JtYXRpYydzXG5iZWhhdmlvciwganVzdCBjcmVhdGUgeW91ciBvd24gcGx1Z2luIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhbiBvYmplY3Qgd2l0aFxubWV0aG9kcyB5b3Ugd2FudCB0byBhZGQgb3Igb3ZlcnJpZGUuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8vIHZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuLy8gdmFyIF8gPSByZXF1aXJlKCcuLi91bmRhc2gnKTtcblxuY29uc3QgQ29tcG9uZW50cyA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMnKTtcblxuY29uc3QgY29tcG9uZW50cyA9IHt9O1xuXG5PYmplY3Qua2V5cyhDb21wb25lbnRzLmZpZWxkcykuZm9yRWFjaChuYW1lID0+IHtcbiAgY29tcG9uZW50c1tuYW1lICsgJ0ZpZWxkJ10gPSBDb21wb25lbnRzLmZpZWxkc1tuYW1lXTtcbn0pO1xuXG5PYmplY3Qua2V5cyhDb21wb25lbnRzLmhlbHBlcnMpLmZvckVhY2gobmFtZSA9PiB7XG4gIGNvbXBvbmVudHNbbmFtZV0gPSBDb21wb25lbnRzLmhlbHBlcnNbbmFtZV07XG59KTtcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgLy8gdmFyIGRlbGVnYXRlVG8gPSB1dGlscy5kZWxlZ2F0b3IoY29uZmlnKTtcblxuICByZXR1cm4ge1xuXG4gICAgLy8gTm9ybWFsaXplIGFuIGVsZW1lbnQgbmFtZS5cbiAgICBlbGVtZW50TmFtZShuYW1lKSB7XG4gICAgICByZXR1cm4gdXRpbHMuZGFzaFRvUGFzY2FsKG5hbWUpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRDbGFzcyhuYW1lKSB7XG4gICAgICBpZiAoIW5hbWUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb21wb25lbnQgY2xhc3MgbmFtZSBtdXN0IGJlIHNwZWNpZmllZCB0byByZXRyaWV2ZSBjb21wb25lbnQgY2xhc3MuJyk7XG4gICAgICB9XG4gICAgICBuYW1lID0gY29uZmlnLmVsZW1lbnROYW1lKG5hbWUpO1xuICAgICAgaWYgKGNvbXBvbmVudHNbbmFtZV0pIHtcbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudHNbbmFtZV07XG4gICAgICB9XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENvbXBvbmVudCBjbGFzcyAke25hbWV9IG5vdCBmb3VuZC5gKTtcbiAgICB9LFxuXG4gICAgaGVscGVyQ2xhc3MobmFtZSkge1xuICAgICAgaWYgKCFuYW1lKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSGVscGVyIGNsYXNzIG5hbWUgbXVzdCBiZSBzcGVjaWZpZWQgdG8gcmV0cmlldmUgY29tcG9uZW50IGNsYXNzLicpO1xuICAgICAgfVxuICAgICAgbmFtZSA9IGNvbmZpZy5lbGVtZW50TmFtZShuYW1lKTtcbiAgICAgIHJldHVybiBjb25maWcuY29tcG9uZW50Q2xhc3MobmFtZSk7XG4gICAgfSxcblxuICAgIGZpZWxkQ2xhc3MobmFtZSkge1xuICAgICAgaWYgKCFuYW1lKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRmllbGQgY2xhc3MgbmFtZSBtdXN0IGJlIHNwZWNpZmllZCB0byByZXRyaWV2ZSBjb21wb25lbnQgY2xhc3MuJyk7XG4gICAgICB9XG4gICAgICBuYW1lICs9ICctZmllbGQnO1xuICAgICAgbmFtZSA9IGNvbmZpZy5lbGVtZW50TmFtZShuYW1lKTtcbiAgICAgIHJldHVybiBjb25maWcuY29tcG9uZW50Q2xhc3MobmFtZSk7XG4gICAgfVxuICB9O1xufTtcbiIsInZhciBfID0ge307XG5cbl8uYXNzaWduID0gXy5leHRlbmQgPSByZXF1aXJlKCdvYmplY3QtYXNzaWduJyk7XG5fLmlzRXF1YWwgPSByZXF1aXJlKCdkZWVwLWVxdWFsJyk7XG5cbi8vIFRoZXNlIGFyZSBub3QgbmVjZXNzYXJpbHkgY29tcGxldGUgaW1wbGVtZW50YXRpb25zLiBUaGV5J3JlIGp1c3QgZW5vdWdoIGZvclxuLy8gd2hhdCdzIHVzZWQgaW4gZm9ybWF0aWMuXG5cbl8uZmxhdHRlbiA9IChhcnJheXMpID0+IFtdLmNvbmNhdC5hcHBseShbXSwgYXJyYXlzKTtcblxuXy5pc1N0cmluZyA9IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZyc7XG5fLmlzVW5kZWZpbmVkID0gdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJztcbl8uaXNPYmplY3QgPSB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnO1xuXy5pc0FycmF5ID0gdmFsdWUgPT4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbl8uaXNOdW1iZXIgPSB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInO1xuXy5pc0Jvb2xlYW4gPSB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJztcbl8uaXNOdWxsID0gdmFsdWUgPT4gdmFsdWUgPT09IG51bGw7XG5fLmlzRnVuY3Rpb24gPSB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbic7XG5cbl8uY2xvbmUgPSB2YWx1ZSA9PiB7XG4gIGlmICghXy5pc09iamVjdCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIF8uaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZS5zbGljZSgpIDogXy5hc3NpZ24oe30sIHZhbHVlKTtcbn07XG5cbl8uZmluZCA9IChpdGVtcywgdGVzdEZuKSA9PiB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAodGVzdEZuKGl0ZW1zW2ldKSkge1xuICAgICAgcmV0dXJuIGl0ZW1zW2ldO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdm9pZCAwO1xufTtcblxuXy5ldmVyeSA9IChpdGVtcywgdGVzdEZuKSA9PiB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoIXRlc3RGbihpdGVtc1tpXSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5fLmVhY2ggPSAob2JqLCBpdGVyYXRlRm4pID0+IHtcbiAgT2JqZWN0LmtleXMob2JqKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgaXRlcmF0ZUZuKG9ialtrZXldLCBrZXkpO1xuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gXztcbiIsIi8vICMgdXRpbHNcblxuLypcbkp1c3Qgc29tZSBzaGFyZWQgdXRpbGl0eSBmdW5jdGlvbnMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gcmVxdWlyZSgnLi91bmRhc2gnKTtcblxudmFyIHV0aWxzID0gZXhwb3J0cztcblxuLy8gQ29weSBvYmogcmVjdXJzaW5nIGRlZXBseS5cbnV0aWxzLmRlZXBDb3B5ID0gZnVuY3Rpb24gKG9iaikge1xuICBpZiAoXy5pc0FycmF5KG9iaikpIHtcbiAgICByZXR1cm4gb2JqLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgcmV0dXJuIHV0aWxzLmRlZXBDb3B5KGl0ZW0pO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKF8uaXNGdW5jdGlvbihvYmopKSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfSBlbHNlIGlmIChfLmlzTnVsbChvYmopKSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfSBlbHNlIGlmIChfLmlzT2JqZWN0KG9iaikpIHtcbiAgICB2YXIgY29weSA9IHt9O1xuICAgIF8uZWFjaChvYmosIGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICBjb3B5W2tleV0gPSB1dGlscy5kZWVwQ29weSh2YWx1ZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGNvcHk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfVxufTtcblxuLy8gQ2FjaGUgZm9yIHN0cmluZ3MgY29udmVydGVkIHRvIFBhc2NhbCBDYXNlLiBUaGlzIHNob3VsZCBiZSBhIGZpbml0ZSBsaXN0LCBzb1xuLy8gbm90IG11Y2ggZmVhciB0aGF0IHdlIHdpbGwgcnVuIG91dCBvZiBtZW1vcnkuXG52YXIgZGFzaFRvUGFzY2FsQ2FjaGUgPSB7fTtcblxuLy8gQ29udmVydCBmb28tYmFyIHRvIEZvb0Jhci5cbnV0aWxzLmRhc2hUb1Bhc2NhbCA9IGZ1bmN0aW9uIChzKSB7XG4gIGlmIChzID09PSAnJykge1xuICAgIHJldHVybiAnJztcbiAgfVxuICBpZiAoIWRhc2hUb1Bhc2NhbENhY2hlW3NdKSB7XG4gICAgZGFzaFRvUGFzY2FsQ2FjaGVbc10gPSBzLnNwbGl0KCctJykubWFwKGZ1bmN0aW9uIChwYXJ0KSB7XG4gICAgICByZXR1cm4gcGFydFswXS50b1VwcGVyQ2FzZSgpICsgcGFydC5zdWJzdHJpbmcoMSk7XG4gICAgfSkuam9pbignJyk7XG4gIH1cbiAgcmV0dXJuIGRhc2hUb1Bhc2NhbENhY2hlW3NdO1xufTtcblxuLy8gQ29weSBhbGwgY29tcHV0ZWQgc3R5bGVzIGZyb20gb25lIERPTSBlbGVtZW50IHRvIGFub3RoZXIuXG51dGlscy5jb3B5RWxlbWVudFN0eWxlID0gZnVuY3Rpb24gKGZyb21FbGVtZW50LCB0b0VsZW1lbnQpIHtcbiAgdmFyIGZyb21TdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGZyb21FbGVtZW50LCAnJyk7XG5cbiAgaWYgKGZyb21TdHlsZS5jc3NUZXh0ICE9PSAnJykge1xuICAgIHRvRWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gZnJvbVN0eWxlLmNzc1RleHQ7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGNzc1J1bGVzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZnJvbVN0eWxlLmxlbmd0aDsgaSsrKSB7XG4gICAgY3NzUnVsZXMucHVzaChmcm9tU3R5bGVbaV0gKyAnOicgKyBmcm9tU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShmcm9tU3R5bGVbaV0pICsgJzsnKTtcbiAgfVxuICB2YXIgY3NzVGV4dCA9IGNzc1J1bGVzLmpvaW4oJycpO1xuXG4gIHRvRWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gY3NzVGV4dDtcbn07XG5cbi8vIE9iamVjdCB0byBob2xkIGJyb3dzZXIgc25pZmZpbmcgaW5mby5cbnZhciBicm93c2VyID0ge1xuICBpc0Nocm9tZTogZmFsc2UsXG4gIGlzTW96aWxsYTogZmFsc2UsXG4gIGlzT3BlcmE6IGZhbHNlLFxuICBpc0llOiBmYWxzZSxcbiAgaXNTYWZhcmk6IGZhbHNlLFxuICBpc1Vua25vd246IGZhbHNlXG59O1xuXG4vLyBTbmlmZiB0aGUgYnJvd3Nlci5cbnZhciB1YSA9ICcnO1xuXG5pZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgdWEgPSBuYXZpZ2F0b3IudXNlckFnZW50O1xufVxuXG5pZih1YS5pbmRleE9mKCdDaHJvbWUnKSA+IC0xKSB7XG4gIGJyb3dzZXIuaXNDaHJvbWUgPSB0cnVlO1xufSBlbHNlIGlmICh1YS5pbmRleE9mKCdTYWZhcmknKSA+IC0xKSB7XG4gIGJyb3dzZXIuaXNTYWZhcmkgPSB0cnVlO1xufSBlbHNlIGlmICh1YS5pbmRleE9mKCdPcGVyYScpID4gLTEpIHtcbiAgYnJvd3Nlci5pc09wZXJhID0gdHJ1ZTtcbn0gZWxzZSBpZiAodWEuaW5kZXhPZignRmlyZWZveCcpID4gLTEpIHtcbiAgYnJvd3Nlci5pc01vemlsbGEgPSB0cnVlO1xufSBlbHNlIGlmICh1YS5pbmRleE9mKCdNU0lFJykgPiAtMSkge1xuICBicm93c2VyLmlzSWUgPSB0cnVlO1xufSBlbHNlIHtcbiAgYnJvd3Nlci5pc1Vua25vd24gPSB0cnVlO1xufVxuXG4vLyBFeHBvcnQgc25pZmZlZCBicm93c2VyIGluZm8uXG51dGlscy5icm93c2VyID0gYnJvd3NlcjtcblxuLy8gQ3JlYXRlIGEgbWV0aG9kIHRoYXQgZGVsZWdhdGVzIHRvIGFub3RoZXIgbWV0aG9kIG9uIHRoZSBzYW1lIG9iamVjdC4gVGhlXG4vLyBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gdXNlcyB0aGlzIGZ1bmN0aW9uIHRvIGRlbGVnYXRlIG9uZSBtZXRob2QgdG8gYW5vdGhlci5cbnV0aWxzLmRlbGVnYXRlVG8gPSBmdW5jdGlvbiAobmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzW25hbWVdLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH07XG59O1xuXG51dGlscy5kZWxlZ2F0b3IgPSBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiBmdW5jdGlvbiAobmFtZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gb2JqW25hbWVdLmFwcGx5KG9iaiwgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9O1xufTtcblxudXRpbHMuY2FwaXRhbGl6ZSA9IGZ1bmN0aW9uKHMpIHtcbiAgcmV0dXJuIHMuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzLnN1YnN0cmluZygxKS50b0xvd2VyQ2FzZSgpO1xufTtcbiIsInZhciBwU2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG52YXIgb2JqZWN0S2V5cyA9IHJlcXVpcmUoJy4vbGliL2tleXMuanMnKTtcbnZhciBpc0FyZ3VtZW50cyA9IHJlcXVpcmUoJy4vbGliL2lzX2FyZ3VtZW50cy5qcycpO1xuXG52YXIgZGVlcEVxdWFsID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYWN0dWFsLCBleHBlY3RlZCwgb3B0cykge1xuICBpZiAoIW9wdHMpIG9wdHMgPSB7fTtcbiAgLy8gNy4xLiBBbGwgaWRlbnRpY2FsIHZhbHVlcyBhcmUgZXF1aXZhbGVudCwgYXMgZGV0ZXJtaW5lZCBieSA9PT0uXG4gIGlmIChhY3R1YWwgPT09IGV4cGVjdGVkKSB7XG4gICAgcmV0dXJuIHRydWU7XG5cbiAgfSBlbHNlIGlmIChhY3R1YWwgaW5zdGFuY2VvZiBEYXRlICYmIGV4cGVjdGVkIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgIHJldHVybiBhY3R1YWwuZ2V0VGltZSgpID09PSBleHBlY3RlZC5nZXRUaW1lKCk7XG5cbiAgLy8gNy4zLiBPdGhlciBwYWlycyB0aGF0IGRvIG5vdCBib3RoIHBhc3MgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnLFxuICAvLyBlcXVpdmFsZW5jZSBpcyBkZXRlcm1pbmVkIGJ5ID09LlxuICB9IGVsc2UgaWYgKHR5cGVvZiBhY3R1YWwgIT0gJ29iamVjdCcgJiYgdHlwZW9mIGV4cGVjdGVkICE9ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIG9wdHMuc3RyaWN0ID8gYWN0dWFsID09PSBleHBlY3RlZCA6IGFjdHVhbCA9PSBleHBlY3RlZDtcblxuICAvLyA3LjQuIEZvciBhbGwgb3RoZXIgT2JqZWN0IHBhaXJzLCBpbmNsdWRpbmcgQXJyYXkgb2JqZWN0cywgZXF1aXZhbGVuY2UgaXNcbiAgLy8gZGV0ZXJtaW5lZCBieSBoYXZpbmcgdGhlIHNhbWUgbnVtYmVyIG9mIG93bmVkIHByb3BlcnRpZXMgKGFzIHZlcmlmaWVkXG4gIC8vIHdpdGggT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKSwgdGhlIHNhbWUgc2V0IG9mIGtleXNcbiAgLy8gKGFsdGhvdWdoIG5vdCBuZWNlc3NhcmlseSB0aGUgc2FtZSBvcmRlciksIGVxdWl2YWxlbnQgdmFsdWVzIGZvciBldmVyeVxuICAvLyBjb3JyZXNwb25kaW5nIGtleSwgYW5kIGFuIGlkZW50aWNhbCAncHJvdG90eXBlJyBwcm9wZXJ0eS4gTm90ZTogdGhpc1xuICAvLyBhY2NvdW50cyBmb3IgYm90aCBuYW1lZCBhbmQgaW5kZXhlZCBwcm9wZXJ0aWVzIG9uIEFycmF5cy5cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gb2JqRXF1aXYoYWN0dWFsLCBleHBlY3RlZCwgb3B0cyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWRPck51bGwodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIGlzQnVmZmVyICh4KSB7XG4gIGlmICgheCB8fCB0eXBlb2YgeCAhPT0gJ29iamVjdCcgfHwgdHlwZW9mIHgubGVuZ3RoICE9PSAnbnVtYmVyJykgcmV0dXJuIGZhbHNlO1xuICBpZiAodHlwZW9mIHguY29weSAhPT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgeC5zbGljZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAoeC5sZW5ndGggPiAwICYmIHR5cGVvZiB4WzBdICE9PSAnbnVtYmVyJykgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gb2JqRXF1aXYoYSwgYiwgb3B0cykge1xuICB2YXIgaSwga2V5O1xuICBpZiAoaXNVbmRlZmluZWRPck51bGwoYSkgfHwgaXNVbmRlZmluZWRPck51bGwoYikpXG4gICAgcmV0dXJuIGZhbHNlO1xuICAvLyBhbiBpZGVudGljYWwgJ3Byb3RvdHlwZScgcHJvcGVydHkuXG4gIGlmIChhLnByb3RvdHlwZSAhPT0gYi5wcm90b3R5cGUpIHJldHVybiBmYWxzZTtcbiAgLy9+fn5JJ3ZlIG1hbmFnZWQgdG8gYnJlYWsgT2JqZWN0LmtleXMgdGhyb3VnaCBzY3Jld3kgYXJndW1lbnRzIHBhc3NpbmcuXG4gIC8vICAgQ29udmVydGluZyB0byBhcnJheSBzb2x2ZXMgdGhlIHByb2JsZW0uXG4gIGlmIChpc0FyZ3VtZW50cyhhKSkge1xuICAgIGlmICghaXNBcmd1bWVudHMoYikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgYSA9IHBTbGljZS5jYWxsKGEpO1xuICAgIGIgPSBwU2xpY2UuY2FsbChiKTtcbiAgICByZXR1cm4gZGVlcEVxdWFsKGEsIGIsIG9wdHMpO1xuICB9XG4gIGlmIChpc0J1ZmZlcihhKSkge1xuICAgIGlmICghaXNCdWZmZXIoYikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGEubGVuZ3RoICE9PSBiLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICAgIGZvciAoaSA9IDA7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoYVtpXSAhPT0gYltpXSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICB0cnkge1xuICAgIHZhciBrYSA9IG9iamVjdEtleXMoYSksXG4gICAgICAgIGtiID0gb2JqZWN0S2V5cyhiKTtcbiAgfSBjYXRjaCAoZSkgey8vaGFwcGVucyB3aGVuIG9uZSBpcyBhIHN0cmluZyBsaXRlcmFsIGFuZCB0aGUgb3RoZXIgaXNuJ3RcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy8gaGF2aW5nIHRoZSBzYW1lIG51bWJlciBvZiBvd25lZCBwcm9wZXJ0aWVzIChrZXlzIGluY29ycG9yYXRlc1xuICAvLyBoYXNPd25Qcm9wZXJ0eSlcbiAgaWYgKGthLmxlbmd0aCAhPSBrYi5sZW5ndGgpXG4gICAgcmV0dXJuIGZhbHNlO1xuICAvL3RoZSBzYW1lIHNldCBvZiBrZXlzIChhbHRob3VnaCBub3QgbmVjZXNzYXJpbHkgdGhlIHNhbWUgb3JkZXIpLFxuICBrYS5zb3J0KCk7XG4gIGtiLnNvcnQoKTtcbiAgLy9+fn5jaGVhcCBrZXkgdGVzdFxuICBmb3IgKGkgPSBrYS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGlmIChrYVtpXSAhPSBrYltpXSlcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvL2VxdWl2YWxlbnQgdmFsdWVzIGZvciBldmVyeSBjb3JyZXNwb25kaW5nIGtleSwgYW5kXG4gIC8vfn5+cG9zc2libHkgZXhwZW5zaXZlIGRlZXAgdGVzdFxuICBmb3IgKGkgPSBrYS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGtleSA9IGthW2ldO1xuICAgIGlmICghZGVlcEVxdWFsKGFba2V5XSwgYltrZXldLCBvcHRzKSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0eXBlb2YgYSA9PT0gdHlwZW9mIGI7XG59XG4iLCJ2YXIgc3VwcG9ydHNBcmd1bWVudHNDbGFzcyA9IChmdW5jdGlvbigpe1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFyZ3VtZW50cylcbn0pKCkgPT0gJ1tvYmplY3QgQXJndW1lbnRzXSc7XG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHN1cHBvcnRzQXJndW1lbnRzQ2xhc3MgPyBzdXBwb3J0ZWQgOiB1bnN1cHBvcnRlZDtcblxuZXhwb3J0cy5zdXBwb3J0ZWQgPSBzdXBwb3J0ZWQ7XG5mdW5jdGlvbiBzdXBwb3J0ZWQob2JqZWN0KSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqZWN0KSA9PSAnW29iamVjdCBBcmd1bWVudHNdJztcbn07XG5cbmV4cG9ydHMudW5zdXBwb3J0ZWQgPSB1bnN1cHBvcnRlZDtcbmZ1bmN0aW9uIHVuc3VwcG9ydGVkKG9iamVjdCl7XG4gIHJldHVybiBvYmplY3QgJiZcbiAgICB0eXBlb2Ygb2JqZWN0ID09ICdvYmplY3QnICYmXG4gICAgdHlwZW9mIG9iamVjdC5sZW5ndGggPT0gJ251bWJlcicgJiZcbiAgICBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCAnY2FsbGVlJykgJiZcbiAgICAhT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKG9iamVjdCwgJ2NhbGxlZScpIHx8XG4gICAgZmFsc2U7XG59O1xuIiwiZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gdHlwZW9mIE9iamVjdC5rZXlzID09PSAnZnVuY3Rpb24nXG4gID8gT2JqZWN0LmtleXMgOiBzaGltO1xuXG5leHBvcnRzLnNoaW0gPSBzaGltO1xuZnVuY3Rpb24gc2hpbSAob2JqKSB7XG4gIHZhciBrZXlzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBvYmopIGtleXMucHVzaChrZXkpO1xuICByZXR1cm4ga2V5cztcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gVG9PYmplY3QodmFsKSB7XG5cdGlmICh2YWwgPT0gbnVsbCkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ09iamVjdC5hc3NpZ24gY2Fubm90IGJlIGNhbGxlZCB3aXRoIG51bGwgb3IgdW5kZWZpbmVkJyk7XG5cdH1cblxuXHRyZXR1cm4gT2JqZWN0KHZhbCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0LCBzb3VyY2UpIHtcblx0dmFyIGZyb207XG5cdHZhciBrZXlzO1xuXHR2YXIgdG8gPSBUb09iamVjdCh0YXJnZXQpO1xuXG5cdGZvciAodmFyIHMgPSAxOyBzIDwgYXJndW1lbnRzLmxlbmd0aDsgcysrKSB7XG5cdFx0ZnJvbSA9IGFyZ3VtZW50c1tzXTtcblx0XHRrZXlzID0gT2JqZWN0LmtleXMoT2JqZWN0KGZyb20pKTtcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dG9ba2V5c1tpXV0gPSBmcm9tW2tleXNbaV1dO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiB0bztcbn07XG4iXX0=
