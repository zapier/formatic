!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Formatic=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
// # array component

/*
Render a field to edit array values.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

var CSSTransitionGroup = React.createFactory(React.addons.CSSTransitionGroup);

module.exports = React.createClass({

  displayName: 'Array',

  mixins: [require('../../mixins/field')],

  // getDefaultProps: function () {
  //   return {
  //     className: plugin.config.className
  //   };
  // },

  nextLookupId: 0,

  getInitialState: function () {

    // Need to create artificial keys for the array. Indexes are not good keys,
    // since they change. So, map each position to an artificial key
    var lookups = [];

    var items = this.props.field.value;

    items.forEach(function (item, i) {
      lookups[i] = '_' + this.nextLookupId;
      this.nextLookupId++;
    }.bind(this));

    return {
      lookups: lookups
    };
  },

  componentWillReceiveProps: function (newProps) {

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

  onChange: function (i, newValue, info) {
    var newArrayValue = this.props.field.value.slice(0);
    newArrayValue[i] = newValue;
    this.onBubbleValue(newArrayValue, info);
  },

  onAppend: function (itemChoiceIndex) {
    var config = this.props.config;
    var field = this.props.field;

    var newValue = config.createNewChildFieldValue(field, itemChoiceIndex);

    var items = field.value;

    items = items.concat(newValue);

    this.onChangeValue(items);
  },

  onRemove: function (i) {
    var lookups = this.state.lookups;
    lookups.splice(i, 1);
    this.setState({
      lookups: lookups
    });
    var newItems = this.props.field.value.slice(0);
    newItems.splice(i, 1);
    this.onChangeValue(newItems);
  },

  onMove: function (fromIndex, toIndex) {
    var lookups = this.state.lookups;
    var fromId = lookups[fromIndex];
    var toId = lookups[toIndex];
    lookups[fromIndex] = toId;
    lookups[toIndex] = fromId;
    this.setState({
      lookups: lookups
    });

    var newItems = this.props.field.value.slice(0);
    if (fromIndex !== toIndex &&
      fromIndex >= 0 && fromIndex < newItems.length &&
      toIndex >= 0 && toIndex < newItems.length
    ) {
      newItems.splice(toIndex, 0, newItems.splice(fromIndex, 1)[0]);
    }
    this.onChangeValue(newItems);
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    var config = this.props.config;
    var field = this.props.field;

    var fields = config.createChildFields(field);

    var numItems = field.value.length;
    return config.createElement('field', {
      field: field, plain: this.props.plain
    },
      R.div({className: cx(this.props.classes)},
        CSSTransitionGroup({transitionName: 'reveal'},
        fields.map(function (childField, i) {
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
        }.bind(this))),
        config.createElement('array-control', {field: field, onAppend: this.onAppend})
      )
    );
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/field":37}],2:[function(require,module,exports){
(function (global){
// # boolean component

/*
Render a dropdown to handle yes/no boolean values.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

module.exports = React.createClass({

  displayName: 'Boolean',

  mixins: [require('../../mixins/field')],

  onChange: function (newValue) {
    this.onChangeValue(newValue);
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/field":37}],3:[function(require,module,exports){
(function (global){
// # checkbox-array component

/*
Used with array values to supply multiple checkboxes for adding multiple
enumerated values to an array.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'CheckboxArray',

  mixins: [require('../../mixins/field')],

  getInitialState: function () {
    return {
      choices: this.props.config.fieldChoices(this.props.field)
    };
  },

  componentWillReceiveProps: function (newProps) {
    this.setState({
      choices: newProps.config.fieldChoices(newProps.field)
    });
  },

  onChange: function () {
    // Get all the checked checkboxes and convert to an array of values.
    var choiceNodes = this.refs.choices.getDOMNode().getElementsByTagName('input');
    choiceNodes = Array.prototype.slice.call(choiceNodes, 0);
    var values = choiceNodes.map(function (node) {
      return node.checked ? node.value : null;
    }).filter(function (value) {
      return value;
    });
    this.onChangeValue(values);
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    var config = this.props.config;
    var field = this.props.field;

    var choices = this.state.choices || [];

    var isInline = !_.find(choices, function (choice) {
      return choice.sample;
    });

    return config.createElement('field', {
      field: field
    },
      R.div({className: cx(this.props.classes), ref: 'choices'},
        choices.map(function (choice, i) {

          var inputField = R.span({style: {whiteSpace: 'nowrap'}},
            R.input({
              name: field.key,
              type: 'checkbox',
              value: choice.value,
              checked: field.value.indexOf(choice.value) >= 0 ? true : false,
              onChange: this.onChange,
              onFocus: this.onFocusAction,
              onBlur: this.onBlurAction
            }),
            ' ',
            R.span({className: 'field-choice-label'},
              choice.label
            )
          );

          if (isInline) {
            return R.span({key: i, className: 'field-choice'},
              inputField, ' '
            );
          } else {
            return R.div({key: i, className: 'field-choice'},
              inputField, ' ',
              config.createElement('sample', {field: field, choice: choice})
            );
          }
        }.bind(this))
      )
    );
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/field":37}],4:[function(require,module,exports){
(function (global){
// # checkbox-boolean component

/*
Render a field that can edit a boolean with a checkbox.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'CheckboxBoolean',

  mixins: [require('../../mixins/field')],

  onChange: function (event) {
    this.onChangeValue(event.target.checked);
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    var config = this.props.config;
    var field = this.props.field;

    return config.createElement('field', {
      config: config, field: field, plain: true
    },
    R.span({style: {whiteSpace: 'nowrap'}},
      R.input({
        type: 'checkbox',
        checked: field.value,
        className: cx(this.props.classes),
        onChange: this.onChange,
        onFocus: this.onFocusAction,
        onBlur: this.onBlurAction
      }),
      R.span({}, ' '),
      R.span({}, config.fieldHelpText(field) || config.fieldLabel(field))
    ));
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/field":37}],5:[function(require,module,exports){
(function (global){
// # copy component

/*
Render non-editable html/text (think article copy).
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'Copy',

  mixins: [require('../../mixins/field')],

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    return R.div({className: cx(this.props.classes)},
      this.props.config.fieldHelpText(this.props.field)
    );
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/field":37}],6:[function(require,module,exports){
(function (global){
// # fields component

/*
Render a field to edit the values of an object with static properties.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'Fields',

  mixins: [require('../../mixins/field')],

  onChangeField: function (key, newValue, info) {
    if (key) {
      var newObjectValue = _.extend({}, this.props.field.value);
      newObjectValue[key] = newValue;
      this.onBubbleValue(newObjectValue, info);
    }
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    var config = this.props.config;
    var field = this.props.field;

    var fields = config.createChildFields(field);

    return config.createElement('field', {
      config: config, field: field, plain: this.props.plain
    },
      R.fieldset({className: cx(this.props.classes)},
        fields.map(function (childField, i) {
          var key = childField.key || i;
          return config.createFieldElement({
            key: key || i,
            field: childField,
            onChange: this.onChangeField.bind(this, key), onAction: this.onBubbleAction
          });
        }.bind(this))
      )
    );
  }

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/field":37}],7:[function(require,module,exports){
(function (global){
// # json component

/*
Textarea editor for JSON. Will validate the JSON before setting the value, so
while the value is invalid, no external state changes will occur.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'Json',

  mixins: [require('../../mixins/field')],

  getDefaultProps: function () {
    return {
      rows: 5
    };
  },

  isValidValue: function (value) {

    try {
      JSON.parse(value);
      return true;
    } catch (e) {
      return false;
    }
  },

  getInitialState: function () {
    return {
      isValid: true,
      value: JSON.stringify(this.props.field.value, null, 2)
    };
  },

  onChange: function (event) {
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

  componentWillReceiveProps: function (nextProps) {
    if (!this._isChanging) {
      this.setState({
        isValid: true,
        value: JSON.stringify(nextProps.field.value, null, 2)
      });
    }
    this._isChanging = false;
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    var config = this.props.config;
    var field = this.props.field;

    return config.createElement('field', {
      field: config.fieldWithValue(field, this.state.value), plain: this.props.plain
    }, R.textarea({
        className: cx(this.props.classes),
        value: this.state.value,
        onChange: this.onChange,
        style: {backgroundColor: this.state.isValid ? '' : 'rgb(255,200,200)'},
        rows: config.fieldRows(field) || this.props.rows,
        onFocus: this.onFocusAction,
        onBlur: this.onBlurAction
      })
    );
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/field":37}],8:[function(require,module,exports){
(function (global){
// # object component

/*
Render a field to edit an object with dynamic child fields.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var cx = React.addons.classSet;

var CSSTransitionGroup = React.createFactory(React.addons.CSSTransitionGroup);

var tempKeyPrefix = '$$__temp__';

var tempKey = function (id) {
  return tempKeyPrefix + id;
};

var isTempKey = function (key) {
  return key.substring(0, tempKeyPrefix.length) === tempKeyPrefix;
};

// TODO: keep invalid keys as state and don't send in onChange; clone context
// and use clone to create child contexts

module.exports = React.createClass({

  displayName: 'Object',

  mixins: [require('../../mixins/field')],

  nextLookupId: 0,

  getInitialState: function () {

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
    keys.forEach(function (key) {
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
        tempDisplayKeys[id] = '';
      }
    }.bind(this));

    return {
      keyToId: keyToId,
      keyOrder: keyOrder,
      // Temp keys keeps the key to display, which sometimes may be different
      // than the actual key. For example, duplicate keys are not allowed,
      // but we may temporarily show duplicate keys.
      tempDisplayKeys: tempDisplayKeys
    };
  },

  componentWillReceiveProps: function (newProps) {

    var keyToId = this.state.keyToId;
    var newKeyToId = {};
    var tempDisplayKeys = this.state.tempDisplayKeys;
    var newTempDisplayKeys = {};
    var keyOrder = this.state.keyOrder;
    var keys = Object.keys(newProps.field.value);
    var addedKeys = [];

    // Look at the new keys.
    keys.forEach(function (key) {
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
    }.bind(this));

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

  onChange: function (key, newValue, info) {
    var newObj = _.extend({}, this.props.field.value);
    newObj[key] = newValue;
    this.onBubbleValue(newObj, info);
  },

  onAppend: function (itemChoiceIndex) {
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
    tempDisplayKeys[id] = '';
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

  onRemove: function (key) {
    var newObj = _.extend(this.props.field.value);
    delete newObj[key];
    this.onChangeValue(newObj);
  },

  onMove: function (fromKey, toKey) {
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
        tempDisplayKeys[keyToId[fromKey]] = '';
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
          Object.keys(newObj).forEach(function (key) {
            if (!(isTempKey(key))) {
              return;
            }
            var id = keyToId[key];
            var displayKey = tempDisplayKeys[id];
            if (fromKey === displayKey) {
              this.onMove(key, displayKey);
            }
          }.bind(this));
        }
      }
    }
  },

  getFields: function () {
    var config = this.props.config;
    var field = this.props.field;

    var fields = config.createChildFields(field);

    var keyToField = {};

    _.each(fields, function (field) {
      keyToField[field.key] = field;
    });

    return this.state.keyOrder.map(function (key) {
      return keyToField[key];
    });
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    var config = this.props.config;
    var field = this.props.field;

    var fields = this.getFields();

    return config.createElement('field', {
      field: field, plain: this.props.plain
    },
      R.div({className: cx(this.props.classes)},
        CSSTransitionGroup({transitionName: 'reveal'},
          fields.map(function (childField) {
            var displayKey = this.state.tempDisplayKeys[this.state.keyToId[childField.key]];
            if (_.isUndefined(displayKey)) {
              displayKey = childField.key;
            }
            return config.createElement('object-item', {
              key: this.state.keyToId[childField.key],
              field: childField,
              onMove: this.onMove,
              onRemove: this.onRemove,
              onChange: this.onChange,
              onAction: this.onBubbleAction,
              displayKey: displayKey,
              itemKey: childField.key
            });
          }.bind(this))
        ),
        config.createElement('object-control', {field: field, onAppend: this.onAppend})
      )
    );
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/field":37}],9:[function(require,module,exports){
(function (global){
// # pretty-textarea component

/*
Textarea that will display highlights behind "tags". Tags currently mean text
that is enclosed in braces like `{{foo}}`. Tags are replaced with labels if
available or humanized.

This component is quite complicated because:
- We are displaying text in the textarea but have to keep track of the real
  text value in the background. We can't use a data attribute, because it's a
  textarea, so we can't use any elements at all!
- Because of the hidden data, we also have to do some interception of
  copy, which is a little weird. We intercept copy and copy the real text
  to the end of the textarea. Then we erase that text, which leaves the copied
  data in the buffer.
- React loses the caret position when you update the value to something
  different than before. So we have to retain tracking information for when
  that happens.
- Because we monkey with copy, we also have to do our own undo/redo. Otherwise
  the default undo will have weird states in it.

So good luck!
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var cx = React.addons.classSet;

var utils = require('../../utils');

var noBreak = function (value) {
  return value.replace(/ /g, '\u00a0');
};

var LEFT_PAD = '\u00a0\u00a0';
// Why this works, I'm not sure.
var RIGHT_PAD = '  '; //'\u00a0\u00a0';

var idPrefixRegEx = /^[0-9]+__/;

// Zapier specific stuff. Make a plugin for this later.
var removeIdPrefix = function (key) {
  if (idPrefixRegEx.test(key)) {
    return key.replace(idPrefixRegEx, '');
  }
  return key;
};

var positionInNode = function (position, node) {
  var rect = node.getBoundingClientRect();
  if (position.x >= rect.left && position.x <= rect.right) {
    if (position.y >= rect.top && position.y <= rect.bottom) {
      return true;
    }
  }
};

// Wrap a text value so it has a type. For parsing text with tags.
var textPart = function (value, type) {
  type = type || 'text';
  return {
    type: type,
    value: value
  };
};

// Parse text that has tags like {{tag}} into text and tags.
var parseTextWithTags = function (value) {
  value = value || '';
  var parts = value.split(/{{(?!{)/);
  var frontPart = [];
  if (parts[0] !== '') {
    frontPart = [
    textPart(parts[0])
    ];
  }
  parts = frontPart.concat(
    parts.slice(1).map(function (part) {
      if (part.indexOf('}}') >= 0) {
        return [
        textPart(part.substring(0, part.indexOf('}}')), 'tag'),
        textPart(part.substring(part.indexOf('}}') + 2))
        ];
      } else {
        return textPart('{{' + part, 'text');
      }
    })
  );
  return [].concat.apply([], parts);
};


module.exports = React.createClass({

  displayName: 'TaggedText',

  mixins: [require('../../mixins/field'), require('../../mixins/undo-stack'), require('../../mixins/resize')],

  //
  // getDefaultProps: function () {
  //   return {
  //     className: plugin.config.className
  //   };
  // },

  getReplaceState: function (props) {
    var replaceChoices = props.config.fieldReplaceChoices(props.field);
    var replaceChoicesLabels = {};
    replaceChoices.forEach(function (choice) {
      replaceChoicesLabels[choice.value] = choice.label;
    });
    return {
      replaceChoices: replaceChoices,
      replaceChoicesLabels: replaceChoicesLabels
    };
  },

  getInitialState: function () {
    var replaceState = this.getReplaceState(this.props);

    return {
      undoDepth: 100,
      isChoicesOpen: false,
      hoverPillRef: null,
      replaceChoices: replaceState.replaceChoices,
      replaceChoicesLabels: replaceState.replaceChoicesLabels
    };
  },

  componentWillReceiveProps: function (newProps) {
    this.setState(this.getReplaceState(newProps));
  },

  componentWillMount: function () {
    // Not quite state, this is for tracking selection info.
    this.tracking = {};

    var parts = parseTextWithTags(this.props.field.value);
    var tokens = this.tokens(parts);
    var indexMap = this.indexMap(tokens);

    this.tracking.pos = indexMap.length;
    this.tracking.range = 0;
    this.tracking.tokens = tokens;
    this.tracking.indexMap = indexMap;
  },

  getStateSnapshot: function () {
    return {
      value: this.props.field.value,
      pos: this.tracking.pos,
      range: this.tracking.range
    };
  },

  setStateSnapshot: function (snapshot) {
    this.tracking.pos = snapshot.pos;
    this.tracking.range = snapshot.range;
    this.onChangeValue(snapshot.value);
  },

  // Turn into individual characters and tags
  tokens: function (parts) {
    return [].concat.apply([], parts.map(function (part) {
      if (part.type === 'tag') {
        return part;
      } else {
        return part.value.split('');
      }
    }));
  },

  // Map each textarea index back to a token
  indexMap: function (tokens) {
    var indexMap = [];
    _.each(tokens, function (token, tokenIndex) {
      if (token.type === 'tag') {
        var label = LEFT_PAD + noBreak(this.prettyLabel(token.value)) + RIGHT_PAD;
        var labelChars = label.split('');
        _.each(labelChars, function () {
          indexMap.push(tokenIndex);
        });
      } else {
        indexMap.push(tokenIndex);
      }
    }.bind(this));
    return indexMap;
  },

  // Make highlight scroll match textarea scroll
  onScroll: function () {
    this.refs.highlight.getDOMNode().scrollTop = this.refs.content.getDOMNode().scrollTop;
    this.refs.highlight.getDOMNode().scrollLeft = this.refs.content.getDOMNode().scrollLeft;
  },

  // Given some postion, return the token index (position could be in the middle of a token)
  tokenIndex: function (pos, tokens, indexMap) {
    if (pos < 0) {
      pos = 0;
    } else if (pos >= indexMap.length) {
      return tokens.length;
    }
    return indexMap[pos];
  },

  onChange: function (event) {
    //console.log('change:', event.target.value);

    var node = event.target;

    // Tracking is holding previous position and range
    var prevPos = this.tracking.pos;
    var prevRange = this.tracking.range;

    // New position
    var pos = node.selectionStart;

    // Going to mutate the tokens.
    var tokens = this.tracking.tokens;

    // Using the previous position and range, get the previous token position
    // and range
    var prevTokenIndex = this.tokenIndex(prevPos, tokens, this.tracking.indexMap);
    var prevTokenEndIndex = this.tokenIndex(prevPos + prevRange, tokens, this.tracking.indexMap);
    var prevTokenRange = prevTokenEndIndex - prevTokenIndex;

    // Wipe out any tokens in the selected range because the change would have
    // erased that selection.
    if (prevTokenRange > 0) {
      tokens.splice(prevTokenIndex, prevTokenRange);
      this.tracking.indexMap = this.indexMap(tokens);
    }

    // If cursor has moved forward, then text was added.
    if (pos > prevPos) {
      var addedText = node.value.substring(prevPos, pos);
      // Insert the text into the tokens.
      tokens.splice(prevTokenIndex, 0, addedText);
    // If cursor has moved backward, then we deleted (backspaced) text
    } if (pos < prevPos) {
      var token = this.tokenAt(pos);
      var tokenBefore = this.tokenBefore(pos);
      // If we moved back onto a token, then we should move back to beginning
      // of token.
      if (token === tokenBefore) {
        pos = this.moveOffTag(pos, tokens, this.indexMap(tokens), -1);
      }
      var tokenIndex = this.tokenIndex(pos, tokens, this.tracking.indexMap);
      // Now we can remove the tokens that were deleted.
      tokens.splice(tokenIndex, prevTokenIndex - tokenIndex);
    }

    // Convert tokens back into raw value with tags. Newly formed tags will
    // become part of the raw value.
    var rawValue = this.rawValue(tokens);

    this.tracking.pos = pos;
    this.tracking.range = 0;

    // Set the value to the new raw value.
    this.onChangeValue(rawValue);

    this.snapshot();
  },

  componentDidUpdate: function () {
    var value = this.props.field.value || '';
    var parts = parseTextWithTags(value);
    this.tracking.tokens = this.tokens(parts);
    this.tracking.indexMap = this.indexMap(this.tracking.tokens);

    var pos = this.normalizePosition(this.tracking.pos);
    var range = this.tracking.range;
    var endPos = this.normalizePosition(pos + range);
    range = endPos - pos;

    this.tracking.pos = pos;
    this.tracking.range = range;

    if (document.activeElement === this.refs.content.getDOMNode()) {
      // React can lose the selection, so put it back.
      this.refs.content.getDOMNode().setSelectionRange(pos, pos + range);
    }
  },

  // Get the label for a key.
  prettyLabel: function (key) {
    if (this.state.replaceChoicesLabels[key]) {
      return this.state.replaceChoicesLabels[key];
    }
    var cleaned = removeIdPrefix(key);
    return this.props.config.humanize(cleaned);
  },

  // Given the actual value of the field (with tags), get the plain text that
  // should show in the textarea.
  plainValue: function (value) {
    var parts = parseTextWithTags(value);
    return parts.map(function (part) {
      if (part.type === 'text') {
        return part.value;
      } else {
        return LEFT_PAD + noBreak(this.prettyLabel(part.value)) + RIGHT_PAD;
      }
    }.bind(this)).join('');
  },

  // Given the actual value of the field (with tags), get the html used to
  // highlight the labels.
  prettyValue: function (value) {
    var parts = parseTextWithTags(value);
    return parts.map(function (part, i) {
      if (part.type === 'text') {
        if (i === (parts.length - 1)) {
          if (part.value[part.value.length - 1] === '\n') {
            return part.value + '\u00a0';
          }
        }
        return part.value;
      } else {
        // Make a pill
        var pillRef = 'prettyPart' + i;
        var className = 'pretty-part';
        if (this.state.hoverPillRef && pillRef === this.state.hoverPillRef) {
          className += ' pretty-part-hover';
        }
        return R.span({key: i, className: className, ref: pillRef, 'data-pretty': true, 'data-ref': pillRef},
          R.span({className: 'pretty-part-left'}, LEFT_PAD),
          R.span({className: 'pretty-part-text'}, noBreak(this.prettyLabel(part.value))),
          R.span({className: 'pretty-part-right'}, RIGHT_PAD)
        );
      }
    }.bind(this));
  },

  // Given the tokens for a field, get the actual value of the field (with
  // tags)
  rawValue: function (tokens) {
    return tokens.map(function (token) {
      if (token.type === 'tag') {
        return '{{' + token.value + '}}';
      } else {
        return token;
      }
    }).join('');
  },

  // Given a position, if it's on a label, get the position left or right of
  // the label, based on direction and/or which side is closer
  moveOffTag: function (pos, tokens, indexMap, dir) {
    if (typeof dir === 'undefined' || dir > 0) {
      dir = 1;
    } else {
      dir = -1;
    }
    var token;
    if (dir > 0) {
      token = tokens[indexMap[pos]];
      while (pos < indexMap.length && tokens[indexMap[pos]].type === 'tag' && tokens[indexMap[pos]] === token) {
        pos++;
      }
    } else {
      token = tokens[indexMap[pos - 1]];
      while (pos > 0 && tokens[indexMap[pos - 1]].type === 'tag' && tokens[indexMap[pos - 1]] === token) {
        pos--;
      }
    }

    return pos;
  },

  // Get the token at some position.
  tokenAt: function (pos) {
    if (pos >= this.tracking.indexMap.length) {
      return null;
    }
    if (pos < 0) {
      pos = 0;
    }
    return this.tracking.tokens[this.tracking.indexMap[pos]];
  },

  // Get the token immediately before some position.
  tokenBefore: function (pos) {
    if (pos >= this.tracking.indexMap.length) {
      pos = this.tracking.indexMap.length;
    }
    if (pos <= 0) {
      return null;
    }
    return this.tracking.tokens[this.tracking.indexMap[pos - 1]];
  },

  // Given a position, get a corrected position (if necessary to be
  // corrected).
  normalizePosition: function (pos, prevPos) {
    if (_.isUndefined(prevPos)) {
      prevPos = pos;
    }
    // At start or end, so okay.
    if (pos <= 0 || pos >= this.tracking.indexMap.length) {
      if (pos < 0) {
        pos = 0;
      }
      if (pos > this.tracking.indexMap.length) {
        pos = this.tracking.indexMap.length;
      }
      return pos;
    }

    var token = this.tokenAt(pos);
    var tokenBefore = this.tokenBefore(pos);

    // Between two tokens, so okay.
    if (token !== tokenBefore) {
      return pos;
    }

    var prevToken = this.tokenAt(prevPos);
    var prevTokenBefore = this.tokenBefore(prevPos);

    var rightPos = this.moveOffTag(pos, this.tracking.tokens, this.tracking.indexMap);
    var leftPos = this.moveOffTag(pos, this.tracking.tokens, this.tracking.indexMap, -1);

    if (prevToken !== prevTokenBefore) {
      // Moved from left edge.
      if (prevToken === token) {
        return rightPos;
      }
      // Moved from right edge.
      if (prevTokenBefore === token) {
        return leftPos;
      }
    }

    var newPos = rightPos;

    if (pos === prevPos || pos < prevPos) {
      if (rightPos - pos > pos - leftPos) {
        newPos = leftPos;
      }
    }
    return newPos;
  },



  onSelect: function (event) {
    var node = event.target;

    var pos = node.selectionStart;
    var endPos = node.selectionEnd;

    if (pos === endPos && this.state.hoverPillRef) {
      var tokenAt = this.tokenAt(pos);
      var tokenBefore = this.tokenBefore(pos);

      if (tokenAt && tokenAt === tokenBefore && tokenAt.type && tokenAt.type === 'tag') {
        // Clicked a tag.
        var rightPos = this.moveOffTag(pos, this.tracking.tokens, this.tracking.indexMap);
        var leftPos = this.moveOffTag(pos, this.tracking.tokens, this.tracking.indexMap, -1);
        this.tracking.pos = leftPos;
        this.tracking.range = rightPos - leftPos;
        node.selectionStart = leftPos;
        node.selectionEnd = rightPos;

        if (!this.state.isChoicesOpen) {
          this.setChoicesOpen(true);
        }

        return;
      }
    }

    pos = this.normalizePosition(pos, this.tracking.pos);
    endPos = this.normalizePosition(endPos, this.tracking.pos + this.tracking.range);

    this.tracking.pos = pos;
    this.tracking.range = endPos - pos;

    node.selectionStart = pos;
    node.selectionEnd = endPos;
  },

  onCopy: function () {
    var node = this.refs.content.getDOMNode();
    var start = node.selectionStart;
    var end = node.selectionEnd;
    var text = node.value.substring(start, end);
    var realStartIndex = this.tokenIndex(start, this.tracking.tokens, this.tracking.indexMap);
    var realEndIndex = this.tokenIndex(end, this.tracking.tokens, this.tracking.indexMap);
    var tokens = this.tracking.tokens.slice(realStartIndex, realEndIndex);
    text = this.rawValue(tokens);
    var originalValue = node.value;
    node.value = node.value + text;
    node.setSelectionRange(originalValue.length, originalValue.length + text.length);
    window.setTimeout(function() {
      node.value = originalValue;
      node.setSelectionRange(start, end);
    },0);
  },

  onCut: function () {
    var node = this.refs.content.getDOMNode();
    var start = node.selectionStart;
    var end = node.selectionEnd;
    var text = node.value.substring(start, end);
    var realStartIndex = this.tokenIndex(start, this.tracking.tokens, this.tracking.indexMap);
    var realEndIndex = this.tokenIndex(end, this.tracking.tokens, this.tracking.indexMap);
    var tokens = this.tracking.tokens.slice(realStartIndex, realEndIndex);
    text = this.rawValue(tokens);
    var originalValue = node.value;
    var cutValue = node.value.substring(0, start) + node.value.substring(end);
    node.value = node.value + text;
    node.setSelectionRange(originalValue.length, originalValue.length + text.length);
    var cutTokens = this.tracking.tokens.slice(0, realStartIndex).concat(this.tracking.tokens.slice(realEndIndex));
    window.setTimeout(function() {
      node.value = cutValue;
      node.setSelectionRange(start, start);
      this.tracking.pos = start;
      this.tracking.range = 0;
      this.tracking.tokens = cutTokens;
      this.tracking.indexMap = this.indexMap(this.tracking.tokens);

      // Convert tokens back into raw value with tags. Newly formed tags will
      // become part of the raw value.
      var rawValue = this.rawValue(this.tracking.tokens);

      // Set the value to the new raw value.
      this.onChangeValue(rawValue);

      this.snapshot();
    }.bind(this),0);
  },

  onKeyDown: function (event) {

    if (event.keyCode === 37) {
      this.leftArrowDown = true;
    } else if (event.keyCode === 39) {
      this.rightArrowDown = true;
    }

    // Cmd-Z or Ctrl-Z
    if (event.keyCode === 90 && (event.metaKey || event.ctrlKey) && !event.shiftKey) {
      event.preventDefault();
      this.undo();
    // Cmd-Shift-Z or Ctrl-Y
    } else if (
      (event.keyCode === 89 && event.ctrlKey && !event.shiftKey) ||
      (event.keyCode === 90 && event.metaKey && event.shiftKey)
    ) {
      this.redo();
    }
  },

  onKeyUp: function (event) {
    if (event.keyCode === 37) {
      this.leftArrowDown = false;
    } else if (event.keyCode === 39) {
      this.rightArrowDown = false;
    }
  },

  // Keep the highlight styles in sync with the textarea styles.
  adjustStyles: function (isMount) {
    var overlay = this.refs.highlight.getDOMNode();
    var content = this.refs.content.getDOMNode();

    var style = window.getComputedStyle(content);

    var backgroundColor = style.backgroundColor;

    utils.copyElementStyle(content, overlay);

    overlay.style.position = 'absolute';
    overlay.style.whiteSpace = 'pre-wrap';
    overlay.style.color = 'rgba(0,0,0,0)';
    overlay.style.webkitTextFillColor = 'rgba(0,0,0,0)';
    overlay.style.resize = 'none';
    overlay.style.borderColor = 'rgba(0,0,0,0)';

    if (utils.browser.isMozilla) {

      var paddingTop = parseFloat(style.paddingTop);
      var paddingBottom = parseFloat(style.paddingBottom);

      var borderTop = parseFloat(style.borderTopWidth);
      var borderBottom = parseFloat(style.borderBottomWidth);

      overlay.style.paddingTop = '0px';
      overlay.style.paddingBottom = '0px';

      overlay.style.height = (content.clientHeight - paddingTop - paddingBottom + borderTop + borderBottom) + 'px';
      overlay.style.top = style.paddingTop;
      overlay.style.boxShadow = 'none';
    }

    if (isMount) {
      this.backgroundColor = backgroundColor;
    }
    overlay.style.backgroundColor = this.backgroundColor;
    content.style.backgroundColor = 'rgba(0,0,0,0)';
  },

  // If the textarea is resized, need to re-sync the styles.
  onResize: function () {
    this.adjustStyles();
  },

  // If the window is resized, may need to re-sync the styles.
  // Probably not necessary with element resize?
  onResizeWindow: function () {
    this.adjustStyles();
  },

  componentDidMount: function () {
    this.adjustStyles(true);
    this.setOnResize('content', this.onResize);
    //this.setOnClickOutside('choices', this.onClickOutsideChoices);
  },

  onInsertFromSelect: function (event) {
    if (event.target.selectedIndex > 0) {
      var tag = event.target.value;
      event.target.selectedIndex = 0;
      var pos = this.tracking.pos;
      var insertPos = this.normalizePosition(pos);
      var tokens = this.tracking.tokens;
      var tokenIndex = this.tokenIndex(insertPos, tokens, this.tracking.indexMap);
      tokens.splice(tokenIndex, 0, {
        type: 'tag',
        value: tag
      });
      this.tracking.indexMap = this.indexMap(tokens);
      var newValue = this.rawValue(tokens);
      this.tracking.pos += this.prettyLabel(tag).length;
      this.onChangeValue(newValue);
      this.refs.content.getDOMNode().focus();
    }
  },

  onInsert: function (value) {
    var tag = value;
    var pos = this.tracking.pos;
    var endPos = this.tracking.pos + this.tracking.range;
    var insertPos = this.normalizePosition(pos);
    var endInsertPos = this.normalizePosition(endPos);
    var tokens = this.tracking.tokens;
    var tokenIndex = this.tokenIndex(insertPos, tokens, this.tracking.indexMap);
    var tokenEndIndex = this.tokenIndex(endInsertPos, tokens, this.tracking.indexMap);
    tokens.splice(tokenIndex, tokenEndIndex - tokenIndex, {
      type: 'tag',
      value: tag
    });
    this.tracking.indexMap = this.indexMap(tokens);
    var newValue = this.rawValue(tokens);
    this.tracking.pos += this.prettyLabel(tag).length;
    this.onChangeValue(newValue);
    this.setState({
      isChoicesOpen: false
    });
    this.refs.content.getDOMNode().focus();
  },

  onToggleChoices: function () {
    this.setChoicesOpen(!this.state.isChoicesOpen);
  },

  onCloseChoices: function () {
    if (this.state.isChoicesOpen) {
      this.setChoicesOpen(false);
    }
  },

  setChoicesOpen: function (isOpen) {
    if (isOpen) {
      this.onStartAction('open-replacements');
    } else {
      this.onStartAction('close-replacements');
    }
    this.setState({
      isChoicesOpen: isOpen
    });
  },

  closeChoices: function () {

  },

  getCloseIgnoreNodes: function () {
    return this.refs.toggle.getDOMNode();
  },

  onClickOutsideChoices: function () {
    // // If we didn't click on the toggle button, close the choices.
    // if (this.isNodeOutside(this.refs.toggle.getDOMNode(), event.target)) {
    //   console.log('not a toggle click')
    //   this.setState({
    //     isChoicesOpen: false
    //   });
    // }
  },

  onMouseMove: function (event) {
    // Placeholder to get at pill under mouse position. Inefficient, but not
    // sure there's another way.

    var position = {x: event.clientX, y: event.clientY};
    var nodes = this.refs.highlight.getDOMNode().childNodes;
    var matchedNode = null;
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (nodes[i].getAttribute('data-pretty')) {
        if (positionInNode(position, node)) {
          matchedNode = node;
          break;
        }
      }
    }

    if (matchedNode) {
      if (this.state.hoverPillRef !== matchedNode.getAttribute('data-ref')) {
        this.setState({
          hoverPillRef: matchedNode.getAttribute('data-ref')
        });
      }
    } else if (this.state.hoverPillRef) {
      this.setState({
        hoverPillRef: null
      });
    }
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    var config = this.props.config;
    var field = this.props.field;

    var replaceChoices = this.state.replaceChoices;

    // var selectReplaceChoices = [{
    //   value: '',
    //   label: 'Insert...'
    // }].concat(replaceChoices);

    return config.createElement('field', {
      field: field, plain: this.props.plain
    }, R.div({style: {position: 'relative'}},

      R.pre({
        className: 'pretty-highlight',
        ref: 'highlight'
      },
        this.prettyValue(this.props.field.value)
      ),

      (config.fieldIsSingleLine(field) ? R.input : R.textarea)({
        type: 'text',
        className: cx(_.extend({}, this.props.classes, {'pretty-content': true})),
        ref: 'content',
        rows: field.rows || this.props.rows,
        name: field.key,
        value: this.plainValue(this.props.field.value),
        onChange: this.onChange,
        onScroll: this.onScroll,
        style: {
          position: 'relative',
          top: 0,
          left: 0,
          cursor: this.state.hoverPillRef ? 'pointer' : null
        },
        onKeyPress: this.onKeyPress,
        onKeyDown: this.onKeyDown,
        onKeyUp: this.onKeyUp,
        onSelect: this.onSelect,
        onCopy: this.onCopy,
        onCut: this.onCut,
        onMouseMove: this.onMouseMove,
        onFocus: this.onFocusAction,
        onBlur: this.onBlurAction
      }),

      R.a({ref: 'toggle', href: 'JavaScript' + ':', onClick: this.onToggleChoices}, 'Insert...'),

      config.createElement('choices', {
        ref: 'choices',
        choices: replaceChoices, open: this.state.isChoicesOpen,
        onSelect: this.onInsert, onClose: this.onCloseChoices, ignoreCloseNodes: this.getCloseIgnoreNodes
      })
    ));
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/field":37,"../../mixins/resize":39,"../../mixins/undo-stack":41,"../../utils":46}],10:[function(require,module,exports){
(function (global){
// # select component

/*
Render select element to give a user choices for the value of a field. Note
it should support values other than strings. Currently this is only tested for
boolean values, but it _should_ work for other values.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

module.exports = React.createClass({

  displayName: 'Select',

  mixins: [require('../../mixins/field')],

  getInitialState: function () {
    return {
      choices: this.props.config.fieldChoices(this.props.field)
    };
  },

  componentWillReceiveProps: function (newProps) {
    this.setState({
      choices: newProps.config.fieldChoices(newProps.field)
    });
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    var config = this.props.config;
    var field = this.props.field;

    return config.createElement('field', {
      config: config, field: field, plain: this.props.plain
    }, config.createElement('select-value', {
      choices: this.state.choices, field: field, onChange: this.onChangeValue, onAction: this.onBubbleAction
    }));
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/field":37}],11:[function(require,module,exports){
(function (global){
// # single-line-string component

/*
Render a single line text input.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'SingleLineString',

  mixins: [require('../../mixins/field')],

  onChange: function (event) {
    this.onChangeValue(event.target.value);
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    var config = this.props.config;
    var field = this.props.field;

    return config.createElement('field', {
      config: config, field: field, plain: this.props.plain
    }, R.input({
      type: 'text',
      value: this.props.field.value,
      className: cx(this.props.classes),
      onChange: this.onChange,
      onFocus: this.onFocusAction,
      onBlur: this.onBlurAction
    }));
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/field":37}],12:[function(require,module,exports){
(function (global){
// # string component

/*
Render a field that can edit a string value.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'String',

  mixins: [require('../../mixins/field')],

  onChange: function (event) {
    this.onChangeValue(event.target.value);
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    var config = this.props.config;
    var field = this.props.field;

    return config.createElement('field', {
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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/field":37}],13:[function(require,module,exports){
(function (global){
// # unknown component

/*
Render a field with an unknown type.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = React.createClass({

  displayName: 'Unknown',

  mixins: [require('../../mixins/field')],

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    return R.div({},
      R.div({}, 'Component not found for: '),
      R.pre({}, JSON.stringify(this.props.field.rawFieldTemplate, null, 2))
    );
  }

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/field":37}],14:[function(require,module,exports){
(function (global){
// # add-item component

/*
The add button to append an item to a field.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'AddItem',

  mixins: [require('../../mixins/helper')],

  getDefaultProps: function () {
    return {
      label: '[add]'
    };
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    return R.span({className: cx(this.props.classes), onClick: this.props.onClick}, this.props.label);
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/helper":38}],15:[function(require,module,exports){
(function (global){
// # array-control component

/*
Render the item type choices and the add button for an array.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'ArrayControl',

  mixins: [require('../../mixins/helper')],

  getInitialState: function () {
    return {
      fieldTemplateIndex: 0
    };
  },

  onSelect: function (index) {
    this.setState({
      fieldTemplateIndex: index
    });
  },

  onAppend: function () {
    this.props.onAppend(this.state.fieldTemplateIndex);
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    var config = this.props.config;

    var field = this.props.field;
    var fieldTemplates = config.fieldItemFieldTemplates(field);

    var typeChoices = null;

    if (fieldTemplates.length > 0) {
      typeChoices = config.createElement('field-template-choices', {
        field: field, fieldTemplateIndex: this.state.fieldTemplateIndex, onSelect: this.onSelect
      });
    }

    return R.div({className: cx(this.props.classes)},
      typeChoices, ' ',
      config.createElement('add-item', {field: field, onClick: this.onAppend})
    );
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/helper":38}],16:[function(require,module,exports){
(function (global){
// # array-item-control component

/*
Render the remove and move buttons for an array field.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'ArrayItemControl',

  mixins: [require('../../mixins/helper')],

  onMoveBack: function () {
    this.props.onMove(this.props.index, this.props.index - 1);
  },

  onMoveForward: function () {
    this.props.onMove(this.props.index, this.props.index + 1);
  },

  onRemove: function () {
    this.props.onRemove(this.props.index);
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    var config = this.props.config;
    var field = this.props.field;

    return R.div({className: cx(this.props.classes)},
      config.createElement('remove-item', {field: field, onClick: this.onRemove, onMaybeRemove: this.props.onMaybeRemove}),
      this.props.index > 0 ? config.createElement('move-item-back', {field: field, onClick: this.onMoveBack}) : null,
      this.props.index < (this.props.numItems - 1) ? config.createElement('move-item-forward', {field: field, onClick: this.onMoveForward}) : null
    );
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/helper":38}],17:[function(require,module,exports){
(function (global){
// # array-item-value component

/*
Render the value of an array item.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'ArrayItemValue',

  mixins: [require('../../mixins/helper')],

  onChangeField: function (newValue, info) {
    this.props.onChange(this.props.index, newValue, info);
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    var config = this.props.config;
    var field = this.props.field;

    return R.div({className: cx(this.props.classes)},
      config.createFieldElement({field: field, onChange: this.onChangeField, onAction: this.onBubbleAction})
    );
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/helper":38}],18:[function(require,module,exports){
(function (global){
// # array-item component

/*
Render an array item.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = React.createClass({

  displayName: 'ArrayItem',

  mixins: [require('../../mixins/helper')],

  getInitialState: function () {
    return {
      isMaybeRemoving: false
    };
  },

  render: function () {
    return this.renderWithConfig();
  },

  onMaybeRemove: function (isMaybeRemoving) {
    this.setState({
      isMaybeRemoving: isMaybeRemoving
    });
  },

  renderDefault: function () {
    var config = this.props.config;
    var field = this.props.field;

    var classes = _.extend({}, this.props.classes);

    if (this.state.isMaybeRemoving) {
      classes['maybe-removing'] = true;
    }

    return R.div({className: cx(classes)},
      config.createElement('array-item-value', {field: field, index: this.props.index,
        onChange: this.props.onChange, onAction: this.onBubbleAction}),
      config.createElement('array-item-control', {field: field, index: this.props.index, numItems: this.props.numItems,
        onMove: this.props.onMove, onRemove: this.props.onRemove, onMaybeRemove: this.onMaybeRemove})
    );
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/helper":38}],19:[function(require,module,exports){
(function (global){
// # choices component

/*
Render customized (non-native) dropdown choices.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

var CSSTransitionGroup = React.createFactory(React.addons.CSSTransitionGroup);

module.exports = React.createClass({

  displayName: 'Choices',

  mixins: [
    require('../../mixins/helper'),
    //plugin.require('mixin.resize'),
    //plugin.require('mixin.scroll'),
    require('../../mixins/click-outside')
  ],

  getInitialState: function () {
    return {
      maxHeight: null,
      open: this.props.open
    };
  },

  getIgnoreCloseNodes: function () {
    if (!this.props.ignoreCloseNodes) {
      return [];
    }
    var nodes = this.props.ignoreCloseNodes();
    if (!_.isArray(nodes)) {
      nodes = [nodes];
    }
    return nodes;
  },

  componentDidMount: function () {
    this.setOnClickOutside('choices', function (event) {

      // Make sure we don't find any nodes to ignore.
      if (!_.find(this.getIgnoreCloseNodes(), function (node) {
        return this.isNodeInside(event.target, node);
      }.bind(this))) {
        this.props.onClose();
      }
    }.bind(this));

    this.adjustSize();
  },

  onSelect: function (choice) {
    this.props.onSelect(choice.value);
  },

  onResizeWindow: function () {
    this.adjustSize();
  },

  onScrollWindow: function () {
    this.adjustSize();
  },

  adjustSize: function () {
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

  componentWillReceiveProps: function (nextProps) {
    this.setState({open: nextProps.open}, function () {
      this.adjustSize();
    }.bind(this));
  },

  onScroll: function () {
    // console.log('stop that!')
    // event.preventDefault();
    // event.stopPropagation();
  },

  onWheel: function () {
    // event.preventDefault();
    // event.stopPropagation();
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    var choices = this.props.choices;

    if (choices && choices.length === 0) {
      choices = [{value: '///empty///'}];
    }

    return R.div({ref: 'container', onWheel: this.onWheel, onScroll: this.onScroll, className: 'choices-container', style: {
      userSelect: 'none', WebkitUserSelect: 'none', position: 'absolute',
      maxHeight: this.state.maxHeight ? this.state.maxHeight : null
    }},
      CSSTransitionGroup({transitionName: 'reveal'},
        this.props.open ? R.ul({ref: 'choices', className: 'choices'},
          choices.map(function (choice, i) {

            var choiceElement = null;

            if (choice.value === '///loading///') {
              choiceElement = R.a({href: 'JavaScript' + ':', onClick: this.props.onClose},
                R.span({className: 'choice-label'},
                  'Loading...'
                )
              );
            } else if (choice.value === '///empty///') {
              choiceElement = R.a({href: 'JavaScript' + ':', onClick: this.props.onClose},
                R.span({className: 'choice-label'},
                  'No choices available.'
                )
              );
            } else {
              choiceElement = R.a({href: 'JavaScript' + ':', onClick: this.onSelect.bind(this, choice)},
                R.span({className: 'choice-label'},
                  choice.label
                ),
                R.span({className: 'choice-sample'},
                  choice.sample
                )
              );
            }

            return R.li({key: i, className: 'choice'},
              choiceElement
            );
          }.bind(this))
        ) : null
      )
    );
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/click-outside":36,"../../mixins/helper":38}],20:[function(require,module,exports){
(function (global){
// # field-template-choices component

/*
Give a list of choices of item types to create as children of an field.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'FieldTemplateChoices',

  mixins: [require('../../mixins/helper')],

  onChange: function (event) {
    this.props.onSelect(parseInt(event.target.value));
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    var config = this.props.config;
    var field = this.props.field;

    var fieldTemplates = config.fieldItemFieldTemplates(field);

    var typeChoices = null;
    if (fieldTemplates.length > 1) {
      typeChoices = R.select({className: cx(this.props.classes), value: this.fieldTemplateIndex, onChange: this.onChange},
      fieldTemplates.map(function (fieldTemplate, i) {
        return R.option({key: i, value: i}, fieldTemplate.label || i);
      }));
    }

    return typeChoices ? typeChoices : R.span(null);
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/helper":38}],21:[function(require,module,exports){
(function (global){
// # field component

/*
Used by any fields to put the label and help text around the field.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var cx = React.addons.classSet;

var CSSTransitionGroup = React.createFactory(React.addons.CSSTransitionGroup);

module.exports = React.createClass({

  displayName: 'Field',

  mixins: [require('../../mixins/helper')],

  getInitialState: function () {
    return {
      collapsed: this.props.config.fieldIsCollapsed(this.props.field) ? true : false
    };
  },

  onClickLabel: function () {
    this.setState({
      collapsed: !this.state.collapsed
    });
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

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

    if (config.fieldIsRequired(field)) {
      classes.required = true;

      if (_.isUndefined(this.props.field.value) || this.props.field.value === '') {
        classes['validation-error-required'] = true;
      }

    } else {
      classes.optional = true;
    }

    return R.div({className: cx(classes), style: {display: (field.hidden ? 'none' : '')}},
      config.createElement('label', {
        config: config, field: field,
        index: index, onClick: config.fieldIsCollapsible(field) ? this.onClickLabel : null
      }),
      CSSTransitionGroup({transitionName: 'reveal'},
        this.state.collapsed ? [] : [
          config.createElement('help', {
            config: config, field: field,
            key: 'help'
          }),
          this.props.children
        ]
      )
    );
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/helper":38}],22:[function(require,module,exports){
(function (global){
// # help component

/*
Just the help text block.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'Help',

  mixins: [require('../../mixins/helper')],

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    var helpText = this.props.config.fieldHelpText(this.props.field);

    return helpText ?
      R.div({className: cx(this.props.classes), dangerouslySetInnerHTML: {__html: helpText}}) :
      R.span(null);
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/helper":38}],23:[function(require,module,exports){
(function (global){
// # label component

/*
Just the label for a field.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'Label',

  mixins: [require('../../mixins/helper')],

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    var config = this.props.config;
    var field = this.props.field;

    var fieldLabel = config.fieldLabel(field);

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
        text = R.a({href: 'JavaScript' + ':', onClick: this.props.onClick}, text);
      }
      label = R.label({}, text);
    }

    var requiredOrNot;

    if (!config.fieldHasValueChildren(field)) {
      requiredOrNot = R.span({
        className: config.fieldIsRequired(field) ? 'required-text' : 'not-required-text'
      });
    }

    return R.div({
      className: cx(this.props.classes)
    },
      label,
      ' ',
      requiredOrNot
    );
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/helper":38}],24:[function(require,module,exports){
(function (global){
// # move-item-back component

/*
Button to move an item backwards in list.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'MoveItemBack',

  mixins: [require('../../mixins/helper')],

  getDefaultProps: function () {
    return {
      label: '[up]'
    };
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    return R.span({className: cx(this.props.classes), onClick: this.props.onClick}, this.props.label);
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/helper":38}],25:[function(require,module,exports){
(function (global){
// # move-item-forward component

/*
Button to move an item forward in a list.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'MoveItemForward',

  mixins: [require('../../mixins/helper')],

  getDefaultProps: function () {
    return {
      label: '[down]'
    };
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    return R.span({className: cx(this.props.classes), onClick: this.props.onClick}, this.props.label);
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/helper":38}],26:[function(require,module,exports){
(function (global){
// # object-control component

/*
Render the item type choices and the add button.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'ObjectControl',

  mixins: [require('../../mixins/helper')],

  getInitialState: function () {
    return {
      fieldTemplateIndex: 0
    };
  },

  onSelect: function (index) {
    this.setState({
      fieldTemplateIndex: index
    });
  },

  onAppend: function () {
    this.props.onAppend(this.state.fieldTemplateIndex);
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
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

    return R.div({className: cx(this.props.classes)},
      typeChoices, ' ',
      config.createElement('add-item', {onClick: this.onAppend})
    );
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/helper":38}],27:[function(require,module,exports){
(function (global){
// # object-item-control component

/*
Render the remove buttons for an object item.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'ObjectItemControl',

  mixins: [require('../../mixins/helper')],

  onRemove: function () {
    this.props.onRemove(this.props.itemKey);
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    var config = this.props.config;
    var field = this.props.field;

    return R.div({className: cx(this.props.classes)},
      config.createElement('remove-item', {field: field, onClick: this.onRemove})
    );
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/helper":38}],28:[function(require,module,exports){
(function (global){
// # object-item-key component

/*
Render an object item key editor.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'ObjectItemKey',

  mixins: [require('../../mixins/helper')],

  onChange: function (event) {
    this.props.onChange(event.target.value);
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    return R.input({className: cx(this.props.classes), type: 'text', value: this.props.displayKey, onChange: this.onChange});
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/helper":38}],29:[function(require,module,exports){
(function (global){
// # object-item-value component

/*
Render the value of an object item.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'ObjectItemValue',

  mixins: [require('../../mixins/helper')],

  onChangeField: function (newValue, info) {
    this.props.onChange(this.props.itemKey, newValue, info);
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    var config = this.props.config;
    var field = this.props.field;

    return R.div({className: cx(this.props.classes)},
      config.createFieldElement({field: field, onChange: this.onChangeField, plain: true})
    );
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/helper":38}],30:[function(require,module,exports){
(function (global){
// # object-item component

/*
Render an object item.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'ObjectItem',

  mixins: [require('../../mixins/helper')],

  onChangeKey: function (newKey) {
    this.props.onMove(this.props.itemKey, newKey);
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    var config = this.props.config;
    var field = this.props.field;

    return R.div({className: cx(this.props.className)},
      config.createElement('object-item-key', {field: field, onChange: this.onChangeKey, displayKey: this.props.displayKey, itemKey: this.props.itemKey}),
      config.createElement('object-item-value', {field: field, onChange: this.props.onChange, itemKey: this.props.itemKey}),
      config.createElement('object-item-control', {field: field, onRemove: this.props.onRemove, itemKey: this.props.itemKey})
    );
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/helper":38}],31:[function(require,module,exports){
(function (global){
// # remove-item component

/*
Remove an item.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'RemoveItem',

  mixins: [require('../../mixins/helper')],

  getDefaultProps: function () {
    return {
      label: '[remove]'
    };
  },

  render: function () {
    return this.renderWithConfig();
  },

  onMouseOverRemove: function () {
    if (this.props.onMaybeRemove) {
      this.props.onMaybeRemove(true);
    }
  },

  onMouseOutRemove: function () {
    if (this.props.onMaybeRemove) {
      this.props.onMaybeRemove(false);
    }
  },

  renderDefault: function () {
    return R.span({
      className: cx(this.props.classes), onClick: this.props.onClick,
      onMouseOver: this.onMouseOverRemove, onMouseOut: this.onMouseOutRemove
    }, this.props.label);
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/helper":38}],32:[function(require,module,exports){
(function (global){
// # help component

/*
Just the help text block.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'Sample',

  mixins: [require('../../mixins/helper')],

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    var choice = this.props.choice;

    return choice.sample ?
      R.div({className: cx(this.props.className)},
        choice.sample
      ) :
      R.span(null);
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/helper":38}],33:[function(require,module,exports){
(function (global){
// # select-value component

/*
Render a select dropdown for a list of choices. Choices values can be of any
type.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'SelectValue',

  mixins: [require('../../mixins/helper')],

  onChange: function (event) {
    var choiceValue = event.target.value;
    var choiceType = choiceValue.substring(0, choiceValue.indexOf(':'));
    if (choiceType === 'choice') {
      var choiceIndex = choiceValue.substring(choiceValue.indexOf(':') + 1);
      choiceIndex = parseInt(choiceIndex);
      this.props.onChange(this.props.choices[choiceIndex].value);
    }
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    var choices = this.props.choices || [];

    var choicesOrLoading;

    if (choices.length === 1 && choices[0].value === '///loading///') {
      choicesOrLoading = R.div({},
        'Loading choices...'
      );
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

      choicesOrLoading = R.select({
        className: cx(this.props.classes),
        onChange: this.onChange,
        value: valueChoice.choiceValue,
        onFocus: this.onFocusAction,
        onBlur: this.onBlurAction
      },
      choices.map(function (choice, i) {
        return R.option({
          key: i,
          value: choice.choiceValue
        }, choice.label);
      }.bind(this))
    );
  }

  return choicesOrLoading;
}
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/helper":38}],34:[function(require,module,exports){
(function (global){
// # default-config

/*
This is the default configuration for formatic. It's just an object with a bunch
of behavior functions that are passed into all the components. So to change
formatic's behavior, it's simple matter of cloning this object and overriding
the methods.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

var utils = require('./utils');

module.exports = {

  // Field element factories. Create field elements.

  createElement_Fields: React.createFactory(require('./components/fields/fields')),

  createElement_String: React.createFactory(require('./components/fields/string')),

  createElement_SingleLineString: React.createFactory(require('./components/fields/single-line-string')),

  createElement_Select: React.createFactory(require('./components/fields/select')),

  createElement_Boolean: React.createFactory(require('./components/fields/boolean')),

  createElement_CheckboxBoolean: React.createFactory(require('./components/fields/checkbox-boolean')),

  createElement_PrettyText: React.createFactory(require('./components/fields/pretty-text')),

  createElement_Array: React.createFactory(require('./components/fields/array')),

  createElement_CheckboxArray: React.createFactory(require('./components/fields/checkbox-array')),

  createElement_Object: React.createFactory(require('./components/fields/object')),

  createElement_Json: React.createFactory(require('./components/fields/json')),

  createElement_UnknownField: React.createFactory(require('./components/fields/unknown')),

  createElement_Copy: React.createFactory(require('./components/fields/copy')),


  // Other element factories. Create helper elements used by field components.

  createElement_Field: React.createFactory(require('./components/helpers/field')),

  createElement_Label: React.createFactory(require('./components/helpers/label')),

  createElement_Help: React.createFactory(require('./components/helpers/help')),

  createElement_Choices: React.createFactory(require('./components/helpers/choices')),

  createElement_ArrayControl: React.createFactory(require('./components/helpers/array-control')),

  createElement_ArrayItemControl: React.createFactory(require('./components/helpers/array-item-control')),

  createElement_ArrayItemValue: React.createFactory(require('./components/helpers/array-item-value')),

  createElement_ArrayItem: React.createFactory(require('./components/helpers/array-item')),

  createElement_FieldTemplateChoices: React.createFactory(require('./components/helpers/field-template-choices')),

  createElement_AddItem: React.createFactory(require('./components/helpers/add-item')),

  createElement_RemoveItem: React.createFactory(require('./components/helpers/remove-item')),

  createElement_MoveItemForward: React.createFactory(require('./components/helpers/move-item-forward')),

  createElement_MoveItemBack: React.createFactory(require('./components/helpers/move-item-back')),

  createElement_ObjectControl: React.createFactory(require('./components/helpers/object-control')),

  createElement_ObjectItemControl: React.createFactory(require('./components/helpers/object-item-control')),

  createElement_ObjectItemValue: React.createFactory(require('./components/helpers/object-item-value')),

  createElement_ObjectItemKey: React.createFactory(require('./components/helpers/object-item-key')),

  createElement_ObjectItem: React.createFactory(require('./components/helpers/object-item')),

  createElement_SelectValue: React.createFactory(require('./components/helpers/select-value')),

  createElement_Sample: React.createFactory(require('./components/helpers/sample')),


  // Field default value factories. Give a default value for a specific type.

  createDefaultValue_String: function (/* fieldTemplate */) {
    return '';
  },

  createDefaultValue_Object: function (/* fieldTemplate */) {
    return {};
  },

  createDefaultValue_Array: function (/* fieldTemplate */) {
    return [];
  },

  createDefaultValue_Boolean: function (/* fieldTemplate */) {
    return false;
  },

  createDefaultValue_Fields: utils.delegateTo('createDefaultValue_Object'),

  createDefaultValue_SingleLineString: utils.delegateTo('createDefaultValue_String'),

  createDefaultValue_Select: utils.delegateTo('createDefaultValue_String'),

  createDefaultValue_Json: utils.delegateTo('createDefaultValue_Object'),

  createDefaultValue_CheckboxArray: utils.delegateTo('createDefaultValue_Array'),

  createDefaultValue_CheckboxBoolean: utils.delegateTo('createDefaultValue_Boolean'),


  // Field value coercers. Coerce a value into a value appropriate for a specific type.

  coerceValue_String: function (fieldTemplate, value) {
    if (_.isString(value)) {
      return value;
    }
    if (_.isUndefined(value) || value === null) {
      return '';
    }
    return JSON.stringify(value);
  },

  coerceValue_Object: function (fieldTemplate, value) {
    if (!_.isObject(value)) {
      return {};
    }
    return value;
  },

  coerceValue_Array: function (fieldTemplate, value) {
    if (!_.isArray(value)) {
      return [value];
    }
    return value;
  },

  coerceValue_Boolean: function (fieldTemplate, value) {
    return this.coerceValueToBoolean(value);
  },

  coerceValue_Fields: utils.delegateTo('coerceValue_Object'),

  coerceValue_SingleLineString: utils.delegateTo('coerceValue_String'),

  coerceValue_Select: utils.delegateTo('coerceValue_String'),

  coerceValue_Json: utils.delegateTo('coerceValue_Object'),

  coerceValue_CheckboxArray: utils.delegateTo('coerceValue_Array'),

  coerceValue_CheckboxBoolean: utils.delegateTo('coerceValue_Boolean'),


  // Field child fields factories, so some types can have dynamic children.

  createChildFields_Array: function (field) {
    var config = this;

    return field.value.map(function (arrayItem, i) {
      var childFieldTemplate = config.childFieldTemplateForValue(field, arrayItem);

      var childField = config.createChildField(field, {
        fieldTemplate: childFieldTemplate, key: i, fieldIndex: i, value: arrayItem
      });

      return childField;
    });
  },

  createChildFields_Object: function (field) {
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
  hasElementFactory: function (name) {
    var config = this;

    return config['createElement_' + name] ? true : false;
  },

  // Create an element given a name, props, and children.
  createElement: function (name, props, children) {
    var config = this;

    if (!props.config) {
      props = _.extend({}, props, {config: config});
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
  createFieldElement: function (props) {
    var config = this;

    var name = config.fieldTypeName(props.field);

    if (config.hasElementFactory(name)) {
      return config.createElement(name, props);
    }

    return config.createElement('UnknownField', props);
  },

  // Render the root formatic component
  renderFormaticComponent: function (component) {
    var config = this;
    var props = component.props;

    var field = config.createRootField(props);

    return R.div({className: 'formatic'},
      config.createFieldElement({field: field, onChange: component.onChange, onAction: component.onAction})
    );
  },

  // Render any component.
  renderComponent: function (component) {
    var config = this;

    var name = component.constructor.displayName;

    if (config['renderComponent_' + name]) {
      return config['renderComponent_' + name](component);
    }

    return component.renderDefault();
  },

  // Render field components.
  renderFieldComponent: function (component) {
    var config = this;

    return config.renderComponent(component);
  },

  // Normalize an element name.
  elementName: function (name) {
    return utils.dashToPascal(name);
  },

  // Type aliases.

  alias_Dict: 'Object',

  alias_Bool: 'Boolean',

  alias_PrettyTextarea: 'PrettyText',

  alias_SingleLineString: function (fieldTemplate) {
    if (fieldTemplate.replaceChoices) {
      return 'PrettyText';
    } else if (fieldTemplate.choices) {
      return 'Select';
    }
    return 'SingleLineString';
  },

  alias_String: function (fieldTemplate) {
    var config = this;

    if (fieldTemplate.replaceChoices) {
      return 'PrettyText';
    } else if (fieldTemplate.choices) {
      return 'Select';
    } else if (config.fieldTemplateIsSingleLine(fieldTemplate)) {
      return 'SingleLineString';
    }
    return 'String';
  },

  alias_Text: utils.delegateTo('alias_String'),

  alias_Unicode: utils.delegateTo('alias_SingleLineString'),

  alias_Str: utils.delegateTo('alias_SingleLineString'),

  alias_List: 'Array',

  alias_CheckboxList: 'CheckboxArray',

  alias_Fieldset: 'Fields',

  alias_Checkbox: 'CheckboxBoolean',

  // Field factory

  // Given a field, expand all child fields recursively to get the default
  // values of all fields.
  inflateFieldValue: function (field) {
    var config = this;

    if (config.fieldHasValueChildren(field)) {
      var value = _.clone(field.value);
      var childFields = config.createChildFields(field);
      childFields.forEach(function (childField) {
        if (config.isKey(childField.key)) {
          value[childField.key] = config.inflateFieldValue(childField);
        }
      });
      return value;
    } else {
      return field.value;
    }
  },

  // Initialize the root field.
  initRootField: function (/* field, props */) {
  },

  // Initialize every field.
  initField: function (/* field */) {
  },

  // If an array of field templates are passed in, this method is used to
  // wrap the fields inside a single root field template.
  wrapFieldTemplates: function (fieldTemplates) {
    return {
      type: 'fields',
      plain: true,
      fields: fieldTemplates
    };
  },

  // Given the props that are passed in, create the root field.
  createRootField: function (props) {
    var config = this;

    var fieldTemplate = props.fieldTemplate || props.fieldTemplates || props.field || props.fields;
    var value = props.value;

    if (!fieldTemplate) {
      fieldTemplate = config.createFieldTemplateFromValue(value);
    }

    if (_.isArray(fieldTemplate)) {
      fieldTemplate = config.wrapFieldTemplates(fieldTemplate);
    }

    var field = _.extend({}, fieldTemplate, {rawFieldTemplate: fieldTemplate});
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
  createRootValue: function (props) {
    var config = this;

    var field = config.createRootField(props);

    return config.inflateFieldValue(field);
  },

  // Create dynamic child fields for a field.
  createChildFields: function (field) {
    var config = this;

    var typeName = config.fieldTypeName(field);

    if (config['createChildFields_' + typeName]) {
      return config['createChildFields_' + typeName](field);
    }

    return config.fieldChildFieldTemplates(field).map(function (childField, i) {
      return config.createChildField(field, {
        fieldTemplate: childField, key: childField.key, fieldIndex: i, value: field.value[childField.key]
      });
    });
  },

  // Create a single child field for a parent field.
  createChildField: function (parentField, options) {
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
  createNewChildFieldValue: function (parentField, itemFieldIndex) {
    var config = this;

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
  createFieldTemplateFromValue: function (value) {
    var config = this;

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
      var arrayItemFields = value.map(function (value, i) {
        var childField = config.createFieldTemplateFromValue(value);
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

  createDefaultValue: function (fieldTemplate) {
    var config = this;

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
  hasValue: function (fieldTemplate, value) {
    return value !== null && !_.isUndefined(value);
  },

  // Coerce a value to value appropriate for a field.
  coerceValue: function (field, value) {
    var config = this;

    var typeName = config.fieldTypeName(field);

    if (config['coerceValue_' + typeName]) {
      return config['coerceValue_' + typeName](field, value);
    }

    return value;
  },

  // Given a field and a child value, find the appropriate field template for
  // that child value.
  childFieldTemplateForValue: function (field, childValue) {
    var config = this;

    var fieldTemplate;

    var fieldTemplates = config.fieldItemFieldTemplates(field);

    fieldTemplate = _.find(fieldTemplates, function (fieldTemplate) {
      return config.matchesFieldTemplateToValue(fieldTemplate, childValue);
    });

    if (fieldTemplate) {
      return fieldTemplate;
    } else {
      return config.createFieldTemplateFromValue(childValue);
    }
  },

  // Determine if a value is a match for a field template.
  matchesFieldTemplateToValue: function (fieldTemplate, value) {
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
  fieldTemplateTypeName: function (fieldTemplate) {
    var config = this;

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
  fieldTemplateDefaultValue: function (fieldTemplate) {

    return fieldTemplate.default;
  },

  // Value for a field template. Used to determine the value of a new child
  // field.
  fieldTemplateValue: function (fieldTemplate) {
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
  fieldTemplateMatch: function (fieldTemplate) {
    return fieldTemplate.match;
  },

  // Determine if a field template has a single-line value.
  fieldTemplateIsSingleLine: function (fieldTemplate) {
    return fieldTemplate.isSingleLine || fieldTemplate.is_single_line ||
            fieldTemplate.type === 'single-line-string' || fieldTemplate.type === 'SingleLineString';
  },

  // Field helpers

  // Get an array of keys representing the path to a value.
  fieldValuePath: function (field) {
    var config = this;

    var parentPath = [];

    if (field.parent) {
      parentPath = config.fieldValuePath(field.parent);
    }

    return parentPath.concat(field.key).filter(function (key) {
      return !_.isUndefined(key) && key !== '';
    });
  },

  // Clone a field with a different value.
  fieldWithValue: function (field, value) {
    return _.extend({}, field, {value: value});
  },

  fieldTypeName: utils.delegateTo('fieldTemplateTypeName'),

  // Get the choices for a dropdown field.
  fieldChoices: function (field) {
    var config = this;

    return config.normalizeChoices(field.choices);
  },

  // Get a set of boolean choices for a field.
  fieldBooleanChoices: function (field) {
    var config = this;

    var choices = config.fieldChoices(field);

    if (choices.length === 0) {
      return [{
        label: 'Yes',
        value: true
      },{
        label: 'No',
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
  fieldReplaceChoices: function (field) {
    var config = this;

    return config.normalizeChoices(field.replaceChoices);
  },

  // Get a label for a field.
  fieldLabel: function (field) {
    return field.label;
  },

  // Get the help text for a field.
  fieldHelpText: function (field) {
    return field.help_text_html || field.help_text || field.helpText || field.helpTextHtml;
  },

  // Get whether or not a field is required.
  fieldIsRequired: function (field) {
    return field.required ? true : false;
  },

  // Determine if value for this field is not a leaf value.
  fieldHasValueChildren: function (field) {
    var config = this;

    var defaultValue = config.createDefaultValue(field);

    if (_.isObject(defaultValue) || _.isArray(defaultValue)) {
      return true;
    }

    return false;
  },

  // Get the child field templates for this field.
  fieldChildFieldTemplates: function (field) {
    return field.fields || [];
  },

  // Get the field templates for each item of this field. (For dynamic children,
  // like arrays.)
  fieldItemFieldTemplates: function (field) {
    if (!field.itemFields) {
      return [{type: 'text'}];
    }
    if (!_.isArray(field.itemFields)) {
      return [field.itemFields];
    }
    return field.itemFields;
  },

  fieldIsSingleLine: utils.delegateTo('fieldTemplateIsSingleLine'),

  // Get whether or not a field is collapsed.
  fieldIsCollapsed: function (field) {
    return field.collapsed ? true : false;
  },

  // Get wheter or not a field can be collapsed.
  fieldIsCollapsible: function (field) {
    return field.collapsible || !_.isUndefined(field.collapsed);
  },

  // Get the number of rows for a field.
  fieldRows: function (field) {
    return field.rows;
  },

  fieldMatch: utils.delegateTo('fieldTemplateMatch'),

  // Other helpers

  // Convert a key to a nice human-readable version.
  humanize: function(property) {
    property = property.replace(/\{\{/g, '');
    property = property.replace(/\}\}/g, '');
    return property.replace(/_/g, ' ')
    .replace(/(\w+)/g, function(match) {
      return match.charAt(0).toUpperCase() + match.slice(1);
    });
  },

  // Normalize some choices for a drop-down.
  normalizeChoices: function (choices) {
    var config = this;

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
  coerceValueToBoolean: function (value) {
    if (!_.isString(value)) {
      // Just use the default truthiness.
      return value ? true : false;
    }
    value = value.toLowerCase();
    if (value === '' || value === 'no' || value === 'off' || value === 'false') {
      return false;
    }
    return true;
  },

  // Determine if a value is a valid key.
  isKey: function (key) {
    return (_.isNumber(key) && key >= 0) || (_.isString(key) && key !== '');
  },

  // Fast way to check for empty object.
  isEmptyObject: function (obj) {
    for(var key in obj) {
      if (obj.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./components/fields/array":1,"./components/fields/boolean":2,"./components/fields/checkbox-array":3,"./components/fields/checkbox-boolean":4,"./components/fields/copy":5,"./components/fields/fields":6,"./components/fields/json":7,"./components/fields/object":8,"./components/fields/pretty-text":9,"./components/fields/select":10,"./components/fields/single-line-string":11,"./components/fields/string":12,"./components/fields/unknown":13,"./components/helpers/add-item":14,"./components/helpers/array-control":15,"./components/helpers/array-item":18,"./components/helpers/array-item-control":16,"./components/helpers/array-item-value":17,"./components/helpers/choices":19,"./components/helpers/field":21,"./components/helpers/field-template-choices":20,"./components/helpers/help":22,"./components/helpers/label":23,"./components/helpers/move-item-back":24,"./components/helpers/move-item-forward":25,"./components/helpers/object-control":26,"./components/helpers/object-item":30,"./components/helpers/object-item-control":27,"./components/helpers/object-item-key":28,"./components/helpers/object-item-value":29,"./components/helpers/remove-item":31,"./components/helpers/sample":32,"./components/helpers/select-value":33,"./utils":46}],35:[function(require,module,exports){
(function (global){
// # formatic

/*
The root formatic component.

The root formatic component is actually two components. The main component is
a controlled component where you must pass the value in with each render. This
is actually wrapped in another component which allows you to use formatic as
an uncontrolled component where it retains the state of the value. The wrapper
is what is actually exported.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

var utils = require('./utils');

var defaultConfig = require('./default-config');

// The main formatic component that renders the form.
var FormaticControlledClass = React.createClass({

  displayName: 'FormaticControlled',

  // Respond to any value changes.
  onChange: function (newValue, info) {
    if (!this.props.onChange) {
      return;
    }
    info = _.extend({}, info);
    info.path = this.props.config.fieldValuePath(info.field);
    this.props.onChange(newValue, info);
  },

  // Respond to any actions other than value changes. (For example, focus and
  // blur.)
  onAction: function (info) {
    if (!this.props.onAction) {
      return;
    }
    info = _.extend({}, info);
    info.path = this.props.config.fieldValuePath(info.field);
    this.props.onAction(info);
  },

  // Render the root component by delegating to the config.
  render: function () {

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
    createConfig: function () {
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
      clickOutside: require('./mixins/click-outside.js'),
      field: require('./mixins/field.js'),
      helper: require('./mixins/helper.js'),
      resize: require('./mixins/resize.js'),
      scroll: require('./mixins/scroll.js'),
      undoStack: require('./mixins/undo-stack.js')
    },
    plugins: {
      bootstrap: require('./plugins/bootstrap'),
      meta: require('./plugins/meta'),
      reference: require('./plugins/reference'),
      elementClasses: require('./plugins/element-classes')
    },
    utils: utils
  },

  displayName: 'Formatic',

  // If we got a value, treat this component as controlled. Either way, retain
  // the value in the state.
  getInitialState: function () {
    return {
      isControlled: !_.isUndefined(this.props.value),
      value: _.isUndefined(this.props.value) ? this.props.defaultValue : this.props.value
    };
  },

  // If this is a controlled component, change our state to reflect the new
  // value. For uncontrolled components, ignore any value changes.
  componentWillReceiveProps: function (newProps) {
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
  onChange: function (newValue, info) {
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
  onAction: function (info) {
    if (this.props.onAction) {
      this.props.onAction(info);
    }
    var action = utils.dashToPascal(info.action);
    if (this.props['on' + action]) {
      this.props['on' + action](info);
    }
  },

  // Render the wrapper component (by just delegating to the main component).
  render: function () {

    var config = this.props.config || defaultConfig;
    var value = this.state.value;

    if (this.state.isControlled) {
      if (!this.props.onChange) {
        console.log('You should supply an onChange handler if you supply a value.');
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

    _.each(this.props, function (value, key) {
      if (!(key in props)) {
        props[key] = value;
      }
    });

    return FormaticControlled(props);
  }

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./default-config":34,"./mixins/click-outside.js":36,"./mixins/field.js":37,"./mixins/helper.js":38,"./mixins/resize.js":39,"./mixins/scroll.js":40,"./mixins/undo-stack.js":41,"./plugins/bootstrap":42,"./plugins/element-classes":43,"./plugins/meta":44,"./plugins/reference":45,"./utils":46}],36:[function(require,module,exports){
(function (global){
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

'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

var hasAncestor = function (child, parent) {
  if (child.parentNode === parent) {
    return true;
  }
  if (child.parentNode === null) {
    return false;
  }
  return hasAncestor(child.parentNode, parent);
};

module.exports = {

  isNodeOutside: function (nodeOut, nodeIn) {
    if (nodeOut === nodeIn) {
      return false;
    }
    if (hasAncestor(nodeOut, nodeIn)) {
      return false;
    }
    return true;
  },

  isNodeInside: function (nodeIn, nodeOut) {
    return !this.isNodeOutside(nodeIn, nodeOut);
  },

  _onClickMousedown: function() {
    _.each(this.clickOutsideHandlers, function (funcs, ref) {
      if (this.refs[ref]) {
        this._mousedownRefs[ref] = true;
      }
    }.bind(this));
  },

  _onClickMouseup: function (event) {
    _.each(this.clickOutsideHandlers, function (funcs, ref) {
      if (this.refs[ref] && this._mousedownRefs[ref]) {
        if (this.isNodeOutside(event.target, this.refs[ref].getDOMNode())) {
          funcs.forEach(function (fn) {
            fn.call(this, event);
          }.bind(this));
        }
      }
      this._mousedownRefs[ref] = false;
    }.bind(this));
  },

  setOnClickOutside: function (ref, fn) {
    if (!this.clickOutsideHandlers[ref]) {
      this.clickOutsideHandlers[ref] = [];
    }
    this.clickOutsideHandlers[ref].push(fn);
  },

  componentDidMount: function () {
    this.clickOutsideHandlers = {};
    this._didMouseDown = false;
    document.addEventListener('mousedown', this._onClickMousedown);
    document.addEventListener('mouseup', this._onClickMouseup);
    //document.addEventListener('click', this._onClickDocument);
    this._mousedownRefs = {};
  },

  componentWillUnmount: function () {
    this.clickOutsideHandlers = {};
    //document.removeEventListener('click', this._onClickDocument);
    document.removeEventListener('mouseup', this._onClickMouseup);
    document.removeEventListener('mousedown', this._onClickMousedown);
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],37:[function(require,module,exports){
(function (global){
// # field mixin

/*
This mixin gets mixed into all field components.
*/

'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = {

  // Signal a change in value.
  onChangeValue: function (value) {
    this.props.onChange(value, {
      field: this.props.field
    });
  },

  // Bubble up a value.
  onBubbleValue: function (value, info) {
    this.props.onChange(value, info);
  },

  // Start an action bubbling up through parent components.
  onStartAction: function (action, props) {
    if (this.props.onAction) {
      var info = _.extend({}, props);
      info.action = action;
      info.field = this.props.field;
      this.props.onAction(info);
    }
  },

  onFocusAction: function () {
    this.onStartAction('focus');
  },

  onBlurAction: function () {
    this.onStartAction('blur');
  },

  // Bubble up an action.
  onBubbleAction: function (info) {
    if (this.props.onAction) {
      this.props.onAction(info);
    }
  },

  // Delegate rendering back to config so it can be wrapped.
  renderWithConfig: function () {
    return this.props.config.renderFieldComponent(this);
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],38:[function(require,module,exports){
(function (global){
// # helper mixin

/*
This gets mixed into all helper components.
*/

'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = {

  // Delegate rendering back to config so it can be wrapped.
  renderWithConfig: function () {
    return this.props.config.renderComponent(this);
  },

  // Start an action bubbling up through parent components.
  onStartAction: function (action, props) {
    if (this.props.onAction) {
      var info = _.extend({}, props);
      info.action = action;
      info.field = this.props.field;
      this.props.onAction(info);
    }
  },

  // Bubble up an action.
  onBubbleAction: function (info) {
    if (this.props.onAction) {
      this.props.onAction(info);
    }
  },

  onFocusAction: function () {
    this.onStartAction('focus');
  },

  onBlurAction: function () {
    this.onStartAction('blur');
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],39:[function(require,module,exports){
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

'use strict';

var id = 0;

var resizeIntervalElements = {};
var resizeIntervalElementsCount = 0;
var resizeIntervalTimer = null;

var checkElements = function () {
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

var addResizeIntervalHandler = function (element, fn) {
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

var removeResizeIntervalHandlers = function (element) {
  if (!('__resizeId' in element)) {
    return;
  }
  var id = element.__resizeId;
  delete element.__resizeId;
  delete element.__resizeHandlers;
  delete resizeIntervalElements[id];
  resizeIntervalElementsCount--;
  if (resizeIntervalElementsCount < 1) {
    clearInterval(resizeIntervalTimer);
    resizeIntervalTimer = null;
  }
};

var onResize = function (ref, fn) {
  fn(ref);
};

module.exports = {

  componentDidMount: function () {
    if (this.onResizeWindow) {
      window.addEventListener('resize', this.onResizeWindow);
    }
    this.resizeElementRefs = {};
  },

  componentWillUnmount: function () {
    if (this.onResizeWindow) {
      window.removeEventListener('resize', this.onResizeWindow);
    }
    Object.keys(this.resizeElementRefs).forEach(function (ref) {
      removeResizeIntervalHandlers(this.refs[ref].getDOMNode());
    }.bind(this));
  },

  setOnResize: function (ref, fn) {
    if (!this.resizeElementRefs[ref]) {
      this.resizeElementRefs[ref] = true;
    }
    addResizeIntervalHandler(this.refs[ref].getDOMNode(), onResize.bind(this, ref, fn));
  }
};

},{}],40:[function(require,module,exports){
// # scroll mixin

/*
Currently unused.
*/

'use strict';

module.exports = function (plugin) {

  plugin.exports = {

    componentDidMount: function () {
      if (this.onScrollWindow) {
        window.addEventListener('scroll', this.onScrollWindow);
      }
    },

    componentWillUnmount: function () {
      if (this.onScrollWindow) {
        window.removeEventListener('scroll', this.onScrollWindow);
      }
    }
  };
};

},{}],41:[function(require,module,exports){
// # undo-stack mixin

/*
Gives your component an undo stack.
*/

// http://prometheusresearch.github.io/react-forms/examples/undo.html

'use strict';

module.exports = {
  getInitialState: function() {
    return {undo: [], redo: []};
  },

  snapshot: function() {
    var undo = this.state.undo.concat(this.getStateSnapshot());
    if (typeof this.state.undoDepth === 'number') {
      if (undo.length > this.state.undoDepth) {
        undo.shift();
      }
    }
    this.setState({undo: undo, redo: []});
  },

  hasUndo: function() {
    return this.state.undo.length > 0;
  },

  hasRedo: function() {
    return this.state.redo.length > 0;
  },

  redo: function() {
    this._undoImpl(true);
  },

  undo: function() {
    this._undoImpl();
  },

  _undoImpl: function(isRedo) {
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
    this.setState({undo:undo, redo:redo});
  }
};

},{}],42:[function(require,module,exports){
(function (global){
// # bootstrap plugin

/*
The bootstrap plugin sneaks in some classes to elements so that it plays well
with Twitter Bootstrap.
*/

'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

// Declare some classes and labels for each element.
var modifiers = {

  'Field': {classes: {'form-group': true}},
  'Help': {classes: {'help-block': true}},
  'Sample': {classes: {'help-block': true}},
  'ArrayControl': {classes: {'form-inline': true}},
  'ArrayItem': {classes: {'well': true}},
  'FieldTemplateChoices': {classes: {'form-control': true}},
  'AddItem': {classes: {'glyphicon glyphicon-plus': true}, label: ''},
  'RemoveItem': {classes: {'glyphicon glyphicon-remove': true}, label: ''},
  'MoveItemBack': {classes: {'glyphicon glyphicon-arrow-up': true}, label: ''},
  'MoveItemForward': {classes: {'glyphicon glyphicon-arrow-down': true}, label: ''},
  'ObjectItemKey': {classes: {'form-control': true}},

  'SingleLineString': {classes: {'form-control': true}},
  'String': {classes: {'form-control': true}},
  'PrettyText': {classes: {'form-control': true}},
  'Json': {classes: {'form-control': true}},
  'SelectValue': {classes: {'form-control': true}}
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
      if ('label' in modifier) {
        props.label = modifier.label;
      }
    }

    return defaultCreateElement.call(this, name, props, children);
  };
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],43:[function(require,module,exports){
(function (global){
// # element-classes plugin

/*
This plugins provides a config method addElementClass that lets you add on a
class to an element.
*/

'use strict';

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
      props = _.extend({}, props, {classes: elementClasses[name]});
    }

    return defaultCreateElement.call(this, name, props, children);
  };
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],44:[function(require,module,exports){
// # meta plugin

/*
The meta plugin lets you pass in a meta prop to formatic. The prop then gets
passed through as a property for every field. You can then wrap `initField` to
get your meta values.
*/

'use strict';

module.exports = function (config) {

  var initRootField = config.initRootField;

  config.initRootField = function (field, props) {
    var config = this;

    field.meta = props.meta || {};

    initRootField.apply(config, arguments);
  };

  var initField = config.initField;

  config.initField = function (field) {
    var config = this;

    if (field.parent && field.parent.meta) {
      field.meta = field.parent.meta;
    }

    initField.apply(config, arguments);
  };

};

},{}],45:[function(require,module,exports){
(function (global){
// # reference plugin

/*
This plugin allows fields to be strings and reference other fields by key or
id. It also allows a field to extend another field with
extends: ['foo', 'bar'] where 'foo' and 'bar' refer to other keys or ids.
*/

'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = function (config) {

  var initField = config.initField;

  // Look for a template in this field or any of its parents.
  config.findFieldTemplate = function (field, name) {
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
  config.resolveFieldTemplate = function (field, fieldTemplate) {
    var config = this;

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
  };

  // Wrap the initField method.
  config.initField = function (field) {

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
        fieldTemplate = _.extend({}, fieldTemplate, {template: false});
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

    initField.call(config, arguments);
  };

};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],46:[function(require,module,exports){
(function (global){
// # utils

/*
Just some shared utility functions.
*/

'use strict';

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
  isSafari: false
};

// Sniff the browser.
var ua = navigator.userAgent;
if(ua.indexOf('Chrome') > -1) {
  browser.isChrome = true;
} else if (ua.indexOf('Safari') > -1) {
  browser.isSafari = true;
} else if (ua.indexOf('Opera') > -1) {
  browser.isOpera = true;
} else if (ua.indexOf('Firefox') > -1) {
  browser.isMozilla = true;
} else if (ua.indexOf('MSIE') > -1) {
  browser.isIe = true;
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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"formatic":[function(require,module,exports){
module.exports = require('./lib/formatic');

},{"./lib/formatic":35}]},{},[])("formatic")
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvY29tcG9uZW50cy9maWVsZHMvYXJyYXkuanMiLCJsaWIvY29tcG9uZW50cy9maWVsZHMvYm9vbGVhbi5qcyIsImxpYi9jb21wb25lbnRzL2ZpZWxkcy9jaGVja2JveC1hcnJheS5qcyIsImxpYi9jb21wb25lbnRzL2ZpZWxkcy9jaGVja2JveC1ib29sZWFuLmpzIiwibGliL2NvbXBvbmVudHMvZmllbGRzL2NvcHkuanMiLCJsaWIvY29tcG9uZW50cy9maWVsZHMvZmllbGRzLmpzIiwibGliL2NvbXBvbmVudHMvZmllbGRzL2pzb24uanMiLCJsaWIvY29tcG9uZW50cy9maWVsZHMvb2JqZWN0LmpzIiwibGliL2NvbXBvbmVudHMvZmllbGRzL3ByZXR0eS10ZXh0LmpzIiwibGliL2NvbXBvbmVudHMvZmllbGRzL3NlbGVjdC5qcyIsImxpYi9jb21wb25lbnRzL2ZpZWxkcy9zaW5nbGUtbGluZS1zdHJpbmcuanMiLCJsaWIvY29tcG9uZW50cy9maWVsZHMvc3RyaW5nLmpzIiwibGliL2NvbXBvbmVudHMvZmllbGRzL3Vua25vd24uanMiLCJsaWIvY29tcG9uZW50cy9oZWxwZXJzL2FkZC1pdGVtLmpzIiwibGliL2NvbXBvbmVudHMvaGVscGVycy9hcnJheS1jb250cm9sLmpzIiwibGliL2NvbXBvbmVudHMvaGVscGVycy9hcnJheS1pdGVtLWNvbnRyb2wuanMiLCJsaWIvY29tcG9uZW50cy9oZWxwZXJzL2FycmF5LWl0ZW0tdmFsdWUuanMiLCJsaWIvY29tcG9uZW50cy9oZWxwZXJzL2FycmF5LWl0ZW0uanMiLCJsaWIvY29tcG9uZW50cy9oZWxwZXJzL2Nob2ljZXMuanMiLCJsaWIvY29tcG9uZW50cy9oZWxwZXJzL2ZpZWxkLXRlbXBsYXRlLWNob2ljZXMuanMiLCJsaWIvY29tcG9uZW50cy9oZWxwZXJzL2ZpZWxkLmpzIiwibGliL2NvbXBvbmVudHMvaGVscGVycy9oZWxwLmpzIiwibGliL2NvbXBvbmVudHMvaGVscGVycy9sYWJlbC5qcyIsImxpYi9jb21wb25lbnRzL2hlbHBlcnMvbW92ZS1pdGVtLWJhY2suanMiLCJsaWIvY29tcG9uZW50cy9oZWxwZXJzL21vdmUtaXRlbS1mb3J3YXJkLmpzIiwibGliL2NvbXBvbmVudHMvaGVscGVycy9vYmplY3QtY29udHJvbC5qcyIsImxpYi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWl0ZW0tY29udHJvbC5qcyIsImxpYi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWl0ZW0ta2V5LmpzIiwibGliL2NvbXBvbmVudHMvaGVscGVycy9vYmplY3QtaXRlbS12YWx1ZS5qcyIsImxpYi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWl0ZW0uanMiLCJsaWIvY29tcG9uZW50cy9oZWxwZXJzL3JlbW92ZS1pdGVtLmpzIiwibGliL2NvbXBvbmVudHMvaGVscGVycy9zYW1wbGUuanMiLCJsaWIvY29tcG9uZW50cy9oZWxwZXJzL3NlbGVjdC12YWx1ZS5qcyIsImxpYi9kZWZhdWx0LWNvbmZpZy5qcyIsImxpYi9mb3JtYXRpYy5qcyIsImxpYi9taXhpbnMvY2xpY2stb3V0c2lkZS5qcyIsImxpYi9taXhpbnMvZmllbGQuanMiLCJsaWIvbWl4aW5zL2hlbHBlci5qcyIsImxpYi9taXhpbnMvcmVzaXplLmpzIiwibGliL21peGlucy9zY3JvbGwuanMiLCJsaWIvbWl4aW5zL3VuZG8tc3RhY2suanMiLCJsaWIvcGx1Z2lucy9ib290c3RyYXAuanMiLCJsaWIvcGx1Z2lucy9lbGVtZW50LWNsYXNzZXMuanMiLCJsaWIvcGx1Z2lucy9tZXRhLmpzIiwibGliL3BsdWdpbnMvcmVmZXJlbmNlLmpzIiwibGliL3V0aWxzLmpzIiwiaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqeUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3IyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZHQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgYXJyYXkgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgYSBmaWVsZCB0byBlZGl0IGFycmF5IHZhbHVlcy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxudmFyIENTU1RyYW5zaXRpb25Hcm91cCA9IFJlYWN0LmNyZWF0ZUZhY3RvcnkoUmVhY3QuYWRkb25zLkNTU1RyYW5zaXRpb25Hcm91cCk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnQXJyYXknLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICAvLyBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgLy8gICByZXR1cm4ge1xuICAvLyAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZVxuICAvLyAgIH07XG4gIC8vIH0sXG5cbiAgbmV4dExvb2t1cElkOiAwLFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuXG4gICAgLy8gTmVlZCB0byBjcmVhdGUgYXJ0aWZpY2lhbCBrZXlzIGZvciB0aGUgYXJyYXkuIEluZGV4ZXMgYXJlIG5vdCBnb29kIGtleXMsXG4gICAgLy8gc2luY2UgdGhleSBjaGFuZ2UuIFNvLCBtYXAgZWFjaCBwb3NpdGlvbiB0byBhbiBhcnRpZmljaWFsIGtleVxuICAgIHZhciBsb29rdXBzID0gW107XG5cbiAgICB2YXIgaXRlbXMgPSB0aGlzLnByb3BzLmZpZWxkLnZhbHVlO1xuXG4gICAgaXRlbXMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSwgaSkge1xuICAgICAgbG9va3Vwc1tpXSA9ICdfJyArIHRoaXMubmV4dExvb2t1cElkO1xuICAgICAgdGhpcy5uZXh0TG9va3VwSWQrKztcbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGxvb2t1cHM6IGxvb2t1cHNcbiAgICB9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXdQcm9wcykge1xuXG4gICAgdmFyIGxvb2t1cHMgPSB0aGlzLnN0YXRlLmxvb2t1cHM7XG5cbiAgICB2YXIgaXRlbXMgPSBuZXdQcm9wcy5maWVsZC52YWx1ZTtcblxuICAgIC8vIE5lZWQgdG8gc2V0IGFydGlmaWNpYWwga2V5cyBmb3IgbmV3IGFycmF5IGl0ZW1zLlxuICAgIGlmIChpdGVtcy5sZW5ndGggPiBsb29rdXBzLmxlbmd0aCkge1xuICAgICAgZm9yICh2YXIgaSA9IGxvb2t1cHMubGVuZ3RoOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbG9va3Vwc1tpXSA9ICdfJyArIHRoaXMubmV4dExvb2t1cElkO1xuICAgICAgICB0aGlzLm5leHRMb29rdXBJZCsrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgbG9va3VwczogbG9va3Vwc1xuICAgIH0pO1xuICB9LFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAoaSwgbmV3VmFsdWUsIGluZm8pIHtcbiAgICB2YXIgbmV3QXJyYXlWYWx1ZSA9IHRoaXMucHJvcHMuZmllbGQudmFsdWUuc2xpY2UoMCk7XG4gICAgbmV3QXJyYXlWYWx1ZVtpXSA9IG5ld1ZhbHVlO1xuICAgIHRoaXMub25CdWJibGVWYWx1ZShuZXdBcnJheVZhbHVlLCBpbmZvKTtcbiAgfSxcblxuICBvbkFwcGVuZDogZnVuY3Rpb24gKGl0ZW1DaG9pY2VJbmRleCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgdmFyIG5ld1ZhbHVlID0gY29uZmlnLmNyZWF0ZU5ld0NoaWxkRmllbGRWYWx1ZShmaWVsZCwgaXRlbUNob2ljZUluZGV4KTtcblxuICAgIHZhciBpdGVtcyA9IGZpZWxkLnZhbHVlO1xuXG4gICAgaXRlbXMgPSBpdGVtcy5jb25jYXQobmV3VmFsdWUpO1xuXG4gICAgdGhpcy5vbkNoYW5nZVZhbHVlKGl0ZW1zKTtcbiAgfSxcblxuICBvblJlbW92ZTogZnVuY3Rpb24gKGkpIHtcbiAgICB2YXIgbG9va3VwcyA9IHRoaXMuc3RhdGUubG9va3VwcztcbiAgICBsb29rdXBzLnNwbGljZShpLCAxKTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGxvb2t1cHM6IGxvb2t1cHNcbiAgICB9KTtcbiAgICB2YXIgbmV3SXRlbXMgPSB0aGlzLnByb3BzLmZpZWxkLnZhbHVlLnNsaWNlKDApO1xuICAgIG5ld0l0ZW1zLnNwbGljZShpLCAxKTtcbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUobmV3SXRlbXMpO1xuICB9LFxuXG4gIG9uTW92ZTogZnVuY3Rpb24gKGZyb21JbmRleCwgdG9JbmRleCkge1xuICAgIHZhciBsb29rdXBzID0gdGhpcy5zdGF0ZS5sb29rdXBzO1xuICAgIHZhciBmcm9tSWQgPSBsb29rdXBzW2Zyb21JbmRleF07XG4gICAgdmFyIHRvSWQgPSBsb29rdXBzW3RvSW5kZXhdO1xuICAgIGxvb2t1cHNbZnJvbUluZGV4XSA9IHRvSWQ7XG4gICAgbG9va3Vwc1t0b0luZGV4XSA9IGZyb21JZDtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGxvb2t1cHM6IGxvb2t1cHNcbiAgICB9KTtcblxuICAgIHZhciBuZXdJdGVtcyA9IHRoaXMucHJvcHMuZmllbGQudmFsdWUuc2xpY2UoMCk7XG4gICAgaWYgKGZyb21JbmRleCAhPT0gdG9JbmRleCAmJlxuICAgICAgZnJvbUluZGV4ID49IDAgJiYgZnJvbUluZGV4IDwgbmV3SXRlbXMubGVuZ3RoICYmXG4gICAgICB0b0luZGV4ID49IDAgJiYgdG9JbmRleCA8IG5ld0l0ZW1zLmxlbmd0aFxuICAgICkge1xuICAgICAgbmV3SXRlbXMuc3BsaWNlKHRvSW5kZXgsIDAsIG5ld0l0ZW1zLnNwbGljZShmcm9tSW5kZXgsIDEpWzBdKTtcbiAgICB9XG4gICAgdGhpcy5vbkNoYW5nZVZhbHVlKG5ld0l0ZW1zKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICB2YXIgZmllbGRzID0gY29uZmlnLmNyZWF0ZUNoaWxkRmllbGRzKGZpZWxkKTtcblxuICAgIHZhciBudW1JdGVtcyA9IGZpZWxkLnZhbHVlLmxlbmd0aDtcbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywge1xuICAgICAgZmllbGQ6IGZpZWxkLCBwbGFpbjogdGhpcy5wcm9wcy5wbGFpblxuICAgIH0sXG4gICAgICBSLmRpdih7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpfSxcbiAgICAgICAgQ1NTVHJhbnNpdGlvbkdyb3VwKHt0cmFuc2l0aW9uTmFtZTogJ3JldmVhbCd9LFxuICAgICAgICBmaWVsZHMubWFwKGZ1bmN0aW9uIChjaGlsZEZpZWxkLCBpKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdhcnJheS1pdGVtJywge1xuICAgICAgICAgICAga2V5OiB0aGlzLnN0YXRlLmxvb2t1cHNbaV0sXG4gICAgICAgICAgICBmaWVsZDogY2hpbGRGaWVsZCxcbiAgICAgICAgICAgIGluZGV4OiBpLFxuICAgICAgICAgICAgbnVtSXRlbXM6IG51bUl0ZW1zLFxuICAgICAgICAgICAgb25Nb3ZlOiB0aGlzLm9uTW92ZSxcbiAgICAgICAgICAgIG9uUmVtb3ZlOiB0aGlzLm9uUmVtb3ZlLFxuICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsXG4gICAgICAgICAgICBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvblxuICAgICAgICAgIH0pO1xuICAgICAgICB9LmJpbmQodGhpcykpKSxcbiAgICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2FycmF5LWNvbnRyb2wnLCB7ZmllbGQ6IGZpZWxkLCBvbkFwcGVuZDogdGhpcy5vbkFwcGVuZH0pXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgYm9vbGVhbiBjb21wb25lbnRcblxuLypcblJlbmRlciBhIGRyb3Bkb3duIHRvIGhhbmRsZSB5ZXMvbm8gYm9vbGVhbiB2YWx1ZXMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0Jvb2xlYW4nLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICBvbkNoYW5nZTogZnVuY3Rpb24gKG5ld1ZhbHVlKSB7XG4gICAgdGhpcy5vbkNoYW5nZVZhbHVlKG5ld1ZhbHVlKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICB2YXIgY2hvaWNlcyA9IGNvbmZpZy5maWVsZEJvb2xlYW5DaG9pY2VzKGZpZWxkKTtcblxuICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQnLCB7XG4gICAgICBmaWVsZDogZmllbGQsIHBsYWluOiB0aGlzLnByb3BzLnBsYWluXG4gICAgfSwgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ3NlbGVjdC12YWx1ZScsIHtcbiAgICAgIGNob2ljZXM6IGNob2ljZXMsIGZpZWxkOiBmaWVsZCwgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsIG9uQWN0aW9uOiB0aGlzLm9uQnViYmxlQWN0aW9uXG4gICAgfSkpO1xuICB9XG59KTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjaGVja2JveC1hcnJheSBjb21wb25lbnRcblxuLypcblVzZWQgd2l0aCBhcnJheSB2YWx1ZXMgdG8gc3VwcGx5IG11bHRpcGxlIGNoZWNrYm94ZXMgZm9yIGFkZGluZyBtdWx0aXBsZVxuZW51bWVyYXRlZCB2YWx1ZXMgdG8gYW4gYXJyYXkuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdDaGVja2JveEFycmF5JyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNob2ljZXM6IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkQ2hvaWNlcyh0aGlzLnByb3BzLmZpZWxkKVxuICAgIH07XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gKG5ld1Byb3BzKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjaG9pY2VzOiBuZXdQcm9wcy5jb25maWcuZmllbGRDaG9pY2VzKG5ld1Byb3BzLmZpZWxkKVxuICAgIH0pO1xuICB9LFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAoKSB7XG4gICAgLy8gR2V0IGFsbCB0aGUgY2hlY2tlZCBjaGVja2JveGVzIGFuZCBjb252ZXJ0IHRvIGFuIGFycmF5IG9mIHZhbHVlcy5cbiAgICB2YXIgY2hvaWNlTm9kZXMgPSB0aGlzLnJlZnMuY2hvaWNlcy5nZXRET01Ob2RlKCkuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2lucHV0Jyk7XG4gICAgY2hvaWNlTm9kZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChjaG9pY2VOb2RlcywgMCk7XG4gICAgdmFyIHZhbHVlcyA9IGNob2ljZU5vZGVzLm1hcChmdW5jdGlvbiAobm9kZSkge1xuICAgICAgcmV0dXJuIG5vZGUuY2hlY2tlZCA/IG5vZGUudmFsdWUgOiBudWxsO1xuICAgIH0pLmZpbHRlcihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9KTtcbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUodmFsdWVzKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICB2YXIgY2hvaWNlcyA9IHRoaXMuc3RhdGUuY2hvaWNlcyB8fCBbXTtcblxuICAgIHZhciBpc0lubGluZSA9ICFfLmZpbmQoY2hvaWNlcywgZnVuY3Rpb24gKGNob2ljZSkge1xuICAgICAgcmV0dXJuIGNob2ljZS5zYW1wbGU7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywge1xuICAgICAgZmllbGQ6IGZpZWxkXG4gICAgfSxcbiAgICAgIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcyksIHJlZjogJ2Nob2ljZXMnfSxcbiAgICAgICAgY2hvaWNlcy5tYXAoZnVuY3Rpb24gKGNob2ljZSwgaSkge1xuXG4gICAgICAgICAgdmFyIGlucHV0RmllbGQgPSBSLnNwYW4oe3N0eWxlOiB7d2hpdGVTcGFjZTogJ25vd3JhcCd9fSxcbiAgICAgICAgICAgIFIuaW5wdXQoe1xuICAgICAgICAgICAgICBuYW1lOiBmaWVsZC5rZXksXG4gICAgICAgICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgICAgICAgIHZhbHVlOiBjaG9pY2UudmFsdWUsXG4gICAgICAgICAgICAgIGNoZWNrZWQ6IGZpZWxkLnZhbHVlLmluZGV4T2YoY2hvaWNlLnZhbHVlKSA+PSAwID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgICAgICAgICAgb25Gb2N1czogdGhpcy5vbkZvY3VzQWN0aW9uLFxuICAgICAgICAgICAgICBvbkJsdXI6IHRoaXMub25CbHVyQWN0aW9uXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICcgJyxcbiAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAnZmllbGQtY2hvaWNlLWxhYmVsJ30sXG4gICAgICAgICAgICAgIGNob2ljZS5sYWJlbFxuICAgICAgICAgICAgKVxuICAgICAgICAgICk7XG5cbiAgICAgICAgICBpZiAoaXNJbmxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiBSLnNwYW4oe2tleTogaSwgY2xhc3NOYW1lOiAnZmllbGQtY2hvaWNlJ30sXG4gICAgICAgICAgICAgIGlucHV0RmllbGQsICcgJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFIuZGl2KHtrZXk6IGksIGNsYXNzTmFtZTogJ2ZpZWxkLWNob2ljZSd9LFxuICAgICAgICAgICAgICBpbnB1dEZpZWxkLCAnICcsXG4gICAgICAgICAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdzYW1wbGUnLCB7ZmllbGQ6IGZpZWxkLCBjaG9pY2U6IGNob2ljZX0pXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgKVxuICAgICk7XG4gIH1cbn0pO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNoZWNrYm94LWJvb2xlYW4gY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgYSBmaWVsZCB0aGF0IGNhbiBlZGl0IGEgYm9vbGVhbiB3aXRoIGEgY2hlY2tib3guXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnQ2hlY2tib3hCb29sZWFuJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHRoaXMub25DaGFuZ2VWYWx1ZShldmVudC50YXJnZXQuY2hlY2tlZCk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHtcbiAgICAgIGNvbmZpZzogY29uZmlnLCBmaWVsZDogZmllbGQsIHBsYWluOiB0cnVlXG4gICAgfSxcbiAgICBSLnNwYW4oe3N0eWxlOiB7d2hpdGVTcGFjZTogJ25vd3JhcCd9fSxcbiAgICAgIFIuaW5wdXQoe1xuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICBjaGVja2VkOiBmaWVsZC52YWx1ZSxcbiAgICAgICAgY2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpLFxuICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgICAgb25Gb2N1czogdGhpcy5vbkZvY3VzQWN0aW9uLFxuICAgICAgICBvbkJsdXI6IHRoaXMub25CbHVyQWN0aW9uXG4gICAgICB9KSxcbiAgICAgIFIuc3Bhbih7fSwgJyAnKSxcbiAgICAgIFIuc3Bhbih7fSwgY29uZmlnLmZpZWxkSGVscFRleHQoZmllbGQpIHx8IGNvbmZpZy5maWVsZExhYmVsKGZpZWxkKSlcbiAgICApKTtcbiAgfVxufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29weSBjb21wb25lbnRcblxuLypcblJlbmRlciBub24tZWRpdGFibGUgaHRtbC90ZXh0ICh0aGluayBhcnRpY2xlIGNvcHkpLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0NvcHknLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3Nlcyl9LFxuICAgICAgdGhpcy5wcm9wcy5jb25maWcuZmllbGRIZWxwVGV4dCh0aGlzLnByb3BzLmZpZWxkKVxuICAgICk7XG4gIH1cbn0pO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGZpZWxkcyBjb21wb25lbnRcblxuLypcblJlbmRlciBhIGZpZWxkIHRvIGVkaXQgdGhlIHZhbHVlcyBvZiBhbiBvYmplY3Qgd2l0aCBzdGF0aWMgcHJvcGVydGllcy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0ZpZWxkcycsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIG9uQ2hhbmdlRmllbGQ6IGZ1bmN0aW9uIChrZXksIG5ld1ZhbHVlLCBpbmZvKSB7XG4gICAgaWYgKGtleSkge1xuICAgICAgdmFyIG5ld09iamVjdFZhbHVlID0gXy5leHRlbmQoe30sIHRoaXMucHJvcHMuZmllbGQudmFsdWUpO1xuICAgICAgbmV3T2JqZWN0VmFsdWVba2V5XSA9IG5ld1ZhbHVlO1xuICAgICAgdGhpcy5vbkJ1YmJsZVZhbHVlKG5ld09iamVjdFZhbHVlLCBpbmZvKTtcbiAgICB9XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHZhciBmaWVsZHMgPSBjb25maWcuY3JlYXRlQ2hpbGRGaWVsZHMoZmllbGQpO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHtcbiAgICAgIGNvbmZpZzogY29uZmlnLCBmaWVsZDogZmllbGQsIHBsYWluOiB0aGlzLnByb3BzLnBsYWluXG4gICAgfSxcbiAgICAgIFIuZmllbGRzZXQoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKX0sXG4gICAgICAgIGZpZWxkcy5tYXAoZnVuY3Rpb24gKGNoaWxkRmllbGQsIGkpIHtcbiAgICAgICAgICB2YXIga2V5ID0gY2hpbGRGaWVsZC5rZXkgfHwgaTtcbiAgICAgICAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUZpZWxkRWxlbWVudCh7XG4gICAgICAgICAgICBrZXk6IGtleSB8fCBpLFxuICAgICAgICAgICAgZmllbGQ6IGNoaWxkRmllbGQsXG4gICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZUZpZWxkLmJpbmQodGhpcywga2V5KSwgb25BY3Rpb246IHRoaXMub25CdWJibGVBY3Rpb25cbiAgICAgICAgICB9KTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgKVxuICAgICk7XG4gIH1cblxufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMganNvbiBjb21wb25lbnRcblxuLypcblRleHRhcmVhIGVkaXRvciBmb3IgSlNPTi4gV2lsbCB2YWxpZGF0ZSB0aGUgSlNPTiBiZWZvcmUgc2V0dGluZyB0aGUgdmFsdWUsIHNvXG53aGlsZSB0aGUgdmFsdWUgaXMgaW52YWxpZCwgbm8gZXh0ZXJuYWwgc3RhdGUgY2hhbmdlcyB3aWxsIG9jY3VyLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0pzb24nLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcm93czogNVxuICAgIH07XG4gIH0sXG5cbiAgaXNWYWxpZFZhbHVlOiBmdW5jdGlvbiAodmFsdWUpIHtcblxuICAgIHRyeSB7XG4gICAgICBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlzVmFsaWQ6IHRydWUsXG4gICAgICB2YWx1ZTogSlNPTi5zdHJpbmdpZnkodGhpcy5wcm9wcy5maWVsZC52YWx1ZSwgbnVsbCwgMilcbiAgICB9O1xuICB9LFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB2YXIgaXNWYWxpZCA9IHRoaXMuaXNWYWxpZFZhbHVlKGV2ZW50LnRhcmdldC52YWx1ZSk7XG5cbiAgICBpZiAoaXNWYWxpZCkge1xuICAgICAgLy8gTmVlZCB0byBoYW5kbGUgdGhpcyBiZXR0ZXIuIE5lZWQgdG8gdHJhY2sgcG9zaXRpb24uXG4gICAgICB0aGlzLl9pc0NoYW5naW5nID0gdHJ1ZTtcbiAgICAgIHRoaXMub25DaGFuZ2VWYWx1ZShKU09OLnBhcnNlKGV2ZW50LnRhcmdldC52YWx1ZSkpO1xuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgaXNWYWxpZDogaXNWYWxpZCxcbiAgICAgIHZhbHVlOiBldmVudC50YXJnZXQudmFsdWVcbiAgICB9KTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV4dFByb3BzKSB7XG4gICAgaWYgKCF0aGlzLl9pc0NoYW5naW5nKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgaXNWYWxpZDogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IEpTT04uc3RyaW5naWZ5KG5leHRQcm9wcy5maWVsZC52YWx1ZSwgbnVsbCwgMilcbiAgICAgIH0pO1xuICAgIH1cbiAgICB0aGlzLl9pc0NoYW5naW5nID0gZmFsc2U7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQnLCB7XG4gICAgICBmaWVsZDogY29uZmlnLmZpZWxkV2l0aFZhbHVlKGZpZWxkLCB0aGlzLnN0YXRlLnZhbHVlKSwgcGxhaW46IHRoaXMucHJvcHMucGxhaW5cbiAgICB9LCBSLnRleHRhcmVhKHtcbiAgICAgICAgY2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpLFxuICAgICAgICB2YWx1ZTogdGhpcy5zdGF0ZS52YWx1ZSxcbiAgICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsXG4gICAgICAgIHN0eWxlOiB7YmFja2dyb3VuZENvbG9yOiB0aGlzLnN0YXRlLmlzVmFsaWQgPyAnJyA6ICdyZ2IoMjU1LDIwMCwyMDApJ30sXG4gICAgICAgIHJvd3M6IGNvbmZpZy5maWVsZFJvd3MoZmllbGQpIHx8IHRoaXMucHJvcHMucm93cyxcbiAgICAgICAgb25Gb2N1czogdGhpcy5vbkZvY3VzQWN0aW9uLFxuICAgICAgICBvbkJsdXI6IHRoaXMub25CbHVyQWN0aW9uXG4gICAgICB9KVxuICAgICk7XG4gIH1cbn0pO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIG9iamVjdCBjb21wb25lbnRcblxuLypcblJlbmRlciBhIGZpZWxkIHRvIGVkaXQgYW4gb2JqZWN0IHdpdGggZHluYW1pYyBjaGlsZCBmaWVsZHMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxudmFyIENTU1RyYW5zaXRpb25Hcm91cCA9IFJlYWN0LmNyZWF0ZUZhY3RvcnkoUmVhY3QuYWRkb25zLkNTU1RyYW5zaXRpb25Hcm91cCk7XG5cbnZhciB0ZW1wS2V5UHJlZml4ID0gJyQkX190ZW1wX18nO1xuXG52YXIgdGVtcEtleSA9IGZ1bmN0aW9uIChpZCkge1xuICByZXR1cm4gdGVtcEtleVByZWZpeCArIGlkO1xufTtcblxudmFyIGlzVGVtcEtleSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgcmV0dXJuIGtleS5zdWJzdHJpbmcoMCwgdGVtcEtleVByZWZpeC5sZW5ndGgpID09PSB0ZW1wS2V5UHJlZml4O1xufTtcblxuLy8gVE9ETzoga2VlcCBpbnZhbGlkIGtleXMgYXMgc3RhdGUgYW5kIGRvbid0IHNlbmQgaW4gb25DaGFuZ2U7IGNsb25lIGNvbnRleHRcbi8vIGFuZCB1c2UgY2xvbmUgdG8gY3JlYXRlIGNoaWxkIGNvbnRleHRzXG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnT2JqZWN0JyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgbmV4dExvb2t1cElkOiAwLFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGtleVRvSWQgPSB7fTtcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHRoaXMucHJvcHMuZmllbGQudmFsdWUpO1xuICAgIHZhciBrZXlPcmRlciA9IFtdO1xuICAgIC8vIFRlbXAga2V5cyBrZWVwcyB0aGUga2V5IHRvIGRpc3BsYXksIHdoaWNoIHNvbWV0aW1lcyBtYXkgYmUgZGlmZmVyZW50XG4gICAgLy8gdGhhbiB0aGUgYWN0dWFsIGtleS4gRm9yIGV4YW1wbGUsIGR1cGxpY2F0ZSBrZXlzIGFyZSBub3QgYWxsb3dlZCxcbiAgICAvLyBidXQgd2UgbWF5IHRlbXBvcmFyaWx5IHNob3cgZHVwbGljYXRlIGtleXMuXG4gICAgdmFyIHRlbXBEaXNwbGF5S2V5cyA9IHt9O1xuXG4gICAgLy8gS2V5cyBkb24ndCBtYWtlIGdvb2QgcmVhY3Qga2V5cywgc2luY2Ugd2UncmUgYWxsb3dpbmcgdGhlbSB0byBiZVxuICAgIC8vIGNoYW5nZWQgaGVyZSwgc28gd2UnbGwgaGF2ZSB0byBjcmVhdGUgZmFrZSBrZXlzIGFuZFxuICAgIC8vIGtlZXAgdHJhY2sgb2YgdGhlIG1hcHBpbmcgb2YgcmVhbCBrZXlzIHRvIGZha2Uga2V5cy4gWXVjay5cbiAgICBrZXlzLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgdmFyIGlkID0gKyt0aGlzLm5leHRMb29rdXBJZDtcbiAgICAgIC8vIE1hcCB0aGUgcmVhbCBrZXkgdG8gdGhlIGlkLlxuICAgICAga2V5VG9JZFtrZXldID0gaWQ7XG4gICAgICAvLyBLZWVwIHRoZSBvcmRlcmluZyBvZiB0aGUga2V5cyBzbyB3ZSBkb24ndCBzaHVmZmxlIHRoaW5ncyBhcm91bmQgbGF0ZXIuXG4gICAgICBrZXlPcmRlci5wdXNoKGtleSk7XG4gICAgICAvLyBJZiB0aGlzIGlzIGEgdGVtcG9yYXJ5IGtleSB0aGF0IHdhcyBwZXJzaXN0ZWQsIGJlc3Qgd2UgY2FuIGRvIGlzIGRpc3BsYXlcbiAgICAgIC8vIGEgYmxhbmsuXG4gICAgICAvLyBUT0RPOiBQcm9iYWJseSBqdXN0IG5vdCBzZW5kIHRlbXBvcmFyeSBrZXlzIGJhY2sgdGhyb3VnaC4gVGhpcyBiZWhhdmlvclxuICAgICAgLy8gaXMgYWN0dWFsbHkgbGVmdG92ZXIgZnJvbSBhbiBlYXJsaWVyIGluY2FybmF0aW9uIG9mIGZvcm1hdGljIHdoZXJlXG4gICAgICAvLyB2YWx1ZXMgaGFkIHRvIGdvIGJhY2sgdG8gdGhlIHJvb3QuXG4gICAgICBpZiAoaXNUZW1wS2V5KGtleSkpIHtcbiAgICAgICAgdGVtcERpc3BsYXlLZXlzW2lkXSA9ICcnO1xuICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAga2V5VG9JZDoga2V5VG9JZCxcbiAgICAgIGtleU9yZGVyOiBrZXlPcmRlcixcbiAgICAgIC8vIFRlbXAga2V5cyBrZWVwcyB0aGUga2V5IHRvIGRpc3BsYXksIHdoaWNoIHNvbWV0aW1lcyBtYXkgYmUgZGlmZmVyZW50XG4gICAgICAvLyB0aGFuIHRoZSBhY3R1YWwga2V5LiBGb3IgZXhhbXBsZSwgZHVwbGljYXRlIGtleXMgYXJlIG5vdCBhbGxvd2VkLFxuICAgICAgLy8gYnV0IHdlIG1heSB0ZW1wb3JhcmlseSBzaG93IGR1cGxpY2F0ZSBrZXlzLlxuICAgICAgdGVtcERpc3BsYXlLZXlzOiB0ZW1wRGlzcGxheUtleXNcbiAgICB9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXdQcm9wcykge1xuXG4gICAgdmFyIGtleVRvSWQgPSB0aGlzLnN0YXRlLmtleVRvSWQ7XG4gICAgdmFyIG5ld0tleVRvSWQgPSB7fTtcbiAgICB2YXIgdGVtcERpc3BsYXlLZXlzID0gdGhpcy5zdGF0ZS50ZW1wRGlzcGxheUtleXM7XG4gICAgdmFyIG5ld1RlbXBEaXNwbGF5S2V5cyA9IHt9O1xuICAgIHZhciBrZXlPcmRlciA9IHRoaXMuc3RhdGUua2V5T3JkZXI7XG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhuZXdQcm9wcy5maWVsZC52YWx1ZSk7XG4gICAgdmFyIGFkZGVkS2V5cyA9IFtdO1xuXG4gICAgLy8gTG9vayBhdCB0aGUgbmV3IGtleXMuXG4gICAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIC8vIEFkZCBuZXcgbG9va3VwIGlmIHRoaXMga2V5IHdhc24ndCBoZXJlIGxhc3QgdGltZS5cbiAgICAgIGlmICgha2V5VG9JZFtrZXldKSB7XG4gICAgICAgIHRoaXMubmV4dExvb2t1cElkKys7XG4gICAgICAgIG5ld0tleVRvSWRba2V5XSA9IHRoaXMubmV4dExvb2t1cElkO1xuICAgICAgICBhZGRlZEtleXMucHVzaChrZXkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3S2V5VG9JZFtrZXldID0ga2V5VG9JZFtrZXldO1xuICAgICAgfVxuICAgICAgaWYgKGlzVGVtcEtleShrZXkpICYmIG5ld0tleVRvSWRba2V5XSBpbiB0ZW1wRGlzcGxheUtleXMpIHtcbiAgICAgICAgbmV3VGVtcERpc3BsYXlLZXlzW25ld0tleVRvSWRba2V5XV0gPSB0ZW1wRGlzcGxheUtleXNbbmV3S2V5VG9JZFtrZXldXTtcbiAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgdmFyIG5ld0tleU9yZGVyID0gW107XG5cbiAgICAvLyBMb29rIGF0IHRoZSBvbGQga2V5cy5cbiAgICBrZXlPcmRlci5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIC8vIElmIHRoZSBrZXkgaXMgaW4gdGhlIG5ldyBrZXlzLCBwdXNoIGl0IG9udG8gdGhlIG9yZGVyIHRvIHJldGFpbiB0aGVcbiAgICAgIC8vIHNhbWUgb3JkZXIuXG4gICAgICBpZiAobmV3S2V5VG9JZFtrZXldKSB7XG4gICAgICAgIG5ld0tleU9yZGVyLnB1c2goa2V5KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFB1dCBhZGRlZCBmaWVsZHMgYXQgdGhlIGVuZC4gKFNvIHRoaW5ncyBkb24ndCBnZXQgc2h1ZmZsZWQuKVxuICAgIG5ld0tleU9yZGVyID0gbmV3S2V5T3JkZXIuY29uY2F0KGFkZGVkS2V5cyk7XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGtleVRvSWQ6IG5ld0tleVRvSWQsXG4gICAgICBrZXlPcmRlcjogbmV3S2V5T3JkZXIsXG4gICAgICB0ZW1wRGlzcGxheUtleXM6IG5ld1RlbXBEaXNwbGF5S2V5c1xuICAgIH0pO1xuICB9LFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAoa2V5LCBuZXdWYWx1ZSwgaW5mbykge1xuICAgIHZhciBuZXdPYmogPSBfLmV4dGVuZCh7fSwgdGhpcy5wcm9wcy5maWVsZC52YWx1ZSk7XG4gICAgbmV3T2JqW2tleV0gPSBuZXdWYWx1ZTtcbiAgICB0aGlzLm9uQnViYmxlVmFsdWUobmV3T2JqLCBpbmZvKTtcbiAgfSxcblxuICBvbkFwcGVuZDogZnVuY3Rpb24gKGl0ZW1DaG9pY2VJbmRleCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuICAgIHRoaXMubmV4dExvb2t1cElkKys7XG5cbiAgICB2YXIga2V5VG9JZCA9IHRoaXMuc3RhdGUua2V5VG9JZDtcbiAgICB2YXIga2V5T3JkZXIgPSB0aGlzLnN0YXRlLmtleU9yZGVyO1xuICAgIHZhciB0ZW1wRGlzcGxheUtleXMgPSB0aGlzLnN0YXRlLnRlbXBEaXNwbGF5S2V5cztcblxuICAgIHZhciBpZCA9IHRoaXMubmV4dExvb2t1cElkO1xuICAgIHZhciBuZXdLZXkgPSB0ZW1wS2V5KGlkKTtcblxuICAgIGtleVRvSWRbbmV3S2V5XSA9IGlkO1xuICAgIC8vIFRlbXBvcmFyaWx5LCB3ZSdsbCBzaG93IGEgYmxhbmsga2V5LlxuICAgIHRlbXBEaXNwbGF5S2V5c1tpZF0gPSAnJztcbiAgICBrZXlPcmRlci5wdXNoKG5ld0tleSk7XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGtleVRvSWQ6IGtleVRvSWQsXG4gICAgICB0ZW1wRGlzcGxheUtleXM6IHRlbXBEaXNwbGF5S2V5cyxcbiAgICAgIGtleU9yZGVyOiBrZXlPcmRlclxuICAgIH0pO1xuXG4gICAgdmFyIG5ld09iaiA9IF8uZXh0ZW5kKHRoaXMucHJvcHMuZmllbGQudmFsdWUpO1xuXG4gICAgdmFyIG5ld1ZhbHVlID0gY29uZmlnLmNyZWF0ZU5ld0NoaWxkRmllbGRWYWx1ZShmaWVsZCwgaXRlbUNob2ljZUluZGV4KTtcblxuICAgIG5ld09ialtuZXdLZXldID0gbmV3VmFsdWU7XG5cbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUobmV3T2JqKTtcbiAgfSxcblxuICBvblJlbW92ZTogZnVuY3Rpb24gKGtleSkge1xuICAgIHZhciBuZXdPYmogPSBfLmV4dGVuZCh0aGlzLnByb3BzLmZpZWxkLnZhbHVlKTtcbiAgICBkZWxldGUgbmV3T2JqW2tleV07XG4gICAgdGhpcy5vbkNoYW5nZVZhbHVlKG5ld09iaik7XG4gIH0sXG5cbiAgb25Nb3ZlOiBmdW5jdGlvbiAoZnJvbUtleSwgdG9LZXkpIHtcbiAgICBpZiAoZnJvbUtleSAhPT0gdG9LZXkpIHtcbiAgICAgIHZhciBrZXlUb0lkID0gdGhpcy5zdGF0ZS5rZXlUb0lkO1xuICAgICAgdmFyIGtleU9yZGVyID0gdGhpcy5zdGF0ZS5rZXlPcmRlcjtcbiAgICAgIHZhciB0ZW1wRGlzcGxheUtleXMgPSB0aGlzLnN0YXRlLnRlbXBEaXNwbGF5S2V5cztcblxuICAgICAgdmFyIG5ld09iaiA9IF8uZXh0ZW5kKHRoaXMucHJvcHMuZmllbGQudmFsdWUpO1xuXG4gICAgICAvLyBJZiB3ZSBhbHJlYWR5IGhhdmUgdGhlIGtleSB3ZSdyZSBtb3ZpbmcgdG8sIHRoZW4gd2UgaGF2ZSB0byBjaGFuZ2UgdGhhdFxuICAgICAgLy8ga2V5IHRvIHNvbWV0aGluZyBlbHNlLlxuICAgICAgaWYgKGtleVRvSWRbdG9LZXldKSB7XG4gICAgICAgIC8vIE1ha2UgYSBuZXdcbiAgICAgICAgdmFyIHRlbXBUb0tleSA9IHRlbXBLZXkoa2V5VG9JZFt0b0tleV0pO1xuICAgICAgICB0ZW1wRGlzcGxheUtleXNba2V5VG9JZFt0b0tleV1dID0gdG9LZXk7XG4gICAgICAgIGtleVRvSWRbdGVtcFRvS2V5XSA9IGtleVRvSWRbdG9LZXldO1xuICAgICAgICBrZXlPcmRlcltrZXlPcmRlci5pbmRleE9mKHRvS2V5KV0gPSB0ZW1wVG9LZXk7XG4gICAgICAgIGRlbGV0ZSBrZXlUb0lkW3RvS2V5XTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAga2V5VG9JZDoga2V5VG9JZCxcbiAgICAgICAgICB0ZW1wRGlzcGxheUtleXM6IHRlbXBEaXNwbGF5S2V5cyxcbiAgICAgICAgICBrZXlPcmRlcjoga2V5T3JkZXJcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbmV3T2JqW3RlbXBUb0tleV0gPSBuZXdPYmpbdG9LZXldO1xuICAgICAgICBkZWxldGUgbmV3T2JqW3RvS2V5XTtcbiAgICAgIH1cblxuICAgICAgaWYgKCF0b0tleSkge1xuICAgICAgICB0b0tleSA9IHRlbXBLZXkoa2V5VG9JZFtmcm9tS2V5XSk7XG4gICAgICAgIHRlbXBEaXNwbGF5S2V5c1trZXlUb0lkW2Zyb21LZXldXSA9ICcnO1xuICAgICAgfVxuICAgICAga2V5VG9JZFt0b0tleV0gPSBrZXlUb0lkW2Zyb21LZXldO1xuICAgICAgZGVsZXRlIGtleVRvSWRbZnJvbUtleV07XG4gICAgICBrZXlPcmRlcltrZXlPcmRlci5pbmRleE9mKGZyb21LZXkpXSA9IHRvS2V5O1xuXG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAga2V5VG9JZDoga2V5VG9JZCxcbiAgICAgICAga2V5T3JkZXI6IGtleU9yZGVyLFxuICAgICAgICB0ZW1wRGlzcGxheUtleXM6IHRlbXBEaXNwbGF5S2V5c1xuICAgICAgfSk7XG5cbiAgICAgIG5ld09ialt0b0tleV0gPSBuZXdPYmpbZnJvbUtleV07XG4gICAgICBkZWxldGUgbmV3T2JqW2Zyb21LZXldO1xuXG4gICAgICB0aGlzLm9uQ2hhbmdlVmFsdWUobmV3T2JqKTtcblxuICAgICAgLy8gQ2hlY2sgaWYgb3VyIGZyb21LZXkgaGFzIG9wZW5lZCB1cCBhIHNwb3QuXG4gICAgICBpZiAoZnJvbUtleSAmJiBmcm9tS2V5ICE9PSB0b0tleSkge1xuICAgICAgICBpZiAoIShmcm9tS2V5IGluIG5ld09iaikpIHtcbiAgICAgICAgICBPYmplY3Qua2V5cyhuZXdPYmopLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgaWYgKCEoaXNUZW1wS2V5KGtleSkpKSB7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBpZCA9IGtleVRvSWRba2V5XTtcbiAgICAgICAgICAgIHZhciBkaXNwbGF5S2V5ID0gdGVtcERpc3BsYXlLZXlzW2lkXTtcbiAgICAgICAgICAgIGlmIChmcm9tS2V5ID09PSBkaXNwbGF5S2V5KSB7XG4gICAgICAgICAgICAgIHRoaXMub25Nb3ZlKGtleSwgZGlzcGxheUtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBnZXRGaWVsZHM6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHZhciBmaWVsZHMgPSBjb25maWcuY3JlYXRlQ2hpbGRGaWVsZHMoZmllbGQpO1xuXG4gICAgdmFyIGtleVRvRmllbGQgPSB7fTtcblxuICAgIF8uZWFjaChmaWVsZHMsIGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAga2V5VG9GaWVsZFtmaWVsZC5rZXldID0gZmllbGQ7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5rZXlPcmRlci5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgcmV0dXJuIGtleVRvRmllbGRba2V5XTtcbiAgICB9KTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICB2YXIgZmllbGRzID0gdGhpcy5nZXRGaWVsZHMoKTtcblxuICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQnLCB7XG4gICAgICBmaWVsZDogZmllbGQsIHBsYWluOiB0aGlzLnByb3BzLnBsYWluXG4gICAgfSxcbiAgICAgIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3Nlcyl9LFxuICAgICAgICBDU1NUcmFuc2l0aW9uR3JvdXAoe3RyYW5zaXRpb25OYW1lOiAncmV2ZWFsJ30sXG4gICAgICAgICAgZmllbGRzLm1hcChmdW5jdGlvbiAoY2hpbGRGaWVsZCkge1xuICAgICAgICAgICAgdmFyIGRpc3BsYXlLZXkgPSB0aGlzLnN0YXRlLnRlbXBEaXNwbGF5S2V5c1t0aGlzLnN0YXRlLmtleVRvSWRbY2hpbGRGaWVsZC5rZXldXTtcbiAgICAgICAgICAgIGlmIChfLmlzVW5kZWZpbmVkKGRpc3BsYXlLZXkpKSB7XG4gICAgICAgICAgICAgIGRpc3BsYXlLZXkgPSBjaGlsZEZpZWxkLmtleTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnb2JqZWN0LWl0ZW0nLCB7XG4gICAgICAgICAgICAgIGtleTogdGhpcy5zdGF0ZS5rZXlUb0lkW2NoaWxkRmllbGQua2V5XSxcbiAgICAgICAgICAgICAgZmllbGQ6IGNoaWxkRmllbGQsXG4gICAgICAgICAgICAgIG9uTW92ZTogdGhpcy5vbk1vdmUsXG4gICAgICAgICAgICAgIG9uUmVtb3ZlOiB0aGlzLm9uUmVtb3ZlLFxuICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgICAgICAgICAgb25BY3Rpb246IHRoaXMub25CdWJibGVBY3Rpb24sXG4gICAgICAgICAgICAgIGRpc3BsYXlLZXk6IGRpc3BsYXlLZXksXG4gICAgICAgICAgICAgIGl0ZW1LZXk6IGNoaWxkRmllbGQua2V5XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgICksXG4gICAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdvYmplY3QtY29udHJvbCcsIHtmaWVsZDogZmllbGQsIG9uQXBwZW5kOiB0aGlzLm9uQXBwZW5kfSlcbiAgICAgIClcbiAgICApO1xuICB9XG59KTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBwcmV0dHktdGV4dGFyZWEgY29tcG9uZW50XG5cbi8qXG5UZXh0YXJlYSB0aGF0IHdpbGwgZGlzcGxheSBoaWdobGlnaHRzIGJlaGluZCBcInRhZ3NcIi4gVGFncyBjdXJyZW50bHkgbWVhbiB0ZXh0XG50aGF0IGlzIGVuY2xvc2VkIGluIGJyYWNlcyBsaWtlIGB7e2Zvb319YC4gVGFncyBhcmUgcmVwbGFjZWQgd2l0aCBsYWJlbHMgaWZcbmF2YWlsYWJsZSBvciBodW1hbml6ZWQuXG5cblRoaXMgY29tcG9uZW50IGlzIHF1aXRlIGNvbXBsaWNhdGVkIGJlY2F1c2U6XG4tIFdlIGFyZSBkaXNwbGF5aW5nIHRleHQgaW4gdGhlIHRleHRhcmVhIGJ1dCBoYXZlIHRvIGtlZXAgdHJhY2sgb2YgdGhlIHJlYWxcbiAgdGV4dCB2YWx1ZSBpbiB0aGUgYmFja2dyb3VuZC4gV2UgY2FuJ3QgdXNlIGEgZGF0YSBhdHRyaWJ1dGUsIGJlY2F1c2UgaXQncyBhXG4gIHRleHRhcmVhLCBzbyB3ZSBjYW4ndCB1c2UgYW55IGVsZW1lbnRzIGF0IGFsbCFcbi0gQmVjYXVzZSBvZiB0aGUgaGlkZGVuIGRhdGEsIHdlIGFsc28gaGF2ZSB0byBkbyBzb21lIGludGVyY2VwdGlvbiBvZlxuICBjb3B5LCB3aGljaCBpcyBhIGxpdHRsZSB3ZWlyZC4gV2UgaW50ZXJjZXB0IGNvcHkgYW5kIGNvcHkgdGhlIHJlYWwgdGV4dFxuICB0byB0aGUgZW5kIG9mIHRoZSB0ZXh0YXJlYS4gVGhlbiB3ZSBlcmFzZSB0aGF0IHRleHQsIHdoaWNoIGxlYXZlcyB0aGUgY29waWVkXG4gIGRhdGEgaW4gdGhlIGJ1ZmZlci5cbi0gUmVhY3QgbG9zZXMgdGhlIGNhcmV0IHBvc2l0aW9uIHdoZW4geW91IHVwZGF0ZSB0aGUgdmFsdWUgdG8gc29tZXRoaW5nXG4gIGRpZmZlcmVudCB0aGFuIGJlZm9yZS4gU28gd2UgaGF2ZSB0byByZXRhaW4gdHJhY2tpbmcgaW5mb3JtYXRpb24gZm9yIHdoZW5cbiAgdGhhdCBoYXBwZW5zLlxuLSBCZWNhdXNlIHdlIG1vbmtleSB3aXRoIGNvcHksIHdlIGFsc28gaGF2ZSB0byBkbyBvdXIgb3duIHVuZG8vcmVkby4gT3RoZXJ3aXNlXG4gIHRoZSBkZWZhdWx0IHVuZG8gd2lsbCBoYXZlIHdlaXJkIHN0YXRlcyBpbiBpdC5cblxuU28gZ29vZCBsdWNrIVxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG52YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzJyk7XG5cbnZhciBub0JyZWFrID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZS5yZXBsYWNlKC8gL2csICdcXHUwMGEwJyk7XG59O1xuXG52YXIgTEVGVF9QQUQgPSAnXFx1MDBhMFxcdTAwYTAnO1xuLy8gV2h5IHRoaXMgd29ya3MsIEknbSBub3Qgc3VyZS5cbnZhciBSSUdIVF9QQUQgPSAnICAnOyAvLydcXHUwMGEwXFx1MDBhMCc7XG5cbnZhciBpZFByZWZpeFJlZ0V4ID0gL15bMC05XStfXy87XG5cbi8vIFphcGllciBzcGVjaWZpYyBzdHVmZi4gTWFrZSBhIHBsdWdpbiBmb3IgdGhpcyBsYXRlci5cbnZhciByZW1vdmVJZFByZWZpeCA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgaWYgKGlkUHJlZml4UmVnRXgudGVzdChrZXkpKSB7XG4gICAgcmV0dXJuIGtleS5yZXBsYWNlKGlkUHJlZml4UmVnRXgsICcnKTtcbiAgfVxuICByZXR1cm4ga2V5O1xufTtcblxudmFyIHBvc2l0aW9uSW5Ob2RlID0gZnVuY3Rpb24gKHBvc2l0aW9uLCBub2RlKSB7XG4gIHZhciByZWN0ID0gbm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgaWYgKHBvc2l0aW9uLnggPj0gcmVjdC5sZWZ0ICYmIHBvc2l0aW9uLnggPD0gcmVjdC5yaWdodCkge1xuICAgIGlmIChwb3NpdGlvbi55ID49IHJlY3QudG9wICYmIHBvc2l0aW9uLnkgPD0gcmVjdC5ib3R0b20pIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxufTtcblxuLy8gV3JhcCBhIHRleHQgdmFsdWUgc28gaXQgaGFzIGEgdHlwZS4gRm9yIHBhcnNpbmcgdGV4dCB3aXRoIHRhZ3MuXG52YXIgdGV4dFBhcnQgPSBmdW5jdGlvbiAodmFsdWUsIHR5cGUpIHtcbiAgdHlwZSA9IHR5cGUgfHwgJ3RleHQnO1xuICByZXR1cm4ge1xuICAgIHR5cGU6IHR5cGUsXG4gICAgdmFsdWU6IHZhbHVlXG4gIH07XG59O1xuXG4vLyBQYXJzZSB0ZXh0IHRoYXQgaGFzIHRhZ3MgbGlrZSB7e3RhZ319IGludG8gdGV4dCBhbmQgdGFncy5cbnZhciBwYXJzZVRleHRXaXRoVGFncyA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICB2YWx1ZSA9IHZhbHVlIHx8ICcnO1xuICB2YXIgcGFydHMgPSB2YWx1ZS5zcGxpdCgve3soPyF7KS8pO1xuICB2YXIgZnJvbnRQYXJ0ID0gW107XG4gIGlmIChwYXJ0c1swXSAhPT0gJycpIHtcbiAgICBmcm9udFBhcnQgPSBbXG4gICAgdGV4dFBhcnQocGFydHNbMF0pXG4gICAgXTtcbiAgfVxuICBwYXJ0cyA9IGZyb250UGFydC5jb25jYXQoXG4gICAgcGFydHMuc2xpY2UoMSkubWFwKGZ1bmN0aW9uIChwYXJ0KSB7XG4gICAgICBpZiAocGFydC5pbmRleE9mKCd9fScpID49IDApIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgdGV4dFBhcnQocGFydC5zdWJzdHJpbmcoMCwgcGFydC5pbmRleE9mKCd9fScpKSwgJ3RhZycpLFxuICAgICAgICB0ZXh0UGFydChwYXJ0LnN1YnN0cmluZyhwYXJ0LmluZGV4T2YoJ319JykgKyAyKSlcbiAgICAgICAgXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0ZXh0UGFydCgne3snICsgcGFydCwgJ3RleHQnKTtcbiAgICAgIH1cbiAgICB9KVxuICApO1xuICByZXR1cm4gW10uY29uY2F0LmFwcGx5KFtdLCBwYXJ0cyk7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnVGFnZ2VkVGV4dCcsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyksIHJlcXVpcmUoJy4uLy4uL21peGlucy91bmRvLXN0YWNrJyksIHJlcXVpcmUoJy4uLy4uL21peGlucy9yZXNpemUnKV0sXG5cbiAgLy9cbiAgLy8gZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gIC8vICAgcmV0dXJuIHtcbiAgLy8gICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWVcbiAgLy8gICB9O1xuICAvLyB9LFxuXG4gIGdldFJlcGxhY2VTdGF0ZTogZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgdmFyIHJlcGxhY2VDaG9pY2VzID0gcHJvcHMuY29uZmlnLmZpZWxkUmVwbGFjZUNob2ljZXMocHJvcHMuZmllbGQpO1xuICAgIHZhciByZXBsYWNlQ2hvaWNlc0xhYmVscyA9IHt9O1xuICAgIHJlcGxhY2VDaG9pY2VzLmZvckVhY2goZnVuY3Rpb24gKGNob2ljZSkge1xuICAgICAgcmVwbGFjZUNob2ljZXNMYWJlbHNbY2hvaWNlLnZhbHVlXSA9IGNob2ljZS5sYWJlbDtcbiAgICB9KTtcbiAgICByZXR1cm4ge1xuICAgICAgcmVwbGFjZUNob2ljZXM6IHJlcGxhY2VDaG9pY2VzLFxuICAgICAgcmVwbGFjZUNob2ljZXNMYWJlbHM6IHJlcGxhY2VDaG9pY2VzTGFiZWxzXG4gICAgfTtcbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcmVwbGFjZVN0YXRlID0gdGhpcy5nZXRSZXBsYWNlU3RhdGUodGhpcy5wcm9wcyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgdW5kb0RlcHRoOiAxMDAsXG4gICAgICBpc0Nob2ljZXNPcGVuOiBmYWxzZSxcbiAgICAgIGhvdmVyUGlsbFJlZjogbnVsbCxcbiAgICAgIHJlcGxhY2VDaG9pY2VzOiByZXBsYWNlU3RhdGUucmVwbGFjZUNob2ljZXMsXG4gICAgICByZXBsYWNlQ2hvaWNlc0xhYmVsczogcmVwbGFjZVN0YXRlLnJlcGxhY2VDaG9pY2VzTGFiZWxzXG4gICAgfTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV3UHJvcHMpIHtcbiAgICB0aGlzLnNldFN0YXRlKHRoaXMuZ2V0UmVwbGFjZVN0YXRlKG5ld1Byb3BzKSk7XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgLy8gTm90IHF1aXRlIHN0YXRlLCB0aGlzIGlzIGZvciB0cmFja2luZyBzZWxlY3Rpb24gaW5mby5cbiAgICB0aGlzLnRyYWNraW5nID0ge307XG5cbiAgICB2YXIgcGFydHMgPSBwYXJzZVRleHRXaXRoVGFncyh0aGlzLnByb3BzLmZpZWxkLnZhbHVlKTtcbiAgICB2YXIgdG9rZW5zID0gdGhpcy50b2tlbnMocGFydHMpO1xuICAgIHZhciBpbmRleE1hcCA9IHRoaXMuaW5kZXhNYXAodG9rZW5zKTtcblxuICAgIHRoaXMudHJhY2tpbmcucG9zID0gaW5kZXhNYXAubGVuZ3RoO1xuICAgIHRoaXMudHJhY2tpbmcucmFuZ2UgPSAwO1xuICAgIHRoaXMudHJhY2tpbmcudG9rZW5zID0gdG9rZW5zO1xuICAgIHRoaXMudHJhY2tpbmcuaW5kZXhNYXAgPSBpbmRleE1hcDtcbiAgfSxcblxuICBnZXRTdGF0ZVNuYXBzaG90OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZhbHVlOiB0aGlzLnByb3BzLmZpZWxkLnZhbHVlLFxuICAgICAgcG9zOiB0aGlzLnRyYWNraW5nLnBvcyxcbiAgICAgIHJhbmdlOiB0aGlzLnRyYWNraW5nLnJhbmdlXG4gICAgfTtcbiAgfSxcblxuICBzZXRTdGF0ZVNuYXBzaG90OiBmdW5jdGlvbiAoc25hcHNob3QpIHtcbiAgICB0aGlzLnRyYWNraW5nLnBvcyA9IHNuYXBzaG90LnBvcztcbiAgICB0aGlzLnRyYWNraW5nLnJhbmdlID0gc25hcHNob3QucmFuZ2U7XG4gICAgdGhpcy5vbkNoYW5nZVZhbHVlKHNuYXBzaG90LnZhbHVlKTtcbiAgfSxcblxuICAvLyBUdXJuIGludG8gaW5kaXZpZHVhbCBjaGFyYWN0ZXJzIGFuZCB0YWdzXG4gIHRva2VuczogZnVuY3Rpb24gKHBhcnRzKSB7XG4gICAgcmV0dXJuIFtdLmNvbmNhdC5hcHBseShbXSwgcGFydHMubWFwKGZ1bmN0aW9uIChwYXJ0KSB7XG4gICAgICBpZiAocGFydC50eXBlID09PSAndGFnJykge1xuICAgICAgICByZXR1cm4gcGFydDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBwYXJ0LnZhbHVlLnNwbGl0KCcnKTtcbiAgICAgIH1cbiAgICB9KSk7XG4gIH0sXG5cbiAgLy8gTWFwIGVhY2ggdGV4dGFyZWEgaW5kZXggYmFjayB0byBhIHRva2VuXG4gIGluZGV4TWFwOiBmdW5jdGlvbiAodG9rZW5zKSB7XG4gICAgdmFyIGluZGV4TWFwID0gW107XG4gICAgXy5lYWNoKHRva2VucywgZnVuY3Rpb24gKHRva2VuLCB0b2tlbkluZGV4KSB7XG4gICAgICBpZiAodG9rZW4udHlwZSA9PT0gJ3RhZycpIHtcbiAgICAgICAgdmFyIGxhYmVsID0gTEVGVF9QQUQgKyBub0JyZWFrKHRoaXMucHJldHR5TGFiZWwodG9rZW4udmFsdWUpKSArIFJJR0hUX1BBRDtcbiAgICAgICAgdmFyIGxhYmVsQ2hhcnMgPSBsYWJlbC5zcGxpdCgnJyk7XG4gICAgICAgIF8uZWFjaChsYWJlbENoYXJzLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaW5kZXhNYXAucHVzaCh0b2tlbkluZGV4KTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbmRleE1hcC5wdXNoKHRva2VuSW5kZXgpO1xuICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG4gICAgcmV0dXJuIGluZGV4TWFwO1xuICB9LFxuXG4gIC8vIE1ha2UgaGlnaGxpZ2h0IHNjcm9sbCBtYXRjaCB0ZXh0YXJlYSBzY3JvbGxcbiAgb25TY3JvbGw6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnJlZnMuaGlnaGxpZ2h0LmdldERPTU5vZGUoKS5zY3JvbGxUb3AgPSB0aGlzLnJlZnMuY29udGVudC5nZXRET01Ob2RlKCkuc2Nyb2xsVG9wO1xuICAgIHRoaXMucmVmcy5oaWdobGlnaHQuZ2V0RE9NTm9kZSgpLnNjcm9sbExlZnQgPSB0aGlzLnJlZnMuY29udGVudC5nZXRET01Ob2RlKCkuc2Nyb2xsTGVmdDtcbiAgfSxcblxuICAvLyBHaXZlbiBzb21lIHBvc3Rpb24sIHJldHVybiB0aGUgdG9rZW4gaW5kZXggKHBvc2l0aW9uIGNvdWxkIGJlIGluIHRoZSBtaWRkbGUgb2YgYSB0b2tlbilcbiAgdG9rZW5JbmRleDogZnVuY3Rpb24gKHBvcywgdG9rZW5zLCBpbmRleE1hcCkge1xuICAgIGlmIChwb3MgPCAwKSB7XG4gICAgICBwb3MgPSAwO1xuICAgIH0gZWxzZSBpZiAocG9zID49IGluZGV4TWFwLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHRva2Vucy5sZW5ndGg7XG4gICAgfVxuICAgIHJldHVybiBpbmRleE1hcFtwb3NdO1xuICB9LFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAvL2NvbnNvbGUubG9nKCdjaGFuZ2U6JywgZXZlbnQudGFyZ2V0LnZhbHVlKTtcblxuICAgIHZhciBub2RlID0gZXZlbnQudGFyZ2V0O1xuXG4gICAgLy8gVHJhY2tpbmcgaXMgaG9sZGluZyBwcmV2aW91cyBwb3NpdGlvbiBhbmQgcmFuZ2VcbiAgICB2YXIgcHJldlBvcyA9IHRoaXMudHJhY2tpbmcucG9zO1xuICAgIHZhciBwcmV2UmFuZ2UgPSB0aGlzLnRyYWNraW5nLnJhbmdlO1xuXG4gICAgLy8gTmV3IHBvc2l0aW9uXG4gICAgdmFyIHBvcyA9IG5vZGUuc2VsZWN0aW9uU3RhcnQ7XG5cbiAgICAvLyBHb2luZyB0byBtdXRhdGUgdGhlIHRva2Vucy5cbiAgICB2YXIgdG9rZW5zID0gdGhpcy50cmFja2luZy50b2tlbnM7XG5cbiAgICAvLyBVc2luZyB0aGUgcHJldmlvdXMgcG9zaXRpb24gYW5kIHJhbmdlLCBnZXQgdGhlIHByZXZpb3VzIHRva2VuIHBvc2l0aW9uXG4gICAgLy8gYW5kIHJhbmdlXG4gICAgdmFyIHByZXZUb2tlbkluZGV4ID0gdGhpcy50b2tlbkluZGV4KHByZXZQb3MsIHRva2VucywgdGhpcy50cmFja2luZy5pbmRleE1hcCk7XG4gICAgdmFyIHByZXZUb2tlbkVuZEluZGV4ID0gdGhpcy50b2tlbkluZGV4KHByZXZQb3MgKyBwcmV2UmFuZ2UsIHRva2VucywgdGhpcy50cmFja2luZy5pbmRleE1hcCk7XG4gICAgdmFyIHByZXZUb2tlblJhbmdlID0gcHJldlRva2VuRW5kSW5kZXggLSBwcmV2VG9rZW5JbmRleDtcblxuICAgIC8vIFdpcGUgb3V0IGFueSB0b2tlbnMgaW4gdGhlIHNlbGVjdGVkIHJhbmdlIGJlY2F1c2UgdGhlIGNoYW5nZSB3b3VsZCBoYXZlXG4gICAgLy8gZXJhc2VkIHRoYXQgc2VsZWN0aW9uLlxuICAgIGlmIChwcmV2VG9rZW5SYW5nZSA+IDApIHtcbiAgICAgIHRva2Vucy5zcGxpY2UocHJldlRva2VuSW5kZXgsIHByZXZUb2tlblJhbmdlKTtcbiAgICAgIHRoaXMudHJhY2tpbmcuaW5kZXhNYXAgPSB0aGlzLmluZGV4TWFwKHRva2Vucyk7XG4gICAgfVxuXG4gICAgLy8gSWYgY3Vyc29yIGhhcyBtb3ZlZCBmb3J3YXJkLCB0aGVuIHRleHQgd2FzIGFkZGVkLlxuICAgIGlmIChwb3MgPiBwcmV2UG9zKSB7XG4gICAgICB2YXIgYWRkZWRUZXh0ID0gbm9kZS52YWx1ZS5zdWJzdHJpbmcocHJldlBvcywgcG9zKTtcbiAgICAgIC8vIEluc2VydCB0aGUgdGV4dCBpbnRvIHRoZSB0b2tlbnMuXG4gICAgICB0b2tlbnMuc3BsaWNlKHByZXZUb2tlbkluZGV4LCAwLCBhZGRlZFRleHQpO1xuICAgIC8vIElmIGN1cnNvciBoYXMgbW92ZWQgYmFja3dhcmQsIHRoZW4gd2UgZGVsZXRlZCAoYmFja3NwYWNlZCkgdGV4dFxuICAgIH0gaWYgKHBvcyA8IHByZXZQb3MpIHtcbiAgICAgIHZhciB0b2tlbiA9IHRoaXMudG9rZW5BdChwb3MpO1xuICAgICAgdmFyIHRva2VuQmVmb3JlID0gdGhpcy50b2tlbkJlZm9yZShwb3MpO1xuICAgICAgLy8gSWYgd2UgbW92ZWQgYmFjayBvbnRvIGEgdG9rZW4sIHRoZW4gd2Ugc2hvdWxkIG1vdmUgYmFjayB0byBiZWdpbm5pbmdcbiAgICAgIC8vIG9mIHRva2VuLlxuICAgICAgaWYgKHRva2VuID09PSB0b2tlbkJlZm9yZSkge1xuICAgICAgICBwb3MgPSB0aGlzLm1vdmVPZmZUYWcocG9zLCB0b2tlbnMsIHRoaXMuaW5kZXhNYXAodG9rZW5zKSwgLTEpO1xuICAgICAgfVxuICAgICAgdmFyIHRva2VuSW5kZXggPSB0aGlzLnRva2VuSW5kZXgocG9zLCB0b2tlbnMsIHRoaXMudHJhY2tpbmcuaW5kZXhNYXApO1xuICAgICAgLy8gTm93IHdlIGNhbiByZW1vdmUgdGhlIHRva2VucyB0aGF0IHdlcmUgZGVsZXRlZC5cbiAgICAgIHRva2Vucy5zcGxpY2UodG9rZW5JbmRleCwgcHJldlRva2VuSW5kZXggLSB0b2tlbkluZGV4KTtcbiAgICB9XG5cbiAgICAvLyBDb252ZXJ0IHRva2VucyBiYWNrIGludG8gcmF3IHZhbHVlIHdpdGggdGFncy4gTmV3bHkgZm9ybWVkIHRhZ3Mgd2lsbFxuICAgIC8vIGJlY29tZSBwYXJ0IG9mIHRoZSByYXcgdmFsdWUuXG4gICAgdmFyIHJhd1ZhbHVlID0gdGhpcy5yYXdWYWx1ZSh0b2tlbnMpO1xuXG4gICAgdGhpcy50cmFja2luZy5wb3MgPSBwb3M7XG4gICAgdGhpcy50cmFja2luZy5yYW5nZSA9IDA7XG5cbiAgICAvLyBTZXQgdGhlIHZhbHVlIHRvIHRoZSBuZXcgcmF3IHZhbHVlLlxuICAgIHRoaXMub25DaGFuZ2VWYWx1ZShyYXdWYWx1ZSk7XG5cbiAgICB0aGlzLnNuYXBzaG90KCk7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkVXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHZhbHVlID0gdGhpcy5wcm9wcy5maWVsZC52YWx1ZSB8fCAnJztcbiAgICB2YXIgcGFydHMgPSBwYXJzZVRleHRXaXRoVGFncyh2YWx1ZSk7XG4gICAgdGhpcy50cmFja2luZy50b2tlbnMgPSB0aGlzLnRva2VucyhwYXJ0cyk7XG4gICAgdGhpcy50cmFja2luZy5pbmRleE1hcCA9IHRoaXMuaW5kZXhNYXAodGhpcy50cmFja2luZy50b2tlbnMpO1xuXG4gICAgdmFyIHBvcyA9IHRoaXMubm9ybWFsaXplUG9zaXRpb24odGhpcy50cmFja2luZy5wb3MpO1xuICAgIHZhciByYW5nZSA9IHRoaXMudHJhY2tpbmcucmFuZ2U7XG4gICAgdmFyIGVuZFBvcyA9IHRoaXMubm9ybWFsaXplUG9zaXRpb24ocG9zICsgcmFuZ2UpO1xuICAgIHJhbmdlID0gZW5kUG9zIC0gcG9zO1xuXG4gICAgdGhpcy50cmFja2luZy5wb3MgPSBwb3M7XG4gICAgdGhpcy50cmFja2luZy5yYW5nZSA9IHJhbmdlO1xuXG4gICAgaWYgKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgPT09IHRoaXMucmVmcy5jb250ZW50LmdldERPTU5vZGUoKSkge1xuICAgICAgLy8gUmVhY3QgY2FuIGxvc2UgdGhlIHNlbGVjdGlvbiwgc28gcHV0IGl0IGJhY2suXG4gICAgICB0aGlzLnJlZnMuY29udGVudC5nZXRET01Ob2RlKCkuc2V0U2VsZWN0aW9uUmFuZ2UocG9zLCBwb3MgKyByYW5nZSk7XG4gICAgfVxuICB9LFxuXG4gIC8vIEdldCB0aGUgbGFiZWwgZm9yIGEga2V5LlxuICBwcmV0dHlMYWJlbDogZnVuY3Rpb24gKGtleSkge1xuICAgIGlmICh0aGlzLnN0YXRlLnJlcGxhY2VDaG9pY2VzTGFiZWxzW2tleV0pIHtcbiAgICAgIHJldHVybiB0aGlzLnN0YXRlLnJlcGxhY2VDaG9pY2VzTGFiZWxzW2tleV07XG4gICAgfVxuICAgIHZhciBjbGVhbmVkID0gcmVtb3ZlSWRQcmVmaXgoa2V5KTtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5jb25maWcuaHVtYW5pemUoY2xlYW5lZCk7XG4gIH0sXG5cbiAgLy8gR2l2ZW4gdGhlIGFjdHVhbCB2YWx1ZSBvZiB0aGUgZmllbGQgKHdpdGggdGFncyksIGdldCB0aGUgcGxhaW4gdGV4dCB0aGF0XG4gIC8vIHNob3VsZCBzaG93IGluIHRoZSB0ZXh0YXJlYS5cbiAgcGxhaW5WYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFyIHBhcnRzID0gcGFyc2VUZXh0V2l0aFRhZ3ModmFsdWUpO1xuICAgIHJldHVybiBwYXJ0cy5tYXAoZnVuY3Rpb24gKHBhcnQpIHtcbiAgICAgIGlmIChwYXJ0LnR5cGUgPT09ICd0ZXh0Jykge1xuICAgICAgICByZXR1cm4gcGFydC52YWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBMRUZUX1BBRCArIG5vQnJlYWsodGhpcy5wcmV0dHlMYWJlbChwYXJ0LnZhbHVlKSkgKyBSSUdIVF9QQUQ7XG4gICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKS5qb2luKCcnKTtcbiAgfSxcblxuICAvLyBHaXZlbiB0aGUgYWN0dWFsIHZhbHVlIG9mIHRoZSBmaWVsZCAod2l0aCB0YWdzKSwgZ2V0IHRoZSBodG1sIHVzZWQgdG9cbiAgLy8gaGlnaGxpZ2h0IHRoZSBsYWJlbHMuXG4gIHByZXR0eVZhbHVlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YXIgcGFydHMgPSBwYXJzZVRleHRXaXRoVGFncyh2YWx1ZSk7XG4gICAgcmV0dXJuIHBhcnRzLm1hcChmdW5jdGlvbiAocGFydCwgaSkge1xuICAgICAgaWYgKHBhcnQudHlwZSA9PT0gJ3RleHQnKSB7XG4gICAgICAgIGlmIChpID09PSAocGFydHMubGVuZ3RoIC0gMSkpIHtcbiAgICAgICAgICBpZiAocGFydC52YWx1ZVtwYXJ0LnZhbHVlLmxlbmd0aCAtIDFdID09PSAnXFxuJykge1xuICAgICAgICAgICAgcmV0dXJuIHBhcnQudmFsdWUgKyAnXFx1MDBhMCc7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXJ0LnZhbHVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gTWFrZSBhIHBpbGxcbiAgICAgICAgdmFyIHBpbGxSZWYgPSAncHJldHR5UGFydCcgKyBpO1xuICAgICAgICB2YXIgY2xhc3NOYW1lID0gJ3ByZXR0eS1wYXJ0JztcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuaG92ZXJQaWxsUmVmICYmIHBpbGxSZWYgPT09IHRoaXMuc3RhdGUuaG92ZXJQaWxsUmVmKSB7XG4gICAgICAgICAgY2xhc3NOYW1lICs9ICcgcHJldHR5LXBhcnQtaG92ZXInO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBSLnNwYW4oe2tleTogaSwgY2xhc3NOYW1lOiBjbGFzc05hbWUsIHJlZjogcGlsbFJlZiwgJ2RhdGEtcHJldHR5JzogdHJ1ZSwgJ2RhdGEtcmVmJzogcGlsbFJlZn0sXG4gICAgICAgICAgUi5zcGFuKHtjbGFzc05hbWU6ICdwcmV0dHktcGFydC1sZWZ0J30sIExFRlRfUEFEKSxcbiAgICAgICAgICBSLnNwYW4oe2NsYXNzTmFtZTogJ3ByZXR0eS1wYXJ0LXRleHQnfSwgbm9CcmVhayh0aGlzLnByZXR0eUxhYmVsKHBhcnQudmFsdWUpKSksXG4gICAgICAgICAgUi5zcGFuKHtjbGFzc05hbWU6ICdwcmV0dHktcGFydC1yaWdodCd9LCBSSUdIVF9QQUQpXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfSxcblxuICAvLyBHaXZlbiB0aGUgdG9rZW5zIGZvciBhIGZpZWxkLCBnZXQgdGhlIGFjdHVhbCB2YWx1ZSBvZiB0aGUgZmllbGQgKHdpdGhcbiAgLy8gdGFncylcbiAgcmF3VmFsdWU6IGZ1bmN0aW9uICh0b2tlbnMpIHtcbiAgICByZXR1cm4gdG9rZW5zLm1hcChmdW5jdGlvbiAodG9rZW4pIHtcbiAgICAgIGlmICh0b2tlbi50eXBlID09PSAndGFnJykge1xuICAgICAgICByZXR1cm4gJ3t7JyArIHRva2VuLnZhbHVlICsgJ319JztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgIH1cbiAgICB9KS5qb2luKCcnKTtcbiAgfSxcblxuICAvLyBHaXZlbiBhIHBvc2l0aW9uLCBpZiBpdCdzIG9uIGEgbGFiZWwsIGdldCB0aGUgcG9zaXRpb24gbGVmdCBvciByaWdodCBvZlxuICAvLyB0aGUgbGFiZWwsIGJhc2VkIG9uIGRpcmVjdGlvbiBhbmQvb3Igd2hpY2ggc2lkZSBpcyBjbG9zZXJcbiAgbW92ZU9mZlRhZzogZnVuY3Rpb24gKHBvcywgdG9rZW5zLCBpbmRleE1hcCwgZGlyKSB7XG4gICAgaWYgKHR5cGVvZiBkaXIgPT09ICd1bmRlZmluZWQnIHx8IGRpciA+IDApIHtcbiAgICAgIGRpciA9IDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRpciA9IC0xO1xuICAgIH1cbiAgICB2YXIgdG9rZW47XG4gICAgaWYgKGRpciA+IDApIHtcbiAgICAgIHRva2VuID0gdG9rZW5zW2luZGV4TWFwW3Bvc11dO1xuICAgICAgd2hpbGUgKHBvcyA8IGluZGV4TWFwLmxlbmd0aCAmJiB0b2tlbnNbaW5kZXhNYXBbcG9zXV0udHlwZSA9PT0gJ3RhZycgJiYgdG9rZW5zW2luZGV4TWFwW3Bvc11dID09PSB0b2tlbikge1xuICAgICAgICBwb3MrKztcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdG9rZW4gPSB0b2tlbnNbaW5kZXhNYXBbcG9zIC0gMV1dO1xuICAgICAgd2hpbGUgKHBvcyA+IDAgJiYgdG9rZW5zW2luZGV4TWFwW3BvcyAtIDFdXS50eXBlID09PSAndGFnJyAmJiB0b2tlbnNbaW5kZXhNYXBbcG9zIC0gMV1dID09PSB0b2tlbikge1xuICAgICAgICBwb3MtLTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcG9zO1xuICB9LFxuXG4gIC8vIEdldCB0aGUgdG9rZW4gYXQgc29tZSBwb3NpdGlvbi5cbiAgdG9rZW5BdDogZnVuY3Rpb24gKHBvcykge1xuICAgIGlmIChwb3MgPj0gdGhpcy50cmFja2luZy5pbmRleE1hcC5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAocG9zIDwgMCkge1xuICAgICAgcG9zID0gMDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudHJhY2tpbmcudG9rZW5zW3RoaXMudHJhY2tpbmcuaW5kZXhNYXBbcG9zXV07XG4gIH0sXG5cbiAgLy8gR2V0IHRoZSB0b2tlbiBpbW1lZGlhdGVseSBiZWZvcmUgc29tZSBwb3NpdGlvbi5cbiAgdG9rZW5CZWZvcmU6IGZ1bmN0aW9uIChwb3MpIHtcbiAgICBpZiAocG9zID49IHRoaXMudHJhY2tpbmcuaW5kZXhNYXAubGVuZ3RoKSB7XG4gICAgICBwb3MgPSB0aGlzLnRyYWNraW5nLmluZGV4TWFwLmxlbmd0aDtcbiAgICB9XG4gICAgaWYgKHBvcyA8PSAwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudHJhY2tpbmcudG9rZW5zW3RoaXMudHJhY2tpbmcuaW5kZXhNYXBbcG9zIC0gMV1dO1xuICB9LFxuXG4gIC8vIEdpdmVuIGEgcG9zaXRpb24sIGdldCBhIGNvcnJlY3RlZCBwb3NpdGlvbiAoaWYgbmVjZXNzYXJ5IHRvIGJlXG4gIC8vIGNvcnJlY3RlZCkuXG4gIG5vcm1hbGl6ZVBvc2l0aW9uOiBmdW5jdGlvbiAocG9zLCBwcmV2UG9zKSB7XG4gICAgaWYgKF8uaXNVbmRlZmluZWQocHJldlBvcykpIHtcbiAgICAgIHByZXZQb3MgPSBwb3M7XG4gICAgfVxuICAgIC8vIEF0IHN0YXJ0IG9yIGVuZCwgc28gb2theS5cbiAgICBpZiAocG9zIDw9IDAgfHwgcG9zID49IHRoaXMudHJhY2tpbmcuaW5kZXhNYXAubGVuZ3RoKSB7XG4gICAgICBpZiAocG9zIDwgMCkge1xuICAgICAgICBwb3MgPSAwO1xuICAgICAgfVxuICAgICAgaWYgKHBvcyA+IHRoaXMudHJhY2tpbmcuaW5kZXhNYXAubGVuZ3RoKSB7XG4gICAgICAgIHBvcyA9IHRoaXMudHJhY2tpbmcuaW5kZXhNYXAubGVuZ3RoO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHBvcztcbiAgICB9XG5cbiAgICB2YXIgdG9rZW4gPSB0aGlzLnRva2VuQXQocG9zKTtcbiAgICB2YXIgdG9rZW5CZWZvcmUgPSB0aGlzLnRva2VuQmVmb3JlKHBvcyk7XG5cbiAgICAvLyBCZXR3ZWVuIHR3byB0b2tlbnMsIHNvIG9rYXkuXG4gICAgaWYgKHRva2VuICE9PSB0b2tlbkJlZm9yZSkge1xuICAgICAgcmV0dXJuIHBvcztcbiAgICB9XG5cbiAgICB2YXIgcHJldlRva2VuID0gdGhpcy50b2tlbkF0KHByZXZQb3MpO1xuICAgIHZhciBwcmV2VG9rZW5CZWZvcmUgPSB0aGlzLnRva2VuQmVmb3JlKHByZXZQb3MpO1xuXG4gICAgdmFyIHJpZ2h0UG9zID0gdGhpcy5tb3ZlT2ZmVGFnKHBvcywgdGhpcy50cmFja2luZy50b2tlbnMsIHRoaXMudHJhY2tpbmcuaW5kZXhNYXApO1xuICAgIHZhciBsZWZ0UG9zID0gdGhpcy5tb3ZlT2ZmVGFnKHBvcywgdGhpcy50cmFja2luZy50b2tlbnMsIHRoaXMudHJhY2tpbmcuaW5kZXhNYXAsIC0xKTtcblxuICAgIGlmIChwcmV2VG9rZW4gIT09IHByZXZUb2tlbkJlZm9yZSkge1xuICAgICAgLy8gTW92ZWQgZnJvbSBsZWZ0IGVkZ2UuXG4gICAgICBpZiAocHJldlRva2VuID09PSB0b2tlbikge1xuICAgICAgICByZXR1cm4gcmlnaHRQb3M7XG4gICAgICB9XG4gICAgICAvLyBNb3ZlZCBmcm9tIHJpZ2h0IGVkZ2UuXG4gICAgICBpZiAocHJldlRva2VuQmVmb3JlID09PSB0b2tlbikge1xuICAgICAgICByZXR1cm4gbGVmdFBvcztcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgbmV3UG9zID0gcmlnaHRQb3M7XG5cbiAgICBpZiAocG9zID09PSBwcmV2UG9zIHx8IHBvcyA8IHByZXZQb3MpIHtcbiAgICAgIGlmIChyaWdodFBvcyAtIHBvcyA+IHBvcyAtIGxlZnRQb3MpIHtcbiAgICAgICAgbmV3UG9zID0gbGVmdFBvcztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5ld1BvcztcbiAgfSxcblxuXG5cbiAgb25TZWxlY3Q6IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHZhciBub2RlID0gZXZlbnQudGFyZ2V0O1xuXG4gICAgdmFyIHBvcyA9IG5vZGUuc2VsZWN0aW9uU3RhcnQ7XG4gICAgdmFyIGVuZFBvcyA9IG5vZGUuc2VsZWN0aW9uRW5kO1xuXG4gICAgaWYgKHBvcyA9PT0gZW5kUG9zICYmIHRoaXMuc3RhdGUuaG92ZXJQaWxsUmVmKSB7XG4gICAgICB2YXIgdG9rZW5BdCA9IHRoaXMudG9rZW5BdChwb3MpO1xuICAgICAgdmFyIHRva2VuQmVmb3JlID0gdGhpcy50b2tlbkJlZm9yZShwb3MpO1xuXG4gICAgICBpZiAodG9rZW5BdCAmJiB0b2tlbkF0ID09PSB0b2tlbkJlZm9yZSAmJiB0b2tlbkF0LnR5cGUgJiYgdG9rZW5BdC50eXBlID09PSAndGFnJykge1xuICAgICAgICAvLyBDbGlja2VkIGEgdGFnLlxuICAgICAgICB2YXIgcmlnaHRQb3MgPSB0aGlzLm1vdmVPZmZUYWcocG9zLCB0aGlzLnRyYWNraW5nLnRva2VucywgdGhpcy50cmFja2luZy5pbmRleE1hcCk7XG4gICAgICAgIHZhciBsZWZ0UG9zID0gdGhpcy5tb3ZlT2ZmVGFnKHBvcywgdGhpcy50cmFja2luZy50b2tlbnMsIHRoaXMudHJhY2tpbmcuaW5kZXhNYXAsIC0xKTtcbiAgICAgICAgdGhpcy50cmFja2luZy5wb3MgPSBsZWZ0UG9zO1xuICAgICAgICB0aGlzLnRyYWNraW5nLnJhbmdlID0gcmlnaHRQb3MgLSBsZWZ0UG9zO1xuICAgICAgICBub2RlLnNlbGVjdGlvblN0YXJ0ID0gbGVmdFBvcztcbiAgICAgICAgbm9kZS5zZWxlY3Rpb25FbmQgPSByaWdodFBvcztcblxuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuaXNDaG9pY2VzT3Blbikge1xuICAgICAgICAgIHRoaXMuc2V0Q2hvaWNlc09wZW4odHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgcG9zID0gdGhpcy5ub3JtYWxpemVQb3NpdGlvbihwb3MsIHRoaXMudHJhY2tpbmcucG9zKTtcbiAgICBlbmRQb3MgPSB0aGlzLm5vcm1hbGl6ZVBvc2l0aW9uKGVuZFBvcywgdGhpcy50cmFja2luZy5wb3MgKyB0aGlzLnRyYWNraW5nLnJhbmdlKTtcblxuICAgIHRoaXMudHJhY2tpbmcucG9zID0gcG9zO1xuICAgIHRoaXMudHJhY2tpbmcucmFuZ2UgPSBlbmRQb3MgLSBwb3M7XG5cbiAgICBub2RlLnNlbGVjdGlvblN0YXJ0ID0gcG9zO1xuICAgIG5vZGUuc2VsZWN0aW9uRW5kID0gZW5kUG9zO1xuICB9LFxuXG4gIG9uQ29weTogZnVuY3Rpb24gKCkge1xuICAgIHZhciBub2RlID0gdGhpcy5yZWZzLmNvbnRlbnQuZ2V0RE9NTm9kZSgpO1xuICAgIHZhciBzdGFydCA9IG5vZGUuc2VsZWN0aW9uU3RhcnQ7XG4gICAgdmFyIGVuZCA9IG5vZGUuc2VsZWN0aW9uRW5kO1xuICAgIHZhciB0ZXh0ID0gbm9kZS52YWx1ZS5zdWJzdHJpbmcoc3RhcnQsIGVuZCk7XG4gICAgdmFyIHJlYWxTdGFydEluZGV4ID0gdGhpcy50b2tlbkluZGV4KHN0YXJ0LCB0aGlzLnRyYWNraW5nLnRva2VucywgdGhpcy50cmFja2luZy5pbmRleE1hcCk7XG4gICAgdmFyIHJlYWxFbmRJbmRleCA9IHRoaXMudG9rZW5JbmRleChlbmQsIHRoaXMudHJhY2tpbmcudG9rZW5zLCB0aGlzLnRyYWNraW5nLmluZGV4TWFwKTtcbiAgICB2YXIgdG9rZW5zID0gdGhpcy50cmFja2luZy50b2tlbnMuc2xpY2UocmVhbFN0YXJ0SW5kZXgsIHJlYWxFbmRJbmRleCk7XG4gICAgdGV4dCA9IHRoaXMucmF3VmFsdWUodG9rZW5zKTtcbiAgICB2YXIgb3JpZ2luYWxWYWx1ZSA9IG5vZGUudmFsdWU7XG4gICAgbm9kZS52YWx1ZSA9IG5vZGUudmFsdWUgKyB0ZXh0O1xuICAgIG5vZGUuc2V0U2VsZWN0aW9uUmFuZ2Uob3JpZ2luYWxWYWx1ZS5sZW5ndGgsIG9yaWdpbmFsVmFsdWUubGVuZ3RoICsgdGV4dC5sZW5ndGgpO1xuICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgbm9kZS52YWx1ZSA9IG9yaWdpbmFsVmFsdWU7XG4gICAgICBub2RlLnNldFNlbGVjdGlvblJhbmdlKHN0YXJ0LCBlbmQpO1xuICAgIH0sMCk7XG4gIH0sXG5cbiAgb25DdXQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbm9kZSA9IHRoaXMucmVmcy5jb250ZW50LmdldERPTU5vZGUoKTtcbiAgICB2YXIgc3RhcnQgPSBub2RlLnNlbGVjdGlvblN0YXJ0O1xuICAgIHZhciBlbmQgPSBub2RlLnNlbGVjdGlvbkVuZDtcbiAgICB2YXIgdGV4dCA9IG5vZGUudmFsdWUuc3Vic3RyaW5nKHN0YXJ0LCBlbmQpO1xuICAgIHZhciByZWFsU3RhcnRJbmRleCA9IHRoaXMudG9rZW5JbmRleChzdGFydCwgdGhpcy50cmFja2luZy50b2tlbnMsIHRoaXMudHJhY2tpbmcuaW5kZXhNYXApO1xuICAgIHZhciByZWFsRW5kSW5kZXggPSB0aGlzLnRva2VuSW5kZXgoZW5kLCB0aGlzLnRyYWNraW5nLnRva2VucywgdGhpcy50cmFja2luZy5pbmRleE1hcCk7XG4gICAgdmFyIHRva2VucyA9IHRoaXMudHJhY2tpbmcudG9rZW5zLnNsaWNlKHJlYWxTdGFydEluZGV4LCByZWFsRW5kSW5kZXgpO1xuICAgIHRleHQgPSB0aGlzLnJhd1ZhbHVlKHRva2Vucyk7XG4gICAgdmFyIG9yaWdpbmFsVmFsdWUgPSBub2RlLnZhbHVlO1xuICAgIHZhciBjdXRWYWx1ZSA9IG5vZGUudmFsdWUuc3Vic3RyaW5nKDAsIHN0YXJ0KSArIG5vZGUudmFsdWUuc3Vic3RyaW5nKGVuZCk7XG4gICAgbm9kZS52YWx1ZSA9IG5vZGUudmFsdWUgKyB0ZXh0O1xuICAgIG5vZGUuc2V0U2VsZWN0aW9uUmFuZ2Uob3JpZ2luYWxWYWx1ZS5sZW5ndGgsIG9yaWdpbmFsVmFsdWUubGVuZ3RoICsgdGV4dC5sZW5ndGgpO1xuICAgIHZhciBjdXRUb2tlbnMgPSB0aGlzLnRyYWNraW5nLnRva2Vucy5zbGljZSgwLCByZWFsU3RhcnRJbmRleCkuY29uY2F0KHRoaXMudHJhY2tpbmcudG9rZW5zLnNsaWNlKHJlYWxFbmRJbmRleCkpO1xuICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgbm9kZS52YWx1ZSA9IGN1dFZhbHVlO1xuICAgICAgbm9kZS5zZXRTZWxlY3Rpb25SYW5nZShzdGFydCwgc3RhcnQpO1xuICAgICAgdGhpcy50cmFja2luZy5wb3MgPSBzdGFydDtcbiAgICAgIHRoaXMudHJhY2tpbmcucmFuZ2UgPSAwO1xuICAgICAgdGhpcy50cmFja2luZy50b2tlbnMgPSBjdXRUb2tlbnM7XG4gICAgICB0aGlzLnRyYWNraW5nLmluZGV4TWFwID0gdGhpcy5pbmRleE1hcCh0aGlzLnRyYWNraW5nLnRva2Vucyk7XG5cbiAgICAgIC8vIENvbnZlcnQgdG9rZW5zIGJhY2sgaW50byByYXcgdmFsdWUgd2l0aCB0YWdzLiBOZXdseSBmb3JtZWQgdGFncyB3aWxsXG4gICAgICAvLyBiZWNvbWUgcGFydCBvZiB0aGUgcmF3IHZhbHVlLlxuICAgICAgdmFyIHJhd1ZhbHVlID0gdGhpcy5yYXdWYWx1ZSh0aGlzLnRyYWNraW5nLnRva2Vucyk7XG5cbiAgICAgIC8vIFNldCB0aGUgdmFsdWUgdG8gdGhlIG5ldyByYXcgdmFsdWUuXG4gICAgICB0aGlzLm9uQ2hhbmdlVmFsdWUocmF3VmFsdWUpO1xuXG4gICAgICB0aGlzLnNuYXBzaG90KCk7XG4gICAgfS5iaW5kKHRoaXMpLDApO1xuICB9LFxuXG4gIG9uS2V5RG93bjogZnVuY3Rpb24gKGV2ZW50KSB7XG5cbiAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMzcpIHtcbiAgICAgIHRoaXMubGVmdEFycm93RG93biA9IHRydWU7XG4gICAgfSBlbHNlIGlmIChldmVudC5rZXlDb2RlID09PSAzOSkge1xuICAgICAgdGhpcy5yaWdodEFycm93RG93biA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gQ21kLVogb3IgQ3RybC1aXG4gICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDkwICYmIChldmVudC5tZXRhS2V5IHx8IGV2ZW50LmN0cmxLZXkpICYmICFldmVudC5zaGlmdEtleSkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHRoaXMudW5kbygpO1xuICAgIC8vIENtZC1TaGlmdC1aIG9yIEN0cmwtWVxuICAgIH0gZWxzZSBpZiAoXG4gICAgICAoZXZlbnQua2V5Q29kZSA9PT0gODkgJiYgZXZlbnQuY3RybEtleSAmJiAhZXZlbnQuc2hpZnRLZXkpIHx8XG4gICAgICAoZXZlbnQua2V5Q29kZSA9PT0gOTAgJiYgZXZlbnQubWV0YUtleSAmJiBldmVudC5zaGlmdEtleSlcbiAgICApIHtcbiAgICAgIHRoaXMucmVkbygpO1xuICAgIH1cbiAgfSxcblxuICBvbktleVVwOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMzcpIHtcbiAgICAgIHRoaXMubGVmdEFycm93RG93biA9IGZhbHNlO1xuICAgIH0gZWxzZSBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMzkpIHtcbiAgICAgIHRoaXMucmlnaHRBcnJvd0Rvd24gPSBmYWxzZTtcbiAgICB9XG4gIH0sXG5cbiAgLy8gS2VlcCB0aGUgaGlnaGxpZ2h0IHN0eWxlcyBpbiBzeW5jIHdpdGggdGhlIHRleHRhcmVhIHN0eWxlcy5cbiAgYWRqdXN0U3R5bGVzOiBmdW5jdGlvbiAoaXNNb3VudCkge1xuICAgIHZhciBvdmVybGF5ID0gdGhpcy5yZWZzLmhpZ2hsaWdodC5nZXRET01Ob2RlKCk7XG4gICAgdmFyIGNvbnRlbnQgPSB0aGlzLnJlZnMuY29udGVudC5nZXRET01Ob2RlKCk7XG5cbiAgICB2YXIgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShjb250ZW50KTtcblxuICAgIHZhciBiYWNrZ3JvdW5kQ29sb3IgPSBzdHlsZS5iYWNrZ3JvdW5kQ29sb3I7XG5cbiAgICB1dGlscy5jb3B5RWxlbWVudFN0eWxlKGNvbnRlbnQsIG92ZXJsYXkpO1xuXG4gICAgb3ZlcmxheS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgb3ZlcmxheS5zdHlsZS53aGl0ZVNwYWNlID0gJ3ByZS13cmFwJztcbiAgICBvdmVybGF5LnN0eWxlLmNvbG9yID0gJ3JnYmEoMCwwLDAsMCknO1xuICAgIG92ZXJsYXkuc3R5bGUud2Via2l0VGV4dEZpbGxDb2xvciA9ICdyZ2JhKDAsMCwwLDApJztcbiAgICBvdmVybGF5LnN0eWxlLnJlc2l6ZSA9ICdub25lJztcbiAgICBvdmVybGF5LnN0eWxlLmJvcmRlckNvbG9yID0gJ3JnYmEoMCwwLDAsMCknO1xuXG4gICAgaWYgKHV0aWxzLmJyb3dzZXIuaXNNb3ppbGxhKSB7XG5cbiAgICAgIHZhciBwYWRkaW5nVG9wID0gcGFyc2VGbG9hdChzdHlsZS5wYWRkaW5nVG9wKTtcbiAgICAgIHZhciBwYWRkaW5nQm90dG9tID0gcGFyc2VGbG9hdChzdHlsZS5wYWRkaW5nQm90dG9tKTtcblxuICAgICAgdmFyIGJvcmRlclRvcCA9IHBhcnNlRmxvYXQoc3R5bGUuYm9yZGVyVG9wV2lkdGgpO1xuICAgICAgdmFyIGJvcmRlckJvdHRvbSA9IHBhcnNlRmxvYXQoc3R5bGUuYm9yZGVyQm90dG9tV2lkdGgpO1xuXG4gICAgICBvdmVybGF5LnN0eWxlLnBhZGRpbmdUb3AgPSAnMHB4JztcbiAgICAgIG92ZXJsYXkuc3R5bGUucGFkZGluZ0JvdHRvbSA9ICcwcHgnO1xuXG4gICAgICBvdmVybGF5LnN0eWxlLmhlaWdodCA9IChjb250ZW50LmNsaWVudEhlaWdodCAtIHBhZGRpbmdUb3AgLSBwYWRkaW5nQm90dG9tICsgYm9yZGVyVG9wICsgYm9yZGVyQm90dG9tKSArICdweCc7XG4gICAgICBvdmVybGF5LnN0eWxlLnRvcCA9IHN0eWxlLnBhZGRpbmdUb3A7XG4gICAgICBvdmVybGF5LnN0eWxlLmJveFNoYWRvdyA9ICdub25lJztcbiAgICB9XG5cbiAgICBpZiAoaXNNb3VudCkge1xuICAgICAgdGhpcy5iYWNrZ3JvdW5kQ29sb3IgPSBiYWNrZ3JvdW5kQ29sb3I7XG4gICAgfVxuICAgIG92ZXJsYXkuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gdGhpcy5iYWNrZ3JvdW5kQ29sb3I7XG4gICAgY29udGVudC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAncmdiYSgwLDAsMCwwKSc7XG4gIH0sXG5cbiAgLy8gSWYgdGhlIHRleHRhcmVhIGlzIHJlc2l6ZWQsIG5lZWQgdG8gcmUtc3luYyB0aGUgc3R5bGVzLlxuICBvblJlc2l6ZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuYWRqdXN0U3R5bGVzKCk7XG4gIH0sXG5cbiAgLy8gSWYgdGhlIHdpbmRvdyBpcyByZXNpemVkLCBtYXkgbmVlZCB0byByZS1zeW5jIHRoZSBzdHlsZXMuXG4gIC8vIFByb2JhYmx5IG5vdCBuZWNlc3Nhcnkgd2l0aCBlbGVtZW50IHJlc2l6ZT9cbiAgb25SZXNpemVXaW5kb3c6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmFkanVzdFN0eWxlcygpO1xuICB9LFxuXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5hZGp1c3RTdHlsZXModHJ1ZSk7XG4gICAgdGhpcy5zZXRPblJlc2l6ZSgnY29udGVudCcsIHRoaXMub25SZXNpemUpO1xuICAgIC8vdGhpcy5zZXRPbkNsaWNrT3V0c2lkZSgnY2hvaWNlcycsIHRoaXMub25DbGlja091dHNpZGVDaG9pY2VzKTtcbiAgfSxcblxuICBvbkluc2VydEZyb21TZWxlY3Q6IGZ1bmN0aW9uIChldmVudCkge1xuICAgIGlmIChldmVudC50YXJnZXQuc2VsZWN0ZWRJbmRleCA+IDApIHtcbiAgICAgIHZhciB0YWcgPSBldmVudC50YXJnZXQudmFsdWU7XG4gICAgICBldmVudC50YXJnZXQuc2VsZWN0ZWRJbmRleCA9IDA7XG4gICAgICB2YXIgcG9zID0gdGhpcy50cmFja2luZy5wb3M7XG4gICAgICB2YXIgaW5zZXJ0UG9zID0gdGhpcy5ub3JtYWxpemVQb3NpdGlvbihwb3MpO1xuICAgICAgdmFyIHRva2VucyA9IHRoaXMudHJhY2tpbmcudG9rZW5zO1xuICAgICAgdmFyIHRva2VuSW5kZXggPSB0aGlzLnRva2VuSW5kZXgoaW5zZXJ0UG9zLCB0b2tlbnMsIHRoaXMudHJhY2tpbmcuaW5kZXhNYXApO1xuICAgICAgdG9rZW5zLnNwbGljZSh0b2tlbkluZGV4LCAwLCB7XG4gICAgICAgIHR5cGU6ICd0YWcnLFxuICAgICAgICB2YWx1ZTogdGFnXG4gICAgICB9KTtcbiAgICAgIHRoaXMudHJhY2tpbmcuaW5kZXhNYXAgPSB0aGlzLmluZGV4TWFwKHRva2Vucyk7XG4gICAgICB2YXIgbmV3VmFsdWUgPSB0aGlzLnJhd1ZhbHVlKHRva2Vucyk7XG4gICAgICB0aGlzLnRyYWNraW5nLnBvcyArPSB0aGlzLnByZXR0eUxhYmVsKHRhZykubGVuZ3RoO1xuICAgICAgdGhpcy5vbkNoYW5nZVZhbHVlKG5ld1ZhbHVlKTtcbiAgICAgIHRoaXMucmVmcy5jb250ZW50LmdldERPTU5vZGUoKS5mb2N1cygpO1xuICAgIH1cbiAgfSxcblxuICBvbkluc2VydDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFyIHRhZyA9IHZhbHVlO1xuICAgIHZhciBwb3MgPSB0aGlzLnRyYWNraW5nLnBvcztcbiAgICB2YXIgZW5kUG9zID0gdGhpcy50cmFja2luZy5wb3MgKyB0aGlzLnRyYWNraW5nLnJhbmdlO1xuICAgIHZhciBpbnNlcnRQb3MgPSB0aGlzLm5vcm1hbGl6ZVBvc2l0aW9uKHBvcyk7XG4gICAgdmFyIGVuZEluc2VydFBvcyA9IHRoaXMubm9ybWFsaXplUG9zaXRpb24oZW5kUG9zKTtcbiAgICB2YXIgdG9rZW5zID0gdGhpcy50cmFja2luZy50b2tlbnM7XG4gICAgdmFyIHRva2VuSW5kZXggPSB0aGlzLnRva2VuSW5kZXgoaW5zZXJ0UG9zLCB0b2tlbnMsIHRoaXMudHJhY2tpbmcuaW5kZXhNYXApO1xuICAgIHZhciB0b2tlbkVuZEluZGV4ID0gdGhpcy50b2tlbkluZGV4KGVuZEluc2VydFBvcywgdG9rZW5zLCB0aGlzLnRyYWNraW5nLmluZGV4TWFwKTtcbiAgICB0b2tlbnMuc3BsaWNlKHRva2VuSW5kZXgsIHRva2VuRW5kSW5kZXggLSB0b2tlbkluZGV4LCB7XG4gICAgICB0eXBlOiAndGFnJyxcbiAgICAgIHZhbHVlOiB0YWdcbiAgICB9KTtcbiAgICB0aGlzLnRyYWNraW5nLmluZGV4TWFwID0gdGhpcy5pbmRleE1hcCh0b2tlbnMpO1xuICAgIHZhciBuZXdWYWx1ZSA9IHRoaXMucmF3VmFsdWUodG9rZW5zKTtcbiAgICB0aGlzLnRyYWNraW5nLnBvcyArPSB0aGlzLnByZXR0eUxhYmVsKHRhZykubGVuZ3RoO1xuICAgIHRoaXMub25DaGFuZ2VWYWx1ZShuZXdWYWx1ZSk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBpc0Nob2ljZXNPcGVuOiBmYWxzZVxuICAgIH0pO1xuICAgIHRoaXMucmVmcy5jb250ZW50LmdldERPTU5vZGUoKS5mb2N1cygpO1xuICB9LFxuXG4gIG9uVG9nZ2xlQ2hvaWNlczogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc2V0Q2hvaWNlc09wZW4oIXRoaXMuc3RhdGUuaXNDaG9pY2VzT3Blbik7XG4gIH0sXG5cbiAgb25DbG9zZUNob2ljZXM6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5pc0Nob2ljZXNPcGVuKSB7XG4gICAgICB0aGlzLnNldENob2ljZXNPcGVuKGZhbHNlKTtcbiAgICB9XG4gIH0sXG5cbiAgc2V0Q2hvaWNlc09wZW46IGZ1bmN0aW9uIChpc09wZW4pIHtcbiAgICBpZiAoaXNPcGVuKSB7XG4gICAgICB0aGlzLm9uU3RhcnRBY3Rpb24oJ29wZW4tcmVwbGFjZW1lbnRzJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub25TdGFydEFjdGlvbignY2xvc2UtcmVwbGFjZW1lbnRzJyk7XG4gICAgfVxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgaXNDaG9pY2VzT3BlbjogaXNPcGVuXG4gICAgfSk7XG4gIH0sXG5cbiAgY2xvc2VDaG9pY2VzOiBmdW5jdGlvbiAoKSB7XG5cbiAgfSxcblxuICBnZXRDbG9zZUlnbm9yZU5vZGVzOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVmcy50b2dnbGUuZ2V0RE9NTm9kZSgpO1xuICB9LFxuXG4gIG9uQ2xpY2tPdXRzaWRlQ2hvaWNlczogZnVuY3Rpb24gKCkge1xuICAgIC8vIC8vIElmIHdlIGRpZG4ndCBjbGljayBvbiB0aGUgdG9nZ2xlIGJ1dHRvbiwgY2xvc2UgdGhlIGNob2ljZXMuXG4gICAgLy8gaWYgKHRoaXMuaXNOb2RlT3V0c2lkZSh0aGlzLnJlZnMudG9nZ2xlLmdldERPTU5vZGUoKSwgZXZlbnQudGFyZ2V0KSkge1xuICAgIC8vICAgY29uc29sZS5sb2coJ25vdCBhIHRvZ2dsZSBjbGljaycpXG4gICAgLy8gICB0aGlzLnNldFN0YXRlKHtcbiAgICAvLyAgICAgaXNDaG9pY2VzT3BlbjogZmFsc2VcbiAgICAvLyAgIH0pO1xuICAgIC8vIH1cbiAgfSxcblxuICBvbk1vdXNlTW92ZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgLy8gUGxhY2Vob2xkZXIgdG8gZ2V0IGF0IHBpbGwgdW5kZXIgbW91c2UgcG9zaXRpb24uIEluZWZmaWNpZW50LCBidXQgbm90XG4gICAgLy8gc3VyZSB0aGVyZSdzIGFub3RoZXIgd2F5LlxuXG4gICAgdmFyIHBvc2l0aW9uID0ge3g6IGV2ZW50LmNsaWVudFgsIHk6IGV2ZW50LmNsaWVudFl9O1xuICAgIHZhciBub2RlcyA9IHRoaXMucmVmcy5oaWdobGlnaHQuZ2V0RE9NTm9kZSgpLmNoaWxkTm9kZXM7XG4gICAgdmFyIG1hdGNoZWROb2RlID0gbnVsbDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgbm9kZSA9IG5vZGVzW2ldO1xuICAgICAgaWYgKG5vZGVzW2ldLmdldEF0dHJpYnV0ZSgnZGF0YS1wcmV0dHknKSkge1xuICAgICAgICBpZiAocG9zaXRpb25Jbk5vZGUocG9zaXRpb24sIG5vZGUpKSB7XG4gICAgICAgICAgbWF0Y2hlZE5vZGUgPSBub2RlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG1hdGNoZWROb2RlKSB7XG4gICAgICBpZiAodGhpcy5zdGF0ZS5ob3ZlclBpbGxSZWYgIT09IG1hdGNoZWROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1yZWYnKSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBob3ZlclBpbGxSZWY6IG1hdGNoZWROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1yZWYnKVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuaG92ZXJQaWxsUmVmKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgaG92ZXJQaWxsUmVmOiBudWxsXG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHZhciByZXBsYWNlQ2hvaWNlcyA9IHRoaXMuc3RhdGUucmVwbGFjZUNob2ljZXM7XG5cbiAgICAvLyB2YXIgc2VsZWN0UmVwbGFjZUNob2ljZXMgPSBbe1xuICAgIC8vICAgdmFsdWU6ICcnLFxuICAgIC8vICAgbGFiZWw6ICdJbnNlcnQuLi4nXG4gICAgLy8gfV0uY29uY2F0KHJlcGxhY2VDaG9pY2VzKTtcblxuICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQnLCB7XG4gICAgICBmaWVsZDogZmllbGQsIHBsYWluOiB0aGlzLnByb3BzLnBsYWluXG4gICAgfSwgUi5kaXYoe3N0eWxlOiB7cG9zaXRpb246ICdyZWxhdGl2ZSd9fSxcblxuICAgICAgUi5wcmUoe1xuICAgICAgICBjbGFzc05hbWU6ICdwcmV0dHktaGlnaGxpZ2h0JyxcbiAgICAgICAgcmVmOiAnaGlnaGxpZ2h0J1xuICAgICAgfSxcbiAgICAgICAgdGhpcy5wcmV0dHlWYWx1ZSh0aGlzLnByb3BzLmZpZWxkLnZhbHVlKVxuICAgICAgKSxcblxuICAgICAgKGNvbmZpZy5maWVsZElzU2luZ2xlTGluZShmaWVsZCkgPyBSLmlucHV0IDogUi50ZXh0YXJlYSkoe1xuICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgIGNsYXNzTmFtZTogY3goXy5leHRlbmQoe30sIHRoaXMucHJvcHMuY2xhc3NlcywgeydwcmV0dHktY29udGVudCc6IHRydWV9KSksXG4gICAgICAgIHJlZjogJ2NvbnRlbnQnLFxuICAgICAgICByb3dzOiBmaWVsZC5yb3dzIHx8IHRoaXMucHJvcHMucm93cyxcbiAgICAgICAgbmFtZTogZmllbGQua2V5LFxuICAgICAgICB2YWx1ZTogdGhpcy5wbGFpblZhbHVlKHRoaXMucHJvcHMuZmllbGQudmFsdWUpLFxuICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgICAgb25TY3JvbGw6IHRoaXMub25TY3JvbGwsXG4gICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXG4gICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgY3Vyc29yOiB0aGlzLnN0YXRlLmhvdmVyUGlsbFJlZiA/ICdwb2ludGVyJyA6IG51bGxcbiAgICAgICAgfSxcbiAgICAgICAgb25LZXlQcmVzczogdGhpcy5vbktleVByZXNzLFxuICAgICAgICBvbktleURvd246IHRoaXMub25LZXlEb3duLFxuICAgICAgICBvbktleVVwOiB0aGlzLm9uS2V5VXAsXG4gICAgICAgIG9uU2VsZWN0OiB0aGlzLm9uU2VsZWN0LFxuICAgICAgICBvbkNvcHk6IHRoaXMub25Db3B5LFxuICAgICAgICBvbkN1dDogdGhpcy5vbkN1dCxcbiAgICAgICAgb25Nb3VzZU1vdmU6IHRoaXMub25Nb3VzZU1vdmUsXG4gICAgICAgIG9uRm9jdXM6IHRoaXMub25Gb2N1c0FjdGlvbixcbiAgICAgICAgb25CbHVyOiB0aGlzLm9uQmx1ckFjdGlvblxuICAgICAgfSksXG5cbiAgICAgIFIuYSh7cmVmOiAndG9nZ2xlJywgaHJlZjogJ0phdmFTY3JpcHQnICsgJzonLCBvbkNsaWNrOiB0aGlzLm9uVG9nZ2xlQ2hvaWNlc30sICdJbnNlcnQuLi4nKSxcblxuICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2Nob2ljZXMnLCB7XG4gICAgICAgIHJlZjogJ2Nob2ljZXMnLFxuICAgICAgICBjaG9pY2VzOiByZXBsYWNlQ2hvaWNlcywgb3BlbjogdGhpcy5zdGF0ZS5pc0Nob2ljZXNPcGVuLFxuICAgICAgICBvblNlbGVjdDogdGhpcy5vbkluc2VydCwgb25DbG9zZTogdGhpcy5vbkNsb3NlQ2hvaWNlcywgaWdub3JlQ2xvc2VOb2RlczogdGhpcy5nZXRDbG9zZUlnbm9yZU5vZGVzXG4gICAgICB9KVxuICAgICkpO1xuICB9XG59KTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBzZWxlY3QgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgc2VsZWN0IGVsZW1lbnQgdG8gZ2l2ZSBhIHVzZXIgY2hvaWNlcyBmb3IgdGhlIHZhbHVlIG9mIGEgZmllbGQuIE5vdGVcbml0IHNob3VsZCBzdXBwb3J0IHZhbHVlcyBvdGhlciB0aGFuIHN0cmluZ3MuIEN1cnJlbnRseSB0aGlzIGlzIG9ubHkgdGVzdGVkIGZvclxuYm9vbGVhbiB2YWx1ZXMsIGJ1dCBpdCBfc2hvdWxkXyB3b3JrIGZvciBvdGhlciB2YWx1ZXMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ1NlbGVjdCcsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBjaG9pY2VzOiB0aGlzLnByb3BzLmNvbmZpZy5maWVsZENob2ljZXModGhpcy5wcm9wcy5maWVsZClcbiAgICB9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXdQcm9wcykge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgY2hvaWNlczogbmV3UHJvcHMuY29uZmlnLmZpZWxkQ2hvaWNlcyhuZXdQcm9wcy5maWVsZClcbiAgICB9KTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywge1xuICAgICAgY29uZmlnOiBjb25maWcsIGZpZWxkOiBmaWVsZCwgcGxhaW46IHRoaXMucHJvcHMucGxhaW5cbiAgICB9LCBjb25maWcuY3JlYXRlRWxlbWVudCgnc2VsZWN0LXZhbHVlJywge1xuICAgICAgY2hvaWNlczogdGhpcy5zdGF0ZS5jaG9pY2VzLCBmaWVsZDogZmllbGQsIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlVmFsdWUsIG9uQWN0aW9uOiB0aGlzLm9uQnViYmxlQWN0aW9uXG4gICAgfSkpO1xuICB9XG59KTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBzaW5nbGUtbGluZS1zdHJpbmcgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgYSBzaW5nbGUgbGluZSB0ZXh0IGlucHV0LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ1NpbmdsZUxpbmVTdHJpbmcnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICBvbkNoYW5nZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdGhpcy5vbkNoYW5nZVZhbHVlKGV2ZW50LnRhcmdldC52YWx1ZSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHtcbiAgICAgIGNvbmZpZzogY29uZmlnLCBmaWVsZDogZmllbGQsIHBsYWluOiB0aGlzLnByb3BzLnBsYWluXG4gICAgfSwgUi5pbnB1dCh7XG4gICAgICB0eXBlOiAndGV4dCcsXG4gICAgICB2YWx1ZTogdGhpcy5wcm9wcy5maWVsZC52YWx1ZSxcbiAgICAgIGNsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSxcbiAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgb25Gb2N1czogdGhpcy5vbkZvY3VzQWN0aW9uLFxuICAgICAgb25CbHVyOiB0aGlzLm9uQmx1ckFjdGlvblxuICAgIH0pKTtcbiAgfVxufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgc3RyaW5nIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIGEgZmllbGQgdGhhdCBjYW4gZWRpdCBhIHN0cmluZyB2YWx1ZS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdTdHJpbmcnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICBvbkNoYW5nZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdGhpcy5vbkNoYW5nZVZhbHVlKGV2ZW50LnRhcmdldC52YWx1ZSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHtcbiAgICAgIGNvbmZpZzogY29uZmlnLCBmaWVsZDogZmllbGQsIHBsYWluOiB0aGlzLnByb3BzLnBsYWluXG4gICAgfSwgUi50ZXh0YXJlYSh7XG4gICAgICB2YWx1ZTogZmllbGQudmFsdWUsXG4gICAgICBjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcyksXG4gICAgICByb3dzOiBmaWVsZC5yb3dzIHx8IHRoaXMucHJvcHMucm93cyxcbiAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgb25Gb2N1czogdGhpcy5vbkZvY3VzQWN0aW9uLFxuICAgICAgb25CbHVyOiB0aGlzLm9uQmx1ckFjdGlvblxuICAgIH0pKTtcbiAgfVxufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgdW5rbm93biBjb21wb25lbnRcblxuLypcblJlbmRlciBhIGZpZWxkIHdpdGggYW4gdW5rbm93biB0eXBlLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ1Vua25vd24nLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSLmRpdih7fSxcbiAgICAgIFIuZGl2KHt9LCAnQ29tcG9uZW50IG5vdCBmb3VuZCBmb3I6ICcpLFxuICAgICAgUi5wcmUoe30sIEpTT04uc3RyaW5naWZ5KHRoaXMucHJvcHMuZmllbGQucmF3RmllbGRUZW1wbGF0ZSwgbnVsbCwgMikpXG4gICAgKTtcbiAgfVxuXG59KTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBhZGQtaXRlbSBjb21wb25lbnRcblxuLypcblRoZSBhZGQgYnV0dG9uIHRvIGFwcGVuZCBhbiBpdGVtIHRvIGEgZmllbGQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnQWRkSXRlbScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGFiZWw6ICdbYWRkXSdcbiAgICB9O1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFIuc3Bhbih7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpLCBvbkNsaWNrOiB0aGlzLnByb3BzLm9uQ2xpY2t9LCB0aGlzLnByb3BzLmxhYmVsKTtcbiAgfVxufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgYXJyYXktY29udHJvbCBjb21wb25lbnRcblxuLypcblJlbmRlciB0aGUgaXRlbSB0eXBlIGNob2ljZXMgYW5kIHRoZSBhZGQgYnV0dG9uIGZvciBhbiBhcnJheS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdBcnJheUNvbnRyb2wnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZpZWxkVGVtcGxhdGVJbmRleDogMFxuICAgIH07XG4gIH0sXG5cbiAgb25TZWxlY3Q6IGZ1bmN0aW9uIChpbmRleCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZmllbGRUZW1wbGF0ZUluZGV4OiBpbmRleFxuICAgIH0pO1xuICB9LFxuXG4gIG9uQXBwZW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5wcm9wcy5vbkFwcGVuZCh0aGlzLnN0YXRlLmZpZWxkVGVtcGxhdGVJbmRleCk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblxuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG4gICAgdmFyIGZpZWxkVGVtcGxhdGVzID0gY29uZmlnLmZpZWxkSXRlbUZpZWxkVGVtcGxhdGVzKGZpZWxkKTtcblxuICAgIHZhciB0eXBlQ2hvaWNlcyA9IG51bGw7XG5cbiAgICBpZiAoZmllbGRUZW1wbGF0ZXMubGVuZ3RoID4gMCkge1xuICAgICAgdHlwZUNob2ljZXMgPSBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQtdGVtcGxhdGUtY2hvaWNlcycsIHtcbiAgICAgICAgZmllbGQ6IGZpZWxkLCBmaWVsZFRlbXBsYXRlSW5kZXg6IHRoaXMuc3RhdGUuZmllbGRUZW1wbGF0ZUluZGV4LCBvblNlbGVjdDogdGhpcy5vblNlbGVjdFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3Nlcyl9LFxuICAgICAgdHlwZUNob2ljZXMsICcgJyxcbiAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdhZGQtaXRlbScsIHtmaWVsZDogZmllbGQsIG9uQ2xpY2s6IHRoaXMub25BcHBlbmR9KVxuICAgICk7XG4gIH1cbn0pO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGFycmF5LWl0ZW0tY29udHJvbCBjb21wb25lbnRcblxuLypcblJlbmRlciB0aGUgcmVtb3ZlIGFuZCBtb3ZlIGJ1dHRvbnMgZm9yIGFuIGFycmF5IGZpZWxkLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0FycmF5SXRlbUNvbnRyb2wnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgb25Nb3ZlQmFjazogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucHJvcHMub25Nb3ZlKHRoaXMucHJvcHMuaW5kZXgsIHRoaXMucHJvcHMuaW5kZXggLSAxKTtcbiAgfSxcblxuICBvbk1vdmVGb3J3YXJkOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5wcm9wcy5vbk1vdmUodGhpcy5wcm9wcy5pbmRleCwgdGhpcy5wcm9wcy5pbmRleCArIDEpO1xuICB9LFxuXG4gIG9uUmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5wcm9wcy5vblJlbW92ZSh0aGlzLnByb3BzLmluZGV4KTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3Nlcyl9LFxuICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ3JlbW92ZS1pdGVtJywge2ZpZWxkOiBmaWVsZCwgb25DbGljazogdGhpcy5vblJlbW92ZSwgb25NYXliZVJlbW92ZTogdGhpcy5wcm9wcy5vbk1heWJlUmVtb3ZlfSksXG4gICAgICB0aGlzLnByb3BzLmluZGV4ID4gMCA/IGNvbmZpZy5jcmVhdGVFbGVtZW50KCdtb3ZlLWl0ZW0tYmFjaycsIHtmaWVsZDogZmllbGQsIG9uQ2xpY2s6IHRoaXMub25Nb3ZlQmFja30pIDogbnVsbCxcbiAgICAgIHRoaXMucHJvcHMuaW5kZXggPCAodGhpcy5wcm9wcy5udW1JdGVtcyAtIDEpID8gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ21vdmUtaXRlbS1mb3J3YXJkJywge2ZpZWxkOiBmaWVsZCwgb25DbGljazogdGhpcy5vbk1vdmVGb3J3YXJkfSkgOiBudWxsXG4gICAgKTtcbiAgfVxufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgYXJyYXktaXRlbS12YWx1ZSBjb21wb25lbnRcblxuLypcblJlbmRlciB0aGUgdmFsdWUgb2YgYW4gYXJyYXkgaXRlbS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdBcnJheUl0ZW1WYWx1ZScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBvbkNoYW5nZUZpZWxkOiBmdW5jdGlvbiAobmV3VmFsdWUsIGluZm8pIHtcbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHRoaXMucHJvcHMuaW5kZXgsIG5ld1ZhbHVlLCBpbmZvKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3Nlcyl9LFxuICAgICAgY29uZmlnLmNyZWF0ZUZpZWxkRWxlbWVudCh7ZmllbGQ6IGZpZWxkLCBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZUZpZWxkLCBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvbn0pXG4gICAgKTtcbiAgfVxufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgYXJyYXktaXRlbSBjb21wb25lbnRcblxuLypcblJlbmRlciBhbiBhcnJheSBpdGVtLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnQXJyYXlJdGVtJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpc01heWJlUmVtb3Zpbmc6IGZhbHNlXG4gICAgfTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgb25NYXliZVJlbW92ZTogZnVuY3Rpb24gKGlzTWF5YmVSZW1vdmluZykge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgaXNNYXliZVJlbW92aW5nOiBpc01heWJlUmVtb3ZpbmdcbiAgICB9KTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICB2YXIgY2xhc3NlcyA9IF8uZXh0ZW5kKHt9LCB0aGlzLnByb3BzLmNsYXNzZXMpO1xuXG4gICAgaWYgKHRoaXMuc3RhdGUuaXNNYXliZVJlbW92aW5nKSB7XG4gICAgICBjbGFzc2VzWydtYXliZS1yZW1vdmluZyddID0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogY3goY2xhc3Nlcyl9LFxuICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2FycmF5LWl0ZW0tdmFsdWUnLCB7ZmllbGQ6IGZpZWxkLCBpbmRleDogdGhpcy5wcm9wcy5pbmRleCxcbiAgICAgICAgb25DaGFuZ2U6IHRoaXMucHJvcHMub25DaGFuZ2UsIG9uQWN0aW9uOiB0aGlzLm9uQnViYmxlQWN0aW9ufSksXG4gICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgnYXJyYXktaXRlbS1jb250cm9sJywge2ZpZWxkOiBmaWVsZCwgaW5kZXg6IHRoaXMucHJvcHMuaW5kZXgsIG51bUl0ZW1zOiB0aGlzLnByb3BzLm51bUl0ZW1zLFxuICAgICAgICBvbk1vdmU6IHRoaXMucHJvcHMub25Nb3ZlLCBvblJlbW92ZTogdGhpcy5wcm9wcy5vblJlbW92ZSwgb25NYXliZVJlbW92ZTogdGhpcy5vbk1heWJlUmVtb3ZlfSlcbiAgICApO1xuICB9XG59KTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjaG9pY2VzIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIGN1c3RvbWl6ZWQgKG5vbi1uYXRpdmUpIGRyb3Bkb3duIGNob2ljZXMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxudmFyIENTU1RyYW5zaXRpb25Hcm91cCA9IFJlYWN0LmNyZWF0ZUZhY3RvcnkoUmVhY3QuYWRkb25zLkNTU1RyYW5zaXRpb25Hcm91cCk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnQ2hvaWNlcycsXG5cbiAgbWl4aW5zOiBbXG4gICAgcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpLFxuICAgIC8vcGx1Z2luLnJlcXVpcmUoJ21peGluLnJlc2l6ZScpLFxuICAgIC8vcGx1Z2luLnJlcXVpcmUoJ21peGluLnNjcm9sbCcpLFxuICAgIHJlcXVpcmUoJy4uLy4uL21peGlucy9jbGljay1vdXRzaWRlJylcbiAgXSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbWF4SGVpZ2h0OiBudWxsLFxuICAgICAgb3BlbjogdGhpcy5wcm9wcy5vcGVuXG4gICAgfTtcbiAgfSxcblxuICBnZXRJZ25vcmVDbG9zZU5vZGVzOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLnByb3BzLmlnbm9yZUNsb3NlTm9kZXMpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgdmFyIG5vZGVzID0gdGhpcy5wcm9wcy5pZ25vcmVDbG9zZU5vZGVzKCk7XG4gICAgaWYgKCFfLmlzQXJyYXkobm9kZXMpKSB7XG4gICAgICBub2RlcyA9IFtub2Rlc107XG4gICAgfVxuICAgIHJldHVybiBub2RlcztcbiAgfSxcblxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc2V0T25DbGlja091dHNpZGUoJ2Nob2ljZXMnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblxuICAgICAgLy8gTWFrZSBzdXJlIHdlIGRvbid0IGZpbmQgYW55IG5vZGVzIHRvIGlnbm9yZS5cbiAgICAgIGlmICghXy5maW5kKHRoaXMuZ2V0SWdub3JlQ2xvc2VOb2RlcygpLCBmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc05vZGVJbnNpZGUoZXZlbnQudGFyZ2V0LCBub2RlKTtcbiAgICAgIH0uYmluZCh0aGlzKSkpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkNsb3NlKCk7XG4gICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuYWRqdXN0U2l6ZSgpO1xuICB9LFxuXG4gIG9uU2VsZWN0OiBmdW5jdGlvbiAoY2hvaWNlKSB7XG4gICAgdGhpcy5wcm9wcy5vblNlbGVjdChjaG9pY2UudmFsdWUpO1xuICB9LFxuXG4gIG9uUmVzaXplV2luZG93OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5hZGp1c3RTaXplKCk7XG4gIH0sXG5cbiAgb25TY3JvbGxXaW5kb3c6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmFkanVzdFNpemUoKTtcbiAgfSxcblxuICBhZGp1c3RTaXplOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMucmVmcy5jaG9pY2VzKSB7XG4gICAgICB2YXIgbm9kZSA9IHRoaXMucmVmcy5jaG9pY2VzLmdldERPTU5vZGUoKTtcbiAgICAgIHZhciByZWN0ID0gbm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIHZhciB0b3AgPSByZWN0LnRvcDtcbiAgICAgIHZhciB3aW5kb3dIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgICB2YXIgaGVpZ2h0ID0gd2luZG93SGVpZ2h0IC0gdG9wO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIG1heEhlaWdodDogaGVpZ2h0XG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gKG5leHRQcm9wcykge1xuICAgIHRoaXMuc2V0U3RhdGUoe29wZW46IG5leHRQcm9wcy5vcGVufSwgZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5hZGp1c3RTaXplKCk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfSxcblxuICBvblNjcm9sbDogZnVuY3Rpb24gKCkge1xuICAgIC8vIGNvbnNvbGUubG9nKCdzdG9wIHRoYXQhJylcbiAgICAvLyBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIC8vIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICB9LFxuXG4gIG9uV2hlZWw6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIC8vIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY2hvaWNlcyA9IHRoaXMucHJvcHMuY2hvaWNlcztcblxuICAgIGlmIChjaG9pY2VzICYmIGNob2ljZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICBjaG9pY2VzID0gW3t2YWx1ZTogJy8vL2VtcHR5Ly8vJ31dO1xuICAgIH1cblxuICAgIHJldHVybiBSLmRpdih7cmVmOiAnY29udGFpbmVyJywgb25XaGVlbDogdGhpcy5vbldoZWVsLCBvblNjcm9sbDogdGhpcy5vblNjcm9sbCwgY2xhc3NOYW1lOiAnY2hvaWNlcy1jb250YWluZXInLCBzdHlsZToge1xuICAgICAgdXNlclNlbGVjdDogJ25vbmUnLCBXZWJraXRVc2VyU2VsZWN0OiAnbm9uZScsIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgbWF4SGVpZ2h0OiB0aGlzLnN0YXRlLm1heEhlaWdodCA/IHRoaXMuc3RhdGUubWF4SGVpZ2h0IDogbnVsbFxuICAgIH19LFxuICAgICAgQ1NTVHJhbnNpdGlvbkdyb3VwKHt0cmFuc2l0aW9uTmFtZTogJ3JldmVhbCd9LFxuICAgICAgICB0aGlzLnByb3BzLm9wZW4gPyBSLnVsKHtyZWY6ICdjaG9pY2VzJywgY2xhc3NOYW1lOiAnY2hvaWNlcyd9LFxuICAgICAgICAgIGNob2ljZXMubWFwKGZ1bmN0aW9uIChjaG9pY2UsIGkpIHtcblxuICAgICAgICAgICAgdmFyIGNob2ljZUVsZW1lbnQgPSBudWxsO1xuXG4gICAgICAgICAgICBpZiAoY2hvaWNlLnZhbHVlID09PSAnLy8vbG9hZGluZy8vLycpIHtcbiAgICAgICAgICAgICAgY2hvaWNlRWxlbWVudCA9IFIuYSh7aHJlZjogJ0phdmFTY3JpcHQnICsgJzonLCBvbkNsaWNrOiB0aGlzLnByb3BzLm9uQ2xvc2V9LFxuICAgICAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAnY2hvaWNlLWxhYmVsJ30sXG4gICAgICAgICAgICAgICAgICAnTG9hZGluZy4uLidcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNob2ljZS52YWx1ZSA9PT0gJy8vL2VtcHR5Ly8vJykge1xuICAgICAgICAgICAgICBjaG9pY2VFbGVtZW50ID0gUi5hKHtocmVmOiAnSmF2YVNjcmlwdCcgKyAnOicsIG9uQ2xpY2s6IHRoaXMucHJvcHMub25DbG9zZX0sXG4gICAgICAgICAgICAgICAgUi5zcGFuKHtjbGFzc05hbWU6ICdjaG9pY2UtbGFiZWwnfSxcbiAgICAgICAgICAgICAgICAgICdObyBjaG9pY2VzIGF2YWlsYWJsZS4nXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY2hvaWNlRWxlbWVudCA9IFIuYSh7aHJlZjogJ0phdmFTY3JpcHQnICsgJzonLCBvbkNsaWNrOiB0aGlzLm9uU2VsZWN0LmJpbmQodGhpcywgY2hvaWNlKX0sXG4gICAgICAgICAgICAgICAgUi5zcGFuKHtjbGFzc05hbWU6ICdjaG9pY2UtbGFiZWwnfSxcbiAgICAgICAgICAgICAgICAgIGNob2ljZS5sYWJlbFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgUi5zcGFuKHtjbGFzc05hbWU6ICdjaG9pY2Utc2FtcGxlJ30sXG4gICAgICAgICAgICAgICAgICBjaG9pY2Uuc2FtcGxlXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gUi5saSh7a2V5OiBpLCBjbGFzc05hbWU6ICdjaG9pY2UnfSxcbiAgICAgICAgICAgICAgY2hvaWNlRWxlbWVudFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgICkgOiBudWxsXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgZmllbGQtdGVtcGxhdGUtY2hvaWNlcyBjb21wb25lbnRcblxuLypcbkdpdmUgYSBsaXN0IG9mIGNob2ljZXMgb2YgaXRlbSB0eXBlcyB0byBjcmVhdGUgYXMgY2hpbGRyZW4gb2YgYW4gZmllbGQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnRmllbGRUZW1wbGF0ZUNob2ljZXMnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHRoaXMucHJvcHMub25TZWxlY3QocGFyc2VJbnQoZXZlbnQudGFyZ2V0LnZhbHVlKSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgdmFyIGZpZWxkVGVtcGxhdGVzID0gY29uZmlnLmZpZWxkSXRlbUZpZWxkVGVtcGxhdGVzKGZpZWxkKTtcblxuICAgIHZhciB0eXBlQ2hvaWNlcyA9IG51bGw7XG4gICAgaWYgKGZpZWxkVGVtcGxhdGVzLmxlbmd0aCA+IDEpIHtcbiAgICAgIHR5cGVDaG9pY2VzID0gUi5zZWxlY3Qoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSwgdmFsdWU6IHRoaXMuZmllbGRUZW1wbGF0ZUluZGV4LCBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZX0sXG4gICAgICBmaWVsZFRlbXBsYXRlcy5tYXAoZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUsIGkpIHtcbiAgICAgICAgcmV0dXJuIFIub3B0aW9uKHtrZXk6IGksIHZhbHVlOiBpfSwgZmllbGRUZW1wbGF0ZS5sYWJlbCB8fCBpKTtcbiAgICAgIH0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHlwZUNob2ljZXMgPyB0eXBlQ2hvaWNlcyA6IFIuc3BhbihudWxsKTtcbiAgfVxufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgZmllbGQgY29tcG9uZW50XG5cbi8qXG5Vc2VkIGJ5IGFueSBmaWVsZHMgdG8gcHV0IHRoZSBsYWJlbCBhbmQgaGVscCB0ZXh0IGFyb3VuZCB0aGUgZmllbGQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxudmFyIENTU1RyYW5zaXRpb25Hcm91cCA9IFJlYWN0LmNyZWF0ZUZhY3RvcnkoUmVhY3QuYWRkb25zLkNTU1RyYW5zaXRpb25Hcm91cCk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnRmllbGQnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbGxhcHNlZDogdGhpcy5wcm9wcy5jb25maWcuZmllbGRJc0NvbGxhcHNlZCh0aGlzLnByb3BzLmZpZWxkKSA/IHRydWUgOiBmYWxzZVxuICAgIH07XG4gIH0sXG5cbiAgb25DbGlja0xhYmVsOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjb2xsYXBzZWQ6ICF0aGlzLnN0YXRlLmNvbGxhcHNlZFxuICAgIH0pO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG5cbiAgICBpZiAodGhpcy5wcm9wcy5wbGFpbikge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMuY2hpbGRyZW47XG4gICAgfVxuXG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHZhciBpbmRleCA9IHRoaXMucHJvcHMuaW5kZXg7XG4gICAgaWYgKCFfLmlzTnVtYmVyKGluZGV4KSkge1xuICAgICAgdmFyIGtleSA9IHRoaXMucHJvcHMuZmllbGQua2V5O1xuICAgICAgaW5kZXggPSBfLmlzTnVtYmVyKGtleSkgPyBrZXkgOiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgdmFyIGNsYXNzZXMgPSBfLmV4dGVuZCh7fSwgdGhpcy5wcm9wcy5jbGFzc2VzKTtcblxuICAgIGlmIChjb25maWcuZmllbGRJc1JlcXVpcmVkKGZpZWxkKSkge1xuICAgICAgY2xhc3Nlcy5yZXF1aXJlZCA9IHRydWU7XG5cbiAgICAgIGlmIChfLmlzVW5kZWZpbmVkKHRoaXMucHJvcHMuZmllbGQudmFsdWUpIHx8IHRoaXMucHJvcHMuZmllbGQudmFsdWUgPT09ICcnKSB7XG4gICAgICAgIGNsYXNzZXNbJ3ZhbGlkYXRpb24tZXJyb3ItcmVxdWlyZWQnXSA9IHRydWU7XG4gICAgICB9XG5cbiAgICB9IGVsc2Uge1xuICAgICAgY2xhc3Nlcy5vcHRpb25hbCA9IHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IGN4KGNsYXNzZXMpLCBzdHlsZToge2Rpc3BsYXk6IChmaWVsZC5oaWRkZW4gPyAnbm9uZScgOiAnJyl9fSxcbiAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdsYWJlbCcsIHtcbiAgICAgICAgY29uZmlnOiBjb25maWcsIGZpZWxkOiBmaWVsZCxcbiAgICAgICAgaW5kZXg6IGluZGV4LCBvbkNsaWNrOiBjb25maWcuZmllbGRJc0NvbGxhcHNpYmxlKGZpZWxkKSA/IHRoaXMub25DbGlja0xhYmVsIDogbnVsbFxuICAgICAgfSksXG4gICAgICBDU1NUcmFuc2l0aW9uR3JvdXAoe3RyYW5zaXRpb25OYW1lOiAncmV2ZWFsJ30sXG4gICAgICAgIHRoaXMuc3RhdGUuY29sbGFwc2VkID8gW10gOiBbXG4gICAgICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2hlbHAnLCB7XG4gICAgICAgICAgICBjb25maWc6IGNvbmZpZywgZmllbGQ6IGZpZWxkLFxuICAgICAgICAgICAga2V5OiAnaGVscCdcbiAgICAgICAgICB9KSxcbiAgICAgICAgICB0aGlzLnByb3BzLmNoaWxkcmVuXG4gICAgICAgIF1cbiAgICAgIClcbiAgICApO1xuICB9XG59KTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBoZWxwIGNvbXBvbmVudFxuXG4vKlxuSnVzdCB0aGUgaGVscCB0ZXh0IGJsb2NrLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0hlbHAnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBoZWxwVGV4dCA9IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkSGVscFRleHQodGhpcy5wcm9wcy5maWVsZCk7XG5cbiAgICByZXR1cm4gaGVscFRleHQgP1xuICAgICAgUi5kaXYoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSwgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw6IHtfX2h0bWw6IGhlbHBUZXh0fX0pIDpcbiAgICAgIFIuc3BhbihudWxsKTtcbiAgfVxufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgbGFiZWwgY29tcG9uZW50XG5cbi8qXG5KdXN0IHRoZSBsYWJlbCBmb3IgYSBmaWVsZC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdMYWJlbCcsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgdmFyIGZpZWxkTGFiZWwgPSBjb25maWcuZmllbGRMYWJlbChmaWVsZCk7XG5cbiAgICB2YXIgbGFiZWwgPSBudWxsO1xuICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wcy5pbmRleCA9PT0gJ251bWJlcicpIHtcbiAgICAgIGxhYmVsID0gJycgKyAodGhpcy5wcm9wcy5pbmRleCArIDEpICsgJy4nO1xuICAgICAgaWYgKGZpZWxkTGFiZWwpIHtcbiAgICAgICAgbGFiZWwgPSBsYWJlbCArICcgJyArIGZpZWxkTGFiZWw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGZpZWxkTGFiZWwgfHwgbGFiZWwpIHtcbiAgICAgIHZhciB0ZXh0ID0gbGFiZWwgfHwgZmllbGRMYWJlbDtcbiAgICAgIGlmICh0aGlzLnByb3BzLm9uQ2xpY2spIHtcbiAgICAgICAgdGV4dCA9IFIuYSh7aHJlZjogJ0phdmFTY3JpcHQnICsgJzonLCBvbkNsaWNrOiB0aGlzLnByb3BzLm9uQ2xpY2t9LCB0ZXh0KTtcbiAgICAgIH1cbiAgICAgIGxhYmVsID0gUi5sYWJlbCh7fSwgdGV4dCk7XG4gICAgfVxuXG4gICAgdmFyIHJlcXVpcmVkT3JOb3Q7XG5cbiAgICBpZiAoIWNvbmZpZy5maWVsZEhhc1ZhbHVlQ2hpbGRyZW4oZmllbGQpKSB7XG4gICAgICByZXF1aXJlZE9yTm90ID0gUi5zcGFuKHtcbiAgICAgICAgY2xhc3NOYW1lOiBjb25maWcuZmllbGRJc1JlcXVpcmVkKGZpZWxkKSA/ICdyZXF1aXJlZC10ZXh0JyA6ICdub3QtcmVxdWlyZWQtdGV4dCdcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBSLmRpdih7XG4gICAgICBjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcylcbiAgICB9LFxuICAgICAgbGFiZWwsXG4gICAgICAnICcsXG4gICAgICByZXF1aXJlZE9yTm90XG4gICAgKTtcbiAgfVxufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgbW92ZS1pdGVtLWJhY2sgY29tcG9uZW50XG5cbi8qXG5CdXR0b24gdG8gbW92ZSBhbiBpdGVtIGJhY2t3YXJkcyBpbiBsaXN0LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ01vdmVJdGVtQmFjaycsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGFiZWw6ICdbdXBdJ1xuICAgIH07XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUi5zcGFuKHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcyksIG9uQ2xpY2s6IHRoaXMucHJvcHMub25DbGlja30sIHRoaXMucHJvcHMubGFiZWwpO1xuICB9XG59KTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBtb3ZlLWl0ZW0tZm9yd2FyZCBjb21wb25lbnRcblxuLypcbkJ1dHRvbiB0byBtb3ZlIGFuIGl0ZW0gZm9yd2FyZCBpbiBhIGxpc3QuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnTW92ZUl0ZW1Gb3J3YXJkJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBsYWJlbDogJ1tkb3duXSdcbiAgICB9O1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFIuc3Bhbih7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpLCBvbkNsaWNrOiB0aGlzLnByb3BzLm9uQ2xpY2t9LCB0aGlzLnByb3BzLmxhYmVsKTtcbiAgfVxufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgb2JqZWN0LWNvbnRyb2wgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgdGhlIGl0ZW0gdHlwZSBjaG9pY2VzIGFuZCB0aGUgYWRkIGJ1dHRvbi5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdPYmplY3RDb250cm9sJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBmaWVsZFRlbXBsYXRlSW5kZXg6IDBcbiAgICB9O1xuICB9LFxuXG4gIG9uU2VsZWN0OiBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGZpZWxkVGVtcGxhdGVJbmRleDogaW5kZXhcbiAgICB9KTtcbiAgfSxcblxuICBvbkFwcGVuZDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucHJvcHMub25BcHBlbmQodGhpcy5zdGF0ZS5maWVsZFRlbXBsYXRlSW5kZXgpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG4gICAgdmFyIGZpZWxkVGVtcGxhdGVzID0gY29uZmlnLmZpZWxkQ2hpbGRGaWVsZFRlbXBsYXRlcyhmaWVsZCk7XG5cbiAgICB2YXIgdHlwZUNob2ljZXMgPSBudWxsO1xuXG4gICAgaWYgKGZpZWxkVGVtcGxhdGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHR5cGVDaG9pY2VzID0gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkLXRlbXBsYXRlLWNob2ljZXMnLCB7XG4gICAgICAgIGZpZWxkOiBmaWVsZCxcbiAgICAgICAgZmllbGRUZW1wbGF0ZUluZGV4OiB0aGlzLnN0YXRlLmZpZWxkVGVtcGxhdGVJbmRleCwgb25TZWxlY3Q6IHRoaXMub25TZWxlY3RcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpfSxcbiAgICAgIHR5cGVDaG9pY2VzLCAnICcsXG4gICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgnYWRkLWl0ZW0nLCB7b25DbGljazogdGhpcy5vbkFwcGVuZH0pXG4gICAgKTtcbiAgfVxufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgb2JqZWN0LWl0ZW0tY29udHJvbCBjb21wb25lbnRcblxuLypcblJlbmRlciB0aGUgcmVtb3ZlIGJ1dHRvbnMgZm9yIGFuIG9iamVjdCBpdGVtLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ09iamVjdEl0ZW1Db250cm9sJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIG9uUmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5wcm9wcy5vblJlbW92ZSh0aGlzLnByb3BzLml0ZW1LZXkpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKX0sXG4gICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgncmVtb3ZlLWl0ZW0nLCB7ZmllbGQ6IGZpZWxkLCBvbkNsaWNrOiB0aGlzLm9uUmVtb3ZlfSlcbiAgICApO1xuICB9XG59KTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBvYmplY3QtaXRlbS1rZXkgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgYW4gb2JqZWN0IGl0ZW0ga2V5IGVkaXRvci5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdPYmplY3RJdGVtS2V5JyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKGV2ZW50LnRhcmdldC52YWx1ZSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUi5pbnB1dCh7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpLCB0eXBlOiAndGV4dCcsIHZhbHVlOiB0aGlzLnByb3BzLmRpc3BsYXlLZXksIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlfSk7XG4gIH1cbn0pO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIG9iamVjdC1pdGVtLXZhbHVlIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIHRoZSB2YWx1ZSBvZiBhbiBvYmplY3QgaXRlbS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdPYmplY3RJdGVtVmFsdWUnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgb25DaGFuZ2VGaWVsZDogZnVuY3Rpb24gKG5ld1ZhbHVlLCBpbmZvKSB7XG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZSh0aGlzLnByb3BzLml0ZW1LZXksIG5ld1ZhbHVlLCBpbmZvKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3Nlcyl9LFxuICAgICAgY29uZmlnLmNyZWF0ZUZpZWxkRWxlbWVudCh7ZmllbGQ6IGZpZWxkLCBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZUZpZWxkLCBwbGFpbjogdHJ1ZX0pXG4gICAgKTtcbiAgfVxufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgb2JqZWN0LWl0ZW0gY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgYW4gb2JqZWN0IGl0ZW0uXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnT2JqZWN0SXRlbScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBvbkNoYW5nZUtleTogZnVuY3Rpb24gKG5ld0tleSkge1xuICAgIHRoaXMucHJvcHMub25Nb3ZlKHRoaXMucHJvcHMuaXRlbUtleSwgbmV3S2V5KTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NOYW1lKX0sXG4gICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgnb2JqZWN0LWl0ZW0ta2V5Jywge2ZpZWxkOiBmaWVsZCwgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2VLZXksIGRpc3BsYXlLZXk6IHRoaXMucHJvcHMuZGlzcGxheUtleSwgaXRlbUtleTogdGhpcy5wcm9wcy5pdGVtS2V5fSksXG4gICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgnb2JqZWN0LWl0ZW0tdmFsdWUnLCB7ZmllbGQ6IGZpZWxkLCBvbkNoYW5nZTogdGhpcy5wcm9wcy5vbkNoYW5nZSwgaXRlbUtleTogdGhpcy5wcm9wcy5pdGVtS2V5fSksXG4gICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgnb2JqZWN0LWl0ZW0tY29udHJvbCcsIHtmaWVsZDogZmllbGQsIG9uUmVtb3ZlOiB0aGlzLnByb3BzLm9uUmVtb3ZlLCBpdGVtS2V5OiB0aGlzLnByb3BzLml0ZW1LZXl9KVxuICAgICk7XG4gIH1cbn0pO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIHJlbW92ZS1pdGVtIGNvbXBvbmVudFxuXG4vKlxuUmVtb3ZlIGFuIGl0ZW0uXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnUmVtb3ZlSXRlbScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGFiZWw6ICdbcmVtb3ZlXSdcbiAgICB9O1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICBvbk1vdXNlT3ZlclJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnByb3BzLm9uTWF5YmVSZW1vdmUpIHtcbiAgICAgIHRoaXMucHJvcHMub25NYXliZVJlbW92ZSh0cnVlKTtcbiAgICB9XG4gIH0sXG5cbiAgb25Nb3VzZU91dFJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnByb3BzLm9uTWF5YmVSZW1vdmUpIHtcbiAgICAgIHRoaXMucHJvcHMub25NYXliZVJlbW92ZShmYWxzZSk7XG4gICAgfVxuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUi5zcGFuKHtcbiAgICAgIGNsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSwgb25DbGljazogdGhpcy5wcm9wcy5vbkNsaWNrLFxuICAgICAgb25Nb3VzZU92ZXI6IHRoaXMub25Nb3VzZU92ZXJSZW1vdmUsIG9uTW91c2VPdXQ6IHRoaXMub25Nb3VzZU91dFJlbW92ZVxuICAgIH0sIHRoaXMucHJvcHMubGFiZWwpO1xuICB9XG59KTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBoZWxwIGNvbXBvbmVudFxuXG4vKlxuSnVzdCB0aGUgaGVscCB0ZXh0IGJsb2NrLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ1NhbXBsZScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNob2ljZSA9IHRoaXMucHJvcHMuY2hvaWNlO1xuXG4gICAgcmV0dXJuIGNob2ljZS5zYW1wbGUgP1xuICAgICAgUi5kaXYoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc05hbWUpfSxcbiAgICAgICAgY2hvaWNlLnNhbXBsZVxuICAgICAgKSA6XG4gICAgICBSLnNwYW4obnVsbCk7XG4gIH1cbn0pO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIHNlbGVjdC12YWx1ZSBjb21wb25lbnRcblxuLypcblJlbmRlciBhIHNlbGVjdCBkcm9wZG93biBmb3IgYSBsaXN0IG9mIGNob2ljZXMuIENob2ljZXMgdmFsdWVzIGNhbiBiZSBvZiBhbnlcbnR5cGUuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdTZWxlY3RWYWx1ZScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBvbkNoYW5nZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdmFyIGNob2ljZVZhbHVlID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xuICAgIHZhciBjaG9pY2VUeXBlID0gY2hvaWNlVmFsdWUuc3Vic3RyaW5nKDAsIGNob2ljZVZhbHVlLmluZGV4T2YoJzonKSk7XG4gICAgaWYgKGNob2ljZVR5cGUgPT09ICdjaG9pY2UnKSB7XG4gICAgICB2YXIgY2hvaWNlSW5kZXggPSBjaG9pY2VWYWx1ZS5zdWJzdHJpbmcoY2hvaWNlVmFsdWUuaW5kZXhPZignOicpICsgMSk7XG4gICAgICBjaG9pY2VJbmRleCA9IHBhcnNlSW50KGNob2ljZUluZGV4KTtcbiAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UodGhpcy5wcm9wcy5jaG9pY2VzW2Nob2ljZUluZGV4XS52YWx1ZSk7XG4gICAgfVxuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY2hvaWNlcyA9IHRoaXMucHJvcHMuY2hvaWNlcyB8fCBbXTtcblxuICAgIHZhciBjaG9pY2VzT3JMb2FkaW5nO1xuXG4gICAgaWYgKGNob2ljZXMubGVuZ3RoID09PSAxICYmIGNob2ljZXNbMF0udmFsdWUgPT09ICcvLy9sb2FkaW5nLy8vJykge1xuICAgICAgY2hvaWNlc09yTG9hZGluZyA9IFIuZGl2KHt9LFxuICAgICAgICAnTG9hZGluZyBjaG9pY2VzLi4uJ1xuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuXG4gICAgICB2YXIgdmFsdWUgPSB0aGlzLnByb3BzLmZpZWxkLnZhbHVlICE9PSB1bmRlZmluZWQgPyB0aGlzLnByb3BzLmZpZWxkLnZhbHVlIDogJyc7XG5cbiAgICAgIGNob2ljZXMgPSBjaG9pY2VzLm1hcChmdW5jdGlvbiAoY2hvaWNlLCBpKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgY2hvaWNlVmFsdWU6ICdjaG9pY2U6JyArIGksXG4gICAgICAgICAgdmFsdWU6IGNob2ljZS52YWx1ZSxcbiAgICAgICAgICBsYWJlbDogY2hvaWNlLmxhYmVsXG4gICAgICAgIH07XG4gICAgICB9KTtcblxuICAgICAgdmFyIHZhbHVlQ2hvaWNlID0gXy5maW5kKGNob2ljZXMsIGZ1bmN0aW9uIChjaG9pY2UpIHtcbiAgICAgICAgcmV0dXJuIGNob2ljZS52YWx1ZSA9PT0gdmFsdWU7XG4gICAgICB9KTtcblxuICAgICAgaWYgKHZhbHVlQ2hvaWNlID09PSB1bmRlZmluZWQpIHtcblxuICAgICAgICB2YXIgbGFiZWwgPSB2YWx1ZTtcbiAgICAgICAgaWYgKCFfLmlzU3RyaW5nKHZhbHVlKSkge1xuICAgICAgICAgIGxhYmVsID0gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHZhbHVlQ2hvaWNlID0ge1xuICAgICAgICAgIGNob2ljZVZhbHVlOiAndmFsdWU6JyxcbiAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgbGFiZWw6IGxhYmVsXG4gICAgICAgIH07XG4gICAgICAgIGNob2ljZXMgPSBbdmFsdWVDaG9pY2VdLmNvbmNhdChjaG9pY2VzKTtcbiAgICAgIH1cblxuICAgICAgY2hvaWNlc09yTG9hZGluZyA9IFIuc2VsZWN0KHtcbiAgICAgICAgY2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpLFxuICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgICAgdmFsdWU6IHZhbHVlQ2hvaWNlLmNob2ljZVZhbHVlLFxuICAgICAgICBvbkZvY3VzOiB0aGlzLm9uRm9jdXNBY3Rpb24sXG4gICAgICAgIG9uQmx1cjogdGhpcy5vbkJsdXJBY3Rpb25cbiAgICAgIH0sXG4gICAgICBjaG9pY2VzLm1hcChmdW5jdGlvbiAoY2hvaWNlLCBpKSB7XG4gICAgICAgIHJldHVybiBSLm9wdGlvbih7XG4gICAgICAgICAga2V5OiBpLFxuICAgICAgICAgIHZhbHVlOiBjaG9pY2UuY2hvaWNlVmFsdWVcbiAgICAgICAgfSwgY2hvaWNlLmxhYmVsKTtcbiAgICAgIH0uYmluZCh0aGlzKSlcbiAgICApO1xuICB9XG5cbiAgcmV0dXJuIGNob2ljZXNPckxvYWRpbmc7XG59XG59KTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBkZWZhdWx0LWNvbmZpZ1xuXG4vKlxuVGhpcyBpcyB0aGUgZGVmYXVsdCBjb25maWd1cmF0aW9uIGZvciBmb3JtYXRpYy4gSXQncyBqdXN0IGFuIG9iamVjdCB3aXRoIGEgYnVuY2hcbm9mIGJlaGF2aW9yIGZ1bmN0aW9ucyB0aGF0IGFyZSBwYXNzZWQgaW50byBhbGwgdGhlIGNvbXBvbmVudHMuIFNvIHRvIGNoYW5nZVxuZm9ybWF0aWMncyBiZWhhdmlvciwgaXQncyBzaW1wbGUgbWF0dGVyIG9mIGNsb25pbmcgdGhpcyBvYmplY3QgYW5kIG92ZXJyaWRpbmdcbnRoZSBtZXRob2RzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgLy8gRmllbGQgZWxlbWVudCBmYWN0b3JpZXMuIENyZWF0ZSBmaWVsZCBlbGVtZW50cy5cblxuICBjcmVhdGVFbGVtZW50X0ZpZWxkczogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL2ZpZWxkcycpKSxcblxuICBjcmVhdGVFbGVtZW50X1N0cmluZzogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL3N0cmluZycpKSxcblxuICBjcmVhdGVFbGVtZW50X1NpbmdsZUxpbmVTdHJpbmc6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9zaW5nbGUtbGluZS1zdHJpbmcnKSksXG5cbiAgY3JlYXRlRWxlbWVudF9TZWxlY3Q6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9zZWxlY3QnKSksXG5cbiAgY3JlYXRlRWxlbWVudF9Cb29sZWFuOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvYm9vbGVhbicpKSxcblxuICBjcmVhdGVFbGVtZW50X0NoZWNrYm94Qm9vbGVhbjogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL2NoZWNrYm94LWJvb2xlYW4nKSksXG5cbiAgY3JlYXRlRWxlbWVudF9QcmV0dHlUZXh0OiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvcHJldHR5LXRleHQnKSksXG5cbiAgY3JlYXRlRWxlbWVudF9BcnJheTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL2FycmF5JykpLFxuXG4gIGNyZWF0ZUVsZW1lbnRfQ2hlY2tib3hBcnJheTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL2NoZWNrYm94LWFycmF5JykpLFxuXG4gIGNyZWF0ZUVsZW1lbnRfT2JqZWN0OiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvb2JqZWN0JykpLFxuXG4gIGNyZWF0ZUVsZW1lbnRfSnNvbjogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL2pzb24nKSksXG5cbiAgY3JlYXRlRWxlbWVudF9Vbmtub3duRmllbGQ6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy91bmtub3duJykpLFxuXG4gIGNyZWF0ZUVsZW1lbnRfQ29weTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL2NvcHknKSksXG5cblxuICAvLyBPdGhlciBlbGVtZW50IGZhY3Rvcmllcy4gQ3JlYXRlIGhlbHBlciBlbGVtZW50cyB1c2VkIGJ5IGZpZWxkIGNvbXBvbmVudHMuXG5cbiAgY3JlYXRlRWxlbWVudF9GaWVsZDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9maWVsZCcpKSxcblxuICBjcmVhdGVFbGVtZW50X0xhYmVsOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2xhYmVsJykpLFxuXG4gIGNyZWF0ZUVsZW1lbnRfSGVscDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9oZWxwJykpLFxuXG4gIGNyZWF0ZUVsZW1lbnRfQ2hvaWNlczogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9jaG9pY2VzJykpLFxuXG4gIGNyZWF0ZUVsZW1lbnRfQXJyYXlDb250cm9sOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2FycmF5LWNvbnRyb2wnKSksXG5cbiAgY3JlYXRlRWxlbWVudF9BcnJheUl0ZW1Db250cm9sOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2FycmF5LWl0ZW0tY29udHJvbCcpKSxcblxuICBjcmVhdGVFbGVtZW50X0FycmF5SXRlbVZhbHVlOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2FycmF5LWl0ZW0tdmFsdWUnKSksXG5cbiAgY3JlYXRlRWxlbWVudF9BcnJheUl0ZW06IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvYXJyYXktaXRlbScpKSxcblxuICBjcmVhdGVFbGVtZW50X0ZpZWxkVGVtcGxhdGVDaG9pY2VzOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2ZpZWxkLXRlbXBsYXRlLWNob2ljZXMnKSksXG5cbiAgY3JlYXRlRWxlbWVudF9BZGRJdGVtOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2FkZC1pdGVtJykpLFxuXG4gIGNyZWF0ZUVsZW1lbnRfUmVtb3ZlSXRlbTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9yZW1vdmUtaXRlbScpKSxcblxuICBjcmVhdGVFbGVtZW50X01vdmVJdGVtRm9yd2FyZDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9tb3ZlLWl0ZW0tZm9yd2FyZCcpKSxcblxuICBjcmVhdGVFbGVtZW50X01vdmVJdGVtQmFjazogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9tb3ZlLWl0ZW0tYmFjaycpKSxcblxuICBjcmVhdGVFbGVtZW50X09iamVjdENvbnRyb2w6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWNvbnRyb2wnKSksXG5cbiAgY3JlYXRlRWxlbWVudF9PYmplY3RJdGVtQ29udHJvbDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9vYmplY3QtaXRlbS1jb250cm9sJykpLFxuXG4gIGNyZWF0ZUVsZW1lbnRfT2JqZWN0SXRlbVZhbHVlOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL29iamVjdC1pdGVtLXZhbHVlJykpLFxuXG4gIGNyZWF0ZUVsZW1lbnRfT2JqZWN0SXRlbUtleTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9vYmplY3QtaXRlbS1rZXknKSksXG5cbiAgY3JlYXRlRWxlbWVudF9PYmplY3RJdGVtOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL29iamVjdC1pdGVtJykpLFxuXG4gIGNyZWF0ZUVsZW1lbnRfU2VsZWN0VmFsdWU6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvc2VsZWN0LXZhbHVlJykpLFxuXG4gIGNyZWF0ZUVsZW1lbnRfU2FtcGxlOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL3NhbXBsZScpKSxcblxuXG4gIC8vIEZpZWxkIGRlZmF1bHQgdmFsdWUgZmFjdG9yaWVzLiBHaXZlIGEgZGVmYXVsdCB2YWx1ZSBmb3IgYSBzcGVjaWZpYyB0eXBlLlxuXG4gIGNyZWF0ZURlZmF1bHRWYWx1ZV9TdHJpbmc6IGZ1bmN0aW9uICgvKiBmaWVsZFRlbXBsYXRlICovKSB7XG4gICAgcmV0dXJuICcnO1xuICB9LFxuXG4gIGNyZWF0ZURlZmF1bHRWYWx1ZV9PYmplY3Q6IGZ1bmN0aW9uICgvKiBmaWVsZFRlbXBsYXRlICovKSB7XG4gICAgcmV0dXJuIHt9O1xuICB9LFxuXG4gIGNyZWF0ZURlZmF1bHRWYWx1ZV9BcnJheTogZnVuY3Rpb24gKC8qIGZpZWxkVGVtcGxhdGUgKi8pIHtcbiAgICByZXR1cm4gW107XG4gIH0sXG5cbiAgY3JlYXRlRGVmYXVsdFZhbHVlX0Jvb2xlYW46IGZ1bmN0aW9uICgvKiBmaWVsZFRlbXBsYXRlICovKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuXG4gIGNyZWF0ZURlZmF1bHRWYWx1ZV9GaWVsZHM6IHV0aWxzLmRlbGVnYXRlVG8oJ2NyZWF0ZURlZmF1bHRWYWx1ZV9PYmplY3QnKSxcblxuICBjcmVhdGVEZWZhdWx0VmFsdWVfU2luZ2xlTGluZVN0cmluZzogdXRpbHMuZGVsZWdhdGVUbygnY3JlYXRlRGVmYXVsdFZhbHVlX1N0cmluZycpLFxuXG4gIGNyZWF0ZURlZmF1bHRWYWx1ZV9TZWxlY3Q6IHV0aWxzLmRlbGVnYXRlVG8oJ2NyZWF0ZURlZmF1bHRWYWx1ZV9TdHJpbmcnKSxcblxuICBjcmVhdGVEZWZhdWx0VmFsdWVfSnNvbjogdXRpbHMuZGVsZWdhdGVUbygnY3JlYXRlRGVmYXVsdFZhbHVlX09iamVjdCcpLFxuXG4gIGNyZWF0ZURlZmF1bHRWYWx1ZV9DaGVja2JveEFycmF5OiB1dGlscy5kZWxlZ2F0ZVRvKCdjcmVhdGVEZWZhdWx0VmFsdWVfQXJyYXknKSxcblxuICBjcmVhdGVEZWZhdWx0VmFsdWVfQ2hlY2tib3hCb29sZWFuOiB1dGlscy5kZWxlZ2F0ZVRvKCdjcmVhdGVEZWZhdWx0VmFsdWVfQm9vbGVhbicpLFxuXG5cbiAgLy8gRmllbGQgdmFsdWUgY29lcmNlcnMuIENvZXJjZSBhIHZhbHVlIGludG8gYSB2YWx1ZSBhcHByb3ByaWF0ZSBmb3IgYSBzcGVjaWZpYyB0eXBlLlxuXG4gIGNvZXJjZVZhbHVlX1N0cmluZzogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUsIHZhbHVlKSB7XG4gICAgaWYgKF8uaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIGlmIChfLmlzVW5kZWZpbmVkKHZhbHVlKSB8fCB2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICB9LFxuXG4gIGNvZXJjZVZhbHVlX09iamVjdDogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUsIHZhbHVlKSB7XG4gICAgaWYgKCFfLmlzT2JqZWN0KHZhbHVlKSkge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG4gIH0sXG5cbiAgY29lcmNlVmFsdWVfQXJyYXk6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlLCB2YWx1ZSkge1xuICAgIGlmICghXy5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgcmV0dXJuIFt2YWx1ZV07XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbiAgfSxcblxuICBjb2VyY2VWYWx1ZV9Cb29sZWFuOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSwgdmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5jb2VyY2VWYWx1ZVRvQm9vbGVhbih2YWx1ZSk7XG4gIH0sXG5cbiAgY29lcmNlVmFsdWVfRmllbGRzOiB1dGlscy5kZWxlZ2F0ZVRvKCdjb2VyY2VWYWx1ZV9PYmplY3QnKSxcblxuICBjb2VyY2VWYWx1ZV9TaW5nbGVMaW5lU3RyaW5nOiB1dGlscy5kZWxlZ2F0ZVRvKCdjb2VyY2VWYWx1ZV9TdHJpbmcnKSxcblxuICBjb2VyY2VWYWx1ZV9TZWxlY3Q6IHV0aWxzLmRlbGVnYXRlVG8oJ2NvZXJjZVZhbHVlX1N0cmluZycpLFxuXG4gIGNvZXJjZVZhbHVlX0pzb246IHV0aWxzLmRlbGVnYXRlVG8oJ2NvZXJjZVZhbHVlX09iamVjdCcpLFxuXG4gIGNvZXJjZVZhbHVlX0NoZWNrYm94QXJyYXk6IHV0aWxzLmRlbGVnYXRlVG8oJ2NvZXJjZVZhbHVlX0FycmF5JyksXG5cbiAgY29lcmNlVmFsdWVfQ2hlY2tib3hCb29sZWFuOiB1dGlscy5kZWxlZ2F0ZVRvKCdjb2VyY2VWYWx1ZV9Cb29sZWFuJyksXG5cblxuICAvLyBGaWVsZCBjaGlsZCBmaWVsZHMgZmFjdG9yaWVzLCBzbyBzb21lIHR5cGVzIGNhbiBoYXZlIGR5bmFtaWMgY2hpbGRyZW4uXG5cbiAgY3JlYXRlQ2hpbGRGaWVsZHNfQXJyYXk6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzO1xuXG4gICAgcmV0dXJuIGZpZWxkLnZhbHVlLm1hcChmdW5jdGlvbiAoYXJyYXlJdGVtLCBpKSB7XG4gICAgICB2YXIgY2hpbGRGaWVsZFRlbXBsYXRlID0gY29uZmlnLmNoaWxkRmllbGRUZW1wbGF0ZUZvclZhbHVlKGZpZWxkLCBhcnJheUl0ZW0pO1xuXG4gICAgICB2YXIgY2hpbGRGaWVsZCA9IGNvbmZpZy5jcmVhdGVDaGlsZEZpZWxkKGZpZWxkLCB7XG4gICAgICAgIGZpZWxkVGVtcGxhdGU6IGNoaWxkRmllbGRUZW1wbGF0ZSwga2V5OiBpLCBmaWVsZEluZGV4OiBpLCB2YWx1ZTogYXJyYXlJdGVtXG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGNoaWxkRmllbGQ7XG4gICAgfSk7XG4gIH0sXG5cbiAgY3JlYXRlQ2hpbGRGaWVsZHNfT2JqZWN0OiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcztcblxuICAgIHJldHVybiBPYmplY3Qua2V5cyhmaWVsZC52YWx1ZSkubWFwKGZ1bmN0aW9uIChrZXksIGkpIHtcbiAgICAgIHZhciBjaGlsZEZpZWxkVGVtcGxhdGUgPSBjb25maWcuY2hpbGRGaWVsZFRlbXBsYXRlRm9yVmFsdWUoZmllbGQsIGZpZWxkLnZhbHVlW2tleV0pO1xuXG4gICAgICB2YXIgY2hpbGRGaWVsZCA9IGNvbmZpZy5jcmVhdGVDaGlsZEZpZWxkKGZpZWxkLCB7XG4gICAgICAgIGZpZWxkVGVtcGxhdGU6IGNoaWxkRmllbGRUZW1wbGF0ZSwga2V5OiBrZXksIGZpZWxkSW5kZXg6IGksIHZhbHVlOiBmaWVsZC52YWx1ZVtrZXldXG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGNoaWxkRmllbGQ7XG4gICAgfSk7XG4gIH0sXG5cbiAgLy8gQ2hlY2sgaWYgdGhlcmUgaXMgYSBmYWN0b3J5IGZvciB0aGUgbmFtZS5cbiAgaGFzRWxlbWVudEZhY3Rvcnk6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXM7XG5cbiAgICByZXR1cm4gY29uZmlnWydjcmVhdGVFbGVtZW50XycgKyBuYW1lXSA/IHRydWUgOiBmYWxzZTtcbiAgfSxcblxuICAvLyBDcmVhdGUgYW4gZWxlbWVudCBnaXZlbiBhIG5hbWUsIHByb3BzLCBhbmQgY2hpbGRyZW4uXG4gIGNyZWF0ZUVsZW1lbnQ6IGZ1bmN0aW9uIChuYW1lLCBwcm9wcywgY2hpbGRyZW4pIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcztcblxuICAgIGlmICghcHJvcHMuY29uZmlnKSB7XG4gICAgICBwcm9wcyA9IF8uZXh0ZW5kKHt9LCBwcm9wcywge2NvbmZpZzogY29uZmlnfSk7XG4gICAgfVxuXG4gICAgbmFtZSA9IGNvbmZpZy5lbGVtZW50TmFtZShuYW1lKTtcblxuICAgIGlmIChjb25maWdbJ2NyZWF0ZUVsZW1lbnRfJyArIG5hbWVdKSB7XG4gICAgICByZXR1cm4gY29uZmlnWydjcmVhdGVFbGVtZW50XycgKyBuYW1lXShwcm9wcywgY2hpbGRyZW4pO1xuICAgIH1cblxuICAgIGlmIChuYW1lICE9PSAnVW5rbm93bicpIHtcbiAgICAgIGlmIChjb25maWcuaGFzRWxlbWVudEZhY3RvcnkoJ1Vua25vd24nKSkge1xuICAgICAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ1Vua25vd24nLCBwcm9wcywgY2hpbGRyZW4pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRocm93IG5ldyBFcnJvcignRmFjdG9yeSBub3QgZm91bmQgZm9yOiAnICsgbmFtZSk7XG4gIH0sXG5cbiAgLy8gQ3JlYXRlIGEgZmllbGQgZWxlbWVudCBnaXZlbiBzb21lIHByb3BzLiBVc2UgY29udGV4dCB0byBkZXRlcm1pbmUgbmFtZS5cbiAgY3JlYXRlRmllbGRFbGVtZW50OiBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcztcblxuICAgIHZhciBuYW1lID0gY29uZmlnLmZpZWxkVHlwZU5hbWUocHJvcHMuZmllbGQpO1xuXG4gICAgaWYgKGNvbmZpZy5oYXNFbGVtZW50RmFjdG9yeShuYW1lKSkge1xuICAgICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KG5hbWUsIHByb3BzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ1Vua25vd25GaWVsZCcsIHByb3BzKTtcbiAgfSxcblxuICAvLyBSZW5kZXIgdGhlIHJvb3QgZm9ybWF0aWMgY29tcG9uZW50XG4gIHJlbmRlckZvcm1hdGljQ29tcG9uZW50OiBmdW5jdGlvbiAoY29tcG9uZW50KSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXM7XG4gICAgdmFyIHByb3BzID0gY29tcG9uZW50LnByb3BzO1xuXG4gICAgdmFyIGZpZWxkID0gY29uZmlnLmNyZWF0ZVJvb3RGaWVsZChwcm9wcyk7XG5cbiAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogJ2Zvcm1hdGljJ30sXG4gICAgICBjb25maWcuY3JlYXRlRmllbGRFbGVtZW50KHtmaWVsZDogZmllbGQsIG9uQ2hhbmdlOiBjb21wb25lbnQub25DaGFuZ2UsIG9uQWN0aW9uOiBjb21wb25lbnQub25BY3Rpb259KVxuICAgICk7XG4gIH0sXG5cbiAgLy8gUmVuZGVyIGFueSBjb21wb25lbnQuXG4gIHJlbmRlckNvbXBvbmVudDogZnVuY3Rpb24gKGNvbXBvbmVudCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzO1xuXG4gICAgdmFyIG5hbWUgPSBjb21wb25lbnQuY29uc3RydWN0b3IuZGlzcGxheU5hbWU7XG5cbiAgICBpZiAoY29uZmlnWydyZW5kZXJDb21wb25lbnRfJyArIG5hbWVdKSB7XG4gICAgICByZXR1cm4gY29uZmlnWydyZW5kZXJDb21wb25lbnRfJyArIG5hbWVdKGNvbXBvbmVudCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbXBvbmVudC5yZW5kZXJEZWZhdWx0KCk7XG4gIH0sXG5cbiAgLy8gUmVuZGVyIGZpZWxkIGNvbXBvbmVudHMuXG4gIHJlbmRlckZpZWxkQ29tcG9uZW50OiBmdW5jdGlvbiAoY29tcG9uZW50KSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXM7XG5cbiAgICByZXR1cm4gY29uZmlnLnJlbmRlckNvbXBvbmVudChjb21wb25lbnQpO1xuICB9LFxuXG4gIC8vIE5vcm1hbGl6ZSBhbiBlbGVtZW50IG5hbWUuXG4gIGVsZW1lbnROYW1lOiBmdW5jdGlvbiAobmFtZSkge1xuICAgIHJldHVybiB1dGlscy5kYXNoVG9QYXNjYWwobmFtZSk7XG4gIH0sXG5cbiAgLy8gVHlwZSBhbGlhc2VzLlxuXG4gIGFsaWFzX0RpY3Q6ICdPYmplY3QnLFxuXG4gIGFsaWFzX0Jvb2w6ICdCb29sZWFuJyxcblxuICBhbGlhc19QcmV0dHlUZXh0YXJlYTogJ1ByZXR0eVRleHQnLFxuXG4gIGFsaWFzX1NpbmdsZUxpbmVTdHJpbmc6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgaWYgKGZpZWxkVGVtcGxhdGUucmVwbGFjZUNob2ljZXMpIHtcbiAgICAgIHJldHVybiAnUHJldHR5VGV4dCc7XG4gICAgfSBlbHNlIGlmIChmaWVsZFRlbXBsYXRlLmNob2ljZXMpIHtcbiAgICAgIHJldHVybiAnU2VsZWN0JztcbiAgICB9XG4gICAgcmV0dXJuICdTaW5nbGVMaW5lU3RyaW5nJztcbiAgfSxcblxuICBhbGlhc19TdHJpbmc6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXM7XG5cbiAgICBpZiAoZmllbGRUZW1wbGF0ZS5yZXBsYWNlQ2hvaWNlcykge1xuICAgICAgcmV0dXJuICdQcmV0dHlUZXh0JztcbiAgICB9IGVsc2UgaWYgKGZpZWxkVGVtcGxhdGUuY2hvaWNlcykge1xuICAgICAgcmV0dXJuICdTZWxlY3QnO1xuICAgIH0gZWxzZSBpZiAoY29uZmlnLmZpZWxkVGVtcGxhdGVJc1NpbmdsZUxpbmUoZmllbGRUZW1wbGF0ZSkpIHtcbiAgICAgIHJldHVybiAnU2luZ2xlTGluZVN0cmluZyc7XG4gICAgfVxuICAgIHJldHVybiAnU3RyaW5nJztcbiAgfSxcblxuICBhbGlhc19UZXh0OiB1dGlscy5kZWxlZ2F0ZVRvKCdhbGlhc19TdHJpbmcnKSxcblxuICBhbGlhc19Vbmljb2RlOiB1dGlscy5kZWxlZ2F0ZVRvKCdhbGlhc19TaW5nbGVMaW5lU3RyaW5nJyksXG5cbiAgYWxpYXNfU3RyOiB1dGlscy5kZWxlZ2F0ZVRvKCdhbGlhc19TaW5nbGVMaW5lU3RyaW5nJyksXG5cbiAgYWxpYXNfTGlzdDogJ0FycmF5JyxcblxuICBhbGlhc19DaGVja2JveExpc3Q6ICdDaGVja2JveEFycmF5JyxcblxuICBhbGlhc19GaWVsZHNldDogJ0ZpZWxkcycsXG5cbiAgYWxpYXNfQ2hlY2tib3g6ICdDaGVja2JveEJvb2xlYW4nLFxuXG4gIC8vIEZpZWxkIGZhY3RvcnlcblxuICAvLyBHaXZlbiBhIGZpZWxkLCBleHBhbmQgYWxsIGNoaWxkIGZpZWxkcyByZWN1cnNpdmVseSB0byBnZXQgdGhlIGRlZmF1bHRcbiAgLy8gdmFsdWVzIG9mIGFsbCBmaWVsZHMuXG4gIGluZmxhdGVGaWVsZFZhbHVlOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcztcblxuICAgIGlmIChjb25maWcuZmllbGRIYXNWYWx1ZUNoaWxkcmVuKGZpZWxkKSkge1xuICAgICAgdmFyIHZhbHVlID0gXy5jbG9uZShmaWVsZC52YWx1ZSk7XG4gICAgICB2YXIgY2hpbGRGaWVsZHMgPSBjb25maWcuY3JlYXRlQ2hpbGRGaWVsZHMoZmllbGQpO1xuICAgICAgY2hpbGRGaWVsZHMuZm9yRWFjaChmdW5jdGlvbiAoY2hpbGRGaWVsZCkge1xuICAgICAgICBpZiAoY29uZmlnLmlzS2V5KGNoaWxkRmllbGQua2V5KSkge1xuICAgICAgICAgIHZhbHVlW2NoaWxkRmllbGQua2V5XSA9IGNvbmZpZy5pbmZsYXRlRmllbGRWYWx1ZShjaGlsZEZpZWxkKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmaWVsZC52YWx1ZTtcbiAgICB9XG4gIH0sXG5cbiAgLy8gSW5pdGlhbGl6ZSB0aGUgcm9vdCBmaWVsZC5cbiAgaW5pdFJvb3RGaWVsZDogZnVuY3Rpb24gKC8qIGZpZWxkLCBwcm9wcyAqLykge1xuICB9LFxuXG4gIC8vIEluaXRpYWxpemUgZXZlcnkgZmllbGQuXG4gIGluaXRGaWVsZDogZnVuY3Rpb24gKC8qIGZpZWxkICovKSB7XG4gIH0sXG5cbiAgLy8gSWYgYW4gYXJyYXkgb2YgZmllbGQgdGVtcGxhdGVzIGFyZSBwYXNzZWQgaW4sIHRoaXMgbWV0aG9kIGlzIHVzZWQgdG9cbiAgLy8gd3JhcCB0aGUgZmllbGRzIGluc2lkZSBhIHNpbmdsZSByb290IGZpZWxkIHRlbXBsYXRlLlxuICB3cmFwRmllbGRUZW1wbGF0ZXM6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlcykge1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiAnZmllbGRzJyxcbiAgICAgIHBsYWluOiB0cnVlLFxuICAgICAgZmllbGRzOiBmaWVsZFRlbXBsYXRlc1xuICAgIH07XG4gIH0sXG5cbiAgLy8gR2l2ZW4gdGhlIHByb3BzIHRoYXQgYXJlIHBhc3NlZCBpbiwgY3JlYXRlIHRoZSByb290IGZpZWxkLlxuICBjcmVhdGVSb290RmllbGQ6IGZ1bmN0aW9uIChwcm9wcykge1xuICAgIHZhciBjb25maWcgPSB0aGlzO1xuXG4gICAgdmFyIGZpZWxkVGVtcGxhdGUgPSBwcm9wcy5maWVsZFRlbXBsYXRlIHx8IHByb3BzLmZpZWxkVGVtcGxhdGVzIHx8IHByb3BzLmZpZWxkIHx8IHByb3BzLmZpZWxkcztcbiAgICB2YXIgdmFsdWUgPSBwcm9wcy52YWx1ZTtcblxuICAgIGlmICghZmllbGRUZW1wbGF0ZSkge1xuICAgICAgZmllbGRUZW1wbGF0ZSA9IGNvbmZpZy5jcmVhdGVGaWVsZFRlbXBsYXRlRnJvbVZhbHVlKHZhbHVlKTtcbiAgICB9XG5cbiAgICBpZiAoXy5pc0FycmF5KGZpZWxkVGVtcGxhdGUpKSB7XG4gICAgICBmaWVsZFRlbXBsYXRlID0gY29uZmlnLndyYXBGaWVsZFRlbXBsYXRlcyhmaWVsZFRlbXBsYXRlKTtcbiAgICB9XG5cbiAgICB2YXIgZmllbGQgPSBfLmV4dGVuZCh7fSwgZmllbGRUZW1wbGF0ZSwge3Jhd0ZpZWxkVGVtcGxhdGU6IGZpZWxkVGVtcGxhdGV9KTtcbiAgICBpZiAoY29uZmlnLmhhc1ZhbHVlKGZpZWxkVGVtcGxhdGUsIHZhbHVlKSkge1xuICAgICAgZmllbGQudmFsdWUgPSBjb25maWcuY29lcmNlVmFsdWUoZmllbGRUZW1wbGF0ZSwgdmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBmaWVsZC52YWx1ZSA9IGNvbmZpZy5jcmVhdGVEZWZhdWx0VmFsdWUoZmllbGRUZW1wbGF0ZSk7XG4gICAgfVxuXG4gICAgY29uZmlnLmluaXRSb290RmllbGQoZmllbGQsIHByb3BzKTtcbiAgICBjb25maWcuaW5pdEZpZWxkKGZpZWxkKTtcblxuICAgIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCBjb25maWcuaXNFbXB0eU9iamVjdCh2YWx1ZSkgfHwgXy5pc1VuZGVmaW5lZCh2YWx1ZSkpIHtcbiAgICAgIGZpZWxkLnZhbHVlID0gY29uZmlnLmluZmxhdGVGaWVsZFZhbHVlKGZpZWxkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmllbGQ7XG4gIH0sXG5cbiAgLy8gR2l2ZW4gdGhlIHByb3BzIHRoYXQgYXJlIHBhc3NlZCBpbiwgY3JlYXRlIHRoZSB2YWx1ZSB0aGF0IHdpbGwgYmUgZGlzcGxheWVkXG4gIC8vIGJ5IGFsbCB0aGUgY29tcG9uZW50cy5cbiAgY3JlYXRlUm9vdFZhbHVlOiBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcztcblxuICAgIHZhciBmaWVsZCA9IGNvbmZpZy5jcmVhdGVSb290RmllbGQocHJvcHMpO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5pbmZsYXRlRmllbGRWYWx1ZShmaWVsZCk7XG4gIH0sXG5cbiAgLy8gQ3JlYXRlIGR5bmFtaWMgY2hpbGQgZmllbGRzIGZvciBhIGZpZWxkLlxuICBjcmVhdGVDaGlsZEZpZWxkczogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXM7XG5cbiAgICB2YXIgdHlwZU5hbWUgPSBjb25maWcuZmllbGRUeXBlTmFtZShmaWVsZCk7XG5cbiAgICBpZiAoY29uZmlnWydjcmVhdGVDaGlsZEZpZWxkc18nICsgdHlwZU5hbWVdKSB7XG4gICAgICByZXR1cm4gY29uZmlnWydjcmVhdGVDaGlsZEZpZWxkc18nICsgdHlwZU5hbWVdKGZpZWxkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29uZmlnLmZpZWxkQ2hpbGRGaWVsZFRlbXBsYXRlcyhmaWVsZCkubWFwKGZ1bmN0aW9uIChjaGlsZEZpZWxkLCBpKSB7XG4gICAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUNoaWxkRmllbGQoZmllbGQsIHtcbiAgICAgICAgZmllbGRUZW1wbGF0ZTogY2hpbGRGaWVsZCwga2V5OiBjaGlsZEZpZWxkLmtleSwgZmllbGRJbmRleDogaSwgdmFsdWU6IGZpZWxkLnZhbHVlW2NoaWxkRmllbGQua2V5XVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0sXG5cbiAgLy8gQ3JlYXRlIGEgc2luZ2xlIGNoaWxkIGZpZWxkIGZvciBhIHBhcmVudCBmaWVsZC5cbiAgY3JlYXRlQ2hpbGRGaWVsZDogZnVuY3Rpb24gKHBhcmVudEZpZWxkLCBvcHRpb25zKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXM7XG5cbiAgICB2YXIgY2hpbGRWYWx1ZSA9IG9wdGlvbnMudmFsdWU7XG5cbiAgICB2YXIgY2hpbGRGaWVsZCA9IF8uZXh0ZW5kKHt9LCBvcHRpb25zLmZpZWxkVGVtcGxhdGUsIHtcbiAgICAgIGtleTogb3B0aW9ucy5rZXksIHBhcmVudDogcGFyZW50RmllbGQsIGZpZWxkSW5kZXg6IG9wdGlvbnMuZmllbGRJbmRleCxcbiAgICAgIHJhd0ZpZWxkVGVtcGxhdGU6IG9wdGlvbnMuZmllbGRUZW1wbGF0ZVxuICAgIH0pO1xuXG4gICAgaWYgKGNvbmZpZy5oYXNWYWx1ZShvcHRpb25zLmZpZWxkVGVtcGxhdGUsIGNoaWxkVmFsdWUpKSB7XG4gICAgICBjaGlsZEZpZWxkLnZhbHVlID0gY29uZmlnLmNvZXJjZVZhbHVlKG9wdGlvbnMuZmllbGRUZW1wbGF0ZSwgY2hpbGRWYWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNoaWxkRmllbGQudmFsdWUgPSBjb25maWcuY3JlYXRlRGVmYXVsdFZhbHVlKG9wdGlvbnMuZmllbGRUZW1wbGF0ZSk7XG4gICAgfVxuXG4gICAgY29uZmlnLmluaXRGaWVsZChjaGlsZEZpZWxkKTtcblxuICAgIHJldHVybiBjaGlsZEZpZWxkO1xuICB9LFxuXG4gIC8vIENyZWF0ZSBhIHRlbXBvcmFyeSBmaWVsZCBhbmQgZXh0cmFjdCBpdHMgdmFsdWUuXG4gIGNyZWF0ZU5ld0NoaWxkRmllbGRWYWx1ZTogZnVuY3Rpb24gKHBhcmVudEZpZWxkLCBpdGVtRmllbGRJbmRleCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzO1xuXG4gICAgdmFyIGNoaWxkRmllbGRUZW1wbGF0ZSA9IGNvbmZpZy5maWVsZEl0ZW1GaWVsZFRlbXBsYXRlcyhwYXJlbnRGaWVsZClbaXRlbUZpZWxkSW5kZXhdO1xuXG4gICAgdmFyIG5ld1ZhbHVlID0gY29uZmlnLmZpZWxkVGVtcGxhdGVWYWx1ZShjaGlsZEZpZWxkVGVtcGxhdGUpO1xuXG4gICAgLy8gSnVzdCBhIHBsYWNlaG9sZGVyIGtleS4gU2hvdWxkIG5vdCBiZSBpbXBvcnRhbnQuXG4gICAgdmFyIGtleSA9ICdfX3Vua25vd25fa2V5X18nO1xuXG4gICAgaWYgKF8uaXNBcnJheShwYXJlbnRGaWVsZC52YWx1ZSkpIHtcbiAgICAgIC8vIEp1c3QgYSBwbGFjZWhvbGRlciBwb3NpdGlvbiBmb3IgYW4gYXJyYXkuXG4gICAgICBrZXkgPSBwYXJlbnRGaWVsZC52YWx1ZS5sZW5ndGg7XG4gICAgfVxuXG4gICAgLy8gSnVzdCBhIHBsYWNlaG9sZGVyIGZpZWxkIGluZGV4LiBTaG91bGQgbm90IGJlIGltcG9ydGFudC5cbiAgICB2YXIgZmllbGRJbmRleCA9IDA7XG4gICAgaWYgKF8uaXNPYmplY3QocGFyZW50RmllbGQudmFsdWUpKSB7XG4gICAgICBmaWVsZEluZGV4ID0gT2JqZWN0LmtleXMocGFyZW50RmllbGQudmFsdWUpLmxlbmd0aDtcbiAgICB9XG5cbiAgICB2YXIgY2hpbGRGaWVsZCA9IGNvbmZpZy5jcmVhdGVDaGlsZEZpZWxkKHBhcmVudEZpZWxkLCB7XG4gICAgICBmaWVsZFRlbXBsYXRlOiBjaGlsZEZpZWxkVGVtcGxhdGUsIGtleToga2V5LCBmaWVsZEluZGV4OiBmaWVsZEluZGV4LCB2YWx1ZTogbmV3VmFsdWVcbiAgICB9KTtcblxuICAgIG5ld1ZhbHVlID0gY29uZmlnLmluZmxhdGVGaWVsZFZhbHVlKGNoaWxkRmllbGQpO1xuXG4gICAgcmV0dXJuIG5ld1ZhbHVlO1xuICB9LFxuXG4gIC8vIEdpdmVuIGEgdmFsdWUsIGNyZWF0ZSBhIGZpZWxkIHRlbXBsYXRlIGZvciB0aGF0IHZhbHVlLlxuICBjcmVhdGVGaWVsZFRlbXBsYXRlRnJvbVZhbHVlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcztcblxuICAgIHZhciBmaWVsZCA9IHtcbiAgICAgIHR5cGU6ICdqc29uJ1xuICAgIH07XG4gICAgaWYgKF8uaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgICBmaWVsZCA9IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmIChfLmlzTnVtYmVyKHZhbHVlKSkge1xuICAgICAgZmllbGQgPSB7XG4gICAgICAgIHR5cGU6ICdudW1iZXInXG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAoXy5pc0Jvb2xlYW4odmFsdWUpKSB7XG4gICAgICBmaWVsZCA9IHtcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAoXy5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgdmFyIGFycmF5SXRlbUZpZWxkcyA9IHZhbHVlLm1hcChmdW5jdGlvbiAodmFsdWUsIGkpIHtcbiAgICAgICAgdmFyIGNoaWxkRmllbGQgPSBjb25maWcuY3JlYXRlRmllbGRUZW1wbGF0ZUZyb21WYWx1ZSh2YWx1ZSk7XG4gICAgICAgIGNoaWxkRmllbGQua2V5ID0gaTtcbiAgICAgICAgcmV0dXJuIGNoaWxkRmllbGQ7XG4gICAgICB9KTtcbiAgICAgIGZpZWxkID0ge1xuICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICBmaWVsZHM6IGFycmF5SXRlbUZpZWxkc1xuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKF8uaXNPYmplY3QodmFsdWUpKSB7XG4gICAgICB2YXIgb2JqZWN0SXRlbUZpZWxkcyA9IE9iamVjdC5rZXlzKHZhbHVlKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgICB2YXIgY2hpbGRGaWVsZCA9IGNvbmZpZy5jcmVhdGVGaWVsZFRlbXBsYXRlRnJvbVZhbHVlKHZhbHVlW2tleV0pO1xuICAgICAgICBjaGlsZEZpZWxkLmtleSA9IGtleTtcbiAgICAgICAgY2hpbGRGaWVsZC5sYWJlbCA9IGNvbmZpZy5odW1hbml6ZShrZXkpO1xuICAgICAgICByZXR1cm4gY2hpbGRGaWVsZDtcbiAgICAgIH0pO1xuICAgICAgZmllbGQgPSB7XG4gICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICBmaWVsZHM6IG9iamVjdEl0ZW1GaWVsZHNcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmIChfLmlzTnVsbCh2YWx1ZSkpIHtcbiAgICAgIGZpZWxkID0ge1xuICAgICAgICB0eXBlOiAnanNvbidcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBmaWVsZDtcbiAgfSxcblxuICAvLyBEZWZhdWx0IHZhbHVlIGZhY3RvcnlcblxuICBjcmVhdGVEZWZhdWx0VmFsdWU6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXM7XG5cbiAgICB2YXIgZGVmYXVsdFZhbHVlID0gY29uZmlnLmZpZWxkVGVtcGxhdGVEZWZhdWx0VmFsdWUoZmllbGRUZW1wbGF0ZSk7XG5cbiAgICBpZiAoIV8uaXNVbmRlZmluZWQoZGVmYXVsdFZhbHVlKSkge1xuICAgICAgcmV0dXJuIHV0aWxzLmRlZXBDb3B5KGRlZmF1bHRWYWx1ZSk7XG4gICAgfVxuXG4gICAgdmFyIHR5cGVOYW1lID0gY29uZmlnLmZpZWxkVHlwZU5hbWUoZmllbGRUZW1wbGF0ZSk7XG5cbiAgICBpZiAoY29uZmlnWydjcmVhdGVEZWZhdWx0VmFsdWVfJyArIHR5cGVOYW1lXSkge1xuICAgICAgcmV0dXJuIGNvbmZpZ1snY3JlYXRlRGVmYXVsdFZhbHVlXycgKyB0eXBlTmFtZV0oZmllbGRUZW1wbGF0ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuICcnO1xuICB9LFxuXG4gIC8vIEZpZWxkIGhlbHBlcnNcblxuICAvLyBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBcImV4aXN0c1wiLlxuICBoYXNWYWx1ZTogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUsIHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlICE9PSBudWxsICYmICFfLmlzVW5kZWZpbmVkKHZhbHVlKTtcbiAgfSxcblxuICAvLyBDb2VyY2UgYSB2YWx1ZSB0byB2YWx1ZSBhcHByb3ByaWF0ZSBmb3IgYSBmaWVsZC5cbiAgY29lcmNlVmFsdWU6IGZ1bmN0aW9uIChmaWVsZCwgdmFsdWUpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcztcblxuICAgIHZhciB0eXBlTmFtZSA9IGNvbmZpZy5maWVsZFR5cGVOYW1lKGZpZWxkKTtcblxuICAgIGlmIChjb25maWdbJ2NvZXJjZVZhbHVlXycgKyB0eXBlTmFtZV0pIHtcbiAgICAgIHJldHVybiBjb25maWdbJ2NvZXJjZVZhbHVlXycgKyB0eXBlTmFtZV0oZmllbGQsIHZhbHVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsdWU7XG4gIH0sXG5cbiAgLy8gR2l2ZW4gYSBmaWVsZCBhbmQgYSBjaGlsZCB2YWx1ZSwgZmluZCB0aGUgYXBwcm9wcmlhdGUgZmllbGQgdGVtcGxhdGUgZm9yXG4gIC8vIHRoYXQgY2hpbGQgdmFsdWUuXG4gIGNoaWxkRmllbGRUZW1wbGF0ZUZvclZhbHVlOiBmdW5jdGlvbiAoZmllbGQsIGNoaWxkVmFsdWUpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcztcblxuICAgIHZhciBmaWVsZFRlbXBsYXRlO1xuXG4gICAgdmFyIGZpZWxkVGVtcGxhdGVzID0gY29uZmlnLmZpZWxkSXRlbUZpZWxkVGVtcGxhdGVzKGZpZWxkKTtcblxuICAgIGZpZWxkVGVtcGxhdGUgPSBfLmZpbmQoZmllbGRUZW1wbGF0ZXMsIGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgICByZXR1cm4gY29uZmlnLm1hdGNoZXNGaWVsZFRlbXBsYXRlVG9WYWx1ZShmaWVsZFRlbXBsYXRlLCBjaGlsZFZhbHVlKTtcbiAgICB9KTtcblxuICAgIGlmIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgICByZXR1cm4gZmllbGRUZW1wbGF0ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVGaWVsZFRlbXBsYXRlRnJvbVZhbHVlKGNoaWxkVmFsdWUpO1xuICAgIH1cbiAgfSxcblxuICAvLyBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIG1hdGNoIGZvciBhIGZpZWxkIHRlbXBsYXRlLlxuICBtYXRjaGVzRmllbGRUZW1wbGF0ZVRvVmFsdWU6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlLCB2YWx1ZSkge1xuICAgIHZhciBtYXRjaCA9IGZpZWxkVGVtcGxhdGUubWF0Y2g7XG4gICAgaWYgKCFtYXRjaCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBfLmV2ZXJ5KF8ua2V5cyhtYXRjaCksIGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHJldHVybiBfLmlzRXF1YWwobWF0Y2hba2V5XSwgdmFsdWVba2V5XSk7XG4gICAgfSk7XG4gIH0sXG5cbiAgLy8gRmllbGQgdGVtcGxhdGUgaGVscGVyc1xuXG4gIC8vIE5vcm1hbGl6ZWQgKFBhc2NhbENhc2UpIHR5cGUgbmFtZSBmb3IgYSBmaWVsZC5cbiAgZmllbGRUZW1wbGF0ZVR5cGVOYW1lOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSkge1xuICAgIHZhciBjb25maWcgPSB0aGlzO1xuXG4gICAgdmFyIHR5cGVOYW1lID0gdXRpbHMuZGFzaFRvUGFzY2FsKGZpZWxkVGVtcGxhdGUudHlwZSB8fCAndW5kZWZpbmVkJyk7XG5cbiAgICB2YXIgYWxpYXMgPSBjb25maWdbJ2FsaWFzXycgKyB0eXBlTmFtZV07XG5cbiAgICBpZiAoYWxpYXMpIHtcbiAgICAgIGlmIChfLmlzRnVuY3Rpb24oYWxpYXMpKSB7XG4gICAgICAgIHJldHVybiBhbGlhcy5jYWxsKGNvbmZpZywgZmllbGRUZW1wbGF0ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gYWxpYXM7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGZpZWxkVGVtcGxhdGUubGlzdCkge1xuICAgICAgdHlwZU5hbWUgPSAnQXJyYXknO1xuICAgIH1cblxuICAgIHJldHVybiB0eXBlTmFtZTtcbiAgfSxcblxuICAvLyBEZWZhdWx0IHZhbHVlIGZvciBhIGZpZWxkIHRlbXBsYXRlLlxuICBmaWVsZFRlbXBsYXRlRGVmYXVsdFZhbHVlOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSkge1xuXG4gICAgcmV0dXJuIGZpZWxkVGVtcGxhdGUuZGVmYXVsdDtcbiAgfSxcblxuICAvLyBWYWx1ZSBmb3IgYSBmaWVsZCB0ZW1wbGF0ZS4gVXNlZCB0byBkZXRlcm1pbmUgdGhlIHZhbHVlIG9mIGEgbmV3IGNoaWxkXG4gIC8vIGZpZWxkLlxuICBmaWVsZFRlbXBsYXRlVmFsdWU6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXM7XG5cbiAgICAvLyBUaGlzIGxvZ2ljIG1pZ2h0IGJlIGJyaXR0bGUuXG5cbiAgICB2YXIgZGVmYXVsdFZhbHVlID0gY29uZmlnLmZpZWxkVGVtcGxhdGVEZWZhdWx0VmFsdWUoZmllbGRUZW1wbGF0ZSk7XG5cbiAgICB2YXIgbWF0Y2ggPSBjb25maWcuZmllbGRUZW1wbGF0ZU1hdGNoKGZpZWxkVGVtcGxhdGUpO1xuXG4gICAgdmFyIHZhbHVlO1xuXG4gICAgaWYgKF8uaXNVbmRlZmluZWQoZGVmYXVsdFZhbHVlKSAmJiAhXy5pc1VuZGVmaW5lZChtYXRjaCkpIHtcbiAgICAgIHJldHVybiB1dGlscy5kZWVwQ29weShtYXRjaCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjb25maWcuY3JlYXRlRGVmYXVsdFZhbHVlKGZpZWxkVGVtcGxhdGUpO1xuICAgIH1cblxuICAgIHJldHVybiB2YWx1ZTtcbiAgfSxcblxuICAvLyBNYXRjaCBydWxlIGZvciBhIGZpZWxkIHRlbXBsYXRlLlxuICBmaWVsZFRlbXBsYXRlTWF0Y2g6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgcmV0dXJuIGZpZWxkVGVtcGxhdGUubWF0Y2g7XG4gIH0sXG5cbiAgLy8gRGV0ZXJtaW5lIGlmIGEgZmllbGQgdGVtcGxhdGUgaGFzIGEgc2luZ2xlLWxpbmUgdmFsdWUuXG4gIGZpZWxkVGVtcGxhdGVJc1NpbmdsZUxpbmU6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgcmV0dXJuIGZpZWxkVGVtcGxhdGUuaXNTaW5nbGVMaW5lIHx8IGZpZWxkVGVtcGxhdGUuaXNfc2luZ2xlX2xpbmUgfHxcbiAgICAgICAgICAgIGZpZWxkVGVtcGxhdGUudHlwZSA9PT0gJ3NpbmdsZS1saW5lLXN0cmluZycgfHwgZmllbGRUZW1wbGF0ZS50eXBlID09PSAnU2luZ2xlTGluZVN0cmluZyc7XG4gIH0sXG5cbiAgLy8gRmllbGQgaGVscGVyc1xuXG4gIC8vIEdldCBhbiBhcnJheSBvZiBrZXlzIHJlcHJlc2VudGluZyB0aGUgcGF0aCB0byBhIHZhbHVlLlxuICBmaWVsZFZhbHVlUGF0aDogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXM7XG5cbiAgICB2YXIgcGFyZW50UGF0aCA9IFtdO1xuXG4gICAgaWYgKGZpZWxkLnBhcmVudCkge1xuICAgICAgcGFyZW50UGF0aCA9IGNvbmZpZy5maWVsZFZhbHVlUGF0aChmaWVsZC5wYXJlbnQpO1xuICAgIH1cblxuICAgIHJldHVybiBwYXJlbnRQYXRoLmNvbmNhdChmaWVsZC5rZXkpLmZpbHRlcihmdW5jdGlvbiAoa2V5KSB7XG4gICAgICByZXR1cm4gIV8uaXNVbmRlZmluZWQoa2V5KSAmJiBrZXkgIT09ICcnO1xuICAgIH0pO1xuICB9LFxuXG4gIC8vIENsb25lIGEgZmllbGQgd2l0aCBhIGRpZmZlcmVudCB2YWx1ZS5cbiAgZmllbGRXaXRoVmFsdWU6IGZ1bmN0aW9uIChmaWVsZCwgdmFsdWUpIHtcbiAgICByZXR1cm4gXy5leHRlbmQoe30sIGZpZWxkLCB7dmFsdWU6IHZhbHVlfSk7XG4gIH0sXG5cbiAgZmllbGRUeXBlTmFtZTogdXRpbHMuZGVsZWdhdGVUbygnZmllbGRUZW1wbGF0ZVR5cGVOYW1lJyksXG5cbiAgLy8gR2V0IHRoZSBjaG9pY2VzIGZvciBhIGRyb3Bkb3duIGZpZWxkLlxuICBmaWVsZENob2ljZXM6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5ub3JtYWxpemVDaG9pY2VzKGZpZWxkLmNob2ljZXMpO1xuICB9LFxuXG4gIC8vIEdldCBhIHNldCBvZiBib29sZWFuIGNob2ljZXMgZm9yIGEgZmllbGQuXG4gIGZpZWxkQm9vbGVhbkNob2ljZXM6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzO1xuXG4gICAgdmFyIGNob2ljZXMgPSBjb25maWcuZmllbGRDaG9pY2VzKGZpZWxkKTtcblxuICAgIGlmIChjaG9pY2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIFt7XG4gICAgICAgIGxhYmVsOiAnWWVzJyxcbiAgICAgICAgdmFsdWU6IHRydWVcbiAgICAgIH0se1xuICAgICAgICBsYWJlbDogJ05vJyxcbiAgICAgICAgdmFsdWU6IGZhbHNlXG4gICAgICB9XTtcbiAgICB9XG5cbiAgICByZXR1cm4gY2hvaWNlcy5tYXAoZnVuY3Rpb24gKGNob2ljZSkge1xuICAgICAgaWYgKF8uaXNCb29sZWFuKGNob2ljZS52YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIGNob2ljZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBfLmV4dGVuZCh7fSwgY2hvaWNlLCB7XG4gICAgICAgIHZhbHVlOiBjb25maWcuY29lcmNlVmFsdWVUb0Jvb2xlYW4oY2hvaWNlLnZhbHVlKVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0sXG5cbiAgLy8gR2V0IGEgc2V0IG9mIHJlcGxhY2VtZW50IGNob2ljZXMgZm9yIGEgZmllbGQuXG4gIGZpZWxkUmVwbGFjZUNob2ljZXM6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5ub3JtYWxpemVDaG9pY2VzKGZpZWxkLnJlcGxhY2VDaG9pY2VzKTtcbiAgfSxcblxuICAvLyBHZXQgYSBsYWJlbCBmb3IgYSBmaWVsZC5cbiAgZmllbGRMYWJlbDogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgcmV0dXJuIGZpZWxkLmxhYmVsO1xuICB9LFxuXG4gIC8vIEdldCB0aGUgaGVscCB0ZXh0IGZvciBhIGZpZWxkLlxuICBmaWVsZEhlbHBUZXh0OiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICByZXR1cm4gZmllbGQuaGVscF90ZXh0X2h0bWwgfHwgZmllbGQuaGVscF90ZXh0IHx8IGZpZWxkLmhlbHBUZXh0IHx8IGZpZWxkLmhlbHBUZXh0SHRtbDtcbiAgfSxcblxuICAvLyBHZXQgd2hldGhlciBvciBub3QgYSBmaWVsZCBpcyByZXF1aXJlZC5cbiAgZmllbGRJc1JlcXVpcmVkOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICByZXR1cm4gZmllbGQucmVxdWlyZWQgPyB0cnVlIDogZmFsc2U7XG4gIH0sXG5cbiAgLy8gRGV0ZXJtaW5lIGlmIHZhbHVlIGZvciB0aGlzIGZpZWxkIGlzIG5vdCBhIGxlYWYgdmFsdWUuXG4gIGZpZWxkSGFzVmFsdWVDaGlsZHJlbjogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXM7XG5cbiAgICB2YXIgZGVmYXVsdFZhbHVlID0gY29uZmlnLmNyZWF0ZURlZmF1bHRWYWx1ZShmaWVsZCk7XG5cbiAgICBpZiAoXy5pc09iamVjdChkZWZhdWx0VmFsdWUpIHx8IF8uaXNBcnJheShkZWZhdWx0VmFsdWUpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG5cbiAgLy8gR2V0IHRoZSBjaGlsZCBmaWVsZCB0ZW1wbGF0ZXMgZm9yIHRoaXMgZmllbGQuXG4gIGZpZWxkQ2hpbGRGaWVsZFRlbXBsYXRlczogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgcmV0dXJuIGZpZWxkLmZpZWxkcyB8fCBbXTtcbiAgfSxcblxuICAvLyBHZXQgdGhlIGZpZWxkIHRlbXBsYXRlcyBmb3IgZWFjaCBpdGVtIG9mIHRoaXMgZmllbGQuIChGb3IgZHluYW1pYyBjaGlsZHJlbixcbiAgLy8gbGlrZSBhcnJheXMuKVxuICBmaWVsZEl0ZW1GaWVsZFRlbXBsYXRlczogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgaWYgKCFmaWVsZC5pdGVtRmllbGRzKSB7XG4gICAgICByZXR1cm4gW3t0eXBlOiAndGV4dCd9XTtcbiAgICB9XG4gICAgaWYgKCFfLmlzQXJyYXkoZmllbGQuaXRlbUZpZWxkcykpIHtcbiAgICAgIHJldHVybiBbZmllbGQuaXRlbUZpZWxkc107XG4gICAgfVxuICAgIHJldHVybiBmaWVsZC5pdGVtRmllbGRzO1xuICB9LFxuXG4gIGZpZWxkSXNTaW5nbGVMaW5lOiB1dGlscy5kZWxlZ2F0ZVRvKCdmaWVsZFRlbXBsYXRlSXNTaW5nbGVMaW5lJyksXG5cbiAgLy8gR2V0IHdoZXRoZXIgb3Igbm90IGEgZmllbGQgaXMgY29sbGFwc2VkLlxuICBmaWVsZElzQ29sbGFwc2VkOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICByZXR1cm4gZmllbGQuY29sbGFwc2VkID8gdHJ1ZSA6IGZhbHNlO1xuICB9LFxuXG4gIC8vIEdldCB3aGV0ZXIgb3Igbm90IGEgZmllbGQgY2FuIGJlIGNvbGxhcHNlZC5cbiAgZmllbGRJc0NvbGxhcHNpYmxlOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICByZXR1cm4gZmllbGQuY29sbGFwc2libGUgfHwgIV8uaXNVbmRlZmluZWQoZmllbGQuY29sbGFwc2VkKTtcbiAgfSxcblxuICAvLyBHZXQgdGhlIG51bWJlciBvZiByb3dzIGZvciBhIGZpZWxkLlxuICBmaWVsZFJvd3M6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIHJldHVybiBmaWVsZC5yb3dzO1xuICB9LFxuXG4gIGZpZWxkTWF0Y2g6IHV0aWxzLmRlbGVnYXRlVG8oJ2ZpZWxkVGVtcGxhdGVNYXRjaCcpLFxuXG4gIC8vIE90aGVyIGhlbHBlcnNcblxuICAvLyBDb252ZXJ0IGEga2V5IHRvIGEgbmljZSBodW1hbi1yZWFkYWJsZSB2ZXJzaW9uLlxuICBodW1hbml6ZTogZnVuY3Rpb24ocHJvcGVydHkpIHtcbiAgICBwcm9wZXJ0eSA9IHByb3BlcnR5LnJlcGxhY2UoL1xce1xcey9nLCAnJyk7XG4gICAgcHJvcGVydHkgPSBwcm9wZXJ0eS5yZXBsYWNlKC9cXH1cXH0vZywgJycpO1xuICAgIHJldHVybiBwcm9wZXJ0eS5yZXBsYWNlKC9fL2csICcgJylcbiAgICAucmVwbGFjZSgvKFxcdyspL2csIGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgICByZXR1cm4gbWF0Y2guY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBtYXRjaC5zbGljZSgxKTtcbiAgICB9KTtcbiAgfSxcblxuICAvLyBOb3JtYWxpemUgc29tZSBjaG9pY2VzIGZvciBhIGRyb3AtZG93bi5cbiAgbm9ybWFsaXplQ2hvaWNlczogZnVuY3Rpb24gKGNob2ljZXMpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcztcblxuICAgIGlmICghY2hvaWNlcykge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIC8vIENvbnZlcnQgY29tbWEgc2VwYXJhdGVkIHN0cmluZyB0byBhcnJheSBvZiBzdHJpbmdzLlxuICAgIGlmIChfLmlzU3RyaW5nKGNob2ljZXMpKSB7XG4gICAgICBjaG9pY2VzID0gY2hvaWNlcy5zcGxpdCgnLCcpO1xuICAgIH1cblxuICAgIC8vIENvbnZlcnQgb2JqZWN0IHRvIGFycmF5IG9mIG9iamVjdHMgd2l0aCBgdmFsdWVgIGFuZCBgbGFiZWxgIHByb3BlcnRpZXMuXG4gICAgaWYgKCFfLmlzQXJyYXkoY2hvaWNlcykgJiYgXy5pc09iamVjdChjaG9pY2VzKSkge1xuICAgICAgY2hvaWNlcyA9IE9iamVjdC5rZXlzKGNob2ljZXMpLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdmFsdWU6IGtleSxcbiAgICAgICAgICBsYWJlbDogY2hvaWNlc1trZXldXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBDb3B5IHRoZSBhcnJheSBvZiBjaG9pY2VzIHNvIHdlIGNhbiBtYW5pcHVsYXRlIHRoZW0uXG4gICAgY2hvaWNlcyA9IGNob2ljZXMuc2xpY2UoMCk7XG5cbiAgICAvLyBBcnJheSBvZiBjaG9pY2UgYXJyYXlzIHNob3VsZCBiZSBmbGF0dGVuZWQuXG4gICAgY2hvaWNlcyA9IF8uZmxhdHRlbihjaG9pY2VzKTtcblxuICAgIGNob2ljZXMuZm9yRWFjaChmdW5jdGlvbiAoY2hvaWNlLCBpKSB7XG4gICAgICAvLyBDb252ZXJ0IGFueSBzdHJpbmcgY2hvaWNlcyB0byBvYmplY3RzIHdpdGggYHZhbHVlYCBhbmQgYGxhYmVsYFxuICAgICAgLy8gcHJvcGVydGllcy5cbiAgICAgIGlmIChfLmlzU3RyaW5nKGNob2ljZSkpIHtcbiAgICAgICAgY2hvaWNlc1tpXSA9IHtcbiAgICAgICAgICB2YWx1ZTogY2hvaWNlLFxuICAgICAgICAgIGxhYmVsOiBjb25maWcuaHVtYW5pemUoY2hvaWNlKVxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKCFjaG9pY2VzW2ldLmxhYmVsKSB7XG4gICAgICAgIGNob2ljZXNbaV0ubGFiZWwgPSBjb25maWcuaHVtYW5pemUoY2hvaWNlc1tpXS52YWx1ZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY2hvaWNlcztcbiAgfSxcblxuICAvLyBDb2VyY2UgYSB2YWx1ZSB0byBhIGJvb2xlYW5cbiAgY29lcmNlVmFsdWVUb0Jvb2xlYW46IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGlmICghXy5pc1N0cmluZyh2YWx1ZSkpIHtcbiAgICAgIC8vIEp1c3QgdXNlIHRoZSBkZWZhdWx0IHRydXRoaW5lc3MuXG4gICAgICByZXR1cm4gdmFsdWUgPyB0cnVlIDogZmFsc2U7XG4gICAgfVxuICAgIHZhbHVlID0gdmFsdWUudG9Mb3dlckNhc2UoKTtcbiAgICBpZiAodmFsdWUgPT09ICcnIHx8IHZhbHVlID09PSAnbm8nIHx8IHZhbHVlID09PSAnb2ZmJyB8fCB2YWx1ZSA9PT0gJ2ZhbHNlJykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcblxuICAvLyBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIHZhbGlkIGtleS5cbiAgaXNLZXk6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4gKF8uaXNOdW1iZXIoa2V5KSAmJiBrZXkgPj0gMCkgfHwgKF8uaXNTdHJpbmcoa2V5KSAmJiBrZXkgIT09ICcnKTtcbiAgfSxcblxuICAvLyBGYXN0IHdheSB0byBjaGVjayBmb3IgZW1wdHkgb2JqZWN0LlxuICBpc0VtcHR5T2JqZWN0OiBmdW5jdGlvbiAob2JqKSB7XG4gICAgZm9yKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBmb3JtYXRpY1xuXG4vKlxuVGhlIHJvb3QgZm9ybWF0aWMgY29tcG9uZW50LlxuXG5UaGUgcm9vdCBmb3JtYXRpYyBjb21wb25lbnQgaXMgYWN0dWFsbHkgdHdvIGNvbXBvbmVudHMuIFRoZSBtYWluIGNvbXBvbmVudCBpc1xuYSBjb250cm9sbGVkIGNvbXBvbmVudCB3aGVyZSB5b3UgbXVzdCBwYXNzIHRoZSB2YWx1ZSBpbiB3aXRoIGVhY2ggcmVuZGVyLiBUaGlzXG5pcyBhY3R1YWxseSB3cmFwcGVkIGluIGFub3RoZXIgY29tcG9uZW50IHdoaWNoIGFsbG93cyB5b3UgdG8gdXNlIGZvcm1hdGljIGFzXG5hbiB1bmNvbnRyb2xsZWQgY29tcG9uZW50IHdoZXJlIGl0IHJldGFpbnMgdGhlIHN0YXRlIG9mIHRoZSB2YWx1ZS4gVGhlIHdyYXBwZXJcbmlzIHdoYXQgaXMgYWN0dWFsbHkgZXhwb3J0ZWQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxudmFyIGRlZmF1bHRDb25maWcgPSByZXF1aXJlKCcuL2RlZmF1bHQtY29uZmlnJyk7XG5cbi8vIFRoZSBtYWluIGZvcm1hdGljIGNvbXBvbmVudCB0aGF0IHJlbmRlcnMgdGhlIGZvcm0uXG52YXIgRm9ybWF0aWNDb250cm9sbGVkQ2xhc3MgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdGb3JtYXRpY0NvbnRyb2xsZWQnLFxuXG4gIC8vIFJlc3BvbmQgdG8gYW55IHZhbHVlIGNoYW5nZXMuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAobmV3VmFsdWUsIGluZm8pIHtcbiAgICBpZiAoIXRoaXMucHJvcHMub25DaGFuZ2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaW5mbyA9IF8uZXh0ZW5kKHt9LCBpbmZvKTtcbiAgICBpbmZvLnBhdGggPSB0aGlzLnByb3BzLmNvbmZpZy5maWVsZFZhbHVlUGF0aChpbmZvLmZpZWxkKTtcbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG5ld1ZhbHVlLCBpbmZvKTtcbiAgfSxcblxuICAvLyBSZXNwb25kIHRvIGFueSBhY3Rpb25zIG90aGVyIHRoYW4gdmFsdWUgY2hhbmdlcy4gKEZvciBleGFtcGxlLCBmb2N1cyBhbmRcbiAgLy8gYmx1ci4pXG4gIG9uQWN0aW9uOiBmdW5jdGlvbiAoaW5mbykge1xuICAgIGlmICghdGhpcy5wcm9wcy5vbkFjdGlvbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpbmZvID0gXy5leHRlbmQoe30sIGluZm8pO1xuICAgIGluZm8ucGF0aCA9IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkVmFsdWVQYXRoKGluZm8uZmllbGQpO1xuICAgIHRoaXMucHJvcHMub25BY3Rpb24oaW5mbyk7XG4gIH0sXG5cbiAgLy8gUmVuZGVyIHRoZSByb290IGNvbXBvbmVudCBieSBkZWxlZ2F0aW5nIHRvIHRoZSBjb25maWcuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5yZW5kZXJGb3JtYXRpY0NvbXBvbmVudCh0aGlzKTtcbiAgfVxufSk7XG5cbnZhciBGb3JtYXRpY0NvbnRyb2xsZWQgPSBSZWFjdC5jcmVhdGVGYWN0b3J5KEZvcm1hdGljQ29udHJvbGxlZENsYXNzKTtcblxuLy8gQSB3cmFwcGVyIGNvbXBvbmVudCB0aGF0IGlzIGFjdHVhbGx5IGV4cG9ydGVkIGFuZCBjYW4gYWxsb3cgZm9ybWF0aWMgdG8gYmVcbi8vIHVzZWQgaW4gYW4gXCJ1bmNvbnRyb2xsZWRcIiBtYW5uZXIuIChTZWUgdW5jb250cm9sbGVkIGNvbXBvbmVudHMgaW4gdGhlIFJlYWN0XG4vLyBkb2N1bWVudGF0aW9uIGZvciBhbiBleHBsYW5hdGlvbiBvZiB0aGUgZGlmZmVyZW5jZS4pXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAvLyBFeHBvcnQgc29tZSBzdHVmZiBhcyBzdGF0aWNzLlxuICBzdGF0aWNzOiB7XG4gICAgY3JlYXRlQ29uZmlnOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgYXJncyA9IF8udG9BcnJheShhcmd1bWVudHMpO1xuICAgICAgdmFyIGNvbmZpZyA9IF8uZXh0ZW5kKHt9LCBkZWZhdWx0Q29uZmlnKTtcblxuICAgICAgaWYgKGFyZ3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBjb25maWc7XG4gICAgICB9XG4gICAgICB2YXIgY29uZmlncyA9IFtjb25maWddLmNvbmNhdChhcmdzKTtcbiAgICAgIHJldHVybiBjb25maWdzLnJlZHVjZShmdW5jdGlvbiAocHJldiwgY3Vycikge1xuICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKGN1cnIpKSB7XG4gICAgICAgICAgY3VycihwcmV2KTtcbiAgICAgICAgICByZXR1cm4gcHJldjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gXy5leHRlbmQocHJldiwgY3Vycik7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIGF2YWlsYWJsZU1peGluczoge1xuICAgICAgY2xpY2tPdXRzaWRlOiByZXF1aXJlKCcuL21peGlucy9jbGljay1vdXRzaWRlLmpzJyksXG4gICAgICBmaWVsZDogcmVxdWlyZSgnLi9taXhpbnMvZmllbGQuanMnKSxcbiAgICAgIGhlbHBlcjogcmVxdWlyZSgnLi9taXhpbnMvaGVscGVyLmpzJyksXG4gICAgICByZXNpemU6IHJlcXVpcmUoJy4vbWl4aW5zL3Jlc2l6ZS5qcycpLFxuICAgICAgc2Nyb2xsOiByZXF1aXJlKCcuL21peGlucy9zY3JvbGwuanMnKSxcbiAgICAgIHVuZG9TdGFjazogcmVxdWlyZSgnLi9taXhpbnMvdW5kby1zdGFjay5qcycpXG4gICAgfSxcbiAgICBwbHVnaW5zOiB7XG4gICAgICBib290c3RyYXA6IHJlcXVpcmUoJy4vcGx1Z2lucy9ib290c3RyYXAnKSxcbiAgICAgIG1ldGE6IHJlcXVpcmUoJy4vcGx1Z2lucy9tZXRhJyksXG4gICAgICByZWZlcmVuY2U6IHJlcXVpcmUoJy4vcGx1Z2lucy9yZWZlcmVuY2UnKSxcbiAgICAgIGVsZW1lbnRDbGFzc2VzOiByZXF1aXJlKCcuL3BsdWdpbnMvZWxlbWVudC1jbGFzc2VzJylcbiAgICB9LFxuICAgIHV0aWxzOiB1dGlsc1xuICB9LFxuXG4gIGRpc3BsYXlOYW1lOiAnRm9ybWF0aWMnLFxuXG4gIC8vIElmIHdlIGdvdCBhIHZhbHVlLCB0cmVhdCB0aGlzIGNvbXBvbmVudCBhcyBjb250cm9sbGVkLiBFaXRoZXIgd2F5LCByZXRhaW5cbiAgLy8gdGhlIHZhbHVlIGluIHRoZSBzdGF0ZS5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlzQ29udHJvbGxlZDogIV8uaXNVbmRlZmluZWQodGhpcy5wcm9wcy52YWx1ZSksXG4gICAgICB2YWx1ZTogXy5pc1VuZGVmaW5lZCh0aGlzLnByb3BzLnZhbHVlKSA/IHRoaXMucHJvcHMuZGVmYXVsdFZhbHVlIDogdGhpcy5wcm9wcy52YWx1ZVxuICAgIH07XG4gIH0sXG5cbiAgLy8gSWYgdGhpcyBpcyBhIGNvbnRyb2xsZWQgY29tcG9uZW50LCBjaGFuZ2Ugb3VyIHN0YXRlIHRvIHJlZmxlY3QgdGhlIG5ld1xuICAvLyB2YWx1ZS4gRm9yIHVuY29udHJvbGxlZCBjb21wb25lbnRzLCBpZ25vcmUgYW55IHZhbHVlIGNoYW5nZXMuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXdQcm9wcykge1xuICAgIGlmICh0aGlzLnN0YXRlLmlzQ29udHJvbGxlZCkge1xuICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKG5ld1Byb3BzLnZhbHVlKSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICB2YWx1ZTogbmV3UHJvcHMudmFsdWVcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vIElmIHRoaXMgaXMgYW4gdW5jb250cm9sbGVkIGNvbXBvbmVudCwgc2V0IG91ciBzdGF0ZSB0byByZWZsZWN0IHRoZSBuZXdcbiAgLy8gdmFsdWUuIEVpdGhlciB3YXksIGNhbGwgdGhlIG9uQ2hhbmdlIGNhbGxiYWNrLlxuICBvbkNoYW5nZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBpbmZvKSB7XG4gICAgaWYgKCF0aGlzLnN0YXRlLmlzQ29udHJvbGxlZCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHZhbHVlOiBuZXdWYWx1ZVxuICAgICAgfSk7XG4gICAgfVxuICAgIGlmICghdGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG5ld1ZhbHVlLCBpbmZvKTtcbiAgfSxcblxuICAvLyBBbnkgYWN0aW9ucyBzaG91bGQgYmUgc2VudCB0byB0aGUgZ2VuZXJpYyBvbkFjdGlvbiBjYWxsYmFjayBidXQgYWxzbyBzcGxpdFxuICAvLyBpbnRvIGRpc2NyZWV0IGNhbGxiYWNrcyBwZXIgYWN0aW9uLlxuICBvbkFjdGlvbjogZnVuY3Rpb24gKGluZm8pIHtcbiAgICBpZiAodGhpcy5wcm9wcy5vbkFjdGlvbikge1xuICAgICAgdGhpcy5wcm9wcy5vbkFjdGlvbihpbmZvKTtcbiAgICB9XG4gICAgdmFyIGFjdGlvbiA9IHV0aWxzLmRhc2hUb1Bhc2NhbChpbmZvLmFjdGlvbik7XG4gICAgaWYgKHRoaXMucHJvcHNbJ29uJyArIGFjdGlvbl0pIHtcbiAgICAgIHRoaXMucHJvcHNbJ29uJyArIGFjdGlvbl0oaW5mbyk7XG4gICAgfVxuICB9LFxuXG4gIC8vIFJlbmRlciB0aGUgd3JhcHBlciBjb21wb25lbnQgKGJ5IGp1c3QgZGVsZWdhdGluZyB0byB0aGUgbWFpbiBjb21wb25lbnQpLlxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZyB8fCBkZWZhdWx0Q29uZmlnO1xuICAgIHZhciB2YWx1ZSA9IHRoaXMuc3RhdGUudmFsdWU7XG5cbiAgICBpZiAodGhpcy5zdGF0ZS5pc0NvbnRyb2xsZWQpIHtcbiAgICAgIGlmICghdGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuICAgICAgICBjb25zb2xlLmxvZygnWW91IHNob3VsZCBzdXBwbHkgYW4gb25DaGFuZ2UgaGFuZGxlciBpZiB5b3Ugc3VwcGx5IGEgdmFsdWUuJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHByb3BzID0ge1xuICAgICAgY29uZmlnOiBjb25maWcsXG4gICAgICAvLyBBbGxvdyBmaWVsZCB0ZW1wbGF0ZXMgdG8gYmUgcGFzc2VkIGluIGFzIGBmaWVsZGAgb3IgYGZpZWxkc2AuIEFmdGVyIHRoaXMsIHN0b3BcbiAgICAgIC8vIGNhbGxpbmcgdGhlbSBmaWVsZHMuXG4gICAgICBmaWVsZFRlbXBsYXRlOiB0aGlzLnByb3BzLmZpZWxkLFxuICAgICAgZmllbGRUZW1wbGF0ZXM6IHRoaXMucHJvcHMuZmllbGRzLFxuICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsXG4gICAgICBvbkFjdGlvbjogdGhpcy5vbkFjdGlvblxuICAgIH07XG5cbiAgICBfLmVhY2godGhpcy5wcm9wcywgZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgIGlmICghKGtleSBpbiBwcm9wcykpIHtcbiAgICAgICAgcHJvcHNba2V5XSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIEZvcm1hdGljQ29udHJvbGxlZChwcm9wcyk7XG4gIH1cblxufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY2xpY2stb3V0c2lkZSBtaXhpblxuXG4vKlxuVGhlcmUncyBubyBuYXRpdmUgUmVhY3Qgd2F5IHRvIGRldGVjdCBjbGlja2luZyBvdXRzaWRlIGFuIGVsZW1lbnQuIFNvbWV0aW1lc1xudGhpcyBpcyB1c2VmdWwsIHNvIHRoYXQncyB3aGF0IHRoaXMgbWl4aW4gZG9lcy4gVG8gdXNlIGl0LCBtaXggaXQgaW4gYW5kIHVzZSBpdFxuZnJvbSB5b3VyIGNvbXBvbmVudCBsaWtlIHRoaXM6XG5cbmBgYGpzXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLm1peGlucy9jbGljay1vdXRzaWRlJyldLFxuXG4gIG9uQ2xpY2tPdXRzaWRlOiBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS5sb2coJ2NsaWNrZWQgb3V0c2lkZSEnKTtcbiAgfSxcblxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc2V0T25DbGlja091dHNpZGUoJ215RGl2JywgdGhpcy5vbkNsaWNrT3V0c2lkZSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFJlYWN0LkRPTS5kaXYoe3JlZjogJ215RGl2J30sXG4gICAgICAnSGVsbG8hJ1xuICAgIClcbiAgfVxufSk7XG5gYGBcbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbnZhciBoYXNBbmNlc3RvciA9IGZ1bmN0aW9uIChjaGlsZCwgcGFyZW50KSB7XG4gIGlmIChjaGlsZC5wYXJlbnROb2RlID09PSBwYXJlbnQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBpZiAoY2hpbGQucGFyZW50Tm9kZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gaGFzQW5jZXN0b3IoY2hpbGQucGFyZW50Tm9kZSwgcGFyZW50KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGlzTm9kZU91dHNpZGU6IGZ1bmN0aW9uIChub2RlT3V0LCBub2RlSW4pIHtcbiAgICBpZiAobm9kZU91dCA9PT0gbm9kZUluKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmIChoYXNBbmNlc3Rvcihub2RlT3V0LCBub2RlSW4pKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuXG4gIGlzTm9kZUluc2lkZTogZnVuY3Rpb24gKG5vZGVJbiwgbm9kZU91dCkge1xuICAgIHJldHVybiAhdGhpcy5pc05vZGVPdXRzaWRlKG5vZGVJbiwgbm9kZU91dCk7XG4gIH0sXG5cbiAgX29uQ2xpY2tNb3VzZWRvd246IGZ1bmN0aW9uKCkge1xuICAgIF8uZWFjaCh0aGlzLmNsaWNrT3V0c2lkZUhhbmRsZXJzLCBmdW5jdGlvbiAoZnVuY3MsIHJlZikge1xuICAgICAgaWYgKHRoaXMucmVmc1tyZWZdKSB7XG4gICAgICAgIHRoaXMuX21vdXNlZG93blJlZnNbcmVmXSA9IHRydWU7XG4gICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfSxcblxuICBfb25DbGlja01vdXNldXA6IGZ1bmN0aW9uIChldmVudCkge1xuICAgIF8uZWFjaCh0aGlzLmNsaWNrT3V0c2lkZUhhbmRsZXJzLCBmdW5jdGlvbiAoZnVuY3MsIHJlZikge1xuICAgICAgaWYgKHRoaXMucmVmc1tyZWZdICYmIHRoaXMuX21vdXNlZG93blJlZnNbcmVmXSkge1xuICAgICAgICBpZiAodGhpcy5pc05vZGVPdXRzaWRlKGV2ZW50LnRhcmdldCwgdGhpcy5yZWZzW3JlZl0uZ2V0RE9NTm9kZSgpKSkge1xuICAgICAgICAgIGZ1bmNzLmZvckVhY2goZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICBmbi5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLl9tb3VzZWRvd25SZWZzW3JlZl0gPSBmYWxzZTtcbiAgICB9LmJpbmQodGhpcykpO1xuICB9LFxuXG4gIHNldE9uQ2xpY2tPdXRzaWRlOiBmdW5jdGlvbiAocmVmLCBmbikge1xuICAgIGlmICghdGhpcy5jbGlja091dHNpZGVIYW5kbGVyc1tyZWZdKSB7XG4gICAgICB0aGlzLmNsaWNrT3V0c2lkZUhhbmRsZXJzW3JlZl0gPSBbXTtcbiAgICB9XG4gICAgdGhpcy5jbGlja091dHNpZGVIYW5kbGVyc1tyZWZdLnB1c2goZm4pO1xuICB9LFxuXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jbGlja091dHNpZGVIYW5kbGVycyA9IHt9O1xuICAgIHRoaXMuX2RpZE1vdXNlRG93biA9IGZhbHNlO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX29uQ2xpY2tNb3VzZWRvd24pO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9vbkNsaWNrTW91c2V1cCk7XG4gICAgLy9kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uQ2xpY2tEb2N1bWVudCk7XG4gICAgdGhpcy5fbW91c2Vkb3duUmVmcyA9IHt9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jbGlja091dHNpZGVIYW5kbGVycyA9IHt9O1xuICAgIC8vZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkNsaWNrRG9jdW1lbnQpO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9vbkNsaWNrTW91c2V1cCk7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5fb25DbGlja01vdXNlZG93bik7XG4gIH1cbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgZmllbGQgbWl4aW5cblxuLypcblRoaXMgbWl4aW4gZ2V0cyBtaXhlZCBpbnRvIGFsbCBmaWVsZCBjb21wb25lbnRzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgLy8gU2lnbmFsIGEgY2hhbmdlIGluIHZhbHVlLlxuICBvbkNoYW5nZVZhbHVlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHZhbHVlLCB7XG4gICAgICBmaWVsZDogdGhpcy5wcm9wcy5maWVsZFxuICAgIH0pO1xuICB9LFxuXG4gIC8vIEJ1YmJsZSB1cCBhIHZhbHVlLlxuICBvbkJ1YmJsZVZhbHVlOiBmdW5jdGlvbiAodmFsdWUsIGluZm8pIHtcbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHZhbHVlLCBpbmZvKTtcbiAgfSxcblxuICAvLyBTdGFydCBhbiBhY3Rpb24gYnViYmxpbmcgdXAgdGhyb3VnaCBwYXJlbnQgY29tcG9uZW50cy5cbiAgb25TdGFydEFjdGlvbjogZnVuY3Rpb24gKGFjdGlvbiwgcHJvcHMpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5vbkFjdGlvbikge1xuICAgICAgdmFyIGluZm8gPSBfLmV4dGVuZCh7fSwgcHJvcHMpO1xuICAgICAgaW5mby5hY3Rpb24gPSBhY3Rpb247XG4gICAgICBpbmZvLmZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcbiAgICAgIHRoaXMucHJvcHMub25BY3Rpb24oaW5mbyk7XG4gICAgfVxuICB9LFxuXG4gIG9uRm9jdXNBY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLm9uU3RhcnRBY3Rpb24oJ2ZvY3VzJyk7XG4gIH0sXG5cbiAgb25CbHVyQWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5vblN0YXJ0QWN0aW9uKCdibHVyJyk7XG4gIH0sXG5cbiAgLy8gQnViYmxlIHVwIGFuIGFjdGlvbi5cbiAgb25CdWJibGVBY3Rpb246IGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgaWYgKHRoaXMucHJvcHMub25BY3Rpb24pIHtcbiAgICAgIHRoaXMucHJvcHMub25BY3Rpb24oaW5mbyk7XG4gICAgfVxuICB9LFxuXG4gIC8vIERlbGVnYXRlIHJlbmRlcmluZyBiYWNrIHRvIGNvbmZpZyBzbyBpdCBjYW4gYmUgd3JhcHBlZC5cbiAgcmVuZGVyV2l0aENvbmZpZzogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnByb3BzLmNvbmZpZy5yZW5kZXJGaWVsZENvbXBvbmVudCh0aGlzKTtcbiAgfVxufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBoZWxwZXIgbWl4aW5cblxuLypcblRoaXMgZ2V0cyBtaXhlZCBpbnRvIGFsbCBoZWxwZXIgY29tcG9uZW50cy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIC8vIERlbGVnYXRlIHJlbmRlcmluZyBiYWNrIHRvIGNvbmZpZyBzbyBpdCBjYW4gYmUgd3JhcHBlZC5cbiAgcmVuZGVyV2l0aENvbmZpZzogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnByb3BzLmNvbmZpZy5yZW5kZXJDb21wb25lbnQodGhpcyk7XG4gIH0sXG5cbiAgLy8gU3RhcnQgYW4gYWN0aW9uIGJ1YmJsaW5nIHVwIHRocm91Z2ggcGFyZW50IGNvbXBvbmVudHMuXG4gIG9uU3RhcnRBY3Rpb246IGZ1bmN0aW9uIChhY3Rpb24sIHByb3BzKSB7XG4gICAgaWYgKHRoaXMucHJvcHMub25BY3Rpb24pIHtcbiAgICAgIHZhciBpbmZvID0gXy5leHRlbmQoe30sIHByb3BzKTtcbiAgICAgIGluZm8uYWN0aW9uID0gYWN0aW9uO1xuICAgICAgaW5mby5maWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG4gICAgICB0aGlzLnByb3BzLm9uQWN0aW9uKGluZm8pO1xuICAgIH1cbiAgfSxcblxuICAvLyBCdWJibGUgdXAgYW4gYWN0aW9uLlxuICBvbkJ1YmJsZUFjdGlvbjogZnVuY3Rpb24gKGluZm8pIHtcbiAgICBpZiAodGhpcy5wcm9wcy5vbkFjdGlvbikge1xuICAgICAgdGhpcy5wcm9wcy5vbkFjdGlvbihpbmZvKTtcbiAgICB9XG4gIH0sXG5cbiAgb25Gb2N1c0FjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMub25TdGFydEFjdGlvbignZm9jdXMnKTtcbiAgfSxcblxuICBvbkJsdXJBY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLm9uU3RhcnRBY3Rpb24oJ2JsdXInKTtcbiAgfVxufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiLy8gIyByZXNpemUgbWl4aW5cblxuLypcbllvdSdkIHRoaW5rIGl0IHdvdWxkIGJlIHByZXR0eSBlYXN5IHRvIGRldGVjdCB3aGVuIGEgRE9NIGVsZW1lbnQgaXMgcmVzaXplZC5cbkFuZCB5b3UnZCBiZSB3cm9uZy4gVGhlcmUgYXJlIHZhcmlvdXMgdHJpY2tzLCBidXQgbm9uZSBvZiB0aGVtIHdvcmsgdmVyeSB3ZWxsLlxuU28sIHVzaW5nIGdvb2Qgb2wnIHBvbGxpbmcgaGVyZS4gVG8gdHJ5IHRvIGJlIGFzIGVmZmljaWVudCBhcyBwb3NzaWJsZSwgdGhlcmVcbmlzIG9ubHkgYSBzaW5nbGUgc2V0SW50ZXJ2YWwgdXNlZCBmb3IgYWxsIGVsZW1lbnRzLiBUbyB1c2U6XG5cbmBgYGpzXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvcmVzaXplJyldLFxuXG4gIG9uUmVzaXplOiBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS5sb2coJ3Jlc2l6ZWQhJyk7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNldE9uUmVzaXplKCdteVRleHQnLCB0aGlzLm9uUmVzaXplKTtcbiAgfSxcblxuICBvbkNoYW5nZTogZnVuY3Rpb24gKCkge1xuICAgIC4uLlxuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSZWFjdC5ET00udGV4dGFyZWEoe3JlZjogJ215VGV4dCcsIHZhbHVlOiB0aGlzLnByb3BzLnZhbHVlLCBvbkNoYW5nZTogLi4ufSlcbiAgfVxufSk7XG5gYGBcbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGlkID0gMDtcblxudmFyIHJlc2l6ZUludGVydmFsRWxlbWVudHMgPSB7fTtcbnZhciByZXNpemVJbnRlcnZhbEVsZW1lbnRzQ291bnQgPSAwO1xudmFyIHJlc2l6ZUludGVydmFsVGltZXIgPSBudWxsO1xuXG52YXIgY2hlY2tFbGVtZW50cyA9IGZ1bmN0aW9uICgpIHtcbiAgT2JqZWN0LmtleXMocmVzaXplSW50ZXJ2YWxFbGVtZW50cykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIGVsZW1lbnQgPSByZXNpemVJbnRlcnZhbEVsZW1lbnRzW2tleV07XG4gICAgaWYgKGVsZW1lbnQuY2xpZW50V2lkdGggIT09IGVsZW1lbnQuX19wcmV2Q2xpZW50V2lkdGggfHwgZWxlbWVudC5jbGllbnRIZWlnaHQgIT09IGVsZW1lbnQuX19wcmV2Q2xpZW50SGVpZ2h0KSB7XG4gICAgICBlbGVtZW50Ll9fcHJldkNsaWVudFdpZHRoID0gZWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICAgIGVsZW1lbnQuX19wcmV2Q2xpZW50SGVpZ2h0ID0gZWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgICB2YXIgaGFuZGxlcnMgPSBlbGVtZW50Ll9fcmVzaXplSGFuZGxlcnM7XG4gICAgICBoYW5kbGVycy5mb3JFYWNoKGZ1bmN0aW9uIChoYW5kbGVyKSB7XG4gICAgICAgIGhhbmRsZXIoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSwgMTAwKTtcbn07XG5cbnZhciBhZGRSZXNpemVJbnRlcnZhbEhhbmRsZXIgPSBmdW5jdGlvbiAoZWxlbWVudCwgZm4pIHtcbiAgaWYgKHJlc2l6ZUludGVydmFsVGltZXIgPT09IG51bGwpIHtcbiAgICByZXNpemVJbnRlcnZhbFRpbWVyID0gc2V0SW50ZXJ2YWwoY2hlY2tFbGVtZW50cywgMTAwKTtcbiAgfVxuICBpZiAoISgnX19yZXNpemVJZCcgaW4gZWxlbWVudCkpIHtcbiAgICBpZCsrO1xuICAgIGVsZW1lbnQuX19wcmV2Q2xpZW50V2lkdGggPSBlbGVtZW50LmNsaWVudFdpZHRoO1xuICAgIGVsZW1lbnQuX19wcmV2Q2xpZW50SGVpZ2h0ID0gZWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgZWxlbWVudC5fX3Jlc2l6ZUlkID0gaWQ7XG4gICAgcmVzaXplSW50ZXJ2YWxFbGVtZW50c0NvdW50Kys7XG4gICAgcmVzaXplSW50ZXJ2YWxFbGVtZW50c1tpZF0gPSBlbGVtZW50O1xuICAgIGVsZW1lbnQuX19yZXNpemVIYW5kbGVycyA9IFtdO1xuICB9XG4gIGVsZW1lbnQuX19yZXNpemVIYW5kbGVycy5wdXNoKGZuKTtcbn07XG5cbnZhciByZW1vdmVSZXNpemVJbnRlcnZhbEhhbmRsZXJzID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgaWYgKCEoJ19fcmVzaXplSWQnIGluIGVsZW1lbnQpKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBpZCA9IGVsZW1lbnQuX19yZXNpemVJZDtcbiAgZGVsZXRlIGVsZW1lbnQuX19yZXNpemVJZDtcbiAgZGVsZXRlIGVsZW1lbnQuX19yZXNpemVIYW5kbGVycztcbiAgZGVsZXRlIHJlc2l6ZUludGVydmFsRWxlbWVudHNbaWRdO1xuICByZXNpemVJbnRlcnZhbEVsZW1lbnRzQ291bnQtLTtcbiAgaWYgKHJlc2l6ZUludGVydmFsRWxlbWVudHNDb3VudCA8IDEpIHtcbiAgICBjbGVhckludGVydmFsKHJlc2l6ZUludGVydmFsVGltZXIpO1xuICAgIHJlc2l6ZUludGVydmFsVGltZXIgPSBudWxsO1xuICB9XG59O1xuXG52YXIgb25SZXNpemUgPSBmdW5jdGlvbiAocmVmLCBmbikge1xuICBmbihyZWYpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5vblJlc2l6ZVdpbmRvdykge1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMub25SZXNpemVXaW5kb3cpO1xuICAgIH1cbiAgICB0aGlzLnJlc2l6ZUVsZW1lbnRSZWZzID0ge307XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5vblJlc2l6ZVdpbmRvdykge1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMub25SZXNpemVXaW5kb3cpO1xuICAgIH1cbiAgICBPYmplY3Qua2V5cyh0aGlzLnJlc2l6ZUVsZW1lbnRSZWZzKS5mb3JFYWNoKGZ1bmN0aW9uIChyZWYpIHtcbiAgICAgIHJlbW92ZVJlc2l6ZUludGVydmFsSGFuZGxlcnModGhpcy5yZWZzW3JlZl0uZ2V0RE9NTm9kZSgpKTtcbiAgICB9LmJpbmQodGhpcykpO1xuICB9LFxuXG4gIHNldE9uUmVzaXplOiBmdW5jdGlvbiAocmVmLCBmbikge1xuICAgIGlmICghdGhpcy5yZXNpemVFbGVtZW50UmVmc1tyZWZdKSB7XG4gICAgICB0aGlzLnJlc2l6ZUVsZW1lbnRSZWZzW3JlZl0gPSB0cnVlO1xuICAgIH1cbiAgICBhZGRSZXNpemVJbnRlcnZhbEhhbmRsZXIodGhpcy5yZWZzW3JlZl0uZ2V0RE9NTm9kZSgpLCBvblJlc2l6ZS5iaW5kKHRoaXMsIHJlZiwgZm4pKTtcbiAgfVxufTtcbiIsIi8vICMgc2Nyb2xsIG1peGluXG5cbi8qXG5DdXJyZW50bHkgdW51c2VkLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IHtcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5vblNjcm9sbFdpbmRvdykge1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdGhpcy5vblNjcm9sbFdpbmRvdyk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5vblNjcm9sbFdpbmRvdykge1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdGhpcy5vblNjcm9sbFdpbmRvdyk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufTtcbiIsIi8vICMgdW5kby1zdGFjayBtaXhpblxuXG4vKlxuR2l2ZXMgeW91ciBjb21wb25lbnQgYW4gdW5kbyBzdGFjay5cbiovXG5cbi8vIGh0dHA6Ly9wcm9tZXRoZXVzcmVzZWFyY2guZ2l0aHViLmlvL3JlYWN0LWZvcm1zL2V4YW1wbGVzL3VuZG8uaHRtbFxuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7dW5kbzogW10sIHJlZG86IFtdfTtcbiAgfSxcblxuICBzbmFwc2hvdDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHVuZG8gPSB0aGlzLnN0YXRlLnVuZG8uY29uY2F0KHRoaXMuZ2V0U3RhdGVTbmFwc2hvdCgpKTtcbiAgICBpZiAodHlwZW9mIHRoaXMuc3RhdGUudW5kb0RlcHRoID09PSAnbnVtYmVyJykge1xuICAgICAgaWYgKHVuZG8ubGVuZ3RoID4gdGhpcy5zdGF0ZS51bmRvRGVwdGgpIHtcbiAgICAgICAgdW5kby5zaGlmdCgpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnNldFN0YXRlKHt1bmRvOiB1bmRvLCByZWRvOiBbXX0pO1xuICB9LFxuXG4gIGhhc1VuZG86IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnVuZG8ubGVuZ3RoID4gMDtcbiAgfSxcblxuICBoYXNSZWRvOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5yZWRvLmxlbmd0aCA+IDA7XG4gIH0sXG5cbiAgcmVkbzogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fdW5kb0ltcGwodHJ1ZSk7XG4gIH0sXG5cbiAgdW5kbzogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fdW5kb0ltcGwoKTtcbiAgfSxcblxuICBfdW5kb0ltcGw6IGZ1bmN0aW9uKGlzUmVkbykge1xuICAgIHZhciB1bmRvID0gdGhpcy5zdGF0ZS51bmRvLnNsaWNlKDApO1xuICAgIHZhciByZWRvID0gdGhpcy5zdGF0ZS5yZWRvLnNsaWNlKDApO1xuICAgIHZhciBzbmFwc2hvdDtcblxuICAgIGlmIChpc1JlZG8pIHtcbiAgICAgIGlmIChyZWRvLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBzbmFwc2hvdCA9IHJlZG8ucG9wKCk7XG4gICAgICB1bmRvLnB1c2godGhpcy5nZXRTdGF0ZVNuYXBzaG90KCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodW5kby5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgc25hcHNob3QgPSB1bmRvLnBvcCgpO1xuICAgICAgcmVkby5wdXNoKHRoaXMuZ2V0U3RhdGVTbmFwc2hvdCgpKTtcbiAgICB9XG5cbiAgICB0aGlzLnNldFN0YXRlU25hcHNob3Qoc25hcHNob3QpO1xuICAgIHRoaXMuc2V0U3RhdGUoe3VuZG86dW5kbywgcmVkbzpyZWRvfSk7XG4gIH1cbn07XG4iLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGJvb3RzdHJhcCBwbHVnaW5cblxuLypcblRoZSBib290c3RyYXAgcGx1Z2luIHNuZWFrcyBpbiBzb21lIGNsYXNzZXMgdG8gZWxlbWVudHMgc28gdGhhdCBpdCBwbGF5cyB3ZWxsXG53aXRoIFR3aXR0ZXIgQm9vdHN0cmFwLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxuLy8gRGVjbGFyZSBzb21lIGNsYXNzZXMgYW5kIGxhYmVscyBmb3IgZWFjaCBlbGVtZW50LlxudmFyIG1vZGlmaWVycyA9IHtcblxuICAnRmllbGQnOiB7Y2xhc3Nlczogeydmb3JtLWdyb3VwJzogdHJ1ZX19LFxuICAnSGVscCc6IHtjbGFzc2VzOiB7J2hlbHAtYmxvY2snOiB0cnVlfX0sXG4gICdTYW1wbGUnOiB7Y2xhc3NlczogeydoZWxwLWJsb2NrJzogdHJ1ZX19LFxuICAnQXJyYXlDb250cm9sJzoge2NsYXNzZXM6IHsnZm9ybS1pbmxpbmUnOiB0cnVlfX0sXG4gICdBcnJheUl0ZW0nOiB7Y2xhc3Nlczogeyd3ZWxsJzogdHJ1ZX19LFxuICAnRmllbGRUZW1wbGF0ZUNob2ljZXMnOiB7Y2xhc3Nlczogeydmb3JtLWNvbnRyb2wnOiB0cnVlfX0sXG4gICdBZGRJdGVtJzoge2NsYXNzZXM6IHsnZ2x5cGhpY29uIGdseXBoaWNvbi1wbHVzJzogdHJ1ZX0sIGxhYmVsOiAnJ30sXG4gICdSZW1vdmVJdGVtJzoge2NsYXNzZXM6IHsnZ2x5cGhpY29uIGdseXBoaWNvbi1yZW1vdmUnOiB0cnVlfSwgbGFiZWw6ICcnfSxcbiAgJ01vdmVJdGVtQmFjayc6IHtjbGFzc2VzOiB7J2dseXBoaWNvbiBnbHlwaGljb24tYXJyb3ctdXAnOiB0cnVlfSwgbGFiZWw6ICcnfSxcbiAgJ01vdmVJdGVtRm9yd2FyZCc6IHtjbGFzc2VzOiB7J2dseXBoaWNvbiBnbHlwaGljb24tYXJyb3ctZG93bic6IHRydWV9LCBsYWJlbDogJyd9LFxuICAnT2JqZWN0SXRlbUtleSc6IHtjbGFzc2VzOiB7J2Zvcm0tY29udHJvbCc6IHRydWV9fSxcblxuICAnU2luZ2xlTGluZVN0cmluZyc6IHtjbGFzc2VzOiB7J2Zvcm0tY29udHJvbCc6IHRydWV9fSxcbiAgJ1N0cmluZyc6IHtjbGFzc2VzOiB7J2Zvcm0tY29udHJvbCc6IHRydWV9fSxcbiAgJ1ByZXR0eVRleHQnOiB7Y2xhc3Nlczogeydmb3JtLWNvbnRyb2wnOiB0cnVlfX0sXG4gICdKc29uJzoge2NsYXNzZXM6IHsnZm9ybS1jb250cm9sJzogdHJ1ZX19LFxuICAnU2VsZWN0VmFsdWUnOiB7Y2xhc3Nlczogeydmb3JtLWNvbnRyb2wnOiB0cnVlfX1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNvbmZpZykge1xuXG4gIHZhciBkZWZhdWx0Q3JlYXRlRWxlbWVudCA9IGNvbmZpZy5jcmVhdGVFbGVtZW50O1xuXG4gIC8vIFdyYXAgdGhlIGNyZWF0ZUVsZW1lbnQgbWV0aG9kLlxuICBjb25maWcuY3JlYXRlRWxlbWVudCA9IGZ1bmN0aW9uIChuYW1lLCBwcm9wcywgY2hpbGRyZW4pIHtcblxuICAgIG5hbWUgPSBjb25maWcuZWxlbWVudE5hbWUobmFtZSk7XG5cbiAgICB2YXIgbW9kaWZpZXIgPSBtb2RpZmllcnNbbmFtZV07XG5cbiAgICBpZiAobW9kaWZpZXIpIHtcbiAgICAgIC8vIElmIHRoZXJlIGlzIGEgbW9kaWZpZXIgZm9yIHRoaXMgZWxlbWVudCwgYWRkIHRoZSBjbGFzc2VzIGFuZCBsYWJlbC5cbiAgICAgIHByb3BzID0gXy5leHRlbmQoe30sIHByb3BzKTtcbiAgICAgIHByb3BzLmNsYXNzZXMgPSBfLmV4dGVuZCh7fSwgcHJvcHMuY2xhc3NlcywgbW9kaWZpZXIuY2xhc3Nlcyk7XG4gICAgICBpZiAoJ2xhYmVsJyBpbiBtb2RpZmllcikge1xuICAgICAgICBwcm9wcy5sYWJlbCA9IG1vZGlmaWVyLmxhYmVsO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBkZWZhdWx0Q3JlYXRlRWxlbWVudC5jYWxsKHRoaXMsIG5hbWUsIHByb3BzLCBjaGlsZHJlbik7XG4gIH07XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGVsZW1lbnQtY2xhc3NlcyBwbHVnaW5cblxuLypcblRoaXMgcGx1Z2lucyBwcm92aWRlcyBhIGNvbmZpZyBtZXRob2QgYWRkRWxlbWVudENsYXNzIHRoYXQgbGV0cyB5b3UgYWRkIG9uIGFcbmNsYXNzIHRvIGFuIGVsZW1lbnQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjb25maWcpIHtcblxuICB2YXIgZGVmYXVsdENyZWF0ZUVsZW1lbnQgPSBjb25maWcuY3JlYXRlRWxlbWVudDtcblxuICB2YXIgZWxlbWVudENsYXNzZXMgPSB7fTtcblxuICBjb25maWcuYWRkRWxlbWVudENsYXNzID0gZnVuY3Rpb24gKG5hbWUsIGNsYXNzTmFtZSkge1xuXG4gICAgbmFtZSA9IGNvbmZpZy5lbGVtZW50TmFtZShuYW1lKTtcblxuICAgIGlmICghZWxlbWVudENsYXNzZXNbbmFtZV0pIHtcbiAgICAgIGVsZW1lbnRDbGFzc2VzW25hbWVdID0ge307XG4gICAgfVxuXG4gICAgZWxlbWVudENsYXNzZXNbbmFtZV1bY2xhc3NOYW1lXSA9IHRydWU7XG4gIH07XG5cbiAgLy8gV3JhcCB0aGUgY3JlYXRlRWxlbWVudCBtZXRob2QuXG4gIGNvbmZpZy5jcmVhdGVFbGVtZW50ID0gZnVuY3Rpb24gKG5hbWUsIHByb3BzLCBjaGlsZHJlbikge1xuXG4gICAgbmFtZSA9IGNvbmZpZy5lbGVtZW50TmFtZShuYW1lKTtcblxuICAgIGlmIChlbGVtZW50Q2xhc3Nlc1tuYW1lXSkge1xuICAgICAgcHJvcHMgPSBfLmV4dGVuZCh7fSwgcHJvcHMsIHtjbGFzc2VzOiBlbGVtZW50Q2xhc3Nlc1tuYW1lXX0pO1xuICAgIH1cblxuICAgIHJldHVybiBkZWZhdWx0Q3JlYXRlRWxlbWVudC5jYWxsKHRoaXMsIG5hbWUsIHByb3BzLCBjaGlsZHJlbik7XG4gIH07XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIvLyAjIG1ldGEgcGx1Z2luXG5cbi8qXG5UaGUgbWV0YSBwbHVnaW4gbGV0cyB5b3UgcGFzcyBpbiBhIG1ldGEgcHJvcCB0byBmb3JtYXRpYy4gVGhlIHByb3AgdGhlbiBnZXRzXG5wYXNzZWQgdGhyb3VnaCBhcyBhIHByb3BlcnR5IGZvciBldmVyeSBmaWVsZC4gWW91IGNhbiB0aGVuIHdyYXAgYGluaXRGaWVsZGAgdG9cbmdldCB5b3VyIG1ldGEgdmFsdWVzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjb25maWcpIHtcblxuICB2YXIgaW5pdFJvb3RGaWVsZCA9IGNvbmZpZy5pbml0Um9vdEZpZWxkO1xuXG4gIGNvbmZpZy5pbml0Um9vdEZpZWxkID0gZnVuY3Rpb24gKGZpZWxkLCBwcm9wcykge1xuICAgIHZhciBjb25maWcgPSB0aGlzO1xuXG4gICAgZmllbGQubWV0YSA9IHByb3BzLm1ldGEgfHwge307XG5cbiAgICBpbml0Um9vdEZpZWxkLmFwcGx5KGNvbmZpZywgYXJndW1lbnRzKTtcbiAgfTtcblxuICB2YXIgaW5pdEZpZWxkID0gY29uZmlnLmluaXRGaWVsZDtcblxuICBjb25maWcuaW5pdEZpZWxkID0gZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXM7XG5cbiAgICBpZiAoZmllbGQucGFyZW50ICYmIGZpZWxkLnBhcmVudC5tZXRhKSB7XG4gICAgICBmaWVsZC5tZXRhID0gZmllbGQucGFyZW50Lm1ldGE7XG4gICAgfVxuXG4gICAgaW5pdEZpZWxkLmFwcGx5KGNvbmZpZywgYXJndW1lbnRzKTtcbiAgfTtcblxufTtcbiIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgcmVmZXJlbmNlIHBsdWdpblxuXG4vKlxuVGhpcyBwbHVnaW4gYWxsb3dzIGZpZWxkcyB0byBiZSBzdHJpbmdzIGFuZCByZWZlcmVuY2Ugb3RoZXIgZmllbGRzIGJ5IGtleSBvclxuaWQuIEl0IGFsc28gYWxsb3dzIGEgZmllbGQgdG8gZXh0ZW5kIGFub3RoZXIgZmllbGQgd2l0aFxuZXh0ZW5kczogWydmb28nLCAnYmFyJ10gd2hlcmUgJ2ZvbycgYW5kICdiYXInIHJlZmVyIHRvIG90aGVyIGtleXMgb3IgaWRzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgdmFyIGluaXRGaWVsZCA9IGNvbmZpZy5pbml0RmllbGQ7XG5cbiAgLy8gTG9vayBmb3IgYSB0ZW1wbGF0ZSBpbiB0aGlzIGZpZWxkIG9yIGFueSBvZiBpdHMgcGFyZW50cy5cbiAgY29uZmlnLmZpbmRGaWVsZFRlbXBsYXRlID0gZnVuY3Rpb24gKGZpZWxkLCBuYW1lKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXM7XG5cbiAgICBpZiAoZmllbGQudGVtcGxhdGVzW25hbWVdKSB7XG4gICAgICByZXR1cm4gZmllbGQudGVtcGxhdGVzW25hbWVdO1xuICAgIH1cblxuICAgIGlmIChmaWVsZC5wYXJlbnQpIHtcbiAgICAgIHJldHVybiBjb25maWcuZmluZEZpZWxkVGVtcGxhdGUoZmllbGQucGFyZW50LCBuYW1lKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcblxuICAvLyBJbmhlcml0IGZyb20gYW55IGZpZWxkIHRlbXBsYXRlcyB0aGF0IHRoaXMgZmllbGQgdGVtcGxhdGVcbiAgLy8gZXh0ZW5kcy5cbiAgY29uZmlnLnJlc29sdmVGaWVsZFRlbXBsYXRlID0gZnVuY3Rpb24gKGZpZWxkLCBmaWVsZFRlbXBsYXRlKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXM7XG5cbiAgICBpZiAoIWZpZWxkVGVtcGxhdGUuZXh0ZW5kcykge1xuICAgICAgcmV0dXJuIGZpZWxkVGVtcGxhdGU7XG4gICAgfVxuXG4gICAgdmFyIGV4dCA9IGZpZWxkVGVtcGxhdGUuZXh0ZW5kcztcblxuICAgIGlmICghXy5pc0FycmF5KGV4dCkpIHtcbiAgICAgIGV4dCA9IFtleHRdO1xuICAgIH1cblxuICAgIHZhciBiYXNlcyA9IGV4dC5tYXAoZnVuY3Rpb24gKGJhc2UpIHtcbiAgICAgIHZhciB0ZW1wbGF0ZSA9IGNvbmZpZy5maW5kRmllbGRUZW1wbGF0ZShmaWVsZCwgYmFzZSk7XG4gICAgICBpZiAoIXRlbXBsYXRlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVGVtcGxhdGUgJyArIGJhc2UgKyAnIG5vdCBmb3VuZC4nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgICB9KTtcblxuICAgIHZhciBjaGFpbiA9IFt7fV0uY29uY2F0KGJhc2VzLnJldmVyc2UoKS5jb25jYXQoW2ZpZWxkVGVtcGxhdGVdKSk7XG4gICAgZmllbGRUZW1wbGF0ZSA9IF8uZXh0ZW5kLmFwcGx5KF8sIGNoYWluKTtcblxuICAgIHJldHVybiBmaWVsZFRlbXBsYXRlO1xuICB9O1xuXG4gIC8vIFdyYXAgdGhlIGluaXRGaWVsZCBtZXRob2QuXG4gIGNvbmZpZy5pbml0RmllbGQgPSBmdW5jdGlvbiAoZmllbGQpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzO1xuXG4gICAgdmFyIHRlbXBsYXRlcyA9IGZpZWxkLnRlbXBsYXRlcyA9IHt9O1xuXG4gICAgdmFyIGNoaWxkRmllbGRUZW1wbGF0ZXMgPSBjb25maWcuZmllbGRDaGlsZEZpZWxkVGVtcGxhdGVzKGZpZWxkKTtcblxuICAgIC8vIEFkZCBlYWNoIG9mIHRoZSBjaGlsZCBmaWVsZCB0ZW1wbGF0ZXMgdG8gb3VyIHRlbXBsYXRlIG1hcC5cbiAgICBjaGlsZEZpZWxkVGVtcGxhdGVzLmZvckVhY2goZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcblxuICAgICAgaWYgKF8uaXNTdHJpbmcoZmllbGRUZW1wbGF0ZSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIga2V5ID0gZmllbGRUZW1wbGF0ZS5rZXk7XG4gICAgICB2YXIgaWQgPSBmaWVsZFRlbXBsYXRlLmlkO1xuXG4gICAgICBpZiAoZmllbGRUZW1wbGF0ZS50ZW1wbGF0ZSkge1xuICAgICAgICBmaWVsZFRlbXBsYXRlID0gXy5leHRlbmQoe30sIGZpZWxkVGVtcGxhdGUsIHt0ZW1wbGF0ZTogZmFsc2V9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKGtleSkgJiYga2V5ICE9PSAnJykge1xuICAgICAgICB0ZW1wbGF0ZXNba2V5XSA9IGZpZWxkVGVtcGxhdGU7XG4gICAgICB9XG5cbiAgICAgIGlmICghXy5pc1VuZGVmaW5lZChpZCkgJiYgaWQgIT09ICcnKSB7XG4gICAgICAgIHRlbXBsYXRlc1tpZF0gPSBmaWVsZFRlbXBsYXRlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gUmVzb2x2ZSBhbnkgcmVmZXJlbmNlcyB0byBvdGhlciBmaWVsZCB0ZW1wbGF0ZXMuXG4gICAgaWYgKGNoaWxkRmllbGRUZW1wbGF0ZXMubGVuZ3RoID4gMCkge1xuICAgICAgZmllbGQuZmllbGRzID0gY2hpbGRGaWVsZFRlbXBsYXRlcy5tYXAoZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcbiAgICAgICAgaWYgKF8uaXNTdHJpbmcoZmllbGRUZW1wbGF0ZSkpIHtcbiAgICAgICAgICBmaWVsZFRlbXBsYXRlID0gY29uZmlnLmZpbmRGaWVsZFRlbXBsYXRlKGZpZWxkLCBmaWVsZFRlbXBsYXRlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjb25maWcucmVzb2x2ZUZpZWxkVGVtcGxhdGUoZmllbGQsIGZpZWxkVGVtcGxhdGUpO1xuICAgICAgfSk7XG5cbiAgICAgIGZpZWxkLmZpZWxkcyA9IGZpZWxkLmZpZWxkcy5maWx0ZXIoZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcbiAgICAgICAgcmV0dXJuICFmaWVsZFRlbXBsYXRlLnRlbXBsYXRlO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdmFyIGl0ZW1GaWVsZFRlbXBsYXRlcyA9IGNvbmZpZy5maWVsZEl0ZW1GaWVsZFRlbXBsYXRlcyhmaWVsZCk7XG5cbiAgICAvLyBSZXNvbHZlIGFueSBvZiBvdXIgaXRlbSBmaWVsZCB0ZW1wbGF0ZXMuIChGaWVsZCB0ZW1wbGF0ZXMgZm9yIGR5bmFtaWNcbiAgICAvLyBjaGlsZCBmaWVsZHMuKVxuICAgIGlmIChpdGVtRmllbGRUZW1wbGF0ZXMubGVuZ3RoID4gMCkge1xuICAgICAgZmllbGQuaXRlbUZpZWxkcyA9IGl0ZW1GaWVsZFRlbXBsYXRlcy5tYXAoZnVuY3Rpb24gKGl0ZW1GaWVsZFRlbXBsYXRlKSB7XG4gICAgICAgIGlmIChfLmlzU3RyaW5nKGl0ZW1GaWVsZFRlbXBsYXRlKSkge1xuICAgICAgICAgIGl0ZW1GaWVsZFRlbXBsYXRlID0gY29uZmlnLmZpbmRGaWVsZFRlbXBsYXRlKGZpZWxkLCBpdGVtRmllbGRUZW1wbGF0ZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY29uZmlnLnJlc29sdmVGaWVsZFRlbXBsYXRlKGZpZWxkLCBpdGVtRmllbGRUZW1wbGF0ZSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpbml0RmllbGQuY2FsbChjb25maWcsIGFyZ3VtZW50cyk7XG4gIH07XG5cbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgdXRpbHNcblxuLypcbkp1c3Qgc29tZSBzaGFyZWQgdXRpbGl0eSBmdW5jdGlvbnMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG52YXIgdXRpbHMgPSBleHBvcnRzO1xuXG4vLyBDb3B5IG9iaiByZWN1cnNpbmcgZGVlcGx5LlxudXRpbHMuZGVlcENvcHkgPSBmdW5jdGlvbiAob2JqKSB7XG4gIGlmIChfLmlzQXJyYXkob2JqKSkge1xuICAgIHJldHVybiBvYmoubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICByZXR1cm4gdXRpbHMuZGVlcENvcHkoaXRlbSk7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAoXy5pc0Z1bmN0aW9uKG9iaikpIHtcbiAgICByZXR1cm4gb2JqO1xuICB9IGVsc2UgaWYgKF8uaXNOdWxsKG9iaikpIHtcbiAgICByZXR1cm4gb2JqO1xuICB9IGVsc2UgaWYgKF8uaXNPYmplY3Qob2JqKSkge1xuICAgIHZhciBjb3B5ID0ge307XG4gICAgXy5lYWNoKG9iaiwgZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgIGNvcHlba2V5XSA9IHV0aWxzLmRlZXBDb3B5KHZhbHVlKTtcbiAgICB9KTtcbiAgICByZXR1cm4gY29weTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gb2JqO1xuICB9XG59O1xuXG4vLyBDYWNoZSBmb3Igc3RyaW5ncyBjb252ZXJ0ZWQgdG8gUGFzY2FsIENhc2UuIFRoaXMgc2hvdWxkIGJlIGEgZmluaXRlIGxpc3QsIHNvXG4vLyBub3QgbXVjaCBmZWFyIHRoYXQgd2Ugd2lsbCBydW4gb3V0IG9mIG1lbW9yeS5cbnZhciBkYXNoVG9QYXNjYWxDYWNoZSA9IHt9O1xuXG4vLyBDb252ZXJ0IGZvby1iYXIgdG8gRm9vQmFyLlxudXRpbHMuZGFzaFRvUGFzY2FsID0gZnVuY3Rpb24gKHMpIHtcbiAgaWYgKHMgPT09ICcnKSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG4gIGlmICghZGFzaFRvUGFzY2FsQ2FjaGVbc10pIHtcbiAgICBkYXNoVG9QYXNjYWxDYWNoZVtzXSA9IHMuc3BsaXQoJy0nKS5tYXAoZnVuY3Rpb24gKHBhcnQpIHtcbiAgICAgIHJldHVybiBwYXJ0WzBdLnRvVXBwZXJDYXNlKCkgKyBwYXJ0LnN1YnN0cmluZygxKTtcbiAgICB9KS5qb2luKCcnKTtcbiAgfVxuICByZXR1cm4gZGFzaFRvUGFzY2FsQ2FjaGVbc107XG59O1xuXG4vLyBDb3B5IGFsbCBjb21wdXRlZCBzdHlsZXMgZnJvbSBvbmUgRE9NIGVsZW1lbnQgdG8gYW5vdGhlci5cbnV0aWxzLmNvcHlFbGVtZW50U3R5bGUgPSBmdW5jdGlvbiAoZnJvbUVsZW1lbnQsIHRvRWxlbWVudCkge1xuICB2YXIgZnJvbVN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZnJvbUVsZW1lbnQsICcnKTtcblxuICBpZiAoZnJvbVN0eWxlLmNzc1RleHQgIT09ICcnKSB7XG4gICAgdG9FbGVtZW50LnN0eWxlLmNzc1RleHQgPSBmcm9tU3R5bGUuY3NzVGV4dDtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgY3NzUnVsZXMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBmcm9tU3R5bGUubGVuZ3RoOyBpKyspIHtcbiAgICBjc3NSdWxlcy5wdXNoKGZyb21TdHlsZVtpXSArICc6JyArIGZyb21TdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKGZyb21TdHlsZVtpXSkgKyAnOycpO1xuICB9XG4gIHZhciBjc3NUZXh0ID0gY3NzUnVsZXMuam9pbignJyk7XG5cbiAgdG9FbGVtZW50LnN0eWxlLmNzc1RleHQgPSBjc3NUZXh0O1xufTtcblxuLy8gT2JqZWN0IHRvIGhvbGQgYnJvd3NlciBzbmlmZmluZyBpbmZvLlxudmFyIGJyb3dzZXIgPSB7XG4gIGlzQ2hyb21lOiBmYWxzZSxcbiAgaXNNb3ppbGxhOiBmYWxzZSxcbiAgaXNPcGVyYTogZmFsc2UsXG4gIGlzSWU6IGZhbHNlLFxuICBpc1NhZmFyaTogZmFsc2Vcbn07XG5cbi8vIFNuaWZmIHRoZSBicm93c2VyLlxudmFyIHVhID0gbmF2aWdhdG9yLnVzZXJBZ2VudDtcbmlmKHVhLmluZGV4T2YoJ0Nocm9tZScpID4gLTEpIHtcbiAgYnJvd3Nlci5pc0Nocm9tZSA9IHRydWU7XG59IGVsc2UgaWYgKHVhLmluZGV4T2YoJ1NhZmFyaScpID4gLTEpIHtcbiAgYnJvd3Nlci5pc1NhZmFyaSA9IHRydWU7XG59IGVsc2UgaWYgKHVhLmluZGV4T2YoJ09wZXJhJykgPiAtMSkge1xuICBicm93c2VyLmlzT3BlcmEgPSB0cnVlO1xufSBlbHNlIGlmICh1YS5pbmRleE9mKCdGaXJlZm94JykgPiAtMSkge1xuICBicm93c2VyLmlzTW96aWxsYSA9IHRydWU7XG59IGVsc2UgaWYgKHVhLmluZGV4T2YoJ01TSUUnKSA+IC0xKSB7XG4gIGJyb3dzZXIuaXNJZSA9IHRydWU7XG59XG5cbi8vIEV4cG9ydCBzbmlmZmVkIGJyb3dzZXIgaW5mby5cbnV0aWxzLmJyb3dzZXIgPSBicm93c2VyO1xuXG4vLyBDcmVhdGUgYSBtZXRob2QgdGhhdCBkZWxlZ2F0ZXMgdG8gYW5vdGhlciBtZXRob2Qgb24gdGhlIHNhbWUgb2JqZWN0LiBUaGVcbi8vIGRlZmF1bHQgY29uZmlndXJhdGlvbiB1c2VzIHRoaXMgZnVuY3Rpb24gdG8gZGVsZWdhdGUgb25lIG1ldGhvZCB0byBhbm90aGVyLlxudXRpbHMuZGVsZWdhdGVUbyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXNbbmFtZV0uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvZm9ybWF0aWMnKTtcbiJdfQ==
