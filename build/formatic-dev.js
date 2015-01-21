!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Formatic=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
// # component.list

/*
Render a list.
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
},{"../../mixins/field":36}],2:[function(require,module,exports){
(function (global){
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
},{"../../mixins/field":36}],3:[function(require,module,exports){
(function (global){
// # component.checkbox-list

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

  displayName: 'CheckboxList',

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
},{"../../mixins/field":36}],4:[function(require,module,exports){
(function (global){
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
},{"../../mixins/field":36}],5:[function(require,module,exports){
(function (global){
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
},{"../../mixins/field":36}],6:[function(require,module,exports){
(function (global){
// # component.json

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
},{"../../mixins/field":36}],7:[function(require,module,exports){
(function (global){
// # component.object

/*
Render an object.
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
},{"../../mixins/field":36}],8:[function(require,module,exports){
(function (global){
// # component.pretty-textarea

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
},{"../../mixins/field":36,"../../mixins/resize":39,"../../mixins/undo-stack":41,"../../utils":45}],9:[function(require,module,exports){
(function (global){
// # component.select

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
},{"../../mixins/field":36}],10:[function(require,module,exports){
(function (global){
// # component.string

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
      value: this.props.field.value,
      className: cx(this.props.classes),
      rows: field.rows || this.props.rows,
      onChange: this.onChange,
      onFocus: this.onFocusAction,
      onBlur: this.onBlurAction
    }));
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/field":36}],11:[function(require,module,exports){
(function (global){
// # component.string

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'Unicode',

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
},{"../../mixins/field":36}],12:[function(require,module,exports){
(function (global){
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
},{"../../mixins/field":36}],13:[function(require,module,exports){
(function (global){
// # component.add-item

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
},{"../../mixins/helper":37}],14:[function(require,module,exports){
(function (global){
// # component.list-control

/*
Render the item type choices and the add button.
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
},{"../../mixins/helper":37}],15:[function(require,module,exports){
(function (global){
// # component.list-item-control

/*
Render the remove and move buttons for a field.
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
},{"../../mixins/helper":37}],16:[function(require,module,exports){
(function (global){
// # component.list-item-value

/*
Render the value of a list item.
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
},{"../../mixins/helper":37}],17:[function(require,module,exports){
(function (global){
// # component.list-item

/*
Render a list item.
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
},{"../../mixins/helper":37}],18:[function(require,module,exports){
(function (global){
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
},{"../../mixins/click-outside":35,"../../mixins/helper":37}],19:[function(require,module,exports){
(function (global){
// # component.item-choices

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
},{"../../mixins/helper":37}],20:[function(require,module,exports){
(function (global){
// # component.field

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
},{"../../mixins/helper":37}],21:[function(require,module,exports){
(function (global){
// # component.help

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
},{"../../mixins/helper":37}],22:[function(require,module,exports){
(function (global){
// # component.label

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
},{"../../mixins/helper":37}],23:[function(require,module,exports){
(function (global){
// # component.move-item-back

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
},{"../../mixins/helper":37}],24:[function(require,module,exports){
(function (global){
// # component.move-item-forward

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
},{"../../mixins/helper":37}],25:[function(require,module,exports){
(function (global){
// # component.object-control

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
},{"../../mixins/helper":37}],26:[function(require,module,exports){
(function (global){
// # component.object-item-control

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
},{"../../mixins/helper":37}],27:[function(require,module,exports){
(function (global){
// # component.object-item-key

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
    return R.input({className: cx(this.props.className), type: 'text', value: this.props.displayKey, onChange: this.onChange});
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/helper":37}],28:[function(require,module,exports){
(function (global){
// # component.object-item-value

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

    return R.div({className: cx(this.props.className)},
      config.createFieldElement({field: field, onChange: this.onChangeField, plain: true})
    );
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/helper":37}],29:[function(require,module,exports){
(function (global){
// # component.object-item

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
},{"../../mixins/helper":37}],30:[function(require,module,exports){
(function (global){
// # component.remove-item

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
},{"../../mixins/helper":37}],31:[function(require,module,exports){
(function (global){
// # component.help

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
},{"../../mixins/helper":37}],32:[function(require,module,exports){
(function (global){
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
},{"../../mixins/helper":37}],33:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

var utils = require('./utils');

var delegateTo = function (name) {
  return function () {
    return this[name].apply(this, arguments);
  };
};

module.exports = {

  // Field element factories. Create field elements.

  createElement_Fields: React.createFactory(require('./components/fields/fields')),

  createElement_String: React.createFactory(require('./components/fields/string')),

  createElement_Unicode: React.createFactory(require('./components/fields/unicode')),

  createElement_Select: React.createFactory(require('./components/fields/select')),

  createElement_Boolean: React.createFactory(require('./components/fields/boolean')),

  createElement_PrettyText: React.createFactory(require('./components/fields/pretty-text')),

  createElement_Array: React.createFactory(require('./components/fields/array')),

  createElement_CheckboxList: React.createFactory(require('./components/fields/checkbox-list')),

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

  createDefaultValue_Fields: delegateTo('createDefaultValue_Object'),

  createDefaultValue_Unicode: delegateTo('createDefaultValue_String'),

  createDefaultValue_Select: delegateTo('createDefaultValue_String'),

  createDefaultValue_Json: delegateTo('createDefaultValue_Object'),

  createDefaultValue_CheckboxList: delegateTo('createDefaultValue_Array'),


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

  coerceValue_Fields: delegateTo('coerceValue_Object'),

  coerceValue_Unicode: delegateTo('coerceValue_String'),

  coerceValue_Select: delegateTo('coerceValue_String'),

  coerceValue_Json: delegateTo('coerceValue_Object'),

  coerceValue_CheckboxList: delegateTo('coerceValue_Array'),


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

  alias_Unicode: function (fieldTemplate) {
    if (fieldTemplate.replaceChoices) {
      return 'PrettyText';
    } else if (fieldTemplate.choices) {
      return 'Select';
    }
    return 'Unicode';
  },

  alias_String: function (fieldTemplate) {
    if (fieldTemplate.replaceChoices) {
      return 'PrettyText';
    } else if (fieldTemplate.choices) {
      return 'Select';
    }
    return 'String';
  },

  alias_Text: delegateTo('alias_String'),

  alias_List: 'Array',

  alias_Fieldset: 'Fields',

  // Field factory

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

  initRootField: function (/* field, props */) {
  },

  initField: function (/* field */) {
  },

  wrapFieldTemplates: function (fieldTemplates) {
    // Field components only work with individual fields, so wrap array of
    // field templates in root field template.
    return {
      type: 'fields',
      plain: true,
      fields: fieldTemplates
    };
  },

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

  createRootValue: function (props) {
    var config = this;

    var field = config.createRootField(props);

    return config.inflateFieldValue(field);
  },

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

  hasValue: function (fieldTemplate, value) {
    return value !== null && !_.isUndefined(value) && value !== '';
  },

  coerceValue: function (field, value) {
    var config = this;

    var typeName = config.fieldTypeName(field);

    if (config['coerceValue_' + typeName]) {
      return config['coerceValue_' + typeName](field, value);
    }

    return value;
  },

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

  fieldTemplateDefaultValue: function (fieldTemplate) {

    return fieldTemplate.default;
  },

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

  fieldTemplateMatch: function (fieldTemplate) {
    return fieldTemplate.match;
  },

  // Field helpers

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

  fieldWithValue: function (field, value) {
    return _.extend({}, field, {value: value});
  },

  fieldTypeName: delegateTo('fieldTemplateTypeName'),

  fieldChoices: function (field) {
    var config = this;

    return config.normalizeChoices(field.choices);
  },

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

  fieldReplaceChoices: function (field) {
    var config = this;

    return config.normalizeChoices(field.replaceChoices);
  },

  fieldLabel: function (field) {
    return field.label;
  },

  fieldHelpText: function (field) {
    return field.help_text_html || field.help_text || field.helpText || field.helpTextHtml;
  },

  fieldIsRequired: function (field) {
    return field.required;
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

  fieldChildFieldTemplates: function (field) {
    return field.fields || [];
  },

  fieldItemFieldTemplates: function (field) {
    if (!field.itemFields) {
      return [{type: 'text'}];
    }
    if (!_.isArray(field.itemFields)) {
      return [field.itemFields];
    }
    return field.itemFields;
  },

  fieldIsSingleLine: function (field) {
    return field.isSingleLine || field.is_single_line || field.type === 'unicode' || field.type === 'Unicode';
  },

  fieldIsCollapsed: function (field) {
    return field.collapsed ? true : false;
  },

  fieldIsCollapsible: function (field) {
    return field.collapsible || !_.isUndefined(field.collapsed);
  },

  fieldRows: function (field) {
    return field.rows;
  },

  fieldMatch: delegateTo('fieldTemplateMatch'),

  // Other helpers

  humanize: function(property) {
    property = property.replace(/\{\{/g, '');
    property = property.replace(/\}\}/g, '');
    return property.replace(/_/g, ' ')
    .replace(/(\w+)/g, function(match) {
      return match.charAt(0).toUpperCase() + match.slice(1);
    });
  },

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
},{"./components/fields/array":1,"./components/fields/boolean":2,"./components/fields/checkbox-list":3,"./components/fields/copy":4,"./components/fields/fields":5,"./components/fields/json":6,"./components/fields/object":7,"./components/fields/pretty-text":8,"./components/fields/select":9,"./components/fields/string":10,"./components/fields/unicode":11,"./components/fields/unknown":12,"./components/helpers/add-item":13,"./components/helpers/array-control":14,"./components/helpers/array-item":17,"./components/helpers/array-item-control":15,"./components/helpers/array-item-value":16,"./components/helpers/choices":18,"./components/helpers/field":20,"./components/helpers/field-template-choices":19,"./components/helpers/help":21,"./components/helpers/label":22,"./components/helpers/move-item-back":23,"./components/helpers/move-item-forward":24,"./components/helpers/object-control":25,"./components/helpers/object-item":29,"./components/helpers/object-item-control":26,"./components/helpers/object-item-key":27,"./components/helpers/object-item-value":28,"./components/helpers/remove-item":30,"./components/helpers/sample":31,"./components/helpers/select-value":32,"./utils":45}],34:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

var utils = require('./utils');

var defaultConfig = require('./default-config');

var FormaticControlledClass = React.createClass({

  displayName: 'FormaticControlled',

  onChange: function (newValue, info) {
    if (!this.props.onChange) {
      return;
    }
    //var isWrapped = !this.props.field;
    info = _.extend({}, info);
    // if (isWrapped) {
    //   info.fields = info.fields.slice(1);
    //   info.field = info.fields[0];
    // }
    //info.path = valuePath(info.fields);
    info.path = this.props.config.fieldValuePath(info.field);
    this.props.onChange(newValue, info);
  },

  onAction: function (info) {
    if (!this.props.onAction) {
      return;
    }
    //var isWrapped = !this.props.field;
    info = _.extend({}, info);
    // if (isWrapped) {
    //   info.fields = info.fields.slice(1);
    //   info.field = info.fields[0];
    // }
    //info.path = valuePath(info.fields);
    info.path = this.props.config.fieldValuePath(info.field);
    this.props.onAction(info);
  },

  render: function () {

    var config = this.props.config;

    return config.renderFormaticComponent(this);
  }
});

var FormaticControlled = React.createFactory(FormaticControlledClass);

module.exports = React.createClass({

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
      inputActions: require('./mixins/input-actions.js'),
      resize: require('./mixins/resize.js'),
      scroll: require('./mixins/scroll.js'),
      undoStack: require('./mixins/undo-stack.js')
    },
    plugins: {
      bootstrap: require('./plugins/bootstrap'),
      meta: require('./plugins/meta'),
      reference: require('./plugins/reference')
    },
    utils: utils
  },

  displayName: 'Formatic',

  getInitialState: function () {
    return {
      isControlled: !_.isUndefined(this.props.value),
      value: _.isUndefined(this.props.value) ? this.props.defaultValue : this.props.value
    };
  },

  componentWillReceiveProps: function (newProps) {
    if (this.state.isControlled) {
      if (!_.isUndefined(newProps.value)) {
        this.setState({
          value: newProps.value
        });
      }
    }
  },

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

  onAction: function (info) {
    if (this.props.onAction) {
      this.props.onAction(info);
    }
    var action = utils.dashToPascal(info.action);
    if (this.props['on' + action]) {
      this.props['on' + action](info);
    }
  },

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
},{"./default-config":33,"./mixins/click-outside.js":35,"./mixins/field.js":36,"./mixins/helper.js":37,"./mixins/input-actions.js":38,"./mixins/resize.js":39,"./mixins/scroll.js":40,"./mixins/undo-stack.js":41,"./plugins/bootstrap":42,"./plugins/meta":43,"./plugins/reference":44,"./utils":45}],35:[function(require,module,exports){
(function (global){
// # mixin.click-outside

/*
There's no native React way to detect clicking outside an element. Sometimes
this is useful, so that's what this mixin does. To use it, mix it in and use it
from your component like this:

```js
module.exports = function (plugin) {
  plugin.exports = React.createClass({

    mixins: [plugin.require('mixin.click-outside')],

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
};
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

  // _onClickDocument: function(event) {
  //   console.log('click doc')
  //   if (this._didMouseDown) {
  //     _.each(this.clickOutsideHandlers, function (funcs, ref) {
  //       if (isOutside(event.target, this.refs[ref].getDOMNode())) {
  //         funcs.forEach(function (fn) {
  //           fn.call(this);
  //         }.bind(this));
  //       }
  //     }.bind(this));
  //   }
  // },

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
    //this._didMouseDown = true;
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

  // _onClickDocument: function () {
  //   console.log('clickety')
  //   _.each(this.clickOutsideHandlers, function (funcs, ref) {
  //     console.log('clickety', ref, this.refs[ref])
  //   }.bind(this));
  // },

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
},{}],36:[function(require,module,exports){
(function (global){
// # mixin.field

/*
Wrap up your fields with this mixin to get:
- Automatic metadata loading.
- Anything else decided later.
*/

'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = {

  onChangeValue: function (value) {
    this.props.onChange(value, {
      field: this.props.field
    });
  },

  onBubbleValue: function (value, info) {
    this.props.onChange(value, info);
  },

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

  onBubbleAction: function (info) {
    if (this.props.onAction) {
      this.props.onAction(info);
    }
  },

  renderWithConfig: function () {
    return this.props.config.renderFieldComponent(this);
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],37:[function(require,module,exports){
(function (global){
'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = {

  renderWithConfig: function () {
    return this.props.config.renderComponent(this);
  },

  onStartAction: function (action, props) {
    if (this.props.onAction) {
      var info = _.extend({}, props);
      info.action = action;
      info.field = this.props.field;
      this.props.onAction(info);
    }
  },

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
},{}],38:[function(require,module,exports){
// # mixin.input-actions

/*
Currently unused.
*/

'use strict';

module.exports = function (plugin) {

  plugin.exports = {

    onFocus: function () {

    },

    onBlur: function () {

    },

    onChange: function () {

    }
  };
};

},{}],39:[function(require,module,exports){
// # mixin.resize

/*
You'd think it would be pretty easy to detect when a DOM element is resized.
And you'd be wrong. There are various tricks, but none of them work very well.
So, using good ol' polling here. To try to be as efficient as possible, there
is only a single setInterval used for all elements. To use:

```js
module.exports = function (plugin) {
  plugin.exports = React.createClass({

    mixins: [plugin.require('mixin.resize')],

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
};
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
// # mixin.scroll

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
// # mixin.undo-stack

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
// # bootstrap

'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

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

  'Unicode': {classes: {'form-control': true}},
  'String': {classes: {'form-control': true}},
  'PrettyText': {classes: {'form-control': true}},
  'Json': {classes: {'form-control': true}},
  'SelectValue': {classes: {'form-control': true}}
  //'Array': {classes: {'well': true}}
};

module.exports = function (config) {

  var defaultCreateElement = config.createElement;

  config.createElement = function (name, props, children) {

    name = config.elementName(name);

    var modifier = modifiers[name];

    if (modifier) {
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
'use strict';

// Allows you to pass meta prop into formatic, and that gets passed through as
// a property to each field.

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

},{}],44:[function(require,module,exports){
(function (global){
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

// This plugin allows fields to be strings and reference other fields by key or
// id. It also allows a field to extend another field with
// extends: ['foo', 'bar'].

module.exports = function (config) {

  var initField = config.initField;

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

  config.initField = function (field) {

    var config = this;

    var templates = field.templates = {};

    var childFieldTemplates = config.fieldChildFieldTemplates(field);

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
},{}],45:[function(require,module,exports){
(function (global){
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

var dashToPascalCache = {};

// Convert foo-bar to FooBar
utils.dashToPascal = function (s) {
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
    //console.log(i, fromStyle[i], fromStyle.getPropertyValue(fromStyle[i]))
    //toElement.style[fromStyle[i]] = fromStyle.getPropertyValue(fromStyle[i]);
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

utils.browser = browser;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"formatic":[function(require,module,exports){
module.exports = require('./lib/formatic');

},{"./lib/formatic":34}]},{},[])("formatic")
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvY29tcG9uZW50cy9maWVsZHMvYXJyYXkuanMiLCJsaWIvY29tcG9uZW50cy9maWVsZHMvYm9vbGVhbi5qcyIsImxpYi9jb21wb25lbnRzL2ZpZWxkcy9jaGVja2JveC1saXN0LmpzIiwibGliL2NvbXBvbmVudHMvZmllbGRzL2NvcHkuanMiLCJsaWIvY29tcG9uZW50cy9maWVsZHMvZmllbGRzLmpzIiwibGliL2NvbXBvbmVudHMvZmllbGRzL2pzb24uanMiLCJsaWIvY29tcG9uZW50cy9maWVsZHMvb2JqZWN0LmpzIiwibGliL2NvbXBvbmVudHMvZmllbGRzL3ByZXR0eS10ZXh0LmpzIiwibGliL2NvbXBvbmVudHMvZmllbGRzL3NlbGVjdC5qcyIsImxpYi9jb21wb25lbnRzL2ZpZWxkcy9zdHJpbmcuanMiLCJsaWIvY29tcG9uZW50cy9maWVsZHMvdW5pY29kZS5qcyIsImxpYi9jb21wb25lbnRzL2ZpZWxkcy91bmtub3duLmpzIiwibGliL2NvbXBvbmVudHMvaGVscGVycy9hZGQtaXRlbS5qcyIsImxpYi9jb21wb25lbnRzL2hlbHBlcnMvYXJyYXktY29udHJvbC5qcyIsImxpYi9jb21wb25lbnRzL2hlbHBlcnMvYXJyYXktaXRlbS1jb250cm9sLmpzIiwibGliL2NvbXBvbmVudHMvaGVscGVycy9hcnJheS1pdGVtLXZhbHVlLmpzIiwibGliL2NvbXBvbmVudHMvaGVscGVycy9hcnJheS1pdGVtLmpzIiwibGliL2NvbXBvbmVudHMvaGVscGVycy9jaG9pY2VzLmpzIiwibGliL2NvbXBvbmVudHMvaGVscGVycy9maWVsZC10ZW1wbGF0ZS1jaG9pY2VzLmpzIiwibGliL2NvbXBvbmVudHMvaGVscGVycy9maWVsZC5qcyIsImxpYi9jb21wb25lbnRzL2hlbHBlcnMvaGVscC5qcyIsImxpYi9jb21wb25lbnRzL2hlbHBlcnMvbGFiZWwuanMiLCJsaWIvY29tcG9uZW50cy9oZWxwZXJzL21vdmUtaXRlbS1iYWNrLmpzIiwibGliL2NvbXBvbmVudHMvaGVscGVycy9tb3ZlLWl0ZW0tZm9yd2FyZC5qcyIsImxpYi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWNvbnRyb2wuanMiLCJsaWIvY29tcG9uZW50cy9oZWxwZXJzL29iamVjdC1pdGVtLWNvbnRyb2wuanMiLCJsaWIvY29tcG9uZW50cy9oZWxwZXJzL29iamVjdC1pdGVtLWtleS5qcyIsImxpYi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWl0ZW0tdmFsdWUuanMiLCJsaWIvY29tcG9uZW50cy9oZWxwZXJzL29iamVjdC1pdGVtLmpzIiwibGliL2NvbXBvbmVudHMvaGVscGVycy9yZW1vdmUtaXRlbS5qcyIsImxpYi9jb21wb25lbnRzL2hlbHBlcnMvc2FtcGxlLmpzIiwibGliL2NvbXBvbmVudHMvaGVscGVycy9zZWxlY3QtdmFsdWUuanMiLCJsaWIvZGVmYXVsdC1jb25maWcuanMiLCJsaWIvZm9ybWF0aWMuanMiLCJsaWIvbWl4aW5zL2NsaWNrLW91dHNpZGUuanMiLCJsaWIvbWl4aW5zL2ZpZWxkLmpzIiwibGliL21peGlucy9oZWxwZXIuanMiLCJsaWIvbWl4aW5zL2lucHV0LWFjdGlvbnMuanMiLCJsaWIvbWl4aW5zL3Jlc2l6ZS5qcyIsImxpYi9taXhpbnMvc2Nyb2xsLmpzIiwibGliL21peGlucy91bmRvLXN0YWNrLmpzIiwibGliL3BsdWdpbnMvYm9vdHN0cmFwLmpzIiwibGliL3BsdWdpbnMvbWV0YS5qcyIsImxpYi9wbHVnaW5zL3JlZmVyZW5jZS5qcyIsImxpYi91dGlscy5qcyIsImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2p5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2eUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC5saXN0XG5cbi8qXG5SZW5kZXIgYSBsaXN0LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG52YXIgQ1NTVHJhbnNpdGlvbkdyb3VwID0gUmVhY3QuY3JlYXRlRmFjdG9yeShSZWFjdC5hZGRvbnMuQ1NTVHJhbnNpdGlvbkdyb3VwKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdBcnJheScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIC8vIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAvLyAgIHJldHVybiB7XG4gIC8vICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lXG4gIC8vICAgfTtcbiAgLy8gfSxcblxuICBuZXh0TG9va3VwSWQ6IDAsXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAvLyBOZWVkIHRvIGNyZWF0ZSBhcnRpZmljaWFsIGtleXMgZm9yIHRoZSBhcnJheS4gSW5kZXhlcyBhcmUgbm90IGdvb2Qga2V5cyxcbiAgICAvLyBzaW5jZSB0aGV5IGNoYW5nZS4gU28sIG1hcCBlYWNoIHBvc2l0aW9uIHRvIGFuIGFydGlmaWNpYWwga2V5XG4gICAgdmFyIGxvb2t1cHMgPSBbXTtcblxuICAgIHZhciBpdGVtcyA9IHRoaXMucHJvcHMuZmllbGQudmFsdWU7XG5cbiAgICBpdGVtcy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtLCBpKSB7XG4gICAgICBsb29rdXBzW2ldID0gJ18nICsgdGhpcy5uZXh0TG9va3VwSWQ7XG4gICAgICB0aGlzLm5leHRMb29rdXBJZCsrO1xuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgbG9va3VwczogbG9va3Vwc1xuICAgIH07XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gKG5ld1Byb3BzKSB7XG5cbiAgICB2YXIgbG9va3VwcyA9IHRoaXMuc3RhdGUubG9va3VwcztcblxuICAgIHZhciBpdGVtcyA9IG5ld1Byb3BzLmZpZWxkLnZhbHVlO1xuXG4gICAgLy8gTmVlZCB0byBzZXQgYXJ0aWZpY2lhbCBrZXlzIGZvciBuZXcgYXJyYXkgaXRlbXMuXG4gICAgaWYgKGl0ZW1zLmxlbmd0aCA+IGxvb2t1cHMubGVuZ3RoKSB7XG4gICAgICBmb3IgKHZhciBpID0gbG9va3Vwcy5sZW5ndGg7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsb29rdXBzW2ldID0gJ18nICsgdGhpcy5uZXh0TG9va3VwSWQ7XG4gICAgICAgIHRoaXMubmV4dExvb2t1cElkKys7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBsb29rdXBzOiBsb29rdXBzXG4gICAgfSk7XG4gIH0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChpLCBuZXdWYWx1ZSwgaW5mbykge1xuICAgIHZhciBuZXdBcnJheVZhbHVlID0gdGhpcy5wcm9wcy5maWVsZC52YWx1ZS5zbGljZSgwKTtcbiAgICBuZXdBcnJheVZhbHVlW2ldID0gbmV3VmFsdWU7XG4gICAgdGhpcy5vbkJ1YmJsZVZhbHVlKG5ld0FycmF5VmFsdWUsIGluZm8pO1xuICB9LFxuXG4gIG9uQXBwZW5kOiBmdW5jdGlvbiAoaXRlbUNob2ljZUluZGV4KSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICB2YXIgbmV3VmFsdWUgPSBjb25maWcuY3JlYXRlTmV3Q2hpbGRGaWVsZFZhbHVlKGZpZWxkLCBpdGVtQ2hvaWNlSW5kZXgpO1xuXG4gICAgdmFyIGl0ZW1zID0gZmllbGQudmFsdWU7XG5cbiAgICBpdGVtcyA9IGl0ZW1zLmNvbmNhdChuZXdWYWx1ZSk7XG5cbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUoaXRlbXMpO1xuICB9LFxuXG4gIG9uUmVtb3ZlOiBmdW5jdGlvbiAoaSkge1xuICAgIHZhciBsb29rdXBzID0gdGhpcy5zdGF0ZS5sb29rdXBzO1xuICAgIGxvb2t1cHMuc3BsaWNlKGksIDEpO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgbG9va3VwczogbG9va3Vwc1xuICAgIH0pO1xuICAgIHZhciBuZXdJdGVtcyA9IHRoaXMucHJvcHMuZmllbGQudmFsdWUuc2xpY2UoMCk7XG4gICAgbmV3SXRlbXMuc3BsaWNlKGksIDEpO1xuICAgIHRoaXMub25DaGFuZ2VWYWx1ZShuZXdJdGVtcyk7XG4gIH0sXG5cbiAgb25Nb3ZlOiBmdW5jdGlvbiAoZnJvbUluZGV4LCB0b0luZGV4KSB7XG4gICAgdmFyIGxvb2t1cHMgPSB0aGlzLnN0YXRlLmxvb2t1cHM7XG4gICAgdmFyIGZyb21JZCA9IGxvb2t1cHNbZnJvbUluZGV4XTtcbiAgICB2YXIgdG9JZCA9IGxvb2t1cHNbdG9JbmRleF07XG4gICAgbG9va3Vwc1tmcm9tSW5kZXhdID0gdG9JZDtcbiAgICBsb29rdXBzW3RvSW5kZXhdID0gZnJvbUlkO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgbG9va3VwczogbG9va3Vwc1xuICAgIH0pO1xuXG4gICAgdmFyIG5ld0l0ZW1zID0gdGhpcy5wcm9wcy5maWVsZC52YWx1ZS5zbGljZSgwKTtcbiAgICBpZiAoZnJvbUluZGV4ICE9PSB0b0luZGV4ICYmXG4gICAgICBmcm9tSW5kZXggPj0gMCAmJiBmcm9tSW5kZXggPCBuZXdJdGVtcy5sZW5ndGggJiZcbiAgICAgIHRvSW5kZXggPj0gMCAmJiB0b0luZGV4IDwgbmV3SXRlbXMubGVuZ3RoXG4gICAgKSB7XG4gICAgICBuZXdJdGVtcy5zcGxpY2UodG9JbmRleCwgMCwgbmV3SXRlbXMuc3BsaWNlKGZyb21JbmRleCwgMSlbMF0pO1xuICAgIH1cbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUobmV3SXRlbXMpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHZhciBmaWVsZHMgPSBjb25maWcuY3JlYXRlQ2hpbGRGaWVsZHMoZmllbGQpO1xuXG4gICAgdmFyIG51bUl0ZW1zID0gZmllbGQudmFsdWUubGVuZ3RoO1xuICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQnLCB7XG4gICAgICBmaWVsZDogZmllbGQsIHBsYWluOiB0aGlzLnByb3BzLnBsYWluXG4gICAgfSxcbiAgICAgIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3Nlcyl9LFxuICAgICAgICBDU1NUcmFuc2l0aW9uR3JvdXAoe3RyYW5zaXRpb25OYW1lOiAncmV2ZWFsJ30sXG4gICAgICAgIGZpZWxkcy5tYXAoZnVuY3Rpb24gKGNoaWxkRmllbGQsIGkpIHtcbiAgICAgICAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2FycmF5LWl0ZW0nLCB7XG4gICAgICAgICAgICBrZXk6IHRoaXMuc3RhdGUubG9va3Vwc1tpXSxcbiAgICAgICAgICAgIGZpZWxkOiBjaGlsZEZpZWxkLFxuICAgICAgICAgICAgaW5kZXg6IGksXG4gICAgICAgICAgICBudW1JdGVtczogbnVtSXRlbXMsXG4gICAgICAgICAgICBvbk1vdmU6IHRoaXMub25Nb3ZlLFxuICAgICAgICAgICAgb25SZW1vdmU6IHRoaXMub25SZW1vdmUsXG4gICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgICAgICAgIG9uQWN0aW9uOiB0aGlzLm9uQnViYmxlQWN0aW9uXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSkpLFxuICAgICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgnYXJyYXktY29udHJvbCcsIHtmaWVsZDogZmllbGQsIG9uQXBwZW5kOiB0aGlzLm9uQXBwZW5kfSlcbiAgICAgIClcbiAgICApO1xuICB9XG59KTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdCb29sZWFuJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChuZXdWYWx1ZSkge1xuICAgIHRoaXMub25DaGFuZ2VWYWx1ZShuZXdWYWx1ZSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgdmFyIGNob2ljZXMgPSBjb25maWcuZmllbGRCb29sZWFuQ2hvaWNlcyhmaWVsZCk7XG5cbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywge1xuICAgICAgZmllbGQ6IGZpZWxkLCBwbGFpbjogdGhpcy5wcm9wcy5wbGFpblxuICAgIH0sIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdzZWxlY3QtdmFsdWUnLCB7XG4gICAgICBjaG9pY2VzOiBjaG9pY2VzLCBmaWVsZDogZmllbGQsIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLCBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvblxuICAgIH0pKTtcbiAgfVxufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50LmNoZWNrYm94LWxpc3RcblxuLypcblVzZWQgd2l0aCBhcnJheSB2YWx1ZXMgdG8gc3VwcGx5IG11bHRpcGxlIGNoZWNrYm94ZXMgZm9yIGFkZGluZyBtdWx0aXBsZVxuZW51bWVyYXRlZCB2YWx1ZXMgdG8gYW4gYXJyYXkuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdDaGVja2JveExpc3QnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY2hvaWNlczogdGhpcy5wcm9wcy5jb25maWcuZmllbGRDaG9pY2VzKHRoaXMucHJvcHMuZmllbGQpXG4gICAgfTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV3UHJvcHMpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGNob2ljZXM6IG5ld1Byb3BzLmNvbmZpZy5maWVsZENob2ljZXMobmV3UHJvcHMuZmllbGQpXG4gICAgfSk7XG4gIH0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBHZXQgYWxsIHRoZSBjaGVja2VkIGNoZWNrYm94ZXMgYW5kIGNvbnZlcnQgdG8gYW4gYXJyYXkgb2YgdmFsdWVzLlxuICAgIHZhciBjaG9pY2VOb2RlcyA9IHRoaXMucmVmcy5jaG9pY2VzLmdldERPTU5vZGUoKS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW5wdXQnKTtcbiAgICBjaG9pY2VOb2RlcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGNob2ljZU5vZGVzLCAwKTtcbiAgICB2YXIgdmFsdWVzID0gY2hvaWNlTm9kZXMubWFwKGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICByZXR1cm4gbm9kZS5jaGVja2VkID8gbm9kZS52YWx1ZSA6IG51bGw7XG4gICAgfSkuZmlsdGVyKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0pO1xuICAgIHRoaXMub25DaGFuZ2VWYWx1ZSh2YWx1ZXMpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHZhciBjaG9pY2VzID0gdGhpcy5zdGF0ZS5jaG9pY2VzIHx8IFtdO1xuXG4gICAgdmFyIGlzSW5saW5lID0gIV8uZmluZChjaG9pY2VzLCBmdW5jdGlvbiAoY2hvaWNlKSB7XG4gICAgICByZXR1cm4gY2hvaWNlLnNhbXBsZTtcbiAgICB9KTtcblxuICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQnLCB7XG4gICAgICBmaWVsZDogZmllbGRcbiAgICB9LFxuICAgICAgUi5kaXYoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSwgcmVmOiAnY2hvaWNlcyd9LFxuICAgICAgICBjaG9pY2VzLm1hcChmdW5jdGlvbiAoY2hvaWNlLCBpKSB7XG5cbiAgICAgICAgICB2YXIgaW5wdXRGaWVsZCA9IFIuc3Bhbih7c3R5bGU6IHt3aGl0ZVNwYWNlOiAnbm93cmFwJ319LFxuICAgICAgICAgICAgUi5pbnB1dCh7XG4gICAgICAgICAgICAgIG5hbWU6IGZpZWxkLmtleSxcbiAgICAgICAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgICAgICAgdmFsdWU6IGNob2ljZS52YWx1ZSxcbiAgICAgICAgICAgICAgY2hlY2tlZDogZmllbGQudmFsdWUuaW5kZXhPZihjaG9pY2UudmFsdWUpID49IDAgPyB0cnVlIDogZmFsc2UsXG4gICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgICAgICAgICBvbkZvY3VzOiB0aGlzLm9uRm9jdXNBY3Rpb24sXG4gICAgICAgICAgICAgIG9uQmx1cjogdGhpcy5vbkJsdXJBY3Rpb25cbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgJyAnLFxuICAgICAgICAgICAgUi5zcGFuKHtjbGFzc05hbWU6ICdmaWVsZC1jaG9pY2UtbGFiZWwnfSxcbiAgICAgICAgICAgICAgY2hvaWNlLmxhYmVsXG4gICAgICAgICAgICApXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIGlmIChpc0lubGluZSkge1xuICAgICAgICAgICAgcmV0dXJuIFIuc3Bhbih7a2V5OiBpLCBjbGFzc05hbWU6ICdmaWVsZC1jaG9pY2UnfSxcbiAgICAgICAgICAgICAgaW5wdXRGaWVsZCwgJyAnXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gUi5kaXYoe2tleTogaSwgY2xhc3NOYW1lOiAnZmllbGQtY2hvaWNlJ30sXG4gICAgICAgICAgICAgIGlucHV0RmllbGQsICcgJyxcbiAgICAgICAgICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ3NhbXBsZScsIHtmaWVsZDogZmllbGQsIGNob2ljZTogY2hvaWNlfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdDb3B5JyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpfSxcbiAgICAgIHRoaXMucHJvcHMuY29uZmlnLmZpZWxkSGVscFRleHQodGhpcy5wcm9wcy5maWVsZClcbiAgICApO1xuICB9XG59KTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG52YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnRmllbGRzJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgb25DaGFuZ2VGaWVsZDogZnVuY3Rpb24gKGtleSwgbmV3VmFsdWUsIGluZm8pIHtcbiAgICBpZiAoa2V5KSB7XG4gICAgICB2YXIgbmV3T2JqZWN0VmFsdWUgPSBfLmV4dGVuZCh7fSwgdGhpcy5wcm9wcy5maWVsZC52YWx1ZSk7XG4gICAgICBuZXdPYmplY3RWYWx1ZVtrZXldID0gbmV3VmFsdWU7XG4gICAgICB0aGlzLm9uQnViYmxlVmFsdWUobmV3T2JqZWN0VmFsdWUsIGluZm8pO1xuICAgIH1cbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgdmFyIGZpZWxkcyA9IGNvbmZpZy5jcmVhdGVDaGlsZEZpZWxkcyhmaWVsZCk7XG5cbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywge1xuICAgICAgY29uZmlnOiBjb25maWcsIGZpZWxkOiBmaWVsZCwgcGxhaW46IHRoaXMucHJvcHMucGxhaW5cbiAgICB9LFxuICAgICAgUi5maWVsZHNldCh7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpfSxcbiAgICAgICAgZmllbGRzLm1hcChmdW5jdGlvbiAoY2hpbGRGaWVsZCwgaSkge1xuICAgICAgICAgIHZhciBrZXkgPSBjaGlsZEZpZWxkLmtleSB8fCBpO1xuICAgICAgICAgIHJldHVybiBjb25maWcuY3JlYXRlRmllbGRFbGVtZW50KHtcbiAgICAgICAgICAgIGtleToga2V5IHx8IGksXG4gICAgICAgICAgICBmaWVsZDogY2hpbGRGaWVsZCxcbiAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlRmllbGQuYmluZCh0aGlzLCBrZXkpLCBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvblxuICAgICAgICAgIH0pO1xuICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICApXG4gICAgKTtcbiAgfVxuXG59KTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQuanNvblxuXG4vKlxuVGV4dGFyZWEgZWRpdG9yIGZvciBKU09OLiBXaWxsIHZhbGlkYXRlIHRoZSBKU09OIGJlZm9yZSBzZXR0aW5nIHRoZSB2YWx1ZSwgc29cbndoaWxlIHRoZSB2YWx1ZSBpcyBpbnZhbGlkLCBubyBleHRlcm5hbCBzdGF0ZSBjaGFuZ2VzIHdpbGwgb2NjdXIuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnSnNvbicsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICByb3dzOiA1XG4gICAgfTtcbiAgfSxcblxuICBpc1ZhbGlkVmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuXG4gICAgdHJ5IHtcbiAgICAgIEpTT04ucGFyc2UodmFsdWUpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaXNWYWxpZDogdHJ1ZSxcbiAgICAgIHZhbHVlOiBKU09OLnN0cmluZ2lmeSh0aGlzLnByb3BzLmZpZWxkLnZhbHVlLCBudWxsLCAyKVxuICAgIH07XG4gIH0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHZhciBpc1ZhbGlkID0gdGhpcy5pc1ZhbGlkVmFsdWUoZXZlbnQudGFyZ2V0LnZhbHVlKTtcblxuICAgIGlmIChpc1ZhbGlkKSB7XG4gICAgICAvLyBOZWVkIHRvIGhhbmRsZSB0aGlzIGJldHRlci4gTmVlZCB0byB0cmFjayBwb3NpdGlvbi5cbiAgICAgIHRoaXMuX2lzQ2hhbmdpbmcgPSB0cnVlO1xuICAgICAgdGhpcy5vbkNoYW5nZVZhbHVlKEpTT04ucGFyc2UoZXZlbnQudGFyZ2V0LnZhbHVlKSk7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBpc1ZhbGlkOiBpc1ZhbGlkLFxuICAgICAgdmFsdWU6IGV2ZW50LnRhcmdldC52YWx1ZVxuICAgIH0pO1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXh0UHJvcHMpIHtcbiAgICBpZiAoIXRoaXMuX2lzQ2hhbmdpbmcpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBpc1ZhbGlkOiB0cnVlLFxuICAgICAgICB2YWx1ZTogSlNPTi5zdHJpbmdpZnkobmV4dFByb3BzLmZpZWxkLnZhbHVlLCBudWxsLCAyKVxuICAgICAgfSk7XG4gICAgfVxuICAgIHRoaXMuX2lzQ2hhbmdpbmcgPSBmYWxzZTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHtcbiAgICAgIGZpZWxkOiBjb25maWcuZmllbGRXaXRoVmFsdWUoZmllbGQsIHRoaXMuc3RhdGUudmFsdWUpLCBwbGFpbjogdGhpcy5wcm9wcy5wbGFpblxuICAgIH0sIFIudGV4dGFyZWEoe1xuICAgICAgICBjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcyksXG4gICAgICAgIHZhbHVlOiB0aGlzLnN0YXRlLnZhbHVlLFxuICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgICAgc3R5bGU6IHtiYWNrZ3JvdW5kQ29sb3I6IHRoaXMuc3RhdGUuaXNWYWxpZCA/ICcnIDogJ3JnYigyNTUsMjAwLDIwMCknfSxcbiAgICAgICAgcm93czogY29uZmlnLmZpZWxkUm93cyhmaWVsZCkgfHwgdGhpcy5wcm9wcy5yb3dzLFxuICAgICAgICBvbkZvY3VzOiB0aGlzLm9uRm9jdXNBY3Rpb24sXG4gICAgICAgIG9uQmx1cjogdGhpcy5vbkJsdXJBY3Rpb25cbiAgICAgIH0pXG4gICAgKTtcbiAgfVxufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50Lm9iamVjdFxuXG4vKlxuUmVuZGVyIGFuIG9iamVjdC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG52YXIgQ1NTVHJhbnNpdGlvbkdyb3VwID0gUmVhY3QuY3JlYXRlRmFjdG9yeShSZWFjdC5hZGRvbnMuQ1NTVHJhbnNpdGlvbkdyb3VwKTtcblxudmFyIHRlbXBLZXlQcmVmaXggPSAnJCRfX3RlbXBfXyc7XG5cbnZhciB0ZW1wS2V5ID0gZnVuY3Rpb24gKGlkKSB7XG4gIHJldHVybiB0ZW1wS2V5UHJlZml4ICsgaWQ7XG59O1xuXG52YXIgaXNUZW1wS2V5ID0gZnVuY3Rpb24gKGtleSkge1xuICByZXR1cm4ga2V5LnN1YnN0cmluZygwLCB0ZW1wS2V5UHJlZml4Lmxlbmd0aCkgPT09IHRlbXBLZXlQcmVmaXg7XG59O1xuXG4vLyBUT0RPOiBrZWVwIGludmFsaWQga2V5cyBhcyBzdGF0ZSBhbmQgZG9uJ3Qgc2VuZCBpbiBvbkNoYW5nZTsgY2xvbmUgY29udGV4dFxuLy8gYW5kIHVzZSBjbG9uZSB0byBjcmVhdGUgY2hpbGQgY29udGV4dHNcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdPYmplY3QnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICBuZXh0TG9va3VwSWQ6IDAsXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIga2V5VG9JZCA9IHt9O1xuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXModGhpcy5wcm9wcy5maWVsZC52YWx1ZSk7XG4gICAgdmFyIGtleU9yZGVyID0gW107XG4gICAgLy8gVGVtcCBrZXlzIGtlZXBzIHRoZSBrZXkgdG8gZGlzcGxheSwgd2hpY2ggc29tZXRpbWVzIG1heSBiZSBkaWZmZXJlbnRcbiAgICAvLyB0aGFuIHRoZSBhY3R1YWwga2V5LiBGb3IgZXhhbXBsZSwgZHVwbGljYXRlIGtleXMgYXJlIG5vdCBhbGxvd2VkLFxuICAgIC8vIGJ1dCB3ZSBtYXkgdGVtcG9yYXJpbHkgc2hvdyBkdXBsaWNhdGUga2V5cy5cbiAgICB2YXIgdGVtcERpc3BsYXlLZXlzID0ge307XG5cbiAgICAvLyBLZXlzIGRvbid0IG1ha2UgZ29vZCByZWFjdCBrZXlzLCBzaW5jZSB3ZSdyZSBhbGxvd2luZyB0aGVtIHRvIGJlXG4gICAgLy8gY2hhbmdlZCBoZXJlLCBzbyB3ZSdsbCBoYXZlIHRvIGNyZWF0ZSBmYWtlIGtleXMgYW5kXG4gICAgLy8ga2VlcCB0cmFjayBvZiB0aGUgbWFwcGluZyBvZiByZWFsIGtleXMgdG8gZmFrZSBrZXlzLiBZdWNrLlxuICAgIGtleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICB2YXIgaWQgPSArK3RoaXMubmV4dExvb2t1cElkO1xuICAgICAgLy8gTWFwIHRoZSByZWFsIGtleSB0byB0aGUgaWQuXG4gICAgICBrZXlUb0lkW2tleV0gPSBpZDtcbiAgICAgIC8vIEtlZXAgdGhlIG9yZGVyaW5nIG9mIHRoZSBrZXlzIHNvIHdlIGRvbid0IHNodWZmbGUgdGhpbmdzIGFyb3VuZCBsYXRlci5cbiAgICAgIGtleU9yZGVyLnB1c2goa2V5KTtcbiAgICAgIC8vIElmIHRoaXMgaXMgYSB0ZW1wb3Jhcnkga2V5IHRoYXQgd2FzIHBlcnNpc3RlZCwgYmVzdCB3ZSBjYW4gZG8gaXMgZGlzcGxheVxuICAgICAgLy8gYSBibGFuay5cbiAgICAgIC8vIFRPRE86IFByb2JhYmx5IGp1c3Qgbm90IHNlbmQgdGVtcG9yYXJ5IGtleXMgYmFjayB0aHJvdWdoLiBUaGlzIGJlaGF2aW9yXG4gICAgICAvLyBpcyBhY3R1YWxseSBsZWZ0b3ZlciBmcm9tIGFuIGVhcmxpZXIgaW5jYXJuYXRpb24gb2YgZm9ybWF0aWMgd2hlcmVcbiAgICAgIC8vIHZhbHVlcyBoYWQgdG8gZ28gYmFjayB0byB0aGUgcm9vdC5cbiAgICAgIGlmIChpc1RlbXBLZXkoa2V5KSkge1xuICAgICAgICB0ZW1wRGlzcGxheUtleXNbaWRdID0gJyc7XG4gICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIHJldHVybiB7XG4gICAgICBrZXlUb0lkOiBrZXlUb0lkLFxuICAgICAga2V5T3JkZXI6IGtleU9yZGVyLFxuICAgICAgLy8gVGVtcCBrZXlzIGtlZXBzIHRoZSBrZXkgdG8gZGlzcGxheSwgd2hpY2ggc29tZXRpbWVzIG1heSBiZSBkaWZmZXJlbnRcbiAgICAgIC8vIHRoYW4gdGhlIGFjdHVhbCBrZXkuIEZvciBleGFtcGxlLCBkdXBsaWNhdGUga2V5cyBhcmUgbm90IGFsbG93ZWQsXG4gICAgICAvLyBidXQgd2UgbWF5IHRlbXBvcmFyaWx5IHNob3cgZHVwbGljYXRlIGtleXMuXG4gICAgICB0ZW1wRGlzcGxheUtleXM6IHRlbXBEaXNwbGF5S2V5c1xuICAgIH07XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gKG5ld1Byb3BzKSB7XG5cbiAgICB2YXIga2V5VG9JZCA9IHRoaXMuc3RhdGUua2V5VG9JZDtcbiAgICB2YXIgbmV3S2V5VG9JZCA9IHt9O1xuICAgIHZhciB0ZW1wRGlzcGxheUtleXMgPSB0aGlzLnN0YXRlLnRlbXBEaXNwbGF5S2V5cztcbiAgICB2YXIgbmV3VGVtcERpc3BsYXlLZXlzID0ge307XG4gICAgdmFyIGtleU9yZGVyID0gdGhpcy5zdGF0ZS5rZXlPcmRlcjtcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG5ld1Byb3BzLmZpZWxkLnZhbHVlKTtcbiAgICB2YXIgYWRkZWRLZXlzID0gW107XG5cbiAgICAvLyBMb29rIGF0IHRoZSBuZXcga2V5cy5cbiAgICBrZXlzLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgLy8gQWRkIG5ldyBsb29rdXAgaWYgdGhpcyBrZXkgd2Fzbid0IGhlcmUgbGFzdCB0aW1lLlxuICAgICAgaWYgKCFrZXlUb0lkW2tleV0pIHtcbiAgICAgICAgdGhpcy5uZXh0TG9va3VwSWQrKztcbiAgICAgICAgbmV3S2V5VG9JZFtrZXldID0gdGhpcy5uZXh0TG9va3VwSWQ7XG4gICAgICAgIGFkZGVkS2V5cy5wdXNoKGtleSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXdLZXlUb0lkW2tleV0gPSBrZXlUb0lkW2tleV07XG4gICAgICB9XG4gICAgICBpZiAoaXNUZW1wS2V5KGtleSkgJiYgbmV3S2V5VG9JZFtrZXldIGluIHRlbXBEaXNwbGF5S2V5cykge1xuICAgICAgICBuZXdUZW1wRGlzcGxheUtleXNbbmV3S2V5VG9JZFtrZXldXSA9IHRlbXBEaXNwbGF5S2V5c1tuZXdLZXlUb0lkW2tleV1dO1xuICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICB2YXIgbmV3S2V5T3JkZXIgPSBbXTtcblxuICAgIC8vIExvb2sgYXQgdGhlIG9sZCBrZXlzLlxuICAgIGtleU9yZGVyLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgLy8gSWYgdGhlIGtleSBpcyBpbiB0aGUgbmV3IGtleXMsIHB1c2ggaXQgb250byB0aGUgb3JkZXIgdG8gcmV0YWluIHRoZVxuICAgICAgLy8gc2FtZSBvcmRlci5cbiAgICAgIGlmIChuZXdLZXlUb0lkW2tleV0pIHtcbiAgICAgICAgbmV3S2V5T3JkZXIucHVzaChrZXkpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gUHV0IGFkZGVkIGZpZWxkcyBhdCB0aGUgZW5kLiAoU28gdGhpbmdzIGRvbid0IGdldCBzaHVmZmxlZC4pXG4gICAgbmV3S2V5T3JkZXIgPSBuZXdLZXlPcmRlci5jb25jYXQoYWRkZWRLZXlzKTtcblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAga2V5VG9JZDogbmV3S2V5VG9JZCxcbiAgICAgIGtleU9yZGVyOiBuZXdLZXlPcmRlcixcbiAgICAgIHRlbXBEaXNwbGF5S2V5czogbmV3VGVtcERpc3BsYXlLZXlzXG4gICAgfSk7XG4gIH0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChrZXksIG5ld1ZhbHVlLCBpbmZvKSB7XG4gICAgdmFyIG5ld09iaiA9IF8uZXh0ZW5kKHt9LCB0aGlzLnByb3BzLmZpZWxkLnZhbHVlKTtcbiAgICBuZXdPYmpba2V5XSA9IG5ld1ZhbHVlO1xuICAgIHRoaXMub25CdWJibGVWYWx1ZShuZXdPYmosIGluZm8pO1xuICB9LFxuXG4gIG9uQXBwZW5kOiBmdW5jdGlvbiAoaXRlbUNob2ljZUluZGV4KSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG4gICAgdGhpcy5uZXh0TG9va3VwSWQrKztcblxuICAgIHZhciBrZXlUb0lkID0gdGhpcy5zdGF0ZS5rZXlUb0lkO1xuICAgIHZhciBrZXlPcmRlciA9IHRoaXMuc3RhdGUua2V5T3JkZXI7XG4gICAgdmFyIHRlbXBEaXNwbGF5S2V5cyA9IHRoaXMuc3RhdGUudGVtcERpc3BsYXlLZXlzO1xuXG4gICAgdmFyIGlkID0gdGhpcy5uZXh0TG9va3VwSWQ7XG4gICAgdmFyIG5ld0tleSA9IHRlbXBLZXkoaWQpO1xuXG4gICAga2V5VG9JZFtuZXdLZXldID0gaWQ7XG4gICAgLy8gVGVtcG9yYXJpbHksIHdlJ2xsIHNob3cgYSBibGFuayBrZXkuXG4gICAgdGVtcERpc3BsYXlLZXlzW2lkXSA9ICcnO1xuICAgIGtleU9yZGVyLnB1c2gobmV3S2V5KTtcblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAga2V5VG9JZDoga2V5VG9JZCxcbiAgICAgIHRlbXBEaXNwbGF5S2V5czogdGVtcERpc3BsYXlLZXlzLFxuICAgICAga2V5T3JkZXI6IGtleU9yZGVyXG4gICAgfSk7XG5cbiAgICB2YXIgbmV3T2JqID0gXy5leHRlbmQodGhpcy5wcm9wcy5maWVsZC52YWx1ZSk7XG5cbiAgICB2YXIgbmV3VmFsdWUgPSBjb25maWcuY3JlYXRlTmV3Q2hpbGRGaWVsZFZhbHVlKGZpZWxkLCBpdGVtQ2hvaWNlSW5kZXgpO1xuXG4gICAgbmV3T2JqW25ld0tleV0gPSBuZXdWYWx1ZTtcblxuICAgIHRoaXMub25DaGFuZ2VWYWx1ZShuZXdPYmopO1xuICB9LFxuXG4gIG9uUmVtb3ZlOiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIG5ld09iaiA9IF8uZXh0ZW5kKHRoaXMucHJvcHMuZmllbGQudmFsdWUpO1xuICAgIGRlbGV0ZSBuZXdPYmpba2V5XTtcbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUobmV3T2JqKTtcbiAgfSxcblxuICBvbk1vdmU6IGZ1bmN0aW9uIChmcm9tS2V5LCB0b0tleSkge1xuICAgIGlmIChmcm9tS2V5ICE9PSB0b0tleSkge1xuICAgICAgdmFyIGtleVRvSWQgPSB0aGlzLnN0YXRlLmtleVRvSWQ7XG4gICAgICB2YXIga2V5T3JkZXIgPSB0aGlzLnN0YXRlLmtleU9yZGVyO1xuICAgICAgdmFyIHRlbXBEaXNwbGF5S2V5cyA9IHRoaXMuc3RhdGUudGVtcERpc3BsYXlLZXlzO1xuXG4gICAgICB2YXIgbmV3T2JqID0gXy5leHRlbmQodGhpcy5wcm9wcy5maWVsZC52YWx1ZSk7XG5cbiAgICAgIC8vIElmIHdlIGFscmVhZHkgaGF2ZSB0aGUga2V5IHdlJ3JlIG1vdmluZyB0bywgdGhlbiB3ZSBoYXZlIHRvIGNoYW5nZSB0aGF0XG4gICAgICAvLyBrZXkgdG8gc29tZXRoaW5nIGVsc2UuXG4gICAgICBpZiAoa2V5VG9JZFt0b0tleV0pIHtcbiAgICAgICAgLy8gTWFrZSBhIG5ld1xuICAgICAgICB2YXIgdGVtcFRvS2V5ID0gdGVtcEtleShrZXlUb0lkW3RvS2V5XSk7XG4gICAgICAgIHRlbXBEaXNwbGF5S2V5c1trZXlUb0lkW3RvS2V5XV0gPSB0b0tleTtcbiAgICAgICAga2V5VG9JZFt0ZW1wVG9LZXldID0ga2V5VG9JZFt0b0tleV07XG4gICAgICAgIGtleU9yZGVyW2tleU9yZGVyLmluZGV4T2YodG9LZXkpXSA9IHRlbXBUb0tleTtcbiAgICAgICAgZGVsZXRlIGtleVRvSWRbdG9LZXldO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBrZXlUb0lkOiBrZXlUb0lkLFxuICAgICAgICAgIHRlbXBEaXNwbGF5S2V5czogdGVtcERpc3BsYXlLZXlzLFxuICAgICAgICAgIGtleU9yZGVyOiBrZXlPcmRlclxuICAgICAgICB9KTtcblxuICAgICAgICBuZXdPYmpbdGVtcFRvS2V5XSA9IG5ld09ialt0b0tleV07XG4gICAgICAgIGRlbGV0ZSBuZXdPYmpbdG9LZXldO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRvS2V5KSB7XG4gICAgICAgIHRvS2V5ID0gdGVtcEtleShrZXlUb0lkW2Zyb21LZXldKTtcbiAgICAgICAgdGVtcERpc3BsYXlLZXlzW2tleVRvSWRbZnJvbUtleV1dID0gJyc7XG4gICAgICB9XG4gICAgICBrZXlUb0lkW3RvS2V5XSA9IGtleVRvSWRbZnJvbUtleV07XG4gICAgICBkZWxldGUga2V5VG9JZFtmcm9tS2V5XTtcbiAgICAgIGtleU9yZGVyW2tleU9yZGVyLmluZGV4T2YoZnJvbUtleSldID0gdG9LZXk7XG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBrZXlUb0lkOiBrZXlUb0lkLFxuICAgICAgICBrZXlPcmRlcjoga2V5T3JkZXIsXG4gICAgICAgIHRlbXBEaXNwbGF5S2V5czogdGVtcERpc3BsYXlLZXlzXG4gICAgICB9KTtcblxuICAgICAgbmV3T2JqW3RvS2V5XSA9IG5ld09ialtmcm9tS2V5XTtcbiAgICAgIGRlbGV0ZSBuZXdPYmpbZnJvbUtleV07XG5cbiAgICAgIHRoaXMub25DaGFuZ2VWYWx1ZShuZXdPYmopO1xuXG4gICAgICAvLyBDaGVjayBpZiBvdXIgZnJvbUtleSBoYXMgb3BlbmVkIHVwIGEgc3BvdC5cbiAgICAgIGlmIChmcm9tS2V5ICYmIGZyb21LZXkgIT09IHRvS2V5KSB7XG4gICAgICAgIGlmICghKGZyb21LZXkgaW4gbmV3T2JqKSkge1xuICAgICAgICAgIE9iamVjdC5rZXlzKG5ld09iaikuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICBpZiAoIShpc1RlbXBLZXkoa2V5KSkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGlkID0ga2V5VG9JZFtrZXldO1xuICAgICAgICAgICAgdmFyIGRpc3BsYXlLZXkgPSB0ZW1wRGlzcGxheUtleXNbaWRdO1xuICAgICAgICAgICAgaWYgKGZyb21LZXkgPT09IGRpc3BsYXlLZXkpIHtcbiAgICAgICAgICAgICAgdGhpcy5vbk1vdmUoa2V5LCBkaXNwbGF5S2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIGdldEZpZWxkczogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgdmFyIGZpZWxkcyA9IGNvbmZpZy5jcmVhdGVDaGlsZEZpZWxkcyhmaWVsZCk7XG5cbiAgICB2YXIga2V5VG9GaWVsZCA9IHt9O1xuXG4gICAgXy5lYWNoKGZpZWxkcywgZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICBrZXlUb0ZpZWxkW2ZpZWxkLmtleV0gPSBmaWVsZDtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzLnN0YXRlLmtleU9yZGVyLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICByZXR1cm4ga2V5VG9GaWVsZFtrZXldO1xuICAgIH0pO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHZhciBmaWVsZHMgPSB0aGlzLmdldEZpZWxkcygpO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHtcbiAgICAgIGZpZWxkOiBmaWVsZCwgcGxhaW46IHRoaXMucHJvcHMucGxhaW5cbiAgICB9LFxuICAgICAgUi5kaXYoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKX0sXG4gICAgICAgIENTU1RyYW5zaXRpb25Hcm91cCh7dHJhbnNpdGlvbk5hbWU6ICdyZXZlYWwnfSxcbiAgICAgICAgICBmaWVsZHMubWFwKGZ1bmN0aW9uIChjaGlsZEZpZWxkKSB7XG4gICAgICAgICAgICB2YXIgZGlzcGxheUtleSA9IHRoaXMuc3RhdGUudGVtcERpc3BsYXlLZXlzW3RoaXMuc3RhdGUua2V5VG9JZFtjaGlsZEZpZWxkLmtleV1dO1xuICAgICAgICAgICAgaWYgKF8uaXNVbmRlZmluZWQoZGlzcGxheUtleSkpIHtcbiAgICAgICAgICAgICAgZGlzcGxheUtleSA9IGNoaWxkRmllbGQua2V5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdvYmplY3QtaXRlbScsIHtcbiAgICAgICAgICAgICAga2V5OiB0aGlzLnN0YXRlLmtleVRvSWRbY2hpbGRGaWVsZC5rZXldLFxuICAgICAgICAgICAgICBmaWVsZDogY2hpbGRGaWVsZCxcbiAgICAgICAgICAgICAgb25Nb3ZlOiB0aGlzLm9uTW92ZSxcbiAgICAgICAgICAgICAgb25SZW1vdmU6IHRoaXMub25SZW1vdmUsXG4gICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgICAgICAgICBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvbixcbiAgICAgICAgICAgICAgZGlzcGxheUtleTogZGlzcGxheUtleSxcbiAgICAgICAgICAgICAgaXRlbUtleTogY2hpbGRGaWVsZC5rZXlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgKSxcbiAgICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ29iamVjdC1jb250cm9sJywge2ZpZWxkOiBmaWVsZCwgb25BcHBlbmQ6IHRoaXMub25BcHBlbmR9KVxuICAgICAgKVxuICAgICk7XG4gIH1cbn0pO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC5wcmV0dHktdGV4dGFyZWFcblxuLypcblRleHRhcmVhIHRoYXQgd2lsbCBkaXNwbGF5IGhpZ2hsaWdodHMgYmVoaW5kIFwidGFnc1wiLiBUYWdzIGN1cnJlbnRseSBtZWFuIHRleHRcbnRoYXQgaXMgZW5jbG9zZWQgaW4gYnJhY2VzIGxpa2UgYHt7Zm9vfX1gLiBUYWdzIGFyZSByZXBsYWNlZCB3aXRoIGxhYmVscyBpZlxuYXZhaWxhYmxlIG9yIGh1bWFuaXplZC5cblxuVGhpcyBjb21wb25lbnQgaXMgcXVpdGUgY29tcGxpY2F0ZWQgYmVjYXVzZTpcbi0gV2UgYXJlIGRpc3BsYXlpbmcgdGV4dCBpbiB0aGUgdGV4dGFyZWEgYnV0IGhhdmUgdG8ga2VlcCB0cmFjayBvZiB0aGUgcmVhbFxuICB0ZXh0IHZhbHVlIGluIHRoZSBiYWNrZ3JvdW5kLiBXZSBjYW4ndCB1c2UgYSBkYXRhIGF0dHJpYnV0ZSwgYmVjYXVzZSBpdCdzIGFcbiAgdGV4dGFyZWEsIHNvIHdlIGNhbid0IHVzZSBhbnkgZWxlbWVudHMgYXQgYWxsIVxuLSBCZWNhdXNlIG9mIHRoZSBoaWRkZW4gZGF0YSwgd2UgYWxzbyBoYXZlIHRvIGRvIHNvbWUgaW50ZXJjZXB0aW9uIG9mXG4gIGNvcHksIHdoaWNoIGlzIGEgbGl0dGxlIHdlaXJkLiBXZSBpbnRlcmNlcHQgY29weSBhbmQgY29weSB0aGUgcmVhbCB0ZXh0XG4gIHRvIHRoZSBlbmQgb2YgdGhlIHRleHRhcmVhLiBUaGVuIHdlIGVyYXNlIHRoYXQgdGV4dCwgd2hpY2ggbGVhdmVzIHRoZSBjb3BpZWRcbiAgZGF0YSBpbiB0aGUgYnVmZmVyLlxuLSBSZWFjdCBsb3NlcyB0aGUgY2FyZXQgcG9zaXRpb24gd2hlbiB5b3UgdXBkYXRlIHRoZSB2YWx1ZSB0byBzb21ldGhpbmdcbiAgZGlmZmVyZW50IHRoYW4gYmVmb3JlLiBTbyB3ZSBoYXZlIHRvIHJldGFpbiB0cmFja2luZyBpbmZvcm1hdGlvbiBmb3Igd2hlblxuICB0aGF0IGhhcHBlbnMuXG4tIEJlY2F1c2Ugd2UgbW9ua2V5IHdpdGggY29weSwgd2UgYWxzbyBoYXZlIHRvIGRvIG91ciBvd24gdW5kby9yZWRvLiBPdGhlcndpc2VcbiAgdGhlIGRlZmF1bHQgdW5kbyB3aWxsIGhhdmUgd2VpcmQgc3RhdGVzIGluIGl0LlxuXG5TbyBnb29kIGx1Y2shXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMnKTtcblxudmFyIG5vQnJlYWsgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoLyAvZywgJ1xcdTAwYTAnKTtcbn07XG5cbnZhciBMRUZUX1BBRCA9ICdcXHUwMGEwXFx1MDBhMCc7XG4vLyBXaHkgdGhpcyB3b3JrcywgSSdtIG5vdCBzdXJlLlxudmFyIFJJR0hUX1BBRCA9ICcgICc7IC8vJ1xcdTAwYTBcXHUwMGEwJztcblxudmFyIGlkUHJlZml4UmVnRXggPSAvXlswLTldK19fLztcblxuLy8gWmFwaWVyIHNwZWNpZmljIHN0dWZmLiBNYWtlIGEgcGx1Z2luIGZvciB0aGlzIGxhdGVyLlxudmFyIHJlbW92ZUlkUHJlZml4ID0gZnVuY3Rpb24gKGtleSkge1xuICBpZiAoaWRQcmVmaXhSZWdFeC50ZXN0KGtleSkpIHtcbiAgICByZXR1cm4ga2V5LnJlcGxhY2UoaWRQcmVmaXhSZWdFeCwgJycpO1xuICB9XG4gIHJldHVybiBrZXk7XG59O1xuXG52YXIgcG9zaXRpb25Jbk5vZGUgPSBmdW5jdGlvbiAocG9zaXRpb24sIG5vZGUpIHtcbiAgdmFyIHJlY3QgPSBub2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICBpZiAocG9zaXRpb24ueCA+PSByZWN0LmxlZnQgJiYgcG9zaXRpb24ueCA8PSByZWN0LnJpZ2h0KSB7XG4gICAgaWYgKHBvc2l0aW9uLnkgPj0gcmVjdC50b3AgJiYgcG9zaXRpb24ueSA8PSByZWN0LmJvdHRvbSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG59O1xuXG4vLyBXcmFwIGEgdGV4dCB2YWx1ZSBzbyBpdCBoYXMgYSB0eXBlLiBGb3IgcGFyc2luZyB0ZXh0IHdpdGggdGFncy5cbnZhciB0ZXh0UGFydCA9IGZ1bmN0aW9uICh2YWx1ZSwgdHlwZSkge1xuICB0eXBlID0gdHlwZSB8fCAndGV4dCc7XG4gIHJldHVybiB7XG4gICAgdHlwZTogdHlwZSxcbiAgICB2YWx1ZTogdmFsdWVcbiAgfTtcbn07XG5cbi8vIFBhcnNlIHRleHQgdGhhdCBoYXMgdGFncyBsaWtlIHt7dGFnfX0gaW50byB0ZXh0IGFuZCB0YWdzLlxudmFyIHBhcnNlVGV4dFdpdGhUYWdzID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHZhbHVlID0gdmFsdWUgfHwgJyc7XG4gIHZhciBwYXJ0cyA9IHZhbHVlLnNwbGl0KC97eyg/IXspLyk7XG4gIHZhciBmcm9udFBhcnQgPSBbXTtcbiAgaWYgKHBhcnRzWzBdICE9PSAnJykge1xuICAgIGZyb250UGFydCA9IFtcbiAgICB0ZXh0UGFydChwYXJ0c1swXSlcbiAgICBdO1xuICB9XG4gIHBhcnRzID0gZnJvbnRQYXJ0LmNvbmNhdChcbiAgICBwYXJ0cy5zbGljZSgxKS5tYXAoZnVuY3Rpb24gKHBhcnQpIHtcbiAgICAgIGlmIChwYXJ0LmluZGV4T2YoJ319JykgPj0gMCkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICB0ZXh0UGFydChwYXJ0LnN1YnN0cmluZygwLCBwYXJ0LmluZGV4T2YoJ319JykpLCAndGFnJyksXG4gICAgICAgIHRleHRQYXJ0KHBhcnQuc3Vic3RyaW5nKHBhcnQuaW5kZXhPZignfX0nKSArIDIpKVxuICAgICAgICBdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRleHRQYXJ0KCd7eycgKyBwYXJ0LCAndGV4dCcpO1xuICAgICAgfVxuICAgIH0pXG4gICk7XG4gIHJldHVybiBbXS5jb25jYXQuYXBwbHkoW10sIHBhcnRzKTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdUYWdnZWRUZXh0JyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKSwgcmVxdWlyZSgnLi4vLi4vbWl4aW5zL3VuZG8tc3RhY2snKSwgcmVxdWlyZSgnLi4vLi4vbWl4aW5zL3Jlc2l6ZScpXSxcblxuICAvL1xuICAvLyBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgLy8gICByZXR1cm4ge1xuICAvLyAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZVxuICAvLyAgIH07XG4gIC8vIH0sXG5cbiAgZ2V0UmVwbGFjZVN0YXRlOiBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICB2YXIgcmVwbGFjZUNob2ljZXMgPSBwcm9wcy5jb25maWcuZmllbGRSZXBsYWNlQ2hvaWNlcyhwcm9wcy5maWVsZCk7XG4gICAgdmFyIHJlcGxhY2VDaG9pY2VzTGFiZWxzID0ge307XG4gICAgcmVwbGFjZUNob2ljZXMuZm9yRWFjaChmdW5jdGlvbiAoY2hvaWNlKSB7XG4gICAgICByZXBsYWNlQ2hvaWNlc0xhYmVsc1tjaG9pY2UudmFsdWVdID0gY2hvaWNlLmxhYmVsO1xuICAgIH0pO1xuICAgIHJldHVybiB7XG4gICAgICByZXBsYWNlQ2hvaWNlczogcmVwbGFjZUNob2ljZXMsXG4gICAgICByZXBsYWNlQ2hvaWNlc0xhYmVsczogcmVwbGFjZUNob2ljZXNMYWJlbHNcbiAgICB9O1xuICB9LFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHZhciByZXBsYWNlU3RhdGUgPSB0aGlzLmdldFJlcGxhY2VTdGF0ZSh0aGlzLnByb3BzKTtcblxuICAgIHJldHVybiB7XG4gICAgICB1bmRvRGVwdGg6IDEwMCxcbiAgICAgIGlzQ2hvaWNlc09wZW46IGZhbHNlLFxuICAgICAgaG92ZXJQaWxsUmVmOiBudWxsLFxuICAgICAgcmVwbGFjZUNob2ljZXM6IHJlcGxhY2VTdGF0ZS5yZXBsYWNlQ2hvaWNlcyxcbiAgICAgIHJlcGxhY2VDaG9pY2VzTGFiZWxzOiByZXBsYWNlU3RhdGUucmVwbGFjZUNob2ljZXNMYWJlbHNcbiAgICB9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXdQcm9wcykge1xuICAgIHRoaXMuc2V0U3RhdGUodGhpcy5nZXRSZXBsYWNlU3RhdGUobmV3UHJvcHMpKTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBOb3QgcXVpdGUgc3RhdGUsIHRoaXMgaXMgZm9yIHRyYWNraW5nIHNlbGVjdGlvbiBpbmZvLlxuICAgIHRoaXMudHJhY2tpbmcgPSB7fTtcblxuICAgIHZhciBwYXJ0cyA9IHBhcnNlVGV4dFdpdGhUYWdzKHRoaXMucHJvcHMuZmllbGQudmFsdWUpO1xuICAgIHZhciB0b2tlbnMgPSB0aGlzLnRva2VucyhwYXJ0cyk7XG4gICAgdmFyIGluZGV4TWFwID0gdGhpcy5pbmRleE1hcCh0b2tlbnMpO1xuXG4gICAgdGhpcy50cmFja2luZy5wb3MgPSBpbmRleE1hcC5sZW5ndGg7XG4gICAgdGhpcy50cmFja2luZy5yYW5nZSA9IDA7XG4gICAgdGhpcy50cmFja2luZy50b2tlbnMgPSB0b2tlbnM7XG4gICAgdGhpcy50cmFja2luZy5pbmRleE1hcCA9IGluZGV4TWFwO1xuICB9LFxuXG4gIGdldFN0YXRlU25hcHNob3Q6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmFsdWU6IHRoaXMucHJvcHMuZmllbGQudmFsdWUsXG4gICAgICBwb3M6IHRoaXMudHJhY2tpbmcucG9zLFxuICAgICAgcmFuZ2U6IHRoaXMudHJhY2tpbmcucmFuZ2VcbiAgICB9O1xuICB9LFxuXG4gIHNldFN0YXRlU25hcHNob3Q6IGZ1bmN0aW9uIChzbmFwc2hvdCkge1xuICAgIHRoaXMudHJhY2tpbmcucG9zID0gc25hcHNob3QucG9zO1xuICAgIHRoaXMudHJhY2tpbmcucmFuZ2UgPSBzbmFwc2hvdC5yYW5nZTtcbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUoc25hcHNob3QudmFsdWUpO1xuICB9LFxuXG4gIC8vIFR1cm4gaW50byBpbmRpdmlkdWFsIGNoYXJhY3RlcnMgYW5kIHRhZ3NcbiAgdG9rZW5zOiBmdW5jdGlvbiAocGFydHMpIHtcbiAgICByZXR1cm4gW10uY29uY2F0LmFwcGx5KFtdLCBwYXJ0cy5tYXAoZnVuY3Rpb24gKHBhcnQpIHtcbiAgICAgIGlmIChwYXJ0LnR5cGUgPT09ICd0YWcnKSB7XG4gICAgICAgIHJldHVybiBwYXJ0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHBhcnQudmFsdWUuc3BsaXQoJycpO1xuICAgICAgfVxuICAgIH0pKTtcbiAgfSxcblxuICAvLyBNYXAgZWFjaCB0ZXh0YXJlYSBpbmRleCBiYWNrIHRvIGEgdG9rZW5cbiAgaW5kZXhNYXA6IGZ1bmN0aW9uICh0b2tlbnMpIHtcbiAgICB2YXIgaW5kZXhNYXAgPSBbXTtcbiAgICBfLmVhY2godG9rZW5zLCBmdW5jdGlvbiAodG9rZW4sIHRva2VuSW5kZXgpIHtcbiAgICAgIGlmICh0b2tlbi50eXBlID09PSAndGFnJykge1xuICAgICAgICB2YXIgbGFiZWwgPSBMRUZUX1BBRCArIG5vQnJlYWsodGhpcy5wcmV0dHlMYWJlbCh0b2tlbi52YWx1ZSkpICsgUklHSFRfUEFEO1xuICAgICAgICB2YXIgbGFiZWxDaGFycyA9IGxhYmVsLnNwbGl0KCcnKTtcbiAgICAgICAgXy5lYWNoKGxhYmVsQ2hhcnMsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBpbmRleE1hcC5wdXNoKHRva2VuSW5kZXgpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGluZGV4TWFwLnB1c2godG9rZW5JbmRleCk7XG4gICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgICByZXR1cm4gaW5kZXhNYXA7XG4gIH0sXG5cbiAgLy8gTWFrZSBoaWdobGlnaHQgc2Nyb2xsIG1hdGNoIHRleHRhcmVhIHNjcm9sbFxuICBvblNjcm9sbDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucmVmcy5oaWdobGlnaHQuZ2V0RE9NTm9kZSgpLnNjcm9sbFRvcCA9IHRoaXMucmVmcy5jb250ZW50LmdldERPTU5vZGUoKS5zY3JvbGxUb3A7XG4gICAgdGhpcy5yZWZzLmhpZ2hsaWdodC5nZXRET01Ob2RlKCkuc2Nyb2xsTGVmdCA9IHRoaXMucmVmcy5jb250ZW50LmdldERPTU5vZGUoKS5zY3JvbGxMZWZ0O1xuICB9LFxuXG4gIC8vIEdpdmVuIHNvbWUgcG9zdGlvbiwgcmV0dXJuIHRoZSB0b2tlbiBpbmRleCAocG9zaXRpb24gY291bGQgYmUgaW4gdGhlIG1pZGRsZSBvZiBhIHRva2VuKVxuICB0b2tlbkluZGV4OiBmdW5jdGlvbiAocG9zLCB0b2tlbnMsIGluZGV4TWFwKSB7XG4gICAgaWYgKHBvcyA8IDApIHtcbiAgICAgIHBvcyA9IDA7XG4gICAgfSBlbHNlIGlmIChwb3MgPj0gaW5kZXhNYXAubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gdG9rZW5zLmxlbmd0aDtcbiAgICB9XG4gICAgcmV0dXJuIGluZGV4TWFwW3Bvc107XG4gIH0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgIC8vY29uc29sZS5sb2coJ2NoYW5nZTonLCBldmVudC50YXJnZXQudmFsdWUpO1xuXG4gICAgdmFyIG5vZGUgPSBldmVudC50YXJnZXQ7XG5cbiAgICAvLyBUcmFja2luZyBpcyBob2xkaW5nIHByZXZpb3VzIHBvc2l0aW9uIGFuZCByYW5nZVxuICAgIHZhciBwcmV2UG9zID0gdGhpcy50cmFja2luZy5wb3M7XG4gICAgdmFyIHByZXZSYW5nZSA9IHRoaXMudHJhY2tpbmcucmFuZ2U7XG5cbiAgICAvLyBOZXcgcG9zaXRpb25cbiAgICB2YXIgcG9zID0gbm9kZS5zZWxlY3Rpb25TdGFydDtcblxuICAgIC8vIEdvaW5nIHRvIG11dGF0ZSB0aGUgdG9rZW5zLlxuICAgIHZhciB0b2tlbnMgPSB0aGlzLnRyYWNraW5nLnRva2VucztcblxuICAgIC8vIFVzaW5nIHRoZSBwcmV2aW91cyBwb3NpdGlvbiBhbmQgcmFuZ2UsIGdldCB0aGUgcHJldmlvdXMgdG9rZW4gcG9zaXRpb25cbiAgICAvLyBhbmQgcmFuZ2VcbiAgICB2YXIgcHJldlRva2VuSW5kZXggPSB0aGlzLnRva2VuSW5kZXgocHJldlBvcywgdG9rZW5zLCB0aGlzLnRyYWNraW5nLmluZGV4TWFwKTtcbiAgICB2YXIgcHJldlRva2VuRW5kSW5kZXggPSB0aGlzLnRva2VuSW5kZXgocHJldlBvcyArIHByZXZSYW5nZSwgdG9rZW5zLCB0aGlzLnRyYWNraW5nLmluZGV4TWFwKTtcbiAgICB2YXIgcHJldlRva2VuUmFuZ2UgPSBwcmV2VG9rZW5FbmRJbmRleCAtIHByZXZUb2tlbkluZGV4O1xuXG4gICAgLy8gV2lwZSBvdXQgYW55IHRva2VucyBpbiB0aGUgc2VsZWN0ZWQgcmFuZ2UgYmVjYXVzZSB0aGUgY2hhbmdlIHdvdWxkIGhhdmVcbiAgICAvLyBlcmFzZWQgdGhhdCBzZWxlY3Rpb24uXG4gICAgaWYgKHByZXZUb2tlblJhbmdlID4gMCkge1xuICAgICAgdG9rZW5zLnNwbGljZShwcmV2VG9rZW5JbmRleCwgcHJldlRva2VuUmFuZ2UpO1xuICAgICAgdGhpcy50cmFja2luZy5pbmRleE1hcCA9IHRoaXMuaW5kZXhNYXAodG9rZW5zKTtcbiAgICB9XG5cbiAgICAvLyBJZiBjdXJzb3IgaGFzIG1vdmVkIGZvcndhcmQsIHRoZW4gdGV4dCB3YXMgYWRkZWQuXG4gICAgaWYgKHBvcyA+IHByZXZQb3MpIHtcbiAgICAgIHZhciBhZGRlZFRleHQgPSBub2RlLnZhbHVlLnN1YnN0cmluZyhwcmV2UG9zLCBwb3MpO1xuICAgICAgLy8gSW5zZXJ0IHRoZSB0ZXh0IGludG8gdGhlIHRva2Vucy5cbiAgICAgIHRva2Vucy5zcGxpY2UocHJldlRva2VuSW5kZXgsIDAsIGFkZGVkVGV4dCk7XG4gICAgLy8gSWYgY3Vyc29yIGhhcyBtb3ZlZCBiYWNrd2FyZCwgdGhlbiB3ZSBkZWxldGVkIChiYWNrc3BhY2VkKSB0ZXh0XG4gICAgfSBpZiAocG9zIDwgcHJldlBvcykge1xuICAgICAgdmFyIHRva2VuID0gdGhpcy50b2tlbkF0KHBvcyk7XG4gICAgICB2YXIgdG9rZW5CZWZvcmUgPSB0aGlzLnRva2VuQmVmb3JlKHBvcyk7XG4gICAgICAvLyBJZiB3ZSBtb3ZlZCBiYWNrIG9udG8gYSB0b2tlbiwgdGhlbiB3ZSBzaG91bGQgbW92ZSBiYWNrIHRvIGJlZ2lubmluZ1xuICAgICAgLy8gb2YgdG9rZW4uXG4gICAgICBpZiAodG9rZW4gPT09IHRva2VuQmVmb3JlKSB7XG4gICAgICAgIHBvcyA9IHRoaXMubW92ZU9mZlRhZyhwb3MsIHRva2VucywgdGhpcy5pbmRleE1hcCh0b2tlbnMpLCAtMSk7XG4gICAgICB9XG4gICAgICB2YXIgdG9rZW5JbmRleCA9IHRoaXMudG9rZW5JbmRleChwb3MsIHRva2VucywgdGhpcy50cmFja2luZy5pbmRleE1hcCk7XG4gICAgICAvLyBOb3cgd2UgY2FuIHJlbW92ZSB0aGUgdG9rZW5zIHRoYXQgd2VyZSBkZWxldGVkLlxuICAgICAgdG9rZW5zLnNwbGljZSh0b2tlbkluZGV4LCBwcmV2VG9rZW5JbmRleCAtIHRva2VuSW5kZXgpO1xuICAgIH1cblxuICAgIC8vIENvbnZlcnQgdG9rZW5zIGJhY2sgaW50byByYXcgdmFsdWUgd2l0aCB0YWdzLiBOZXdseSBmb3JtZWQgdGFncyB3aWxsXG4gICAgLy8gYmVjb21lIHBhcnQgb2YgdGhlIHJhdyB2YWx1ZS5cbiAgICB2YXIgcmF3VmFsdWUgPSB0aGlzLnJhd1ZhbHVlKHRva2Vucyk7XG5cbiAgICB0aGlzLnRyYWNraW5nLnBvcyA9IHBvcztcbiAgICB0aGlzLnRyYWNraW5nLnJhbmdlID0gMDtcblxuICAgIC8vIFNldCB0aGUgdmFsdWUgdG8gdGhlIG5ldyByYXcgdmFsdWUuXG4gICAgdGhpcy5vbkNoYW5nZVZhbHVlKHJhd1ZhbHVlKTtcblxuICAgIHRoaXMuc25hcHNob3QoKTtcbiAgfSxcblxuICBjb21wb25lbnREaWRVcGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdmFsdWUgPSB0aGlzLnByb3BzLmZpZWxkLnZhbHVlIHx8ICcnO1xuICAgIHZhciBwYXJ0cyA9IHBhcnNlVGV4dFdpdGhUYWdzKHZhbHVlKTtcbiAgICB0aGlzLnRyYWNraW5nLnRva2VucyA9IHRoaXMudG9rZW5zKHBhcnRzKTtcbiAgICB0aGlzLnRyYWNraW5nLmluZGV4TWFwID0gdGhpcy5pbmRleE1hcCh0aGlzLnRyYWNraW5nLnRva2Vucyk7XG5cbiAgICB2YXIgcG9zID0gdGhpcy5ub3JtYWxpemVQb3NpdGlvbih0aGlzLnRyYWNraW5nLnBvcyk7XG4gICAgdmFyIHJhbmdlID0gdGhpcy50cmFja2luZy5yYW5nZTtcbiAgICB2YXIgZW5kUG9zID0gdGhpcy5ub3JtYWxpemVQb3NpdGlvbihwb3MgKyByYW5nZSk7XG4gICAgcmFuZ2UgPSBlbmRQb3MgLSBwb3M7XG5cbiAgICB0aGlzLnRyYWNraW5nLnBvcyA9IHBvcztcbiAgICB0aGlzLnRyYWNraW5nLnJhbmdlID0gcmFuZ2U7XG5cbiAgICBpZiAoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCA9PT0gdGhpcy5yZWZzLmNvbnRlbnQuZ2V0RE9NTm9kZSgpKSB7XG4gICAgICAvLyBSZWFjdCBjYW4gbG9zZSB0aGUgc2VsZWN0aW9uLCBzbyBwdXQgaXQgYmFjay5cbiAgICAgIHRoaXMucmVmcy5jb250ZW50LmdldERPTU5vZGUoKS5zZXRTZWxlY3Rpb25SYW5nZShwb3MsIHBvcyArIHJhbmdlKTtcbiAgICB9XG4gIH0sXG5cbiAgLy8gR2V0IHRoZSBsYWJlbCBmb3IgYSBrZXkuXG4gIHByZXR0eUxhYmVsOiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgaWYgKHRoaXMuc3RhdGUucmVwbGFjZUNob2ljZXNMYWJlbHNba2V5XSkge1xuICAgICAgcmV0dXJuIHRoaXMuc3RhdGUucmVwbGFjZUNob2ljZXNMYWJlbHNba2V5XTtcbiAgICB9XG4gICAgdmFyIGNsZWFuZWQgPSByZW1vdmVJZFByZWZpeChrZXkpO1xuICAgIHJldHVybiB0aGlzLnByb3BzLmNvbmZpZy5odW1hbml6ZShjbGVhbmVkKTtcbiAgfSxcblxuICAvLyBHaXZlbiB0aGUgYWN0dWFsIHZhbHVlIG9mIHRoZSBmaWVsZCAod2l0aCB0YWdzKSwgZ2V0IHRoZSBwbGFpbiB0ZXh0IHRoYXRcbiAgLy8gc2hvdWxkIHNob3cgaW4gdGhlIHRleHRhcmVhLlxuICBwbGFpblZhbHVlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YXIgcGFydHMgPSBwYXJzZVRleHRXaXRoVGFncyh2YWx1ZSk7XG4gICAgcmV0dXJuIHBhcnRzLm1hcChmdW5jdGlvbiAocGFydCkge1xuICAgICAgaWYgKHBhcnQudHlwZSA9PT0gJ3RleHQnKSB7XG4gICAgICAgIHJldHVybiBwYXJ0LnZhbHVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIExFRlRfUEFEICsgbm9CcmVhayh0aGlzLnByZXR0eUxhYmVsKHBhcnQudmFsdWUpKSArIFJJR0hUX1BBRDtcbiAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpLmpvaW4oJycpO1xuICB9LFxuXG4gIC8vIEdpdmVuIHRoZSBhY3R1YWwgdmFsdWUgb2YgdGhlIGZpZWxkICh3aXRoIHRhZ3MpLCBnZXQgdGhlIGh0bWwgdXNlZCB0b1xuICAvLyBoaWdobGlnaHQgdGhlIGxhYmVscy5cbiAgcHJldHR5VmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHZhciBwYXJ0cyA9IHBhcnNlVGV4dFdpdGhUYWdzKHZhbHVlKTtcbiAgICByZXR1cm4gcGFydHMubWFwKGZ1bmN0aW9uIChwYXJ0LCBpKSB7XG4gICAgICBpZiAocGFydC50eXBlID09PSAndGV4dCcpIHtcbiAgICAgICAgaWYgKGkgPT09IChwYXJ0cy5sZW5ndGggLSAxKSkge1xuICAgICAgICAgIGlmIChwYXJ0LnZhbHVlW3BhcnQudmFsdWUubGVuZ3RoIC0gMV0gPT09ICdcXG4nKSB7XG4gICAgICAgICAgICByZXR1cm4gcGFydC52YWx1ZSArICdcXHUwMGEwJztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBhcnQudmFsdWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBNYWtlIGEgcGlsbFxuICAgICAgICB2YXIgcGlsbFJlZiA9ICdwcmV0dHlQYXJ0JyArIGk7XG4gICAgICAgIHZhciBjbGFzc05hbWUgPSAncHJldHR5LXBhcnQnO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5ob3ZlclBpbGxSZWYgJiYgcGlsbFJlZiA9PT0gdGhpcy5zdGF0ZS5ob3ZlclBpbGxSZWYpIHtcbiAgICAgICAgICBjbGFzc05hbWUgKz0gJyBwcmV0dHktcGFydC1ob3Zlcic7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFIuc3Bhbih7a2V5OiBpLCBjbGFzc05hbWU6IGNsYXNzTmFtZSwgcmVmOiBwaWxsUmVmLCAnZGF0YS1wcmV0dHknOiB0cnVlLCAnZGF0YS1yZWYnOiBwaWxsUmVmfSxcbiAgICAgICAgICBSLnNwYW4oe2NsYXNzTmFtZTogJ3ByZXR0eS1wYXJ0LWxlZnQnfSwgTEVGVF9QQUQpLFxuICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAncHJldHR5LXBhcnQtdGV4dCd9LCBub0JyZWFrKHRoaXMucHJldHR5TGFiZWwocGFydC52YWx1ZSkpKSxcbiAgICAgICAgICBSLnNwYW4oe2NsYXNzTmFtZTogJ3ByZXR0eS1wYXJ0LXJpZ2h0J30sIFJJR0hUX1BBRClcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xuICB9LFxuXG4gIC8vIEdpdmVuIHRoZSB0b2tlbnMgZm9yIGEgZmllbGQsIGdldCB0aGUgYWN0dWFsIHZhbHVlIG9mIHRoZSBmaWVsZCAod2l0aFxuICAvLyB0YWdzKVxuICByYXdWYWx1ZTogZnVuY3Rpb24gKHRva2Vucykge1xuICAgIHJldHVybiB0b2tlbnMubWFwKGZ1bmN0aW9uICh0b2tlbikge1xuICAgICAgaWYgKHRva2VuLnR5cGUgPT09ICd0YWcnKSB7XG4gICAgICAgIHJldHVybiAne3snICsgdG9rZW4udmFsdWUgKyAnfX0nO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRva2VuO1xuICAgICAgfVxuICAgIH0pLmpvaW4oJycpO1xuICB9LFxuXG4gIC8vIEdpdmVuIGEgcG9zaXRpb24sIGlmIGl0J3Mgb24gYSBsYWJlbCwgZ2V0IHRoZSBwb3NpdGlvbiBsZWZ0IG9yIHJpZ2h0IG9mXG4gIC8vIHRoZSBsYWJlbCwgYmFzZWQgb24gZGlyZWN0aW9uIGFuZC9vciB3aGljaCBzaWRlIGlzIGNsb3NlclxuICBtb3ZlT2ZmVGFnOiBmdW5jdGlvbiAocG9zLCB0b2tlbnMsIGluZGV4TWFwLCBkaXIpIHtcbiAgICBpZiAodHlwZW9mIGRpciA9PT0gJ3VuZGVmaW5lZCcgfHwgZGlyID4gMCkge1xuICAgICAgZGlyID0gMTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGlyID0gLTE7XG4gICAgfVxuICAgIHZhciB0b2tlbjtcbiAgICBpZiAoZGlyID4gMCkge1xuICAgICAgdG9rZW4gPSB0b2tlbnNbaW5kZXhNYXBbcG9zXV07XG4gICAgICB3aGlsZSAocG9zIDwgaW5kZXhNYXAubGVuZ3RoICYmIHRva2Vuc1tpbmRleE1hcFtwb3NdXS50eXBlID09PSAndGFnJyAmJiB0b2tlbnNbaW5kZXhNYXBbcG9zXV0gPT09IHRva2VuKSB7XG4gICAgICAgIHBvcysrO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0b2tlbiA9IHRva2Vuc1tpbmRleE1hcFtwb3MgLSAxXV07XG4gICAgICB3aGlsZSAocG9zID4gMCAmJiB0b2tlbnNbaW5kZXhNYXBbcG9zIC0gMV1dLnR5cGUgPT09ICd0YWcnICYmIHRva2Vuc1tpbmRleE1hcFtwb3MgLSAxXV0gPT09IHRva2VuKSB7XG4gICAgICAgIHBvcy0tO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBwb3M7XG4gIH0sXG5cbiAgLy8gR2V0IHRoZSB0b2tlbiBhdCBzb21lIHBvc2l0aW9uLlxuICB0b2tlbkF0OiBmdW5jdGlvbiAocG9zKSB7XG4gICAgaWYgKHBvcyA+PSB0aGlzLnRyYWNraW5nLmluZGV4TWFwLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmIChwb3MgPCAwKSB7XG4gICAgICBwb3MgPSAwO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy50cmFja2luZy50b2tlbnNbdGhpcy50cmFja2luZy5pbmRleE1hcFtwb3NdXTtcbiAgfSxcblxuICAvLyBHZXQgdGhlIHRva2VuIGltbWVkaWF0ZWx5IGJlZm9yZSBzb21lIHBvc2l0aW9uLlxuICB0b2tlbkJlZm9yZTogZnVuY3Rpb24gKHBvcykge1xuICAgIGlmIChwb3MgPj0gdGhpcy50cmFja2luZy5pbmRleE1hcC5sZW5ndGgpIHtcbiAgICAgIHBvcyA9IHRoaXMudHJhY2tpbmcuaW5kZXhNYXAubGVuZ3RoO1xuICAgIH1cbiAgICBpZiAocG9zIDw9IDApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy50cmFja2luZy50b2tlbnNbdGhpcy50cmFja2luZy5pbmRleE1hcFtwb3MgLSAxXV07XG4gIH0sXG5cbiAgLy8gR2l2ZW4gYSBwb3NpdGlvbiwgZ2V0IGEgY29ycmVjdGVkIHBvc2l0aW9uIChpZiBuZWNlc3NhcnkgdG8gYmVcbiAgLy8gY29ycmVjdGVkKS5cbiAgbm9ybWFsaXplUG9zaXRpb246IGZ1bmN0aW9uIChwb3MsIHByZXZQb3MpIHtcbiAgICBpZiAoXy5pc1VuZGVmaW5lZChwcmV2UG9zKSkge1xuICAgICAgcHJldlBvcyA9IHBvcztcbiAgICB9XG4gICAgLy8gQXQgc3RhcnQgb3IgZW5kLCBzbyBva2F5LlxuICAgIGlmIChwb3MgPD0gMCB8fCBwb3MgPj0gdGhpcy50cmFja2luZy5pbmRleE1hcC5sZW5ndGgpIHtcbiAgICAgIGlmIChwb3MgPCAwKSB7XG4gICAgICAgIHBvcyA9IDA7XG4gICAgICB9XG4gICAgICBpZiAocG9zID4gdGhpcy50cmFja2luZy5pbmRleE1hcC5sZW5ndGgpIHtcbiAgICAgICAgcG9zID0gdGhpcy50cmFja2luZy5pbmRleE1hcC5sZW5ndGg7XG4gICAgICB9XG4gICAgICByZXR1cm4gcG9zO1xuICAgIH1cblxuICAgIHZhciB0b2tlbiA9IHRoaXMudG9rZW5BdChwb3MpO1xuICAgIHZhciB0b2tlbkJlZm9yZSA9IHRoaXMudG9rZW5CZWZvcmUocG9zKTtcblxuICAgIC8vIEJldHdlZW4gdHdvIHRva2Vucywgc28gb2theS5cbiAgICBpZiAodG9rZW4gIT09IHRva2VuQmVmb3JlKSB7XG4gICAgICByZXR1cm4gcG9zO1xuICAgIH1cblxuICAgIHZhciBwcmV2VG9rZW4gPSB0aGlzLnRva2VuQXQocHJldlBvcyk7XG4gICAgdmFyIHByZXZUb2tlbkJlZm9yZSA9IHRoaXMudG9rZW5CZWZvcmUocHJldlBvcyk7XG5cbiAgICB2YXIgcmlnaHRQb3MgPSB0aGlzLm1vdmVPZmZUYWcocG9zLCB0aGlzLnRyYWNraW5nLnRva2VucywgdGhpcy50cmFja2luZy5pbmRleE1hcCk7XG4gICAgdmFyIGxlZnRQb3MgPSB0aGlzLm1vdmVPZmZUYWcocG9zLCB0aGlzLnRyYWNraW5nLnRva2VucywgdGhpcy50cmFja2luZy5pbmRleE1hcCwgLTEpO1xuXG4gICAgaWYgKHByZXZUb2tlbiAhPT0gcHJldlRva2VuQmVmb3JlKSB7XG4gICAgICAvLyBNb3ZlZCBmcm9tIGxlZnQgZWRnZS5cbiAgICAgIGlmIChwcmV2VG9rZW4gPT09IHRva2VuKSB7XG4gICAgICAgIHJldHVybiByaWdodFBvcztcbiAgICAgIH1cbiAgICAgIC8vIE1vdmVkIGZyb20gcmlnaHQgZWRnZS5cbiAgICAgIGlmIChwcmV2VG9rZW5CZWZvcmUgPT09IHRva2VuKSB7XG4gICAgICAgIHJldHVybiBsZWZ0UG9zO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBuZXdQb3MgPSByaWdodFBvcztcblxuICAgIGlmIChwb3MgPT09IHByZXZQb3MgfHwgcG9zIDwgcHJldlBvcykge1xuICAgICAgaWYgKHJpZ2h0UG9zIC0gcG9zID4gcG9zIC0gbGVmdFBvcykge1xuICAgICAgICBuZXdQb3MgPSBsZWZ0UG9zO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3UG9zO1xuICB9LFxuXG5cblxuICBvblNlbGVjdDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdmFyIG5vZGUgPSBldmVudC50YXJnZXQ7XG5cbiAgICB2YXIgcG9zID0gbm9kZS5zZWxlY3Rpb25TdGFydDtcbiAgICB2YXIgZW5kUG9zID0gbm9kZS5zZWxlY3Rpb25FbmQ7XG5cbiAgICBpZiAocG9zID09PSBlbmRQb3MgJiYgdGhpcy5zdGF0ZS5ob3ZlclBpbGxSZWYpIHtcbiAgICAgIHZhciB0b2tlbkF0ID0gdGhpcy50b2tlbkF0KHBvcyk7XG4gICAgICB2YXIgdG9rZW5CZWZvcmUgPSB0aGlzLnRva2VuQmVmb3JlKHBvcyk7XG5cbiAgICAgIGlmICh0b2tlbkF0ICYmIHRva2VuQXQgPT09IHRva2VuQmVmb3JlICYmIHRva2VuQXQudHlwZSAmJiB0b2tlbkF0LnR5cGUgPT09ICd0YWcnKSB7XG4gICAgICAgIC8vIENsaWNrZWQgYSB0YWcuXG4gICAgICAgIHZhciByaWdodFBvcyA9IHRoaXMubW92ZU9mZlRhZyhwb3MsIHRoaXMudHJhY2tpbmcudG9rZW5zLCB0aGlzLnRyYWNraW5nLmluZGV4TWFwKTtcbiAgICAgICAgdmFyIGxlZnRQb3MgPSB0aGlzLm1vdmVPZmZUYWcocG9zLCB0aGlzLnRyYWNraW5nLnRva2VucywgdGhpcy50cmFja2luZy5pbmRleE1hcCwgLTEpO1xuICAgICAgICB0aGlzLnRyYWNraW5nLnBvcyA9IGxlZnRQb3M7XG4gICAgICAgIHRoaXMudHJhY2tpbmcucmFuZ2UgPSByaWdodFBvcyAtIGxlZnRQb3M7XG4gICAgICAgIG5vZGUuc2VsZWN0aW9uU3RhcnQgPSBsZWZ0UG9zO1xuICAgICAgICBub2RlLnNlbGVjdGlvbkVuZCA9IHJpZ2h0UG9zO1xuXG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5pc0Nob2ljZXNPcGVuKSB7XG4gICAgICAgICAgdGhpcy5zZXRDaG9pY2VzT3Blbih0cnVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBwb3MgPSB0aGlzLm5vcm1hbGl6ZVBvc2l0aW9uKHBvcywgdGhpcy50cmFja2luZy5wb3MpO1xuICAgIGVuZFBvcyA9IHRoaXMubm9ybWFsaXplUG9zaXRpb24oZW5kUG9zLCB0aGlzLnRyYWNraW5nLnBvcyArIHRoaXMudHJhY2tpbmcucmFuZ2UpO1xuXG4gICAgdGhpcy50cmFja2luZy5wb3MgPSBwb3M7XG4gICAgdGhpcy50cmFja2luZy5yYW5nZSA9IGVuZFBvcyAtIHBvcztcblxuICAgIG5vZGUuc2VsZWN0aW9uU3RhcnQgPSBwb3M7XG4gICAgbm9kZS5zZWxlY3Rpb25FbmQgPSBlbmRQb3M7XG4gIH0sXG5cbiAgb25Db3B5OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG5vZGUgPSB0aGlzLnJlZnMuY29udGVudC5nZXRET01Ob2RlKCk7XG4gICAgdmFyIHN0YXJ0ID0gbm9kZS5zZWxlY3Rpb25TdGFydDtcbiAgICB2YXIgZW5kID0gbm9kZS5zZWxlY3Rpb25FbmQ7XG4gICAgdmFyIHRleHQgPSBub2RlLnZhbHVlLnN1YnN0cmluZyhzdGFydCwgZW5kKTtcbiAgICB2YXIgcmVhbFN0YXJ0SW5kZXggPSB0aGlzLnRva2VuSW5kZXgoc3RhcnQsIHRoaXMudHJhY2tpbmcudG9rZW5zLCB0aGlzLnRyYWNraW5nLmluZGV4TWFwKTtcbiAgICB2YXIgcmVhbEVuZEluZGV4ID0gdGhpcy50b2tlbkluZGV4KGVuZCwgdGhpcy50cmFja2luZy50b2tlbnMsIHRoaXMudHJhY2tpbmcuaW5kZXhNYXApO1xuICAgIHZhciB0b2tlbnMgPSB0aGlzLnRyYWNraW5nLnRva2Vucy5zbGljZShyZWFsU3RhcnRJbmRleCwgcmVhbEVuZEluZGV4KTtcbiAgICB0ZXh0ID0gdGhpcy5yYXdWYWx1ZSh0b2tlbnMpO1xuICAgIHZhciBvcmlnaW5hbFZhbHVlID0gbm9kZS52YWx1ZTtcbiAgICBub2RlLnZhbHVlID0gbm9kZS52YWx1ZSArIHRleHQ7XG4gICAgbm9kZS5zZXRTZWxlY3Rpb25SYW5nZShvcmlnaW5hbFZhbHVlLmxlbmd0aCwgb3JpZ2luYWxWYWx1ZS5sZW5ndGggKyB0ZXh0Lmxlbmd0aCk7XG4gICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICBub2RlLnZhbHVlID0gb3JpZ2luYWxWYWx1ZTtcbiAgICAgIG5vZGUuc2V0U2VsZWN0aW9uUmFuZ2Uoc3RhcnQsIGVuZCk7XG4gICAgfSwwKTtcbiAgfSxcblxuICBvbkN1dDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBub2RlID0gdGhpcy5yZWZzLmNvbnRlbnQuZ2V0RE9NTm9kZSgpO1xuICAgIHZhciBzdGFydCA9IG5vZGUuc2VsZWN0aW9uU3RhcnQ7XG4gICAgdmFyIGVuZCA9IG5vZGUuc2VsZWN0aW9uRW5kO1xuICAgIHZhciB0ZXh0ID0gbm9kZS52YWx1ZS5zdWJzdHJpbmcoc3RhcnQsIGVuZCk7XG4gICAgdmFyIHJlYWxTdGFydEluZGV4ID0gdGhpcy50b2tlbkluZGV4KHN0YXJ0LCB0aGlzLnRyYWNraW5nLnRva2VucywgdGhpcy50cmFja2luZy5pbmRleE1hcCk7XG4gICAgdmFyIHJlYWxFbmRJbmRleCA9IHRoaXMudG9rZW5JbmRleChlbmQsIHRoaXMudHJhY2tpbmcudG9rZW5zLCB0aGlzLnRyYWNraW5nLmluZGV4TWFwKTtcbiAgICB2YXIgdG9rZW5zID0gdGhpcy50cmFja2luZy50b2tlbnMuc2xpY2UocmVhbFN0YXJ0SW5kZXgsIHJlYWxFbmRJbmRleCk7XG4gICAgdGV4dCA9IHRoaXMucmF3VmFsdWUodG9rZW5zKTtcbiAgICB2YXIgb3JpZ2luYWxWYWx1ZSA9IG5vZGUudmFsdWU7XG4gICAgdmFyIGN1dFZhbHVlID0gbm9kZS52YWx1ZS5zdWJzdHJpbmcoMCwgc3RhcnQpICsgbm9kZS52YWx1ZS5zdWJzdHJpbmcoZW5kKTtcbiAgICBub2RlLnZhbHVlID0gbm9kZS52YWx1ZSArIHRleHQ7XG4gICAgbm9kZS5zZXRTZWxlY3Rpb25SYW5nZShvcmlnaW5hbFZhbHVlLmxlbmd0aCwgb3JpZ2luYWxWYWx1ZS5sZW5ndGggKyB0ZXh0Lmxlbmd0aCk7XG4gICAgdmFyIGN1dFRva2VucyA9IHRoaXMudHJhY2tpbmcudG9rZW5zLnNsaWNlKDAsIHJlYWxTdGFydEluZGV4KS5jb25jYXQodGhpcy50cmFja2luZy50b2tlbnMuc2xpY2UocmVhbEVuZEluZGV4KSk7XG4gICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICBub2RlLnZhbHVlID0gY3V0VmFsdWU7XG4gICAgICBub2RlLnNldFNlbGVjdGlvblJhbmdlKHN0YXJ0LCBzdGFydCk7XG4gICAgICB0aGlzLnRyYWNraW5nLnBvcyA9IHN0YXJ0O1xuICAgICAgdGhpcy50cmFja2luZy5yYW5nZSA9IDA7XG4gICAgICB0aGlzLnRyYWNraW5nLnRva2VucyA9IGN1dFRva2VucztcbiAgICAgIHRoaXMudHJhY2tpbmcuaW5kZXhNYXAgPSB0aGlzLmluZGV4TWFwKHRoaXMudHJhY2tpbmcudG9rZW5zKTtcblxuICAgICAgLy8gQ29udmVydCB0b2tlbnMgYmFjayBpbnRvIHJhdyB2YWx1ZSB3aXRoIHRhZ3MuIE5ld2x5IGZvcm1lZCB0YWdzIHdpbGxcbiAgICAgIC8vIGJlY29tZSBwYXJ0IG9mIHRoZSByYXcgdmFsdWUuXG4gICAgICB2YXIgcmF3VmFsdWUgPSB0aGlzLnJhd1ZhbHVlKHRoaXMudHJhY2tpbmcudG9rZW5zKTtcblxuICAgICAgLy8gU2V0IHRoZSB2YWx1ZSB0byB0aGUgbmV3IHJhdyB2YWx1ZS5cbiAgICAgIHRoaXMub25DaGFuZ2VWYWx1ZShyYXdWYWx1ZSk7XG5cbiAgICAgIHRoaXMuc25hcHNob3QoKTtcbiAgICB9LmJpbmQodGhpcyksMCk7XG4gIH0sXG5cbiAgb25LZXlEb3duOiBmdW5jdGlvbiAoZXZlbnQpIHtcblxuICAgIGlmIChldmVudC5rZXlDb2RlID09PSAzNykge1xuICAgICAgdGhpcy5sZWZ0QXJyb3dEb3duID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKGV2ZW50LmtleUNvZGUgPT09IDM5KSB7XG4gICAgICB0aGlzLnJpZ2h0QXJyb3dEb3duID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBDbWQtWiBvciBDdHJsLVpcbiAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gOTAgJiYgKGV2ZW50Lm1ldGFLZXkgfHwgZXZlbnQuY3RybEtleSkgJiYgIWV2ZW50LnNoaWZ0S2V5KSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgdGhpcy51bmRvKCk7XG4gICAgLy8gQ21kLVNoaWZ0LVogb3IgQ3RybC1ZXG4gICAgfSBlbHNlIGlmIChcbiAgICAgIChldmVudC5rZXlDb2RlID09PSA4OSAmJiBldmVudC5jdHJsS2V5ICYmICFldmVudC5zaGlmdEtleSkgfHxcbiAgICAgIChldmVudC5rZXlDb2RlID09PSA5MCAmJiBldmVudC5tZXRhS2V5ICYmIGV2ZW50LnNoaWZ0S2V5KVxuICAgICkge1xuICAgICAgdGhpcy5yZWRvKCk7XG4gICAgfVxuICB9LFxuXG4gIG9uS2V5VXA6IGZ1bmN0aW9uIChldmVudCkge1xuICAgIGlmIChldmVudC5rZXlDb2RlID09PSAzNykge1xuICAgICAgdGhpcy5sZWZ0QXJyb3dEb3duID0gZmFsc2U7XG4gICAgfSBlbHNlIGlmIChldmVudC5rZXlDb2RlID09PSAzOSkge1xuICAgICAgdGhpcy5yaWdodEFycm93RG93biA9IGZhbHNlO1xuICAgIH1cbiAgfSxcblxuICAvLyBLZWVwIHRoZSBoaWdobGlnaHQgc3R5bGVzIGluIHN5bmMgd2l0aCB0aGUgdGV4dGFyZWEgc3R5bGVzLlxuICBhZGp1c3RTdHlsZXM6IGZ1bmN0aW9uIChpc01vdW50KSB7XG4gICAgdmFyIG92ZXJsYXkgPSB0aGlzLnJlZnMuaGlnaGxpZ2h0LmdldERPTU5vZGUoKTtcbiAgICB2YXIgY29udGVudCA9IHRoaXMucmVmcy5jb250ZW50LmdldERPTU5vZGUoKTtcblxuICAgIHZhciBzdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGNvbnRlbnQpO1xuXG4gICAgdmFyIGJhY2tncm91bmRDb2xvciA9IHN0eWxlLmJhY2tncm91bmRDb2xvcjtcblxuICAgIHV0aWxzLmNvcHlFbGVtZW50U3R5bGUoY29udGVudCwgb3ZlcmxheSk7XG5cbiAgICBvdmVybGF5LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICBvdmVybGF5LnN0eWxlLndoaXRlU3BhY2UgPSAncHJlLXdyYXAnO1xuICAgIG92ZXJsYXkuc3R5bGUuY29sb3IgPSAncmdiYSgwLDAsMCwwKSc7XG4gICAgb3ZlcmxheS5zdHlsZS53ZWJraXRUZXh0RmlsbENvbG9yID0gJ3JnYmEoMCwwLDAsMCknO1xuICAgIG92ZXJsYXkuc3R5bGUucmVzaXplID0gJ25vbmUnO1xuICAgIG92ZXJsYXkuc3R5bGUuYm9yZGVyQ29sb3IgPSAncmdiYSgwLDAsMCwwKSc7XG5cbiAgICBpZiAodXRpbHMuYnJvd3Nlci5pc01vemlsbGEpIHtcblxuICAgICAgdmFyIHBhZGRpbmdUb3AgPSBwYXJzZUZsb2F0KHN0eWxlLnBhZGRpbmdUb3ApO1xuICAgICAgdmFyIHBhZGRpbmdCb3R0b20gPSBwYXJzZUZsb2F0KHN0eWxlLnBhZGRpbmdCb3R0b20pO1xuXG4gICAgICB2YXIgYm9yZGVyVG9wID0gcGFyc2VGbG9hdChzdHlsZS5ib3JkZXJUb3BXaWR0aCk7XG4gICAgICB2YXIgYm9yZGVyQm90dG9tID0gcGFyc2VGbG9hdChzdHlsZS5ib3JkZXJCb3R0b21XaWR0aCk7XG5cbiAgICAgIG92ZXJsYXkuc3R5bGUucGFkZGluZ1RvcCA9ICcwcHgnO1xuICAgICAgb3ZlcmxheS5zdHlsZS5wYWRkaW5nQm90dG9tID0gJzBweCc7XG5cbiAgICAgIG92ZXJsYXkuc3R5bGUuaGVpZ2h0ID0gKGNvbnRlbnQuY2xpZW50SGVpZ2h0IC0gcGFkZGluZ1RvcCAtIHBhZGRpbmdCb3R0b20gKyBib3JkZXJUb3AgKyBib3JkZXJCb3R0b20pICsgJ3B4JztcbiAgICAgIG92ZXJsYXkuc3R5bGUudG9wID0gc3R5bGUucGFkZGluZ1RvcDtcbiAgICAgIG92ZXJsYXkuc3R5bGUuYm94U2hhZG93ID0gJ25vbmUnO1xuICAgIH1cblxuICAgIGlmIChpc01vdW50KSB7XG4gICAgICB0aGlzLmJhY2tncm91bmRDb2xvciA9IGJhY2tncm91bmRDb2xvcjtcbiAgICB9XG4gICAgb3ZlcmxheS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSB0aGlzLmJhY2tncm91bmRDb2xvcjtcbiAgICBjb250ZW50LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdyZ2JhKDAsMCwwLDApJztcbiAgfSxcblxuICAvLyBJZiB0aGUgdGV4dGFyZWEgaXMgcmVzaXplZCwgbmVlZCB0byByZS1zeW5jIHRoZSBzdHlsZXMuXG4gIG9uUmVzaXplOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5hZGp1c3RTdHlsZXMoKTtcbiAgfSxcblxuICAvLyBJZiB0aGUgd2luZG93IGlzIHJlc2l6ZWQsIG1heSBuZWVkIHRvIHJlLXN5bmMgdGhlIHN0eWxlcy5cbiAgLy8gUHJvYmFibHkgbm90IG5lY2Vzc2FyeSB3aXRoIGVsZW1lbnQgcmVzaXplP1xuICBvblJlc2l6ZVdpbmRvdzogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuYWRqdXN0U3R5bGVzKCk7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmFkanVzdFN0eWxlcyh0cnVlKTtcbiAgICB0aGlzLnNldE9uUmVzaXplKCdjb250ZW50JywgdGhpcy5vblJlc2l6ZSk7XG4gICAgLy90aGlzLnNldE9uQ2xpY2tPdXRzaWRlKCdjaG9pY2VzJywgdGhpcy5vbkNsaWNrT3V0c2lkZUNob2ljZXMpO1xuICB9LFxuXG4gIG9uSW5zZXJ0RnJvbVNlbGVjdDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgaWYgKGV2ZW50LnRhcmdldC5zZWxlY3RlZEluZGV4ID4gMCkge1xuICAgICAgdmFyIHRhZyA9IGV2ZW50LnRhcmdldC52YWx1ZTtcbiAgICAgIGV2ZW50LnRhcmdldC5zZWxlY3RlZEluZGV4ID0gMDtcbiAgICAgIHZhciBwb3MgPSB0aGlzLnRyYWNraW5nLnBvcztcbiAgICAgIHZhciBpbnNlcnRQb3MgPSB0aGlzLm5vcm1hbGl6ZVBvc2l0aW9uKHBvcyk7XG4gICAgICB2YXIgdG9rZW5zID0gdGhpcy50cmFja2luZy50b2tlbnM7XG4gICAgICB2YXIgdG9rZW5JbmRleCA9IHRoaXMudG9rZW5JbmRleChpbnNlcnRQb3MsIHRva2VucywgdGhpcy50cmFja2luZy5pbmRleE1hcCk7XG4gICAgICB0b2tlbnMuc3BsaWNlKHRva2VuSW5kZXgsIDAsIHtcbiAgICAgICAgdHlwZTogJ3RhZycsXG4gICAgICAgIHZhbHVlOiB0YWdcbiAgICAgIH0pO1xuICAgICAgdGhpcy50cmFja2luZy5pbmRleE1hcCA9IHRoaXMuaW5kZXhNYXAodG9rZW5zKTtcbiAgICAgIHZhciBuZXdWYWx1ZSA9IHRoaXMucmF3VmFsdWUodG9rZW5zKTtcbiAgICAgIHRoaXMudHJhY2tpbmcucG9zICs9IHRoaXMucHJldHR5TGFiZWwodGFnKS5sZW5ndGg7XG4gICAgICB0aGlzLm9uQ2hhbmdlVmFsdWUobmV3VmFsdWUpO1xuICAgICAgdGhpcy5yZWZzLmNvbnRlbnQuZ2V0RE9NTm9kZSgpLmZvY3VzKCk7XG4gICAgfVxuICB9LFxuXG4gIG9uSW5zZXJ0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YXIgdGFnID0gdmFsdWU7XG4gICAgdmFyIHBvcyA9IHRoaXMudHJhY2tpbmcucG9zO1xuICAgIHZhciBlbmRQb3MgPSB0aGlzLnRyYWNraW5nLnBvcyArIHRoaXMudHJhY2tpbmcucmFuZ2U7XG4gICAgdmFyIGluc2VydFBvcyA9IHRoaXMubm9ybWFsaXplUG9zaXRpb24ocG9zKTtcbiAgICB2YXIgZW5kSW5zZXJ0UG9zID0gdGhpcy5ub3JtYWxpemVQb3NpdGlvbihlbmRQb3MpO1xuICAgIHZhciB0b2tlbnMgPSB0aGlzLnRyYWNraW5nLnRva2VucztcbiAgICB2YXIgdG9rZW5JbmRleCA9IHRoaXMudG9rZW5JbmRleChpbnNlcnRQb3MsIHRva2VucywgdGhpcy50cmFja2luZy5pbmRleE1hcCk7XG4gICAgdmFyIHRva2VuRW5kSW5kZXggPSB0aGlzLnRva2VuSW5kZXgoZW5kSW5zZXJ0UG9zLCB0b2tlbnMsIHRoaXMudHJhY2tpbmcuaW5kZXhNYXApO1xuICAgIHRva2Vucy5zcGxpY2UodG9rZW5JbmRleCwgdG9rZW5FbmRJbmRleCAtIHRva2VuSW5kZXgsIHtcbiAgICAgIHR5cGU6ICd0YWcnLFxuICAgICAgdmFsdWU6IHRhZ1xuICAgIH0pO1xuICAgIHRoaXMudHJhY2tpbmcuaW5kZXhNYXAgPSB0aGlzLmluZGV4TWFwKHRva2Vucyk7XG4gICAgdmFyIG5ld1ZhbHVlID0gdGhpcy5yYXdWYWx1ZSh0b2tlbnMpO1xuICAgIHRoaXMudHJhY2tpbmcucG9zICs9IHRoaXMucHJldHR5TGFiZWwodGFnKS5sZW5ndGg7XG4gICAgdGhpcy5vbkNoYW5nZVZhbHVlKG5ld1ZhbHVlKTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGlzQ2hvaWNlc09wZW46IGZhbHNlXG4gICAgfSk7XG4gICAgdGhpcy5yZWZzLmNvbnRlbnQuZ2V0RE9NTm9kZSgpLmZvY3VzKCk7XG4gIH0sXG5cbiAgb25Ub2dnbGVDaG9pY2VzOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zZXRDaG9pY2VzT3BlbighdGhpcy5zdGF0ZS5pc0Nob2ljZXNPcGVuKTtcbiAgfSxcblxuICBvbkNsb3NlQ2hvaWNlczogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnN0YXRlLmlzQ2hvaWNlc09wZW4pIHtcbiAgICAgIHRoaXMuc2V0Q2hvaWNlc09wZW4oZmFsc2UpO1xuICAgIH1cbiAgfSxcblxuICBzZXRDaG9pY2VzT3BlbjogZnVuY3Rpb24gKGlzT3Blbikge1xuICAgIGlmIChpc09wZW4pIHtcbiAgICAgIHRoaXMub25TdGFydEFjdGlvbignb3Blbi1yZXBsYWNlbWVudHMnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vblN0YXJ0QWN0aW9uKCdjbG9zZS1yZXBsYWNlbWVudHMnKTtcbiAgICB9XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBpc0Nob2ljZXNPcGVuOiBpc09wZW5cbiAgICB9KTtcbiAgfSxcblxuICBjbG9zZUNob2ljZXM6IGZ1bmN0aW9uICgpIHtcblxuICB9LFxuXG4gIGdldENsb3NlSWdub3JlTm9kZXM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZWZzLnRvZ2dsZS5nZXRET01Ob2RlKCk7XG4gIH0sXG5cbiAgb25DbGlja091dHNpZGVDaG9pY2VzOiBmdW5jdGlvbiAoKSB7XG4gICAgLy8gLy8gSWYgd2UgZGlkbid0IGNsaWNrIG9uIHRoZSB0b2dnbGUgYnV0dG9uLCBjbG9zZSB0aGUgY2hvaWNlcy5cbiAgICAvLyBpZiAodGhpcy5pc05vZGVPdXRzaWRlKHRoaXMucmVmcy50b2dnbGUuZ2V0RE9NTm9kZSgpLCBldmVudC50YXJnZXQpKSB7XG4gICAgLy8gICBjb25zb2xlLmxvZygnbm90IGEgdG9nZ2xlIGNsaWNrJylcbiAgICAvLyAgIHRoaXMuc2V0U3RhdGUoe1xuICAgIC8vICAgICBpc0Nob2ljZXNPcGVuOiBmYWxzZVxuICAgIC8vICAgfSk7XG4gICAgLy8gfVxuICB9LFxuXG4gIG9uTW91c2VNb3ZlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAvLyBQbGFjZWhvbGRlciB0byBnZXQgYXQgcGlsbCB1bmRlciBtb3VzZSBwb3NpdGlvbi4gSW5lZmZpY2llbnQsIGJ1dCBub3RcbiAgICAvLyBzdXJlIHRoZXJlJ3MgYW5vdGhlciB3YXkuXG5cbiAgICB2YXIgcG9zaXRpb24gPSB7eDogZXZlbnQuY2xpZW50WCwgeTogZXZlbnQuY2xpZW50WX07XG4gICAgdmFyIG5vZGVzID0gdGhpcy5yZWZzLmhpZ2hsaWdodC5nZXRET01Ob2RlKCkuY2hpbGROb2RlcztcbiAgICB2YXIgbWF0Y2hlZE5vZGUgPSBudWxsO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBub2RlID0gbm9kZXNbaV07XG4gICAgICBpZiAobm9kZXNbaV0uZ2V0QXR0cmlidXRlKCdkYXRhLXByZXR0eScpKSB7XG4gICAgICAgIGlmIChwb3NpdGlvbkluTm9kZShwb3NpdGlvbiwgbm9kZSkpIHtcbiAgICAgICAgICBtYXRjaGVkTm9kZSA9IG5vZGU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobWF0Y2hlZE5vZGUpIHtcbiAgICAgIGlmICh0aGlzLnN0YXRlLmhvdmVyUGlsbFJlZiAhPT0gbWF0Y2hlZE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLXJlZicpKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIGhvdmVyUGlsbFJlZjogbWF0Y2hlZE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLXJlZicpXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5ob3ZlclBpbGxSZWYpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBob3ZlclBpbGxSZWY6IG51bGxcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgdmFyIHJlcGxhY2VDaG9pY2VzID0gdGhpcy5zdGF0ZS5yZXBsYWNlQ2hvaWNlcztcblxuICAgIC8vIHZhciBzZWxlY3RSZXBsYWNlQ2hvaWNlcyA9IFt7XG4gICAgLy8gICB2YWx1ZTogJycsXG4gICAgLy8gICBsYWJlbDogJ0luc2VydC4uLidcbiAgICAvLyB9XS5jb25jYXQocmVwbGFjZUNob2ljZXMpO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHtcbiAgICAgIGZpZWxkOiBmaWVsZCwgcGxhaW46IHRoaXMucHJvcHMucGxhaW5cbiAgICB9LCBSLmRpdih7c3R5bGU6IHtwb3NpdGlvbjogJ3JlbGF0aXZlJ319LFxuXG4gICAgICBSLnByZSh7XG4gICAgICAgIGNsYXNzTmFtZTogJ3ByZXR0eS1oaWdobGlnaHQnLFxuICAgICAgICByZWY6ICdoaWdobGlnaHQnXG4gICAgICB9LFxuICAgICAgICB0aGlzLnByZXR0eVZhbHVlKHRoaXMucHJvcHMuZmllbGQudmFsdWUpXG4gICAgICApLFxuXG4gICAgICAoY29uZmlnLmZpZWxkSXNTaW5nbGVMaW5lKGZpZWxkKSA/IFIuaW5wdXQgOiBSLnRleHRhcmVhKSh7XG4gICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgY2xhc3NOYW1lOiBjeChfLmV4dGVuZCh7fSwgdGhpcy5wcm9wcy5jbGFzc2VzLCB7J3ByZXR0eS1jb250ZW50JzogdHJ1ZX0pKSxcbiAgICAgICAgcmVmOiAnY29udGVudCcsXG4gICAgICAgIHJvd3M6IGZpZWxkLnJvd3MgfHwgdGhpcy5wcm9wcy5yb3dzLFxuICAgICAgICBuYW1lOiBmaWVsZC5rZXksXG4gICAgICAgIHZhbHVlOiB0aGlzLnBsYWluVmFsdWUodGhpcy5wcm9wcy5maWVsZC52YWx1ZSksXG4gICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgICBvblNjcm9sbDogdGhpcy5vblNjcm9sbCxcbiAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJyxcbiAgICAgICAgICB0b3A6IDAsXG4gICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICBjdXJzb3I6IHRoaXMuc3RhdGUuaG92ZXJQaWxsUmVmID8gJ3BvaW50ZXInIDogbnVsbFxuICAgICAgICB9LFxuICAgICAgICBvbktleVByZXNzOiB0aGlzLm9uS2V5UHJlc3MsXG4gICAgICAgIG9uS2V5RG93bjogdGhpcy5vbktleURvd24sXG4gICAgICAgIG9uS2V5VXA6IHRoaXMub25LZXlVcCxcbiAgICAgICAgb25TZWxlY3Q6IHRoaXMub25TZWxlY3QsXG4gICAgICAgIG9uQ29weTogdGhpcy5vbkNvcHksXG4gICAgICAgIG9uQ3V0OiB0aGlzLm9uQ3V0LFxuICAgICAgICBvbk1vdXNlTW92ZTogdGhpcy5vbk1vdXNlTW92ZSxcbiAgICAgICAgb25Gb2N1czogdGhpcy5vbkZvY3VzQWN0aW9uLFxuICAgICAgICBvbkJsdXI6IHRoaXMub25CbHVyQWN0aW9uXG4gICAgICB9KSxcblxuICAgICAgUi5hKHtyZWY6ICd0b2dnbGUnLCBocmVmOiAnSmF2YVNjcmlwdCcgKyAnOicsIG9uQ2xpY2s6IHRoaXMub25Ub2dnbGVDaG9pY2VzfSwgJ0luc2VydC4uLicpLFxuXG4gICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgnY2hvaWNlcycsIHtcbiAgICAgICAgcmVmOiAnY2hvaWNlcycsXG4gICAgICAgIGNob2ljZXM6IHJlcGxhY2VDaG9pY2VzLCBvcGVuOiB0aGlzLnN0YXRlLmlzQ2hvaWNlc09wZW4sXG4gICAgICAgIG9uU2VsZWN0OiB0aGlzLm9uSW5zZXJ0LCBvbkNsb3NlOiB0aGlzLm9uQ2xvc2VDaG9pY2VzLCBpZ25vcmVDbG9zZU5vZGVzOiB0aGlzLmdldENsb3NlSWdub3JlTm9kZXNcbiAgICAgIH0pXG4gICAgKSk7XG4gIH1cbn0pO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC5zZWxlY3RcblxuLypcblJlbmRlciBzZWxlY3QgZWxlbWVudCB0byBnaXZlIGEgdXNlciBjaG9pY2VzIGZvciB0aGUgdmFsdWUgb2YgYSBmaWVsZC4gTm90ZVxuaXQgc2hvdWxkIHN1cHBvcnQgdmFsdWVzIG90aGVyIHRoYW4gc3RyaW5ncy4gQ3VycmVudGx5IHRoaXMgaXMgb25seSB0ZXN0ZWQgZm9yXG5ib29sZWFuIHZhbHVlcywgYnV0IGl0IF9zaG91bGRfIHdvcmsgZm9yIG90aGVyIHZhbHVlcy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnU2VsZWN0JyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNob2ljZXM6IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkQ2hvaWNlcyh0aGlzLnByb3BzLmZpZWxkKVxuICAgIH07XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gKG5ld1Byb3BzKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjaG9pY2VzOiBuZXdQcm9wcy5jb25maWcuZmllbGRDaG9pY2VzKG5ld1Byb3BzLmZpZWxkKVxuICAgIH0pO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQnLCB7XG4gICAgICBjb25maWc6IGNvbmZpZywgZmllbGQ6IGZpZWxkLCBwbGFpbjogdGhpcy5wcm9wcy5wbGFpblxuICAgIH0sIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdzZWxlY3QtdmFsdWUnLCB7XG4gICAgICBjaG9pY2VzOiB0aGlzLnN0YXRlLmNob2ljZXMsIGZpZWxkOiBmaWVsZCwgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2VWYWx1ZSwgb25BY3Rpb246IHRoaXMub25CdWJibGVBY3Rpb25cbiAgICB9KSk7XG4gIH1cbn0pO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC5zdHJpbmdcblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ1N0cmluZycsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywge1xuICAgICAgY29uZmlnOiBjb25maWcsIGZpZWxkOiBmaWVsZCwgcGxhaW46IHRoaXMucHJvcHMucGxhaW5cbiAgICB9LCBSLnRleHRhcmVhKHtcbiAgICAgIHZhbHVlOiB0aGlzLnByb3BzLmZpZWxkLnZhbHVlLFxuICAgICAgY2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpLFxuICAgICAgcm93czogZmllbGQucm93cyB8fCB0aGlzLnByb3BzLnJvd3MsXG4gICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgIG9uRm9jdXM6IHRoaXMub25Gb2N1c0FjdGlvbixcbiAgICAgIG9uQmx1cjogdGhpcy5vbkJsdXJBY3Rpb25cbiAgICB9KSk7XG4gIH1cbn0pO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC5zdHJpbmdcblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ1VuaWNvZGUnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICBvbkNoYW5nZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdGhpcy5vbkNoYW5nZVZhbHVlKGV2ZW50LnRhcmdldC52YWx1ZSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHtcbiAgICAgIGNvbmZpZzogY29uZmlnLCBmaWVsZDogZmllbGQsIHBsYWluOiB0aGlzLnByb3BzLnBsYWluXG4gICAgfSwgUi5pbnB1dCh7XG4gICAgICB0eXBlOiAndGV4dCcsXG4gICAgICB2YWx1ZTogdGhpcy5wcm9wcy5maWVsZC52YWx1ZSxcbiAgICAgIGNsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSxcbiAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgb25Gb2N1czogdGhpcy5vbkZvY3VzQWN0aW9uLFxuICAgICAgb25CbHVyOiB0aGlzLm9uQmx1ckFjdGlvblxuICAgIH0pKTtcbiAgfVxufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdVbmtub3duJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUi5kaXYoe30sXG4gICAgICBSLmRpdih7fSwgJ0NvbXBvbmVudCBub3QgZm91bmQgZm9yOiAnKSxcbiAgICAgIFIucHJlKHt9LCBKU09OLnN0cmluZ2lmeSh0aGlzLnByb3BzLmZpZWxkLnJhd0ZpZWxkVGVtcGxhdGUsIG51bGwsIDIpKVxuICAgICk7XG4gIH1cblxufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50LmFkZC1pdGVtXG5cbi8qXG5UaGUgYWRkIGJ1dHRvbiB0byBhcHBlbmQgYW4gaXRlbSB0byBhIGZpZWxkLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0FkZEl0ZW0nLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxhYmVsOiAnW2FkZF0nXG4gICAgfTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSLnNwYW4oe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSwgb25DbGljazogdGhpcy5wcm9wcy5vbkNsaWNrfSwgdGhpcy5wcm9wcy5sYWJlbCk7XG4gIH1cbn0pO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC5saXN0LWNvbnRyb2xcblxuLypcblJlbmRlciB0aGUgaXRlbSB0eXBlIGNob2ljZXMgYW5kIHRoZSBhZGQgYnV0dG9uLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0FycmF5Q29udHJvbCcsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZmllbGRUZW1wbGF0ZUluZGV4OiAwXG4gICAgfTtcbiAgfSxcblxuICBvblNlbGVjdDogZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBmaWVsZFRlbXBsYXRlSW5kZXg6IGluZGV4XG4gICAgfSk7XG4gIH0sXG5cbiAgb25BcHBlbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnByb3BzLm9uQXBwZW5kKHRoaXMuc3RhdGUuZmllbGRUZW1wbGF0ZUluZGV4KTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuXG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcbiAgICB2YXIgZmllbGRUZW1wbGF0ZXMgPSBjb25maWcuZmllbGRJdGVtRmllbGRUZW1wbGF0ZXMoZmllbGQpO1xuXG4gICAgdmFyIHR5cGVDaG9pY2VzID0gbnVsbDtcblxuICAgIGlmIChmaWVsZFRlbXBsYXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICB0eXBlQ2hvaWNlcyA9IGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZC10ZW1wbGF0ZS1jaG9pY2VzJywge1xuICAgICAgICBmaWVsZDogZmllbGQsIGZpZWxkVGVtcGxhdGVJbmRleDogdGhpcy5zdGF0ZS5maWVsZFRlbXBsYXRlSW5kZXgsIG9uU2VsZWN0OiB0aGlzLm9uU2VsZWN0XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKX0sXG4gICAgICB0eXBlQ2hvaWNlcywgJyAnLFxuICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2FkZC1pdGVtJywge2ZpZWxkOiBmaWVsZCwgb25DbGljazogdGhpcy5vbkFwcGVuZH0pXG4gICAgKTtcbiAgfVxufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50Lmxpc3QtaXRlbS1jb250cm9sXG5cbi8qXG5SZW5kZXIgdGhlIHJlbW92ZSBhbmQgbW92ZSBidXR0b25zIGZvciBhIGZpZWxkLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0FycmF5SXRlbUNvbnRyb2wnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgb25Nb3ZlQmFjazogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucHJvcHMub25Nb3ZlKHRoaXMucHJvcHMuaW5kZXgsIHRoaXMucHJvcHMuaW5kZXggLSAxKTtcbiAgfSxcblxuICBvbk1vdmVGb3J3YXJkOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5wcm9wcy5vbk1vdmUodGhpcy5wcm9wcy5pbmRleCwgdGhpcy5wcm9wcy5pbmRleCArIDEpO1xuICB9LFxuXG4gIG9uUmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5wcm9wcy5vblJlbW92ZSh0aGlzLnByb3BzLmluZGV4KTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3Nlcyl9LFxuICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ3JlbW92ZS1pdGVtJywge2ZpZWxkOiBmaWVsZCwgb25DbGljazogdGhpcy5vblJlbW92ZSwgb25NYXliZVJlbW92ZTogdGhpcy5wcm9wcy5vbk1heWJlUmVtb3ZlfSksXG4gICAgICB0aGlzLnByb3BzLmluZGV4ID4gMCA/IGNvbmZpZy5jcmVhdGVFbGVtZW50KCdtb3ZlLWl0ZW0tYmFjaycsIHtmaWVsZDogZmllbGQsIG9uQ2xpY2s6IHRoaXMub25Nb3ZlQmFja30pIDogbnVsbCxcbiAgICAgIHRoaXMucHJvcHMuaW5kZXggPCAodGhpcy5wcm9wcy5udW1JdGVtcyAtIDEpID8gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ21vdmUtaXRlbS1mb3J3YXJkJywge2ZpZWxkOiBmaWVsZCwgb25DbGljazogdGhpcy5vbk1vdmVGb3J3YXJkfSkgOiBudWxsXG4gICAgKTtcbiAgfVxufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50Lmxpc3QtaXRlbS12YWx1ZVxuXG4vKlxuUmVuZGVyIHRoZSB2YWx1ZSBvZiBhIGxpc3QgaXRlbS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdBcnJheUl0ZW1WYWx1ZScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBvbkNoYW5nZUZpZWxkOiBmdW5jdGlvbiAobmV3VmFsdWUsIGluZm8pIHtcbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHRoaXMucHJvcHMuaW5kZXgsIG5ld1ZhbHVlLCBpbmZvKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3Nlcyl9LFxuICAgICAgY29uZmlnLmNyZWF0ZUZpZWxkRWxlbWVudCh7ZmllbGQ6IGZpZWxkLCBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZUZpZWxkLCBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvbn0pXG4gICAgKTtcbiAgfVxufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50Lmxpc3QtaXRlbVxuXG4vKlxuUmVuZGVyIGEgbGlzdCBpdGVtLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnQXJyYXlJdGVtJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpc01heWJlUmVtb3Zpbmc6IGZhbHNlXG4gICAgfTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgb25NYXliZVJlbW92ZTogZnVuY3Rpb24gKGlzTWF5YmVSZW1vdmluZykge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgaXNNYXliZVJlbW92aW5nOiBpc01heWJlUmVtb3ZpbmdcbiAgICB9KTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICB2YXIgY2xhc3NlcyA9IF8uZXh0ZW5kKHt9LCB0aGlzLnByb3BzLmNsYXNzZXMpO1xuXG4gICAgaWYgKHRoaXMuc3RhdGUuaXNNYXliZVJlbW92aW5nKSB7XG4gICAgICBjbGFzc2VzWydtYXliZS1yZW1vdmluZyddID0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogY3goY2xhc3Nlcyl9LFxuICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2FycmF5LWl0ZW0tdmFsdWUnLCB7ZmllbGQ6IGZpZWxkLCBpbmRleDogdGhpcy5wcm9wcy5pbmRleCxcbiAgICAgICAgb25DaGFuZ2U6IHRoaXMucHJvcHMub25DaGFuZ2UsIG9uQWN0aW9uOiB0aGlzLm9uQnViYmxlQWN0aW9ufSksXG4gICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgnYXJyYXktaXRlbS1jb250cm9sJywge2ZpZWxkOiBmaWVsZCwgaW5kZXg6IHRoaXMucHJvcHMuaW5kZXgsIG51bUl0ZW1zOiB0aGlzLnByb3BzLm51bUl0ZW1zLFxuICAgICAgICBvbk1vdmU6IHRoaXMucHJvcHMub25Nb3ZlLCBvblJlbW92ZTogdGhpcy5wcm9wcy5vblJlbW92ZSwgb25NYXliZVJlbW92ZTogdGhpcy5vbk1heWJlUmVtb3ZlfSlcbiAgICApO1xuICB9XG59KTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbnZhciBDU1NUcmFuc2l0aW9uR3JvdXAgPSBSZWFjdC5jcmVhdGVGYWN0b3J5KFJlYWN0LmFkZG9ucy5DU1NUcmFuc2l0aW9uR3JvdXApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0Nob2ljZXMnLFxuXG4gIG1peGluczogW1xuICAgIHJlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKSxcbiAgICAvL3BsdWdpbi5yZXF1aXJlKCdtaXhpbi5yZXNpemUnKSxcbiAgICAvL3BsdWdpbi5yZXF1aXJlKCdtaXhpbi5zY3JvbGwnKSxcbiAgICByZXF1aXJlKCcuLi8uLi9taXhpbnMvY2xpY2stb3V0c2lkZScpXG4gIF0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1heEhlaWdodDogbnVsbCxcbiAgICAgIG9wZW46IHRoaXMucHJvcHMub3BlblxuICAgIH07XG4gIH0sXG5cbiAgZ2V0SWdub3JlQ2xvc2VOb2RlczogZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5wcm9wcy5pZ25vcmVDbG9zZU5vZGVzKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIHZhciBub2RlcyA9IHRoaXMucHJvcHMuaWdub3JlQ2xvc2VOb2RlcygpO1xuICAgIGlmICghXy5pc0FycmF5KG5vZGVzKSkge1xuICAgICAgbm9kZXMgPSBbbm9kZXNdO1xuICAgIH1cbiAgICByZXR1cm4gbm9kZXM7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNldE9uQ2xpY2tPdXRzaWRlKCdjaG9pY2VzJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cbiAgICAgIC8vIE1ha2Ugc3VyZSB3ZSBkb24ndCBmaW5kIGFueSBub2RlcyB0byBpZ25vcmUuXG4gICAgICBpZiAoIV8uZmluZCh0aGlzLmdldElnbm9yZUNsb3NlTm9kZXMoKSwgZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNOb2RlSW5zaWRlKGV2ZW50LnRhcmdldCwgbm9kZSk7XG4gICAgICB9LmJpbmQodGhpcykpKSB7XG4gICAgICAgIHRoaXMucHJvcHMub25DbG9zZSgpO1xuICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLmFkanVzdFNpemUoKTtcbiAgfSxcblxuICBvblNlbGVjdDogZnVuY3Rpb24gKGNob2ljZSkge1xuICAgIHRoaXMucHJvcHMub25TZWxlY3QoY2hvaWNlLnZhbHVlKTtcbiAgfSxcblxuICBvblJlc2l6ZVdpbmRvdzogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuYWRqdXN0U2l6ZSgpO1xuICB9LFxuXG4gIG9uU2Nyb2xsV2luZG93OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5hZGp1c3RTaXplKCk7XG4gIH0sXG5cbiAgYWRqdXN0U2l6ZTogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnJlZnMuY2hvaWNlcykge1xuICAgICAgdmFyIG5vZGUgPSB0aGlzLnJlZnMuY2hvaWNlcy5nZXRET01Ob2RlKCk7XG4gICAgICB2YXIgcmVjdCA9IG5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICB2YXIgdG9wID0gcmVjdC50b3A7XG4gICAgICB2YXIgd2luZG93SGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgICAgdmFyIGhlaWdodCA9IHdpbmRvd0hlaWdodCAtIHRvcDtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBtYXhIZWlnaHQ6IGhlaWdodFxuICAgICAgfSk7XG4gICAgfVxuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXh0UHJvcHMpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtvcGVuOiBuZXh0UHJvcHMub3Blbn0sIGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuYWRqdXN0U2l6ZSgpO1xuICAgIH0uYmluZCh0aGlzKSk7XG4gIH0sXG5cbiAgb25TY3JvbGw6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBjb25zb2xlLmxvZygnc3RvcCB0aGF0IScpXG4gICAgLy8gZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAvLyBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgfSxcblxuICBvbldoZWVsOiBmdW5jdGlvbiAoKSB7XG4gICAgLy8gZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAvLyBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNob2ljZXMgPSB0aGlzLnByb3BzLmNob2ljZXM7XG5cbiAgICBpZiAoY2hvaWNlcyAmJiBjaG9pY2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY2hvaWNlcyA9IFt7dmFsdWU6ICcvLy9lbXB0eS8vLyd9XTtcbiAgICB9XG5cbiAgICByZXR1cm4gUi5kaXYoe3JlZjogJ2NvbnRhaW5lcicsIG9uV2hlZWw6IHRoaXMub25XaGVlbCwgb25TY3JvbGw6IHRoaXMub25TY3JvbGwsIGNsYXNzTmFtZTogJ2Nob2ljZXMtY29udGFpbmVyJywgc3R5bGU6IHtcbiAgICAgIHVzZXJTZWxlY3Q6ICdub25lJywgV2Via2l0VXNlclNlbGVjdDogJ25vbmUnLCBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgIG1heEhlaWdodDogdGhpcy5zdGF0ZS5tYXhIZWlnaHQgPyB0aGlzLnN0YXRlLm1heEhlaWdodCA6IG51bGxcbiAgICB9fSxcbiAgICAgIENTU1RyYW5zaXRpb25Hcm91cCh7dHJhbnNpdGlvbk5hbWU6ICdyZXZlYWwnfSxcbiAgICAgICAgdGhpcy5wcm9wcy5vcGVuID8gUi51bCh7cmVmOiAnY2hvaWNlcycsIGNsYXNzTmFtZTogJ2Nob2ljZXMnfSxcbiAgICAgICAgICBjaG9pY2VzLm1hcChmdW5jdGlvbiAoY2hvaWNlLCBpKSB7XG5cbiAgICAgICAgICAgIHZhciBjaG9pY2VFbGVtZW50ID0gbnVsbDtcblxuICAgICAgICAgICAgaWYgKGNob2ljZS52YWx1ZSA9PT0gJy8vL2xvYWRpbmcvLy8nKSB7XG4gICAgICAgICAgICAgIGNob2ljZUVsZW1lbnQgPSBSLmEoe2hyZWY6ICdKYXZhU2NyaXB0JyArICc6Jywgb25DbGljazogdGhpcy5wcm9wcy5vbkNsb3NlfSxcbiAgICAgICAgICAgICAgICBSLnNwYW4oe2NsYXNzTmFtZTogJ2Nob2ljZS1sYWJlbCd9LFxuICAgICAgICAgICAgICAgICAgJ0xvYWRpbmcuLi4nXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjaG9pY2UudmFsdWUgPT09ICcvLy9lbXB0eS8vLycpIHtcbiAgICAgICAgICAgICAgY2hvaWNlRWxlbWVudCA9IFIuYSh7aHJlZjogJ0phdmFTY3JpcHQnICsgJzonLCBvbkNsaWNrOiB0aGlzLnByb3BzLm9uQ2xvc2V9LFxuICAgICAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAnY2hvaWNlLWxhYmVsJ30sXG4gICAgICAgICAgICAgICAgICAnTm8gY2hvaWNlcyBhdmFpbGFibGUuJ1xuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNob2ljZUVsZW1lbnQgPSBSLmEoe2hyZWY6ICdKYXZhU2NyaXB0JyArICc6Jywgb25DbGljazogdGhpcy5vblNlbGVjdC5iaW5kKHRoaXMsIGNob2ljZSl9LFxuICAgICAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAnY2hvaWNlLWxhYmVsJ30sXG4gICAgICAgICAgICAgICAgICBjaG9pY2UubGFiZWxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAnY2hvaWNlLXNhbXBsZSd9LFxuICAgICAgICAgICAgICAgICAgY2hvaWNlLnNhbXBsZVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIFIubGkoe2tleTogaSwgY2xhc3NOYW1lOiAnY2hvaWNlJ30sXG4gICAgICAgICAgICAgIGNob2ljZUVsZW1lbnRcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICApIDogbnVsbFxuICAgICAgKVxuICAgICk7XG4gIH1cbn0pO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC5pdGVtLWNob2ljZXNcblxuLypcbkdpdmUgYSBsaXN0IG9mIGNob2ljZXMgb2YgaXRlbSB0eXBlcyB0byBjcmVhdGUgYXMgY2hpbGRyZW4gb2YgYW4gZmllbGQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnRmllbGRUZW1wbGF0ZUNob2ljZXMnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHRoaXMucHJvcHMub25TZWxlY3QocGFyc2VJbnQoZXZlbnQudGFyZ2V0LnZhbHVlKSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgdmFyIGZpZWxkVGVtcGxhdGVzID0gY29uZmlnLmZpZWxkSXRlbUZpZWxkVGVtcGxhdGVzKGZpZWxkKTtcblxuICAgIHZhciB0eXBlQ2hvaWNlcyA9IG51bGw7XG4gICAgaWYgKGZpZWxkVGVtcGxhdGVzLmxlbmd0aCA+IDEpIHtcbiAgICAgIHR5cGVDaG9pY2VzID0gUi5zZWxlY3Qoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSwgdmFsdWU6IHRoaXMuZmllbGRUZW1wbGF0ZUluZGV4LCBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZX0sXG4gICAgICBmaWVsZFRlbXBsYXRlcy5tYXAoZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUsIGkpIHtcbiAgICAgICAgcmV0dXJuIFIub3B0aW9uKHtrZXk6IGksIHZhbHVlOiBpfSwgZmllbGRUZW1wbGF0ZS5sYWJlbCB8fCBpKTtcbiAgICAgIH0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHlwZUNob2ljZXMgPyB0eXBlQ2hvaWNlcyA6IFIuc3BhbihudWxsKTtcbiAgfVxufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50LmZpZWxkXG5cbi8qXG5Vc2VkIGJ5IGFueSBmaWVsZHMgdG8gcHV0IHRoZSBsYWJlbCBhbmQgaGVscCB0ZXh0IGFyb3VuZCB0aGUgZmllbGQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxudmFyIENTU1RyYW5zaXRpb25Hcm91cCA9IFJlYWN0LmNyZWF0ZUZhY3RvcnkoUmVhY3QuYWRkb25zLkNTU1RyYW5zaXRpb25Hcm91cCk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnRmllbGQnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbGxhcHNlZDogdGhpcy5wcm9wcy5jb25maWcuZmllbGRJc0NvbGxhcHNlZCh0aGlzLnByb3BzLmZpZWxkKSA/IHRydWUgOiBmYWxzZVxuICAgIH07XG4gIH0sXG5cbiAgb25DbGlja0xhYmVsOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjb2xsYXBzZWQ6ICF0aGlzLnN0YXRlLmNvbGxhcHNlZFxuICAgIH0pO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG5cbiAgICBpZiAodGhpcy5wcm9wcy5wbGFpbikge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMuY2hpbGRyZW47XG4gICAgfVxuXG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHZhciBpbmRleCA9IHRoaXMucHJvcHMuaW5kZXg7XG4gICAgaWYgKCFfLmlzTnVtYmVyKGluZGV4KSkge1xuICAgICAgdmFyIGtleSA9IHRoaXMucHJvcHMuZmllbGQua2V5O1xuICAgICAgaW5kZXggPSBfLmlzTnVtYmVyKGtleSkgPyBrZXkgOiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgdmFyIGNsYXNzZXMgPSBfLmV4dGVuZCh7fSwgdGhpcy5wcm9wcy5jbGFzc2VzKTtcblxuICAgIGlmIChjb25maWcuZmllbGRJc1JlcXVpcmVkKGZpZWxkKSkge1xuICAgICAgY2xhc3Nlcy5yZXF1aXJlZCA9IHRydWU7XG5cbiAgICAgIGlmIChfLmlzVW5kZWZpbmVkKHRoaXMucHJvcHMuZmllbGQudmFsdWUpIHx8IHRoaXMucHJvcHMuZmllbGQudmFsdWUgPT09ICcnKSB7XG4gICAgICAgIGNsYXNzZXNbJ3ZhbGlkYXRpb24tZXJyb3ItcmVxdWlyZWQnXSA9IHRydWU7XG4gICAgICB9XG5cbiAgICB9IGVsc2Uge1xuICAgICAgY2xhc3Nlcy5vcHRpb25hbCA9IHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IGN4KGNsYXNzZXMpLCBzdHlsZToge2Rpc3BsYXk6IChmaWVsZC5oaWRkZW4gPyAnbm9uZScgOiAnJyl9fSxcbiAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdsYWJlbCcsIHtcbiAgICAgICAgY29uZmlnOiBjb25maWcsIGZpZWxkOiBmaWVsZCxcbiAgICAgICAgaW5kZXg6IGluZGV4LCBvbkNsaWNrOiBjb25maWcuZmllbGRJc0NvbGxhcHNpYmxlKGZpZWxkKSA/IHRoaXMub25DbGlja0xhYmVsIDogbnVsbFxuICAgICAgfSksXG4gICAgICBDU1NUcmFuc2l0aW9uR3JvdXAoe3RyYW5zaXRpb25OYW1lOiAncmV2ZWFsJ30sXG4gICAgICAgIHRoaXMuc3RhdGUuY29sbGFwc2VkID8gW10gOiBbXG4gICAgICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2hlbHAnLCB7XG4gICAgICAgICAgICBjb25maWc6IGNvbmZpZywgZmllbGQ6IGZpZWxkLFxuICAgICAgICAgICAga2V5OiAnaGVscCdcbiAgICAgICAgICB9KSxcbiAgICAgICAgICB0aGlzLnByb3BzLmNoaWxkcmVuXG4gICAgICAgIF1cbiAgICAgIClcbiAgICApO1xuICB9XG59KTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQuaGVscFxuXG4vKlxuSnVzdCB0aGUgaGVscCB0ZXh0IGJsb2NrLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0hlbHAnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBoZWxwVGV4dCA9IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkSGVscFRleHQodGhpcy5wcm9wcy5maWVsZCk7XG5cbiAgICByZXR1cm4gaGVscFRleHQgP1xuICAgICAgUi5kaXYoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSwgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw6IHtfX2h0bWw6IGhlbHBUZXh0fX0pIDpcbiAgICAgIFIuc3BhbihudWxsKTtcbiAgfVxufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50LmxhYmVsXG5cbi8qXG5KdXN0IHRoZSBsYWJlbCBmb3IgYSBmaWVsZC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdMYWJlbCcsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgdmFyIGZpZWxkTGFiZWwgPSBjb25maWcuZmllbGRMYWJlbChmaWVsZCk7XG5cbiAgICB2YXIgbGFiZWwgPSBudWxsO1xuICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wcy5pbmRleCA9PT0gJ251bWJlcicpIHtcbiAgICAgIGxhYmVsID0gJycgKyAodGhpcy5wcm9wcy5pbmRleCArIDEpICsgJy4nO1xuICAgICAgaWYgKGZpZWxkTGFiZWwpIHtcbiAgICAgICAgbGFiZWwgPSBsYWJlbCArICcgJyArIGZpZWxkTGFiZWw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGZpZWxkTGFiZWwgfHwgbGFiZWwpIHtcbiAgICAgIHZhciB0ZXh0ID0gbGFiZWwgfHwgZmllbGRMYWJlbDtcbiAgICAgIGlmICh0aGlzLnByb3BzLm9uQ2xpY2spIHtcbiAgICAgICAgdGV4dCA9IFIuYSh7aHJlZjogJ0phdmFTY3JpcHQnICsgJzonLCBvbkNsaWNrOiB0aGlzLnByb3BzLm9uQ2xpY2t9LCB0ZXh0KTtcbiAgICAgIH1cbiAgICAgIGxhYmVsID0gUi5sYWJlbCh7fSwgdGV4dCk7XG4gICAgfVxuXG4gICAgdmFyIHJlcXVpcmVkT3JOb3Q7XG5cbiAgICBpZiAoIWNvbmZpZy5maWVsZEhhc1ZhbHVlQ2hpbGRyZW4oZmllbGQpKSB7XG4gICAgICByZXF1aXJlZE9yTm90ID0gUi5zcGFuKHtcbiAgICAgICAgY2xhc3NOYW1lOiBjb25maWcuZmllbGRJc1JlcXVpcmVkKGZpZWxkKSA/ICdyZXF1aXJlZC10ZXh0JyA6ICdub3QtcmVxdWlyZWQtdGV4dCdcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBSLmRpdih7XG4gICAgICBjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcylcbiAgICB9LFxuICAgICAgbGFiZWwsXG4gICAgICAnICcsXG4gICAgICByZXF1aXJlZE9yTm90XG4gICAgKTtcbiAgfVxufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50Lm1vdmUtaXRlbS1iYWNrXG5cbi8qXG5CdXR0b24gdG8gbW92ZSBhbiBpdGVtIGJhY2t3YXJkcyBpbiBsaXN0LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ01vdmVJdGVtQmFjaycsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGFiZWw6ICdbdXBdJ1xuICAgIH07XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUi5zcGFuKHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcyksIG9uQ2xpY2s6IHRoaXMucHJvcHMub25DbGlja30sIHRoaXMucHJvcHMubGFiZWwpO1xuICB9XG59KTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQubW92ZS1pdGVtLWZvcndhcmRcblxuLypcbkJ1dHRvbiB0byBtb3ZlIGFuIGl0ZW0gZm9yd2FyZCBpbiBhIGxpc3QuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnTW92ZUl0ZW1Gb3J3YXJkJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBsYWJlbDogJ1tkb3duXSdcbiAgICB9O1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFIuc3Bhbih7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpLCBvbkNsaWNrOiB0aGlzLnByb3BzLm9uQ2xpY2t9LCB0aGlzLnByb3BzLmxhYmVsKTtcbiAgfVxufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50Lm9iamVjdC1jb250cm9sXG5cbi8qXG5SZW5kZXIgdGhlIGl0ZW0gdHlwZSBjaG9pY2VzIGFuZCB0aGUgYWRkIGJ1dHRvbi5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdPYmplY3RDb250cm9sJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBmaWVsZFRlbXBsYXRlSW5kZXg6IDBcbiAgICB9O1xuICB9LFxuXG4gIG9uU2VsZWN0OiBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGZpZWxkVGVtcGxhdGVJbmRleDogaW5kZXhcbiAgICB9KTtcbiAgfSxcblxuICBvbkFwcGVuZDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucHJvcHMub25BcHBlbmQodGhpcy5zdGF0ZS5maWVsZFRlbXBsYXRlSW5kZXgpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG4gICAgdmFyIGZpZWxkVGVtcGxhdGVzID0gY29uZmlnLmZpZWxkQ2hpbGRGaWVsZFRlbXBsYXRlcyhmaWVsZCk7XG5cbiAgICB2YXIgdHlwZUNob2ljZXMgPSBudWxsO1xuXG4gICAgaWYgKGZpZWxkVGVtcGxhdGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHR5cGVDaG9pY2VzID0gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkLXRlbXBsYXRlLWNob2ljZXMnLCB7XG4gICAgICAgIGZpZWxkOiBmaWVsZCxcbiAgICAgICAgZmllbGRUZW1wbGF0ZUluZGV4OiB0aGlzLnN0YXRlLmZpZWxkVGVtcGxhdGVJbmRleCwgb25TZWxlY3Q6IHRoaXMub25TZWxlY3RcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpfSxcbiAgICAgIHR5cGVDaG9pY2VzLCAnICcsXG4gICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgnYWRkLWl0ZW0nLCB7b25DbGljazogdGhpcy5vbkFwcGVuZH0pXG4gICAgKTtcbiAgfVxufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50Lm9iamVjdC1pdGVtLWNvbnRyb2xcblxuLypcblJlbmRlciB0aGUgcmVtb3ZlIGJ1dHRvbnMgZm9yIGFuIG9iamVjdCBpdGVtLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ09iamVjdEl0ZW1Db250cm9sJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIG9uUmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5wcm9wcy5vblJlbW92ZSh0aGlzLnByb3BzLml0ZW1LZXkpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKX0sXG4gICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgncmVtb3ZlLWl0ZW0nLCB7ZmllbGQ6IGZpZWxkLCBvbkNsaWNrOiB0aGlzLm9uUmVtb3ZlfSlcbiAgICApO1xuICB9XG59KTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQub2JqZWN0LWl0ZW0ta2V5XG5cbi8qXG5SZW5kZXIgYW4gb2JqZWN0IGl0ZW0ga2V5IGVkaXRvci5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdPYmplY3RJdGVtS2V5JyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKGV2ZW50LnRhcmdldC52YWx1ZSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUi5pbnB1dCh7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzTmFtZSksIHR5cGU6ICd0ZXh0JywgdmFsdWU6IHRoaXMucHJvcHMuZGlzcGxheUtleSwgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2V9KTtcbiAgfVxufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50Lm9iamVjdC1pdGVtLXZhbHVlXG5cbi8qXG5SZW5kZXIgdGhlIHZhbHVlIG9mIGFuIG9iamVjdCBpdGVtLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ09iamVjdEl0ZW1WYWx1ZScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBvbkNoYW5nZUZpZWxkOiBmdW5jdGlvbiAobmV3VmFsdWUsIGluZm8pIHtcbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHRoaXMucHJvcHMuaXRlbUtleSwgbmV3VmFsdWUsIGluZm8pO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc05hbWUpfSxcbiAgICAgIGNvbmZpZy5jcmVhdGVGaWVsZEVsZW1lbnQoe2ZpZWxkOiBmaWVsZCwgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2VGaWVsZCwgcGxhaW46IHRydWV9KVxuICAgICk7XG4gIH1cbn0pO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC5vYmplY3QtaXRlbVxuXG4vKlxuUmVuZGVyIGFuIG9iamVjdCBpdGVtLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ09iamVjdEl0ZW0nLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgb25DaGFuZ2VLZXk6IGZ1bmN0aW9uIChuZXdLZXkpIHtcbiAgICB0aGlzLnByb3BzLm9uTW92ZSh0aGlzLnByb3BzLml0ZW1LZXksIG5ld0tleSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzTmFtZSl9LFxuICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ29iamVjdC1pdGVtLWtleScsIHtmaWVsZDogZmllbGQsIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlS2V5LCBkaXNwbGF5S2V5OiB0aGlzLnByb3BzLmRpc3BsYXlLZXksIGl0ZW1LZXk6IHRoaXMucHJvcHMuaXRlbUtleX0pLFxuICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ29iamVjdC1pdGVtLXZhbHVlJywge2ZpZWxkOiBmaWVsZCwgb25DaGFuZ2U6IHRoaXMucHJvcHMub25DaGFuZ2UsIGl0ZW1LZXk6IHRoaXMucHJvcHMuaXRlbUtleX0pLFxuICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ29iamVjdC1pdGVtLWNvbnRyb2wnLCB7ZmllbGQ6IGZpZWxkLCBvblJlbW92ZTogdGhpcy5wcm9wcy5vblJlbW92ZSwgaXRlbUtleTogdGhpcy5wcm9wcy5pdGVtS2V5fSlcbiAgICApO1xuICB9XG59KTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQucmVtb3ZlLWl0ZW1cblxuLypcblJlbW92ZSBhbiBpdGVtLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ1JlbW92ZUl0ZW0nLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxhYmVsOiAnW3JlbW92ZV0nXG4gICAgfTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgb25Nb3VzZU92ZXJSZW1vdmU6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5vbk1heWJlUmVtb3ZlKSB7XG4gICAgICB0aGlzLnByb3BzLm9uTWF5YmVSZW1vdmUodHJ1ZSk7XG4gICAgfVxuICB9LFxuXG4gIG9uTW91c2VPdXRSZW1vdmU6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5vbk1heWJlUmVtb3ZlKSB7XG4gICAgICB0aGlzLnByb3BzLm9uTWF5YmVSZW1vdmUoZmFsc2UpO1xuICAgIH1cbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFIuc3Bhbih7XG4gICAgICBjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcyksIG9uQ2xpY2s6IHRoaXMucHJvcHMub25DbGljayxcbiAgICAgIG9uTW91c2VPdmVyOiB0aGlzLm9uTW91c2VPdmVyUmVtb3ZlLCBvbk1vdXNlT3V0OiB0aGlzLm9uTW91c2VPdXRSZW1vdmVcbiAgICB9LCB0aGlzLnByb3BzLmxhYmVsKTtcbiAgfVxufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50LmhlbHBcblxuLypcbkp1c3QgdGhlIGhlbHAgdGV4dCBibG9jay5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdTYW1wbGUnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjaG9pY2UgPSB0aGlzLnByb3BzLmNob2ljZTtcblxuICAgIHJldHVybiBjaG9pY2Uuc2FtcGxlID9cbiAgICAgIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NOYW1lKX0sXG4gICAgICAgIGNob2ljZS5zYW1wbGVcbiAgICAgICkgOlxuICAgICAgUi5zcGFuKG51bGwpO1xuICB9XG59KTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG52YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnU2VsZWN0VmFsdWUnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHZhciBjaG9pY2VWYWx1ZSA9IGV2ZW50LnRhcmdldC52YWx1ZTtcbiAgICB2YXIgY2hvaWNlVHlwZSA9IGNob2ljZVZhbHVlLnN1YnN0cmluZygwLCBjaG9pY2VWYWx1ZS5pbmRleE9mKCc6JykpO1xuICAgIGlmIChjaG9pY2VUeXBlID09PSAnY2hvaWNlJykge1xuICAgICAgdmFyIGNob2ljZUluZGV4ID0gY2hvaWNlVmFsdWUuc3Vic3RyaW5nKGNob2ljZVZhbHVlLmluZGV4T2YoJzonKSArIDEpO1xuICAgICAgY2hvaWNlSW5kZXggPSBwYXJzZUludChjaG9pY2VJbmRleCk7XG4gICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHRoaXMucHJvcHMuY2hvaWNlc1tjaG9pY2VJbmRleF0udmFsdWUpO1xuICAgIH1cbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNob2ljZXMgPSB0aGlzLnByb3BzLmNob2ljZXMgfHwgW107XG5cbiAgICB2YXIgY2hvaWNlc09yTG9hZGluZztcblxuICAgIGlmIChjaG9pY2VzLmxlbmd0aCA9PT0gMSAmJiBjaG9pY2VzWzBdLnZhbHVlID09PSAnLy8vbG9hZGluZy8vLycpIHtcbiAgICAgIGNob2ljZXNPckxvYWRpbmcgPSBSLmRpdih7fSxcbiAgICAgICAgJ0xvYWRpbmcgY2hvaWNlcy4uLidcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcblxuICAgICAgdmFyIHZhbHVlID0gdGhpcy5wcm9wcy5maWVsZC52YWx1ZSAhPT0gdW5kZWZpbmVkID8gdGhpcy5wcm9wcy5maWVsZC52YWx1ZSA6ICcnO1xuXG4gICAgICBjaG9pY2VzID0gY2hvaWNlcy5tYXAoZnVuY3Rpb24gKGNob2ljZSwgaSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGNob2ljZVZhbHVlOiAnY2hvaWNlOicgKyBpLFxuICAgICAgICAgIHZhbHVlOiBjaG9pY2UudmFsdWUsXG4gICAgICAgICAgbGFiZWw6IGNob2ljZS5sYWJlbFxuICAgICAgICB9O1xuICAgICAgfSk7XG5cbiAgICAgIHZhciB2YWx1ZUNob2ljZSA9IF8uZmluZChjaG9pY2VzLCBmdW5jdGlvbiAoY2hvaWNlKSB7XG4gICAgICAgIHJldHVybiBjaG9pY2UudmFsdWUgPT09IHZhbHVlO1xuICAgICAgfSk7XG5cbiAgICAgIGlmICh2YWx1ZUNob2ljZSA9PT0gdW5kZWZpbmVkKSB7XG5cbiAgICAgICAgdmFyIGxhYmVsID0gdmFsdWU7XG4gICAgICAgIGlmICghXy5pc1N0cmluZyh2YWx1ZSkpIHtcbiAgICAgICAgICBsYWJlbCA9IEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICB2YWx1ZUNob2ljZSA9IHtcbiAgICAgICAgICBjaG9pY2VWYWx1ZTogJ3ZhbHVlOicsXG4gICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgIGxhYmVsOiBsYWJlbFxuICAgICAgICB9O1xuICAgICAgICBjaG9pY2VzID0gW3ZhbHVlQ2hvaWNlXS5jb25jYXQoY2hvaWNlcyk7XG4gICAgICB9XG5cbiAgICAgIGNob2ljZXNPckxvYWRpbmcgPSBSLnNlbGVjdCh7XG4gICAgICAgIGNsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSxcbiAgICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsXG4gICAgICAgIHZhbHVlOiB2YWx1ZUNob2ljZS5jaG9pY2VWYWx1ZSxcbiAgICAgICAgb25Gb2N1czogdGhpcy5vbkZvY3VzQWN0aW9uLFxuICAgICAgICBvbkJsdXI6IHRoaXMub25CbHVyQWN0aW9uXG4gICAgICB9LFxuICAgICAgY2hvaWNlcy5tYXAoZnVuY3Rpb24gKGNob2ljZSwgaSkge1xuICAgICAgICByZXR1cm4gUi5vcHRpb24oe1xuICAgICAgICAgIGtleTogaSxcbiAgICAgICAgICB2YWx1ZTogY2hvaWNlLmNob2ljZVZhbHVlXG4gICAgICAgIH0sIGNob2ljZS5sYWJlbCk7XG4gICAgICB9LmJpbmQodGhpcykpXG4gICAgKTtcbiAgfVxuXG4gIHJldHVybiBjaG9pY2VzT3JMb2FkaW5nO1xufVxufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbnZhciBkZWxlZ2F0ZVRvID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpc1tuYW1lXS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgLy8gRmllbGQgZWxlbWVudCBmYWN0b3JpZXMuIENyZWF0ZSBmaWVsZCBlbGVtZW50cy5cblxuICBjcmVhdGVFbGVtZW50X0ZpZWxkczogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL2ZpZWxkcycpKSxcblxuICBjcmVhdGVFbGVtZW50X1N0cmluZzogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL3N0cmluZycpKSxcblxuICBjcmVhdGVFbGVtZW50X1VuaWNvZGU6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy91bmljb2RlJykpLFxuXG4gIGNyZWF0ZUVsZW1lbnRfU2VsZWN0OiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvc2VsZWN0JykpLFxuXG4gIGNyZWF0ZUVsZW1lbnRfQm9vbGVhbjogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL2Jvb2xlYW4nKSksXG5cbiAgY3JlYXRlRWxlbWVudF9QcmV0dHlUZXh0OiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvcHJldHR5LXRleHQnKSksXG5cbiAgY3JlYXRlRWxlbWVudF9BcnJheTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL2FycmF5JykpLFxuXG4gIGNyZWF0ZUVsZW1lbnRfQ2hlY2tib3hMaXN0OiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvY2hlY2tib3gtbGlzdCcpKSxcblxuICBjcmVhdGVFbGVtZW50X09iamVjdDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL29iamVjdCcpKSxcblxuICBjcmVhdGVFbGVtZW50X0pzb246IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9qc29uJykpLFxuXG4gIGNyZWF0ZUVsZW1lbnRfVW5rbm93bkZpZWxkOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvdW5rbm93bicpKSxcblxuICBjcmVhdGVFbGVtZW50X0NvcHk6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9jb3B5JykpLFxuXG5cbiAgLy8gT3RoZXIgZWxlbWVudCBmYWN0b3JpZXMuIENyZWF0ZSBoZWxwZXIgZWxlbWVudHMgdXNlZCBieSBmaWVsZCBjb21wb25lbnRzLlxuXG4gIGNyZWF0ZUVsZW1lbnRfRmllbGQ6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvZmllbGQnKSksXG5cbiAgY3JlYXRlRWxlbWVudF9MYWJlbDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9sYWJlbCcpKSxcblxuICBjcmVhdGVFbGVtZW50X0hlbHA6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvaGVscCcpKSxcblxuICBjcmVhdGVFbGVtZW50X0Nob2ljZXM6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvY2hvaWNlcycpKSxcblxuICBjcmVhdGVFbGVtZW50X0FycmF5Q29udHJvbDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9hcnJheS1jb250cm9sJykpLFxuXG4gIGNyZWF0ZUVsZW1lbnRfQXJyYXlJdGVtQ29udHJvbDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9hcnJheS1pdGVtLWNvbnRyb2wnKSksXG5cbiAgY3JlYXRlRWxlbWVudF9BcnJheUl0ZW1WYWx1ZTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9hcnJheS1pdGVtLXZhbHVlJykpLFxuXG4gIGNyZWF0ZUVsZW1lbnRfQXJyYXlJdGVtOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2FycmF5LWl0ZW0nKSksXG5cbiAgY3JlYXRlRWxlbWVudF9GaWVsZFRlbXBsYXRlQ2hvaWNlczogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9maWVsZC10ZW1wbGF0ZS1jaG9pY2VzJykpLFxuXG4gIGNyZWF0ZUVsZW1lbnRfQWRkSXRlbTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9hZGQtaXRlbScpKSxcblxuICBjcmVhdGVFbGVtZW50X1JlbW92ZUl0ZW06IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvcmVtb3ZlLWl0ZW0nKSksXG5cbiAgY3JlYXRlRWxlbWVudF9Nb3ZlSXRlbUZvcndhcmQ6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvbW92ZS1pdGVtLWZvcndhcmQnKSksXG5cbiAgY3JlYXRlRWxlbWVudF9Nb3ZlSXRlbUJhY2s6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvbW92ZS1pdGVtLWJhY2snKSksXG5cbiAgY3JlYXRlRWxlbWVudF9PYmplY3RDb250cm9sOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL29iamVjdC1jb250cm9sJykpLFxuXG4gIGNyZWF0ZUVsZW1lbnRfT2JqZWN0SXRlbUNvbnRyb2w6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWl0ZW0tY29udHJvbCcpKSxcblxuICBjcmVhdGVFbGVtZW50X09iamVjdEl0ZW1WYWx1ZTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9vYmplY3QtaXRlbS12YWx1ZScpKSxcblxuICBjcmVhdGVFbGVtZW50X09iamVjdEl0ZW1LZXk6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWl0ZW0ta2V5JykpLFxuXG4gIGNyZWF0ZUVsZW1lbnRfT2JqZWN0SXRlbTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9vYmplY3QtaXRlbScpKSxcblxuICBjcmVhdGVFbGVtZW50X1NlbGVjdFZhbHVlOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL3NlbGVjdC12YWx1ZScpKSxcblxuICBjcmVhdGVFbGVtZW50X1NhbXBsZTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9zYW1wbGUnKSksXG5cblxuICAvLyBGaWVsZCBkZWZhdWx0IHZhbHVlIGZhY3Rvcmllcy4gR2l2ZSBhIGRlZmF1bHQgdmFsdWUgZm9yIGEgc3BlY2lmaWMgdHlwZS5cblxuICBjcmVhdGVEZWZhdWx0VmFsdWVfU3RyaW5nOiBmdW5jdGlvbiAoLyogZmllbGRUZW1wbGF0ZSAqLykge1xuICAgIHJldHVybiAnJztcbiAgfSxcblxuICBjcmVhdGVEZWZhdWx0VmFsdWVfT2JqZWN0OiBmdW5jdGlvbiAoLyogZmllbGRUZW1wbGF0ZSAqLykge1xuICAgIHJldHVybiB7fTtcbiAgfSxcblxuICBjcmVhdGVEZWZhdWx0VmFsdWVfQXJyYXk6IGZ1bmN0aW9uICgvKiBmaWVsZFRlbXBsYXRlICovKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9LFxuXG4gIGNyZWF0ZURlZmF1bHRWYWx1ZV9Cb29sZWFuOiBmdW5jdGlvbiAoLyogZmllbGRUZW1wbGF0ZSAqLykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcblxuICBjcmVhdGVEZWZhdWx0VmFsdWVfRmllbGRzOiBkZWxlZ2F0ZVRvKCdjcmVhdGVEZWZhdWx0VmFsdWVfT2JqZWN0JyksXG5cbiAgY3JlYXRlRGVmYXVsdFZhbHVlX1VuaWNvZGU6IGRlbGVnYXRlVG8oJ2NyZWF0ZURlZmF1bHRWYWx1ZV9TdHJpbmcnKSxcblxuICBjcmVhdGVEZWZhdWx0VmFsdWVfU2VsZWN0OiBkZWxlZ2F0ZVRvKCdjcmVhdGVEZWZhdWx0VmFsdWVfU3RyaW5nJyksXG5cbiAgY3JlYXRlRGVmYXVsdFZhbHVlX0pzb246IGRlbGVnYXRlVG8oJ2NyZWF0ZURlZmF1bHRWYWx1ZV9PYmplY3QnKSxcblxuICBjcmVhdGVEZWZhdWx0VmFsdWVfQ2hlY2tib3hMaXN0OiBkZWxlZ2F0ZVRvKCdjcmVhdGVEZWZhdWx0VmFsdWVfQXJyYXknKSxcblxuXG4gIC8vIEZpZWxkIHZhbHVlIGNvZXJjZXJzLiBDb2VyY2UgYSB2YWx1ZSBpbnRvIGEgdmFsdWUgYXBwcm9wcmlhdGUgZm9yIGEgc3BlY2lmaWMgdHlwZS5cblxuICBjb2VyY2VWYWx1ZV9TdHJpbmc6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlLCB2YWx1ZSkge1xuICAgIGlmIChfLmlzU3RyaW5nKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgICBpZiAoXy5pc1VuZGVmaW5lZCh2YWx1ZSkgfHwgdmFsdWUgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgfSxcblxuICBjb2VyY2VWYWx1ZV9PYmplY3Q6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlLCB2YWx1ZSkge1xuICAgIGlmICghXy5pc09iamVjdCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9LFxuXG4gIGNvZXJjZVZhbHVlX0FycmF5OiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSwgdmFsdWUpIHtcbiAgICBpZiAoIV8uaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBbdmFsdWVdO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG4gIH0sXG5cbiAgY29lcmNlVmFsdWVfQm9vbGVhbjogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUsIHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuY29lcmNlVmFsdWVUb0Jvb2xlYW4odmFsdWUpO1xuICB9LFxuXG4gIGNvZXJjZVZhbHVlX0ZpZWxkczogZGVsZWdhdGVUbygnY29lcmNlVmFsdWVfT2JqZWN0JyksXG5cbiAgY29lcmNlVmFsdWVfVW5pY29kZTogZGVsZWdhdGVUbygnY29lcmNlVmFsdWVfU3RyaW5nJyksXG5cbiAgY29lcmNlVmFsdWVfU2VsZWN0OiBkZWxlZ2F0ZVRvKCdjb2VyY2VWYWx1ZV9TdHJpbmcnKSxcblxuICBjb2VyY2VWYWx1ZV9Kc29uOiBkZWxlZ2F0ZVRvKCdjb2VyY2VWYWx1ZV9PYmplY3QnKSxcblxuICBjb2VyY2VWYWx1ZV9DaGVja2JveExpc3Q6IGRlbGVnYXRlVG8oJ2NvZXJjZVZhbHVlX0FycmF5JyksXG5cblxuICAvLyBGaWVsZCBjaGlsZCBmaWVsZHMgZmFjdG9yaWVzLCBzbyBzb21lIHR5cGVzIGNhbiBoYXZlIGR5bmFtaWMgY2hpbGRyZW4uXG5cbiAgY3JlYXRlQ2hpbGRGaWVsZHNfQXJyYXk6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzO1xuXG4gICAgcmV0dXJuIGZpZWxkLnZhbHVlLm1hcChmdW5jdGlvbiAoYXJyYXlJdGVtLCBpKSB7XG4gICAgICB2YXIgY2hpbGRGaWVsZFRlbXBsYXRlID0gY29uZmlnLmNoaWxkRmllbGRUZW1wbGF0ZUZvclZhbHVlKGZpZWxkLCBhcnJheUl0ZW0pO1xuXG4gICAgICB2YXIgY2hpbGRGaWVsZCA9IGNvbmZpZy5jcmVhdGVDaGlsZEZpZWxkKGZpZWxkLCB7XG4gICAgICAgIGZpZWxkVGVtcGxhdGU6IGNoaWxkRmllbGRUZW1wbGF0ZSwga2V5OiBpLCBmaWVsZEluZGV4OiBpLCB2YWx1ZTogYXJyYXlJdGVtXG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGNoaWxkRmllbGQ7XG4gICAgfSk7XG4gIH0sXG5cbiAgY3JlYXRlQ2hpbGRGaWVsZHNfT2JqZWN0OiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcztcblxuICAgIHJldHVybiBPYmplY3Qua2V5cyhmaWVsZC52YWx1ZSkubWFwKGZ1bmN0aW9uIChrZXksIGkpIHtcbiAgICAgIHZhciBjaGlsZEZpZWxkVGVtcGxhdGUgPSBjb25maWcuY2hpbGRGaWVsZFRlbXBsYXRlRm9yVmFsdWUoZmllbGQsIGZpZWxkLnZhbHVlW2tleV0pO1xuXG4gICAgICB2YXIgY2hpbGRGaWVsZCA9IGNvbmZpZy5jcmVhdGVDaGlsZEZpZWxkKGZpZWxkLCB7XG4gICAgICAgIGZpZWxkVGVtcGxhdGU6IGNoaWxkRmllbGRUZW1wbGF0ZSwga2V5OiBrZXksIGZpZWxkSW5kZXg6IGksIHZhbHVlOiBmaWVsZC52YWx1ZVtrZXldXG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGNoaWxkRmllbGQ7XG4gICAgfSk7XG4gIH0sXG5cbiAgLy8gQ2hlY2sgaWYgdGhlcmUgaXMgYSBmYWN0b3J5IGZvciB0aGUgbmFtZS5cbiAgaGFzRWxlbWVudEZhY3Rvcnk6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXM7XG5cbiAgICByZXR1cm4gY29uZmlnWydjcmVhdGVFbGVtZW50XycgKyBuYW1lXSA/IHRydWUgOiBmYWxzZTtcbiAgfSxcblxuICAvLyBDcmVhdGUgYW4gZWxlbWVudCBnaXZlbiBhIG5hbWUsIHByb3BzLCBhbmQgY2hpbGRyZW4uXG4gIGNyZWF0ZUVsZW1lbnQ6IGZ1bmN0aW9uIChuYW1lLCBwcm9wcywgY2hpbGRyZW4pIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcztcblxuICAgIGlmICghcHJvcHMuY29uZmlnKSB7XG4gICAgICBwcm9wcyA9IF8uZXh0ZW5kKHt9LCBwcm9wcywge2NvbmZpZzogY29uZmlnfSk7XG4gICAgfVxuXG4gICAgbmFtZSA9IGNvbmZpZy5lbGVtZW50TmFtZShuYW1lKTtcblxuICAgIGlmIChjb25maWdbJ2NyZWF0ZUVsZW1lbnRfJyArIG5hbWVdKSB7XG4gICAgICByZXR1cm4gY29uZmlnWydjcmVhdGVFbGVtZW50XycgKyBuYW1lXShwcm9wcywgY2hpbGRyZW4pO1xuICAgIH1cblxuICAgIGlmIChuYW1lICE9PSAnVW5rbm93bicpIHtcbiAgICAgIGlmIChjb25maWcuaGFzRWxlbWVudEZhY3RvcnkoJ1Vua25vd24nKSkge1xuICAgICAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ1Vua25vd24nLCBwcm9wcywgY2hpbGRyZW4pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRocm93IG5ldyBFcnJvcignRmFjdG9yeSBub3QgZm91bmQgZm9yOiAnICsgbmFtZSk7XG4gIH0sXG5cbiAgLy8gQ3JlYXRlIGEgZmllbGQgZWxlbWVudCBnaXZlbiBzb21lIHByb3BzLiBVc2UgY29udGV4dCB0byBkZXRlcm1pbmUgbmFtZS5cbiAgY3JlYXRlRmllbGRFbGVtZW50OiBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcztcblxuICAgIHZhciBuYW1lID0gY29uZmlnLmZpZWxkVHlwZU5hbWUocHJvcHMuZmllbGQpO1xuXG4gICAgaWYgKGNvbmZpZy5oYXNFbGVtZW50RmFjdG9yeShuYW1lKSkge1xuICAgICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KG5hbWUsIHByb3BzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ1Vua25vd25GaWVsZCcsIHByb3BzKTtcbiAgfSxcblxuICAvLyBSZW5kZXIgdGhlIHJvb3QgZm9ybWF0aWMgY29tcG9uZW50XG4gIHJlbmRlckZvcm1hdGljQ29tcG9uZW50OiBmdW5jdGlvbiAoY29tcG9uZW50KSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXM7XG4gICAgdmFyIHByb3BzID0gY29tcG9uZW50LnByb3BzO1xuXG4gICAgdmFyIGZpZWxkID0gY29uZmlnLmNyZWF0ZVJvb3RGaWVsZChwcm9wcyk7XG5cbiAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogJ2Zvcm1hdGljJ30sXG4gICAgICBjb25maWcuY3JlYXRlRmllbGRFbGVtZW50KHtmaWVsZDogZmllbGQsIG9uQ2hhbmdlOiBjb21wb25lbnQub25DaGFuZ2UsIG9uQWN0aW9uOiBjb21wb25lbnQub25BY3Rpb259KVxuICAgICk7XG4gIH0sXG5cbiAgLy8gUmVuZGVyIGFueSBjb21wb25lbnQuXG4gIHJlbmRlckNvbXBvbmVudDogZnVuY3Rpb24gKGNvbXBvbmVudCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzO1xuXG4gICAgdmFyIG5hbWUgPSBjb21wb25lbnQuY29uc3RydWN0b3IuZGlzcGxheU5hbWU7XG5cbiAgICBpZiAoY29uZmlnWydyZW5kZXJDb21wb25lbnRfJyArIG5hbWVdKSB7XG4gICAgICByZXR1cm4gY29uZmlnWydyZW5kZXJDb21wb25lbnRfJyArIG5hbWVdKGNvbXBvbmVudCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbXBvbmVudC5yZW5kZXJEZWZhdWx0KCk7XG4gIH0sXG5cbiAgLy8gUmVuZGVyIGZpZWxkIGNvbXBvbmVudHMuXG4gIHJlbmRlckZpZWxkQ29tcG9uZW50OiBmdW5jdGlvbiAoY29tcG9uZW50KSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXM7XG5cbiAgICByZXR1cm4gY29uZmlnLnJlbmRlckNvbXBvbmVudChjb21wb25lbnQpO1xuICB9LFxuXG4gIC8vIE5vcm1hbGl6ZSBhbiBlbGVtZW50IG5hbWUuXG4gIGVsZW1lbnROYW1lOiBmdW5jdGlvbiAobmFtZSkge1xuICAgIHJldHVybiB1dGlscy5kYXNoVG9QYXNjYWwobmFtZSk7XG4gIH0sXG5cbiAgLy8gVHlwZSBhbGlhc2VzLlxuXG4gIGFsaWFzX0RpY3Q6ICdPYmplY3QnLFxuXG4gIGFsaWFzX0Jvb2w6ICdCb29sZWFuJyxcblxuICBhbGlhc19QcmV0dHlUZXh0YXJlYTogJ1ByZXR0eVRleHQnLFxuXG4gIGFsaWFzX1VuaWNvZGU6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgaWYgKGZpZWxkVGVtcGxhdGUucmVwbGFjZUNob2ljZXMpIHtcbiAgICAgIHJldHVybiAnUHJldHR5VGV4dCc7XG4gICAgfSBlbHNlIGlmIChmaWVsZFRlbXBsYXRlLmNob2ljZXMpIHtcbiAgICAgIHJldHVybiAnU2VsZWN0JztcbiAgICB9XG4gICAgcmV0dXJuICdVbmljb2RlJztcbiAgfSxcblxuICBhbGlhc19TdHJpbmc6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgaWYgKGZpZWxkVGVtcGxhdGUucmVwbGFjZUNob2ljZXMpIHtcbiAgICAgIHJldHVybiAnUHJldHR5VGV4dCc7XG4gICAgfSBlbHNlIGlmIChmaWVsZFRlbXBsYXRlLmNob2ljZXMpIHtcbiAgICAgIHJldHVybiAnU2VsZWN0JztcbiAgICB9XG4gICAgcmV0dXJuICdTdHJpbmcnO1xuICB9LFxuXG4gIGFsaWFzX1RleHQ6IGRlbGVnYXRlVG8oJ2FsaWFzX1N0cmluZycpLFxuXG4gIGFsaWFzX0xpc3Q6ICdBcnJheScsXG5cbiAgYWxpYXNfRmllbGRzZXQ6ICdGaWVsZHMnLFxuXG4gIC8vIEZpZWxkIGZhY3RvcnlcblxuICBpbmZsYXRlRmllbGRWYWx1ZTogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXM7XG5cbiAgICBpZiAoY29uZmlnLmZpZWxkSGFzVmFsdWVDaGlsZHJlbihmaWVsZCkpIHtcbiAgICAgIHZhciB2YWx1ZSA9IF8uY2xvbmUoZmllbGQudmFsdWUpO1xuICAgICAgdmFyIGNoaWxkRmllbGRzID0gY29uZmlnLmNyZWF0ZUNoaWxkRmllbGRzKGZpZWxkKTtcbiAgICAgIGNoaWxkRmllbGRzLmZvckVhY2goZnVuY3Rpb24gKGNoaWxkRmllbGQpIHtcbiAgICAgICAgaWYgKGNvbmZpZy5pc0tleShjaGlsZEZpZWxkLmtleSkpIHtcbiAgICAgICAgICB2YWx1ZVtjaGlsZEZpZWxkLmtleV0gPSBjb25maWcuaW5mbGF0ZUZpZWxkVmFsdWUoY2hpbGRGaWVsZCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmllbGQudmFsdWU7XG4gICAgfVxuICB9LFxuXG4gIGluaXRSb290RmllbGQ6IGZ1bmN0aW9uICgvKiBmaWVsZCwgcHJvcHMgKi8pIHtcbiAgfSxcblxuICBpbml0RmllbGQ6IGZ1bmN0aW9uICgvKiBmaWVsZCAqLykge1xuICB9LFxuXG4gIHdyYXBGaWVsZFRlbXBsYXRlczogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGVzKSB7XG4gICAgLy8gRmllbGQgY29tcG9uZW50cyBvbmx5IHdvcmsgd2l0aCBpbmRpdmlkdWFsIGZpZWxkcywgc28gd3JhcCBhcnJheSBvZlxuICAgIC8vIGZpZWxkIHRlbXBsYXRlcyBpbiByb290IGZpZWxkIHRlbXBsYXRlLlxuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiAnZmllbGRzJyxcbiAgICAgIHBsYWluOiB0cnVlLFxuICAgICAgZmllbGRzOiBmaWVsZFRlbXBsYXRlc1xuICAgIH07XG4gIH0sXG5cbiAgY3JlYXRlUm9vdEZpZWxkOiBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcztcblxuICAgIHZhciBmaWVsZFRlbXBsYXRlID0gcHJvcHMuZmllbGRUZW1wbGF0ZSB8fCBwcm9wcy5maWVsZFRlbXBsYXRlcyB8fCBwcm9wcy5maWVsZCB8fCBwcm9wcy5maWVsZHM7XG4gICAgdmFyIHZhbHVlID0gcHJvcHMudmFsdWU7XG5cbiAgICBpZiAoIWZpZWxkVGVtcGxhdGUpIHtcbiAgICAgIGZpZWxkVGVtcGxhdGUgPSBjb25maWcuY3JlYXRlRmllbGRUZW1wbGF0ZUZyb21WYWx1ZSh2YWx1ZSk7XG4gICAgfVxuXG4gICAgaWYgKF8uaXNBcnJheShmaWVsZFRlbXBsYXRlKSkge1xuICAgICAgZmllbGRUZW1wbGF0ZSA9IGNvbmZpZy53cmFwRmllbGRUZW1wbGF0ZXMoZmllbGRUZW1wbGF0ZSk7XG4gICAgfVxuXG4gICAgdmFyIGZpZWxkID0gXy5leHRlbmQoe30sIGZpZWxkVGVtcGxhdGUsIHtyYXdGaWVsZFRlbXBsYXRlOiBmaWVsZFRlbXBsYXRlfSk7XG4gICAgaWYgKGNvbmZpZy5oYXNWYWx1ZShmaWVsZFRlbXBsYXRlLCB2YWx1ZSkpIHtcbiAgICAgIGZpZWxkLnZhbHVlID0gY29uZmlnLmNvZXJjZVZhbHVlKGZpZWxkVGVtcGxhdGUsIHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZmllbGQudmFsdWUgPSBjb25maWcuY3JlYXRlRGVmYXVsdFZhbHVlKGZpZWxkVGVtcGxhdGUpO1xuICAgIH1cblxuICAgIGNvbmZpZy5pbml0Um9vdEZpZWxkKGZpZWxkLCBwcm9wcyk7XG4gICAgY29uZmlnLmluaXRGaWVsZChmaWVsZCk7XG5cbiAgICBpZiAodmFsdWUgPT09IG51bGwgfHwgY29uZmlnLmlzRW1wdHlPYmplY3QodmFsdWUpIHx8IF8uaXNVbmRlZmluZWQodmFsdWUpKSB7XG4gICAgICBmaWVsZC52YWx1ZSA9IGNvbmZpZy5pbmZsYXRlRmllbGRWYWx1ZShmaWVsZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZpZWxkO1xuICB9LFxuXG4gIGNyZWF0ZVJvb3RWYWx1ZTogZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXM7XG5cbiAgICB2YXIgZmllbGQgPSBjb25maWcuY3JlYXRlUm9vdEZpZWxkKHByb3BzKTtcblxuICAgIHJldHVybiBjb25maWcuaW5mbGF0ZUZpZWxkVmFsdWUoZmllbGQpO1xuICB9LFxuXG4gIGNyZWF0ZUNoaWxkRmllbGRzOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcztcblxuICAgIHZhciB0eXBlTmFtZSA9IGNvbmZpZy5maWVsZFR5cGVOYW1lKGZpZWxkKTtcblxuICAgIGlmIChjb25maWdbJ2NyZWF0ZUNoaWxkRmllbGRzXycgKyB0eXBlTmFtZV0pIHtcbiAgICAgIHJldHVybiBjb25maWdbJ2NyZWF0ZUNoaWxkRmllbGRzXycgKyB0eXBlTmFtZV0oZmllbGQpO1xuICAgIH1cblxuICAgIHJldHVybiBjb25maWcuZmllbGRDaGlsZEZpZWxkVGVtcGxhdGVzKGZpZWxkKS5tYXAoZnVuY3Rpb24gKGNoaWxkRmllbGQsIGkpIHtcbiAgICAgIHJldHVybiBjb25maWcuY3JlYXRlQ2hpbGRGaWVsZChmaWVsZCwge1xuICAgICAgICBmaWVsZFRlbXBsYXRlOiBjaGlsZEZpZWxkLCBrZXk6IGNoaWxkRmllbGQua2V5LCBmaWVsZEluZGV4OiBpLCB2YWx1ZTogZmllbGQudmFsdWVbY2hpbGRGaWVsZC5rZXldXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSxcblxuICBjcmVhdGVDaGlsZEZpZWxkOiBmdW5jdGlvbiAocGFyZW50RmllbGQsIG9wdGlvbnMpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcztcblxuICAgIHZhciBjaGlsZFZhbHVlID0gb3B0aW9ucy52YWx1ZTtcblxuICAgIHZhciBjaGlsZEZpZWxkID0gXy5leHRlbmQoe30sIG9wdGlvbnMuZmllbGRUZW1wbGF0ZSwge1xuICAgICAga2V5OiBvcHRpb25zLmtleSwgcGFyZW50OiBwYXJlbnRGaWVsZCwgZmllbGRJbmRleDogb3B0aW9ucy5maWVsZEluZGV4LFxuICAgICAgcmF3RmllbGRUZW1wbGF0ZTogb3B0aW9ucy5maWVsZFRlbXBsYXRlXG4gICAgfSk7XG5cbiAgICBpZiAoY29uZmlnLmhhc1ZhbHVlKG9wdGlvbnMuZmllbGRUZW1wbGF0ZSwgY2hpbGRWYWx1ZSkpIHtcbiAgICAgIGNoaWxkRmllbGQudmFsdWUgPSBjb25maWcuY29lcmNlVmFsdWUob3B0aW9ucy5maWVsZFRlbXBsYXRlLCBjaGlsZFZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2hpbGRGaWVsZC52YWx1ZSA9IGNvbmZpZy5jcmVhdGVEZWZhdWx0VmFsdWUob3B0aW9ucy5maWVsZFRlbXBsYXRlKTtcbiAgICB9XG5cbiAgICBjb25maWcuaW5pdEZpZWxkKGNoaWxkRmllbGQpO1xuXG4gICAgcmV0dXJuIGNoaWxkRmllbGQ7XG4gIH0sXG5cbiAgLy8gQ3JlYXRlIGEgdGVtcG9yYXJ5IGZpZWxkIGFuZCBleHRyYWN0IGl0cyB2YWx1ZS5cbiAgY3JlYXRlTmV3Q2hpbGRGaWVsZFZhbHVlOiBmdW5jdGlvbiAocGFyZW50RmllbGQsIGl0ZW1GaWVsZEluZGV4KSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXM7XG5cbiAgICB2YXIgY2hpbGRGaWVsZFRlbXBsYXRlID0gY29uZmlnLmZpZWxkSXRlbUZpZWxkVGVtcGxhdGVzKHBhcmVudEZpZWxkKVtpdGVtRmllbGRJbmRleF07XG5cbiAgICB2YXIgbmV3VmFsdWUgPSBjb25maWcuZmllbGRUZW1wbGF0ZVZhbHVlKGNoaWxkRmllbGRUZW1wbGF0ZSk7XG5cbiAgICAvLyBKdXN0IGEgcGxhY2Vob2xkZXIga2V5LiBTaG91bGQgbm90IGJlIGltcG9ydGFudC5cbiAgICB2YXIga2V5ID0gJ19fdW5rbm93bl9rZXlfXyc7XG5cbiAgICBpZiAoXy5pc0FycmF5KHBhcmVudEZpZWxkLnZhbHVlKSkge1xuICAgICAgLy8gSnVzdCBhIHBsYWNlaG9sZGVyIHBvc2l0aW9uIGZvciBhbiBhcnJheS5cbiAgICAgIGtleSA9IHBhcmVudEZpZWxkLnZhbHVlLmxlbmd0aDtcbiAgICB9XG5cbiAgICAvLyBKdXN0IGEgcGxhY2Vob2xkZXIgZmllbGQgaW5kZXguIFNob3VsZCBub3QgYmUgaW1wb3J0YW50LlxuICAgIHZhciBmaWVsZEluZGV4ID0gMDtcbiAgICBpZiAoXy5pc09iamVjdChwYXJlbnRGaWVsZC52YWx1ZSkpIHtcbiAgICAgIGZpZWxkSW5kZXggPSBPYmplY3Qua2V5cyhwYXJlbnRGaWVsZC52YWx1ZSkubGVuZ3RoO1xuICAgIH1cblxuICAgIHZhciBjaGlsZEZpZWxkID0gY29uZmlnLmNyZWF0ZUNoaWxkRmllbGQocGFyZW50RmllbGQsIHtcbiAgICAgIGZpZWxkVGVtcGxhdGU6IGNoaWxkRmllbGRUZW1wbGF0ZSwga2V5OiBrZXksIGZpZWxkSW5kZXg6IGZpZWxkSW5kZXgsIHZhbHVlOiBuZXdWYWx1ZVxuICAgIH0pO1xuXG4gICAgbmV3VmFsdWUgPSBjb25maWcuaW5mbGF0ZUZpZWxkVmFsdWUoY2hpbGRGaWVsZCk7XG5cbiAgICByZXR1cm4gbmV3VmFsdWU7XG4gIH0sXG5cbiAgY3JlYXRlRmllbGRUZW1wbGF0ZUZyb21WYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXM7XG5cbiAgICB2YXIgZmllbGQgPSB7XG4gICAgICB0eXBlOiAnanNvbidcbiAgICB9O1xuICAgIGlmIChfLmlzU3RyaW5nKHZhbHVlKSkge1xuICAgICAgZmllbGQgPSB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAoXy5pc051bWJlcih2YWx1ZSkpIHtcbiAgICAgIGZpZWxkID0ge1xuICAgICAgICB0eXBlOiAnbnVtYmVyJ1xuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKF8uaXNCb29sZWFuKHZhbHVlKSkge1xuICAgICAgZmllbGQgPSB7XG4gICAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKF8uaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgIHZhciBhcnJheUl0ZW1GaWVsZHMgPSB2YWx1ZS5tYXAoZnVuY3Rpb24gKHZhbHVlLCBpKSB7XG4gICAgICAgIHZhciBjaGlsZEZpZWxkID0gY29uZmlnLmNyZWF0ZUZpZWxkVGVtcGxhdGVGcm9tVmFsdWUodmFsdWUpO1xuICAgICAgICBjaGlsZEZpZWxkLmtleSA9IGk7XG4gICAgICAgIHJldHVybiBjaGlsZEZpZWxkO1xuICAgICAgfSk7XG4gICAgICBmaWVsZCA9IHtcbiAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgZmllbGRzOiBhcnJheUl0ZW1GaWVsZHNcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmIChfLmlzT2JqZWN0KHZhbHVlKSkge1xuICAgICAgdmFyIG9iamVjdEl0ZW1GaWVsZHMgPSBPYmplY3Qua2V5cyh2YWx1ZSkubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgdmFyIGNoaWxkRmllbGQgPSBjb25maWcuY3JlYXRlRmllbGRUZW1wbGF0ZUZyb21WYWx1ZSh2YWx1ZVtrZXldKTtcbiAgICAgICAgY2hpbGRGaWVsZC5rZXkgPSBrZXk7XG4gICAgICAgIGNoaWxkRmllbGQubGFiZWwgPSBjb25maWcuaHVtYW5pemUoa2V5KTtcbiAgICAgICAgcmV0dXJuIGNoaWxkRmllbGQ7XG4gICAgICB9KTtcbiAgICAgIGZpZWxkID0ge1xuICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgZmllbGRzOiBvYmplY3RJdGVtRmllbGRzXG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAoXy5pc051bGwodmFsdWUpKSB7XG4gICAgICBmaWVsZCA9IHtcbiAgICAgICAgdHlwZTogJ2pzb24nXG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gZmllbGQ7XG4gIH0sXG5cbiAgLy8gRGVmYXVsdCB2YWx1ZSBmYWN0b3J5XG5cbiAgY3JlYXRlRGVmYXVsdFZhbHVlOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSkge1xuICAgIHZhciBjb25maWcgPSB0aGlzO1xuXG4gICAgdmFyIGRlZmF1bHRWYWx1ZSA9IGNvbmZpZy5maWVsZFRlbXBsYXRlRGVmYXVsdFZhbHVlKGZpZWxkVGVtcGxhdGUpO1xuXG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKGRlZmF1bHRWYWx1ZSkpIHtcbiAgICAgIHJldHVybiB1dGlscy5kZWVwQ29weShkZWZhdWx0VmFsdWUpO1xuICAgIH1cblxuICAgIHZhciB0eXBlTmFtZSA9IGNvbmZpZy5maWVsZFR5cGVOYW1lKGZpZWxkVGVtcGxhdGUpO1xuXG4gICAgaWYgKGNvbmZpZ1snY3JlYXRlRGVmYXVsdFZhbHVlXycgKyB0eXBlTmFtZV0pIHtcbiAgICAgIHJldHVybiBjb25maWdbJ2NyZWF0ZURlZmF1bHRWYWx1ZV8nICsgdHlwZU5hbWVdKGZpZWxkVGVtcGxhdGUpO1xuICAgIH1cblxuICAgIHJldHVybiAnJztcbiAgfSxcblxuICAvLyBGaWVsZCBoZWxwZXJzXG5cbiAgaGFzVmFsdWU6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlLCB2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSAhPT0gbnVsbCAmJiAhXy5pc1VuZGVmaW5lZCh2YWx1ZSkgJiYgdmFsdWUgIT09ICcnO1xuICB9LFxuXG4gIGNvZXJjZVZhbHVlOiBmdW5jdGlvbiAoZmllbGQsIHZhbHVlKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXM7XG5cbiAgICB2YXIgdHlwZU5hbWUgPSBjb25maWcuZmllbGRUeXBlTmFtZShmaWVsZCk7XG5cbiAgICBpZiAoY29uZmlnWydjb2VyY2VWYWx1ZV8nICsgdHlwZU5hbWVdKSB7XG4gICAgICByZXR1cm4gY29uZmlnWydjb2VyY2VWYWx1ZV8nICsgdHlwZU5hbWVdKGZpZWxkLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbHVlO1xuICB9LFxuXG4gIGNoaWxkRmllbGRUZW1wbGF0ZUZvclZhbHVlOiBmdW5jdGlvbiAoZmllbGQsIGNoaWxkVmFsdWUpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcztcblxuICAgIHZhciBmaWVsZFRlbXBsYXRlO1xuXG4gICAgdmFyIGZpZWxkVGVtcGxhdGVzID0gY29uZmlnLmZpZWxkSXRlbUZpZWxkVGVtcGxhdGVzKGZpZWxkKTtcblxuICAgIGZpZWxkVGVtcGxhdGUgPSBfLmZpbmQoZmllbGRUZW1wbGF0ZXMsIGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgICByZXR1cm4gY29uZmlnLm1hdGNoZXNGaWVsZFRlbXBsYXRlVG9WYWx1ZShmaWVsZFRlbXBsYXRlLCBjaGlsZFZhbHVlKTtcbiAgICB9KTtcblxuICAgIGlmIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgICByZXR1cm4gZmllbGRUZW1wbGF0ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVGaWVsZFRlbXBsYXRlRnJvbVZhbHVlKGNoaWxkVmFsdWUpO1xuICAgIH1cbiAgfSxcblxuICBtYXRjaGVzRmllbGRUZW1wbGF0ZVRvVmFsdWU6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlLCB2YWx1ZSkge1xuICAgIHZhciBtYXRjaCA9IGZpZWxkVGVtcGxhdGUubWF0Y2g7XG4gICAgaWYgKCFtYXRjaCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBfLmV2ZXJ5KF8ua2V5cyhtYXRjaCksIGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHJldHVybiBfLmlzRXF1YWwobWF0Y2hba2V5XSwgdmFsdWVba2V5XSk7XG4gICAgfSk7XG4gIH0sXG5cbiAgLy8gRmllbGQgdGVtcGxhdGUgaGVscGVyc1xuXG4gIGZpZWxkVGVtcGxhdGVUeXBlTmFtZTogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcztcblxuICAgIHZhciB0eXBlTmFtZSA9IHV0aWxzLmRhc2hUb1Bhc2NhbChmaWVsZFRlbXBsYXRlLnR5cGUgfHwgJ3VuZGVmaW5lZCcpO1xuXG4gICAgdmFyIGFsaWFzID0gY29uZmlnWydhbGlhc18nICsgdHlwZU5hbWVdO1xuXG4gICAgaWYgKGFsaWFzKSB7XG4gICAgICBpZiAoXy5pc0Z1bmN0aW9uKGFsaWFzKSkge1xuICAgICAgICByZXR1cm4gYWxpYXMuY2FsbChjb25maWcsIGZpZWxkVGVtcGxhdGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGFsaWFzO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChmaWVsZFRlbXBsYXRlLmxpc3QpIHtcbiAgICAgIHR5cGVOYW1lID0gJ0FycmF5JztcbiAgICB9XG5cbiAgICByZXR1cm4gdHlwZU5hbWU7XG4gIH0sXG5cbiAgZmllbGRUZW1wbGF0ZURlZmF1bHRWYWx1ZTogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcblxuICAgIHJldHVybiBmaWVsZFRlbXBsYXRlLmRlZmF1bHQ7XG4gIH0sXG5cbiAgZmllbGRUZW1wbGF0ZVZhbHVlOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSkge1xuICAgIHZhciBjb25maWcgPSB0aGlzO1xuXG4gICAgLy8gVGhpcyBsb2dpYyBtaWdodCBiZSBicml0dGxlLlxuXG4gICAgdmFyIGRlZmF1bHRWYWx1ZSA9IGNvbmZpZy5maWVsZFRlbXBsYXRlRGVmYXVsdFZhbHVlKGZpZWxkVGVtcGxhdGUpO1xuXG4gICAgdmFyIG1hdGNoID0gY29uZmlnLmZpZWxkVGVtcGxhdGVNYXRjaChmaWVsZFRlbXBsYXRlKTtcblxuICAgIHZhciB2YWx1ZTtcblxuICAgIGlmIChfLmlzVW5kZWZpbmVkKGRlZmF1bHRWYWx1ZSkgJiYgIV8uaXNVbmRlZmluZWQobWF0Y2gpKSB7XG4gICAgICByZXR1cm4gdXRpbHMuZGVlcENvcHkobWF0Y2gpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY29uZmlnLmNyZWF0ZURlZmF1bHRWYWx1ZShmaWVsZFRlbXBsYXRlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsdWU7XG4gIH0sXG5cbiAgZmllbGRUZW1wbGF0ZU1hdGNoOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSkge1xuICAgIHJldHVybiBmaWVsZFRlbXBsYXRlLm1hdGNoO1xuICB9LFxuXG4gIC8vIEZpZWxkIGhlbHBlcnNcblxuICBmaWVsZFZhbHVlUGF0aDogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXM7XG5cbiAgICB2YXIgcGFyZW50UGF0aCA9IFtdO1xuXG4gICAgaWYgKGZpZWxkLnBhcmVudCkge1xuICAgICAgcGFyZW50UGF0aCA9IGNvbmZpZy5maWVsZFZhbHVlUGF0aChmaWVsZC5wYXJlbnQpO1xuICAgIH1cblxuICAgIHJldHVybiBwYXJlbnRQYXRoLmNvbmNhdChmaWVsZC5rZXkpLmZpbHRlcihmdW5jdGlvbiAoa2V5KSB7XG4gICAgICByZXR1cm4gIV8uaXNVbmRlZmluZWQoa2V5KSAmJiBrZXkgIT09ICcnO1xuICAgIH0pO1xuICB9LFxuXG4gIGZpZWxkV2l0aFZhbHVlOiBmdW5jdGlvbiAoZmllbGQsIHZhbHVlKSB7XG4gICAgcmV0dXJuIF8uZXh0ZW5kKHt9LCBmaWVsZCwge3ZhbHVlOiB2YWx1ZX0pO1xuICB9LFxuXG4gIGZpZWxkVHlwZU5hbWU6IGRlbGVnYXRlVG8oJ2ZpZWxkVGVtcGxhdGVUeXBlTmFtZScpLFxuXG4gIGZpZWxkQ2hvaWNlczogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXM7XG5cbiAgICByZXR1cm4gY29uZmlnLm5vcm1hbGl6ZUNob2ljZXMoZmllbGQuY2hvaWNlcyk7XG4gIH0sXG5cbiAgZmllbGRCb29sZWFuQ2hvaWNlczogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXM7XG5cbiAgICB2YXIgY2hvaWNlcyA9IGNvbmZpZy5maWVsZENob2ljZXMoZmllbGQpO1xuXG4gICAgaWYgKGNob2ljZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gW3tcbiAgICAgICAgbGFiZWw6ICdZZXMnLFxuICAgICAgICB2YWx1ZTogdHJ1ZVxuICAgICAgfSx7XG4gICAgICAgIGxhYmVsOiAnTm8nLFxuICAgICAgICB2YWx1ZTogZmFsc2VcbiAgICAgIH1dO1xuICAgIH1cblxuICAgIHJldHVybiBjaG9pY2VzLm1hcChmdW5jdGlvbiAoY2hvaWNlKSB7XG4gICAgICBpZiAoXy5pc0Jvb2xlYW4oY2hvaWNlLnZhbHVlKSkge1xuICAgICAgICByZXR1cm4gY2hvaWNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIF8uZXh0ZW5kKHt9LCBjaG9pY2UsIHtcbiAgICAgICAgdmFsdWU6IGNvbmZpZy5jb2VyY2VWYWx1ZVRvQm9vbGVhbihjaG9pY2UudmFsdWUpXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSxcblxuICBmaWVsZFJlcGxhY2VDaG9pY2VzOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcztcblxuICAgIHJldHVybiBjb25maWcubm9ybWFsaXplQ2hvaWNlcyhmaWVsZC5yZXBsYWNlQ2hvaWNlcyk7XG4gIH0sXG5cbiAgZmllbGRMYWJlbDogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgcmV0dXJuIGZpZWxkLmxhYmVsO1xuICB9LFxuXG4gIGZpZWxkSGVscFRleHQ6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIHJldHVybiBmaWVsZC5oZWxwX3RleHRfaHRtbCB8fCBmaWVsZC5oZWxwX3RleHQgfHwgZmllbGQuaGVscFRleHQgfHwgZmllbGQuaGVscFRleHRIdG1sO1xuICB9LFxuXG4gIGZpZWxkSXNSZXF1aXJlZDogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgcmV0dXJuIGZpZWxkLnJlcXVpcmVkO1xuICB9LFxuXG4gIC8vIERldGVybWluZSBpZiB2YWx1ZSBmb3IgdGhpcyBmaWVsZCBpcyBub3QgYSBsZWFmIHZhbHVlLlxuICBmaWVsZEhhc1ZhbHVlQ2hpbGRyZW46IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzO1xuXG4gICAgdmFyIGRlZmF1bHRWYWx1ZSA9IGNvbmZpZy5jcmVhdGVEZWZhdWx0VmFsdWUoZmllbGQpO1xuXG4gICAgaWYgKF8uaXNPYmplY3QoZGVmYXVsdFZhbHVlKSB8fCBfLmlzQXJyYXkoZGVmYXVsdFZhbHVlKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuXG4gIGZpZWxkQ2hpbGRGaWVsZFRlbXBsYXRlczogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgcmV0dXJuIGZpZWxkLmZpZWxkcyB8fCBbXTtcbiAgfSxcblxuICBmaWVsZEl0ZW1GaWVsZFRlbXBsYXRlczogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgaWYgKCFmaWVsZC5pdGVtRmllbGRzKSB7XG4gICAgICByZXR1cm4gW3t0eXBlOiAndGV4dCd9XTtcbiAgICB9XG4gICAgaWYgKCFfLmlzQXJyYXkoZmllbGQuaXRlbUZpZWxkcykpIHtcbiAgICAgIHJldHVybiBbZmllbGQuaXRlbUZpZWxkc107XG4gICAgfVxuICAgIHJldHVybiBmaWVsZC5pdGVtRmllbGRzO1xuICB9LFxuXG4gIGZpZWxkSXNTaW5nbGVMaW5lOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICByZXR1cm4gZmllbGQuaXNTaW5nbGVMaW5lIHx8IGZpZWxkLmlzX3NpbmdsZV9saW5lIHx8IGZpZWxkLnR5cGUgPT09ICd1bmljb2RlJyB8fCBmaWVsZC50eXBlID09PSAnVW5pY29kZSc7XG4gIH0sXG5cbiAgZmllbGRJc0NvbGxhcHNlZDogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgcmV0dXJuIGZpZWxkLmNvbGxhcHNlZCA/IHRydWUgOiBmYWxzZTtcbiAgfSxcblxuICBmaWVsZElzQ29sbGFwc2libGU6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIHJldHVybiBmaWVsZC5jb2xsYXBzaWJsZSB8fCAhXy5pc1VuZGVmaW5lZChmaWVsZC5jb2xsYXBzZWQpO1xuICB9LFxuXG4gIGZpZWxkUm93czogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgcmV0dXJuIGZpZWxkLnJvd3M7XG4gIH0sXG5cbiAgZmllbGRNYXRjaDogZGVsZWdhdGVUbygnZmllbGRUZW1wbGF0ZU1hdGNoJyksXG5cbiAgLy8gT3RoZXIgaGVscGVyc1xuXG4gIGh1bWFuaXplOiBmdW5jdGlvbihwcm9wZXJ0eSkge1xuICAgIHByb3BlcnR5ID0gcHJvcGVydHkucmVwbGFjZSgvXFx7XFx7L2csICcnKTtcbiAgICBwcm9wZXJ0eSA9IHByb3BlcnR5LnJlcGxhY2UoL1xcfVxcfS9nLCAnJyk7XG4gICAgcmV0dXJuIHByb3BlcnR5LnJlcGxhY2UoL18vZywgJyAnKVxuICAgIC5yZXBsYWNlKC8oXFx3KykvZywgZnVuY3Rpb24obWF0Y2gpIHtcbiAgICAgIHJldHVybiBtYXRjaC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIG1hdGNoLnNsaWNlKDEpO1xuICAgIH0pO1xuICB9LFxuXG4gIG5vcm1hbGl6ZUNob2ljZXM6IGZ1bmN0aW9uIChjaG9pY2VzKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXM7XG5cbiAgICBpZiAoIWNob2ljZXMpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICAvLyBDb252ZXJ0IGNvbW1hIHNlcGFyYXRlZCBzdHJpbmcgdG8gYXJyYXkgb2Ygc3RyaW5ncy5cbiAgICBpZiAoXy5pc1N0cmluZyhjaG9pY2VzKSkge1xuICAgICAgY2hvaWNlcyA9IGNob2ljZXMuc3BsaXQoJywnKTtcbiAgICB9XG5cbiAgICAvLyBDb252ZXJ0IG9iamVjdCB0byBhcnJheSBvZiBvYmplY3RzIHdpdGggYHZhbHVlYCBhbmQgYGxhYmVsYCBwcm9wZXJ0aWVzLlxuICAgIGlmICghXy5pc0FycmF5KGNob2ljZXMpICYmIF8uaXNPYmplY3QoY2hvaWNlcykpIHtcbiAgICAgIGNob2ljZXMgPSBPYmplY3Qua2V5cyhjaG9pY2VzKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHZhbHVlOiBrZXksXG4gICAgICAgICAgbGFiZWw6IGNob2ljZXNba2V5XVxuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQ29weSB0aGUgYXJyYXkgb2YgY2hvaWNlcyBzbyB3ZSBjYW4gbWFuaXB1bGF0ZSB0aGVtLlxuICAgIGNob2ljZXMgPSBjaG9pY2VzLnNsaWNlKDApO1xuXG4gICAgLy8gQXJyYXkgb2YgY2hvaWNlIGFycmF5cyBzaG91bGQgYmUgZmxhdHRlbmVkLlxuICAgIGNob2ljZXMgPSBfLmZsYXR0ZW4oY2hvaWNlcyk7XG5cbiAgICBjaG9pY2VzLmZvckVhY2goZnVuY3Rpb24gKGNob2ljZSwgaSkge1xuICAgICAgLy8gQ29udmVydCBhbnkgc3RyaW5nIGNob2ljZXMgdG8gb2JqZWN0cyB3aXRoIGB2YWx1ZWAgYW5kIGBsYWJlbGBcbiAgICAgIC8vIHByb3BlcnRpZXMuXG4gICAgICBpZiAoXy5pc1N0cmluZyhjaG9pY2UpKSB7XG4gICAgICAgIGNob2ljZXNbaV0gPSB7XG4gICAgICAgICAgdmFsdWU6IGNob2ljZSxcbiAgICAgICAgICBsYWJlbDogY29uZmlnLmh1bWFuaXplKGNob2ljZSlcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmICghY2hvaWNlc1tpXS5sYWJlbCkge1xuICAgICAgICBjaG9pY2VzW2ldLmxhYmVsID0gY29uZmlnLmh1bWFuaXplKGNob2ljZXNbaV0udmFsdWUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGNob2ljZXM7XG4gIH0sXG5cbiAgLy8gQ29lcmNlIGEgdmFsdWUgdG8gYSBib29sZWFuXG4gIGNvZXJjZVZhbHVlVG9Cb29sZWFuOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBpZiAoIV8uaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgICAvLyBKdXN0IHVzZSB0aGUgZGVmYXVsdCB0cnV0aGluZXNzLlxuICAgICAgcmV0dXJuIHZhbHVlID8gdHJ1ZSA6IGZhbHNlO1xuICAgIH1cbiAgICB2YWx1ZSA9IHZhbHVlLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKHZhbHVlID09PSAnJyB8fCB2YWx1ZSA9PT0gJ25vJyB8fCB2YWx1ZSA9PT0gJ29mZicgfHwgdmFsdWUgPT09ICdmYWxzZScpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG5cbiAgaXNLZXk6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4gKF8uaXNOdW1iZXIoa2V5KSAmJiBrZXkgPj0gMCkgfHwgKF8uaXNTdHJpbmcoa2V5KSAmJiBrZXkgIT09ICcnKTtcbiAgfSxcblxuICAvLyBGYXN0IHdheSB0byBjaGVjayBmb3IgZW1wdHkgb2JqZWN0LlxuICBpc0VtcHR5T2JqZWN0OiBmdW5jdGlvbiAob2JqKSB7XG4gICAgZm9yKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxudmFyIGRlZmF1bHRDb25maWcgPSByZXF1aXJlKCcuL2RlZmF1bHQtY29uZmlnJyk7XG5cbnZhciBGb3JtYXRpY0NvbnRyb2xsZWRDbGFzcyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0Zvcm1hdGljQ29udHJvbGxlZCcsXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgaW5mbykge1xuICAgIGlmICghdGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvL3ZhciBpc1dyYXBwZWQgPSAhdGhpcy5wcm9wcy5maWVsZDtcbiAgICBpbmZvID0gXy5leHRlbmQoe30sIGluZm8pO1xuICAgIC8vIGlmIChpc1dyYXBwZWQpIHtcbiAgICAvLyAgIGluZm8uZmllbGRzID0gaW5mby5maWVsZHMuc2xpY2UoMSk7XG4gICAgLy8gICBpbmZvLmZpZWxkID0gaW5mby5maWVsZHNbMF07XG4gICAgLy8gfVxuICAgIC8vaW5mby5wYXRoID0gdmFsdWVQYXRoKGluZm8uZmllbGRzKTtcbiAgICBpbmZvLnBhdGggPSB0aGlzLnByb3BzLmNvbmZpZy5maWVsZFZhbHVlUGF0aChpbmZvLmZpZWxkKTtcbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG5ld1ZhbHVlLCBpbmZvKTtcbiAgfSxcblxuICBvbkFjdGlvbjogZnVuY3Rpb24gKGluZm8pIHtcbiAgICBpZiAoIXRoaXMucHJvcHMub25BY3Rpb24pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy92YXIgaXNXcmFwcGVkID0gIXRoaXMucHJvcHMuZmllbGQ7XG4gICAgaW5mbyA9IF8uZXh0ZW5kKHt9LCBpbmZvKTtcbiAgICAvLyBpZiAoaXNXcmFwcGVkKSB7XG4gICAgLy8gICBpbmZvLmZpZWxkcyA9IGluZm8uZmllbGRzLnNsaWNlKDEpO1xuICAgIC8vICAgaW5mby5maWVsZCA9IGluZm8uZmllbGRzWzBdO1xuICAgIC8vIH1cbiAgICAvL2luZm8ucGF0aCA9IHZhbHVlUGF0aChpbmZvLmZpZWxkcyk7XG4gICAgaW5mby5wYXRoID0gdGhpcy5wcm9wcy5jb25maWcuZmllbGRWYWx1ZVBhdGgoaW5mby5maWVsZCk7XG4gICAgdGhpcy5wcm9wcy5vbkFjdGlvbihpbmZvKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblxuICAgIHJldHVybiBjb25maWcucmVuZGVyRm9ybWF0aWNDb21wb25lbnQodGhpcyk7XG4gIH1cbn0pO1xuXG52YXIgRm9ybWF0aWNDb250cm9sbGVkID0gUmVhY3QuY3JlYXRlRmFjdG9yeShGb3JtYXRpY0NvbnRyb2xsZWRDbGFzcyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIHN0YXRpY3M6IHtcbiAgICBjcmVhdGVDb25maWc6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBhcmdzID0gXy50b0FycmF5KGFyZ3VtZW50cyk7XG4gICAgICB2YXIgY29uZmlnID0gXy5leHRlbmQoe30sIGRlZmF1bHRDb25maWcpO1xuXG4gICAgICBpZiAoYXJncy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICAgIH1cbiAgICAgIHZhciBjb25maWdzID0gW2NvbmZpZ10uY29uY2F0KGFyZ3MpO1xuICAgICAgcmV0dXJuIGNvbmZpZ3MucmVkdWNlKGZ1bmN0aW9uIChwcmV2LCBjdXJyKSB7XG4gICAgICAgIGlmIChfLmlzRnVuY3Rpb24oY3VycikpIHtcbiAgICAgICAgICBjdXJyKHByZXYpO1xuICAgICAgICAgIHJldHVybiBwcmV2O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfLmV4dGVuZChwcmV2LCBjdXJyKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgYXZhaWxhYmxlTWl4aW5zOiB7XG4gICAgICBjbGlja091dHNpZGU6IHJlcXVpcmUoJy4vbWl4aW5zL2NsaWNrLW91dHNpZGUuanMnKSxcbiAgICAgIGZpZWxkOiByZXF1aXJlKCcuL21peGlucy9maWVsZC5qcycpLFxuICAgICAgaGVscGVyOiByZXF1aXJlKCcuL21peGlucy9oZWxwZXIuanMnKSxcbiAgICAgIGlucHV0QWN0aW9uczogcmVxdWlyZSgnLi9taXhpbnMvaW5wdXQtYWN0aW9ucy5qcycpLFxuICAgICAgcmVzaXplOiByZXF1aXJlKCcuL21peGlucy9yZXNpemUuanMnKSxcbiAgICAgIHNjcm9sbDogcmVxdWlyZSgnLi9taXhpbnMvc2Nyb2xsLmpzJyksXG4gICAgICB1bmRvU3RhY2s6IHJlcXVpcmUoJy4vbWl4aW5zL3VuZG8tc3RhY2suanMnKVxuICAgIH0sXG4gICAgcGx1Z2luczoge1xuICAgICAgYm9vdHN0cmFwOiByZXF1aXJlKCcuL3BsdWdpbnMvYm9vdHN0cmFwJyksXG4gICAgICBtZXRhOiByZXF1aXJlKCcuL3BsdWdpbnMvbWV0YScpLFxuICAgICAgcmVmZXJlbmNlOiByZXF1aXJlKCcuL3BsdWdpbnMvcmVmZXJlbmNlJylcbiAgICB9LFxuICAgIHV0aWxzOiB1dGlsc1xuICB9LFxuXG4gIGRpc3BsYXlOYW1lOiAnRm9ybWF0aWMnLFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpc0NvbnRyb2xsZWQ6ICFfLmlzVW5kZWZpbmVkKHRoaXMucHJvcHMudmFsdWUpLFxuICAgICAgdmFsdWU6IF8uaXNVbmRlZmluZWQodGhpcy5wcm9wcy52YWx1ZSkgPyB0aGlzLnByb3BzLmRlZmF1bHRWYWx1ZSA6IHRoaXMucHJvcHMudmFsdWVcbiAgICB9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXdQcm9wcykge1xuICAgIGlmICh0aGlzLnN0YXRlLmlzQ29udHJvbGxlZCkge1xuICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKG5ld1Byb3BzLnZhbHVlKSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICB2YWx1ZTogbmV3UHJvcHMudmFsdWVcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAobmV3VmFsdWUsIGluZm8pIHtcbiAgICBpZiAoIXRoaXMuc3RhdGUuaXNDb250cm9sbGVkKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgdmFsdWU6IG5ld1ZhbHVlXG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMucHJvcHMub25DaGFuZ2UobmV3VmFsdWUsIGluZm8pO1xuICB9LFxuXG4gIG9uQWN0aW9uOiBmdW5jdGlvbiAoaW5mbykge1xuICAgIGlmICh0aGlzLnByb3BzLm9uQWN0aW9uKSB7XG4gICAgICB0aGlzLnByb3BzLm9uQWN0aW9uKGluZm8pO1xuICAgIH1cbiAgICB2YXIgYWN0aW9uID0gdXRpbHMuZGFzaFRvUGFzY2FsKGluZm8uYWN0aW9uKTtcbiAgICBpZiAodGhpcy5wcm9wc1snb24nICsgYWN0aW9uXSkge1xuICAgICAgdGhpcy5wcm9wc1snb24nICsgYWN0aW9uXShpbmZvKTtcbiAgICB9XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWcgfHwgZGVmYXVsdENvbmZpZztcbiAgICB2YXIgdmFsdWUgPSB0aGlzLnN0YXRlLnZhbHVlO1xuXG4gICAgaWYgKHRoaXMuc3RhdGUuaXNDb250cm9sbGVkKSB7XG4gICAgICBpZiAoIXRoaXMucHJvcHMub25DaGFuZ2UpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1lvdSBzaG91bGQgc3VwcGx5IGFuIG9uQ2hhbmdlIGhhbmRsZXIgaWYgeW91IHN1cHBseSBhIHZhbHVlLicpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBwcm9wcyA9IHtcbiAgICAgIGNvbmZpZzogY29uZmlnLFxuICAgICAgLy8gQWxsb3cgZmllbGQgdGVtcGxhdGVzIHRvIGJlIHBhc3NlZCBpbiBhcyBgZmllbGRgIG9yIGBmaWVsZHNgLiBBZnRlciB0aGlzLCBzdG9wXG4gICAgICAvLyBjYWxsaW5nIHRoZW0gZmllbGRzLlxuICAgICAgZmllbGRUZW1wbGF0ZTogdGhpcy5wcm9wcy5maWVsZCxcbiAgICAgIGZpZWxkVGVtcGxhdGVzOiB0aGlzLnByb3BzLmZpZWxkcyxcbiAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgb25BY3Rpb246IHRoaXMub25BY3Rpb25cbiAgICB9O1xuXG4gICAgXy5lYWNoKHRoaXMucHJvcHMsIGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICBpZiAoIShrZXkgaW4gcHJvcHMpKSB7XG4gICAgICAgIHByb3BzW2tleV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBGb3JtYXRpY0NvbnRyb2xsZWQocHJvcHMpO1xuICB9XG5cbn0pO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIG1peGluLmNsaWNrLW91dHNpZGVcblxuLypcblRoZXJlJ3Mgbm8gbmF0aXZlIFJlYWN0IHdheSB0byBkZXRlY3QgY2xpY2tpbmcgb3V0c2lkZSBhbiBlbGVtZW50LiBTb21ldGltZXNcbnRoaXMgaXMgdXNlZnVsLCBzbyB0aGF0J3Mgd2hhdCB0aGlzIG1peGluIGRvZXMuIFRvIHVzZSBpdCwgbWl4IGl0IGluIGFuZCB1c2UgaXRcbmZyb20geW91ciBjb21wb25lbnQgbGlrZSB0aGlzOlxuXG5gYGBqc1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgbWl4aW5zOiBbcGx1Z2luLnJlcXVpcmUoJ21peGluLmNsaWNrLW91dHNpZGUnKV0sXG5cbiAgICBvbkNsaWNrT3V0c2lkZTogZnVuY3Rpb24gKCkge1xuICAgICAgY29uc29sZS5sb2coJ2NsaWNrZWQgb3V0c2lkZSEnKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuc2V0T25DbGlja091dHNpZGUoJ215RGl2JywgdGhpcy5vbkNsaWNrT3V0c2lkZSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIFJlYWN0LkRPTS5kaXYoe3JlZjogJ215RGl2J30sXG4gICAgICAgICdIZWxsbyEnXG4gICAgICApXG4gICAgfVxuICB9KTtcbn07XG5gYGBcbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbnZhciBoYXNBbmNlc3RvciA9IGZ1bmN0aW9uIChjaGlsZCwgcGFyZW50KSB7XG4gIGlmIChjaGlsZC5wYXJlbnROb2RlID09PSBwYXJlbnQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBpZiAoY2hpbGQucGFyZW50Tm9kZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gaGFzQW5jZXN0b3IoY2hpbGQucGFyZW50Tm9kZSwgcGFyZW50KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIC8vIF9vbkNsaWNrRG9jdW1lbnQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gIC8vICAgY29uc29sZS5sb2coJ2NsaWNrIGRvYycpXG4gIC8vICAgaWYgKHRoaXMuX2RpZE1vdXNlRG93bikge1xuICAvLyAgICAgXy5lYWNoKHRoaXMuY2xpY2tPdXRzaWRlSGFuZGxlcnMsIGZ1bmN0aW9uIChmdW5jcywgcmVmKSB7XG4gIC8vICAgICAgIGlmIChpc091dHNpZGUoZXZlbnQudGFyZ2V0LCB0aGlzLnJlZnNbcmVmXS5nZXRET01Ob2RlKCkpKSB7XG4gIC8vICAgICAgICAgZnVuY3MuZm9yRWFjaChmdW5jdGlvbiAoZm4pIHtcbiAgLy8gICAgICAgICAgIGZuLmNhbGwodGhpcyk7XG4gIC8vICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgLy8gICAgICAgfVxuICAvLyAgICAgfS5iaW5kKHRoaXMpKTtcbiAgLy8gICB9XG4gIC8vIH0sXG5cbiAgaXNOb2RlT3V0c2lkZTogZnVuY3Rpb24gKG5vZGVPdXQsIG5vZGVJbikge1xuICAgIGlmIChub2RlT3V0ID09PSBub2RlSW4pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGhhc0FuY2VzdG9yKG5vZGVPdXQsIG5vZGVJbikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG5cbiAgaXNOb2RlSW5zaWRlOiBmdW5jdGlvbiAobm9kZUluLCBub2RlT3V0KSB7XG4gICAgcmV0dXJuICF0aGlzLmlzTm9kZU91dHNpZGUobm9kZUluLCBub2RlT3V0KTtcbiAgfSxcblxuICBfb25DbGlja01vdXNlZG93bjogZnVuY3Rpb24oKSB7XG4gICAgLy90aGlzLl9kaWRNb3VzZURvd24gPSB0cnVlO1xuICAgIF8uZWFjaCh0aGlzLmNsaWNrT3V0c2lkZUhhbmRsZXJzLCBmdW5jdGlvbiAoZnVuY3MsIHJlZikge1xuICAgICAgaWYgKHRoaXMucmVmc1tyZWZdKSB7XG4gICAgICAgIHRoaXMuX21vdXNlZG93blJlZnNbcmVmXSA9IHRydWU7XG4gICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfSxcblxuICBfb25DbGlja01vdXNldXA6IGZ1bmN0aW9uIChldmVudCkge1xuICAgIF8uZWFjaCh0aGlzLmNsaWNrT3V0c2lkZUhhbmRsZXJzLCBmdW5jdGlvbiAoZnVuY3MsIHJlZikge1xuICAgICAgaWYgKHRoaXMucmVmc1tyZWZdICYmIHRoaXMuX21vdXNlZG93blJlZnNbcmVmXSkge1xuICAgICAgICBpZiAodGhpcy5pc05vZGVPdXRzaWRlKGV2ZW50LnRhcmdldCwgdGhpcy5yZWZzW3JlZl0uZ2V0RE9NTm9kZSgpKSkge1xuICAgICAgICAgIGZ1bmNzLmZvckVhY2goZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICBmbi5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLl9tb3VzZWRvd25SZWZzW3JlZl0gPSBmYWxzZTtcbiAgICB9LmJpbmQodGhpcykpO1xuICB9LFxuXG4gIC8vIF9vbkNsaWNrRG9jdW1lbnQ6IGZ1bmN0aW9uICgpIHtcbiAgLy8gICBjb25zb2xlLmxvZygnY2xpY2tldHknKVxuICAvLyAgIF8uZWFjaCh0aGlzLmNsaWNrT3V0c2lkZUhhbmRsZXJzLCBmdW5jdGlvbiAoZnVuY3MsIHJlZikge1xuICAvLyAgICAgY29uc29sZS5sb2coJ2NsaWNrZXR5JywgcmVmLCB0aGlzLnJlZnNbcmVmXSlcbiAgLy8gICB9LmJpbmQodGhpcykpO1xuICAvLyB9LFxuXG4gIHNldE9uQ2xpY2tPdXRzaWRlOiBmdW5jdGlvbiAocmVmLCBmbikge1xuICAgIGlmICghdGhpcy5jbGlja091dHNpZGVIYW5kbGVyc1tyZWZdKSB7XG4gICAgICB0aGlzLmNsaWNrT3V0c2lkZUhhbmRsZXJzW3JlZl0gPSBbXTtcbiAgICB9XG4gICAgdGhpcy5jbGlja091dHNpZGVIYW5kbGVyc1tyZWZdLnB1c2goZm4pO1xuICB9LFxuXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jbGlja091dHNpZGVIYW5kbGVycyA9IHt9O1xuICAgIHRoaXMuX2RpZE1vdXNlRG93biA9IGZhbHNlO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX29uQ2xpY2tNb3VzZWRvd24pO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9vbkNsaWNrTW91c2V1cCk7XG4gICAgLy9kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uQ2xpY2tEb2N1bWVudCk7XG4gICAgdGhpcy5fbW91c2Vkb3duUmVmcyA9IHt9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jbGlja091dHNpZGVIYW5kbGVycyA9IHt9O1xuICAgIC8vZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkNsaWNrRG9jdW1lbnQpO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9vbkNsaWNrTW91c2V1cCk7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5fb25DbGlja01vdXNlZG93bik7XG4gIH1cbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgbWl4aW4uZmllbGRcblxuLypcbldyYXAgdXAgeW91ciBmaWVsZHMgd2l0aCB0aGlzIG1peGluIHRvIGdldDpcbi0gQXV0b21hdGljIG1ldGFkYXRhIGxvYWRpbmcuXG4tIEFueXRoaW5nIGVsc2UgZGVjaWRlZCBsYXRlci5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIG9uQ2hhbmdlVmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UodmFsdWUsIHtcbiAgICAgIGZpZWxkOiB0aGlzLnByb3BzLmZpZWxkXG4gICAgfSk7XG4gIH0sXG5cbiAgb25CdWJibGVWYWx1ZTogZnVuY3Rpb24gKHZhbHVlLCBpbmZvKSB7XG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZSh2YWx1ZSwgaW5mbyk7XG4gIH0sXG5cbiAgb25TdGFydEFjdGlvbjogZnVuY3Rpb24gKGFjdGlvbiwgcHJvcHMpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5vbkFjdGlvbikge1xuICAgICAgdmFyIGluZm8gPSBfLmV4dGVuZCh7fSwgcHJvcHMpO1xuICAgICAgaW5mby5hY3Rpb24gPSBhY3Rpb247XG4gICAgICBpbmZvLmZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcbiAgICAgIHRoaXMucHJvcHMub25BY3Rpb24oaW5mbyk7XG4gICAgfVxuICB9LFxuXG4gIG9uRm9jdXNBY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLm9uU3RhcnRBY3Rpb24oJ2ZvY3VzJyk7XG4gIH0sXG5cbiAgb25CbHVyQWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5vblN0YXJ0QWN0aW9uKCdibHVyJyk7XG4gIH0sXG5cbiAgb25CdWJibGVBY3Rpb246IGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgaWYgKHRoaXMucHJvcHMub25BY3Rpb24pIHtcbiAgICAgIHRoaXMucHJvcHMub25BY3Rpb24oaW5mbyk7XG4gICAgfVxuICB9LFxuXG4gIHJlbmRlcldpdGhDb25maWc6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5jb25maWcucmVuZGVyRmllbGRDb21wb25lbnQodGhpcyk7XG4gIH1cbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIHJlbmRlcldpdGhDb25maWc6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5jb25maWcucmVuZGVyQ29tcG9uZW50KHRoaXMpO1xuICB9LFxuXG4gIG9uU3RhcnRBY3Rpb246IGZ1bmN0aW9uIChhY3Rpb24sIHByb3BzKSB7XG4gICAgaWYgKHRoaXMucHJvcHMub25BY3Rpb24pIHtcbiAgICAgIHZhciBpbmZvID0gXy5leHRlbmQoe30sIHByb3BzKTtcbiAgICAgIGluZm8uYWN0aW9uID0gYWN0aW9uO1xuICAgICAgaW5mby5maWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG4gICAgICB0aGlzLnByb3BzLm9uQWN0aW9uKGluZm8pO1xuICAgIH1cbiAgfSxcblxuICBvbkJ1YmJsZUFjdGlvbjogZnVuY3Rpb24gKGluZm8pIHtcbiAgICBpZiAodGhpcy5wcm9wcy5vbkFjdGlvbikge1xuICAgICAgdGhpcy5wcm9wcy5vbkFjdGlvbihpbmZvKTtcbiAgICB9XG4gIH0sXG5cbiAgb25Gb2N1c0FjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMub25TdGFydEFjdGlvbignZm9jdXMnKTtcbiAgfSxcblxuICBvbkJsdXJBY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLm9uU3RhcnRBY3Rpb24oJ2JsdXInKTtcbiAgfVxufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiLy8gIyBtaXhpbi5pbnB1dC1hY3Rpb25zXG5cbi8qXG5DdXJyZW50bHkgdW51c2VkLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IHtcblxuICAgIG9uRm9jdXM6IGZ1bmN0aW9uICgpIHtcblxuICAgIH0sXG5cbiAgICBvbkJsdXI6IGZ1bmN0aW9uICgpIHtcblxuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gKCkge1xuXG4gICAgfVxuICB9O1xufTtcbiIsIi8vICMgbWl4aW4ucmVzaXplXG5cbi8qXG5Zb3UnZCB0aGluayBpdCB3b3VsZCBiZSBwcmV0dHkgZWFzeSB0byBkZXRlY3Qgd2hlbiBhIERPTSBlbGVtZW50IGlzIHJlc2l6ZWQuXG5BbmQgeW91J2QgYmUgd3JvbmcuIFRoZXJlIGFyZSB2YXJpb3VzIHRyaWNrcywgYnV0IG5vbmUgb2YgdGhlbSB3b3JrIHZlcnkgd2VsbC5cblNvLCB1c2luZyBnb29kIG9sJyBwb2xsaW5nIGhlcmUuIFRvIHRyeSB0byBiZSBhcyBlZmZpY2llbnQgYXMgcG9zc2libGUsIHRoZXJlXG5pcyBvbmx5IGEgc2luZ2xlIHNldEludGVydmFsIHVzZWQgZm9yIGFsbCBlbGVtZW50cy4gVG8gdXNlOlxuXG5gYGBqc1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgbWl4aW5zOiBbcGx1Z2luLnJlcXVpcmUoJ21peGluLnJlc2l6ZScpXSxcblxuICAgIG9uUmVzaXplOiBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zb2xlLmxvZygncmVzaXplZCEnKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuc2V0T25SZXNpemUoJ215VGV4dCcsIHRoaXMub25SZXNpemUpO1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gKCkge1xuICAgICAgLi4uXG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIFJlYWN0LkRPTS50ZXh0YXJlYSh7cmVmOiAnbXlUZXh0JywgdmFsdWU6IHRoaXMucHJvcHMudmFsdWUsIG9uQ2hhbmdlOiAuLi59KVxuICAgIH1cbiAgfSk7XG59O1xuYGBgXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBpZCA9IDA7XG5cbnZhciByZXNpemVJbnRlcnZhbEVsZW1lbnRzID0ge307XG52YXIgcmVzaXplSW50ZXJ2YWxFbGVtZW50c0NvdW50ID0gMDtcbnZhciByZXNpemVJbnRlcnZhbFRpbWVyID0gbnVsbDtcblxudmFyIGNoZWNrRWxlbWVudHMgPSBmdW5jdGlvbiAoKSB7XG4gIE9iamVjdC5rZXlzKHJlc2l6ZUludGVydmFsRWxlbWVudHMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIHZhciBlbGVtZW50ID0gcmVzaXplSW50ZXJ2YWxFbGVtZW50c1trZXldO1xuICAgIGlmIChlbGVtZW50LmNsaWVudFdpZHRoICE9PSBlbGVtZW50Ll9fcHJldkNsaWVudFdpZHRoIHx8IGVsZW1lbnQuY2xpZW50SGVpZ2h0ICE9PSBlbGVtZW50Ll9fcHJldkNsaWVudEhlaWdodCkge1xuICAgICAgZWxlbWVudC5fX3ByZXZDbGllbnRXaWR0aCA9IGVsZW1lbnQuY2xpZW50V2lkdGg7XG4gICAgICBlbGVtZW50Ll9fcHJldkNsaWVudEhlaWdodCA9IGVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgICAgdmFyIGhhbmRsZXJzID0gZWxlbWVudC5fX3Jlc2l6ZUhhbmRsZXJzO1xuICAgICAgaGFuZGxlcnMuZm9yRWFjaChmdW5jdGlvbiAoaGFuZGxlcikge1xuICAgICAgICBoYW5kbGVyKCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sIDEwMCk7XG59O1xuXG52YXIgYWRkUmVzaXplSW50ZXJ2YWxIYW5kbGVyID0gZnVuY3Rpb24gKGVsZW1lbnQsIGZuKSB7XG4gIGlmIChyZXNpemVJbnRlcnZhbFRpbWVyID09PSBudWxsKSB7XG4gICAgcmVzaXplSW50ZXJ2YWxUaW1lciA9IHNldEludGVydmFsKGNoZWNrRWxlbWVudHMsIDEwMCk7XG4gIH1cbiAgaWYgKCEoJ19fcmVzaXplSWQnIGluIGVsZW1lbnQpKSB7XG4gICAgaWQrKztcbiAgICBlbGVtZW50Ll9fcHJldkNsaWVudFdpZHRoID0gZWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICBlbGVtZW50Ll9fcHJldkNsaWVudEhlaWdodCA9IGVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgIGVsZW1lbnQuX19yZXNpemVJZCA9IGlkO1xuICAgIHJlc2l6ZUludGVydmFsRWxlbWVudHNDb3VudCsrO1xuICAgIHJlc2l6ZUludGVydmFsRWxlbWVudHNbaWRdID0gZWxlbWVudDtcbiAgICBlbGVtZW50Ll9fcmVzaXplSGFuZGxlcnMgPSBbXTtcbiAgfVxuICBlbGVtZW50Ll9fcmVzaXplSGFuZGxlcnMucHVzaChmbik7XG59O1xuXG52YXIgcmVtb3ZlUmVzaXplSW50ZXJ2YWxIYW5kbGVycyA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIGlmICghKCdfX3Jlc2l6ZUlkJyBpbiBlbGVtZW50KSkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgaWQgPSBlbGVtZW50Ll9fcmVzaXplSWQ7XG4gIGRlbGV0ZSBlbGVtZW50Ll9fcmVzaXplSWQ7XG4gIGRlbGV0ZSBlbGVtZW50Ll9fcmVzaXplSGFuZGxlcnM7XG4gIGRlbGV0ZSByZXNpemVJbnRlcnZhbEVsZW1lbnRzW2lkXTtcbiAgcmVzaXplSW50ZXJ2YWxFbGVtZW50c0NvdW50LS07XG4gIGlmIChyZXNpemVJbnRlcnZhbEVsZW1lbnRzQ291bnQgPCAxKSB7XG4gICAgY2xlYXJJbnRlcnZhbChyZXNpemVJbnRlcnZhbFRpbWVyKTtcbiAgICByZXNpemVJbnRlcnZhbFRpbWVyID0gbnVsbDtcbiAgfVxufTtcblxudmFyIG9uUmVzaXplID0gZnVuY3Rpb24gKHJlZiwgZm4pIHtcbiAgZm4ocmVmKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMub25SZXNpemVXaW5kb3cpIHtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLm9uUmVzaXplV2luZG93KTtcbiAgICB9XG4gICAgdGhpcy5yZXNpemVFbGVtZW50UmVmcyA9IHt9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMub25SZXNpemVXaW5kb3cpIHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLm9uUmVzaXplV2luZG93KTtcbiAgICB9XG4gICAgT2JqZWN0LmtleXModGhpcy5yZXNpemVFbGVtZW50UmVmcykuZm9yRWFjaChmdW5jdGlvbiAocmVmKSB7XG4gICAgICByZW1vdmVSZXNpemVJbnRlcnZhbEhhbmRsZXJzKHRoaXMucmVmc1tyZWZdLmdldERPTU5vZGUoKSk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfSxcblxuICBzZXRPblJlc2l6ZTogZnVuY3Rpb24gKHJlZiwgZm4pIHtcbiAgICBpZiAoIXRoaXMucmVzaXplRWxlbWVudFJlZnNbcmVmXSkge1xuICAgICAgdGhpcy5yZXNpemVFbGVtZW50UmVmc1tyZWZdID0gdHJ1ZTtcbiAgICB9XG4gICAgYWRkUmVzaXplSW50ZXJ2YWxIYW5kbGVyKHRoaXMucmVmc1tyZWZdLmdldERPTU5vZGUoKSwgb25SZXNpemUuYmluZCh0aGlzLCByZWYsIGZuKSk7XG4gIH1cbn07XG4iLCIvLyAjIG1peGluLnNjcm9sbFxuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0ge1xuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLm9uU2Nyb2xsV2luZG93KSB7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCB0aGlzLm9uU2Nyb2xsV2luZG93KTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLm9uU2Nyb2xsV2luZG93KSB7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCB0aGlzLm9uU2Nyb2xsV2luZG93KTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59O1xuIiwiLy8gIyBtaXhpbi51bmRvLXN0YWNrXG5cbi8qXG5HaXZlcyB5b3VyIGNvbXBvbmVudCBhbiB1bmRvIHN0YWNrLlxuKi9cblxuLy8gaHR0cDovL3Byb21ldGhldXNyZXNlYXJjaC5naXRodWIuaW8vcmVhY3QtZm9ybXMvZXhhbXBsZXMvdW5kby5odG1sXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHt1bmRvOiBbXSwgcmVkbzogW119O1xuICB9LFxuXG4gIHNuYXBzaG90OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdW5kbyA9IHRoaXMuc3RhdGUudW5kby5jb25jYXQodGhpcy5nZXRTdGF0ZVNuYXBzaG90KCkpO1xuICAgIGlmICh0eXBlb2YgdGhpcy5zdGF0ZS51bmRvRGVwdGggPT09ICdudW1iZXInKSB7XG4gICAgICBpZiAodW5kby5sZW5ndGggPiB0aGlzLnN0YXRlLnVuZG9EZXB0aCkge1xuICAgICAgICB1bmRvLnNoaWZ0KCk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuc2V0U3RhdGUoe3VuZG86IHVuZG8sIHJlZG86IFtdfSk7XG4gIH0sXG5cbiAgaGFzVW5kbzogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUudW5kby5sZW5ndGggPiAwO1xuICB9LFxuXG4gIGhhc1JlZG86IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnJlZG8ubGVuZ3RoID4gMDtcbiAgfSxcblxuICByZWRvOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl91bmRvSW1wbCh0cnVlKTtcbiAgfSxcblxuICB1bmRvOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl91bmRvSW1wbCgpO1xuICB9LFxuXG4gIF91bmRvSW1wbDogZnVuY3Rpb24oaXNSZWRvKSB7XG4gICAgdmFyIHVuZG8gPSB0aGlzLnN0YXRlLnVuZG8uc2xpY2UoMCk7XG4gICAgdmFyIHJlZG8gPSB0aGlzLnN0YXRlLnJlZG8uc2xpY2UoMCk7XG4gICAgdmFyIHNuYXBzaG90O1xuXG4gICAgaWYgKGlzUmVkbykge1xuICAgICAgaWYgKHJlZG8ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHNuYXBzaG90ID0gcmVkby5wb3AoKTtcbiAgICAgIHVuZG8ucHVzaCh0aGlzLmdldFN0YXRlU25hcHNob3QoKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh1bmRvLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBzbmFwc2hvdCA9IHVuZG8ucG9wKCk7XG4gICAgICByZWRvLnB1c2godGhpcy5nZXRTdGF0ZVNuYXBzaG90KCkpO1xuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGVTbmFwc2hvdChzbmFwc2hvdCk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7dW5kbzp1bmRvLCByZWRvOnJlZG99KTtcbiAgfVxufTtcbiIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgYm9vdHN0cmFwXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbnZhciBtb2RpZmllcnMgPSB7XG5cbiAgJ0ZpZWxkJzoge2NsYXNzZXM6IHsnZm9ybS1ncm91cCc6IHRydWV9fSxcbiAgJ0hlbHAnOiB7Y2xhc3NlczogeydoZWxwLWJsb2NrJzogdHJ1ZX19LFxuICAnU2FtcGxlJzoge2NsYXNzZXM6IHsnaGVscC1ibG9jayc6IHRydWV9fSxcbiAgJ0FycmF5Q29udHJvbCc6IHtjbGFzc2VzOiB7J2Zvcm0taW5saW5lJzogdHJ1ZX19LFxuICAnQXJyYXlJdGVtJzoge2NsYXNzZXM6IHsnd2VsbCc6IHRydWV9fSxcbiAgJ0ZpZWxkVGVtcGxhdGVDaG9pY2VzJzoge2NsYXNzZXM6IHsnZm9ybS1jb250cm9sJzogdHJ1ZX19LFxuICAnQWRkSXRlbSc6IHtjbGFzc2VzOiB7J2dseXBoaWNvbiBnbHlwaGljb24tcGx1cyc6IHRydWV9LCBsYWJlbDogJyd9LFxuICAnUmVtb3ZlSXRlbSc6IHtjbGFzc2VzOiB7J2dseXBoaWNvbiBnbHlwaGljb24tcmVtb3ZlJzogdHJ1ZX0sIGxhYmVsOiAnJ30sXG4gICdNb3ZlSXRlbUJhY2snOiB7Y2xhc3NlczogeydnbHlwaGljb24gZ2x5cGhpY29uLWFycm93LXVwJzogdHJ1ZX0sIGxhYmVsOiAnJ30sXG4gICdNb3ZlSXRlbUZvcndhcmQnOiB7Y2xhc3NlczogeydnbHlwaGljb24gZ2x5cGhpY29uLWFycm93LWRvd24nOiB0cnVlfSwgbGFiZWw6ICcnfSxcbiAgJ09iamVjdEl0ZW1LZXknOiB7Y2xhc3Nlczogeydmb3JtLWNvbnRyb2wnOiB0cnVlfX0sXG5cbiAgJ1VuaWNvZGUnOiB7Y2xhc3Nlczogeydmb3JtLWNvbnRyb2wnOiB0cnVlfX0sXG4gICdTdHJpbmcnOiB7Y2xhc3Nlczogeydmb3JtLWNvbnRyb2wnOiB0cnVlfX0sXG4gICdQcmV0dHlUZXh0Jzoge2NsYXNzZXM6IHsnZm9ybS1jb250cm9sJzogdHJ1ZX19LFxuICAnSnNvbic6IHtjbGFzc2VzOiB7J2Zvcm0tY29udHJvbCc6IHRydWV9fSxcbiAgJ1NlbGVjdFZhbHVlJzoge2NsYXNzZXM6IHsnZm9ybS1jb250cm9sJzogdHJ1ZX19XG4gIC8vJ0FycmF5Jzoge2NsYXNzZXM6IHsnd2VsbCc6IHRydWV9fVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgdmFyIGRlZmF1bHRDcmVhdGVFbGVtZW50ID0gY29uZmlnLmNyZWF0ZUVsZW1lbnQ7XG5cbiAgY29uZmlnLmNyZWF0ZUVsZW1lbnQgPSBmdW5jdGlvbiAobmFtZSwgcHJvcHMsIGNoaWxkcmVuKSB7XG5cbiAgICBuYW1lID0gY29uZmlnLmVsZW1lbnROYW1lKG5hbWUpO1xuXG4gICAgdmFyIG1vZGlmaWVyID0gbW9kaWZpZXJzW25hbWVdO1xuXG4gICAgaWYgKG1vZGlmaWVyKSB7XG4gICAgICBwcm9wcyA9IF8uZXh0ZW5kKHt9LCBwcm9wcyk7XG4gICAgICBwcm9wcy5jbGFzc2VzID0gXy5leHRlbmQoe30sIHByb3BzLmNsYXNzZXMsIG1vZGlmaWVyLmNsYXNzZXMpO1xuICAgICAgaWYgKCdsYWJlbCcgaW4gbW9kaWZpZXIpIHtcbiAgICAgICAgcHJvcHMubGFiZWwgPSBtb2RpZmllci5sYWJlbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGVmYXVsdENyZWF0ZUVsZW1lbnQuY2FsbCh0aGlzLCBuYW1lLCBwcm9wcywgY2hpbGRyZW4pO1xuICB9O1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiJ3VzZSBzdHJpY3QnO1xuXG4vLyBBbGxvd3MgeW91IHRvIHBhc3MgbWV0YSBwcm9wIGludG8gZm9ybWF0aWMsIGFuZCB0aGF0IGdldHMgcGFzc2VkIHRocm91Z2ggYXNcbi8vIGEgcHJvcGVydHkgdG8gZWFjaCBmaWVsZC5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgdmFyIGluaXRSb290RmllbGQgPSBjb25maWcuaW5pdFJvb3RGaWVsZDtcblxuICBjb25maWcuaW5pdFJvb3RGaWVsZCA9IGZ1bmN0aW9uIChmaWVsZCwgcHJvcHMpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcztcblxuICAgIGZpZWxkLm1ldGEgPSBwcm9wcy5tZXRhIHx8IHt9O1xuXG4gICAgaW5pdFJvb3RGaWVsZC5hcHBseShjb25maWcsIGFyZ3VtZW50cyk7XG4gIH07XG5cbiAgdmFyIGluaXRGaWVsZCA9IGNvbmZpZy5pbml0RmllbGQ7XG5cbiAgY29uZmlnLmluaXRGaWVsZCA9IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzO1xuXG4gICAgaWYgKGZpZWxkLnBhcmVudCAmJiBmaWVsZC5wYXJlbnQubWV0YSkge1xuICAgICAgZmllbGQubWV0YSA9IGZpZWxkLnBhcmVudC5tZXRhO1xuICAgIH1cblxuICAgIGluaXRGaWVsZC5hcHBseShjb25maWcsIGFyZ3VtZW50cyk7XG4gIH07XG5cbn07XG4iLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxuLy8gVGhpcyBwbHVnaW4gYWxsb3dzIGZpZWxkcyB0byBiZSBzdHJpbmdzIGFuZCByZWZlcmVuY2Ugb3RoZXIgZmllbGRzIGJ5IGtleSBvclxuLy8gaWQuIEl0IGFsc28gYWxsb3dzIGEgZmllbGQgdG8gZXh0ZW5kIGFub3RoZXIgZmllbGQgd2l0aFxuLy8gZXh0ZW5kczogWydmb28nLCAnYmFyJ10uXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNvbmZpZykge1xuXG4gIHZhciBpbml0RmllbGQgPSBjb25maWcuaW5pdEZpZWxkO1xuXG4gIGNvbmZpZy5maW5kRmllbGRUZW1wbGF0ZSA9IGZ1bmN0aW9uIChmaWVsZCwgbmFtZSkge1xuICAgIHZhciBjb25maWcgPSB0aGlzO1xuXG4gICAgaWYgKGZpZWxkLnRlbXBsYXRlc1tuYW1lXSkge1xuICAgICAgcmV0dXJuIGZpZWxkLnRlbXBsYXRlc1tuYW1lXTtcbiAgICB9XG5cbiAgICBpZiAoZmllbGQucGFyZW50KSB7XG4gICAgICByZXR1cm4gY29uZmlnLmZpbmRGaWVsZFRlbXBsYXRlKGZpZWxkLnBhcmVudCwgbmFtZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG5cbiAgY29uZmlnLnJlc29sdmVGaWVsZFRlbXBsYXRlID0gZnVuY3Rpb24gKGZpZWxkLCBmaWVsZFRlbXBsYXRlKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXM7XG5cbiAgICBpZiAoIWZpZWxkVGVtcGxhdGUuZXh0ZW5kcykge1xuICAgICAgcmV0dXJuIGZpZWxkVGVtcGxhdGU7XG4gICAgfVxuXG4gICAgdmFyIGV4dCA9IGZpZWxkVGVtcGxhdGUuZXh0ZW5kcztcblxuICAgIGlmICghXy5pc0FycmF5KGV4dCkpIHtcbiAgICAgIGV4dCA9IFtleHRdO1xuICAgIH1cblxuICAgIHZhciBiYXNlcyA9IGV4dC5tYXAoZnVuY3Rpb24gKGJhc2UpIHtcbiAgICAgIHZhciB0ZW1wbGF0ZSA9IGNvbmZpZy5maW5kRmllbGRUZW1wbGF0ZShmaWVsZCwgYmFzZSk7XG4gICAgICBpZiAoIXRlbXBsYXRlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVGVtcGxhdGUgJyArIGJhc2UgKyAnIG5vdCBmb3VuZC4nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgICB9KTtcblxuICAgIHZhciBjaGFpbiA9IFt7fV0uY29uY2F0KGJhc2VzLnJldmVyc2UoKS5jb25jYXQoW2ZpZWxkVGVtcGxhdGVdKSk7XG4gICAgZmllbGRUZW1wbGF0ZSA9IF8uZXh0ZW5kLmFwcGx5KF8sIGNoYWluKTtcblxuICAgIHJldHVybiBmaWVsZFRlbXBsYXRlO1xuICB9O1xuXG4gIGNvbmZpZy5pbml0RmllbGQgPSBmdW5jdGlvbiAoZmllbGQpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzO1xuXG4gICAgdmFyIHRlbXBsYXRlcyA9IGZpZWxkLnRlbXBsYXRlcyA9IHt9O1xuXG4gICAgdmFyIGNoaWxkRmllbGRUZW1wbGF0ZXMgPSBjb25maWcuZmllbGRDaGlsZEZpZWxkVGVtcGxhdGVzKGZpZWxkKTtcblxuICAgIGNoaWxkRmllbGRUZW1wbGF0ZXMuZm9yRWFjaChmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSkge1xuXG4gICAgICBpZiAoXy5pc1N0cmluZyhmaWVsZFRlbXBsYXRlKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBrZXkgPSBmaWVsZFRlbXBsYXRlLmtleTtcbiAgICAgIHZhciBpZCA9IGZpZWxkVGVtcGxhdGUuaWQ7XG5cbiAgICAgIGlmIChmaWVsZFRlbXBsYXRlLnRlbXBsYXRlKSB7XG4gICAgICAgIGZpZWxkVGVtcGxhdGUgPSBfLmV4dGVuZCh7fSwgZmllbGRUZW1wbGF0ZSwge3RlbXBsYXRlOiBmYWxzZX0pO1xuICAgICAgfVxuXG4gICAgICBpZiAoIV8uaXNVbmRlZmluZWQoa2V5KSAmJiBrZXkgIT09ICcnKSB7XG4gICAgICAgIHRlbXBsYXRlc1trZXldID0gZmllbGRUZW1wbGF0ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKGlkKSAmJiBpZCAhPT0gJycpIHtcbiAgICAgICAgdGVtcGxhdGVzW2lkXSA9IGZpZWxkVGVtcGxhdGU7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoY2hpbGRGaWVsZFRlbXBsYXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICBmaWVsZC5maWVsZHMgPSBjaGlsZEZpZWxkVGVtcGxhdGVzLm1hcChmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSkge1xuICAgICAgICBpZiAoXy5pc1N0cmluZyhmaWVsZFRlbXBsYXRlKSkge1xuICAgICAgICAgIGZpZWxkVGVtcGxhdGUgPSBjb25maWcuZmluZEZpZWxkVGVtcGxhdGUoZmllbGQsIGZpZWxkVGVtcGxhdGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNvbmZpZy5yZXNvbHZlRmllbGRUZW1wbGF0ZShmaWVsZCwgZmllbGRUZW1wbGF0ZSk7XG4gICAgICB9KTtcblxuICAgICAgZmllbGQuZmllbGRzID0gZmllbGQuZmllbGRzLmZpbHRlcihmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSkge1xuICAgICAgICByZXR1cm4gIWZpZWxkVGVtcGxhdGUudGVtcGxhdGU7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB2YXIgaXRlbUZpZWxkVGVtcGxhdGVzID0gY29uZmlnLmZpZWxkSXRlbUZpZWxkVGVtcGxhdGVzKGZpZWxkKTtcblxuICAgIGlmIChpdGVtRmllbGRUZW1wbGF0ZXMubGVuZ3RoID4gMCkge1xuICAgICAgZmllbGQuaXRlbUZpZWxkcyA9IGl0ZW1GaWVsZFRlbXBsYXRlcy5tYXAoZnVuY3Rpb24gKGl0ZW1GaWVsZFRlbXBsYXRlKSB7XG4gICAgICAgIGlmIChfLmlzU3RyaW5nKGl0ZW1GaWVsZFRlbXBsYXRlKSkge1xuICAgICAgICAgIGl0ZW1GaWVsZFRlbXBsYXRlID0gY29uZmlnLmZpbmRGaWVsZFRlbXBsYXRlKGZpZWxkLCBpdGVtRmllbGRUZW1wbGF0ZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY29uZmlnLnJlc29sdmVGaWVsZFRlbXBsYXRlKGZpZWxkLCBpdGVtRmllbGRUZW1wbGF0ZSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpbml0RmllbGQuY2FsbChjb25maWcsIGFyZ3VtZW50cyk7XG4gIH07XG5cbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbnZhciB1dGlscyA9IGV4cG9ydHM7XG5cbi8vIENvcHkgb2JqIHJlY3Vyc2luZyBkZWVwbHkuXG51dGlscy5kZWVwQ29weSA9IGZ1bmN0aW9uIChvYmopIHtcbiAgaWYgKF8uaXNBcnJheShvYmopKSB7XG4gICAgcmV0dXJuIG9iai5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHJldHVybiB1dGlscy5kZWVwQ29weShpdGVtKTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmIChfLmlzRnVuY3Rpb24ob2JqKSkge1xuICAgIHJldHVybiBvYmo7XG4gIH0gZWxzZSBpZiAoXy5pc051bGwob2JqKSkge1xuICAgIHJldHVybiBvYmo7XG4gIH0gZWxzZSBpZiAoXy5pc09iamVjdChvYmopKSB7XG4gICAgdmFyIGNvcHkgPSB7fTtcbiAgICBfLmVhY2gob2JqLCBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgY29weVtrZXldID0gdXRpbHMuZGVlcENvcHkodmFsdWUpO1xuICAgIH0pO1xuICAgIHJldHVybiBjb3B5O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBvYmo7XG4gIH1cbn07XG5cbnZhciBkYXNoVG9QYXNjYWxDYWNoZSA9IHt9O1xuXG4vLyBDb252ZXJ0IGZvby1iYXIgdG8gRm9vQmFyXG51dGlscy5kYXNoVG9QYXNjYWwgPSBmdW5jdGlvbiAocykge1xuICBpZiAoIWRhc2hUb1Bhc2NhbENhY2hlW3NdKSB7XG4gICAgZGFzaFRvUGFzY2FsQ2FjaGVbc10gPSBzLnNwbGl0KCctJykubWFwKGZ1bmN0aW9uIChwYXJ0KSB7XG4gICAgICByZXR1cm4gcGFydFswXS50b1VwcGVyQ2FzZSgpICsgcGFydC5zdWJzdHJpbmcoMSk7XG4gICAgfSkuam9pbignJyk7XG4gIH1cbiAgcmV0dXJuIGRhc2hUb1Bhc2NhbENhY2hlW3NdO1xufTtcblxuLy8gQ29weSBhbGwgY29tcHV0ZWQgc3R5bGVzIGZyb20gb25lIERPTSBlbGVtZW50IHRvIGFub3RoZXIuXG51dGlscy5jb3B5RWxlbWVudFN0eWxlID0gZnVuY3Rpb24gKGZyb21FbGVtZW50LCB0b0VsZW1lbnQpIHtcbiAgdmFyIGZyb21TdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGZyb21FbGVtZW50LCAnJyk7XG5cbiAgaWYgKGZyb21TdHlsZS5jc3NUZXh0ICE9PSAnJykge1xuICAgIHRvRWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gZnJvbVN0eWxlLmNzc1RleHQ7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGNzc1J1bGVzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZnJvbVN0eWxlLmxlbmd0aDsgaSsrKSB7XG4gICAgLy9jb25zb2xlLmxvZyhpLCBmcm9tU3R5bGVbaV0sIGZyb21TdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKGZyb21TdHlsZVtpXSkpXG4gICAgLy90b0VsZW1lbnQuc3R5bGVbZnJvbVN0eWxlW2ldXSA9IGZyb21TdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKGZyb21TdHlsZVtpXSk7XG4gICAgY3NzUnVsZXMucHVzaChmcm9tU3R5bGVbaV0gKyAnOicgKyBmcm9tU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShmcm9tU3R5bGVbaV0pICsgJzsnKTtcbiAgfVxuICB2YXIgY3NzVGV4dCA9IGNzc1J1bGVzLmpvaW4oJycpO1xuXG4gIHRvRWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gY3NzVGV4dDtcbn07XG5cbi8vIE9iamVjdCB0byBob2xkIGJyb3dzZXIgc25pZmZpbmcgaW5mby5cbnZhciBicm93c2VyID0ge1xuICBpc0Nocm9tZTogZmFsc2UsXG4gIGlzTW96aWxsYTogZmFsc2UsXG4gIGlzT3BlcmE6IGZhbHNlLFxuICBpc0llOiBmYWxzZSxcbiAgaXNTYWZhcmk6IGZhbHNlXG59O1xuXG4vLyBTbmlmZiB0aGUgYnJvd3Nlci5cbnZhciB1YSA9IG5hdmlnYXRvci51c2VyQWdlbnQ7XG5pZih1YS5pbmRleE9mKCdDaHJvbWUnKSA+IC0xKSB7XG4gIGJyb3dzZXIuaXNDaHJvbWUgPSB0cnVlO1xufSBlbHNlIGlmICh1YS5pbmRleE9mKCdTYWZhcmknKSA+IC0xKSB7XG4gIGJyb3dzZXIuaXNTYWZhcmkgPSB0cnVlO1xufSBlbHNlIGlmICh1YS5pbmRleE9mKCdPcGVyYScpID4gLTEpIHtcbiAgYnJvd3Nlci5pc09wZXJhID0gdHJ1ZTtcbn0gZWxzZSBpZiAodWEuaW5kZXhPZignRmlyZWZveCcpID4gLTEpIHtcbiAgYnJvd3Nlci5pc01vemlsbGEgPSB0cnVlO1xufSBlbHNlIGlmICh1YS5pbmRleE9mKCdNU0lFJykgPiAtMSkge1xuICBicm93c2VyLmlzSWUgPSB0cnVlO1xufVxuXG51dGlscy5icm93c2VyID0gYnJvd3NlcjtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9mb3JtYXRpYycpO1xuIl19
