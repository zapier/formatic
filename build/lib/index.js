'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = _interopDefault(require('react'));
var createReactClass = _interopDefault(require('create-react-class'));
var objectAssign = _interopDefault(require('object-assign'));
var deepEqual = _interopDefault(require('deep-equal'));
var ReactDOM = _interopDefault(require('react-dom'));
var reactTransitionGroup = require('react-transition-group');
var cx = _interopDefault(require('classnames'));
var PropTypes = _interopDefault(require('prop-types'));
var update = _interopDefault(require('immutability-helper'));
var ScrollLock = _interopDefault(require('react-scroll-lock'));

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};



















var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var _ = {};

_.assign = _.extend = objectAssign;
_.isEqual = deepEqual;

// These are not necessarily complete implementations. They're just enough for
// what's used in formatic.

_.flatten = function (arrays) {
  return [].concat.apply([], arrays);
};
_.compact = function (array) {
  return (array || []).filter(Boolean);
};

_.isString = function (value) {
  return typeof value === 'string';
};
_.isUndefined = function (value) {
  return typeof value === 'undefined';
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

_.isObject = function (value) {
  var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);
  return !!value && (type === 'object' || type === 'function');
};

_.clone = function (value) {
  if (!_.isObject(value)) {
    return value;
  }
  return _.isArray(value) ? value.slice() : _.assign({}, value);
};

_.find = function (items, testFn) {
  for (var i = 0; i < items.length; i++) {
    if (testFn(items[i], i)) {
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

_.any = function (items, testFn) {
  for (var i = 0; i < items.length; i++) {
    if (testFn(items[i])) {
      return true;
    }
  }
  return false;
};

_.each = function (obj, iterateFn) {
  Object.keys(obj).forEach(function (key) {
    iterateFn(obj[key], key);
  });
};

_.now = Date.now || function () {
  return new Date().getTime();
};

_.debounce = function (func, wait, immediate) {
  var timeout, args, context, timestamp, result;

  var later = function later() {
    var last = _.now() - timestamp;

    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) {
          context = args = null;
        }
      }
    }
  };

  return function () {
    context = this;
    args = arguments;
    timestamp = _.now();
    var callNow = immediate && !timeout;
    if (!timeout) {
      timeout = setTimeout(later, wait);
    }
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };
};

// # utils

/*
Just some shared utility functions.
*/

var utils = {};

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
  if (s === '') {
    return '';
  }
  if (!dashToPascalCache[s]) {
    dashToPascalCache[s] = s.split('-').map(function (part) {
      return part[0].toUpperCase() + part.substring(1);
    }).join('');
  }
  return dashToPascalCache[s];
};

// Copy all computed styles from one DOM element to another.
utils.copyElementStyle = function (fromElement, toElement) {
  var fromStyle = window.getComputedStyle(fromElement, '');

  if (fromStyle.cssText !== '') {
    toElement.style.cssText = fromStyle.cssText;
    return;
  }

  var cssRules = [];
  for (var i = 0; i < fromStyle.length; i++) {
    cssRules.push(fromStyle[i] + ':' + fromStyle.getPropertyValue(fromStyle[i]) + ';');
  }
  var cssText = cssRules.join('');

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
var ua = '';

if (typeof navigator !== 'undefined') {
  ua = navigator.userAgent;
}

if (ua.indexOf('Chrome') > -1) {
  browser.isChrome = true;
} else if (ua.indexOf('Safari') > -1) {
  browser.isSafari = true;
} else if (ua.indexOf('Opera') > -1) {
  browser.isOpera = true;
} else if (ua.indexOf('Firefox') > -1) {
  browser.isMozilla = true;
} else if (ua.indexOf('MSIE') > -1) {
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

var keyCodes = utils.keyCodes = {
  UP: 38,
  DOWN: 40,
  ENTER: 13,
  ESC: 27,
  '[': 219,
  SHIFT: 16,
  '2': 50
};

// utils.scrollIntoViewIfOutside = (node, container) => {
//   if (node && container) {
//     const nodeRect = node.getBoundingClientRect();
//     const containerRect = container.getBoundingClientRect();
//     if (nodeRect.bottom > containerRect.bottom || nodeRect.top < containerRect.top) {
//       node.scrollIntoView(false);
//     }
//   }
// };

var scrollIntoContainerView = utils.scrollIntoContainerView = function (node, container) {
  if (node && container) {
    var nodeRect = node.getBoundingClientRect();
    var containerRect = container.getBoundingClientRect();
    var offset = 0;
    if (nodeRect.bottom > containerRect.bottom) {
      offset = nodeRect.bottom - containerRect.bottom;
    } else if (nodeRect.top < containerRect.top) {
      offset = nodeRect.top - containerRect.top;
    }
    if (offset !== 0) {
      container.scrollTop = container.scrollTop + offset;
    }
  }
};

var focusRefNode = utils.focusRefNode = function (ref) {
  if (ref) {
    var node = ReactDOM.findDOMNode(ref);
    node.focus();
  }
};

var ref = utils.ref = function (component, key) {
  return function (node) {
    component[key + 'Ref'] = node;
  };
};

// # field mixin

/*
This mixin gets mixed into all field components.
*/

var FieldMixin = {

  // Signal a change in value.
  onChangeValue: function onChangeValue(value) {
    this.props.onChange(value, {
      field: this.props.field
    });
  },

  // Bubble up a value.
  onBubbleValue: function onBubbleValue(value, info) {
    this.props.onChange(value, info);
  },

  // Start an action bubbling up through parent components.
  onStartAction: function onStartAction(action, props) {
    if (this.props.onAction) {
      var info = _.extend({}, props);
      info.action = action;
      info.field = this.props.field;
      this.props.onAction(info);
    }
  },

  onFocusAction: function onFocusAction() {
    this.onStartAction('focus');
  },

  onBlurAction: function onBlurAction() {
    this.onStartAction('blur');
  },

  // Bubble up an action.
  onBubbleAction: function onBubbleAction(info) {
    if (this.props.onAction) {
      this.props.onAction(info);
    }
  },

  // Delegate rendering back to config so it can be wrapped.
  renderWithConfig: function renderWithConfig() {
    return this.props.config.renderFieldComponent(this);
  },

  isReadOnly: function isReadOnly() {
    return this.props.config.fieldIsReadOnly(this.props.field);
  }
};

// # fields component

/*
Render a field to edit the values of an object with static properties.
*/

var FieldsField = createReactClass({

  displayName: 'Fields',

  mixins: [FieldMixin],

  onChangeField: function onChangeField(key, newValue, info) {
    if (!key) {
      var parentPath = this.props.config.fieldValuePath(this.props.field);
      var childPath = this.props.config.fieldValuePath(info.field).slice(parentPath.length);
      key = childPath[0];
      if (key) {
        newValue = newValue[key];
      }
    }
    if (key) {
      var newObjectValue = _.extend({}, this.props.field.value);
      newObjectValue[key] = newValue;
      this.onBubbleValue(newObjectValue, info);
    }
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;

    var fields = config.createChildFields(field);

    // Want to move to fieldset with legend, but doing a little backward-compatible
    // hacking here, only converting child `fields` without keys.
    var isGroup = !!(field.parent && !field.key);

    var classes = _.extend({}, this.props.classes);

    if (isGroup) {
      classes['child-fields-group'] = true;
    }

    var legend = !isGroup ? null : React.createElement(
      'legend',
      null,
      config.fieldLabel(field)
    );

    var help = !isGroup ? null : config.createElement('help', {
      config: config,
      field: field
    });

    var content = fields.map(function (childField, i) {
      var key = childField.key || i;
      return config.createFieldElement({
        key: key || i,
        field: childField,
        onChange: this.onChangeField.bind(this, childField.key), onAction: this.onBubbleAction
      });
    }.bind(this));

    return config.createElement('field', {
      config: config, field: field, plain: isGroup || this.props.plain
    }, React.createElement(
      'fieldset',
      { className: cx(classes) },
      legend,
      help,
      content
    ));
  }

});

// # fields component

/*
Render a fields in groups. Grouped by field.groupKey property.
*/

var groupFields = function groupFields(fields, humanize) {
  var groupedFields = [];

  fields.forEach(function (field) {
    if (field.groupKey) {
      var group = _.find(groupedFields, function (g) {
        return g.isGroup && field.groupKey === g.key;
      });

      if (!group) {
        group = {
          key: field.groupKey,
          label: field.groupLabel || humanize(field.groupKey),
          children: [],
          isGroup: true
        };
        groupedFields.push(group);
      }

      group.children.push(field);
    } else {
      groupedFields.push(field); // top level field
    }
  });

  return groupedFields;
};

var GroupedFieldsField = createReactClass({

  displayName: 'GroupedFields',

  mixins: [FieldMixin],

  onChangeField: function onChangeField(key, newValue, info) {
    if (key) {
      var newObjectValue = _.extend({}, this.props.field.value);
      newObjectValue[key] = newValue;
      this.onBubbleValue(newObjectValue, info);
    }
  },

  renderFields: function renderFields(fields, groupKey, groupLabel) {
    var config = this.props.config;
    var self = this;

    var childFields = fields.map(function (fieldOrGroup) {
      if (fieldOrGroup.isGroup) {
        return self.renderFields(fieldOrGroup.children, fieldOrGroup.key, fieldOrGroup.label);
      }

      var key = fieldOrGroup.key;
      return config.createFieldElement({
        key: key,
        field: fieldOrGroup,
        onChange: self.onChangeField.bind(self, key),
        onAction: self.onBubbleAction
      });
    });

    var legend;
    var className = cx(this.props.classes);

    if (groupLabel) {
      legend = React.createElement(
        'legend',
        null,
        groupLabel
      );
      className += ' child-fields-group';
    }

    return React.createElement(
      'fieldset',
      { key: groupKey, className: className },
      legend,
      childFields
    );
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;

    var fields = groupFields(config.createChildFields(field), config.humanize);

    return config.createElement('field', {
      config: config, field: field, plain: this.props.plain
    }, this.renderFields(fields));
  }

});

// # string component

/*
Render a field that can edit a string value.
*/

var StringField = createReactClass({

  displayName: 'String',

  mixins: [FieldMixin],

  onChange: function onChange(event) {
    this.onChangeValue(event.target.value);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;

    return config.createElement('field', {
      config: config, field: field, plain: this.props.plain
    }, React.createElement('textarea', {
      value: field.value,
      className: cx(this.props.classes),
      rows: field.rows || this.props.rows,
      onChange: this.onChange,
      onFocus: this.onFocusAction,
      onBlur: this.onBlurAction,
      disabled: this.isReadOnly() }));
  }
});

// # single-line-string component

/*
Render a single line text input.
*/

var SingleLineStringField = createReactClass({

  displayName: 'SingleLineString',

  mixins: [FieldMixin],

  onChange: function onChange(event) {
    this.onChangeValue(event.target.value);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;
    var field = this.props.field;

    var readOnly = config.fieldIsReadOnly(field);
    var tabIndex = readOnly ? -1 : this.props.tabIndex || 0;

    return config.createElement('field', {
      config: config, field: field, plain: this.props.plain
    }, React.createElement('input', {
      tabIndex: tabIndex,
      type: 'text',
      value: this.props.field.value,
      className: cx(this.props.classes),
      onChange: this.onChange,
      onFocus: this.onFocusAction,
      onBlur: this.onBlurAction,
      autoComplete: field.autoComplete,
      autoFocus: field.autoFocus,
      placeholder: field.placeholder,
      readOnly: readOnly }));
  }
});

// # single-line-string component

/*
Render a single line text input.
*/

var PasswordField = createReactClass({

  displayName: 'Password',

  mixins: [FieldMixin],

  onChange: function onChange(event) {
    this.onChangeValue(event.target.value);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;
    var field = this.props.field;

    return config.createElement('field', {
      config: config, field: field, plain: this.props.plain
    }, React.createElement('input', {
      type: 'password',
      value: this.props.field.value,
      className: cx(this.props.classes),
      onChange: this.onChange,
      onFocus: this.onFocusAction,
      onBlur: this.onBlurAction,
      autoComplete: field.autoComplete,
      autoFocus: field.autoFocus,
      placeholder: field.placeholder,
      disabled: this.isReadOnly() }));
  }
});

// # select component

/*
Render select element to give a user choices for the value of a field. Note
it should support values other than strings. Currently this is only tested for
boolean values, but it _should_ work for other values.
*/

var SelectField = createReactClass({

  displayName: 'Select',

  mixins: [FieldMixin],

  getInitialState: function getInitialState() {
    return {
      choices: this.props.config.fieldChoices(this.props.field)
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(newProps) {
    this.setState({
      choices: newProps.config.fieldChoices(newProps.field)
    });
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;
    var field = this.props.field;

    return config.createElement('field', {
      config: config, field: field, plain: this.props.plain
    }, config.createElement('select-value', {
      choices: this.state.choices, field: field, onChange: this.onChangeValue, onAction: this.onBubbleAction
    }));
  }
});

// # select component

/*
Render select element to give a user choices for the value of a field. Renders non-native
select drop down and supports fancier renderings.
*/

var PrettySelectField = createReactClass({

  displayName: 'PrettySelect',

  mixins: [FieldMixin],

  getInitialState: function getInitialState() {
    return {
      choices: this.props.config.fieldPrettyChoices(this.props.field)
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(newProps) {
    this.setState({
      choices: newProps.config.fieldPrettyChoices(newProps.field)
    });
  },

  render: function render() {
    return this.renderWithConfig();
  },

  onChange: function onChange(value, info) {
    if (info && info.isCustomValue) {
      this.props.onChange(value, {
        field: this.props.field,
        isCustomValue: true
      });
    } else {
      this.onChangeValue(value);
    }
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;
    var field = this.props.field;

    return config.createElement('field', {
      config: config, field: field, plain: this.props.plain, classes: this.props.classes
    }, config.createElement('pretty-select-value', {
      choices: this.state.choices, isAccordion: field.isAccordion, isAccordionAlwaysCollapsable: field.isAccordionAlwaysCollapsable, field: field, onChange: this.onChange, onAction: this.onBubbleAction
    }));
  }
});

// # boolean component

/*
Render a dropdown to handle yes/no boolean values.
*/

var BooleanField = createReactClass({

  displayName: 'Boolean',

  mixins: [FieldMixin],

  onChange: function onChange(newValue) {
    this.onChangeValue(newValue);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;
    var field = this.props.field;

    var choices = config.fieldBooleanChoices(field);

    return config.createElement('field', {
      field: field, plain: this.props.plain
    }, config.createElement('select-value', {
      choices: choices, field: field, onChange: this.onChange, onAction: this.onBubbleAction
    }));
  }
});

// # pretty boolean component

/*
Render pretty boolean component with non-native drop-down
*/

var PrettyBooleanField = createReactClass({

  displayName: 'PrettyBoolean',

  mixins: [FieldMixin],

  onChange: function onChange(newValue) {
    this.onChangeValue(newValue);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;

    var choices = config.fieldBooleanChoices(field);

    return config.createElement('field', {
      field: field, plain: this.props.plain
    }, config.createElement('pretty-select-value', {
      choices: choices, field: field, onChange: this.onChange, onAction: this.onBubbleAction
    }));
  }
});

// # checkbox-boolean component

/*
Render a field that can edit a boolean with a checkbox.
*/

var CheckboxBooleanField = createReactClass({

  displayName: 'CheckboxBoolean',

  mixins: [FieldMixin],

  onChange: function onChange(event) {
    this.onChangeValue(event.target.checked);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;
    var field = this.props.field;

    var fieldLabelOrHelp = config.fieldHelpText(field) || config.fieldLabel(field);

    return config.createElement('field', {
      config: config, field: field, plain: true
    }, React.createElement(
      'span',
      { style: { whiteSpace: 'nowrap' } },
      React.createElement('input', {
        type: 'checkbox',
        checked: field.value,
        className: cx(this.props.classes),
        onChange: this.onChange,
        onFocus: this.onFocusAction,
        onBlur: this.onBlurAction,
        disabled: this.isReadOnly()
      }),
      React.createElement(
        'span',
        null,
        ' '
      ),
      React.createElement(
        'span',
        null,
        fieldLabelOrHelp
      )
    ));
  }
});

/* global CodeMirror */
/*eslint no-script-url:0 */

/*
  A very trimmed down field that uses CodeMirror for syntax highlighting *only*.
 */
var CodeField = createReactClass({
  displayName: 'Code',

  mixins: [FieldMixin],

  componentDidMount: function componentDidMount() {
    this.createCodeMirrorEditor();
  },

  componentWillUnmount: function componentWillUnmount() {
    this.removeCodeMirrorEditor();
  },

  getInitialState: function getInitialState() {
    return {
      value: this.props.field.value
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.field.value });
  },

  tabIndex: function tabIndex() {
    if (this.isReadOnly()) {
      return null;
    }
    return this.props.field.tabIndex || 0;
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;
    var props = { field: field, plain: this.props.plain };

    var textBoxClasses = cx(_.extend({}, this.props.classes, { 'pretty-text-box': true }));

    // Render read-only version.
    var element = React.createElement(
      'div',
      { className: 'pretty-text-wrapper' },
      React.createElement(
        'div',
        { className: textBoxClasses, tabIndex: this.tabIndex(), onFocus: this.onFocusAction, onBlur: this.onBlurAction },
        React.createElement('div', { ref: ref(this, 'textBox'), className: 'internal-text-wrapper' })
      )
    );

    return config.createElement('field', props, element);
  },

  createCodeMirrorEditor: function createCodeMirrorEditor() {
    var config = this.props.config;
    var field = this.props.field;
    var readOnly = config.fieldIsReadOnly(field);

    var options = {
      lineWrapping: true,
      tabindex: this.tabIndex(),
      value: String(this.state.value),
      mode: this.props.field.language || null,
      indentWithTabs: false,
      indentUnit: 2,
      tabSize: 2,
      extraKeys: {
        Tab: function Tab(cm) {
          if (_.any(cm.getSelections(), Boolean)) {
            cm.execCommand('defaultTab');
          } else {
            cm.execCommand('insertSoftTab');
          }
        },
        'Shift-Tab': function ShiftTab(cm) {
          cm.execCommand('indentLess');
        }
      },
      readOnly: readOnly ? 'nocursor' : false // 'nocursor' means read only and not focusable
    };

    if (this.props.field.language === 'python') {
      options.indentUnit = 4;
      options.tabSize = 4;
    }

    if (this.props.field.codeMirrorOptions) {
      options = _.extend({}, options, this.props.field.codeMirrorOptions);
    }

    var textBox = this.textBoxRef;
    this.codeMirror = CodeMirror(textBox, options);
    this.codeMirror.on('change', this.onCodeMirrorChange);
  },

  removeCodeMirrorEditor: function removeCodeMirrorEditor() {
    var textBoxNode = this.textBoxRef;
    var cmNode = textBoxNode.firstChild;
    textBoxNode.removeChild(cmNode);
    this.codeMirror.off('change', this.onCodeMirrorChange);
    this.codeMirror = null;
  },

  onCodeMirrorChange: function onCodeMirrorChange() {
    if (this.updatingCodeMirror) {
      // avoid recursive update cycle, and mark the code mirror manual update as done
      this.updatingCodeMirror = false;
      return;
    }

    var newValue = this.codeMirror.getValue();
    this.onChangeValue(newValue);
    this.setState({ value: newValue });
  }

});

/*eslint no-script-url:0 */

/*
   Wraps a PrettyTextInput to be a stand alone field.
 */
var PrettyTextField = createReactClass({

  displayName: 'PrettyText',

  mixins: [FieldMixin],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;
    var field = this.props.field;
    var props = { field: field, plain: this.props.plain };

    var readOnly = config.fieldIsReadOnly(field);

    // The tab index makes this control focusable and editable. If read only, no tabIndex
    var tabIndex = readOnly ? null : field.tabIndex;

    var element = config.createElement('pretty-text-input', {
      classes: this.props.classes,
      tabIndex: tabIndex,
      onChange: this.onChangeValue,
      onFocus: this.onFocusAction,
      onBlur: this.onBlurAction,
      onAction: this.onBubbleAction,
      field: this.props.field,
      value: this.props.field.value,
      isAccordion: this.props.field.isAccordion,
      selectedChoices: this.props.config.fieldSelectedReplaceChoices(this.props.field),
      replaceChoices: this.props.config.fieldReplaceChoices(this.props.field),
      readOnly: readOnly
    });

    return config.createElement('field', props, element);
  }
});

// # helper mixin

/*
This gets mixed into all helper components.
*/

var HelperMixin = {

  // Delegate rendering back to config so it can be wrapped.
  renderWithConfig: function renderWithConfig() {
    return this.props.config.renderComponent(this);
  },

  // Start an action bubbling up through parent components.
  onStartAction: function onStartAction(action, props) {
    if (this.props.onAction) {
      var info = _.extend({}, props);
      info.action = action;
      info.field = this.props.field;
      this.props.onAction(info);
    }
  },

  // Bubble up an action.
  onBubbleAction: function onBubbleAction(info) {
    if (this.props.onAction) {
      this.props.onAction(info);
    }
  },

  onFocusAction: function onFocusAction() {
    this.onStartAction('focus');
  },

  onBlurAction: function onBlurAction() {
    this.onStartAction('blur');
  },

  isReadOnly: function isReadOnly() {
    return this.props.config.fieldIsReadOnly(this.props.field);
  },

  hasReadOnlyControls: function hasReadOnlyControls() {
    return this.props.config.fieldHasReadOnlyControls(this.props.field);
  }
};

// # pretty-tag component

/*
   Pretty text tag
 */

var PrettyTagField = createReactClass({

  displayName: 'PrettyTag',

  propTypes: {
    onClick: PropTypes.func,
    classes: PropTypes.object
  },

  mixins: [HelperMixin],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var classes = cx(_.extend({}, this.props.classes, { 'pretty-part': true }));

    return React.createElement(
      'span',
      { className: classes, onClick: this.props.onClick },
      this.props.children
    );
  }
});

// # array component

/*
Render a field to edit array values.
*/

var ArrayField = createReactClass({

  displayName: 'Array',

  mixins: [FieldMixin],

  nextLookupId: 0,

  getInitialState: function getInitialState() {

    // Need to create artificial keys for the array. Indexes are not good keys,
    // since they change. So, map each position to an artificial key
    var lookups = [];

    var items = this.props.field.value;
    if (!Array.isArray(items)) {
      if (items !== null && items !== undefined) {
        items = [items];
      } else {
        items = [];
      }
    }

    items.forEach(function (item, i) {
      lookups[i] = '_' + this.nextLookupId;
      this.nextLookupId++;
    }.bind(this));

    return {
      lookups: lookups
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(newProps) {

    var lookups = this.state.lookups;

    var items = newProps.field.value;

    // Need to set artificial keys for new array items.
    if (items.length > lookups.length) {
      for (var i = lookups.length; i < items.length; i++) {
        lookups[i] = '_' + this.nextLookupId;
        this.nextLookupId++;
      }
    }

    this.setState({
      lookups: lookups
    });
  },

  onChange: function onChange(i, newValue, info) {
    var newArrayValue = this.props.field.value.slice(0);
    newArrayValue[i] = newValue;
    this.onBubbleValue(newArrayValue, info);
  },

  onAppend: function onAppend(itemChoiceIndex) {
    var config = this.props.config;
    var field = this.props.field;

    var newValue = config.createNewChildFieldValue(field, itemChoiceIndex);

    var items = field.value;

    items = items.concat(newValue);

    this.onChangeValue(items);
  },

  onRemove: function onRemove(i) {
    var lookups = this.state.lookups;
    lookups.splice(i, 1);
    this.setState({
      lookups: lookups
    });
    var newItems = this.props.field.value.slice(0);
    newItems.splice(i, 1);
    this.onChangeValue(newItems);
  },

  onMove: function onMove(fromIndex, toIndex) {
    var lookups = this.state.lookups;
    var fromId = lookups[fromIndex];
    var toId = lookups[toIndex];
    lookups[fromIndex] = toId;
    lookups[toIndex] = fromId;
    this.setState({
      lookups: lookups
    });

    var newItems = this.props.field.value.slice(0);
    if (fromIndex !== toIndex && fromIndex >= 0 && fromIndex < newItems.length && toIndex >= 0 && toIndex < newItems.length) {
      newItems.splice(toIndex, 0, newItems.splice(fromIndex, 1)[0]);
    }
    this.onChangeValue(newItems);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;
    var field = this.props.field;

    var fields = config.createChildFields(field);

    var arrayControl = void 0;
    if (!config.fieldIsReadOnly(field)) {
      arrayControl = config.createElement('array-control', { field: field, onAppend: this.onAppend });
    }

    var tabIndex = this.isReadOnly() ? null : this.props.tabIndex || 0;

    var numItems = field.value.length;

    var content = config.cssTransitionWrapper(fields.map(function (childField, i) {
      return config.createElement('array-item', {
        key: this.state.lookups[i],
        field: childField,
        index: i,
        numItems: numItems,
        onMove: this.onMove,
        onRemove: this.onRemove,
        onChange: this.onChange,
        onAction: this.onBubbleAction
      });
    }.bind(this)));

    return config.createElement('field', {
      field: field,
      plain: this.props.plain
    }, React.createElement(
      'div',
      { className: cx(this.props.classes), tabIndex: tabIndex },
      content,
      arrayControl
    ));
  }
});

// # checkbox-array component

/*
Used with array values to supply multiple checkboxes for adding multiple
enumerated values to an array.
*/

var CheckboxArrayField = createReactClass({

  displayName: 'CheckboxArray',

  mixins: [FieldMixin],

  getInitialState: function getInitialState() {
    return {
      choices: this.props.config.fieldChoices(this.props.field)
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(newProps) {
    this.setState({
      choices: newProps.config.fieldChoices(newProps.field)
    });
  },

  onChange: function onChange() {
    // Get all the checked checkboxes and convert to an array of values.
    var choiceNodes = this.choicesRef.getElementsByTagName('input');
    choiceNodes = Array.prototype.slice.call(choiceNodes, 0);
    var values = choiceNodes.map(function (node) {
      return node.checked ? node.value : null;
    }).filter(function (value) {
      return value;
    });
    this.onChangeValue(values);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;
    var field = this.props.field;

    var choices = this.state.choices || [];

    var isInline = !_.find(choices, function (choice) {
      return choice.sample;
    });

    var inputs = choices.map(function (choice, i) {
      var inputField = React.createElement(
        'span',
        { style: { whiteSpace: 'nowrap' } },
        React.createElement('input', {
          name: field.key,
          type: 'checkbox',
          value: choice.value,
          checked: field.value.indexOf(choice.value) >= 0 ? true : false,
          onChange: this.onChange,
          onFocus: this.onFocusAction,
          onBlur: this.onBlurAction,
          disabled: this.isReadOnly() }),
        React.createElement(
          'span',
          { className: 'field-choice-label' },
          choice.label
        )
      );

      if (isInline) {
        return React.createElement(
          'span',
          { key: i, className: 'field-choice' },
          inputField,
          ' '
        );
      }

      return React.createElement(
        'span',
        { key: i, className: 'field-choice' },
        inputField,
        ' ',
        config.createElement('sample', { field: field, choice: choice })
      );
    }.bind(this));

    return config.createElement('field', {
      field: field
    }, React.createElement(
      'div',
      { className: cx(this.props.classes), ref: ref(this, 'choices') },
      inputs
    ));
  }
});

// # object component

/*
Render a field to edit an object with dynamic child fields.
*/

var hasDuplicateKeys = function hasDuplicateKeys(assocList) {
  var hasDups = false;
  var keys = {};

  assocList.forEach(function (row) {
    if (keys[row.key]) {
      hasDups = true;
      return;
    }
    keys[row.key] = true;
  });

  return hasDups;
};

var ObjectField = createReactClass({

  displayName: 'Object',

  mixins: [FieldMixin],

  getInitialState: function getInitialState() {
    var config = this.props.config;
    return {
      assocList: config.objectToAssocList(this.props.field.value)
    };
  },
  orderedAssocList: function orderedAssocList(props) {
    var config = this.props.config;
    var newAssocList = config.objectToAssocList(props.field.value);

    // If we have an existing key order, use that.
    if (this.keyOrder) {
      var keyToItem = newAssocList.reduce(function (obj, item) {
        obj[item.key] = item;
        return obj;
      }, {});
      var keyOrderSet = this.keyOrder.reduce(function (obj, key) {
        obj[key] = true;
        return obj;
      }, {});
      // Make a list in order of old keys.
      var orderedAssocList = this.keyOrder.reduce(function (list, key) {
        if (key in keyToItem) {
          list.push(keyToItem[key]);
        }
        return list;
      }, []);
      // Add any new keys at the end.
      newAssocList.reduce(function (list, item) {
        if (!(item.key in keyOrderSet)) {
          list.push(item);
        }
        return list;
      }, orderedAssocList);
      return orderedAssocList;
    }
    return newAssocList;
  },
  componentWillReceiveProps: function componentWillReceiveProps(newProps) {
    if (hasDuplicateKeys(this.state.assocList)) {
      return; // talk to the hand
    }
    var newAssocList = this.orderedAssocList(newProps);
    this.keyOrder = newAssocList.map(function (item) {
      return item.key;
    });
    this.setState({
      assocList: newAssocList
    });
  },
  onChange: function onChange(assocList) {
    var config = this.props.config;
    var value = config.assocListToObject(assocList);
    // Need to hold onto keys to compare when receiving props.
    this.keyOrder = assocList.map(function (item) {
      return item.key;
    });
    this.setState({ assocList: assocList });
    if (!hasDuplicateKeys(assocList)) {
      var field = update(this.props.field, {
        value: { $set: value }
      });
      this.onBubbleValue(value, { field: field });
    }
  },
  render: function render() {
    return this.renderWithConfig();
  },
  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = update(this.props.field, {
      value: { $set: this.state.assocList },
      type: { $set: 'assoc-list' }
    });

    return config.createElement('assoc-list', {
      field: field, onChange: this.onChange, onAction: this.onBubbleAction
    });
  }
});

// # object component

/*
Render a field to edit a array of key / value objects, where duplicate keys are allowed.
*/

var keyCountsByKey = function keyCountsByKey(assocList) {
  var counts = {};
  assocList.forEach(function (row) {
    if (!counts[row.key]) {
      counts[row.key] = 0;
    }
    counts[row.key] += 1;
  });
  return counts;
};

var AssocListField = createReactClass({

  displayName: 'AssocList',

  mixins: [FieldMixin],

  nextLookupId: 0,

  getNextLookupId: function getNextLookupId() {
    return '_' + this.nextLookupId++;
  },
  getInitialState: function getInitialState() {
    var _this = this;

    var field = this.props.field;

    // maintain artificial keys, keyed by row index, to have persistent key
    var lookups = [];
    field.value.forEach(function (row, i) {
      lookups[i] = _this.getNextLookupId();
    });

    return { lookups: lookups };
  },
  componentWillReceiveProps: function componentWillReceiveProps(newProps) {
    var rows = newProps.field.value;

    // set artificial keys for new rows
    if (rows.length > this.state.lookups.length) {
      var lookupsToPush = [];
      for (var i = this.state.lookups.length; i < rows.length; i++) {
        lookupsToPush.push(this.getNextLookupId());
      }
      var lookups = update(this.state.lookups, {
        $push: lookupsToPush
      });
      this.setState({ lookups: lookups });
    }
  },
  onChange: function onChange(index, newValue) {
    var field = this.props.field;

    var updatedRow = { key: field.value[index].key, value: newValue };
    var rows = update(field.value, {
      $splice: [[index, 1, updatedRow]]
    });

    // this.onBubbleValue(rows, info);
    this.onChangeValue(rows);
  },
  onAppend: function onAppend() {
    var field = this.props.field;

    var newRow = { key: '', value: '' };
    var rows = update(field.value, {
      $push: [newRow]
    });

    // componentWillReceiveProps will add the new artificial key to lookups
    this.onChangeValue(rows);
  },
  onRemove: function onRemove(index) {
    var field = this.props.field;

    // componentWillReceiveProps can't know which item was deleted, so
    // put new artificial key in lookups here
    var lookups = update(this.state.lookups, {
      $splice: [[index, 1]]
    });
    this.setState({ lookups: lookups });

    var rows = update(field.value, {
      $splice: [[index, 1]]
    });
    this.onChangeValue(rows);
  },
  onChangeKey: function onChangeKey(index, newKey) {
    var field = this.props.field;

    var updatedRow = { key: newKey, value: field.value[index].value };
    var rows = update(field.value, {
      $splice: [[index, 1, updatedRow]]
    });

    this.onChangeValue(rows);
  },
  render: function render() {
    return this.renderWithConfig();
  },
  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;
    var fields = config.createChildFields(field);
    var keyCounts = keyCountsByKey(field.value);

    var content = config.cssTransitionWrapper(field.value.map(function (row, i) {
      return config.createElement('assoc-list-item', {
        key: this.state.lookups[i],
        index: i,
        displayKey: row.key,
        field: fields[i],
        isDuplicateKey: keyCounts[row.key] > 1,
        onChangeKey: this.onChangeKey,
        onChange: this.onChange,
        onRemove: this.onRemove,
        onAction: this.onBubbleAction
      });
    }.bind(this)));

    var assocList = config.createElement('assoc-list-control', {
      field: field,
      onAppend: this.onAppend
    });

    return config.createElement('field', {
      field: field,
      plain: this.props.plain
    }, React.createElement(
      'div',
      { className: cx(this.props.classes) },
      content,
      assocList
    ));
  }
});

// # json component

/*
Textarea editor for JSON. Will validate the JSON before setting the value, so
while the value is invalid, no external state changes will occur.
*/

var JsonField = createReactClass({

  displayName: 'Json',

  mixins: [FieldMixin],

  getDefaultProps: function getDefaultProps() {
    return {
      rows: 5
    };
  },

  isValidValue: function isValidValue(value) {

    try {
      return true;
    } catch (e) {
      return false;
    }
  },

  getInitialState: function getInitialState() {
    return {
      isValid: true,
      value: JSON.stringify(this.props.field.value, null, 2)
    };
  },

  onChange: function onChange(event) {
    var isValid = this.isValidValue(event.target.value);

    if (isValid) {
      // Need to handle this better. Need to track position.
      this._isChanging = true;
      this.onChangeValue(JSON.parse(event.target.value));
    }

    this.setState({
      isValid: isValid,
      value: event.target.value
    });
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    if (!this._isChanging) {
      this.setState({
        isValid: true,
        value: JSON.stringify(nextProps.field.value, null, 2)
      });
    }
    this._isChanging = false;
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;

    return config.createElement('field', {
      field: config.fieldWithValue(field, this.state.value), plain: this.props.plain
    }, React.createElement('textarea', {
      className: cx(this.props.classes),
      value: this.state.value,
      onChange: this.onChange,
      style: { backgroundColor: this.state.isValid ? '' : 'rgb(255,200,200)' },
      rows: config.fieldRows(field) || this.props.rows,
      onFocus: this.onFocusAction,
      onBlur: this.onBlurAction,
      disabled: this.isReadOnly() }));
  }
});

// # unknown component

/*
Render a field with an unknown type.
*/

var UnknownFieldField = createReactClass({

  displayName: 'Unknown',

  mixins: [FieldMixin],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    return React.createElement(
      'div',
      null,
      React.createElement(
        'div',
        null,
        'Component not found for:'
      ),
      React.createElement(
        'pre',
        null,
        JSON.stringify(this.props.field.rawFieldTemplate, null, 2)
      )
    );
  }
});

// # copy component

/*
Render non-editable html/text (think article copy).
*/

var CopyField = createReactClass({

  displayName: 'Copy',

  mixins: [FieldMixin],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    return React.createElement('div', {
      className: cx(this.props.classes),
      dangerouslySetInnerHTML: { __html: this.props.config.fieldHelpText(this.props.field) } });
  }
});

// # field component

/*
Used by any fields to put the label and help text around the field.
*/

var FieldHelper = createReactClass({

  displayName: 'Field',

  mixins: [HelperMixin],

  getInitialState: function getInitialState() {
    return {
      collapsed: this.props.config.fieldIsCollapsed(this.props.field) ? true : false
    };
  },

  onClickLabel: function onClickLabel() {
    this.setState({
      collapsed: !this.state.collapsed
    });
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;

    if (this.props.plain) {
      return this.props.children;
    }

    var field = this.props.field;

    var index = this.props.index;
    if (!_.isNumber(index)) {
      var key = this.props.field.key;
      index = _.isNumber(key) ? key : undefined;
    }

    var classes = _.extend({}, this.props.classes);

    var errors = config.fieldErrors(field);

    errors.forEach(function (error) {
      classes['validation-error-' + error.type] = true;
    });

    if (config.fieldIsRequired(field)) {
      classes.required = true;
    } else {
      classes.optional = true;
    }

    if (this.isReadOnly()) {
      classes.readonly = true;
    }

    var label = config.createElement('label', {
      config: config,
      field: field,
      index: index,
      onClick: config.fieldIsCollapsible(field) ? this.onClickLabel : null
    });

    var help = config.cssTransitionWrapper(this.state.collapsed ? [] : [config.createElement('help', {
      config: config, field: field,
      key: 'help'
    }), this.props.children]);

    return React.createElement(
      'div',
      {
        className: cx(classes),
        style: { display: field.hidden ? 'none' : '' } },
      label,
      help
    );
  }
});

// # label component

/*
Just the label for a field.
*/

var LabelHelper = createReactClass({

  displayName: 'Label',

  mixins: [HelperMixin],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;
    var fieldLabel = config.fieldLabel(field);
    var requiredLabel = config.createElement('required-label', {
      config: config,
      field: field
    });
    var label = null;

    if (typeof this.props.index === 'number') {
      label = '' + (this.props.index + 1) + '.';

      if (fieldLabel) {
        label = label + ' ' + fieldLabel;
      }
    }

    if (fieldLabel || label) {
      var text = label || fieldLabel;

      if (this.props.onClick) {
        text = React.createElement(
          'a',
          { href: 'JavaScript' + ':', onClick: this.props.onClick },
          text
        );
      }

      label = React.createElement(
        'label',
        null,
        text
      );
    }

    return React.createElement(
      'div',
      { className: cx(this.props.classes) },
      label,
      ' ',
      requiredLabel
    );
  }
});

// # required label component

/*
  Required Label for a field
*/

var RequiredLabelHelper = createReactClass({

  displayName: 'RequiredLabel',

  mixins: [HelperMixin],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;
    var fieldIsRequired = config.fieldIsRequired(field);
    var className = cx('required-label', {
      'required-text': fieldIsRequired,
      'not-required-text': !fieldIsRequired
    });

    return React.createElement('span', { className: className });
  }
});

// # help component

/*
Just the help text block.
*/

var HelpHelper = createReactClass({

  displayName: 'Help',

  mixins: [HelperMixin],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var helpText = this.props.config.fieldHelpText(this.props.field);

    return helpText ? React.createElement('div', { className: cx(this.props.classes),
      dangerouslySetInnerHTML: { '__html': helpText } }) : React.createElement('span', null);
  }
});

// # click-outside mixin

/*
There's no native React way to detect clicking outside an element. Sometimes
this is useful, so that's what this mixin does. To use it, mix it in and use it
from your component like this:

```js
import createReactClass from 'create-react-class';

import ClickOutsideMixin from '../../mixins/click-outside';

exports default createReactClass({

  mixins: [ClickOutsideMixin],

  onClickOutside: function () {
    console.log('clicked outside!');
  },

  componentDidMount: function () {
    this.setOnClickOutside('myDiv', this.onClickOutside);
  },

  render: function () {
    return React.DOM.div({ref: 'myDiv'},
      'Hello!'
    )
  }
});
```
*/

var hasAncestor = function hasAncestor(child, parent) {
  if (child.parentNode === parent) {
    return true;
  }
  if (child.parentNode === null) {
    return false;
  }
  return hasAncestor(child.parentNode, parent);
};

var ClickOutsideMixin = {

  isNodeOutside: function isNodeOutside(nodeOut, nodeIn) {
    if (nodeOut === nodeIn) {
      return false;
    }
    if (hasAncestor(nodeOut, nodeIn)) {
      return false;
    }
    return true;
  },

  isNodeInside: function isNodeInside(nodeIn, nodeOut) {
    return !this.isNodeOutside(nodeIn, nodeOut);
  },

  _onClickMousedown: function _onClickMousedown() {
    _.each(this.clickOutsideHandlers, function (funcs, ref) {
      if (this[ref + 'Ref']) {
        this._mousedownRefs[ref] = true;
      }
    }.bind(this));
  },

  _onClickMouseup: function _onClickMouseup(event) {
    _.each(this.clickOutsideHandlers, function (funcs, ref) {
      if (this[ref + 'Ref'] && this._mousedownRefs[ref]) {
        if (this.isNodeOutside(event.target, this[ref + 'Ref'])) {
          funcs.forEach(function (fn) {
            fn.call(this, event);
          }.bind(this));
        }
      }
      this._mousedownRefs[ref] = false;
    }.bind(this));
  },

  setOnClickOutside: function setOnClickOutside(ref, fn) {
    if (!this.clickOutsideHandlers[ref]) {
      this.clickOutsideHandlers[ref] = [];
    }
    this.clickOutsideHandlers[ref].push(fn);
  },

  componentDidMount: function componentDidMount() {
    this.clickOutsideHandlers = {};
    this._didMouseDown = false;
    document.addEventListener('mousedown', this._onClickMousedown);
    document.addEventListener('mouseup', this._onClickMouseup);
    //document.addEventListener('click', this._onClickDocument);
    this._mousedownRefs = {};
  },

  componentWillUnmount: function componentWillUnmount() {
    this.clickOutsideHandlers = {};
    //document.removeEventListener('click', this._onClickDocument);
    document.removeEventListener('mouseup', this._onClickMouseup);
    document.removeEventListener('mousedown', this._onClickMousedown);
  }
};

// # Choices component

/*
Render customized (non-native) dropdown choices.
*/

var _keyCodeToDirection;

var magicChoiceRe = /^\/\/\/[^/]+\/\/\/$/;

var keyCodeToDirection = (_keyCodeToDirection = {}, defineProperty(_keyCodeToDirection, keyCodes.UP, -1), defineProperty(_keyCodeToDirection, keyCodes.DOWN, 1), _keyCodeToDirection);

var requestAnimationFrameThrottled = function requestAnimationFrameThrottled() {
  var frameCount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
  var cb = arguments[1];

  if (frameCount < 1) {
    frameCount = 1;
  }
  var frameIndex = 0;
  var listenToFrame = function listenToFrame() {
    requestAnimationFrame(function () {
      frameIndex++;
      if (frameIndex === frameCount) {
        cb.apply(undefined, arguments);
      } else {
        listenToFrame();
      }
    });
  };
  listenToFrame();
};

var getInitiallyOpenSections = function getInitiallyOpenSections() {
  var choices = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  return choices.filter(function (choice) {
    return choice.sectionKey && choice.initialState === 'open';
  }).map(function (choice) {
    return choice.sectionKey;
  });
};

var ChoicesHelper = createReactClass({

  displayName: 'Choices',

  mixins: [HelperMixin, ClickOutsideMixin, ScrollLock],

  // return new set of open sections, when user clicks on section header with sectionKey
  getNextOpenSections: function getNextOpenSections(sectionKey) {
    var canOpenMultipleSections = this.props.canOpenMultipleSections;
    var openSections = this.state.openSections;


    if (openSections.indexOf(sectionKey) === -1) {
      // currently closed, so open it:
      if (canOpenMultipleSections) {
        // open this section, leave others alone:
        return openSections.concat([sectionKey]);
      } else {
        // open this section, close all others:
        return [sectionKey];
      }
    } else {
      // currently open, so close it (ie remove it from the list of open sections):
      return openSections.filter(function (key) {
        return sectionKey !== key;
      });
    }
  },


  getInitialState: function getInitialState() {
    return {
      maxHeight: null,
      open: this.props.open,
      searchString: '',
      hoverValue: null,
      openSections: getInitiallyOpenSections(this.props.choices)
    };
  },

  getIgnoreCloseNodes: function getIgnoreCloseNodes() {
    if (!this.props.ignoreCloseNodes) {
      return [];
    }
    var nodes = this.props.ignoreCloseNodes();
    if (!_.isArray(nodes)) {
      nodes = [nodes];
    }
    return nodes;
  },

  componentDidMount: function componentDidMount() {
    this.setOnClickOutside('container', function (event) {

      // Make sure we don't find any nodes to ignore.
      if (!_.find(this.getIgnoreCloseNodes(), function (node) {
        return this.isNodeInside(event.target, node);
      }.bind(this))) {
        this.onClose();
      }
    }.bind(this));

    if (this.searchRef) {
      this.searchRef.focus();
    }

    this.adjustSize();
    this.updateListeningToWindow();
  },

  componentWillUnmount: function componentWillUnmount() {
    this.stopListeningToWindow();
  },

  onSelect: function onSelect(choice, event) {
    this.setState({
      openSections: getInitiallyOpenSections(this.props.choices),
      searchString: ''
    });
    this.props.onSelect(choice.value, event);
  },

  onChoiceAction: function onChoiceAction(choice) {
    this.setState({
      openSections: getInitiallyOpenSections(this.props.choices),
      searchString: choice.keepSearchString ? this.state.searchString : ''
    });
    this.props.onChoiceAction(choice);
  },

  onClose: function onClose() {
    this.setState({
      openSections: getInitiallyOpenSections(this.props.choices),
      searchString: ''
    });
    this.props.onClose();
  },

  // Doing something a little crazy... measuring on every frame. Makes this smoother than using an interval.
  // Can't using scrolling events, because we might be scrolling inside a container instead of the body.
  // Shouldn't be any more costly than animations though, I think. And only one of these is open at a time.
  updateListeningToWindow: function updateListeningToWindow() {
    var _this = this;

    if (this.choicesRef) {
      if (!this.isListening) {
        var listenToFrame = function listenToFrame() {
          requestAnimationFrameThrottled(3, function () {
            if (_this.isListening) {
              // Make sure we don't adjust again before rendering.
              _this.adjustSize(function () {
                if (_this.isListening) {
                  listenToFrame();
                }
              });
            }
          });
        };
        this.isListening = true;
        listenToFrame();
      }
    } else {
      if (this.isListening) {
        this.stopListeningToWindow();
      }
    }
  },

  stopListeningToWindow: function stopListeningToWindow() {
    if (this.isListening) {
      this.isListening = false;
    }
  },

  adjustSize: function adjustSize(cb) {
    var didSetState = false;
    if (this.choicesRef) {
      var node = this.containerRef;
      var rect = node.getBoundingClientRect();
      var top = rect.top;
      var windowHeight = window.innerHeight;
      var height = windowHeight - top;
      if (height !== this.state.maxHeight) {
        didSetState = true;
        this.setState({
          maxHeight: height
        }, cb);
      }
    }
    if (!didSetState) {
      if (cb) {
        cb();
      }
    }
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    var _this2 = this;

    var isOpening = !this.props.open && nextProps.open;

    var nextState = {
      open: nextProps.open,
      openSections: getInitiallyOpenSections(nextProps.choices)
    };

    // For now, erase hover value when opening. Maybe get smarter about this later.
    if (isOpening) {
      nextState.hoverValue = null;
    }

    var isSearchOpening = this.isSearchOpening(nextProps);

    this.setState(nextState, function () {
      if (isOpening || isSearchOpening) {
        if (_this2.searchRef) {
          _this2.searchRef.focus();
        }
      }
      _this2.adjustSize();
      _this2.updateListeningToWindow();
    });
  },

  onHeaderClick: function onHeaderClick(choice) {
    this.setState({
      openSections: this.getNextOpenSections(choice.sectionKey)
    }, this.adjustSize);
  },

  hasOneSection: function hasOneSection() {
    var sectionHeaders = this.props.choices.filter(function (c) {
      return c.sectionKey;
    });
    return sectionHeaders.length < 2;
  },

  visibleChoices: function visibleChoices() {
    return this.visibleChoicesInfo.apply(this, arguments).choices;
  },
  visibleChoicesInfo: function visibleChoicesInfo() {
    var _this3 = this;

    var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;


    var choices = props.choices;
    var config = props.config;

    if (choices && choices.length === 0) {
      return {
        choices: [{ value: '///empty///' }],
        hasDisabledSections: true
      };
    }

    if (this.state.searchString) {
      choices = choices.filter(function (choice) {
        if (choice.sectionKey) {
          return true;
        }
        return config.isSearchStringInChoice(_this3.state.searchString, choice);
      });
    }

    choices = config.sortChoices(choices, this.state.searchString);

    if (!props.isAccordion) {
      return {
        choices: choices,
        hasDisabledSections: true
      };
    }

    var openSections = this.state.openSections;
    var alwaysExanded = !props.isAccordionAlwaysCollapsable && this.hasOneSection() || this.state.searchString;
    var visibleChoices = [];
    var isInOpenSection;
    var isInSection = false;

    choices.forEach(function (choice) {
      if (choice.sectionKey) {
        isInSection = true;
        isInOpenSection = openSections.indexOf(choice.sectionKey) !== -1;
      } else if (_.isNull(choice.sectionKey)) {
        isInSection = false;
      }
      if (choice.value && String(choice.value).match(magicChoiceRe)) {
        visibleChoices.push(choice);
      } else if (alwaysExanded || choice.sectionKey || isInOpenSection || !isInSection) {
        visibleChoices.push(choice);
      }
    });

    return {
      choices: visibleChoices,
      hasDisabledSections: alwaysExanded
    };
  },
  hasSearch: function hasSearch() {
    var visibleChoices = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.visibleChoices();
    var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.props;

    if (!props.config.fieldHasSearch(props.field)) {
      return false;
    }

    var hasSearch = !!this.state.searchString;

    if (!hasSearch) {
      if (props.choices.length > 2) {
        if (_.find(visibleChoices, function (choice) {
          return !choice.action && choice.value !== '///loading///';
        })) {
          hasSearch = true;
        }
      }
    }

    return hasSearch;
  },
  isSearchOpening: function isSearchOpening(nextProps) {
    if (this.props.choices.length < nextProps.choices.length) {
      var prevHasSearch = this.hasSearch(this.visibleChoices());
      var nextHasSearch = this.hasSearch(this.visibleChoices(nextProps), nextProps);
      if (nextHasSearch && !prevHasSearch) {
        return true;
      }
    }
    return false;
  },


  render: function render() {
    return this.renderWithConfig();
  },

  onClick: function onClick(event) {
    // swallow clicks
    event.stopPropagation();
  },

  onChangeSearch: function onChangeSearch(event) {
    this.setState({
      searchString: event.target.value
    });
  },

  choiceValue: function choiceValue(choice) {
    if (choice.value === '///loading///') {
      return 'loading';
    } else if (choice.value === '///empty///') {
      return 'empty';
    } else if (choice.action) {
      return 'action:' + choice.action;
    } else if (choice.sectionKey) {
      return 'section:' + choice.sectionKey;
    } else {
      return 'value:' + choice.value;
    }
  },


  // Receive keydown events from parent. Really, this component should be
  // ripped apart into a stateless component, but much refactoring to be done
  // for that.
  onKeyDown: function onKeyDown(event) {
    var _this4 = this;

    var direction = event.keyCode in keyCodeToDirection ? keyCodeToDirection[event.keyCode] : 0;

    if (direction !== 0 || event.keyCode === keyCodes.ENTER) {

      var visibleChoices = this.visibleChoices();
      var hoverValue = this.state.hoverValue;


      event.preventDefault();
      event.stopPropagation();

      if (direction !== 0) {
        if (visibleChoices) {
          var hoverIndex = -1;
          if (hoverValue === 'search') {
            hoverIndex = -1;
          } else {
            _.find(visibleChoices, function (choice, i) {
              if (hoverValue === _this4.choiceValue(choice)) {
                hoverIndex = i;
                return true;
              }

              return false;
            });
          }
          var nextHoverIndex = hoverIndex + direction;
          if (nextHoverIndex < 0) {
            nextHoverIndex = 0;
            if (this.containerRef) {
              var containerNode = ReactDOM.findDOMNode(this.containerRef);
              containerNode.scrollTop = 0;
            }
          } else if (nextHoverIndex + 1 > visibleChoices.length) {
            nextHoverIndex = visibleChoices.length - 1;
          }
          var nextHoverComponent = this['choice-' + nextHoverIndex + 'Ref'];
          if (nextHoverComponent && this.containerRef) {
            var node = ReactDOM.findDOMNode(nextHoverComponent);
            var _containerNode = ReactDOM.findDOMNode(this.containerRef);
            scrollIntoContainerView(node, _containerNode);
          }
          var nextHoverValue = nextHoverIndex > -1 ? this.choiceValue(visibleChoices[nextHoverIndex]) : 'search';
          if (nextHoverValue === 'search') {
            if (this.searchRef) {
              this.searchRef.focus();
            }
          }
          this.setState({
            hoverValue: nextHoverValue
          });
        }
      }

      if (event.keyCode === keyCodes.ENTER) {
        var selectedChoice = _.find(visibleChoices, function (choice) {
          return _this4.choiceValue(choice) === hoverValue;
        });
        if (selectedChoice) {
          if (this.props.onFocusSelect) {
            this.props.onFocusSelect();
          }
          if (hoverValue.indexOf('value:') === 0) {
            this.onSelect(selectedChoice, event);
          } else if (selectedChoice.action) {
            this.onChoiceAction(selectedChoice);
          } else if (selectedChoice.sectionKey) {
            this.onHeaderClick(selectedChoice);
          } else {
            this.onClose();
          }
        }
      }
    }
  },


  renderDefault: function renderDefault() {

    if (!this.props.open) {
      return null;
    }

    var config = this.props.config;

    var _visibleChoicesInfo = this.visibleChoicesInfo(),
        choices = _visibleChoicesInfo.choices,
        hasDisabledSections = _visibleChoicesInfo.hasDisabledSections;

    var search = null;

    var hasSearch = this.hasSearch(choices);

    if (hasSearch) {
      search = config.createElement('choices-search', {
        ref: ref(this, 'search'),
        key: 'choices-search',
        field: this.props.field,
        onChange: this.onChangeSearch
      });
    }

    return React.createElement(
      'div',
      {
        ref: ref(this, 'container'),
        onClick: this.onClick,
        className: 'choices-container',
        style: {
          userSelect: 'none',
          WebkitUserSelect: 'none',
          position: 'absolute',
          maxHeight: this.state.maxHeight ? this.state.maxHeight : null
        } },
      config.cssTransitionWrapper(search, React.createElement(
        'ul',
        {
          key: 'choices',
          ref: ref(this, 'choices'),
          className: 'choices' },
        choices.map(function (choice, i) {

          var choiceElement = null;
          var choiceValue = null;

          if (choice.value === '///loading///') {
            choiceElement = React.createElement(
              'a',
              { href: 'JavaScript' + ':', onClick: this.onClose },
              React.createElement(
                'span',
                { className: 'choice-label' },
                config.createElement('loading-choice', { field: this.props.field })
              )
            );

            choiceValue = 'loading';
          } else if (choice.value === '///empty///') {
            choiceElement = React.createElement(
              'a',
              { href: 'JavaScript' + ':', onClick: this.onClose },
              React.createElement(
                'span',
                { className: 'choice-label' },
                'No choices available.'
              )
            );

            choiceValue = 'empty';
          } else if (choice.action) {
            var labelClasses = 'choice-label ' + choice.action;
            var anchorClasses = 'action-choice ' + choice.action;

            choiceElement = React.createElement(
              'a',
              { href: 'JavaScript' + ':', onClick: this.onChoiceAction.bind(this, choice), className: anchorClasses },
              React.createElement(
                'span',
                { className: labelClasses },
                choice.label || this.props.config.actionChoiceLabel(choice.action)
              ),
              this.props.config.createElement('choice-action-sample', {
                action: choice.action,
                choice: choice
              })
            );

            choiceValue = 'action:' + choice.action;
          } else if (choice.sectionKey) {
            choiceElement = React.createElement(
              'a',
              { href: 'JavaScript' + ':', onClick: this.onHeaderClick.bind(this, choice) },
              config.createElement('choice-section-header', {
                choice: choice,
                isOpen: this.state.openSections.indexOf(choice.sectionKey) !== -1,
                isDisabled: hasDisabledSections
              })
            );

            choiceValue = 'section:' + choice.sectionKey;
          } else {
            choiceElement = config.createElement('choice', {
              onSelect: this.onSelect,
              choice: choice,
              field: this.props.field,
              index: i,
              total: choices.length
            });

            choiceValue = 'value:' + choice.value;
          }

          return config.createElement('choices-item', {
            ref: ref(this, 'choice-' + i),
            key: i,
            isHovering: this.state.hoverValue && this.state.hoverValue === choiceValue
          }, choiceElement);
        }.bind(this))
      ))
    );
  }
});

// # choices-item component

/*
   Render a choice item wrapper.
 */

var ChoicesItemHelper = createReactClass({

  displayName: 'ChoicesItem',

  mixins: [HelperMixin],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var classes = _.extend({}, this.props.classes);

    classes.choice = true;
    if (this.props.isHovering) {
      classes.hover = true;
    }

    return React.createElement(
      'li',
      { className: cx(classes) },
      this.props.children
    );
  }

});

// # choice component

/*
A single choice in a list of choices.
*/

var ChoiceHelper = createReactClass({

  displayName: 'Choice',

  mixins: [HelperMixin],

  render: function render() {
    return this.renderWithConfig();
  },
  onSelect: function onSelect() {
    this.props.onSelect(this.props.choice);
  },
  sampleString: function sampleString(sample) {
    if (typeof sample === 'boolean') {
      return String(sample);
    }
    return sample;
  },


  renderDefault: function renderDefault() {
    var choice = this.props.choice;


    return React.createElement(
      'a',
      { style: { cursor: 'pointer' }, onClick: this.onSelect },
      React.createElement(
        'span',
        { ref: ref(this, 'label'), className: 'choice-label' },
        choice.label
      ),
      React.createElement(
        'span',
        { className: 'choice-sample' },
        this.sampleString(choice.sample)
      )
    );
  }
});

// # choices-search component

/*
   Render a search box for choices.
 */

var ChoicesSearchHelper = createReactClass({

  displayName: 'ChoicesSearch',

  mixins: [HelperMixin],

  focus: function focus() {
    this.inputRef.focus();
  },


  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    return React.createElement(
      'div',
      { className: 'choices-search' },
      React.createElement('input', { ref: ref(this, 'input'), type: 'text', placeholder: 'Search...', onChange: this.props.onChange })
    );
  }

});

var LoadingChoicesHelper = createReactClass({

  displayName: 'LoadingChoices',

  mixins: [HelperMixin],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    return React.createElement(
      'div',
      null,
      'Loading choices...'
    );
  }

});

var LoadingChoiceHelper = createReactClass({

  displayName: 'LoadingChoice',

  mixins: [HelperMixin],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    return React.createElement(
      'span',
      null,
      'Loading choices...'
    );
  }

});

// # array-control component

/*
Render the item type choices and the add button for an array.
*/

var ArrayControlHelper = createReactClass({

  displayName: 'ArrayControl',

  mixins: [HelperMixin],

  getInitialState: function getInitialState() {
    return {
      fieldTemplateIndex: 0
    };
  },

  onSelect: function onSelect(index) {
    this.setState({
      fieldTemplateIndex: index
    });
  },

  onAppend: function onAppend() {
    this.props.onAppend(this.state.fieldTemplateIndex);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;

    var field = this.props.field;
    var fieldTemplates = config.fieldItemFieldTemplates(field);
    var typeChoices = null;

    if (!this.isReadOnly() && fieldTemplates.length > 0) {
      typeChoices = config.createElement('field-template-choices', {
        field: field, fieldTemplateIndex: this.state.fieldTemplateIndex, onSelect: this.onSelect
      });
    }

    var addItem = void 0;
    if (!this.isReadOnly()) {
      addItem = config.createElement('add-item', { field: field, onClick: this.onAppend, tabIndex: this.props.tabIndex });
    }

    return React.createElement(
      'div',
      { className: cx(this.props.classes) },
      typeChoices,
      ' ',
      addItem
    );
  }
});

// # array-item-control component

/*
Render the remove and move buttons for an array field.
*/

var ArrayItemControlHelper = createReactClass({

  displayName: 'ArrayItemControl',

  mixins: [HelperMixin],

  onMoveBack: function onMoveBack() {
    this.props.onMove(this.props.index, this.props.index - 1);
  },

  onMoveForward: function onMoveForward() {
    this.props.onMove(this.props.index, this.props.index + 1);
  },

  onRemove: function onRemove() {
    this.props.onRemove(this.props.index);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;

    var isLastItem = field.fieldIndex === 0 && field.parent.value.length === 1;

    var isFirstItem = field.fieldIndex === 0;

    var isLastMoveableItem = field.fieldIndex === field.parent.value.length - 1;

    var removeItemControl = config.createElement('remove-item', {
      field: field, onClick: this.onRemove, onMaybeRemove: this.props.onMaybeRemove,
      readOnly: isLastItem && !config.isRemovalOfLastArrayItemAllowed(field)
    });

    var moveItemForward = this.props.index < this.props.numItems - 1 ? config.createElement('move-item-forward', { field: field, onClick: this.onMoveForward, classes: { 'is-first-item': isFirstItem } }) : null;

    var moveItemBack = this.props.index > 0 ? config.createElement('move-item-back', { field: field, onClick: this.onMoveBack, classes: { 'is-last-item': isLastMoveableItem } }) : null;

    return React.createElement(
      'div',
      { className: cx(this.props.classes) },
      removeItemControl,
      moveItemBack,
      moveItemForward
    );
  }
});

// # array-item-value component

/*
Render the value of an array item.
*/

var ArrayItemValueHelper = createReactClass({

  displayName: 'ArrayItemValue',

  mixins: [HelperMixin],

  onChangeField: function onChangeField(newValue, info) {
    this.props.onChange(this.props.index, newValue, info);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;

    return React.createElement(
      'div',
      { className: cx(this.props.classes) },
      config.createFieldElement({ field: field, onChange: this.onChangeField, onAction: this.onBubbleAction })
    );
  }
});

// # array-item component

/*
Render an array item.
*/

var ArrayItemHelper = createReactClass({

  displayName: 'ArrayItem',

  mixins: [HelperMixin],

  getInitialState: function getInitialState() {
    return {
      isMaybeRemoving: false
    };
  },

  render: function render() {
    return this.renderWithConfig();
  },

  onMaybeRemove: function onMaybeRemove(isMaybeRemoving) {
    this.setState({
      isMaybeRemoving: isMaybeRemoving
    });
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;

    var classes = _.extend({}, this.props.classes);

    if (this.state.isMaybeRemoving) {
      classes['maybe-removing'] = true;
    }

    var arrayItemControl = void 0;
    if (!config.fieldIsReadOnly(field)) {
      arrayItemControl = config.createElement('array-item-control', {
        field: field,
        index: this.props.index,
        numItems: this.props.numItems,
        onMove: this.props.onMove,
        onRemove: this.props.onRemove,
        onMaybeRemove: this.onMaybeRemove
      });
    }

    var arrayItemValue = config.createElement('array-item-value', {
      field: field,
      index: this.props.index,
      onChange: this.props.onChange,
      onAction: this.onBubbleAction
    });

    return React.createElement(
      'div',
      { className: cx(classes) },
      arrayItemControl,
      arrayItemValue
    );
  }
});

// # field-template-choices component

/*
Give a list of choices of item types to create as children of an field.
*/

var FieldTemplateChoicesHelper = createReactClass({

  displayName: 'FieldTemplateChoices',

  mixins: [HelperMixin],

  onChange: function onChange(event) {
    this.props.onSelect(parseInt(event.target.value));
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;
    var field = this.props.field;

    var fieldTemplates = config.fieldItemFieldTemplates(field);

    return fieldTemplates.length < 2 ? null : React.createElement(
      'select',
      {
        className: cx(this.props.classes),
        value: this.fieldTemplateIndex,
        onChange: this.onChange },
      fieldTemplates.map(function (fieldTemplate, i) {
        return React.createElement(
          'option',
          { key: i, value: i },
          fieldTemplate.label || i
        );
      })
    );
  }
});

// # add-item component

/*
The add button to append an item to a field.
*/

var AddItemHelper = createReactClass({

  displayName: 'AddItem',

  mixins: [HelperMixin],

  getDefaultProps: function getDefaultProps() {
    return {
      label: '[add]'
    };
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var _this = this;

    var tabIndex = this.props.readOnly ? null : 0;

    var onKeyDown = function onKeyDown(event) {
      if (event.keyCode === 13) {
        _this.props.onClick(event);
      }
    };

    return React.createElement(
      'span',
      {
        tabIndex: tabIndex,
        onKeyDown: onKeyDown,
        className: cx(this.props.classes),
        onClick: this.props.onClick },
      this.props.label
    );
  }
});

// # remove-item component

/*
Remove an item.
*/

var RemoveItemHelper = createReactClass({

  displayName: 'RemoveItem',

  mixins: [HelperMixin],

  getDefaultProps: function getDefaultProps() {
    return {
      label: '[remove]'
    };
  },

  render: function render() {
    return this.renderWithConfig();
  },

  onMouseOverRemove: function onMouseOverRemove() {
    if (this.props.onMaybeRemove) {
      this.props.onMaybeRemove(true);
    }
  },

  onMouseOutRemove: function onMouseOutRemove() {
    if (this.props.onMaybeRemove) {
      this.props.onMaybeRemove(false);
    }
  },

  renderDefault: function renderDefault() {
    var _this = this;

    if (this.props.readOnly) {
      var classes = _.extend({}, this.props.classes, { 'readonly-control': this.props.readOnly });

      return React.createElement(
        'span',
        { className: cx(classes) },
        this.props.label
      );
    }

    var onKeyDown = function onKeyDown(event) {
      if (event.keyCode === 13) {
        _this.props.onClick(event);
      }
    };

    return React.createElement(
      'span',
      {
        tabIndex: 0,
        className: cx(this.props.classes),
        onKeyDown: onKeyDown,
        onClick: this.props.onClick,
        onMouseOver: this.onMouseOverRemove,
        onMouseOut: this.onMouseOutRemove },
      this.props.label
    );
  }
});

// # move-item-forward component

/*
Button to move an item forward in a list.
*/

var MoveItemForwardHelper = createReactClass({

  displayName: 'MoveItemForward',

  mixins: [HelperMixin],

  getDefaultProps: function getDefaultProps() {
    return {
      label: '[down]'
    };
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    return React.createElement(
      'span',
      { className: cx(this.props.classes), onClick: this.props.onClick },
      this.props.label
    );
  }
});

// # move-item-back component

/*
Button to move an item backwards in list.
*/

var MoveItemBackHelper = createReactClass({

  displayName: 'MoveItemBack',

  mixins: [HelperMixin],

  getDefaultProps: function getDefaultProps() {
    return {
      label: '[up]'
    };
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    return React.createElement(
      'span',
      { className: cx(this.props.classes), onClick: this.props.onClick },
      this.props.label
    );
  }
});

// # assoc-list-control component

/*
Render the item type choices and the add button.
*/

var AssocListControlHelper = createReactClass({

  displayName: 'ObjectControl',

  mixins: [HelperMixin],

  getInitialState: function getInitialState() {
    return {
      fieldTemplateIndex: 0
    };
  },

  onSelect: function onSelect(index) {
    this.setState({
      fieldTemplateIndex: index
    });
  },

  onAppend: function onAppend() {
    this.props.onAppend(this.state.fieldTemplateIndex);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;
    var fieldTemplates = config.fieldChildFieldTemplates(field);

    var typeChoices = null;

    if (fieldTemplates.length > 0) {
      typeChoices = config.createElement('field-template-choices', {
        field: field,
        fieldTemplateIndex: this.state.fieldTemplateIndex, onSelect: this.onSelect
      });
    }

    return React.createElement(
      'div',
      { className: cx(this.props.classes) },
      typeChoices,
      ' ',
      config.createElement('add-item', { onClick: this.onAppend })
    );
  }
});

// # assoc-item-control component

/*
Render the remove buttons for an object item.
*/

var AssocListItemControlHelper = createReactClass({

  displayName: 'AssocListItemControl',

  mixins: [HelperMixin],

  onRemove: function onRemove() {
    this.props.onRemove(this.props.index);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;

    var isLastItem = field.fieldIndex === 0 && Object.keys(field.parent.value).length === 1;

    var removeItem = config.createElement('remove-item', {
      field: field,
      onClick: this.onRemove,
      readOnly: isLastItem && !config.isRemovalOfLastAssocListItemAllowed(field)
    });

    return React.createElement(
      'div',
      { className: cx(this.props.classes) },
      removeItem
    );
  }
});

// # assoc-item-value component

/*
Render the value of an object item.
*/

var AssocListItemValueHelper = createReactClass({

  displayName: 'AssocListItemValue',

  mixins: [HelperMixin],

  onChangeField: function onChangeField(newValue, info) {
    this.props.onChange(this.props.index, newValue, info);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;

    var fieldElem = config.createFieldElement({
      field: field,
      onChange: this.onChangeField,
      plain: true,
      onAction: this.onBubbleAction
    });

    return React.createElement(
      'div',
      { className: cx(this.props.classes) },
      fieldElem
    );
  }
});

// # assoc-item-key component

/*
Render an object item key editor.
*/

var AssocListItemKeyHelper = createReactClass({

  displayName: 'AssocListItemKey',

  mixins: [HelperMixin],

  onChange: function onChange(event) {
    this.props.onChange(event.target.value);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var classes = _.extend({}, this.props.classes);
    if (this.props.isDuplicateKey) {
      classes['validation-error-duplicate-key'] = true;
    }

    return React.createElement('input', {
      className: cx(classes),
      type: 'text',
      value: this.props.displayKey,
      onChange: this.onChange,
      onFocus: this.onFocusAction,
      onBlur: this.onBlurAction });
  }
});

// # assoc-item component

/*
Render an object item.
*/

var AssocListItemHelper = createReactClass({

  displayName: 'AssocListItem',

  mixins: [HelperMixin],

  onChangeKey: function onChangeKey(newKey) {
    this.props.onChangeKey(this.props.index, newKey);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;

    var assocListItemKey = config.createElement('assoc-list-item-key', {
      field: field,
      onChange: this.onChangeKey,
      onAction: this.onBubbleAction,
      displayKey: this.props.displayKey,
      isDuplicateKey: this.props.isDuplicateKey
    });

    var assocListItemValue = config.createElement('assoc-list-item-value', {
      field: field,
      onChange: this.props.onChange,
      onAction: this.onBubbleAction,
      index: this.props.index
    });

    var assocListItemControl = config.createElement('assoc-list-item-control', {
      field: field,
      onRemove: this.props.onRemove,
      index: this.props.index
    });

    return React.createElement(
      'div',
      { className: cx(this.props.classes) },
      assocListItemKey,
      assocListItemValue,
      assocListItemControl
    );
  }
});

// # select-value component

/*
Render a select dropdown for a list of choices. Choices values can be of any
type.
*/

var SelectValueHelper = createReactClass({

  displayName: 'SelectValue',

  mixins: [HelperMixin],

  onChange: function onChange(event) {
    var choiceValue = event.target.value;
    var choiceType = choiceValue.substring(0, choiceValue.indexOf(':'));
    if (choiceType === 'choice') {
      var choiceIndex = choiceValue.substring(choiceValue.indexOf(':') + 1);
      choiceIndex = parseInt(choiceIndex);
      this.props.onChange(this.props.choices[choiceIndex].value);
    }
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var choices = this.props.choices || [];

    var choicesOrLoading;

    if (choices.length === 1 && choices[0].value === '///loading///' || config.fieldIsLoading(this.props.field)) {
      choicesOrLoading = config.createElement('loading-choices', {});
    } else {
      var value = this.props.field.value !== undefined ? this.props.field.value : '';

      choices = choices.map(function (choice, i) {
        return {
          choiceValue: 'choice:' + i,
          value: choice.value,
          label: choice.label
        };
      });

      var valueChoice = _.find(choices, function (choice) {
        return choice.value === value;
      });

      if (valueChoice === undefined) {

        var label = value;
        if (!_.isString(value)) {
          label = JSON.stringify(value);
        }
        valueChoice = {
          choiceValue: 'value:',
          value: value,
          label: label
        };
        choices = [valueChoice].concat(choices);
      }

      choicesOrLoading = React.createElement(
        'select',
        {
          className: cx(this.props.classes),
          onChange: this.onChange,
          value: valueChoice.choiceValue,
          onFocus: this.onFocusAction,
          onBlur: this.onBlurAction,
          disabled: this.isReadOnly() },
        choices.map(function (choice, i) {
          return React.createElement(
            'option',
            { key: i, value: choice.choiceValue },
            choice.label
          );
        })
      );
    }

    return choicesOrLoading;
  }
});

// # pretty-select-value component

/*
   Render a select dropdown for a list of choices. Choices values can be of any
   type. Does not use native select dropdown. Choices can optionally include
   'sample' property displayed grayed out.
 */

var PrettySelectValueHelper = createReactClass({

  displayName: 'SelectValue',

  mixins: [HelperMixin],

  onChange: function onChange(event) {
    var choiceValue = event.target.value;
    var choiceType = choiceValue.substring(0, choiceValue.indexOf(':'));
    if (choiceType === 'choice') {
      var choiceIndex = choiceValue.substring(choiceValue.indexOf(':') + 1);
      choiceIndex = parseInt(choiceIndex);
      this.props.onChange(this.props.choices[choiceIndex].value);
    }
  },

  onChangeCustomValue: function onChangeCustomValue(newValue, info) {
    this.props.onChange(newValue, {
      field: info.field,
      isCustomValue: true
    });
  },

  // Intercept custom value field events and pretend like this field sent them.
  onCustomAction: function onCustomAction(info) {
    info = _.extend({}, info, { field: this.props.field, isCustomValue: true });
    this.props.onAction(info);
  },

  getDefaultProps: function getDefaultProps() {
    return {
      choices: []
    };
  },

  getInitialState: function getInitialState() {
    var currentChoice = this.currentChoice(this.props);
    var isDefaultValue = this.props.field.value === this.props.config.fieldTemplateDefaultValue(this.props.field);
    return {
      isChoicesOpen: this.props.isChoicesOpen,
      isEnteringCustomValue: !isDefaultValue && !currentChoice && this.props.field.value,
      // Caching this cause it's kind of expensive.
      currentChoice: this.currentChoice(this.props),
      hoverIndex: -1
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(newProps) {
    var currentChoice = this.currentChoice(newProps);
    this.setState({
      currentChoice: currentChoice
    });
  },
  onKeyDown: function onKeyDown(event) {
    if (!this.isReadOnly()) {
      if (event.keyCode === keyCodes.ESC) {
        event.preventDefault();
        event.stopPropagation();
        if (this.state.isChoicesOpen) {
          this.onToggleChoices();
          this.onFocus();
        }
      } else if (!this.state.isChoicesOpen) {
        if (!this.state.isEnteringCustomValue) {
          if (event.keyCode === keyCodes.UP || event.keyCode === keyCodes.DOWN || event.keyCode === keyCodes.ENTER) {
            event.preventDefault();
            event.stopPropagation();
            this.onToggleChoices();
          }
        }
      } else {
        if (this.choicesRef && this.choicesRef.onKeyDown) {
          this.choicesRef.onKeyDown(event);
        }
      }
    }
  },


  value: function value(props) {
    props = props || this.props;
    return props.field.value !== undefined ? props.field.value : '';
  },

  onFocus: function onFocus() {
    focusRefNode(this.containerRef);
  },


  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var _props = this.props,
        config = _props.config,
        field = _props.field;

    var choices = config.normalizePrettyChoices(this.props.choices);
    var choicesOrLoading;

    if (choices.length > 1 && choices[0].value === '///loading///' || config.fieldIsLoading(field)) {
      choices = [{ value: '///loading///' }];
    }

    var choicesElem = void 0;
    if (!this.isReadOnly()) {
      choicesElem = config.createElement('choices', {
        ref: ref(this, 'choices'),
        choices: choices,
        open: this.state.isChoicesOpen,
        ignoreCloseNodes: this.getCloseIgnoreNodes,
        onSelect: this.onSelectChoice,
        onClose: this.onCloseChoices,
        onChoiceAction: this.onChoiceAction,
        field: field,
        isAccordion: field.isAccordion,
        isAccordionAlwaysCollapsable: field.isAccordionAlwaysCollapsable,
        hoverIndex: this.state.hoverIndex,
        onFocusSelect: this.onFocus
      });
    }

    var inputElem = this.getInputElement();

    var customFieldElement = null;
    if (this.state.isEnteringCustomValue && this.hasCustomField()) {
      var customFieldTemplate = config.fieldCustomFieldTemplate(field);
      var customField = _.extend({ type: 'PrettyText' }, {
        key: field.key, parent: field, fieldIndex: field.fieldIndex,
        rawFieldTemplate: customFieldTemplate,
        value: field.value
      }, customFieldTemplate);
      config.initField(customField);
      customFieldElement = config.createFieldElement({
        field: customField,
        onChange: this.onChangeCustomValue, onAction: this.onCustomAction,
        ref: ref(this, 'customFieldInput')
      });
    }

    var selectArrow = void 0;
    if (!this.isReadOnly() || this.hasReadOnlyControls()) {
      selectArrow = React.createElement('span', { className: cx('select-arrow', { 'readonly-control': this.isReadOnly() }) });
    }

    choicesOrLoading = React.createElement(
      'div',
      { ref: ref(this, 'container'), tabIndex: '0', onKeyDown: this.onKeyDown, className: cx(_.extend({}, this.props.classes, { 'choices-open': this.state.isChoicesOpen })),
        onChange: this.onChange },
      React.createElement(
        'div',
        { ref: ref(this, 'toggle'), onClick: this.isReadOnly() ? null : this.onToggleChoices },
        inputElem,
        selectArrow
      ),
      choicesElem,
      React.createElement(
        'span',
        null,
        customFieldElement
      )
    );

    return choicesOrLoading;
  },

  getInputElement: function getInputElement() {
    return this.props.config.createElement('pretty-select-input', {
      field: this.props.field,
      ref: ref(this, 'customInput'),
      isEnteringCustomValue: this.state.isEnteringCustomValue && !this.hasCustomField(),
      onChange: this.onInputChange,
      onFocus: this.onFocusAction,
      onBlur: this.onBlur,
      onAction: this.onBubbleAction,
      getDisplayValue: this.getDisplayValue
    });
  },

  blurLater: function blurLater() {
    var self = this;
    setTimeout(function () {
      self.onBlurAction();
    }, 0);
  },

  onBlur: function onBlur() {
    if (!this.state.isChoicesOpen) {
      this.blurLater();
    }
  },

  getCloseIgnoreNodes: function getCloseIgnoreNodes() {
    return this.toggleRef;
  },

  onToggleChoices: function onToggleChoices() {
    this.setChoicesOpen(!this.state.isChoicesOpen);
  },

  setChoicesOpen: function setChoicesOpen(isOpen) {
    var action = isOpen ? 'open-choices' : 'close-choices';
    this.onStartAction(action);
    this.setState({ isChoicesOpen: isOpen });
  },

  onSelectChoice: function onSelectChoice(value) {
    this.onStartAction('exit-custom-value');
    this.setState({
      isEnteringCustomValue: false,
      isChoicesOpen: false
    });
    this.props.onChange(value);
    this.blurLater();
  },

  onCloseChoices: function onCloseChoices() {
    if (this.state.isChoicesOpen) {
      this.blurLater();
      this.setChoicesOpen(false);
    }
  },

  currentChoice: function currentChoice(props) {
    props = props || this.props;
    var _props2 = props,
        config = _props2.config,
        field = _props2.field,
        choices = _props2.choices;

    var currentValue = this.value(props);
    var currentChoice = config.fieldSelectedChoice(field);
    // Make sure selectedChoice is a match for current value.
    if (currentChoice && currentChoice.value !== currentValue) {
      currentChoice = null;
    }
    if (!currentChoice) {
      currentChoice = _.find(choices, function (choice) {
        return !choice.action && choice.value === currentValue;
      });
    }
    return currentChoice;
  },

  getDisplayValue: function getDisplayValue() {
    var currentChoice = this.state.currentChoice;
    //var currentChoice = this.currentChoice();

    var currentValue = this.value();
    var isDefaultValue = currentValue === this.props.config.fieldTemplateDefaultValue(this.props.field);

    if (this.state.isEnteringCustomValue || !isDefaultValue && !currentChoice && currentValue) {
      if (this.hasCustomField()) {
        var choices = this.props.choices;

        var customChoice = _.find(choices, function (choice) {
          return choice.action === 'enter-custom-value';
        });
        if (customChoice && customChoice.label) {
          return customChoice.label;
        }
      }
      return currentValue;
    }

    if (currentChoice) {
      return currentChoice.label;
    }

    // If this is the default value, and we have no choice to use for the label, just use the value.
    if (isDefaultValue) {
      return currentValue;
    }

    return '';
  },

  hasCustomField: function hasCustomField() {
    return !!this.props.config.fieldCustomFieldTemplate(this.props.field);
  },


  onChoiceAction: function onChoiceAction(choice) {
    if (choice.action === 'enter-custom-value') {
      this.setState({
        isEnteringCustomValue: true,
        isChoicesOpen: false
      }, function () {
        if (this.hasCustomField()) {
          if (this.customFieldInputRef && this.customFieldInputRef.focus) {
            this.customFieldInputRef.focus();
          }
        } else {
          if (this.customInputRef && this.customInputRef.focus) {
            this.customInputRef.focus();
          }
        }
      });
    } else if (choice.action === 'insert-field') {
      this.setState({
        isChoicesOpen: false
      }, function () {
        this.customInputRef.setChoicesOpen(true);
      });
    } else {
      if (choice.action === 'clear-current-choice') {
        this.onStartAction('exit-custom-value');
        this.setState({
          isChoicesOpen: false,
          isEnteringCustomValue: false
        });
        this.props.onChange('');
      } else {
        this.setState({
          isChoicesOpen: !!choice.isOpen
        });
      }
    }

    this.onStartAction(choice.action, choice);
  },

  onInputChange: function onInputChange(value) {
    this.props.onChange(value);
  }
});

// # pretty-select-input component

/*
   Render an input to be used as the element for typing a custom value into a pretty select.
 */

var PrettySelectInputHelper = createReactClass({

  displayName: 'PrettySelectInput',

  mixins: [HelperMixin],

  render: function render() {
    return this.renderWithConfig();
  },

  focus: function focus() {
    if (this.textBoxRef && this.textBoxRef.focus) {
      this.textBoxRef.focus();
    }
  },

  setChoicesOpen: function setChoicesOpen(isOpenChoices) {
    this.textBoxRef.setChoicesOpen(isOpenChoices);
  },

  renderDefault: function renderDefault() {
    return this.props.config.createElement('pretty-text-input', {
      ref: ref(this, 'textBox'),
      classes: this.props.classes,
      onChange: this.props.onChange,
      onFocus: this.props.onFocus,
      onBlur: this.props.onBlur,
      onAction: this.onBubbleAction,
      field: this.props.field,
      value: this.props.isEnteringCustomValue ? this.props.field.value : this.props.getDisplayValue(),
      selectedChoices: this.props.config.fieldSelectedReplaceChoices(this.props.field),
      replaceChoices: this.props.config.fieldReplaceChoices(this.props.field),
      onTagClick: this.onTagClick,
      readOnly: !this.props.isEnteringCustomValue,
      disabled: this.isReadOnly()
    });
  }

});

// # help component

/*
Just the help text block.
*/

var SampleHelper = createReactClass({

  displayName: 'Sample',

  mixins: [HelperMixin],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var choice = this.props.choice;

    return !choice.sample ? null : React.createElement(
      'div',
      { className: cx(this.props.className) },
      choice.sample
    );
  }
});

// # button component

/*
  Clickable 'button'
*/

var InsertButtonHelper = createReactClass({

  displayName: 'InsertButton',

  propTypes: {
    onClick: PropTypes.func.isRequired
  },

  mixins: [HelperMixin],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    return React.createElement(
      'a',
      { href: 'JavaScript' + ':', onClick: this.props.onClick,
        className: cx({ 'readonly-control': this.props.readOnly }) },
      this.props.children
    );
  }

});

// # ChoiceSectionHeader component

/*
Render section header in choices dropdown
*/

var ChoiceSectionHeaderHelper = createReactClass({

  displayName: 'ChoiceSectionHeader',

  mixins: [HelperMixin],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var choice = this.props.choice;
    return React.createElement(
      'span',
      { className: cx(this.props.classes) },
      choice.label
    );
  }
});

var buildChoicesMap = function buildChoicesMap(replaceChoices) {
  var choices = {};
  replaceChoices.forEach(function (choice) {
    var key = choice.value;
    choices[key] = choice.tagLabel || choice.label;
  });
  return choices;
};

var getTagPositions = function getTagPositions(text) {
  var lines = text.split('\n');
  var re = /\{\{.+?\}\}/g;
  var positions = [];
  var m;

  for (var i = 0; i < lines.length; i++) {
    while ((m = re.exec(lines[i])) !== null) {
      var tag = m[0].substring(2, m[0].length - 2);
      positions.push({
        line: i,
        start: m.index,
        stop: m.index + m[0].length,
        tag: tag
      });
    }
  }
  return positions;
};

/*
   Given a CodeMirror document position like {line: 0, ch: 10}, return
   the tag position object for that position, for example {line: 0,
   start: 8, stop: 12}

   When clicking on a pretty tag, CodeMirror .getCursor() may return
   either the position of the start or the end of the tag, so we use
   this function to normalize it.

   Clicking on a pretty tag is jumpy - the cursor goes from one end to
   the other each time you click it. We should probably fix that, and
   the need for this function might go away.
*/
var getTrueTagPosition = function getTrueTagPosition(text, cmPos) {
  var positions = getTagPositions(text);
  return _.find(positions, function (p) {
    return cmPos.line === p.line && cmPos.ch >= p.start && cmPos.ch <= p.stop;
  });
};

/*
   Creates helper to translate between tags like {{firstName}} and
   an encoded representation suitable for use in CodeMirror.
 */
var TagTranslator = function TagTranslator(replaceChoices, humanize) {
  // Map of tag to label 'firstName' --> 'First Name'
  var choices = buildChoicesMap(replaceChoices);

  return {
    /*
       Get label for tag.  For example 'firstName' becomes 'First Name'.
       Returns a humanized version of the tag if we don't have a label for the tag.
     */
    getLabel: function getLabel(tag) {
      var label = choices[tag];
      if (!label) {
        // If tag not found and we have a humanize function, humanize the tag.
        // Otherwise just return the tag.
        label = humanize && humanize(tag) || tag;
      }
      return label;
    },

    getTagPositions: getTagPositions,
    getTrueTagPosition: getTrueTagPosition
  };
};

/*eslint no-script-url:0 */

var toString = function toString(value) {
  if (_.isUndefined(value) || _.isNull(value)) {
    return '';
  }
  return String(value);
};

/*
   Editor for tagged text. Renders text like "hello {{firstName}}"
   with replacement labels rendered in a pill box. Designed to load
   quickly when many separate instances of it are on the same
   page.
 */
var PrettyTextInputHelper = createReactClass({
  displayName: 'PrettyTextInput',

  mixins: [HelperMixin, ClickOutsideMixin],

  componentDidMount: function componentDidMount() {
    this.setOnClickOutside('inputContainer', this.onClickOutside);
  },

  componentWillUnmount: function componentWillUnmount() {
    this.textareaRef = null;
  },
  onClickOutside: function onClickOutside() {
    if (this.textareaRef) {
      this.setState({ isEditing: false });
    }
  },


  getInitialState: function getInitialState() {
    var selectedChoices = this.props.selectedChoices;
    var replaceChoices = this.props.replaceChoices;
    var translator = TagTranslator(selectedChoices.concat(replaceChoices), this.props.config.humanize);

    return {
      // With number values, onFocus never fires, which means it stays read-only. So convert to string.
      value: toString(this.props.value),
      isEditing: false,
      isChoicesOpen: false,
      translator: translator,
      replaceChoices: replaceChoices
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    var selectedChoices = nextProps.selectedChoices;
    var replaceChoices = nextProps.replaceChoices;
    var nextState = {
      replaceChoices: replaceChoices,
      translator: TagTranslator(selectedChoices.concat(replaceChoices), this.props.config.humanize)
    };

    // Not sure what the null/undefined checks are here for, but changed from falsey which was breaking.
    if (this.state.value !== nextProps.value && !_.isUndefined(nextProps.value) && nextProps.value !== null) {
      nextState.value = toString(nextProps.value);
    }

    this.setState(nextState);
  },

  onChange: function onChange(newValue) {
    this.props.onChange(newValue.target.value);
  },

  handleChoiceSelection: function handleChoiceSelection(key, event) {
    var _this = this;

    var textarea = this.textareaRef;
    var value = this.state.value;


    var selectChoice = function selectChoice() {
      // Not worrying about actual selections right now la la la...
      // Assuming no selection.
      var pos = textarea.selectionStart;
      var tag = '{{' + key + '}}';

      var newValue = value.substr(0, pos) + tag + value.substr(pos);

      _this.setState({
        isChoicesOpen: false,
        selectedTagPos: null,
        value: newValue
      });
    };
    if (this.state.isEditing) {
      selectChoice();
    } else if (this.props.readOnly) {
      // hackety hack to stop dropdown choices from toggling
      event.stopPropagation();
      this.isInserting = true;
      this.onChange('{{' + key + '}}');
      this.isInserting = false;
      this.setState({ isChoicesOpen: false });
    } else {
      this.switchToTextarea(selectChoice);
    }
  },

  onFocusClick: function onFocusClick() {
    this.switchToTextarea();
  },

  focus: function focus() {
    if (this.isEditing) {
      this.focusTextarea();
    } else {
      this.switchToTextarea();
    }
  },
  focusTextarea: function focusTextarea() {
    if (this.textareaRef) {
      this.textareaRef.focus();
    }
  },
  onBlur: function onBlur() {
    this.setState({ hasFocus: false }, this.props.onBlur);
  },


  insertBtn: function insertBtn() {
    if (this.isReadOnly() && !this.hasReadOnlyControls()) {
      return null;
    }
    var onInsertClick = function onInsertClick() {
      this.setState({ selectedTagPos: null });
      this.onToggleChoices();
    };

    var props = {
      ref: ref(this, 'toggle'),
      onClick: onInsertClick.bind(this),
      readOnly: this.isReadOnly(),
      field: this.props.field
    };
    return this.props.config.createElement('insert-button', props, 'Insert...');
  },

  choices: function choices() {
    if (this.isReadOnly()) {
      return null;
    }

    return this.props.config.createElement('choices', {
      ref: ref(this, 'choices'),
      onFocusSelect: this.focusTextarea,
      choices: this.state.replaceChoices,
      open: this.state.isChoicesOpen,
      ignoreCloseNodes: this.getCloseIgnoreNodes,
      onSelect: this.handleChoiceSelection,
      onClose: this.onCloseChoices,
      isAccordion: this.props.isAccordion,
      field: this.props.field,
      onChoiceAction: this.onChoiceAction
    });
  },

  onChoiceAction: function onChoiceAction(choice) {
    this.setState({
      isChoicesOpen: !!choice.isOpen
    });
    this.onStartAction(choice.action, choice);
  },

  wrapperTabIndex: function wrapperTabIndex() {
    if (this.props.readOnly || this.state.isEditing) {
      return null;
    }
    return this.props.tabIndex || 0;
  },
  onKeyDown: function onKeyDown(event) {
    if (!this.isReadOnly()) {
      if (event.keyCode === keyCodes.ESC) {
        event.preventDefault();
        event.stopPropagation();
        if (this.state.isChoicesOpen) {
          this.onToggleChoices();
          this.focusTextarea();
        }
      } else if (!this.state.isChoicesOpen) {
        // TODO: sane shortcut for opening choices
        // Below does not work yet. Ends up dumping { into search input.
        // if (this.codeMirror) {
        //   if (event.keyCode === keyCodes['['] && event.shiftKey) {
        //     const cursor = this.codeMirror.getCursor();
        //     const value = this.codeMirror.getValue();
        //     const lines = value.split('\n');
        //     const line = lines[cursor.line];
        //     if (line) {
        //       const prevChar = line[cursor.ch - 1];
        //       if (prevChar === '{') {
        //         this.onToggleChoices();
        //       }
        //     }
        //   }
        // }
      } else {
        if (this.choicesRef && this.choicesRef.onKeyDown) {
          this.choicesRef.onKeyDown(event);
        }
      }
    }
  },
  switchToTextarea: function switchToTextarea() {
    var _this2 = this;

    this.setState({ isEditing: true }, function () {
      _this2.focusTextarea();
    });
  },


  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var textBoxClasses = cx(_.extend({}, this.props.classes, {
      'pretty-text-box': true,
      placeholder: this.hasPlaceholder(),
      'has-focus': this.state.hasFocus
    }));

    var editor = this.state.isEditing ? React.createElement('textarea', {
      className: textBoxClasses,
      value: this.state.value,
      tabIndex: this.wrapperTabIndex(),
      onBlur: this.onBlur,
      onChange: this.onChange,
      onKeyDown: this.onTextareaKeyDown,
      onKeyUp: this.onTextareaKeyUp,
      ref: ref(this, 'textarea')
    }) : React.createElement(
      'div',
      {
        className: textBoxClasses,
        tabIndex: this.wrapperTabIndex(),
        onBlur: this.onBlur,
        ref: ref(this, 'textBox')
      },
      this.createReadonlyEditor()
    );

    // Render read-only version.
    return React.createElement(
      'div',
      {
        onKeyDown: this.onKeyDown,
        className: cx({
          'pretty-text-wrapper': true,
          'choices-open': this.state.isChoicesOpen
        }),
        onTouchStart: this.switchToTextarea,
        ref: ref(this, 'inputContainer')
      },
      React.createElement(
        'div',
        {
          className: 'pretty-text-click-wrapper',
          tabIndex: '0'
          // we need to handle onFocus events for this div for accessibility
          // when the screen reader enters the field it should be the equivalent
          // of a focus click event
          , onFocus: this.onFocusClick,
          role: 'textbox'
        },
        editor
      ),
      this.insertBtn(),
      this.choices()
    );
  },

  getCloseIgnoreNodes: function getCloseIgnoreNodes() {
    return this.toggleRef;
  },

  onToggleChoices: function onToggleChoices() {
    this.setChoicesOpen(!this.state.isChoicesOpen);
  },

  setChoicesOpen: function setChoicesOpen(isOpen) {
    var action = isOpen ? 'open-replacements' : 'close-replacements';
    this.onStartAction(action);
    this.setState({ isChoicesOpen: isOpen });
  },

  onCloseChoices: function onCloseChoices() {
    if (this.state.isChoicesOpen) {
      this.setChoicesOpen(false);
    }
  },

  createEditor: function createEditor() {
    if (this.state.isEditing) {
      /*       this.createCodeMirrorEditor();*/
      this.createTextarea();
    } else {
      this.createReadonlyEditor();
    }
  },

  updateEditor: function updateEditor() {
    if (this.state.isEditing) {
      /* var codeMirrorValue = this.codeMirror.getValue();
       * if (!this.hasPlaceholder() && codeMirrorValue !== this.state.value) {
       *   // switch back to read-only mode to make it easier to render
       *   this.removeCodeMirrorEditor();
       *   this.createReadonlyEditor();
       *   this.setState({
       *     isEditing: false
       *   });
       * }*/
    } else {
      this.createReadonlyEditor();
    }
  },

  maybeSetCursorPosition: function maybeSetCursorPosition(position) {
    if (position && this.codeMirror) {
      //this.codeMirror.setCursor(position);
    }
  },


  /* Return true if we should render the placeholder */
  hasPlaceholder: function hasPlaceholder() {
    return !this.state.value;
  },

  createReadonlyEditor: function createReadonlyEditor() {
    if (this.hasPlaceholder()) {
      return React.createElement(
        'span',
        null,
        this.props.field.placeholder
      );
    }

    var tokens = this.props.config.tokenize(this.state.value);
    var self = this;
    var nodes = tokens.map(function (part, i) {
      if (part.type === 'tag') {
        var label = self.state.translator.getLabel(part.value);
        var props = {
          key: i,
          tag: part.value,
          replaceChoices: self.state.replaceChoices,
          field: self.props.field
        };
        return self.props.config.createElement('pretty-tag', props, label);
      }
      return React.createElement(
        'span',
        { key: i },
        part.value
      );
    });

    //return ReactDOM.render(<span>{nodes}</span>, textBoxNode);
    return React.createElement(
      'span',
      null,
      nodes
    );
  },

  onTextareaKeyDown: function onTextareaKeyDown(event) {
    if (event.shiftKey && event.keyCode === keyCodes['2']) {
      event.preventDefault();
      event.stopPropagation();
      this.setState({ isChoicesOpen: true });
    }
  },
  createTextarea: function createTextarea() {
    return React.createElement('textarea', {
      ref: ref(this, 'textarea'),
      className: 'pretty-text-textarea',
      value: this.state.value,
      onChange: this.onChange,
      onKeyDown: this.onTextareaKeyDown,
      onKeyUp: this.onTextareaKeyUp
    });
  },


  onTagClick: function onTagClick() {
    var cursor = this.codeMirror.getCursor();
    var pos = this.state.translator.getTrueTagPosition(this.state.value, cursor);

    this.setState({ selectedTagPos: pos });
    this.onToggleChoices();
  },

  createTagNode: function createTagNode(pos) {
    var node = document.createElement('span');
    var label = this.state.translator.getLabel(pos.tag);
    var config = this.props.config;

    var props = {
      onClick: this.onTagClick,
      field: this.props.field,
      tag: pos.tag
    };

    ReactDOM.render(config.createElement('pretty-tag', props, label), node);

    return node;
  }
});

// # default-config

/*
This is the default configuration plugin for formatic. To change formatic's
behavior, just create your own plugin function that returns an object with
methods you want to add or override.
*/

var defaultConfigPlugin = function (config) {

  var delegateTo = utils.delegator(config);

  return {

    // Field element factories. Create field elements.

    createElement_Fields: React.createFactory(FieldsField),

    createElement_GroupedFields: React.createFactory(GroupedFieldsField),

    createElement_String: React.createFactory(StringField),

    createElement_SingleLineString: React.createFactory(SingleLineStringField),

    createElement_Password: React.createFactory(PasswordField),

    createElement_Select: React.createFactory(SelectField),

    createElement_PrettySelect: React.createFactory(PrettySelectField),

    createElement_Boolean: React.createFactory(BooleanField),

    createElement_PrettyBoolean: React.createFactory(PrettyBooleanField),

    createElement_CheckboxBoolean: React.createFactory(CheckboxBooleanField),

    createElement_Code: React.createFactory(CodeField),

    createElement_PrettyText: React.createFactory(PrettyTextField),

    createElement_PrettyTag: React.createFactory(PrettyTagField),

    createElement_Array: React.createFactory(ArrayField),

    createElement_CheckboxArray: React.createFactory(CheckboxArrayField),

    createElement_Object: React.createFactory(ObjectField),

    createElement_AssocList: React.createFactory(AssocListField),

    createElement_Json: React.createFactory(JsonField),

    createElement_UnknownField: React.createFactory(UnknownFieldField),

    createElement_Copy: React.createFactory(CopyField),

    // Other element factories. Create helper elements used by field components.

    createElement_Field: React.createFactory(FieldHelper),

    createElement_Label: React.createFactory(LabelHelper),

    createElement_RequiredLabel: React.createFactory(RequiredLabelHelper),

    createElement_Help: React.createFactory(HelpHelper),

    createElement_Choices: React.createFactory(ChoicesHelper),

    createElement_ChoicesItem: React.createFactory(ChoicesItemHelper),

    createElement_Choice: React.createFactory(ChoiceHelper),

    createElement_ChoicesSearch: React.createFactory(ChoicesSearchHelper),

    createElement_LoadingChoices: React.createFactory(LoadingChoicesHelper),

    createElement_LoadingChoice: React.createFactory(LoadingChoiceHelper),

    createElement_ArrayControl: React.createFactory(ArrayControlHelper),

    createElement_ArrayItemControl: React.createFactory(ArrayItemControlHelper),

    createElement_ArrayItemValue: React.createFactory(ArrayItemValueHelper),

    createElement_ArrayItem: React.createFactory(ArrayItemHelper),

    createElement_FieldTemplateChoices: React.createFactory(FieldTemplateChoicesHelper),

    createElement_AddItem: React.createFactory(AddItemHelper),

    createElement_RemoveItem: React.createFactory(RemoveItemHelper),

    createElement_MoveItemForward: React.createFactory(MoveItemForwardHelper),

    createElement_MoveItemBack: React.createFactory(MoveItemBackHelper),

    createElement_AssocListControl: React.createFactory(AssocListControlHelper),

    createElement_AssocListItemControl: React.createFactory(AssocListItemControlHelper),

    createElement_AssocListItemValue: React.createFactory(AssocListItemValueHelper),

    createElement_AssocListItemKey: React.createFactory(AssocListItemKeyHelper),

    createElement_AssocListItem: React.createFactory(AssocListItemHelper),

    createElement_SelectValue: React.createFactory(SelectValueHelper),

    createElement_PrettySelectValue: React.createFactory(PrettySelectValueHelper),

    createElement_PrettySelectInput: React.createFactory(PrettySelectInputHelper),

    createElement_Sample: React.createFactory(SampleHelper),

    createElement_InsertButton: React.createFactory(InsertButtonHelper),

    createElement_ChoiceSectionHeader: React.createFactory(ChoiceSectionHeaderHelper),

    createElement_PrettyTextInput: React.createFactory(PrettyTextInputHelper),

    // Field default value factories. Give a default value for a specific type.

    createDefaultValue_String: function createDefaultValue_String() /* fieldTemplate */{
      return '';
    },

    createDefaultValue_Object: function createDefaultValue_Object() /* fieldTemplate */{
      return {};
    },

    createDefaultValue_Array: function createDefaultValue_Array() /* fieldTemplate */{
      return [];
    },

    createDefaultValue_Boolean: function createDefaultValue_Boolean() /* fieldTemplate */{
      return false;
    },

    createDefaultValue_AssocList: delegateTo('createDefaultValue_Array'),

    createDefaultValue_Fields: delegateTo('createDefaultValue_Object'),

    createDefaultValue_SingleLineString: delegateTo('createDefaultValue_String'),

    createDefaultValue_Select: delegateTo('createDefaultValue_String'),

    createDefaultValue_Json: delegateTo('createDefaultValue_Object'),

    createDefaultValue_CheckboxArray: delegateTo('createDefaultValue_Array'),

    createDefaultValue_CheckboxBoolean: delegateTo('createDefaultValue_Boolean'),

    // Field value coercers. Coerce a value into a value appropriate for a specific type.

    coerceValue_String: function coerceValue_String(fieldTemplate, value) {
      if (_.isString(value)) {
        return value;
      }
      if (_.isUndefined(value) || value === null) {
        return '';
      }
      return JSON.stringify(value);
    },

    coerceValue_Object: function coerceValue_Object(fieldTemplate, value) {
      if (!_.isObject(value)) {
        return {};
      }
      return value;
    },

    coerceValue_AssocList: function coerceValue_AssocList(fieldTemplate, value) {
      if (_.isArray(value)) {
        return value;
      }
      if (_.isObject(value)) {
        return config.objectToAssocList(value);
      }
      return [value];
    },

    coerceValue_Array: function coerceValue_Array(fieldTemplate, value) {
      if (!_.isArray(value)) {
        return [value];
      }
      return value;
    },

    coerceValue_Boolean: function coerceValue_Boolean(fieldTemplate, value) {
      return config.coerceValueToBoolean(value);
    },

    coerceValue_Fields: delegateTo('coerceValue_Object'),

    coerceValue_SingleLineString: delegateTo('coerceValue_String'),

    coerceValue_Select: delegateTo('coerceValue_String'),

    coerceValue_PrettySelect: delegateTo('coerceValue_String'),

    coerceValue_Json: delegateTo('coerceValue_Object'),

    coerceValue_CheckboxArray: delegateTo('coerceValue_Array'),

    coerceValue_CheckboxBoolean: delegateTo('coerceValue_Boolean'),

    coerceValue_PrettyBoolean: delegateTo('coerceValue_Boolean'),

    // Field child fields factories, so some types can have dynamic children.

    createChildFields_Array: function createChildFields_Array(field) {

      return field.value.map(function (arrayItem, i) {
        var childFieldTemplate = config.childFieldTemplateForValue(field, arrayItem);

        var childField = config.createChildField(field, {
          fieldTemplate: childFieldTemplate, key: i, fieldIndex: i, value: arrayItem
        });

        return childField;
      });
    },

    createChildFields_AssocList: function createChildFields_AssocList(field) {

      return field.value.map(function (row, i) {
        var childFieldTemplate = config.childFieldTemplateForValue(field, row.value);

        var childField = config.createChildField(field, {
          fieldTemplate: childFieldTemplate, key: i, fieldIndex: i, value: row.value
        });

        return childField;
      });
    },

    createChildFields_Object: function createChildFields_Object(field) {

      return Object.keys(field.value).map(function (key, i) {
        var childFieldTemplate = config.childFieldTemplateForValue(field, field.value[key]);

        var childField = config.createChildField(field, {
          fieldTemplate: childFieldTemplate, key: key, fieldIndex: i, value: field.value[key]
        });

        return childField;
      });
    },

    // Check if there is a factory for the name.
    hasElementFactory: function hasElementFactory(name) {

      return config['createElement_' + name] ? true : false;
    },

    // Create an element given a name, props, and children.
    createElement: function createElement(name, props, children) {

      if (!props.config) {
        props = _.extend({}, props, { config: config });
      }

      name = config.elementName(name);

      if (config['createElement_' + name]) {
        return config['createElement_' + name](props, children);
      }

      if (name !== 'Unknown') {
        if (config.hasElementFactory('Unknown')) {
          return config.createElement('Unknown', props, children);
        }
      }

      throw new Error('Factory not found for: ' + name);
    },

    // Create a field element given some props. Use context to determine name.
    createFieldElement: function createFieldElement(props) {

      var name = config.fieldTypeName(props.field);

      if (config.hasElementFactory(name)) {
        return config.createElement(name, props);
      }

      return config.createElement('UnknownField', props);
    },

    // Render the root formatic component
    renderFormaticComponent: function renderFormaticComponent(component) {

      var props = component.props;
      var field = config.createRootField(props);

      return React.createElement(
        'div',
        { className: 'formatic' },
        config.createFieldElement({ field: field, onChange: component.onChange, onAction: component.onAction })
      );
    },

    // Render any component.
    renderComponent: function renderComponent(component) {

      var name = component.constructor.displayName;

      if (config['renderComponent_' + name]) {
        return config['renderComponent_' + name](component);
      }

      return component.renderDefault();
    },

    // Render field components.
    renderFieldComponent: function renderFieldComponent(component) {

      return config.renderComponent(component);
    },

    // Normalize an element name.
    elementName: function elementName(name) {
      return utils.dashToPascal(name);
    },

    // Type aliases.

    alias_Dict: 'Object',

    alias_Bool: 'Boolean',

    alias_PrettyTextarea: 'PrettyText',

    alias_SingleLineString: function alias_SingleLineString(fieldTemplate) {
      if (fieldTemplate.replaceChoices) {
        return 'PrettyText';
      } else if (fieldTemplate.choices) {
        return 'Select';
      }
      return 'SingleLineString';
    },

    alias_String: function alias_String(fieldTemplate) {

      if (fieldTemplate.replaceChoices) {
        return 'PrettyText';
      } else if (fieldTemplate.choices) {
        return 'Select';
      } else if (config.fieldTemplateIsSingleLine(fieldTemplate)) {
        return 'SingleLineString';
      }
      return 'String';
    },

    alias_Text: delegateTo('alias_String'),

    alias_Unicode: delegateTo('alias_SingleLineString'),

    alias_Str: delegateTo('alias_SingleLineString'),

    alias_List: 'Array',

    alias_CheckboxList: 'CheckboxArray',

    alias_Fieldset: 'Fields',

    alias_Checkbox: 'CheckboxBoolean',

    // Field factory

    // Given a field, expand all child fields recursively to get the default
    // values of all fields.
    inflateFieldValue: function inflateFieldValue(field, fieldHandler) {

      if (fieldHandler) {
        var stop = fieldHandler(field);
        if (stop === false) {
          return undefined;
        }
      }

      if (config.fieldHasValueChildren(field)) {
        var value = _.clone(field.value);
        var childFields = config.createChildFields(field);
        childFields.forEach(function (childField) {
          if (config.isKey(childField.key)) {
            value[childField.key] = config.inflateFieldValue(childField, fieldHandler);
          } else {
            // a child with no key might have sub-children with keys
            var obj = config.inflateFieldValue(childField, fieldHandler);
            _.extend(value, obj);
          }
        });
        return value;
      } else {
        return field.value;
      }
    },

    // Initialize the root field.
    initRootField: function initRootField() /* field, props */{},

    // Initialize every field.
    initField: function initField() /* field */{},

    // If an array of field templates are passed in, this method is used to
    // wrap the fields inside a single root field template.
    wrapFieldTemplates: function wrapFieldTemplates(fieldTemplates) {
      return {
        type: 'fields',
        plain: true,
        fields: fieldTemplates
      };
    },

    // Given the props that are passed in, create the root field.
    createRootField: function createRootField(props) {

      var fieldTemplate = props.fieldTemplate || props.fieldTemplates || props.field || props.fields;
      var value = props.value;

      if (!fieldTemplate) {
        fieldTemplate = config.createFieldTemplateFromValue(value);
      }

      if (_.isArray(fieldTemplate)) {
        fieldTemplate = config.wrapFieldTemplates(fieldTemplate);
      }

      var field = _.extend({}, fieldTemplate, { rawFieldTemplate: fieldTemplate });
      if (config.hasValue(fieldTemplate, value)) {
        field.value = config.coerceValue(fieldTemplate, value);
      } else {
        field.value = config.createDefaultValue(fieldTemplate);
      }

      config.initRootField(field, props);
      config.initField(field);

      if (value === null || config.isEmptyObject(value) || _.isUndefined(value)) {
        field.value = config.inflateFieldValue(field);
      }

      if (props.readOnly) {
        field.readOnly = true;
      }

      return field;
    },

    // Given the props that are passed in, create the value that will be displayed
    // by all the components.
    createRootValue: function createRootValue(props, fieldHandler) {

      var field = config.createRootField(props);

      return config.inflateFieldValue(field, fieldHandler);
    },

    validateRootValue: function validateRootValue(props) {

      var errors = [];

      config.createRootValue(props, function (field) {
        var fieldErrors = config.fieldErrors(field);
        if (fieldErrors.length > 0) {
          errors.push({
            path: config.fieldValuePath(field),
            errors: fieldErrors
          });
        }
      });

      return errors;
    },

    isValidRootValue: function isValidRootValue(props) {

      var isValid = true;

      config.createRootValue(props, function (field) {
        if (config.fieldErrors(field).length > 0) {
          isValid = false;
          return false;
        }

        return undefined;
      });

      return isValid;
    },

    validateField: function validateField(field, errors) {

      if (field.value === undefined || field.value === '') {
        if (config.fieldIsRequired(field)) {
          errors.push({
            type: 'required'
          });
        }
      }
    },

    cssTransitionWrapper: function cssTransitionWrapper() {
      for (var _len = arguments.length, children = Array(_len), _key = 0; _key < _len; _key++) {
        children[_key] = arguments[_key];
      }

      return React.createElement(
        reactTransitionGroup.CSSTransitionGroup,
        {
          transitionName: 'reveal',
          transitionEnterTimeout: 100,
          transitionLeaveTimeout: 100
        },
        children
      );
    },

    // Create dynamic child fields for a field.
    createChildFields: function createChildFields(field) {

      var typeName = config.fieldTypeName(field);

      if (config['createChildFields_' + typeName]) {
        return config['createChildFields_' + typeName](field);
      }

      return config.fieldChildFieldTemplates(field).map(function (childField, i) {
        var childValue = field.value;
        if (config.isKey(childField.key)) {
          childValue = field.value[childField.key];
        }
        return config.createChildField(field, {
          fieldTemplate: childField, key: childField.key, fieldIndex: i, value: childValue
        });
      });
    },

    // Create a single child field for a parent field.
    createChildField: function createChildField(parentField, options) {

      var childValue = options.value;

      var childField = _.extend({}, options.fieldTemplate, {
        key: options.key, parent: parentField, fieldIndex: options.fieldIndex,
        rawFieldTemplate: options.fieldTemplate
      });

      if (config.hasValue(options.fieldTemplate, childValue)) {
        childField.value = config.coerceValue(options.fieldTemplate, childValue);
      } else {
        childField.value = config.createDefaultValue(options.fieldTemplate);
      }

      config.initField(childField);

      return childField;
    },

    // Create a temporary field and extract its value.
    createNewChildFieldValue: function createNewChildFieldValue(parentField, itemFieldIndex) {

      var childFieldTemplate = config.fieldItemFieldTemplates(parentField)[itemFieldIndex];

      var newValue = config.fieldTemplateValue(childFieldTemplate);

      // Just a placeholder key. Should not be important.
      var key = '__unknown_key__';

      if (_.isArray(parentField.value)) {
        // Just a placeholder position for an array.
        key = parentField.value.length;
      }

      // Just a placeholder field index. Should not be important.
      var fieldIndex = 0;
      if (_.isObject(parentField.value)) {
        fieldIndex = Object.keys(parentField.value).length;
      }

      var childField = config.createChildField(parentField, {
        fieldTemplate: childFieldTemplate, key: key, fieldIndex: fieldIndex, value: newValue
      });

      newValue = config.inflateFieldValue(childField);

      return newValue;
    },

    // Given a value, create a field template for that value.
    createFieldTemplateFromValue: function createFieldTemplateFromValue(value) {

      var field = {
        type: 'json'
      };
      if (_.isString(value)) {
        field = {
          type: 'string'
        };
      } else if (_.isNumber(value)) {
        field = {
          type: 'number'
        };
      } else if (_.isBoolean(value)) {
        field = {
          type: 'boolean'
        };
      } else if (_.isArray(value)) {
        var arrayItemFields = value.map(function (childValue, i) {
          var childField = config.createFieldTemplateFromValue(childValue);
          childField.key = i;
          return childField;
        });
        field = {
          type: 'array',
          fields: arrayItemFields
        };
      } else if (_.isObject(value)) {
        var objectItemFields = Object.keys(value).map(function (key) {
          var childField = config.createFieldTemplateFromValue(value[key]);
          childField.key = key;
          childField.label = config.humanize(key);
          return childField;
        });
        field = {
          type: 'object',
          fields: objectItemFields
        };
      } else if (_.isNull(value)) {
        field = {
          type: 'json'
        };
      }
      return field;
    },

    // Default value factory

    createDefaultValue: function createDefaultValue(fieldTemplate) {

      var defaultValue = config.fieldTemplateDefaultValue(fieldTemplate);

      if (!_.isUndefined(defaultValue)) {
        return utils.deepCopy(defaultValue);
      }

      var typeName = config.fieldTypeName(fieldTemplate);

      if (config['createDefaultValue_' + typeName]) {
        return config['createDefaultValue_' + typeName](fieldTemplate);
      }

      return '';
    },

    // Field helpers

    // Determine if a value "exists".
    hasValue: function hasValue(fieldTemplate, value) {
      return value !== null && !_.isUndefined(value);
    },

    // Coerce a value to value appropriate for a field.
    coerceValue: function coerceValue(field, value) {

      var typeName = config.fieldTypeName(field);

      if (config['coerceValue_' + typeName]) {
        return config['coerceValue_' + typeName](field, value);
      }

      return value;
    },

    // Given a field and a child value, find the appropriate field template for
    // that child value.
    childFieldTemplateForValue: function childFieldTemplateForValue(field, childValue) {

      var fieldTemplate;

      var fieldTemplates = config.fieldItemFieldTemplates(field);

      fieldTemplate = _.find(fieldTemplates, function (itemFieldTemplate) {
        return config.matchesFieldTemplateToValue(itemFieldTemplate, childValue);
      });

      if (fieldTemplate) {
        return fieldTemplate;
      } else {
        return config.createFieldTemplateFromValue(childValue);
      }
    },

    // Determine if a value is a match for a field template.
    matchesFieldTemplateToValue: function matchesFieldTemplateToValue(fieldTemplate, value) {
      var match = fieldTemplate.match;
      if (!match) {
        return true;
      }
      return _.every(Object.keys(match), function (key) {
        return _.isEqual(match[key], value[key]);
      });
    },

    // Field template helpers

    // Normalized (PascalCase) type name for a field.
    fieldTemplateTypeName: function fieldTemplateTypeName(fieldTemplate) {

      var typeName = utils.dashToPascal(fieldTemplate.type || 'undefined');

      var alias = config['alias_' + typeName];

      if (alias) {
        if (_.isFunction(alias)) {
          return alias.call(config, fieldTemplate);
        } else {
          return alias;
        }
      }

      if (fieldTemplate.list) {
        typeName = 'Array';
      }

      return typeName;
    },

    // Default value for a field template.
    fieldTemplateDefaultValue: function fieldTemplateDefaultValue(fieldTemplate) {

      if (!_.isUndefined(fieldTemplate.default)) {
        return config.coerceValue(fieldTemplate, fieldTemplate.default);
      }

      return fieldTemplate.default;
    },

    // Value for a field template. Used to determine the value of a new child
    // field.
    fieldTemplateValue: function fieldTemplateValue(fieldTemplate) {

      // This logic might be brittle.

      var defaultValue = config.fieldTemplateDefaultValue(fieldTemplate);

      var match = config.fieldTemplateMatch(fieldTemplate);

      if (_.isUndefined(defaultValue) && !_.isUndefined(match)) {
        return utils.deepCopy(match);
      }

      return config.createDefaultValue(fieldTemplate);
    },

    // Match rule for a field template.
    fieldTemplateMatch: function fieldTemplateMatch(fieldTemplate) {
      return fieldTemplate.match;
    },

    // Determine if a field template has a single-line value.
    fieldTemplateIsSingleLine: function fieldTemplateIsSingleLine(fieldTemplate) {
      return fieldTemplate.isSingleLine || fieldTemplate.is_single_line || fieldTemplate.type === 'single-line-string' || fieldTemplate.type === 'SingleLineString';
    },

    // Field helpers

    // Get an array of keys representing the path to a value.
    fieldValuePath: function fieldValuePath(field) {

      var parentPath = [];

      if (field.parent) {
        parentPath = config.fieldValuePath(field.parent);
      }

      return parentPath.concat(field.key).filter(function (key) {
        return !_.isUndefined(key) && key !== '';
      });
    },

    // Clone a field with a different value.
    fieldWithValue: function fieldWithValue(field, value) {
      return _.extend({}, field, { value: value });
    },

    fieldTypeName: delegateTo('fieldTemplateTypeName'),

    // Field is loading choices.
    fieldIsLoading: function fieldIsLoading(field) {
      return field.isLoading;
    },

    // Get the choices for a dropdown field.
    fieldChoices: function fieldChoices(field) {

      return config.normalizeChoices(field.choices);
    },

    // Get the choices for a pretty dropdown field.
    fieldPrettyChoices: function fieldPrettyChoices(field) {

      return config.normalizePrettyChoices(field.choices);
    },

    // Get a set of boolean choices for a field.
    fieldBooleanChoices: function fieldBooleanChoices(field) {

      var choices = config.fieldChoices(field);

      if (choices.length === 0) {
        return [{
          label: 'yes',
          value: true
        }, {
          label: 'no',
          value: false
        }];
      }

      return choices.map(function (choice) {
        if (_.isBoolean(choice.value)) {
          return choice;
        }
        return _.extend({}, choice, {
          value: config.coerceValueToBoolean(choice.value)
        });
      });
    },

    // Get a set of replacement choices for a field.
    fieldReplaceChoices: function fieldReplaceChoices(field) {

      return config.normalizeChoices(field.replaceChoices);
    },

    // The active selected choice could be unavailable in the current list of
    // choices. This provides the selected choice in that case.
    fieldSelectedChoice: function fieldSelectedChoice(field) {

      return field.selectedChoice || null;
    },

    // The active replace labels could be unavilable in the current list of
    // replace choices. This provides the currently used replace labels in
    // that case.
    fieldSelectedReplaceChoices: function fieldSelectedReplaceChoices(field) {

      return config.normalizeChoices(field.selectedReplaceChoices);
    },

    // Get a label for a field.
    fieldLabel: function fieldLabel(field) {
      return field.label;
    },

    // Get a placeholder (just a default display value, not a default value) for a field.
    fieldPlaceholder: function fieldPlaceholder(field) {
      return field.placeholder;
    },

    // Get the help text for a field.
    fieldHelpText: function fieldHelpText(field) {
      return field.help_text_html || field.help_text || field.helpText || field.helpTextHtml;
    },

    // Get whether or not a field is required.
    fieldIsRequired: function fieldIsRequired(field) {
      return field.required ? true : false;
    },

    fieldHasSearch: function fieldHasSearch(field) {
      return _.isUndefined(field.hasSearch) ? true : field.hasSearch;
    },

    // Determine if value for this field is not a leaf value.
    fieldHasValueChildren: function fieldHasValueChildren(field) {

      var defaultValue = config.createDefaultValue(field);

      if (_.isObject(defaultValue) || _.isArray(defaultValue)) {
        return true;
      }

      return false;
    },

    // Get the child field templates for this field.
    fieldChildFieldTemplates: function fieldChildFieldTemplates(field) {
      return field.fields || [];
    },

    // Get the field templates for each item of this field. (For dynamic children,
    // like arrays.)
    fieldItemFieldTemplates: function fieldItemFieldTemplates(field) {
      if (!field.itemFields) {
        return [{ type: 'text' }];
      }
      if (!_.isArray(field.itemFields)) {
        return [field.itemFields];
      }
      return field.itemFields;
    },

    // Template for a custom field for a dropdown.
    fieldCustomFieldTemplate: function fieldCustomFieldTemplate(field) {
      return field.customField;
    },

    fieldIsSingleLine: delegateTo('fieldTemplateIsSingleLine'),

    // Get whether or not a field is collapsed.
    fieldIsCollapsed: function fieldIsCollapsed(field) {
      return field.collapsed ? true : false;
    },

    // Get wheter or not a field can be collapsed.
    fieldIsCollapsible: function fieldIsCollapsible(field) {
      return field.collapsible || !_.isUndefined(field.collapsed);
    },

    // Get the number of rows for a field.
    fieldRows: function fieldRows(field) {
      return field.rows;
    },

    fieldErrors: function fieldErrors(field) {

      var errors = [];

      if (config.isKey(field.key)) {
        config.validateField(field, errors);
      }

      return errors;
    },

    fieldMatch: delegateTo('fieldTemplateMatch'),

    // Return true if field is read-only, or is a descendant of a read-only field
    fieldIsReadOnly: function fieldIsReadOnly(field) {
      if (field.readOnly) {
        return true;
      } else if (field.parent) {
        return config.fieldIsReadOnly(field.parent);
      } else {
        return false;
      }
    },

    // Return true if field has read-only controls. Useful for read-only controls used
    // in demo screenshot type effects, where you want it to look just like the real
    // thing, but read-only.
    fieldHasReadOnlyControls: function fieldHasReadOnlyControls(field) {
      if (field.hasReadOnlyControls) {
        return true;
      } else if (field.parent) {
        return config.fieldHasReadOnlyControls(field.parent);
      } else {
        return false;
      }
    },


    // Other helpers

    // Convert an object into an array of key / value objects
    objectToAssocList: function objectToAssocList(obj) {
      var array = [];
      _.each(Object.keys(obj), function (key) {
        array.push({ key: key, value: obj[key] });
      });
      return array;
    },


    // Convert an array of key / value objects to an object
    assocListToObject: function assocListToObject(assocList) {
      var obj = {};
      _.each(assocList, function (row) {
        obj[row.key] = row.value;
      });
      return obj;
    },


    // Convert a key to a nice human-readable version.
    humanize: function humanize() {
      var property = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      property = String(property).replace(/\{\{/g, '');
      property = property.replace(/\}\}/g, '');
      return property.replace(/_/g, ' ').replace(/(\w+)/g, function (match) {
        return match.charAt(0).toUpperCase() + match.slice(1);
      });
    },

    tokenize: function tokenize(text) {
      text = String(text);
      if (text === '') {
        return [];
      }

      var regexp = /(\{\{|\}\})/;
      var parts = text.split(regexp);

      var tokens = [];
      var inTag = false;
      parts.forEach(function (part) {
        if (part === '{{') {
          inTag = true;
        } else if (part === '}}') {
          inTag = false;
        } else if (inTag) {
          tokens.push({ type: 'tag', value: part });
        } else {
          tokens.push({ type: 'string', value: part });
        }
      });
      return tokens;
    },


    // Normalize some choices for a drop-down.
    normalizeChoices: function normalizeChoices(choices) {

      if (!choices) {
        return [];
      }

      // Convert comma separated string to array of strings.
      if (_.isString(choices)) {
        choices = choices.split(',');
      }

      // Convert object to array of objects with `value` and `label` properties.
      if (!_.isArray(choices) && _.isObject(choices)) {
        choices = Object.keys(choices).map(function (key) {
          return {
            value: key,
            label: choices[key]
          };
        });
      }

      // Copy the array of choices so we can manipulate them.
      choices = choices.slice(0);

      // Array of choice arrays should be flattened.
      choices = _.compact(_.flatten(choices));

      var choicesWithLabels = choices.map(function (choice) {
        // Convert any string choices to objects with `value` and `label`
        // properties.
        var maybeStringChoice = _.isString(choice) ? {
          value: choice,
          label: config.humanize(choice)
        } : choice;

        return !maybeStringChoice.label ? Object.assign({}, maybeStringChoice, { label: config.humanize(choice.value) }) : maybeStringChoice;
      });

      return choicesWithLabels;
    },

    // Normalize choices for a pretty drop down, with 'sample' values
    normalizePrettyChoices: function normalizePrettyChoices(choices) {
      if (!_.isArray(choices) && _.isObject(choices)) {
        choices = Object.keys(choices).map(function (key) {
          return {
            value: key,
            label: choices[key],
            sample: key
          };
        });
      }

      return config.normalizeChoices(choices);
    },

    // Coerce a value to a boolean
    coerceValueToBoolean: function coerceValueToBoolean(value) {
      if (!_.isString(value)) {
        // Just use the default truthiness.
        return value ? true : false;
      }
      value = value.toLowerCase();
      if (value === '' || value === 'no' || value === 'off' || value === 'false' || value === '0') {
        return false;
      }
      return true;
    },

    // Determine if a value is a valid key.
    isKey: function isKey(key) {
      return _.isNumber(key) && key >= 0 || _.isString(key) && key !== '';
    },

    // Fast way to check for empty object.
    isEmptyObject: function isEmptyObject(obj) {
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          return false;
        }
      }
      return true;
    },

    actionChoiceLabel: function actionChoiceLabel(action) {
      return utils.capitalize(action).replace(/[-]/g, ' ');
    },

    sortChoices: function sortChoices(choices) {
      return choices;
    },

    isSearchStringInChoice: function isSearchStringInChoice(searchString, choice) {
      return choice.label && choice.label.toLowerCase().indexOf(searchString.toLowerCase()) > -1;
    },

    isRemovalOfLastArrayItemAllowed: function isRemovalOfLastArrayItemAllowed() /* field */{
      return true;
    },
    isRemovalOfLastAssocListItemAllowed: function isRemovalOfLastAssocListItemAllowed() /* field */{
      return true;
    }
  };
};

// # resize mixin

/*
You'd think it would be pretty easy to detect when a DOM element is resized.
And you'd be wrong. There are various tricks, but none of them work very well.
So, using good ol' polling here. To try to be as efficient as possible, there
is only a single setInterval used for all elements. To use:

```js
import createReactClass from 'create-react-class';

import ResizeMixin from '../../mixins/resize';

export default createReactClass({

  mixins: [ResizeMixin],

  onResize: function () {
    console.log('resized!');
  },

  componentDidMount: function () {
    this.setOnResize('myText', this.onResize);
  },

  onChange: function () {
    ...
  },

  render: function () {
    return React.DOM.textarea({ref: 'myText', value: this.props.value, onChange: ...})
  }
});
```
*/

var id = 0;

var resizeIntervalElements = {};
var resizeIntervalElementsCount = 0;
var resizeIntervalTimer = null;

var checkElements = function checkElements() {
  Object.keys(resizeIntervalElements).forEach(function (key) {
    var element = resizeIntervalElements[key];
    if (element.clientWidth !== element.__prevClientWidth || element.clientHeight !== element.__prevClientHeight) {
      element.__prevClientWidth = element.clientWidth;
      element.__prevClientHeight = element.clientHeight;
      var handlers = element.__resizeHandlers;
      handlers.forEach(function (handler) {
        handler();
      });
    }
  }, 100);
};

var addResizeIntervalHandler = function addResizeIntervalHandler(element, fn) {
  if (resizeIntervalTimer === null) {
    resizeIntervalTimer = setInterval(checkElements, 100);
  }
  if (!('__resizeId' in element)) {
    id++;
    element.__prevClientWidth = element.clientWidth;
    element.__prevClientHeight = element.clientHeight;
    element.__resizeId = id;
    resizeIntervalElementsCount++;
    resizeIntervalElements[id] = element;
    element.__resizeHandlers = [];
  }
  element.__resizeHandlers.push(fn);
};

var removeResizeIntervalHandlers = function removeResizeIntervalHandlers(element) {
  if (!('__resizeId' in element)) {
    return;
  }
  var resizeId = element.__resizeId;
  delete element.__resizeId;
  delete element.__resizeHandlers;
  delete resizeIntervalElements[resizeId];
  resizeIntervalElementsCount--;
  if (resizeIntervalElementsCount < 1) {
    clearInterval(resizeIntervalTimer);
    resizeIntervalTimer = null;
  }
};

var onResize = function onResize(ref, fn) {
  fn(ref);
};

var ResizeMixin = {

  componentDidMount: function componentDidMount() {
    if (this.onResizeWindow) {
      window.addEventListener('resize', this.onResizeWindow);
    }
    this.resizeElementRefs = {};
  },

  componentWillUnmount: function componentWillUnmount() {
    if (this.onResizeWindow) {
      window.removeEventListener('resize', this.onResizeWindow);
    }
    Object.keys(this.resizeElementRefs).forEach(function (ref) {
      removeResizeIntervalHandlers(this[ref + 'Ref']);
    }.bind(this));
  },

  setOnResize: function setOnResize(ref, fn) {
    if (!this.resizeElementRefs[ref]) {
      this.resizeElementRefs[ref] = true;
    }
    addResizeIntervalHandler(this[ref + 'Ref'], onResize.bind(this, ref, fn));
  }
};

// # scroll mixin

/*
Currently unused.
*/

var ScrollMixin = function (plugin) {

  plugin.exports = {

    componentDidMount: function componentDidMount() {
      if (this.onScrollWindow) {
        window.addEventListener('scroll', this.onScrollWindow);
      }
    },

    componentWillUnmount: function componentWillUnmount() {
      if (this.onScrollWindow) {
        window.removeEventListener('scroll', this.onScrollWindow);
      }
    }
  };
};

// # undo-stack mixin

/*
Gives your component an undo stack.
*/

// http://prometheusresearch.github.io/react-forms/examples/undo.html

var UndoStackMixin = {
  getInitialState: function getInitialState() {
    return { undo: [], redo: [] };
  },

  snapshot: function snapshot() {
    var undo = this.state.undo.concat(this.getStateSnapshot());
    if (typeof this.state.undoDepth === 'number') {
      if (undo.length > this.state.undoDepth) {
        undo.shift();
      }
    }
    this.setState({ undo: undo, redo: [] });
  },

  hasUndo: function hasUndo() {
    return this.state.undo.length > 0;
  },

  hasRedo: function hasRedo() {
    return this.state.redo.length > 0;
  },

  redo: function redo() {
    this._undoImpl(true);
  },

  undo: function undo() {
    this._undoImpl();
  },

  _undoImpl: function _undoImpl(isRedo) {
    var undo = this.state.undo.slice(0);
    var redo = this.state.redo.slice(0);
    var snapshot;

    if (isRedo) {
      if (redo.length === 0) {
        return;
      }
      snapshot = redo.pop();
      undo.push(this.getStateSnapshot());
    } else {
      if (undo.length === 0) {
        return;
      }
      snapshot = undo.pop();
      redo.push(this.getStateSnapshot());
    }

    this.setStateSnapshot(snapshot);
    this.setState({ undo: undo, redo: redo });
  }
};

// # bootstrap plugin

/*
The bootstrap plugin sneaks in some classes to elements so that it plays well
with Twitter Bootstrap.
*/

// Declare some classes and labels for each element.
var modifiers = {

  'Field': { classes: { 'form-group': true } },
  'Help': { classes: { 'help-block': true } },
  'Sample': { classes: { 'help-block': true } },
  'ArrayControl': { classes: { 'form-inline': true } },
  'ArrayItem': { classes: { 'well': true } },
  'AssocListItem': { classes: { 'well': true } },
  'FieldTemplateChoices': { classes: { 'form-control': true } },
  'AddItem': { classes: { 'glyphicon glyphicon-plus': true }, label: '' },
  'RemoveItem': { classes: { 'glyphicon glyphicon-remove': true }, label: '' },
  'MoveItemBack': { classes: { 'glyphicon glyphicon-arrow-up': true }, label: '' },
  'MoveItemForward': { classes: { 'glyphicon glyphicon-arrow-down': true }, label: '' },
  'AssocListItemKey': { classes: { 'form-control': true } },

  'SingleLineString': { classes: { 'form-control': true } },
  'String': { classes: { 'form-control': true } },
  'PrettyText': { classes: { 'form-control': true } },
  'Json': { classes: { 'form-control': true } },
  'SelectValue': { classes: { 'form-control': true } }
};

var bootstrapPlugin = function (config) {

  var _createElement = config.createElement;

  return {
    createElement: function createElement(name, props, children) {

      name = config.elementName(name);

      var modifier = modifiers[name];

      if (modifier) {
        // If there is a modifier for this element, add the classes and label.
        props = _.extend({}, props);
        props.classes = _.extend({}, props.classes, modifier.classes);
        if ('label' in modifier) {
          props.label = modifier.label;
        }
      }

      return _createElement(name, props, children);
    }
  };
};

// # meta plugin

/*
The meta plugin lets you pass in a meta prop to formatic. The prop then gets
passed through as a property for every field. You can then wrap `initField` to
get your meta values.
*/

var metaPlugin = function (config) {

  var _initRootField = config.initRootField;
  var _initField = config.initField;

  return {
    initRootField: function initRootField(field, props) {

      field.meta = props.meta || {};

      _initRootField(field, props);
    },

    initField: function initField(field) {

      if (field.parent && field.parent.meta) {
        field.meta = field.parent.meta;
      }

      _initField(field);
    }
  };
};

// # reference plugin

/*
This plugin allows fields to be strings and reference other fields by key or
id. It also allows a field to extend another field with
extends: ['foo', 'bar'] where 'foo' and 'bar' refer to other keys or ids.
*/

var referencePlugin = function (config) {

  var _initField = config.initField;

  return {
    // Look for a template in this field or any of its parents.
    findFieldTemplate: function findFieldTemplate(field, name) {

      if (field.templates[name]) {
        return field.templates[name];
      }

      if (field.parent) {
        return config.findFieldTemplate(field.parent, name);
      }

      return null;
    },

    // Inherit from any field templates that this field template
    // extends.
    resolveFieldTemplate: function resolveFieldTemplate(field, fieldTemplate) {

      if (!fieldTemplate.extends) {
        return fieldTemplate;
      }

      var ext = fieldTemplate.extends;

      if (!_.isArray(ext)) {
        ext = [ext];
      }

      var bases = ext.map(function (base) {
        var template = config.findFieldTemplate(field, base);
        if (!template) {
          throw new Error('Template ' + base + ' not found.');
        }
        return template;
      });

      var chain = [{}].concat(bases.reverse().concat([fieldTemplate]));
      fieldTemplate = _.extend.apply(_, chain);

      return fieldTemplate;
    },

    // Wrap the initField method.
    initField: function initField(field) {

      var templates = field.templates = {};

      var childFieldTemplates = config.fieldChildFieldTemplates(field);

      // Add each of the child field templates to our template map.
      childFieldTemplates.forEach(function (fieldTemplate) {

        if (_.isString(fieldTemplate)) {
          return;
        }

        var key = fieldTemplate.key;
        var id = fieldTemplate.id;

        if (fieldTemplate.template) {
          fieldTemplate = _.extend({}, fieldTemplate, { template: false });
        }

        if (!_.isUndefined(key) && key !== '') {
          templates[key] = fieldTemplate;
        }

        if (!_.isUndefined(id) && id !== '') {
          templates[id] = fieldTemplate;
        }
      });

      // Resolve any references to other field templates.
      if (childFieldTemplates.length > 0) {
        field.fields = childFieldTemplates.map(function (fieldTemplate) {
          if (_.isString(fieldTemplate)) {
            fieldTemplate = config.findFieldTemplate(field, fieldTemplate);
          }

          return config.resolveFieldTemplate(field, fieldTemplate);
        });

        field.fields = field.fields.filter(function (fieldTemplate) {
          return !fieldTemplate.template;
        });
      }

      var itemFieldTemplates = config.fieldItemFieldTemplates(field);

      // Resolve any of our item field templates. (Field templates for dynamic
      // child fields.)
      if (itemFieldTemplates.length > 0) {
        field.itemFields = itemFieldTemplates.map(function (itemFieldTemplate) {
          if (_.isString(itemFieldTemplate)) {
            itemFieldTemplate = config.findFieldTemplate(field, itemFieldTemplate);
          }

          return config.resolveFieldTemplate(field, itemFieldTemplate);
        });
      }

      _initField(field);
    }
  };
};

// # element-classes plugin

/*
This plugins provides a config method addElementClass that lets you add on a
class to an element.
*/

var elementClassesPlugin = function (config) {

  var _createElement = config.createElement;

  var elementClasses = {};

  return {
    addElementClass: function addElementClass(name, className) {

      name = config.elementName(name);

      if (!elementClasses[name]) {
        elementClasses[name] = {};
      }

      elementClasses[name][className] = true;
    },

    // Wrap the createElement method.
    createElement: function createElement(name, props, children) {

      name = config.elementName(name);

      if (elementClasses[name]) {
        props = _.extend({}, props, { classes: elementClasses[name] });
      }

      return _createElement(name, props, children);
    }
  };
};

// # formatic

/*
The root formatic component.

The root formatic component is actually two components. The main component is
a controlled component where you must pass the value in with each render. This
is actually wrapped in another component which allows you to use formatic as
an uncontrolled component where it retains the state of the value. The wrapper
is what is actually exported.
*/

var createConfig = function createConfig() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var plugins = [defaultConfigPlugin].concat(args);

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

var defaultConfig = createConfig();

// The main formatic component that renders the form.
var FormaticControlledClass = createReactClass({

  displayName: 'FormaticControlled',

  // Respond to any value changes.
  onChange: function onChange(newValue, info) {
    if (!this.props.onChange) {
      return;
    }
    info = _.extend({}, info);
    info.path = this.props.config.fieldValuePath(info.field);
    this.props.onChange(newValue, info);
  },

  // Respond to any actions other than value changes. (For example, focus and
  // blur.)
  onAction: function onAction(info) {
    if (!this.props.onAction) {
      return;
    }
    info = _.extend({}, info);
    info.path = this.props.config.fieldValuePath(info.field);
    this.props.onAction(info);
  },

  // Render the root component by delegating to the config.
  render: function render() {

    var config = this.props.config;

    return config.renderFormaticComponent(this);
  }
});

var FormaticControlled = React.createFactory(FormaticControlledClass);

// A wrapper component that is actually exported and can allow formatic to be
// used in an "uncontrolled" manner. (See uncontrolled components in the React
// documentation for an explanation of the difference.)
var formatic = createReactClass({

  displayName: 'Formatic',

  // Export some stuff as statics.
  statics: {
    createConfig: createConfig,
    availableMixins: {
      clickOutside: ClickOutsideMixin,
      field: FieldMixin,
      helper: HelperMixin,
      resize: ResizeMixin,
      scroll: ScrollMixin,
      undoStack: UndoStackMixin
    },
    plugins: {
      bootstrap: bootstrapPlugin,
      meta: metaPlugin,
      reference: referencePlugin,
      elementClasses: elementClassesPlugin
    },
    utils: utils
  },

  // If we got a value, treat this component as controlled. Either way, retain
  // the value in the state.
  getInitialState: function getInitialState() {
    return {
      isControlled: !_.isUndefined(this.props.value),
      value: _.isUndefined(this.props.value) ? this.props.defaultValue : this.props.value
    };
  },

  // If this is a controlled component, change our state to reflect the new
  // value. For uncontrolled components, ignore any value changes.
  componentWillReceiveProps: function componentWillReceiveProps(newProps) {
    if (this.state.isControlled) {
      if (!_.isUndefined(newProps.value)) {
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
    var action = utils.dashToPascal(info.action);
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

    _.each(this.props, function (propValue, key) {
      if (!(key in props)) {
        props[key] = propValue;
      }
    });

    return FormaticControlled(props);
  }

});

module.exports = formatic;
