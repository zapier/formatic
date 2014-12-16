!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Formatic=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

    var choices = config.fieldChoices(field);

    if (choices.length === 0) {
      choices = [{
        label: 'Yes',
        value: true
      }, {
        label: 'No',
        value: false
      }];
    }

    return config.createElement('field', {
      config: config, field: field, plain: this.props.plain
    }, config.createElement('select-value', {
      choices: choices, value: this.props.value, onChange: this.onChange, onAction: this.onBubbleAction
    }));
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/field":35}],2:[function(require,module,exports){
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

    var value = this.props.value || [];

    return config.createElement('field', {
      field: field
    },
      R.div({className: cx(this.props.classes), ref: 'choices'},
        choices.map(function (choice, i) {

          var inputField = R.span({style: {whiteSpace: 'nowrap'}},
            R.input({
              name: config.fieldKey(field),
              type: 'checkbox',
              value: choice.value,
              checked: value.indexOf(choice.value) >= 0 ? true : false,
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
},{"../../mixins/field":35}],3:[function(require,module,exports){
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

    var config = this.props.config;
    var field = this.props.field;

    return R.div({className: cx(this.props.classes)},
      config.fieldHelpText(field)
    );
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/field":35}],4:[function(require,module,exports){
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
      var newObjectValue = _.extend({}, this.props.value);
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
    var obj = this.props.value;

    return config.createElement('field', {
      config: config, field: field, plain: this.props.plain
    },
      R.fieldset({className: cx(this.props.classes)},
        field.fields.map(function (field, i) {
          var value;
          var key = config.fieldKey(field);
          if (key) {
            value = obj[key];
            if (_.isUndefined(value)) {
              value = config.fieldDefaultValue(field);
            }
          }
          return config.createField({config: config, key: key || i, field: field, value: value, onChange: this.onChangeField.bind(this, key), onAction: this.onBubbleAction});
        }.bind(this))
      )
    );
  }

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/field":35}],5:[function(require,module,exports){
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
      value: JSON.stringify(this.props.value, null, 2)
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
      field: field, plain: this.props.plain
    }, R.textarea({
        className: cx(this.props.classes),
        value: this.state.value,
        onChange: this.onChange,
        style: {backgroundColor: this.state.isValid ? '' : 'rgb(255,200,200)'},
        rows: field.rows || this.props.rows,
        onFocus: this.onFocusAction,
        onBlur: this.onBlurAction
      })
    );
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/field":35}],6:[function(require,module,exports){
(function (global){
// # component.list

/*
Render a list.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var cx = React.addons.classSet;

var CSSTransitionGroup = React.createFactory(React.addons.CSSTransitionGroup);

module.exports = React.createClass({

  displayName: 'List',

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

    var items = this.props.value;

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

    var items = newProps.value;

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
    var newArrayValue = this.props.value.slice(0);
    newArrayValue[i] = newValue;
    this.onBubbleValue(newArrayValue, info);
  },

  onAppend: function (itemChoiceIndex) {
    var config = this.props.config;
    var newValue = config.fieldItemValue(this.props.field, itemChoiceIndex);
    var items = this.props.value;

    items = items.concat(newValue);

    this.onChangeValue(items);
  },
  //
  // onClickLabel: function (i) {
  //   if (this.props.field.collapsableItems) {
  //     var collapsed;
  //     // if (!this.state.collapsed[i]) {
  //     //   collapsed = this.state.collapsed;
  //     //   collapsed[i] = true;
  //     //   this.setState({collapsed: collapsed});
  //     // } else {
  //     //   collapsed = this.props.field.fields.map(function () {
  //     //     return true;
  //     //   });
  //     //   collapsed[i] = false;
  //     //   this.setState({collapsed: collapsed});
  //     // }
  //     collapsed = this.state.collapsed;
  //     collapsed[i] = !collapsed[i];
  //     this.setState({collapsed: collapsed});
  //   }
  // },
  //
  onRemove: function (i) {
    var lookups = this.state.lookups;
    lookups.splice(i, 1);
    this.setState({
      lookups: lookups
    });
    var newItems = this.props.value.slice(0);
    newItems.splice(i, 1);
    this.onChangeValue(newItems);
  },
  //
  onMove: function (fromIndex, toIndex) {
    var lookups = this.state.lookups;
    var fromId = lookups[fromIndex];
    var toId = lookups[toIndex];
    lookups[fromIndex] = toId;
    lookups[toIndex] = fromId;
    this.setState({
      lookups: lookups
    });

    var newItems = this.props.value.slice(0);
    if (fromIndex !== toIndex &&
      fromIndex >= 0 && fromIndex < newItems.length &&
      toIndex >= 0 && toIndex < newItems.length
    ) {
      newItems.splice(toIndex, 0, newItems.splice(fromIndex, 1)[0]);
    }
    this.onChangeValue(newItems);
  },

  getFields: function () {
    var config = this.props.config;
    var items = this.props.value;
    var field = this.props.field;

    return items.map(function (item, i) {
      var childField = config.fieldItemForValue(field, item);
      childField = _.extend({}, childField);
      childField.key = i;
      return childField;
    });
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    var config = this.props.config;
    var field = this.props.field;
    var fields = this.getFields();
    var items = this.props.value;

    var numItems = fields.length;
    return config.createElement('field', {
      field: field, plain: this.props.plain
    },
      R.div({className: cx(this.props.classes)},
        CSSTransitionGroup({transitionName: 'reveal'},
          fields.map(function (childField, i) {
            return config.createElement('list-item', {
              key: this.state.lookups[i],
              field: childField,
              value: items[i],
              index: i,
              numItems: numItems,
              onMove: this.onMove,
              onRemove: this.onRemove,
              onChange: this.onChange,
              onAction: this.onBubbleAction
            });
          }.bind(this))
        ),
        config.createElement('list-control', {field: field, onAppend: this.onAppend})
      )
    );
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/field":35}],7:[function(require,module,exports){
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

module.exports = React.createClass({

  displayName: 'Object',

  mixins: [require('../../mixins/field')],

  nextLookupId: 0,

  getInitialState: function () {

    var keyToId = {};
    var keys = Object.keys(this.props.value);
    var keyOrder = [];

    // Keys don't make good react keys, since we're allowing them to be
    // changed here, so we'll have to create fake keys and
    // keep track of the mapping of real keys to fake keys. Yuck.
    keys.forEach(function (key) {
      this.nextLookupId++;
      keyToId[key] = this.nextLookupId;
      keyOrder.push(key);
    }.bind(this));

    return {
      keyToId: keyToId,
      keyOrder: keyOrder,
      tempKeys: {}
    };
  },

  componentWillReceiveProps: function (newProps) {

    var keyToId = this.state.keyToId;
    var newKeyToId = {};
    var tempKeys = this.state.tempKeys;
    var newTempKeys = {};
    var keyOrder = this.state.keyOrder;
    var keys = Object.keys(newProps.value);
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
      if (isTempKey(key) && newKeyToId[key] in tempKeys) {
        newTempKeys[newKeyToId[key]] = tempKeys[newKeyToId[key]];
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
      tempKeys: newTempKeys
    });
  },

  onChange: function (key, newValue, info) {
    var newObj = _.extend({}, this.props.value);
    newObj[key] = newValue;
    this.onBubbleValue(newObj, info);
  },

  onAppend: function (itemChoiceIndex) {
    var config = this.props.config;
    this.nextLookupId++;

    var keyToId = this.state.keyToId;
    var keyOrder = this.state.keyOrder;
    var tempKeys = this.state.tempKeys;

    var id = this.nextLookupId;
    var newKey = tempKey(id);

    keyToId[newKey] = id;
    tempKeys[id] = '';
    keyOrder.push(newKey);

    this.setState({
      keyToId: keyToId,
      tempKeys: tempKeys,
      keyOrder: keyOrder
    });

    var newObj = _.extend(this.props.value);
    newObj[newKey] = config.fieldItemValue(this.props.field, itemChoiceIndex);

    this.onChangeValue(newObj);
  },

  onRemove: function (key) {
    var newObj = _.extend(this.props.value);
    delete newObj[key];
    this.onChangeValue(newObj);
  },

  onMove: function (fromKey, toKey) {
    if (fromKey !== toKey) {
      var keyToId = this.state.keyToId;
      var keyOrder = this.state.keyOrder;
      var tempKeys = this.state.tempKeys;

      var newObj = _.extend(this.props.value);

      if (keyToId[toKey]) {
        var tempToKey = tempKey(keyToId[toKey]);
        tempKeys[keyToId[toKey]] = toKey;
        keyToId[tempToKey] = keyToId[toKey];
        keyOrder[keyOrder.indexOf(toKey)] = tempToKey;
        delete keyToId[toKey];
        this.setState({
          keyToId: keyToId,
          tempKeys: tempKeys,
          keyOrder: keyOrder
        });

        newObj[tempToKey] = newObj[toKey];
        delete newObj[toKey];
      }

      if (!toKey) {
        toKey = tempKey(keyToId[fromKey]);
        tempKeys[keyToId[fromKey]] = '';
      }
      keyToId[toKey] = keyToId[fromKey];
      keyOrder[keyOrder.indexOf(fromKey)] = toKey;

      this.setState({
        keyToId: keyToId,
        keyOrder: keyOrder
      });

      newObj[toKey] = newObj[fromKey];
      delete newObj[fromKey];

      this.onChangeValue(newObj);
    }
  },

  getFields: function () {
    var config = this.props.config;
    var obj = this.props.value;
    var field = this.props.field;

    return this.state.keyOrder.map(function (key) {
      var childField = config.fieldItemForValue(field, obj[key]);
      childField = _.extend({}, childField);
      childField.key = key;
      return childField;
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
          fields.map(function (child) {
            return config.createElement('object-item', {
              key: this.state.keyToId[child.key],
              field: child,
              onMove: this.onMove,
              onRemove: this.onRemove,
              onChange: this.onChange,
              onAction: this.onBubbleAction,
              tempKey: this.state.tempKeys[this.state.keyToId[child.key]]
            });
          }.bind(this))
        ),
        config.createElement('object-control', {field: field, onAppend: this.onAppend})
      )
    );
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/field":35}],8:[function(require,module,exports){
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

  displayName: 'PrettyTextarea',

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

    var parts = parseTextWithTags(this.props.value);
    var tokens = this.tokens(parts);
    var indexMap = this.indexMap(tokens);

    this.tracking.pos = indexMap.length;
    this.tracking.range = 0;
    this.tracking.tokens = tokens;
    this.tracking.indexMap = indexMap;
  },

  getStateSnapshot: function () {
    return {
      value: this.props.value,
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
    var value = this.props.value || '';
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

        this.setState({isChoicesOpen: true});

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
    var isNowChoicesOpen = !this.state.isChoicesOpen;
    this.setState({
      isChoicesOpen: isNowChoicesOpen
    });
    if (isNowChoicesOpen) {
      this.onStartAction('open-replacements');
    } else {
      this.onStartAction('close-replacements');
    }
  },

  onCloseChoices: function () {
    this.setState({
      isChoicesOpen: false
    });
    this.onStartAction('close-replacements');
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
        this.prettyValue(this.props.value)
      ),

      R.textarea({
        className: cx(_.extend({}, this.props.classes, {'pretty-content': true})),
        ref: 'content',
        rows: field.rows || this.props.rows,
        name: config.fieldKey(field),
        value: this.plainValue(this.props.value),
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
},{"../../mixins/field":35,"../../mixins/resize":37,"../../mixins/undo-stack":38,"../../utils":40}],9:[function(require,module,exports){
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
      choices: this.state.choices, value: this.props.value, onChange: this.onChangeValue, onAction: this.onBubbleAction
    }));
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/field":35}],10:[function(require,module,exports){
(function (global){
// # component.string

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'Text',

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
      value: this.props.value,
      className: cx(this.props.classes),
      rows: field.rows || this.props.rows,
      onChange: this.onChange,
      onFocus: this.onFocusAction,
      onBlur: this.onBlurAction
    }));

    // var field = this.props.field;
    //
    // return plugin.component('field')({
    //   field: field, plain: this.props.plain
    // }, R.textarea({
    //   className: this.props.className,
    //   value: field.value,
    //   rows: field.def.rows || this.props.rows,
    //   onChange: this.onChange,
    //   onFocus: this.onFocus,
    //   onBlur: this.onBlur
    // }));
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/field":35}],11:[function(require,module,exports){
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
      value: this.props.value,
      className: cx(this.props.classes),
      onChange: this.onChange,
      onFocus: this.onFocusAction,
      onBlur: this.onBlurAction
    }));

    // var field = this.props.field;
    //
    // return plugin.component('field')({
    //   field: field, plain: this.props.plain
    // }, R.textarea({
    //   className: this.props.className,
    //   value: field.value,
    //   rows: field.def.rows || this.props.rows,
    //   onChange: this.onChange,
    //   onFocus: this.onFocus,
    //   onBlur: this.onBlur
    // }));
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/field":35}],12:[function(require,module,exports){
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
      R.pre({}, JSON.stringify(this.props.field))
    );
  }

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/field":35}],13:[function(require,module,exports){
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
},{"../../mixins/helper":36}],14:[function(require,module,exports){
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
},{"../../mixins/click-outside":34,"../../mixins/helper":36}],15:[function(require,module,exports){
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
      collapsed: this.props.field.collapsed ? true : false
    };
  },

  isCollapsible: function () {
    var field = this.props.field;

    return !_.isUndefined(field.collapsed) || !_.isUndefined(field.collapsible);
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
      var key = config.fieldKey(field);
      index = _.isNumber(key) ? key : undefined;
    }

    return R.div({className: cx(this.props.classes), style: {display: (field.hidden ? 'none' : '')}},
      config.createElement('label', {config: config, field: field, index: index, onClick: this.isCollapsible() ? this.onClickLabel : null}),
      CSSTransitionGroup({transitionName: 'reveal'},
        this.state.collapsed ? [] : [
          config.createElement('help', {config: config, key: 'help', field: field}),
          this.props.children
        ]
      )
    );
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/helper":36}],16:[function(require,module,exports){
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

    var config = this.props.config;
    var field = this.props.field;
    var helpText = config.fieldHelpText(field);

    return helpText ?
      R.div({className: cx(this.props.classes), dangerouslySetInnerHTML: {__html: helpText}}) :
      R.span(null);
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/helper":36}],17:[function(require,module,exports){
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

  displayName: 'ItemChoices',

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
    var items = config.fieldItems(field);

    var typeChoices = null;
    if (items.length > 1) {
      typeChoices = R.select({className: cx(this.props.classes), value: this.value, onChange: this.onChange},
        items.map(function (item, i) {
          return R.option({key: i, value: i}, item.label || i);
        })
      );
    }

    return typeChoices ? typeChoices : R.span(null);
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/helper":36}],18:[function(require,module,exports){
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

    var required = R.span({className: 'required-text'});

    return R.div({
      className: cx(this.props.classes)
    },
      label,
      ' ',
      required
    );
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/helper":36}],19:[function(require,module,exports){
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

  displayName: 'ListControl',

  mixins: [require('../../mixins/helper')],

  getInitialState: function () {
    return {
      itemIndex: 0
    };
  },

  onSelect: function (index) {
    this.setState({
      itemIndex: index
    });
  },

  onAppend: function () {
    this.props.onAppend(this.state.itemIndex);
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {

    var config = this.props.config;
    var field = this.props.field;
    var items = config.fieldItems(field);

    var typeChoices = null;

    if (items.length > 0) {
      typeChoices = config.createElement('item-choices', {field: field, value: this.state.itemIndex, onSelect: this.onSelect});
    }

    return R.div({className: cx(this.props.classes)},
      typeChoices, ' ',
      config.createElement('add-item', {onClick: this.onAppend})
    );
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/helper":36}],20:[function(require,module,exports){
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

  displayName: 'ListItemControl',

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
      config.createElement('remove-item', {field: field, onClick: this.onRemove}),
      this.props.index > 0 ? config.createElement('move-item-back', {onClick: this.onMoveBack}) : null,
      this.props.index < (this.props.numItems - 1) ? config.createElement('move-item-forward', {onClick: this.onMoveForward}) : null
    );
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/helper":36}],21:[function(require,module,exports){
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

  displayName: 'ListItemValue',

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
    var value = this.props.value;

    return R.div({className: cx(this.props.classes)},

      config.createField({field: field, value: value, onChange: this.onChangeField, onAction: this.onBubbleAction})
    );
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/helper":36}],22:[function(require,module,exports){
(function (global){
// # component.list-item

/*
Render a list item.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: 'ListItem',

  mixins: [require('../../mixins/helper')],

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    var config = this.props.config;
    var field = this.props.field;

    return R.div({className: cx(this.props.className)},
      config.createElement('list-item-value', {field: field, value: this.props.value, index: this.props.index,
        onChange: this.props.onChange, onAction: this.onBubbleAction}),
      config.createElement('list-item-control', {field: field, index: this.props.index, numItems: this.props.numItems,
        onMove: this.props.onMove, onRemove: this.props.onRemove})
    );
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/helper":36}],23:[function(require,module,exports){
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
},{"../../mixins/helper":36}],24:[function(require,module,exports){
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
},{"../../mixins/helper":36}],25:[function(require,module,exports){
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
      itemIndex: 0
    };
  },

  onSelect: function (index) {
    this.setState({
      itemIndex: index
    });
  },

  onAppend: function () {
    this.props.onAppend(this.state.itemIndex);
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    var config = this.props.config;
    var field = this.props.field;
    var items = config.fieldItems(field);

    var typeChoices = null;

    if (items.length > 0) {
      typeChoices = config.createElement('item-choices', {field: field, value: this.state.itemIndex, onSelect: this.onSelect});
    }

    return R.div({className: cx(this.props.classes)},
      typeChoices, ' ',
      config.createElement('add-item', {onClick: this.onAppend})
    );
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/helper":36}],26:[function(require,module,exports){
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
},{"../../mixins/helper":36}],27:[function(require,module,exports){
(function (global){
// # component.object-item-key

/*
Render an object item key editor.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
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
    var config = this.props.config;

    var field = this.props.field;

    var key = config.fieldKey(field);

    if (!_.isUndefined(this.props.tempKey)) {
      key = this.props.tempKey;
    }

    return R.input({className: cx(this.props.className), type: 'text', value: key, onChange: this.onChange});
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/helper":36}],28:[function(require,module,exports){
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
    var config = this.props.config;
    this.props.onChange(config.fieldKey(this.props.field), newValue, info);
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    var config = this.props.config;
    var field = this.props.field;

    return R.div({className: cx(this.props.className)},
      config.createField({field: field, onChange: this.onChangeField, plain: true})
    );
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/helper":36}],29:[function(require,module,exports){
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
    var config = this.props.config;
    this.props.onMove(config.fieldKey(this.props.field), newKey);
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    var config = this.props.config;
    var field = this.props.field;

    return R.div({className: cx(this.props.className)},
      config.createElement('object-item-key', {field: field, onChange: this.onChangeKey, tempKey: this.props.tempKey}),
      config.createElement('object-item-value', {field: field, onChange: this.props.onChange}),
      config.createElement('object-item-control', {field: field, onRemove: this.props.onRemove})
    );
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/helper":36}],30:[function(require,module,exports){
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

  renderDefault: function () {
    return R.span({className: cx(this.props.classes), onClick: this.props.onClick}, this.props.label);
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../mixins/helper":36}],31:[function(require,module,exports){
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

      var value = this.props.value !== undefined ? this.props.value : '';

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
},{"../../mixins/helper":36}],32:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

var utils = require('./utils');

var createString = function () {
  return '';
};

var createObject = function () {
  return {};
};

var createArray = function () {
  return [];
};

var createBoolean = function () {
  return false;
};

module.exports = {

  // Field element factories
  createElement_Fields: React.createFactory(require('./components/fields/fields')),
  createElement_Text: React.createFactory(require('./components/fields/text')),
  createElement_Unicode: React.createFactory(require('./components/fields/unicode')),
  createElement_Select: React.createFactory(require('./components/fields/select')),
  createElement_Boolean: React.createFactory(require('./components/fields/boolean')),
  createElement_PrettyTextarea: React.createFactory(require('./components/fields/pretty-textarea')),
  createElement_List: React.createFactory(require('./components/fields/list')),
  createElement_CheckboxList: React.createFactory(require('./components/fields/checkbox-list')),
  createElement_Object: React.createFactory(require('./components/fields/object')),
  createElement_Json: React.createFactory(require('./components/fields/json')),
  createElement_UnknownField: React.createFactory(require('./components/fields/unknown')),
  createElement_Copy: React.createFactory(require('./components/fields/copy')),

  // Other element factories
  createElement_Field: React.createFactory(require('./components/helpers/field')),
  createElement_Label: React.createFactory(require('./components/helpers/label')),
  createElement_Help: React.createFactory(require('./components/helpers/help')),
  createElement_Choices: React.createFactory(require('./components/helpers/choices')),
  createElement_ListControl: React.createFactory(require('./components/helpers/list-control')),
  createElement_ListItemControl: React.createFactory(require('./components/helpers/list-item-control')),
  createElement_ListItemValue: React.createFactory(require('./components/helpers/list-item-value')),
  createElement_ListItem: React.createFactory(require('./components/helpers/list-item')),
  createElement_ItemChoices: React.createFactory(require('./components/helpers/item-choices')),
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

  // Field default values
  defaultValue_Fields: createObject,
  defaultValue_Text: createString,
  defaultValue_Unicode: createString,
  defaultValue_Select: createString,
  defaultValue_List: createArray,
  defaultValue_Object: createObject,
  defaultValue_Json: createObject,
  defaultValue_Boolean: createBoolean,
  defaultValue_CheckboxList: createArray,

  hasElementFactory: function (name) {
    var config = this;

    return config['createElement_' + name] ? true : false;
  },

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

  createField: function (props) {
    var config = this;

    var name = config.fieldTypeName(props.field);

    if (config.hasElementFactory(name)) {
      return config.createElement(name, props);
    }

    return config.createElement('UnknownField', props);
  },

  renderComponent: function (component) {
    var config = this;

    var name = component.constructor.displayName;

    if (config['renderComponent_' + name]) {
      return config['renderComponent_' + name](component);
    }

    return component.renderDefault();
  },

  renderFieldComponent: function (component) {
    var config = this;

    return config.renderComponent(component);
  },

  elementName: function (name) {
    return utils.dashToPascal(name);
  },

  alias_Dict: 'Object',
  alias_Bool: 'Boolean',

  // Field helpers
  fieldTypeName: function (field) {
    var config = this;

    var fieldType = utils.dashToPascal(field.type);

    var alias = config['alias_' + fieldType];

    if (alias) {
      if (_.isFunction(alias)) {
        return alias(field);
      } else {
        return alias;
      }
    }

    if (field.list) {
      fieldType = 'List';
    }

    return fieldType;
  },
  fieldKey: function (field) {
    return field.key;
  },
  fieldDefaultValue: function (field) {
    var config = this;

    if (!_.isUndefined(field.default)) {
      return utils.deepCopy(field.default);
    }

    var typeName = config.fieldTypeName(field);

    if (config['defaultValue_' + typeName]) {
      return config['defaultValue_' + typeName](field);
    }

    return '';
  },
  fieldChoices: function (field) {
    var config = this;

    return config.normalizeChoices(field.choices);
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
  fieldItems: function (field) {
    if (!field.items) {
      return [];
    }
    if (!_.isArray(field.items)) {
      return [field.items];
    }
    return field.items;
  },

  fieldItemForValue: function (field, value) {
    var config = this;

    var item;

    if (field.items) {
      if (!_.isArray(field.items)) {
        item = field.items;
      } else if (field.items.length === 0) {
        item = field.items[0];
      } else {
        item = _.find(field.items, function (item) {
          return config.itemMatchesValue(item, value);
        });
      }
    }

    if (item) {
      return item;
    } else {
      return config.fieldForValue(value);
    }
  },
  fieldItemValue: function (field, itemIndex) {
    var config = this;

    var item = config.fieldItems(field)[itemIndex];

    if (item) {

      if (_.isUndefined(item.default) && !_.isUndefined(item.match)) {
        return utils.deepCopy(item.match);
      } else {
        return config.fieldDefaultValue(item);
      }

    } else {
      // Fallback to a text value.
      return '';
    }
  },

  itemMatchesValue: function (item, value) {
    var match = item.match;
    if (!match) {
      return true;
    }
    return _.every(_.keys(match), function (key) {
      return _.isEqual(match[key], value[key]);
    });
  },

  fieldForValue: function (value) {
    var config = this;

    var def = {
      type: 'json'
    };
    if (_.isString(value)) {
      def = {
        type: 'text'
      };
    } else if (_.isNumber(value)) {
      def = {
        type: 'number'
      };
    } else if (_.isBoolean(value)) {
      def = {
        type: 'boolean'
      };
    } else if (_.isArray(value)) {
      var arrayItemFields = value.map(function (value, i) {
        var childDef = config.fieldForValue(value);
        childDef.key = i;
        return childDef;
      });
      def = {
        type: 'list',
        fields: arrayItemFields
      };
    } else if (_.isObject(value)) {
      var objectItemFields = Object.keys(value).map(function (key) {
        var childDef = config.fieldForValue(value[key]);
        childDef.key = key;
        childDef.label = config.humanize(key);
        return childDef;
      });
      def = {
        type: 'object',
        fields: objectItemFields
      };
    } else if (_.isNull(value)) {
      def = {
        type: 'json'
      };
    }
    return def;
  },

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
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./components/fields/boolean":1,"./components/fields/checkbox-list":2,"./components/fields/copy":3,"./components/fields/fields":4,"./components/fields/json":5,"./components/fields/list":6,"./components/fields/object":7,"./components/fields/pretty-textarea":8,"./components/fields/select":9,"./components/fields/text":10,"./components/fields/unicode":11,"./components/fields/unknown":12,"./components/helpers/add-item":13,"./components/helpers/choices":14,"./components/helpers/field":15,"./components/helpers/help":16,"./components/helpers/item-choices":17,"./components/helpers/label":18,"./components/helpers/list-control":19,"./components/helpers/list-item":22,"./components/helpers/list-item-control":20,"./components/helpers/list-item-value":21,"./components/helpers/move-item-back":23,"./components/helpers/move-item-forward":24,"./components/helpers/object-control":25,"./components/helpers/object-item":29,"./components/helpers/object-item-control":26,"./components/helpers/object-item-key":27,"./components/helpers/object-item-value":28,"./components/helpers/remove-item":30,"./components/helpers/select-value":31,"./utils":40}],33:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

var utils = require('./utils');

var defaultConfig = require('./default-config');

var valuePath = function (fields) {
  return fields.map(function (field) {
    return field.key;
  }).filter(function (key) {
    return !_.isUndefined(key);
  });
};

var FormaticControlledClass = React.createClass({

  displayName: 'FormaticControlled',

  onChange: function (newValue, info) {
    if (!this.props.onChange) {
      return;
    }
    var isWrapped = !this.props.field;
    info = _.extend({}, info);
    if (isWrapped) {
      info.fields = info.fields.slice(1);
      info.field = info.fields[0];
    }
    info.path = valuePath(info.fields);
    this.props.onChange(newValue, info);
  },

  onAction: function (info) {
    if (!this.props.onAction) {
      return;
    }
    var isWrapped = !this.props.field;
    info = _.extend({}, info);
    if (isWrapped) {
      info.fields = info.fields.slice(1);
      info.field = info.fields[0];
    }
    info.path = valuePath(info.fields);
    this.props.onAction(info);
  },

  render: function () {
    var config = this.props.config;
    var field = this.props.field;
    var value = this.props.value;

    if (!field) {
      var fields = this.props.fields;
      if (!fields) {
        throw new Error('Must specify field or fields.');
      }
      field = {
        type: 'fields',
        plain: true,
        fields: fields
      };
    }

    if (_.isUndefined(value)) {
      throw new Error('You must supply a value to the root Formatic component.');
    }

    return R.div({className: 'formatic'},
      config.createField({config: config, field: field, value: value, onChange: this.onChange, onAction: this.onAction})
    );
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
    plugins: {
      bootstrap: require('./plugins/bootstrap')
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

    return FormaticControlled({
      config: config,
      field: this.props.field,
      fields: this.props.fields,
      value: value,
      onChange: this.onChange,
      onAction: this.onAction
    });
  }

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./default-config":32,"./plugins/bootstrap":39,"./utils":40}],34:[function(require,module,exports){
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
},{}],35:[function(require,module,exports){
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
      field: this.props.field,
      fields: [this.props.field]
    });
  },

  onBubbleValue: function (value, info) {
    info = _.extend({}, info);
    info.fields = [this.props.field].concat(info.fields);
    this.props.onChange(value, info);
  },

  onStartAction: function (action, props) {
    if (this.props.onAction) {
      var info = _.extend({}, props);
      info.action = action;
      info.field = this.props.field;
      info.fields = [this.props.field];
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
      info = _.extend({}, info);
      if (!info.field) {
        info.field = this.props.field;
        info.fields = [];
      }
      info.fields = [this.props.field].concat(info.fields);
      this.props.onAction(info);
    }
  },

  renderWithConfig: function () {
    return this.props.config.renderFieldComponent(this);
  }
};

// module.exports = function (plugin) {
//
//   var normalizeMeta = function (meta) {
//     var needsSource = [];
//
//     meta.forEach(function (args) {
//
//
//       if (_.isArray(args) && args.length > 0) {
//         if (_.isArray(args[0])) {
//           args.forEach(function (args) {
//             needsSource.push(args);
//           });
//         } else {
//           needsSource.push(args);
//         }
//       }
//     });
//
//     if (needsSource.length === 0) {
//       // Must just be a single need, and not an array.
//       needsSource = [meta];
//     }
//
//     return needsSource;
//   };
//
//   plugin.exports = {
//
//     loadNeededMeta: function (props) {
//       if (props.field && props.field.form) {
//         if (props.field.def.needsSource && props.field.def.needsSource.length > 0) {
//
//           var needsSource = normalizeMeta(props.field.def.needsSource);
//
//           needsSource.forEach(function (needs) {
//             if (needs) {
//               props.field.form.loadMeta.apply(props.field.form, needs);
//             }
//           });
//         }
//       }
//     },
//
//     // currently unused; will use to unload metadata on change
//     unloadOtherMeta: function () {
//       var props = this.props;
//       if (props.field.def.refreshMeta) {
//         var refreshMeta = normalizeMeta(props.field.def.refreshMeta);
//         props.field.form.unloadOtherMeta(refreshMeta);
//       }
//     },
//
//     componentDidMount: function () {
//       this.loadNeededMeta(this.props);
//     },
//
//     componentWillReceiveProps: function (nextProps) {
//       this.loadNeededMeta(nextProps);
//     },
//
//     componentWillUnmount: function () {
//       // Removing this as it's a bad idea, because unmounting a component is not
//       // always a signal to remove the field. Will have to find a better way.
//
//       // if (this.props.field) {
//       //   this.props.field.erase();
//       // }
//     },
//
//     onFocus: function () {
//       if (this.props.onFocus) {
//         this.props.onFocus({path: this.props.field.valuePath(), field: this.props.field.def});
//       }
//     },
//
//     onBlur: function () {
//       if (this.props.onBlur) {
//         this.props.onBlur({path: this.props.field.valuePath(), field: this.props.field.def});
//       }
//     }
//   };
// };

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],36:[function(require,module,exports){
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
},{}],37:[function(require,module,exports){
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

},{}],38:[function(require,module,exports){
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

},{}],39:[function(require,module,exports){
(function (global){
// # bootstrap

'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

var modifiers = {

  'Field': {classes: {'form-group': true}},
  'Help': {classes: {'help-block': true}},
  'Sample': {classes: {'help-block': true}},
  'ListControl': {classes: {'form-inline': true}},
  'ListItem': {classes: {'well': true}},
  'ItemChoices': {classes: {'form-control': true}},
  'AddItem': {classes: {'glyphicon glyphicon-plus': true}, label: ''},
  'RemoveItem': {classes: {'glyphicon glyphicon-remove': true}, label: ''},
  'MoveItemBack': {classes: {'glyphicon glyphicon-arrow-up': true}, label: ''},
  'MoveItemForward': {classes: {'glyphicon glyphicon-arrow-down': true}, label: ''},
  'ObjectItemKey': {classes: {'form-control': true}},

  'Unicode': {classes: {'form-control': true}},
  'Text': {classes: {'form-control': true}},
  'PrettyTextarea': {classes: {'form-control': true}},
  'Json': {classes: {'form-control': true}},
  'Select': {classes: {'form-control': true}}
  //'list': {classes: 'well'}
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
},{}],40:[function(require,module,exports){
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

},{"./lib/formatic":33}]},{},[])("formatic")
});