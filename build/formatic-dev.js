!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Formatic=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/justin/Dropbox/git/formatic/index.js":[function(require,module,exports){
"use strict";

// # index

// Export the Formatic React class at the top level.
module.exports = require("./lib/formatic");

},{"./lib/formatic":"/Users/justin/Dropbox/git/formatic/lib/formatic.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/fields/array.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

var CSSTransitionGroup = React.createFactory(React.addons.CSSTransitionGroup);

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
    }, R.div({ className: cx(this.props.classes) }, CSSTransitionGroup({ transitionName: "reveal" }, fields.map((function (childField, i) {
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

},{"../../mixins/field":"/Users/justin/Dropbox/git/formatic/lib/mixins/field.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/fields/boolean.js":[function(require,module,exports){
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

},{"../../mixins/field":"/Users/justin/Dropbox/git/formatic/lib/mixins/field.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/fields/checkbox-array.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var cx = React.addons.classSet;

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

},{"../../mixins/field":"/Users/justin/Dropbox/git/formatic/lib/mixins/field.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/fields/checkbox-boolean.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

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

},{"../../mixins/field":"/Users/justin/Dropbox/git/formatic/lib/mixins/field.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/fields/copy.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

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

},{"../../mixins/field":"/Users/justin/Dropbox/git/formatic/lib/mixins/field.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/fields/fields.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var cx = React.addons.classSet;

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

},{"../../mixins/field":"/Users/justin/Dropbox/git/formatic/lib/mixins/field.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/fields/json.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

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

},{"../../mixins/field":"/Users/justin/Dropbox/git/formatic/lib/mixins/field.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/fields/object.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var cx = React.addons.classSet;

var CSSTransitionGroup = React.createFactory(React.addons.CSSTransitionGroup);

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
    }, R.div({ className: cx(this.props.classes) }, CSSTransitionGroup({ transitionName: "reveal" }, fields.map((function (childField) {
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

},{"../../mixins/field":"/Users/justin/Dropbox/git/formatic/lib/mixins/field.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/fields/pretty-text2.js":[function(require,module,exports){
(function (global){
"use strict";

/* global CodeMirror */
/*eslint no-script-url:0 */

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var TagTranslator = require("../helpers/tag-translator");
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var cx = React.addons.classSet;

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
    var replaceChoices = this.props.config.fieldReplaceChoices(this.props.field);
    var translator = TagTranslator(replaceChoices, this.props.config.humanize);

    return {
      value: this.props.field.value,
      codeMirrorMode: false,
      isChoicesOpen: false,
      replaceChoices: replaceChoices,
      translator: translator
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    var replaceChoices = this.props.config.fieldReplaceChoices(nextProps.field);
    var nextState = {
      replaceChoices: replaceChoices
    };

    this.state.translator.addChoices(replaceChoices);

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
      { className: "pretty-content", onMouseEnter: this.switchToCodeMirror },
      React.createElement(
        "div",
        { className: textBoxClasses, tabIndex: tabIndex },
        textBox
      ),
      React.createElement(
        "a",
        { ref: "toggle", href: "Javascript:", onClick: this.onToggleChoices },
        "Insert..."
      ),
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

},{"../../mixins/field":"/Users/justin/Dropbox/git/formatic/lib/mixins/field.js","../helpers/tag-translator":"/Users/justin/Dropbox/git/formatic/lib/components/helpers/tag-translator.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/fields/select.js":[function(require,module,exports){
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

},{"../../mixins/field":"/Users/justin/Dropbox/git/formatic/lib/mixins/field.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/fields/single-line-string.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

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

},{"../../mixins/field":"/Users/justin/Dropbox/git/formatic/lib/mixins/field.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/fields/string.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

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

},{"../../mixins/field":"/Users/justin/Dropbox/git/formatic/lib/mixins/field.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/fields/unknown.js":[function(require,module,exports){
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

},{"../../mixins/field":"/Users/justin/Dropbox/git/formatic/lib/mixins/field.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/helpers/add-item.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

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

},{"../../mixins/helper":"/Users/justin/Dropbox/git/formatic/lib/mixins/helper.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/helpers/array-control.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

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

},{"../../mixins/helper":"/Users/justin/Dropbox/git/formatic/lib/mixins/helper.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/helpers/array-item-control.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

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

},{"../../mixins/helper":"/Users/justin/Dropbox/git/formatic/lib/mixins/helper.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/helpers/array-item-value.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

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

},{"../../mixins/helper":"/Users/justin/Dropbox/git/formatic/lib/mixins/helper.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/helpers/array-item.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;
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

},{"../../mixins/helper":"/Users/justin/Dropbox/git/formatic/lib/mixins/helper.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/helpers/choices.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

var CSSTransitionGroup = React.createFactory(React.addons.CSSTransitionGroup);

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

    var choices = this.props.choices;

    if (choices && choices.length === 0) {
      choices = [{ value: "///empty///" }];
    }

    return R.div({ ref: "container", onWheel: this.onWheel, onScroll: this.onScroll, className: "choices-container", style: {
        userSelect: "none", WebkitUserSelect: "none", position: "absolute",
        maxHeight: this.state.maxHeight ? this.state.maxHeight : null
      } }, CSSTransitionGroup({ transitionName: "reveal" }, this.props.open ? R.ul({ ref: "choices", className: "choices" }, choices.map((function (choice, i) {

      var choiceElement = null;

      if (choice.value === "///loading///") {
        choiceElement = R.a({ href: "JavaScript" + ":", onClick: this.props.onClose }, R.span({ className: "choice-label" }, "Loading..."));
      } else if (choice.value === "///empty///") {
        choiceElement = R.a({ href: "JavaScript" + ":", onClick: this.props.onClose }, R.span({ className: "choice-label" }, "No choices available."));
      } else {
        choiceElement = R.a({ href: "JavaScript" + ":", onClick: this.onSelect.bind(this, choice) }, R.span({ className: "choice-label" }, choice.label), R.span({ className: "choice-sample" }, choice.sample));
      }

      return R.li({ key: i, className: "choice" }, choiceElement);
    }).bind(this))) : null));
  }
});
// # choices component

/*
Render customized (non-native) dropdown choices.
*/

// console.log('stop that!')
// event.preventDefault();
// event.stopPropagation();

// event.preventDefault();
// event.stopPropagation();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/click-outside":"/Users/justin/Dropbox/git/formatic/lib/mixins/click-outside.js","../../mixins/helper":"/Users/justin/Dropbox/git/formatic/lib/mixins/helper.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/helpers/field-template-choices.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

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

},{"../../mixins/helper":"/Users/justin/Dropbox/git/formatic/lib/mixins/helper.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/helpers/field.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var cx = React.addons.classSet;

var CSSTransitionGroup = React.createFactory(React.addons.CSSTransitionGroup);

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
    }), CSSTransitionGroup({ transitionName: "reveal" }, this.state.collapsed ? [] : [config.createElement("help", {
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

},{"../../mixins/helper":"/Users/justin/Dropbox/git/formatic/lib/mixins/helper.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/helpers/help.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

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

},{"../../mixins/helper":"/Users/justin/Dropbox/git/formatic/lib/mixins/helper.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/helpers/label.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

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

},{"../../mixins/helper":"/Users/justin/Dropbox/git/formatic/lib/mixins/helper.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/helpers/move-item-back.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

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

},{"../../mixins/helper":"/Users/justin/Dropbox/git/formatic/lib/mixins/helper.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/helpers/move-item-forward.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

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

},{"../../mixins/helper":"/Users/justin/Dropbox/git/formatic/lib/mixins/helper.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/helpers/object-control.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

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

},{"../../mixins/helper":"/Users/justin/Dropbox/git/formatic/lib/mixins/helper.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/helpers/object-item-control.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

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

},{"../../mixins/helper":"/Users/justin/Dropbox/git/formatic/lib/mixins/helper.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/helpers/object-item-key.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

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
    return R.input({ className: cx(this.props.classes), type: "text", value: this.props.displayKey, onChange: this.onChange });
  }
});
// # object-item-key component

/*
Render an object item key editor.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":"/Users/justin/Dropbox/git/formatic/lib/mixins/helper.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/helpers/object-item-value.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

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

    return R.div({ className: cx(this.props.classes) }, config.createFieldElement({ field: field, onChange: this.onChangeField, plain: true }));
  }
});
// # object-item-value component

/*
Render the value of an object item.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":"/Users/justin/Dropbox/git/formatic/lib/mixins/helper.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/helpers/object-item.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

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

    return R.div({ className: cx(this.props.classes) }, config.createElement("object-item-key", { field: field, onChange: this.onChangeKey, displayKey: this.props.displayKey, itemKey: this.props.itemKey }), config.createElement("object-item-value", { field: field, onChange: this.props.onChange, itemKey: this.props.itemKey }), config.createElement("object-item-control", { field: field, onRemove: this.props.onRemove, itemKey: this.props.itemKey }));
  }
});
// # object-item component

/*
Render an object item.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":"/Users/justin/Dropbox/git/formatic/lib/mixins/helper.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/helpers/remove-item.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

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

},{"../../mixins/helper":"/Users/justin/Dropbox/git/formatic/lib/mixins/helper.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/helpers/sample.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

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

},{"../../mixins/helper":"/Users/justin/Dropbox/git/formatic/lib/mixins/helper.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/helpers/select-value.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var cx = React.addons.classSet;

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

    var choices = this.props.choices || [];

    var choicesOrLoading;

    if (choices.length === 1 && choices[0].value === "///loading///") {
      choicesOrLoading = R.div({}, "Loading choices...");
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

},{"../../mixins/helper":"/Users/justin/Dropbox/git/formatic/lib/mixins/helper.js"}],"/Users/justin/Dropbox/git/formatic/lib/components/helpers/tag-translator.js":[function(require,module,exports){
(function (global){
"use strict";

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

// Constant for first unused special use character.
// See IMPLEMENTATION NOTE in pretty-text2.js.
var FIRST_SPECIAL_CHAR = 57344;

// regexp used to grep out tags like {{firstName}}
var TAGS_REGEXP = /\{\{(.+?)\}\}/g;

// Zapier specific stuff. Make a plugin for this later.
function removeIdPrefix(key) {
  return String(key).replace(/^[0-9]+__/, "");
}

function buildChoicesMap(replaceChoices) {
  var choices = {};
  replaceChoices.forEach(function (choice) {
    var key = removeIdPrefix(choice.value);
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
      tag = removeIdPrefix(tag);
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
        tag = removeIdPrefix(tag);
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
        tag = removeIdPrefix(tag);
        var label = this.getLabel(tag);
        return "<span class=\"pretty-part\">" + label + "</span>";
      }).bind(this));
    },

    /*
       Get label for tag.  For example 'firstName' becomes 'First Name'.
       Returns a humanized version of the tag if we don't have a label for the tag.
     */
    getLabel: function getLabel(tag) {
      tag = removeIdPrefix(tag);
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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/justin/Dropbox/git/formatic/lib/default-config.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

var utils = require("./utils");

module.exports = {

  // Field element factories. Create field elements.

  createElement_Fields: React.createFactory(require("./components/fields/fields")),

  createElement_String: React.createFactory(require("./components/fields/string")),

  createElement_SingleLineString: React.createFactory(require("./components/fields/single-line-string")),

  createElement_Select: React.createFactory(require("./components/fields/select")),

  createElement_Boolean: React.createFactory(require("./components/fields/boolean")),

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

  createElement_Sample: React.createFactory(require("./components/helpers/sample")),

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

  createDefaultValue_Fields: utils.delegateTo("createDefaultValue_Object"),

  createDefaultValue_SingleLineString: utils.delegateTo("createDefaultValue_String"),

  createDefaultValue_Select: utils.delegateTo("createDefaultValue_String"),

  createDefaultValue_Json: utils.delegateTo("createDefaultValue_Object"),

  createDefaultValue_CheckboxArray: utils.delegateTo("createDefaultValue_Array"),

  createDefaultValue_CheckboxBoolean: utils.delegateTo("createDefaultValue_Boolean"),

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
    return this.coerceValueToBoolean(value);
  },

  coerceValue_Fields: utils.delegateTo("coerceValue_Object"),

  coerceValue_SingleLineString: utils.delegateTo("coerceValue_String"),

  coerceValue_Select: utils.delegateTo("coerceValue_String"),

  coerceValue_Json: utils.delegateTo("coerceValue_Object"),

  coerceValue_CheckboxArray: utils.delegateTo("coerceValue_Array"),

  coerceValue_CheckboxBoolean: utils.delegateTo("coerceValue_Boolean"),

  // Field child fields factories, so some types can have dynamic children.

  createChildFields_Array: function createChildFields_Array(field) {
    var config = this;

    return field.value.map(function (arrayItem, i) {
      var childFieldTemplate = config.childFieldTemplateForValue(field, arrayItem);

      var childField = config.createChildField(field, {
        fieldTemplate: childFieldTemplate, key: i, fieldIndex: i, value: arrayItem
      });

      return childField;
    });
  },

  createChildFields_Object: function createChildFields_Object(field) {
    var config = this;

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
    var config = this;

    return config["createElement_" + name] ? true : false;
  },

  // Create an element given a name, props, and children.
  createElement: function createElement(name, props, children) {
    var config = this;

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
    var config = this;

    var name = config.fieldTypeName(props.field);

    if (config.hasElementFactory(name)) {
      return config.createElement(name, props);
    }

    return config.createElement("UnknownField", props);
  },

  // Render the root formatic component
  renderFormaticComponent: function renderFormaticComponent(component) {
    var config = this;
    var props = component.props;

    var field = config.createRootField(props);

    return R.div({ className: "formatic" }, config.createFieldElement({ field: field, onChange: component.onChange, onAction: component.onAction }));
  },

  // Render any component.
  renderComponent: function renderComponent(component) {
    var config = this;

    var name = component.constructor.displayName;

    if (config["renderComponent_" + name]) {
      return config["renderComponent_" + name](component);
    }

    return component.renderDefault();
  },

  // Render field components.
  renderFieldComponent: function renderFieldComponent(component) {
    var config = this;

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
    var config = this;

    if (fieldTemplate.replaceChoices) {
      return "PrettyText";
    } else if (fieldTemplate.choices) {
      return "Select";
    } else if (config.fieldTemplateIsSingleLine(fieldTemplate)) {
      return "SingleLineString";
    }
    return "String";
  },

  alias_Text: utils.delegateTo("alias_String"),

  alias_Unicode: utils.delegateTo("alias_SingleLineString"),

  alias_Str: utils.delegateTo("alias_SingleLineString"),

  alias_List: "Array",

  alias_CheckboxList: "CheckboxArray",

  alias_Fieldset: "Fields",

  alias_Checkbox: "CheckboxBoolean",

  // Field factory

  // Given a field, expand all child fields recursively to get the default
  // values of all fields.
  inflateFieldValue: function inflateFieldValue(field, fieldHandler) {
    var config = this;

    if (fieldHandler) {
      var stop = fieldHandler(field);
      if (stop === false) {
        return;
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
    var config = this;

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
    var config = this;

    var field = config.createRootField(props);

    return config.inflateFieldValue(field, fieldHandler);
  },

  validateRootValue: function validateRootValue(props) {
    var config = this;

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
    var config = this;

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
    var config = this;

    if (field.value === undefined || field.value === "") {
      if (config.fieldIsRequired(field)) {
        errors.push({
          type: "required"
        });
      }
    }
  },

  // Create dynamic child fields for a field.
  createChildFields: function createChildFields(field) {
    var config = this;

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
    var config = this;

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
    var config = this;

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
    var config = this;

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
    var config = this;

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
    var config = this;

    var typeName = config.fieldTypeName(field);

    if (config["coerceValue_" + typeName]) {
      return config["coerceValue_" + typeName](field, value);
    }

    return value;
  },

  // Given a field and a child value, find the appropriate field template for
  // that child value.
  childFieldTemplateForValue: function childFieldTemplateForValue(field, childValue) {
    var config = this;

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
    return _.every(_.keys(match), function (key) {
      return _.isEqual(match[key], value[key]);
    });
  },

  // Field template helpers

  // Normalized (PascalCase) type name for a field.
  fieldTemplateTypeName: function fieldTemplateTypeName(fieldTemplate) {
    var config = this;

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
    var config = this;

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
    var config = this;

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

  fieldTypeName: utils.delegateTo("fieldTemplateTypeName"),

  // Get the choices for a dropdown field.
  fieldChoices: function fieldChoices(field) {
    var config = this;

    return config.normalizeChoices(field.choices);
  },

  // Get a set of boolean choices for a field.
  fieldBooleanChoices: function fieldBooleanChoices(field) {
    var config = this;

    var choices = config.fieldChoices(field);

    if (choices.length === 0) {
      return [{
        label: "Yes",
        value: true
      }, {
        label: "No",
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
    var config = this;

    return config.normalizeChoices(field.replaceChoices);
  },

  // Get a label for a field.
  fieldLabel: function fieldLabel(field) {
    return field.label;
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
    var config = this;

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

  fieldIsSingleLine: utils.delegateTo("fieldTemplateIsSingleLine"),

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
    var config = this;

    var errors = [];

    if (config.isKey(field.key)) {
      config.validateField(field, errors);
    }

    return errors;
  },

  fieldMatch: utils.delegateTo("fieldTemplateMatch"),

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
    var config = this;

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
  }
};
// # default-config

/*
This is the default configuration for formatic. It's just an object with a bunch
of behavior functions that are passed into all the components. So to change
formatic's behavior, it's simple matter of cloning this object and overriding
the methods.
*/

/* fieldTemplate */ /* fieldTemplate */ /* fieldTemplate */ /* fieldTemplate */ /* field, props */ /* field */

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./components/fields/array":"/Users/justin/Dropbox/git/formatic/lib/components/fields/array.js","./components/fields/boolean":"/Users/justin/Dropbox/git/formatic/lib/components/fields/boolean.js","./components/fields/checkbox-array":"/Users/justin/Dropbox/git/formatic/lib/components/fields/checkbox-array.js","./components/fields/checkbox-boolean":"/Users/justin/Dropbox/git/formatic/lib/components/fields/checkbox-boolean.js","./components/fields/copy":"/Users/justin/Dropbox/git/formatic/lib/components/fields/copy.js","./components/fields/fields":"/Users/justin/Dropbox/git/formatic/lib/components/fields/fields.js","./components/fields/json":"/Users/justin/Dropbox/git/formatic/lib/components/fields/json.js","./components/fields/object":"/Users/justin/Dropbox/git/formatic/lib/components/fields/object.js","./components/fields/pretty-text2":"/Users/justin/Dropbox/git/formatic/lib/components/fields/pretty-text2.js","./components/fields/select":"/Users/justin/Dropbox/git/formatic/lib/components/fields/select.js","./components/fields/single-line-string":"/Users/justin/Dropbox/git/formatic/lib/components/fields/single-line-string.js","./components/fields/string":"/Users/justin/Dropbox/git/formatic/lib/components/fields/string.js","./components/fields/unknown":"/Users/justin/Dropbox/git/formatic/lib/components/fields/unknown.js","./components/helpers/add-item":"/Users/justin/Dropbox/git/formatic/lib/components/helpers/add-item.js","./components/helpers/array-control":"/Users/justin/Dropbox/git/formatic/lib/components/helpers/array-control.js","./components/helpers/array-item":"/Users/justin/Dropbox/git/formatic/lib/components/helpers/array-item.js","./components/helpers/array-item-control":"/Users/justin/Dropbox/git/formatic/lib/components/helpers/array-item-control.js","./components/helpers/array-item-value":"/Users/justin/Dropbox/git/formatic/lib/components/helpers/array-item-value.js","./components/helpers/choices":"/Users/justin/Dropbox/git/formatic/lib/components/helpers/choices.js","./components/helpers/field":"/Users/justin/Dropbox/git/formatic/lib/components/helpers/field.js","./components/helpers/field-template-choices":"/Users/justin/Dropbox/git/formatic/lib/components/helpers/field-template-choices.js","./components/helpers/help":"/Users/justin/Dropbox/git/formatic/lib/components/helpers/help.js","./components/helpers/label":"/Users/justin/Dropbox/git/formatic/lib/components/helpers/label.js","./components/helpers/move-item-back":"/Users/justin/Dropbox/git/formatic/lib/components/helpers/move-item-back.js","./components/helpers/move-item-forward":"/Users/justin/Dropbox/git/formatic/lib/components/helpers/move-item-forward.js","./components/helpers/object-control":"/Users/justin/Dropbox/git/formatic/lib/components/helpers/object-control.js","./components/helpers/object-item":"/Users/justin/Dropbox/git/formatic/lib/components/helpers/object-item.js","./components/helpers/object-item-control":"/Users/justin/Dropbox/git/formatic/lib/components/helpers/object-item-control.js","./components/helpers/object-item-key":"/Users/justin/Dropbox/git/formatic/lib/components/helpers/object-item-key.js","./components/helpers/object-item-value":"/Users/justin/Dropbox/git/formatic/lib/components/helpers/object-item-value.js","./components/helpers/remove-item":"/Users/justin/Dropbox/git/formatic/lib/components/helpers/remove-item.js","./components/helpers/sample":"/Users/justin/Dropbox/git/formatic/lib/components/helpers/sample.js","./components/helpers/select-value":"/Users/justin/Dropbox/git/formatic/lib/components/helpers/select-value.js","./utils":"/Users/justin/Dropbox/git/formatic/lib/utils.js"}],"/Users/justin/Dropbox/git/formatic/lib/formatic.js":[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

var utils = require("./utils");

var defaultConfig = require("./default-config");

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
    createConfig: function createConfig() {
      var args = _.toArray(arguments);
      var config = _.extend({}, defaultConfig);

      if (args.length === 0) {
        return config;
      }
      var configs = [config].concat(args);
      return configs.reduce(function (prev, curr) {
        if (_.isFunction(curr)) {
          curr(prev);
          return prev;
        }
        return _.extend(prev, curr);
      });
    },
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

},{"./default-config":"/Users/justin/Dropbox/git/formatic/lib/default-config.js","./mixins/click-outside.js":"/Users/justin/Dropbox/git/formatic/lib/mixins/click-outside.js","./mixins/field.js":"/Users/justin/Dropbox/git/formatic/lib/mixins/field.js","./mixins/helper.js":"/Users/justin/Dropbox/git/formatic/lib/mixins/helper.js","./mixins/resize.js":"/Users/justin/Dropbox/git/formatic/lib/mixins/resize.js","./mixins/scroll.js":"/Users/justin/Dropbox/git/formatic/lib/mixins/scroll.js","./mixins/undo-stack.js":"/Users/justin/Dropbox/git/formatic/lib/mixins/undo-stack.js","./plugins/bootstrap":"/Users/justin/Dropbox/git/formatic/lib/plugins/bootstrap.js","./plugins/element-classes":"/Users/justin/Dropbox/git/formatic/lib/plugins/element-classes.js","./plugins/meta":"/Users/justin/Dropbox/git/formatic/lib/plugins/meta.js","./plugins/reference":"/Users/justin/Dropbox/git/formatic/lib/plugins/reference.js","./utils":"/Users/justin/Dropbox/git/formatic/lib/utils.js"}],"/Users/justin/Dropbox/git/formatic/lib/mixins/click-outside.js":[function(require,module,exports){
(function (global){
"use strict";

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/justin/Dropbox/git/formatic/lib/mixins/field.js":[function(require,module,exports){
(function (global){
"use strict";

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/justin/Dropbox/git/formatic/lib/mixins/helper.js":[function(require,module,exports){
(function (global){
"use strict";

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/justin/Dropbox/git/formatic/lib/mixins/resize.js":[function(require,module,exports){
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

},{}],"/Users/justin/Dropbox/git/formatic/lib/mixins/scroll.js":[function(require,module,exports){
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

},{}],"/Users/justin/Dropbox/git/formatic/lib/mixins/undo-stack.js":[function(require,module,exports){
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

},{}],"/Users/justin/Dropbox/git/formatic/lib/plugins/bootstrap.js":[function(require,module,exports){
(function (global){
"use strict";

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

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

  var defaultCreateElement = config.createElement;

  // Wrap the createElement method.
  config.createElement = function (name, props, children) {

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

    return defaultCreateElement.call(this, name, props, children);
  };
};
// # bootstrap plugin

/*
The bootstrap plugin sneaks in some classes to elements so that it plays well
with Twitter Bootstrap.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/justin/Dropbox/git/formatic/lib/plugins/element-classes.js":[function(require,module,exports){
(function (global){
"use strict";

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = function (config) {

  var defaultCreateElement = config.createElement;

  var elementClasses = {};

  config.addElementClass = function (name, className) {

    name = config.elementName(name);

    if (!elementClasses[name]) {
      elementClasses[name] = {};
    }

    elementClasses[name][className] = true;
  };

  // Wrap the createElement method.
  config.createElement = function (name, props, children) {

    name = config.elementName(name);

    if (elementClasses[name]) {
      props = _.extend({}, props, { classes: elementClasses[name] });
    }

    return defaultCreateElement.call(this, name, props, children);
  };
};
// # element-classes plugin

/*
This plugins provides a config method addElementClass that lets you add on a
class to an element.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/justin/Dropbox/git/formatic/lib/plugins/meta.js":[function(require,module,exports){
"use strict";

module.exports = function (cfg) {

  var initRootField = cfg.initRootField;

  cfg.initRootField = function (field, props) {
    var config = this;

    field.meta = props.meta || {};

    initRootField.apply(config, arguments);
  };

  var initField = cfg.initField;

  cfg.initField = function (field) {
    var config = this;

    if (field.parent && field.parent.meta) {
      field.meta = field.parent.meta;
    }

    initField.apply(config, arguments);
  };
};
// # meta plugin

/*
The meta plugin lets you pass in a meta prop to formatic. The prop then gets
passed through as a property for every field. You can then wrap `initField` to
get your meta values.
*/

},{}],"/Users/justin/Dropbox/git/formatic/lib/plugins/reference.js":[function(require,module,exports){
(function (global){
"use strict";

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = function (cfg) {

  var initField = cfg.initField;

  // Look for a template in this field or any of its parents.
  cfg.findFieldTemplate = function (field, name) {
    var config = this;

    if (field.templates[name]) {
      return field.templates[name];
    }

    if (field.parent) {
      return config.findFieldTemplate(field.parent, name);
    }

    return null;
  };

  // Inherit from any field templates that this field template
  // extends.
  cfg.resolveFieldTemplate = function (field, fieldTemplate) {
    var config = this;

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
  };

  // Wrap the initField method.
  cfg.initField = function (field) {

    var config = this;

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

    initField.call(config, arguments);
  };
};
// # reference plugin

/*
This plugin allows fields to be strings and reference other fields by key or
id. It also allows a field to extend another field with
extends: ['foo', 'bar'] where 'foo' and 'bar' refer to other keys or ids.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/justin/Dropbox/git/formatic/lib/utils.js":[function(require,module,exports){
(function (global){
"use strict";

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

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
// # utils

/*
Just some shared utility functions.
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},["/Users/justin/Dropbox/git/formatic/index.js"])("/Users/justin/Dropbox/git/formatic/index.js")
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2luZGV4LmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9maWVsZHMvYXJyYXkuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9ib29sZWFuLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9maWVsZHMvY2hlY2tib3gtYXJyYXkuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9jaGVja2JveC1ib29sZWFuLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9maWVsZHMvY29weS5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvZmllbGRzL2ZpZWxkcy5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvZmllbGRzL2pzb24uanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9vYmplY3QuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9wcmV0dHktdGV4dDIuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9zZWxlY3QuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9zaW5nbGUtbGluZS1zdHJpbmcuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9zdHJpbmcuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy91bmtub3duLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2FkZC1pdGVtLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2FycmF5LWNvbnRyb2wuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvYXJyYXktaXRlbS1jb250cm9sLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2FycmF5LWl0ZW0tdmFsdWUuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvYXJyYXktaXRlbS5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9jaG9pY2VzLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2ZpZWxkLXRlbXBsYXRlLWNob2ljZXMuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvZmllbGQuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvaGVscC5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9sYWJlbC5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9tb3ZlLWl0ZW0tYmFjay5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9tb3ZlLWl0ZW0tZm9yd2FyZC5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9vYmplY3QtY29udHJvbC5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9vYmplY3QtaXRlbS1jb250cm9sLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL29iamVjdC1pdGVtLWtleS5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9vYmplY3QtaXRlbS12YWx1ZS5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9vYmplY3QtaXRlbS5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9yZW1vdmUtaXRlbS5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9zYW1wbGUuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvc2VsZWN0LXZhbHVlLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL3RhZy10cmFuc2xhdG9yLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvZGVmYXVsdC1jb25maWcuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9mb3JtYXRpYy5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL21peGlucy9jbGljay1vdXRzaWRlLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvbWl4aW5zL2ZpZWxkLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvbWl4aW5zL2hlbHBlci5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL21peGlucy9yZXNpemUuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9taXhpbnMvc2Nyb2xsLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvbWl4aW5zL3VuZG8tc3RhY2suanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi9wbHVnaW5zL2Jvb3RzdHJhcC5qcyIsIi9Vc2Vycy9qdXN0aW4vRHJvcGJveC9naXQvZm9ybWF0aWMvbGliL3BsdWdpbnMvZWxlbWVudC1jbGFzc2VzLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvcGx1Z2lucy9tZXRhLmpzIiwiL1VzZXJzL2p1c3Rpbi9Ecm9wYm94L2dpdC9mb3JtYXRpYy9saWIvcGx1Z2lucy9yZWZlcmVuY2UuanMiLCIvVXNlcnMvanVzdGluL0Ryb3Bib3gvZ2l0L2Zvcm1hdGljL2xpYi91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0FDR0EsTUFBTSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzs7Ozs7O0FDSzNDLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNwQyxJQUFJLENBQUMsR0FBRyxLQUFLLENB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QU8sWUFBWTtBQUNqQixXQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0dBQzFDLENBQUM7Q0FDSCxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vICMgaW5kZXhcblxuLy8gRXhwb3J0IHRoZSBGb3JtYXRpYyBSZWFjdCBjbGFzcyBhdCB0aGUgdG9wIGxldmVsLlxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9mb3JtYXRpYycpO1xuIiwiLy8gIyBhcnJheSBjb21wb25lbnRcblxuLypcblJlbmRlciBhIGZpZWxkIHRvIGVkaXQgYXJyYXkgdmFsdWVzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG52YXIgQ1NTVHJhbnNpdGlvbkdyb3VwID0gUmVhY3QuY3JlYXRlRmFjdG9yeShSZWFjdC5hZGRvbnMuQ1NTVHJhbnNpdGlvbkdyb3VwKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdBcnJheScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIC8vIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAvLyAgIHJldHVybiB7XG4gIC8vICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lXG4gIC8vICAgfTtcbiAgLy8gfSxcblxuICBuZXh0TG9va3VwSWQ6IDAsXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAvLyBOZWVkIHRvIGNyZWF0ZSBhcnRpZmljaWFsIGtleXMgZm9yIHRoZSBhcnJheS4gSW5kZXhlcyBhcmUgbm90IGdvb2Qga2V5cyxcbiAgICAvLyBzaW5jZSB0aGV5IGNoYW5nZS4gU28sIG1hcCBlYWNoIHBvc2l0aW9uIHRvIGFuIGFydGlmaWNpYWwga2V5XG4gICAgdmFyIGxvb2t1cHMgPSBbXTtcblxuICAgIHZhciBpdGVtcyA9IHRoaXMucHJvcHMuZmllbGQudmFsdWU7XG5cbiAgICBpdGVtcy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtLCBpKSB7XG4gICAgICBsb29rdXBzW2ldID0gJ18nICsgdGhpcy5uZXh0TG9va3VwSWQ7XG4gICAgICB0aGlzLm5leHRMb29rdXBJZCsrO1xuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgbG9va3VwczogbG9va3Vwc1xuICAgIH07XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gKG5ld1Byb3BzKSB7XG5cbiAgICB2YXIgbG9va3VwcyA9IHRoaXMuc3RhdGUubG9va3VwcztcblxuICAgIHZhciBpdGVtcyA9IG5ld1Byb3BzLmZpZWxkLnZhbHVlO1xuXG4gICAgLy8gTmVlZCB0byBzZXQgYXJ0aWZpY2lhbCBrZXlzIGZvciBuZXcgYXJyYXkgaXRlbXMuXG4gICAgaWYgKGl0ZW1zLmxlbmd0aCA+IGxvb2t1cHMubGVuZ3RoKSB7XG4gICAgICBmb3IgKHZhciBpID0gbG9va3Vwcy5sZW5ndGg7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsb29rdXBzW2ldID0gJ18nICsgdGhpcy5uZXh0TG9va3VwSWQ7XG4gICAgICAgIHRoaXMubmV4dExvb2t1cElkKys7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBsb29rdXBzOiBsb29rdXBzXG4gICAgfSk7XG4gIH0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChpLCBuZXdWYWx1ZSwgaW5mbykge1xuICAgIHZhciBuZXdBcnJheVZhbHVlID0gdGhpcy5wcm9wcy5maWVsZC52YWx1ZS5zbGljZSgwKTtcbiAgICBuZXdBcnJheVZhbHVlW2ldID0gbmV3VmFsdWU7XG4gICAgdGhpcy5vbkJ1YmJsZVZhbHVlKG5ld0FycmF5VmFsdWUsIGluZm8pO1xuICB9LFxuXG4gIG9uQXBwZW5kOiBmdW5jdGlvbiAoaXRlbUNob2ljZUluZGV4KSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICB2YXIgbmV3VmFsdWUgPSBjb25maWcuY3JlYXRlTmV3Q2hpbGRGaWVsZFZhbHVlKGZpZWxkLCBpdGVtQ2hvaWNlSW5kZXgpO1xuXG4gICAgdmFyIGl0ZW1zID0gZmllbGQudmFsdWU7XG5cbiAgICBpdGVtcyA9IGl0ZW1zLmNvbmNhdChuZXdWYWx1ZSk7XG5cbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUoaXRlbXMpO1xuICB9LFxuXG4gIG9uUmVtb3ZlOiBmdW5jdGlvbiAoaSkge1xuICAgIHZhciBsb29rdXBzID0gdGhpcy5zdGF0ZS5sb29rdXBzO1xuICAgIGxvb2t1cHMuc3BsaWNlKGksIDEpO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgbG9va3VwczogbG9va3Vwc1xuICAgIH0pO1xuICAgIHZhciBuZXdJdGVtcyA9IHRoaXMucHJvcHMuZmllbGQudmFsdWUuc2xpY2UoMCk7XG4gICAgbmV3SXRlbXMuc3BsaWNlKGksIDEpO1xuICAgIHRoaXMub25DaGFuZ2VWYWx1ZShuZXdJdGVtcyk7XG4gIH0sXG5cbiAgb25Nb3ZlOiBmdW5jdGlvbiAoZnJvbUluZGV4LCB0b0luZGV4KSB7XG4gICAgdmFyIGxvb2t1cHMgPSB0aGlzLnN0YXRlLmxvb2t1cHM7XG4gICAgdmFyIGZyb21JZCA9IGxvb2t1cHNbZnJvbUluZGV4XTtcbiAgICB2YXIgdG9JZCA9IGxvb2t1cHNbdG9JbmRleF07XG4gICAgbG9va3Vwc1tmcm9tSW5kZXhdID0gdG9JZDtcbiAgICBsb29rdXBzW3RvSW5kZXhdID0gZnJvbUlkO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgbG9va3VwczogbG9va3Vwc1xuICAgIH0pO1xuXG4gICAgdmFyIG5ld0l0ZW1zID0gdGhpcy5wcm9wcy5maWVsZC52YWx1ZS5zbGljZSgwKTtcbiAgICBpZiAoZnJvbUluZGV4ICE9PSB0b0luZGV4ICYmXG4gICAgICBmcm9tSW5kZXggPj0gMCAmJiBmcm9tSW5kZXggPCBuZXdJdGVtcy5sZW5ndGggJiZcbiAgICAgIHRvSW5kZXggPj0gMCAmJiB0b0luZGV4IDwgbmV3SXRlbXMubGVuZ3RoXG4gICAgKSB7XG4gICAgICBuZXdJdGVtcy5zcGxpY2UodG9JbmRleCwgMCwgbmV3SXRlbXMuc3BsaWNlKGZyb21JbmRleCwgMSlbMF0pO1xuICAgIH1cbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUobmV3SXRlbXMpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHZhciBmaWVsZHMgPSBjb25maWcuY3JlYXRlQ2hpbGRGaWVsZHMoZmllbGQpO1xuXG4gICAgdmFyIG51bUl0ZW1zID0gZmllbGQudmFsdWUubGVuZ3RoO1xuICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQnLCB7XG4gICAgICBmaWVsZDogZmllbGQsIHBsYWluOiB0aGlzLnByb3BzLnBsYWluXG4gICAgfSxcbiAgICAgIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3Nlcyl9LFxuICAgICAgICBDU1NUcmFuc2l0aW9uR3JvdXAoe3RyYW5zaXRpb25OYW1lOiAncmV2ZWFsJ30sXG4gICAgICAgIGZpZWxkcy5tYXAoZnVuY3Rpb24gKGNoaWxkRmllbGQsIGkpIHtcbiAgICAgICAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2FycmF5LWl0ZW0nLCB7XG4gICAgICAgICAgICBrZXk6IHRoaXMuc3RhdGUubG9va3Vwc1tpXSxcbiAgICAgICAgICAgIGZpZWxkOiBjaGlsZEZpZWxkLFxuICAgICAgICAgICAgaW5kZXg6IGksXG4gICAgICAgICAgICBudW1JdGVtczogbnVtSXRlbXMsXG4gICAgICAgICAgICBvbk1vdmU6IHRoaXMub25Nb3ZlLFxuICAgICAgICAgICAgb25SZW1vdmU6IHRoaXMub25SZW1vdmUsXG4gICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgICAgICAgIG9uQWN0aW9uOiB0aGlzLm9uQnViYmxlQWN0aW9uXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSkpLFxuICAgICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgnYXJyYXktY29udHJvbCcsIHtmaWVsZDogZmllbGQsIG9uQXBwZW5kOiB0aGlzLm9uQXBwZW5kfSlcbiAgICAgIClcbiAgICApO1xuICB9XG59KTtcbiIsIi8vICMgYm9vbGVhbiBjb21wb25lbnRcblxuLypcblJlbmRlciBhIGRyb3Bkb3duIHRvIGhhbmRsZSB5ZXMvbm8gYm9vbGVhbiB2YWx1ZXMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0Jvb2xlYW4nLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICBvbkNoYW5nZTogZnVuY3Rpb24gKG5ld1ZhbHVlKSB7XG4gICAgdGhpcy5vbkNoYW5nZVZhbHVlKG5ld1ZhbHVlKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICB2YXIgY2hvaWNlcyA9IGNvbmZpZy5maWVsZEJvb2xlYW5DaG9pY2VzKGZpZWxkKTtcblxuICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQnLCB7XG4gICAgICBmaWVsZDogZmllbGQsIHBsYWluOiB0aGlzLnByb3BzLnBsYWluXG4gICAgfSwgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ3NlbGVjdC12YWx1ZScsIHtcbiAgICAgIGNob2ljZXM6IGNob2ljZXMsIGZpZWxkOiBmaWVsZCwgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsIG9uQWN0aW9uOiB0aGlzLm9uQnViYmxlQWN0aW9uXG4gICAgfSkpO1xuICB9XG59KTtcbiIsIi8vICMgY2hlY2tib3gtYXJyYXkgY29tcG9uZW50XG5cbi8qXG5Vc2VkIHdpdGggYXJyYXkgdmFsdWVzIHRvIHN1cHBseSBtdWx0aXBsZSBjaGVja2JveGVzIGZvciBhZGRpbmcgbXVsdGlwbGVcbmVudW1lcmF0ZWQgdmFsdWVzIHRvIGFuIGFycmF5LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgXyA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUnKTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdDaGVja2JveEFycmF5JyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNob2ljZXM6IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkQ2hvaWNlcyh0aGlzLnByb3BzLmZpZWxkKVxuICAgIH07XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gKG5ld1Byb3BzKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjaG9pY2VzOiBuZXdQcm9wcy5jb25maWcuZmllbGRDaG9pY2VzKG5ld1Byb3BzLmZpZWxkKVxuICAgIH0pO1xuICB9LFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAoKSB7XG4gICAgLy8gR2V0IGFsbCB0aGUgY2hlY2tlZCBjaGVja2JveGVzIGFuZCBjb252ZXJ0IHRvIGFuIGFycmF5IG9mIHZhbHVlcy5cbiAgICB2YXIgY2hvaWNlTm9kZXMgPSB0aGlzLnJlZnMuY2hvaWNlcy5nZXRET01Ob2RlKCkuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2lucHV0Jyk7XG4gICAgY2hvaWNlTm9kZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChjaG9pY2VOb2RlcywgMCk7XG4gICAgdmFyIHZhbHVlcyA9IGNob2ljZU5vZGVzLm1hcChmdW5jdGlvbiAobm9kZSkge1xuICAgICAgcmV0dXJuIG5vZGUuY2hlY2tlZCA/IG5vZGUudmFsdWUgOiBudWxsO1xuICAgIH0pLmZpbHRlcihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9KTtcbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUodmFsdWVzKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICB2YXIgY2hvaWNlcyA9IHRoaXMuc3RhdGUuY2hvaWNlcyB8fCBbXTtcblxuICAgIHZhciBpc0lubGluZSA9ICFfLmZpbmQoY2hvaWNlcywgZnVuY3Rpb24gKGNob2ljZSkge1xuICAgICAgcmV0dXJuIGNob2ljZS5zYW1wbGU7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywge1xuICAgICAgZmllbGQ6IGZpZWxkXG4gICAgfSxcbiAgICAgIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcyksIHJlZjogJ2Nob2ljZXMnfSxcbiAgICAgICAgY2hvaWNlcy5tYXAoZnVuY3Rpb24gKGNob2ljZSwgaSkge1xuXG4gICAgICAgICAgdmFyIGlucHV0RmllbGQgPSBSLnNwYW4oe3N0eWxlOiB7d2hpdGVTcGFjZTogJ25vd3JhcCd9fSxcbiAgICAgICAgICAgIFIuaW5wdXQoe1xuICAgICAgICAgICAgICBuYW1lOiBmaWVsZC5rZXksXG4gICAgICAgICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgICAgICAgIHZhbHVlOiBjaG9pY2UudmFsdWUsXG4gICAgICAgICAgICAgIGNoZWNrZWQ6IGZpZWxkLnZhbHVlLmluZGV4T2YoY2hvaWNlLnZhbHVlKSA+PSAwID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgICAgICAgICAgb25Gb2N1czogdGhpcy5vbkZvY3VzQWN0aW9uLFxuICAgICAgICAgICAgICBvbkJsdXI6IHRoaXMub25CbHVyQWN0aW9uXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICcgJyxcbiAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAnZmllbGQtY2hvaWNlLWxhYmVsJ30sXG4gICAgICAgICAgICAgIGNob2ljZS5sYWJlbFxuICAgICAgICAgICAgKVxuICAgICAgICAgICk7XG5cbiAgICAgICAgICBpZiAoaXNJbmxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiBSLnNwYW4oe2tleTogaSwgY2xhc3NOYW1lOiAnZmllbGQtY2hvaWNlJ30sXG4gICAgICAgICAgICAgIGlucHV0RmllbGQsICcgJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFIuZGl2KHtrZXk6IGksIGNsYXNzTmFtZTogJ2ZpZWxkLWNob2ljZSd9LFxuICAgICAgICAgICAgICBpbnB1dEZpZWxkLCAnICcsXG4gICAgICAgICAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdzYW1wbGUnLCB7ZmllbGQ6IGZpZWxkLCBjaG9pY2U6IGNob2ljZX0pXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgKVxuICAgICk7XG4gIH1cbn0pO1xuIiwiLy8gIyBjaGVja2JveC1ib29sZWFuIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIGEgZmllbGQgdGhhdCBjYW4gZWRpdCBhIGJvb2xlYW4gd2l0aCBhIGNoZWNrYm94LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0NoZWNrYm94Qm9vbGVhbicsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUoZXZlbnQudGFyZ2V0LmNoZWNrZWQpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQnLCB7XG4gICAgICBjb25maWc6IGNvbmZpZywgZmllbGQ6IGZpZWxkLCBwbGFpbjogdHJ1ZVxuICAgIH0sXG4gICAgUi5zcGFuKHtzdHlsZToge3doaXRlU3BhY2U6ICdub3dyYXAnfX0sXG4gICAgICBSLmlucHV0KHtcbiAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgY2hlY2tlZDogZmllbGQudmFsdWUsXG4gICAgICAgIGNsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSxcbiAgICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsXG4gICAgICAgIG9uRm9jdXM6IHRoaXMub25Gb2N1c0FjdGlvbixcbiAgICAgICAgb25CbHVyOiB0aGlzLm9uQmx1ckFjdGlvblxuICAgICAgfSksXG4gICAgICBSLnNwYW4oe30sICcgJyksXG4gICAgICBSLnNwYW4oe30sIGNvbmZpZy5maWVsZEhlbHBUZXh0KGZpZWxkKSB8fCBjb25maWcuZmllbGRMYWJlbChmaWVsZCkpXG4gICAgKSk7XG4gIH1cbn0pO1xuIiwiLy8gIyBjb3B5IGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIG5vbi1lZGl0YWJsZSBodG1sL3RleHQgKHRoaW5rIGFydGljbGUgY29weSkuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnQ29weScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSwgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw6IHtcbiAgICAgIF9faHRtbDogdGhpcy5wcm9wcy5jb25maWcuZmllbGRIZWxwVGV4dCh0aGlzLnByb3BzLmZpZWxkKVxuICAgIH19KTtcbiAgfVxufSk7XG4iLCIvLyAjIGZpZWxkcyBjb21wb25lbnRcblxuLypcblJlbmRlciBhIGZpZWxkIHRvIGVkaXQgdGhlIHZhbHVlcyBvZiBhbiBvYmplY3Qgd2l0aCBzdGF0aWMgcHJvcGVydGllcy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBfID0gcmVxdWlyZSgndW5kZXJzY29yZScpO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0ZpZWxkcycsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIG9uQ2hhbmdlRmllbGQ6IGZ1bmN0aW9uIChrZXksIG5ld1ZhbHVlLCBpbmZvKSB7XG4gICAgaWYgKGtleSkge1xuICAgICAgdmFyIG5ld09iamVjdFZhbHVlID0gXy5leHRlbmQoe30sIHRoaXMucHJvcHMuZmllbGQudmFsdWUpO1xuICAgICAgbmV3T2JqZWN0VmFsdWVba2V5XSA9IG5ld1ZhbHVlO1xuICAgICAgdGhpcy5vbkJ1YmJsZVZhbHVlKG5ld09iamVjdFZhbHVlLCBpbmZvKTtcbiAgICB9XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHZhciBmaWVsZHMgPSBjb25maWcuY3JlYXRlQ2hpbGRGaWVsZHMoZmllbGQpO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHtcbiAgICAgIGNvbmZpZzogY29uZmlnLCBmaWVsZDogZmllbGQsIHBsYWluOiB0aGlzLnByb3BzLnBsYWluXG4gICAgfSxcbiAgICAgIFIuZmllbGRzZXQoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKX0sXG4gICAgICAgIGZpZWxkcy5tYXAoZnVuY3Rpb24gKGNoaWxkRmllbGQsIGkpIHtcbiAgICAgICAgICB2YXIga2V5ID0gY2hpbGRGaWVsZC5rZXkgfHwgaTtcbiAgICAgICAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUZpZWxkRWxlbWVudCh7XG4gICAgICAgICAgICBrZXk6IGtleSB8fCBpLFxuICAgICAgICAgICAgZmllbGQ6IGNoaWxkRmllbGQsXG4gICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZUZpZWxkLmJpbmQodGhpcywga2V5KSwgb25BY3Rpb246IHRoaXMub25CdWJibGVBY3Rpb25cbiAgICAgICAgICB9KTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgKVxuICAgICk7XG4gIH1cblxufSk7XG4iLCIvLyAjIGpzb24gY29tcG9uZW50XG5cbi8qXG5UZXh0YXJlYSBlZGl0b3IgZm9yIEpTT04uIFdpbGwgdmFsaWRhdGUgdGhlIEpTT04gYmVmb3JlIHNldHRpbmcgdGhlIHZhbHVlLCBzb1xud2hpbGUgdGhlIHZhbHVlIGlzIGludmFsaWQsIG5vIGV4dGVybmFsIHN0YXRlIGNoYW5nZXMgd2lsbCBvY2N1ci5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0pzb24nLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcm93czogNVxuICAgIH07XG4gIH0sXG5cbiAgaXNWYWxpZFZhbHVlOiBmdW5jdGlvbiAodmFsdWUpIHtcblxuICAgIHRyeSB7XG4gICAgICBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlzVmFsaWQ6IHRydWUsXG4gICAgICB2YWx1ZTogSlNPTi5zdHJpbmdpZnkodGhpcy5wcm9wcy5maWVsZC52YWx1ZSwgbnVsbCwgMilcbiAgICB9O1xuICB9LFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB2YXIgaXNWYWxpZCA9IHRoaXMuaXNWYWxpZFZhbHVlKGV2ZW50LnRhcmdldC52YWx1ZSk7XG5cbiAgICBpZiAoaXNWYWxpZCkge1xuICAgICAgLy8gTmVlZCB0byBoYW5kbGUgdGhpcyBiZXR0ZXIuIE5lZWQgdG8gdHJhY2sgcG9zaXRpb24uXG4gICAgICB0aGlzLl9pc0NoYW5naW5nID0gdHJ1ZTtcbiAgICAgIHRoaXMub25DaGFuZ2VWYWx1ZShKU09OLnBhcnNlKGV2ZW50LnRhcmdldC52YWx1ZSkpO1xuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgaXNWYWxpZDogaXNWYWxpZCxcbiAgICAgIHZhbHVlOiBldmVudC50YXJnZXQudmFsdWVcbiAgICB9KTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV4dFByb3BzKSB7XG4gICAgaWYgKCF0aGlzLl9pc0NoYW5naW5nKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgaXNWYWxpZDogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IEpTT04uc3RyaW5naWZ5KG5leHRQcm9wcy5maWVsZC52YWx1ZSwgbnVsbCwgMilcbiAgICAgIH0pO1xuICAgIH1cbiAgICB0aGlzLl9pc0NoYW5naW5nID0gZmFsc2U7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQnLCB7XG4gICAgICBmaWVsZDogY29uZmlnLmZpZWxkV2l0aFZhbHVlKGZpZWxkLCB0aGlzLnN0YXRlLnZhbHVlKSwgcGxhaW46IHRoaXMucHJvcHMucGxhaW5cbiAgICB9LCBSLnRleHRhcmVhKHtcbiAgICAgICAgY2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpLFxuICAgICAgICB2YWx1ZTogdGhpcy5zdGF0ZS52YWx1ZSxcbiAgICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsXG4gICAgICAgIHN0eWxlOiB7YmFja2dyb3VuZENvbG9yOiB0aGlzLnN0YXRlLmlzVmFsaWQgPyAnJyA6ICdyZ2IoMjU1LDIwMCwyMDApJ30sXG4gICAgICAgIHJvd3M6IGNvbmZpZy5maWVsZFJvd3MoZmllbGQpIHx8IHRoaXMucHJvcHMucm93cyxcbiAgICAgICAgb25Gb2N1czogdGhpcy5vbkZvY3VzQWN0aW9uLFxuICAgICAgICBvbkJsdXI6IHRoaXMub25CbHVyQWN0aW9uXG4gICAgICB9KVxuICAgICk7XG4gIH1cbn0pO1xuIiwiLy8gIyBvYmplY3QgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgYSBmaWVsZCB0byBlZGl0IGFuIG9iamVjdCB3aXRoIGR5bmFtaWMgY2hpbGQgZmllbGRzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIF8gPSByZXF1aXJlKCd1bmRlcnNjb3JlJyk7XG52YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG5cbnZhciBDU1NUcmFuc2l0aW9uR3JvdXAgPSBSZWFjdC5jcmVhdGVGYWN0b3J5KFJlYWN0LmFkZG9ucy5DU1NUcmFuc2l0aW9uR3JvdXApO1xuXG52YXIgdGVtcEtleVByZWZpeCA9ICckJF9fdGVtcF9fJztcblxudmFyIHRlbXBLZXkgPSBmdW5jdGlvbiAoaWQpIHtcbiAgcmV0dXJuIHRlbXBLZXlQcmVmaXggKyBpZDtcbn07XG5cbnZhciBpc1RlbXBLZXkgPSBmdW5jdGlvbiAoa2V5KSB7XG4gIHJldHVybiBrZXkuc3Vic3RyaW5nKDAsIHRlbXBLZXlQcmVmaXgubGVuZ3RoKSA9PT0gdGVtcEtleVByZWZpeDtcbn07XG5cbi8vIFRPRE86IGtlZXAgaW52YWxpZCBrZXlzIGFzIHN0YXRlIGFuZCBkb24ndCBzZW5kIGluIG9uQ2hhbmdlOyBjbG9uZSBjb250ZXh0XG4vLyBhbmQgdXNlIGNsb25lIHRvIGNyZWF0ZSBjaGlsZCBjb250ZXh0c1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ09iamVjdCcsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIG5leHRMb29rdXBJZDogMCxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBrZXlUb0lkID0ge307XG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLnByb3BzLmZpZWxkLnZhbHVlKTtcbiAgICB2YXIga2V5T3JkZXIgPSBbXTtcbiAgICAvLyBUZW1wIGtleXMga2VlcHMgdGhlIGtleSB0byBkaXNwbGF5LCB3aGljaCBzb21ldGltZXMgbWF5IGJlIGRpZmZlcmVudFxuICAgIC8vIHRoYW4gdGhlIGFjdHVhbCBrZXkuIEZvciBleGFtcGxlLCBkdXBsaWNhdGUga2V5cyBhcmUgbm90IGFsbG93ZWQsXG4gICAgLy8gYnV0IHdlIG1heSB0ZW1wb3JhcmlseSBzaG93IGR1cGxpY2F0ZSBrZXlzLlxuICAgIHZhciB0ZW1wRGlzcGxheUtleXMgPSB7fTtcblxuICAgIC8vIEtleXMgZG9uJ3QgbWFrZSBnb29kIHJlYWN0IGtleXMsIHNpbmNlIHdlJ3JlIGFsbG93aW5nIHRoZW0gdG8gYmVcbiAgICAvLyBjaGFuZ2VkIGhlcmUsIHNvIHdlJ2xsIGhhdmUgdG8gY3JlYXRlIGZha2Uga2V5cyBhbmRcbiAgICAvLyBrZWVwIHRyYWNrIG9mIHRoZSBtYXBwaW5nIG9mIHJlYWwga2V5cyB0byBmYWtlIGtleXMuIFl1Y2suXG4gICAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHZhciBpZCA9ICsrdGhpcy5uZXh0TG9va3VwSWQ7XG4gICAgICAvLyBNYXAgdGhlIHJlYWwga2V5IHRvIHRoZSBpZC5cbiAgICAgIGtleVRvSWRba2V5XSA9IGlkO1xuICAgICAgLy8gS2VlcCB0aGUgb3JkZXJpbmcgb2YgdGhlIGtleXMgc28gd2UgZG9uJ3Qgc2h1ZmZsZSB0aGluZ3MgYXJvdW5kIGxhdGVyLlxuICAgICAga2V5T3JkZXIucHVzaChrZXkpO1xuICAgICAgLy8gSWYgdGhpcyBpcyBhIHRlbXBvcmFyeSBrZXkgdGhhdCB3YXMgcGVyc2lzdGVkLCBiZXN0IHdlIGNhbiBkbyBpcyBkaXNwbGF5XG4gICAgICAvLyBhIGJsYW5rLlxuICAgICAgLy8gVE9ETzogUHJvYmFibHkganVzdCBub3Qgc2VuZCB0ZW1wb3Jhcnkga2V5cyBiYWNrIHRocm91Z2guIFRoaXMgYmVoYXZpb3JcbiAgICAgIC8vIGlzIGFjdHVhbGx5IGxlZnRvdmVyIGZyb20gYW4gZWFybGllciBpbmNhcm5hdGlvbiBvZiBmb3JtYXRpYyB3aGVyZVxuICAgICAgLy8gdmFsdWVzIGhhZCB0byBnbyBiYWNrIHRvIHRoZSByb290LlxuICAgICAgaWYgKGlzVGVtcEtleShrZXkpKSB7XG4gICAgICAgIHRlbXBEaXNwbGF5S2V5c1tpZF0gPSAnJztcbiAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGtleVRvSWQ6IGtleVRvSWQsXG4gICAgICBrZXlPcmRlcjoga2V5T3JkZXIsXG4gICAgICAvLyBUZW1wIGtleXMga2VlcHMgdGhlIGtleSB0byBkaXNwbGF5LCB3aGljaCBzb21ldGltZXMgbWF5IGJlIGRpZmZlcmVudFxuICAgICAgLy8gdGhhbiB0aGUgYWN0dWFsIGtleS4gRm9yIGV4YW1wbGUsIGR1cGxpY2F0ZSBrZXlzIGFyZSBub3QgYWxsb3dlZCxcbiAgICAgIC8vIGJ1dCB3ZSBtYXkgdGVtcG9yYXJpbHkgc2hvdyBkdXBsaWNhdGUga2V5cy5cbiAgICAgIHRlbXBEaXNwbGF5S2V5czogdGVtcERpc3BsYXlLZXlzXG4gICAgfTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV3UHJvcHMpIHtcblxuICAgIHZhciBrZXlUb0lkID0gdGhpcy5zdGF0ZS5rZXlUb0lkO1xuICAgIHZhciBuZXdLZXlUb0lkID0ge307XG4gICAgdmFyIHRlbXBEaXNwbGF5S2V5cyA9IHRoaXMuc3RhdGUudGVtcERpc3BsYXlLZXlzO1xuICAgIHZhciBuZXdUZW1wRGlzcGxheUtleXMgPSB7fTtcbiAgICB2YXIga2V5T3JkZXIgPSB0aGlzLnN0YXRlLmtleU9yZGVyO1xuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMobmV3UHJvcHMuZmllbGQudmFsdWUpO1xuICAgIHZhciBhZGRlZEtleXMgPSBbXTtcblxuICAgIC8vIExvb2sgYXQgdGhlIG5ldyBrZXlzLlxuICAgIGtleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAvLyBBZGQgbmV3IGxvb2t1cCBpZiB0aGlzIGtleSB3YXNuJ3QgaGVyZSBsYXN0IHRpbWUuXG4gICAgICBpZiAoIWtleVRvSWRba2V5XSkge1xuICAgICAgICB0aGlzLm5leHRMb29rdXBJZCsrO1xuICAgICAgICBuZXdLZXlUb0lkW2tleV0gPSB0aGlzLm5leHRMb29rdXBJZDtcbiAgICAgICAgYWRkZWRLZXlzLnB1c2goa2V5KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld0tleVRvSWRba2V5XSA9IGtleVRvSWRba2V5XTtcbiAgICAgIH1cbiAgICAgIGlmIChpc1RlbXBLZXkoa2V5KSAmJiBuZXdLZXlUb0lkW2tleV0gaW4gdGVtcERpc3BsYXlLZXlzKSB7XG4gICAgICAgIG5ld1RlbXBEaXNwbGF5S2V5c1tuZXdLZXlUb0lkW2tleV1dID0gdGVtcERpc3BsYXlLZXlzW25ld0tleVRvSWRba2V5XV07XG4gICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIHZhciBuZXdLZXlPcmRlciA9IFtdO1xuXG4gICAgLy8gTG9vayBhdCB0aGUgb2xkIGtleXMuXG4gICAga2V5T3JkZXIuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAvLyBJZiB0aGUga2V5IGlzIGluIHRoZSBuZXcga2V5cywgcHVzaCBpdCBvbnRvIHRoZSBvcmRlciB0byByZXRhaW4gdGhlXG4gICAgICAvLyBzYW1lIG9yZGVyLlxuICAgICAgaWYgKG5ld0tleVRvSWRba2V5XSkge1xuICAgICAgICBuZXdLZXlPcmRlci5wdXNoKGtleSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBQdXQgYWRkZWQgZmllbGRzIGF0IHRoZSBlbmQuIChTbyB0aGluZ3MgZG9uJ3QgZ2V0IHNodWZmbGVkLilcbiAgICBuZXdLZXlPcmRlciA9IG5ld0tleU9yZGVyLmNvbmNhdChhZGRlZEtleXMpO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBrZXlUb0lkOiBuZXdLZXlUb0lkLFxuICAgICAga2V5T3JkZXI6IG5ld0tleU9yZGVyLFxuICAgICAgdGVtcERpc3BsYXlLZXlzOiBuZXdUZW1wRGlzcGxheUtleXNcbiAgICB9KTtcbiAgfSxcblxuICBvbkNoYW5nZTogZnVuY3Rpb24gKGtleSwgbmV3VmFsdWUsIGluZm8pIHtcbiAgICB2YXIgbmV3T2JqID0gXy5leHRlbmQoe30sIHRoaXMucHJvcHMuZmllbGQudmFsdWUpO1xuICAgIG5ld09ialtrZXldID0gbmV3VmFsdWU7XG4gICAgdGhpcy5vbkJ1YmJsZVZhbHVlKG5ld09iaiwgaW5mbyk7XG4gIH0sXG5cbiAgb25BcHBlbmQ6IGZ1bmN0aW9uIChpdGVtQ2hvaWNlSW5kZXgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcbiAgICB0aGlzLm5leHRMb29rdXBJZCsrO1xuXG4gICAgdmFyIGtleVRvSWQgPSB0aGlzLnN0YXRlLmtleVRvSWQ7XG4gICAgdmFyIGtleU9yZGVyID0gdGhpcy5zdGF0ZS5rZXlPcmRlcjtcbiAgICB2YXIgdGVtcERpc3BsYXlLZXlzID0gdGhpcy5zdGF0ZS50ZW1wRGlzcGxheUtleXM7XG5cbiAgICB2YXIgaWQgPSB0aGlzLm5leHRMb29rdXBJZDtcbiAgICB2YXIgbmV3S2V5ID0gdGVtcEtleShpZCk7XG5cbiAgICBrZXlUb0lkW25ld0tleV0gPSBpZDtcbiAgICAvLyBUZW1wb3JhcmlseSwgd2UnbGwgc2hvdyBhIGJsYW5rIGtleS5cbiAgICB0ZW1wRGlzcGxheUtleXNbaWRdID0gJyc7XG4gICAga2V5T3JkZXIucHVzaChuZXdLZXkpO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBrZXlUb0lkOiBrZXlUb0lkLFxuICAgICAgdGVtcERpc3BsYXlLZXlzOiB0ZW1wRGlzcGxheUtleXMsXG4gICAgICBrZXlPcmRlcjoga2V5T3JkZXJcbiAgICB9KTtcblxuICAgIHZhciBuZXdPYmogPSBfLmV4dGVuZCh0aGlzLnByb3BzLmZpZWxkLnZhbHVlKTtcblxuICAgIHZhciBuZXdWYWx1ZSA9IGNvbmZpZy5jcmVhdGVOZXdDaGlsZEZpZWxkVmFsdWUoZmllbGQsIGl0ZW1DaG9pY2VJbmRleCk7XG5cbiAgICBuZXdPYmpbbmV3S2V5XSA9IG5ld1ZhbHVlO1xuXG4gICAgdGhpcy5vbkNoYW5nZVZhbHVlKG5ld09iaik7XG4gIH0sXG5cbiAgb25SZW1vdmU6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICB2YXIgbmV3T2JqID0gXy5leHRlbmQodGhpcy5wcm9wcy5maWVsZC52YWx1ZSk7XG4gICAgZGVsZXRlIG5ld09ialtrZXldO1xuICAgIHRoaXMub25DaGFuZ2VWYWx1ZShuZXdPYmopO1xuICB9LFxuXG4gIG9uTW92ZTogZnVuY3Rpb24gKGZyb21LZXksIHRvS2V5KSB7XG4gICAgaWYgKGZyb21LZXkgIT09IHRvS2V5KSB7XG4gICAgICB2YXIga2V5VG9JZCA9IHRoaXMuc3RhdGUua2V5VG9JZDtcbiAgICAgIHZhciBrZXlPcmRlciA9IHRoaXMuc3RhdGUua2V5T3JkZXI7XG4gICAgICB2YXIgdGVtcERpc3BsYXlLZXlzID0gdGhpcy5zdGF0ZS50ZW1wRGlzcGxheUtleXM7XG5cbiAgICAgIHZhciBuZXdPYmogPSBfLmV4dGVuZCh0aGlzLnByb3BzLmZpZWxkLnZhbHVlKTtcblxuICAgICAgLy8gSWYgd2UgYWxyZWFkeSBoYXZlIHRoZSBrZXkgd2UncmUgbW92aW5nIHRvLCB0aGVuIHdlIGhhdmUgdG8gY2hhbmdlIHRoYXRcbiAgICAgIC8vIGtleSB0byBzb21ldGhpbmcgZWxzZS5cbiAgICAgIGlmIChrZXlUb0lkW3RvS2V5XSkge1xuICAgICAgICAvLyBNYWtlIGEgbmV3XG4gICAgICAgIHZhciB0ZW1wVG9LZXkgPSB0ZW1wS2V5KGtleVRvSWRbdG9LZXldKTtcbiAgICAgICAgdGVtcERpc3BsYXlLZXlzW2tleVRvSWRbdG9LZXldXSA9IHRvS2V5O1xuICAgICAgICBrZXlUb0lkW3RlbXBUb0tleV0gPSBrZXlUb0lkW3RvS2V5XTtcbiAgICAgICAga2V5T3JkZXJba2V5T3JkZXIuaW5kZXhPZih0b0tleSldID0gdGVtcFRvS2V5O1xuICAgICAgICBkZWxldGUga2V5VG9JZFt0b0tleV07XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIGtleVRvSWQ6IGtleVRvSWQsXG4gICAgICAgICAgdGVtcERpc3BsYXlLZXlzOiB0ZW1wRGlzcGxheUtleXMsXG4gICAgICAgICAga2V5T3JkZXI6IGtleU9yZGVyXG4gICAgICAgIH0pO1xuXG4gICAgICAgIG5ld09ialt0ZW1wVG9LZXldID0gbmV3T2JqW3RvS2V5XTtcbiAgICAgICAgZGVsZXRlIG5ld09ialt0b0tleV07XG4gICAgICB9XG5cbiAgICAgIGlmICghdG9LZXkpIHtcbiAgICAgICAgdG9LZXkgPSB0ZW1wS2V5KGtleVRvSWRbZnJvbUtleV0pO1xuICAgICAgICB0ZW1wRGlzcGxheUtleXNba2V5VG9JZFtmcm9tS2V5XV0gPSAnJztcbiAgICAgIH1cbiAgICAgIGtleVRvSWRbdG9LZXldID0ga2V5VG9JZFtmcm9tS2V5XTtcbiAgICAgIGRlbGV0ZSBrZXlUb0lkW2Zyb21LZXldO1xuICAgICAga2V5T3JkZXJba2V5T3JkZXIuaW5kZXhPZihmcm9tS2V5KV0gPSB0b0tleTtcblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGtleVRvSWQ6IGtleVRvSWQsXG4gICAgICAgIGtleU9yZGVyOiBrZXlPcmRlcixcbiAgICAgICAgdGVtcERpc3BsYXlLZXlzOiB0ZW1wRGlzcGxheUtleXNcbiAgICAgIH0pO1xuXG4gICAgICBuZXdPYmpbdG9LZXldID0gbmV3T2JqW2Zyb21LZXldO1xuICAgICAgZGVsZXRlIG5ld09ialtmcm9tS2V5XTtcblxuICAgICAgdGhpcy5vbkNoYW5nZVZhbHVlKG5ld09iaik7XG5cbiAgICAgIC8vIENoZWNrIGlmIG91ciBmcm9tS2V5IGhhcyBvcGVuZWQgdXAgYSBzcG90LlxuICAgICAgaWYgKGZyb21LZXkgJiYgZnJvbUtleSAhPT0gdG9LZXkpIHtcbiAgICAgICAgaWYgKCEoZnJvbUtleSBpbiBuZXdPYmopKSB7XG4gICAgICAgICAgT2JqZWN0LmtleXMobmV3T2JqKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIGlmICghKGlzVGVtcEtleShrZXkpKSkge1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaWQgPSBrZXlUb0lkW2tleV07XG4gICAgICAgICAgICB2YXIgZGlzcGxheUtleSA9IHRlbXBEaXNwbGF5S2V5c1tpZF07XG4gICAgICAgICAgICBpZiAoZnJvbUtleSA9PT0gZGlzcGxheUtleSkge1xuICAgICAgICAgICAgICB0aGlzLm9uTW92ZShrZXksIGRpc3BsYXlLZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgZ2V0RmllbGRzOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICB2YXIgZmllbGRzID0gY29uZmlnLmNyZWF0ZUNoaWxkRmllbGRzKGZpZWxkKTtcblxuICAgIHZhciBrZXlUb0ZpZWxkID0ge307XG5cbiAgICBfLmVhY2goZmllbGRzLCBmdW5jdGlvbiAoY2hpbGRGaWVsZCkge1xuICAgICAga2V5VG9GaWVsZFtjaGlsZEZpZWxkLmtleV0gPSBjaGlsZEZpZWxkO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXMuc3RhdGUua2V5T3JkZXIubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHJldHVybiBrZXlUb0ZpZWxkW2tleV07XG4gICAgfSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgdmFyIGZpZWxkcyA9IHRoaXMuZ2V0RmllbGRzKCk7XG5cbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywge1xuICAgICAgZmllbGQ6IGZpZWxkLCBwbGFpbjogdGhpcy5wcm9wcy5wbGFpblxuICAgIH0sXG4gICAgICBSLmRpdih7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpfSxcbiAgICAgICAgQ1NTVHJhbnNpdGlvbkdyb3VwKHt0cmFuc2l0aW9uTmFtZTogJ3JldmVhbCd9LFxuICAgICAgICAgIGZpZWxkcy5tYXAoZnVuY3Rpb24gKGNoaWxkRmllbGQpIHtcbiAgICAgICAgICAgIHZhciBkaXNwbGF5S2V5ID0gdGhpcy5zdGF0ZS50ZW1wRGlzcGxheUtleXNbdGhpcy5zdGF0ZS5rZXlUb0lkW2NoaWxkRmllbGQua2V5XV07XG4gICAgICAgICAgICBpZiAoXy5pc1VuZGVmaW5lZChkaXNwbGF5S2V5KSkge1xuICAgICAgICAgICAgICBkaXNwbGF5S2V5ID0gY2hpbGRGaWVsZC5rZXk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ29iamVjdC1pdGVtJywge1xuICAgICAgICAgICAgICBrZXk6IHRoaXMuc3RhdGUua2V5VG9JZFtjaGlsZEZpZWxkLmtleV0sXG4gICAgICAgICAgICAgIGZpZWxkOiBjaGlsZEZpZWxkLFxuICAgICAgICAgICAgICBvbk1vdmU6IHRoaXMub25Nb3ZlLFxuICAgICAgICAgICAgICBvblJlbW92ZTogdGhpcy5vblJlbW92ZSxcbiAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsXG4gICAgICAgICAgICAgIG9uQWN0aW9uOiB0aGlzLm9uQnViYmxlQWN0aW9uLFxuICAgICAgICAgICAgICBkaXNwbGF5S2V5OiBkaXNwbGF5S2V5LFxuICAgICAgICAgICAgICBpdGVtS2V5OiBjaGlsZEZpZWxkLmtleVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICApLFxuICAgICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgnb2JqZWN0LWNvbnRyb2wnLCB7ZmllbGQ6IGZpZWxkLCBvbkFwcGVuZDogdGhpcy5vbkFwcGVuZH0pXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG4iLCIndXNlIHN0cmljdCc7XG4vKiBnbG9iYWwgQ29kZU1pcnJvciAqL1xuLyplc2xpbnQgbm8tc2NyaXB0LXVybDowICovXG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFRhZ1RyYW5zbGF0b3IgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3RhZy10cmFuc2xhdG9yJyk7XG52YXIgXyA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUnKTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxuLypcbiAgIEVkaXRvciBmb3IgdGFnZ2VkIHRleHQuIFJlbmRlcnMgdGV4dCBsaWtlIFwiaGVsbG8ge3tmaXJzdE5hbWV9fVwiXG4gICB3aXRoIHJlcGxhY2VtZW50IGxhYmVscyByZW5kZXJlZCBpbiBhIHBpbGwgYm94LiBEZXNpZ25lZCB0byBsb2FkXG4gICBxdWlja2x5IHdoZW4gbWFueSBzZXBhcmF0ZSBpbnN0YW5jZXMgb2YgaXQgYXJlIG9uIHRoZSBzYW1lXG4gICBwYWdlLlxuXG4gICBVc2VzIENvZGVNaXJyb3IgdG8gZWRpdCB0ZXh0LiBUbyBzYXZlIG1lbW9yeSB0aGUgQ29kZU1pcnJvciBub2RlIGlzXG4gICBpbnN0YW50aWF0ZWQgd2hlbiB0aGUgdXNlciBtb3ZlcyB0aGUgbW91c2UgaW50byB0aGUgZWRpdCBhcmVhLlxuICAgSW5pdGlhbGx5IGEgcmVhZC1vbmx5IHZpZXcgdXNpbmcgYSBzaW1wbGUgZGl2IGlzIHNob3duLlxuXG4gICBJTVBMRU1FTlRBVElPTiBOT1RFOlxuXG4gICBUbyBkaXNwbGF5IHRoZSB0YWdzIGluc2lkZSBDb2RlTWlycm9yIHdlIGFyZSB1c2luZyBDTSdzXG4gICBzcGVjaWFsQ2hhclBsYWNlaG9sZGVyIGZlYXR1cmUsIHRvIHJlcGxhY2Ugc3BlY2lhbCBjaGFyYWN0ZXJzIHdpdGhcbiAgIGN1c3RvbSBET00gbm9kZXMuIFRoaXMgZmVhdHVyZSBpcyBkZXNpZ25lZCBmb3Igc2luZ2xlIGNoYXJhY3RlclxuICAgcmVwbGFjZW1lbnRzLCBub3QgdGFncyBsaWtlICdmaXJzdE5hbWUnLiAgU28gd2UgcmVwbGFjZSBlYWNoIHRhZ1xuICAgd2l0aCBhbiB1bnVzZWQgY2hhcmFjdGVyIGZyb20gdGhlIFVuaWNvZGUgcHJpdmF0ZSB1c2UgYXJlYSwgYW5kXG4gICB0ZWxsIENNIHRvIHJlcGxhY2UgdGhhdCB3aXRoIGEgRE9NIG5vZGUgZGlzcGxheSB0aGUgdGFnIGxhYmVsIHdpdGhcbiAgIHRoZSBwaWxsIGJveCBlZmZlY3QuXG5cbiAgIElzIHRoaXMgZXZpbD8gUGVyaGFwcyBhIGxpdHRsZSwgYnV0IGRlbGV0ZSwgdW5kbywgcmVkbywgY3V0LCBjb3B5XG4gICBhbmQgcGFzdGUgb2YgdGhlIHRhZyBwaWxsIGJveGVzIGp1c3Qgd29yayBiZWNhdXNlIENNIHRyZWF0cyB0aGVtIGFzXG4gICBhdG9taWMgc2luZ2xlIGNoYXJhY3RlcnMsIGFuZCBpdCdzIG5vdCBtdWNoIGNvZGUgb24gb3VyIHBhcnQuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogJ1ByZXR0eVRleHQnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jcmVhdGVFZGl0b3IoKTtcbiAgfSxcblxuICBjb21wb25lbnREaWRVcGRhdGU6IGZ1bmN0aW9uKHByZXZQcm9wcywgcHJldlN0YXRlKSB7XG4gICAgaWYgKHByZXZTdGF0ZS5jb2RlTWlycm9yTW9kZSAhPT0gdGhpcy5zdGF0ZS5jb2RlTWlycm9yTW9kZSkge1xuICAgICAgLy8gQ2hhbmdlZCBmcm9tIGNvZGUgbWlycm9yIG1vZGUgdG8gcmVhZCBvbmx5IG1vZGUgb3IgdmljZSB2ZXJzYSxcbiAgICAgIC8vIHNvIHNldHVwIHRoZSBvdGhlciBlZGl0b3IuXG4gICAgICB0aGlzLmNyZWF0ZUVkaXRvcigpO1xuICAgIH1cblxuICAgIC8vIElmIHRoZXkganVzdCB0eXBlZCBpbiBhIHRhZyBsaWtlIHt7Zmlyc3ROYW1lfX0gd2UgaGF2ZSB0byByZXBsYWNlIGl0XG4gICAgaWYgKHRoaXMuc3RhdGUuY29kZU1pcnJvck1vZGUgJiYgdGhpcy5jb2RlTWlycm9yLmdldFZhbHVlKCkubWF0Y2goL1xce1xcey4rXFx9XFx9LykpIHtcbiAgICAgIC8vIGF2b2lkIHJlY3Vyc2l2ZSB1cGRhdGUgY3ljbGVcbiAgICAgIHRoaXMudXBkYXRpbmdDb2RlTWlycm9yID0gdHJ1ZTtcblxuICAgICAgLy8gZ2V0IG5ldyBlbmNvZGVkIHZhbHVlIGZvciBDb2RlTWlycm9yXG4gICAgICB2YXIgY21WYWx1ZSA9IHRoaXMuY29kZU1pcnJvci5nZXRWYWx1ZSgpO1xuICAgICAgdmFyIGRlY29kZWRWYWx1ZSA9IHRoaXMuc3RhdGUudHJhbnNsYXRvci5kZWNvZGVWYWx1ZShjbVZhbHVlKTtcbiAgICAgIHZhciBlbmNvZGVkVmFsdWUgPSB0aGlzLnN0YXRlLnRyYW5zbGF0b3IuZW5jb2RlVmFsdWUoZGVjb2RlZFZhbHVlKTtcblxuICAgICAgLy8gR3JhYiB0aGUgY3Vyc29yIHNvIHdlIGNhbiByZXNldCBpdC5cbiAgICAgIC8vIFRoZSBuZXcgbGVuZ3RoIG9mIHRoZSBDTSB2YWx1ZSB3aWxsIGJlIHNob3J0ZXIgYWZ0ZXIgcmVwbGFjaW5nIGEgdGFnIGxpa2Uge3tmaXJzdE5hbWV9fVxuICAgICAgLy8gd2l0aCBhIHNpbmdsZSBzcGVjaWFsIGNoYXIsIHNvIGFkanVzdCBjdXJzb3IgcG9zaXRpb24gYWNjb3JkaW5nbHkuXG4gICAgICB2YXIgY3Vyc29yID0gdGhpcy5jb2RlTWlycm9yLmdldEN1cnNvcigpO1xuICAgICAgY3Vyc29yLmNoIC09IGNtVmFsdWUubGVuZ3RoIC0gZW5jb2RlZFZhbHVlLmxlbmd0aDtcblxuICAgICAgdGhpcy5jb2RlTWlycm9yLnNldFZhbHVlKGVuY29kZWRWYWx1ZSk7XG4gICAgICB0aGlzLmNvZGVNaXJyb3Iuc2V0Q3Vyc29yKGN1cnNvcik7XG4gICAgfVxuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5jb2RlTWlycm9yTW9kZSkge1xuICAgICAgdGhpcy5yZW1vdmVDb2RlTWlycm9yRWRpdG9yKCk7XG4gICAgfVxuICB9LFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJlcGxhY2VDaG9pY2VzID0gdGhpcy5wcm9wcy5jb25maWcuZmllbGRSZXBsYWNlQ2hvaWNlcyh0aGlzLnByb3BzLmZpZWxkKTtcbiAgICB2YXIgdHJhbnNsYXRvciA9IFRhZ1RyYW5zbGF0b3IocmVwbGFjZUNob2ljZXMsIHRoaXMucHJvcHMuY29uZmlnLmh1bWFuaXplKTtcblxuICAgIHJldHVybiB7XG4gICAgICB2YWx1ZTogdGhpcy5wcm9wcy5maWVsZC52YWx1ZSxcbiAgICAgIGNvZGVNaXJyb3JNb2RlOiBmYWxzZSxcbiAgICAgIGlzQ2hvaWNlc09wZW46IGZhbHNlLFxuICAgICAgcmVwbGFjZUNob2ljZXM6IHJlcGxhY2VDaG9pY2VzLFxuICAgICAgdHJhbnNsYXRvcjogdHJhbnNsYXRvclxuICAgIH07XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24obmV4dFByb3BzKSB7XG4gICAgdmFyIHJlcGxhY2VDaG9pY2VzID0gdGhpcy5wcm9wcy5jb25maWcuZmllbGRSZXBsYWNlQ2hvaWNlcyhuZXh0UHJvcHMuZmllbGQpO1xuICAgIHZhciBuZXh0U3RhdGUgPSB7XG4gICAgICByZXBsYWNlQ2hvaWNlczogcmVwbGFjZUNob2ljZXNcbiAgICB9O1xuXG4gICAgdGhpcy5zdGF0ZS50cmFuc2xhdG9yLmFkZENob2ljZXMocmVwbGFjZUNob2ljZXMpO1xuXG4gICAgaWYgKHRoaXMuc3RhdGUudmFsdWUgIT09IG5leHRQcm9wcy5maWVsZC52YWx1ZSAmJiBuZXh0UHJvcHMuZmllbGQudmFsdWUpIHtcbiAgICAgIG5leHRTdGF0ZS52YWx1ZSA9IG5leHRQcm9wcy5maWVsZC52YWx1ZTtcbiAgICB9XG5cbiAgICB0aGlzLnNldFN0YXRlKG5leHRTdGF0ZSk7XG4gIH0sXG5cbiAgaGFuZGxlQ2hvaWNlU2VsZWN0aW9uOiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7IGlzQ2hvaWNlc09wZW46IGZhbHNlIH0pO1xuXG4gICAgdmFyIGNoYXIgPSB0aGlzLnN0YXRlLnRyYW5zbGF0b3IuZW5jb2RlVGFnKGtleSk7XG5cbiAgICAvLyBwdXQgdGhlIGN1cnNvciBhdCB0aGUgZW5kIG9mIHRoZSBpbnNlcnRlZCB0YWcuXG4gICAgdGhpcy5jb2RlTWlycm9yLnJlcGxhY2VTZWxlY3Rpb24oY2hhciwgJ2VuZCcpO1xuICAgIHRoaXMuY29kZU1pcnJvci5mb2N1cygpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcbiAgICB2YXIgcHJvcHMgPSB7IGZpZWxkOiBmaWVsZCwgcGxhaW46IHRoaXMucHJvcHMucGxhaW4gfTtcbiAgICB2YXIgdGFiSW5kZXggPSBmaWVsZC50YWJJbmRleDtcblxuICAgIHZhciB0ZXh0Qm94Q2xhc3NlcyA9IGN4KF8uZXh0ZW5kKHt9LCB0aGlzLnByb3BzLmNsYXNzZXMsIHsncHJldHR5LXRleHQtYm94JzogdHJ1ZX0pKTtcbiAgICB2YXIgdGV4dEJveCA9IHRoaXMuY3JlYXRlVGV4dEJveE5vZGUoKTtcblxuICAgIHZhciBjaG9pY2VzID0gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2Nob2ljZXMnLCB7XG4gICAgICByZWY6ICdjaG9pY2VzJyxcbiAgICAgIGNob2ljZXM6IHRoaXMuc3RhdGUucmVwbGFjZUNob2ljZXMsXG4gICAgICBvcGVuOiB0aGlzLnN0YXRlLmlzQ2hvaWNlc09wZW4sXG4gICAgICBpZ25vcmVDbG9zZU5vZGVzOiB0aGlzLmdldENsb3NlSWdub3JlTm9kZXMsXG4gICAgICBvblNlbGVjdDogdGhpcy5oYW5kbGVDaG9pY2VTZWxlY3Rpb24sXG4gICAgICBvbkNsb3NlOiB0aGlzLm9uQ2xvc2VDaG9pY2VzXG4gICAgfSk7XG5cbiAgICAvLyBSZW5kZXIgcmVhZC1vbmx5IHZlcnNpb24uIFdlIGFyZSB1c2luZyBwdXJlIEhUTUwgdmlhIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MLCB0byBhdm9pZFxuICAgIC8vIHRoZSBjb3N0IG9mIHRoZSByZWFjdCBub2Rlcy4gVGhpcyBpcyBwcm9iYWJseSBhIHByZW1hdHVyZSBvcHRpbWl6YXRpb24uXG4gICAgdmFyIGVsZW1lbnQgPSAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInByZXR0eS1jb250ZW50XCIgb25Nb3VzZUVudGVyPXt0aGlzLnN3aXRjaFRvQ29kZU1pcnJvcn0+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXt0ZXh0Qm94Q2xhc3Nlc30gdGFiSW5kZXg9e3RhYkluZGV4fT5cbiAgICAgICAgICB7dGV4dEJveH1cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPGEgcmVmPVwidG9nZ2xlXCIgaHJlZj1cIkphdmFzY3JpcHQ6XCIgb25DbGljaz17dGhpcy5vblRvZ2dsZUNob2ljZXN9Pkluc2VydC4uLjwvYT5cbiAgICAgICAge2Nob2ljZXN9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHByb3BzLCBlbGVtZW50KTtcbiAgfSxcblxuICBnZXRDbG9zZUlnbm9yZU5vZGVzOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVmcy50b2dnbGUuZ2V0RE9NTm9kZSgpO1xuICB9LFxuXG4gIG9uVG9nZ2xlQ2hvaWNlczogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc2V0Q2hvaWNlc09wZW4oIXRoaXMuc3RhdGUuaXNDaG9pY2VzT3Blbik7XG4gIH0sXG5cbiAgc2V0Q2hvaWNlc09wZW46IGZ1bmN0aW9uIChpc09wZW4pIHtcbiAgICB2YXIgYWN0aW9uID0gaXNPcGVuID8gJ29wZW4tcmVwbGFjZW1lbnRzJyA6ICdjbG9zZS1yZXBsYWNlbWVudHMnO1xuICAgIHRoaXMub25TdGFydEFjdGlvbihhY3Rpb24pO1xuICAgIHRoaXMuc2V0U3RhdGUoeyBpc0Nob2ljZXNPcGVuOiBpc09wZW4gfSk7XG4gIH0sXG5cbiAgb25DbG9zZUNob2ljZXM6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5pc0Nob2ljZXNPcGVuKSB7XG4gICAgICB0aGlzLnNldENob2ljZXNPcGVuKGZhbHNlKTtcbiAgICB9XG4gIH0sXG5cbiAgY3JlYXRlVGV4dEJveE5vZGU6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5jb2RlTWlycm9yTW9kZSkge1xuICAgICAgcmV0dXJuIDxkaXYgcmVmPVwidGV4dEJveFwiIC8+O1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgaHRtbCA9IHRoaXMuc3RhdGUudHJhbnNsYXRvci50b0h0bWwodGhpcy5zdGF0ZS52YWx1ZSk7XG4gICAgICByZXR1cm4gPGRpdiByZWY9XCJ0ZXh0Qm94XCIgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3tfX2h0bWw6IGh0bWx9fSAvPjtcbiAgICB9XG4gIH0sXG5cbiAgY3JlYXRlRWRpdG9yOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUuY29kZU1pcnJvck1vZGUpIHtcbiAgICAgIHRoaXMuY3JlYXRlQ29kZU1pcnJvckVkaXRvcigpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNyZWF0ZVJlYWRvbmx5RWRpdG9yKCk7XG4gICAgfVxuICB9LFxuXG4gIGNyZWF0ZUNvZGVNaXJyb3JFZGl0b3I6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY21WYWx1ZSA9IHRoaXMuc3RhdGUudHJhbnNsYXRvci5lbmNvZGVWYWx1ZSh0aGlzLnN0YXRlLnZhbHVlKTtcblxuICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgdGFiaW5kZXg6IHRoaXMucHJvcHMudGFiSW5kZXgsXG4gICAgICB2YWx1ZTogY21WYWx1ZSxcbiAgICAgIHNwZWNpYWxDaGFyczogdGhpcy5zdGF0ZS50cmFuc2xhdG9yLnNwZWNpYWxDaGFyc1JlZ2V4cCxcbiAgICAgIHNwZWNpYWxDaGFyUGxhY2Vob2xkZXI6IHRoaXMuY3JlYXRlVGFnTm9kZSxcbiAgICAgIGV4dHJhS2V5czoge1xuICAgICAgICBUYWI6IGZhbHNlXG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciB0ZXh0Qm94ID0gdGhpcy5yZWZzLnRleHRCb3guZ2V0RE9NTm9kZSgpO1xuICAgIHRleHRCb3guaW5uZXJIVE1MID0gJyc7IC8vIHJlbGVhc2UgYW55IHByZXZpb3VzIHJlYWQtb25seSBjb250ZW50IHNvIGl0IGNhbiBiZSBHQydlZFxuXG4gICAgdGhpcy5jb2RlTWlycm9yID0gQ29kZU1pcnJvcih0ZXh0Qm94LCBvcHRpb25zKTtcbiAgICB0aGlzLmNvZGVNaXJyb3Iub24oJ2NoYW5nZScsIHRoaXMub25Db2RlTWlycm9yQ2hhbmdlKTtcbiAgfSxcblxuICBvbkNvZGVNaXJyb3JDaGFuZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy51cGRhdGluZ0NvZGVNaXJyb3IpIHtcbiAgICAgIC8vIGF2b2lkIHJlY3Vyc2l2ZSB1cGRhdGUgY3ljbGUsIGFuZCBtYXJrIHRoZSBjb2RlIG1pcnJvciBtYW51YWwgdXBkYXRlIGFzIGRvbmVcbiAgICAgIHRoaXMudXBkYXRpbmdDb2RlTWlycm9yID0gZmFsc2U7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIG5ld1ZhbHVlID0gdGhpcy5zdGF0ZS50cmFuc2xhdG9yLmRlY29kZVZhbHVlKHRoaXMuY29kZU1pcnJvci5nZXRWYWx1ZSgpKTtcbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUobmV3VmFsdWUpO1xuICAgIHRoaXMuc2V0U3RhdGUoe3ZhbHVlOiBuZXdWYWx1ZX0pO1xuICB9LFxuXG4gIGNyZWF0ZVJlYWRvbmx5RWRpdG9yOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRleHRCb3hOb2RlID0gdGhpcy5yZWZzLnRleHRCb3guZ2V0RE9NTm9kZSgpO1xuICAgIHRleHRCb3hOb2RlLmlubmVySFRNTCA9IHRoaXMuc3RhdGUudHJhbnNsYXRvci50b0h0bWwodGhpcy5zdGF0ZS52YWx1ZSk7XG4gIH0sXG5cbiAgcmVtb3ZlQ29kZU1pcnJvckVkaXRvcjogZnVuY3Rpb24gKCkge1xuICAgIHZhciB0ZXh0Qm94Tm9kZSA9IHRoaXMucmVmcy50ZXh0Qm94LmdldERPTU5vZGUoKTtcbiAgICB2YXIgY21Ob2RlID0gdGV4dEJveE5vZGUuZmlyc3RDaGlsZDtcbiAgICB0ZXh0Qm94Tm9kZS5yZW1vdmVDaGlsZChjbU5vZGUpO1xuICAgIHRoaXMuY29kZU1pcnJvciA9IG51bGw7XG4gIH0sXG5cbiAgc3dpdGNoVG9Db2RlTWlycm9yOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLnN0YXRlLmNvZGVNaXJyb3JNb2RlKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtjb2RlTWlycm9yTW9kZTogdHJ1ZX0pO1xuICAgIH1cbiAgfSxcblxuICAvLyBDcmVhdGUgcGlsbCBib3ggc3R5bGUgZm9yIGRpc3BsYXkgaW5zaWRlIENNLiBGb3IgZXhhbXBsZVxuICAvLyAnXFx1ZTAwMCcgYmVjb21lcyAnPHNwYW4gY2xhc3M9XCJ0YWc+Rmlyc3QgTmFtZTwvc3Bhbj4nXG4gIGNyZWF0ZVRhZ05vZGU6IGZ1bmN0aW9uIChjaGFyKSB7XG4gICAgdmFyIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgdmFyIGxhYmVsID0gdGhpcy5zdGF0ZS50cmFuc2xhdG9yLmRlY29kZUNoYXIoY2hhcik7XG5cbiAgICBSZWFjdC5yZW5kZXIoXG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJwcmV0dHktcGFydFwiIG9uQ2xpY2s9e3RoaXMub25Ub2dnbGVDaG9pY2VzfT57bGFiZWx9PC9zcGFuPixcbiAgICAgIG5vZGVcbiAgICApO1xuICAgIHJldHVybiBub2RlO1xuICB9XG59KTtcbiIsIi8vICMgc2VsZWN0IGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIHNlbGVjdCBlbGVtZW50IHRvIGdpdmUgYSB1c2VyIGNob2ljZXMgZm9yIHRoZSB2YWx1ZSBvZiBhIGZpZWxkLiBOb3RlXG5pdCBzaG91bGQgc3VwcG9ydCB2YWx1ZXMgb3RoZXIgdGhhbiBzdHJpbmdzLiBDdXJyZW50bHkgdGhpcyBpcyBvbmx5IHRlc3RlZCBmb3JcbmJvb2xlYW4gdmFsdWVzLCBidXQgaXQgX3Nob3VsZF8gd29yayBmb3Igb3RoZXIgdmFsdWVzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdTZWxlY3QnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY2hvaWNlczogdGhpcy5wcm9wcy5jb25maWcuZmllbGRDaG9pY2VzKHRoaXMucHJvcHMuZmllbGQpXG4gICAgfTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV3UHJvcHMpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGNob2ljZXM6IG5ld1Byb3BzLmNvbmZpZy5maWVsZENob2ljZXMobmV3UHJvcHMuZmllbGQpXG4gICAgfSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHtcbiAgICAgIGNvbmZpZzogY29uZmlnLCBmaWVsZDogZmllbGQsIHBsYWluOiB0aGlzLnByb3BzLnBsYWluXG4gICAgfSwgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ3NlbGVjdC12YWx1ZScsIHtcbiAgICAgIGNob2ljZXM6IHRoaXMuc3RhdGUuY2hvaWNlcywgZmllbGQ6IGZpZWxkLCBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZVZhbHVlLCBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvblxuICAgIH0pKTtcbiAgfVxufSk7XG4iLCIvLyAjIHNpbmdsZS1saW5lLXN0cmluZyBjb21wb25lbnRcblxuLypcblJlbmRlciBhIHNpbmdsZSBsaW5lIHRleHQgaW5wdXQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnU2luZ2xlTGluZVN0cmluZycsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywge1xuICAgICAgY29uZmlnOiBjb25maWcsIGZpZWxkOiBmaWVsZCwgcGxhaW46IHRoaXMucHJvcHMucGxhaW5cbiAgICB9LCBSLmlucHV0KHtcbiAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgIHZhbHVlOiB0aGlzLnByb3BzLmZpZWxkLnZhbHVlLFxuICAgICAgY2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpLFxuICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsXG4gICAgICBvbkZvY3VzOiB0aGlzLm9uRm9jdXNBY3Rpb24sXG4gICAgICBvbkJsdXI6IHRoaXMub25CbHVyQWN0aW9uXG4gICAgfSkpO1xuICB9XG59KTtcbiIsIi8vICMgc3RyaW5nIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIGEgZmllbGQgdGhhdCBjYW4gZWRpdCBhIHN0cmluZyB2YWx1ZS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdTdHJpbmcnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICBvbkNoYW5nZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdGhpcy5vbkNoYW5nZVZhbHVlKGV2ZW50LnRhcmdldC52YWx1ZSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHtcbiAgICAgIGNvbmZpZzogY29uZmlnLCBmaWVsZDogZmllbGQsIHBsYWluOiB0aGlzLnByb3BzLnBsYWluXG4gICAgfSwgUi50ZXh0YXJlYSh7XG4gICAgICB2YWx1ZTogZmllbGQudmFsdWUsXG4gICAgICBjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcyksXG4gICAgICByb3dzOiBmaWVsZC5yb3dzIHx8IHRoaXMucHJvcHMucm93cyxcbiAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgb25Gb2N1czogdGhpcy5vbkZvY3VzQWN0aW9uLFxuICAgICAgb25CbHVyOiB0aGlzLm9uQmx1ckFjdGlvblxuICAgIH0pKTtcbiAgfVxufSk7XG4iLCIvLyAjIHVua25vd24gY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgYSBmaWVsZCB3aXRoIGFuIHVua25vd24gdHlwZS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdVbmtub3duJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUi5kaXYoe30sXG4gICAgICBSLmRpdih7fSwgJ0NvbXBvbmVudCBub3QgZm91bmQgZm9yOiAnKSxcbiAgICAgIFIucHJlKHt9LCBKU09OLnN0cmluZ2lmeSh0aGlzLnByb3BzLmZpZWxkLnJhd0ZpZWxkVGVtcGxhdGUsIG51bGwsIDIpKVxuICAgICk7XG4gIH1cblxufSk7XG4iLCIvLyAjIGFkZC1pdGVtIGNvbXBvbmVudFxuXG4vKlxuVGhlIGFkZCBidXR0b24gdG8gYXBwZW5kIGFuIGl0ZW0gdG8gYSBmaWVsZC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdBZGRJdGVtJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBsYWJlbDogJ1thZGRdJ1xuICAgIH07XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUi5zcGFuKHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcyksIG9uQ2xpY2s6IHRoaXMucHJvcHMub25DbGlja30sIHRoaXMucHJvcHMubGFiZWwpO1xuICB9XG59KTtcbiIsIi8vICMgYXJyYXktY29udHJvbCBjb21wb25lbnRcblxuLypcblJlbmRlciB0aGUgaXRlbSB0eXBlIGNob2ljZXMgYW5kIHRoZSBhZGQgYnV0dG9uIGZvciBhbiBhcnJheS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdBcnJheUNvbnRyb2wnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZpZWxkVGVtcGxhdGVJbmRleDogMFxuICAgIH07XG4gIH0sXG5cbiAgb25TZWxlY3Q6IGZ1bmN0aW9uIChpbmRleCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZmllbGRUZW1wbGF0ZUluZGV4OiBpbmRleFxuICAgIH0pO1xuICB9LFxuXG4gIG9uQXBwZW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5wcm9wcy5vbkFwcGVuZCh0aGlzLnN0YXRlLmZpZWxkVGVtcGxhdGVJbmRleCk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblxuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG4gICAgdmFyIGZpZWxkVGVtcGxhdGVzID0gY29uZmlnLmZpZWxkSXRlbUZpZWxkVGVtcGxhdGVzKGZpZWxkKTtcblxuICAgIHZhciB0eXBlQ2hvaWNlcyA9IG51bGw7XG5cbiAgICBpZiAoZmllbGRUZW1wbGF0ZXMubGVuZ3RoID4gMCkge1xuICAgICAgdHlwZUNob2ljZXMgPSBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQtdGVtcGxhdGUtY2hvaWNlcycsIHtcbiAgICAgICAgZmllbGQ6IGZpZWxkLCBmaWVsZFRlbXBsYXRlSW5kZXg6IHRoaXMuc3RhdGUuZmllbGRUZW1wbGF0ZUluZGV4LCBvblNlbGVjdDogdGhpcy5vblNlbGVjdFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3Nlcyl9LFxuICAgICAgdHlwZUNob2ljZXMsICcgJyxcbiAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdhZGQtaXRlbScsIHtmaWVsZDogZmllbGQsIG9uQ2xpY2s6IHRoaXMub25BcHBlbmR9KVxuICAgICk7XG4gIH1cbn0pO1xuIiwiLy8gIyBhcnJheS1pdGVtLWNvbnRyb2wgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgdGhlIHJlbW92ZSBhbmQgbW92ZSBidXR0b25zIGZvciBhbiBhcnJheSBmaWVsZC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0FycmF5SXRlbUNvbnRyb2wnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgb25Nb3ZlQmFjazogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucHJvcHMub25Nb3ZlKHRoaXMucHJvcHMuaW5kZXgsIHRoaXMucHJvcHMuaW5kZXggLSAxKTtcbiAgfSxcblxuICBvbk1vdmVGb3J3YXJkOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5wcm9wcy5vbk1vdmUodGhpcy5wcm9wcy5pbmRleCwgdGhpcy5wcm9wcy5pbmRleCArIDEpO1xuICB9LFxuXG4gIG9uUmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5wcm9wcy5vblJlbW92ZSh0aGlzLnByb3BzLmluZGV4KTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3Nlcyl9LFxuICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ3JlbW92ZS1pdGVtJywge2ZpZWxkOiBmaWVsZCwgb25DbGljazogdGhpcy5vblJlbW92ZSwgb25NYXliZVJlbW92ZTogdGhpcy5wcm9wcy5vbk1heWJlUmVtb3ZlfSksXG4gICAgICB0aGlzLnByb3BzLmluZGV4ID4gMCA/IGNvbmZpZy5jcmVhdGVFbGVtZW50KCdtb3ZlLWl0ZW0tYmFjaycsIHtmaWVsZDogZmllbGQsIG9uQ2xpY2s6IHRoaXMub25Nb3ZlQmFja30pIDogbnVsbCxcbiAgICAgIHRoaXMucHJvcHMuaW5kZXggPCAodGhpcy5wcm9wcy5udW1JdGVtcyAtIDEpID8gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ21vdmUtaXRlbS1mb3J3YXJkJywge2ZpZWxkOiBmaWVsZCwgb25DbGljazogdGhpcy5vbk1vdmVGb3J3YXJkfSkgOiBudWxsXG4gICAgKTtcbiAgfVxufSk7XG4iLCIvLyAjIGFycmF5LWl0ZW0tdmFsdWUgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgdGhlIHZhbHVlIG9mIGFuIGFycmF5IGl0ZW0uXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdBcnJheUl0ZW1WYWx1ZScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBvbkNoYW5nZUZpZWxkOiBmdW5jdGlvbiAobmV3VmFsdWUsIGluZm8pIHtcbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHRoaXMucHJvcHMuaW5kZXgsIG5ld1ZhbHVlLCBpbmZvKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3Nlcyl9LFxuICAgICAgY29uZmlnLmNyZWF0ZUZpZWxkRWxlbWVudCh7ZmllbGQ6IGZpZWxkLCBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZUZpZWxkLCBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvbn0pXG4gICAgKTtcbiAgfVxufSk7XG4iLCIvLyAjIGFycmF5LWl0ZW0gY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgYW4gYXJyYXkgaXRlbS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xudmFyIF8gPSByZXF1aXJlKCd1bmRlcnNjb3JlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnQXJyYXlJdGVtJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpc01heWJlUmVtb3Zpbmc6IGZhbHNlXG4gICAgfTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgb25NYXliZVJlbW92ZTogZnVuY3Rpb24gKGlzTWF5YmVSZW1vdmluZykge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgaXNNYXliZVJlbW92aW5nOiBpc01heWJlUmVtb3ZpbmdcbiAgICB9KTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICB2YXIgY2xhc3NlcyA9IF8uZXh0ZW5kKHt9LCB0aGlzLnByb3BzLmNsYXNzZXMpO1xuXG4gICAgaWYgKHRoaXMuc3RhdGUuaXNNYXliZVJlbW92aW5nKSB7XG4gICAgICBjbGFzc2VzWydtYXliZS1yZW1vdmluZyddID0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogY3goY2xhc3Nlcyl9LFxuICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2FycmF5LWl0ZW0tdmFsdWUnLCB7ZmllbGQ6IGZpZWxkLCBpbmRleDogdGhpcy5wcm9wcy5pbmRleCxcbiAgICAgICAgb25DaGFuZ2U6IHRoaXMucHJvcHMub25DaGFuZ2UsIG9uQWN0aW9uOiB0aGlzLm9uQnViYmxlQWN0aW9ufSksXG4gICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgnYXJyYXktaXRlbS1jb250cm9sJywge2ZpZWxkOiBmaWVsZCwgaW5kZXg6IHRoaXMucHJvcHMuaW5kZXgsIG51bUl0ZW1zOiB0aGlzLnByb3BzLm51bUl0ZW1zLFxuICAgICAgICBvbk1vdmU6IHRoaXMucHJvcHMub25Nb3ZlLCBvblJlbW92ZTogdGhpcy5wcm9wcy5vblJlbW92ZSwgb25NYXliZVJlbW92ZTogdGhpcy5vbk1heWJlUmVtb3ZlfSlcbiAgICApO1xuICB9XG59KTtcbiIsIi8vICMgY2hvaWNlcyBjb21wb25lbnRcblxuLypcblJlbmRlciBjdXN0b21pemVkIChub24tbmF0aXZlKSBkcm9wZG93biBjaG9pY2VzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIF8gPSByZXF1aXJlKCd1bmRlcnNjb3JlJyk7XG5cbnZhciBDU1NUcmFuc2l0aW9uR3JvdXAgPSBSZWFjdC5jcmVhdGVGYWN0b3J5KFJlYWN0LmFkZG9ucy5DU1NUcmFuc2l0aW9uR3JvdXApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0Nob2ljZXMnLFxuXG4gIG1peGluczogW1xuICAgIHJlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKSxcbiAgICAvL3BsdWdpbi5yZXF1aXJlKCdtaXhpbi5yZXNpemUnKSxcbiAgICAvL3BsdWdpbi5yZXF1aXJlKCdtaXhpbi5zY3JvbGwnKSxcbiAgICByZXF1aXJlKCcuLi8uLi9taXhpbnMvY2xpY2stb3V0c2lkZScpXG4gIF0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1heEhlaWdodDogbnVsbCxcbiAgICAgIG9wZW46IHRoaXMucHJvcHMub3BlblxuICAgIH07XG4gIH0sXG5cbiAgZ2V0SWdub3JlQ2xvc2VOb2RlczogZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5wcm9wcy5pZ25vcmVDbG9zZU5vZGVzKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIHZhciBub2RlcyA9IHRoaXMucHJvcHMuaWdub3JlQ2xvc2VOb2RlcygpO1xuICAgIGlmICghXy5pc0FycmF5KG5vZGVzKSkge1xuICAgICAgbm9kZXMgPSBbbm9kZXNdO1xuICAgIH1cbiAgICByZXR1cm4gbm9kZXM7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNldE9uQ2xpY2tPdXRzaWRlKCdjaG9pY2VzJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cbiAgICAgIC8vIE1ha2Ugc3VyZSB3ZSBkb24ndCBmaW5kIGFueSBub2RlcyB0byBpZ25vcmUuXG4gICAgICBpZiAoIV8uZmluZCh0aGlzLmdldElnbm9yZUNsb3NlTm9kZXMoKSwgZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNOb2RlSW5zaWRlKGV2ZW50LnRhcmdldCwgbm9kZSk7XG4gICAgICB9LmJpbmQodGhpcykpKSB7XG4gICAgICAgIHRoaXMucHJvcHMub25DbG9zZSgpO1xuICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLmFkanVzdFNpemUoKTtcbiAgfSxcblxuICBvblNlbGVjdDogZnVuY3Rpb24gKGNob2ljZSkge1xuICAgIHRoaXMucHJvcHMub25TZWxlY3QoY2hvaWNlLnZhbHVlKTtcbiAgfSxcblxuICBvblJlc2l6ZVdpbmRvdzogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuYWRqdXN0U2l6ZSgpO1xuICB9LFxuXG4gIG9uU2Nyb2xsV2luZG93OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5hZGp1c3RTaXplKCk7XG4gIH0sXG5cbiAgYWRqdXN0U2l6ZTogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnJlZnMuY2hvaWNlcykge1xuICAgICAgdmFyIG5vZGUgPSB0aGlzLnJlZnMuY2hvaWNlcy5nZXRET01Ob2RlKCk7XG4gICAgICB2YXIgcmVjdCA9IG5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICB2YXIgdG9wID0gcmVjdC50b3A7XG4gICAgICB2YXIgd2luZG93SGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgICAgdmFyIGhlaWdodCA9IHdpbmRvd0hlaWdodCAtIHRvcDtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBtYXhIZWlnaHQ6IGhlaWdodFxuICAgICAgfSk7XG4gICAgfVxuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXh0UHJvcHMpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtvcGVuOiBuZXh0UHJvcHMub3Blbn0sIGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuYWRqdXN0U2l6ZSgpO1xuICAgIH0uYmluZCh0aGlzKSk7XG4gIH0sXG5cbiAgb25TY3JvbGw6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBjb25zb2xlLmxvZygnc3RvcCB0aGF0IScpXG4gICAgLy8gZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAvLyBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgfSxcblxuICBvbldoZWVsOiBmdW5jdGlvbiAoKSB7XG4gICAgLy8gZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAvLyBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNob2ljZXMgPSB0aGlzLnByb3BzLmNob2ljZXM7XG5cbiAgICBpZiAoY2hvaWNlcyAmJiBjaG9pY2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY2hvaWNlcyA9IFt7dmFsdWU6ICcvLy9lbXB0eS8vLyd9XTtcbiAgICB9XG5cbiAgICByZXR1cm4gUi5kaXYoe3JlZjogJ2NvbnRhaW5lcicsIG9uV2hlZWw6IHRoaXMub25XaGVlbCwgb25TY3JvbGw6IHRoaXMub25TY3JvbGwsIGNsYXNzTmFtZTogJ2Nob2ljZXMtY29udGFpbmVyJywgc3R5bGU6IHtcbiAgICAgIHVzZXJTZWxlY3Q6ICdub25lJywgV2Via2l0VXNlclNlbGVjdDogJ25vbmUnLCBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgIG1heEhlaWdodDogdGhpcy5zdGF0ZS5tYXhIZWlnaHQgPyB0aGlzLnN0YXRlLm1heEhlaWdodCA6IG51bGxcbiAgICB9fSxcbiAgICAgIENTU1RyYW5zaXRpb25Hcm91cCh7dHJhbnNpdGlvbk5hbWU6ICdyZXZlYWwnfSxcbiAgICAgICAgdGhpcy5wcm9wcy5vcGVuID8gUi51bCh7cmVmOiAnY2hvaWNlcycsIGNsYXNzTmFtZTogJ2Nob2ljZXMnfSxcbiAgICAgICAgICBjaG9pY2VzLm1hcChmdW5jdGlvbiAoY2hvaWNlLCBpKSB7XG5cbiAgICAgICAgICAgIHZhciBjaG9pY2VFbGVtZW50ID0gbnVsbDtcblxuICAgICAgICAgICAgaWYgKGNob2ljZS52YWx1ZSA9PT0gJy8vL2xvYWRpbmcvLy8nKSB7XG4gICAgICAgICAgICAgIGNob2ljZUVsZW1lbnQgPSBSLmEoe2hyZWY6ICdKYXZhU2NyaXB0JyArICc6Jywgb25DbGljazogdGhpcy5wcm9wcy5vbkNsb3NlfSxcbiAgICAgICAgICAgICAgICBSLnNwYW4oe2NsYXNzTmFtZTogJ2Nob2ljZS1sYWJlbCd9LFxuICAgICAgICAgICAgICAgICAgJ0xvYWRpbmcuLi4nXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjaG9pY2UudmFsdWUgPT09ICcvLy9lbXB0eS8vLycpIHtcbiAgICAgICAgICAgICAgY2hvaWNlRWxlbWVudCA9IFIuYSh7aHJlZjogJ0phdmFTY3JpcHQnICsgJzonLCBvbkNsaWNrOiB0aGlzLnByb3BzLm9uQ2xvc2V9LFxuICAgICAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAnY2hvaWNlLWxhYmVsJ30sXG4gICAgICAgICAgICAgICAgICAnTm8gY2hvaWNlcyBhdmFpbGFibGUuJ1xuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNob2ljZUVsZW1lbnQgPSBSLmEoe2hyZWY6ICdKYXZhU2NyaXB0JyArICc6Jywgb25DbGljazogdGhpcy5vblNlbGVjdC5iaW5kKHRoaXMsIGNob2ljZSl9LFxuICAgICAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAnY2hvaWNlLWxhYmVsJ30sXG4gICAgICAgICAgICAgICAgICBjaG9pY2UubGFiZWxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAnY2hvaWNlLXNhbXBsZSd9LFxuICAgICAgICAgICAgICAgICAgY2hvaWNlLnNhbXBsZVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIFIubGkoe2tleTogaSwgY2xhc3NOYW1lOiAnY2hvaWNlJ30sXG4gICAgICAgICAgICAgIGNob2ljZUVsZW1lbnRcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICApIDogbnVsbFxuICAgICAgKVxuICAgICk7XG4gIH1cbn0pO1xuIiwiLy8gIyBmaWVsZC10ZW1wbGF0ZS1jaG9pY2VzIGNvbXBvbmVudFxuXG4vKlxuR2l2ZSBhIGxpc3Qgb2YgY2hvaWNlcyBvZiBpdGVtIHR5cGVzIHRvIGNyZWF0ZSBhcyBjaGlsZHJlbiBvZiBhbiBmaWVsZC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdGaWVsZFRlbXBsYXRlQ2hvaWNlcycsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBvbkNoYW5nZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdGhpcy5wcm9wcy5vblNlbGVjdChwYXJzZUludChldmVudC50YXJnZXQudmFsdWUpKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICB2YXIgZmllbGRUZW1wbGF0ZXMgPSBjb25maWcuZmllbGRJdGVtRmllbGRUZW1wbGF0ZXMoZmllbGQpO1xuXG4gICAgdmFyIHR5cGVDaG9pY2VzID0gbnVsbDtcbiAgICBpZiAoZmllbGRUZW1wbGF0ZXMubGVuZ3RoID4gMSkge1xuICAgICAgdHlwZUNob2ljZXMgPSBSLnNlbGVjdCh7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpLCB2YWx1ZTogdGhpcy5maWVsZFRlbXBsYXRlSW5kZXgsIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlfSxcbiAgICAgIGZpZWxkVGVtcGxhdGVzLm1hcChmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSwgaSkge1xuICAgICAgICByZXR1cm4gUi5vcHRpb24oe2tleTogaSwgdmFsdWU6IGl9LCBmaWVsZFRlbXBsYXRlLmxhYmVsIHx8IGkpO1xuICAgICAgfSkpO1xuICAgIH1cblxuICAgIHJldHVybiB0eXBlQ2hvaWNlcyA/IHR5cGVDaG9pY2VzIDogUi5zcGFuKG51bGwpO1xuICB9XG59KTtcbiIsIi8vICMgZmllbGQgY29tcG9uZW50XG5cbi8qXG5Vc2VkIGJ5IGFueSBmaWVsZHMgdG8gcHV0IHRoZSBsYWJlbCBhbmQgaGVscCB0ZXh0IGFyb3VuZCB0aGUgZmllbGQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgXyA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUnKTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxudmFyIENTU1RyYW5zaXRpb25Hcm91cCA9IFJlYWN0LmNyZWF0ZUZhY3RvcnkoUmVhY3QuYWRkb25zLkNTU1RyYW5zaXRpb25Hcm91cCk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnRmllbGQnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbGxhcHNlZDogdGhpcy5wcm9wcy5jb25maWcuZmllbGRJc0NvbGxhcHNlZCh0aGlzLnByb3BzLmZpZWxkKSA/IHRydWUgOiBmYWxzZVxuICAgIH07XG4gIH0sXG5cbiAgb25DbGlja0xhYmVsOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjb2xsYXBzZWQ6ICF0aGlzLnN0YXRlLmNvbGxhcHNlZFxuICAgIH0pO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG5cbiAgICBpZiAodGhpcy5wcm9wcy5wbGFpbikge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMuY2hpbGRyZW47XG4gICAgfVxuXG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHZhciBpbmRleCA9IHRoaXMucHJvcHMuaW5kZXg7XG4gICAgaWYgKCFfLmlzTnVtYmVyKGluZGV4KSkge1xuICAgICAgdmFyIGtleSA9IHRoaXMucHJvcHMuZmllbGQua2V5O1xuICAgICAgaW5kZXggPSBfLmlzTnVtYmVyKGtleSkgPyBrZXkgOiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgdmFyIGNsYXNzZXMgPSBfLmV4dGVuZCh7fSwgdGhpcy5wcm9wcy5jbGFzc2VzKTtcblxuICAgIHZhciBlcnJvcnMgPSBjb25maWcuZmllbGRFcnJvcnMoZmllbGQpO1xuXG4gICAgZXJyb3JzLmZvckVhY2goZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICBjbGFzc2VzWyd2YWxpZGF0aW9uLWVycm9yLScgKyBlcnJvci50eXBlXSA9IHRydWU7XG4gICAgfSk7XG5cbiAgICBpZiAoY29uZmlnLmZpZWxkSXNSZXF1aXJlZChmaWVsZCkpIHtcbiAgICAgIGNsYXNzZXMucmVxdWlyZWQgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBjbGFzc2VzLm9wdGlvbmFsID0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogY3goY2xhc3NlcyksIHN0eWxlOiB7ZGlzcGxheTogKGZpZWxkLmhpZGRlbiA/ICdub25lJyA6ICcnKX19LFxuICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJywge1xuICAgICAgICBjb25maWc6IGNvbmZpZywgZmllbGQ6IGZpZWxkLFxuICAgICAgICBpbmRleDogaW5kZXgsIG9uQ2xpY2s6IGNvbmZpZy5maWVsZElzQ29sbGFwc2libGUoZmllbGQpID8gdGhpcy5vbkNsaWNrTGFiZWwgOiBudWxsXG4gICAgICB9KSxcbiAgICAgIENTU1RyYW5zaXRpb25Hcm91cCh7dHJhbnNpdGlvbk5hbWU6ICdyZXZlYWwnfSxcbiAgICAgICAgdGhpcy5zdGF0ZS5jb2xsYXBzZWQgPyBbXSA6IFtcbiAgICAgICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgnaGVscCcsIHtcbiAgICAgICAgICAgIGNvbmZpZzogY29uZmlnLCBmaWVsZDogZmllbGQsXG4gICAgICAgICAgICBrZXk6ICdoZWxwJ1xuICAgICAgICAgIH0pLFxuICAgICAgICAgIHRoaXMucHJvcHMuY2hpbGRyZW5cbiAgICAgICAgXVxuICAgICAgKVxuICAgICk7XG4gIH1cbn0pO1xuIiwiLy8gIyBoZWxwIGNvbXBvbmVudFxuXG4vKlxuSnVzdCB0aGUgaGVscCB0ZXh0IGJsb2NrLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0hlbHAnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBoZWxwVGV4dCA9IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkSGVscFRleHQodGhpcy5wcm9wcy5maWVsZCk7XG5cbiAgICByZXR1cm4gaGVscFRleHQgP1xuICAgICAgUi5kaXYoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSwgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw6IHtfX2h0bWw6IGhlbHBUZXh0fX0pIDpcbiAgICAgIFIuc3BhbihudWxsKTtcbiAgfVxufSk7XG4iLCIvLyAjIGxhYmVsIGNvbXBvbmVudFxuXG4vKlxuSnVzdCB0aGUgbGFiZWwgZm9yIGEgZmllbGQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnTGFiZWwnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHZhciBmaWVsZExhYmVsID0gY29uZmlnLmZpZWxkTGFiZWwoZmllbGQpO1xuXG4gICAgdmFyIGxhYmVsID0gbnVsbDtcbiAgICBpZiAodHlwZW9mIHRoaXMucHJvcHMuaW5kZXggPT09ICdudW1iZXInKSB7XG4gICAgICBsYWJlbCA9ICcnICsgKHRoaXMucHJvcHMuaW5kZXggKyAxKSArICcuJztcbiAgICAgIGlmIChmaWVsZExhYmVsKSB7XG4gICAgICAgIGxhYmVsID0gbGFiZWwgKyAnICcgKyBmaWVsZExhYmVsO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChmaWVsZExhYmVsIHx8IGxhYmVsKSB7XG4gICAgICB2YXIgdGV4dCA9IGxhYmVsIHx8IGZpZWxkTGFiZWw7XG4gICAgICBpZiAodGhpcy5wcm9wcy5vbkNsaWNrKSB7XG4gICAgICAgIHRleHQgPSBSLmEoe2hyZWY6ICdKYXZhU2NyaXB0JyArICc6Jywgb25DbGljazogdGhpcy5wcm9wcy5vbkNsaWNrfSwgdGV4dCk7XG4gICAgICB9XG4gICAgICBsYWJlbCA9IFIubGFiZWwoe30sIHRleHQpO1xuICAgIH1cblxuICAgIHZhciByZXF1aXJlZE9yTm90O1xuXG4gICAgaWYgKCFjb25maWcuZmllbGRIYXNWYWx1ZUNoaWxkcmVuKGZpZWxkKSkge1xuICAgICAgcmVxdWlyZWRPck5vdCA9IFIuc3Bhbih7XG4gICAgICAgIGNsYXNzTmFtZTogY29uZmlnLmZpZWxkSXNSZXF1aXJlZChmaWVsZCkgPyAncmVxdWlyZWQtdGV4dCcgOiAnbm90LXJlcXVpcmVkLXRleHQnXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gUi5kaXYoe1xuICAgICAgY2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpXG4gICAgfSxcbiAgICAgIGxhYmVsLFxuICAgICAgJyAnLFxuICAgICAgcmVxdWlyZWRPck5vdFxuICAgICk7XG4gIH1cbn0pO1xuIiwiLy8gIyBtb3ZlLWl0ZW0tYmFjayBjb21wb25lbnRcblxuLypcbkJ1dHRvbiB0byBtb3ZlIGFuIGl0ZW0gYmFja3dhcmRzIGluIGxpc3QuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnTW92ZUl0ZW1CYWNrJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBsYWJlbDogJ1t1cF0nXG4gICAgfTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSLnNwYW4oe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSwgb25DbGljazogdGhpcy5wcm9wcy5vbkNsaWNrfSwgdGhpcy5wcm9wcy5sYWJlbCk7XG4gIH1cbn0pO1xuIiwiLy8gIyBtb3ZlLWl0ZW0tZm9yd2FyZCBjb21wb25lbnRcblxuLypcbkJ1dHRvbiB0byBtb3ZlIGFuIGl0ZW0gZm9yd2FyZCBpbiBhIGxpc3QuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnTW92ZUl0ZW1Gb3J3YXJkJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBsYWJlbDogJ1tkb3duXSdcbiAgICB9O1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFIuc3Bhbih7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpLCBvbkNsaWNrOiB0aGlzLnByb3BzLm9uQ2xpY2t9LCB0aGlzLnByb3BzLmxhYmVsKTtcbiAgfVxufSk7XG4iLCIvLyAjIG9iamVjdC1jb250cm9sIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIHRoZSBpdGVtIHR5cGUgY2hvaWNlcyBhbmQgdGhlIGFkZCBidXR0b24uXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnT2JqZWN0Q29udHJvbCcsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZmllbGRUZW1wbGF0ZUluZGV4OiAwXG4gICAgfTtcbiAgfSxcblxuICBvblNlbGVjdDogZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBmaWVsZFRlbXBsYXRlSW5kZXg6IGluZGV4XG4gICAgfSk7XG4gIH0sXG5cbiAgb25BcHBlbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnByb3BzLm9uQXBwZW5kKHRoaXMuc3RhdGUuZmllbGRUZW1wbGF0ZUluZGV4KTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuICAgIHZhciBmaWVsZFRlbXBsYXRlcyA9IGNvbmZpZy5maWVsZENoaWxkRmllbGRUZW1wbGF0ZXMoZmllbGQpO1xuXG4gICAgdmFyIHR5cGVDaG9pY2VzID0gbnVsbDtcblxuICAgIGlmIChmaWVsZFRlbXBsYXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICB0eXBlQ2hvaWNlcyA9IGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZC10ZW1wbGF0ZS1jaG9pY2VzJywge1xuICAgICAgICBmaWVsZDogZmllbGQsXG4gICAgICAgIGZpZWxkVGVtcGxhdGVJbmRleDogdGhpcy5zdGF0ZS5maWVsZFRlbXBsYXRlSW5kZXgsIG9uU2VsZWN0OiB0aGlzLm9uU2VsZWN0XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKX0sXG4gICAgICB0eXBlQ2hvaWNlcywgJyAnLFxuICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2FkZC1pdGVtJywge29uQ2xpY2s6IHRoaXMub25BcHBlbmR9KVxuICAgICk7XG4gIH1cbn0pO1xuIiwiLy8gIyBvYmplY3QtaXRlbS1jb250cm9sIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIHRoZSByZW1vdmUgYnV0dG9ucyBmb3IgYW4gb2JqZWN0IGl0ZW0uXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdPYmplY3RJdGVtQ29udHJvbCcsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBvblJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucHJvcHMub25SZW1vdmUodGhpcy5wcm9wcy5pdGVtS2V5KTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3Nlcyl9LFxuICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ3JlbW92ZS1pdGVtJywge2ZpZWxkOiBmaWVsZCwgb25DbGljazogdGhpcy5vblJlbW92ZX0pXG4gICAgKTtcbiAgfVxufSk7XG4iLCIvLyAjIG9iamVjdC1pdGVtLWtleSBjb21wb25lbnRcblxuLypcblJlbmRlciBhbiBvYmplY3QgaXRlbSBrZXkgZWRpdG9yLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnT2JqZWN0SXRlbUtleScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBvbkNoYW5nZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZShldmVudC50YXJnZXQudmFsdWUpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFIuaW5wdXQoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSwgdHlwZTogJ3RleHQnLCB2YWx1ZTogdGhpcy5wcm9wcy5kaXNwbGF5S2V5LCBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZX0pO1xuICB9XG59KTtcbiIsIi8vICMgb2JqZWN0LWl0ZW0tdmFsdWUgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgdGhlIHZhbHVlIG9mIGFuIG9iamVjdCBpdGVtLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnT2JqZWN0SXRlbVZhbHVlJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIG9uQ2hhbmdlRmllbGQ6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgaW5mbykge1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UodGhpcy5wcm9wcy5pdGVtS2V5LCBuZXdWYWx1ZSwgaW5mbyk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpfSxcbiAgICAgIGNvbmZpZy5jcmVhdGVGaWVsZEVsZW1lbnQoe2ZpZWxkOiBmaWVsZCwgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2VGaWVsZCwgcGxhaW46IHRydWV9KVxuICAgICk7XG4gIH1cbn0pO1xuIiwiLy8gIyBvYmplY3QtaXRlbSBjb21wb25lbnRcblxuLypcblJlbmRlciBhbiBvYmplY3QgaXRlbS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ09iamVjdEl0ZW0nLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgb25DaGFuZ2VLZXk6IGZ1bmN0aW9uIChuZXdLZXkpIHtcbiAgICB0aGlzLnByb3BzLm9uTW92ZSh0aGlzLnByb3BzLml0ZW1LZXksIG5ld0tleSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpfSxcbiAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdvYmplY3QtaXRlbS1rZXknLCB7ZmllbGQ6IGZpZWxkLCBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZUtleSwgZGlzcGxheUtleTogdGhpcy5wcm9wcy5kaXNwbGF5S2V5LCBpdGVtS2V5OiB0aGlzLnByb3BzLml0ZW1LZXl9KSxcbiAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdvYmplY3QtaXRlbS12YWx1ZScsIHtmaWVsZDogZmllbGQsIG9uQ2hhbmdlOiB0aGlzLnByb3BzLm9uQ2hhbmdlLCBpdGVtS2V5OiB0aGlzLnByb3BzLml0ZW1LZXl9KSxcbiAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdvYmplY3QtaXRlbS1jb250cm9sJywge2ZpZWxkOiBmaWVsZCwgb25SZW1vdmU6IHRoaXMucHJvcHMub25SZW1vdmUsIGl0ZW1LZXk6IHRoaXMucHJvcHMuaXRlbUtleX0pXG4gICAgKTtcbiAgfVxufSk7XG4iLCIvLyAjIHJlbW92ZS1pdGVtIGNvbXBvbmVudFxuXG4vKlxuUmVtb3ZlIGFuIGl0ZW0uXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnUmVtb3ZlSXRlbScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGFiZWw6ICdbcmVtb3ZlXSdcbiAgICB9O1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICBvbk1vdXNlT3ZlclJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnByb3BzLm9uTWF5YmVSZW1vdmUpIHtcbiAgICAgIHRoaXMucHJvcHMub25NYXliZVJlbW92ZSh0cnVlKTtcbiAgICB9XG4gIH0sXG5cbiAgb25Nb3VzZU91dFJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnByb3BzLm9uTWF5YmVSZW1vdmUpIHtcbiAgICAgIHRoaXMucHJvcHMub25NYXliZVJlbW92ZShmYWxzZSk7XG4gICAgfVxuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUi5zcGFuKHtcbiAgICAgIGNsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSwgb25DbGljazogdGhpcy5wcm9wcy5vbkNsaWNrLFxuICAgICAgb25Nb3VzZU92ZXI6IHRoaXMub25Nb3VzZU92ZXJSZW1vdmUsIG9uTW91c2VPdXQ6IHRoaXMub25Nb3VzZU91dFJlbW92ZVxuICAgIH0sIHRoaXMucHJvcHMubGFiZWwpO1xuICB9XG59KTtcbiIsIi8vICMgaGVscCBjb21wb25lbnRcblxuLypcbkp1c3QgdGhlIGhlbHAgdGV4dCBibG9jay5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdTYW1wbGUnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjaG9pY2UgPSB0aGlzLnByb3BzLmNob2ljZTtcblxuICAgIHJldHVybiBjaG9pY2Uuc2FtcGxlID9cbiAgICAgIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NOYW1lKX0sXG4gICAgICAgIGNob2ljZS5zYW1wbGVcbiAgICAgICkgOlxuICAgICAgUi5zcGFuKG51bGwpO1xuICB9XG59KTtcbiIsIi8vICMgc2VsZWN0LXZhbHVlIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIGEgc2VsZWN0IGRyb3Bkb3duIGZvciBhIGxpc3Qgb2YgY2hvaWNlcy4gQ2hvaWNlcyB2YWx1ZXMgY2FuIGJlIG9mIGFueVxudHlwZS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBfID0gcmVxdWlyZSgndW5kZXJzY29yZScpO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ1NlbGVjdFZhbHVlJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB2YXIgY2hvaWNlVmFsdWUgPSBldmVudC50YXJnZXQudmFsdWU7XG4gICAgdmFyIGNob2ljZVR5cGUgPSBjaG9pY2VWYWx1ZS5zdWJzdHJpbmcoMCwgY2hvaWNlVmFsdWUuaW5kZXhPZignOicpKTtcbiAgICBpZiAoY2hvaWNlVHlwZSA9PT0gJ2Nob2ljZScpIHtcbiAgICAgIHZhciBjaG9pY2VJbmRleCA9IGNob2ljZVZhbHVlLnN1YnN0cmluZyhjaG9pY2VWYWx1ZS5pbmRleE9mKCc6JykgKyAxKTtcbiAgICAgIGNob2ljZUluZGV4ID0gcGFyc2VJbnQoY2hvaWNlSW5kZXgpO1xuICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZSh0aGlzLnByb3BzLmNob2ljZXNbY2hvaWNlSW5kZXhdLnZhbHVlKTtcbiAgICB9XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjaG9pY2VzID0gdGhpcy5wcm9wcy5jaG9pY2VzIHx8IFtdO1xuXG4gICAgdmFyIGNob2ljZXNPckxvYWRpbmc7XG5cbiAgICBpZiAoY2hvaWNlcy5sZW5ndGggPT09IDEgJiYgY2hvaWNlc1swXS52YWx1ZSA9PT0gJy8vL2xvYWRpbmcvLy8nKSB7XG4gICAgICBjaG9pY2VzT3JMb2FkaW5nID0gUi5kaXYoe30sXG4gICAgICAgICdMb2FkaW5nIGNob2ljZXMuLi4nXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG5cbiAgICAgIHZhciB2YWx1ZSA9IHRoaXMucHJvcHMuZmllbGQudmFsdWUgIT09IHVuZGVmaW5lZCA/IHRoaXMucHJvcHMuZmllbGQudmFsdWUgOiAnJztcblxuICAgICAgY2hvaWNlcyA9IGNob2ljZXMubWFwKGZ1bmN0aW9uIChjaG9pY2UsIGkpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBjaG9pY2VWYWx1ZTogJ2Nob2ljZTonICsgaSxcbiAgICAgICAgICB2YWx1ZTogY2hvaWNlLnZhbHVlLFxuICAgICAgICAgIGxhYmVsOiBjaG9pY2UubGFiZWxcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgdmFsdWVDaG9pY2UgPSBfLmZpbmQoY2hvaWNlcywgZnVuY3Rpb24gKGNob2ljZSkge1xuICAgICAgICByZXR1cm4gY2hvaWNlLnZhbHVlID09PSB2YWx1ZTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAodmFsdWVDaG9pY2UgPT09IHVuZGVmaW5lZCkge1xuXG4gICAgICAgIHZhciBsYWJlbCA9IHZhbHVlO1xuICAgICAgICBpZiAoIV8uaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgICAgICAgbGFiZWwgPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFsdWVDaG9pY2UgPSB7XG4gICAgICAgICAgY2hvaWNlVmFsdWU6ICd2YWx1ZTonLFxuICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICBsYWJlbDogbGFiZWxcbiAgICAgICAgfTtcbiAgICAgICAgY2hvaWNlcyA9IFt2YWx1ZUNob2ljZV0uY29uY2F0KGNob2ljZXMpO1xuICAgICAgfVxuXG4gICAgICBjaG9pY2VzT3JMb2FkaW5nID0gUi5zZWxlY3Qoe1xuICAgICAgICBjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcyksXG4gICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgICB2YWx1ZTogdmFsdWVDaG9pY2UuY2hvaWNlVmFsdWUsXG4gICAgICAgIG9uRm9jdXM6IHRoaXMub25Gb2N1c0FjdGlvbixcbiAgICAgICAgb25CbHVyOiB0aGlzLm9uQmx1ckFjdGlvblxuICAgICAgfSxcbiAgICAgIGNob2ljZXMubWFwKGZ1bmN0aW9uIChjaG9pY2UsIGkpIHtcbiAgICAgICAgcmV0dXJuIFIub3B0aW9uKHtcbiAgICAgICAgICBrZXk6IGksXG4gICAgICAgICAgdmFsdWU6IGNob2ljZS5jaG9pY2VWYWx1ZVxuICAgICAgICB9LCBjaG9pY2UubGFiZWwpO1xuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgcmV0dXJuIGNob2ljZXNPckxvYWRpbmc7XG59XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSByZXF1aXJlKCd1bmRlcnNjb3JlJyk7XG5cbi8vIENvbnN0YW50IGZvciBmaXJzdCB1bnVzZWQgc3BlY2lhbCB1c2UgY2hhcmFjdGVyLlxuLy8gU2VlIElNUExFTUVOVEFUSU9OIE5PVEUgaW4gcHJldHR5LXRleHQyLmpzLlxudmFyIEZJUlNUX1NQRUNJQUxfQ0hBUiA9IDB4ZTAwMDtcblxuLy8gcmVnZXhwIHVzZWQgdG8gZ3JlcCBvdXQgdGFncyBsaWtlIHt7Zmlyc3ROYW1lfX1cbnZhciBUQUdTX1JFR0VYUCA9IC9cXHtcXHsoLis/KVxcfVxcfS9nO1xuXG4vLyBaYXBpZXIgc3BlY2lmaWMgc3R1ZmYuIE1ha2UgYSBwbHVnaW4gZm9yIHRoaXMgbGF0ZXIuXG5mdW5jdGlvbiByZW1vdmVJZFByZWZpeChrZXkpIHtcbiAgcmV0dXJuIFN0cmluZyhrZXkpLnJlcGxhY2UoL15bMC05XStfXy8sICcnKTtcbn1cblxuZnVuY3Rpb24gYnVpbGRDaG9pY2VzTWFwKHJlcGxhY2VDaG9pY2VzKSB7XG4gIHZhciBjaG9pY2VzID0ge307XG4gIHJlcGxhY2VDaG9pY2VzLmZvckVhY2goZnVuY3Rpb24gKGNob2ljZSkge1xuICAgIHZhciBrZXkgPSByZW1vdmVJZFByZWZpeChjaG9pY2UudmFsdWUpO1xuICAgIGNob2ljZXNba2V5XSA9IGNob2ljZS5sYWJlbDtcbiAgfSk7XG4gIHJldHVybiBjaG9pY2VzO1xufVxuXG4vKlxuICAgQ3JlYXRlcyBoZWxwZXIgdG8gdHJhbnNsYXRlIGJldHdlZW4gdGFncyBsaWtlIHt7Zmlyc3ROYW1lfX0gYW5kXG4gICBhbiBlbmNvZGVkIHJlcHJlc2VudGF0aW9uIHN1aXRhYmxlIGZvciB1c2UgaW4gQ29kZU1pcnJvci5cblxuICAgU2VlIElNUExFTUVOVEFUSU9OIE5PVEUgaW4gcHJldHR5LXRleHQyLmpzLlxuICovXG5mdW5jdGlvbiBUYWdUcmFuc2xhdG9yKHJlcGxhY2VDaG9pY2VzLCBodW1hbml6ZSkge1xuICB2YXIgbmV4dENoYXJDb2RlID0gRklSU1RfU1BFQ0lBTF9DSEFSO1xuXG4gIC8vIE1hcCBvZiB0YWcgdG8gbGFiZWwgJ2ZpcnN0TmFtZScgLS0+ICdGaXJzdCBOYW1lJ1xuICB2YXIgY2hvaWNlcyA9IHt9O1xuXG4gIC8vIFRvIGhlbHAgdHJhbnNsYXRlIHRvIGFuZCBmcm9tIHRoZSBDTSByZXByZXNlbnRhdGlvbiB3aXRoIHRoZSBzcGVjaWFsXG4gIC8vIGNoYXJhY3RlcnMsIGJ1aWxkIHR3byBtYXBzOlxuICAvLyAgIC0gY2hhclRvVGFnTWFwOiBzcGVjaWFsIGNoYXIgdG8gdGFnIC0gaS5lLiB7ICdcXHVlMDAwJzogJ2ZpcnN0TmFtZScgfVxuICAvLyAgIC0gdGFnVG9DaGFyTWFwOiB0YWcgdG8gc3BlY2lhbCBjaGFyLCBpLmUuIHsgZmlyc3ROYW1lOiAnXFx1ZTAwMCcgfVxuICB2YXIgY2hhclRvVGFnTWFwID0ge307XG4gIHZhciB0YWdUb0NoYXJNYXAgPSB7fTtcblxuICBmdW5jdGlvbiBhZGRDaG9pY2VzKGNob2ljZXNBcnJheSkge1xuICAgIGNob2ljZXMgPSBidWlsZENob2ljZXNNYXAoY2hvaWNlc0FycmF5KTtcblxuICAgIE9iamVjdC5rZXlzKGNob2ljZXMpLnNvcnQoKS5mb3JFYWNoKGZ1bmN0aW9uICh0YWcpIHtcbiAgICAgIGlmICh0YWdUb0NoYXJNYXBbdGFnXSkge1xuICAgICAgICByZXR1cm47IC8vIHdlIGFscmVhZHkgaGF2ZSB0aGlzIHRhZyBtYXBwZWRcbiAgICAgIH1cblxuICAgICAgdmFyIGNoYXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKG5leHRDaGFyQ29kZSsrKTtcbiAgICAgIGNoYXJUb1RhZ01hcFtjaGFyXSA9IHRhZztcbiAgICAgIHRhZ1RvQ2hhck1hcFt0YWddID0gY2hhcjtcbiAgICB9KTtcbiAgfVxuXG4gIGFkZENob2ljZXMocmVwbGFjZUNob2ljZXMpO1xuXG4gIHJldHVybiB7XG4gICAgc3BlY2lhbENoYXJzUmVnZXhwOiAvW1xcdWUwMDAtXFx1ZWZmZl0vZyxcblxuICAgIGFkZENob2ljZXM6IGFkZENob2ljZXMsXG5cbiAgICAvKlxuICAgICAgIENvbnZlcnQgdGFnIHRvIGVuY29kZWQgY2hhcmFjdGVyLiBGb3IgZXhhbXBsZVxuICAgICAgICdmaXJzdE5hbWUnIGJlY29tZXMgJ1xcdWUwMDAnLlxuICAgICAqL1xuICAgIGVuY29kZVRhZzogZnVuY3Rpb24gKHRhZykge1xuICAgICAgdGFnID0gcmVtb3ZlSWRQcmVmaXgodGFnKTtcbiAgICAgIGlmICghdGFnVG9DaGFyTWFwW3RhZ10pIHtcbiAgICAgICAgdmFyIGNoYXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKG5leHRDaGFyQ29kZSsrKTtcbiAgICAgICAgdGFnVG9DaGFyTWFwW3RhZ10gPSBjaGFyO1xuICAgICAgICBjaGFyVG9UYWdNYXBbY2hhcl0gPSB0YWc7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGFnVG9DaGFyTWFwW3RhZ107XG4gICAgfSxcblxuICAgIC8qXG4gICAgICAgQ29udmVydCB0ZXh0IHZhbHVlIHRvIGVuY29kZWQgdmFsdWUgZm9yIENvZGVNaXJyb3IuIEZvciBleGFtcGxlXG4gICAgICAgJ2hlbGxvIHt7Zmlyc3ROYW1lfX0nIGJlY29tZXMgJ2hlbGxvIFxcdWUwMDAnXG4gICAgICovXG4gICAgZW5jb2RlVmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgcmV0dXJuIFN0cmluZyh2YWx1ZSkucmVwbGFjZShUQUdTX1JFR0VYUCwgZnVuY3Rpb24gKG0sIHRhZykge1xuICAgICAgICB0YWcgPSByZW1vdmVJZFByZWZpeCh0YWcpO1xuICAgICAgICByZXR1cm4gdGhpcy5lbmNvZGVUYWcodGFnKTtcbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSxcblxuICAgIC8qXG4gICAgICAgQ29udmVydCBlbmNvZGVkIHRleHQgdXNlZCBpbiBDTSB0byB0YWdnZWQgdGV4dC4gRm9yIGV4YW1wbGVcbiAgICAgICAnaGVsbG8gXFx1ZTAwMCcgYmVjb21lcyAnaGVsbG8ge3tmaXJzdE5hbWV9fSdcbiAgICAgKi9cbiAgICBkZWNvZGVWYWx1ZTogZnVuY3Rpb24gKGVuY29kZWRWYWx1ZSkge1xuICAgICAgcmV0dXJuIFN0cmluZyhlbmNvZGVkVmFsdWUpLnJlcGxhY2UodGhpcy5zcGVjaWFsQ2hhcnNSZWdleHAsIGZ1bmN0aW9uIChjKSB7XG4gICAgICAgIHZhciB0YWcgPSBjaGFyVG9UYWdNYXBbY107XG4gICAgICAgIHJldHVybiAne3snICsgdGFnICsgJ319JztcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKlxuICAgICAgIENvbnZlcnQgZW5jb2RlZCBjaGFyYWN0ZXIgdG8gbGFiZWwuIEZvciBleGFtcGxlXG4gICAgICAgJ1xcdWUwMDAnIGJlY29tZXMgJ0xhc3QgTmFtZScuXG4gICAgICovXG4gICAgZGVjb2RlQ2hhcjogZnVuY3Rpb24gKGNoYXIpIHtcbiAgICAgIHZhciB0YWcgPSBjaGFyVG9UYWdNYXBbY2hhcl07XG4gICAgICByZXR1cm4gdGhpcy5nZXRMYWJlbCh0YWcpO1xuICAgIH0sXG5cbiAgICAvKlxuICAgICAgIENvbnZlcnQgdGFnZ2VkIHZhbHVlIHRvIEhUTUwuIEZvciBleGFtcGxlXG4gICAgICAgJ2hlbGxvIHt7Zmlyc3ROYW1lfX0nIGJlY29tZXMgJ2hlbGxvIDxzcGFuIGNsYXNzPVwidGFnXCI+Rmlyc3QgTmFtZTwvc3Bhbj4nXG4gICAgICovXG4gICAgdG9IdG1sOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHJldHVybiBTdHJpbmcodmFsdWUpLnJlcGxhY2UoVEFHU19SRUdFWFAsIGZ1bmN0aW9uIChtLCBtdXN0YWNoZSkge1xuICAgICAgICB2YXIgdGFnID0gbXVzdGFjaGUucmVwbGFjZSgne3snLCAnJykucmVwbGFjZSgnfX0nLCAnJyk7XG4gICAgICAgIHRhZyA9IHJlbW92ZUlkUHJlZml4KHRhZyk7XG4gICAgICAgIHZhciBsYWJlbCA9IHRoaXMuZ2V0TGFiZWwodGFnKTtcbiAgICAgICAgcmV0dXJuICc8c3BhbiBjbGFzcz1cInByZXR0eS1wYXJ0XCI+JyArIGxhYmVsICsgJzwvc3Bhbj4nO1xuICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLypcbiAgICAgICBHZXQgbGFiZWwgZm9yIHRhZy4gIEZvciBleGFtcGxlICdmaXJzdE5hbWUnIGJlY29tZXMgJ0ZpcnN0IE5hbWUnLlxuICAgICAgIFJldHVybnMgYSBodW1hbml6ZWQgdmVyc2lvbiBvZiB0aGUgdGFnIGlmIHdlIGRvbid0IGhhdmUgYSBsYWJlbCBmb3IgdGhlIHRhZy5cbiAgICAgKi9cbiAgICBnZXRMYWJlbDogZnVuY3Rpb24gKHRhZykge1xuICAgICAgdGFnID0gcmVtb3ZlSWRQcmVmaXgodGFnKTtcbiAgICAgIHZhciBsYWJlbCA9IGNob2ljZXNbdGFnXTtcbiAgICAgIGlmICghbGFiZWwpIHtcbiAgICAgICAgLy8gSWYgdGFnIG5vdCBmb3VuZCBhbmQgd2UgaGF2ZSBhIGh1bWFuaXplIGZ1bmN0aW9uLCBodW1hbml6ZSB0aGUgdGFnLlxuICAgICAgICAvLyBPdGhlcndpc2UganVzdCByZXR1cm4gdGhlIHRhZy5cbiAgICAgICAgbGFiZWwgPSBodW1hbml6ZSAmJiBodW1hbml6ZSh0YWcpIHx8IHRhZztcbiAgICAgIH1cbiAgICAgIHJldHVybiBsYWJlbDtcbiAgICB9XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVGFnVHJhbnNsYXRvcjtcbiIsIi8vICMgZGVmYXVsdC1jb25maWdcblxuLypcblRoaXMgaXMgdGhlIGRlZmF1bHQgY29uZmlndXJhdGlvbiBmb3IgZm9ybWF0aWMuIEl0J3MganVzdCBhbiBvYmplY3Qgd2l0aCBhIGJ1bmNoXG5vZiBiZWhhdmlvciBmdW5jdGlvbnMgdGhhdCBhcmUgcGFzc2VkIGludG8gYWxsIHRoZSBjb21wb25lbnRzLiBTbyB0byBjaGFuZ2VcbmZvcm1hdGljJ3MgYmVoYXZpb3IsIGl0J3Mgc2ltcGxlIG1hdHRlciBvZiBjbG9uaW5nIHRoaXMgb2JqZWN0IGFuZCBvdmVycmlkaW5nXG50aGUgbWV0aG9kcy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBfID0gcmVxdWlyZSgndW5kZXJzY29yZScpO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIC8vIEZpZWxkIGVsZW1lbnQgZmFjdG9yaWVzLiBDcmVhdGUgZmllbGQgZWxlbWVudHMuXG5cbiAgY3JlYXRlRWxlbWVudF9GaWVsZHM6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9maWVsZHMnKSksXG5cbiAgY3JlYXRlRWxlbWVudF9TdHJpbmc6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9zdHJpbmcnKSksXG5cbiAgY3JlYXRlRWxlbWVudF9TaW5nbGVMaW5lU3RyaW5nOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvc2luZ2xlLWxpbmUtc3RyaW5nJykpLFxuXG4gIGNyZWF0ZUVsZW1lbnRfU2VsZWN0OiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvc2VsZWN0JykpLFxuXG4gIGNyZWF0ZUVsZW1lbnRfQm9vbGVhbjogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL2Jvb2xlYW4nKSksXG5cbiAgY3JlYXRlRWxlbWVudF9DaGVja2JveEJvb2xlYW46IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9jaGVja2JveC1ib29sZWFuJykpLFxuXG4gIC8vIGNyZWF0ZUVsZW1lbnRfUHJldHR5VGV4dDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL3ByZXR0eS10ZXh0JykpLFxuXG4gIGNyZWF0ZUVsZW1lbnRfUHJldHR5VGV4dDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL3ByZXR0eS10ZXh0MicpKSxcblxuICBjcmVhdGVFbGVtZW50X0FycmF5OiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvYXJyYXknKSksXG5cbiAgY3JlYXRlRWxlbWVudF9DaGVja2JveEFycmF5OiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvY2hlY2tib3gtYXJyYXknKSksXG5cbiAgY3JlYXRlRWxlbWVudF9PYmplY3Q6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9vYmplY3QnKSksXG5cbiAgY3JlYXRlRWxlbWVudF9Kc29uOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvanNvbicpKSxcblxuICBjcmVhdGVFbGVtZW50X1Vua25vd25GaWVsZDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL3Vua25vd24nKSksXG5cbiAgY3JlYXRlRWxlbWVudF9Db3B5OiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvY29weScpKSxcblxuXG4gIC8vIE90aGVyIGVsZW1lbnQgZmFjdG9yaWVzLiBDcmVhdGUgaGVscGVyIGVsZW1lbnRzIHVzZWQgYnkgZmllbGQgY29tcG9uZW50cy5cblxuICBjcmVhdGVFbGVtZW50X0ZpZWxkOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2ZpZWxkJykpLFxuXG4gIGNyZWF0ZUVsZW1lbnRfTGFiZWw6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvbGFiZWwnKSksXG5cbiAgY3JlYXRlRWxlbWVudF9IZWxwOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2hlbHAnKSksXG5cbiAgY3JlYXRlRWxlbWVudF9DaG9pY2VzOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2Nob2ljZXMnKSksXG5cbiAgY3JlYXRlRWxlbWVudF9BcnJheUNvbnRyb2w6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvYXJyYXktY29udHJvbCcpKSxcblxuICBjcmVhdGVFbGVtZW50X0FycmF5SXRlbUNvbnRyb2w6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvYXJyYXktaXRlbS1jb250cm9sJykpLFxuXG4gIGNyZWF0ZUVsZW1lbnRfQXJyYXlJdGVtVmFsdWU6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvYXJyYXktaXRlbS12YWx1ZScpKSxcblxuICBjcmVhdGVFbGVtZW50X0FycmF5SXRlbTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9hcnJheS1pdGVtJykpLFxuXG4gIGNyZWF0ZUVsZW1lbnRfRmllbGRUZW1wbGF0ZUNob2ljZXM6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvZmllbGQtdGVtcGxhdGUtY2hvaWNlcycpKSxcblxuICBjcmVhdGVFbGVtZW50X0FkZEl0ZW06IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvYWRkLWl0ZW0nKSksXG5cbiAgY3JlYXRlRWxlbWVudF9SZW1vdmVJdGVtOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL3JlbW92ZS1pdGVtJykpLFxuXG4gIGNyZWF0ZUVsZW1lbnRfTW92ZUl0ZW1Gb3J3YXJkOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL21vdmUtaXRlbS1mb3J3YXJkJykpLFxuXG4gIGNyZWF0ZUVsZW1lbnRfTW92ZUl0ZW1CYWNrOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL21vdmUtaXRlbS1iYWNrJykpLFxuXG4gIGNyZWF0ZUVsZW1lbnRfT2JqZWN0Q29udHJvbDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9vYmplY3QtY29udHJvbCcpKSxcblxuICBjcmVhdGVFbGVtZW50X09iamVjdEl0ZW1Db250cm9sOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL29iamVjdC1pdGVtLWNvbnRyb2wnKSksXG5cbiAgY3JlYXRlRWxlbWVudF9PYmplY3RJdGVtVmFsdWU6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWl0ZW0tdmFsdWUnKSksXG5cbiAgY3JlYXRlRWxlbWVudF9PYmplY3RJdGVtS2V5OiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL29iamVjdC1pdGVtLWtleScpKSxcblxuICBjcmVhdGVFbGVtZW50X09iamVjdEl0ZW06IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWl0ZW0nKSksXG5cbiAgY3JlYXRlRWxlbWVudF9TZWxlY3RWYWx1ZTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9zZWxlY3QtdmFsdWUnKSksXG5cbiAgY3JlYXRlRWxlbWVudF9TYW1wbGU6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvc2FtcGxlJykpLFxuXG5cbiAgLy8gRmllbGQgZGVmYXVsdCB2YWx1ZSBmYWN0b3JpZXMuIEdpdmUgYSBkZWZhdWx0IHZhbHVlIGZvciBhIHNwZWNpZmljIHR5cGUuXG5cbiAgY3JlYXRlRGVmYXVsdFZhbHVlX1N0cmluZzogZnVuY3Rpb24gKC8qIGZpZWxkVGVtcGxhdGUgKi8pIHtcbiAgICByZXR1cm4gJyc7XG4gIH0sXG5cbiAgY3JlYXRlRGVmYXVsdFZhbHVlX09iamVjdDogZnVuY3Rpb24gKC8qIGZpZWxkVGVtcGxhdGUgKi8pIHtcbiAgICByZXR1cm4ge307XG4gIH0sXG5cbiAgY3JlYXRlRGVmYXVsdFZhbHVlX0FycmF5OiBmdW5jdGlvbiAoLyogZmllbGRUZW1wbGF0ZSAqLykge1xuICAgIHJldHVybiBbXTtcbiAgfSxcblxuICBjcmVhdGVEZWZhdWx0VmFsdWVfQm9vbGVhbjogZnVuY3Rpb24gKC8qIGZpZWxkVGVtcGxhdGUgKi8pIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG5cbiAgY3JlYXRlRGVmYXVsdFZhbHVlX0ZpZWxkczogdXRpbHMuZGVsZWdhdGVUbygnY3JlYXRlRGVmYXVsdFZhbHVlX09iamVjdCcpLFxuXG4gIGNyZWF0ZURlZmF1bHRWYWx1ZV9TaW5nbGVMaW5lU3RyaW5nOiB1dGlscy5kZWxlZ2F0ZVRvKCdjcmVhdGVEZWZhdWx0VmFsdWVfU3RyaW5nJyksXG5cbiAgY3JlYXRlRGVmYXVsdFZhbHVlX1NlbGVjdDogdXRpbHMuZGVsZWdhdGVUbygnY3JlYXRlRGVmYXVsdFZhbHVlX1N0cmluZycpLFxuXG4gIGNyZWF0ZURlZmF1bHRWYWx1ZV9Kc29uOiB1dGlscy5kZWxlZ2F0ZVRvKCdjcmVhdGVEZWZhdWx0VmFsdWVfT2JqZWN0JyksXG5cbiAgY3JlYXRlRGVmYXVsdFZhbHVlX0NoZWNrYm94QXJyYXk6IHV0aWxzLmRlbGVnYXRlVG8oJ2NyZWF0ZURlZmF1bHRWYWx1ZV9BcnJheScpLFxuXG4gIGNyZWF0ZURlZmF1bHRWYWx1ZV9DaGVja2JveEJvb2xlYW46IHV0aWxzLmRlbGVnYXRlVG8oJ2NyZWF0ZURlZmF1bHRWYWx1ZV9Cb29sZWFuJyksXG5cblxuICAvLyBGaWVsZCB2YWx1ZSBjb2VyY2Vycy4gQ29lcmNlIGEgdmFsdWUgaW50byBhIHZhbHVlIGFwcHJvcHJpYXRlIGZvciBhIHNwZWNpZmljIHR5cGUuXG5cbiAgY29lcmNlVmFsdWVfU3RyaW5nOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSwgdmFsdWUpIHtcbiAgICBpZiAoXy5pc1N0cmluZyh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgaWYgKF8uaXNVbmRlZmluZWQodmFsdWUpIHx8IHZhbHVlID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gIH0sXG5cbiAgY29lcmNlVmFsdWVfT2JqZWN0OiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSwgdmFsdWUpIHtcbiAgICBpZiAoIV8uaXNPYmplY3QodmFsdWUpKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbiAgfSxcblxuICBjb2VyY2VWYWx1ZV9BcnJheTogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUsIHZhbHVlKSB7XG4gICAgaWYgKCFfLmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICByZXR1cm4gW3ZhbHVlXTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9LFxuXG4gIGNvZXJjZVZhbHVlX0Jvb2xlYW46IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlLCB2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmNvZXJjZVZhbHVlVG9Cb29sZWFuKHZhbHVlKTtcbiAgfSxcblxuICBjb2VyY2VWYWx1ZV9GaWVsZHM6IHV0aWxzLmRlbGVnYXRlVG8oJ2NvZXJjZVZhbHVlX09iamVjdCcpLFxuXG4gIGNvZXJjZVZhbHVlX1NpbmdsZUxpbmVTdHJpbmc6IHV0aWxzLmRlbGVnYXRlVG8oJ2NvZXJjZVZhbHVlX1N0cmluZycpLFxuXG4gIGNvZXJjZVZhbHVlX1NlbGVjdDogdXRpbHMuZGVsZWdhdGVUbygnY29lcmNlVmFsdWVfU3RyaW5nJyksXG5cbiAgY29lcmNlVmFsdWVfSnNvbjogdXRpbHMuZGVsZWdhdGVUbygnY29lcmNlVmFsdWVfT2JqZWN0JyksXG5cbiAgY29lcmNlVmFsdWVfQ2hlY2tib3hBcnJheTogdXRpbHMuZGVsZWdhdGVUbygnY29lcmNlVmFsdWVfQXJyYXknKSxcblxuICBjb2VyY2VWYWx1ZV9DaGVja2JveEJvb2xlYW46IHV0aWxzLmRlbGVnYXRlVG8oJ2NvZXJjZVZhbHVlX0Jvb2xlYW4nKSxcblxuXG4gIC8vIEZpZWxkIGNoaWxkIGZpZWxkcyBmYWN0b3JpZXMsIHNvIHNvbWUgdHlwZXMgY2FuIGhhdmUgZHluYW1pYyBjaGlsZHJlbi5cblxuICBjcmVhdGVDaGlsZEZpZWxkc19BcnJheTogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXM7XG5cbiAgICByZXR1cm4gZmllbGQudmFsdWUubWFwKGZ1bmN0aW9uIChhcnJheUl0ZW0sIGkpIHtcbiAgICAgIHZhciBjaGlsZEZpZWxkVGVtcGxhdGUgPSBjb25maWcuY2hpbGRGaWVsZFRlbXBsYXRlRm9yVmFsdWUoZmllbGQsIGFycmF5SXRlbSk7XG5cbiAgICAgIHZhciBjaGlsZEZpZWxkID0gY29uZmlnLmNyZWF0ZUNoaWxkRmllbGQoZmllbGQsIHtcbiAgICAgICAgZmllbGRUZW1wbGF0ZTogY2hpbGRGaWVsZFRlbXBsYXRlLCBrZXk6IGksIGZpZWxkSW5kZXg6IGksIHZhbHVlOiBhcnJheUl0ZW1cbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gY2hpbGRGaWVsZDtcbiAgICB9KTtcbiAgfSxcblxuICBjcmVhdGVDaGlsZEZpZWxkc19PYmplY3Q6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzO1xuXG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKGZpZWxkLnZhbHVlKS5tYXAoZnVuY3Rpb24gKGtleSwgaSkge1xuICAgICAgdmFyIGNoaWxkRmllbGRUZW1wbGF0ZSA9IGNvbmZpZy5jaGlsZEZpZWxkVGVtcGxhdGVGb3JWYWx1ZShmaWVsZCwgZmllbGQudmFsdWVba2V5XSk7XG5cbiAgICAgIHZhciBjaGlsZEZpZWxkID0gY29uZmlnLmNyZWF0ZUNoaWxkRmllbGQoZmllbGQsIHtcbiAgICAgICAgZmllbGRUZW1wbGF0ZTogY2hpbGRGaWVsZFRlbXBsYXRlLCBrZXk6IGtleSwgZmllbGRJbmRleDogaSwgdmFsdWU6IGZpZWxkLnZhbHVlW2tleV1cbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gY2hpbGRGaWVsZDtcbiAgICB9KTtcbiAgfSxcblxuICAvLyBDaGVjayBpZiB0aGVyZSBpcyBhIGZhY3RvcnkgZm9yIHRoZSBuYW1lLlxuICBoYXNFbGVtZW50RmFjdG9yeTogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcztcblxuICAgIHJldHVybiBjb25maWdbJ2NyZWF0ZUVsZW1lbnRfJyArIG5hbWVdID8gdHJ1ZSA6IGZhbHNlO1xuICB9LFxuXG4gIC8vIENyZWF0ZSBhbiBlbGVtZW50IGdpdmVuIGEgbmFtZSwgcHJvcHMsIGFuZCBjaGlsZHJlbi5cbiAgY3JlYXRlRWxlbWVudDogZnVuY3Rpb24gKG5hbWUsIHByb3BzLCBjaGlsZHJlbikge1xuICAgIHZhciBjb25maWcgPSB0aGlzO1xuXG4gICAgaWYgKCFwcm9wcy5jb25maWcpIHtcbiAgICAgIHByb3BzID0gXy5leHRlbmQoe30sIHByb3BzLCB7Y29uZmlnOiBjb25maWd9KTtcbiAgICB9XG5cbiAgICBuYW1lID0gY29uZmlnLmVsZW1lbnROYW1lKG5hbWUpO1xuXG4gICAgaWYgKGNvbmZpZ1snY3JlYXRlRWxlbWVudF8nICsgbmFtZV0pIHtcbiAgICAgIHJldHVybiBjb25maWdbJ2NyZWF0ZUVsZW1lbnRfJyArIG5hbWVdKHByb3BzLCBjaGlsZHJlbik7XG4gICAgfVxuXG4gICAgaWYgKG5hbWUgIT09ICdVbmtub3duJykge1xuICAgICAgaWYgKGNvbmZpZy5oYXNFbGVtZW50RmFjdG9yeSgnVW5rbm93bicpKSB7XG4gICAgICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnVW5rbm93bicsIHByb3BzLCBjaGlsZHJlbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKCdGYWN0b3J5IG5vdCBmb3VuZCBmb3I6ICcgKyBuYW1lKTtcbiAgfSxcblxuICAvLyBDcmVhdGUgYSBmaWVsZCBlbGVtZW50IGdpdmVuIHNvbWUgcHJvcHMuIFVzZSBjb250ZXh0IHRvIGRldGVybWluZSBuYW1lLlxuICBjcmVhdGVGaWVsZEVsZW1lbnQ6IGZ1bmN0aW9uIChwcm9wcykge1xuICAgIHZhciBjb25maWcgPSB0aGlzO1xuXG4gICAgdmFyIG5hbWUgPSBjb25maWcuZmllbGRUeXBlTmFtZShwcm9wcy5maWVsZCk7XG5cbiAgICBpZiAoY29uZmlnLmhhc0VsZW1lbnRGYWN0b3J5KG5hbWUpKSB7XG4gICAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQobmFtZSwgcHJvcHMpO1xuICAgIH1cblxuICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnVW5rbm93bkZpZWxkJywgcHJvcHMpO1xuICB9LFxuXG4gIC8vIFJlbmRlciB0aGUgcm9vdCBmb3JtYXRpYyBjb21wb25lbnRcbiAgcmVuZGVyRm9ybWF0aWNDb21wb25lbnQ6IGZ1bmN0aW9uIChjb21wb25lbnQpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcztcbiAgICB2YXIgcHJvcHMgPSBjb21wb25lbnQucHJvcHM7XG5cbiAgICB2YXIgZmllbGQgPSBjb25maWcuY3JlYXRlUm9vdEZpZWxkKHByb3BzKTtcblxuICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiAnZm9ybWF0aWMnfSxcbiAgICAgIGNvbmZpZy5jcmVhdGVGaWVsZEVsZW1lbnQoe2ZpZWxkOiBmaWVsZCwgb25DaGFuZ2U6IGNvbXBvbmVudC5vbkNoYW5nZSwgb25BY3Rpb246IGNvbXBvbmVudC5vbkFjdGlvbn0pXG4gICAgKTtcbiAgfSxcblxuICAvLyBSZW5kZXIgYW55IGNvbXBvbmVudC5cbiAgcmVuZGVyQ29tcG9uZW50OiBmdW5jdGlvbiAoY29tcG9uZW50KSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXM7XG5cbiAgICB2YXIgbmFtZSA9IGNvbXBvbmVudC5jb25zdHJ1Y3Rvci5kaXNwbGF5TmFtZTtcblxuICAgIGlmIChjb25maWdbJ3JlbmRlckNvbXBvbmVudF8nICsgbmFtZV0pIHtcbiAgICAgIHJldHVybiBjb25maWdbJ3JlbmRlckNvbXBvbmVudF8nICsgbmFtZV0oY29tcG9uZW50KTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29tcG9uZW50LnJlbmRlckRlZmF1bHQoKTtcbiAgfSxcblxuICAvLyBSZW5kZXIgZmllbGQgY29tcG9uZW50cy5cbiAgcmVuZGVyRmllbGRDb21wb25lbnQ6IGZ1bmN0aW9uIChjb21wb25lbnQpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcztcblxuICAgIHJldHVybiBjb25maWcucmVuZGVyQ29tcG9uZW50KGNvbXBvbmVudCk7XG4gIH0sXG5cbiAgLy8gTm9ybWFsaXplIGFuIGVsZW1lbnQgbmFtZS5cbiAgZWxlbWVudE5hbWU6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgcmV0dXJuIHV0aWxzLmRhc2hUb1Bhc2NhbChuYW1lKTtcbiAgfSxcblxuICAvLyBUeXBlIGFsaWFzZXMuXG5cbiAgYWxpYXNfRGljdDogJ09iamVjdCcsXG5cbiAgYWxpYXNfQm9vbDogJ0Jvb2xlYW4nLFxuXG4gIGFsaWFzX1ByZXR0eVRleHRhcmVhOiAnUHJldHR5VGV4dCcsXG5cbiAgYWxpYXNfU2luZ2xlTGluZVN0cmluZzogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcbiAgICBpZiAoZmllbGRUZW1wbGF0ZS5yZXBsYWNlQ2hvaWNlcykge1xuICAgICAgcmV0dXJuICdQcmV0dHlUZXh0JztcbiAgICB9IGVsc2UgaWYgKGZpZWxkVGVtcGxhdGUuY2hvaWNlcykge1xuICAgICAgcmV0dXJuICdTZWxlY3QnO1xuICAgIH1cbiAgICByZXR1cm4gJ1NpbmdsZUxpbmVTdHJpbmcnO1xuICB9LFxuXG4gIGFsaWFzX1N0cmluZzogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcztcblxuICAgIGlmIChmaWVsZFRlbXBsYXRlLnJlcGxhY2VDaG9pY2VzKSB7XG4gICAgICByZXR1cm4gJ1ByZXR0eVRleHQnO1xuICAgIH0gZWxzZSBpZiAoZmllbGRUZW1wbGF0ZS5jaG9pY2VzKSB7XG4gICAgICByZXR1cm4gJ1NlbGVjdCc7XG4gICAgfSBlbHNlIGlmIChjb25maWcuZmllbGRUZW1wbGF0ZUlzU2luZ2xlTGluZShmaWVsZFRlbXBsYXRlKSkge1xuICAgICAgcmV0dXJuICdTaW5nbGVMaW5lU3RyaW5nJztcbiAgICB9XG4gICAgcmV0dXJuICdTdHJpbmcnO1xuICB9LFxuXG4gIGFsaWFzX1RleHQ6IHV0aWxzLmRlbGVnYXRlVG8oJ2FsaWFzX1N0cmluZycpLFxuXG4gIGFsaWFzX1VuaWNvZGU6IHV0aWxzLmRlbGVnYXRlVG8oJ2FsaWFzX1NpbmdsZUxpbmVTdHJpbmcnKSxcblxuICBhbGlhc19TdHI6IHV0aWxzLmRlbGVnYXRlVG8oJ2FsaWFzX1NpbmdsZUxpbmVTdHJpbmcnKSxcblxuICBhbGlhc19MaXN0OiAnQXJyYXknLFxuXG4gIGFsaWFzX0NoZWNrYm94TGlzdDogJ0NoZWNrYm94QXJyYXknLFxuXG4gIGFsaWFzX0ZpZWxkc2V0OiAnRmllbGRzJyxcblxuICBhbGlhc19DaGVja2JveDogJ0NoZWNrYm94Qm9vbGVhbicsXG5cbiAgLy8gRmllbGQgZmFjdG9yeVxuXG4gIC8vIEdpdmVuIGEgZmllbGQsIGV4cGFuZCBhbGwgY2hpbGQgZmllbGRzIHJlY3Vyc2l2ZWx5IHRvIGdldCB0aGUgZGVmYXVsdFxuICAvLyB2YWx1ZXMgb2YgYWxsIGZpZWxkcy5cbiAgaW5mbGF0ZUZpZWxkVmFsdWU6IGZ1bmN0aW9uIChmaWVsZCwgZmllbGRIYW5kbGVyKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXM7XG5cbiAgICBpZiAoZmllbGRIYW5kbGVyKSB7XG4gICAgICB2YXIgc3RvcCA9IGZpZWxkSGFuZGxlcihmaWVsZCk7XG4gICAgICBpZiAoc3RvcCA9PT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjb25maWcuZmllbGRIYXNWYWx1ZUNoaWxkcmVuKGZpZWxkKSkge1xuICAgICAgdmFyIHZhbHVlID0gXy5jbG9uZShmaWVsZC52YWx1ZSk7XG4gICAgICB2YXIgY2hpbGRGaWVsZHMgPSBjb25maWcuY3JlYXRlQ2hpbGRGaWVsZHMoZmllbGQpO1xuICAgICAgY2hpbGRGaWVsZHMuZm9yRWFjaChmdW5jdGlvbiAoY2hpbGRGaWVsZCkge1xuICAgICAgICBpZiAoY29uZmlnLmlzS2V5KGNoaWxkRmllbGQua2V5KSkge1xuICAgICAgICAgIHZhbHVlW2NoaWxkRmllbGQua2V5XSA9IGNvbmZpZy5pbmZsYXRlRmllbGRWYWx1ZShjaGlsZEZpZWxkLCBmaWVsZEhhbmRsZXIpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZpZWxkLnZhbHVlO1xuICAgIH1cbiAgfSxcblxuICAvLyBJbml0aWFsaXplIHRoZSByb290IGZpZWxkLlxuICBpbml0Um9vdEZpZWxkOiBmdW5jdGlvbiAoLyogZmllbGQsIHByb3BzICovKSB7XG4gIH0sXG5cbiAgLy8gSW5pdGlhbGl6ZSBldmVyeSBmaWVsZC5cbiAgaW5pdEZpZWxkOiBmdW5jdGlvbiAoLyogZmllbGQgKi8pIHtcbiAgfSxcblxuICAvLyBJZiBhbiBhcnJheSBvZiBmaWVsZCB0ZW1wbGF0ZXMgYXJlIHBhc3NlZCBpbiwgdGhpcyBtZXRob2QgaXMgdXNlZCB0b1xuICAvLyB3cmFwIHRoZSBmaWVsZHMgaW5zaWRlIGEgc2luZ2xlIHJvb3QgZmllbGQgdGVtcGxhdGUuXG4gIHdyYXBGaWVsZFRlbXBsYXRlczogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGVzKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6ICdmaWVsZHMnLFxuICAgICAgcGxhaW46IHRydWUsXG4gICAgICBmaWVsZHM6IGZpZWxkVGVtcGxhdGVzXG4gICAgfTtcbiAgfSxcblxuICAvLyBHaXZlbiB0aGUgcHJvcHMgdGhhdCBhcmUgcGFzc2VkIGluLCBjcmVhdGUgdGhlIHJvb3QgZmllbGQuXG4gIGNyZWF0ZVJvb3RGaWVsZDogZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXM7XG5cbiAgICB2YXIgZmllbGRUZW1wbGF0ZSA9IHByb3BzLmZpZWxkVGVtcGxhdGUgfHwgcHJvcHMuZmllbGRUZW1wbGF0ZXMgfHwgcHJvcHMuZmllbGQgfHwgcHJvcHMuZmllbGRzO1xuICAgIHZhciB2YWx1ZSA9IHByb3BzLnZhbHVlO1xuXG4gICAgaWYgKCFmaWVsZFRlbXBsYXRlKSB7XG4gICAgICBmaWVsZFRlbXBsYXRlID0gY29uZmlnLmNyZWF0ZUZpZWxkVGVtcGxhdGVGcm9tVmFsdWUodmFsdWUpO1xuICAgIH1cblxuICAgIGlmIChfLmlzQXJyYXkoZmllbGRUZW1wbGF0ZSkpIHtcbiAgICAgIGZpZWxkVGVtcGxhdGUgPSBjb25maWcud3JhcEZpZWxkVGVtcGxhdGVzKGZpZWxkVGVtcGxhdGUpO1xuICAgIH1cblxuICAgIHZhciBmaWVsZCA9IF8uZXh0ZW5kKHt9LCBmaWVsZFRlbXBsYXRlLCB7cmF3RmllbGRUZW1wbGF0ZTogZmllbGRUZW1wbGF0ZX0pO1xuICAgIGlmIChjb25maWcuaGFzVmFsdWUoZmllbGRUZW1wbGF0ZSwgdmFsdWUpKSB7XG4gICAgICBmaWVsZC52YWx1ZSA9IGNvbmZpZy5jb2VyY2VWYWx1ZShmaWVsZFRlbXBsYXRlLCB2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZpZWxkLnZhbHVlID0gY29uZmlnLmNyZWF0ZURlZmF1bHRWYWx1ZShmaWVsZFRlbXBsYXRlKTtcbiAgICB9XG5cbiAgICBjb25maWcuaW5pdFJvb3RGaWVsZChmaWVsZCwgcHJvcHMpO1xuICAgIGNvbmZpZy5pbml0RmllbGQoZmllbGQpO1xuXG4gICAgaWYgKHZhbHVlID09PSBudWxsIHx8IGNvbmZpZy5pc0VtcHR5T2JqZWN0KHZhbHVlKSB8fCBfLmlzVW5kZWZpbmVkKHZhbHVlKSkge1xuICAgICAgZmllbGQudmFsdWUgPSBjb25maWcuaW5mbGF0ZUZpZWxkVmFsdWUoZmllbGQpO1xuICAgIH1cblxuICAgIHJldHVybiBmaWVsZDtcbiAgfSxcblxuICAvLyBHaXZlbiB0aGUgcHJvcHMgdGhhdCBhcmUgcGFzc2VkIGluLCBjcmVhdGUgdGhlIHZhbHVlIHRoYXQgd2lsbCBiZSBkaXNwbGF5ZWRcbiAgLy8gYnkgYWxsIHRoZSBjb21wb25lbnRzLlxuICBjcmVhdGVSb290VmFsdWU6IGZ1bmN0aW9uIChwcm9wcywgZmllbGRIYW5kbGVyKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXM7XG5cbiAgICB2YXIgZmllbGQgPSBjb25maWcuY3JlYXRlUm9vdEZpZWxkKHByb3BzKTtcblxuICAgIHJldHVybiBjb25maWcuaW5mbGF0ZUZpZWxkVmFsdWUoZmllbGQsIGZpZWxkSGFuZGxlcik7XG4gIH0sXG5cbiAgdmFsaWRhdGVSb290VmFsdWU6IGZ1bmN0aW9uIChwcm9wcykge1xuICAgIHZhciBjb25maWcgPSB0aGlzO1xuXG4gICAgdmFyIGVycm9ycyA9IFtdO1xuXG4gICAgY29uZmlnLmNyZWF0ZVJvb3RWYWx1ZShwcm9wcywgZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICB2YXIgZmllbGRFcnJvcnMgPSBjb25maWcuZmllbGRFcnJvcnMoZmllbGQpO1xuICAgICAgaWYgKGZpZWxkRXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgZXJyb3JzLnB1c2goe1xuICAgICAgICAgIHBhdGg6IGNvbmZpZy5maWVsZFZhbHVlUGF0aChmaWVsZCksXG4gICAgICAgICAgZXJyb3JzOiBmaWVsZEVycm9yc1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBlcnJvcnM7XG4gIH0sXG5cbiAgaXNWYWxpZFJvb3RWYWx1ZTogZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXM7XG5cbiAgICB2YXIgaXNWYWxpZCA9IHRydWU7XG5cbiAgICBjb25maWcuY3JlYXRlUm9vdFZhbHVlKHByb3BzLCBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgIGlmIChjb25maWcuZmllbGRFcnJvcnMoZmllbGQpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgaXNWYWxpZCA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gaXNWYWxpZDtcbiAgfSxcblxuICB2YWxpZGF0ZUZpZWxkOiBmdW5jdGlvbiAoZmllbGQsIGVycm9ycykge1xuICAgIHZhciBjb25maWcgPSB0aGlzO1xuXG4gICAgaWYgKGZpZWxkLnZhbHVlID09PSB1bmRlZmluZWQgfHwgZmllbGQudmFsdWUgPT09ICcnKSB7XG4gICAgICBpZiAoY29uZmlnLmZpZWxkSXNSZXF1aXJlZChmaWVsZCkpIHtcbiAgICAgICAgZXJyb3JzLnB1c2goe1xuICAgICAgICAgIHR5cGU6ICdyZXF1aXJlZCdcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIENyZWF0ZSBkeW5hbWljIGNoaWxkIGZpZWxkcyBmb3IgYSBmaWVsZC5cbiAgY3JlYXRlQ2hpbGRGaWVsZHM6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzO1xuXG4gICAgdmFyIHR5cGVOYW1lID0gY29uZmlnLmZpZWxkVHlwZU5hbWUoZmllbGQpO1xuXG4gICAgaWYgKGNvbmZpZ1snY3JlYXRlQ2hpbGRGaWVsZHNfJyArIHR5cGVOYW1lXSkge1xuICAgICAgcmV0dXJuIGNvbmZpZ1snY3JlYXRlQ2hpbGRGaWVsZHNfJyArIHR5cGVOYW1lXShmaWVsZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbmZpZy5maWVsZENoaWxkRmllbGRUZW1wbGF0ZXMoZmllbGQpLm1hcChmdW5jdGlvbiAoY2hpbGRGaWVsZCwgaSkge1xuICAgICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVDaGlsZEZpZWxkKGZpZWxkLCB7XG4gICAgICAgIGZpZWxkVGVtcGxhdGU6IGNoaWxkRmllbGQsIGtleTogY2hpbGRGaWVsZC5rZXksIGZpZWxkSW5kZXg6IGksIHZhbHVlOiBmaWVsZC52YWx1ZVtjaGlsZEZpZWxkLmtleV1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9LFxuXG4gIC8vIENyZWF0ZSBhIHNpbmdsZSBjaGlsZCBmaWVsZCBmb3IgYSBwYXJlbnQgZmllbGQuXG4gIGNyZWF0ZUNoaWxkRmllbGQ6IGZ1bmN0aW9uIChwYXJlbnRGaWVsZCwgb3B0aW9ucykge1xuICAgIHZhciBjb25maWcgPSB0aGlzO1xuXG4gICAgdmFyIGNoaWxkVmFsdWUgPSBvcHRpb25zLnZhbHVlO1xuXG4gICAgdmFyIGNoaWxkRmllbGQgPSBfLmV4dGVuZCh7fSwgb3B0aW9ucy5maWVsZFRlbXBsYXRlLCB7XG4gICAgICBrZXk6IG9wdGlvbnMua2V5LCBwYXJlbnQ6IHBhcmVudEZpZWxkLCBmaWVsZEluZGV4OiBvcHRpb25zLmZpZWxkSW5kZXgsXG4gICAgICByYXdGaWVsZFRlbXBsYXRlOiBvcHRpb25zLmZpZWxkVGVtcGxhdGVcbiAgICB9KTtcblxuICAgIGlmIChjb25maWcuaGFzVmFsdWUob3B0aW9ucy5maWVsZFRlbXBsYXRlLCBjaGlsZFZhbHVlKSkge1xuICAgICAgY2hpbGRGaWVsZC52YWx1ZSA9IGNvbmZpZy5jb2VyY2VWYWx1ZShvcHRpb25zLmZpZWxkVGVtcGxhdGUsIGNoaWxkVmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjaGlsZEZpZWxkLnZhbHVlID0gY29uZmlnLmNyZWF0ZURlZmF1bHRWYWx1ZShvcHRpb25zLmZpZWxkVGVtcGxhdGUpO1xuICAgIH1cblxuICAgIGNvbmZpZy5pbml0RmllbGQoY2hpbGRGaWVsZCk7XG5cbiAgICByZXR1cm4gY2hpbGRGaWVsZDtcbiAgfSxcblxuICAvLyBDcmVhdGUgYSB0ZW1wb3JhcnkgZmllbGQgYW5kIGV4dHJhY3QgaXRzIHZhbHVlLlxuICBjcmVhdGVOZXdDaGlsZEZpZWxkVmFsdWU6IGZ1bmN0aW9uIChwYXJlbnRGaWVsZCwgaXRlbUZpZWxkSW5kZXgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcztcblxuICAgIHZhciBjaGlsZEZpZWxkVGVtcGxhdGUgPSBjb25maWcuZmllbGRJdGVtRmllbGRUZW1wbGF0ZXMocGFyZW50RmllbGQpW2l0ZW1GaWVsZEluZGV4XTtcblxuICAgIHZhciBuZXdWYWx1ZSA9IGNvbmZpZy5maWVsZFRlbXBsYXRlVmFsdWUoY2hpbGRGaWVsZFRlbXBsYXRlKTtcblxuICAgIC8vIEp1c3QgYSBwbGFjZWhvbGRlciBrZXkuIFNob3VsZCBub3QgYmUgaW1wb3J0YW50LlxuICAgIHZhciBrZXkgPSAnX191bmtub3duX2tleV9fJztcblxuICAgIGlmIChfLmlzQXJyYXkocGFyZW50RmllbGQudmFsdWUpKSB7XG4gICAgICAvLyBKdXN0IGEgcGxhY2Vob2xkZXIgcG9zaXRpb24gZm9yIGFuIGFycmF5LlxuICAgICAga2V5ID0gcGFyZW50RmllbGQudmFsdWUubGVuZ3RoO1xuICAgIH1cblxuICAgIC8vIEp1c3QgYSBwbGFjZWhvbGRlciBmaWVsZCBpbmRleC4gU2hvdWxkIG5vdCBiZSBpbXBvcnRhbnQuXG4gICAgdmFyIGZpZWxkSW5kZXggPSAwO1xuICAgIGlmIChfLmlzT2JqZWN0KHBhcmVudEZpZWxkLnZhbHVlKSkge1xuICAgICAgZmllbGRJbmRleCA9IE9iamVjdC5rZXlzKHBhcmVudEZpZWxkLnZhbHVlKS5sZW5ndGg7XG4gICAgfVxuXG4gICAgdmFyIGNoaWxkRmllbGQgPSBjb25maWcuY3JlYXRlQ2hpbGRGaWVsZChwYXJlbnRGaWVsZCwge1xuICAgICAgZmllbGRUZW1wbGF0ZTogY2hpbGRGaWVsZFRlbXBsYXRlLCBrZXk6IGtleSwgZmllbGRJbmRleDogZmllbGRJbmRleCwgdmFsdWU6IG5ld1ZhbHVlXG4gICAgfSk7XG5cbiAgICBuZXdWYWx1ZSA9IGNvbmZpZy5pbmZsYXRlRmllbGRWYWx1ZShjaGlsZEZpZWxkKTtcblxuICAgIHJldHVybiBuZXdWYWx1ZTtcbiAgfSxcblxuICAvLyBHaXZlbiBhIHZhbHVlLCBjcmVhdGUgYSBmaWVsZCB0ZW1wbGF0ZSBmb3IgdGhhdCB2YWx1ZS5cbiAgY3JlYXRlRmllbGRUZW1wbGF0ZUZyb21WYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXM7XG5cbiAgICB2YXIgZmllbGQgPSB7XG4gICAgICB0eXBlOiAnanNvbidcbiAgICB9O1xuICAgIGlmIChfLmlzU3RyaW5nKHZhbHVlKSkge1xuICAgICAgZmllbGQgPSB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAoXy5pc051bWJlcih2YWx1ZSkpIHtcbiAgICAgIGZpZWxkID0ge1xuICAgICAgICB0eXBlOiAnbnVtYmVyJ1xuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKF8uaXNCb29sZWFuKHZhbHVlKSkge1xuICAgICAgZmllbGQgPSB7XG4gICAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKF8uaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgIHZhciBhcnJheUl0ZW1GaWVsZHMgPSB2YWx1ZS5tYXAoZnVuY3Rpb24gKGNoaWxkVmFsdWUsIGkpIHtcbiAgICAgICAgdmFyIGNoaWxkRmllbGQgPSBjb25maWcuY3JlYXRlRmllbGRUZW1wbGF0ZUZyb21WYWx1ZShjaGlsZFZhbHVlKTtcbiAgICAgICAgY2hpbGRGaWVsZC5rZXkgPSBpO1xuICAgICAgICByZXR1cm4gY2hpbGRGaWVsZDtcbiAgICAgIH0pO1xuICAgICAgZmllbGQgPSB7XG4gICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgIGZpZWxkczogYXJyYXlJdGVtRmllbGRzXG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAoXy5pc09iamVjdCh2YWx1ZSkpIHtcbiAgICAgIHZhciBvYmplY3RJdGVtRmllbGRzID0gT2JqZWN0LmtleXModmFsdWUpLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIHZhciBjaGlsZEZpZWxkID0gY29uZmlnLmNyZWF0ZUZpZWxkVGVtcGxhdGVGcm9tVmFsdWUodmFsdWVba2V5XSk7XG4gICAgICAgIGNoaWxkRmllbGQua2V5ID0ga2V5O1xuICAgICAgICBjaGlsZEZpZWxkLmxhYmVsID0gY29uZmlnLmh1bWFuaXplKGtleSk7XG4gICAgICAgIHJldHVybiBjaGlsZEZpZWxkO1xuICAgICAgfSk7XG4gICAgICBmaWVsZCA9IHtcbiAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgIGZpZWxkczogb2JqZWN0SXRlbUZpZWxkc1xuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKF8uaXNOdWxsKHZhbHVlKSkge1xuICAgICAgZmllbGQgPSB7XG4gICAgICAgIHR5cGU6ICdqc29uJ1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIGZpZWxkO1xuICB9LFxuXG4gIC8vIERlZmF1bHQgdmFsdWUgZmFjdG9yeVxuXG4gIGNyZWF0ZURlZmF1bHRWYWx1ZTogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcztcblxuICAgIHZhciBkZWZhdWx0VmFsdWUgPSBjb25maWcuZmllbGRUZW1wbGF0ZURlZmF1bHRWYWx1ZShmaWVsZFRlbXBsYXRlKTtcblxuICAgIGlmICghXy5pc1VuZGVmaW5lZChkZWZhdWx0VmFsdWUpKSB7XG4gICAgICByZXR1cm4gdXRpbHMuZGVlcENvcHkoZGVmYXVsdFZhbHVlKTtcbiAgICB9XG5cbiAgICB2YXIgdHlwZU5hbWUgPSBjb25maWcuZmllbGRUeXBlTmFtZShmaWVsZFRlbXBsYXRlKTtcblxuICAgIGlmIChjb25maWdbJ2NyZWF0ZURlZmF1bHRWYWx1ZV8nICsgdHlwZU5hbWVdKSB7XG4gICAgICByZXR1cm4gY29uZmlnWydjcmVhdGVEZWZhdWx0VmFsdWVfJyArIHR5cGVOYW1lXShmaWVsZFRlbXBsYXRlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gJyc7XG4gIH0sXG5cbiAgLy8gRmllbGQgaGVscGVyc1xuXG4gIC8vIERldGVybWluZSBpZiBhIHZhbHVlIFwiZXhpc3RzXCIuXG4gIGhhc1ZhbHVlOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSwgdmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgIT09IG51bGwgJiYgIV8uaXNVbmRlZmluZWQodmFsdWUpO1xuICB9LFxuXG4gIC8vIENvZXJjZSBhIHZhbHVlIHRvIHZhbHVlIGFwcHJvcHJpYXRlIGZvciBhIGZpZWxkLlxuICBjb2VyY2VWYWx1ZTogZnVuY3Rpb24gKGZpZWxkLCB2YWx1ZSkge1xuICAgIHZhciBjb25maWcgPSB0aGlzO1xuXG4gICAgdmFyIHR5cGVOYW1lID0gY29uZmlnLmZpZWxkVHlwZU5hbWUoZmllbGQpO1xuXG4gICAgaWYgKGNvbmZpZ1snY29lcmNlVmFsdWVfJyArIHR5cGVOYW1lXSkge1xuICAgICAgcmV0dXJuIGNvbmZpZ1snY29lcmNlVmFsdWVfJyArIHR5cGVOYW1lXShmaWVsZCwgdmFsdWUpO1xuICAgIH1cblxuICAgIHJldHVybiB2YWx1ZTtcbiAgfSxcblxuICAvLyBHaXZlbiBhIGZpZWxkIGFuZCBhIGNoaWxkIHZhbHVlLCBmaW5kIHRoZSBhcHByb3ByaWF0ZSBmaWVsZCB0ZW1wbGF0ZSBmb3JcbiAgLy8gdGhhdCBjaGlsZCB2YWx1ZS5cbiAgY2hpbGRGaWVsZFRlbXBsYXRlRm9yVmFsdWU6IGZ1bmN0aW9uIChmaWVsZCwgY2hpbGRWYWx1ZSkge1xuICAgIHZhciBjb25maWcgPSB0aGlzO1xuXG4gICAgdmFyIGZpZWxkVGVtcGxhdGU7XG5cbiAgICB2YXIgZmllbGRUZW1wbGF0ZXMgPSBjb25maWcuZmllbGRJdGVtRmllbGRUZW1wbGF0ZXMoZmllbGQpO1xuXG4gICAgZmllbGRUZW1wbGF0ZSA9IF8uZmluZChmaWVsZFRlbXBsYXRlcywgZnVuY3Rpb24gKGl0ZW1GaWVsZFRlbXBsYXRlKSB7XG4gICAgICByZXR1cm4gY29uZmlnLm1hdGNoZXNGaWVsZFRlbXBsYXRlVG9WYWx1ZShpdGVtRmllbGRUZW1wbGF0ZSwgY2hpbGRWYWx1ZSk7XG4gICAgfSk7XG5cbiAgICBpZiAoZmllbGRUZW1wbGF0ZSkge1xuICAgICAgcmV0dXJuIGZpZWxkVGVtcGxhdGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjb25maWcuY3JlYXRlRmllbGRUZW1wbGF0ZUZyb21WYWx1ZShjaGlsZFZhbHVlKTtcbiAgICB9XG4gIH0sXG5cbiAgLy8gRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBtYXRjaCBmb3IgYSBmaWVsZCB0ZW1wbGF0ZS5cbiAgbWF0Y2hlc0ZpZWxkVGVtcGxhdGVUb1ZhbHVlOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSwgdmFsdWUpIHtcbiAgICB2YXIgbWF0Y2ggPSBmaWVsZFRlbXBsYXRlLm1hdGNoO1xuICAgIGlmICghbWF0Y2gpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gXy5ldmVyeShfLmtleXMobWF0Y2gpLCBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICByZXR1cm4gXy5pc0VxdWFsKG1hdGNoW2tleV0sIHZhbHVlW2tleV0pO1xuICAgIH0pO1xuICB9LFxuXG4gIC8vIEZpZWxkIHRlbXBsYXRlIGhlbHBlcnNcblxuICAvLyBOb3JtYWxpemVkIChQYXNjYWxDYXNlKSB0eXBlIG5hbWUgZm9yIGEgZmllbGQuXG4gIGZpZWxkVGVtcGxhdGVUeXBlTmFtZTogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcztcblxuICAgIHZhciB0eXBlTmFtZSA9IHV0aWxzLmRhc2hUb1Bhc2NhbChmaWVsZFRlbXBsYXRlLnR5cGUgfHwgJ3VuZGVmaW5lZCcpO1xuXG4gICAgdmFyIGFsaWFzID0gY29uZmlnWydhbGlhc18nICsgdHlwZU5hbWVdO1xuXG4gICAgaWYgKGFsaWFzKSB7XG4gICAgICBpZiAoXy5pc0Z1bmN0aW9uKGFsaWFzKSkge1xuICAgICAgICByZXR1cm4gYWxpYXMuY2FsbChjb25maWcsIGZpZWxkVGVtcGxhdGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGFsaWFzO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChmaWVsZFRlbXBsYXRlLmxpc3QpIHtcbiAgICAgIHR5cGVOYW1lID0gJ0FycmF5JztcbiAgICB9XG5cbiAgICByZXR1cm4gdHlwZU5hbWU7XG4gIH0sXG5cbiAgLy8gRGVmYXVsdCB2YWx1ZSBmb3IgYSBmaWVsZCB0ZW1wbGF0ZS5cbiAgZmllbGRUZW1wbGF0ZURlZmF1bHRWYWx1ZTogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcblxuICAgIHJldHVybiBmaWVsZFRlbXBsYXRlLmRlZmF1bHQ7XG4gIH0sXG5cbiAgLy8gVmFsdWUgZm9yIGEgZmllbGQgdGVtcGxhdGUuIFVzZWQgdG8gZGV0ZXJtaW5lIHRoZSB2YWx1ZSBvZiBhIG5ldyBjaGlsZFxuICAvLyBmaWVsZC5cbiAgZmllbGRUZW1wbGF0ZVZhbHVlOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSkge1xuICAgIHZhciBjb25maWcgPSB0aGlzO1xuXG4gICAgLy8gVGhpcyBsb2dpYyBtaWdodCBiZSBicml0dGxlLlxuXG4gICAgdmFyIGRlZmF1bHRWYWx1ZSA9IGNvbmZpZy5maWVsZFRlbXBsYXRlRGVmYXVsdFZhbHVlKGZpZWxkVGVtcGxhdGUpO1xuXG4gICAgdmFyIG1hdGNoID0gY29uZmlnLmZpZWxkVGVtcGxhdGVNYXRjaChmaWVsZFRlbXBsYXRlKTtcblxuICAgIHZhciB2YWx1ZTtcblxuICAgIGlmIChfLmlzVW5kZWZpbmVkKGRlZmF1bHRWYWx1ZSkgJiYgIV8uaXNVbmRlZmluZWQobWF0Y2gpKSB7XG4gICAgICByZXR1cm4gdXRpbHMuZGVlcENvcHkobWF0Y2gpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY29uZmlnLmNyZWF0ZURlZmF1bHRWYWx1ZShmaWVsZFRlbXBsYXRlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsdWU7XG4gIH0sXG5cbiAgLy8gTWF0Y2ggcnVsZSBmb3IgYSBmaWVsZCB0ZW1wbGF0ZS5cbiAgZmllbGRUZW1wbGF0ZU1hdGNoOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSkge1xuICAgIHJldHVybiBmaWVsZFRlbXBsYXRlLm1hdGNoO1xuICB9LFxuXG4gIC8vIERldGVybWluZSBpZiBhIGZpZWxkIHRlbXBsYXRlIGhhcyBhIHNpbmdsZS1saW5lIHZhbHVlLlxuICBmaWVsZFRlbXBsYXRlSXNTaW5nbGVMaW5lOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSkge1xuICAgIHJldHVybiBmaWVsZFRlbXBsYXRlLmlzU2luZ2xlTGluZSB8fCBmaWVsZFRlbXBsYXRlLmlzX3NpbmdsZV9saW5lIHx8XG4gICAgICAgICAgICBmaWVsZFRlbXBsYXRlLnR5cGUgPT09ICdzaW5nbGUtbGluZS1zdHJpbmcnIHx8IGZpZWxkVGVtcGxhdGUudHlwZSA9PT0gJ1NpbmdsZUxpbmVTdHJpbmcnO1xuICB9LFxuXG4gIC8vIEZpZWxkIGhlbHBlcnNcblxuICAvLyBHZXQgYW4gYXJyYXkgb2Yga2V5cyByZXByZXNlbnRpbmcgdGhlIHBhdGggdG8gYSB2YWx1ZS5cbiAgZmllbGRWYWx1ZVBhdGg6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzO1xuXG4gICAgdmFyIHBhcmVudFBhdGggPSBbXTtcblxuICAgIGlmIChmaWVsZC5wYXJlbnQpIHtcbiAgICAgIHBhcmVudFBhdGggPSBjb25maWcuZmllbGRWYWx1ZVBhdGgoZmllbGQucGFyZW50KTtcbiAgICB9XG5cbiAgICByZXR1cm4gcGFyZW50UGF0aC5jb25jYXQoZmllbGQua2V5KS5maWx0ZXIoZnVuY3Rpb24gKGtleSkge1xuICAgICAgcmV0dXJuICFfLmlzVW5kZWZpbmVkKGtleSkgJiYga2V5ICE9PSAnJztcbiAgICB9KTtcbiAgfSxcblxuICAvLyBDbG9uZSBhIGZpZWxkIHdpdGggYSBkaWZmZXJlbnQgdmFsdWUuXG4gIGZpZWxkV2l0aFZhbHVlOiBmdW5jdGlvbiAoZmllbGQsIHZhbHVlKSB7XG4gICAgcmV0dXJuIF8uZXh0ZW5kKHt9LCBmaWVsZCwge3ZhbHVlOiB2YWx1ZX0pO1xuICB9LFxuXG4gIGZpZWxkVHlwZU5hbWU6IHV0aWxzLmRlbGVnYXRlVG8oJ2ZpZWxkVGVtcGxhdGVUeXBlTmFtZScpLFxuXG4gIC8vIEdldCB0aGUgY2hvaWNlcyBmb3IgYSBkcm9wZG93biBmaWVsZC5cbiAgZmllbGRDaG9pY2VzOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcztcblxuICAgIHJldHVybiBjb25maWcubm9ybWFsaXplQ2hvaWNlcyhmaWVsZC5jaG9pY2VzKTtcbiAgfSxcblxuICAvLyBHZXQgYSBzZXQgb2YgYm9vbGVhbiBjaG9pY2VzIGZvciBhIGZpZWxkLlxuICBmaWVsZEJvb2xlYW5DaG9pY2VzOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcztcblxuICAgIHZhciBjaG9pY2VzID0gY29uZmlnLmZpZWxkQ2hvaWNlcyhmaWVsZCk7XG5cbiAgICBpZiAoY2hvaWNlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBbe1xuICAgICAgICBsYWJlbDogJ1llcycsXG4gICAgICAgIHZhbHVlOiB0cnVlXG4gICAgICB9LCB7XG4gICAgICAgIGxhYmVsOiAnTm8nLFxuICAgICAgICB2YWx1ZTogZmFsc2VcbiAgICAgIH1dO1xuICAgIH1cblxuICAgIHJldHVybiBjaG9pY2VzLm1hcChmdW5jdGlvbiAoY2hvaWNlKSB7XG4gICAgICBpZiAoXy5pc0Jvb2xlYW4oY2hvaWNlLnZhbHVlKSkge1xuICAgICAgICByZXR1cm4gY2hvaWNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIF8uZXh0ZW5kKHt9LCBjaG9pY2UsIHtcbiAgICAgICAgdmFsdWU6IGNvbmZpZy5jb2VyY2VWYWx1ZVRvQm9vbGVhbihjaG9pY2UudmFsdWUpXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSxcblxuICAvLyBHZXQgYSBzZXQgb2YgcmVwbGFjZW1lbnQgY2hvaWNlcyBmb3IgYSBmaWVsZC5cbiAgZmllbGRSZXBsYWNlQ2hvaWNlczogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXM7XG5cbiAgICByZXR1cm4gY29uZmlnLm5vcm1hbGl6ZUNob2ljZXMoZmllbGQucmVwbGFjZUNob2ljZXMpO1xuICB9LFxuXG4gIC8vIEdldCBhIGxhYmVsIGZvciBhIGZpZWxkLlxuICBmaWVsZExhYmVsOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICByZXR1cm4gZmllbGQubGFiZWw7XG4gIH0sXG5cbiAgLy8gR2V0IHRoZSBoZWxwIHRleHQgZm9yIGEgZmllbGQuXG4gIGZpZWxkSGVscFRleHQ6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIHJldHVybiBmaWVsZC5oZWxwX3RleHRfaHRtbCB8fCBmaWVsZC5oZWxwX3RleHQgfHwgZmllbGQuaGVscFRleHQgfHwgZmllbGQuaGVscFRleHRIdG1sO1xuICB9LFxuXG4gIC8vIEdldCB3aGV0aGVyIG9yIG5vdCBhIGZpZWxkIGlzIHJlcXVpcmVkLlxuICBmaWVsZElzUmVxdWlyZWQ6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIHJldHVybiBmaWVsZC5yZXF1aXJlZCA/IHRydWUgOiBmYWxzZTtcbiAgfSxcblxuICAvLyBEZXRlcm1pbmUgaWYgdmFsdWUgZm9yIHRoaXMgZmllbGQgaXMgbm90IGEgbGVhZiB2YWx1ZS5cbiAgZmllbGRIYXNWYWx1ZUNoaWxkcmVuOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcztcblxuICAgIHZhciBkZWZhdWx0VmFsdWUgPSBjb25maWcuY3JlYXRlRGVmYXVsdFZhbHVlKGZpZWxkKTtcblxuICAgIGlmIChfLmlzT2JqZWN0KGRlZmF1bHRWYWx1ZSkgfHwgXy5pc0FycmF5KGRlZmF1bHRWYWx1ZSkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcblxuICAvLyBHZXQgdGhlIGNoaWxkIGZpZWxkIHRlbXBsYXRlcyBmb3IgdGhpcyBmaWVsZC5cbiAgZmllbGRDaGlsZEZpZWxkVGVtcGxhdGVzOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICByZXR1cm4gZmllbGQuZmllbGRzIHx8IFtdO1xuICB9LFxuXG4gIC8vIEdldCB0aGUgZmllbGQgdGVtcGxhdGVzIGZvciBlYWNoIGl0ZW0gb2YgdGhpcyBmaWVsZC4gKEZvciBkeW5hbWljIGNoaWxkcmVuLFxuICAvLyBsaWtlIGFycmF5cy4pXG4gIGZpZWxkSXRlbUZpZWxkVGVtcGxhdGVzOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICBpZiAoIWZpZWxkLml0ZW1GaWVsZHMpIHtcbiAgICAgIHJldHVybiBbe3R5cGU6ICd0ZXh0J31dO1xuICAgIH1cbiAgICBpZiAoIV8uaXNBcnJheShmaWVsZC5pdGVtRmllbGRzKSkge1xuICAgICAgcmV0dXJuIFtmaWVsZC5pdGVtRmllbGRzXTtcbiAgICB9XG4gICAgcmV0dXJuIGZpZWxkLml0ZW1GaWVsZHM7XG4gIH0sXG5cbiAgZmllbGRJc1NpbmdsZUxpbmU6IHV0aWxzLmRlbGVnYXRlVG8oJ2ZpZWxkVGVtcGxhdGVJc1NpbmdsZUxpbmUnKSxcblxuICAvLyBHZXQgd2hldGhlciBvciBub3QgYSBmaWVsZCBpcyBjb2xsYXBzZWQuXG4gIGZpZWxkSXNDb2xsYXBzZWQ6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIHJldHVybiBmaWVsZC5jb2xsYXBzZWQgPyB0cnVlIDogZmFsc2U7XG4gIH0sXG5cbiAgLy8gR2V0IHdoZXRlciBvciBub3QgYSBmaWVsZCBjYW4gYmUgY29sbGFwc2VkLlxuICBmaWVsZElzQ29sbGFwc2libGU6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIHJldHVybiBmaWVsZC5jb2xsYXBzaWJsZSB8fCAhXy5pc1VuZGVmaW5lZChmaWVsZC5jb2xsYXBzZWQpO1xuICB9LFxuXG4gIC8vIEdldCB0aGUgbnVtYmVyIG9mIHJvd3MgZm9yIGEgZmllbGQuXG4gIGZpZWxkUm93czogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgcmV0dXJuIGZpZWxkLnJvd3M7XG4gIH0sXG5cbiAgZmllbGRFcnJvcnM6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzO1xuXG4gICAgdmFyIGVycm9ycyA9IFtdO1xuXG4gICAgaWYgKGNvbmZpZy5pc0tleShmaWVsZC5rZXkpKSB7XG4gICAgICBjb25maWcudmFsaWRhdGVGaWVsZChmaWVsZCwgZXJyb3JzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZXJyb3JzO1xuICB9LFxuXG4gIGZpZWxkTWF0Y2g6IHV0aWxzLmRlbGVnYXRlVG8oJ2ZpZWxkVGVtcGxhdGVNYXRjaCcpLFxuXG4gIC8vIE90aGVyIGhlbHBlcnNcblxuICAvLyBDb252ZXJ0IGEga2V5IHRvIGEgbmljZSBodW1hbi1yZWFkYWJsZSB2ZXJzaW9uLlxuICBodW1hbml6ZTogZnVuY3Rpb24ocHJvcGVydHkpIHtcbiAgICBwcm9wZXJ0eSA9IHByb3BlcnR5LnJlcGxhY2UoL1xce1xcey9nLCAnJyk7XG4gICAgcHJvcGVydHkgPSBwcm9wZXJ0eS5yZXBsYWNlKC9cXH1cXH0vZywgJycpO1xuICAgIHJldHVybiBwcm9wZXJ0eS5yZXBsYWNlKC9fL2csICcgJylcbiAgICAucmVwbGFjZSgvKFxcdyspL2csIGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgICByZXR1cm4gbWF0Y2guY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBtYXRjaC5zbGljZSgxKTtcbiAgICB9KTtcbiAgfSxcblxuICAvLyBOb3JtYWxpemUgc29tZSBjaG9pY2VzIGZvciBhIGRyb3AtZG93bi5cbiAgbm9ybWFsaXplQ2hvaWNlczogZnVuY3Rpb24gKGNob2ljZXMpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcztcblxuICAgIGlmICghY2hvaWNlcykge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIC8vIENvbnZlcnQgY29tbWEgc2VwYXJhdGVkIHN0cmluZyB0byBhcnJheSBvZiBzdHJpbmdzLlxuICAgIGlmIChfLmlzU3RyaW5nKGNob2ljZXMpKSB7XG4gICAgICBjaG9pY2VzID0gY2hvaWNlcy5zcGxpdCgnLCcpO1xuICAgIH1cblxuICAgIC8vIENvbnZlcnQgb2JqZWN0IHRvIGFycmF5IG9mIG9iamVjdHMgd2l0aCBgdmFsdWVgIGFuZCBgbGFiZWxgIHByb3BlcnRpZXMuXG4gICAgaWYgKCFfLmlzQXJyYXkoY2hvaWNlcykgJiYgXy5pc09iamVjdChjaG9pY2VzKSkge1xuICAgICAgY2hvaWNlcyA9IE9iamVjdC5rZXlzKGNob2ljZXMpLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdmFsdWU6IGtleSxcbiAgICAgICAgICBsYWJlbDogY2hvaWNlc1trZXldXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBDb3B5IHRoZSBhcnJheSBvZiBjaG9pY2VzIHNvIHdlIGNhbiBtYW5pcHVsYXRlIHRoZW0uXG4gICAgY2hvaWNlcyA9IGNob2ljZXMuc2xpY2UoMCk7XG5cbiAgICAvLyBBcnJheSBvZiBjaG9pY2UgYXJyYXlzIHNob3VsZCBiZSBmbGF0dGVuZWQuXG4gICAgY2hvaWNlcyA9IF8uZmxhdHRlbihjaG9pY2VzKTtcblxuICAgIGNob2ljZXMuZm9yRWFjaChmdW5jdGlvbiAoY2hvaWNlLCBpKSB7XG4gICAgICAvLyBDb252ZXJ0IGFueSBzdHJpbmcgY2hvaWNlcyB0byBvYmplY3RzIHdpdGggYHZhbHVlYCBhbmQgYGxhYmVsYFxuICAgICAgLy8gcHJvcGVydGllcy5cbiAgICAgIGlmIChfLmlzU3RyaW5nKGNob2ljZSkpIHtcbiAgICAgICAgY2hvaWNlc1tpXSA9IHtcbiAgICAgICAgICB2YWx1ZTogY2hvaWNlLFxuICAgICAgICAgIGxhYmVsOiBjb25maWcuaHVtYW5pemUoY2hvaWNlKVxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKCFjaG9pY2VzW2ldLmxhYmVsKSB7XG4gICAgICAgIGNob2ljZXNbaV0ubGFiZWwgPSBjb25maWcuaHVtYW5pemUoY2hvaWNlc1tpXS52YWx1ZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY2hvaWNlcztcbiAgfSxcblxuICAvLyBDb2VyY2UgYSB2YWx1ZSB0byBhIGJvb2xlYW5cbiAgY29lcmNlVmFsdWVUb0Jvb2xlYW46IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGlmICghXy5pc1N0cmluZyh2YWx1ZSkpIHtcbiAgICAgIC8vIEp1c3QgdXNlIHRoZSBkZWZhdWx0IHRydXRoaW5lc3MuXG4gICAgICByZXR1cm4gdmFsdWUgPyB0cnVlIDogZmFsc2U7XG4gICAgfVxuICAgIHZhbHVlID0gdmFsdWUudG9Mb3dlckNhc2UoKTtcbiAgICBpZiAodmFsdWUgPT09ICcnIHx8IHZhbHVlID09PSAnbm8nIHx8IHZhbHVlID09PSAnb2ZmJyB8fCB2YWx1ZSA9PT0gJ2ZhbHNlJykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcblxuICAvLyBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIHZhbGlkIGtleS5cbiAgaXNLZXk6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4gKF8uaXNOdW1iZXIoa2V5KSAmJiBrZXkgPj0gMCkgfHwgKF8uaXNTdHJpbmcoa2V5KSAmJiBrZXkgIT09ICcnKTtcbiAgfSxcblxuICAvLyBGYXN0IHdheSB0byBjaGVjayBmb3IgZW1wdHkgb2JqZWN0LlxuICBpc0VtcHR5T2JqZWN0OiBmdW5jdGlvbiAob2JqKSB7XG4gICAgZm9yKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufTtcbiIsIi8vICMgZm9ybWF0aWNcblxuLypcblRoZSByb290IGZvcm1hdGljIGNvbXBvbmVudC5cblxuVGhlIHJvb3QgZm9ybWF0aWMgY29tcG9uZW50IGlzIGFjdHVhbGx5IHR3byBjb21wb25lbnRzLiBUaGUgbWFpbiBjb21wb25lbnQgaXNcbmEgY29udHJvbGxlZCBjb21wb25lbnQgd2hlcmUgeW91IG11c3QgcGFzcyB0aGUgdmFsdWUgaW4gd2l0aCBlYWNoIHJlbmRlci4gVGhpc1xuaXMgYWN0dWFsbHkgd3JhcHBlZCBpbiBhbm90aGVyIGNvbXBvbmVudCB3aGljaCBhbGxvd3MgeW91IHRvIHVzZSBmb3JtYXRpYyBhc1xuYW4gdW5jb250cm9sbGVkIGNvbXBvbmVudCB3aGVyZSBpdCByZXRhaW5zIHRoZSBzdGF0ZSBvZiB0aGUgdmFsdWUuIFRoZSB3cmFwcGVyXG5pcyB3aGF0IGlzIGFjdHVhbGx5IGV4cG9ydGVkLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBfID0gcmVxdWlyZSgndW5kZXJzY29yZScpO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbnZhciBkZWZhdWx0Q29uZmlnID0gcmVxdWlyZSgnLi9kZWZhdWx0LWNvbmZpZycpO1xuXG4vLyBUaGUgbWFpbiBmb3JtYXRpYyBjb21wb25lbnQgdGhhdCByZW5kZXJzIHRoZSBmb3JtLlxudmFyIEZvcm1hdGljQ29udHJvbGxlZENsYXNzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnRm9ybWF0aWNDb250cm9sbGVkJyxcblxuICAvLyBSZXNwb25kIHRvIGFueSB2YWx1ZSBjaGFuZ2VzLlxuICBvbkNoYW5nZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBpbmZvKSB7XG4gICAgaWYgKCF0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGluZm8gPSBfLmV4dGVuZCh7fSwgaW5mbyk7XG4gICAgaW5mby5wYXRoID0gdGhpcy5wcm9wcy5jb25maWcuZmllbGRWYWx1ZVBhdGgoaW5mby5maWVsZCk7XG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSwgaW5mbyk7XG4gIH0sXG5cbiAgLy8gUmVzcG9uZCB0byBhbnkgYWN0aW9ucyBvdGhlciB0aGFuIHZhbHVlIGNoYW5nZXMuIChGb3IgZXhhbXBsZSwgZm9jdXMgYW5kXG4gIC8vIGJsdXIuKVxuICBvbkFjdGlvbjogZnVuY3Rpb24gKGluZm8pIHtcbiAgICBpZiAoIXRoaXMucHJvcHMub25BY3Rpb24pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaW5mbyA9IF8uZXh0ZW5kKHt9LCBpbmZvKTtcbiAgICBpbmZvLnBhdGggPSB0aGlzLnByb3BzLmNvbmZpZy5maWVsZFZhbHVlUGF0aChpbmZvLmZpZWxkKTtcbiAgICB0aGlzLnByb3BzLm9uQWN0aW9uKGluZm8pO1xuICB9LFxuXG4gIC8vIFJlbmRlciB0aGUgcm9vdCBjb21wb25lbnQgYnkgZGVsZWdhdGluZyB0byB0aGUgY29uZmlnLlxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblxuICAgIHJldHVybiBjb25maWcucmVuZGVyRm9ybWF0aWNDb21wb25lbnQodGhpcyk7XG4gIH1cbn0pO1xuXG52YXIgRm9ybWF0aWNDb250cm9sbGVkID0gUmVhY3QuY3JlYXRlRmFjdG9yeShGb3JtYXRpY0NvbnRyb2xsZWRDbGFzcyk7XG5cbi8vIEEgd3JhcHBlciBjb21wb25lbnQgdGhhdCBpcyBhY3R1YWxseSBleHBvcnRlZCBhbmQgY2FuIGFsbG93IGZvcm1hdGljIHRvIGJlXG4vLyB1c2VkIGluIGFuIFwidW5jb250cm9sbGVkXCIgbWFubmVyLiAoU2VlIHVuY29udHJvbGxlZCBjb21wb25lbnRzIGluIHRoZSBSZWFjdFxuLy8gZG9jdW1lbnRhdGlvbiBmb3IgYW4gZXhwbGFuYXRpb24gb2YgdGhlIGRpZmZlcmVuY2UuKVxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgLy8gRXhwb3J0IHNvbWUgc3R1ZmYgYXMgc3RhdGljcy5cbiAgc3RhdGljczoge1xuICAgIGNyZWF0ZUNvbmZpZzogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGFyZ3MgPSBfLnRvQXJyYXkoYXJndW1lbnRzKTtcbiAgICAgIHZhciBjb25maWcgPSBfLmV4dGVuZCh7fSwgZGVmYXVsdENvbmZpZyk7XG5cbiAgICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gY29uZmlnO1xuICAgICAgfVxuICAgICAgdmFyIGNvbmZpZ3MgPSBbY29uZmlnXS5jb25jYXQoYXJncyk7XG4gICAgICByZXR1cm4gY29uZmlncy5yZWR1Y2UoZnVuY3Rpb24gKHByZXYsIGN1cnIpIHtcbiAgICAgICAgaWYgKF8uaXNGdW5jdGlvbihjdXJyKSkge1xuICAgICAgICAgIGN1cnIocHJldik7XG4gICAgICAgICAgcmV0dXJuIHByZXY7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF8uZXh0ZW5kKHByZXYsIGN1cnIpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBhdmFpbGFibGVNaXhpbnM6IHtcbiAgICAgIGNsaWNrT3V0c2lkZTogcmVxdWlyZSgnLi9taXhpbnMvY2xpY2stb3V0c2lkZS5qcycpLFxuICAgICAgZmllbGQ6IHJlcXVpcmUoJy4vbWl4aW5zL2ZpZWxkLmpzJyksXG4gICAgICBoZWxwZXI6IHJlcXVpcmUoJy4vbWl4aW5zL2hlbHBlci5qcycpLFxuICAgICAgcmVzaXplOiByZXF1aXJlKCcuL21peGlucy9yZXNpemUuanMnKSxcbiAgICAgIHNjcm9sbDogcmVxdWlyZSgnLi9taXhpbnMvc2Nyb2xsLmpzJyksXG4gICAgICB1bmRvU3RhY2s6IHJlcXVpcmUoJy4vbWl4aW5zL3VuZG8tc3RhY2suanMnKVxuICAgIH0sXG4gICAgcGx1Z2luczoge1xuICAgICAgYm9vdHN0cmFwOiByZXF1aXJlKCcuL3BsdWdpbnMvYm9vdHN0cmFwJyksXG4gICAgICBtZXRhOiByZXF1aXJlKCcuL3BsdWdpbnMvbWV0YScpLFxuICAgICAgcmVmZXJlbmNlOiByZXF1aXJlKCcuL3BsdWdpbnMvcmVmZXJlbmNlJyksXG4gICAgICBlbGVtZW50Q2xhc3NlczogcmVxdWlyZSgnLi9wbHVnaW5zL2VsZW1lbnQtY2xhc3NlcycpXG4gICAgfSxcbiAgICB1dGlsczogdXRpbHNcbiAgfSxcblxuICBkaXNwbGF5TmFtZTogJ0Zvcm1hdGljJyxcblxuICAvLyBJZiB3ZSBnb3QgYSB2YWx1ZSwgdHJlYXQgdGhpcyBjb21wb25lbnQgYXMgY29udHJvbGxlZC4gRWl0aGVyIHdheSwgcmV0YWluXG4gIC8vIHRoZSB2YWx1ZSBpbiB0aGUgc3RhdGUuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpc0NvbnRyb2xsZWQ6ICFfLmlzVW5kZWZpbmVkKHRoaXMucHJvcHMudmFsdWUpLFxuICAgICAgdmFsdWU6IF8uaXNVbmRlZmluZWQodGhpcy5wcm9wcy52YWx1ZSkgPyB0aGlzLnByb3BzLmRlZmF1bHRWYWx1ZSA6IHRoaXMucHJvcHMudmFsdWVcbiAgICB9O1xuICB9LFxuXG4gIC8vIElmIHRoaXMgaXMgYSBjb250cm9sbGVkIGNvbXBvbmVudCwgY2hhbmdlIG91ciBzdGF0ZSB0byByZWZsZWN0IHRoZSBuZXdcbiAgLy8gdmFsdWUuIEZvciB1bmNvbnRyb2xsZWQgY29tcG9uZW50cywgaWdub3JlIGFueSB2YWx1ZSBjaGFuZ2VzLlxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV3UHJvcHMpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5pc0NvbnRyb2xsZWQpIHtcbiAgICAgIGlmICghXy5pc1VuZGVmaW5lZChuZXdQcm9wcy52YWx1ZSkpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgdmFsdWU6IG5ld1Byb3BzLnZhbHVlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBJZiB0aGlzIGlzIGFuIHVuY29udHJvbGxlZCBjb21wb25lbnQsIHNldCBvdXIgc3RhdGUgdG8gcmVmbGVjdCB0aGUgbmV3XG4gIC8vIHZhbHVlLiBFaXRoZXIgd2F5LCBjYWxsIHRoZSBvbkNoYW5nZSBjYWxsYmFjay5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgaW5mbykge1xuICAgIGlmICghdGhpcy5zdGF0ZS5pc0NvbnRyb2xsZWQpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICB2YWx1ZTogbmV3VmFsdWVcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoIXRoaXMucHJvcHMub25DaGFuZ2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSwgaW5mbyk7XG4gIH0sXG5cbiAgLy8gQW55IGFjdGlvbnMgc2hvdWxkIGJlIHNlbnQgdG8gdGhlIGdlbmVyaWMgb25BY3Rpb24gY2FsbGJhY2sgYnV0IGFsc28gc3BsaXRcbiAgLy8gaW50byBkaXNjcmVldCBjYWxsYmFja3MgcGVyIGFjdGlvbi5cbiAgb25BY3Rpb246IGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgaWYgKHRoaXMucHJvcHMub25BY3Rpb24pIHtcbiAgICAgIHRoaXMucHJvcHMub25BY3Rpb24oaW5mbyk7XG4gICAgfVxuICAgIHZhciBhY3Rpb24gPSB1dGlscy5kYXNoVG9QYXNjYWwoaW5mby5hY3Rpb24pO1xuICAgIGlmICh0aGlzLnByb3BzWydvbicgKyBhY3Rpb25dKSB7XG4gICAgICB0aGlzLnByb3BzWydvbicgKyBhY3Rpb25dKGluZm8pO1xuICAgIH1cbiAgfSxcblxuICAvLyBSZW5kZXIgdGhlIHdyYXBwZXIgY29tcG9uZW50IChieSBqdXN0IGRlbGVnYXRpbmcgdG8gdGhlIG1haW4gY29tcG9uZW50KS5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWcgfHwgZGVmYXVsdENvbmZpZztcbiAgICB2YXIgdmFsdWUgPSB0aGlzLnN0YXRlLnZhbHVlO1xuXG4gICAgaWYgKHRoaXMuc3RhdGUuaXNDb250cm9sbGVkKSB7XG4gICAgICBpZiAoIXRoaXMucHJvcHMub25DaGFuZ2UpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1lvdSBzaG91bGQgc3VwcGx5IGFuIG9uQ2hhbmdlIGhhbmRsZXIgaWYgeW91IHN1cHBseSBhIHZhbHVlLicpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBwcm9wcyA9IHtcbiAgICAgIGNvbmZpZzogY29uZmlnLFxuICAgICAgLy8gQWxsb3cgZmllbGQgdGVtcGxhdGVzIHRvIGJlIHBhc3NlZCBpbiBhcyBgZmllbGRgIG9yIGBmaWVsZHNgLiBBZnRlciB0aGlzLCBzdG9wXG4gICAgICAvLyBjYWxsaW5nIHRoZW0gZmllbGRzLlxuICAgICAgZmllbGRUZW1wbGF0ZTogdGhpcy5wcm9wcy5maWVsZCxcbiAgICAgIGZpZWxkVGVtcGxhdGVzOiB0aGlzLnByb3BzLmZpZWxkcyxcbiAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgb25BY3Rpb246IHRoaXMub25BY3Rpb25cbiAgICB9O1xuXG4gICAgXy5lYWNoKHRoaXMucHJvcHMsIGZ1bmN0aW9uIChwcm9wVmFsdWUsIGtleSkge1xuICAgICAgaWYgKCEoa2V5IGluIHByb3BzKSkge1xuICAgICAgICBwcm9wc1trZXldID0gcHJvcFZhbHVlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIEZvcm1hdGljQ29udHJvbGxlZChwcm9wcyk7XG4gIH1cblxufSk7XG4iLCIvLyAjIGNsaWNrLW91dHNpZGUgbWl4aW5cblxuLypcblRoZXJlJ3Mgbm8gbmF0aXZlIFJlYWN0IHdheSB0byBkZXRlY3QgY2xpY2tpbmcgb3V0c2lkZSBhbiBlbGVtZW50LiBTb21ldGltZXNcbnRoaXMgaXMgdXNlZnVsLCBzbyB0aGF0J3Mgd2hhdCB0aGlzIG1peGluIGRvZXMuIFRvIHVzZSBpdCwgbWl4IGl0IGluIGFuZCB1c2UgaXRcbmZyb20geW91ciBjb21wb25lbnQgbGlrZSB0aGlzOlxuXG5gYGBqc1xubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi5taXhpbnMvY2xpY2stb3V0c2lkZScpXSxcblxuICBvbkNsaWNrT3V0c2lkZTogZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUubG9nKCdjbGlja2VkIG91dHNpZGUhJyk7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNldE9uQ2xpY2tPdXRzaWRlKCdteURpdicsIHRoaXMub25DbGlja091dHNpZGUpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSZWFjdC5ET00uZGl2KHtyZWY6ICdteURpdid9LFxuICAgICAgJ0hlbGxvISdcbiAgICApXG4gIH1cbn0pO1xuYGBgXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gcmVxdWlyZSgndW5kZXJzY29yZScpO1xuXG52YXIgaGFzQW5jZXN0b3IgPSBmdW5jdGlvbiAoY2hpbGQsIHBhcmVudCkge1xuICBpZiAoY2hpbGQucGFyZW50Tm9kZSA9PT0gcGFyZW50KSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgaWYgKGNoaWxkLnBhcmVudE5vZGUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIGhhc0FuY2VzdG9yKGNoaWxkLnBhcmVudE5vZGUsIHBhcmVudCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBpc05vZGVPdXRzaWRlOiBmdW5jdGlvbiAobm9kZU91dCwgbm9kZUluKSB7XG4gICAgaWYgKG5vZGVPdXQgPT09IG5vZGVJbikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoaGFzQW5jZXN0b3Iobm9kZU91dCwgbm9kZUluKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcblxuICBpc05vZGVJbnNpZGU6IGZ1bmN0aW9uIChub2RlSW4sIG5vZGVPdXQpIHtcbiAgICByZXR1cm4gIXRoaXMuaXNOb2RlT3V0c2lkZShub2RlSW4sIG5vZGVPdXQpO1xuICB9LFxuXG4gIF9vbkNsaWNrTW91c2Vkb3duOiBmdW5jdGlvbigpIHtcbiAgICBfLmVhY2godGhpcy5jbGlja091dHNpZGVIYW5kbGVycywgZnVuY3Rpb24gKGZ1bmNzLCByZWYpIHtcbiAgICAgIGlmICh0aGlzLnJlZnNbcmVmXSkge1xuICAgICAgICB0aGlzLl9tb3VzZWRvd25SZWZzW3JlZl0gPSB0cnVlO1xuICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG4gIH0sXG5cbiAgX29uQ2xpY2tNb3VzZXVwOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBfLmVhY2godGhpcy5jbGlja091dHNpZGVIYW5kbGVycywgZnVuY3Rpb24gKGZ1bmNzLCByZWYpIHtcbiAgICAgIGlmICh0aGlzLnJlZnNbcmVmXSAmJiB0aGlzLl9tb3VzZWRvd25SZWZzW3JlZl0pIHtcbiAgICAgICAgaWYgKHRoaXMuaXNOb2RlT3V0c2lkZShldmVudC50YXJnZXQsIHRoaXMucmVmc1tyZWZdLmdldERPTU5vZGUoKSkpIHtcbiAgICAgICAgICBmdW5jcy5mb3JFYWNoKGZ1bmN0aW9uIChmbikge1xuICAgICAgICAgICAgZm4uY2FsbCh0aGlzLCBldmVudCk7XG4gICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5fbW91c2Vkb3duUmVmc1tyZWZdID0gZmFsc2U7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfSxcblxuICBzZXRPbkNsaWNrT3V0c2lkZTogZnVuY3Rpb24gKHJlZiwgZm4pIHtcbiAgICBpZiAoIXRoaXMuY2xpY2tPdXRzaWRlSGFuZGxlcnNbcmVmXSkge1xuICAgICAgdGhpcy5jbGlja091dHNpZGVIYW5kbGVyc1tyZWZdID0gW107XG4gICAgfVxuICAgIHRoaXMuY2xpY2tPdXRzaWRlSGFuZGxlcnNbcmVmXS5wdXNoKGZuKTtcbiAgfSxcblxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuY2xpY2tPdXRzaWRlSGFuZGxlcnMgPSB7fTtcbiAgICB0aGlzLl9kaWRNb3VzZURvd24gPSBmYWxzZTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9vbkNsaWNrTW91c2Vkb3duKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5fb25DbGlja01vdXNldXApO1xuICAgIC8vZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkNsaWNrRG9jdW1lbnQpO1xuICAgIHRoaXMuX21vdXNlZG93blJlZnMgPSB7fTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuY2xpY2tPdXRzaWRlSGFuZGxlcnMgPSB7fTtcbiAgICAvL2RvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fb25DbGlja0RvY3VtZW50KTtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5fb25DbGlja01vdXNldXApO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX29uQ2xpY2tNb3VzZWRvd24pO1xuICB9XG59O1xuIiwiLy8gIyBmaWVsZCBtaXhpblxuXG4vKlxuVGhpcyBtaXhpbiBnZXRzIG1peGVkIGludG8gYWxsIGZpZWxkIGNvbXBvbmVudHMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gcmVxdWlyZSgndW5kZXJzY29yZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICAvLyBTaWduYWwgYSBjaGFuZ2UgaW4gdmFsdWUuXG4gIG9uQ2hhbmdlVmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UodmFsdWUsIHtcbiAgICAgIGZpZWxkOiB0aGlzLnByb3BzLmZpZWxkXG4gICAgfSk7XG4gIH0sXG5cbiAgLy8gQnViYmxlIHVwIGEgdmFsdWUuXG4gIG9uQnViYmxlVmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSwgaW5mbykge1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UodmFsdWUsIGluZm8pO1xuICB9LFxuXG4gIC8vIFN0YXJ0IGFuIGFjdGlvbiBidWJibGluZyB1cCB0aHJvdWdoIHBhcmVudCBjb21wb25lbnRzLlxuICBvblN0YXJ0QWN0aW9uOiBmdW5jdGlvbiAoYWN0aW9uLCBwcm9wcykge1xuICAgIGlmICh0aGlzLnByb3BzLm9uQWN0aW9uKSB7XG4gICAgICB2YXIgaW5mbyA9IF8uZXh0ZW5kKHt9LCBwcm9wcyk7XG4gICAgICBpbmZvLmFjdGlvbiA9IGFjdGlvbjtcbiAgICAgIGluZm8uZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuICAgICAgdGhpcy5wcm9wcy5vbkFjdGlvbihpbmZvKTtcbiAgICB9XG4gIH0sXG5cbiAgb25Gb2N1c0FjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMub25TdGFydEFjdGlvbignZm9jdXMnKTtcbiAgfSxcblxuICBvbkJsdXJBY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLm9uU3RhcnRBY3Rpb24oJ2JsdXInKTtcbiAgfSxcblxuICAvLyBCdWJibGUgdXAgYW4gYWN0aW9uLlxuICBvbkJ1YmJsZUFjdGlvbjogZnVuY3Rpb24gKGluZm8pIHtcbiAgICBpZiAodGhpcy5wcm9wcy5vbkFjdGlvbikge1xuICAgICAgdGhpcy5wcm9wcy5vbkFjdGlvbihpbmZvKTtcbiAgICB9XG4gIH0sXG5cbiAgLy8gRGVsZWdhdGUgcmVuZGVyaW5nIGJhY2sgdG8gY29uZmlnIHNvIGl0IGNhbiBiZSB3cmFwcGVkLlxuICByZW5kZXJXaXRoQ29uZmlnOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMuY29uZmlnLnJlbmRlckZpZWxkQ29tcG9uZW50KHRoaXMpO1xuICB9XG59O1xuIiwiLy8gIyBoZWxwZXIgbWl4aW5cblxuLypcblRoaXMgZ2V0cyBtaXhlZCBpbnRvIGFsbCBoZWxwZXIgY29tcG9uZW50cy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSByZXF1aXJlKCd1bmRlcnNjb3JlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIC8vIERlbGVnYXRlIHJlbmRlcmluZyBiYWNrIHRvIGNvbmZpZyBzbyBpdCBjYW4gYmUgd3JhcHBlZC5cbiAgcmVuZGVyV2l0aENvbmZpZzogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnByb3BzLmNvbmZpZy5yZW5kZXJDb21wb25lbnQodGhpcyk7XG4gIH0sXG5cbiAgLy8gU3RhcnQgYW4gYWN0aW9uIGJ1YmJsaW5nIHVwIHRocm91Z2ggcGFyZW50IGNvbXBvbmVudHMuXG4gIG9uU3RhcnRBY3Rpb246IGZ1bmN0aW9uIChhY3Rpb24sIHByb3BzKSB7XG4gICAgaWYgKHRoaXMucHJvcHMub25BY3Rpb24pIHtcbiAgICAgIHZhciBpbmZvID0gXy5leHRlbmQoe30sIHByb3BzKTtcbiAgICAgIGluZm8uYWN0aW9uID0gYWN0aW9uO1xuICAgICAgaW5mby5maWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG4gICAgICB0aGlzLnByb3BzLm9uQWN0aW9uKGluZm8pO1xuICAgIH1cbiAgfSxcblxuICAvLyBCdWJibGUgdXAgYW4gYWN0aW9uLlxuICBvbkJ1YmJsZUFjdGlvbjogZnVuY3Rpb24gKGluZm8pIHtcbiAgICBpZiAodGhpcy5wcm9wcy5vbkFjdGlvbikge1xuICAgICAgdGhpcy5wcm9wcy5vbkFjdGlvbihpbmZvKTtcbiAgICB9XG4gIH0sXG5cbiAgb25Gb2N1c0FjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMub25TdGFydEFjdGlvbignZm9jdXMnKTtcbiAgfSxcblxuICBvbkJsdXJBY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLm9uU3RhcnRBY3Rpb24oJ2JsdXInKTtcbiAgfVxufTtcbiIsIi8vICMgcmVzaXplIG1peGluXG5cbi8qXG5Zb3UnZCB0aGluayBpdCB3b3VsZCBiZSBwcmV0dHkgZWFzeSB0byBkZXRlY3Qgd2hlbiBhIERPTSBlbGVtZW50IGlzIHJlc2l6ZWQuXG5BbmQgeW91J2QgYmUgd3JvbmcuIFRoZXJlIGFyZSB2YXJpb3VzIHRyaWNrcywgYnV0IG5vbmUgb2YgdGhlbSB3b3JrIHZlcnkgd2VsbC5cblNvLCB1c2luZyBnb29kIG9sJyBwb2xsaW5nIGhlcmUuIFRvIHRyeSB0byBiZSBhcyBlZmZpY2llbnQgYXMgcG9zc2libGUsIHRoZXJlXG5pcyBvbmx5IGEgc2luZ2xlIHNldEludGVydmFsIHVzZWQgZm9yIGFsbCBlbGVtZW50cy4gVG8gdXNlOlxuXG5gYGBqc1xubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL3Jlc2l6ZScpXSxcblxuICBvblJlc2l6ZTogZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUubG9nKCdyZXNpemVkIScpO1xuICB9LFxuXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zZXRPblJlc2l6ZSgnbXlUZXh0JywgdGhpcy5vblJlc2l6ZSk7XG4gIH0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICAuLi5cbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUmVhY3QuRE9NLnRleHRhcmVhKHtyZWY6ICdteVRleHQnLCB2YWx1ZTogdGhpcy5wcm9wcy52YWx1ZSwgb25DaGFuZ2U6IC4uLn0pXG4gIH1cbn0pO1xuYGBgXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBpZCA9IDA7XG5cbnZhciByZXNpemVJbnRlcnZhbEVsZW1lbnRzID0ge307XG52YXIgcmVzaXplSW50ZXJ2YWxFbGVtZW50c0NvdW50ID0gMDtcbnZhciByZXNpemVJbnRlcnZhbFRpbWVyID0gbnVsbDtcblxudmFyIGNoZWNrRWxlbWVudHMgPSBmdW5jdGlvbiAoKSB7XG4gIE9iamVjdC5rZXlzKHJlc2l6ZUludGVydmFsRWxlbWVudHMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIHZhciBlbGVtZW50ID0gcmVzaXplSW50ZXJ2YWxFbGVtZW50c1trZXldO1xuICAgIGlmIChlbGVtZW50LmNsaWVudFdpZHRoICE9PSBlbGVtZW50Ll9fcHJldkNsaWVudFdpZHRoIHx8IGVsZW1lbnQuY2xpZW50SGVpZ2h0ICE9PSBlbGVtZW50Ll9fcHJldkNsaWVudEhlaWdodCkge1xuICAgICAgZWxlbWVudC5fX3ByZXZDbGllbnRXaWR0aCA9IGVsZW1lbnQuY2xpZW50V2lkdGg7XG4gICAgICBlbGVtZW50Ll9fcHJldkNsaWVudEhlaWdodCA9IGVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgICAgdmFyIGhhbmRsZXJzID0gZWxlbWVudC5fX3Jlc2l6ZUhhbmRsZXJzO1xuICAgICAgaGFuZGxlcnMuZm9yRWFjaChmdW5jdGlvbiAoaGFuZGxlcikge1xuICAgICAgICBoYW5kbGVyKCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sIDEwMCk7XG59O1xuXG52YXIgYWRkUmVzaXplSW50ZXJ2YWxIYW5kbGVyID0gZnVuY3Rpb24gKGVsZW1lbnQsIGZuKSB7XG4gIGlmIChyZXNpemVJbnRlcnZhbFRpbWVyID09PSBudWxsKSB7XG4gICAgcmVzaXplSW50ZXJ2YWxUaW1lciA9IHNldEludGVydmFsKGNoZWNrRWxlbWVudHMsIDEwMCk7XG4gIH1cbiAgaWYgKCEoJ19fcmVzaXplSWQnIGluIGVsZW1lbnQpKSB7XG4gICAgaWQrKztcbiAgICBlbGVtZW50Ll9fcHJldkNsaWVudFdpZHRoID0gZWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICBlbGVtZW50Ll9fcHJldkNsaWVudEhlaWdodCA9IGVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgIGVsZW1lbnQuX19yZXNpemVJZCA9IGlkO1xuICAgIHJlc2l6ZUludGVydmFsRWxlbWVudHNDb3VudCsrO1xuICAgIHJlc2l6ZUludGVydmFsRWxlbWVudHNbaWRdID0gZWxlbWVudDtcbiAgICBlbGVtZW50Ll9fcmVzaXplSGFuZGxlcnMgPSBbXTtcbiAgfVxuICBlbGVtZW50Ll9fcmVzaXplSGFuZGxlcnMucHVzaChmbik7XG59O1xuXG52YXIgcmVtb3ZlUmVzaXplSW50ZXJ2YWxIYW5kbGVycyA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIGlmICghKCdfX3Jlc2l6ZUlkJyBpbiBlbGVtZW50KSkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgcmVzaXplSWQgPSBlbGVtZW50Ll9fcmVzaXplSWQ7XG4gIGRlbGV0ZSBlbGVtZW50Ll9fcmVzaXplSWQ7XG4gIGRlbGV0ZSBlbGVtZW50Ll9fcmVzaXplSGFuZGxlcnM7XG4gIGRlbGV0ZSByZXNpemVJbnRlcnZhbEVsZW1lbnRzW3Jlc2l6ZUlkXTtcbiAgcmVzaXplSW50ZXJ2YWxFbGVtZW50c0NvdW50LS07XG4gIGlmIChyZXNpemVJbnRlcnZhbEVsZW1lbnRzQ291bnQgPCAxKSB7XG4gICAgY2xlYXJJbnRlcnZhbChyZXNpemVJbnRlcnZhbFRpbWVyKTtcbiAgICByZXNpemVJbnRlcnZhbFRpbWVyID0gbnVsbDtcbiAgfVxufTtcblxudmFyIG9uUmVzaXplID0gZnVuY3Rpb24gKHJlZiwgZm4pIHtcbiAgZm4ocmVmKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMub25SZXNpemVXaW5kb3cpIHtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLm9uUmVzaXplV2luZG93KTtcbiAgICB9XG4gICAgdGhpcy5yZXNpemVFbGVtZW50UmVmcyA9IHt9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMub25SZXNpemVXaW5kb3cpIHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLm9uUmVzaXplV2luZG93KTtcbiAgICB9XG4gICAgT2JqZWN0LmtleXModGhpcy5yZXNpemVFbGVtZW50UmVmcykuZm9yRWFjaChmdW5jdGlvbiAocmVmKSB7XG4gICAgICByZW1vdmVSZXNpemVJbnRlcnZhbEhhbmRsZXJzKHRoaXMucmVmc1tyZWZdLmdldERPTU5vZGUoKSk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfSxcblxuICBzZXRPblJlc2l6ZTogZnVuY3Rpb24gKHJlZiwgZm4pIHtcbiAgICBpZiAoIXRoaXMucmVzaXplRWxlbWVudFJlZnNbcmVmXSkge1xuICAgICAgdGhpcy5yZXNpemVFbGVtZW50UmVmc1tyZWZdID0gdHJ1ZTtcbiAgICB9XG4gICAgYWRkUmVzaXplSW50ZXJ2YWxIYW5kbGVyKHRoaXMucmVmc1tyZWZdLmdldERPTU5vZGUoKSwgb25SZXNpemUuYmluZCh0aGlzLCByZWYsIGZuKSk7XG4gIH1cbn07XG4iLCIvLyAjIHNjcm9sbCBtaXhpblxuXG4vKlxuQ3VycmVudGx5IHVudXNlZC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSB7XG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMub25TY3JvbGxXaW5kb3cpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHRoaXMub25TY3JvbGxXaW5kb3cpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMub25TY3JvbGxXaW5kb3cpIHtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHRoaXMub25TY3JvbGxXaW5kb3cpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn07XG4iLCIvLyAjIHVuZG8tc3RhY2sgbWl4aW5cblxuLypcbkdpdmVzIHlvdXIgY29tcG9uZW50IGFuIHVuZG8gc3RhY2suXG4qL1xuXG4vLyBodHRwOi8vcHJvbWV0aGV1c3Jlc2VhcmNoLmdpdGh1Yi5pby9yZWFjdC1mb3Jtcy9leGFtcGxlcy91bmRvLmh0bWxcblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge3VuZG86IFtdLCByZWRvOiBbXX07XG4gIH0sXG5cbiAgc25hcHNob3Q6IGZ1bmN0aW9uKCkge1xuICAgIHZhciB1bmRvID0gdGhpcy5zdGF0ZS51bmRvLmNvbmNhdCh0aGlzLmdldFN0YXRlU25hcHNob3QoKSk7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnN0YXRlLnVuZG9EZXB0aCA9PT0gJ251bWJlcicpIHtcbiAgICAgIGlmICh1bmRvLmxlbmd0aCA+IHRoaXMuc3RhdGUudW5kb0RlcHRoKSB7XG4gICAgICAgIHVuZG8uc2hpZnQoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5zZXRTdGF0ZSh7dW5kbzogdW5kbywgcmVkbzogW119KTtcbiAgfSxcblxuICBoYXNVbmRvOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS51bmRvLmxlbmd0aCA+IDA7XG4gIH0sXG5cbiAgaGFzUmVkbzogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUucmVkby5sZW5ndGggPiAwO1xuICB9LFxuXG4gIHJlZG86IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3VuZG9JbXBsKHRydWUpO1xuICB9LFxuXG4gIHVuZG86IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3VuZG9JbXBsKCk7XG4gIH0sXG5cbiAgX3VuZG9JbXBsOiBmdW5jdGlvbihpc1JlZG8pIHtcbiAgICB2YXIgdW5kbyA9IHRoaXMuc3RhdGUudW5kby5zbGljZSgwKTtcbiAgICB2YXIgcmVkbyA9IHRoaXMuc3RhdGUucmVkby5zbGljZSgwKTtcbiAgICB2YXIgc25hcHNob3Q7XG5cbiAgICBpZiAoaXNSZWRvKSB7XG4gICAgICBpZiAocmVkby5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgc25hcHNob3QgPSByZWRvLnBvcCgpO1xuICAgICAgdW5kby5wdXNoKHRoaXMuZ2V0U3RhdGVTbmFwc2hvdCgpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHVuZG8ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHNuYXBzaG90ID0gdW5kby5wb3AoKTtcbiAgICAgIHJlZG8ucHVzaCh0aGlzLmdldFN0YXRlU25hcHNob3QoKSk7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZVNuYXBzaG90KHNuYXBzaG90KTtcbiAgICB0aGlzLnNldFN0YXRlKHt1bmRvOiB1bmRvLCByZWRvOiByZWRvfSk7XG4gIH1cbn07XG4iLCIvLyAjIGJvb3RzdHJhcCBwbHVnaW5cblxuLypcblRoZSBib290c3RyYXAgcGx1Z2luIHNuZWFrcyBpbiBzb21lIGNsYXNzZXMgdG8gZWxlbWVudHMgc28gdGhhdCBpdCBwbGF5cyB3ZWxsXG53aXRoIFR3aXR0ZXIgQm9vdHN0cmFwLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUnKTtcblxuLy8gRGVjbGFyZSBzb21lIGNsYXNzZXMgYW5kIGxhYmVscyBmb3IgZWFjaCBlbGVtZW50LlxudmFyIG1vZGlmaWVycyA9IHtcblxuICAnRmllbGQnOiB7Y2xhc3Nlczogeydmb3JtLWdyb3VwJzogdHJ1ZX19LFxuICAnSGVscCc6IHtjbGFzc2VzOiB7J2hlbHAtYmxvY2snOiB0cnVlfX0sXG4gICdTYW1wbGUnOiB7Y2xhc3NlczogeydoZWxwLWJsb2NrJzogdHJ1ZX19LFxuICAnQXJyYXlDb250cm9sJzoge2NsYXNzZXM6IHsnZm9ybS1pbmxpbmUnOiB0cnVlfX0sXG4gICdBcnJheUl0ZW0nOiB7Y2xhc3Nlczogeyd3ZWxsJzogdHJ1ZX19LFxuICAnT2JqZWN0SXRlbSc6IHtjbGFzc2VzOiB7J3dlbGwnOiB0cnVlfX0sXG4gICdGaWVsZFRlbXBsYXRlQ2hvaWNlcyc6IHtjbGFzc2VzOiB7J2Zvcm0tY29udHJvbCc6IHRydWV9fSxcbiAgJ0FkZEl0ZW0nOiB7Y2xhc3NlczogeydnbHlwaGljb24gZ2x5cGhpY29uLXBsdXMnOiB0cnVlfSwgbGFiZWw6ICcnfSxcbiAgJ1JlbW92ZUl0ZW0nOiB7Y2xhc3NlczogeydnbHlwaGljb24gZ2x5cGhpY29uLXJlbW92ZSc6IHRydWV9LCBsYWJlbDogJyd9LFxuICAnTW92ZUl0ZW1CYWNrJzoge2NsYXNzZXM6IHsnZ2x5cGhpY29uIGdseXBoaWNvbi1hcnJvdy11cCc6IHRydWV9LCBsYWJlbDogJyd9LFxuICAnTW92ZUl0ZW1Gb3J3YXJkJzoge2NsYXNzZXM6IHsnZ2x5cGhpY29uIGdseXBoaWNvbi1hcnJvdy1kb3duJzogdHJ1ZX0sIGxhYmVsOiAnJ30sXG4gICdPYmplY3RJdGVtS2V5Jzoge2NsYXNzZXM6IHsnZm9ybS1jb250cm9sJzogdHJ1ZX19LFxuXG4gICdTaW5nbGVMaW5lU3RyaW5nJzoge2NsYXNzZXM6IHsnZm9ybS1jb250cm9sJzogdHJ1ZX19LFxuICAnU3RyaW5nJzoge2NsYXNzZXM6IHsnZm9ybS1jb250cm9sJzogdHJ1ZX19LFxuICAnUHJldHR5VGV4dCc6IHtjbGFzc2VzOiB7J2Zvcm0tY29udHJvbCc6IHRydWV9fSxcbiAgJ0pzb24nOiB7Y2xhc3Nlczogeydmb3JtLWNvbnRyb2wnOiB0cnVlfX0sXG4gICdTZWxlY3RWYWx1ZSc6IHtjbGFzc2VzOiB7J2Zvcm0tY29udHJvbCc6IHRydWV9fVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgdmFyIGRlZmF1bHRDcmVhdGVFbGVtZW50ID0gY29uZmlnLmNyZWF0ZUVsZW1lbnQ7XG5cbiAgLy8gV3JhcCB0aGUgY3JlYXRlRWxlbWVudCBtZXRob2QuXG4gIGNvbmZpZy5jcmVhdGVFbGVtZW50ID0gZnVuY3Rpb24gKG5hbWUsIHByb3BzLCBjaGlsZHJlbikge1xuXG4gICAgbmFtZSA9IGNvbmZpZy5lbGVtZW50TmFtZShuYW1lKTtcblxuICAgIHZhciBtb2RpZmllciA9IG1vZGlmaWVyc1tuYW1lXTtcblxuICAgIGlmIChtb2RpZmllcikge1xuICAgICAgLy8gSWYgdGhlcmUgaXMgYSBtb2RpZmllciBmb3IgdGhpcyBlbGVtZW50LCBhZGQgdGhlIGNsYXNzZXMgYW5kIGxhYmVsLlxuICAgICAgcHJvcHMgPSBfLmV4dGVuZCh7fSwgcHJvcHMpO1xuICAgICAgcHJvcHMuY2xhc3NlcyA9IF8uZXh0ZW5kKHt9LCBwcm9wcy5jbGFzc2VzLCBtb2RpZmllci5jbGFzc2VzKTtcbiAgICAgIGlmICgnbGFiZWwnIGluIG1vZGlmaWVyKSB7XG4gICAgICAgIHByb3BzLmxhYmVsID0gbW9kaWZpZXIubGFiZWw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRlZmF1bHRDcmVhdGVFbGVtZW50LmNhbGwodGhpcywgbmFtZSwgcHJvcHMsIGNoaWxkcmVuKTtcbiAgfTtcbn07XG4iLCIvLyAjIGVsZW1lbnQtY2xhc3NlcyBwbHVnaW5cblxuLypcblRoaXMgcGx1Z2lucyBwcm92aWRlcyBhIGNvbmZpZyBtZXRob2QgYWRkRWxlbWVudENsYXNzIHRoYXQgbGV0cyB5b3UgYWRkIG9uIGFcbmNsYXNzIHRvIGFuIGVsZW1lbnQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gcmVxdWlyZSgndW5kZXJzY29yZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjb25maWcpIHtcblxuICB2YXIgZGVmYXVsdENyZWF0ZUVsZW1lbnQgPSBjb25maWcuY3JlYXRlRWxlbWVudDtcblxuICB2YXIgZWxlbWVudENsYXNzZXMgPSB7fTtcblxuICBjb25maWcuYWRkRWxlbWVudENsYXNzID0gZnVuY3Rpb24gKG5hbWUsIGNsYXNzTmFtZSkge1xuXG4gICAgbmFtZSA9IGNvbmZpZy5lbGVtZW50TmFtZShuYW1lKTtcblxuICAgIGlmICghZWxlbWVudENsYXNzZXNbbmFtZV0pIHtcbiAgICAgIGVsZW1lbnRDbGFzc2VzW25hbWVdID0ge307XG4gICAgfVxuXG4gICAgZWxlbWVudENsYXNzZXNbbmFtZV1bY2xhc3NOYW1lXSA9IHRydWU7XG4gIH07XG5cbiAgLy8gV3JhcCB0aGUgY3JlYXRlRWxlbWVudCBtZXRob2QuXG4gIGNvbmZpZy5jcmVhdGVFbGVtZW50ID0gZnVuY3Rpb24gKG5hbWUsIHByb3BzLCBjaGlsZHJlbikge1xuXG4gICAgbmFtZSA9IGNvbmZpZy5lbGVtZW50TmFtZShuYW1lKTtcblxuICAgIGlmIChlbGVtZW50Q2xhc3Nlc1tuYW1lXSkge1xuICAgICAgcHJvcHMgPSBfLmV4dGVuZCh7fSwgcHJvcHMsIHtjbGFzc2VzOiBlbGVtZW50Q2xhc3Nlc1tuYW1lXX0pO1xuICAgIH1cblxuICAgIHJldHVybiBkZWZhdWx0Q3JlYXRlRWxlbWVudC5jYWxsKHRoaXMsIG5hbWUsIHByb3BzLCBjaGlsZHJlbik7XG4gIH07XG59O1xuIiwiLy8gIyBtZXRhIHBsdWdpblxuXG4vKlxuVGhlIG1ldGEgcGx1Z2luIGxldHMgeW91IHBhc3MgaW4gYSBtZXRhIHByb3AgdG8gZm9ybWF0aWMuIFRoZSBwcm9wIHRoZW4gZ2V0c1xucGFzc2VkIHRocm91Z2ggYXMgYSBwcm9wZXJ0eSBmb3IgZXZlcnkgZmllbGQuIFlvdSBjYW4gdGhlbiB3cmFwIGBpbml0RmllbGRgIHRvXG5nZXQgeW91ciBtZXRhIHZhbHVlcy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY2ZnKSB7XG5cbiAgdmFyIGluaXRSb290RmllbGQgPSBjZmcuaW5pdFJvb3RGaWVsZDtcblxuICBjZmcuaW5pdFJvb3RGaWVsZCA9IGZ1bmN0aW9uIChmaWVsZCwgcHJvcHMpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcztcblxuICAgIGZpZWxkLm1ldGEgPSBwcm9wcy5tZXRhIHx8IHt9O1xuXG4gICAgaW5pdFJvb3RGaWVsZC5hcHBseShjb25maWcsIGFyZ3VtZW50cyk7XG4gIH07XG5cbiAgdmFyIGluaXRGaWVsZCA9IGNmZy5pbml0RmllbGQ7XG5cbiAgY2ZnLmluaXRGaWVsZCA9IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzO1xuXG4gICAgaWYgKGZpZWxkLnBhcmVudCAmJiBmaWVsZC5wYXJlbnQubWV0YSkge1xuICAgICAgZmllbGQubWV0YSA9IGZpZWxkLnBhcmVudC5tZXRhO1xuICAgIH1cblxuICAgIGluaXRGaWVsZC5hcHBseShjb25maWcsIGFyZ3VtZW50cyk7XG4gIH07XG5cbn07XG4iLCIvLyAjIHJlZmVyZW5jZSBwbHVnaW5cblxuLypcblRoaXMgcGx1Z2luIGFsbG93cyBmaWVsZHMgdG8gYmUgc3RyaW5ncyBhbmQgcmVmZXJlbmNlIG90aGVyIGZpZWxkcyBieSBrZXkgb3JcbmlkLiBJdCBhbHNvIGFsbG93cyBhIGZpZWxkIHRvIGV4dGVuZCBhbm90aGVyIGZpZWxkIHdpdGhcbmV4dGVuZHM6IFsnZm9vJywgJ2JhciddIHdoZXJlICdmb28nIGFuZCAnYmFyJyByZWZlciB0byBvdGhlciBrZXlzIG9yIGlkcy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSByZXF1aXJlKCd1bmRlcnNjb3JlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNmZykge1xuXG4gIHZhciBpbml0RmllbGQgPSBjZmcuaW5pdEZpZWxkO1xuXG4gIC8vIExvb2sgZm9yIGEgdGVtcGxhdGUgaW4gdGhpcyBmaWVsZCBvciBhbnkgb2YgaXRzIHBhcmVudHMuXG4gIGNmZy5maW5kRmllbGRUZW1wbGF0ZSA9IGZ1bmN0aW9uIChmaWVsZCwgbmFtZSkge1xuICAgIHZhciBjb25maWcgPSB0aGlzO1xuXG4gICAgaWYgKGZpZWxkLnRlbXBsYXRlc1tuYW1lXSkge1xuICAgICAgcmV0dXJuIGZpZWxkLnRlbXBsYXRlc1tuYW1lXTtcbiAgICB9XG5cbiAgICBpZiAoZmllbGQucGFyZW50KSB7XG4gICAgICByZXR1cm4gY29uZmlnLmZpbmRGaWVsZFRlbXBsYXRlKGZpZWxkLnBhcmVudCwgbmFtZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG5cbiAgLy8gSW5oZXJpdCBmcm9tIGFueSBmaWVsZCB0ZW1wbGF0ZXMgdGhhdCB0aGlzIGZpZWxkIHRlbXBsYXRlXG4gIC8vIGV4dGVuZHMuXG4gIGNmZy5yZXNvbHZlRmllbGRUZW1wbGF0ZSA9IGZ1bmN0aW9uIChmaWVsZCwgZmllbGRUZW1wbGF0ZSkge1xuICAgIHZhciBjb25maWcgPSB0aGlzO1xuXG4gICAgaWYgKCFmaWVsZFRlbXBsYXRlLmV4dGVuZHMpIHtcbiAgICAgIHJldHVybiBmaWVsZFRlbXBsYXRlO1xuICAgIH1cblxuICAgIHZhciBleHQgPSBmaWVsZFRlbXBsYXRlLmV4dGVuZHM7XG5cbiAgICBpZiAoIV8uaXNBcnJheShleHQpKSB7XG4gICAgICBleHQgPSBbZXh0XTtcbiAgICB9XG5cbiAgICB2YXIgYmFzZXMgPSBleHQubWFwKGZ1bmN0aW9uIChiYXNlKSB7XG4gICAgICB2YXIgdGVtcGxhdGUgPSBjb25maWcuZmluZEZpZWxkVGVtcGxhdGUoZmllbGQsIGJhc2UpO1xuICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RlbXBsYXRlICcgKyBiYXNlICsgJyBub3QgZm91bmQuJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGVtcGxhdGU7XG4gICAgfSk7XG5cbiAgICB2YXIgY2hhaW4gPSBbe31dLmNvbmNhdChiYXNlcy5yZXZlcnNlKCkuY29uY2F0KFtmaWVsZFRlbXBsYXRlXSkpO1xuICAgIGZpZWxkVGVtcGxhdGUgPSBfLmV4dGVuZC5hcHBseShfLCBjaGFpbik7XG5cbiAgICByZXR1cm4gZmllbGRUZW1wbGF0ZTtcbiAgfTtcblxuICAvLyBXcmFwIHRoZSBpbml0RmllbGQgbWV0aG9kLlxuICBjZmcuaW5pdEZpZWxkID0gZnVuY3Rpb24gKGZpZWxkKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcztcblxuICAgIHZhciB0ZW1wbGF0ZXMgPSBmaWVsZC50ZW1wbGF0ZXMgPSB7fTtcblxuICAgIHZhciBjaGlsZEZpZWxkVGVtcGxhdGVzID0gY29uZmlnLmZpZWxkQ2hpbGRGaWVsZFRlbXBsYXRlcyhmaWVsZCk7XG5cbiAgICAvLyBBZGQgZWFjaCBvZiB0aGUgY2hpbGQgZmllbGQgdGVtcGxhdGVzIHRvIG91ciB0ZW1wbGF0ZSBtYXAuXG4gICAgY2hpbGRGaWVsZFRlbXBsYXRlcy5mb3JFYWNoKGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG5cbiAgICAgIGlmIChfLmlzU3RyaW5nKGZpZWxkVGVtcGxhdGUpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIGtleSA9IGZpZWxkVGVtcGxhdGUua2V5O1xuICAgICAgdmFyIGlkID0gZmllbGRUZW1wbGF0ZS5pZDtcblxuICAgICAgaWYgKGZpZWxkVGVtcGxhdGUudGVtcGxhdGUpIHtcbiAgICAgICAgZmllbGRUZW1wbGF0ZSA9IF8uZXh0ZW5kKHt9LCBmaWVsZFRlbXBsYXRlLCB7dGVtcGxhdGU6IGZhbHNlfSk7XG4gICAgICB9XG5cbiAgICAgIGlmICghXy5pc1VuZGVmaW5lZChrZXkpICYmIGtleSAhPT0gJycpIHtcbiAgICAgICAgdGVtcGxhdGVzW2tleV0gPSBmaWVsZFRlbXBsYXRlO1xuICAgICAgfVxuXG4gICAgICBpZiAoIV8uaXNVbmRlZmluZWQoaWQpICYmIGlkICE9PSAnJykge1xuICAgICAgICB0ZW1wbGF0ZXNbaWRdID0gZmllbGRUZW1wbGF0ZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFJlc29sdmUgYW55IHJlZmVyZW5jZXMgdG8gb3RoZXIgZmllbGQgdGVtcGxhdGVzLlxuICAgIGlmIChjaGlsZEZpZWxkVGVtcGxhdGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGZpZWxkLmZpZWxkcyA9IGNoaWxkRmllbGRUZW1wbGF0ZXMubWFwKGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgICAgIGlmIChfLmlzU3RyaW5nKGZpZWxkVGVtcGxhdGUpKSB7XG4gICAgICAgICAgZmllbGRUZW1wbGF0ZSA9IGNvbmZpZy5maW5kRmllbGRUZW1wbGF0ZShmaWVsZCwgZmllbGRUZW1wbGF0ZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY29uZmlnLnJlc29sdmVGaWVsZFRlbXBsYXRlKGZpZWxkLCBmaWVsZFRlbXBsYXRlKTtcbiAgICAgIH0pO1xuXG4gICAgICBmaWVsZC5maWVsZHMgPSBmaWVsZC5maWVsZHMuZmlsdGVyKGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgICAgIHJldHVybiAhZmllbGRUZW1wbGF0ZS50ZW1wbGF0ZTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHZhciBpdGVtRmllbGRUZW1wbGF0ZXMgPSBjb25maWcuZmllbGRJdGVtRmllbGRUZW1wbGF0ZXMoZmllbGQpO1xuXG4gICAgLy8gUmVzb2x2ZSBhbnkgb2Ygb3VyIGl0ZW0gZmllbGQgdGVtcGxhdGVzLiAoRmllbGQgdGVtcGxhdGVzIGZvciBkeW5hbWljXG4gICAgLy8gY2hpbGQgZmllbGRzLilcbiAgICBpZiAoaXRlbUZpZWxkVGVtcGxhdGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGZpZWxkLml0ZW1GaWVsZHMgPSBpdGVtRmllbGRUZW1wbGF0ZXMubWFwKGZ1bmN0aW9uIChpdGVtRmllbGRUZW1wbGF0ZSkge1xuICAgICAgICBpZiAoXy5pc1N0cmluZyhpdGVtRmllbGRUZW1wbGF0ZSkpIHtcbiAgICAgICAgICBpdGVtRmllbGRUZW1wbGF0ZSA9IGNvbmZpZy5maW5kRmllbGRUZW1wbGF0ZShmaWVsZCwgaXRlbUZpZWxkVGVtcGxhdGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNvbmZpZy5yZXNvbHZlRmllbGRUZW1wbGF0ZShmaWVsZCwgaXRlbUZpZWxkVGVtcGxhdGUpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaW5pdEZpZWxkLmNhbGwoY29uZmlnLCBhcmd1bWVudHMpO1xuICB9O1xuXG59O1xuIiwiLy8gIyB1dGlsc1xuXG4vKlxuSnVzdCBzb21lIHNoYXJlZCB1dGlsaXR5IGZ1bmN0aW9ucy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSByZXF1aXJlKCd1bmRlcnNjb3JlJyk7XG5cbnZhciB1dGlscyA9IGV4cG9ydHM7XG5cbi8vIENvcHkgb2JqIHJlY3Vyc2luZyBkZWVwbHkuXG51dGlscy5kZWVwQ29weSA9IGZ1bmN0aW9uIChvYmopIHtcbiAgaWYgKF8uaXNBcnJheShvYmopKSB7XG4gICAgcmV0dXJuIG9iai5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHJldHVybiB1dGlscy5kZWVwQ29weShpdGVtKTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmIChfLmlzRnVuY3Rpb24ob2JqKSkge1xuICAgIHJldHVybiBvYmo7XG4gIH0gZWxzZSBpZiAoXy5pc051bGwob2JqKSkge1xuICAgIHJldHVybiBvYmo7XG4gIH0gZWxzZSBpZiAoXy5pc09iamVjdChvYmopKSB7XG4gICAgdmFyIGNvcHkgPSB7fTtcbiAgICBfLmVhY2gob2JqLCBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgY29weVtrZXldID0gdXRpbHMuZGVlcENvcHkodmFsdWUpO1xuICAgIH0pO1xuICAgIHJldHVybiBjb3B5O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBvYmo7XG4gIH1cbn07XG5cbi8vIENhY2hlIGZvciBzdHJpbmdzIGNvbnZlcnRlZCB0byBQYXNjYWwgQ2FzZS4gVGhpcyBzaG91bGQgYmUgYSBmaW5pdGUgbGlzdCwgc29cbi8vIG5vdCBtdWNoIGZlYXIgdGhhdCB3ZSB3aWxsIHJ1biBvdXQgb2YgbWVtb3J5LlxudmFyIGRhc2hUb1Bhc2NhbENhY2hlID0ge307XG5cbi8vIENvbnZlcnQgZm9vLWJhciB0byBGb29CYXIuXG51dGlscy5kYXNoVG9QYXNjYWwgPSBmdW5jdGlvbiAocykge1xuICBpZiAocyA9PT0gJycpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbiAgaWYgKCFkYXNoVG9QYXNjYWxDYWNoZVtzXSkge1xuICAgIGRhc2hUb1Bhc2NhbENhY2hlW3NdID0gcy5zcGxpdCgnLScpLm1hcChmdW5jdGlvbiAocGFydCkge1xuICAgICAgcmV0dXJuIHBhcnRbMF0udG9VcHBlckNhc2UoKSArIHBhcnQuc3Vic3RyaW5nKDEpO1xuICAgIH0pLmpvaW4oJycpO1xuICB9XG4gIHJldHVybiBkYXNoVG9QYXNjYWxDYWNoZVtzXTtcbn07XG5cbi8vIENvcHkgYWxsIGNvbXB1dGVkIHN0eWxlcyBmcm9tIG9uZSBET00gZWxlbWVudCB0byBhbm90aGVyLlxudXRpbHMuY29weUVsZW1lbnRTdHlsZSA9IGZ1bmN0aW9uIChmcm9tRWxlbWVudCwgdG9FbGVtZW50KSB7XG4gIHZhciBmcm9tU3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShmcm9tRWxlbWVudCwgJycpO1xuXG4gIGlmIChmcm9tU3R5bGUuY3NzVGV4dCAhPT0gJycpIHtcbiAgICB0b0VsZW1lbnQuc3R5bGUuY3NzVGV4dCA9IGZyb21TdHlsZS5jc3NUZXh0O1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBjc3NSdWxlcyA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGZyb21TdHlsZS5sZW5ndGg7IGkrKykge1xuICAgIGNzc1J1bGVzLnB1c2goZnJvbVN0eWxlW2ldICsgJzonICsgZnJvbVN0eWxlLmdldFByb3BlcnR5VmFsdWUoZnJvbVN0eWxlW2ldKSArICc7Jyk7XG4gIH1cbiAgdmFyIGNzc1RleHQgPSBjc3NSdWxlcy5qb2luKCcnKTtcblxuICB0b0VsZW1lbnQuc3R5bGUuY3NzVGV4dCA9IGNzc1RleHQ7XG59O1xuXG4vLyBPYmplY3QgdG8gaG9sZCBicm93c2VyIHNuaWZmaW5nIGluZm8uXG52YXIgYnJvd3NlciA9IHtcbiAgaXNDaHJvbWU6IGZhbHNlLFxuICBpc01vemlsbGE6IGZhbHNlLFxuICBpc09wZXJhOiBmYWxzZSxcbiAgaXNJZTogZmFsc2UsXG4gIGlzU2FmYXJpOiBmYWxzZSxcbiAgaXNVbmtub3duOiBmYWxzZVxufTtcblxuLy8gU25pZmYgdGhlIGJyb3dzZXIuXG52YXIgdWEgPSAnJztcblxuaWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnKSB7XG4gIHVhID0gbmF2aWdhdG9yLnVzZXJBZ2VudDtcbn1cblxuaWYodWEuaW5kZXhPZignQ2hyb21lJykgPiAtMSkge1xuICBicm93c2VyLmlzQ2hyb21lID0gdHJ1ZTtcbn0gZWxzZSBpZiAodWEuaW5kZXhPZignU2FmYXJpJykgPiAtMSkge1xuICBicm93c2VyLmlzU2FmYXJpID0gdHJ1ZTtcbn0gZWxzZSBpZiAodWEuaW5kZXhPZignT3BlcmEnKSA+IC0xKSB7XG4gIGJyb3dzZXIuaXNPcGVyYSA9IHRydWU7XG59IGVsc2UgaWYgKHVhLmluZGV4T2YoJ0ZpcmVmb3gnKSA+IC0xKSB7XG4gIGJyb3dzZXIuaXNNb3ppbGxhID0gdHJ1ZTtcbn0gZWxzZSBpZiAodWEuaW5kZXhPZignTVNJRScpID4gLTEpIHtcbiAgYnJvd3Nlci5pc0llID0gdHJ1ZTtcbn0gZWxzZSB7XG4gIGJyb3dzZXIuaXNVbmtub3duID0gdHJ1ZTtcbn1cblxuLy8gRXhwb3J0IHNuaWZmZWQgYnJvd3NlciBpbmZvLlxudXRpbHMuYnJvd3NlciA9IGJyb3dzZXI7XG5cbi8vIENyZWF0ZSBhIG1ldGhvZCB0aGF0IGRlbGVnYXRlcyB0byBhbm90aGVyIG1ldGhvZCBvbiB0aGUgc2FtZSBvYmplY3QuIFRoZVxuLy8gZGVmYXVsdCBjb25maWd1cmF0aW9uIHVzZXMgdGhpcyBmdW5jdGlvbiB0byBkZWxlZ2F0ZSBvbmUgbWV0aG9kIHRvIGFub3RoZXIuXG51dGlscy5kZWxlZ2F0ZVRvID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpc1tuYW1lXS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9O1xufTtcbiJdfQ==
