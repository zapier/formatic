!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Formatic=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

// # index

// Export the Formatic React class at the top level.
module.exports = require("./lib/formatic");

},{"./lib/formatic":43}],2:[function(require,module,exports){
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

},{"../../mixins/field":45,"classnames":56}],3:[function(require,module,exports){
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

},{"../../mixins/field":45}],4:[function(require,module,exports){
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

},{"../../mixins/field":45,"../../undash":54,"classnames":56}],5:[function(require,module,exports){
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

},{"../../mixins/field":45,"classnames":56}],6:[function(require,module,exports){
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

},{"../../mixins/field":45,"classnames":56}],7:[function(require,module,exports){
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

},{"../../mixins/field":45,"../../undash":54,"classnames":56}],8:[function(require,module,exports){
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

},{"../../mixins/field":45,"classnames":56}],9:[function(require,module,exports){
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

},{"../../mixins/field":45,"../../undash":54,"classnames":56}],10:[function(require,module,exports){
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

},{"../../mixins/field":45}],11:[function(require,module,exports){
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
      config: config, field: field, plain: this.props.plain
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

},{"../../mixins/field":45}],12:[function(require,module,exports){
(function (global){
"use strict";

/* global CodeMirror */
/*eslint no-script-url:0 */

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var TagTranslator = require("../helpers/tag-translator");
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

   IMPLEMENTATION NOTE:

   To display the tags inside CodeMirror we are using CM's
   specialCharPlaceholder feature, to replace special characters with
   custom DOM nodes. This feature is designed for single character
   replacements, not tags like 'firstName'.  So we replace each tag
   with an unused character from the Unicode private use area, and
   tell CM to replace that with a DOM node display the tag label with
   the pill box effect.

   Is this evil? Perhaps a little, but delete, undo, redo, cut, copy
   and paste of the tag pill boxes just work because CM treats them as
   atomic single characters, and it's not much code on our part.
 */
module.exports = React.createClass({
  displayName: "PrettyText",

  mixins: [require("../../mixins/field")],

  componentDidMount: function componentDidMount() {
    this.createEditor();
  },

  componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
    if (prevState.codeMirrorMode !== this.state.codeMirrorMode) {
      // Changed from code mirror mode to read only mode or vice versa,
      // so setup the other editor.
      this.createEditor();
    }

    // If they just typed in a tag like {{firstName}} we have to replace it
    if (this.state.codeMirrorMode && this.codeMirror.getValue().match(/\{\{.+\}\}/)) {
      // avoid recursive update cycle
      this.updatingCodeMirror = true;

      // get new encoded value for CodeMirror
      var cmValue = this.codeMirror.getValue();
      var decodedValue = this.state.translator.decodeValue(cmValue);
      var encodedValue = this.state.translator.encodeValue(decodedValue);

      // Grab the cursor so we can reset it.
      // The new length of the CM value will be shorter after replacing a tag like {{firstName}}
      // with a single special char, so adjust cursor position accordingly.
      var cursor = this.codeMirror.getCursor();
      cursor.ch -= cmValue.length - encodedValue.length;

      this.codeMirror.setValue(encodedValue);
      this.codeMirror.setCursor(cursor);
    }
  },

  componentWillUnmount: function componentWillUnmount() {
    if (this.state.codeMirrorMode) {
      this.removeCodeMirrorEditor();
    }
  },

  getInitialState: function getInitialState() {
    var selectedChoices = this.props.config.fieldSelectedReplaceChoices(this.props.field);
    var replaceChoices = this.props.config.fieldReplaceChoices(this.props.field);
    var translator = TagTranslator(selectedChoices.concat(replaceChoices), this.props.config.humanize);

    return {
      value: this.props.field.value,
      codeMirrorMode: false,
      isChoicesOpen: false,
      replaceChoices: replaceChoices,
      translator: translator
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    var selectedChoices = this.props.config.fieldSelectedReplaceChoices(this.props.field);
    var replaceChoices = this.props.config.fieldReplaceChoices(nextProps.field);
    var nextState = {
      replaceChoices: replaceChoices,
      translator: TagTranslator(selectedChoices.concat(replaceChoices), this.props.config.humanize)
    };

    if (this.state.value !== nextProps.field.value && nextProps.field.value) {
      nextState.value = nextProps.field.value;
    }

    this.setState(nextState);
  },

  handleChoiceSelection: function handleChoiceSelection(key) {
    this.setState({ isChoicesOpen: false });

    var char = this.state.translator.encodeTag(key);

    // put the cursor at the end of the inserted tag.
    this.codeMirror.replaceSelection(char, "end");
    this.codeMirror.focus();
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
    var textBox = this.createTextBoxNode();

    var insertBtn = config.createElement("insert-button", { ref: "toggle", onClick: this.onToggleChoices }, "Insert...");

    var choices = config.createElement("choices", {
      ref: "choices",
      choices: this.state.replaceChoices,
      open: this.state.isChoicesOpen,
      ignoreCloseNodes: this.getCloseIgnoreNodes,
      onSelect: this.handleChoiceSelection,
      onClose: this.onCloseChoices
    });

    // Render read-only version. We are using pure HTML via dangerouslySetInnerHTML, to avoid
    // the cost of the react nodes. This is probably a premature optimization.
    var element = React.createElement(
      "div",
      { className: "pretty-text-wrapper", onMouseEnter: this.switchToCodeMirror },
      React.createElement(
        "div",
        { className: textBoxClasses, tabIndex: tabIndex, onFocus: this.onFocusAction, onBlur: this.onBlurAction },
        textBox
      ),
      insertBtn,
      choices
    );

    return config.createElement("field", props, element);
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

  createTextBoxNode: function createTextBoxNode() {
    if (this.state.codeMirrorMode) {
      return React.createElement("div", { ref: "textBox" });
    } else {
      var html = this.state.translator.toHtml(this.state.value);
      return React.createElement("div", { ref: "textBox", dangerouslySetInnerHTML: { __html: html } });
    }
  },

  createEditor: function createEditor() {
    if (this.state.codeMirrorMode) {
      this.createCodeMirrorEditor();
    } else {
      this.createReadonlyEditor();
    }
  },

  createCodeMirrorEditor: function createCodeMirrorEditor() {
    var cmValue = this.state.translator.encodeValue(this.state.value);

    var options = {
      lineWrapping: true,
      tabindex: this.props.tabIndex,
      value: cmValue,
      specialChars: this.state.translator.specialCharsRegexp,
      specialCharPlaceholder: this.createTagNode,
      extraKeys: {
        Tab: false
      }
    };

    var textBox = this.refs.textBox.getDOMNode();
    textBox.innerHTML = ""; // release any previous read-only content so it can be GC'ed

    this.codeMirror = CodeMirror(textBox, options);
    this.codeMirror.on("change", this.onCodeMirrorChange);
  },

  onCodeMirrorChange: function onCodeMirrorChange() {
    if (this.updatingCodeMirror) {
      // avoid recursive update cycle, and mark the code mirror manual update as done
      this.updatingCodeMirror = false;
      return;
    }

    var newValue = this.state.translator.decodeValue(this.codeMirror.getValue());
    this.onChangeValue(newValue);
    this.setState({ value: newValue });
  },

  createReadonlyEditor: function createReadonlyEditor() {
    var textBoxNode = this.refs.textBox.getDOMNode();
    textBoxNode.innerHTML = this.state.translator.toHtml(this.state.value);
  },

  removeCodeMirrorEditor: function removeCodeMirrorEditor() {
    var textBoxNode = this.refs.textBox.getDOMNode();
    var cmNode = textBoxNode.firstChild;
    textBoxNode.removeChild(cmNode);
    this.codeMirror = null;
  },

  switchToCodeMirror: function switchToCodeMirror() {
    if (!this.state.codeMirrorMode) {
      this.setState({ codeMirrorMode: true });
    }
  },

  // Create pill box style for display inside CM. For example
  // '\ue000' becomes '<span class="tag>First Name</span>'
  createTagNode: function createTagNode(char) {
    var node = document.createElement("span");
    var label = this.state.translator.decodeChar(char);

    React.render(React.createElement(
      "span",
      { className: "pretty-part", onClick: this.onToggleChoices },
      label
    ), node);
    return node;
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/field":45,"../../undash":54,"../helpers/tag-translator":41,"classnames":56}],13:[function(require,module,exports){
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

},{"../../mixins/field":45}],14:[function(require,module,exports){
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

},{"../../mixins/field":45,"classnames":56}],15:[function(require,module,exports){
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

},{"../../mixins/field":45,"classnames":56}],16:[function(require,module,exports){
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

},{"../../mixins/field":45}],17:[function(require,module,exports){
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

},{"../../mixins/helper":46,"classnames":56}],18:[function(require,module,exports){
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

},{"../../mixins/helper":46,"classnames":56}],19:[function(require,module,exports){
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

},{"../../mixins/helper":46,"classnames":56}],20:[function(require,module,exports){
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

},{"../../mixins/helper":46,"classnames":56}],21:[function(require,module,exports){
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

},{"../../mixins/helper":46,"classnames":56}],22:[function(require,module,exports){
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
        this.props.onClose();
      }
    }).bind(this));

    this.adjustSize();
  },

  onSelect: function onSelect(choice) {
    this.props.onSelect(choice.value);
  },

  onChoiceAction: function onChoiceAction(choice) {
    this.props.onChoiceAction(choice);
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
    this.setState({ open: nextProps.open }, (function () {
      this.adjustSize();
    }).bind(this));
  },

  onScroll: function onScroll() {},

  onWheel: function onWheel() {},

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;

    var choices = this.props.choices;

    if (choices && choices.length === 0) {
      choices = [{ value: "///empty///" }];
    }

    if (this.props.open) {
      return R.div({ ref: "container", onWheel: this.onWheel, onScroll: this.onScroll,
        className: "choices-container", style: {
          userSelect: "none", WebkitUserSelect: "none", position: "absolute",
          maxHeight: this.state.maxHeight ? this.state.maxHeight : null
        } }, config.cssTransitionWrapper(R.ul({ ref: "choices", className: "choices" }, choices.map((function (choice, i) {

        var choiceElement = null;

        if (choice.value === "///loading///") {
          choiceElement = R.a({ href: "JavaScript" + ":", onClick: this.props.onClose }, R.span({ className: "choice-label" }, config.createElement("loading-choice", { field: this.props.field })));
        } else if (choice.value === "///empty///") {
          choiceElement = R.a({ href: "JavaScript" + ":", onClick: this.props.onClose }, R.span({ className: "choice-label" }, "No choices available."));
        } else if (choice.action) {
          var labelClasses = "choice-label " + choice.action;

          choiceElement = R.a({ href: "JavaScript" + ":", onClick: this.onChoiceAction.bind(this, choice) }, R.span({ className: labelClasses }, choice.label || this.props.config.actionChoiceLabel(choice.action)), this.props.config.createElement("choice-action-sample", { action: choice.action, choice: choice }));
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

},{"../../mixins/click-outside":44,"../../mixins/helper":46}],23:[function(require,module,exports){
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

},{"../../mixins/helper":46,"classnames":56}],24:[function(require,module,exports){
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

},{"../../mixins/helper":46,"../../undash":54,"classnames":56}],25:[function(require,module,exports){
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

},{"../../mixins/helper":46,"classnames":56}],26:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

module.exports = React.createClass({
  propTypes: {
    onClick: React.PropTypes.func.isRequired,
    ref: React.PropTypes.string
  },

  displayName: "InsertButton",

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

},{"../../mixins/helper":46}],27:[function(require,module,exports){
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

    var requiredOrNot;

    if (!config.fieldHasValueChildren(field)) {
      requiredOrNot = R.span({
        className: config.fieldIsRequired(field) ? "required-text" : "not-required-text"
      });
    }

    return R.div({
      className: cx(this.props.classes)
    }, label, " ", requiredOrNot);
  }
});
// # label component

/*
Just the label for a field.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":46,"classnames":56}],28:[function(require,module,exports){
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

},{"../../mixins/helper":46}],29:[function(require,module,exports){
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

},{"../../mixins/helper":46}],30:[function(require,module,exports){
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

},{"../../mixins/helper":46,"classnames":56}],31:[function(require,module,exports){
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

},{"../../mixins/helper":46,"classnames":56}],32:[function(require,module,exports){
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

},{"../../mixins/helper":46,"classnames":56}],33:[function(require,module,exports){
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

},{"../../mixins/helper":46,"classnames":56}],34:[function(require,module,exports){
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

},{"../../mixins/helper":46,"classnames":56}],35:[function(require,module,exports){
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

},{"../../mixins/helper":46,"classnames":56}],36:[function(require,module,exports){
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

},{"../../mixins/helper":46,"classnames":56}],37:[function(require,module,exports){
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
    // var config = this.props.config;
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
      { className: cx(this.props.classes),
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
    if (this.state.isEnteringCustomValue) {
      return React.createElement("input", { ref: "customInput", type: "text", value: this.props.field.value,
        onChange: this.onInputChange, onFocus: this.onFocusAction, onBlur: this.onBlur });
    }

    return React.createElement("input", { type: "text", value: this.getDisplayValue(), readOnly: true, onFocus: this.onFocusAction, onBlur: this.onBlur });
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
        this.refs.customInput.getDOMNode().focus();
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

  onAction: function onAction(params) {
    if (params.action === "enter-custom-value") {
      this.setState({ isEnteringCustomValue: true }, function () {
        this.refs.customInput.getDOMNode().focus();
      });
    }
    this.onBubbleAction(params);
  },

  onInputChange: function onInputChange(event) {
    this.props.onChange(event.target.value);
  }
});
// # pretty-select-value component

/*
   Render a select dropdown for a list of choices. Choices values can be of any
   type. Does not use native select dropdown. Choices can optionally include
   'sample' property displayed grayed out.
 */

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":46,"classnames":56}],38:[function(require,module,exports){
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

},{"../../mixins/helper":46,"classnames":56}],39:[function(require,module,exports){
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

},{"../../mixins/helper":46,"classnames":56}],40:[function(require,module,exports){
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

},{"../../mixins/helper":46,"../../undash":54,"classnames":56}],41:[function(require,module,exports){
"use strict";

// Constant for first unused special use character.
// See IMPLEMENTATION NOTE in pretty-text2.js.
var FIRST_SPECIAL_CHAR = 57344;

// regexp used to grep out tags like {{firstName}}
var TAGS_REGEXP = /\{\{(.+?)\}\}/g;

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

   See IMPLEMENTATION NOTE in pretty-text2.js.
 */
function TagTranslator(replaceChoices, humanize) {
  var nextCharCode = FIRST_SPECIAL_CHAR;

  // Map of tag to label 'firstName' --> 'First Name'
  var choices = {};

  // To help translate to and from the CM representation with the special
  // characters, build two maps:
  //   - charToTagMap: special char to tag - i.e. { '\ue000': 'firstName' }
  //   - tagToCharMap: tag to special char, i.e. { firstName: '\ue000' }
  var charToTagMap = {};
  var tagToCharMap = {};

  function addChoices(choicesArray) {
    choices = buildChoicesMap(choicesArray);

    Object.keys(choices).sort().forEach(function (tag) {
      if (tagToCharMap[tag]) {
        return; // we already have this tag mapped
      }

      var char = String.fromCharCode(nextCharCode++);
      charToTagMap[char] = tag;
      tagToCharMap[tag] = char;
    });
  }

  addChoices(replaceChoices);

  return {
    specialCharsRegexp: /[\ue000-\uefff]/g,

    addChoices: addChoices,

    /*
       Convert tag to encoded character. For example
       'firstName' becomes '\ue000'.
     */
    encodeTag: function encodeTag(tag) {
      if (!tagToCharMap[tag]) {
        var char = String.fromCharCode(nextCharCode++);
        tagToCharMap[tag] = char;
        charToTagMap[char] = tag;
      }
      return tagToCharMap[tag];
    },

    /*
       Convert text value to encoded value for CodeMirror. For example
       'hello {{firstName}}' becomes 'hello \ue000'
     */
    encodeValue: function encodeValue(value) {
      return String(value).replace(TAGS_REGEXP, (function (m, tag) {
        return this.encodeTag(tag);
      }).bind(this));
    },

    /*
       Convert encoded text used in CM to tagged text. For example
       'hello \ue000' becomes 'hello {{firstName}}'
     */
    decodeValue: function decodeValue(encodedValue) {
      return String(encodedValue).replace(this.specialCharsRegexp, function (c) {
        var tag = charToTagMap[c];
        return "{{" + tag + "}}";
      });
    },

    /*
       Convert encoded character to label. For example
       '\ue000' becomes 'Last Name'.
     */
    decodeChar: function decodeChar(char) {
      var tag = charToTagMap[char];
      return this.getLabel(tag);
    },

    /*
       Convert tagged value to HTML. For example
       'hello {{firstName}}' becomes 'hello <span class="tag">First Name</span>'
     */
    toHtml: function toHtml(value) {
      return String(value).replace(TAGS_REGEXP, (function (m, mustache) {
        var tag = mustache.replace("{{", "").replace("}}", "");
        var label = this.getLabel(tag);
        return "<span class=\"pretty-part\">" + label + "</span>";
      }).bind(this));
    },

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
    }
  };
}

module.exports = TagTranslator;

},{}],42:[function(require,module,exports){
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

    createElement_Select: React.createFactory(require("./components/fields/select")),

    createElement_PrettySelect: React.createFactory(require("./components/fields/pretty-select")),

    createElement_Boolean: React.createFactory(require("./components/fields/boolean")),

    createElement_PrettyBoolean: React.createFactory(require("./components/fields/pretty-boolean")),

    createElement_CheckboxBoolean: React.createFactory(require("./components/fields/checkbox-boolean")),

    // createElement_PrettyText: React.createFactory(require('./components/fields/pretty-text')),

    createElement_PrettyText: React.createFactory(require("./components/fields/pretty-text2")),

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

    createElement_Sample: React.createFactory(require("./components/helpers/sample")),

    createElement_InsertButton: React.createFactory(require("./components/helpers/insert-button")),

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

},{"./components/fields/array":2,"./components/fields/boolean":3,"./components/fields/checkbox-array":4,"./components/fields/checkbox-boolean":5,"./components/fields/copy":6,"./components/fields/fields":7,"./components/fields/json":8,"./components/fields/object":9,"./components/fields/pretty-boolean":10,"./components/fields/pretty-select":11,"./components/fields/pretty-text2":12,"./components/fields/select":13,"./components/fields/single-line-string":14,"./components/fields/string":15,"./components/fields/unknown":16,"./components/helpers/add-item":17,"./components/helpers/array-control":18,"./components/helpers/array-item":21,"./components/helpers/array-item-control":19,"./components/helpers/array-item-value":20,"./components/helpers/choices":22,"./components/helpers/field":24,"./components/helpers/field-template-choices":23,"./components/helpers/help":25,"./components/helpers/insert-button":26,"./components/helpers/label":27,"./components/helpers/loading-choice":28,"./components/helpers/loading-choices":29,"./components/helpers/move-item-back":30,"./components/helpers/move-item-forward":31,"./components/helpers/object-control":32,"./components/helpers/object-item":36,"./components/helpers/object-item-control":33,"./components/helpers/object-item-key":34,"./components/helpers/object-item-value":35,"./components/helpers/pretty-select-value":37,"./components/helpers/remove-item":38,"./components/helpers/sample":39,"./components/helpers/select-value":40,"./undash":54,"./utils":55}],43:[function(require,module,exports){
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

  displayName: "Formatic",

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

},{"./default-config":42,"./mixins/click-outside.js":44,"./mixins/field.js":45,"./mixins/helper.js":46,"./mixins/resize.js":47,"./mixins/scroll.js":48,"./mixins/undo-stack.js":49,"./plugins/bootstrap":50,"./plugins/element-classes":51,"./plugins/meta":52,"./plugins/reference":53,"./undash":54,"./utils":55}],44:[function(require,module,exports){
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

},{"../undash":54}],45:[function(require,module,exports){
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

},{"../undash":54}],46:[function(require,module,exports){
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

},{"../undash":54}],47:[function(require,module,exports){
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

},{}],48:[function(require,module,exports){
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

},{}],49:[function(require,module,exports){
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

},{}],50:[function(require,module,exports){
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

},{"../undash":54}],51:[function(require,module,exports){
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

},{"../undash":54}],52:[function(require,module,exports){
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

},{}],53:[function(require,module,exports){
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

},{"../undash":54}],54:[function(require,module,exports){
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

},{"deep-equal":57,"object-assign":60}],55:[function(require,module,exports){
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

},{"./undash":54}],56:[function(require,module,exports){
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

},{}],57:[function(require,module,exports){
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

},{"./lib/is_arguments.js":58,"./lib/keys.js":59}],58:[function(require,module,exports){
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

},{}],59:[function(require,module,exports){
exports = module.exports = typeof Object.keys === 'function'
  ? Object.keys : shim;

exports.shim = shim;
function shim (obj) {
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
}

},{}],60:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2luZGV4LmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9maWVsZHMvYXJyYXkuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9ib29sZWFuLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9maWVsZHMvY2hlY2tib3gtYXJyYXkuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9jaGVja2JveC1ib29sZWFuLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9maWVsZHMvY29weS5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvZmllbGRzL2ZpZWxkcy5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvZmllbGRzL2pzb24uanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9vYmplY3QuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9wcmV0dHktYm9vbGVhbi5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvZmllbGRzL3ByZXR0eS1zZWxlY3QuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9wcmV0dHktdGV4dDIuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9zZWxlY3QuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9zaW5nbGUtbGluZS1zdHJpbmcuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9zdHJpbmcuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy91bmtub3duLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2FkZC1pdGVtLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2FycmF5LWNvbnRyb2wuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvYXJyYXktaXRlbS1jb250cm9sLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2FycmF5LWl0ZW0tdmFsdWUuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvYXJyYXktaXRlbS5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9jaG9pY2VzLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2ZpZWxkLXRlbXBsYXRlLWNob2ljZXMuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvZmllbGQuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvaGVscC5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9pbnNlcnQtYnV0dG9uLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2xhYmVsLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2xvYWRpbmctY2hvaWNlLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2xvYWRpbmctY2hvaWNlcy5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9tb3ZlLWl0ZW0tYmFjay5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9tb3ZlLWl0ZW0tZm9yd2FyZC5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9vYmplY3QtY29udHJvbC5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9vYmplY3QtaXRlbS1jb250cm9sLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL29iamVjdC1pdGVtLWtleS5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9vYmplY3QtaXRlbS12YWx1ZS5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9vYmplY3QtaXRlbS5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9wcmV0dHktc2VsZWN0LXZhbHVlLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL3JlbW92ZS1pdGVtLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL3NhbXBsZS5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9zZWxlY3QtdmFsdWUuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvdGFnLXRyYW5zbGF0b3IuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9kZWZhdWx0LWNvbmZpZy5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2Zvcm1hdGljLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvbWl4aW5zL2NsaWNrLW91dHNpZGUuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9taXhpbnMvZmllbGQuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9taXhpbnMvaGVscGVyLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvbWl4aW5zL3Jlc2l6ZS5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL21peGlucy9zY3JvbGwuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9taXhpbnMvdW5kby1zdGFjay5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL3BsdWdpbnMvYm9vdHN0cmFwLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvcGx1Z2lucy9lbGVtZW50LWNsYXNzZXMuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9wbHVnaW5zL21ldGEuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9wbHVnaW5zL3JlZmVyZW5jZS5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL3VuZGFzaC5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL3V0aWxzLmpzIiwibm9kZV9tb2R1bGVzL2NsYXNzbmFtZXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZGVlcC1lcXVhbC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kZWVwLWVxdWFsL2xpYi9pc19hcmd1bWVudHMuanMiLCJub2RlX21vZHVsZXMvZGVlcC1lcXVhbC9saWIva2V5cy5qcyIsIm5vZGVfbW9kdWxlcy9vYmplY3QtYXNzaWduL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7QUNHQSxNQUFNLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDOzs7Ozs7QUNLM0MsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3BDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7QUFDbEIsSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDOztBQUUvQixNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7O0FBRWpDLGFBQVcsRUFBRSxPQUFPOztBQUVwQixRQUFNLEVBQUUsQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQzs7Ozs7Ozs7QUFR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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyAjIGluZGV4XG5cbi8vIEV4cG9ydCB0aGUgRm9ybWF0aWMgUmVhY3QgY2xhc3MgYXQgdGhlIHRvcCBsZXZlbC5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvZm9ybWF0aWMnKTtcbiIsIi8vICMgYXJyYXkgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgYSBmaWVsZCB0byBlZGl0IGFycmF5IHZhbHVlcy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdBcnJheScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIC8vIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAvLyAgIHJldHVybiB7XG4gIC8vICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lXG4gIC8vICAgfTtcbiAgLy8gfSxcblxuICBuZXh0TG9va3VwSWQ6IDAsXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAvLyBOZWVkIHRvIGNyZWF0ZSBhcnRpZmljaWFsIGtleXMgZm9yIHRoZSBhcnJheS4gSW5kZXhlcyBhcmUgbm90IGdvb2Qga2V5cyxcbiAgICAvLyBzaW5jZSB0aGV5IGNoYW5nZS4gU28sIG1hcCBlYWNoIHBvc2l0aW9uIHRvIGFuIGFydGlmaWNpYWwga2V5XG4gICAgdmFyIGxvb2t1cHMgPSBbXTtcblxuICAgIHZhciBpdGVtcyA9IHRoaXMucHJvcHMuZmllbGQudmFsdWU7XG5cbiAgICBpdGVtcy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtLCBpKSB7XG4gICAgICBsb29rdXBzW2ldID0gJ18nICsgdGhpcy5uZXh0TG9va3VwSWQ7XG4gICAgICB0aGlzLm5leHRMb29rdXBJZCsrO1xuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgbG9va3VwczogbG9va3Vwc1xuICAgIH07XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gKG5ld1Byb3BzKSB7XG5cbiAgICB2YXIgbG9va3VwcyA9IHRoaXMuc3RhdGUubG9va3VwcztcblxuICAgIHZhciBpdGVtcyA9IG5ld1Byb3BzLmZpZWxkLnZhbHVlO1xuXG4gICAgLy8gTmVlZCB0byBzZXQgYXJ0aWZpY2lhbCBrZXlzIGZvciBuZXcgYXJyYXkgaXRlbXMuXG4gICAgaWYgKGl0ZW1zLmxlbmd0aCA+IGxvb2t1cHMubGVuZ3RoKSB7XG4gICAgICBmb3IgKHZhciBpID0gbG9va3Vwcy5sZW5ndGg7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsb29rdXBzW2ldID0gJ18nICsgdGhpcy5uZXh0TG9va3VwSWQ7XG4gICAgICAgIHRoaXMubmV4dExvb2t1cElkKys7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBsb29rdXBzOiBsb29rdXBzXG4gICAgfSk7XG4gIH0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChpLCBuZXdWYWx1ZSwgaW5mbykge1xuICAgIHZhciBuZXdBcnJheVZhbHVlID0gdGhpcy5wcm9wcy5maWVsZC52YWx1ZS5zbGljZSgwKTtcbiAgICBuZXdBcnJheVZhbHVlW2ldID0gbmV3VmFsdWU7XG4gICAgdGhpcy5vbkJ1YmJsZVZhbHVlKG5ld0FycmF5VmFsdWUsIGluZm8pO1xuICB9LFxuXG4gIG9uQXBwZW5kOiBmdW5jdGlvbiAoaXRlbUNob2ljZUluZGV4KSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICB2YXIgbmV3VmFsdWUgPSBjb25maWcuY3JlYXRlTmV3Q2hpbGRGaWVsZFZhbHVlKGZpZWxkLCBpdGVtQ2hvaWNlSW5kZXgpO1xuXG4gICAgdmFyIGl0ZW1zID0gZmllbGQudmFsdWU7XG5cbiAgICBpdGVtcyA9IGl0ZW1zLmNvbmNhdChuZXdWYWx1ZSk7XG5cbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUoaXRlbXMpO1xuICB9LFxuXG4gIG9uUmVtb3ZlOiBmdW5jdGlvbiAoaSkge1xuICAgIHZhciBsb29rdXBzID0gdGhpcy5zdGF0ZS5sb29rdXBzO1xuICAgIGxvb2t1cHMuc3BsaWNlKGksIDEpO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgbG9va3VwczogbG9va3Vwc1xuICAgIH0pO1xuICAgIHZhciBuZXdJdGVtcyA9IHRoaXMucHJvcHMuZmllbGQudmFsdWUuc2xpY2UoMCk7XG4gICAgbmV3SXRlbXMuc3BsaWNlKGksIDEpO1xuICAgIHRoaXMub25DaGFuZ2VWYWx1ZShuZXdJdGVtcyk7XG4gIH0sXG5cbiAgb25Nb3ZlOiBmdW5jdGlvbiAoZnJvbUluZGV4LCB0b0luZGV4KSB7XG4gICAgdmFyIGxvb2t1cHMgPSB0aGlzLnN0YXRlLmxvb2t1cHM7XG4gICAgdmFyIGZyb21JZCA9IGxvb2t1cHNbZnJvbUluZGV4XTtcbiAgICB2YXIgdG9JZCA9IGxvb2t1cHNbdG9JbmRleF07XG4gICAgbG9va3Vwc1tmcm9tSW5kZXhdID0gdG9JZDtcbiAgICBsb29rdXBzW3RvSW5kZXhdID0gZnJvbUlkO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgbG9va3VwczogbG9va3Vwc1xuICAgIH0pO1xuXG4gICAgdmFyIG5ld0l0ZW1zID0gdGhpcy5wcm9wcy5maWVsZC52YWx1ZS5zbGljZSgwKTtcbiAgICBpZiAoZnJvbUluZGV4ICE9PSB0b0luZGV4ICYmXG4gICAgICBmcm9tSW5kZXggPj0gMCAmJiBmcm9tSW5kZXggPCBuZXdJdGVtcy5sZW5ndGggJiZcbiAgICAgIHRvSW5kZXggPj0gMCAmJiB0b0luZGV4IDwgbmV3SXRlbXMubGVuZ3RoXG4gICAgKSB7XG4gICAgICBuZXdJdGVtcy5zcGxpY2UodG9JbmRleCwgMCwgbmV3SXRlbXMuc3BsaWNlKGZyb21JbmRleCwgMSlbMF0pO1xuICAgIH1cbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUobmV3SXRlbXMpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHZhciBmaWVsZHMgPSBjb25maWcuY3JlYXRlQ2hpbGRGaWVsZHMoZmllbGQpO1xuXG4gICAgdmFyIG51bUl0ZW1zID0gZmllbGQudmFsdWUubGVuZ3RoO1xuICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQnLCB7XG4gICAgICBmaWVsZDogZmllbGQsIHBsYWluOiB0aGlzLnByb3BzLnBsYWluXG4gICAgfSxcbiAgICAgIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3Nlcyl9LFxuICAgICAgICAvLyBjc3MgdHJhbnNpdGlvbnMga25vdyB0byBjYXVzZSBldmVudCBwcm9ibGVtc1xuICAgICAgICBjb25maWcuY3NzVHJhbnNpdGlvbldyYXBwZXIoXG4gICAgICAgICAgZmllbGRzLm1hcChmdW5jdGlvbiAoY2hpbGRGaWVsZCwgaSkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdhcnJheS1pdGVtJywge1xuICAgICAgICAgICAgICBrZXk6IHRoaXMuc3RhdGUubG9va3Vwc1tpXSxcbiAgICAgICAgICAgICAgZmllbGQ6IGNoaWxkRmllbGQsXG4gICAgICAgICAgICAgIGluZGV4OiBpLFxuICAgICAgICAgICAgICBudW1JdGVtczogbnVtSXRlbXMsXG4gICAgICAgICAgICAgIG9uTW92ZTogdGhpcy5vbk1vdmUsXG4gICAgICAgICAgICAgIG9uUmVtb3ZlOiB0aGlzLm9uUmVtb3ZlLFxuICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgICAgICAgICAgb25BY3Rpb246IHRoaXMub25CdWJibGVBY3Rpb25cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgKSxcbiAgICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2FycmF5LWNvbnRyb2wnLCB7ZmllbGQ6IGZpZWxkLCBvbkFwcGVuZDogdGhpcy5vbkFwcGVuZH0pXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG4iLCIvLyAjIGJvb2xlYW4gY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgYSBkcm9wZG93biB0byBoYW5kbGUgeWVzL25vIGJvb2xlYW4gdmFsdWVzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdCb29sZWFuJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChuZXdWYWx1ZSkge1xuICAgIHRoaXMub25DaGFuZ2VWYWx1ZShuZXdWYWx1ZSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgdmFyIGNob2ljZXMgPSBjb25maWcuZmllbGRCb29sZWFuQ2hvaWNlcyhmaWVsZCk7XG5cbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywge1xuICAgICAgZmllbGQ6IGZpZWxkLCBwbGFpbjogdGhpcy5wcm9wcy5wbGFpblxuICAgIH0sIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdzZWxlY3QtdmFsdWUnLCB7XG4gICAgICBjaG9pY2VzOiBjaG9pY2VzLCBmaWVsZDogZmllbGQsIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLCBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvblxuICAgIH0pKTtcbiAgfVxufSk7XG4iLCIvLyAjIGNoZWNrYm94LWFycmF5IGNvbXBvbmVudFxuXG4vKlxuVXNlZCB3aXRoIGFycmF5IHZhbHVlcyB0byBzdXBwbHkgbXVsdGlwbGUgY2hlY2tib3hlcyBmb3IgYWRkaW5nIG11bHRpcGxlXG5lbnVtZXJhdGVkIHZhbHVlcyB0byBhbiBhcnJheS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIF8gPSByZXF1aXJlKCcuLi8uLi91bmRhc2gnKTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdDaGVja2JveEFycmF5JyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNob2ljZXM6IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkQ2hvaWNlcyh0aGlzLnByb3BzLmZpZWxkKVxuICAgIH07XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gKG5ld1Byb3BzKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjaG9pY2VzOiBuZXdQcm9wcy5jb25maWcuZmllbGRDaG9pY2VzKG5ld1Byb3BzLmZpZWxkKVxuICAgIH0pO1xuICB9LFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAoKSB7XG4gICAgLy8gR2V0IGFsbCB0aGUgY2hlY2tlZCBjaGVja2JveGVzIGFuZCBjb252ZXJ0IHRvIGFuIGFycmF5IG9mIHZhbHVlcy5cbiAgICB2YXIgY2hvaWNlTm9kZXMgPSB0aGlzLnJlZnMuY2hvaWNlcy5nZXRET01Ob2RlKCkuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2lucHV0Jyk7XG4gICAgY2hvaWNlTm9kZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChjaG9pY2VOb2RlcywgMCk7XG4gICAgdmFyIHZhbHVlcyA9IGNob2ljZU5vZGVzLm1hcChmdW5jdGlvbiAobm9kZSkge1xuICAgICAgcmV0dXJuIG5vZGUuY2hlY2tlZCA/IG5vZGUudmFsdWUgOiBudWxsO1xuICAgIH0pLmZpbHRlcihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9KTtcbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUodmFsdWVzKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICB2YXIgY2hvaWNlcyA9IHRoaXMuc3RhdGUuY2hvaWNlcyB8fCBbXTtcblxuICAgIHZhciBpc0lubGluZSA9ICFfLmZpbmQoY2hvaWNlcywgZnVuY3Rpb24gKGNob2ljZSkge1xuICAgICAgcmV0dXJuIGNob2ljZS5zYW1wbGU7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywge1xuICAgICAgZmllbGQ6IGZpZWxkXG4gICAgfSxcbiAgICAgIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcyksIHJlZjogJ2Nob2ljZXMnfSxcbiAgICAgICAgY2hvaWNlcy5tYXAoZnVuY3Rpb24gKGNob2ljZSwgaSkge1xuXG4gICAgICAgICAgdmFyIGlucHV0RmllbGQgPSBSLnNwYW4oe3N0eWxlOiB7d2hpdGVTcGFjZTogJ25vd3JhcCd9fSxcbiAgICAgICAgICAgIFIuaW5wdXQoe1xuICAgICAgICAgICAgICBuYW1lOiBmaWVsZC5rZXksXG4gICAgICAgICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgICAgICAgIHZhbHVlOiBjaG9pY2UudmFsdWUsXG4gICAgICAgICAgICAgIGNoZWNrZWQ6IGZpZWxkLnZhbHVlLmluZGV4T2YoY2hvaWNlLnZhbHVlKSA+PSAwID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgICAgICAgICAgb25Gb2N1czogdGhpcy5vbkZvY3VzQWN0aW9uLFxuICAgICAgICAgICAgICBvbkJsdXI6IHRoaXMub25CbHVyQWN0aW9uXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICcgJyxcbiAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAnZmllbGQtY2hvaWNlLWxhYmVsJ30sXG4gICAgICAgICAgICAgIGNob2ljZS5sYWJlbFxuICAgICAgICAgICAgKVxuICAgICAgICAgICk7XG5cbiAgICAgICAgICBpZiAoaXNJbmxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiBSLnNwYW4oe2tleTogaSwgY2xhc3NOYW1lOiAnZmllbGQtY2hvaWNlJ30sXG4gICAgICAgICAgICAgIGlucHV0RmllbGQsICcgJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFIuZGl2KHtrZXk6IGksIGNsYXNzTmFtZTogJ2ZpZWxkLWNob2ljZSd9LFxuICAgICAgICAgICAgICBpbnB1dEZpZWxkLCAnICcsXG4gICAgICAgICAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdzYW1wbGUnLCB7ZmllbGQ6IGZpZWxkLCBjaG9pY2U6IGNob2ljZX0pXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgKVxuICAgICk7XG4gIH1cbn0pO1xuIiwiLy8gIyBjaGVja2JveC1ib29sZWFuIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIGEgZmllbGQgdGhhdCBjYW4gZWRpdCBhIGJvb2xlYW4gd2l0aCBhIGNoZWNrYm94LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0NoZWNrYm94Qm9vbGVhbicsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUoZXZlbnQudGFyZ2V0LmNoZWNrZWQpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQnLCB7XG4gICAgICBjb25maWc6IGNvbmZpZywgZmllbGQ6IGZpZWxkLCBwbGFpbjogdHJ1ZVxuICAgIH0sXG4gICAgUi5zcGFuKHtzdHlsZToge3doaXRlU3BhY2U6ICdub3dyYXAnfX0sXG4gICAgICBSLmlucHV0KHtcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgY2hlY2tlZDogZmllbGQudmFsdWUsXG4gICAgICAgIGNsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSxcbiAgICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsXG4gICAgICAgIG9uRm9jdXM6IHRoaXMub25Gb2N1c0FjdGlvbixcbiAgICAgICAgb25CbHVyOiB0aGlzLm9uQmx1ckFjdGlvblxuICAgICAgfSksXG4gICAgICBSLnNwYW4oe30sICcgJyksXG4gICAgICBSLnNwYW4oe30sIGNvbmZpZy5maWVsZEhlbHBUZXh0KGZpZWxkKSB8fCBjb25maWcuZmllbGRMYWJlbChmaWVsZCkpXG4gICAgKSk7XG4gIH1cbn0pO1xuIiwiLy8gIyBjb3B5IGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIG5vbi1lZGl0YWJsZSBodG1sL3RleHQgKHRoaW5rIGFydGljbGUgY29weSkuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnQ29weScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSwgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw6IHtcbiAgICAgIF9faHRtbDogdGhpcy5wcm9wcy5jb25maWcuZmllbGRIZWxwVGV4dCh0aGlzLnByb3BzLmZpZWxkKVxuICAgIH19KTtcbiAgfVxufSk7XG4iLCIvLyAjIGZpZWxkcyBjb21wb25lbnRcblxuLypcblJlbmRlciBhIGZpZWxkIHRvIGVkaXQgdGhlIHZhbHVlcyBvZiBhbiBvYmplY3Qgd2l0aCBzdGF0aWMgcHJvcGVydGllcy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBfID0gcmVxdWlyZSgnLi4vLi4vdW5kYXNoJyk7XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnRmllbGRzJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgb25DaGFuZ2VGaWVsZDogZnVuY3Rpb24gKGtleSwgbmV3VmFsdWUsIGluZm8pIHtcbiAgICBpZiAoa2V5KSB7XG4gICAgICB2YXIgbmV3T2JqZWN0VmFsdWUgPSBfLmV4dGVuZCh7fSwgdGhpcy5wcm9wcy5maWVsZC52YWx1ZSk7XG4gICAgICBuZXdPYmplY3RWYWx1ZVtrZXldID0gbmV3VmFsdWU7XG4gICAgICB0aGlzLm9uQnViYmxlVmFsdWUobmV3T2JqZWN0VmFsdWUsIGluZm8pO1xuICAgIH1cbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgdmFyIGZpZWxkcyA9IGNvbmZpZy5jcmVhdGVDaGlsZEZpZWxkcyhmaWVsZCk7XG5cbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywge1xuICAgICAgY29uZmlnOiBjb25maWcsIGZpZWxkOiBmaWVsZCwgcGxhaW46IHRoaXMucHJvcHMucGxhaW5cbiAgICB9LFxuICAgICAgUi5maWVsZHNldCh7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpfSxcbiAgICAgICAgZmllbGRzLm1hcChmdW5jdGlvbiAoY2hpbGRGaWVsZCwgaSkge1xuICAgICAgICAgIHZhciBrZXkgPSBjaGlsZEZpZWxkLmtleSB8fCBpO1xuICAgICAgICAgIHJldHVybiBjb25maWcuY3JlYXRlRmllbGRFbGVtZW50KHtcbiAgICAgICAgICAgIGtleToga2V5IHx8IGksXG4gICAgICAgICAgICBmaWVsZDogY2hpbGRGaWVsZCxcbiAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlRmllbGQuYmluZCh0aGlzLCBrZXkpLCBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvblxuICAgICAgICAgIH0pO1xuICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICApXG4gICAgKTtcbiAgfVxuXG59KTtcbiIsIi8vICMganNvbiBjb21wb25lbnRcblxuLypcblRleHRhcmVhIGVkaXRvciBmb3IgSlNPTi4gV2lsbCB2YWxpZGF0ZSB0aGUgSlNPTiBiZWZvcmUgc2V0dGluZyB0aGUgdmFsdWUsIHNvXG53aGlsZSB0aGUgdmFsdWUgaXMgaW52YWxpZCwgbm8gZXh0ZXJuYWwgc3RhdGUgY2hhbmdlcyB3aWxsIG9jY3VyLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnSnNvbicsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICByb3dzOiA1XG4gICAgfTtcbiAgfSxcblxuICBpc1ZhbGlkVmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuXG4gICAgdHJ5IHtcbiAgICAgIEpTT04ucGFyc2UodmFsdWUpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaXNWYWxpZDogdHJ1ZSxcbiAgICAgIHZhbHVlOiBKU09OLnN0cmluZ2lmeSh0aGlzLnByb3BzLmZpZWxkLnZhbHVlLCBudWxsLCAyKVxuICAgIH07XG4gIH0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHZhciBpc1ZhbGlkID0gdGhpcy5pc1ZhbGlkVmFsdWUoZXZlbnQudGFyZ2V0LnZhbHVlKTtcblxuICAgIGlmIChpc1ZhbGlkKSB7XG4gICAgICAvLyBOZWVkIHRvIGhhbmRsZSB0aGlzIGJldHRlci4gTmVlZCB0byB0cmFjayBwb3NpdGlvbi5cbiAgICAgIHRoaXMuX2lzQ2hhbmdpbmcgPSB0cnVlO1xuICAgICAgdGhpcy5vbkNoYW5nZVZhbHVlKEpTT04ucGFyc2UoZXZlbnQudGFyZ2V0LnZhbHVlKSk7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBpc1ZhbGlkOiBpc1ZhbGlkLFxuICAgICAgdmFsdWU6IGV2ZW50LnRhcmdldC52YWx1ZVxuICAgIH0pO1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXh0UHJvcHMpIHtcbiAgICBpZiAoIXRoaXMuX2lzQ2hhbmdpbmcpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBpc1ZhbGlkOiB0cnVlLFxuICAgICAgICB2YWx1ZTogSlNPTi5zdHJpbmdpZnkobmV4dFByb3BzLmZpZWxkLnZhbHVlLCBudWxsLCAyKVxuICAgICAgfSk7XG4gICAgfVxuICAgIHRoaXMuX2lzQ2hhbmdpbmcgPSBmYWxzZTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHtcbiAgICAgIGZpZWxkOiBjb25maWcuZmllbGRXaXRoVmFsdWUoZmllbGQsIHRoaXMuc3RhdGUudmFsdWUpLCBwbGFpbjogdGhpcy5wcm9wcy5wbGFpblxuICAgIH0sIFIudGV4dGFyZWEoe1xuICAgICAgICBjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcyksXG4gICAgICAgIHZhbHVlOiB0aGlzLnN0YXRlLnZhbHVlLFxuICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgICAgc3R5bGU6IHtiYWNrZ3JvdW5kQ29sb3I6IHRoaXMuc3RhdGUuaXNWYWxpZCA/ICcnIDogJ3JnYigyNTUsMjAwLDIwMCknfSxcbiAgICAgICAgcm93czogY29uZmlnLmZpZWxkUm93cyhmaWVsZCkgfHwgdGhpcy5wcm9wcy5yb3dzLFxuICAgICAgICBvbkZvY3VzOiB0aGlzLm9uRm9jdXNBY3Rpb24sXG4gICAgICAgIG9uQmx1cjogdGhpcy5vbkJsdXJBY3Rpb25cbiAgICAgIH0pXG4gICAgKTtcbiAgfVxufSk7XG4iLCIvLyAjIG9iamVjdCBjb21wb25lbnRcblxuLypcblJlbmRlciBhIGZpZWxkIHRvIGVkaXQgYW4gb2JqZWN0IHdpdGggZHluYW1pYyBjaGlsZCBmaWVsZHMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgXyA9IHJlcXVpcmUoJy4uLy4uL3VuZGFzaCcpO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG52YXIgdGVtcEtleVByZWZpeCA9ICckJF9fdGVtcF9fJztcblxudmFyIHRlbXBLZXkgPSBmdW5jdGlvbiAoaWQpIHtcbiAgcmV0dXJuIHRlbXBLZXlQcmVmaXggKyBpZDtcbn07XG5cbnZhciBpc1RlbXBLZXkgPSBmdW5jdGlvbiAoa2V5KSB7XG4gIHJldHVybiBrZXkuc3Vic3RyaW5nKDAsIHRlbXBLZXlQcmVmaXgubGVuZ3RoKSA9PT0gdGVtcEtleVByZWZpeDtcbn07XG5cbi8vIFRPRE86IGtlZXAgaW52YWxpZCBrZXlzIGFzIHN0YXRlIGFuZCBkb24ndCBzZW5kIGluIG9uQ2hhbmdlOyBjbG9uZSBjb250ZXh0XG4vLyBhbmQgdXNlIGNsb25lIHRvIGNyZWF0ZSBjaGlsZCBjb250ZXh0c1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ09iamVjdCcsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIG5leHRMb29rdXBJZDogMCxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBrZXlUb0lkID0ge307XG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLnByb3BzLmZpZWxkLnZhbHVlKTtcbiAgICB2YXIga2V5T3JkZXIgPSBbXTtcbiAgICAvLyBUZW1wIGtleXMga2VlcHMgdGhlIGtleSB0byBkaXNwbGF5LCB3aGljaCBzb21ldGltZXMgbWF5IGJlIGRpZmZlcmVudFxuICAgIC8vIHRoYW4gdGhlIGFjdHVhbCBrZXkuIEZvciBleGFtcGxlLCBkdXBsaWNhdGUga2V5cyBhcmUgbm90IGFsbG93ZWQsXG4gICAgLy8gYnV0IHdlIG1heSB0ZW1wb3JhcmlseSBzaG93IGR1cGxpY2F0ZSBrZXlzLlxuICAgIHZhciB0ZW1wRGlzcGxheUtleXMgPSB7fTtcblxuICAgIC8vIEtleXMgZG9uJ3QgbWFrZSBnb29kIHJlYWN0IGtleXMsIHNpbmNlIHdlJ3JlIGFsbG93aW5nIHRoZW0gdG8gYmVcbiAgICAvLyBjaGFuZ2VkIGhlcmUsIHNvIHdlJ2xsIGhhdmUgdG8gY3JlYXRlIGZha2Uga2V5cyBhbmRcbiAgICAvLyBrZWVwIHRyYWNrIG9mIHRoZSBtYXBwaW5nIG9mIHJlYWwga2V5cyB0byBmYWtlIGtleXMuIFl1Y2suXG4gICAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHZhciBpZCA9ICsrdGhpcy5uZXh0TG9va3VwSWQ7XG4gICAgICAvLyBNYXAgdGhlIHJlYWwga2V5IHRvIHRoZSBpZC5cbiAgICAgIGtleVRvSWRba2V5XSA9IGlkO1xuICAgICAgLy8gS2VlcCB0aGUgb3JkZXJpbmcgb2YgdGhlIGtleXMgc28gd2UgZG9uJ3Qgc2h1ZmZsZSB0aGluZ3MgYXJvdW5kIGxhdGVyLlxuICAgICAga2V5T3JkZXIucHVzaChrZXkpO1xuICAgICAgLy8gSWYgdGhpcyBpcyBhIHRlbXBvcmFyeSBrZXkgdGhhdCB3YXMgcGVyc2lzdGVkLCBiZXN0IHdlIGNhbiBkbyBpcyBkaXNwbGF5XG4gICAgICAvLyBhIGJsYW5rLlxuICAgICAgLy8gVE9ETzogUHJvYmFibHkganVzdCBub3Qgc2VuZCB0ZW1wb3Jhcnkga2V5cyBiYWNrIHRocm91Z2guIFRoaXMgYmVoYXZpb3JcbiAgICAgIC8vIGlzIGFjdHVhbGx5IGxlZnRvdmVyIGZyb20gYW4gZWFybGllciBpbmNhcm5hdGlvbiBvZiBmb3JtYXRpYyB3aGVyZVxuICAgICAgLy8gdmFsdWVzIGhhZCB0byBnbyBiYWNrIHRvIHRoZSByb290LlxuICAgICAgaWYgKGlzVGVtcEtleShrZXkpKSB7XG4gICAgICAgIHRlbXBEaXNwbGF5S2V5c1tpZF0gPSAnJztcbiAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGtleVRvSWQ6IGtleVRvSWQsXG4gICAgICBrZXlPcmRlcjoga2V5T3JkZXIsXG4gICAgICAvLyBUZW1wIGtleXMga2VlcHMgdGhlIGtleSB0byBkaXNwbGF5LCB3aGljaCBzb21ldGltZXMgbWF5IGJlIGRpZmZlcmVudFxuICAgICAgLy8gdGhhbiB0aGUgYWN0dWFsIGtleS4gRm9yIGV4YW1wbGUsIGR1cGxpY2F0ZSBrZXlzIGFyZSBub3QgYWxsb3dlZCxcbiAgICAgIC8vIGJ1dCB3ZSBtYXkgdGVtcG9yYXJpbHkgc2hvdyBkdXBsaWNhdGUga2V5cy5cbiAgICAgIHRlbXBEaXNwbGF5S2V5czogdGVtcERpc3BsYXlLZXlzXG4gICAgfTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV3UHJvcHMpIHtcblxuICAgIHZhciBrZXlUb0lkID0gdGhpcy5zdGF0ZS5rZXlUb0lkO1xuICAgIHZhciBuZXdLZXlUb0lkID0ge307XG4gICAgdmFyIHRlbXBEaXNwbGF5S2V5cyA9IHRoaXMuc3RhdGUudGVtcERpc3BsYXlLZXlzO1xuICAgIHZhciBuZXdUZW1wRGlzcGxheUtleXMgPSB7fTtcbiAgICB2YXIga2V5T3JkZXIgPSB0aGlzLnN0YXRlLmtleU9yZGVyO1xuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMobmV3UHJvcHMuZmllbGQudmFsdWUpO1xuICAgIHZhciBhZGRlZEtleXMgPSBbXTtcblxuICAgIC8vIExvb2sgYXQgdGhlIG5ldyBrZXlzLlxuICAgIGtleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAvLyBBZGQgbmV3IGxvb2t1cCBpZiB0aGlzIGtleSB3YXNuJ3QgaGVyZSBsYXN0IHRpbWUuXG4gICAgICBpZiAoIWtleVRvSWRba2V5XSkge1xuICAgICAgICB0aGlzLm5leHRMb29rdXBJZCsrO1xuICAgICAgICBuZXdLZXlUb0lkW2tleV0gPSB0aGlzLm5leHRMb29rdXBJZDtcbiAgICAgICAgYWRkZWRLZXlzLnB1c2goa2V5KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld0tleVRvSWRba2V5XSA9IGtleVRvSWRba2V5XTtcbiAgICAgIH1cbiAgICAgIGlmIChpc1RlbXBLZXkoa2V5KSAmJiBuZXdLZXlUb0lkW2tleV0gaW4gdGVtcERpc3BsYXlLZXlzKSB7XG4gICAgICAgIG5ld1RlbXBEaXNwbGF5S2V5c1tuZXdLZXlUb0lkW2tleV1dID0gdGVtcERpc3BsYXlLZXlzW25ld0tleVRvSWRba2V5XV07XG4gICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIHZhciBuZXdLZXlPcmRlciA9IFtdO1xuXG4gICAgLy8gTG9vayBhdCB0aGUgb2xkIGtleXMuXG4gICAga2V5T3JkZXIuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAvLyBJZiB0aGUga2V5IGlzIGluIHRoZSBuZXcga2V5cywgcHVzaCBpdCBvbnRvIHRoZSBvcmRlciB0byByZXRhaW4gdGhlXG4gICAgICAvLyBzYW1lIG9yZGVyLlxuICAgICAgaWYgKG5ld0tleVRvSWRba2V5XSkge1xuICAgICAgICBuZXdLZXlPcmRlci5wdXNoKGtleSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBQdXQgYWRkZWQgZmllbGRzIGF0IHRoZSBlbmQuIChTbyB0aGluZ3MgZG9uJ3QgZ2V0IHNodWZmbGVkLilcbiAgICBuZXdLZXlPcmRlciA9IG5ld0tleU9yZGVyLmNvbmNhdChhZGRlZEtleXMpO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBrZXlUb0lkOiBuZXdLZXlUb0lkLFxuICAgICAga2V5T3JkZXI6IG5ld0tleU9yZGVyLFxuICAgICAgdGVtcERpc3BsYXlLZXlzOiBuZXdUZW1wRGlzcGxheUtleXNcbiAgICB9KTtcbiAgfSxcblxuICBvbkNoYW5nZTogZnVuY3Rpb24gKGtleSwgbmV3VmFsdWUsIGluZm8pIHtcbiAgICB2YXIgbmV3T2JqID0gXy5leHRlbmQoe30sIHRoaXMucHJvcHMuZmllbGQudmFsdWUpO1xuICAgIG5ld09ialtrZXldID0gbmV3VmFsdWU7XG4gICAgdGhpcy5vbkJ1YmJsZVZhbHVlKG5ld09iaiwgaW5mbyk7XG4gIH0sXG5cbiAgb25BcHBlbmQ6IGZ1bmN0aW9uIChpdGVtQ2hvaWNlSW5kZXgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcbiAgICB0aGlzLm5leHRMb29rdXBJZCsrO1xuXG4gICAgdmFyIGtleVRvSWQgPSB0aGlzLnN0YXRlLmtleVRvSWQ7XG4gICAgdmFyIGtleU9yZGVyID0gdGhpcy5zdGF0ZS5rZXlPcmRlcjtcbiAgICB2YXIgdGVtcERpc3BsYXlLZXlzID0gdGhpcy5zdGF0ZS50ZW1wRGlzcGxheUtleXM7XG5cbiAgICB2YXIgaWQgPSB0aGlzLm5leHRMb29rdXBJZDtcbiAgICB2YXIgbmV3S2V5ID0gdGVtcEtleShpZCk7XG5cbiAgICBrZXlUb0lkW25ld0tleV0gPSBpZDtcbiAgICAvLyBUZW1wb3JhcmlseSwgd2UnbGwgc2hvdyBhIGJsYW5rIGtleS5cbiAgICB0ZW1wRGlzcGxheUtleXNbaWRdID0gJyc7XG4gICAga2V5T3JkZXIucHVzaChuZXdLZXkpO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBrZXlUb0lkOiBrZXlUb0lkLFxuICAgICAgdGVtcERpc3BsYXlLZXlzOiB0ZW1wRGlzcGxheUtleXMsXG4gICAgICBrZXlPcmRlcjoga2V5T3JkZXJcbiAgICB9KTtcblxuICAgIHZhciBuZXdPYmogPSBfLmV4dGVuZCh0aGlzLnByb3BzLmZpZWxkLnZhbHVlKTtcblxuICAgIHZhciBuZXdWYWx1ZSA9IGNvbmZpZy5jcmVhdGVOZXdDaGlsZEZpZWxkVmFsdWUoZmllbGQsIGl0ZW1DaG9pY2VJbmRleCk7XG5cbiAgICBuZXdPYmpbbmV3S2V5XSA9IG5ld1ZhbHVlO1xuXG4gICAgdGhpcy5vbkNoYW5nZVZhbHVlKG5ld09iaik7XG4gIH0sXG5cbiAgb25SZW1vdmU6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICB2YXIgbmV3T2JqID0gXy5leHRlbmQodGhpcy5wcm9wcy5maWVsZC52YWx1ZSk7XG4gICAgZGVsZXRlIG5ld09ialtrZXldO1xuICAgIHRoaXMub25DaGFuZ2VWYWx1ZShuZXdPYmopO1xuICB9LFxuXG4gIG9uTW92ZTogZnVuY3Rpb24gKGZyb21LZXksIHRvS2V5KSB7XG4gICAgaWYgKGZyb21LZXkgIT09IHRvS2V5KSB7XG4gICAgICB2YXIga2V5VG9JZCA9IHRoaXMuc3RhdGUua2V5VG9JZDtcbiAgICAgIHZhciBrZXlPcmRlciA9IHRoaXMuc3RhdGUua2V5T3JkZXI7XG4gICAgICB2YXIgdGVtcERpc3BsYXlLZXlzID0gdGhpcy5zdGF0ZS50ZW1wRGlzcGxheUtleXM7XG5cbiAgICAgIHZhciBuZXdPYmogPSBfLmV4dGVuZCh0aGlzLnByb3BzLmZpZWxkLnZhbHVlKTtcblxuICAgICAgLy8gSWYgd2UgYWxyZWFkeSBoYXZlIHRoZSBrZXkgd2UncmUgbW92aW5nIHRvLCB0aGVuIHdlIGhhdmUgdG8gY2hhbmdlIHRoYXRcbiAgICAgIC8vIGtleSB0byBzb21ldGhpbmcgZWxzZS5cbiAgICAgIGlmIChrZXlUb0lkW3RvS2V5XSkge1xuICAgICAgICAvLyBNYWtlIGEgbmV3XG4gICAgICAgIHZhciB0ZW1wVG9LZXkgPSB0ZW1wS2V5KGtleVRvSWRbdG9LZXldKTtcbiAgICAgICAgdGVtcERpc3BsYXlLZXlzW2tleVRvSWRbdG9LZXldXSA9IHRvS2V5O1xuICAgICAgICBrZXlUb0lkW3RlbXBUb0tleV0gPSBrZXlUb0lkW3RvS2V5XTtcbiAgICAgICAga2V5T3JkZXJba2V5T3JkZXIuaW5kZXhPZih0b0tleSldID0gdGVtcFRvS2V5O1xuICAgICAgICBkZWxldGUga2V5VG9JZFt0b0tleV07XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIGtleVRvSWQ6IGtleVRvSWQsXG4gICAgICAgICAgdGVtcERpc3BsYXlLZXlzOiB0ZW1wRGlzcGxheUtleXMsXG4gICAgICAgICAga2V5T3JkZXI6IGtleU9yZGVyXG4gICAgICAgIH0pO1xuXG4gICAgICAgIG5ld09ialt0ZW1wVG9LZXldID0gbmV3T2JqW3RvS2V5XTtcbiAgICAgICAgZGVsZXRlIG5ld09ialt0b0tleV07XG4gICAgICB9XG5cbiAgICAgIGlmICghdG9LZXkpIHtcbiAgICAgICAgdG9LZXkgPSB0ZW1wS2V5KGtleVRvSWRbZnJvbUtleV0pO1xuICAgICAgICB0ZW1wRGlzcGxheUtleXNba2V5VG9JZFtmcm9tS2V5XV0gPSAnJztcbiAgICAgIH1cbiAgICAgIGtleVRvSWRbdG9LZXldID0ga2V5VG9JZFtmcm9tS2V5XTtcbiAgICAgIGRlbGV0ZSBrZXlUb0lkW2Zyb21LZXldO1xuICAgICAga2V5T3JkZXJba2V5T3JkZXIuaW5kZXhPZihmcm9tS2V5KV0gPSB0b0tleTtcblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGtleVRvSWQ6IGtleVRvSWQsXG4gICAgICAgIGtleU9yZGVyOiBrZXlPcmRlcixcbiAgICAgICAgdGVtcERpc3BsYXlLZXlzOiB0ZW1wRGlzcGxheUtleXNcbiAgICAgIH0pO1xuXG4gICAgICBuZXdPYmpbdG9LZXldID0gbmV3T2JqW2Zyb21LZXldO1xuICAgICAgZGVsZXRlIG5ld09ialtmcm9tS2V5XTtcblxuICAgICAgdGhpcy5vbkNoYW5nZVZhbHVlKG5ld09iaik7XG5cbiAgICAgIC8vIENoZWNrIGlmIG91ciBmcm9tS2V5IGhhcyBvcGVuZWQgdXAgYSBzcG90LlxuICAgICAgaWYgKGZyb21LZXkgJiYgZnJvbUtleSAhPT0gdG9LZXkpIHtcbiAgICAgICAgaWYgKCEoZnJvbUtleSBpbiBuZXdPYmopKSB7XG4gICAgICAgICAgT2JqZWN0LmtleXMobmV3T2JqKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIGlmICghKGlzVGVtcEtleShrZXkpKSkge1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaWQgPSBrZXlUb0lkW2tleV07XG4gICAgICAgICAgICB2YXIgZGlzcGxheUtleSA9IHRlbXBEaXNwbGF5S2V5c1tpZF07XG4gICAgICAgICAgICBpZiAoZnJvbUtleSA9PT0gZGlzcGxheUtleSkge1xuICAgICAgICAgICAgICB0aGlzLm9uTW92ZShrZXksIGRpc3BsYXlLZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgZ2V0RmllbGRzOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICB2YXIgZmllbGRzID0gY29uZmlnLmNyZWF0ZUNoaWxkRmllbGRzKGZpZWxkKTtcblxuICAgIHZhciBrZXlUb0ZpZWxkID0ge307XG5cbiAgICBfLmVhY2goZmllbGRzLCBmdW5jdGlvbiAoY2hpbGRGaWVsZCkge1xuICAgICAga2V5VG9GaWVsZFtjaGlsZEZpZWxkLmtleV0gPSBjaGlsZEZpZWxkO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXMuc3RhdGUua2V5T3JkZXIubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHJldHVybiBrZXlUb0ZpZWxkW2tleV07XG4gICAgfSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgdmFyIGZpZWxkcyA9IHRoaXMuZ2V0RmllbGRzKCk7XG5cbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywge1xuICAgICAgZmllbGQ6IGZpZWxkLCBwbGFpbjogdGhpcy5wcm9wcy5wbGFpblxuICAgIH0sXG4gICAgICBSLmRpdih7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpfSxcbiAgICAgICAgY29uZmlnLmNzc1RyYW5zaXRpb25XcmFwcGVyKFxuICAgICAgICAgIGZpZWxkcy5tYXAoZnVuY3Rpb24gKGNoaWxkRmllbGQpIHtcbiAgICAgICAgICAgIHZhciBkaXNwbGF5S2V5ID0gdGhpcy5zdGF0ZS50ZW1wRGlzcGxheUtleXNbdGhpcy5zdGF0ZS5rZXlUb0lkW2NoaWxkRmllbGQua2V5XV07XG4gICAgICAgICAgICBpZiAoXy5pc1VuZGVmaW5lZChkaXNwbGF5S2V5KSkge1xuICAgICAgICAgICAgICBkaXNwbGF5S2V5ID0gY2hpbGRGaWVsZC5rZXk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ29iamVjdC1pdGVtJywge1xuICAgICAgICAgICAgICBrZXk6IHRoaXMuc3RhdGUua2V5VG9JZFtjaGlsZEZpZWxkLmtleV0sXG4gICAgICAgICAgICAgIGZpZWxkOiBjaGlsZEZpZWxkLFxuICAgICAgICAgICAgICBvbk1vdmU6IHRoaXMub25Nb3ZlLFxuICAgICAgICAgICAgICBvblJlbW92ZTogdGhpcy5vblJlbW92ZSxcbiAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsXG4gICAgICAgICAgICAgIG9uQWN0aW9uOiB0aGlzLm9uQnViYmxlQWN0aW9uLFxuICAgICAgICAgICAgICBkaXNwbGF5S2V5OiBkaXNwbGF5S2V5LFxuICAgICAgICAgICAgICBpdGVtS2V5OiBjaGlsZEZpZWxkLmtleVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICApLFxuICAgICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgnb2JqZWN0LWNvbnRyb2wnLCB7ZmllbGQ6IGZpZWxkLCBvbkFwcGVuZDogdGhpcy5vbkFwcGVuZH0pXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG4iLCIvLyAjIHByZXR0eSBib29sZWFuIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIHByZXR0eSBib29sZWFuIGNvbXBvbmVudCB3aXRoIG5vbi1uYXRpdmUgZHJvcC1kb3duXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ1ByZXR0eUJvb2xlYW4nLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICBvbkNoYW5nZTogZnVuY3Rpb24gKG5ld1ZhbHVlKSB7XG4gICAgdGhpcy5vbkNoYW5nZVZhbHVlKG5ld1ZhbHVlKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgdmFyIGNob2ljZXMgPSBjb25maWcuZmllbGRCb29sZWFuQ2hvaWNlcyhmaWVsZCk7XG5cbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywge1xuICAgICAgZmllbGQ6IGZpZWxkLCBwbGFpbjogdGhpcy5wcm9wcy5wbGFpblxuICAgIH0sIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdwcmV0dHktc2VsZWN0LXZhbHVlJywge1xuICAgICAgY2hvaWNlczogY2hvaWNlcywgZmllbGQ6IGZpZWxkLCBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSwgb25BY3Rpb246IHRoaXMub25CdWJibGVBY3Rpb25cbiAgICB9KSk7XG4gIH1cbn0pO1xuIiwiLy8gIyBzZWxlY3QgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgc2VsZWN0IGVsZW1lbnQgdG8gZ2l2ZSBhIHVzZXIgY2hvaWNlcyBmb3IgdGhlIHZhbHVlIG9mIGEgZmllbGQuIFJlbmRlcnMgbm9uLW5hdGl2ZVxuc2VsZWN0IGRyb3AgZG93biBhbmQgc3VwcG9ydHMgZmFuY2llciByZW5kZXJpbmdzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdQcmV0dHlTZWxlY3QnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY2hvaWNlczogdGhpcy5wcm9wcy5jb25maWcuZmllbGRQcmV0dHlDaG9pY2VzKHRoaXMucHJvcHMuZmllbGQpXG4gICAgfTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV3UHJvcHMpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGNob2ljZXM6IG5ld1Byb3BzLmNvbmZpZy5maWVsZFByZXR0eUNob2ljZXMobmV3UHJvcHMuZmllbGQpXG4gICAgfSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHtcbiAgICAgIGNvbmZpZzogY29uZmlnLCBmaWVsZDogZmllbGQsIHBsYWluOiB0aGlzLnByb3BzLnBsYWluXG4gICAgfSwgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ3ByZXR0eS1zZWxlY3QtdmFsdWUnLCB7XG4gICAgICBjaG9pY2VzOiB0aGlzLnN0YXRlLmNob2ljZXMsIGZpZWxkOiBmaWVsZCwgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2VWYWx1ZSwgb25BY3Rpb246IHRoaXMub25CdWJibGVBY3Rpb25cbiAgICB9KSk7XG4gIH1cbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuLyogZ2xvYmFsIENvZGVNaXJyb3IgKi9cbi8qZXNsaW50IG5vLXNjcmlwdC11cmw6MCAqL1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBUYWdUcmFuc2xhdG9yID0gcmVxdWlyZSgnLi4vaGVscGVycy90YWctdHJhbnNsYXRvcicpO1xudmFyIF8gPSByZXF1aXJlKCcuLi8uLi91bmRhc2gnKTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxuLypcbiAgIEVkaXRvciBmb3IgdGFnZ2VkIHRleHQuIFJlbmRlcnMgdGV4dCBsaWtlIFwiaGVsbG8ge3tmaXJzdE5hbWV9fVwiXG4gICB3aXRoIHJlcGxhY2VtZW50IGxhYmVscyByZW5kZXJlZCBpbiBhIHBpbGwgYm94LiBEZXNpZ25lZCB0byBsb2FkXG4gICBxdWlja2x5IHdoZW4gbWFueSBzZXBhcmF0ZSBpbnN0YW5jZXMgb2YgaXQgYXJlIG9uIHRoZSBzYW1lXG4gICBwYWdlLlxuXG4gICBVc2VzIENvZGVNaXJyb3IgdG8gZWRpdCB0ZXh0LiBUbyBzYXZlIG1lbW9yeSB0aGUgQ29kZU1pcnJvciBub2RlIGlzXG4gICBpbnN0YW50aWF0ZWQgd2hlbiB0aGUgdXNlciBtb3ZlcyB0aGUgbW91c2UgaW50byB0aGUgZWRpdCBhcmVhLlxuICAgSW5pdGlhbGx5IGEgcmVhZC1vbmx5IHZpZXcgdXNpbmcgYSBzaW1wbGUgZGl2IGlzIHNob3duLlxuXG4gICBJTVBMRU1FTlRBVElPTiBOT1RFOlxuXG4gICBUbyBkaXNwbGF5IHRoZSB0YWdzIGluc2lkZSBDb2RlTWlycm9yIHdlIGFyZSB1c2luZyBDTSdzXG4gICBzcGVjaWFsQ2hhclBsYWNlaG9sZGVyIGZlYXR1cmUsIHRvIHJlcGxhY2Ugc3BlY2lhbCBjaGFyYWN0ZXJzIHdpdGhcbiAgIGN1c3RvbSBET00gbm9kZXMuIFRoaXMgZmVhdHVyZSBpcyBkZXNpZ25lZCBmb3Igc2luZ2xlIGNoYXJhY3RlclxuICAgcmVwbGFjZW1lbnRzLCBub3QgdGFncyBsaWtlICdmaXJzdE5hbWUnLiAgU28gd2UgcmVwbGFjZSBlYWNoIHRhZ1xuICAgd2l0aCBhbiB1bnVzZWQgY2hhcmFjdGVyIGZyb20gdGhlIFVuaWNvZGUgcHJpdmF0ZSB1c2UgYXJlYSwgYW5kXG4gICB0ZWxsIENNIHRvIHJlcGxhY2UgdGhhdCB3aXRoIGEgRE9NIG5vZGUgZGlzcGxheSB0aGUgdGFnIGxhYmVsIHdpdGhcbiAgIHRoZSBwaWxsIGJveCBlZmZlY3QuXG5cbiAgIElzIHRoaXMgZXZpbD8gUGVyaGFwcyBhIGxpdHRsZSwgYnV0IGRlbGV0ZSwgdW5kbywgcmVkbywgY3V0LCBjb3B5XG4gICBhbmQgcGFzdGUgb2YgdGhlIHRhZyBwaWxsIGJveGVzIGp1c3Qgd29yayBiZWNhdXNlIENNIHRyZWF0cyB0aGVtIGFzXG4gICBhdG9taWMgc2luZ2xlIGNoYXJhY3RlcnMsIGFuZCBpdCdzIG5vdCBtdWNoIGNvZGUgb24gb3VyIHBhcnQuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogJ1ByZXR0eVRleHQnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jcmVhdGVFZGl0b3IoKTtcbiAgfSxcblxuICBjb21wb25lbnREaWRVcGRhdGU6IGZ1bmN0aW9uKHByZXZQcm9wcywgcHJldlN0YXRlKSB7XG4gICAgaWYgKHByZXZTdGF0ZS5jb2RlTWlycm9yTW9kZSAhPT0gdGhpcy5zdGF0ZS5jb2RlTWlycm9yTW9kZSkge1xuICAgICAgLy8gQ2hhbmdlZCBmcm9tIGNvZGUgbWlycm9yIG1vZGUgdG8gcmVhZCBvbmx5IG1vZGUgb3IgdmljZSB2ZXJzYSxcbiAgICAgIC8vIHNvIHNldHVwIHRoZSBvdGhlciBlZGl0b3IuXG4gICAgICB0aGlzLmNyZWF0ZUVkaXRvcigpO1xuICAgIH1cblxuICAgIC8vIElmIHRoZXkganVzdCB0eXBlZCBpbiBhIHRhZyBsaWtlIHt7Zmlyc3ROYW1lfX0gd2UgaGF2ZSB0byByZXBsYWNlIGl0XG4gICAgaWYgKHRoaXMuc3RhdGUuY29kZU1pcnJvck1vZGUgJiYgdGhpcy5jb2RlTWlycm9yLmdldFZhbHVlKCkubWF0Y2goL1xce1xcey4rXFx9XFx9LykpIHtcbiAgICAgIC8vIGF2b2lkIHJlY3Vyc2l2ZSB1cGRhdGUgY3ljbGVcbiAgICAgIHRoaXMudXBkYXRpbmdDb2RlTWlycm9yID0gdHJ1ZTtcblxuICAgICAgLy8gZ2V0IG5ldyBlbmNvZGVkIHZhbHVlIGZvciBDb2RlTWlycm9yXG4gICAgICB2YXIgY21WYWx1ZSA9IHRoaXMuY29kZU1pcnJvci5nZXRWYWx1ZSgpO1xuICAgICAgdmFyIGRlY29kZWRWYWx1ZSA9IHRoaXMuc3RhdGUudHJhbnNsYXRvci5kZWNvZGVWYWx1ZShjbVZhbHVlKTtcbiAgICAgIHZhciBlbmNvZGVkVmFsdWUgPSB0aGlzLnN0YXRlLnRyYW5zbGF0b3IuZW5jb2RlVmFsdWUoZGVjb2RlZFZhbHVlKTtcblxuICAgICAgLy8gR3JhYiB0aGUgY3Vyc29yIHNvIHdlIGNhbiByZXNldCBpdC5cbiAgICAgIC8vIFRoZSBuZXcgbGVuZ3RoIG9mIHRoZSBDTSB2YWx1ZSB3aWxsIGJlIHNob3J0ZXIgYWZ0ZXIgcmVwbGFjaW5nIGEgdGFnIGxpa2Uge3tmaXJzdE5hbWV9fVxuICAgICAgLy8gd2l0aCBhIHNpbmdsZSBzcGVjaWFsIGNoYXIsIHNvIGFkanVzdCBjdXJzb3IgcG9zaXRpb24gYWNjb3JkaW5nbHkuXG4gICAgICB2YXIgY3Vyc29yID0gdGhpcy5jb2RlTWlycm9yLmdldEN1cnNvcigpO1xuICAgICAgY3Vyc29yLmNoIC09IGNtVmFsdWUubGVuZ3RoIC0gZW5jb2RlZFZhbHVlLmxlbmd0aDtcblxuICAgICAgdGhpcy5jb2RlTWlycm9yLnNldFZhbHVlKGVuY29kZWRWYWx1ZSk7XG4gICAgICB0aGlzLmNvZGVNaXJyb3Iuc2V0Q3Vyc29yKGN1cnNvcik7XG4gICAgfVxuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5jb2RlTWlycm9yTW9kZSkge1xuICAgICAgdGhpcy5yZW1vdmVDb2RlTWlycm9yRWRpdG9yKCk7XG4gICAgfVxuICB9LFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGVjdGVkQ2hvaWNlcyA9IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkU2VsZWN0ZWRSZXBsYWNlQ2hvaWNlcyh0aGlzLnByb3BzLmZpZWxkKTtcbiAgICB2YXIgcmVwbGFjZUNob2ljZXMgPSB0aGlzLnByb3BzLmNvbmZpZy5maWVsZFJlcGxhY2VDaG9pY2VzKHRoaXMucHJvcHMuZmllbGQpO1xuICAgIHZhciB0cmFuc2xhdG9yID0gVGFnVHJhbnNsYXRvcihzZWxlY3RlZENob2ljZXMuY29uY2F0KHJlcGxhY2VDaG9pY2VzKSwgdGhpcy5wcm9wcy5jb25maWcuaHVtYW5pemUpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHZhbHVlOiB0aGlzLnByb3BzLmZpZWxkLnZhbHVlLFxuICAgICAgY29kZU1pcnJvck1vZGU6IGZhbHNlLFxuICAgICAgaXNDaG9pY2VzT3BlbjogZmFsc2UsXG4gICAgICByZXBsYWNlQ2hvaWNlczogcmVwbGFjZUNob2ljZXMsXG4gICAgICB0cmFuc2xhdG9yOiB0cmFuc2xhdG9yXG4gICAgfTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbihuZXh0UHJvcHMpIHtcbiAgICB2YXIgc2VsZWN0ZWRDaG9pY2VzID0gdGhpcy5wcm9wcy5jb25maWcuZmllbGRTZWxlY3RlZFJlcGxhY2VDaG9pY2VzKHRoaXMucHJvcHMuZmllbGQpO1xuICAgIHZhciByZXBsYWNlQ2hvaWNlcyA9IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkUmVwbGFjZUNob2ljZXMobmV4dFByb3BzLmZpZWxkKTtcbiAgICB2YXIgbmV4dFN0YXRlID0ge1xuICAgICAgcmVwbGFjZUNob2ljZXM6IHJlcGxhY2VDaG9pY2VzLFxuICAgICAgdHJhbnNsYXRvcjogVGFnVHJhbnNsYXRvcihzZWxlY3RlZENob2ljZXMuY29uY2F0KHJlcGxhY2VDaG9pY2VzKSwgdGhpcy5wcm9wcy5jb25maWcuaHVtYW5pemUpXG4gICAgfTtcblxuICAgIGlmICh0aGlzLnN0YXRlLnZhbHVlICE9PSBuZXh0UHJvcHMuZmllbGQudmFsdWUgJiYgbmV4dFByb3BzLmZpZWxkLnZhbHVlKSB7XG4gICAgICBuZXh0U3RhdGUudmFsdWUgPSBuZXh0UHJvcHMuZmllbGQudmFsdWU7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZShuZXh0U3RhdGUpO1xuICB9LFxuXG4gIGhhbmRsZUNob2ljZVNlbGVjdGlvbjogZnVuY3Rpb24gKGtleSkge1xuICAgIHRoaXMuc2V0U3RhdGUoeyBpc0Nob2ljZXNPcGVuOiBmYWxzZSB9KTtcblxuICAgIHZhciBjaGFyID0gdGhpcy5zdGF0ZS50cmFuc2xhdG9yLmVuY29kZVRhZyhrZXkpO1xuXG4gICAgLy8gcHV0IHRoZSBjdXJzb3IgYXQgdGhlIGVuZCBvZiB0aGUgaW5zZXJ0ZWQgdGFnLlxuICAgIHRoaXMuY29kZU1pcnJvci5yZXBsYWNlU2VsZWN0aW9uKGNoYXIsICdlbmQnKTtcbiAgICB0aGlzLmNvZGVNaXJyb3IuZm9jdXMoKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG4gICAgdmFyIHByb3BzID0geyBmaWVsZDogZmllbGQsIHBsYWluOiB0aGlzLnByb3BzLnBsYWluIH07XG4gICAgdmFyIHRhYkluZGV4ID0gZmllbGQudGFiSW5kZXg7XG5cbiAgICB2YXIgdGV4dEJveENsYXNzZXMgPSBjeChfLmV4dGVuZCh7fSwgdGhpcy5wcm9wcy5jbGFzc2VzLCB7J3ByZXR0eS10ZXh0LWJveCc6IHRydWV9KSk7XG4gICAgdmFyIHRleHRCb3ggPSB0aGlzLmNyZWF0ZVRleHRCb3hOb2RlKCk7XG5cbiAgICB2YXIgaW5zZXJ0QnRuID0gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2luc2VydC1idXR0b24nLCB7cmVmOiAndG9nZ2xlJywgb25DbGljazogdGhpcy5vblRvZ2dsZUNob2ljZXN9LCAnSW5zZXJ0Li4uJyk7XG5cbiAgICB2YXIgY2hvaWNlcyA9IGNvbmZpZy5jcmVhdGVFbGVtZW50KCdjaG9pY2VzJywge1xuICAgICAgcmVmOiAnY2hvaWNlcycsXG4gICAgICBjaG9pY2VzOiB0aGlzLnN0YXRlLnJlcGxhY2VDaG9pY2VzLFxuICAgICAgb3BlbjogdGhpcy5zdGF0ZS5pc0Nob2ljZXNPcGVuLFxuICAgICAgaWdub3JlQ2xvc2VOb2RlczogdGhpcy5nZXRDbG9zZUlnbm9yZU5vZGVzLFxuICAgICAgb25TZWxlY3Q6IHRoaXMuaGFuZGxlQ2hvaWNlU2VsZWN0aW9uLFxuICAgICAgb25DbG9zZTogdGhpcy5vbkNsb3NlQ2hvaWNlc1xuICAgIH0pO1xuXG4gICAgLy8gUmVuZGVyIHJlYWQtb25seSB2ZXJzaW9uLiBXZSBhcmUgdXNpbmcgcHVyZSBIVE1MIHZpYSBkYW5nZXJvdXNseVNldElubmVySFRNTCwgdG8gYXZvaWRcbiAgICAvLyB0aGUgY29zdCBvZiB0aGUgcmVhY3Qgbm9kZXMuIFRoaXMgaXMgcHJvYmFibHkgYSBwcmVtYXR1cmUgb3B0aW1pemF0aW9uLlxuICAgIHZhciBlbGVtZW50ID0gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9J3ByZXR0eS10ZXh0LXdyYXBwZXInIG9uTW91c2VFbnRlcj17dGhpcy5zd2l0Y2hUb0NvZGVNaXJyb3J9PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17dGV4dEJveENsYXNzZXN9IHRhYkluZGV4PXt0YWJJbmRleH0gb25Gb2N1cz17dGhpcy5vbkZvY3VzQWN0aW9ufSBvbkJsdXI9e3RoaXMub25CbHVyQWN0aW9ufT5cbiAgICAgICAgICB7dGV4dEJveH1cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAge2luc2VydEJ0bn1cbiAgICAgICAge2Nob2ljZXN9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHByb3BzLCBlbGVtZW50KTtcbiAgfSxcblxuICBnZXRDbG9zZUlnbm9yZU5vZGVzOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVmcy50b2dnbGUuZ2V0RE9NTm9kZSgpO1xuICB9LFxuXG4gIG9uVG9nZ2xlQ2hvaWNlczogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc2V0Q2hvaWNlc09wZW4oIXRoaXMuc3RhdGUuaXNDaG9pY2VzT3Blbik7XG4gIH0sXG5cbiAgc2V0Q2hvaWNlc09wZW46IGZ1bmN0aW9uIChpc09wZW4pIHtcbiAgICB2YXIgYWN0aW9uID0gaXNPcGVuID8gJ29wZW4tcmVwbGFjZW1lbnRzJyA6ICdjbG9zZS1yZXBsYWNlbWVudHMnO1xuICAgIHRoaXMub25TdGFydEFjdGlvbihhY3Rpb24pO1xuICAgIHRoaXMuc2V0U3RhdGUoeyBpc0Nob2ljZXNPcGVuOiBpc09wZW4gfSk7XG4gIH0sXG5cbiAgb25DbG9zZUNob2ljZXM6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5pc0Nob2ljZXNPcGVuKSB7XG4gICAgICB0aGlzLnNldENob2ljZXNPcGVuKGZhbHNlKTtcbiAgICB9XG4gIH0sXG5cbiAgY3JlYXRlVGV4dEJveE5vZGU6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5jb2RlTWlycm9yTW9kZSkge1xuICAgICAgcmV0dXJuIDxkaXYgcmVmPVwidGV4dEJveFwiIC8+O1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgaHRtbCA9IHRoaXMuc3RhdGUudHJhbnNsYXRvci50b0h0bWwodGhpcy5zdGF0ZS52YWx1ZSk7XG4gICAgICByZXR1cm4gPGRpdiByZWY9XCJ0ZXh0Qm94XCIgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3tfX2h0bWw6IGh0bWx9fSAvPjtcbiAgICB9XG4gIH0sXG5cbiAgY3JlYXRlRWRpdG9yOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUuY29kZU1pcnJvck1vZGUpIHtcbiAgICAgIHRoaXMuY3JlYXRlQ29kZU1pcnJvckVkaXRvcigpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNyZWF0ZVJlYWRvbmx5RWRpdG9yKCk7XG4gICAgfVxuICB9LFxuXG4gIGNyZWF0ZUNvZGVNaXJyb3JFZGl0b3I6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY21WYWx1ZSA9IHRoaXMuc3RhdGUudHJhbnNsYXRvci5lbmNvZGVWYWx1ZSh0aGlzLnN0YXRlLnZhbHVlKTtcblxuICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgbGluZVdyYXBwaW5nOiB0cnVlLFxuICAgICAgdGFiaW5kZXg6IHRoaXMucHJvcHMudGFiSW5kZXgsXG4gICAgICB2YWx1ZTogY21WYWx1ZSxcbiAgICAgIHNwZWNpYWxDaGFyczogdGhpcy5zdGF0ZS50cmFuc2xhdG9yLnNwZWNpYWxDaGFyc1JlZ2V4cCxcbiAgICAgIHNwZWNpYWxDaGFyUGxhY2Vob2xkZXI6IHRoaXMuY3JlYXRlVGFnTm9kZSxcbiAgICAgIGV4dHJhS2V5czoge1xuICAgICAgICBUYWI6IGZhbHNlXG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciB0ZXh0Qm94ID0gdGhpcy5yZWZzLnRleHRCb3guZ2V0RE9NTm9kZSgpO1xuICAgIHRleHRCb3guaW5uZXJIVE1MID0gJyc7IC8vIHJlbGVhc2UgYW55IHByZXZpb3VzIHJlYWQtb25seSBjb250ZW50IHNvIGl0IGNhbiBiZSBHQydlZFxuXG4gICAgdGhpcy5jb2RlTWlycm9yID0gQ29kZU1pcnJvcih0ZXh0Qm94LCBvcHRpb25zKTtcbiAgICB0aGlzLmNvZGVNaXJyb3Iub24oJ2NoYW5nZScsIHRoaXMub25Db2RlTWlycm9yQ2hhbmdlKTtcbiAgfSxcblxuICBvbkNvZGVNaXJyb3JDaGFuZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy51cGRhdGluZ0NvZGVNaXJyb3IpIHtcbiAgICAgIC8vIGF2b2lkIHJlY3Vyc2l2ZSB1cGRhdGUgY3ljbGUsIGFuZCBtYXJrIHRoZSBjb2RlIG1pcnJvciBtYW51YWwgdXBkYXRlIGFzIGRvbmVcbiAgICAgIHRoaXMudXBkYXRpbmdDb2RlTWlycm9yID0gZmFsc2U7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIG5ld1ZhbHVlID0gdGhpcy5zdGF0ZS50cmFuc2xhdG9yLmRlY29kZVZhbHVlKHRoaXMuY29kZU1pcnJvci5nZXRWYWx1ZSgpKTtcbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUobmV3VmFsdWUpO1xuICAgIHRoaXMuc2V0U3RhdGUoe3ZhbHVlOiBuZXdWYWx1ZX0pO1xuICB9LFxuXG4gIGNyZWF0ZVJlYWRvbmx5RWRpdG9yOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRleHRCb3hOb2RlID0gdGhpcy5yZWZzLnRleHRCb3guZ2V0RE9NTm9kZSgpO1xuICAgIHRleHRCb3hOb2RlLmlubmVySFRNTCA9IHRoaXMuc3RhdGUudHJhbnNsYXRvci50b0h0bWwodGhpcy5zdGF0ZS52YWx1ZSk7XG4gIH0sXG5cbiAgcmVtb3ZlQ29kZU1pcnJvckVkaXRvcjogZnVuY3Rpb24gKCkge1xuICAgIHZhciB0ZXh0Qm94Tm9kZSA9IHRoaXMucmVmcy50ZXh0Qm94LmdldERPTU5vZGUoKTtcbiAgICB2YXIgY21Ob2RlID0gdGV4dEJveE5vZGUuZmlyc3RDaGlsZDtcbiAgICB0ZXh0Qm94Tm9kZS5yZW1vdmVDaGlsZChjbU5vZGUpO1xuICAgIHRoaXMuY29kZU1pcnJvciA9IG51bGw7XG4gIH0sXG5cbiAgc3dpdGNoVG9Db2RlTWlycm9yOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLnN0YXRlLmNvZGVNaXJyb3JNb2RlKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtjb2RlTWlycm9yTW9kZTogdHJ1ZX0pO1xuICAgIH1cbiAgfSxcblxuICAvLyBDcmVhdGUgcGlsbCBib3ggc3R5bGUgZm9yIGRpc3BsYXkgaW5zaWRlIENNLiBGb3IgZXhhbXBsZVxuICAvLyAnXFx1ZTAwMCcgYmVjb21lcyAnPHNwYW4gY2xhc3M9XCJ0YWc+Rmlyc3QgTmFtZTwvc3Bhbj4nXG4gIGNyZWF0ZVRhZ05vZGU6IGZ1bmN0aW9uIChjaGFyKSB7XG4gICAgdmFyIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgdmFyIGxhYmVsID0gdGhpcy5zdGF0ZS50cmFuc2xhdG9yLmRlY29kZUNoYXIoY2hhcik7XG5cbiAgICBSZWFjdC5yZW5kZXIoXG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJwcmV0dHktcGFydFwiIG9uQ2xpY2s9e3RoaXMub25Ub2dnbGVDaG9pY2VzfT57bGFiZWx9PC9zcGFuPixcbiAgICAgIG5vZGVcbiAgICApO1xuICAgIHJldHVybiBub2RlO1xuICB9XG59KTtcbiIsIi8vICMgc2VsZWN0IGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIHNlbGVjdCBlbGVtZW50IHRvIGdpdmUgYSB1c2VyIGNob2ljZXMgZm9yIHRoZSB2YWx1ZSBvZiBhIGZpZWxkLiBOb3RlXG5pdCBzaG91bGQgc3VwcG9ydCB2YWx1ZXMgb3RoZXIgdGhhbiBzdHJpbmdzLiBDdXJyZW50bHkgdGhpcyBpcyBvbmx5IHRlc3RlZCBmb3JcbmJvb2xlYW4gdmFsdWVzLCBidXQgaXQgX3Nob3VsZF8gd29yayBmb3Igb3RoZXIgdmFsdWVzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdTZWxlY3QnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY2hvaWNlczogdGhpcy5wcm9wcy5jb25maWcuZmllbGRDaG9pY2VzKHRoaXMucHJvcHMuZmllbGQpXG4gICAgfTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV3UHJvcHMpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGNob2ljZXM6IG5ld1Byb3BzLmNvbmZpZy5maWVsZENob2ljZXMobmV3UHJvcHMuZmllbGQpXG4gICAgfSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHtcbiAgICAgIGNvbmZpZzogY29uZmlnLCBmaWVsZDogZmllbGQsIHBsYWluOiB0aGlzLnByb3BzLnBsYWluXG4gICAgfSwgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ3NlbGVjdC12YWx1ZScsIHtcbiAgICAgIGNob2ljZXM6IHRoaXMuc3RhdGUuY2hvaWNlcywgZmllbGQ6IGZpZWxkLCBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZVZhbHVlLCBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvblxuICAgIH0pKTtcbiAgfVxufSk7XG4iLCIvLyAjIHNpbmdsZS1saW5lLXN0cmluZyBjb21wb25lbnRcblxuLypcblJlbmRlciBhIHNpbmdsZSBsaW5lIHRleHQgaW5wdXQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnU2luZ2xlTGluZVN0cmluZycsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywge1xuICAgICAgY29uZmlnOiBjb25maWcsIGZpZWxkOiBmaWVsZCwgcGxhaW46IHRoaXMucHJvcHMucGxhaW5cbiAgICB9LCBSLmlucHV0KHtcbiAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgIHZhbHVlOiB0aGlzLnByb3BzLmZpZWxkLnZhbHVlLFxuICAgICAgY2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpLFxuICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsXG4gICAgICBvbkZvY3VzOiB0aGlzLm9uRm9jdXNBY3Rpb24sXG4gICAgICBvbkJsdXI6IHRoaXMub25CbHVyQWN0aW9uXG4gICAgfSkpO1xuICB9XG59KTtcbiIsIi8vICMgc3RyaW5nIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIGEgZmllbGQgdGhhdCBjYW4gZWRpdCBhIHN0cmluZyB2YWx1ZS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdTdHJpbmcnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICBvbkNoYW5nZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdGhpcy5vbkNoYW5nZVZhbHVlKGV2ZW50LnRhcmdldC52YWx1ZSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHtcbiAgICAgIGNvbmZpZzogY29uZmlnLCBmaWVsZDogZmllbGQsIHBsYWluOiB0aGlzLnByb3BzLnBsYWluXG4gICAgfSwgUi50ZXh0YXJlYSh7XG4gICAgICB2YWx1ZTogZmllbGQudmFsdWUsXG4gICAgICBjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcyksXG4gICAgICByb3dzOiBmaWVsZC5yb3dzIHx8IHRoaXMucHJvcHMucm93cyxcbiAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgb25Gb2N1czogdGhpcy5vbkZvY3VzQWN0aW9uLFxuICAgICAgb25CbHVyOiB0aGlzLm9uQmx1ckFjdGlvblxuICAgIH0pKTtcbiAgfVxufSk7XG4iLCIvLyAjIHVua25vd24gY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgYSBmaWVsZCB3aXRoIGFuIHVua25vd24gdHlwZS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdVbmtub3duJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUi5kaXYoe30sXG4gICAgICBSLmRpdih7fSwgJ0NvbXBvbmVudCBub3QgZm91bmQgZm9yOiAnKSxcbiAgICAgIFIucHJlKHt9LCBKU09OLnN0cmluZ2lmeSh0aGlzLnByb3BzLmZpZWxkLnJhd0ZpZWxkVGVtcGxhdGUsIG51bGwsIDIpKVxuICAgICk7XG4gIH1cblxufSk7XG4iLCIvLyAjIGFkZC1pdGVtIGNvbXBvbmVudFxuXG4vKlxuVGhlIGFkZCBidXR0b24gdG8gYXBwZW5kIGFuIGl0ZW0gdG8gYSBmaWVsZC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdBZGRJdGVtJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBsYWJlbDogJ1thZGRdJ1xuICAgIH07XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUi5zcGFuKHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcyksIG9uQ2xpY2s6IHRoaXMucHJvcHMub25DbGlja30sIHRoaXMucHJvcHMubGFiZWwpO1xuICB9XG59KTtcbiIsIi8vICMgYXJyYXktY29udHJvbCBjb21wb25lbnRcblxuLypcblJlbmRlciB0aGUgaXRlbSB0eXBlIGNob2ljZXMgYW5kIHRoZSBhZGQgYnV0dG9uIGZvciBhbiBhcnJheS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdBcnJheUNvbnRyb2wnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZpZWxkVGVtcGxhdGVJbmRleDogMFxuICAgIH07XG4gIH0sXG5cbiAgb25TZWxlY3Q6IGZ1bmN0aW9uIChpbmRleCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZmllbGRUZW1wbGF0ZUluZGV4OiBpbmRleFxuICAgIH0pO1xuICB9LFxuXG4gIG9uQXBwZW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5wcm9wcy5vbkFwcGVuZCh0aGlzLnN0YXRlLmZpZWxkVGVtcGxhdGVJbmRleCk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblxuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG4gICAgdmFyIGZpZWxkVGVtcGxhdGVzID0gY29uZmlnLmZpZWxkSXRlbUZpZWxkVGVtcGxhdGVzKGZpZWxkKTtcblxuICAgIHZhciB0eXBlQ2hvaWNlcyA9IG51bGw7XG5cbiAgICBpZiAoZmllbGRUZW1wbGF0ZXMubGVuZ3RoID4gMCkge1xuICAgICAgdHlwZUNob2ljZXMgPSBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQtdGVtcGxhdGUtY2hvaWNlcycsIHtcbiAgICAgICAgZmllbGQ6IGZpZWxkLCBmaWVsZFRlbXBsYXRlSW5kZXg6IHRoaXMuc3RhdGUuZmllbGRUZW1wbGF0ZUluZGV4LCBvblNlbGVjdDogdGhpcy5vblNlbGVjdFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3Nlcyl9LFxuICAgICAgdHlwZUNob2ljZXMsICcgJyxcbiAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdhZGQtaXRlbScsIHtmaWVsZDogZmllbGQsIG9uQ2xpY2s6IHRoaXMub25BcHBlbmR9KVxuICAgICk7XG4gIH1cbn0pO1xuIiwiLy8gIyBhcnJheS1pdGVtLWNvbnRyb2wgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgdGhlIHJlbW92ZSBhbmQgbW92ZSBidXR0b25zIGZvciBhbiBhcnJheSBmaWVsZC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0FycmF5SXRlbUNvbnRyb2wnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgb25Nb3ZlQmFjazogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucHJvcHMub25Nb3ZlKHRoaXMucHJvcHMuaW5kZXgsIHRoaXMucHJvcHMuaW5kZXggLSAxKTtcbiAgfSxcblxuICBvbk1vdmVGb3J3YXJkOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5wcm9wcy5vbk1vdmUodGhpcy5wcm9wcy5pbmRleCwgdGhpcy5wcm9wcy5pbmRleCArIDEpO1xuICB9LFxuXG4gIG9uUmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5wcm9wcy5vblJlbW92ZSh0aGlzLnByb3BzLmluZGV4KTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3Nlcyl9LFxuICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ3JlbW92ZS1pdGVtJywge2ZpZWxkOiBmaWVsZCwgb25DbGljazogdGhpcy5vblJlbW92ZSwgb25NYXliZVJlbW92ZTogdGhpcy5wcm9wcy5vbk1heWJlUmVtb3ZlfSksXG4gICAgICB0aGlzLnByb3BzLmluZGV4ID4gMCA/IGNvbmZpZy5jcmVhdGVFbGVtZW50KCdtb3ZlLWl0ZW0tYmFjaycsIHtmaWVsZDogZmllbGQsIG9uQ2xpY2s6IHRoaXMub25Nb3ZlQmFja30pIDogbnVsbCxcbiAgICAgIHRoaXMucHJvcHMuaW5kZXggPCAodGhpcy5wcm9wcy5udW1JdGVtcyAtIDEpID8gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ21vdmUtaXRlbS1mb3J3YXJkJywge2ZpZWxkOiBmaWVsZCwgb25DbGljazogdGhpcy5vbk1vdmVGb3J3YXJkfSkgOiBudWxsXG4gICAgKTtcbiAgfVxufSk7XG4iLCIvLyAjIGFycmF5LWl0ZW0tdmFsdWUgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgdGhlIHZhbHVlIG9mIGFuIGFycmF5IGl0ZW0uXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdBcnJheUl0ZW1WYWx1ZScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBvbkNoYW5nZUZpZWxkOiBmdW5jdGlvbiAobmV3VmFsdWUsIGluZm8pIHtcbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHRoaXMucHJvcHMuaW5kZXgsIG5ld1ZhbHVlLCBpbmZvKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3Nlcyl9LFxuICAgICAgY29uZmlnLmNyZWF0ZUZpZWxkRWxlbWVudCh7ZmllbGQ6IGZpZWxkLCBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZUZpZWxkLCBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvbn0pXG4gICAgKTtcbiAgfVxufSk7XG4iLCIvLyAjIGFycmF5LWl0ZW0gY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgYW4gYXJyYXkgaXRlbS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xudmFyIF8gPSByZXF1aXJlKCd1bmRlcnNjb3JlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnQXJyYXlJdGVtJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpc01heWJlUmVtb3Zpbmc6IGZhbHNlXG4gICAgfTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgb25NYXliZVJlbW92ZTogZnVuY3Rpb24gKGlzTWF5YmVSZW1vdmluZykge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgaXNNYXliZVJlbW92aW5nOiBpc01heWJlUmVtb3ZpbmdcbiAgICB9KTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICB2YXIgY2xhc3NlcyA9IF8uZXh0ZW5kKHt9LCB0aGlzLnByb3BzLmNsYXNzZXMpO1xuXG4gICAgaWYgKHRoaXMuc3RhdGUuaXNNYXliZVJlbW92aW5nKSB7XG4gICAgICBjbGFzc2VzWydtYXliZS1yZW1vdmluZyddID0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogY3goY2xhc3Nlcyl9LFxuICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2FycmF5LWl0ZW0tdmFsdWUnLCB7ZmllbGQ6IGZpZWxkLCBpbmRleDogdGhpcy5wcm9wcy5pbmRleCxcbiAgICAgICAgb25DaGFuZ2U6IHRoaXMucHJvcHMub25DaGFuZ2UsIG9uQWN0aW9uOiB0aGlzLm9uQnViYmxlQWN0aW9ufSksXG4gICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgnYXJyYXktaXRlbS1jb250cm9sJywge2ZpZWxkOiBmaWVsZCwgaW5kZXg6IHRoaXMucHJvcHMuaW5kZXgsIG51bUl0ZW1zOiB0aGlzLnByb3BzLm51bUl0ZW1zLFxuICAgICAgICBvbk1vdmU6IHRoaXMucHJvcHMub25Nb3ZlLCBvblJlbW92ZTogdGhpcy5wcm9wcy5vblJlbW92ZSwgb25NYXliZVJlbW92ZTogdGhpcy5vbk1heWJlUmVtb3ZlfSlcbiAgICApO1xuICB9XG59KTtcbiIsIi8vICMgQ2hvaWNlcyBjb21wb25lbnRcblxuLypcblJlbmRlciBjdXN0b21pemVkIChub24tbmF0aXZlKSBkcm9wZG93biBjaG9pY2VzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIF8gPSByZXF1aXJlKCd1bmRlcnNjb3JlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnQ2hvaWNlcycsXG5cbiAgbWl4aW5zOiBbXG4gICAgcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpLFxuICAgIC8vcGx1Z2luLnJlcXVpcmUoJ21peGluLnJlc2l6ZScpLFxuICAgIC8vcGx1Z2luLnJlcXVpcmUoJ21peGluLnNjcm9sbCcpLFxuICAgIHJlcXVpcmUoJy4uLy4uL21peGlucy9jbGljay1vdXRzaWRlJylcbiAgXSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbWF4SGVpZ2h0OiBudWxsLFxuICAgICAgb3BlbjogdGhpcy5wcm9wcy5vcGVuXG4gICAgfTtcbiAgfSxcblxuICBnZXRJZ25vcmVDbG9zZU5vZGVzOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLnByb3BzLmlnbm9yZUNsb3NlTm9kZXMpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgdmFyIG5vZGVzID0gdGhpcy5wcm9wcy5pZ25vcmVDbG9zZU5vZGVzKCk7XG4gICAgaWYgKCFfLmlzQXJyYXkobm9kZXMpKSB7XG4gICAgICBub2RlcyA9IFtub2Rlc107XG4gICAgfVxuICAgIHJldHVybiBub2RlcztcbiAgfSxcblxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc2V0T25DbGlja091dHNpZGUoJ2Nob2ljZXMnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblxuICAgICAgLy8gTWFrZSBzdXJlIHdlIGRvbid0IGZpbmQgYW55IG5vZGVzIHRvIGlnbm9yZS5cbiAgICAgIGlmICghXy5maW5kKHRoaXMuZ2V0SWdub3JlQ2xvc2VOb2RlcygpLCBmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc05vZGVJbnNpZGUoZXZlbnQudGFyZ2V0LCBub2RlKTtcbiAgICAgIH0uYmluZCh0aGlzKSkpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkNsb3NlKCk7XG4gICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuYWRqdXN0U2l6ZSgpO1xuICB9LFxuXG4gIG9uU2VsZWN0OiBmdW5jdGlvbiAoY2hvaWNlKSB7XG4gICAgdGhpcy5wcm9wcy5vblNlbGVjdChjaG9pY2UudmFsdWUpO1xuICB9LFxuXG4gIG9uQ2hvaWNlQWN0aW9uOiBmdW5jdGlvbiAoY2hvaWNlKSB7XG4gICAgdGhpcy5wcm9wcy5vbkNob2ljZUFjdGlvbihjaG9pY2UpO1xuICB9LFxuXG4gIG9uUmVzaXplV2luZG93OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5hZGp1c3RTaXplKCk7XG4gIH0sXG5cbiAgb25TY3JvbGxXaW5kb3c6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmFkanVzdFNpemUoKTtcbiAgfSxcblxuICBhZGp1c3RTaXplOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMucmVmcy5jaG9pY2VzKSB7XG4gICAgICB2YXIgbm9kZSA9IHRoaXMucmVmcy5jaG9pY2VzLmdldERPTU5vZGUoKTtcbiAgICAgIHZhciByZWN0ID0gbm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIHZhciB0b3AgPSByZWN0LnRvcDtcbiAgICAgIHZhciB3aW5kb3dIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgICB2YXIgaGVpZ2h0ID0gd2luZG93SGVpZ2h0IC0gdG9wO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIG1heEhlaWdodDogaGVpZ2h0XG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gKG5leHRQcm9wcykge1xuICAgIHRoaXMuc2V0U3RhdGUoe29wZW46IG5leHRQcm9wcy5vcGVufSwgZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5hZGp1c3RTaXplKCk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfSxcblxuICBvblNjcm9sbDogZnVuY3Rpb24gKCkge1xuICAgIC8vIGNvbnNvbGUubG9nKCdzdG9wIHRoYXQhJylcbiAgICAvLyBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIC8vIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICB9LFxuXG4gIG9uV2hlZWw6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIC8vIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuXG4gICAgdmFyIGNob2ljZXMgPSB0aGlzLnByb3BzLmNob2ljZXM7XG5cbiAgICBpZiAoY2hvaWNlcyAmJiBjaG9pY2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY2hvaWNlcyA9IFt7dmFsdWU6ICcvLy9lbXB0eS8vLyd9XTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5wcm9wcy5vcGVuKSB7XG4gICAgICByZXR1cm4gUi5kaXYoe3JlZjogJ2NvbnRhaW5lcicsIG9uV2hlZWw6IHRoaXMub25XaGVlbCwgb25TY3JvbGw6IHRoaXMub25TY3JvbGwsXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ2Nob2ljZXMtY29udGFpbmVyJywgc3R5bGU6IHtcbiAgICAgICAgdXNlclNlbGVjdDogJ25vbmUnLCBXZWJraXRVc2VyU2VsZWN0OiAnbm9uZScsIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICBtYXhIZWlnaHQ6IHRoaXMuc3RhdGUubWF4SGVpZ2h0ID8gdGhpcy5zdGF0ZS5tYXhIZWlnaHQgOiBudWxsXG4gICAgICB9fSxcbiAgICAgICAgY29uZmlnLmNzc1RyYW5zaXRpb25XcmFwcGVyKFxuICAgICAgICAgIFIudWwoe3JlZjogJ2Nob2ljZXMnLCBjbGFzc05hbWU6ICdjaG9pY2VzJ30sXG4gICAgICAgICAgICBjaG9pY2VzLm1hcChmdW5jdGlvbiAoY2hvaWNlLCBpKSB7XG5cbiAgICAgICAgICAgICAgdmFyIGNob2ljZUVsZW1lbnQgPSBudWxsO1xuXG4gICAgICAgICAgICAgIGlmIChjaG9pY2UudmFsdWUgPT09ICcvLy9sb2FkaW5nLy8vJykge1xuICAgICAgICAgICAgICAgIGNob2ljZUVsZW1lbnQgPSBSLmEoe2hyZWY6ICdKYXZhU2NyaXB0JyArICc6Jywgb25DbGljazogdGhpcy5wcm9wcy5vbkNsb3NlfSxcbiAgICAgICAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAnY2hvaWNlLWxhYmVsJ30sXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdsb2FkaW5nLWNob2ljZScsIHtmaWVsZDogdGhpcy5wcm9wcy5maWVsZH0pXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaG9pY2UudmFsdWUgPT09ICcvLy9lbXB0eS8vLycpIHtcbiAgICAgICAgICAgICAgICBjaG9pY2VFbGVtZW50ID0gUi5hKHtocmVmOiAnSmF2YVNjcmlwdCcgKyAnOicsIG9uQ2xpY2s6IHRoaXMucHJvcHMub25DbG9zZX0sXG4gICAgICAgICAgICAgICAgICBSLnNwYW4oe2NsYXNzTmFtZTogJ2Nob2ljZS1sYWJlbCd9LFxuICAgICAgICAgICAgICAgICAgICAnTm8gY2hvaWNlcyBhdmFpbGFibGUuJ1xuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hvaWNlLmFjdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciBsYWJlbENsYXNzZXMgPSAnY2hvaWNlLWxhYmVsICcgKyBjaG9pY2UuYWN0aW9uO1xuXG4gICAgICAgICAgICAgICAgY2hvaWNlRWxlbWVudCA9IFIuYSh7aHJlZjogJ0phdmFTY3JpcHQnICsgJzonLCBvbkNsaWNrOiB0aGlzLm9uQ2hvaWNlQWN0aW9uLmJpbmQodGhpcywgY2hvaWNlKX0sXG4gICAgICAgICAgICAgICAgICBSLnNwYW4oe2NsYXNzTmFtZTogbGFiZWxDbGFzc2VzfSxcbiAgICAgICAgICAgICAgICAgICAgY2hvaWNlLmxhYmVsIHx8IHRoaXMucHJvcHMuY29uZmlnLmFjdGlvbkNob2ljZUxhYmVsKGNob2ljZS5hY3Rpb24pXG4gICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5jb25maWcuY3JlYXRlRWxlbWVudCgnY2hvaWNlLWFjdGlvbi1zYW1wbGUnLCB7YWN0aW9uOiBjaG9pY2UuYWN0aW9uLCBjaG9pY2U6IGNob2ljZX0pXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjaG9pY2VFbGVtZW50ID0gUi5hKHtocmVmOiAnSmF2YVNjcmlwdCcgKyAnOicsIG9uQ2xpY2s6IHRoaXMub25TZWxlY3QuYmluZCh0aGlzLCBjaG9pY2UpfSxcbiAgICAgICAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAnY2hvaWNlLWxhYmVsJ30sXG4gICAgICAgICAgICAgICAgICAgIGNob2ljZS5sYWJlbFxuICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAnY2hvaWNlLXNhbXBsZSd9LFxuICAgICAgICAgICAgICAgICAgICBjaG9pY2Uuc2FtcGxlXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHJldHVybiBSLmxpKHtrZXk6IGksIGNsYXNzTmFtZTogJ2Nob2ljZSd9LFxuICAgICAgICAgICAgICAgIGNob2ljZUVsZW1lbnRcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gbm90IG9wZW5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufSk7XG4iLCIvLyAjIGZpZWxkLXRlbXBsYXRlLWNob2ljZXMgY29tcG9uZW50XG5cbi8qXG5HaXZlIGEgbGlzdCBvZiBjaG9pY2VzIG9mIGl0ZW0gdHlwZXMgdG8gY3JlYXRlIGFzIGNoaWxkcmVuIG9mIGFuIGZpZWxkLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0ZpZWxkVGVtcGxhdGVDaG9pY2VzJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB0aGlzLnByb3BzLm9uU2VsZWN0KHBhcnNlSW50KGV2ZW50LnRhcmdldC52YWx1ZSkpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHZhciBmaWVsZFRlbXBsYXRlcyA9IGNvbmZpZy5maWVsZEl0ZW1GaWVsZFRlbXBsYXRlcyhmaWVsZCk7XG5cbiAgICB2YXIgdHlwZUNob2ljZXMgPSBudWxsO1xuICAgIGlmIChmaWVsZFRlbXBsYXRlcy5sZW5ndGggPiAxKSB7XG4gICAgICB0eXBlQ2hvaWNlcyA9IFIuc2VsZWN0KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcyksIHZhbHVlOiB0aGlzLmZpZWxkVGVtcGxhdGVJbmRleCwgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2V9LFxuICAgICAgZmllbGRUZW1wbGF0ZXMubWFwKGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlLCBpKSB7XG4gICAgICAgIHJldHVybiBSLm9wdGlvbih7a2V5OiBpLCB2YWx1ZTogaX0sIGZpZWxkVGVtcGxhdGUubGFiZWwgfHwgaSk7XG4gICAgICB9KSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHR5cGVDaG9pY2VzID8gdHlwZUNob2ljZXMgOiBSLnNwYW4obnVsbCk7XG4gIH1cbn0pO1xuIiwiLy8gIyBmaWVsZCBjb21wb25lbnRcblxuLypcblVzZWQgYnkgYW55IGZpZWxkcyB0byBwdXQgdGhlIGxhYmVsIGFuZCBoZWxwIHRleHQgYXJvdW5kIHRoZSBmaWVsZC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBfID0gcmVxdWlyZSgnLi4vLi4vdW5kYXNoJyk7XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnRmllbGQnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbGxhcHNlZDogdGhpcy5wcm9wcy5jb25maWcuZmllbGRJc0NvbGxhcHNlZCh0aGlzLnByb3BzLmZpZWxkKSA/IHRydWUgOiBmYWxzZVxuICAgIH07XG4gIH0sXG5cbiAgb25DbGlja0xhYmVsOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjb2xsYXBzZWQ6ICF0aGlzLnN0YXRlLmNvbGxhcHNlZFxuICAgIH0pO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG5cbiAgICBpZiAodGhpcy5wcm9wcy5wbGFpbikge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMuY2hpbGRyZW47XG4gICAgfVxuXG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHZhciBpbmRleCA9IHRoaXMucHJvcHMuaW5kZXg7XG4gICAgaWYgKCFfLmlzTnVtYmVyKGluZGV4KSkge1xuICAgICAgdmFyIGtleSA9IHRoaXMucHJvcHMuZmllbGQua2V5O1xuICAgICAgaW5kZXggPSBfLmlzTnVtYmVyKGtleSkgPyBrZXkgOiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgdmFyIGNsYXNzZXMgPSBfLmV4dGVuZCh7fSwgdGhpcy5wcm9wcy5jbGFzc2VzKTtcblxuICAgIHZhciBlcnJvcnMgPSBjb25maWcuZmllbGRFcnJvcnMoZmllbGQpO1xuXG4gICAgZXJyb3JzLmZvckVhY2goZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICBjbGFzc2VzWyd2YWxpZGF0aW9uLWVycm9yLScgKyBlcnJvci50eXBlXSA9IHRydWU7XG4gICAgfSk7XG5cbiAgICBpZiAoY29uZmlnLmZpZWxkSXNSZXF1aXJlZChmaWVsZCkpIHtcbiAgICAgIGNsYXNzZXMucmVxdWlyZWQgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBjbGFzc2VzLm9wdGlvbmFsID0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogY3goY2xhc3NlcyksIHN0eWxlOiB7ZGlzcGxheTogKGZpZWxkLmhpZGRlbiA/ICdub25lJyA6ICcnKX19LFxuICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJywge1xuICAgICAgICBjb25maWc6IGNvbmZpZywgZmllbGQ6IGZpZWxkLFxuICAgICAgICBpbmRleDogaW5kZXgsIG9uQ2xpY2s6IGNvbmZpZy5maWVsZElzQ29sbGFwc2libGUoZmllbGQpID8gdGhpcy5vbkNsaWNrTGFiZWwgOiBudWxsXG4gICAgICB9KSxcbiAgICAgIGNvbmZpZy5jc3NUcmFuc2l0aW9uV3JhcHBlcihcbiAgICAgICAgdGhpcy5zdGF0ZS5jb2xsYXBzZWQgPyBbXSA6IFtcbiAgICAgICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgnaGVscCcsIHtcbiAgICAgICAgICAgIGNvbmZpZzogY29uZmlnLCBmaWVsZDogZmllbGQsXG4gICAgICAgICAgICBrZXk6ICdoZWxwJ1xuICAgICAgICAgIH0pLFxuICAgICAgICAgIHRoaXMucHJvcHMuY2hpbGRyZW5cbiAgICAgICAgXVxuICAgICAgKVxuICAgICk7XG4gIH1cbn0pO1xuIiwiLy8gIyBoZWxwIGNvbXBvbmVudFxuXG4vKlxuSnVzdCB0aGUgaGVscCB0ZXh0IGJsb2NrLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0hlbHAnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBoZWxwVGV4dCA9IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkSGVscFRleHQodGhpcy5wcm9wcy5maWVsZCk7XG5cbiAgICByZXR1cm4gaGVscFRleHQgP1xuICAgICAgUi5kaXYoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSwgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw6IHtfX2h0bWw6IGhlbHBUZXh0fX0pIDpcbiAgICAgIFIuc3BhbihudWxsKTtcbiAgfVxufSk7XG4iLCIvLyAjIGJ1dHRvbiBjb21wb25lbnRcblxuLypcbiAgQ2xpY2thYmxlICdidXR0b24nXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgcHJvcFR5cGVzOiB7XG4gICAgb25DbGljazogUmVhY3QuUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICByZWY6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmdcbiAgfSxcblxuICBkaXNwbGF5TmFtZTogJ0luc2VydEJ1dHRvbicsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8YSByZWY9e3RoaXMucHJvcHMucmVmfSBocmVmPXsnSmF2YVNjcmlwdCcgKyAnOid9IG9uQ2xpY2s9e3RoaXMucHJvcHMub25DbGlja30+XG4gICAgICAgIHt0aGlzLnByb3BzLmNoaWxkcmVufVxuICAgICAgPC9hPlxuICAgICk7XG4gIH1cblxufSk7XG4iLCIvLyAjIGxhYmVsIGNvbXBvbmVudFxuXG4vKlxuSnVzdCB0aGUgbGFiZWwgZm9yIGEgZmllbGQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnTGFiZWwnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHZhciBmaWVsZExhYmVsID0gY29uZmlnLmZpZWxkTGFiZWwoZmllbGQpO1xuXG4gICAgdmFyIGxhYmVsID0gbnVsbDtcbiAgICBpZiAodHlwZW9mIHRoaXMucHJvcHMuaW5kZXggPT09ICdudW1iZXInKSB7XG4gICAgICBsYWJlbCA9ICcnICsgKHRoaXMucHJvcHMuaW5kZXggKyAxKSArICcuJztcbiAgICAgIGlmIChmaWVsZExhYmVsKSB7XG4gICAgICAgIGxhYmVsID0gbGFiZWwgKyAnICcgKyBmaWVsZExhYmVsO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChmaWVsZExhYmVsIHx8IGxhYmVsKSB7XG4gICAgICB2YXIgdGV4dCA9IGxhYmVsIHx8IGZpZWxkTGFiZWw7XG4gICAgICBpZiAodGhpcy5wcm9wcy5vbkNsaWNrKSB7XG4gICAgICAgIHRleHQgPSBSLmEoe2hyZWY6ICdKYXZhU2NyaXB0JyArICc6Jywgb25DbGljazogdGhpcy5wcm9wcy5vbkNsaWNrfSwgdGV4dCk7XG4gICAgICB9XG4gICAgICBsYWJlbCA9IFIubGFiZWwoe30sIHRleHQpO1xuICAgIH1cblxuICAgIHZhciByZXF1aXJlZE9yTm90O1xuXG4gICAgaWYgKCFjb25maWcuZmllbGRIYXNWYWx1ZUNoaWxkcmVuKGZpZWxkKSkge1xuICAgICAgcmVxdWlyZWRPck5vdCA9IFIuc3Bhbih7XG4gICAgICAgIGNsYXNzTmFtZTogY29uZmlnLmZpZWxkSXNSZXF1aXJlZChmaWVsZCkgPyAncmVxdWlyZWQtdGV4dCcgOiAnbm90LXJlcXVpcmVkLXRleHQnXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gUi5kaXYoe1xuICAgICAgY2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpXG4gICAgfSxcbiAgICAgIGxhYmVsLFxuICAgICAgJyAnLFxuICAgICAgcmVxdWlyZWRPck5vdFxuICAgICk7XG4gIH1cbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiAnTG9hZGluZ0Nob2ljZScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8c3Bhbj5Mb2FkaW5nIGNob2ljZXMuLi48L3NwYW4+XG4gICAgKTtcbiAgfVxuXG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogJ0xvYWRpbmdDaG9pY2VzJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+TG9hZGluZyBjaG9pY2VzLi4uPC9kaXY+XG4gICAgKTtcbiAgfVxuXG59KTtcbiIsIi8vICMgbW92ZS1pdGVtLWJhY2sgY29tcG9uZW50XG5cbi8qXG5CdXR0b24gdG8gbW92ZSBhbiBpdGVtIGJhY2t3YXJkcyBpbiBsaXN0LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ01vdmVJdGVtQmFjaycsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGFiZWw6ICdbdXBdJ1xuICAgIH07XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUi5zcGFuKHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcyksIG9uQ2xpY2s6IHRoaXMucHJvcHMub25DbGlja30sIHRoaXMucHJvcHMubGFiZWwpO1xuICB9XG59KTtcbiIsIi8vICMgbW92ZS1pdGVtLWZvcndhcmQgY29tcG9uZW50XG5cbi8qXG5CdXR0b24gdG8gbW92ZSBhbiBpdGVtIGZvcndhcmQgaW4gYSBsaXN0LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ01vdmVJdGVtRm9yd2FyZCcsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGFiZWw6ICdbZG93bl0nXG4gICAgfTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSLnNwYW4oe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSwgb25DbGljazogdGhpcy5wcm9wcy5vbkNsaWNrfSwgdGhpcy5wcm9wcy5sYWJlbCk7XG4gIH1cbn0pO1xuIiwiLy8gIyBvYmplY3QtY29udHJvbCBjb21wb25lbnRcblxuLypcblJlbmRlciB0aGUgaXRlbSB0eXBlIGNob2ljZXMgYW5kIHRoZSBhZGQgYnV0dG9uLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ09iamVjdENvbnRyb2wnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZpZWxkVGVtcGxhdGVJbmRleDogMFxuICAgIH07XG4gIH0sXG5cbiAgb25TZWxlY3Q6IGZ1bmN0aW9uIChpbmRleCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZmllbGRUZW1wbGF0ZUluZGV4OiBpbmRleFxuICAgIH0pO1xuICB9LFxuXG4gIG9uQXBwZW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5wcm9wcy5vbkFwcGVuZCh0aGlzLnN0YXRlLmZpZWxkVGVtcGxhdGVJbmRleCk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcbiAgICB2YXIgZmllbGRUZW1wbGF0ZXMgPSBjb25maWcuZmllbGRDaGlsZEZpZWxkVGVtcGxhdGVzKGZpZWxkKTtcblxuICAgIHZhciB0eXBlQ2hvaWNlcyA9IG51bGw7XG5cbiAgICBpZiAoZmllbGRUZW1wbGF0ZXMubGVuZ3RoID4gMCkge1xuICAgICAgdHlwZUNob2ljZXMgPSBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQtdGVtcGxhdGUtY2hvaWNlcycsIHtcbiAgICAgICAgZmllbGQ6IGZpZWxkLFxuICAgICAgICBmaWVsZFRlbXBsYXRlSW5kZXg6IHRoaXMuc3RhdGUuZmllbGRUZW1wbGF0ZUluZGV4LCBvblNlbGVjdDogdGhpcy5vblNlbGVjdFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3Nlcyl9LFxuICAgICAgdHlwZUNob2ljZXMsICcgJyxcbiAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdhZGQtaXRlbScsIHtvbkNsaWNrOiB0aGlzLm9uQXBwZW5kfSlcbiAgICApO1xuICB9XG59KTtcbiIsIi8vICMgb2JqZWN0LWl0ZW0tY29udHJvbCBjb21wb25lbnRcblxuLypcblJlbmRlciB0aGUgcmVtb3ZlIGJ1dHRvbnMgZm9yIGFuIG9iamVjdCBpdGVtLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnT2JqZWN0SXRlbUNvbnRyb2wnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgb25SZW1vdmU6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnByb3BzLm9uUmVtb3ZlKHRoaXMucHJvcHMuaXRlbUtleSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpfSxcbiAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdyZW1vdmUtaXRlbScsIHtmaWVsZDogZmllbGQsIG9uQ2xpY2s6IHRoaXMub25SZW1vdmV9KVxuICAgICk7XG4gIH1cbn0pO1xuIiwiLy8gIyBvYmplY3QtaXRlbS1rZXkgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgYW4gb2JqZWN0IGl0ZW0ga2V5IGVkaXRvci5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ09iamVjdEl0ZW1LZXknLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSLmlucHV0KHtcbiAgICAgIGNsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSxcbiAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgIHZhbHVlOiB0aGlzLnByb3BzLmRpc3BsYXlLZXksXG4gICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgIG9uRm9jdXM6IHRoaXMub25Gb2N1c0FjdGlvbixcbiAgICAgIG9uQmx1cjogdGhpcy5vbkJsdXJBY3Rpb25cbiAgICB9KTtcbiAgfVxufSk7XG4iLCIvLyAjIG9iamVjdC1pdGVtLXZhbHVlIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIHRoZSB2YWx1ZSBvZiBhbiBvYmplY3QgaXRlbS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ09iamVjdEl0ZW1WYWx1ZScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBvbkNoYW5nZUZpZWxkOiBmdW5jdGlvbiAobmV3VmFsdWUsIGluZm8pIHtcbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHRoaXMucHJvcHMuaXRlbUtleSwgbmV3VmFsdWUsIGluZm8pO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKX0sXG4gICAgICBjb25maWcuY3JlYXRlRmllbGRFbGVtZW50KHtmaWVsZDogZmllbGQsIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlRmllbGQsIHBsYWluOiB0cnVlLCBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvbn0pXG4gICAgKTtcbiAgfVxufSk7XG4iLCIvLyAjIG9iamVjdC1pdGVtIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIGFuIG9iamVjdCBpdGVtLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnT2JqZWN0SXRlbScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBvbkNoYW5nZUtleTogZnVuY3Rpb24gKG5ld0tleSkge1xuICAgIHRoaXMucHJvcHMub25Nb3ZlKHRoaXMucHJvcHMuaXRlbUtleSwgbmV3S2V5KTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3Nlcyl9LFxuICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ29iamVjdC1pdGVtLWtleScsIHtmaWVsZDogZmllbGQsIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlS2V5LCBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvbiwgZGlzcGxheUtleTogdGhpcy5wcm9wcy5kaXNwbGF5S2V5LCBpdGVtS2V5OiB0aGlzLnByb3BzLml0ZW1LZXl9KSxcbiAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdvYmplY3QtaXRlbS12YWx1ZScsIHtmaWVsZDogZmllbGQsIG9uQ2hhbmdlOiB0aGlzLnByb3BzLm9uQ2hhbmdlLCBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvbiwgaXRlbUtleTogdGhpcy5wcm9wcy5pdGVtS2V5fSksXG4gICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgnb2JqZWN0LWl0ZW0tY29udHJvbCcsIHtmaWVsZDogZmllbGQsIG9uUmVtb3ZlOiB0aGlzLnByb3BzLm9uUmVtb3ZlLCBpdGVtS2V5OiB0aGlzLnByb3BzLml0ZW1LZXl9KVxuICAgICk7XG4gIH1cbn0pO1xuIiwiLy8gIyBwcmV0dHktc2VsZWN0LXZhbHVlIGNvbXBvbmVudFxuXG4vKlxuICAgUmVuZGVyIGEgc2VsZWN0IGRyb3Bkb3duIGZvciBhIGxpc3Qgb2YgY2hvaWNlcy4gQ2hvaWNlcyB2YWx1ZXMgY2FuIGJlIG9mIGFueVxuICAgdHlwZS4gRG9lcyBub3QgdXNlIG5hdGl2ZSBzZWxlY3QgZHJvcGRvd24uIENob2ljZXMgY2FuIG9wdGlvbmFsbHkgaW5jbHVkZVxuICAgJ3NhbXBsZScgcHJvcGVydHkgZGlzcGxheWVkIGdyYXllZCBvdXQuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBfID0gcmVxdWlyZSgndW5kZXJzY29yZScpO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ1NlbGVjdFZhbHVlJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB2YXIgY2hvaWNlVmFsdWUgPSBldmVudC50YXJnZXQudmFsdWU7XG4gICAgdmFyIGNob2ljZVR5cGUgPSBjaG9pY2VWYWx1ZS5zdWJzdHJpbmcoMCwgY2hvaWNlVmFsdWUuaW5kZXhPZignOicpKTtcbiAgICBpZiAoY2hvaWNlVHlwZSA9PT0gJ2Nob2ljZScpIHtcbiAgICAgIHZhciBjaG9pY2VJbmRleCA9IGNob2ljZVZhbHVlLnN1YnN0cmluZyhjaG9pY2VWYWx1ZS5pbmRleE9mKCc6JykgKyAxKTtcbiAgICAgIGNob2ljZUluZGV4ID0gcGFyc2VJbnQoY2hvaWNlSW5kZXgpO1xuICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZSh0aGlzLnByb3BzLmNob2ljZXNbY2hvaWNlSW5kZXhdLnZhbHVlKTtcbiAgICB9XG4gIH0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNob2ljZXM6IFtdXG4gICAgfTtcbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBkZWZhdWx0VmFsdWUgPSB0aGlzLnByb3BzLmZpZWxkLnZhbHVlICE9PSB1bmRlZmluZWQgPyB0aGlzLnByb3BzLmZpZWxkLnZhbHVlIDogJyc7XG5cbiAgICByZXR1cm4ge1xuICAgICAgaXNDaG9pY2VzT3BlbjogdGhpcy5wcm9wcy5pc0Nob2ljZXNPcGVuLFxuICAgICAgdmFsdWU6IGRlZmF1bHRWYWx1ZSxcbiAgICAgIGlzRW50ZXJpbmdDdXN0b21WYWx1ZTogZmFsc2VcbiAgICB9O1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgLy8gdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBjaG9pY2VzID0gdGhpcy5wcm9wcy5jb25maWcubm9ybWFsaXplUHJldHR5Q2hvaWNlcyh0aGlzLnByb3BzLmNob2ljZXMpO1xuICAgIHZhciBjaG9pY2VzT3JMb2FkaW5nO1xuXG4gICAgaWYgKChjaG9pY2VzLmxlbmd0aCA+IDEgJiYgY2hvaWNlc1swXS52YWx1ZSA9PT0gJy8vL2xvYWRpbmcvLy8nKSB8fCB0aGlzLnByb3BzLmNvbmZpZy5maWVsZElzTG9hZGluZyh0aGlzLnByb3BzLmZpZWxkKSkge1xuICAgICAgY2hvaWNlcyA9IFt7dmFsdWU6ICcvLy9sb2FkaW5nLy8vJ31dO1xuICAgIH1cbiAgICB2YXIgY2hvaWNlc0VsZW0gPSB0aGlzLnByb3BzLmNvbmZpZy5jcmVhdGVFbGVtZW50KCdjaG9pY2VzJywge1xuICAgICAgcmVmOiAnY2hvaWNlcycsXG4gICAgICBjaG9pY2VzOiBjaG9pY2VzLFxuICAgICAgb3BlbjogdGhpcy5zdGF0ZS5pc0Nob2ljZXNPcGVuLFxuICAgICAgaWdub3JlQ2xvc2VOb2RlczogdGhpcy5nZXRDbG9zZUlnbm9yZU5vZGVzLFxuICAgICAgb25TZWxlY3Q6IHRoaXMub25TZWxlY3RDaG9pY2UsXG4gICAgICBvbkNsb3NlOiB0aGlzLm9uQ2xvc2VDaG9pY2VzLFxuICAgICAgb25DaG9pY2VBY3Rpb246IHRoaXMub25DaG9pY2VBY3Rpb24sXG4gICAgICBmaWVsZDogdGhpcy5wcm9wcy5maWVsZFxuICAgIH0pO1xuXG4gICAgdmFyIGlucHV0RWxlbSA9IHRoaXMuZ2V0SW5wdXRFbGVtZW50KCk7XG5cbiAgICBjaG9pY2VzT3JMb2FkaW5nID0gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9e2N4KHRoaXMucHJvcHMuY2xhc3Nlcyl9XG4gICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uQ2hhbmdlfT5cblxuICAgICAgICA8ZGl2IHJlZj1cInRvZ2dsZVwiIG9uQ2xpY2s9e3RoaXMub25Ub2dnbGVDaG9pY2VzfT5cbiAgICAgICAgICB7aW5wdXRFbGVtfVxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInNlbGVjdC1hcnJvd1wiIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICB7Y2hvaWNlc0VsZW19XG4gICAgICA8L2Rpdj5cbiAgICApO1xuXG4gICAgcmV0dXJuIGNob2ljZXNPckxvYWRpbmc7XG4gIH0sXG5cbiAgZ2V0SW5wdXRFbGVtZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUuaXNFbnRlcmluZ0N1c3RvbVZhbHVlKSB7XG4gICAgICByZXR1cm4gPGlucHV0IHJlZj1cImN1c3RvbUlucHV0XCIgdHlwZT1cInRleHRcIiB2YWx1ZT17dGhpcy5wcm9wcy5maWVsZC52YWx1ZX1cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25JbnB1dENoYW5nZX0gb25Gb2N1cz17dGhpcy5vbkZvY3VzQWN0aW9ufSBvbkJsdXI9e3RoaXMub25CbHVyfSAvPjtcbiAgICB9XG5cbiAgICByZXR1cm4gPGlucHV0IHR5cGU9XCJ0ZXh0XCIgdmFsdWU9e3RoaXMuZ2V0RGlzcGxheVZhbHVlKCl9IHJlYWRPbmx5IG9uRm9jdXM9e3RoaXMub25Gb2N1c0FjdGlvbn0gb25CbHVyPXt0aGlzLm9uQmx1cn0gLz47XG4gIH0sXG5cbiAgYmx1ckxhdGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgc2VsZi5vbkJsdXJBY3Rpb24oKTtcbiAgICB9LCAwKTtcbiAgfSxcblxuICBvbkJsdXI6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuc3RhdGUuaXNDaG9pY2VzT3Blbikge1xuICAgICAgdGhpcy5ibHVyTGF0ZXIoKTtcbiAgICB9XG4gIH0sXG5cbiAgZ2V0Q2xvc2VJZ25vcmVOb2RlczogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlZnMudG9nZ2xlLmdldERPTU5vZGUoKTtcbiAgfSxcblxuICBvblRvZ2dsZUNob2ljZXM6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNldENob2ljZXNPcGVuKCF0aGlzLnN0YXRlLmlzQ2hvaWNlc09wZW4pO1xuICB9LFxuXG4gIHNldENob2ljZXNPcGVuOiBmdW5jdGlvbiAoaXNPcGVuKSB7XG4gICAgdmFyIGFjdGlvbiA9IGlzT3BlbiA/ICdvcGVuLWNob2ljZXMnIDogJ2Nsb3NlLWNob2ljZXMnO1xuICAgIHRoaXMub25TdGFydEFjdGlvbihhY3Rpb24pO1xuICAgIHRoaXMuc2V0U3RhdGUoeyBpc0Nob2ljZXNPcGVuOiBpc09wZW4gfSk7XG4gIH0sXG5cbiAgb25TZWxlY3RDaG9pY2U6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgaXNFbnRlcmluZ0N1c3RvbVZhbHVlOiBmYWxzZSxcbiAgICAgIGlzQ2hvaWNlc09wZW46IGZhbHNlLFxuICAgICAgdmFsdWU6IHZhbHVlXG4gICAgfSk7XG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZSh2YWx1ZSk7XG4gICAgdGhpcy5ibHVyTGF0ZXIoKTtcbiAgfSxcblxuICBvbkNsb3NlQ2hvaWNlczogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnN0YXRlLmlzQ2hvaWNlc09wZW4pIHtcbiAgICAgIHRoaXMuYmx1ckxhdGVyKCk7XG4gICAgICB0aGlzLnNldENob2ljZXNPcGVuKGZhbHNlKTtcbiAgICB9XG4gIH0sXG5cbiAgZ2V0RGlzcGxheVZhbHVlOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBjdXJyZW50VmFsdWUgPSB0aGlzLnN0YXRlLnZhbHVlO1xuICAgIHZhciBjdXJyZW50Q2hvaWNlID0gdGhpcy5wcm9wcy5jb25maWcuZmllbGRTZWxlY3RlZENob2ljZSh0aGlzLnByb3BzLmZpZWxkKTtcbiAgICAvLyBNYWtlIHN1cmUgc2VsZWN0ZWRDaG9pY2UgaXMgYSBtYXRjaCBmb3IgY3VycmVudCB2YWx1ZS5cbiAgICBpZiAoY3VycmVudENob2ljZSAmJiBjdXJyZW50Q2hvaWNlLnZhbHVlICE9PSBjdXJyZW50VmFsdWUpIHtcbiAgICAgIGN1cnJlbnRDaG9pY2UgPSBudWxsO1xuICAgIH1cbiAgICBpZiAoIWN1cnJlbnRDaG9pY2UpIHtcbiAgICAgIGN1cnJlbnRDaG9pY2UgPSBfLmZpbmQodGhpcy5wcm9wcy5jaG9pY2VzLCBmdW5jdGlvbiAoY2hvaWNlKSB7XG4gICAgICAgIHJldHVybiAhY2hvaWNlLmFjdGlvbiAmJiBjaG9pY2UudmFsdWUgPT09IGN1cnJlbnRWYWx1ZTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChjdXJyZW50Q2hvaWNlKSB7XG4gICAgICByZXR1cm4gY3VycmVudENob2ljZS5sYWJlbDtcbiAgICB9IGVsc2UgaWYgKGN1cnJlbnRWYWx1ZSkgeyAvLyBjdXN0b20gdmFsdWVcbiAgICAgIHJldHVybiBjdXJyZW50VmFsdWU7XG4gICAgfVxuICAgIHJldHVybiBjb25maWcuZmllbGRQbGFjZWhvbGRlcih0aGlzLnByb3BzLmZpZWxkKSB8fCAnJztcbiAgfSxcblxuICBvbkNob2ljZUFjdGlvbjogZnVuY3Rpb24gKGNob2ljZSkge1xuICAgIGlmIChjaG9pY2UuYWN0aW9uID09PSAnZW50ZXItY3VzdG9tLXZhbHVlJykge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGlzRW50ZXJpbmdDdXN0b21WYWx1ZTogdHJ1ZSxcbiAgICAgICAgaXNDaG9pY2VzT3BlbjogZmFsc2UsXG4gICAgICAgIHZhbHVlOiBjaG9pY2UudmFsdWVcbiAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5yZWZzLmN1c3RvbUlucHV0LmdldERPTU5vZGUoKS5mb2N1cygpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBpc0Nob2ljZXNPcGVuOiAhIWNob2ljZS5pc09wZW5cbiAgICAgIH0pO1xuICAgICAgaWYgKGNob2ljZS5hY3Rpb24gPT09ICdjbGVhci1jdXJyZW50LWNob2ljZScpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgdmFsdWU6ICcnXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKCcnKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLm9uU3RhcnRBY3Rpb24oY2hvaWNlLmFjdGlvbiwgY2hvaWNlKTtcbiAgfSxcblxuICBvbkFjdGlvbjogZnVuY3Rpb24gKHBhcmFtcykge1xuICAgIGlmIChwYXJhbXMuYWN0aW9uID09PSAnZW50ZXItY3VzdG9tLXZhbHVlJykge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7aXNFbnRlcmluZ0N1c3RvbVZhbHVlOiB0cnVlfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnJlZnMuY3VzdG9tSW5wdXQuZ2V0RE9NTm9kZSgpLmZvY3VzKCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgdGhpcy5vbkJ1YmJsZUFjdGlvbihwYXJhbXMpO1xuICB9LFxuXG4gIG9uSW5wdXRDaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgfVxufSk7XG4iLCIvLyAjIHJlbW92ZS1pdGVtIGNvbXBvbmVudFxuXG4vKlxuUmVtb3ZlIGFuIGl0ZW0uXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnUmVtb3ZlSXRlbScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGFiZWw6ICdbcmVtb3ZlXSdcbiAgICB9O1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICBvbk1vdXNlT3ZlclJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnByb3BzLm9uTWF5YmVSZW1vdmUpIHtcbiAgICAgIHRoaXMucHJvcHMub25NYXliZVJlbW92ZSh0cnVlKTtcbiAgICB9XG4gIH0sXG5cbiAgb25Nb3VzZU91dFJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnByb3BzLm9uTWF5YmVSZW1vdmUpIHtcbiAgICAgIHRoaXMucHJvcHMub25NYXliZVJlbW92ZShmYWxzZSk7XG4gICAgfVxuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUi5zcGFuKHtcbiAgICAgIGNsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSwgb25DbGljazogdGhpcy5wcm9wcy5vbkNsaWNrLFxuICAgICAgb25Nb3VzZU92ZXI6IHRoaXMub25Nb3VzZU92ZXJSZW1vdmUsIG9uTW91c2VPdXQ6IHRoaXMub25Nb3VzZU91dFJlbW92ZVxuICAgIH0sIHRoaXMucHJvcHMubGFiZWwpO1xuICB9XG59KTtcbiIsIi8vICMgaGVscCBjb21wb25lbnRcblxuLypcbkp1c3QgdGhlIGhlbHAgdGV4dCBibG9jay5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdTYW1wbGUnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjaG9pY2UgPSB0aGlzLnByb3BzLmNob2ljZTtcblxuICAgIHJldHVybiBjaG9pY2Uuc2FtcGxlID9cbiAgICAgIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NOYW1lKX0sXG4gICAgICAgIGNob2ljZS5zYW1wbGVcbiAgICAgICkgOlxuICAgICAgUi5zcGFuKG51bGwpO1xuICB9XG59KTtcbiIsIi8vICMgc2VsZWN0LXZhbHVlIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIGEgc2VsZWN0IGRyb3Bkb3duIGZvciBhIGxpc3Qgb2YgY2hvaWNlcy4gQ2hvaWNlcyB2YWx1ZXMgY2FuIGJlIG9mIGFueVxudHlwZS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBfID0gcmVxdWlyZSgnLi4vLi4vdW5kYXNoJyk7XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnU2VsZWN0VmFsdWUnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHZhciBjaG9pY2VWYWx1ZSA9IGV2ZW50LnRhcmdldC52YWx1ZTtcbiAgICB2YXIgY2hvaWNlVHlwZSA9IGNob2ljZVZhbHVlLnN1YnN0cmluZygwLCBjaG9pY2VWYWx1ZS5pbmRleE9mKCc6JykpO1xuICAgIGlmIChjaG9pY2VUeXBlID09PSAnY2hvaWNlJykge1xuICAgICAgdmFyIGNob2ljZUluZGV4ID0gY2hvaWNlVmFsdWUuc3Vic3RyaW5nKGNob2ljZVZhbHVlLmluZGV4T2YoJzonKSArIDEpO1xuICAgICAgY2hvaWNlSW5kZXggPSBwYXJzZUludChjaG9pY2VJbmRleCk7XG4gICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHRoaXMucHJvcHMuY2hvaWNlc1tjaG9pY2VJbmRleF0udmFsdWUpO1xuICAgIH1cbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgY2hvaWNlcyA9IHRoaXMucHJvcHMuY2hvaWNlcyB8fCBbXTtcblxuICAgIHZhciBjaG9pY2VzT3JMb2FkaW5nO1xuXG4gICAgaWYgKChjaG9pY2VzLmxlbmd0aCA9PT0gMSAmJiBjaG9pY2VzWzBdLnZhbHVlID09PSAnLy8vbG9hZGluZy8vLycpIHx8IGNvbmZpZy5maWVsZElzTG9hZGluZyh0aGlzLnByb3BzLmZpZWxkKSkge1xuICAgICAgY2hvaWNlc09yTG9hZGluZyA9IGNvbmZpZy5jcmVhdGVFbGVtZW50KCdsb2FkaW5nLWNob2ljZXMnLCB7fSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB2YWx1ZSA9IHRoaXMucHJvcHMuZmllbGQudmFsdWUgIT09IHVuZGVmaW5lZCA/IHRoaXMucHJvcHMuZmllbGQudmFsdWUgOiAnJztcblxuICAgICAgY2hvaWNlcyA9IGNob2ljZXMubWFwKGZ1bmN0aW9uIChjaG9pY2UsIGkpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBjaG9pY2VWYWx1ZTogJ2Nob2ljZTonICsgaSxcbiAgICAgICAgICB2YWx1ZTogY2hvaWNlLnZhbHVlLFxuICAgICAgICAgIGxhYmVsOiBjaG9pY2UubGFiZWxcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgdmFsdWVDaG9pY2UgPSBfLmZpbmQoY2hvaWNlcywgZnVuY3Rpb24gKGNob2ljZSkge1xuICAgICAgICByZXR1cm4gY2hvaWNlLnZhbHVlID09PSB2YWx1ZTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAodmFsdWVDaG9pY2UgPT09IHVuZGVmaW5lZCkge1xuXG4gICAgICAgIHZhciBsYWJlbCA9IHZhbHVlO1xuICAgICAgICBpZiAoIV8uaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgICAgICAgbGFiZWwgPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFsdWVDaG9pY2UgPSB7XG4gICAgICAgICAgY2hvaWNlVmFsdWU6ICd2YWx1ZTonLFxuICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICBsYWJlbDogbGFiZWxcbiAgICAgICAgfTtcbiAgICAgICAgY2hvaWNlcyA9IFt2YWx1ZUNob2ljZV0uY29uY2F0KGNob2ljZXMpO1xuICAgICAgfVxuXG4gICAgICBjaG9pY2VzT3JMb2FkaW5nID0gUi5zZWxlY3Qoe1xuICAgICAgICBjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcyksXG4gICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgICB2YWx1ZTogdmFsdWVDaG9pY2UuY2hvaWNlVmFsdWUsXG4gICAgICAgIG9uRm9jdXM6IHRoaXMub25Gb2N1c0FjdGlvbixcbiAgICAgICAgb25CbHVyOiB0aGlzLm9uQmx1ckFjdGlvblxuICAgICAgfSxcbiAgICAgIGNob2ljZXMubWFwKGZ1bmN0aW9uIChjaG9pY2UsIGkpIHtcbiAgICAgICAgcmV0dXJuIFIub3B0aW9uKHtcbiAgICAgICAgICBrZXk6IGksXG4gICAgICAgICAgdmFsdWU6IGNob2ljZS5jaG9pY2VWYWx1ZVxuICAgICAgICB9LCBjaG9pY2UubGFiZWwpO1xuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgcmV0dXJuIGNob2ljZXNPckxvYWRpbmc7XG59XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLy8gQ29uc3RhbnQgZm9yIGZpcnN0IHVudXNlZCBzcGVjaWFsIHVzZSBjaGFyYWN0ZXIuXG4vLyBTZWUgSU1QTEVNRU5UQVRJT04gTk9URSBpbiBwcmV0dHktdGV4dDIuanMuXG52YXIgRklSU1RfU1BFQ0lBTF9DSEFSID0gMHhlMDAwO1xuXG4vLyByZWdleHAgdXNlZCB0byBncmVwIG91dCB0YWdzIGxpa2Uge3tmaXJzdE5hbWV9fVxudmFyIFRBR1NfUkVHRVhQID0gL1xce1xceyguKz8pXFx9XFx9L2c7XG5cbmZ1bmN0aW9uIGJ1aWxkQ2hvaWNlc01hcChyZXBsYWNlQ2hvaWNlcykge1xuICB2YXIgY2hvaWNlcyA9IHt9O1xuICByZXBsYWNlQ2hvaWNlcy5mb3JFYWNoKGZ1bmN0aW9uIChjaG9pY2UpIHtcbiAgICB2YXIga2V5ID0gY2hvaWNlLnZhbHVlO1xuICAgIGNob2ljZXNba2V5XSA9IGNob2ljZS5sYWJlbDtcbiAgfSk7XG4gIHJldHVybiBjaG9pY2VzO1xufVxuXG4vKlxuICAgQ3JlYXRlcyBoZWxwZXIgdG8gdHJhbnNsYXRlIGJldHdlZW4gdGFncyBsaWtlIHt7Zmlyc3ROYW1lfX0gYW5kXG4gICBhbiBlbmNvZGVkIHJlcHJlc2VudGF0aW9uIHN1aXRhYmxlIGZvciB1c2UgaW4gQ29kZU1pcnJvci5cblxuICAgU2VlIElNUExFTUVOVEFUSU9OIE5PVEUgaW4gcHJldHR5LXRleHQyLmpzLlxuICovXG5mdW5jdGlvbiBUYWdUcmFuc2xhdG9yKHJlcGxhY2VDaG9pY2VzLCBodW1hbml6ZSkge1xuICB2YXIgbmV4dENoYXJDb2RlID0gRklSU1RfU1BFQ0lBTF9DSEFSO1xuXG4gIC8vIE1hcCBvZiB0YWcgdG8gbGFiZWwgJ2ZpcnN0TmFtZScgLS0+ICdGaXJzdCBOYW1lJ1xuICB2YXIgY2hvaWNlcyA9IHt9O1xuXG4gIC8vIFRvIGhlbHAgdHJhbnNsYXRlIHRvIGFuZCBmcm9tIHRoZSBDTSByZXByZXNlbnRhdGlvbiB3aXRoIHRoZSBzcGVjaWFsXG4gIC8vIGNoYXJhY3RlcnMsIGJ1aWxkIHR3byBtYXBzOlxuICAvLyAgIC0gY2hhclRvVGFnTWFwOiBzcGVjaWFsIGNoYXIgdG8gdGFnIC0gaS5lLiB7ICdcXHVlMDAwJzogJ2ZpcnN0TmFtZScgfVxuICAvLyAgIC0gdGFnVG9DaGFyTWFwOiB0YWcgdG8gc3BlY2lhbCBjaGFyLCBpLmUuIHsgZmlyc3ROYW1lOiAnXFx1ZTAwMCcgfVxuICB2YXIgY2hhclRvVGFnTWFwID0ge307XG4gIHZhciB0YWdUb0NoYXJNYXAgPSB7fTtcblxuICBmdW5jdGlvbiBhZGRDaG9pY2VzKGNob2ljZXNBcnJheSkge1xuICAgIGNob2ljZXMgPSBidWlsZENob2ljZXNNYXAoY2hvaWNlc0FycmF5KTtcblxuICAgIE9iamVjdC5rZXlzKGNob2ljZXMpLnNvcnQoKS5mb3JFYWNoKGZ1bmN0aW9uICh0YWcpIHtcbiAgICAgIGlmICh0YWdUb0NoYXJNYXBbdGFnXSkge1xuICAgICAgICByZXR1cm47IC8vIHdlIGFscmVhZHkgaGF2ZSB0aGlzIHRhZyBtYXBwZWRcbiAgICAgIH1cblxuICAgICAgdmFyIGNoYXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKG5leHRDaGFyQ29kZSsrKTtcbiAgICAgIGNoYXJUb1RhZ01hcFtjaGFyXSA9IHRhZztcbiAgICAgIHRhZ1RvQ2hhck1hcFt0YWddID0gY2hhcjtcbiAgICB9KTtcbiAgfVxuXG4gIGFkZENob2ljZXMocmVwbGFjZUNob2ljZXMpO1xuXG4gIHJldHVybiB7XG4gICAgc3BlY2lhbENoYXJzUmVnZXhwOiAvW1xcdWUwMDAtXFx1ZWZmZl0vZyxcblxuICAgIGFkZENob2ljZXM6IGFkZENob2ljZXMsXG5cbiAgICAvKlxuICAgICAgIENvbnZlcnQgdGFnIHRvIGVuY29kZWQgY2hhcmFjdGVyLiBGb3IgZXhhbXBsZVxuICAgICAgICdmaXJzdE5hbWUnIGJlY29tZXMgJ1xcdWUwMDAnLlxuICAgICAqL1xuICAgIGVuY29kZVRhZzogZnVuY3Rpb24gKHRhZykge1xuICAgICAgaWYgKCF0YWdUb0NoYXJNYXBbdGFnXSkge1xuICAgICAgICB2YXIgY2hhciA9IFN0cmluZy5mcm9tQ2hhckNvZGUobmV4dENoYXJDb2RlKyspO1xuICAgICAgICB0YWdUb0NoYXJNYXBbdGFnXSA9IGNoYXI7XG4gICAgICAgIGNoYXJUb1RhZ01hcFtjaGFyXSA9IHRhZztcbiAgICAgIH1cbiAgICAgIHJldHVybiB0YWdUb0NoYXJNYXBbdGFnXTtcbiAgICB9LFxuXG4gICAgLypcbiAgICAgICBDb252ZXJ0IHRleHQgdmFsdWUgdG8gZW5jb2RlZCB2YWx1ZSBmb3IgQ29kZU1pcnJvci4gRm9yIGV4YW1wbGVcbiAgICAgICAnaGVsbG8ge3tmaXJzdE5hbWV9fScgYmVjb21lcyAnaGVsbG8gXFx1ZTAwMCdcbiAgICAgKi9cbiAgICBlbmNvZGVWYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICByZXR1cm4gU3RyaW5nKHZhbHVlKS5yZXBsYWNlKFRBR1NfUkVHRVhQLCBmdW5jdGlvbiAobSwgdGFnKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVuY29kZVRhZyh0YWcpO1xuICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLypcbiAgICAgICBDb252ZXJ0IGVuY29kZWQgdGV4dCB1c2VkIGluIENNIHRvIHRhZ2dlZCB0ZXh0LiBGb3IgZXhhbXBsZVxuICAgICAgICdoZWxsbyBcXHVlMDAwJyBiZWNvbWVzICdoZWxsbyB7e2ZpcnN0TmFtZX19J1xuICAgICAqL1xuICAgIGRlY29kZVZhbHVlOiBmdW5jdGlvbiAoZW5jb2RlZFZhbHVlKSB7XG4gICAgICByZXR1cm4gU3RyaW5nKGVuY29kZWRWYWx1ZSkucmVwbGFjZSh0aGlzLnNwZWNpYWxDaGFyc1JlZ2V4cCwgZnVuY3Rpb24gKGMpIHtcbiAgICAgICAgdmFyIHRhZyA9IGNoYXJUb1RhZ01hcFtjXTtcbiAgICAgICAgcmV0dXJuICd7eycgKyB0YWcgKyAnfX0nO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qXG4gICAgICAgQ29udmVydCBlbmNvZGVkIGNoYXJhY3RlciB0byBsYWJlbC4gRm9yIGV4YW1wbGVcbiAgICAgICAnXFx1ZTAwMCcgYmVjb21lcyAnTGFzdCBOYW1lJy5cbiAgICAgKi9cbiAgICBkZWNvZGVDaGFyOiBmdW5jdGlvbiAoY2hhcikge1xuICAgICAgdmFyIHRhZyA9IGNoYXJUb1RhZ01hcFtjaGFyXTtcbiAgICAgIHJldHVybiB0aGlzLmdldExhYmVsKHRhZyk7XG4gICAgfSxcblxuICAgIC8qXG4gICAgICAgQ29udmVydCB0YWdnZWQgdmFsdWUgdG8gSFRNTC4gRm9yIGV4YW1wbGVcbiAgICAgICAnaGVsbG8ge3tmaXJzdE5hbWV9fScgYmVjb21lcyAnaGVsbG8gPHNwYW4gY2xhc3M9XCJ0YWdcIj5GaXJzdCBOYW1lPC9zcGFuPidcbiAgICAgKi9cbiAgICB0b0h0bWw6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgcmV0dXJuIFN0cmluZyh2YWx1ZSkucmVwbGFjZShUQUdTX1JFR0VYUCwgZnVuY3Rpb24gKG0sIG11c3RhY2hlKSB7XG4gICAgICAgIHZhciB0YWcgPSBtdXN0YWNoZS5yZXBsYWNlKCd7eycsICcnKS5yZXBsYWNlKCd9fScsICcnKTtcbiAgICAgICAgdmFyIGxhYmVsID0gdGhpcy5nZXRMYWJlbCh0YWcpO1xuICAgICAgICByZXR1cm4gJzxzcGFuIGNsYXNzPVwicHJldHR5LXBhcnRcIj4nICsgbGFiZWwgKyAnPC9zcGFuPic7XG4gICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0sXG5cbiAgICAvKlxuICAgICAgIEdldCBsYWJlbCBmb3IgdGFnLiAgRm9yIGV4YW1wbGUgJ2ZpcnN0TmFtZScgYmVjb21lcyAnRmlyc3QgTmFtZScuXG4gICAgICAgUmV0dXJucyBhIGh1bWFuaXplZCB2ZXJzaW9uIG9mIHRoZSB0YWcgaWYgd2UgZG9uJ3QgaGF2ZSBhIGxhYmVsIGZvciB0aGUgdGFnLlxuICAgICAqL1xuICAgIGdldExhYmVsOiBmdW5jdGlvbiAodGFnKSB7XG4gICAgICB2YXIgbGFiZWwgPSBjaG9pY2VzW3RhZ107XG4gICAgICBpZiAoIWxhYmVsKSB7XG4gICAgICAgIC8vIElmIHRhZyBub3QgZm91bmQgYW5kIHdlIGhhdmUgYSBodW1hbml6ZSBmdW5jdGlvbiwgaHVtYW5pemUgdGhlIHRhZy5cbiAgICAgICAgLy8gT3RoZXJ3aXNlIGp1c3QgcmV0dXJuIHRoZSB0YWcuXG4gICAgICAgIGxhYmVsID0gaHVtYW5pemUgJiYgaHVtYW5pemUodGFnKSB8fCB0YWc7XG4gICAgICB9XG4gICAgICByZXR1cm4gbGFiZWw7XG4gICAgfVxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRhZ1RyYW5zbGF0b3I7XG4iLCIvLyAjIGRlZmF1bHQtY29uZmlnXG5cbi8qXG5UaGlzIGlzIHRoZSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gcGx1Z2luIGZvciBmb3JtYXRpYy4gVG8gY2hhbmdlIGZvcm1hdGljJ3NcbmJlaGF2aW9yLCBqdXN0IGNyZWF0ZSB5b3VyIG93biBwbHVnaW4gZnVuY3Rpb24gdGhhdCByZXR1cm5zIGFuIG9iamVjdCB3aXRoXG5tZXRob2RzIHlvdSB3YW50IHRvIGFkZCBvciBvdmVycmlkZS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBfID0gcmVxdWlyZSgnLi91bmRhc2gnKTtcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjb25maWcpIHtcblxuICB2YXIgZGVsZWdhdGVUbyA9IHV0aWxzLmRlbGVnYXRvcihjb25maWcpO1xuXG4gIHJldHVybiB7XG5cbiAgICAvLyBGaWVsZCBlbGVtZW50IGZhY3Rvcmllcy4gQ3JlYXRlIGZpZWxkIGVsZW1lbnRzLlxuXG4gICAgY3JlYXRlRWxlbWVudF9GaWVsZHM6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9maWVsZHMnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X1N0cmluZzogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL3N0cmluZycpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfU2luZ2xlTGluZVN0cmluZzogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL3NpbmdsZS1saW5lLXN0cmluZycpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfU2VsZWN0OiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvc2VsZWN0JykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9QcmV0dHlTZWxlY3Q6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9wcmV0dHktc2VsZWN0JykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9Cb29sZWFuOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvYm9vbGVhbicpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfUHJldHR5Qm9vbGVhbjogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL3ByZXR0eS1ib29sZWFuJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9DaGVja2JveEJvb2xlYW46IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9jaGVja2JveC1ib29sZWFuJykpLFxuXG4gICAgLy8gY3JlYXRlRWxlbWVudF9QcmV0dHlUZXh0OiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvcHJldHR5LXRleHQnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X1ByZXR0eVRleHQ6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9wcmV0dHktdGV4dDInKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0FycmF5OiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvYXJyYXknKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0NoZWNrYm94QXJyYXk6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9jaGVja2JveC1hcnJheScpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfT2JqZWN0OiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvb2JqZWN0JykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9Kc29uOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvanNvbicpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfVW5rbm93bkZpZWxkOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvdW5rbm93bicpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfQ29weTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL2NvcHknKSksXG5cblxuICAgIC8vIE90aGVyIGVsZW1lbnQgZmFjdG9yaWVzLiBDcmVhdGUgaGVscGVyIGVsZW1lbnRzIHVzZWQgYnkgZmllbGQgY29tcG9uZW50cy5cblxuICAgIGNyZWF0ZUVsZW1lbnRfRmllbGQ6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvZmllbGQnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0xhYmVsOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2xhYmVsJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9IZWxwOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2hlbHAnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0Nob2ljZXM6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvY2hvaWNlcycpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfTG9hZGluZ0Nob2ljZXM6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvbG9hZGluZy1jaG9pY2VzJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9Mb2FkaW5nQ2hvaWNlOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2xvYWRpbmctY2hvaWNlJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9BcnJheUNvbnRyb2w6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvYXJyYXktY29udHJvbCcpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfQXJyYXlJdGVtQ29udHJvbDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9hcnJheS1pdGVtLWNvbnRyb2wnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0FycmF5SXRlbVZhbHVlOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2FycmF5LWl0ZW0tdmFsdWUnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0FycmF5SXRlbTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9hcnJheS1pdGVtJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9GaWVsZFRlbXBsYXRlQ2hvaWNlczogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9maWVsZC10ZW1wbGF0ZS1jaG9pY2VzJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9BZGRJdGVtOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2FkZC1pdGVtJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9SZW1vdmVJdGVtOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL3JlbW92ZS1pdGVtJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9Nb3ZlSXRlbUZvcndhcmQ6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvbW92ZS1pdGVtLWZvcndhcmQnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X01vdmVJdGVtQmFjazogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9tb3ZlLWl0ZW0tYmFjaycpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfT2JqZWN0Q29udHJvbDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9vYmplY3QtY29udHJvbCcpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfT2JqZWN0SXRlbUNvbnRyb2w6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWl0ZW0tY29udHJvbCcpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfT2JqZWN0SXRlbVZhbHVlOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL29iamVjdC1pdGVtLXZhbHVlJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9PYmplY3RJdGVtS2V5OiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL29iamVjdC1pdGVtLWtleScpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfT2JqZWN0SXRlbTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9vYmplY3QtaXRlbScpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfU2VsZWN0VmFsdWU6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvc2VsZWN0LXZhbHVlJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9QcmV0dHlTZWxlY3RWYWx1ZTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9wcmV0dHktc2VsZWN0LXZhbHVlJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9TYW1wbGU6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvc2FtcGxlJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9JbnNlcnRCdXR0b246IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvaW5zZXJ0LWJ1dHRvbicpKSxcblxuXG4gICAgLy8gRmllbGQgZGVmYXVsdCB2YWx1ZSBmYWN0b3JpZXMuIEdpdmUgYSBkZWZhdWx0IHZhbHVlIGZvciBhIHNwZWNpZmljIHR5cGUuXG5cbiAgICBjcmVhdGVEZWZhdWx0VmFsdWVfU3RyaW5nOiBmdW5jdGlvbiAoLyogZmllbGRUZW1wbGF0ZSAqLykge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH0sXG5cbiAgICBjcmVhdGVEZWZhdWx0VmFsdWVfT2JqZWN0OiBmdW5jdGlvbiAoLyogZmllbGRUZW1wbGF0ZSAqLykge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH0sXG5cbiAgICBjcmVhdGVEZWZhdWx0VmFsdWVfQXJyYXk6IGZ1bmN0aW9uICgvKiBmaWVsZFRlbXBsYXRlICovKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfSxcblxuICAgIGNyZWF0ZURlZmF1bHRWYWx1ZV9Cb29sZWFuOiBmdW5jdGlvbiAoLyogZmllbGRUZW1wbGF0ZSAqLykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICBjcmVhdGVEZWZhdWx0VmFsdWVfRmllbGRzOiBkZWxlZ2F0ZVRvKCdjcmVhdGVEZWZhdWx0VmFsdWVfT2JqZWN0JyksXG5cbiAgICBjcmVhdGVEZWZhdWx0VmFsdWVfU2luZ2xlTGluZVN0cmluZzogZGVsZWdhdGVUbygnY3JlYXRlRGVmYXVsdFZhbHVlX1N0cmluZycpLFxuXG4gICAgY3JlYXRlRGVmYXVsdFZhbHVlX1NlbGVjdDogZGVsZWdhdGVUbygnY3JlYXRlRGVmYXVsdFZhbHVlX1N0cmluZycpLFxuXG4gICAgY3JlYXRlRGVmYXVsdFZhbHVlX0pzb246IGRlbGVnYXRlVG8oJ2NyZWF0ZURlZmF1bHRWYWx1ZV9PYmplY3QnKSxcblxuICAgIGNyZWF0ZURlZmF1bHRWYWx1ZV9DaGVja2JveEFycmF5OiBkZWxlZ2F0ZVRvKCdjcmVhdGVEZWZhdWx0VmFsdWVfQXJyYXknKSxcblxuICAgIGNyZWF0ZURlZmF1bHRWYWx1ZV9DaGVja2JveEJvb2xlYW46IGRlbGVnYXRlVG8oJ2NyZWF0ZURlZmF1bHRWYWx1ZV9Cb29sZWFuJyksXG5cblxuICAgIC8vIEZpZWxkIHZhbHVlIGNvZXJjZXJzLiBDb2VyY2UgYSB2YWx1ZSBpbnRvIGEgdmFsdWUgYXBwcm9wcmlhdGUgZm9yIGEgc3BlY2lmaWMgdHlwZS5cblxuICAgIGNvZXJjZVZhbHVlX1N0cmluZzogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUsIHZhbHVlKSB7XG4gICAgICBpZiAoXy5pc1N0cmluZyh2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfVxuICAgICAgaWYgKF8uaXNVbmRlZmluZWQodmFsdWUpIHx8IHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICAgIH1cbiAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgfSxcblxuICAgIGNvZXJjZVZhbHVlX09iamVjdDogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUsIHZhbHVlKSB7XG4gICAgICBpZiAoIV8uaXNPYmplY3QodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9LFxuXG4gICAgY29lcmNlVmFsdWVfQXJyYXk6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlLCB2YWx1ZSkge1xuICAgICAgaWYgKCFfLmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBbdmFsdWVdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG5cbiAgICBjb2VyY2VWYWx1ZV9Cb29sZWFuOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSwgdmFsdWUpIHtcbiAgICAgIHJldHVybiBjb25maWcuY29lcmNlVmFsdWVUb0Jvb2xlYW4odmFsdWUpO1xuICAgIH0sXG5cbiAgICBjb2VyY2VWYWx1ZV9GaWVsZHM6IGRlbGVnYXRlVG8oJ2NvZXJjZVZhbHVlX09iamVjdCcpLFxuXG4gICAgY29lcmNlVmFsdWVfU2luZ2xlTGluZVN0cmluZzogZGVsZWdhdGVUbygnY29lcmNlVmFsdWVfU3RyaW5nJyksXG5cbiAgICBjb2VyY2VWYWx1ZV9TZWxlY3Q6IGRlbGVnYXRlVG8oJ2NvZXJjZVZhbHVlX1N0cmluZycpLFxuXG4gICAgY29lcmNlVmFsdWVfSnNvbjogZGVsZWdhdGVUbygnY29lcmNlVmFsdWVfT2JqZWN0JyksXG5cbiAgICBjb2VyY2VWYWx1ZV9DaGVja2JveEFycmF5OiBkZWxlZ2F0ZVRvKCdjb2VyY2VWYWx1ZV9BcnJheScpLFxuXG4gICAgY29lcmNlVmFsdWVfQ2hlY2tib3hCb29sZWFuOiBkZWxlZ2F0ZVRvKCdjb2VyY2VWYWx1ZV9Cb29sZWFuJyksXG5cblxuICAgIC8vIEZpZWxkIGNoaWxkIGZpZWxkcyBmYWN0b3JpZXMsIHNvIHNvbWUgdHlwZXMgY2FuIGhhdmUgZHluYW1pYyBjaGlsZHJlbi5cblxuICAgIGNyZWF0ZUNoaWxkRmllbGRzX0FycmF5OiBmdW5jdGlvbiAoZmllbGQpIHtcblxuICAgICAgcmV0dXJuIGZpZWxkLnZhbHVlLm1hcChmdW5jdGlvbiAoYXJyYXlJdGVtLCBpKSB7XG4gICAgICAgIHZhciBjaGlsZEZpZWxkVGVtcGxhdGUgPSBjb25maWcuY2hpbGRGaWVsZFRlbXBsYXRlRm9yVmFsdWUoZmllbGQsIGFycmF5SXRlbSk7XG5cbiAgICAgICAgdmFyIGNoaWxkRmllbGQgPSBjb25maWcuY3JlYXRlQ2hpbGRGaWVsZChmaWVsZCwge1xuICAgICAgICAgIGZpZWxkVGVtcGxhdGU6IGNoaWxkRmllbGRUZW1wbGF0ZSwga2V5OiBpLCBmaWVsZEluZGV4OiBpLCB2YWx1ZTogYXJyYXlJdGVtXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBjaGlsZEZpZWxkO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZUNoaWxkRmllbGRzX09iamVjdDogZnVuY3Rpb24gKGZpZWxkKSB7XG5cbiAgICAgIHJldHVybiBPYmplY3Qua2V5cyhmaWVsZC52YWx1ZSkubWFwKGZ1bmN0aW9uIChrZXksIGkpIHtcbiAgICAgICAgdmFyIGNoaWxkRmllbGRUZW1wbGF0ZSA9IGNvbmZpZy5jaGlsZEZpZWxkVGVtcGxhdGVGb3JWYWx1ZShmaWVsZCwgZmllbGQudmFsdWVba2V5XSk7XG5cbiAgICAgICAgdmFyIGNoaWxkRmllbGQgPSBjb25maWcuY3JlYXRlQ2hpbGRGaWVsZChmaWVsZCwge1xuICAgICAgICAgIGZpZWxkVGVtcGxhdGU6IGNoaWxkRmllbGRUZW1wbGF0ZSwga2V5OiBrZXksIGZpZWxkSW5kZXg6IGksIHZhbHVlOiBmaWVsZC52YWx1ZVtrZXldXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBjaGlsZEZpZWxkO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8vIENoZWNrIGlmIHRoZXJlIGlzIGEgZmFjdG9yeSBmb3IgdGhlIG5hbWUuXG4gICAgaGFzRWxlbWVudEZhY3Rvcnk6IGZ1bmN0aW9uIChuYW1lKSB7XG5cbiAgICAgIHJldHVybiBjb25maWdbJ2NyZWF0ZUVsZW1lbnRfJyArIG5hbWVdID8gdHJ1ZSA6IGZhbHNlO1xuICAgIH0sXG5cbiAgICAvLyBDcmVhdGUgYW4gZWxlbWVudCBnaXZlbiBhIG5hbWUsIHByb3BzLCBhbmQgY2hpbGRyZW4uXG4gICAgY3JlYXRlRWxlbWVudDogZnVuY3Rpb24gKG5hbWUsIHByb3BzLCBjaGlsZHJlbikge1xuXG4gICAgICBpZiAoIXByb3BzLmNvbmZpZykge1xuICAgICAgICBwcm9wcyA9IF8uZXh0ZW5kKHt9LCBwcm9wcywge2NvbmZpZzogY29uZmlnfSk7XG4gICAgICB9XG5cbiAgICAgIG5hbWUgPSBjb25maWcuZWxlbWVudE5hbWUobmFtZSk7XG5cbiAgICAgIGlmIChjb25maWdbJ2NyZWF0ZUVsZW1lbnRfJyArIG5hbWVdKSB7XG4gICAgICAgIHJldHVybiBjb25maWdbJ2NyZWF0ZUVsZW1lbnRfJyArIG5hbWVdKHByb3BzLCBjaGlsZHJlbik7XG4gICAgICB9XG5cbiAgICAgIGlmIChuYW1lICE9PSAnVW5rbm93bicpIHtcbiAgICAgICAgaWYgKGNvbmZpZy5oYXNFbGVtZW50RmFjdG9yeSgnVW5rbm93bicpKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdVbmtub3duJywgcHJvcHMsIGNoaWxkcmVuKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhY3Rvcnkgbm90IGZvdW5kIGZvcjogJyArIG5hbWUpO1xuICAgIH0sXG5cbiAgICAvLyBDcmVhdGUgYSBmaWVsZCBlbGVtZW50IGdpdmVuIHNvbWUgcHJvcHMuIFVzZSBjb250ZXh0IHRvIGRldGVybWluZSBuYW1lLlxuICAgIGNyZWF0ZUZpZWxkRWxlbWVudDogZnVuY3Rpb24gKHByb3BzKSB7XG5cbiAgICAgIHZhciBuYW1lID0gY29uZmlnLmZpZWxkVHlwZU5hbWUocHJvcHMuZmllbGQpO1xuXG4gICAgICBpZiAoY29uZmlnLmhhc0VsZW1lbnRGYWN0b3J5KG5hbWUpKSB7XG4gICAgICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudChuYW1lLCBwcm9wcyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnVW5rbm93bkZpZWxkJywgcHJvcHMpO1xuICAgIH0sXG5cbiAgICAvLyBSZW5kZXIgdGhlIHJvb3QgZm9ybWF0aWMgY29tcG9uZW50XG4gICAgcmVuZGVyRm9ybWF0aWNDb21wb25lbnQ6IGZ1bmN0aW9uIChjb21wb25lbnQpIHtcblxuICAgICAgdmFyIHByb3BzID0gY29tcG9uZW50LnByb3BzO1xuXG4gICAgICB2YXIgZmllbGQgPSBjb25maWcuY3JlYXRlUm9vdEZpZWxkKHByb3BzKTtcblxuICAgICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6ICdmb3JtYXRpYyd9LFxuICAgICAgICBjb25maWcuY3JlYXRlRmllbGRFbGVtZW50KHtmaWVsZDogZmllbGQsIG9uQ2hhbmdlOiBjb21wb25lbnQub25DaGFuZ2UsIG9uQWN0aW9uOiBjb21wb25lbnQub25BY3Rpb259KVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgLy8gUmVuZGVyIGFueSBjb21wb25lbnQuXG4gICAgcmVuZGVyQ29tcG9uZW50OiBmdW5jdGlvbiAoY29tcG9uZW50KSB7XG5cbiAgICAgIHZhciBuYW1lID0gY29tcG9uZW50LmNvbnN0cnVjdG9yLmRpc3BsYXlOYW1lO1xuXG4gICAgICBpZiAoY29uZmlnWydyZW5kZXJDb21wb25lbnRfJyArIG5hbWVdKSB7XG4gICAgICAgIHJldHVybiBjb25maWdbJ3JlbmRlckNvbXBvbmVudF8nICsgbmFtZV0oY29tcG9uZW50KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNvbXBvbmVudC5yZW5kZXJEZWZhdWx0KCk7XG4gICAgfSxcblxuICAgIC8vIFJlbmRlciBmaWVsZCBjb21wb25lbnRzLlxuICAgIHJlbmRlckZpZWxkQ29tcG9uZW50OiBmdW5jdGlvbiAoY29tcG9uZW50KSB7XG5cbiAgICAgIHJldHVybiBjb25maWcucmVuZGVyQ29tcG9uZW50KGNvbXBvbmVudCk7XG4gICAgfSxcblxuICAgIC8vIE5vcm1hbGl6ZSBhbiBlbGVtZW50IG5hbWUuXG4gICAgZWxlbWVudE5hbWU6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICByZXR1cm4gdXRpbHMuZGFzaFRvUGFzY2FsKG5hbWUpO1xuICAgIH0sXG5cbiAgICAvLyBUeXBlIGFsaWFzZXMuXG5cbiAgICBhbGlhc19EaWN0OiAnT2JqZWN0JyxcblxuICAgIGFsaWFzX0Jvb2w6ICdCb29sZWFuJyxcblxuICAgIGFsaWFzX1ByZXR0eVRleHRhcmVhOiAnUHJldHR5VGV4dCcsXG5cbiAgICBhbGlhc19TaW5nbGVMaW5lU3RyaW5nOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSkge1xuICAgICAgaWYgKGZpZWxkVGVtcGxhdGUucmVwbGFjZUNob2ljZXMpIHtcbiAgICAgICAgcmV0dXJuICdQcmV0dHlUZXh0JztcbiAgICAgIH0gZWxzZSBpZiAoZmllbGRUZW1wbGF0ZS5jaG9pY2VzKSB7XG4gICAgICAgIHJldHVybiAnU2VsZWN0JztcbiAgICAgIH1cbiAgICAgIHJldHVybiAnU2luZ2xlTGluZVN0cmluZyc7XG4gICAgfSxcblxuICAgIGFsaWFzX1N0cmluZzogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcblxuICAgICAgaWYgKGZpZWxkVGVtcGxhdGUucmVwbGFjZUNob2ljZXMpIHtcbiAgICAgICAgcmV0dXJuICdQcmV0dHlUZXh0JztcbiAgICAgIH0gZWxzZSBpZiAoZmllbGRUZW1wbGF0ZS5jaG9pY2VzKSB7XG4gICAgICAgIHJldHVybiAnU2VsZWN0JztcbiAgICAgIH0gZWxzZSBpZiAoY29uZmlnLmZpZWxkVGVtcGxhdGVJc1NpbmdsZUxpbmUoZmllbGRUZW1wbGF0ZSkpIHtcbiAgICAgICAgcmV0dXJuICdTaW5nbGVMaW5lU3RyaW5nJztcbiAgICAgIH1cbiAgICAgIHJldHVybiAnU3RyaW5nJztcbiAgICB9LFxuXG4gICAgYWxpYXNfVGV4dDogZGVsZWdhdGVUbygnYWxpYXNfU3RyaW5nJyksXG5cbiAgICBhbGlhc19Vbmljb2RlOiBkZWxlZ2F0ZVRvKCdhbGlhc19TaW5nbGVMaW5lU3RyaW5nJyksXG5cbiAgICBhbGlhc19TdHI6IGRlbGVnYXRlVG8oJ2FsaWFzX1NpbmdsZUxpbmVTdHJpbmcnKSxcblxuICAgIGFsaWFzX0xpc3Q6ICdBcnJheScsXG5cbiAgICBhbGlhc19DaGVja2JveExpc3Q6ICdDaGVja2JveEFycmF5JyxcblxuICAgIGFsaWFzX0ZpZWxkc2V0OiAnRmllbGRzJyxcblxuICAgIGFsaWFzX0NoZWNrYm94OiAnQ2hlY2tib3hCb29sZWFuJyxcblxuICAgIC8vIEZpZWxkIGZhY3RvcnlcblxuICAgIC8vIEdpdmVuIGEgZmllbGQsIGV4cGFuZCBhbGwgY2hpbGQgZmllbGRzIHJlY3Vyc2l2ZWx5IHRvIGdldCB0aGUgZGVmYXVsdFxuICAgIC8vIHZhbHVlcyBvZiBhbGwgZmllbGRzLlxuICAgIGluZmxhdGVGaWVsZFZhbHVlOiBmdW5jdGlvbiAoZmllbGQsIGZpZWxkSGFuZGxlcikge1xuXG4gICAgICBpZiAoZmllbGRIYW5kbGVyKSB7XG4gICAgICAgIHZhciBzdG9wID0gZmllbGRIYW5kbGVyKGZpZWxkKTtcbiAgICAgICAgaWYgKHN0b3AgPT09IGZhbHNlKSB7XG4gICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoY29uZmlnLmZpZWxkSGFzVmFsdWVDaGlsZHJlbihmaWVsZCkpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gXy5jbG9uZShmaWVsZC52YWx1ZSk7XG4gICAgICAgIHZhciBjaGlsZEZpZWxkcyA9IGNvbmZpZy5jcmVhdGVDaGlsZEZpZWxkcyhmaWVsZCk7XG4gICAgICAgIGNoaWxkRmllbGRzLmZvckVhY2goZnVuY3Rpb24gKGNoaWxkRmllbGQpIHtcbiAgICAgICAgICBpZiAoY29uZmlnLmlzS2V5KGNoaWxkRmllbGQua2V5KSkge1xuICAgICAgICAgICAgdmFsdWVbY2hpbGRGaWVsZC5rZXldID0gY29uZmlnLmluZmxhdGVGaWVsZFZhbHVlKGNoaWxkRmllbGQsIGZpZWxkSGFuZGxlcik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZpZWxkLnZhbHVlO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBJbml0aWFsaXplIHRoZSByb290IGZpZWxkLlxuICAgIGluaXRSb290RmllbGQ6IGZ1bmN0aW9uICgvKiBmaWVsZCwgcHJvcHMgKi8pIHtcbiAgICB9LFxuXG4gICAgLy8gSW5pdGlhbGl6ZSBldmVyeSBmaWVsZC5cbiAgICBpbml0RmllbGQ6IGZ1bmN0aW9uICgvKiBmaWVsZCAqLykge1xuICAgIH0sXG5cbiAgICAvLyBJZiBhbiBhcnJheSBvZiBmaWVsZCB0ZW1wbGF0ZXMgYXJlIHBhc3NlZCBpbiwgdGhpcyBtZXRob2QgaXMgdXNlZCB0b1xuICAgIC8vIHdyYXAgdGhlIGZpZWxkcyBpbnNpZGUgYSBzaW5nbGUgcm9vdCBmaWVsZCB0ZW1wbGF0ZS5cbiAgICB3cmFwRmllbGRUZW1wbGF0ZXM6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlcykge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ2ZpZWxkcycsXG4gICAgICAgIHBsYWluOiB0cnVlLFxuICAgICAgICBmaWVsZHM6IGZpZWxkVGVtcGxhdGVzXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICAvLyBHaXZlbiB0aGUgcHJvcHMgdGhhdCBhcmUgcGFzc2VkIGluLCBjcmVhdGUgdGhlIHJvb3QgZmllbGQuXG4gICAgY3JlYXRlUm9vdEZpZWxkOiBmdW5jdGlvbiAocHJvcHMpIHtcblxuICAgICAgdmFyIGZpZWxkVGVtcGxhdGUgPSBwcm9wcy5maWVsZFRlbXBsYXRlIHx8IHByb3BzLmZpZWxkVGVtcGxhdGVzIHx8IHByb3BzLmZpZWxkIHx8IHByb3BzLmZpZWxkcztcbiAgICAgIHZhciB2YWx1ZSA9IHByb3BzLnZhbHVlO1xuXG4gICAgICBpZiAoIWZpZWxkVGVtcGxhdGUpIHtcbiAgICAgICAgZmllbGRUZW1wbGF0ZSA9IGNvbmZpZy5jcmVhdGVGaWVsZFRlbXBsYXRlRnJvbVZhbHVlKHZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKF8uaXNBcnJheShmaWVsZFRlbXBsYXRlKSkge1xuICAgICAgICBmaWVsZFRlbXBsYXRlID0gY29uZmlnLndyYXBGaWVsZFRlbXBsYXRlcyhmaWVsZFRlbXBsYXRlKTtcbiAgICAgIH1cblxuICAgICAgdmFyIGZpZWxkID0gXy5leHRlbmQoe30sIGZpZWxkVGVtcGxhdGUsIHtyYXdGaWVsZFRlbXBsYXRlOiBmaWVsZFRlbXBsYXRlfSk7XG4gICAgICBpZiAoY29uZmlnLmhhc1ZhbHVlKGZpZWxkVGVtcGxhdGUsIHZhbHVlKSkge1xuICAgICAgICBmaWVsZC52YWx1ZSA9IGNvbmZpZy5jb2VyY2VWYWx1ZShmaWVsZFRlbXBsYXRlLCB2YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmaWVsZC52YWx1ZSA9IGNvbmZpZy5jcmVhdGVEZWZhdWx0VmFsdWUoZmllbGRUZW1wbGF0ZSk7XG4gICAgICB9XG5cbiAgICAgIGNvbmZpZy5pbml0Um9vdEZpZWxkKGZpZWxkLCBwcm9wcyk7XG4gICAgICBjb25maWcuaW5pdEZpZWxkKGZpZWxkKTtcblxuICAgICAgaWYgKHZhbHVlID09PSBudWxsIHx8IGNvbmZpZy5pc0VtcHR5T2JqZWN0KHZhbHVlKSB8fCBfLmlzVW5kZWZpbmVkKHZhbHVlKSkge1xuICAgICAgICBmaWVsZC52YWx1ZSA9IGNvbmZpZy5pbmZsYXRlRmllbGRWYWx1ZShmaWVsZCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmaWVsZDtcbiAgICB9LFxuXG4gICAgLy8gR2l2ZW4gdGhlIHByb3BzIHRoYXQgYXJlIHBhc3NlZCBpbiwgY3JlYXRlIHRoZSB2YWx1ZSB0aGF0IHdpbGwgYmUgZGlzcGxheWVkXG4gICAgLy8gYnkgYWxsIHRoZSBjb21wb25lbnRzLlxuICAgIGNyZWF0ZVJvb3RWYWx1ZTogZnVuY3Rpb24gKHByb3BzLCBmaWVsZEhhbmRsZXIpIHtcblxuICAgICAgdmFyIGZpZWxkID0gY29uZmlnLmNyZWF0ZVJvb3RGaWVsZChwcm9wcyk7XG5cbiAgICAgIHJldHVybiBjb25maWcuaW5mbGF0ZUZpZWxkVmFsdWUoZmllbGQsIGZpZWxkSGFuZGxlcik7XG4gICAgfSxcblxuICAgIHZhbGlkYXRlUm9vdFZhbHVlOiBmdW5jdGlvbiAocHJvcHMpIHtcblxuICAgICAgdmFyIGVycm9ycyA9IFtdO1xuXG4gICAgICBjb25maWcuY3JlYXRlUm9vdFZhbHVlKHByb3BzLCBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgICAgdmFyIGZpZWxkRXJyb3JzID0gY29uZmlnLmZpZWxkRXJyb3JzKGZpZWxkKTtcbiAgICAgICAgaWYgKGZpZWxkRXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBlcnJvcnMucHVzaCh7XG4gICAgICAgICAgICBwYXRoOiBjb25maWcuZmllbGRWYWx1ZVBhdGgoZmllbGQpLFxuICAgICAgICAgICAgZXJyb3JzOiBmaWVsZEVycm9yc1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGVycm9ycztcbiAgICB9LFxuXG4gICAgaXNWYWxpZFJvb3RWYWx1ZTogZnVuY3Rpb24gKHByb3BzKSB7XG5cbiAgICAgIHZhciBpc1ZhbGlkID0gdHJ1ZTtcblxuICAgICAgY29uZmlnLmNyZWF0ZVJvb3RWYWx1ZShwcm9wcywgZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICAgIGlmIChjb25maWcuZmllbGRFcnJvcnMoZmllbGQpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBpc1ZhbGlkID0gZmFsc2U7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGlzVmFsaWQ7XG4gICAgfSxcblxuICAgIHZhbGlkYXRlRmllbGQ6IGZ1bmN0aW9uIChmaWVsZCwgZXJyb3JzKSB7XG5cbiAgICAgIGlmIChmaWVsZC52YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IGZpZWxkLnZhbHVlID09PSAnJykge1xuICAgICAgICBpZiAoY29uZmlnLmZpZWxkSXNSZXF1aXJlZChmaWVsZCkpIHtcbiAgICAgICAgICBlcnJvcnMucHVzaCh7XG4gICAgICAgICAgICB0eXBlOiAncmVxdWlyZWQnXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgY3NzVHJhbnNpdGlvbldyYXBwZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIENTU1RyYW5zaXRpb25Hcm91cCA9IFJlYWN0LmNyZWF0ZUZhY3RvcnkoUmVhY3QuYWRkb25zLkNTU1RyYW5zaXRpb25Hcm91cCk7XG4gICAgICB2YXIgYXJncyA9IFt7dHJhbnNpdGlvbk5hbWU6ICdyZXZlYWwnfV0uY29uY2F0KEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykpO1xuICAgICAgcmV0dXJuIENTU1RyYW5zaXRpb25Hcm91cC5hcHBseShudWxsLCBhcmdzKTtcbiAgICB9LFxuXG4gICAgLy8gQ3JlYXRlIGR5bmFtaWMgY2hpbGQgZmllbGRzIGZvciBhIGZpZWxkLlxuICAgIGNyZWF0ZUNoaWxkRmllbGRzOiBmdW5jdGlvbiAoZmllbGQpIHtcblxuICAgICAgdmFyIHR5cGVOYW1lID0gY29uZmlnLmZpZWxkVHlwZU5hbWUoZmllbGQpO1xuXG4gICAgICBpZiAoY29uZmlnWydjcmVhdGVDaGlsZEZpZWxkc18nICsgdHlwZU5hbWVdKSB7XG4gICAgICAgIHJldHVybiBjb25maWdbJ2NyZWF0ZUNoaWxkRmllbGRzXycgKyB0eXBlTmFtZV0oZmllbGQpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY29uZmlnLmZpZWxkQ2hpbGRGaWVsZFRlbXBsYXRlcyhmaWVsZCkubWFwKGZ1bmN0aW9uIChjaGlsZEZpZWxkLCBpKSB7XG4gICAgICAgIHJldHVybiBjb25maWcuY3JlYXRlQ2hpbGRGaWVsZChmaWVsZCwge1xuICAgICAgICAgIGZpZWxkVGVtcGxhdGU6IGNoaWxkRmllbGQsIGtleTogY2hpbGRGaWVsZC5rZXksIGZpZWxkSW5kZXg6IGksIHZhbHVlOiBmaWVsZC52YWx1ZVtjaGlsZEZpZWxkLmtleV1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgLy8gQ3JlYXRlIGEgc2luZ2xlIGNoaWxkIGZpZWxkIGZvciBhIHBhcmVudCBmaWVsZC5cbiAgICBjcmVhdGVDaGlsZEZpZWxkOiBmdW5jdGlvbiAocGFyZW50RmllbGQsIG9wdGlvbnMpIHtcblxuICAgICAgdmFyIGNoaWxkVmFsdWUgPSBvcHRpb25zLnZhbHVlO1xuXG4gICAgICB2YXIgY2hpbGRGaWVsZCA9IF8uZXh0ZW5kKHt9LCBvcHRpb25zLmZpZWxkVGVtcGxhdGUsIHtcbiAgICAgICAga2V5OiBvcHRpb25zLmtleSwgcGFyZW50OiBwYXJlbnRGaWVsZCwgZmllbGRJbmRleDogb3B0aW9ucy5maWVsZEluZGV4LFxuICAgICAgICByYXdGaWVsZFRlbXBsYXRlOiBvcHRpb25zLmZpZWxkVGVtcGxhdGVcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoY29uZmlnLmhhc1ZhbHVlKG9wdGlvbnMuZmllbGRUZW1wbGF0ZSwgY2hpbGRWYWx1ZSkpIHtcbiAgICAgICAgY2hpbGRGaWVsZC52YWx1ZSA9IGNvbmZpZy5jb2VyY2VWYWx1ZShvcHRpb25zLmZpZWxkVGVtcGxhdGUsIGNoaWxkVmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2hpbGRGaWVsZC52YWx1ZSA9IGNvbmZpZy5jcmVhdGVEZWZhdWx0VmFsdWUob3B0aW9ucy5maWVsZFRlbXBsYXRlKTtcbiAgICAgIH1cblxuICAgICAgY29uZmlnLmluaXRGaWVsZChjaGlsZEZpZWxkKTtcblxuICAgICAgcmV0dXJuIGNoaWxkRmllbGQ7XG4gICAgfSxcblxuICAgIC8vIENyZWF0ZSBhIHRlbXBvcmFyeSBmaWVsZCBhbmQgZXh0cmFjdCBpdHMgdmFsdWUuXG4gICAgY3JlYXRlTmV3Q2hpbGRGaWVsZFZhbHVlOiBmdW5jdGlvbiAocGFyZW50RmllbGQsIGl0ZW1GaWVsZEluZGV4KSB7XG5cbiAgICAgIHZhciBjaGlsZEZpZWxkVGVtcGxhdGUgPSBjb25maWcuZmllbGRJdGVtRmllbGRUZW1wbGF0ZXMocGFyZW50RmllbGQpW2l0ZW1GaWVsZEluZGV4XTtcblxuICAgICAgdmFyIG5ld1ZhbHVlID0gY29uZmlnLmZpZWxkVGVtcGxhdGVWYWx1ZShjaGlsZEZpZWxkVGVtcGxhdGUpO1xuXG4gICAgICAvLyBKdXN0IGEgcGxhY2Vob2xkZXIga2V5LiBTaG91bGQgbm90IGJlIGltcG9ydGFudC5cbiAgICAgIHZhciBrZXkgPSAnX191bmtub3duX2tleV9fJztcblxuICAgICAgaWYgKF8uaXNBcnJheShwYXJlbnRGaWVsZC52YWx1ZSkpIHtcbiAgICAgICAgLy8gSnVzdCBhIHBsYWNlaG9sZGVyIHBvc2l0aW9uIGZvciBhbiBhcnJheS5cbiAgICAgICAga2V5ID0gcGFyZW50RmllbGQudmFsdWUubGVuZ3RoO1xuICAgICAgfVxuXG4gICAgICAvLyBKdXN0IGEgcGxhY2Vob2xkZXIgZmllbGQgaW5kZXguIFNob3VsZCBub3QgYmUgaW1wb3J0YW50LlxuICAgICAgdmFyIGZpZWxkSW5kZXggPSAwO1xuICAgICAgaWYgKF8uaXNPYmplY3QocGFyZW50RmllbGQudmFsdWUpKSB7XG4gICAgICAgIGZpZWxkSW5kZXggPSBPYmplY3Qua2V5cyhwYXJlbnRGaWVsZC52YWx1ZSkubGVuZ3RoO1xuICAgICAgfVxuXG4gICAgICB2YXIgY2hpbGRGaWVsZCA9IGNvbmZpZy5jcmVhdGVDaGlsZEZpZWxkKHBhcmVudEZpZWxkLCB7XG4gICAgICAgIGZpZWxkVGVtcGxhdGU6IGNoaWxkRmllbGRUZW1wbGF0ZSwga2V5OiBrZXksIGZpZWxkSW5kZXg6IGZpZWxkSW5kZXgsIHZhbHVlOiBuZXdWYWx1ZVxuICAgICAgfSk7XG5cbiAgICAgIG5ld1ZhbHVlID0gY29uZmlnLmluZmxhdGVGaWVsZFZhbHVlKGNoaWxkRmllbGQpO1xuXG4gICAgICByZXR1cm4gbmV3VmFsdWU7XG4gICAgfSxcblxuICAgIC8vIEdpdmVuIGEgdmFsdWUsIGNyZWF0ZSBhIGZpZWxkIHRlbXBsYXRlIGZvciB0aGF0IHZhbHVlLlxuICAgIGNyZWF0ZUZpZWxkVGVtcGxhdGVGcm9tVmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuXG4gICAgICB2YXIgZmllbGQgPSB7XG4gICAgICAgIHR5cGU6ICdqc29uJ1xuICAgICAgfTtcbiAgICAgIGlmIChfLmlzU3RyaW5nKHZhbHVlKSkge1xuICAgICAgICBmaWVsZCA9IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICB9O1xuICAgICAgfSBlbHNlIGlmIChfLmlzTnVtYmVyKHZhbHVlKSkge1xuICAgICAgICBmaWVsZCA9IHtcbiAgICAgICAgICB0eXBlOiAnbnVtYmVyJ1xuICAgICAgICB9O1xuICAgICAgfSBlbHNlIGlmIChfLmlzQm9vbGVhbih2YWx1ZSkpIHtcbiAgICAgICAgZmllbGQgPSB7XG4gICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICAgIH07XG4gICAgICB9IGVsc2UgaWYgKF8uaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgdmFyIGFycmF5SXRlbUZpZWxkcyA9IHZhbHVlLm1hcChmdW5jdGlvbiAoY2hpbGRWYWx1ZSwgaSkge1xuICAgICAgICAgIHZhciBjaGlsZEZpZWxkID0gY29uZmlnLmNyZWF0ZUZpZWxkVGVtcGxhdGVGcm9tVmFsdWUoY2hpbGRWYWx1ZSk7XG4gICAgICAgICAgY2hpbGRGaWVsZC5rZXkgPSBpO1xuICAgICAgICAgIHJldHVybiBjaGlsZEZpZWxkO1xuICAgICAgICB9KTtcbiAgICAgICAgZmllbGQgPSB7XG4gICAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgICBmaWVsZHM6IGFycmF5SXRlbUZpZWxkc1xuICAgICAgICB9O1xuICAgICAgfSBlbHNlIGlmIChfLmlzT2JqZWN0KHZhbHVlKSkge1xuICAgICAgICB2YXIgb2JqZWN0SXRlbUZpZWxkcyA9IE9iamVjdC5rZXlzKHZhbHVlKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgIHZhciBjaGlsZEZpZWxkID0gY29uZmlnLmNyZWF0ZUZpZWxkVGVtcGxhdGVGcm9tVmFsdWUodmFsdWVba2V5XSk7XG4gICAgICAgICAgY2hpbGRGaWVsZC5rZXkgPSBrZXk7XG4gICAgICAgICAgY2hpbGRGaWVsZC5sYWJlbCA9IGNvbmZpZy5odW1hbml6ZShrZXkpO1xuICAgICAgICAgIHJldHVybiBjaGlsZEZpZWxkO1xuICAgICAgICB9KTtcbiAgICAgICAgZmllbGQgPSB7XG4gICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgZmllbGRzOiBvYmplY3RJdGVtRmllbGRzXG4gICAgICAgIH07XG4gICAgICB9IGVsc2UgaWYgKF8uaXNOdWxsKHZhbHVlKSkge1xuICAgICAgICBmaWVsZCA9IHtcbiAgICAgICAgICB0eXBlOiAnanNvbidcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmaWVsZDtcbiAgICB9LFxuXG4gICAgLy8gRGVmYXVsdCB2YWx1ZSBmYWN0b3J5XG5cbiAgICBjcmVhdGVEZWZhdWx0VmFsdWU6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG5cbiAgICAgIHZhciBkZWZhdWx0VmFsdWUgPSBjb25maWcuZmllbGRUZW1wbGF0ZURlZmF1bHRWYWx1ZShmaWVsZFRlbXBsYXRlKTtcblxuICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKGRlZmF1bHRWYWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIHV0aWxzLmRlZXBDb3B5KGRlZmF1bHRWYWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIHZhciB0eXBlTmFtZSA9IGNvbmZpZy5maWVsZFR5cGVOYW1lKGZpZWxkVGVtcGxhdGUpO1xuXG4gICAgICBpZiAoY29uZmlnWydjcmVhdGVEZWZhdWx0VmFsdWVfJyArIHR5cGVOYW1lXSkge1xuICAgICAgICByZXR1cm4gY29uZmlnWydjcmVhdGVEZWZhdWx0VmFsdWVfJyArIHR5cGVOYW1lXShmaWVsZFRlbXBsYXRlKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuICcnO1xuICAgIH0sXG5cbiAgICAvLyBGaWVsZCBoZWxwZXJzXG5cbiAgICAvLyBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBcImV4aXN0c1wiLlxuICAgIGhhc1ZhbHVlOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSwgdmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZSAhPT0gbnVsbCAmJiAhXy5pc1VuZGVmaW5lZCh2YWx1ZSk7XG4gICAgfSxcblxuICAgIC8vIENvZXJjZSBhIHZhbHVlIHRvIHZhbHVlIGFwcHJvcHJpYXRlIGZvciBhIGZpZWxkLlxuICAgIGNvZXJjZVZhbHVlOiBmdW5jdGlvbiAoZmllbGQsIHZhbHVlKSB7XG5cbiAgICAgIHZhciB0eXBlTmFtZSA9IGNvbmZpZy5maWVsZFR5cGVOYW1lKGZpZWxkKTtcblxuICAgICAgaWYgKGNvbmZpZ1snY29lcmNlVmFsdWVfJyArIHR5cGVOYW1lXSkge1xuICAgICAgICByZXR1cm4gY29uZmlnWydjb2VyY2VWYWx1ZV8nICsgdHlwZU5hbWVdKGZpZWxkLCB2YWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9LFxuXG4gICAgLy8gR2l2ZW4gYSBmaWVsZCBhbmQgYSBjaGlsZCB2YWx1ZSwgZmluZCB0aGUgYXBwcm9wcmlhdGUgZmllbGQgdGVtcGxhdGUgZm9yXG4gICAgLy8gdGhhdCBjaGlsZCB2YWx1ZS5cbiAgICBjaGlsZEZpZWxkVGVtcGxhdGVGb3JWYWx1ZTogZnVuY3Rpb24gKGZpZWxkLCBjaGlsZFZhbHVlKSB7XG5cbiAgICAgIHZhciBmaWVsZFRlbXBsYXRlO1xuXG4gICAgICB2YXIgZmllbGRUZW1wbGF0ZXMgPSBjb25maWcuZmllbGRJdGVtRmllbGRUZW1wbGF0ZXMoZmllbGQpO1xuXG4gICAgICBmaWVsZFRlbXBsYXRlID0gXy5maW5kKGZpZWxkVGVtcGxhdGVzLCBmdW5jdGlvbiAoaXRlbUZpZWxkVGVtcGxhdGUpIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZy5tYXRjaGVzRmllbGRUZW1wbGF0ZVRvVmFsdWUoaXRlbUZpZWxkVGVtcGxhdGUsIGNoaWxkVmFsdWUpO1xuICAgICAgfSk7XG5cbiAgICAgIGlmIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgICAgIHJldHVybiBmaWVsZFRlbXBsYXRlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVGaWVsZFRlbXBsYXRlRnJvbVZhbHVlKGNoaWxkVmFsdWUpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIG1hdGNoIGZvciBhIGZpZWxkIHRlbXBsYXRlLlxuICAgIG1hdGNoZXNGaWVsZFRlbXBsYXRlVG9WYWx1ZTogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUsIHZhbHVlKSB7XG4gICAgICB2YXIgbWF0Y2ggPSBmaWVsZFRlbXBsYXRlLm1hdGNoO1xuICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBfLmV2ZXJ5KE9iamVjdC5rZXlzKG1hdGNoKSwgZnVuY3Rpb24gKGtleSkge1xuICAgICAgICByZXR1cm4gXy5pc0VxdWFsKG1hdGNoW2tleV0sIHZhbHVlW2tleV0pO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8vIEZpZWxkIHRlbXBsYXRlIGhlbHBlcnNcblxuICAgIC8vIE5vcm1hbGl6ZWQgKFBhc2NhbENhc2UpIHR5cGUgbmFtZSBmb3IgYSBmaWVsZC5cbiAgICBmaWVsZFRlbXBsYXRlVHlwZU5hbWU6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG5cbiAgICAgIHZhciB0eXBlTmFtZSA9IHV0aWxzLmRhc2hUb1Bhc2NhbChmaWVsZFRlbXBsYXRlLnR5cGUgfHwgJ3VuZGVmaW5lZCcpO1xuXG4gICAgICB2YXIgYWxpYXMgPSBjb25maWdbJ2FsaWFzXycgKyB0eXBlTmFtZV07XG5cbiAgICAgIGlmIChhbGlhcykge1xuICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKGFsaWFzKSkge1xuICAgICAgICAgIHJldHVybiBhbGlhcy5jYWxsKGNvbmZpZywgZmllbGRUZW1wbGF0ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGFsaWFzO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChmaWVsZFRlbXBsYXRlLmxpc3QpIHtcbiAgICAgICAgdHlwZU5hbWUgPSAnQXJyYXknO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHlwZU5hbWU7XG4gICAgfSxcblxuICAgIC8vIERlZmF1bHQgdmFsdWUgZm9yIGEgZmllbGQgdGVtcGxhdGUuXG4gICAgZmllbGRUZW1wbGF0ZURlZmF1bHRWYWx1ZTogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcblxuICAgICAgcmV0dXJuIGZpZWxkVGVtcGxhdGUuZGVmYXVsdDtcbiAgICB9LFxuXG4gICAgLy8gVmFsdWUgZm9yIGEgZmllbGQgdGVtcGxhdGUuIFVzZWQgdG8gZGV0ZXJtaW5lIHRoZSB2YWx1ZSBvZiBhIG5ldyBjaGlsZFxuICAgIC8vIGZpZWxkLlxuICAgIGZpZWxkVGVtcGxhdGVWYWx1ZTogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcblxuICAgICAgLy8gVGhpcyBsb2dpYyBtaWdodCBiZSBicml0dGxlLlxuXG4gICAgICB2YXIgZGVmYXVsdFZhbHVlID0gY29uZmlnLmZpZWxkVGVtcGxhdGVEZWZhdWx0VmFsdWUoZmllbGRUZW1wbGF0ZSk7XG5cbiAgICAgIHZhciBtYXRjaCA9IGNvbmZpZy5maWVsZFRlbXBsYXRlTWF0Y2goZmllbGRUZW1wbGF0ZSk7XG5cbiAgICAgIHZhciB2YWx1ZTtcblxuICAgICAgaWYgKF8uaXNVbmRlZmluZWQoZGVmYXVsdFZhbHVlKSAmJiAhXy5pc1VuZGVmaW5lZChtYXRjaCkpIHtcbiAgICAgICAgcmV0dXJuIHV0aWxzLmRlZXBDb3B5KG1hdGNoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBjb25maWcuY3JlYXRlRGVmYXVsdFZhbHVlKGZpZWxkVGVtcGxhdGUpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcblxuICAgIC8vIE1hdGNoIHJ1bGUgZm9yIGEgZmllbGQgdGVtcGxhdGUuXG4gICAgZmllbGRUZW1wbGF0ZU1hdGNoOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSkge1xuICAgICAgcmV0dXJuIGZpZWxkVGVtcGxhdGUubWF0Y2g7XG4gICAgfSxcblxuICAgIC8vIERldGVybWluZSBpZiBhIGZpZWxkIHRlbXBsYXRlIGhhcyBhIHNpbmdsZS1saW5lIHZhbHVlLlxuICAgIGZpZWxkVGVtcGxhdGVJc1NpbmdsZUxpbmU6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgICByZXR1cm4gZmllbGRUZW1wbGF0ZS5pc1NpbmdsZUxpbmUgfHwgZmllbGRUZW1wbGF0ZS5pc19zaW5nbGVfbGluZSB8fFxuICAgICAgICAgICAgICBmaWVsZFRlbXBsYXRlLnR5cGUgPT09ICdzaW5nbGUtbGluZS1zdHJpbmcnIHx8IGZpZWxkVGVtcGxhdGUudHlwZSA9PT0gJ1NpbmdsZUxpbmVTdHJpbmcnO1xuICAgIH0sXG5cbiAgICAvLyBGaWVsZCBoZWxwZXJzXG5cbiAgICAvLyBHZXQgYW4gYXJyYXkgb2Yga2V5cyByZXByZXNlbnRpbmcgdGhlIHBhdGggdG8gYSB2YWx1ZS5cbiAgICBmaWVsZFZhbHVlUGF0aDogZnVuY3Rpb24gKGZpZWxkKSB7XG5cbiAgICAgIHZhciBwYXJlbnRQYXRoID0gW107XG5cbiAgICAgIGlmIChmaWVsZC5wYXJlbnQpIHtcbiAgICAgICAgcGFyZW50UGF0aCA9IGNvbmZpZy5maWVsZFZhbHVlUGF0aChmaWVsZC5wYXJlbnQpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcGFyZW50UGF0aC5jb25jYXQoZmllbGQua2V5KS5maWx0ZXIoZnVuY3Rpb24gKGtleSkge1xuICAgICAgICByZXR1cm4gIV8uaXNVbmRlZmluZWQoa2V5KSAmJiBrZXkgIT09ICcnO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8vIENsb25lIGEgZmllbGQgd2l0aCBhIGRpZmZlcmVudCB2YWx1ZS5cbiAgICBmaWVsZFdpdGhWYWx1ZTogZnVuY3Rpb24gKGZpZWxkLCB2YWx1ZSkge1xuICAgICAgcmV0dXJuIF8uZXh0ZW5kKHt9LCBmaWVsZCwge3ZhbHVlOiB2YWx1ZX0pO1xuICAgIH0sXG5cbiAgICBmaWVsZFR5cGVOYW1lOiBkZWxlZ2F0ZVRvKCdmaWVsZFRlbXBsYXRlVHlwZU5hbWUnKSxcblxuICAgIC8vIEZpZWxkIGlzIGxvYWRpbmcgY2hvaWNlcy5cbiAgICBmaWVsZElzTG9hZGluZzogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICByZXR1cm4gZmllbGQuaXNMb2FkaW5nO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgdGhlIGNob2ljZXMgZm9yIGEgZHJvcGRvd24gZmllbGQuXG4gICAgZmllbGRDaG9pY2VzOiBmdW5jdGlvbiAoZmllbGQpIHtcblxuICAgICAgcmV0dXJuIGNvbmZpZy5ub3JtYWxpemVDaG9pY2VzKGZpZWxkLmNob2ljZXMpO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgdGhlIGNob2ljZXMgZm9yIGEgcHJldHR5IGRyb3Bkb3duIGZpZWxkLlxuICAgIGZpZWxkUHJldHR5Q2hvaWNlczogZnVuY3Rpb24gKGZpZWxkKSB7XG5cbiAgICAgIHJldHVybiBjb25maWcubm9ybWFsaXplUHJldHR5Q2hvaWNlcyhmaWVsZC5jaG9pY2VzKTtcbiAgICB9LFxuXG4gICAgLy8gR2V0IGEgc2V0IG9mIGJvb2xlYW4gY2hvaWNlcyBmb3IgYSBmaWVsZC5cbiAgICBmaWVsZEJvb2xlYW5DaG9pY2VzOiBmdW5jdGlvbiAoZmllbGQpIHtcblxuICAgICAgdmFyIGNob2ljZXMgPSBjb25maWcuZmllbGRDaG9pY2VzKGZpZWxkKTtcblxuICAgICAgaWYgKGNob2ljZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBbe1xuICAgICAgICAgIGxhYmVsOiAneWVzJyxcbiAgICAgICAgICB2YWx1ZTogdHJ1ZVxuICAgICAgICB9LCB7XG4gICAgICAgICAgbGFiZWw6ICdubycsXG4gICAgICAgICAgdmFsdWU6IGZhbHNlXG4gICAgICAgIH1dO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY2hvaWNlcy5tYXAoZnVuY3Rpb24gKGNob2ljZSkge1xuICAgICAgICBpZiAoXy5pc0Jvb2xlYW4oY2hvaWNlLnZhbHVlKSkge1xuICAgICAgICAgIHJldHVybiBjaG9pY2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF8uZXh0ZW5kKHt9LCBjaG9pY2UsIHtcbiAgICAgICAgICB2YWx1ZTogY29uZmlnLmNvZXJjZVZhbHVlVG9Cb29sZWFuKGNob2ljZS52YWx1ZSlcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgLy8gR2V0IGEgc2V0IG9mIHJlcGxhY2VtZW50IGNob2ljZXMgZm9yIGEgZmllbGQuXG4gICAgZmllbGRSZXBsYWNlQ2hvaWNlczogZnVuY3Rpb24gKGZpZWxkKSB7XG5cbiAgICAgIHJldHVybiBjb25maWcubm9ybWFsaXplQ2hvaWNlcyhmaWVsZC5yZXBsYWNlQ2hvaWNlcyk7XG4gICAgfSxcblxuICAgIC8vIFRoZSBhY3RpdmUgc2VsZWN0ZWQgY2hvaWNlIGNvdWxkIGJlIHVuYXZhaWxhYmxlIGluIHRoZSBjdXJyZW50IGxpc3Qgb2ZcbiAgICAvLyBjaG9pY2VzLiBUaGlzIHByb3ZpZGVzIHRoZSBzZWxlY3RlZCBjaG9pY2UgaW4gdGhhdCBjYXNlLlxuICAgIGZpZWxkU2VsZWN0ZWRDaG9pY2U6IGZ1bmN0aW9uIChmaWVsZCkge1xuXG4gICAgICByZXR1cm4gZmllbGQuc2VsZWN0ZWRDaG9pY2UgfHwgbnVsbDtcbiAgICB9LFxuXG4gICAgLy8gVGhlIGFjdGl2ZSByZXBsYWNlIGxhYmVscyBjb3VsZCBiZSB1bmF2aWxhYmxlIGluIHRoZSBjdXJyZW50IGxpc3Qgb2ZcbiAgICAvLyByZXBsYWNlIGNob2ljZXMuIFRoaXMgcHJvdmlkZXMgdGhlIGN1cnJlbnRseSB1c2VkIHJlcGxhY2UgbGFiZWxzIGluXG4gICAgLy8gdGhhdCBjYXNlLlxuICAgIGZpZWxkU2VsZWN0ZWRSZXBsYWNlQ2hvaWNlczogZnVuY3Rpb24gKGZpZWxkKSB7XG5cbiAgICAgIHJldHVybiBjb25maWcubm9ybWFsaXplQ2hvaWNlcyhmaWVsZC5zZWxlY3RlZFJlcGxhY2VDaG9pY2VzKTtcbiAgICB9LFxuXG4gICAgLy8gR2V0IGEgbGFiZWwgZm9yIGEgZmllbGQuXG4gICAgZmllbGRMYWJlbDogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICByZXR1cm4gZmllbGQubGFiZWw7XG4gICAgfSxcblxuICAgIC8vIEdldCBhIHBsYWNlaG9sZGVyIChqdXN0IGEgZGVmYXVsdCBkaXNwbGF5IHZhbHVlLCBub3QgYSBkZWZhdWx0IHZhbHVlKSBmb3IgYSBmaWVsZC5cbiAgICBmaWVsZFBsYWNlaG9sZGVyOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgIHJldHVybiBmaWVsZC5wbGFjZWhvbGRlcjtcbiAgICB9LFxuXG4gICAgLy8gR2V0IHRoZSBoZWxwIHRleHQgZm9yIGEgZmllbGQuXG4gICAgZmllbGRIZWxwVGV4dDogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICByZXR1cm4gZmllbGQuaGVscF90ZXh0X2h0bWwgfHwgZmllbGQuaGVscF90ZXh0IHx8IGZpZWxkLmhlbHBUZXh0IHx8IGZpZWxkLmhlbHBUZXh0SHRtbDtcbiAgICB9LFxuXG4gICAgLy8gR2V0IHdoZXRoZXIgb3Igbm90IGEgZmllbGQgaXMgcmVxdWlyZWQuXG4gICAgZmllbGRJc1JlcXVpcmVkOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgIHJldHVybiBmaWVsZC5yZXF1aXJlZCA/IHRydWUgOiBmYWxzZTtcbiAgICB9LFxuXG4gICAgLy8gRGV0ZXJtaW5lIGlmIHZhbHVlIGZvciB0aGlzIGZpZWxkIGlzIG5vdCBhIGxlYWYgdmFsdWUuXG4gICAgZmllbGRIYXNWYWx1ZUNoaWxkcmVuOiBmdW5jdGlvbiAoZmllbGQpIHtcblxuICAgICAgdmFyIGRlZmF1bHRWYWx1ZSA9IGNvbmZpZy5jcmVhdGVEZWZhdWx0VmFsdWUoZmllbGQpO1xuXG4gICAgICBpZiAoXy5pc09iamVjdChkZWZhdWx0VmFsdWUpIHx8IF8uaXNBcnJheShkZWZhdWx0VmFsdWUpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIC8vIEdldCB0aGUgY2hpbGQgZmllbGQgdGVtcGxhdGVzIGZvciB0aGlzIGZpZWxkLlxuICAgIGZpZWxkQ2hpbGRGaWVsZFRlbXBsYXRlczogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICByZXR1cm4gZmllbGQuZmllbGRzIHx8IFtdO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgdGhlIGZpZWxkIHRlbXBsYXRlcyBmb3IgZWFjaCBpdGVtIG9mIHRoaXMgZmllbGQuIChGb3IgZHluYW1pYyBjaGlsZHJlbixcbiAgICAvLyBsaWtlIGFycmF5cy4pXG4gICAgZmllbGRJdGVtRmllbGRUZW1wbGF0ZXM6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgaWYgKCFmaWVsZC5pdGVtRmllbGRzKSB7XG4gICAgICAgIHJldHVybiBbe3R5cGU6ICd0ZXh0J31dO1xuICAgICAgfVxuICAgICAgaWYgKCFfLmlzQXJyYXkoZmllbGQuaXRlbUZpZWxkcykpIHtcbiAgICAgICAgcmV0dXJuIFtmaWVsZC5pdGVtRmllbGRzXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmaWVsZC5pdGVtRmllbGRzO1xuICAgIH0sXG5cbiAgICBmaWVsZElzU2luZ2xlTGluZTogZGVsZWdhdGVUbygnZmllbGRUZW1wbGF0ZUlzU2luZ2xlTGluZScpLFxuXG4gICAgLy8gR2V0IHdoZXRoZXIgb3Igbm90IGEgZmllbGQgaXMgY29sbGFwc2VkLlxuICAgIGZpZWxkSXNDb2xsYXBzZWQ6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgcmV0dXJuIGZpZWxkLmNvbGxhcHNlZCA/IHRydWUgOiBmYWxzZTtcbiAgICB9LFxuXG4gICAgLy8gR2V0IHdoZXRlciBvciBub3QgYSBmaWVsZCBjYW4gYmUgY29sbGFwc2VkLlxuICAgIGZpZWxkSXNDb2xsYXBzaWJsZTogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICByZXR1cm4gZmllbGQuY29sbGFwc2libGUgfHwgIV8uaXNVbmRlZmluZWQoZmllbGQuY29sbGFwc2VkKTtcbiAgICB9LFxuXG4gICAgLy8gR2V0IHRoZSBudW1iZXIgb2Ygcm93cyBmb3IgYSBmaWVsZC5cbiAgICBmaWVsZFJvd3M6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgcmV0dXJuIGZpZWxkLnJvd3M7XG4gICAgfSxcblxuICAgIGZpZWxkRXJyb3JzOiBmdW5jdGlvbiAoZmllbGQpIHtcblxuICAgICAgdmFyIGVycm9ycyA9IFtdO1xuXG4gICAgICBpZiAoY29uZmlnLmlzS2V5KGZpZWxkLmtleSkpIHtcbiAgICAgICAgY29uZmlnLnZhbGlkYXRlRmllbGQoZmllbGQsIGVycm9ycyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBlcnJvcnM7XG4gICAgfSxcblxuICAgIGZpZWxkTWF0Y2g6IGRlbGVnYXRlVG8oJ2ZpZWxkVGVtcGxhdGVNYXRjaCcpLFxuXG4gICAgLy8gT3RoZXIgaGVscGVyc1xuXG4gICAgLy8gQ29udmVydCBhIGtleSB0byBhIG5pY2UgaHVtYW4tcmVhZGFibGUgdmVyc2lvbi5cbiAgICBodW1hbml6ZTogZnVuY3Rpb24ocHJvcGVydHkpIHtcbiAgICAgIHByb3BlcnR5ID0gcHJvcGVydHkucmVwbGFjZSgvXFx7XFx7L2csICcnKTtcbiAgICAgIHByb3BlcnR5ID0gcHJvcGVydHkucmVwbGFjZSgvXFx9XFx9L2csICcnKTtcbiAgICAgIHJldHVybiBwcm9wZXJ0eS5yZXBsYWNlKC9fL2csICcgJylcbiAgICAgIC5yZXBsYWNlKC8oXFx3KykvZywgZnVuY3Rpb24obWF0Y2gpIHtcbiAgICAgICAgcmV0dXJuIG1hdGNoLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgbWF0Y2guc2xpY2UoMSk7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgLy8gTm9ybWFsaXplIHNvbWUgY2hvaWNlcyBmb3IgYSBkcm9wLWRvd24uXG4gICAgbm9ybWFsaXplQ2hvaWNlczogZnVuY3Rpb24gKGNob2ljZXMpIHtcblxuICAgICAgaWYgKCFjaG9pY2VzKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH1cblxuICAgICAgLy8gQ29udmVydCBjb21tYSBzZXBhcmF0ZWQgc3RyaW5nIHRvIGFycmF5IG9mIHN0cmluZ3MuXG4gICAgICBpZiAoXy5pc1N0cmluZyhjaG9pY2VzKSkge1xuICAgICAgICBjaG9pY2VzID0gY2hvaWNlcy5zcGxpdCgnLCcpO1xuICAgICAgfVxuXG4gICAgICAvLyBDb252ZXJ0IG9iamVjdCB0byBhcnJheSBvZiBvYmplY3RzIHdpdGggYHZhbHVlYCBhbmQgYGxhYmVsYCBwcm9wZXJ0aWVzLlxuICAgICAgaWYgKCFfLmlzQXJyYXkoY2hvaWNlcykgJiYgXy5pc09iamVjdChjaG9pY2VzKSkge1xuICAgICAgICBjaG9pY2VzID0gT2JqZWN0LmtleXMoY2hvaWNlcykubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdmFsdWU6IGtleSxcbiAgICAgICAgICAgIGxhYmVsOiBjaG9pY2VzW2tleV1cbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gQ29weSB0aGUgYXJyYXkgb2YgY2hvaWNlcyBzbyB3ZSBjYW4gbWFuaXB1bGF0ZSB0aGVtLlxuICAgICAgY2hvaWNlcyA9IGNob2ljZXMuc2xpY2UoMCk7XG5cbiAgICAgIC8vIEFycmF5IG9mIGNob2ljZSBhcnJheXMgc2hvdWxkIGJlIGZsYXR0ZW5lZC5cbiAgICAgIGNob2ljZXMgPSBfLmZsYXR0ZW4oY2hvaWNlcyk7XG5cbiAgICAgIGNob2ljZXMuZm9yRWFjaChmdW5jdGlvbiAoY2hvaWNlLCBpKSB7XG4gICAgICAgIC8vIENvbnZlcnQgYW55IHN0cmluZyBjaG9pY2VzIHRvIG9iamVjdHMgd2l0aCBgdmFsdWVgIGFuZCBgbGFiZWxgXG4gICAgICAgIC8vIHByb3BlcnRpZXMuXG4gICAgICAgIGlmIChfLmlzU3RyaW5nKGNob2ljZSkpIHtcbiAgICAgICAgICBjaG9pY2VzW2ldID0ge1xuICAgICAgICAgICAgdmFsdWU6IGNob2ljZSxcbiAgICAgICAgICAgIGxhYmVsOiBjb25maWcuaHVtYW5pemUoY2hvaWNlKVxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFjaG9pY2VzW2ldLmxhYmVsKSB7XG4gICAgICAgICAgY2hvaWNlc1tpXS5sYWJlbCA9IGNvbmZpZy5odW1hbml6ZShjaG9pY2VzW2ldLnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBjaG9pY2VzO1xuICAgIH0sXG5cbiAgICAvLyBOb3JtYWxpemUgY2hvaWNlcyBmb3IgYSBwcmV0dHkgZHJvcCBkb3duLCB3aXRoICdzYW1wbGUnIHZhbHVlc1xuICAgIG5vcm1hbGl6ZVByZXR0eUNob2ljZXM6IGZ1bmN0aW9uIChjaG9pY2VzKSB7XG4gICAgICBpZiAoIV8uaXNBcnJheShjaG9pY2VzKSAmJiBfLmlzT2JqZWN0KGNob2ljZXMpKSB7XG4gICAgICAgIGNob2ljZXMgPSBPYmplY3Qua2V5cyhjaG9pY2VzKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWx1ZToga2V5LFxuICAgICAgICAgICAgbGFiZWw6IGNob2ljZXNba2V5XSxcbiAgICAgICAgICAgIHNhbXBsZToga2V5XG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjb25maWcubm9ybWFsaXplQ2hvaWNlcyhjaG9pY2VzKTtcbiAgICB9LFxuXG4gICAgLy8gQ29lcmNlIGEgdmFsdWUgdG8gYSBib29sZWFuXG4gICAgY29lcmNlVmFsdWVUb0Jvb2xlYW46IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgaWYgKCFfLmlzU3RyaW5nKHZhbHVlKSkge1xuICAgICAgICAvLyBKdXN0IHVzZSB0aGUgZGVmYXVsdCB0cnV0aGluZXNzLlxuICAgICAgICByZXR1cm4gdmFsdWUgPyB0cnVlIDogZmFsc2U7XG4gICAgICB9XG4gICAgICB2YWx1ZSA9IHZhbHVlLnRvTG93ZXJDYXNlKCk7XG4gICAgICBpZiAodmFsdWUgPT09ICcnIHx8IHZhbHVlID09PSAnbm8nIHx8IHZhbHVlID09PSAnb2ZmJyB8fCB2YWx1ZSA9PT0gJ2ZhbHNlJykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuXG4gICAgLy8gRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSB2YWxpZCBrZXkuXG4gICAgaXNLZXk6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHJldHVybiAoXy5pc051bWJlcihrZXkpICYmIGtleSA+PSAwKSB8fCAoXy5pc1N0cmluZyhrZXkpICYmIGtleSAhPT0gJycpO1xuICAgIH0sXG5cbiAgICAvLyBGYXN0IHdheSB0byBjaGVjayBmb3IgZW1wdHkgb2JqZWN0LlxuICAgIGlzRW1wdHlPYmplY3Q6IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgIGZvcih2YXIga2V5IGluIG9iaikge1xuICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cbiAgICBhY3Rpb25DaG9pY2VMYWJlbDogZnVuY3Rpb24gKGFjdGlvbikge1xuICAgICAgcmV0dXJuIHV0aWxzLmNhcGl0YWxpemUoYWN0aW9uKS5yZXBsYWNlKC9bLV0vZywgJyAnKTtcbiAgICB9XG4gIH07XG59O1xuIiwiLy8gIyBmb3JtYXRpY1xuXG4vKlxuVGhlIHJvb3QgZm9ybWF0aWMgY29tcG9uZW50LlxuXG5UaGUgcm9vdCBmb3JtYXRpYyBjb21wb25lbnQgaXMgYWN0dWFsbHkgdHdvIGNvbXBvbmVudHMuIFRoZSBtYWluIGNvbXBvbmVudCBpc1xuYSBjb250cm9sbGVkIGNvbXBvbmVudCB3aGVyZSB5b3UgbXVzdCBwYXNzIHRoZSB2YWx1ZSBpbiB3aXRoIGVhY2ggcmVuZGVyLiBUaGlzXG5pcyBhY3R1YWxseSB3cmFwcGVkIGluIGFub3RoZXIgY29tcG9uZW50IHdoaWNoIGFsbG93cyB5b3UgdG8gdXNlIGZvcm1hdGljIGFzXG5hbiB1bmNvbnRyb2xsZWQgY29tcG9uZW50IHdoZXJlIGl0IHJldGFpbnMgdGhlIHN0YXRlIG9mIHRoZSB2YWx1ZS4gVGhlIHdyYXBwZXJcbmlzIHdoYXQgaXMgYWN0dWFsbHkgZXhwb3J0ZWQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIF8gPSByZXF1aXJlKCcuL3VuZGFzaCcpO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbnZhciBkZWZhdWx0Q29uZmlnUGx1Z2luID0gcmVxdWlyZSgnLi9kZWZhdWx0LWNvbmZpZycpO1xuXG52YXIgY3JlYXRlQ29uZmlnID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgdmFyIHBsdWdpbnMgPSBbZGVmYXVsdENvbmZpZ1BsdWdpbl0uY29uY2F0KGFyZ3MpO1xuXG4gIHJldHVybiBwbHVnaW5zLnJlZHVjZShmdW5jdGlvbiAoY29uZmlnLCBwbHVnaW4pIHtcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKHBsdWdpbikpIHtcbiAgICAgIHZhciBleHRlbnNpb25zID0gcGx1Z2luKGNvbmZpZyk7XG4gICAgICBpZiAoZXh0ZW5zaW9ucykge1xuICAgICAgICBfLmV4dGVuZChjb25maWcsIGV4dGVuc2lvbnMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBfLmV4dGVuZChjb25maWcsIHBsdWdpbik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbmZpZztcbiAgfSwge30pO1xufTtcblxudmFyIGRlZmF1bHRDb25maWcgPSBjcmVhdGVDb25maWcoKTtcblxuLy8gVGhlIG1haW4gZm9ybWF0aWMgY29tcG9uZW50IHRoYXQgcmVuZGVycyB0aGUgZm9ybS5cbnZhciBGb3JtYXRpY0NvbnRyb2xsZWRDbGFzcyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0Zvcm1hdGljQ29udHJvbGxlZCcsXG5cbiAgLy8gUmVzcG9uZCB0byBhbnkgdmFsdWUgY2hhbmdlcy5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgaW5mbykge1xuICAgIGlmICghdGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpbmZvID0gXy5leHRlbmQoe30sIGluZm8pO1xuICAgIGluZm8ucGF0aCA9IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkVmFsdWVQYXRoKGluZm8uZmllbGQpO1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UobmV3VmFsdWUsIGluZm8pO1xuICB9LFxuXG4gIC8vIFJlc3BvbmQgdG8gYW55IGFjdGlvbnMgb3RoZXIgdGhhbiB2YWx1ZSBjaGFuZ2VzLiAoRm9yIGV4YW1wbGUsIGZvY3VzIGFuZFxuICAvLyBibHVyLilcbiAgb25BY3Rpb246IGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgaWYgKCF0aGlzLnByb3BzLm9uQWN0aW9uKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGluZm8gPSBfLmV4dGVuZCh7fSwgaW5mbyk7XG4gICAgaW5mby5wYXRoID0gdGhpcy5wcm9wcy5jb25maWcuZmllbGRWYWx1ZVBhdGgoaW5mby5maWVsZCk7XG4gICAgdGhpcy5wcm9wcy5vbkFjdGlvbihpbmZvKTtcbiAgfSxcblxuICAvLyBSZW5kZXIgdGhlIHJvb3QgY29tcG9uZW50IGJ5IGRlbGVnYXRpbmcgdG8gdGhlIGNvbmZpZy5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG5cbiAgICByZXR1cm4gY29uZmlnLnJlbmRlckZvcm1hdGljQ29tcG9uZW50KHRoaXMpO1xuICB9XG59KTtcblxudmFyIEZvcm1hdGljQ29udHJvbGxlZCA9IFJlYWN0LmNyZWF0ZUZhY3RvcnkoRm9ybWF0aWNDb250cm9sbGVkQ2xhc3MpO1xuXG4vLyBBIHdyYXBwZXIgY29tcG9uZW50IHRoYXQgaXMgYWN0dWFsbHkgZXhwb3J0ZWQgYW5kIGNhbiBhbGxvdyBmb3JtYXRpYyB0byBiZVxuLy8gdXNlZCBpbiBhbiBcInVuY29udHJvbGxlZFwiIG1hbm5lci4gKFNlZSB1bmNvbnRyb2xsZWQgY29tcG9uZW50cyBpbiB0aGUgUmVhY3Rcbi8vIGRvY3VtZW50YXRpb24gZm9yIGFuIGV4cGxhbmF0aW9uIG9mIHRoZSBkaWZmZXJlbmNlLilcbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIC8vIEV4cG9ydCBzb21lIHN0dWZmIGFzIHN0YXRpY3MuXG4gIHN0YXRpY3M6IHtcbiAgICBjcmVhdGVDb25maWc6IGNyZWF0ZUNvbmZpZyxcbiAgICBhdmFpbGFibGVNaXhpbnM6IHtcbiAgICAgIGNsaWNrT3V0c2lkZTogcmVxdWlyZSgnLi9taXhpbnMvY2xpY2stb3V0c2lkZS5qcycpLFxuICAgICAgZmllbGQ6IHJlcXVpcmUoJy4vbWl4aW5zL2ZpZWxkLmpzJyksXG4gICAgICBoZWxwZXI6IHJlcXVpcmUoJy4vbWl4aW5zL2hlbHBlci5qcycpLFxuICAgICAgcmVzaXplOiByZXF1aXJlKCcuL21peGlucy9yZXNpemUuanMnKSxcbiAgICAgIHNjcm9sbDogcmVxdWlyZSgnLi9taXhpbnMvc2Nyb2xsLmpzJyksXG4gICAgICB1bmRvU3RhY2s6IHJlcXVpcmUoJy4vbWl4aW5zL3VuZG8tc3RhY2suanMnKVxuICAgIH0sXG4gICAgcGx1Z2luczoge1xuICAgICAgYm9vdHN0cmFwOiByZXF1aXJlKCcuL3BsdWdpbnMvYm9vdHN0cmFwJyksXG4gICAgICBtZXRhOiByZXF1aXJlKCcuL3BsdWdpbnMvbWV0YScpLFxuICAgICAgcmVmZXJlbmNlOiByZXF1aXJlKCcuL3BsdWdpbnMvcmVmZXJlbmNlJyksXG4gICAgICBlbGVtZW50Q2xhc3NlczogcmVxdWlyZSgnLi9wbHVnaW5zL2VsZW1lbnQtY2xhc3NlcycpXG4gICAgfSxcbiAgICB1dGlsczogdXRpbHNcbiAgfSxcblxuICBkaXNwbGF5TmFtZTogJ0Zvcm1hdGljJyxcblxuICAvLyBJZiB3ZSBnb3QgYSB2YWx1ZSwgdHJlYXQgdGhpcyBjb21wb25lbnQgYXMgY29udHJvbGxlZC4gRWl0aGVyIHdheSwgcmV0YWluXG4gIC8vIHRoZSB2YWx1ZSBpbiB0aGUgc3RhdGUuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpc0NvbnRyb2xsZWQ6ICFfLmlzVW5kZWZpbmVkKHRoaXMucHJvcHMudmFsdWUpLFxuICAgICAgdmFsdWU6IF8uaXNVbmRlZmluZWQodGhpcy5wcm9wcy52YWx1ZSkgPyB0aGlzLnByb3BzLmRlZmF1bHRWYWx1ZSA6IHRoaXMucHJvcHMudmFsdWVcbiAgICB9O1xuICB9LFxuXG4gIC8vIElmIHRoaXMgaXMgYSBjb250cm9sbGVkIGNvbXBvbmVudCwgY2hhbmdlIG91ciBzdGF0ZSB0byByZWZsZWN0IHRoZSBuZXdcbiAgLy8gdmFsdWUuIEZvciB1bmNvbnRyb2xsZWQgY29tcG9uZW50cywgaWdub3JlIGFueSB2YWx1ZSBjaGFuZ2VzLlxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV3UHJvcHMpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5pc0NvbnRyb2xsZWQpIHtcbiAgICAgIGlmICghXy5pc1VuZGVmaW5lZChuZXdQcm9wcy52YWx1ZSkpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgdmFsdWU6IG5ld1Byb3BzLnZhbHVlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBJZiB0aGlzIGlzIGFuIHVuY29udHJvbGxlZCBjb21wb25lbnQsIHNldCBvdXIgc3RhdGUgdG8gcmVmbGVjdCB0aGUgbmV3XG4gIC8vIHZhbHVlLiBFaXRoZXIgd2F5LCBjYWxsIHRoZSBvbkNoYW5nZSBjYWxsYmFjay5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgaW5mbykge1xuICAgIGlmICghdGhpcy5zdGF0ZS5pc0NvbnRyb2xsZWQpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICB2YWx1ZTogbmV3VmFsdWVcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoIXRoaXMucHJvcHMub25DaGFuZ2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSwgaW5mbyk7XG4gIH0sXG5cbiAgLy8gQW55IGFjdGlvbnMgc2hvdWxkIGJlIHNlbnQgdG8gdGhlIGdlbmVyaWMgb25BY3Rpb24gY2FsbGJhY2sgYnV0IGFsc28gc3BsaXRcbiAgLy8gaW50byBkaXNjcmVldCBjYWxsYmFja3MgcGVyIGFjdGlvbi5cbiAgb25BY3Rpb246IGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgaWYgKHRoaXMucHJvcHMub25BY3Rpb24pIHtcbiAgICAgIHRoaXMucHJvcHMub25BY3Rpb24oaW5mbyk7XG4gICAgfVxuICAgIHZhciBhY3Rpb24gPSB1dGlscy5kYXNoVG9QYXNjYWwoaW5mby5hY3Rpb24pO1xuICAgIGlmICh0aGlzLnByb3BzWydvbicgKyBhY3Rpb25dKSB7XG4gICAgICB0aGlzLnByb3BzWydvbicgKyBhY3Rpb25dKGluZm8pO1xuICAgIH1cbiAgfSxcblxuICAvLyBSZW5kZXIgdGhlIHdyYXBwZXIgY29tcG9uZW50IChieSBqdXN0IGRlbGVnYXRpbmcgdG8gdGhlIG1haW4gY29tcG9uZW50KS5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWcgfHwgZGVmYXVsdENvbmZpZztcbiAgICB2YXIgdmFsdWUgPSB0aGlzLnN0YXRlLnZhbHVlO1xuXG4gICAgaWYgKHRoaXMuc3RhdGUuaXNDb250cm9sbGVkKSB7XG4gICAgICBpZiAoIXRoaXMucHJvcHMub25DaGFuZ2UpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1lvdSBzaG91bGQgc3VwcGx5IGFuIG9uQ2hhbmdlIGhhbmRsZXIgaWYgeW91IHN1cHBseSBhIHZhbHVlLicpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBwcm9wcyA9IHtcbiAgICAgIGNvbmZpZzogY29uZmlnLFxuICAgICAgLy8gQWxsb3cgZmllbGQgdGVtcGxhdGVzIHRvIGJlIHBhc3NlZCBpbiBhcyBgZmllbGRgIG9yIGBmaWVsZHNgLiBBZnRlciB0aGlzLCBzdG9wXG4gICAgICAvLyBjYWxsaW5nIHRoZW0gZmllbGRzLlxuICAgICAgZmllbGRUZW1wbGF0ZTogdGhpcy5wcm9wcy5maWVsZCxcbiAgICAgIGZpZWxkVGVtcGxhdGVzOiB0aGlzLnByb3BzLmZpZWxkcyxcbiAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgb25BY3Rpb246IHRoaXMub25BY3Rpb25cbiAgICB9O1xuXG4gICAgXy5lYWNoKHRoaXMucHJvcHMsIGZ1bmN0aW9uIChwcm9wVmFsdWUsIGtleSkge1xuICAgICAgaWYgKCEoa2V5IGluIHByb3BzKSkge1xuICAgICAgICBwcm9wc1trZXldID0gcHJvcFZhbHVlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIEZvcm1hdGljQ29udHJvbGxlZChwcm9wcyk7XG4gIH1cblxufSk7XG4iLCIvLyAjIGNsaWNrLW91dHNpZGUgbWl4aW5cblxuLypcblRoZXJlJ3Mgbm8gbmF0aXZlIFJlYWN0IHdheSB0byBkZXRlY3QgY2xpY2tpbmcgb3V0c2lkZSBhbiBlbGVtZW50LiBTb21ldGltZXNcbnRoaXMgaXMgdXNlZnVsLCBzbyB0aGF0J3Mgd2hhdCB0aGlzIG1peGluIGRvZXMuIFRvIHVzZSBpdCwgbWl4IGl0IGluIGFuZCB1c2UgaXRcbmZyb20geW91ciBjb21wb25lbnQgbGlrZSB0aGlzOlxuXG5gYGBqc1xubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi5taXhpbnMvY2xpY2stb3V0c2lkZScpXSxcblxuICBvbkNsaWNrT3V0c2lkZTogZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUubG9nKCdjbGlja2VkIG91dHNpZGUhJyk7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNldE9uQ2xpY2tPdXRzaWRlKCdteURpdicsIHRoaXMub25DbGlja091dHNpZGUpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSZWFjdC5ET00uZGl2KHtyZWY6ICdteURpdid9LFxuICAgICAgJ0hlbGxvISdcbiAgICApXG4gIH1cbn0pO1xuYGBgXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gcmVxdWlyZSgnLi4vdW5kYXNoJyk7XG5cbnZhciBoYXNBbmNlc3RvciA9IGZ1bmN0aW9uIChjaGlsZCwgcGFyZW50KSB7XG4gIGlmIChjaGlsZC5wYXJlbnROb2RlID09PSBwYXJlbnQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBpZiAoY2hpbGQucGFyZW50Tm9kZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gaGFzQW5jZXN0b3IoY2hpbGQucGFyZW50Tm9kZSwgcGFyZW50KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGlzTm9kZU91dHNpZGU6IGZ1bmN0aW9uIChub2RlT3V0LCBub2RlSW4pIHtcbiAgICBpZiAobm9kZU91dCA9PT0gbm9kZUluKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmIChoYXNBbmNlc3Rvcihub2RlT3V0LCBub2RlSW4pKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuXG4gIGlzTm9kZUluc2lkZTogZnVuY3Rpb24gKG5vZGVJbiwgbm9kZU91dCkge1xuICAgIHJldHVybiAhdGhpcy5pc05vZGVPdXRzaWRlKG5vZGVJbiwgbm9kZU91dCk7XG4gIH0sXG5cbiAgX29uQ2xpY2tNb3VzZWRvd246IGZ1bmN0aW9uKCkge1xuICAgIF8uZWFjaCh0aGlzLmNsaWNrT3V0c2lkZUhhbmRsZXJzLCBmdW5jdGlvbiAoZnVuY3MsIHJlZikge1xuICAgICAgaWYgKHRoaXMucmVmc1tyZWZdKSB7XG4gICAgICAgIHRoaXMuX21vdXNlZG93blJlZnNbcmVmXSA9IHRydWU7XG4gICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfSxcblxuICBfb25DbGlja01vdXNldXA6IGZ1bmN0aW9uIChldmVudCkge1xuICAgIF8uZWFjaCh0aGlzLmNsaWNrT3V0c2lkZUhhbmRsZXJzLCBmdW5jdGlvbiAoZnVuY3MsIHJlZikge1xuICAgICAgaWYgKHRoaXMucmVmc1tyZWZdICYmIHRoaXMuX21vdXNlZG93blJlZnNbcmVmXSkge1xuICAgICAgICBpZiAodGhpcy5pc05vZGVPdXRzaWRlKGV2ZW50LnRhcmdldCwgdGhpcy5yZWZzW3JlZl0uZ2V0RE9NTm9kZSgpKSkge1xuICAgICAgICAgIGZ1bmNzLmZvckVhY2goZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICBmbi5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLl9tb3VzZWRvd25SZWZzW3JlZl0gPSBmYWxzZTtcbiAgICB9LmJpbmQodGhpcykpO1xuICB9LFxuXG4gIHNldE9uQ2xpY2tPdXRzaWRlOiBmdW5jdGlvbiAocmVmLCBmbikge1xuICAgIGlmICghdGhpcy5jbGlja091dHNpZGVIYW5kbGVyc1tyZWZdKSB7XG4gICAgICB0aGlzLmNsaWNrT3V0c2lkZUhhbmRsZXJzW3JlZl0gPSBbXTtcbiAgICB9XG4gICAgdGhpcy5jbGlja091dHNpZGVIYW5kbGVyc1tyZWZdLnB1c2goZm4pO1xuICB9LFxuXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jbGlja091dHNpZGVIYW5kbGVycyA9IHt9O1xuICAgIHRoaXMuX2RpZE1vdXNlRG93biA9IGZhbHNlO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX29uQ2xpY2tNb3VzZWRvd24pO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9vbkNsaWNrTW91c2V1cCk7XG4gICAgLy9kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uQ2xpY2tEb2N1bWVudCk7XG4gICAgdGhpcy5fbW91c2Vkb3duUmVmcyA9IHt9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jbGlja091dHNpZGVIYW5kbGVycyA9IHt9O1xuICAgIC8vZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkNsaWNrRG9jdW1lbnQpO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9vbkNsaWNrTW91c2V1cCk7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5fb25DbGlja01vdXNlZG93bik7XG4gIH1cbn07XG4iLCIvLyAjIGZpZWxkIG1peGluXG5cbi8qXG5UaGlzIG1peGluIGdldHMgbWl4ZWQgaW50byBhbGwgZmllbGQgY29tcG9uZW50cy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSByZXF1aXJlKCcuLi91bmRhc2gnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgLy8gU2lnbmFsIGEgY2hhbmdlIGluIHZhbHVlLlxuICBvbkNoYW5nZVZhbHVlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHZhbHVlLCB7XG4gICAgICBmaWVsZDogdGhpcy5wcm9wcy5maWVsZFxuICAgIH0pO1xuICB9LFxuXG4gIC8vIEJ1YmJsZSB1cCBhIHZhbHVlLlxuICBvbkJ1YmJsZVZhbHVlOiBmdW5jdGlvbiAodmFsdWUsIGluZm8pIHtcbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHZhbHVlLCBpbmZvKTtcbiAgfSxcblxuICAvLyBTdGFydCBhbiBhY3Rpb24gYnViYmxpbmcgdXAgdGhyb3VnaCBwYXJlbnQgY29tcG9uZW50cy5cbiAgb25TdGFydEFjdGlvbjogZnVuY3Rpb24gKGFjdGlvbiwgcHJvcHMpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5vbkFjdGlvbikge1xuICAgICAgdmFyIGluZm8gPSBfLmV4dGVuZCh7fSwgcHJvcHMpO1xuICAgICAgaW5mby5hY3Rpb24gPSBhY3Rpb247XG4gICAgICBpbmZvLmZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcbiAgICAgIHRoaXMucHJvcHMub25BY3Rpb24oaW5mbyk7XG4gICAgfVxuICB9LFxuXG4gIG9uRm9jdXNBY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLm9uU3RhcnRBY3Rpb24oJ2ZvY3VzJyk7XG4gIH0sXG5cbiAgb25CbHVyQWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5vblN0YXJ0QWN0aW9uKCdibHVyJyk7XG4gIH0sXG5cbiAgLy8gQnViYmxlIHVwIGFuIGFjdGlvbi5cbiAgb25CdWJibGVBY3Rpb246IGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgaWYgKHRoaXMucHJvcHMub25BY3Rpb24pIHtcbiAgICAgIHRoaXMucHJvcHMub25BY3Rpb24oaW5mbyk7XG4gICAgfVxuICB9LFxuXG4gIC8vIERlbGVnYXRlIHJlbmRlcmluZyBiYWNrIHRvIGNvbmZpZyBzbyBpdCBjYW4gYmUgd3JhcHBlZC5cbiAgcmVuZGVyV2l0aENvbmZpZzogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnByb3BzLmNvbmZpZy5yZW5kZXJGaWVsZENvbXBvbmVudCh0aGlzKTtcbiAgfVxufTtcbiIsIi8vICMgaGVscGVyIG1peGluXG5cbi8qXG5UaGlzIGdldHMgbWl4ZWQgaW50byBhbGwgaGVscGVyIGNvbXBvbmVudHMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gcmVxdWlyZSgnLi4vdW5kYXNoJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIC8vIERlbGVnYXRlIHJlbmRlcmluZyBiYWNrIHRvIGNvbmZpZyBzbyBpdCBjYW4gYmUgd3JhcHBlZC5cbiAgcmVuZGVyV2l0aENvbmZpZzogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnByb3BzLmNvbmZpZy5yZW5kZXJDb21wb25lbnQodGhpcyk7XG4gIH0sXG5cbiAgLy8gU3RhcnQgYW4gYWN0aW9uIGJ1YmJsaW5nIHVwIHRocm91Z2ggcGFyZW50IGNvbXBvbmVudHMuXG4gIG9uU3RhcnRBY3Rpb246IGZ1bmN0aW9uIChhY3Rpb24sIHByb3BzKSB7XG4gICAgaWYgKHRoaXMucHJvcHMub25BY3Rpb24pIHtcbiAgICAgIHZhciBpbmZvID0gXy5leHRlbmQoe30sIHByb3BzKTtcbiAgICAgIGluZm8uYWN0aW9uID0gYWN0aW9uO1xuICAgICAgaW5mby5maWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG4gICAgICB0aGlzLnByb3BzLm9uQWN0aW9uKGluZm8pO1xuICAgIH1cbiAgfSxcblxuICAvLyBCdWJibGUgdXAgYW4gYWN0aW9uLlxuICBvbkJ1YmJsZUFjdGlvbjogZnVuY3Rpb24gKGluZm8pIHtcbiAgICBpZiAodGhpcy5wcm9wcy5vbkFjdGlvbikge1xuICAgICAgdGhpcy5wcm9wcy5vbkFjdGlvbihpbmZvKTtcbiAgICB9XG4gIH0sXG5cbiAgb25Gb2N1c0FjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMub25TdGFydEFjdGlvbignZm9jdXMnKTtcbiAgfSxcblxuICBvbkJsdXJBY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLm9uU3RhcnRBY3Rpb24oJ2JsdXInKTtcbiAgfVxufTtcbiIsIi8vICMgcmVzaXplIG1peGluXG5cbi8qXG5Zb3UnZCB0aGluayBpdCB3b3VsZCBiZSBwcmV0dHkgZWFzeSB0byBkZXRlY3Qgd2hlbiBhIERPTSBlbGVtZW50IGlzIHJlc2l6ZWQuXG5BbmQgeW91J2QgYmUgd3JvbmcuIFRoZXJlIGFyZSB2YXJpb3VzIHRyaWNrcywgYnV0IG5vbmUgb2YgdGhlbSB3b3JrIHZlcnkgd2VsbC5cblNvLCB1c2luZyBnb29kIG9sJyBwb2xsaW5nIGhlcmUuIFRvIHRyeSB0byBiZSBhcyBlZmZpY2llbnQgYXMgcG9zc2libGUsIHRoZXJlXG5pcyBvbmx5IGEgc2luZ2xlIHNldEludGVydmFsIHVzZWQgZm9yIGFsbCBlbGVtZW50cy4gVG8gdXNlOlxuXG5gYGBqc1xubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL3Jlc2l6ZScpXSxcblxuICBvblJlc2l6ZTogZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUubG9nKCdyZXNpemVkIScpO1xuICB9LFxuXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zZXRPblJlc2l6ZSgnbXlUZXh0JywgdGhpcy5vblJlc2l6ZSk7XG4gIH0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICAuLi5cbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUmVhY3QuRE9NLnRleHRhcmVhKHtyZWY6ICdteVRleHQnLCB2YWx1ZTogdGhpcy5wcm9wcy52YWx1ZSwgb25DaGFuZ2U6IC4uLn0pXG4gIH1cbn0pO1xuYGBgXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBpZCA9IDA7XG5cbnZhciByZXNpemVJbnRlcnZhbEVsZW1lbnRzID0ge307XG52YXIgcmVzaXplSW50ZXJ2YWxFbGVtZW50c0NvdW50ID0gMDtcbnZhciByZXNpemVJbnRlcnZhbFRpbWVyID0gbnVsbDtcblxudmFyIGNoZWNrRWxlbWVudHMgPSBmdW5jdGlvbiAoKSB7XG4gIE9iamVjdC5rZXlzKHJlc2l6ZUludGVydmFsRWxlbWVudHMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIHZhciBlbGVtZW50ID0gcmVzaXplSW50ZXJ2YWxFbGVtZW50c1trZXldO1xuICAgIGlmIChlbGVtZW50LmNsaWVudFdpZHRoICE9PSBlbGVtZW50Ll9fcHJldkNsaWVudFdpZHRoIHx8IGVsZW1lbnQuY2xpZW50SGVpZ2h0ICE9PSBlbGVtZW50Ll9fcHJldkNsaWVudEhlaWdodCkge1xuICAgICAgZWxlbWVudC5fX3ByZXZDbGllbnRXaWR0aCA9IGVsZW1lbnQuY2xpZW50V2lkdGg7XG4gICAgICBlbGVtZW50Ll9fcHJldkNsaWVudEhlaWdodCA9IGVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgICAgdmFyIGhhbmRsZXJzID0gZWxlbWVudC5fX3Jlc2l6ZUhhbmRsZXJzO1xuICAgICAgaGFuZGxlcnMuZm9yRWFjaChmdW5jdGlvbiAoaGFuZGxlcikge1xuICAgICAgICBoYW5kbGVyKCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sIDEwMCk7XG59O1xuXG52YXIgYWRkUmVzaXplSW50ZXJ2YWxIYW5kbGVyID0gZnVuY3Rpb24gKGVsZW1lbnQsIGZuKSB7XG4gIGlmIChyZXNpemVJbnRlcnZhbFRpbWVyID09PSBudWxsKSB7XG4gICAgcmVzaXplSW50ZXJ2YWxUaW1lciA9IHNldEludGVydmFsKGNoZWNrRWxlbWVudHMsIDEwMCk7XG4gIH1cbiAgaWYgKCEoJ19fcmVzaXplSWQnIGluIGVsZW1lbnQpKSB7XG4gICAgaWQrKztcbiAgICBlbGVtZW50Ll9fcHJldkNsaWVudFdpZHRoID0gZWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICBlbGVtZW50Ll9fcHJldkNsaWVudEhlaWdodCA9IGVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgIGVsZW1lbnQuX19yZXNpemVJZCA9IGlkO1xuICAgIHJlc2l6ZUludGVydmFsRWxlbWVudHNDb3VudCsrO1xuICAgIHJlc2l6ZUludGVydmFsRWxlbWVudHNbaWRdID0gZWxlbWVudDtcbiAgICBlbGVtZW50Ll9fcmVzaXplSGFuZGxlcnMgPSBbXTtcbiAgfVxuICBlbGVtZW50Ll9fcmVzaXplSGFuZGxlcnMucHVzaChmbik7XG59O1xuXG52YXIgcmVtb3ZlUmVzaXplSW50ZXJ2YWxIYW5kbGVycyA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIGlmICghKCdfX3Jlc2l6ZUlkJyBpbiBlbGVtZW50KSkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgcmVzaXplSWQgPSBlbGVtZW50Ll9fcmVzaXplSWQ7XG4gIGRlbGV0ZSBlbGVtZW50Ll9fcmVzaXplSWQ7XG4gIGRlbGV0ZSBlbGVtZW50Ll9fcmVzaXplSGFuZGxlcnM7XG4gIGRlbGV0ZSByZXNpemVJbnRlcnZhbEVsZW1lbnRzW3Jlc2l6ZUlkXTtcbiAgcmVzaXplSW50ZXJ2YWxFbGVtZW50c0NvdW50LS07XG4gIGlmIChyZXNpemVJbnRlcnZhbEVsZW1lbnRzQ291bnQgPCAxKSB7XG4gICAgY2xlYXJJbnRlcnZhbChyZXNpemVJbnRlcnZhbFRpbWVyKTtcbiAgICByZXNpemVJbnRlcnZhbFRpbWVyID0gbnVsbDtcbiAgfVxufTtcblxudmFyIG9uUmVzaXplID0gZnVuY3Rpb24gKHJlZiwgZm4pIHtcbiAgZm4ocmVmKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMub25SZXNpemVXaW5kb3cpIHtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLm9uUmVzaXplV2luZG93KTtcbiAgICB9XG4gICAgdGhpcy5yZXNpemVFbGVtZW50UmVmcyA9IHt9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMub25SZXNpemVXaW5kb3cpIHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLm9uUmVzaXplV2luZG93KTtcbiAgICB9XG4gICAgT2JqZWN0LmtleXModGhpcy5yZXNpemVFbGVtZW50UmVmcykuZm9yRWFjaChmdW5jdGlvbiAocmVmKSB7XG4gICAgICByZW1vdmVSZXNpemVJbnRlcnZhbEhhbmRsZXJzKHRoaXMucmVmc1tyZWZdLmdldERPTU5vZGUoKSk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfSxcblxuICBzZXRPblJlc2l6ZTogZnVuY3Rpb24gKHJlZiwgZm4pIHtcbiAgICBpZiAoIXRoaXMucmVzaXplRWxlbWVudFJlZnNbcmVmXSkge1xuICAgICAgdGhpcy5yZXNpemVFbGVtZW50UmVmc1tyZWZdID0gdHJ1ZTtcbiAgICB9XG4gICAgYWRkUmVzaXplSW50ZXJ2YWxIYW5kbGVyKHRoaXMucmVmc1tyZWZdLmdldERPTU5vZGUoKSwgb25SZXNpemUuYmluZCh0aGlzLCByZWYsIGZuKSk7XG4gIH1cbn07XG4iLCIvLyAjIHNjcm9sbCBtaXhpblxuXG4vKlxuQ3VycmVudGx5IHVudXNlZC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSB7XG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMub25TY3JvbGxXaW5kb3cpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHRoaXMub25TY3JvbGxXaW5kb3cpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMub25TY3JvbGxXaW5kb3cpIHtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHRoaXMub25TY3JvbGxXaW5kb3cpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn07XG4iLCIvLyAjIHVuZG8tc3RhY2sgbWl4aW5cblxuLypcbkdpdmVzIHlvdXIgY29tcG9uZW50IGFuIHVuZG8gc3RhY2suXG4qL1xuXG4vLyBodHRwOi8vcHJvbWV0aGV1c3Jlc2VhcmNoLmdpdGh1Yi5pby9yZWFjdC1mb3Jtcy9leGFtcGxlcy91bmRvLmh0bWxcblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge3VuZG86IFtdLCByZWRvOiBbXX07XG4gIH0sXG5cbiAgc25hcHNob3Q6IGZ1bmN0aW9uKCkge1xuICAgIHZhciB1bmRvID0gdGhpcy5zdGF0ZS51bmRvLmNvbmNhdCh0aGlzLmdldFN0YXRlU25hcHNob3QoKSk7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnN0YXRlLnVuZG9EZXB0aCA9PT0gJ251bWJlcicpIHtcbiAgICAgIGlmICh1bmRvLmxlbmd0aCA+IHRoaXMuc3RhdGUudW5kb0RlcHRoKSB7XG4gICAgICAgIHVuZG8uc2hpZnQoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5zZXRTdGF0ZSh7dW5kbzogdW5kbywgcmVkbzogW119KTtcbiAgfSxcblxuICBoYXNVbmRvOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS51bmRvLmxlbmd0aCA+IDA7XG4gIH0sXG5cbiAgaGFzUmVkbzogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUucmVkby5sZW5ndGggPiAwO1xuICB9LFxuXG4gIHJlZG86IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3VuZG9JbXBsKHRydWUpO1xuICB9LFxuXG4gIHVuZG86IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3VuZG9JbXBsKCk7XG4gIH0sXG5cbiAgX3VuZG9JbXBsOiBmdW5jdGlvbihpc1JlZG8pIHtcbiAgICB2YXIgdW5kbyA9IHRoaXMuc3RhdGUudW5kby5zbGljZSgwKTtcbiAgICB2YXIgcmVkbyA9IHRoaXMuc3RhdGUucmVkby5zbGljZSgwKTtcbiAgICB2YXIgc25hcHNob3Q7XG5cbiAgICBpZiAoaXNSZWRvKSB7XG4gICAgICBpZiAocmVkby5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgc25hcHNob3QgPSByZWRvLnBvcCgpO1xuICAgICAgdW5kby5wdXNoKHRoaXMuZ2V0U3RhdGVTbmFwc2hvdCgpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHVuZG8ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHNuYXBzaG90ID0gdW5kby5wb3AoKTtcbiAgICAgIHJlZG8ucHVzaCh0aGlzLmdldFN0YXRlU25hcHNob3QoKSk7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZVNuYXBzaG90KHNuYXBzaG90KTtcbiAgICB0aGlzLnNldFN0YXRlKHt1bmRvOiB1bmRvLCByZWRvOiByZWRvfSk7XG4gIH1cbn07XG4iLCIvLyAjIGJvb3RzdHJhcCBwbHVnaW5cblxuLypcblRoZSBib290c3RyYXAgcGx1Z2luIHNuZWFrcyBpbiBzb21lIGNsYXNzZXMgdG8gZWxlbWVudHMgc28gdGhhdCBpdCBwbGF5cyB3ZWxsXG53aXRoIFR3aXR0ZXIgQm9vdHN0cmFwLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4uL3VuZGFzaCcpO1xuXG4vLyBEZWNsYXJlIHNvbWUgY2xhc3NlcyBhbmQgbGFiZWxzIGZvciBlYWNoIGVsZW1lbnQuXG52YXIgbW9kaWZpZXJzID0ge1xuXG4gICdGaWVsZCc6IHtjbGFzc2VzOiB7J2Zvcm0tZ3JvdXAnOiB0cnVlfX0sXG4gICdIZWxwJzoge2NsYXNzZXM6IHsnaGVscC1ibG9jayc6IHRydWV9fSxcbiAgJ1NhbXBsZSc6IHtjbGFzc2VzOiB7J2hlbHAtYmxvY2snOiB0cnVlfX0sXG4gICdBcnJheUNvbnRyb2wnOiB7Y2xhc3Nlczogeydmb3JtLWlubGluZSc6IHRydWV9fSxcbiAgJ0FycmF5SXRlbSc6IHtjbGFzc2VzOiB7J3dlbGwnOiB0cnVlfX0sXG4gICdPYmplY3RJdGVtJzoge2NsYXNzZXM6IHsnd2VsbCc6IHRydWV9fSxcbiAgJ0ZpZWxkVGVtcGxhdGVDaG9pY2VzJzoge2NsYXNzZXM6IHsnZm9ybS1jb250cm9sJzogdHJ1ZX19LFxuICAnQWRkSXRlbSc6IHtjbGFzc2VzOiB7J2dseXBoaWNvbiBnbHlwaGljb24tcGx1cyc6IHRydWV9LCBsYWJlbDogJyd9LFxuICAnUmVtb3ZlSXRlbSc6IHtjbGFzc2VzOiB7J2dseXBoaWNvbiBnbHlwaGljb24tcmVtb3ZlJzogdHJ1ZX0sIGxhYmVsOiAnJ30sXG4gICdNb3ZlSXRlbUJhY2snOiB7Y2xhc3NlczogeydnbHlwaGljb24gZ2x5cGhpY29uLWFycm93LXVwJzogdHJ1ZX0sIGxhYmVsOiAnJ30sXG4gICdNb3ZlSXRlbUZvcndhcmQnOiB7Y2xhc3NlczogeydnbHlwaGljb24gZ2x5cGhpY29uLWFycm93LWRvd24nOiB0cnVlfSwgbGFiZWw6ICcnfSxcbiAgJ09iamVjdEl0ZW1LZXknOiB7Y2xhc3Nlczogeydmb3JtLWNvbnRyb2wnOiB0cnVlfX0sXG5cbiAgJ1NpbmdsZUxpbmVTdHJpbmcnOiB7Y2xhc3Nlczogeydmb3JtLWNvbnRyb2wnOiB0cnVlfX0sXG4gICdTdHJpbmcnOiB7Y2xhc3Nlczogeydmb3JtLWNvbnRyb2wnOiB0cnVlfX0sXG4gICdQcmV0dHlUZXh0Jzoge2NsYXNzZXM6IHsnZm9ybS1jb250cm9sJzogdHJ1ZX19LFxuICAnSnNvbic6IHtjbGFzc2VzOiB7J2Zvcm0tY29udHJvbCc6IHRydWV9fSxcbiAgJ1NlbGVjdFZhbHVlJzoge2NsYXNzZXM6IHsnZm9ybS1jb250cm9sJzogdHJ1ZX19XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjb25maWcpIHtcblxuICB2YXIgY3JlYXRlRWxlbWVudCA9IGNvbmZpZy5jcmVhdGVFbGVtZW50O1xuXG4gIHJldHVybiB7XG4gICAgY3JlYXRlRWxlbWVudDogZnVuY3Rpb24gKG5hbWUsIHByb3BzLCBjaGlsZHJlbikge1xuXG4gICAgICBuYW1lID0gY29uZmlnLmVsZW1lbnROYW1lKG5hbWUpO1xuXG4gICAgICB2YXIgbW9kaWZpZXIgPSBtb2RpZmllcnNbbmFtZV07XG5cbiAgICAgIGlmIChtb2RpZmllcikge1xuICAgICAgICAvLyBJZiB0aGVyZSBpcyBhIG1vZGlmaWVyIGZvciB0aGlzIGVsZW1lbnQsIGFkZCB0aGUgY2xhc3NlcyBhbmQgbGFiZWwuXG4gICAgICAgIHByb3BzID0gXy5leHRlbmQoe30sIHByb3BzKTtcbiAgICAgICAgcHJvcHMuY2xhc3NlcyA9IF8uZXh0ZW5kKHt9LCBwcm9wcy5jbGFzc2VzLCBtb2RpZmllci5jbGFzc2VzKTtcbiAgICAgICAgaWYgKCdsYWJlbCcgaW4gbW9kaWZpZXIpIHtcbiAgICAgICAgICBwcm9wcy5sYWJlbCA9IG1vZGlmaWVyLmxhYmVsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjcmVhdGVFbGVtZW50KG5hbWUsIHByb3BzLCBjaGlsZHJlbik7XG4gICAgfVxuICB9O1xufTtcbiIsIi8vICMgZWxlbWVudC1jbGFzc2VzIHBsdWdpblxuXG4vKlxuVGhpcyBwbHVnaW5zIHByb3ZpZGVzIGEgY29uZmlnIG1ldGhvZCBhZGRFbGVtZW50Q2xhc3MgdGhhdCBsZXRzIHlvdSBhZGQgb24gYVxuY2xhc3MgdG8gYW4gZWxlbWVudC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSByZXF1aXJlKCcuLi91bmRhc2gnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgdmFyIGNyZWF0ZUVsZW1lbnQgPSBjb25maWcuY3JlYXRlRWxlbWVudDtcblxuICB2YXIgZWxlbWVudENsYXNzZXMgPSB7fTtcblxuICByZXR1cm4ge1xuICAgIGFkZEVsZW1lbnRDbGFzczogZnVuY3Rpb24gKG5hbWUsIGNsYXNzTmFtZSkge1xuXG4gICAgICBuYW1lID0gY29uZmlnLmVsZW1lbnROYW1lKG5hbWUpO1xuXG4gICAgICBpZiAoIWVsZW1lbnRDbGFzc2VzW25hbWVdKSB7XG4gICAgICAgIGVsZW1lbnRDbGFzc2VzW25hbWVdID0ge307XG4gICAgICB9XG5cbiAgICAgIGVsZW1lbnRDbGFzc2VzW25hbWVdW2NsYXNzTmFtZV0gPSB0cnVlO1xuICAgIH0sXG5cbiAgICAvLyBXcmFwIHRoZSBjcmVhdGVFbGVtZW50IG1ldGhvZC5cbiAgICBjcmVhdGVFbGVtZW50OiBmdW5jdGlvbiAobmFtZSwgcHJvcHMsIGNoaWxkcmVuKSB7XG5cbiAgICAgIG5hbWUgPSBjb25maWcuZWxlbWVudE5hbWUobmFtZSk7XG5cbiAgICAgIGlmIChlbGVtZW50Q2xhc3Nlc1tuYW1lXSkge1xuICAgICAgICBwcm9wcyA9IF8uZXh0ZW5kKHt9LCBwcm9wcywge2NsYXNzZXM6IGVsZW1lbnRDbGFzc2VzW25hbWVdfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjcmVhdGVFbGVtZW50KG5hbWUsIHByb3BzLCBjaGlsZHJlbik7XG4gICAgfVxuICB9O1xufTtcbiIsIi8vICMgbWV0YSBwbHVnaW5cblxuLypcblRoZSBtZXRhIHBsdWdpbiBsZXRzIHlvdSBwYXNzIGluIGEgbWV0YSBwcm9wIHRvIGZvcm1hdGljLiBUaGUgcHJvcCB0aGVuIGdldHNcbnBhc3NlZCB0aHJvdWdoIGFzIGEgcHJvcGVydHkgZm9yIGV2ZXJ5IGZpZWxkLiBZb3UgY2FuIHRoZW4gd3JhcCBgaW5pdEZpZWxkYCB0b1xuZ2V0IHlvdXIgbWV0YSB2YWx1ZXMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNvbmZpZykge1xuXG4gIHZhciBpbml0Um9vdEZpZWxkID0gY29uZmlnLmluaXRSb290RmllbGQ7XG4gIHZhciBpbml0RmllbGQgPSBjb25maWcuaW5pdEZpZWxkO1xuXG4gIHJldHVybiB7XG4gICAgaW5pdFJvb3RGaWVsZDogZnVuY3Rpb24gKGZpZWxkLCBwcm9wcykge1xuXG4gICAgICBmaWVsZC5tZXRhID0gcHJvcHMubWV0YSB8fCB7fTtcblxuICAgICAgaW5pdFJvb3RGaWVsZChmaWVsZCwgcHJvcHMpO1xuICAgIH0sXG5cbiAgICBpbml0RmllbGQ6IGZ1bmN0aW9uIChmaWVsZCkge1xuXG4gICAgICBpZiAoZmllbGQucGFyZW50ICYmIGZpZWxkLnBhcmVudC5tZXRhKSB7XG4gICAgICAgIGZpZWxkLm1ldGEgPSBmaWVsZC5wYXJlbnQubWV0YTtcbiAgICAgIH1cblxuICAgICAgaW5pdEZpZWxkKGZpZWxkKTtcbiAgICB9XG4gIH07XG59O1xuIiwiLy8gIyByZWZlcmVuY2UgcGx1Z2luXG5cbi8qXG5UaGlzIHBsdWdpbiBhbGxvd3MgZmllbGRzIHRvIGJlIHN0cmluZ3MgYW5kIHJlZmVyZW5jZSBvdGhlciBmaWVsZHMgYnkga2V5IG9yXG5pZC4gSXQgYWxzbyBhbGxvd3MgYSBmaWVsZCB0byBleHRlbmQgYW5vdGhlciBmaWVsZCB3aXRoXG5leHRlbmRzOiBbJ2ZvbycsICdiYXInXSB3aGVyZSAnZm9vJyBhbmQgJ2JhcicgcmVmZXIgdG8gb3RoZXIga2V5cyBvciBpZHMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gcmVxdWlyZSgnLi4vdW5kYXNoJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNvbmZpZykge1xuXG4gIHZhciBpbml0RmllbGQgPSBjb25maWcuaW5pdEZpZWxkO1xuXG4gIHJldHVybiB7XG4gICAgLy8gTG9vayBmb3IgYSB0ZW1wbGF0ZSBpbiB0aGlzIGZpZWxkIG9yIGFueSBvZiBpdHMgcGFyZW50cy5cbiAgICBmaW5kRmllbGRUZW1wbGF0ZTogZnVuY3Rpb24gKGZpZWxkLCBuYW1lKSB7XG5cbiAgICAgIGlmIChmaWVsZC50ZW1wbGF0ZXNbbmFtZV0pIHtcbiAgICAgICAgcmV0dXJuIGZpZWxkLnRlbXBsYXRlc1tuYW1lXTtcbiAgICAgIH1cblxuICAgICAgaWYgKGZpZWxkLnBhcmVudCkge1xuICAgICAgICByZXR1cm4gY29uZmlnLmZpbmRGaWVsZFRlbXBsYXRlKGZpZWxkLnBhcmVudCwgbmFtZSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG5cbiAgICAvLyBJbmhlcml0IGZyb20gYW55IGZpZWxkIHRlbXBsYXRlcyB0aGF0IHRoaXMgZmllbGQgdGVtcGxhdGVcbiAgICAvLyBleHRlbmRzLlxuICAgIHJlc29sdmVGaWVsZFRlbXBsYXRlOiBmdW5jdGlvbiAoZmllbGQsIGZpZWxkVGVtcGxhdGUpIHtcblxuICAgICAgaWYgKCFmaWVsZFRlbXBsYXRlLmV4dGVuZHMpIHtcbiAgICAgICAgcmV0dXJuIGZpZWxkVGVtcGxhdGU7XG4gICAgICB9XG5cbiAgICAgIHZhciBleHQgPSBmaWVsZFRlbXBsYXRlLmV4dGVuZHM7XG5cbiAgICAgIGlmICghXy5pc0FycmF5KGV4dCkpIHtcbiAgICAgICAgZXh0ID0gW2V4dF07XG4gICAgICB9XG5cbiAgICAgIHZhciBiYXNlcyA9IGV4dC5tYXAoZnVuY3Rpb24gKGJhc2UpIHtcbiAgICAgICAgdmFyIHRlbXBsYXRlID0gY29uZmlnLmZpbmRGaWVsZFRlbXBsYXRlKGZpZWxkLCBiYXNlKTtcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGVtcGxhdGUgJyArIGJhc2UgKyAnIG5vdCBmb3VuZC4nKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGVtcGxhdGU7XG4gICAgICB9KTtcblxuICAgICAgdmFyIGNoYWluID0gW3t9XS5jb25jYXQoYmFzZXMucmV2ZXJzZSgpLmNvbmNhdChbZmllbGRUZW1wbGF0ZV0pKTtcbiAgICAgIGZpZWxkVGVtcGxhdGUgPSBfLmV4dGVuZC5hcHBseShfLCBjaGFpbik7XG5cbiAgICAgIHJldHVybiBmaWVsZFRlbXBsYXRlO1xuICAgIH0sXG5cbiAgICAvLyBXcmFwIHRoZSBpbml0RmllbGQgbWV0aG9kLlxuICAgIGluaXRGaWVsZDogZnVuY3Rpb24gKGZpZWxkKSB7XG5cbiAgICAgIHZhciB0ZW1wbGF0ZXMgPSBmaWVsZC50ZW1wbGF0ZXMgPSB7fTtcblxuICAgICAgdmFyIGNoaWxkRmllbGRUZW1wbGF0ZXMgPSBjb25maWcuZmllbGRDaGlsZEZpZWxkVGVtcGxhdGVzKGZpZWxkKTtcblxuICAgICAgLy8gQWRkIGVhY2ggb2YgdGhlIGNoaWxkIGZpZWxkIHRlbXBsYXRlcyB0byBvdXIgdGVtcGxhdGUgbWFwLlxuICAgICAgY2hpbGRGaWVsZFRlbXBsYXRlcy5mb3JFYWNoKGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG5cbiAgICAgICAgaWYgKF8uaXNTdHJpbmcoZmllbGRUZW1wbGF0ZSkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIga2V5ID0gZmllbGRUZW1wbGF0ZS5rZXk7XG4gICAgICAgIHZhciBpZCA9IGZpZWxkVGVtcGxhdGUuaWQ7XG5cbiAgICAgICAgaWYgKGZpZWxkVGVtcGxhdGUudGVtcGxhdGUpIHtcbiAgICAgICAgICBmaWVsZFRlbXBsYXRlID0gXy5leHRlbmQoe30sIGZpZWxkVGVtcGxhdGUsIHt0ZW1wbGF0ZTogZmFsc2V9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghXy5pc1VuZGVmaW5lZChrZXkpICYmIGtleSAhPT0gJycpIHtcbiAgICAgICAgICB0ZW1wbGF0ZXNba2V5XSA9IGZpZWxkVGVtcGxhdGU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQoaWQpICYmIGlkICE9PSAnJykge1xuICAgICAgICAgIHRlbXBsYXRlc1tpZF0gPSBmaWVsZFRlbXBsYXRlO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gUmVzb2x2ZSBhbnkgcmVmZXJlbmNlcyB0byBvdGhlciBmaWVsZCB0ZW1wbGF0ZXMuXG4gICAgICBpZiAoY2hpbGRGaWVsZFRlbXBsYXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGZpZWxkLmZpZWxkcyA9IGNoaWxkRmllbGRUZW1wbGF0ZXMubWFwKGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgICAgICAgaWYgKF8uaXNTdHJpbmcoZmllbGRUZW1wbGF0ZSkpIHtcbiAgICAgICAgICAgIGZpZWxkVGVtcGxhdGUgPSBjb25maWcuZmluZEZpZWxkVGVtcGxhdGUoZmllbGQsIGZpZWxkVGVtcGxhdGUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBjb25maWcucmVzb2x2ZUZpZWxkVGVtcGxhdGUoZmllbGQsIGZpZWxkVGVtcGxhdGUpO1xuICAgICAgICB9KTtcblxuICAgICAgICBmaWVsZC5maWVsZHMgPSBmaWVsZC5maWVsZHMuZmlsdGVyKGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgICAgICAgcmV0dXJuICFmaWVsZFRlbXBsYXRlLnRlbXBsYXRlO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgdmFyIGl0ZW1GaWVsZFRlbXBsYXRlcyA9IGNvbmZpZy5maWVsZEl0ZW1GaWVsZFRlbXBsYXRlcyhmaWVsZCk7XG5cbiAgICAgIC8vIFJlc29sdmUgYW55IG9mIG91ciBpdGVtIGZpZWxkIHRlbXBsYXRlcy4gKEZpZWxkIHRlbXBsYXRlcyBmb3IgZHluYW1pY1xuICAgICAgLy8gY2hpbGQgZmllbGRzLilcbiAgICAgIGlmIChpdGVtRmllbGRUZW1wbGF0ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBmaWVsZC5pdGVtRmllbGRzID0gaXRlbUZpZWxkVGVtcGxhdGVzLm1hcChmdW5jdGlvbiAoaXRlbUZpZWxkVGVtcGxhdGUpIHtcbiAgICAgICAgICBpZiAoXy5pc1N0cmluZyhpdGVtRmllbGRUZW1wbGF0ZSkpIHtcbiAgICAgICAgICAgIGl0ZW1GaWVsZFRlbXBsYXRlID0gY29uZmlnLmZpbmRGaWVsZFRlbXBsYXRlKGZpZWxkLCBpdGVtRmllbGRUZW1wbGF0ZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIGNvbmZpZy5yZXNvbHZlRmllbGRUZW1wbGF0ZShmaWVsZCwgaXRlbUZpZWxkVGVtcGxhdGUpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaW5pdEZpZWxkKGZpZWxkKTtcbiAgICB9XG4gIH07XG5cbn07XG4iLCJ2YXIgXyA9IHt9O1xuXG5fLmFzc2lnbiA9IF8uZXh0ZW5kID0gcmVxdWlyZSgnb2JqZWN0LWFzc2lnbicpO1xuXy5pc0VxdWFsID0gcmVxdWlyZSgnZGVlcC1lcXVhbCcpO1xuXG4vLyBUaGVzZSBhcmUgbm90IG5lY2Vzc2FyaWx5IGNvbXBsZXRlIGltcGxlbWVudGF0aW9ucy4gVGhleSdyZSBqdXN0IGVub3VnaCBmb3Jcbi8vIHdoYXQncyB1c2VkIGluIGZvcm1hdGljLlxuXG5fLmZsYXR0ZW4gPSAoYXJyYXlzKSA9PiBbXS5jb25jYXQuYXBwbHkoW10sIGFycmF5cyk7XG5cbl8uaXNTdHJpbmcgPSB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnO1xuXy5pc1VuZGVmaW5lZCA9IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCc7XG5fLmlzT2JqZWN0ID0gdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jztcbl8uaXNBcnJheSA9IHZhbHVlID0+IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG5fLmlzTnVtYmVyID0gdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJztcbl8uaXNCb29sZWFuID0gdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbic7XG5fLmlzTnVsbCA9IHZhbHVlID0+IHZhbHVlID09PSBudWxsO1xuXy5pc0Z1bmN0aW9uID0gdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nO1xuXG5fLmNsb25lID0gdmFsdWUgPT4ge1xuICBpZiAoIV8uaXNPYmplY3QodmFsdWUpKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIHJldHVybiBfLmlzQXJyYXkodmFsdWUpID8gdmFsdWUuc2xpY2UoKSA6IF8uYXNzaWduKHt9LCB2YWx1ZSk7XG59O1xuXG5fLmZpbmQgPSAoaXRlbXMsIHRlc3RGbikgPT4ge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHRlc3RGbihpdGVtc1tpXSkpIHtcbiAgICAgIHJldHVybiBpdGVtc1tpXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHZvaWQgMDtcbn07XG5cbl8uZXZlcnkgPSAoaXRlbXMsIHRlc3RGbikgPT4ge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKCF0ZXN0Rm4oaXRlbXNbaV0pKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufTtcblxuXy5lYWNoID0gKG9iaiwgaXRlcmF0ZUZuKSA9PiB7XG4gIE9iamVjdC5rZXlzKG9iaikuZm9yRWFjaChrZXkgPT4ge1xuICAgIGl0ZXJhdGVGbihvYmpba2V5XSwga2V5KTtcbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IF87XG4iLCIvLyAjIHV0aWxzXG5cbi8qXG5KdXN0IHNvbWUgc2hhcmVkIHV0aWxpdHkgZnVuY3Rpb25zLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vdW5kYXNoJyk7XG5cbnZhciB1dGlscyA9IGV4cG9ydHM7XG5cbi8vIENvcHkgb2JqIHJlY3Vyc2luZyBkZWVwbHkuXG51dGlscy5kZWVwQ29weSA9IGZ1bmN0aW9uIChvYmopIHtcbiAgaWYgKF8uaXNBcnJheShvYmopKSB7XG4gICAgcmV0dXJuIG9iai5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHJldHVybiB1dGlscy5kZWVwQ29weShpdGVtKTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmIChfLmlzRnVuY3Rpb24ob2JqKSkge1xuICAgIHJldHVybiBvYmo7XG4gIH0gZWxzZSBpZiAoXy5pc051bGwob2JqKSkge1xuICAgIHJldHVybiBvYmo7XG4gIH0gZWxzZSBpZiAoXy5pc09iamVjdChvYmopKSB7XG4gICAgdmFyIGNvcHkgPSB7fTtcbiAgICBfLmVhY2gob2JqLCBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgY29weVtrZXldID0gdXRpbHMuZGVlcENvcHkodmFsdWUpO1xuICAgIH0pO1xuICAgIHJldHVybiBjb3B5O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBvYmo7XG4gIH1cbn07XG5cbi8vIENhY2hlIGZvciBzdHJpbmdzIGNvbnZlcnRlZCB0byBQYXNjYWwgQ2FzZS4gVGhpcyBzaG91bGQgYmUgYSBmaW5pdGUgbGlzdCwgc29cbi8vIG5vdCBtdWNoIGZlYXIgdGhhdCB3ZSB3aWxsIHJ1biBvdXQgb2YgbWVtb3J5LlxudmFyIGRhc2hUb1Bhc2NhbENhY2hlID0ge307XG5cbi8vIENvbnZlcnQgZm9vLWJhciB0byBGb29CYXIuXG51dGlscy5kYXNoVG9QYXNjYWwgPSBmdW5jdGlvbiAocykge1xuICBpZiAocyA9PT0gJycpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbiAgaWYgKCFkYXNoVG9QYXNjYWxDYWNoZVtzXSkge1xuICAgIGRhc2hUb1Bhc2NhbENhY2hlW3NdID0gcy5zcGxpdCgnLScpLm1hcChmdW5jdGlvbiAocGFydCkge1xuICAgICAgcmV0dXJuIHBhcnRbMF0udG9VcHBlckNhc2UoKSArIHBhcnQuc3Vic3RyaW5nKDEpO1xuICAgIH0pLmpvaW4oJycpO1xuICB9XG4gIHJldHVybiBkYXNoVG9QYXNjYWxDYWNoZVtzXTtcbn07XG5cbi8vIENvcHkgYWxsIGNvbXB1dGVkIHN0eWxlcyBmcm9tIG9uZSBET00gZWxlbWVudCB0byBhbm90aGVyLlxudXRpbHMuY29weUVsZW1lbnRTdHlsZSA9IGZ1bmN0aW9uIChmcm9tRWxlbWVudCwgdG9FbGVtZW50KSB7XG4gIHZhciBmcm9tU3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShmcm9tRWxlbWVudCwgJycpO1xuXG4gIGlmIChmcm9tU3R5bGUuY3NzVGV4dCAhPT0gJycpIHtcbiAgICB0b0VsZW1lbnQuc3R5bGUuY3NzVGV4dCA9IGZyb21TdHlsZS5jc3NUZXh0O1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBjc3NSdWxlcyA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGZyb21TdHlsZS5sZW5ndGg7IGkrKykge1xuICAgIGNzc1J1bGVzLnB1c2goZnJvbVN0eWxlW2ldICsgJzonICsgZnJvbVN0eWxlLmdldFByb3BlcnR5VmFsdWUoZnJvbVN0eWxlW2ldKSArICc7Jyk7XG4gIH1cbiAgdmFyIGNzc1RleHQgPSBjc3NSdWxlcy5qb2luKCcnKTtcblxuICB0b0VsZW1lbnQuc3R5bGUuY3NzVGV4dCA9IGNzc1RleHQ7XG59O1xuXG4vLyBPYmplY3QgdG8gaG9sZCBicm93c2VyIHNuaWZmaW5nIGluZm8uXG52YXIgYnJvd3NlciA9IHtcbiAgaXNDaHJvbWU6IGZhbHNlLFxuICBpc01vemlsbGE6IGZhbHNlLFxuICBpc09wZXJhOiBmYWxzZSxcbiAgaXNJZTogZmFsc2UsXG4gIGlzU2FmYXJpOiBmYWxzZSxcbiAgaXNVbmtub3duOiBmYWxzZVxufTtcblxuLy8gU25pZmYgdGhlIGJyb3dzZXIuXG52YXIgdWEgPSAnJztcblxuaWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnKSB7XG4gIHVhID0gbmF2aWdhdG9yLnVzZXJBZ2VudDtcbn1cblxuaWYodWEuaW5kZXhPZignQ2hyb21lJykgPiAtMSkge1xuICBicm93c2VyLmlzQ2hyb21lID0gdHJ1ZTtcbn0gZWxzZSBpZiAodWEuaW5kZXhPZignU2FmYXJpJykgPiAtMSkge1xuICBicm93c2VyLmlzU2FmYXJpID0gdHJ1ZTtcbn0gZWxzZSBpZiAodWEuaW5kZXhPZignT3BlcmEnKSA+IC0xKSB7XG4gIGJyb3dzZXIuaXNPcGVyYSA9IHRydWU7XG59IGVsc2UgaWYgKHVhLmluZGV4T2YoJ0ZpcmVmb3gnKSA+IC0xKSB7XG4gIGJyb3dzZXIuaXNNb3ppbGxhID0gdHJ1ZTtcbn0gZWxzZSBpZiAodWEuaW5kZXhPZignTVNJRScpID4gLTEpIHtcbiAgYnJvd3Nlci5pc0llID0gdHJ1ZTtcbn0gZWxzZSB7XG4gIGJyb3dzZXIuaXNVbmtub3duID0gdHJ1ZTtcbn1cblxuLy8gRXhwb3J0IHNuaWZmZWQgYnJvd3NlciBpbmZvLlxudXRpbHMuYnJvd3NlciA9IGJyb3dzZXI7XG5cbi8vIENyZWF0ZSBhIG1ldGhvZCB0aGF0IGRlbGVnYXRlcyB0byBhbm90aGVyIG1ldGhvZCBvbiB0aGUgc2FtZSBvYmplY3QuIFRoZVxuLy8gZGVmYXVsdCBjb25maWd1cmF0aW9uIHVzZXMgdGhpcyBmdW5jdGlvbiB0byBkZWxlZ2F0ZSBvbmUgbWV0aG9kIHRvIGFub3RoZXIuXG51dGlscy5kZWxlZ2F0ZVRvID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpc1tuYW1lXS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9O1xufTtcblxudXRpbHMuZGVsZWdhdG9yID0gZnVuY3Rpb24gKG9iaikge1xuICByZXR1cm4gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG9ialtuYW1lXS5hcHBseShvYmosIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfTtcbn07XG5cbnV0aWxzLmNhcGl0YWxpemUgPSBmdW5jdGlvbihzKSB7XG4gIHJldHVybiBzLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcy5zdWJzdHJpbmcoMSkudG9Mb3dlckNhc2UoKTtcbn07XG4iLCIvKiFcbiAgQ29weXJpZ2h0IChjKSAyMDE1IEplZCBXYXRzb24uXG4gIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZSAoTUlUKSwgc2VlXG4gIGh0dHA6Ly9qZWR3YXRzb24uZ2l0aHViLmlvL2NsYXNzbmFtZXNcbiovXG5cbmZ1bmN0aW9uIGNsYXNzTmFtZXMgKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0dmFyIGNsYXNzZXMgPSAnJztcblxuXHRmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBhcmcgPSBhcmd1bWVudHNbaV07XG5cdFx0aWYgKCFhcmcpIGNvbnRpbnVlO1xuXG5cdFx0dmFyIGFyZ1R5cGUgPSB0eXBlb2YgYXJnO1xuXG5cdFx0aWYgKCdzdHJpbmcnID09PSBhcmdUeXBlIHx8ICdudW1iZXInID09PSBhcmdUeXBlKSB7XG5cdFx0XHRjbGFzc2VzICs9ICcgJyArIGFyZztcblxuXHRcdH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShhcmcpKSB7XG5cdFx0XHRjbGFzc2VzICs9ICcgJyArIGNsYXNzTmFtZXMuYXBwbHkobnVsbCwgYXJnKTtcblxuXHRcdH0gZWxzZSBpZiAoJ29iamVjdCcgPT09IGFyZ1R5cGUpIHtcblx0XHRcdGZvciAodmFyIGtleSBpbiBhcmcpIHtcblx0XHRcdFx0aWYgKGFyZy5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIGFyZ1trZXldKSB7XG5cdFx0XHRcdFx0Y2xhc3NlcyArPSAnICcgKyBrZXk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gY2xhc3Nlcy5zdWJzdHIoMSk7XG59XG5cbi8vIHNhZmVseSBleHBvcnQgY2xhc3NOYW1lcyBmb3Igbm9kZSAvIGJyb3dzZXJpZnlcbmlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuXHRtb2R1bGUuZXhwb3J0cyA9IGNsYXNzTmFtZXM7XG59XG5cbi8qIGdsb2JhbCBkZWZpbmUgKi9cbi8vIHNhZmVseSBleHBvcnQgY2xhc3NOYW1lcyBmb3IgUmVxdWlyZUpTXG5pZiAodHlwZW9mIGRlZmluZSAhPT0gJ3VuZGVmaW5lZCcgJiYgZGVmaW5lLmFtZCkge1xuXHRkZWZpbmUoJ2NsYXNzbmFtZXMnLCBbXSwgZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIGNsYXNzTmFtZXM7XG5cdH0pO1xufVxuIiwidmFyIHBTbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcbnZhciBvYmplY3RLZXlzID0gcmVxdWlyZSgnLi9saWIva2V5cy5qcycpO1xudmFyIGlzQXJndW1lbnRzID0gcmVxdWlyZSgnLi9saWIvaXNfYXJndW1lbnRzLmpzJyk7XG5cbnZhciBkZWVwRXF1YWwgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChhY3R1YWwsIGV4cGVjdGVkLCBvcHRzKSB7XG4gIGlmICghb3B0cykgb3B0cyA9IHt9O1xuICAvLyA3LjEuIEFsbCBpZGVudGljYWwgdmFsdWVzIGFyZSBlcXVpdmFsZW50LCBhcyBkZXRlcm1pbmVkIGJ5ID09PS5cbiAgaWYgKGFjdHVhbCA9PT0gZXhwZWN0ZWQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcblxuICB9IGVsc2UgaWYgKGFjdHVhbCBpbnN0YW5jZW9mIERhdGUgJiYgZXhwZWN0ZWQgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgcmV0dXJuIGFjdHVhbC5nZXRUaW1lKCkgPT09IGV4cGVjdGVkLmdldFRpbWUoKTtcblxuICAvLyA3LjMuIE90aGVyIHBhaXJzIHRoYXQgZG8gbm90IGJvdGggcGFzcyB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcsXG4gIC8vIGVxdWl2YWxlbmNlIGlzIGRldGVybWluZWQgYnkgPT0uXG4gIH0gZWxzZSBpZiAodHlwZW9mIGFjdHVhbCAhPSAnb2JqZWN0JyAmJiB0eXBlb2YgZXhwZWN0ZWQgIT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gb3B0cy5zdHJpY3QgPyBhY3R1YWwgPT09IGV4cGVjdGVkIDogYWN0dWFsID09IGV4cGVjdGVkO1xuXG4gIC8vIDcuNC4gRm9yIGFsbCBvdGhlciBPYmplY3QgcGFpcnMsIGluY2x1ZGluZyBBcnJheSBvYmplY3RzLCBlcXVpdmFsZW5jZSBpc1xuICAvLyBkZXRlcm1pbmVkIGJ5IGhhdmluZyB0aGUgc2FtZSBudW1iZXIgb2Ygb3duZWQgcHJvcGVydGllcyAoYXMgdmVyaWZpZWRcbiAgLy8gd2l0aCBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwpLCB0aGUgc2FtZSBzZXQgb2Yga2V5c1xuICAvLyAoYWx0aG91Z2ggbm90IG5lY2Vzc2FyaWx5IHRoZSBzYW1lIG9yZGVyKSwgZXF1aXZhbGVudCB2YWx1ZXMgZm9yIGV2ZXJ5XG4gIC8vIGNvcnJlc3BvbmRpbmcga2V5LCBhbmQgYW4gaWRlbnRpY2FsICdwcm90b3R5cGUnIHByb3BlcnR5LiBOb3RlOiB0aGlzXG4gIC8vIGFjY291bnRzIGZvciBib3RoIG5hbWVkIGFuZCBpbmRleGVkIHByb3BlcnRpZXMgb24gQXJyYXlzLlxuICB9IGVsc2Uge1xuICAgIHJldHVybiBvYmpFcXVpdihhY3R1YWwsIGV4cGVjdGVkLCBvcHRzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZE9yTnVsbCh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gaXNCdWZmZXIgKHgpIHtcbiAgaWYgKCF4IHx8IHR5cGVvZiB4ICE9PSAnb2JqZWN0JyB8fCB0eXBlb2YgeC5sZW5ndGggIT09ICdudW1iZXInKSByZXR1cm4gZmFsc2U7XG4gIGlmICh0eXBlb2YgeC5jb3B5ICE9PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiB4LnNsaWNlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICh4Lmxlbmd0aCA+IDAgJiYgdHlwZW9mIHhbMF0gIT09ICdudW1iZXInKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBvYmpFcXVpdihhLCBiLCBvcHRzKSB7XG4gIHZhciBpLCBrZXk7XG4gIGlmIChpc1VuZGVmaW5lZE9yTnVsbChhKSB8fCBpc1VuZGVmaW5lZE9yTnVsbChiKSlcbiAgICByZXR1cm4gZmFsc2U7XG4gIC8vIGFuIGlkZW50aWNhbCAncHJvdG90eXBlJyBwcm9wZXJ0eS5cbiAgaWYgKGEucHJvdG90eXBlICE9PSBiLnByb3RvdHlwZSkgcmV0dXJuIGZhbHNlO1xuICAvL35+fkkndmUgbWFuYWdlZCB0byBicmVhayBPYmplY3Qua2V5cyB0aHJvdWdoIHNjcmV3eSBhcmd1bWVudHMgcGFzc2luZy5cbiAgLy8gICBDb252ZXJ0aW5nIHRvIGFycmF5IHNvbHZlcyB0aGUgcHJvYmxlbS5cbiAgaWYgKGlzQXJndW1lbnRzKGEpKSB7XG4gICAgaWYgKCFpc0FyZ3VtZW50cyhiKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBhID0gcFNsaWNlLmNhbGwoYSk7XG4gICAgYiA9IHBTbGljZS5jYWxsKGIpO1xuICAgIHJldHVybiBkZWVwRXF1YWwoYSwgYiwgb3B0cyk7XG4gIH1cbiAgaWYgKGlzQnVmZmVyKGEpKSB7XG4gICAgaWYgKCFpc0J1ZmZlcihiKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoYS5sZW5ndGggIT09IGIubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gICAgZm9yIChpID0gMDsgaSA8IGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChhW2ldICE9PSBiW2ldKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHRyeSB7XG4gICAgdmFyIGthID0gb2JqZWN0S2V5cyhhKSxcbiAgICAgICAga2IgPSBvYmplY3RLZXlzKGIpO1xuICB9IGNhdGNoIChlKSB7Ly9oYXBwZW5zIHdoZW4gb25lIGlzIGEgc3RyaW5nIGxpdGVyYWwgYW5kIHRoZSBvdGhlciBpc24ndFxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvLyBoYXZpbmcgdGhlIHNhbWUgbnVtYmVyIG9mIG93bmVkIHByb3BlcnRpZXMgKGtleXMgaW5jb3Jwb3JhdGVzXG4gIC8vIGhhc093blByb3BlcnR5KVxuICBpZiAoa2EubGVuZ3RoICE9IGtiLmxlbmd0aClcbiAgICByZXR1cm4gZmFsc2U7XG4gIC8vdGhlIHNhbWUgc2V0IG9mIGtleXMgKGFsdGhvdWdoIG5vdCBuZWNlc3NhcmlseSB0aGUgc2FtZSBvcmRlciksXG4gIGthLnNvcnQoKTtcbiAga2Iuc29ydCgpO1xuICAvL35+fmNoZWFwIGtleSB0ZXN0XG4gIGZvciAoaSA9IGthLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgaWYgKGthW2ldICE9IGtiW2ldKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vZXF1aXZhbGVudCB2YWx1ZXMgZm9yIGV2ZXJ5IGNvcnJlc3BvbmRpbmcga2V5LCBhbmRcbiAgLy9+fn5wb3NzaWJseSBleHBlbnNpdmUgZGVlcCB0ZXN0XG4gIGZvciAoaSA9IGthLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAga2V5ID0ga2FbaV07XG4gICAgaWYgKCFkZWVwRXF1YWwoYVtrZXldLCBiW2tleV0sIG9wdHMpKSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHR5cGVvZiBhID09PSB0eXBlb2YgYjtcbn1cbiIsInZhciBzdXBwb3J0c0FyZ3VtZW50c0NsYXNzID0gKGZ1bmN0aW9uKCl7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYXJndW1lbnRzKVxufSkoKSA9PSAnW29iamVjdCBBcmd1bWVudHNdJztcblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gc3VwcG9ydHNBcmd1bWVudHNDbGFzcyA/IHN1cHBvcnRlZCA6IHVuc3VwcG9ydGVkO1xuXG5leHBvcnRzLnN1cHBvcnRlZCA9IHN1cHBvcnRlZDtcbmZ1bmN0aW9uIHN1cHBvcnRlZChvYmplY3QpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmplY3QpID09ICdbb2JqZWN0IEFyZ3VtZW50c10nO1xufTtcblxuZXhwb3J0cy51bnN1cHBvcnRlZCA9IHVuc3VwcG9ydGVkO1xuZnVuY3Rpb24gdW5zdXBwb3J0ZWQob2JqZWN0KXtcbiAgcmV0dXJuIG9iamVjdCAmJlxuICAgIHR5cGVvZiBvYmplY3QgPT0gJ29iamVjdCcgJiZcbiAgICB0eXBlb2Ygb2JqZWN0Lmxlbmd0aCA9PSAnbnVtYmVyJyAmJlxuICAgIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsICdjYWxsZWUnKSAmJlxuICAgICFPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwob2JqZWN0LCAnY2FsbGVlJykgfHxcbiAgICBmYWxzZTtcbn07XG4iLCJleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSB0eXBlb2YgT2JqZWN0LmtleXMgPT09ICdmdW5jdGlvbidcbiAgPyBPYmplY3Qua2V5cyA6IHNoaW07XG5cbmV4cG9ydHMuc2hpbSA9IHNoaW07XG5mdW5jdGlvbiBzaGltIChvYmopIHtcbiAgdmFyIGtleXMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikga2V5cy5wdXNoKGtleSk7XG4gIHJldHVybiBrZXlzO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBUb09iamVjdCh2YWwpIHtcblx0aWYgKHZhbCA9PSBudWxsKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignT2JqZWN0LmFzc2lnbiBjYW5ub3QgYmUgY2FsbGVkIHdpdGggbnVsbCBvciB1bmRlZmluZWQnKTtcblx0fVxuXG5cdHJldHVybiBPYmplY3QodmFsKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQsIHNvdXJjZSkge1xuXHR2YXIgZnJvbTtcblx0dmFyIGtleXM7XG5cdHZhciB0byA9IFRvT2JqZWN0KHRhcmdldCk7XG5cblx0Zm9yICh2YXIgcyA9IDE7IHMgPCBhcmd1bWVudHMubGVuZ3RoOyBzKyspIHtcblx0XHRmcm9tID0gYXJndW1lbnRzW3NdO1xuXHRcdGtleXMgPSBPYmplY3Qua2V5cyhPYmplY3QoZnJvbSkpO1xuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR0b1trZXlzW2ldXSA9IGZyb21ba2V5c1tpXV07XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHRvO1xufTtcbiJdfQ==
