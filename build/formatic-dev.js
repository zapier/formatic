!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Formatic=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

// # index

// Export the Formatic React class at the top level.
module.exports = require("./lib/formatic");

},{"./lib/formatic":49}],2:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = require("classnames");

module.exports = React.createClass({

  displayName: "Array",

  mixins: [require("../../mixins/field")],

  // getDefaultProps: function () {
  //   return {
  //     className: plugin.config.className
  //   };
  // },

  nextLookupId: 0,

  getInitialState: function getInitialState() {

    // Need to create artificial keys for the array. Indexes are not good keys,
    // since they change. So, map each position to an artificial key
    var lookups = [];

    var items = this.props.field.value;

    items.forEach((function (item, i) {
      lookups[i] = "_" + this.nextLookupId;
      this.nextLookupId++;
    }).bind(this));

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
        lookups[i] = "_" + this.nextLookupId;
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

    var numItems = field.value.length;
    return config.createElement("field", {
      field: field, plain: this.props.plain
    }, R.div({ className: cx(this.props.classes) },
    // css transitions know to cause event problems
    config.cssTransitionWrapper(fields.map((function (childField, i) {
      return config.createElement("array-item", {
        key: this.state.lookups[i],
        field: childField,
        index: i,
        numItems: numItems,
        onMove: this.onMove,
        onRemove: this.onRemove,
        onChange: this.onChange,
        onAction: this.onBubbleAction
      });
    }).bind(this))), config.createElement("array-control", { field: field, onAppend: this.onAppend })));
  }
});
// # array component

/*
Render a field to edit array values.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/field":51,"classnames":62}],3:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

module.exports = React.createClass({

  displayName: "Boolean",

  mixins: [require("../../mixins/field")],

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

    return config.createElement("field", {
      field: field, plain: this.props.plain
    }, config.createElement("select-value", {
      choices: choices, field: field, onChange: this.onChange, onAction: this.onBubbleAction
    }));
  }
});
// # boolean component

/*
Render a dropdown to handle yes/no boolean values.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/field":51}],4:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var _ = require("../../undash");
var cx = require("classnames");

module.exports = React.createClass({

  displayName: "CheckboxArray",

  mixins: [require("../../mixins/field")],

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
    var choiceNodes = this.refs.choices.getDOMNode().getElementsByTagName("input");
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

    return config.createElement("field", {
      field: field
    }, R.div({ className: cx(this.props.classes), ref: "choices" }, choices.map((function (choice, i) {

      var inputField = R.span({ style: { whiteSpace: "nowrap" } }, R.input({
        name: field.key,
        type: "checkbox",
        value: choice.value,
        checked: field.value.indexOf(choice.value) >= 0 ? true : false,
        onChange: this.onChange,
        onFocus: this.onFocusAction,
        onBlur: this.onBlurAction
      }), " ", R.span({ className: "field-choice-label" }, choice.label));

      if (isInline) {
        return R.span({ key: i, className: "field-choice" }, inputField, " ");
      } else {
        return R.div({ key: i, className: "field-choice" }, inputField, " ", config.createElement("sample", { field: field, choice: choice }));
      }
    }).bind(this))));
  }
});
// # checkbox-array component

/*
Used with array values to supply multiple checkboxes for adding multiple
enumerated values to an array.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/field":51,"../../undash":60,"classnames":62}],5:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = require("classnames");

module.exports = React.createClass({

  displayName: "CheckboxBoolean",

  mixins: [require("../../mixins/field")],

  onChange: function onChange(event) {
    this.onChangeValue(event.target.checked);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;
    var field = this.props.field;

    return config.createElement("field", {
      config: config, field: field, plain: true
    }, R.span({ style: { whiteSpace: "nowrap" } }, R.input({
      type: "checkbox",
      checked: field.value,
      className: cx(this.props.classes),
      onChange: this.onChange,
      onFocus: this.onFocusAction,
      onBlur: this.onBlurAction
    }), R.span({}, " "), R.span({}, config.fieldHelpText(field) || config.fieldLabel(field))));
  }
});
// # checkbox-boolean component

/*
Render a field that can edit a boolean with a checkbox.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/field":51,"classnames":62}],6:[function(require,module,exports){
(function (global){
"use strict";

/* global CodeMirror */
/*eslint no-script-url:0 */

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var _ = require("../../undash");
var cx = require("classnames");

/*
  A very trimmed down field that uses CodeMirror for syntax highlighting *only*.
 */
module.exports = React.createClass({
  displayName: "Code",

  mixins: [require("../../mixins/field")],

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

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;
    var props = { field: field, plain: this.props.plain };
    var tabIndex = field.tabIndex;
    var textBoxClasses = cx(_.extend({}, this.props.classes, { "pretty-text-box": true }));

    // Render read-only version.
    var element = React.createElement(
      "div",
      { className: "pretty-text-wrapper" },
      React.createElement(
        "div",
        { className: textBoxClasses, tabIndex: tabIndex, onFocus: this.onFocusAction, onBlur: this.onBlurAction },
        React.createElement("div", { ref: "textBox", className: "internal-text-wrapper" })
      )
    );

    return config.createElement("field", props, element);
  },

  createCodeMirrorEditor: function createCodeMirrorEditor() {
    var options = {
      lineWrapping: true,
      tabindex: this.props.tabIndex,
      value: String(this.state.value),
      mode: this.props.field.language || null
    };

    if (this.props.field.codeMirrorOptions) {
      options = _.extend({}, options, this.props.field.codeMirrorOptions);
    }

    var textBox = this.refs.textBox.getDOMNode();
    this.codeMirror = CodeMirror(textBox, options);
    this.codeMirror.on("change", this.onCodeMirrorChange);
  },

  removeCodeMirrorEditor: function removeCodeMirrorEditor() {
    var textBoxNode = this.refs.textBox.getDOMNode();
    var cmNode = textBoxNode.firstChild;
    textBoxNode.removeChild(cmNode);
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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/field":51,"../../undash":60,"classnames":62}],7:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = require("classnames");

module.exports = React.createClass({

  displayName: "Copy",

  mixins: [require("../../mixins/field")],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    return R.div({ className: cx(this.props.classes), dangerouslySetInnerHTML: {
        __html: this.props.config.fieldHelpText(this.props.field)
      } });
  }
});
// # copy component

/*
Render non-editable html/text (think article copy).
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/field":51,"classnames":62}],8:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var _ = require("../../undash");
var cx = require("classnames");

module.exports = React.createClass({

  displayName: "Fields",

  mixins: [require("../../mixins/field")],

  onChangeField: function onChangeField(key, newValue, info) {
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

    return config.createElement("field", {
      config: config, field: field, plain: this.props.plain
    }, R.fieldset({ className: cx(this.props.classes) }, fields.map((function (childField, i) {
      var key = childField.key || i;
      return config.createFieldElement({
        key: key || i,
        field: childField,
        onChange: this.onChangeField.bind(this, key), onAction: this.onBubbleAction
      });
    }).bind(this))));
  }

});
// # fields component

/*
Render a field to edit the values of an object with static properties.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/field":51,"../../undash":60,"classnames":62}],9:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = require("classnames");

module.exports = React.createClass({

  displayName: "Json",

  mixins: [require("../../mixins/field")],

  getDefaultProps: function getDefaultProps() {
    return {
      rows: 5
    };
  },

  isValidValue: function isValidValue(value) {

    try {
      JSON.parse(value);
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

    return config.createElement("field", {
      field: config.fieldWithValue(field, this.state.value), plain: this.props.plain
    }, R.textarea({
      className: cx(this.props.classes),
      value: this.state.value,
      onChange: this.onChange,
      style: { backgroundColor: this.state.isValid ? "" : "rgb(255,200,200)" },
      rows: config.fieldRows(field) || this.props.rows,
      onFocus: this.onFocusAction,
      onBlur: this.onBlurAction
    }));
  }
});
// # json component

/*
Textarea editor for JSON. Will validate the JSON before setting the value, so
while the value is invalid, no external state changes will occur.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/field":51,"classnames":62}],10:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var _ = require("../../undash");
var cx = require("classnames");

var tempKeyPrefix = "$$__temp__";

var tempKey = function tempKey(id) {
  return tempKeyPrefix + id;
};

var isTempKey = function isTempKey(key) {
  return key.substring(0, tempKeyPrefix.length) === tempKeyPrefix;
};

// TODO: keep invalid keys as state and don't send in onChange; clone context
// and use clone to create child contexts

module.exports = React.createClass({

  displayName: "Object",

  mixins: [require("../../mixins/field")],

  nextLookupId: 0,

  getInitialState: function getInitialState() {

    var keyToId = {};
    var keys = Object.keys(this.props.field.value);
    var keyOrder = [];
    // Temp keys keeps the key to display, which sometimes may be different
    // than the actual key. For example, duplicate keys are not allowed,
    // but we may temporarily show duplicate keys.
    var tempDisplayKeys = {};

    // Keys don't make good react keys, since we're allowing them to be
    // changed here, so we'll have to create fake keys and
    // keep track of the mapping of real keys to fake keys. Yuck.
    keys.forEach((function (key) {
      var id = ++this.nextLookupId;
      // Map the real key to the id.
      keyToId[key] = id;
      // Keep the ordering of the keys so we don't shuffle things around later.
      keyOrder.push(key);
      // If this is a temporary key that was persisted, best we can do is display
      // a blank.
      // TODO: Probably just not send temporary keys back through. This behavior
      // is actually leftover from an earlier incarnation of formatic where
      // values had to go back to the root.
      if (isTempKey(key)) {
        tempDisplayKeys[id] = "";
      }
    }).bind(this));

    return {
      keyToId: keyToId,
      keyOrder: keyOrder,
      // Temp keys keeps the key to display, which sometimes may be different
      // than the actual key. For example, duplicate keys are not allowed,
      // but we may temporarily show duplicate keys.
      tempDisplayKeys: tempDisplayKeys
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(newProps) {

    var keyToId = this.state.keyToId;
    var newKeyToId = {};
    var tempDisplayKeys = this.state.tempDisplayKeys;
    var newTempDisplayKeys = {};
    var keyOrder = this.state.keyOrder;
    var keys = Object.keys(newProps.field.value);
    var addedKeys = [];

    // Look at the new keys.
    keys.forEach((function (key) {
      // Add new lookup if this key wasn't here last time.
      if (!keyToId[key]) {
        this.nextLookupId++;
        newKeyToId[key] = this.nextLookupId;
        addedKeys.push(key);
      } else {
        newKeyToId[key] = keyToId[key];
      }
      if (isTempKey(key) && newKeyToId[key] in tempDisplayKeys) {
        newTempDisplayKeys[newKeyToId[key]] = tempDisplayKeys[newKeyToId[key]];
      }
    }).bind(this));

    var newKeyOrder = [];

    // Look at the old keys.
    keyOrder.forEach(function (key) {
      // If the key is in the new keys, push it onto the order to retain the
      // same order.
      if (newKeyToId[key]) {
        newKeyOrder.push(key);
      }
    });

    // Put added fields at the end. (So things don't get shuffled.)
    newKeyOrder = newKeyOrder.concat(addedKeys);

    this.setState({
      keyToId: newKeyToId,
      keyOrder: newKeyOrder,
      tempDisplayKeys: newTempDisplayKeys
    });
  },

  onChange: function onChange(key, newValue, info) {
    var newObj = _.extend({}, this.props.field.value);
    newObj[key] = newValue;
    this.onBubbleValue(newObj, info);
  },

  onAppend: function onAppend(itemChoiceIndex) {
    var config = this.props.config;
    var field = this.props.field;
    this.nextLookupId++;

    var keyToId = this.state.keyToId;
    var keyOrder = this.state.keyOrder;
    var tempDisplayKeys = this.state.tempDisplayKeys;

    var id = this.nextLookupId;
    var newKey = tempKey(id);

    keyToId[newKey] = id;
    // Temporarily, we'll show a blank key.
    tempDisplayKeys[id] = "";
    keyOrder.push(newKey);

    this.setState({
      keyToId: keyToId,
      tempDisplayKeys: tempDisplayKeys,
      keyOrder: keyOrder
    });

    var newObj = _.extend(this.props.field.value);

    var newValue = config.createNewChildFieldValue(field, itemChoiceIndex);

    newObj[newKey] = newValue;

    this.onChangeValue(newObj);
  },

  onRemove: function onRemove(key) {
    var newObj = _.extend(this.props.field.value);
    delete newObj[key];
    this.onChangeValue(newObj);
  },

  onMove: function onMove(fromKey, toKey) {
    if (fromKey !== toKey) {
      var keyToId = this.state.keyToId;
      var keyOrder = this.state.keyOrder;
      var tempDisplayKeys = this.state.tempDisplayKeys;

      var newObj = _.extend(this.props.field.value);

      // If we already have the key we're moving to, then we have to change that
      // key to something else.
      if (keyToId[toKey]) {
        // Make a new
        var tempToKey = tempKey(keyToId[toKey]);
        tempDisplayKeys[keyToId[toKey]] = toKey;
        keyToId[tempToKey] = keyToId[toKey];
        keyOrder[keyOrder.indexOf(toKey)] = tempToKey;
        delete keyToId[toKey];
        this.setState({
          keyToId: keyToId,
          tempDisplayKeys: tempDisplayKeys,
          keyOrder: keyOrder
        });

        newObj[tempToKey] = newObj[toKey];
        delete newObj[toKey];
      }

      if (!toKey) {
        toKey = tempKey(keyToId[fromKey]);
        tempDisplayKeys[keyToId[fromKey]] = "";
      }
      keyToId[toKey] = keyToId[fromKey];
      delete keyToId[fromKey];
      keyOrder[keyOrder.indexOf(fromKey)] = toKey;

      this.setState({
        keyToId: keyToId,
        keyOrder: keyOrder,
        tempDisplayKeys: tempDisplayKeys
      });

      newObj[toKey] = newObj[fromKey];
      delete newObj[fromKey];

      this.onChangeValue(newObj);

      // Check if our fromKey has opened up a spot.
      if (fromKey && fromKey !== toKey) {
        if (!(fromKey in newObj)) {
          Object.keys(newObj).forEach((function (key) {
            if (!isTempKey(key)) {
              return;
            }
            var id = keyToId[key];
            var displayKey = tempDisplayKeys[id];
            if (fromKey === displayKey) {
              this.onMove(key, displayKey);
            }
          }).bind(this));
        }
      }
    }
  },

  getFields: function getFields() {
    var config = this.props.config;
    var field = this.props.field;

    var fields = config.createChildFields(field);

    var keyToField = {};

    _.each(fields, function (childField) {
      keyToField[childField.key] = childField;
    });

    return this.state.keyOrder.map(function (key) {
      return keyToField[key];
    });
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;
    var field = this.props.field;

    var fields = this.getFields();

    return config.createElement("field", {
      field: field, plain: this.props.plain
    }, R.div({ className: cx(this.props.classes) }, config.cssTransitionWrapper(fields.map((function (childField) {
      var displayKey = this.state.tempDisplayKeys[this.state.keyToId[childField.key]];
      if (_.isUndefined(displayKey)) {
        displayKey = childField.key;
      }
      return config.createElement("object-item", {
        key: this.state.keyToId[childField.key],
        field: childField,
        onMove: this.onMove,
        onRemove: this.onRemove,
        onChange: this.onChange,
        onAction: this.onBubbleAction,
        displayKey: displayKey,
        itemKey: childField.key
      });
    }).bind(this))), config.createElement("object-control", { field: field, onAppend: this.onAppend })));
  }
});
// # object component

/*
Render a field to edit an object with dynamic child fields.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/field":51,"../../undash":60,"classnames":62}],11:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = require("classnames");

module.exports = React.createClass({

  displayName: "SingleLineString",

  mixins: [require("../../mixins/field")],

  onChange: function onChange(event) {
    this.onChangeValue(event.target.value);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;
    var field = this.props.field;

    return config.createElement("field", {
      config: config, field: field, plain: this.props.plain
    }, R.input({
      type: "password",
      value: this.props.field.value,
      className: cx(this.props.classes),
      onChange: this.onChange,
      onFocus: this.onFocusAction,
      onBlur: this.onBlurAction
    }));
  }
});
// # single-line-string component

/*
Render a single line text input.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/field":51,"classnames":62}],12:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

module.exports = React.createClass({

  displayName: "PrettyBoolean",

  mixins: [require("../../mixins/field")],

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

    return config.createElement("field", {
      field: field, plain: this.props.plain
    }, config.createElement("pretty-select-value", {
      choices: choices, field: field, onChange: this.onChange, onAction: this.onBubbleAction
    }));
  }
});
// # pretty boolean component

/*
Render pretty boolean component with non-native drop-down
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/field":51}],13:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

module.exports = React.createClass({

  displayName: "PrettySelect",

  mixins: [require("../../mixins/field")],

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

  renderDefault: function renderDefault() {

    var config = this.props.config;
    var field = this.props.field;

    return config.createElement("field", {
      config: config, field: field, plain: this.props.plain, classes: this.props.classes
    }, config.createElement("pretty-select-value", {
      choices: this.state.choices, field: field, onChange: this.onChangeValue, onAction: this.onBubbleAction
    }));
  }
});
// # select component

/*
Render select element to give a user choices for the value of a field. Renders non-native
select drop down and supports fancier renderings.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/field":51}],14:[function(require,module,exports){
(function (global){
"use strict";

/*eslint no-script-url:0 */

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var _ = require("../../undash");
var cx = require("classnames");

/*
   Wraps a PrettyTextHelper to be a stand alone field.
 */
module.exports = React.createClass({

  displayName: "PrettyText",

  mixins: [require("../../mixins/field")],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;
    var field = this.props.field;
    var props = { field: field, plain: this.props.plain };
    var tabIndex = field.tabIndex;

    var element = config.createElement("pretty-text-helper", {
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
      ref: "textBox"
    });

    return config.createElement("field", props, element);
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/field":51,"../../undash":60,"classnames":62}],15:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

module.exports = React.createClass({

  displayName: "Select",

  mixins: [require("../../mixins/field")],

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

    return config.createElement("field", {
      config: config, field: field, plain: this.props.plain
    }, config.createElement("select-value", {
      choices: this.state.choices, field: field, onChange: this.onChangeValue, onAction: this.onBubbleAction
    }));
  }
});
// # select component

/*
Render select element to give a user choices for the value of a field. Note
it should support values other than strings. Currently this is only tested for
boolean values, but it _should_ work for other values.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/field":51}],16:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = require("classnames");

module.exports = React.createClass({

  displayName: "SingleLineString",

  mixins: [require("../../mixins/field")],

  onChange: function onChange(event) {
    this.onChangeValue(event.target.value);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;
    var field = this.props.field;

    return config.createElement("field", {
      config: config, field: field, plain: this.props.plain
    }, R.input({
      type: "text",
      value: this.props.field.value,
      className: cx(this.props.classes),
      onChange: this.onChange,
      onFocus: this.onFocusAction,
      onBlur: this.onBlurAction
    }));
  }
});
// # single-line-string component

/*
Render a single line text input.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/field":51,"classnames":62}],17:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = require("classnames");

module.exports = React.createClass({

  displayName: "String",

  mixins: [require("../../mixins/field")],

  onChange: function onChange(event) {
    this.onChangeValue(event.target.value);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;
    var field = this.props.field;

    return config.createElement("field", {
      config: config, field: field, plain: this.props.plain
    }, R.textarea({
      value: field.value,
      className: cx(this.props.classes),
      rows: field.rows || this.props.rows,
      onChange: this.onChange,
      onFocus: this.onFocusAction,
      onBlur: this.onBlurAction
    }));
  }
});
// # string component

/*
Render a field that can edit a string value.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/field":51,"classnames":62}],18:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = React.createClass({

  displayName: "Unknown",

  mixins: [require("../../mixins/field")],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    return R.div({}, R.div({}, "Component not found for: "), R.pre({}, JSON.stringify(this.props.field.rawFieldTemplate, null, 2)));
  }

});
// # unknown component

/*
Render a field with an unknown type.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/field":51}],19:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = require("classnames");

module.exports = React.createClass({

  displayName: "AddItem",

  mixins: [require("../../mixins/helper")],

  getDefaultProps: function getDefaultProps() {
    return {
      label: "[add]"
    };
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    return R.span({ className: cx(this.props.classes), onClick: this.props.onClick }, this.props.label);
  }
});
// # add-item component

/*
The add button to append an item to a field.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":52,"classnames":62}],20:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = require("classnames");

module.exports = React.createClass({

  displayName: "ArrayControl",

  mixins: [require("../../mixins/helper")],

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

    if (fieldTemplates.length > 0) {
      typeChoices = config.createElement("field-template-choices", {
        field: field, fieldTemplateIndex: this.state.fieldTemplateIndex, onSelect: this.onSelect
      });
    }

    return R.div({ className: cx(this.props.classes) }, typeChoices, " ", config.createElement("add-item", { field: field, onClick: this.onAppend }));
  }
});
// # array-control component

/*
Render the item type choices and the add button for an array.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":52,"classnames":62}],21:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = require("classnames");

module.exports = React.createClass({

  displayName: "ArrayItemControl",

  mixins: [require("../../mixins/helper")],

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

    return R.div({ className: cx(this.props.classes) }, config.createElement("remove-item", { field: field, onClick: this.onRemove, onMaybeRemove: this.props.onMaybeRemove }), this.props.index > 0 ? config.createElement("move-item-back", { field: field, onClick: this.onMoveBack }) : null, this.props.index < this.props.numItems - 1 ? config.createElement("move-item-forward", { field: field, onClick: this.onMoveForward }) : null);
  }
});
// # array-item-control component

/*
Render the remove and move buttons for an array field.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":52,"classnames":62}],22:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = require("classnames");

module.exports = React.createClass({

  displayName: "ArrayItemValue",

  mixins: [require("../../mixins/helper")],

  onChangeField: function onChangeField(newValue, info) {
    this.props.onChange(this.props.index, newValue, info);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;

    return R.div({ className: cx(this.props.classes) }, config.createFieldElement({ field: field, onChange: this.onChangeField, onAction: this.onBubbleAction }));
  }
});
// # array-item-value component

/*
Render the value of an array item.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":52,"classnames":62}],23:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = require("classnames");
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = React.createClass({

  displayName: "ArrayItem",

  mixins: [require("../../mixins/helper")],

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
      classes["maybe-removing"] = true;
    }

    return R.div({ className: cx(classes) }, config.createElement("array-item-value", { field: field, index: this.props.index,
      onChange: this.props.onChange, onAction: this.onBubbleAction }), config.createElement("array-item-control", { field: field, index: this.props.index, numItems: this.props.numItems,
      onMove: this.props.onMove, onRemove: this.props.onRemove, onMaybeRemove: this.onMaybeRemove }));
  }
});
// # array-item component

/*
Render an array item.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":52,"classnames":62}],24:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var cx = require("classnames");

module.exports = React.createClass({

  displayName: "ChoiceSectionHeader",

  mixins: [require("../../mixins/helper")],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var choice = this.props.choice;
    return React.createElement(
      "span",
      { className: cx(this.props.classes) },
      choice.label
    );
  }
});
// # ChoiceSectionHeader component

/*
Render section header in choices dropdown
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":52,"classnames":62}],25:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = React.createClass({

  displayName: "Choices",

  mixins: [require("../../mixins/helper"),
  //plugin.require('mixin.resize'),
  //plugin.require('mixin.scroll'),
  require("../../mixins/click-outside")],

  getInitialState: function getInitialState() {
    return {
      maxHeight: null,
      open: this.props.open
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
    this.setOnClickOutside("choices", (function (event) {

      // Make sure we don't find any nodes to ignore.
      if (!_.find(this.getIgnoreCloseNodes(), (function (node) {
        return this.isNodeInside(event.target, node);
      }).bind(this))) {
        this.onClose();
      }
    }).bind(this));

    this.adjustSize();
  },

  onSelect: function onSelect(choice, event) {
    this.setState({ openSection: null });
    this.props.onSelect(choice.value, event);
  },

  onChoiceAction: function onChoiceAction(choice) {
    this.setState({ openSection: null });
    this.props.onChoiceAction(choice);
  },

  onClose: function onClose() {
    this.setState({ openSection: null });
    this.props.onClose();
  },

  onResizeWindow: function onResizeWindow() {
    this.adjustSize();
  },

  onScrollWindow: function onScrollWindow() {
    this.adjustSize();
  },

  adjustSize: function adjustSize() {
    if (this.refs.choices) {
      var node = this.refs.choices.getDOMNode();
      var rect = node.getBoundingClientRect();
      var top = rect.top;
      var windowHeight = window.innerHeight;
      var height = windowHeight - top;
      this.setState({
        maxHeight: height
      });
    }
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    var nextState = {
      open: nextProps.open
    };

    this.setState(nextState, (function () {
      this.adjustSize();
    }).bind(this));
  },

  onScroll: function onScroll() {},

  onWheel: function onWheel() {},

  onHeaderClick: function onHeaderClick(choice) {
    if (this.state.openSection === choice.sectionKey) {
      this.setState({ openSection: null });
    } else {
      this.setState({ openSection: choice.sectionKey }, this.adjustSize);
    }
  },

  hasOneSection: function hasOneSection() {
    var sectionHeaders = this.props.choices.filter(function (c) {
      return c.sectionKey;
    });
    return sectionHeaders.length === 1;
  },

  visibleChoices: (function (_visibleChoices) {
    var _visibleChoicesWrapper = function visibleChoices() {
      return _visibleChoices.apply(this, arguments);
    };

    _visibleChoicesWrapper.toString = function () {
      return _visibleChoices.toString();
    };

    return _visibleChoicesWrapper;
  })(function () {
    var choices = this.props.choices;

    if (choices && choices.length === 0) {
      return [{ value: "///empty///" }];
    }
    if (!this.props.isAccordion) {
      return choices;
    }

    var openSection = this.state.openSection;
    var alwaysExanded = this.hasOneSection();
    var visibleChoices = [];
    var inSection;
    choices.forEach(function (choice) {
      if (choice.sectionKey) {
        inSection = choice.sectionKey === openSection;
      }
      if (alwaysExanded || choice.sectionKey || inSection) {
        visibleChoices.push(choice);
      }
    });
    return visibleChoices;
  }),

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;

    var choices = this.visibleChoices();

    if (this.props.open) {
      return R.div({ ref: "container", onWheel: this.onWheel, onScroll: this.onScroll,
        className: "choices-container", style: {
          userSelect: "none", WebkitUserSelect: "none", position: "absolute",
          maxHeight: this.state.maxHeight ? this.state.maxHeight : null
        } }, config.cssTransitionWrapper(R.ul({ ref: "choices", className: "choices" }, choices.map((function (choice, i) {

        var choiceElement = null;

        if (choice.value === "///loading///") {
          choiceElement = R.a({ href: "JavaScript" + ":", onClick: this.onClose }, R.span({ className: "choice-label" }, config.createElement("loading-choice", { field: this.props.field })));
        } else if (choice.value === "///empty///") {
          choiceElement = R.a({ href: "JavaScript" + ":", onClick: this.onClose }, R.span({ className: "choice-label" }, "No choices available."));
        } else if (choice.action) {
          var labelClasses = "choice-label " + choice.action;

          choiceElement = R.a({ href: "JavaScript" + ":", onClick: this.onChoiceAction.bind(this, choice) }, R.span({ className: labelClasses }, choice.label || this.props.config.actionChoiceLabel(choice.action)), this.props.config.createElement("choice-action-sample", { action: choice.action, choice: choice }));
        } else if (choice.sectionKey) {
          choiceElement = R.a({ href: "JavaScript" + ":", onClick: this.onHeaderClick.bind(this, choice) }, config.createElement("choice-section-header", { choice: choice }));
        } else {
          choiceElement = R.a({ href: "JavaScript" + ":", onClick: this.onSelect.bind(this, choice) }, R.span({ className: "choice-label" }, choice.label), R.span({ className: "choice-sample" }, choice.sample));
        }

        return R.li({ key: i, className: "choice" }, choiceElement);
      }).bind(this)))));
    }

    // not open
    return null;
  }
});
// # Choices component

/*
Render customized (non-native) dropdown choices.
*/

// console.log('stop that!')
// event.preventDefault();
// event.stopPropagation();

// event.preventDefault();
// event.stopPropagation();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/click-outside":50,"../../mixins/helper":52}],26:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = require("classnames");

module.exports = React.createClass({

  displayName: "FieldTemplateChoices",

  mixins: [require("../../mixins/helper")],

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

    var typeChoices = null;
    if (fieldTemplates.length > 1) {
      typeChoices = R.select({ className: cx(this.props.classes), value: this.fieldTemplateIndex, onChange: this.onChange }, fieldTemplates.map(function (fieldTemplate, i) {
        return R.option({ key: i, value: i }, fieldTemplate.label || i);
      }));
    }

    return typeChoices ? typeChoices : R.span(null);
  }
});
// # field-template-choices component

/*
Give a list of choices of item types to create as children of an field.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":52,"classnames":62}],27:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var _ = require("../../undash");
var cx = require("classnames");

module.exports = React.createClass({

  displayName: "Field",

  mixins: [require("../../mixins/helper")],

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
      classes["validation-error-" + error.type] = true;
    });

    if (config.fieldIsRequired(field)) {
      classes.required = true;
    } else {
      classes.optional = true;
    }

    return R.div({ className: cx(classes), style: { display: field.hidden ? "none" : "" } }, config.createElement("label", {
      config: config, field: field,
      index: index, onClick: config.fieldIsCollapsible(field) ? this.onClickLabel : null
    }), config.cssTransitionWrapper(this.state.collapsed ? [] : [config.createElement("help", {
      config: config, field: field,
      key: "help"
    }), this.props.children]));
  }
});
// # field component

/*
Used by any fields to put the label and help text around the field.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":52,"../../undash":60,"classnames":62}],28:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = require("classnames");

module.exports = React.createClass({

  displayName: "Help",

  mixins: [require("../../mixins/helper")],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var helpText = this.props.config.fieldHelpText(this.props.field);

    return helpText ? R.div({ className: cx(this.props.classes), dangerouslySetInnerHTML: { __html: helpText } }) : R.span(null);
  }
});
// # help component

/*
Just the help text block.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":52,"classnames":62}],29:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

module.exports = React.createClass({

  displayName: "InsertButton",

  propTypes: {
    onClick: React.PropTypes.func.isRequired,
    ref: React.PropTypes.string
  },

  mixins: [require("../../mixins/helper")],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    return React.createElement(
      "a",
      { ref: this.props.ref, href: "JavaScript" + ":", onClick: this.props.onClick },
      this.props.children
    );
  }

});
// # button component

/*
  Clickable 'button'
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":52}],30:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = require("classnames");

module.exports = React.createClass({

  displayName: "Label",

  mixins: [require("../../mixins/helper")],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;

    var fieldLabel = config.fieldLabel(field);

    var label = null;
    if (typeof this.props.index === "number") {
      label = "" + (this.props.index + 1) + ".";
      if (fieldLabel) {
        label = label + " " + fieldLabel;
      }
    }

    if (fieldLabel || label) {
      var text = label || fieldLabel;
      if (this.props.onClick) {
        text = R.a({ href: "JavaScript" + ":", onClick: this.props.onClick }, text);
      }
      label = R.label({}, text);
    }

    return R.div({
      className: cx(this.props.classes)
    }, label, " ", R.span({ className: config.fieldIsRequired(field) ? "required-text" : "not-required-text" }));
  }
});
// # label component

/*
Just the label for a field.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":52,"classnames":62}],31:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

module.exports = React.createClass({

  displayName: "LoadingChoice",

  mixins: [require("../../mixins/helper")],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    return React.createElement(
      "span",
      null,
      "Loading choices..."
    );
  }

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":52}],32:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

module.exports = React.createClass({

  displayName: "LoadingChoices",

  mixins: [require("../../mixins/helper")],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    return React.createElement(
      "div",
      null,
      "Loading choices..."
    );
  }

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":52}],33:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = require("classnames");

module.exports = React.createClass({

  displayName: "MoveItemBack",

  mixins: [require("../../mixins/helper")],

  getDefaultProps: function getDefaultProps() {
    return {
      label: "[up]"
    };
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    return R.span({ className: cx(this.props.classes), onClick: this.props.onClick }, this.props.label);
  }
});
// # move-item-back component

/*
Button to move an item backwards in list.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":52,"classnames":62}],34:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = require("classnames");

module.exports = React.createClass({

  displayName: "MoveItemForward",

  mixins: [require("../../mixins/helper")],

  getDefaultProps: function getDefaultProps() {
    return {
      label: "[down]"
    };
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    return R.span({ className: cx(this.props.classes), onClick: this.props.onClick }, this.props.label);
  }
});
// # move-item-forward component

/*
Button to move an item forward in a list.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":52,"classnames":62}],35:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = require("classnames");

module.exports = React.createClass({

  displayName: "ObjectControl",

  mixins: [require("../../mixins/helper")],

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
      typeChoices = config.createElement("field-template-choices", {
        field: field,
        fieldTemplateIndex: this.state.fieldTemplateIndex, onSelect: this.onSelect
      });
    }

    return R.div({ className: cx(this.props.classes) }, typeChoices, " ", config.createElement("add-item", { onClick: this.onAppend }));
  }
});
// # object-control component

/*
Render the item type choices and the add button.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":52,"classnames":62}],36:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = require("classnames");

module.exports = React.createClass({

  displayName: "ObjectItemControl",

  mixins: [require("../../mixins/helper")],

  onRemove: function onRemove() {
    this.props.onRemove(this.props.itemKey);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;

    return R.div({ className: cx(this.props.classes) }, config.createElement("remove-item", { field: field, onClick: this.onRemove }));
  }
});
// # object-item-control component

/*
Render the remove buttons for an object item.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":52,"classnames":62}],37:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = require("classnames");

module.exports = React.createClass({

  displayName: "ObjectItemKey",

  mixins: [require("../../mixins/helper")],

  onChange: function onChange(event) {
    this.props.onChange(event.target.value);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    return R.input({
      className: cx(this.props.classes),
      type: "text",
      value: this.props.displayKey,
      onChange: this.onChange,
      onFocus: this.onFocusAction,
      onBlur: this.onBlurAction
    });
  }
});
// # object-item-key component

/*
Render an object item key editor.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":52,"classnames":62}],38:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = require("classnames");

module.exports = React.createClass({

  displayName: "ObjectItemValue",

  mixins: [require("../../mixins/helper")],

  onChangeField: function onChangeField(newValue, info) {
    this.props.onChange(this.props.itemKey, newValue, info);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;

    return R.div({ className: cx(this.props.classes) }, config.createFieldElement({ field: field, onChange: this.onChangeField, plain: true, onAction: this.onBubbleAction }));
  }
});
// # object-item-value component

/*
Render the value of an object item.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":52,"classnames":62}],39:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = require("classnames");

module.exports = React.createClass({

  displayName: "ObjectItem",

  mixins: [require("../../mixins/helper")],

  onChangeKey: function onChangeKey(newKey) {
    this.props.onMove(this.props.itemKey, newKey);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;

    return R.div({ className: cx(this.props.classes) }, config.createElement("object-item-key", { field: field, onChange: this.onChangeKey, onAction: this.onBubbleAction, displayKey: this.props.displayKey, itemKey: this.props.itemKey }), config.createElement("object-item-value", { field: field, onChange: this.props.onChange, onAction: this.onBubbleAction, itemKey: this.props.itemKey }), config.createElement("object-item-control", { field: field, onRemove: this.props.onRemove, itemKey: this.props.itemKey }));
  }
});
// # object-item component

/*
Render an object item.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":52,"classnames":62}],40:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var cx = require("classnames");

module.exports = React.createClass({

  displayName: "PrettySelectInput",

  mixins: [require("../../mixins/helper")],

  render: function render() {
    return this.renderWithConfig();
  },

  focus: function focus() {
    this.refs.textBox.focus();
  },

  setChoicesOpen: function setChoicesOpen(isOpenChoices) {
    this.refs.textBox.setChoicesOpen(isOpenChoices);
  },

  renderDefault: function renderDefault() {
    return this.props.config.createElement("pretty-text-helper", {
      classes: this.props.classes,
      tabIndex: this.props.field.tabIndex,
      onChange: this.props.onChange,
      onFocus: this.props.onFocus,
      onBlur: this.props.onBlur,
      onAction: this.onBubbleAction,
      field: this.props.field,
      value: this.props.isEnteringCustomValue ? this.props.field.value : this.props.getDisplayValue(),
      selectedChoices: this.props.config.fieldSelectedReplaceChoices(this.props.field),
      replaceChoices: this.props.config.fieldReplaceChoices(this.props.field),
      onTagClick: this.onTagClick,
      ref: "textBox",
      readOnly: !this.props.isEnteringCustomValue
    });

    if (this.props.isEnteringCustomValue) {
      return React.createElement("input", { className: cx(_.extend({}, this.props.classes)), type: "text", value: this.props.field.value,
        onChange: this.props.onChange, onFocus: this.props.onFocus, onBlur: this.props.onBlur });
    }

    return React.createElement("input", { type: "text", value: this.props.getDisplayValue(), readOnly: true, onFocus: this.props.onFocus, onBlur: this.props.onBlur });
  } });
// # pretty-select-input component

/*
   Render an input to be used as the element for typing a custom value into a pretty select.
 */

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":52,"classnames":62}],41:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var cx = require("classnames");

module.exports = React.createClass({

  displayName: "SelectValue",

  mixins: [require("../../mixins/helper")],

  onChange: function onChange(event) {
    var choiceValue = event.target.value;
    var choiceType = choiceValue.substring(0, choiceValue.indexOf(":"));
    if (choiceType === "choice") {
      var choiceIndex = choiceValue.substring(choiceValue.indexOf(":") + 1);
      choiceIndex = parseInt(choiceIndex);
      this.props.onChange(this.props.choices[choiceIndex].value);
    }
  },

  getDefaultProps: function getDefaultProps() {
    return {
      choices: []
    };
  },

  getInitialState: function getInitialState() {
    var defaultValue = this.props.field.value !== undefined ? this.props.field.value : "";

    return {
      isChoicesOpen: this.props.isChoicesOpen,
      value: defaultValue,
      isEnteringCustomValue: false
    };
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var choices = this.props.config.normalizePrettyChoices(this.props.choices);
    var choicesOrLoading;

    if (choices.length > 1 && choices[0].value === "///loading///" || this.props.config.fieldIsLoading(this.props.field)) {
      choices = [{ value: "///loading///" }];
    }
    var choicesElem = this.props.config.createElement("choices", {
      ref: "choices",
      choices: choices,
      open: this.state.isChoicesOpen,
      ignoreCloseNodes: this.getCloseIgnoreNodes,
      onSelect: this.onSelectChoice,
      onClose: this.onCloseChoices,
      onChoiceAction: this.onChoiceAction,
      field: this.props.field
    });

    var inputElem = this.getInputElement();

    choicesOrLoading = React.createElement(
      "div",
      { className: cx(_.extend({}, this.props.classes, { "choices-open": this.state.isChoicesOpen })),
        onChange: this.onChange },
      React.createElement(
        "div",
        { ref: "toggle", onClick: this.onToggleChoices },
        inputElem,
        React.createElement("span", { className: "select-arrow" })
      ),
      choicesElem
    );

    return choicesOrLoading;
  },

  getInputElement: function getInputElement() {
    return this.props.config.createElement("pretty-select-input", {
      field: this.props.field,
      ref: "customInput",
      isEnteringCustomValue: this.state.isEnteringCustomValue,
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
    return this.refs.toggle.getDOMNode();
  },

  onToggleChoices: function onToggleChoices() {
    this.setChoicesOpen(!this.state.isChoicesOpen);
  },

  setChoicesOpen: function setChoicesOpen(isOpen) {
    var action = isOpen ? "open-choices" : "close-choices";
    this.onStartAction(action);
    this.setState({ isChoicesOpen: isOpen });
  },

  onSelectChoice: function onSelectChoice(value) {
    this.setState({
      isEnteringCustomValue: false,
      isChoicesOpen: false,
      value: value
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

  getDisplayValue: function getDisplayValue() {
    var config = this.props.config;
    var currentValue = this.state.value;
    var currentChoice = this.props.config.fieldSelectedChoice(this.props.field);
    // Make sure selectedChoice is a match for current value.
    if (currentChoice && currentChoice.value !== currentValue) {
      currentChoice = null;
    }
    if (!currentChoice) {
      currentChoice = _.find(this.props.choices, function (choice) {
        return !choice.action && choice.value === currentValue;
      });
    }

    if (currentChoice) {
      return currentChoice.label;
    } else if (currentValue) {
      // custom value
      return currentValue;
    }
    return config.fieldPlaceholder(this.props.field) || "";
  },

  onChoiceAction: function onChoiceAction(choice) {
    if (choice.action === "enter-custom-value") {
      this.setState({
        isEnteringCustomValue: true,
        isChoicesOpen: false,
        value: choice.value
      }, function () {
        this.refs.customInput.focus();
      });
    } else if (choice.action === "insert-field") {
      this.setState({
        isChoicesOpen: false
      }, function () {
        this.refs.customInput.setChoicesOpen(true);
      });
    } else {
      this.setState({
        isChoicesOpen: !!choice.isOpen
      });
      if (choice.action === "clear-current-choice") {
        this.setState({
          value: ""
        });
        this.props.onChange("");
      }
    }

    this.onStartAction(choice.action, choice);
  },

  // Is this even used? I don't think so.
  onAction: function onAction(params) {
    if (params.action === "enter-custom-value") {
      this.setState({ isEnteringCustomValue: true }, function () {
        this.refs.customInput.focus();
      });
    }
    this.onBubbleAction(params);
  },

  onInputChange: function onInputChange(value) {
    this.props.onChange(value);
    this.setState({
      value: value
    });
  }
});
// # pretty-select-value component

/*
   Render a select dropdown for a list of choices. Choices values can be of any
   type. Does not use native select dropdown. Choices can optionally include
   'sample' property displayed grayed out.
 */

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":52,"classnames":62}],42:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var cx = require("classnames");

module.exports = React.createClass({

  displayName: "PrettyTag",

  propTypes: {
    tag: React.PropTypes.string,
    replaceChoices: React.PropTypes.array,
    onClick: React.PropTypes.func,
    classes: React.PropTypes.object
  },

  mixins: [require("../../mixins/helper")],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var classes = cx(_.extend({}, this.props.classes, { "pretty-part": true }));

    return React.createElement(
      "span",
      { className: classes, onClick: this.props.onClick },
      this.props.children
    );
  }
});
// # pretty-tag component

/*
   Pretty text tag
 */

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":52,"classnames":62}],43:[function(require,module,exports){
(function (global){
"use strict";

/* global CodeMirror */
/*eslint no-script-url:0 */

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var TagTranslator = require("./tag-translator");
var _ = require("../../undash");
var cx = require("classnames");

/*
   Editor for tagged text. Renders text like "hello {{firstName}}"
   with replacement labels rendered in a pill box. Designed to load
   quickly when many separate instances of it are on the same
   page.

   Uses CodeMirror to edit text. To save memory the CodeMirror node is
   instantiated when the user moves the mouse into the edit area.
   Initially a read-only view using a simple div is shown.
 */
module.exports = React.createClass({

  displayName: "PrettyTextHelper",

  mixins: [require("../../mixins/helper")],

  componentDidMount: function componentDidMount() {
    this.createEditor();
  },

  componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
    if (prevState.codeMirrorMode !== this.state.codeMirrorMode) {
      // Changed from code mirror mode to read only mode or vice versa,
      // so setup the other editor.
      this.createEditor();
    }
    this.updateEditor();
  },

  componentWillUnmount: function componentWillUnmount() {
    if (this.state.codeMirrorMode) {
      this.removeCodeMirrorEditor();
    }
  },

  getInitialState: function getInitialState() {
    var selectedChoices = this.props.selectedChoices;
    var replaceChoices = this.props.replaceChoices;
    var translator = TagTranslator(selectedChoices.concat(replaceChoices), this.props.config.humanize);

    return {
      value: this.props.value,
      codeMirrorMode: false,
      isChoicesOpen: false,
      replaceChoices: replaceChoices,
      translator: translator
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    var selectedChoices = this.props.selectedChoices;
    var replaceChoices = this.props.replaceChoices;
    var nextState = {
      replaceChoices: replaceChoices,
      translator: TagTranslator(selectedChoices.concat(replaceChoices), this.props.config.humanize)
    };

    // Not sure what the null/undefined checks are here for, but changed from falsey which was breaking.
    if (this.state.value !== nextProps.value && !_.isUndefined(nextProps.value) && nextProps.value !== null) {
      nextState.value = nextProps.value;
    }

    this.setState(nextState);
  },

  handleChoiceSelection: function handleChoiceSelection(key, event) {
    var _this = this;

    var selectChoice = function () {
      var pos = _this.state.selectedTagPos;
      var tag = "{{" + key + "}}";

      if (pos) {
        _this.codeMirror.replaceRange(tag, { line: pos.line, ch: pos.start }, { line: pos.line, ch: pos.stop });
      } else {
        _this.codeMirror.replaceSelection(tag, "end");
      }
      _this.codeMirror.focus();

      _this.setState({ isChoicesOpen: false, selectedTagPos: null });
    };
    if (this.state.codeMirrorMode) {
      selectChoice();
    } else if (this.props.readOnly) {
      // hackety hack to stop dropdown choices from toggling
      event.stopPropagation();
      this.props.onChange("{{" + key + "}}");
      this.setState({ isChoicesOpen: false });
    } else {
      this.switchToCodeMirror(selectChoice);
    }
  },

  focus: function focus() {
    var _this = this;

    this.switchToCodeMirror(function () {
      _this.codeMirror.focus();
      _this.codeMirror.setCursor(_this.codeMirror.lineCount(), 0);
    });
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;
    var textBoxClasses = cx(_.extend({}, this.props.classes, { "pretty-text-box": true }));

    var onInsertClick = function onInsertClick() {
      this.setState({ selectedTagPos: null });
      this.onToggleChoices();
    };
    var insertBtn = config.createElement("insert-button", { ref: "toggle", onClick: onInsertClick.bind(this) }, "Insert...");

    var choices = config.createElement("choices", {
      ref: "choices",
      choices: this.state.replaceChoices,
      open: this.state.isChoicesOpen,
      ignoreCloseNodes: this.getCloseIgnoreNodes,
      onSelect: this.handleChoiceSelection,
      onClose: this.onCloseChoices,
      isAccordion: this.props.isAccordion
    });

    // Render read-only version.
    return React.createElement(
      "div",
      { className: cx({ "pretty-text-wrapper": true, "choices-open": this.state.isChoicesOpen }), onMouseEnter: this.switchToCodeMirror },
      React.createElement(
        "div",
        { className: textBoxClasses, tabIndex: this.props.tabIndex, onFocus: this.props.onFocus, onBlur: this.props.onBlur },
        React.createElement("div", { ref: "textBox", className: "internal-text-wrapper" })
      ),
      insertBtn,
      choices
    );
  },

  getCloseIgnoreNodes: function getCloseIgnoreNodes() {
    return this.refs.toggle.getDOMNode();
  },

  onToggleChoices: function onToggleChoices() {
    this.setChoicesOpen(!this.state.isChoicesOpen);
  },

  setChoicesOpen: function setChoicesOpen(isOpen) {
    var action = isOpen ? "open-replacements" : "close-replacements";
    this.onStartAction(action);
    this.setState({ isChoicesOpen: isOpen });
  },

  onCloseChoices: function onCloseChoices() {
    if (this.state.isChoicesOpen) {
      this.setChoicesOpen(false);
    }
  },

  createEditor: function createEditor() {
    if (this.state.codeMirrorMode) {
      this.createCodeMirrorEditor();
    } else {
      this.createReadonlyEditor();
    }
  },

  updateEditor: function updateEditor() {
    if (this.state.codeMirrorMode) {
      var codeMirrorValue = this.codeMirror.getValue();
      if (codeMirrorValue !== this.state.value) {
        // switch back to read-only mode to make it easier to render
        this.removeCodeMirrorEditor();
        this.createReadonlyEditor();
        this.setState({
          codeMirrorMode: false
        });
      }
    } else {
      this.createReadonlyEditor();
    }
  },

  createCodeMirrorEditor: function createCodeMirrorEditor() {
    var options = {
      lineWrapping: true,
      tabindex: this.props.tabIndex,
      value: String(this.state.value),
      mode: null,
      extraKeys: {
        Tab: false
      }
    };

    var textBox = this.refs.textBox.getDOMNode();
    textBox.innerHTML = ""; // release any previous read-only content so it can be GC'ed

    this.codeMirror = CodeMirror(textBox, options);
    this.codeMirror.on("change", this.onCodeMirrorChange);

    this.tagCodeMirror();
  },

  tagCodeMirror: function tagCodeMirror() {
    var positions = this.state.translator.getTagPositions(this.codeMirror.getValue());
    var self = this;

    var tagOps = function tagOps() {
      positions.forEach(function (pos) {
        var node = self.createTagNode(pos);
        self.codeMirror.markText({ line: pos.line, ch: pos.start }, { line: pos.line, ch: pos.stop }, { replacedWith: node, handleMouseEvents: true });
      });
    };

    this.codeMirror.operation(tagOps);
  },

  onCodeMirrorChange: function onCodeMirrorChange() {
    if (this.updatingCodeMirror) {
      // avoid recursive update cycle, and mark the code mirror manual update as done
      this.updatingCodeMirror = false;
      return;
    }

    var newValue = this.codeMirror.getValue();
    this.props.onChange(newValue);
    this.setState({ value: newValue });
    this.tagCodeMirror();
  },

  createReadonlyEditor: function createReadonlyEditor() {
    var textBoxNode = this.refs.textBox.getDOMNode();

    var tokens = this.state.translator.tokenize(this.state.value);
    var self = this;
    var nodes = tokens.map(function (part, i) {
      if (part.type === "tag") {
        var label = self.state.translator.getLabel(part.value);
        var props = { key: i, tag: part.value, replaceChoices: self.state.replaceChoices };
        return self.props.config.createElement("pretty-tag", props, label);
      }
      return React.createElement(
        "span",
        { key: i },
        part.value
      );
    });

    React.render(React.createElement(
      "span",
      null,
      nodes
    ), textBoxNode);
  },

  removeCodeMirrorEditor: function removeCodeMirrorEditor() {
    var textBoxNode = this.refs.textBox.getDOMNode();
    var cmNode = textBoxNode.firstChild;
    textBoxNode.removeChild(cmNode);
    this.codeMirror = null;
  },

  switchToCodeMirror: function switchToCodeMirror(cb) {
    var _this = this;

    if (!this.state.codeMirrorMode && !this.props.readOnly) {
      this.setState({ codeMirrorMode: true }, function () {
        if (_this.codeMirror && _.isFunction(cb)) {
          cb();
        }
      });
    }
  },

  createTagNode: function createTagNode(pos) {
    var node = document.createElement("span");
    var label = this.state.translator.getLabel(pos.tag);
    var config = this.props.config;

    var onTagClick = function onTagClick() {
      this.setState({ selectedTagPos: pos });
      this.onToggleChoices();
    };

    var props = { tag: pos.tag, replaceChoices: this.state.replaceChoices, onClick: onTagClick.bind(this) };

    React.render(config.createElement("pretty-tag", props, label), node);

    return node;
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":52,"../../undash":60,"./tag-translator":47,"classnames":62}],44:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = require("classnames");

module.exports = React.createClass({

  displayName: "RemoveItem",

  mixins: [require("../../mixins/helper")],

  getDefaultProps: function getDefaultProps() {
    return {
      label: "[remove]"
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
    return R.span({
      className: cx(this.props.classes), onClick: this.props.onClick,
      onMouseOver: this.onMouseOverRemove, onMouseOut: this.onMouseOutRemove
    }, this.props.label);
  }
});
// # remove-item component

/*
Remove an item.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":52,"classnames":62}],45:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = require("classnames");

module.exports = React.createClass({

  displayName: "Sample",

  mixins: [require("../../mixins/helper")],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var choice = this.props.choice;

    return choice.sample ? R.div({ className: cx(this.props.className) }, choice.sample) : R.span(null);
  }
});
// # help component

/*
Just the help text block.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":52,"classnames":62}],46:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var _ = require("../../undash");
var cx = require("classnames");

module.exports = React.createClass({

  displayName: "SelectValue",

  mixins: [require("../../mixins/helper")],

  onChange: function onChange(event) {
    var choiceValue = event.target.value;
    var choiceType = choiceValue.substring(0, choiceValue.indexOf(":"));
    if (choiceType === "choice") {
      var choiceIndex = choiceValue.substring(choiceValue.indexOf(":") + 1);
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

    if (choices.length === 1 && choices[0].value === "///loading///" || config.fieldIsLoading(this.props.field)) {
      choicesOrLoading = config.createElement("loading-choices", {});
    } else {
      var value = this.props.field.value !== undefined ? this.props.field.value : "";

      choices = choices.map(function (choice, i) {
        return {
          choiceValue: "choice:" + i,
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
          choiceValue: "value:",
          value: value,
          label: label
        };
        choices = [valueChoice].concat(choices);
      }

      choicesOrLoading = R.select({
        className: cx(this.props.classes),
        onChange: this.onChange,
        value: valueChoice.choiceValue,
        onFocus: this.onFocusAction,
        onBlur: this.onBlurAction
      }, choices.map(function (choice, i) {
        return R.option({
          key: i,
          value: choice.choiceValue
        }, choice.label);
      }));
    }

    return choicesOrLoading;
  }
});
// # select-value component

/*
Render a select dropdown for a list of choices. Choices values can be of any
type.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":52,"../../undash":60,"classnames":62}],47:[function(require,module,exports){
"use strict";

function buildChoicesMap(replaceChoices) {
  var choices = {};
  replaceChoices.forEach(function (choice) {
    var key = choice.value;
    choices[key] = choice.label;
  });
  return choices;
}

/*
   Creates helper to translate between tags like {{firstName}} and
   an encoded representation suitable for use in CodeMirror.
 */
function TagTranslator(replaceChoices, humanize) {
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

    tokenize: function tokenize(text) {
      text = String(text);

      var regexp = /(\{\{|\}\})/;
      var parts = text.split(regexp);

      var tokens = [];
      var inTag = false;
      parts.forEach(function (part) {
        if (part === "{{") {
          inTag = true;
        } else if (part === "}}") {
          inTag = false;
        } else if (inTag) {
          tokens.push({ type: "tag", value: part });
        } else {
          tokens.push({ type: "string", value: part });
        }
      });
      return tokens;
    },

    getTagPositions: function getTagPositions(text) {
      var lines = text.split("\n");
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
    }
  };
}

module.exports = TagTranslator;

},{}],48:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var _ = require("./undash");

var utils = require("./utils");

module.exports = function (config) {

  var delegateTo = utils.delegator(config);

  return {

    // Field element factories. Create field elements.

    createElement_Fields: React.createFactory(require("./components/fields/fields")),

    createElement_String: React.createFactory(require("./components/fields/string")),

    createElement_SingleLineString: React.createFactory(require("./components/fields/single-line-string")),

    createElement_Password: React.createFactory(require("./components/fields/password")),

    createElement_Select: React.createFactory(require("./components/fields/select")),

    createElement_PrettySelect: React.createFactory(require("./components/fields/pretty-select")),

    createElement_Boolean: React.createFactory(require("./components/fields/boolean")),

    createElement_PrettyBoolean: React.createFactory(require("./components/fields/pretty-boolean")),

    createElement_CheckboxBoolean: React.createFactory(require("./components/fields/checkbox-boolean")),

    // createElement_PrettyText: React.createFactory(require('./components/fields/pretty-text')),

    createElement_Code: React.createFactory(require("./components/fields/code")),

    createElement_PrettyText: React.createFactory(require("./components/fields/pretty-text2")),

    createElement_PrettyTag: React.createFactory(require("./components/helpers/pretty-tag")),

    createElement_Array: React.createFactory(require("./components/fields/array")),

    createElement_CheckboxArray: React.createFactory(require("./components/fields/checkbox-array")),

    createElement_Object: React.createFactory(require("./components/fields/object")),

    createElement_Json: React.createFactory(require("./components/fields/json")),

    createElement_UnknownField: React.createFactory(require("./components/fields/unknown")),

    createElement_Copy: React.createFactory(require("./components/fields/copy")),

    // Other element factories. Create helper elements used by field components.

    createElement_Field: React.createFactory(require("./components/helpers/field")),

    createElement_Label: React.createFactory(require("./components/helpers/label")),

    createElement_Help: React.createFactory(require("./components/helpers/help")),

    createElement_Choices: React.createFactory(require("./components/helpers/choices")),

    createElement_LoadingChoices: React.createFactory(require("./components/helpers/loading-choices")),

    createElement_LoadingChoice: React.createFactory(require("./components/helpers/loading-choice")),

    createElement_ArrayControl: React.createFactory(require("./components/helpers/array-control")),

    createElement_ArrayItemControl: React.createFactory(require("./components/helpers/array-item-control")),

    createElement_ArrayItemValue: React.createFactory(require("./components/helpers/array-item-value")),

    createElement_ArrayItem: React.createFactory(require("./components/helpers/array-item")),

    createElement_FieldTemplateChoices: React.createFactory(require("./components/helpers/field-template-choices")),

    createElement_AddItem: React.createFactory(require("./components/helpers/add-item")),

    createElement_RemoveItem: React.createFactory(require("./components/helpers/remove-item")),

    createElement_MoveItemForward: React.createFactory(require("./components/helpers/move-item-forward")),

    createElement_MoveItemBack: React.createFactory(require("./components/helpers/move-item-back")),

    createElement_ObjectControl: React.createFactory(require("./components/helpers/object-control")),

    createElement_ObjectItemControl: React.createFactory(require("./components/helpers/object-item-control")),

    createElement_ObjectItemValue: React.createFactory(require("./components/helpers/object-item-value")),

    createElement_ObjectItemKey: React.createFactory(require("./components/helpers/object-item-key")),

    createElement_ObjectItem: React.createFactory(require("./components/helpers/object-item")),

    createElement_SelectValue: React.createFactory(require("./components/helpers/select-value")),

    createElement_PrettySelectValue: React.createFactory(require("./components/helpers/pretty-select-value")),

    createElement_PrettySelectInput: React.createFactory(require("./components/helpers/pretty-select-input")),

    createElement_Sample: React.createFactory(require("./components/helpers/sample")),

    createElement_InsertButton: React.createFactory(require("./components/helpers/insert-button")),

    createElement_ChoiceSectionHeader: React.createFactory(require("./components/helpers/choice-section-header")),

    createElement_PrettyTextHelper: React.createFactory(require("./components/helpers/pretty-text-helper")),

    // Field default value factories. Give a default value for a specific type.

    createDefaultValue_String: function createDefaultValue_String() {
      return "";
    },

    createDefaultValue_Object: function createDefaultValue_Object() {
      return {};
    },

    createDefaultValue_Array: function createDefaultValue_Array() {
      return [];
    },

    createDefaultValue_Boolean: function createDefaultValue_Boolean() {
      return false;
    },

    createDefaultValue_Fields: delegateTo("createDefaultValue_Object"),

    createDefaultValue_SingleLineString: delegateTo("createDefaultValue_String"),

    createDefaultValue_Select: delegateTo("createDefaultValue_String"),

    createDefaultValue_Json: delegateTo("createDefaultValue_Object"),

    createDefaultValue_CheckboxArray: delegateTo("createDefaultValue_Array"),

    createDefaultValue_CheckboxBoolean: delegateTo("createDefaultValue_Boolean"),

    // Field value coercers. Coerce a value into a value appropriate for a specific type.

    coerceValue_String: function coerceValue_String(fieldTemplate, value) {
      if (_.isString(value)) {
        return value;
      }
      if (_.isUndefined(value) || value === null) {
        return "";
      }
      return JSON.stringify(value);
    },

    coerceValue_Object: function coerceValue_Object(fieldTemplate, value) {
      if (!_.isObject(value)) {
        return {};
      }
      return value;
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

    coerceValue_Fields: delegateTo("coerceValue_Object"),

    coerceValue_SingleLineString: delegateTo("coerceValue_String"),

    coerceValue_Select: delegateTo("coerceValue_String"),

    coerceValue_Json: delegateTo("coerceValue_Object"),

    coerceValue_CheckboxArray: delegateTo("coerceValue_Array"),

    coerceValue_CheckboxBoolean: delegateTo("coerceValue_Boolean"),

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

      return config["createElement_" + name] ? true : false;
    },

    // Create an element given a name, props, and children.
    createElement: function createElement(name, props, children) {

      if (!props.config) {
        props = _.extend({}, props, { config: config });
      }

      name = config.elementName(name);

      if (config["createElement_" + name]) {
        return config["createElement_" + name](props, children);
      }

      if (name !== "Unknown") {
        if (config.hasElementFactory("Unknown")) {
          return config.createElement("Unknown", props, children);
        }
      }

      throw new Error("Factory not found for: " + name);
    },

    // Create a field element given some props. Use context to determine name.
    createFieldElement: function createFieldElement(props) {

      var name = config.fieldTypeName(props.field);

      if (config.hasElementFactory(name)) {
        return config.createElement(name, props);
      }

      return config.createElement("UnknownField", props);
    },

    // Render the root formatic component
    renderFormaticComponent: function renderFormaticComponent(component) {

      var props = component.props;

      var field = config.createRootField(props);

      return R.div({ className: "formatic" }, config.createFieldElement({ field: field, onChange: component.onChange, onAction: component.onAction }));
    },

    // Render any component.
    renderComponent: function renderComponent(component) {

      var name = component.constructor.displayName;

      if (config["renderComponent_" + name]) {
        return config["renderComponent_" + name](component);
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

    alias_Dict: "Object",

    alias_Bool: "Boolean",

    alias_PrettyTextarea: "PrettyText",

    alias_SingleLineString: function alias_SingleLineString(fieldTemplate) {
      if (fieldTemplate.replaceChoices) {
        return "PrettyText";
      } else if (fieldTemplate.choices) {
        return "Select";
      }
      return "SingleLineString";
    },

    alias_String: function alias_String(fieldTemplate) {

      if (fieldTemplate.replaceChoices) {
        return "PrettyText";
      } else if (fieldTemplate.choices) {
        return "Select";
      } else if (config.fieldTemplateIsSingleLine(fieldTemplate)) {
        return "SingleLineString";
      }
      return "String";
    },

    alias_Text: delegateTo("alias_String"),

    alias_Unicode: delegateTo("alias_SingleLineString"),

    alias_Str: delegateTo("alias_SingleLineString"),

    alias_List: "Array",

    alias_CheckboxList: "CheckboxArray",

    alias_Fieldset: "Fields",

    alias_Checkbox: "CheckboxBoolean",

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
          }
        });
        return value;
      } else {
        return field.value;
      }
    },

    // Initialize the root field.
    initRootField: function initRootField() {},

    // Initialize every field.
    initField: function initField() {},

    // If an array of field templates are passed in, this method is used to
    // wrap the fields inside a single root field template.
    wrapFieldTemplates: function wrapFieldTemplates(fieldTemplates) {
      return {
        type: "fields",
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
      });

      return isValid;
    },

    validateField: function validateField(field, errors) {

      if (field.value === undefined || field.value === "") {
        if (config.fieldIsRequired(field)) {
          errors.push({
            type: "required"
          });
        }
      }
    },

    cssTransitionWrapper: function cssTransitionWrapper() {
      var CSSTransitionGroup = React.createFactory(React.addons.CSSTransitionGroup);
      var args = [{ transitionName: "reveal" }].concat(Array.prototype.slice.call(arguments));
      return CSSTransitionGroup.apply(null, args);
    },

    // Create dynamic child fields for a field.
    createChildFields: function createChildFields(field) {

      var typeName = config.fieldTypeName(field);

      if (config["createChildFields_" + typeName]) {
        return config["createChildFields_" + typeName](field);
      }

      return config.fieldChildFieldTemplates(field).map(function (childField, i) {
        return config.createChildField(field, {
          fieldTemplate: childField, key: childField.key, fieldIndex: i, value: field.value[childField.key]
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
      var key = "__unknown_key__";

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
        type: "json"
      };
      if (_.isString(value)) {
        field = {
          type: "string"
        };
      } else if (_.isNumber(value)) {
        field = {
          type: "number"
        };
      } else if (_.isBoolean(value)) {
        field = {
          type: "boolean"
        };
      } else if (_.isArray(value)) {
        var arrayItemFields = value.map(function (childValue, i) {
          var childField = config.createFieldTemplateFromValue(childValue);
          childField.key = i;
          return childField;
        });
        field = {
          type: "array",
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
          type: "object",
          fields: objectItemFields
        };
      } else if (_.isNull(value)) {
        field = {
          type: "json"
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

      if (config["createDefaultValue_" + typeName]) {
        return config["createDefaultValue_" + typeName](fieldTemplate);
      }

      return "";
    },

    // Field helpers

    // Determine if a value "exists".
    hasValue: function hasValue(fieldTemplate, value) {
      return value !== null && !_.isUndefined(value);
    },

    // Coerce a value to value appropriate for a field.
    coerceValue: function coerceValue(field, value) {

      var typeName = config.fieldTypeName(field);

      if (config["coerceValue_" + typeName]) {
        return config["coerceValue_" + typeName](field, value);
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

      var typeName = utils.dashToPascal(fieldTemplate.type || "undefined");

      var alias = config["alias_" + typeName];

      if (alias) {
        if (_.isFunction(alias)) {
          return alias.call(config, fieldTemplate);
        } else {
          return alias;
        }
      }

      if (fieldTemplate.list) {
        typeName = "Array";
      }

      return typeName;
    },

    // Default value for a field template.
    fieldTemplateDefaultValue: function fieldTemplateDefaultValue(fieldTemplate) {

      return fieldTemplate["default"];
    },

    // Value for a field template. Used to determine the value of a new child
    // field.
    fieldTemplateValue: function fieldTemplateValue(fieldTemplate) {

      // This logic might be brittle.

      var defaultValue = config.fieldTemplateDefaultValue(fieldTemplate);

      var match = config.fieldTemplateMatch(fieldTemplate);

      var value;

      if (_.isUndefined(defaultValue) && !_.isUndefined(match)) {
        return utils.deepCopy(match);
      } else {
        return config.createDefaultValue(fieldTemplate);
      }

      return value;
    },

    // Match rule for a field template.
    fieldTemplateMatch: function fieldTemplateMatch(fieldTemplate) {
      return fieldTemplate.match;
    },

    // Determine if a field template has a single-line value.
    fieldTemplateIsSingleLine: function fieldTemplateIsSingleLine(fieldTemplate) {
      return fieldTemplate.isSingleLine || fieldTemplate.is_single_line || fieldTemplate.type === "single-line-string" || fieldTemplate.type === "SingleLineString";
    },

    // Field helpers

    // Get an array of keys representing the path to a value.
    fieldValuePath: function fieldValuePath(field) {

      var parentPath = [];

      if (field.parent) {
        parentPath = config.fieldValuePath(field.parent);
      }

      return parentPath.concat(field.key).filter(function (key) {
        return !_.isUndefined(key) && key !== "";
      });
    },

    // Clone a field with a different value.
    fieldWithValue: function fieldWithValue(field, value) {
      return _.extend({}, field, { value: value });
    },

    fieldTypeName: delegateTo("fieldTemplateTypeName"),

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
          label: "yes",
          value: true
        }, {
          label: "no",
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
        return [{ type: "text" }];
      }
      if (!_.isArray(field.itemFields)) {
        return [field.itemFields];
      }
      return field.itemFields;
    },

    fieldIsSingleLine: delegateTo("fieldTemplateIsSingleLine"),

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

    fieldMatch: delegateTo("fieldTemplateMatch"),

    // Other helpers

    // Convert a key to a nice human-readable version.
    humanize: function humanize(property) {
      property = property.replace(/\{\{/g, "");
      property = property.replace(/\}\}/g, "");
      return property.replace(/_/g, " ").replace(/(\w+)/g, function (match) {
        return match.charAt(0).toUpperCase() + match.slice(1);
      });
    },

    // Normalize some choices for a drop-down.
    normalizeChoices: function normalizeChoices(choices) {

      if (!choices) {
        return [];
      }

      // Convert comma separated string to array of strings.
      if (_.isString(choices)) {
        choices = choices.split(",");
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
      choices = _.flatten(choices);

      choices.forEach(function (choice, i) {
        // Convert any string choices to objects with `value` and `label`
        // properties.
        if (_.isString(choice)) {
          choices[i] = {
            value: choice,
            label: config.humanize(choice)
          };
        }
        if (!choices[i].label) {
          choices[i].label = config.humanize(choices[i].value);
        }
      });

      return choices;
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
      if (value === "" || value === "no" || value === "off" || value === "false") {
        return false;
      }
      return true;
    },

    // Determine if a value is a valid key.
    isKey: function isKey(key) {
      return _.isNumber(key) && key >= 0 || _.isString(key) && key !== "";
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
      return utils.capitalize(action).replace(/[-]/g, " ");
    }
  };
};
// # default-config

/*
This is the default configuration plugin for formatic. To change formatic's
behavior, just create your own plugin function that returns an object with
methods you want to add or override.
*/

/* fieldTemplate */ /* fieldTemplate */ /* fieldTemplate */ /* fieldTemplate */ /* field, props */ /* field */

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./components/fields/array":2,"./components/fields/boolean":3,"./components/fields/checkbox-array":4,"./components/fields/checkbox-boolean":5,"./components/fields/code":6,"./components/fields/copy":7,"./components/fields/fields":8,"./components/fields/json":9,"./components/fields/object":10,"./components/fields/password":11,"./components/fields/pretty-boolean":12,"./components/fields/pretty-select":13,"./components/fields/pretty-text2":14,"./components/fields/select":15,"./components/fields/single-line-string":16,"./components/fields/string":17,"./components/fields/unknown":18,"./components/helpers/add-item":19,"./components/helpers/array-control":20,"./components/helpers/array-item":23,"./components/helpers/array-item-control":21,"./components/helpers/array-item-value":22,"./components/helpers/choice-section-header":24,"./components/helpers/choices":25,"./components/helpers/field":27,"./components/helpers/field-template-choices":26,"./components/helpers/help":28,"./components/helpers/insert-button":29,"./components/helpers/label":30,"./components/helpers/loading-choice":31,"./components/helpers/loading-choices":32,"./components/helpers/move-item-back":33,"./components/helpers/move-item-forward":34,"./components/helpers/object-control":35,"./components/helpers/object-item":39,"./components/helpers/object-item-control":36,"./components/helpers/object-item-key":37,"./components/helpers/object-item-value":38,"./components/helpers/pretty-select-input":40,"./components/helpers/pretty-select-value":41,"./components/helpers/pretty-tag":42,"./components/helpers/pretty-text-helper":43,"./components/helpers/remove-item":44,"./components/helpers/sample":45,"./components/helpers/select-value":46,"./undash":60,"./utils":61}],49:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var _ = require("./undash");

var utils = require("./utils");

var defaultConfigPlugin = require("./default-config");

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
var FormaticControlledClass = React.createClass({

  displayName: "FormaticControlled",

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
module.exports = React.createClass({

  displayName: "Formatic",

  // Export some stuff as statics.
  statics: {
    createConfig: createConfig,
    availableMixins: {
      clickOutside: require("./mixins/click-outside.js"),
      field: require("./mixins/field.js"),
      helper: require("./mixins/helper.js"),
      resize: require("./mixins/resize.js"),
      scroll: require("./mixins/scroll.js"),
      undoStack: require("./mixins/undo-stack.js")
    },
    plugins: {
      bootstrap: require("./plugins/bootstrap"),
      meta: require("./plugins/meta"),
      reference: require("./plugins/reference"),
      elementClasses: require("./plugins/element-classes")
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
    if (this.props["on" + action]) {
      this.props["on" + action](info);
    }
  },

  // Render the wrapper component (by just delegating to the main component).
  render: function render() {

    var config = this.props.config || defaultConfig;
    var value = this.state.value;

    if (this.state.isControlled) {
      if (!this.props.onChange) {
        console.log("You should supply an onChange handler if you supply a value.");
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
// # formatic

/*
The root formatic component.

The root formatic component is actually two components. The main component is
a controlled component where you must pass the value in with each render. This
is actually wrapped in another component which allows you to use formatic as
an uncontrolled component where it retains the state of the value. The wrapper
is what is actually exported.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./default-config":48,"./mixins/click-outside.js":50,"./mixins/field.js":51,"./mixins/helper.js":52,"./mixins/resize.js":53,"./mixins/scroll.js":54,"./mixins/undo-stack.js":55,"./plugins/bootstrap":56,"./plugins/element-classes":57,"./plugins/meta":58,"./plugins/reference":59,"./undash":60,"./utils":61}],50:[function(require,module,exports){
"use strict";

var _ = require("../undash");

var hasAncestor = (function (_hasAncestor) {
  var _hasAncestorWrapper = function hasAncestor(_x, _x2) {
    return _hasAncestor.apply(this, arguments);
  };

  _hasAncestorWrapper.toString = function () {
    return _hasAncestor.toString();
  };

  return _hasAncestorWrapper;
})(function (child, parent) {
  if (child.parentNode === parent) {
    return true;
  }
  if (child.parentNode === null) {
    return false;
  }
  return hasAncestor(child.parentNode, parent);
});

module.exports = {

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
    _.each(this.clickOutsideHandlers, (function (funcs, ref) {
      if (this.refs[ref]) {
        this._mousedownRefs[ref] = true;
      }
    }).bind(this));
  },

  _onClickMouseup: function _onClickMouseup(event) {
    _.each(this.clickOutsideHandlers, (function (funcs, ref) {
      if (this.refs[ref] && this._mousedownRefs[ref]) {
        if (this.isNodeOutside(event.target, this.refs[ref].getDOMNode())) {
          funcs.forEach((function (fn) {
            fn.call(this, event);
          }).bind(this));
        }
      }
      this._mousedownRefs[ref] = false;
    }).bind(this));
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
    document.addEventListener("mousedown", this._onClickMousedown);
    document.addEventListener("mouseup", this._onClickMouseup);
    //document.addEventListener('click', this._onClickDocument);
    this._mousedownRefs = {};
  },

  componentWillUnmount: function componentWillUnmount() {
    this.clickOutsideHandlers = {};
    //document.removeEventListener('click', this._onClickDocument);
    document.removeEventListener("mouseup", this._onClickMouseup);
    document.removeEventListener("mousedown", this._onClickMousedown);
  }
};
// # click-outside mixin

/*
There's no native React way to detect clicking outside an element. Sometimes
this is useful, so that's what this mixin does. To use it, mix it in and use it
from your component like this:

```js
module.exports = React.createClass({

  mixins: [require('../..mixins/click-outside')],

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

},{"../undash":60}],51:[function(require,module,exports){
"use strict";

var _ = require("../undash");

module.exports = {

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
    this.onStartAction("focus");
  },

  onBlurAction: function onBlurAction() {
    this.onStartAction("blur");
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
  }
};
// # field mixin

/*
This mixin gets mixed into all field components.
*/

},{"../undash":60}],52:[function(require,module,exports){
"use strict";

var _ = require("../undash");

module.exports = {

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
    this.onStartAction("focus");
  },

  onBlurAction: function onBlurAction() {
    this.onStartAction("blur");
  }
};
// # helper mixin

/*
This gets mixed into all helper components.
*/

},{"../undash":60}],53:[function(require,module,exports){
"use strict";

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
  if (!("__resizeId" in element)) {
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
  if (!("__resizeId" in element)) {
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

module.exports = {

  componentDidMount: function componentDidMount() {
    if (this.onResizeWindow) {
      window.addEventListener("resize", this.onResizeWindow);
    }
    this.resizeElementRefs = {};
  },

  componentWillUnmount: function componentWillUnmount() {
    if (this.onResizeWindow) {
      window.removeEventListener("resize", this.onResizeWindow);
    }
    Object.keys(this.resizeElementRefs).forEach((function (ref) {
      removeResizeIntervalHandlers(this.refs[ref].getDOMNode());
    }).bind(this));
  },

  setOnResize: function setOnResize(ref, fn) {
    if (!this.resizeElementRefs[ref]) {
      this.resizeElementRefs[ref] = true;
    }
    addResizeIntervalHandler(this.refs[ref].getDOMNode(), onResize.bind(this, ref, fn));
  }
};
// # resize mixin

/*
You'd think it would be pretty easy to detect when a DOM element is resized.
And you'd be wrong. There are various tricks, but none of them work very well.
So, using good ol' polling here. To try to be as efficient as possible, there
is only a single setInterval used for all elements. To use:

```js
module.exports = React.createClass({

  mixins: [require('../../mixins/resize')],

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

},{}],54:[function(require,module,exports){
"use strict";

module.exports = function (plugin) {

  plugin.exports = {

    componentDidMount: function componentDidMount() {
      if (this.onScrollWindow) {
        window.addEventListener("scroll", this.onScrollWindow);
      }
    },

    componentWillUnmount: function componentWillUnmount() {
      if (this.onScrollWindow) {
        window.removeEventListener("scroll", this.onScrollWindow);
      }
    }
  };
};
// # scroll mixin

/*
Currently unused.
*/

},{}],55:[function(require,module,exports){
"use strict";

module.exports = {
  getInitialState: function getInitialState() {
    return { undo: [], redo: [] };
  },

  snapshot: function snapshot() {
    var undo = this.state.undo.concat(this.getStateSnapshot());
    if (typeof this.state.undoDepth === "number") {
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
// # undo-stack mixin

/*
Gives your component an undo stack.
*/

// http://prometheusresearch.github.io/react-forms/examples/undo.html

},{}],56:[function(require,module,exports){
"use strict";

var _ = require("../undash");

// Declare some classes and labels for each element.
var modifiers = {

  Field: { classes: { "form-group": true } },
  Help: { classes: { "help-block": true } },
  Sample: { classes: { "help-block": true } },
  ArrayControl: { classes: { "form-inline": true } },
  ArrayItem: { classes: { well: true } },
  ObjectItem: { classes: { well: true } },
  FieldTemplateChoices: { classes: { "form-control": true } },
  AddItem: { classes: { "glyphicon glyphicon-plus": true }, label: "" },
  RemoveItem: { classes: { "glyphicon glyphicon-remove": true }, label: "" },
  MoveItemBack: { classes: { "glyphicon glyphicon-arrow-up": true }, label: "" },
  MoveItemForward: { classes: { "glyphicon glyphicon-arrow-down": true }, label: "" },
  ObjectItemKey: { classes: { "form-control": true } },

  SingleLineString: { classes: { "form-control": true } },
  String: { classes: { "form-control": true } },
  PrettyText: { classes: { "form-control": true } },
  Json: { classes: { "form-control": true } },
  SelectValue: { classes: { "form-control": true } }
};

module.exports = function (config) {

  var createElement = config.createElement;

  return {
    createElement: (function (_createElement) {
      var _createElementWrapper = function createElement(_x, _x2, _x3) {
        return _createElement.apply(this, arguments);
      };

      _createElementWrapper.toString = function () {
        return _createElement.toString();
      };

      return _createElementWrapper;
    })(function (name, props, children) {

      name = config.elementName(name);

      var modifier = modifiers[name];

      if (modifier) {
        // If there is a modifier for this element, add the classes and label.
        props = _.extend({}, props);
        props.classes = _.extend({}, props.classes, modifier.classes);
        if ("label" in modifier) {
          props.label = modifier.label;
        }
      }

      return createElement(name, props, children);
    })
  };
};
// # bootstrap plugin

/*
The bootstrap plugin sneaks in some classes to elements so that it plays well
with Twitter Bootstrap.
*/

},{"../undash":60}],57:[function(require,module,exports){
"use strict";

var _ = require("../undash");

module.exports = function (config) {

  var createElement = config.createElement;

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
    createElement: (function (_createElement) {
      var _createElementWrapper = function createElement(_x, _x2, _x3) {
        return _createElement.apply(this, arguments);
      };

      _createElementWrapper.toString = function () {
        return _createElement.toString();
      };

      return _createElementWrapper;
    })(function (name, props, children) {

      name = config.elementName(name);

      if (elementClasses[name]) {
        props = _.extend({}, props, { classes: elementClasses[name] });
      }

      return createElement(name, props, children);
    })
  };
};
// # element-classes plugin

/*
This plugins provides a config method addElementClass that lets you add on a
class to an element.
*/

},{"../undash":60}],58:[function(require,module,exports){
"use strict";

module.exports = function (config) {

  var initRootField = config.initRootField;
  var initField = config.initField;

  return {
    initRootField: (function (_initRootField) {
      var _initRootFieldWrapper = function initRootField(_x, _x2) {
        return _initRootField.apply(this, arguments);
      };

      _initRootFieldWrapper.toString = function () {
        return _initRootField.toString();
      };

      return _initRootFieldWrapper;
    })(function (field, props) {

      field.meta = props.meta || {};

      initRootField(field, props);
    }),

    initField: (function (_initField) {
      var _initFieldWrapper = function initField(_x) {
        return _initField.apply(this, arguments);
      };

      _initFieldWrapper.toString = function () {
        return _initField.toString();
      };

      return _initFieldWrapper;
    })(function (field) {

      if (field.parent && field.parent.meta) {
        field.meta = field.parent.meta;
      }

      initField(field);
    })
  };
};
// # meta plugin

/*
The meta plugin lets you pass in a meta prop to formatic. The prop then gets
passed through as a property for every field. You can then wrap `initField` to
get your meta values.
*/

},{}],59:[function(require,module,exports){
"use strict";

var _ = require("../undash");

module.exports = function (config) {

  var initField = config.initField;

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

      if (!fieldTemplate["extends"]) {
        return fieldTemplate;
      }

      var ext = fieldTemplate["extends"];

      if (!_.isArray(ext)) {
        ext = [ext];
      }

      var bases = ext.map(function (base) {
        var template = config.findFieldTemplate(field, base);
        if (!template) {
          throw new Error("Template " + base + " not found.");
        }
        return template;
      });

      var chain = [{}].concat(bases.reverse().concat([fieldTemplate]));
      fieldTemplate = _.extend.apply(_, chain);

      return fieldTemplate;
    },

    // Wrap the initField method.
    initField: (function (_initField) {
      var _initFieldWrapper = function initField(_x) {
        return _initField.apply(this, arguments);
      };

      _initFieldWrapper.toString = function () {
        return _initField.toString();
      };

      return _initFieldWrapper;
    })(function (field) {

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

        if (!_.isUndefined(key) && key !== "") {
          templates[key] = fieldTemplate;
        }

        if (!_.isUndefined(id) && id !== "") {
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

      initField(field);
    })
  };
};
// # reference plugin

/*
This plugin allows fields to be strings and reference other fields by key or
id. It also allows a field to extend another field with
extends: ['foo', 'bar'] where 'foo' and 'bar' refer to other keys or ids.
*/

},{"../undash":60}],60:[function(require,module,exports){
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

},{"deep-equal":63,"object-assign":66}],61:[function(require,module,exports){
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

},{"./undash":60}],62:[function(require,module,exports){
/*!
  Copyright (c) 2015 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/

function classNames () {
	'use strict';

	var classes = '';

	for (var i = 0; i < arguments.length; i++) {
		var arg = arguments[i];
		if (!arg) continue;

		var argType = typeof arg;

		if ('string' === argType || 'number' === argType) {
			classes += ' ' + arg;

		} else if (Array.isArray(arg)) {
			classes += ' ' + classNames.apply(null, arg);

		} else if ('object' === argType) {
			for (var key in arg) {
				if (arg.hasOwnProperty(key) && arg[key]) {
					classes += ' ' + key;
				}
			}
		}
	}

	return classes.substr(1);
}

// safely export classNames for node / browserify
if (typeof module !== 'undefined' && module.exports) {
	module.exports = classNames;
}

/* global define */
// safely export classNames for RequireJS
if (typeof define !== 'undefined' && define.amd) {
	define('classnames', [], function() {
		return classNames;
	});
}

},{}],63:[function(require,module,exports){
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

},{"./lib/is_arguments.js":64,"./lib/keys.js":65}],64:[function(require,module,exports){
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

},{}],65:[function(require,module,exports){
exports = module.exports = typeof Object.keys === 'function'
  ? Object.keys : shim;

exports.shim = shim;
function shim (obj) {
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
}

},{}],66:[function(require,module,exports){
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

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2luZGV4LmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9maWVsZHMvYXJyYXkuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9ib29sZWFuLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9maWVsZHMvY2hlY2tib3gtYXJyYXkuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9jaGVja2JveC1ib29sZWFuLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9maWVsZHMvY29kZS5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvZmllbGRzL2NvcHkuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9maWVsZHMuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9qc29uLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9maWVsZHMvb2JqZWN0LmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9maWVsZHMvcGFzc3dvcmQuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9wcmV0dHktYm9vbGVhbi5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvZmllbGRzL3ByZXR0eS1zZWxlY3QuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9wcmV0dHktdGV4dDIuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9zZWxlY3QuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9zaW5nbGUtbGluZS1zdHJpbmcuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9zdHJpbmcuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy91bmtub3duLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2FkZC1pdGVtLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2FycmF5LWNvbnRyb2wuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvYXJyYXktaXRlbS1jb250cm9sLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2FycmF5LWl0ZW0tdmFsdWUuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvYXJyYXktaXRlbS5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9jaG9pY2Utc2VjdGlvbi1oZWFkZXIuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvY2hvaWNlcy5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9maWVsZC10ZW1wbGF0ZS1jaG9pY2VzLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2ZpZWxkLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2hlbHAuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvaW5zZXJ0LWJ1dHRvbi5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9sYWJlbC5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9sb2FkaW5nLWNob2ljZS5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9sb2FkaW5nLWNob2ljZXMuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvbW92ZS1pdGVtLWJhY2suanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvbW92ZS1pdGVtLWZvcndhcmQuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWNvbnRyb2wuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWl0ZW0tY29udHJvbC5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9vYmplY3QtaXRlbS1rZXkuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWl0ZW0tdmFsdWUuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWl0ZW0uanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvcHJldHR5LXNlbGVjdC1pbnB1dC5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9wcmV0dHktc2VsZWN0LXZhbHVlLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL3ByZXR0eS10YWcuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvcHJldHR5LXRleHQtaGVscGVyLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL3JlbW92ZS1pdGVtLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL3NhbXBsZS5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9zZWxlY3QtdmFsdWUuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvdGFnLXRyYW5zbGF0b3IuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9kZWZhdWx0LWNvbmZpZy5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2Zvcm1hdGljLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvbWl4aW5zL2NsaWNrLW91dHNpZGUuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9taXhpbnMvZmllbGQuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9taXhpbnMvaGVscGVyLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvbWl4aW5zL3Jlc2l6ZS5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL21peGlucy9zY3JvbGwuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9taXhpbnMvdW5kby1zdGFjay5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL3BsdWdpbnMvYm9vdHN0cmFwLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvcGx1Z2lucy9lbGVtZW50LWNsYXNzZXMuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9wbHVnaW5zL21ldGEuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9wbHVnaW5zL3JlZmVyZW5jZS5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL3VuZGFzaC5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL3V0aWxzLmpzIiwibm9kZV9tb2R1bGVzL2NsYXNzbmFtZXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZGVlcC1lcXVhbC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kZWVwLWVxdWFsL2xpYi9pc19hcmd1bWVudHMuanMiLCJub2RlX21vZHVsZXMvZGVlcC1lcXVhbC9saWIva2V5cy5qcyIsIm5vZGVfbW9kdWxlcy9vYmplY3QtYXNzaWduL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7QUNHQSxNQUFNLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDOzs7Ozs7QUNLM0MsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3BDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7QUFDbEIsSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDOztBQUUvQixNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7O0FBRWpDLGFBQVcsRUFBRSxPQUFPOztBQUVwQixRQUFNLEVBQUUsQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQzs7Ozs7Ozs7QUFRdkMsY0FBWSxFQUFFLENBQUM7O0FBRWYsaUJBQWUsRUFBRSwyQkFBWTs7OztBQUkzQixRQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7O0FBRWpCLFFBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQzs7QUFFbkMsU0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFBLFVBQVUsSUFBSSxFQUFFLENBQUMsRUFBRTtBQUMvQixhQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7QUFDckMsVUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0tBQ3JCLENBQUEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs7QUFFZCxXQUFPO0FBQ0wsYUFBTyxFQUFFLE9BQU87S0FDakIsQ0FBQztHQUNIOztBQUVELDJCQUF5QixFQUFFLG1DQUFVLFFBQVEsRUFBRTs7QUFFN0MsUUFBSSxPQUFPLEdBQUcsSUFB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vICMgaW5kZXhcblxuLy8gRXhwb3J0IHRoZSBGb3JtYXRpYyBSZWFjdCBjbGFzcyBhdCB0aGUgdG9wIGxldmVsLlxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9mb3JtYXRpYycpO1xuIiwiLy8gIyBhcnJheSBjb21wb25lbnRcblxuLypcblJlbmRlciBhIGZpZWxkIHRvIGVkaXQgYXJyYXkgdmFsdWVzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0FycmF5JyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgLy8gZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gIC8vICAgcmV0dXJuIHtcbiAgLy8gICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWVcbiAgLy8gICB9O1xuICAvLyB9LFxuXG4gIG5leHRMb29rdXBJZDogMCxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcblxuICAgIC8vIE5lZWQgdG8gY3JlYXRlIGFydGlmaWNpYWwga2V5cyBmb3IgdGhlIGFycmF5LiBJbmRleGVzIGFyZSBub3QgZ29vZCBrZXlzLFxuICAgIC8vIHNpbmNlIHRoZXkgY2hhbmdlLiBTbywgbWFwIGVhY2ggcG9zaXRpb24gdG8gYW4gYXJ0aWZpY2lhbCBrZXlcbiAgICB2YXIgbG9va3VwcyA9IFtdO1xuXG4gICAgdmFyIGl0ZW1zID0gdGhpcy5wcm9wcy5maWVsZC52YWx1ZTtcblxuICAgIGl0ZW1zLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0sIGkpIHtcbiAgICAgIGxvb2t1cHNbaV0gPSAnXycgKyB0aGlzLm5leHRMb29rdXBJZDtcbiAgICAgIHRoaXMubmV4dExvb2t1cElkKys7XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIHJldHVybiB7XG4gICAgICBsb29rdXBzOiBsb29rdXBzXG4gICAgfTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV3UHJvcHMpIHtcblxuICAgIHZhciBsb29rdXBzID0gdGhpcy5zdGF0ZS5sb29rdXBzO1xuXG4gICAgdmFyIGl0ZW1zID0gbmV3UHJvcHMuZmllbGQudmFsdWU7XG5cbiAgICAvLyBOZWVkIHRvIHNldCBhcnRpZmljaWFsIGtleXMgZm9yIG5ldyBhcnJheSBpdGVtcy5cbiAgICBpZiAoaXRlbXMubGVuZ3RoID4gbG9va3Vwcy5sZW5ndGgpIHtcbiAgICAgIGZvciAodmFyIGkgPSBsb29rdXBzLmxlbmd0aDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxvb2t1cHNbaV0gPSAnXycgKyB0aGlzLm5leHRMb29rdXBJZDtcbiAgICAgICAgdGhpcy5uZXh0TG9va3VwSWQrKztcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGxvb2t1cHM6IGxvb2t1cHNcbiAgICB9KTtcbiAgfSxcblxuICBvbkNoYW5nZTogZnVuY3Rpb24gKGksIG5ld1ZhbHVlLCBpbmZvKSB7XG4gICAgdmFyIG5ld0FycmF5VmFsdWUgPSB0aGlzLnByb3BzLmZpZWxkLnZhbHVlLnNsaWNlKDApO1xuICAgIG5ld0FycmF5VmFsdWVbaV0gPSBuZXdWYWx1ZTtcbiAgICB0aGlzLm9uQnViYmxlVmFsdWUobmV3QXJyYXlWYWx1ZSwgaW5mbyk7XG4gIH0sXG5cbiAgb25BcHBlbmQ6IGZ1bmN0aW9uIChpdGVtQ2hvaWNlSW5kZXgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHZhciBuZXdWYWx1ZSA9IGNvbmZpZy5jcmVhdGVOZXdDaGlsZEZpZWxkVmFsdWUoZmllbGQsIGl0ZW1DaG9pY2VJbmRleCk7XG5cbiAgICB2YXIgaXRlbXMgPSBmaWVsZC52YWx1ZTtcblxuICAgIGl0ZW1zID0gaXRlbXMuY29uY2F0KG5ld1ZhbHVlKTtcblxuICAgIHRoaXMub25DaGFuZ2VWYWx1ZShpdGVtcyk7XG4gIH0sXG5cbiAgb25SZW1vdmU6IGZ1bmN0aW9uIChpKSB7XG4gICAgdmFyIGxvb2t1cHMgPSB0aGlzLnN0YXRlLmxvb2t1cHM7XG4gICAgbG9va3Vwcy5zcGxpY2UoaSwgMSk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBsb29rdXBzOiBsb29rdXBzXG4gICAgfSk7XG4gICAgdmFyIG5ld0l0ZW1zID0gdGhpcy5wcm9wcy5maWVsZC52YWx1ZS5zbGljZSgwKTtcbiAgICBuZXdJdGVtcy5zcGxpY2UoaSwgMSk7XG4gICAgdGhpcy5vbkNoYW5nZVZhbHVlKG5ld0l0ZW1zKTtcbiAgfSxcblxuICBvbk1vdmU6IGZ1bmN0aW9uIChmcm9tSW5kZXgsIHRvSW5kZXgpIHtcbiAgICB2YXIgbG9va3VwcyA9IHRoaXMuc3RhdGUubG9va3VwcztcbiAgICB2YXIgZnJvbUlkID0gbG9va3Vwc1tmcm9tSW5kZXhdO1xuICAgIHZhciB0b0lkID0gbG9va3Vwc1t0b0luZGV4XTtcbiAgICBsb29rdXBzW2Zyb21JbmRleF0gPSB0b0lkO1xuICAgIGxvb2t1cHNbdG9JbmRleF0gPSBmcm9tSWQ7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBsb29rdXBzOiBsb29rdXBzXG4gICAgfSk7XG5cbiAgICB2YXIgbmV3SXRlbXMgPSB0aGlzLnByb3BzLmZpZWxkLnZhbHVlLnNsaWNlKDApO1xuICAgIGlmIChmcm9tSW5kZXggIT09IHRvSW5kZXggJiZcbiAgICAgIGZyb21JbmRleCA+PSAwICYmIGZyb21JbmRleCA8IG5ld0l0ZW1zLmxlbmd0aCAmJlxuICAgICAgdG9JbmRleCA+PSAwICYmIHRvSW5kZXggPCBuZXdJdGVtcy5sZW5ndGhcbiAgICApIHtcbiAgICAgIG5ld0l0ZW1zLnNwbGljZSh0b0luZGV4LCAwLCBuZXdJdGVtcy5zcGxpY2UoZnJvbUluZGV4LCAxKVswXSk7XG4gICAgfVxuICAgIHRoaXMub25DaGFuZ2VWYWx1ZShuZXdJdGVtcyk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgdmFyIGZpZWxkcyA9IGNvbmZpZy5jcmVhdGVDaGlsZEZpZWxkcyhmaWVsZCk7XG5cbiAgICB2YXIgbnVtSXRlbXMgPSBmaWVsZC52YWx1ZS5sZW5ndGg7XG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHtcbiAgICAgIGZpZWxkOiBmaWVsZCwgcGxhaW46IHRoaXMucHJvcHMucGxhaW5cbiAgICB9LFxuICAgICAgUi5kaXYoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKX0sXG4gICAgICAgIC8vIGNzcyB0cmFuc2l0aW9ucyBrbm93IHRvIGNhdXNlIGV2ZW50IHByb2JsZW1zXG4gICAgICAgIGNvbmZpZy5jc3NUcmFuc2l0aW9uV3JhcHBlcihcbiAgICAgICAgICBmaWVsZHMubWFwKGZ1bmN0aW9uIChjaGlsZEZpZWxkLCBpKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2FycmF5LWl0ZW0nLCB7XG4gICAgICAgICAgICAgIGtleTogdGhpcy5zdGF0ZS5sb29rdXBzW2ldLFxuICAgICAgICAgICAgICBmaWVsZDogY2hpbGRGaWVsZCxcbiAgICAgICAgICAgICAgaW5kZXg6IGksXG4gICAgICAgICAgICAgIG51bUl0ZW1zOiBudW1JdGVtcyxcbiAgICAgICAgICAgICAgb25Nb3ZlOiB0aGlzLm9uTW92ZSxcbiAgICAgICAgICAgICAgb25SZW1vdmU6IHRoaXMub25SZW1vdmUsXG4gICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgICAgICAgICBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvblxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICApLFxuICAgICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgnYXJyYXktY29udHJvbCcsIHtmaWVsZDogZmllbGQsIG9uQXBwZW5kOiB0aGlzLm9uQXBwZW5kfSlcbiAgICAgIClcbiAgICApO1xuICB9XG59KTtcbiIsIi8vICMgYm9vbGVhbiBjb21wb25lbnRcblxuLypcblJlbmRlciBhIGRyb3Bkb3duIHRvIGhhbmRsZSB5ZXMvbm8gYm9vbGVhbiB2YWx1ZXMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0Jvb2xlYW4nLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICBvbkNoYW5nZTogZnVuY3Rpb24gKG5ld1ZhbHVlKSB7XG4gICAgdGhpcy5vbkNoYW5nZVZhbHVlKG5ld1ZhbHVlKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICB2YXIgY2hvaWNlcyA9IGNvbmZpZy5maWVsZEJvb2xlYW5DaG9pY2VzKGZpZWxkKTtcblxuICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQnLCB7XG4gICAgICBmaWVsZDogZmllbGQsIHBsYWluOiB0aGlzLnByb3BzLnBsYWluXG4gICAgfSwgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ3NlbGVjdC12YWx1ZScsIHtcbiAgICAgIGNob2ljZXM6IGNob2ljZXMsIGZpZWxkOiBmaWVsZCwgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsIG9uQWN0aW9uOiB0aGlzLm9uQnViYmxlQWN0aW9uXG4gICAgfSkpO1xuICB9XG59KTtcbiIsIi8vICMgY2hlY2tib3gtYXJyYXkgY29tcG9uZW50XG5cbi8qXG5Vc2VkIHdpdGggYXJyYXkgdmFsdWVzIHRvIHN1cHBseSBtdWx0aXBsZSBjaGVja2JveGVzIGZvciBhZGRpbmcgbXVsdGlwbGVcbmVudW1lcmF0ZWQgdmFsdWVzIHRvIGFuIGFycmF5LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgXyA9IHJlcXVpcmUoJy4uLy4uL3VuZGFzaCcpO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0NoZWNrYm94QXJyYXknLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY2hvaWNlczogdGhpcy5wcm9wcy5jb25maWcuZmllbGRDaG9pY2VzKHRoaXMucHJvcHMuZmllbGQpXG4gICAgfTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV3UHJvcHMpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGNob2ljZXM6IG5ld1Byb3BzLmNvbmZpZy5maWVsZENob2ljZXMobmV3UHJvcHMuZmllbGQpXG4gICAgfSk7XG4gIH0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBHZXQgYWxsIHRoZSBjaGVja2VkIGNoZWNrYm94ZXMgYW5kIGNvbnZlcnQgdG8gYW4gYXJyYXkgb2YgdmFsdWVzLlxuICAgIHZhciBjaG9pY2VOb2RlcyA9IHRoaXMucmVmcy5jaG9pY2VzLmdldERPTU5vZGUoKS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW5wdXQnKTtcbiAgICBjaG9pY2VOb2RlcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGNob2ljZU5vZGVzLCAwKTtcbiAgICB2YXIgdmFsdWVzID0gY2hvaWNlTm9kZXMubWFwKGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICByZXR1cm4gbm9kZS5jaGVja2VkID8gbm9kZS52YWx1ZSA6IG51bGw7XG4gICAgfSkuZmlsdGVyKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0pO1xuICAgIHRoaXMub25DaGFuZ2VWYWx1ZSh2YWx1ZXMpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHZhciBjaG9pY2VzID0gdGhpcy5zdGF0ZS5jaG9pY2VzIHx8IFtdO1xuXG4gICAgdmFyIGlzSW5saW5lID0gIV8uZmluZChjaG9pY2VzLCBmdW5jdGlvbiAoY2hvaWNlKSB7XG4gICAgICByZXR1cm4gY2hvaWNlLnNhbXBsZTtcbiAgICB9KTtcblxuICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQnLCB7XG4gICAgICBmaWVsZDogZmllbGRcbiAgICB9LFxuICAgICAgUi5kaXYoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSwgcmVmOiAnY2hvaWNlcyd9LFxuICAgICAgICBjaG9pY2VzLm1hcChmdW5jdGlvbiAoY2hvaWNlLCBpKSB7XG5cbiAgICAgICAgICB2YXIgaW5wdXRGaWVsZCA9IFIuc3Bhbih7c3R5bGU6IHt3aGl0ZVNwYWNlOiAnbm93cmFwJ319LFxuICAgICAgICAgICAgUi5pbnB1dCh7XG4gICAgICAgICAgICAgIG5hbWU6IGZpZWxkLmtleSxcbiAgICAgICAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgICAgICAgdmFsdWU6IGNob2ljZS52YWx1ZSxcbiAgICAgICAgICAgICAgY2hlY2tlZDogZmllbGQudmFsdWUuaW5kZXhPZihjaG9pY2UudmFsdWUpID49IDAgPyB0cnVlIDogZmFsc2UsXG4gICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgICAgICAgICBvbkZvY3VzOiB0aGlzLm9uRm9jdXNBY3Rpb24sXG4gICAgICAgICAgICAgIG9uQmx1cjogdGhpcy5vbkJsdXJBY3Rpb25cbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgJyAnLFxuICAgICAgICAgICAgUi5zcGFuKHtjbGFzc05hbWU6ICdmaWVsZC1jaG9pY2UtbGFiZWwnfSxcbiAgICAgICAgICAgICAgY2hvaWNlLmxhYmVsXG4gICAgICAgICAgICApXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIGlmIChpc0lubGluZSkge1xuICAgICAgICAgICAgcmV0dXJuIFIuc3Bhbih7a2V5OiBpLCBjbGFzc05hbWU6ICdmaWVsZC1jaG9pY2UnfSxcbiAgICAgICAgICAgICAgaW5wdXRGaWVsZCwgJyAnXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gUi5kaXYoe2tleTogaSwgY2xhc3NOYW1lOiAnZmllbGQtY2hvaWNlJ30sXG4gICAgICAgICAgICAgIGlucHV0RmllbGQsICcgJyxcbiAgICAgICAgICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ3NhbXBsZScsIHtmaWVsZDogZmllbGQsIGNob2ljZTogY2hvaWNlfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG4iLCIvLyAjIGNoZWNrYm94LWJvb2xlYW4gY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgYSBmaWVsZCB0aGF0IGNhbiBlZGl0IGEgYm9vbGVhbiB3aXRoIGEgY2hlY2tib3guXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnQ2hlY2tib3hCb29sZWFuJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHRoaXMub25DaGFuZ2VWYWx1ZShldmVudC50YXJnZXQuY2hlY2tlZCk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHtcbiAgICAgIGNvbmZpZzogY29uZmlnLCBmaWVsZDogZmllbGQsIHBsYWluOiB0cnVlXG4gICAgfSxcbiAgICBSLnNwYW4oe3N0eWxlOiB7d2hpdGVTcGFjZTogJ25vd3JhcCd9fSxcbiAgICAgIFIuaW5wdXQoe1xuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICBjaGVja2VkOiBmaWVsZC52YWx1ZSxcbiAgICAgICAgY2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpLFxuICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgICAgb25Gb2N1czogdGhpcy5vbkZvY3VzQWN0aW9uLFxuICAgICAgICBvbkJsdXI6IHRoaXMub25CbHVyQWN0aW9uXG4gICAgICB9KSxcbiAgICAgIFIuc3Bhbih7fSwgJyAnKSxcbiAgICAgIFIuc3Bhbih7fSwgY29uZmlnLmZpZWxkSGVscFRleHQoZmllbGQpIHx8IGNvbmZpZy5maWVsZExhYmVsKGZpZWxkKSlcbiAgICApKTtcbiAgfVxufSk7XG4iLCIndXNlIHN0cmljdCc7XG4vKiBnbG9iYWwgQ29kZU1pcnJvciAqL1xuLyplc2xpbnQgbm8tc2NyaXB0LXVybDowICovXG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIF8gPSByZXF1aXJlKCcuLi8uLi91bmRhc2gnKTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxuLypcbiAgQSB2ZXJ5IHRyaW1tZWQgZG93biBmaWVsZCB0aGF0IHVzZXMgQ29kZU1pcnJvciBmb3Igc3ludGF4IGhpZ2hsaWdodGluZyAqb25seSouXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogJ0NvZGUnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jcmVhdGVDb2RlTWlycm9yRWRpdG9yKCk7XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVtb3ZlQ29kZU1pcnJvckVkaXRvcigpO1xuICB9LFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZhbHVlOiB0aGlzLnByb3BzLmZpZWxkLnZhbHVlXG4gICAgfTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbihuZXh0UHJvcHMpIHtcbiAgICB0aGlzLnNldFN0YXRlKHt2YWx1ZTogbmV4dFByb3BzLmZpZWxkLnZhbHVlfSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuICAgIHZhciBwcm9wcyA9IHsgZmllbGQ6IGZpZWxkLCBwbGFpbjogdGhpcy5wcm9wcy5wbGFpbiB9O1xuICAgIHZhciB0YWJJbmRleCA9IGZpZWxkLnRhYkluZGV4O1xuICAgIHZhciB0ZXh0Qm94Q2xhc3NlcyA9IGN4KF8uZXh0ZW5kKHt9LCB0aGlzLnByb3BzLmNsYXNzZXMsIHsncHJldHR5LXRleHQtYm94JzogdHJ1ZX0pKTtcblxuICAgIC8vIFJlbmRlciByZWFkLW9ubHkgdmVyc2lvbi5cbiAgICB2YXIgZWxlbWVudCA9IChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPSdwcmV0dHktdGV4dC13cmFwcGVyJz5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e3RleHRCb3hDbGFzc2VzfSB0YWJJbmRleD17dGFiSW5kZXh9IG9uRm9jdXM9e3RoaXMub25Gb2N1c0FjdGlvbn0gb25CbHVyPXt0aGlzLm9uQmx1ckFjdGlvbn0+XG4gICAgICAgICAgPGRpdiByZWY9J3RleHRCb3gnIGNsYXNzTmFtZT0naW50ZXJuYWwtdGV4dC13cmFwcGVyJyAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG5cbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywgcHJvcHMsIGVsZW1lbnQpO1xuICB9LFxuXG4gIGNyZWF0ZUNvZGVNaXJyb3JFZGl0b3I6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgIGxpbmVXcmFwcGluZzogdHJ1ZSxcbiAgICAgIHRhYmluZGV4OiB0aGlzLnByb3BzLnRhYkluZGV4LFxuICAgICAgdmFsdWU6IFN0cmluZyh0aGlzLnN0YXRlLnZhbHVlKSxcbiAgICAgIG1vZGU6IHRoaXMucHJvcHMuZmllbGQubGFuZ3VhZ2UgfHwgbnVsbFxuICAgIH07XG5cbiAgICBpZiAodGhpcy5wcm9wcy5maWVsZC5jb2RlTWlycm9yT3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IF8uZXh0ZW5kKHt9LCBvcHRpb25zLCB0aGlzLnByb3BzLmZpZWxkLmNvZGVNaXJyb3JPcHRpb25zKTtcbiAgICB9XG5cbiAgICB2YXIgdGV4dEJveCA9IHRoaXMucmVmcy50ZXh0Qm94LmdldERPTU5vZGUoKTtcbiAgICB0aGlzLmNvZGVNaXJyb3IgPSBDb2RlTWlycm9yKHRleHRCb3gsIG9wdGlvbnMpO1xuICAgIHRoaXMuY29kZU1pcnJvci5vbignY2hhbmdlJywgdGhpcy5vbkNvZGVNaXJyb3JDaGFuZ2UpO1xuICB9LFxuXG4gIHJlbW92ZUNvZGVNaXJyb3JFZGl0b3I6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGV4dEJveE5vZGUgPSB0aGlzLnJlZnMudGV4dEJveC5nZXRET01Ob2RlKCk7XG4gICAgdmFyIGNtTm9kZSA9IHRleHRCb3hOb2RlLmZpcnN0Q2hpbGQ7XG4gICAgdGV4dEJveE5vZGUucmVtb3ZlQ2hpbGQoY21Ob2RlKTtcbiAgICB0aGlzLmNvZGVNaXJyb3IgPSBudWxsO1xuICB9LFxuXG4gIG9uQ29kZU1pcnJvckNoYW5nZTogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnVwZGF0aW5nQ29kZU1pcnJvcikge1xuICAgICAgLy8gYXZvaWQgcmVjdXJzaXZlIHVwZGF0ZSBjeWNsZSwgYW5kIG1hcmsgdGhlIGNvZGUgbWlycm9yIG1hbnVhbCB1cGRhdGUgYXMgZG9uZVxuICAgICAgdGhpcy51cGRhdGluZ0NvZGVNaXJyb3IgPSBmYWxzZTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgbmV3VmFsdWUgPSB0aGlzLmNvZGVNaXJyb3IuZ2V0VmFsdWUoKTtcbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUobmV3VmFsdWUpO1xuICAgIHRoaXMuc2V0U3RhdGUoe3ZhbHVlOiBuZXdWYWx1ZX0pO1xuICB9XG5cbn0pO1xuIiwiLy8gIyBjb3B5IGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIG5vbi1lZGl0YWJsZSBodG1sL3RleHQgKHRoaW5rIGFydGljbGUgY29weSkuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnQ29weScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSwgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw6IHtcbiAgICAgIF9faHRtbDogdGhpcy5wcm9wcy5jb25maWcuZmllbGRIZWxwVGV4dCh0aGlzLnByb3BzLmZpZWxkKVxuICAgIH19KTtcbiAgfVxufSk7XG4iLCIvLyAjIGZpZWxkcyBjb21wb25lbnRcblxuLypcblJlbmRlciBhIGZpZWxkIHRvIGVkaXQgdGhlIHZhbHVlcyBvZiBhbiBvYmplY3Qgd2l0aCBzdGF0aWMgcHJvcGVydGllcy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBfID0gcmVxdWlyZSgnLi4vLi4vdW5kYXNoJyk7XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnRmllbGRzJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgb25DaGFuZ2VGaWVsZDogZnVuY3Rpb24gKGtleSwgbmV3VmFsdWUsIGluZm8pIHtcbiAgICBpZiAoa2V5KSB7XG4gICAgICB2YXIgbmV3T2JqZWN0VmFsdWUgPSBfLmV4dGVuZCh7fSwgdGhpcy5wcm9wcy5maWVsZC52YWx1ZSk7XG4gICAgICBuZXdPYmplY3RWYWx1ZVtrZXldID0gbmV3VmFsdWU7XG4gICAgICB0aGlzLm9uQnViYmxlVmFsdWUobmV3T2JqZWN0VmFsdWUsIGluZm8pO1xuICAgIH1cbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgdmFyIGZpZWxkcyA9IGNvbmZpZy5jcmVhdGVDaGlsZEZpZWxkcyhmaWVsZCk7XG5cbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywge1xuICAgICAgY29uZmlnOiBjb25maWcsIGZpZWxkOiBmaWVsZCwgcGxhaW46IHRoaXMucHJvcHMucGxhaW5cbiAgICB9LFxuICAgICAgUi5maWVsZHNldCh7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpfSxcbiAgICAgICAgZmllbGRzLm1hcChmdW5jdGlvbiAoY2hpbGRGaWVsZCwgaSkge1xuICAgICAgICAgIHZhciBrZXkgPSBjaGlsZEZpZWxkLmtleSB8fCBpO1xuICAgICAgICAgIHJldHVybiBjb25maWcuY3JlYXRlRmllbGRFbGVtZW50KHtcbiAgICAgICAgICAgIGtleToga2V5IHx8IGksXG4gICAgICAgICAgICBmaWVsZDogY2hpbGRGaWVsZCxcbiAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlRmllbGQuYmluZCh0aGlzLCBrZXkpLCBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvblxuICAgICAgICAgIH0pO1xuICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICApXG4gICAgKTtcbiAgfVxuXG59KTtcbiIsIi8vICMganNvbiBjb21wb25lbnRcblxuLypcblRleHRhcmVhIGVkaXRvciBmb3IgSlNPTi4gV2lsbCB2YWxpZGF0ZSB0aGUgSlNPTiBiZWZvcmUgc2V0dGluZyB0aGUgdmFsdWUsIHNvXG53aGlsZSB0aGUgdmFsdWUgaXMgaW52YWxpZCwgbm8gZXh0ZXJuYWwgc3RhdGUgY2hhbmdlcyB3aWxsIG9jY3VyLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnSnNvbicsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICByb3dzOiA1XG4gICAgfTtcbiAgfSxcblxuICBpc1ZhbGlkVmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuXG4gICAgdHJ5IHtcbiAgICAgIEpTT04ucGFyc2UodmFsdWUpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaXNWYWxpZDogdHJ1ZSxcbiAgICAgIHZhbHVlOiBKU09OLnN0cmluZ2lmeSh0aGlzLnByb3BzLmZpZWxkLnZhbHVlLCBudWxsLCAyKVxuICAgIH07XG4gIH0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHZhciBpc1ZhbGlkID0gdGhpcy5pc1ZhbGlkVmFsdWUoZXZlbnQudGFyZ2V0LnZhbHVlKTtcblxuICAgIGlmIChpc1ZhbGlkKSB7XG4gICAgICAvLyBOZWVkIHRvIGhhbmRsZSB0aGlzIGJldHRlci4gTmVlZCB0byB0cmFjayBwb3NpdGlvbi5cbiAgICAgIHRoaXMuX2lzQ2hhbmdpbmcgPSB0cnVlO1xuICAgICAgdGhpcy5vbkNoYW5nZVZhbHVlKEpTT04ucGFyc2UoZXZlbnQudGFyZ2V0LnZhbHVlKSk7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBpc1ZhbGlkOiBpc1ZhbGlkLFxuICAgICAgdmFsdWU6IGV2ZW50LnRhcmdldC52YWx1ZVxuICAgIH0pO1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXh0UHJvcHMpIHtcbiAgICBpZiAoIXRoaXMuX2lzQ2hhbmdpbmcpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBpc1ZhbGlkOiB0cnVlLFxuICAgICAgICB2YWx1ZTogSlNPTi5zdHJpbmdpZnkobmV4dFByb3BzLmZpZWxkLnZhbHVlLCBudWxsLCAyKVxuICAgICAgfSk7XG4gICAgfVxuICAgIHRoaXMuX2lzQ2hhbmdpbmcgPSBmYWxzZTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHtcbiAgICAgIGZpZWxkOiBjb25maWcuZmllbGRXaXRoVmFsdWUoZmllbGQsIHRoaXMuc3RhdGUudmFsdWUpLCBwbGFpbjogdGhpcy5wcm9wcy5wbGFpblxuICAgIH0sIFIudGV4dGFyZWEoe1xuICAgICAgICBjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcyksXG4gICAgICAgIHZhbHVlOiB0aGlzLnN0YXRlLnZhbHVlLFxuICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgICAgc3R5bGU6IHtiYWNrZ3JvdW5kQ29sb3I6IHRoaXMuc3RhdGUuaXNWYWxpZCA/ICcnIDogJ3JnYigyNTUsMjAwLDIwMCknfSxcbiAgICAgICAgcm93czogY29uZmlnLmZpZWxkUm93cyhmaWVsZCkgfHwgdGhpcy5wcm9wcy5yb3dzLFxuICAgICAgICBvbkZvY3VzOiB0aGlzLm9uRm9jdXNBY3Rpb24sXG4gICAgICAgIG9uQmx1cjogdGhpcy5vbkJsdXJBY3Rpb25cbiAgICAgIH0pXG4gICAgKTtcbiAgfVxufSk7XG4iLCIvLyAjIG9iamVjdCBjb21wb25lbnRcblxuLypcblJlbmRlciBhIGZpZWxkIHRvIGVkaXQgYW4gb2JqZWN0IHdpdGggZHluYW1pYyBjaGlsZCBmaWVsZHMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgXyA9IHJlcXVpcmUoJy4uLy4uL3VuZGFzaCcpO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG52YXIgdGVtcEtleVByZWZpeCA9ICckJF9fdGVtcF9fJztcblxudmFyIHRlbXBLZXkgPSBmdW5jdGlvbiAoaWQpIHtcbiAgcmV0dXJuIHRlbXBLZXlQcmVmaXggKyBpZDtcbn07XG5cbnZhciBpc1RlbXBLZXkgPSBmdW5jdGlvbiAoa2V5KSB7XG4gIHJldHVybiBrZXkuc3Vic3RyaW5nKDAsIHRlbXBLZXlQcmVmaXgubGVuZ3RoKSA9PT0gdGVtcEtleVByZWZpeDtcbn07XG5cbi8vIFRPRE86IGtlZXAgaW52YWxpZCBrZXlzIGFzIHN0YXRlIGFuZCBkb24ndCBzZW5kIGluIG9uQ2hhbmdlOyBjbG9uZSBjb250ZXh0XG4vLyBhbmQgdXNlIGNsb25lIHRvIGNyZWF0ZSBjaGlsZCBjb250ZXh0c1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ09iamVjdCcsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIG5leHRMb29rdXBJZDogMCxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBrZXlUb0lkID0ge307XG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLnByb3BzLmZpZWxkLnZhbHVlKTtcbiAgICB2YXIga2V5T3JkZXIgPSBbXTtcbiAgICAvLyBUZW1wIGtleXMga2VlcHMgdGhlIGtleSB0byBkaXNwbGF5LCB3aGljaCBzb21ldGltZXMgbWF5IGJlIGRpZmZlcmVudFxuICAgIC8vIHRoYW4gdGhlIGFjdHVhbCBrZXkuIEZvciBleGFtcGxlLCBkdXBsaWNhdGUga2V5cyBhcmUgbm90IGFsbG93ZWQsXG4gICAgLy8gYnV0IHdlIG1heSB0ZW1wb3JhcmlseSBzaG93IGR1cGxpY2F0ZSBrZXlzLlxuICAgIHZhciB0ZW1wRGlzcGxheUtleXMgPSB7fTtcblxuICAgIC8vIEtleXMgZG9uJ3QgbWFrZSBnb29kIHJlYWN0IGtleXMsIHNpbmNlIHdlJ3JlIGFsbG93aW5nIHRoZW0gdG8gYmVcbiAgICAvLyBjaGFuZ2VkIGhlcmUsIHNvIHdlJ2xsIGhhdmUgdG8gY3JlYXRlIGZha2Uga2V5cyBhbmRcbiAgICAvLyBrZWVwIHRyYWNrIG9mIHRoZSBtYXBwaW5nIG9mIHJlYWwga2V5cyB0byBmYWtlIGtleXMuIFl1Y2suXG4gICAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHZhciBpZCA9ICsrdGhpcy5uZXh0TG9va3VwSWQ7XG4gICAgICAvLyBNYXAgdGhlIHJlYWwga2V5IHRvIHRoZSBpZC5cbiAgICAgIGtleVRvSWRba2V5XSA9IGlkO1xuICAgICAgLy8gS2VlcCB0aGUgb3JkZXJpbmcgb2YgdGhlIGtleXMgc28gd2UgZG9uJ3Qgc2h1ZmZsZSB0aGluZ3MgYXJvdW5kIGxhdGVyLlxuICAgICAga2V5T3JkZXIucHVzaChrZXkpO1xuICAgICAgLy8gSWYgdGhpcyBpcyBhIHRlbXBvcmFyeSBrZXkgdGhhdCB3YXMgcGVyc2lzdGVkLCBiZXN0IHdlIGNhbiBkbyBpcyBkaXNwbGF5XG4gICAgICAvLyBhIGJsYW5rLlxuICAgICAgLy8gVE9ETzogUHJvYmFibHkganVzdCBub3Qgc2VuZCB0ZW1wb3Jhcnkga2V5cyBiYWNrIHRocm91Z2guIFRoaXMgYmVoYXZpb3JcbiAgICAgIC8vIGlzIGFjdHVhbGx5IGxlZnRvdmVyIGZyb20gYW4gZWFybGllciBpbmNhcm5hdGlvbiBvZiBmb3JtYXRpYyB3aGVyZVxuICAgICAgLy8gdmFsdWVzIGhhZCB0byBnbyBiYWNrIHRvIHRoZSByb290LlxuICAgICAgaWYgKGlzVGVtcEtleShrZXkpKSB7XG4gICAgICAgIHRlbXBEaXNwbGF5S2V5c1tpZF0gPSAnJztcbiAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGtleVRvSWQ6IGtleVRvSWQsXG4gICAgICBrZXlPcmRlcjoga2V5T3JkZXIsXG4gICAgICAvLyBUZW1wIGtleXMga2VlcHMgdGhlIGtleSB0byBkaXNwbGF5LCB3aGljaCBzb21ldGltZXMgbWF5IGJlIGRpZmZlcmVudFxuICAgICAgLy8gdGhhbiB0aGUgYWN0dWFsIGtleS4gRm9yIGV4YW1wbGUsIGR1cGxpY2F0ZSBrZXlzIGFyZSBub3QgYWxsb3dlZCxcbiAgICAgIC8vIGJ1dCB3ZSBtYXkgdGVtcG9yYXJpbHkgc2hvdyBkdXBsaWNhdGUga2V5cy5cbiAgICAgIHRlbXBEaXNwbGF5S2V5czogdGVtcERpc3BsYXlLZXlzXG4gICAgfTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV3UHJvcHMpIHtcblxuICAgIHZhciBrZXlUb0lkID0gdGhpcy5zdGF0ZS5rZXlUb0lkO1xuICAgIHZhciBuZXdLZXlUb0lkID0ge307XG4gICAgdmFyIHRlbXBEaXNwbGF5S2V5cyA9IHRoaXMuc3RhdGUudGVtcERpc3BsYXlLZXlzO1xuICAgIHZhciBuZXdUZW1wRGlzcGxheUtleXMgPSB7fTtcbiAgICB2YXIga2V5T3JkZXIgPSB0aGlzLnN0YXRlLmtleU9yZGVyO1xuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMobmV3UHJvcHMuZmllbGQudmFsdWUpO1xuICAgIHZhciBhZGRlZEtleXMgPSBbXTtcblxuICAgIC8vIExvb2sgYXQgdGhlIG5ldyBrZXlzLlxuICAgIGtleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAvLyBBZGQgbmV3IGxvb2t1cCBpZiB0aGlzIGtleSB3YXNuJ3QgaGVyZSBsYXN0IHRpbWUuXG4gICAgICBpZiAoIWtleVRvSWRba2V5XSkge1xuICAgICAgICB0aGlzLm5leHRMb29rdXBJZCsrO1xuICAgICAgICBuZXdLZXlUb0lkW2tleV0gPSB0aGlzLm5leHRMb29rdXBJZDtcbiAgICAgICAgYWRkZWRLZXlzLnB1c2goa2V5KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld0tleVRvSWRba2V5XSA9IGtleVRvSWRba2V5XTtcbiAgICAgIH1cbiAgICAgIGlmIChpc1RlbXBLZXkoa2V5KSAmJiBuZXdLZXlUb0lkW2tleV0gaW4gdGVtcERpc3BsYXlLZXlzKSB7XG4gICAgICAgIG5ld1RlbXBEaXNwbGF5S2V5c1tuZXdLZXlUb0lkW2tleV1dID0gdGVtcERpc3BsYXlLZXlzW25ld0tleVRvSWRba2V5XV07XG4gICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIHZhciBuZXdLZXlPcmRlciA9IFtdO1xuXG4gICAgLy8gTG9vayBhdCB0aGUgb2xkIGtleXMuXG4gICAga2V5T3JkZXIuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAvLyBJZiB0aGUga2V5IGlzIGluIHRoZSBuZXcga2V5cywgcHVzaCBpdCBvbnRvIHRoZSBvcmRlciB0byByZXRhaW4gdGhlXG4gICAgICAvLyBzYW1lIG9yZGVyLlxuICAgICAgaWYgKG5ld0tleVRvSWRba2V5XSkge1xuICAgICAgICBuZXdLZXlPcmRlci5wdXNoKGtleSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBQdXQgYWRkZWQgZmllbGRzIGF0IHRoZSBlbmQuIChTbyB0aGluZ3MgZG9uJ3QgZ2V0IHNodWZmbGVkLilcbiAgICBuZXdLZXlPcmRlciA9IG5ld0tleU9yZGVyLmNvbmNhdChhZGRlZEtleXMpO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBrZXlUb0lkOiBuZXdLZXlUb0lkLFxuICAgICAga2V5T3JkZXI6IG5ld0tleU9yZGVyLFxuICAgICAgdGVtcERpc3BsYXlLZXlzOiBuZXdUZW1wRGlzcGxheUtleXNcbiAgICB9KTtcbiAgfSxcblxuICBvbkNoYW5nZTogZnVuY3Rpb24gKGtleSwgbmV3VmFsdWUsIGluZm8pIHtcbiAgICB2YXIgbmV3T2JqID0gXy5leHRlbmQoe30sIHRoaXMucHJvcHMuZmllbGQudmFsdWUpO1xuICAgIG5ld09ialtrZXldID0gbmV3VmFsdWU7XG4gICAgdGhpcy5vbkJ1YmJsZVZhbHVlKG5ld09iaiwgaW5mbyk7XG4gIH0sXG5cbiAgb25BcHBlbmQ6IGZ1bmN0aW9uIChpdGVtQ2hvaWNlSW5kZXgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcbiAgICB0aGlzLm5leHRMb29rdXBJZCsrO1xuXG4gICAgdmFyIGtleVRvSWQgPSB0aGlzLnN0YXRlLmtleVRvSWQ7XG4gICAgdmFyIGtleU9yZGVyID0gdGhpcy5zdGF0ZS5rZXlPcmRlcjtcbiAgICB2YXIgdGVtcERpc3BsYXlLZXlzID0gdGhpcy5zdGF0ZS50ZW1wRGlzcGxheUtleXM7XG5cbiAgICB2YXIgaWQgPSB0aGlzLm5leHRMb29rdXBJZDtcbiAgICB2YXIgbmV3S2V5ID0gdGVtcEtleShpZCk7XG5cbiAgICBrZXlUb0lkW25ld0tleV0gPSBpZDtcbiAgICAvLyBUZW1wb3JhcmlseSwgd2UnbGwgc2hvdyBhIGJsYW5rIGtleS5cbiAgICB0ZW1wRGlzcGxheUtleXNbaWRdID0gJyc7XG4gICAga2V5T3JkZXIucHVzaChuZXdLZXkpO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBrZXlUb0lkOiBrZXlUb0lkLFxuICAgICAgdGVtcERpc3BsYXlLZXlzOiB0ZW1wRGlzcGxheUtleXMsXG4gICAgICBrZXlPcmRlcjoga2V5T3JkZXJcbiAgICB9KTtcblxuICAgIHZhciBuZXdPYmogPSBfLmV4dGVuZCh0aGlzLnByb3BzLmZpZWxkLnZhbHVlKTtcblxuICAgIHZhciBuZXdWYWx1ZSA9IGNvbmZpZy5jcmVhdGVOZXdDaGlsZEZpZWxkVmFsdWUoZmllbGQsIGl0ZW1DaG9pY2VJbmRleCk7XG5cbiAgICBuZXdPYmpbbmV3S2V5XSA9IG5ld1ZhbHVlO1xuXG4gICAgdGhpcy5vbkNoYW5nZVZhbHVlKG5ld09iaik7XG4gIH0sXG5cbiAgb25SZW1vdmU6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICB2YXIgbmV3T2JqID0gXy5leHRlbmQodGhpcy5wcm9wcy5maWVsZC52YWx1ZSk7XG4gICAgZGVsZXRlIG5ld09ialtrZXldO1xuICAgIHRoaXMub25DaGFuZ2VWYWx1ZShuZXdPYmopO1xuICB9LFxuXG4gIG9uTW92ZTogZnVuY3Rpb24gKGZyb21LZXksIHRvS2V5KSB7XG4gICAgaWYgKGZyb21LZXkgIT09IHRvS2V5KSB7XG4gICAgICB2YXIga2V5VG9JZCA9IHRoaXMuc3RhdGUua2V5VG9JZDtcbiAgICAgIHZhciBrZXlPcmRlciA9IHRoaXMuc3RhdGUua2V5T3JkZXI7XG4gICAgICB2YXIgdGVtcERpc3BsYXlLZXlzID0gdGhpcy5zdGF0ZS50ZW1wRGlzcGxheUtleXM7XG5cbiAgICAgIHZhciBuZXdPYmogPSBfLmV4dGVuZCh0aGlzLnByb3BzLmZpZWxkLnZhbHVlKTtcblxuICAgICAgLy8gSWYgd2UgYWxyZWFkeSBoYXZlIHRoZSBrZXkgd2UncmUgbW92aW5nIHRvLCB0aGVuIHdlIGhhdmUgdG8gY2hhbmdlIHRoYXRcbiAgICAgIC8vIGtleSB0byBzb21ldGhpbmcgZWxzZS5cbiAgICAgIGlmIChrZXlUb0lkW3RvS2V5XSkge1xuICAgICAgICAvLyBNYWtlIGEgbmV3XG4gICAgICAgIHZhciB0ZW1wVG9LZXkgPSB0ZW1wS2V5KGtleVRvSWRbdG9LZXldKTtcbiAgICAgICAgdGVtcERpc3BsYXlLZXlzW2tleVRvSWRbdG9LZXldXSA9IHRvS2V5O1xuICAgICAgICBrZXlUb0lkW3RlbXBUb0tleV0gPSBrZXlUb0lkW3RvS2V5XTtcbiAgICAgICAga2V5T3JkZXJba2V5T3JkZXIuaW5kZXhPZih0b0tleSldID0gdGVtcFRvS2V5O1xuICAgICAgICBkZWxldGUga2V5VG9JZFt0b0tleV07XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIGtleVRvSWQ6IGtleVRvSWQsXG4gICAgICAgICAgdGVtcERpc3BsYXlLZXlzOiB0ZW1wRGlzcGxheUtleXMsXG4gICAgICAgICAga2V5T3JkZXI6IGtleU9yZGVyXG4gICAgICAgIH0pO1xuXG4gICAgICAgIG5ld09ialt0ZW1wVG9LZXldID0gbmV3T2JqW3RvS2V5XTtcbiAgICAgICAgZGVsZXRlIG5ld09ialt0b0tleV07XG4gICAgICB9XG5cbiAgICAgIGlmICghdG9LZXkpIHtcbiAgICAgICAgdG9LZXkgPSB0ZW1wS2V5KGtleVRvSWRbZnJvbUtleV0pO1xuICAgICAgICB0ZW1wRGlzcGxheUtleXNba2V5VG9JZFtmcm9tS2V5XV0gPSAnJztcbiAgICAgIH1cbiAgICAgIGtleVRvSWRbdG9LZXldID0ga2V5VG9JZFtmcm9tS2V5XTtcbiAgICAgIGRlbGV0ZSBrZXlUb0lkW2Zyb21LZXldO1xuICAgICAga2V5T3JkZXJba2V5T3JkZXIuaW5kZXhPZihmcm9tS2V5KV0gPSB0b0tleTtcblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGtleVRvSWQ6IGtleVRvSWQsXG4gICAgICAgIGtleU9yZGVyOiBrZXlPcmRlcixcbiAgICAgICAgdGVtcERpc3BsYXlLZXlzOiB0ZW1wRGlzcGxheUtleXNcbiAgICAgIH0pO1xuXG4gICAgICBuZXdPYmpbdG9LZXldID0gbmV3T2JqW2Zyb21LZXldO1xuICAgICAgZGVsZXRlIG5ld09ialtmcm9tS2V5XTtcblxuICAgICAgdGhpcy5vbkNoYW5nZVZhbHVlKG5ld09iaik7XG5cbiAgICAgIC8vIENoZWNrIGlmIG91ciBmcm9tS2V5IGhhcyBvcGVuZWQgdXAgYSBzcG90LlxuICAgICAgaWYgKGZyb21LZXkgJiYgZnJvbUtleSAhPT0gdG9LZXkpIHtcbiAgICAgICAgaWYgKCEoZnJvbUtleSBpbiBuZXdPYmopKSB7XG4gICAgICAgICAgT2JqZWN0LmtleXMobmV3T2JqKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIGlmICghKGlzVGVtcEtleShrZXkpKSkge1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaWQgPSBrZXlUb0lkW2tleV07XG4gICAgICAgICAgICB2YXIgZGlzcGxheUtleSA9IHRlbXBEaXNwbGF5S2V5c1tpZF07XG4gICAgICAgICAgICBpZiAoZnJvbUtleSA9PT0gZGlzcGxheUtleSkge1xuICAgICAgICAgICAgICB0aGlzLm9uTW92ZShrZXksIGRpc3BsYXlLZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgZ2V0RmllbGRzOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICB2YXIgZmllbGRzID0gY29uZmlnLmNyZWF0ZUNoaWxkRmllbGRzKGZpZWxkKTtcblxuICAgIHZhciBrZXlUb0ZpZWxkID0ge307XG5cbiAgICBfLmVhY2goZmllbGRzLCBmdW5jdGlvbiAoY2hpbGRGaWVsZCkge1xuICAgICAga2V5VG9GaWVsZFtjaGlsZEZpZWxkLmtleV0gPSBjaGlsZEZpZWxkO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXMuc3RhdGUua2V5T3JkZXIubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHJldHVybiBrZXlUb0ZpZWxkW2tleV07XG4gICAgfSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgdmFyIGZpZWxkcyA9IHRoaXMuZ2V0RmllbGRzKCk7XG5cbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywge1xuICAgICAgZmllbGQ6IGZpZWxkLCBwbGFpbjogdGhpcy5wcm9wcy5wbGFpblxuICAgIH0sXG4gICAgICBSLmRpdih7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpfSxcbiAgICAgICAgY29uZmlnLmNzc1RyYW5zaXRpb25XcmFwcGVyKFxuICAgICAgICAgIGZpZWxkcy5tYXAoZnVuY3Rpb24gKGNoaWxkRmllbGQpIHtcbiAgICAgICAgICAgIHZhciBkaXNwbGF5S2V5ID0gdGhpcy5zdGF0ZS50ZW1wRGlzcGxheUtleXNbdGhpcy5zdGF0ZS5rZXlUb0lkW2NoaWxkRmllbGQua2V5XV07XG4gICAgICAgICAgICBpZiAoXy5pc1VuZGVmaW5lZChkaXNwbGF5S2V5KSkge1xuICAgICAgICAgICAgICBkaXNwbGF5S2V5ID0gY2hpbGRGaWVsZC5rZXk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ29iamVjdC1pdGVtJywge1xuICAgICAgICAgICAgICBrZXk6IHRoaXMuc3RhdGUua2V5VG9JZFtjaGlsZEZpZWxkLmtleV0sXG4gICAgICAgICAgICAgIGZpZWxkOiBjaGlsZEZpZWxkLFxuICAgICAgICAgICAgICBvbk1vdmU6IHRoaXMub25Nb3ZlLFxuICAgICAgICAgICAgICBvblJlbW92ZTogdGhpcy5vblJlbW92ZSxcbiAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsXG4gICAgICAgICAgICAgIG9uQWN0aW9uOiB0aGlzLm9uQnViYmxlQWN0aW9uLFxuICAgICAgICAgICAgICBkaXNwbGF5S2V5OiBkaXNwbGF5S2V5LFxuICAgICAgICAgICAgICBpdGVtS2V5OiBjaGlsZEZpZWxkLmtleVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICApLFxuICAgICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgnb2JqZWN0LWNvbnRyb2wnLCB7ZmllbGQ6IGZpZWxkLCBvbkFwcGVuZDogdGhpcy5vbkFwcGVuZH0pXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG4iLCIvLyAjIHNpbmdsZS1saW5lLXN0cmluZyBjb21wb25lbnRcblxuLypcblJlbmRlciBhIHNpbmdsZSBsaW5lIHRleHQgaW5wdXQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnU2luZ2xlTGluZVN0cmluZycsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywge1xuICAgICAgY29uZmlnOiBjb25maWcsIGZpZWxkOiBmaWVsZCwgcGxhaW46IHRoaXMucHJvcHMucGxhaW5cbiAgICB9LCBSLmlucHV0KHtcbiAgICAgIHR5cGU6ICdwYXNzd29yZCcsXG4gICAgICB2YWx1ZTogdGhpcy5wcm9wcy5maWVsZC52YWx1ZSxcbiAgICAgIGNsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSxcbiAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgb25Gb2N1czogdGhpcy5vbkZvY3VzQWN0aW9uLFxuICAgICAgb25CbHVyOiB0aGlzLm9uQmx1ckFjdGlvblxuICAgIH0pKTtcbiAgfVxufSk7XG4iLCIvLyAjIHByZXR0eSBib29sZWFuIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIHByZXR0eSBib29sZWFuIGNvbXBvbmVudCB3aXRoIG5vbi1uYXRpdmUgZHJvcC1kb3duXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ1ByZXR0eUJvb2xlYW4nLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICBvbkNoYW5nZTogZnVuY3Rpb24gKG5ld1ZhbHVlKSB7XG4gICAgdGhpcy5vbkNoYW5nZVZhbHVlKG5ld1ZhbHVlKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgdmFyIGNob2ljZXMgPSBjb25maWcuZmllbGRCb29sZWFuQ2hvaWNlcyhmaWVsZCk7XG5cbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywge1xuICAgICAgZmllbGQ6IGZpZWxkLCBwbGFpbjogdGhpcy5wcm9wcy5wbGFpblxuICAgIH0sIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdwcmV0dHktc2VsZWN0LXZhbHVlJywge1xuICAgICAgY2hvaWNlczogY2hvaWNlcywgZmllbGQ6IGZpZWxkLCBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSwgb25BY3Rpb246IHRoaXMub25CdWJibGVBY3Rpb25cbiAgICB9KSk7XG4gIH1cbn0pO1xuIiwiLy8gIyBzZWxlY3QgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgc2VsZWN0IGVsZW1lbnQgdG8gZ2l2ZSBhIHVzZXIgY2hvaWNlcyBmb3IgdGhlIHZhbHVlIG9mIGEgZmllbGQuIFJlbmRlcnMgbm9uLW5hdGl2ZVxuc2VsZWN0IGRyb3AgZG93biBhbmQgc3VwcG9ydHMgZmFuY2llciByZW5kZXJpbmdzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdQcmV0dHlTZWxlY3QnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY2hvaWNlczogdGhpcy5wcm9wcy5jb25maWcuZmllbGRQcmV0dHlDaG9pY2VzKHRoaXMucHJvcHMuZmllbGQpXG4gICAgfTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV3UHJvcHMpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGNob2ljZXM6IG5ld1Byb3BzLmNvbmZpZy5maWVsZFByZXR0eUNob2ljZXMobmV3UHJvcHMuZmllbGQpXG4gICAgfSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHtcbiAgICAgIGNvbmZpZzogY29uZmlnLCBmaWVsZDogZmllbGQsIHBsYWluOiB0aGlzLnByb3BzLnBsYWluLCBjbGFzc2VzOiB0aGlzLnByb3BzLmNsYXNzZXNcbiAgICB9LCBjb25maWcuY3JlYXRlRWxlbWVudCgncHJldHR5LXNlbGVjdC12YWx1ZScsIHtcbiAgICAgIGNob2ljZXM6IHRoaXMuc3RhdGUuY2hvaWNlcywgZmllbGQ6IGZpZWxkLCBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZVZhbHVlLCBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvblxuICAgIH0pKTtcbiAgfVxufSk7XG4iLCIndXNlIHN0cmljdCc7XG4vKmVzbGludCBuby1zY3JpcHQtdXJsOjAgKi9cblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgXyA9IHJlcXVpcmUoJy4uLy4uL3VuZGFzaCcpO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG4vKlxuICAgV3JhcHMgYSBQcmV0dHlUZXh0SGVscGVyIHRvIGJlIGEgc3RhbmQgYWxvbmUgZmllbGQuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnUHJldHR5VGV4dCcsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuICAgIHZhciBwcm9wcyA9IHsgZmllbGQ6IGZpZWxkLCBwbGFpbjogdGhpcy5wcm9wcy5wbGFpbiB9O1xuICAgIHZhciB0YWJJbmRleCA9IGZpZWxkLnRhYkluZGV4O1xuXG4gICAgdmFyIGVsZW1lbnQgPSBjb25maWcuY3JlYXRlRWxlbWVudCgncHJldHR5LXRleHQtaGVscGVyJywge1xuICAgICAgY2xhc3NlczogdGhpcy5wcm9wcy5jbGFzc2VzLFxuICAgICAgdGFiSW5kZXg6IHRhYkluZGV4LFxuICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2VWYWx1ZSxcbiAgICAgIG9uRm9jdXM6IHRoaXMub25Gb2N1c0FjdGlvbixcbiAgICAgIG9uQmx1cjogdGhpcy5vbkJsdXJBY3Rpb24sXG4gICAgICBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvbixcbiAgICAgIGZpZWxkOiB0aGlzLnByb3BzLmZpZWxkLFxuICAgICAgdmFsdWU6IHRoaXMucHJvcHMuZmllbGQudmFsdWUsXG4gICAgICBpc0FjY29yZGlvbjogdGhpcy5wcm9wcy5maWVsZC5pc0FjY29yZGlvbixcbiAgICAgIHNlbGVjdGVkQ2hvaWNlczogdGhpcy5wcm9wcy5jb25maWcuZmllbGRTZWxlY3RlZFJlcGxhY2VDaG9pY2VzKHRoaXMucHJvcHMuZmllbGQpLFxuICAgICAgcmVwbGFjZUNob2ljZXM6IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkUmVwbGFjZUNob2ljZXModGhpcy5wcm9wcy5maWVsZCksXG4gICAgICByZWY6ICd0ZXh0Qm94J1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHByb3BzLCBlbGVtZW50KTtcbiAgfVxufSk7XG4iLCIvLyAjIHNlbGVjdCBjb21wb25lbnRcblxuLypcblJlbmRlciBzZWxlY3QgZWxlbWVudCB0byBnaXZlIGEgdXNlciBjaG9pY2VzIGZvciB0aGUgdmFsdWUgb2YgYSBmaWVsZC4gTm90ZVxuaXQgc2hvdWxkIHN1cHBvcnQgdmFsdWVzIG90aGVyIHRoYW4gc3RyaW5ncy4gQ3VycmVudGx5IHRoaXMgaXMgb25seSB0ZXN0ZWQgZm9yXG5ib29sZWFuIHZhbHVlcywgYnV0IGl0IF9zaG91bGRfIHdvcmsgZm9yIG90aGVyIHZhbHVlcy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnU2VsZWN0JyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNob2ljZXM6IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkQ2hvaWNlcyh0aGlzLnByb3BzLmZpZWxkKVxuICAgIH07XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gKG5ld1Byb3BzKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjaG9pY2VzOiBuZXdQcm9wcy5jb25maWcuZmllbGRDaG9pY2VzKG5ld1Byb3BzLmZpZWxkKVxuICAgIH0pO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQnLCB7XG4gICAgICBjb25maWc6IGNvbmZpZywgZmllbGQ6IGZpZWxkLCBwbGFpbjogdGhpcy5wcm9wcy5wbGFpblxuICAgIH0sIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdzZWxlY3QtdmFsdWUnLCB7XG4gICAgICBjaG9pY2VzOiB0aGlzLnN0YXRlLmNob2ljZXMsIGZpZWxkOiBmaWVsZCwgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2VWYWx1ZSwgb25BY3Rpb246IHRoaXMub25CdWJibGVBY3Rpb25cbiAgICB9KSk7XG4gIH1cbn0pO1xuIiwiLy8gIyBzaW5nbGUtbGluZS1zdHJpbmcgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgYSBzaW5nbGUgbGluZSB0ZXh0IGlucHV0LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ1NpbmdsZUxpbmVTdHJpbmcnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICBvbkNoYW5nZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdGhpcy5vbkNoYW5nZVZhbHVlKGV2ZW50LnRhcmdldC52YWx1ZSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHtcbiAgICAgIGNvbmZpZzogY29uZmlnLCBmaWVsZDogZmllbGQsIHBsYWluOiB0aGlzLnByb3BzLnBsYWluXG4gICAgfSwgUi5pbnB1dCh7XG4gICAgICB0eXBlOiAndGV4dCcsXG4gICAgICB2YWx1ZTogdGhpcy5wcm9wcy5maWVsZC52YWx1ZSxcbiAgICAgIGNsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSxcbiAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgb25Gb2N1czogdGhpcy5vbkZvY3VzQWN0aW9uLFxuICAgICAgb25CbHVyOiB0aGlzLm9uQmx1ckFjdGlvblxuICAgIH0pKTtcbiAgfVxufSk7XG4iLCIvLyAjIHN0cmluZyBjb21wb25lbnRcblxuLypcblJlbmRlciBhIGZpZWxkIHRoYXQgY2FuIGVkaXQgYSBzdHJpbmcgdmFsdWUuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnU3RyaW5nJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHRoaXMub25DaGFuZ2VWYWx1ZShldmVudC50YXJnZXQudmFsdWUpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQnLCB7XG4gICAgICBjb25maWc6IGNvbmZpZywgZmllbGQ6IGZpZWxkLCBwbGFpbjogdGhpcy5wcm9wcy5wbGFpblxuICAgIH0sIFIudGV4dGFyZWEoe1xuICAgICAgdmFsdWU6IGZpZWxkLnZhbHVlLFxuICAgICAgY2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpLFxuICAgICAgcm93czogZmllbGQucm93cyB8fCB0aGlzLnByb3BzLnJvd3MsXG4gICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgIG9uRm9jdXM6IHRoaXMub25Gb2N1c0FjdGlvbixcbiAgICAgIG9uQmx1cjogdGhpcy5vbkJsdXJBY3Rpb25cbiAgICB9KSk7XG4gIH1cbn0pO1xuIiwiLy8gIyB1bmtub3duIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIGEgZmllbGQgd2l0aCBhbiB1bmtub3duIHR5cGUuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnVW5rbm93bicsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFIuZGl2KHt9LFxuICAgICAgUi5kaXYoe30sICdDb21wb25lbnQgbm90IGZvdW5kIGZvcjogJyksXG4gICAgICBSLnByZSh7fSwgSlNPTi5zdHJpbmdpZnkodGhpcy5wcm9wcy5maWVsZC5yYXdGaWVsZFRlbXBsYXRlLCBudWxsLCAyKSlcbiAgICApO1xuICB9XG5cbn0pO1xuIiwiLy8gIyBhZGQtaXRlbSBjb21wb25lbnRcblxuLypcblRoZSBhZGQgYnV0dG9uIHRvIGFwcGVuZCBhbiBpdGVtIHRvIGEgZmllbGQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnQWRkSXRlbScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGFiZWw6ICdbYWRkXSdcbiAgICB9O1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFIuc3Bhbih7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpLCBvbkNsaWNrOiB0aGlzLnByb3BzLm9uQ2xpY2t9LCB0aGlzLnByb3BzLmxhYmVsKTtcbiAgfVxufSk7XG4iLCIvLyAjIGFycmF5LWNvbnRyb2wgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgdGhlIGl0ZW0gdHlwZSBjaG9pY2VzIGFuZCB0aGUgYWRkIGJ1dHRvbiBmb3IgYW4gYXJyYXkuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnQXJyYXlDb250cm9sJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBmaWVsZFRlbXBsYXRlSW5kZXg6IDBcbiAgICB9O1xuICB9LFxuXG4gIG9uU2VsZWN0OiBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGZpZWxkVGVtcGxhdGVJbmRleDogaW5kZXhcbiAgICB9KTtcbiAgfSxcblxuICBvbkFwcGVuZDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucHJvcHMub25BcHBlbmQodGhpcy5zdGF0ZS5maWVsZFRlbXBsYXRlSW5kZXgpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG5cbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuICAgIHZhciBmaWVsZFRlbXBsYXRlcyA9IGNvbmZpZy5maWVsZEl0ZW1GaWVsZFRlbXBsYXRlcyhmaWVsZCk7XG5cbiAgICB2YXIgdHlwZUNob2ljZXMgPSBudWxsO1xuXG4gICAgaWYgKGZpZWxkVGVtcGxhdGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHR5cGVDaG9pY2VzID0gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkLXRlbXBsYXRlLWNob2ljZXMnLCB7XG4gICAgICAgIGZpZWxkOiBmaWVsZCwgZmllbGRUZW1wbGF0ZUluZGV4OiB0aGlzLnN0YXRlLmZpZWxkVGVtcGxhdGVJbmRleCwgb25TZWxlY3Q6IHRoaXMub25TZWxlY3RcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpfSxcbiAgICAgIHR5cGVDaG9pY2VzLCAnICcsXG4gICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgnYWRkLWl0ZW0nLCB7ZmllbGQ6IGZpZWxkLCBvbkNsaWNrOiB0aGlzLm9uQXBwZW5kfSlcbiAgICApO1xuICB9XG59KTtcbiIsIi8vICMgYXJyYXktaXRlbS1jb250cm9sIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIHRoZSByZW1vdmUgYW5kIG1vdmUgYnV0dG9ucyBmb3IgYW4gYXJyYXkgZmllbGQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdBcnJheUl0ZW1Db250cm9sJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIG9uTW92ZUJhY2s6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnByb3BzLm9uTW92ZSh0aGlzLnByb3BzLmluZGV4LCB0aGlzLnByb3BzLmluZGV4IC0gMSk7XG4gIH0sXG5cbiAgb25Nb3ZlRm9yd2FyZDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucHJvcHMub25Nb3ZlKHRoaXMucHJvcHMuaW5kZXgsIHRoaXMucHJvcHMuaW5kZXggKyAxKTtcbiAgfSxcblxuICBvblJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucHJvcHMub25SZW1vdmUodGhpcy5wcm9wcy5pbmRleCk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpfSxcbiAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdyZW1vdmUtaXRlbScsIHtmaWVsZDogZmllbGQsIG9uQ2xpY2s6IHRoaXMub25SZW1vdmUsIG9uTWF5YmVSZW1vdmU6IHRoaXMucHJvcHMub25NYXliZVJlbW92ZX0pLFxuICAgICAgdGhpcy5wcm9wcy5pbmRleCA+IDAgPyBjb25maWcuY3JlYXRlRWxlbWVudCgnbW92ZS1pdGVtLWJhY2snLCB7ZmllbGQ6IGZpZWxkLCBvbkNsaWNrOiB0aGlzLm9uTW92ZUJhY2t9KSA6IG51bGwsXG4gICAgICB0aGlzLnByb3BzLmluZGV4IDwgKHRoaXMucHJvcHMubnVtSXRlbXMgLSAxKSA/IGNvbmZpZy5jcmVhdGVFbGVtZW50KCdtb3ZlLWl0ZW0tZm9yd2FyZCcsIHtmaWVsZDogZmllbGQsIG9uQ2xpY2s6IHRoaXMub25Nb3ZlRm9yd2FyZH0pIDogbnVsbFxuICAgICk7XG4gIH1cbn0pO1xuIiwiLy8gIyBhcnJheS1pdGVtLXZhbHVlIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIHRoZSB2YWx1ZSBvZiBhbiBhcnJheSBpdGVtLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnQXJyYXlJdGVtVmFsdWUnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgb25DaGFuZ2VGaWVsZDogZnVuY3Rpb24gKG5ld1ZhbHVlLCBpbmZvKSB7XG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZSh0aGlzLnByb3BzLmluZGV4LCBuZXdWYWx1ZSwgaW5mbyk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpfSxcbiAgICAgIGNvbmZpZy5jcmVhdGVGaWVsZEVsZW1lbnQoe2ZpZWxkOiBmaWVsZCwgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2VGaWVsZCwgb25BY3Rpb246IHRoaXMub25CdWJibGVBY3Rpb259KVxuICAgICk7XG4gIH1cbn0pO1xuIiwiLy8gIyBhcnJheS1pdGVtIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIGFuIGFycmF5IGl0ZW0uXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcbnZhciBfID0gcmVxdWlyZSgndW5kZXJzY29yZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0FycmF5SXRlbScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaXNNYXliZVJlbW92aW5nOiBmYWxzZVxuICAgIH07XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIG9uTWF5YmVSZW1vdmU6IGZ1bmN0aW9uIChpc01heWJlUmVtb3ZpbmcpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGlzTWF5YmVSZW1vdmluZzogaXNNYXliZVJlbW92aW5nXG4gICAgfSk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgdmFyIGNsYXNzZXMgPSBfLmV4dGVuZCh7fSwgdGhpcy5wcm9wcy5jbGFzc2VzKTtcblxuICAgIGlmICh0aGlzLnN0YXRlLmlzTWF5YmVSZW1vdmluZykge1xuICAgICAgY2xhc3Nlc1snbWF5YmUtcmVtb3ZpbmcnXSA9IHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IGN4KGNsYXNzZXMpfSxcbiAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdhcnJheS1pdGVtLXZhbHVlJywge2ZpZWxkOiBmaWVsZCwgaW5kZXg6IHRoaXMucHJvcHMuaW5kZXgsXG4gICAgICAgIG9uQ2hhbmdlOiB0aGlzLnByb3BzLm9uQ2hhbmdlLCBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvbn0pLFxuICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2FycmF5LWl0ZW0tY29udHJvbCcsIHtmaWVsZDogZmllbGQsIGluZGV4OiB0aGlzLnByb3BzLmluZGV4LCBudW1JdGVtczogdGhpcy5wcm9wcy5udW1JdGVtcyxcbiAgICAgICAgb25Nb3ZlOiB0aGlzLnByb3BzLm9uTW92ZSwgb25SZW1vdmU6IHRoaXMucHJvcHMub25SZW1vdmUsIG9uTWF5YmVSZW1vdmU6IHRoaXMub25NYXliZVJlbW92ZX0pXG4gICAgKTtcbiAgfVxufSk7XG4iLCIvLyAjIENob2ljZVNlY3Rpb25IZWFkZXIgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgc2VjdGlvbiBoZWFkZXIgaW4gY2hvaWNlcyBkcm9wZG93blxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdDaG9pY2VTZWN0aW9uSGVhZGVyJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNob2ljZSA9IHRoaXMucHJvcHMuY2hvaWNlO1xuICAgIHJldHVybiA8c3BhbiBjbGFzc05hbWU9e2N4KHRoaXMucHJvcHMuY2xhc3Nlcyl9PntjaG9pY2UubGFiZWx9PC9zcGFuPjtcbiAgfVxufSk7XG4iLCIvLyAjIENob2ljZXMgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgY3VzdG9taXplZCAobm9uLW5hdGl2ZSkgZHJvcGRvd24gY2hvaWNlcy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBfID0gcmVxdWlyZSgndW5kZXJzY29yZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0Nob2ljZXMnLFxuXG4gIG1peGluczogW1xuICAgIHJlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKSxcbiAgICAvL3BsdWdpbi5yZXF1aXJlKCdtaXhpbi5yZXNpemUnKSxcbiAgICAvL3BsdWdpbi5yZXF1aXJlKCdtaXhpbi5zY3JvbGwnKSxcbiAgICByZXF1aXJlKCcuLi8uLi9taXhpbnMvY2xpY2stb3V0c2lkZScpXG4gIF0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1heEhlaWdodDogbnVsbCxcbiAgICAgIG9wZW46IHRoaXMucHJvcHMub3BlblxuICAgIH07XG4gIH0sXG5cbiAgZ2V0SWdub3JlQ2xvc2VOb2RlczogZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5wcm9wcy5pZ25vcmVDbG9zZU5vZGVzKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIHZhciBub2RlcyA9IHRoaXMucHJvcHMuaWdub3JlQ2xvc2VOb2RlcygpO1xuICAgIGlmICghXy5pc0FycmF5KG5vZGVzKSkge1xuICAgICAgbm9kZXMgPSBbbm9kZXNdO1xuICAgIH1cbiAgICByZXR1cm4gbm9kZXM7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNldE9uQ2xpY2tPdXRzaWRlKCdjaG9pY2VzJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cbiAgICAgIC8vIE1ha2Ugc3VyZSB3ZSBkb24ndCBmaW5kIGFueSBub2RlcyB0byBpZ25vcmUuXG4gICAgICBpZiAoIV8uZmluZCh0aGlzLmdldElnbm9yZUNsb3NlTm9kZXMoKSwgZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNOb2RlSW5zaWRlKGV2ZW50LnRhcmdldCwgbm9kZSk7XG4gICAgICB9LmJpbmQodGhpcykpKSB7XG4gICAgICAgIHRoaXMub25DbG9zZSgpO1xuICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLmFkanVzdFNpemUoKTtcbiAgfSxcblxuICBvblNlbGVjdDogZnVuY3Rpb24gKGNob2ljZSwgZXZlbnQpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtvcGVuU2VjdGlvbjogbnVsbH0pO1xuICAgIHRoaXMucHJvcHMub25TZWxlY3QoY2hvaWNlLnZhbHVlLCBldmVudCk7XG4gIH0sXG5cbiAgb25DaG9pY2VBY3Rpb246IGZ1bmN0aW9uIChjaG9pY2UpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtvcGVuU2VjdGlvbjogbnVsbH0pO1xuICAgIHRoaXMucHJvcHMub25DaG9pY2VBY3Rpb24oY2hvaWNlKTtcbiAgfSxcblxuICBvbkNsb3NlOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7b3BlblNlY3Rpb246IG51bGx9KTtcbiAgICB0aGlzLnByb3BzLm9uQ2xvc2UoKTtcbiAgfSxcblxuICBvblJlc2l6ZVdpbmRvdzogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuYWRqdXN0U2l6ZSgpO1xuICB9LFxuXG4gIG9uU2Nyb2xsV2luZG93OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5hZGp1c3RTaXplKCk7XG4gIH0sXG5cbiAgYWRqdXN0U2l6ZTogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnJlZnMuY2hvaWNlcykge1xuICAgICAgdmFyIG5vZGUgPSB0aGlzLnJlZnMuY2hvaWNlcy5nZXRET01Ob2RlKCk7XG4gICAgICB2YXIgcmVjdCA9IG5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICB2YXIgdG9wID0gcmVjdC50b3A7XG4gICAgICB2YXIgd2luZG93SGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgICAgdmFyIGhlaWdodCA9IHdpbmRvd0hlaWdodCAtIHRvcDtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBtYXhIZWlnaHQ6IGhlaWdodFxuICAgICAgfSk7XG4gICAgfVxuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXh0UHJvcHMpIHtcbiAgICB2YXIgbmV4dFN0YXRlID0ge1xuICAgICAgb3BlbjogbmV4dFByb3BzLm9wZW5cbiAgICB9O1xuXG4gICAgdGhpcy5zZXRTdGF0ZShuZXh0U3RhdGUsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuYWRqdXN0U2l6ZSgpO1xuICAgIH0uYmluZCh0aGlzKSk7XG4gIH0sXG5cbiAgb25TY3JvbGw6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBjb25zb2xlLmxvZygnc3RvcCB0aGF0IScpXG4gICAgLy8gZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAvLyBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgfSxcblxuICBvbldoZWVsOiBmdW5jdGlvbiAoKSB7XG4gICAgLy8gZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAvLyBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgfSxcblxuICBvbkhlYWRlckNsaWNrOiBmdW5jdGlvbiAoY2hvaWNlKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUub3BlblNlY3Rpb24gPT09IGNob2ljZS5zZWN0aW9uS2V5KSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtvcGVuU2VjdGlvbjogbnVsbH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtvcGVuU2VjdGlvbjogY2hvaWNlLnNlY3Rpb25LZXl9LCB0aGlzLmFkanVzdFNpemUpO1xuICAgIH1cbiAgfSxcblxuICBoYXNPbmVTZWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlY3Rpb25IZWFkZXJzID0gdGhpcy5wcm9wcy5jaG9pY2VzLmZpbHRlcihmdW5jdGlvbiAoYykgeyByZXR1cm4gYy5zZWN0aW9uS2V5OyB9KTtcbiAgICByZXR1cm4gc2VjdGlvbkhlYWRlcnMubGVuZ3RoID09PSAxO1xuICB9LFxuXG4gIHZpc2libGVDaG9pY2VzOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNob2ljZXMgPSB0aGlzLnByb3BzLmNob2ljZXM7XG5cbiAgICBpZiAoY2hvaWNlcyAmJiBjaG9pY2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIFt7dmFsdWU6ICcvLy9lbXB0eS8vLyd9XTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLnByb3BzLmlzQWNjb3JkaW9uKSB7XG4gICAgICByZXR1cm4gY2hvaWNlcztcbiAgICB9XG5cbiAgICB2YXIgb3BlblNlY3Rpb24gPSB0aGlzLnN0YXRlLm9wZW5TZWN0aW9uO1xuICAgIHZhciBhbHdheXNFeGFuZGVkID0gdGhpcy5oYXNPbmVTZWN0aW9uKCk7XG4gICAgdmFyIHZpc2libGVDaG9pY2VzID0gW107XG4gICAgdmFyIGluU2VjdGlvbjtcbiAgICBjaG9pY2VzLmZvckVhY2goZnVuY3Rpb24gKGNob2ljZSkge1xuICAgICAgaWYgKGNob2ljZS5zZWN0aW9uS2V5KSB7XG4gICAgICAgIGluU2VjdGlvbiA9IGNob2ljZS5zZWN0aW9uS2V5ID09PSBvcGVuU2VjdGlvbjtcbiAgICAgIH1cbiAgICAgIGlmIChhbHdheXNFeGFuZGVkIHx8IGNob2ljZS5zZWN0aW9uS2V5IHx8IGluU2VjdGlvbikge1xuICAgICAgICB2aXNpYmxlQ2hvaWNlcy5wdXNoKGNob2ljZSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHZpc2libGVDaG9pY2VzO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuXG4gICAgdmFyIGNob2ljZXMgPSB0aGlzLnZpc2libGVDaG9pY2VzKCk7XG5cbiAgICBpZiAodGhpcy5wcm9wcy5vcGVuKSB7XG4gICAgICByZXR1cm4gUi5kaXYoe3JlZjogJ2NvbnRhaW5lcicsIG9uV2hlZWw6IHRoaXMub25XaGVlbCwgb25TY3JvbGw6IHRoaXMub25TY3JvbGwsXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ2Nob2ljZXMtY29udGFpbmVyJywgc3R5bGU6IHtcbiAgICAgICAgdXNlclNlbGVjdDogJ25vbmUnLCBXZWJraXRVc2VyU2VsZWN0OiAnbm9uZScsIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICBtYXhIZWlnaHQ6IHRoaXMuc3RhdGUubWF4SGVpZ2h0ID8gdGhpcy5zdGF0ZS5tYXhIZWlnaHQgOiBudWxsXG4gICAgICB9fSxcbiAgICAgICAgY29uZmlnLmNzc1RyYW5zaXRpb25XcmFwcGVyKFxuICAgICAgICAgIFIudWwoe3JlZjogJ2Nob2ljZXMnLCBjbGFzc05hbWU6ICdjaG9pY2VzJ30sXG4gICAgICAgICAgICBjaG9pY2VzLm1hcChmdW5jdGlvbiAoY2hvaWNlLCBpKSB7XG5cbiAgICAgICAgICAgICAgdmFyIGNob2ljZUVsZW1lbnQgPSBudWxsO1xuXG4gICAgICAgICAgICAgIGlmIChjaG9pY2UudmFsdWUgPT09ICcvLy9sb2FkaW5nLy8vJykge1xuICAgICAgICAgICAgICAgIGNob2ljZUVsZW1lbnQgPSBSLmEoe2hyZWY6ICdKYXZhU2NyaXB0JyArICc6Jywgb25DbGljazogdGhpcy5vbkNsb3NlfSxcbiAgICAgICAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAnY2hvaWNlLWxhYmVsJ30sXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdsb2FkaW5nLWNob2ljZScsIHtmaWVsZDogdGhpcy5wcm9wcy5maWVsZH0pXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaG9pY2UudmFsdWUgPT09ICcvLy9lbXB0eS8vLycpIHtcbiAgICAgICAgICAgICAgICBjaG9pY2VFbGVtZW50ID0gUi5hKHtocmVmOiAnSmF2YVNjcmlwdCcgKyAnOicsIG9uQ2xpY2s6IHRoaXMub25DbG9zZX0sXG4gICAgICAgICAgICAgICAgICBSLnNwYW4oe2NsYXNzTmFtZTogJ2Nob2ljZS1sYWJlbCd9LFxuICAgICAgICAgICAgICAgICAgICAnTm8gY2hvaWNlcyBhdmFpbGFibGUuJ1xuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hvaWNlLmFjdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciBsYWJlbENsYXNzZXMgPSAnY2hvaWNlLWxhYmVsICcgKyBjaG9pY2UuYWN0aW9uO1xuXG4gICAgICAgICAgICAgICAgY2hvaWNlRWxlbWVudCA9IFIuYSh7aHJlZjogJ0phdmFTY3JpcHQnICsgJzonLCBvbkNsaWNrOiB0aGlzLm9uQ2hvaWNlQWN0aW9uLmJpbmQodGhpcywgY2hvaWNlKX0sXG4gICAgICAgICAgICAgICAgICBSLnNwYW4oe2NsYXNzTmFtZTogbGFiZWxDbGFzc2VzfSxcbiAgICAgICAgICAgICAgICAgICAgY2hvaWNlLmxhYmVsIHx8IHRoaXMucHJvcHMuY29uZmlnLmFjdGlvbkNob2ljZUxhYmVsKGNob2ljZS5hY3Rpb24pXG4gICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5jb25maWcuY3JlYXRlRWxlbWVudCgnY2hvaWNlLWFjdGlvbi1zYW1wbGUnLCB7YWN0aW9uOiBjaG9pY2UuYWN0aW9uLCBjaG9pY2U6IGNob2ljZX0pXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaG9pY2Uuc2VjdGlvbktleSkge1xuICAgICAgICAgICAgICAgIGNob2ljZUVsZW1lbnQgPSBSLmEoe2hyZWY6ICdKYXZhU2NyaXB0JyArICc6Jywgb25DbGljazogdGhpcy5vbkhlYWRlckNsaWNrLmJpbmQodGhpcywgY2hvaWNlKX0sXG4gICAgICAgICAgICAgICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgnY2hvaWNlLXNlY3Rpb24taGVhZGVyJywge2Nob2ljZTogY2hvaWNlfSlcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNob2ljZUVsZW1lbnQgPSBSLmEoe2hyZWY6ICdKYXZhU2NyaXB0JyArICc6Jywgb25DbGljazogdGhpcy5vblNlbGVjdC5iaW5kKHRoaXMsIGNob2ljZSl9LFxuICAgICAgICAgICAgICAgICAgUi5zcGFuKHtjbGFzc05hbWU6ICdjaG9pY2UtbGFiZWwnfSxcbiAgICAgICAgICAgICAgICAgICAgY2hvaWNlLmxhYmVsXG4gICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgUi5zcGFuKHtjbGFzc05hbWU6ICdjaG9pY2Utc2FtcGxlJ30sXG4gICAgICAgICAgICAgICAgICAgIGNob2ljZS5zYW1wbGVcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgcmV0dXJuIFIubGkoe2tleTogaSwgY2xhc3NOYW1lOiAnY2hvaWNlJ30sXG4gICAgICAgICAgICAgICAgY2hvaWNlRWxlbWVudFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBub3Qgb3BlblxuICAgIHJldHVybiBudWxsO1xuICB9XG59KTtcbiIsIi8vICMgZmllbGQtdGVtcGxhdGUtY2hvaWNlcyBjb21wb25lbnRcblxuLypcbkdpdmUgYSBsaXN0IG9mIGNob2ljZXMgb2YgaXRlbSB0eXBlcyB0byBjcmVhdGUgYXMgY2hpbGRyZW4gb2YgYW4gZmllbGQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnRmllbGRUZW1wbGF0ZUNob2ljZXMnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHRoaXMucHJvcHMub25TZWxlY3QocGFyc2VJbnQoZXZlbnQudGFyZ2V0LnZhbHVlKSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgdmFyIGZpZWxkVGVtcGxhdGVzID0gY29uZmlnLmZpZWxkSXRlbUZpZWxkVGVtcGxhdGVzKGZpZWxkKTtcblxuICAgIHZhciB0eXBlQ2hvaWNlcyA9IG51bGw7XG4gICAgaWYgKGZpZWxkVGVtcGxhdGVzLmxlbmd0aCA+IDEpIHtcbiAgICAgIHR5cGVDaG9pY2VzID0gUi5zZWxlY3Qoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSwgdmFsdWU6IHRoaXMuZmllbGRUZW1wbGF0ZUluZGV4LCBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZX0sXG4gICAgICBmaWVsZFRlbXBsYXRlcy5tYXAoZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUsIGkpIHtcbiAgICAgICAgcmV0dXJuIFIub3B0aW9uKHtrZXk6IGksIHZhbHVlOiBpfSwgZmllbGRUZW1wbGF0ZS5sYWJlbCB8fCBpKTtcbiAgICAgIH0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHlwZUNob2ljZXMgPyB0eXBlQ2hvaWNlcyA6IFIuc3BhbihudWxsKTtcbiAgfVxufSk7XG4iLCIvLyAjIGZpZWxkIGNvbXBvbmVudFxuXG4vKlxuVXNlZCBieSBhbnkgZmllbGRzIHRvIHB1dCB0aGUgbGFiZWwgYW5kIGhlbHAgdGV4dCBhcm91bmQgdGhlIGZpZWxkLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIF8gPSByZXF1aXJlKCcuLi8uLi91bmRhc2gnKTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdGaWVsZCcsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29sbGFwc2VkOiB0aGlzLnByb3BzLmNvbmZpZy5maWVsZElzQ29sbGFwc2VkKHRoaXMucHJvcHMuZmllbGQpID8gdHJ1ZSA6IGZhbHNlXG4gICAgfTtcbiAgfSxcblxuICBvbkNsaWNrTGFiZWw6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGNvbGxhcHNlZDogIXRoaXMuc3RhdGUuY29sbGFwc2VkXG4gICAgfSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblxuICAgIGlmICh0aGlzLnByb3BzLnBsYWluKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wcy5jaGlsZHJlbjtcbiAgICB9XG5cbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgdmFyIGluZGV4ID0gdGhpcy5wcm9wcy5pbmRleDtcbiAgICBpZiAoIV8uaXNOdW1iZXIoaW5kZXgpKSB7XG4gICAgICB2YXIga2V5ID0gdGhpcy5wcm9wcy5maWVsZC5rZXk7XG4gICAgICBpbmRleCA9IF8uaXNOdW1iZXIoa2V5KSA/IGtleSA6IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICB2YXIgY2xhc3NlcyA9IF8uZXh0ZW5kKHt9LCB0aGlzLnByb3BzLmNsYXNzZXMpO1xuXG4gICAgdmFyIGVycm9ycyA9IGNvbmZpZy5maWVsZEVycm9ycyhmaWVsZCk7XG5cbiAgICBlcnJvcnMuZm9yRWFjaChmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgIGNsYXNzZXNbJ3ZhbGlkYXRpb24tZXJyb3ItJyArIGVycm9yLnR5cGVdID0gdHJ1ZTtcbiAgICB9KTtcblxuICAgIGlmIChjb25maWcuZmllbGRJc1JlcXVpcmVkKGZpZWxkKSkge1xuICAgICAgY2xhc3Nlcy5yZXF1aXJlZCA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNsYXNzZXMub3B0aW9uYWwgPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiBjeChjbGFzc2VzKSwgc3R5bGU6IHtkaXNwbGF5OiAoZmllbGQuaGlkZGVuID8gJ25vbmUnIDogJycpfX0sXG4gICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgnbGFiZWwnLCB7XG4gICAgICAgIGNvbmZpZzogY29uZmlnLCBmaWVsZDogZmllbGQsXG4gICAgICAgIGluZGV4OiBpbmRleCwgb25DbGljazogY29uZmlnLmZpZWxkSXNDb2xsYXBzaWJsZShmaWVsZCkgPyB0aGlzLm9uQ2xpY2tMYWJlbCA6IG51bGxcbiAgICAgIH0pLFxuICAgICAgY29uZmlnLmNzc1RyYW5zaXRpb25XcmFwcGVyKFxuICAgICAgICB0aGlzLnN0YXRlLmNvbGxhcHNlZCA/IFtdIDogW1xuICAgICAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdoZWxwJywge1xuICAgICAgICAgICAgY29uZmlnOiBjb25maWcsIGZpZWxkOiBmaWVsZCxcbiAgICAgICAgICAgIGtleTogJ2hlbHAnXG4gICAgICAgICAgfSksXG4gICAgICAgICAgdGhpcy5wcm9wcy5jaGlsZHJlblxuICAgICAgICBdXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG4iLCIvLyAjIGhlbHAgY29tcG9uZW50XG5cbi8qXG5KdXN0IHRoZSBoZWxwIHRleHQgYmxvY2suXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnSGVscCcsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGhlbHBUZXh0ID0gdGhpcy5wcm9wcy5jb25maWcuZmllbGRIZWxwVGV4dCh0aGlzLnByb3BzLmZpZWxkKTtcblxuICAgIHJldHVybiBoZWxwVGV4dCA/XG4gICAgICBSLmRpdih7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpLCBkYW5nZXJvdXNseVNldElubmVySFRNTDoge19faHRtbDogaGVscFRleHR9fSkgOlxuICAgICAgUi5zcGFuKG51bGwpO1xuICB9XG59KTtcbiIsIi8vICMgYnV0dG9uIGNvbXBvbmVudFxuXG4vKlxuICBDbGlja2FibGUgJ2J1dHRvbidcbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnSW5zZXJ0QnV0dG9uJyxcblxuICBwcm9wVHlwZXM6IHtcbiAgICBvbkNsaWNrOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIHJlZjogUmVhY3QuUHJvcFR5cGVzLnN0cmluZ1xuICB9LFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGEgcmVmPXt0aGlzLnByb3BzLnJlZn0gaHJlZj17J0phdmFTY3JpcHQnICsgJzonfSBvbkNsaWNrPXt0aGlzLnByb3BzLm9uQ2xpY2t9PlxuICAgICAgICB7dGhpcy5wcm9wcy5jaGlsZHJlbn1cbiAgICAgIDwvYT5cbiAgICApO1xuICB9XG5cbn0pO1xuIiwiLy8gIyBsYWJlbCBjb21wb25lbnRcblxuLypcbkp1c3QgdGhlIGxhYmVsIGZvciBhIGZpZWxkLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0xhYmVsJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICB2YXIgZmllbGRMYWJlbCA9IGNvbmZpZy5maWVsZExhYmVsKGZpZWxkKTtcblxuICAgIHZhciBsYWJlbCA9IG51bGw7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnByb3BzLmluZGV4ID09PSAnbnVtYmVyJykge1xuICAgICAgbGFiZWwgPSAnJyArICh0aGlzLnByb3BzLmluZGV4ICsgMSkgKyAnLic7XG4gICAgICBpZiAoZmllbGRMYWJlbCkge1xuICAgICAgICBsYWJlbCA9IGxhYmVsICsgJyAnICsgZmllbGRMYWJlbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZmllbGRMYWJlbCB8fCBsYWJlbCkge1xuICAgICAgdmFyIHRleHQgPSBsYWJlbCB8fCBmaWVsZExhYmVsO1xuICAgICAgaWYgKHRoaXMucHJvcHMub25DbGljaykge1xuICAgICAgICB0ZXh0ID0gUi5hKHtocmVmOiAnSmF2YVNjcmlwdCcgKyAnOicsIG9uQ2xpY2s6IHRoaXMucHJvcHMub25DbGlja30sIHRleHQpO1xuICAgICAgfVxuICAgICAgbGFiZWwgPSBSLmxhYmVsKHt9LCB0ZXh0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gUi5kaXYoe1xuICAgICAgY2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpXG4gICAgfSxcbiAgICAgIGxhYmVsLFxuICAgICAgJyAnLFxuICAgICAgUi5zcGFuKHtjbGFzc05hbWU6IGNvbmZpZy5maWVsZElzUmVxdWlyZWQoZmllbGQpID8gJ3JlcXVpcmVkLXRleHQnIDogJ25vdC1yZXF1aXJlZC10ZXh0J30pXG4gICAgKTtcbiAgfVxufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0xvYWRpbmdDaG9pY2UnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPHNwYW4+TG9hZGluZyBjaG9pY2VzLi4uPC9zcGFuPlxuICAgICk7XG4gIH1cblxufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0xvYWRpbmdDaG9pY2VzJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+TG9hZGluZyBjaG9pY2VzLi4uPC9kaXY+XG4gICAgKTtcbiAgfVxuXG59KTtcbiIsIi8vICMgbW92ZS1pdGVtLWJhY2sgY29tcG9uZW50XG5cbi8qXG5CdXR0b24gdG8gbW92ZSBhbiBpdGVtIGJhY2t3YXJkcyBpbiBsaXN0LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ01vdmVJdGVtQmFjaycsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGFiZWw6ICdbdXBdJ1xuICAgIH07XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUi5zcGFuKHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcyksIG9uQ2xpY2s6IHRoaXMucHJvcHMub25DbGlja30sIHRoaXMucHJvcHMubGFiZWwpO1xuICB9XG59KTtcbiIsIi8vICMgbW92ZS1pdGVtLWZvcndhcmQgY29tcG9uZW50XG5cbi8qXG5CdXR0b24gdG8gbW92ZSBhbiBpdGVtIGZvcndhcmQgaW4gYSBsaXN0LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ01vdmVJdGVtRm9yd2FyZCcsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGFiZWw6ICdbZG93bl0nXG4gICAgfTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSLnNwYW4oe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSwgb25DbGljazogdGhpcy5wcm9wcy5vbkNsaWNrfSwgdGhpcy5wcm9wcy5sYWJlbCk7XG4gIH1cbn0pO1xuIiwiLy8gIyBvYmplY3QtY29udHJvbCBjb21wb25lbnRcblxuLypcblJlbmRlciB0aGUgaXRlbSB0eXBlIGNob2ljZXMgYW5kIHRoZSBhZGQgYnV0dG9uLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ09iamVjdENvbnRyb2wnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZpZWxkVGVtcGxhdGVJbmRleDogMFxuICAgIH07XG4gIH0sXG5cbiAgb25TZWxlY3Q6IGZ1bmN0aW9uIChpbmRleCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZmllbGRUZW1wbGF0ZUluZGV4OiBpbmRleFxuICAgIH0pO1xuICB9LFxuXG4gIG9uQXBwZW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5wcm9wcy5vbkFwcGVuZCh0aGlzLnN0YXRlLmZpZWxkVGVtcGxhdGVJbmRleCk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcbiAgICB2YXIgZmllbGRUZW1wbGF0ZXMgPSBjb25maWcuZmllbGRDaGlsZEZpZWxkVGVtcGxhdGVzKGZpZWxkKTtcblxuICAgIHZhciB0eXBlQ2hvaWNlcyA9IG51bGw7XG5cbiAgICBpZiAoZmllbGRUZW1wbGF0ZXMubGVuZ3RoID4gMCkge1xuICAgICAgdHlwZUNob2ljZXMgPSBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQtdGVtcGxhdGUtY2hvaWNlcycsIHtcbiAgICAgICAgZmllbGQ6IGZpZWxkLFxuICAgICAgICBmaWVsZFRlbXBsYXRlSW5kZXg6IHRoaXMuc3RhdGUuZmllbGRUZW1wbGF0ZUluZGV4LCBvblNlbGVjdDogdGhpcy5vblNlbGVjdFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3Nlcyl9LFxuICAgICAgdHlwZUNob2ljZXMsICcgJyxcbiAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdhZGQtaXRlbScsIHtvbkNsaWNrOiB0aGlzLm9uQXBwZW5kfSlcbiAgICApO1xuICB9XG59KTtcbiIsIi8vICMgb2JqZWN0LWl0ZW0tY29udHJvbCBjb21wb25lbnRcblxuLypcblJlbmRlciB0aGUgcmVtb3ZlIGJ1dHRvbnMgZm9yIGFuIG9iamVjdCBpdGVtLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnT2JqZWN0SXRlbUNvbnRyb2wnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgb25SZW1vdmU6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnByb3BzLm9uUmVtb3ZlKHRoaXMucHJvcHMuaXRlbUtleSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpfSxcbiAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdyZW1vdmUtaXRlbScsIHtmaWVsZDogZmllbGQsIG9uQ2xpY2s6IHRoaXMub25SZW1vdmV9KVxuICAgICk7XG4gIH1cbn0pO1xuIiwiLy8gIyBvYmplY3QtaXRlbS1rZXkgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgYW4gb2JqZWN0IGl0ZW0ga2V5IGVkaXRvci5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ09iamVjdEl0ZW1LZXknLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSLmlucHV0KHtcbiAgICAgIGNsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSxcbiAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgIHZhbHVlOiB0aGlzLnByb3BzLmRpc3BsYXlLZXksXG4gICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgIG9uRm9jdXM6IHRoaXMub25Gb2N1c0FjdGlvbixcbiAgICAgIG9uQmx1cjogdGhpcy5vbkJsdXJBY3Rpb25cbiAgICB9KTtcbiAgfVxufSk7XG4iLCIvLyAjIG9iamVjdC1pdGVtLXZhbHVlIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIHRoZSB2YWx1ZSBvZiBhbiBvYmplY3QgaXRlbS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ09iamVjdEl0ZW1WYWx1ZScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBvbkNoYW5nZUZpZWxkOiBmdW5jdGlvbiAobmV3VmFsdWUsIGluZm8pIHtcbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHRoaXMucHJvcHMuaXRlbUtleSwgbmV3VmFsdWUsIGluZm8pO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKX0sXG4gICAgICBjb25maWcuY3JlYXRlRmllbGRFbGVtZW50KHtmaWVsZDogZmllbGQsIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlRmllbGQsIHBsYWluOiB0cnVlLCBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvbn0pXG4gICAgKTtcbiAgfVxufSk7XG4iLCIvLyAjIG9iamVjdC1pdGVtIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIGFuIG9iamVjdCBpdGVtLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnT2JqZWN0SXRlbScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBvbkNoYW5nZUtleTogZnVuY3Rpb24gKG5ld0tleSkge1xuICAgIHRoaXMucHJvcHMub25Nb3ZlKHRoaXMucHJvcHMuaXRlbUtleSwgbmV3S2V5KTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3Nlcyl9LFxuICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ29iamVjdC1pdGVtLWtleScsIHtmaWVsZDogZmllbGQsIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlS2V5LCBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvbiwgZGlzcGxheUtleTogdGhpcy5wcm9wcy5kaXNwbGF5S2V5LCBpdGVtS2V5OiB0aGlzLnByb3BzLml0ZW1LZXl9KSxcbiAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdvYmplY3QtaXRlbS12YWx1ZScsIHtmaWVsZDogZmllbGQsIG9uQ2hhbmdlOiB0aGlzLnByb3BzLm9uQ2hhbmdlLCBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvbiwgaXRlbUtleTogdGhpcy5wcm9wcy5pdGVtS2V5fSksXG4gICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgnb2JqZWN0LWl0ZW0tY29udHJvbCcsIHtmaWVsZDogZmllbGQsIG9uUmVtb3ZlOiB0aGlzLnByb3BzLm9uUmVtb3ZlLCBpdGVtS2V5OiB0aGlzLnByb3BzLml0ZW1LZXl9KVxuICAgICk7XG4gIH1cbn0pO1xuIiwiLy8gIyBwcmV0dHktc2VsZWN0LWlucHV0IGNvbXBvbmVudFxuXG4vKlxuICAgUmVuZGVyIGFuIGlucHV0IHRvIGJlIHVzZWQgYXMgdGhlIGVsZW1lbnQgZm9yIHR5cGluZyBhIGN1c3RvbSB2YWx1ZSBpbnRvIGEgcHJldHR5IHNlbGVjdC5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIF8gPSByZXF1aXJlKCd1bmRlcnNjb3JlJyk7XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnUHJldHR5U2VsZWN0SW5wdXQnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIGZvY3VzOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5yZWZzLnRleHRCb3guZm9jdXMoKTtcbiAgfSxcblxuICBzZXRDaG9pY2VzT3BlbjogZnVuY3Rpb24gKGlzT3BlbkNob2ljZXMpIHtcbiAgICB0aGlzLnJlZnMudGV4dEJveC5zZXRDaG9pY2VzT3Blbihpc09wZW5DaG9pY2VzKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMuY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ3ByZXR0eS10ZXh0LWhlbHBlcicsIHtcbiAgICAgIGNsYXNzZXM6IHRoaXMucHJvcHMuY2xhc3NlcyxcbiAgICAgIHRhYkluZGV4OiB0aGlzLnByb3BzLmZpZWxkLnRhYkluZGV4LFxuICAgICAgb25DaGFuZ2U6IHRoaXMucHJvcHMub25DaGFuZ2UsXG4gICAgICBvbkZvY3VzOiB0aGlzLnByb3BzLm9uRm9jdXMsXG4gICAgICBvbkJsdXI6IHRoaXMucHJvcHMub25CbHVyLFxuICAgICAgb25BY3Rpb246IHRoaXMub25CdWJibGVBY3Rpb24sXG4gICAgICBmaWVsZDogdGhpcy5wcm9wcy5maWVsZCxcbiAgICAgIHZhbHVlOiB0aGlzLnByb3BzLmlzRW50ZXJpbmdDdXN0b21WYWx1ZSA/IHRoaXMucHJvcHMuZmllbGQudmFsdWUgOiB0aGlzLnByb3BzLmdldERpc3BsYXlWYWx1ZSgpLFxuICAgICAgc2VsZWN0ZWRDaG9pY2VzOiB0aGlzLnByb3BzLmNvbmZpZy5maWVsZFNlbGVjdGVkUmVwbGFjZUNob2ljZXModGhpcy5wcm9wcy5maWVsZCksXG4gICAgICByZXBsYWNlQ2hvaWNlczogdGhpcy5wcm9wcy5jb25maWcuZmllbGRSZXBsYWNlQ2hvaWNlcyh0aGlzLnByb3BzLmZpZWxkKSxcbiAgICAgIG9uVGFnQ2xpY2s6IHRoaXMub25UYWdDbGljayxcbiAgICAgIHJlZjogJ3RleHRCb3gnLFxuICAgICAgcmVhZE9ubHk6ICF0aGlzLnByb3BzLmlzRW50ZXJpbmdDdXN0b21WYWx1ZVxuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMucHJvcHMuaXNFbnRlcmluZ0N1c3RvbVZhbHVlKSB7XG4gICAgICByZXR1cm4gPGlucHV0IGNsYXNzTmFtZT17Y3goXy5leHRlbmQoe30sIHRoaXMucHJvcHMuY2xhc3NlcykpfSB0eXBlPVwidGV4dFwiIHZhbHVlPXt0aGlzLnByb3BzLmZpZWxkLnZhbHVlfVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5wcm9wcy5vbkNoYW5nZX0gb25Gb2N1cz17dGhpcy5wcm9wcy5vbkZvY3VzfSBvbkJsdXI9e3RoaXMucHJvcHMub25CbHVyfSAvPjtcbiAgICB9XG5cbiAgICByZXR1cm4gPGlucHV0IHR5cGU9XCJ0ZXh0XCIgdmFsdWU9e3RoaXMucHJvcHMuZ2V0RGlzcGxheVZhbHVlKCl9IHJlYWRPbmx5IG9uRm9jdXM9e3RoaXMucHJvcHMub25Gb2N1c30gb25CbHVyPXt0aGlzLnByb3BzLm9uQmx1cn0gLz47XG4gIH0sXG5cbn0pO1xuIiwiLy8gIyBwcmV0dHktc2VsZWN0LXZhbHVlIGNvbXBvbmVudFxuXG4vKlxuICAgUmVuZGVyIGEgc2VsZWN0IGRyb3Bkb3duIGZvciBhIGxpc3Qgb2YgY2hvaWNlcy4gQ2hvaWNlcyB2YWx1ZXMgY2FuIGJlIG9mIGFueVxuICAgdHlwZS4gRG9lcyBub3QgdXNlIG5hdGl2ZSBzZWxlY3QgZHJvcGRvd24uIENob2ljZXMgY2FuIG9wdGlvbmFsbHkgaW5jbHVkZVxuICAgJ3NhbXBsZScgcHJvcGVydHkgZGlzcGxheWVkIGdyYXllZCBvdXQuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBfID0gcmVxdWlyZSgndW5kZXJzY29yZScpO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ1NlbGVjdFZhbHVlJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB2YXIgY2hvaWNlVmFsdWUgPSBldmVudC50YXJnZXQudmFsdWU7XG4gICAgdmFyIGNob2ljZVR5cGUgPSBjaG9pY2VWYWx1ZS5zdWJzdHJpbmcoMCwgY2hvaWNlVmFsdWUuaW5kZXhPZignOicpKTtcbiAgICBpZiAoY2hvaWNlVHlwZSA9PT0gJ2Nob2ljZScpIHtcbiAgICAgIHZhciBjaG9pY2VJbmRleCA9IGNob2ljZVZhbHVlLnN1YnN0cmluZyhjaG9pY2VWYWx1ZS5pbmRleE9mKCc6JykgKyAxKTtcbiAgICAgIGNob2ljZUluZGV4ID0gcGFyc2VJbnQoY2hvaWNlSW5kZXgpO1xuICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZSh0aGlzLnByb3BzLmNob2ljZXNbY2hvaWNlSW5kZXhdLnZhbHVlKTtcbiAgICB9XG4gIH0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNob2ljZXM6IFtdXG4gICAgfTtcbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBkZWZhdWx0VmFsdWUgPSB0aGlzLnByb3BzLmZpZWxkLnZhbHVlICE9PSB1bmRlZmluZWQgPyB0aGlzLnByb3BzLmZpZWxkLnZhbHVlIDogJyc7XG5cbiAgICByZXR1cm4ge1xuICAgICAgaXNDaG9pY2VzT3BlbjogdGhpcy5wcm9wcy5pc0Nob2ljZXNPcGVuLFxuICAgICAgdmFsdWU6IGRlZmF1bHRWYWx1ZSxcbiAgICAgIGlzRW50ZXJpbmdDdXN0b21WYWx1ZTogZmFsc2VcbiAgICB9O1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNob2ljZXMgPSB0aGlzLnByb3BzLmNvbmZpZy5ub3JtYWxpemVQcmV0dHlDaG9pY2VzKHRoaXMucHJvcHMuY2hvaWNlcyk7XG4gICAgdmFyIGNob2ljZXNPckxvYWRpbmc7XG5cbiAgICBpZiAoKGNob2ljZXMubGVuZ3RoID4gMSAmJiBjaG9pY2VzWzBdLnZhbHVlID09PSAnLy8vbG9hZGluZy8vLycpIHx8IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkSXNMb2FkaW5nKHRoaXMucHJvcHMuZmllbGQpKSB7XG4gICAgICBjaG9pY2VzID0gW3t2YWx1ZTogJy8vL2xvYWRpbmcvLy8nfV07XG4gICAgfVxuICAgIHZhciBjaG9pY2VzRWxlbSA9IHRoaXMucHJvcHMuY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2Nob2ljZXMnLCB7XG4gICAgICByZWY6ICdjaG9pY2VzJyxcbiAgICAgIGNob2ljZXM6IGNob2ljZXMsXG4gICAgICBvcGVuOiB0aGlzLnN0YXRlLmlzQ2hvaWNlc09wZW4sXG4gICAgICBpZ25vcmVDbG9zZU5vZGVzOiB0aGlzLmdldENsb3NlSWdub3JlTm9kZXMsXG4gICAgICBvblNlbGVjdDogdGhpcy5vblNlbGVjdENob2ljZSxcbiAgICAgIG9uQ2xvc2U6IHRoaXMub25DbG9zZUNob2ljZXMsXG4gICAgICBvbkNob2ljZUFjdGlvbjogdGhpcy5vbkNob2ljZUFjdGlvbixcbiAgICAgIGZpZWxkOiB0aGlzLnByb3BzLmZpZWxkXG4gICAgfSk7XG5cbiAgICB2YXIgaW5wdXRFbGVtID0gdGhpcy5nZXRJbnB1dEVsZW1lbnQoKTtcblxuICAgIGNob2ljZXNPckxvYWRpbmcgPSAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT17Y3goXy5leHRlbmQoe30sIHRoaXMucHJvcHMuY2xhc3NlcywgeydjaG9pY2VzLW9wZW4nOiB0aGlzLnN0YXRlLmlzQ2hvaWNlc09wZW59KSl9XG4gICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uQ2hhbmdlfT5cblxuICAgICAgICA8ZGl2IHJlZj1cInRvZ2dsZVwiIG9uQ2xpY2s9e3RoaXMub25Ub2dnbGVDaG9pY2VzfT5cbiAgICAgICAgICB7aW5wdXRFbGVtfVxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInNlbGVjdC1hcnJvd1wiIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICB7Y2hvaWNlc0VsZW19XG4gICAgICA8L2Rpdj5cbiAgICApO1xuXG4gICAgcmV0dXJuIGNob2ljZXNPckxvYWRpbmc7XG4gIH0sXG5cbiAgZ2V0SW5wdXRFbGVtZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMuY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ3ByZXR0eS1zZWxlY3QtaW5wdXQnLCB7XG4gICAgICBmaWVsZDogdGhpcy5wcm9wcy5maWVsZCxcbiAgICAgIHJlZjogJ2N1c3RvbUlucHV0JyxcbiAgICAgIGlzRW50ZXJpbmdDdXN0b21WYWx1ZTogdGhpcy5zdGF0ZS5pc0VudGVyaW5nQ3VzdG9tVmFsdWUsXG4gICAgICBvbkNoYW5nZTogdGhpcy5vbklucHV0Q2hhbmdlLFxuICAgICAgb25Gb2N1czogdGhpcy5vbkZvY3VzQWN0aW9uLFxuICAgICAgb25CbHVyOiB0aGlzLm9uQmx1cixcbiAgICAgIG9uQWN0aW9uOiB0aGlzLm9uQnViYmxlQWN0aW9uLFxuICAgICAgZ2V0RGlzcGxheVZhbHVlOiB0aGlzLmdldERpc3BsYXlWYWx1ZVxuICAgIH0pO1xuICB9LFxuXG4gIGJsdXJMYXRlcjogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIHNlbGYub25CbHVyQWN0aW9uKCk7XG4gICAgfSwgMCk7XG4gIH0sXG5cbiAgb25CbHVyOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLnN0YXRlLmlzQ2hvaWNlc09wZW4pIHtcbiAgICAgIHRoaXMuYmx1ckxhdGVyKCk7XG4gICAgfVxuICB9LFxuXG4gIGdldENsb3NlSWdub3JlTm9kZXM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZWZzLnRvZ2dsZS5nZXRET01Ob2RlKCk7XG4gIH0sXG5cbiAgb25Ub2dnbGVDaG9pY2VzOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zZXRDaG9pY2VzT3BlbighdGhpcy5zdGF0ZS5pc0Nob2ljZXNPcGVuKTtcbiAgfSxcblxuICBzZXRDaG9pY2VzT3BlbjogZnVuY3Rpb24gKGlzT3Blbikge1xuICAgIHZhciBhY3Rpb24gPSBpc09wZW4gPyAnb3Blbi1jaG9pY2VzJyA6ICdjbG9zZS1jaG9pY2VzJztcbiAgICB0aGlzLm9uU3RhcnRBY3Rpb24oYWN0aW9uKTtcbiAgICB0aGlzLnNldFN0YXRlKHsgaXNDaG9pY2VzT3BlbjogaXNPcGVuIH0pO1xuICB9LFxuXG4gIG9uU2VsZWN0Q2hvaWNlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGlzRW50ZXJpbmdDdXN0b21WYWx1ZTogZmFsc2UsXG4gICAgICBpc0Nob2ljZXNPcGVuOiBmYWxzZSxcbiAgICAgIHZhbHVlOiB2YWx1ZVxuICAgIH0pO1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UodmFsdWUpO1xuICAgIHRoaXMuYmx1ckxhdGVyKCk7XG4gIH0sXG5cbiAgb25DbG9zZUNob2ljZXM6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5pc0Nob2ljZXNPcGVuKSB7XG4gICAgICB0aGlzLmJsdXJMYXRlcigpO1xuICAgICAgdGhpcy5zZXRDaG9pY2VzT3BlbihmYWxzZSk7XG4gICAgfVxuICB9LFxuXG4gIGdldERpc3BsYXlWYWx1ZTogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgY3VycmVudFZhbHVlID0gdGhpcy5zdGF0ZS52YWx1ZTtcbiAgICB2YXIgY3VycmVudENob2ljZSA9IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkU2VsZWN0ZWRDaG9pY2UodGhpcy5wcm9wcy5maWVsZCk7XG4gICAgLy8gTWFrZSBzdXJlIHNlbGVjdGVkQ2hvaWNlIGlzIGEgbWF0Y2ggZm9yIGN1cnJlbnQgdmFsdWUuXG4gICAgaWYgKGN1cnJlbnRDaG9pY2UgJiYgY3VycmVudENob2ljZS52YWx1ZSAhPT0gY3VycmVudFZhbHVlKSB7XG4gICAgICBjdXJyZW50Q2hvaWNlID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKCFjdXJyZW50Q2hvaWNlKSB7XG4gICAgICBjdXJyZW50Q2hvaWNlID0gXy5maW5kKHRoaXMucHJvcHMuY2hvaWNlcywgZnVuY3Rpb24gKGNob2ljZSkge1xuICAgICAgICByZXR1cm4gIWNob2ljZS5hY3Rpb24gJiYgY2hvaWNlLnZhbHVlID09PSBjdXJyZW50VmFsdWU7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoY3VycmVudENob2ljZSkge1xuICAgICAgcmV0dXJuIGN1cnJlbnRDaG9pY2UubGFiZWw7XG4gICAgfSBlbHNlIGlmIChjdXJyZW50VmFsdWUpIHsgLy8gY3VzdG9tIHZhbHVlXG4gICAgICByZXR1cm4gY3VycmVudFZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gY29uZmlnLmZpZWxkUGxhY2Vob2xkZXIodGhpcy5wcm9wcy5maWVsZCkgfHwgJyc7XG4gIH0sXG5cbiAgb25DaG9pY2VBY3Rpb246IGZ1bmN0aW9uIChjaG9pY2UpIHtcbiAgICBpZiAoY2hvaWNlLmFjdGlvbiA9PT0gJ2VudGVyLWN1c3RvbS12YWx1ZScpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBpc0VudGVyaW5nQ3VzdG9tVmFsdWU6IHRydWUsXG4gICAgICAgIGlzQ2hvaWNlc09wZW46IGZhbHNlLFxuICAgICAgICB2YWx1ZTogY2hvaWNlLnZhbHVlXG4gICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMucmVmcy5jdXN0b21JbnB1dC5mb2N1cygpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChjaG9pY2UuYWN0aW9uID09PSAnaW5zZXJ0LWZpZWxkJykge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGlzQ2hvaWNlc09wZW46IGZhbHNlXG4gICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMucmVmcy5jdXN0b21JbnB1dC5zZXRDaG9pY2VzT3Blbih0cnVlKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgaXNDaG9pY2VzT3BlbjogISFjaG9pY2UuaXNPcGVuXG4gICAgICB9KTtcbiAgICAgIGlmIChjaG9pY2UuYWN0aW9uID09PSAnY2xlYXItY3VycmVudC1jaG9pY2UnKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIHZhbHVlOiAnJ1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZSgnJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5vblN0YXJ0QWN0aW9uKGNob2ljZS5hY3Rpb24sIGNob2ljZSk7XG4gIH0sXG5cbiAgLy8gSXMgdGhpcyBldmVuIHVzZWQ/IEkgZG9uJ3QgdGhpbmsgc28uXG4gIG9uQWN0aW9uOiBmdW5jdGlvbiAocGFyYW1zKSB7XG4gICAgaWYgKHBhcmFtcy5hY3Rpb24gPT09ICdlbnRlci1jdXN0b20tdmFsdWUnKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtpc0VudGVyaW5nQ3VzdG9tVmFsdWU6IHRydWV9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMucmVmcy5jdXN0b21JbnB1dC5mb2N1cygpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHRoaXMub25CdWJibGVBY3Rpb24ocGFyYW1zKTtcbiAgfSxcblxuICBvbklucHV0Q2hhbmdlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHZhbHVlKTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHZhbHVlOiB2YWx1ZVxuICAgIH0pO1xuICB9XG59KTtcbiIsIi8vICMgcHJldHR5LXRhZyBjb21wb25lbnRcblxuLypcbiAgIFByZXR0eSB0ZXh0IHRhZ1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgXyA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUnKTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdQcmV0dHlUYWcnLFxuXG4gIHByb3BUeXBlczoge1xuICAgIHRhZzogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcbiAgICByZXBsYWNlQ2hvaWNlczogUmVhY3QuUHJvcFR5cGVzLmFycmF5LFxuICAgIG9uQ2xpY2s6IFJlYWN0LlByb3BUeXBlcy5mdW5jLFxuICAgIGNsYXNzZXM6IFJlYWN0LlByb3BUeXBlcy5vYmplY3RcbiAgfSxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNsYXNzZXMgPSBjeChfLmV4dGVuZCh7fSwgdGhpcy5wcm9wcy5jbGFzc2VzLCB7J3ByZXR0eS1wYXJ0JzogdHJ1ZX0pKTtcblxuICAgIHJldHVybiAoXG4gICAgICA8c3BhbiBjbGFzc05hbWU9e2NsYXNzZXN9IG9uQ2xpY2s9e3RoaXMucHJvcHMub25DbGlja30+XG4gICAgICAgIHt0aGlzLnByb3BzLmNoaWxkcmVufVxuICAgICAgPC9zcGFuPlxuICAgICk7XG4gIH1cbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuLyogZ2xvYmFsIENvZGVNaXJyb3IgKi9cbi8qZXNsaW50IG5vLXNjcmlwdC11cmw6MCAqL1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBUYWdUcmFuc2xhdG9yID0gcmVxdWlyZSgnLi90YWctdHJhbnNsYXRvcicpO1xudmFyIF8gPSByZXF1aXJlKCcuLi8uLi91bmRhc2gnKTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxuLypcbiAgIEVkaXRvciBmb3IgdGFnZ2VkIHRleHQuIFJlbmRlcnMgdGV4dCBsaWtlIFwiaGVsbG8ge3tmaXJzdE5hbWV9fVwiXG4gICB3aXRoIHJlcGxhY2VtZW50IGxhYmVscyByZW5kZXJlZCBpbiBhIHBpbGwgYm94LiBEZXNpZ25lZCB0byBsb2FkXG4gICBxdWlja2x5IHdoZW4gbWFueSBzZXBhcmF0ZSBpbnN0YW5jZXMgb2YgaXQgYXJlIG9uIHRoZSBzYW1lXG4gICBwYWdlLlxuXG4gICBVc2VzIENvZGVNaXJyb3IgdG8gZWRpdCB0ZXh0LiBUbyBzYXZlIG1lbW9yeSB0aGUgQ29kZU1pcnJvciBub2RlIGlzXG4gICBpbnN0YW50aWF0ZWQgd2hlbiB0aGUgdXNlciBtb3ZlcyB0aGUgbW91c2UgaW50byB0aGUgZWRpdCBhcmVhLlxuICAgSW5pdGlhbGx5IGEgcmVhZC1vbmx5IHZpZXcgdXNpbmcgYSBzaW1wbGUgZGl2IGlzIHNob3duLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ1ByZXR0eVRleHRIZWxwZXInLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY3JlYXRlRWRpdG9yKCk7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkVXBkYXRlOiBmdW5jdGlvbihwcmV2UHJvcHMsIHByZXZTdGF0ZSkge1xuICAgIGlmIChwcmV2U3RhdGUuY29kZU1pcnJvck1vZGUgIT09IHRoaXMuc3RhdGUuY29kZU1pcnJvck1vZGUpIHtcbiAgICAgIC8vIENoYW5nZWQgZnJvbSBjb2RlIG1pcnJvciBtb2RlIHRvIHJlYWQgb25seSBtb2RlIG9yIHZpY2UgdmVyc2EsXG4gICAgICAvLyBzbyBzZXR1cCB0aGUgb3RoZXIgZWRpdG9yLlxuICAgICAgdGhpcy5jcmVhdGVFZGl0b3IoKTtcbiAgICB9XG4gICAgdGhpcy51cGRhdGVFZGl0b3IoKTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUuY29kZU1pcnJvck1vZGUpIHtcbiAgICAgIHRoaXMucmVtb3ZlQ29kZU1pcnJvckVkaXRvcigpO1xuICAgIH1cbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxlY3RlZENob2ljZXMgPSB0aGlzLnByb3BzLnNlbGVjdGVkQ2hvaWNlcztcbiAgICB2YXIgcmVwbGFjZUNob2ljZXMgPSB0aGlzLnByb3BzLnJlcGxhY2VDaG9pY2VzO1xuICAgIHZhciB0cmFuc2xhdG9yID0gVGFnVHJhbnNsYXRvcihzZWxlY3RlZENob2ljZXMuY29uY2F0KHJlcGxhY2VDaG9pY2VzKSwgdGhpcy5wcm9wcy5jb25maWcuaHVtYW5pemUpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHZhbHVlOiB0aGlzLnByb3BzLnZhbHVlLFxuICAgICAgY29kZU1pcnJvck1vZGU6IGZhbHNlLFxuICAgICAgaXNDaG9pY2VzT3BlbjogZmFsc2UsXG4gICAgICByZXBsYWNlQ2hvaWNlczogcmVwbGFjZUNob2ljZXMsXG4gICAgICB0cmFuc2xhdG9yOiB0cmFuc2xhdG9yXG4gICAgfTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbihuZXh0UHJvcHMpIHtcbiAgICB2YXIgc2VsZWN0ZWRDaG9pY2VzID0gdGhpcy5wcm9wcy5zZWxlY3RlZENob2ljZXM7XG4gICAgdmFyIHJlcGxhY2VDaG9pY2VzID0gdGhpcy5wcm9wcy5yZXBsYWNlQ2hvaWNlcztcbiAgICB2YXIgbmV4dFN0YXRlID0ge1xuICAgICAgcmVwbGFjZUNob2ljZXM6IHJlcGxhY2VDaG9pY2VzLFxuICAgICAgdHJhbnNsYXRvcjogVGFnVHJhbnNsYXRvcihzZWxlY3RlZENob2ljZXMuY29uY2F0KHJlcGxhY2VDaG9pY2VzKSwgdGhpcy5wcm9wcy5jb25maWcuaHVtYW5pemUpXG4gICAgfTtcblxuICAgIC8vIE5vdCBzdXJlIHdoYXQgdGhlIG51bGwvdW5kZWZpbmVkIGNoZWNrcyBhcmUgaGVyZSBmb3IsIGJ1dCBjaGFuZ2VkIGZyb20gZmFsc2V5IHdoaWNoIHdhcyBicmVha2luZy5cbiAgICBpZiAodGhpcy5zdGF0ZS52YWx1ZSAhPT0gbmV4dFByb3BzLnZhbHVlICYmICFfLmlzVW5kZWZpbmVkKG5leHRQcm9wcy52YWx1ZSkgJiYgbmV4dFByb3BzLnZhbHVlICE9PSBudWxsKSB7XG4gICAgICBuZXh0U3RhdGUudmFsdWUgPSBuZXh0UHJvcHMudmFsdWU7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZShuZXh0U3RhdGUpO1xuICB9LFxuXG4gIGhhbmRsZUNob2ljZVNlbGVjdGlvbjogZnVuY3Rpb24gKGtleSwgZXZlbnQpIHtcbiAgICBjb25zdCBzZWxlY3RDaG9pY2UgPSAoKSA9PiB7XG4gICAgICB2YXIgcG9zID0gdGhpcy5zdGF0ZS5zZWxlY3RlZFRhZ1BvcztcbiAgICAgIHZhciB0YWcgPSAne3snICsga2V5ICsgJ319JztcblxuICAgICAgaWYgKHBvcykge1xuICAgICAgICB0aGlzLmNvZGVNaXJyb3IucmVwbGFjZVJhbmdlKHRhZywge2xpbmU6IHBvcy5saW5lLCBjaDogcG9zLnN0YXJ0fSwge2xpbmU6IHBvcy5saW5lLCBjaDogcG9zLnN0b3B9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY29kZU1pcnJvci5yZXBsYWNlU2VsZWN0aW9uKHRhZywgJ2VuZCcpO1xuICAgICAgfVxuICAgICAgdGhpcy5jb2RlTWlycm9yLmZvY3VzKCk7XG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBpc0Nob2ljZXNPcGVuOiBmYWxzZSwgc2VsZWN0ZWRUYWdQb3M6IG51bGwgfSk7XG4gICAgfTtcbiAgICBpZiAodGhpcy5zdGF0ZS5jb2RlTWlycm9yTW9kZSkge1xuICAgICAgc2VsZWN0Q2hvaWNlKCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLnJlYWRPbmx5KSB7XG4gICAgICAvLyBoYWNrZXR5IGhhY2sgdG8gc3RvcCBkcm9wZG93biBjaG9pY2VzIGZyb20gdG9nZ2xpbmdcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZSgne3snICsga2V5ICsgJ319Jyk7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgaXNDaG9pY2VzT3BlbjogZmFsc2UgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc3dpdGNoVG9Db2RlTWlycm9yKHNlbGVjdENob2ljZSk7XG4gICAgfVxuICB9LFxuXG4gIGZvY3VzOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zd2l0Y2hUb0NvZGVNaXJyb3IoKCkgPT4ge1xuICAgICAgdGhpcy5jb2RlTWlycm9yLmZvY3VzKCk7XG4gICAgICB0aGlzLmNvZGVNaXJyb3Iuc2V0Q3Vyc29yKHRoaXMuY29kZU1pcnJvci5saW5lQ291bnQoKSwgMCk7XG4gICAgfSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciB0ZXh0Qm94Q2xhc3NlcyA9IGN4KF8uZXh0ZW5kKHt9LCB0aGlzLnByb3BzLmNsYXNzZXMsIHsncHJldHR5LXRleHQtYm94JzogdHJ1ZX0pKTtcblxuICAgIHZhciBvbkluc2VydENsaWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7c2VsZWN0ZWRUYWdQb3M6IG51bGx9KTtcbiAgICAgIHRoaXMub25Ub2dnbGVDaG9pY2VzKCk7XG4gICAgfTtcbiAgICB2YXIgaW5zZXJ0QnRuID0gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2luc2VydC1idXR0b24nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cmVmOiAndG9nZ2xlJywgb25DbGljazogb25JbnNlcnRDbGljay5iaW5kKHRoaXMpfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0luc2VydC4uLicpO1xuXG4gICAgdmFyIGNob2ljZXMgPSBjb25maWcuY3JlYXRlRWxlbWVudCgnY2hvaWNlcycsIHtcbiAgICAgIHJlZjogJ2Nob2ljZXMnLFxuICAgICAgY2hvaWNlczogdGhpcy5zdGF0ZS5yZXBsYWNlQ2hvaWNlcyxcbiAgICAgIG9wZW46IHRoaXMuc3RhdGUuaXNDaG9pY2VzT3BlbixcbiAgICAgIGlnbm9yZUNsb3NlTm9kZXM6IHRoaXMuZ2V0Q2xvc2VJZ25vcmVOb2RlcyxcbiAgICAgIG9uU2VsZWN0OiB0aGlzLmhhbmRsZUNob2ljZVNlbGVjdGlvbixcbiAgICAgIG9uQ2xvc2U6IHRoaXMub25DbG9zZUNob2ljZXMsXG4gICAgICBpc0FjY29yZGlvbjogdGhpcy5wcm9wcy5pc0FjY29yZGlvblxuICAgIH0pO1xuXG4gICAgLy8gUmVuZGVyIHJlYWQtb25seSB2ZXJzaW9uLlxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT17Y3goeydwcmV0dHktdGV4dC13cmFwcGVyJzogdHJ1ZSwgJ2Nob2ljZXMtb3Blbic6IHRoaXMuc3RhdGUuaXNDaG9pY2VzT3Blbn0pfSBvbk1vdXNlRW50ZXI9e3RoaXMuc3dpdGNoVG9Db2RlTWlycm9yfT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e3RleHRCb3hDbGFzc2VzfSB0YWJJbmRleD17dGhpcy5wcm9wcy50YWJJbmRleH0gb25Gb2N1cz17dGhpcy5wcm9wcy5vbkZvY3VzfSBvbkJsdXI9e3RoaXMucHJvcHMub25CbHVyfT5cbiAgICAgICAgICA8ZGl2IHJlZj0ndGV4dEJveCcgY2xhc3NOYW1lPSdpbnRlcm5hbC10ZXh0LXdyYXBwZXInIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICB7aW5zZXJ0QnRufVxuICAgICAgICB7Y2hvaWNlc31cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH0sXG5cbiAgZ2V0Q2xvc2VJZ25vcmVOb2RlczogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlZnMudG9nZ2xlLmdldERPTU5vZGUoKTtcbiAgfSxcblxuICBvblRvZ2dsZUNob2ljZXM6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNldENob2ljZXNPcGVuKCF0aGlzLnN0YXRlLmlzQ2hvaWNlc09wZW4pO1xuICB9LFxuXG4gIHNldENob2ljZXNPcGVuOiBmdW5jdGlvbiAoaXNPcGVuKSB7XG4gICAgdmFyIGFjdGlvbiA9IGlzT3BlbiA/ICdvcGVuLXJlcGxhY2VtZW50cycgOiAnY2xvc2UtcmVwbGFjZW1lbnRzJztcbiAgICB0aGlzLm9uU3RhcnRBY3Rpb24oYWN0aW9uKTtcbiAgICB0aGlzLnNldFN0YXRlKHsgaXNDaG9pY2VzT3BlbjogaXNPcGVuIH0pO1xuICB9LFxuXG4gIG9uQ2xvc2VDaG9pY2VzOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUuaXNDaG9pY2VzT3Blbikge1xuICAgICAgdGhpcy5zZXRDaG9pY2VzT3BlbihmYWxzZSk7XG4gICAgfVxuICB9LFxuXG4gIGNyZWF0ZUVkaXRvcjogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnN0YXRlLmNvZGVNaXJyb3JNb2RlKSB7XG4gICAgICB0aGlzLmNyZWF0ZUNvZGVNaXJyb3JFZGl0b3IoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jcmVhdGVSZWFkb25seUVkaXRvcigpO1xuICAgIH1cbiAgfSxcblxuICB1cGRhdGVFZGl0b3I6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5jb2RlTWlycm9yTW9kZSkge1xuICAgICAgdmFyIGNvZGVNaXJyb3JWYWx1ZSA9IHRoaXMuY29kZU1pcnJvci5nZXRWYWx1ZSgpO1xuICAgICAgaWYgKGNvZGVNaXJyb3JWYWx1ZSAhPT0gdGhpcy5zdGF0ZS52YWx1ZSkge1xuICAgICAgICAvLyBzd2l0Y2ggYmFjayB0byByZWFkLW9ubHkgbW9kZSB0byBtYWtlIGl0IGVhc2llciB0byByZW5kZXJcbiAgICAgICAgdGhpcy5yZW1vdmVDb2RlTWlycm9yRWRpdG9yKCk7XG4gICAgICAgIHRoaXMuY3JlYXRlUmVhZG9ubHlFZGl0b3IoKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgY29kZU1pcnJvck1vZGU6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNyZWF0ZVJlYWRvbmx5RWRpdG9yKCk7XG4gICAgfVxuICB9LFxuXG4gIGNyZWF0ZUNvZGVNaXJyb3JFZGl0b3I6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgIGxpbmVXcmFwcGluZzogdHJ1ZSxcbiAgICAgIHRhYmluZGV4OiB0aGlzLnByb3BzLnRhYkluZGV4LFxuICAgICAgdmFsdWU6IFN0cmluZyh0aGlzLnN0YXRlLnZhbHVlKSxcbiAgICAgIG1vZGU6IG51bGwsXG4gICAgICBleHRyYUtleXM6IHtcbiAgICAgICAgVGFiOiBmYWxzZVxuICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgdGV4dEJveCA9IHRoaXMucmVmcy50ZXh0Qm94LmdldERPTU5vZGUoKTtcbiAgICB0ZXh0Qm94LmlubmVySFRNTCA9ICcnOyAvLyByZWxlYXNlIGFueSBwcmV2aW91cyByZWFkLW9ubHkgY29udGVudCBzbyBpdCBjYW4gYmUgR0MnZWRcblxuICAgIHRoaXMuY29kZU1pcnJvciA9IENvZGVNaXJyb3IodGV4dEJveCwgb3B0aW9ucyk7XG4gICAgdGhpcy5jb2RlTWlycm9yLm9uKCdjaGFuZ2UnLCB0aGlzLm9uQ29kZU1pcnJvckNoYW5nZSk7XG5cbiAgICB0aGlzLnRhZ0NvZGVNaXJyb3IoKTtcbiAgfSxcblxuICB0YWdDb2RlTWlycm9yOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHBvc2l0aW9ucyA9IHRoaXMuc3RhdGUudHJhbnNsYXRvci5nZXRUYWdQb3NpdGlvbnModGhpcy5jb2RlTWlycm9yLmdldFZhbHVlKCkpO1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciB0YWdPcHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBwb3NpdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAocG9zKSB7XG4gICAgICAgIHZhciBub2RlID0gc2VsZi5jcmVhdGVUYWdOb2RlKHBvcyk7XG4gICAgICAgIHNlbGYuY29kZU1pcnJvci5tYXJrVGV4dCh7bGluZTogcG9zLmxpbmUsIGNoOiBwb3Muc3RhcnR9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2xpbmU6IHBvcy5saW5lLCBjaDogcG9zLnN0b3B9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3JlcGxhY2VkV2l0aDogbm9kZSwgaGFuZGxlTW91c2VFdmVudHM6IHRydWV9KTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICB0aGlzLmNvZGVNaXJyb3Iub3BlcmF0aW9uKHRhZ09wcyk7XG4gIH0sXG5cbiAgb25Db2RlTWlycm9yQ2hhbmdlOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMudXBkYXRpbmdDb2RlTWlycm9yKSB7XG4gICAgICAvLyBhdm9pZCByZWN1cnNpdmUgdXBkYXRlIGN5Y2xlLCBhbmQgbWFyayB0aGUgY29kZSBtaXJyb3IgbWFudWFsIHVwZGF0ZSBhcyBkb25lXG4gICAgICB0aGlzLnVwZGF0aW5nQ29kZU1pcnJvciA9IGZhbHNlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBuZXdWYWx1ZSA9IHRoaXMuY29kZU1pcnJvci5nZXRWYWx1ZSgpO1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UobmV3VmFsdWUpO1xuICAgIHRoaXMuc2V0U3RhdGUoe3ZhbHVlOiBuZXdWYWx1ZX0pO1xuICAgIHRoaXMudGFnQ29kZU1pcnJvcigpO1xuICB9LFxuXG4gIGNyZWF0ZVJlYWRvbmx5RWRpdG9yOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRleHRCb3hOb2RlID0gdGhpcy5yZWZzLnRleHRCb3guZ2V0RE9NTm9kZSgpO1xuXG4gICAgdmFyIHRva2VucyA9IHRoaXMuc3RhdGUudHJhbnNsYXRvci50b2tlbml6ZSh0aGlzLnN0YXRlLnZhbHVlKTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIG5vZGVzID0gdG9rZW5zLm1hcChmdW5jdGlvbiAocGFydCwgaSkge1xuICAgICAgaWYgKHBhcnQudHlwZSA9PT0gJ3RhZycpIHtcbiAgICAgICAgdmFyIGxhYmVsID0gc2VsZi5zdGF0ZS50cmFuc2xhdG9yLmdldExhYmVsKHBhcnQudmFsdWUpO1xuICAgICAgICB2YXIgcHJvcHMgPSB7a2V5OiBpLCB0YWc6IHBhcnQudmFsdWUsIHJlcGxhY2VDaG9pY2VzOiBzZWxmLnN0YXRlLnJlcGxhY2VDaG9pY2VzfTtcbiAgICAgICAgcmV0dXJuIHNlbGYucHJvcHMuY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ3ByZXR0eS10YWcnLCBwcm9wcywgbGFiZWwpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIDxzcGFuIGtleT17aX0+e3BhcnQudmFsdWV9PC9zcGFuPjtcbiAgICB9KTtcblxuICAgIFJlYWN0LnJlbmRlcig8c3Bhbj57bm9kZXN9PC9zcGFuPiwgdGV4dEJveE5vZGUpO1xuICB9LFxuXG4gIHJlbW92ZUNvZGVNaXJyb3JFZGl0b3I6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGV4dEJveE5vZGUgPSB0aGlzLnJlZnMudGV4dEJveC5nZXRET01Ob2RlKCk7XG4gICAgdmFyIGNtTm9kZSA9IHRleHRCb3hOb2RlLmZpcnN0Q2hpbGQ7XG4gICAgdGV4dEJveE5vZGUucmVtb3ZlQ2hpbGQoY21Ob2RlKTtcbiAgICB0aGlzLmNvZGVNaXJyb3IgPSBudWxsO1xuICB9LFxuXG4gIHN3aXRjaFRvQ29kZU1pcnJvcjogZnVuY3Rpb24gKGNiKSB7XG4gICAgaWYgKCF0aGlzLnN0YXRlLmNvZGVNaXJyb3JNb2RlICYmICF0aGlzLnByb3BzLnJlYWRPbmx5KSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtjb2RlTWlycm9yTW9kZTogdHJ1ZX0sICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuY29kZU1pcnJvciAmJiBfLmlzRnVuY3Rpb24oY2IpKSB7XG4gICAgICAgICAgY2IoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9LFxuXG4gIGNyZWF0ZVRhZ05vZGU6IGZ1bmN0aW9uIChwb3MpIHtcbiAgICB2YXIgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICB2YXIgbGFiZWwgPSB0aGlzLnN0YXRlLnRyYW5zbGF0b3IuZ2V0TGFiZWwocG9zLnRhZyk7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuXG4gICAgdmFyIG9uVGFnQ2xpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3RlZFRhZ1BvczogcG9zfSk7XG4gICAgICB0aGlzLm9uVG9nZ2xlQ2hvaWNlcygpO1xuICAgIH07XG5cbiAgICB2YXIgcHJvcHMgPSB7dGFnOiBwb3MudGFnLCByZXBsYWNlQ2hvaWNlczogdGhpcy5zdGF0ZS5yZXBsYWNlQ2hvaWNlcywgb25DbGljazogb25UYWdDbGljay5iaW5kKHRoaXMpfTtcblxuICAgIFJlYWN0LnJlbmRlcihcbiAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdwcmV0dHktdGFnJywgcHJvcHMsIGxhYmVsKSxcbiAgICAgIG5vZGVcbiAgICApO1xuXG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cbn0pO1xuIiwiLy8gIyByZW1vdmUtaXRlbSBjb21wb25lbnRcblxuLypcblJlbW92ZSBhbiBpdGVtLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ1JlbW92ZUl0ZW0nLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxhYmVsOiAnW3JlbW92ZV0nXG4gICAgfTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgb25Nb3VzZU92ZXJSZW1vdmU6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5vbk1heWJlUmVtb3ZlKSB7XG4gICAgICB0aGlzLnByb3BzLm9uTWF5YmVSZW1vdmUodHJ1ZSk7XG4gICAgfVxuICB9LFxuXG4gIG9uTW91c2VPdXRSZW1vdmU6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5vbk1heWJlUmVtb3ZlKSB7XG4gICAgICB0aGlzLnByb3BzLm9uTWF5YmVSZW1vdmUoZmFsc2UpO1xuICAgIH1cbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFIuc3Bhbih7XG4gICAgICBjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcyksIG9uQ2xpY2s6IHRoaXMucHJvcHMub25DbGljayxcbiAgICAgIG9uTW91c2VPdmVyOiB0aGlzLm9uTW91c2VPdmVyUmVtb3ZlLCBvbk1vdXNlT3V0OiB0aGlzLm9uTW91c2VPdXRSZW1vdmVcbiAgICB9LCB0aGlzLnByb3BzLmxhYmVsKTtcbiAgfVxufSk7XG4iLCIvLyAjIGhlbHAgY29tcG9uZW50XG5cbi8qXG5KdXN0IHRoZSBoZWxwIHRleHQgYmxvY2suXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnU2FtcGxlJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY2hvaWNlID0gdGhpcy5wcm9wcy5jaG9pY2U7XG5cbiAgICByZXR1cm4gY2hvaWNlLnNhbXBsZSA/XG4gICAgICBSLmRpdih7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzTmFtZSl9LFxuICAgICAgICBjaG9pY2Uuc2FtcGxlXG4gICAgICApIDpcbiAgICAgIFIuc3BhbihudWxsKTtcbiAgfVxufSk7XG4iLCIvLyAjIHNlbGVjdC12YWx1ZSBjb21wb25lbnRcblxuLypcblJlbmRlciBhIHNlbGVjdCBkcm9wZG93biBmb3IgYSBsaXN0IG9mIGNob2ljZXMuIENob2ljZXMgdmFsdWVzIGNhbiBiZSBvZiBhbnlcbnR5cGUuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgXyA9IHJlcXVpcmUoJy4uLy4uL3VuZGFzaCcpO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ1NlbGVjdFZhbHVlJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB2YXIgY2hvaWNlVmFsdWUgPSBldmVudC50YXJnZXQudmFsdWU7XG4gICAgdmFyIGNob2ljZVR5cGUgPSBjaG9pY2VWYWx1ZS5zdWJzdHJpbmcoMCwgY2hvaWNlVmFsdWUuaW5kZXhPZignOicpKTtcbiAgICBpZiAoY2hvaWNlVHlwZSA9PT0gJ2Nob2ljZScpIHtcbiAgICAgIHZhciBjaG9pY2VJbmRleCA9IGNob2ljZVZhbHVlLnN1YnN0cmluZyhjaG9pY2VWYWx1ZS5pbmRleE9mKCc6JykgKyAxKTtcbiAgICAgIGNob2ljZUluZGV4ID0gcGFyc2VJbnQoY2hvaWNlSW5kZXgpO1xuICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZSh0aGlzLnByb3BzLmNob2ljZXNbY2hvaWNlSW5kZXhdLnZhbHVlKTtcbiAgICB9XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGNob2ljZXMgPSB0aGlzLnByb3BzLmNob2ljZXMgfHwgW107XG5cbiAgICB2YXIgY2hvaWNlc09yTG9hZGluZztcblxuICAgIGlmICgoY2hvaWNlcy5sZW5ndGggPT09IDEgJiYgY2hvaWNlc1swXS52YWx1ZSA9PT0gJy8vL2xvYWRpbmcvLy8nKSB8fCBjb25maWcuZmllbGRJc0xvYWRpbmcodGhpcy5wcm9wcy5maWVsZCkpIHtcbiAgICAgIGNob2ljZXNPckxvYWRpbmcgPSBjb25maWcuY3JlYXRlRWxlbWVudCgnbG9hZGluZy1jaG9pY2VzJywge30pO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdmFsdWUgPSB0aGlzLnByb3BzLmZpZWxkLnZhbHVlICE9PSB1bmRlZmluZWQgPyB0aGlzLnByb3BzLmZpZWxkLnZhbHVlIDogJyc7XG5cbiAgICAgIGNob2ljZXMgPSBjaG9pY2VzLm1hcChmdW5jdGlvbiAoY2hvaWNlLCBpKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgY2hvaWNlVmFsdWU6ICdjaG9pY2U6JyArIGksXG4gICAgICAgICAgdmFsdWU6IGNob2ljZS52YWx1ZSxcbiAgICAgICAgICBsYWJlbDogY2hvaWNlLmxhYmVsXG4gICAgICAgIH07XG4gICAgICB9KTtcblxuICAgICAgdmFyIHZhbHVlQ2hvaWNlID0gXy5maW5kKGNob2ljZXMsIGZ1bmN0aW9uIChjaG9pY2UpIHtcbiAgICAgICAgcmV0dXJuIGNob2ljZS52YWx1ZSA9PT0gdmFsdWU7XG4gICAgICB9KTtcblxuICAgICAgaWYgKHZhbHVlQ2hvaWNlID09PSB1bmRlZmluZWQpIHtcblxuICAgICAgICB2YXIgbGFiZWwgPSB2YWx1ZTtcbiAgICAgICAgaWYgKCFfLmlzU3RyaW5nKHZhbHVlKSkge1xuICAgICAgICAgIGxhYmVsID0gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHZhbHVlQ2hvaWNlID0ge1xuICAgICAgICAgIGNob2ljZVZhbHVlOiAndmFsdWU6JyxcbiAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgbGFiZWw6IGxhYmVsXG4gICAgICAgIH07XG4gICAgICAgIGNob2ljZXMgPSBbdmFsdWVDaG9pY2VdLmNvbmNhdChjaG9pY2VzKTtcbiAgICAgIH1cblxuICAgICAgY2hvaWNlc09yTG9hZGluZyA9IFIuc2VsZWN0KHtcbiAgICAgICAgY2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpLFxuICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgICAgdmFsdWU6IHZhbHVlQ2hvaWNlLmNob2ljZVZhbHVlLFxuICAgICAgICBvbkZvY3VzOiB0aGlzLm9uRm9jdXNBY3Rpb24sXG4gICAgICAgIG9uQmx1cjogdGhpcy5vbkJsdXJBY3Rpb25cbiAgICAgIH0sXG4gICAgICBjaG9pY2VzLm1hcChmdW5jdGlvbiAoY2hvaWNlLCBpKSB7XG4gICAgICAgIHJldHVybiBSLm9wdGlvbih7XG4gICAgICAgICAga2V5OiBpLFxuICAgICAgICAgIHZhbHVlOiBjaG9pY2UuY2hvaWNlVmFsdWVcbiAgICAgICAgfSwgY2hvaWNlLmxhYmVsKTtcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIHJldHVybiBjaG9pY2VzT3JMb2FkaW5nO1xufVxufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIGJ1aWxkQ2hvaWNlc01hcChyZXBsYWNlQ2hvaWNlcykge1xuICB2YXIgY2hvaWNlcyA9IHt9O1xuICByZXBsYWNlQ2hvaWNlcy5mb3JFYWNoKGZ1bmN0aW9uIChjaG9pY2UpIHtcbiAgICB2YXIga2V5ID0gY2hvaWNlLnZhbHVlO1xuICAgIGNob2ljZXNba2V5XSA9IGNob2ljZS5sYWJlbDtcbiAgfSk7XG4gIHJldHVybiBjaG9pY2VzO1xufVxuXG4vKlxuICAgQ3JlYXRlcyBoZWxwZXIgdG8gdHJhbnNsYXRlIGJldHdlZW4gdGFncyBsaWtlIHt7Zmlyc3ROYW1lfX0gYW5kXG4gICBhbiBlbmNvZGVkIHJlcHJlc2VudGF0aW9uIHN1aXRhYmxlIGZvciB1c2UgaW4gQ29kZU1pcnJvci5cbiAqL1xuZnVuY3Rpb24gVGFnVHJhbnNsYXRvcihyZXBsYWNlQ2hvaWNlcywgaHVtYW5pemUpIHtcbiAgLy8gTWFwIG9mIHRhZyB0byBsYWJlbCAnZmlyc3ROYW1lJyAtLT4gJ0ZpcnN0IE5hbWUnXG4gIHZhciBjaG9pY2VzID0gYnVpbGRDaG9pY2VzTWFwKHJlcGxhY2VDaG9pY2VzKTtcblxuICByZXR1cm4ge1xuICAgIC8qXG4gICAgICAgR2V0IGxhYmVsIGZvciB0YWcuICBGb3IgZXhhbXBsZSAnZmlyc3ROYW1lJyBiZWNvbWVzICdGaXJzdCBOYW1lJy5cbiAgICAgICBSZXR1cm5zIGEgaHVtYW5pemVkIHZlcnNpb24gb2YgdGhlIHRhZyBpZiB3ZSBkb24ndCBoYXZlIGEgbGFiZWwgZm9yIHRoZSB0YWcuXG4gICAgICovXG4gICAgZ2V0TGFiZWw6IGZ1bmN0aW9uICh0YWcpIHtcbiAgICAgIHZhciBsYWJlbCA9IGNob2ljZXNbdGFnXTtcbiAgICAgIGlmICghbGFiZWwpIHtcbiAgICAgICAgLy8gSWYgdGFnIG5vdCBmb3VuZCBhbmQgd2UgaGF2ZSBhIGh1bWFuaXplIGZ1bmN0aW9uLCBodW1hbml6ZSB0aGUgdGFnLlxuICAgICAgICAvLyBPdGhlcndpc2UganVzdCByZXR1cm4gdGhlIHRhZy5cbiAgICAgICAgbGFiZWwgPSBodW1hbml6ZSAmJiBodW1hbml6ZSh0YWcpIHx8IHRhZztcbiAgICAgIH1cbiAgICAgIHJldHVybiBsYWJlbDtcbiAgICB9LFxuXG4gICAgdG9rZW5pemU6IGZ1bmN0aW9uICh0ZXh0KSB7XG4gICAgICB0ZXh0ID0gU3RyaW5nKHRleHQpO1xuXG4gICAgICB2YXIgcmVnZXhwID0gLyhcXHtcXHt8XFx9XFx9KS87XG4gICAgICB2YXIgcGFydHMgPSB0ZXh0LnNwbGl0KHJlZ2V4cCk7XG5cbiAgICAgIHZhciB0b2tlbnMgPSBbXTtcbiAgICAgIHZhciBpblRhZyA9IGZhbHNlO1xuICAgICAgcGFydHMuZm9yRWFjaChmdW5jdGlvbiAocGFydCkge1xuICAgICAgICBpZiAocGFydCA9PT0gJ3t7Jykge1xuICAgICAgICAgIGluVGFnID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChwYXJ0ID09PSAnfX0nKSB7XG4gICAgICAgICAgaW5UYWcgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIGlmIChpblRhZykge1xuICAgICAgICAgIHRva2Vucy5wdXNoKHt0eXBlOiAndGFnJywgdmFsdWU6IHBhcnR9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0b2tlbnMucHVzaCh7dHlwZTogJ3N0cmluZycsIHZhbHVlOiBwYXJ0fSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRva2VucztcbiAgICB9LFxuXG4gICAgZ2V0VGFnUG9zaXRpb25zOiBmdW5jdGlvbiAodGV4dCkge1xuICAgICAgdmFyIGxpbmVzID0gdGV4dC5zcGxpdCgnXFxuJyk7XG4gICAgICB2YXIgcmUgPSAvXFx7XFx7Lis/XFx9XFx9L2c7XG4gICAgICB2YXIgcG9zaXRpb25zID0gW107XG4gICAgICB2YXIgbTtcblxuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHdoaWxlICgobSA9IHJlLmV4ZWMobGluZXNbaV0pKSAhPT0gbnVsbCkge1xuICAgICAgICAgIHZhciB0YWcgPSBtWzBdLnN1YnN0cmluZygyLCBtWzBdLmxlbmd0aC0yKTtcbiAgICAgICAgICBwb3NpdGlvbnMucHVzaCh7XG4gICAgICAgICAgICBsaW5lOiBpLFxuICAgICAgICAgICAgc3RhcnQ6IG0uaW5kZXgsXG4gICAgICAgICAgICBzdG9wOiBtLmluZGV4ICsgbVswXS5sZW5ndGgsXG4gICAgICAgICAgICB0YWc6IHRhZ1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcG9zaXRpb25zO1xuICAgIH1cbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUYWdUcmFuc2xhdG9yO1xuIiwiLy8gIyBkZWZhdWx0LWNvbmZpZ1xuXG4vKlxuVGhpcyBpcyB0aGUgZGVmYXVsdCBjb25maWd1cmF0aW9uIHBsdWdpbiBmb3IgZm9ybWF0aWMuIFRvIGNoYW5nZSBmb3JtYXRpYydzXG5iZWhhdmlvciwganVzdCBjcmVhdGUgeW91ciBvd24gcGx1Z2luIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhbiBvYmplY3Qgd2l0aFxubWV0aG9kcyB5b3Ugd2FudCB0byBhZGQgb3Igb3ZlcnJpZGUuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgXyA9IHJlcXVpcmUoJy4vdW5kYXNoJyk7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgdmFyIGRlbGVnYXRlVG8gPSB1dGlscy5kZWxlZ2F0b3IoY29uZmlnKTtcblxuICByZXR1cm4ge1xuXG4gICAgLy8gRmllbGQgZWxlbWVudCBmYWN0b3JpZXMuIENyZWF0ZSBmaWVsZCBlbGVtZW50cy5cblxuICAgIGNyZWF0ZUVsZW1lbnRfRmllbGRzOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvZmllbGRzJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9TdHJpbmc6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9zdHJpbmcnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X1NpbmdsZUxpbmVTdHJpbmc6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9zaW5nbGUtbGluZS1zdHJpbmcnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X1Bhc3N3b3JkOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvcGFzc3dvcmQnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X1NlbGVjdDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL3NlbGVjdCcpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfUHJldHR5U2VsZWN0OiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvcHJldHR5LXNlbGVjdCcpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfQm9vbGVhbjogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL2Jvb2xlYW4nKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X1ByZXR0eUJvb2xlYW46IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9wcmV0dHktYm9vbGVhbicpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfQ2hlY2tib3hCb29sZWFuOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvY2hlY2tib3gtYm9vbGVhbicpKSxcblxuICAgIC8vIGNyZWF0ZUVsZW1lbnRfUHJldHR5VGV4dDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL3ByZXR0eS10ZXh0JykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9Db2RlOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvY29kZScpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfUHJldHR5VGV4dDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL3ByZXR0eS10ZXh0MicpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfUHJldHR5VGFnOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL3ByZXR0eS10YWcnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0FycmF5OiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvYXJyYXknKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0NoZWNrYm94QXJyYXk6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9jaGVja2JveC1hcnJheScpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfT2JqZWN0OiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvb2JqZWN0JykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9Kc29uOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvanNvbicpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfVW5rbm93bkZpZWxkOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvdW5rbm93bicpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfQ29weTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL2NvcHknKSksXG5cblxuICAgIC8vIE90aGVyIGVsZW1lbnQgZmFjdG9yaWVzLiBDcmVhdGUgaGVscGVyIGVsZW1lbnRzIHVzZWQgYnkgZmllbGQgY29tcG9uZW50cy5cblxuICAgIGNyZWF0ZUVsZW1lbnRfRmllbGQ6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvZmllbGQnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0xhYmVsOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2xhYmVsJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9IZWxwOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2hlbHAnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0Nob2ljZXM6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvY2hvaWNlcycpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfTG9hZGluZ0Nob2ljZXM6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvbG9hZGluZy1jaG9pY2VzJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9Mb2FkaW5nQ2hvaWNlOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2xvYWRpbmctY2hvaWNlJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9BcnJheUNvbnRyb2w6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvYXJyYXktY29udHJvbCcpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfQXJyYXlJdGVtQ29udHJvbDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9hcnJheS1pdGVtLWNvbnRyb2wnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0FycmF5SXRlbVZhbHVlOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2FycmF5LWl0ZW0tdmFsdWUnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0FycmF5SXRlbTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9hcnJheS1pdGVtJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9GaWVsZFRlbXBsYXRlQ2hvaWNlczogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9maWVsZC10ZW1wbGF0ZS1jaG9pY2VzJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9BZGRJdGVtOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2FkZC1pdGVtJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9SZW1vdmVJdGVtOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL3JlbW92ZS1pdGVtJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9Nb3ZlSXRlbUZvcndhcmQ6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvbW92ZS1pdGVtLWZvcndhcmQnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X01vdmVJdGVtQmFjazogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9tb3ZlLWl0ZW0tYmFjaycpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfT2JqZWN0Q29udHJvbDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9vYmplY3QtY29udHJvbCcpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfT2JqZWN0SXRlbUNvbnRyb2w6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWl0ZW0tY29udHJvbCcpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfT2JqZWN0SXRlbVZhbHVlOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL29iamVjdC1pdGVtLXZhbHVlJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9PYmplY3RJdGVtS2V5OiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL29iamVjdC1pdGVtLWtleScpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfT2JqZWN0SXRlbTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9vYmplY3QtaXRlbScpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfU2VsZWN0VmFsdWU6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvc2VsZWN0LXZhbHVlJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9QcmV0dHlTZWxlY3RWYWx1ZTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9wcmV0dHktc2VsZWN0LXZhbHVlJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9QcmV0dHlTZWxlY3RJbnB1dDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9wcmV0dHktc2VsZWN0LWlucHV0JykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9TYW1wbGU6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvc2FtcGxlJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9JbnNlcnRCdXR0b246IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvaW5zZXJ0LWJ1dHRvbicpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfQ2hvaWNlU2VjdGlvbkhlYWRlcjogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9jaG9pY2Utc2VjdGlvbi1oZWFkZXInKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X1ByZXR0eVRleHRIZWxwZXI6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvcHJldHR5LXRleHQtaGVscGVyJykpLFxuXG4gICAgLy8gRmllbGQgZGVmYXVsdCB2YWx1ZSBmYWN0b3JpZXMuIEdpdmUgYSBkZWZhdWx0IHZhbHVlIGZvciBhIHNwZWNpZmljIHR5cGUuXG5cbiAgICBjcmVhdGVEZWZhdWx0VmFsdWVfU3RyaW5nOiBmdW5jdGlvbiAoLyogZmllbGRUZW1wbGF0ZSAqLykge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH0sXG5cbiAgICBjcmVhdGVEZWZhdWx0VmFsdWVfT2JqZWN0OiBmdW5jdGlvbiAoLyogZmllbGRUZW1wbGF0ZSAqLykge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH0sXG5cbiAgICBjcmVhdGVEZWZhdWx0VmFsdWVfQXJyYXk6IGZ1bmN0aW9uICgvKiBmaWVsZFRlbXBsYXRlICovKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfSxcblxuICAgIGNyZWF0ZURlZmF1bHRWYWx1ZV9Cb29sZWFuOiBmdW5jdGlvbiAoLyogZmllbGRUZW1wbGF0ZSAqLykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICBjcmVhdGVEZWZhdWx0VmFsdWVfRmllbGRzOiBkZWxlZ2F0ZVRvKCdjcmVhdGVEZWZhdWx0VmFsdWVfT2JqZWN0JyksXG5cbiAgICBjcmVhdGVEZWZhdWx0VmFsdWVfU2luZ2xlTGluZVN0cmluZzogZGVsZWdhdGVUbygnY3JlYXRlRGVmYXVsdFZhbHVlX1N0cmluZycpLFxuXG4gICAgY3JlYXRlRGVmYXVsdFZhbHVlX1NlbGVjdDogZGVsZWdhdGVUbygnY3JlYXRlRGVmYXVsdFZhbHVlX1N0cmluZycpLFxuXG4gICAgY3JlYXRlRGVmYXVsdFZhbHVlX0pzb246IGRlbGVnYXRlVG8oJ2NyZWF0ZURlZmF1bHRWYWx1ZV9PYmplY3QnKSxcblxuICAgIGNyZWF0ZURlZmF1bHRWYWx1ZV9DaGVja2JveEFycmF5OiBkZWxlZ2F0ZVRvKCdjcmVhdGVEZWZhdWx0VmFsdWVfQXJyYXknKSxcblxuICAgIGNyZWF0ZURlZmF1bHRWYWx1ZV9DaGVja2JveEJvb2xlYW46IGRlbGVnYXRlVG8oJ2NyZWF0ZURlZmF1bHRWYWx1ZV9Cb29sZWFuJyksXG5cblxuICAgIC8vIEZpZWxkIHZhbHVlIGNvZXJjZXJzLiBDb2VyY2UgYSB2YWx1ZSBpbnRvIGEgdmFsdWUgYXBwcm9wcmlhdGUgZm9yIGEgc3BlY2lmaWMgdHlwZS5cblxuICAgIGNvZXJjZVZhbHVlX1N0cmluZzogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUsIHZhbHVlKSB7XG4gICAgICBpZiAoXy5pc1N0cmluZyh2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfVxuICAgICAgaWYgKF8uaXNVbmRlZmluZWQodmFsdWUpIHx8IHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICAgIH1cbiAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgfSxcblxuICAgIGNvZXJjZVZhbHVlX09iamVjdDogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUsIHZhbHVlKSB7XG4gICAgICBpZiAoIV8uaXNPYmplY3QodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9LFxuXG4gICAgY29lcmNlVmFsdWVfQXJyYXk6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlLCB2YWx1ZSkge1xuICAgICAgaWYgKCFfLmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBbdmFsdWVdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG5cbiAgICBjb2VyY2VWYWx1ZV9Cb29sZWFuOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSwgdmFsdWUpIHtcbiAgICAgIHJldHVybiBjb25maWcuY29lcmNlVmFsdWVUb0Jvb2xlYW4odmFsdWUpO1xuICAgIH0sXG5cbiAgICBjb2VyY2VWYWx1ZV9GaWVsZHM6IGRlbGVnYXRlVG8oJ2NvZXJjZVZhbHVlX09iamVjdCcpLFxuXG4gICAgY29lcmNlVmFsdWVfU2luZ2xlTGluZVN0cmluZzogZGVsZWdhdGVUbygnY29lcmNlVmFsdWVfU3RyaW5nJyksXG5cbiAgICBjb2VyY2VWYWx1ZV9TZWxlY3Q6IGRlbGVnYXRlVG8oJ2NvZXJjZVZhbHVlX1N0cmluZycpLFxuXG4gICAgY29lcmNlVmFsdWVfSnNvbjogZGVsZWdhdGVUbygnY29lcmNlVmFsdWVfT2JqZWN0JyksXG5cbiAgICBjb2VyY2VWYWx1ZV9DaGVja2JveEFycmF5OiBkZWxlZ2F0ZVRvKCdjb2VyY2VWYWx1ZV9BcnJheScpLFxuXG4gICAgY29lcmNlVmFsdWVfQ2hlY2tib3hCb29sZWFuOiBkZWxlZ2F0ZVRvKCdjb2VyY2VWYWx1ZV9Cb29sZWFuJyksXG5cblxuICAgIC8vIEZpZWxkIGNoaWxkIGZpZWxkcyBmYWN0b3JpZXMsIHNvIHNvbWUgdHlwZXMgY2FuIGhhdmUgZHluYW1pYyBjaGlsZHJlbi5cblxuICAgIGNyZWF0ZUNoaWxkRmllbGRzX0FycmF5OiBmdW5jdGlvbiAoZmllbGQpIHtcblxuICAgICAgcmV0dXJuIGZpZWxkLnZhbHVlLm1hcChmdW5jdGlvbiAoYXJyYXlJdGVtLCBpKSB7XG4gICAgICAgIHZhciBjaGlsZEZpZWxkVGVtcGxhdGUgPSBjb25maWcuY2hpbGRGaWVsZFRlbXBsYXRlRm9yVmFsdWUoZmllbGQsIGFycmF5SXRlbSk7XG5cbiAgICAgICAgdmFyIGNoaWxkRmllbGQgPSBjb25maWcuY3JlYXRlQ2hpbGRGaWVsZChmaWVsZCwge1xuICAgICAgICAgIGZpZWxkVGVtcGxhdGU6IGNoaWxkRmllbGRUZW1wbGF0ZSwga2V5OiBpLCBmaWVsZEluZGV4OiBpLCB2YWx1ZTogYXJyYXlJdGVtXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBjaGlsZEZpZWxkO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZUNoaWxkRmllbGRzX09iamVjdDogZnVuY3Rpb24gKGZpZWxkKSB7XG5cbiAgICAgIHJldHVybiBPYmplY3Qua2V5cyhmaWVsZC52YWx1ZSkubWFwKGZ1bmN0aW9uIChrZXksIGkpIHtcbiAgICAgICAgdmFyIGNoaWxkRmllbGRUZW1wbGF0ZSA9IGNvbmZpZy5jaGlsZEZpZWxkVGVtcGxhdGVGb3JWYWx1ZShmaWVsZCwgZmllbGQudmFsdWVba2V5XSk7XG5cbiAgICAgICAgdmFyIGNoaWxkRmllbGQgPSBjb25maWcuY3JlYXRlQ2hpbGRGaWVsZChmaWVsZCwge1xuICAgICAgICAgIGZpZWxkVGVtcGxhdGU6IGNoaWxkRmllbGRUZW1wbGF0ZSwga2V5OiBrZXksIGZpZWxkSW5kZXg6IGksIHZhbHVlOiBmaWVsZC52YWx1ZVtrZXldXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBjaGlsZEZpZWxkO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8vIENoZWNrIGlmIHRoZXJlIGlzIGEgZmFjdG9yeSBmb3IgdGhlIG5hbWUuXG4gICAgaGFzRWxlbWVudEZhY3Rvcnk6IGZ1bmN0aW9uIChuYW1lKSB7XG5cbiAgICAgIHJldHVybiBjb25maWdbJ2NyZWF0ZUVsZW1lbnRfJyArIG5hbWVdID8gdHJ1ZSA6IGZhbHNlO1xuICAgIH0sXG5cbiAgICAvLyBDcmVhdGUgYW4gZWxlbWVudCBnaXZlbiBhIG5hbWUsIHByb3BzLCBhbmQgY2hpbGRyZW4uXG4gICAgY3JlYXRlRWxlbWVudDogZnVuY3Rpb24gKG5hbWUsIHByb3BzLCBjaGlsZHJlbikge1xuXG4gICAgICBpZiAoIXByb3BzLmNvbmZpZykge1xuICAgICAgICBwcm9wcyA9IF8uZXh0ZW5kKHt9LCBwcm9wcywge2NvbmZpZzogY29uZmlnfSk7XG4gICAgICB9XG5cbiAgICAgIG5hbWUgPSBjb25maWcuZWxlbWVudE5hbWUobmFtZSk7XG5cbiAgICAgIGlmIChjb25maWdbJ2NyZWF0ZUVsZW1lbnRfJyArIG5hbWVdKSB7XG4gICAgICAgIHJldHVybiBjb25maWdbJ2NyZWF0ZUVsZW1lbnRfJyArIG5hbWVdKHByb3BzLCBjaGlsZHJlbik7XG4gICAgICB9XG5cbiAgICAgIGlmIChuYW1lICE9PSAnVW5rbm93bicpIHtcbiAgICAgICAgaWYgKGNvbmZpZy5oYXNFbGVtZW50RmFjdG9yeSgnVW5rbm93bicpKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdVbmtub3duJywgcHJvcHMsIGNoaWxkcmVuKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhY3Rvcnkgbm90IGZvdW5kIGZvcjogJyArIG5hbWUpO1xuICAgIH0sXG5cbiAgICAvLyBDcmVhdGUgYSBmaWVsZCBlbGVtZW50IGdpdmVuIHNvbWUgcHJvcHMuIFVzZSBjb250ZXh0IHRvIGRldGVybWluZSBuYW1lLlxuICAgIGNyZWF0ZUZpZWxkRWxlbWVudDogZnVuY3Rpb24gKHByb3BzKSB7XG5cbiAgICAgIHZhciBuYW1lID0gY29uZmlnLmZpZWxkVHlwZU5hbWUocHJvcHMuZmllbGQpO1xuXG4gICAgICBpZiAoY29uZmlnLmhhc0VsZW1lbnRGYWN0b3J5KG5hbWUpKSB7XG4gICAgICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudChuYW1lLCBwcm9wcyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnVW5rbm93bkZpZWxkJywgcHJvcHMpO1xuICAgIH0sXG5cbiAgICAvLyBSZW5kZXIgdGhlIHJvb3QgZm9ybWF0aWMgY29tcG9uZW50XG4gICAgcmVuZGVyRm9ybWF0aWNDb21wb25lbnQ6IGZ1bmN0aW9uIChjb21wb25lbnQpIHtcblxuICAgICAgdmFyIHByb3BzID0gY29tcG9uZW50LnByb3BzO1xuXG4gICAgICB2YXIgZmllbGQgPSBjb25maWcuY3JlYXRlUm9vdEZpZWxkKHByb3BzKTtcblxuICAgICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6ICdmb3JtYXRpYyd9LFxuICAgICAgICBjb25maWcuY3JlYXRlRmllbGRFbGVtZW50KHtmaWVsZDogZmllbGQsIG9uQ2hhbmdlOiBjb21wb25lbnQub25DaGFuZ2UsIG9uQWN0aW9uOiBjb21wb25lbnQub25BY3Rpb259KVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgLy8gUmVuZGVyIGFueSBjb21wb25lbnQuXG4gICAgcmVuZGVyQ29tcG9uZW50OiBmdW5jdGlvbiAoY29tcG9uZW50KSB7XG5cbiAgICAgIHZhciBuYW1lID0gY29tcG9uZW50LmNvbnN0cnVjdG9yLmRpc3BsYXlOYW1lO1xuXG4gICAgICBpZiAoY29uZmlnWydyZW5kZXJDb21wb25lbnRfJyArIG5hbWVdKSB7XG4gICAgICAgIHJldHVybiBjb25maWdbJ3JlbmRlckNvbXBvbmVudF8nICsgbmFtZV0oY29tcG9uZW50KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNvbXBvbmVudC5yZW5kZXJEZWZhdWx0KCk7XG4gICAgfSxcblxuICAgIC8vIFJlbmRlciBmaWVsZCBjb21wb25lbnRzLlxuICAgIHJlbmRlckZpZWxkQ29tcG9uZW50OiBmdW5jdGlvbiAoY29tcG9uZW50KSB7XG5cbiAgICAgIHJldHVybiBjb25maWcucmVuZGVyQ29tcG9uZW50KGNvbXBvbmVudCk7XG4gICAgfSxcblxuICAgIC8vIE5vcm1hbGl6ZSBhbiBlbGVtZW50IG5hbWUuXG4gICAgZWxlbWVudE5hbWU6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICByZXR1cm4gdXRpbHMuZGFzaFRvUGFzY2FsKG5hbWUpO1xuICAgIH0sXG5cbiAgICAvLyBUeXBlIGFsaWFzZXMuXG5cbiAgICBhbGlhc19EaWN0OiAnT2JqZWN0JyxcblxuICAgIGFsaWFzX0Jvb2w6ICdCb29sZWFuJyxcblxuICAgIGFsaWFzX1ByZXR0eVRleHRhcmVhOiAnUHJldHR5VGV4dCcsXG5cbiAgICBhbGlhc19TaW5nbGVMaW5lU3RyaW5nOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSkge1xuICAgICAgaWYgKGZpZWxkVGVtcGxhdGUucmVwbGFjZUNob2ljZXMpIHtcbiAgICAgICAgcmV0dXJuICdQcmV0dHlUZXh0JztcbiAgICAgIH0gZWxzZSBpZiAoZmllbGRUZW1wbGF0ZS5jaG9pY2VzKSB7XG4gICAgICAgIHJldHVybiAnU2VsZWN0JztcbiAgICAgIH1cbiAgICAgIHJldHVybiAnU2luZ2xlTGluZVN0cmluZyc7XG4gICAgfSxcblxuICAgIGFsaWFzX1N0cmluZzogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcblxuICAgICAgaWYgKGZpZWxkVGVtcGxhdGUucmVwbGFjZUNob2ljZXMpIHtcbiAgICAgICAgcmV0dXJuICdQcmV0dHlUZXh0JztcbiAgICAgIH0gZWxzZSBpZiAoZmllbGRUZW1wbGF0ZS5jaG9pY2VzKSB7XG4gICAgICAgIHJldHVybiAnU2VsZWN0JztcbiAgICAgIH0gZWxzZSBpZiAoY29uZmlnLmZpZWxkVGVtcGxhdGVJc1NpbmdsZUxpbmUoZmllbGRUZW1wbGF0ZSkpIHtcbiAgICAgICAgcmV0dXJuICdTaW5nbGVMaW5lU3RyaW5nJztcbiAgICAgIH1cbiAgICAgIHJldHVybiAnU3RyaW5nJztcbiAgICB9LFxuXG4gICAgYWxpYXNfVGV4dDogZGVsZWdhdGVUbygnYWxpYXNfU3RyaW5nJyksXG5cbiAgICBhbGlhc19Vbmljb2RlOiBkZWxlZ2F0ZVRvKCdhbGlhc19TaW5nbGVMaW5lU3RyaW5nJyksXG5cbiAgICBhbGlhc19TdHI6IGRlbGVnYXRlVG8oJ2FsaWFzX1NpbmdsZUxpbmVTdHJpbmcnKSxcblxuICAgIGFsaWFzX0xpc3Q6ICdBcnJheScsXG5cbiAgICBhbGlhc19DaGVja2JveExpc3Q6ICdDaGVja2JveEFycmF5JyxcblxuICAgIGFsaWFzX0ZpZWxkc2V0OiAnRmllbGRzJyxcblxuICAgIGFsaWFzX0NoZWNrYm94OiAnQ2hlY2tib3hCb29sZWFuJyxcblxuICAgIC8vIEZpZWxkIGZhY3RvcnlcblxuICAgIC8vIEdpdmVuIGEgZmllbGQsIGV4cGFuZCBhbGwgY2hpbGQgZmllbGRzIHJlY3Vyc2l2ZWx5IHRvIGdldCB0aGUgZGVmYXVsdFxuICAgIC8vIHZhbHVlcyBvZiBhbGwgZmllbGRzLlxuICAgIGluZmxhdGVGaWVsZFZhbHVlOiBmdW5jdGlvbiAoZmllbGQsIGZpZWxkSGFuZGxlcikge1xuXG4gICAgICBpZiAoZmllbGRIYW5kbGVyKSB7XG4gICAgICAgIHZhciBzdG9wID0gZmllbGRIYW5kbGVyKGZpZWxkKTtcbiAgICAgICAgaWYgKHN0b3AgPT09IGZhbHNlKSB7XG4gICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoY29uZmlnLmZpZWxkSGFzVmFsdWVDaGlsZHJlbihmaWVsZCkpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gXy5jbG9uZShmaWVsZC52YWx1ZSk7XG4gICAgICAgIHZhciBjaGlsZEZpZWxkcyA9IGNvbmZpZy5jcmVhdGVDaGlsZEZpZWxkcyhmaWVsZCk7XG4gICAgICAgIGNoaWxkRmllbGRzLmZvckVhY2goZnVuY3Rpb24gKGNoaWxkRmllbGQpIHtcbiAgICAgICAgICBpZiAoY29uZmlnLmlzS2V5KGNoaWxkRmllbGQua2V5KSkge1xuICAgICAgICAgICAgdmFsdWVbY2hpbGRGaWVsZC5rZXldID0gY29uZmlnLmluZmxhdGVGaWVsZFZhbHVlKGNoaWxkRmllbGQsIGZpZWxkSGFuZGxlcik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZpZWxkLnZhbHVlO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBJbml0aWFsaXplIHRoZSByb290IGZpZWxkLlxuICAgIGluaXRSb290RmllbGQ6IGZ1bmN0aW9uICgvKiBmaWVsZCwgcHJvcHMgKi8pIHtcbiAgICB9LFxuXG4gICAgLy8gSW5pdGlhbGl6ZSBldmVyeSBmaWVsZC5cbiAgICBpbml0RmllbGQ6IGZ1bmN0aW9uICgvKiBmaWVsZCAqLykge1xuICAgIH0sXG5cbiAgICAvLyBJZiBhbiBhcnJheSBvZiBmaWVsZCB0ZW1wbGF0ZXMgYXJlIHBhc3NlZCBpbiwgdGhpcyBtZXRob2QgaXMgdXNlZCB0b1xuICAgIC8vIHdyYXAgdGhlIGZpZWxkcyBpbnNpZGUgYSBzaW5nbGUgcm9vdCBmaWVsZCB0ZW1wbGF0ZS5cbiAgICB3cmFwRmllbGRUZW1wbGF0ZXM6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlcykge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ2ZpZWxkcycsXG4gICAgICAgIHBsYWluOiB0cnVlLFxuICAgICAgICBmaWVsZHM6IGZpZWxkVGVtcGxhdGVzXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICAvLyBHaXZlbiB0aGUgcHJvcHMgdGhhdCBhcmUgcGFzc2VkIGluLCBjcmVhdGUgdGhlIHJvb3QgZmllbGQuXG4gICAgY3JlYXRlUm9vdEZpZWxkOiBmdW5jdGlvbiAocHJvcHMpIHtcblxuICAgICAgdmFyIGZpZWxkVGVtcGxhdGUgPSBwcm9wcy5maWVsZFRlbXBsYXRlIHx8IHByb3BzLmZpZWxkVGVtcGxhdGVzIHx8IHByb3BzLmZpZWxkIHx8IHByb3BzLmZpZWxkcztcbiAgICAgIHZhciB2YWx1ZSA9IHByb3BzLnZhbHVlO1xuXG4gICAgICBpZiAoIWZpZWxkVGVtcGxhdGUpIHtcbiAgICAgICAgZmllbGRUZW1wbGF0ZSA9IGNvbmZpZy5jcmVhdGVGaWVsZFRlbXBsYXRlRnJvbVZhbHVlKHZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKF8uaXNBcnJheShmaWVsZFRlbXBsYXRlKSkge1xuICAgICAgICBmaWVsZFRlbXBsYXRlID0gY29uZmlnLndyYXBGaWVsZFRlbXBsYXRlcyhmaWVsZFRlbXBsYXRlKTtcbiAgICAgIH1cblxuICAgICAgdmFyIGZpZWxkID0gXy5leHRlbmQoe30sIGZpZWxkVGVtcGxhdGUsIHtyYXdGaWVsZFRlbXBsYXRlOiBmaWVsZFRlbXBsYXRlfSk7XG4gICAgICBpZiAoY29uZmlnLmhhc1ZhbHVlKGZpZWxkVGVtcGxhdGUsIHZhbHVlKSkge1xuICAgICAgICBmaWVsZC52YWx1ZSA9IGNvbmZpZy5jb2VyY2VWYWx1ZShmaWVsZFRlbXBsYXRlLCB2YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmaWVsZC52YWx1ZSA9IGNvbmZpZy5jcmVhdGVEZWZhdWx0VmFsdWUoZmllbGRUZW1wbGF0ZSk7XG4gICAgICB9XG5cbiAgICAgIGNvbmZpZy5pbml0Um9vdEZpZWxkKGZpZWxkLCBwcm9wcyk7XG4gICAgICBjb25maWcuaW5pdEZpZWxkKGZpZWxkKTtcblxuICAgICAgaWYgKHZhbHVlID09PSBudWxsIHx8IGNvbmZpZy5pc0VtcHR5T2JqZWN0KHZhbHVlKSB8fCBfLmlzVW5kZWZpbmVkKHZhbHVlKSkge1xuICAgICAgICBmaWVsZC52YWx1ZSA9IGNvbmZpZy5pbmZsYXRlRmllbGRWYWx1ZShmaWVsZCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmaWVsZDtcbiAgICB9LFxuXG4gICAgLy8gR2l2ZW4gdGhlIHByb3BzIHRoYXQgYXJlIHBhc3NlZCBpbiwgY3JlYXRlIHRoZSB2YWx1ZSB0aGF0IHdpbGwgYmUgZGlzcGxheWVkXG4gICAgLy8gYnkgYWxsIHRoZSBjb21wb25lbnRzLlxuICAgIGNyZWF0ZVJvb3RWYWx1ZTogZnVuY3Rpb24gKHByb3BzLCBmaWVsZEhhbmRsZXIpIHtcblxuICAgICAgdmFyIGZpZWxkID0gY29uZmlnLmNyZWF0ZVJvb3RGaWVsZChwcm9wcyk7XG5cbiAgICAgIHJldHVybiBjb25maWcuaW5mbGF0ZUZpZWxkVmFsdWUoZmllbGQsIGZpZWxkSGFuZGxlcik7XG4gICAgfSxcblxuICAgIHZhbGlkYXRlUm9vdFZhbHVlOiBmdW5jdGlvbiAocHJvcHMpIHtcblxuICAgICAgdmFyIGVycm9ycyA9IFtdO1xuXG4gICAgICBjb25maWcuY3JlYXRlUm9vdFZhbHVlKHByb3BzLCBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgICAgdmFyIGZpZWxkRXJyb3JzID0gY29uZmlnLmZpZWxkRXJyb3JzKGZpZWxkKTtcbiAgICAgICAgaWYgKGZpZWxkRXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBlcnJvcnMucHVzaCh7XG4gICAgICAgICAgICBwYXRoOiBjb25maWcuZmllbGRWYWx1ZVBhdGgoZmllbGQpLFxuICAgICAgICAgICAgZXJyb3JzOiBmaWVsZEVycm9yc1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGVycm9ycztcbiAgICB9LFxuXG4gICAgaXNWYWxpZFJvb3RWYWx1ZTogZnVuY3Rpb24gKHByb3BzKSB7XG5cbiAgICAgIHZhciBpc1ZhbGlkID0gdHJ1ZTtcblxuICAgICAgY29uZmlnLmNyZWF0ZVJvb3RWYWx1ZShwcm9wcywgZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICAgIGlmIChjb25maWcuZmllbGRFcnJvcnMoZmllbGQpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBpc1ZhbGlkID0gZmFsc2U7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGlzVmFsaWQ7XG4gICAgfSxcblxuICAgIHZhbGlkYXRlRmllbGQ6IGZ1bmN0aW9uIChmaWVsZCwgZXJyb3JzKSB7XG5cbiAgICAgIGlmIChmaWVsZC52YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IGZpZWxkLnZhbHVlID09PSAnJykge1xuICAgICAgICBpZiAoY29uZmlnLmZpZWxkSXNSZXF1aXJlZChmaWVsZCkpIHtcbiAgICAgICAgICBlcnJvcnMucHVzaCh7XG4gICAgICAgICAgICB0eXBlOiAncmVxdWlyZWQnXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgY3NzVHJhbnNpdGlvbldyYXBwZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIENTU1RyYW5zaXRpb25Hcm91cCA9IFJlYWN0LmNyZWF0ZUZhY3RvcnkoUmVhY3QuYWRkb25zLkNTU1RyYW5zaXRpb25Hcm91cCk7XG4gICAgICB2YXIgYXJncyA9IFt7dHJhbnNpdGlvbk5hbWU6ICdyZXZlYWwnfV0uY29uY2F0KEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykpO1xuICAgICAgcmV0dXJuIENTU1RyYW5zaXRpb25Hcm91cC5hcHBseShudWxsLCBhcmdzKTtcbiAgICB9LFxuXG4gICAgLy8gQ3JlYXRlIGR5bmFtaWMgY2hpbGQgZmllbGRzIGZvciBhIGZpZWxkLlxuICAgIGNyZWF0ZUNoaWxkRmllbGRzOiBmdW5jdGlvbiAoZmllbGQpIHtcblxuICAgICAgdmFyIHR5cGVOYW1lID0gY29uZmlnLmZpZWxkVHlwZU5hbWUoZmllbGQpO1xuXG4gICAgICBpZiAoY29uZmlnWydjcmVhdGVDaGlsZEZpZWxkc18nICsgdHlwZU5hbWVdKSB7XG4gICAgICAgIHJldHVybiBjb25maWdbJ2NyZWF0ZUNoaWxkRmllbGRzXycgKyB0eXBlTmFtZV0oZmllbGQpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY29uZmlnLmZpZWxkQ2hpbGRGaWVsZFRlbXBsYXRlcyhmaWVsZCkubWFwKGZ1bmN0aW9uIChjaGlsZEZpZWxkLCBpKSB7XG4gICAgICAgIHJldHVybiBjb25maWcuY3JlYXRlQ2hpbGRGaWVsZChmaWVsZCwge1xuICAgICAgICAgIGZpZWxkVGVtcGxhdGU6IGNoaWxkRmllbGQsIGtleTogY2hpbGRGaWVsZC5rZXksIGZpZWxkSW5kZXg6IGksIHZhbHVlOiBmaWVsZC52YWx1ZVtjaGlsZEZpZWxkLmtleV1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgLy8gQ3JlYXRlIGEgc2luZ2xlIGNoaWxkIGZpZWxkIGZvciBhIHBhcmVudCBmaWVsZC5cbiAgICBjcmVhdGVDaGlsZEZpZWxkOiBmdW5jdGlvbiAocGFyZW50RmllbGQsIG9wdGlvbnMpIHtcblxuICAgICAgdmFyIGNoaWxkVmFsdWUgPSBvcHRpb25zLnZhbHVlO1xuXG4gICAgICB2YXIgY2hpbGRGaWVsZCA9IF8uZXh0ZW5kKHt9LCBvcHRpb25zLmZpZWxkVGVtcGxhdGUsIHtcbiAgICAgICAga2V5OiBvcHRpb25zLmtleSwgcGFyZW50OiBwYXJlbnRGaWVsZCwgZmllbGRJbmRleDogb3B0aW9ucy5maWVsZEluZGV4LFxuICAgICAgICByYXdGaWVsZFRlbXBsYXRlOiBvcHRpb25zLmZpZWxkVGVtcGxhdGVcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoY29uZmlnLmhhc1ZhbHVlKG9wdGlvbnMuZmllbGRUZW1wbGF0ZSwgY2hpbGRWYWx1ZSkpIHtcbiAgICAgICAgY2hpbGRGaWVsZC52YWx1ZSA9IGNvbmZpZy5jb2VyY2VWYWx1ZShvcHRpb25zLmZpZWxkVGVtcGxhdGUsIGNoaWxkVmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2hpbGRGaWVsZC52YWx1ZSA9IGNvbmZpZy5jcmVhdGVEZWZhdWx0VmFsdWUob3B0aW9ucy5maWVsZFRlbXBsYXRlKTtcbiAgICAgIH1cblxuICAgICAgY29uZmlnLmluaXRGaWVsZChjaGlsZEZpZWxkKTtcblxuICAgICAgcmV0dXJuIGNoaWxkRmllbGQ7XG4gICAgfSxcblxuICAgIC8vIENyZWF0ZSBhIHRlbXBvcmFyeSBmaWVsZCBhbmQgZXh0cmFjdCBpdHMgdmFsdWUuXG4gICAgY3JlYXRlTmV3Q2hpbGRGaWVsZFZhbHVlOiBmdW5jdGlvbiAocGFyZW50RmllbGQsIGl0ZW1GaWVsZEluZGV4KSB7XG5cbiAgICAgIHZhciBjaGlsZEZpZWxkVGVtcGxhdGUgPSBjb25maWcuZmllbGRJdGVtRmllbGRUZW1wbGF0ZXMocGFyZW50RmllbGQpW2l0ZW1GaWVsZEluZGV4XTtcblxuICAgICAgdmFyIG5ld1ZhbHVlID0gY29uZmlnLmZpZWxkVGVtcGxhdGVWYWx1ZShjaGlsZEZpZWxkVGVtcGxhdGUpO1xuXG4gICAgICAvLyBKdXN0IGEgcGxhY2Vob2xkZXIga2V5LiBTaG91bGQgbm90IGJlIGltcG9ydGFudC5cbiAgICAgIHZhciBrZXkgPSAnX191bmtub3duX2tleV9fJztcblxuICAgICAgaWYgKF8uaXNBcnJheShwYXJlbnRGaWVsZC52YWx1ZSkpIHtcbiAgICAgICAgLy8gSnVzdCBhIHBsYWNlaG9sZGVyIHBvc2l0aW9uIGZvciBhbiBhcnJheS5cbiAgICAgICAga2V5ID0gcGFyZW50RmllbGQudmFsdWUubGVuZ3RoO1xuICAgICAgfVxuXG4gICAgICAvLyBKdXN0IGEgcGxhY2Vob2xkZXIgZmllbGQgaW5kZXguIFNob3VsZCBub3QgYmUgaW1wb3J0YW50LlxuICAgICAgdmFyIGZpZWxkSW5kZXggPSAwO1xuICAgICAgaWYgKF8uaXNPYmplY3QocGFyZW50RmllbGQudmFsdWUpKSB7XG4gICAgICAgIGZpZWxkSW5kZXggPSBPYmplY3Qua2V5cyhwYXJlbnRGaWVsZC52YWx1ZSkubGVuZ3RoO1xuICAgICAgfVxuXG4gICAgICB2YXIgY2hpbGRGaWVsZCA9IGNvbmZpZy5jcmVhdGVDaGlsZEZpZWxkKHBhcmVudEZpZWxkLCB7XG4gICAgICAgIGZpZWxkVGVtcGxhdGU6IGNoaWxkRmllbGRUZW1wbGF0ZSwga2V5OiBrZXksIGZpZWxkSW5kZXg6IGZpZWxkSW5kZXgsIHZhbHVlOiBuZXdWYWx1ZVxuICAgICAgfSk7XG5cbiAgICAgIG5ld1ZhbHVlID0gY29uZmlnLmluZmxhdGVGaWVsZFZhbHVlKGNoaWxkRmllbGQpO1xuXG4gICAgICByZXR1cm4gbmV3VmFsdWU7XG4gICAgfSxcblxuICAgIC8vIEdpdmVuIGEgdmFsdWUsIGNyZWF0ZSBhIGZpZWxkIHRlbXBsYXRlIGZvciB0aGF0IHZhbHVlLlxuICAgIGNyZWF0ZUZpZWxkVGVtcGxhdGVGcm9tVmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuXG4gICAgICB2YXIgZmllbGQgPSB7XG4gICAgICAgIHR5cGU6ICdqc29uJ1xuICAgICAgfTtcbiAgICAgIGlmIChfLmlzU3RyaW5nKHZhbHVlKSkge1xuICAgICAgICBmaWVsZCA9IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICB9O1xuICAgICAgfSBlbHNlIGlmIChfLmlzTnVtYmVyKHZhbHVlKSkge1xuICAgICAgICBmaWVsZCA9IHtcbiAgICAgICAgICB0eXBlOiAnbnVtYmVyJ1xuICAgICAgICB9O1xuICAgICAgfSBlbHNlIGlmIChfLmlzQm9vbGVhbih2YWx1ZSkpIHtcbiAgICAgICAgZmllbGQgPSB7XG4gICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICAgIH07XG4gICAgICB9IGVsc2UgaWYgKF8uaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgdmFyIGFycmF5SXRlbUZpZWxkcyA9IHZhbHVlLm1hcChmdW5jdGlvbiAoY2hpbGRWYWx1ZSwgaSkge1xuICAgICAgICAgIHZhciBjaGlsZEZpZWxkID0gY29uZmlnLmNyZWF0ZUZpZWxkVGVtcGxhdGVGcm9tVmFsdWUoY2hpbGRWYWx1ZSk7XG4gICAgICAgICAgY2hpbGRGaWVsZC5rZXkgPSBpO1xuICAgICAgICAgIHJldHVybiBjaGlsZEZpZWxkO1xuICAgICAgICB9KTtcbiAgICAgICAgZmllbGQgPSB7XG4gICAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgICBmaWVsZHM6IGFycmF5SXRlbUZpZWxkc1xuICAgICAgICB9O1xuICAgICAgfSBlbHNlIGlmIChfLmlzT2JqZWN0KHZhbHVlKSkge1xuICAgICAgICB2YXIgb2JqZWN0SXRlbUZpZWxkcyA9IE9iamVjdC5rZXlzKHZhbHVlKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgIHZhciBjaGlsZEZpZWxkID0gY29uZmlnLmNyZWF0ZUZpZWxkVGVtcGxhdGVGcm9tVmFsdWUodmFsdWVba2V5XSk7XG4gICAgICAgICAgY2hpbGRGaWVsZC5rZXkgPSBrZXk7XG4gICAgICAgICAgY2hpbGRGaWVsZC5sYWJlbCA9IGNvbmZpZy5odW1hbml6ZShrZXkpO1xuICAgICAgICAgIHJldHVybiBjaGlsZEZpZWxkO1xuICAgICAgICB9KTtcbiAgICAgICAgZmllbGQgPSB7XG4gICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgZmllbGRzOiBvYmplY3RJdGVtRmllbGRzXG4gICAgICAgIH07XG4gICAgICB9IGVsc2UgaWYgKF8uaXNOdWxsKHZhbHVlKSkge1xuICAgICAgICBmaWVsZCA9IHtcbiAgICAgICAgICB0eXBlOiAnanNvbidcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmaWVsZDtcbiAgICB9LFxuXG4gICAgLy8gRGVmYXVsdCB2YWx1ZSBmYWN0b3J5XG5cbiAgICBjcmVhdGVEZWZhdWx0VmFsdWU6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG5cbiAgICAgIHZhciBkZWZhdWx0VmFsdWUgPSBjb25maWcuZmllbGRUZW1wbGF0ZURlZmF1bHRWYWx1ZShmaWVsZFRlbXBsYXRlKTtcblxuICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKGRlZmF1bHRWYWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIHV0aWxzLmRlZXBDb3B5KGRlZmF1bHRWYWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIHZhciB0eXBlTmFtZSA9IGNvbmZpZy5maWVsZFR5cGVOYW1lKGZpZWxkVGVtcGxhdGUpO1xuXG4gICAgICBpZiAoY29uZmlnWydjcmVhdGVEZWZhdWx0VmFsdWVfJyArIHR5cGVOYW1lXSkge1xuICAgICAgICByZXR1cm4gY29uZmlnWydjcmVhdGVEZWZhdWx0VmFsdWVfJyArIHR5cGVOYW1lXShmaWVsZFRlbXBsYXRlKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuICcnO1xuICAgIH0sXG5cbiAgICAvLyBGaWVsZCBoZWxwZXJzXG5cbiAgICAvLyBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBcImV4aXN0c1wiLlxuICAgIGhhc1ZhbHVlOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSwgdmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZSAhPT0gbnVsbCAmJiAhXy5pc1VuZGVmaW5lZCh2YWx1ZSk7XG4gICAgfSxcblxuICAgIC8vIENvZXJjZSBhIHZhbHVlIHRvIHZhbHVlIGFwcHJvcHJpYXRlIGZvciBhIGZpZWxkLlxuICAgIGNvZXJjZVZhbHVlOiBmdW5jdGlvbiAoZmllbGQsIHZhbHVlKSB7XG5cbiAgICAgIHZhciB0eXBlTmFtZSA9IGNvbmZpZy5maWVsZFR5cGVOYW1lKGZpZWxkKTtcblxuICAgICAgaWYgKGNvbmZpZ1snY29lcmNlVmFsdWVfJyArIHR5cGVOYW1lXSkge1xuICAgICAgICByZXR1cm4gY29uZmlnWydjb2VyY2VWYWx1ZV8nICsgdHlwZU5hbWVdKGZpZWxkLCB2YWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9LFxuXG4gICAgLy8gR2l2ZW4gYSBmaWVsZCBhbmQgYSBjaGlsZCB2YWx1ZSwgZmluZCB0aGUgYXBwcm9wcmlhdGUgZmllbGQgdGVtcGxhdGUgZm9yXG4gICAgLy8gdGhhdCBjaGlsZCB2YWx1ZS5cbiAgICBjaGlsZEZpZWxkVGVtcGxhdGVGb3JWYWx1ZTogZnVuY3Rpb24gKGZpZWxkLCBjaGlsZFZhbHVlKSB7XG5cbiAgICAgIHZhciBmaWVsZFRlbXBsYXRlO1xuXG4gICAgICB2YXIgZmllbGRUZW1wbGF0ZXMgPSBjb25maWcuZmllbGRJdGVtRmllbGRUZW1wbGF0ZXMoZmllbGQpO1xuXG4gICAgICBmaWVsZFRlbXBsYXRlID0gXy5maW5kKGZpZWxkVGVtcGxhdGVzLCBmdW5jdGlvbiAoaXRlbUZpZWxkVGVtcGxhdGUpIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZy5tYXRjaGVzRmllbGRUZW1wbGF0ZVRvVmFsdWUoaXRlbUZpZWxkVGVtcGxhdGUsIGNoaWxkVmFsdWUpO1xuICAgICAgfSk7XG5cbiAgICAgIGlmIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgICAgIHJldHVybiBmaWVsZFRlbXBsYXRlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVGaWVsZFRlbXBsYXRlRnJvbVZhbHVlKGNoaWxkVmFsdWUpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIG1hdGNoIGZvciBhIGZpZWxkIHRlbXBsYXRlLlxuICAgIG1hdGNoZXNGaWVsZFRlbXBsYXRlVG9WYWx1ZTogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUsIHZhbHVlKSB7XG4gICAgICB2YXIgbWF0Y2ggPSBmaWVsZFRlbXBsYXRlLm1hdGNoO1xuICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBfLmV2ZXJ5KE9iamVjdC5rZXlzKG1hdGNoKSwgZnVuY3Rpb24gKGtleSkge1xuICAgICAgICByZXR1cm4gXy5pc0VxdWFsKG1hdGNoW2tleV0sIHZhbHVlW2tleV0pO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8vIEZpZWxkIHRlbXBsYXRlIGhlbHBlcnNcblxuICAgIC8vIE5vcm1hbGl6ZWQgKFBhc2NhbENhc2UpIHR5cGUgbmFtZSBmb3IgYSBmaWVsZC5cbiAgICBmaWVsZFRlbXBsYXRlVHlwZU5hbWU6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG5cbiAgICAgIHZhciB0eXBlTmFtZSA9IHV0aWxzLmRhc2hUb1Bhc2NhbChmaWVsZFRlbXBsYXRlLnR5cGUgfHwgJ3VuZGVmaW5lZCcpO1xuXG4gICAgICB2YXIgYWxpYXMgPSBjb25maWdbJ2FsaWFzXycgKyB0eXBlTmFtZV07XG5cbiAgICAgIGlmIChhbGlhcykge1xuICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKGFsaWFzKSkge1xuICAgICAgICAgIHJldHVybiBhbGlhcy5jYWxsKGNvbmZpZywgZmllbGRUZW1wbGF0ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGFsaWFzO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChmaWVsZFRlbXBsYXRlLmxpc3QpIHtcbiAgICAgICAgdHlwZU5hbWUgPSAnQXJyYXknO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHlwZU5hbWU7XG4gICAgfSxcblxuICAgIC8vIERlZmF1bHQgdmFsdWUgZm9yIGEgZmllbGQgdGVtcGxhdGUuXG4gICAgZmllbGRUZW1wbGF0ZURlZmF1bHRWYWx1ZTogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcblxuICAgICAgcmV0dXJuIGZpZWxkVGVtcGxhdGUuZGVmYXVsdDtcbiAgICB9LFxuXG4gICAgLy8gVmFsdWUgZm9yIGEgZmllbGQgdGVtcGxhdGUuIFVzZWQgdG8gZGV0ZXJtaW5lIHRoZSB2YWx1ZSBvZiBhIG5ldyBjaGlsZFxuICAgIC8vIGZpZWxkLlxuICAgIGZpZWxkVGVtcGxhdGVWYWx1ZTogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcblxuICAgICAgLy8gVGhpcyBsb2dpYyBtaWdodCBiZSBicml0dGxlLlxuXG4gICAgICB2YXIgZGVmYXVsdFZhbHVlID0gY29uZmlnLmZpZWxkVGVtcGxhdGVEZWZhdWx0VmFsdWUoZmllbGRUZW1wbGF0ZSk7XG5cbiAgICAgIHZhciBtYXRjaCA9IGNvbmZpZy5maWVsZFRlbXBsYXRlTWF0Y2goZmllbGRUZW1wbGF0ZSk7XG5cbiAgICAgIHZhciB2YWx1ZTtcblxuICAgICAgaWYgKF8uaXNVbmRlZmluZWQoZGVmYXVsdFZhbHVlKSAmJiAhXy5pc1VuZGVmaW5lZChtYXRjaCkpIHtcbiAgICAgICAgcmV0dXJuIHV0aWxzLmRlZXBDb3B5KG1hdGNoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBjb25maWcuY3JlYXRlRGVmYXVsdFZhbHVlKGZpZWxkVGVtcGxhdGUpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcblxuICAgIC8vIE1hdGNoIHJ1bGUgZm9yIGEgZmllbGQgdGVtcGxhdGUuXG4gICAgZmllbGRUZW1wbGF0ZU1hdGNoOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSkge1xuICAgICAgcmV0dXJuIGZpZWxkVGVtcGxhdGUubWF0Y2g7XG4gICAgfSxcblxuICAgIC8vIERldGVybWluZSBpZiBhIGZpZWxkIHRlbXBsYXRlIGhhcyBhIHNpbmdsZS1saW5lIHZhbHVlLlxuICAgIGZpZWxkVGVtcGxhdGVJc1NpbmdsZUxpbmU6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgICByZXR1cm4gZmllbGRUZW1wbGF0ZS5pc1NpbmdsZUxpbmUgfHwgZmllbGRUZW1wbGF0ZS5pc19zaW5nbGVfbGluZSB8fFxuICAgICAgICAgICAgICBmaWVsZFRlbXBsYXRlLnR5cGUgPT09ICdzaW5nbGUtbGluZS1zdHJpbmcnIHx8IGZpZWxkVGVtcGxhdGUudHlwZSA9PT0gJ1NpbmdsZUxpbmVTdHJpbmcnO1xuICAgIH0sXG5cbiAgICAvLyBGaWVsZCBoZWxwZXJzXG5cbiAgICAvLyBHZXQgYW4gYXJyYXkgb2Yga2V5cyByZXByZXNlbnRpbmcgdGhlIHBhdGggdG8gYSB2YWx1ZS5cbiAgICBmaWVsZFZhbHVlUGF0aDogZnVuY3Rpb24gKGZpZWxkKSB7XG5cbiAgICAgIHZhciBwYXJlbnRQYXRoID0gW107XG5cbiAgICAgIGlmIChmaWVsZC5wYXJlbnQpIHtcbiAgICAgICAgcGFyZW50UGF0aCA9IGNvbmZpZy5maWVsZFZhbHVlUGF0aChmaWVsZC5wYXJlbnQpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcGFyZW50UGF0aC5jb25jYXQoZmllbGQua2V5KS5maWx0ZXIoZnVuY3Rpb24gKGtleSkge1xuICAgICAgICByZXR1cm4gIV8uaXNVbmRlZmluZWQoa2V5KSAmJiBrZXkgIT09ICcnO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8vIENsb25lIGEgZmllbGQgd2l0aCBhIGRpZmZlcmVudCB2YWx1ZS5cbiAgICBmaWVsZFdpdGhWYWx1ZTogZnVuY3Rpb24gKGZpZWxkLCB2YWx1ZSkge1xuICAgICAgcmV0dXJuIF8uZXh0ZW5kKHt9LCBmaWVsZCwge3ZhbHVlOiB2YWx1ZX0pO1xuICAgIH0sXG5cbiAgICBmaWVsZFR5cGVOYW1lOiBkZWxlZ2F0ZVRvKCdmaWVsZFRlbXBsYXRlVHlwZU5hbWUnKSxcblxuICAgIC8vIEZpZWxkIGlzIGxvYWRpbmcgY2hvaWNlcy5cbiAgICBmaWVsZElzTG9hZGluZzogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICByZXR1cm4gZmllbGQuaXNMb2FkaW5nO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgdGhlIGNob2ljZXMgZm9yIGEgZHJvcGRvd24gZmllbGQuXG4gICAgZmllbGRDaG9pY2VzOiBmdW5jdGlvbiAoZmllbGQpIHtcblxuICAgICAgcmV0dXJuIGNvbmZpZy5ub3JtYWxpemVDaG9pY2VzKGZpZWxkLmNob2ljZXMpO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgdGhlIGNob2ljZXMgZm9yIGEgcHJldHR5IGRyb3Bkb3duIGZpZWxkLlxuICAgIGZpZWxkUHJldHR5Q2hvaWNlczogZnVuY3Rpb24gKGZpZWxkKSB7XG5cbiAgICAgIHJldHVybiBjb25maWcubm9ybWFsaXplUHJldHR5Q2hvaWNlcyhmaWVsZC5jaG9pY2VzKTtcbiAgICB9LFxuXG4gICAgLy8gR2V0IGEgc2V0IG9mIGJvb2xlYW4gY2hvaWNlcyBmb3IgYSBmaWVsZC5cbiAgICBmaWVsZEJvb2xlYW5DaG9pY2VzOiBmdW5jdGlvbiAoZmllbGQpIHtcblxuICAgICAgdmFyIGNob2ljZXMgPSBjb25maWcuZmllbGRDaG9pY2VzKGZpZWxkKTtcblxuICAgICAgaWYgKGNob2ljZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBbe1xuICAgICAgICAgIGxhYmVsOiAneWVzJyxcbiAgICAgICAgICB2YWx1ZTogdHJ1ZVxuICAgICAgICB9LCB7XG4gICAgICAgICAgbGFiZWw6ICdubycsXG4gICAgICAgICAgdmFsdWU6IGZhbHNlXG4gICAgICAgIH1dO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY2hvaWNlcy5tYXAoZnVuY3Rpb24gKGNob2ljZSkge1xuICAgICAgICBpZiAoXy5pc0Jvb2xlYW4oY2hvaWNlLnZhbHVlKSkge1xuICAgICAgICAgIHJldHVybiBjaG9pY2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF8uZXh0ZW5kKHt9LCBjaG9pY2UsIHtcbiAgICAgICAgICB2YWx1ZTogY29uZmlnLmNvZXJjZVZhbHVlVG9Cb29sZWFuKGNob2ljZS52YWx1ZSlcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgLy8gR2V0IGEgc2V0IG9mIHJlcGxhY2VtZW50IGNob2ljZXMgZm9yIGEgZmllbGQuXG4gICAgZmllbGRSZXBsYWNlQ2hvaWNlczogZnVuY3Rpb24gKGZpZWxkKSB7XG5cbiAgICAgIHJldHVybiBjb25maWcubm9ybWFsaXplQ2hvaWNlcyhmaWVsZC5yZXBsYWNlQ2hvaWNlcyk7XG4gICAgfSxcblxuICAgIC8vIFRoZSBhY3RpdmUgc2VsZWN0ZWQgY2hvaWNlIGNvdWxkIGJlIHVuYXZhaWxhYmxlIGluIHRoZSBjdXJyZW50IGxpc3Qgb2ZcbiAgICAvLyBjaG9pY2VzLiBUaGlzIHByb3ZpZGVzIHRoZSBzZWxlY3RlZCBjaG9pY2UgaW4gdGhhdCBjYXNlLlxuICAgIGZpZWxkU2VsZWN0ZWRDaG9pY2U6IGZ1bmN0aW9uIChmaWVsZCkge1xuXG4gICAgICByZXR1cm4gZmllbGQuc2VsZWN0ZWRDaG9pY2UgfHwgbnVsbDtcbiAgICB9LFxuXG4gICAgLy8gVGhlIGFjdGl2ZSByZXBsYWNlIGxhYmVscyBjb3VsZCBiZSB1bmF2aWxhYmxlIGluIHRoZSBjdXJyZW50IGxpc3Qgb2ZcbiAgICAvLyByZXBsYWNlIGNob2ljZXMuIFRoaXMgcHJvdmlkZXMgdGhlIGN1cnJlbnRseSB1c2VkIHJlcGxhY2UgbGFiZWxzIGluXG4gICAgLy8gdGhhdCBjYXNlLlxuICAgIGZpZWxkU2VsZWN0ZWRSZXBsYWNlQ2hvaWNlczogZnVuY3Rpb24gKGZpZWxkKSB7XG5cbiAgICAgIHJldHVybiBjb25maWcubm9ybWFsaXplQ2hvaWNlcyhmaWVsZC5zZWxlY3RlZFJlcGxhY2VDaG9pY2VzKTtcbiAgICB9LFxuXG4gICAgLy8gR2V0IGEgbGFiZWwgZm9yIGEgZmllbGQuXG4gICAgZmllbGRMYWJlbDogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICByZXR1cm4gZmllbGQubGFiZWw7XG4gICAgfSxcblxuICAgIC8vIEdldCBhIHBsYWNlaG9sZGVyIChqdXN0IGEgZGVmYXVsdCBkaXNwbGF5IHZhbHVlLCBub3QgYSBkZWZhdWx0IHZhbHVlKSBmb3IgYSBmaWVsZC5cbiAgICBmaWVsZFBsYWNlaG9sZGVyOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgIHJldHVybiBmaWVsZC5wbGFjZWhvbGRlcjtcbiAgICB9LFxuXG4gICAgLy8gR2V0IHRoZSBoZWxwIHRleHQgZm9yIGEgZmllbGQuXG4gICAgZmllbGRIZWxwVGV4dDogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICByZXR1cm4gZmllbGQuaGVscF90ZXh0X2h0bWwgfHwgZmllbGQuaGVscF90ZXh0IHx8IGZpZWxkLmhlbHBUZXh0IHx8IGZpZWxkLmhlbHBUZXh0SHRtbDtcbiAgICB9LFxuXG4gICAgLy8gR2V0IHdoZXRoZXIgb3Igbm90IGEgZmllbGQgaXMgcmVxdWlyZWQuXG4gICAgZmllbGRJc1JlcXVpcmVkOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgIHJldHVybiBmaWVsZC5yZXF1aXJlZCA/IHRydWUgOiBmYWxzZTtcbiAgICB9LFxuXG4gICAgLy8gRGV0ZXJtaW5lIGlmIHZhbHVlIGZvciB0aGlzIGZpZWxkIGlzIG5vdCBhIGxlYWYgdmFsdWUuXG4gICAgZmllbGRIYXNWYWx1ZUNoaWxkcmVuOiBmdW5jdGlvbiAoZmllbGQpIHtcblxuICAgICAgdmFyIGRlZmF1bHRWYWx1ZSA9IGNvbmZpZy5jcmVhdGVEZWZhdWx0VmFsdWUoZmllbGQpO1xuXG4gICAgICBpZiAoXy5pc09iamVjdChkZWZhdWx0VmFsdWUpIHx8IF8uaXNBcnJheShkZWZhdWx0VmFsdWUpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIC8vIEdldCB0aGUgY2hpbGQgZmllbGQgdGVtcGxhdGVzIGZvciB0aGlzIGZpZWxkLlxuICAgIGZpZWxkQ2hpbGRGaWVsZFRlbXBsYXRlczogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICByZXR1cm4gZmllbGQuZmllbGRzIHx8IFtdO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgdGhlIGZpZWxkIHRlbXBsYXRlcyBmb3IgZWFjaCBpdGVtIG9mIHRoaXMgZmllbGQuIChGb3IgZHluYW1pYyBjaGlsZHJlbixcbiAgICAvLyBsaWtlIGFycmF5cy4pXG4gICAgZmllbGRJdGVtRmllbGRUZW1wbGF0ZXM6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgaWYgKCFmaWVsZC5pdGVtRmllbGRzKSB7XG4gICAgICAgIHJldHVybiBbe3R5cGU6ICd0ZXh0J31dO1xuICAgICAgfVxuICAgICAgaWYgKCFfLmlzQXJyYXkoZmllbGQuaXRlbUZpZWxkcykpIHtcbiAgICAgICAgcmV0dXJuIFtmaWVsZC5pdGVtRmllbGRzXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmaWVsZC5pdGVtRmllbGRzO1xuICAgIH0sXG5cbiAgICBmaWVsZElzU2luZ2xlTGluZTogZGVsZWdhdGVUbygnZmllbGRUZW1wbGF0ZUlzU2luZ2xlTGluZScpLFxuXG4gICAgLy8gR2V0IHdoZXRoZXIgb3Igbm90IGEgZmllbGQgaXMgY29sbGFwc2VkLlxuICAgIGZpZWxkSXNDb2xsYXBzZWQ6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgcmV0dXJuIGZpZWxkLmNvbGxhcHNlZCA/IHRydWUgOiBmYWxzZTtcbiAgICB9LFxuXG4gICAgLy8gR2V0IHdoZXRlciBvciBub3QgYSBmaWVsZCBjYW4gYmUgY29sbGFwc2VkLlxuICAgIGZpZWxkSXNDb2xsYXBzaWJsZTogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICByZXR1cm4gZmllbGQuY29sbGFwc2libGUgfHwgIV8uaXNVbmRlZmluZWQoZmllbGQuY29sbGFwc2VkKTtcbiAgICB9LFxuXG4gICAgLy8gR2V0IHRoZSBudW1iZXIgb2Ygcm93cyBmb3IgYSBmaWVsZC5cbiAgICBmaWVsZFJvd3M6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgcmV0dXJuIGZpZWxkLnJvd3M7XG4gICAgfSxcblxuICAgIGZpZWxkRXJyb3JzOiBmdW5jdGlvbiAoZmllbGQpIHtcblxuICAgICAgdmFyIGVycm9ycyA9IFtdO1xuXG4gICAgICBpZiAoY29uZmlnLmlzS2V5KGZpZWxkLmtleSkpIHtcbiAgICAgICAgY29uZmlnLnZhbGlkYXRlRmllbGQoZmllbGQsIGVycm9ycyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBlcnJvcnM7XG4gICAgfSxcblxuICAgIGZpZWxkTWF0Y2g6IGRlbGVnYXRlVG8oJ2ZpZWxkVGVtcGxhdGVNYXRjaCcpLFxuXG4gICAgLy8gT3RoZXIgaGVscGVyc1xuXG4gICAgLy8gQ29udmVydCBhIGtleSB0byBhIG5pY2UgaHVtYW4tcmVhZGFibGUgdmVyc2lvbi5cbiAgICBodW1hbml6ZTogZnVuY3Rpb24ocHJvcGVydHkpIHtcbiAgICAgIHByb3BlcnR5ID0gcHJvcGVydHkucmVwbGFjZSgvXFx7XFx7L2csICcnKTtcbiAgICAgIHByb3BlcnR5ID0gcHJvcGVydHkucmVwbGFjZSgvXFx9XFx9L2csICcnKTtcbiAgICAgIHJldHVybiBwcm9wZXJ0eS5yZXBsYWNlKC9fL2csICcgJylcbiAgICAgIC5yZXBsYWNlKC8oXFx3KykvZywgZnVuY3Rpb24obWF0Y2gpIHtcbiAgICAgICAgcmV0dXJuIG1hdGNoLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgbWF0Y2guc2xpY2UoMSk7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgLy8gTm9ybWFsaXplIHNvbWUgY2hvaWNlcyBmb3IgYSBkcm9wLWRvd24uXG4gICAgbm9ybWFsaXplQ2hvaWNlczogZnVuY3Rpb24gKGNob2ljZXMpIHtcblxuICAgICAgaWYgKCFjaG9pY2VzKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH1cblxuICAgICAgLy8gQ29udmVydCBjb21tYSBzZXBhcmF0ZWQgc3RyaW5nIHRvIGFycmF5IG9mIHN0cmluZ3MuXG4gICAgICBpZiAoXy5pc1N0cmluZyhjaG9pY2VzKSkge1xuICAgICAgICBjaG9pY2VzID0gY2hvaWNlcy5zcGxpdCgnLCcpO1xuICAgICAgfVxuXG4gICAgICAvLyBDb252ZXJ0IG9iamVjdCB0byBhcnJheSBvZiBvYmplY3RzIHdpdGggYHZhbHVlYCBhbmQgYGxhYmVsYCBwcm9wZXJ0aWVzLlxuICAgICAgaWYgKCFfLmlzQXJyYXkoY2hvaWNlcykgJiYgXy5pc09iamVjdChjaG9pY2VzKSkge1xuICAgICAgICBjaG9pY2VzID0gT2JqZWN0LmtleXMoY2hvaWNlcykubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdmFsdWU6IGtleSxcbiAgICAgICAgICAgIGxhYmVsOiBjaG9pY2VzW2tleV1cbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gQ29weSB0aGUgYXJyYXkgb2YgY2hvaWNlcyBzbyB3ZSBjYW4gbWFuaXB1bGF0ZSB0aGVtLlxuICAgICAgY2hvaWNlcyA9IGNob2ljZXMuc2xpY2UoMCk7XG5cbiAgICAgIC8vIEFycmF5IG9mIGNob2ljZSBhcnJheXMgc2hvdWxkIGJlIGZsYXR0ZW5lZC5cbiAgICAgIGNob2ljZXMgPSBfLmZsYXR0ZW4oY2hvaWNlcyk7XG5cbiAgICAgIGNob2ljZXMuZm9yRWFjaChmdW5jdGlvbiAoY2hvaWNlLCBpKSB7XG4gICAgICAgIC8vIENvbnZlcnQgYW55IHN0cmluZyBjaG9pY2VzIHRvIG9iamVjdHMgd2l0aCBgdmFsdWVgIGFuZCBgbGFiZWxgXG4gICAgICAgIC8vIHByb3BlcnRpZXMuXG4gICAgICAgIGlmIChfLmlzU3RyaW5nKGNob2ljZSkpIHtcbiAgICAgICAgICBjaG9pY2VzW2ldID0ge1xuICAgICAgICAgICAgdmFsdWU6IGNob2ljZSxcbiAgICAgICAgICAgIGxhYmVsOiBjb25maWcuaHVtYW5pemUoY2hvaWNlKVxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFjaG9pY2VzW2ldLmxhYmVsKSB7XG4gICAgICAgICAgY2hvaWNlc1tpXS5sYWJlbCA9IGNvbmZpZy5odW1hbml6ZShjaG9pY2VzW2ldLnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBjaG9pY2VzO1xuICAgIH0sXG5cbiAgICAvLyBOb3JtYWxpemUgY2hvaWNlcyBmb3IgYSBwcmV0dHkgZHJvcCBkb3duLCB3aXRoICdzYW1wbGUnIHZhbHVlc1xuICAgIG5vcm1hbGl6ZVByZXR0eUNob2ljZXM6IGZ1bmN0aW9uIChjaG9pY2VzKSB7XG4gICAgICBpZiAoIV8uaXNBcnJheShjaG9pY2VzKSAmJiBfLmlzT2JqZWN0KGNob2ljZXMpKSB7XG4gICAgICAgIGNob2ljZXMgPSBPYmplY3Qua2V5cyhjaG9pY2VzKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWx1ZToga2V5LFxuICAgICAgICAgICAgbGFiZWw6IGNob2ljZXNba2V5XSxcbiAgICAgICAgICAgIHNhbXBsZToga2V5XG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjb25maWcubm9ybWFsaXplQ2hvaWNlcyhjaG9pY2VzKTtcbiAgICB9LFxuXG4gICAgLy8gQ29lcmNlIGEgdmFsdWUgdG8gYSBib29sZWFuXG4gICAgY29lcmNlVmFsdWVUb0Jvb2xlYW46IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgaWYgKCFfLmlzU3RyaW5nKHZhbHVlKSkge1xuICAgICAgICAvLyBKdXN0IHVzZSB0aGUgZGVmYXVsdCB0cnV0aGluZXNzLlxuICAgICAgICByZXR1cm4gdmFsdWUgPyB0cnVlIDogZmFsc2U7XG4gICAgICB9XG4gICAgICB2YWx1ZSA9IHZhbHVlLnRvTG93ZXJDYXNlKCk7XG4gICAgICBpZiAodmFsdWUgPT09ICcnIHx8IHZhbHVlID09PSAnbm8nIHx8IHZhbHVlID09PSAnb2ZmJyB8fCB2YWx1ZSA9PT0gJ2ZhbHNlJykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuXG4gICAgLy8gRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSB2YWxpZCBrZXkuXG4gICAgaXNLZXk6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHJldHVybiAoXy5pc051bWJlcihrZXkpICYmIGtleSA+PSAwKSB8fCAoXy5pc1N0cmluZyhrZXkpICYmIGtleSAhPT0gJycpO1xuICAgIH0sXG5cbiAgICAvLyBGYXN0IHdheSB0byBjaGVjayBmb3IgZW1wdHkgb2JqZWN0LlxuICAgIGlzRW1wdHlPYmplY3Q6IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgIGZvcih2YXIga2V5IGluIG9iaikge1xuICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cbiAgICBhY3Rpb25DaG9pY2VMYWJlbDogZnVuY3Rpb24gKGFjdGlvbikge1xuICAgICAgcmV0dXJuIHV0aWxzLmNhcGl0YWxpemUoYWN0aW9uKS5yZXBsYWNlKC9bLV0vZywgJyAnKTtcbiAgICB9XG4gIH07XG59O1xuIiwiLy8gIyBmb3JtYXRpY1xuXG4vKlxuVGhlIHJvb3QgZm9ybWF0aWMgY29tcG9uZW50LlxuXG5UaGUgcm9vdCBmb3JtYXRpYyBjb21wb25lbnQgaXMgYWN0dWFsbHkgdHdvIGNvbXBvbmVudHMuIFRoZSBtYWluIGNvbXBvbmVudCBpc1xuYSBjb250cm9sbGVkIGNvbXBvbmVudCB3aGVyZSB5b3UgbXVzdCBwYXNzIHRoZSB2YWx1ZSBpbiB3aXRoIGVhY2ggcmVuZGVyLiBUaGlzXG5pcyBhY3R1YWxseSB3cmFwcGVkIGluIGFub3RoZXIgY29tcG9uZW50IHdoaWNoIGFsbG93cyB5b3UgdG8gdXNlIGZvcm1hdGljIGFzXG5hbiB1bmNvbnRyb2xsZWQgY29tcG9uZW50IHdoZXJlIGl0IHJldGFpbnMgdGhlIHN0YXRlIG9mIHRoZSB2YWx1ZS4gVGhlIHdyYXBwZXJcbmlzIHdoYXQgaXMgYWN0dWFsbHkgZXhwb3J0ZWQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIF8gPSByZXF1aXJlKCcuL3VuZGFzaCcpO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbnZhciBkZWZhdWx0Q29uZmlnUGx1Z2luID0gcmVxdWlyZSgnLi9kZWZhdWx0LWNvbmZpZycpO1xuXG52YXIgY3JlYXRlQ29uZmlnID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgdmFyIHBsdWdpbnMgPSBbZGVmYXVsdENvbmZpZ1BsdWdpbl0uY29uY2F0KGFyZ3MpO1xuXG4gIHJldHVybiBwbHVnaW5zLnJlZHVjZShmdW5jdGlvbiAoY29uZmlnLCBwbHVnaW4pIHtcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKHBsdWdpbikpIHtcbiAgICAgIHZhciBleHRlbnNpb25zID0gcGx1Z2luKGNvbmZpZyk7XG4gICAgICBpZiAoZXh0ZW5zaW9ucykge1xuICAgICAgICBfLmV4dGVuZChjb25maWcsIGV4dGVuc2lvbnMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBfLmV4dGVuZChjb25maWcsIHBsdWdpbik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbmZpZztcbiAgfSwge30pO1xufTtcblxudmFyIGRlZmF1bHRDb25maWcgPSBjcmVhdGVDb25maWcoKTtcblxuLy8gVGhlIG1haW4gZm9ybWF0aWMgY29tcG9uZW50IHRoYXQgcmVuZGVycyB0aGUgZm9ybS5cbnZhciBGb3JtYXRpY0NvbnRyb2xsZWRDbGFzcyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0Zvcm1hdGljQ29udHJvbGxlZCcsXG5cbiAgLy8gUmVzcG9uZCB0byBhbnkgdmFsdWUgY2hhbmdlcy5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgaW5mbykge1xuICAgIGlmICghdGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpbmZvID0gXy5leHRlbmQoe30sIGluZm8pO1xuICAgIGluZm8ucGF0aCA9IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkVmFsdWVQYXRoKGluZm8uZmllbGQpO1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UobmV3VmFsdWUsIGluZm8pO1xuICB9LFxuXG4gIC8vIFJlc3BvbmQgdG8gYW55IGFjdGlvbnMgb3RoZXIgdGhhbiB2YWx1ZSBjaGFuZ2VzLiAoRm9yIGV4YW1wbGUsIGZvY3VzIGFuZFxuICAvLyBibHVyLilcbiAgb25BY3Rpb246IGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgaWYgKCF0aGlzLnByb3BzLm9uQWN0aW9uKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGluZm8gPSBfLmV4dGVuZCh7fSwgaW5mbyk7XG4gICAgaW5mby5wYXRoID0gdGhpcy5wcm9wcy5jb25maWcuZmllbGRWYWx1ZVBhdGgoaW5mby5maWVsZCk7XG4gICAgdGhpcy5wcm9wcy5vbkFjdGlvbihpbmZvKTtcbiAgfSxcblxuICAvLyBSZW5kZXIgdGhlIHJvb3QgY29tcG9uZW50IGJ5IGRlbGVnYXRpbmcgdG8gdGhlIGNvbmZpZy5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG5cbiAgICByZXR1cm4gY29uZmlnLnJlbmRlckZvcm1hdGljQ29tcG9uZW50KHRoaXMpO1xuICB9XG59KTtcblxudmFyIEZvcm1hdGljQ29udHJvbGxlZCA9IFJlYWN0LmNyZWF0ZUZhY3RvcnkoRm9ybWF0aWNDb250cm9sbGVkQ2xhc3MpO1xuXG4vLyBBIHdyYXBwZXIgY29tcG9uZW50IHRoYXQgaXMgYWN0dWFsbHkgZXhwb3J0ZWQgYW5kIGNhbiBhbGxvdyBmb3JtYXRpYyB0byBiZVxuLy8gdXNlZCBpbiBhbiBcInVuY29udHJvbGxlZFwiIG1hbm5lci4gKFNlZSB1bmNvbnRyb2xsZWQgY29tcG9uZW50cyBpbiB0aGUgUmVhY3Rcbi8vIGRvY3VtZW50YXRpb24gZm9yIGFuIGV4cGxhbmF0aW9uIG9mIHRoZSBkaWZmZXJlbmNlLilcbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnRm9ybWF0aWMnLFxuXG4gIC8vIEV4cG9ydCBzb21lIHN0dWZmIGFzIHN0YXRpY3MuXG4gIHN0YXRpY3M6IHtcbiAgICBjcmVhdGVDb25maWc6IGNyZWF0ZUNvbmZpZyxcbiAgICBhdmFpbGFibGVNaXhpbnM6IHtcbiAgICAgIGNsaWNrT3V0c2lkZTogcmVxdWlyZSgnLi9taXhpbnMvY2xpY2stb3V0c2lkZS5qcycpLFxuICAgICAgZmllbGQ6IHJlcXVpcmUoJy4vbWl4aW5zL2ZpZWxkLmpzJyksXG4gICAgICBoZWxwZXI6IHJlcXVpcmUoJy4vbWl4aW5zL2hlbHBlci5qcycpLFxuICAgICAgcmVzaXplOiByZXF1aXJlKCcuL21peGlucy9yZXNpemUuanMnKSxcbiAgICAgIHNjcm9sbDogcmVxdWlyZSgnLi9taXhpbnMvc2Nyb2xsLmpzJyksXG4gICAgICB1bmRvU3RhY2s6IHJlcXVpcmUoJy4vbWl4aW5zL3VuZG8tc3RhY2suanMnKVxuICAgIH0sXG4gICAgcGx1Z2luczoge1xuICAgICAgYm9vdHN0cmFwOiByZXF1aXJlKCcuL3BsdWdpbnMvYm9vdHN0cmFwJyksXG4gICAgICBtZXRhOiByZXF1aXJlKCcuL3BsdWdpbnMvbWV0YScpLFxuICAgICAgcmVmZXJlbmNlOiByZXF1aXJlKCcuL3BsdWdpbnMvcmVmZXJlbmNlJyksXG4gICAgICBlbGVtZW50Q2xhc3NlczogcmVxdWlyZSgnLi9wbHVnaW5zL2VsZW1lbnQtY2xhc3NlcycpXG4gICAgfSxcbiAgICB1dGlsczogdXRpbHNcbiAgfSxcblxuICAvLyBJZiB3ZSBnb3QgYSB2YWx1ZSwgdHJlYXQgdGhpcyBjb21wb25lbnQgYXMgY29udHJvbGxlZC4gRWl0aGVyIHdheSwgcmV0YWluXG4gIC8vIHRoZSB2YWx1ZSBpbiB0aGUgc3RhdGUuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpc0NvbnRyb2xsZWQ6ICFfLmlzVW5kZWZpbmVkKHRoaXMucHJvcHMudmFsdWUpLFxuICAgICAgdmFsdWU6IF8uaXNVbmRlZmluZWQodGhpcy5wcm9wcy52YWx1ZSkgPyB0aGlzLnByb3BzLmRlZmF1bHRWYWx1ZSA6IHRoaXMucHJvcHMudmFsdWVcbiAgICB9O1xuICB9LFxuXG4gIC8vIElmIHRoaXMgaXMgYSBjb250cm9sbGVkIGNvbXBvbmVudCwgY2hhbmdlIG91ciBzdGF0ZSB0byByZWZsZWN0IHRoZSBuZXdcbiAgLy8gdmFsdWUuIEZvciB1bmNvbnRyb2xsZWQgY29tcG9uZW50cywgaWdub3JlIGFueSB2YWx1ZSBjaGFuZ2VzLlxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV3UHJvcHMpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5pc0NvbnRyb2xsZWQpIHtcbiAgICAgIGlmICghXy5pc1VuZGVmaW5lZChuZXdQcm9wcy52YWx1ZSkpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgdmFsdWU6IG5ld1Byb3BzLnZhbHVlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBJZiB0aGlzIGlzIGFuIHVuY29udHJvbGxlZCBjb21wb25lbnQsIHNldCBvdXIgc3RhdGUgdG8gcmVmbGVjdCB0aGUgbmV3XG4gIC8vIHZhbHVlLiBFaXRoZXIgd2F5LCBjYWxsIHRoZSBvbkNoYW5nZSBjYWxsYmFjay5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgaW5mbykge1xuICAgIGlmICghdGhpcy5zdGF0ZS5pc0NvbnRyb2xsZWQpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICB2YWx1ZTogbmV3VmFsdWVcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoIXRoaXMucHJvcHMub25DaGFuZ2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSwgaW5mbyk7XG4gIH0sXG5cbiAgLy8gQW55IGFjdGlvbnMgc2hvdWxkIGJlIHNlbnQgdG8gdGhlIGdlbmVyaWMgb25BY3Rpb24gY2FsbGJhY2sgYnV0IGFsc28gc3BsaXRcbiAgLy8gaW50byBkaXNjcmVldCBjYWxsYmFja3MgcGVyIGFjdGlvbi5cbiAgb25BY3Rpb246IGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgaWYgKHRoaXMucHJvcHMub25BY3Rpb24pIHtcbiAgICAgIHRoaXMucHJvcHMub25BY3Rpb24oaW5mbyk7XG4gICAgfVxuICAgIHZhciBhY3Rpb24gPSB1dGlscy5kYXNoVG9QYXNjYWwoaW5mby5hY3Rpb24pO1xuICAgIGlmICh0aGlzLnByb3BzWydvbicgKyBhY3Rpb25dKSB7XG4gICAgICB0aGlzLnByb3BzWydvbicgKyBhY3Rpb25dKGluZm8pO1xuICAgIH1cbiAgfSxcblxuICAvLyBSZW5kZXIgdGhlIHdyYXBwZXIgY29tcG9uZW50IChieSBqdXN0IGRlbGVnYXRpbmcgdG8gdGhlIG1haW4gY29tcG9uZW50KS5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWcgfHwgZGVmYXVsdENvbmZpZztcbiAgICB2YXIgdmFsdWUgPSB0aGlzLnN0YXRlLnZhbHVlO1xuXG4gICAgaWYgKHRoaXMuc3RhdGUuaXNDb250cm9sbGVkKSB7XG4gICAgICBpZiAoIXRoaXMucHJvcHMub25DaGFuZ2UpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1lvdSBzaG91bGQgc3VwcGx5IGFuIG9uQ2hhbmdlIGhhbmRsZXIgaWYgeW91IHN1cHBseSBhIHZhbHVlLicpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBwcm9wcyA9IHtcbiAgICAgIGNvbmZpZzogY29uZmlnLFxuICAgICAgLy8gQWxsb3cgZmllbGQgdGVtcGxhdGVzIHRvIGJlIHBhc3NlZCBpbiBhcyBgZmllbGRgIG9yIGBmaWVsZHNgLiBBZnRlciB0aGlzLCBzdG9wXG4gICAgICAvLyBjYWxsaW5nIHRoZW0gZmllbGRzLlxuICAgICAgZmllbGRUZW1wbGF0ZTogdGhpcy5wcm9wcy5maWVsZCxcbiAgICAgIGZpZWxkVGVtcGxhdGVzOiB0aGlzLnByb3BzLmZpZWxkcyxcbiAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgb25BY3Rpb246IHRoaXMub25BY3Rpb25cbiAgICB9O1xuXG4gICAgXy5lYWNoKHRoaXMucHJvcHMsIGZ1bmN0aW9uIChwcm9wVmFsdWUsIGtleSkge1xuICAgICAgaWYgKCEoa2V5IGluIHByb3BzKSkge1xuICAgICAgICBwcm9wc1trZXldID0gcHJvcFZhbHVlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIEZvcm1hdGljQ29udHJvbGxlZChwcm9wcyk7XG4gIH1cblxufSk7XG4iLCIvLyAjIGNsaWNrLW91dHNpZGUgbWl4aW5cblxuLypcblRoZXJlJ3Mgbm8gbmF0aXZlIFJlYWN0IHdheSB0byBkZXRlY3QgY2xpY2tpbmcgb3V0c2lkZSBhbiBlbGVtZW50LiBTb21ldGltZXNcbnRoaXMgaXMgdXNlZnVsLCBzbyB0aGF0J3Mgd2hhdCB0aGlzIG1peGluIGRvZXMuIFRvIHVzZSBpdCwgbWl4IGl0IGluIGFuZCB1c2UgaXRcbmZyb20geW91ciBjb21wb25lbnQgbGlrZSB0aGlzOlxuXG5gYGBqc1xubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi5taXhpbnMvY2xpY2stb3V0c2lkZScpXSxcblxuICBvbkNsaWNrT3V0c2lkZTogZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUubG9nKCdjbGlja2VkIG91dHNpZGUhJyk7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNldE9uQ2xpY2tPdXRzaWRlKCdteURpdicsIHRoaXMub25DbGlja091dHNpZGUpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSZWFjdC5ET00uZGl2KHtyZWY6ICdteURpdid9LFxuICAgICAgJ0hlbGxvISdcbiAgICApXG4gIH1cbn0pO1xuYGBgXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gcmVxdWlyZSgnLi4vdW5kYXNoJyk7XG5cbnZhciBoYXNBbmNlc3RvciA9IGZ1bmN0aW9uIChjaGlsZCwgcGFyZW50KSB7XG4gIGlmIChjaGlsZC5wYXJlbnROb2RlID09PSBwYXJlbnQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBpZiAoY2hpbGQucGFyZW50Tm9kZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gaGFzQW5jZXN0b3IoY2hpbGQucGFyZW50Tm9kZSwgcGFyZW50KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGlzTm9kZU91dHNpZGU6IGZ1bmN0aW9uIChub2RlT3V0LCBub2RlSW4pIHtcbiAgICBpZiAobm9kZU91dCA9PT0gbm9kZUluKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmIChoYXNBbmNlc3Rvcihub2RlT3V0LCBub2RlSW4pKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuXG4gIGlzTm9kZUluc2lkZTogZnVuY3Rpb24gKG5vZGVJbiwgbm9kZU91dCkge1xuICAgIHJldHVybiAhdGhpcy5pc05vZGVPdXRzaWRlKG5vZGVJbiwgbm9kZU91dCk7XG4gIH0sXG5cbiAgX29uQ2xpY2tNb3VzZWRvd246IGZ1bmN0aW9uKCkge1xuICAgIF8uZWFjaCh0aGlzLmNsaWNrT3V0c2lkZUhhbmRsZXJzLCBmdW5jdGlvbiAoZnVuY3MsIHJlZikge1xuICAgICAgaWYgKHRoaXMucmVmc1tyZWZdKSB7XG4gICAgICAgIHRoaXMuX21vdXNlZG93blJlZnNbcmVmXSA9IHRydWU7XG4gICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfSxcblxuICBfb25DbGlja01vdXNldXA6IGZ1bmN0aW9uIChldmVudCkge1xuICAgIF8uZWFjaCh0aGlzLmNsaWNrT3V0c2lkZUhhbmRsZXJzLCBmdW5jdGlvbiAoZnVuY3MsIHJlZikge1xuICAgICAgaWYgKHRoaXMucmVmc1tyZWZdICYmIHRoaXMuX21vdXNlZG93blJlZnNbcmVmXSkge1xuICAgICAgICBpZiAodGhpcy5pc05vZGVPdXRzaWRlKGV2ZW50LnRhcmdldCwgdGhpcy5yZWZzW3JlZl0uZ2V0RE9NTm9kZSgpKSkge1xuICAgICAgICAgIGZ1bmNzLmZvckVhY2goZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICBmbi5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLl9tb3VzZWRvd25SZWZzW3JlZl0gPSBmYWxzZTtcbiAgICB9LmJpbmQodGhpcykpO1xuICB9LFxuXG4gIHNldE9uQ2xpY2tPdXRzaWRlOiBmdW5jdGlvbiAocmVmLCBmbikge1xuICAgIGlmICghdGhpcy5jbGlja091dHNpZGVIYW5kbGVyc1tyZWZdKSB7XG4gICAgICB0aGlzLmNsaWNrT3V0c2lkZUhhbmRsZXJzW3JlZl0gPSBbXTtcbiAgICB9XG4gICAgdGhpcy5jbGlja091dHNpZGVIYW5kbGVyc1tyZWZdLnB1c2goZm4pO1xuICB9LFxuXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jbGlja091dHNpZGVIYW5kbGVycyA9IHt9O1xuICAgIHRoaXMuX2RpZE1vdXNlRG93biA9IGZhbHNlO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX29uQ2xpY2tNb3VzZWRvd24pO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9vbkNsaWNrTW91c2V1cCk7XG4gICAgLy9kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uQ2xpY2tEb2N1bWVudCk7XG4gICAgdGhpcy5fbW91c2Vkb3duUmVmcyA9IHt9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jbGlja091dHNpZGVIYW5kbGVycyA9IHt9O1xuICAgIC8vZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkNsaWNrRG9jdW1lbnQpO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9vbkNsaWNrTW91c2V1cCk7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5fb25DbGlja01vdXNlZG93bik7XG4gIH1cbn07XG4iLCIvLyAjIGZpZWxkIG1peGluXG5cbi8qXG5UaGlzIG1peGluIGdldHMgbWl4ZWQgaW50byBhbGwgZmllbGQgY29tcG9uZW50cy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSByZXF1aXJlKCcuLi91bmRhc2gnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgLy8gU2lnbmFsIGEgY2hhbmdlIGluIHZhbHVlLlxuICBvbkNoYW5nZVZhbHVlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHZhbHVlLCB7XG4gICAgICBmaWVsZDogdGhpcy5wcm9wcy5maWVsZFxuICAgIH0pO1xuICB9LFxuXG4gIC8vIEJ1YmJsZSB1cCBhIHZhbHVlLlxuICBvbkJ1YmJsZVZhbHVlOiBmdW5jdGlvbiAodmFsdWUsIGluZm8pIHtcbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHZhbHVlLCBpbmZvKTtcbiAgfSxcblxuICAvLyBTdGFydCBhbiBhY3Rpb24gYnViYmxpbmcgdXAgdGhyb3VnaCBwYXJlbnQgY29tcG9uZW50cy5cbiAgb25TdGFydEFjdGlvbjogZnVuY3Rpb24gKGFjdGlvbiwgcHJvcHMpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5vbkFjdGlvbikge1xuICAgICAgdmFyIGluZm8gPSBfLmV4dGVuZCh7fSwgcHJvcHMpO1xuICAgICAgaW5mby5hY3Rpb24gPSBhY3Rpb247XG4gICAgICBpbmZvLmZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcbiAgICAgIHRoaXMucHJvcHMub25BY3Rpb24oaW5mbyk7XG4gICAgfVxuICB9LFxuXG4gIG9uRm9jdXNBY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLm9uU3RhcnRBY3Rpb24oJ2ZvY3VzJyk7XG4gIH0sXG5cbiAgb25CbHVyQWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5vblN0YXJ0QWN0aW9uKCdibHVyJyk7XG4gIH0sXG5cbiAgLy8gQnViYmxlIHVwIGFuIGFjdGlvbi5cbiAgb25CdWJibGVBY3Rpb246IGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgaWYgKHRoaXMucHJvcHMub25BY3Rpb24pIHtcbiAgICAgIHRoaXMucHJvcHMub25BY3Rpb24oaW5mbyk7XG4gICAgfVxuICB9LFxuXG4gIC8vIERlbGVnYXRlIHJlbmRlcmluZyBiYWNrIHRvIGNvbmZpZyBzbyBpdCBjYW4gYmUgd3JhcHBlZC5cbiAgcmVuZGVyV2l0aENvbmZpZzogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnByb3BzLmNvbmZpZy5yZW5kZXJGaWVsZENvbXBvbmVudCh0aGlzKTtcbiAgfVxufTtcbiIsIi8vICMgaGVscGVyIG1peGluXG5cbi8qXG5UaGlzIGdldHMgbWl4ZWQgaW50byBhbGwgaGVscGVyIGNvbXBvbmVudHMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gcmVxdWlyZSgnLi4vdW5kYXNoJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIC8vIERlbGVnYXRlIHJlbmRlcmluZyBiYWNrIHRvIGNvbmZpZyBzbyBpdCBjYW4gYmUgd3JhcHBlZC5cbiAgcmVuZGVyV2l0aENvbmZpZzogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnByb3BzLmNvbmZpZy5yZW5kZXJDb21wb25lbnQodGhpcyk7XG4gIH0sXG5cbiAgLy8gU3RhcnQgYW4gYWN0aW9uIGJ1YmJsaW5nIHVwIHRocm91Z2ggcGFyZW50IGNvbXBvbmVudHMuXG4gIG9uU3RhcnRBY3Rpb246IGZ1bmN0aW9uIChhY3Rpb24sIHByb3BzKSB7XG4gICAgaWYgKHRoaXMucHJvcHMub25BY3Rpb24pIHtcbiAgICAgIHZhciBpbmZvID0gXy5leHRlbmQoe30sIHByb3BzKTtcbiAgICAgIGluZm8uYWN0aW9uID0gYWN0aW9uO1xuICAgICAgaW5mby5maWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG4gICAgICB0aGlzLnByb3BzLm9uQWN0aW9uKGluZm8pO1xuICAgIH1cbiAgfSxcblxuICAvLyBCdWJibGUgdXAgYW4gYWN0aW9uLlxuICBvbkJ1YmJsZUFjdGlvbjogZnVuY3Rpb24gKGluZm8pIHtcbiAgICBpZiAodGhpcy5wcm9wcy5vbkFjdGlvbikge1xuICAgICAgdGhpcy5wcm9wcy5vbkFjdGlvbihpbmZvKTtcbiAgICB9XG4gIH0sXG5cbiAgb25Gb2N1c0FjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMub25TdGFydEFjdGlvbignZm9jdXMnKTtcbiAgfSxcblxuICBvbkJsdXJBY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLm9uU3RhcnRBY3Rpb24oJ2JsdXInKTtcbiAgfVxufTtcbiIsIi8vICMgcmVzaXplIG1peGluXG5cbi8qXG5Zb3UnZCB0aGluayBpdCB3b3VsZCBiZSBwcmV0dHkgZWFzeSB0byBkZXRlY3Qgd2hlbiBhIERPTSBlbGVtZW50IGlzIHJlc2l6ZWQuXG5BbmQgeW91J2QgYmUgd3JvbmcuIFRoZXJlIGFyZSB2YXJpb3VzIHRyaWNrcywgYnV0IG5vbmUgb2YgdGhlbSB3b3JrIHZlcnkgd2VsbC5cblNvLCB1c2luZyBnb29kIG9sJyBwb2xsaW5nIGhlcmUuIFRvIHRyeSB0byBiZSBhcyBlZmZpY2llbnQgYXMgcG9zc2libGUsIHRoZXJlXG5pcyBvbmx5IGEgc2luZ2xlIHNldEludGVydmFsIHVzZWQgZm9yIGFsbCBlbGVtZW50cy4gVG8gdXNlOlxuXG5gYGBqc1xubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL3Jlc2l6ZScpXSxcblxuICBvblJlc2l6ZTogZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUubG9nKCdyZXNpemVkIScpO1xuICB9LFxuXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zZXRPblJlc2l6ZSgnbXlUZXh0JywgdGhpcy5vblJlc2l6ZSk7XG4gIH0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICAuLi5cbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUmVhY3QuRE9NLnRleHRhcmVhKHtyZWY6ICdteVRleHQnLCB2YWx1ZTogdGhpcy5wcm9wcy52YWx1ZSwgb25DaGFuZ2U6IC4uLn0pXG4gIH1cbn0pO1xuYGBgXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBpZCA9IDA7XG5cbnZhciByZXNpemVJbnRlcnZhbEVsZW1lbnRzID0ge307XG52YXIgcmVzaXplSW50ZXJ2YWxFbGVtZW50c0NvdW50ID0gMDtcbnZhciByZXNpemVJbnRlcnZhbFRpbWVyID0gbnVsbDtcblxudmFyIGNoZWNrRWxlbWVudHMgPSBmdW5jdGlvbiAoKSB7XG4gIE9iamVjdC5rZXlzKHJlc2l6ZUludGVydmFsRWxlbWVudHMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIHZhciBlbGVtZW50ID0gcmVzaXplSW50ZXJ2YWxFbGVtZW50c1trZXldO1xuICAgIGlmIChlbGVtZW50LmNsaWVudFdpZHRoICE9PSBlbGVtZW50Ll9fcHJldkNsaWVudFdpZHRoIHx8IGVsZW1lbnQuY2xpZW50SGVpZ2h0ICE9PSBlbGVtZW50Ll9fcHJldkNsaWVudEhlaWdodCkge1xuICAgICAgZWxlbWVudC5fX3ByZXZDbGllbnRXaWR0aCA9IGVsZW1lbnQuY2xpZW50V2lkdGg7XG4gICAgICBlbGVtZW50Ll9fcHJldkNsaWVudEhlaWdodCA9IGVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgICAgdmFyIGhhbmRsZXJzID0gZWxlbWVudC5fX3Jlc2l6ZUhhbmRsZXJzO1xuICAgICAgaGFuZGxlcnMuZm9yRWFjaChmdW5jdGlvbiAoaGFuZGxlcikge1xuICAgICAgICBoYW5kbGVyKCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sIDEwMCk7XG59O1xuXG52YXIgYWRkUmVzaXplSW50ZXJ2YWxIYW5kbGVyID0gZnVuY3Rpb24gKGVsZW1lbnQsIGZuKSB7XG4gIGlmIChyZXNpemVJbnRlcnZhbFRpbWVyID09PSBudWxsKSB7XG4gICAgcmVzaXplSW50ZXJ2YWxUaW1lciA9IHNldEludGVydmFsKGNoZWNrRWxlbWVudHMsIDEwMCk7XG4gIH1cbiAgaWYgKCEoJ19fcmVzaXplSWQnIGluIGVsZW1lbnQpKSB7XG4gICAgaWQrKztcbiAgICBlbGVtZW50Ll9fcHJldkNsaWVudFdpZHRoID0gZWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICBlbGVtZW50Ll9fcHJldkNsaWVudEhlaWdodCA9IGVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgIGVsZW1lbnQuX19yZXNpemVJZCA9IGlkO1xuICAgIHJlc2l6ZUludGVydmFsRWxlbWVudHNDb3VudCsrO1xuICAgIHJlc2l6ZUludGVydmFsRWxlbWVudHNbaWRdID0gZWxlbWVudDtcbiAgICBlbGVtZW50Ll9fcmVzaXplSGFuZGxlcnMgPSBbXTtcbiAgfVxuICBlbGVtZW50Ll9fcmVzaXplSGFuZGxlcnMucHVzaChmbik7XG59O1xuXG52YXIgcmVtb3ZlUmVzaXplSW50ZXJ2YWxIYW5kbGVycyA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIGlmICghKCdfX3Jlc2l6ZUlkJyBpbiBlbGVtZW50KSkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgcmVzaXplSWQgPSBlbGVtZW50Ll9fcmVzaXplSWQ7XG4gIGRlbGV0ZSBlbGVtZW50Ll9fcmVzaXplSWQ7XG4gIGRlbGV0ZSBlbGVtZW50Ll9fcmVzaXplSGFuZGxlcnM7XG4gIGRlbGV0ZSByZXNpemVJbnRlcnZhbEVsZW1lbnRzW3Jlc2l6ZUlkXTtcbiAgcmVzaXplSW50ZXJ2YWxFbGVtZW50c0NvdW50LS07XG4gIGlmIChyZXNpemVJbnRlcnZhbEVsZW1lbnRzQ291bnQgPCAxKSB7XG4gICAgY2xlYXJJbnRlcnZhbChyZXNpemVJbnRlcnZhbFRpbWVyKTtcbiAgICByZXNpemVJbnRlcnZhbFRpbWVyID0gbnVsbDtcbiAgfVxufTtcblxudmFyIG9uUmVzaXplID0gZnVuY3Rpb24gKHJlZiwgZm4pIHtcbiAgZm4ocmVmKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMub25SZXNpemVXaW5kb3cpIHtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLm9uUmVzaXplV2luZG93KTtcbiAgICB9XG4gICAgdGhpcy5yZXNpemVFbGVtZW50UmVmcyA9IHt9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMub25SZXNpemVXaW5kb3cpIHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLm9uUmVzaXplV2luZG93KTtcbiAgICB9XG4gICAgT2JqZWN0LmtleXModGhpcy5yZXNpemVFbGVtZW50UmVmcykuZm9yRWFjaChmdW5jdGlvbiAocmVmKSB7XG4gICAgICByZW1vdmVSZXNpemVJbnRlcnZhbEhhbmRsZXJzKHRoaXMucmVmc1tyZWZdLmdldERPTU5vZGUoKSk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfSxcblxuICBzZXRPblJlc2l6ZTogZnVuY3Rpb24gKHJlZiwgZm4pIHtcbiAgICBpZiAoIXRoaXMucmVzaXplRWxlbWVudFJlZnNbcmVmXSkge1xuICAgICAgdGhpcy5yZXNpemVFbGVtZW50UmVmc1tyZWZdID0gdHJ1ZTtcbiAgICB9XG4gICAgYWRkUmVzaXplSW50ZXJ2YWxIYW5kbGVyKHRoaXMucmVmc1tyZWZdLmdldERPTU5vZGUoKSwgb25SZXNpemUuYmluZCh0aGlzLCByZWYsIGZuKSk7XG4gIH1cbn07XG4iLCIvLyAjIHNjcm9sbCBtaXhpblxuXG4vKlxuQ3VycmVudGx5IHVudXNlZC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSB7XG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMub25TY3JvbGxXaW5kb3cpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHRoaXMub25TY3JvbGxXaW5kb3cpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMub25TY3JvbGxXaW5kb3cpIHtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHRoaXMub25TY3JvbGxXaW5kb3cpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn07XG4iLCIvLyAjIHVuZG8tc3RhY2sgbWl4aW5cblxuLypcbkdpdmVzIHlvdXIgY29tcG9uZW50IGFuIHVuZG8gc3RhY2suXG4qL1xuXG4vLyBodHRwOi8vcHJvbWV0aGV1c3Jlc2VhcmNoLmdpdGh1Yi5pby9yZWFjdC1mb3Jtcy9leGFtcGxlcy91bmRvLmh0bWxcblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge3VuZG86IFtdLCByZWRvOiBbXX07XG4gIH0sXG5cbiAgc25hcHNob3Q6IGZ1bmN0aW9uKCkge1xuICAgIHZhciB1bmRvID0gdGhpcy5zdGF0ZS51bmRvLmNvbmNhdCh0aGlzLmdldFN0YXRlU25hcHNob3QoKSk7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnN0YXRlLnVuZG9EZXB0aCA9PT0gJ251bWJlcicpIHtcbiAgICAgIGlmICh1bmRvLmxlbmd0aCA+IHRoaXMuc3RhdGUudW5kb0RlcHRoKSB7XG4gICAgICAgIHVuZG8uc2hpZnQoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5zZXRTdGF0ZSh7dW5kbzogdW5kbywgcmVkbzogW119KTtcbiAgfSxcblxuICBoYXNVbmRvOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS51bmRvLmxlbmd0aCA+IDA7XG4gIH0sXG5cbiAgaGFzUmVkbzogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUucmVkby5sZW5ndGggPiAwO1xuICB9LFxuXG4gIHJlZG86IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3VuZG9JbXBsKHRydWUpO1xuICB9LFxuXG4gIHVuZG86IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3VuZG9JbXBsKCk7XG4gIH0sXG5cbiAgX3VuZG9JbXBsOiBmdW5jdGlvbihpc1JlZG8pIHtcbiAgICB2YXIgdW5kbyA9IHRoaXMuc3RhdGUudW5kby5zbGljZSgwKTtcbiAgICB2YXIgcmVkbyA9IHRoaXMuc3RhdGUucmVkby5zbGljZSgwKTtcbiAgICB2YXIgc25hcHNob3Q7XG5cbiAgICBpZiAoaXNSZWRvKSB7XG4gICAgICBpZiAocmVkby5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgc25hcHNob3QgPSByZWRvLnBvcCgpO1xuICAgICAgdW5kby5wdXNoKHRoaXMuZ2V0U3RhdGVTbmFwc2hvdCgpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHVuZG8ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHNuYXBzaG90ID0gdW5kby5wb3AoKTtcbiAgICAgIHJlZG8ucHVzaCh0aGlzLmdldFN0YXRlU25hcHNob3QoKSk7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZVNuYXBzaG90KHNuYXBzaG90KTtcbiAgICB0aGlzLnNldFN0YXRlKHt1bmRvOiB1bmRvLCByZWRvOiByZWRvfSk7XG4gIH1cbn07XG4iLCIvLyAjIGJvb3RzdHJhcCBwbHVnaW5cblxuLypcblRoZSBib290c3RyYXAgcGx1Z2luIHNuZWFrcyBpbiBzb21lIGNsYXNzZXMgdG8gZWxlbWVudHMgc28gdGhhdCBpdCBwbGF5cyB3ZWxsXG53aXRoIFR3aXR0ZXIgQm9vdHN0cmFwLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4uL3VuZGFzaCcpO1xuXG4vLyBEZWNsYXJlIHNvbWUgY2xhc3NlcyBhbmQgbGFiZWxzIGZvciBlYWNoIGVsZW1lbnQuXG52YXIgbW9kaWZpZXJzID0ge1xuXG4gICdGaWVsZCc6IHtjbGFzc2VzOiB7J2Zvcm0tZ3JvdXAnOiB0cnVlfX0sXG4gICdIZWxwJzoge2NsYXNzZXM6IHsnaGVscC1ibG9jayc6IHRydWV9fSxcbiAgJ1NhbXBsZSc6IHtjbGFzc2VzOiB7J2hlbHAtYmxvY2snOiB0cnVlfX0sXG4gICdBcnJheUNvbnRyb2wnOiB7Y2xhc3Nlczogeydmb3JtLWlubGluZSc6IHRydWV9fSxcbiAgJ0FycmF5SXRlbSc6IHtjbGFzc2VzOiB7J3dlbGwnOiB0cnVlfX0sXG4gICdPYmplY3RJdGVtJzoge2NsYXNzZXM6IHsnd2VsbCc6IHRydWV9fSxcbiAgJ0ZpZWxkVGVtcGxhdGVDaG9pY2VzJzoge2NsYXNzZXM6IHsnZm9ybS1jb250cm9sJzogdHJ1ZX19LFxuICAnQWRkSXRlbSc6IHtjbGFzc2VzOiB7J2dseXBoaWNvbiBnbHlwaGljb24tcGx1cyc6IHRydWV9LCBsYWJlbDogJyd9LFxuICAnUmVtb3ZlSXRlbSc6IHtjbGFzc2VzOiB7J2dseXBoaWNvbiBnbHlwaGljb24tcmVtb3ZlJzogdHJ1ZX0sIGxhYmVsOiAnJ30sXG4gICdNb3ZlSXRlbUJhY2snOiB7Y2xhc3NlczogeydnbHlwaGljb24gZ2x5cGhpY29uLWFycm93LXVwJzogdHJ1ZX0sIGxhYmVsOiAnJ30sXG4gICdNb3ZlSXRlbUZvcndhcmQnOiB7Y2xhc3NlczogeydnbHlwaGljb24gZ2x5cGhpY29uLWFycm93LWRvd24nOiB0cnVlfSwgbGFiZWw6ICcnfSxcbiAgJ09iamVjdEl0ZW1LZXknOiB7Y2xhc3Nlczogeydmb3JtLWNvbnRyb2wnOiB0cnVlfX0sXG5cbiAgJ1NpbmdsZUxpbmVTdHJpbmcnOiB7Y2xhc3Nlczogeydmb3JtLWNvbnRyb2wnOiB0cnVlfX0sXG4gICdTdHJpbmcnOiB7Y2xhc3Nlczogeydmb3JtLWNvbnRyb2wnOiB0cnVlfX0sXG4gICdQcmV0dHlUZXh0Jzoge2NsYXNzZXM6IHsnZm9ybS1jb250cm9sJzogdHJ1ZX19LFxuICAnSnNvbic6IHtjbGFzc2VzOiB7J2Zvcm0tY29udHJvbCc6IHRydWV9fSxcbiAgJ1NlbGVjdFZhbHVlJzoge2NsYXNzZXM6IHsnZm9ybS1jb250cm9sJzogdHJ1ZX19XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjb25maWcpIHtcblxuICB2YXIgY3JlYXRlRWxlbWVudCA9IGNvbmZpZy5jcmVhdGVFbGVtZW50O1xuXG4gIHJldHVybiB7XG4gICAgY3JlYXRlRWxlbWVudDogZnVuY3Rpb24gKG5hbWUsIHByb3BzLCBjaGlsZHJlbikge1xuXG4gICAgICBuYW1lID0gY29uZmlnLmVsZW1lbnROYW1lKG5hbWUpO1xuXG4gICAgICB2YXIgbW9kaWZpZXIgPSBtb2RpZmllcnNbbmFtZV07XG5cbiAgICAgIGlmIChtb2RpZmllcikge1xuICAgICAgICAvLyBJZiB0aGVyZSBpcyBhIG1vZGlmaWVyIGZvciB0aGlzIGVsZW1lbnQsIGFkZCB0aGUgY2xhc3NlcyBhbmQgbGFiZWwuXG4gICAgICAgIHByb3BzID0gXy5leHRlbmQoe30sIHByb3BzKTtcbiAgICAgICAgcHJvcHMuY2xhc3NlcyA9IF8uZXh0ZW5kKHt9LCBwcm9wcy5jbGFzc2VzLCBtb2RpZmllci5jbGFzc2VzKTtcbiAgICAgICAgaWYgKCdsYWJlbCcgaW4gbW9kaWZpZXIpIHtcbiAgICAgICAgICBwcm9wcy5sYWJlbCA9IG1vZGlmaWVyLmxhYmVsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjcmVhdGVFbGVtZW50KG5hbWUsIHByb3BzLCBjaGlsZHJlbik7XG4gICAgfVxuICB9O1xufTtcbiIsIi8vICMgZWxlbWVudC1jbGFzc2VzIHBsdWdpblxuXG4vKlxuVGhpcyBwbHVnaW5zIHByb3ZpZGVzIGEgY29uZmlnIG1ldGhvZCBhZGRFbGVtZW50Q2xhc3MgdGhhdCBsZXRzIHlvdSBhZGQgb24gYVxuY2xhc3MgdG8gYW4gZWxlbWVudC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSByZXF1aXJlKCcuLi91bmRhc2gnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgdmFyIGNyZWF0ZUVsZW1lbnQgPSBjb25maWcuY3JlYXRlRWxlbWVudDtcblxuICB2YXIgZWxlbWVudENsYXNzZXMgPSB7fTtcblxuICByZXR1cm4ge1xuICAgIGFkZEVsZW1lbnRDbGFzczogZnVuY3Rpb24gKG5hbWUsIGNsYXNzTmFtZSkge1xuXG4gICAgICBuYW1lID0gY29uZmlnLmVsZW1lbnROYW1lKG5hbWUpO1xuXG4gICAgICBpZiAoIWVsZW1lbnRDbGFzc2VzW25hbWVdKSB7XG4gICAgICAgIGVsZW1lbnRDbGFzc2VzW25hbWVdID0ge307XG4gICAgICB9XG5cbiAgICAgIGVsZW1lbnRDbGFzc2VzW25hbWVdW2NsYXNzTmFtZV0gPSB0cnVlO1xuICAgIH0sXG5cbiAgICAvLyBXcmFwIHRoZSBjcmVhdGVFbGVtZW50IG1ldGhvZC5cbiAgICBjcmVhdGVFbGVtZW50OiBmdW5jdGlvbiAobmFtZSwgcHJvcHMsIGNoaWxkcmVuKSB7XG5cbiAgICAgIG5hbWUgPSBjb25maWcuZWxlbWVudE5hbWUobmFtZSk7XG5cbiAgICAgIGlmIChlbGVtZW50Q2xhc3Nlc1tuYW1lXSkge1xuICAgICAgICBwcm9wcyA9IF8uZXh0ZW5kKHt9LCBwcm9wcywge2NsYXNzZXM6IGVsZW1lbnRDbGFzc2VzW25hbWVdfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjcmVhdGVFbGVtZW50KG5hbWUsIHByb3BzLCBjaGlsZHJlbik7XG4gICAgfVxuICB9O1xufTtcbiIsIi8vICMgbWV0YSBwbHVnaW5cblxuLypcblRoZSBtZXRhIHBsdWdpbiBsZXRzIHlvdSBwYXNzIGluIGEgbWV0YSBwcm9wIHRvIGZvcm1hdGljLiBUaGUgcHJvcCB0aGVuIGdldHNcbnBhc3NlZCB0aHJvdWdoIGFzIGEgcHJvcGVydHkgZm9yIGV2ZXJ5IGZpZWxkLiBZb3UgY2FuIHRoZW4gd3JhcCBgaW5pdEZpZWxkYCB0b1xuZ2V0IHlvdXIgbWV0YSB2YWx1ZXMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNvbmZpZykge1xuXG4gIHZhciBpbml0Um9vdEZpZWxkID0gY29uZmlnLmluaXRSb290RmllbGQ7XG4gIHZhciBpbml0RmllbGQgPSBjb25maWcuaW5pdEZpZWxkO1xuXG4gIHJldHVybiB7XG4gICAgaW5pdFJvb3RGaWVsZDogZnVuY3Rpb24gKGZpZWxkLCBwcm9wcykge1xuXG4gICAgICBmaWVsZC5tZXRhID0gcHJvcHMubWV0YSB8fCB7fTtcblxuICAgICAgaW5pdFJvb3RGaWVsZChmaWVsZCwgcHJvcHMpO1xuICAgIH0sXG5cbiAgICBpbml0RmllbGQ6IGZ1bmN0aW9uIChmaWVsZCkge1xuXG4gICAgICBpZiAoZmllbGQucGFyZW50ICYmIGZpZWxkLnBhcmVudC5tZXRhKSB7XG4gICAgICAgIGZpZWxkLm1ldGEgPSBmaWVsZC5wYXJlbnQubWV0YTtcbiAgICAgIH1cblxuICAgICAgaW5pdEZpZWxkKGZpZWxkKTtcbiAgICB9XG4gIH07XG59O1xuIiwiLy8gIyByZWZlcmVuY2UgcGx1Z2luXG5cbi8qXG5UaGlzIHBsdWdpbiBhbGxvd3MgZmllbGRzIHRvIGJlIHN0cmluZ3MgYW5kIHJlZmVyZW5jZSBvdGhlciBmaWVsZHMgYnkga2V5IG9yXG5pZC4gSXQgYWxzbyBhbGxvd3MgYSBmaWVsZCB0byBleHRlbmQgYW5vdGhlciBmaWVsZCB3aXRoXG5leHRlbmRzOiBbJ2ZvbycsICdiYXInXSB3aGVyZSAnZm9vJyBhbmQgJ2JhcicgcmVmZXIgdG8gb3RoZXIga2V5cyBvciBpZHMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gcmVxdWlyZSgnLi4vdW5kYXNoJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNvbmZpZykge1xuXG4gIHZhciBpbml0RmllbGQgPSBjb25maWcuaW5pdEZpZWxkO1xuXG4gIHJldHVybiB7XG4gICAgLy8gTG9vayBmb3IgYSB0ZW1wbGF0ZSBpbiB0aGlzIGZpZWxkIG9yIGFueSBvZiBpdHMgcGFyZW50cy5cbiAgICBmaW5kRmllbGRUZW1wbGF0ZTogZnVuY3Rpb24gKGZpZWxkLCBuYW1lKSB7XG5cbiAgICAgIGlmIChmaWVsZC50ZW1wbGF0ZXNbbmFtZV0pIHtcbiAgICAgICAgcmV0dXJuIGZpZWxkLnRlbXBsYXRlc1tuYW1lXTtcbiAgICAgIH1cblxuICAgICAgaWYgKGZpZWxkLnBhcmVudCkge1xuICAgICAgICByZXR1cm4gY29uZmlnLmZpbmRGaWVsZFRlbXBsYXRlKGZpZWxkLnBhcmVudCwgbmFtZSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG5cbiAgICAvLyBJbmhlcml0IGZyb20gYW55IGZpZWxkIHRlbXBsYXRlcyB0aGF0IHRoaXMgZmllbGQgdGVtcGxhdGVcbiAgICAvLyBleHRlbmRzLlxuICAgIHJlc29sdmVGaWVsZFRlbXBsYXRlOiBmdW5jdGlvbiAoZmllbGQsIGZpZWxkVGVtcGxhdGUpIHtcblxuICAgICAgaWYgKCFmaWVsZFRlbXBsYXRlLmV4dGVuZHMpIHtcbiAgICAgICAgcmV0dXJuIGZpZWxkVGVtcGxhdGU7XG4gICAgICB9XG5cbiAgICAgIHZhciBleHQgPSBmaWVsZFRlbXBsYXRlLmV4dGVuZHM7XG5cbiAgICAgIGlmICghXy5pc0FycmF5KGV4dCkpIHtcbiAgICAgICAgZXh0ID0gW2V4dF07XG4gICAgICB9XG5cbiAgICAgIHZhciBiYXNlcyA9IGV4dC5tYXAoZnVuY3Rpb24gKGJhc2UpIHtcbiAgICAgICAgdmFyIHRlbXBsYXRlID0gY29uZmlnLmZpbmRGaWVsZFRlbXBsYXRlKGZpZWxkLCBiYXNlKTtcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGVtcGxhdGUgJyArIGJhc2UgKyAnIG5vdCBmb3VuZC4nKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGVtcGxhdGU7XG4gICAgICB9KTtcblxuICAgICAgdmFyIGNoYWluID0gW3t9XS5jb25jYXQoYmFzZXMucmV2ZXJzZSgpLmNvbmNhdChbZmllbGRUZW1wbGF0ZV0pKTtcbiAgICAgIGZpZWxkVGVtcGxhdGUgPSBfLmV4dGVuZC5hcHBseShfLCBjaGFpbik7XG5cbiAgICAgIHJldHVybiBmaWVsZFRlbXBsYXRlO1xuICAgIH0sXG5cbiAgICAvLyBXcmFwIHRoZSBpbml0RmllbGQgbWV0aG9kLlxuICAgIGluaXRGaWVsZDogZnVuY3Rpb24gKGZpZWxkKSB7XG5cbiAgICAgIHZhciB0ZW1wbGF0ZXMgPSBmaWVsZC50ZW1wbGF0ZXMgPSB7fTtcblxuICAgICAgdmFyIGNoaWxkRmllbGRUZW1wbGF0ZXMgPSBjb25maWcuZmllbGRDaGlsZEZpZWxkVGVtcGxhdGVzKGZpZWxkKTtcblxuICAgICAgLy8gQWRkIGVhY2ggb2YgdGhlIGNoaWxkIGZpZWxkIHRlbXBsYXRlcyB0byBvdXIgdGVtcGxhdGUgbWFwLlxuICAgICAgY2hpbGRGaWVsZFRlbXBsYXRlcy5mb3JFYWNoKGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG5cbiAgICAgICAgaWYgKF8uaXNTdHJpbmcoZmllbGRUZW1wbGF0ZSkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIga2V5ID0gZmllbGRUZW1wbGF0ZS5rZXk7XG4gICAgICAgIHZhciBpZCA9IGZpZWxkVGVtcGxhdGUuaWQ7XG5cbiAgICAgICAgaWYgKGZpZWxkVGVtcGxhdGUudGVtcGxhdGUpIHtcbiAgICAgICAgICBmaWVsZFRlbXBsYXRlID0gXy5leHRlbmQoe30sIGZpZWxkVGVtcGxhdGUsIHt0ZW1wbGF0ZTogZmFsc2V9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghXy5pc1VuZGVmaW5lZChrZXkpICYmIGtleSAhPT0gJycpIHtcbiAgICAgICAgICB0ZW1wbGF0ZXNba2V5XSA9IGZpZWxkVGVtcGxhdGU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQoaWQpICYmIGlkICE9PSAnJykge1xuICAgICAgICAgIHRlbXBsYXRlc1tpZF0gPSBmaWVsZFRlbXBsYXRlO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gUmVzb2x2ZSBhbnkgcmVmZXJlbmNlcyB0byBvdGhlciBmaWVsZCB0ZW1wbGF0ZXMuXG4gICAgICBpZiAoY2hpbGRGaWVsZFRlbXBsYXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGZpZWxkLmZpZWxkcyA9IGNoaWxkRmllbGRUZW1wbGF0ZXMubWFwKGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgICAgICAgaWYgKF8uaXNTdHJpbmcoZmllbGRUZW1wbGF0ZSkpIHtcbiAgICAgICAgICAgIGZpZWxkVGVtcGxhdGUgPSBjb25maWcuZmluZEZpZWxkVGVtcGxhdGUoZmllbGQsIGZpZWxkVGVtcGxhdGUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBjb25maWcucmVzb2x2ZUZpZWxkVGVtcGxhdGUoZmllbGQsIGZpZWxkVGVtcGxhdGUpO1xuICAgICAgICB9KTtcblxuICAgICAgICBmaWVsZC5maWVsZHMgPSBmaWVsZC5maWVsZHMuZmlsdGVyKGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgICAgICAgcmV0dXJuICFmaWVsZFRlbXBsYXRlLnRlbXBsYXRlO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgdmFyIGl0ZW1GaWVsZFRlbXBsYXRlcyA9IGNvbmZpZy5maWVsZEl0ZW1GaWVsZFRlbXBsYXRlcyhmaWVsZCk7XG5cbiAgICAgIC8vIFJlc29sdmUgYW55IG9mIG91ciBpdGVtIGZpZWxkIHRlbXBsYXRlcy4gKEZpZWxkIHRlbXBsYXRlcyBmb3IgZHluYW1pY1xuICAgICAgLy8gY2hpbGQgZmllbGRzLilcbiAgICAgIGlmIChpdGVtRmllbGRUZW1wbGF0ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBmaWVsZC5pdGVtRmllbGRzID0gaXRlbUZpZWxkVGVtcGxhdGVzLm1hcChmdW5jdGlvbiAoaXRlbUZpZWxkVGVtcGxhdGUpIHtcbiAgICAgICAgICBpZiAoXy5pc1N0cmluZyhpdGVtRmllbGRUZW1wbGF0ZSkpIHtcbiAgICAgICAgICAgIGl0ZW1GaWVsZFRlbXBsYXRlID0gY29uZmlnLmZpbmRGaWVsZFRlbXBsYXRlKGZpZWxkLCBpdGVtRmllbGRUZW1wbGF0ZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIGNvbmZpZy5yZXNvbHZlRmllbGRUZW1wbGF0ZShmaWVsZCwgaXRlbUZpZWxkVGVtcGxhdGUpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaW5pdEZpZWxkKGZpZWxkKTtcbiAgICB9XG4gIH07XG5cbn07XG4iLCJ2YXIgXyA9IHt9O1xuXG5fLmFzc2lnbiA9IF8uZXh0ZW5kID0gcmVxdWlyZSgnb2JqZWN0LWFzc2lnbicpO1xuXy5pc0VxdWFsID0gcmVxdWlyZSgnZGVlcC1lcXVhbCcpO1xuXG4vLyBUaGVzZSBhcmUgbm90IG5lY2Vzc2FyaWx5IGNvbXBsZXRlIGltcGxlbWVudGF0aW9ucy4gVGhleSdyZSBqdXN0IGVub3VnaCBmb3Jcbi8vIHdoYXQncyB1c2VkIGluIGZvcm1hdGljLlxuXG5fLmZsYXR0ZW4gPSAoYXJyYXlzKSA9PiBbXS5jb25jYXQuYXBwbHkoW10sIGFycmF5cyk7XG5cbl8uaXNTdHJpbmcgPSB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnO1xuXy5pc1VuZGVmaW5lZCA9IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCc7XG5fLmlzT2JqZWN0ID0gdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jztcbl8uaXNBcnJheSA9IHZhbHVlID0+IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG5fLmlzTnVtYmVyID0gdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJztcbl8uaXNCb29sZWFuID0gdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbic7XG5fLmlzTnVsbCA9IHZhbHVlID0+IHZhbHVlID09PSBudWxsO1xuXy5pc0Z1bmN0aW9uID0gdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nO1xuXG5fLmNsb25lID0gdmFsdWUgPT4ge1xuICBpZiAoIV8uaXNPYmplY3QodmFsdWUpKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIHJldHVybiBfLmlzQXJyYXkodmFsdWUpID8gdmFsdWUuc2xpY2UoKSA6IF8uYXNzaWduKHt9LCB2YWx1ZSk7XG59O1xuXG5fLmZpbmQgPSAoaXRlbXMsIHRlc3RGbikgPT4ge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHRlc3RGbihpdGVtc1tpXSkpIHtcbiAgICAgIHJldHVybiBpdGVtc1tpXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHZvaWQgMDtcbn07XG5cbl8uZXZlcnkgPSAoaXRlbXMsIHRlc3RGbikgPT4ge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKCF0ZXN0Rm4oaXRlbXNbaV0pKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufTtcblxuXy5lYWNoID0gKG9iaiwgaXRlcmF0ZUZuKSA9PiB7XG4gIE9iamVjdC5rZXlzKG9iaikuZm9yRWFjaChrZXkgPT4ge1xuICAgIGl0ZXJhdGVGbihvYmpba2V5XSwga2V5KTtcbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IF87XG4iLCIvLyAjIHV0aWxzXG5cbi8qXG5KdXN0IHNvbWUgc2hhcmVkIHV0aWxpdHkgZnVuY3Rpb25zLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vdW5kYXNoJyk7XG5cbnZhciB1dGlscyA9IGV4cG9ydHM7XG5cbi8vIENvcHkgb2JqIHJlY3Vyc2luZyBkZWVwbHkuXG51dGlscy5kZWVwQ29weSA9IGZ1bmN0aW9uIChvYmopIHtcbiAgaWYgKF8uaXNBcnJheShvYmopKSB7XG4gICAgcmV0dXJuIG9iai5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHJldHVybiB1dGlscy5kZWVwQ29weShpdGVtKTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmIChfLmlzRnVuY3Rpb24ob2JqKSkge1xuICAgIHJldHVybiBvYmo7XG4gIH0gZWxzZSBpZiAoXy5pc051bGwob2JqKSkge1xuICAgIHJldHVybiBvYmo7XG4gIH0gZWxzZSBpZiAoXy5pc09iamVjdChvYmopKSB7XG4gICAgdmFyIGNvcHkgPSB7fTtcbiAgICBfLmVhY2gob2JqLCBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgY29weVtrZXldID0gdXRpbHMuZGVlcENvcHkodmFsdWUpO1xuICAgIH0pO1xuICAgIHJldHVybiBjb3B5O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBvYmo7XG4gIH1cbn07XG5cbi8vIENhY2hlIGZvciBzdHJpbmdzIGNvbnZlcnRlZCB0byBQYXNjYWwgQ2FzZS4gVGhpcyBzaG91bGQgYmUgYSBmaW5pdGUgbGlzdCwgc29cbi8vIG5vdCBtdWNoIGZlYXIgdGhhdCB3ZSB3aWxsIHJ1biBvdXQgb2YgbWVtb3J5LlxudmFyIGRhc2hUb1Bhc2NhbENhY2hlID0ge307XG5cbi8vIENvbnZlcnQgZm9vLWJhciB0byBGb29CYXIuXG51dGlscy5kYXNoVG9QYXNjYWwgPSBmdW5jdGlvbiAocykge1xuICBpZiAocyA9PT0gJycpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbiAgaWYgKCFkYXNoVG9QYXNjYWxDYWNoZVtzXSkge1xuICAgIGRhc2hUb1Bhc2NhbENhY2hlW3NdID0gcy5zcGxpdCgnLScpLm1hcChmdW5jdGlvbiAocGFydCkge1xuICAgICAgcmV0dXJuIHBhcnRbMF0udG9VcHBlckNhc2UoKSArIHBhcnQuc3Vic3RyaW5nKDEpO1xuICAgIH0pLmpvaW4oJycpO1xuICB9XG4gIHJldHVybiBkYXNoVG9QYXNjYWxDYWNoZVtzXTtcbn07XG5cbi8vIENvcHkgYWxsIGNvbXB1dGVkIHN0eWxlcyBmcm9tIG9uZSBET00gZWxlbWVudCB0byBhbm90aGVyLlxudXRpbHMuY29weUVsZW1lbnRTdHlsZSA9IGZ1bmN0aW9uIChmcm9tRWxlbWVudCwgdG9FbGVtZW50KSB7XG4gIHZhciBmcm9tU3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShmcm9tRWxlbWVudCwgJycpO1xuXG4gIGlmIChmcm9tU3R5bGUuY3NzVGV4dCAhPT0gJycpIHtcbiAgICB0b0VsZW1lbnQuc3R5bGUuY3NzVGV4dCA9IGZyb21TdHlsZS5jc3NUZXh0O1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBjc3NSdWxlcyA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGZyb21TdHlsZS5sZW5ndGg7IGkrKykge1xuICAgIGNzc1J1bGVzLnB1c2goZnJvbVN0eWxlW2ldICsgJzonICsgZnJvbVN0eWxlLmdldFByb3BlcnR5VmFsdWUoZnJvbVN0eWxlW2ldKSArICc7Jyk7XG4gIH1cbiAgdmFyIGNzc1RleHQgPSBjc3NSdWxlcy5qb2luKCcnKTtcblxuICB0b0VsZW1lbnQuc3R5bGUuY3NzVGV4dCA9IGNzc1RleHQ7XG59O1xuXG4vLyBPYmplY3QgdG8gaG9sZCBicm93c2VyIHNuaWZmaW5nIGluZm8uXG52YXIgYnJvd3NlciA9IHtcbiAgaXNDaHJvbWU6IGZhbHNlLFxuICBpc01vemlsbGE6IGZhbHNlLFxuICBpc09wZXJhOiBmYWxzZSxcbiAgaXNJZTogZmFsc2UsXG4gIGlzU2FmYXJpOiBmYWxzZSxcbiAgaXNVbmtub3duOiBmYWxzZVxufTtcblxuLy8gU25pZmYgdGhlIGJyb3dzZXIuXG52YXIgdWEgPSAnJztcblxuaWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnKSB7XG4gIHVhID0gbmF2aWdhdG9yLnVzZXJBZ2VudDtcbn1cblxuaWYodWEuaW5kZXhPZignQ2hyb21lJykgPiAtMSkge1xuICBicm93c2VyLmlzQ2hyb21lID0gdHJ1ZTtcbn0gZWxzZSBpZiAodWEuaW5kZXhPZignU2FmYXJpJykgPiAtMSkge1xuICBicm93c2VyLmlzU2FmYXJpID0gdHJ1ZTtcbn0gZWxzZSBpZiAodWEuaW5kZXhPZignT3BlcmEnKSA+IC0xKSB7XG4gIGJyb3dzZXIuaXNPcGVyYSA9IHRydWU7XG59IGVsc2UgaWYgKHVhLmluZGV4T2YoJ0ZpcmVmb3gnKSA+IC0xKSB7XG4gIGJyb3dzZXIuaXNNb3ppbGxhID0gdHJ1ZTtcbn0gZWxzZSBpZiAodWEuaW5kZXhPZignTVNJRScpID4gLTEpIHtcbiAgYnJvd3Nlci5pc0llID0gdHJ1ZTtcbn0gZWxzZSB7XG4gIGJyb3dzZXIuaXNVbmtub3duID0gdHJ1ZTtcbn1cblxuLy8gRXhwb3J0IHNuaWZmZWQgYnJvd3NlciBpbmZvLlxudXRpbHMuYnJvd3NlciA9IGJyb3dzZXI7XG5cbi8vIENyZWF0ZSBhIG1ldGhvZCB0aGF0IGRlbGVnYXRlcyB0byBhbm90aGVyIG1ldGhvZCBvbiB0aGUgc2FtZSBvYmplY3QuIFRoZVxuLy8gZGVmYXVsdCBjb25maWd1cmF0aW9uIHVzZXMgdGhpcyBmdW5jdGlvbiB0byBkZWxlZ2F0ZSBvbmUgbWV0aG9kIHRvIGFub3RoZXIuXG51dGlscy5kZWxlZ2F0ZVRvID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpc1tuYW1lXS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9O1xufTtcblxudXRpbHMuZGVsZWdhdG9yID0gZnVuY3Rpb24gKG9iaikge1xuICByZXR1cm4gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG9ialtuYW1lXS5hcHBseShvYmosIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfTtcbn07XG5cbnV0aWxzLmNhcGl0YWxpemUgPSBmdW5jdGlvbihzKSB7XG4gIHJldHVybiBzLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcy5zdWJzdHJpbmcoMSkudG9Mb3dlckNhc2UoKTtcbn07XG4iLCIvKiFcbiAgQ29weXJpZ2h0IChjKSAyMDE1IEplZCBXYXRzb24uXG4gIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZSAoTUlUKSwgc2VlXG4gIGh0dHA6Ly9qZWR3YXRzb24uZ2l0aHViLmlvL2NsYXNzbmFtZXNcbiovXG5cbmZ1bmN0aW9uIGNsYXNzTmFtZXMgKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0dmFyIGNsYXNzZXMgPSAnJztcblxuXHRmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBhcmcgPSBhcmd1bWVudHNbaV07XG5cdFx0aWYgKCFhcmcpIGNvbnRpbnVlO1xuXG5cdFx0dmFyIGFyZ1R5cGUgPSB0eXBlb2YgYXJnO1xuXG5cdFx0aWYgKCdzdHJpbmcnID09PSBhcmdUeXBlIHx8ICdudW1iZXInID09PSBhcmdUeXBlKSB7XG5cdFx0XHRjbGFzc2VzICs9ICcgJyArIGFyZztcblxuXHRcdH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShhcmcpKSB7XG5cdFx0XHRjbGFzc2VzICs9ICcgJyArIGNsYXNzTmFtZXMuYXBwbHkobnVsbCwgYXJnKTtcblxuXHRcdH0gZWxzZSBpZiAoJ29iamVjdCcgPT09IGFyZ1R5cGUpIHtcblx0XHRcdGZvciAodmFyIGtleSBpbiBhcmcpIHtcblx0XHRcdFx0aWYgKGFyZy5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIGFyZ1trZXldKSB7XG5cdFx0XHRcdFx0Y2xhc3NlcyArPSAnICcgKyBrZXk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gY2xhc3Nlcy5zdWJzdHIoMSk7XG59XG5cbi8vIHNhZmVseSBleHBvcnQgY2xhc3NOYW1lcyBmb3Igbm9kZSAvIGJyb3dzZXJpZnlcbmlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuXHRtb2R1bGUuZXhwb3J0cyA9IGNsYXNzTmFtZXM7XG59XG5cbi8qIGdsb2JhbCBkZWZpbmUgKi9cbi8vIHNhZmVseSBleHBvcnQgY2xhc3NOYW1lcyBmb3IgUmVxdWlyZUpTXG5pZiAodHlwZW9mIGRlZmluZSAhPT0gJ3VuZGVmaW5lZCcgJiYgZGVmaW5lLmFtZCkge1xuXHRkZWZpbmUoJ2NsYXNzbmFtZXMnLCBbXSwgZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIGNsYXNzTmFtZXM7XG5cdH0pO1xufVxuIiwidmFyIHBTbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcbnZhciBvYmplY3RLZXlzID0gcmVxdWlyZSgnLi9saWIva2V5cy5qcycpO1xudmFyIGlzQXJndW1lbnRzID0gcmVxdWlyZSgnLi9saWIvaXNfYXJndW1lbnRzLmpzJyk7XG5cbnZhciBkZWVwRXF1YWwgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChhY3R1YWwsIGV4cGVjdGVkLCBvcHRzKSB7XG4gIGlmICghb3B0cykgb3B0cyA9IHt9O1xuICAvLyA3LjEuIEFsbCBpZGVudGljYWwgdmFsdWVzIGFyZSBlcXVpdmFsZW50LCBhcyBkZXRlcm1pbmVkIGJ5ID09PS5cbiAgaWYgKGFjdHVhbCA9PT0gZXhwZWN0ZWQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcblxuICB9IGVsc2UgaWYgKGFjdHVhbCBpbnN0YW5jZW9mIERhdGUgJiYgZXhwZWN0ZWQgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgcmV0dXJuIGFjdHVhbC5nZXRUaW1lKCkgPT09IGV4cGVjdGVkLmdldFRpbWUoKTtcblxuICAvLyA3LjMuIE90aGVyIHBhaXJzIHRoYXQgZG8gbm90IGJvdGggcGFzcyB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcsXG4gIC8vIGVxdWl2YWxlbmNlIGlzIGRldGVybWluZWQgYnkgPT0uXG4gIH0gZWxzZSBpZiAodHlwZW9mIGFjdHVhbCAhPSAnb2JqZWN0JyAmJiB0eXBlb2YgZXhwZWN0ZWQgIT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gb3B0cy5zdHJpY3QgPyBhY3R1YWwgPT09IGV4cGVjdGVkIDogYWN0dWFsID09IGV4cGVjdGVkO1xuXG4gIC8vIDcuNC4gRm9yIGFsbCBvdGhlciBPYmplY3QgcGFpcnMsIGluY2x1ZGluZyBBcnJheSBvYmplY3RzLCBlcXVpdmFsZW5jZSBpc1xuICAvLyBkZXRlcm1pbmVkIGJ5IGhhdmluZyB0aGUgc2FtZSBudW1iZXIgb2Ygb3duZWQgcHJvcGVydGllcyAoYXMgdmVyaWZpZWRcbiAgLy8gd2l0aCBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwpLCB0aGUgc2FtZSBzZXQgb2Yga2V5c1xuICAvLyAoYWx0aG91Z2ggbm90IG5lY2Vzc2FyaWx5IHRoZSBzYW1lIG9yZGVyKSwgZXF1aXZhbGVudCB2YWx1ZXMgZm9yIGV2ZXJ5XG4gIC8vIGNvcnJlc3BvbmRpbmcga2V5LCBhbmQgYW4gaWRlbnRpY2FsICdwcm90b3R5cGUnIHByb3BlcnR5LiBOb3RlOiB0aGlzXG4gIC8vIGFjY291bnRzIGZvciBib3RoIG5hbWVkIGFuZCBpbmRleGVkIHByb3BlcnRpZXMgb24gQXJyYXlzLlxuICB9IGVsc2Uge1xuICAgIHJldHVybiBvYmpFcXVpdihhY3R1YWwsIGV4cGVjdGVkLCBvcHRzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZE9yTnVsbCh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gaXNCdWZmZXIgKHgpIHtcbiAgaWYgKCF4IHx8IHR5cGVvZiB4ICE9PSAnb2JqZWN0JyB8fCB0eXBlb2YgeC5sZW5ndGggIT09ICdudW1iZXInKSByZXR1cm4gZmFsc2U7XG4gIGlmICh0eXBlb2YgeC5jb3B5ICE9PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiB4LnNsaWNlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICh4Lmxlbmd0aCA+IDAgJiYgdHlwZW9mIHhbMF0gIT09ICdudW1iZXInKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBvYmpFcXVpdihhLCBiLCBvcHRzKSB7XG4gIHZhciBpLCBrZXk7XG4gIGlmIChpc1VuZGVmaW5lZE9yTnVsbChhKSB8fCBpc1VuZGVmaW5lZE9yTnVsbChiKSlcbiAgICByZXR1cm4gZmFsc2U7XG4gIC8vIGFuIGlkZW50aWNhbCAncHJvdG90eXBlJyBwcm9wZXJ0eS5cbiAgaWYgKGEucHJvdG90eXBlICE9PSBiLnByb3RvdHlwZSkgcmV0dXJuIGZhbHNlO1xuICAvL35+fkkndmUgbWFuYWdlZCB0byBicmVhayBPYmplY3Qua2V5cyB0aHJvdWdoIHNjcmV3eSBhcmd1bWVudHMgcGFzc2luZy5cbiAgLy8gICBDb252ZXJ0aW5nIHRvIGFycmF5IHNvbHZlcyB0aGUgcHJvYmxlbS5cbiAgaWYgKGlzQXJndW1lbnRzKGEpKSB7XG4gICAgaWYgKCFpc0FyZ3VtZW50cyhiKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBhID0gcFNsaWNlLmNhbGwoYSk7XG4gICAgYiA9IHBTbGljZS5jYWxsKGIpO1xuICAgIHJldHVybiBkZWVwRXF1YWwoYSwgYiwgb3B0cyk7XG4gIH1cbiAgaWYgKGlzQnVmZmVyKGEpKSB7XG4gICAgaWYgKCFpc0J1ZmZlcihiKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoYS5sZW5ndGggIT09IGIubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gICAgZm9yIChpID0gMDsgaSA8IGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChhW2ldICE9PSBiW2ldKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHRyeSB7XG4gICAgdmFyIGthID0gb2JqZWN0S2V5cyhhKSxcbiAgICAgICAga2IgPSBvYmplY3RLZXlzKGIpO1xuICB9IGNhdGNoIChlKSB7Ly9oYXBwZW5zIHdoZW4gb25lIGlzIGEgc3RyaW5nIGxpdGVyYWwgYW5kIHRoZSBvdGhlciBpc24ndFxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvLyBoYXZpbmcgdGhlIHNhbWUgbnVtYmVyIG9mIG93bmVkIHByb3BlcnRpZXMgKGtleXMgaW5jb3Jwb3JhdGVzXG4gIC8vIGhhc093blByb3BlcnR5KVxuICBpZiAoa2EubGVuZ3RoICE9IGtiLmxlbmd0aClcbiAgICByZXR1cm4gZmFsc2U7XG4gIC8vdGhlIHNhbWUgc2V0IG9mIGtleXMgKGFsdGhvdWdoIG5vdCBuZWNlc3NhcmlseSB0aGUgc2FtZSBvcmRlciksXG4gIGthLnNvcnQoKTtcbiAga2Iuc29ydCgpO1xuICAvL35+fmNoZWFwIGtleSB0ZXN0XG4gIGZvciAoaSA9IGthLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgaWYgKGthW2ldICE9IGtiW2ldKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vZXF1aXZhbGVudCB2YWx1ZXMgZm9yIGV2ZXJ5IGNvcnJlc3BvbmRpbmcga2V5LCBhbmRcbiAgLy9+fn5wb3NzaWJseSBleHBlbnNpdmUgZGVlcCB0ZXN0XG4gIGZvciAoaSA9IGthLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAga2V5ID0ga2FbaV07XG4gICAgaWYgKCFkZWVwRXF1YWwoYVtrZXldLCBiW2tleV0sIG9wdHMpKSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHR5cGVvZiBhID09PSB0eXBlb2YgYjtcbn1cbiIsInZhciBzdXBwb3J0c0FyZ3VtZW50c0NsYXNzID0gKGZ1bmN0aW9uKCl7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYXJndW1lbnRzKVxufSkoKSA9PSAnW29iamVjdCBBcmd1bWVudHNdJztcblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gc3VwcG9ydHNBcmd1bWVudHNDbGFzcyA/IHN1cHBvcnRlZCA6IHVuc3VwcG9ydGVkO1xuXG5leHBvcnRzLnN1cHBvcnRlZCA9IHN1cHBvcnRlZDtcbmZ1bmN0aW9uIHN1cHBvcnRlZChvYmplY3QpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmplY3QpID09ICdbb2JqZWN0IEFyZ3VtZW50c10nO1xufTtcblxuZXhwb3J0cy51bnN1cHBvcnRlZCA9IHVuc3VwcG9ydGVkO1xuZnVuY3Rpb24gdW5zdXBwb3J0ZWQob2JqZWN0KXtcbiAgcmV0dXJuIG9iamVjdCAmJlxuICAgIHR5cGVvZiBvYmplY3QgPT0gJ29iamVjdCcgJiZcbiAgICB0eXBlb2Ygb2JqZWN0Lmxlbmd0aCA9PSAnbnVtYmVyJyAmJlxuICAgIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsICdjYWxsZWUnKSAmJlxuICAgICFPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwob2JqZWN0LCAnY2FsbGVlJykgfHxcbiAgICBmYWxzZTtcbn07XG4iLCJleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSB0eXBlb2YgT2JqZWN0LmtleXMgPT09ICdmdW5jdGlvbidcbiAgPyBPYmplY3Qua2V5cyA6IHNoaW07XG5cbmV4cG9ydHMuc2hpbSA9IHNoaW07XG5mdW5jdGlvbiBzaGltIChvYmopIHtcbiAgdmFyIGtleXMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikga2V5cy5wdXNoKGtleSk7XG4gIHJldHVybiBrZXlzO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBUb09iamVjdCh2YWwpIHtcblx0aWYgKHZhbCA9PSBudWxsKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignT2JqZWN0LmFzc2lnbiBjYW5ub3QgYmUgY2FsbGVkIHdpdGggbnVsbCBvciB1bmRlZmluZWQnKTtcblx0fVxuXG5cdHJldHVybiBPYmplY3QodmFsKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQsIHNvdXJjZSkge1xuXHR2YXIgZnJvbTtcblx0dmFyIGtleXM7XG5cdHZhciB0byA9IFRvT2JqZWN0KHRhcmdldCk7XG5cblx0Zm9yICh2YXIgcyA9IDE7IHMgPCBhcmd1bWVudHMubGVuZ3RoOyBzKyspIHtcblx0XHRmcm9tID0gYXJndW1lbnRzW3NdO1xuXHRcdGtleXMgPSBPYmplY3Qua2V5cyhPYmplY3QoZnJvbSkpO1xuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR0b1trZXlzW2ldXSA9IGZyb21ba2V5c1tpXV07XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHRvO1xufTtcbiJdfQ==
