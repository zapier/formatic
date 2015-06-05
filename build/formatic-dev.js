!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Formatic=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// # index

// Export the Formatic React class at the top level.
"use strict";

module.exports = require("./lib/formatic");

},{"./lib/formatic":43}],2:[function(require,module,exports){
// # array component

/*
Render a field to edit array values.
*/

"use strict";

var React = (window.React);
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

},{"../../mixins/field":45,"classnames":56}],3:[function(require,module,exports){
// # boolean component

/*
Render a dropdown to handle yes/no boolean values.
*/

"use strict";

var React = (window.React);

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

},{"../../mixins/field":45}],4:[function(require,module,exports){
// # checkbox-array component

/*
Used with array values to supply multiple checkboxes for adding multiple
enumerated values to an array.
*/

"use strict";

var React = (window.React);
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

},{"../../mixins/field":45,"../../undash":54,"classnames":56}],5:[function(require,module,exports){
// # checkbox-boolean component

/*
Render a field that can edit a boolean with a checkbox.
*/

"use strict";

var React = (window.React);
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

},{"../../mixins/field":45,"classnames":56}],6:[function(require,module,exports){
// # copy component

/*
Render non-editable html/text (think article copy).
*/

"use strict";

var React = (window.React);
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

},{"../../mixins/field":45,"classnames":56}],7:[function(require,module,exports){
// # fields component

/*
Render a field to edit the values of an object with static properties.
*/

"use strict";

var React = (window.React);
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

},{"../../mixins/field":45,"../../undash":54,"classnames":56}],8:[function(require,module,exports){
// # json component

/*
Textarea editor for JSON. Will validate the JSON before setting the value, so
while the value is invalid, no external state changes will occur.
*/

"use strict";

var React = (window.React);
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

},{"../../mixins/field":45,"classnames":56}],9:[function(require,module,exports){
// # object component

/*
Render a field to edit an object with dynamic child fields.
*/

"use strict";

var React = (window.React);
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

},{"../../mixins/field":45,"../../undash":54,"classnames":56}],10:[function(require,module,exports){
// # pretty boolean component

/*
Render pretty boolean component with non-native drop-down
*/

"use strict";

var React = (window.React);

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

},{"../../mixins/field":45}],11:[function(require,module,exports){
// # select component

/*
Render select element to give a user choices for the value of a field. Renders non-native
select drop down and supports fancier renderings.
*/

"use strict";

var React = (window.React);

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

},{"../../mixins/field":45}],12:[function(require,module,exports){
"use strict";
/* global CodeMirror */
/*eslint no-script-url:0 */

var React = (window.React);
var TagTranslator = require("../helpers/tag-translator");
var _ = require("../../undash");
var cx = require("classnames");

var PrettyTag = React.createClass({
  displayName: "PrettyTag",

  render: function render() {
    var classes = cx(_.extend({}, this.props.classes, { "pretty-part": true }));

    return React.createElement(
      "span",
      { className: classes, onClick: this.props.onClick },
      this.props.children
    );
  }
});

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
  displayName: "PrettyText",

  mixins: [require("../../mixins/field")],

  componentDidMount: function componentDidMount() {
    console.log("------- pt2");
    this.createEditor();
  },

  componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
    if (prevState.codeMirrorMode !== this.state.codeMirrorMode) {
      // Changed from code mirror mode to read only mode or vice versa,
      // so setup the other editor.
      this.createEditor();
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
    var pos = this.state.selectedTagPos;
    var tag = "{{" + key + "}}";

    if (pos) {
      this.codeMirror.replaceRange(tag, { line: pos.line, ch: pos.start }, { line: pos.line, ch: pos.stop });
    } else {
      this.codeMirror.replaceSelection(tag, "end");
    }
    this.codeMirror.focus();

    this.setState({ isChoicesOpen: false, selectedTagPos: null });
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
      onClose: this.onCloseChoices
    });

    // Render read-only version.
    var element = React.createElement(
      "div",
      { className: "pretty-text-wrapper", onMouseEnter: this.switchToCodeMirror },
      React.createElement(
        "div",
        { className: textBoxClasses, tabIndex: tabIndex, onFocus: this.onFocusAction, onBlur: this.onBlurAction },
        React.createElement("div", { ref: "textBox", className: "internal-text-wrapper" })
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

  createEditor: function createEditor() {
    if (this.state.codeMirrorMode) {
      this.createCodeMirrorEditor();
    } else {
      this.createReadonlyEditor();
    }
  },

  createCodeMirrorEditor: function createCodeMirrorEditor() {
    var options = {
      lineWrapping: true,
      tabindex: this.props.tabIndex,
      value: this.state.value,
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
    this.onChangeValue(newValue);
    this.setState({ value: newValue });
    this.tagCodeMirror();
  },

  getTagClasses: function getTagClasses(tag) {
    var choice = _.find(this.state.replaceChoices, function (c) {
      return c.value === tag;
    });
    return choice && choice.tagClasses || {};
  },

  createReadonlyEditor: function createReadonlyEditor() {
    var textBoxNode = this.refs.textBox.getDOMNode();

    var tokens = this.state.translator.tokenize(this.state.value);
    var self = this;
    var nodes = tokens.map(function (part) {
      if (part.type === "tag") {
        var tagClasses = self.getTagClasses(part.value);
        return React.createElement(
          PrettyTag,
          { classes: tagClasses },
          self.state.translator.getLabel(part.value)
        );
      }
      return React.createElement(
        "span",
        null,
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

  switchToCodeMirror: function switchToCodeMirror() {
    if (!this.state.codeMirrorMode) {
      this.setState({ codeMirrorMode: true });
    }
  },

  createTagNode: function createTagNode(pos) {
    var node = document.createElement("span");
    var label = this.state.translator.getLabel(pos.tag);
    var tagClasses = this.getTagClasses(pos.tag);

    var onTagClick = function onTagClick() {
      this.setState({ selectedTagPos: pos });
      this.onToggleChoices();
    };

    React.render(React.createElement(
      PrettyTag,
      { classes: tagClasses, onClick: onTagClick.bind(this) },
      label
    ), node);
    return node;
  }
});

},{"../../mixins/field":45,"../../undash":54,"../helpers/tag-translator":41,"classnames":56}],13:[function(require,module,exports){
// # select component

/*
Render select element to give a user choices for the value of a field. Note
it should support values other than strings. Currently this is only tested for
boolean values, but it _should_ work for other values.
*/

"use strict";

var React = (window.React);

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

},{"../../mixins/field":45}],14:[function(require,module,exports){
// # single-line-string component

/*
Render a single line text input.
*/

"use strict";

var React = (window.React);
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

},{"../../mixins/field":45,"classnames":56}],15:[function(require,module,exports){
// # string component

/*
Render a field that can edit a string value.
*/

"use strict";

var React = (window.React);
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

},{"../../mixins/field":45,"classnames":56}],16:[function(require,module,exports){
// # unknown component

/*
Render a field with an unknown type.
*/

"use strict";

var React = (window.React);
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

},{"../../mixins/field":45}],17:[function(require,module,exports){
// # add-item component

/*
The add button to append an item to a field.
*/

"use strict";

var React = (window.React);
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

},{"../../mixins/helper":46,"classnames":56}],18:[function(require,module,exports){
// # array-control component

/*
Render the item type choices and the add button for an array.
*/

"use strict";

var React = (window.React);
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

},{"../../mixins/helper":46,"classnames":56}],19:[function(require,module,exports){
// # array-item-control component

/*
Render the remove and move buttons for an array field.
*/

"use strict";

var React = (window.React);
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

},{"../../mixins/helper":46,"classnames":56}],20:[function(require,module,exports){
// # array-item-value component

/*
Render the value of an array item.
*/

"use strict";

var React = (window.React);
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

},{"../../mixins/helper":46,"classnames":56}],21:[function(require,module,exports){
// # array-item component

/*
Render an array item.
*/

"use strict";

var React = (window.React);
var R = React.DOM;
var cx = require("classnames");
var _ = (window._);

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

},{"../../mixins/helper":46,"classnames":56}],22:[function(require,module,exports){
// # Choices component

/*
Render customized (non-native) dropdown choices.
*/

"use strict";

var React = (window.React);
var R = React.DOM;
var _ = (window._);

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

// console.log('stop that!')
// event.preventDefault();
// event.stopPropagation();

// event.preventDefault();
// event.stopPropagation();

},{"../../mixins/click-outside":44,"../../mixins/helper":46}],23:[function(require,module,exports){
// # field-template-choices component

/*
Give a list of choices of item types to create as children of an field.
*/

"use strict";

var React = (window.React);
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

},{"../../mixins/helper":46,"classnames":56}],24:[function(require,module,exports){
// # field component

/*
Used by any fields to put the label and help text around the field.
*/

"use strict";

var React = (window.React);
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

},{"../../mixins/helper":46,"../../undash":54,"classnames":56}],25:[function(require,module,exports){
// # help component

/*
Just the help text block.
*/

"use strict";

var React = (window.React);
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

},{"../../mixins/helper":46,"classnames":56}],26:[function(require,module,exports){
// # button component

/*
  Clickable 'button'
*/

"use strict";

var React = (window.React);

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

},{"../../mixins/helper":46}],27:[function(require,module,exports){
// # label component

/*
Just the label for a field.
*/

"use strict";

var React = (window.React);
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

},{"../../mixins/helper":46,"classnames":56}],28:[function(require,module,exports){
"use strict";

var React = (window.React);

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

},{"../../mixins/helper":46}],29:[function(require,module,exports){
"use strict";

var React = (window.React);

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

},{"../../mixins/helper":46}],30:[function(require,module,exports){
// # move-item-back component

/*
Button to move an item backwards in list.
*/

"use strict";

var React = (window.React);
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

},{"../../mixins/helper":46,"classnames":56}],31:[function(require,module,exports){
// # move-item-forward component

/*
Button to move an item forward in a list.
*/

"use strict";

var React = (window.React);
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

},{"../../mixins/helper":46,"classnames":56}],32:[function(require,module,exports){
// # object-control component

/*
Render the item type choices and the add button.
*/

"use strict";

var React = (window.React);
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

},{"../../mixins/helper":46,"classnames":56}],33:[function(require,module,exports){
// # object-item-control component

/*
Render the remove buttons for an object item.
*/

"use strict";

var React = (window.React);
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

},{"../../mixins/helper":46,"classnames":56}],34:[function(require,module,exports){
// # object-item-key component

/*
Render an object item key editor.
*/

"use strict";

var React = (window.React);
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

},{"../../mixins/helper":46,"classnames":56}],35:[function(require,module,exports){
// # object-item-value component

/*
Render the value of an object item.
*/

"use strict";

var React = (window.React);
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

},{"../../mixins/helper":46,"classnames":56}],36:[function(require,module,exports){
// # object-item component

/*
Render an object item.
*/

"use strict";

var React = (window.React);
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

},{"../../mixins/helper":46,"classnames":56}],37:[function(require,module,exports){
// # pretty-select-value component

/*
   Render a select dropdown for a list of choices. Choices values can be of any
   type. Does not use native select dropdown. Choices can optionally include
   'sample' property displayed grayed out.
 */

"use strict";

var React = (window.React);
var _ = (window._);
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

},{"../../mixins/helper":46,"classnames":56}],38:[function(require,module,exports){
// # remove-item component

/*
Remove an item.
*/

"use strict";

var React = (window.React);
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

},{"../../mixins/helper":46,"classnames":56}],39:[function(require,module,exports){
// # help component

/*
Just the help text block.
*/

"use strict";

var React = (window.React);
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

},{"../../mixins/helper":46,"classnames":56}],40:[function(require,module,exports){
// # select-value component

/*
Render a select dropdown for a list of choices. Choices values can be of any
type.
*/

"use strict";

var React = (window.React);
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

},{"../../mixins/helper":46,"../../undash":54,"classnames":56}],41:[function(require,module,exports){
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

},{}],42:[function(require,module,exports){
// # default-config

/*
This is the default configuration plugin for formatic. To change formatic's
behavior, just create your own plugin function that returns an object with
methods you want to add or override.
*/

"use strict";

var React = (window.React);
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
/* fieldTemplate */ /* fieldTemplate */ /* fieldTemplate */ /* fieldTemplate */ /* field, props */ /* field */

},{"./components/fields/array":2,"./components/fields/boolean":3,"./components/fields/checkbox-array":4,"./components/fields/checkbox-boolean":5,"./components/fields/copy":6,"./components/fields/fields":7,"./components/fields/json":8,"./components/fields/object":9,"./components/fields/pretty-boolean":10,"./components/fields/pretty-select":11,"./components/fields/pretty-text2":12,"./components/fields/select":13,"./components/fields/single-line-string":14,"./components/fields/string":15,"./components/fields/unknown":16,"./components/helpers/add-item":17,"./components/helpers/array-control":18,"./components/helpers/array-item":21,"./components/helpers/array-item-control":19,"./components/helpers/array-item-value":20,"./components/helpers/choices":22,"./components/helpers/field":24,"./components/helpers/field-template-choices":23,"./components/helpers/help":25,"./components/helpers/insert-button":26,"./components/helpers/label":27,"./components/helpers/loading-choice":28,"./components/helpers/loading-choices":29,"./components/helpers/move-item-back":30,"./components/helpers/move-item-forward":31,"./components/helpers/object-control":32,"./components/helpers/object-item":36,"./components/helpers/object-item-control":33,"./components/helpers/object-item-key":34,"./components/helpers/object-item-value":35,"./components/helpers/pretty-select-value":37,"./components/helpers/remove-item":38,"./components/helpers/sample":39,"./components/helpers/select-value":40,"./undash":54,"./utils":55}],43:[function(require,module,exports){
// # formatic

/*
The root formatic component.

The root formatic component is actually two components. The main component is
a controlled component where you must pass the value in with each render. This
is actually wrapped in another component which allows you to use formatic as
an uncontrolled component where it retains the state of the value. The wrapper
is what is actually exported.
*/

"use strict";

var React = (window.React);
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

},{"./default-config":42,"./mixins/click-outside.js":44,"./mixins/field.js":45,"./mixins/helper.js":46,"./mixins/resize.js":47,"./mixins/scroll.js":48,"./mixins/undo-stack.js":49,"./plugins/bootstrap":50,"./plugins/element-classes":51,"./plugins/meta":52,"./plugins/reference":53,"./undash":54,"./utils":55}],44:[function(require,module,exports){
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

},{"../undash":54}],45:[function(require,module,exports){
// # field mixin

/*
This mixin gets mixed into all field components.
*/

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

},{"../undash":54}],46:[function(require,module,exports){
// # helper mixin

/*
This gets mixed into all helper components.
*/

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

},{"../undash":54}],47:[function(require,module,exports){
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

},{}],48:[function(require,module,exports){
// # scroll mixin

/*
Currently unused.
*/

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

},{}],49:[function(require,module,exports){
// # undo-stack mixin

/*
Gives your component an undo stack.
*/

// http://prometheusresearch.github.io/react-forms/examples/undo.html

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

},{}],50:[function(require,module,exports){
// # bootstrap plugin

/*
The bootstrap plugin sneaks in some classes to elements so that it plays well
with Twitter Bootstrap.
*/

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

},{"../undash":54}],51:[function(require,module,exports){
// # element-classes plugin

/*
This plugins provides a config method addElementClass that lets you add on a
class to an element.
*/

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

},{"../undash":54}],52:[function(require,module,exports){
// # meta plugin

/*
The meta plugin lets you pass in a meta prop to formatic. The prop then gets
passed through as a property for every field. You can then wrap `initField` to
get your meta values.
*/

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

},{}],53:[function(require,module,exports){
// # reference plugin

/*
This plugin allows fields to be strings and reference other fields by key or
id. It also allows a field to extend another field with
extends: ['foo', 'bar'] where 'foo' and 'bar' refer to other keys or ids.
*/

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
// # utils

/*
Just some shared utility functions.
*/

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

},{"./undash":54}],56:[function(require,module,exports){
/*!
  Copyright (c) 2015 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/

(function () {
	'use strict';

	function classNames () {

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

	if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
		// AMD. Register as an anonymous module.
		define(function () {
			return classNames;
		});
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = classNames;
	} else {
		window.classNames = classNames;
	}

}());

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvaW5kZXguanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvZmllbGRzL2FycmF5LmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9ib29sZWFuLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9jaGVja2JveC1hcnJheS5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9maWVsZHMvY2hlY2tib3gtYm9vbGVhbi5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9maWVsZHMvY29weS5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9maWVsZHMvZmllbGRzLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9qc29uLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9vYmplY3QuanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvZmllbGRzL3ByZXR0eS1ib29sZWFuLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9wcmV0dHktc2VsZWN0LmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9wcmV0dHktdGV4dDIuanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvZmllbGRzL3NlbGVjdC5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9maWVsZHMvc2luZ2xlLWxpbmUtc3RyaW5nLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9zdHJpbmcuanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvZmllbGRzL3Vua25vd24uanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9hZGQtaXRlbS5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2FycmF5LWNvbnRyb2wuanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9hcnJheS1pdGVtLWNvbnRyb2wuanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9hcnJheS1pdGVtLXZhbHVlLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvYXJyYXktaXRlbS5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2Nob2ljZXMuanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9maWVsZC10ZW1wbGF0ZS1jaG9pY2VzLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvZmllbGQuanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9oZWxwLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvaW5zZXJ0LWJ1dHRvbi5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2xhYmVsLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvbG9hZGluZy1jaG9pY2UuanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9sb2FkaW5nLWNob2ljZXMuanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9tb3ZlLWl0ZW0tYmFjay5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL21vdmUtaXRlbS1mb3J3YXJkLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWNvbnRyb2wuanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9vYmplY3QtaXRlbS1jb250cm9sLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWl0ZW0ta2V5LmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWl0ZW0tdmFsdWUuanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9vYmplY3QtaXRlbS5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL3ByZXR0eS1zZWxlY3QtdmFsdWUuanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9yZW1vdmUtaXRlbS5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL3NhbXBsZS5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL3NlbGVjdC12YWx1ZS5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL3RhZy10cmFuc2xhdG9yLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9kZWZhdWx0LWNvbmZpZy5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvZm9ybWF0aWMuanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL21peGlucy9jbGljay1vdXRzaWRlLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9taXhpbnMvZmllbGQuanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL21peGlucy9oZWxwZXIuanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL21peGlucy9yZXNpemUuanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL21peGlucy9zY3JvbGwuanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL21peGlucy91bmRvLXN0YWNrLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9wbHVnaW5zL2Jvb3RzdHJhcC5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvcGx1Z2lucy9lbGVtZW50LWNsYXNzZXMuanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL3BsdWdpbnMvbWV0YS5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvcGx1Z2lucy9yZWZlcmVuY2UuanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL3VuZGFzaC5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvdXRpbHMuanMiLCJub2RlX21vZHVsZXMvY2xhc3NuYW1lcy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kZWVwLWVxdWFsL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RlZXAtZXF1YWwvbGliL2lzX2FyZ3VtZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9kZWVwLWVxdWFsL2xpYi9rZXlzLmpzIiwibm9kZV9tb2R1bGVzL29iamVjdC1hc3NpZ24vaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztBQ0dBLE1BQU0sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7Ozs7Ozs7OztBQ0czQyxZQUFZLENBQUM7O0FBRWIsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3BDLElBQUks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UyxDQUFDLENBQUM7S0FDeEMsQ0FBQztHQUNILENBQUM7Q0FDSCxDQUFDOztBQUVGLEtBQUssQ0FBQyxVQUFVLEdBQUcsVUFBUyxDQUFDLEVBQUU7QUFDN0IsU0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7Q0FDakUsQ0FBQzs7O0FDeEhGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vICMgaW5kZXhcblxuLy8gRXhwb3J0IHRoZSBGb3JtYXRpYyBSZWFjdCBjbGFzcyBhdCB0aGUgdG9wIGxldmVsLlxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9mb3JtYXRpYycpO1xuIiwiLy8gIyBhcnJheSBjb21wb25lbnRcblxuLypcblJlbmRlciBhIGZpZWxkIHRvIGVkaXQgYXJyYXkgdmFsdWVzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0FycmF5JyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgLy8gZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gIC8vICAgcmV0dXJuIHtcbiAgLy8gICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWVcbiAgLy8gICB9O1xuICAvLyB9LFxuXG4gIG5leHRMb29rdXBJZDogMCxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcblxuICAgIC8vIE5lZWQgdG8gY3JlYXRlIGFydGlmaWNpYWwga2V5cyBmb3IgdGhlIGFycmF5LiBJbmRleGVzIGFyZSBub3QgZ29vZCBrZXlzLFxuICAgIC8vIHNpbmNlIHRoZXkgY2hhbmdlLiBTbywgbWFwIGVhY2ggcG9zaXRpb24gdG8gYW4gYXJ0aWZpY2lhbCBrZXlcbiAgICB2YXIgbG9va3VwcyA9IFtdO1xuXG4gICAgdmFyIGl0ZW1zID0gdGhpcy5wcm9wcy5maWVsZC52YWx1ZTtcblxuICAgIGl0ZW1zLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0sIGkpIHtcbiAgICAgIGxvb2t1cHNbaV0gPSAnXycgKyB0aGlzLm5leHRMb29rdXBJZDtcbiAgICAgIHRoaXMubmV4dExvb2t1cElkKys7XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIHJldHVybiB7XG4gICAgICBsb29rdXBzOiBsb29rdXBzXG4gICAgfTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV3UHJvcHMpIHtcblxuICAgIHZhciBsb29rdXBzID0gdGhpcy5zdGF0ZS5sb29rdXBzO1xuXG4gICAgdmFyIGl0ZW1zID0gbmV3UHJvcHMuZmllbGQudmFsdWU7XG5cbiAgICAvLyBOZWVkIHRvIHNldCBhcnRpZmljaWFsIGtleXMgZm9yIG5ldyBhcnJheSBpdGVtcy5cbiAgICBpZiAoaXRlbXMubGVuZ3RoID4gbG9va3Vwcy5sZW5ndGgpIHtcbiAgICAgIGZvciAodmFyIGkgPSBsb29rdXBzLmxlbmd0aDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxvb2t1cHNbaV0gPSAnXycgKyB0aGlzLm5leHRMb29rdXBJZDtcbiAgICAgICAgdGhpcy5uZXh0TG9va3VwSWQrKztcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGxvb2t1cHM6IGxvb2t1cHNcbiAgICB9KTtcbiAgfSxcblxuICBvbkNoYW5nZTogZnVuY3Rpb24gKGksIG5ld1ZhbHVlLCBpbmZvKSB7XG4gICAgdmFyIG5ld0FycmF5VmFsdWUgPSB0aGlzLnByb3BzLmZpZWxkLnZhbHVlLnNsaWNlKDApO1xuICAgIG5ld0FycmF5VmFsdWVbaV0gPSBuZXdWYWx1ZTtcbiAgICB0aGlzLm9uQnViYmxlVmFsdWUobmV3QXJyYXlWYWx1ZSwgaW5mbyk7XG4gIH0sXG5cbiAgb25BcHBlbmQ6IGZ1bmN0aW9uIChpdGVtQ2hvaWNlSW5kZXgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHZhciBuZXdWYWx1ZSA9IGNvbmZpZy5jcmVhdGVOZXdDaGlsZEZpZWxkVmFsdWUoZmllbGQsIGl0ZW1DaG9pY2VJbmRleCk7XG5cbiAgICB2YXIgaXRlbXMgPSBmaWVsZC52YWx1ZTtcblxuICAgIGl0ZW1zID0gaXRlbXMuY29uY2F0KG5ld1ZhbHVlKTtcblxuICAgIHRoaXMub25DaGFuZ2VWYWx1ZShpdGVtcyk7XG4gIH0sXG5cbiAgb25SZW1vdmU6IGZ1bmN0aW9uIChpKSB7XG4gICAgdmFyIGxvb2t1cHMgPSB0aGlzLnN0YXRlLmxvb2t1cHM7XG4gICAgbG9va3Vwcy5zcGxpY2UoaSwgMSk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBsb29rdXBzOiBsb29rdXBzXG4gICAgfSk7XG4gICAgdmFyIG5ld0l0ZW1zID0gdGhpcy5wcm9wcy5maWVsZC52YWx1ZS5zbGljZSgwKTtcbiAgICBuZXdJdGVtcy5zcGxpY2UoaSwgMSk7XG4gICAgdGhpcy5vbkNoYW5nZVZhbHVlKG5ld0l0ZW1zKTtcbiAgfSxcblxuICBvbk1vdmU6IGZ1bmN0aW9uIChmcm9tSW5kZXgsIHRvSW5kZXgpIHtcbiAgICB2YXIgbG9va3VwcyA9IHRoaXMuc3RhdGUubG9va3VwcztcbiAgICB2YXIgZnJvbUlkID0gbG9va3Vwc1tmcm9tSW5kZXhdO1xuICAgIHZhciB0b0lkID0gbG9va3Vwc1t0b0luZGV4XTtcbiAgICBsb29rdXBzW2Zyb21JbmRleF0gPSB0b0lkO1xuICAgIGxvb2t1cHNbdG9JbmRleF0gPSBmcm9tSWQ7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBsb29rdXBzOiBsb29rdXBzXG4gICAgfSk7XG5cbiAgICB2YXIgbmV3SXRlbXMgPSB0aGlzLnByb3BzLmZpZWxkLnZhbHVlLnNsaWNlKDApO1xuICAgIGlmIChmcm9tSW5kZXggIT09IHRvSW5kZXggJiZcbiAgICAgIGZyb21JbmRleCA+PSAwICYmIGZyb21JbmRleCA8IG5ld0l0ZW1zLmxlbmd0aCAmJlxuICAgICAgdG9JbmRleCA+PSAwICYmIHRvSW5kZXggPCBuZXdJdGVtcy5sZW5ndGhcbiAgICApIHtcbiAgICAgIG5ld0l0ZW1zLnNwbGljZSh0b0luZGV4LCAwLCBuZXdJdGVtcy5zcGxpY2UoZnJvbUluZGV4LCAxKVswXSk7XG4gICAgfVxuICAgIHRoaXMub25DaGFuZ2VWYWx1ZShuZXdJdGVtcyk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgdmFyIGZpZWxkcyA9IGNvbmZpZy5jcmVhdGVDaGlsZEZpZWxkcyhmaWVsZCk7XG5cbiAgICB2YXIgbnVtSXRlbXMgPSBmaWVsZC52YWx1ZS5sZW5ndGg7XG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHtcbiAgICAgIGZpZWxkOiBmaWVsZCwgcGxhaW46IHRoaXMucHJvcHMucGxhaW5cbiAgICB9LFxuICAgICAgUi5kaXYoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKX0sXG4gICAgICAgIC8vIGNzcyB0cmFuc2l0aW9ucyBrbm93IHRvIGNhdXNlIGV2ZW50IHByb2JsZW1zXG4gICAgICAgIGNvbmZpZy5jc3NUcmFuc2l0aW9uV3JhcHBlcihcbiAgICAgICAgICBmaWVsZHMubWFwKGZ1bmN0aW9uIChjaGlsZEZpZWxkLCBpKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2FycmF5LWl0ZW0nLCB7XG4gICAgICAgICAgICAgIGtleTogdGhpcy5zdGF0ZS5sb29rdXBzW2ldLFxuICAgICAgICAgICAgICBmaWVsZDogY2hpbGRGaWVsZCxcbiAgICAgICAgICAgICAgaW5kZXg6IGksXG4gICAgICAgICAgICAgIG51bUl0ZW1zOiBudW1JdGVtcyxcbiAgICAgICAgICAgICAgb25Nb3ZlOiB0aGlzLm9uTW92ZSxcbiAgICAgICAgICAgICAgb25SZW1vdmU6IHRoaXMub25SZW1vdmUsXG4gICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgICAgICAgICBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvblxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICApLFxuICAgICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgnYXJyYXktY29udHJvbCcsIHtmaWVsZDogZmllbGQsIG9uQXBwZW5kOiB0aGlzLm9uQXBwZW5kfSlcbiAgICAgIClcbiAgICApO1xuICB9XG59KTtcbiIsIi8vICMgYm9vbGVhbiBjb21wb25lbnRcblxuLypcblJlbmRlciBhIGRyb3Bkb3duIHRvIGhhbmRsZSB5ZXMvbm8gYm9vbGVhbiB2YWx1ZXMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0Jvb2xlYW4nLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICBvbkNoYW5nZTogZnVuY3Rpb24gKG5ld1ZhbHVlKSB7XG4gICAgdGhpcy5vbkNoYW5nZVZhbHVlKG5ld1ZhbHVlKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICB2YXIgY2hvaWNlcyA9IGNvbmZpZy5maWVsZEJvb2xlYW5DaG9pY2VzKGZpZWxkKTtcblxuICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQnLCB7XG4gICAgICBmaWVsZDogZmllbGQsIHBsYWluOiB0aGlzLnByb3BzLnBsYWluXG4gICAgfSwgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ3NlbGVjdC12YWx1ZScsIHtcbiAgICAgIGNob2ljZXM6IGNob2ljZXMsIGZpZWxkOiBmaWVsZCwgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsIG9uQWN0aW9uOiB0aGlzLm9uQnViYmxlQWN0aW9uXG4gICAgfSkpO1xuICB9XG59KTtcbiIsIi8vICMgY2hlY2tib3gtYXJyYXkgY29tcG9uZW50XG5cbi8qXG5Vc2VkIHdpdGggYXJyYXkgdmFsdWVzIHRvIHN1cHBseSBtdWx0aXBsZSBjaGVja2JveGVzIGZvciBhZGRpbmcgbXVsdGlwbGVcbmVudW1lcmF0ZWQgdmFsdWVzIHRvIGFuIGFycmF5LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgXyA9IHJlcXVpcmUoJy4uLy4uL3VuZGFzaCcpO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0NoZWNrYm94QXJyYXknLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY2hvaWNlczogdGhpcy5wcm9wcy5jb25maWcuZmllbGRDaG9pY2VzKHRoaXMucHJvcHMuZmllbGQpXG4gICAgfTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV3UHJvcHMpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGNob2ljZXM6IG5ld1Byb3BzLmNvbmZpZy5maWVsZENob2ljZXMobmV3UHJvcHMuZmllbGQpXG4gICAgfSk7XG4gIH0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBHZXQgYWxsIHRoZSBjaGVja2VkIGNoZWNrYm94ZXMgYW5kIGNvbnZlcnQgdG8gYW4gYXJyYXkgb2YgdmFsdWVzLlxuICAgIHZhciBjaG9pY2VOb2RlcyA9IHRoaXMucmVmcy5jaG9pY2VzLmdldERPTU5vZGUoKS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW5wdXQnKTtcbiAgICBjaG9pY2VOb2RlcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGNob2ljZU5vZGVzLCAwKTtcbiAgICB2YXIgdmFsdWVzID0gY2hvaWNlTm9kZXMubWFwKGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICByZXR1cm4gbm9kZS5jaGVja2VkID8gbm9kZS52YWx1ZSA6IG51bGw7XG4gICAgfSkuZmlsdGVyKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0pO1xuICAgIHRoaXMub25DaGFuZ2VWYWx1ZSh2YWx1ZXMpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHZhciBjaG9pY2VzID0gdGhpcy5zdGF0ZS5jaG9pY2VzIHx8IFtdO1xuXG4gICAgdmFyIGlzSW5saW5lID0gIV8uZmluZChjaG9pY2VzLCBmdW5jdGlvbiAoY2hvaWNlKSB7XG4gICAgICByZXR1cm4gY2hvaWNlLnNhbXBsZTtcbiAgICB9KTtcblxuICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQnLCB7XG4gICAgICBmaWVsZDogZmllbGRcbiAgICB9LFxuICAgICAgUi5kaXYoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSwgcmVmOiAnY2hvaWNlcyd9LFxuICAgICAgICBjaG9pY2VzLm1hcChmdW5jdGlvbiAoY2hvaWNlLCBpKSB7XG5cbiAgICAgICAgICB2YXIgaW5wdXRGaWVsZCA9IFIuc3Bhbih7c3R5bGU6IHt3aGl0ZVNwYWNlOiAnbm93cmFwJ319LFxuICAgICAgICAgICAgUi5pbnB1dCh7XG4gICAgICAgICAgICAgIG5hbWU6IGZpZWxkLmtleSxcbiAgICAgICAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgICAgICAgdmFsdWU6IGNob2ljZS52YWx1ZSxcbiAgICAgICAgICAgICAgY2hlY2tlZDogZmllbGQudmFsdWUuaW5kZXhPZihjaG9pY2UudmFsdWUpID49IDAgPyB0cnVlIDogZmFsc2UsXG4gICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgICAgICAgICBvbkZvY3VzOiB0aGlzLm9uRm9jdXNBY3Rpb24sXG4gICAgICAgICAgICAgIG9uQmx1cjogdGhpcy5vbkJsdXJBY3Rpb25cbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgJyAnLFxuICAgICAgICAgICAgUi5zcGFuKHtjbGFzc05hbWU6ICdmaWVsZC1jaG9pY2UtbGFiZWwnfSxcbiAgICAgICAgICAgICAgY2hvaWNlLmxhYmVsXG4gICAgICAgICAgICApXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIGlmIChpc0lubGluZSkge1xuICAgICAgICAgICAgcmV0dXJuIFIuc3Bhbih7a2V5OiBpLCBjbGFzc05hbWU6ICdmaWVsZC1jaG9pY2UnfSxcbiAgICAgICAgICAgICAgaW5wdXRGaWVsZCwgJyAnXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gUi5kaXYoe2tleTogaSwgY2xhc3NOYW1lOiAnZmllbGQtY2hvaWNlJ30sXG4gICAgICAgICAgICAgIGlucHV0RmllbGQsICcgJyxcbiAgICAgICAgICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ3NhbXBsZScsIHtmaWVsZDogZmllbGQsIGNob2ljZTogY2hvaWNlfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG4iLCIvLyAjIGNoZWNrYm94LWJvb2xlYW4gY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgYSBmaWVsZCB0aGF0IGNhbiBlZGl0IGEgYm9vbGVhbiB3aXRoIGEgY2hlY2tib3guXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnQ2hlY2tib3hCb29sZWFuJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHRoaXMub25DaGFuZ2VWYWx1ZShldmVudC50YXJnZXQuY2hlY2tlZCk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHtcbiAgICAgIGNvbmZpZzogY29uZmlnLCBmaWVsZDogZmllbGQsIHBsYWluOiB0cnVlXG4gICAgfSxcbiAgICBSLnNwYW4oe3N0eWxlOiB7d2hpdGVTcGFjZTogJ25vd3JhcCd9fSxcbiAgICAgIFIuaW5wdXQoe1xuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICBjaGVja2VkOiBmaWVsZC52YWx1ZSxcbiAgICAgICAgY2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpLFxuICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgICAgb25Gb2N1czogdGhpcy5vbkZvY3VzQWN0aW9uLFxuICAgICAgICBvbkJsdXI6IHRoaXMub25CbHVyQWN0aW9uXG4gICAgICB9KSxcbiAgICAgIFIuc3Bhbih7fSwgJyAnKSxcbiAgICAgIFIuc3Bhbih7fSwgY29uZmlnLmZpZWxkSGVscFRleHQoZmllbGQpIHx8IGNvbmZpZy5maWVsZExhYmVsKGZpZWxkKSlcbiAgICApKTtcbiAgfVxufSk7XG4iLCIvLyAjIGNvcHkgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgbm9uLWVkaXRhYmxlIGh0bWwvdGV4dCAodGhpbmsgYXJ0aWNsZSBjb3B5KS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdDb3B5JyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpLCBkYW5nZXJvdXNseVNldElubmVySFRNTDoge1xuICAgICAgX19odG1sOiB0aGlzLnByb3BzLmNvbmZpZy5maWVsZEhlbHBUZXh0KHRoaXMucHJvcHMuZmllbGQpXG4gICAgfX0pO1xuICB9XG59KTtcbiIsIi8vICMgZmllbGRzIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIGEgZmllbGQgdG8gZWRpdCB0aGUgdmFsdWVzIG9mIGFuIG9iamVjdCB3aXRoIHN0YXRpYyBwcm9wZXJ0aWVzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIF8gPSByZXF1aXJlKCcuLi8uLi91bmRhc2gnKTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdGaWVsZHMnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICBvbkNoYW5nZUZpZWxkOiBmdW5jdGlvbiAoa2V5LCBuZXdWYWx1ZSwgaW5mbykge1xuICAgIGlmIChrZXkpIHtcbiAgICAgIHZhciBuZXdPYmplY3RWYWx1ZSA9IF8uZXh0ZW5kKHt9LCB0aGlzLnByb3BzLmZpZWxkLnZhbHVlKTtcbiAgICAgIG5ld09iamVjdFZhbHVlW2tleV0gPSBuZXdWYWx1ZTtcbiAgICAgIHRoaXMub25CdWJibGVWYWx1ZShuZXdPYmplY3RWYWx1ZSwgaW5mbyk7XG4gICAgfVxuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICB2YXIgZmllbGRzID0gY29uZmlnLmNyZWF0ZUNoaWxkRmllbGRzKGZpZWxkKTtcblxuICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQnLCB7XG4gICAgICBjb25maWc6IGNvbmZpZywgZmllbGQ6IGZpZWxkLCBwbGFpbjogdGhpcy5wcm9wcy5wbGFpblxuICAgIH0sXG4gICAgICBSLmZpZWxkc2V0KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3Nlcyl9LFxuICAgICAgICBmaWVsZHMubWFwKGZ1bmN0aW9uIChjaGlsZEZpZWxkLCBpKSB7XG4gICAgICAgICAgdmFyIGtleSA9IGNoaWxkRmllbGQua2V5IHx8IGk7XG4gICAgICAgICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVGaWVsZEVsZW1lbnQoe1xuICAgICAgICAgICAga2V5OiBrZXkgfHwgaSxcbiAgICAgICAgICAgIGZpZWxkOiBjaGlsZEZpZWxkLFxuICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2VGaWVsZC5iaW5kKHRoaXMsIGtleSksIG9uQWN0aW9uOiB0aGlzLm9uQnViYmxlQWN0aW9uXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgIClcbiAgICApO1xuICB9XG5cbn0pO1xuIiwiLy8gIyBqc29uIGNvbXBvbmVudFxuXG4vKlxuVGV4dGFyZWEgZWRpdG9yIGZvciBKU09OLiBXaWxsIHZhbGlkYXRlIHRoZSBKU09OIGJlZm9yZSBzZXR0aW5nIHRoZSB2YWx1ZSwgc29cbndoaWxlIHRoZSB2YWx1ZSBpcyBpbnZhbGlkLCBubyBleHRlcm5hbCBzdGF0ZSBjaGFuZ2VzIHdpbGwgb2NjdXIuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdKc29uJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJvd3M6IDVcbiAgICB9O1xuICB9LFxuXG4gIGlzVmFsaWRWYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG5cbiAgICB0cnkge1xuICAgICAgSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9LFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpc1ZhbGlkOiB0cnVlLFxuICAgICAgdmFsdWU6IEpTT04uc3RyaW5naWZ5KHRoaXMucHJvcHMuZmllbGQudmFsdWUsIG51bGwsIDIpXG4gICAgfTtcbiAgfSxcblxuICBvbkNoYW5nZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdmFyIGlzVmFsaWQgPSB0aGlzLmlzVmFsaWRWYWx1ZShldmVudC50YXJnZXQudmFsdWUpO1xuXG4gICAgaWYgKGlzVmFsaWQpIHtcbiAgICAgIC8vIE5lZWQgdG8gaGFuZGxlIHRoaXMgYmV0dGVyLiBOZWVkIHRvIHRyYWNrIHBvc2l0aW9uLlxuICAgICAgdGhpcy5faXNDaGFuZ2luZyA9IHRydWU7XG4gICAgICB0aGlzLm9uQ2hhbmdlVmFsdWUoSlNPTi5wYXJzZShldmVudC50YXJnZXQudmFsdWUpKTtcbiAgICB9XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGlzVmFsaWQ6IGlzVmFsaWQsXG4gICAgICB2YWx1ZTogZXZlbnQudGFyZ2V0LnZhbHVlXG4gICAgfSk7XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gKG5leHRQcm9wcykge1xuICAgIGlmICghdGhpcy5faXNDaGFuZ2luZykge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGlzVmFsaWQ6IHRydWUsXG4gICAgICAgIHZhbHVlOiBKU09OLnN0cmluZ2lmeShuZXh0UHJvcHMuZmllbGQudmFsdWUsIG51bGwsIDIpXG4gICAgICB9KTtcbiAgICB9XG4gICAgdGhpcy5faXNDaGFuZ2luZyA9IGZhbHNlO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywge1xuICAgICAgZmllbGQ6IGNvbmZpZy5maWVsZFdpdGhWYWx1ZShmaWVsZCwgdGhpcy5zdGF0ZS52YWx1ZSksIHBsYWluOiB0aGlzLnByb3BzLnBsYWluXG4gICAgfSwgUi50ZXh0YXJlYSh7XG4gICAgICAgIGNsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSxcbiAgICAgICAgdmFsdWU6IHRoaXMuc3RhdGUudmFsdWUsXG4gICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgICBzdHlsZToge2JhY2tncm91bmRDb2xvcjogdGhpcy5zdGF0ZS5pc1ZhbGlkID8gJycgOiAncmdiKDI1NSwyMDAsMjAwKSd9LFxuICAgICAgICByb3dzOiBjb25maWcuZmllbGRSb3dzKGZpZWxkKSB8fCB0aGlzLnByb3BzLnJvd3MsXG4gICAgICAgIG9uRm9jdXM6IHRoaXMub25Gb2N1c0FjdGlvbixcbiAgICAgICAgb25CbHVyOiB0aGlzLm9uQmx1ckFjdGlvblxuICAgICAgfSlcbiAgICApO1xuICB9XG59KTtcbiIsIi8vICMgb2JqZWN0IGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIGEgZmllbGQgdG8gZWRpdCBhbiBvYmplY3Qgd2l0aCBkeW5hbWljIGNoaWxkIGZpZWxkcy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBfID0gcmVxdWlyZSgnLi4vLi4vdW5kYXNoJyk7XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbnZhciB0ZW1wS2V5UHJlZml4ID0gJyQkX190ZW1wX18nO1xuXG52YXIgdGVtcEtleSA9IGZ1bmN0aW9uIChpZCkge1xuICByZXR1cm4gdGVtcEtleVByZWZpeCArIGlkO1xufTtcblxudmFyIGlzVGVtcEtleSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgcmV0dXJuIGtleS5zdWJzdHJpbmcoMCwgdGVtcEtleVByZWZpeC5sZW5ndGgpID09PSB0ZW1wS2V5UHJlZml4O1xufTtcblxuLy8gVE9ETzoga2VlcCBpbnZhbGlkIGtleXMgYXMgc3RhdGUgYW5kIGRvbid0IHNlbmQgaW4gb25DaGFuZ2U7IGNsb25lIGNvbnRleHRcbi8vIGFuZCB1c2UgY2xvbmUgdG8gY3JlYXRlIGNoaWxkIGNvbnRleHRzXG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnT2JqZWN0JyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgbmV4dExvb2t1cElkOiAwLFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGtleVRvSWQgPSB7fTtcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHRoaXMucHJvcHMuZmllbGQudmFsdWUpO1xuICAgIHZhciBrZXlPcmRlciA9IFtdO1xuICAgIC8vIFRlbXAga2V5cyBrZWVwcyB0aGUga2V5IHRvIGRpc3BsYXksIHdoaWNoIHNvbWV0aW1lcyBtYXkgYmUgZGlmZmVyZW50XG4gICAgLy8gdGhhbiB0aGUgYWN0dWFsIGtleS4gRm9yIGV4YW1wbGUsIGR1cGxpY2F0ZSBrZXlzIGFyZSBub3QgYWxsb3dlZCxcbiAgICAvLyBidXQgd2UgbWF5IHRlbXBvcmFyaWx5IHNob3cgZHVwbGljYXRlIGtleXMuXG4gICAgdmFyIHRlbXBEaXNwbGF5S2V5cyA9IHt9O1xuXG4gICAgLy8gS2V5cyBkb24ndCBtYWtlIGdvb2QgcmVhY3Qga2V5cywgc2luY2Ugd2UncmUgYWxsb3dpbmcgdGhlbSB0byBiZVxuICAgIC8vIGNoYW5nZWQgaGVyZSwgc28gd2UnbGwgaGF2ZSB0byBjcmVhdGUgZmFrZSBrZXlzIGFuZFxuICAgIC8vIGtlZXAgdHJhY2sgb2YgdGhlIG1hcHBpbmcgb2YgcmVhbCBrZXlzIHRvIGZha2Uga2V5cy4gWXVjay5cbiAgICBrZXlzLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgdmFyIGlkID0gKyt0aGlzLm5leHRMb29rdXBJZDtcbiAgICAgIC8vIE1hcCB0aGUgcmVhbCBrZXkgdG8gdGhlIGlkLlxuICAgICAga2V5VG9JZFtrZXldID0gaWQ7XG4gICAgICAvLyBLZWVwIHRoZSBvcmRlcmluZyBvZiB0aGUga2V5cyBzbyB3ZSBkb24ndCBzaHVmZmxlIHRoaW5ncyBhcm91bmQgbGF0ZXIuXG4gICAgICBrZXlPcmRlci5wdXNoKGtleSk7XG4gICAgICAvLyBJZiB0aGlzIGlzIGEgdGVtcG9yYXJ5IGtleSB0aGF0IHdhcyBwZXJzaXN0ZWQsIGJlc3Qgd2UgY2FuIGRvIGlzIGRpc3BsYXlcbiAgICAgIC8vIGEgYmxhbmsuXG4gICAgICAvLyBUT0RPOiBQcm9iYWJseSBqdXN0IG5vdCBzZW5kIHRlbXBvcmFyeSBrZXlzIGJhY2sgdGhyb3VnaC4gVGhpcyBiZWhhdmlvclxuICAgICAgLy8gaXMgYWN0dWFsbHkgbGVmdG92ZXIgZnJvbSBhbiBlYXJsaWVyIGluY2FybmF0aW9uIG9mIGZvcm1hdGljIHdoZXJlXG4gICAgICAvLyB2YWx1ZXMgaGFkIHRvIGdvIGJhY2sgdG8gdGhlIHJvb3QuXG4gICAgICBpZiAoaXNUZW1wS2V5KGtleSkpIHtcbiAgICAgICAgdGVtcERpc3BsYXlLZXlzW2lkXSA9ICcnO1xuICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAga2V5VG9JZDoga2V5VG9JZCxcbiAgICAgIGtleU9yZGVyOiBrZXlPcmRlcixcbiAgICAgIC8vIFRlbXAga2V5cyBrZWVwcyB0aGUga2V5IHRvIGRpc3BsYXksIHdoaWNoIHNvbWV0aW1lcyBtYXkgYmUgZGlmZmVyZW50XG4gICAgICAvLyB0aGFuIHRoZSBhY3R1YWwga2V5LiBGb3IgZXhhbXBsZSwgZHVwbGljYXRlIGtleXMgYXJlIG5vdCBhbGxvd2VkLFxuICAgICAgLy8gYnV0IHdlIG1heSB0ZW1wb3JhcmlseSBzaG93IGR1cGxpY2F0ZSBrZXlzLlxuICAgICAgdGVtcERpc3BsYXlLZXlzOiB0ZW1wRGlzcGxheUtleXNcbiAgICB9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXdQcm9wcykge1xuXG4gICAgdmFyIGtleVRvSWQgPSB0aGlzLnN0YXRlLmtleVRvSWQ7XG4gICAgdmFyIG5ld0tleVRvSWQgPSB7fTtcbiAgICB2YXIgdGVtcERpc3BsYXlLZXlzID0gdGhpcy5zdGF0ZS50ZW1wRGlzcGxheUtleXM7XG4gICAgdmFyIG5ld1RlbXBEaXNwbGF5S2V5cyA9IHt9O1xuICAgIHZhciBrZXlPcmRlciA9IHRoaXMuc3RhdGUua2V5T3JkZXI7XG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhuZXdQcm9wcy5maWVsZC52YWx1ZSk7XG4gICAgdmFyIGFkZGVkS2V5cyA9IFtdO1xuXG4gICAgLy8gTG9vayBhdCB0aGUgbmV3IGtleXMuXG4gICAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIC8vIEFkZCBuZXcgbG9va3VwIGlmIHRoaXMga2V5IHdhc24ndCBoZXJlIGxhc3QgdGltZS5cbiAgICAgIGlmICgha2V5VG9JZFtrZXldKSB7XG4gICAgICAgIHRoaXMubmV4dExvb2t1cElkKys7XG4gICAgICAgIG5ld0tleVRvSWRba2V5XSA9IHRoaXMubmV4dExvb2t1cElkO1xuICAgICAgICBhZGRlZEtleXMucHVzaChrZXkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3S2V5VG9JZFtrZXldID0ga2V5VG9JZFtrZXldO1xuICAgICAgfVxuICAgICAgaWYgKGlzVGVtcEtleShrZXkpICYmIG5ld0tleVRvSWRba2V5XSBpbiB0ZW1wRGlzcGxheUtleXMpIHtcbiAgICAgICAgbmV3VGVtcERpc3BsYXlLZXlzW25ld0tleVRvSWRba2V5XV0gPSB0ZW1wRGlzcGxheUtleXNbbmV3S2V5VG9JZFtrZXldXTtcbiAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgdmFyIG5ld0tleU9yZGVyID0gW107XG5cbiAgICAvLyBMb29rIGF0IHRoZSBvbGQga2V5cy5cbiAgICBrZXlPcmRlci5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIC8vIElmIHRoZSBrZXkgaXMgaW4gdGhlIG5ldyBrZXlzLCBwdXNoIGl0IG9udG8gdGhlIG9yZGVyIHRvIHJldGFpbiB0aGVcbiAgICAgIC8vIHNhbWUgb3JkZXIuXG4gICAgICBpZiAobmV3S2V5VG9JZFtrZXldKSB7XG4gICAgICAgIG5ld0tleU9yZGVyLnB1c2goa2V5KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFB1dCBhZGRlZCBmaWVsZHMgYXQgdGhlIGVuZC4gKFNvIHRoaW5ncyBkb24ndCBnZXQgc2h1ZmZsZWQuKVxuICAgIG5ld0tleU9yZGVyID0gbmV3S2V5T3JkZXIuY29uY2F0KGFkZGVkS2V5cyk7XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGtleVRvSWQ6IG5ld0tleVRvSWQsXG4gICAgICBrZXlPcmRlcjogbmV3S2V5T3JkZXIsXG4gICAgICB0ZW1wRGlzcGxheUtleXM6IG5ld1RlbXBEaXNwbGF5S2V5c1xuICAgIH0pO1xuICB9LFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAoa2V5LCBuZXdWYWx1ZSwgaW5mbykge1xuICAgIHZhciBuZXdPYmogPSBfLmV4dGVuZCh7fSwgdGhpcy5wcm9wcy5maWVsZC52YWx1ZSk7XG4gICAgbmV3T2JqW2tleV0gPSBuZXdWYWx1ZTtcbiAgICB0aGlzLm9uQnViYmxlVmFsdWUobmV3T2JqLCBpbmZvKTtcbiAgfSxcblxuICBvbkFwcGVuZDogZnVuY3Rpb24gKGl0ZW1DaG9pY2VJbmRleCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuICAgIHRoaXMubmV4dExvb2t1cElkKys7XG5cbiAgICB2YXIga2V5VG9JZCA9IHRoaXMuc3RhdGUua2V5VG9JZDtcbiAgICB2YXIga2V5T3JkZXIgPSB0aGlzLnN0YXRlLmtleU9yZGVyO1xuICAgIHZhciB0ZW1wRGlzcGxheUtleXMgPSB0aGlzLnN0YXRlLnRlbXBEaXNwbGF5S2V5cztcblxuICAgIHZhciBpZCA9IHRoaXMubmV4dExvb2t1cElkO1xuICAgIHZhciBuZXdLZXkgPSB0ZW1wS2V5KGlkKTtcblxuICAgIGtleVRvSWRbbmV3S2V5XSA9IGlkO1xuICAgIC8vIFRlbXBvcmFyaWx5LCB3ZSdsbCBzaG93IGEgYmxhbmsga2V5LlxuICAgIHRlbXBEaXNwbGF5S2V5c1tpZF0gPSAnJztcbiAgICBrZXlPcmRlci5wdXNoKG5ld0tleSk7XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGtleVRvSWQ6IGtleVRvSWQsXG4gICAgICB0ZW1wRGlzcGxheUtleXM6IHRlbXBEaXNwbGF5S2V5cyxcbiAgICAgIGtleU9yZGVyOiBrZXlPcmRlclxuICAgIH0pO1xuXG4gICAgdmFyIG5ld09iaiA9IF8uZXh0ZW5kKHRoaXMucHJvcHMuZmllbGQudmFsdWUpO1xuXG4gICAgdmFyIG5ld1ZhbHVlID0gY29uZmlnLmNyZWF0ZU5ld0NoaWxkRmllbGRWYWx1ZShmaWVsZCwgaXRlbUNob2ljZUluZGV4KTtcblxuICAgIG5ld09ialtuZXdLZXldID0gbmV3VmFsdWU7XG5cbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUobmV3T2JqKTtcbiAgfSxcblxuICBvblJlbW92ZTogZnVuY3Rpb24gKGtleSkge1xuICAgIHZhciBuZXdPYmogPSBfLmV4dGVuZCh0aGlzLnByb3BzLmZpZWxkLnZhbHVlKTtcbiAgICBkZWxldGUgbmV3T2JqW2tleV07XG4gICAgdGhpcy5vbkNoYW5nZVZhbHVlKG5ld09iaik7XG4gIH0sXG5cbiAgb25Nb3ZlOiBmdW5jdGlvbiAoZnJvbUtleSwgdG9LZXkpIHtcbiAgICBpZiAoZnJvbUtleSAhPT0gdG9LZXkpIHtcbiAgICAgIHZhciBrZXlUb0lkID0gdGhpcy5zdGF0ZS5rZXlUb0lkO1xuICAgICAgdmFyIGtleU9yZGVyID0gdGhpcy5zdGF0ZS5rZXlPcmRlcjtcbiAgICAgIHZhciB0ZW1wRGlzcGxheUtleXMgPSB0aGlzLnN0YXRlLnRlbXBEaXNwbGF5S2V5cztcblxuICAgICAgdmFyIG5ld09iaiA9IF8uZXh0ZW5kKHRoaXMucHJvcHMuZmllbGQudmFsdWUpO1xuXG4gICAgICAvLyBJZiB3ZSBhbHJlYWR5IGhhdmUgdGhlIGtleSB3ZSdyZSBtb3ZpbmcgdG8sIHRoZW4gd2UgaGF2ZSB0byBjaGFuZ2UgdGhhdFxuICAgICAgLy8ga2V5IHRvIHNvbWV0aGluZyBlbHNlLlxuICAgICAgaWYgKGtleVRvSWRbdG9LZXldKSB7XG4gICAgICAgIC8vIE1ha2UgYSBuZXdcbiAgICAgICAgdmFyIHRlbXBUb0tleSA9IHRlbXBLZXkoa2V5VG9JZFt0b0tleV0pO1xuICAgICAgICB0ZW1wRGlzcGxheUtleXNba2V5VG9JZFt0b0tleV1dID0gdG9LZXk7XG4gICAgICAgIGtleVRvSWRbdGVtcFRvS2V5XSA9IGtleVRvSWRbdG9LZXldO1xuICAgICAgICBrZXlPcmRlcltrZXlPcmRlci5pbmRleE9mKHRvS2V5KV0gPSB0ZW1wVG9LZXk7XG4gICAgICAgIGRlbGV0ZSBrZXlUb0lkW3RvS2V5XTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAga2V5VG9JZDoga2V5VG9JZCxcbiAgICAgICAgICB0ZW1wRGlzcGxheUtleXM6IHRlbXBEaXNwbGF5S2V5cyxcbiAgICAgICAgICBrZXlPcmRlcjoga2V5T3JkZXJcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbmV3T2JqW3RlbXBUb0tleV0gPSBuZXdPYmpbdG9LZXldO1xuICAgICAgICBkZWxldGUgbmV3T2JqW3RvS2V5XTtcbiAgICAgIH1cblxuICAgICAgaWYgKCF0b0tleSkge1xuICAgICAgICB0b0tleSA9IHRlbXBLZXkoa2V5VG9JZFtmcm9tS2V5XSk7XG4gICAgICAgIHRlbXBEaXNwbGF5S2V5c1trZXlUb0lkW2Zyb21LZXldXSA9ICcnO1xuICAgICAgfVxuICAgICAga2V5VG9JZFt0b0tleV0gPSBrZXlUb0lkW2Zyb21LZXldO1xuICAgICAgZGVsZXRlIGtleVRvSWRbZnJvbUtleV07XG4gICAgICBrZXlPcmRlcltrZXlPcmRlci5pbmRleE9mKGZyb21LZXkpXSA9IHRvS2V5O1xuXG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAga2V5VG9JZDoga2V5VG9JZCxcbiAgICAgICAga2V5T3JkZXI6IGtleU9yZGVyLFxuICAgICAgICB0ZW1wRGlzcGxheUtleXM6IHRlbXBEaXNwbGF5S2V5c1xuICAgICAgfSk7XG5cbiAgICAgIG5ld09ialt0b0tleV0gPSBuZXdPYmpbZnJvbUtleV07XG4gICAgICBkZWxldGUgbmV3T2JqW2Zyb21LZXldO1xuXG4gICAgICB0aGlzLm9uQ2hhbmdlVmFsdWUobmV3T2JqKTtcblxuICAgICAgLy8gQ2hlY2sgaWYgb3VyIGZyb21LZXkgaGFzIG9wZW5lZCB1cCBhIHNwb3QuXG4gICAgICBpZiAoZnJvbUtleSAmJiBmcm9tS2V5ICE9PSB0b0tleSkge1xuICAgICAgICBpZiAoIShmcm9tS2V5IGluIG5ld09iaikpIHtcbiAgICAgICAgICBPYmplY3Qua2V5cyhuZXdPYmopLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgaWYgKCEoaXNUZW1wS2V5KGtleSkpKSB7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBpZCA9IGtleVRvSWRba2V5XTtcbiAgICAgICAgICAgIHZhciBkaXNwbGF5S2V5ID0gdGVtcERpc3BsYXlLZXlzW2lkXTtcbiAgICAgICAgICAgIGlmIChmcm9tS2V5ID09PSBkaXNwbGF5S2V5KSB7XG4gICAgICAgICAgICAgIHRoaXMub25Nb3ZlKGtleSwgZGlzcGxheUtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBnZXRGaWVsZHM6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHZhciBmaWVsZHMgPSBjb25maWcuY3JlYXRlQ2hpbGRGaWVsZHMoZmllbGQpO1xuXG4gICAgdmFyIGtleVRvRmllbGQgPSB7fTtcblxuICAgIF8uZWFjaChmaWVsZHMsIGZ1bmN0aW9uIChjaGlsZEZpZWxkKSB7XG4gICAgICBrZXlUb0ZpZWxkW2NoaWxkRmllbGQua2V5XSA9IGNoaWxkRmllbGQ7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5rZXlPcmRlci5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgcmV0dXJuIGtleVRvRmllbGRba2V5XTtcbiAgICB9KTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICB2YXIgZmllbGRzID0gdGhpcy5nZXRGaWVsZHMoKTtcblxuICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQnLCB7XG4gICAgICBmaWVsZDogZmllbGQsIHBsYWluOiB0aGlzLnByb3BzLnBsYWluXG4gICAgfSxcbiAgICAgIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3Nlcyl9LFxuICAgICAgICBjb25maWcuY3NzVHJhbnNpdGlvbldyYXBwZXIoXG4gICAgICAgICAgZmllbGRzLm1hcChmdW5jdGlvbiAoY2hpbGRGaWVsZCkge1xuICAgICAgICAgICAgdmFyIGRpc3BsYXlLZXkgPSB0aGlzLnN0YXRlLnRlbXBEaXNwbGF5S2V5c1t0aGlzLnN0YXRlLmtleVRvSWRbY2hpbGRGaWVsZC5rZXldXTtcbiAgICAgICAgICAgIGlmIChfLmlzVW5kZWZpbmVkKGRpc3BsYXlLZXkpKSB7XG4gICAgICAgICAgICAgIGRpc3BsYXlLZXkgPSBjaGlsZEZpZWxkLmtleTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnb2JqZWN0LWl0ZW0nLCB7XG4gICAgICAgICAgICAgIGtleTogdGhpcy5zdGF0ZS5rZXlUb0lkW2NoaWxkRmllbGQua2V5XSxcbiAgICAgICAgICAgICAgZmllbGQ6IGNoaWxkRmllbGQsXG4gICAgICAgICAgICAgIG9uTW92ZTogdGhpcy5vbk1vdmUsXG4gICAgICAgICAgICAgIG9uUmVtb3ZlOiB0aGlzLm9uUmVtb3ZlLFxuICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgICAgICAgICAgb25BY3Rpb246IHRoaXMub25CdWJibGVBY3Rpb24sXG4gICAgICAgICAgICAgIGRpc3BsYXlLZXk6IGRpc3BsYXlLZXksXG4gICAgICAgICAgICAgIGl0ZW1LZXk6IGNoaWxkRmllbGQua2V5XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgICksXG4gICAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdvYmplY3QtY29udHJvbCcsIHtmaWVsZDogZmllbGQsIG9uQXBwZW5kOiB0aGlzLm9uQXBwZW5kfSlcbiAgICAgIClcbiAgICApO1xuICB9XG59KTtcbiIsIi8vICMgcHJldHR5IGJvb2xlYW4gY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgcHJldHR5IGJvb2xlYW4gY29tcG9uZW50IHdpdGggbm9uLW5hdGl2ZSBkcm9wLWRvd25cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnUHJldHR5Qm9vbGVhbicsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAobmV3VmFsdWUpIHtcbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUobmV3VmFsdWUpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICB2YXIgY2hvaWNlcyA9IGNvbmZpZy5maWVsZEJvb2xlYW5DaG9pY2VzKGZpZWxkKTtcblxuICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQnLCB7XG4gICAgICBmaWVsZDogZmllbGQsIHBsYWluOiB0aGlzLnByb3BzLnBsYWluXG4gICAgfSwgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ3ByZXR0eS1zZWxlY3QtdmFsdWUnLCB7XG4gICAgICBjaG9pY2VzOiBjaG9pY2VzLCBmaWVsZDogZmllbGQsIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLCBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvblxuICAgIH0pKTtcbiAgfVxufSk7XG4iLCIvLyAjIHNlbGVjdCBjb21wb25lbnRcblxuLypcblJlbmRlciBzZWxlY3QgZWxlbWVudCB0byBnaXZlIGEgdXNlciBjaG9pY2VzIGZvciB0aGUgdmFsdWUgb2YgYSBmaWVsZC4gUmVuZGVycyBub24tbmF0aXZlXG5zZWxlY3QgZHJvcCBkb3duIGFuZCBzdXBwb3J0cyBmYW5jaWVyIHJlbmRlcmluZ3MuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ1ByZXR0eVNlbGVjdCcsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBjaG9pY2VzOiB0aGlzLnByb3BzLmNvbmZpZy5maWVsZFByZXR0eUNob2ljZXModGhpcy5wcm9wcy5maWVsZClcbiAgICB9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXdQcm9wcykge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgY2hvaWNlczogbmV3UHJvcHMuY29uZmlnLmZpZWxkUHJldHR5Q2hvaWNlcyhuZXdQcm9wcy5maWVsZClcbiAgICB9KTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywge1xuICAgICAgY29uZmlnOiBjb25maWcsIGZpZWxkOiBmaWVsZCwgcGxhaW46IHRoaXMucHJvcHMucGxhaW5cbiAgICB9LCBjb25maWcuY3JlYXRlRWxlbWVudCgncHJldHR5LXNlbGVjdC12YWx1ZScsIHtcbiAgICAgIGNob2ljZXM6IHRoaXMuc3RhdGUuY2hvaWNlcywgZmllbGQ6IGZpZWxkLCBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZVZhbHVlLCBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvblxuICAgIH0pKTtcbiAgfVxufSk7XG4iLCIndXNlIHN0cmljdCc7XG4vKiBnbG9iYWwgQ29kZU1pcnJvciAqL1xuLyplc2xpbnQgbm8tc2NyaXB0LXVybDowICovXG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFRhZ1RyYW5zbGF0b3IgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3RhZy10cmFuc2xhdG9yJyk7XG52YXIgXyA9IHJlcXVpcmUoJy4uLy4uL3VuZGFzaCcpO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG52YXIgUHJldHR5VGFnID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjbGFzc2VzID0gY3goXy5leHRlbmQoe30sIHRoaXMucHJvcHMuY2xhc3NlcywgeydwcmV0dHktcGFydCc6IHRydWV9KSk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPHNwYW4gY2xhc3NOYW1lPXtjbGFzc2VzfSBvbkNsaWNrPXt0aGlzLnByb3BzLm9uQ2xpY2t9PlxuICAgICAgICB7dGhpcy5wcm9wcy5jaGlsZHJlbn1cbiAgICAgIDwvc3Bhbj5cbiAgICApO1xuICB9XG59KTtcblxuLypcbiAgIEVkaXRvciBmb3IgdGFnZ2VkIHRleHQuIFJlbmRlcnMgdGV4dCBsaWtlIFwiaGVsbG8ge3tmaXJzdE5hbWV9fVwiXG4gICB3aXRoIHJlcGxhY2VtZW50IGxhYmVscyByZW5kZXJlZCBpbiBhIHBpbGwgYm94LiBEZXNpZ25lZCB0byBsb2FkXG4gICBxdWlja2x5IHdoZW4gbWFueSBzZXBhcmF0ZSBpbnN0YW5jZXMgb2YgaXQgYXJlIG9uIHRoZSBzYW1lXG4gICBwYWdlLlxuXG4gICBVc2VzIENvZGVNaXJyb3IgdG8gZWRpdCB0ZXh0LiBUbyBzYXZlIG1lbW9yeSB0aGUgQ29kZU1pcnJvciBub2RlIGlzXG4gICBpbnN0YW50aWF0ZWQgd2hlbiB0aGUgdXNlciBtb3ZlcyB0aGUgbW91c2UgaW50byB0aGUgZWRpdCBhcmVhLlxuICAgSW5pdGlhbGx5IGEgcmVhZC1vbmx5IHZpZXcgdXNpbmcgYSBzaW1wbGUgZGl2IGlzIHNob3duLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6ICdQcmV0dHlUZXh0JyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKCctLS0tLS0tIHB0MicpO1xuICAgIHRoaXMuY3JlYXRlRWRpdG9yKCk7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkVXBkYXRlOiBmdW5jdGlvbihwcmV2UHJvcHMsIHByZXZTdGF0ZSkge1xuICAgIGlmIChwcmV2U3RhdGUuY29kZU1pcnJvck1vZGUgIT09IHRoaXMuc3RhdGUuY29kZU1pcnJvck1vZGUpIHtcbiAgICAgIC8vIENoYW5nZWQgZnJvbSBjb2RlIG1pcnJvciBtb2RlIHRvIHJlYWQgb25seSBtb2RlIG9yIHZpY2UgdmVyc2EsXG4gICAgICAvLyBzbyBzZXR1cCB0aGUgb3RoZXIgZWRpdG9yLlxuICAgICAgdGhpcy5jcmVhdGVFZGl0b3IoKTtcbiAgICB9XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLnN0YXRlLmNvZGVNaXJyb3JNb2RlKSB7XG4gICAgICB0aGlzLnJlbW92ZUNvZGVNaXJyb3JFZGl0b3IoKTtcbiAgICB9XG4gIH0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZWN0ZWRDaG9pY2VzID0gdGhpcy5wcm9wcy5jb25maWcuZmllbGRTZWxlY3RlZFJlcGxhY2VDaG9pY2VzKHRoaXMucHJvcHMuZmllbGQpO1xuICAgIHZhciByZXBsYWNlQ2hvaWNlcyA9IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkUmVwbGFjZUNob2ljZXModGhpcy5wcm9wcy5maWVsZCk7XG4gICAgdmFyIHRyYW5zbGF0b3IgPSBUYWdUcmFuc2xhdG9yKHNlbGVjdGVkQ2hvaWNlcy5jb25jYXQocmVwbGFjZUNob2ljZXMpLCB0aGlzLnByb3BzLmNvbmZpZy5odW1hbml6ZSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgdmFsdWU6IHRoaXMucHJvcHMuZmllbGQudmFsdWUsXG4gICAgICBjb2RlTWlycm9yTW9kZTogZmFsc2UsXG4gICAgICBpc0Nob2ljZXNPcGVuOiBmYWxzZSxcbiAgICAgIHJlcGxhY2VDaG9pY2VzOiByZXBsYWNlQ2hvaWNlcyxcbiAgICAgIHRyYW5zbGF0b3I6IHRyYW5zbGF0b3JcbiAgICB9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uKG5leHRQcm9wcykge1xuICAgIHZhciBzZWxlY3RlZENob2ljZXMgPSB0aGlzLnByb3BzLmNvbmZpZy5maWVsZFNlbGVjdGVkUmVwbGFjZUNob2ljZXModGhpcy5wcm9wcy5maWVsZCk7XG4gICAgdmFyIHJlcGxhY2VDaG9pY2VzID0gdGhpcy5wcm9wcy5jb25maWcuZmllbGRSZXBsYWNlQ2hvaWNlcyhuZXh0UHJvcHMuZmllbGQpO1xuICAgIHZhciBuZXh0U3RhdGUgPSB7XG4gICAgICByZXBsYWNlQ2hvaWNlczogcmVwbGFjZUNob2ljZXMsXG4gICAgICB0cmFuc2xhdG9yOiBUYWdUcmFuc2xhdG9yKHNlbGVjdGVkQ2hvaWNlcy5jb25jYXQocmVwbGFjZUNob2ljZXMpLCB0aGlzLnByb3BzLmNvbmZpZy5odW1hbml6ZSlcbiAgICB9O1xuXG4gICAgaWYgKHRoaXMuc3RhdGUudmFsdWUgIT09IG5leHRQcm9wcy5maWVsZC52YWx1ZSAmJiBuZXh0UHJvcHMuZmllbGQudmFsdWUpIHtcbiAgICAgIG5leHRTdGF0ZS52YWx1ZSA9IG5leHRQcm9wcy5maWVsZC52YWx1ZTtcbiAgICB9XG5cbiAgICB0aGlzLnNldFN0YXRlKG5leHRTdGF0ZSk7XG4gIH0sXG5cbiAgaGFuZGxlQ2hvaWNlU2VsZWN0aW9uOiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIHBvcyA9IHRoaXMuc3RhdGUuc2VsZWN0ZWRUYWdQb3M7XG4gICAgdmFyIHRhZyA9ICd7eycgKyBrZXkgKyAnfX0nO1xuXG4gICAgaWYgKHBvcykge1xuICAgICAgdGhpcy5jb2RlTWlycm9yLnJlcGxhY2VSYW5nZSh0YWcsIHtsaW5lOiBwb3MubGluZSwgY2g6IHBvcy5zdGFydH0sIHtsaW5lOiBwb3MubGluZSwgY2g6IHBvcy5zdG9wfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY29kZU1pcnJvci5yZXBsYWNlU2VsZWN0aW9uKHRhZywgJ2VuZCcpO1xuICAgIH1cbiAgICB0aGlzLmNvZGVNaXJyb3IuZm9jdXMoKTtcblxuICAgIHRoaXMuc2V0U3RhdGUoeyBpc0Nob2ljZXNPcGVuOiBmYWxzZSwgc2VsZWN0ZWRUYWdQb3M6IG51bGwgfSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuICAgIHZhciBwcm9wcyA9IHsgZmllbGQ6IGZpZWxkLCBwbGFpbjogdGhpcy5wcm9wcy5wbGFpbiB9O1xuICAgIHZhciB0YWJJbmRleCA9IGZpZWxkLnRhYkluZGV4O1xuICAgIHZhciB0ZXh0Qm94Q2xhc3NlcyA9IGN4KF8uZXh0ZW5kKHt9LCB0aGlzLnByb3BzLmNsYXNzZXMsIHsncHJldHR5LXRleHQtYm94JzogdHJ1ZX0pKTtcblxuICAgIHZhciBvbkluc2VydENsaWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7c2VsZWN0ZWRUYWdQb3M6IG51bGx9KTtcbiAgICAgIHRoaXMub25Ub2dnbGVDaG9pY2VzKCk7XG4gICAgfTtcbiAgICB2YXIgaW5zZXJ0QnRuID0gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2luc2VydC1idXR0b24nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cmVmOiAndG9nZ2xlJywgb25DbGljazogb25JbnNlcnRDbGljay5iaW5kKHRoaXMpfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0luc2VydC4uLicpO1xuXG4gICAgdmFyIGNob2ljZXMgPSBjb25maWcuY3JlYXRlRWxlbWVudCgnY2hvaWNlcycsIHtcbiAgICAgIHJlZjogJ2Nob2ljZXMnLFxuICAgICAgY2hvaWNlczogdGhpcy5zdGF0ZS5yZXBsYWNlQ2hvaWNlcyxcbiAgICAgIG9wZW46IHRoaXMuc3RhdGUuaXNDaG9pY2VzT3BlbixcbiAgICAgIGlnbm9yZUNsb3NlTm9kZXM6IHRoaXMuZ2V0Q2xvc2VJZ25vcmVOb2RlcyxcbiAgICAgIG9uU2VsZWN0OiB0aGlzLmhhbmRsZUNob2ljZVNlbGVjdGlvbixcbiAgICAgIG9uQ2xvc2U6IHRoaXMub25DbG9zZUNob2ljZXNcbiAgICB9KTtcblxuICAgIC8vIFJlbmRlciByZWFkLW9ubHkgdmVyc2lvbi5cbiAgICB2YXIgZWxlbWVudCA9IChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPSdwcmV0dHktdGV4dC13cmFwcGVyJyBvbk1vdXNlRW50ZXI9e3RoaXMuc3dpdGNoVG9Db2RlTWlycm9yfT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e3RleHRCb3hDbGFzc2VzfSB0YWJJbmRleD17dGFiSW5kZXh9IG9uRm9jdXM9e3RoaXMub25Gb2N1c0FjdGlvbn0gb25CbHVyPXt0aGlzLm9uQmx1ckFjdGlvbn0+XG4gICAgICAgICAgPGRpdiByZWY9J3RleHRCb3gnIGNsYXNzTmFtZT0naW50ZXJuYWwtdGV4dC13cmFwcGVyJyAvPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICB7aW5zZXJ0QnRufVxuICAgICAgICB7Y2hvaWNlc31cbiAgICAgIDwvZGl2PlxuICAgICk7XG5cbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywgcHJvcHMsIGVsZW1lbnQpO1xuICB9LFxuXG4gIGdldENsb3NlSWdub3JlTm9kZXM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZWZzLnRvZ2dsZS5nZXRET01Ob2RlKCk7XG4gIH0sXG5cbiAgb25Ub2dnbGVDaG9pY2VzOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zZXRDaG9pY2VzT3BlbighdGhpcy5zdGF0ZS5pc0Nob2ljZXNPcGVuKTtcbiAgfSxcblxuICBzZXRDaG9pY2VzT3BlbjogZnVuY3Rpb24gKGlzT3Blbikge1xuICAgIHZhciBhY3Rpb24gPSBpc09wZW4gPyAnb3Blbi1yZXBsYWNlbWVudHMnIDogJ2Nsb3NlLXJlcGxhY2VtZW50cyc7XG4gICAgdGhpcy5vblN0YXJ0QWN0aW9uKGFjdGlvbik7XG4gICAgdGhpcy5zZXRTdGF0ZSh7IGlzQ2hvaWNlc09wZW46IGlzT3BlbiB9KTtcbiAgfSxcblxuICBvbkNsb3NlQ2hvaWNlczogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnN0YXRlLmlzQ2hvaWNlc09wZW4pIHtcbiAgICAgIHRoaXMuc2V0Q2hvaWNlc09wZW4oZmFsc2UpO1xuICAgIH1cbiAgfSxcblxuICBjcmVhdGVFZGl0b3I6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5jb2RlTWlycm9yTW9kZSkge1xuICAgICAgdGhpcy5jcmVhdGVDb2RlTWlycm9yRWRpdG9yKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY3JlYXRlUmVhZG9ubHlFZGl0b3IoKTtcbiAgICB9XG4gIH0sXG5cbiAgY3JlYXRlQ29kZU1pcnJvckVkaXRvcjogZnVuY3Rpb24gKCkge1xuICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgbGluZVdyYXBwaW5nOiB0cnVlLFxuICAgICAgdGFiaW5kZXg6IHRoaXMucHJvcHMudGFiSW5kZXgsXG4gICAgICB2YWx1ZTogdGhpcy5zdGF0ZS52YWx1ZSxcbiAgICAgIGV4dHJhS2V5czoge1xuICAgICAgICBUYWI6IGZhbHNlXG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciB0ZXh0Qm94ID0gdGhpcy5yZWZzLnRleHRCb3guZ2V0RE9NTm9kZSgpO1xuICAgIHRleHRCb3guaW5uZXJIVE1MID0gJyc7IC8vIHJlbGVhc2UgYW55IHByZXZpb3VzIHJlYWQtb25seSBjb250ZW50IHNvIGl0IGNhbiBiZSBHQydlZFxuXG4gICAgdGhpcy5jb2RlTWlycm9yID0gQ29kZU1pcnJvcih0ZXh0Qm94LCBvcHRpb25zKTtcbiAgICB0aGlzLmNvZGVNaXJyb3Iub24oJ2NoYW5nZScsIHRoaXMub25Db2RlTWlycm9yQ2hhbmdlKTtcblxuICAgIHRoaXMudGFnQ29kZU1pcnJvcigpO1xuICB9LFxuXG4gIHRhZ0NvZGVNaXJyb3I6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcG9zaXRpb25zID0gdGhpcy5zdGF0ZS50cmFuc2xhdG9yLmdldFRhZ1Bvc2l0aW9ucyh0aGlzLmNvZGVNaXJyb3IuZ2V0VmFsdWUoKSk7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIHRhZ09wcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHBvc2l0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChwb3MpIHtcbiAgICAgICAgdmFyIG5vZGUgPSBzZWxmLmNyZWF0ZVRhZ05vZGUocG9zKTtcbiAgICAgICAgc2VsZi5jb2RlTWlycm9yLm1hcmtUZXh0KHtsaW5lOiBwb3MubGluZSwgY2g6IHBvcy5zdGFydH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7bGluZTogcG9zLmxpbmUsIGNoOiBwb3Muc3RvcH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cmVwbGFjZWRXaXRoOiBub2RlLCBoYW5kbGVNb3VzZUV2ZW50czogdHJ1ZX0pO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHRoaXMuY29kZU1pcnJvci5vcGVyYXRpb24odGFnT3BzKTtcbiAgfSxcblxuICBvbkNvZGVNaXJyb3JDaGFuZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy51cGRhdGluZ0NvZGVNaXJyb3IpIHtcbiAgICAgIC8vIGF2b2lkIHJlY3Vyc2l2ZSB1cGRhdGUgY3ljbGUsIGFuZCBtYXJrIHRoZSBjb2RlIG1pcnJvciBtYW51YWwgdXBkYXRlIGFzIGRvbmVcbiAgICAgIHRoaXMudXBkYXRpbmdDb2RlTWlycm9yID0gZmFsc2U7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIG5ld1ZhbHVlID0gdGhpcy5jb2RlTWlycm9yLmdldFZhbHVlKCk7XG4gICAgdGhpcy5vbkNoYW5nZVZhbHVlKG5ld1ZhbHVlKTtcbiAgICB0aGlzLnNldFN0YXRlKHt2YWx1ZTogbmV3VmFsdWV9KTtcbiAgICB0aGlzLnRhZ0NvZGVNaXJyb3IoKTtcbiAgfSxcblxuICBnZXRUYWdDbGFzc2VzOiBmdW5jdGlvbiAodGFnKSB7XG4gICAgdmFyIGNob2ljZSA9IF8uZmluZCh0aGlzLnN0YXRlLnJlcGxhY2VDaG9pY2VzLCAoYykgPT4gYy52YWx1ZSA9PT0gdGFnKTtcbiAgICByZXR1cm4gY2hvaWNlICYmIGNob2ljZS50YWdDbGFzc2VzIHx8IHt9O1xuICB9LFxuXG4gIGNyZWF0ZVJlYWRvbmx5RWRpdG9yOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRleHRCb3hOb2RlID0gdGhpcy5yZWZzLnRleHRCb3guZ2V0RE9NTm9kZSgpO1xuXG4gICAgdmFyIHRva2VucyA9IHRoaXMuc3RhdGUudHJhbnNsYXRvci50b2tlbml6ZSh0aGlzLnN0YXRlLnZhbHVlKTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIG5vZGVzID0gdG9rZW5zLm1hcChmdW5jdGlvbiAocGFydCkge1xuICAgICAgaWYgKHBhcnQudHlwZSA9PT0gJ3RhZycpIHtcbiAgICAgICAgdmFyIHRhZ0NsYXNzZXMgPSBzZWxmLmdldFRhZ0NsYXNzZXMocGFydC52YWx1ZSk7XG4gICAgICAgIHJldHVybiA8UHJldHR5VGFnIGNsYXNzZXM9e3RhZ0NsYXNzZXN9PntzZWxmLnN0YXRlLnRyYW5zbGF0b3IuZ2V0TGFiZWwocGFydC52YWx1ZSl9PC9QcmV0dHlUYWc+O1xuICAgICAgfVxuICAgICAgcmV0dXJuIDxzcGFuPntwYXJ0LnZhbHVlfTwvc3Bhbj47XG4gICAgfSk7XG5cbiAgICBSZWFjdC5yZW5kZXIoPHNwYW4+e25vZGVzfTwvc3Bhbj4sIHRleHRCb3hOb2RlKTtcbiAgfSxcblxuICByZW1vdmVDb2RlTWlycm9yRWRpdG9yOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRleHRCb3hOb2RlID0gdGhpcy5yZWZzLnRleHRCb3guZ2V0RE9NTm9kZSgpO1xuICAgIHZhciBjbU5vZGUgPSB0ZXh0Qm94Tm9kZS5maXJzdENoaWxkO1xuICAgIHRleHRCb3hOb2RlLnJlbW92ZUNoaWxkKGNtTm9kZSk7XG4gICAgdGhpcy5jb2RlTWlycm9yID0gbnVsbDtcbiAgfSxcblxuICBzd2l0Y2hUb0NvZGVNaXJyb3I6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuc3RhdGUuY29kZU1pcnJvck1vZGUpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe2NvZGVNaXJyb3JNb2RlOiB0cnVlfSk7XG4gICAgfVxuICB9LFxuXG4gIGNyZWF0ZVRhZ05vZGU6IGZ1bmN0aW9uIChwb3MpIHtcbiAgICB2YXIgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICB2YXIgbGFiZWwgPSB0aGlzLnN0YXRlLnRyYW5zbGF0b3IuZ2V0TGFiZWwocG9zLnRhZyk7XG4gICAgdmFyIHRhZ0NsYXNzZXMgPSB0aGlzLmdldFRhZ0NsYXNzZXMocG9zLnRhZyk7XG5cbiAgICB2YXIgb25UYWdDbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGVkVGFnUG9zOiBwb3N9KTtcbiAgICAgIHRoaXMub25Ub2dnbGVDaG9pY2VzKCk7XG4gICAgfTtcblxuICAgIFJlYWN0LnJlbmRlcihcbiAgICAgIDxQcmV0dHlUYWcgY2xhc3Nlcz17dGFnQ2xhc3Nlc30gb25DbGljaz17b25UYWdDbGljay5iaW5kKHRoaXMpfT57bGFiZWx9PC9QcmV0dHlUYWc+LFxuICAgICAgbm9kZVxuICAgICk7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cbn0pO1xuIiwiLy8gIyBzZWxlY3QgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgc2VsZWN0IGVsZW1lbnQgdG8gZ2l2ZSBhIHVzZXIgY2hvaWNlcyBmb3IgdGhlIHZhbHVlIG9mIGEgZmllbGQuIE5vdGVcbml0IHNob3VsZCBzdXBwb3J0IHZhbHVlcyBvdGhlciB0aGFuIHN0cmluZ3MuIEN1cnJlbnRseSB0aGlzIGlzIG9ubHkgdGVzdGVkIGZvclxuYm9vbGVhbiB2YWx1ZXMsIGJ1dCBpdCBfc2hvdWxkXyB3b3JrIGZvciBvdGhlciB2YWx1ZXMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ1NlbGVjdCcsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBjaG9pY2VzOiB0aGlzLnByb3BzLmNvbmZpZy5maWVsZENob2ljZXModGhpcy5wcm9wcy5maWVsZClcbiAgICB9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXdQcm9wcykge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgY2hvaWNlczogbmV3UHJvcHMuY29uZmlnLmZpZWxkQ2hvaWNlcyhuZXdQcm9wcy5maWVsZClcbiAgICB9KTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywge1xuICAgICAgY29uZmlnOiBjb25maWcsIGZpZWxkOiBmaWVsZCwgcGxhaW46IHRoaXMucHJvcHMucGxhaW5cbiAgICB9LCBjb25maWcuY3JlYXRlRWxlbWVudCgnc2VsZWN0LXZhbHVlJywge1xuICAgICAgY2hvaWNlczogdGhpcy5zdGF0ZS5jaG9pY2VzLCBmaWVsZDogZmllbGQsIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlVmFsdWUsIG9uQWN0aW9uOiB0aGlzLm9uQnViYmxlQWN0aW9uXG4gICAgfSkpO1xuICB9XG59KTtcbiIsIi8vICMgc2luZ2xlLWxpbmUtc3RyaW5nIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIGEgc2luZ2xlIGxpbmUgdGV4dCBpbnB1dC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdTaW5nbGVMaW5lU3RyaW5nJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHRoaXMub25DaGFuZ2VWYWx1ZShldmVudC50YXJnZXQudmFsdWUpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQnLCB7XG4gICAgICBjb25maWc6IGNvbmZpZywgZmllbGQ6IGZpZWxkLCBwbGFpbjogdGhpcy5wcm9wcy5wbGFpblxuICAgIH0sIFIuaW5wdXQoe1xuICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgdmFsdWU6IHRoaXMucHJvcHMuZmllbGQudmFsdWUsXG4gICAgICBjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcyksXG4gICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgIG9uRm9jdXM6IHRoaXMub25Gb2N1c0FjdGlvbixcbiAgICAgIG9uQmx1cjogdGhpcy5vbkJsdXJBY3Rpb25cbiAgICB9KSk7XG4gIH1cbn0pO1xuIiwiLy8gIyBzdHJpbmcgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgYSBmaWVsZCB0aGF0IGNhbiBlZGl0IGEgc3RyaW5nIHZhbHVlLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ1N0cmluZycsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywge1xuICAgICAgY29uZmlnOiBjb25maWcsIGZpZWxkOiBmaWVsZCwgcGxhaW46IHRoaXMucHJvcHMucGxhaW5cbiAgICB9LCBSLnRleHRhcmVhKHtcbiAgICAgIHZhbHVlOiBmaWVsZC52YWx1ZSxcbiAgICAgIGNsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSxcbiAgICAgIHJvd3M6IGZpZWxkLnJvd3MgfHwgdGhpcy5wcm9wcy5yb3dzLFxuICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsXG4gICAgICBvbkZvY3VzOiB0aGlzLm9uRm9jdXNBY3Rpb24sXG4gICAgICBvbkJsdXI6IHRoaXMub25CbHVyQWN0aW9uXG4gICAgfSkpO1xuICB9XG59KTtcbiIsIi8vICMgdW5rbm93biBjb21wb25lbnRcblxuLypcblJlbmRlciBhIGZpZWxkIHdpdGggYW4gdW5rbm93biB0eXBlLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ1Vua25vd24nLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSLmRpdih7fSxcbiAgICAgIFIuZGl2KHt9LCAnQ29tcG9uZW50IG5vdCBmb3VuZCBmb3I6ICcpLFxuICAgICAgUi5wcmUoe30sIEpTT04uc3RyaW5naWZ5KHRoaXMucHJvcHMuZmllbGQucmF3RmllbGRUZW1wbGF0ZSwgbnVsbCwgMikpXG4gICAgKTtcbiAgfVxuXG59KTtcbiIsIi8vICMgYWRkLWl0ZW0gY29tcG9uZW50XG5cbi8qXG5UaGUgYWRkIGJ1dHRvbiB0byBhcHBlbmQgYW4gaXRlbSB0byBhIGZpZWxkLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0FkZEl0ZW0nLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxhYmVsOiAnW2FkZF0nXG4gICAgfTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSLnNwYW4oe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSwgb25DbGljazogdGhpcy5wcm9wcy5vbkNsaWNrfSwgdGhpcy5wcm9wcy5sYWJlbCk7XG4gIH1cbn0pO1xuIiwiLy8gIyBhcnJheS1jb250cm9sIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIHRoZSBpdGVtIHR5cGUgY2hvaWNlcyBhbmQgdGhlIGFkZCBidXR0b24gZm9yIGFuIGFycmF5LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0FycmF5Q29udHJvbCcsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZmllbGRUZW1wbGF0ZUluZGV4OiAwXG4gICAgfTtcbiAgfSxcblxuICBvblNlbGVjdDogZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBmaWVsZFRlbXBsYXRlSW5kZXg6IGluZGV4XG4gICAgfSk7XG4gIH0sXG5cbiAgb25BcHBlbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnByb3BzLm9uQXBwZW5kKHRoaXMuc3RhdGUuZmllbGRUZW1wbGF0ZUluZGV4KTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuXG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcbiAgICB2YXIgZmllbGRUZW1wbGF0ZXMgPSBjb25maWcuZmllbGRJdGVtRmllbGRUZW1wbGF0ZXMoZmllbGQpO1xuXG4gICAgdmFyIHR5cGVDaG9pY2VzID0gbnVsbDtcblxuICAgIGlmIChmaWVsZFRlbXBsYXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICB0eXBlQ2hvaWNlcyA9IGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZC10ZW1wbGF0ZS1jaG9pY2VzJywge1xuICAgICAgICBmaWVsZDogZmllbGQsIGZpZWxkVGVtcGxhdGVJbmRleDogdGhpcy5zdGF0ZS5maWVsZFRlbXBsYXRlSW5kZXgsIG9uU2VsZWN0OiB0aGlzLm9uU2VsZWN0XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKX0sXG4gICAgICB0eXBlQ2hvaWNlcywgJyAnLFxuICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2FkZC1pdGVtJywge2ZpZWxkOiBmaWVsZCwgb25DbGljazogdGhpcy5vbkFwcGVuZH0pXG4gICAgKTtcbiAgfVxufSk7XG4iLCIvLyAjIGFycmF5LWl0ZW0tY29udHJvbCBjb21wb25lbnRcblxuLypcblJlbmRlciB0aGUgcmVtb3ZlIGFuZCBtb3ZlIGJ1dHRvbnMgZm9yIGFuIGFycmF5IGZpZWxkLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnQXJyYXlJdGVtQ29udHJvbCcsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBvbk1vdmVCYWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5wcm9wcy5vbk1vdmUodGhpcy5wcm9wcy5pbmRleCwgdGhpcy5wcm9wcy5pbmRleCAtIDEpO1xuICB9LFxuXG4gIG9uTW92ZUZvcndhcmQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnByb3BzLm9uTW92ZSh0aGlzLnByb3BzLmluZGV4LCB0aGlzLnByb3BzLmluZGV4ICsgMSk7XG4gIH0sXG5cbiAgb25SZW1vdmU6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnByb3BzLm9uUmVtb3ZlKHRoaXMucHJvcHMuaW5kZXgpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKX0sXG4gICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgncmVtb3ZlLWl0ZW0nLCB7ZmllbGQ6IGZpZWxkLCBvbkNsaWNrOiB0aGlzLm9uUmVtb3ZlLCBvbk1heWJlUmVtb3ZlOiB0aGlzLnByb3BzLm9uTWF5YmVSZW1vdmV9KSxcbiAgICAgIHRoaXMucHJvcHMuaW5kZXggPiAwID8gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ21vdmUtaXRlbS1iYWNrJywge2ZpZWxkOiBmaWVsZCwgb25DbGljazogdGhpcy5vbk1vdmVCYWNrfSkgOiBudWxsLFxuICAgICAgdGhpcy5wcm9wcy5pbmRleCA8ICh0aGlzLnByb3BzLm51bUl0ZW1zIC0gMSkgPyBjb25maWcuY3JlYXRlRWxlbWVudCgnbW92ZS1pdGVtLWZvcndhcmQnLCB7ZmllbGQ6IGZpZWxkLCBvbkNsaWNrOiB0aGlzLm9uTW92ZUZvcndhcmR9KSA6IG51bGxcbiAgICApO1xuICB9XG59KTtcbiIsIi8vICMgYXJyYXktaXRlbS12YWx1ZSBjb21wb25lbnRcblxuLypcblJlbmRlciB0aGUgdmFsdWUgb2YgYW4gYXJyYXkgaXRlbS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0FycmF5SXRlbVZhbHVlJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIG9uQ2hhbmdlRmllbGQ6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgaW5mbykge1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UodGhpcy5wcm9wcy5pbmRleCwgbmV3VmFsdWUsIGluZm8pO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKX0sXG4gICAgICBjb25maWcuY3JlYXRlRmllbGRFbGVtZW50KHtmaWVsZDogZmllbGQsIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlRmllbGQsIG9uQWN0aW9uOiB0aGlzLm9uQnViYmxlQWN0aW9ufSlcbiAgICApO1xuICB9XG59KTtcbiIsIi8vICMgYXJyYXktaXRlbSBjb21wb25lbnRcblxuLypcblJlbmRlciBhbiBhcnJheSBpdGVtLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG52YXIgXyA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdBcnJheUl0ZW0nLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlzTWF5YmVSZW1vdmluZzogZmFsc2VcbiAgICB9O1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICBvbk1heWJlUmVtb3ZlOiBmdW5jdGlvbiAoaXNNYXliZVJlbW92aW5nKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBpc01heWJlUmVtb3Zpbmc6IGlzTWF5YmVSZW1vdmluZ1xuICAgIH0pO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHZhciBjbGFzc2VzID0gXy5leHRlbmQoe30sIHRoaXMucHJvcHMuY2xhc3Nlcyk7XG5cbiAgICBpZiAodGhpcy5zdGF0ZS5pc01heWJlUmVtb3ZpbmcpIHtcbiAgICAgIGNsYXNzZXNbJ21heWJlLXJlbW92aW5nJ10gPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiBjeChjbGFzc2VzKX0sXG4gICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgnYXJyYXktaXRlbS12YWx1ZScsIHtmaWVsZDogZmllbGQsIGluZGV4OiB0aGlzLnByb3BzLmluZGV4LFxuICAgICAgICBvbkNoYW5nZTogdGhpcy5wcm9wcy5vbkNoYW5nZSwgb25BY3Rpb246IHRoaXMub25CdWJibGVBY3Rpb259KSxcbiAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdhcnJheS1pdGVtLWNvbnRyb2wnLCB7ZmllbGQ6IGZpZWxkLCBpbmRleDogdGhpcy5wcm9wcy5pbmRleCwgbnVtSXRlbXM6IHRoaXMucHJvcHMubnVtSXRlbXMsXG4gICAgICAgIG9uTW92ZTogdGhpcy5wcm9wcy5vbk1vdmUsIG9uUmVtb3ZlOiB0aGlzLnByb3BzLm9uUmVtb3ZlLCBvbk1heWJlUmVtb3ZlOiB0aGlzLm9uTWF5YmVSZW1vdmV9KVxuICAgICk7XG4gIH1cbn0pO1xuIiwiLy8gIyBDaG9pY2VzIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIGN1c3RvbWl6ZWQgKG5vbi1uYXRpdmUpIGRyb3Bkb3duIGNob2ljZXMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgXyA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdDaG9pY2VzJyxcblxuICBtaXhpbnM6IFtcbiAgICByZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyksXG4gICAgLy9wbHVnaW4ucmVxdWlyZSgnbWl4aW4ucmVzaXplJyksXG4gICAgLy9wbHVnaW4ucmVxdWlyZSgnbWl4aW4uc2Nyb2xsJyksXG4gICAgcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2NsaWNrLW91dHNpZGUnKVxuICBdLFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBtYXhIZWlnaHQ6IG51bGwsXG4gICAgICBvcGVuOiB0aGlzLnByb3BzLm9wZW5cbiAgICB9O1xuICB9LFxuXG4gIGdldElnbm9yZUNsb3NlTm9kZXM6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMucHJvcHMuaWdub3JlQ2xvc2VOb2Rlcykge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICB2YXIgbm9kZXMgPSB0aGlzLnByb3BzLmlnbm9yZUNsb3NlTm9kZXMoKTtcbiAgICBpZiAoIV8uaXNBcnJheShub2RlcykpIHtcbiAgICAgIG5vZGVzID0gW25vZGVzXTtcbiAgICB9XG4gICAgcmV0dXJuIG5vZGVzO1xuICB9LFxuXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zZXRPbkNsaWNrT3V0c2lkZSgnY2hvaWNlcycsIGZ1bmN0aW9uIChldmVudCkge1xuXG4gICAgICAvLyBNYWtlIHN1cmUgd2UgZG9uJ3QgZmluZCBhbnkgbm9kZXMgdG8gaWdub3JlLlxuICAgICAgaWYgKCFfLmZpbmQodGhpcy5nZXRJZ25vcmVDbG9zZU5vZGVzKCksIGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzTm9kZUluc2lkZShldmVudC50YXJnZXQsIG5vZGUpO1xuICAgICAgfS5iaW5kKHRoaXMpKSkge1xuICAgICAgICB0aGlzLnByb3BzLm9uQ2xvc2UoKTtcbiAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5hZGp1c3RTaXplKCk7XG4gIH0sXG5cbiAgb25TZWxlY3Q6IGZ1bmN0aW9uIChjaG9pY2UpIHtcbiAgICB0aGlzLnByb3BzLm9uU2VsZWN0KGNob2ljZS52YWx1ZSk7XG4gIH0sXG5cbiAgb25DaG9pY2VBY3Rpb246IGZ1bmN0aW9uIChjaG9pY2UpIHtcbiAgICB0aGlzLnByb3BzLm9uQ2hvaWNlQWN0aW9uKGNob2ljZSk7XG4gIH0sXG5cbiAgb25SZXNpemVXaW5kb3c6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmFkanVzdFNpemUoKTtcbiAgfSxcblxuICBvblNjcm9sbFdpbmRvdzogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuYWRqdXN0U2l6ZSgpO1xuICB9LFxuXG4gIGFkanVzdFNpemU6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5yZWZzLmNob2ljZXMpIHtcbiAgICAgIHZhciBub2RlID0gdGhpcy5yZWZzLmNob2ljZXMuZ2V0RE9NTm9kZSgpO1xuICAgICAgdmFyIHJlY3QgPSBub2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgdmFyIHRvcCA9IHJlY3QudG9wO1xuICAgICAgdmFyIHdpbmRvd0hlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICAgIHZhciBoZWlnaHQgPSB3aW5kb3dIZWlnaHQgLSB0b3A7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgbWF4SGVpZ2h0OiBoZWlnaHRcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV4dFByb3BzKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7b3BlbjogbmV4dFByb3BzLm9wZW59LCBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmFkanVzdFNpemUoKTtcbiAgICB9LmJpbmQodGhpcykpO1xuICB9LFxuXG4gIG9uU2Nyb2xsOiBmdW5jdGlvbiAoKSB7XG4gICAgLy8gY29uc29sZS5sb2coJ3N0b3AgdGhhdCEnKVxuICAgIC8vIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgLy8gZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH0sXG5cbiAgb25XaGVlbDogZnVuY3Rpb24gKCkge1xuICAgIC8vIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgLy8gZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG5cbiAgICB2YXIgY2hvaWNlcyA9IHRoaXMucHJvcHMuY2hvaWNlcztcblxuICAgIGlmIChjaG9pY2VzICYmIGNob2ljZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICBjaG9pY2VzID0gW3t2YWx1ZTogJy8vL2VtcHR5Ly8vJ31dO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnByb3BzLm9wZW4pIHtcbiAgICAgIHJldHVybiBSLmRpdih7cmVmOiAnY29udGFpbmVyJywgb25XaGVlbDogdGhpcy5vbldoZWVsLCBvblNjcm9sbDogdGhpcy5vblNjcm9sbCxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnY2hvaWNlcy1jb250YWluZXInLCBzdHlsZToge1xuICAgICAgICB1c2VyU2VsZWN0OiAnbm9uZScsIFdlYmtpdFVzZXJTZWxlY3Q6ICdub25lJywgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICAgIG1heEhlaWdodDogdGhpcy5zdGF0ZS5tYXhIZWlnaHQgPyB0aGlzLnN0YXRlLm1heEhlaWdodCA6IG51bGxcbiAgICAgIH19LFxuICAgICAgICBjb25maWcuY3NzVHJhbnNpdGlvbldyYXBwZXIoXG4gICAgICAgICAgUi51bCh7cmVmOiAnY2hvaWNlcycsIGNsYXNzTmFtZTogJ2Nob2ljZXMnfSxcbiAgICAgICAgICAgIGNob2ljZXMubWFwKGZ1bmN0aW9uIChjaG9pY2UsIGkpIHtcblxuICAgICAgICAgICAgICB2YXIgY2hvaWNlRWxlbWVudCA9IG51bGw7XG5cbiAgICAgICAgICAgICAgaWYgKGNob2ljZS52YWx1ZSA9PT0gJy8vL2xvYWRpbmcvLy8nKSB7XG4gICAgICAgICAgICAgICAgY2hvaWNlRWxlbWVudCA9IFIuYSh7aHJlZjogJ0phdmFTY3JpcHQnICsgJzonLCBvbkNsaWNrOiB0aGlzLnByb3BzLm9uQ2xvc2V9LFxuICAgICAgICAgICAgICAgICAgUi5zcGFuKHtjbGFzc05hbWU6ICdjaG9pY2UtbGFiZWwnfSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2xvYWRpbmctY2hvaWNlJywge2ZpZWxkOiB0aGlzLnByb3BzLmZpZWxkfSlcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNob2ljZS52YWx1ZSA9PT0gJy8vL2VtcHR5Ly8vJykge1xuICAgICAgICAgICAgICAgIGNob2ljZUVsZW1lbnQgPSBSLmEoe2hyZWY6ICdKYXZhU2NyaXB0JyArICc6Jywgb25DbGljazogdGhpcy5wcm9wcy5vbkNsb3NlfSxcbiAgICAgICAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAnY2hvaWNlLWxhYmVsJ30sXG4gICAgICAgICAgICAgICAgICAgICdObyBjaG9pY2VzIGF2YWlsYWJsZS4nXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaG9pY2UuYWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIGxhYmVsQ2xhc3NlcyA9ICdjaG9pY2UtbGFiZWwgJyArIGNob2ljZS5hY3Rpb247XG5cbiAgICAgICAgICAgICAgICBjaG9pY2VFbGVtZW50ID0gUi5hKHtocmVmOiAnSmF2YVNjcmlwdCcgKyAnOicsIG9uQ2xpY2s6IHRoaXMub25DaG9pY2VBY3Rpb24uYmluZCh0aGlzLCBjaG9pY2UpfSxcbiAgICAgICAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiBsYWJlbENsYXNzZXN9LFxuICAgICAgICAgICAgICAgICAgICBjaG9pY2UubGFiZWwgfHwgdGhpcy5wcm9wcy5jb25maWcuYWN0aW9uQ2hvaWNlTGFiZWwoY2hvaWNlLmFjdGlvbilcbiAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmNvbmZpZy5jcmVhdGVFbGVtZW50KCdjaG9pY2UtYWN0aW9uLXNhbXBsZScsIHthY3Rpb246IGNob2ljZS5hY3Rpb24sIGNob2ljZTogY2hvaWNlfSlcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNob2ljZUVsZW1lbnQgPSBSLmEoe2hyZWY6ICdKYXZhU2NyaXB0JyArICc6Jywgb25DbGljazogdGhpcy5vblNlbGVjdC5iaW5kKHRoaXMsIGNob2ljZSl9LFxuICAgICAgICAgICAgICAgICAgUi5zcGFuKHtjbGFzc05hbWU6ICdjaG9pY2UtbGFiZWwnfSxcbiAgICAgICAgICAgICAgICAgICAgY2hvaWNlLmxhYmVsXG4gICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgUi5zcGFuKHtjbGFzc05hbWU6ICdjaG9pY2Utc2FtcGxlJ30sXG4gICAgICAgICAgICAgICAgICAgIGNob2ljZS5zYW1wbGVcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgcmV0dXJuIFIubGkoe2tleTogaSwgY2xhc3NOYW1lOiAnY2hvaWNlJ30sXG4gICAgICAgICAgICAgICAgY2hvaWNlRWxlbWVudFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBub3Qgb3BlblxuICAgIHJldHVybiBudWxsO1xuICB9XG59KTtcbiIsIi8vICMgZmllbGQtdGVtcGxhdGUtY2hvaWNlcyBjb21wb25lbnRcblxuLypcbkdpdmUgYSBsaXN0IG9mIGNob2ljZXMgb2YgaXRlbSB0eXBlcyB0byBjcmVhdGUgYXMgY2hpbGRyZW4gb2YgYW4gZmllbGQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnRmllbGRUZW1wbGF0ZUNob2ljZXMnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHRoaXMucHJvcHMub25TZWxlY3QocGFyc2VJbnQoZXZlbnQudGFyZ2V0LnZhbHVlKSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgdmFyIGZpZWxkVGVtcGxhdGVzID0gY29uZmlnLmZpZWxkSXRlbUZpZWxkVGVtcGxhdGVzKGZpZWxkKTtcblxuICAgIHZhciB0eXBlQ2hvaWNlcyA9IG51bGw7XG4gICAgaWYgKGZpZWxkVGVtcGxhdGVzLmxlbmd0aCA+IDEpIHtcbiAgICAgIHR5cGVDaG9pY2VzID0gUi5zZWxlY3Qoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSwgdmFsdWU6IHRoaXMuZmllbGRUZW1wbGF0ZUluZGV4LCBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZX0sXG4gICAgICBmaWVsZFRlbXBsYXRlcy5tYXAoZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUsIGkpIHtcbiAgICAgICAgcmV0dXJuIFIub3B0aW9uKHtrZXk6IGksIHZhbHVlOiBpfSwgZmllbGRUZW1wbGF0ZS5sYWJlbCB8fCBpKTtcbiAgICAgIH0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHlwZUNob2ljZXMgPyB0eXBlQ2hvaWNlcyA6IFIuc3BhbihudWxsKTtcbiAgfVxufSk7XG4iLCIvLyAjIGZpZWxkIGNvbXBvbmVudFxuXG4vKlxuVXNlZCBieSBhbnkgZmllbGRzIHRvIHB1dCB0aGUgbGFiZWwgYW5kIGhlbHAgdGV4dCBhcm91bmQgdGhlIGZpZWxkLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIF8gPSByZXF1aXJlKCcuLi8uLi91bmRhc2gnKTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdGaWVsZCcsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29sbGFwc2VkOiB0aGlzLnByb3BzLmNvbmZpZy5maWVsZElzQ29sbGFwc2VkKHRoaXMucHJvcHMuZmllbGQpID8gdHJ1ZSA6IGZhbHNlXG4gICAgfTtcbiAgfSxcblxuICBvbkNsaWNrTGFiZWw6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGNvbGxhcHNlZDogIXRoaXMuc3RhdGUuY29sbGFwc2VkXG4gICAgfSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblxuICAgIGlmICh0aGlzLnByb3BzLnBsYWluKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wcy5jaGlsZHJlbjtcbiAgICB9XG5cbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgdmFyIGluZGV4ID0gdGhpcy5wcm9wcy5pbmRleDtcbiAgICBpZiAoIV8uaXNOdW1iZXIoaW5kZXgpKSB7XG4gICAgICB2YXIga2V5ID0gdGhpcy5wcm9wcy5maWVsZC5rZXk7XG4gICAgICBpbmRleCA9IF8uaXNOdW1iZXIoa2V5KSA/IGtleSA6IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICB2YXIgY2xhc3NlcyA9IF8uZXh0ZW5kKHt9LCB0aGlzLnByb3BzLmNsYXNzZXMpO1xuXG4gICAgdmFyIGVycm9ycyA9IGNvbmZpZy5maWVsZEVycm9ycyhmaWVsZCk7XG5cbiAgICBlcnJvcnMuZm9yRWFjaChmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgIGNsYXNzZXNbJ3ZhbGlkYXRpb24tZXJyb3ItJyArIGVycm9yLnR5cGVdID0gdHJ1ZTtcbiAgICB9KTtcblxuICAgIGlmIChjb25maWcuZmllbGRJc1JlcXVpcmVkKGZpZWxkKSkge1xuICAgICAgY2xhc3Nlcy5yZXF1aXJlZCA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNsYXNzZXMub3B0aW9uYWwgPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiBjeChjbGFzc2VzKSwgc3R5bGU6IHtkaXNwbGF5OiAoZmllbGQuaGlkZGVuID8gJ25vbmUnIDogJycpfX0sXG4gICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgnbGFiZWwnLCB7XG4gICAgICAgIGNvbmZpZzogY29uZmlnLCBmaWVsZDogZmllbGQsXG4gICAgICAgIGluZGV4OiBpbmRleCwgb25DbGljazogY29uZmlnLmZpZWxkSXNDb2xsYXBzaWJsZShmaWVsZCkgPyB0aGlzLm9uQ2xpY2tMYWJlbCA6IG51bGxcbiAgICAgIH0pLFxuICAgICAgY29uZmlnLmNzc1RyYW5zaXRpb25XcmFwcGVyKFxuICAgICAgICB0aGlzLnN0YXRlLmNvbGxhcHNlZCA/IFtdIDogW1xuICAgICAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdoZWxwJywge1xuICAgICAgICAgICAgY29uZmlnOiBjb25maWcsIGZpZWxkOiBmaWVsZCxcbiAgICAgICAgICAgIGtleTogJ2hlbHAnXG4gICAgICAgICAgfSksXG4gICAgICAgICAgdGhpcy5wcm9wcy5jaGlsZHJlblxuICAgICAgICBdXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG4iLCIvLyAjIGhlbHAgY29tcG9uZW50XG5cbi8qXG5KdXN0IHRoZSBoZWxwIHRleHQgYmxvY2suXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnSGVscCcsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGhlbHBUZXh0ID0gdGhpcy5wcm9wcy5jb25maWcuZmllbGRIZWxwVGV4dCh0aGlzLnByb3BzLmZpZWxkKTtcblxuICAgIHJldHVybiBoZWxwVGV4dCA/XG4gICAgICBSLmRpdih7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpLCBkYW5nZXJvdXNseVNldElubmVySFRNTDoge19faHRtbDogaGVscFRleHR9fSkgOlxuICAgICAgUi5zcGFuKG51bGwpO1xuICB9XG59KTtcbiIsIi8vICMgYnV0dG9uIGNvbXBvbmVudFxuXG4vKlxuICBDbGlja2FibGUgJ2J1dHRvbidcbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBwcm9wVHlwZXM6IHtcbiAgICBvbkNsaWNrOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIHJlZjogUmVhY3QuUHJvcFR5cGVzLnN0cmluZ1xuICB9LFxuXG4gIGRpc3BsYXlOYW1lOiAnSW5zZXJ0QnV0dG9uJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxhIHJlZj17dGhpcy5wcm9wcy5yZWZ9IGhyZWY9eydKYXZhU2NyaXB0JyArICc6J30gb25DbGljaz17dGhpcy5wcm9wcy5vbkNsaWNrfT5cbiAgICAgICAge3RoaXMucHJvcHMuY2hpbGRyZW59XG4gICAgICA8L2E+XG4gICAgKTtcbiAgfVxuXG59KTtcbiIsIi8vICMgbGFiZWwgY29tcG9uZW50XG5cbi8qXG5KdXN0IHRoZSBsYWJlbCBmb3IgYSBmaWVsZC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdMYWJlbCcsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgdmFyIGZpZWxkTGFiZWwgPSBjb25maWcuZmllbGRMYWJlbChmaWVsZCk7XG5cbiAgICB2YXIgbGFiZWwgPSBudWxsO1xuICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wcy5pbmRleCA9PT0gJ251bWJlcicpIHtcbiAgICAgIGxhYmVsID0gJycgKyAodGhpcy5wcm9wcy5pbmRleCArIDEpICsgJy4nO1xuICAgICAgaWYgKGZpZWxkTGFiZWwpIHtcbiAgICAgICAgbGFiZWwgPSBsYWJlbCArICcgJyArIGZpZWxkTGFiZWw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGZpZWxkTGFiZWwgfHwgbGFiZWwpIHtcbiAgICAgIHZhciB0ZXh0ID0gbGFiZWwgfHwgZmllbGRMYWJlbDtcbiAgICAgIGlmICh0aGlzLnByb3BzLm9uQ2xpY2spIHtcbiAgICAgICAgdGV4dCA9IFIuYSh7aHJlZjogJ0phdmFTY3JpcHQnICsgJzonLCBvbkNsaWNrOiB0aGlzLnByb3BzLm9uQ2xpY2t9LCB0ZXh0KTtcbiAgICAgIH1cbiAgICAgIGxhYmVsID0gUi5sYWJlbCh7fSwgdGV4dCk7XG4gICAgfVxuXG4gICAgdmFyIHJlcXVpcmVkT3JOb3Q7XG5cbiAgICBpZiAoIWNvbmZpZy5maWVsZEhhc1ZhbHVlQ2hpbGRyZW4oZmllbGQpKSB7XG4gICAgICByZXF1aXJlZE9yTm90ID0gUi5zcGFuKHtcbiAgICAgICAgY2xhc3NOYW1lOiBjb25maWcuZmllbGRJc1JlcXVpcmVkKGZpZWxkKSA/ICdyZXF1aXJlZC10ZXh0JyA6ICdub3QtcmVxdWlyZWQtdGV4dCdcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBSLmRpdih7XG4gICAgICBjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcylcbiAgICB9LFxuICAgICAgbGFiZWwsXG4gICAgICAnICcsXG4gICAgICByZXF1aXJlZE9yTm90XG4gICAgKTtcbiAgfVxufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6ICdMb2FkaW5nQ2hvaWNlJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxzcGFuPkxvYWRpbmcgY2hvaWNlcy4uLjwvc3Bhbj5cbiAgICApO1xuICB9XG5cbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiAnTG9hZGluZ0Nob2ljZXMnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdj5Mb2FkaW5nIGNob2ljZXMuLi48L2Rpdj5cbiAgICApO1xuICB9XG5cbn0pO1xuIiwiLy8gIyBtb3ZlLWl0ZW0tYmFjayBjb21wb25lbnRcblxuLypcbkJ1dHRvbiB0byBtb3ZlIGFuIGl0ZW0gYmFja3dhcmRzIGluIGxpc3QuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnTW92ZUl0ZW1CYWNrJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBsYWJlbDogJ1t1cF0nXG4gICAgfTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSLnNwYW4oe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSwgb25DbGljazogdGhpcy5wcm9wcy5vbkNsaWNrfSwgdGhpcy5wcm9wcy5sYWJlbCk7XG4gIH1cbn0pO1xuIiwiLy8gIyBtb3ZlLWl0ZW0tZm9yd2FyZCBjb21wb25lbnRcblxuLypcbkJ1dHRvbiB0byBtb3ZlIGFuIGl0ZW0gZm9yd2FyZCBpbiBhIGxpc3QuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnTW92ZUl0ZW1Gb3J3YXJkJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBsYWJlbDogJ1tkb3duXSdcbiAgICB9O1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFIuc3Bhbih7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpLCBvbkNsaWNrOiB0aGlzLnByb3BzLm9uQ2xpY2t9LCB0aGlzLnByb3BzLmxhYmVsKTtcbiAgfVxufSk7XG4iLCIvLyAjIG9iamVjdC1jb250cm9sIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIHRoZSBpdGVtIHR5cGUgY2hvaWNlcyBhbmQgdGhlIGFkZCBidXR0b24uXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnT2JqZWN0Q29udHJvbCcsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZmllbGRUZW1wbGF0ZUluZGV4OiAwXG4gICAgfTtcbiAgfSxcblxuICBvblNlbGVjdDogZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBmaWVsZFRlbXBsYXRlSW5kZXg6IGluZGV4XG4gICAgfSk7XG4gIH0sXG5cbiAgb25BcHBlbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnByb3BzLm9uQXBwZW5kKHRoaXMuc3RhdGUuZmllbGRUZW1wbGF0ZUluZGV4KTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuICAgIHZhciBmaWVsZFRlbXBsYXRlcyA9IGNvbmZpZy5maWVsZENoaWxkRmllbGRUZW1wbGF0ZXMoZmllbGQpO1xuXG4gICAgdmFyIHR5cGVDaG9pY2VzID0gbnVsbDtcblxuICAgIGlmIChmaWVsZFRlbXBsYXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICB0eXBlQ2hvaWNlcyA9IGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZC10ZW1wbGF0ZS1jaG9pY2VzJywge1xuICAgICAgICBmaWVsZDogZmllbGQsXG4gICAgICAgIGZpZWxkVGVtcGxhdGVJbmRleDogdGhpcy5zdGF0ZS5maWVsZFRlbXBsYXRlSW5kZXgsIG9uU2VsZWN0OiB0aGlzLm9uU2VsZWN0XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKX0sXG4gICAgICB0eXBlQ2hvaWNlcywgJyAnLFxuICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2FkZC1pdGVtJywge29uQ2xpY2s6IHRoaXMub25BcHBlbmR9KVxuICAgICk7XG4gIH1cbn0pO1xuIiwiLy8gIyBvYmplY3QtaXRlbS1jb250cm9sIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIHRoZSByZW1vdmUgYnV0dG9ucyBmb3IgYW4gb2JqZWN0IGl0ZW0uXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdPYmplY3RJdGVtQ29udHJvbCcsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBvblJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucHJvcHMub25SZW1vdmUodGhpcy5wcm9wcy5pdGVtS2V5KTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3Nlcyl9LFxuICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ3JlbW92ZS1pdGVtJywge2ZpZWxkOiBmaWVsZCwgb25DbGljazogdGhpcy5vblJlbW92ZX0pXG4gICAgKTtcbiAgfVxufSk7XG4iLCIvLyAjIG9iamVjdC1pdGVtLWtleSBjb21wb25lbnRcblxuLypcblJlbmRlciBhbiBvYmplY3QgaXRlbSBrZXkgZWRpdG9yLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnT2JqZWN0SXRlbUtleScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBvbkNoYW5nZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZShldmVudC50YXJnZXQudmFsdWUpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFIuaW5wdXQoe1xuICAgICAgY2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpLFxuICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgdmFsdWU6IHRoaXMucHJvcHMuZGlzcGxheUtleSxcbiAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgb25Gb2N1czogdGhpcy5vbkZvY3VzQWN0aW9uLFxuICAgICAgb25CbHVyOiB0aGlzLm9uQmx1ckFjdGlvblxuICAgIH0pO1xuICB9XG59KTtcbiIsIi8vICMgb2JqZWN0LWl0ZW0tdmFsdWUgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgdGhlIHZhbHVlIG9mIGFuIG9iamVjdCBpdGVtLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnT2JqZWN0SXRlbVZhbHVlJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIG9uQ2hhbmdlRmllbGQ6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgaW5mbykge1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UodGhpcy5wcm9wcy5pdGVtS2V5LCBuZXdWYWx1ZSwgaW5mbyk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpfSxcbiAgICAgIGNvbmZpZy5jcmVhdGVGaWVsZEVsZW1lbnQoe2ZpZWxkOiBmaWVsZCwgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2VGaWVsZCwgcGxhaW46IHRydWUsIG9uQWN0aW9uOiB0aGlzLm9uQnViYmxlQWN0aW9ufSlcbiAgICApO1xuICB9XG59KTtcbiIsIi8vICMgb2JqZWN0LWl0ZW0gY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgYW4gb2JqZWN0IGl0ZW0uXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdPYmplY3RJdGVtJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIG9uQ2hhbmdlS2V5OiBmdW5jdGlvbiAobmV3S2V5KSB7XG4gICAgdGhpcy5wcm9wcy5vbk1vdmUodGhpcy5wcm9wcy5pdGVtS2V5LCBuZXdLZXkpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKX0sXG4gICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgnb2JqZWN0LWl0ZW0ta2V5Jywge2ZpZWxkOiBmaWVsZCwgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2VLZXksIG9uQWN0aW9uOiB0aGlzLm9uQnViYmxlQWN0aW9uLCBkaXNwbGF5S2V5OiB0aGlzLnByb3BzLmRpc3BsYXlLZXksIGl0ZW1LZXk6IHRoaXMucHJvcHMuaXRlbUtleX0pLFxuICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ29iamVjdC1pdGVtLXZhbHVlJywge2ZpZWxkOiBmaWVsZCwgb25DaGFuZ2U6IHRoaXMucHJvcHMub25DaGFuZ2UsIG9uQWN0aW9uOiB0aGlzLm9uQnViYmxlQWN0aW9uLCBpdGVtS2V5OiB0aGlzLnByb3BzLml0ZW1LZXl9KSxcbiAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdvYmplY3QtaXRlbS1jb250cm9sJywge2ZpZWxkOiBmaWVsZCwgb25SZW1vdmU6IHRoaXMucHJvcHMub25SZW1vdmUsIGl0ZW1LZXk6IHRoaXMucHJvcHMuaXRlbUtleX0pXG4gICAgKTtcbiAgfVxufSk7XG4iLCIvLyAjIHByZXR0eS1zZWxlY3QtdmFsdWUgY29tcG9uZW50XG5cbi8qXG4gICBSZW5kZXIgYSBzZWxlY3QgZHJvcGRvd24gZm9yIGEgbGlzdCBvZiBjaG9pY2VzLiBDaG9pY2VzIHZhbHVlcyBjYW4gYmUgb2YgYW55XG4gICB0eXBlLiBEb2VzIG5vdCB1c2UgbmF0aXZlIHNlbGVjdCBkcm9wZG93bi4gQ2hvaWNlcyBjYW4gb3B0aW9uYWxseSBpbmNsdWRlXG4gICAnc2FtcGxlJyBwcm9wZXJ0eSBkaXNwbGF5ZWQgZ3JheWVkIG91dC5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIF8gPSByZXF1aXJlKCd1bmRlcnNjb3JlJyk7XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnU2VsZWN0VmFsdWUnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHZhciBjaG9pY2VWYWx1ZSA9IGV2ZW50LnRhcmdldC52YWx1ZTtcbiAgICB2YXIgY2hvaWNlVHlwZSA9IGNob2ljZVZhbHVlLnN1YnN0cmluZygwLCBjaG9pY2VWYWx1ZS5pbmRleE9mKCc6JykpO1xuICAgIGlmIChjaG9pY2VUeXBlID09PSAnY2hvaWNlJykge1xuICAgICAgdmFyIGNob2ljZUluZGV4ID0gY2hvaWNlVmFsdWUuc3Vic3RyaW5nKGNob2ljZVZhbHVlLmluZGV4T2YoJzonKSArIDEpO1xuICAgICAgY2hvaWNlSW5kZXggPSBwYXJzZUludChjaG9pY2VJbmRleCk7XG4gICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHRoaXMucHJvcHMuY2hvaWNlc1tjaG9pY2VJbmRleF0udmFsdWUpO1xuICAgIH1cbiAgfSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY2hvaWNlczogW11cbiAgICB9O1xuICB9LFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRlZmF1bHRWYWx1ZSA9IHRoaXMucHJvcHMuZmllbGQudmFsdWUgIT09IHVuZGVmaW5lZCA/IHRoaXMucHJvcHMuZmllbGQudmFsdWUgOiAnJztcblxuICAgIHJldHVybiB7XG4gICAgICBpc0Nob2ljZXNPcGVuOiB0aGlzLnByb3BzLmlzQ2hvaWNlc09wZW4sXG4gICAgICB2YWx1ZTogZGVmYXVsdFZhbHVlLFxuICAgICAgaXNFbnRlcmluZ0N1c3RvbVZhbHVlOiBmYWxzZVxuICAgIH07XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGNob2ljZXMgPSB0aGlzLnByb3BzLmNvbmZpZy5ub3JtYWxpemVQcmV0dHlDaG9pY2VzKHRoaXMucHJvcHMuY2hvaWNlcyk7XG4gICAgdmFyIGNob2ljZXNPckxvYWRpbmc7XG5cbiAgICBpZiAoKGNob2ljZXMubGVuZ3RoID4gMSAmJiBjaG9pY2VzWzBdLnZhbHVlID09PSAnLy8vbG9hZGluZy8vLycpIHx8IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkSXNMb2FkaW5nKHRoaXMucHJvcHMuZmllbGQpKSB7XG4gICAgICBjaG9pY2VzID0gW3t2YWx1ZTogJy8vL2xvYWRpbmcvLy8nfV07XG4gICAgfVxuICAgIHZhciBjaG9pY2VzRWxlbSA9IHRoaXMucHJvcHMuY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2Nob2ljZXMnLCB7XG4gICAgICByZWY6ICdjaG9pY2VzJyxcbiAgICAgIGNob2ljZXM6IGNob2ljZXMsXG4gICAgICBvcGVuOiB0aGlzLnN0YXRlLmlzQ2hvaWNlc09wZW4sXG4gICAgICBpZ25vcmVDbG9zZU5vZGVzOiB0aGlzLmdldENsb3NlSWdub3JlTm9kZXMsXG4gICAgICBvblNlbGVjdDogdGhpcy5vblNlbGVjdENob2ljZSxcbiAgICAgIG9uQ2xvc2U6IHRoaXMub25DbG9zZUNob2ljZXMsXG4gICAgICBvbkNob2ljZUFjdGlvbjogdGhpcy5vbkNob2ljZUFjdGlvbixcbiAgICAgIGZpZWxkOiB0aGlzLnByb3BzLmZpZWxkXG4gICAgfSk7XG5cbiAgICB2YXIgaW5wdXRFbGVtID0gdGhpcy5nZXRJbnB1dEVsZW1lbnQoKTtcblxuICAgIGNob2ljZXNPckxvYWRpbmcgPSAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT17Y3godGhpcy5wcm9wcy5jbGFzc2VzKX1cbiAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25DaGFuZ2V9PlxuXG4gICAgICAgIDxkaXYgcmVmPVwidG9nZ2xlXCIgb25DbGljaz17dGhpcy5vblRvZ2dsZUNob2ljZXN9PlxuICAgICAgICAgIHtpbnB1dEVsZW19XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwic2VsZWN0LWFycm93XCIgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIHtjaG9pY2VzRWxlbX1cbiAgICAgIDwvZGl2PlxuICAgICk7XG5cbiAgICByZXR1cm4gY2hvaWNlc09yTG9hZGluZztcbiAgfSxcblxuICBnZXRJbnB1dEVsZW1lbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5pc0VudGVyaW5nQ3VzdG9tVmFsdWUpIHtcbiAgICAgIHJldHVybiA8aW5wdXQgcmVmPVwiY3VzdG9tSW5wdXRcIiB0eXBlPVwidGV4dFwiIHZhbHVlPXt0aGlzLnByb3BzLmZpZWxkLnZhbHVlfVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbklucHV0Q2hhbmdlfSBvbkZvY3VzPXt0aGlzLm9uRm9jdXNBY3Rpb259IG9uQmx1cj17dGhpcy5vbkJsdXJ9IC8+O1xuICAgIH1cblxuICAgIHJldHVybiA8aW5wdXQgdHlwZT1cInRleHRcIiB2YWx1ZT17dGhpcy5nZXREaXNwbGF5VmFsdWUoKX0gcmVhZE9ubHkgb25Gb2N1cz17dGhpcy5vbkZvY3VzQWN0aW9ufSBvbkJsdXI9e3RoaXMub25CbHVyfSAvPjtcbiAgfSxcblxuICBibHVyTGF0ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBzZWxmLm9uQmx1ckFjdGlvbigpO1xuICAgIH0sIDApO1xuICB9LFxuXG4gIG9uQmx1cjogZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5zdGF0ZS5pc0Nob2ljZXNPcGVuKSB7XG4gICAgICB0aGlzLmJsdXJMYXRlcigpO1xuICAgIH1cbiAgfSxcblxuICBnZXRDbG9zZUlnbm9yZU5vZGVzOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVmcy50b2dnbGUuZ2V0RE9NTm9kZSgpO1xuICB9LFxuXG4gIG9uVG9nZ2xlQ2hvaWNlczogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc2V0Q2hvaWNlc09wZW4oIXRoaXMuc3RhdGUuaXNDaG9pY2VzT3Blbik7XG4gIH0sXG5cbiAgc2V0Q2hvaWNlc09wZW46IGZ1bmN0aW9uIChpc09wZW4pIHtcbiAgICB2YXIgYWN0aW9uID0gaXNPcGVuID8gJ29wZW4tY2hvaWNlcycgOiAnY2xvc2UtY2hvaWNlcyc7XG4gICAgdGhpcy5vblN0YXJ0QWN0aW9uKGFjdGlvbik7XG4gICAgdGhpcy5zZXRTdGF0ZSh7IGlzQ2hvaWNlc09wZW46IGlzT3BlbiB9KTtcbiAgfSxcblxuICBvblNlbGVjdENob2ljZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBpc0VudGVyaW5nQ3VzdG9tVmFsdWU6IGZhbHNlLFxuICAgICAgaXNDaG9pY2VzT3BlbjogZmFsc2UsXG4gICAgICB2YWx1ZTogdmFsdWVcbiAgICB9KTtcbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHZhbHVlKTtcbiAgICB0aGlzLmJsdXJMYXRlcigpO1xuICB9LFxuXG4gIG9uQ2xvc2VDaG9pY2VzOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUuaXNDaG9pY2VzT3Blbikge1xuICAgICAgdGhpcy5ibHVyTGF0ZXIoKTtcbiAgICAgIHRoaXMuc2V0Q2hvaWNlc09wZW4oZmFsc2UpO1xuICAgIH1cbiAgfSxcblxuICBnZXREaXNwbGF5VmFsdWU6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGN1cnJlbnRWYWx1ZSA9IHRoaXMuc3RhdGUudmFsdWU7XG4gICAgdmFyIGN1cnJlbnRDaG9pY2UgPSB0aGlzLnByb3BzLmNvbmZpZy5maWVsZFNlbGVjdGVkQ2hvaWNlKHRoaXMucHJvcHMuZmllbGQpO1xuICAgIC8vIE1ha2Ugc3VyZSBzZWxlY3RlZENob2ljZSBpcyBhIG1hdGNoIGZvciBjdXJyZW50IHZhbHVlLlxuICAgIGlmIChjdXJyZW50Q2hvaWNlICYmIGN1cnJlbnRDaG9pY2UudmFsdWUgIT09IGN1cnJlbnRWYWx1ZSkge1xuICAgICAgY3VycmVudENob2ljZSA9IG51bGw7XG4gICAgfVxuICAgIGlmICghY3VycmVudENob2ljZSkge1xuICAgICAgY3VycmVudENob2ljZSA9IF8uZmluZCh0aGlzLnByb3BzLmNob2ljZXMsIGZ1bmN0aW9uIChjaG9pY2UpIHtcbiAgICAgICAgcmV0dXJuICFjaG9pY2UuYWN0aW9uICYmIGNob2ljZS52YWx1ZSA9PT0gY3VycmVudFZhbHVlO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKGN1cnJlbnRDaG9pY2UpIHtcbiAgICAgIHJldHVybiBjdXJyZW50Q2hvaWNlLmxhYmVsO1xuICAgIH0gZWxzZSBpZiAoY3VycmVudFZhbHVlKSB7IC8vIGN1c3RvbSB2YWx1ZVxuICAgICAgcmV0dXJuIGN1cnJlbnRWYWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbmZpZy5maWVsZFBsYWNlaG9sZGVyKHRoaXMucHJvcHMuZmllbGQpIHx8ICcnO1xuICB9LFxuXG4gIG9uQ2hvaWNlQWN0aW9uOiBmdW5jdGlvbiAoY2hvaWNlKSB7XG4gICAgaWYgKGNob2ljZS5hY3Rpb24gPT09ICdlbnRlci1jdXN0b20tdmFsdWUnKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgaXNFbnRlcmluZ0N1c3RvbVZhbHVlOiB0cnVlLFxuICAgICAgICBpc0Nob2ljZXNPcGVuOiBmYWxzZSxcbiAgICAgICAgdmFsdWU6IGNob2ljZS52YWx1ZVxuICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnJlZnMuY3VzdG9tSW5wdXQuZ2V0RE9NTm9kZSgpLmZvY3VzKCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGlzQ2hvaWNlc09wZW46ICEhY2hvaWNlLmlzT3BlblxuICAgICAgfSk7XG4gICAgICBpZiAoY2hvaWNlLmFjdGlvbiA9PT0gJ2NsZWFyLWN1cnJlbnQtY2hvaWNlJykge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICB2YWx1ZTogJydcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UoJycpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMub25TdGFydEFjdGlvbihjaG9pY2UuYWN0aW9uLCBjaG9pY2UpO1xuICB9LFxuXG4gIG9uQWN0aW9uOiBmdW5jdGlvbiAocGFyYW1zKSB7XG4gICAgaWYgKHBhcmFtcy5hY3Rpb24gPT09ICdlbnRlci1jdXN0b20tdmFsdWUnKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtpc0VudGVyaW5nQ3VzdG9tVmFsdWU6IHRydWV9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMucmVmcy5jdXN0b21JbnB1dC5nZXRET01Ob2RlKCkuZm9jdXMoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICB0aGlzLm9uQnViYmxlQWN0aW9uKHBhcmFtcyk7XG4gIH0sXG5cbiAgb25JbnB1dENoYW5nZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZShldmVudC50YXJnZXQudmFsdWUpO1xuICB9XG59KTtcbiIsIi8vICMgcmVtb3ZlLWl0ZW0gY29tcG9uZW50XG5cbi8qXG5SZW1vdmUgYW4gaXRlbS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdSZW1vdmVJdGVtJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBsYWJlbDogJ1tyZW1vdmVdJ1xuICAgIH07XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIG9uTW91c2VPdmVyUmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMucHJvcHMub25NYXliZVJlbW92ZSkge1xuICAgICAgdGhpcy5wcm9wcy5vbk1heWJlUmVtb3ZlKHRydWUpO1xuICAgIH1cbiAgfSxcblxuICBvbk1vdXNlT3V0UmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMucHJvcHMub25NYXliZVJlbW92ZSkge1xuICAgICAgdGhpcy5wcm9wcy5vbk1heWJlUmVtb3ZlKGZhbHNlKTtcbiAgICB9XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSLnNwYW4oe1xuICAgICAgY2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpLCBvbkNsaWNrOiB0aGlzLnByb3BzLm9uQ2xpY2ssXG4gICAgICBvbk1vdXNlT3ZlcjogdGhpcy5vbk1vdXNlT3ZlclJlbW92ZSwgb25Nb3VzZU91dDogdGhpcy5vbk1vdXNlT3V0UmVtb3ZlXG4gICAgfSwgdGhpcy5wcm9wcy5sYWJlbCk7XG4gIH1cbn0pO1xuIiwiLy8gIyBoZWxwIGNvbXBvbmVudFxuXG4vKlxuSnVzdCB0aGUgaGVscCB0ZXh0IGJsb2NrLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ1NhbXBsZScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNob2ljZSA9IHRoaXMucHJvcHMuY2hvaWNlO1xuXG4gICAgcmV0dXJuIGNob2ljZS5zYW1wbGUgP1xuICAgICAgUi5kaXYoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc05hbWUpfSxcbiAgICAgICAgY2hvaWNlLnNhbXBsZVxuICAgICAgKSA6XG4gICAgICBSLnNwYW4obnVsbCk7XG4gIH1cbn0pO1xuIiwiLy8gIyBzZWxlY3QtdmFsdWUgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgYSBzZWxlY3QgZHJvcGRvd24gZm9yIGEgbGlzdCBvZiBjaG9pY2VzLiBDaG9pY2VzIHZhbHVlcyBjYW4gYmUgb2YgYW55XG50eXBlLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIF8gPSByZXF1aXJlKCcuLi8uLi91bmRhc2gnKTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdTZWxlY3RWYWx1ZScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBvbkNoYW5nZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdmFyIGNob2ljZVZhbHVlID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xuICAgIHZhciBjaG9pY2VUeXBlID0gY2hvaWNlVmFsdWUuc3Vic3RyaW5nKDAsIGNob2ljZVZhbHVlLmluZGV4T2YoJzonKSk7XG4gICAgaWYgKGNob2ljZVR5cGUgPT09ICdjaG9pY2UnKSB7XG4gICAgICB2YXIgY2hvaWNlSW5kZXggPSBjaG9pY2VWYWx1ZS5zdWJzdHJpbmcoY2hvaWNlVmFsdWUuaW5kZXhPZignOicpICsgMSk7XG4gICAgICBjaG9pY2VJbmRleCA9IHBhcnNlSW50KGNob2ljZUluZGV4KTtcbiAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UodGhpcy5wcm9wcy5jaG9pY2VzW2Nob2ljZUluZGV4XS52YWx1ZSk7XG4gICAgfVxuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBjaG9pY2VzID0gdGhpcy5wcm9wcy5jaG9pY2VzIHx8IFtdO1xuXG4gICAgdmFyIGNob2ljZXNPckxvYWRpbmc7XG5cbiAgICBpZiAoKGNob2ljZXMubGVuZ3RoID09PSAxICYmIGNob2ljZXNbMF0udmFsdWUgPT09ICcvLy9sb2FkaW5nLy8vJykgfHwgY29uZmlnLmZpZWxkSXNMb2FkaW5nKHRoaXMucHJvcHMuZmllbGQpKSB7XG4gICAgICBjaG9pY2VzT3JMb2FkaW5nID0gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2xvYWRpbmctY2hvaWNlcycsIHt9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHZhbHVlID0gdGhpcy5wcm9wcy5maWVsZC52YWx1ZSAhPT0gdW5kZWZpbmVkID8gdGhpcy5wcm9wcy5maWVsZC52YWx1ZSA6ICcnO1xuXG4gICAgICBjaG9pY2VzID0gY2hvaWNlcy5tYXAoZnVuY3Rpb24gKGNob2ljZSwgaSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGNob2ljZVZhbHVlOiAnY2hvaWNlOicgKyBpLFxuICAgICAgICAgIHZhbHVlOiBjaG9pY2UudmFsdWUsXG4gICAgICAgICAgbGFiZWw6IGNob2ljZS5sYWJlbFxuICAgICAgICB9O1xuICAgICAgfSk7XG5cbiAgICAgIHZhciB2YWx1ZUNob2ljZSA9IF8uZmluZChjaG9pY2VzLCBmdW5jdGlvbiAoY2hvaWNlKSB7XG4gICAgICAgIHJldHVybiBjaG9pY2UudmFsdWUgPT09IHZhbHVlO1xuICAgICAgfSk7XG5cbiAgICAgIGlmICh2YWx1ZUNob2ljZSA9PT0gdW5kZWZpbmVkKSB7XG5cbiAgICAgICAgdmFyIGxhYmVsID0gdmFsdWU7XG4gICAgICAgIGlmICghXy5pc1N0cmluZyh2YWx1ZSkpIHtcbiAgICAgICAgICBsYWJlbCA9IEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICB2YWx1ZUNob2ljZSA9IHtcbiAgICAgICAgICBjaG9pY2VWYWx1ZTogJ3ZhbHVlOicsXG4gICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgIGxhYmVsOiBsYWJlbFxuICAgICAgICB9O1xuICAgICAgICBjaG9pY2VzID0gW3ZhbHVlQ2hvaWNlXS5jb25jYXQoY2hvaWNlcyk7XG4gICAgICB9XG5cbiAgICAgIGNob2ljZXNPckxvYWRpbmcgPSBSLnNlbGVjdCh7XG4gICAgICAgIGNsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSxcbiAgICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsXG4gICAgICAgIHZhbHVlOiB2YWx1ZUNob2ljZS5jaG9pY2VWYWx1ZSxcbiAgICAgICAgb25Gb2N1czogdGhpcy5vbkZvY3VzQWN0aW9uLFxuICAgICAgICBvbkJsdXI6IHRoaXMub25CbHVyQWN0aW9uXG4gICAgICB9LFxuICAgICAgY2hvaWNlcy5tYXAoZnVuY3Rpb24gKGNob2ljZSwgaSkge1xuICAgICAgICByZXR1cm4gUi5vcHRpb24oe1xuICAgICAgICAgIGtleTogaSxcbiAgICAgICAgICB2YWx1ZTogY2hvaWNlLmNob2ljZVZhbHVlXG4gICAgICAgIH0sIGNob2ljZS5sYWJlbCk7XG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICByZXR1cm4gY2hvaWNlc09yTG9hZGluZztcbn1cbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBidWlsZENob2ljZXNNYXAocmVwbGFjZUNob2ljZXMpIHtcbiAgdmFyIGNob2ljZXMgPSB7fTtcbiAgcmVwbGFjZUNob2ljZXMuZm9yRWFjaChmdW5jdGlvbiAoY2hvaWNlKSB7XG4gICAgdmFyIGtleSA9IGNob2ljZS52YWx1ZTtcbiAgICBjaG9pY2VzW2tleV0gPSBjaG9pY2UubGFiZWw7XG4gIH0pO1xuICByZXR1cm4gY2hvaWNlcztcbn1cblxuLypcbiAgIENyZWF0ZXMgaGVscGVyIHRvIHRyYW5zbGF0ZSBiZXR3ZWVuIHRhZ3MgbGlrZSB7e2ZpcnN0TmFtZX19IGFuZFxuICAgYW4gZW5jb2RlZCByZXByZXNlbnRhdGlvbiBzdWl0YWJsZSBmb3IgdXNlIGluIENvZGVNaXJyb3IuXG4gKi9cbmZ1bmN0aW9uIFRhZ1RyYW5zbGF0b3IocmVwbGFjZUNob2ljZXMsIGh1bWFuaXplKSB7XG4gIC8vIE1hcCBvZiB0YWcgdG8gbGFiZWwgJ2ZpcnN0TmFtZScgLS0+ICdGaXJzdCBOYW1lJ1xuICB2YXIgY2hvaWNlcyA9IGJ1aWxkQ2hvaWNlc01hcChyZXBsYWNlQ2hvaWNlcyk7XG5cbiAgcmV0dXJuIHtcbiAgICAvKlxuICAgICAgIEdldCBsYWJlbCBmb3IgdGFnLiAgRm9yIGV4YW1wbGUgJ2ZpcnN0TmFtZScgYmVjb21lcyAnRmlyc3QgTmFtZScuXG4gICAgICAgUmV0dXJucyBhIGh1bWFuaXplZCB2ZXJzaW9uIG9mIHRoZSB0YWcgaWYgd2UgZG9uJ3QgaGF2ZSBhIGxhYmVsIGZvciB0aGUgdGFnLlxuICAgICAqL1xuICAgIGdldExhYmVsOiBmdW5jdGlvbiAodGFnKSB7XG4gICAgICB2YXIgbGFiZWwgPSBjaG9pY2VzW3RhZ107XG4gICAgICBpZiAoIWxhYmVsKSB7XG4gICAgICAgIC8vIElmIHRhZyBub3QgZm91bmQgYW5kIHdlIGhhdmUgYSBodW1hbml6ZSBmdW5jdGlvbiwgaHVtYW5pemUgdGhlIHRhZy5cbiAgICAgICAgLy8gT3RoZXJ3aXNlIGp1c3QgcmV0dXJuIHRoZSB0YWcuXG4gICAgICAgIGxhYmVsID0gaHVtYW5pemUgJiYgaHVtYW5pemUodGFnKSB8fCB0YWc7XG4gICAgICB9XG4gICAgICByZXR1cm4gbGFiZWw7XG4gICAgfSxcblxuICAgIHRva2VuaXplOiBmdW5jdGlvbiAodGV4dCkge1xuICAgICAgdmFyIHJlZ2V4cCA9IC8oXFx7XFx7fFxcfVxcfSkvO1xuICAgICAgdmFyIHBhcnRzID0gdGV4dC5zcGxpdChyZWdleHApO1xuXG4gICAgICB2YXIgdG9rZW5zID0gW107XG4gICAgICB2YXIgaW5UYWcgPSBmYWxzZTtcbiAgICAgIHBhcnRzLmZvckVhY2goZnVuY3Rpb24gKHBhcnQpIHtcbiAgICAgICAgaWYgKHBhcnQgPT09ICd7eycpIHtcbiAgICAgICAgICBpblRhZyA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAocGFydCA9PT0gJ319Jykge1xuICAgICAgICAgIGluVGFnID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSBpZiAoaW5UYWcpIHtcbiAgICAgICAgICB0b2tlbnMucHVzaCh7dHlwZTogJ3RhZycsIHZhbHVlOiBwYXJ0fSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdG9rZW5zLnB1c2goe3R5cGU6ICdzdHJpbmcnLCB2YWx1ZTogcGFydH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0b2tlbnM7XG4gICAgfSxcblxuICAgIGdldFRhZ1Bvc2l0aW9uczogZnVuY3Rpb24gKHRleHQpIHtcbiAgICAgIHZhciBsaW5lcyA9IHRleHQuc3BsaXQoJ1xcbicpO1xuICAgICAgdmFyIHJlID0gL1xce1xcey4rP1xcfVxcfS9nO1xuICAgICAgdmFyIHBvc2l0aW9ucyA9IFtdO1xuICAgICAgdmFyIG07XG5cbiAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB3aGlsZSAoKG0gPSByZS5leGVjKGxpbmVzW2ldKSkgIT09IG51bGwpIHtcbiAgICAgICAgICB2YXIgdGFnID0gbVswXS5zdWJzdHJpbmcoMiwgbVswXS5sZW5ndGgtMik7XG4gICAgICAgICAgcG9zaXRpb25zLnB1c2goe1xuICAgICAgICAgICAgbGluZTogaSxcbiAgICAgICAgICAgIHN0YXJ0OiBtLmluZGV4LFxuICAgICAgICAgICAgc3RvcDogbS5pbmRleCArIG1bMF0ubGVuZ3RoLFxuICAgICAgICAgICAgdGFnOiB0YWdcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHBvc2l0aW9ucztcbiAgICB9XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVGFnVHJhbnNsYXRvcjtcbiIsIi8vICMgZGVmYXVsdC1jb25maWdcblxuLypcblRoaXMgaXMgdGhlIGRlZmF1bHQgY29uZmlndXJhdGlvbiBwbHVnaW4gZm9yIGZvcm1hdGljLiBUbyBjaGFuZ2UgZm9ybWF0aWMnc1xuYmVoYXZpb3IsIGp1c3QgY3JlYXRlIHlvdXIgb3duIHBsdWdpbiBmdW5jdGlvbiB0aGF0IHJldHVybnMgYW4gb2JqZWN0IHdpdGhcbm1ldGhvZHMgeW91IHdhbnQgdG8gYWRkIG9yIG92ZXJyaWRlLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIF8gPSByZXF1aXJlKCcuL3VuZGFzaCcpO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNvbmZpZykge1xuXG4gIHZhciBkZWxlZ2F0ZVRvID0gdXRpbHMuZGVsZWdhdG9yKGNvbmZpZyk7XG5cbiAgcmV0dXJuIHtcblxuICAgIC8vIEZpZWxkIGVsZW1lbnQgZmFjdG9yaWVzLiBDcmVhdGUgZmllbGQgZWxlbWVudHMuXG5cbiAgICBjcmVhdGVFbGVtZW50X0ZpZWxkczogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL2ZpZWxkcycpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfU3RyaW5nOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvc3RyaW5nJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9TaW5nbGVMaW5lU3RyaW5nOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvc2luZ2xlLWxpbmUtc3RyaW5nJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9TZWxlY3Q6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9zZWxlY3QnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X1ByZXR0eVNlbGVjdDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL3ByZXR0eS1zZWxlY3QnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0Jvb2xlYW46IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9ib29sZWFuJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9QcmV0dHlCb29sZWFuOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvcHJldHR5LWJvb2xlYW4nKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0NoZWNrYm94Qm9vbGVhbjogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL2NoZWNrYm94LWJvb2xlYW4nKSksXG5cbiAgICAvLyBjcmVhdGVFbGVtZW50X1ByZXR0eVRleHQ6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9wcmV0dHktdGV4dCcpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfUHJldHR5VGV4dDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL3ByZXR0eS10ZXh0MicpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfQXJyYXk6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9hcnJheScpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfQ2hlY2tib3hBcnJheTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL2NoZWNrYm94LWFycmF5JykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9PYmplY3Q6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9vYmplY3QnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0pzb246IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9qc29uJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9Vbmtub3duRmllbGQ6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy91bmtub3duJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9Db3B5OiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvY29weScpKSxcblxuXG4gICAgLy8gT3RoZXIgZWxlbWVudCBmYWN0b3JpZXMuIENyZWF0ZSBoZWxwZXIgZWxlbWVudHMgdXNlZCBieSBmaWVsZCBjb21wb25lbnRzLlxuXG4gICAgY3JlYXRlRWxlbWVudF9GaWVsZDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9maWVsZCcpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfTGFiZWw6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvbGFiZWwnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0hlbHA6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvaGVscCcpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfQ2hvaWNlczogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9jaG9pY2VzJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9Mb2FkaW5nQ2hvaWNlczogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9sb2FkaW5nLWNob2ljZXMnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0xvYWRpbmdDaG9pY2U6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvbG9hZGluZy1jaG9pY2UnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0FycmF5Q29udHJvbDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9hcnJheS1jb250cm9sJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9BcnJheUl0ZW1Db250cm9sOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2FycmF5LWl0ZW0tY29udHJvbCcpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfQXJyYXlJdGVtVmFsdWU6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvYXJyYXktaXRlbS12YWx1ZScpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfQXJyYXlJdGVtOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2FycmF5LWl0ZW0nKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0ZpZWxkVGVtcGxhdGVDaG9pY2VzOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2ZpZWxkLXRlbXBsYXRlLWNob2ljZXMnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0FkZEl0ZW06IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvYWRkLWl0ZW0nKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X1JlbW92ZUl0ZW06IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvcmVtb3ZlLWl0ZW0nKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X01vdmVJdGVtRm9yd2FyZDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9tb3ZlLWl0ZW0tZm9yd2FyZCcpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfTW92ZUl0ZW1CYWNrOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL21vdmUtaXRlbS1iYWNrJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9PYmplY3RDb250cm9sOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL29iamVjdC1jb250cm9sJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9PYmplY3RJdGVtQ29udHJvbDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9vYmplY3QtaXRlbS1jb250cm9sJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9PYmplY3RJdGVtVmFsdWU6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWl0ZW0tdmFsdWUnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X09iamVjdEl0ZW1LZXk6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWl0ZW0ta2V5JykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9PYmplY3RJdGVtOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL29iamVjdC1pdGVtJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9TZWxlY3RWYWx1ZTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9zZWxlY3QtdmFsdWUnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X1ByZXR0eVNlbGVjdFZhbHVlOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL3ByZXR0eS1zZWxlY3QtdmFsdWUnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X1NhbXBsZTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9zYW1wbGUnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0luc2VydEJ1dHRvbjogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9pbnNlcnQtYnV0dG9uJykpLFxuXG5cbiAgICAvLyBGaWVsZCBkZWZhdWx0IHZhbHVlIGZhY3Rvcmllcy4gR2l2ZSBhIGRlZmF1bHQgdmFsdWUgZm9yIGEgc3BlY2lmaWMgdHlwZS5cblxuICAgIGNyZWF0ZURlZmF1bHRWYWx1ZV9TdHJpbmc6IGZ1bmN0aW9uICgvKiBmaWVsZFRlbXBsYXRlICovKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfSxcblxuICAgIGNyZWF0ZURlZmF1bHRWYWx1ZV9PYmplY3Q6IGZ1bmN0aW9uICgvKiBmaWVsZFRlbXBsYXRlICovKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfSxcblxuICAgIGNyZWF0ZURlZmF1bHRWYWx1ZV9BcnJheTogZnVuY3Rpb24gKC8qIGZpZWxkVGVtcGxhdGUgKi8pIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9LFxuXG4gICAgY3JlYXRlRGVmYXVsdFZhbHVlX0Jvb2xlYW46IGZ1bmN0aW9uICgvKiBmaWVsZFRlbXBsYXRlICovKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIGNyZWF0ZURlZmF1bHRWYWx1ZV9GaWVsZHM6IGRlbGVnYXRlVG8oJ2NyZWF0ZURlZmF1bHRWYWx1ZV9PYmplY3QnKSxcblxuICAgIGNyZWF0ZURlZmF1bHRWYWx1ZV9TaW5nbGVMaW5lU3RyaW5nOiBkZWxlZ2F0ZVRvKCdjcmVhdGVEZWZhdWx0VmFsdWVfU3RyaW5nJyksXG5cbiAgICBjcmVhdGVEZWZhdWx0VmFsdWVfU2VsZWN0OiBkZWxlZ2F0ZVRvKCdjcmVhdGVEZWZhdWx0VmFsdWVfU3RyaW5nJyksXG5cbiAgICBjcmVhdGVEZWZhdWx0VmFsdWVfSnNvbjogZGVsZWdhdGVUbygnY3JlYXRlRGVmYXVsdFZhbHVlX09iamVjdCcpLFxuXG4gICAgY3JlYXRlRGVmYXVsdFZhbHVlX0NoZWNrYm94QXJyYXk6IGRlbGVnYXRlVG8oJ2NyZWF0ZURlZmF1bHRWYWx1ZV9BcnJheScpLFxuXG4gICAgY3JlYXRlRGVmYXVsdFZhbHVlX0NoZWNrYm94Qm9vbGVhbjogZGVsZWdhdGVUbygnY3JlYXRlRGVmYXVsdFZhbHVlX0Jvb2xlYW4nKSxcblxuXG4gICAgLy8gRmllbGQgdmFsdWUgY29lcmNlcnMuIENvZXJjZSBhIHZhbHVlIGludG8gYSB2YWx1ZSBhcHByb3ByaWF0ZSBmb3IgYSBzcGVjaWZpYyB0eXBlLlxuXG4gICAgY29lcmNlVmFsdWVfU3RyaW5nOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSwgdmFsdWUpIHtcbiAgICAgIGlmIChfLmlzU3RyaW5nKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9XG4gICAgICBpZiAoXy5pc1VuZGVmaW5lZCh2YWx1ZSkgfHwgdmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICB9LFxuXG4gICAgY29lcmNlVmFsdWVfT2JqZWN0OiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSwgdmFsdWUpIHtcbiAgICAgIGlmICghXy5pc09iamVjdCh2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG5cbiAgICBjb2VyY2VWYWx1ZV9BcnJheTogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUsIHZhbHVlKSB7XG4gICAgICBpZiAoIV8uaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIFt2YWx1ZV07XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcblxuICAgIGNvZXJjZVZhbHVlX0Jvb2xlYW46IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlLCB2YWx1ZSkge1xuICAgICAgcmV0dXJuIGNvbmZpZy5jb2VyY2VWYWx1ZVRvQm9vbGVhbih2YWx1ZSk7XG4gICAgfSxcblxuICAgIGNvZXJjZVZhbHVlX0ZpZWxkczogZGVsZWdhdGVUbygnY29lcmNlVmFsdWVfT2JqZWN0JyksXG5cbiAgICBjb2VyY2VWYWx1ZV9TaW5nbGVMaW5lU3RyaW5nOiBkZWxlZ2F0ZVRvKCdjb2VyY2VWYWx1ZV9TdHJpbmcnKSxcblxuICAgIGNvZXJjZVZhbHVlX1NlbGVjdDogZGVsZWdhdGVUbygnY29lcmNlVmFsdWVfU3RyaW5nJyksXG5cbiAgICBjb2VyY2VWYWx1ZV9Kc29uOiBkZWxlZ2F0ZVRvKCdjb2VyY2VWYWx1ZV9PYmplY3QnKSxcblxuICAgIGNvZXJjZVZhbHVlX0NoZWNrYm94QXJyYXk6IGRlbGVnYXRlVG8oJ2NvZXJjZVZhbHVlX0FycmF5JyksXG5cbiAgICBjb2VyY2VWYWx1ZV9DaGVja2JveEJvb2xlYW46IGRlbGVnYXRlVG8oJ2NvZXJjZVZhbHVlX0Jvb2xlYW4nKSxcblxuXG4gICAgLy8gRmllbGQgY2hpbGQgZmllbGRzIGZhY3Rvcmllcywgc28gc29tZSB0eXBlcyBjYW4gaGF2ZSBkeW5hbWljIGNoaWxkcmVuLlxuXG4gICAgY3JlYXRlQ2hpbGRGaWVsZHNfQXJyYXk6IGZ1bmN0aW9uIChmaWVsZCkge1xuXG4gICAgICByZXR1cm4gZmllbGQudmFsdWUubWFwKGZ1bmN0aW9uIChhcnJheUl0ZW0sIGkpIHtcbiAgICAgICAgdmFyIGNoaWxkRmllbGRUZW1wbGF0ZSA9IGNvbmZpZy5jaGlsZEZpZWxkVGVtcGxhdGVGb3JWYWx1ZShmaWVsZCwgYXJyYXlJdGVtKTtcblxuICAgICAgICB2YXIgY2hpbGRGaWVsZCA9IGNvbmZpZy5jcmVhdGVDaGlsZEZpZWxkKGZpZWxkLCB7XG4gICAgICAgICAgZmllbGRUZW1wbGF0ZTogY2hpbGRGaWVsZFRlbXBsYXRlLCBrZXk6IGksIGZpZWxkSW5kZXg6IGksIHZhbHVlOiBhcnJheUl0ZW1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGNoaWxkRmllbGQ7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlQ2hpbGRGaWVsZHNfT2JqZWN0OiBmdW5jdGlvbiAoZmllbGQpIHtcblxuICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKGZpZWxkLnZhbHVlKS5tYXAoZnVuY3Rpb24gKGtleSwgaSkge1xuICAgICAgICB2YXIgY2hpbGRGaWVsZFRlbXBsYXRlID0gY29uZmlnLmNoaWxkRmllbGRUZW1wbGF0ZUZvclZhbHVlKGZpZWxkLCBmaWVsZC52YWx1ZVtrZXldKTtcblxuICAgICAgICB2YXIgY2hpbGRGaWVsZCA9IGNvbmZpZy5jcmVhdGVDaGlsZEZpZWxkKGZpZWxkLCB7XG4gICAgICAgICAgZmllbGRUZW1wbGF0ZTogY2hpbGRGaWVsZFRlbXBsYXRlLCBrZXk6IGtleSwgZmllbGRJbmRleDogaSwgdmFsdWU6IGZpZWxkLnZhbHVlW2tleV1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGNoaWxkRmllbGQ7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgLy8gQ2hlY2sgaWYgdGhlcmUgaXMgYSBmYWN0b3J5IGZvciB0aGUgbmFtZS5cbiAgICBoYXNFbGVtZW50RmFjdG9yeTogZnVuY3Rpb24gKG5hbWUpIHtcblxuICAgICAgcmV0dXJuIGNvbmZpZ1snY3JlYXRlRWxlbWVudF8nICsgbmFtZV0gPyB0cnVlIDogZmFsc2U7XG4gICAgfSxcblxuICAgIC8vIENyZWF0ZSBhbiBlbGVtZW50IGdpdmVuIGEgbmFtZSwgcHJvcHMsIGFuZCBjaGlsZHJlbi5cbiAgICBjcmVhdGVFbGVtZW50OiBmdW5jdGlvbiAobmFtZSwgcHJvcHMsIGNoaWxkcmVuKSB7XG5cbiAgICAgIGlmICghcHJvcHMuY29uZmlnKSB7XG4gICAgICAgIHByb3BzID0gXy5leHRlbmQoe30sIHByb3BzLCB7Y29uZmlnOiBjb25maWd9KTtcbiAgICAgIH1cblxuICAgICAgbmFtZSA9IGNvbmZpZy5lbGVtZW50TmFtZShuYW1lKTtcblxuICAgICAgaWYgKGNvbmZpZ1snY3JlYXRlRWxlbWVudF8nICsgbmFtZV0pIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZ1snY3JlYXRlRWxlbWVudF8nICsgbmFtZV0ocHJvcHMsIGNoaWxkcmVuKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG5hbWUgIT09ICdVbmtub3duJykge1xuICAgICAgICBpZiAoY29uZmlnLmhhc0VsZW1lbnRGYWN0b3J5KCdVbmtub3duJykpIHtcbiAgICAgICAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ1Vua25vd24nLCBwcm9wcywgY2hpbGRyZW4pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRocm93IG5ldyBFcnJvcignRmFjdG9yeSBub3QgZm91bmQgZm9yOiAnICsgbmFtZSk7XG4gICAgfSxcblxuICAgIC8vIENyZWF0ZSBhIGZpZWxkIGVsZW1lbnQgZ2l2ZW4gc29tZSBwcm9wcy4gVXNlIGNvbnRleHQgdG8gZGV0ZXJtaW5lIG5hbWUuXG4gICAgY3JlYXRlRmllbGRFbGVtZW50OiBmdW5jdGlvbiAocHJvcHMpIHtcblxuICAgICAgdmFyIG5hbWUgPSBjb25maWcuZmllbGRUeXBlTmFtZShwcm9wcy5maWVsZCk7XG5cbiAgICAgIGlmIChjb25maWcuaGFzRWxlbWVudEZhY3RvcnkobmFtZSkpIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KG5hbWUsIHByb3BzKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdVbmtub3duRmllbGQnLCBwcm9wcyk7XG4gICAgfSxcblxuICAgIC8vIFJlbmRlciB0aGUgcm9vdCBmb3JtYXRpYyBjb21wb25lbnRcbiAgICByZW5kZXJGb3JtYXRpY0NvbXBvbmVudDogZnVuY3Rpb24gKGNvbXBvbmVudCkge1xuXG4gICAgICB2YXIgcHJvcHMgPSBjb21wb25lbnQucHJvcHM7XG5cbiAgICAgIHZhciBmaWVsZCA9IGNvbmZpZy5jcmVhdGVSb290RmllbGQocHJvcHMpO1xuXG4gICAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogJ2Zvcm1hdGljJ30sXG4gICAgICAgIGNvbmZpZy5jcmVhdGVGaWVsZEVsZW1lbnQoe2ZpZWxkOiBmaWVsZCwgb25DaGFuZ2U6IGNvbXBvbmVudC5vbkNoYW5nZSwgb25BY3Rpb246IGNvbXBvbmVudC5vbkFjdGlvbn0pXG4gICAgICApO1xuICAgIH0sXG5cbiAgICAvLyBSZW5kZXIgYW55IGNvbXBvbmVudC5cbiAgICByZW5kZXJDb21wb25lbnQ6IGZ1bmN0aW9uIChjb21wb25lbnQpIHtcblxuICAgICAgdmFyIG5hbWUgPSBjb21wb25lbnQuY29uc3RydWN0b3IuZGlzcGxheU5hbWU7XG5cbiAgICAgIGlmIChjb25maWdbJ3JlbmRlckNvbXBvbmVudF8nICsgbmFtZV0pIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZ1sncmVuZGVyQ29tcG9uZW50XycgKyBuYW1lXShjb21wb25lbnQpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY29tcG9uZW50LnJlbmRlckRlZmF1bHQoKTtcbiAgICB9LFxuXG4gICAgLy8gUmVuZGVyIGZpZWxkIGNvbXBvbmVudHMuXG4gICAgcmVuZGVyRmllbGRDb21wb25lbnQ6IGZ1bmN0aW9uIChjb21wb25lbnQpIHtcblxuICAgICAgcmV0dXJuIGNvbmZpZy5yZW5kZXJDb21wb25lbnQoY29tcG9uZW50KTtcbiAgICB9LFxuXG4gICAgLy8gTm9ybWFsaXplIGFuIGVsZW1lbnQgbmFtZS5cbiAgICBlbGVtZW50TmFtZTogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgIHJldHVybiB1dGlscy5kYXNoVG9QYXNjYWwobmFtZSk7XG4gICAgfSxcblxuICAgIC8vIFR5cGUgYWxpYXNlcy5cblxuICAgIGFsaWFzX0RpY3Q6ICdPYmplY3QnLFxuXG4gICAgYWxpYXNfQm9vbDogJ0Jvb2xlYW4nLFxuXG4gICAgYWxpYXNfUHJldHR5VGV4dGFyZWE6ICdQcmV0dHlUZXh0JyxcblxuICAgIGFsaWFzX1NpbmdsZUxpbmVTdHJpbmc6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgICBpZiAoZmllbGRUZW1wbGF0ZS5yZXBsYWNlQ2hvaWNlcykge1xuICAgICAgICByZXR1cm4gJ1ByZXR0eVRleHQnO1xuICAgICAgfSBlbHNlIGlmIChmaWVsZFRlbXBsYXRlLmNob2ljZXMpIHtcbiAgICAgICAgcmV0dXJuICdTZWxlY3QnO1xuICAgICAgfVxuICAgICAgcmV0dXJuICdTaW5nbGVMaW5lU3RyaW5nJztcbiAgICB9LFxuXG4gICAgYWxpYXNfU3RyaW5nOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSkge1xuXG4gICAgICBpZiAoZmllbGRUZW1wbGF0ZS5yZXBsYWNlQ2hvaWNlcykge1xuICAgICAgICByZXR1cm4gJ1ByZXR0eVRleHQnO1xuICAgICAgfSBlbHNlIGlmIChmaWVsZFRlbXBsYXRlLmNob2ljZXMpIHtcbiAgICAgICAgcmV0dXJuICdTZWxlY3QnO1xuICAgICAgfSBlbHNlIGlmIChjb25maWcuZmllbGRUZW1wbGF0ZUlzU2luZ2xlTGluZShmaWVsZFRlbXBsYXRlKSkge1xuICAgICAgICByZXR1cm4gJ1NpbmdsZUxpbmVTdHJpbmcnO1xuICAgICAgfVxuICAgICAgcmV0dXJuICdTdHJpbmcnO1xuICAgIH0sXG5cbiAgICBhbGlhc19UZXh0OiBkZWxlZ2F0ZVRvKCdhbGlhc19TdHJpbmcnKSxcblxuICAgIGFsaWFzX1VuaWNvZGU6IGRlbGVnYXRlVG8oJ2FsaWFzX1NpbmdsZUxpbmVTdHJpbmcnKSxcblxuICAgIGFsaWFzX1N0cjogZGVsZWdhdGVUbygnYWxpYXNfU2luZ2xlTGluZVN0cmluZycpLFxuXG4gICAgYWxpYXNfTGlzdDogJ0FycmF5JyxcblxuICAgIGFsaWFzX0NoZWNrYm94TGlzdDogJ0NoZWNrYm94QXJyYXknLFxuXG4gICAgYWxpYXNfRmllbGRzZXQ6ICdGaWVsZHMnLFxuXG4gICAgYWxpYXNfQ2hlY2tib3g6ICdDaGVja2JveEJvb2xlYW4nLFxuXG4gICAgLy8gRmllbGQgZmFjdG9yeVxuXG4gICAgLy8gR2l2ZW4gYSBmaWVsZCwgZXhwYW5kIGFsbCBjaGlsZCBmaWVsZHMgcmVjdXJzaXZlbHkgdG8gZ2V0IHRoZSBkZWZhdWx0XG4gICAgLy8gdmFsdWVzIG9mIGFsbCBmaWVsZHMuXG4gICAgaW5mbGF0ZUZpZWxkVmFsdWU6IGZ1bmN0aW9uIChmaWVsZCwgZmllbGRIYW5kbGVyKSB7XG5cbiAgICAgIGlmIChmaWVsZEhhbmRsZXIpIHtcbiAgICAgICAgdmFyIHN0b3AgPSBmaWVsZEhhbmRsZXIoZmllbGQpO1xuICAgICAgICBpZiAoc3RvcCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChjb25maWcuZmllbGRIYXNWYWx1ZUNoaWxkcmVuKGZpZWxkKSkge1xuICAgICAgICB2YXIgdmFsdWUgPSBfLmNsb25lKGZpZWxkLnZhbHVlKTtcbiAgICAgICAgdmFyIGNoaWxkRmllbGRzID0gY29uZmlnLmNyZWF0ZUNoaWxkRmllbGRzKGZpZWxkKTtcbiAgICAgICAgY2hpbGRGaWVsZHMuZm9yRWFjaChmdW5jdGlvbiAoY2hpbGRGaWVsZCkge1xuICAgICAgICAgIGlmIChjb25maWcuaXNLZXkoY2hpbGRGaWVsZC5rZXkpKSB7XG4gICAgICAgICAgICB2YWx1ZVtjaGlsZEZpZWxkLmtleV0gPSBjb25maWcuaW5mbGF0ZUZpZWxkVmFsdWUoY2hpbGRGaWVsZCwgZmllbGRIYW5kbGVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZmllbGQudmFsdWU7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIEluaXRpYWxpemUgdGhlIHJvb3QgZmllbGQuXG4gICAgaW5pdFJvb3RGaWVsZDogZnVuY3Rpb24gKC8qIGZpZWxkLCBwcm9wcyAqLykge1xuICAgIH0sXG5cbiAgICAvLyBJbml0aWFsaXplIGV2ZXJ5IGZpZWxkLlxuICAgIGluaXRGaWVsZDogZnVuY3Rpb24gKC8qIGZpZWxkICovKSB7XG4gICAgfSxcblxuICAgIC8vIElmIGFuIGFycmF5IG9mIGZpZWxkIHRlbXBsYXRlcyBhcmUgcGFzc2VkIGluLCB0aGlzIG1ldGhvZCBpcyB1c2VkIHRvXG4gICAgLy8gd3JhcCB0aGUgZmllbGRzIGluc2lkZSBhIHNpbmdsZSByb290IGZpZWxkIHRlbXBsYXRlLlxuICAgIHdyYXBGaWVsZFRlbXBsYXRlczogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGVzKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnZmllbGRzJyxcbiAgICAgICAgcGxhaW46IHRydWUsXG4gICAgICAgIGZpZWxkczogZmllbGRUZW1wbGF0ZXNcbiAgICAgIH07XG4gICAgfSxcblxuICAgIC8vIEdpdmVuIHRoZSBwcm9wcyB0aGF0IGFyZSBwYXNzZWQgaW4sIGNyZWF0ZSB0aGUgcm9vdCBmaWVsZC5cbiAgICBjcmVhdGVSb290RmllbGQ6IGZ1bmN0aW9uIChwcm9wcykge1xuXG4gICAgICB2YXIgZmllbGRUZW1wbGF0ZSA9IHByb3BzLmZpZWxkVGVtcGxhdGUgfHwgcHJvcHMuZmllbGRUZW1wbGF0ZXMgfHwgcHJvcHMuZmllbGQgfHwgcHJvcHMuZmllbGRzO1xuICAgICAgdmFyIHZhbHVlID0gcHJvcHMudmFsdWU7XG5cbiAgICAgIGlmICghZmllbGRUZW1wbGF0ZSkge1xuICAgICAgICBmaWVsZFRlbXBsYXRlID0gY29uZmlnLmNyZWF0ZUZpZWxkVGVtcGxhdGVGcm9tVmFsdWUodmFsdWUpO1xuICAgICAgfVxuXG4gICAgICBpZiAoXy5pc0FycmF5KGZpZWxkVGVtcGxhdGUpKSB7XG4gICAgICAgIGZpZWxkVGVtcGxhdGUgPSBjb25maWcud3JhcEZpZWxkVGVtcGxhdGVzKGZpZWxkVGVtcGxhdGUpO1xuICAgICAgfVxuXG4gICAgICB2YXIgZmllbGQgPSBfLmV4dGVuZCh7fSwgZmllbGRUZW1wbGF0ZSwge3Jhd0ZpZWxkVGVtcGxhdGU6IGZpZWxkVGVtcGxhdGV9KTtcbiAgICAgIGlmIChjb25maWcuaGFzVmFsdWUoZmllbGRUZW1wbGF0ZSwgdmFsdWUpKSB7XG4gICAgICAgIGZpZWxkLnZhbHVlID0gY29uZmlnLmNvZXJjZVZhbHVlKGZpZWxkVGVtcGxhdGUsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZpZWxkLnZhbHVlID0gY29uZmlnLmNyZWF0ZURlZmF1bHRWYWx1ZShmaWVsZFRlbXBsYXRlKTtcbiAgICAgIH1cblxuICAgICAgY29uZmlnLmluaXRSb290RmllbGQoZmllbGQsIHByb3BzKTtcbiAgICAgIGNvbmZpZy5pbml0RmllbGQoZmllbGQpO1xuXG4gICAgICBpZiAodmFsdWUgPT09IG51bGwgfHwgY29uZmlnLmlzRW1wdHlPYmplY3QodmFsdWUpIHx8IF8uaXNVbmRlZmluZWQodmFsdWUpKSB7XG4gICAgICAgIGZpZWxkLnZhbHVlID0gY29uZmlnLmluZmxhdGVGaWVsZFZhbHVlKGZpZWxkKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZpZWxkO1xuICAgIH0sXG5cbiAgICAvLyBHaXZlbiB0aGUgcHJvcHMgdGhhdCBhcmUgcGFzc2VkIGluLCBjcmVhdGUgdGhlIHZhbHVlIHRoYXQgd2lsbCBiZSBkaXNwbGF5ZWRcbiAgICAvLyBieSBhbGwgdGhlIGNvbXBvbmVudHMuXG4gICAgY3JlYXRlUm9vdFZhbHVlOiBmdW5jdGlvbiAocHJvcHMsIGZpZWxkSGFuZGxlcikge1xuXG4gICAgICB2YXIgZmllbGQgPSBjb25maWcuY3JlYXRlUm9vdEZpZWxkKHByb3BzKTtcblxuICAgICAgcmV0dXJuIGNvbmZpZy5pbmZsYXRlRmllbGRWYWx1ZShmaWVsZCwgZmllbGRIYW5kbGVyKTtcbiAgICB9LFxuXG4gICAgdmFsaWRhdGVSb290VmFsdWU6IGZ1bmN0aW9uIChwcm9wcykge1xuXG4gICAgICB2YXIgZXJyb3JzID0gW107XG5cbiAgICAgIGNvbmZpZy5jcmVhdGVSb290VmFsdWUocHJvcHMsIGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgICB2YXIgZmllbGRFcnJvcnMgPSBjb25maWcuZmllbGRFcnJvcnMoZmllbGQpO1xuICAgICAgICBpZiAoZmllbGRFcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgIHBhdGg6IGNvbmZpZy5maWVsZFZhbHVlUGF0aChmaWVsZCksXG4gICAgICAgICAgICBlcnJvcnM6IGZpZWxkRXJyb3JzXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gZXJyb3JzO1xuICAgIH0sXG5cbiAgICBpc1ZhbGlkUm9vdFZhbHVlOiBmdW5jdGlvbiAocHJvcHMpIHtcblxuICAgICAgdmFyIGlzVmFsaWQgPSB0cnVlO1xuXG4gICAgICBjb25maWcuY3JlYXRlUm9vdFZhbHVlKHByb3BzLCBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgICAgaWYgKGNvbmZpZy5maWVsZEVycm9ycyhmaWVsZCkubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGlzVmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gaXNWYWxpZDtcbiAgICB9LFxuXG4gICAgdmFsaWRhdGVGaWVsZDogZnVuY3Rpb24gKGZpZWxkLCBlcnJvcnMpIHtcblxuICAgICAgaWYgKGZpZWxkLnZhbHVlID09PSB1bmRlZmluZWQgfHwgZmllbGQudmFsdWUgPT09ICcnKSB7XG4gICAgICAgIGlmIChjb25maWcuZmllbGRJc1JlcXVpcmVkKGZpZWxkKSkge1xuICAgICAgICAgIGVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgIHR5cGU6ICdyZXF1aXJlZCdcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBjc3NUcmFuc2l0aW9uV3JhcHBlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgQ1NTVHJhbnNpdGlvbkdyb3VwID0gUmVhY3QuY3JlYXRlRmFjdG9yeShSZWFjdC5hZGRvbnMuQ1NTVHJhbnNpdGlvbkdyb3VwKTtcbiAgICAgIHZhciBhcmdzID0gW3t0cmFuc2l0aW9uTmFtZTogJ3JldmVhbCd9XS5jb25jYXQoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG4gICAgICByZXR1cm4gQ1NTVHJhbnNpdGlvbkdyb3VwLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgIH0sXG5cbiAgICAvLyBDcmVhdGUgZHluYW1pYyBjaGlsZCBmaWVsZHMgZm9yIGEgZmllbGQuXG4gICAgY3JlYXRlQ2hpbGRGaWVsZHM6IGZ1bmN0aW9uIChmaWVsZCkge1xuXG4gICAgICB2YXIgdHlwZU5hbWUgPSBjb25maWcuZmllbGRUeXBlTmFtZShmaWVsZCk7XG5cbiAgICAgIGlmIChjb25maWdbJ2NyZWF0ZUNoaWxkRmllbGRzXycgKyB0eXBlTmFtZV0pIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZ1snY3JlYXRlQ2hpbGRGaWVsZHNfJyArIHR5cGVOYW1lXShmaWVsZCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjb25maWcuZmllbGRDaGlsZEZpZWxkVGVtcGxhdGVzKGZpZWxkKS5tYXAoZnVuY3Rpb24gKGNoaWxkRmllbGQsIGkpIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVDaGlsZEZpZWxkKGZpZWxkLCB7XG4gICAgICAgICAgZmllbGRUZW1wbGF0ZTogY2hpbGRGaWVsZCwga2V5OiBjaGlsZEZpZWxkLmtleSwgZmllbGRJbmRleDogaSwgdmFsdWU6IGZpZWxkLnZhbHVlW2NoaWxkRmllbGQua2V5XVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvLyBDcmVhdGUgYSBzaW5nbGUgY2hpbGQgZmllbGQgZm9yIGEgcGFyZW50IGZpZWxkLlxuICAgIGNyZWF0ZUNoaWxkRmllbGQ6IGZ1bmN0aW9uIChwYXJlbnRGaWVsZCwgb3B0aW9ucykge1xuXG4gICAgICB2YXIgY2hpbGRWYWx1ZSA9IG9wdGlvbnMudmFsdWU7XG5cbiAgICAgIHZhciBjaGlsZEZpZWxkID0gXy5leHRlbmQoe30sIG9wdGlvbnMuZmllbGRUZW1wbGF0ZSwge1xuICAgICAgICBrZXk6IG9wdGlvbnMua2V5LCBwYXJlbnQ6IHBhcmVudEZpZWxkLCBmaWVsZEluZGV4OiBvcHRpb25zLmZpZWxkSW5kZXgsXG4gICAgICAgIHJhd0ZpZWxkVGVtcGxhdGU6IG9wdGlvbnMuZmllbGRUZW1wbGF0ZVxuICAgICAgfSk7XG5cbiAgICAgIGlmIChjb25maWcuaGFzVmFsdWUob3B0aW9ucy5maWVsZFRlbXBsYXRlLCBjaGlsZFZhbHVlKSkge1xuICAgICAgICBjaGlsZEZpZWxkLnZhbHVlID0gY29uZmlnLmNvZXJjZVZhbHVlKG9wdGlvbnMuZmllbGRUZW1wbGF0ZSwgY2hpbGRWYWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjaGlsZEZpZWxkLnZhbHVlID0gY29uZmlnLmNyZWF0ZURlZmF1bHRWYWx1ZShvcHRpb25zLmZpZWxkVGVtcGxhdGUpO1xuICAgICAgfVxuXG4gICAgICBjb25maWcuaW5pdEZpZWxkKGNoaWxkRmllbGQpO1xuXG4gICAgICByZXR1cm4gY2hpbGRGaWVsZDtcbiAgICB9LFxuXG4gICAgLy8gQ3JlYXRlIGEgdGVtcG9yYXJ5IGZpZWxkIGFuZCBleHRyYWN0IGl0cyB2YWx1ZS5cbiAgICBjcmVhdGVOZXdDaGlsZEZpZWxkVmFsdWU6IGZ1bmN0aW9uIChwYXJlbnRGaWVsZCwgaXRlbUZpZWxkSW5kZXgpIHtcblxuICAgICAgdmFyIGNoaWxkRmllbGRUZW1wbGF0ZSA9IGNvbmZpZy5maWVsZEl0ZW1GaWVsZFRlbXBsYXRlcyhwYXJlbnRGaWVsZClbaXRlbUZpZWxkSW5kZXhdO1xuXG4gICAgICB2YXIgbmV3VmFsdWUgPSBjb25maWcuZmllbGRUZW1wbGF0ZVZhbHVlKGNoaWxkRmllbGRUZW1wbGF0ZSk7XG5cbiAgICAgIC8vIEp1c3QgYSBwbGFjZWhvbGRlciBrZXkuIFNob3VsZCBub3QgYmUgaW1wb3J0YW50LlxuICAgICAgdmFyIGtleSA9ICdfX3Vua25vd25fa2V5X18nO1xuXG4gICAgICBpZiAoXy5pc0FycmF5KHBhcmVudEZpZWxkLnZhbHVlKSkge1xuICAgICAgICAvLyBKdXN0IGEgcGxhY2Vob2xkZXIgcG9zaXRpb24gZm9yIGFuIGFycmF5LlxuICAgICAgICBrZXkgPSBwYXJlbnRGaWVsZC52YWx1ZS5sZW5ndGg7XG4gICAgICB9XG5cbiAgICAgIC8vIEp1c3QgYSBwbGFjZWhvbGRlciBmaWVsZCBpbmRleC4gU2hvdWxkIG5vdCBiZSBpbXBvcnRhbnQuXG4gICAgICB2YXIgZmllbGRJbmRleCA9IDA7XG4gICAgICBpZiAoXy5pc09iamVjdChwYXJlbnRGaWVsZC52YWx1ZSkpIHtcbiAgICAgICAgZmllbGRJbmRleCA9IE9iamVjdC5rZXlzKHBhcmVudEZpZWxkLnZhbHVlKS5sZW5ndGg7XG4gICAgICB9XG5cbiAgICAgIHZhciBjaGlsZEZpZWxkID0gY29uZmlnLmNyZWF0ZUNoaWxkRmllbGQocGFyZW50RmllbGQsIHtcbiAgICAgICAgZmllbGRUZW1wbGF0ZTogY2hpbGRGaWVsZFRlbXBsYXRlLCBrZXk6IGtleSwgZmllbGRJbmRleDogZmllbGRJbmRleCwgdmFsdWU6IG5ld1ZhbHVlXG4gICAgICB9KTtcblxuICAgICAgbmV3VmFsdWUgPSBjb25maWcuaW5mbGF0ZUZpZWxkVmFsdWUoY2hpbGRGaWVsZCk7XG5cbiAgICAgIHJldHVybiBuZXdWYWx1ZTtcbiAgICB9LFxuXG4gICAgLy8gR2l2ZW4gYSB2YWx1ZSwgY3JlYXRlIGEgZmllbGQgdGVtcGxhdGUgZm9yIHRoYXQgdmFsdWUuXG4gICAgY3JlYXRlRmllbGRUZW1wbGF0ZUZyb21WYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG5cbiAgICAgIHZhciBmaWVsZCA9IHtcbiAgICAgICAgdHlwZTogJ2pzb24nXG4gICAgICB9O1xuICAgICAgaWYgKF8uaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgICAgIGZpZWxkID0ge1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgIH07XG4gICAgICB9IGVsc2UgaWYgKF8uaXNOdW1iZXIodmFsdWUpKSB7XG4gICAgICAgIGZpZWxkID0ge1xuICAgICAgICAgIHR5cGU6ICdudW1iZXInXG4gICAgICAgIH07XG4gICAgICB9IGVsc2UgaWYgKF8uaXNCb29sZWFuKHZhbHVlKSkge1xuICAgICAgICBmaWVsZCA9IHtcbiAgICAgICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSBpZiAoXy5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICB2YXIgYXJyYXlJdGVtRmllbGRzID0gdmFsdWUubWFwKGZ1bmN0aW9uIChjaGlsZFZhbHVlLCBpKSB7XG4gICAgICAgICAgdmFyIGNoaWxkRmllbGQgPSBjb25maWcuY3JlYXRlRmllbGRUZW1wbGF0ZUZyb21WYWx1ZShjaGlsZFZhbHVlKTtcbiAgICAgICAgICBjaGlsZEZpZWxkLmtleSA9IGk7XG4gICAgICAgICAgcmV0dXJuIGNoaWxkRmllbGQ7XG4gICAgICAgIH0pO1xuICAgICAgICBmaWVsZCA9IHtcbiAgICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICAgIGZpZWxkczogYXJyYXlJdGVtRmllbGRzXG4gICAgICAgIH07XG4gICAgICB9IGVsc2UgaWYgKF8uaXNPYmplY3QodmFsdWUpKSB7XG4gICAgICAgIHZhciBvYmplY3RJdGVtRmllbGRzID0gT2JqZWN0LmtleXModmFsdWUpLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgdmFyIGNoaWxkRmllbGQgPSBjb25maWcuY3JlYXRlRmllbGRUZW1wbGF0ZUZyb21WYWx1ZSh2YWx1ZVtrZXldKTtcbiAgICAgICAgICBjaGlsZEZpZWxkLmtleSA9IGtleTtcbiAgICAgICAgICBjaGlsZEZpZWxkLmxhYmVsID0gY29uZmlnLmh1bWFuaXplKGtleSk7XG4gICAgICAgICAgcmV0dXJuIGNoaWxkRmllbGQ7XG4gICAgICAgIH0pO1xuICAgICAgICBmaWVsZCA9IHtcbiAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICBmaWVsZHM6IG9iamVjdEl0ZW1GaWVsZHNcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSBpZiAoXy5pc051bGwodmFsdWUpKSB7XG4gICAgICAgIGZpZWxkID0ge1xuICAgICAgICAgIHR5cGU6ICdqc29uJ1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZpZWxkO1xuICAgIH0sXG5cbiAgICAvLyBEZWZhdWx0IHZhbHVlIGZhY3RvcnlcblxuICAgIGNyZWF0ZURlZmF1bHRWYWx1ZTogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcblxuICAgICAgdmFyIGRlZmF1bHRWYWx1ZSA9IGNvbmZpZy5maWVsZFRlbXBsYXRlRGVmYXVsdFZhbHVlKGZpZWxkVGVtcGxhdGUpO1xuXG4gICAgICBpZiAoIV8uaXNVbmRlZmluZWQoZGVmYXVsdFZhbHVlKSkge1xuICAgICAgICByZXR1cm4gdXRpbHMuZGVlcENvcHkoZGVmYXVsdFZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHR5cGVOYW1lID0gY29uZmlnLmZpZWxkVHlwZU5hbWUoZmllbGRUZW1wbGF0ZSk7XG5cbiAgICAgIGlmIChjb25maWdbJ2NyZWF0ZURlZmF1bHRWYWx1ZV8nICsgdHlwZU5hbWVdKSB7XG4gICAgICAgIHJldHVybiBjb25maWdbJ2NyZWF0ZURlZmF1bHRWYWx1ZV8nICsgdHlwZU5hbWVdKGZpZWxkVGVtcGxhdGUpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gJyc7XG4gICAgfSxcblxuICAgIC8vIEZpZWxkIGhlbHBlcnNcblxuICAgIC8vIERldGVybWluZSBpZiBhIHZhbHVlIFwiZXhpc3RzXCIuXG4gICAgaGFzVmFsdWU6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlLCB2YWx1ZSkge1xuICAgICAgcmV0dXJuIHZhbHVlICE9PSBudWxsICYmICFfLmlzVW5kZWZpbmVkKHZhbHVlKTtcbiAgICB9LFxuXG4gICAgLy8gQ29lcmNlIGEgdmFsdWUgdG8gdmFsdWUgYXBwcm9wcmlhdGUgZm9yIGEgZmllbGQuXG4gICAgY29lcmNlVmFsdWU6IGZ1bmN0aW9uIChmaWVsZCwgdmFsdWUpIHtcblxuICAgICAgdmFyIHR5cGVOYW1lID0gY29uZmlnLmZpZWxkVHlwZU5hbWUoZmllbGQpO1xuXG4gICAgICBpZiAoY29uZmlnWydjb2VyY2VWYWx1ZV8nICsgdHlwZU5hbWVdKSB7XG4gICAgICAgIHJldHVybiBjb25maWdbJ2NvZXJjZVZhbHVlXycgKyB0eXBlTmFtZV0oZmllbGQsIHZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG5cbiAgICAvLyBHaXZlbiBhIGZpZWxkIGFuZCBhIGNoaWxkIHZhbHVlLCBmaW5kIHRoZSBhcHByb3ByaWF0ZSBmaWVsZCB0ZW1wbGF0ZSBmb3JcbiAgICAvLyB0aGF0IGNoaWxkIHZhbHVlLlxuICAgIGNoaWxkRmllbGRUZW1wbGF0ZUZvclZhbHVlOiBmdW5jdGlvbiAoZmllbGQsIGNoaWxkVmFsdWUpIHtcblxuICAgICAgdmFyIGZpZWxkVGVtcGxhdGU7XG5cbiAgICAgIHZhciBmaWVsZFRlbXBsYXRlcyA9IGNvbmZpZy5maWVsZEl0ZW1GaWVsZFRlbXBsYXRlcyhmaWVsZCk7XG5cbiAgICAgIGZpZWxkVGVtcGxhdGUgPSBfLmZpbmQoZmllbGRUZW1wbGF0ZXMsIGZ1bmN0aW9uIChpdGVtRmllbGRUZW1wbGF0ZSkge1xuICAgICAgICByZXR1cm4gY29uZmlnLm1hdGNoZXNGaWVsZFRlbXBsYXRlVG9WYWx1ZShpdGVtRmllbGRUZW1wbGF0ZSwgY2hpbGRWYWx1ZSk7XG4gICAgICB9KTtcblxuICAgICAgaWYgKGZpZWxkVGVtcGxhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZpZWxkVGVtcGxhdGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUZpZWxkVGVtcGxhdGVGcm9tVmFsdWUoY2hpbGRWYWx1ZSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgbWF0Y2ggZm9yIGEgZmllbGQgdGVtcGxhdGUuXG4gICAgbWF0Y2hlc0ZpZWxkVGVtcGxhdGVUb1ZhbHVlOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSwgdmFsdWUpIHtcbiAgICAgIHZhciBtYXRjaCA9IGZpZWxkVGVtcGxhdGUubWF0Y2g7XG4gICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIF8uZXZlcnkoT2JqZWN0LmtleXMobWF0Y2gpLCBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIHJldHVybiBfLmlzRXF1YWwobWF0Y2hba2V5XSwgdmFsdWVba2V5XSk7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgLy8gRmllbGQgdGVtcGxhdGUgaGVscGVyc1xuXG4gICAgLy8gTm9ybWFsaXplZCAoUGFzY2FsQ2FzZSkgdHlwZSBuYW1lIGZvciBhIGZpZWxkLlxuICAgIGZpZWxkVGVtcGxhdGVUeXBlTmFtZTogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcblxuICAgICAgdmFyIHR5cGVOYW1lID0gdXRpbHMuZGFzaFRvUGFzY2FsKGZpZWxkVGVtcGxhdGUudHlwZSB8fCAndW5kZWZpbmVkJyk7XG5cbiAgICAgIHZhciBhbGlhcyA9IGNvbmZpZ1snYWxpYXNfJyArIHR5cGVOYW1lXTtcblxuICAgICAgaWYgKGFsaWFzKSB7XG4gICAgICAgIGlmIChfLmlzRnVuY3Rpb24oYWxpYXMpKSB7XG4gICAgICAgICAgcmV0dXJuIGFsaWFzLmNhbGwoY29uZmlnLCBmaWVsZFRlbXBsYXRlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gYWxpYXM7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGZpZWxkVGVtcGxhdGUubGlzdCkge1xuICAgICAgICB0eXBlTmFtZSA9ICdBcnJheSc7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0eXBlTmFtZTtcbiAgICB9LFxuXG4gICAgLy8gRGVmYXVsdCB2YWx1ZSBmb3IgYSBmaWVsZCB0ZW1wbGF0ZS5cbiAgICBmaWVsZFRlbXBsYXRlRGVmYXVsdFZhbHVlOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSkge1xuXG4gICAgICByZXR1cm4gZmllbGRUZW1wbGF0ZS5kZWZhdWx0O1xuICAgIH0sXG5cbiAgICAvLyBWYWx1ZSBmb3IgYSBmaWVsZCB0ZW1wbGF0ZS4gVXNlZCB0byBkZXRlcm1pbmUgdGhlIHZhbHVlIG9mIGEgbmV3IGNoaWxkXG4gICAgLy8gZmllbGQuXG4gICAgZmllbGRUZW1wbGF0ZVZhbHVlOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSkge1xuXG4gICAgICAvLyBUaGlzIGxvZ2ljIG1pZ2h0IGJlIGJyaXR0bGUuXG5cbiAgICAgIHZhciBkZWZhdWx0VmFsdWUgPSBjb25maWcuZmllbGRUZW1wbGF0ZURlZmF1bHRWYWx1ZShmaWVsZFRlbXBsYXRlKTtcblxuICAgICAgdmFyIG1hdGNoID0gY29uZmlnLmZpZWxkVGVtcGxhdGVNYXRjaChmaWVsZFRlbXBsYXRlKTtcblxuICAgICAgdmFyIHZhbHVlO1xuXG4gICAgICBpZiAoXy5pc1VuZGVmaW5lZChkZWZhdWx0VmFsdWUpICYmICFfLmlzVW5kZWZpbmVkKG1hdGNoKSkge1xuICAgICAgICByZXR1cm4gdXRpbHMuZGVlcENvcHkobWF0Y2gpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVEZWZhdWx0VmFsdWUoZmllbGRUZW1wbGF0ZSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9LFxuXG4gICAgLy8gTWF0Y2ggcnVsZSBmb3IgYSBmaWVsZCB0ZW1wbGF0ZS5cbiAgICBmaWVsZFRlbXBsYXRlTWF0Y2g6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgICByZXR1cm4gZmllbGRUZW1wbGF0ZS5tYXRjaDtcbiAgICB9LFxuXG4gICAgLy8gRGV0ZXJtaW5lIGlmIGEgZmllbGQgdGVtcGxhdGUgaGFzIGEgc2luZ2xlLWxpbmUgdmFsdWUuXG4gICAgZmllbGRUZW1wbGF0ZUlzU2luZ2xlTGluZTogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcbiAgICAgIHJldHVybiBmaWVsZFRlbXBsYXRlLmlzU2luZ2xlTGluZSB8fCBmaWVsZFRlbXBsYXRlLmlzX3NpbmdsZV9saW5lIHx8XG4gICAgICAgICAgICAgIGZpZWxkVGVtcGxhdGUudHlwZSA9PT0gJ3NpbmdsZS1saW5lLXN0cmluZycgfHwgZmllbGRUZW1wbGF0ZS50eXBlID09PSAnU2luZ2xlTGluZVN0cmluZyc7XG4gICAgfSxcblxuICAgIC8vIEZpZWxkIGhlbHBlcnNcblxuICAgIC8vIEdldCBhbiBhcnJheSBvZiBrZXlzIHJlcHJlc2VudGluZyB0aGUgcGF0aCB0byBhIHZhbHVlLlxuICAgIGZpZWxkVmFsdWVQYXRoOiBmdW5jdGlvbiAoZmllbGQpIHtcblxuICAgICAgdmFyIHBhcmVudFBhdGggPSBbXTtcblxuICAgICAgaWYgKGZpZWxkLnBhcmVudCkge1xuICAgICAgICBwYXJlbnRQYXRoID0gY29uZmlnLmZpZWxkVmFsdWVQYXRoKGZpZWxkLnBhcmVudCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwYXJlbnRQYXRoLmNvbmNhdChmaWVsZC5rZXkpLmZpbHRlcihmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIHJldHVybiAhXy5pc1VuZGVmaW5lZChrZXkpICYmIGtleSAhPT0gJyc7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgLy8gQ2xvbmUgYSBmaWVsZCB3aXRoIGEgZGlmZmVyZW50IHZhbHVlLlxuICAgIGZpZWxkV2l0aFZhbHVlOiBmdW5jdGlvbiAoZmllbGQsIHZhbHVlKSB7XG4gICAgICByZXR1cm4gXy5leHRlbmQoe30sIGZpZWxkLCB7dmFsdWU6IHZhbHVlfSk7XG4gICAgfSxcblxuICAgIGZpZWxkVHlwZU5hbWU6IGRlbGVnYXRlVG8oJ2ZpZWxkVGVtcGxhdGVUeXBlTmFtZScpLFxuXG4gICAgLy8gRmllbGQgaXMgbG9hZGluZyBjaG9pY2VzLlxuICAgIGZpZWxkSXNMb2FkaW5nOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgIHJldHVybiBmaWVsZC5pc0xvYWRpbmc7XG4gICAgfSxcblxuICAgIC8vIEdldCB0aGUgY2hvaWNlcyBmb3IgYSBkcm9wZG93biBmaWVsZC5cbiAgICBmaWVsZENob2ljZXM6IGZ1bmN0aW9uIChmaWVsZCkge1xuXG4gICAgICByZXR1cm4gY29uZmlnLm5vcm1hbGl6ZUNob2ljZXMoZmllbGQuY2hvaWNlcyk7XG4gICAgfSxcblxuICAgIC8vIEdldCB0aGUgY2hvaWNlcyBmb3IgYSBwcmV0dHkgZHJvcGRvd24gZmllbGQuXG4gICAgZmllbGRQcmV0dHlDaG9pY2VzOiBmdW5jdGlvbiAoZmllbGQpIHtcblxuICAgICAgcmV0dXJuIGNvbmZpZy5ub3JtYWxpemVQcmV0dHlDaG9pY2VzKGZpZWxkLmNob2ljZXMpO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgYSBzZXQgb2YgYm9vbGVhbiBjaG9pY2VzIGZvciBhIGZpZWxkLlxuICAgIGZpZWxkQm9vbGVhbkNob2ljZXM6IGZ1bmN0aW9uIChmaWVsZCkge1xuXG4gICAgICB2YXIgY2hvaWNlcyA9IGNvbmZpZy5maWVsZENob2ljZXMoZmllbGQpO1xuXG4gICAgICBpZiAoY2hvaWNlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgbGFiZWw6ICd5ZXMnLFxuICAgICAgICAgIHZhbHVlOiB0cnVlXG4gICAgICAgIH0sIHtcbiAgICAgICAgICBsYWJlbDogJ25vJyxcbiAgICAgICAgICB2YWx1ZTogZmFsc2VcbiAgICAgICAgfV07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjaG9pY2VzLm1hcChmdW5jdGlvbiAoY2hvaWNlKSB7XG4gICAgICAgIGlmIChfLmlzQm9vbGVhbihjaG9pY2UudmFsdWUpKSB7XG4gICAgICAgICAgcmV0dXJuIGNob2ljZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gXy5leHRlbmQoe30sIGNob2ljZSwge1xuICAgICAgICAgIHZhbHVlOiBjb25maWcuY29lcmNlVmFsdWVUb0Jvb2xlYW4oY2hvaWNlLnZhbHVlKVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgYSBzZXQgb2YgcmVwbGFjZW1lbnQgY2hvaWNlcyBmb3IgYSBmaWVsZC5cbiAgICBmaWVsZFJlcGxhY2VDaG9pY2VzOiBmdW5jdGlvbiAoZmllbGQpIHtcblxuICAgICAgcmV0dXJuIGNvbmZpZy5ub3JtYWxpemVDaG9pY2VzKGZpZWxkLnJlcGxhY2VDaG9pY2VzKTtcbiAgICB9LFxuXG4gICAgLy8gVGhlIGFjdGl2ZSBzZWxlY3RlZCBjaG9pY2UgY291bGQgYmUgdW5hdmFpbGFibGUgaW4gdGhlIGN1cnJlbnQgbGlzdCBvZlxuICAgIC8vIGNob2ljZXMuIFRoaXMgcHJvdmlkZXMgdGhlIHNlbGVjdGVkIGNob2ljZSBpbiB0aGF0IGNhc2UuXG4gICAgZmllbGRTZWxlY3RlZENob2ljZTogZnVuY3Rpb24gKGZpZWxkKSB7XG5cbiAgICAgIHJldHVybiBmaWVsZC5zZWxlY3RlZENob2ljZSB8fCBudWxsO1xuICAgIH0sXG5cbiAgICAvLyBUaGUgYWN0aXZlIHJlcGxhY2UgbGFiZWxzIGNvdWxkIGJlIHVuYXZpbGFibGUgaW4gdGhlIGN1cnJlbnQgbGlzdCBvZlxuICAgIC8vIHJlcGxhY2UgY2hvaWNlcy4gVGhpcyBwcm92aWRlcyB0aGUgY3VycmVudGx5IHVzZWQgcmVwbGFjZSBsYWJlbHMgaW5cbiAgICAvLyB0aGF0IGNhc2UuXG4gICAgZmllbGRTZWxlY3RlZFJlcGxhY2VDaG9pY2VzOiBmdW5jdGlvbiAoZmllbGQpIHtcblxuICAgICAgcmV0dXJuIGNvbmZpZy5ub3JtYWxpemVDaG9pY2VzKGZpZWxkLnNlbGVjdGVkUmVwbGFjZUNob2ljZXMpO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgYSBsYWJlbCBmb3IgYSBmaWVsZC5cbiAgICBmaWVsZExhYmVsOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgIHJldHVybiBmaWVsZC5sYWJlbDtcbiAgICB9LFxuXG4gICAgLy8gR2V0IGEgcGxhY2Vob2xkZXIgKGp1c3QgYSBkZWZhdWx0IGRpc3BsYXkgdmFsdWUsIG5vdCBhIGRlZmF1bHQgdmFsdWUpIGZvciBhIGZpZWxkLlxuICAgIGZpZWxkUGxhY2Vob2xkZXI6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgcmV0dXJuIGZpZWxkLnBsYWNlaG9sZGVyO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgdGhlIGhlbHAgdGV4dCBmb3IgYSBmaWVsZC5cbiAgICBmaWVsZEhlbHBUZXh0OiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgIHJldHVybiBmaWVsZC5oZWxwX3RleHRfaHRtbCB8fCBmaWVsZC5oZWxwX3RleHQgfHwgZmllbGQuaGVscFRleHQgfHwgZmllbGQuaGVscFRleHRIdG1sO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgd2hldGhlciBvciBub3QgYSBmaWVsZCBpcyByZXF1aXJlZC5cbiAgICBmaWVsZElzUmVxdWlyZWQ6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgcmV0dXJuIGZpZWxkLnJlcXVpcmVkID8gdHJ1ZSA6IGZhbHNlO1xuICAgIH0sXG5cbiAgICAvLyBEZXRlcm1pbmUgaWYgdmFsdWUgZm9yIHRoaXMgZmllbGQgaXMgbm90IGEgbGVhZiB2YWx1ZS5cbiAgICBmaWVsZEhhc1ZhbHVlQ2hpbGRyZW46IGZ1bmN0aW9uIChmaWVsZCkge1xuXG4gICAgICB2YXIgZGVmYXVsdFZhbHVlID0gY29uZmlnLmNyZWF0ZURlZmF1bHRWYWx1ZShmaWVsZCk7XG5cbiAgICAgIGlmIChfLmlzT2JqZWN0KGRlZmF1bHRWYWx1ZSkgfHwgXy5pc0FycmF5KGRlZmF1bHRWYWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuXG4gICAgLy8gR2V0IHRoZSBjaGlsZCBmaWVsZCB0ZW1wbGF0ZXMgZm9yIHRoaXMgZmllbGQuXG4gICAgZmllbGRDaGlsZEZpZWxkVGVtcGxhdGVzOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgIHJldHVybiBmaWVsZC5maWVsZHMgfHwgW107XG4gICAgfSxcblxuICAgIC8vIEdldCB0aGUgZmllbGQgdGVtcGxhdGVzIGZvciBlYWNoIGl0ZW0gb2YgdGhpcyBmaWVsZC4gKEZvciBkeW5hbWljIGNoaWxkcmVuLFxuICAgIC8vIGxpa2UgYXJyYXlzLilcbiAgICBmaWVsZEl0ZW1GaWVsZFRlbXBsYXRlczogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICBpZiAoIWZpZWxkLml0ZW1GaWVsZHMpIHtcbiAgICAgICAgcmV0dXJuIFt7dHlwZTogJ3RleHQnfV07XG4gICAgICB9XG4gICAgICBpZiAoIV8uaXNBcnJheShmaWVsZC5pdGVtRmllbGRzKSkge1xuICAgICAgICByZXR1cm4gW2ZpZWxkLml0ZW1GaWVsZHNdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZpZWxkLml0ZW1GaWVsZHM7XG4gICAgfSxcblxuICAgIGZpZWxkSXNTaW5nbGVMaW5lOiBkZWxlZ2F0ZVRvKCdmaWVsZFRlbXBsYXRlSXNTaW5nbGVMaW5lJyksXG5cbiAgICAvLyBHZXQgd2hldGhlciBvciBub3QgYSBmaWVsZCBpcyBjb2xsYXBzZWQuXG4gICAgZmllbGRJc0NvbGxhcHNlZDogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICByZXR1cm4gZmllbGQuY29sbGFwc2VkID8gdHJ1ZSA6IGZhbHNlO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgd2hldGVyIG9yIG5vdCBhIGZpZWxkIGNhbiBiZSBjb2xsYXBzZWQuXG4gICAgZmllbGRJc0NvbGxhcHNpYmxlOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgIHJldHVybiBmaWVsZC5jb2xsYXBzaWJsZSB8fCAhXy5pc1VuZGVmaW5lZChmaWVsZC5jb2xsYXBzZWQpO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgdGhlIG51bWJlciBvZiByb3dzIGZvciBhIGZpZWxkLlxuICAgIGZpZWxkUm93czogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICByZXR1cm4gZmllbGQucm93cztcbiAgICB9LFxuXG4gICAgZmllbGRFcnJvcnM6IGZ1bmN0aW9uIChmaWVsZCkge1xuXG4gICAgICB2YXIgZXJyb3JzID0gW107XG5cbiAgICAgIGlmIChjb25maWcuaXNLZXkoZmllbGQua2V5KSkge1xuICAgICAgICBjb25maWcudmFsaWRhdGVGaWVsZChmaWVsZCwgZXJyb3JzKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGVycm9ycztcbiAgICB9LFxuXG4gICAgZmllbGRNYXRjaDogZGVsZWdhdGVUbygnZmllbGRUZW1wbGF0ZU1hdGNoJyksXG5cbiAgICAvLyBPdGhlciBoZWxwZXJzXG5cbiAgICAvLyBDb252ZXJ0IGEga2V5IHRvIGEgbmljZSBodW1hbi1yZWFkYWJsZSB2ZXJzaW9uLlxuICAgIGh1bWFuaXplOiBmdW5jdGlvbihwcm9wZXJ0eSkge1xuICAgICAgcHJvcGVydHkgPSBwcm9wZXJ0eS5yZXBsYWNlKC9cXHtcXHsvZywgJycpO1xuICAgICAgcHJvcGVydHkgPSBwcm9wZXJ0eS5yZXBsYWNlKC9cXH1cXH0vZywgJycpO1xuICAgICAgcmV0dXJuIHByb3BlcnR5LnJlcGxhY2UoL18vZywgJyAnKVxuICAgICAgLnJlcGxhY2UoLyhcXHcrKS9nLCBmdW5jdGlvbihtYXRjaCkge1xuICAgICAgICByZXR1cm4gbWF0Y2guY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBtYXRjaC5zbGljZSgxKTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvLyBOb3JtYWxpemUgc29tZSBjaG9pY2VzIGZvciBhIGRyb3AtZG93bi5cbiAgICBub3JtYWxpemVDaG9pY2VzOiBmdW5jdGlvbiAoY2hvaWNlcykge1xuXG4gICAgICBpZiAoIWNob2ljZXMpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfVxuXG4gICAgICAvLyBDb252ZXJ0IGNvbW1hIHNlcGFyYXRlZCBzdHJpbmcgdG8gYXJyYXkgb2Ygc3RyaW5ncy5cbiAgICAgIGlmIChfLmlzU3RyaW5nKGNob2ljZXMpKSB7XG4gICAgICAgIGNob2ljZXMgPSBjaG9pY2VzLnNwbGl0KCcsJyk7XG4gICAgICB9XG5cbiAgICAgIC8vIENvbnZlcnQgb2JqZWN0IHRvIGFycmF5IG9mIG9iamVjdHMgd2l0aCBgdmFsdWVgIGFuZCBgbGFiZWxgIHByb3BlcnRpZXMuXG4gICAgICBpZiAoIV8uaXNBcnJheShjaG9pY2VzKSAmJiBfLmlzT2JqZWN0KGNob2ljZXMpKSB7XG4gICAgICAgIGNob2ljZXMgPSBPYmplY3Qua2V5cyhjaG9pY2VzKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWx1ZToga2V5LFxuICAgICAgICAgICAgbGFiZWw6IGNob2ljZXNba2V5XVxuICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBDb3B5IHRoZSBhcnJheSBvZiBjaG9pY2VzIHNvIHdlIGNhbiBtYW5pcHVsYXRlIHRoZW0uXG4gICAgICBjaG9pY2VzID0gY2hvaWNlcy5zbGljZSgwKTtcblxuICAgICAgLy8gQXJyYXkgb2YgY2hvaWNlIGFycmF5cyBzaG91bGQgYmUgZmxhdHRlbmVkLlxuICAgICAgY2hvaWNlcyA9IF8uZmxhdHRlbihjaG9pY2VzKTtcblxuICAgICAgY2hvaWNlcy5mb3JFYWNoKGZ1bmN0aW9uIChjaG9pY2UsIGkpIHtcbiAgICAgICAgLy8gQ29udmVydCBhbnkgc3RyaW5nIGNob2ljZXMgdG8gb2JqZWN0cyB3aXRoIGB2YWx1ZWAgYW5kIGBsYWJlbGBcbiAgICAgICAgLy8gcHJvcGVydGllcy5cbiAgICAgICAgaWYgKF8uaXNTdHJpbmcoY2hvaWNlKSkge1xuICAgICAgICAgIGNob2ljZXNbaV0gPSB7XG4gICAgICAgICAgICB2YWx1ZTogY2hvaWNlLFxuICAgICAgICAgICAgbGFiZWw6IGNvbmZpZy5odW1hbml6ZShjaG9pY2UpXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWNob2ljZXNbaV0ubGFiZWwpIHtcbiAgICAgICAgICBjaG9pY2VzW2ldLmxhYmVsID0gY29uZmlnLmh1bWFuaXplKGNob2ljZXNbaV0udmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGNob2ljZXM7XG4gICAgfSxcblxuICAgIC8vIE5vcm1hbGl6ZSBjaG9pY2VzIGZvciBhIHByZXR0eSBkcm9wIGRvd24sIHdpdGggJ3NhbXBsZScgdmFsdWVzXG4gICAgbm9ybWFsaXplUHJldHR5Q2hvaWNlczogZnVuY3Rpb24gKGNob2ljZXMpIHtcbiAgICAgIGlmICghXy5pc0FycmF5KGNob2ljZXMpICYmIF8uaXNPYmplY3QoY2hvaWNlcykpIHtcbiAgICAgICAgY2hvaWNlcyA9IE9iamVjdC5rZXlzKGNob2ljZXMpLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbHVlOiBrZXksXG4gICAgICAgICAgICBsYWJlbDogY2hvaWNlc1trZXldLFxuICAgICAgICAgICAgc2FtcGxlOiBrZXlcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNvbmZpZy5ub3JtYWxpemVDaG9pY2VzKGNob2ljZXMpO1xuICAgIH0sXG5cbiAgICAvLyBDb2VyY2UgYSB2YWx1ZSB0byBhIGJvb2xlYW5cbiAgICBjb2VyY2VWYWx1ZVRvQm9vbGVhbjogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICBpZiAoIV8uaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgICAgIC8vIEp1c3QgdXNlIHRoZSBkZWZhdWx0IHRydXRoaW5lc3MuXG4gICAgICAgIHJldHVybiB2YWx1ZSA/IHRydWUgOiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHZhbHVlID0gdmFsdWUudG9Mb3dlckNhc2UoKTtcbiAgICAgIGlmICh2YWx1ZSA9PT0gJycgfHwgdmFsdWUgPT09ICdubycgfHwgdmFsdWUgPT09ICdvZmYnIHx8IHZhbHVlID09PSAnZmFsc2UnKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cbiAgICAvLyBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIHZhbGlkIGtleS5cbiAgICBpc0tleTogZnVuY3Rpb24gKGtleSkge1xuICAgICAgcmV0dXJuIChfLmlzTnVtYmVyKGtleSkgJiYga2V5ID49IDApIHx8IChfLmlzU3RyaW5nKGtleSkgJiYga2V5ICE9PSAnJyk7XG4gICAgfSxcblxuICAgIC8vIEZhc3Qgd2F5IHRvIGNoZWNrIGZvciBlbXB0eSBvYmplY3QuXG4gICAgaXNFbXB0eU9iamVjdDogZnVuY3Rpb24gKG9iaikge1xuICAgICAgZm9yKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcblxuICAgIGFjdGlvbkNob2ljZUxhYmVsOiBmdW5jdGlvbiAoYWN0aW9uKSB7XG4gICAgICByZXR1cm4gdXRpbHMuY2FwaXRhbGl6ZShhY3Rpb24pLnJlcGxhY2UoL1stXS9nLCAnICcpO1xuICAgIH1cbiAgfTtcbn07XG4iLCIvLyAjIGZvcm1hdGljXG5cbi8qXG5UaGUgcm9vdCBmb3JtYXRpYyBjb21wb25lbnQuXG5cblRoZSByb290IGZvcm1hdGljIGNvbXBvbmVudCBpcyBhY3R1YWxseSB0d28gY29tcG9uZW50cy4gVGhlIG1haW4gY29tcG9uZW50IGlzXG5hIGNvbnRyb2xsZWQgY29tcG9uZW50IHdoZXJlIHlvdSBtdXN0IHBhc3MgdGhlIHZhbHVlIGluIHdpdGggZWFjaCByZW5kZXIuIFRoaXNcbmlzIGFjdHVhbGx5IHdyYXBwZWQgaW4gYW5vdGhlciBjb21wb25lbnQgd2hpY2ggYWxsb3dzIHlvdSB0byB1c2UgZm9ybWF0aWMgYXNcbmFuIHVuY29udHJvbGxlZCBjb21wb25lbnQgd2hlcmUgaXQgcmV0YWlucyB0aGUgc3RhdGUgb2YgdGhlIHZhbHVlLiBUaGUgd3JhcHBlclxuaXMgd2hhdCBpcyBhY3R1YWxseSBleHBvcnRlZC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgXyA9IHJlcXVpcmUoJy4vdW5kYXNoJyk7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxudmFyIGRlZmF1bHRDb25maWdQbHVnaW4gPSByZXF1aXJlKCcuL2RlZmF1bHQtY29uZmlnJyk7XG5cbnZhciBjcmVhdGVDb25maWcgPSBmdW5jdGlvbiAoLi4uYXJncykge1xuICB2YXIgcGx1Z2lucyA9IFtkZWZhdWx0Q29uZmlnUGx1Z2luXS5jb25jYXQoYXJncyk7XG5cbiAgcmV0dXJuIHBsdWdpbnMucmVkdWNlKGZ1bmN0aW9uIChjb25maWcsIHBsdWdpbikge1xuICAgIGlmIChfLmlzRnVuY3Rpb24ocGx1Z2luKSkge1xuICAgICAgdmFyIGV4dGVuc2lvbnMgPSBwbHVnaW4oY29uZmlnKTtcbiAgICAgIGlmIChleHRlbnNpb25zKSB7XG4gICAgICAgIF8uZXh0ZW5kKGNvbmZpZywgZXh0ZW5zaW9ucyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIF8uZXh0ZW5kKGNvbmZpZywgcGx1Z2luKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29uZmlnO1xuICB9LCB7fSk7XG59O1xuXG52YXIgZGVmYXVsdENvbmZpZyA9IGNyZWF0ZUNvbmZpZygpO1xuXG4vLyBUaGUgbWFpbiBmb3JtYXRpYyBjb21wb25lbnQgdGhhdCByZW5kZXJzIHRoZSBmb3JtLlxudmFyIEZvcm1hdGljQ29udHJvbGxlZENsYXNzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnRm9ybWF0aWNDb250cm9sbGVkJyxcblxuICAvLyBSZXNwb25kIHRvIGFueSB2YWx1ZSBjaGFuZ2VzLlxuICBvbkNoYW5nZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBpbmZvKSB7XG4gICAgaWYgKCF0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGluZm8gPSBfLmV4dGVuZCh7fSwgaW5mbyk7XG4gICAgaW5mby5wYXRoID0gdGhpcy5wcm9wcy5jb25maWcuZmllbGRWYWx1ZVBhdGgoaW5mby5maWVsZCk7XG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSwgaW5mbyk7XG4gIH0sXG5cbiAgLy8gUmVzcG9uZCB0byBhbnkgYWN0aW9ucyBvdGhlciB0aGFuIHZhbHVlIGNoYW5nZXMuIChGb3IgZXhhbXBsZSwgZm9jdXMgYW5kXG4gIC8vIGJsdXIuKVxuICBvbkFjdGlvbjogZnVuY3Rpb24gKGluZm8pIHtcbiAgICBpZiAoIXRoaXMucHJvcHMub25BY3Rpb24pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaW5mbyA9IF8uZXh0ZW5kKHt9LCBpbmZvKTtcbiAgICBpbmZvLnBhdGggPSB0aGlzLnByb3BzLmNvbmZpZy5maWVsZFZhbHVlUGF0aChpbmZvLmZpZWxkKTtcbiAgICB0aGlzLnByb3BzLm9uQWN0aW9uKGluZm8pO1xuICB9LFxuXG4gIC8vIFJlbmRlciB0aGUgcm9vdCBjb21wb25lbnQgYnkgZGVsZWdhdGluZyB0byB0aGUgY29uZmlnLlxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblxuICAgIHJldHVybiBjb25maWcucmVuZGVyRm9ybWF0aWNDb21wb25lbnQodGhpcyk7XG4gIH1cbn0pO1xuXG52YXIgRm9ybWF0aWNDb250cm9sbGVkID0gUmVhY3QuY3JlYXRlRmFjdG9yeShGb3JtYXRpY0NvbnRyb2xsZWRDbGFzcyk7XG5cbi8vIEEgd3JhcHBlciBjb21wb25lbnQgdGhhdCBpcyBhY3R1YWxseSBleHBvcnRlZCBhbmQgY2FuIGFsbG93IGZvcm1hdGljIHRvIGJlXG4vLyB1c2VkIGluIGFuIFwidW5jb250cm9sbGVkXCIgbWFubmVyLiAoU2VlIHVuY29udHJvbGxlZCBjb21wb25lbnRzIGluIHRoZSBSZWFjdFxuLy8gZG9jdW1lbnRhdGlvbiBmb3IgYW4gZXhwbGFuYXRpb24gb2YgdGhlIGRpZmZlcmVuY2UuKVxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgLy8gRXhwb3J0IHNvbWUgc3R1ZmYgYXMgc3RhdGljcy5cbiAgc3RhdGljczoge1xuICAgIGNyZWF0ZUNvbmZpZzogY3JlYXRlQ29uZmlnLFxuICAgIGF2YWlsYWJsZU1peGluczoge1xuICAgICAgY2xpY2tPdXRzaWRlOiByZXF1aXJlKCcuL21peGlucy9jbGljay1vdXRzaWRlLmpzJyksXG4gICAgICBmaWVsZDogcmVxdWlyZSgnLi9taXhpbnMvZmllbGQuanMnKSxcbiAgICAgIGhlbHBlcjogcmVxdWlyZSgnLi9taXhpbnMvaGVscGVyLmpzJyksXG4gICAgICByZXNpemU6IHJlcXVpcmUoJy4vbWl4aW5zL3Jlc2l6ZS5qcycpLFxuICAgICAgc2Nyb2xsOiByZXF1aXJlKCcuL21peGlucy9zY3JvbGwuanMnKSxcbiAgICAgIHVuZG9TdGFjazogcmVxdWlyZSgnLi9taXhpbnMvdW5kby1zdGFjay5qcycpXG4gICAgfSxcbiAgICBwbHVnaW5zOiB7XG4gICAgICBib290c3RyYXA6IHJlcXVpcmUoJy4vcGx1Z2lucy9ib290c3RyYXAnKSxcbiAgICAgIG1ldGE6IHJlcXVpcmUoJy4vcGx1Z2lucy9tZXRhJyksXG4gICAgICByZWZlcmVuY2U6IHJlcXVpcmUoJy4vcGx1Z2lucy9yZWZlcmVuY2UnKSxcbiAgICAgIGVsZW1lbnRDbGFzc2VzOiByZXF1aXJlKCcuL3BsdWdpbnMvZWxlbWVudC1jbGFzc2VzJylcbiAgICB9LFxuICAgIHV0aWxzOiB1dGlsc1xuICB9LFxuXG4gIGRpc3BsYXlOYW1lOiAnRm9ybWF0aWMnLFxuXG4gIC8vIElmIHdlIGdvdCBhIHZhbHVlLCB0cmVhdCB0aGlzIGNvbXBvbmVudCBhcyBjb250cm9sbGVkLiBFaXRoZXIgd2F5LCByZXRhaW5cbiAgLy8gdGhlIHZhbHVlIGluIHRoZSBzdGF0ZS5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlzQ29udHJvbGxlZDogIV8uaXNVbmRlZmluZWQodGhpcy5wcm9wcy52YWx1ZSksXG4gICAgICB2YWx1ZTogXy5pc1VuZGVmaW5lZCh0aGlzLnByb3BzLnZhbHVlKSA/IHRoaXMucHJvcHMuZGVmYXVsdFZhbHVlIDogdGhpcy5wcm9wcy52YWx1ZVxuICAgIH07XG4gIH0sXG5cbiAgLy8gSWYgdGhpcyBpcyBhIGNvbnRyb2xsZWQgY29tcG9uZW50LCBjaGFuZ2Ugb3VyIHN0YXRlIHRvIHJlZmxlY3QgdGhlIG5ld1xuICAvLyB2YWx1ZS4gRm9yIHVuY29udHJvbGxlZCBjb21wb25lbnRzLCBpZ25vcmUgYW55IHZhbHVlIGNoYW5nZXMuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXdQcm9wcykge1xuICAgIGlmICh0aGlzLnN0YXRlLmlzQ29udHJvbGxlZCkge1xuICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKG5ld1Byb3BzLnZhbHVlKSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICB2YWx1ZTogbmV3UHJvcHMudmFsdWVcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIElmIHRoaXMgaXMgYW4gdW5jb250cm9sbGVkIGNvbXBvbmVudCwgc2V0IG91ciBzdGF0ZSB0byByZWZsZWN0IHRoZSBuZXdcbiAgLy8gdmFsdWUuIEVpdGhlciB3YXksIGNhbGwgdGhlIG9uQ2hhbmdlIGNhbGxiYWNrLlxuICBvbkNoYW5nZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBpbmZvKSB7XG4gICAgaWYgKCF0aGlzLnN0YXRlLmlzQ29udHJvbGxlZCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHZhbHVlOiBuZXdWYWx1ZVxuICAgICAgfSk7XG4gICAgfVxuICAgIGlmICghdGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG5ld1ZhbHVlLCBpbmZvKTtcbiAgfSxcblxuICAvLyBBbnkgYWN0aW9ucyBzaG91bGQgYmUgc2VudCB0byB0aGUgZ2VuZXJpYyBvbkFjdGlvbiBjYWxsYmFjayBidXQgYWxzbyBzcGxpdFxuICAvLyBpbnRvIGRpc2NyZWV0IGNhbGxiYWNrcyBwZXIgYWN0aW9uLlxuICBvbkFjdGlvbjogZnVuY3Rpb24gKGluZm8pIHtcbiAgICBpZiAodGhpcy5wcm9wcy5vbkFjdGlvbikge1xuICAgICAgdGhpcy5wcm9wcy5vbkFjdGlvbihpbmZvKTtcbiAgICB9XG4gICAgdmFyIGFjdGlvbiA9IHV0aWxzLmRhc2hUb1Bhc2NhbChpbmZvLmFjdGlvbik7XG4gICAgaWYgKHRoaXMucHJvcHNbJ29uJyArIGFjdGlvbl0pIHtcbiAgICAgIHRoaXMucHJvcHNbJ29uJyArIGFjdGlvbl0oaW5mbyk7XG4gICAgfVxuICB9LFxuXG4gIC8vIFJlbmRlciB0aGUgd3JhcHBlciBjb21wb25lbnQgKGJ5IGp1c3QgZGVsZWdhdGluZyB0byB0aGUgbWFpbiBjb21wb25lbnQpLlxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZyB8fCBkZWZhdWx0Q29uZmlnO1xuICAgIHZhciB2YWx1ZSA9IHRoaXMuc3RhdGUudmFsdWU7XG5cbiAgICBpZiAodGhpcy5zdGF0ZS5pc0NvbnRyb2xsZWQpIHtcbiAgICAgIGlmICghdGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuICAgICAgICBjb25zb2xlLmxvZygnWW91IHNob3VsZCBzdXBwbHkgYW4gb25DaGFuZ2UgaGFuZGxlciBpZiB5b3Ugc3VwcGx5IGEgdmFsdWUuJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHByb3BzID0ge1xuICAgICAgY29uZmlnOiBjb25maWcsXG4gICAgICAvLyBBbGxvdyBmaWVsZCB0ZW1wbGF0ZXMgdG8gYmUgcGFzc2VkIGluIGFzIGBmaWVsZGAgb3IgYGZpZWxkc2AuIEFmdGVyIHRoaXMsIHN0b3BcbiAgICAgIC8vIGNhbGxpbmcgdGhlbSBmaWVsZHMuXG4gICAgICBmaWVsZFRlbXBsYXRlOiB0aGlzLnByb3BzLmZpZWxkLFxuICAgICAgZmllbGRUZW1wbGF0ZXM6IHRoaXMucHJvcHMuZmllbGRzLFxuICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsXG4gICAgICBvbkFjdGlvbjogdGhpcy5vbkFjdGlvblxuICAgIH07XG5cbiAgICBfLmVhY2godGhpcy5wcm9wcywgZnVuY3Rpb24gKHByb3BWYWx1ZSwga2V5KSB7XG4gICAgICBpZiAoIShrZXkgaW4gcHJvcHMpKSB7XG4gICAgICAgIHByb3BzW2tleV0gPSBwcm9wVmFsdWU7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gRm9ybWF0aWNDb250cm9sbGVkKHByb3BzKTtcbiAgfVxuXG59KTtcbiIsIi8vICMgY2xpY2stb3V0c2lkZSBtaXhpblxuXG4vKlxuVGhlcmUncyBubyBuYXRpdmUgUmVhY3Qgd2F5IHRvIGRldGVjdCBjbGlja2luZyBvdXRzaWRlIGFuIGVsZW1lbnQuIFNvbWV0aW1lc1xudGhpcyBpcyB1c2VmdWwsIHNvIHRoYXQncyB3aGF0IHRoaXMgbWl4aW4gZG9lcy4gVG8gdXNlIGl0LCBtaXggaXQgaW4gYW5kIHVzZSBpdFxuZnJvbSB5b3VyIGNvbXBvbmVudCBsaWtlIHRoaXM6XG5cbmBgYGpzXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLm1peGlucy9jbGljay1vdXRzaWRlJyldLFxuXG4gIG9uQ2xpY2tPdXRzaWRlOiBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS5sb2coJ2NsaWNrZWQgb3V0c2lkZSEnKTtcbiAgfSxcblxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc2V0T25DbGlja091dHNpZGUoJ215RGl2JywgdGhpcy5vbkNsaWNrT3V0c2lkZSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFJlYWN0LkRPTS5kaXYoe3JlZjogJ215RGl2J30sXG4gICAgICAnSGVsbG8hJ1xuICAgIClcbiAgfVxufSk7XG5gYGBcbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSByZXF1aXJlKCcuLi91bmRhc2gnKTtcblxudmFyIGhhc0FuY2VzdG9yID0gZnVuY3Rpb24gKGNoaWxkLCBwYXJlbnQpIHtcbiAgaWYgKGNoaWxkLnBhcmVudE5vZGUgPT09IHBhcmVudCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmIChjaGlsZC5wYXJlbnROb2RlID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiBoYXNBbmNlc3RvcihjaGlsZC5wYXJlbnROb2RlLCBwYXJlbnQpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgaXNOb2RlT3V0c2lkZTogZnVuY3Rpb24gKG5vZGVPdXQsIG5vZGVJbikge1xuICAgIGlmIChub2RlT3V0ID09PSBub2RlSW4pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGhhc0FuY2VzdG9yKG5vZGVPdXQsIG5vZGVJbikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG5cbiAgaXNOb2RlSW5zaWRlOiBmdW5jdGlvbiAobm9kZUluLCBub2RlT3V0KSB7XG4gICAgcmV0dXJuICF0aGlzLmlzTm9kZU91dHNpZGUobm9kZUluLCBub2RlT3V0KTtcbiAgfSxcblxuICBfb25DbGlja01vdXNlZG93bjogZnVuY3Rpb24oKSB7XG4gICAgXy5lYWNoKHRoaXMuY2xpY2tPdXRzaWRlSGFuZGxlcnMsIGZ1bmN0aW9uIChmdW5jcywgcmVmKSB7XG4gICAgICBpZiAodGhpcy5yZWZzW3JlZl0pIHtcbiAgICAgICAgdGhpcy5fbW91c2Vkb3duUmVmc1tyZWZdID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xuICB9LFxuXG4gIF9vbkNsaWNrTW91c2V1cDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgXy5lYWNoKHRoaXMuY2xpY2tPdXRzaWRlSGFuZGxlcnMsIGZ1bmN0aW9uIChmdW5jcywgcmVmKSB7XG4gICAgICBpZiAodGhpcy5yZWZzW3JlZl0gJiYgdGhpcy5fbW91c2Vkb3duUmVmc1tyZWZdKSB7XG4gICAgICAgIGlmICh0aGlzLmlzTm9kZU91dHNpZGUoZXZlbnQudGFyZ2V0LCB0aGlzLnJlZnNbcmVmXS5nZXRET01Ob2RlKCkpKSB7XG4gICAgICAgICAgZnVuY3MuZm9yRWFjaChmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICAgIGZuLmNhbGwodGhpcywgZXZlbnQpO1xuICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuX21vdXNlZG93blJlZnNbcmVmXSA9IGZhbHNlO1xuICAgIH0uYmluZCh0aGlzKSk7XG4gIH0sXG5cbiAgc2V0T25DbGlja091dHNpZGU6IGZ1bmN0aW9uIChyZWYsIGZuKSB7XG4gICAgaWYgKCF0aGlzLmNsaWNrT3V0c2lkZUhhbmRsZXJzW3JlZl0pIHtcbiAgICAgIHRoaXMuY2xpY2tPdXRzaWRlSGFuZGxlcnNbcmVmXSA9IFtdO1xuICAgIH1cbiAgICB0aGlzLmNsaWNrT3V0c2lkZUhhbmRsZXJzW3JlZl0ucHVzaChmbik7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmNsaWNrT3V0c2lkZUhhbmRsZXJzID0ge307XG4gICAgdGhpcy5fZGlkTW91c2VEb3duID0gZmFsc2U7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5fb25DbGlja01vdXNlZG93bik7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX29uQ2xpY2tNb3VzZXVwKTtcbiAgICAvL2RvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fb25DbGlja0RvY3VtZW50KTtcbiAgICB0aGlzLl9tb3VzZWRvd25SZWZzID0ge307XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmNsaWNrT3V0c2lkZUhhbmRsZXJzID0ge307XG4gICAgLy9kb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uQ2xpY2tEb2N1bWVudCk7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX29uQ2xpY2tNb3VzZXVwKTtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9vbkNsaWNrTW91c2Vkb3duKTtcbiAgfVxufTtcbiIsIi8vICMgZmllbGQgbWl4aW5cblxuLypcblRoaXMgbWl4aW4gZ2V0cyBtaXhlZCBpbnRvIGFsbCBmaWVsZCBjb21wb25lbnRzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4uL3VuZGFzaCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICAvLyBTaWduYWwgYSBjaGFuZ2UgaW4gdmFsdWUuXG4gIG9uQ2hhbmdlVmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UodmFsdWUsIHtcbiAgICAgIGZpZWxkOiB0aGlzLnByb3BzLmZpZWxkXG4gICAgfSk7XG4gIH0sXG5cbiAgLy8gQnViYmxlIHVwIGEgdmFsdWUuXG4gIG9uQnViYmxlVmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSwgaW5mbykge1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UodmFsdWUsIGluZm8pO1xuICB9LFxuXG4gIC8vIFN0YXJ0IGFuIGFjdGlvbiBidWJibGluZyB1cCB0aHJvdWdoIHBhcmVudCBjb21wb25lbnRzLlxuICBvblN0YXJ0QWN0aW9uOiBmdW5jdGlvbiAoYWN0aW9uLCBwcm9wcykge1xuICAgIGlmICh0aGlzLnByb3BzLm9uQWN0aW9uKSB7XG4gICAgICB2YXIgaW5mbyA9IF8uZXh0ZW5kKHt9LCBwcm9wcyk7XG4gICAgICBpbmZvLmFjdGlvbiA9IGFjdGlvbjtcbiAgICAgIGluZm8uZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuICAgICAgdGhpcy5wcm9wcy5vbkFjdGlvbihpbmZvKTtcbiAgICB9XG4gIH0sXG5cbiAgb25Gb2N1c0FjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMub25TdGFydEFjdGlvbignZm9jdXMnKTtcbiAgfSxcblxuICBvbkJsdXJBY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLm9uU3RhcnRBY3Rpb24oJ2JsdXInKTtcbiAgfSxcblxuICAvLyBCdWJibGUgdXAgYW4gYWN0aW9uLlxuICBvbkJ1YmJsZUFjdGlvbjogZnVuY3Rpb24gKGluZm8pIHtcbiAgICBpZiAodGhpcy5wcm9wcy5vbkFjdGlvbikge1xuICAgICAgdGhpcy5wcm9wcy5vbkFjdGlvbihpbmZvKTtcbiAgICB9XG4gIH0sXG5cbiAgLy8gRGVsZWdhdGUgcmVuZGVyaW5nIGJhY2sgdG8gY29uZmlnIHNvIGl0IGNhbiBiZSB3cmFwcGVkLlxuICByZW5kZXJXaXRoQ29uZmlnOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMuY29uZmlnLnJlbmRlckZpZWxkQ29tcG9uZW50KHRoaXMpO1xuICB9XG59O1xuIiwiLy8gIyBoZWxwZXIgbWl4aW5cblxuLypcblRoaXMgZ2V0cyBtaXhlZCBpbnRvIGFsbCBoZWxwZXIgY29tcG9uZW50cy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSByZXF1aXJlKCcuLi91bmRhc2gnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgLy8gRGVsZWdhdGUgcmVuZGVyaW5nIGJhY2sgdG8gY29uZmlnIHNvIGl0IGNhbiBiZSB3cmFwcGVkLlxuICByZW5kZXJXaXRoQ29uZmlnOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMuY29uZmlnLnJlbmRlckNvbXBvbmVudCh0aGlzKTtcbiAgfSxcblxuICAvLyBTdGFydCBhbiBhY3Rpb24gYnViYmxpbmcgdXAgdGhyb3VnaCBwYXJlbnQgY29tcG9uZW50cy5cbiAgb25TdGFydEFjdGlvbjogZnVuY3Rpb24gKGFjdGlvbiwgcHJvcHMpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5vbkFjdGlvbikge1xuICAgICAgdmFyIGluZm8gPSBfLmV4dGVuZCh7fSwgcHJvcHMpO1xuICAgICAgaW5mby5hY3Rpb24gPSBhY3Rpb247XG4gICAgICBpbmZvLmZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcbiAgICAgIHRoaXMucHJvcHMub25BY3Rpb24oaW5mbyk7XG4gICAgfVxuICB9LFxuXG4gIC8vIEJ1YmJsZSB1cCBhbiBhY3Rpb24uXG4gIG9uQnViYmxlQWN0aW9uOiBmdW5jdGlvbiAoaW5mbykge1xuICAgIGlmICh0aGlzLnByb3BzLm9uQWN0aW9uKSB7XG4gICAgICB0aGlzLnByb3BzLm9uQWN0aW9uKGluZm8pO1xuICAgIH1cbiAgfSxcblxuICBvbkZvY3VzQWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5vblN0YXJ0QWN0aW9uKCdmb2N1cycpO1xuICB9LFxuXG4gIG9uQmx1ckFjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMub25TdGFydEFjdGlvbignYmx1cicpO1xuICB9XG59O1xuIiwiLy8gIyByZXNpemUgbWl4aW5cblxuLypcbllvdSdkIHRoaW5rIGl0IHdvdWxkIGJlIHByZXR0eSBlYXN5IHRvIGRldGVjdCB3aGVuIGEgRE9NIGVsZW1lbnQgaXMgcmVzaXplZC5cbkFuZCB5b3UnZCBiZSB3cm9uZy4gVGhlcmUgYXJlIHZhcmlvdXMgdHJpY2tzLCBidXQgbm9uZSBvZiB0aGVtIHdvcmsgdmVyeSB3ZWxsLlxuU28sIHVzaW5nIGdvb2Qgb2wnIHBvbGxpbmcgaGVyZS4gVG8gdHJ5IHRvIGJlIGFzIGVmZmljaWVudCBhcyBwb3NzaWJsZSwgdGhlcmVcbmlzIG9ubHkgYSBzaW5nbGUgc2V0SW50ZXJ2YWwgdXNlZCBmb3IgYWxsIGVsZW1lbnRzLiBUbyB1c2U6XG5cbmBgYGpzXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvcmVzaXplJyldLFxuXG4gIG9uUmVzaXplOiBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS5sb2coJ3Jlc2l6ZWQhJyk7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNldE9uUmVzaXplKCdteVRleHQnLCB0aGlzLm9uUmVzaXplKTtcbiAgfSxcblxuICBvbkNoYW5nZTogZnVuY3Rpb24gKCkge1xuICAgIC4uLlxuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSZWFjdC5ET00udGV4dGFyZWEoe3JlZjogJ215VGV4dCcsIHZhbHVlOiB0aGlzLnByb3BzLnZhbHVlLCBvbkNoYW5nZTogLi4ufSlcbiAgfVxufSk7XG5gYGBcbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGlkID0gMDtcblxudmFyIHJlc2l6ZUludGVydmFsRWxlbWVudHMgPSB7fTtcbnZhciByZXNpemVJbnRlcnZhbEVsZW1lbnRzQ291bnQgPSAwO1xudmFyIHJlc2l6ZUludGVydmFsVGltZXIgPSBudWxsO1xuXG52YXIgY2hlY2tFbGVtZW50cyA9IGZ1bmN0aW9uICgpIHtcbiAgT2JqZWN0LmtleXMocmVzaXplSW50ZXJ2YWxFbGVtZW50cykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIGVsZW1lbnQgPSByZXNpemVJbnRlcnZhbEVsZW1lbnRzW2tleV07XG4gICAgaWYgKGVsZW1lbnQuY2xpZW50V2lkdGggIT09IGVsZW1lbnQuX19wcmV2Q2xpZW50V2lkdGggfHwgZWxlbWVudC5jbGllbnRIZWlnaHQgIT09IGVsZW1lbnQuX19wcmV2Q2xpZW50SGVpZ2h0KSB7XG4gICAgICBlbGVtZW50Ll9fcHJldkNsaWVudFdpZHRoID0gZWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICAgIGVsZW1lbnQuX19wcmV2Q2xpZW50SGVpZ2h0ID0gZWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgICB2YXIgaGFuZGxlcnMgPSBlbGVtZW50Ll9fcmVzaXplSGFuZGxlcnM7XG4gICAgICBoYW5kbGVycy5mb3JFYWNoKGZ1bmN0aW9uIChoYW5kbGVyKSB7XG4gICAgICAgIGhhbmRsZXIoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSwgMTAwKTtcbn07XG5cbnZhciBhZGRSZXNpemVJbnRlcnZhbEhhbmRsZXIgPSBmdW5jdGlvbiAoZWxlbWVudCwgZm4pIHtcbiAgaWYgKHJlc2l6ZUludGVydmFsVGltZXIgPT09IG51bGwpIHtcbiAgICByZXNpemVJbnRlcnZhbFRpbWVyID0gc2V0SW50ZXJ2YWwoY2hlY2tFbGVtZW50cywgMTAwKTtcbiAgfVxuICBpZiAoISgnX19yZXNpemVJZCcgaW4gZWxlbWVudCkpIHtcbiAgICBpZCsrO1xuICAgIGVsZW1lbnQuX19wcmV2Q2xpZW50V2lkdGggPSBlbGVtZW50LmNsaWVudFdpZHRoO1xuICAgIGVsZW1lbnQuX19wcmV2Q2xpZW50SGVpZ2h0ID0gZWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgZWxlbWVudC5fX3Jlc2l6ZUlkID0gaWQ7XG4gICAgcmVzaXplSW50ZXJ2YWxFbGVtZW50c0NvdW50Kys7XG4gICAgcmVzaXplSW50ZXJ2YWxFbGVtZW50c1tpZF0gPSBlbGVtZW50O1xuICAgIGVsZW1lbnQuX19yZXNpemVIYW5kbGVycyA9IFtdO1xuICB9XG4gIGVsZW1lbnQuX19yZXNpemVIYW5kbGVycy5wdXNoKGZuKTtcbn07XG5cbnZhciByZW1vdmVSZXNpemVJbnRlcnZhbEhhbmRsZXJzID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgaWYgKCEoJ19fcmVzaXplSWQnIGluIGVsZW1lbnQpKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciByZXNpemVJZCA9IGVsZW1lbnQuX19yZXNpemVJZDtcbiAgZGVsZXRlIGVsZW1lbnQuX19yZXNpemVJZDtcbiAgZGVsZXRlIGVsZW1lbnQuX19yZXNpemVIYW5kbGVycztcbiAgZGVsZXRlIHJlc2l6ZUludGVydmFsRWxlbWVudHNbcmVzaXplSWRdO1xuICByZXNpemVJbnRlcnZhbEVsZW1lbnRzQ291bnQtLTtcbiAgaWYgKHJlc2l6ZUludGVydmFsRWxlbWVudHNDb3VudCA8IDEpIHtcbiAgICBjbGVhckludGVydmFsKHJlc2l6ZUludGVydmFsVGltZXIpO1xuICAgIHJlc2l6ZUludGVydmFsVGltZXIgPSBudWxsO1xuICB9XG59O1xuXG52YXIgb25SZXNpemUgPSBmdW5jdGlvbiAocmVmLCBmbikge1xuICBmbihyZWYpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5vblJlc2l6ZVdpbmRvdykge1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMub25SZXNpemVXaW5kb3cpO1xuICAgIH1cbiAgICB0aGlzLnJlc2l6ZUVsZW1lbnRSZWZzID0ge307XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5vblJlc2l6ZVdpbmRvdykge1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMub25SZXNpemVXaW5kb3cpO1xuICAgIH1cbiAgICBPYmplY3Qua2V5cyh0aGlzLnJlc2l6ZUVsZW1lbnRSZWZzKS5mb3JFYWNoKGZ1bmN0aW9uIChyZWYpIHtcbiAgICAgIHJlbW92ZVJlc2l6ZUludGVydmFsSGFuZGxlcnModGhpcy5yZWZzW3JlZl0uZ2V0RE9NTm9kZSgpKTtcbiAgICB9LmJpbmQodGhpcykpO1xuICB9LFxuXG4gIHNldE9uUmVzaXplOiBmdW5jdGlvbiAocmVmLCBmbikge1xuICAgIGlmICghdGhpcy5yZXNpemVFbGVtZW50UmVmc1tyZWZdKSB7XG4gICAgICB0aGlzLnJlc2l6ZUVsZW1lbnRSZWZzW3JlZl0gPSB0cnVlO1xuICAgIH1cbiAgICBhZGRSZXNpemVJbnRlcnZhbEhhbmRsZXIodGhpcy5yZWZzW3JlZl0uZ2V0RE9NTm9kZSgpLCBvblJlc2l6ZS5iaW5kKHRoaXMsIHJlZiwgZm4pKTtcbiAgfVxufTtcbiIsIi8vICMgc2Nyb2xsIG1peGluXG5cbi8qXG5DdXJyZW50bHkgdW51c2VkLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IHtcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5vblNjcm9sbFdpbmRvdykge1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdGhpcy5vblNjcm9sbFdpbmRvdyk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5vblNjcm9sbFdpbmRvdykge1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdGhpcy5vblNjcm9sbFdpbmRvdyk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufTtcbiIsIi8vICMgdW5kby1zdGFjayBtaXhpblxuXG4vKlxuR2l2ZXMgeW91ciBjb21wb25lbnQgYW4gdW5kbyBzdGFjay5cbiovXG5cbi8vIGh0dHA6Ly9wcm9tZXRoZXVzcmVzZWFyY2guZ2l0aHViLmlvL3JlYWN0LWZvcm1zL2V4YW1wbGVzL3VuZG8uaHRtbFxuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7dW5kbzogW10sIHJlZG86IFtdfTtcbiAgfSxcblxuICBzbmFwc2hvdDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHVuZG8gPSB0aGlzLnN0YXRlLnVuZG8uY29uY2F0KHRoaXMuZ2V0U3RhdGVTbmFwc2hvdCgpKTtcbiAgICBpZiAodHlwZW9mIHRoaXMuc3RhdGUudW5kb0RlcHRoID09PSAnbnVtYmVyJykge1xuICAgICAgaWYgKHVuZG8ubGVuZ3RoID4gdGhpcy5zdGF0ZS51bmRvRGVwdGgpIHtcbiAgICAgICAgdW5kby5zaGlmdCgpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnNldFN0YXRlKHt1bmRvOiB1bmRvLCByZWRvOiBbXX0pO1xuICB9LFxuXG4gIGhhc1VuZG86IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnVuZG8ubGVuZ3RoID4gMDtcbiAgfSxcblxuICBoYXNSZWRvOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5yZWRvLmxlbmd0aCA+IDA7XG4gIH0sXG5cbiAgcmVkbzogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fdW5kb0ltcGwodHJ1ZSk7XG4gIH0sXG5cbiAgdW5kbzogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fdW5kb0ltcGwoKTtcbiAgfSxcblxuICBfdW5kb0ltcGw6IGZ1bmN0aW9uKGlzUmVkbykge1xuICAgIHZhciB1bmRvID0gdGhpcy5zdGF0ZS51bmRvLnNsaWNlKDApO1xuICAgIHZhciByZWRvID0gdGhpcy5zdGF0ZS5yZWRvLnNsaWNlKDApO1xuICAgIHZhciBzbmFwc2hvdDtcblxuICAgIGlmIChpc1JlZG8pIHtcbiAgICAgIGlmIChyZWRvLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBzbmFwc2hvdCA9IHJlZG8ucG9wKCk7XG4gICAgICB1bmRvLnB1c2godGhpcy5nZXRTdGF0ZVNuYXBzaG90KCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodW5kby5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgc25hcHNob3QgPSB1bmRvLnBvcCgpO1xuICAgICAgcmVkby5wdXNoKHRoaXMuZ2V0U3RhdGVTbmFwc2hvdCgpKTtcbiAgICB9XG5cbiAgICB0aGlzLnNldFN0YXRlU25hcHNob3Qoc25hcHNob3QpO1xuICAgIHRoaXMuc2V0U3RhdGUoe3VuZG86IHVuZG8sIHJlZG86IHJlZG99KTtcbiAgfVxufTtcbiIsIi8vICMgYm9vdHN0cmFwIHBsdWdpblxuXG4vKlxuVGhlIGJvb3RzdHJhcCBwbHVnaW4gc25lYWtzIGluIHNvbWUgY2xhc3NlcyB0byBlbGVtZW50cyBzbyB0aGF0IGl0IHBsYXlzIHdlbGxcbndpdGggVHdpdHRlciBCb290c3RyYXAuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gcmVxdWlyZSgnLi4vdW5kYXNoJyk7XG5cbi8vIERlY2xhcmUgc29tZSBjbGFzc2VzIGFuZCBsYWJlbHMgZm9yIGVhY2ggZWxlbWVudC5cbnZhciBtb2RpZmllcnMgPSB7XG5cbiAgJ0ZpZWxkJzoge2NsYXNzZXM6IHsnZm9ybS1ncm91cCc6IHRydWV9fSxcbiAgJ0hlbHAnOiB7Y2xhc3NlczogeydoZWxwLWJsb2NrJzogdHJ1ZX19LFxuICAnU2FtcGxlJzoge2NsYXNzZXM6IHsnaGVscC1ibG9jayc6IHRydWV9fSxcbiAgJ0FycmF5Q29udHJvbCc6IHtjbGFzc2VzOiB7J2Zvcm0taW5saW5lJzogdHJ1ZX19LFxuICAnQXJyYXlJdGVtJzoge2NsYXNzZXM6IHsnd2VsbCc6IHRydWV9fSxcbiAgJ09iamVjdEl0ZW0nOiB7Y2xhc3Nlczogeyd3ZWxsJzogdHJ1ZX19LFxuICAnRmllbGRUZW1wbGF0ZUNob2ljZXMnOiB7Y2xhc3Nlczogeydmb3JtLWNvbnRyb2wnOiB0cnVlfX0sXG4gICdBZGRJdGVtJzoge2NsYXNzZXM6IHsnZ2x5cGhpY29uIGdseXBoaWNvbi1wbHVzJzogdHJ1ZX0sIGxhYmVsOiAnJ30sXG4gICdSZW1vdmVJdGVtJzoge2NsYXNzZXM6IHsnZ2x5cGhpY29uIGdseXBoaWNvbi1yZW1vdmUnOiB0cnVlfSwgbGFiZWw6ICcnfSxcbiAgJ01vdmVJdGVtQmFjayc6IHtjbGFzc2VzOiB7J2dseXBoaWNvbiBnbHlwaGljb24tYXJyb3ctdXAnOiB0cnVlfSwgbGFiZWw6ICcnfSxcbiAgJ01vdmVJdGVtRm9yd2FyZCc6IHtjbGFzc2VzOiB7J2dseXBoaWNvbiBnbHlwaGljb24tYXJyb3ctZG93bic6IHRydWV9LCBsYWJlbDogJyd9LFxuICAnT2JqZWN0SXRlbUtleSc6IHtjbGFzc2VzOiB7J2Zvcm0tY29udHJvbCc6IHRydWV9fSxcblxuICAnU2luZ2xlTGluZVN0cmluZyc6IHtjbGFzc2VzOiB7J2Zvcm0tY29udHJvbCc6IHRydWV9fSxcbiAgJ1N0cmluZyc6IHtjbGFzc2VzOiB7J2Zvcm0tY29udHJvbCc6IHRydWV9fSxcbiAgJ1ByZXR0eVRleHQnOiB7Y2xhc3Nlczogeydmb3JtLWNvbnRyb2wnOiB0cnVlfX0sXG4gICdKc29uJzoge2NsYXNzZXM6IHsnZm9ybS1jb250cm9sJzogdHJ1ZX19LFxuICAnU2VsZWN0VmFsdWUnOiB7Y2xhc3Nlczogeydmb3JtLWNvbnRyb2wnOiB0cnVlfX1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNvbmZpZykge1xuXG4gIHZhciBjcmVhdGVFbGVtZW50ID0gY29uZmlnLmNyZWF0ZUVsZW1lbnQ7XG5cbiAgcmV0dXJuIHtcbiAgICBjcmVhdGVFbGVtZW50OiBmdW5jdGlvbiAobmFtZSwgcHJvcHMsIGNoaWxkcmVuKSB7XG5cbiAgICAgIG5hbWUgPSBjb25maWcuZWxlbWVudE5hbWUobmFtZSk7XG5cbiAgICAgIHZhciBtb2RpZmllciA9IG1vZGlmaWVyc1tuYW1lXTtcblxuICAgICAgaWYgKG1vZGlmaWVyKSB7XG4gICAgICAgIC8vIElmIHRoZXJlIGlzIGEgbW9kaWZpZXIgZm9yIHRoaXMgZWxlbWVudCwgYWRkIHRoZSBjbGFzc2VzIGFuZCBsYWJlbC5cbiAgICAgICAgcHJvcHMgPSBfLmV4dGVuZCh7fSwgcHJvcHMpO1xuICAgICAgICBwcm9wcy5jbGFzc2VzID0gXy5leHRlbmQoe30sIHByb3BzLmNsYXNzZXMsIG1vZGlmaWVyLmNsYXNzZXMpO1xuICAgICAgICBpZiAoJ2xhYmVsJyBpbiBtb2RpZmllcikge1xuICAgICAgICAgIHByb3BzLmxhYmVsID0gbW9kaWZpZXIubGFiZWw7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNyZWF0ZUVsZW1lbnQobmFtZSwgcHJvcHMsIGNoaWxkcmVuKTtcbiAgICB9XG4gIH07XG59O1xuIiwiLy8gIyBlbGVtZW50LWNsYXNzZXMgcGx1Z2luXG5cbi8qXG5UaGlzIHBsdWdpbnMgcHJvdmlkZXMgYSBjb25maWcgbWV0aG9kIGFkZEVsZW1lbnRDbGFzcyB0aGF0IGxldHMgeW91IGFkZCBvbiBhXG5jbGFzcyB0byBhbiBlbGVtZW50LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4uL3VuZGFzaCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjb25maWcpIHtcblxuICB2YXIgY3JlYXRlRWxlbWVudCA9IGNvbmZpZy5jcmVhdGVFbGVtZW50O1xuXG4gIHZhciBlbGVtZW50Q2xhc3NlcyA9IHt9O1xuXG4gIHJldHVybiB7XG4gICAgYWRkRWxlbWVudENsYXNzOiBmdW5jdGlvbiAobmFtZSwgY2xhc3NOYW1lKSB7XG5cbiAgICAgIG5hbWUgPSBjb25maWcuZWxlbWVudE5hbWUobmFtZSk7XG5cbiAgICAgIGlmICghZWxlbWVudENsYXNzZXNbbmFtZV0pIHtcbiAgICAgICAgZWxlbWVudENsYXNzZXNbbmFtZV0gPSB7fTtcbiAgICAgIH1cblxuICAgICAgZWxlbWVudENsYXNzZXNbbmFtZV1bY2xhc3NOYW1lXSA9IHRydWU7XG4gICAgfSxcblxuICAgIC8vIFdyYXAgdGhlIGNyZWF0ZUVsZW1lbnQgbWV0aG9kLlxuICAgIGNyZWF0ZUVsZW1lbnQ6IGZ1bmN0aW9uIChuYW1lLCBwcm9wcywgY2hpbGRyZW4pIHtcblxuICAgICAgbmFtZSA9IGNvbmZpZy5lbGVtZW50TmFtZShuYW1lKTtcblxuICAgICAgaWYgKGVsZW1lbnRDbGFzc2VzW25hbWVdKSB7XG4gICAgICAgIHByb3BzID0gXy5leHRlbmQoe30sIHByb3BzLCB7Y2xhc3NlczogZWxlbWVudENsYXNzZXNbbmFtZV19KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNyZWF0ZUVsZW1lbnQobmFtZSwgcHJvcHMsIGNoaWxkcmVuKTtcbiAgICB9XG4gIH07XG59O1xuIiwiLy8gIyBtZXRhIHBsdWdpblxuXG4vKlxuVGhlIG1ldGEgcGx1Z2luIGxldHMgeW91IHBhc3MgaW4gYSBtZXRhIHByb3AgdG8gZm9ybWF0aWMuIFRoZSBwcm9wIHRoZW4gZ2V0c1xucGFzc2VkIHRocm91Z2ggYXMgYSBwcm9wZXJ0eSBmb3IgZXZlcnkgZmllbGQuIFlvdSBjYW4gdGhlbiB3cmFwIGBpbml0RmllbGRgIHRvXG5nZXQgeW91ciBtZXRhIHZhbHVlcy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgdmFyIGluaXRSb290RmllbGQgPSBjb25maWcuaW5pdFJvb3RGaWVsZDtcbiAgdmFyIGluaXRGaWVsZCA9IGNvbmZpZy5pbml0RmllbGQ7XG5cbiAgcmV0dXJuIHtcbiAgICBpbml0Um9vdEZpZWxkOiBmdW5jdGlvbiAoZmllbGQsIHByb3BzKSB7XG5cbiAgICAgIGZpZWxkLm1ldGEgPSBwcm9wcy5tZXRhIHx8IHt9O1xuXG4gICAgICBpbml0Um9vdEZpZWxkKGZpZWxkLCBwcm9wcyk7XG4gICAgfSxcblxuICAgIGluaXRGaWVsZDogZnVuY3Rpb24gKGZpZWxkKSB7XG5cbiAgICAgIGlmIChmaWVsZC5wYXJlbnQgJiYgZmllbGQucGFyZW50Lm1ldGEpIHtcbiAgICAgICAgZmllbGQubWV0YSA9IGZpZWxkLnBhcmVudC5tZXRhO1xuICAgICAgfVxuXG4gICAgICBpbml0RmllbGQoZmllbGQpO1xuICAgIH1cbiAgfTtcbn07XG4iLCIvLyAjIHJlZmVyZW5jZSBwbHVnaW5cblxuLypcblRoaXMgcGx1Z2luIGFsbG93cyBmaWVsZHMgdG8gYmUgc3RyaW5ncyBhbmQgcmVmZXJlbmNlIG90aGVyIGZpZWxkcyBieSBrZXkgb3JcbmlkLiBJdCBhbHNvIGFsbG93cyBhIGZpZWxkIHRvIGV4dGVuZCBhbm90aGVyIGZpZWxkIHdpdGhcbmV4dGVuZHM6IFsnZm9vJywgJ2JhciddIHdoZXJlICdmb28nIGFuZCAnYmFyJyByZWZlciB0byBvdGhlciBrZXlzIG9yIGlkcy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSByZXF1aXJlKCcuLi91bmRhc2gnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgdmFyIGluaXRGaWVsZCA9IGNvbmZpZy5pbml0RmllbGQ7XG5cbiAgcmV0dXJuIHtcbiAgICAvLyBMb29rIGZvciBhIHRlbXBsYXRlIGluIHRoaXMgZmllbGQgb3IgYW55IG9mIGl0cyBwYXJlbnRzLlxuICAgIGZpbmRGaWVsZFRlbXBsYXRlOiBmdW5jdGlvbiAoZmllbGQsIG5hbWUpIHtcblxuICAgICAgaWYgKGZpZWxkLnRlbXBsYXRlc1tuYW1lXSkge1xuICAgICAgICByZXR1cm4gZmllbGQudGVtcGxhdGVzW25hbWVdO1xuICAgICAgfVxuXG4gICAgICBpZiAoZmllbGQucGFyZW50KSB7XG4gICAgICAgIHJldHVybiBjb25maWcuZmluZEZpZWxkVGVtcGxhdGUoZmllbGQucGFyZW50LCBuYW1lKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcblxuICAgIC8vIEluaGVyaXQgZnJvbSBhbnkgZmllbGQgdGVtcGxhdGVzIHRoYXQgdGhpcyBmaWVsZCB0ZW1wbGF0ZVxuICAgIC8vIGV4dGVuZHMuXG4gICAgcmVzb2x2ZUZpZWxkVGVtcGxhdGU6IGZ1bmN0aW9uIChmaWVsZCwgZmllbGRUZW1wbGF0ZSkge1xuXG4gICAgICBpZiAoIWZpZWxkVGVtcGxhdGUuZXh0ZW5kcykge1xuICAgICAgICByZXR1cm4gZmllbGRUZW1wbGF0ZTtcbiAgICAgIH1cblxuICAgICAgdmFyIGV4dCA9IGZpZWxkVGVtcGxhdGUuZXh0ZW5kcztcblxuICAgICAgaWYgKCFfLmlzQXJyYXkoZXh0KSkge1xuICAgICAgICBleHQgPSBbZXh0XTtcbiAgICAgIH1cblxuICAgICAgdmFyIGJhc2VzID0gZXh0Lm1hcChmdW5jdGlvbiAoYmFzZSkge1xuICAgICAgICB2YXIgdGVtcGxhdGUgPSBjb25maWcuZmluZEZpZWxkVGVtcGxhdGUoZmllbGQsIGJhc2UpO1xuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUZW1wbGF0ZSAnICsgYmFzZSArICcgbm90IGZvdW5kLicpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgY2hhaW4gPSBbe31dLmNvbmNhdChiYXNlcy5yZXZlcnNlKCkuY29uY2F0KFtmaWVsZFRlbXBsYXRlXSkpO1xuICAgICAgZmllbGRUZW1wbGF0ZSA9IF8uZXh0ZW5kLmFwcGx5KF8sIGNoYWluKTtcblxuICAgICAgcmV0dXJuIGZpZWxkVGVtcGxhdGU7XG4gICAgfSxcblxuICAgIC8vIFdyYXAgdGhlIGluaXRGaWVsZCBtZXRob2QuXG4gICAgaW5pdEZpZWxkOiBmdW5jdGlvbiAoZmllbGQpIHtcblxuICAgICAgdmFyIHRlbXBsYXRlcyA9IGZpZWxkLnRlbXBsYXRlcyA9IHt9O1xuXG4gICAgICB2YXIgY2hpbGRGaWVsZFRlbXBsYXRlcyA9IGNvbmZpZy5maWVsZENoaWxkRmllbGRUZW1wbGF0ZXMoZmllbGQpO1xuXG4gICAgICAvLyBBZGQgZWFjaCBvZiB0aGUgY2hpbGQgZmllbGQgdGVtcGxhdGVzIHRvIG91ciB0ZW1wbGF0ZSBtYXAuXG4gICAgICBjaGlsZEZpZWxkVGVtcGxhdGVzLmZvckVhY2goZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcblxuICAgICAgICBpZiAoXy5pc1N0cmluZyhmaWVsZFRlbXBsYXRlKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBrZXkgPSBmaWVsZFRlbXBsYXRlLmtleTtcbiAgICAgICAgdmFyIGlkID0gZmllbGRUZW1wbGF0ZS5pZDtcblxuICAgICAgICBpZiAoZmllbGRUZW1wbGF0ZS50ZW1wbGF0ZSkge1xuICAgICAgICAgIGZpZWxkVGVtcGxhdGUgPSBfLmV4dGVuZCh7fSwgZmllbGRUZW1wbGF0ZSwge3RlbXBsYXRlOiBmYWxzZX0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKGtleSkgJiYga2V5ICE9PSAnJykge1xuICAgICAgICAgIHRlbXBsYXRlc1trZXldID0gZmllbGRUZW1wbGF0ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghXy5pc1VuZGVmaW5lZChpZCkgJiYgaWQgIT09ICcnKSB7XG4gICAgICAgICAgdGVtcGxhdGVzW2lkXSA9IGZpZWxkVGVtcGxhdGU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBSZXNvbHZlIGFueSByZWZlcmVuY2VzIHRvIG90aGVyIGZpZWxkIHRlbXBsYXRlcy5cbiAgICAgIGlmIChjaGlsZEZpZWxkVGVtcGxhdGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgZmllbGQuZmllbGRzID0gY2hpbGRGaWVsZFRlbXBsYXRlcy5tYXAoZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcbiAgICAgICAgICBpZiAoXy5pc1N0cmluZyhmaWVsZFRlbXBsYXRlKSkge1xuICAgICAgICAgICAgZmllbGRUZW1wbGF0ZSA9IGNvbmZpZy5maW5kRmllbGRUZW1wbGF0ZShmaWVsZCwgZmllbGRUZW1wbGF0ZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIGNvbmZpZy5yZXNvbHZlRmllbGRUZW1wbGF0ZShmaWVsZCwgZmllbGRUZW1wbGF0ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZpZWxkLmZpZWxkcyA9IGZpZWxkLmZpZWxkcy5maWx0ZXIoZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcbiAgICAgICAgICByZXR1cm4gIWZpZWxkVGVtcGxhdGUudGVtcGxhdGU7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICB2YXIgaXRlbUZpZWxkVGVtcGxhdGVzID0gY29uZmlnLmZpZWxkSXRlbUZpZWxkVGVtcGxhdGVzKGZpZWxkKTtcblxuICAgICAgLy8gUmVzb2x2ZSBhbnkgb2Ygb3VyIGl0ZW0gZmllbGQgdGVtcGxhdGVzLiAoRmllbGQgdGVtcGxhdGVzIGZvciBkeW5hbWljXG4gICAgICAvLyBjaGlsZCBmaWVsZHMuKVxuICAgICAgaWYgKGl0ZW1GaWVsZFRlbXBsYXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGZpZWxkLml0ZW1GaWVsZHMgPSBpdGVtRmllbGRUZW1wbGF0ZXMubWFwKGZ1bmN0aW9uIChpdGVtRmllbGRUZW1wbGF0ZSkge1xuICAgICAgICAgIGlmIChfLmlzU3RyaW5nKGl0ZW1GaWVsZFRlbXBsYXRlKSkge1xuICAgICAgICAgICAgaXRlbUZpZWxkVGVtcGxhdGUgPSBjb25maWcuZmluZEZpZWxkVGVtcGxhdGUoZmllbGQsIGl0ZW1GaWVsZFRlbXBsYXRlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gY29uZmlnLnJlc29sdmVGaWVsZFRlbXBsYXRlKGZpZWxkLCBpdGVtRmllbGRUZW1wbGF0ZSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpbml0RmllbGQoZmllbGQpO1xuICAgIH1cbiAgfTtcblxufTtcbiIsInZhciBfID0ge307XG5cbl8uYXNzaWduID0gXy5leHRlbmQgPSByZXF1aXJlKCdvYmplY3QtYXNzaWduJyk7XG5fLmlzRXF1YWwgPSByZXF1aXJlKCdkZWVwLWVxdWFsJyk7XG5cbi8vIFRoZXNlIGFyZSBub3QgbmVjZXNzYXJpbHkgY29tcGxldGUgaW1wbGVtZW50YXRpb25zLiBUaGV5J3JlIGp1c3QgZW5vdWdoIGZvclxuLy8gd2hhdCdzIHVzZWQgaW4gZm9ybWF0aWMuXG5cbl8uZmxhdHRlbiA9IChhcnJheXMpID0+IFtdLmNvbmNhdC5hcHBseShbXSwgYXJyYXlzKTtcblxuXy5pc1N0cmluZyA9IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZyc7XG5fLmlzVW5kZWZpbmVkID0gdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJztcbl8uaXNPYmplY3QgPSB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnO1xuXy5pc0FycmF5ID0gdmFsdWUgPT4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbl8uaXNOdW1iZXIgPSB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInO1xuXy5pc0Jvb2xlYW4gPSB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJztcbl8uaXNOdWxsID0gdmFsdWUgPT4gdmFsdWUgPT09IG51bGw7XG5fLmlzRnVuY3Rpb24gPSB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbic7XG5cbl8uY2xvbmUgPSB2YWx1ZSA9PiB7XG4gIGlmICghXy5pc09iamVjdCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIF8uaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZS5zbGljZSgpIDogXy5hc3NpZ24oe30sIHZhbHVlKTtcbn07XG5cbl8uZmluZCA9IChpdGVtcywgdGVzdEZuKSA9PiB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAodGVzdEZuKGl0ZW1zW2ldKSkge1xuICAgICAgcmV0dXJuIGl0ZW1zW2ldO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdm9pZCAwO1xufTtcblxuXy5ldmVyeSA9IChpdGVtcywgdGVzdEZuKSA9PiB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoIXRlc3RGbihpdGVtc1tpXSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5fLmVhY2ggPSAob2JqLCBpdGVyYXRlRm4pID0+IHtcbiAgT2JqZWN0LmtleXMob2JqKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgaXRlcmF0ZUZuKG9ialtrZXldLCBrZXkpO1xuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gXztcbiIsIi8vICMgdXRpbHNcblxuLypcbkp1c3Qgc29tZSBzaGFyZWQgdXRpbGl0eSBmdW5jdGlvbnMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gcmVxdWlyZSgnLi91bmRhc2gnKTtcblxudmFyIHV0aWxzID0gZXhwb3J0cztcblxuLy8gQ29weSBvYmogcmVjdXJzaW5nIGRlZXBseS5cbnV0aWxzLmRlZXBDb3B5ID0gZnVuY3Rpb24gKG9iaikge1xuICBpZiAoXy5pc0FycmF5KG9iaikpIHtcbiAgICByZXR1cm4gb2JqLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgcmV0dXJuIHV0aWxzLmRlZXBDb3B5KGl0ZW0pO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKF8uaXNGdW5jdGlvbihvYmopKSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfSBlbHNlIGlmIChfLmlzTnVsbChvYmopKSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfSBlbHNlIGlmIChfLmlzT2JqZWN0KG9iaikpIHtcbiAgICB2YXIgY29weSA9IHt9O1xuICAgIF8uZWFjaChvYmosIGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICBjb3B5W2tleV0gPSB1dGlscy5kZWVwQ29weSh2YWx1ZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGNvcHk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfVxufTtcblxuLy8gQ2FjaGUgZm9yIHN0cmluZ3MgY29udmVydGVkIHRvIFBhc2NhbCBDYXNlLiBUaGlzIHNob3VsZCBiZSBhIGZpbml0ZSBsaXN0LCBzb1xuLy8gbm90IG11Y2ggZmVhciB0aGF0IHdlIHdpbGwgcnVuIG91dCBvZiBtZW1vcnkuXG52YXIgZGFzaFRvUGFzY2FsQ2FjaGUgPSB7fTtcblxuLy8gQ29udmVydCBmb28tYmFyIHRvIEZvb0Jhci5cbnV0aWxzLmRhc2hUb1Bhc2NhbCA9IGZ1bmN0aW9uIChzKSB7XG4gIGlmIChzID09PSAnJykge1xuICAgIHJldHVybiAnJztcbiAgfVxuICBpZiAoIWRhc2hUb1Bhc2NhbENhY2hlW3NdKSB7XG4gICAgZGFzaFRvUGFzY2FsQ2FjaGVbc10gPSBzLnNwbGl0KCctJykubWFwKGZ1bmN0aW9uIChwYXJ0KSB7XG4gICAgICByZXR1cm4gcGFydFswXS50b1VwcGVyQ2FzZSgpICsgcGFydC5zdWJzdHJpbmcoMSk7XG4gICAgfSkuam9pbignJyk7XG4gIH1cbiAgcmV0dXJuIGRhc2hUb1Bhc2NhbENhY2hlW3NdO1xufTtcblxuLy8gQ29weSBhbGwgY29tcHV0ZWQgc3R5bGVzIGZyb20gb25lIERPTSBlbGVtZW50IHRvIGFub3RoZXIuXG51dGlscy5jb3B5RWxlbWVudFN0eWxlID0gZnVuY3Rpb24gKGZyb21FbGVtZW50LCB0b0VsZW1lbnQpIHtcbiAgdmFyIGZyb21TdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGZyb21FbGVtZW50LCAnJyk7XG5cbiAgaWYgKGZyb21TdHlsZS5jc3NUZXh0ICE9PSAnJykge1xuICAgIHRvRWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gZnJvbVN0eWxlLmNzc1RleHQ7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGNzc1J1bGVzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZnJvbVN0eWxlLmxlbmd0aDsgaSsrKSB7XG4gICAgY3NzUnVsZXMucHVzaChmcm9tU3R5bGVbaV0gKyAnOicgKyBmcm9tU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShmcm9tU3R5bGVbaV0pICsgJzsnKTtcbiAgfVxuICB2YXIgY3NzVGV4dCA9IGNzc1J1bGVzLmpvaW4oJycpO1xuXG4gIHRvRWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gY3NzVGV4dDtcbn07XG5cbi8vIE9iamVjdCB0byBob2xkIGJyb3dzZXIgc25pZmZpbmcgaW5mby5cbnZhciBicm93c2VyID0ge1xuICBpc0Nocm9tZTogZmFsc2UsXG4gIGlzTW96aWxsYTogZmFsc2UsXG4gIGlzT3BlcmE6IGZhbHNlLFxuICBpc0llOiBmYWxzZSxcbiAgaXNTYWZhcmk6IGZhbHNlLFxuICBpc1Vua25vd246IGZhbHNlXG59O1xuXG4vLyBTbmlmZiB0aGUgYnJvd3Nlci5cbnZhciB1YSA9ICcnO1xuXG5pZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgdWEgPSBuYXZpZ2F0b3IudXNlckFnZW50O1xufVxuXG5pZih1YS5pbmRleE9mKCdDaHJvbWUnKSA+IC0xKSB7XG4gIGJyb3dzZXIuaXNDaHJvbWUgPSB0cnVlO1xufSBlbHNlIGlmICh1YS5pbmRleE9mKCdTYWZhcmknKSA+IC0xKSB7XG4gIGJyb3dzZXIuaXNTYWZhcmkgPSB0cnVlO1xufSBlbHNlIGlmICh1YS5pbmRleE9mKCdPcGVyYScpID4gLTEpIHtcbiAgYnJvd3Nlci5pc09wZXJhID0gdHJ1ZTtcbn0gZWxzZSBpZiAodWEuaW5kZXhPZignRmlyZWZveCcpID4gLTEpIHtcbiAgYnJvd3Nlci5pc01vemlsbGEgPSB0cnVlO1xufSBlbHNlIGlmICh1YS5pbmRleE9mKCdNU0lFJykgPiAtMSkge1xuICBicm93c2VyLmlzSWUgPSB0cnVlO1xufSBlbHNlIHtcbiAgYnJvd3Nlci5pc1Vua25vd24gPSB0cnVlO1xufVxuXG4vLyBFeHBvcnQgc25pZmZlZCBicm93c2VyIGluZm8uXG51dGlscy5icm93c2VyID0gYnJvd3NlcjtcblxuLy8gQ3JlYXRlIGEgbWV0aG9kIHRoYXQgZGVsZWdhdGVzIHRvIGFub3RoZXIgbWV0aG9kIG9uIHRoZSBzYW1lIG9iamVjdC4gVGhlXG4vLyBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gdXNlcyB0aGlzIGZ1bmN0aW9uIHRvIGRlbGVnYXRlIG9uZSBtZXRob2QgdG8gYW5vdGhlci5cbnV0aWxzLmRlbGVnYXRlVG8gPSBmdW5jdGlvbiAobmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzW25hbWVdLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH07XG59O1xuXG51dGlscy5kZWxlZ2F0b3IgPSBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiBmdW5jdGlvbiAobmFtZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gb2JqW25hbWVdLmFwcGx5KG9iaiwgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9O1xufTtcblxudXRpbHMuY2FwaXRhbGl6ZSA9IGZ1bmN0aW9uKHMpIHtcbiAgcmV0dXJuIHMuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzLnN1YnN0cmluZygxKS50b0xvd2VyQ2FzZSgpO1xufTtcbiIsIi8qIVxuICBDb3B5cmlnaHQgKGMpIDIwMTUgSmVkIFdhdHNvbi5cbiAgTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlIChNSVQpLCBzZWVcbiAgaHR0cDovL2plZHdhdHNvbi5naXRodWIuaW8vY2xhc3NuYW1lc1xuKi9cblxuKGZ1bmN0aW9uICgpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGZ1bmN0aW9uIGNsYXNzTmFtZXMgKCkge1xuXG5cdFx0dmFyIGNsYXNzZXMgPSAnJztcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgYXJnID0gYXJndW1lbnRzW2ldO1xuXHRcdFx0aWYgKCFhcmcpIGNvbnRpbnVlO1xuXG5cdFx0XHR2YXIgYXJnVHlwZSA9IHR5cGVvZiBhcmc7XG5cblx0XHRcdGlmICgnc3RyaW5nJyA9PT0gYXJnVHlwZSB8fCAnbnVtYmVyJyA9PT0gYXJnVHlwZSkge1xuXHRcdFx0XHRjbGFzc2VzICs9ICcgJyArIGFyZztcblxuXHRcdFx0fSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGFyZykpIHtcblx0XHRcdFx0Y2xhc3NlcyArPSAnICcgKyBjbGFzc05hbWVzLmFwcGx5KG51bGwsIGFyZyk7XG5cblx0XHRcdH0gZWxzZSBpZiAoJ29iamVjdCcgPT09IGFyZ1R5cGUpIHtcblx0XHRcdFx0Zm9yICh2YXIga2V5IGluIGFyZykge1xuXHRcdFx0XHRcdGlmIChhcmcuaGFzT3duUHJvcGVydHkoa2V5KSAmJiBhcmdba2V5XSkge1xuXHRcdFx0XHRcdFx0Y2xhc3NlcyArPSAnICcgKyBrZXk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGNsYXNzZXMuc3Vic3RyKDEpO1xuXHR9XG5cblx0aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGRlZmluZS5hbWQgPT09ICdvYmplY3QnICYmIGRlZmluZS5hbWQpIHtcblx0XHQvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG5cdFx0ZGVmaW5lKGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBjbGFzc05hbWVzO1xuXHRcdH0pO1xuXHR9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBjbGFzc05hbWVzO1xuXHR9IGVsc2Uge1xuXHRcdHdpbmRvdy5jbGFzc05hbWVzID0gY2xhc3NOYW1lcztcblx0fVxuXG59KCkpO1xuIiwidmFyIHBTbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcbnZhciBvYmplY3RLZXlzID0gcmVxdWlyZSgnLi9saWIva2V5cy5qcycpO1xudmFyIGlzQXJndW1lbnRzID0gcmVxdWlyZSgnLi9saWIvaXNfYXJndW1lbnRzLmpzJyk7XG5cbnZhciBkZWVwRXF1YWwgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChhY3R1YWwsIGV4cGVjdGVkLCBvcHRzKSB7XG4gIGlmICghb3B0cykgb3B0cyA9IHt9O1xuICAvLyA3LjEuIEFsbCBpZGVudGljYWwgdmFsdWVzIGFyZSBlcXVpdmFsZW50LCBhcyBkZXRlcm1pbmVkIGJ5ID09PS5cbiAgaWYgKGFjdHVhbCA9PT0gZXhwZWN0ZWQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcblxuICB9IGVsc2UgaWYgKGFjdHVhbCBpbnN0YW5jZW9mIERhdGUgJiYgZXhwZWN0ZWQgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgcmV0dXJuIGFjdHVhbC5nZXRUaW1lKCkgPT09IGV4cGVjdGVkLmdldFRpbWUoKTtcblxuICAvLyA3LjMuIE90aGVyIHBhaXJzIHRoYXQgZG8gbm90IGJvdGggcGFzcyB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcsXG4gIC8vIGVxdWl2YWxlbmNlIGlzIGRldGVybWluZWQgYnkgPT0uXG4gIH0gZWxzZSBpZiAodHlwZW9mIGFjdHVhbCAhPSAnb2JqZWN0JyAmJiB0eXBlb2YgZXhwZWN0ZWQgIT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gb3B0cy5zdHJpY3QgPyBhY3R1YWwgPT09IGV4cGVjdGVkIDogYWN0dWFsID09IGV4cGVjdGVkO1xuXG4gIC8vIDcuNC4gRm9yIGFsbCBvdGhlciBPYmplY3QgcGFpcnMsIGluY2x1ZGluZyBBcnJheSBvYmplY3RzLCBlcXVpdmFsZW5jZSBpc1xuICAvLyBkZXRlcm1pbmVkIGJ5IGhhdmluZyB0aGUgc2FtZSBudW1iZXIgb2Ygb3duZWQgcHJvcGVydGllcyAoYXMgdmVyaWZpZWRcbiAgLy8gd2l0aCBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwpLCB0aGUgc2FtZSBzZXQgb2Yga2V5c1xuICAvLyAoYWx0aG91Z2ggbm90IG5lY2Vzc2FyaWx5IHRoZSBzYW1lIG9yZGVyKSwgZXF1aXZhbGVudCB2YWx1ZXMgZm9yIGV2ZXJ5XG4gIC8vIGNvcnJlc3BvbmRpbmcga2V5LCBhbmQgYW4gaWRlbnRpY2FsICdwcm90b3R5cGUnIHByb3BlcnR5LiBOb3RlOiB0aGlzXG4gIC8vIGFjY291bnRzIGZvciBib3RoIG5hbWVkIGFuZCBpbmRleGVkIHByb3BlcnRpZXMgb24gQXJyYXlzLlxuICB9IGVsc2Uge1xuICAgIHJldHVybiBvYmpFcXVpdihhY3R1YWwsIGV4cGVjdGVkLCBvcHRzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZE9yTnVsbCh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gaXNCdWZmZXIgKHgpIHtcbiAgaWYgKCF4IHx8IHR5cGVvZiB4ICE9PSAnb2JqZWN0JyB8fCB0eXBlb2YgeC5sZW5ndGggIT09ICdudW1iZXInKSByZXR1cm4gZmFsc2U7XG4gIGlmICh0eXBlb2YgeC5jb3B5ICE9PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiB4LnNsaWNlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICh4Lmxlbmd0aCA+IDAgJiYgdHlwZW9mIHhbMF0gIT09ICdudW1iZXInKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBvYmpFcXVpdihhLCBiLCBvcHRzKSB7XG4gIHZhciBpLCBrZXk7XG4gIGlmIChpc1VuZGVmaW5lZE9yTnVsbChhKSB8fCBpc1VuZGVmaW5lZE9yTnVsbChiKSlcbiAgICByZXR1cm4gZmFsc2U7XG4gIC8vIGFuIGlkZW50aWNhbCAncHJvdG90eXBlJyBwcm9wZXJ0eS5cbiAgaWYgKGEucHJvdG90eXBlICE9PSBiLnByb3RvdHlwZSkgcmV0dXJuIGZhbHNlO1xuICAvL35+fkkndmUgbWFuYWdlZCB0byBicmVhayBPYmplY3Qua2V5cyB0aHJvdWdoIHNjcmV3eSBhcmd1bWVudHMgcGFzc2luZy5cbiAgLy8gICBDb252ZXJ0aW5nIHRvIGFycmF5IHNvbHZlcyB0aGUgcHJvYmxlbS5cbiAgaWYgKGlzQXJndW1lbnRzKGEpKSB7XG4gICAgaWYgKCFpc0FyZ3VtZW50cyhiKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBhID0gcFNsaWNlLmNhbGwoYSk7XG4gICAgYiA9IHBTbGljZS5jYWxsKGIpO1xuICAgIHJldHVybiBkZWVwRXF1YWwoYSwgYiwgb3B0cyk7XG4gIH1cbiAgaWYgKGlzQnVmZmVyKGEpKSB7XG4gICAgaWYgKCFpc0J1ZmZlcihiKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoYS5sZW5ndGggIT09IGIubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gICAgZm9yIChpID0gMDsgaSA8IGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChhW2ldICE9PSBiW2ldKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHRyeSB7XG4gICAgdmFyIGthID0gb2JqZWN0S2V5cyhhKSxcbiAgICAgICAga2IgPSBvYmplY3RLZXlzKGIpO1xuICB9IGNhdGNoIChlKSB7Ly9oYXBwZW5zIHdoZW4gb25lIGlzIGEgc3RyaW5nIGxpdGVyYWwgYW5kIHRoZSBvdGhlciBpc24ndFxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvLyBoYXZpbmcgdGhlIHNhbWUgbnVtYmVyIG9mIG93bmVkIHByb3BlcnRpZXMgKGtleXMgaW5jb3Jwb3JhdGVzXG4gIC8vIGhhc093blByb3BlcnR5KVxuICBpZiAoa2EubGVuZ3RoICE9IGtiLmxlbmd0aClcbiAgICByZXR1cm4gZmFsc2U7XG4gIC8vdGhlIHNhbWUgc2V0IG9mIGtleXMgKGFsdGhvdWdoIG5vdCBuZWNlc3NhcmlseSB0aGUgc2FtZSBvcmRlciksXG4gIGthLnNvcnQoKTtcbiAga2Iuc29ydCgpO1xuICAvL35+fmNoZWFwIGtleSB0ZXN0XG4gIGZvciAoaSA9IGthLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgaWYgKGthW2ldICE9IGtiW2ldKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vZXF1aXZhbGVudCB2YWx1ZXMgZm9yIGV2ZXJ5IGNvcnJlc3BvbmRpbmcga2V5LCBhbmRcbiAgLy9+fn5wb3NzaWJseSBleHBlbnNpdmUgZGVlcCB0ZXN0XG4gIGZvciAoaSA9IGthLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAga2V5ID0ga2FbaV07XG4gICAgaWYgKCFkZWVwRXF1YWwoYVtrZXldLCBiW2tleV0sIG9wdHMpKSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHR5cGVvZiBhID09PSB0eXBlb2YgYjtcbn1cbiIsInZhciBzdXBwb3J0c0FyZ3VtZW50c0NsYXNzID0gKGZ1bmN0aW9uKCl7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYXJndW1lbnRzKVxufSkoKSA9PSAnW29iamVjdCBBcmd1bWVudHNdJztcblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gc3VwcG9ydHNBcmd1bWVudHNDbGFzcyA/IHN1cHBvcnRlZCA6IHVuc3VwcG9ydGVkO1xuXG5leHBvcnRzLnN1cHBvcnRlZCA9IHN1cHBvcnRlZDtcbmZ1bmN0aW9uIHN1cHBvcnRlZChvYmplY3QpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmplY3QpID09ICdbb2JqZWN0IEFyZ3VtZW50c10nO1xufTtcblxuZXhwb3J0cy51bnN1cHBvcnRlZCA9IHVuc3VwcG9ydGVkO1xuZnVuY3Rpb24gdW5zdXBwb3J0ZWQob2JqZWN0KXtcbiAgcmV0dXJuIG9iamVjdCAmJlxuICAgIHR5cGVvZiBvYmplY3QgPT0gJ29iamVjdCcgJiZcbiAgICB0eXBlb2Ygb2JqZWN0Lmxlbmd0aCA9PSAnbnVtYmVyJyAmJlxuICAgIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsICdjYWxsZWUnKSAmJlxuICAgICFPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwob2JqZWN0LCAnY2FsbGVlJykgfHxcbiAgICBmYWxzZTtcbn07XG4iLCJleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSB0eXBlb2YgT2JqZWN0LmtleXMgPT09ICdmdW5jdGlvbidcbiAgPyBPYmplY3Qua2V5cyA6IHNoaW07XG5cbmV4cG9ydHMuc2hpbSA9IHNoaW07XG5mdW5jdGlvbiBzaGltIChvYmopIHtcbiAgdmFyIGtleXMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikga2V5cy5wdXNoKGtleSk7XG4gIHJldHVybiBrZXlzO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBUb09iamVjdCh2YWwpIHtcblx0aWYgKHZhbCA9PSBudWxsKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignT2JqZWN0LmFzc2lnbiBjYW5ub3QgYmUgY2FsbGVkIHdpdGggbnVsbCBvciB1bmRlZmluZWQnKTtcblx0fVxuXG5cdHJldHVybiBPYmplY3QodmFsKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQsIHNvdXJjZSkge1xuXHR2YXIgZnJvbTtcblx0dmFyIGtleXM7XG5cdHZhciB0byA9IFRvT2JqZWN0KHRhcmdldCk7XG5cblx0Zm9yICh2YXIgcyA9IDE7IHMgPCBhcmd1bWVudHMubGVuZ3RoOyBzKyspIHtcblx0XHRmcm9tID0gYXJndW1lbnRzW3NdO1xuXHRcdGtleXMgPSBPYmplY3Qua2V5cyhPYmplY3QoZnJvbSkpO1xuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR0b1trZXlzW2ldXSA9IGZyb21ba2V5c1tpXV07XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHRvO1xufTtcbiJdfQ==
