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

var magicChoiceRe = /^\/\/\/[^\/]+\/\/\/$/;

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
      if (choice.value && choice.value.match(magicChoiceRe)) {
        visibleChoices.push(choice);
      }
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
      isAccordion: this.props.isAccordion,
      field: this.props.field
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2luZGV4LmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9maWVsZHMvYXJyYXkuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9ib29sZWFuLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9maWVsZHMvY2hlY2tib3gtYXJyYXkuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9jaGVja2JveC1ib29sZWFuLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9maWVsZHMvY29kZS5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvZmllbGRzL2NvcHkuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9maWVsZHMuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9qc29uLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9maWVsZHMvb2JqZWN0LmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9maWVsZHMvcGFzc3dvcmQuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9wcmV0dHktYm9vbGVhbi5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvZmllbGRzL3ByZXR0eS1zZWxlY3QuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9wcmV0dHktdGV4dDIuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9zZWxlY3QuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9zaW5nbGUtbGluZS1zdHJpbmcuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9zdHJpbmcuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy91bmtub3duLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2FkZC1pdGVtLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2FycmF5LWNvbnRyb2wuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvYXJyYXktaXRlbS1jb250cm9sLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2FycmF5LWl0ZW0tdmFsdWUuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvYXJyYXktaXRlbS5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9jaG9pY2Utc2VjdGlvbi1oZWFkZXIuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvY2hvaWNlcy5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9maWVsZC10ZW1wbGF0ZS1jaG9pY2VzLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2ZpZWxkLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2hlbHAuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvaW5zZXJ0LWJ1dHRvbi5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9sYWJlbC5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9sb2FkaW5nLWNob2ljZS5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9sb2FkaW5nLWNob2ljZXMuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvbW92ZS1pdGVtLWJhY2suanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvbW92ZS1pdGVtLWZvcndhcmQuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWNvbnRyb2wuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWl0ZW0tY29udHJvbC5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9vYmplY3QtaXRlbS1rZXkuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWl0ZW0tdmFsdWUuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWl0ZW0uanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvcHJldHR5LXNlbGVjdC1pbnB1dC5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9wcmV0dHktc2VsZWN0LXZhbHVlLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL3ByZXR0eS10YWcuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvcHJldHR5LXRleHQtaGVscGVyLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL3JlbW92ZS1pdGVtLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL3NhbXBsZS5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9zZWxlY3QtdmFsdWUuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvdGFnLXRyYW5zbGF0b3IuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9kZWZhdWx0LWNvbmZpZy5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2Zvcm1hdGljLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvbWl4aW5zL2NsaWNrLW91dHNpZGUuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9taXhpbnMvZmllbGQuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9taXhpbnMvaGVscGVyLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvbWl4aW5zL3Jlc2l6ZS5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL21peGlucy9zY3JvbGwuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9taXhpbnMvdW5kby1zdGFjay5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL3BsdWdpbnMvYm9vdHN0cmFwLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvcGx1Z2lucy9lbGVtZW50LWNsYXNzZXMuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9wbHVnaW5zL21ldGEuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9wbHVnaW5zL3JlZmVyZW5jZS5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL3VuZGFzaC5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL3V0aWxzLmpzIiwibm9kZV9tb2R1bGVzL2NsYXNzbmFtZXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZGVlcC1lcXVhbC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kZWVwLWVxdWFsL2xpYi9pc19hcmd1bWVudHMuanMiLCJub2RlX21vZHVsZXMvZGVlcC1lcXVhbC9saWIva2V5cy5qcyIsIm5vZGVfbW9kdWxlcy9vYmplY3QtYXNzaWduL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7QUNHQSxNQUFNLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDOzs7Ozs7QUNLM0MsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3BDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7QUFDbEIsSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDOztBQUUvQixNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7O0FBRWpDLGFBQVcsRUFBRSxPQUFPOztBQUVwQixRQUFNLEVBQUUsQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQzs7Ozs7Ozs7QUFRdkMsY0FBWSxFQUFFLENBQUM7O0FBRWYsaUJBQWUsRUFBRSwyQkFBWTs7OztBQUkzQixRQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7O0FBRWpCLFFBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQzs7QUFFbkMsU0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFBLFVBQVUsSUFBSSxFQUFFLENBQUMsRUFBRTtBQUMvQixhQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7QUFDckMsVUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0tBQ3JCLENBQUEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs7QUFFZCxXQUFPO0FBQ0wsYUFBTyxFQUFFLE9BQU87S0FDakIsQ0FBQztHQUNIOztBQUVELDJCQUF5QixFQUFFLG1DQUFVLFFBQVEsRUFBRTs7QUFFN0MsUUFBSSxPQUFPLEdBQUcsSUFB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Qy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyAjIGluZGV4XG5cbi8vIEV4cG9ydCB0aGUgRm9ybWF0aWMgUmVhY3QgY2xhc3MgYXQgdGhlIHRvcCBsZXZlbC5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvZm9ybWF0aWMnKTtcbiIsIi8vICMgYXJyYXkgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgYSBmaWVsZCB0byBlZGl0IGFycmF5IHZhbHVlcy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdBcnJheScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIC8vIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAvLyAgIHJldHVybiB7XG4gIC8vICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lXG4gIC8vICAgfTtcbiAgLy8gfSxcblxuICBuZXh0TG9va3VwSWQ6IDAsXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAvLyBOZWVkIHRvIGNyZWF0ZSBhcnRpZmljaWFsIGtleXMgZm9yIHRoZSBhcnJheS4gSW5kZXhlcyBhcmUgbm90IGdvb2Qga2V5cyxcbiAgICAvLyBzaW5jZSB0aGV5IGNoYW5nZS4gU28sIG1hcCBlYWNoIHBvc2l0aW9uIHRvIGFuIGFydGlmaWNpYWwga2V5XG4gICAgdmFyIGxvb2t1cHMgPSBbXTtcblxuICAgIHZhciBpdGVtcyA9IHRoaXMucHJvcHMuZmllbGQudmFsdWU7XG5cbiAgICBpdGVtcy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtLCBpKSB7XG4gICAgICBsb29rdXBzW2ldID0gJ18nICsgdGhpcy5uZXh0TG9va3VwSWQ7XG4gICAgICB0aGlzLm5leHRMb29rdXBJZCsrO1xuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgbG9va3VwczogbG9va3Vwc1xuICAgIH07XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gKG5ld1Byb3BzKSB7XG5cbiAgICB2YXIgbG9va3VwcyA9IHRoaXMuc3RhdGUubG9va3VwcztcblxuICAgIHZhciBpdGVtcyA9IG5ld1Byb3BzLmZpZWxkLnZhbHVlO1xuXG4gICAgLy8gTmVlZCB0byBzZXQgYXJ0aWZpY2lhbCBrZXlzIGZvciBuZXcgYXJyYXkgaXRlbXMuXG4gICAgaWYgKGl0ZW1zLmxlbmd0aCA+IGxvb2t1cHMubGVuZ3RoKSB7XG4gICAgICBmb3IgKHZhciBpID0gbG9va3Vwcy5sZW5ndGg7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsb29rdXBzW2ldID0gJ18nICsgdGhpcy5uZXh0TG9va3VwSWQ7XG4gICAgICAgIHRoaXMubmV4dExvb2t1cElkKys7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBsb29rdXBzOiBsb29rdXBzXG4gICAgfSk7XG4gIH0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChpLCBuZXdWYWx1ZSwgaW5mbykge1xuICAgIHZhciBuZXdBcnJheVZhbHVlID0gdGhpcy5wcm9wcy5maWVsZC52YWx1ZS5zbGljZSgwKTtcbiAgICBuZXdBcnJheVZhbHVlW2ldID0gbmV3VmFsdWU7XG4gICAgdGhpcy5vbkJ1YmJsZVZhbHVlKG5ld0FycmF5VmFsdWUsIGluZm8pO1xuICB9LFxuXG4gIG9uQXBwZW5kOiBmdW5jdGlvbiAoaXRlbUNob2ljZUluZGV4KSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICB2YXIgbmV3VmFsdWUgPSBjb25maWcuY3JlYXRlTmV3Q2hpbGRGaWVsZFZhbHVlKGZpZWxkLCBpdGVtQ2hvaWNlSW5kZXgpO1xuXG4gICAgdmFyIGl0ZW1zID0gZmllbGQudmFsdWU7XG5cbiAgICBpdGVtcyA9IGl0ZW1zLmNvbmNhdChuZXdWYWx1ZSk7XG5cbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUoaXRlbXMpO1xuICB9LFxuXG4gIG9uUmVtb3ZlOiBmdW5jdGlvbiAoaSkge1xuICAgIHZhciBsb29rdXBzID0gdGhpcy5zdGF0ZS5sb29rdXBzO1xuICAgIGxvb2t1cHMuc3BsaWNlKGksIDEpO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgbG9va3VwczogbG9va3Vwc1xuICAgIH0pO1xuICAgIHZhciBuZXdJdGVtcyA9IHRoaXMucHJvcHMuZmllbGQudmFsdWUuc2xpY2UoMCk7XG4gICAgbmV3SXRlbXMuc3BsaWNlKGksIDEpO1xuICAgIHRoaXMub25DaGFuZ2VWYWx1ZShuZXdJdGVtcyk7XG4gIH0sXG5cbiAgb25Nb3ZlOiBmdW5jdGlvbiAoZnJvbUluZGV4LCB0b0luZGV4KSB7XG4gICAgdmFyIGxvb2t1cHMgPSB0aGlzLnN0YXRlLmxvb2t1cHM7XG4gICAgdmFyIGZyb21JZCA9IGxvb2t1cHNbZnJvbUluZGV4XTtcbiAgICB2YXIgdG9JZCA9IGxvb2t1cHNbdG9JbmRleF07XG4gICAgbG9va3Vwc1tmcm9tSW5kZXhdID0gdG9JZDtcbiAgICBsb29rdXBzW3RvSW5kZXhdID0gZnJvbUlkO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgbG9va3VwczogbG9va3Vwc1xuICAgIH0pO1xuXG4gICAgdmFyIG5ld0l0ZW1zID0gdGhpcy5wcm9wcy5maWVsZC52YWx1ZS5zbGljZSgwKTtcbiAgICBpZiAoZnJvbUluZGV4ICE9PSB0b0luZGV4ICYmXG4gICAgICBmcm9tSW5kZXggPj0gMCAmJiBmcm9tSW5kZXggPCBuZXdJdGVtcy5sZW5ndGggJiZcbiAgICAgIHRvSW5kZXggPj0gMCAmJiB0b0luZGV4IDwgbmV3SXRlbXMubGVuZ3RoXG4gICAgKSB7XG4gICAgICBuZXdJdGVtcy5zcGxpY2UodG9JbmRleCwgMCwgbmV3SXRlbXMuc3BsaWNlKGZyb21JbmRleCwgMSlbMF0pO1xuICAgIH1cbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUobmV3SXRlbXMpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHZhciBmaWVsZHMgPSBjb25maWcuY3JlYXRlQ2hpbGRGaWVsZHMoZmllbGQpO1xuXG4gICAgdmFyIG51bUl0ZW1zID0gZmllbGQudmFsdWUubGVuZ3RoO1xuICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQnLCB7XG4gICAgICBmaWVsZDogZmllbGQsIHBsYWluOiB0aGlzLnByb3BzLnBsYWluXG4gICAgfSxcbiAgICAgIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3Nlcyl9LFxuICAgICAgICAvLyBjc3MgdHJhbnNpdGlvbnMga25vdyB0byBjYXVzZSBldmVudCBwcm9ibGVtc1xuICAgICAgICBjb25maWcuY3NzVHJhbnNpdGlvbldyYXBwZXIoXG4gICAgICAgICAgZmllbGRzLm1hcChmdW5jdGlvbiAoY2hpbGRGaWVsZCwgaSkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdhcnJheS1pdGVtJywge1xuICAgICAgICAgICAgICBrZXk6IHRoaXMuc3RhdGUubG9va3Vwc1tpXSxcbiAgICAgICAgICAgICAgZmllbGQ6IGNoaWxkRmllbGQsXG4gICAgICAgICAgICAgIGluZGV4OiBpLFxuICAgICAgICAgICAgICBudW1JdGVtczogbnVtSXRlbXMsXG4gICAgICAgICAgICAgIG9uTW92ZTogdGhpcy5vbk1vdmUsXG4gICAgICAgICAgICAgIG9uUmVtb3ZlOiB0aGlzLm9uUmVtb3ZlLFxuICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgICAgICAgICAgb25BY3Rpb246IHRoaXMub25CdWJibGVBY3Rpb25cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgKSxcbiAgICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2FycmF5LWNvbnRyb2wnLCB7ZmllbGQ6IGZpZWxkLCBvbkFwcGVuZDogdGhpcy5vbkFwcGVuZH0pXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG4iLCIvLyAjIGJvb2xlYW4gY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgYSBkcm9wZG93biB0byBoYW5kbGUgeWVzL25vIGJvb2xlYW4gdmFsdWVzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdCb29sZWFuJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChuZXdWYWx1ZSkge1xuICAgIHRoaXMub25DaGFuZ2VWYWx1ZShuZXdWYWx1ZSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgdmFyIGNob2ljZXMgPSBjb25maWcuZmllbGRCb29sZWFuQ2hvaWNlcyhmaWVsZCk7XG5cbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywge1xuICAgICAgZmllbGQ6IGZpZWxkLCBwbGFpbjogdGhpcy5wcm9wcy5wbGFpblxuICAgIH0sIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdzZWxlY3QtdmFsdWUnLCB7XG4gICAgICBjaG9pY2VzOiBjaG9pY2VzLCBmaWVsZDogZmllbGQsIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLCBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvblxuICAgIH0pKTtcbiAgfVxufSk7XG4iLCIvLyAjIGNoZWNrYm94LWFycmF5IGNvbXBvbmVudFxuXG4vKlxuVXNlZCB3aXRoIGFycmF5IHZhbHVlcyB0byBzdXBwbHkgbXVsdGlwbGUgY2hlY2tib3hlcyBmb3IgYWRkaW5nIG11bHRpcGxlXG5lbnVtZXJhdGVkIHZhbHVlcyB0byBhbiBhcnJheS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIF8gPSByZXF1aXJlKCcuLi8uLi91bmRhc2gnKTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdDaGVja2JveEFycmF5JyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNob2ljZXM6IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkQ2hvaWNlcyh0aGlzLnByb3BzLmZpZWxkKVxuICAgIH07XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gKG5ld1Byb3BzKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjaG9pY2VzOiBuZXdQcm9wcy5jb25maWcuZmllbGRDaG9pY2VzKG5ld1Byb3BzLmZpZWxkKVxuICAgIH0pO1xuICB9LFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAoKSB7XG4gICAgLy8gR2V0IGFsbCB0aGUgY2hlY2tlZCBjaGVja2JveGVzIGFuZCBjb252ZXJ0IHRvIGFuIGFycmF5IG9mIHZhbHVlcy5cbiAgICB2YXIgY2hvaWNlTm9kZXMgPSB0aGlzLnJlZnMuY2hvaWNlcy5nZXRET01Ob2RlKCkuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2lucHV0Jyk7XG4gICAgY2hvaWNlTm9kZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChjaG9pY2VOb2RlcywgMCk7XG4gICAgdmFyIHZhbHVlcyA9IGNob2ljZU5vZGVzLm1hcChmdW5jdGlvbiAobm9kZSkge1xuICAgICAgcmV0dXJuIG5vZGUuY2hlY2tlZCA/IG5vZGUudmFsdWUgOiBudWxsO1xuICAgIH0pLmZpbHRlcihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9KTtcbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUodmFsdWVzKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICB2YXIgY2hvaWNlcyA9IHRoaXMuc3RhdGUuY2hvaWNlcyB8fCBbXTtcblxuICAgIHZhciBpc0lubGluZSA9ICFfLmZpbmQoY2hvaWNlcywgZnVuY3Rpb24gKGNob2ljZSkge1xuICAgICAgcmV0dXJuIGNob2ljZS5zYW1wbGU7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywge1xuICAgICAgZmllbGQ6IGZpZWxkXG4gICAgfSxcbiAgICAgIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcyksIHJlZjogJ2Nob2ljZXMnfSxcbiAgICAgICAgY2hvaWNlcy5tYXAoZnVuY3Rpb24gKGNob2ljZSwgaSkge1xuXG4gICAgICAgICAgdmFyIGlucHV0RmllbGQgPSBSLnNwYW4oe3N0eWxlOiB7d2hpdGVTcGFjZTogJ25vd3JhcCd9fSxcbiAgICAgICAgICAgIFIuaW5wdXQoe1xuICAgICAgICAgICAgICBuYW1lOiBmaWVsZC5rZXksXG4gICAgICAgICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgICAgICAgIHZhbHVlOiBjaG9pY2UudmFsdWUsXG4gICAgICAgICAgICAgIGNoZWNrZWQ6IGZpZWxkLnZhbHVlLmluZGV4T2YoY2hvaWNlLnZhbHVlKSA+PSAwID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgICAgICAgICAgb25Gb2N1czogdGhpcy5vbkZvY3VzQWN0aW9uLFxuICAgICAgICAgICAgICBvbkJsdXI6IHRoaXMub25CbHVyQWN0aW9uXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICcgJyxcbiAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAnZmllbGQtY2hvaWNlLWxhYmVsJ30sXG4gICAgICAgICAgICAgIGNob2ljZS5sYWJlbFxuICAgICAgICAgICAgKVxuICAgICAgICAgICk7XG5cbiAgICAgICAgICBpZiAoaXNJbmxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiBSLnNwYW4oe2tleTogaSwgY2xhc3NOYW1lOiAnZmllbGQtY2hvaWNlJ30sXG4gICAgICAgICAgICAgIGlucHV0RmllbGQsICcgJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFIuZGl2KHtrZXk6IGksIGNsYXNzTmFtZTogJ2ZpZWxkLWNob2ljZSd9LFxuICAgICAgICAgICAgICBpbnB1dEZpZWxkLCAnICcsXG4gICAgICAgICAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdzYW1wbGUnLCB7ZmllbGQ6IGZpZWxkLCBjaG9pY2U6IGNob2ljZX0pXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgKVxuICAgICk7XG4gIH1cbn0pO1xuIiwiLy8gIyBjaGVja2JveC1ib29sZWFuIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIGEgZmllbGQgdGhhdCBjYW4gZWRpdCBhIGJvb2xlYW4gd2l0aCBhIGNoZWNrYm94LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0NoZWNrYm94Qm9vbGVhbicsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUoZXZlbnQudGFyZ2V0LmNoZWNrZWQpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQnLCB7XG4gICAgICBjb25maWc6IGNvbmZpZywgZmllbGQ6IGZpZWxkLCBwbGFpbjogdHJ1ZVxuICAgIH0sXG4gICAgUi5zcGFuKHtzdHlsZToge3doaXRlU3BhY2U6ICdub3dyYXAnfX0sXG4gICAgICBSLmlucHV0KHtcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgY2hlY2tlZDogZmllbGQudmFsdWUsXG4gICAgICAgIGNsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSxcbiAgICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsXG4gICAgICAgIG9uRm9jdXM6IHRoaXMub25Gb2N1c0FjdGlvbixcbiAgICAgICAgb25CbHVyOiB0aGlzLm9uQmx1ckFjdGlvblxuICAgICAgfSksXG4gICAgICBSLnNwYW4oe30sICcgJyksXG4gICAgICBSLnNwYW4oe30sIGNvbmZpZy5maWVsZEhlbHBUZXh0KGZpZWxkKSB8fCBjb25maWcuZmllbGRMYWJlbChmaWVsZCkpXG4gICAgKSk7XG4gIH1cbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuLyogZ2xvYmFsIENvZGVNaXJyb3IgKi9cbi8qZXNsaW50IG5vLXNjcmlwdC11cmw6MCAqL1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBfID0gcmVxdWlyZSgnLi4vLi4vdW5kYXNoJyk7XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbi8qXG4gIEEgdmVyeSB0cmltbWVkIGRvd24gZmllbGQgdGhhdCB1c2VzIENvZGVNaXJyb3IgZm9yIHN5bnRheCBoaWdobGlnaHRpbmcgKm9ubHkqLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6ICdDb2RlJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY3JlYXRlQ29kZU1pcnJvckVkaXRvcigpO1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnJlbW92ZUNvZGVNaXJyb3JFZGl0b3IoKTtcbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICB2YWx1ZTogdGhpcy5wcm9wcy5maWVsZC52YWx1ZVxuICAgIH07XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24obmV4dFByb3BzKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7dmFsdWU6IG5leHRQcm9wcy5maWVsZC52YWx1ZX0pO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcbiAgICB2YXIgcHJvcHMgPSB7IGZpZWxkOiBmaWVsZCwgcGxhaW46IHRoaXMucHJvcHMucGxhaW4gfTtcbiAgICB2YXIgdGFiSW5kZXggPSBmaWVsZC50YWJJbmRleDtcbiAgICB2YXIgdGV4dEJveENsYXNzZXMgPSBjeChfLmV4dGVuZCh7fSwgdGhpcy5wcm9wcy5jbGFzc2VzLCB7J3ByZXR0eS10ZXh0LWJveCc6IHRydWV9KSk7XG5cbiAgICAvLyBSZW5kZXIgcmVhZC1vbmx5IHZlcnNpb24uXG4gICAgdmFyIGVsZW1lbnQgPSAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT0ncHJldHR5LXRleHQtd3JhcHBlcic+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXt0ZXh0Qm94Q2xhc3Nlc30gdGFiSW5kZXg9e3RhYkluZGV4fSBvbkZvY3VzPXt0aGlzLm9uRm9jdXNBY3Rpb259IG9uQmx1cj17dGhpcy5vbkJsdXJBY3Rpb259PlxuICAgICAgICAgIDxkaXYgcmVmPSd0ZXh0Qm94JyBjbGFzc05hbWU9J2ludGVybmFsLXRleHQtd3JhcHBlcicgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHByb3BzLCBlbGVtZW50KTtcbiAgfSxcblxuICBjcmVhdGVDb2RlTWlycm9yRWRpdG9yOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG9wdGlvbnMgPSB7XG4gICAgICBsaW5lV3JhcHBpbmc6IHRydWUsXG4gICAgICB0YWJpbmRleDogdGhpcy5wcm9wcy50YWJJbmRleCxcbiAgICAgIHZhbHVlOiBTdHJpbmcodGhpcy5zdGF0ZS52YWx1ZSksXG4gICAgICBtb2RlOiB0aGlzLnByb3BzLmZpZWxkLmxhbmd1YWdlIHx8IG51bGxcbiAgICB9O1xuXG4gICAgaWYgKHRoaXMucHJvcHMuZmllbGQuY29kZU1pcnJvck9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBfLmV4dGVuZCh7fSwgb3B0aW9ucywgdGhpcy5wcm9wcy5maWVsZC5jb2RlTWlycm9yT3B0aW9ucyk7XG4gICAgfVxuXG4gICAgdmFyIHRleHRCb3ggPSB0aGlzLnJlZnMudGV4dEJveC5nZXRET01Ob2RlKCk7XG4gICAgdGhpcy5jb2RlTWlycm9yID0gQ29kZU1pcnJvcih0ZXh0Qm94LCBvcHRpb25zKTtcbiAgICB0aGlzLmNvZGVNaXJyb3Iub24oJ2NoYW5nZScsIHRoaXMub25Db2RlTWlycm9yQ2hhbmdlKTtcbiAgfSxcblxuICByZW1vdmVDb2RlTWlycm9yRWRpdG9yOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRleHRCb3hOb2RlID0gdGhpcy5yZWZzLnRleHRCb3guZ2V0RE9NTm9kZSgpO1xuICAgIHZhciBjbU5vZGUgPSB0ZXh0Qm94Tm9kZS5maXJzdENoaWxkO1xuICAgIHRleHRCb3hOb2RlLnJlbW92ZUNoaWxkKGNtTm9kZSk7XG4gICAgdGhpcy5jb2RlTWlycm9yID0gbnVsbDtcbiAgfSxcblxuICBvbkNvZGVNaXJyb3JDaGFuZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy51cGRhdGluZ0NvZGVNaXJyb3IpIHtcbiAgICAgIC8vIGF2b2lkIHJlY3Vyc2l2ZSB1cGRhdGUgY3ljbGUsIGFuZCBtYXJrIHRoZSBjb2RlIG1pcnJvciBtYW51YWwgdXBkYXRlIGFzIGRvbmVcbiAgICAgIHRoaXMudXBkYXRpbmdDb2RlTWlycm9yID0gZmFsc2U7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIG5ld1ZhbHVlID0gdGhpcy5jb2RlTWlycm9yLmdldFZhbHVlKCk7XG4gICAgdGhpcy5vbkNoYW5nZVZhbHVlKG5ld1ZhbHVlKTtcbiAgICB0aGlzLnNldFN0YXRlKHt2YWx1ZTogbmV3VmFsdWV9KTtcbiAgfVxuXG59KTtcbiIsIi8vICMgY29weSBjb21wb25lbnRcblxuLypcblJlbmRlciBub24tZWRpdGFibGUgaHRtbC90ZXh0ICh0aGluayBhcnRpY2xlIGNvcHkpLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0NvcHknLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcyksIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MOiB7XG4gICAgICBfX2h0bWw6IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkSGVscFRleHQodGhpcy5wcm9wcy5maWVsZClcbiAgICB9fSk7XG4gIH1cbn0pO1xuIiwiLy8gIyBmaWVsZHMgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgYSBmaWVsZCB0byBlZGl0IHRoZSB2YWx1ZXMgb2YgYW4gb2JqZWN0IHdpdGggc3RhdGljIHByb3BlcnRpZXMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgXyA9IHJlcXVpcmUoJy4uLy4uL3VuZGFzaCcpO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0ZpZWxkcycsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIG9uQ2hhbmdlRmllbGQ6IGZ1bmN0aW9uIChrZXksIG5ld1ZhbHVlLCBpbmZvKSB7XG4gICAgaWYgKGtleSkge1xuICAgICAgdmFyIG5ld09iamVjdFZhbHVlID0gXy5leHRlbmQoe30sIHRoaXMucHJvcHMuZmllbGQudmFsdWUpO1xuICAgICAgbmV3T2JqZWN0VmFsdWVba2V5XSA9IG5ld1ZhbHVlO1xuICAgICAgdGhpcy5vbkJ1YmJsZVZhbHVlKG5ld09iamVjdFZhbHVlLCBpbmZvKTtcbiAgICB9XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHZhciBmaWVsZHMgPSBjb25maWcuY3JlYXRlQ2hpbGRGaWVsZHMoZmllbGQpO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHtcbiAgICAgIGNvbmZpZzogY29uZmlnLCBmaWVsZDogZmllbGQsIHBsYWluOiB0aGlzLnByb3BzLnBsYWluXG4gICAgfSxcbiAgICAgIFIuZmllbGRzZXQoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKX0sXG4gICAgICAgIGZpZWxkcy5tYXAoZnVuY3Rpb24gKGNoaWxkRmllbGQsIGkpIHtcbiAgICAgICAgICB2YXIga2V5ID0gY2hpbGRGaWVsZC5rZXkgfHwgaTtcbiAgICAgICAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUZpZWxkRWxlbWVudCh7XG4gICAgICAgICAgICBrZXk6IGtleSB8fCBpLFxuICAgICAgICAgICAgZmllbGQ6IGNoaWxkRmllbGQsXG4gICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZUZpZWxkLmJpbmQodGhpcywga2V5KSwgb25BY3Rpb246IHRoaXMub25CdWJibGVBY3Rpb25cbiAgICAgICAgICB9KTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgKVxuICAgICk7XG4gIH1cblxufSk7XG4iLCIvLyAjIGpzb24gY29tcG9uZW50XG5cbi8qXG5UZXh0YXJlYSBlZGl0b3IgZm9yIEpTT04uIFdpbGwgdmFsaWRhdGUgdGhlIEpTT04gYmVmb3JlIHNldHRpbmcgdGhlIHZhbHVlLCBzb1xud2hpbGUgdGhlIHZhbHVlIGlzIGludmFsaWQsIG5vIGV4dGVybmFsIHN0YXRlIGNoYW5nZXMgd2lsbCBvY2N1ci5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0pzb24nLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcm93czogNVxuICAgIH07XG4gIH0sXG5cbiAgaXNWYWxpZFZhbHVlOiBmdW5jdGlvbiAodmFsdWUpIHtcblxuICAgIHRyeSB7XG4gICAgICBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlzVmFsaWQ6IHRydWUsXG4gICAgICB2YWx1ZTogSlNPTi5zdHJpbmdpZnkodGhpcy5wcm9wcy5maWVsZC52YWx1ZSwgbnVsbCwgMilcbiAgICB9O1xuICB9LFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB2YXIgaXNWYWxpZCA9IHRoaXMuaXNWYWxpZFZhbHVlKGV2ZW50LnRhcmdldC52YWx1ZSk7XG5cbiAgICBpZiAoaXNWYWxpZCkge1xuICAgICAgLy8gTmVlZCB0byBoYW5kbGUgdGhpcyBiZXR0ZXIuIE5lZWQgdG8gdHJhY2sgcG9zaXRpb24uXG4gICAgICB0aGlzLl9pc0NoYW5naW5nID0gdHJ1ZTtcbiAgICAgIHRoaXMub25DaGFuZ2VWYWx1ZShKU09OLnBhcnNlKGV2ZW50LnRhcmdldC52YWx1ZSkpO1xuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgaXNWYWxpZDogaXNWYWxpZCxcbiAgICAgIHZhbHVlOiBldmVudC50YXJnZXQudmFsdWVcbiAgICB9KTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV4dFByb3BzKSB7XG4gICAgaWYgKCF0aGlzLl9pc0NoYW5naW5nKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgaXNWYWxpZDogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IEpTT04uc3RyaW5naWZ5KG5leHRQcm9wcy5maWVsZC52YWx1ZSwgbnVsbCwgMilcbiAgICAgIH0pO1xuICAgIH1cbiAgICB0aGlzLl9pc0NoYW5naW5nID0gZmFsc2U7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQnLCB7XG4gICAgICBmaWVsZDogY29uZmlnLmZpZWxkV2l0aFZhbHVlKGZpZWxkLCB0aGlzLnN0YXRlLnZhbHVlKSwgcGxhaW46IHRoaXMucHJvcHMucGxhaW5cbiAgICB9LCBSLnRleHRhcmVhKHtcbiAgICAgICAgY2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpLFxuICAgICAgICB2YWx1ZTogdGhpcy5zdGF0ZS52YWx1ZSxcbiAgICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsXG4gICAgICAgIHN0eWxlOiB7YmFja2dyb3VuZENvbG9yOiB0aGlzLnN0YXRlLmlzVmFsaWQgPyAnJyA6ICdyZ2IoMjU1LDIwMCwyMDApJ30sXG4gICAgICAgIHJvd3M6IGNvbmZpZy5maWVsZFJvd3MoZmllbGQpIHx8IHRoaXMucHJvcHMucm93cyxcbiAgICAgICAgb25Gb2N1czogdGhpcy5vbkZvY3VzQWN0aW9uLFxuICAgICAgICBvbkJsdXI6IHRoaXMub25CbHVyQWN0aW9uXG4gICAgICB9KVxuICAgICk7XG4gIH1cbn0pO1xuIiwiLy8gIyBvYmplY3QgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgYSBmaWVsZCB0byBlZGl0IGFuIG9iamVjdCB3aXRoIGR5bmFtaWMgY2hpbGQgZmllbGRzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIF8gPSByZXF1aXJlKCcuLi8uLi91bmRhc2gnKTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxudmFyIHRlbXBLZXlQcmVmaXggPSAnJCRfX3RlbXBfXyc7XG5cbnZhciB0ZW1wS2V5ID0gZnVuY3Rpb24gKGlkKSB7XG4gIHJldHVybiB0ZW1wS2V5UHJlZml4ICsgaWQ7XG59O1xuXG52YXIgaXNUZW1wS2V5ID0gZnVuY3Rpb24gKGtleSkge1xuICByZXR1cm4ga2V5LnN1YnN0cmluZygwLCB0ZW1wS2V5UHJlZml4Lmxlbmd0aCkgPT09IHRlbXBLZXlQcmVmaXg7XG59O1xuXG4vLyBUT0RPOiBrZWVwIGludmFsaWQga2V5cyBhcyBzdGF0ZSBhbmQgZG9uJ3Qgc2VuZCBpbiBvbkNoYW5nZTsgY2xvbmUgY29udGV4dFxuLy8gYW5kIHVzZSBjbG9uZSB0byBjcmVhdGUgY2hpbGQgY29udGV4dHNcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdPYmplY3QnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICBuZXh0TG9va3VwSWQ6IDAsXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIga2V5VG9JZCA9IHt9O1xuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXModGhpcy5wcm9wcy5maWVsZC52YWx1ZSk7XG4gICAgdmFyIGtleU9yZGVyID0gW107XG4gICAgLy8gVGVtcCBrZXlzIGtlZXBzIHRoZSBrZXkgdG8gZGlzcGxheSwgd2hpY2ggc29tZXRpbWVzIG1heSBiZSBkaWZmZXJlbnRcbiAgICAvLyB0aGFuIHRoZSBhY3R1YWwga2V5LiBGb3IgZXhhbXBsZSwgZHVwbGljYXRlIGtleXMgYXJlIG5vdCBhbGxvd2VkLFxuICAgIC8vIGJ1dCB3ZSBtYXkgdGVtcG9yYXJpbHkgc2hvdyBkdXBsaWNhdGUga2V5cy5cbiAgICB2YXIgdGVtcERpc3BsYXlLZXlzID0ge307XG5cbiAgICAvLyBLZXlzIGRvbid0IG1ha2UgZ29vZCByZWFjdCBrZXlzLCBzaW5jZSB3ZSdyZSBhbGxvd2luZyB0aGVtIHRvIGJlXG4gICAgLy8gY2hhbmdlZCBoZXJlLCBzbyB3ZSdsbCBoYXZlIHRvIGNyZWF0ZSBmYWtlIGtleXMgYW5kXG4gICAgLy8ga2VlcCB0cmFjayBvZiB0aGUgbWFwcGluZyBvZiByZWFsIGtleXMgdG8gZmFrZSBrZXlzLiBZdWNrLlxuICAgIGtleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICB2YXIgaWQgPSArK3RoaXMubmV4dExvb2t1cElkO1xuICAgICAgLy8gTWFwIHRoZSByZWFsIGtleSB0byB0aGUgaWQuXG4gICAgICBrZXlUb0lkW2tleV0gPSBpZDtcbiAgICAgIC8vIEtlZXAgdGhlIG9yZGVyaW5nIG9mIHRoZSBrZXlzIHNvIHdlIGRvbid0IHNodWZmbGUgdGhpbmdzIGFyb3VuZCBsYXRlci5cbiAgICAgIGtleU9yZGVyLnB1c2goa2V5KTtcbiAgICAgIC8vIElmIHRoaXMgaXMgYSB0ZW1wb3Jhcnkga2V5IHRoYXQgd2FzIHBlcnNpc3RlZCwgYmVzdCB3ZSBjYW4gZG8gaXMgZGlzcGxheVxuICAgICAgLy8gYSBibGFuay5cbiAgICAgIC8vIFRPRE86IFByb2JhYmx5IGp1c3Qgbm90IHNlbmQgdGVtcG9yYXJ5IGtleXMgYmFjayB0aHJvdWdoLiBUaGlzIGJlaGF2aW9yXG4gICAgICAvLyBpcyBhY3R1YWxseSBsZWZ0b3ZlciBmcm9tIGFuIGVhcmxpZXIgaW5jYXJuYXRpb24gb2YgZm9ybWF0aWMgd2hlcmVcbiAgICAgIC8vIHZhbHVlcyBoYWQgdG8gZ28gYmFjayB0byB0aGUgcm9vdC5cbiAgICAgIGlmIChpc1RlbXBLZXkoa2V5KSkge1xuICAgICAgICB0ZW1wRGlzcGxheUtleXNbaWRdID0gJyc7XG4gICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIHJldHVybiB7XG4gICAgICBrZXlUb0lkOiBrZXlUb0lkLFxuICAgICAga2V5T3JkZXI6IGtleU9yZGVyLFxuICAgICAgLy8gVGVtcCBrZXlzIGtlZXBzIHRoZSBrZXkgdG8gZGlzcGxheSwgd2hpY2ggc29tZXRpbWVzIG1heSBiZSBkaWZmZXJlbnRcbiAgICAgIC8vIHRoYW4gdGhlIGFjdHVhbCBrZXkuIEZvciBleGFtcGxlLCBkdXBsaWNhdGUga2V5cyBhcmUgbm90IGFsbG93ZWQsXG4gICAgICAvLyBidXQgd2UgbWF5IHRlbXBvcmFyaWx5IHNob3cgZHVwbGljYXRlIGtleXMuXG4gICAgICB0ZW1wRGlzcGxheUtleXM6IHRlbXBEaXNwbGF5S2V5c1xuICAgIH07XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gKG5ld1Byb3BzKSB7XG5cbiAgICB2YXIga2V5VG9JZCA9IHRoaXMuc3RhdGUua2V5VG9JZDtcbiAgICB2YXIgbmV3S2V5VG9JZCA9IHt9O1xuICAgIHZhciB0ZW1wRGlzcGxheUtleXMgPSB0aGlzLnN0YXRlLnRlbXBEaXNwbGF5S2V5cztcbiAgICB2YXIgbmV3VGVtcERpc3BsYXlLZXlzID0ge307XG4gICAgdmFyIGtleU9yZGVyID0gdGhpcy5zdGF0ZS5rZXlPcmRlcjtcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG5ld1Byb3BzLmZpZWxkLnZhbHVlKTtcbiAgICB2YXIgYWRkZWRLZXlzID0gW107XG5cbiAgICAvLyBMb29rIGF0IHRoZSBuZXcga2V5cy5cbiAgICBrZXlzLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgLy8gQWRkIG5ldyBsb29rdXAgaWYgdGhpcyBrZXkgd2Fzbid0IGhlcmUgbGFzdCB0aW1lLlxuICAgICAgaWYgKCFrZXlUb0lkW2tleV0pIHtcbiAgICAgICAgdGhpcy5uZXh0TG9va3VwSWQrKztcbiAgICAgICAgbmV3S2V5VG9JZFtrZXldID0gdGhpcy5uZXh0TG9va3VwSWQ7XG4gICAgICAgIGFkZGVkS2V5cy5wdXNoKGtleSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXdLZXlUb0lkW2tleV0gPSBrZXlUb0lkW2tleV07XG4gICAgICB9XG4gICAgICBpZiAoaXNUZW1wS2V5KGtleSkgJiYgbmV3S2V5VG9JZFtrZXldIGluIHRlbXBEaXNwbGF5S2V5cykge1xuICAgICAgICBuZXdUZW1wRGlzcGxheUtleXNbbmV3S2V5VG9JZFtrZXldXSA9IHRlbXBEaXNwbGF5S2V5c1tuZXdLZXlUb0lkW2tleV1dO1xuICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICB2YXIgbmV3S2V5T3JkZXIgPSBbXTtcblxuICAgIC8vIExvb2sgYXQgdGhlIG9sZCBrZXlzLlxuICAgIGtleU9yZGVyLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgLy8gSWYgdGhlIGtleSBpcyBpbiB0aGUgbmV3IGtleXMsIHB1c2ggaXQgb250byB0aGUgb3JkZXIgdG8gcmV0YWluIHRoZVxuICAgICAgLy8gc2FtZSBvcmRlci5cbiAgICAgIGlmIChuZXdLZXlUb0lkW2tleV0pIHtcbiAgICAgICAgbmV3S2V5T3JkZXIucHVzaChrZXkpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gUHV0IGFkZGVkIGZpZWxkcyBhdCB0aGUgZW5kLiAoU28gdGhpbmdzIGRvbid0IGdldCBzaHVmZmxlZC4pXG4gICAgbmV3S2V5T3JkZXIgPSBuZXdLZXlPcmRlci5jb25jYXQoYWRkZWRLZXlzKTtcblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAga2V5VG9JZDogbmV3S2V5VG9JZCxcbiAgICAgIGtleU9yZGVyOiBuZXdLZXlPcmRlcixcbiAgICAgIHRlbXBEaXNwbGF5S2V5czogbmV3VGVtcERpc3BsYXlLZXlzXG4gICAgfSk7XG4gIH0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChrZXksIG5ld1ZhbHVlLCBpbmZvKSB7XG4gICAgdmFyIG5ld09iaiA9IF8uZXh0ZW5kKHt9LCB0aGlzLnByb3BzLmZpZWxkLnZhbHVlKTtcbiAgICBuZXdPYmpba2V5XSA9IG5ld1ZhbHVlO1xuICAgIHRoaXMub25CdWJibGVWYWx1ZShuZXdPYmosIGluZm8pO1xuICB9LFxuXG4gIG9uQXBwZW5kOiBmdW5jdGlvbiAoaXRlbUNob2ljZUluZGV4KSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG4gICAgdGhpcy5uZXh0TG9va3VwSWQrKztcblxuICAgIHZhciBrZXlUb0lkID0gdGhpcy5zdGF0ZS5rZXlUb0lkO1xuICAgIHZhciBrZXlPcmRlciA9IHRoaXMuc3RhdGUua2V5T3JkZXI7XG4gICAgdmFyIHRlbXBEaXNwbGF5S2V5cyA9IHRoaXMuc3RhdGUudGVtcERpc3BsYXlLZXlzO1xuXG4gICAgdmFyIGlkID0gdGhpcy5uZXh0TG9va3VwSWQ7XG4gICAgdmFyIG5ld0tleSA9IHRlbXBLZXkoaWQpO1xuXG4gICAga2V5VG9JZFtuZXdLZXldID0gaWQ7XG4gICAgLy8gVGVtcG9yYXJpbHksIHdlJ2xsIHNob3cgYSBibGFuayBrZXkuXG4gICAgdGVtcERpc3BsYXlLZXlzW2lkXSA9ICcnO1xuICAgIGtleU9yZGVyLnB1c2gobmV3S2V5KTtcblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAga2V5VG9JZDoga2V5VG9JZCxcbiAgICAgIHRlbXBEaXNwbGF5S2V5czogdGVtcERpc3BsYXlLZXlzLFxuICAgICAga2V5T3JkZXI6IGtleU9yZGVyXG4gICAgfSk7XG5cbiAgICB2YXIgbmV3T2JqID0gXy5leHRlbmQodGhpcy5wcm9wcy5maWVsZC52YWx1ZSk7XG5cbiAgICB2YXIgbmV3VmFsdWUgPSBjb25maWcuY3JlYXRlTmV3Q2hpbGRGaWVsZFZhbHVlKGZpZWxkLCBpdGVtQ2hvaWNlSW5kZXgpO1xuXG4gICAgbmV3T2JqW25ld0tleV0gPSBuZXdWYWx1ZTtcblxuICAgIHRoaXMub25DaGFuZ2VWYWx1ZShuZXdPYmopO1xuICB9LFxuXG4gIG9uUmVtb3ZlOiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIG5ld09iaiA9IF8uZXh0ZW5kKHRoaXMucHJvcHMuZmllbGQudmFsdWUpO1xuICAgIGRlbGV0ZSBuZXdPYmpba2V5XTtcbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUobmV3T2JqKTtcbiAgfSxcblxuICBvbk1vdmU6IGZ1bmN0aW9uIChmcm9tS2V5LCB0b0tleSkge1xuICAgIGlmIChmcm9tS2V5ICE9PSB0b0tleSkge1xuICAgICAgdmFyIGtleVRvSWQgPSB0aGlzLnN0YXRlLmtleVRvSWQ7XG4gICAgICB2YXIga2V5T3JkZXIgPSB0aGlzLnN0YXRlLmtleU9yZGVyO1xuICAgICAgdmFyIHRlbXBEaXNwbGF5S2V5cyA9IHRoaXMuc3RhdGUudGVtcERpc3BsYXlLZXlzO1xuXG4gICAgICB2YXIgbmV3T2JqID0gXy5leHRlbmQodGhpcy5wcm9wcy5maWVsZC52YWx1ZSk7XG5cbiAgICAgIC8vIElmIHdlIGFscmVhZHkgaGF2ZSB0aGUga2V5IHdlJ3JlIG1vdmluZyB0bywgdGhlbiB3ZSBoYXZlIHRvIGNoYW5nZSB0aGF0XG4gICAgICAvLyBrZXkgdG8gc29tZXRoaW5nIGVsc2UuXG4gICAgICBpZiAoa2V5VG9JZFt0b0tleV0pIHtcbiAgICAgICAgLy8gTWFrZSBhIG5ld1xuICAgICAgICB2YXIgdGVtcFRvS2V5ID0gdGVtcEtleShrZXlUb0lkW3RvS2V5XSk7XG4gICAgICAgIHRlbXBEaXNwbGF5S2V5c1trZXlUb0lkW3RvS2V5XV0gPSB0b0tleTtcbiAgICAgICAga2V5VG9JZFt0ZW1wVG9LZXldID0ga2V5VG9JZFt0b0tleV07XG4gICAgICAgIGtleU9yZGVyW2tleU9yZGVyLmluZGV4T2YodG9LZXkpXSA9IHRlbXBUb0tleTtcbiAgICAgICAgZGVsZXRlIGtleVRvSWRbdG9LZXldO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBrZXlUb0lkOiBrZXlUb0lkLFxuICAgICAgICAgIHRlbXBEaXNwbGF5S2V5czogdGVtcERpc3BsYXlLZXlzLFxuICAgICAgICAgIGtleU9yZGVyOiBrZXlPcmRlclxuICAgICAgICB9KTtcblxuICAgICAgICBuZXdPYmpbdGVtcFRvS2V5XSA9IG5ld09ialt0b0tleV07XG4gICAgICAgIGRlbGV0ZSBuZXdPYmpbdG9LZXldO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRvS2V5KSB7XG4gICAgICAgIHRvS2V5ID0gdGVtcEtleShrZXlUb0lkW2Zyb21LZXldKTtcbiAgICAgICAgdGVtcERpc3BsYXlLZXlzW2tleVRvSWRbZnJvbUtleV1dID0gJyc7XG4gICAgICB9XG4gICAgICBrZXlUb0lkW3RvS2V5XSA9IGtleVRvSWRbZnJvbUtleV07XG4gICAgICBkZWxldGUga2V5VG9JZFtmcm9tS2V5XTtcbiAgICAgIGtleU9yZGVyW2tleU9yZGVyLmluZGV4T2YoZnJvbUtleSldID0gdG9LZXk7XG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBrZXlUb0lkOiBrZXlUb0lkLFxuICAgICAgICBrZXlPcmRlcjoga2V5T3JkZXIsXG4gICAgICAgIHRlbXBEaXNwbGF5S2V5czogdGVtcERpc3BsYXlLZXlzXG4gICAgICB9KTtcblxuICAgICAgbmV3T2JqW3RvS2V5XSA9IG5ld09ialtmcm9tS2V5XTtcbiAgICAgIGRlbGV0ZSBuZXdPYmpbZnJvbUtleV07XG5cbiAgICAgIHRoaXMub25DaGFuZ2VWYWx1ZShuZXdPYmopO1xuXG4gICAgICAvLyBDaGVjayBpZiBvdXIgZnJvbUtleSBoYXMgb3BlbmVkIHVwIGEgc3BvdC5cbiAgICAgIGlmIChmcm9tS2V5ICYmIGZyb21LZXkgIT09IHRvS2V5KSB7XG4gICAgICAgIGlmICghKGZyb21LZXkgaW4gbmV3T2JqKSkge1xuICAgICAgICAgIE9iamVjdC5rZXlzKG5ld09iaikuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICBpZiAoIShpc1RlbXBLZXkoa2V5KSkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGlkID0ga2V5VG9JZFtrZXldO1xuICAgICAgICAgICAgdmFyIGRpc3BsYXlLZXkgPSB0ZW1wRGlzcGxheUtleXNbaWRdO1xuICAgICAgICAgICAgaWYgKGZyb21LZXkgPT09IGRpc3BsYXlLZXkpIHtcbiAgICAgICAgICAgICAgdGhpcy5vbk1vdmUoa2V5LCBkaXNwbGF5S2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIGdldEZpZWxkczogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgdmFyIGZpZWxkcyA9IGNvbmZpZy5jcmVhdGVDaGlsZEZpZWxkcyhmaWVsZCk7XG5cbiAgICB2YXIga2V5VG9GaWVsZCA9IHt9O1xuXG4gICAgXy5lYWNoKGZpZWxkcywgZnVuY3Rpb24gKGNoaWxkRmllbGQpIHtcbiAgICAgIGtleVRvRmllbGRbY2hpbGRGaWVsZC5rZXldID0gY2hpbGRGaWVsZDtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzLnN0YXRlLmtleU9yZGVyLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICByZXR1cm4ga2V5VG9GaWVsZFtrZXldO1xuICAgIH0pO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHZhciBmaWVsZHMgPSB0aGlzLmdldEZpZWxkcygpO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHtcbiAgICAgIGZpZWxkOiBmaWVsZCwgcGxhaW46IHRoaXMucHJvcHMucGxhaW5cbiAgICB9LFxuICAgICAgUi5kaXYoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKX0sXG4gICAgICAgIGNvbmZpZy5jc3NUcmFuc2l0aW9uV3JhcHBlcihcbiAgICAgICAgICBmaWVsZHMubWFwKGZ1bmN0aW9uIChjaGlsZEZpZWxkKSB7XG4gICAgICAgICAgICB2YXIgZGlzcGxheUtleSA9IHRoaXMuc3RhdGUudGVtcERpc3BsYXlLZXlzW3RoaXMuc3RhdGUua2V5VG9JZFtjaGlsZEZpZWxkLmtleV1dO1xuICAgICAgICAgICAgaWYgKF8uaXNVbmRlZmluZWQoZGlzcGxheUtleSkpIHtcbiAgICAgICAgICAgICAgZGlzcGxheUtleSA9IGNoaWxkRmllbGQua2V5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdvYmplY3QtaXRlbScsIHtcbiAgICAgICAgICAgICAga2V5OiB0aGlzLnN0YXRlLmtleVRvSWRbY2hpbGRGaWVsZC5rZXldLFxuICAgICAgICAgICAgICBmaWVsZDogY2hpbGRGaWVsZCxcbiAgICAgICAgICAgICAgb25Nb3ZlOiB0aGlzLm9uTW92ZSxcbiAgICAgICAgICAgICAgb25SZW1vdmU6IHRoaXMub25SZW1vdmUsXG4gICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgICAgICAgICBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvbixcbiAgICAgICAgICAgICAgZGlzcGxheUtleTogZGlzcGxheUtleSxcbiAgICAgICAgICAgICAgaXRlbUtleTogY2hpbGRGaWVsZC5rZXlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgKSxcbiAgICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ29iamVjdC1jb250cm9sJywge2ZpZWxkOiBmaWVsZCwgb25BcHBlbmQ6IHRoaXMub25BcHBlbmR9KVxuICAgICAgKVxuICAgICk7XG4gIH1cbn0pO1xuIiwiLy8gIyBzaW5nbGUtbGluZS1zdHJpbmcgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgYSBzaW5nbGUgbGluZSB0ZXh0IGlucHV0LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ1NpbmdsZUxpbmVTdHJpbmcnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICBvbkNoYW5nZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdGhpcy5vbkNoYW5nZVZhbHVlKGV2ZW50LnRhcmdldC52YWx1ZSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHtcbiAgICAgIGNvbmZpZzogY29uZmlnLCBmaWVsZDogZmllbGQsIHBsYWluOiB0aGlzLnByb3BzLnBsYWluXG4gICAgfSwgUi5pbnB1dCh7XG4gICAgICB0eXBlOiAncGFzc3dvcmQnLFxuICAgICAgdmFsdWU6IHRoaXMucHJvcHMuZmllbGQudmFsdWUsXG4gICAgICBjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcyksXG4gICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgIG9uRm9jdXM6IHRoaXMub25Gb2N1c0FjdGlvbixcbiAgICAgIG9uQmx1cjogdGhpcy5vbkJsdXJBY3Rpb25cbiAgICB9KSk7XG4gIH1cbn0pO1xuIiwiLy8gIyBwcmV0dHkgYm9vbGVhbiBjb21wb25lbnRcblxuLypcblJlbmRlciBwcmV0dHkgYm9vbGVhbiBjb21wb25lbnQgd2l0aCBub24tbmF0aXZlIGRyb3AtZG93blxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdQcmV0dHlCb29sZWFuJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChuZXdWYWx1ZSkge1xuICAgIHRoaXMub25DaGFuZ2VWYWx1ZShuZXdWYWx1ZSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHZhciBjaG9pY2VzID0gY29uZmlnLmZpZWxkQm9vbGVhbkNob2ljZXMoZmllbGQpO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHtcbiAgICAgIGZpZWxkOiBmaWVsZCwgcGxhaW46IHRoaXMucHJvcHMucGxhaW5cbiAgICB9LCBjb25maWcuY3JlYXRlRWxlbWVudCgncHJldHR5LXNlbGVjdC12YWx1ZScsIHtcbiAgICAgIGNob2ljZXM6IGNob2ljZXMsIGZpZWxkOiBmaWVsZCwgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsIG9uQWN0aW9uOiB0aGlzLm9uQnViYmxlQWN0aW9uXG4gICAgfSkpO1xuICB9XG59KTtcbiIsIi8vICMgc2VsZWN0IGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIHNlbGVjdCBlbGVtZW50IHRvIGdpdmUgYSB1c2VyIGNob2ljZXMgZm9yIHRoZSB2YWx1ZSBvZiBhIGZpZWxkLiBSZW5kZXJzIG5vbi1uYXRpdmVcbnNlbGVjdCBkcm9wIGRvd24gYW5kIHN1cHBvcnRzIGZhbmNpZXIgcmVuZGVyaW5ncy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnUHJldHR5U2VsZWN0JyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNob2ljZXM6IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkUHJldHR5Q2hvaWNlcyh0aGlzLnByb3BzLmZpZWxkKVxuICAgIH07XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gKG5ld1Byb3BzKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjaG9pY2VzOiBuZXdQcm9wcy5jb25maWcuZmllbGRQcmV0dHlDaG9pY2VzKG5ld1Byb3BzLmZpZWxkKVxuICAgIH0pO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQnLCB7XG4gICAgICBjb25maWc6IGNvbmZpZywgZmllbGQ6IGZpZWxkLCBwbGFpbjogdGhpcy5wcm9wcy5wbGFpbiwgY2xhc3NlczogdGhpcy5wcm9wcy5jbGFzc2VzXG4gICAgfSwgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ3ByZXR0eS1zZWxlY3QtdmFsdWUnLCB7XG4gICAgICBjaG9pY2VzOiB0aGlzLnN0YXRlLmNob2ljZXMsIGZpZWxkOiBmaWVsZCwgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2VWYWx1ZSwgb25BY3Rpb246IHRoaXMub25CdWJibGVBY3Rpb25cbiAgICB9KSk7XG4gIH1cbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuLyplc2xpbnQgbm8tc2NyaXB0LXVybDowICovXG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIF8gPSByZXF1aXJlKCcuLi8uLi91bmRhc2gnKTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxuLypcbiAgIFdyYXBzIGEgUHJldHR5VGV4dEhlbHBlciB0byBiZSBhIHN0YW5kIGFsb25lIGZpZWxkLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ1ByZXR0eVRleHQnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcbiAgICB2YXIgcHJvcHMgPSB7IGZpZWxkOiBmaWVsZCwgcGxhaW46IHRoaXMucHJvcHMucGxhaW4gfTtcbiAgICB2YXIgdGFiSW5kZXggPSBmaWVsZC50YWJJbmRleDtcblxuICAgIHZhciBlbGVtZW50ID0gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ3ByZXR0eS10ZXh0LWhlbHBlcicsIHtcbiAgICAgIGNsYXNzZXM6IHRoaXMucHJvcHMuY2xhc3NlcyxcbiAgICAgIHRhYkluZGV4OiB0YWJJbmRleCxcbiAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlVmFsdWUsXG4gICAgICBvbkZvY3VzOiB0aGlzLm9uRm9jdXNBY3Rpb24sXG4gICAgICBvbkJsdXI6IHRoaXMub25CbHVyQWN0aW9uLFxuICAgICAgb25BY3Rpb246IHRoaXMub25CdWJibGVBY3Rpb24sXG4gICAgICBmaWVsZDogdGhpcy5wcm9wcy5maWVsZCxcbiAgICAgIHZhbHVlOiB0aGlzLnByb3BzLmZpZWxkLnZhbHVlLFxuICAgICAgaXNBY2NvcmRpb246IHRoaXMucHJvcHMuZmllbGQuaXNBY2NvcmRpb24sXG4gICAgICBzZWxlY3RlZENob2ljZXM6IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkU2VsZWN0ZWRSZXBsYWNlQ2hvaWNlcyh0aGlzLnByb3BzLmZpZWxkKSxcbiAgICAgIHJlcGxhY2VDaG9pY2VzOiB0aGlzLnByb3BzLmNvbmZpZy5maWVsZFJlcGxhY2VDaG9pY2VzKHRoaXMucHJvcHMuZmllbGQpLFxuICAgICAgcmVmOiAndGV4dEJveCdcbiAgICB9KTtcblxuICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQnLCBwcm9wcywgZWxlbWVudCk7XG4gIH1cbn0pO1xuIiwiLy8gIyBzZWxlY3QgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgc2VsZWN0IGVsZW1lbnQgdG8gZ2l2ZSBhIHVzZXIgY2hvaWNlcyBmb3IgdGhlIHZhbHVlIG9mIGEgZmllbGQuIE5vdGVcbml0IHNob3VsZCBzdXBwb3J0IHZhbHVlcyBvdGhlciB0aGFuIHN0cmluZ3MuIEN1cnJlbnRseSB0aGlzIGlzIG9ubHkgdGVzdGVkIGZvclxuYm9vbGVhbiB2YWx1ZXMsIGJ1dCBpdCBfc2hvdWxkXyB3b3JrIGZvciBvdGhlciB2YWx1ZXMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ1NlbGVjdCcsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBjaG9pY2VzOiB0aGlzLnByb3BzLmNvbmZpZy5maWVsZENob2ljZXModGhpcy5wcm9wcy5maWVsZClcbiAgICB9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXdQcm9wcykge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgY2hvaWNlczogbmV3UHJvcHMuY29uZmlnLmZpZWxkQ2hvaWNlcyhuZXdQcm9wcy5maWVsZClcbiAgICB9KTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywge1xuICAgICAgY29uZmlnOiBjb25maWcsIGZpZWxkOiBmaWVsZCwgcGxhaW46IHRoaXMucHJvcHMucGxhaW5cbiAgICB9LCBjb25maWcuY3JlYXRlRWxlbWVudCgnc2VsZWN0LXZhbHVlJywge1xuICAgICAgY2hvaWNlczogdGhpcy5zdGF0ZS5jaG9pY2VzLCBmaWVsZDogZmllbGQsIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlVmFsdWUsIG9uQWN0aW9uOiB0aGlzLm9uQnViYmxlQWN0aW9uXG4gICAgfSkpO1xuICB9XG59KTtcbiIsIi8vICMgc2luZ2xlLWxpbmUtc3RyaW5nIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIGEgc2luZ2xlIGxpbmUgdGV4dCBpbnB1dC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdTaW5nbGVMaW5lU3RyaW5nJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHRoaXMub25DaGFuZ2VWYWx1ZShldmVudC50YXJnZXQudmFsdWUpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQnLCB7XG4gICAgICBjb25maWc6IGNvbmZpZywgZmllbGQ6IGZpZWxkLCBwbGFpbjogdGhpcy5wcm9wcy5wbGFpblxuICAgIH0sIFIuaW5wdXQoe1xuICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgdmFsdWU6IHRoaXMucHJvcHMuZmllbGQudmFsdWUsXG4gICAgICBjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcyksXG4gICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgIG9uRm9jdXM6IHRoaXMub25Gb2N1c0FjdGlvbixcbiAgICAgIG9uQmx1cjogdGhpcy5vbkJsdXJBY3Rpb25cbiAgICB9KSk7XG4gIH1cbn0pO1xuIiwiLy8gIyBzdHJpbmcgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgYSBmaWVsZCB0aGF0IGNhbiBlZGl0IGEgc3RyaW5nIHZhbHVlLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ1N0cmluZycsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywge1xuICAgICAgY29uZmlnOiBjb25maWcsIGZpZWxkOiBmaWVsZCwgcGxhaW46IHRoaXMucHJvcHMucGxhaW5cbiAgICB9LCBSLnRleHRhcmVhKHtcbiAgICAgIHZhbHVlOiBmaWVsZC52YWx1ZSxcbiAgICAgIGNsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSxcbiAgICAgIHJvd3M6IGZpZWxkLnJvd3MgfHwgdGhpcy5wcm9wcy5yb3dzLFxuICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsXG4gICAgICBvbkZvY3VzOiB0aGlzLm9uRm9jdXNBY3Rpb24sXG4gICAgICBvbkJsdXI6IHRoaXMub25CbHVyQWN0aW9uXG4gICAgfSkpO1xuICB9XG59KTtcbiIsIi8vICMgdW5rbm93biBjb21wb25lbnRcblxuLypcblJlbmRlciBhIGZpZWxkIHdpdGggYW4gdW5rbm93biB0eXBlLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ1Vua25vd24nLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSLmRpdih7fSxcbiAgICAgIFIuZGl2KHt9LCAnQ29tcG9uZW50IG5vdCBmb3VuZCBmb3I6ICcpLFxuICAgICAgUi5wcmUoe30sIEpTT04uc3RyaW5naWZ5KHRoaXMucHJvcHMuZmllbGQucmF3RmllbGRUZW1wbGF0ZSwgbnVsbCwgMikpXG4gICAgKTtcbiAgfVxuXG59KTtcbiIsIi8vICMgYWRkLWl0ZW0gY29tcG9uZW50XG5cbi8qXG5UaGUgYWRkIGJ1dHRvbiB0byBhcHBlbmQgYW4gaXRlbSB0byBhIGZpZWxkLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0FkZEl0ZW0nLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxhYmVsOiAnW2FkZF0nXG4gICAgfTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSLnNwYW4oe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSwgb25DbGljazogdGhpcy5wcm9wcy5vbkNsaWNrfSwgdGhpcy5wcm9wcy5sYWJlbCk7XG4gIH1cbn0pO1xuIiwiLy8gIyBhcnJheS1jb250cm9sIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIHRoZSBpdGVtIHR5cGUgY2hvaWNlcyBhbmQgdGhlIGFkZCBidXR0b24gZm9yIGFuIGFycmF5LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0FycmF5Q29udHJvbCcsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZmllbGRUZW1wbGF0ZUluZGV4OiAwXG4gICAgfTtcbiAgfSxcblxuICBvblNlbGVjdDogZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBmaWVsZFRlbXBsYXRlSW5kZXg6IGluZGV4XG4gICAgfSk7XG4gIH0sXG5cbiAgb25BcHBlbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnByb3BzLm9uQXBwZW5kKHRoaXMuc3RhdGUuZmllbGRUZW1wbGF0ZUluZGV4KTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuXG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcbiAgICB2YXIgZmllbGRUZW1wbGF0ZXMgPSBjb25maWcuZmllbGRJdGVtRmllbGRUZW1wbGF0ZXMoZmllbGQpO1xuXG4gICAgdmFyIHR5cGVDaG9pY2VzID0gbnVsbDtcblxuICAgIGlmIChmaWVsZFRlbXBsYXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICB0eXBlQ2hvaWNlcyA9IGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZC10ZW1wbGF0ZS1jaG9pY2VzJywge1xuICAgICAgICBmaWVsZDogZmllbGQsIGZpZWxkVGVtcGxhdGVJbmRleDogdGhpcy5zdGF0ZS5maWVsZFRlbXBsYXRlSW5kZXgsIG9uU2VsZWN0OiB0aGlzLm9uU2VsZWN0XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKX0sXG4gICAgICB0eXBlQ2hvaWNlcywgJyAnLFxuICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2FkZC1pdGVtJywge2ZpZWxkOiBmaWVsZCwgb25DbGljazogdGhpcy5vbkFwcGVuZH0pXG4gICAgKTtcbiAgfVxufSk7XG4iLCIvLyAjIGFycmF5LWl0ZW0tY29udHJvbCBjb21wb25lbnRcblxuLypcblJlbmRlciB0aGUgcmVtb3ZlIGFuZCBtb3ZlIGJ1dHRvbnMgZm9yIGFuIGFycmF5IGZpZWxkLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnQXJyYXlJdGVtQ29udHJvbCcsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBvbk1vdmVCYWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5wcm9wcy5vbk1vdmUodGhpcy5wcm9wcy5pbmRleCwgdGhpcy5wcm9wcy5pbmRleCAtIDEpO1xuICB9LFxuXG4gIG9uTW92ZUZvcndhcmQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnByb3BzLm9uTW92ZSh0aGlzLnByb3BzLmluZGV4LCB0aGlzLnByb3BzLmluZGV4ICsgMSk7XG4gIH0sXG5cbiAgb25SZW1vdmU6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnByb3BzLm9uUmVtb3ZlKHRoaXMucHJvcHMuaW5kZXgpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKX0sXG4gICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgncmVtb3ZlLWl0ZW0nLCB7ZmllbGQ6IGZpZWxkLCBvbkNsaWNrOiB0aGlzLm9uUmVtb3ZlLCBvbk1heWJlUmVtb3ZlOiB0aGlzLnByb3BzLm9uTWF5YmVSZW1vdmV9KSxcbiAgICAgIHRoaXMucHJvcHMuaW5kZXggPiAwID8gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ21vdmUtaXRlbS1iYWNrJywge2ZpZWxkOiBmaWVsZCwgb25DbGljazogdGhpcy5vbk1vdmVCYWNrfSkgOiBudWxsLFxuICAgICAgdGhpcy5wcm9wcy5pbmRleCA8ICh0aGlzLnByb3BzLm51bUl0ZW1zIC0gMSkgPyBjb25maWcuY3JlYXRlRWxlbWVudCgnbW92ZS1pdGVtLWZvcndhcmQnLCB7ZmllbGQ6IGZpZWxkLCBvbkNsaWNrOiB0aGlzLm9uTW92ZUZvcndhcmR9KSA6IG51bGxcbiAgICApO1xuICB9XG59KTtcbiIsIi8vICMgYXJyYXktaXRlbS12YWx1ZSBjb21wb25lbnRcblxuLypcblJlbmRlciB0aGUgdmFsdWUgb2YgYW4gYXJyYXkgaXRlbS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0FycmF5SXRlbVZhbHVlJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIG9uQ2hhbmdlRmllbGQ6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgaW5mbykge1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UodGhpcy5wcm9wcy5pbmRleCwgbmV3VmFsdWUsIGluZm8pO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKX0sXG4gICAgICBjb25maWcuY3JlYXRlRmllbGRFbGVtZW50KHtmaWVsZDogZmllbGQsIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlRmllbGQsIG9uQWN0aW9uOiB0aGlzLm9uQnViYmxlQWN0aW9ufSlcbiAgICApO1xuICB9XG59KTtcbiIsIi8vICMgYXJyYXktaXRlbSBjb21wb25lbnRcblxuLypcblJlbmRlciBhbiBhcnJheSBpdGVtLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG52YXIgXyA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdBcnJheUl0ZW0nLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlzTWF5YmVSZW1vdmluZzogZmFsc2VcbiAgICB9O1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICBvbk1heWJlUmVtb3ZlOiBmdW5jdGlvbiAoaXNNYXliZVJlbW92aW5nKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBpc01heWJlUmVtb3Zpbmc6IGlzTWF5YmVSZW1vdmluZ1xuICAgIH0pO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHZhciBjbGFzc2VzID0gXy5leHRlbmQoe30sIHRoaXMucHJvcHMuY2xhc3Nlcyk7XG5cbiAgICBpZiAodGhpcy5zdGF0ZS5pc01heWJlUmVtb3ZpbmcpIHtcbiAgICAgIGNsYXNzZXNbJ21heWJlLXJlbW92aW5nJ10gPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiBjeChjbGFzc2VzKX0sXG4gICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgnYXJyYXktaXRlbS12YWx1ZScsIHtmaWVsZDogZmllbGQsIGluZGV4OiB0aGlzLnByb3BzLmluZGV4LFxuICAgICAgICBvbkNoYW5nZTogdGhpcy5wcm9wcy5vbkNoYW5nZSwgb25BY3Rpb246IHRoaXMub25CdWJibGVBY3Rpb259KSxcbiAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdhcnJheS1pdGVtLWNvbnRyb2wnLCB7ZmllbGQ6IGZpZWxkLCBpbmRleDogdGhpcy5wcm9wcy5pbmRleCwgbnVtSXRlbXM6IHRoaXMucHJvcHMubnVtSXRlbXMsXG4gICAgICAgIG9uTW92ZTogdGhpcy5wcm9wcy5vbk1vdmUsIG9uUmVtb3ZlOiB0aGlzLnByb3BzLm9uUmVtb3ZlLCBvbk1heWJlUmVtb3ZlOiB0aGlzLm9uTWF5YmVSZW1vdmV9KVxuICAgICk7XG4gIH1cbn0pO1xuIiwiLy8gIyBDaG9pY2VTZWN0aW9uSGVhZGVyIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIHNlY3Rpb24gaGVhZGVyIGluIGNob2ljZXMgZHJvcGRvd25cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnQ2hvaWNlU2VjdGlvbkhlYWRlcicsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjaG9pY2UgPSB0aGlzLnByb3BzLmNob2ljZTtcbiAgICByZXR1cm4gPHNwYW4gY2xhc3NOYW1lPXtjeCh0aGlzLnByb3BzLmNsYXNzZXMpfT57Y2hvaWNlLmxhYmVsfTwvc3Bhbj47XG4gIH1cbn0pO1xuIiwiLy8gIyBDaG9pY2VzIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIGN1c3RvbWl6ZWQgKG5vbi1uYXRpdmUpIGRyb3Bkb3duIGNob2ljZXMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgXyA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUnKTtcblxudmFyIG1hZ2ljQ2hvaWNlUmUgPSAvXlxcL1xcL1xcL1teXFwvXStcXC9cXC9cXC8kLztcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdDaG9pY2VzJyxcblxuICBtaXhpbnM6IFtcbiAgICByZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyksXG4gICAgLy9wbHVnaW4ucmVxdWlyZSgnbWl4aW4ucmVzaXplJyksXG4gICAgLy9wbHVnaW4ucmVxdWlyZSgnbWl4aW4uc2Nyb2xsJyksXG4gICAgcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2NsaWNrLW91dHNpZGUnKVxuICBdLFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBtYXhIZWlnaHQ6IG51bGwsXG4gICAgICBvcGVuOiB0aGlzLnByb3BzLm9wZW5cbiAgICB9O1xuICB9LFxuXG4gIGdldElnbm9yZUNsb3NlTm9kZXM6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMucHJvcHMuaWdub3JlQ2xvc2VOb2Rlcykge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICB2YXIgbm9kZXMgPSB0aGlzLnByb3BzLmlnbm9yZUNsb3NlTm9kZXMoKTtcbiAgICBpZiAoIV8uaXNBcnJheShub2RlcykpIHtcbiAgICAgIG5vZGVzID0gW25vZGVzXTtcbiAgICB9XG4gICAgcmV0dXJuIG5vZGVzO1xuICB9LFxuXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zZXRPbkNsaWNrT3V0c2lkZSgnY2hvaWNlcycsIGZ1bmN0aW9uIChldmVudCkge1xuXG4gICAgICAvLyBNYWtlIHN1cmUgd2UgZG9uJ3QgZmluZCBhbnkgbm9kZXMgdG8gaWdub3JlLlxuICAgICAgaWYgKCFfLmZpbmQodGhpcy5nZXRJZ25vcmVDbG9zZU5vZGVzKCksIGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzTm9kZUluc2lkZShldmVudC50YXJnZXQsIG5vZGUpO1xuICAgICAgfS5iaW5kKHRoaXMpKSkge1xuICAgICAgICB0aGlzLm9uQ2xvc2UoKTtcbiAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5hZGp1c3RTaXplKCk7XG4gIH0sXG5cbiAgb25TZWxlY3Q6IGZ1bmN0aW9uIChjaG9pY2UsIGV2ZW50KSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7b3BlblNlY3Rpb246IG51bGx9KTtcbiAgICB0aGlzLnByb3BzLm9uU2VsZWN0KGNob2ljZS52YWx1ZSwgZXZlbnQpO1xuICB9LFxuXG4gIG9uQ2hvaWNlQWN0aW9uOiBmdW5jdGlvbiAoY2hvaWNlKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7b3BlblNlY3Rpb246IG51bGx9KTtcbiAgICB0aGlzLnByb3BzLm9uQ2hvaWNlQWN0aW9uKGNob2ljZSk7XG4gIH0sXG5cbiAgb25DbG9zZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe29wZW5TZWN0aW9uOiBudWxsfSk7XG4gICAgdGhpcy5wcm9wcy5vbkNsb3NlKCk7XG4gIH0sXG5cbiAgb25SZXNpemVXaW5kb3c6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmFkanVzdFNpemUoKTtcbiAgfSxcblxuICBvblNjcm9sbFdpbmRvdzogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuYWRqdXN0U2l6ZSgpO1xuICB9LFxuXG4gIGFkanVzdFNpemU6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5yZWZzLmNob2ljZXMpIHtcbiAgICAgIHZhciBub2RlID0gdGhpcy5yZWZzLmNob2ljZXMuZ2V0RE9NTm9kZSgpO1xuICAgICAgdmFyIHJlY3QgPSBub2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgdmFyIHRvcCA9IHJlY3QudG9wO1xuICAgICAgdmFyIHdpbmRvd0hlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICAgIHZhciBoZWlnaHQgPSB3aW5kb3dIZWlnaHQgLSB0b3A7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgbWF4SGVpZ2h0OiBoZWlnaHRcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV4dFByb3BzKSB7XG4gICAgdmFyIG5leHRTdGF0ZSA9IHtcbiAgICAgIG9wZW46IG5leHRQcm9wcy5vcGVuXG4gICAgfTtcblxuICAgIHRoaXMuc2V0U3RhdGUobmV4dFN0YXRlLCBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmFkanVzdFNpemUoKTtcbiAgICB9LmJpbmQodGhpcykpO1xuICB9LFxuXG4gIG9uU2Nyb2xsOiBmdW5jdGlvbiAoKSB7XG4gICAgLy8gY29uc29sZS5sb2coJ3N0b3AgdGhhdCEnKVxuICAgIC8vIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgLy8gZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH0sXG5cbiAgb25XaGVlbDogZnVuY3Rpb24gKCkge1xuICAgIC8vIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgLy8gZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH0sXG5cbiAgb25IZWFkZXJDbGljazogZnVuY3Rpb24gKGNob2ljZSkge1xuICAgIGlmICh0aGlzLnN0YXRlLm9wZW5TZWN0aW9uID09PSBjaG9pY2Uuc2VjdGlvbktleSkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7b3BlblNlY3Rpb246IG51bGx9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7b3BlblNlY3Rpb246IGNob2ljZS5zZWN0aW9uS2V5fSwgdGhpcy5hZGp1c3RTaXplKTtcbiAgICB9XG4gIH0sXG5cbiAgaGFzT25lU2VjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWN0aW9uSGVhZGVycyA9IHRoaXMucHJvcHMuY2hvaWNlcy5maWx0ZXIoZnVuY3Rpb24gKGMpIHsgcmV0dXJuIGMuc2VjdGlvbktleTsgfSk7XG4gICAgcmV0dXJuIHNlY3Rpb25IZWFkZXJzLmxlbmd0aCA9PT0gMTtcbiAgfSxcblxuICB2aXNpYmxlQ2hvaWNlczogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjaG9pY2VzID0gdGhpcy5wcm9wcy5jaG9pY2VzO1xuXG4gICAgaWYgKGNob2ljZXMgJiYgY2hvaWNlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBbe3ZhbHVlOiAnLy8vZW1wdHkvLy8nfV07XG4gICAgfVxuICAgIGlmICghdGhpcy5wcm9wcy5pc0FjY29yZGlvbikge1xuICAgICAgcmV0dXJuIGNob2ljZXM7XG4gICAgfVxuXG4gICAgdmFyIG9wZW5TZWN0aW9uID0gdGhpcy5zdGF0ZS5vcGVuU2VjdGlvbjtcbiAgICB2YXIgYWx3YXlzRXhhbmRlZCA9IHRoaXMuaGFzT25lU2VjdGlvbigpO1xuICAgIHZhciB2aXNpYmxlQ2hvaWNlcyA9IFtdO1xuICAgIHZhciBpblNlY3Rpb247XG5cbiAgICBjaG9pY2VzLmZvckVhY2goZnVuY3Rpb24gKGNob2ljZSkge1xuICAgICAgaWYgKGNob2ljZS52YWx1ZSAmJiBjaG9pY2UudmFsdWUubWF0Y2gobWFnaWNDaG9pY2VSZSkpIHtcbiAgICAgICAgdmlzaWJsZUNob2ljZXMucHVzaChjaG9pY2UpO1xuICAgICAgfVxuICAgICAgaWYgKGNob2ljZS5zZWN0aW9uS2V5KSB7XG4gICAgICAgIGluU2VjdGlvbiA9IGNob2ljZS5zZWN0aW9uS2V5ID09PSBvcGVuU2VjdGlvbjtcbiAgICAgIH1cbiAgICAgIGlmIChhbHdheXNFeGFuZGVkIHx8IGNob2ljZS5zZWN0aW9uS2V5IHx8IGluU2VjdGlvbikge1xuICAgICAgICB2aXNpYmxlQ2hvaWNlcy5wdXNoKGNob2ljZSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHZpc2libGVDaG9pY2VzO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuXG4gICAgdmFyIGNob2ljZXMgPSB0aGlzLnZpc2libGVDaG9pY2VzKCk7XG5cbiAgICBpZiAodGhpcy5wcm9wcy5vcGVuKSB7XG4gICAgICByZXR1cm4gUi5kaXYoe3JlZjogJ2NvbnRhaW5lcicsIG9uV2hlZWw6IHRoaXMub25XaGVlbCwgb25TY3JvbGw6IHRoaXMub25TY3JvbGwsXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ2Nob2ljZXMtY29udGFpbmVyJywgc3R5bGU6IHtcbiAgICAgICAgdXNlclNlbGVjdDogJ25vbmUnLCBXZWJraXRVc2VyU2VsZWN0OiAnbm9uZScsIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICBtYXhIZWlnaHQ6IHRoaXMuc3RhdGUubWF4SGVpZ2h0ID8gdGhpcy5zdGF0ZS5tYXhIZWlnaHQgOiBudWxsXG4gICAgICB9fSxcbiAgICAgICAgY29uZmlnLmNzc1RyYW5zaXRpb25XcmFwcGVyKFxuICAgICAgICAgIFIudWwoe3JlZjogJ2Nob2ljZXMnLCBjbGFzc05hbWU6ICdjaG9pY2VzJ30sXG4gICAgICAgICAgICBjaG9pY2VzLm1hcChmdW5jdGlvbiAoY2hvaWNlLCBpKSB7XG5cbiAgICAgICAgICAgICAgdmFyIGNob2ljZUVsZW1lbnQgPSBudWxsO1xuXG4gICAgICAgICAgICAgIGlmIChjaG9pY2UudmFsdWUgPT09ICcvLy9sb2FkaW5nLy8vJykge1xuICAgICAgICAgICAgICAgIGNob2ljZUVsZW1lbnQgPSBSLmEoe2hyZWY6ICdKYXZhU2NyaXB0JyArICc6Jywgb25DbGljazogdGhpcy5vbkNsb3NlfSxcbiAgICAgICAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAnY2hvaWNlLWxhYmVsJ30sXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdsb2FkaW5nLWNob2ljZScsIHtmaWVsZDogdGhpcy5wcm9wcy5maWVsZH0pXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaG9pY2UudmFsdWUgPT09ICcvLy9lbXB0eS8vLycpIHtcbiAgICAgICAgICAgICAgICBjaG9pY2VFbGVtZW50ID0gUi5hKHtocmVmOiAnSmF2YVNjcmlwdCcgKyAnOicsIG9uQ2xpY2s6IHRoaXMub25DbG9zZX0sXG4gICAgICAgICAgICAgICAgICBSLnNwYW4oe2NsYXNzTmFtZTogJ2Nob2ljZS1sYWJlbCd9LFxuICAgICAgICAgICAgICAgICAgICAnTm8gY2hvaWNlcyBhdmFpbGFibGUuJ1xuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hvaWNlLmFjdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciBsYWJlbENsYXNzZXMgPSAnY2hvaWNlLWxhYmVsICcgKyBjaG9pY2UuYWN0aW9uO1xuXG4gICAgICAgICAgICAgICAgY2hvaWNlRWxlbWVudCA9IFIuYSh7aHJlZjogJ0phdmFTY3JpcHQnICsgJzonLCBvbkNsaWNrOiB0aGlzLm9uQ2hvaWNlQWN0aW9uLmJpbmQodGhpcywgY2hvaWNlKX0sXG4gICAgICAgICAgICAgICAgICBSLnNwYW4oe2NsYXNzTmFtZTogbGFiZWxDbGFzc2VzfSxcbiAgICAgICAgICAgICAgICAgICAgY2hvaWNlLmxhYmVsIHx8IHRoaXMucHJvcHMuY29uZmlnLmFjdGlvbkNob2ljZUxhYmVsKGNob2ljZS5hY3Rpb24pXG4gICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5jb25maWcuY3JlYXRlRWxlbWVudCgnY2hvaWNlLWFjdGlvbi1zYW1wbGUnLCB7YWN0aW9uOiBjaG9pY2UuYWN0aW9uLCBjaG9pY2U6IGNob2ljZX0pXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaG9pY2Uuc2VjdGlvbktleSkge1xuICAgICAgICAgICAgICAgIGNob2ljZUVsZW1lbnQgPSBSLmEoe2hyZWY6ICdKYXZhU2NyaXB0JyArICc6Jywgb25DbGljazogdGhpcy5vbkhlYWRlckNsaWNrLmJpbmQodGhpcywgY2hvaWNlKX0sXG4gICAgICAgICAgICAgICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgnY2hvaWNlLXNlY3Rpb24taGVhZGVyJywge2Nob2ljZTogY2hvaWNlfSlcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNob2ljZUVsZW1lbnQgPSBSLmEoe2hyZWY6ICdKYXZhU2NyaXB0JyArICc6Jywgb25DbGljazogdGhpcy5vblNlbGVjdC5iaW5kKHRoaXMsIGNob2ljZSl9LFxuICAgICAgICAgICAgICAgICAgUi5zcGFuKHtjbGFzc05hbWU6ICdjaG9pY2UtbGFiZWwnfSxcbiAgICAgICAgICAgICAgICAgICAgY2hvaWNlLmxhYmVsXG4gICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgUi5zcGFuKHtjbGFzc05hbWU6ICdjaG9pY2Utc2FtcGxlJ30sXG4gICAgICAgICAgICAgICAgICAgIGNob2ljZS5zYW1wbGVcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgcmV0dXJuIFIubGkoe2tleTogaSwgY2xhc3NOYW1lOiAnY2hvaWNlJ30sXG4gICAgICAgICAgICAgICAgY2hvaWNlRWxlbWVudFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBub3Qgb3BlblxuICAgIHJldHVybiBudWxsO1xuICB9XG59KTtcbiIsIi8vICMgZmllbGQtdGVtcGxhdGUtY2hvaWNlcyBjb21wb25lbnRcblxuLypcbkdpdmUgYSBsaXN0IG9mIGNob2ljZXMgb2YgaXRlbSB0eXBlcyB0byBjcmVhdGUgYXMgY2hpbGRyZW4gb2YgYW4gZmllbGQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnRmllbGRUZW1wbGF0ZUNob2ljZXMnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHRoaXMucHJvcHMub25TZWxlY3QocGFyc2VJbnQoZXZlbnQudGFyZ2V0LnZhbHVlKSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgdmFyIGZpZWxkVGVtcGxhdGVzID0gY29uZmlnLmZpZWxkSXRlbUZpZWxkVGVtcGxhdGVzKGZpZWxkKTtcblxuICAgIHZhciB0eXBlQ2hvaWNlcyA9IG51bGw7XG4gICAgaWYgKGZpZWxkVGVtcGxhdGVzLmxlbmd0aCA+IDEpIHtcbiAgICAgIHR5cGVDaG9pY2VzID0gUi5zZWxlY3Qoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSwgdmFsdWU6IHRoaXMuZmllbGRUZW1wbGF0ZUluZGV4LCBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZX0sXG4gICAgICBmaWVsZFRlbXBsYXRlcy5tYXAoZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUsIGkpIHtcbiAgICAgICAgcmV0dXJuIFIub3B0aW9uKHtrZXk6IGksIHZhbHVlOiBpfSwgZmllbGRUZW1wbGF0ZS5sYWJlbCB8fCBpKTtcbiAgICAgIH0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHlwZUNob2ljZXMgPyB0eXBlQ2hvaWNlcyA6IFIuc3BhbihudWxsKTtcbiAgfVxufSk7XG4iLCIvLyAjIGZpZWxkIGNvbXBvbmVudFxuXG4vKlxuVXNlZCBieSBhbnkgZmllbGRzIHRvIHB1dCB0aGUgbGFiZWwgYW5kIGhlbHAgdGV4dCBhcm91bmQgdGhlIGZpZWxkLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIF8gPSByZXF1aXJlKCcuLi8uLi91bmRhc2gnKTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdGaWVsZCcsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29sbGFwc2VkOiB0aGlzLnByb3BzLmNvbmZpZy5maWVsZElzQ29sbGFwc2VkKHRoaXMucHJvcHMuZmllbGQpID8gdHJ1ZSA6IGZhbHNlXG4gICAgfTtcbiAgfSxcblxuICBvbkNsaWNrTGFiZWw6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGNvbGxhcHNlZDogIXRoaXMuc3RhdGUuY29sbGFwc2VkXG4gICAgfSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblxuICAgIGlmICh0aGlzLnByb3BzLnBsYWluKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wcy5jaGlsZHJlbjtcbiAgICB9XG5cbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgdmFyIGluZGV4ID0gdGhpcy5wcm9wcy5pbmRleDtcbiAgICBpZiAoIV8uaXNOdW1iZXIoaW5kZXgpKSB7XG4gICAgICB2YXIga2V5ID0gdGhpcy5wcm9wcy5maWVsZC5rZXk7XG4gICAgICBpbmRleCA9IF8uaXNOdW1iZXIoa2V5KSA/IGtleSA6IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICB2YXIgY2xhc3NlcyA9IF8uZXh0ZW5kKHt9LCB0aGlzLnByb3BzLmNsYXNzZXMpO1xuXG4gICAgdmFyIGVycm9ycyA9IGNvbmZpZy5maWVsZEVycm9ycyhmaWVsZCk7XG5cbiAgICBlcnJvcnMuZm9yRWFjaChmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgIGNsYXNzZXNbJ3ZhbGlkYXRpb24tZXJyb3ItJyArIGVycm9yLnR5cGVdID0gdHJ1ZTtcbiAgICB9KTtcblxuICAgIGlmIChjb25maWcuZmllbGRJc1JlcXVpcmVkKGZpZWxkKSkge1xuICAgICAgY2xhc3Nlcy5yZXF1aXJlZCA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNsYXNzZXMub3B0aW9uYWwgPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiBjeChjbGFzc2VzKSwgc3R5bGU6IHtkaXNwbGF5OiAoZmllbGQuaGlkZGVuID8gJ25vbmUnIDogJycpfX0sXG4gICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgnbGFiZWwnLCB7XG4gICAgICAgIGNvbmZpZzogY29uZmlnLCBmaWVsZDogZmllbGQsXG4gICAgICAgIGluZGV4OiBpbmRleCwgb25DbGljazogY29uZmlnLmZpZWxkSXNDb2xsYXBzaWJsZShmaWVsZCkgPyB0aGlzLm9uQ2xpY2tMYWJlbCA6IG51bGxcbiAgICAgIH0pLFxuICAgICAgY29uZmlnLmNzc1RyYW5zaXRpb25XcmFwcGVyKFxuICAgICAgICB0aGlzLnN0YXRlLmNvbGxhcHNlZCA/IFtdIDogW1xuICAgICAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdoZWxwJywge1xuICAgICAgICAgICAgY29uZmlnOiBjb25maWcsIGZpZWxkOiBmaWVsZCxcbiAgICAgICAgICAgIGtleTogJ2hlbHAnXG4gICAgICAgICAgfSksXG4gICAgICAgICAgdGhpcy5wcm9wcy5jaGlsZHJlblxuICAgICAgICBdXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG4iLCIvLyAjIGhlbHAgY29tcG9uZW50XG5cbi8qXG5KdXN0IHRoZSBoZWxwIHRleHQgYmxvY2suXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnSGVscCcsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGhlbHBUZXh0ID0gdGhpcy5wcm9wcy5jb25maWcuZmllbGRIZWxwVGV4dCh0aGlzLnByb3BzLmZpZWxkKTtcblxuICAgIHJldHVybiBoZWxwVGV4dCA/XG4gICAgICBSLmRpdih7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpLCBkYW5nZXJvdXNseVNldElubmVySFRNTDoge19faHRtbDogaGVscFRleHR9fSkgOlxuICAgICAgUi5zcGFuKG51bGwpO1xuICB9XG59KTtcbiIsIi8vICMgYnV0dG9uIGNvbXBvbmVudFxuXG4vKlxuICBDbGlja2FibGUgJ2J1dHRvbidcbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnSW5zZXJ0QnV0dG9uJyxcblxuICBwcm9wVHlwZXM6IHtcbiAgICBvbkNsaWNrOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIHJlZjogUmVhY3QuUHJvcFR5cGVzLnN0cmluZ1xuICB9LFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGEgcmVmPXt0aGlzLnByb3BzLnJlZn0gaHJlZj17J0phdmFTY3JpcHQnICsgJzonfSBvbkNsaWNrPXt0aGlzLnByb3BzLm9uQ2xpY2t9PlxuICAgICAgICB7dGhpcy5wcm9wcy5jaGlsZHJlbn1cbiAgICAgIDwvYT5cbiAgICApO1xuICB9XG5cbn0pO1xuIiwiLy8gIyBsYWJlbCBjb21wb25lbnRcblxuLypcbkp1c3QgdGhlIGxhYmVsIGZvciBhIGZpZWxkLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0xhYmVsJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICB2YXIgZmllbGRMYWJlbCA9IGNvbmZpZy5maWVsZExhYmVsKGZpZWxkKTtcblxuICAgIHZhciBsYWJlbCA9IG51bGw7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnByb3BzLmluZGV4ID09PSAnbnVtYmVyJykge1xuICAgICAgbGFiZWwgPSAnJyArICh0aGlzLnByb3BzLmluZGV4ICsgMSkgKyAnLic7XG4gICAgICBpZiAoZmllbGRMYWJlbCkge1xuICAgICAgICBsYWJlbCA9IGxhYmVsICsgJyAnICsgZmllbGRMYWJlbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZmllbGRMYWJlbCB8fCBsYWJlbCkge1xuICAgICAgdmFyIHRleHQgPSBsYWJlbCB8fCBmaWVsZExhYmVsO1xuICAgICAgaWYgKHRoaXMucHJvcHMub25DbGljaykge1xuICAgICAgICB0ZXh0ID0gUi5hKHtocmVmOiAnSmF2YVNjcmlwdCcgKyAnOicsIG9uQ2xpY2s6IHRoaXMucHJvcHMub25DbGlja30sIHRleHQpO1xuICAgICAgfVxuICAgICAgbGFiZWwgPSBSLmxhYmVsKHt9LCB0ZXh0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gUi5kaXYoe1xuICAgICAgY2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpXG4gICAgfSxcbiAgICAgIGxhYmVsLFxuICAgICAgJyAnLFxuICAgICAgUi5zcGFuKHtjbGFzc05hbWU6IGNvbmZpZy5maWVsZElzUmVxdWlyZWQoZmllbGQpID8gJ3JlcXVpcmVkLXRleHQnIDogJ25vdC1yZXF1aXJlZC10ZXh0J30pXG4gICAgKTtcbiAgfVxufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0xvYWRpbmdDaG9pY2UnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPHNwYW4+TG9hZGluZyBjaG9pY2VzLi4uPC9zcGFuPlxuICAgICk7XG4gIH1cblxufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0xvYWRpbmdDaG9pY2VzJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+TG9hZGluZyBjaG9pY2VzLi4uPC9kaXY+XG4gICAgKTtcbiAgfVxuXG59KTtcbiIsIi8vICMgbW92ZS1pdGVtLWJhY2sgY29tcG9uZW50XG5cbi8qXG5CdXR0b24gdG8gbW92ZSBhbiBpdGVtIGJhY2t3YXJkcyBpbiBsaXN0LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ01vdmVJdGVtQmFjaycsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGFiZWw6ICdbdXBdJ1xuICAgIH07XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUi5zcGFuKHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcyksIG9uQ2xpY2s6IHRoaXMucHJvcHMub25DbGlja30sIHRoaXMucHJvcHMubGFiZWwpO1xuICB9XG59KTtcbiIsIi8vICMgbW92ZS1pdGVtLWZvcndhcmQgY29tcG9uZW50XG5cbi8qXG5CdXR0b24gdG8gbW92ZSBhbiBpdGVtIGZvcndhcmQgaW4gYSBsaXN0LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ01vdmVJdGVtRm9yd2FyZCcsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGFiZWw6ICdbZG93bl0nXG4gICAgfTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSLnNwYW4oe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSwgb25DbGljazogdGhpcy5wcm9wcy5vbkNsaWNrfSwgdGhpcy5wcm9wcy5sYWJlbCk7XG4gIH1cbn0pO1xuIiwiLy8gIyBvYmplY3QtY29udHJvbCBjb21wb25lbnRcblxuLypcblJlbmRlciB0aGUgaXRlbSB0eXBlIGNob2ljZXMgYW5kIHRoZSBhZGQgYnV0dG9uLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ09iamVjdENvbnRyb2wnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZpZWxkVGVtcGxhdGVJbmRleDogMFxuICAgIH07XG4gIH0sXG5cbiAgb25TZWxlY3Q6IGZ1bmN0aW9uIChpbmRleCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZmllbGRUZW1wbGF0ZUluZGV4OiBpbmRleFxuICAgIH0pO1xuICB9LFxuXG4gIG9uQXBwZW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5wcm9wcy5vbkFwcGVuZCh0aGlzLnN0YXRlLmZpZWxkVGVtcGxhdGVJbmRleCk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcbiAgICB2YXIgZmllbGRUZW1wbGF0ZXMgPSBjb25maWcuZmllbGRDaGlsZEZpZWxkVGVtcGxhdGVzKGZpZWxkKTtcblxuICAgIHZhciB0eXBlQ2hvaWNlcyA9IG51bGw7XG5cbiAgICBpZiAoZmllbGRUZW1wbGF0ZXMubGVuZ3RoID4gMCkge1xuICAgICAgdHlwZUNob2ljZXMgPSBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQtdGVtcGxhdGUtY2hvaWNlcycsIHtcbiAgICAgICAgZmllbGQ6IGZpZWxkLFxuICAgICAgICBmaWVsZFRlbXBsYXRlSW5kZXg6IHRoaXMuc3RhdGUuZmllbGRUZW1wbGF0ZUluZGV4LCBvblNlbGVjdDogdGhpcy5vblNlbGVjdFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3Nlcyl9LFxuICAgICAgdHlwZUNob2ljZXMsICcgJyxcbiAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdhZGQtaXRlbScsIHtvbkNsaWNrOiB0aGlzLm9uQXBwZW5kfSlcbiAgICApO1xuICB9XG59KTtcbiIsIi8vICMgb2JqZWN0LWl0ZW0tY29udHJvbCBjb21wb25lbnRcblxuLypcblJlbmRlciB0aGUgcmVtb3ZlIGJ1dHRvbnMgZm9yIGFuIG9iamVjdCBpdGVtLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnT2JqZWN0SXRlbUNvbnRyb2wnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgb25SZW1vdmU6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnByb3BzLm9uUmVtb3ZlKHRoaXMucHJvcHMuaXRlbUtleSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpfSxcbiAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdyZW1vdmUtaXRlbScsIHtmaWVsZDogZmllbGQsIG9uQ2xpY2s6IHRoaXMub25SZW1vdmV9KVxuICAgICk7XG4gIH1cbn0pO1xuIiwiLy8gIyBvYmplY3QtaXRlbS1rZXkgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgYW4gb2JqZWN0IGl0ZW0ga2V5IGVkaXRvci5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ09iamVjdEl0ZW1LZXknLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSLmlucHV0KHtcbiAgICAgIGNsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSxcbiAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgIHZhbHVlOiB0aGlzLnByb3BzLmRpc3BsYXlLZXksXG4gICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgIG9uRm9jdXM6IHRoaXMub25Gb2N1c0FjdGlvbixcbiAgICAgIG9uQmx1cjogdGhpcy5vbkJsdXJBY3Rpb25cbiAgICB9KTtcbiAgfVxufSk7XG4iLCIvLyAjIG9iamVjdC1pdGVtLXZhbHVlIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIHRoZSB2YWx1ZSBvZiBhbiBvYmplY3QgaXRlbS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ09iamVjdEl0ZW1WYWx1ZScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBvbkNoYW5nZUZpZWxkOiBmdW5jdGlvbiAobmV3VmFsdWUsIGluZm8pIHtcbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHRoaXMucHJvcHMuaXRlbUtleSwgbmV3VmFsdWUsIGluZm8pO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKX0sXG4gICAgICBjb25maWcuY3JlYXRlRmllbGRFbGVtZW50KHtmaWVsZDogZmllbGQsIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlRmllbGQsIHBsYWluOiB0cnVlLCBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvbn0pXG4gICAgKTtcbiAgfVxufSk7XG4iLCIvLyAjIG9iamVjdC1pdGVtIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIGFuIG9iamVjdCBpdGVtLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnT2JqZWN0SXRlbScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBvbkNoYW5nZUtleTogZnVuY3Rpb24gKG5ld0tleSkge1xuICAgIHRoaXMucHJvcHMub25Nb3ZlKHRoaXMucHJvcHMuaXRlbUtleSwgbmV3S2V5KTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3Nlcyl9LFxuICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ29iamVjdC1pdGVtLWtleScsIHtmaWVsZDogZmllbGQsIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlS2V5LCBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvbiwgZGlzcGxheUtleTogdGhpcy5wcm9wcy5kaXNwbGF5S2V5LCBpdGVtS2V5OiB0aGlzLnByb3BzLml0ZW1LZXl9KSxcbiAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdvYmplY3QtaXRlbS12YWx1ZScsIHtmaWVsZDogZmllbGQsIG9uQ2hhbmdlOiB0aGlzLnByb3BzLm9uQ2hhbmdlLCBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvbiwgaXRlbUtleTogdGhpcy5wcm9wcy5pdGVtS2V5fSksXG4gICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgnb2JqZWN0LWl0ZW0tY29udHJvbCcsIHtmaWVsZDogZmllbGQsIG9uUmVtb3ZlOiB0aGlzLnByb3BzLm9uUmVtb3ZlLCBpdGVtS2V5OiB0aGlzLnByb3BzLml0ZW1LZXl9KVxuICAgICk7XG4gIH1cbn0pO1xuIiwiLy8gIyBwcmV0dHktc2VsZWN0LWlucHV0IGNvbXBvbmVudFxuXG4vKlxuICAgUmVuZGVyIGFuIGlucHV0IHRvIGJlIHVzZWQgYXMgdGhlIGVsZW1lbnQgZm9yIHR5cGluZyBhIGN1c3RvbSB2YWx1ZSBpbnRvIGEgcHJldHR5IHNlbGVjdC5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIF8gPSByZXF1aXJlKCd1bmRlcnNjb3JlJyk7XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnUHJldHR5U2VsZWN0SW5wdXQnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIGZvY3VzOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5yZWZzLnRleHRCb3guZm9jdXMoKTtcbiAgfSxcblxuICBzZXRDaG9pY2VzT3BlbjogZnVuY3Rpb24gKGlzT3BlbkNob2ljZXMpIHtcbiAgICB0aGlzLnJlZnMudGV4dEJveC5zZXRDaG9pY2VzT3Blbihpc09wZW5DaG9pY2VzKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMuY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ3ByZXR0eS10ZXh0LWhlbHBlcicsIHtcbiAgICAgIGNsYXNzZXM6IHRoaXMucHJvcHMuY2xhc3NlcyxcbiAgICAgIHRhYkluZGV4OiB0aGlzLnByb3BzLmZpZWxkLnRhYkluZGV4LFxuICAgICAgb25DaGFuZ2U6IHRoaXMucHJvcHMub25DaGFuZ2UsXG4gICAgICBvbkZvY3VzOiB0aGlzLnByb3BzLm9uRm9jdXMsXG4gICAgICBvbkJsdXI6IHRoaXMucHJvcHMub25CbHVyLFxuICAgICAgb25BY3Rpb246IHRoaXMub25CdWJibGVBY3Rpb24sXG4gICAgICBmaWVsZDogdGhpcy5wcm9wcy5maWVsZCxcbiAgICAgIHZhbHVlOiB0aGlzLnByb3BzLmlzRW50ZXJpbmdDdXN0b21WYWx1ZSA/IHRoaXMucHJvcHMuZmllbGQudmFsdWUgOiB0aGlzLnByb3BzLmdldERpc3BsYXlWYWx1ZSgpLFxuICAgICAgc2VsZWN0ZWRDaG9pY2VzOiB0aGlzLnByb3BzLmNvbmZpZy5maWVsZFNlbGVjdGVkUmVwbGFjZUNob2ljZXModGhpcy5wcm9wcy5maWVsZCksXG4gICAgICByZXBsYWNlQ2hvaWNlczogdGhpcy5wcm9wcy5jb25maWcuZmllbGRSZXBsYWNlQ2hvaWNlcyh0aGlzLnByb3BzLmZpZWxkKSxcbiAgICAgIG9uVGFnQ2xpY2s6IHRoaXMub25UYWdDbGljayxcbiAgICAgIHJlZjogJ3RleHRCb3gnLFxuICAgICAgcmVhZE9ubHk6ICF0aGlzLnByb3BzLmlzRW50ZXJpbmdDdXN0b21WYWx1ZVxuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMucHJvcHMuaXNFbnRlcmluZ0N1c3RvbVZhbHVlKSB7XG4gICAgICByZXR1cm4gPGlucHV0IGNsYXNzTmFtZT17Y3goXy5leHRlbmQoe30sIHRoaXMucHJvcHMuY2xhc3NlcykpfSB0eXBlPVwidGV4dFwiIHZhbHVlPXt0aGlzLnByb3BzLmZpZWxkLnZhbHVlfVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5wcm9wcy5vbkNoYW5nZX0gb25Gb2N1cz17dGhpcy5wcm9wcy5vbkZvY3VzfSBvbkJsdXI9e3RoaXMucHJvcHMub25CbHVyfSAvPjtcbiAgICB9XG5cbiAgICByZXR1cm4gPGlucHV0IHR5cGU9XCJ0ZXh0XCIgdmFsdWU9e3RoaXMucHJvcHMuZ2V0RGlzcGxheVZhbHVlKCl9IHJlYWRPbmx5IG9uRm9jdXM9e3RoaXMucHJvcHMub25Gb2N1c30gb25CbHVyPXt0aGlzLnByb3BzLm9uQmx1cn0gLz47XG4gIH0sXG5cbn0pO1xuIiwiLy8gIyBwcmV0dHktc2VsZWN0LXZhbHVlIGNvbXBvbmVudFxuXG4vKlxuICAgUmVuZGVyIGEgc2VsZWN0IGRyb3Bkb3duIGZvciBhIGxpc3Qgb2YgY2hvaWNlcy4gQ2hvaWNlcyB2YWx1ZXMgY2FuIGJlIG9mIGFueVxuICAgdHlwZS4gRG9lcyBub3QgdXNlIG5hdGl2ZSBzZWxlY3QgZHJvcGRvd24uIENob2ljZXMgY2FuIG9wdGlvbmFsbHkgaW5jbHVkZVxuICAgJ3NhbXBsZScgcHJvcGVydHkgZGlzcGxheWVkIGdyYXllZCBvdXQuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBfID0gcmVxdWlyZSgndW5kZXJzY29yZScpO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ1NlbGVjdFZhbHVlJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB2YXIgY2hvaWNlVmFsdWUgPSBldmVudC50YXJnZXQudmFsdWU7XG4gICAgdmFyIGNob2ljZVR5cGUgPSBjaG9pY2VWYWx1ZS5zdWJzdHJpbmcoMCwgY2hvaWNlVmFsdWUuaW5kZXhPZignOicpKTtcbiAgICBpZiAoY2hvaWNlVHlwZSA9PT0gJ2Nob2ljZScpIHtcbiAgICAgIHZhciBjaG9pY2VJbmRleCA9IGNob2ljZVZhbHVlLnN1YnN0cmluZyhjaG9pY2VWYWx1ZS5pbmRleE9mKCc6JykgKyAxKTtcbiAgICAgIGNob2ljZUluZGV4ID0gcGFyc2VJbnQoY2hvaWNlSW5kZXgpO1xuICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZSh0aGlzLnByb3BzLmNob2ljZXNbY2hvaWNlSW5kZXhdLnZhbHVlKTtcbiAgICB9XG4gIH0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNob2ljZXM6IFtdXG4gICAgfTtcbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBkZWZhdWx0VmFsdWUgPSB0aGlzLnByb3BzLmZpZWxkLnZhbHVlICE9PSB1bmRlZmluZWQgPyB0aGlzLnByb3BzLmZpZWxkLnZhbHVlIDogJyc7XG5cbiAgICByZXR1cm4ge1xuICAgICAgaXNDaG9pY2VzT3BlbjogdGhpcy5wcm9wcy5pc0Nob2ljZXNPcGVuLFxuICAgICAgdmFsdWU6IGRlZmF1bHRWYWx1ZSxcbiAgICAgIGlzRW50ZXJpbmdDdXN0b21WYWx1ZTogZmFsc2VcbiAgICB9O1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNob2ljZXMgPSB0aGlzLnByb3BzLmNvbmZpZy5ub3JtYWxpemVQcmV0dHlDaG9pY2VzKHRoaXMucHJvcHMuY2hvaWNlcyk7XG4gICAgdmFyIGNob2ljZXNPckxvYWRpbmc7XG5cbiAgICBpZiAoKGNob2ljZXMubGVuZ3RoID4gMSAmJiBjaG9pY2VzWzBdLnZhbHVlID09PSAnLy8vbG9hZGluZy8vLycpIHx8IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkSXNMb2FkaW5nKHRoaXMucHJvcHMuZmllbGQpKSB7XG4gICAgICBjaG9pY2VzID0gW3t2YWx1ZTogJy8vL2xvYWRpbmcvLy8nfV07XG4gICAgfVxuICAgIHZhciBjaG9pY2VzRWxlbSA9IHRoaXMucHJvcHMuY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2Nob2ljZXMnLCB7XG4gICAgICByZWY6ICdjaG9pY2VzJyxcbiAgICAgIGNob2ljZXM6IGNob2ljZXMsXG4gICAgICBvcGVuOiB0aGlzLnN0YXRlLmlzQ2hvaWNlc09wZW4sXG4gICAgICBpZ25vcmVDbG9zZU5vZGVzOiB0aGlzLmdldENsb3NlSWdub3JlTm9kZXMsXG4gICAgICBvblNlbGVjdDogdGhpcy5vblNlbGVjdENob2ljZSxcbiAgICAgIG9uQ2xvc2U6IHRoaXMub25DbG9zZUNob2ljZXMsXG4gICAgICBvbkNob2ljZUFjdGlvbjogdGhpcy5vbkNob2ljZUFjdGlvbixcbiAgICAgIGZpZWxkOiB0aGlzLnByb3BzLmZpZWxkXG4gICAgfSk7XG5cbiAgICB2YXIgaW5wdXRFbGVtID0gdGhpcy5nZXRJbnB1dEVsZW1lbnQoKTtcblxuICAgIGNob2ljZXNPckxvYWRpbmcgPSAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT17Y3goXy5leHRlbmQoe30sIHRoaXMucHJvcHMuY2xhc3NlcywgeydjaG9pY2VzLW9wZW4nOiB0aGlzLnN0YXRlLmlzQ2hvaWNlc09wZW59KSl9XG4gICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uQ2hhbmdlfT5cblxuICAgICAgICA8ZGl2IHJlZj1cInRvZ2dsZVwiIG9uQ2xpY2s9e3RoaXMub25Ub2dnbGVDaG9pY2VzfT5cbiAgICAgICAgICB7aW5wdXRFbGVtfVxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInNlbGVjdC1hcnJvd1wiIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICB7Y2hvaWNlc0VsZW19XG4gICAgICA8L2Rpdj5cbiAgICApO1xuXG4gICAgcmV0dXJuIGNob2ljZXNPckxvYWRpbmc7XG4gIH0sXG5cbiAgZ2V0SW5wdXRFbGVtZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMuY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ3ByZXR0eS1zZWxlY3QtaW5wdXQnLCB7XG4gICAgICBmaWVsZDogdGhpcy5wcm9wcy5maWVsZCxcbiAgICAgIHJlZjogJ2N1c3RvbUlucHV0JyxcbiAgICAgIGlzRW50ZXJpbmdDdXN0b21WYWx1ZTogdGhpcy5zdGF0ZS5pc0VudGVyaW5nQ3VzdG9tVmFsdWUsXG4gICAgICBvbkNoYW5nZTogdGhpcy5vbklucHV0Q2hhbmdlLFxuICAgICAgb25Gb2N1czogdGhpcy5vbkZvY3VzQWN0aW9uLFxuICAgICAgb25CbHVyOiB0aGlzLm9uQmx1cixcbiAgICAgIG9uQWN0aW9uOiB0aGlzLm9uQnViYmxlQWN0aW9uLFxuICAgICAgZ2V0RGlzcGxheVZhbHVlOiB0aGlzLmdldERpc3BsYXlWYWx1ZVxuICAgIH0pO1xuICB9LFxuXG4gIGJsdXJMYXRlcjogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIHNlbGYub25CbHVyQWN0aW9uKCk7XG4gICAgfSwgMCk7XG4gIH0sXG5cbiAgb25CbHVyOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLnN0YXRlLmlzQ2hvaWNlc09wZW4pIHtcbiAgICAgIHRoaXMuYmx1ckxhdGVyKCk7XG4gICAgfVxuICB9LFxuXG4gIGdldENsb3NlSWdub3JlTm9kZXM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZWZzLnRvZ2dsZS5nZXRET01Ob2RlKCk7XG4gIH0sXG5cbiAgb25Ub2dnbGVDaG9pY2VzOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zZXRDaG9pY2VzT3BlbighdGhpcy5zdGF0ZS5pc0Nob2ljZXNPcGVuKTtcbiAgfSxcblxuICBzZXRDaG9pY2VzT3BlbjogZnVuY3Rpb24gKGlzT3Blbikge1xuICAgIHZhciBhY3Rpb24gPSBpc09wZW4gPyAnb3Blbi1jaG9pY2VzJyA6ICdjbG9zZS1jaG9pY2VzJztcbiAgICB0aGlzLm9uU3RhcnRBY3Rpb24oYWN0aW9uKTtcbiAgICB0aGlzLnNldFN0YXRlKHsgaXNDaG9pY2VzT3BlbjogaXNPcGVuIH0pO1xuICB9LFxuXG4gIG9uU2VsZWN0Q2hvaWNlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGlzRW50ZXJpbmdDdXN0b21WYWx1ZTogZmFsc2UsXG4gICAgICBpc0Nob2ljZXNPcGVuOiBmYWxzZSxcbiAgICAgIHZhbHVlOiB2YWx1ZVxuICAgIH0pO1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UodmFsdWUpO1xuICAgIHRoaXMuYmx1ckxhdGVyKCk7XG4gIH0sXG5cbiAgb25DbG9zZUNob2ljZXM6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5pc0Nob2ljZXNPcGVuKSB7XG4gICAgICB0aGlzLmJsdXJMYXRlcigpO1xuICAgICAgdGhpcy5zZXRDaG9pY2VzT3BlbihmYWxzZSk7XG4gICAgfVxuICB9LFxuXG4gIGdldERpc3BsYXlWYWx1ZTogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgY3VycmVudFZhbHVlID0gdGhpcy5zdGF0ZS52YWx1ZTtcbiAgICB2YXIgY3VycmVudENob2ljZSA9IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkU2VsZWN0ZWRDaG9pY2UodGhpcy5wcm9wcy5maWVsZCk7XG4gICAgLy8gTWFrZSBzdXJlIHNlbGVjdGVkQ2hvaWNlIGlzIGEgbWF0Y2ggZm9yIGN1cnJlbnQgdmFsdWUuXG4gICAgaWYgKGN1cnJlbnRDaG9pY2UgJiYgY3VycmVudENob2ljZS52YWx1ZSAhPT0gY3VycmVudFZhbHVlKSB7XG4gICAgICBjdXJyZW50Q2hvaWNlID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKCFjdXJyZW50Q2hvaWNlKSB7XG4gICAgICBjdXJyZW50Q2hvaWNlID0gXy5maW5kKHRoaXMucHJvcHMuY2hvaWNlcywgZnVuY3Rpb24gKGNob2ljZSkge1xuICAgICAgICByZXR1cm4gIWNob2ljZS5hY3Rpb24gJiYgY2hvaWNlLnZhbHVlID09PSBjdXJyZW50VmFsdWU7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoY3VycmVudENob2ljZSkge1xuICAgICAgcmV0dXJuIGN1cnJlbnRDaG9pY2UubGFiZWw7XG4gICAgfSBlbHNlIGlmIChjdXJyZW50VmFsdWUpIHsgLy8gY3VzdG9tIHZhbHVlXG4gICAgICByZXR1cm4gY3VycmVudFZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gY29uZmlnLmZpZWxkUGxhY2Vob2xkZXIodGhpcy5wcm9wcy5maWVsZCkgfHwgJyc7XG4gIH0sXG5cbiAgb25DaG9pY2VBY3Rpb246IGZ1bmN0aW9uIChjaG9pY2UpIHtcbiAgICBpZiAoY2hvaWNlLmFjdGlvbiA9PT0gJ2VudGVyLWN1c3RvbS12YWx1ZScpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBpc0VudGVyaW5nQ3VzdG9tVmFsdWU6IHRydWUsXG4gICAgICAgIGlzQ2hvaWNlc09wZW46IGZhbHNlLFxuICAgICAgICB2YWx1ZTogY2hvaWNlLnZhbHVlXG4gICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMucmVmcy5jdXN0b21JbnB1dC5mb2N1cygpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChjaG9pY2UuYWN0aW9uID09PSAnaW5zZXJ0LWZpZWxkJykge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGlzQ2hvaWNlc09wZW46IGZhbHNlXG4gICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMucmVmcy5jdXN0b21JbnB1dC5zZXRDaG9pY2VzT3Blbih0cnVlKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgaXNDaG9pY2VzT3BlbjogISFjaG9pY2UuaXNPcGVuXG4gICAgICB9KTtcbiAgICAgIGlmIChjaG9pY2UuYWN0aW9uID09PSAnY2xlYXItY3VycmVudC1jaG9pY2UnKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIHZhbHVlOiAnJ1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZSgnJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5vblN0YXJ0QWN0aW9uKGNob2ljZS5hY3Rpb24sIGNob2ljZSk7XG4gIH0sXG5cbiAgLy8gSXMgdGhpcyBldmVuIHVzZWQ/IEkgZG9uJ3QgdGhpbmsgc28uXG4gIG9uQWN0aW9uOiBmdW5jdGlvbiAocGFyYW1zKSB7XG4gICAgaWYgKHBhcmFtcy5hY3Rpb24gPT09ICdlbnRlci1jdXN0b20tdmFsdWUnKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtpc0VudGVyaW5nQ3VzdG9tVmFsdWU6IHRydWV9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMucmVmcy5jdXN0b21JbnB1dC5mb2N1cygpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHRoaXMub25CdWJibGVBY3Rpb24ocGFyYW1zKTtcbiAgfSxcblxuICBvbklucHV0Q2hhbmdlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHZhbHVlKTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHZhbHVlOiB2YWx1ZVxuICAgIH0pO1xuICB9XG59KTtcbiIsIi8vICMgcHJldHR5LXRhZyBjb21wb25lbnRcblxuLypcbiAgIFByZXR0eSB0ZXh0IHRhZ1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgXyA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUnKTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdQcmV0dHlUYWcnLFxuXG4gIHByb3BUeXBlczoge1xuICAgIHRhZzogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcbiAgICByZXBsYWNlQ2hvaWNlczogUmVhY3QuUHJvcFR5cGVzLmFycmF5LFxuICAgIG9uQ2xpY2s6IFJlYWN0LlByb3BUeXBlcy5mdW5jLFxuICAgIGNsYXNzZXM6IFJlYWN0LlByb3BUeXBlcy5vYmplY3RcbiAgfSxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNsYXNzZXMgPSBjeChfLmV4dGVuZCh7fSwgdGhpcy5wcm9wcy5jbGFzc2VzLCB7J3ByZXR0eS1wYXJ0JzogdHJ1ZX0pKTtcblxuICAgIHJldHVybiAoXG4gICAgICA8c3BhbiBjbGFzc05hbWU9e2NsYXNzZXN9IG9uQ2xpY2s9e3RoaXMucHJvcHMub25DbGlja30+XG4gICAgICAgIHt0aGlzLnByb3BzLmNoaWxkcmVufVxuICAgICAgPC9zcGFuPlxuICAgICk7XG4gIH1cbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuLyogZ2xvYmFsIENvZGVNaXJyb3IgKi9cbi8qZXNsaW50IG5vLXNjcmlwdC11cmw6MCAqL1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBUYWdUcmFuc2xhdG9yID0gcmVxdWlyZSgnLi90YWctdHJhbnNsYXRvcicpO1xudmFyIF8gPSByZXF1aXJlKCcuLi8uLi91bmRhc2gnKTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxuLypcbiAgIEVkaXRvciBmb3IgdGFnZ2VkIHRleHQuIFJlbmRlcnMgdGV4dCBsaWtlIFwiaGVsbG8ge3tmaXJzdE5hbWV9fVwiXG4gICB3aXRoIHJlcGxhY2VtZW50IGxhYmVscyByZW5kZXJlZCBpbiBhIHBpbGwgYm94LiBEZXNpZ25lZCB0byBsb2FkXG4gICBxdWlja2x5IHdoZW4gbWFueSBzZXBhcmF0ZSBpbnN0YW5jZXMgb2YgaXQgYXJlIG9uIHRoZSBzYW1lXG4gICBwYWdlLlxuXG4gICBVc2VzIENvZGVNaXJyb3IgdG8gZWRpdCB0ZXh0LiBUbyBzYXZlIG1lbW9yeSB0aGUgQ29kZU1pcnJvciBub2RlIGlzXG4gICBpbnN0YW50aWF0ZWQgd2hlbiB0aGUgdXNlciBtb3ZlcyB0aGUgbW91c2UgaW50byB0aGUgZWRpdCBhcmVhLlxuICAgSW5pdGlhbGx5IGEgcmVhZC1vbmx5IHZpZXcgdXNpbmcgYSBzaW1wbGUgZGl2IGlzIHNob3duLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ1ByZXR0eVRleHRIZWxwZXInLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY3JlYXRlRWRpdG9yKCk7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkVXBkYXRlOiBmdW5jdGlvbihwcmV2UHJvcHMsIHByZXZTdGF0ZSkge1xuICAgIGlmIChwcmV2U3RhdGUuY29kZU1pcnJvck1vZGUgIT09IHRoaXMuc3RhdGUuY29kZU1pcnJvck1vZGUpIHtcbiAgICAgIC8vIENoYW5nZWQgZnJvbSBjb2RlIG1pcnJvciBtb2RlIHRvIHJlYWQgb25seSBtb2RlIG9yIHZpY2UgdmVyc2EsXG4gICAgICAvLyBzbyBzZXR1cCB0aGUgb3RoZXIgZWRpdG9yLlxuICAgICAgdGhpcy5jcmVhdGVFZGl0b3IoKTtcbiAgICB9XG4gICAgdGhpcy51cGRhdGVFZGl0b3IoKTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUuY29kZU1pcnJvck1vZGUpIHtcbiAgICAgIHRoaXMucmVtb3ZlQ29kZU1pcnJvckVkaXRvcigpO1xuICAgIH1cbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxlY3RlZENob2ljZXMgPSB0aGlzLnByb3BzLnNlbGVjdGVkQ2hvaWNlcztcbiAgICB2YXIgcmVwbGFjZUNob2ljZXMgPSB0aGlzLnByb3BzLnJlcGxhY2VDaG9pY2VzO1xuICAgIHZhciB0cmFuc2xhdG9yID0gVGFnVHJhbnNsYXRvcihzZWxlY3RlZENob2ljZXMuY29uY2F0KHJlcGxhY2VDaG9pY2VzKSwgdGhpcy5wcm9wcy5jb25maWcuaHVtYW5pemUpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHZhbHVlOiB0aGlzLnByb3BzLnZhbHVlLFxuICAgICAgY29kZU1pcnJvck1vZGU6IGZhbHNlLFxuICAgICAgaXNDaG9pY2VzT3BlbjogZmFsc2UsXG4gICAgICByZXBsYWNlQ2hvaWNlczogcmVwbGFjZUNob2ljZXMsXG4gICAgICB0cmFuc2xhdG9yOiB0cmFuc2xhdG9yXG4gICAgfTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbihuZXh0UHJvcHMpIHtcbiAgICB2YXIgc2VsZWN0ZWRDaG9pY2VzID0gdGhpcy5wcm9wcy5zZWxlY3RlZENob2ljZXM7XG4gICAgdmFyIHJlcGxhY2VDaG9pY2VzID0gdGhpcy5wcm9wcy5yZXBsYWNlQ2hvaWNlcztcbiAgICB2YXIgbmV4dFN0YXRlID0ge1xuICAgICAgcmVwbGFjZUNob2ljZXM6IHJlcGxhY2VDaG9pY2VzLFxuICAgICAgdHJhbnNsYXRvcjogVGFnVHJhbnNsYXRvcihzZWxlY3RlZENob2ljZXMuY29uY2F0KHJlcGxhY2VDaG9pY2VzKSwgdGhpcy5wcm9wcy5jb25maWcuaHVtYW5pemUpXG4gICAgfTtcblxuICAgIC8vIE5vdCBzdXJlIHdoYXQgdGhlIG51bGwvdW5kZWZpbmVkIGNoZWNrcyBhcmUgaGVyZSBmb3IsIGJ1dCBjaGFuZ2VkIGZyb20gZmFsc2V5IHdoaWNoIHdhcyBicmVha2luZy5cbiAgICBpZiAodGhpcy5zdGF0ZS52YWx1ZSAhPT0gbmV4dFByb3BzLnZhbHVlICYmICFfLmlzVW5kZWZpbmVkKG5leHRQcm9wcy52YWx1ZSkgJiYgbmV4dFByb3BzLnZhbHVlICE9PSBudWxsKSB7XG4gICAgICBuZXh0U3RhdGUudmFsdWUgPSBuZXh0UHJvcHMudmFsdWU7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZShuZXh0U3RhdGUpO1xuICB9LFxuXG4gIGhhbmRsZUNob2ljZVNlbGVjdGlvbjogZnVuY3Rpb24gKGtleSwgZXZlbnQpIHtcbiAgICBjb25zdCBzZWxlY3RDaG9pY2UgPSAoKSA9PiB7XG4gICAgICB2YXIgcG9zID0gdGhpcy5zdGF0ZS5zZWxlY3RlZFRhZ1BvcztcbiAgICAgIHZhciB0YWcgPSAne3snICsga2V5ICsgJ319JztcblxuICAgICAgaWYgKHBvcykge1xuICAgICAgICB0aGlzLmNvZGVNaXJyb3IucmVwbGFjZVJhbmdlKHRhZywge2xpbmU6IHBvcy5saW5lLCBjaDogcG9zLnN0YXJ0fSwge2xpbmU6IHBvcy5saW5lLCBjaDogcG9zLnN0b3B9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY29kZU1pcnJvci5yZXBsYWNlU2VsZWN0aW9uKHRhZywgJ2VuZCcpO1xuICAgICAgfVxuICAgICAgdGhpcy5jb2RlTWlycm9yLmZvY3VzKCk7XG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBpc0Nob2ljZXNPcGVuOiBmYWxzZSwgc2VsZWN0ZWRUYWdQb3M6IG51bGwgfSk7XG4gICAgfTtcbiAgICBpZiAodGhpcy5zdGF0ZS5jb2RlTWlycm9yTW9kZSkge1xuICAgICAgc2VsZWN0Q2hvaWNlKCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLnJlYWRPbmx5KSB7XG4gICAgICAvLyBoYWNrZXR5IGhhY2sgdG8gc3RvcCBkcm9wZG93biBjaG9pY2VzIGZyb20gdG9nZ2xpbmdcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZSgne3snICsga2V5ICsgJ319Jyk7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgaXNDaG9pY2VzT3BlbjogZmFsc2UgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc3dpdGNoVG9Db2RlTWlycm9yKHNlbGVjdENob2ljZSk7XG4gICAgfVxuICB9LFxuXG4gIGZvY3VzOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zd2l0Y2hUb0NvZGVNaXJyb3IoKCkgPT4ge1xuICAgICAgdGhpcy5jb2RlTWlycm9yLmZvY3VzKCk7XG4gICAgICB0aGlzLmNvZGVNaXJyb3Iuc2V0Q3Vyc29yKHRoaXMuY29kZU1pcnJvci5saW5lQ291bnQoKSwgMCk7XG4gICAgfSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciB0ZXh0Qm94Q2xhc3NlcyA9IGN4KF8uZXh0ZW5kKHt9LCB0aGlzLnByb3BzLmNsYXNzZXMsIHsncHJldHR5LXRleHQtYm94JzogdHJ1ZX0pKTtcblxuICAgIHZhciBvbkluc2VydENsaWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7c2VsZWN0ZWRUYWdQb3M6IG51bGx9KTtcbiAgICAgIHRoaXMub25Ub2dnbGVDaG9pY2VzKCk7XG4gICAgfTtcbiAgICB2YXIgaW5zZXJ0QnRuID0gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2luc2VydC1idXR0b24nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cmVmOiAndG9nZ2xlJywgb25DbGljazogb25JbnNlcnRDbGljay5iaW5kKHRoaXMpfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0luc2VydC4uLicpO1xuXG4gICAgdmFyIGNob2ljZXMgPSBjb25maWcuY3JlYXRlRWxlbWVudCgnY2hvaWNlcycsIHtcbiAgICAgIHJlZjogJ2Nob2ljZXMnLFxuICAgICAgY2hvaWNlczogdGhpcy5zdGF0ZS5yZXBsYWNlQ2hvaWNlcyxcbiAgICAgIG9wZW46IHRoaXMuc3RhdGUuaXNDaG9pY2VzT3BlbixcbiAgICAgIGlnbm9yZUNsb3NlTm9kZXM6IHRoaXMuZ2V0Q2xvc2VJZ25vcmVOb2RlcyxcbiAgICAgIG9uU2VsZWN0OiB0aGlzLmhhbmRsZUNob2ljZVNlbGVjdGlvbixcbiAgICAgIG9uQ2xvc2U6IHRoaXMub25DbG9zZUNob2ljZXMsXG4gICAgICBpc0FjY29yZGlvbjogdGhpcy5wcm9wcy5pc0FjY29yZGlvbixcbiAgICAgIGZpZWxkOiB0aGlzLnByb3BzLmZpZWxkXG4gICAgfSk7XG5cbiAgICAvLyBSZW5kZXIgcmVhZC1vbmx5IHZlcnNpb24uXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXtjeCh7J3ByZXR0eS10ZXh0LXdyYXBwZXInOiB0cnVlLCAnY2hvaWNlcy1vcGVuJzogdGhpcy5zdGF0ZS5pc0Nob2ljZXNPcGVufSl9IG9uTW91c2VFbnRlcj17dGhpcy5zd2l0Y2hUb0NvZGVNaXJyb3J9PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17dGV4dEJveENsYXNzZXN9IHRhYkluZGV4PXt0aGlzLnByb3BzLnRhYkluZGV4fSBvbkZvY3VzPXt0aGlzLnByb3BzLm9uRm9jdXN9IG9uQmx1cj17dGhpcy5wcm9wcy5vbkJsdXJ9PlxuICAgICAgICAgIDxkaXYgcmVmPSd0ZXh0Qm94JyBjbGFzc05hbWU9J2ludGVybmFsLXRleHQtd3JhcHBlcicgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIHtpbnNlcnRCdG59XG4gICAgICAgIHtjaG9pY2VzfVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfSxcblxuICBnZXRDbG9zZUlnbm9yZU5vZGVzOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVmcy50b2dnbGUuZ2V0RE9NTm9kZSgpO1xuICB9LFxuXG4gIG9uVG9nZ2xlQ2hvaWNlczogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc2V0Q2hvaWNlc09wZW4oIXRoaXMuc3RhdGUuaXNDaG9pY2VzT3Blbik7XG4gIH0sXG5cbiAgc2V0Q2hvaWNlc09wZW46IGZ1bmN0aW9uIChpc09wZW4pIHtcbiAgICB2YXIgYWN0aW9uID0gaXNPcGVuID8gJ29wZW4tcmVwbGFjZW1lbnRzJyA6ICdjbG9zZS1yZXBsYWNlbWVudHMnO1xuICAgIHRoaXMub25TdGFydEFjdGlvbihhY3Rpb24pO1xuICAgIHRoaXMuc2V0U3RhdGUoeyBpc0Nob2ljZXNPcGVuOiBpc09wZW4gfSk7XG4gIH0sXG5cbiAgb25DbG9zZUNob2ljZXM6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5pc0Nob2ljZXNPcGVuKSB7XG4gICAgICB0aGlzLnNldENob2ljZXNPcGVuKGZhbHNlKTtcbiAgICB9XG4gIH0sXG5cbiAgY3JlYXRlRWRpdG9yOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUuY29kZU1pcnJvck1vZGUpIHtcbiAgICAgIHRoaXMuY3JlYXRlQ29kZU1pcnJvckVkaXRvcigpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNyZWF0ZVJlYWRvbmx5RWRpdG9yKCk7XG4gICAgfVxuICB9LFxuXG4gIHVwZGF0ZUVkaXRvcjogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnN0YXRlLmNvZGVNaXJyb3JNb2RlKSB7XG4gICAgICB2YXIgY29kZU1pcnJvclZhbHVlID0gdGhpcy5jb2RlTWlycm9yLmdldFZhbHVlKCk7XG4gICAgICBpZiAoY29kZU1pcnJvclZhbHVlICE9PSB0aGlzLnN0YXRlLnZhbHVlKSB7XG4gICAgICAgIC8vIHN3aXRjaCBiYWNrIHRvIHJlYWQtb25seSBtb2RlIHRvIG1ha2UgaXQgZWFzaWVyIHRvIHJlbmRlclxuICAgICAgICB0aGlzLnJlbW92ZUNvZGVNaXJyb3JFZGl0b3IoKTtcbiAgICAgICAgdGhpcy5jcmVhdGVSZWFkb25seUVkaXRvcigpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBjb2RlTWlycm9yTW9kZTogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY3JlYXRlUmVhZG9ubHlFZGl0b3IoKTtcbiAgICB9XG4gIH0sXG5cbiAgY3JlYXRlQ29kZU1pcnJvckVkaXRvcjogZnVuY3Rpb24gKCkge1xuICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgbGluZVdyYXBwaW5nOiB0cnVlLFxuICAgICAgdGFiaW5kZXg6IHRoaXMucHJvcHMudGFiSW5kZXgsXG4gICAgICB2YWx1ZTogU3RyaW5nKHRoaXMuc3RhdGUudmFsdWUpLFxuICAgICAgbW9kZTogbnVsbCxcbiAgICAgIGV4dHJhS2V5czoge1xuICAgICAgICBUYWI6IGZhbHNlXG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciB0ZXh0Qm94ID0gdGhpcy5yZWZzLnRleHRCb3guZ2V0RE9NTm9kZSgpO1xuICAgIHRleHRCb3guaW5uZXJIVE1MID0gJyc7IC8vIHJlbGVhc2UgYW55IHByZXZpb3VzIHJlYWQtb25seSBjb250ZW50IHNvIGl0IGNhbiBiZSBHQydlZFxuXG4gICAgdGhpcy5jb2RlTWlycm9yID0gQ29kZU1pcnJvcih0ZXh0Qm94LCBvcHRpb25zKTtcbiAgICB0aGlzLmNvZGVNaXJyb3Iub24oJ2NoYW5nZScsIHRoaXMub25Db2RlTWlycm9yQ2hhbmdlKTtcblxuICAgIHRoaXMudGFnQ29kZU1pcnJvcigpO1xuICB9LFxuXG4gIHRhZ0NvZGVNaXJyb3I6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcG9zaXRpb25zID0gdGhpcy5zdGF0ZS50cmFuc2xhdG9yLmdldFRhZ1Bvc2l0aW9ucyh0aGlzLmNvZGVNaXJyb3IuZ2V0VmFsdWUoKSk7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIHRhZ09wcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHBvc2l0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChwb3MpIHtcbiAgICAgICAgdmFyIG5vZGUgPSBzZWxmLmNyZWF0ZVRhZ05vZGUocG9zKTtcbiAgICAgICAgc2VsZi5jb2RlTWlycm9yLm1hcmtUZXh0KHtsaW5lOiBwb3MubGluZSwgY2g6IHBvcy5zdGFydH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7bGluZTogcG9zLmxpbmUsIGNoOiBwb3Muc3RvcH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cmVwbGFjZWRXaXRoOiBub2RlLCBoYW5kbGVNb3VzZUV2ZW50czogdHJ1ZX0pO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHRoaXMuY29kZU1pcnJvci5vcGVyYXRpb24odGFnT3BzKTtcbiAgfSxcblxuICBvbkNvZGVNaXJyb3JDaGFuZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy51cGRhdGluZ0NvZGVNaXJyb3IpIHtcbiAgICAgIC8vIGF2b2lkIHJlY3Vyc2l2ZSB1cGRhdGUgY3ljbGUsIGFuZCBtYXJrIHRoZSBjb2RlIG1pcnJvciBtYW51YWwgdXBkYXRlIGFzIGRvbmVcbiAgICAgIHRoaXMudXBkYXRpbmdDb2RlTWlycm9yID0gZmFsc2U7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIG5ld1ZhbHVlID0gdGhpcy5jb2RlTWlycm9yLmdldFZhbHVlKCk7XG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7dmFsdWU6IG5ld1ZhbHVlfSk7XG4gICAgdGhpcy50YWdDb2RlTWlycm9yKCk7XG4gIH0sXG5cbiAgY3JlYXRlUmVhZG9ubHlFZGl0b3I6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGV4dEJveE5vZGUgPSB0aGlzLnJlZnMudGV4dEJveC5nZXRET01Ob2RlKCk7XG5cbiAgICB2YXIgdG9rZW5zID0gdGhpcy5zdGF0ZS50cmFuc2xhdG9yLnRva2VuaXplKHRoaXMuc3RhdGUudmFsdWUpO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgbm9kZXMgPSB0b2tlbnMubWFwKGZ1bmN0aW9uIChwYXJ0LCBpKSB7XG4gICAgICBpZiAocGFydC50eXBlID09PSAndGFnJykge1xuICAgICAgICB2YXIgbGFiZWwgPSBzZWxmLnN0YXRlLnRyYW5zbGF0b3IuZ2V0TGFiZWwocGFydC52YWx1ZSk7XG4gICAgICAgIHZhciBwcm9wcyA9IHtrZXk6IGksIHRhZzogcGFydC52YWx1ZSwgcmVwbGFjZUNob2ljZXM6IHNlbGYuc3RhdGUucmVwbGFjZUNob2ljZXN9O1xuICAgICAgICByZXR1cm4gc2VsZi5wcm9wcy5jb25maWcuY3JlYXRlRWxlbWVudCgncHJldHR5LXRhZycsIHByb3BzLCBsYWJlbCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gPHNwYW4ga2V5PXtpfT57cGFydC52YWx1ZX08L3NwYW4+O1xuICAgIH0pO1xuXG4gICAgUmVhY3QucmVuZGVyKDxzcGFuPntub2Rlc308L3NwYW4+LCB0ZXh0Qm94Tm9kZSk7XG4gIH0sXG5cbiAgcmVtb3ZlQ29kZU1pcnJvckVkaXRvcjogZnVuY3Rpb24gKCkge1xuICAgIHZhciB0ZXh0Qm94Tm9kZSA9IHRoaXMucmVmcy50ZXh0Qm94LmdldERPTU5vZGUoKTtcbiAgICB2YXIgY21Ob2RlID0gdGV4dEJveE5vZGUuZmlyc3RDaGlsZDtcbiAgICB0ZXh0Qm94Tm9kZS5yZW1vdmVDaGlsZChjbU5vZGUpO1xuICAgIHRoaXMuY29kZU1pcnJvciA9IG51bGw7XG4gIH0sXG5cbiAgc3dpdGNoVG9Db2RlTWlycm9yOiBmdW5jdGlvbiAoY2IpIHtcbiAgICBpZiAoIXRoaXMuc3RhdGUuY29kZU1pcnJvck1vZGUgJiYgIXRoaXMucHJvcHMucmVhZE9ubHkpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe2NvZGVNaXJyb3JNb2RlOiB0cnVlfSwgKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5jb2RlTWlycm9yICYmIF8uaXNGdW5jdGlvbihjYikpIHtcbiAgICAgICAgICBjYigpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cbiAgY3JlYXRlVGFnTm9kZTogZnVuY3Rpb24gKHBvcykge1xuICAgIHZhciBub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgIHZhciBsYWJlbCA9IHRoaXMuc3RhdGUudHJhbnNsYXRvci5nZXRMYWJlbChwb3MudGFnKTtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG5cbiAgICB2YXIgb25UYWdDbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGVkVGFnUG9zOiBwb3N9KTtcbiAgICAgIHRoaXMub25Ub2dnbGVDaG9pY2VzKCk7XG4gICAgfTtcblxuICAgIHZhciBwcm9wcyA9IHt0YWc6IHBvcy50YWcsIHJlcGxhY2VDaG9pY2VzOiB0aGlzLnN0YXRlLnJlcGxhY2VDaG9pY2VzLCBvbkNsaWNrOiBvblRhZ0NsaWNrLmJpbmQodGhpcyl9O1xuXG4gICAgUmVhY3QucmVuZGVyKFxuICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ3ByZXR0eS10YWcnLCBwcm9wcywgbGFiZWwpLFxuICAgICAgbm9kZVxuICAgICk7XG5cbiAgICByZXR1cm4gbm9kZTtcbiAgfVxufSk7XG4iLCIvLyAjIHJlbW92ZS1pdGVtIGNvbXBvbmVudFxuXG4vKlxuUmVtb3ZlIGFuIGl0ZW0uXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnUmVtb3ZlSXRlbScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGFiZWw6ICdbcmVtb3ZlXSdcbiAgICB9O1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICBvbk1vdXNlT3ZlclJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnByb3BzLm9uTWF5YmVSZW1vdmUpIHtcbiAgICAgIHRoaXMucHJvcHMub25NYXliZVJlbW92ZSh0cnVlKTtcbiAgICB9XG4gIH0sXG5cbiAgb25Nb3VzZU91dFJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnByb3BzLm9uTWF5YmVSZW1vdmUpIHtcbiAgICAgIHRoaXMucHJvcHMub25NYXliZVJlbW92ZShmYWxzZSk7XG4gICAgfVxuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUi5zcGFuKHtcbiAgICAgIGNsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSwgb25DbGljazogdGhpcy5wcm9wcy5vbkNsaWNrLFxuICAgICAgb25Nb3VzZU92ZXI6IHRoaXMub25Nb3VzZU92ZXJSZW1vdmUsIG9uTW91c2VPdXQ6IHRoaXMub25Nb3VzZU91dFJlbW92ZVxuICAgIH0sIHRoaXMucHJvcHMubGFiZWwpO1xuICB9XG59KTtcbiIsIi8vICMgaGVscCBjb21wb25lbnRcblxuLypcbkp1c3QgdGhlIGhlbHAgdGV4dCBibG9jay5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdTYW1wbGUnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjaG9pY2UgPSB0aGlzLnByb3BzLmNob2ljZTtcblxuICAgIHJldHVybiBjaG9pY2Uuc2FtcGxlID9cbiAgICAgIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NOYW1lKX0sXG4gICAgICAgIGNob2ljZS5zYW1wbGVcbiAgICAgICkgOlxuICAgICAgUi5zcGFuKG51bGwpO1xuICB9XG59KTtcbiIsIi8vICMgc2VsZWN0LXZhbHVlIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIGEgc2VsZWN0IGRyb3Bkb3duIGZvciBhIGxpc3Qgb2YgY2hvaWNlcy4gQ2hvaWNlcyB2YWx1ZXMgY2FuIGJlIG9mIGFueVxudHlwZS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBfID0gcmVxdWlyZSgnLi4vLi4vdW5kYXNoJyk7XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnU2VsZWN0VmFsdWUnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHZhciBjaG9pY2VWYWx1ZSA9IGV2ZW50LnRhcmdldC52YWx1ZTtcbiAgICB2YXIgY2hvaWNlVHlwZSA9IGNob2ljZVZhbHVlLnN1YnN0cmluZygwLCBjaG9pY2VWYWx1ZS5pbmRleE9mKCc6JykpO1xuICAgIGlmIChjaG9pY2VUeXBlID09PSAnY2hvaWNlJykge1xuICAgICAgdmFyIGNob2ljZUluZGV4ID0gY2hvaWNlVmFsdWUuc3Vic3RyaW5nKGNob2ljZVZhbHVlLmluZGV4T2YoJzonKSArIDEpO1xuICAgICAgY2hvaWNlSW5kZXggPSBwYXJzZUludChjaG9pY2VJbmRleCk7XG4gICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHRoaXMucHJvcHMuY2hvaWNlc1tjaG9pY2VJbmRleF0udmFsdWUpO1xuICAgIH1cbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgY2hvaWNlcyA9IHRoaXMucHJvcHMuY2hvaWNlcyB8fCBbXTtcblxuICAgIHZhciBjaG9pY2VzT3JMb2FkaW5nO1xuXG4gICAgaWYgKChjaG9pY2VzLmxlbmd0aCA9PT0gMSAmJiBjaG9pY2VzWzBdLnZhbHVlID09PSAnLy8vbG9hZGluZy8vLycpIHx8IGNvbmZpZy5maWVsZElzTG9hZGluZyh0aGlzLnByb3BzLmZpZWxkKSkge1xuICAgICAgY2hvaWNlc09yTG9hZGluZyA9IGNvbmZpZy5jcmVhdGVFbGVtZW50KCdsb2FkaW5nLWNob2ljZXMnLCB7fSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB2YWx1ZSA9IHRoaXMucHJvcHMuZmllbGQudmFsdWUgIT09IHVuZGVmaW5lZCA/IHRoaXMucHJvcHMuZmllbGQudmFsdWUgOiAnJztcblxuICAgICAgY2hvaWNlcyA9IGNob2ljZXMubWFwKGZ1bmN0aW9uIChjaG9pY2UsIGkpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBjaG9pY2VWYWx1ZTogJ2Nob2ljZTonICsgaSxcbiAgICAgICAgICB2YWx1ZTogY2hvaWNlLnZhbHVlLFxuICAgICAgICAgIGxhYmVsOiBjaG9pY2UubGFiZWxcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgdmFsdWVDaG9pY2UgPSBfLmZpbmQoY2hvaWNlcywgZnVuY3Rpb24gKGNob2ljZSkge1xuICAgICAgICByZXR1cm4gY2hvaWNlLnZhbHVlID09PSB2YWx1ZTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAodmFsdWVDaG9pY2UgPT09IHVuZGVmaW5lZCkge1xuXG4gICAgICAgIHZhciBsYWJlbCA9IHZhbHVlO1xuICAgICAgICBpZiAoIV8uaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgICAgICAgbGFiZWwgPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFsdWVDaG9pY2UgPSB7XG4gICAgICAgICAgY2hvaWNlVmFsdWU6ICd2YWx1ZTonLFxuICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICBsYWJlbDogbGFiZWxcbiAgICAgICAgfTtcbiAgICAgICAgY2hvaWNlcyA9IFt2YWx1ZUNob2ljZV0uY29uY2F0KGNob2ljZXMpO1xuICAgICAgfVxuXG4gICAgICBjaG9pY2VzT3JMb2FkaW5nID0gUi5zZWxlY3Qoe1xuICAgICAgICBjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcyksXG4gICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgICB2YWx1ZTogdmFsdWVDaG9pY2UuY2hvaWNlVmFsdWUsXG4gICAgICAgIG9uRm9jdXM6IHRoaXMub25Gb2N1c0FjdGlvbixcbiAgICAgICAgb25CbHVyOiB0aGlzLm9uQmx1ckFjdGlvblxuICAgICAgfSxcbiAgICAgIGNob2ljZXMubWFwKGZ1bmN0aW9uIChjaG9pY2UsIGkpIHtcbiAgICAgICAgcmV0dXJuIFIub3B0aW9uKHtcbiAgICAgICAgICBrZXk6IGksXG4gICAgICAgICAgdmFsdWU6IGNob2ljZS5jaG9pY2VWYWx1ZVxuICAgICAgICB9LCBjaG9pY2UubGFiZWwpO1xuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgcmV0dXJuIGNob2ljZXNPckxvYWRpbmc7XG59XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gYnVpbGRDaG9pY2VzTWFwKHJlcGxhY2VDaG9pY2VzKSB7XG4gIHZhciBjaG9pY2VzID0ge307XG4gIHJlcGxhY2VDaG9pY2VzLmZvckVhY2goZnVuY3Rpb24gKGNob2ljZSkge1xuICAgIHZhciBrZXkgPSBjaG9pY2UudmFsdWU7XG4gICAgY2hvaWNlc1trZXldID0gY2hvaWNlLmxhYmVsO1xuICB9KTtcbiAgcmV0dXJuIGNob2ljZXM7XG59XG5cbi8qXG4gICBDcmVhdGVzIGhlbHBlciB0byB0cmFuc2xhdGUgYmV0d2VlbiB0YWdzIGxpa2Uge3tmaXJzdE5hbWV9fSBhbmRcbiAgIGFuIGVuY29kZWQgcmVwcmVzZW50YXRpb24gc3VpdGFibGUgZm9yIHVzZSBpbiBDb2RlTWlycm9yLlxuICovXG5mdW5jdGlvbiBUYWdUcmFuc2xhdG9yKHJlcGxhY2VDaG9pY2VzLCBodW1hbml6ZSkge1xuICAvLyBNYXAgb2YgdGFnIHRvIGxhYmVsICdmaXJzdE5hbWUnIC0tPiAnRmlyc3QgTmFtZSdcbiAgdmFyIGNob2ljZXMgPSBidWlsZENob2ljZXNNYXAocmVwbGFjZUNob2ljZXMpO1xuXG4gIHJldHVybiB7XG4gICAgLypcbiAgICAgICBHZXQgbGFiZWwgZm9yIHRhZy4gIEZvciBleGFtcGxlICdmaXJzdE5hbWUnIGJlY29tZXMgJ0ZpcnN0IE5hbWUnLlxuICAgICAgIFJldHVybnMgYSBodW1hbml6ZWQgdmVyc2lvbiBvZiB0aGUgdGFnIGlmIHdlIGRvbid0IGhhdmUgYSBsYWJlbCBmb3IgdGhlIHRhZy5cbiAgICAgKi9cbiAgICBnZXRMYWJlbDogZnVuY3Rpb24gKHRhZykge1xuICAgICAgdmFyIGxhYmVsID0gY2hvaWNlc1t0YWddO1xuICAgICAgaWYgKCFsYWJlbCkge1xuICAgICAgICAvLyBJZiB0YWcgbm90IGZvdW5kIGFuZCB3ZSBoYXZlIGEgaHVtYW5pemUgZnVuY3Rpb24sIGh1bWFuaXplIHRoZSB0YWcuXG4gICAgICAgIC8vIE90aGVyd2lzZSBqdXN0IHJldHVybiB0aGUgdGFnLlxuICAgICAgICBsYWJlbCA9IGh1bWFuaXplICYmIGh1bWFuaXplKHRhZykgfHwgdGFnO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGxhYmVsO1xuICAgIH0sXG5cbiAgICB0b2tlbml6ZTogZnVuY3Rpb24gKHRleHQpIHtcbiAgICAgIHRleHQgPSBTdHJpbmcodGV4dCk7XG5cbiAgICAgIHZhciByZWdleHAgPSAvKFxce1xce3xcXH1cXH0pLztcbiAgICAgIHZhciBwYXJ0cyA9IHRleHQuc3BsaXQocmVnZXhwKTtcblxuICAgICAgdmFyIHRva2VucyA9IFtdO1xuICAgICAgdmFyIGluVGFnID0gZmFsc2U7XG4gICAgICBwYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uIChwYXJ0KSB7XG4gICAgICAgIGlmIChwYXJ0ID09PSAne3snKSB7XG4gICAgICAgICAgaW5UYWcgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKHBhcnQgPT09ICd9fScpIHtcbiAgICAgICAgICBpblRhZyA9IGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKGluVGFnKSB7XG4gICAgICAgICAgdG9rZW5zLnB1c2goe3R5cGU6ICd0YWcnLCB2YWx1ZTogcGFydH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRva2Vucy5wdXNoKHt0eXBlOiAnc3RyaW5nJywgdmFsdWU6IHBhcnR9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gdG9rZW5zO1xuICAgIH0sXG5cbiAgICBnZXRUYWdQb3NpdGlvbnM6IGZ1bmN0aW9uICh0ZXh0KSB7XG4gICAgICB2YXIgbGluZXMgPSB0ZXh0LnNwbGl0KCdcXG4nKTtcbiAgICAgIHZhciByZSA9IC9cXHtcXHsuKz9cXH1cXH0vZztcbiAgICAgIHZhciBwb3NpdGlvbnMgPSBbXTtcbiAgICAgIHZhciBtO1xuXG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgd2hpbGUgKChtID0gcmUuZXhlYyhsaW5lc1tpXSkpICE9PSBudWxsKSB7XG4gICAgICAgICAgdmFyIHRhZyA9IG1bMF0uc3Vic3RyaW5nKDIsIG1bMF0ubGVuZ3RoLTIpO1xuICAgICAgICAgIHBvc2l0aW9ucy5wdXNoKHtcbiAgICAgICAgICAgIGxpbmU6IGksXG4gICAgICAgICAgICBzdGFydDogbS5pbmRleCxcbiAgICAgICAgICAgIHN0b3A6IG0uaW5kZXggKyBtWzBdLmxlbmd0aCxcbiAgICAgICAgICAgIHRhZzogdGFnXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBwb3NpdGlvbnM7XG4gICAgfVxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRhZ1RyYW5zbGF0b3I7XG4iLCIvLyAjIGRlZmF1bHQtY29uZmlnXG5cbi8qXG5UaGlzIGlzIHRoZSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gcGx1Z2luIGZvciBmb3JtYXRpYy4gVG8gY2hhbmdlIGZvcm1hdGljJ3NcbmJlaGF2aW9yLCBqdXN0IGNyZWF0ZSB5b3VyIG93biBwbHVnaW4gZnVuY3Rpb24gdGhhdCByZXR1cm5zIGFuIG9iamVjdCB3aXRoXG5tZXRob2RzIHlvdSB3YW50IHRvIGFkZCBvciBvdmVycmlkZS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBfID0gcmVxdWlyZSgnLi91bmRhc2gnKTtcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjb25maWcpIHtcblxuICB2YXIgZGVsZWdhdGVUbyA9IHV0aWxzLmRlbGVnYXRvcihjb25maWcpO1xuXG4gIHJldHVybiB7XG5cbiAgICAvLyBGaWVsZCBlbGVtZW50IGZhY3Rvcmllcy4gQ3JlYXRlIGZpZWxkIGVsZW1lbnRzLlxuXG4gICAgY3JlYXRlRWxlbWVudF9GaWVsZHM6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9maWVsZHMnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X1N0cmluZzogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL3N0cmluZycpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfU2luZ2xlTGluZVN0cmluZzogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL3NpbmdsZS1saW5lLXN0cmluZycpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfUGFzc3dvcmQ6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9wYXNzd29yZCcpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfU2VsZWN0OiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvc2VsZWN0JykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9QcmV0dHlTZWxlY3Q6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9wcmV0dHktc2VsZWN0JykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9Cb29sZWFuOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvYm9vbGVhbicpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfUHJldHR5Qm9vbGVhbjogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL3ByZXR0eS1ib29sZWFuJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9DaGVja2JveEJvb2xlYW46IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9jaGVja2JveC1ib29sZWFuJykpLFxuXG4gICAgLy8gY3JlYXRlRWxlbWVudF9QcmV0dHlUZXh0OiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvcHJldHR5LXRleHQnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0NvZGU6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9jb2RlJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9QcmV0dHlUZXh0OiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvcHJldHR5LXRleHQyJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9QcmV0dHlUYWc6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvcHJldHR5LXRhZycpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfQXJyYXk6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9hcnJheScpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfQ2hlY2tib3hBcnJheTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL2NoZWNrYm94LWFycmF5JykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9PYmplY3Q6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9vYmplY3QnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0pzb246IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9qc29uJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9Vbmtub3duRmllbGQ6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy91bmtub3duJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9Db3B5OiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvY29weScpKSxcblxuXG4gICAgLy8gT3RoZXIgZWxlbWVudCBmYWN0b3JpZXMuIENyZWF0ZSBoZWxwZXIgZWxlbWVudHMgdXNlZCBieSBmaWVsZCBjb21wb25lbnRzLlxuXG4gICAgY3JlYXRlRWxlbWVudF9GaWVsZDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9maWVsZCcpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfTGFiZWw6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvbGFiZWwnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0hlbHA6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvaGVscCcpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfQ2hvaWNlczogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9jaG9pY2VzJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9Mb2FkaW5nQ2hvaWNlczogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9sb2FkaW5nLWNob2ljZXMnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0xvYWRpbmdDaG9pY2U6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvbG9hZGluZy1jaG9pY2UnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0FycmF5Q29udHJvbDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9hcnJheS1jb250cm9sJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9BcnJheUl0ZW1Db250cm9sOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2FycmF5LWl0ZW0tY29udHJvbCcpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfQXJyYXlJdGVtVmFsdWU6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvYXJyYXktaXRlbS12YWx1ZScpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfQXJyYXlJdGVtOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2FycmF5LWl0ZW0nKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0ZpZWxkVGVtcGxhdGVDaG9pY2VzOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2ZpZWxkLXRlbXBsYXRlLWNob2ljZXMnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0FkZEl0ZW06IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvYWRkLWl0ZW0nKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X1JlbW92ZUl0ZW06IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvcmVtb3ZlLWl0ZW0nKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X01vdmVJdGVtRm9yd2FyZDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9tb3ZlLWl0ZW0tZm9yd2FyZCcpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfTW92ZUl0ZW1CYWNrOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL21vdmUtaXRlbS1iYWNrJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9PYmplY3RDb250cm9sOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL29iamVjdC1jb250cm9sJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9PYmplY3RJdGVtQ29udHJvbDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9vYmplY3QtaXRlbS1jb250cm9sJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9PYmplY3RJdGVtVmFsdWU6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWl0ZW0tdmFsdWUnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X09iamVjdEl0ZW1LZXk6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWl0ZW0ta2V5JykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9PYmplY3RJdGVtOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL29iamVjdC1pdGVtJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9TZWxlY3RWYWx1ZTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9zZWxlY3QtdmFsdWUnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X1ByZXR0eVNlbGVjdFZhbHVlOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL3ByZXR0eS1zZWxlY3QtdmFsdWUnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X1ByZXR0eVNlbGVjdElucHV0OiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL3ByZXR0eS1zZWxlY3QtaW5wdXQnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X1NhbXBsZTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9zYW1wbGUnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0luc2VydEJ1dHRvbjogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9pbnNlcnQtYnV0dG9uJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9DaG9pY2VTZWN0aW9uSGVhZGVyOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2Nob2ljZS1zZWN0aW9uLWhlYWRlcicpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfUHJldHR5VGV4dEhlbHBlcjogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9wcmV0dHktdGV4dC1oZWxwZXInKSksXG5cbiAgICAvLyBGaWVsZCBkZWZhdWx0IHZhbHVlIGZhY3Rvcmllcy4gR2l2ZSBhIGRlZmF1bHQgdmFsdWUgZm9yIGEgc3BlY2lmaWMgdHlwZS5cblxuICAgIGNyZWF0ZURlZmF1bHRWYWx1ZV9TdHJpbmc6IGZ1bmN0aW9uICgvKiBmaWVsZFRlbXBsYXRlICovKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfSxcblxuICAgIGNyZWF0ZURlZmF1bHRWYWx1ZV9PYmplY3Q6IGZ1bmN0aW9uICgvKiBmaWVsZFRlbXBsYXRlICovKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfSxcblxuICAgIGNyZWF0ZURlZmF1bHRWYWx1ZV9BcnJheTogZnVuY3Rpb24gKC8qIGZpZWxkVGVtcGxhdGUgKi8pIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9LFxuXG4gICAgY3JlYXRlRGVmYXVsdFZhbHVlX0Jvb2xlYW46IGZ1bmN0aW9uICgvKiBmaWVsZFRlbXBsYXRlICovKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIGNyZWF0ZURlZmF1bHRWYWx1ZV9GaWVsZHM6IGRlbGVnYXRlVG8oJ2NyZWF0ZURlZmF1bHRWYWx1ZV9PYmplY3QnKSxcblxuICAgIGNyZWF0ZURlZmF1bHRWYWx1ZV9TaW5nbGVMaW5lU3RyaW5nOiBkZWxlZ2F0ZVRvKCdjcmVhdGVEZWZhdWx0VmFsdWVfU3RyaW5nJyksXG5cbiAgICBjcmVhdGVEZWZhdWx0VmFsdWVfU2VsZWN0OiBkZWxlZ2F0ZVRvKCdjcmVhdGVEZWZhdWx0VmFsdWVfU3RyaW5nJyksXG5cbiAgICBjcmVhdGVEZWZhdWx0VmFsdWVfSnNvbjogZGVsZWdhdGVUbygnY3JlYXRlRGVmYXVsdFZhbHVlX09iamVjdCcpLFxuXG4gICAgY3JlYXRlRGVmYXVsdFZhbHVlX0NoZWNrYm94QXJyYXk6IGRlbGVnYXRlVG8oJ2NyZWF0ZURlZmF1bHRWYWx1ZV9BcnJheScpLFxuXG4gICAgY3JlYXRlRGVmYXVsdFZhbHVlX0NoZWNrYm94Qm9vbGVhbjogZGVsZWdhdGVUbygnY3JlYXRlRGVmYXVsdFZhbHVlX0Jvb2xlYW4nKSxcblxuXG4gICAgLy8gRmllbGQgdmFsdWUgY29lcmNlcnMuIENvZXJjZSBhIHZhbHVlIGludG8gYSB2YWx1ZSBhcHByb3ByaWF0ZSBmb3IgYSBzcGVjaWZpYyB0eXBlLlxuXG4gICAgY29lcmNlVmFsdWVfU3RyaW5nOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSwgdmFsdWUpIHtcbiAgICAgIGlmIChfLmlzU3RyaW5nKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9XG4gICAgICBpZiAoXy5pc1VuZGVmaW5lZCh2YWx1ZSkgfHwgdmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICB9LFxuXG4gICAgY29lcmNlVmFsdWVfT2JqZWN0OiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSwgdmFsdWUpIHtcbiAgICAgIGlmICghXy5pc09iamVjdCh2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG5cbiAgICBjb2VyY2VWYWx1ZV9BcnJheTogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUsIHZhbHVlKSB7XG4gICAgICBpZiAoIV8uaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIFt2YWx1ZV07XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcblxuICAgIGNvZXJjZVZhbHVlX0Jvb2xlYW46IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlLCB2YWx1ZSkge1xuICAgICAgcmV0dXJuIGNvbmZpZy5jb2VyY2VWYWx1ZVRvQm9vbGVhbih2YWx1ZSk7XG4gICAgfSxcblxuICAgIGNvZXJjZVZhbHVlX0ZpZWxkczogZGVsZWdhdGVUbygnY29lcmNlVmFsdWVfT2JqZWN0JyksXG5cbiAgICBjb2VyY2VWYWx1ZV9TaW5nbGVMaW5lU3RyaW5nOiBkZWxlZ2F0ZVRvKCdjb2VyY2VWYWx1ZV9TdHJpbmcnKSxcblxuICAgIGNvZXJjZVZhbHVlX1NlbGVjdDogZGVsZWdhdGVUbygnY29lcmNlVmFsdWVfU3RyaW5nJyksXG5cbiAgICBjb2VyY2VWYWx1ZV9Kc29uOiBkZWxlZ2F0ZVRvKCdjb2VyY2VWYWx1ZV9PYmplY3QnKSxcblxuICAgIGNvZXJjZVZhbHVlX0NoZWNrYm94QXJyYXk6IGRlbGVnYXRlVG8oJ2NvZXJjZVZhbHVlX0FycmF5JyksXG5cbiAgICBjb2VyY2VWYWx1ZV9DaGVja2JveEJvb2xlYW46IGRlbGVnYXRlVG8oJ2NvZXJjZVZhbHVlX0Jvb2xlYW4nKSxcblxuXG4gICAgLy8gRmllbGQgY2hpbGQgZmllbGRzIGZhY3Rvcmllcywgc28gc29tZSB0eXBlcyBjYW4gaGF2ZSBkeW5hbWljIGNoaWxkcmVuLlxuXG4gICAgY3JlYXRlQ2hpbGRGaWVsZHNfQXJyYXk6IGZ1bmN0aW9uIChmaWVsZCkge1xuXG4gICAgICByZXR1cm4gZmllbGQudmFsdWUubWFwKGZ1bmN0aW9uIChhcnJheUl0ZW0sIGkpIHtcbiAgICAgICAgdmFyIGNoaWxkRmllbGRUZW1wbGF0ZSA9IGNvbmZpZy5jaGlsZEZpZWxkVGVtcGxhdGVGb3JWYWx1ZShmaWVsZCwgYXJyYXlJdGVtKTtcblxuICAgICAgICB2YXIgY2hpbGRGaWVsZCA9IGNvbmZpZy5jcmVhdGVDaGlsZEZpZWxkKGZpZWxkLCB7XG4gICAgICAgICAgZmllbGRUZW1wbGF0ZTogY2hpbGRGaWVsZFRlbXBsYXRlLCBrZXk6IGksIGZpZWxkSW5kZXg6IGksIHZhbHVlOiBhcnJheUl0ZW1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGNoaWxkRmllbGQ7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlQ2hpbGRGaWVsZHNfT2JqZWN0OiBmdW5jdGlvbiAoZmllbGQpIHtcblxuICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKGZpZWxkLnZhbHVlKS5tYXAoZnVuY3Rpb24gKGtleSwgaSkge1xuICAgICAgICB2YXIgY2hpbGRGaWVsZFRlbXBsYXRlID0gY29uZmlnLmNoaWxkRmllbGRUZW1wbGF0ZUZvclZhbHVlKGZpZWxkLCBmaWVsZC52YWx1ZVtrZXldKTtcblxuICAgICAgICB2YXIgY2hpbGRGaWVsZCA9IGNvbmZpZy5jcmVhdGVDaGlsZEZpZWxkKGZpZWxkLCB7XG4gICAgICAgICAgZmllbGRUZW1wbGF0ZTogY2hpbGRGaWVsZFRlbXBsYXRlLCBrZXk6IGtleSwgZmllbGRJbmRleDogaSwgdmFsdWU6IGZpZWxkLnZhbHVlW2tleV1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGNoaWxkRmllbGQ7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgLy8gQ2hlY2sgaWYgdGhlcmUgaXMgYSBmYWN0b3J5IGZvciB0aGUgbmFtZS5cbiAgICBoYXNFbGVtZW50RmFjdG9yeTogZnVuY3Rpb24gKG5hbWUpIHtcblxuICAgICAgcmV0dXJuIGNvbmZpZ1snY3JlYXRlRWxlbWVudF8nICsgbmFtZV0gPyB0cnVlIDogZmFsc2U7XG4gICAgfSxcblxuICAgIC8vIENyZWF0ZSBhbiBlbGVtZW50IGdpdmVuIGEgbmFtZSwgcHJvcHMsIGFuZCBjaGlsZHJlbi5cbiAgICBjcmVhdGVFbGVtZW50OiBmdW5jdGlvbiAobmFtZSwgcHJvcHMsIGNoaWxkcmVuKSB7XG5cbiAgICAgIGlmICghcHJvcHMuY29uZmlnKSB7XG4gICAgICAgIHByb3BzID0gXy5leHRlbmQoe30sIHByb3BzLCB7Y29uZmlnOiBjb25maWd9KTtcbiAgICAgIH1cblxuICAgICAgbmFtZSA9IGNvbmZpZy5lbGVtZW50TmFtZShuYW1lKTtcblxuICAgICAgaWYgKGNvbmZpZ1snY3JlYXRlRWxlbWVudF8nICsgbmFtZV0pIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZ1snY3JlYXRlRWxlbWVudF8nICsgbmFtZV0ocHJvcHMsIGNoaWxkcmVuKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG5hbWUgIT09ICdVbmtub3duJykge1xuICAgICAgICBpZiAoY29uZmlnLmhhc0VsZW1lbnRGYWN0b3J5KCdVbmtub3duJykpIHtcbiAgICAgICAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ1Vua25vd24nLCBwcm9wcywgY2hpbGRyZW4pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRocm93IG5ldyBFcnJvcignRmFjdG9yeSBub3QgZm91bmQgZm9yOiAnICsgbmFtZSk7XG4gICAgfSxcblxuICAgIC8vIENyZWF0ZSBhIGZpZWxkIGVsZW1lbnQgZ2l2ZW4gc29tZSBwcm9wcy4gVXNlIGNvbnRleHQgdG8gZGV0ZXJtaW5lIG5hbWUuXG4gICAgY3JlYXRlRmllbGRFbGVtZW50OiBmdW5jdGlvbiAocHJvcHMpIHtcblxuICAgICAgdmFyIG5hbWUgPSBjb25maWcuZmllbGRUeXBlTmFtZShwcm9wcy5maWVsZCk7XG5cbiAgICAgIGlmIChjb25maWcuaGFzRWxlbWVudEZhY3RvcnkobmFtZSkpIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KG5hbWUsIHByb3BzKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdVbmtub3duRmllbGQnLCBwcm9wcyk7XG4gICAgfSxcblxuICAgIC8vIFJlbmRlciB0aGUgcm9vdCBmb3JtYXRpYyBjb21wb25lbnRcbiAgICByZW5kZXJGb3JtYXRpY0NvbXBvbmVudDogZnVuY3Rpb24gKGNvbXBvbmVudCkge1xuXG4gICAgICB2YXIgcHJvcHMgPSBjb21wb25lbnQucHJvcHM7XG5cbiAgICAgIHZhciBmaWVsZCA9IGNvbmZpZy5jcmVhdGVSb290RmllbGQocHJvcHMpO1xuXG4gICAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogJ2Zvcm1hdGljJ30sXG4gICAgICAgIGNvbmZpZy5jcmVhdGVGaWVsZEVsZW1lbnQoe2ZpZWxkOiBmaWVsZCwgb25DaGFuZ2U6IGNvbXBvbmVudC5vbkNoYW5nZSwgb25BY3Rpb246IGNvbXBvbmVudC5vbkFjdGlvbn0pXG4gICAgICApO1xuICAgIH0sXG5cbiAgICAvLyBSZW5kZXIgYW55IGNvbXBvbmVudC5cbiAgICByZW5kZXJDb21wb25lbnQ6IGZ1bmN0aW9uIChjb21wb25lbnQpIHtcblxuICAgICAgdmFyIG5hbWUgPSBjb21wb25lbnQuY29uc3RydWN0b3IuZGlzcGxheU5hbWU7XG5cbiAgICAgIGlmIChjb25maWdbJ3JlbmRlckNvbXBvbmVudF8nICsgbmFtZV0pIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZ1sncmVuZGVyQ29tcG9uZW50XycgKyBuYW1lXShjb21wb25lbnQpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY29tcG9uZW50LnJlbmRlckRlZmF1bHQoKTtcbiAgICB9LFxuXG4gICAgLy8gUmVuZGVyIGZpZWxkIGNvbXBvbmVudHMuXG4gICAgcmVuZGVyRmllbGRDb21wb25lbnQ6IGZ1bmN0aW9uIChjb21wb25lbnQpIHtcblxuICAgICAgcmV0dXJuIGNvbmZpZy5yZW5kZXJDb21wb25lbnQoY29tcG9uZW50KTtcbiAgICB9LFxuXG4gICAgLy8gTm9ybWFsaXplIGFuIGVsZW1lbnQgbmFtZS5cbiAgICBlbGVtZW50TmFtZTogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgIHJldHVybiB1dGlscy5kYXNoVG9QYXNjYWwobmFtZSk7XG4gICAgfSxcblxuICAgIC8vIFR5cGUgYWxpYXNlcy5cblxuICAgIGFsaWFzX0RpY3Q6ICdPYmplY3QnLFxuXG4gICAgYWxpYXNfQm9vbDogJ0Jvb2xlYW4nLFxuXG4gICAgYWxpYXNfUHJldHR5VGV4dGFyZWE6ICdQcmV0dHlUZXh0JyxcblxuICAgIGFsaWFzX1NpbmdsZUxpbmVTdHJpbmc6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgICBpZiAoZmllbGRUZW1wbGF0ZS5yZXBsYWNlQ2hvaWNlcykge1xuICAgICAgICByZXR1cm4gJ1ByZXR0eVRleHQnO1xuICAgICAgfSBlbHNlIGlmIChmaWVsZFRlbXBsYXRlLmNob2ljZXMpIHtcbiAgICAgICAgcmV0dXJuICdTZWxlY3QnO1xuICAgICAgfVxuICAgICAgcmV0dXJuICdTaW5nbGVMaW5lU3RyaW5nJztcbiAgICB9LFxuXG4gICAgYWxpYXNfU3RyaW5nOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSkge1xuXG4gICAgICBpZiAoZmllbGRUZW1wbGF0ZS5yZXBsYWNlQ2hvaWNlcykge1xuICAgICAgICByZXR1cm4gJ1ByZXR0eVRleHQnO1xuICAgICAgfSBlbHNlIGlmIChmaWVsZFRlbXBsYXRlLmNob2ljZXMpIHtcbiAgICAgICAgcmV0dXJuICdTZWxlY3QnO1xuICAgICAgfSBlbHNlIGlmIChjb25maWcuZmllbGRUZW1wbGF0ZUlzU2luZ2xlTGluZShmaWVsZFRlbXBsYXRlKSkge1xuICAgICAgICByZXR1cm4gJ1NpbmdsZUxpbmVTdHJpbmcnO1xuICAgICAgfVxuICAgICAgcmV0dXJuICdTdHJpbmcnO1xuICAgIH0sXG5cbiAgICBhbGlhc19UZXh0OiBkZWxlZ2F0ZVRvKCdhbGlhc19TdHJpbmcnKSxcblxuICAgIGFsaWFzX1VuaWNvZGU6IGRlbGVnYXRlVG8oJ2FsaWFzX1NpbmdsZUxpbmVTdHJpbmcnKSxcblxuICAgIGFsaWFzX1N0cjogZGVsZWdhdGVUbygnYWxpYXNfU2luZ2xlTGluZVN0cmluZycpLFxuXG4gICAgYWxpYXNfTGlzdDogJ0FycmF5JyxcblxuICAgIGFsaWFzX0NoZWNrYm94TGlzdDogJ0NoZWNrYm94QXJyYXknLFxuXG4gICAgYWxpYXNfRmllbGRzZXQ6ICdGaWVsZHMnLFxuXG4gICAgYWxpYXNfQ2hlY2tib3g6ICdDaGVja2JveEJvb2xlYW4nLFxuXG4gICAgLy8gRmllbGQgZmFjdG9yeVxuXG4gICAgLy8gR2l2ZW4gYSBmaWVsZCwgZXhwYW5kIGFsbCBjaGlsZCBmaWVsZHMgcmVjdXJzaXZlbHkgdG8gZ2V0IHRoZSBkZWZhdWx0XG4gICAgLy8gdmFsdWVzIG9mIGFsbCBmaWVsZHMuXG4gICAgaW5mbGF0ZUZpZWxkVmFsdWU6IGZ1bmN0aW9uIChmaWVsZCwgZmllbGRIYW5kbGVyKSB7XG5cbiAgICAgIGlmIChmaWVsZEhhbmRsZXIpIHtcbiAgICAgICAgdmFyIHN0b3AgPSBmaWVsZEhhbmRsZXIoZmllbGQpO1xuICAgICAgICBpZiAoc3RvcCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChjb25maWcuZmllbGRIYXNWYWx1ZUNoaWxkcmVuKGZpZWxkKSkge1xuICAgICAgICB2YXIgdmFsdWUgPSBfLmNsb25lKGZpZWxkLnZhbHVlKTtcbiAgICAgICAgdmFyIGNoaWxkRmllbGRzID0gY29uZmlnLmNyZWF0ZUNoaWxkRmllbGRzKGZpZWxkKTtcbiAgICAgICAgY2hpbGRGaWVsZHMuZm9yRWFjaChmdW5jdGlvbiAoY2hpbGRGaWVsZCkge1xuICAgICAgICAgIGlmIChjb25maWcuaXNLZXkoY2hpbGRGaWVsZC5rZXkpKSB7XG4gICAgICAgICAgICB2YWx1ZVtjaGlsZEZpZWxkLmtleV0gPSBjb25maWcuaW5mbGF0ZUZpZWxkVmFsdWUoY2hpbGRGaWVsZCwgZmllbGRIYW5kbGVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZmllbGQudmFsdWU7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIEluaXRpYWxpemUgdGhlIHJvb3QgZmllbGQuXG4gICAgaW5pdFJvb3RGaWVsZDogZnVuY3Rpb24gKC8qIGZpZWxkLCBwcm9wcyAqLykge1xuICAgIH0sXG5cbiAgICAvLyBJbml0aWFsaXplIGV2ZXJ5IGZpZWxkLlxuICAgIGluaXRGaWVsZDogZnVuY3Rpb24gKC8qIGZpZWxkICovKSB7XG4gICAgfSxcblxuICAgIC8vIElmIGFuIGFycmF5IG9mIGZpZWxkIHRlbXBsYXRlcyBhcmUgcGFzc2VkIGluLCB0aGlzIG1ldGhvZCBpcyB1c2VkIHRvXG4gICAgLy8gd3JhcCB0aGUgZmllbGRzIGluc2lkZSBhIHNpbmdsZSByb290IGZpZWxkIHRlbXBsYXRlLlxuICAgIHdyYXBGaWVsZFRlbXBsYXRlczogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGVzKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnZmllbGRzJyxcbiAgICAgICAgcGxhaW46IHRydWUsXG4gICAgICAgIGZpZWxkczogZmllbGRUZW1wbGF0ZXNcbiAgICAgIH07XG4gICAgfSxcblxuICAgIC8vIEdpdmVuIHRoZSBwcm9wcyB0aGF0IGFyZSBwYXNzZWQgaW4sIGNyZWF0ZSB0aGUgcm9vdCBmaWVsZC5cbiAgICBjcmVhdGVSb290RmllbGQ6IGZ1bmN0aW9uIChwcm9wcykge1xuXG4gICAgICB2YXIgZmllbGRUZW1wbGF0ZSA9IHByb3BzLmZpZWxkVGVtcGxhdGUgfHwgcHJvcHMuZmllbGRUZW1wbGF0ZXMgfHwgcHJvcHMuZmllbGQgfHwgcHJvcHMuZmllbGRzO1xuICAgICAgdmFyIHZhbHVlID0gcHJvcHMudmFsdWU7XG5cbiAgICAgIGlmICghZmllbGRUZW1wbGF0ZSkge1xuICAgICAgICBmaWVsZFRlbXBsYXRlID0gY29uZmlnLmNyZWF0ZUZpZWxkVGVtcGxhdGVGcm9tVmFsdWUodmFsdWUpO1xuICAgICAgfVxuXG4gICAgICBpZiAoXy5pc0FycmF5KGZpZWxkVGVtcGxhdGUpKSB7XG4gICAgICAgIGZpZWxkVGVtcGxhdGUgPSBjb25maWcud3JhcEZpZWxkVGVtcGxhdGVzKGZpZWxkVGVtcGxhdGUpO1xuICAgICAgfVxuXG4gICAgICB2YXIgZmllbGQgPSBfLmV4dGVuZCh7fSwgZmllbGRUZW1wbGF0ZSwge3Jhd0ZpZWxkVGVtcGxhdGU6IGZpZWxkVGVtcGxhdGV9KTtcbiAgICAgIGlmIChjb25maWcuaGFzVmFsdWUoZmllbGRUZW1wbGF0ZSwgdmFsdWUpKSB7XG4gICAgICAgIGZpZWxkLnZhbHVlID0gY29uZmlnLmNvZXJjZVZhbHVlKGZpZWxkVGVtcGxhdGUsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZpZWxkLnZhbHVlID0gY29uZmlnLmNyZWF0ZURlZmF1bHRWYWx1ZShmaWVsZFRlbXBsYXRlKTtcbiAgICAgIH1cblxuICAgICAgY29uZmlnLmluaXRSb290RmllbGQoZmllbGQsIHByb3BzKTtcbiAgICAgIGNvbmZpZy5pbml0RmllbGQoZmllbGQpO1xuXG4gICAgICBpZiAodmFsdWUgPT09IG51bGwgfHwgY29uZmlnLmlzRW1wdHlPYmplY3QodmFsdWUpIHx8IF8uaXNVbmRlZmluZWQodmFsdWUpKSB7XG4gICAgICAgIGZpZWxkLnZhbHVlID0gY29uZmlnLmluZmxhdGVGaWVsZFZhbHVlKGZpZWxkKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZpZWxkO1xuICAgIH0sXG5cbiAgICAvLyBHaXZlbiB0aGUgcHJvcHMgdGhhdCBhcmUgcGFzc2VkIGluLCBjcmVhdGUgdGhlIHZhbHVlIHRoYXQgd2lsbCBiZSBkaXNwbGF5ZWRcbiAgICAvLyBieSBhbGwgdGhlIGNvbXBvbmVudHMuXG4gICAgY3JlYXRlUm9vdFZhbHVlOiBmdW5jdGlvbiAocHJvcHMsIGZpZWxkSGFuZGxlcikge1xuXG4gICAgICB2YXIgZmllbGQgPSBjb25maWcuY3JlYXRlUm9vdEZpZWxkKHByb3BzKTtcblxuICAgICAgcmV0dXJuIGNvbmZpZy5pbmZsYXRlRmllbGRWYWx1ZShmaWVsZCwgZmllbGRIYW5kbGVyKTtcbiAgICB9LFxuXG4gICAgdmFsaWRhdGVSb290VmFsdWU6IGZ1bmN0aW9uIChwcm9wcykge1xuXG4gICAgICB2YXIgZXJyb3JzID0gW107XG5cbiAgICAgIGNvbmZpZy5jcmVhdGVSb290VmFsdWUocHJvcHMsIGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgICB2YXIgZmllbGRFcnJvcnMgPSBjb25maWcuZmllbGRFcnJvcnMoZmllbGQpO1xuICAgICAgICBpZiAoZmllbGRFcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgIHBhdGg6IGNvbmZpZy5maWVsZFZhbHVlUGF0aChmaWVsZCksXG4gICAgICAgICAgICBlcnJvcnM6IGZpZWxkRXJyb3JzXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gZXJyb3JzO1xuICAgIH0sXG5cbiAgICBpc1ZhbGlkUm9vdFZhbHVlOiBmdW5jdGlvbiAocHJvcHMpIHtcblxuICAgICAgdmFyIGlzVmFsaWQgPSB0cnVlO1xuXG4gICAgICBjb25maWcuY3JlYXRlUm9vdFZhbHVlKHByb3BzLCBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgICAgaWYgKGNvbmZpZy5maWVsZEVycm9ycyhmaWVsZCkubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGlzVmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gaXNWYWxpZDtcbiAgICB9LFxuXG4gICAgdmFsaWRhdGVGaWVsZDogZnVuY3Rpb24gKGZpZWxkLCBlcnJvcnMpIHtcblxuICAgICAgaWYgKGZpZWxkLnZhbHVlID09PSB1bmRlZmluZWQgfHwgZmllbGQudmFsdWUgPT09ICcnKSB7XG4gICAgICAgIGlmIChjb25maWcuZmllbGRJc1JlcXVpcmVkKGZpZWxkKSkge1xuICAgICAgICAgIGVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgIHR5cGU6ICdyZXF1aXJlZCdcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBjc3NUcmFuc2l0aW9uV3JhcHBlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgQ1NTVHJhbnNpdGlvbkdyb3VwID0gUmVhY3QuY3JlYXRlRmFjdG9yeShSZWFjdC5hZGRvbnMuQ1NTVHJhbnNpdGlvbkdyb3VwKTtcbiAgICAgIHZhciBhcmdzID0gW3t0cmFuc2l0aW9uTmFtZTogJ3JldmVhbCd9XS5jb25jYXQoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG4gICAgICByZXR1cm4gQ1NTVHJhbnNpdGlvbkdyb3VwLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgIH0sXG5cbiAgICAvLyBDcmVhdGUgZHluYW1pYyBjaGlsZCBmaWVsZHMgZm9yIGEgZmllbGQuXG4gICAgY3JlYXRlQ2hpbGRGaWVsZHM6IGZ1bmN0aW9uIChmaWVsZCkge1xuXG4gICAgICB2YXIgdHlwZU5hbWUgPSBjb25maWcuZmllbGRUeXBlTmFtZShmaWVsZCk7XG5cbiAgICAgIGlmIChjb25maWdbJ2NyZWF0ZUNoaWxkRmllbGRzXycgKyB0eXBlTmFtZV0pIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZ1snY3JlYXRlQ2hpbGRGaWVsZHNfJyArIHR5cGVOYW1lXShmaWVsZCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjb25maWcuZmllbGRDaGlsZEZpZWxkVGVtcGxhdGVzKGZpZWxkKS5tYXAoZnVuY3Rpb24gKGNoaWxkRmllbGQsIGkpIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVDaGlsZEZpZWxkKGZpZWxkLCB7XG4gICAgICAgICAgZmllbGRUZW1wbGF0ZTogY2hpbGRGaWVsZCwga2V5OiBjaGlsZEZpZWxkLmtleSwgZmllbGRJbmRleDogaSwgdmFsdWU6IGZpZWxkLnZhbHVlW2NoaWxkRmllbGQua2V5XVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvLyBDcmVhdGUgYSBzaW5nbGUgY2hpbGQgZmllbGQgZm9yIGEgcGFyZW50IGZpZWxkLlxuICAgIGNyZWF0ZUNoaWxkRmllbGQ6IGZ1bmN0aW9uIChwYXJlbnRGaWVsZCwgb3B0aW9ucykge1xuXG4gICAgICB2YXIgY2hpbGRWYWx1ZSA9IG9wdGlvbnMudmFsdWU7XG5cbiAgICAgIHZhciBjaGlsZEZpZWxkID0gXy5leHRlbmQoe30sIG9wdGlvbnMuZmllbGRUZW1wbGF0ZSwge1xuICAgICAgICBrZXk6IG9wdGlvbnMua2V5LCBwYXJlbnQ6IHBhcmVudEZpZWxkLCBmaWVsZEluZGV4OiBvcHRpb25zLmZpZWxkSW5kZXgsXG4gICAgICAgIHJhd0ZpZWxkVGVtcGxhdGU6IG9wdGlvbnMuZmllbGRUZW1wbGF0ZVxuICAgICAgfSk7XG5cbiAgICAgIGlmIChjb25maWcuaGFzVmFsdWUob3B0aW9ucy5maWVsZFRlbXBsYXRlLCBjaGlsZFZhbHVlKSkge1xuICAgICAgICBjaGlsZEZpZWxkLnZhbHVlID0gY29uZmlnLmNvZXJjZVZhbHVlKG9wdGlvbnMuZmllbGRUZW1wbGF0ZSwgY2hpbGRWYWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjaGlsZEZpZWxkLnZhbHVlID0gY29uZmlnLmNyZWF0ZURlZmF1bHRWYWx1ZShvcHRpb25zLmZpZWxkVGVtcGxhdGUpO1xuICAgICAgfVxuXG4gICAgICBjb25maWcuaW5pdEZpZWxkKGNoaWxkRmllbGQpO1xuXG4gICAgICByZXR1cm4gY2hpbGRGaWVsZDtcbiAgICB9LFxuXG4gICAgLy8gQ3JlYXRlIGEgdGVtcG9yYXJ5IGZpZWxkIGFuZCBleHRyYWN0IGl0cyB2YWx1ZS5cbiAgICBjcmVhdGVOZXdDaGlsZEZpZWxkVmFsdWU6IGZ1bmN0aW9uIChwYXJlbnRGaWVsZCwgaXRlbUZpZWxkSW5kZXgpIHtcblxuICAgICAgdmFyIGNoaWxkRmllbGRUZW1wbGF0ZSA9IGNvbmZpZy5maWVsZEl0ZW1GaWVsZFRlbXBsYXRlcyhwYXJlbnRGaWVsZClbaXRlbUZpZWxkSW5kZXhdO1xuXG4gICAgICB2YXIgbmV3VmFsdWUgPSBjb25maWcuZmllbGRUZW1wbGF0ZVZhbHVlKGNoaWxkRmllbGRUZW1wbGF0ZSk7XG5cbiAgICAgIC8vIEp1c3QgYSBwbGFjZWhvbGRlciBrZXkuIFNob3VsZCBub3QgYmUgaW1wb3J0YW50LlxuICAgICAgdmFyIGtleSA9ICdfX3Vua25vd25fa2V5X18nO1xuXG4gICAgICBpZiAoXy5pc0FycmF5KHBhcmVudEZpZWxkLnZhbHVlKSkge1xuICAgICAgICAvLyBKdXN0IGEgcGxhY2Vob2xkZXIgcG9zaXRpb24gZm9yIGFuIGFycmF5LlxuICAgICAgICBrZXkgPSBwYXJlbnRGaWVsZC52YWx1ZS5sZW5ndGg7XG4gICAgICB9XG5cbiAgICAgIC8vIEp1c3QgYSBwbGFjZWhvbGRlciBmaWVsZCBpbmRleC4gU2hvdWxkIG5vdCBiZSBpbXBvcnRhbnQuXG4gICAgICB2YXIgZmllbGRJbmRleCA9IDA7XG4gICAgICBpZiAoXy5pc09iamVjdChwYXJlbnRGaWVsZC52YWx1ZSkpIHtcbiAgICAgICAgZmllbGRJbmRleCA9IE9iamVjdC5rZXlzKHBhcmVudEZpZWxkLnZhbHVlKS5sZW5ndGg7XG4gICAgICB9XG5cbiAgICAgIHZhciBjaGlsZEZpZWxkID0gY29uZmlnLmNyZWF0ZUNoaWxkRmllbGQocGFyZW50RmllbGQsIHtcbiAgICAgICAgZmllbGRUZW1wbGF0ZTogY2hpbGRGaWVsZFRlbXBsYXRlLCBrZXk6IGtleSwgZmllbGRJbmRleDogZmllbGRJbmRleCwgdmFsdWU6IG5ld1ZhbHVlXG4gICAgICB9KTtcblxuICAgICAgbmV3VmFsdWUgPSBjb25maWcuaW5mbGF0ZUZpZWxkVmFsdWUoY2hpbGRGaWVsZCk7XG5cbiAgICAgIHJldHVybiBuZXdWYWx1ZTtcbiAgICB9LFxuXG4gICAgLy8gR2l2ZW4gYSB2YWx1ZSwgY3JlYXRlIGEgZmllbGQgdGVtcGxhdGUgZm9yIHRoYXQgdmFsdWUuXG4gICAgY3JlYXRlRmllbGRUZW1wbGF0ZUZyb21WYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG5cbiAgICAgIHZhciBmaWVsZCA9IHtcbiAgICAgICAgdHlwZTogJ2pzb24nXG4gICAgICB9O1xuICAgICAgaWYgKF8uaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgICAgIGZpZWxkID0ge1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgIH07XG4gICAgICB9IGVsc2UgaWYgKF8uaXNOdW1iZXIodmFsdWUpKSB7XG4gICAgICAgIGZpZWxkID0ge1xuICAgICAgICAgIHR5cGU6ICdudW1iZXInXG4gICAgICAgIH07XG4gICAgICB9IGVsc2UgaWYgKF8uaXNCb29sZWFuKHZhbHVlKSkge1xuICAgICAgICBmaWVsZCA9IHtcbiAgICAgICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSBpZiAoXy5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICB2YXIgYXJyYXlJdGVtRmllbGRzID0gdmFsdWUubWFwKGZ1bmN0aW9uIChjaGlsZFZhbHVlLCBpKSB7XG4gICAgICAgICAgdmFyIGNoaWxkRmllbGQgPSBjb25maWcuY3JlYXRlRmllbGRUZW1wbGF0ZUZyb21WYWx1ZShjaGlsZFZhbHVlKTtcbiAgICAgICAgICBjaGlsZEZpZWxkLmtleSA9IGk7XG4gICAgICAgICAgcmV0dXJuIGNoaWxkRmllbGQ7XG4gICAgICAgIH0pO1xuICAgICAgICBmaWVsZCA9IHtcbiAgICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICAgIGZpZWxkczogYXJyYXlJdGVtRmllbGRzXG4gICAgICAgIH07XG4gICAgICB9IGVsc2UgaWYgKF8uaXNPYmplY3QodmFsdWUpKSB7XG4gICAgICAgIHZhciBvYmplY3RJdGVtRmllbGRzID0gT2JqZWN0LmtleXModmFsdWUpLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgdmFyIGNoaWxkRmllbGQgPSBjb25maWcuY3JlYXRlRmllbGRUZW1wbGF0ZUZyb21WYWx1ZSh2YWx1ZVtrZXldKTtcbiAgICAgICAgICBjaGlsZEZpZWxkLmtleSA9IGtleTtcbiAgICAgICAgICBjaGlsZEZpZWxkLmxhYmVsID0gY29uZmlnLmh1bWFuaXplKGtleSk7XG4gICAgICAgICAgcmV0dXJuIGNoaWxkRmllbGQ7XG4gICAgICAgIH0pO1xuICAgICAgICBmaWVsZCA9IHtcbiAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICBmaWVsZHM6IG9iamVjdEl0ZW1GaWVsZHNcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSBpZiAoXy5pc051bGwodmFsdWUpKSB7XG4gICAgICAgIGZpZWxkID0ge1xuICAgICAgICAgIHR5cGU6ICdqc29uJ1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZpZWxkO1xuICAgIH0sXG5cbiAgICAvLyBEZWZhdWx0IHZhbHVlIGZhY3RvcnlcblxuICAgIGNyZWF0ZURlZmF1bHRWYWx1ZTogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcblxuICAgICAgdmFyIGRlZmF1bHRWYWx1ZSA9IGNvbmZpZy5maWVsZFRlbXBsYXRlRGVmYXVsdFZhbHVlKGZpZWxkVGVtcGxhdGUpO1xuXG4gICAgICBpZiAoIV8uaXNVbmRlZmluZWQoZGVmYXVsdFZhbHVlKSkge1xuICAgICAgICByZXR1cm4gdXRpbHMuZGVlcENvcHkoZGVmYXVsdFZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHR5cGVOYW1lID0gY29uZmlnLmZpZWxkVHlwZU5hbWUoZmllbGRUZW1wbGF0ZSk7XG5cbiAgICAgIGlmIChjb25maWdbJ2NyZWF0ZURlZmF1bHRWYWx1ZV8nICsgdHlwZU5hbWVdKSB7XG4gICAgICAgIHJldHVybiBjb25maWdbJ2NyZWF0ZURlZmF1bHRWYWx1ZV8nICsgdHlwZU5hbWVdKGZpZWxkVGVtcGxhdGUpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gJyc7XG4gICAgfSxcblxuICAgIC8vIEZpZWxkIGhlbHBlcnNcblxuICAgIC8vIERldGVybWluZSBpZiBhIHZhbHVlIFwiZXhpc3RzXCIuXG4gICAgaGFzVmFsdWU6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlLCB2YWx1ZSkge1xuICAgICAgcmV0dXJuIHZhbHVlICE9PSBudWxsICYmICFfLmlzVW5kZWZpbmVkKHZhbHVlKTtcbiAgICB9LFxuXG4gICAgLy8gQ29lcmNlIGEgdmFsdWUgdG8gdmFsdWUgYXBwcm9wcmlhdGUgZm9yIGEgZmllbGQuXG4gICAgY29lcmNlVmFsdWU6IGZ1bmN0aW9uIChmaWVsZCwgdmFsdWUpIHtcblxuICAgICAgdmFyIHR5cGVOYW1lID0gY29uZmlnLmZpZWxkVHlwZU5hbWUoZmllbGQpO1xuXG4gICAgICBpZiAoY29uZmlnWydjb2VyY2VWYWx1ZV8nICsgdHlwZU5hbWVdKSB7XG4gICAgICAgIHJldHVybiBjb25maWdbJ2NvZXJjZVZhbHVlXycgKyB0eXBlTmFtZV0oZmllbGQsIHZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG5cbiAgICAvLyBHaXZlbiBhIGZpZWxkIGFuZCBhIGNoaWxkIHZhbHVlLCBmaW5kIHRoZSBhcHByb3ByaWF0ZSBmaWVsZCB0ZW1wbGF0ZSBmb3JcbiAgICAvLyB0aGF0IGNoaWxkIHZhbHVlLlxuICAgIGNoaWxkRmllbGRUZW1wbGF0ZUZvclZhbHVlOiBmdW5jdGlvbiAoZmllbGQsIGNoaWxkVmFsdWUpIHtcblxuICAgICAgdmFyIGZpZWxkVGVtcGxhdGU7XG5cbiAgICAgIHZhciBmaWVsZFRlbXBsYXRlcyA9IGNvbmZpZy5maWVsZEl0ZW1GaWVsZFRlbXBsYXRlcyhmaWVsZCk7XG5cbiAgICAgIGZpZWxkVGVtcGxhdGUgPSBfLmZpbmQoZmllbGRUZW1wbGF0ZXMsIGZ1bmN0aW9uIChpdGVtRmllbGRUZW1wbGF0ZSkge1xuICAgICAgICByZXR1cm4gY29uZmlnLm1hdGNoZXNGaWVsZFRlbXBsYXRlVG9WYWx1ZShpdGVtRmllbGRUZW1wbGF0ZSwgY2hpbGRWYWx1ZSk7XG4gICAgICB9KTtcblxuICAgICAgaWYgKGZpZWxkVGVtcGxhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZpZWxkVGVtcGxhdGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUZpZWxkVGVtcGxhdGVGcm9tVmFsdWUoY2hpbGRWYWx1ZSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgbWF0Y2ggZm9yIGEgZmllbGQgdGVtcGxhdGUuXG4gICAgbWF0Y2hlc0ZpZWxkVGVtcGxhdGVUb1ZhbHVlOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSwgdmFsdWUpIHtcbiAgICAgIHZhciBtYXRjaCA9IGZpZWxkVGVtcGxhdGUubWF0Y2g7XG4gICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIF8uZXZlcnkoT2JqZWN0LmtleXMobWF0Y2gpLCBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIHJldHVybiBfLmlzRXF1YWwobWF0Y2hba2V5XSwgdmFsdWVba2V5XSk7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgLy8gRmllbGQgdGVtcGxhdGUgaGVscGVyc1xuXG4gICAgLy8gTm9ybWFsaXplZCAoUGFzY2FsQ2FzZSkgdHlwZSBuYW1lIGZvciBhIGZpZWxkLlxuICAgIGZpZWxkVGVtcGxhdGVUeXBlTmFtZTogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcblxuICAgICAgdmFyIHR5cGVOYW1lID0gdXRpbHMuZGFzaFRvUGFzY2FsKGZpZWxkVGVtcGxhdGUudHlwZSB8fCAndW5kZWZpbmVkJyk7XG5cbiAgICAgIHZhciBhbGlhcyA9IGNvbmZpZ1snYWxpYXNfJyArIHR5cGVOYW1lXTtcblxuICAgICAgaWYgKGFsaWFzKSB7XG4gICAgICAgIGlmIChfLmlzRnVuY3Rpb24oYWxpYXMpKSB7XG4gICAgICAgICAgcmV0dXJuIGFsaWFzLmNhbGwoY29uZmlnLCBmaWVsZFRlbXBsYXRlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gYWxpYXM7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGZpZWxkVGVtcGxhdGUubGlzdCkge1xuICAgICAgICB0eXBlTmFtZSA9ICdBcnJheSc7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0eXBlTmFtZTtcbiAgICB9LFxuXG4gICAgLy8gRGVmYXVsdCB2YWx1ZSBmb3IgYSBmaWVsZCB0ZW1wbGF0ZS5cbiAgICBmaWVsZFRlbXBsYXRlRGVmYXVsdFZhbHVlOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSkge1xuXG4gICAgICByZXR1cm4gZmllbGRUZW1wbGF0ZS5kZWZhdWx0O1xuICAgIH0sXG5cbiAgICAvLyBWYWx1ZSBmb3IgYSBmaWVsZCB0ZW1wbGF0ZS4gVXNlZCB0byBkZXRlcm1pbmUgdGhlIHZhbHVlIG9mIGEgbmV3IGNoaWxkXG4gICAgLy8gZmllbGQuXG4gICAgZmllbGRUZW1wbGF0ZVZhbHVlOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSkge1xuXG4gICAgICAvLyBUaGlzIGxvZ2ljIG1pZ2h0IGJlIGJyaXR0bGUuXG5cbiAgICAgIHZhciBkZWZhdWx0VmFsdWUgPSBjb25maWcuZmllbGRUZW1wbGF0ZURlZmF1bHRWYWx1ZShmaWVsZFRlbXBsYXRlKTtcblxuICAgICAgdmFyIG1hdGNoID0gY29uZmlnLmZpZWxkVGVtcGxhdGVNYXRjaChmaWVsZFRlbXBsYXRlKTtcblxuICAgICAgdmFyIHZhbHVlO1xuXG4gICAgICBpZiAoXy5pc1VuZGVmaW5lZChkZWZhdWx0VmFsdWUpICYmICFfLmlzVW5kZWZpbmVkKG1hdGNoKSkge1xuICAgICAgICByZXR1cm4gdXRpbHMuZGVlcENvcHkobWF0Y2gpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVEZWZhdWx0VmFsdWUoZmllbGRUZW1wbGF0ZSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9LFxuXG4gICAgLy8gTWF0Y2ggcnVsZSBmb3IgYSBmaWVsZCB0ZW1wbGF0ZS5cbiAgICBmaWVsZFRlbXBsYXRlTWF0Y2g6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgICByZXR1cm4gZmllbGRUZW1wbGF0ZS5tYXRjaDtcbiAgICB9LFxuXG4gICAgLy8gRGV0ZXJtaW5lIGlmIGEgZmllbGQgdGVtcGxhdGUgaGFzIGEgc2luZ2xlLWxpbmUgdmFsdWUuXG4gICAgZmllbGRUZW1wbGF0ZUlzU2luZ2xlTGluZTogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcbiAgICAgIHJldHVybiBmaWVsZFRlbXBsYXRlLmlzU2luZ2xlTGluZSB8fCBmaWVsZFRlbXBsYXRlLmlzX3NpbmdsZV9saW5lIHx8XG4gICAgICAgICAgICAgIGZpZWxkVGVtcGxhdGUudHlwZSA9PT0gJ3NpbmdsZS1saW5lLXN0cmluZycgfHwgZmllbGRUZW1wbGF0ZS50eXBlID09PSAnU2luZ2xlTGluZVN0cmluZyc7XG4gICAgfSxcblxuICAgIC8vIEZpZWxkIGhlbHBlcnNcblxuICAgIC8vIEdldCBhbiBhcnJheSBvZiBrZXlzIHJlcHJlc2VudGluZyB0aGUgcGF0aCB0byBhIHZhbHVlLlxuICAgIGZpZWxkVmFsdWVQYXRoOiBmdW5jdGlvbiAoZmllbGQpIHtcblxuICAgICAgdmFyIHBhcmVudFBhdGggPSBbXTtcblxuICAgICAgaWYgKGZpZWxkLnBhcmVudCkge1xuICAgICAgICBwYXJlbnRQYXRoID0gY29uZmlnLmZpZWxkVmFsdWVQYXRoKGZpZWxkLnBhcmVudCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwYXJlbnRQYXRoLmNvbmNhdChmaWVsZC5rZXkpLmZpbHRlcihmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIHJldHVybiAhXy5pc1VuZGVmaW5lZChrZXkpICYmIGtleSAhPT0gJyc7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgLy8gQ2xvbmUgYSBmaWVsZCB3aXRoIGEgZGlmZmVyZW50IHZhbHVlLlxuICAgIGZpZWxkV2l0aFZhbHVlOiBmdW5jdGlvbiAoZmllbGQsIHZhbHVlKSB7XG4gICAgICByZXR1cm4gXy5leHRlbmQoe30sIGZpZWxkLCB7dmFsdWU6IHZhbHVlfSk7XG4gICAgfSxcblxuICAgIGZpZWxkVHlwZU5hbWU6IGRlbGVnYXRlVG8oJ2ZpZWxkVGVtcGxhdGVUeXBlTmFtZScpLFxuXG4gICAgLy8gRmllbGQgaXMgbG9hZGluZyBjaG9pY2VzLlxuICAgIGZpZWxkSXNMb2FkaW5nOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgIHJldHVybiBmaWVsZC5pc0xvYWRpbmc7XG4gICAgfSxcblxuICAgIC8vIEdldCB0aGUgY2hvaWNlcyBmb3IgYSBkcm9wZG93biBmaWVsZC5cbiAgICBmaWVsZENob2ljZXM6IGZ1bmN0aW9uIChmaWVsZCkge1xuXG4gICAgICByZXR1cm4gY29uZmlnLm5vcm1hbGl6ZUNob2ljZXMoZmllbGQuY2hvaWNlcyk7XG4gICAgfSxcblxuICAgIC8vIEdldCB0aGUgY2hvaWNlcyBmb3IgYSBwcmV0dHkgZHJvcGRvd24gZmllbGQuXG4gICAgZmllbGRQcmV0dHlDaG9pY2VzOiBmdW5jdGlvbiAoZmllbGQpIHtcblxuICAgICAgcmV0dXJuIGNvbmZpZy5ub3JtYWxpemVQcmV0dHlDaG9pY2VzKGZpZWxkLmNob2ljZXMpO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgYSBzZXQgb2YgYm9vbGVhbiBjaG9pY2VzIGZvciBhIGZpZWxkLlxuICAgIGZpZWxkQm9vbGVhbkNob2ljZXM6IGZ1bmN0aW9uIChmaWVsZCkge1xuXG4gICAgICB2YXIgY2hvaWNlcyA9IGNvbmZpZy5maWVsZENob2ljZXMoZmllbGQpO1xuXG4gICAgICBpZiAoY2hvaWNlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgbGFiZWw6ICd5ZXMnLFxuICAgICAgICAgIHZhbHVlOiB0cnVlXG4gICAgICAgIH0sIHtcbiAgICAgICAgICBsYWJlbDogJ25vJyxcbiAgICAgICAgICB2YWx1ZTogZmFsc2VcbiAgICAgICAgfV07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjaG9pY2VzLm1hcChmdW5jdGlvbiAoY2hvaWNlKSB7XG4gICAgICAgIGlmIChfLmlzQm9vbGVhbihjaG9pY2UudmFsdWUpKSB7XG4gICAgICAgICAgcmV0dXJuIGNob2ljZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gXy5leHRlbmQoe30sIGNob2ljZSwge1xuICAgICAgICAgIHZhbHVlOiBjb25maWcuY29lcmNlVmFsdWVUb0Jvb2xlYW4oY2hvaWNlLnZhbHVlKVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgYSBzZXQgb2YgcmVwbGFjZW1lbnQgY2hvaWNlcyBmb3IgYSBmaWVsZC5cbiAgICBmaWVsZFJlcGxhY2VDaG9pY2VzOiBmdW5jdGlvbiAoZmllbGQpIHtcblxuICAgICAgcmV0dXJuIGNvbmZpZy5ub3JtYWxpemVDaG9pY2VzKGZpZWxkLnJlcGxhY2VDaG9pY2VzKTtcbiAgICB9LFxuXG4gICAgLy8gVGhlIGFjdGl2ZSBzZWxlY3RlZCBjaG9pY2UgY291bGQgYmUgdW5hdmFpbGFibGUgaW4gdGhlIGN1cnJlbnQgbGlzdCBvZlxuICAgIC8vIGNob2ljZXMuIFRoaXMgcHJvdmlkZXMgdGhlIHNlbGVjdGVkIGNob2ljZSBpbiB0aGF0IGNhc2UuXG4gICAgZmllbGRTZWxlY3RlZENob2ljZTogZnVuY3Rpb24gKGZpZWxkKSB7XG5cbiAgICAgIHJldHVybiBmaWVsZC5zZWxlY3RlZENob2ljZSB8fCBudWxsO1xuICAgIH0sXG5cbiAgICAvLyBUaGUgYWN0aXZlIHJlcGxhY2UgbGFiZWxzIGNvdWxkIGJlIHVuYXZpbGFibGUgaW4gdGhlIGN1cnJlbnQgbGlzdCBvZlxuICAgIC8vIHJlcGxhY2UgY2hvaWNlcy4gVGhpcyBwcm92aWRlcyB0aGUgY3VycmVudGx5IHVzZWQgcmVwbGFjZSBsYWJlbHMgaW5cbiAgICAvLyB0aGF0IGNhc2UuXG4gICAgZmllbGRTZWxlY3RlZFJlcGxhY2VDaG9pY2VzOiBmdW5jdGlvbiAoZmllbGQpIHtcblxuICAgICAgcmV0dXJuIGNvbmZpZy5ub3JtYWxpemVDaG9pY2VzKGZpZWxkLnNlbGVjdGVkUmVwbGFjZUNob2ljZXMpO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgYSBsYWJlbCBmb3IgYSBmaWVsZC5cbiAgICBmaWVsZExhYmVsOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgIHJldHVybiBmaWVsZC5sYWJlbDtcbiAgICB9LFxuXG4gICAgLy8gR2V0IGEgcGxhY2Vob2xkZXIgKGp1c3QgYSBkZWZhdWx0IGRpc3BsYXkgdmFsdWUsIG5vdCBhIGRlZmF1bHQgdmFsdWUpIGZvciBhIGZpZWxkLlxuICAgIGZpZWxkUGxhY2Vob2xkZXI6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgcmV0dXJuIGZpZWxkLnBsYWNlaG9sZGVyO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgdGhlIGhlbHAgdGV4dCBmb3IgYSBmaWVsZC5cbiAgICBmaWVsZEhlbHBUZXh0OiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgIHJldHVybiBmaWVsZC5oZWxwX3RleHRfaHRtbCB8fCBmaWVsZC5oZWxwX3RleHQgfHwgZmllbGQuaGVscFRleHQgfHwgZmllbGQuaGVscFRleHRIdG1sO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgd2hldGhlciBvciBub3QgYSBmaWVsZCBpcyByZXF1aXJlZC5cbiAgICBmaWVsZElzUmVxdWlyZWQ6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgcmV0dXJuIGZpZWxkLnJlcXVpcmVkID8gdHJ1ZSA6IGZhbHNlO1xuICAgIH0sXG5cbiAgICAvLyBEZXRlcm1pbmUgaWYgdmFsdWUgZm9yIHRoaXMgZmllbGQgaXMgbm90IGEgbGVhZiB2YWx1ZS5cbiAgICBmaWVsZEhhc1ZhbHVlQ2hpbGRyZW46IGZ1bmN0aW9uIChmaWVsZCkge1xuXG4gICAgICB2YXIgZGVmYXVsdFZhbHVlID0gY29uZmlnLmNyZWF0ZURlZmF1bHRWYWx1ZShmaWVsZCk7XG5cbiAgICAgIGlmIChfLmlzT2JqZWN0KGRlZmF1bHRWYWx1ZSkgfHwgXy5pc0FycmF5KGRlZmF1bHRWYWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuXG4gICAgLy8gR2V0IHRoZSBjaGlsZCBmaWVsZCB0ZW1wbGF0ZXMgZm9yIHRoaXMgZmllbGQuXG4gICAgZmllbGRDaGlsZEZpZWxkVGVtcGxhdGVzOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgIHJldHVybiBmaWVsZC5maWVsZHMgfHwgW107XG4gICAgfSxcblxuICAgIC8vIEdldCB0aGUgZmllbGQgdGVtcGxhdGVzIGZvciBlYWNoIGl0ZW0gb2YgdGhpcyBmaWVsZC4gKEZvciBkeW5hbWljIGNoaWxkcmVuLFxuICAgIC8vIGxpa2UgYXJyYXlzLilcbiAgICBmaWVsZEl0ZW1GaWVsZFRlbXBsYXRlczogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICBpZiAoIWZpZWxkLml0ZW1GaWVsZHMpIHtcbiAgICAgICAgcmV0dXJuIFt7dHlwZTogJ3RleHQnfV07XG4gICAgICB9XG4gICAgICBpZiAoIV8uaXNBcnJheShmaWVsZC5pdGVtRmllbGRzKSkge1xuICAgICAgICByZXR1cm4gW2ZpZWxkLml0ZW1GaWVsZHNdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZpZWxkLml0ZW1GaWVsZHM7XG4gICAgfSxcblxuICAgIGZpZWxkSXNTaW5nbGVMaW5lOiBkZWxlZ2F0ZVRvKCdmaWVsZFRlbXBsYXRlSXNTaW5nbGVMaW5lJyksXG5cbiAgICAvLyBHZXQgd2hldGhlciBvciBub3QgYSBmaWVsZCBpcyBjb2xsYXBzZWQuXG4gICAgZmllbGRJc0NvbGxhcHNlZDogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICByZXR1cm4gZmllbGQuY29sbGFwc2VkID8gdHJ1ZSA6IGZhbHNlO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgd2hldGVyIG9yIG5vdCBhIGZpZWxkIGNhbiBiZSBjb2xsYXBzZWQuXG4gICAgZmllbGRJc0NvbGxhcHNpYmxlOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgIHJldHVybiBmaWVsZC5jb2xsYXBzaWJsZSB8fCAhXy5pc1VuZGVmaW5lZChmaWVsZC5jb2xsYXBzZWQpO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgdGhlIG51bWJlciBvZiByb3dzIGZvciBhIGZpZWxkLlxuICAgIGZpZWxkUm93czogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICByZXR1cm4gZmllbGQucm93cztcbiAgICB9LFxuXG4gICAgZmllbGRFcnJvcnM6IGZ1bmN0aW9uIChmaWVsZCkge1xuXG4gICAgICB2YXIgZXJyb3JzID0gW107XG5cbiAgICAgIGlmIChjb25maWcuaXNLZXkoZmllbGQua2V5KSkge1xuICAgICAgICBjb25maWcudmFsaWRhdGVGaWVsZChmaWVsZCwgZXJyb3JzKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGVycm9ycztcbiAgICB9LFxuXG4gICAgZmllbGRNYXRjaDogZGVsZWdhdGVUbygnZmllbGRUZW1wbGF0ZU1hdGNoJyksXG5cbiAgICAvLyBPdGhlciBoZWxwZXJzXG5cbiAgICAvLyBDb252ZXJ0IGEga2V5IHRvIGEgbmljZSBodW1hbi1yZWFkYWJsZSB2ZXJzaW9uLlxuICAgIGh1bWFuaXplOiBmdW5jdGlvbihwcm9wZXJ0eSkge1xuICAgICAgcHJvcGVydHkgPSBwcm9wZXJ0eS5yZXBsYWNlKC9cXHtcXHsvZywgJycpO1xuICAgICAgcHJvcGVydHkgPSBwcm9wZXJ0eS5yZXBsYWNlKC9cXH1cXH0vZywgJycpO1xuICAgICAgcmV0dXJuIHByb3BlcnR5LnJlcGxhY2UoL18vZywgJyAnKVxuICAgICAgLnJlcGxhY2UoLyhcXHcrKS9nLCBmdW5jdGlvbihtYXRjaCkge1xuICAgICAgICByZXR1cm4gbWF0Y2guY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBtYXRjaC5zbGljZSgxKTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvLyBOb3JtYWxpemUgc29tZSBjaG9pY2VzIGZvciBhIGRyb3AtZG93bi5cbiAgICBub3JtYWxpemVDaG9pY2VzOiBmdW5jdGlvbiAoY2hvaWNlcykge1xuXG4gICAgICBpZiAoIWNob2ljZXMpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfVxuXG4gICAgICAvLyBDb252ZXJ0IGNvbW1hIHNlcGFyYXRlZCBzdHJpbmcgdG8gYXJyYXkgb2Ygc3RyaW5ncy5cbiAgICAgIGlmIChfLmlzU3RyaW5nKGNob2ljZXMpKSB7XG4gICAgICAgIGNob2ljZXMgPSBjaG9pY2VzLnNwbGl0KCcsJyk7XG4gICAgICB9XG5cbiAgICAgIC8vIENvbnZlcnQgb2JqZWN0IHRvIGFycmF5IG9mIG9iamVjdHMgd2l0aCBgdmFsdWVgIGFuZCBgbGFiZWxgIHByb3BlcnRpZXMuXG4gICAgICBpZiAoIV8uaXNBcnJheShjaG9pY2VzKSAmJiBfLmlzT2JqZWN0KGNob2ljZXMpKSB7XG4gICAgICAgIGNob2ljZXMgPSBPYmplY3Qua2V5cyhjaG9pY2VzKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWx1ZToga2V5LFxuICAgICAgICAgICAgbGFiZWw6IGNob2ljZXNba2V5XVxuICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBDb3B5IHRoZSBhcnJheSBvZiBjaG9pY2VzIHNvIHdlIGNhbiBtYW5pcHVsYXRlIHRoZW0uXG4gICAgICBjaG9pY2VzID0gY2hvaWNlcy5zbGljZSgwKTtcblxuICAgICAgLy8gQXJyYXkgb2YgY2hvaWNlIGFycmF5cyBzaG91bGQgYmUgZmxhdHRlbmVkLlxuICAgICAgY2hvaWNlcyA9IF8uZmxhdHRlbihjaG9pY2VzKTtcblxuICAgICAgY2hvaWNlcy5mb3JFYWNoKGZ1bmN0aW9uIChjaG9pY2UsIGkpIHtcbiAgICAgICAgLy8gQ29udmVydCBhbnkgc3RyaW5nIGNob2ljZXMgdG8gb2JqZWN0cyB3aXRoIGB2YWx1ZWAgYW5kIGBsYWJlbGBcbiAgICAgICAgLy8gcHJvcGVydGllcy5cbiAgICAgICAgaWYgKF8uaXNTdHJpbmcoY2hvaWNlKSkge1xuICAgICAgICAgIGNob2ljZXNbaV0gPSB7XG4gICAgICAgICAgICB2YWx1ZTogY2hvaWNlLFxuICAgICAgICAgICAgbGFiZWw6IGNvbmZpZy5odW1hbml6ZShjaG9pY2UpXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWNob2ljZXNbaV0ubGFiZWwpIHtcbiAgICAgICAgICBjaG9pY2VzW2ldLmxhYmVsID0gY29uZmlnLmh1bWFuaXplKGNob2ljZXNbaV0udmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGNob2ljZXM7XG4gICAgfSxcblxuICAgIC8vIE5vcm1hbGl6ZSBjaG9pY2VzIGZvciBhIHByZXR0eSBkcm9wIGRvd24sIHdpdGggJ3NhbXBsZScgdmFsdWVzXG4gICAgbm9ybWFsaXplUHJldHR5Q2hvaWNlczogZnVuY3Rpb24gKGNob2ljZXMpIHtcbiAgICAgIGlmICghXy5pc0FycmF5KGNob2ljZXMpICYmIF8uaXNPYmplY3QoY2hvaWNlcykpIHtcbiAgICAgICAgY2hvaWNlcyA9IE9iamVjdC5rZXlzKGNob2ljZXMpLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbHVlOiBrZXksXG4gICAgICAgICAgICBsYWJlbDogY2hvaWNlc1trZXldLFxuICAgICAgICAgICAgc2FtcGxlOiBrZXlcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNvbmZpZy5ub3JtYWxpemVDaG9pY2VzKGNob2ljZXMpO1xuICAgIH0sXG5cbiAgICAvLyBDb2VyY2UgYSB2YWx1ZSB0byBhIGJvb2xlYW5cbiAgICBjb2VyY2VWYWx1ZVRvQm9vbGVhbjogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICBpZiAoIV8uaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgICAgIC8vIEp1c3QgdXNlIHRoZSBkZWZhdWx0IHRydXRoaW5lc3MuXG4gICAgICAgIHJldHVybiB2YWx1ZSA/IHRydWUgOiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHZhbHVlID0gdmFsdWUudG9Mb3dlckNhc2UoKTtcbiAgICAgIGlmICh2YWx1ZSA9PT0gJycgfHwgdmFsdWUgPT09ICdubycgfHwgdmFsdWUgPT09ICdvZmYnIHx8IHZhbHVlID09PSAnZmFsc2UnKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cbiAgICAvLyBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIHZhbGlkIGtleS5cbiAgICBpc0tleTogZnVuY3Rpb24gKGtleSkge1xuICAgICAgcmV0dXJuIChfLmlzTnVtYmVyKGtleSkgJiYga2V5ID49IDApIHx8IChfLmlzU3RyaW5nKGtleSkgJiYga2V5ICE9PSAnJyk7XG4gICAgfSxcblxuICAgIC8vIEZhc3Qgd2F5IHRvIGNoZWNrIGZvciBlbXB0eSBvYmplY3QuXG4gICAgaXNFbXB0eU9iamVjdDogZnVuY3Rpb24gKG9iaikge1xuICAgICAgZm9yKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcblxuICAgIGFjdGlvbkNob2ljZUxhYmVsOiBmdW5jdGlvbiAoYWN0aW9uKSB7XG4gICAgICByZXR1cm4gdXRpbHMuY2FwaXRhbGl6ZShhY3Rpb24pLnJlcGxhY2UoL1stXS9nLCAnICcpO1xuICAgIH1cbiAgfTtcbn07XG4iLCIvLyAjIGZvcm1hdGljXG5cbi8qXG5UaGUgcm9vdCBmb3JtYXRpYyBjb21wb25lbnQuXG5cblRoZSByb290IGZvcm1hdGljIGNvbXBvbmVudCBpcyBhY3R1YWxseSB0d28gY29tcG9uZW50cy4gVGhlIG1haW4gY29tcG9uZW50IGlzXG5hIGNvbnRyb2xsZWQgY29tcG9uZW50IHdoZXJlIHlvdSBtdXN0IHBhc3MgdGhlIHZhbHVlIGluIHdpdGggZWFjaCByZW5kZXIuIFRoaXNcbmlzIGFjdHVhbGx5IHdyYXBwZWQgaW4gYW5vdGhlciBjb21wb25lbnQgd2hpY2ggYWxsb3dzIHlvdSB0byB1c2UgZm9ybWF0aWMgYXNcbmFuIHVuY29udHJvbGxlZCBjb21wb25lbnQgd2hlcmUgaXQgcmV0YWlucyB0aGUgc3RhdGUgb2YgdGhlIHZhbHVlLiBUaGUgd3JhcHBlclxuaXMgd2hhdCBpcyBhY3R1YWxseSBleHBvcnRlZC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgXyA9IHJlcXVpcmUoJy4vdW5kYXNoJyk7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxudmFyIGRlZmF1bHRDb25maWdQbHVnaW4gPSByZXF1aXJlKCcuL2RlZmF1bHQtY29uZmlnJyk7XG5cbnZhciBjcmVhdGVDb25maWcgPSBmdW5jdGlvbiAoLi4uYXJncykge1xuICB2YXIgcGx1Z2lucyA9IFtkZWZhdWx0Q29uZmlnUGx1Z2luXS5jb25jYXQoYXJncyk7XG5cbiAgcmV0dXJuIHBsdWdpbnMucmVkdWNlKGZ1bmN0aW9uIChjb25maWcsIHBsdWdpbikge1xuICAgIGlmIChfLmlzRnVuY3Rpb24ocGx1Z2luKSkge1xuICAgICAgdmFyIGV4dGVuc2lvbnMgPSBwbHVnaW4oY29uZmlnKTtcbiAgICAgIGlmIChleHRlbnNpb25zKSB7XG4gICAgICAgIF8uZXh0ZW5kKGNvbmZpZywgZXh0ZW5zaW9ucyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIF8uZXh0ZW5kKGNvbmZpZywgcGx1Z2luKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29uZmlnO1xuICB9LCB7fSk7XG59O1xuXG52YXIgZGVmYXVsdENvbmZpZyA9IGNyZWF0ZUNvbmZpZygpO1xuXG4vLyBUaGUgbWFpbiBmb3JtYXRpYyBjb21wb25lbnQgdGhhdCByZW5kZXJzIHRoZSBmb3JtLlxudmFyIEZvcm1hdGljQ29udHJvbGxlZENsYXNzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnRm9ybWF0aWNDb250cm9sbGVkJyxcblxuICAvLyBSZXNwb25kIHRvIGFueSB2YWx1ZSBjaGFuZ2VzLlxuICBvbkNoYW5nZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBpbmZvKSB7XG4gICAgaWYgKCF0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGluZm8gPSBfLmV4dGVuZCh7fSwgaW5mbyk7XG4gICAgaW5mby5wYXRoID0gdGhpcy5wcm9wcy5jb25maWcuZmllbGRWYWx1ZVBhdGgoaW5mby5maWVsZCk7XG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSwgaW5mbyk7XG4gIH0sXG5cbiAgLy8gUmVzcG9uZCB0byBhbnkgYWN0aW9ucyBvdGhlciB0aGFuIHZhbHVlIGNoYW5nZXMuIChGb3IgZXhhbXBsZSwgZm9jdXMgYW5kXG4gIC8vIGJsdXIuKVxuICBvbkFjdGlvbjogZnVuY3Rpb24gKGluZm8pIHtcbiAgICBpZiAoIXRoaXMucHJvcHMub25BY3Rpb24pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaW5mbyA9IF8uZXh0ZW5kKHt9LCBpbmZvKTtcbiAgICBpbmZvLnBhdGggPSB0aGlzLnByb3BzLmNvbmZpZy5maWVsZFZhbHVlUGF0aChpbmZvLmZpZWxkKTtcbiAgICB0aGlzLnByb3BzLm9uQWN0aW9uKGluZm8pO1xuICB9LFxuXG4gIC8vIFJlbmRlciB0aGUgcm9vdCBjb21wb25lbnQgYnkgZGVsZWdhdGluZyB0byB0aGUgY29uZmlnLlxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblxuICAgIHJldHVybiBjb25maWcucmVuZGVyRm9ybWF0aWNDb21wb25lbnQodGhpcyk7XG4gIH1cbn0pO1xuXG52YXIgRm9ybWF0aWNDb250cm9sbGVkID0gUmVhY3QuY3JlYXRlRmFjdG9yeShGb3JtYXRpY0NvbnRyb2xsZWRDbGFzcyk7XG5cbi8vIEEgd3JhcHBlciBjb21wb25lbnQgdGhhdCBpcyBhY3R1YWxseSBleHBvcnRlZCBhbmQgY2FuIGFsbG93IGZvcm1hdGljIHRvIGJlXG4vLyB1c2VkIGluIGFuIFwidW5jb250cm9sbGVkXCIgbWFubmVyLiAoU2VlIHVuY29udHJvbGxlZCBjb21wb25lbnRzIGluIHRoZSBSZWFjdFxuLy8gZG9jdW1lbnRhdGlvbiBmb3IgYW4gZXhwbGFuYXRpb24gb2YgdGhlIGRpZmZlcmVuY2UuKVxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdGb3JtYXRpYycsXG5cbiAgLy8gRXhwb3J0IHNvbWUgc3R1ZmYgYXMgc3RhdGljcy5cbiAgc3RhdGljczoge1xuICAgIGNyZWF0ZUNvbmZpZzogY3JlYXRlQ29uZmlnLFxuICAgIGF2YWlsYWJsZU1peGluczoge1xuICAgICAgY2xpY2tPdXRzaWRlOiByZXF1aXJlKCcuL21peGlucy9jbGljay1vdXRzaWRlLmpzJyksXG4gICAgICBmaWVsZDogcmVxdWlyZSgnLi9taXhpbnMvZmllbGQuanMnKSxcbiAgICAgIGhlbHBlcjogcmVxdWlyZSgnLi9taXhpbnMvaGVscGVyLmpzJyksXG4gICAgICByZXNpemU6IHJlcXVpcmUoJy4vbWl4aW5zL3Jlc2l6ZS5qcycpLFxuICAgICAgc2Nyb2xsOiByZXF1aXJlKCcuL21peGlucy9zY3JvbGwuanMnKSxcbiAgICAgIHVuZG9TdGFjazogcmVxdWlyZSgnLi9taXhpbnMvdW5kby1zdGFjay5qcycpXG4gICAgfSxcbiAgICBwbHVnaW5zOiB7XG4gICAgICBib290c3RyYXA6IHJlcXVpcmUoJy4vcGx1Z2lucy9ib290c3RyYXAnKSxcbiAgICAgIG1ldGE6IHJlcXVpcmUoJy4vcGx1Z2lucy9tZXRhJyksXG4gICAgICByZWZlcmVuY2U6IHJlcXVpcmUoJy4vcGx1Z2lucy9yZWZlcmVuY2UnKSxcbiAgICAgIGVsZW1lbnRDbGFzc2VzOiByZXF1aXJlKCcuL3BsdWdpbnMvZWxlbWVudC1jbGFzc2VzJylcbiAgICB9LFxuICAgIHV0aWxzOiB1dGlsc1xuICB9LFxuXG4gIC8vIElmIHdlIGdvdCBhIHZhbHVlLCB0cmVhdCB0aGlzIGNvbXBvbmVudCBhcyBjb250cm9sbGVkLiBFaXRoZXIgd2F5LCByZXRhaW5cbiAgLy8gdGhlIHZhbHVlIGluIHRoZSBzdGF0ZS5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlzQ29udHJvbGxlZDogIV8uaXNVbmRlZmluZWQodGhpcy5wcm9wcy52YWx1ZSksXG4gICAgICB2YWx1ZTogXy5pc1VuZGVmaW5lZCh0aGlzLnByb3BzLnZhbHVlKSA/IHRoaXMucHJvcHMuZGVmYXVsdFZhbHVlIDogdGhpcy5wcm9wcy52YWx1ZVxuICAgIH07XG4gIH0sXG5cbiAgLy8gSWYgdGhpcyBpcyBhIGNvbnRyb2xsZWQgY29tcG9uZW50LCBjaGFuZ2Ugb3VyIHN0YXRlIHRvIHJlZmxlY3QgdGhlIG5ld1xuICAvLyB2YWx1ZS4gRm9yIHVuY29udHJvbGxlZCBjb21wb25lbnRzLCBpZ25vcmUgYW55IHZhbHVlIGNoYW5nZXMuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXdQcm9wcykge1xuICAgIGlmICh0aGlzLnN0YXRlLmlzQ29udHJvbGxlZCkge1xuICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKG5ld1Byb3BzLnZhbHVlKSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICB2YWx1ZTogbmV3UHJvcHMudmFsdWVcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIElmIHRoaXMgaXMgYW4gdW5jb250cm9sbGVkIGNvbXBvbmVudCwgc2V0IG91ciBzdGF0ZSB0byByZWZsZWN0IHRoZSBuZXdcbiAgLy8gdmFsdWUuIEVpdGhlciB3YXksIGNhbGwgdGhlIG9uQ2hhbmdlIGNhbGxiYWNrLlxuICBvbkNoYW5nZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBpbmZvKSB7XG4gICAgaWYgKCF0aGlzLnN0YXRlLmlzQ29udHJvbGxlZCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHZhbHVlOiBuZXdWYWx1ZVxuICAgICAgfSk7XG4gICAgfVxuICAgIGlmICghdGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG5ld1ZhbHVlLCBpbmZvKTtcbiAgfSxcblxuICAvLyBBbnkgYWN0aW9ucyBzaG91bGQgYmUgc2VudCB0byB0aGUgZ2VuZXJpYyBvbkFjdGlvbiBjYWxsYmFjayBidXQgYWxzbyBzcGxpdFxuICAvLyBpbnRvIGRpc2NyZWV0IGNhbGxiYWNrcyBwZXIgYWN0aW9uLlxuICBvbkFjdGlvbjogZnVuY3Rpb24gKGluZm8pIHtcbiAgICBpZiAodGhpcy5wcm9wcy5vbkFjdGlvbikge1xuICAgICAgdGhpcy5wcm9wcy5vbkFjdGlvbihpbmZvKTtcbiAgICB9XG4gICAgdmFyIGFjdGlvbiA9IHV0aWxzLmRhc2hUb1Bhc2NhbChpbmZvLmFjdGlvbik7XG4gICAgaWYgKHRoaXMucHJvcHNbJ29uJyArIGFjdGlvbl0pIHtcbiAgICAgIHRoaXMucHJvcHNbJ29uJyArIGFjdGlvbl0oaW5mbyk7XG4gICAgfVxuICB9LFxuXG4gIC8vIFJlbmRlciB0aGUgd3JhcHBlciBjb21wb25lbnQgKGJ5IGp1c3QgZGVsZWdhdGluZyB0byB0aGUgbWFpbiBjb21wb25lbnQpLlxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZyB8fCBkZWZhdWx0Q29uZmlnO1xuICAgIHZhciB2YWx1ZSA9IHRoaXMuc3RhdGUudmFsdWU7XG5cbiAgICBpZiAodGhpcy5zdGF0ZS5pc0NvbnRyb2xsZWQpIHtcbiAgICAgIGlmICghdGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuICAgICAgICBjb25zb2xlLmxvZygnWW91IHNob3VsZCBzdXBwbHkgYW4gb25DaGFuZ2UgaGFuZGxlciBpZiB5b3Ugc3VwcGx5IGEgdmFsdWUuJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHByb3BzID0ge1xuICAgICAgY29uZmlnOiBjb25maWcsXG4gICAgICAvLyBBbGxvdyBmaWVsZCB0ZW1wbGF0ZXMgdG8gYmUgcGFzc2VkIGluIGFzIGBmaWVsZGAgb3IgYGZpZWxkc2AuIEFmdGVyIHRoaXMsIHN0b3BcbiAgICAgIC8vIGNhbGxpbmcgdGhlbSBmaWVsZHMuXG4gICAgICBmaWVsZFRlbXBsYXRlOiB0aGlzLnByb3BzLmZpZWxkLFxuICAgICAgZmllbGRUZW1wbGF0ZXM6IHRoaXMucHJvcHMuZmllbGRzLFxuICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsXG4gICAgICBvbkFjdGlvbjogdGhpcy5vbkFjdGlvblxuICAgIH07XG5cbiAgICBfLmVhY2godGhpcy5wcm9wcywgZnVuY3Rpb24gKHByb3BWYWx1ZSwga2V5KSB7XG4gICAgICBpZiAoIShrZXkgaW4gcHJvcHMpKSB7XG4gICAgICAgIHByb3BzW2tleV0gPSBwcm9wVmFsdWU7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gRm9ybWF0aWNDb250cm9sbGVkKHByb3BzKTtcbiAgfVxuXG59KTtcbiIsIi8vICMgY2xpY2stb3V0c2lkZSBtaXhpblxuXG4vKlxuVGhlcmUncyBubyBuYXRpdmUgUmVhY3Qgd2F5IHRvIGRldGVjdCBjbGlja2luZyBvdXRzaWRlIGFuIGVsZW1lbnQuIFNvbWV0aW1lc1xudGhpcyBpcyB1c2VmdWwsIHNvIHRoYXQncyB3aGF0IHRoaXMgbWl4aW4gZG9lcy4gVG8gdXNlIGl0LCBtaXggaXQgaW4gYW5kIHVzZSBpdFxuZnJvbSB5b3VyIGNvbXBvbmVudCBsaWtlIHRoaXM6XG5cbmBgYGpzXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLm1peGlucy9jbGljay1vdXRzaWRlJyldLFxuXG4gIG9uQ2xpY2tPdXRzaWRlOiBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS5sb2coJ2NsaWNrZWQgb3V0c2lkZSEnKTtcbiAgfSxcblxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc2V0T25DbGlja091dHNpZGUoJ215RGl2JywgdGhpcy5vbkNsaWNrT3V0c2lkZSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFJlYWN0LkRPTS5kaXYoe3JlZjogJ215RGl2J30sXG4gICAgICAnSGVsbG8hJ1xuICAgIClcbiAgfVxufSk7XG5gYGBcbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSByZXF1aXJlKCcuLi91bmRhc2gnKTtcblxudmFyIGhhc0FuY2VzdG9yID0gZnVuY3Rpb24gKGNoaWxkLCBwYXJlbnQpIHtcbiAgaWYgKGNoaWxkLnBhcmVudE5vZGUgPT09IHBhcmVudCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmIChjaGlsZC5wYXJlbnROb2RlID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiBoYXNBbmNlc3RvcihjaGlsZC5wYXJlbnROb2RlLCBwYXJlbnQpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgaXNOb2RlT3V0c2lkZTogZnVuY3Rpb24gKG5vZGVPdXQsIG5vZGVJbikge1xuICAgIGlmIChub2RlT3V0ID09PSBub2RlSW4pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGhhc0FuY2VzdG9yKG5vZGVPdXQsIG5vZGVJbikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG5cbiAgaXNOb2RlSW5zaWRlOiBmdW5jdGlvbiAobm9kZUluLCBub2RlT3V0KSB7XG4gICAgcmV0dXJuICF0aGlzLmlzTm9kZU91dHNpZGUobm9kZUluLCBub2RlT3V0KTtcbiAgfSxcblxuICBfb25DbGlja01vdXNlZG93bjogZnVuY3Rpb24oKSB7XG4gICAgXy5lYWNoKHRoaXMuY2xpY2tPdXRzaWRlSGFuZGxlcnMsIGZ1bmN0aW9uIChmdW5jcywgcmVmKSB7XG4gICAgICBpZiAodGhpcy5yZWZzW3JlZl0pIHtcbiAgICAgICAgdGhpcy5fbW91c2Vkb3duUmVmc1tyZWZdID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xuICB9LFxuXG4gIF9vbkNsaWNrTW91c2V1cDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgXy5lYWNoKHRoaXMuY2xpY2tPdXRzaWRlSGFuZGxlcnMsIGZ1bmN0aW9uIChmdW5jcywgcmVmKSB7XG4gICAgICBpZiAodGhpcy5yZWZzW3JlZl0gJiYgdGhpcy5fbW91c2Vkb3duUmVmc1tyZWZdKSB7XG4gICAgICAgIGlmICh0aGlzLmlzTm9kZU91dHNpZGUoZXZlbnQudGFyZ2V0LCB0aGlzLnJlZnNbcmVmXS5nZXRET01Ob2RlKCkpKSB7XG4gICAgICAgICAgZnVuY3MuZm9yRWFjaChmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICAgIGZuLmNhbGwodGhpcywgZXZlbnQpO1xuICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuX21vdXNlZG93blJlZnNbcmVmXSA9IGZhbHNlO1xuICAgIH0uYmluZCh0aGlzKSk7XG4gIH0sXG5cbiAgc2V0T25DbGlja091dHNpZGU6IGZ1bmN0aW9uIChyZWYsIGZuKSB7XG4gICAgaWYgKCF0aGlzLmNsaWNrT3V0c2lkZUhhbmRsZXJzW3JlZl0pIHtcbiAgICAgIHRoaXMuY2xpY2tPdXRzaWRlSGFuZGxlcnNbcmVmXSA9IFtdO1xuICAgIH1cbiAgICB0aGlzLmNsaWNrT3V0c2lkZUhhbmRsZXJzW3JlZl0ucHVzaChmbik7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmNsaWNrT3V0c2lkZUhhbmRsZXJzID0ge307XG4gICAgdGhpcy5fZGlkTW91c2VEb3duID0gZmFsc2U7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5fb25DbGlja01vdXNlZG93bik7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX29uQ2xpY2tNb3VzZXVwKTtcbiAgICAvL2RvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fb25DbGlja0RvY3VtZW50KTtcbiAgICB0aGlzLl9tb3VzZWRvd25SZWZzID0ge307XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmNsaWNrT3V0c2lkZUhhbmRsZXJzID0ge307XG4gICAgLy9kb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uQ2xpY2tEb2N1bWVudCk7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX29uQ2xpY2tNb3VzZXVwKTtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9vbkNsaWNrTW91c2Vkb3duKTtcbiAgfVxufTtcbiIsIi8vICMgZmllbGQgbWl4aW5cblxuLypcblRoaXMgbWl4aW4gZ2V0cyBtaXhlZCBpbnRvIGFsbCBmaWVsZCBjb21wb25lbnRzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4uL3VuZGFzaCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICAvLyBTaWduYWwgYSBjaGFuZ2UgaW4gdmFsdWUuXG4gIG9uQ2hhbmdlVmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UodmFsdWUsIHtcbiAgICAgIGZpZWxkOiB0aGlzLnByb3BzLmZpZWxkXG4gICAgfSk7XG4gIH0sXG5cbiAgLy8gQnViYmxlIHVwIGEgdmFsdWUuXG4gIG9uQnViYmxlVmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSwgaW5mbykge1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UodmFsdWUsIGluZm8pO1xuICB9LFxuXG4gIC8vIFN0YXJ0IGFuIGFjdGlvbiBidWJibGluZyB1cCB0aHJvdWdoIHBhcmVudCBjb21wb25lbnRzLlxuICBvblN0YXJ0QWN0aW9uOiBmdW5jdGlvbiAoYWN0aW9uLCBwcm9wcykge1xuICAgIGlmICh0aGlzLnByb3BzLm9uQWN0aW9uKSB7XG4gICAgICB2YXIgaW5mbyA9IF8uZXh0ZW5kKHt9LCBwcm9wcyk7XG4gICAgICBpbmZvLmFjdGlvbiA9IGFjdGlvbjtcbiAgICAgIGluZm8uZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuICAgICAgdGhpcy5wcm9wcy5vbkFjdGlvbihpbmZvKTtcbiAgICB9XG4gIH0sXG5cbiAgb25Gb2N1c0FjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMub25TdGFydEFjdGlvbignZm9jdXMnKTtcbiAgfSxcblxuICBvbkJsdXJBY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLm9uU3RhcnRBY3Rpb24oJ2JsdXInKTtcbiAgfSxcblxuICAvLyBCdWJibGUgdXAgYW4gYWN0aW9uLlxuICBvbkJ1YmJsZUFjdGlvbjogZnVuY3Rpb24gKGluZm8pIHtcbiAgICBpZiAodGhpcy5wcm9wcy5vbkFjdGlvbikge1xuICAgICAgdGhpcy5wcm9wcy5vbkFjdGlvbihpbmZvKTtcbiAgICB9XG4gIH0sXG5cbiAgLy8gRGVsZWdhdGUgcmVuZGVyaW5nIGJhY2sgdG8gY29uZmlnIHNvIGl0IGNhbiBiZSB3cmFwcGVkLlxuICByZW5kZXJXaXRoQ29uZmlnOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMuY29uZmlnLnJlbmRlckZpZWxkQ29tcG9uZW50KHRoaXMpO1xuICB9XG59O1xuIiwiLy8gIyBoZWxwZXIgbWl4aW5cblxuLypcblRoaXMgZ2V0cyBtaXhlZCBpbnRvIGFsbCBoZWxwZXIgY29tcG9uZW50cy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSByZXF1aXJlKCcuLi91bmRhc2gnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgLy8gRGVsZWdhdGUgcmVuZGVyaW5nIGJhY2sgdG8gY29uZmlnIHNvIGl0IGNhbiBiZSB3cmFwcGVkLlxuICByZW5kZXJXaXRoQ29uZmlnOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMuY29uZmlnLnJlbmRlckNvbXBvbmVudCh0aGlzKTtcbiAgfSxcblxuICAvLyBTdGFydCBhbiBhY3Rpb24gYnViYmxpbmcgdXAgdGhyb3VnaCBwYXJlbnQgY29tcG9uZW50cy5cbiAgb25TdGFydEFjdGlvbjogZnVuY3Rpb24gKGFjdGlvbiwgcHJvcHMpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5vbkFjdGlvbikge1xuICAgICAgdmFyIGluZm8gPSBfLmV4dGVuZCh7fSwgcHJvcHMpO1xuICAgICAgaW5mby5hY3Rpb24gPSBhY3Rpb247XG4gICAgICBpbmZvLmZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcbiAgICAgIHRoaXMucHJvcHMub25BY3Rpb24oaW5mbyk7XG4gICAgfVxuICB9LFxuXG4gIC8vIEJ1YmJsZSB1cCBhbiBhY3Rpb24uXG4gIG9uQnViYmxlQWN0aW9uOiBmdW5jdGlvbiAoaW5mbykge1xuICAgIGlmICh0aGlzLnByb3BzLm9uQWN0aW9uKSB7XG4gICAgICB0aGlzLnByb3BzLm9uQWN0aW9uKGluZm8pO1xuICAgIH1cbiAgfSxcblxuICBvbkZvY3VzQWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5vblN0YXJ0QWN0aW9uKCdmb2N1cycpO1xuICB9LFxuXG4gIG9uQmx1ckFjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMub25TdGFydEFjdGlvbignYmx1cicpO1xuICB9XG59O1xuIiwiLy8gIyByZXNpemUgbWl4aW5cblxuLypcbllvdSdkIHRoaW5rIGl0IHdvdWxkIGJlIHByZXR0eSBlYXN5IHRvIGRldGVjdCB3aGVuIGEgRE9NIGVsZW1lbnQgaXMgcmVzaXplZC5cbkFuZCB5b3UnZCBiZSB3cm9uZy4gVGhlcmUgYXJlIHZhcmlvdXMgdHJpY2tzLCBidXQgbm9uZSBvZiB0aGVtIHdvcmsgdmVyeSB3ZWxsLlxuU28sIHVzaW5nIGdvb2Qgb2wnIHBvbGxpbmcgaGVyZS4gVG8gdHJ5IHRvIGJlIGFzIGVmZmljaWVudCBhcyBwb3NzaWJsZSwgdGhlcmVcbmlzIG9ubHkgYSBzaW5nbGUgc2V0SW50ZXJ2YWwgdXNlZCBmb3IgYWxsIGVsZW1lbnRzLiBUbyB1c2U6XG5cbmBgYGpzXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvcmVzaXplJyldLFxuXG4gIG9uUmVzaXplOiBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS5sb2coJ3Jlc2l6ZWQhJyk7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNldE9uUmVzaXplKCdteVRleHQnLCB0aGlzLm9uUmVzaXplKTtcbiAgfSxcblxuICBvbkNoYW5nZTogZnVuY3Rpb24gKCkge1xuICAgIC4uLlxuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSZWFjdC5ET00udGV4dGFyZWEoe3JlZjogJ215VGV4dCcsIHZhbHVlOiB0aGlzLnByb3BzLnZhbHVlLCBvbkNoYW5nZTogLi4ufSlcbiAgfVxufSk7XG5gYGBcbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGlkID0gMDtcblxudmFyIHJlc2l6ZUludGVydmFsRWxlbWVudHMgPSB7fTtcbnZhciByZXNpemVJbnRlcnZhbEVsZW1lbnRzQ291bnQgPSAwO1xudmFyIHJlc2l6ZUludGVydmFsVGltZXIgPSBudWxsO1xuXG52YXIgY2hlY2tFbGVtZW50cyA9IGZ1bmN0aW9uICgpIHtcbiAgT2JqZWN0LmtleXMocmVzaXplSW50ZXJ2YWxFbGVtZW50cykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIGVsZW1lbnQgPSByZXNpemVJbnRlcnZhbEVsZW1lbnRzW2tleV07XG4gICAgaWYgKGVsZW1lbnQuY2xpZW50V2lkdGggIT09IGVsZW1lbnQuX19wcmV2Q2xpZW50V2lkdGggfHwgZWxlbWVudC5jbGllbnRIZWlnaHQgIT09IGVsZW1lbnQuX19wcmV2Q2xpZW50SGVpZ2h0KSB7XG4gICAgICBlbGVtZW50Ll9fcHJldkNsaWVudFdpZHRoID0gZWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICAgIGVsZW1lbnQuX19wcmV2Q2xpZW50SGVpZ2h0ID0gZWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgICB2YXIgaGFuZGxlcnMgPSBlbGVtZW50Ll9fcmVzaXplSGFuZGxlcnM7XG4gICAgICBoYW5kbGVycy5mb3JFYWNoKGZ1bmN0aW9uIChoYW5kbGVyKSB7XG4gICAgICAgIGhhbmRsZXIoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSwgMTAwKTtcbn07XG5cbnZhciBhZGRSZXNpemVJbnRlcnZhbEhhbmRsZXIgPSBmdW5jdGlvbiAoZWxlbWVudCwgZm4pIHtcbiAgaWYgKHJlc2l6ZUludGVydmFsVGltZXIgPT09IG51bGwpIHtcbiAgICByZXNpemVJbnRlcnZhbFRpbWVyID0gc2V0SW50ZXJ2YWwoY2hlY2tFbGVtZW50cywgMTAwKTtcbiAgfVxuICBpZiAoISgnX19yZXNpemVJZCcgaW4gZWxlbWVudCkpIHtcbiAgICBpZCsrO1xuICAgIGVsZW1lbnQuX19wcmV2Q2xpZW50V2lkdGggPSBlbGVtZW50LmNsaWVudFdpZHRoO1xuICAgIGVsZW1lbnQuX19wcmV2Q2xpZW50SGVpZ2h0ID0gZWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgZWxlbWVudC5fX3Jlc2l6ZUlkID0gaWQ7XG4gICAgcmVzaXplSW50ZXJ2YWxFbGVtZW50c0NvdW50Kys7XG4gICAgcmVzaXplSW50ZXJ2YWxFbGVtZW50c1tpZF0gPSBlbGVtZW50O1xuICAgIGVsZW1lbnQuX19yZXNpemVIYW5kbGVycyA9IFtdO1xuICB9XG4gIGVsZW1lbnQuX19yZXNpemVIYW5kbGVycy5wdXNoKGZuKTtcbn07XG5cbnZhciByZW1vdmVSZXNpemVJbnRlcnZhbEhhbmRsZXJzID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgaWYgKCEoJ19fcmVzaXplSWQnIGluIGVsZW1lbnQpKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciByZXNpemVJZCA9IGVsZW1lbnQuX19yZXNpemVJZDtcbiAgZGVsZXRlIGVsZW1lbnQuX19yZXNpemVJZDtcbiAgZGVsZXRlIGVsZW1lbnQuX19yZXNpemVIYW5kbGVycztcbiAgZGVsZXRlIHJlc2l6ZUludGVydmFsRWxlbWVudHNbcmVzaXplSWRdO1xuICByZXNpemVJbnRlcnZhbEVsZW1lbnRzQ291bnQtLTtcbiAgaWYgKHJlc2l6ZUludGVydmFsRWxlbWVudHNDb3VudCA8IDEpIHtcbiAgICBjbGVhckludGVydmFsKHJlc2l6ZUludGVydmFsVGltZXIpO1xuICAgIHJlc2l6ZUludGVydmFsVGltZXIgPSBudWxsO1xuICB9XG59O1xuXG52YXIgb25SZXNpemUgPSBmdW5jdGlvbiAocmVmLCBmbikge1xuICBmbihyZWYpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5vblJlc2l6ZVdpbmRvdykge1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMub25SZXNpemVXaW5kb3cpO1xuICAgIH1cbiAgICB0aGlzLnJlc2l6ZUVsZW1lbnRSZWZzID0ge307XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5vblJlc2l6ZVdpbmRvdykge1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMub25SZXNpemVXaW5kb3cpO1xuICAgIH1cbiAgICBPYmplY3Qua2V5cyh0aGlzLnJlc2l6ZUVsZW1lbnRSZWZzKS5mb3JFYWNoKGZ1bmN0aW9uIChyZWYpIHtcbiAgICAgIHJlbW92ZVJlc2l6ZUludGVydmFsSGFuZGxlcnModGhpcy5yZWZzW3JlZl0uZ2V0RE9NTm9kZSgpKTtcbiAgICB9LmJpbmQodGhpcykpO1xuICB9LFxuXG4gIHNldE9uUmVzaXplOiBmdW5jdGlvbiAocmVmLCBmbikge1xuICAgIGlmICghdGhpcy5yZXNpemVFbGVtZW50UmVmc1tyZWZdKSB7XG4gICAgICB0aGlzLnJlc2l6ZUVsZW1lbnRSZWZzW3JlZl0gPSB0cnVlO1xuICAgIH1cbiAgICBhZGRSZXNpemVJbnRlcnZhbEhhbmRsZXIodGhpcy5yZWZzW3JlZl0uZ2V0RE9NTm9kZSgpLCBvblJlc2l6ZS5iaW5kKHRoaXMsIHJlZiwgZm4pKTtcbiAgfVxufTtcbiIsIi8vICMgc2Nyb2xsIG1peGluXG5cbi8qXG5DdXJyZW50bHkgdW51c2VkLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IHtcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5vblNjcm9sbFdpbmRvdykge1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdGhpcy5vblNjcm9sbFdpbmRvdyk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5vblNjcm9sbFdpbmRvdykge1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdGhpcy5vblNjcm9sbFdpbmRvdyk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufTtcbiIsIi8vICMgdW5kby1zdGFjayBtaXhpblxuXG4vKlxuR2l2ZXMgeW91ciBjb21wb25lbnQgYW4gdW5kbyBzdGFjay5cbiovXG5cbi8vIGh0dHA6Ly9wcm9tZXRoZXVzcmVzZWFyY2guZ2l0aHViLmlvL3JlYWN0LWZvcm1zL2V4YW1wbGVzL3VuZG8uaHRtbFxuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7dW5kbzogW10sIHJlZG86IFtdfTtcbiAgfSxcblxuICBzbmFwc2hvdDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHVuZG8gPSB0aGlzLnN0YXRlLnVuZG8uY29uY2F0KHRoaXMuZ2V0U3RhdGVTbmFwc2hvdCgpKTtcbiAgICBpZiAodHlwZW9mIHRoaXMuc3RhdGUudW5kb0RlcHRoID09PSAnbnVtYmVyJykge1xuICAgICAgaWYgKHVuZG8ubGVuZ3RoID4gdGhpcy5zdGF0ZS51bmRvRGVwdGgpIHtcbiAgICAgICAgdW5kby5zaGlmdCgpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnNldFN0YXRlKHt1bmRvOiB1bmRvLCByZWRvOiBbXX0pO1xuICB9LFxuXG4gIGhhc1VuZG86IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnVuZG8ubGVuZ3RoID4gMDtcbiAgfSxcblxuICBoYXNSZWRvOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5yZWRvLmxlbmd0aCA+IDA7XG4gIH0sXG5cbiAgcmVkbzogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fdW5kb0ltcGwodHJ1ZSk7XG4gIH0sXG5cbiAgdW5kbzogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fdW5kb0ltcGwoKTtcbiAgfSxcblxuICBfdW5kb0ltcGw6IGZ1bmN0aW9uKGlzUmVkbykge1xuICAgIHZhciB1bmRvID0gdGhpcy5zdGF0ZS51bmRvLnNsaWNlKDApO1xuICAgIHZhciByZWRvID0gdGhpcy5zdGF0ZS5yZWRvLnNsaWNlKDApO1xuICAgIHZhciBzbmFwc2hvdDtcblxuICAgIGlmIChpc1JlZG8pIHtcbiAgICAgIGlmIChyZWRvLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBzbmFwc2hvdCA9IHJlZG8ucG9wKCk7XG4gICAgICB1bmRvLnB1c2godGhpcy5nZXRTdGF0ZVNuYXBzaG90KCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodW5kby5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgc25hcHNob3QgPSB1bmRvLnBvcCgpO1xuICAgICAgcmVkby5wdXNoKHRoaXMuZ2V0U3RhdGVTbmFwc2hvdCgpKTtcbiAgICB9XG5cbiAgICB0aGlzLnNldFN0YXRlU25hcHNob3Qoc25hcHNob3QpO1xuICAgIHRoaXMuc2V0U3RhdGUoe3VuZG86IHVuZG8sIHJlZG86IHJlZG99KTtcbiAgfVxufTtcbiIsIi8vICMgYm9vdHN0cmFwIHBsdWdpblxuXG4vKlxuVGhlIGJvb3RzdHJhcCBwbHVnaW4gc25lYWtzIGluIHNvbWUgY2xhc3NlcyB0byBlbGVtZW50cyBzbyB0aGF0IGl0IHBsYXlzIHdlbGxcbndpdGggVHdpdHRlciBCb290c3RyYXAuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gcmVxdWlyZSgnLi4vdW5kYXNoJyk7XG5cbi8vIERlY2xhcmUgc29tZSBjbGFzc2VzIGFuZCBsYWJlbHMgZm9yIGVhY2ggZWxlbWVudC5cbnZhciBtb2RpZmllcnMgPSB7XG5cbiAgJ0ZpZWxkJzoge2NsYXNzZXM6IHsnZm9ybS1ncm91cCc6IHRydWV9fSxcbiAgJ0hlbHAnOiB7Y2xhc3NlczogeydoZWxwLWJsb2NrJzogdHJ1ZX19LFxuICAnU2FtcGxlJzoge2NsYXNzZXM6IHsnaGVscC1ibG9jayc6IHRydWV9fSxcbiAgJ0FycmF5Q29udHJvbCc6IHtjbGFzc2VzOiB7J2Zvcm0taW5saW5lJzogdHJ1ZX19LFxuICAnQXJyYXlJdGVtJzoge2NsYXNzZXM6IHsnd2VsbCc6IHRydWV9fSxcbiAgJ09iamVjdEl0ZW0nOiB7Y2xhc3Nlczogeyd3ZWxsJzogdHJ1ZX19LFxuICAnRmllbGRUZW1wbGF0ZUNob2ljZXMnOiB7Y2xhc3Nlczogeydmb3JtLWNvbnRyb2wnOiB0cnVlfX0sXG4gICdBZGRJdGVtJzoge2NsYXNzZXM6IHsnZ2x5cGhpY29uIGdseXBoaWNvbi1wbHVzJzogdHJ1ZX0sIGxhYmVsOiAnJ30sXG4gICdSZW1vdmVJdGVtJzoge2NsYXNzZXM6IHsnZ2x5cGhpY29uIGdseXBoaWNvbi1yZW1vdmUnOiB0cnVlfSwgbGFiZWw6ICcnfSxcbiAgJ01vdmVJdGVtQmFjayc6IHtjbGFzc2VzOiB7J2dseXBoaWNvbiBnbHlwaGljb24tYXJyb3ctdXAnOiB0cnVlfSwgbGFiZWw6ICcnfSxcbiAgJ01vdmVJdGVtRm9yd2FyZCc6IHtjbGFzc2VzOiB7J2dseXBoaWNvbiBnbHlwaGljb24tYXJyb3ctZG93bic6IHRydWV9LCBsYWJlbDogJyd9LFxuICAnT2JqZWN0SXRlbUtleSc6IHtjbGFzc2VzOiB7J2Zvcm0tY29udHJvbCc6IHRydWV9fSxcblxuICAnU2luZ2xlTGluZVN0cmluZyc6IHtjbGFzc2VzOiB7J2Zvcm0tY29udHJvbCc6IHRydWV9fSxcbiAgJ1N0cmluZyc6IHtjbGFzc2VzOiB7J2Zvcm0tY29udHJvbCc6IHRydWV9fSxcbiAgJ1ByZXR0eVRleHQnOiB7Y2xhc3Nlczogeydmb3JtLWNvbnRyb2wnOiB0cnVlfX0sXG4gICdKc29uJzoge2NsYXNzZXM6IHsnZm9ybS1jb250cm9sJzogdHJ1ZX19LFxuICAnU2VsZWN0VmFsdWUnOiB7Y2xhc3Nlczogeydmb3JtLWNvbnRyb2wnOiB0cnVlfX1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNvbmZpZykge1xuXG4gIHZhciBjcmVhdGVFbGVtZW50ID0gY29uZmlnLmNyZWF0ZUVsZW1lbnQ7XG5cbiAgcmV0dXJuIHtcbiAgICBjcmVhdGVFbGVtZW50OiBmdW5jdGlvbiAobmFtZSwgcHJvcHMsIGNoaWxkcmVuKSB7XG5cbiAgICAgIG5hbWUgPSBjb25maWcuZWxlbWVudE5hbWUobmFtZSk7XG5cbiAgICAgIHZhciBtb2RpZmllciA9IG1vZGlmaWVyc1tuYW1lXTtcblxuICAgICAgaWYgKG1vZGlmaWVyKSB7XG4gICAgICAgIC8vIElmIHRoZXJlIGlzIGEgbW9kaWZpZXIgZm9yIHRoaXMgZWxlbWVudCwgYWRkIHRoZSBjbGFzc2VzIGFuZCBsYWJlbC5cbiAgICAgICAgcHJvcHMgPSBfLmV4dGVuZCh7fSwgcHJvcHMpO1xuICAgICAgICBwcm9wcy5jbGFzc2VzID0gXy5leHRlbmQoe30sIHByb3BzLmNsYXNzZXMsIG1vZGlmaWVyLmNsYXNzZXMpO1xuICAgICAgICBpZiAoJ2xhYmVsJyBpbiBtb2RpZmllcikge1xuICAgICAgICAgIHByb3BzLmxhYmVsID0gbW9kaWZpZXIubGFiZWw7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNyZWF0ZUVsZW1lbnQobmFtZSwgcHJvcHMsIGNoaWxkcmVuKTtcbiAgICB9XG4gIH07XG59O1xuIiwiLy8gIyBlbGVtZW50LWNsYXNzZXMgcGx1Z2luXG5cbi8qXG5UaGlzIHBsdWdpbnMgcHJvdmlkZXMgYSBjb25maWcgbWV0aG9kIGFkZEVsZW1lbnRDbGFzcyB0aGF0IGxldHMgeW91IGFkZCBvbiBhXG5jbGFzcyB0byBhbiBlbGVtZW50LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4uL3VuZGFzaCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjb25maWcpIHtcblxuICB2YXIgY3JlYXRlRWxlbWVudCA9IGNvbmZpZy5jcmVhdGVFbGVtZW50O1xuXG4gIHZhciBlbGVtZW50Q2xhc3NlcyA9IHt9O1xuXG4gIHJldHVybiB7XG4gICAgYWRkRWxlbWVudENsYXNzOiBmdW5jdGlvbiAobmFtZSwgY2xhc3NOYW1lKSB7XG5cbiAgICAgIG5hbWUgPSBjb25maWcuZWxlbWVudE5hbWUobmFtZSk7XG5cbiAgICAgIGlmICghZWxlbWVudENsYXNzZXNbbmFtZV0pIHtcbiAgICAgICAgZWxlbWVudENsYXNzZXNbbmFtZV0gPSB7fTtcbiAgICAgIH1cblxuICAgICAgZWxlbWVudENsYXNzZXNbbmFtZV1bY2xhc3NOYW1lXSA9IHRydWU7XG4gICAgfSxcblxuICAgIC8vIFdyYXAgdGhlIGNyZWF0ZUVsZW1lbnQgbWV0aG9kLlxuICAgIGNyZWF0ZUVsZW1lbnQ6IGZ1bmN0aW9uIChuYW1lLCBwcm9wcywgY2hpbGRyZW4pIHtcblxuICAgICAgbmFtZSA9IGNvbmZpZy5lbGVtZW50TmFtZShuYW1lKTtcblxuICAgICAgaWYgKGVsZW1lbnRDbGFzc2VzW25hbWVdKSB7XG4gICAgICAgIHByb3BzID0gXy5leHRlbmQoe30sIHByb3BzLCB7Y2xhc3NlczogZWxlbWVudENsYXNzZXNbbmFtZV19KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNyZWF0ZUVsZW1lbnQobmFtZSwgcHJvcHMsIGNoaWxkcmVuKTtcbiAgICB9XG4gIH07XG59O1xuIiwiLy8gIyBtZXRhIHBsdWdpblxuXG4vKlxuVGhlIG1ldGEgcGx1Z2luIGxldHMgeW91IHBhc3MgaW4gYSBtZXRhIHByb3AgdG8gZm9ybWF0aWMuIFRoZSBwcm9wIHRoZW4gZ2V0c1xucGFzc2VkIHRocm91Z2ggYXMgYSBwcm9wZXJ0eSBmb3IgZXZlcnkgZmllbGQuIFlvdSBjYW4gdGhlbiB3cmFwIGBpbml0RmllbGRgIHRvXG5nZXQgeW91ciBtZXRhIHZhbHVlcy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgdmFyIGluaXRSb290RmllbGQgPSBjb25maWcuaW5pdFJvb3RGaWVsZDtcbiAgdmFyIGluaXRGaWVsZCA9IGNvbmZpZy5pbml0RmllbGQ7XG5cbiAgcmV0dXJuIHtcbiAgICBpbml0Um9vdEZpZWxkOiBmdW5jdGlvbiAoZmllbGQsIHByb3BzKSB7XG5cbiAgICAgIGZpZWxkLm1ldGEgPSBwcm9wcy5tZXRhIHx8IHt9O1xuXG4gICAgICBpbml0Um9vdEZpZWxkKGZpZWxkLCBwcm9wcyk7XG4gICAgfSxcblxuICAgIGluaXRGaWVsZDogZnVuY3Rpb24gKGZpZWxkKSB7XG5cbiAgICAgIGlmIChmaWVsZC5wYXJlbnQgJiYgZmllbGQucGFyZW50Lm1ldGEpIHtcbiAgICAgICAgZmllbGQubWV0YSA9IGZpZWxkLnBhcmVudC5tZXRhO1xuICAgICAgfVxuXG4gICAgICBpbml0RmllbGQoZmllbGQpO1xuICAgIH1cbiAgfTtcbn07XG4iLCIvLyAjIHJlZmVyZW5jZSBwbHVnaW5cblxuLypcblRoaXMgcGx1Z2luIGFsbG93cyBmaWVsZHMgdG8gYmUgc3RyaW5ncyBhbmQgcmVmZXJlbmNlIG90aGVyIGZpZWxkcyBieSBrZXkgb3JcbmlkLiBJdCBhbHNvIGFsbG93cyBhIGZpZWxkIHRvIGV4dGVuZCBhbm90aGVyIGZpZWxkIHdpdGhcbmV4dGVuZHM6IFsnZm9vJywgJ2JhciddIHdoZXJlICdmb28nIGFuZCAnYmFyJyByZWZlciB0byBvdGhlciBrZXlzIG9yIGlkcy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSByZXF1aXJlKCcuLi91bmRhc2gnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgdmFyIGluaXRGaWVsZCA9IGNvbmZpZy5pbml0RmllbGQ7XG5cbiAgcmV0dXJuIHtcbiAgICAvLyBMb29rIGZvciBhIHRlbXBsYXRlIGluIHRoaXMgZmllbGQgb3IgYW55IG9mIGl0cyBwYXJlbnRzLlxuICAgIGZpbmRGaWVsZFRlbXBsYXRlOiBmdW5jdGlvbiAoZmllbGQsIG5hbWUpIHtcblxuICAgICAgaWYgKGZpZWxkLnRlbXBsYXRlc1tuYW1lXSkge1xuICAgICAgICByZXR1cm4gZmllbGQudGVtcGxhdGVzW25hbWVdO1xuICAgICAgfVxuXG4gICAgICBpZiAoZmllbGQucGFyZW50KSB7XG4gICAgICAgIHJldHVybiBjb25maWcuZmluZEZpZWxkVGVtcGxhdGUoZmllbGQucGFyZW50LCBuYW1lKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcblxuICAgIC8vIEluaGVyaXQgZnJvbSBhbnkgZmllbGQgdGVtcGxhdGVzIHRoYXQgdGhpcyBmaWVsZCB0ZW1wbGF0ZVxuICAgIC8vIGV4dGVuZHMuXG4gICAgcmVzb2x2ZUZpZWxkVGVtcGxhdGU6IGZ1bmN0aW9uIChmaWVsZCwgZmllbGRUZW1wbGF0ZSkge1xuXG4gICAgICBpZiAoIWZpZWxkVGVtcGxhdGUuZXh0ZW5kcykge1xuICAgICAgICByZXR1cm4gZmllbGRUZW1wbGF0ZTtcbiAgICAgIH1cblxuICAgICAgdmFyIGV4dCA9IGZpZWxkVGVtcGxhdGUuZXh0ZW5kcztcblxuICAgICAgaWYgKCFfLmlzQXJyYXkoZXh0KSkge1xuICAgICAgICBleHQgPSBbZXh0XTtcbiAgICAgIH1cblxuICAgICAgdmFyIGJhc2VzID0gZXh0Lm1hcChmdW5jdGlvbiAoYmFzZSkge1xuICAgICAgICB2YXIgdGVtcGxhdGUgPSBjb25maWcuZmluZEZpZWxkVGVtcGxhdGUoZmllbGQsIGJhc2UpO1xuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUZW1wbGF0ZSAnICsgYmFzZSArICcgbm90IGZvdW5kLicpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgY2hhaW4gPSBbe31dLmNvbmNhdChiYXNlcy5yZXZlcnNlKCkuY29uY2F0KFtmaWVsZFRlbXBsYXRlXSkpO1xuICAgICAgZmllbGRUZW1wbGF0ZSA9IF8uZXh0ZW5kLmFwcGx5KF8sIGNoYWluKTtcblxuICAgICAgcmV0dXJuIGZpZWxkVGVtcGxhdGU7XG4gICAgfSxcblxuICAgIC8vIFdyYXAgdGhlIGluaXRGaWVsZCBtZXRob2QuXG4gICAgaW5pdEZpZWxkOiBmdW5jdGlvbiAoZmllbGQpIHtcblxuICAgICAgdmFyIHRlbXBsYXRlcyA9IGZpZWxkLnRlbXBsYXRlcyA9IHt9O1xuXG4gICAgICB2YXIgY2hpbGRGaWVsZFRlbXBsYXRlcyA9IGNvbmZpZy5maWVsZENoaWxkRmllbGRUZW1wbGF0ZXMoZmllbGQpO1xuXG4gICAgICAvLyBBZGQgZWFjaCBvZiB0aGUgY2hpbGQgZmllbGQgdGVtcGxhdGVzIHRvIG91ciB0ZW1wbGF0ZSBtYXAuXG4gICAgICBjaGlsZEZpZWxkVGVtcGxhdGVzLmZvckVhY2goZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcblxuICAgICAgICBpZiAoXy5pc1N0cmluZyhmaWVsZFRlbXBsYXRlKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBrZXkgPSBmaWVsZFRlbXBsYXRlLmtleTtcbiAgICAgICAgdmFyIGlkID0gZmllbGRUZW1wbGF0ZS5pZDtcblxuICAgICAgICBpZiAoZmllbGRUZW1wbGF0ZS50ZW1wbGF0ZSkge1xuICAgICAgICAgIGZpZWxkVGVtcGxhdGUgPSBfLmV4dGVuZCh7fSwgZmllbGRUZW1wbGF0ZSwge3RlbXBsYXRlOiBmYWxzZX0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKGtleSkgJiYga2V5ICE9PSAnJykge1xuICAgICAgICAgIHRlbXBsYXRlc1trZXldID0gZmllbGRUZW1wbGF0ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghXy5pc1VuZGVmaW5lZChpZCkgJiYgaWQgIT09ICcnKSB7XG4gICAgICAgICAgdGVtcGxhdGVzW2lkXSA9IGZpZWxkVGVtcGxhdGU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBSZXNvbHZlIGFueSByZWZlcmVuY2VzIHRvIG90aGVyIGZpZWxkIHRlbXBsYXRlcy5cbiAgICAgIGlmIChjaGlsZEZpZWxkVGVtcGxhdGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgZmllbGQuZmllbGRzID0gY2hpbGRGaWVsZFRlbXBsYXRlcy5tYXAoZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcbiAgICAgICAgICBpZiAoXy5pc1N0cmluZyhmaWVsZFRlbXBsYXRlKSkge1xuICAgICAgICAgICAgZmllbGRUZW1wbGF0ZSA9IGNvbmZpZy5maW5kRmllbGRUZW1wbGF0ZShmaWVsZCwgZmllbGRUZW1wbGF0ZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIGNvbmZpZy5yZXNvbHZlRmllbGRUZW1wbGF0ZShmaWVsZCwgZmllbGRUZW1wbGF0ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZpZWxkLmZpZWxkcyA9IGZpZWxkLmZpZWxkcy5maWx0ZXIoZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcbiAgICAgICAgICByZXR1cm4gIWZpZWxkVGVtcGxhdGUudGVtcGxhdGU7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICB2YXIgaXRlbUZpZWxkVGVtcGxhdGVzID0gY29uZmlnLmZpZWxkSXRlbUZpZWxkVGVtcGxhdGVzKGZpZWxkKTtcblxuICAgICAgLy8gUmVzb2x2ZSBhbnkgb2Ygb3VyIGl0ZW0gZmllbGQgdGVtcGxhdGVzLiAoRmllbGQgdGVtcGxhdGVzIGZvciBkeW5hbWljXG4gICAgICAvLyBjaGlsZCBmaWVsZHMuKVxuICAgICAgaWYgKGl0ZW1GaWVsZFRlbXBsYXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGZpZWxkLml0ZW1GaWVsZHMgPSBpdGVtRmllbGRUZW1wbGF0ZXMubWFwKGZ1bmN0aW9uIChpdGVtRmllbGRUZW1wbGF0ZSkge1xuICAgICAgICAgIGlmIChfLmlzU3RyaW5nKGl0ZW1GaWVsZFRlbXBsYXRlKSkge1xuICAgICAgICAgICAgaXRlbUZpZWxkVGVtcGxhdGUgPSBjb25maWcuZmluZEZpZWxkVGVtcGxhdGUoZmllbGQsIGl0ZW1GaWVsZFRlbXBsYXRlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gY29uZmlnLnJlc29sdmVGaWVsZFRlbXBsYXRlKGZpZWxkLCBpdGVtRmllbGRUZW1wbGF0ZSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpbml0RmllbGQoZmllbGQpO1xuICAgIH1cbiAgfTtcblxufTtcbiIsInZhciBfID0ge307XG5cbl8uYXNzaWduID0gXy5leHRlbmQgPSByZXF1aXJlKCdvYmplY3QtYXNzaWduJyk7XG5fLmlzRXF1YWwgPSByZXF1aXJlKCdkZWVwLWVxdWFsJyk7XG5cbi8vIFRoZXNlIGFyZSBub3QgbmVjZXNzYXJpbHkgY29tcGxldGUgaW1wbGVtZW50YXRpb25zLiBUaGV5J3JlIGp1c3QgZW5vdWdoIGZvclxuLy8gd2hhdCdzIHVzZWQgaW4gZm9ybWF0aWMuXG5cbl8uZmxhdHRlbiA9IChhcnJheXMpID0+IFtdLmNvbmNhdC5hcHBseShbXSwgYXJyYXlzKTtcblxuXy5pc1N0cmluZyA9IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZyc7XG5fLmlzVW5kZWZpbmVkID0gdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJztcbl8uaXNPYmplY3QgPSB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnO1xuXy5pc0FycmF5ID0gdmFsdWUgPT4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbl8uaXNOdW1iZXIgPSB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInO1xuXy5pc0Jvb2xlYW4gPSB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJztcbl8uaXNOdWxsID0gdmFsdWUgPT4gdmFsdWUgPT09IG51bGw7XG5fLmlzRnVuY3Rpb24gPSB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbic7XG5cbl8uY2xvbmUgPSB2YWx1ZSA9PiB7XG4gIGlmICghXy5pc09iamVjdCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIF8uaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZS5zbGljZSgpIDogXy5hc3NpZ24oe30sIHZhbHVlKTtcbn07XG5cbl8uZmluZCA9IChpdGVtcywgdGVzdEZuKSA9PiB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAodGVzdEZuKGl0ZW1zW2ldKSkge1xuICAgICAgcmV0dXJuIGl0ZW1zW2ldO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdm9pZCAwO1xufTtcblxuXy5ldmVyeSA9IChpdGVtcywgdGVzdEZuKSA9PiB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoIXRlc3RGbihpdGVtc1tpXSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5fLmVhY2ggPSAob2JqLCBpdGVyYXRlRm4pID0+IHtcbiAgT2JqZWN0LmtleXMob2JqKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgaXRlcmF0ZUZuKG9ialtrZXldLCBrZXkpO1xuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gXztcbiIsIi8vICMgdXRpbHNcblxuLypcbkp1c3Qgc29tZSBzaGFyZWQgdXRpbGl0eSBmdW5jdGlvbnMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gcmVxdWlyZSgnLi91bmRhc2gnKTtcblxudmFyIHV0aWxzID0gZXhwb3J0cztcblxuLy8gQ29weSBvYmogcmVjdXJzaW5nIGRlZXBseS5cbnV0aWxzLmRlZXBDb3B5ID0gZnVuY3Rpb24gKG9iaikge1xuICBpZiAoXy5pc0FycmF5KG9iaikpIHtcbiAgICByZXR1cm4gb2JqLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgcmV0dXJuIHV0aWxzLmRlZXBDb3B5KGl0ZW0pO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKF8uaXNGdW5jdGlvbihvYmopKSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfSBlbHNlIGlmIChfLmlzTnVsbChvYmopKSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfSBlbHNlIGlmIChfLmlzT2JqZWN0KG9iaikpIHtcbiAgICB2YXIgY29weSA9IHt9O1xuICAgIF8uZWFjaChvYmosIGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICBjb3B5W2tleV0gPSB1dGlscy5kZWVwQ29weSh2YWx1ZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGNvcHk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfVxufTtcblxuLy8gQ2FjaGUgZm9yIHN0cmluZ3MgY29udmVydGVkIHRvIFBhc2NhbCBDYXNlLiBUaGlzIHNob3VsZCBiZSBhIGZpbml0ZSBsaXN0LCBzb1xuLy8gbm90IG11Y2ggZmVhciB0aGF0IHdlIHdpbGwgcnVuIG91dCBvZiBtZW1vcnkuXG52YXIgZGFzaFRvUGFzY2FsQ2FjaGUgPSB7fTtcblxuLy8gQ29udmVydCBmb28tYmFyIHRvIEZvb0Jhci5cbnV0aWxzLmRhc2hUb1Bhc2NhbCA9IGZ1bmN0aW9uIChzKSB7XG4gIGlmIChzID09PSAnJykge1xuICAgIHJldHVybiAnJztcbiAgfVxuICBpZiAoIWRhc2hUb1Bhc2NhbENhY2hlW3NdKSB7XG4gICAgZGFzaFRvUGFzY2FsQ2FjaGVbc10gPSBzLnNwbGl0KCctJykubWFwKGZ1bmN0aW9uIChwYXJ0KSB7XG4gICAgICByZXR1cm4gcGFydFswXS50b1VwcGVyQ2FzZSgpICsgcGFydC5zdWJzdHJpbmcoMSk7XG4gICAgfSkuam9pbignJyk7XG4gIH1cbiAgcmV0dXJuIGRhc2hUb1Bhc2NhbENhY2hlW3NdO1xufTtcblxuLy8gQ29weSBhbGwgY29tcHV0ZWQgc3R5bGVzIGZyb20gb25lIERPTSBlbGVtZW50IHRvIGFub3RoZXIuXG51dGlscy5jb3B5RWxlbWVudFN0eWxlID0gZnVuY3Rpb24gKGZyb21FbGVtZW50LCB0b0VsZW1lbnQpIHtcbiAgdmFyIGZyb21TdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGZyb21FbGVtZW50LCAnJyk7XG5cbiAgaWYgKGZyb21TdHlsZS5jc3NUZXh0ICE9PSAnJykge1xuICAgIHRvRWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gZnJvbVN0eWxlLmNzc1RleHQ7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGNzc1J1bGVzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZnJvbVN0eWxlLmxlbmd0aDsgaSsrKSB7XG4gICAgY3NzUnVsZXMucHVzaChmcm9tU3R5bGVbaV0gKyAnOicgKyBmcm9tU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShmcm9tU3R5bGVbaV0pICsgJzsnKTtcbiAgfVxuICB2YXIgY3NzVGV4dCA9IGNzc1J1bGVzLmpvaW4oJycpO1xuXG4gIHRvRWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gY3NzVGV4dDtcbn07XG5cbi8vIE9iamVjdCB0byBob2xkIGJyb3dzZXIgc25pZmZpbmcgaW5mby5cbnZhciBicm93c2VyID0ge1xuICBpc0Nocm9tZTogZmFsc2UsXG4gIGlzTW96aWxsYTogZmFsc2UsXG4gIGlzT3BlcmE6IGZhbHNlLFxuICBpc0llOiBmYWxzZSxcbiAgaXNTYWZhcmk6IGZhbHNlLFxuICBpc1Vua25vd246IGZhbHNlXG59O1xuXG4vLyBTbmlmZiB0aGUgYnJvd3Nlci5cbnZhciB1YSA9ICcnO1xuXG5pZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgdWEgPSBuYXZpZ2F0b3IudXNlckFnZW50O1xufVxuXG5pZih1YS5pbmRleE9mKCdDaHJvbWUnKSA+IC0xKSB7XG4gIGJyb3dzZXIuaXNDaHJvbWUgPSB0cnVlO1xufSBlbHNlIGlmICh1YS5pbmRleE9mKCdTYWZhcmknKSA+IC0xKSB7XG4gIGJyb3dzZXIuaXNTYWZhcmkgPSB0cnVlO1xufSBlbHNlIGlmICh1YS5pbmRleE9mKCdPcGVyYScpID4gLTEpIHtcbiAgYnJvd3Nlci5pc09wZXJhID0gdHJ1ZTtcbn0gZWxzZSBpZiAodWEuaW5kZXhPZignRmlyZWZveCcpID4gLTEpIHtcbiAgYnJvd3Nlci5pc01vemlsbGEgPSB0cnVlO1xufSBlbHNlIGlmICh1YS5pbmRleE9mKCdNU0lFJykgPiAtMSkge1xuICBicm93c2VyLmlzSWUgPSB0cnVlO1xufSBlbHNlIHtcbiAgYnJvd3Nlci5pc1Vua25vd24gPSB0cnVlO1xufVxuXG4vLyBFeHBvcnQgc25pZmZlZCBicm93c2VyIGluZm8uXG51dGlscy5icm93c2VyID0gYnJvd3NlcjtcblxuLy8gQ3JlYXRlIGEgbWV0aG9kIHRoYXQgZGVsZWdhdGVzIHRvIGFub3RoZXIgbWV0aG9kIG9uIHRoZSBzYW1lIG9iamVjdC4gVGhlXG4vLyBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gdXNlcyB0aGlzIGZ1bmN0aW9uIHRvIGRlbGVnYXRlIG9uZSBtZXRob2QgdG8gYW5vdGhlci5cbnV0aWxzLmRlbGVnYXRlVG8gPSBmdW5jdGlvbiAobmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzW25hbWVdLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH07XG59O1xuXG51dGlscy5kZWxlZ2F0b3IgPSBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiBmdW5jdGlvbiAobmFtZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gb2JqW25hbWVdLmFwcGx5KG9iaiwgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9O1xufTtcblxudXRpbHMuY2FwaXRhbGl6ZSA9IGZ1bmN0aW9uKHMpIHtcbiAgcmV0dXJuIHMuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzLnN1YnN0cmluZygxKS50b0xvd2VyQ2FzZSgpO1xufTtcbiIsIi8qIVxuICBDb3B5cmlnaHQgKGMpIDIwMTUgSmVkIFdhdHNvbi5cbiAgTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlIChNSVQpLCBzZWVcbiAgaHR0cDovL2plZHdhdHNvbi5naXRodWIuaW8vY2xhc3NuYW1lc1xuKi9cblxuZnVuY3Rpb24gY2xhc3NOYW1lcyAoKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHR2YXIgY2xhc3NlcyA9ICcnO1xuXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIGFyZyA9IGFyZ3VtZW50c1tpXTtcblx0XHRpZiAoIWFyZykgY29udGludWU7XG5cblx0XHR2YXIgYXJnVHlwZSA9IHR5cGVvZiBhcmc7XG5cblx0XHRpZiAoJ3N0cmluZycgPT09IGFyZ1R5cGUgfHwgJ251bWJlcicgPT09IGFyZ1R5cGUpIHtcblx0XHRcdGNsYXNzZXMgKz0gJyAnICsgYXJnO1xuXG5cdFx0fSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGFyZykpIHtcblx0XHRcdGNsYXNzZXMgKz0gJyAnICsgY2xhc3NOYW1lcy5hcHBseShudWxsLCBhcmcpO1xuXG5cdFx0fSBlbHNlIGlmICgnb2JqZWN0JyA9PT0gYXJnVHlwZSkge1xuXHRcdFx0Zm9yICh2YXIga2V5IGluIGFyZykge1xuXHRcdFx0XHRpZiAoYXJnLmhhc093blByb3BlcnR5KGtleSkgJiYgYXJnW2tleV0pIHtcblx0XHRcdFx0XHRjbGFzc2VzICs9ICcgJyArIGtleTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBjbGFzc2VzLnN1YnN0cigxKTtcbn1cblxuLy8gc2FmZWx5IGV4cG9ydCBjbGFzc05hbWVzIGZvciBub2RlIC8gYnJvd3NlcmlmeVxuaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG5cdG1vZHVsZS5leHBvcnRzID0gY2xhc3NOYW1lcztcbn1cblxuLyogZ2xvYmFsIGRlZmluZSAqL1xuLy8gc2FmZWx5IGV4cG9ydCBjbGFzc05hbWVzIGZvciBSZXF1aXJlSlNcbmlmICh0eXBlb2YgZGVmaW5lICE9PSAndW5kZWZpbmVkJyAmJiBkZWZpbmUuYW1kKSB7XG5cdGRlZmluZSgnY2xhc3NuYW1lcycsIFtdLCBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gY2xhc3NOYW1lcztcblx0fSk7XG59XG4iLCJ2YXIgcFNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xudmFyIG9iamVjdEtleXMgPSByZXF1aXJlKCcuL2xpYi9rZXlzLmpzJyk7XG52YXIgaXNBcmd1bWVudHMgPSByZXF1aXJlKCcuL2xpYi9pc19hcmd1bWVudHMuanMnKTtcblxudmFyIGRlZXBFcXVhbCA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGFjdHVhbCwgZXhwZWN0ZWQsIG9wdHMpIHtcbiAgaWYgKCFvcHRzKSBvcHRzID0ge307XG4gIC8vIDcuMS4gQWxsIGlkZW50aWNhbCB2YWx1ZXMgYXJlIGVxdWl2YWxlbnQsIGFzIGRldGVybWluZWQgYnkgPT09LlxuICBpZiAoYWN0dWFsID09PSBleHBlY3RlZCkge1xuICAgIHJldHVybiB0cnVlO1xuXG4gIH0gZWxzZSBpZiAoYWN0dWFsIGluc3RhbmNlb2YgRGF0ZSAmJiBleHBlY3RlZCBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICByZXR1cm4gYWN0dWFsLmdldFRpbWUoKSA9PT0gZXhwZWN0ZWQuZ2V0VGltZSgpO1xuXG4gIC8vIDcuMy4gT3RoZXIgcGFpcnMgdGhhdCBkbyBub3QgYm90aCBwYXNzIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0JyxcbiAgLy8gZXF1aXZhbGVuY2UgaXMgZGV0ZXJtaW5lZCBieSA9PS5cbiAgfSBlbHNlIGlmICh0eXBlb2YgYWN0dWFsICE9ICdvYmplY3QnICYmIHR5cGVvZiBleHBlY3RlZCAhPSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBvcHRzLnN0cmljdCA/IGFjdHVhbCA9PT0gZXhwZWN0ZWQgOiBhY3R1YWwgPT0gZXhwZWN0ZWQ7XG5cbiAgLy8gNy40LiBGb3IgYWxsIG90aGVyIE9iamVjdCBwYWlycywgaW5jbHVkaW5nIEFycmF5IG9iamVjdHMsIGVxdWl2YWxlbmNlIGlzXG4gIC8vIGRldGVybWluZWQgYnkgaGF2aW5nIHRoZSBzYW1lIG51bWJlciBvZiBvd25lZCBwcm9wZXJ0aWVzIChhcyB2ZXJpZmllZFxuICAvLyB3aXRoIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCksIHRoZSBzYW1lIHNldCBvZiBrZXlzXG4gIC8vIChhbHRob3VnaCBub3QgbmVjZXNzYXJpbHkgdGhlIHNhbWUgb3JkZXIpLCBlcXVpdmFsZW50IHZhbHVlcyBmb3IgZXZlcnlcbiAgLy8gY29ycmVzcG9uZGluZyBrZXksIGFuZCBhbiBpZGVudGljYWwgJ3Byb3RvdHlwZScgcHJvcGVydHkuIE5vdGU6IHRoaXNcbiAgLy8gYWNjb3VudHMgZm9yIGJvdGggbmFtZWQgYW5kIGluZGV4ZWQgcHJvcGVydGllcyBvbiBBcnJheXMuXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG9iakVxdWl2KGFjdHVhbCwgZXhwZWN0ZWQsIG9wdHMpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkT3JOdWxsKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBpc0J1ZmZlciAoeCkge1xuICBpZiAoIXggfHwgdHlwZW9mIHggIT09ICdvYmplY3QnIHx8IHR5cGVvZiB4Lmxlbmd0aCAhPT0gJ251bWJlcicpIHJldHVybiBmYWxzZTtcbiAgaWYgKHR5cGVvZiB4LmNvcHkgIT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIHguc2xpY2UgIT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKHgubGVuZ3RoID4gMCAmJiB0eXBlb2YgeFswXSAhPT0gJ251bWJlcicpIHJldHVybiBmYWxzZTtcbiAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIG9iakVxdWl2KGEsIGIsIG9wdHMpIHtcbiAgdmFyIGksIGtleTtcbiAgaWYgKGlzVW5kZWZpbmVkT3JOdWxsKGEpIHx8IGlzVW5kZWZpbmVkT3JOdWxsKGIpKVxuICAgIHJldHVybiBmYWxzZTtcbiAgLy8gYW4gaWRlbnRpY2FsICdwcm90b3R5cGUnIHByb3BlcnR5LlxuICBpZiAoYS5wcm90b3R5cGUgIT09IGIucHJvdG90eXBlKSByZXR1cm4gZmFsc2U7XG4gIC8vfn5+SSd2ZSBtYW5hZ2VkIHRvIGJyZWFrIE9iamVjdC5rZXlzIHRocm91Z2ggc2NyZXd5IGFyZ3VtZW50cyBwYXNzaW5nLlxuICAvLyAgIENvbnZlcnRpbmcgdG8gYXJyYXkgc29sdmVzIHRoZSBwcm9ibGVtLlxuICBpZiAoaXNBcmd1bWVudHMoYSkpIHtcbiAgICBpZiAoIWlzQXJndW1lbnRzKGIpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGEgPSBwU2xpY2UuY2FsbChhKTtcbiAgICBiID0gcFNsaWNlLmNhbGwoYik7XG4gICAgcmV0dXJuIGRlZXBFcXVhbChhLCBiLCBvcHRzKTtcbiAgfVxuICBpZiAoaXNCdWZmZXIoYSkpIHtcbiAgICBpZiAoIWlzQnVmZmVyKGIpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmIChhLmxlbmd0aCAhPT0gYi5sZW5ndGgpIHJldHVybiBmYWxzZTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgYS5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGFbaV0gIT09IGJbaV0pIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgdHJ5IHtcbiAgICB2YXIga2EgPSBvYmplY3RLZXlzKGEpLFxuICAgICAgICBrYiA9IG9iamVjdEtleXMoYik7XG4gIH0gY2F0Y2ggKGUpIHsvL2hhcHBlbnMgd2hlbiBvbmUgaXMgYSBzdHJpbmcgbGl0ZXJhbCBhbmQgdGhlIG90aGVyIGlzbid0XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vIGhhdmluZyB0aGUgc2FtZSBudW1iZXIgb2Ygb3duZWQgcHJvcGVydGllcyAoa2V5cyBpbmNvcnBvcmF0ZXNcbiAgLy8gaGFzT3duUHJvcGVydHkpXG4gIGlmIChrYS5sZW5ndGggIT0ga2IubGVuZ3RoKVxuICAgIHJldHVybiBmYWxzZTtcbiAgLy90aGUgc2FtZSBzZXQgb2Yga2V5cyAoYWx0aG91Z2ggbm90IG5lY2Vzc2FyaWx5IHRoZSBzYW1lIG9yZGVyKSxcbiAga2Euc29ydCgpO1xuICBrYi5zb3J0KCk7XG4gIC8vfn5+Y2hlYXAga2V5IHRlc3RcbiAgZm9yIChpID0ga2EubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBpZiAoa2FbaV0gIT0ga2JbaV0pXG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy9lcXVpdmFsZW50IHZhbHVlcyBmb3IgZXZlcnkgY29ycmVzcG9uZGluZyBrZXksIGFuZFxuICAvL35+fnBvc3NpYmx5IGV4cGVuc2l2ZSBkZWVwIHRlc3RcbiAgZm9yIChpID0ga2EubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBrZXkgPSBrYVtpXTtcbiAgICBpZiAoIWRlZXBFcXVhbChhW2tleV0sIGJba2V5XSwgb3B0cykpIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHlwZW9mIGEgPT09IHR5cGVvZiBiO1xufVxuIiwidmFyIHN1cHBvcnRzQXJndW1lbnRzQ2xhc3MgPSAoZnVuY3Rpb24oKXtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhcmd1bWVudHMpXG59KSgpID09ICdbb2JqZWN0IEFyZ3VtZW50c10nO1xuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBzdXBwb3J0c0FyZ3VtZW50c0NsYXNzID8gc3VwcG9ydGVkIDogdW5zdXBwb3J0ZWQ7XG5cbmV4cG9ydHMuc3VwcG9ydGVkID0gc3VwcG9ydGVkO1xuZnVuY3Rpb24gc3VwcG9ydGVkKG9iamVjdCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iamVjdCkgPT0gJ1tvYmplY3QgQXJndW1lbnRzXSc7XG59O1xuXG5leHBvcnRzLnVuc3VwcG9ydGVkID0gdW5zdXBwb3J0ZWQ7XG5mdW5jdGlvbiB1bnN1cHBvcnRlZChvYmplY3Qpe1xuICByZXR1cm4gb2JqZWN0ICYmXG4gICAgdHlwZW9mIG9iamVjdCA9PSAnb2JqZWN0JyAmJlxuICAgIHR5cGVvZiBvYmplY3QubGVuZ3RoID09ICdudW1iZXInICYmXG4gICAgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgJ2NhbGxlZScpICYmXG4gICAgIU9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChvYmplY3QsICdjYWxsZWUnKSB8fFxuICAgIGZhbHNlO1xufTtcbiIsImV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHR5cGVvZiBPYmplY3Qua2V5cyA9PT0gJ2Z1bmN0aW9uJ1xuICA/IE9iamVjdC5rZXlzIDogc2hpbTtcblxuZXhwb3J0cy5zaGltID0gc2hpbTtcbmZ1bmN0aW9uIHNoaW0gKG9iaikge1xuICB2YXIga2V5cyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSBrZXlzLnB1c2goa2V5KTtcbiAgcmV0dXJuIGtleXM7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIFRvT2JqZWN0KHZhbCkge1xuXHRpZiAodmFsID09IG51bGwpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdPYmplY3QuYXNzaWduIGNhbm5vdCBiZSBjYWxsZWQgd2l0aCBudWxsIG9yIHVuZGVmaW5lZCcpO1xuXHR9XG5cblx0cmV0dXJuIE9iamVjdCh2YWwpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCwgc291cmNlKSB7XG5cdHZhciBmcm9tO1xuXHR2YXIga2V5cztcblx0dmFyIHRvID0gVG9PYmplY3QodGFyZ2V0KTtcblxuXHRmb3IgKHZhciBzID0gMTsgcyA8IGFyZ3VtZW50cy5sZW5ndGg7IHMrKykge1xuXHRcdGZyb20gPSBhcmd1bWVudHNbc107XG5cdFx0a2V5cyA9IE9iamVjdC5rZXlzKE9iamVjdChmcm9tKSk7XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHRvW2tleXNbaV1dID0gZnJvbVtrZXlzW2ldXTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gdG87XG59O1xuIl19
