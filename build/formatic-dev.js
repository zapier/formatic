!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Formatic=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// # index

// Export the Formatic React class at the top level.
"use strict";

module.exports = require("./lib/formatic");

},{"./lib/formatic":51}],2:[function(require,module,exports){
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

    var arrayControl = undefined;
    if (!config.fieldIsReadOnly(field)) {
      arrayControl = config.createElement("array-control", { field: field, onAppend: this.onAppend });
    }

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
    }).bind(this))), arrayControl));
  }
});

},{"../../mixins/field":53,"classnames":64}],3:[function(require,module,exports){
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

},{"../../mixins/field":53}],4:[function(require,module,exports){
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
        onBlur: this.onBlurAction,
        disabled: this.isReadOnly()
      }), " ", R.span({ className: "field-choice-label" }, choice.label));

      if (isInline) {
        return R.span({ key: i, className: "field-choice" }, inputField, " ");
      } else {
        return R.div({ key: i, className: "field-choice" }, inputField, " ", config.createElement("sample", { field: field, choice: choice }));
      }
    }).bind(this))));
  }
});

},{"../../mixins/field":53,"../../undash":62,"classnames":64}],5:[function(require,module,exports){
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
      onBlur: this.onBlurAction,
      disabled: this.isReadOnly()
    }), R.span({}, " "), R.span({}, config.fieldHelpText(field) || config.fieldLabel(field))));
  }
});

},{"../../mixins/field":53,"classnames":64}],6:[function(require,module,exports){
"use strict";
/* global CodeMirror */
/*eslint no-script-url:0 */

var React = (window.React);
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

  tabIndex: function tabIndex() {
    if (this.isReadOnly()) {
      return null;
    }
    return this.props.field.tabIndex;
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;
    var props = { field: field, plain: this.props.plain };

    var textBoxClasses = cx(_.extend({}, this.props.classes, { "pretty-text-box": true }));

    // Render read-only version.
    var element = React.createElement(
      "div",
      { className: "pretty-text-wrapper" },
      React.createElement(
        "div",
        { className: textBoxClasses, tabIndex: this.tabIndex(), onFocus: this.onFocusAction, onBlur: this.onBlurAction },
        React.createElement("div", { ref: "textBox", className: "internal-text-wrapper" })
      )
    );

    return config.createElement("field", props, element);
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
      readOnly: readOnly ? "nocursor" : false // 'nocursor' means read only and not focusable
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

},{"../../mixins/field":53,"../../undash":62,"classnames":64}],7:[function(require,module,exports){
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

},{"../../mixins/field":53,"classnames":64}],8:[function(require,module,exports){
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
      classes["child-fields-group"] = true;
    }

    return config.createElement("field", {
      config: config, field: field, plain: isGroup || this.props.plain
    }, R.fieldset({ className: cx(classes) }, isGroup ? React.createElement(
      "legend",
      null,
      config.fieldLabel(field)
    ) : null, fields.map((function (childField, i) {
      var key = childField.key || i;
      return config.createFieldElement({
        key: key || i,
        field: childField,
        onChange: this.onChangeField.bind(this, childField.key), onAction: this.onBubbleAction
      });
    }).bind(this))));
  }

});

},{"../../mixins/field":53,"../../undash":62,"classnames":64}],9:[function(require,module,exports){
// # fields component

/*
Render a fields in groups. Grouped by field.groupKey property.
*/

"use strict";

var React = (window.React);
var _ = require("../../undash");
var cx = require("classnames");

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

module.exports = React.createClass({

  displayName: "GroupedFields",

  mixins: [require("../../mixins/field")],

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
        "legend",
        null,
        groupLabel
      );
      className += " child-fields-group";
    }

    return React.createElement(
      "fieldset",
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

    return config.createElement("field", {
      config: config, field: field, plain: this.props.plain
    }, this.renderFields(fields));
  }

});

},{"../../mixins/field":53,"../../undash":62,"classnames":64}],10:[function(require,module,exports){
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
      onBlur: this.onBlurAction,
      disabled: this.isReadOnly()
    }));
  }
});

},{"../../mixins/field":53,"classnames":64}],11:[function(require,module,exports){
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

    var newObj = _.extend({}, this.props.field.value);

    var newValue = config.createNewChildFieldValue(field, itemChoiceIndex);

    newObj[newKey] = newValue;

    this.onChangeValue(newObj);
  },

  onRemove: function onRemove(key) {
    var newObj = _.extend({}, this.props.field.value);
    delete newObj[key];
    this.onChangeValue(newObj);
  },

  onMove: function onMove(fromKey, toKey) {
    if (fromKey !== toKey) {
      var keyToId = this.state.keyToId;
      var keyOrder = this.state.keyOrder;
      var tempDisplayKeys = this.state.tempDisplayKeys;

      var newObj = _.extend({}, this.props.field.value);

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

},{"../../mixins/field":53,"../../undash":62,"classnames":64}],12:[function(require,module,exports){
// # single-line-string component

/*
Render a single line text input.
*/

"use strict";

var React = (window.React);
var R = React.DOM;
var cx = require("classnames");

module.exports = React.createClass({

  displayName: "Password",

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
      onBlur: this.onBlurAction,
      disabled: this.isReadOnly()
    }));
  }
});

},{"../../mixins/field":53,"classnames":64}],13:[function(require,module,exports){
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

},{"../../mixins/field":53}],14:[function(require,module,exports){
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

    return config.createElement("field", {
      config: config, field: field, plain: this.props.plain, classes: this.props.classes
    }, config.createElement("pretty-select-value", {
      choices: this.state.choices, field: field, onChange: this.onChange, onAction: this.onBubbleAction
    }));
  }
});

},{"../../mixins/field":53}],15:[function(require,module,exports){
"use strict";
/*eslint no-script-url:0 */

var React = (window.React);
var _ = require("../../undash");
var cx = require("classnames");

/*
   Wraps a PrettyTextInput to be a stand alone field.
 */
module.exports = React.createClass({

  displayName: "PrettyText",

  mixins: [require("../../mixins/field")],

  render: function render() {
    return this.renderWithConfig();
  },

  focus: function focus() {
    this.refs.textBox.focus();
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;
    var field = this.props.field;
    var props = { field: field, plain: this.props.plain };

    var readOnly = config.fieldIsReadOnly(field);

    // The tab index makes this control focusable and editable. If read only, no tabIndex
    var tabIndex = readOnly ? null : field.tabIndex;

    var element = config.createElement("pretty-text-input", {
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
      ref: "textBox",
      readOnly: readOnly
    });

    return config.createElement("field", props, element);
  }
});

},{"../../mixins/field":53,"../../undash":62,"classnames":64}],16:[function(require,module,exports){
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

},{"../../mixins/field":53}],17:[function(require,module,exports){
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
      onBlur: this.onBlurAction,
      readOnly: config.fieldIsReadOnly(field)
    }));
  }
});

},{"../../mixins/field":53,"classnames":64}],18:[function(require,module,exports){
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
      onBlur: this.onBlurAction,
      disabled: this.isReadOnly()
    }));
  }
});

},{"../../mixins/field":53,"classnames":64}],19:[function(require,module,exports){
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

},{"../../mixins/field":53}],20:[function(require,module,exports){
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

},{"../../mixins/helper":54,"classnames":64}],21:[function(require,module,exports){
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

    if (!this.isReadOnly() && fieldTemplates.length > 0) {
      typeChoices = config.createElement("field-template-choices", {
        field: field, fieldTemplateIndex: this.state.fieldTemplateIndex, onSelect: this.onSelect
      });
    }

    var addItem = undefined;
    if (!this.isReadOnly()) {
      addItem = config.createElement("add-item", { field: field, onClick: this.onAppend });
    }

    return R.div({ className: cx(this.props.classes) }, typeChoices, " ", addItem);
  }
});

},{"../../mixins/helper":54,"classnames":64}],22:[function(require,module,exports){
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

},{"../../mixins/helper":54,"classnames":64}],23:[function(require,module,exports){
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

},{"../../mixins/helper":54,"classnames":64}],24:[function(require,module,exports){
// # array-item component

/*
Render an array item.
*/

"use strict";

var React = (window.React);
var R = React.DOM;
var cx = require("classnames");
var _ = require("../../undash");

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

    var arrayItemControl = undefined;
    if (!config.fieldIsReadOnly(field)) {
      arrayItemControl = config.createElement("array-item-control", { field: field, index: this.props.index, numItems: this.props.numItems,
        onMove: this.props.onMove, onRemove: this.props.onRemove, onMaybeRemove: this.onMaybeRemove });
    }

    return R.div({ className: cx(classes) }, config.createElement("array-item-value", { field: field, index: this.props.index,
      onChange: this.props.onChange, onAction: this.onBubbleAction }), arrayItemControl);
  }
});

},{"../../mixins/helper":54,"../../undash":62,"classnames":64}],25:[function(require,module,exports){
// # ChoiceSectionHeader component

/*
Render section header in choices dropdown
*/

"use strict";

var React = (window.React);
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

},{"../../mixins/helper":54,"classnames":64}],26:[function(require,module,exports){
// # choices-search component

/*
   Render a search box for choices.
 */

"use strict";

var React = (window.React);

module.exports = React.createClass({

  displayName: "ChoicesSearch",

  mixins: [require("../../mixins/helper")],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    return React.createElement(
      "div",
      { className: "choices-search" },
      React.createElement("input", { type: "text", placeholder: "Search...", onChange: this.props.onChange })
    );
  }

});

},{"../../mixins/helper":54}],27:[function(require,module,exports){
// # Choices component

/*
Render customized (non-native) dropdown choices.
*/

"use strict";

var React = (window.React);
var R = React.DOM;
var _ = require("../../undash");
var ScrollLock = require("react-scroll-lock");

var magicChoiceRe = /^\/\/\/[^\/]+\/\/\/$/;

module.exports = React.createClass({

  displayName: "Choices",

  mixins: [require("../../mixins/helper"),
  //plugin.require('mixin.resize'),
  //plugin.require('mixin.scroll'),
  require("../../mixins/click-outside"), ScrollLock],

  getInitialState: function getInitialState() {
    return {
      maxHeight: null,
      open: this.props.open,
      searchString: ""
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
    this.setOnClickOutside("container", (function (event) {

      // Make sure we don't find any nodes to ignore.
      if (!_.find(this.getIgnoreCloseNodes(), (function (node) {
        return this.isNodeInside(event.target, node);
      }).bind(this))) {
        this.onClose();
      }
    }).bind(this));

    this.adjustSize();
    this.updateListeningToWindow();
  },

  componentWillUnmount: function componentWillUnmount() {
    this.stopListeningToWindow();
  },

  onSelect: function onSelect(choice, event) {
    this.setState({
      openSection: null,
      searchString: ""
    });
    this.props.onSelect(choice.value, event);
  },

  onChoiceAction: function onChoiceAction(choice) {
    this.setState({
      openSection: null,
      searchString: ""
    });
    this.props.onChoiceAction(choice);
  },

  onClose: function onClose() {
    this.setState({
      openSection: null,
      searchString: ""
    });
    this.props.onClose();
  },

  // Doing something a little crazy... measuring on every frame. Makes this smoother than using an interval.
  // Can't using scrolling events, because we might be scrolling inside a container instead of the body.
  // Shouldn't be any more costly than animations though, I think. And only one of these is open at a time.
  updateListeningToWindow: function updateListeningToWindow() {
    var _this = this;

    if (this.refs.choices) {
      if (!this.isListening) {
        (function () {
          var listenToFrame = function () {
            requestAnimationFrame(function () {
              _this.adjustSize();
              if (_this.isListening) {
                listenToFrame();
              }
            });
          };
          _this.isListening = true;
          listenToFrame();
        })();
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

  adjustSize: function adjustSize() {
    if (this.refs.choices) {
      var node = this.refs.container.getDOMNode();
      var rect = node.getBoundingClientRect();
      var top = rect.top;
      var windowHeight = window.innerHeight;
      var height = windowHeight - top;
      if (height !== this.state.maxHeight) {
        this.setState({
          maxHeight: height
        });
      }
    }
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    var nextState = {
      open: nextProps.open
    };

    this.setState(nextState, (function () {
      this.adjustSize();
      this.updateListeningToWindow();
    }).bind(this));
  },

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
    var _this = this;

    var choices = this.props.choices;
    var config = this.props.config;

    if (choices && choices.length === 0) {
      return [{ value: "///empty///" }];
    }

    if (this.state.searchString) {
      choices = choices.filter(function (choice) {
        if (choice.sectionKey) {
          return true;
        }
        return config.isSearchStringInChoice(_this.state.searchString, choice);
      });
    }

    if (!this.props.isAccordion) {
      return choices;
    }

    var openSection = this.state.openSection;
    var alwaysExanded = this.hasOneSection() || this.state.searchString;
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

  onClick: function onClick(event) {
    // swallow clicks
    event.stopPropagation();
  },

  onChangeSearch: function onChangeSearch(event) {
    this.setState({
      searchString: event.target.value
    });
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;

    var choices = this.visibleChoices();

    var search = null;

    var hasSearch = !!this.state.searchString;

    if (!hasSearch) {
      if (this.props.choices.length > 2) {
        if (_.find(choices, function (choice) {
          return !choice.action && choice.value !== "///loading///";
        })) {
          hasSearch = true;
        }
      }
    }

    if (hasSearch) {
      search = config.createElement("choices-search", { field: this.props.field, onChange: this.onChangeSearch });
    }

    if (this.props.open) {
      return R.div({ ref: "container", onClick: this.onClick,
        className: "choices-container", style: {
          userSelect: "none", WebkitUserSelect: "none", position: "absolute",
          maxHeight: this.state.maxHeight ? this.state.maxHeight : null,
          width: this.props.width ? this.props.width : null
        } }, config.cssTransitionWrapper(search, R.ul({ key: "choices", ref: "choices", className: "choices" }, choices.map((function (choice, i) {

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

},{"../../mixins/click-outside":52,"../../mixins/helper":54,"../../undash":62,"react-scroll-lock":69}],28:[function(require,module,exports){
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

},{"../../mixins/helper":54,"classnames":64}],29:[function(require,module,exports){
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

    if (this.isReadOnly()) {
      classes.readonly = true;
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

},{"../../mixins/helper":54,"../../undash":62,"classnames":64}],30:[function(require,module,exports){
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

},{"../../mixins/helper":54,"classnames":64}],31:[function(require,module,exports){
// # button component

/*
  Clickable 'button'
*/

"use strict";

var React = (window.React);

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

},{"../../mixins/helper":54}],32:[function(require,module,exports){
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

    return R.div({
      className: cx(this.props.classes)
    }, label, " ", R.span({ className: config.fieldIsRequired(field) ? "required-text" : "not-required-text" }));
  }
});

},{"../../mixins/helper":54,"classnames":64}],33:[function(require,module,exports){
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

},{"../../mixins/helper":54}],34:[function(require,module,exports){
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

},{"../../mixins/helper":54}],35:[function(require,module,exports){
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

},{"../../mixins/helper":54,"classnames":64}],36:[function(require,module,exports){
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

},{"../../mixins/helper":54,"classnames":64}],37:[function(require,module,exports){
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

},{"../../mixins/helper":54,"classnames":64}],38:[function(require,module,exports){
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

},{"../../mixins/helper":54,"classnames":64}],39:[function(require,module,exports){
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

},{"../../mixins/helper":54,"classnames":64}],40:[function(require,module,exports){
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

},{"../../mixins/helper":54,"classnames":64}],41:[function(require,module,exports){
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

},{"../../mixins/helper":54,"classnames":64}],42:[function(require,module,exports){
// # pretty-select-input component

/*
   Render an input to be used as the element for typing a custom value into a pretty select.
 */

"use strict";

var React = (window.React);

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
    var tabIndex = this.isReadOnly() ? null : this.props.field.tabIndex;

    return this.props.config.createElement("pretty-text-input", {
      classes: this.props.classes,
      tabIndex: tabIndex,
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
      readOnly: !this.props.isEnteringCustomValue,
      disabled: this.isReadOnly()
    });
  }

});

},{"../../mixins/helper":54}],43:[function(require,module,exports){
// # pretty-select-value component

/*
   Render a select dropdown for a list of choices. Choices values can be of any
   type. Does not use native select dropdown. Choices can optionally include
   'sample' property displayed grayed out.
 */

"use strict";

var React = (window.React);
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
      choicesWidth: null
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(newProps) {
    var _this = this;

    var currentChoice = this.currentChoice(newProps);
    this.setState({
      currentChoice: currentChoice
    });

    // We only want to update when props change, not every `componentDidUpdate`. (Prevents infinite update loop.)
    this.setState({}, function () {
      _this.updateChoicesWidth();
    });
  },

  componentDidMount: function componentDidMount() {
    this.updateChoicesWidth();
  },

  updateChoicesWidth: function updateChoicesWidth() {
    var container = this.refs.container.getDOMNode();
    var width = container.getBoundingClientRect().width;
    this.setState({
      choicesWidth: width
    });
  },

  value: function value(props) {
    props = props || this.props;
    return props.field.value !== undefined ? props.field.value : "";
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var _props = this.props;
    var config = _props.config;
    var field = _props.field;

    var choices = config.normalizePrettyChoices(this.props.choices);
    var choicesOrLoading;

    if (choices.length > 1 && choices[0].value === "///loading///" || config.fieldIsLoading(field)) {
      choices = [{ value: "///loading///" }];
    }

    var choicesElem = undefined;
    if (!this.isReadOnly()) {
      choicesElem = config.createElement("choices", {
        ref: "choices",
        choices: choices,
        open: this.state.isChoicesOpen,
        ignoreCloseNodes: this.getCloseIgnoreNodes,
        onSelect: this.onSelectChoice,
        onClose: this.onCloseChoices,
        onChoiceAction: this.onChoiceAction,
        width: this.state.choicesWidth,
        field: field
      });
    }

    var inputElem = this.getInputElement();

    var customFieldElement = null;
    if (this.state.isEnteringCustomValue && this.hasCustomField()) {
      var customFieldTemplate = config.fieldCustomFieldTemplate(field);
      var customField = _.extend({ type: "PrettyText" }, {
        key: field.key, parent: field, fieldIndex: field.fieldIndex,
        rawFieldTemplate: customFieldTemplate,
        value: field.value
      }, customFieldTemplate);
      config.initField(customField);
      customFieldElement = config.createFieldElement({
        field: customField,
        onChange: this.onChangeCustomValue, onAction: this.onCustomAction,
        ref: "customFieldInput"
      });
    }

    var selectArrow = undefined;
    if (!this.isReadOnly()) {
      selectArrow = React.createElement("span", { className: "select-arrow" });
    }

    choicesOrLoading = React.createElement(
      "div",
      { ref: "container",
        className: cx(_.extend({}, this.props.classes, { "choices-open": this.state.isChoicesOpen })),
        onChange: this.onChange },
      React.createElement(
        "div",
        { ref: "toggle", onClick: this.isReadOnly() ? null : this.onToggleChoices },
        inputElem,
        selectArrow
      ),
      choicesElem,
      React.createElement(
        "span",
        null,
        customFieldElement
      )
    );

    return choicesOrLoading;
  },

  getInputElement: function getInputElement() {
    return this.props.config.createElement("pretty-select-input", {
      field: this.props.field,
      ref: "customInput",
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

  currentChoice: (function (_currentChoice) {
    var _currentChoiceWrapper = function currentChoice(_x) {
      return _currentChoice.apply(this, arguments);
    };

    _currentChoiceWrapper.toString = function () {
      return _currentChoice.toString();
    };

    return _currentChoiceWrapper;
  })(function (props) {
    props = props || this.props;
    var config = props.config;
    var field = props.field;
    var choices = props.choices;

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
  }),

  getDisplayValue: function getDisplayValue() {
    var currentChoice = this.state.currentChoice;

    //var currentChoice = this.currentChoice();
    var currentValue = this.value();
    var isDefaultValue = currentValue === this.props.config.fieldTemplateDefaultValue(this.props.field);

    if (this.state.isEnteringCustomValue || !isDefaultValue && !currentChoice && currentValue) {
      if (this.hasCustomField()) {
        var choices = this.props.choices;

        var customChoice = _.find(choices, function (choice) {
          return choice.action === "enter-custom-value";
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

    return this.props.config.fieldPlaceholder(this.props.field) || "";
  },

  hasCustomField: function hasCustomField() {
    return !!this.props.config.fieldCustomFieldTemplate(this.props.field);
  },

  onChoiceAction: function onChoiceAction(choice) {
    if (choice.action === "enter-custom-value") {
      this.setState({
        isEnteringCustomValue: true,
        isChoicesOpen: false
      }, function () {
        if (this.hasCustomField()) {
          this.refs.customFieldInput.focus();
        } else {
          this.refs.customInput.focus();
        }
      });
    } else if (choice.action === "insert-field") {
      this.setState({
        isChoicesOpen: false
      }, function () {
        this.refs.customInput.setChoicesOpen(true);
      });
    } else {
      if (choice.action === "clear-current-choice") {
        this.setState({
          isChoicesOpen: false,
          isEnteringCustomValue: false
        });
        this.props.onChange("");
      } else {
        this.setState({
          isChoicesOpen: !!choice.isOpen
        });
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
  }
});

},{"../../mixins/helper":54,"../../undash":62,"classnames":64}],44:[function(require,module,exports){
// # pretty-tag component

/*
   Pretty text tag
 */

"use strict";

var React = (window.React);
var _ = require("../../undash");
var cx = require("classnames");

module.exports = React.createClass({

  displayName: "PrettyTag",

  propTypes: {
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

},{"../../mixins/helper":54,"../../undash":62,"classnames":64}],45:[function(require,module,exports){
"use strict";
/* global CodeMirror */
/*eslint no-script-url:0 */

var React = (window.React);
var TagTranslator = require("./tag-translator");
var _ = require("../../undash");
var cx = require("classnames");

var toString = function toString(value) {
  if (_.isUndefined(value) || _.isNull(value)) {
    return "";
  }
  return String(value);
};

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

  displayName: "PrettyTextInput",

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
      // With number values, onFocus never fires, which means it stays read-only. So convert to string.
      value: toString(this.props.value),
      codeMirrorMode: false,
      isChoicesOpen: false,
      replaceChoices: replaceChoices,
      translator: translator
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

  insertBtn: function insertBtn() {
    if (this.isReadOnly()) {
      return null;
    }

    var onInsertClick = function onInsertClick() {
      this.setState({ selectedTagPos: null });
      this.onToggleChoices();
    };

    return this.props.config.createElement("insert-button", { ref: "toggle", onClick: onInsertClick.bind(this) }, "Insert...");
  },

  choices: function choices() {
    if (this.isReadOnly()) {
      return null;
    }

    return this.props.config.createElement("choices", {
      ref: "choices",
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

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var textBoxClasses = cx(_.extend({}, this.props.classes, { "pretty-text-box": true }));

    // Render read-only version.
    return React.createElement(
      "div",
      { className: cx({ "pretty-text-wrapper": true, "choices-open": this.state.isChoicesOpen }), onMouseEnter: this.switchToCodeMirror },
      React.createElement(
        "div",
        { className: textBoxClasses, tabIndex: this.props.tabIndex, onFocus: this.props.onFocus, onBlur: this.props.onBlur },
        React.createElement("div", { ref: "textBox", className: "internal-text-wrapper" })
      ),
      this.insertBtn(),
      this.choices()
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
        var props = { key: i, tag: part.value, replaceChoices: self.state.replaceChoices, field: self.props.field };
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

    if (this.isReadOnly()) {
      return; // never render in code mirror if read-only
    }

    if (!this.state.codeMirrorMode && !this.props.readOnly) {
      this.setState({ codeMirrorMode: true }, function () {
        if (_this.codeMirror && _.isFunction(cb)) {
          cb();
        }
      });
    }
  },

  onTagClick: function onTagClick() {
    var cursor = this.codeMirror.getCursor();
    var pos = this.state.translator.getTrueTagPosition(this.state.value, cursor);

    this.setState({ selectedTagPos: pos });
    this.onToggleChoices();
  },

  createTagNode: function createTagNode(pos) {
    var node = document.createElement("span");
    var label = this.state.translator.getLabel(pos.tag);
    var config = this.props.config;

    var props = { onClick: this.onTagClick, field: this.props.field, tag: pos.tag };

    React.render(config.createElement("pretty-tag", props, label), node);

    return node;
  }
});

},{"../../mixins/helper":54,"../../undash":62,"./tag-translator":49,"classnames":64}],46:[function(require,module,exports){
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

},{"../../mixins/helper":54,"classnames":64}],47:[function(require,module,exports){
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

},{"../../mixins/helper":54,"classnames":64}],48:[function(require,module,exports){
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
        onBlur: this.onBlurAction,
        disabled: this.isReadOnly()
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

},{"../../mixins/helper":54,"../../undash":62,"classnames":64}],49:[function(require,module,exports){
"use strict";
var _ = require("../../undash");

var buildChoicesMap = function (replaceChoices) {
  var choices = {};
  replaceChoices.forEach(function (choice) {
    var key = choice.value;
    choices[key] = choice.label;
  });
  return choices;
};

var getTagPositions = function (text) {
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
};

var tokenize = function (text) {
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
var getTrueTagPosition = function (text, cmPos) {
  var positions = getTagPositions(text);
  return _.find(positions, function (p) {
    return cmPos.line === p.line && cmPos.ch >= p.start && cmPos.ch <= p.stop;
  });
};

/*
   Creates helper to translate between tags like {{firstName}} and
   an encoded representation suitable for use in CodeMirror.
 */
var TagTranslator = function (replaceChoices, humanize) {
  // Map of tag to label 'firstName' --> 'First Name'
  var choices = buildChoicesMap(replaceChoices);

  return {
    /*
       Get label for tag.  For example 'firstName' becomes 'First Name'.
       Returns a humanized version of the tag if we don't have a label for the tag.
     */
    getLabel: function (tag) {
      var label = choices[tag];
      if (!label) {
        // If tag not found and we have a humanize function, humanize the tag.
        // Otherwise just return the tag.
        label = humanize && humanize(tag) || tag;
      }
      return label;
    },

    getTagPositions: getTagPositions,
    tokenize: tokenize,
    getTrueTagPosition: getTrueTagPosition
  };
};

module.exports = TagTranslator;

},{"../../undash":62}],50:[function(require,module,exports){
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

    createElement_GroupedFields: React.createFactory(require("./components/fields/grouped-fields")),

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

    createElement_ChoicesSearch: React.createFactory(require("./components/helpers/choices-search")),

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

    createElement_PrettyTextInput: React.createFactory(require("./components/helpers/pretty-text-input")),

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

    // Template for a custom field for a dropdown.
    fieldCustomFieldTemplate: function fieldCustomFieldTemplate(field) {
      return field.customField;
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
    },

    isSearchStringInChoice: function isSearchStringInChoice(searchString, choice) {
      return choice.label && choice.label.toLowerCase().indexOf(searchString.toLowerCase()) > -1;
    }
  };
};
/* fieldTemplate */ /* fieldTemplate */ /* fieldTemplate */ /* fieldTemplate */ /* field, props */ /* field */

},{"./components/fields/array":2,"./components/fields/boolean":3,"./components/fields/checkbox-array":4,"./components/fields/checkbox-boolean":5,"./components/fields/code":6,"./components/fields/copy":7,"./components/fields/fields":8,"./components/fields/grouped-fields":9,"./components/fields/json":10,"./components/fields/object":11,"./components/fields/password":12,"./components/fields/pretty-boolean":13,"./components/fields/pretty-select":14,"./components/fields/pretty-text2":15,"./components/fields/select":16,"./components/fields/single-line-string":17,"./components/fields/string":18,"./components/fields/unknown":19,"./components/helpers/add-item":20,"./components/helpers/array-control":21,"./components/helpers/array-item":24,"./components/helpers/array-item-control":22,"./components/helpers/array-item-value":23,"./components/helpers/choice-section-header":25,"./components/helpers/choices":27,"./components/helpers/choices-search":26,"./components/helpers/field":29,"./components/helpers/field-template-choices":28,"./components/helpers/help":30,"./components/helpers/insert-button":31,"./components/helpers/label":32,"./components/helpers/loading-choice":33,"./components/helpers/loading-choices":34,"./components/helpers/move-item-back":35,"./components/helpers/move-item-forward":36,"./components/helpers/object-control":37,"./components/helpers/object-item":41,"./components/helpers/object-item-control":38,"./components/helpers/object-item-key":39,"./components/helpers/object-item-value":40,"./components/helpers/pretty-select-input":42,"./components/helpers/pretty-select-value":43,"./components/helpers/pretty-tag":44,"./components/helpers/pretty-text-input":45,"./components/helpers/remove-item":46,"./components/helpers/sample":47,"./components/helpers/select-value":48,"./undash":62,"./utils":63}],51:[function(require,module,exports){
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

},{"./default-config":50,"./mixins/click-outside.js":52,"./mixins/field.js":53,"./mixins/helper.js":54,"./mixins/resize.js":55,"./mixins/scroll.js":56,"./mixins/undo-stack.js":57,"./plugins/bootstrap":58,"./plugins/element-classes":59,"./plugins/meta":60,"./plugins/reference":61,"./undash":62,"./utils":63}],52:[function(require,module,exports){
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

},{"../undash":62}],53:[function(require,module,exports){
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
  },

  isReadOnly: function isReadOnly() {
    return this.props.config.fieldIsReadOnly(this.props.field);
  }
};

},{"../undash":62}],54:[function(require,module,exports){
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
  },

  isReadOnly: function isReadOnly() {
    return this.props.config.fieldIsReadOnly(this.props.field);
  }
};

},{"../undash":62}],55:[function(require,module,exports){
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

},{}],56:[function(require,module,exports){
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

},{}],57:[function(require,module,exports){
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

},{}],58:[function(require,module,exports){
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

},{"../undash":62}],59:[function(require,module,exports){
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

},{"../undash":62}],60:[function(require,module,exports){
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

},{}],61:[function(require,module,exports){
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

},{"../undash":62}],62:[function(require,module,exports){
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

},{"deep-equal":65,"object-assign":68}],63:[function(require,module,exports){
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

},{"./undash":62}],64:[function(require,module,exports){
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

},{}],65:[function(require,module,exports){
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

},{"./lib/is_arguments.js":66,"./lib/keys.js":67}],66:[function(require,module,exports){
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

},{}],67:[function(require,module,exports){
exports = module.exports = typeof Object.keys === 'function'
  ? Object.keys : shim;

exports.shim = shim;
function shim (obj) {
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
}

},{}],68:[function(require,module,exports){
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

},{}],69:[function(require,module,exports){
module.exports = require('./src/ScrollLock');
},{"./src/ScrollLock":70}],70:[function(require,module,exports){
/**
 * Created by laiff on 10.12.14.
 */

/**
 * Prevent default behavior for event
 *
 * @param e
 * @returns {boolean}
 */
var cancelScrollEvent = function (e) {
    e.stopImmediatePropagation();
    e.preventDefault();
    e.returnValue = false;
    return false;
};

var addScrollEventListener = function (elem, handler) {
    elem.addEventListener('wheel', handler, false);
};

var removeScrollEventListener = function (elem, handler) {
    elem.removeEventListener('wheel', handler, false);
};

/**
 * @extends ReactCompositeComponentInterface
 *
 * @mixin ScrollLock
 */
var ScrollLock = {

    componentDidMount: function () {
        this.scrollLock();
    },

    componentDidUpdate: function () {
        this.scrollLock();
    },

    componentWillUnmount: function () {
        this.scrollRelease();
    },

    scrollLock: function () {
        var elem = this.getDOMNode();
        if (elem) {
            addScrollEventListener(elem, this.onScrollHandler);
        }
    },

    scrollRelease: function () {
        var elem = this.getDOMNode();
        if (elem) {
            removeScrollEventListener(elem, this.onScrollHandler);
        }
    },

    onScrollHandler: function (e) {
        var elem = this.getDOMNode();
        var scrollTop = elem.scrollTop;
        var scrollHeight = elem.scrollHeight;
        var height = elem.clientHeight;
        var wheelDelta = e.deltaY;
        var isDeltaPositive = wheelDelta > 0;

        if (isDeltaPositive && wheelDelta > scrollHeight - height - scrollTop) {
            elem.scrollTop = scrollHeight;
            return cancelScrollEvent(e);
        }
        else if (!isDeltaPositive && -wheelDelta > scrollTop) {
            elem.scrollTop = 0;
            return cancelScrollEvent(e);
        }
    }
};

module.exports = ScrollLock;
},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvaW5kZXguanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvZmllbGRzL2FycmF5LmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9ib29sZWFuLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9jaGVja2JveC1hcnJheS5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9maWVsZHMvY2hlY2tib3gtYm9vbGVhbi5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9maWVsZHMvY29kZS5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9maWVsZHMvY29weS5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9maWVsZHMvZmllbGRzLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9ncm91cGVkLWZpZWxkcy5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9maWVsZHMvanNvbi5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9maWVsZHMvb2JqZWN0LmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9wYXNzd29yZC5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9maWVsZHMvcHJldHR5LWJvb2xlYW4uanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvZmllbGRzL3ByZXR0eS1zZWxlY3QuanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvZmllbGRzL3ByZXR0eS10ZXh0Mi5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9maWVsZHMvc2VsZWN0LmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9zaW5nbGUtbGluZS1zdHJpbmcuanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvZmllbGRzL3N0cmluZy5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9maWVsZHMvdW5rbm93bi5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2FkZC1pdGVtLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvYXJyYXktY29udHJvbC5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2FycmF5LWl0ZW0tY29udHJvbC5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2FycmF5LWl0ZW0tdmFsdWUuanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9hcnJheS1pdGVtLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvY2hvaWNlLXNlY3Rpb24taGVhZGVyLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvY2hvaWNlcy1zZWFyY2guanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9jaG9pY2VzLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvZmllbGQtdGVtcGxhdGUtY2hvaWNlcy5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2ZpZWxkLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvaGVscC5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2luc2VydC1idXR0b24uanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9sYWJlbC5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2xvYWRpbmctY2hvaWNlLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvbG9hZGluZy1jaG9pY2VzLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvbW92ZS1pdGVtLWJhY2suanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9tb3ZlLWl0ZW0tZm9yd2FyZC5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL29iamVjdC1jb250cm9sLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWl0ZW0tY29udHJvbC5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL29iamVjdC1pdGVtLWtleS5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL29iamVjdC1pdGVtLXZhbHVlLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWl0ZW0uanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9wcmV0dHktc2VsZWN0LWlucHV0LmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvcHJldHR5LXNlbGVjdC12YWx1ZS5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL3ByZXR0eS10YWcuanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9wcmV0dHktdGV4dC1pbnB1dC5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL3JlbW92ZS1pdGVtLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvc2FtcGxlLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvc2VsZWN0LXZhbHVlLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvdGFnLXRyYW5zbGF0b3IuanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL2RlZmF1bHQtY29uZmlnLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9mb3JtYXRpYy5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvbWl4aW5zL2NsaWNrLW91dHNpZGUuanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL21peGlucy9maWVsZC5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvbWl4aW5zL2hlbHBlci5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvbWl4aW5zL3Jlc2l6ZS5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvbWl4aW5zL3Njcm9sbC5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvbWl4aW5zL3VuZG8tc3RhY2suanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL3BsdWdpbnMvYm9vdHN0cmFwLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9wbHVnaW5zL2VsZW1lbnQtY2xhc3Nlcy5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvcGx1Z2lucy9tZXRhLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9wbHVnaW5zL3JlZmVyZW5jZS5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvdW5kYXNoLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi91dGlscy5qcyIsIm5vZGVfbW9kdWxlcy9jbGFzc25hbWVzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RlZXAtZXF1YWwvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZGVlcC1lcXVhbC9saWIvaXNfYXJndW1lbnRzLmpzIiwibm9kZV9tb2R1bGVzL2RlZXAtZXF1YWwvbGliL2tleXMuanMiLCJub2RlX21vZHVsZXMvb2JqZWN0LWFzc2lnbi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZWFjdC1zY3JvbGwtbG9jay9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZWFjdC1zY3JvbGwtbG9jay9zcmMvU2Nyb2xsTG9jay5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0FDR0EsTUFBTSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzs7Ozs7Ozs7O0FDRzNDLFlBQVksQ0FBQzs7QUFFYixJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDcEMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQztBQUNsQixJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7O0FBRS9CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7QUFFakMsYUFBVyxFQUFFLE9BQU87O0FBRXBCLFFBQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDOzs7Ozs7OztBQVF2QyxjQUFZLEVBQUUsQ0FBQzs7QUFFZixpQkFBZSxFQUFFLDJCQUFZOzs7O0FBSTNCLFFBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQzs7QUFFakIsUUFBSSxLQUFL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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyAjIGluZGV4XG5cbi8vIEV4cG9ydCB0aGUgRm9ybWF0aWMgUmVhY3QgY2xhc3MgYXQgdGhlIHRvcCBsZXZlbC5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvZm9ybWF0aWMnKTtcbiIsIi8vICMgYXJyYXkgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgYSBmaWVsZCB0byBlZGl0IGFycmF5IHZhbHVlcy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdBcnJheScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIC8vIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAvLyAgIHJldHVybiB7XG4gIC8vICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lXG4gIC8vICAgfTtcbiAgLy8gfSxcblxuICBuZXh0TG9va3VwSWQ6IDAsXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAvLyBOZWVkIHRvIGNyZWF0ZSBhcnRpZmljaWFsIGtleXMgZm9yIHRoZSBhcnJheS4gSW5kZXhlcyBhcmUgbm90IGdvb2Qga2V5cyxcbiAgICAvLyBzaW5jZSB0aGV5IGNoYW5nZS4gU28sIG1hcCBlYWNoIHBvc2l0aW9uIHRvIGFuIGFydGlmaWNpYWwga2V5XG4gICAgdmFyIGxvb2t1cHMgPSBbXTtcblxuICAgIHZhciBpdGVtcyA9IHRoaXMucHJvcHMuZmllbGQudmFsdWU7XG5cbiAgICBpdGVtcy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtLCBpKSB7XG4gICAgICBsb29rdXBzW2ldID0gJ18nICsgdGhpcy5uZXh0TG9va3VwSWQ7XG4gICAgICB0aGlzLm5leHRMb29rdXBJZCsrO1xuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgbG9va3VwczogbG9va3Vwc1xuICAgIH07XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gKG5ld1Byb3BzKSB7XG5cbiAgICB2YXIgbG9va3VwcyA9IHRoaXMuc3RhdGUubG9va3VwcztcblxuICAgIHZhciBpdGVtcyA9IG5ld1Byb3BzLmZpZWxkLnZhbHVlO1xuXG4gICAgLy8gTmVlZCB0byBzZXQgYXJ0aWZpY2lhbCBrZXlzIGZvciBuZXcgYXJyYXkgaXRlbXMuXG4gICAgaWYgKGl0ZW1zLmxlbmd0aCA+IGxvb2t1cHMubGVuZ3RoKSB7XG4gICAgICBmb3IgKHZhciBpID0gbG9va3Vwcy5sZW5ndGg7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsb29rdXBzW2ldID0gJ18nICsgdGhpcy5uZXh0TG9va3VwSWQ7XG4gICAgICAgIHRoaXMubmV4dExvb2t1cElkKys7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBsb29rdXBzOiBsb29rdXBzXG4gICAgfSk7XG4gIH0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChpLCBuZXdWYWx1ZSwgaW5mbykge1xuICAgIHZhciBuZXdBcnJheVZhbHVlID0gdGhpcy5wcm9wcy5maWVsZC52YWx1ZS5zbGljZSgwKTtcbiAgICBuZXdBcnJheVZhbHVlW2ldID0gbmV3VmFsdWU7XG4gICAgdGhpcy5vbkJ1YmJsZVZhbHVlKG5ld0FycmF5VmFsdWUsIGluZm8pO1xuICB9LFxuXG4gIG9uQXBwZW5kOiBmdW5jdGlvbiAoaXRlbUNob2ljZUluZGV4KSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICB2YXIgbmV3VmFsdWUgPSBjb25maWcuY3JlYXRlTmV3Q2hpbGRGaWVsZFZhbHVlKGZpZWxkLCBpdGVtQ2hvaWNlSW5kZXgpO1xuXG4gICAgdmFyIGl0ZW1zID0gZmllbGQudmFsdWU7XG5cbiAgICBpdGVtcyA9IGl0ZW1zLmNvbmNhdChuZXdWYWx1ZSk7XG5cbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUoaXRlbXMpO1xuICB9LFxuXG4gIG9uUmVtb3ZlOiBmdW5jdGlvbiAoaSkge1xuICAgIHZhciBsb29rdXBzID0gdGhpcy5zdGF0ZS5sb29rdXBzO1xuICAgIGxvb2t1cHMuc3BsaWNlKGksIDEpO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgbG9va3VwczogbG9va3Vwc1xuICAgIH0pO1xuICAgIHZhciBuZXdJdGVtcyA9IHRoaXMucHJvcHMuZmllbGQudmFsdWUuc2xpY2UoMCk7XG4gICAgbmV3SXRlbXMuc3BsaWNlKGksIDEpO1xuICAgIHRoaXMub25DaGFuZ2VWYWx1ZShuZXdJdGVtcyk7XG4gIH0sXG5cbiAgb25Nb3ZlOiBmdW5jdGlvbiAoZnJvbUluZGV4LCB0b0luZGV4KSB7XG4gICAgdmFyIGxvb2t1cHMgPSB0aGlzLnN0YXRlLmxvb2t1cHM7XG4gICAgdmFyIGZyb21JZCA9IGxvb2t1cHNbZnJvbUluZGV4XTtcbiAgICB2YXIgdG9JZCA9IGxvb2t1cHNbdG9JbmRleF07XG4gICAgbG9va3Vwc1tmcm9tSW5kZXhdID0gdG9JZDtcbiAgICBsb29rdXBzW3RvSW5kZXhdID0gZnJvbUlkO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgbG9va3VwczogbG9va3Vwc1xuICAgIH0pO1xuXG4gICAgdmFyIG5ld0l0ZW1zID0gdGhpcy5wcm9wcy5maWVsZC52YWx1ZS5zbGljZSgwKTtcbiAgICBpZiAoZnJvbUluZGV4ICE9PSB0b0luZGV4ICYmXG4gICAgICBmcm9tSW5kZXggPj0gMCAmJiBmcm9tSW5kZXggPCBuZXdJdGVtcy5sZW5ndGggJiZcbiAgICAgIHRvSW5kZXggPj0gMCAmJiB0b0luZGV4IDwgbmV3SXRlbXMubGVuZ3RoXG4gICAgKSB7XG4gICAgICBuZXdJdGVtcy5zcGxpY2UodG9JbmRleCwgMCwgbmV3SXRlbXMuc3BsaWNlKGZyb21JbmRleCwgMSlbMF0pO1xuICAgIH1cbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUobmV3SXRlbXMpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHZhciBmaWVsZHMgPSBjb25maWcuY3JlYXRlQ2hpbGRGaWVsZHMoZmllbGQpO1xuXG4gICAgbGV0IGFycmF5Q29udHJvbDtcbiAgICBpZiAoIWNvbmZpZy5maWVsZElzUmVhZE9ubHkoZmllbGQpKSB7XG4gICAgICBhcnJheUNvbnRyb2wgPSBjb25maWcuY3JlYXRlRWxlbWVudCgnYXJyYXktY29udHJvbCcsIHtmaWVsZDogZmllbGQsIG9uQXBwZW5kOiB0aGlzLm9uQXBwZW5kfSk7XG4gICAgfVxuXG4gICAgdmFyIG51bUl0ZW1zID0gZmllbGQudmFsdWUubGVuZ3RoO1xuICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQnLCB7XG4gICAgICBmaWVsZDogZmllbGQsIHBsYWluOiB0aGlzLnByb3BzLnBsYWluXG4gICAgfSxcbiAgICAgIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3Nlcyl9LFxuICAgICAgICAvLyBjc3MgdHJhbnNpdGlvbnMga25vdyB0byBjYXVzZSBldmVudCBwcm9ibGVtc1xuICAgICAgICBjb25maWcuY3NzVHJhbnNpdGlvbldyYXBwZXIoXG4gICAgICAgICAgZmllbGRzLm1hcChmdW5jdGlvbiAoY2hpbGRGaWVsZCwgaSkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdhcnJheS1pdGVtJywge1xuICAgICAgICAgICAgICBrZXk6IHRoaXMuc3RhdGUubG9va3Vwc1tpXSxcbiAgICAgICAgICAgICAgZmllbGQ6IGNoaWxkRmllbGQsXG4gICAgICAgICAgICAgIGluZGV4OiBpLFxuICAgICAgICAgICAgICBudW1JdGVtczogbnVtSXRlbXMsXG4gICAgICAgICAgICAgIG9uTW92ZTogdGhpcy5vbk1vdmUsXG4gICAgICAgICAgICAgIG9uUmVtb3ZlOiB0aGlzLm9uUmVtb3ZlLFxuICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgICAgICAgICAgb25BY3Rpb246IHRoaXMub25CdWJibGVBY3Rpb25cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgKSxcbiAgICAgICAgYXJyYXlDb250cm9sXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG4iLCIvLyAjIGJvb2xlYW4gY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgYSBkcm9wZG93biB0byBoYW5kbGUgeWVzL25vIGJvb2xlYW4gdmFsdWVzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdCb29sZWFuJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChuZXdWYWx1ZSkge1xuICAgIHRoaXMub25DaGFuZ2VWYWx1ZShuZXdWYWx1ZSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgdmFyIGNob2ljZXMgPSBjb25maWcuZmllbGRCb29sZWFuQ2hvaWNlcyhmaWVsZCk7XG5cbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywge1xuICAgICAgZmllbGQ6IGZpZWxkLCBwbGFpbjogdGhpcy5wcm9wcy5wbGFpblxuICAgIH0sIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdzZWxlY3QtdmFsdWUnLCB7XG4gICAgICBjaG9pY2VzOiBjaG9pY2VzLCBmaWVsZDogZmllbGQsIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLCBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvblxuICAgIH0pKTtcbiAgfVxufSk7XG4iLCIvLyAjIGNoZWNrYm94LWFycmF5IGNvbXBvbmVudFxuXG4vKlxuVXNlZCB3aXRoIGFycmF5IHZhbHVlcyB0byBzdXBwbHkgbXVsdGlwbGUgY2hlY2tib3hlcyBmb3IgYWRkaW5nIG11bHRpcGxlXG5lbnVtZXJhdGVkIHZhbHVlcyB0byBhbiBhcnJheS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIF8gPSByZXF1aXJlKCcuLi8uLi91bmRhc2gnKTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdDaGVja2JveEFycmF5JyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNob2ljZXM6IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkQ2hvaWNlcyh0aGlzLnByb3BzLmZpZWxkKVxuICAgIH07XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gKG5ld1Byb3BzKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjaG9pY2VzOiBuZXdQcm9wcy5jb25maWcuZmllbGRDaG9pY2VzKG5ld1Byb3BzLmZpZWxkKVxuICAgIH0pO1xuICB9LFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAoKSB7XG4gICAgLy8gR2V0IGFsbCB0aGUgY2hlY2tlZCBjaGVja2JveGVzIGFuZCBjb252ZXJ0IHRvIGFuIGFycmF5IG9mIHZhbHVlcy5cbiAgICB2YXIgY2hvaWNlTm9kZXMgPSB0aGlzLnJlZnMuY2hvaWNlcy5nZXRET01Ob2RlKCkuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2lucHV0Jyk7XG4gICAgY2hvaWNlTm9kZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChjaG9pY2VOb2RlcywgMCk7XG4gICAgdmFyIHZhbHVlcyA9IGNob2ljZU5vZGVzLm1hcChmdW5jdGlvbiAobm9kZSkge1xuICAgICAgcmV0dXJuIG5vZGUuY2hlY2tlZCA/IG5vZGUudmFsdWUgOiBudWxsO1xuICAgIH0pLmZpbHRlcihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9KTtcbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUodmFsdWVzKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICB2YXIgY2hvaWNlcyA9IHRoaXMuc3RhdGUuY2hvaWNlcyB8fCBbXTtcblxuICAgIHZhciBpc0lubGluZSA9ICFfLmZpbmQoY2hvaWNlcywgZnVuY3Rpb24gKGNob2ljZSkge1xuICAgICAgcmV0dXJuIGNob2ljZS5zYW1wbGU7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywge1xuICAgICAgZmllbGQ6IGZpZWxkXG4gICAgfSxcbiAgICAgIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcyksIHJlZjogJ2Nob2ljZXMnfSxcbiAgICAgICAgY2hvaWNlcy5tYXAoZnVuY3Rpb24gKGNob2ljZSwgaSkge1xuXG4gICAgICAgICAgdmFyIGlucHV0RmllbGQgPSBSLnNwYW4oe3N0eWxlOiB7d2hpdGVTcGFjZTogJ25vd3JhcCd9fSxcbiAgICAgICAgICAgIFIuaW5wdXQoe1xuICAgICAgICAgICAgICBuYW1lOiBmaWVsZC5rZXksXG4gICAgICAgICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgICAgICAgIHZhbHVlOiBjaG9pY2UudmFsdWUsXG4gICAgICAgICAgICAgIGNoZWNrZWQ6IGZpZWxkLnZhbHVlLmluZGV4T2YoY2hvaWNlLnZhbHVlKSA+PSAwID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgICAgICAgICAgb25Gb2N1czogdGhpcy5vbkZvY3VzQWN0aW9uLFxuICAgICAgICAgICAgICBvbkJsdXI6IHRoaXMub25CbHVyQWN0aW9uLFxuICAgICAgICAgICAgICBkaXNhYmxlZDogdGhpcy5pc1JlYWRPbmx5KClcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgJyAnLFxuICAgICAgICAgICAgUi5zcGFuKHtjbGFzc05hbWU6ICdmaWVsZC1jaG9pY2UtbGFiZWwnfSxcbiAgICAgICAgICAgICAgY2hvaWNlLmxhYmVsXG4gICAgICAgICAgICApXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIGlmIChpc0lubGluZSkge1xuICAgICAgICAgICAgcmV0dXJuIFIuc3Bhbih7a2V5OiBpLCBjbGFzc05hbWU6ICdmaWVsZC1jaG9pY2UnfSxcbiAgICAgICAgICAgICAgaW5wdXRGaWVsZCwgJyAnXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gUi5kaXYoe2tleTogaSwgY2xhc3NOYW1lOiAnZmllbGQtY2hvaWNlJ30sXG4gICAgICAgICAgICAgIGlucHV0RmllbGQsICcgJyxcbiAgICAgICAgICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ3NhbXBsZScsIHtmaWVsZDogZmllbGQsIGNob2ljZTogY2hvaWNlfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG4iLCIvLyAjIGNoZWNrYm94LWJvb2xlYW4gY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgYSBmaWVsZCB0aGF0IGNhbiBlZGl0IGEgYm9vbGVhbiB3aXRoIGEgY2hlY2tib3guXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnQ2hlY2tib3hCb29sZWFuJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHRoaXMub25DaGFuZ2VWYWx1ZShldmVudC50YXJnZXQuY2hlY2tlZCk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHtcbiAgICAgIGNvbmZpZzogY29uZmlnLCBmaWVsZDogZmllbGQsIHBsYWluOiB0cnVlXG4gICAgfSxcbiAgICBSLnNwYW4oe3N0eWxlOiB7d2hpdGVTcGFjZTogJ25vd3JhcCd9fSxcbiAgICAgIFIuaW5wdXQoe1xuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICBjaGVja2VkOiBmaWVsZC52YWx1ZSxcbiAgICAgICAgY2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpLFxuICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgICAgb25Gb2N1czogdGhpcy5vbkZvY3VzQWN0aW9uLFxuICAgICAgICBvbkJsdXI6IHRoaXMub25CbHVyQWN0aW9uLFxuICAgICAgICBkaXNhYmxlZDogdGhpcy5pc1JlYWRPbmx5KClcbiAgICAgIH0pLFxuICAgICAgUi5zcGFuKHt9LCAnICcpLFxuICAgICAgUi5zcGFuKHt9LCBjb25maWcuZmllbGRIZWxwVGV4dChmaWVsZCkgfHwgY29uZmlnLmZpZWxkTGFiZWwoZmllbGQpKVxuICAgICkpO1xuICB9XG59KTtcbiIsIid1c2Ugc3RyaWN0Jztcbi8qIGdsb2JhbCBDb2RlTWlycm9yICovXG4vKmVzbGludCBuby1zY3JpcHQtdXJsOjAgKi9cblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgXyA9IHJlcXVpcmUoJy4uLy4uL3VuZGFzaCcpO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG4vKlxuICBBIHZlcnkgdHJpbW1lZCBkb3duIGZpZWxkIHRoYXQgdXNlcyBDb2RlTWlycm9yIGZvciBzeW50YXggaGlnaGxpZ2h0aW5nICpvbmx5Ki5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiAnQ29kZScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmNyZWF0ZUNvZGVNaXJyb3JFZGl0b3IoKTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5yZW1vdmVDb2RlTWlycm9yRWRpdG9yKCk7XG4gIH0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmFsdWU6IHRoaXMucHJvcHMuZmllbGQudmFsdWVcbiAgICB9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uKG5leHRQcm9wcykge1xuICAgIHRoaXMuc2V0U3RhdGUoe3ZhbHVlOiBuZXh0UHJvcHMuZmllbGQudmFsdWV9KTtcbiAgfSxcblxuICB0YWJJbmRleDogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmlzUmVhZE9ubHkoKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnByb3BzLmZpZWxkLnRhYkluZGV4O1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcbiAgICB2YXIgcHJvcHMgPSB7IGZpZWxkOiBmaWVsZCwgcGxhaW46IHRoaXMucHJvcHMucGxhaW4gfTtcblxuICAgIHZhciB0ZXh0Qm94Q2xhc3NlcyA9IGN4KF8uZXh0ZW5kKHt9LCB0aGlzLnByb3BzLmNsYXNzZXMsIHsncHJldHR5LXRleHQtYm94JzogdHJ1ZX0pKTtcblxuICAgIC8vIFJlbmRlciByZWFkLW9ubHkgdmVyc2lvbi5cbiAgICB2YXIgZWxlbWVudCA9IChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPSdwcmV0dHktdGV4dC13cmFwcGVyJz5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e3RleHRCb3hDbGFzc2VzfSB0YWJJbmRleD17dGhpcy50YWJJbmRleCgpfSBvbkZvY3VzPXt0aGlzLm9uRm9jdXNBY3Rpb259IG9uQmx1cj17dGhpcy5vbkJsdXJBY3Rpb259PlxuICAgICAgICAgIDxkaXYgcmVmPSd0ZXh0Qm94JyBjbGFzc05hbWU9J2ludGVybmFsLXRleHQtd3JhcHBlcicgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHByb3BzLCBlbGVtZW50KTtcbiAgfSxcblxuICBjcmVhdGVDb2RlTWlycm9yRWRpdG9yOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG4gICAgdmFyIHJlYWRPbmx5ID0gY29uZmlnLmZpZWxkSXNSZWFkT25seShmaWVsZCk7XG5cbiAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgIGxpbmVXcmFwcGluZzogdHJ1ZSxcbiAgICAgIHRhYmluZGV4OiB0aGlzLnRhYkluZGV4KCksXG4gICAgICB2YWx1ZTogU3RyaW5nKHRoaXMuc3RhdGUudmFsdWUpLFxuICAgICAgbW9kZTogdGhpcy5wcm9wcy5maWVsZC5sYW5ndWFnZSB8fCBudWxsLFxuICAgICAgcmVhZE9ubHk6IHJlYWRPbmx5ID8gJ25vY3Vyc29yJyA6IGZhbHNlIC8vICdub2N1cnNvcicgbWVhbnMgcmVhZCBvbmx5IGFuZCBub3QgZm9jdXNhYmxlXG4gICAgfTtcblxuICAgIGlmICh0aGlzLnByb3BzLmZpZWxkLmNvZGVNaXJyb3JPcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gXy5leHRlbmQoe30sIG9wdGlvbnMsIHRoaXMucHJvcHMuZmllbGQuY29kZU1pcnJvck9wdGlvbnMpO1xuICAgIH1cblxuICAgIHZhciB0ZXh0Qm94ID0gdGhpcy5yZWZzLnRleHRCb3guZ2V0RE9NTm9kZSgpO1xuICAgIHRoaXMuY29kZU1pcnJvciA9IENvZGVNaXJyb3IodGV4dEJveCwgb3B0aW9ucyk7XG4gICAgdGhpcy5jb2RlTWlycm9yLm9uKCdjaGFuZ2UnLCB0aGlzLm9uQ29kZU1pcnJvckNoYW5nZSk7XG4gIH0sXG5cbiAgcmVtb3ZlQ29kZU1pcnJvckVkaXRvcjogZnVuY3Rpb24gKCkge1xuICAgIHZhciB0ZXh0Qm94Tm9kZSA9IHRoaXMucmVmcy50ZXh0Qm94LmdldERPTU5vZGUoKTtcbiAgICB2YXIgY21Ob2RlID0gdGV4dEJveE5vZGUuZmlyc3RDaGlsZDtcbiAgICB0ZXh0Qm94Tm9kZS5yZW1vdmVDaGlsZChjbU5vZGUpO1xuICAgIHRoaXMuY29kZU1pcnJvciA9IG51bGw7XG4gIH0sXG5cbiAgb25Db2RlTWlycm9yQ2hhbmdlOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMudXBkYXRpbmdDb2RlTWlycm9yKSB7XG4gICAgICAvLyBhdm9pZCByZWN1cnNpdmUgdXBkYXRlIGN5Y2xlLCBhbmQgbWFyayB0aGUgY29kZSBtaXJyb3IgbWFudWFsIHVwZGF0ZSBhcyBkb25lXG4gICAgICB0aGlzLnVwZGF0aW5nQ29kZU1pcnJvciA9IGZhbHNlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBuZXdWYWx1ZSA9IHRoaXMuY29kZU1pcnJvci5nZXRWYWx1ZSgpO1xuICAgIHRoaXMub25DaGFuZ2VWYWx1ZShuZXdWYWx1ZSk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7dmFsdWU6IG5ld1ZhbHVlfSk7XG4gIH1cblxufSk7XG4iLCIvLyAjIGNvcHkgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgbm9uLWVkaXRhYmxlIGh0bWwvdGV4dCAodGhpbmsgYXJ0aWNsZSBjb3B5KS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdDb3B5JyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpLCBkYW5nZXJvdXNseVNldElubmVySFRNTDoge1xuICAgICAgX19odG1sOiB0aGlzLnByb3BzLmNvbmZpZy5maWVsZEhlbHBUZXh0KHRoaXMucHJvcHMuZmllbGQpXG4gICAgfX0pO1xuICB9XG59KTtcbiIsIi8vICMgZmllbGRzIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIGEgZmllbGQgdG8gZWRpdCB0aGUgdmFsdWVzIG9mIGFuIG9iamVjdCB3aXRoIHN0YXRpYyBwcm9wZXJ0aWVzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIF8gPSByZXF1aXJlKCcuLi8uLi91bmRhc2gnKTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdGaWVsZHMnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICBvbkNoYW5nZUZpZWxkOiBmdW5jdGlvbiAoa2V5LCBuZXdWYWx1ZSwgaW5mbykge1xuICAgIGlmICgha2V5KSB7XG4gICAgICBjb25zdCBwYXJlbnRQYXRoID0gdGhpcy5wcm9wcy5jb25maWcuZmllbGRWYWx1ZVBhdGgodGhpcy5wcm9wcy5maWVsZCk7XG4gICAgICBjb25zdCBjaGlsZFBhdGggPSB0aGlzLnByb3BzLmNvbmZpZy5maWVsZFZhbHVlUGF0aChpbmZvLmZpZWxkKS5zbGljZShwYXJlbnRQYXRoLmxlbmd0aCk7XG4gICAgICBrZXkgPSBjaGlsZFBhdGhbMF07XG4gICAgICBpZiAoa2V5KSB7XG4gICAgICAgIG5ld1ZhbHVlID0gbmV3VmFsdWVba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGtleSkge1xuICAgICAgdmFyIG5ld09iamVjdFZhbHVlID0gXy5leHRlbmQoe30sIHRoaXMucHJvcHMuZmllbGQudmFsdWUpO1xuICAgICAgbmV3T2JqZWN0VmFsdWVba2V5XSA9IG5ld1ZhbHVlO1xuICAgICAgdGhpcy5vbkJ1YmJsZVZhbHVlKG5ld09iamVjdFZhbHVlLCBpbmZvKTtcbiAgICB9XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHZhciBmaWVsZHMgPSBjb25maWcuY3JlYXRlQ2hpbGRGaWVsZHMoZmllbGQpO1xuXG4gICAgLy8gV2FudCB0byBtb3ZlIHRvIGZpZWxkc2V0IHdpdGggbGVnZW5kLCBidXQgZG9pbmcgYSBsaXR0bGUgYmFja3dhcmQtY29tcGF0aWJsZVxuICAgIC8vIGhhY2tpbmcgaGVyZSwgb25seSBjb252ZXJ0aW5nIGNoaWxkIGBmaWVsZHNgIHdpdGhvdXQga2V5cy5cbiAgICB2YXIgaXNHcm91cCA9ICEhKGZpZWxkLnBhcmVudCAmJiAhZmllbGQua2V5KTtcblxuICAgIHZhciBjbGFzc2VzID0gXy5leHRlbmQoe30sIHRoaXMucHJvcHMuY2xhc3Nlcyk7XG5cbiAgICBpZiAoaXNHcm91cCkge1xuICAgICAgY2xhc3Nlc1snY2hpbGQtZmllbGRzLWdyb3VwJ10gPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQnLCB7XG4gICAgICBjb25maWc6IGNvbmZpZywgZmllbGQ6IGZpZWxkLCBwbGFpbjogaXNHcm91cCB8fCB0aGlzLnByb3BzLnBsYWluXG4gICAgfSxcbiAgICAgIFIuZmllbGRzZXQoe2NsYXNzTmFtZTogY3goY2xhc3Nlcyl9LFxuICAgICAgICBpc0dyb3VwID8gPGxlZ2VuZD57Y29uZmlnLmZpZWxkTGFiZWwoZmllbGQpfTwvbGVnZW5kPiA6IG51bGwsXG4gICAgICAgIGZpZWxkcy5tYXAoZnVuY3Rpb24gKGNoaWxkRmllbGQsIGkpIHtcbiAgICAgICAgICB2YXIga2V5ID0gY2hpbGRGaWVsZC5rZXkgfHwgaTtcbiAgICAgICAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUZpZWxkRWxlbWVudCh7XG4gICAgICAgICAgICBrZXk6IGtleSB8fCBpLFxuICAgICAgICAgICAgZmllbGQ6IGNoaWxkRmllbGQsXG4gICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZUZpZWxkLmJpbmQodGhpcywgY2hpbGRGaWVsZC5rZXkpLCBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvblxuICAgICAgICAgIH0pO1xuICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICApXG4gICAgKTtcbiAgfVxuXG59KTtcbiIsIi8vICMgZmllbGRzIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIGEgZmllbGRzIGluIGdyb3Vwcy4gR3JvdXBlZCBieSBmaWVsZC5ncm91cEtleSBwcm9wZXJ0eS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgXyA9IHJlcXVpcmUoJy4uLy4uL3VuZGFzaCcpO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG52YXIgZ3JvdXBGaWVsZHMgPSBmdW5jdGlvbiAoZmllbGRzLCBodW1hbml6ZSkge1xuICB2YXIgZ3JvdXBlZEZpZWxkcyA9IFtdO1xuXG4gIGZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIGlmIChmaWVsZC5ncm91cEtleSkge1xuICAgICAgdmFyIGdyb3VwID0gXy5maW5kKGdyb3VwZWRGaWVsZHMsIGZ1bmN0aW9uIChnKSB7XG4gICAgICAgIHJldHVybiBnLmlzR3JvdXAgJiYgZmllbGQuZ3JvdXBLZXkgPT09IGcua2V5O1xuICAgICAgfSk7XG5cbiAgICAgIGlmICghZ3JvdXApIHtcbiAgICAgICAgZ3JvdXAgPSB7XG4gICAgICAgICAga2V5OiBmaWVsZC5ncm91cEtleSxcbiAgICAgICAgICBsYWJlbDogZmllbGQuZ3JvdXBMYWJlbCB8fCBodW1hbml6ZShmaWVsZC5ncm91cEtleSksXG4gICAgICAgICAgY2hpbGRyZW46IFtdLFxuICAgICAgICAgIGlzR3JvdXA6IHRydWVcbiAgICAgICAgfTtcbiAgICAgICAgZ3JvdXBlZEZpZWxkcy5wdXNoKGdyb3VwKTtcbiAgICAgIH1cblxuICAgICAgZ3JvdXAuY2hpbGRyZW4ucHVzaChmaWVsZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGdyb3VwZWRGaWVsZHMucHVzaChmaWVsZCk7IC8vIHRvcCBsZXZlbCBmaWVsZFxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIGdyb3VwZWRGaWVsZHM7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0dyb3VwZWRGaWVsZHMnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICBvbkNoYW5nZUZpZWxkOiBmdW5jdGlvbiAoa2V5LCBuZXdWYWx1ZSwgaW5mbykge1xuICAgIGlmIChrZXkpIHtcbiAgICAgIHZhciBuZXdPYmplY3RWYWx1ZSA9IF8uZXh0ZW5kKHt9LCB0aGlzLnByb3BzLmZpZWxkLnZhbHVlKTtcbiAgICAgIG5ld09iamVjdFZhbHVlW2tleV0gPSBuZXdWYWx1ZTtcbiAgICAgIHRoaXMub25CdWJibGVWYWx1ZShuZXdPYmplY3RWYWx1ZSwgaW5mbyk7XG4gICAgfVxuICB9LFxuXG4gIHJlbmRlckZpZWxkczogZnVuY3Rpb24gKGZpZWxkcywgZ3JvdXBLZXksIGdyb3VwTGFiZWwpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIGNoaWxkRmllbGRzID0gZmllbGRzLm1hcChmdW5jdGlvbiAoZmllbGRPckdyb3VwKSB7XG4gICAgICBpZiAoZmllbGRPckdyb3VwLmlzR3JvdXApIHtcbiAgICAgICAgcmV0dXJuIHNlbGYucmVuZGVyRmllbGRzKGZpZWxkT3JHcm91cC5jaGlsZHJlbiwgZmllbGRPckdyb3VwLmtleSwgZmllbGRPckdyb3VwLmxhYmVsKTtcbiAgICAgIH1cblxuICAgICAgdmFyIGtleSA9IGZpZWxkT3JHcm91cC5rZXk7XG4gICAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUZpZWxkRWxlbWVudCh7XG4gICAgICAgIGtleToga2V5LFxuICAgICAgICBmaWVsZDogZmllbGRPckdyb3VwLFxuICAgICAgICBvbkNoYW5nZTogc2VsZi5vbkNoYW5nZUZpZWxkLmJpbmQoc2VsZiwga2V5KSxcbiAgICAgICAgb25BY3Rpb246IHNlbGYub25CdWJibGVBY3Rpb25cbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgdmFyIGxlZ2VuZDtcbiAgICB2YXIgY2xhc3NOYW1lID0gY3godGhpcy5wcm9wcy5jbGFzc2VzKTtcblxuICAgIGlmIChncm91cExhYmVsKSB7XG4gICAgICBsZWdlbmQgPSA8bGVnZW5kPntncm91cExhYmVsfTwvbGVnZW5kPjtcbiAgICAgIGNsYXNzTmFtZSArPSAnIGNoaWxkLWZpZWxkcy1ncm91cCc7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxmaWVsZHNldCBrZXk9e2dyb3VwS2V5fSBjbGFzc05hbWU9e2NsYXNzTmFtZX0+XG4gICAgICAgIHtsZWdlbmR9XG4gICAgICAgIHtjaGlsZEZpZWxkc31cbiAgICAgIDwvZmllbGRzZXQ+XG4gICAgKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgdmFyIGZpZWxkcyA9IGdyb3VwRmllbGRzKGNvbmZpZy5jcmVhdGVDaGlsZEZpZWxkcyhmaWVsZCksIGNvbmZpZy5odW1hbml6ZSk7XG5cbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywge1xuICAgICAgY29uZmlnOiBjb25maWcsIGZpZWxkOiBmaWVsZCwgcGxhaW46IHRoaXMucHJvcHMucGxhaW5cbiAgICB9LCB0aGlzLnJlbmRlckZpZWxkcyhmaWVsZHMpKTtcbiAgfVxuXG59KTtcbiIsIi8vICMganNvbiBjb21wb25lbnRcblxuLypcblRleHRhcmVhIGVkaXRvciBmb3IgSlNPTi4gV2lsbCB2YWxpZGF0ZSB0aGUgSlNPTiBiZWZvcmUgc2V0dGluZyB0aGUgdmFsdWUsIHNvXG53aGlsZSB0aGUgdmFsdWUgaXMgaW52YWxpZCwgbm8gZXh0ZXJuYWwgc3RhdGUgY2hhbmdlcyB3aWxsIG9jY3VyLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnSnNvbicsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICByb3dzOiA1XG4gICAgfTtcbiAgfSxcblxuICBpc1ZhbGlkVmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuXG4gICAgdHJ5IHtcbiAgICAgIEpTT04ucGFyc2UodmFsdWUpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaXNWYWxpZDogdHJ1ZSxcbiAgICAgIHZhbHVlOiBKU09OLnN0cmluZ2lmeSh0aGlzLnByb3BzLmZpZWxkLnZhbHVlLCBudWxsLCAyKVxuICAgIH07XG4gIH0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHZhciBpc1ZhbGlkID0gdGhpcy5pc1ZhbGlkVmFsdWUoZXZlbnQudGFyZ2V0LnZhbHVlKTtcblxuICAgIGlmIChpc1ZhbGlkKSB7XG4gICAgICAvLyBOZWVkIHRvIGhhbmRsZSB0aGlzIGJldHRlci4gTmVlZCB0byB0cmFjayBwb3NpdGlvbi5cbiAgICAgIHRoaXMuX2lzQ2hhbmdpbmcgPSB0cnVlO1xuICAgICAgdGhpcy5vbkNoYW5nZVZhbHVlKEpTT04ucGFyc2UoZXZlbnQudGFyZ2V0LnZhbHVlKSk7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBpc1ZhbGlkOiBpc1ZhbGlkLFxuICAgICAgdmFsdWU6IGV2ZW50LnRhcmdldC52YWx1ZVxuICAgIH0pO1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXh0UHJvcHMpIHtcbiAgICBpZiAoIXRoaXMuX2lzQ2hhbmdpbmcpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBpc1ZhbGlkOiB0cnVlLFxuICAgICAgICB2YWx1ZTogSlNPTi5zdHJpbmdpZnkobmV4dFByb3BzLmZpZWxkLnZhbHVlLCBudWxsLCAyKVxuICAgICAgfSk7XG4gICAgfVxuICAgIHRoaXMuX2lzQ2hhbmdpbmcgPSBmYWxzZTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHtcbiAgICAgIGZpZWxkOiBjb25maWcuZmllbGRXaXRoVmFsdWUoZmllbGQsIHRoaXMuc3RhdGUudmFsdWUpLCBwbGFpbjogdGhpcy5wcm9wcy5wbGFpblxuICAgIH0sIFIudGV4dGFyZWEoe1xuICAgICAgICBjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcyksXG4gICAgICAgIHZhbHVlOiB0aGlzLnN0YXRlLnZhbHVlLFxuICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgICAgc3R5bGU6IHtiYWNrZ3JvdW5kQ29sb3I6IHRoaXMuc3RhdGUuaXNWYWxpZCA/ICcnIDogJ3JnYigyNTUsMjAwLDIwMCknfSxcbiAgICAgICAgcm93czogY29uZmlnLmZpZWxkUm93cyhmaWVsZCkgfHwgdGhpcy5wcm9wcy5yb3dzLFxuICAgICAgICBvbkZvY3VzOiB0aGlzLm9uRm9jdXNBY3Rpb24sXG4gICAgICAgIG9uQmx1cjogdGhpcy5vbkJsdXJBY3Rpb24sXG4gICAgICAgIGRpc2FibGVkOiB0aGlzLmlzUmVhZE9ubHkoKVxuICAgICAgfSlcbiAgICApO1xuICB9XG59KTtcbiIsIi8vICMgb2JqZWN0IGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIGEgZmllbGQgdG8gZWRpdCBhbiBvYmplY3Qgd2l0aCBkeW5hbWljIGNoaWxkIGZpZWxkcy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBfID0gcmVxdWlyZSgnLi4vLi4vdW5kYXNoJyk7XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbnZhciB0ZW1wS2V5UHJlZml4ID0gJyQkX190ZW1wX18nO1xuXG52YXIgdGVtcEtleSA9IGZ1bmN0aW9uIChpZCkge1xuICByZXR1cm4gdGVtcEtleVByZWZpeCArIGlkO1xufTtcblxudmFyIGlzVGVtcEtleSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgcmV0dXJuIGtleS5zdWJzdHJpbmcoMCwgdGVtcEtleVByZWZpeC5sZW5ndGgpID09PSB0ZW1wS2V5UHJlZml4O1xufTtcblxuLy8gVE9ETzoga2VlcCBpbnZhbGlkIGtleXMgYXMgc3RhdGUgYW5kIGRvbid0IHNlbmQgaW4gb25DaGFuZ2U7IGNsb25lIGNvbnRleHRcbi8vIGFuZCB1c2UgY2xvbmUgdG8gY3JlYXRlIGNoaWxkIGNvbnRleHRzXG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnT2JqZWN0JyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgbmV4dExvb2t1cElkOiAwLFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGtleVRvSWQgPSB7fTtcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHRoaXMucHJvcHMuZmllbGQudmFsdWUpO1xuICAgIHZhciBrZXlPcmRlciA9IFtdO1xuICAgIC8vIFRlbXAga2V5cyBrZWVwcyB0aGUga2V5IHRvIGRpc3BsYXksIHdoaWNoIHNvbWV0aW1lcyBtYXkgYmUgZGlmZmVyZW50XG4gICAgLy8gdGhhbiB0aGUgYWN0dWFsIGtleS4gRm9yIGV4YW1wbGUsIGR1cGxpY2F0ZSBrZXlzIGFyZSBub3QgYWxsb3dlZCxcbiAgICAvLyBidXQgd2UgbWF5IHRlbXBvcmFyaWx5IHNob3cgZHVwbGljYXRlIGtleXMuXG4gICAgdmFyIHRlbXBEaXNwbGF5S2V5cyA9IHt9O1xuXG4gICAgLy8gS2V5cyBkb24ndCBtYWtlIGdvb2QgcmVhY3Qga2V5cywgc2luY2Ugd2UncmUgYWxsb3dpbmcgdGhlbSB0byBiZVxuICAgIC8vIGNoYW5nZWQgaGVyZSwgc28gd2UnbGwgaGF2ZSB0byBjcmVhdGUgZmFrZSBrZXlzIGFuZFxuICAgIC8vIGtlZXAgdHJhY2sgb2YgdGhlIG1hcHBpbmcgb2YgcmVhbCBrZXlzIHRvIGZha2Uga2V5cy4gWXVjay5cbiAgICBrZXlzLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgdmFyIGlkID0gKyt0aGlzLm5leHRMb29rdXBJZDtcbiAgICAgIC8vIE1hcCB0aGUgcmVhbCBrZXkgdG8gdGhlIGlkLlxuICAgICAga2V5VG9JZFtrZXldID0gaWQ7XG4gICAgICAvLyBLZWVwIHRoZSBvcmRlcmluZyBvZiB0aGUga2V5cyBzbyB3ZSBkb24ndCBzaHVmZmxlIHRoaW5ncyBhcm91bmQgbGF0ZXIuXG4gICAgICBrZXlPcmRlci5wdXNoKGtleSk7XG4gICAgICAvLyBJZiB0aGlzIGlzIGEgdGVtcG9yYXJ5IGtleSB0aGF0IHdhcyBwZXJzaXN0ZWQsIGJlc3Qgd2UgY2FuIGRvIGlzIGRpc3BsYXlcbiAgICAgIC8vIGEgYmxhbmsuXG4gICAgICAvLyBUT0RPOiBQcm9iYWJseSBqdXN0IG5vdCBzZW5kIHRlbXBvcmFyeSBrZXlzIGJhY2sgdGhyb3VnaC4gVGhpcyBiZWhhdmlvclxuICAgICAgLy8gaXMgYWN0dWFsbHkgbGVmdG92ZXIgZnJvbSBhbiBlYXJsaWVyIGluY2FybmF0aW9uIG9mIGZvcm1hdGljIHdoZXJlXG4gICAgICAvLyB2YWx1ZXMgaGFkIHRvIGdvIGJhY2sgdG8gdGhlIHJvb3QuXG4gICAgICBpZiAoaXNUZW1wS2V5KGtleSkpIHtcbiAgICAgICAgdGVtcERpc3BsYXlLZXlzW2lkXSA9ICcnO1xuICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAga2V5VG9JZDoga2V5VG9JZCxcbiAgICAgIGtleU9yZGVyOiBrZXlPcmRlcixcbiAgICAgIC8vIFRlbXAga2V5cyBrZWVwcyB0aGUga2V5IHRvIGRpc3BsYXksIHdoaWNoIHNvbWV0aW1lcyBtYXkgYmUgZGlmZmVyZW50XG4gICAgICAvLyB0aGFuIHRoZSBhY3R1YWwga2V5LiBGb3IgZXhhbXBsZSwgZHVwbGljYXRlIGtleXMgYXJlIG5vdCBhbGxvd2VkLFxuICAgICAgLy8gYnV0IHdlIG1heSB0ZW1wb3JhcmlseSBzaG93IGR1cGxpY2F0ZSBrZXlzLlxuICAgICAgdGVtcERpc3BsYXlLZXlzOiB0ZW1wRGlzcGxheUtleXNcbiAgICB9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXdQcm9wcykge1xuXG4gICAgdmFyIGtleVRvSWQgPSB0aGlzLnN0YXRlLmtleVRvSWQ7XG4gICAgdmFyIG5ld0tleVRvSWQgPSB7fTtcbiAgICB2YXIgdGVtcERpc3BsYXlLZXlzID0gdGhpcy5zdGF0ZS50ZW1wRGlzcGxheUtleXM7XG4gICAgdmFyIG5ld1RlbXBEaXNwbGF5S2V5cyA9IHt9O1xuICAgIHZhciBrZXlPcmRlciA9IHRoaXMuc3RhdGUua2V5T3JkZXI7XG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhuZXdQcm9wcy5maWVsZC52YWx1ZSk7XG4gICAgdmFyIGFkZGVkS2V5cyA9IFtdO1xuXG4gICAgLy8gTG9vayBhdCB0aGUgbmV3IGtleXMuXG4gICAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIC8vIEFkZCBuZXcgbG9va3VwIGlmIHRoaXMga2V5IHdhc24ndCBoZXJlIGxhc3QgdGltZS5cbiAgICAgIGlmICgha2V5VG9JZFtrZXldKSB7XG4gICAgICAgIHRoaXMubmV4dExvb2t1cElkKys7XG4gICAgICAgIG5ld0tleVRvSWRba2V5XSA9IHRoaXMubmV4dExvb2t1cElkO1xuICAgICAgICBhZGRlZEtleXMucHVzaChrZXkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3S2V5VG9JZFtrZXldID0ga2V5VG9JZFtrZXldO1xuICAgICAgfVxuICAgICAgaWYgKGlzVGVtcEtleShrZXkpICYmIG5ld0tleVRvSWRba2V5XSBpbiB0ZW1wRGlzcGxheUtleXMpIHtcbiAgICAgICAgbmV3VGVtcERpc3BsYXlLZXlzW25ld0tleVRvSWRba2V5XV0gPSB0ZW1wRGlzcGxheUtleXNbbmV3S2V5VG9JZFtrZXldXTtcbiAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgdmFyIG5ld0tleU9yZGVyID0gW107XG5cbiAgICAvLyBMb29rIGF0IHRoZSBvbGQga2V5cy5cbiAgICBrZXlPcmRlci5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIC8vIElmIHRoZSBrZXkgaXMgaW4gdGhlIG5ldyBrZXlzLCBwdXNoIGl0IG9udG8gdGhlIG9yZGVyIHRvIHJldGFpbiB0aGVcbiAgICAgIC8vIHNhbWUgb3JkZXIuXG4gICAgICBpZiAobmV3S2V5VG9JZFtrZXldKSB7XG4gICAgICAgIG5ld0tleU9yZGVyLnB1c2goa2V5KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFB1dCBhZGRlZCBmaWVsZHMgYXQgdGhlIGVuZC4gKFNvIHRoaW5ncyBkb24ndCBnZXQgc2h1ZmZsZWQuKVxuICAgIG5ld0tleU9yZGVyID0gbmV3S2V5T3JkZXIuY29uY2F0KGFkZGVkS2V5cyk7XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGtleVRvSWQ6IG5ld0tleVRvSWQsXG4gICAgICBrZXlPcmRlcjogbmV3S2V5T3JkZXIsXG4gICAgICB0ZW1wRGlzcGxheUtleXM6IG5ld1RlbXBEaXNwbGF5S2V5c1xuICAgIH0pO1xuICB9LFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAoa2V5LCBuZXdWYWx1ZSwgaW5mbykge1xuICAgIHZhciBuZXdPYmogPSBfLmV4dGVuZCh7fSwgdGhpcy5wcm9wcy5maWVsZC52YWx1ZSk7XG4gICAgbmV3T2JqW2tleV0gPSBuZXdWYWx1ZTtcbiAgICB0aGlzLm9uQnViYmxlVmFsdWUobmV3T2JqLCBpbmZvKTtcbiAgfSxcblxuICBvbkFwcGVuZDogZnVuY3Rpb24gKGl0ZW1DaG9pY2VJbmRleCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuICAgIHRoaXMubmV4dExvb2t1cElkKys7XG5cbiAgICB2YXIga2V5VG9JZCA9IHRoaXMuc3RhdGUua2V5VG9JZDtcbiAgICB2YXIga2V5T3JkZXIgPSB0aGlzLnN0YXRlLmtleU9yZGVyO1xuICAgIHZhciB0ZW1wRGlzcGxheUtleXMgPSB0aGlzLnN0YXRlLnRlbXBEaXNwbGF5S2V5cztcblxuICAgIHZhciBpZCA9IHRoaXMubmV4dExvb2t1cElkO1xuICAgIHZhciBuZXdLZXkgPSB0ZW1wS2V5KGlkKTtcblxuICAgIGtleVRvSWRbbmV3S2V5XSA9IGlkO1xuICAgIC8vIFRlbXBvcmFyaWx5LCB3ZSdsbCBzaG93IGEgYmxhbmsga2V5LlxuICAgIHRlbXBEaXNwbGF5S2V5c1tpZF0gPSAnJztcbiAgICBrZXlPcmRlci5wdXNoKG5ld0tleSk7XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGtleVRvSWQ6IGtleVRvSWQsXG4gICAgICB0ZW1wRGlzcGxheUtleXM6IHRlbXBEaXNwbGF5S2V5cyxcbiAgICAgIGtleU9yZGVyOiBrZXlPcmRlclxuICAgIH0pO1xuXG4gICAgdmFyIG5ld09iaiA9IF8uZXh0ZW5kKHt9LCB0aGlzLnByb3BzLmZpZWxkLnZhbHVlKTtcblxuICAgIHZhciBuZXdWYWx1ZSA9IGNvbmZpZy5jcmVhdGVOZXdDaGlsZEZpZWxkVmFsdWUoZmllbGQsIGl0ZW1DaG9pY2VJbmRleCk7XG5cbiAgICBuZXdPYmpbbmV3S2V5XSA9IG5ld1ZhbHVlO1xuXG4gICAgdGhpcy5vbkNoYW5nZVZhbHVlKG5ld09iaik7XG4gIH0sXG5cbiAgb25SZW1vdmU6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICB2YXIgbmV3T2JqID0gXy5leHRlbmQoe30sIHRoaXMucHJvcHMuZmllbGQudmFsdWUpO1xuICAgIGRlbGV0ZSBuZXdPYmpba2V5XTtcbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUobmV3T2JqKTtcbiAgfSxcblxuICBvbk1vdmU6IGZ1bmN0aW9uIChmcm9tS2V5LCB0b0tleSkge1xuICAgIGlmIChmcm9tS2V5ICE9PSB0b0tleSkge1xuICAgICAgdmFyIGtleVRvSWQgPSB0aGlzLnN0YXRlLmtleVRvSWQ7XG4gICAgICB2YXIga2V5T3JkZXIgPSB0aGlzLnN0YXRlLmtleU9yZGVyO1xuICAgICAgdmFyIHRlbXBEaXNwbGF5S2V5cyA9IHRoaXMuc3RhdGUudGVtcERpc3BsYXlLZXlzO1xuXG4gICAgICB2YXIgbmV3T2JqID0gXy5leHRlbmQoe30sIHRoaXMucHJvcHMuZmllbGQudmFsdWUpO1xuXG4gICAgICAvLyBJZiB3ZSBhbHJlYWR5IGhhdmUgdGhlIGtleSB3ZSdyZSBtb3ZpbmcgdG8sIHRoZW4gd2UgaGF2ZSB0byBjaGFuZ2UgdGhhdFxuICAgICAgLy8ga2V5IHRvIHNvbWV0aGluZyBlbHNlLlxuICAgICAgaWYgKGtleVRvSWRbdG9LZXldKSB7XG4gICAgICAgIC8vIE1ha2UgYSBuZXdcbiAgICAgICAgdmFyIHRlbXBUb0tleSA9IHRlbXBLZXkoa2V5VG9JZFt0b0tleV0pO1xuICAgICAgICB0ZW1wRGlzcGxheUtleXNba2V5VG9JZFt0b0tleV1dID0gdG9LZXk7XG4gICAgICAgIGtleVRvSWRbdGVtcFRvS2V5XSA9IGtleVRvSWRbdG9LZXldO1xuICAgICAgICBrZXlPcmRlcltrZXlPcmRlci5pbmRleE9mKHRvS2V5KV0gPSB0ZW1wVG9LZXk7XG4gICAgICAgIGRlbGV0ZSBrZXlUb0lkW3RvS2V5XTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAga2V5VG9JZDoga2V5VG9JZCxcbiAgICAgICAgICB0ZW1wRGlzcGxheUtleXM6IHRlbXBEaXNwbGF5S2V5cyxcbiAgICAgICAgICBrZXlPcmRlcjoga2V5T3JkZXJcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbmV3T2JqW3RlbXBUb0tleV0gPSBuZXdPYmpbdG9LZXldO1xuICAgICAgICBkZWxldGUgbmV3T2JqW3RvS2V5XTtcbiAgICAgIH1cblxuICAgICAgaWYgKCF0b0tleSkge1xuICAgICAgICB0b0tleSA9IHRlbXBLZXkoa2V5VG9JZFtmcm9tS2V5XSk7XG4gICAgICAgIHRlbXBEaXNwbGF5S2V5c1trZXlUb0lkW2Zyb21LZXldXSA9ICcnO1xuICAgICAgfVxuICAgICAga2V5VG9JZFt0b0tleV0gPSBrZXlUb0lkW2Zyb21LZXldO1xuICAgICAgZGVsZXRlIGtleVRvSWRbZnJvbUtleV07XG4gICAgICBrZXlPcmRlcltrZXlPcmRlci5pbmRleE9mKGZyb21LZXkpXSA9IHRvS2V5O1xuXG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAga2V5VG9JZDoga2V5VG9JZCxcbiAgICAgICAga2V5T3JkZXI6IGtleU9yZGVyLFxuICAgICAgICB0ZW1wRGlzcGxheUtleXM6IHRlbXBEaXNwbGF5S2V5c1xuICAgICAgfSk7XG5cbiAgICAgIG5ld09ialt0b0tleV0gPSBuZXdPYmpbZnJvbUtleV07XG4gICAgICBkZWxldGUgbmV3T2JqW2Zyb21LZXldO1xuXG4gICAgICB0aGlzLm9uQ2hhbmdlVmFsdWUobmV3T2JqKTtcblxuICAgICAgLy8gQ2hlY2sgaWYgb3VyIGZyb21LZXkgaGFzIG9wZW5lZCB1cCBhIHNwb3QuXG4gICAgICBpZiAoZnJvbUtleSAmJiBmcm9tS2V5ICE9PSB0b0tleSkge1xuICAgICAgICBpZiAoIShmcm9tS2V5IGluIG5ld09iaikpIHtcbiAgICAgICAgICBPYmplY3Qua2V5cyhuZXdPYmopLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgaWYgKCEoaXNUZW1wS2V5KGtleSkpKSB7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBpZCA9IGtleVRvSWRba2V5XTtcbiAgICAgICAgICAgIHZhciBkaXNwbGF5S2V5ID0gdGVtcERpc3BsYXlLZXlzW2lkXTtcbiAgICAgICAgICAgIGlmIChmcm9tS2V5ID09PSBkaXNwbGF5S2V5KSB7XG4gICAgICAgICAgICAgIHRoaXMub25Nb3ZlKGtleSwgZGlzcGxheUtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBnZXRGaWVsZHM6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHZhciBmaWVsZHMgPSBjb25maWcuY3JlYXRlQ2hpbGRGaWVsZHMoZmllbGQpO1xuXG4gICAgdmFyIGtleVRvRmllbGQgPSB7fTtcblxuICAgIF8uZWFjaChmaWVsZHMsIGZ1bmN0aW9uIChjaGlsZEZpZWxkKSB7XG4gICAgICBrZXlUb0ZpZWxkW2NoaWxkRmllbGQua2V5XSA9IGNoaWxkRmllbGQ7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5rZXlPcmRlci5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgcmV0dXJuIGtleVRvRmllbGRba2V5XTtcbiAgICB9KTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICB2YXIgZmllbGRzID0gdGhpcy5nZXRGaWVsZHMoKTtcblxuICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQnLCB7XG4gICAgICBmaWVsZDogZmllbGQsIHBsYWluOiB0aGlzLnByb3BzLnBsYWluXG4gICAgfSxcbiAgICAgIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3Nlcyl9LFxuICAgICAgICBjb25maWcuY3NzVHJhbnNpdGlvbldyYXBwZXIoXG4gICAgICAgICAgZmllbGRzLm1hcChmdW5jdGlvbiAoY2hpbGRGaWVsZCkge1xuICAgICAgICAgICAgdmFyIGRpc3BsYXlLZXkgPSB0aGlzLnN0YXRlLnRlbXBEaXNwbGF5S2V5c1t0aGlzLnN0YXRlLmtleVRvSWRbY2hpbGRGaWVsZC5rZXldXTtcbiAgICAgICAgICAgIGlmIChfLmlzVW5kZWZpbmVkKGRpc3BsYXlLZXkpKSB7XG4gICAgICAgICAgICAgIGRpc3BsYXlLZXkgPSBjaGlsZEZpZWxkLmtleTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnb2JqZWN0LWl0ZW0nLCB7XG4gICAgICAgICAgICAgIGtleTogdGhpcy5zdGF0ZS5rZXlUb0lkW2NoaWxkRmllbGQua2V5XSxcbiAgICAgICAgICAgICAgZmllbGQ6IGNoaWxkRmllbGQsXG4gICAgICAgICAgICAgIG9uTW92ZTogdGhpcy5vbk1vdmUsXG4gICAgICAgICAgICAgIG9uUmVtb3ZlOiB0aGlzLm9uUmVtb3ZlLFxuICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgICAgICAgICAgb25BY3Rpb246IHRoaXMub25CdWJibGVBY3Rpb24sXG4gICAgICAgICAgICAgIGRpc3BsYXlLZXk6IGRpc3BsYXlLZXksXG4gICAgICAgICAgICAgIGl0ZW1LZXk6IGNoaWxkRmllbGQua2V5XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgICksXG4gICAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdvYmplY3QtY29udHJvbCcsIHtmaWVsZDogZmllbGQsIG9uQXBwZW5kOiB0aGlzLm9uQXBwZW5kfSlcbiAgICAgIClcbiAgICApO1xuICB9XG59KTtcbiIsIi8vICMgc2luZ2xlLWxpbmUtc3RyaW5nIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIGEgc2luZ2xlIGxpbmUgdGV4dCBpbnB1dC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdQYXNzd29yZCcsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywge1xuICAgICAgY29uZmlnOiBjb25maWcsIGZpZWxkOiBmaWVsZCwgcGxhaW46IHRoaXMucHJvcHMucGxhaW5cbiAgICB9LCBSLmlucHV0KHtcbiAgICAgIHR5cGU6ICdwYXNzd29yZCcsXG4gICAgICB2YWx1ZTogdGhpcy5wcm9wcy5maWVsZC52YWx1ZSxcbiAgICAgIGNsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSxcbiAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgb25Gb2N1czogdGhpcy5vbkZvY3VzQWN0aW9uLFxuICAgICAgb25CbHVyOiB0aGlzLm9uQmx1ckFjdGlvbixcbiAgICAgIGRpc2FibGVkOiB0aGlzLmlzUmVhZE9ubHkoKVxuICAgIH0pKTtcbiAgfVxufSk7XG4iLCIvLyAjIHByZXR0eSBib29sZWFuIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIHByZXR0eSBib29sZWFuIGNvbXBvbmVudCB3aXRoIG5vbi1uYXRpdmUgZHJvcC1kb3duXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ1ByZXR0eUJvb2xlYW4nLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICBvbkNoYW5nZTogZnVuY3Rpb24gKG5ld1ZhbHVlKSB7XG4gICAgdGhpcy5vbkNoYW5nZVZhbHVlKG5ld1ZhbHVlKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgdmFyIGNob2ljZXMgPSBjb25maWcuZmllbGRCb29sZWFuQ2hvaWNlcyhmaWVsZCk7XG5cbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywge1xuICAgICAgZmllbGQ6IGZpZWxkLCBwbGFpbjogdGhpcy5wcm9wcy5wbGFpblxuICAgIH0sIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdwcmV0dHktc2VsZWN0LXZhbHVlJywge1xuICAgICAgY2hvaWNlczogY2hvaWNlcywgZmllbGQ6IGZpZWxkLCBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSwgb25BY3Rpb246IHRoaXMub25CdWJibGVBY3Rpb25cbiAgICB9KSk7XG4gIH1cbn0pO1xuIiwiLy8gIyBzZWxlY3QgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgc2VsZWN0IGVsZW1lbnQgdG8gZ2l2ZSBhIHVzZXIgY2hvaWNlcyBmb3IgdGhlIHZhbHVlIG9mIGEgZmllbGQuIFJlbmRlcnMgbm9uLW5hdGl2ZVxuc2VsZWN0IGRyb3AgZG93biBhbmQgc3VwcG9ydHMgZmFuY2llciByZW5kZXJpbmdzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdQcmV0dHlTZWxlY3QnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY2hvaWNlczogdGhpcy5wcm9wcy5jb25maWcuZmllbGRQcmV0dHlDaG9pY2VzKHRoaXMucHJvcHMuZmllbGQpXG4gICAgfTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV3UHJvcHMpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGNob2ljZXM6IG5ld1Byb3BzLmNvbmZpZy5maWVsZFByZXR0eUNob2ljZXMobmV3UHJvcHMuZmllbGQpXG4gICAgfSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAodmFsdWUsIGluZm8pIHtcbiAgICBpZiAoaW5mbyAmJiBpbmZvLmlzQ3VzdG9tVmFsdWUpIHtcbiAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UodmFsdWUsIHtcbiAgICAgICAgZmllbGQ6IHRoaXMucHJvcHMuZmllbGQsXG4gICAgICAgIGlzQ3VzdG9tVmFsdWU6IHRydWVcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9uQ2hhbmdlVmFsdWUodmFsdWUpO1xuICAgIH1cbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQnLCB7XG4gICAgICBjb25maWc6IGNvbmZpZywgZmllbGQ6IGZpZWxkLCBwbGFpbjogdGhpcy5wcm9wcy5wbGFpbiwgY2xhc3NlczogdGhpcy5wcm9wcy5jbGFzc2VzXG4gICAgfSwgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ3ByZXR0eS1zZWxlY3QtdmFsdWUnLCB7XG4gICAgICBjaG9pY2VzOiB0aGlzLnN0YXRlLmNob2ljZXMsIGZpZWxkOiBmaWVsZCwgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsIG9uQWN0aW9uOiB0aGlzLm9uQnViYmxlQWN0aW9uXG4gICAgfSkpO1xuICB9XG59KTtcbiIsIid1c2Ugc3RyaWN0Jztcbi8qZXNsaW50IG5vLXNjcmlwdC11cmw6MCAqL1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBfID0gcmVxdWlyZSgnLi4vLi4vdW5kYXNoJyk7XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbi8qXG4gICBXcmFwcyBhIFByZXR0eVRleHRJbnB1dCB0byBiZSBhIHN0YW5kIGFsb25lIGZpZWxkLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ1ByZXR0eVRleHQnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICBmb2N1czogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucmVmcy50ZXh0Qm94LmZvY3VzKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG4gICAgdmFyIHByb3BzID0geyBmaWVsZDogZmllbGQsIHBsYWluOiB0aGlzLnByb3BzLnBsYWluIH07XG5cbiAgICBjb25zdCByZWFkT25seSA9IGNvbmZpZy5maWVsZElzUmVhZE9ubHkoZmllbGQpO1xuXG4gICAgLy8gVGhlIHRhYiBpbmRleCBtYWtlcyB0aGlzIGNvbnRyb2wgZm9jdXNhYmxlIGFuZCBlZGl0YWJsZS4gSWYgcmVhZCBvbmx5LCBubyB0YWJJbmRleFxuICAgIHZhciB0YWJJbmRleCA9IHJlYWRPbmx5ID8gbnVsbCA6IGZpZWxkLnRhYkluZGV4O1xuXG4gICAgdmFyIGVsZW1lbnQgPSBjb25maWcuY3JlYXRlRWxlbWVudCgncHJldHR5LXRleHQtaW5wdXQnLCB7XG4gICAgICBjbGFzc2VzOiB0aGlzLnByb3BzLmNsYXNzZXMsXG4gICAgICB0YWJJbmRleDogdGFiSW5kZXgsXG4gICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZVZhbHVlLFxuICAgICAgb25Gb2N1czogdGhpcy5vbkZvY3VzQWN0aW9uLFxuICAgICAgb25CbHVyOiB0aGlzLm9uQmx1ckFjdGlvbixcbiAgICAgIG9uQWN0aW9uOiB0aGlzLm9uQnViYmxlQWN0aW9uLFxuICAgICAgZmllbGQ6IHRoaXMucHJvcHMuZmllbGQsXG4gICAgICB2YWx1ZTogdGhpcy5wcm9wcy5maWVsZC52YWx1ZSxcbiAgICAgIGlzQWNjb3JkaW9uOiB0aGlzLnByb3BzLmZpZWxkLmlzQWNjb3JkaW9uLFxuICAgICAgc2VsZWN0ZWRDaG9pY2VzOiB0aGlzLnByb3BzLmNvbmZpZy5maWVsZFNlbGVjdGVkUmVwbGFjZUNob2ljZXModGhpcy5wcm9wcy5maWVsZCksXG4gICAgICByZXBsYWNlQ2hvaWNlczogdGhpcy5wcm9wcy5jb25maWcuZmllbGRSZXBsYWNlQ2hvaWNlcyh0aGlzLnByb3BzLmZpZWxkKSxcbiAgICAgIHJlZjogJ3RleHRCb3gnLFxuICAgICAgcmVhZE9ubHk6IHJlYWRPbmx5XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywgcHJvcHMsIGVsZW1lbnQpO1xuICB9XG59KTtcbiIsIi8vICMgc2VsZWN0IGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIHNlbGVjdCBlbGVtZW50IHRvIGdpdmUgYSB1c2VyIGNob2ljZXMgZm9yIHRoZSB2YWx1ZSBvZiBhIGZpZWxkLiBOb3RlXG5pdCBzaG91bGQgc3VwcG9ydCB2YWx1ZXMgb3RoZXIgdGhhbiBzdHJpbmdzLiBDdXJyZW50bHkgdGhpcyBpcyBvbmx5IHRlc3RlZCBmb3JcbmJvb2xlYW4gdmFsdWVzLCBidXQgaXQgX3Nob3VsZF8gd29yayBmb3Igb3RoZXIgdmFsdWVzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdTZWxlY3QnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY2hvaWNlczogdGhpcy5wcm9wcy5jb25maWcuZmllbGRDaG9pY2VzKHRoaXMucHJvcHMuZmllbGQpXG4gICAgfTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV3UHJvcHMpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGNob2ljZXM6IG5ld1Byb3BzLmNvbmZpZy5maWVsZENob2ljZXMobmV3UHJvcHMuZmllbGQpXG4gICAgfSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHtcbiAgICAgIGNvbmZpZzogY29uZmlnLCBmaWVsZDogZmllbGQsIHBsYWluOiB0aGlzLnByb3BzLnBsYWluXG4gICAgfSwgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ3NlbGVjdC12YWx1ZScsIHtcbiAgICAgIGNob2ljZXM6IHRoaXMuc3RhdGUuY2hvaWNlcywgZmllbGQ6IGZpZWxkLCBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZVZhbHVlLCBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvblxuICAgIH0pKTtcbiAgfVxufSk7XG4iLCIvLyAjIHNpbmdsZS1saW5lLXN0cmluZyBjb21wb25lbnRcblxuLypcblJlbmRlciBhIHNpbmdsZSBsaW5lIHRleHQgaW5wdXQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnU2luZ2xlTGluZVN0cmluZycsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywge1xuICAgICAgY29uZmlnOiBjb25maWcsIGZpZWxkOiBmaWVsZCwgcGxhaW46IHRoaXMucHJvcHMucGxhaW5cbiAgICB9LCBSLmlucHV0KHtcbiAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgIHZhbHVlOiB0aGlzLnByb3BzLmZpZWxkLnZhbHVlLFxuICAgICAgY2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpLFxuICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsXG4gICAgICBvbkZvY3VzOiB0aGlzLm9uRm9jdXNBY3Rpb24sXG4gICAgICBvbkJsdXI6IHRoaXMub25CbHVyQWN0aW9uLFxuICAgICAgcmVhZE9ubHk6IGNvbmZpZy5maWVsZElzUmVhZE9ubHkoZmllbGQpXG4gICAgfSkpO1xuICB9XG59KTtcbiIsIi8vICMgc3RyaW5nIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIGEgZmllbGQgdGhhdCBjYW4gZWRpdCBhIHN0cmluZyB2YWx1ZS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdTdHJpbmcnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICBvbkNoYW5nZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdGhpcy5vbkNoYW5nZVZhbHVlKGV2ZW50LnRhcmdldC52YWx1ZSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHtcbiAgICAgIGNvbmZpZzogY29uZmlnLCBmaWVsZDogZmllbGQsIHBsYWluOiB0aGlzLnByb3BzLnBsYWluXG4gICAgfSwgUi50ZXh0YXJlYSh7XG4gICAgICB2YWx1ZTogZmllbGQudmFsdWUsXG4gICAgICBjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcyksXG4gICAgICByb3dzOiBmaWVsZC5yb3dzIHx8IHRoaXMucHJvcHMucm93cyxcbiAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgb25Gb2N1czogdGhpcy5vbkZvY3VzQWN0aW9uLFxuICAgICAgb25CbHVyOiB0aGlzLm9uQmx1ckFjdGlvbixcbiAgICAgIGRpc2FibGVkOiB0aGlzLmlzUmVhZE9ubHkoKVxuICAgIH0pKTtcbiAgfVxufSk7XG4iLCIvLyAjIHVua25vd24gY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgYSBmaWVsZCB3aXRoIGFuIHVua25vd24gdHlwZS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdVbmtub3duJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUi5kaXYoe30sXG4gICAgICBSLmRpdih7fSwgJ0NvbXBvbmVudCBub3QgZm91bmQgZm9yOiAnKSxcbiAgICAgIFIucHJlKHt9LCBKU09OLnN0cmluZ2lmeSh0aGlzLnByb3BzLmZpZWxkLnJhd0ZpZWxkVGVtcGxhdGUsIG51bGwsIDIpKVxuICAgICk7XG4gIH1cblxufSk7XG4iLCIvLyAjIGFkZC1pdGVtIGNvbXBvbmVudFxuXG4vKlxuVGhlIGFkZCBidXR0b24gdG8gYXBwZW5kIGFuIGl0ZW0gdG8gYSBmaWVsZC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdBZGRJdGVtJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBsYWJlbDogJ1thZGRdJ1xuICAgIH07XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUi5zcGFuKHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcyksIG9uQ2xpY2s6IHRoaXMucHJvcHMub25DbGlja30sIHRoaXMucHJvcHMubGFiZWwpO1xuICB9XG59KTtcbiIsIi8vICMgYXJyYXktY29udHJvbCBjb21wb25lbnRcblxuLypcblJlbmRlciB0aGUgaXRlbSB0eXBlIGNob2ljZXMgYW5kIHRoZSBhZGQgYnV0dG9uIGZvciBhbiBhcnJheS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdBcnJheUNvbnRyb2wnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZpZWxkVGVtcGxhdGVJbmRleDogMFxuICAgIH07XG4gIH0sXG5cbiAgb25TZWxlY3Q6IGZ1bmN0aW9uIChpbmRleCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZmllbGRUZW1wbGF0ZUluZGV4OiBpbmRleFxuICAgIH0pO1xuICB9LFxuXG4gIG9uQXBwZW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5wcm9wcy5vbkFwcGVuZCh0aGlzLnN0YXRlLmZpZWxkVGVtcGxhdGVJbmRleCk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblxuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG4gICAgdmFyIGZpZWxkVGVtcGxhdGVzID0gY29uZmlnLmZpZWxkSXRlbUZpZWxkVGVtcGxhdGVzKGZpZWxkKTtcbiAgICB2YXIgdHlwZUNob2ljZXMgPSBudWxsO1xuXG4gICAgaWYgKCF0aGlzLmlzUmVhZE9ubHkoKSAmJiBmaWVsZFRlbXBsYXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICB0eXBlQ2hvaWNlcyA9IGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZC10ZW1wbGF0ZS1jaG9pY2VzJywge1xuICAgICAgICBmaWVsZDogZmllbGQsIGZpZWxkVGVtcGxhdGVJbmRleDogdGhpcy5zdGF0ZS5maWVsZFRlbXBsYXRlSW5kZXgsIG9uU2VsZWN0OiB0aGlzLm9uU2VsZWN0XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBsZXQgYWRkSXRlbTtcbiAgICBpZiAoIXRoaXMuaXNSZWFkT25seSgpKSB7XG4gICAgICBhZGRJdGVtID0gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2FkZC1pdGVtJywge2ZpZWxkOiBmaWVsZCwgb25DbGljazogdGhpcy5vbkFwcGVuZH0pO1xuICAgIH1cblxuICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpfSxcbiAgICAgIHR5cGVDaG9pY2VzLCAnICcsXG4gICAgICBhZGRJdGVtXG4gICAgKTtcbiAgfVxufSk7XG4iLCIvLyAjIGFycmF5LWl0ZW0tY29udHJvbCBjb21wb25lbnRcblxuLypcblJlbmRlciB0aGUgcmVtb3ZlIGFuZCBtb3ZlIGJ1dHRvbnMgZm9yIGFuIGFycmF5IGZpZWxkLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnQXJyYXlJdGVtQ29udHJvbCcsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBvbk1vdmVCYWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5wcm9wcy5vbk1vdmUodGhpcy5wcm9wcy5pbmRleCwgdGhpcy5wcm9wcy5pbmRleCAtIDEpO1xuICB9LFxuXG4gIG9uTW92ZUZvcndhcmQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnByb3BzLm9uTW92ZSh0aGlzLnByb3BzLmluZGV4LCB0aGlzLnByb3BzLmluZGV4ICsgMSk7XG4gIH0sXG5cbiAgb25SZW1vdmU6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnByb3BzLm9uUmVtb3ZlKHRoaXMucHJvcHMuaW5kZXgpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKX0sXG4gICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgncmVtb3ZlLWl0ZW0nLCB7ZmllbGQ6IGZpZWxkLCBvbkNsaWNrOiB0aGlzLm9uUmVtb3ZlLCBvbk1heWJlUmVtb3ZlOiB0aGlzLnByb3BzLm9uTWF5YmVSZW1vdmV9KSxcbiAgICAgIHRoaXMucHJvcHMuaW5kZXggPiAwID8gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ21vdmUtaXRlbS1iYWNrJywge2ZpZWxkOiBmaWVsZCwgb25DbGljazogdGhpcy5vbk1vdmVCYWNrfSkgOiBudWxsLFxuICAgICAgdGhpcy5wcm9wcy5pbmRleCA8ICh0aGlzLnByb3BzLm51bUl0ZW1zIC0gMSkgPyBjb25maWcuY3JlYXRlRWxlbWVudCgnbW92ZS1pdGVtLWZvcndhcmQnLCB7ZmllbGQ6IGZpZWxkLCBvbkNsaWNrOiB0aGlzLm9uTW92ZUZvcndhcmR9KSA6IG51bGxcbiAgICApO1xuICB9XG59KTtcbiIsIi8vICMgYXJyYXktaXRlbS12YWx1ZSBjb21wb25lbnRcblxuLypcblJlbmRlciB0aGUgdmFsdWUgb2YgYW4gYXJyYXkgaXRlbS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0FycmF5SXRlbVZhbHVlJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIG9uQ2hhbmdlRmllbGQ6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgaW5mbykge1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UodGhpcy5wcm9wcy5pbmRleCwgbmV3VmFsdWUsIGluZm8pO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKX0sXG4gICAgICBjb25maWcuY3JlYXRlRmllbGRFbGVtZW50KHtmaWVsZDogZmllbGQsIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlRmllbGQsIG9uQWN0aW9uOiB0aGlzLm9uQnViYmxlQWN0aW9ufSlcbiAgICApO1xuICB9XG59KTtcbiIsIi8vICMgYXJyYXktaXRlbSBjb21wb25lbnRcblxuLypcblJlbmRlciBhbiBhcnJheSBpdGVtLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG52YXIgXyA9IHJlcXVpcmUoJy4uLy4uL3VuZGFzaCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0FycmF5SXRlbScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaXNNYXliZVJlbW92aW5nOiBmYWxzZVxuICAgIH07XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIG9uTWF5YmVSZW1vdmU6IGZ1bmN0aW9uIChpc01heWJlUmVtb3ZpbmcpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGlzTWF5YmVSZW1vdmluZzogaXNNYXliZVJlbW92aW5nXG4gICAgfSk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgdmFyIGNsYXNzZXMgPSBfLmV4dGVuZCh7fSwgdGhpcy5wcm9wcy5jbGFzc2VzKTtcblxuICAgIGlmICh0aGlzLnN0YXRlLmlzTWF5YmVSZW1vdmluZykge1xuICAgICAgY2xhc3Nlc1snbWF5YmUtcmVtb3ZpbmcnXSA9IHRydWU7XG4gICAgfVxuXG4gICAgbGV0IGFycmF5SXRlbUNvbnRyb2w7XG4gICAgaWYgKCFjb25maWcuZmllbGRJc1JlYWRPbmx5KGZpZWxkKSkge1xuICAgICAgYXJyYXlJdGVtQ29udHJvbCA9IGNvbmZpZy5jcmVhdGVFbGVtZW50KCdhcnJheS1pdGVtLWNvbnRyb2wnLCB7ZmllbGQ6IGZpZWxkLCBpbmRleDogdGhpcy5wcm9wcy5pbmRleCwgbnVtSXRlbXM6IHRoaXMucHJvcHMubnVtSXRlbXMsXG4gICAgICAgIG9uTW92ZTogdGhpcy5wcm9wcy5vbk1vdmUsIG9uUmVtb3ZlOiB0aGlzLnByb3BzLm9uUmVtb3ZlLCBvbk1heWJlUmVtb3ZlOiB0aGlzLm9uTWF5YmVSZW1vdmV9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogY3goY2xhc3Nlcyl9LFxuICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2FycmF5LWl0ZW0tdmFsdWUnLCB7ZmllbGQ6IGZpZWxkLCBpbmRleDogdGhpcy5wcm9wcy5pbmRleCxcbiAgICAgICAgb25DaGFuZ2U6IHRoaXMucHJvcHMub25DaGFuZ2UsIG9uQWN0aW9uOiB0aGlzLm9uQnViYmxlQWN0aW9ufSksXG4gICAgICBhcnJheUl0ZW1Db250cm9sXG4gICAgKTtcbiAgfVxufSk7XG4iLCIvLyAjIENob2ljZVNlY3Rpb25IZWFkZXIgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgc2VjdGlvbiBoZWFkZXIgaW4gY2hvaWNlcyBkcm9wZG93blxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdDaG9pY2VTZWN0aW9uSGVhZGVyJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNob2ljZSA9IHRoaXMucHJvcHMuY2hvaWNlO1xuICAgIHJldHVybiA8c3BhbiBjbGFzc05hbWU9e2N4KHRoaXMucHJvcHMuY2xhc3Nlcyl9PntjaG9pY2UubGFiZWx9PC9zcGFuPjtcbiAgfVxufSk7XG4iLCIvLyAjIGNob2ljZXMtc2VhcmNoIGNvbXBvbmVudFxuXG4vKlxuICAgUmVuZGVyIGEgc2VhcmNoIGJveCBmb3IgY2hvaWNlcy5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0Nob2ljZXNTZWFyY2gnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJjaG9pY2VzLXNlYXJjaFwiPlxuICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgcGxhY2Vob2xkZXI9XCJTZWFyY2guLi5cIiBvbkNoYW5nZT17dGhpcy5wcm9wcy5vbkNoYW5nZX0vPlxuICAgIDwvZGl2PjtcbiAgfVxuXG59KTtcbiIsIi8vICMgQ2hvaWNlcyBjb21wb25lbnRcblxuLypcblJlbmRlciBjdXN0b21pemVkIChub24tbmF0aXZlKSBkcm9wZG93biBjaG9pY2VzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIF8gPSByZXF1aXJlKCcuLi8uLi91bmRhc2gnKTtcbnZhciBTY3JvbGxMb2NrID0gcmVxdWlyZSgncmVhY3Qtc2Nyb2xsLWxvY2snKTtcblxudmFyIG1hZ2ljQ2hvaWNlUmUgPSAvXlxcL1xcL1xcL1teXFwvXStcXC9cXC9cXC8kLztcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdDaG9pY2VzJyxcblxuICBtaXhpbnM6IFtcbiAgICByZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyksXG4gICAgLy9wbHVnaW4ucmVxdWlyZSgnbWl4aW4ucmVzaXplJyksXG4gICAgLy9wbHVnaW4ucmVxdWlyZSgnbWl4aW4uc2Nyb2xsJyksXG4gICAgcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2NsaWNrLW91dHNpZGUnKSxcbiAgICBTY3JvbGxMb2NrXG4gIF0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1heEhlaWdodDogbnVsbCxcbiAgICAgIG9wZW46IHRoaXMucHJvcHMub3BlbixcbiAgICAgIHNlYXJjaFN0cmluZzogJydcbiAgICB9O1xuICB9LFxuXG4gIGdldElnbm9yZUNsb3NlTm9kZXM6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMucHJvcHMuaWdub3JlQ2xvc2VOb2Rlcykge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICB2YXIgbm9kZXMgPSB0aGlzLnByb3BzLmlnbm9yZUNsb3NlTm9kZXMoKTtcbiAgICBpZiAoIV8uaXNBcnJheShub2RlcykpIHtcbiAgICAgIG5vZGVzID0gW25vZGVzXTtcbiAgICB9XG4gICAgcmV0dXJuIG5vZGVzO1xuICB9LFxuXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zZXRPbkNsaWNrT3V0c2lkZSgnY29udGFpbmVyJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cbiAgICAgIC8vIE1ha2Ugc3VyZSB3ZSBkb24ndCBmaW5kIGFueSBub2RlcyB0byBpZ25vcmUuXG4gICAgICBpZiAoIV8uZmluZCh0aGlzLmdldElnbm9yZUNsb3NlTm9kZXMoKSwgZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNOb2RlSW5zaWRlKGV2ZW50LnRhcmdldCwgbm9kZSk7XG4gICAgICB9LmJpbmQodGhpcykpKSB7XG4gICAgICAgIHRoaXMub25DbG9zZSgpO1xuICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLmFkanVzdFNpemUoKTtcbiAgICB0aGlzLnVwZGF0ZUxpc3RlbmluZ1RvV2luZG93KCk7XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnN0b3BMaXN0ZW5pbmdUb1dpbmRvdygpO1xuICB9LFxuXG4gIG9uU2VsZWN0OiBmdW5jdGlvbiAoY2hvaWNlLCBldmVudCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgb3BlblNlY3Rpb246IG51bGwsXG4gICAgICBzZWFyY2hTdHJpbmc6ICcnXG4gICAgfSk7XG4gICAgdGhpcy5wcm9wcy5vblNlbGVjdChjaG9pY2UudmFsdWUsIGV2ZW50KTtcbiAgfSxcblxuICBvbkNob2ljZUFjdGlvbjogZnVuY3Rpb24gKGNob2ljZSkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgb3BlblNlY3Rpb246IG51bGwsXG4gICAgICBzZWFyY2hTdHJpbmc6ICcnXG4gICAgfSk7XG4gICAgdGhpcy5wcm9wcy5vbkNob2ljZUFjdGlvbihjaG9pY2UpO1xuICB9LFxuXG4gIG9uQ2xvc2U6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIG9wZW5TZWN0aW9uOiBudWxsLFxuICAgICAgc2VhcmNoU3RyaW5nOiAnJ1xuICAgIH0pO1xuICAgIHRoaXMucHJvcHMub25DbG9zZSgpO1xuICB9LFxuXG4gIC8vIERvaW5nIHNvbWV0aGluZyBhIGxpdHRsZSBjcmF6eS4uLiBtZWFzdXJpbmcgb24gZXZlcnkgZnJhbWUuIE1ha2VzIHRoaXMgc21vb3RoZXIgdGhhbiB1c2luZyBhbiBpbnRlcnZhbC5cbiAgLy8gQ2FuJ3QgdXNpbmcgc2Nyb2xsaW5nIGV2ZW50cywgYmVjYXVzZSB3ZSBtaWdodCBiZSBzY3JvbGxpbmcgaW5zaWRlIGEgY29udGFpbmVyIGluc3RlYWQgb2YgdGhlIGJvZHkuXG4gIC8vIFNob3VsZG4ndCBiZSBhbnkgbW9yZSBjb3N0bHkgdGhhbiBhbmltYXRpb25zIHRob3VnaCwgSSB0aGluay4gQW5kIG9ubHkgb25lIG9mIHRoZXNlIGlzIG9wZW4gYXQgYSB0aW1lLlxuICB1cGRhdGVMaXN0ZW5pbmdUb1dpbmRvdzogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnJlZnMuY2hvaWNlcykge1xuICAgICAgaWYgKCF0aGlzLmlzTGlzdGVuaW5nKSB7XG4gICAgICAgIGNvbnN0IGxpc3RlblRvRnJhbWUgPSAoKSA9PiB7XG4gICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuYWRqdXN0U2l6ZSgpO1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNMaXN0ZW5pbmcpIHtcbiAgICAgICAgICAgICAgbGlzdGVuVG9GcmFtZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmlzTGlzdGVuaW5nID0gdHJ1ZTtcbiAgICAgICAgbGlzdGVuVG9GcmFtZSgpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5pc0xpc3RlbmluZykge1xuICAgICAgICB0aGlzLnN0b3BMaXN0ZW5pbmdUb1dpbmRvdygpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBzdG9wTGlzdGVuaW5nVG9XaW5kb3c6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5pc0xpc3RlbmluZykge1xuICAgICAgdGhpcy5pc0xpc3RlbmluZyA9IGZhbHNlO1xuICAgIH1cbiAgfSxcblxuICBhZGp1c3RTaXplOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMucmVmcy5jaG9pY2VzKSB7XG4gICAgICB2YXIgbm9kZSA9IHRoaXMucmVmcy5jb250YWluZXIuZ2V0RE9NTm9kZSgpO1xuICAgICAgdmFyIHJlY3QgPSBub2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgdmFyIHRvcCA9IHJlY3QudG9wO1xuICAgICAgdmFyIHdpbmRvd0hlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICAgIHZhciBoZWlnaHQgPSB3aW5kb3dIZWlnaHQgLSB0b3A7XG4gICAgICBpZiAoaGVpZ2h0ICE9PSB0aGlzLnN0YXRlLm1heEhlaWdodCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBtYXhIZWlnaHQ6IGhlaWdodFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gKG5leHRQcm9wcykge1xuICAgIHZhciBuZXh0U3RhdGUgPSB7XG4gICAgICBvcGVuOiBuZXh0UHJvcHMub3BlblxuICAgIH07XG5cbiAgICB0aGlzLnNldFN0YXRlKG5leHRTdGF0ZSwgZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5hZGp1c3RTaXplKCk7XG4gICAgICB0aGlzLnVwZGF0ZUxpc3RlbmluZ1RvV2luZG93KCk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfSxcblxuICBvbkhlYWRlckNsaWNrOiBmdW5jdGlvbiAoY2hvaWNlKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUub3BlblNlY3Rpb24gPT09IGNob2ljZS5zZWN0aW9uS2V5KSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtvcGVuU2VjdGlvbjogbnVsbH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtvcGVuU2VjdGlvbjogY2hvaWNlLnNlY3Rpb25LZXl9LCB0aGlzLmFkanVzdFNpemUpO1xuICAgIH1cbiAgfSxcblxuICBoYXNPbmVTZWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlY3Rpb25IZWFkZXJzID0gdGhpcy5wcm9wcy5jaG9pY2VzLmZpbHRlcihmdW5jdGlvbiAoYykgeyByZXR1cm4gYy5zZWN0aW9uS2V5OyB9KTtcbiAgICByZXR1cm4gc2VjdGlvbkhlYWRlcnMubGVuZ3RoID09PSAxO1xuICB9LFxuXG4gIHZpc2libGVDaG9pY2VzOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNob2ljZXMgPSB0aGlzLnByb3BzLmNob2ljZXM7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuXG4gICAgaWYgKGNob2ljZXMgJiYgY2hvaWNlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBbe3ZhbHVlOiAnLy8vZW1wdHkvLy8nfV07XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc3RhdGUuc2VhcmNoU3RyaW5nKSB7XG4gICAgICBjaG9pY2VzID0gY2hvaWNlcy5maWx0ZXIoKGNob2ljZSkgPT4ge1xuICAgICAgICBpZiAoY2hvaWNlLnNlY3Rpb25LZXkpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29uZmlnLmlzU2VhcmNoU3RyaW5nSW5DaG9pY2UodGhpcy5zdGF0ZS5zZWFyY2hTdHJpbmcsIGNob2ljZSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMucHJvcHMuaXNBY2NvcmRpb24pIHtcbiAgICAgIHJldHVybiBjaG9pY2VzO1xuICAgIH1cblxuICAgIHZhciBvcGVuU2VjdGlvbiA9IHRoaXMuc3RhdGUub3BlblNlY3Rpb247XG4gICAgdmFyIGFsd2F5c0V4YW5kZWQgPSB0aGlzLmhhc09uZVNlY3Rpb24oKSB8fCB0aGlzLnN0YXRlLnNlYXJjaFN0cmluZztcbiAgICB2YXIgdmlzaWJsZUNob2ljZXMgPSBbXTtcbiAgICB2YXIgaW5TZWN0aW9uO1xuXG4gICAgY2hvaWNlcy5mb3JFYWNoKGZ1bmN0aW9uIChjaG9pY2UpIHtcbiAgICAgIGlmIChjaG9pY2UudmFsdWUgJiYgY2hvaWNlLnZhbHVlLm1hdGNoKG1hZ2ljQ2hvaWNlUmUpKSB7XG4gICAgICAgIHZpc2libGVDaG9pY2VzLnB1c2goY2hvaWNlKTtcbiAgICAgIH1cbiAgICAgIGlmIChjaG9pY2Uuc2VjdGlvbktleSkge1xuICAgICAgICBpblNlY3Rpb24gPSBjaG9pY2Uuc2VjdGlvbktleSA9PT0gb3BlblNlY3Rpb247XG4gICAgICB9XG4gICAgICBpZiAoYWx3YXlzRXhhbmRlZCB8fCBjaG9pY2Uuc2VjdGlvbktleSB8fCBpblNlY3Rpb24pIHtcbiAgICAgICAgdmlzaWJsZUNob2ljZXMucHVzaChjaG9pY2UpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHZpc2libGVDaG9pY2VzO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICBvbkNsaWNrOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAvLyBzd2FsbG93IGNsaWNrc1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICB9LFxuXG4gIG9uQ2hhbmdlU2VhcmNoOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHNlYXJjaFN0cmluZzogZXZlbnQudGFyZ2V0LnZhbHVlXG4gICAgfSk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblxuICAgIHZhciBjaG9pY2VzID0gdGhpcy52aXNpYmxlQ2hvaWNlcygpO1xuXG4gICAgdmFyIHNlYXJjaCA9IG51bGw7XG5cbiAgICB2YXIgaGFzU2VhcmNoID0gISF0aGlzLnN0YXRlLnNlYXJjaFN0cmluZztcblxuICAgIGlmICghaGFzU2VhcmNoKSB7XG4gICAgICBpZiAodGhpcy5wcm9wcy5jaG9pY2VzLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgaWYgKF8uZmluZChjaG9pY2VzLCBjaG9pY2UgPT4gIWNob2ljZS5hY3Rpb24gJiYgY2hvaWNlLnZhbHVlICE9PSAnLy8vbG9hZGluZy8vLycpKSB7XG4gICAgICAgICAgaGFzU2VhcmNoID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChoYXNTZWFyY2gpIHtcbiAgICAgIHNlYXJjaCA9IGNvbmZpZy5jcmVhdGVFbGVtZW50KCdjaG9pY2VzLXNlYXJjaCcsIHtmaWVsZDogdGhpcy5wcm9wcy5maWVsZCwgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2VTZWFyY2h9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5wcm9wcy5vcGVuKSB7XG4gICAgICByZXR1cm4gUi5kaXYoe3JlZjogJ2NvbnRhaW5lcicsIG9uQ2xpY2s6IHRoaXMub25DbGljayxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnY2hvaWNlcy1jb250YWluZXInLCBzdHlsZToge1xuICAgICAgICB1c2VyU2VsZWN0OiAnbm9uZScsIFdlYmtpdFVzZXJTZWxlY3Q6ICdub25lJywgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICAgIG1heEhlaWdodDogdGhpcy5zdGF0ZS5tYXhIZWlnaHQgPyB0aGlzLnN0YXRlLm1heEhlaWdodCA6IG51bGwsXG4gICAgICAgIHdpZHRoOiB0aGlzLnByb3BzLndpZHRoID8gdGhpcy5wcm9wcy53aWR0aCA6IG51bGxcbiAgICAgIH19LFxuICAgICAgICBjb25maWcuY3NzVHJhbnNpdGlvbldyYXBwZXIoXG5cbiAgICAgICAgICBzZWFyY2gsXG5cbiAgICAgICAgICBSLnVsKHtrZXk6ICdjaG9pY2VzJywgcmVmOiAnY2hvaWNlcycsIGNsYXNzTmFtZTogJ2Nob2ljZXMnfSxcblxuICAgICAgICAgICAgY2hvaWNlcy5tYXAoZnVuY3Rpb24gKGNob2ljZSwgaSkge1xuXG4gICAgICAgICAgICAgIHZhciBjaG9pY2VFbGVtZW50ID0gbnVsbDtcblxuICAgICAgICAgICAgICBpZiAoY2hvaWNlLnZhbHVlID09PSAnLy8vbG9hZGluZy8vLycpIHtcbiAgICAgICAgICAgICAgICBjaG9pY2VFbGVtZW50ID0gUi5hKHtocmVmOiAnSmF2YVNjcmlwdCcgKyAnOicsIG9uQ2xpY2s6IHRoaXMub25DbG9zZX0sXG4gICAgICAgICAgICAgICAgICBSLnNwYW4oe2NsYXNzTmFtZTogJ2Nob2ljZS1sYWJlbCd9LFxuICAgICAgICAgICAgICAgICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgnbG9hZGluZy1jaG9pY2UnLCB7ZmllbGQ6IHRoaXMucHJvcHMuZmllbGR9KVxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hvaWNlLnZhbHVlID09PSAnLy8vZW1wdHkvLy8nKSB7XG4gICAgICAgICAgICAgICAgY2hvaWNlRWxlbWVudCA9IFIuYSh7aHJlZjogJ0phdmFTY3JpcHQnICsgJzonLCBvbkNsaWNrOiB0aGlzLm9uQ2xvc2V9LFxuICAgICAgICAgICAgICAgICAgUi5zcGFuKHtjbGFzc05hbWU6ICdjaG9pY2UtbGFiZWwnfSxcbiAgICAgICAgICAgICAgICAgICAgJ05vIGNob2ljZXMgYXZhaWxhYmxlLidcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNob2ljZS5hY3Rpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgbGFiZWxDbGFzc2VzID0gJ2Nob2ljZS1sYWJlbCAnICsgY2hvaWNlLmFjdGlvbjtcblxuICAgICAgICAgICAgICAgIGNob2ljZUVsZW1lbnQgPSBSLmEoe2hyZWY6ICdKYXZhU2NyaXB0JyArICc6Jywgb25DbGljazogdGhpcy5vbkNob2ljZUFjdGlvbi5iaW5kKHRoaXMsIGNob2ljZSl9LFxuICAgICAgICAgICAgICAgICAgUi5zcGFuKHtjbGFzc05hbWU6IGxhYmVsQ2xhc3Nlc30sXG4gICAgICAgICAgICAgICAgICAgIGNob2ljZS5sYWJlbCB8fCB0aGlzLnByb3BzLmNvbmZpZy5hY3Rpb25DaG9pY2VMYWJlbChjaG9pY2UuYWN0aW9uKVxuICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2Nob2ljZS1hY3Rpb24tc2FtcGxlJywge2FjdGlvbjogY2hvaWNlLmFjdGlvbiwgY2hvaWNlOiBjaG9pY2V9KVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hvaWNlLnNlY3Rpb25LZXkpIHtcbiAgICAgICAgICAgICAgICBjaG9pY2VFbGVtZW50ID0gUi5hKHtocmVmOiAnSmF2YVNjcmlwdCcgKyAnOicsIG9uQ2xpY2s6IHRoaXMub25IZWFkZXJDbGljay5iaW5kKHRoaXMsIGNob2ljZSl9LFxuICAgICAgICAgICAgICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2Nob2ljZS1zZWN0aW9uLWhlYWRlcicsIHtjaG9pY2U6IGNob2ljZX0pXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjaG9pY2VFbGVtZW50ID0gUi5hKHtocmVmOiAnSmF2YVNjcmlwdCcgKyAnOicsIG9uQ2xpY2s6IHRoaXMub25TZWxlY3QuYmluZCh0aGlzLCBjaG9pY2UpfSxcbiAgICAgICAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAnY2hvaWNlLWxhYmVsJ30sXG4gICAgICAgICAgICAgICAgICAgIGNob2ljZS5sYWJlbFxuICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAnY2hvaWNlLXNhbXBsZSd9LFxuICAgICAgICAgICAgICAgICAgICBjaG9pY2Uuc2FtcGxlXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHJldHVybiBSLmxpKHtrZXk6IGksIGNsYXNzTmFtZTogJ2Nob2ljZSd9LFxuICAgICAgICAgICAgICAgIGNob2ljZUVsZW1lbnRcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gbm90IG9wZW5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufSk7XG4iLCIvLyAjIGZpZWxkLXRlbXBsYXRlLWNob2ljZXMgY29tcG9uZW50XG5cbi8qXG5HaXZlIGEgbGlzdCBvZiBjaG9pY2VzIG9mIGl0ZW0gdHlwZXMgdG8gY3JlYXRlIGFzIGNoaWxkcmVuIG9mIGFuIGZpZWxkLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0ZpZWxkVGVtcGxhdGVDaG9pY2VzJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB0aGlzLnByb3BzLm9uU2VsZWN0KHBhcnNlSW50KGV2ZW50LnRhcmdldC52YWx1ZSkpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHZhciBmaWVsZFRlbXBsYXRlcyA9IGNvbmZpZy5maWVsZEl0ZW1GaWVsZFRlbXBsYXRlcyhmaWVsZCk7XG5cbiAgICB2YXIgdHlwZUNob2ljZXMgPSBudWxsO1xuICAgIGlmIChmaWVsZFRlbXBsYXRlcy5sZW5ndGggPiAxKSB7XG4gICAgICB0eXBlQ2hvaWNlcyA9IFIuc2VsZWN0KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcyksIHZhbHVlOiB0aGlzLmZpZWxkVGVtcGxhdGVJbmRleCwgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2V9LFxuICAgICAgZmllbGRUZW1wbGF0ZXMubWFwKGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlLCBpKSB7XG4gICAgICAgIHJldHVybiBSLm9wdGlvbih7a2V5OiBpLCB2YWx1ZTogaX0sIGZpZWxkVGVtcGxhdGUubGFiZWwgfHwgaSk7XG4gICAgICB9KSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHR5cGVDaG9pY2VzID8gdHlwZUNob2ljZXMgOiBSLnNwYW4obnVsbCk7XG4gIH1cbn0pO1xuIiwiLy8gIyBmaWVsZCBjb21wb25lbnRcblxuLypcblVzZWQgYnkgYW55IGZpZWxkcyB0byBwdXQgdGhlIGxhYmVsIGFuZCBoZWxwIHRleHQgYXJvdW5kIHRoZSBmaWVsZC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBfID0gcmVxdWlyZSgnLi4vLi4vdW5kYXNoJyk7XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnRmllbGQnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbGxhcHNlZDogdGhpcy5wcm9wcy5jb25maWcuZmllbGRJc0NvbGxhcHNlZCh0aGlzLnByb3BzLmZpZWxkKSA/IHRydWUgOiBmYWxzZVxuICAgIH07XG4gIH0sXG5cbiAgb25DbGlja0xhYmVsOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjb2xsYXBzZWQ6ICF0aGlzLnN0YXRlLmNvbGxhcHNlZFxuICAgIH0pO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG5cbiAgICBpZiAodGhpcy5wcm9wcy5wbGFpbikge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMuY2hpbGRyZW47XG4gICAgfVxuXG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHZhciBpbmRleCA9IHRoaXMucHJvcHMuaW5kZXg7XG4gICAgaWYgKCFfLmlzTnVtYmVyKGluZGV4KSkge1xuICAgICAgdmFyIGtleSA9IHRoaXMucHJvcHMuZmllbGQua2V5O1xuICAgICAgaW5kZXggPSBfLmlzTnVtYmVyKGtleSkgPyBrZXkgOiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgdmFyIGNsYXNzZXMgPSBfLmV4dGVuZCh7fSwgdGhpcy5wcm9wcy5jbGFzc2VzKTtcblxuICAgIHZhciBlcnJvcnMgPSBjb25maWcuZmllbGRFcnJvcnMoZmllbGQpO1xuXG4gICAgZXJyb3JzLmZvckVhY2goZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICBjbGFzc2VzWyd2YWxpZGF0aW9uLWVycm9yLScgKyBlcnJvci50eXBlXSA9IHRydWU7XG4gICAgfSk7XG5cbiAgICBpZiAoY29uZmlnLmZpZWxkSXNSZXF1aXJlZChmaWVsZCkpIHtcbiAgICAgIGNsYXNzZXMucmVxdWlyZWQgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBjbGFzc2VzLm9wdGlvbmFsID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pc1JlYWRPbmx5KCkpIHtcbiAgICAgIGNsYXNzZXMucmVhZG9ubHkgPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiBjeChjbGFzc2VzKSwgc3R5bGU6IHtkaXNwbGF5OiAoZmllbGQuaGlkZGVuID8gJ25vbmUnIDogJycpfX0sXG4gICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgnbGFiZWwnLCB7XG4gICAgICAgIGNvbmZpZzogY29uZmlnLCBmaWVsZDogZmllbGQsXG4gICAgICAgIGluZGV4OiBpbmRleCwgb25DbGljazogY29uZmlnLmZpZWxkSXNDb2xsYXBzaWJsZShmaWVsZCkgPyB0aGlzLm9uQ2xpY2tMYWJlbCA6IG51bGxcbiAgICAgIH0pLFxuICAgICAgY29uZmlnLmNzc1RyYW5zaXRpb25XcmFwcGVyKFxuICAgICAgICB0aGlzLnN0YXRlLmNvbGxhcHNlZCA/IFtdIDogW1xuICAgICAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdoZWxwJywge1xuICAgICAgICAgICAgY29uZmlnOiBjb25maWcsIGZpZWxkOiBmaWVsZCxcbiAgICAgICAgICAgIGtleTogJ2hlbHAnXG4gICAgICAgICAgfSksXG4gICAgICAgICAgdGhpcy5wcm9wcy5jaGlsZHJlblxuICAgICAgICBdXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG4iLCIvLyAjIGhlbHAgY29tcG9uZW50XG5cbi8qXG5KdXN0IHRoZSBoZWxwIHRleHQgYmxvY2suXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnSGVscCcsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGhlbHBUZXh0ID0gdGhpcy5wcm9wcy5jb25maWcuZmllbGRIZWxwVGV4dCh0aGlzLnByb3BzLmZpZWxkKTtcblxuICAgIHJldHVybiBoZWxwVGV4dCA/XG4gICAgICBSLmRpdih7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpLCBkYW5nZXJvdXNseVNldElubmVySFRNTDoge19faHRtbDogaGVscFRleHR9fSkgOlxuICAgICAgUi5zcGFuKG51bGwpO1xuICB9XG59KTtcbiIsIi8vICMgYnV0dG9uIGNvbXBvbmVudFxuXG4vKlxuICBDbGlja2FibGUgJ2J1dHRvbidcbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnSW5zZXJ0QnV0dG9uJyxcblxuICBwcm9wVHlwZXM6IHtcbiAgICBvbkNsaWNrOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIHJlZjogUmVhY3QuUHJvcFR5cGVzLnN0cmluZ1xuICB9LFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGEgcmVmPXt0aGlzLnByb3BzLnJlZn0gaHJlZj17J0phdmFTY3JpcHQnICsgJzonfSBvbkNsaWNrPXt0aGlzLnByb3BzLm9uQ2xpY2t9PlxuICAgICAgICB7dGhpcy5wcm9wcy5jaGlsZHJlbn1cbiAgICAgIDwvYT5cbiAgICApO1xuICB9XG5cbn0pO1xuIiwiLy8gIyBsYWJlbCBjb21wb25lbnRcblxuLypcbkp1c3QgdGhlIGxhYmVsIGZvciBhIGZpZWxkLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0xhYmVsJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICB2YXIgZmllbGRMYWJlbCA9IGNvbmZpZy5maWVsZExhYmVsKGZpZWxkKTtcblxuICAgIHZhciBsYWJlbCA9IG51bGw7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnByb3BzLmluZGV4ID09PSAnbnVtYmVyJykge1xuICAgICAgbGFiZWwgPSAnJyArICh0aGlzLnByb3BzLmluZGV4ICsgMSkgKyAnLic7XG4gICAgICBpZiAoZmllbGRMYWJlbCkge1xuICAgICAgICBsYWJlbCA9IGxhYmVsICsgJyAnICsgZmllbGRMYWJlbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZmllbGRMYWJlbCB8fCBsYWJlbCkge1xuICAgICAgdmFyIHRleHQgPSBsYWJlbCB8fCBmaWVsZExhYmVsO1xuICAgICAgaWYgKHRoaXMucHJvcHMub25DbGljaykge1xuICAgICAgICB0ZXh0ID0gUi5hKHtocmVmOiAnSmF2YVNjcmlwdCcgKyAnOicsIG9uQ2xpY2s6IHRoaXMucHJvcHMub25DbGlja30sIHRleHQpO1xuICAgICAgfVxuICAgICAgbGFiZWwgPSBSLmxhYmVsKHt9LCB0ZXh0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gUi5kaXYoe1xuICAgICAgY2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpXG4gICAgfSxcbiAgICAgIGxhYmVsLFxuICAgICAgJyAnLFxuICAgICAgUi5zcGFuKHtjbGFzc05hbWU6IGNvbmZpZy5maWVsZElzUmVxdWlyZWQoZmllbGQpID8gJ3JlcXVpcmVkLXRleHQnIDogJ25vdC1yZXF1aXJlZC10ZXh0J30pXG4gICAgKTtcbiAgfVxufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0xvYWRpbmdDaG9pY2UnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPHNwYW4+TG9hZGluZyBjaG9pY2VzLi4uPC9zcGFuPlxuICAgICk7XG4gIH1cblxufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0xvYWRpbmdDaG9pY2VzJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+TG9hZGluZyBjaG9pY2VzLi4uPC9kaXY+XG4gICAgKTtcbiAgfVxuXG59KTtcbiIsIi8vICMgbW92ZS1pdGVtLWJhY2sgY29tcG9uZW50XG5cbi8qXG5CdXR0b24gdG8gbW92ZSBhbiBpdGVtIGJhY2t3YXJkcyBpbiBsaXN0LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ01vdmVJdGVtQmFjaycsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGFiZWw6ICdbdXBdJ1xuICAgIH07XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUi5zcGFuKHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcyksIG9uQ2xpY2s6IHRoaXMucHJvcHMub25DbGlja30sIHRoaXMucHJvcHMubGFiZWwpO1xuICB9XG59KTtcbiIsIi8vICMgbW92ZS1pdGVtLWZvcndhcmQgY29tcG9uZW50XG5cbi8qXG5CdXR0b24gdG8gbW92ZSBhbiBpdGVtIGZvcndhcmQgaW4gYSBsaXN0LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ01vdmVJdGVtRm9yd2FyZCcsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGFiZWw6ICdbZG93bl0nXG4gICAgfTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSLnNwYW4oe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSwgb25DbGljazogdGhpcy5wcm9wcy5vbkNsaWNrfSwgdGhpcy5wcm9wcy5sYWJlbCk7XG4gIH1cbn0pO1xuIiwiLy8gIyBvYmplY3QtY29udHJvbCBjb21wb25lbnRcblxuLypcblJlbmRlciB0aGUgaXRlbSB0eXBlIGNob2ljZXMgYW5kIHRoZSBhZGQgYnV0dG9uLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ09iamVjdENvbnRyb2wnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZpZWxkVGVtcGxhdGVJbmRleDogMFxuICAgIH07XG4gIH0sXG5cbiAgb25TZWxlY3Q6IGZ1bmN0aW9uIChpbmRleCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZmllbGRUZW1wbGF0ZUluZGV4OiBpbmRleFxuICAgIH0pO1xuICB9LFxuXG4gIG9uQXBwZW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5wcm9wcy5vbkFwcGVuZCh0aGlzLnN0YXRlLmZpZWxkVGVtcGxhdGVJbmRleCk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcbiAgICB2YXIgZmllbGRUZW1wbGF0ZXMgPSBjb25maWcuZmllbGRDaGlsZEZpZWxkVGVtcGxhdGVzKGZpZWxkKTtcblxuICAgIHZhciB0eXBlQ2hvaWNlcyA9IG51bGw7XG5cbiAgICBpZiAoZmllbGRUZW1wbGF0ZXMubGVuZ3RoID4gMCkge1xuICAgICAgdHlwZUNob2ljZXMgPSBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQtdGVtcGxhdGUtY2hvaWNlcycsIHtcbiAgICAgICAgZmllbGQ6IGZpZWxkLFxuICAgICAgICBmaWVsZFRlbXBsYXRlSW5kZXg6IHRoaXMuc3RhdGUuZmllbGRUZW1wbGF0ZUluZGV4LCBvblNlbGVjdDogdGhpcy5vblNlbGVjdFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3Nlcyl9LFxuICAgICAgdHlwZUNob2ljZXMsICcgJyxcbiAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdhZGQtaXRlbScsIHtvbkNsaWNrOiB0aGlzLm9uQXBwZW5kfSlcbiAgICApO1xuICB9XG59KTtcbiIsIi8vICMgb2JqZWN0LWl0ZW0tY29udHJvbCBjb21wb25lbnRcblxuLypcblJlbmRlciB0aGUgcmVtb3ZlIGJ1dHRvbnMgZm9yIGFuIG9iamVjdCBpdGVtLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnT2JqZWN0SXRlbUNvbnRyb2wnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgb25SZW1vdmU6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnByb3BzLm9uUmVtb3ZlKHRoaXMucHJvcHMuaXRlbUtleSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpfSxcbiAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdyZW1vdmUtaXRlbScsIHtmaWVsZDogZmllbGQsIG9uQ2xpY2s6IHRoaXMub25SZW1vdmV9KVxuICAgICk7XG4gIH1cbn0pO1xuIiwiLy8gIyBvYmplY3QtaXRlbS1rZXkgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgYW4gb2JqZWN0IGl0ZW0ga2V5IGVkaXRvci5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ09iamVjdEl0ZW1LZXknLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSLmlucHV0KHtcbiAgICAgIGNsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSxcbiAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgIHZhbHVlOiB0aGlzLnByb3BzLmRpc3BsYXlLZXksXG4gICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgIG9uRm9jdXM6IHRoaXMub25Gb2N1c0FjdGlvbixcbiAgICAgIG9uQmx1cjogdGhpcy5vbkJsdXJBY3Rpb25cbiAgICB9KTtcbiAgfVxufSk7XG4iLCIvLyAjIG9iamVjdC1pdGVtLXZhbHVlIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIHRoZSB2YWx1ZSBvZiBhbiBvYmplY3QgaXRlbS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ09iamVjdEl0ZW1WYWx1ZScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBvbkNoYW5nZUZpZWxkOiBmdW5jdGlvbiAobmV3VmFsdWUsIGluZm8pIHtcbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHRoaXMucHJvcHMuaXRlbUtleSwgbmV3VmFsdWUsIGluZm8pO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKX0sXG4gICAgICBjb25maWcuY3JlYXRlRmllbGRFbGVtZW50KHtmaWVsZDogZmllbGQsIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlRmllbGQsIHBsYWluOiB0cnVlLCBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvbn0pXG4gICAgKTtcbiAgfVxufSk7XG4iLCIvLyAjIG9iamVjdC1pdGVtIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIGFuIG9iamVjdCBpdGVtLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnT2JqZWN0SXRlbScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBvbkNoYW5nZUtleTogZnVuY3Rpb24gKG5ld0tleSkge1xuICAgIHRoaXMucHJvcHMub25Nb3ZlKHRoaXMucHJvcHMuaXRlbUtleSwgbmV3S2V5KTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3Nlcyl9LFxuICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ29iamVjdC1pdGVtLWtleScsIHtmaWVsZDogZmllbGQsIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlS2V5LCBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvbiwgZGlzcGxheUtleTogdGhpcy5wcm9wcy5kaXNwbGF5S2V5LCBpdGVtS2V5OiB0aGlzLnByb3BzLml0ZW1LZXl9KSxcbiAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdvYmplY3QtaXRlbS12YWx1ZScsIHtmaWVsZDogZmllbGQsIG9uQ2hhbmdlOiB0aGlzLnByb3BzLm9uQ2hhbmdlLCBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvbiwgaXRlbUtleTogdGhpcy5wcm9wcy5pdGVtS2V5fSksXG4gICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgnb2JqZWN0LWl0ZW0tY29udHJvbCcsIHtmaWVsZDogZmllbGQsIG9uUmVtb3ZlOiB0aGlzLnByb3BzLm9uUmVtb3ZlLCBpdGVtS2V5OiB0aGlzLnByb3BzLml0ZW1LZXl9KVxuICAgICk7XG4gIH1cbn0pO1xuIiwiLy8gIyBwcmV0dHktc2VsZWN0LWlucHV0IGNvbXBvbmVudFxuXG4vKlxuICAgUmVuZGVyIGFuIGlucHV0IHRvIGJlIHVzZWQgYXMgdGhlIGVsZW1lbnQgZm9yIHR5cGluZyBhIGN1c3RvbSB2YWx1ZSBpbnRvIGEgcHJldHR5IHNlbGVjdC5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ1ByZXR0eVNlbGVjdElucHV0JyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICBmb2N1czogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucmVmcy50ZXh0Qm94LmZvY3VzKCk7XG4gIH0sXG5cbiAgc2V0Q2hvaWNlc09wZW46IGZ1bmN0aW9uIChpc09wZW5DaG9pY2VzKSB7XG4gICAgdGhpcy5yZWZzLnRleHRCb3guc2V0Q2hvaWNlc09wZW4oaXNPcGVuQ2hvaWNlcyk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IHRhYkluZGV4ID0gdGhpcy5pc1JlYWRPbmx5KCkgPyBudWxsIDogdGhpcy5wcm9wcy5maWVsZC50YWJJbmRleDtcblxuICAgIHJldHVybiB0aGlzLnByb3BzLmNvbmZpZy5jcmVhdGVFbGVtZW50KCdwcmV0dHktdGV4dC1pbnB1dCcsIHtcbiAgICAgIGNsYXNzZXM6IHRoaXMucHJvcHMuY2xhc3NlcyxcbiAgICAgIHRhYkluZGV4OiB0YWJJbmRleCxcbiAgICAgIG9uQ2hhbmdlOiB0aGlzLnByb3BzLm9uQ2hhbmdlLFxuICAgICAgb25Gb2N1czogdGhpcy5wcm9wcy5vbkZvY3VzLFxuICAgICAgb25CbHVyOiB0aGlzLnByb3BzLm9uQmx1cixcbiAgICAgIG9uQWN0aW9uOiB0aGlzLm9uQnViYmxlQWN0aW9uLFxuICAgICAgZmllbGQ6IHRoaXMucHJvcHMuZmllbGQsXG4gICAgICB2YWx1ZTogdGhpcy5wcm9wcy5pc0VudGVyaW5nQ3VzdG9tVmFsdWUgPyB0aGlzLnByb3BzLmZpZWxkLnZhbHVlIDogdGhpcy5wcm9wcy5nZXREaXNwbGF5VmFsdWUoKSxcbiAgICAgIHNlbGVjdGVkQ2hvaWNlczogdGhpcy5wcm9wcy5jb25maWcuZmllbGRTZWxlY3RlZFJlcGxhY2VDaG9pY2VzKHRoaXMucHJvcHMuZmllbGQpLFxuICAgICAgcmVwbGFjZUNob2ljZXM6IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkUmVwbGFjZUNob2ljZXModGhpcy5wcm9wcy5maWVsZCksXG4gICAgICBvblRhZ0NsaWNrOiB0aGlzLm9uVGFnQ2xpY2ssXG4gICAgICByZWY6ICd0ZXh0Qm94JyxcbiAgICAgIHJlYWRPbmx5OiAhdGhpcy5wcm9wcy5pc0VudGVyaW5nQ3VzdG9tVmFsdWUsXG4gICAgICBkaXNhYmxlZDogdGhpcy5pc1JlYWRPbmx5KClcbiAgICB9KTtcbiAgfVxuXG59KTtcbiIsIi8vICMgcHJldHR5LXNlbGVjdC12YWx1ZSBjb21wb25lbnRcblxuLypcbiAgIFJlbmRlciBhIHNlbGVjdCBkcm9wZG93biBmb3IgYSBsaXN0IG9mIGNob2ljZXMuIENob2ljZXMgdmFsdWVzIGNhbiBiZSBvZiBhbnlcbiAgIHR5cGUuIERvZXMgbm90IHVzZSBuYXRpdmUgc2VsZWN0IGRyb3Bkb3duLiBDaG9pY2VzIGNhbiBvcHRpb25hbGx5IGluY2x1ZGVcbiAgICdzYW1wbGUnIHByb3BlcnR5IGRpc3BsYXllZCBncmF5ZWQgb3V0LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgXyA9IHJlcXVpcmUoJy4uLy4uL3VuZGFzaCcpO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ1NlbGVjdFZhbHVlJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB2YXIgY2hvaWNlVmFsdWUgPSBldmVudC50YXJnZXQudmFsdWU7XG4gICAgdmFyIGNob2ljZVR5cGUgPSBjaG9pY2VWYWx1ZS5zdWJzdHJpbmcoMCwgY2hvaWNlVmFsdWUuaW5kZXhPZignOicpKTtcbiAgICBpZiAoY2hvaWNlVHlwZSA9PT0gJ2Nob2ljZScpIHtcbiAgICAgIHZhciBjaG9pY2VJbmRleCA9IGNob2ljZVZhbHVlLnN1YnN0cmluZyhjaG9pY2VWYWx1ZS5pbmRleE9mKCc6JykgKyAxKTtcbiAgICAgIGNob2ljZUluZGV4ID0gcGFyc2VJbnQoY2hvaWNlSW5kZXgpO1xuICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZSh0aGlzLnByb3BzLmNob2ljZXNbY2hvaWNlSW5kZXhdLnZhbHVlKTtcbiAgICB9XG4gIH0sXG5cbiAgb25DaGFuZ2VDdXN0b21WYWx1ZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBpbmZvKSB7XG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSwge1xuICAgICAgZmllbGQ6IGluZm8uZmllbGQsXG4gICAgICBpc0N1c3RvbVZhbHVlOiB0cnVlXG4gICAgfSk7XG4gIH0sXG5cbiAgLy8gSW50ZXJjZXB0IGN1c3RvbSB2YWx1ZSBmaWVsZCBldmVudHMgYW5kIHByZXRlbmQgbGlrZSB0aGlzIGZpZWxkIHNlbnQgdGhlbS5cbiAgb25DdXN0b21BY3Rpb246IGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgaW5mbyA9IF8uZXh0ZW5kKHt9LCBpbmZvLCB7ZmllbGQ6IHRoaXMucHJvcHMuZmllbGQsIGlzQ3VzdG9tVmFsdWU6IHRydWV9KTtcbiAgICB0aGlzLnByb3BzLm9uQWN0aW9uKGluZm8pO1xuICB9LFxuXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBjaG9pY2VzOiBbXVxuICAgIH07XG4gIH0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgY3VycmVudENob2ljZSA9IHRoaXMuY3VycmVudENob2ljZSh0aGlzLnByb3BzKTtcbiAgICB2YXIgaXNEZWZhdWx0VmFsdWUgPSB0aGlzLnByb3BzLmZpZWxkLnZhbHVlID09PSB0aGlzLnByb3BzLmNvbmZpZy5maWVsZFRlbXBsYXRlRGVmYXVsdFZhbHVlKHRoaXMucHJvcHMuZmllbGQpO1xuICAgIHJldHVybiB7XG4gICAgICBpc0Nob2ljZXNPcGVuOiB0aGlzLnByb3BzLmlzQ2hvaWNlc09wZW4sXG4gICAgICBpc0VudGVyaW5nQ3VzdG9tVmFsdWU6ICFpc0RlZmF1bHRWYWx1ZSAmJiAhY3VycmVudENob2ljZSAmJiB0aGlzLnByb3BzLmZpZWxkLnZhbHVlLFxuICAgICAgLy8gQ2FjaGluZyB0aGlzIGNhdXNlIGl0J3Mga2luZCBvZiBleHBlbnNpdmUuXG4gICAgICBjdXJyZW50Q2hvaWNlOiB0aGlzLmN1cnJlbnRDaG9pY2UodGhpcy5wcm9wcyksXG4gICAgICBjaG9pY2VzV2lkdGg6IG51bGxcbiAgICB9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV3UHJvcHMpIHtcbiAgICB2YXIgY3VycmVudENob2ljZSA9IHRoaXMuY3VycmVudENob2ljZShuZXdQcm9wcyk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjdXJyZW50Q2hvaWNlXG4gICAgfSk7XG5cbiAgICAvLyBXZSBvbmx5IHdhbnQgdG8gdXBkYXRlIHdoZW4gcHJvcHMgY2hhbmdlLCBub3QgZXZlcnkgYGNvbXBvbmVudERpZFVwZGF0ZWAuIChQcmV2ZW50cyBpbmZpbml0ZSB1cGRhdGUgbG9vcC4pXG4gICAgdGhpcy5zZXRTdGF0ZSh7fSwgKCkgPT4ge1xuICAgICAgdGhpcy51cGRhdGVDaG9pY2VzV2lkdGgoKTtcbiAgICB9KTtcbiAgfSxcblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICB0aGlzLnVwZGF0ZUNob2ljZXNXaWR0aCgpO1xuICB9LFxuXG4gIHVwZGF0ZUNob2ljZXNXaWR0aCgpIHtcbiAgICBjb25zdCBjb250YWluZXIgPSB0aGlzLnJlZnMuY29udGFpbmVyLmdldERPTU5vZGUoKTtcbiAgICBjb25zdCB3aWR0aCA9IGNvbnRhaW5lci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aDtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGNob2ljZXNXaWR0aDogd2lkdGhcbiAgICB9KTtcbiAgfSxcblxuICB2YWx1ZTogZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgcHJvcHMgPSBwcm9wcyB8fCB0aGlzLnByb3BzO1xuICAgIHJldHVybiBwcm9wcy5maWVsZC52YWx1ZSAhPT0gdW5kZWZpbmVkID8gcHJvcHMuZmllbGQudmFsdWUgOiAnJztcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IHtjb25maWcsIGZpZWxkfSA9IHRoaXMucHJvcHM7XG4gICAgdmFyIGNob2ljZXMgPSBjb25maWcubm9ybWFsaXplUHJldHR5Q2hvaWNlcyh0aGlzLnByb3BzLmNob2ljZXMpO1xuICAgIHZhciBjaG9pY2VzT3JMb2FkaW5nO1xuXG4gICAgaWYgKChjaG9pY2VzLmxlbmd0aCA+IDEgJiYgY2hvaWNlc1swXS52YWx1ZSA9PT0gJy8vL2xvYWRpbmcvLy8nKSB8fCBjb25maWcuZmllbGRJc0xvYWRpbmcoZmllbGQpKSB7XG4gICAgICBjaG9pY2VzID0gW3t2YWx1ZTogJy8vL2xvYWRpbmcvLy8nfV07XG4gICAgfVxuXG4gICAgbGV0IGNob2ljZXNFbGVtO1xuICAgIGlmICghdGhpcy5pc1JlYWRPbmx5KCkpIHtcbiAgICAgIGNob2ljZXNFbGVtID0gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2Nob2ljZXMnLCB7XG4gICAgICAgIHJlZjogJ2Nob2ljZXMnLFxuICAgICAgICBjaG9pY2VzOiBjaG9pY2VzLFxuICAgICAgICBvcGVuOiB0aGlzLnN0YXRlLmlzQ2hvaWNlc09wZW4sXG4gICAgICAgIGlnbm9yZUNsb3NlTm9kZXM6IHRoaXMuZ2V0Q2xvc2VJZ25vcmVOb2RlcyxcbiAgICAgICAgb25TZWxlY3Q6IHRoaXMub25TZWxlY3RDaG9pY2UsXG4gICAgICAgIG9uQ2xvc2U6IHRoaXMub25DbG9zZUNob2ljZXMsXG4gICAgICAgIG9uQ2hvaWNlQWN0aW9uOiB0aGlzLm9uQ2hvaWNlQWN0aW9uLFxuICAgICAgICB3aWR0aDogdGhpcy5zdGF0ZS5jaG9pY2VzV2lkdGgsXG4gICAgICAgIGZpZWxkXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB2YXIgaW5wdXRFbGVtID0gdGhpcy5nZXRJbnB1dEVsZW1lbnQoKTtcblxuICAgIGxldCBjdXN0b21GaWVsZEVsZW1lbnQgPSBudWxsO1xuICAgIGlmICh0aGlzLnN0YXRlLmlzRW50ZXJpbmdDdXN0b21WYWx1ZSAmJiB0aGlzLmhhc0N1c3RvbUZpZWxkKCkpIHtcbiAgICAgIGNvbnN0IGN1c3RvbUZpZWxkVGVtcGxhdGUgPSBjb25maWcuZmllbGRDdXN0b21GaWVsZFRlbXBsYXRlKGZpZWxkKTtcbiAgICAgIGNvbnN0IGN1c3RvbUZpZWxkID0gXy5leHRlbmQoe3R5cGU6ICdQcmV0dHlUZXh0J30sIHtcbiAgICAgICAga2V5OiBmaWVsZC5rZXksIHBhcmVudDogZmllbGQsIGZpZWxkSW5kZXg6IGZpZWxkLmZpZWxkSW5kZXgsXG4gICAgICAgIHJhd0ZpZWxkVGVtcGxhdGU6IGN1c3RvbUZpZWxkVGVtcGxhdGUsXG4gICAgICAgIHZhbHVlOiBmaWVsZC52YWx1ZVxuICAgICAgfSwgY3VzdG9tRmllbGRUZW1wbGF0ZSk7XG4gICAgICBjb25maWcuaW5pdEZpZWxkKGN1c3RvbUZpZWxkKTtcbiAgICAgIGN1c3RvbUZpZWxkRWxlbWVudCA9IGNvbmZpZy5jcmVhdGVGaWVsZEVsZW1lbnQoe1xuICAgICAgICBmaWVsZDogY3VzdG9tRmllbGQsXG4gICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlQ3VzdG9tVmFsdWUsIG9uQWN0aW9uOiB0aGlzLm9uQ3VzdG9tQWN0aW9uLFxuICAgICAgICByZWY6ICdjdXN0b21GaWVsZElucHV0J1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgbGV0IHNlbGVjdEFycm93O1xuICAgIGlmICghdGhpcy5pc1JlYWRPbmx5KCkpIHtcbiAgICAgIHNlbGVjdEFycm93ID0gPHNwYW4gY2xhc3NOYW1lPVwic2VsZWN0LWFycm93XCIgLz47XG4gICAgfVxuXG4gICAgY2hvaWNlc09yTG9hZGluZyA9IChcbiAgICAgIDxkaXYgcmVmPVwiY29udGFpbmVyXCJcbiAgICAgICAgICAgY2xhc3NOYW1lPXtjeChfLmV4dGVuZCh7fSwgdGhpcy5wcm9wcy5jbGFzc2VzLCB7J2Nob2ljZXMtb3Blbic6IHRoaXMuc3RhdGUuaXNDaG9pY2VzT3Blbn0pKX1cbiAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25DaGFuZ2V9PlxuICAgICAgICA8ZGl2IHJlZj1cInRvZ2dsZVwiIG9uQ2xpY2s9e3RoaXMuaXNSZWFkT25seSgpID8gbnVsbCA6IHRoaXMub25Ub2dnbGVDaG9pY2VzfT5cbiAgICAgICAgICB7aW5wdXRFbGVtfVxuICAgICAgICAgIHtzZWxlY3RBcnJvd31cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIHtjaG9pY2VzRWxlbX1cbiAgICAgICAgPHNwYW4+XG4gICAgICAgIHtjdXN0b21GaWVsZEVsZW1lbnR9XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG5cbiAgICByZXR1cm4gY2hvaWNlc09yTG9hZGluZztcbiAgfSxcblxuICBnZXRJbnB1dEVsZW1lbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5jb25maWcuY3JlYXRlRWxlbWVudCgncHJldHR5LXNlbGVjdC1pbnB1dCcsIHtcbiAgICAgIGZpZWxkOiB0aGlzLnByb3BzLmZpZWxkLFxuICAgICAgcmVmOiAnY3VzdG9tSW5wdXQnLFxuICAgICAgaXNFbnRlcmluZ0N1c3RvbVZhbHVlOiB0aGlzLnN0YXRlLmlzRW50ZXJpbmdDdXN0b21WYWx1ZSAmJiAhdGhpcy5oYXNDdXN0b21GaWVsZCgpLFxuICAgICAgb25DaGFuZ2U6IHRoaXMub25JbnB1dENoYW5nZSxcbiAgICAgIG9uRm9jdXM6IHRoaXMub25Gb2N1c0FjdGlvbixcbiAgICAgIG9uQmx1cjogdGhpcy5vbkJsdXIsXG4gICAgICBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvbixcbiAgICAgIGdldERpc3BsYXlWYWx1ZTogdGhpcy5nZXREaXNwbGF5VmFsdWVcbiAgICB9KTtcbiAgfSxcblxuICBibHVyTGF0ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBzZWxmLm9uQmx1ckFjdGlvbigpO1xuICAgIH0sIDApO1xuICB9LFxuXG4gIG9uQmx1cjogZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5zdGF0ZS5pc0Nob2ljZXNPcGVuKSB7XG4gICAgICB0aGlzLmJsdXJMYXRlcigpO1xuICAgIH1cbiAgfSxcblxuICBnZXRDbG9zZUlnbm9yZU5vZGVzOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVmcy50b2dnbGUuZ2V0RE9NTm9kZSgpO1xuICB9LFxuXG4gIG9uVG9nZ2xlQ2hvaWNlczogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc2V0Q2hvaWNlc09wZW4oIXRoaXMuc3RhdGUuaXNDaG9pY2VzT3Blbik7XG4gIH0sXG5cbiAgc2V0Q2hvaWNlc09wZW46IGZ1bmN0aW9uIChpc09wZW4pIHtcbiAgICB2YXIgYWN0aW9uID0gaXNPcGVuID8gJ29wZW4tY2hvaWNlcycgOiAnY2xvc2UtY2hvaWNlcyc7XG4gICAgdGhpcy5vblN0YXJ0QWN0aW9uKGFjdGlvbik7XG4gICAgdGhpcy5zZXRTdGF0ZSh7IGlzQ2hvaWNlc09wZW46IGlzT3BlbiB9KTtcbiAgfSxcblxuICBvblNlbGVjdENob2ljZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBpc0VudGVyaW5nQ3VzdG9tVmFsdWU6IGZhbHNlLFxuICAgICAgaXNDaG9pY2VzT3BlbjogZmFsc2VcbiAgICB9KTtcbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHZhbHVlKTtcbiAgICB0aGlzLmJsdXJMYXRlcigpO1xuICB9LFxuXG4gIG9uQ2xvc2VDaG9pY2VzOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUuaXNDaG9pY2VzT3Blbikge1xuICAgICAgdGhpcy5ibHVyTGF0ZXIoKTtcbiAgICAgIHRoaXMuc2V0Q2hvaWNlc09wZW4oZmFsc2UpO1xuICAgIH1cbiAgfSxcblxuICBjdXJyZW50Q2hvaWNlOiBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICBwcm9wcyA9IHByb3BzIHx8IHRoaXMucHJvcHM7XG4gICAgdmFyIHtjb25maWcsIGZpZWxkLCBjaG9pY2VzfSA9IHByb3BzO1xuICAgIHZhciBjdXJyZW50VmFsdWUgPSB0aGlzLnZhbHVlKHByb3BzKTtcbiAgICB2YXIgY3VycmVudENob2ljZSA9IGNvbmZpZy5maWVsZFNlbGVjdGVkQ2hvaWNlKGZpZWxkKTtcbiAgICAvLyBNYWtlIHN1cmUgc2VsZWN0ZWRDaG9pY2UgaXMgYSBtYXRjaCBmb3IgY3VycmVudCB2YWx1ZS5cbiAgICBpZiAoY3VycmVudENob2ljZSAmJiBjdXJyZW50Q2hvaWNlLnZhbHVlICE9PSBjdXJyZW50VmFsdWUpIHtcbiAgICAgIGN1cnJlbnRDaG9pY2UgPSBudWxsO1xuICAgIH1cbiAgICBpZiAoIWN1cnJlbnRDaG9pY2UpIHtcbiAgICAgIGN1cnJlbnRDaG9pY2UgPSBfLmZpbmQoY2hvaWNlcywgZnVuY3Rpb24gKGNob2ljZSkge1xuICAgICAgICByZXR1cm4gIWNob2ljZS5hY3Rpb24gJiYgY2hvaWNlLnZhbHVlID09PSBjdXJyZW50VmFsdWU7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGN1cnJlbnRDaG9pY2U7XG4gIH0sXG5cbiAgZ2V0RGlzcGxheVZhbHVlOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHtjdXJyZW50Q2hvaWNlfSA9IHRoaXMuc3RhdGU7XG4gICAgLy92YXIgY3VycmVudENob2ljZSA9IHRoaXMuY3VycmVudENob2ljZSgpO1xuICAgIHZhciBjdXJyZW50VmFsdWUgPSB0aGlzLnZhbHVlKCk7XG4gICAgdmFyIGlzRGVmYXVsdFZhbHVlID0gY3VycmVudFZhbHVlID09PSB0aGlzLnByb3BzLmNvbmZpZy5maWVsZFRlbXBsYXRlRGVmYXVsdFZhbHVlKHRoaXMucHJvcHMuZmllbGQpO1xuXG4gICAgaWYgKHRoaXMuc3RhdGUuaXNFbnRlcmluZ0N1c3RvbVZhbHVlIHx8ICghaXNEZWZhdWx0VmFsdWUgJiYgIWN1cnJlbnRDaG9pY2UgJiYgY3VycmVudFZhbHVlKSkge1xuICAgICAgaWYgKHRoaXMuaGFzQ3VzdG9tRmllbGQoKSkge1xuICAgICAgICBjb25zdCB7Y2hvaWNlc30gPSB0aGlzLnByb3BzO1xuICAgICAgICBjb25zdCBjdXN0b21DaG9pY2UgPSBfLmZpbmQoY2hvaWNlcywgY2hvaWNlID0+IGNob2ljZS5hY3Rpb24gPT09ICdlbnRlci1jdXN0b20tdmFsdWUnKTtcbiAgICAgICAgaWYgKGN1c3RvbUNob2ljZSAmJiBjdXN0b21DaG9pY2UubGFiZWwpIHtcbiAgICAgICAgICByZXR1cm4gY3VzdG9tQ2hvaWNlLmxhYmVsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gY3VycmVudFZhbHVlO1xuICAgIH1cblxuICAgIGlmIChjdXJyZW50Q2hvaWNlKSB7XG4gICAgICByZXR1cm4gY3VycmVudENob2ljZS5sYWJlbDtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGlzIGlzIHRoZSBkZWZhdWx0IHZhbHVlLCBhbmQgd2UgaGF2ZSBubyBjaG9pY2UgdG8gdXNlIGZvciB0aGUgbGFiZWwsIGp1c3QgdXNlIHRoZSB2YWx1ZS5cbiAgICBpZiAoaXNEZWZhdWx0VmFsdWUpIHtcbiAgICAgIHJldHVybiBjdXJyZW50VmFsdWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMucHJvcHMuY29uZmlnLmZpZWxkUGxhY2Vob2xkZXIodGhpcy5wcm9wcy5maWVsZCkgfHwgJyc7XG4gIH0sXG5cbiAgaGFzQ3VzdG9tRmllbGQoKSB7XG4gICAgcmV0dXJuICEhdGhpcy5wcm9wcy5jb25maWcuZmllbGRDdXN0b21GaWVsZFRlbXBsYXRlKHRoaXMucHJvcHMuZmllbGQpO1xuICB9LFxuXG4gIG9uQ2hvaWNlQWN0aW9uOiBmdW5jdGlvbiAoY2hvaWNlKSB7XG4gICAgaWYgKGNob2ljZS5hY3Rpb24gPT09ICdlbnRlci1jdXN0b20tdmFsdWUnKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgaXNFbnRlcmluZ0N1c3RvbVZhbHVlOiB0cnVlLFxuICAgICAgICBpc0Nob2ljZXNPcGVuOiBmYWxzZVxuICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5oYXNDdXN0b21GaWVsZCgpKSB7XG4gICAgICAgICAgdGhpcy5yZWZzLmN1c3RvbUZpZWxkSW5wdXQuZm9jdXMoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnJlZnMuY3VzdG9tSW5wdXQuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChjaG9pY2UuYWN0aW9uID09PSAnaW5zZXJ0LWZpZWxkJykge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGlzQ2hvaWNlc09wZW46IGZhbHNlXG4gICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMucmVmcy5jdXN0b21JbnB1dC5zZXRDaG9pY2VzT3Blbih0cnVlKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoY2hvaWNlLmFjdGlvbiA9PT0gJ2NsZWFyLWN1cnJlbnQtY2hvaWNlJykge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBpc0Nob2ljZXNPcGVuOiBmYWxzZSxcbiAgICAgICAgICBpc0VudGVyaW5nQ3VzdG9tVmFsdWU6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKCcnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIGlzQ2hvaWNlc09wZW46ICEhY2hvaWNlLmlzT3BlblxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLm9uU3RhcnRBY3Rpb24oY2hvaWNlLmFjdGlvbiwgY2hvaWNlKTtcbiAgfSxcblxuICAvLyBJcyB0aGlzIGV2ZW4gdXNlZD8gSSBkb24ndCB0aGluayBzby5cbiAgb25BY3Rpb246IGZ1bmN0aW9uIChwYXJhbXMpIHtcbiAgICBpZiAocGFyYW1zLmFjdGlvbiA9PT0gJ2VudGVyLWN1c3RvbS12YWx1ZScpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe2lzRW50ZXJpbmdDdXN0b21WYWx1ZTogdHJ1ZX0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5yZWZzLmN1c3RvbUlucHV0LmZvY3VzKCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgdGhpcy5vbkJ1YmJsZUFjdGlvbihwYXJhbXMpO1xuICB9LFxuXG4gIG9uSW5wdXRDaGFuZ2U6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UodmFsdWUpO1xuICB9XG59KTtcbiIsIi8vICMgcHJldHR5LXRhZyBjb21wb25lbnRcblxuLypcbiAgIFByZXR0eSB0ZXh0IHRhZ1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgXyA9IHJlcXVpcmUoJy4uLy4uL3VuZGFzaCcpO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ1ByZXR0eVRhZycsXG5cbiAgcHJvcFR5cGVzOiB7XG4gICAgb25DbGljazogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG4gICAgY2xhc3NlczogUmVhY3QuUHJvcFR5cGVzLm9iamVjdFxuICB9LFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2xhc3NlcyA9IGN4KF8uZXh0ZW5kKHt9LCB0aGlzLnByb3BzLmNsYXNzZXMsIHsncHJldHR5LXBhcnQnOiB0cnVlfSkpO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxzcGFuIGNsYXNzTmFtZT17Y2xhc3Nlc30gb25DbGljaz17dGhpcy5wcm9wcy5vbkNsaWNrfT5cbiAgICAgICAge3RoaXMucHJvcHMuY2hpbGRyZW59XG4gICAgICA8L3NwYW4+XG4gICAgKTtcbiAgfVxufSk7XG4iLCIndXNlIHN0cmljdCc7XG4vKiBnbG9iYWwgQ29kZU1pcnJvciAqL1xuLyplc2xpbnQgbm8tc2NyaXB0LXVybDowICovXG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFRhZ1RyYW5zbGF0b3IgPSByZXF1aXJlKCcuL3RhZy10cmFuc2xhdG9yJyk7XG52YXIgXyA9IHJlcXVpcmUoJy4uLy4uL3VuZGFzaCcpO1xudmFyIGN4ID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG52YXIgdG9TdHJpbmcgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgaWYgKF8uaXNVbmRlZmluZWQodmFsdWUpIHx8IF8uaXNOdWxsKHZhbHVlKSkge1xuICAgIHJldHVybiAnJztcbiAgfVxuICByZXR1cm4gU3RyaW5nKHZhbHVlKTtcbn07XG5cbi8qXG4gICBFZGl0b3IgZm9yIHRhZ2dlZCB0ZXh0LiBSZW5kZXJzIHRleHQgbGlrZSBcImhlbGxvIHt7Zmlyc3ROYW1lfX1cIlxuICAgd2l0aCByZXBsYWNlbWVudCBsYWJlbHMgcmVuZGVyZWQgaW4gYSBwaWxsIGJveC4gRGVzaWduZWQgdG8gbG9hZFxuICAgcXVpY2tseSB3aGVuIG1hbnkgc2VwYXJhdGUgaW5zdGFuY2VzIG9mIGl0IGFyZSBvbiB0aGUgc2FtZVxuICAgcGFnZS5cblxuICAgVXNlcyBDb2RlTWlycm9yIHRvIGVkaXQgdGV4dC4gVG8gc2F2ZSBtZW1vcnkgdGhlIENvZGVNaXJyb3Igbm9kZSBpc1xuICAgaW5zdGFudGlhdGVkIHdoZW4gdGhlIHVzZXIgbW92ZXMgdGhlIG1vdXNlIGludG8gdGhlIGVkaXQgYXJlYS5cbiAgIEluaXRpYWxseSBhIHJlYWQtb25seSB2aWV3IHVzaW5nIGEgc2ltcGxlIGRpdiBpcyBzaG93bi5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdQcmV0dHlUZXh0SW5wdXQnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY3JlYXRlRWRpdG9yKCk7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkVXBkYXRlOiBmdW5jdGlvbihwcmV2UHJvcHMsIHByZXZTdGF0ZSkge1xuICAgIGlmIChwcmV2U3RhdGUuY29kZU1pcnJvck1vZGUgIT09IHRoaXMuc3RhdGUuY29kZU1pcnJvck1vZGUpIHtcbiAgICAgIC8vIENoYW5nZWQgZnJvbSBjb2RlIG1pcnJvciBtb2RlIHRvIHJlYWQgb25seSBtb2RlIG9yIHZpY2UgdmVyc2EsXG4gICAgICAvLyBzbyBzZXR1cCB0aGUgb3RoZXIgZWRpdG9yLlxuICAgICAgdGhpcy5jcmVhdGVFZGl0b3IoKTtcbiAgICB9XG4gICAgdGhpcy51cGRhdGVFZGl0b3IoKTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUuY29kZU1pcnJvck1vZGUpIHtcbiAgICAgIHRoaXMucmVtb3ZlQ29kZU1pcnJvckVkaXRvcigpO1xuICAgIH1cbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxlY3RlZENob2ljZXMgPSB0aGlzLnByb3BzLnNlbGVjdGVkQ2hvaWNlcztcbiAgICB2YXIgcmVwbGFjZUNob2ljZXMgPSB0aGlzLnByb3BzLnJlcGxhY2VDaG9pY2VzO1xuICAgIHZhciB0cmFuc2xhdG9yID0gVGFnVHJhbnNsYXRvcihzZWxlY3RlZENob2ljZXMuY29uY2F0KHJlcGxhY2VDaG9pY2VzKSwgdGhpcy5wcm9wcy5jb25maWcuaHVtYW5pemUpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIFdpdGggbnVtYmVyIHZhbHVlcywgb25Gb2N1cyBuZXZlciBmaXJlcywgd2hpY2ggbWVhbnMgaXQgc3RheXMgcmVhZC1vbmx5LiBTbyBjb252ZXJ0IHRvIHN0cmluZy5cbiAgICAgIHZhbHVlOiB0b1N0cmluZyh0aGlzLnByb3BzLnZhbHVlKSxcbiAgICAgIGNvZGVNaXJyb3JNb2RlOiBmYWxzZSxcbiAgICAgIGlzQ2hvaWNlc09wZW46IGZhbHNlLFxuICAgICAgcmVwbGFjZUNob2ljZXM6IHJlcGxhY2VDaG9pY2VzLFxuICAgICAgdHJhbnNsYXRvcjogdHJhbnNsYXRvclxuICAgIH07XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24obmV4dFByb3BzKSB7XG4gICAgdmFyIHNlbGVjdGVkQ2hvaWNlcyA9IG5leHRQcm9wcy5zZWxlY3RlZENob2ljZXM7XG4gICAgdmFyIHJlcGxhY2VDaG9pY2VzID0gbmV4dFByb3BzLnJlcGxhY2VDaG9pY2VzO1xuICAgIHZhciBuZXh0U3RhdGUgPSB7XG4gICAgICByZXBsYWNlQ2hvaWNlczogcmVwbGFjZUNob2ljZXMsXG4gICAgICB0cmFuc2xhdG9yOiBUYWdUcmFuc2xhdG9yKHNlbGVjdGVkQ2hvaWNlcy5jb25jYXQocmVwbGFjZUNob2ljZXMpLCB0aGlzLnByb3BzLmNvbmZpZy5odW1hbml6ZSlcbiAgICB9O1xuXG4gICAgLy8gTm90IHN1cmUgd2hhdCB0aGUgbnVsbC91bmRlZmluZWQgY2hlY2tzIGFyZSBoZXJlIGZvciwgYnV0IGNoYW5nZWQgZnJvbSBmYWxzZXkgd2hpY2ggd2FzIGJyZWFraW5nLlxuICAgIGlmICh0aGlzLnN0YXRlLnZhbHVlICE9PSBuZXh0UHJvcHMudmFsdWUgJiYgIV8uaXNVbmRlZmluZWQobmV4dFByb3BzLnZhbHVlKSAmJiBuZXh0UHJvcHMudmFsdWUgIT09IG51bGwpIHtcbiAgICAgIG5leHRTdGF0ZS52YWx1ZSA9IHRvU3RyaW5nKG5leHRQcm9wcy52YWx1ZSk7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZShuZXh0U3RhdGUpO1xuICB9LFxuXG4gIGhhbmRsZUNob2ljZVNlbGVjdGlvbjogZnVuY3Rpb24gKGtleSwgZXZlbnQpIHtcbiAgICBjb25zdCBzZWxlY3RDaG9pY2UgPSAoKSA9PiB7XG4gICAgICB2YXIgcG9zID0gdGhpcy5zdGF0ZS5zZWxlY3RlZFRhZ1BvcztcbiAgICAgIHZhciB0YWcgPSAne3snICsga2V5ICsgJ319JztcblxuICAgICAgaWYgKHBvcykge1xuICAgICAgICB0aGlzLmNvZGVNaXJyb3IucmVwbGFjZVJhbmdlKHRhZywge2xpbmU6IHBvcy5saW5lLCBjaDogcG9zLnN0YXJ0fSwge2xpbmU6IHBvcy5saW5lLCBjaDogcG9zLnN0b3B9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY29kZU1pcnJvci5yZXBsYWNlU2VsZWN0aW9uKHRhZywgJ2VuZCcpO1xuICAgICAgfVxuICAgICAgdGhpcy5jb2RlTWlycm9yLmZvY3VzKCk7XG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBpc0Nob2ljZXNPcGVuOiBmYWxzZSwgc2VsZWN0ZWRUYWdQb3M6IG51bGwgfSk7XG4gICAgfTtcbiAgICBpZiAodGhpcy5zdGF0ZS5jb2RlTWlycm9yTW9kZSkge1xuICAgICAgc2VsZWN0Q2hvaWNlKCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLnJlYWRPbmx5KSB7XG4gICAgICAvLyBoYWNrZXR5IGhhY2sgdG8gc3RvcCBkcm9wZG93biBjaG9pY2VzIGZyb20gdG9nZ2xpbmdcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZSgne3snICsga2V5ICsgJ319Jyk7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgaXNDaG9pY2VzT3BlbjogZmFsc2UgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc3dpdGNoVG9Db2RlTWlycm9yKHNlbGVjdENob2ljZSk7XG4gICAgfVxuICB9LFxuXG4gIGZvY3VzOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zd2l0Y2hUb0NvZGVNaXJyb3IoKCkgPT4ge1xuICAgICAgdGhpcy5jb2RlTWlycm9yLmZvY3VzKCk7XG4gICAgICB0aGlzLmNvZGVNaXJyb3Iuc2V0Q3Vyc29yKHRoaXMuY29kZU1pcnJvci5saW5lQ291bnQoKSwgMCk7XG4gICAgfSk7XG4gIH0sXG5cbiAgaW5zZXJ0QnRuOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuaXNSZWFkT25seSgpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgb25JbnNlcnRDbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGVkVGFnUG9zOiBudWxsfSk7XG4gICAgICB0aGlzLm9uVG9nZ2xlQ2hvaWNlcygpO1xuICAgIH07XG5cbiAgICByZXR1cm4gdGhpcy5wcm9wcy5jb25maWcuY3JlYXRlRWxlbWVudCgnaW5zZXJ0LWJ1dHRvbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3JlZjogJ3RvZ2dsZScsIG9uQ2xpY2s6IG9uSW5zZXJ0Q2xpY2suYmluZCh0aGlzKX0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0luc2VydC4uLicpO1xuICB9LFxuXG4gIGNob2ljZXM6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5pc1JlYWRPbmx5KCkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnByb3BzLmNvbmZpZy5jcmVhdGVFbGVtZW50KCdjaG9pY2VzJywge1xuICAgICAgcmVmOiAnY2hvaWNlcycsXG4gICAgICBjaG9pY2VzOiB0aGlzLnN0YXRlLnJlcGxhY2VDaG9pY2VzLFxuICAgICAgb3BlbjogdGhpcy5zdGF0ZS5pc0Nob2ljZXNPcGVuLFxuICAgICAgaWdub3JlQ2xvc2VOb2RlczogdGhpcy5nZXRDbG9zZUlnbm9yZU5vZGVzLFxuICAgICAgb25TZWxlY3Q6IHRoaXMuaGFuZGxlQ2hvaWNlU2VsZWN0aW9uLFxuICAgICAgb25DbG9zZTogdGhpcy5vbkNsb3NlQ2hvaWNlcyxcbiAgICAgIGlzQWNjb3JkaW9uOiB0aGlzLnByb3BzLmlzQWNjb3JkaW9uLFxuICAgICAgZmllbGQ6IHRoaXMucHJvcHMuZmllbGQsXG4gICAgICBvbkNob2ljZUFjdGlvbjogdGhpcy5vbkNob2ljZUFjdGlvblxuICAgIH0pO1xuICB9LFxuXG4gIG9uQ2hvaWNlQWN0aW9uOiBmdW5jdGlvbiAoY2hvaWNlKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBpc0Nob2ljZXNPcGVuOiAhIWNob2ljZS5pc09wZW5cbiAgICB9KTtcbiAgICB0aGlzLm9uU3RhcnRBY3Rpb24oY2hvaWNlLmFjdGlvbiwgY2hvaWNlKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRleHRCb3hDbGFzc2VzID0gY3goXy5leHRlbmQoe30sIHRoaXMucHJvcHMuY2xhc3NlcywgeydwcmV0dHktdGV4dC1ib3gnOiB0cnVlfSkpO1xuXG4gICAgLy8gUmVuZGVyIHJlYWQtb25seSB2ZXJzaW9uLlxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT17Y3goeydwcmV0dHktdGV4dC13cmFwcGVyJzogdHJ1ZSwgJ2Nob2ljZXMtb3Blbic6IHRoaXMuc3RhdGUuaXNDaG9pY2VzT3Blbn0pfSBvbk1vdXNlRW50ZXI9e3RoaXMuc3dpdGNoVG9Db2RlTWlycm9yfT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e3RleHRCb3hDbGFzc2VzfSB0YWJJbmRleD17dGhpcy5wcm9wcy50YWJJbmRleH0gb25Gb2N1cz17dGhpcy5wcm9wcy5vbkZvY3VzfSBvbkJsdXI9e3RoaXMucHJvcHMub25CbHVyfT5cbiAgICAgICAgICA8ZGl2IHJlZj0ndGV4dEJveCcgY2xhc3NOYW1lPSdpbnRlcm5hbC10ZXh0LXdyYXBwZXInIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICB7dGhpcy5pbnNlcnRCdG4oKX1cbiAgICAgICAge3RoaXMuY2hvaWNlcygpfVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfSxcblxuICBnZXRDbG9zZUlnbm9yZU5vZGVzOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVmcy50b2dnbGUuZ2V0RE9NTm9kZSgpO1xuICB9LFxuXG4gIG9uVG9nZ2xlQ2hvaWNlczogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc2V0Q2hvaWNlc09wZW4oIXRoaXMuc3RhdGUuaXNDaG9pY2VzT3Blbik7XG4gIH0sXG5cbiAgc2V0Q2hvaWNlc09wZW46IGZ1bmN0aW9uIChpc09wZW4pIHtcbiAgICB2YXIgYWN0aW9uID0gaXNPcGVuID8gJ29wZW4tcmVwbGFjZW1lbnRzJyA6ICdjbG9zZS1yZXBsYWNlbWVudHMnO1xuICAgIHRoaXMub25TdGFydEFjdGlvbihhY3Rpb24pO1xuICAgIHRoaXMuc2V0U3RhdGUoeyBpc0Nob2ljZXNPcGVuOiBpc09wZW4gfSk7XG4gIH0sXG5cbiAgb25DbG9zZUNob2ljZXM6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5pc0Nob2ljZXNPcGVuKSB7XG4gICAgICB0aGlzLnNldENob2ljZXNPcGVuKGZhbHNlKTtcbiAgICB9XG4gIH0sXG5cbiAgY3JlYXRlRWRpdG9yOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUuY29kZU1pcnJvck1vZGUpIHtcbiAgICAgIHRoaXMuY3JlYXRlQ29kZU1pcnJvckVkaXRvcigpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNyZWF0ZVJlYWRvbmx5RWRpdG9yKCk7XG4gICAgfVxuICB9LFxuXG4gIHVwZGF0ZUVkaXRvcjogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnN0YXRlLmNvZGVNaXJyb3JNb2RlKSB7XG4gICAgICB2YXIgY29kZU1pcnJvclZhbHVlID0gdGhpcy5jb2RlTWlycm9yLmdldFZhbHVlKCk7XG4gICAgICBpZiAoY29kZU1pcnJvclZhbHVlICE9PSB0aGlzLnN0YXRlLnZhbHVlKSB7XG4gICAgICAgIC8vIHN3aXRjaCBiYWNrIHRvIHJlYWQtb25seSBtb2RlIHRvIG1ha2UgaXQgZWFzaWVyIHRvIHJlbmRlclxuICAgICAgICB0aGlzLnJlbW92ZUNvZGVNaXJyb3JFZGl0b3IoKTtcbiAgICAgICAgdGhpcy5jcmVhdGVSZWFkb25seUVkaXRvcigpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBjb2RlTWlycm9yTW9kZTogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY3JlYXRlUmVhZG9ubHlFZGl0b3IoKTtcbiAgICB9XG4gIH0sXG5cbiAgY3JlYXRlQ29kZU1pcnJvckVkaXRvcjogZnVuY3Rpb24gKCkge1xuICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgbGluZVdyYXBwaW5nOiB0cnVlLFxuICAgICAgdGFiaW5kZXg6IHRoaXMucHJvcHMudGFiSW5kZXgsXG4gICAgICB2YWx1ZTogU3RyaW5nKHRoaXMuc3RhdGUudmFsdWUpLFxuICAgICAgbW9kZTogbnVsbCxcbiAgICAgIGV4dHJhS2V5czoge1xuICAgICAgICBUYWI6IGZhbHNlXG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciB0ZXh0Qm94ID0gdGhpcy5yZWZzLnRleHRCb3guZ2V0RE9NTm9kZSgpO1xuICAgIHRleHRCb3guaW5uZXJIVE1MID0gJyc7IC8vIHJlbGVhc2UgYW55IHByZXZpb3VzIHJlYWQtb25seSBjb250ZW50IHNvIGl0IGNhbiBiZSBHQydlZFxuXG4gICAgdGhpcy5jb2RlTWlycm9yID0gQ29kZU1pcnJvcih0ZXh0Qm94LCBvcHRpb25zKTtcbiAgICB0aGlzLmNvZGVNaXJyb3Iub24oJ2NoYW5nZScsIHRoaXMub25Db2RlTWlycm9yQ2hhbmdlKTtcblxuICAgIHRoaXMudGFnQ29kZU1pcnJvcigpO1xuICB9LFxuXG4gIHRhZ0NvZGVNaXJyb3I6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcG9zaXRpb25zID0gdGhpcy5zdGF0ZS50cmFuc2xhdG9yLmdldFRhZ1Bvc2l0aW9ucyh0aGlzLmNvZGVNaXJyb3IuZ2V0VmFsdWUoKSk7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIHRhZ09wcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHBvc2l0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChwb3MpIHtcbiAgICAgICAgdmFyIG5vZGUgPSBzZWxmLmNyZWF0ZVRhZ05vZGUocG9zKTtcbiAgICAgICAgc2VsZi5jb2RlTWlycm9yLm1hcmtUZXh0KHtsaW5lOiBwb3MubGluZSwgY2g6IHBvcy5zdGFydH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7bGluZTogcG9zLmxpbmUsIGNoOiBwb3Muc3RvcH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cmVwbGFjZWRXaXRoOiBub2RlLCBoYW5kbGVNb3VzZUV2ZW50czogdHJ1ZX0pO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHRoaXMuY29kZU1pcnJvci5vcGVyYXRpb24odGFnT3BzKTtcbiAgfSxcblxuICBvbkNvZGVNaXJyb3JDaGFuZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy51cGRhdGluZ0NvZGVNaXJyb3IpIHtcbiAgICAgIC8vIGF2b2lkIHJlY3Vyc2l2ZSB1cGRhdGUgY3ljbGUsIGFuZCBtYXJrIHRoZSBjb2RlIG1pcnJvciBtYW51YWwgdXBkYXRlIGFzIGRvbmVcbiAgICAgIHRoaXMudXBkYXRpbmdDb2RlTWlycm9yID0gZmFsc2U7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIG5ld1ZhbHVlID0gdGhpcy5jb2RlTWlycm9yLmdldFZhbHVlKCk7XG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7dmFsdWU6IG5ld1ZhbHVlfSk7XG4gICAgdGhpcy50YWdDb2RlTWlycm9yKCk7XG4gIH0sXG5cbiAgY3JlYXRlUmVhZG9ubHlFZGl0b3I6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGV4dEJveE5vZGUgPSB0aGlzLnJlZnMudGV4dEJveC5nZXRET01Ob2RlKCk7XG5cbiAgICB2YXIgdG9rZW5zID0gdGhpcy5zdGF0ZS50cmFuc2xhdG9yLnRva2VuaXplKHRoaXMuc3RhdGUudmFsdWUpO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgbm9kZXMgPSB0b2tlbnMubWFwKGZ1bmN0aW9uIChwYXJ0LCBpKSB7XG4gICAgICBpZiAocGFydC50eXBlID09PSAndGFnJykge1xuICAgICAgICB2YXIgbGFiZWwgPSBzZWxmLnN0YXRlLnRyYW5zbGF0b3IuZ2V0TGFiZWwocGFydC52YWx1ZSk7XG4gICAgICAgIHZhciBwcm9wcyA9IHtrZXk6IGksIHRhZzogcGFydC52YWx1ZSwgcmVwbGFjZUNob2ljZXM6IHNlbGYuc3RhdGUucmVwbGFjZUNob2ljZXMsIGZpZWxkOiBzZWxmLnByb3BzLmZpZWxkfTtcbiAgICAgICAgcmV0dXJuIHNlbGYucHJvcHMuY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ3ByZXR0eS10YWcnLCBwcm9wcywgbGFiZWwpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIDxzcGFuIGtleT17aX0+e3BhcnQudmFsdWV9PC9zcGFuPjtcbiAgICB9KTtcblxuICAgIFJlYWN0LnJlbmRlcig8c3Bhbj57bm9kZXN9PC9zcGFuPiwgdGV4dEJveE5vZGUpO1xuICB9LFxuXG4gIHJlbW92ZUNvZGVNaXJyb3JFZGl0b3I6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGV4dEJveE5vZGUgPSB0aGlzLnJlZnMudGV4dEJveC5nZXRET01Ob2RlKCk7XG4gICAgdmFyIGNtTm9kZSA9IHRleHRCb3hOb2RlLmZpcnN0Q2hpbGQ7XG4gICAgdGV4dEJveE5vZGUucmVtb3ZlQ2hpbGQoY21Ob2RlKTtcbiAgICB0aGlzLmNvZGVNaXJyb3IgPSBudWxsO1xuICB9LFxuXG4gIHN3aXRjaFRvQ29kZU1pcnJvcjogZnVuY3Rpb24gKGNiKSB7XG4gICAgaWYgKHRoaXMuaXNSZWFkT25seSgpKSB7XG4gICAgICByZXR1cm47IC8vIG5ldmVyIHJlbmRlciBpbiBjb2RlIG1pcnJvciBpZiByZWFkLW9ubHlcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuc3RhdGUuY29kZU1pcnJvck1vZGUgJiYgIXRoaXMucHJvcHMucmVhZE9ubHkpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe2NvZGVNaXJyb3JNb2RlOiB0cnVlfSwgKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5jb2RlTWlycm9yICYmIF8uaXNGdW5jdGlvbihjYikpIHtcbiAgICAgICAgICBjYigpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cbiAgb25UYWdDbGljazogZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IGN1cnNvciA9IHRoaXMuY29kZU1pcnJvci5nZXRDdXJzb3IoKTtcbiAgICBjb25zdCBwb3MgPSB0aGlzLnN0YXRlLnRyYW5zbGF0b3IuZ2V0VHJ1ZVRhZ1Bvc2l0aW9uKHRoaXMuc3RhdGUudmFsdWUsIGN1cnNvcik7XG5cbiAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3RlZFRhZ1BvczogcG9zfSk7XG4gICAgdGhpcy5vblRvZ2dsZUNob2ljZXMoKTtcbiAgfSxcblxuICBjcmVhdGVUYWdOb2RlOiBmdW5jdGlvbiAocG9zKSB7XG4gICAgdmFyIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgdmFyIGxhYmVsID0gdGhpcy5zdGF0ZS50cmFuc2xhdG9yLmdldExhYmVsKHBvcy50YWcpO1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblxuICAgIHZhciBwcm9wcyA9IHtvbkNsaWNrOiB0aGlzLm9uVGFnQ2xpY2ssIGZpZWxkOiB0aGlzLnByb3BzLmZpZWxkLCB0YWc6IHBvcy50YWd9O1xuXG4gICAgUmVhY3QucmVuZGVyKFxuICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ3ByZXR0eS10YWcnLCBwcm9wcywgbGFiZWwpLFxuICAgICAgbm9kZVxuICAgICk7XG5cbiAgICByZXR1cm4gbm9kZTtcbiAgfVxufSk7XG4iLCIvLyAjIHJlbW92ZS1pdGVtIGNvbXBvbmVudFxuXG4vKlxuUmVtb3ZlIGFuIGl0ZW0uXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnUmVtb3ZlSXRlbScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGFiZWw6ICdbcmVtb3ZlXSdcbiAgICB9O1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICBvbk1vdXNlT3ZlclJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnByb3BzLm9uTWF5YmVSZW1vdmUpIHtcbiAgICAgIHRoaXMucHJvcHMub25NYXliZVJlbW92ZSh0cnVlKTtcbiAgICB9XG4gIH0sXG5cbiAgb25Nb3VzZU91dFJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnByb3BzLm9uTWF5YmVSZW1vdmUpIHtcbiAgICAgIHRoaXMucHJvcHMub25NYXliZVJlbW92ZShmYWxzZSk7XG4gICAgfVxuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUi5zcGFuKHtcbiAgICAgIGNsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSwgb25DbGljazogdGhpcy5wcm9wcy5vbkNsaWNrLFxuICAgICAgb25Nb3VzZU92ZXI6IHRoaXMub25Nb3VzZU92ZXJSZW1vdmUsIG9uTW91c2VPdXQ6IHRoaXMub25Nb3VzZU91dFJlbW92ZVxuICAgIH0sIHRoaXMucHJvcHMubGFiZWwpO1xuICB9XG59KTtcbiIsIi8vICMgaGVscCBjb21wb25lbnRcblxuLypcbkp1c3QgdGhlIGhlbHAgdGV4dCBibG9jay5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdTYW1wbGUnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjaG9pY2UgPSB0aGlzLnByb3BzLmNob2ljZTtcblxuICAgIHJldHVybiBjaG9pY2Uuc2FtcGxlID9cbiAgICAgIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NOYW1lKX0sXG4gICAgICAgIGNob2ljZS5zYW1wbGVcbiAgICAgICkgOlxuICAgICAgUi5zcGFuKG51bGwpO1xuICB9XG59KTtcbiIsIi8vICMgc2VsZWN0LXZhbHVlIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIGEgc2VsZWN0IGRyb3Bkb3duIGZvciBhIGxpc3Qgb2YgY2hvaWNlcy4gQ2hvaWNlcyB2YWx1ZXMgY2FuIGJlIG9mIGFueVxudHlwZS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBfID0gcmVxdWlyZSgnLi4vLi4vdW5kYXNoJyk7XG52YXIgY3ggPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnU2VsZWN0VmFsdWUnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHZhciBjaG9pY2VWYWx1ZSA9IGV2ZW50LnRhcmdldC52YWx1ZTtcbiAgICB2YXIgY2hvaWNlVHlwZSA9IGNob2ljZVZhbHVlLnN1YnN0cmluZygwLCBjaG9pY2VWYWx1ZS5pbmRleE9mKCc6JykpO1xuICAgIGlmIChjaG9pY2VUeXBlID09PSAnY2hvaWNlJykge1xuICAgICAgdmFyIGNob2ljZUluZGV4ID0gY2hvaWNlVmFsdWUuc3Vic3RyaW5nKGNob2ljZVZhbHVlLmluZGV4T2YoJzonKSArIDEpO1xuICAgICAgY2hvaWNlSW5kZXggPSBwYXJzZUludChjaG9pY2VJbmRleCk7XG4gICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHRoaXMucHJvcHMuY2hvaWNlc1tjaG9pY2VJbmRleF0udmFsdWUpO1xuICAgIH1cbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgY2hvaWNlcyA9IHRoaXMucHJvcHMuY2hvaWNlcyB8fCBbXTtcblxuICAgIHZhciBjaG9pY2VzT3JMb2FkaW5nO1xuXG4gICAgaWYgKChjaG9pY2VzLmxlbmd0aCA9PT0gMSAmJiBjaG9pY2VzWzBdLnZhbHVlID09PSAnLy8vbG9hZGluZy8vLycpIHx8IGNvbmZpZy5maWVsZElzTG9hZGluZyh0aGlzLnByb3BzLmZpZWxkKSkge1xuICAgICAgY2hvaWNlc09yTG9hZGluZyA9IGNvbmZpZy5jcmVhdGVFbGVtZW50KCdsb2FkaW5nLWNob2ljZXMnLCB7fSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB2YWx1ZSA9IHRoaXMucHJvcHMuZmllbGQudmFsdWUgIT09IHVuZGVmaW5lZCA/IHRoaXMucHJvcHMuZmllbGQudmFsdWUgOiAnJztcblxuICAgICAgY2hvaWNlcyA9IGNob2ljZXMubWFwKGZ1bmN0aW9uIChjaG9pY2UsIGkpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBjaG9pY2VWYWx1ZTogJ2Nob2ljZTonICsgaSxcbiAgICAgICAgICB2YWx1ZTogY2hvaWNlLnZhbHVlLFxuICAgICAgICAgIGxhYmVsOiBjaG9pY2UubGFiZWxcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgdmFsdWVDaG9pY2UgPSBfLmZpbmQoY2hvaWNlcywgZnVuY3Rpb24gKGNob2ljZSkge1xuICAgICAgICByZXR1cm4gY2hvaWNlLnZhbHVlID09PSB2YWx1ZTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAodmFsdWVDaG9pY2UgPT09IHVuZGVmaW5lZCkge1xuXG4gICAgICAgIHZhciBsYWJlbCA9IHZhbHVlO1xuICAgICAgICBpZiAoIV8uaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgICAgICAgbGFiZWwgPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFsdWVDaG9pY2UgPSB7XG4gICAgICAgICAgY2hvaWNlVmFsdWU6ICd2YWx1ZTonLFxuICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICBsYWJlbDogbGFiZWxcbiAgICAgICAgfTtcbiAgICAgICAgY2hvaWNlcyA9IFt2YWx1ZUNob2ljZV0uY29uY2F0KGNob2ljZXMpO1xuICAgICAgfVxuXG4gICAgICBjaG9pY2VzT3JMb2FkaW5nID0gUi5zZWxlY3Qoe1xuICAgICAgICBjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcyksXG4gICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgICB2YWx1ZTogdmFsdWVDaG9pY2UuY2hvaWNlVmFsdWUsXG4gICAgICAgIG9uRm9jdXM6IHRoaXMub25Gb2N1c0FjdGlvbixcbiAgICAgICAgb25CbHVyOiB0aGlzLm9uQmx1ckFjdGlvbixcbiAgICAgICAgZGlzYWJsZWQ6IHRoaXMuaXNSZWFkT25seSgpXG4gICAgICB9LFxuICAgICAgY2hvaWNlcy5tYXAoZnVuY3Rpb24gKGNob2ljZSwgaSkge1xuICAgICAgICByZXR1cm4gUi5vcHRpb24oe1xuICAgICAgICAgIGtleTogaSxcbiAgICAgICAgICB2YWx1ZTogY2hvaWNlLmNob2ljZVZhbHVlXG4gICAgICAgIH0sIGNob2ljZS5sYWJlbCk7XG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICByZXR1cm4gY2hvaWNlc09yTG9hZGluZztcbn1cbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIF8gPSByZXF1aXJlKCcuLi8uLi91bmRhc2gnKTtcblxuY29uc3QgYnVpbGRDaG9pY2VzTWFwID0gKHJlcGxhY2VDaG9pY2VzKSA9PiB7XG4gIHZhciBjaG9pY2VzID0ge307XG4gIHJlcGxhY2VDaG9pY2VzLmZvckVhY2goZnVuY3Rpb24gKGNob2ljZSkge1xuICAgIHZhciBrZXkgPSBjaG9pY2UudmFsdWU7XG4gICAgY2hvaWNlc1trZXldID0gY2hvaWNlLmxhYmVsO1xuICB9KTtcbiAgcmV0dXJuIGNob2ljZXM7XG59O1xuXG5jb25zdCBnZXRUYWdQb3NpdGlvbnMgPSAodGV4dCkgPT4ge1xuICB2YXIgbGluZXMgPSB0ZXh0LnNwbGl0KCdcXG4nKTtcbiAgdmFyIHJlID0gL1xce1xcey4rP1xcfVxcfS9nO1xuICB2YXIgcG9zaXRpb25zID0gW107XG4gIHZhciBtO1xuXG4gIGZvcih2YXIgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgIHdoaWxlICgobSA9IHJlLmV4ZWMobGluZXNbaV0pKSAhPT0gbnVsbCkge1xuICAgICAgdmFyIHRhZyA9IG1bMF0uc3Vic3RyaW5nKDIsIG1bMF0ubGVuZ3RoLTIpO1xuICAgICAgcG9zaXRpb25zLnB1c2goe1xuICAgICAgICBsaW5lOiBpLFxuICAgICAgICBzdGFydDogbS5pbmRleCxcbiAgICAgICAgc3RvcDogbS5pbmRleCArIG1bMF0ubGVuZ3RoLFxuICAgICAgICB0YWc6IHRhZ1xuICAgICAgfSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBwb3NpdGlvbnM7XG59O1xuXG5jb25zdCB0b2tlbml6ZSA9ICh0ZXh0KSA9PiB7XG4gIHRleHQgPSBTdHJpbmcodGV4dCk7XG5cbiAgdmFyIHJlZ2V4cCA9IC8oXFx7XFx7fFxcfVxcfSkvO1xuICB2YXIgcGFydHMgPSB0ZXh0LnNwbGl0KHJlZ2V4cCk7XG5cbiAgdmFyIHRva2VucyA9IFtdO1xuICB2YXIgaW5UYWcgPSBmYWxzZTtcbiAgcGFydHMuZm9yRWFjaChmdW5jdGlvbiAocGFydCkge1xuICAgIGlmIChwYXJ0ID09PSAne3snKSB7XG4gICAgICBpblRhZyA9IHRydWU7XG4gICAgfSBlbHNlIGlmIChwYXJ0ID09PSAnfX0nKSB7XG4gICAgICBpblRhZyA9IGZhbHNlO1xuICAgIH0gZWxzZSBpZiAoaW5UYWcpIHtcbiAgICAgIHRva2Vucy5wdXNoKHt0eXBlOiAndGFnJywgdmFsdWU6IHBhcnR9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdG9rZW5zLnB1c2goe3R5cGU6ICdzdHJpbmcnLCB2YWx1ZTogcGFydH0pO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiB0b2tlbnM7XG59O1xuXG4vKlxuICAgR2l2ZW4gYSBDb2RlTWlycm9yIGRvY3VtZW50IHBvc2l0aW9uIGxpa2Uge2xpbmU6IDAsIGNoOiAxMH0sIHJldHVyblxuICAgdGhlIHRhZyBwb3NpdGlvbiBvYmplY3QgZm9yIHRoYXQgcG9zaXRpb24sIGZvciBleGFtcGxlIHtsaW5lOiAwLFxuICAgc3RhcnQ6IDgsIHN0b3A6IDEyfVxuXG4gICBXaGVuIGNsaWNraW5nIG9uIGEgcHJldHR5IHRhZywgQ29kZU1pcnJvciAuZ2V0Q3Vyc29yKCkgbWF5IHJldHVyblxuICAgZWl0aGVyIHRoZSBwb3NpdGlvbiBvZiB0aGUgc3RhcnQgb3IgdGhlIGVuZCBvZiB0aGUgdGFnLCBzbyB3ZSB1c2VcbiAgIHRoaXMgZnVuY3Rpb24gdG8gbm9ybWFsaXplIGl0LlxuXG4gICBDbGlja2luZyBvbiBhIHByZXR0eSB0YWcgaXMganVtcHkgLSB0aGUgY3Vyc29yIGdvZXMgZnJvbSBvbmUgZW5kIHRvXG4gICB0aGUgb3RoZXIgZWFjaCB0aW1lIHlvdSBjbGljayBpdC4gV2Ugc2hvdWxkIHByb2JhYmx5IGZpeCB0aGF0LCBhbmRcbiAgIHRoZSBuZWVkIGZvciB0aGlzIGZ1bmN0aW9uIG1pZ2h0IGdvIGF3YXkuXG4qL1xuY29uc3QgZ2V0VHJ1ZVRhZ1Bvc2l0aW9uID0gKHRleHQsIGNtUG9zKSA9PiB7XG4gIGNvbnN0IHBvc2l0aW9ucyA9IGdldFRhZ1Bvc2l0aW9ucyh0ZXh0KTtcbiAgcmV0dXJuIF8uZmluZChwb3NpdGlvbnMsIHAgPT4gY21Qb3MubGluZSA9PT0gcC5saW5lICYmIGNtUG9zLmNoID49IHAuc3RhcnQgJiYgY21Qb3MuY2ggPD0gcC5zdG9wKTtcbn07XG5cbi8qXG4gICBDcmVhdGVzIGhlbHBlciB0byB0cmFuc2xhdGUgYmV0d2VlbiB0YWdzIGxpa2Uge3tmaXJzdE5hbWV9fSBhbmRcbiAgIGFuIGVuY29kZWQgcmVwcmVzZW50YXRpb24gc3VpdGFibGUgZm9yIHVzZSBpbiBDb2RlTWlycm9yLlxuICovXG5jb25zdCBUYWdUcmFuc2xhdG9yID0gKHJlcGxhY2VDaG9pY2VzLCBodW1hbml6ZSkgPT4ge1xuICAvLyBNYXAgb2YgdGFnIHRvIGxhYmVsICdmaXJzdE5hbWUnIC0tPiAnRmlyc3QgTmFtZSdcbiAgdmFyIGNob2ljZXMgPSBidWlsZENob2ljZXNNYXAocmVwbGFjZUNob2ljZXMpO1xuXG4gIHJldHVybiB7XG4gICAgLypcbiAgICAgICBHZXQgbGFiZWwgZm9yIHRhZy4gIEZvciBleGFtcGxlICdmaXJzdE5hbWUnIGJlY29tZXMgJ0ZpcnN0IE5hbWUnLlxuICAgICAgIFJldHVybnMgYSBodW1hbml6ZWQgdmVyc2lvbiBvZiB0aGUgdGFnIGlmIHdlIGRvbid0IGhhdmUgYSBsYWJlbCBmb3IgdGhlIHRhZy5cbiAgICAgKi9cbiAgICBnZXRMYWJlbDogKHRhZykgPT4ge1xuICAgICAgdmFyIGxhYmVsID0gY2hvaWNlc1t0YWddO1xuICAgICAgaWYgKCFsYWJlbCkge1xuICAgICAgICAvLyBJZiB0YWcgbm90IGZvdW5kIGFuZCB3ZSBoYXZlIGEgaHVtYW5pemUgZnVuY3Rpb24sIGh1bWFuaXplIHRoZSB0YWcuXG4gICAgICAgIC8vIE90aGVyd2lzZSBqdXN0IHJldHVybiB0aGUgdGFnLlxuICAgICAgICBsYWJlbCA9IGh1bWFuaXplICYmIGh1bWFuaXplKHRhZykgfHwgdGFnO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGxhYmVsO1xuICAgIH0sXG5cbiAgICBnZXRUYWdQb3NpdGlvbnMsXG4gICAgdG9rZW5pemUsXG4gICAgZ2V0VHJ1ZVRhZ1Bvc2l0aW9uXG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRhZ1RyYW5zbGF0b3I7XG4iLCIvLyAjIGRlZmF1bHQtY29uZmlnXG5cbi8qXG5UaGlzIGlzIHRoZSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gcGx1Z2luIGZvciBmb3JtYXRpYy4gVG8gY2hhbmdlIGZvcm1hdGljJ3NcbmJlaGF2aW9yLCBqdXN0IGNyZWF0ZSB5b3VyIG93biBwbHVnaW4gZnVuY3Rpb24gdGhhdCByZXR1cm5zIGFuIG9iamVjdCB3aXRoXG5tZXRob2RzIHlvdSB3YW50IHRvIGFkZCBvciBvdmVycmlkZS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBfID0gcmVxdWlyZSgnLi91bmRhc2gnKTtcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjb25maWcpIHtcblxuICB2YXIgZGVsZWdhdGVUbyA9IHV0aWxzLmRlbGVnYXRvcihjb25maWcpO1xuXG4gIHJldHVybiB7XG5cbiAgICAvLyBGaWVsZCBlbGVtZW50IGZhY3Rvcmllcy4gQ3JlYXRlIGZpZWxkIGVsZW1lbnRzLlxuXG4gICAgY3JlYXRlRWxlbWVudF9GaWVsZHM6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9maWVsZHMnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0dyb3VwZWRGaWVsZHM6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9ncm91cGVkLWZpZWxkcycpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfU3RyaW5nOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvc3RyaW5nJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9TaW5nbGVMaW5lU3RyaW5nOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvc2luZ2xlLWxpbmUtc3RyaW5nJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9QYXNzd29yZDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL3Bhc3N3b3JkJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9TZWxlY3Q6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9zZWxlY3QnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X1ByZXR0eVNlbGVjdDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL3ByZXR0eS1zZWxlY3QnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0Jvb2xlYW46IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9ib29sZWFuJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9QcmV0dHlCb29sZWFuOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvcHJldHR5LWJvb2xlYW4nKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0NoZWNrYm94Qm9vbGVhbjogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL2NoZWNrYm94LWJvb2xlYW4nKSksXG5cbiAgICAvLyBjcmVhdGVFbGVtZW50X1ByZXR0eVRleHQ6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9wcmV0dHktdGV4dCcpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfQ29kZTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL2NvZGUnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X1ByZXR0eVRleHQ6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9wcmV0dHktdGV4dDInKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X1ByZXR0eVRhZzogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9wcmV0dHktdGFnJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9BcnJheTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL2FycmF5JykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9DaGVja2JveEFycmF5OiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvY2hlY2tib3gtYXJyYXknKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X09iamVjdDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL29iamVjdCcpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfSnNvbjogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL2pzb24nKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X1Vua25vd25GaWVsZDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL3Vua25vd24nKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0NvcHk6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9jb3B5JykpLFxuXG5cbiAgICAvLyBPdGhlciBlbGVtZW50IGZhY3Rvcmllcy4gQ3JlYXRlIGhlbHBlciBlbGVtZW50cyB1c2VkIGJ5IGZpZWxkIGNvbXBvbmVudHMuXG5cbiAgICBjcmVhdGVFbGVtZW50X0ZpZWxkOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2ZpZWxkJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9MYWJlbDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9sYWJlbCcpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfSGVscDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9oZWxwJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9DaG9pY2VzOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2Nob2ljZXMnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0Nob2ljZXNTZWFyY2g6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvY2hvaWNlcy1zZWFyY2gnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0xvYWRpbmdDaG9pY2VzOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2xvYWRpbmctY2hvaWNlcycpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfTG9hZGluZ0Nob2ljZTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9sb2FkaW5nLWNob2ljZScpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfQXJyYXlDb250cm9sOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2FycmF5LWNvbnRyb2wnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0FycmF5SXRlbUNvbnRyb2w6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvYXJyYXktaXRlbS1jb250cm9sJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9BcnJheUl0ZW1WYWx1ZTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9hcnJheS1pdGVtLXZhbHVlJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9BcnJheUl0ZW06IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvYXJyYXktaXRlbScpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfRmllbGRUZW1wbGF0ZUNob2ljZXM6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvZmllbGQtdGVtcGxhdGUtY2hvaWNlcycpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfQWRkSXRlbTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9hZGQtaXRlbScpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfUmVtb3ZlSXRlbTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9yZW1vdmUtaXRlbScpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfTW92ZUl0ZW1Gb3J3YXJkOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL21vdmUtaXRlbS1mb3J3YXJkJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9Nb3ZlSXRlbUJhY2s6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvbW92ZS1pdGVtLWJhY2snKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X09iamVjdENvbnRyb2w6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWNvbnRyb2wnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X09iamVjdEl0ZW1Db250cm9sOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL29iamVjdC1pdGVtLWNvbnRyb2wnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X09iamVjdEl0ZW1WYWx1ZTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9vYmplY3QtaXRlbS12YWx1ZScpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfT2JqZWN0SXRlbUtleTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9vYmplY3QtaXRlbS1rZXknKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X09iamVjdEl0ZW06IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWl0ZW0nKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X1NlbGVjdFZhbHVlOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL3NlbGVjdC12YWx1ZScpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfUHJldHR5U2VsZWN0VmFsdWU6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvcHJldHR5LXNlbGVjdC12YWx1ZScpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfUHJldHR5U2VsZWN0SW5wdXQ6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvcHJldHR5LXNlbGVjdC1pbnB1dCcpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfU2FtcGxlOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL3NhbXBsZScpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfSW5zZXJ0QnV0dG9uOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2luc2VydC1idXR0b24nKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0Nob2ljZVNlY3Rpb25IZWFkZXI6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvY2hvaWNlLXNlY3Rpb24taGVhZGVyJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9QcmV0dHlUZXh0SW5wdXQ6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvcHJldHR5LXRleHQtaW5wdXQnKSksXG5cbiAgICAvLyBGaWVsZCBkZWZhdWx0IHZhbHVlIGZhY3Rvcmllcy4gR2l2ZSBhIGRlZmF1bHQgdmFsdWUgZm9yIGEgc3BlY2lmaWMgdHlwZS5cblxuICAgIGNyZWF0ZURlZmF1bHRWYWx1ZV9TdHJpbmc6IGZ1bmN0aW9uICgvKiBmaWVsZFRlbXBsYXRlICovKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfSxcblxuICAgIGNyZWF0ZURlZmF1bHRWYWx1ZV9PYmplY3Q6IGZ1bmN0aW9uICgvKiBmaWVsZFRlbXBsYXRlICovKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfSxcblxuICAgIGNyZWF0ZURlZmF1bHRWYWx1ZV9BcnJheTogZnVuY3Rpb24gKC8qIGZpZWxkVGVtcGxhdGUgKi8pIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9LFxuXG4gICAgY3JlYXRlRGVmYXVsdFZhbHVlX0Jvb2xlYW46IGZ1bmN0aW9uICgvKiBmaWVsZFRlbXBsYXRlICovKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIGNyZWF0ZURlZmF1bHRWYWx1ZV9GaWVsZHM6IGRlbGVnYXRlVG8oJ2NyZWF0ZURlZmF1bHRWYWx1ZV9PYmplY3QnKSxcblxuICAgIGNyZWF0ZURlZmF1bHRWYWx1ZV9TaW5nbGVMaW5lU3RyaW5nOiBkZWxlZ2F0ZVRvKCdjcmVhdGVEZWZhdWx0VmFsdWVfU3RyaW5nJyksXG5cbiAgICBjcmVhdGVEZWZhdWx0VmFsdWVfU2VsZWN0OiBkZWxlZ2F0ZVRvKCdjcmVhdGVEZWZhdWx0VmFsdWVfU3RyaW5nJyksXG5cbiAgICBjcmVhdGVEZWZhdWx0VmFsdWVfSnNvbjogZGVsZWdhdGVUbygnY3JlYXRlRGVmYXVsdFZhbHVlX09iamVjdCcpLFxuXG4gICAgY3JlYXRlRGVmYXVsdFZhbHVlX0NoZWNrYm94QXJyYXk6IGRlbGVnYXRlVG8oJ2NyZWF0ZURlZmF1bHRWYWx1ZV9BcnJheScpLFxuXG4gICAgY3JlYXRlRGVmYXVsdFZhbHVlX0NoZWNrYm94Qm9vbGVhbjogZGVsZWdhdGVUbygnY3JlYXRlRGVmYXVsdFZhbHVlX0Jvb2xlYW4nKSxcblxuXG4gICAgLy8gRmllbGQgdmFsdWUgY29lcmNlcnMuIENvZXJjZSBhIHZhbHVlIGludG8gYSB2YWx1ZSBhcHByb3ByaWF0ZSBmb3IgYSBzcGVjaWZpYyB0eXBlLlxuXG4gICAgY29lcmNlVmFsdWVfU3RyaW5nOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSwgdmFsdWUpIHtcbiAgICAgIGlmIChfLmlzU3RyaW5nKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9XG4gICAgICBpZiAoXy5pc1VuZGVmaW5lZCh2YWx1ZSkgfHwgdmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICB9LFxuXG4gICAgY29lcmNlVmFsdWVfT2JqZWN0OiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSwgdmFsdWUpIHtcbiAgICAgIGlmICghXy5pc09iamVjdCh2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG5cbiAgICBjb2VyY2VWYWx1ZV9BcnJheTogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUsIHZhbHVlKSB7XG4gICAgICBpZiAoIV8uaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIFt2YWx1ZV07XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcblxuICAgIGNvZXJjZVZhbHVlX0Jvb2xlYW46IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlLCB2YWx1ZSkge1xuICAgICAgcmV0dXJuIGNvbmZpZy5jb2VyY2VWYWx1ZVRvQm9vbGVhbih2YWx1ZSk7XG4gICAgfSxcblxuICAgIGNvZXJjZVZhbHVlX0ZpZWxkczogZGVsZWdhdGVUbygnY29lcmNlVmFsdWVfT2JqZWN0JyksXG5cbiAgICBjb2VyY2VWYWx1ZV9TaW5nbGVMaW5lU3RyaW5nOiBkZWxlZ2F0ZVRvKCdjb2VyY2VWYWx1ZV9TdHJpbmcnKSxcblxuICAgIGNvZXJjZVZhbHVlX1NlbGVjdDogZGVsZWdhdGVUbygnY29lcmNlVmFsdWVfU3RyaW5nJyksXG5cbiAgICBjb2VyY2VWYWx1ZV9Kc29uOiBkZWxlZ2F0ZVRvKCdjb2VyY2VWYWx1ZV9PYmplY3QnKSxcblxuICAgIGNvZXJjZVZhbHVlX0NoZWNrYm94QXJyYXk6IGRlbGVnYXRlVG8oJ2NvZXJjZVZhbHVlX0FycmF5JyksXG5cbiAgICBjb2VyY2VWYWx1ZV9DaGVja2JveEJvb2xlYW46IGRlbGVnYXRlVG8oJ2NvZXJjZVZhbHVlX0Jvb2xlYW4nKSxcblxuXG4gICAgLy8gRmllbGQgY2hpbGQgZmllbGRzIGZhY3Rvcmllcywgc28gc29tZSB0eXBlcyBjYW4gaGF2ZSBkeW5hbWljIGNoaWxkcmVuLlxuXG4gICAgY3JlYXRlQ2hpbGRGaWVsZHNfQXJyYXk6IGZ1bmN0aW9uIChmaWVsZCkge1xuXG4gICAgICByZXR1cm4gZmllbGQudmFsdWUubWFwKGZ1bmN0aW9uIChhcnJheUl0ZW0sIGkpIHtcbiAgICAgICAgdmFyIGNoaWxkRmllbGRUZW1wbGF0ZSA9IGNvbmZpZy5jaGlsZEZpZWxkVGVtcGxhdGVGb3JWYWx1ZShmaWVsZCwgYXJyYXlJdGVtKTtcblxuICAgICAgICB2YXIgY2hpbGRGaWVsZCA9IGNvbmZpZy5jcmVhdGVDaGlsZEZpZWxkKGZpZWxkLCB7XG4gICAgICAgICAgZmllbGRUZW1wbGF0ZTogY2hpbGRGaWVsZFRlbXBsYXRlLCBrZXk6IGksIGZpZWxkSW5kZXg6IGksIHZhbHVlOiBhcnJheUl0ZW1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGNoaWxkRmllbGQ7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlQ2hpbGRGaWVsZHNfT2JqZWN0OiBmdW5jdGlvbiAoZmllbGQpIHtcblxuICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKGZpZWxkLnZhbHVlKS5tYXAoZnVuY3Rpb24gKGtleSwgaSkge1xuICAgICAgICB2YXIgY2hpbGRGaWVsZFRlbXBsYXRlID0gY29uZmlnLmNoaWxkRmllbGRUZW1wbGF0ZUZvclZhbHVlKGZpZWxkLCBmaWVsZC52YWx1ZVtrZXldKTtcblxuICAgICAgICB2YXIgY2hpbGRGaWVsZCA9IGNvbmZpZy5jcmVhdGVDaGlsZEZpZWxkKGZpZWxkLCB7XG4gICAgICAgICAgZmllbGRUZW1wbGF0ZTogY2hpbGRGaWVsZFRlbXBsYXRlLCBrZXk6IGtleSwgZmllbGRJbmRleDogaSwgdmFsdWU6IGZpZWxkLnZhbHVlW2tleV1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGNoaWxkRmllbGQ7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgLy8gQ2hlY2sgaWYgdGhlcmUgaXMgYSBmYWN0b3J5IGZvciB0aGUgbmFtZS5cbiAgICBoYXNFbGVtZW50RmFjdG9yeTogZnVuY3Rpb24gKG5hbWUpIHtcblxuICAgICAgcmV0dXJuIGNvbmZpZ1snY3JlYXRlRWxlbWVudF8nICsgbmFtZV0gPyB0cnVlIDogZmFsc2U7XG4gICAgfSxcblxuICAgIC8vIENyZWF0ZSBhbiBlbGVtZW50IGdpdmVuIGEgbmFtZSwgcHJvcHMsIGFuZCBjaGlsZHJlbi5cbiAgICBjcmVhdGVFbGVtZW50OiBmdW5jdGlvbiAobmFtZSwgcHJvcHMsIGNoaWxkcmVuKSB7XG5cbiAgICAgIGlmICghcHJvcHMuY29uZmlnKSB7XG4gICAgICAgIHByb3BzID0gXy5leHRlbmQoe30sIHByb3BzLCB7Y29uZmlnOiBjb25maWd9KTtcbiAgICAgIH1cblxuICAgICAgbmFtZSA9IGNvbmZpZy5lbGVtZW50TmFtZShuYW1lKTtcblxuICAgICAgaWYgKGNvbmZpZ1snY3JlYXRlRWxlbWVudF8nICsgbmFtZV0pIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZ1snY3JlYXRlRWxlbWVudF8nICsgbmFtZV0ocHJvcHMsIGNoaWxkcmVuKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG5hbWUgIT09ICdVbmtub3duJykge1xuICAgICAgICBpZiAoY29uZmlnLmhhc0VsZW1lbnRGYWN0b3J5KCdVbmtub3duJykpIHtcbiAgICAgICAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ1Vua25vd24nLCBwcm9wcywgY2hpbGRyZW4pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRocm93IG5ldyBFcnJvcignRmFjdG9yeSBub3QgZm91bmQgZm9yOiAnICsgbmFtZSk7XG4gICAgfSxcblxuICAgIC8vIENyZWF0ZSBhIGZpZWxkIGVsZW1lbnQgZ2l2ZW4gc29tZSBwcm9wcy4gVXNlIGNvbnRleHQgdG8gZGV0ZXJtaW5lIG5hbWUuXG4gICAgY3JlYXRlRmllbGRFbGVtZW50OiBmdW5jdGlvbiAocHJvcHMpIHtcblxuICAgICAgdmFyIG5hbWUgPSBjb25maWcuZmllbGRUeXBlTmFtZShwcm9wcy5maWVsZCk7XG5cbiAgICAgIGlmIChjb25maWcuaGFzRWxlbWVudEZhY3RvcnkobmFtZSkpIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KG5hbWUsIHByb3BzKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdVbmtub3duRmllbGQnLCBwcm9wcyk7XG4gICAgfSxcblxuICAgIC8vIFJlbmRlciB0aGUgcm9vdCBmb3JtYXRpYyBjb21wb25lbnRcbiAgICByZW5kZXJGb3JtYXRpY0NvbXBvbmVudDogZnVuY3Rpb24gKGNvbXBvbmVudCkge1xuXG4gICAgICB2YXIgcHJvcHMgPSBjb21wb25lbnQucHJvcHM7XG5cbiAgICAgIHZhciBmaWVsZCA9IGNvbmZpZy5jcmVhdGVSb290RmllbGQocHJvcHMpO1xuICAgICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6ICdmb3JtYXRpYyd9LFxuICAgICAgICBjb25maWcuY3JlYXRlRmllbGRFbGVtZW50KHtmaWVsZDogZmllbGQsIG9uQ2hhbmdlOiBjb21wb25lbnQub25DaGFuZ2UsIG9uQWN0aW9uOiBjb21wb25lbnQub25BY3Rpb259KVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgLy8gUmVuZGVyIGFueSBjb21wb25lbnQuXG4gICAgcmVuZGVyQ29tcG9uZW50OiBmdW5jdGlvbiAoY29tcG9uZW50KSB7XG5cbiAgICAgIHZhciBuYW1lID0gY29tcG9uZW50LmNvbnN0cnVjdG9yLmRpc3BsYXlOYW1lO1xuXG4gICAgICBpZiAoY29uZmlnWydyZW5kZXJDb21wb25lbnRfJyArIG5hbWVdKSB7XG4gICAgICAgIHJldHVybiBjb25maWdbJ3JlbmRlckNvbXBvbmVudF8nICsgbmFtZV0oY29tcG9uZW50KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNvbXBvbmVudC5yZW5kZXJEZWZhdWx0KCk7XG4gICAgfSxcblxuICAgIC8vIFJlbmRlciBmaWVsZCBjb21wb25lbnRzLlxuICAgIHJlbmRlckZpZWxkQ29tcG9uZW50OiBmdW5jdGlvbiAoY29tcG9uZW50KSB7XG5cbiAgICAgIHJldHVybiBjb25maWcucmVuZGVyQ29tcG9uZW50KGNvbXBvbmVudCk7XG4gICAgfSxcblxuICAgIC8vIE5vcm1hbGl6ZSBhbiBlbGVtZW50IG5hbWUuXG4gICAgZWxlbWVudE5hbWU6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICByZXR1cm4gdXRpbHMuZGFzaFRvUGFzY2FsKG5hbWUpO1xuICAgIH0sXG5cbiAgICAvLyBUeXBlIGFsaWFzZXMuXG5cbiAgICBhbGlhc19EaWN0OiAnT2JqZWN0JyxcblxuICAgIGFsaWFzX0Jvb2w6ICdCb29sZWFuJyxcblxuICAgIGFsaWFzX1ByZXR0eVRleHRhcmVhOiAnUHJldHR5VGV4dCcsXG5cbiAgICBhbGlhc19TaW5nbGVMaW5lU3RyaW5nOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSkge1xuICAgICAgaWYgKGZpZWxkVGVtcGxhdGUucmVwbGFjZUNob2ljZXMpIHtcbiAgICAgICAgcmV0dXJuICdQcmV0dHlUZXh0JztcbiAgICAgIH0gZWxzZSBpZiAoZmllbGRUZW1wbGF0ZS5jaG9pY2VzKSB7XG4gICAgICAgIHJldHVybiAnU2VsZWN0JztcbiAgICAgIH1cbiAgICAgIHJldHVybiAnU2luZ2xlTGluZVN0cmluZyc7XG4gICAgfSxcblxuICAgIGFsaWFzX1N0cmluZzogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcblxuICAgICAgaWYgKGZpZWxkVGVtcGxhdGUucmVwbGFjZUNob2ljZXMpIHtcbiAgICAgICAgcmV0dXJuICdQcmV0dHlUZXh0JztcbiAgICAgIH0gZWxzZSBpZiAoZmllbGRUZW1wbGF0ZS5jaG9pY2VzKSB7XG4gICAgICAgIHJldHVybiAnU2VsZWN0JztcbiAgICAgIH0gZWxzZSBpZiAoY29uZmlnLmZpZWxkVGVtcGxhdGVJc1NpbmdsZUxpbmUoZmllbGRUZW1wbGF0ZSkpIHtcbiAgICAgICAgcmV0dXJuICdTaW5nbGVMaW5lU3RyaW5nJztcbiAgICAgIH1cbiAgICAgIHJldHVybiAnU3RyaW5nJztcbiAgICB9LFxuXG4gICAgYWxpYXNfVGV4dDogZGVsZWdhdGVUbygnYWxpYXNfU3RyaW5nJyksXG5cbiAgICBhbGlhc19Vbmljb2RlOiBkZWxlZ2F0ZVRvKCdhbGlhc19TaW5nbGVMaW5lU3RyaW5nJyksXG5cbiAgICBhbGlhc19TdHI6IGRlbGVnYXRlVG8oJ2FsaWFzX1NpbmdsZUxpbmVTdHJpbmcnKSxcblxuICAgIGFsaWFzX0xpc3Q6ICdBcnJheScsXG5cbiAgICBhbGlhc19DaGVja2JveExpc3Q6ICdDaGVja2JveEFycmF5JyxcblxuICAgIGFsaWFzX0ZpZWxkc2V0OiAnRmllbGRzJyxcblxuICAgIGFsaWFzX0NoZWNrYm94OiAnQ2hlY2tib3hCb29sZWFuJyxcblxuICAgIC8vIEZpZWxkIGZhY3RvcnlcblxuICAgIC8vIEdpdmVuIGEgZmllbGQsIGV4cGFuZCBhbGwgY2hpbGQgZmllbGRzIHJlY3Vyc2l2ZWx5IHRvIGdldCB0aGUgZGVmYXVsdFxuICAgIC8vIHZhbHVlcyBvZiBhbGwgZmllbGRzLlxuICAgIGluZmxhdGVGaWVsZFZhbHVlOiBmdW5jdGlvbiAoZmllbGQsIGZpZWxkSGFuZGxlcikge1xuXG4gICAgICBpZiAoZmllbGRIYW5kbGVyKSB7XG4gICAgICAgIHZhciBzdG9wID0gZmllbGRIYW5kbGVyKGZpZWxkKTtcbiAgICAgICAgaWYgKHN0b3AgPT09IGZhbHNlKSB7XG4gICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoY29uZmlnLmZpZWxkSGFzVmFsdWVDaGlsZHJlbihmaWVsZCkpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gXy5jbG9uZShmaWVsZC52YWx1ZSk7XG4gICAgICAgIHZhciBjaGlsZEZpZWxkcyA9IGNvbmZpZy5jcmVhdGVDaGlsZEZpZWxkcyhmaWVsZCk7XG4gICAgICAgIGNoaWxkRmllbGRzLmZvckVhY2goZnVuY3Rpb24gKGNoaWxkRmllbGQpIHtcbiAgICAgICAgICBpZiAoY29uZmlnLmlzS2V5KGNoaWxkRmllbGQua2V5KSkge1xuICAgICAgICAgICAgdmFsdWVbY2hpbGRGaWVsZC5rZXldID0gY29uZmlnLmluZmxhdGVGaWVsZFZhbHVlKGNoaWxkRmllbGQsIGZpZWxkSGFuZGxlcik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGEgY2hpbGQgd2l0aCBubyBrZXkgbWlnaHQgaGF2ZSBzdWItY2hpbGRyZW4gd2l0aCBrZXlzXG4gICAgICAgICAgICB2YXIgb2JqID0gY29uZmlnLmluZmxhdGVGaWVsZFZhbHVlKGNoaWxkRmllbGQsIGZpZWxkSGFuZGxlcik7XG4gICAgICAgICAgICBfLmV4dGVuZCh2YWx1ZSwgb2JqKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZmllbGQudmFsdWU7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIEluaXRpYWxpemUgdGhlIHJvb3QgZmllbGQuXG4gICAgaW5pdFJvb3RGaWVsZDogZnVuY3Rpb24gKC8qIGZpZWxkLCBwcm9wcyAqLykge1xuICAgIH0sXG5cbiAgICAvLyBJbml0aWFsaXplIGV2ZXJ5IGZpZWxkLlxuICAgIGluaXRGaWVsZDogZnVuY3Rpb24gKC8qIGZpZWxkICovKSB7XG4gICAgfSxcblxuICAgIC8vIElmIGFuIGFycmF5IG9mIGZpZWxkIHRlbXBsYXRlcyBhcmUgcGFzc2VkIGluLCB0aGlzIG1ldGhvZCBpcyB1c2VkIHRvXG4gICAgLy8gd3JhcCB0aGUgZmllbGRzIGluc2lkZSBhIHNpbmdsZSByb290IGZpZWxkIHRlbXBsYXRlLlxuICAgIHdyYXBGaWVsZFRlbXBsYXRlczogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGVzKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnZmllbGRzJyxcbiAgICAgICAgcGxhaW46IHRydWUsXG4gICAgICAgIGZpZWxkczogZmllbGRUZW1wbGF0ZXNcbiAgICAgIH07XG4gICAgfSxcblxuICAgIC8vIEdpdmVuIHRoZSBwcm9wcyB0aGF0IGFyZSBwYXNzZWQgaW4sIGNyZWF0ZSB0aGUgcm9vdCBmaWVsZC5cbiAgICBjcmVhdGVSb290RmllbGQ6IGZ1bmN0aW9uIChwcm9wcykge1xuXG4gICAgICB2YXIgZmllbGRUZW1wbGF0ZSA9IHByb3BzLmZpZWxkVGVtcGxhdGUgfHwgcHJvcHMuZmllbGRUZW1wbGF0ZXMgfHwgcHJvcHMuZmllbGQgfHwgcHJvcHMuZmllbGRzO1xuICAgICAgdmFyIHZhbHVlID0gcHJvcHMudmFsdWU7XG5cbiAgICAgIGlmICghZmllbGRUZW1wbGF0ZSkge1xuICAgICAgICBmaWVsZFRlbXBsYXRlID0gY29uZmlnLmNyZWF0ZUZpZWxkVGVtcGxhdGVGcm9tVmFsdWUodmFsdWUpO1xuICAgICAgfVxuXG4gICAgICBpZiAoXy5pc0FycmF5KGZpZWxkVGVtcGxhdGUpKSB7XG4gICAgICAgIGZpZWxkVGVtcGxhdGUgPSBjb25maWcud3JhcEZpZWxkVGVtcGxhdGVzKGZpZWxkVGVtcGxhdGUpO1xuICAgICAgfVxuXG4gICAgICB2YXIgZmllbGQgPSBfLmV4dGVuZCh7fSwgZmllbGRUZW1wbGF0ZSwge3Jhd0ZpZWxkVGVtcGxhdGU6IGZpZWxkVGVtcGxhdGV9KTtcbiAgICAgIGlmIChjb25maWcuaGFzVmFsdWUoZmllbGRUZW1wbGF0ZSwgdmFsdWUpKSB7XG4gICAgICAgIGZpZWxkLnZhbHVlID0gY29uZmlnLmNvZXJjZVZhbHVlKGZpZWxkVGVtcGxhdGUsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZpZWxkLnZhbHVlID0gY29uZmlnLmNyZWF0ZURlZmF1bHRWYWx1ZShmaWVsZFRlbXBsYXRlKTtcbiAgICAgIH1cblxuICAgICAgY29uZmlnLmluaXRSb290RmllbGQoZmllbGQsIHByb3BzKTtcbiAgICAgIGNvbmZpZy5pbml0RmllbGQoZmllbGQpO1xuXG4gICAgICBpZiAodmFsdWUgPT09IG51bGwgfHwgY29uZmlnLmlzRW1wdHlPYmplY3QodmFsdWUpIHx8IF8uaXNVbmRlZmluZWQodmFsdWUpKSB7XG4gICAgICAgIGZpZWxkLnZhbHVlID0gY29uZmlnLmluZmxhdGVGaWVsZFZhbHVlKGZpZWxkKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHByb3BzLnJlYWRPbmx5KSB7XG4gICAgICAgIGZpZWxkLnJlYWRPbmx5ID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZpZWxkO1xuICAgIH0sXG5cbiAgICAvLyBHaXZlbiB0aGUgcHJvcHMgdGhhdCBhcmUgcGFzc2VkIGluLCBjcmVhdGUgdGhlIHZhbHVlIHRoYXQgd2lsbCBiZSBkaXNwbGF5ZWRcbiAgICAvLyBieSBhbGwgdGhlIGNvbXBvbmVudHMuXG4gICAgY3JlYXRlUm9vdFZhbHVlOiBmdW5jdGlvbiAocHJvcHMsIGZpZWxkSGFuZGxlcikge1xuXG4gICAgICB2YXIgZmllbGQgPSBjb25maWcuY3JlYXRlUm9vdEZpZWxkKHByb3BzKTtcblxuICAgICAgcmV0dXJuIGNvbmZpZy5pbmZsYXRlRmllbGRWYWx1ZShmaWVsZCwgZmllbGRIYW5kbGVyKTtcbiAgICB9LFxuXG4gICAgdmFsaWRhdGVSb290VmFsdWU6IGZ1bmN0aW9uIChwcm9wcykge1xuXG4gICAgICB2YXIgZXJyb3JzID0gW107XG5cbiAgICAgIGNvbmZpZy5jcmVhdGVSb290VmFsdWUocHJvcHMsIGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgICB2YXIgZmllbGRFcnJvcnMgPSBjb25maWcuZmllbGRFcnJvcnMoZmllbGQpO1xuICAgICAgICBpZiAoZmllbGRFcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgIHBhdGg6IGNvbmZpZy5maWVsZFZhbHVlUGF0aChmaWVsZCksXG4gICAgICAgICAgICBlcnJvcnM6IGZpZWxkRXJyb3JzXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gZXJyb3JzO1xuICAgIH0sXG5cbiAgICBpc1ZhbGlkUm9vdFZhbHVlOiBmdW5jdGlvbiAocHJvcHMpIHtcblxuICAgICAgdmFyIGlzVmFsaWQgPSB0cnVlO1xuXG4gICAgICBjb25maWcuY3JlYXRlUm9vdFZhbHVlKHByb3BzLCBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgICAgaWYgKGNvbmZpZy5maWVsZEVycm9ycyhmaWVsZCkubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGlzVmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gaXNWYWxpZDtcbiAgICB9LFxuXG4gICAgdmFsaWRhdGVGaWVsZDogZnVuY3Rpb24gKGZpZWxkLCBlcnJvcnMpIHtcblxuICAgICAgaWYgKGZpZWxkLnZhbHVlID09PSB1bmRlZmluZWQgfHwgZmllbGQudmFsdWUgPT09ICcnKSB7XG4gICAgICAgIGlmIChjb25maWcuZmllbGRJc1JlcXVpcmVkKGZpZWxkKSkge1xuICAgICAgICAgIGVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgIHR5cGU6ICdyZXF1aXJlZCdcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBjc3NUcmFuc2l0aW9uV3JhcHBlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgQ1NTVHJhbnNpdGlvbkdyb3VwID0gUmVhY3QuY3JlYXRlRmFjdG9yeShSZWFjdC5hZGRvbnMuQ1NTVHJhbnNpdGlvbkdyb3VwKTtcbiAgICAgIHZhciBhcmdzID0gW3t0cmFuc2l0aW9uTmFtZTogJ3JldmVhbCd9XS5jb25jYXQoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG4gICAgICByZXR1cm4gQ1NTVHJhbnNpdGlvbkdyb3VwLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgIH0sXG5cbiAgICAvLyBDcmVhdGUgZHluYW1pYyBjaGlsZCBmaWVsZHMgZm9yIGEgZmllbGQuXG4gICAgY3JlYXRlQ2hpbGRGaWVsZHM6IGZ1bmN0aW9uIChmaWVsZCkge1xuXG4gICAgICB2YXIgdHlwZU5hbWUgPSBjb25maWcuZmllbGRUeXBlTmFtZShmaWVsZCk7XG5cbiAgICAgIGlmIChjb25maWdbJ2NyZWF0ZUNoaWxkRmllbGRzXycgKyB0eXBlTmFtZV0pIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZ1snY3JlYXRlQ2hpbGRGaWVsZHNfJyArIHR5cGVOYW1lXShmaWVsZCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjb25maWcuZmllbGRDaGlsZEZpZWxkVGVtcGxhdGVzKGZpZWxkKS5tYXAoZnVuY3Rpb24gKGNoaWxkRmllbGQsIGkpIHtcbiAgICAgICAgdmFyIGNoaWxkVmFsdWUgPSBmaWVsZC52YWx1ZTtcbiAgICAgICAgaWYgKGNvbmZpZy5pc0tleShjaGlsZEZpZWxkLmtleSkpIHtcbiAgICAgICAgICBjaGlsZFZhbHVlID0gZmllbGQudmFsdWVbY2hpbGRGaWVsZC5rZXldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb25maWcuY3JlYXRlQ2hpbGRGaWVsZChmaWVsZCwge1xuICAgICAgICAgIGZpZWxkVGVtcGxhdGU6IGNoaWxkRmllbGQsIGtleTogY2hpbGRGaWVsZC5rZXksIGZpZWxkSW5kZXg6IGksIHZhbHVlOiBjaGlsZFZhbHVlXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8vIENyZWF0ZSBhIHNpbmdsZSBjaGlsZCBmaWVsZCBmb3IgYSBwYXJlbnQgZmllbGQuXG4gICAgY3JlYXRlQ2hpbGRGaWVsZDogZnVuY3Rpb24gKHBhcmVudEZpZWxkLCBvcHRpb25zKSB7XG5cbiAgICAgIHZhciBjaGlsZFZhbHVlID0gb3B0aW9ucy52YWx1ZTtcblxuICAgICAgdmFyIGNoaWxkRmllbGQgPSBfLmV4dGVuZCh7fSwgb3B0aW9ucy5maWVsZFRlbXBsYXRlLCB7XG4gICAgICAgIGtleTogb3B0aW9ucy5rZXksIHBhcmVudDogcGFyZW50RmllbGQsIGZpZWxkSW5kZXg6IG9wdGlvbnMuZmllbGRJbmRleCxcbiAgICAgICAgcmF3RmllbGRUZW1wbGF0ZTogb3B0aW9ucy5maWVsZFRlbXBsYXRlXG4gICAgICB9KTtcblxuICAgICAgaWYgKGNvbmZpZy5oYXNWYWx1ZShvcHRpb25zLmZpZWxkVGVtcGxhdGUsIGNoaWxkVmFsdWUpKSB7XG4gICAgICAgIGNoaWxkRmllbGQudmFsdWUgPSBjb25maWcuY29lcmNlVmFsdWUob3B0aW9ucy5maWVsZFRlbXBsYXRlLCBjaGlsZFZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNoaWxkRmllbGQudmFsdWUgPSBjb25maWcuY3JlYXRlRGVmYXVsdFZhbHVlKG9wdGlvbnMuZmllbGRUZW1wbGF0ZSk7XG4gICAgICB9XG5cbiAgICAgIGNvbmZpZy5pbml0RmllbGQoY2hpbGRGaWVsZCk7XG5cbiAgICAgIHJldHVybiBjaGlsZEZpZWxkO1xuICAgIH0sXG5cbiAgICAvLyBDcmVhdGUgYSB0ZW1wb3JhcnkgZmllbGQgYW5kIGV4dHJhY3QgaXRzIHZhbHVlLlxuICAgIGNyZWF0ZU5ld0NoaWxkRmllbGRWYWx1ZTogZnVuY3Rpb24gKHBhcmVudEZpZWxkLCBpdGVtRmllbGRJbmRleCkge1xuXG4gICAgICB2YXIgY2hpbGRGaWVsZFRlbXBsYXRlID0gY29uZmlnLmZpZWxkSXRlbUZpZWxkVGVtcGxhdGVzKHBhcmVudEZpZWxkKVtpdGVtRmllbGRJbmRleF07XG5cbiAgICAgIHZhciBuZXdWYWx1ZSA9IGNvbmZpZy5maWVsZFRlbXBsYXRlVmFsdWUoY2hpbGRGaWVsZFRlbXBsYXRlKTtcblxuICAgICAgLy8gSnVzdCBhIHBsYWNlaG9sZGVyIGtleS4gU2hvdWxkIG5vdCBiZSBpbXBvcnRhbnQuXG4gICAgICB2YXIga2V5ID0gJ19fdW5rbm93bl9rZXlfXyc7XG5cbiAgICAgIGlmIChfLmlzQXJyYXkocGFyZW50RmllbGQudmFsdWUpKSB7XG4gICAgICAgIC8vIEp1c3QgYSBwbGFjZWhvbGRlciBwb3NpdGlvbiBmb3IgYW4gYXJyYXkuXG4gICAgICAgIGtleSA9IHBhcmVudEZpZWxkLnZhbHVlLmxlbmd0aDtcbiAgICAgIH1cblxuICAgICAgLy8gSnVzdCBhIHBsYWNlaG9sZGVyIGZpZWxkIGluZGV4LiBTaG91bGQgbm90IGJlIGltcG9ydGFudC5cbiAgICAgIHZhciBmaWVsZEluZGV4ID0gMDtcbiAgICAgIGlmIChfLmlzT2JqZWN0KHBhcmVudEZpZWxkLnZhbHVlKSkge1xuICAgICAgICBmaWVsZEluZGV4ID0gT2JqZWN0LmtleXMocGFyZW50RmllbGQudmFsdWUpLmxlbmd0aDtcbiAgICAgIH1cblxuICAgICAgdmFyIGNoaWxkRmllbGQgPSBjb25maWcuY3JlYXRlQ2hpbGRGaWVsZChwYXJlbnRGaWVsZCwge1xuICAgICAgICBmaWVsZFRlbXBsYXRlOiBjaGlsZEZpZWxkVGVtcGxhdGUsIGtleToga2V5LCBmaWVsZEluZGV4OiBmaWVsZEluZGV4LCB2YWx1ZTogbmV3VmFsdWVcbiAgICAgIH0pO1xuXG4gICAgICBuZXdWYWx1ZSA9IGNvbmZpZy5pbmZsYXRlRmllbGRWYWx1ZShjaGlsZEZpZWxkKTtcblxuICAgICAgcmV0dXJuIG5ld1ZhbHVlO1xuICAgIH0sXG5cbiAgICAvLyBHaXZlbiBhIHZhbHVlLCBjcmVhdGUgYSBmaWVsZCB0ZW1wbGF0ZSBmb3IgdGhhdCB2YWx1ZS5cbiAgICBjcmVhdGVGaWVsZFRlbXBsYXRlRnJvbVZhbHVlOiBmdW5jdGlvbiAodmFsdWUpIHtcblxuICAgICAgdmFyIGZpZWxkID0ge1xuICAgICAgICB0eXBlOiAnanNvbidcbiAgICAgIH07XG4gICAgICBpZiAoXy5pc1N0cmluZyh2YWx1ZSkpIHtcbiAgICAgICAgZmllbGQgPSB7XG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSBpZiAoXy5pc051bWJlcih2YWx1ZSkpIHtcbiAgICAgICAgZmllbGQgPSB7XG4gICAgICAgICAgdHlwZTogJ251bWJlcidcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSBpZiAoXy5pc0Jvb2xlYW4odmFsdWUpKSB7XG4gICAgICAgIGZpZWxkID0ge1xuICAgICAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgICB9O1xuICAgICAgfSBlbHNlIGlmIChfLmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgIHZhciBhcnJheUl0ZW1GaWVsZHMgPSB2YWx1ZS5tYXAoZnVuY3Rpb24gKGNoaWxkVmFsdWUsIGkpIHtcbiAgICAgICAgICB2YXIgY2hpbGRGaWVsZCA9IGNvbmZpZy5jcmVhdGVGaWVsZFRlbXBsYXRlRnJvbVZhbHVlKGNoaWxkVmFsdWUpO1xuICAgICAgICAgIGNoaWxkRmllbGQua2V5ID0gaTtcbiAgICAgICAgICByZXR1cm4gY2hpbGRGaWVsZDtcbiAgICAgICAgfSk7XG4gICAgICAgIGZpZWxkID0ge1xuICAgICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgICAgZmllbGRzOiBhcnJheUl0ZW1GaWVsZHNcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSBpZiAoXy5pc09iamVjdCh2YWx1ZSkpIHtcbiAgICAgICAgdmFyIG9iamVjdEl0ZW1GaWVsZHMgPSBPYmplY3Qua2V5cyh2YWx1ZSkubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICB2YXIgY2hpbGRGaWVsZCA9IGNvbmZpZy5jcmVhdGVGaWVsZFRlbXBsYXRlRnJvbVZhbHVlKHZhbHVlW2tleV0pO1xuICAgICAgICAgIGNoaWxkRmllbGQua2V5ID0ga2V5O1xuICAgICAgICAgIGNoaWxkRmllbGQubGFiZWwgPSBjb25maWcuaHVtYW5pemUoa2V5KTtcbiAgICAgICAgICByZXR1cm4gY2hpbGRGaWVsZDtcbiAgICAgICAgfSk7XG4gICAgICAgIGZpZWxkID0ge1xuICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgIGZpZWxkczogb2JqZWN0SXRlbUZpZWxkc1xuICAgICAgICB9O1xuICAgICAgfSBlbHNlIGlmIChfLmlzTnVsbCh2YWx1ZSkpIHtcbiAgICAgICAgZmllbGQgPSB7XG4gICAgICAgICAgdHlwZTogJ2pzb24nXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4gZmllbGQ7XG4gICAgfSxcblxuICAgIC8vIERlZmF1bHQgdmFsdWUgZmFjdG9yeVxuXG4gICAgY3JlYXRlRGVmYXVsdFZhbHVlOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSkge1xuXG4gICAgICB2YXIgZGVmYXVsdFZhbHVlID0gY29uZmlnLmZpZWxkVGVtcGxhdGVEZWZhdWx0VmFsdWUoZmllbGRUZW1wbGF0ZSk7XG5cbiAgICAgIGlmICghXy5pc1VuZGVmaW5lZChkZWZhdWx0VmFsdWUpKSB7XG4gICAgICAgIHJldHVybiB1dGlscy5kZWVwQ29weShkZWZhdWx0VmFsdWUpO1xuICAgICAgfVxuXG4gICAgICB2YXIgdHlwZU5hbWUgPSBjb25maWcuZmllbGRUeXBlTmFtZShmaWVsZFRlbXBsYXRlKTtcblxuICAgICAgaWYgKGNvbmZpZ1snY3JlYXRlRGVmYXVsdFZhbHVlXycgKyB0eXBlTmFtZV0pIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZ1snY3JlYXRlRGVmYXVsdFZhbHVlXycgKyB0eXBlTmFtZV0oZmllbGRUZW1wbGF0ZSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAnJztcbiAgICB9LFxuXG4gICAgLy8gRmllbGQgaGVscGVyc1xuXG4gICAgLy8gRGV0ZXJtaW5lIGlmIGEgdmFsdWUgXCJleGlzdHNcIi5cbiAgICBoYXNWYWx1ZTogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUsIHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWUgIT09IG51bGwgJiYgIV8uaXNVbmRlZmluZWQodmFsdWUpO1xuICAgIH0sXG5cbiAgICAvLyBDb2VyY2UgYSB2YWx1ZSB0byB2YWx1ZSBhcHByb3ByaWF0ZSBmb3IgYSBmaWVsZC5cbiAgICBjb2VyY2VWYWx1ZTogZnVuY3Rpb24gKGZpZWxkLCB2YWx1ZSkge1xuXG4gICAgICB2YXIgdHlwZU5hbWUgPSBjb25maWcuZmllbGRUeXBlTmFtZShmaWVsZCk7XG5cbiAgICAgIGlmIChjb25maWdbJ2NvZXJjZVZhbHVlXycgKyB0eXBlTmFtZV0pIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZ1snY29lcmNlVmFsdWVfJyArIHR5cGVOYW1lXShmaWVsZCwgdmFsdWUpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcblxuICAgIC8vIEdpdmVuIGEgZmllbGQgYW5kIGEgY2hpbGQgdmFsdWUsIGZpbmQgdGhlIGFwcHJvcHJpYXRlIGZpZWxkIHRlbXBsYXRlIGZvclxuICAgIC8vIHRoYXQgY2hpbGQgdmFsdWUuXG4gICAgY2hpbGRGaWVsZFRlbXBsYXRlRm9yVmFsdWU6IGZ1bmN0aW9uIChmaWVsZCwgY2hpbGRWYWx1ZSkge1xuXG4gICAgICB2YXIgZmllbGRUZW1wbGF0ZTtcblxuICAgICAgdmFyIGZpZWxkVGVtcGxhdGVzID0gY29uZmlnLmZpZWxkSXRlbUZpZWxkVGVtcGxhdGVzKGZpZWxkKTtcblxuICAgICAgZmllbGRUZW1wbGF0ZSA9IF8uZmluZChmaWVsZFRlbXBsYXRlcywgZnVuY3Rpb24gKGl0ZW1GaWVsZFRlbXBsYXRlKSB7XG4gICAgICAgIHJldHVybiBjb25maWcubWF0Y2hlc0ZpZWxkVGVtcGxhdGVUb1ZhbHVlKGl0ZW1GaWVsZFRlbXBsYXRlLCBjaGlsZFZhbHVlKTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoZmllbGRUZW1wbGF0ZSkge1xuICAgICAgICByZXR1cm4gZmllbGRUZW1wbGF0ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBjb25maWcuY3JlYXRlRmllbGRUZW1wbGF0ZUZyb21WYWx1ZShjaGlsZFZhbHVlKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBtYXRjaCBmb3IgYSBmaWVsZCB0ZW1wbGF0ZS5cbiAgICBtYXRjaGVzRmllbGRUZW1wbGF0ZVRvVmFsdWU6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlLCB2YWx1ZSkge1xuICAgICAgdmFyIG1hdGNoID0gZmllbGRUZW1wbGF0ZS5tYXRjaDtcbiAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gXy5ldmVyeShPYmplY3Qua2V5cyhtYXRjaCksIGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgcmV0dXJuIF8uaXNFcXVhbChtYXRjaFtrZXldLCB2YWx1ZVtrZXldKTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvLyBGaWVsZCB0ZW1wbGF0ZSBoZWxwZXJzXG5cbiAgICAvLyBOb3JtYWxpemVkIChQYXNjYWxDYXNlKSB0eXBlIG5hbWUgZm9yIGEgZmllbGQuXG4gICAgZmllbGRUZW1wbGF0ZVR5cGVOYW1lOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSkge1xuXG4gICAgICB2YXIgdHlwZU5hbWUgPSB1dGlscy5kYXNoVG9QYXNjYWwoZmllbGRUZW1wbGF0ZS50eXBlIHx8ICd1bmRlZmluZWQnKTtcblxuICAgICAgdmFyIGFsaWFzID0gY29uZmlnWydhbGlhc18nICsgdHlwZU5hbWVdO1xuXG4gICAgICBpZiAoYWxpYXMpIHtcbiAgICAgICAgaWYgKF8uaXNGdW5jdGlvbihhbGlhcykpIHtcbiAgICAgICAgICByZXR1cm4gYWxpYXMuY2FsbChjb25maWcsIGZpZWxkVGVtcGxhdGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBhbGlhcztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZmllbGRUZW1wbGF0ZS5saXN0KSB7XG4gICAgICAgIHR5cGVOYW1lID0gJ0FycmF5JztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHR5cGVOYW1lO1xuICAgIH0sXG5cbiAgICAvLyBEZWZhdWx0IHZhbHVlIGZvciBhIGZpZWxkIHRlbXBsYXRlLlxuICAgIGZpZWxkVGVtcGxhdGVEZWZhdWx0VmFsdWU6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG5cbiAgICAgIHJldHVybiBmaWVsZFRlbXBsYXRlLmRlZmF1bHQ7XG4gICAgfSxcblxuICAgIC8vIFZhbHVlIGZvciBhIGZpZWxkIHRlbXBsYXRlLiBVc2VkIHRvIGRldGVybWluZSB0aGUgdmFsdWUgb2YgYSBuZXcgY2hpbGRcbiAgICAvLyBmaWVsZC5cbiAgICBmaWVsZFRlbXBsYXRlVmFsdWU6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG5cbiAgICAgIC8vIFRoaXMgbG9naWMgbWlnaHQgYmUgYnJpdHRsZS5cblxuICAgICAgdmFyIGRlZmF1bHRWYWx1ZSA9IGNvbmZpZy5maWVsZFRlbXBsYXRlRGVmYXVsdFZhbHVlKGZpZWxkVGVtcGxhdGUpO1xuXG4gICAgICB2YXIgbWF0Y2ggPSBjb25maWcuZmllbGRUZW1wbGF0ZU1hdGNoKGZpZWxkVGVtcGxhdGUpO1xuXG4gICAgICB2YXIgdmFsdWU7XG5cbiAgICAgIGlmIChfLmlzVW5kZWZpbmVkKGRlZmF1bHRWYWx1ZSkgJiYgIV8uaXNVbmRlZmluZWQobWF0Y2gpKSB7XG4gICAgICAgIHJldHVybiB1dGlscy5kZWVwQ29weShtYXRjaCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gY29uZmlnLmNyZWF0ZURlZmF1bHRWYWx1ZShmaWVsZFRlbXBsYXRlKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG5cbiAgICAvLyBNYXRjaCBydWxlIGZvciBhIGZpZWxkIHRlbXBsYXRlLlxuICAgIGZpZWxkVGVtcGxhdGVNYXRjaDogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcbiAgICAgIHJldHVybiBmaWVsZFRlbXBsYXRlLm1hdGNoO1xuICAgIH0sXG5cbiAgICAvLyBEZXRlcm1pbmUgaWYgYSBmaWVsZCB0ZW1wbGF0ZSBoYXMgYSBzaW5nbGUtbGluZSB2YWx1ZS5cbiAgICBmaWVsZFRlbXBsYXRlSXNTaW5nbGVMaW5lOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSkge1xuICAgICAgcmV0dXJuIGZpZWxkVGVtcGxhdGUuaXNTaW5nbGVMaW5lIHx8IGZpZWxkVGVtcGxhdGUuaXNfc2luZ2xlX2xpbmUgfHxcbiAgICAgICAgICAgICAgZmllbGRUZW1wbGF0ZS50eXBlID09PSAnc2luZ2xlLWxpbmUtc3RyaW5nJyB8fCBmaWVsZFRlbXBsYXRlLnR5cGUgPT09ICdTaW5nbGVMaW5lU3RyaW5nJztcbiAgICB9LFxuXG4gICAgLy8gRmllbGQgaGVscGVyc1xuXG4gICAgLy8gR2V0IGFuIGFycmF5IG9mIGtleXMgcmVwcmVzZW50aW5nIHRoZSBwYXRoIHRvIGEgdmFsdWUuXG4gICAgZmllbGRWYWx1ZVBhdGg6IGZ1bmN0aW9uIChmaWVsZCkge1xuXG4gICAgICB2YXIgcGFyZW50UGF0aCA9IFtdO1xuXG4gICAgICBpZiAoZmllbGQucGFyZW50KSB7XG4gICAgICAgIHBhcmVudFBhdGggPSBjb25maWcuZmllbGRWYWx1ZVBhdGgoZmllbGQucGFyZW50KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHBhcmVudFBhdGguY29uY2F0KGZpZWxkLmtleSkuZmlsdGVyKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgcmV0dXJuICFfLmlzVW5kZWZpbmVkKGtleSkgJiYga2V5ICE9PSAnJztcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvLyBDbG9uZSBhIGZpZWxkIHdpdGggYSBkaWZmZXJlbnQgdmFsdWUuXG4gICAgZmllbGRXaXRoVmFsdWU6IGZ1bmN0aW9uIChmaWVsZCwgdmFsdWUpIHtcbiAgICAgIHJldHVybiBfLmV4dGVuZCh7fSwgZmllbGQsIHt2YWx1ZTogdmFsdWV9KTtcbiAgICB9LFxuXG4gICAgZmllbGRUeXBlTmFtZTogZGVsZWdhdGVUbygnZmllbGRUZW1wbGF0ZVR5cGVOYW1lJyksXG5cbiAgICAvLyBGaWVsZCBpcyBsb2FkaW5nIGNob2ljZXMuXG4gICAgZmllbGRJc0xvYWRpbmc6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgcmV0dXJuIGZpZWxkLmlzTG9hZGluZztcbiAgICB9LFxuXG4gICAgLy8gR2V0IHRoZSBjaG9pY2VzIGZvciBhIGRyb3Bkb3duIGZpZWxkLlxuICAgIGZpZWxkQ2hvaWNlczogZnVuY3Rpb24gKGZpZWxkKSB7XG5cbiAgICAgIHJldHVybiBjb25maWcubm9ybWFsaXplQ2hvaWNlcyhmaWVsZC5jaG9pY2VzKTtcbiAgICB9LFxuXG4gICAgLy8gR2V0IHRoZSBjaG9pY2VzIGZvciBhIHByZXR0eSBkcm9wZG93biBmaWVsZC5cbiAgICBmaWVsZFByZXR0eUNob2ljZXM6IGZ1bmN0aW9uIChmaWVsZCkge1xuXG4gICAgICByZXR1cm4gY29uZmlnLm5vcm1hbGl6ZVByZXR0eUNob2ljZXMoZmllbGQuY2hvaWNlcyk7XG4gICAgfSxcblxuICAgIC8vIEdldCBhIHNldCBvZiBib29sZWFuIGNob2ljZXMgZm9yIGEgZmllbGQuXG4gICAgZmllbGRCb29sZWFuQ2hvaWNlczogZnVuY3Rpb24gKGZpZWxkKSB7XG5cbiAgICAgIHZhciBjaG9pY2VzID0gY29uZmlnLmZpZWxkQ2hvaWNlcyhmaWVsZCk7XG5cbiAgICAgIGlmIChjaG9pY2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICBsYWJlbDogJ3llcycsXG4gICAgICAgICAgdmFsdWU6IHRydWVcbiAgICAgICAgfSwge1xuICAgICAgICAgIGxhYmVsOiAnbm8nLFxuICAgICAgICAgIHZhbHVlOiBmYWxzZVxuICAgICAgICB9XTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNob2ljZXMubWFwKGZ1bmN0aW9uIChjaG9pY2UpIHtcbiAgICAgICAgaWYgKF8uaXNCb29sZWFuKGNob2ljZS52YWx1ZSkpIHtcbiAgICAgICAgICByZXR1cm4gY2hvaWNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfLmV4dGVuZCh7fSwgY2hvaWNlLCB7XG4gICAgICAgICAgdmFsdWU6IGNvbmZpZy5jb2VyY2VWYWx1ZVRvQm9vbGVhbihjaG9pY2UudmFsdWUpXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8vIEdldCBhIHNldCBvZiByZXBsYWNlbWVudCBjaG9pY2VzIGZvciBhIGZpZWxkLlxuICAgIGZpZWxkUmVwbGFjZUNob2ljZXM6IGZ1bmN0aW9uIChmaWVsZCkge1xuXG4gICAgICByZXR1cm4gY29uZmlnLm5vcm1hbGl6ZUNob2ljZXMoZmllbGQucmVwbGFjZUNob2ljZXMpO1xuICAgIH0sXG5cbiAgICAvLyBUaGUgYWN0aXZlIHNlbGVjdGVkIGNob2ljZSBjb3VsZCBiZSB1bmF2YWlsYWJsZSBpbiB0aGUgY3VycmVudCBsaXN0IG9mXG4gICAgLy8gY2hvaWNlcy4gVGhpcyBwcm92aWRlcyB0aGUgc2VsZWN0ZWQgY2hvaWNlIGluIHRoYXQgY2FzZS5cbiAgICBmaWVsZFNlbGVjdGVkQ2hvaWNlOiBmdW5jdGlvbiAoZmllbGQpIHtcblxuICAgICAgcmV0dXJuIGZpZWxkLnNlbGVjdGVkQ2hvaWNlIHx8IG51bGw7XG4gICAgfSxcblxuICAgIC8vIFRoZSBhY3RpdmUgcmVwbGFjZSBsYWJlbHMgY291bGQgYmUgdW5hdmlsYWJsZSBpbiB0aGUgY3VycmVudCBsaXN0IG9mXG4gICAgLy8gcmVwbGFjZSBjaG9pY2VzLiBUaGlzIHByb3ZpZGVzIHRoZSBjdXJyZW50bHkgdXNlZCByZXBsYWNlIGxhYmVscyBpblxuICAgIC8vIHRoYXQgY2FzZS5cbiAgICBmaWVsZFNlbGVjdGVkUmVwbGFjZUNob2ljZXM6IGZ1bmN0aW9uIChmaWVsZCkge1xuXG4gICAgICByZXR1cm4gY29uZmlnLm5vcm1hbGl6ZUNob2ljZXMoZmllbGQuc2VsZWN0ZWRSZXBsYWNlQ2hvaWNlcyk7XG4gICAgfSxcblxuICAgIC8vIEdldCBhIGxhYmVsIGZvciBhIGZpZWxkLlxuICAgIGZpZWxkTGFiZWw6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgcmV0dXJuIGZpZWxkLmxhYmVsO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgYSBwbGFjZWhvbGRlciAoanVzdCBhIGRlZmF1bHQgZGlzcGxheSB2YWx1ZSwgbm90IGEgZGVmYXVsdCB2YWx1ZSkgZm9yIGEgZmllbGQuXG4gICAgZmllbGRQbGFjZWhvbGRlcjogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICByZXR1cm4gZmllbGQucGxhY2Vob2xkZXI7XG4gICAgfSxcblxuICAgIC8vIEdldCB0aGUgaGVscCB0ZXh0IGZvciBhIGZpZWxkLlxuICAgIGZpZWxkSGVscFRleHQ6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgcmV0dXJuIGZpZWxkLmhlbHBfdGV4dF9odG1sIHx8IGZpZWxkLmhlbHBfdGV4dCB8fCBmaWVsZC5oZWxwVGV4dCB8fCBmaWVsZC5oZWxwVGV4dEh0bWw7XG4gICAgfSxcblxuICAgIC8vIEdldCB3aGV0aGVyIG9yIG5vdCBhIGZpZWxkIGlzIHJlcXVpcmVkLlxuICAgIGZpZWxkSXNSZXF1aXJlZDogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICByZXR1cm4gZmllbGQucmVxdWlyZWQgPyB0cnVlIDogZmFsc2U7XG4gICAgfSxcblxuICAgIC8vIERldGVybWluZSBpZiB2YWx1ZSBmb3IgdGhpcyBmaWVsZCBpcyBub3QgYSBsZWFmIHZhbHVlLlxuICAgIGZpZWxkSGFzVmFsdWVDaGlsZHJlbjogZnVuY3Rpb24gKGZpZWxkKSB7XG5cbiAgICAgIHZhciBkZWZhdWx0VmFsdWUgPSBjb25maWcuY3JlYXRlRGVmYXVsdFZhbHVlKGZpZWxkKTtcblxuICAgICAgaWYgKF8uaXNPYmplY3QoZGVmYXVsdFZhbHVlKSB8fCBfLmlzQXJyYXkoZGVmYXVsdFZhbHVlKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgdGhlIGNoaWxkIGZpZWxkIHRlbXBsYXRlcyBmb3IgdGhpcyBmaWVsZC5cbiAgICBmaWVsZENoaWxkRmllbGRUZW1wbGF0ZXM6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgcmV0dXJuIGZpZWxkLmZpZWxkcyB8fCBbXTtcbiAgICB9LFxuXG4gICAgLy8gR2V0IHRoZSBmaWVsZCB0ZW1wbGF0ZXMgZm9yIGVhY2ggaXRlbSBvZiB0aGlzIGZpZWxkLiAoRm9yIGR5bmFtaWMgY2hpbGRyZW4sXG4gICAgLy8gbGlrZSBhcnJheXMuKVxuICAgIGZpZWxkSXRlbUZpZWxkVGVtcGxhdGVzOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgIGlmICghZmllbGQuaXRlbUZpZWxkcykge1xuICAgICAgICByZXR1cm4gW3t0eXBlOiAndGV4dCd9XTtcbiAgICAgIH1cbiAgICAgIGlmICghXy5pc0FycmF5KGZpZWxkLml0ZW1GaWVsZHMpKSB7XG4gICAgICAgIHJldHVybiBbZmllbGQuaXRlbUZpZWxkc107XG4gICAgICB9XG4gICAgICByZXR1cm4gZmllbGQuaXRlbUZpZWxkcztcbiAgICB9LFxuXG4gICAgLy8gVGVtcGxhdGUgZm9yIGEgY3VzdG9tIGZpZWxkIGZvciBhIGRyb3Bkb3duLlxuICAgIGZpZWxkQ3VzdG9tRmllbGRUZW1wbGF0ZTogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICByZXR1cm4gZmllbGQuY3VzdG9tRmllbGQ7XG4gICAgfSxcblxuICAgIGZpZWxkSXNTaW5nbGVMaW5lOiBkZWxlZ2F0ZVRvKCdmaWVsZFRlbXBsYXRlSXNTaW5nbGVMaW5lJyksXG5cbiAgICAvLyBHZXQgd2hldGhlciBvciBub3QgYSBmaWVsZCBpcyBjb2xsYXBzZWQuXG4gICAgZmllbGRJc0NvbGxhcHNlZDogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICByZXR1cm4gZmllbGQuY29sbGFwc2VkID8gdHJ1ZSA6IGZhbHNlO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgd2hldGVyIG9yIG5vdCBhIGZpZWxkIGNhbiBiZSBjb2xsYXBzZWQuXG4gICAgZmllbGRJc0NvbGxhcHNpYmxlOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgIHJldHVybiBmaWVsZC5jb2xsYXBzaWJsZSB8fCAhXy5pc1VuZGVmaW5lZChmaWVsZC5jb2xsYXBzZWQpO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgdGhlIG51bWJlciBvZiByb3dzIGZvciBhIGZpZWxkLlxuICAgIGZpZWxkUm93czogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICByZXR1cm4gZmllbGQucm93cztcbiAgICB9LFxuXG4gICAgZmllbGRFcnJvcnM6IGZ1bmN0aW9uIChmaWVsZCkge1xuXG4gICAgICB2YXIgZXJyb3JzID0gW107XG5cbiAgICAgIGlmIChjb25maWcuaXNLZXkoZmllbGQua2V5KSkge1xuICAgICAgICBjb25maWcudmFsaWRhdGVGaWVsZChmaWVsZCwgZXJyb3JzKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGVycm9ycztcbiAgICB9LFxuXG4gICAgZmllbGRNYXRjaDogZGVsZWdhdGVUbygnZmllbGRUZW1wbGF0ZU1hdGNoJyksXG5cbiAgICAvLyBSZXR1cm4gdHJ1ZSBpZiBmaWVsZCBpcyByZWFkLW9ubHksIG9yIGlzIGEgZGVzY2VuZGFudCBvZiBhIHJlYWQtb25seSBmaWVsZFxuICAgIGZpZWxkSXNSZWFkT25seTogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICBpZiAoZmllbGQucmVhZE9ubHkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9IGVsc2UgaWYgKGZpZWxkLnBhcmVudCkge1xuICAgICAgICByZXR1cm4gY29uZmlnLmZpZWxkSXNSZWFkT25seShmaWVsZC5wYXJlbnQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBPdGhlciBoZWxwZXJzXG5cbiAgICAvLyBDb252ZXJ0IGEga2V5IHRvIGEgbmljZSBodW1hbi1yZWFkYWJsZSB2ZXJzaW9uLlxuICAgIGh1bWFuaXplOiBmdW5jdGlvbihwcm9wZXJ0eSkge1xuICAgICAgcHJvcGVydHkgPSBwcm9wZXJ0eS5yZXBsYWNlKC9cXHtcXHsvZywgJycpO1xuICAgICAgcHJvcGVydHkgPSBwcm9wZXJ0eS5yZXBsYWNlKC9cXH1cXH0vZywgJycpO1xuICAgICAgcmV0dXJuIHByb3BlcnR5LnJlcGxhY2UoL18vZywgJyAnKVxuICAgICAgLnJlcGxhY2UoLyhcXHcrKS9nLCBmdW5jdGlvbihtYXRjaCkge1xuICAgICAgICByZXR1cm4gbWF0Y2guY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBtYXRjaC5zbGljZSgxKTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvLyBOb3JtYWxpemUgc29tZSBjaG9pY2VzIGZvciBhIGRyb3AtZG93bi5cbiAgICBub3JtYWxpemVDaG9pY2VzOiBmdW5jdGlvbiAoY2hvaWNlcykge1xuXG4gICAgICBpZiAoIWNob2ljZXMpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfVxuXG4gICAgICAvLyBDb252ZXJ0IGNvbW1hIHNlcGFyYXRlZCBzdHJpbmcgdG8gYXJyYXkgb2Ygc3RyaW5ncy5cbiAgICAgIGlmIChfLmlzU3RyaW5nKGNob2ljZXMpKSB7XG4gICAgICAgIGNob2ljZXMgPSBjaG9pY2VzLnNwbGl0KCcsJyk7XG4gICAgICB9XG5cbiAgICAgIC8vIENvbnZlcnQgb2JqZWN0IHRvIGFycmF5IG9mIG9iamVjdHMgd2l0aCBgdmFsdWVgIGFuZCBgbGFiZWxgIHByb3BlcnRpZXMuXG4gICAgICBpZiAoIV8uaXNBcnJheShjaG9pY2VzKSAmJiBfLmlzT2JqZWN0KGNob2ljZXMpKSB7XG4gICAgICAgIGNob2ljZXMgPSBPYmplY3Qua2V5cyhjaG9pY2VzKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWx1ZToga2V5LFxuICAgICAgICAgICAgbGFiZWw6IGNob2ljZXNba2V5XVxuICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBDb3B5IHRoZSBhcnJheSBvZiBjaG9pY2VzIHNvIHdlIGNhbiBtYW5pcHVsYXRlIHRoZW0uXG4gICAgICBjaG9pY2VzID0gY2hvaWNlcy5zbGljZSgwKTtcblxuICAgICAgLy8gQXJyYXkgb2YgY2hvaWNlIGFycmF5cyBzaG91bGQgYmUgZmxhdHRlbmVkLlxuICAgICAgY2hvaWNlcyA9IF8uZmxhdHRlbihjaG9pY2VzKTtcblxuICAgICAgY2hvaWNlcy5mb3JFYWNoKGZ1bmN0aW9uIChjaG9pY2UsIGkpIHtcbiAgICAgICAgLy8gQ29udmVydCBhbnkgc3RyaW5nIGNob2ljZXMgdG8gb2JqZWN0cyB3aXRoIGB2YWx1ZWAgYW5kIGBsYWJlbGBcbiAgICAgICAgLy8gcHJvcGVydGllcy5cbiAgICAgICAgaWYgKF8uaXNTdHJpbmcoY2hvaWNlKSkge1xuICAgICAgICAgIGNob2ljZXNbaV0gPSB7XG4gICAgICAgICAgICB2YWx1ZTogY2hvaWNlLFxuICAgICAgICAgICAgbGFiZWw6IGNvbmZpZy5odW1hbml6ZShjaG9pY2UpXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWNob2ljZXNbaV0ubGFiZWwpIHtcbiAgICAgICAgICBjaG9pY2VzW2ldLmxhYmVsID0gY29uZmlnLmh1bWFuaXplKGNob2ljZXNbaV0udmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGNob2ljZXM7XG4gICAgfSxcblxuICAgIC8vIE5vcm1hbGl6ZSBjaG9pY2VzIGZvciBhIHByZXR0eSBkcm9wIGRvd24sIHdpdGggJ3NhbXBsZScgdmFsdWVzXG4gICAgbm9ybWFsaXplUHJldHR5Q2hvaWNlczogZnVuY3Rpb24gKGNob2ljZXMpIHtcbiAgICAgIGlmICghXy5pc0FycmF5KGNob2ljZXMpICYmIF8uaXNPYmplY3QoY2hvaWNlcykpIHtcbiAgICAgICAgY2hvaWNlcyA9IE9iamVjdC5rZXlzKGNob2ljZXMpLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbHVlOiBrZXksXG4gICAgICAgICAgICBsYWJlbDogY2hvaWNlc1trZXldLFxuICAgICAgICAgICAgc2FtcGxlOiBrZXlcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNvbmZpZy5ub3JtYWxpemVDaG9pY2VzKGNob2ljZXMpO1xuICAgIH0sXG5cbiAgICAvLyBDb2VyY2UgYSB2YWx1ZSB0byBhIGJvb2xlYW5cbiAgICBjb2VyY2VWYWx1ZVRvQm9vbGVhbjogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICBpZiAoIV8uaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgICAgIC8vIEp1c3QgdXNlIHRoZSBkZWZhdWx0IHRydXRoaW5lc3MuXG4gICAgICAgIHJldHVybiB2YWx1ZSA/IHRydWUgOiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHZhbHVlID0gdmFsdWUudG9Mb3dlckNhc2UoKTtcbiAgICAgIGlmICh2YWx1ZSA9PT0gJycgfHwgdmFsdWUgPT09ICdubycgfHwgdmFsdWUgPT09ICdvZmYnIHx8IHZhbHVlID09PSAnZmFsc2UnKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cbiAgICAvLyBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIHZhbGlkIGtleS5cbiAgICBpc0tleTogZnVuY3Rpb24gKGtleSkge1xuICAgICAgcmV0dXJuIChfLmlzTnVtYmVyKGtleSkgJiYga2V5ID49IDApIHx8IChfLmlzU3RyaW5nKGtleSkgJiYga2V5ICE9PSAnJyk7XG4gICAgfSxcblxuICAgIC8vIEZhc3Qgd2F5IHRvIGNoZWNrIGZvciBlbXB0eSBvYmplY3QuXG4gICAgaXNFbXB0eU9iamVjdDogZnVuY3Rpb24gKG9iaikge1xuICAgICAgZm9yKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcblxuICAgIGFjdGlvbkNob2ljZUxhYmVsOiBmdW5jdGlvbiAoYWN0aW9uKSB7XG4gICAgICByZXR1cm4gdXRpbHMuY2FwaXRhbGl6ZShhY3Rpb24pLnJlcGxhY2UoL1stXS9nLCAnICcpO1xuICAgIH0sXG5cbiAgICBpc1NlYXJjaFN0cmluZ0luQ2hvaWNlOiBmdW5jdGlvbiAoc2VhcmNoU3RyaW5nLCBjaG9pY2UpIHtcbiAgICAgIHJldHVybiBjaG9pY2UubGFiZWwgJiYgY2hvaWNlLmxhYmVsLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzZWFyY2hTdHJpbmcudG9Mb3dlckNhc2UoKSkgPiAtMTtcbiAgICB9XG4gIH07XG59O1xuIiwiLy8gIyBmb3JtYXRpY1xuXG4vKlxuVGhlIHJvb3QgZm9ybWF0aWMgY29tcG9uZW50LlxuXG5UaGUgcm9vdCBmb3JtYXRpYyBjb21wb25lbnQgaXMgYWN0dWFsbHkgdHdvIGNvbXBvbmVudHMuIFRoZSBtYWluIGNvbXBvbmVudCBpc1xuYSBjb250cm9sbGVkIGNvbXBvbmVudCB3aGVyZSB5b3UgbXVzdCBwYXNzIHRoZSB2YWx1ZSBpbiB3aXRoIGVhY2ggcmVuZGVyLiBUaGlzXG5pcyBhY3R1YWxseSB3cmFwcGVkIGluIGFub3RoZXIgY29tcG9uZW50IHdoaWNoIGFsbG93cyB5b3UgdG8gdXNlIGZvcm1hdGljIGFzXG5hbiB1bmNvbnRyb2xsZWQgY29tcG9uZW50IHdoZXJlIGl0IHJldGFpbnMgdGhlIHN0YXRlIG9mIHRoZSB2YWx1ZS4gVGhlIHdyYXBwZXJcbmlzIHdoYXQgaXMgYWN0dWFsbHkgZXhwb3J0ZWQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIF8gPSByZXF1aXJlKCcuL3VuZGFzaCcpO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbnZhciBkZWZhdWx0Q29uZmlnUGx1Z2luID0gcmVxdWlyZSgnLi9kZWZhdWx0LWNvbmZpZycpO1xuXG52YXIgY3JlYXRlQ29uZmlnID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgdmFyIHBsdWdpbnMgPSBbZGVmYXVsdENvbmZpZ1BsdWdpbl0uY29uY2F0KGFyZ3MpO1xuXG4gIHJldHVybiBwbHVnaW5zLnJlZHVjZShmdW5jdGlvbiAoY29uZmlnLCBwbHVnaW4pIHtcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKHBsdWdpbikpIHtcbiAgICAgIHZhciBleHRlbnNpb25zID0gcGx1Z2luKGNvbmZpZyk7XG4gICAgICBpZiAoZXh0ZW5zaW9ucykge1xuICAgICAgICBfLmV4dGVuZChjb25maWcsIGV4dGVuc2lvbnMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBfLmV4dGVuZChjb25maWcsIHBsdWdpbik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbmZpZztcbiAgfSwge30pO1xufTtcblxudmFyIGRlZmF1bHRDb25maWcgPSBjcmVhdGVDb25maWcoKTtcblxuLy8gVGhlIG1haW4gZm9ybWF0aWMgY29tcG9uZW50IHRoYXQgcmVuZGVycyB0aGUgZm9ybS5cbnZhciBGb3JtYXRpY0NvbnRyb2xsZWRDbGFzcyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0Zvcm1hdGljQ29udHJvbGxlZCcsXG5cbiAgLy8gUmVzcG9uZCB0byBhbnkgdmFsdWUgY2hhbmdlcy5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgaW5mbykge1xuICAgIGlmICghdGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpbmZvID0gXy5leHRlbmQoe30sIGluZm8pO1xuICAgIGluZm8ucGF0aCA9IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkVmFsdWVQYXRoKGluZm8uZmllbGQpO1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UobmV3VmFsdWUsIGluZm8pO1xuICB9LFxuXG4gIC8vIFJlc3BvbmQgdG8gYW55IGFjdGlvbnMgb3RoZXIgdGhhbiB2YWx1ZSBjaGFuZ2VzLiAoRm9yIGV4YW1wbGUsIGZvY3VzIGFuZFxuICAvLyBibHVyLilcbiAgb25BY3Rpb246IGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgaWYgKCF0aGlzLnByb3BzLm9uQWN0aW9uKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGluZm8gPSBfLmV4dGVuZCh7fSwgaW5mbyk7XG4gICAgaW5mby5wYXRoID0gdGhpcy5wcm9wcy5jb25maWcuZmllbGRWYWx1ZVBhdGgoaW5mby5maWVsZCk7XG4gICAgdGhpcy5wcm9wcy5vbkFjdGlvbihpbmZvKTtcbiAgfSxcblxuICAvLyBSZW5kZXIgdGhlIHJvb3QgY29tcG9uZW50IGJ5IGRlbGVnYXRpbmcgdG8gdGhlIGNvbmZpZy5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG5cbiAgICByZXR1cm4gY29uZmlnLnJlbmRlckZvcm1hdGljQ29tcG9uZW50KHRoaXMpO1xuICB9XG59KTtcblxudmFyIEZvcm1hdGljQ29udHJvbGxlZCA9IFJlYWN0LmNyZWF0ZUZhY3RvcnkoRm9ybWF0aWNDb250cm9sbGVkQ2xhc3MpO1xuXG4vLyBBIHdyYXBwZXIgY29tcG9uZW50IHRoYXQgaXMgYWN0dWFsbHkgZXhwb3J0ZWQgYW5kIGNhbiBhbGxvdyBmb3JtYXRpYyB0byBiZVxuLy8gdXNlZCBpbiBhbiBcInVuY29udHJvbGxlZFwiIG1hbm5lci4gKFNlZSB1bmNvbnRyb2xsZWQgY29tcG9uZW50cyBpbiB0aGUgUmVhY3Rcbi8vIGRvY3VtZW50YXRpb24gZm9yIGFuIGV4cGxhbmF0aW9uIG9mIHRoZSBkaWZmZXJlbmNlLilcbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnRm9ybWF0aWMnLFxuXG4gIC8vIEV4cG9ydCBzb21lIHN0dWZmIGFzIHN0YXRpY3MuXG4gIHN0YXRpY3M6IHtcbiAgICBjcmVhdGVDb25maWc6IGNyZWF0ZUNvbmZpZyxcbiAgICBhdmFpbGFibGVNaXhpbnM6IHtcbiAgICAgIGNsaWNrT3V0c2lkZTogcmVxdWlyZSgnLi9taXhpbnMvY2xpY2stb3V0c2lkZS5qcycpLFxuICAgICAgZmllbGQ6IHJlcXVpcmUoJy4vbWl4aW5zL2ZpZWxkLmpzJyksXG4gICAgICBoZWxwZXI6IHJlcXVpcmUoJy4vbWl4aW5zL2hlbHBlci5qcycpLFxuICAgICAgcmVzaXplOiByZXF1aXJlKCcuL21peGlucy9yZXNpemUuanMnKSxcbiAgICAgIHNjcm9sbDogcmVxdWlyZSgnLi9taXhpbnMvc2Nyb2xsLmpzJyksXG4gICAgICB1bmRvU3RhY2s6IHJlcXVpcmUoJy4vbWl4aW5zL3VuZG8tc3RhY2suanMnKVxuICAgIH0sXG4gICAgcGx1Z2luczoge1xuICAgICAgYm9vdHN0cmFwOiByZXF1aXJlKCcuL3BsdWdpbnMvYm9vdHN0cmFwJyksXG4gICAgICBtZXRhOiByZXF1aXJlKCcuL3BsdWdpbnMvbWV0YScpLFxuICAgICAgcmVmZXJlbmNlOiByZXF1aXJlKCcuL3BsdWdpbnMvcmVmZXJlbmNlJyksXG4gICAgICBlbGVtZW50Q2xhc3NlczogcmVxdWlyZSgnLi9wbHVnaW5zL2VsZW1lbnQtY2xhc3NlcycpXG4gICAgfSxcbiAgICB1dGlsczogdXRpbHNcbiAgfSxcblxuICAvLyBJZiB3ZSBnb3QgYSB2YWx1ZSwgdHJlYXQgdGhpcyBjb21wb25lbnQgYXMgY29udHJvbGxlZC4gRWl0aGVyIHdheSwgcmV0YWluXG4gIC8vIHRoZSB2YWx1ZSBpbiB0aGUgc3RhdGUuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpc0NvbnRyb2xsZWQ6ICFfLmlzVW5kZWZpbmVkKHRoaXMucHJvcHMudmFsdWUpLFxuICAgICAgdmFsdWU6IF8uaXNVbmRlZmluZWQodGhpcy5wcm9wcy52YWx1ZSkgPyB0aGlzLnByb3BzLmRlZmF1bHRWYWx1ZSA6IHRoaXMucHJvcHMudmFsdWVcbiAgICB9O1xuICB9LFxuXG4gIC8vIElmIHRoaXMgaXMgYSBjb250cm9sbGVkIGNvbXBvbmVudCwgY2hhbmdlIG91ciBzdGF0ZSB0byByZWZsZWN0IHRoZSBuZXdcbiAgLy8gdmFsdWUuIEZvciB1bmNvbnRyb2xsZWQgY29tcG9uZW50cywgaWdub3JlIGFueSB2YWx1ZSBjaGFuZ2VzLlxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV3UHJvcHMpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5pc0NvbnRyb2xsZWQpIHtcbiAgICAgIGlmICghXy5pc1VuZGVmaW5lZChuZXdQcm9wcy52YWx1ZSkpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgdmFsdWU6IG5ld1Byb3BzLnZhbHVlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBJZiB0aGlzIGlzIGFuIHVuY29udHJvbGxlZCBjb21wb25lbnQsIHNldCBvdXIgc3RhdGUgdG8gcmVmbGVjdCB0aGUgbmV3XG4gIC8vIHZhbHVlLiBFaXRoZXIgd2F5LCBjYWxsIHRoZSBvbkNoYW5nZSBjYWxsYmFjay5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgaW5mbykge1xuICAgIGlmICghdGhpcy5zdGF0ZS5pc0NvbnRyb2xsZWQpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICB2YWx1ZTogbmV3VmFsdWVcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoIXRoaXMucHJvcHMub25DaGFuZ2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSwgaW5mbyk7XG4gIH0sXG5cbiAgLy8gQW55IGFjdGlvbnMgc2hvdWxkIGJlIHNlbnQgdG8gdGhlIGdlbmVyaWMgb25BY3Rpb24gY2FsbGJhY2sgYnV0IGFsc28gc3BsaXRcbiAgLy8gaW50byBkaXNjcmVldCBjYWxsYmFja3MgcGVyIGFjdGlvbi5cbiAgb25BY3Rpb246IGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgaWYgKHRoaXMucHJvcHMub25BY3Rpb24pIHtcbiAgICAgIHRoaXMucHJvcHMub25BY3Rpb24oaW5mbyk7XG4gICAgfVxuICAgIHZhciBhY3Rpb24gPSB1dGlscy5kYXNoVG9QYXNjYWwoaW5mby5hY3Rpb24pO1xuICAgIGlmICh0aGlzLnByb3BzWydvbicgKyBhY3Rpb25dKSB7XG4gICAgICB0aGlzLnByb3BzWydvbicgKyBhY3Rpb25dKGluZm8pO1xuICAgIH1cbiAgfSxcblxuICAvLyBSZW5kZXIgdGhlIHdyYXBwZXIgY29tcG9uZW50IChieSBqdXN0IGRlbGVnYXRpbmcgdG8gdGhlIG1haW4gY29tcG9uZW50KS5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWcgfHwgZGVmYXVsdENvbmZpZztcbiAgICB2YXIgdmFsdWUgPSB0aGlzLnN0YXRlLnZhbHVlO1xuXG4gICAgaWYgKHRoaXMuc3RhdGUuaXNDb250cm9sbGVkKSB7XG4gICAgICBpZiAoIXRoaXMucHJvcHMub25DaGFuZ2UpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1lvdSBzaG91bGQgc3VwcGx5IGFuIG9uQ2hhbmdlIGhhbmRsZXIgaWYgeW91IHN1cHBseSBhIHZhbHVlLicpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBwcm9wcyA9IHtcbiAgICAgIGNvbmZpZzogY29uZmlnLFxuICAgICAgLy8gQWxsb3cgZmllbGQgdGVtcGxhdGVzIHRvIGJlIHBhc3NlZCBpbiBhcyBgZmllbGRgIG9yIGBmaWVsZHNgLiBBZnRlciB0aGlzLCBzdG9wXG4gICAgICAvLyBjYWxsaW5nIHRoZW0gZmllbGRzLlxuICAgICAgZmllbGRUZW1wbGF0ZTogdGhpcy5wcm9wcy5maWVsZCxcbiAgICAgIGZpZWxkVGVtcGxhdGVzOiB0aGlzLnByb3BzLmZpZWxkcyxcbiAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgb25BY3Rpb246IHRoaXMub25BY3Rpb25cbiAgICB9O1xuXG4gICAgXy5lYWNoKHRoaXMucHJvcHMsIGZ1bmN0aW9uIChwcm9wVmFsdWUsIGtleSkge1xuICAgICAgaWYgKCEoa2V5IGluIHByb3BzKSkge1xuICAgICAgICBwcm9wc1trZXldID0gcHJvcFZhbHVlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIEZvcm1hdGljQ29udHJvbGxlZChwcm9wcyk7XG4gIH1cblxufSk7XG4iLCIvLyAjIGNsaWNrLW91dHNpZGUgbWl4aW5cblxuLypcblRoZXJlJ3Mgbm8gbmF0aXZlIFJlYWN0IHdheSB0byBkZXRlY3QgY2xpY2tpbmcgb3V0c2lkZSBhbiBlbGVtZW50LiBTb21ldGltZXNcbnRoaXMgaXMgdXNlZnVsLCBzbyB0aGF0J3Mgd2hhdCB0aGlzIG1peGluIGRvZXMuIFRvIHVzZSBpdCwgbWl4IGl0IGluIGFuZCB1c2UgaXRcbmZyb20geW91ciBjb21wb25lbnQgbGlrZSB0aGlzOlxuXG5gYGBqc1xubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi5taXhpbnMvY2xpY2stb3V0c2lkZScpXSxcblxuICBvbkNsaWNrT3V0c2lkZTogZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUubG9nKCdjbGlja2VkIG91dHNpZGUhJyk7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNldE9uQ2xpY2tPdXRzaWRlKCdteURpdicsIHRoaXMub25DbGlja091dHNpZGUpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSZWFjdC5ET00uZGl2KHtyZWY6ICdteURpdid9LFxuICAgICAgJ0hlbGxvISdcbiAgICApXG4gIH1cbn0pO1xuYGBgXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gcmVxdWlyZSgnLi4vdW5kYXNoJyk7XG5cbnZhciBoYXNBbmNlc3RvciA9IGZ1bmN0aW9uIChjaGlsZCwgcGFyZW50KSB7XG4gIGlmIChjaGlsZC5wYXJlbnROb2RlID09PSBwYXJlbnQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBpZiAoY2hpbGQucGFyZW50Tm9kZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gaGFzQW5jZXN0b3IoY2hpbGQucGFyZW50Tm9kZSwgcGFyZW50KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGlzTm9kZU91dHNpZGU6IGZ1bmN0aW9uIChub2RlT3V0LCBub2RlSW4pIHtcbiAgICBpZiAobm9kZU91dCA9PT0gbm9kZUluKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmIChoYXNBbmNlc3Rvcihub2RlT3V0LCBub2RlSW4pKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuXG4gIGlzTm9kZUluc2lkZTogZnVuY3Rpb24gKG5vZGVJbiwgbm9kZU91dCkge1xuICAgIHJldHVybiAhdGhpcy5pc05vZGVPdXRzaWRlKG5vZGVJbiwgbm9kZU91dCk7XG4gIH0sXG5cbiAgX29uQ2xpY2tNb3VzZWRvd246IGZ1bmN0aW9uKCkge1xuICAgIF8uZWFjaCh0aGlzLmNsaWNrT3V0c2lkZUhhbmRsZXJzLCBmdW5jdGlvbiAoZnVuY3MsIHJlZikge1xuICAgICAgaWYgKHRoaXMucmVmc1tyZWZdKSB7XG4gICAgICAgIHRoaXMuX21vdXNlZG93blJlZnNbcmVmXSA9IHRydWU7XG4gICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfSxcblxuICBfb25DbGlja01vdXNldXA6IGZ1bmN0aW9uIChldmVudCkge1xuICAgIF8uZWFjaCh0aGlzLmNsaWNrT3V0c2lkZUhhbmRsZXJzLCBmdW5jdGlvbiAoZnVuY3MsIHJlZikge1xuICAgICAgaWYgKHRoaXMucmVmc1tyZWZdICYmIHRoaXMuX21vdXNlZG93blJlZnNbcmVmXSkge1xuICAgICAgICBpZiAodGhpcy5pc05vZGVPdXRzaWRlKGV2ZW50LnRhcmdldCwgdGhpcy5yZWZzW3JlZl0uZ2V0RE9NTm9kZSgpKSkge1xuICAgICAgICAgIGZ1bmNzLmZvckVhY2goZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICBmbi5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLl9tb3VzZWRvd25SZWZzW3JlZl0gPSBmYWxzZTtcbiAgICB9LmJpbmQodGhpcykpO1xuICB9LFxuXG4gIHNldE9uQ2xpY2tPdXRzaWRlOiBmdW5jdGlvbiAocmVmLCBmbikge1xuICAgIGlmICghdGhpcy5jbGlja091dHNpZGVIYW5kbGVyc1tyZWZdKSB7XG4gICAgICB0aGlzLmNsaWNrT3V0c2lkZUhhbmRsZXJzW3JlZl0gPSBbXTtcbiAgICB9XG4gICAgdGhpcy5jbGlja091dHNpZGVIYW5kbGVyc1tyZWZdLnB1c2goZm4pO1xuICB9LFxuXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jbGlja091dHNpZGVIYW5kbGVycyA9IHt9O1xuICAgIHRoaXMuX2RpZE1vdXNlRG93biA9IGZhbHNlO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX29uQ2xpY2tNb3VzZWRvd24pO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9vbkNsaWNrTW91c2V1cCk7XG4gICAgLy9kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uQ2xpY2tEb2N1bWVudCk7XG4gICAgdGhpcy5fbW91c2Vkb3duUmVmcyA9IHt9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jbGlja091dHNpZGVIYW5kbGVycyA9IHt9O1xuICAgIC8vZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkNsaWNrRG9jdW1lbnQpO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9vbkNsaWNrTW91c2V1cCk7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5fb25DbGlja01vdXNlZG93bik7XG4gIH1cbn07XG4iLCIvLyAjIGZpZWxkIG1peGluXG5cbi8qXG5UaGlzIG1peGluIGdldHMgbWl4ZWQgaW50byBhbGwgZmllbGQgY29tcG9uZW50cy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSByZXF1aXJlKCcuLi91bmRhc2gnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgLy8gU2lnbmFsIGEgY2hhbmdlIGluIHZhbHVlLlxuICBvbkNoYW5nZVZhbHVlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHZhbHVlLCB7XG4gICAgICBmaWVsZDogdGhpcy5wcm9wcy5maWVsZFxuICAgIH0pO1xuICB9LFxuXG4gIC8vIEJ1YmJsZSB1cCBhIHZhbHVlLlxuICBvbkJ1YmJsZVZhbHVlOiBmdW5jdGlvbiAodmFsdWUsIGluZm8pIHtcbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHZhbHVlLCBpbmZvKTtcbiAgfSxcblxuICAvLyBTdGFydCBhbiBhY3Rpb24gYnViYmxpbmcgdXAgdGhyb3VnaCBwYXJlbnQgY29tcG9uZW50cy5cbiAgb25TdGFydEFjdGlvbjogZnVuY3Rpb24gKGFjdGlvbiwgcHJvcHMpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5vbkFjdGlvbikge1xuICAgICAgdmFyIGluZm8gPSBfLmV4dGVuZCh7fSwgcHJvcHMpO1xuICAgICAgaW5mby5hY3Rpb24gPSBhY3Rpb247XG4gICAgICBpbmZvLmZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcbiAgICAgIHRoaXMucHJvcHMub25BY3Rpb24oaW5mbyk7XG4gICAgfVxuICB9LFxuXG4gIG9uRm9jdXNBY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLm9uU3RhcnRBY3Rpb24oJ2ZvY3VzJyk7XG4gIH0sXG5cbiAgb25CbHVyQWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5vblN0YXJ0QWN0aW9uKCdibHVyJyk7XG4gIH0sXG5cbiAgLy8gQnViYmxlIHVwIGFuIGFjdGlvbi5cbiAgb25CdWJibGVBY3Rpb246IGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgaWYgKHRoaXMucHJvcHMub25BY3Rpb24pIHtcbiAgICAgIHRoaXMucHJvcHMub25BY3Rpb24oaW5mbyk7XG4gICAgfVxuICB9LFxuXG4gIC8vIERlbGVnYXRlIHJlbmRlcmluZyBiYWNrIHRvIGNvbmZpZyBzbyBpdCBjYW4gYmUgd3JhcHBlZC5cbiAgcmVuZGVyV2l0aENvbmZpZzogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnByb3BzLmNvbmZpZy5yZW5kZXJGaWVsZENvbXBvbmVudCh0aGlzKTtcbiAgfSxcblxuICBpc1JlYWRPbmx5OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMuY29uZmlnLmZpZWxkSXNSZWFkT25seSh0aGlzLnByb3BzLmZpZWxkKTtcbiAgfVxufTtcbiIsIi8vICMgaGVscGVyIG1peGluXG5cbi8qXG5UaGlzIGdldHMgbWl4ZWQgaW50byBhbGwgaGVscGVyIGNvbXBvbmVudHMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gcmVxdWlyZSgnLi4vdW5kYXNoJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIC8vIERlbGVnYXRlIHJlbmRlcmluZyBiYWNrIHRvIGNvbmZpZyBzbyBpdCBjYW4gYmUgd3JhcHBlZC5cbiAgcmVuZGVyV2l0aENvbmZpZzogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnByb3BzLmNvbmZpZy5yZW5kZXJDb21wb25lbnQodGhpcyk7XG4gIH0sXG5cbiAgLy8gU3RhcnQgYW4gYWN0aW9uIGJ1YmJsaW5nIHVwIHRocm91Z2ggcGFyZW50IGNvbXBvbmVudHMuXG4gIG9uU3RhcnRBY3Rpb246IGZ1bmN0aW9uIChhY3Rpb24sIHByb3BzKSB7XG4gICAgaWYgKHRoaXMucHJvcHMub25BY3Rpb24pIHtcbiAgICAgIHZhciBpbmZvID0gXy5leHRlbmQoe30sIHByb3BzKTtcbiAgICAgIGluZm8uYWN0aW9uID0gYWN0aW9uO1xuICAgICAgaW5mby5maWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG4gICAgICB0aGlzLnByb3BzLm9uQWN0aW9uKGluZm8pO1xuICAgIH1cbiAgfSxcblxuICAvLyBCdWJibGUgdXAgYW4gYWN0aW9uLlxuICBvbkJ1YmJsZUFjdGlvbjogZnVuY3Rpb24gKGluZm8pIHtcbiAgICBpZiAodGhpcy5wcm9wcy5vbkFjdGlvbikge1xuICAgICAgdGhpcy5wcm9wcy5vbkFjdGlvbihpbmZvKTtcbiAgICB9XG4gIH0sXG5cbiAgb25Gb2N1c0FjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMub25TdGFydEFjdGlvbignZm9jdXMnKTtcbiAgfSxcblxuICBvbkJsdXJBY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLm9uU3RhcnRBY3Rpb24oJ2JsdXInKTtcbiAgfSxcblxuICBpc1JlYWRPbmx5OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMuY29uZmlnLmZpZWxkSXNSZWFkT25seSh0aGlzLnByb3BzLmZpZWxkKTtcbiAgfVxufTtcbiIsIi8vICMgcmVzaXplIG1peGluXG5cbi8qXG5Zb3UnZCB0aGluayBpdCB3b3VsZCBiZSBwcmV0dHkgZWFzeSB0byBkZXRlY3Qgd2hlbiBhIERPTSBlbGVtZW50IGlzIHJlc2l6ZWQuXG5BbmQgeW91J2QgYmUgd3JvbmcuIFRoZXJlIGFyZSB2YXJpb3VzIHRyaWNrcywgYnV0IG5vbmUgb2YgdGhlbSB3b3JrIHZlcnkgd2VsbC5cblNvLCB1c2luZyBnb29kIG9sJyBwb2xsaW5nIGhlcmUuIFRvIHRyeSB0byBiZSBhcyBlZmZpY2llbnQgYXMgcG9zc2libGUsIHRoZXJlXG5pcyBvbmx5IGEgc2luZ2xlIHNldEludGVydmFsIHVzZWQgZm9yIGFsbCBlbGVtZW50cy4gVG8gdXNlOlxuXG5gYGBqc1xubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL3Jlc2l6ZScpXSxcblxuICBvblJlc2l6ZTogZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUubG9nKCdyZXNpemVkIScpO1xuICB9LFxuXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zZXRPblJlc2l6ZSgnbXlUZXh0JywgdGhpcy5vblJlc2l6ZSk7XG4gIH0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICAuLi5cbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUmVhY3QuRE9NLnRleHRhcmVhKHtyZWY6ICdteVRleHQnLCB2YWx1ZTogdGhpcy5wcm9wcy52YWx1ZSwgb25DaGFuZ2U6IC4uLn0pXG4gIH1cbn0pO1xuYGBgXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBpZCA9IDA7XG5cbnZhciByZXNpemVJbnRlcnZhbEVsZW1lbnRzID0ge307XG52YXIgcmVzaXplSW50ZXJ2YWxFbGVtZW50c0NvdW50ID0gMDtcbnZhciByZXNpemVJbnRlcnZhbFRpbWVyID0gbnVsbDtcblxudmFyIGNoZWNrRWxlbWVudHMgPSBmdW5jdGlvbiAoKSB7XG4gIE9iamVjdC5rZXlzKHJlc2l6ZUludGVydmFsRWxlbWVudHMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIHZhciBlbGVtZW50ID0gcmVzaXplSW50ZXJ2YWxFbGVtZW50c1trZXldO1xuICAgIGlmIChlbGVtZW50LmNsaWVudFdpZHRoICE9PSBlbGVtZW50Ll9fcHJldkNsaWVudFdpZHRoIHx8IGVsZW1lbnQuY2xpZW50SGVpZ2h0ICE9PSBlbGVtZW50Ll9fcHJldkNsaWVudEhlaWdodCkge1xuICAgICAgZWxlbWVudC5fX3ByZXZDbGllbnRXaWR0aCA9IGVsZW1lbnQuY2xpZW50V2lkdGg7XG4gICAgICBlbGVtZW50Ll9fcHJldkNsaWVudEhlaWdodCA9IGVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgICAgdmFyIGhhbmRsZXJzID0gZWxlbWVudC5fX3Jlc2l6ZUhhbmRsZXJzO1xuICAgICAgaGFuZGxlcnMuZm9yRWFjaChmdW5jdGlvbiAoaGFuZGxlcikge1xuICAgICAgICBoYW5kbGVyKCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sIDEwMCk7XG59O1xuXG52YXIgYWRkUmVzaXplSW50ZXJ2YWxIYW5kbGVyID0gZnVuY3Rpb24gKGVsZW1lbnQsIGZuKSB7XG4gIGlmIChyZXNpemVJbnRlcnZhbFRpbWVyID09PSBudWxsKSB7XG4gICAgcmVzaXplSW50ZXJ2YWxUaW1lciA9IHNldEludGVydmFsKGNoZWNrRWxlbWVudHMsIDEwMCk7XG4gIH1cbiAgaWYgKCEoJ19fcmVzaXplSWQnIGluIGVsZW1lbnQpKSB7XG4gICAgaWQrKztcbiAgICBlbGVtZW50Ll9fcHJldkNsaWVudFdpZHRoID0gZWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICBlbGVtZW50Ll9fcHJldkNsaWVudEhlaWdodCA9IGVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgIGVsZW1lbnQuX19yZXNpemVJZCA9IGlkO1xuICAgIHJlc2l6ZUludGVydmFsRWxlbWVudHNDb3VudCsrO1xuICAgIHJlc2l6ZUludGVydmFsRWxlbWVudHNbaWRdID0gZWxlbWVudDtcbiAgICBlbGVtZW50Ll9fcmVzaXplSGFuZGxlcnMgPSBbXTtcbiAgfVxuICBlbGVtZW50Ll9fcmVzaXplSGFuZGxlcnMucHVzaChmbik7XG59O1xuXG52YXIgcmVtb3ZlUmVzaXplSW50ZXJ2YWxIYW5kbGVycyA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIGlmICghKCdfX3Jlc2l6ZUlkJyBpbiBlbGVtZW50KSkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgcmVzaXplSWQgPSBlbGVtZW50Ll9fcmVzaXplSWQ7XG4gIGRlbGV0ZSBlbGVtZW50Ll9fcmVzaXplSWQ7XG4gIGRlbGV0ZSBlbGVtZW50Ll9fcmVzaXplSGFuZGxlcnM7XG4gIGRlbGV0ZSByZXNpemVJbnRlcnZhbEVsZW1lbnRzW3Jlc2l6ZUlkXTtcbiAgcmVzaXplSW50ZXJ2YWxFbGVtZW50c0NvdW50LS07XG4gIGlmIChyZXNpemVJbnRlcnZhbEVsZW1lbnRzQ291bnQgPCAxKSB7XG4gICAgY2xlYXJJbnRlcnZhbChyZXNpemVJbnRlcnZhbFRpbWVyKTtcbiAgICByZXNpemVJbnRlcnZhbFRpbWVyID0gbnVsbDtcbiAgfVxufTtcblxudmFyIG9uUmVzaXplID0gZnVuY3Rpb24gKHJlZiwgZm4pIHtcbiAgZm4ocmVmKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMub25SZXNpemVXaW5kb3cpIHtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLm9uUmVzaXplV2luZG93KTtcbiAgICB9XG4gICAgdGhpcy5yZXNpemVFbGVtZW50UmVmcyA9IHt9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMub25SZXNpemVXaW5kb3cpIHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLm9uUmVzaXplV2luZG93KTtcbiAgICB9XG4gICAgT2JqZWN0LmtleXModGhpcy5yZXNpemVFbGVtZW50UmVmcykuZm9yRWFjaChmdW5jdGlvbiAocmVmKSB7XG4gICAgICByZW1vdmVSZXNpemVJbnRlcnZhbEhhbmRsZXJzKHRoaXMucmVmc1tyZWZdLmdldERPTU5vZGUoKSk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfSxcblxuICBzZXRPblJlc2l6ZTogZnVuY3Rpb24gKHJlZiwgZm4pIHtcbiAgICBpZiAoIXRoaXMucmVzaXplRWxlbWVudFJlZnNbcmVmXSkge1xuICAgICAgdGhpcy5yZXNpemVFbGVtZW50UmVmc1tyZWZdID0gdHJ1ZTtcbiAgICB9XG4gICAgYWRkUmVzaXplSW50ZXJ2YWxIYW5kbGVyKHRoaXMucmVmc1tyZWZdLmdldERPTU5vZGUoKSwgb25SZXNpemUuYmluZCh0aGlzLCByZWYsIGZuKSk7XG4gIH1cbn07XG4iLCIvLyAjIHNjcm9sbCBtaXhpblxuXG4vKlxuQ3VycmVudGx5IHVudXNlZC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSB7XG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMub25TY3JvbGxXaW5kb3cpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHRoaXMub25TY3JvbGxXaW5kb3cpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMub25TY3JvbGxXaW5kb3cpIHtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHRoaXMub25TY3JvbGxXaW5kb3cpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn07XG4iLCIvLyAjIHVuZG8tc3RhY2sgbWl4aW5cblxuLypcbkdpdmVzIHlvdXIgY29tcG9uZW50IGFuIHVuZG8gc3RhY2suXG4qL1xuXG4vLyBodHRwOi8vcHJvbWV0aGV1c3Jlc2VhcmNoLmdpdGh1Yi5pby9yZWFjdC1mb3Jtcy9leGFtcGxlcy91bmRvLmh0bWxcblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge3VuZG86IFtdLCByZWRvOiBbXX07XG4gIH0sXG5cbiAgc25hcHNob3Q6IGZ1bmN0aW9uKCkge1xuICAgIHZhciB1bmRvID0gdGhpcy5zdGF0ZS51bmRvLmNvbmNhdCh0aGlzLmdldFN0YXRlU25hcHNob3QoKSk7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnN0YXRlLnVuZG9EZXB0aCA9PT0gJ251bWJlcicpIHtcbiAgICAgIGlmICh1bmRvLmxlbmd0aCA+IHRoaXMuc3RhdGUudW5kb0RlcHRoKSB7XG4gICAgICAgIHVuZG8uc2hpZnQoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5zZXRTdGF0ZSh7dW5kbzogdW5kbywgcmVkbzogW119KTtcbiAgfSxcblxuICBoYXNVbmRvOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS51bmRvLmxlbmd0aCA+IDA7XG4gIH0sXG5cbiAgaGFzUmVkbzogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUucmVkby5sZW5ndGggPiAwO1xuICB9LFxuXG4gIHJlZG86IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3VuZG9JbXBsKHRydWUpO1xuICB9LFxuXG4gIHVuZG86IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3VuZG9JbXBsKCk7XG4gIH0sXG5cbiAgX3VuZG9JbXBsOiBmdW5jdGlvbihpc1JlZG8pIHtcbiAgICB2YXIgdW5kbyA9IHRoaXMuc3RhdGUudW5kby5zbGljZSgwKTtcbiAgICB2YXIgcmVkbyA9IHRoaXMuc3RhdGUucmVkby5zbGljZSgwKTtcbiAgICB2YXIgc25hcHNob3Q7XG5cbiAgICBpZiAoaXNSZWRvKSB7XG4gICAgICBpZiAocmVkby5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgc25hcHNob3QgPSByZWRvLnBvcCgpO1xuICAgICAgdW5kby5wdXNoKHRoaXMuZ2V0U3RhdGVTbmFwc2hvdCgpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHVuZG8ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHNuYXBzaG90ID0gdW5kby5wb3AoKTtcbiAgICAgIHJlZG8ucHVzaCh0aGlzLmdldFN0YXRlU25hcHNob3QoKSk7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZVNuYXBzaG90KHNuYXBzaG90KTtcbiAgICB0aGlzLnNldFN0YXRlKHt1bmRvOiB1bmRvLCByZWRvOiByZWRvfSk7XG4gIH1cbn07XG4iLCIvLyAjIGJvb3RzdHJhcCBwbHVnaW5cblxuLypcblRoZSBib290c3RyYXAgcGx1Z2luIHNuZWFrcyBpbiBzb21lIGNsYXNzZXMgdG8gZWxlbWVudHMgc28gdGhhdCBpdCBwbGF5cyB3ZWxsXG53aXRoIFR3aXR0ZXIgQm9vdHN0cmFwLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4uL3VuZGFzaCcpO1xuXG4vLyBEZWNsYXJlIHNvbWUgY2xhc3NlcyBhbmQgbGFiZWxzIGZvciBlYWNoIGVsZW1lbnQuXG52YXIgbW9kaWZpZXJzID0ge1xuXG4gICdGaWVsZCc6IHtjbGFzc2VzOiB7J2Zvcm0tZ3JvdXAnOiB0cnVlfX0sXG4gICdIZWxwJzoge2NsYXNzZXM6IHsnaGVscC1ibG9jayc6IHRydWV9fSxcbiAgJ1NhbXBsZSc6IHtjbGFzc2VzOiB7J2hlbHAtYmxvY2snOiB0cnVlfX0sXG4gICdBcnJheUNvbnRyb2wnOiB7Y2xhc3Nlczogeydmb3JtLWlubGluZSc6IHRydWV9fSxcbiAgJ0FycmF5SXRlbSc6IHtjbGFzc2VzOiB7J3dlbGwnOiB0cnVlfX0sXG4gICdPYmplY3RJdGVtJzoge2NsYXNzZXM6IHsnd2VsbCc6IHRydWV9fSxcbiAgJ0ZpZWxkVGVtcGxhdGVDaG9pY2VzJzoge2NsYXNzZXM6IHsnZm9ybS1jb250cm9sJzogdHJ1ZX19LFxuICAnQWRkSXRlbSc6IHtjbGFzc2VzOiB7J2dseXBoaWNvbiBnbHlwaGljb24tcGx1cyc6IHRydWV9LCBsYWJlbDogJyd9LFxuICAnUmVtb3ZlSXRlbSc6IHtjbGFzc2VzOiB7J2dseXBoaWNvbiBnbHlwaGljb24tcmVtb3ZlJzogdHJ1ZX0sIGxhYmVsOiAnJ30sXG4gICdNb3ZlSXRlbUJhY2snOiB7Y2xhc3NlczogeydnbHlwaGljb24gZ2x5cGhpY29uLWFycm93LXVwJzogdHJ1ZX0sIGxhYmVsOiAnJ30sXG4gICdNb3ZlSXRlbUZvcndhcmQnOiB7Y2xhc3NlczogeydnbHlwaGljb24gZ2x5cGhpY29uLWFycm93LWRvd24nOiB0cnVlfSwgbGFiZWw6ICcnfSxcbiAgJ09iamVjdEl0ZW1LZXknOiB7Y2xhc3Nlczogeydmb3JtLWNvbnRyb2wnOiB0cnVlfX0sXG5cbiAgJ1NpbmdsZUxpbmVTdHJpbmcnOiB7Y2xhc3Nlczogeydmb3JtLWNvbnRyb2wnOiB0cnVlfX0sXG4gICdTdHJpbmcnOiB7Y2xhc3Nlczogeydmb3JtLWNvbnRyb2wnOiB0cnVlfX0sXG4gICdQcmV0dHlUZXh0Jzoge2NsYXNzZXM6IHsnZm9ybS1jb250cm9sJzogdHJ1ZX19LFxuICAnSnNvbic6IHtjbGFzc2VzOiB7J2Zvcm0tY29udHJvbCc6IHRydWV9fSxcbiAgJ1NlbGVjdFZhbHVlJzoge2NsYXNzZXM6IHsnZm9ybS1jb250cm9sJzogdHJ1ZX19XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjb25maWcpIHtcblxuICB2YXIgY3JlYXRlRWxlbWVudCA9IGNvbmZpZy5jcmVhdGVFbGVtZW50O1xuXG4gIHJldHVybiB7XG4gICAgY3JlYXRlRWxlbWVudDogZnVuY3Rpb24gKG5hbWUsIHByb3BzLCBjaGlsZHJlbikge1xuXG4gICAgICBuYW1lID0gY29uZmlnLmVsZW1lbnROYW1lKG5hbWUpO1xuXG4gICAgICB2YXIgbW9kaWZpZXIgPSBtb2RpZmllcnNbbmFtZV07XG5cbiAgICAgIGlmIChtb2RpZmllcikge1xuICAgICAgICAvLyBJZiB0aGVyZSBpcyBhIG1vZGlmaWVyIGZvciB0aGlzIGVsZW1lbnQsIGFkZCB0aGUgY2xhc3NlcyBhbmQgbGFiZWwuXG4gICAgICAgIHByb3BzID0gXy5leHRlbmQoe30sIHByb3BzKTtcbiAgICAgICAgcHJvcHMuY2xhc3NlcyA9IF8uZXh0ZW5kKHt9LCBwcm9wcy5jbGFzc2VzLCBtb2RpZmllci5jbGFzc2VzKTtcbiAgICAgICAgaWYgKCdsYWJlbCcgaW4gbW9kaWZpZXIpIHtcbiAgICAgICAgICBwcm9wcy5sYWJlbCA9IG1vZGlmaWVyLmxhYmVsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjcmVhdGVFbGVtZW50KG5hbWUsIHByb3BzLCBjaGlsZHJlbik7XG4gICAgfVxuICB9O1xufTtcbiIsIi8vICMgZWxlbWVudC1jbGFzc2VzIHBsdWdpblxuXG4vKlxuVGhpcyBwbHVnaW5zIHByb3ZpZGVzIGEgY29uZmlnIG1ldGhvZCBhZGRFbGVtZW50Q2xhc3MgdGhhdCBsZXRzIHlvdSBhZGQgb24gYVxuY2xhc3MgdG8gYW4gZWxlbWVudC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSByZXF1aXJlKCcuLi91bmRhc2gnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgdmFyIGNyZWF0ZUVsZW1lbnQgPSBjb25maWcuY3JlYXRlRWxlbWVudDtcblxuICB2YXIgZWxlbWVudENsYXNzZXMgPSB7fTtcblxuICByZXR1cm4ge1xuICAgIGFkZEVsZW1lbnRDbGFzczogZnVuY3Rpb24gKG5hbWUsIGNsYXNzTmFtZSkge1xuXG4gICAgICBuYW1lID0gY29uZmlnLmVsZW1lbnROYW1lKG5hbWUpO1xuXG4gICAgICBpZiAoIWVsZW1lbnRDbGFzc2VzW25hbWVdKSB7XG4gICAgICAgIGVsZW1lbnRDbGFzc2VzW25hbWVdID0ge307XG4gICAgICB9XG5cbiAgICAgIGVsZW1lbnRDbGFzc2VzW25hbWVdW2NsYXNzTmFtZV0gPSB0cnVlO1xuICAgIH0sXG5cbiAgICAvLyBXcmFwIHRoZSBjcmVhdGVFbGVtZW50IG1ldGhvZC5cbiAgICBjcmVhdGVFbGVtZW50OiBmdW5jdGlvbiAobmFtZSwgcHJvcHMsIGNoaWxkcmVuKSB7XG5cbiAgICAgIG5hbWUgPSBjb25maWcuZWxlbWVudE5hbWUobmFtZSk7XG5cbiAgICAgIGlmIChlbGVtZW50Q2xhc3Nlc1tuYW1lXSkge1xuICAgICAgICBwcm9wcyA9IF8uZXh0ZW5kKHt9LCBwcm9wcywge2NsYXNzZXM6IGVsZW1lbnRDbGFzc2VzW25hbWVdfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjcmVhdGVFbGVtZW50KG5hbWUsIHByb3BzLCBjaGlsZHJlbik7XG4gICAgfVxuICB9O1xufTtcbiIsIi8vICMgbWV0YSBwbHVnaW5cblxuLypcblRoZSBtZXRhIHBsdWdpbiBsZXRzIHlvdSBwYXNzIGluIGEgbWV0YSBwcm9wIHRvIGZvcm1hdGljLiBUaGUgcHJvcCB0aGVuIGdldHNcbnBhc3NlZCB0aHJvdWdoIGFzIGEgcHJvcGVydHkgZm9yIGV2ZXJ5IGZpZWxkLiBZb3UgY2FuIHRoZW4gd3JhcCBgaW5pdEZpZWxkYCB0b1xuZ2V0IHlvdXIgbWV0YSB2YWx1ZXMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNvbmZpZykge1xuXG4gIHZhciBpbml0Um9vdEZpZWxkID0gY29uZmlnLmluaXRSb290RmllbGQ7XG4gIHZhciBpbml0RmllbGQgPSBjb25maWcuaW5pdEZpZWxkO1xuXG4gIHJldHVybiB7XG4gICAgaW5pdFJvb3RGaWVsZDogZnVuY3Rpb24gKGZpZWxkLCBwcm9wcykge1xuXG4gICAgICBmaWVsZC5tZXRhID0gcHJvcHMubWV0YSB8fCB7fTtcblxuICAgICAgaW5pdFJvb3RGaWVsZChmaWVsZCwgcHJvcHMpO1xuICAgIH0sXG5cbiAgICBpbml0RmllbGQ6IGZ1bmN0aW9uIChmaWVsZCkge1xuXG4gICAgICBpZiAoZmllbGQucGFyZW50ICYmIGZpZWxkLnBhcmVudC5tZXRhKSB7XG4gICAgICAgIGZpZWxkLm1ldGEgPSBmaWVsZC5wYXJlbnQubWV0YTtcbiAgICAgIH1cblxuICAgICAgaW5pdEZpZWxkKGZpZWxkKTtcbiAgICB9XG4gIH07XG59O1xuIiwiLy8gIyByZWZlcmVuY2UgcGx1Z2luXG5cbi8qXG5UaGlzIHBsdWdpbiBhbGxvd3MgZmllbGRzIHRvIGJlIHN0cmluZ3MgYW5kIHJlZmVyZW5jZSBvdGhlciBmaWVsZHMgYnkga2V5IG9yXG5pZC4gSXQgYWxzbyBhbGxvd3MgYSBmaWVsZCB0byBleHRlbmQgYW5vdGhlciBmaWVsZCB3aXRoXG5leHRlbmRzOiBbJ2ZvbycsICdiYXInXSB3aGVyZSAnZm9vJyBhbmQgJ2JhcicgcmVmZXIgdG8gb3RoZXIga2V5cyBvciBpZHMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gcmVxdWlyZSgnLi4vdW5kYXNoJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNvbmZpZykge1xuXG4gIHZhciBpbml0RmllbGQgPSBjb25maWcuaW5pdEZpZWxkO1xuXG4gIHJldHVybiB7XG4gICAgLy8gTG9vayBmb3IgYSB0ZW1wbGF0ZSBpbiB0aGlzIGZpZWxkIG9yIGFueSBvZiBpdHMgcGFyZW50cy5cbiAgICBmaW5kRmllbGRUZW1wbGF0ZTogZnVuY3Rpb24gKGZpZWxkLCBuYW1lKSB7XG5cbiAgICAgIGlmIChmaWVsZC50ZW1wbGF0ZXNbbmFtZV0pIHtcbiAgICAgICAgcmV0dXJuIGZpZWxkLnRlbXBsYXRlc1tuYW1lXTtcbiAgICAgIH1cblxuICAgICAgaWYgKGZpZWxkLnBhcmVudCkge1xuICAgICAgICByZXR1cm4gY29uZmlnLmZpbmRGaWVsZFRlbXBsYXRlKGZpZWxkLnBhcmVudCwgbmFtZSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG5cbiAgICAvLyBJbmhlcml0IGZyb20gYW55IGZpZWxkIHRlbXBsYXRlcyB0aGF0IHRoaXMgZmllbGQgdGVtcGxhdGVcbiAgICAvLyBleHRlbmRzLlxuICAgIHJlc29sdmVGaWVsZFRlbXBsYXRlOiBmdW5jdGlvbiAoZmllbGQsIGZpZWxkVGVtcGxhdGUpIHtcblxuICAgICAgaWYgKCFmaWVsZFRlbXBsYXRlLmV4dGVuZHMpIHtcbiAgICAgICAgcmV0dXJuIGZpZWxkVGVtcGxhdGU7XG4gICAgICB9XG5cbiAgICAgIHZhciBleHQgPSBmaWVsZFRlbXBsYXRlLmV4dGVuZHM7XG5cbiAgICAgIGlmICghXy5pc0FycmF5KGV4dCkpIHtcbiAgICAgICAgZXh0ID0gW2V4dF07XG4gICAgICB9XG5cbiAgICAgIHZhciBiYXNlcyA9IGV4dC5tYXAoZnVuY3Rpb24gKGJhc2UpIHtcbiAgICAgICAgdmFyIHRlbXBsYXRlID0gY29uZmlnLmZpbmRGaWVsZFRlbXBsYXRlKGZpZWxkLCBiYXNlKTtcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGVtcGxhdGUgJyArIGJhc2UgKyAnIG5vdCBmb3VuZC4nKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGVtcGxhdGU7XG4gICAgICB9KTtcblxuICAgICAgdmFyIGNoYWluID0gW3t9XS5jb25jYXQoYmFzZXMucmV2ZXJzZSgpLmNvbmNhdChbZmllbGRUZW1wbGF0ZV0pKTtcbiAgICAgIGZpZWxkVGVtcGxhdGUgPSBfLmV4dGVuZC5hcHBseShfLCBjaGFpbik7XG5cbiAgICAgIHJldHVybiBmaWVsZFRlbXBsYXRlO1xuICAgIH0sXG5cbiAgICAvLyBXcmFwIHRoZSBpbml0RmllbGQgbWV0aG9kLlxuICAgIGluaXRGaWVsZDogZnVuY3Rpb24gKGZpZWxkKSB7XG5cbiAgICAgIHZhciB0ZW1wbGF0ZXMgPSBmaWVsZC50ZW1wbGF0ZXMgPSB7fTtcblxuICAgICAgdmFyIGNoaWxkRmllbGRUZW1wbGF0ZXMgPSBjb25maWcuZmllbGRDaGlsZEZpZWxkVGVtcGxhdGVzKGZpZWxkKTtcblxuICAgICAgLy8gQWRkIGVhY2ggb2YgdGhlIGNoaWxkIGZpZWxkIHRlbXBsYXRlcyB0byBvdXIgdGVtcGxhdGUgbWFwLlxuICAgICAgY2hpbGRGaWVsZFRlbXBsYXRlcy5mb3JFYWNoKGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG5cbiAgICAgICAgaWYgKF8uaXNTdHJpbmcoZmllbGRUZW1wbGF0ZSkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIga2V5ID0gZmllbGRUZW1wbGF0ZS5rZXk7XG4gICAgICAgIHZhciBpZCA9IGZpZWxkVGVtcGxhdGUuaWQ7XG5cbiAgICAgICAgaWYgKGZpZWxkVGVtcGxhdGUudGVtcGxhdGUpIHtcbiAgICAgICAgICBmaWVsZFRlbXBsYXRlID0gXy5leHRlbmQoe30sIGZpZWxkVGVtcGxhdGUsIHt0ZW1wbGF0ZTogZmFsc2V9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghXy5pc1VuZGVmaW5lZChrZXkpICYmIGtleSAhPT0gJycpIHtcbiAgICAgICAgICB0ZW1wbGF0ZXNba2V5XSA9IGZpZWxkVGVtcGxhdGU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQoaWQpICYmIGlkICE9PSAnJykge1xuICAgICAgICAgIHRlbXBsYXRlc1tpZF0gPSBmaWVsZFRlbXBsYXRlO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gUmVzb2x2ZSBhbnkgcmVmZXJlbmNlcyB0byBvdGhlciBmaWVsZCB0ZW1wbGF0ZXMuXG4gICAgICBpZiAoY2hpbGRGaWVsZFRlbXBsYXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGZpZWxkLmZpZWxkcyA9IGNoaWxkRmllbGRUZW1wbGF0ZXMubWFwKGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgICAgICAgaWYgKF8uaXNTdHJpbmcoZmllbGRUZW1wbGF0ZSkpIHtcbiAgICAgICAgICAgIGZpZWxkVGVtcGxhdGUgPSBjb25maWcuZmluZEZpZWxkVGVtcGxhdGUoZmllbGQsIGZpZWxkVGVtcGxhdGUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBjb25maWcucmVzb2x2ZUZpZWxkVGVtcGxhdGUoZmllbGQsIGZpZWxkVGVtcGxhdGUpO1xuICAgICAgICB9KTtcblxuICAgICAgICBmaWVsZC5maWVsZHMgPSBmaWVsZC5maWVsZHMuZmlsdGVyKGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgICAgICAgcmV0dXJuICFmaWVsZFRlbXBsYXRlLnRlbXBsYXRlO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgdmFyIGl0ZW1GaWVsZFRlbXBsYXRlcyA9IGNvbmZpZy5maWVsZEl0ZW1GaWVsZFRlbXBsYXRlcyhmaWVsZCk7XG5cbiAgICAgIC8vIFJlc29sdmUgYW55IG9mIG91ciBpdGVtIGZpZWxkIHRlbXBsYXRlcy4gKEZpZWxkIHRlbXBsYXRlcyBmb3IgZHluYW1pY1xuICAgICAgLy8gY2hpbGQgZmllbGRzLilcbiAgICAgIGlmIChpdGVtRmllbGRUZW1wbGF0ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBmaWVsZC5pdGVtRmllbGRzID0gaXRlbUZpZWxkVGVtcGxhdGVzLm1hcChmdW5jdGlvbiAoaXRlbUZpZWxkVGVtcGxhdGUpIHtcbiAgICAgICAgICBpZiAoXy5pc1N0cmluZyhpdGVtRmllbGRUZW1wbGF0ZSkpIHtcbiAgICAgICAgICAgIGl0ZW1GaWVsZFRlbXBsYXRlID0gY29uZmlnLmZpbmRGaWVsZFRlbXBsYXRlKGZpZWxkLCBpdGVtRmllbGRUZW1wbGF0ZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIGNvbmZpZy5yZXNvbHZlRmllbGRUZW1wbGF0ZShmaWVsZCwgaXRlbUZpZWxkVGVtcGxhdGUpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaW5pdEZpZWxkKGZpZWxkKTtcbiAgICB9XG4gIH07XG5cbn07XG4iLCJ2YXIgXyA9IHt9O1xuXG5fLmFzc2lnbiA9IF8uZXh0ZW5kID0gcmVxdWlyZSgnb2JqZWN0LWFzc2lnbicpO1xuXy5pc0VxdWFsID0gcmVxdWlyZSgnZGVlcC1lcXVhbCcpO1xuXG4vLyBUaGVzZSBhcmUgbm90IG5lY2Vzc2FyaWx5IGNvbXBsZXRlIGltcGxlbWVudGF0aW9ucy4gVGhleSdyZSBqdXN0IGVub3VnaCBmb3Jcbi8vIHdoYXQncyB1c2VkIGluIGZvcm1hdGljLlxuXG5fLmZsYXR0ZW4gPSAoYXJyYXlzKSA9PiBbXS5jb25jYXQuYXBwbHkoW10sIGFycmF5cyk7XG5cbl8uaXNTdHJpbmcgPSB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnO1xuXy5pc1VuZGVmaW5lZCA9IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCc7XG5fLmlzT2JqZWN0ID0gdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jztcbl8uaXNBcnJheSA9IHZhbHVlID0+IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG5fLmlzTnVtYmVyID0gdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJztcbl8uaXNCb29sZWFuID0gdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbic7XG5fLmlzTnVsbCA9IHZhbHVlID0+IHZhbHVlID09PSBudWxsO1xuXy5pc0Z1bmN0aW9uID0gdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nO1xuXG5fLmNsb25lID0gdmFsdWUgPT4ge1xuICBpZiAoIV8uaXNPYmplY3QodmFsdWUpKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIHJldHVybiBfLmlzQXJyYXkodmFsdWUpID8gdmFsdWUuc2xpY2UoKSA6IF8uYXNzaWduKHt9LCB2YWx1ZSk7XG59O1xuXG5fLmZpbmQgPSAoaXRlbXMsIHRlc3RGbikgPT4ge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHRlc3RGbihpdGVtc1tpXSkpIHtcbiAgICAgIHJldHVybiBpdGVtc1tpXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHZvaWQgMDtcbn07XG5cbl8uZXZlcnkgPSAoaXRlbXMsIHRlc3RGbikgPT4ge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKCF0ZXN0Rm4oaXRlbXNbaV0pKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufTtcblxuXy5lYWNoID0gKG9iaiwgaXRlcmF0ZUZuKSA9PiB7XG4gIE9iamVjdC5rZXlzKG9iaikuZm9yRWFjaChrZXkgPT4ge1xuICAgIGl0ZXJhdGVGbihvYmpba2V5XSwga2V5KTtcbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IF87XG4iLCIvLyAjIHV0aWxzXG5cbi8qXG5KdXN0IHNvbWUgc2hhcmVkIHV0aWxpdHkgZnVuY3Rpb25zLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vdW5kYXNoJyk7XG5cbnZhciB1dGlscyA9IGV4cG9ydHM7XG5cbi8vIENvcHkgb2JqIHJlY3Vyc2luZyBkZWVwbHkuXG51dGlscy5kZWVwQ29weSA9IGZ1bmN0aW9uIChvYmopIHtcbiAgaWYgKF8uaXNBcnJheShvYmopKSB7XG4gICAgcmV0dXJuIG9iai5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHJldHVybiB1dGlscy5kZWVwQ29weShpdGVtKTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmIChfLmlzRnVuY3Rpb24ob2JqKSkge1xuICAgIHJldHVybiBvYmo7XG4gIH0gZWxzZSBpZiAoXy5pc051bGwob2JqKSkge1xuICAgIHJldHVybiBvYmo7XG4gIH0gZWxzZSBpZiAoXy5pc09iamVjdChvYmopKSB7XG4gICAgdmFyIGNvcHkgPSB7fTtcbiAgICBfLmVhY2gob2JqLCBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgY29weVtrZXldID0gdXRpbHMuZGVlcENvcHkodmFsdWUpO1xuICAgIH0pO1xuICAgIHJldHVybiBjb3B5O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBvYmo7XG4gIH1cbn07XG5cbi8vIENhY2hlIGZvciBzdHJpbmdzIGNvbnZlcnRlZCB0byBQYXNjYWwgQ2FzZS4gVGhpcyBzaG91bGQgYmUgYSBmaW5pdGUgbGlzdCwgc29cbi8vIG5vdCBtdWNoIGZlYXIgdGhhdCB3ZSB3aWxsIHJ1biBvdXQgb2YgbWVtb3J5LlxudmFyIGRhc2hUb1Bhc2NhbENhY2hlID0ge307XG5cbi8vIENvbnZlcnQgZm9vLWJhciB0byBGb29CYXIuXG51dGlscy5kYXNoVG9QYXNjYWwgPSBmdW5jdGlvbiAocykge1xuICBpZiAocyA9PT0gJycpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbiAgaWYgKCFkYXNoVG9QYXNjYWxDYWNoZVtzXSkge1xuICAgIGRhc2hUb1Bhc2NhbENhY2hlW3NdID0gcy5zcGxpdCgnLScpLm1hcChmdW5jdGlvbiAocGFydCkge1xuICAgICAgcmV0dXJuIHBhcnRbMF0udG9VcHBlckNhc2UoKSArIHBhcnQuc3Vic3RyaW5nKDEpO1xuICAgIH0pLmpvaW4oJycpO1xuICB9XG4gIHJldHVybiBkYXNoVG9QYXNjYWxDYWNoZVtzXTtcbn07XG5cbi8vIENvcHkgYWxsIGNvbXB1dGVkIHN0eWxlcyBmcm9tIG9uZSBET00gZWxlbWVudCB0byBhbm90aGVyLlxudXRpbHMuY29weUVsZW1lbnRTdHlsZSA9IGZ1bmN0aW9uIChmcm9tRWxlbWVudCwgdG9FbGVtZW50KSB7XG4gIHZhciBmcm9tU3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShmcm9tRWxlbWVudCwgJycpO1xuXG4gIGlmIChmcm9tU3R5bGUuY3NzVGV4dCAhPT0gJycpIHtcbiAgICB0b0VsZW1lbnQuc3R5bGUuY3NzVGV4dCA9IGZyb21TdHlsZS5jc3NUZXh0O1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBjc3NSdWxlcyA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGZyb21TdHlsZS5sZW5ndGg7IGkrKykge1xuICAgIGNzc1J1bGVzLnB1c2goZnJvbVN0eWxlW2ldICsgJzonICsgZnJvbVN0eWxlLmdldFByb3BlcnR5VmFsdWUoZnJvbVN0eWxlW2ldKSArICc7Jyk7XG4gIH1cbiAgdmFyIGNzc1RleHQgPSBjc3NSdWxlcy5qb2luKCcnKTtcblxuICB0b0VsZW1lbnQuc3R5bGUuY3NzVGV4dCA9IGNzc1RleHQ7XG59O1xuXG4vLyBPYmplY3QgdG8gaG9sZCBicm93c2VyIHNuaWZmaW5nIGluZm8uXG52YXIgYnJvd3NlciA9IHtcbiAgaXNDaHJvbWU6IGZhbHNlLFxuICBpc01vemlsbGE6IGZhbHNlLFxuICBpc09wZXJhOiBmYWxzZSxcbiAgaXNJZTogZmFsc2UsXG4gIGlzU2FmYXJpOiBmYWxzZSxcbiAgaXNVbmtub3duOiBmYWxzZVxufTtcblxuLy8gU25pZmYgdGhlIGJyb3dzZXIuXG52YXIgdWEgPSAnJztcblxuaWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnKSB7XG4gIHVhID0gbmF2aWdhdG9yLnVzZXJBZ2VudDtcbn1cblxuaWYodWEuaW5kZXhPZignQ2hyb21lJykgPiAtMSkge1xuICBicm93c2VyLmlzQ2hyb21lID0gdHJ1ZTtcbn0gZWxzZSBpZiAodWEuaW5kZXhPZignU2FmYXJpJykgPiAtMSkge1xuICBicm93c2VyLmlzU2FmYXJpID0gdHJ1ZTtcbn0gZWxzZSBpZiAodWEuaW5kZXhPZignT3BlcmEnKSA+IC0xKSB7XG4gIGJyb3dzZXIuaXNPcGVyYSA9IHRydWU7XG59IGVsc2UgaWYgKHVhLmluZGV4T2YoJ0ZpcmVmb3gnKSA+IC0xKSB7XG4gIGJyb3dzZXIuaXNNb3ppbGxhID0gdHJ1ZTtcbn0gZWxzZSBpZiAodWEuaW5kZXhPZignTVNJRScpID4gLTEpIHtcbiAgYnJvd3Nlci5pc0llID0gdHJ1ZTtcbn0gZWxzZSB7XG4gIGJyb3dzZXIuaXNVbmtub3duID0gdHJ1ZTtcbn1cblxuLy8gRXhwb3J0IHNuaWZmZWQgYnJvd3NlciBpbmZvLlxudXRpbHMuYnJvd3NlciA9IGJyb3dzZXI7XG5cbi8vIENyZWF0ZSBhIG1ldGhvZCB0aGF0IGRlbGVnYXRlcyB0byBhbm90aGVyIG1ldGhvZCBvbiB0aGUgc2FtZSBvYmplY3QuIFRoZVxuLy8gZGVmYXVsdCBjb25maWd1cmF0aW9uIHVzZXMgdGhpcyBmdW5jdGlvbiB0byBkZWxlZ2F0ZSBvbmUgbWV0aG9kIHRvIGFub3RoZXIuXG51dGlscy5kZWxlZ2F0ZVRvID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpc1tuYW1lXS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9O1xufTtcblxudXRpbHMuZGVsZWdhdG9yID0gZnVuY3Rpb24gKG9iaikge1xuICByZXR1cm4gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG9ialtuYW1lXS5hcHBseShvYmosIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfTtcbn07XG5cbnV0aWxzLmNhcGl0YWxpemUgPSBmdW5jdGlvbihzKSB7XG4gIHJldHVybiBzLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcy5zdWJzdHJpbmcoMSkudG9Mb3dlckNhc2UoKTtcbn07XG4iLCIvKiFcbiAgQ29weXJpZ2h0IChjKSAyMDE1IEplZCBXYXRzb24uXG4gIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZSAoTUlUKSwgc2VlXG4gIGh0dHA6Ly9qZWR3YXRzb24uZ2l0aHViLmlvL2NsYXNzbmFtZXNcbiovXG5cbihmdW5jdGlvbiAoKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRmdW5jdGlvbiBjbGFzc05hbWVzICgpIHtcblxuXHRcdHZhciBjbGFzc2VzID0gJyc7XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGFyZyA9IGFyZ3VtZW50c1tpXTtcblx0XHRcdGlmICghYXJnKSBjb250aW51ZTtcblxuXHRcdFx0dmFyIGFyZ1R5cGUgPSB0eXBlb2YgYXJnO1xuXG5cdFx0XHRpZiAoJ3N0cmluZycgPT09IGFyZ1R5cGUgfHwgJ251bWJlcicgPT09IGFyZ1R5cGUpIHtcblx0XHRcdFx0Y2xhc3NlcyArPSAnICcgKyBhcmc7XG5cblx0XHRcdH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShhcmcpKSB7XG5cdFx0XHRcdGNsYXNzZXMgKz0gJyAnICsgY2xhc3NOYW1lcy5hcHBseShudWxsLCBhcmcpO1xuXG5cdFx0XHR9IGVsc2UgaWYgKCdvYmplY3QnID09PSBhcmdUeXBlKSB7XG5cdFx0XHRcdGZvciAodmFyIGtleSBpbiBhcmcpIHtcblx0XHRcdFx0XHRpZiAoYXJnLmhhc093blByb3BlcnR5KGtleSkgJiYgYXJnW2tleV0pIHtcblx0XHRcdFx0XHRcdGNsYXNzZXMgKz0gJyAnICsga2V5O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBjbGFzc2VzLnN1YnN0cigxKTtcblx0fVxuXG5cdGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBkZWZpbmUuYW1kID09PSAnb2JqZWN0JyAmJiBkZWZpbmUuYW1kKSB7XG5cdFx0Ly8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuXHRcdGRlZmluZShmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gY2xhc3NOYW1lcztcblx0XHR9KTtcblx0fSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuXHRcdG1vZHVsZS5leHBvcnRzID0gY2xhc3NOYW1lcztcblx0fSBlbHNlIHtcblx0XHR3aW5kb3cuY2xhc3NOYW1lcyA9IGNsYXNzTmFtZXM7XG5cdH1cblxufSgpKTtcbiIsInZhciBwU2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG52YXIgb2JqZWN0S2V5cyA9IHJlcXVpcmUoJy4vbGliL2tleXMuanMnKTtcbnZhciBpc0FyZ3VtZW50cyA9IHJlcXVpcmUoJy4vbGliL2lzX2FyZ3VtZW50cy5qcycpO1xuXG52YXIgZGVlcEVxdWFsID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYWN0dWFsLCBleHBlY3RlZCwgb3B0cykge1xuICBpZiAoIW9wdHMpIG9wdHMgPSB7fTtcbiAgLy8gNy4xLiBBbGwgaWRlbnRpY2FsIHZhbHVlcyBhcmUgZXF1aXZhbGVudCwgYXMgZGV0ZXJtaW5lZCBieSA9PT0uXG4gIGlmIChhY3R1YWwgPT09IGV4cGVjdGVkKSB7XG4gICAgcmV0dXJuIHRydWU7XG5cbiAgfSBlbHNlIGlmIChhY3R1YWwgaW5zdGFuY2VvZiBEYXRlICYmIGV4cGVjdGVkIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgIHJldHVybiBhY3R1YWwuZ2V0VGltZSgpID09PSBleHBlY3RlZC5nZXRUaW1lKCk7XG5cbiAgLy8gNy4zLiBPdGhlciBwYWlycyB0aGF0IGRvIG5vdCBib3RoIHBhc3MgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnLFxuICAvLyBlcXVpdmFsZW5jZSBpcyBkZXRlcm1pbmVkIGJ5ID09LlxuICB9IGVsc2UgaWYgKHR5cGVvZiBhY3R1YWwgIT0gJ29iamVjdCcgJiYgdHlwZW9mIGV4cGVjdGVkICE9ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIG9wdHMuc3RyaWN0ID8gYWN0dWFsID09PSBleHBlY3RlZCA6IGFjdHVhbCA9PSBleHBlY3RlZDtcblxuICAvLyA3LjQuIEZvciBhbGwgb3RoZXIgT2JqZWN0IHBhaXJzLCBpbmNsdWRpbmcgQXJyYXkgb2JqZWN0cywgZXF1aXZhbGVuY2UgaXNcbiAgLy8gZGV0ZXJtaW5lZCBieSBoYXZpbmcgdGhlIHNhbWUgbnVtYmVyIG9mIG93bmVkIHByb3BlcnRpZXMgKGFzIHZlcmlmaWVkXG4gIC8vIHdpdGggT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKSwgdGhlIHNhbWUgc2V0IG9mIGtleXNcbiAgLy8gKGFsdGhvdWdoIG5vdCBuZWNlc3NhcmlseSB0aGUgc2FtZSBvcmRlciksIGVxdWl2YWxlbnQgdmFsdWVzIGZvciBldmVyeVxuICAvLyBjb3JyZXNwb25kaW5nIGtleSwgYW5kIGFuIGlkZW50aWNhbCAncHJvdG90eXBlJyBwcm9wZXJ0eS4gTm90ZTogdGhpc1xuICAvLyBhY2NvdW50cyBmb3IgYm90aCBuYW1lZCBhbmQgaW5kZXhlZCBwcm9wZXJ0aWVzIG9uIEFycmF5cy5cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gb2JqRXF1aXYoYWN0dWFsLCBleHBlY3RlZCwgb3B0cyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWRPck51bGwodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIGlzQnVmZmVyICh4KSB7XG4gIGlmICgheCB8fCB0eXBlb2YgeCAhPT0gJ29iamVjdCcgfHwgdHlwZW9mIHgubGVuZ3RoICE9PSAnbnVtYmVyJykgcmV0dXJuIGZhbHNlO1xuICBpZiAodHlwZW9mIHguY29weSAhPT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgeC5zbGljZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAoeC5sZW5ndGggPiAwICYmIHR5cGVvZiB4WzBdICE9PSAnbnVtYmVyJykgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gb2JqRXF1aXYoYSwgYiwgb3B0cykge1xuICB2YXIgaSwga2V5O1xuICBpZiAoaXNVbmRlZmluZWRPck51bGwoYSkgfHwgaXNVbmRlZmluZWRPck51bGwoYikpXG4gICAgcmV0dXJuIGZhbHNlO1xuICAvLyBhbiBpZGVudGljYWwgJ3Byb3RvdHlwZScgcHJvcGVydHkuXG4gIGlmIChhLnByb3RvdHlwZSAhPT0gYi5wcm90b3R5cGUpIHJldHVybiBmYWxzZTtcbiAgLy9+fn5JJ3ZlIG1hbmFnZWQgdG8gYnJlYWsgT2JqZWN0LmtleXMgdGhyb3VnaCBzY3Jld3kgYXJndW1lbnRzIHBhc3NpbmcuXG4gIC8vICAgQ29udmVydGluZyB0byBhcnJheSBzb2x2ZXMgdGhlIHByb2JsZW0uXG4gIGlmIChpc0FyZ3VtZW50cyhhKSkge1xuICAgIGlmICghaXNBcmd1bWVudHMoYikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgYSA9IHBTbGljZS5jYWxsKGEpO1xuICAgIGIgPSBwU2xpY2UuY2FsbChiKTtcbiAgICByZXR1cm4gZGVlcEVxdWFsKGEsIGIsIG9wdHMpO1xuICB9XG4gIGlmIChpc0J1ZmZlcihhKSkge1xuICAgIGlmICghaXNCdWZmZXIoYikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGEubGVuZ3RoICE9PSBiLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICAgIGZvciAoaSA9IDA7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoYVtpXSAhPT0gYltpXSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICB0cnkge1xuICAgIHZhciBrYSA9IG9iamVjdEtleXMoYSksXG4gICAgICAgIGtiID0gb2JqZWN0S2V5cyhiKTtcbiAgfSBjYXRjaCAoZSkgey8vaGFwcGVucyB3aGVuIG9uZSBpcyBhIHN0cmluZyBsaXRlcmFsIGFuZCB0aGUgb3RoZXIgaXNuJ3RcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy8gaGF2aW5nIHRoZSBzYW1lIG51bWJlciBvZiBvd25lZCBwcm9wZXJ0aWVzIChrZXlzIGluY29ycG9yYXRlc1xuICAvLyBoYXNPd25Qcm9wZXJ0eSlcbiAgaWYgKGthLmxlbmd0aCAhPSBrYi5sZW5ndGgpXG4gICAgcmV0dXJuIGZhbHNlO1xuICAvL3RoZSBzYW1lIHNldCBvZiBrZXlzIChhbHRob3VnaCBub3QgbmVjZXNzYXJpbHkgdGhlIHNhbWUgb3JkZXIpLFxuICBrYS5zb3J0KCk7XG4gIGtiLnNvcnQoKTtcbiAgLy9+fn5jaGVhcCBrZXkgdGVzdFxuICBmb3IgKGkgPSBrYS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGlmIChrYVtpXSAhPSBrYltpXSlcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvL2VxdWl2YWxlbnQgdmFsdWVzIGZvciBldmVyeSBjb3JyZXNwb25kaW5nIGtleSwgYW5kXG4gIC8vfn5+cG9zc2libHkgZXhwZW5zaXZlIGRlZXAgdGVzdFxuICBmb3IgKGkgPSBrYS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGtleSA9IGthW2ldO1xuICAgIGlmICghZGVlcEVxdWFsKGFba2V5XSwgYltrZXldLCBvcHRzKSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0eXBlb2YgYSA9PT0gdHlwZW9mIGI7XG59XG4iLCJ2YXIgc3VwcG9ydHNBcmd1bWVudHNDbGFzcyA9IChmdW5jdGlvbigpe1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFyZ3VtZW50cylcbn0pKCkgPT0gJ1tvYmplY3QgQXJndW1lbnRzXSc7XG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHN1cHBvcnRzQXJndW1lbnRzQ2xhc3MgPyBzdXBwb3J0ZWQgOiB1bnN1cHBvcnRlZDtcblxuZXhwb3J0cy5zdXBwb3J0ZWQgPSBzdXBwb3J0ZWQ7XG5mdW5jdGlvbiBzdXBwb3J0ZWQob2JqZWN0KSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqZWN0KSA9PSAnW29iamVjdCBBcmd1bWVudHNdJztcbn07XG5cbmV4cG9ydHMudW5zdXBwb3J0ZWQgPSB1bnN1cHBvcnRlZDtcbmZ1bmN0aW9uIHVuc3VwcG9ydGVkKG9iamVjdCl7XG4gIHJldHVybiBvYmplY3QgJiZcbiAgICB0eXBlb2Ygb2JqZWN0ID09ICdvYmplY3QnICYmXG4gICAgdHlwZW9mIG9iamVjdC5sZW5ndGggPT0gJ251bWJlcicgJiZcbiAgICBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCAnY2FsbGVlJykgJiZcbiAgICAhT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKG9iamVjdCwgJ2NhbGxlZScpIHx8XG4gICAgZmFsc2U7XG59O1xuIiwiZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gdHlwZW9mIE9iamVjdC5rZXlzID09PSAnZnVuY3Rpb24nXG4gID8gT2JqZWN0LmtleXMgOiBzaGltO1xuXG5leHBvcnRzLnNoaW0gPSBzaGltO1xuZnVuY3Rpb24gc2hpbSAob2JqKSB7XG4gIHZhciBrZXlzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBvYmopIGtleXMucHVzaChrZXkpO1xuICByZXR1cm4ga2V5cztcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gVG9PYmplY3QodmFsKSB7XG5cdGlmICh2YWwgPT0gbnVsbCkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ09iamVjdC5hc3NpZ24gY2Fubm90IGJlIGNhbGxlZCB3aXRoIG51bGwgb3IgdW5kZWZpbmVkJyk7XG5cdH1cblxuXHRyZXR1cm4gT2JqZWN0KHZhbCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0LCBzb3VyY2UpIHtcblx0dmFyIGZyb207XG5cdHZhciBrZXlzO1xuXHR2YXIgdG8gPSBUb09iamVjdCh0YXJnZXQpO1xuXG5cdGZvciAodmFyIHMgPSAxOyBzIDwgYXJndW1lbnRzLmxlbmd0aDsgcysrKSB7XG5cdFx0ZnJvbSA9IGFyZ3VtZW50c1tzXTtcblx0XHRrZXlzID0gT2JqZWN0LmtleXMoT2JqZWN0KGZyb20pKTtcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dG9ba2V5c1tpXV0gPSBmcm9tW2tleXNbaV1dO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiB0bztcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vc3JjL1Njcm9sbExvY2snKTsiLCIvKipcbiAqIENyZWF0ZWQgYnkgbGFpZmYgb24gMTAuMTIuMTQuXG4gKi9cblxuLyoqXG4gKiBQcmV2ZW50IGRlZmF1bHQgYmVoYXZpb3IgZm9yIGV2ZW50XG4gKlxuICogQHBhcmFtIGVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG52YXIgY2FuY2VsU2Nyb2xsRXZlbnQgPSBmdW5jdGlvbiAoZSkge1xuICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGUucmV0dXJuVmFsdWUgPSBmYWxzZTtcbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG52YXIgYWRkU2Nyb2xsRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uIChlbGVtLCBoYW5kbGVyKSB7XG4gICAgZWxlbS5hZGRFdmVudExpc3RlbmVyKCd3aGVlbCcsIGhhbmRsZXIsIGZhbHNlKTtcbn07XG5cbnZhciByZW1vdmVTY3JvbGxFdmVudExpc3RlbmVyID0gZnVuY3Rpb24gKGVsZW0sIGhhbmRsZXIpIHtcbiAgICBlbGVtLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3doZWVsJywgaGFuZGxlciwgZmFsc2UpO1xufTtcblxuLyoqXG4gKiBAZXh0ZW5kcyBSZWFjdENvbXBvc2l0ZUNvbXBvbmVudEludGVyZmFjZVxuICpcbiAqIEBtaXhpbiBTY3JvbGxMb2NrXG4gKi9cbnZhciBTY3JvbGxMb2NrID0ge1xuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5zY3JvbGxMb2NrKCk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZFVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnNjcm9sbExvY2soKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5zY3JvbGxSZWxlYXNlKCk7XG4gICAgfSxcblxuICAgIHNjcm9sbExvY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGVsZW0gPSB0aGlzLmdldERPTU5vZGUoKTtcbiAgICAgICAgaWYgKGVsZW0pIHtcbiAgICAgICAgICAgIGFkZFNjcm9sbEV2ZW50TGlzdGVuZXIoZWxlbSwgdGhpcy5vblNjcm9sbEhhbmRsZXIpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIHNjcm9sbFJlbGVhc2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGVsZW0gPSB0aGlzLmdldERPTU5vZGUoKTtcbiAgICAgICAgaWYgKGVsZW0pIHtcbiAgICAgICAgICAgIHJlbW92ZVNjcm9sbEV2ZW50TGlzdGVuZXIoZWxlbSwgdGhpcy5vblNjcm9sbEhhbmRsZXIpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIG9uU2Nyb2xsSGFuZGxlcjogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgdmFyIGVsZW0gPSB0aGlzLmdldERPTU5vZGUoKTtcbiAgICAgICAgdmFyIHNjcm9sbFRvcCA9IGVsZW0uc2Nyb2xsVG9wO1xuICAgICAgICB2YXIgc2Nyb2xsSGVpZ2h0ID0gZWxlbS5zY3JvbGxIZWlnaHQ7XG4gICAgICAgIHZhciBoZWlnaHQgPSBlbGVtLmNsaWVudEhlaWdodDtcbiAgICAgICAgdmFyIHdoZWVsRGVsdGEgPSBlLmRlbHRhWTtcbiAgICAgICAgdmFyIGlzRGVsdGFQb3NpdGl2ZSA9IHdoZWVsRGVsdGEgPiAwO1xuXG4gICAgICAgIGlmIChpc0RlbHRhUG9zaXRpdmUgJiYgd2hlZWxEZWx0YSA+IHNjcm9sbEhlaWdodCAtIGhlaWdodCAtIHNjcm9sbFRvcCkge1xuICAgICAgICAgICAgZWxlbS5zY3JvbGxUb3AgPSBzY3JvbGxIZWlnaHQ7XG4gICAgICAgICAgICByZXR1cm4gY2FuY2VsU2Nyb2xsRXZlbnQoZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIWlzRGVsdGFQb3NpdGl2ZSAmJiAtd2hlZWxEZWx0YSA+IHNjcm9sbFRvcCkge1xuICAgICAgICAgICAgZWxlbS5zY3JvbGxUb3AgPSAwO1xuICAgICAgICAgICAgcmV0dXJuIGNhbmNlbFNjcm9sbEV2ZW50KGUpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTY3JvbGxMb2NrOyJdfQ==
