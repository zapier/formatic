!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.formatic=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
// # compiler.choices

/*
Normalizes the choices for a field. Supports the following formats.

```js
'red, blue'

['red', 'blue']

{red: 'Red', blue: 'Blue'}

[{value: 'red', label: 'Red'}, {value: 'blue', label: 'Blue'}]
```

All of those formats are normalized to:

```js
[{value: 'red', label: 'Red'}, {value: 'blue', label: 'Blue'}]
```
*/

'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = function (plugin) {

  var util = plugin.require('util');

  var compileChoices = function (choices) {

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
          label: util.humanize(choice)
        };
      }
      if (!choices[i].label) {
        choices[i].label = util.humanize(choices[i].value);
      }
    });

    return choices;
  };

  plugin.exports.compile = function (def) {
    if (def.choices === '') {
      def.choices = [];
    } else if (def.choices) {

      def.choices = compileChoices(def.choices);
    }

    if (def.replaceChoices === '') {
      def.replaceChoices = [];
    } else if (def.replaceChoices) {

      def.replaceChoices = compileChoices(def.replaceChoices);

      def.replaceChoicesLabels = {};

      def.replaceChoices.forEach(function (choice) {
        def.replaceChoicesLabels[choice.value] = choice.label;
      });
    }
  };
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
// # compiler.lookup

/*
Convert a lookup declaration to an evaluation. A lookup property is used like:

```js
{
  type: 'string',
  key: 'states',
  lookup: {source: 'locations', keys: ['country']}
}
```

Logically, the above will use the `country` key of the value to ask the
`locations` source for states choices. This works by converting the lookup to
the following evaluation.

```js
{
  type: 'string',
  key: 'states',
  choices: [],
  eval: {
    needsMeta: [
      ['@if', ['@getMeta', 'locations', {country: ['@get', 'country']}], null, ['locations', {country: ['@get', 'country']}]]
    ],
    choices: ['@getMeta', 'locations', {country: ['@get', 'country']}]
  }
}
```

The above says to add a `needsMeta` property if necessary and add a `choices`
array if it's available. Otherwise, choices will default to an empty array.
*/

'use strict';

module.exports = function (plugin) {

  var addLookup = function (def, lookupPropName, choicesPropName) {
    var lookup = def[lookupPropName];

    if (lookup) {
      if (!def[choicesPropName]) {
        def[choicesPropName] = [];
      }
      if (!def.eval) {
        def.eval = {};
      }
      if (!def.eval.needsMeta) {
        def.eval.needsMeta = [];
      }
      var keys = lookup.keys || [];
      var params = {};
      var metaArgs, metaGet;

      if (lookup.group) {

        keys.forEach(function (key) {
          params[key] = ['@get', 'item', key];
        });
        metaArgs = [lookup.source].concat(params);
        metaGet = ['@getMeta'].concat(metaArgs);
        var metaForEach = ['@forEach', 'item', ['@getGroupValues', lookup.group]];
        def.eval.needsMeta.push(metaForEach.concat([
          metaArgs,
          ['@not', metaGet]
        ]));
        def.eval[choicesPropName] = metaForEach.concat([
          metaGet,
          metaGet
        ]);
      } else {
        keys.forEach(function (key) {
          params[key] = ['@get', key];
        });
        metaArgs = [lookup.source].concat(params);
        metaGet = ['@getMeta'].concat(metaArgs);
        def.eval.needsMeta.push(['@if', metaGet, null, metaArgs]);
        def.eval[choicesPropName] = metaGet;
      }

      delete def[lookupPropName];
    }
  };

  plugin.exports.compile = function (def) {

    addLookup(def, 'lookup', 'choices');
    addLookup(def, 'lookupReplacements', 'replaceChoices');
  };
};

},{}],3:[function(require,module,exports){
// # compilers.prop-aliases

/*
Alias some properties to other properties.
*/

'use strict';

module.exports = function (plugin) {

  var propAliases = {
    help_text: 'helpText'
  };

  plugin.exports.compile = function (def) {
    Object.keys(propAliases).forEach(function (alias) {
      var propName = propAliases[alias];
      if (typeof def[propName] === 'undefined' && typeof def[alias] !== 'undefined') {
        def[propName] = def[alias];
      }
    });
  };
};

},{}],4:[function(require,module,exports){
(function (global){
// # compilers.types

/*
Convert some high-level types to low-level types and properties.
*/

'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = function (plugin) {

  // Map high-level type to low-level type. If a function is supplied, can
  // modify the field definition.
  var typeCoerce = {
    unicode: function (def) {
      def.type = 'string';
      def.maxRows = 1;
    },
    text: 'string',
    select: function (def) {
      def.choices = def.choices || [];
    },
    bool: 'boolean',
    dict: 'object',
    decimal: 'number'
  };

  typeCoerce.str = typeCoerce.unicode;


  plugin.exports.compile = function (def) {

    var coerceType = typeCoerce[def.type];
    if (coerceType) {
      if (_.isString(coerceType)) {
        def.type = coerceType;
      } else if (_.isFunction(coerceType)) {
        def = coerceType(def);
      }
    }
  };
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(require,module,exports){
(function (global){
// # component.add-item

/*
The add button to append an item to a field.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports = React.createClass({

    displayName: plugin.name,

    getDefaultProps: function () {
      return {
        className: plugin.config.className,
        label: plugin.configValue('label', '[add]')
      };
    },

    render: function () {
      return R.span({className: this.props.className, onClick: this.props.onClick}, this.props.label);
    }
  });
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],6:[function(require,module,exports){
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

module.exports = function (plugin) {

  plugin.exports = React.createClass({

    displayName: plugin.name,

    mixins: [plugin.require('mixin.field')],

    getDefaultProps: function () {
      return {
        className: plugin.config.className
      };
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
      this.props.field.val(values);
    },

    render: function () {

      var field = this.props.field;

      var choices = field.def.choices || [];

      var isInline = !_.find(choices, function (choice) {
        return choice.sample;
      });

      var value = field.value || [];

      return plugin.component('field')({
        field: field
      },
        R.div({className: this.props.className, ref: 'choices'},
          choices.map(function (choice, i) {

            var inputField = R.span({style: {whiteSpace: 'nowrap'}},
              R.input({
                name: field.def.key,
                type: 'checkbox',
                value: choice.value,
                checked: value.indexOf(choice.value) >= 0 ? true : false,
                onChange: this.onChange
                //onFocus: this.props.actions.focus
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
                plugin.component('sample')({field: field, choice: choice})
              );
            }
          }.bind(this))
        )
      );
    }
  });
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],7:[function(require,module,exports){
(function (global){
// # component.field

/*
Used by any fields to put the label and help text around the field.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = function (plugin) {

  plugin.exports = React.createClass({

    displayName: plugin.name,

    getDefaultProps: function () {
      return {
        className: plugin.config.className
      };
    },

    getInitialState: function () {
      return {
        collapsed: this.props.field.def.collapsed ? true : false
      };
    },

    isCollapsible: function () {
      var field = this.props.field;

      return !_.isUndefined(field.def.collapsed) || !_.isUndefined(field.def.collapsible);
    },

    onClickLabel: function () {
      this.setState({
        collapsed: !this.state.collapsed
      });
    },

    render: function () {

      var field = this.props.field;

      var index = this.props.index;
      if (!_.isNumber(index)) {
        index = _.isNumber(field.def.key) ? field.def.key : undefined;
      }

      return R.div({className: this.props.className, style: {display: (field.hidden() ? 'none' : '')}},
        plugin.component('label')({field: field, index: index, onClick: this.isCollapsible() ? this.onClickLabel : null}),
        React.addons.CSSTransitionGroup({transitionName: 'reveal'},
          this.state.collapsed ? [] : [
            plugin.component('help')({key: 'help', field: field}),
            this.props.children
          ]
        )
      );
    }
  });
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],8:[function(require,module,exports){
(function (global){
// # component.fieldset

/*
Render multiple child fields for a field.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports = React.createClass({

    displayName: plugin.name,

    mixins: [plugin.require('mixin.field')],

    getDefaultProps: function () {
      return {
        className: plugin.config.className
      };
    },

    render: function () {
      var field = this.props.field;

      return plugin.component('field')({
        field: field
      },
        R.fieldset({className: this.props.className},
          field.fields().map(function (field, i) {
            return field.component({key: field.def.key || i});
          }.bind(this))
        )
      );
    }
  });
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],9:[function(require,module,exports){
(function (global){
// # component.formatic

/*
Top-level component which gets a form and then listens to the form for changes.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports = React.createClass({

    displayName: plugin.name,

    getInitialState: function () {
      return {
        field: this.props.form.field()
      };
    },

    componentDidMount: function() {
      var form = this.props.form;
      form.on('change', this.onFormChanged);
    },

    componentWillUnmount: function () {
      var form = this.props.form;
      form.off('change', this.onFormChanged);
    },

    onFormChanged: function () {
      if (this.props.onChange) {
        this.props.onChange(this.props.form.val());
      }
      this.setState({
        field: this.props.form.field()
      });
    },

    render: function () {
      return R.div({className: 'formatic'},
        this.state.field.component()
      );
    }
  });
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],10:[function(require,module,exports){
(function (global){
// # component.help

/*
Just the help text block.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports = React.createClass({

    displayName: plugin.name,

    getDefaultProps: function () {
      return {
        className: plugin.config.className
      };
    },

    render: function () {

      var field = this.props.field;

      return field.def.helpText ?
        R.div({className: this.props.className},
          field.def.helpText
        ) :
        R.span(null);
    }
  });
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],11:[function(require,module,exports){
(function (global){
// # component.item-choices

/*
Give a list of choices of item types to create as children of an field.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports = React.createClass({

    displayName: plugin.name,

    getDefaultProps: function () {
      return {
        className: plugin.config.className
      };
    },

    onChange: function (event) {
      this.props.onSelect(parseInt(event.target.value));
    },

    render: function () {

      var field = this.props.field;

      var typeChoices = null;
      if (field.items().length > 0) {
        typeChoices = R.select({className: this.props.className, value: this.value, onChange: this.onChange},
          field.items().map(function (item, i) {
            return R.option({key: i, value: i}, item.label || i);
          })
        );
      }

      return typeChoices ? typeChoices : R.span(null);
    }
  });
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],12:[function(require,module,exports){
(function (global){
// # component.json

/*
Textarea editor for JSON. Will validate the JSON before setting the value, so
while the value is invalid, no external state changes will occur.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports = React.createClass({

    displayName: plugin.name,

    mixins: [plugin.require('mixin.field')],

    getDefaultProps: function () {
      return {
        className: plugin.config.className,
        rows: plugin.config.rows || 5
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
        value: JSON.stringify(this.props.field.value)
      };
    },

    onChange: function (event) {
      var isValid = this.isValidValue(event.target.value);

      if (isValid) {
        // Need to handle this better. Need to track position.
        this._isChanging = true;
        this.props.field.val(JSON.parse(event.target.value));
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

      var field = this.props.field;

      return plugin.component('field')({
        field: field
      }, R.textarea({
          className: this.props.className,
          value: this.state.value,
          onChange: this.onChange,
          style: {backgroundColor: this.state.isValid ? '' : 'rgb(255,200,200)'},
          rows: field.def.rows || this.props.rows
        })
      );
    }
  });
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],13:[function(require,module,exports){
(function (global){
// # component.label

/*
Just the label for a field.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports = React.createClass({

    displayName: plugin.name,

    getDefaultProps: function () {
      return {
        className: plugin.config.className
      };
    },

    render: function () {

      var field = this.props.field;

      var label = null;
      if (typeof this.props.index === 'number') {
        label = '' + (this.props.index + 1) + '.';
        if (field.def.label) {
          label = label + ' ' + field.def.label;
        }
      }

      if (field.def.label || label) {
        var text = label || field.def.label;
        if (this.props.onClick) {
          text = R.a({href: 'JavaScript' + ':', onClick: this.props.onClick}, text);
        }
        label = R.label({}, text);
      }

      var required = R.span({className: 'required-text'});

      return R.div({
        className: this.props.className
      },
        label,
        ' ',
        required
      );
    }
  });
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],14:[function(require,module,exports){
(function (global){
// # component.list-control

/*
Render the item type choices and the add button.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports = React.createClass({

    displayName: plugin.name,

    getDefaultProps: function () {
      return {
        className: plugin.config.className
      };
    },

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

      var field = this.props.field;

      var typeChoices = null;

      if (field.items().length > 0) {
        typeChoices = plugin.component('item-choices')({field: field, value: this.state.itemIndex, onSelect: this.onSelect});
      }

      return R.div({className: this.props.className},
        typeChoices, ' ',
        plugin.component('add-item')({onClick: this.onAppend})
      );
    }
  });
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],15:[function(require,module,exports){
(function (global){
// # component.list-item-control

/*
Render the remove and move buttons for a field.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports = React.createClass({

    displayName: plugin.name,

    getDefaultProps: function () {
      return {
        className: plugin.config.className
      };
    },

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
      var field = this.props.field;

      return R.div({className: this.props.className},
        plugin.component('remove-item')({field: field, onClick: this.onRemove}),
        this.props.index > 0 ? plugin.component('move-item-back')({onClick: this.onMoveBack}) : null,
        this.props.index < (this.props.numItems - 1) ? plugin.component('move-item-forward')({onClick: this.onMoveForward}) : null
      );
    }
  });
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],16:[function(require,module,exports){
(function (global){
// # component.list-item-value

/*
Render the value of a list item.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports = React.createClass({

    displayName: plugin.name,

    getDefaultProps: function () {
      return {
        className: plugin.config.className
      };
    },

    render: function () {
      var field = this.props.field;

      return R.div({className: this.props.className},
        field.component()
        // plugin.component('field')({
        //   field: field,
        //   index: this.props.index
        // },
        //   field.component()
        // )
      );
    }
  });
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],17:[function(require,module,exports){
(function (global){
// # component.list-item

/*
Render a list item.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports = React.createClass({

    displayName: plugin.name,

    getDefaultProps: function () {
      return {
        className: plugin.config.className
      };
    },

    render: function () {
      var field = this.props.field;

      return R.div({className: this.props.className},
        plugin.component('list-item-value')({form: this.props.form, field: field, index: this.props.index}),
        plugin.component('list-item-control')({field: field, index: this.props.index, numItems: this.props.numItems, onMove: this.props.onMove, onRemove: this.props.onRemove})
      );
    }
  });
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],18:[function(require,module,exports){
(function (global){
// # component.list

/*
Render a list.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports = React.createClass({

    displayName: plugin.name,

    mixins: [plugin.require('mixin.field')],

    getDefaultProps: function () {
      return {
        className: plugin.config.className
      };
    },

    nextLookupId: 0,

    getInitialState: function () {

      // Need to create artificial keys for the array. Indexes are not good keys,
      // since they change. So, map each position to an artificial key
      var lookups = [];
      this.props.field.fields().forEach(function (field, i) {
        lookups[i] = '_' + this.nextLookupId;
        this.nextLookupId++;
      }.bind(this));

      return {
        lookups: lookups
      };
    },

    componentWillReceiveProps: function (newProps) {

      var lookups = this.state.lookups;
      var fields = newProps.field.fields();

      // Need to set artificial keys for new array items.
      if (fields.length > lookups.length) {
        for (var i = lookups.length; i < fields.length; i++) {
          lookups[i] = '_' + this.nextLookupId;
          this.nextLookupId++;
        }
      }

      this.setState({
        lookups: lookups
      });
    },

    onAppend: function (itemIndex) {
      this.props.field.append(itemIndex);
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
      this.props.field.remove(i);
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
      this.props.field.move(fromIndex, toIndex);
    },

    render: function () {

      var field = this.props.field;
      var fields = field.fields();

      var numItems = fields.length;
      return plugin.component('field')({
        field: field
      },
        R.div({className: this.props.className},
          React.addons.CSSTransitionGroup({transitionName: 'reveal'},
            fields.map(function (child, i) {
              return plugin.component('list-item')({
                key: this.state.lookups[i],
                form: this.props.form,
                field: child,
                parent: field,
                index: i,
                numItems: numItems,
                onMove: this.onMove,
                onRemove: this.onRemove
              });
            }.bind(this))
          ),
          plugin.component('list-control')({field: field, onAppend: this.onAppend})
        )
      );
    }
  });
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],19:[function(require,module,exports){
(function (global){
// # component.move-item-back

/*
Button to move an item backwards in list.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports = React.createClass({

    displayName: plugin.name,

    getDefaultProps: function () {
      return {
        className: plugin.config.className,
        label: plugin.configValue('label', '[up]')
      };
    },

    render: function () {
      return R.span({className: this.props.className, onClick: this.props.onClick}, this.props.label);
    }
  });
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],20:[function(require,module,exports){
(function (global){
// # component.move-item-forward

/*
Button to move an item forward in a list.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports = React.createClass({

    displayName: plugin.name,

    getDefaultProps: function () {
      return {
        className: plugin.config.className,
        label: plugin.configValue('label', '[down]')
      };
    },

    render: function () {
      return R.span({className: this.props.className, onClick: this.props.onClick}, this.props.label);
    }
  });
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],21:[function(require,module,exports){
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

var noBreak = function (value) {
  return value.replace(/ /g, '\u00a0');
};

var LEFT_PAD = '\u00a0\u00a0';
var RIGHT_PAD = '\u00a0\u00a0';

module.exports = function (plugin) {

  var util = plugin.require('util');

  plugin.exports = React.createClass({

    displayName: plugin.name,

    mixins: [plugin.require('mixin.field'), plugin.require('mixin.undo-stack'), plugin.require('mixin.resize')],

    getDefaultProps: function () {
      return {
        className: plugin.config.className
      };
    },

    getInitialState: function () {
      return {
        undoDepth: 100
      };
    },

    componentWillMount: function () {
      // Not quite state, this is for tracking selection info.
      this.tracking = {};

      var parts = util.parseTextWithTags(this.props.field.value);
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
      this.props.field.val(snapshot.value);
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
      this.props.field.val(rawValue);

      this.snapshot();
    },

    componentDidUpdate: function () {
      var value = this.props.field.value || '';
      var parts = util.parseTextWithTags(value);
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
      if (this.props.field.def.replaceChoicesLabels[key]) {
        return this.props.field.def.replaceChoicesLabels[key];
      }
      return util.humanize(key);
    },

    // Given the actual value of the field (with tags), get the plain text that
    // should show in the textarea.
    plainValue: function (value) {
      var parts = util.parseTextWithTags(value);
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
      var parts = util.parseTextWithTags(value);
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
          return R.span({key: i, className: 'pretty-part'},
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

    onKeyDown: function (event) {
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

    // Keep the highlight styles in sync with the textarea styles.
    adjustStyles: function () {
      var overlay = this.refs.highlight.getDOMNode();
      var content = this.refs.content.getDOMNode();

      var style = window.getComputedStyle(content);

      var backgroundColor = style.backgroundColor;

      util.copyElementStyle(content, overlay);

      overlay.style.position = 'absolute';
      overlay.style.whiteSpace = 'pre-wrap';
      overlay.style.color = 'rgba(0,0,0,0)';
      overlay.style.webkitTextFillColor = 'rgba(0,0,0,0)';
      overlay.style.resize = 'none';
      overlay.style.borderColor = 'rgba(0,0,0,0)';

      if (util.browser.isMozilla) {

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

      overlay.style.backgroundColor = backgroundColor;
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
      this.adjustStyles();
      this.setOnResize('content', this.onResize);
    },

    onInsert: function (event) {
      if (event.target.selectedIndex > 0) {
        var tag = '{{' + event.target.value + '}}';
        event.target.selectedIndex = 0;
        var pos = this.tracking.pos;
        var insertPos = this.normalizePosition(pos);
        var tokens = this.tracking.tokens;
        var tokenIndex = this.tokenIndex(insertPos, tokens, this.tracking.indexMap);
        tokens.splice(tokenIndex, 0, tag);
        this.tracking.indexMap = this.indexMap(tokens);
        var newValue = this.rawValue(tokens);
        this.props.field.val(newValue);
      }
    },

    render: function () {
      var field = this.props.field;

      var replaceChoices = [{
        value: '',
        label: 'Insert...'
      }].concat(field.def.replaceChoices);

      return plugin.component('field')({
        field: field
      }, R.div({style: {position: 'relative'}},

        R.pre({
          className: 'pretty-highlight',
          ref: 'highlight'
        },
          this.prettyValue(field.value)
        ),

        R.textarea(_.extend({
          className: util.className(this.props.className, 'pretty-content'),
          ref: 'content',
          rows: field.def.rows || this.props.rows,
          name: field.key,
          value: this.plainValue(field.value),
          onChange: this.onChange,
          onScroll: this.onScroll,
          style: {
            position: 'relative',
            top: 0,
            left: 0
          },
          onKeyPress: this.onKeyPress,
          onKeyDown: this.onKeyDown,
          onSelect: this.onSelect,
          onCopy: this.onCopy
        }, plugin.config.attributes)),

        R.select({onChange: this.onInsert},
          replaceChoices.map(function (choice, i) {
            return R.option({
              key: i,
              value: choice.value
            }, choice.label);
          })
        )
      ));
    }
  });
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],22:[function(require,module,exports){
(function (global){
// # component.remove-item

/*
Remove an item.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports = React.createClass({

    displayName: plugin.name,

    getDefaultProps: function () {
      return {
        className: plugin.config.className,
        label: plugin.configValue('label', '[remove]')
      };
    },

    render: function () {
      return R.span({className: this.props.className, onClick: this.props.onClick}, this.props.label);
    }
  });
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],23:[function(require,module,exports){
(function (global){
// # component.root

/*
Root component just used to spit out all the fields for a form.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = function (plugin) {

  var util = plugin.require('util');

  plugin.exports = React.createClass({

    displayName: plugin.name,

    getDefaultProps: function () {
      return {
        className: util.className('root', plugin.config.className)
      };
    },

    render: function () {
      var field = this.props.field;

      return R.div({
        className: this.props.className
      },
        field.fields().map(function (field, i) {
          return field.component({key: field.def.key || i});
        })
      );
    }
  });
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],24:[function(require,module,exports){
(function (global){
// # component.help

/*
Just the help text block.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports = React.createClass({

    displayName: plugin.name,

    getDefaultProps: function () {
      return {
        className: plugin.config.className
      };
    },

    render: function () {

      var choice = this.props.choice;

      return choice.sample ?
        R.div({className: this.props.className},
          choice.sample
        ) :
        R.span(null);
    }
  });
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],25:[function(require,module,exports){
(function (global){
// # component.select

/*
Render select element to give a user choices for the value of a field. Note
it should support values other than strings. Currently this is only tested for
boolean values, but it _should_ work for other values.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = function (plugin) {

  plugin.exports = React.createClass({

    displayName: plugin.name,

    mixins: [plugin.require('mixin.field')],

    getDefaultProps: function () {
      return {
        className: plugin.config.className
      };
    },

    onChange: function (event) {
      var choiceValue = event.target.value;
      var choiceType = choiceValue.substring(0, choiceValue.indexOf(':'));
      if (choiceType === 'choice') {
        var choiceIndex = choiceValue.substring(choiceValue.indexOf(':') + 1);
        choiceIndex = parseInt(choiceIndex);
        this.props.field.val(this.props.field.def.choices[choiceIndex].value);
      }
    },

    render: function () {

      var field = this.props.field;
      var choices = field.def.choices || [];

      var value = field.value !== undefined ? field.value : '';

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

      return plugin.component('field')({
        field: field
      }, R.select({
        className: this.props.className,
        onChange: this.onChange,
        value: valueChoice.choiceValue
      },
        choices.map(function (choice, i) {
          return R.option({
            key: i,
            value: choice.choiceValue
          }, choice.label);
        }.bind(this))
      ));
    }
  });
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],26:[function(require,module,exports){
(function (global){
// # component.text

/*
Just a simple text input.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports = React.createClass({

    displayName: plugin.name,

    mixins: [plugin.require('mixin.field')],

    getDefaultProps: function () {
      return {
        className: plugin.config.className
      };
    },

    onChange: function (event) {
      var newValue = event.target.value;
      this.props.field.val(newValue);
    },

    render: function () {

      var field = this.props.field;

      return plugin.component('field')({
        field: field
      }, R.input({
        className: this.props.className,
        type: 'text',
        value: field.value,
        rows: field.def.rows,
        onChange: this.onChange
      }));
    }
  });
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],27:[function(require,module,exports){
(function (global){
// # component.textarea

/*
Just a simple multi-row textarea.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports = React.createClass({

    displayName: plugin.name,

    mixins: [plugin.require('mixin.field')],

    getDefaultProps: function () {
      return {
        className: plugin.config.className,
        rows: plugin.config.rows || 5
      };
    },

    onChange: function (event) {
      var newValue = event.target.value;
      this.props.field.val(newValue);
    },

    render: function () {

      var field = this.props.field;

      return plugin.component('field')({
        field: field
      }, R.textarea({
        className: this.props.className,
        value: field.value,
        rows: field.def.rows || this.props.rows,
        onChange: this.onChange
      }));
    }
  });
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],28:[function(require,module,exports){
(function (global){
// # core.field

/*
The core field plugin provides the Field prototype. Fields represent a
particular state in time of a field definition, and they provide helper methods
to notify the form store of changes.

Fields are lazily created and evaluated, but once evaluated, they should be
considered immutable.
*/

'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = function (plugin) {

  var router = plugin.require('field-router');
  var util = plugin.require('util');
  var evaluator = plugin.require('eval');
  var compiler = plugin.require('compiler');

  // The Field constructor.
  var Field = function (form, def, value, parent) {
    var field = this;

    field.form = form;
    field.def = def;
    field.value = value;
    field.parent = parent;
    field.groups = {};
  };

  // Attach a field factory to the form prototype.
  plugin.exports.field = function () {
    var form = this;

    return new Field(form, {
      type: 'root'
    }, form.store.value);
  };

  var proto = Field.prototype;

  // Return the type plugin for this field.
  proto.typePlugin = function () {
    var field = this;

    if (!field._typePlugin) {
      field._typePlugin = plugin.require('type.' + field.def.type);
    }

    return field._typePlugin;
  };

  // Get a component for this field.
  proto.component = function (props) {
    var field = this;
    props = _.extend({}, props, {field: field});
    var component = router.componentForField(field);
    return component(props);
  };

  // Get the child fields for this field.
  proto.fields = function () {
    var field = this;

    if (!field._fields) {
      var fields;
      if (field.typePlugin().fields) {
        fields = field.typePlugin().fields(field);
      } else if (field.def.fields) {
        fields = field.def.fields.map(function (def) {
          return field.createChild(def);
        });
      } else {
        fields = [];
      }
      field._fields = fields;
    }

    return field._fields;
  };

  // Get the items (child field definitions) for this field.
  proto.items = function () {
    var field = this;

    if (!field._items) {
      if (_.isArray(field.def.items)) {
        field._items = field.def.items.map(function (item) {
          return field.resolve(item);
        });
      } else {
        field._items = [];
      }
    }

    return field._items;
  };

  // Resolve a field reference if necessary.
  proto.resolve = function (def) {
    var field = this;

    if (_.isString(def)) {
      def = field.form.findDef(def);
      if (!def) {
        throw new Error('Could not find field: ' + def);
      }
    }

    return def;
  };

  // Evaluate a field definition and return a new field definition.
  proto.evalDef = function (def) {
    var field = this;

    if (def.eval) {

      try {
        var extDef = field.eval(def.eval);
        if (extDef) {
          def = _.extend({}, def, extDef);
          def = compiler.compileDef(def);
          if (def.fields) {
            def.fields = def.fields.map(function (childDef) {
              childDef = compiler.expandDef(childDef, field.form.store.templateMap);
              return compiler.compileDef(childDef);
            });
          }
        }
      } catch (e) {
        console.log('Problem in eval: ', JSON.stringify(def.eval));
        console.log(e.message);
        console.log(e.stack);
      }
    }

    return def;
  };

  // Evaluate an expression in the context of a field.
  proto.eval = function (expression, context) {
    return evaluator.evaluate(expression, this, context);
  };

  // Create a child field from a definition.
  proto.createChild = function (def) {
    var field = this;

    def = field.resolve(def);

    var value = field.value;

    def = field.evalDef(def);

    if (!util.isBlank(def.key)) {
      if (value && !_.isUndefined(value[def.key])) {
        value = value[def.key];
      } else {
        value = undefined;
      }
    } else {
      value = def.value;
    }

    return new Field(field.form, def, value, field);
  };

  // Given a value, find an appropriate field definition for this field.
  proto.itemForValue = function (value) {
    var field = this;

    var item = _.find(field.items(), function (item) {
      return util.itemMatchesValue(item, value);
    });
    if (item) {
      item = _.extend({}, item);
    } else {
      item = util.fieldDefFromValue(value);
    }

    return item;
  };

  // Get all the fields belonging to a group.
  proto.groupFields = function (groupName) {
    var field = this;

    if (!field.groups[groupName]) {
      field.groups[groupName] = [];
      if (field.parent) {
        var siblings = field.parent.fields();
        siblings.forEach(function (sibling) {
          if (sibling !== field && sibling.def.group === groupName) {
            field.groups[groupName].push(sibling);
          }
        });
        var parentGroupFields = field.parent.groupFields(groupName);
        field.groups[groupName] = field.groups[groupName].concat(parentGroupFields);
      }
    }

    return field.groups[groupName];
  };

  // Walk backwards through parents and build out a path array to the value.
  proto.valuePath = function (childPath) {
    var field = this;

    var path = childPath || [];
    if (!util.isBlank(field.def.key)) {
      path = [field.def.key].concat(path);
    }
    if (field.parent) {
      return field.parent.valuePath(path);
    }
    return path;
  };

  // Set the value for this field.
  proto.val = function (value) {
    var field = this;

    field.form.actions.setValue(field.valuePath(), value);
  };

  // Remove a child value from this field.
  proto.remove = function (key) {
    var field = this;

    var path = field.valuePath().concat(key);

    field.form.actions.removeValue(path);
  };

  // Move a child value from one key to another.
  proto.move = function (fromKey, toKey) {
    var field = this;

    field.form.actions.moveValue(field.valuePath(), fromKey, toKey);
  };

  // Get the default value for this field.
  proto.default = function () {
    var field = this;

    if (!_.isUndefined(field.def.value)) {
      return util.copyValue(field.def.value);
    }

    if (!_.isUndefined(field.def.default)) {
      return util.copyValue(field.def.default);
    }

    if (!_.isUndefined(field.typePlugin().default)) {
      return util.copyValue(field.typePlugin().default);
    }

    return null;
  };

  // Append a new value. Use the `itemIndex` to get an appropriate
  // item, inflate it, and create a default value.
  proto.append = function (itemIndex) {
    var field = this;

    var item = field.items()[itemIndex];
    item = _.extend(item);

    item.key = field.value.length;

    var child = field.createChild(item);

    var obj = child.default();

    if (_.isArray(obj) || _.isObject(obj)) {
      var chop = field.valuePath().length + 1;

      child.inflate(function (path, value) {
        obj = util.setIn(obj, path.slice(chop), value);
      });
    }

    field.form.actions.appendValue(field.valuePath(), obj);
  };

  // Determine whether the field is hidden.
  proto.hidden = function () {
    var field = this;

    return field.def.hidden || field.typePlugin().hidden;
  };

  // Expand all child fields and call the setter function with the default
  // values at each path.
  proto.inflate = function (onSetValue) {
    var field = this;

    if (!util.isBlank(field.def.key) && _.isUndefined(field.value)) {
      onSetValue(field.valuePath(), field.default());
    }

    var fields = field.fields();

    fields.forEach(function (child) {
      child.inflate(onSetValue);
    });
  };

  // Called from unmount. When fields are removed for whatever reason, we
  // should delete the corresponding value.
  proto.erase = function () {
    var field = this;
    if (!util.isBlank(field.def.key) && !_.isUndefined(field.value)) {
      field.form.actions.eraseValue(field.valuePath(), {});
    }
  };
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],29:[function(require,module,exports){
// # core.form-init

/*
This plugin makes it easy to hook into form initialization, without having to
configure all the other core plugins.
*/

'use strict';

module.exports = function (plugin) {

  var initPlugins = plugin.requireAll(plugin.config.init);

  var proto = plugin.exports;

  proto.init = function () {
    var form = this;

    initPlugins.forEach(function (plugin) {
      plugin.apply(form, arguments);
    });
  };
};

},{}],30:[function(require,module,exports){
(function (global){
// # core.form

/*
The core form plugin supplies methods that get added to the Form prototype.
*/

'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var EventEmitter = require('eventemitter3');

module.exports = function (plugin) {

  var proto = plugin.exports;

  // Get the store plugin.
  var createStore = plugin.require(plugin.config.store);

  var util = plugin.require('util');
  var loader = plugin.require('loader');

  // Helper to create actions, which will tell the store that something has
  // happened. Note that actions go straight to the store. No events,
  // dispatcher, etc.
  var createSyncActions = function (store, names) {
    var actions = {};
    names.forEach(function (name) {
      actions[name] = function () {
        store[name].apply(store, arguments);
      };
    });
    return actions;
  };

  // Initialize the form instance.
  proto.init = function (options) {
    var form = this;

    options = options || {};

    // Need an emitter to emit change events from the store.
    var storeEmitter = new EventEmitter();

    // Create a store.
    form.store = createStore(form, storeEmitter, options);

    // Create the actions to notify the store of changes.
    form.actions = createSyncActions(form.store, ['setValue', 'setFields', 'removeValue', 'appendValue', 'moveValue', 'eraseValue', 'setMeta']);

    // Seed the value from any fields.
    form.store.inflate();

    // Add on/off to get change events from form.
    form.on = storeEmitter.on.bind(storeEmitter);
    form.off = storeEmitter.off.bind(storeEmitter);
  };

  // Get the root component for a form.
  proto.component = function (props) {

    var form = this;

    props = _.extend({}, props, {
      form: form
    });

    var component = plugin.component('formatic');

    return component(props);
  };

  // Get or set the value of a form.
  proto.val = function (value) {
    var form = this;

    if (!_.isUndefined(value)) {
      return form.actions.setValue(value);
    }

    return util.copyValue(form.store.value);
  };

  // Set/change the fields for a form.
  proto.fields = function (fields) {
    var form = this;

    form.actions.setFields(fields);
  };

  // Find a field template given a key.
  proto.findDef = function (key) {
    var form = this;

    return form.store.templateMap[key] || null;
  };

  // Get or set metadata.
  proto.meta = function (key, value) {
    var form = this;

    if (!_.isUndefined(value)) {
      return form.actions.setMeta(key, value);
    }

    return form.store.meta[key];
  };

  // Load metadata.
  proto.loadMeta = function (source, params) {
    params = params || {};
    var keys = Object.keys(params);
    var validKeys = keys.filter(function (key) {
      return params[key];
    });
    if (validKeys.length < keys.length) {
      return;
    }
    loader.loadMeta(this, source, params);
  };

  // Add a metdata source function, via the loader plugin.
  proto.source = loader.source;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"eventemitter3":57}],31:[function(require,module,exports){
(function (global){
// # core.formatic

/*
The core formatic plugin adds methods to the formatic instance.
*/

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

module.exports = function (plugin) {

  var f = plugin.exports;

  // Use the field-router plugin as the router.
  var router = plugin.require('field-router');

  // Route a field to a component.
  f.route = router.route;

  // Render a component to a node.
  f.render = function (component, node) {

    React.renderComponent(component, node);
  };
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],32:[function(require,module,exports){
(function (global){
// # compiler

// The compiler plugin knows how to normalize field definitions into standard
// field definitions that can be understood be routers and components.

'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = function (plugin) {

  // Grab all the compiler plugins which can be stacked.
  var compilerPlugins = plugin.requireAll(plugin.config.compilers);

  var util = plugin.require('util');

  var compiler = plugin.exports;

  // For a set of fields, make a map of template names to field definitions. All
  // field definitions can be used as templates, whether marked as templates or
  // not.
  compiler.templateMap = function (fields) {
    var map = {};
    fields.forEach(function (field) {
      if (field.key) {
        map[field.key] = field;
      }
      if (field.id) {
        map[field.id] = field;
      }
    });
    return map;
  };

  // Fields and items can extend other field definitions. Fields can also have
  // child fields that point to other field definitions. Here, we expand all
  // those out so that components don't have to worry about this.
  compiler.expandDef = function (def, templateMap) {
    var isTemplate = def.template;
    var ext = def.extends;
    if (_.isString(ext)) {
      ext = [ext];
    }
    if (ext) {
      var bases = ext.map(function (base) {
        var template = templateMap[base];
        if (!template) {
          throw new Error('Template ' + base + ' not found.');
        }
        return template;
      });
      var chain = [{}].concat(bases.reverse().concat([def]));
      def = _.extend.apply(_, chain);
    }
    if (def.fields) {
      def.fields = def.fields.map(function (childDef) {
        if (!_.isString(childDef)) {
          return compiler.expandDef(childDef, templateMap);
        }
        return childDef;
      });
    }
    if (def.items) {
      def.items = def.items.map(function (itemDef) {
        if (!_.isString(itemDef)) {
          return compiler.expandDef(itemDef, templateMap);
        }
        return itemDef;
      });
    }
    if (!isTemplate && def.template) {
      delete def.template;
    }
    return def;
  };

  // For an array of field definitions, expand each field definition.
  compiler.expandFields = function (fields) {
    var templateMap = compiler.templateMap(fields);
    return fields.map(function (def) {
      return compiler.expandDef(def, templateMap);
    });
  };

  // Run a field definition through all available compilers.
  compiler.compileDef = function (def) {

    def = util.deepCopy(def);

    var result;
    compilerPlugins.forEach(function (plugin) {
      result = plugin.compile(def);
      if (result) {
        def = result;
      }
    });

    var typePlugin = plugin.require('type.' + def.type);

    if (typePlugin.compile) {
      result = typePlugin.compile(def);
      if (result) {
        def = result;
      }
    }

    return def;
  };

  // For an array of field definitions, compile each field definition.
  compiler.compileFields = function (fields) {
    return fields.map(function (field) {
      return compiler.compileDef(field);
    });
  };
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],33:[function(require,module,exports){
// # component

// At its most basic level, the component plugin simply maps component names to
// plugin names, returning the component factory for that component. For
// example, `plugin.component('text')` becomes
// `plugin.require('component.text')`. This is a useful placholder in case we
// later want to make formatic able to decide components at runtime. For now,
// however, this allows us to inject "prop modifiers" which are plugins that
// modify a components properties before it receives them.

'use strict';

module.exports = function (plugin) {

  // Registry for prop modifiers.
  var propModifiers = {};

  // Add a "prop modifer" which is just a function that modifies a components
  // properties before it receives them.
  var addPropModifier = function (name, modifyFn) {
    if (!propModifiers[name]) {
      propModifiers[name] = [];
    }
    propModifiers[name].push(modifyFn);
  };

  // Grab all the prop modifier plugins.
  var propsPlugins = plugin.requireAll(plugin.config.props);

  // Register all the prop modifier plugins.
  propsPlugins.forEach(function (plugin) {
    addPropModifier.apply(null, plugin);
  });

  // Registry for component factories. Since we'll be modifying the props going
  // to the factories, we'll store our own component factories here.
  var componentFactories = {};

  // Retrieve the appropriate component factory, which may be a wrapper that
  // runs the component properties through prop modifier functions.
  plugin.exports.component = function (name) {

    if (!componentFactories[name]) {
      var component = plugin.require('component.' + name);
      componentFactories[name] = function (props, children) {
        if (propModifiers[name]) {
          propModifiers[name].forEach(function (modify) {
            var result = modify(props);
            if (result) {
              props = result;
            }
          });
        }
        return component(props, children);
      };
    }
    return componentFactories[name];
  };
};

},{}],34:[function(require,module,exports){
(function (global){
// # core

// The core plugin exports a function that takes a formatic instance and
// extends the instance with additional methods.

'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = function (plugin) {

  plugin.exports = function (formatic) {

    // The core plugin really doesn't do much. It actually relies on other
    // plugins to do the dirty work. This way, you can easily add additional
    // plugins to do more dirty work.
    var formaticPlugins = plugin.requireAll(plugin.config.formatic);

    // We have special form plugins which are just used to modify the Form
    // prototype.
    var formPlugins = plugin.requireAll(plugin.config.form);

    // Pass the formatic instance off to each of the formatic plugins.
    formaticPlugins.forEach(function (f) {
      _.keys(f).forEach(function (key) {
        if (!_.isUndefined(formatic[key])) {
          throw new Error('Property already defined for formatic: ' + key);
        }
        formatic[key] = f[key];
      });
    });

    // ## Form prototype

    // The Form constructor creates a form given a set of options. Options
    // can have `fields` and `value`.
    var Form = function (options) {
      if (this.init) {
        this.init(options);
      }
    };

    // Add the form factory to the formatic instance.
    formatic.form = function (options) {
      return new Form(options);
    };

    Form.prototype = formatic.form;

    // Keep form init methods here.
    var inits = [];

    // Go through form plugins and add each plugin's methods to the form
    // prototype.
    formPlugins.forEach(function (proto) {
      _.keys(proto).forEach(function (key) {
        // Init plugins can be stacked.
        if (key === 'init') {
          inits.push(proto[key]);
        } else {
          if (!_.isUndefined(Form.prototype[key])) {
            throw new Error('Property already defined for form: ' + key);
          }
          Form.prototype[key] = proto[key];
        }
      });
    });

    // Create an init method for the form prototype based on the available init
    // methods.
    if (inits.length === 0) {
      Form.prototype.init = function () {};
    } else if (inits.length === 1) {
      Form.prototype.init = inits[0];
    } else {
      Form.prototype.init = function () {
        var form = this;
        var args = arguments;

        inits.forEach(function (init) {
          init.apply(form, args);
        });
      };
    }
  };
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],35:[function(require,module,exports){
(function (global){
// # eval-functions

/*
Default eval functions. Each function is part of its own plugin, but all are
kept together here as part of a plugin bundle.

Note that eval functions decide when their arguments get evaluated. This way,
you can create control structures (like if) that conditionally evaluates its
arguments.
*/

'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

var wrapFn = function (fn) {
  return function (plugin) {
    plugin.exports = function (args, field, context) {
      args = field.eval(args, context);
      var result = fn.apply(null, args);
      return result;
    };
  };
};

var methodCall = function (method) {
  return function (plugin) {
    plugin.exports = function (args, field, context) {
      args = field.eval(args, context);
      if (args.length > 0) {
        return args[0][method].apply(args[0], args.slice(1));
      }
    };
  };
};

var plugins = {
  if: function (plugin) {
    plugin.exports = function (args, field, context) {
      return field.eval(args[0], context) ? field.eval(args[1], context) : field.eval(args[2], context);
    };
  },

  eq: function (plugin) {
    plugin.exports = function (args, field, context) {
      return field.eval(args[0], context) === field.eval(args[1], context);
    };
  },

  not: function (plugin) {
    plugin.exports = function (args, field, context) {
      return !field.eval(args[0], context);
    };
  },

  or: function (plugin) {
    plugin.exports = function (args, field, context) {
      for (var i = 0; i < args.length; i++) {
        var arg = field.eval(args[i], context);
        if (arg) {
          return arg;
        }
      }
      return args[args.length - 1];
    };
  },

  and: function (plugin) {
    plugin.exports = function (args, field, context) {
      for (var i = 0; i < args.length; i++) {
        var arg = field.eval(args[i], context);
        if (!arg || i === (args.length - 1)) {
          return arg;
        }
      }
      return undefined;
    };
  },

  get: function (plugin) {
    var get = plugin.exports = function (args, field, context) {
      var util = plugin.require('util');
      var key = field.eval(args[0], context);
      var obj;
      if (context && key in context) {
        obj = context[key];
      } else if (!_.isUndefined(field.value) && key in field.value) {
        obj = field.value[key];
      } else if (field.parent) {
        obj = get(args, field.parent);
      }
      if (args.length > 1) {
        var getInKeys = field.eval(args.slice(1), context);
        return util.getIn(obj, getInKeys);
      }
      return obj;
    };
  },

  getGroupValues: function (plugin) {
    plugin.exports = function (args, field, context) {
      var groupName = field.eval(args[0], context);

      var groupFields = field.groupFields(groupName);

      return groupFields.map(function (field) {
        return field.value;
      });
    };
  },

  getMeta: function (plugin) {
    var util = plugin.require('util');
    plugin.exports = function (args, field, context) {
      args = field.eval(args, context);
      var cacheKey = util.metaCacheKey(args[0], args[1]);
      return field.form.meta(cacheKey);
    };
  },

  sum: function (plugin) {
    plugin.exports = function (args, field, context) {
      var sum = 0;
      for (var i = 0; i < args.length; i++) {
        sum += field.eval(args[i], context);
      }
      return sum;
    };
  },

  forEach: function (plugin) {
    plugin.exports = function (args, field, context) {
      var itemName = args[0];
      var array = field.eval(args[1], context);
      var mapExpr = args[2];
      var filterExpr = args[3];
      context = Object.create(context || {});

      var results = [];

      for (var i = 0; i < array.length; i++) {
        var item = array[i];
        context[itemName] = item;
        if (_.isUndefined(filterExpr) || field.eval(filterExpr, context)) {
          results.push(field.eval(mapExpr, context));
        }
      }

      return results;
    };
  },

  concat: methodCall('concat'),
  split: methodCall('split'),
  reverse: methodCall('reverse'),
  join: methodCall('join'),

  humanize: function (plugin) {
    var util = plugin.require('util');
    plugin.exports = function (args, field, context) {
      return util.humanize(field.eval(args[0], context));
    };
  },

  pick: wrapFn(_.pick),
  pluck: wrapFn(_.pluck)
};

// Build a plugin bundle.
_.each(plugins, function (fn, name) {
  module.exports['eval-function.' + name] = fn;
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],36:[function(require,module,exports){
(function (global){
// # eval

/*
The eval plugin will evaluate a field's `eval` property (which must be an
object) and exchange the properties of that object for whatever the
expression returns. Expressions are just JSON except if the first element of
an array is a string that starts with '@'. In that case, the array is
treated as a Lisp expression where the first element refers to a function
that is called with the rest of the elements as the arguments. For example:

```js
['@sum', 1, 2]
```

will return the value 3. The expression could be used in an `eval` property of
a field like:

```js
{
  type: 'string',
  key: 'name',
  eval: {
    rows: ['@sum', 1, 2]
  }
}
```

The `rows` property of the field would be set to 3 in this case.

Any plugin registered with the prefix `eval-function.` will be available as a
function in these expressions.
*/

'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = function (plugin) {

  // Grab all the function plugins.
  var evalFunctionPlugins = plugin.requireAllOf('eval-function');

  // Just strip off the 'eval-functions.' prefix and put in a different object.
  var functions = {};
  _.each(evalFunctionPlugins, function (fn, name) {
    var fnName = name.substring(name.indexOf('.') + 1);
    functions[fnName] = fn;
  });

  // Check an array to see if it's a function expression.
  var isFunctionArray = function (array) {
    return array.length > 0 && array[0][0] === '@';
  };

  // Evaluate a function expression and return the result.
  var evalFunction = function (fnArray, field, context) {
    var fnName = fnArray[0].substring(1);
    try {
      return functions[fnName](fnArray.slice(1), field, context);
    } catch (e) {
      if (!(fnName in functions)) {
        throw new Error('Eval function ' + fnName + ' not defined.');
      }
      throw e;
    }
  };

  // Evaluate an expression in the context of a field.
  var evaluate = function (expression, field, context) {
    if (_.isArray(expression)) {
      if (isFunctionArray(expression)) {
        return evalFunction(expression, field, context);
      } else {
        return expression.map(function (item) {
          return evaluate(item, field, context);
        });
      }
    } else if (_.isObject(expression)) {
      var obj = {};
      Object.keys(expression).forEach(function (key) {
        var result = evaluate(expression[key], field, context);
        if (typeof result !== 'undefined') {
          obj[key] = result;
        }
      });
      return obj;
    } else if (_.isString(expression) && expression[0] === '=') {
      return functions.get([expression.substring(1)], field, context);
    } else {
      return expression;
    }
  };

  plugin.exports.evaluate = evaluate;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],37:[function(require,module,exports){
(function (global){
// # field-router

/*
Fields and components get glued together via routes. This is similar to URL
routing where a request gets dynamically routed to a handler. This gives a lot
of flexibility in introducing new types and components. You can create a new
type and route it to an existing component, or you can create a new component
and route existing types to it. Or you can create both and route the new type
to the new component. New routes are added via route plugins. A route plugin
simply exports an array like:

```js
[
  'color', // Route this type
  'color-picker-with-alpha', // To this component
  function (field) {
    return typeof field.def.alpha !== 'undefined';
  }
]

Route plugins can be stacked and are sensitive to ordering.
*/

'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = function (plugin) {

  var routes = {};

  var router = plugin.exports;

  // Get all the route plugins.
  var routePlugins = plugin.requireAll(plugin.config.routes);

  // Register a route.
  router.route = function (typeName, componentName, testFn) {
    if (!routes[typeName]) {
      routes[typeName] = [];
    }
    routes[typeName].push({
      component: componentName,
      test: testFn
    });
  };

  // Register each of the routes provided by the route plugins.
  routePlugins.forEach(function (routePlugin) {

    router.route.apply(router, routePlugin);
  });

  // Determine the best component for a field, based on the routes.
  router.componentForField = function (field) {

    var typeName = field.def.type;

    if (routes[typeName]) {
      var routesForType = routes[typeName];
      var route = _.find(routesForType, function (route) {
        return !route.test || route.test(field);
      });
      if (route) {
        return plugin.component(route.component);
      }
    }

    if (plugin.hasComponent(typeName)) {
      return plugin.component(typeName);
    }

    throw new Error('No component for field: ' + JSON.stringify(field.def));
  };
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],38:[function(require,module,exports){
(function (global){
// # field-routes

/*
Default routes. Each route is part of its own plugin, but all are kept together
here as part of a plugin bundle.
*/

'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

var routes = {

  'object.default': [
    'object',
    'fieldset'
  ],

  'string.choices': [
    'string',
    'select',
    function (field) {
      return field.def.choices ? true : false;
    }
  ],

  'string.tags': [
    'string',
    'pretty-textarea',
    function (field) {
      return field.def.replaceChoices;
    }
  ],

  'string.single-line': [
    'string',
    'text',
    function (field) {
      return field.def.maxRows === 1;
    }
  ],

  'string.default': [
    'string',
    'textarea'
  ],

  'array.choices': [
    'array',
    'checkbox-list',
    function (field) {
      return field.def.choices ? true : false;
    }
  ],

  'array.default': [
    'array',
    'list'
  ],

  'boolean.default': [
    'boolean',
    'select'
  ],

  'number.default': [
    'number',
    'text'
  ]

};

// Build a plugin bundle.
_.each(routes, function (route, name) {
  module.exports['field-route.' + name] = function (plugin) {
    plugin.exports = route;
  };
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],39:[function(require,module,exports){
// # loader

/*
When metadata isn't available, we ask the loader to load it. The loader will
try to find an appropriate source based on the metadata keys.

Note that we ask the loader to load metadata with a set of keys like
`['foo', 'bar']`, but those are converted to a single key like `foo::bar` for
the sake of caching.
*/

'use strict';

module.exports = function (plugin) {

  var util = plugin.require('util');

  var loader = plugin.exports;

  var isLoading = {};
  var sources = {};

  // Load metadata for a given form and params.
  loader.loadMeta = function (form, source, params) {
    var cacheKey = util.metaCacheKey(source, params);

    if (isLoading[cacheKey]) {
      return;
    }

    isLoading[cacheKey] = true;

    loader.loadAsyncFromSource(form, source, params);
  };

  // Make sure to load metadata asynchronously.
  loader.loadAsyncFromSource = function (form, source, params, waitTime) {
    setTimeout(function () {
      loader.loadFromSource(form, source, params);
    }, waitTime || 0);
  };

  // Load metadata for a form and params.
  loader.loadFromSource = function (form, sourceName, params) {

    // Find the best source for this cache key.
    var source = sources[sourceName];
    if (source) {

      var cacheKey = util.metaCacheKey(sourceName, params);

      // Call the source function.
      var result = source.call(null, params);

      if (result) {
        // Result could be a promise.
        if (result.then) {
          var promise = result.then(function (result) {
            form.meta(cacheKey, result);
            isLoading[cacheKey] = false;
          });

          var onError = function () {
            isLoading[cacheKey] = false;
          };

          if (promise.catch) {
            promise.catch(onError);
          } else {
            // silly jQuery promises
            promise.fail(onError);
          }
        // Or it could be a value. In that case, make sure to asyncify it.
        } else {
          setTimeout(function () {
            form.meta(cacheKey, result);
            isLoading[cacheKey] = false;
          }, 0);
        }
      } else {
        isLoading[cacheKey] = false;
      }

    } else {
      isLoading[cacheKey] = false;
    }
  };

  // Register a source function.
  loader.source = function (name, fn) {

    sources[name] = fn;
  };

};

},{}],40:[function(require,module,exports){
(function (global){
// # util

// Some utility functions to be used by other plugins.

'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = function (plugin) {

  var util = plugin.exports;

  // Check if a value is "blank".
  util.isBlank = function (value) {
    return value === undefined || value === null || value === '';
  };

  // Set value at some path in object.
  util.setIn = function (obj, path, value) {
    if (_.isString(path)) {
      path = [path];
    }
    if (path.length === 0) {
      return value;
    }
    if (path.length === 1) {
      obj[path[0]] = value;
      return obj;
    }
    if (!obj[path[0]]) {
      obj[path[0]] = {};
    }
    util.setIn(obj[path[0]], path.slice(1), value);
    return obj;
  };

  // Remove value at path in some object.
  util.removeIn = function (obj, path) {
    if (_.isString(path)) {
      path = [path];
    }
    if (path.length === 0) {
      return null;
    }
    if (path.length === 1) {
      if (_.isArray(obj)) {
        if (_.isNumber(path[0])) {
          obj.splice(path[0], 1);
        }
      } else if (_.isObject(obj)) {
        delete obj[path[0]];
      }
      return obj;
    }
    if (obj[path[0]]) {
      util.removeIn(obj[path[0]], path.slice(1));
    }
    return obj;
  };

  // Get value at path in some object.
  util.getIn = function (obj, path) {
    if (_.isString(path)) {
      path = [path];
    }
    if (path.length === 0) {
      return obj;
    }
    if (path[0] in obj) {
      return util.getIn(obj[path[0]], path.slice(1));
    }
    return null;
  };

  // Append to array at path in some object.
  util.appendIn = function (obj, path, value) {
    var subObj = util.getIn(obj, path);
    if (_.isArray(subObj)) {
      subObj.push(value);
    }
    return obj;
  };

  // Swap two keys at path in some object.
  util.moveIn = function (obj, path, fromKey, toKey) {
    var subObj = util.getIn(obj, path);
    if (_.isArray(subObj)) {
      if (_.isNumber(fromKey) && _.isNumber(toKey)) {
        var fromIndex = fromKey;
        var toIndex = toKey;
        if (fromIndex !== toIndex &&
          fromIndex >= 0 && fromIndex < subObj.length &&
          toIndex >= 0 && toIndex < subObj.length
        ) {
          subObj.splice(toIndex, 0, subObj.splice(fromIndex, 1)[0]);
        }
      }
    } else {
      var fromValue = subObj[fromKey];
      subObj[fromKey] = subObj[toKey];
      subObj[toKey] = fromValue;
    }
    return obj;
  };

  // Copy obj, leaving non-JSON behind.
  util.copyValue = function (value) {
    return JSON.parse(JSON.stringify(value));
  };

  // Copy obj recursing deeply.
  util.deepCopy = function (obj) {
    if (_.isArray(obj)) {
      return obj.map(function (item) {
        return util.deepCopy(item);
      });
    } else if (_.isObject(obj)) {
      var copy = {};
      _.each(obj, function (value, key) {
        copy[key] = util.deepCopy(value);
      });
      return copy;
    } else {
      return obj;
    }
  };

  // Check if item matches some value, based on the item's `match` property.
  util.itemMatchesValue = function (item, value) {
    var match = item.match;
    if (!match) {
      return true;
    }
    return _.every(_.keys(match), function (key) {
      return _.isEqual(match[key], value[key]);
    });
  };

  // Create a field definition from a value.
  util.fieldDefFromValue = function (value) {
    var def = {
      type: 'json'
    };
    if (_.isString(value)) {
      def = {
        type: 'string'
      };
    } else if (_.isNumber(value)) {
      def = {
        type: 'number'
      };
    } else if (_.isArray(value)) {
      var arrayItemFields = value.map(function (value, i) {
        var childDef = util.fieldDefFromValue(value);
        childDef.key = i;
        return childDef;
      });
      def = {
        type: 'array',
        fields: arrayItemFields
      };
    } else if (_.isObject(value)) {
      var objectItemFields = Object.keys(value).map(function (key) {
        var childDef = util.fieldDefFromValue(value[key]);
        childDef.key = key;
        childDef.label = util.humanize(key);
        return childDef;
      });
      def = {
        type: 'object',
        fields: objectItemFields
      };
    } else if (_.isNull(value)) {
      def = {
        type: 'null'
      };
    }
    return def;
  };

  if (plugin.config.humanize) {
    // Get the humanize function from a plugin if provided.
    util.humanize = plugin.require(plugin.config.humanize);
  } else {
    // Convert property keys to "human" labels. For example, 'foo' becomes
    // 'Foo'.
    util.humanize = function(property) {
      property = property.replace(/\{\{/g, '');
      property = property.replace(/\}\}/g, '');
      return property.replace(/_/g, ' ')
        .replace(/(\w+)/g, function(match) {
          return match.charAt(0).toUpperCase() + match.slice(1);
        });
    };
  }

  // Join multiple CSS class names together, ignoring any that aren't there.
  util.className = function () {

    var classNames = Array.prototype.slice.call(arguments, 0);

    classNames = classNames.filter(function (name) {
      return name;
    });

    return classNames.join(' ');
  };

  // Join keys together to make single "meta" key. For looking up metadata in
  // the metadata part of the store.
  util.joinMetaKeys = function (keys) {
    return keys.join('::');
  };

  // Split a joined key into separate key parts.
  util.splitMetaKey = function (key) {
    return key.split('::');
  };

  util.metaCacheKey = function (source, params) {
    params = params || {};
    return source + '::params(' + JSON.stringify(params) + ')';
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
  util.parseTextWithTags = function (value) {
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

  // Copy all computed styles from one DOM element to another.
  util.copyElementStyle = function (fromElement, toElement) {
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

  util.browser = browser;

};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],41:[function(require,module,exports){
(function (global){
// # Formatic plugin core

// At its core, Formatic is just a plugin host. All of the functionality it has
// out of the box is via plugins. These plugins can be replaced or extended by
// other plugins.

'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

// The global plugin registry holds registered (but not yet instantiated)
// plugins.
var pluginRegistry = {};

// Group plugins by prefix.
var pluginGroups = {};

// For anonymous plugins, incrementing number for names.
var pluginId = 0;

// Register a plugin or plugin bundle (array of plugins) globally.
var registerPlugin = function (name, pluginInitFn) {

  if (pluginRegistry[name]) {
    throw new Error('Plugin ' + name + ' is already registered.');
  }

  if (_.isArray(pluginInitFn)) {
    pluginRegistry[name] = [];
    pluginInitFn.forEach(function (pluginSpec) {
      registerPlugin(pluginSpec.name, pluginSpec.plugin);
      pluginRegistry[name].push(pluginSpec.name);
    });
  } else if (_.isObject(pluginInitFn) && !_.isFunction(pluginInitFn)) {
    var bundleName = name;
    pluginRegistry[bundleName] = [];
    Object.keys(pluginInitFn).forEach(function (name) {
      registerPlugin(name, pluginInitFn[name]);
      pluginRegistry[bundleName].push(name);
    });
  } else {
    pluginRegistry[name] = pluginInitFn;
    // Add plugin name to plugin group if it has a prefix.
    if (name.indexOf('.') > 0) {
      var prefix = name.substring(0, name.indexOf('.'));
      pluginGroups[prefix] = pluginGroups[prefix] || [];
      pluginGroups[prefix].push(name);
    }
  }
};

// Default plugin config. Each key represents a plugin name. Each key of that
// plugin represents a setting for that plugin. Passed-in config will override
// each individual setting.
var defaultPluginConfig = {
  core: {
    formatic: ['core.formatic'],
    form: ['core.form-init', 'core.form', 'core.field']
  },
  'core.form': {
    store: 'store.memory'
  },
  'field-router': {
    routes: ['field-routes']
  },
  compiler: {
    compilers: ['compiler.choices', 'compiler.lookup', 'compiler.types', 'compiler.prop-aliases']
  },
  component: {
    props: ['default-style']
  }
};

// ## Formatic factory

// Create a new formatic instance. A formatic instance is a function that can
// create forms. It also has a `.create` method that can create other formatic
// instances.
var Formatic = function (config) {

  // Make a copy of config so we can monkey with it.
  config = _.extend({}, config);

  // Add default config settings (where not overridden).
  _.keys(defaultPluginConfig).forEach(function (key) {
    config[key] = _.extend({}, defaultPluginConfig[key], config[key]);
  });

  // The `formatic` variable will hold the function that gets returned from the
  // factory.
  var formatic;

  // Instantiated plugins are cached just like CommonJS modules.
  var pluginCache = {};

  // ## Plugin prototype

  // The Plugin prototype exists inside the Formatic factory function just to
  // make it easier to grab values from the closure.

  // Plugins are similar to CommonJS modules. Formatic uses plugins as a slight
  // variant though because:
  // - Formatic plugins are configurable.
  // - Formatic plugins are instantiated per formatic instance. CommonJS modules
  //   are created once and would be shared across all formatic instances.
  // - Formatic plugins are easily overridable (also via configuration).

  // When a plugin is instantiated, we call the `Plugin` constructor. The plugin
  // instance is then passed to the plugin's initialization function.
  var Plugin = function (name, config) {
    if (!(this instanceof Plugin)) {
      return new Plugin(name, config);
    }
    // Exports analogous to CommonJS exports.
    this.exports = {};
    // Config values passed in via factory are routed to the appropriate
    // plugin and available via `.config`.
    this.config = config || {};
    this.name = name;
  };

  // Get a config value for a plugin or return the default value.
  Plugin.prototype.configValue = function (key, defaultValue) {

    if (typeof this.config[key] !== 'undefined') {
      return this.config[key];
    }
    return defaultValue || '';
  };

  // Require another plugin by name. This is much like a CommonJS require
  Plugin.prototype.require = function (name) {
    return formatic.plugin(name);
  };

  // Handle a special plugin, the `component` plugin which finds components.
  var componentPlugin;

  // Just here in case we want to dynamically choose component later.
  Plugin.prototype.component = function (name) {
    return componentPlugin.component(name);
  };

  // Check if a plugin exists.
  Plugin.prototype.hasPlugin = function (name) {
    return (name in pluginCache) || (name in pluginRegistry);
  };

  // Check if a component exists. Components are really just plugins with
  // a particular prefix to their names.
  Plugin.prototype.hasComponent = function (name) {
    return this.hasPlugin('component.' + name);
  };

  // Given a list of plugin names, require them all and return a list of
  // instantiated plugins.
  Plugin.prototype.requireAll = function (pluginList) {
    if (!pluginList) {
      pluginList = [];
    }
    if (!_.isArray(pluginList)) {
      pluginList = [pluginList];
    }
    // Inflate registered bundles. A bundle is just a name that points to an
    // array of other plugin names.
    pluginList = pluginList.map(function (plugin) {
      if (_.isString(plugin)) {
        if (_.isArray(pluginRegistry[plugin])) {
          return pluginRegistry[plugin];
        }
      }
      return plugin;
    });
    // Flatten any bundles, so we end up with a flat array of plugin names.
    pluginList = _.flatten(pluginList);
    return pluginList.map(function (plugin) {
      return this.require(plugin);
    }.bind(this));
  };

  // Given a prefix, return a map of all instantiated plugins with that prefix.
  Plugin.prototype.requireAllOf = function (prefix) {
    var map = {};

    if (pluginGroups[prefix]) {
      pluginGroups[prefix].forEach(function (name) {
        map[name] = this.require(name);
      }.bind(this));
    }

    return map;
  };

  // ## Formatic factory, continued...

  // Grab a plugin from the cache, or load it fresh from the registry.
  var loadPlugin = function (name, pluginConfig) {
    var plugin;

    // We can also load anonymous plugins.
    if (_.isFunction(name)) {

      var factory = name;

      if (_.isUndefined(factory.__exports__)) {
        pluginId++;
        plugin = Plugin('anonymous_plugin_' + pluginId, pluginConfig || {});
        factory(plugin);
        // Store the exports on the anonymous function so we know it's already
        // been instantiated, and we can just grab the exports.
        factory.__exports__ = plugin.exports;
      }

      // Load the cached exports.
      return factory.__exports__;

    } else if (_.isUndefined(pluginCache[name])) {

      if (!pluginConfig && config[name]) {
        if (config[name].plugin) {
          return loadPlugin(config[name].plugin, config[name] || {});
        }
      }

      if (pluginRegistry[name]) {
        if (_.isFunction(pluginRegistry[name])) {
          plugin = Plugin(name, pluginConfig || config[name]);
          pluginRegistry[name](plugin);
          pluginCache[name] = plugin.exports;
        } else {
          throw new Error('Plugin ' + name + ' is not a function.');
        }
      } else {
        throw new Error('Plugin ' + name + ' not found.');
      }
    }
    return pluginCache[name];
  };

  // Assign `formatic` to a function that takes form options and returns a form.
  formatic = function (options) {
    return formatic.form(options);
  };

  // Allow global plugin registry from the formatic function instance.
  formatic.register = function (name, pluginInitFn) {
    registerPlugin(name, pluginInitFn);
    return formatic;
  };

  // Allow retrieving plugins from the formatic function instance.
  formatic.plugin = function (name) {
    return loadPlugin(name);
  };

  // Allow creating a new formatic instance from a formatic instance.
  formatic.create = Formatic;

  // Use the core plugin to add methods to the formatic instance.
  var core = loadPlugin('core');

  core(formatic);

  // Now bind the component plugin. We wait till now, so the core is loaded
  // first.
  componentPlugin = loadPlugin('component');

  // Return the formatic function instance.
  return formatic;
};

// Just a helper to register a bunch of plugins.
var registerPlugins = function () {
  var arg = _.toArray(arguments);
  arg.forEach(function (arg) {
    var name = arg[0];
    var plugin = arg[1];
    registerPlugin(name, plugin);
  });
};

// Register all the built-in plugins.
registerPlugins(
  ['core', require('./default/core')],

  ['core.formatic', require('./core/formatic')],
  ['core.form-init', require('./core/form-init')],
  ['core.form', require('./core/form')],
  ['core.field', require('./core/field')],

  ['util', require('./default/util')],
  ['compiler', require('./default/compiler')],
  ['eval', require('./default/eval')],
  ['eval-functions', require('./default/eval-functions')],
  ['loader', require('./default/loader')],
  ['field-router', require('./default/field-router')],
  ['field-routes', require('./default/field-routes')],

  ['compiler.choices', require('./compilers/choices')],
  ['compiler.lookup', require('./compilers/lookup')],
  ['compiler.types', require('./compilers/types')],
  ['compiler.prop-aliases', require('./compilers/prop-aliases')],

  ['store.memory', require('./store/memory')],

  ['type.root', require('./types/root')],
  ['type.string', require('./types/string')],
  ['type.object', require('./types/object')],
  ['type.boolean', require('./types/boolean')],
  ['type.array', require('./types/array')],
  ['type.json', require('./types/json')],
  ['type.number', require('./types/number')],

  ['component', require('./default/component')],

  ['component.formatic', require('./components/formatic')],
  ['component.root', require('./components/root')],
  ['component.field', require('./components/field')],
  ['component.label', require('./components/label')],
  ['component.help', require('./components/help')],
  ['component.sample', require('./components/sample')],
  ['component.fieldset', require('./components/fieldset')],
  ['component.text', require('./components/text')],
  ['component.textarea', require('./components/textarea')],
  ['component.select', require('./components/select')],
  ['component.list', require('./components/list')],
  ['component.list-control', require('./components/list-control')],
  ['component.list-item', require('./components/list-item')],
  ['component.list-item-value', require('./components/list-item-value')],
  ['component.list-item-control', require('./components/list-item-control')],
  ['component.item-choices', require('./components/item-choices')],
  ['component.add-item', require('./components/add-item')],
  ['component.remove-item', require('./components/remove-item')],
  ['component.move-item-back', require('./components/move-item-back')],
  ['component.move-item-forward', require('./components/move-item-forward')],
  ['component.json', require('./components/json')],
  ['component.checkbox-list', require('./components/checkbox-list')],
  ['component.pretty-textarea', require('./components/pretty-textarea')],

  ['mixin.click-outside', require('./mixins/click-outside')],
  ['mixin.field', require('./mixins/field')],
  ['mixin.input-actions', require('./mixins/input-actions')],
  ['mixin.resize', require('./mixins/resize')],
  ['mixin.undo-stack', require('./mixins/undo-stack')],

  ['bootstrap-style', require('./plugins/bootstrap-style')],
  ['default-style', require('./plugins/default-style')]
);

// Create the default formatic instance.
var defaultFormatic = Formatic();

// Export it!
module.exports = defaultFormatic;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./compilers/choices":1,"./compilers/lookup":2,"./compilers/prop-aliases":3,"./compilers/types":4,"./components/add-item":5,"./components/checkbox-list":6,"./components/field":7,"./components/fieldset":8,"./components/formatic":9,"./components/help":10,"./components/item-choices":11,"./components/json":12,"./components/label":13,"./components/list":18,"./components/list-control":14,"./components/list-item":17,"./components/list-item-control":15,"./components/list-item-value":16,"./components/move-item-back":19,"./components/move-item-forward":20,"./components/pretty-textarea":21,"./components/remove-item":22,"./components/root":23,"./components/sample":24,"./components/select":25,"./components/text":26,"./components/textarea":27,"./core/field":28,"./core/form":30,"./core/form-init":29,"./core/formatic":31,"./default/compiler":32,"./default/component":33,"./default/core":34,"./default/eval":36,"./default/eval-functions":35,"./default/field-router":37,"./default/field-routes":38,"./default/loader":39,"./default/util":40,"./mixins/click-outside":42,"./mixins/field":43,"./mixins/input-actions":44,"./mixins/resize":45,"./mixins/undo-stack":46,"./plugins/bootstrap-style":47,"./plugins/default-style":48,"./store/memory":49,"./types/array":50,"./types/boolean":51,"./types/json":52,"./types/number":53,"./types/object":54,"./types/root":55,"./types/string":56}],42:[function(require,module,exports){
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

var hasAncestor = function (child, parent) {
  if (child.parentNode === parent) {
    return true;
  }
  if (child.parentNode === child.parentNode) {
    return false;
  }
  if (child.parentNode === null) {
    return false;
  }
  return hasAncestor(child.parentNode, parent);
};

var isOutside = function (nodeOut, nodeIn) {
  if (nodeOut === nodeIn) {
    return false;
  }
  if (hasAncestor(nodeOut, nodeIn)) {
    return false;
  }
  return true;
};

var onClickDocument = function (event) {
  Object.keys(this.clickOutsideHandlers).forEach(function (ref) {
    if (this.clickOutsideHandlers[ref].length > 0) {
      if (isOutside(event.target, this.refs[ref].getDOMNode())) {
        this.clickOutsideHandlers[ref].forEach(function (fn) {
          fn.call(this, ref);
        }.bind(this));
      }
    }
  }.bind(this));
};

module.exports = function (plugin) {

  plugin.exports = {

    setOnClickOutside: function (ref, fn) {
      if (!this.clickOutsideHandlers[ref]) {
        this.clickOutsideHandlers[ref] = [];
      }
      this.clickOutsideHandlers[ref].push(fn);
    },

    componentDidMount: function () {
      this.clickOutsideHandlers = {};
      document.addEventListener('click', onClickDocument.bind(this));
    },

    componentWillUnmount: function () {
      this.clickOutsideHandlers = {};
      document.removeEventListener('click', onClickDocument.bind(this));
    }
  };
};

},{}],43:[function(require,module,exports){
(function (global){
// # mixin.field

/*
Wrap up your fields with this mixin to get:
- Automatic metadata loading.
- Anything else decided later.
*/

'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = function (plugin) {

  plugin.exports = {

    loadNeededMeta: function (props) {
      if (props.field && props.field.form) {
        if (props.field.def.needsMeta && props.field.def.needsMeta.length > 0) {

          var needsMeta = [];

          props.field.def.needsMeta.forEach(function (args) {
            if (_.isArray(args) && args.length > 0) {
              if (_.isArray(args[0])) {
                args.forEach(function (args) {
                  needsMeta.push(args);
                });
              } else {
                needsMeta.push(args);
              }
            }
          });

          if (needsMeta.length === 0) {
            // Must just be a single need, and not an array.
            needsMeta = [props.field.def.needsMeta];
          }

          needsMeta.forEach(function (needs) {
            if (needs) {
              props.field.form.loadMeta.apply(props.field.form, needs);
            }
          });
        }
      }
    },

    componentDidMount: function () {
      this.loadNeededMeta(this.props);
    },

    componentWillReceiveProps: function (nextProps) {
      this.loadNeededMeta(nextProps);
    },

    componentWillUnmount: function () {
      // Removing this as it's a bad idea, because unmounting a component is not
      // always a signal to remove the field. Will have to find a better way.

      // if (this.props.field) {
      //   this.props.field.erase();
      // }
    }
  };
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],44:[function(require,module,exports){
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

},{}],45:[function(require,module,exports){
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
  }
};

var onResize = function (ref, fn) {
  fn(ref);
};

module.exports = function (plugin) {

  plugin.exports = {

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
};

},{}],46:[function(require,module,exports){
// # mixin.undo-stack

/*
Gives your component an undo stack.
*/

// http://prometheusresearch.github.io/react-forms/examples/undo.html

'use strict';

var UndoStack = {
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

module.exports = function (plugin) {
  plugin.exports = UndoStack;
};

},{}],47:[function(require,module,exports){
(function (global){
// # bootstrap

/*
The bootstrap plugin bundle exports a bunch of "prop modifier" plugins which
manipulate the props going into many of the components.
*/

'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

var modifiers = {

  'field': {className: 'form-group'},
  'help': {className: 'help-block'},
  'sample': {className: 'help-block'},
  'text': {className: 'form-control'},
  'textarea': {className: 'form-control'},
  'pretty-textarea': {className: 'form-control'},
  'json': {className: 'form-control'},
  'select': {className: 'form-control'},
  //'list': {className: 'well'},
  'list-control': {className: 'form-inline'},
  'list-item': {className: 'well'},
  'item-choices': {className: 'form-control'},
  'add-item': {className: 'glyphicon glyphicon-plus', label: ''},
  'remove-item': {className: 'glyphicon glyphicon-remove', label: ''},
  'move-item-back': {className: 'glyphicon glyphicon-arrow-up', label: ''},
  'move-item-forward': {className: 'glyphicon glyphicon-arrow-down', label: ''}
};

// Build the plugin bundle.
_.each(modifiers, function (modifier, name) {

  exports['component-props.' + name + '.bootstrap'] = function (plugin) {

    var util = plugin.require('util');

    plugin.exports = [
      name,
      function (props) {
        if (!_.isUndefined(modifier.className)) {
          props.className = util.className(props.className, modifier.className);
        }
        if (!_.isUndefined(modifier.label)) {
          props.label = modifier.label;
        }
      }
    ];
  };

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],48:[function(require,module,exports){
(function (global){
// # default-style

/*
The default-style plugin bundle exports a bunch of "prop modifier" plugins which
manipulate the props going into many of the components.
*/

'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

var modifiers = {

  'field': {},
  'help': {},
  'sample': {},
  'text': {},
  'textarea': {},
  'pretty-textarea': {},
  'json': {},
  'select': {},
  'list': {},
  'list-control': {},
  'list-item-control': {},
  'list-item-value': {},
  'list-item': {},
  'item-choices': {},
  'add-item': {},
  'remove-item': {},
  'move-item-back': {},
  'move-item-forward': {}
};

// Build the plugin bundle.
_.each(modifiers, function (modifier, name) {

  exports['component-props.' + name + '.default'] = function (plugin) {

    var util = plugin.require('util');

    plugin.exports = [
      name,
      function (props) {
        props.className = util.className(props.className, name);
      }
    ];
  };

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],49:[function(require,module,exports){
(function (global){
// # store.memory

/*
The memory store plugin keeps the state of fields, data, and metadata. It
responds to actions and emits a change event if there are any changes.
*/

'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = function (plugin) {

  var compiler = plugin.require('compiler');
  var util = plugin.require('util');

  plugin.exports = function (form, emitter, options) {

    var store = {};

    store.fields = [];
    store.templateMap = {};
    store.value = {};
    store.meta = {};

    // Helper to setup fields. Field definitions need to be expanded, compiled,
    // etc.
    var setupFields = function (fields) {
      store.fields = compiler.expandFields(fields);
      store.fields = compiler.compileFields(store.fields);
      store.templateMap = compiler.templateMap(store.fields);
      store.fields = store.fields.filter(function (def) {
        return !def.template;
      });
    };

    if (options.fields) {
      setupFields(options.fields);
    }

    if (!_.isUndefined(options.value)) {
      store.value = util.copyValue(options.value);
    }

    // Currently, just a single event for any change.
    var update = function () {
      emitter.emit('change', {
        value: store.value,
        meta: store.meta,
        fields: store.fields
      });
    };

    // When fields change, we need to "inflate" them, meaning expand them and
    // run any evaluations in order to get the default value out.
    store.inflate = function () {
      var field = form.field();
      field.inflate(function (path, value) {
        store.value = util.setIn(store.value, path, value);
      });
    };

    var actions = {

      // Set value at a path.
      setValue: function (path, value) {

        if (_.isUndefined(value)) {
          value = path;
          path = [];
        }
        if (path.length === 0) {
          store.value = util.copyValue(value);
          store.inflate();
        } else {
          store.value = util.setIn(store.value, path, value);
        }
        update();
      },

      // Remove a value at a path.
      removeValue: function (path) {

        store.value = util.removeIn(store.value, path);

        update();
      },

      // Erase a value. User actions can remove values, but nodes can also
      // disappear due to changing evaluations. This action occurs automatically
      // (and may be unnecessary if the value was already removed).
      eraseValue: function (path) {

        store.value = util.removeIn(store.value, path);

        update();
      },

      // Append a value to an array at a path.
      appendValue: function (path, value) {
        store.value = util.appendIn(store.value, path, value);

        update();
      },

      // Swap values of two keys.
      moveValue: function (path, fromKey, toKey) {
        store.value = util.moveIn(store.value, path, fromKey, toKey);

        update();
      },

      // Change all the fields.
      setFields: function (fields) {
        setupFields(fields);
        store.inflate();

        update();
      },

      // Set a metadata value for a key.
      setMeta: function (key, value) {
        store.meta[key] = value;
        update();
      }
    };

    _.extend(store, actions);

    return store;
  };
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],50:[function(require,module,exports){
(function (global){
// # type.array

/*
Support array type where child fields are dynamically determined based on the
values of the array.
*/

'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = function (plugin) {

  plugin.exports.default = [];

  plugin.exports.fields = function (field) {

    if (_.isArray(field.value)) {
      return field.value.map(function (value, i) {
        var item = field.itemForValue(value);
        item.key = i;
        return field.createChild(item);
      });
    } else {
      return [];
    }
  };
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],51:[function(require,module,exports){
// # type.boolean

/*
Support a true/false value.
*/

'use strict';

module.exports = function (plugin) {

  plugin.exports.default = false;

  plugin.exports.compile = function (def) {
    if (!def.choices) {
      def.choices = [
        {value: true, label: 'Yes'},
        {value: false, label: 'No'}
      ];
    }
  };
};

},{}],52:[function(require,module,exports){
// # type.json

/*
Arbitrary JSON value.
*/

'use strict';

module.exports = function (plugin) {

  plugin.exports.default = null;

};

},{}],53:[function(require,module,exports){
// # type.number

/*
Support number values, of course.
*/

'use strict';

module.exports = function (plugin) {

  plugin.exports.default = 0;

};

},{}],54:[function(require,module,exports){
(function (global){
// # type.object

/*
Support for object types. Object fields can supply static child fields, or if
there are additional child keys, dynamic child fields will be created much
like an array.
*/

'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = function (plugin) {

  var util = plugin.require('util');

  plugin.exports.default = {};

  plugin.exports.fields = function (field) {

    var fields = [];
    var value = field.value;
    var unusedKeys = _.keys(value);

    if (field.def.fields) {

      fields = field.def.fields.map(function (def) {
        var child = field.createChild(def);
        if (!util.isBlank(child.def.key)) {
          unusedKeys = _.without(unusedKeys, child.def.key);
        }
        return child;
      });
    }

    if (unusedKeys.length > 0) {
      unusedKeys.forEach(function (key) {
        var item = field.itemForValue(value[key]);
        item.label = util.humanize(key);
        item.key = key;
        fields.push(field.createChild(item));
      });
    }

    return fields;
  };
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],55:[function(require,module,exports){
// # type.root

/*
Special type representing the root of the form. Gets the fields directly from
the store.
*/

'use strict';

module.exports = function (plugin) {

  plugin.exports.fields = function (field) {

    return field.form.store.fields.map(function (def) {
      return field.createChild(def);
    });

  };
};

},{}],56:[function(require,module,exports){
// # type.string

/*
Support string values, of course.
*/

'use strict';

module.exports = function (plugin) {

  plugin.exports.default = '';

};

},{}],57:[function(require,module,exports){
'use strict';

/**
 * Representation of a single EventEmitter function.
 *
 * @param {Function} fn Event handler to be called.
 * @param {Mixed} context Context for function execution.
 * @param {Boolean} once Only emit once
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal EventEmitter interface that is molded against the Node.js
 * EventEmitter interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() { /* Nothing to set */ }

/**
 * Holds the assigned EventEmitters by name.
 *
 * @type {Object}
 * @private
 */
EventEmitter.prototype._events = undefined;

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @returns {Array}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event) {
  if (!this._events || !this._events[event]) return [];

  for (var i = 0, l = this._events[event].length, ee = []; i < l; i++) {
    ee.push(this._events[event][i].fn);
  }

  return ee;
};

/**
 * Emit an event to all registered event listeners.
 *
 * @param {String} event The name of the event.
 * @returns {Boolean} Indication if we've emitted an event.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  if (!this._events || !this._events[event]) return false;

  var listeners = this._events[event]
    , length = listeners.length
    , len = arguments.length
    , ee = listeners[0]
    , args
    , i, j;

  if (1 === length) {
    if (ee.once) this.removeListener(event, ee.fn, true);

    switch (len) {
      case 1: return ee.fn.call(ee.context), true;
      case 2: return ee.fn.call(ee.context, a1), true;
      case 3: return ee.fn.call(ee.context, a1, a2), true;
      case 4: return ee.fn.call(ee.context, a1, a2, a3), true;
      case 5: return ee.fn.call(ee.context, a1, a2, a3, a4), true;
      case 6: return ee.fn.call(ee.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    ee.fn.apply(ee.context, args);
  } else {
    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Functon} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  if (!this._events) this._events = {};
  if (!this._events[event]) this._events[event] = [];
  this._events[event].push(new EE( fn, context || this ));

  return this;
};

/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  if (!this._events) this._events = {};
  if (!this._events[event]) this._events[event] = [];
  this._events[event].push(new EE(fn, context || this, true ));

  return this;
};

/**
 * Remove event listeners.
 *
 * @param {String} event The event we want to remove.
 * @param {Function} fn The listener that we need to find.
 * @param {Boolean} once Only remove once listeners.
 * @api public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, once) {
  if (!this._events || !this._events[event]) return this;

  var listeners = this._events[event]
    , events = [];

  if (fn) for (var i = 0, length = listeners.length; i < length; i++) {
    if (listeners[i].fn !== fn && listeners[i].once !== once) {
      events.push(listeners[i]);
    }
  }

  //
  // Reset the array, or remove it completely if we have no more listeners.
  //
  if (events.length) this._events[event] = events;
  else this._events[event] = null;

  return this;
};

/**
 * Remove all listeners or only the listeners for the specified event.
 *
 * @param {String} event The event want to remove all listeners for.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  if (!this._events) return this;

  if (event) this._events[event] = null;
  else this._events = {};

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the module.
//
EventEmitter.EventEmitter = EventEmitter;
EventEmitter.EventEmitter2 = EventEmitter;
EventEmitter.EventEmitter3 = EventEmitter;

if ('object' === typeof module && module.exports) {
  module.exports = EventEmitter;
}

},{}],"formatic":[function(require,module,exports){
module.exports = require('./lib/formatic');

},{"./lib/formatic":41}]},{},[])("formatic")
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvY29tcGlsZXJzL2Nob2ljZXMuanMiLCJsaWIvY29tcGlsZXJzL2xvb2t1cC5qcyIsImxpYi9jb21waWxlcnMvcHJvcC1hbGlhc2VzLmpzIiwibGliL2NvbXBpbGVycy90eXBlcy5qcyIsImxpYi9jb21wb25lbnRzL2FkZC1pdGVtLmpzIiwibGliL2NvbXBvbmVudHMvY2hlY2tib3gtbGlzdC5qcyIsImxpYi9jb21wb25lbnRzL2ZpZWxkLmpzIiwibGliL2NvbXBvbmVudHMvZmllbGRzZXQuanMiLCJsaWIvY29tcG9uZW50cy9mb3JtYXRpYy5qcyIsImxpYi9jb21wb25lbnRzL2hlbHAuanMiLCJsaWIvY29tcG9uZW50cy9pdGVtLWNob2ljZXMuanMiLCJsaWIvY29tcG9uZW50cy9qc29uLmpzIiwibGliL2NvbXBvbmVudHMvbGFiZWwuanMiLCJsaWIvY29tcG9uZW50cy9saXN0LWNvbnRyb2wuanMiLCJsaWIvY29tcG9uZW50cy9saXN0LWl0ZW0tY29udHJvbC5qcyIsImxpYi9jb21wb25lbnRzL2xpc3QtaXRlbS12YWx1ZS5qcyIsImxpYi9jb21wb25lbnRzL2xpc3QtaXRlbS5qcyIsImxpYi9jb21wb25lbnRzL2xpc3QuanMiLCJsaWIvY29tcG9uZW50cy9tb3ZlLWl0ZW0tYmFjay5qcyIsImxpYi9jb21wb25lbnRzL21vdmUtaXRlbS1mb3J3YXJkLmpzIiwibGliL2NvbXBvbmVudHMvcHJldHR5LXRleHRhcmVhLmpzIiwibGliL2NvbXBvbmVudHMvcmVtb3ZlLWl0ZW0uanMiLCJsaWIvY29tcG9uZW50cy9yb290LmpzIiwibGliL2NvbXBvbmVudHMvc2FtcGxlLmpzIiwibGliL2NvbXBvbmVudHMvc2VsZWN0LmpzIiwibGliL2NvbXBvbmVudHMvdGV4dC5qcyIsImxpYi9jb21wb25lbnRzL3RleHRhcmVhLmpzIiwibGliL2NvcmUvZmllbGQuanMiLCJsaWIvY29yZS9mb3JtLWluaXQuanMiLCJsaWIvY29yZS9mb3JtLmpzIiwibGliL2NvcmUvZm9ybWF0aWMuanMiLCJsaWIvZGVmYXVsdC9jb21waWxlci5qcyIsImxpYi9kZWZhdWx0L2NvbXBvbmVudC5qcyIsImxpYi9kZWZhdWx0L2NvcmUuanMiLCJsaWIvZGVmYXVsdC9ldmFsLWZ1bmN0aW9ucy5qcyIsImxpYi9kZWZhdWx0L2V2YWwuanMiLCJsaWIvZGVmYXVsdC9maWVsZC1yb3V0ZXIuanMiLCJsaWIvZGVmYXVsdC9maWVsZC1yb3V0ZXMuanMiLCJsaWIvZGVmYXVsdC9sb2FkZXIuanMiLCJsaWIvZGVmYXVsdC91dGlsLmpzIiwibGliL2Zvcm1hdGljLmpzIiwibGliL21peGlucy9jbGljay1vdXRzaWRlLmpzIiwibGliL21peGlucy9maWVsZC5qcyIsImxpYi9taXhpbnMvaW5wdXQtYWN0aW9ucy5qcyIsImxpYi9taXhpbnMvcmVzaXplLmpzIiwibGliL21peGlucy91bmRvLXN0YWNrLmpzIiwibGliL3BsdWdpbnMvYm9vdHN0cmFwLXN0eWxlLmpzIiwibGliL3BsdWdpbnMvZGVmYXVsdC1zdHlsZS5qcyIsImxpYi9zdG9yZS9tZW1vcnkuanMiLCJsaWIvdHlwZXMvYXJyYXkuanMiLCJsaWIvdHlwZXMvYm9vbGVhbi5qcyIsImxpYi90eXBlcy9qc29uLmpzIiwibGliL3R5cGVzL251bWJlci5qcyIsImxpYi90eXBlcy9vYmplY3QuanMiLCJsaWIvdHlwZXMvcm9vdC5qcyIsImxpYi90eXBlcy9zdHJpbmcuanMiLCJub2RlX21vZHVsZXMvZXZlbnRlbWl0dGVyMy9pbmRleC5qcyIsImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25VQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbFRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwV0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1TUE7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBpbGVyLmNob2ljZXNcblxuLypcbk5vcm1hbGl6ZXMgdGhlIGNob2ljZXMgZm9yIGEgZmllbGQuIFN1cHBvcnRzIHRoZSBmb2xsb3dpbmcgZm9ybWF0cy5cblxuYGBganNcbidyZWQsIGJsdWUnXG5cblsncmVkJywgJ2JsdWUnXVxuXG57cmVkOiAnUmVkJywgYmx1ZTogJ0JsdWUnfVxuXG5be3ZhbHVlOiAncmVkJywgbGFiZWw6ICdSZWQnfSwge3ZhbHVlOiAnYmx1ZScsIGxhYmVsOiAnQmx1ZSd9XVxuYGBgXG5cbkFsbCBvZiB0aG9zZSBmb3JtYXRzIGFyZSBub3JtYWxpemVkIHRvOlxuXG5gYGBqc1xuW3t2YWx1ZTogJ3JlZCcsIGxhYmVsOiAnUmVkJ30sIHt2YWx1ZTogJ2JsdWUnLCBsYWJlbDogJ0JsdWUnfV1cbmBgYFxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgdmFyIHV0aWwgPSBwbHVnaW4ucmVxdWlyZSgndXRpbCcpO1xuXG4gIHZhciBjb21waWxlQ2hvaWNlcyA9IGZ1bmN0aW9uIChjaG9pY2VzKSB7XG5cbiAgICAvLyBDb252ZXJ0IGNvbW1hIHNlcGFyYXRlZCBzdHJpbmcgdG8gYXJyYXkgb2Ygc3RyaW5ncy5cbiAgICBpZiAoXy5pc1N0cmluZyhjaG9pY2VzKSkge1xuICAgICAgY2hvaWNlcyA9IGNob2ljZXMuc3BsaXQoJywnKTtcbiAgICB9XG5cbiAgICAvLyBDb252ZXJ0IG9iamVjdCB0byBhcnJheSBvZiBvYmplY3RzIHdpdGggYHZhbHVlYCBhbmQgYGxhYmVsYCBwcm9wZXJ0aWVzLlxuICAgIGlmICghXy5pc0FycmF5KGNob2ljZXMpICYmIF8uaXNPYmplY3QoY2hvaWNlcykpIHtcbiAgICAgIGNob2ljZXMgPSBPYmplY3Qua2V5cyhjaG9pY2VzKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHZhbHVlOiBrZXksXG4gICAgICAgICAgbGFiZWw6IGNob2ljZXNba2V5XVxuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQ29weSB0aGUgYXJyYXkgb2YgY2hvaWNlcyBzbyB3ZSBjYW4gbWFuaXB1bGF0ZSB0aGVtLlxuICAgIGNob2ljZXMgPSBjaG9pY2VzLnNsaWNlKDApO1xuXG4gICAgLy8gQXJyYXkgb2YgY2hvaWNlIGFycmF5cyBzaG91bGQgYmUgZmxhdHRlbmVkLlxuICAgIGNob2ljZXMgPSBfLmZsYXR0ZW4oY2hvaWNlcyk7XG5cbiAgICBjaG9pY2VzLmZvckVhY2goZnVuY3Rpb24gKGNob2ljZSwgaSkge1xuICAgICAgLy8gQ29udmVydCBhbnkgc3RyaW5nIGNob2ljZXMgdG8gb2JqZWN0cyB3aXRoIGB2YWx1ZWAgYW5kIGBsYWJlbGBcbiAgICAgIC8vIHByb3BlcnRpZXMuXG4gICAgICBpZiAoXy5pc1N0cmluZyhjaG9pY2UpKSB7XG4gICAgICAgIGNob2ljZXNbaV0gPSB7XG4gICAgICAgICAgdmFsdWU6IGNob2ljZSxcbiAgICAgICAgICBsYWJlbDogdXRpbC5odW1hbml6ZShjaG9pY2UpXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAoIWNob2ljZXNbaV0ubGFiZWwpIHtcbiAgICAgICAgY2hvaWNlc1tpXS5sYWJlbCA9IHV0aWwuaHVtYW5pemUoY2hvaWNlc1tpXS52YWx1ZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY2hvaWNlcztcbiAgfTtcblxuICBwbHVnaW4uZXhwb3J0cy5jb21waWxlID0gZnVuY3Rpb24gKGRlZikge1xuICAgIGlmIChkZWYuY2hvaWNlcyA9PT0gJycpIHtcbiAgICAgIGRlZi5jaG9pY2VzID0gW107XG4gICAgfSBlbHNlIGlmIChkZWYuY2hvaWNlcykge1xuXG4gICAgICBkZWYuY2hvaWNlcyA9IGNvbXBpbGVDaG9pY2VzKGRlZi5jaG9pY2VzKTtcbiAgICB9XG5cbiAgICBpZiAoZGVmLnJlcGxhY2VDaG9pY2VzID09PSAnJykge1xuICAgICAgZGVmLnJlcGxhY2VDaG9pY2VzID0gW107XG4gICAgfSBlbHNlIGlmIChkZWYucmVwbGFjZUNob2ljZXMpIHtcblxuICAgICAgZGVmLnJlcGxhY2VDaG9pY2VzID0gY29tcGlsZUNob2ljZXMoZGVmLnJlcGxhY2VDaG9pY2VzKTtcblxuICAgICAgZGVmLnJlcGxhY2VDaG9pY2VzTGFiZWxzID0ge307XG5cbiAgICAgIGRlZi5yZXBsYWNlQ2hvaWNlcy5mb3JFYWNoKGZ1bmN0aW9uIChjaG9pY2UpIHtcbiAgICAgICAgZGVmLnJlcGxhY2VDaG9pY2VzTGFiZWxzW2Nob2ljZS52YWx1ZV0gPSBjaG9pY2UubGFiZWw7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIvLyAjIGNvbXBpbGVyLmxvb2t1cFxuXG4vKlxuQ29udmVydCBhIGxvb2t1cCBkZWNsYXJhdGlvbiB0byBhbiBldmFsdWF0aW9uLiBBIGxvb2t1cCBwcm9wZXJ0eSBpcyB1c2VkIGxpa2U6XG5cbmBgYGpzXG57XG4gIHR5cGU6ICdzdHJpbmcnLFxuICBrZXk6ICdzdGF0ZXMnLFxuICBsb29rdXA6IHtzb3VyY2U6ICdsb2NhdGlvbnMnLCBrZXlzOiBbJ2NvdW50cnknXX1cbn1cbmBgYFxuXG5Mb2dpY2FsbHksIHRoZSBhYm92ZSB3aWxsIHVzZSB0aGUgYGNvdW50cnlgIGtleSBvZiB0aGUgdmFsdWUgdG8gYXNrIHRoZVxuYGxvY2F0aW9uc2Agc291cmNlIGZvciBzdGF0ZXMgY2hvaWNlcy4gVGhpcyB3b3JrcyBieSBjb252ZXJ0aW5nIHRoZSBsb29rdXAgdG9cbnRoZSBmb2xsb3dpbmcgZXZhbHVhdGlvbi5cblxuYGBganNcbntcbiAgdHlwZTogJ3N0cmluZycsXG4gIGtleTogJ3N0YXRlcycsXG4gIGNob2ljZXM6IFtdLFxuICBldmFsOiB7XG4gICAgbmVlZHNNZXRhOiBbXG4gICAgICBbJ0BpZicsIFsnQGdldE1ldGEnLCAnbG9jYXRpb25zJywge2NvdW50cnk6IFsnQGdldCcsICdjb3VudHJ5J119XSwgbnVsbCwgWydsb2NhdGlvbnMnLCB7Y291bnRyeTogWydAZ2V0JywgJ2NvdW50cnknXX1dXVxuICAgIF0sXG4gICAgY2hvaWNlczogWydAZ2V0TWV0YScsICdsb2NhdGlvbnMnLCB7Y291bnRyeTogWydAZ2V0JywgJ2NvdW50cnknXX1dXG4gIH1cbn1cbmBgYFxuXG5UaGUgYWJvdmUgc2F5cyB0byBhZGQgYSBgbmVlZHNNZXRhYCBwcm9wZXJ0eSBpZiBuZWNlc3NhcnkgYW5kIGFkZCBhIGBjaG9pY2VzYFxuYXJyYXkgaWYgaXQncyBhdmFpbGFibGUuIE90aGVyd2lzZSwgY2hvaWNlcyB3aWxsIGRlZmF1bHQgdG8gYW4gZW1wdHkgYXJyYXkuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHZhciBhZGRMb29rdXAgPSBmdW5jdGlvbiAoZGVmLCBsb29rdXBQcm9wTmFtZSwgY2hvaWNlc1Byb3BOYW1lKSB7XG4gICAgdmFyIGxvb2t1cCA9IGRlZltsb29rdXBQcm9wTmFtZV07XG5cbiAgICBpZiAobG9va3VwKSB7XG4gICAgICBpZiAoIWRlZltjaG9pY2VzUHJvcE5hbWVdKSB7XG4gICAgICAgIGRlZltjaG9pY2VzUHJvcE5hbWVdID0gW107XG4gICAgICB9XG4gICAgICBpZiAoIWRlZi5ldmFsKSB7XG4gICAgICAgIGRlZi5ldmFsID0ge307XG4gICAgICB9XG4gICAgICBpZiAoIWRlZi5ldmFsLm5lZWRzTWV0YSkge1xuICAgICAgICBkZWYuZXZhbC5uZWVkc01ldGEgPSBbXTtcbiAgICAgIH1cbiAgICAgIHZhciBrZXlzID0gbG9va3VwLmtleXMgfHwgW107XG4gICAgICB2YXIgcGFyYW1zID0ge307XG4gICAgICB2YXIgbWV0YUFyZ3MsIG1ldGFHZXQ7XG5cbiAgICAgIGlmIChsb29rdXAuZ3JvdXApIHtcblxuICAgICAgICBrZXlzLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgIHBhcmFtc1trZXldID0gWydAZ2V0JywgJ2l0ZW0nLCBrZXldO1xuICAgICAgICB9KTtcbiAgICAgICAgbWV0YUFyZ3MgPSBbbG9va3VwLnNvdXJjZV0uY29uY2F0KHBhcmFtcyk7XG4gICAgICAgIG1ldGFHZXQgPSBbJ0BnZXRNZXRhJ10uY29uY2F0KG1ldGFBcmdzKTtcbiAgICAgICAgdmFyIG1ldGFGb3JFYWNoID0gWydAZm9yRWFjaCcsICdpdGVtJywgWydAZ2V0R3JvdXBWYWx1ZXMnLCBsb29rdXAuZ3JvdXBdXTtcbiAgICAgICAgZGVmLmV2YWwubmVlZHNNZXRhLnB1c2gobWV0YUZvckVhY2guY29uY2F0KFtcbiAgICAgICAgICBtZXRhQXJncyxcbiAgICAgICAgICBbJ0Bub3QnLCBtZXRhR2V0XVxuICAgICAgICBdKSk7XG4gICAgICAgIGRlZi5ldmFsW2Nob2ljZXNQcm9wTmFtZV0gPSBtZXRhRm9yRWFjaC5jb25jYXQoW1xuICAgICAgICAgIG1ldGFHZXQsXG4gICAgICAgICAgbWV0YUdldFxuICAgICAgICBdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGtleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgcGFyYW1zW2tleV0gPSBbJ0BnZXQnLCBrZXldO1xuICAgICAgICB9KTtcbiAgICAgICAgbWV0YUFyZ3MgPSBbbG9va3VwLnNvdXJjZV0uY29uY2F0KHBhcmFtcyk7XG4gICAgICAgIG1ldGFHZXQgPSBbJ0BnZXRNZXRhJ10uY29uY2F0KG1ldGFBcmdzKTtcbiAgICAgICAgZGVmLmV2YWwubmVlZHNNZXRhLnB1c2goWydAaWYnLCBtZXRhR2V0LCBudWxsLCBtZXRhQXJnc10pO1xuICAgICAgICBkZWYuZXZhbFtjaG9pY2VzUHJvcE5hbWVdID0gbWV0YUdldDtcbiAgICAgIH1cblxuICAgICAgZGVsZXRlIGRlZltsb29rdXBQcm9wTmFtZV07XG4gICAgfVxuICB9O1xuXG4gIHBsdWdpbi5leHBvcnRzLmNvbXBpbGUgPSBmdW5jdGlvbiAoZGVmKSB7XG5cbiAgICBhZGRMb29rdXAoZGVmLCAnbG9va3VwJywgJ2Nob2ljZXMnKTtcbiAgICBhZGRMb29rdXAoZGVmLCAnbG9va3VwUmVwbGFjZW1lbnRzJywgJ3JlcGxhY2VDaG9pY2VzJyk7XG4gIH07XG59O1xuIiwiLy8gIyBjb21waWxlcnMucHJvcC1hbGlhc2VzXG5cbi8qXG5BbGlhcyBzb21lIHByb3BlcnRpZXMgdG8gb3RoZXIgcHJvcGVydGllcy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgdmFyIHByb3BBbGlhc2VzID0ge1xuICAgIGhlbHBfdGV4dDogJ2hlbHBUZXh0J1xuICB9O1xuXG4gIHBsdWdpbi5leHBvcnRzLmNvbXBpbGUgPSBmdW5jdGlvbiAoZGVmKSB7XG4gICAgT2JqZWN0LmtleXMocHJvcEFsaWFzZXMpLmZvckVhY2goZnVuY3Rpb24gKGFsaWFzKSB7XG4gICAgICB2YXIgcHJvcE5hbWUgPSBwcm9wQWxpYXNlc1thbGlhc107XG4gICAgICBpZiAodHlwZW9mIGRlZltwcm9wTmFtZV0gPT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBkZWZbYWxpYXNdICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBkZWZbcHJvcE5hbWVdID0gZGVmW2FsaWFzXTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbn07XG4iLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBpbGVycy50eXBlc1xuXG4vKlxuQ29udmVydCBzb21lIGhpZ2gtbGV2ZWwgdHlwZXMgdG8gbG93LWxldmVsIHR5cGVzIGFuZCBwcm9wZXJ0aWVzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgLy8gTWFwIGhpZ2gtbGV2ZWwgdHlwZSB0byBsb3ctbGV2ZWwgdHlwZS4gSWYgYSBmdW5jdGlvbiBpcyBzdXBwbGllZCwgY2FuXG4gIC8vIG1vZGlmeSB0aGUgZmllbGQgZGVmaW5pdGlvbi5cbiAgdmFyIHR5cGVDb2VyY2UgPSB7XG4gICAgdW5pY29kZTogZnVuY3Rpb24gKGRlZikge1xuICAgICAgZGVmLnR5cGUgPSAnc3RyaW5nJztcbiAgICAgIGRlZi5tYXhSb3dzID0gMTtcbiAgICB9LFxuICAgIHRleHQ6ICdzdHJpbmcnLFxuICAgIHNlbGVjdDogZnVuY3Rpb24gKGRlZikge1xuICAgICAgZGVmLmNob2ljZXMgPSBkZWYuY2hvaWNlcyB8fCBbXTtcbiAgICB9LFxuICAgIGJvb2w6ICdib29sZWFuJyxcbiAgICBkaWN0OiAnb2JqZWN0JyxcbiAgICBkZWNpbWFsOiAnbnVtYmVyJ1xuICB9O1xuXG4gIHR5cGVDb2VyY2Uuc3RyID0gdHlwZUNvZXJjZS51bmljb2RlO1xuXG5cbiAgcGx1Z2luLmV4cG9ydHMuY29tcGlsZSA9IGZ1bmN0aW9uIChkZWYpIHtcblxuICAgIHZhciBjb2VyY2VUeXBlID0gdHlwZUNvZXJjZVtkZWYudHlwZV07XG4gICAgaWYgKGNvZXJjZVR5cGUpIHtcbiAgICAgIGlmIChfLmlzU3RyaW5nKGNvZXJjZVR5cGUpKSB7XG4gICAgICAgIGRlZi50eXBlID0gY29lcmNlVHlwZTtcbiAgICAgIH0gZWxzZSBpZiAoXy5pc0Z1bmN0aW9uKGNvZXJjZVR5cGUpKSB7XG4gICAgICAgIGRlZiA9IGNvZXJjZVR5cGUoZGVmKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC5hZGQtaXRlbVxuXG4vKlxuVGhlIGFkZCBidXR0b24gdG8gYXBwZW5kIGFuIGl0ZW0gdG8gYSBmaWVsZC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWUsXG4gICAgICAgIGxhYmVsOiBwbHVnaW4uY29uZmlnVmFsdWUoJ2xhYmVsJywgJ1thZGRdJylcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIFIuc3Bhbih7Y2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZSwgb25DbGljazogdGhpcy5wcm9wcy5vbkNsaWNrfSwgdGhpcy5wcm9wcy5sYWJlbCk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50LmNoZWNrYm94LWxpc3RcblxuLypcblVzZWQgd2l0aCBhcnJheSB2YWx1ZXMgdG8gc3VwcGx5IG11bHRpcGxlIGNoZWNrYm94ZXMgZm9yIGFkZGluZyBtdWx0aXBsZVxuZW51bWVyYXRlZCB2YWx1ZXMgdG8gYW4gYXJyYXkuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBtaXhpbnM6IFtwbHVnaW4ucmVxdWlyZSgnbWl4aW4uZmllbGQnKV0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAvLyBHZXQgYWxsIHRoZSBjaGVja2VkIGNoZWNrYm94ZXMgYW5kIGNvbnZlcnQgdG8gYW4gYXJyYXkgb2YgdmFsdWVzLlxuICAgICAgdmFyIGNob2ljZU5vZGVzID0gdGhpcy5yZWZzLmNob2ljZXMuZ2V0RE9NTm9kZSgpLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbnB1dCcpO1xuICAgICAgY2hvaWNlTm9kZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChjaG9pY2VOb2RlcywgMCk7XG4gICAgICB2YXIgdmFsdWVzID0gY2hvaWNlTm9kZXMubWFwKGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgIHJldHVybiBub2RlLmNoZWNrZWQgPyBub2RlLnZhbHVlIDogbnVsbDtcbiAgICAgIH0pLmZpbHRlcihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfSk7XG4gICAgICB0aGlzLnByb3BzLmZpZWxkLnZhbCh2YWx1ZXMpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgICAgdmFyIGNob2ljZXMgPSBmaWVsZC5kZWYuY2hvaWNlcyB8fCBbXTtcblxuICAgICAgdmFyIGlzSW5saW5lID0gIV8uZmluZChjaG9pY2VzLCBmdW5jdGlvbiAoY2hvaWNlKSB7XG4gICAgICAgIHJldHVybiBjaG9pY2Uuc2FtcGxlO1xuICAgICAgfSk7XG5cbiAgICAgIHZhciB2YWx1ZSA9IGZpZWxkLnZhbHVlIHx8IFtdO1xuXG4gICAgICByZXR1cm4gcGx1Z2luLmNvbXBvbmVudCgnZmllbGQnKSh7XG4gICAgICAgIGZpZWxkOiBmaWVsZFxuICAgICAgfSxcbiAgICAgICAgUi5kaXYoe2NsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWUsIHJlZjogJ2Nob2ljZXMnfSxcbiAgICAgICAgICBjaG9pY2VzLm1hcChmdW5jdGlvbiAoY2hvaWNlLCBpKSB7XG5cbiAgICAgICAgICAgIHZhciBpbnB1dEZpZWxkID0gUi5zcGFuKHtzdHlsZToge3doaXRlU3BhY2U6ICdub3dyYXAnfX0sXG4gICAgICAgICAgICAgIFIuaW5wdXQoe1xuICAgICAgICAgICAgICAgIG5hbWU6IGZpZWxkLmRlZi5rZXksXG4gICAgICAgICAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogY2hvaWNlLnZhbHVlLFxuICAgICAgICAgICAgICAgIGNoZWNrZWQ6IHZhbHVlLmluZGV4T2YoY2hvaWNlLnZhbHVlKSA+PSAwID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlXG4gICAgICAgICAgICAgICAgLy9vbkZvY3VzOiB0aGlzLnByb3BzLmFjdGlvbnMuZm9jdXNcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICcgJyxcbiAgICAgICAgICAgICAgUi5zcGFuKHtjbGFzc05hbWU6ICdmaWVsZC1jaG9pY2UtbGFiZWwnfSxcbiAgICAgICAgICAgICAgICBjaG9pY2UubGFiZWxcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgaWYgKGlzSW5saW5lKSB7XG4gICAgICAgICAgICAgIHJldHVybiBSLnNwYW4oe2tleTogaSwgY2xhc3NOYW1lOiAnZmllbGQtY2hvaWNlJ30sXG4gICAgICAgICAgICAgICAgaW5wdXRGaWVsZCwgJyAnXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4gUi5kaXYoe2tleTogaSwgY2xhc3NOYW1lOiAnZmllbGQtY2hvaWNlJ30sXG4gICAgICAgICAgICAgICAgaW5wdXRGaWVsZCwgJyAnLFxuICAgICAgICAgICAgICAgIHBsdWdpbi5jb21wb25lbnQoJ3NhbXBsZScpKHtmaWVsZDogZmllbGQsIGNob2ljZTogY2hvaWNlfSlcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50LmZpZWxkXG5cbi8qXG5Vc2VkIGJ5IGFueSBmaWVsZHMgdG8gcHV0IHRoZSBsYWJlbCBhbmQgaGVscCB0ZXh0IGFyb3VuZCB0aGUgZmllbGQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY29sbGFwc2VkOiB0aGlzLnByb3BzLmZpZWxkLmRlZi5jb2xsYXBzZWQgPyB0cnVlIDogZmFsc2VcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGlzQ29sbGFwc2libGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICAgIHJldHVybiAhXy5pc1VuZGVmaW5lZChmaWVsZC5kZWYuY29sbGFwc2VkKSB8fCAhXy5pc1VuZGVmaW5lZChmaWVsZC5kZWYuY29sbGFwc2libGUpO1xuICAgIH0sXG5cbiAgICBvbkNsaWNrTGFiZWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBjb2xsYXBzZWQ6ICF0aGlzLnN0YXRlLmNvbGxhcHNlZFxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgICB2YXIgaW5kZXggPSB0aGlzLnByb3BzLmluZGV4O1xuICAgICAgaWYgKCFfLmlzTnVtYmVyKGluZGV4KSkge1xuICAgICAgICBpbmRleCA9IF8uaXNOdW1iZXIoZmllbGQuZGVmLmtleSkgPyBmaWVsZC5kZWYua2V5IDogdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWUsIHN0eWxlOiB7ZGlzcGxheTogKGZpZWxkLmhpZGRlbigpID8gJ25vbmUnIDogJycpfX0sXG4gICAgICAgIHBsdWdpbi5jb21wb25lbnQoJ2xhYmVsJykoe2ZpZWxkOiBmaWVsZCwgaW5kZXg6IGluZGV4LCBvbkNsaWNrOiB0aGlzLmlzQ29sbGFwc2libGUoKSA/IHRoaXMub25DbGlja0xhYmVsIDogbnVsbH0pLFxuICAgICAgICBSZWFjdC5hZGRvbnMuQ1NTVHJhbnNpdGlvbkdyb3VwKHt0cmFuc2l0aW9uTmFtZTogJ3JldmVhbCd9LFxuICAgICAgICAgIHRoaXMuc3RhdGUuY29sbGFwc2VkID8gW10gOiBbXG4gICAgICAgICAgICBwbHVnaW4uY29tcG9uZW50KCdoZWxwJykoe2tleTogJ2hlbHAnLCBmaWVsZDogZmllbGR9KSxcbiAgICAgICAgICAgIHRoaXMucHJvcHMuY2hpbGRyZW5cbiAgICAgICAgICBdXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50LmZpZWxkc2V0XG5cbi8qXG5SZW5kZXIgbXVsdGlwbGUgY2hpbGQgZmllbGRzIGZvciBhIGZpZWxkLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGRpc3BsYXlOYW1lOiBwbHVnaW4ubmFtZSxcblxuICAgIG1peGluczogW3BsdWdpbi5yZXF1aXJlKCdtaXhpbi5maWVsZCcpXSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgICByZXR1cm4gcGx1Z2luLmNvbXBvbmVudCgnZmllbGQnKSh7XG4gICAgICAgIGZpZWxkOiBmaWVsZFxuICAgICAgfSxcbiAgICAgICAgUi5maWVsZHNldCh7Y2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZX0sXG4gICAgICAgICAgZmllbGQuZmllbGRzKCkubWFwKGZ1bmN0aW9uIChmaWVsZCwgaSkge1xuICAgICAgICAgICAgcmV0dXJuIGZpZWxkLmNvbXBvbmVudCh7a2V5OiBmaWVsZC5kZWYua2V5IHx8IGl9KTtcbiAgICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50LmZvcm1hdGljXG5cbi8qXG5Ub3AtbGV2ZWwgY29tcG9uZW50IHdoaWNoIGdldHMgYSBmb3JtIGFuZCB0aGVuIGxpc3RlbnMgdG8gdGhlIGZvcm0gZm9yIGNoYW5nZXMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZGlzcGxheU5hbWU6IHBsdWdpbi5uYW1lLFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBmaWVsZDogdGhpcy5wcm9wcy5mb3JtLmZpZWxkKClcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBmb3JtID0gdGhpcy5wcm9wcy5mb3JtO1xuICAgICAgZm9ybS5vbignY2hhbmdlJywgdGhpcy5vbkZvcm1DaGFuZ2VkKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBmb3JtID0gdGhpcy5wcm9wcy5mb3JtO1xuICAgICAgZm9ybS5vZmYoJ2NoYW5nZScsIHRoaXMub25Gb3JtQ2hhbmdlZCk7XG4gICAgfSxcblxuICAgIG9uRm9ybUNoYW5nZWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4gICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UodGhpcy5wcm9wcy5mb3JtLnZhbCgpKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBmaWVsZDogdGhpcy5wcm9wcy5mb3JtLmZpZWxkKClcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiAnZm9ybWF0aWMnfSxcbiAgICAgICAgdGhpcy5zdGF0ZS5maWVsZC5jb21wb25lbnQoKVxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQuaGVscFxuXG4vKlxuSnVzdCB0aGUgaGVscCB0ZXh0IGJsb2NrLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGRpc3BsYXlOYW1lOiBwbHVnaW4ubmFtZSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICAgIHJldHVybiBmaWVsZC5kZWYuaGVscFRleHQgP1xuICAgICAgICBSLmRpdih7Y2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZX0sXG4gICAgICAgICAgZmllbGQuZGVmLmhlbHBUZXh0XG4gICAgICAgICkgOlxuICAgICAgICBSLnNwYW4obnVsbCk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50Lml0ZW0tY2hvaWNlc1xuXG4vKlxuR2l2ZSBhIGxpc3Qgb2YgY2hvaWNlcyBvZiBpdGVtIHR5cGVzIHRvIGNyZWF0ZSBhcyBjaGlsZHJlbiBvZiBhbiBmaWVsZC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIHRoaXMucHJvcHMub25TZWxlY3QocGFyc2VJbnQoZXZlbnQudGFyZ2V0LnZhbHVlKSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgICB2YXIgdHlwZUNob2ljZXMgPSBudWxsO1xuICAgICAgaWYgKGZpZWxkLml0ZW1zKCkubGVuZ3RoID4gMCkge1xuICAgICAgICB0eXBlQ2hvaWNlcyA9IFIuc2VsZWN0KHtjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lLCB2YWx1ZTogdGhpcy52YWx1ZSwgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2V9LFxuICAgICAgICAgIGZpZWxkLml0ZW1zKCkubWFwKGZ1bmN0aW9uIChpdGVtLCBpKSB7XG4gICAgICAgICAgICByZXR1cm4gUi5vcHRpb24oe2tleTogaSwgdmFsdWU6IGl9LCBpdGVtLmxhYmVsIHx8IGkpO1xuICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0eXBlQ2hvaWNlcyA/IHR5cGVDaG9pY2VzIDogUi5zcGFuKG51bGwpO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC5qc29uXG5cbi8qXG5UZXh0YXJlYSBlZGl0b3IgZm9yIEpTT04uIFdpbGwgdmFsaWRhdGUgdGhlIEpTT04gYmVmb3JlIHNldHRpbmcgdGhlIHZhbHVlLCBzb1xud2hpbGUgdGhlIHZhbHVlIGlzIGludmFsaWQsIG5vIGV4dGVybmFsIHN0YXRlIGNoYW5nZXMgd2lsbCBvY2N1ci5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBtaXhpbnM6IFtwbHVnaW4ucmVxdWlyZSgnbWl4aW4uZmllbGQnKV0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWUsXG4gICAgICAgIHJvd3M6IHBsdWdpbi5jb25maWcucm93cyB8fCA1XG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBpc1ZhbGlkVmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuXG4gICAgICB0cnkge1xuICAgICAgICBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpc1ZhbGlkOiB0cnVlLFxuICAgICAgICB2YWx1ZTogSlNPTi5zdHJpbmdpZnkodGhpcy5wcm9wcy5maWVsZC52YWx1ZSlcbiAgICAgIH07XG4gICAgfSxcblxuICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIHZhciBpc1ZhbGlkID0gdGhpcy5pc1ZhbGlkVmFsdWUoZXZlbnQudGFyZ2V0LnZhbHVlKTtcblxuICAgICAgaWYgKGlzVmFsaWQpIHtcbiAgICAgICAgLy8gTmVlZCB0byBoYW5kbGUgdGhpcyBiZXR0ZXIuIE5lZWQgdG8gdHJhY2sgcG9zaXRpb24uXG4gICAgICAgIHRoaXMuX2lzQ2hhbmdpbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLnByb3BzLmZpZWxkLnZhbChKU09OLnBhcnNlKGV2ZW50LnRhcmdldC52YWx1ZSkpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgaXNWYWxpZDogaXNWYWxpZCxcbiAgICAgICAgdmFsdWU6IGV2ZW50LnRhcmdldC52YWx1ZVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXh0UHJvcHMpIHtcbiAgICAgIGlmICghdGhpcy5faXNDaGFuZ2luZykge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBpc1ZhbGlkOiB0cnVlLFxuICAgICAgICAgIHZhbHVlOiBKU09OLnN0cmluZ2lmeShuZXh0UHJvcHMuZmllbGQudmFsdWUsIG51bGwsIDIpXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgdGhpcy5faXNDaGFuZ2luZyA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgICAgcmV0dXJuIHBsdWdpbi5jb21wb25lbnQoJ2ZpZWxkJykoe1xuICAgICAgICBmaWVsZDogZmllbGRcbiAgICAgIH0sIFIudGV4dGFyZWEoe1xuICAgICAgICAgIGNsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWUsXG4gICAgICAgICAgdmFsdWU6IHRoaXMuc3RhdGUudmFsdWUsXG4gICAgICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsXG4gICAgICAgICAgc3R5bGU6IHtiYWNrZ3JvdW5kQ29sb3I6IHRoaXMuc3RhdGUuaXNWYWxpZCA/ICcnIDogJ3JnYigyNTUsMjAwLDIwMCknfSxcbiAgICAgICAgICByb3dzOiBmaWVsZC5kZWYucm93cyB8fCB0aGlzLnByb3BzLnJvd3NcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50LmxhYmVsXG5cbi8qXG5KdXN0IHRoZSBsYWJlbCBmb3IgYSBmaWVsZC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgICB2YXIgbGFiZWwgPSBudWxsO1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLnByb3BzLmluZGV4ID09PSAnbnVtYmVyJykge1xuICAgICAgICBsYWJlbCA9ICcnICsgKHRoaXMucHJvcHMuaW5kZXggKyAxKSArICcuJztcbiAgICAgICAgaWYgKGZpZWxkLmRlZi5sYWJlbCkge1xuICAgICAgICAgIGxhYmVsID0gbGFiZWwgKyAnICcgKyBmaWVsZC5kZWYubGFiZWw7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGZpZWxkLmRlZi5sYWJlbCB8fCBsYWJlbCkge1xuICAgICAgICB2YXIgdGV4dCA9IGxhYmVsIHx8IGZpZWxkLmRlZi5sYWJlbDtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25DbGljaykge1xuICAgICAgICAgIHRleHQgPSBSLmEoe2hyZWY6ICdKYXZhU2NyaXB0JyArICc6Jywgb25DbGljazogdGhpcy5wcm9wcy5vbkNsaWNrfSwgdGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgbGFiZWwgPSBSLmxhYmVsKHt9LCB0ZXh0KTtcbiAgICAgIH1cblxuICAgICAgdmFyIHJlcXVpcmVkID0gUi5zcGFuKHtjbGFzc05hbWU6ICdyZXF1aXJlZC10ZXh0J30pO1xuXG4gICAgICByZXR1cm4gUi5kaXYoe1xuICAgICAgICBjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lXG4gICAgICB9LFxuICAgICAgICBsYWJlbCxcbiAgICAgICAgJyAnLFxuICAgICAgICByZXF1aXJlZFxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQubGlzdC1jb250cm9sXG5cbi8qXG5SZW5kZXIgdGhlIGl0ZW0gdHlwZSBjaG9pY2VzIGFuZCB0aGUgYWRkIGJ1dHRvbi5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaXRlbUluZGV4OiAwXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBvblNlbGVjdDogZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgaXRlbUluZGV4OiBpbmRleFxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIG9uQXBwZW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnByb3BzLm9uQXBwZW5kKHRoaXMuc3RhdGUuaXRlbUluZGV4KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICAgIHZhciB0eXBlQ2hvaWNlcyA9IG51bGw7XG5cbiAgICAgIGlmIChmaWVsZC5pdGVtcygpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdHlwZUNob2ljZXMgPSBwbHVnaW4uY29tcG9uZW50KCdpdGVtLWNob2ljZXMnKSh7ZmllbGQ6IGZpZWxkLCB2YWx1ZTogdGhpcy5zdGF0ZS5pdGVtSW5kZXgsIG9uU2VsZWN0OiB0aGlzLm9uU2VsZWN0fSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZX0sXG4gICAgICAgIHR5cGVDaG9pY2VzLCAnICcsXG4gICAgICAgIHBsdWdpbi5jb21wb25lbnQoJ2FkZC1pdGVtJykoe29uQ2xpY2s6IHRoaXMub25BcHBlbmR9KVxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQubGlzdC1pdGVtLWNvbnRyb2xcblxuLypcblJlbmRlciB0aGUgcmVtb3ZlIGFuZCBtb3ZlIGJ1dHRvbnMgZm9yIGEgZmllbGQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZGlzcGxheU5hbWU6IHBsdWdpbi5uYW1lLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBvbk1vdmVCYWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnByb3BzLm9uTW92ZSh0aGlzLnByb3BzLmluZGV4LCB0aGlzLnByb3BzLmluZGV4IC0gMSk7XG4gICAgfSxcblxuICAgIG9uTW92ZUZvcndhcmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMucHJvcHMub25Nb3ZlKHRoaXMucHJvcHMuaW5kZXgsIHRoaXMucHJvcHMuaW5kZXggKyAxKTtcbiAgICB9LFxuXG4gICAgb25SZW1vdmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMucHJvcHMub25SZW1vdmUodGhpcy5wcm9wcy5pbmRleCk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lfSxcbiAgICAgICAgcGx1Z2luLmNvbXBvbmVudCgncmVtb3ZlLWl0ZW0nKSh7ZmllbGQ6IGZpZWxkLCBvbkNsaWNrOiB0aGlzLm9uUmVtb3ZlfSksXG4gICAgICAgIHRoaXMucHJvcHMuaW5kZXggPiAwID8gcGx1Z2luLmNvbXBvbmVudCgnbW92ZS1pdGVtLWJhY2snKSh7b25DbGljazogdGhpcy5vbk1vdmVCYWNrfSkgOiBudWxsLFxuICAgICAgICB0aGlzLnByb3BzLmluZGV4IDwgKHRoaXMucHJvcHMubnVtSXRlbXMgLSAxKSA/IHBsdWdpbi5jb21wb25lbnQoJ21vdmUtaXRlbS1mb3J3YXJkJykoe29uQ2xpY2s6IHRoaXMub25Nb3ZlRm9yd2FyZH0pIDogbnVsbFxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQubGlzdC1pdGVtLXZhbHVlXG5cbi8qXG5SZW5kZXIgdGhlIHZhbHVlIG9mIGEgbGlzdCBpdGVtLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGRpc3BsYXlOYW1lOiBwbHVnaW4ubmFtZSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWV9LFxuICAgICAgICBmaWVsZC5jb21wb25lbnQoKVxuICAgICAgICAvLyBwbHVnaW4uY29tcG9uZW50KCdmaWVsZCcpKHtcbiAgICAgICAgLy8gICBmaWVsZDogZmllbGQsXG4gICAgICAgIC8vICAgaW5kZXg6IHRoaXMucHJvcHMuaW5kZXhcbiAgICAgICAgLy8gfSxcbiAgICAgICAgLy8gICBmaWVsZC5jb21wb25lbnQoKVxuICAgICAgICAvLyApXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC5saXN0LWl0ZW1cblxuLypcblJlbmRlciBhIGxpc3QgaXRlbS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lfSxcbiAgICAgICAgcGx1Z2luLmNvbXBvbmVudCgnbGlzdC1pdGVtLXZhbHVlJykoe2Zvcm06IHRoaXMucHJvcHMuZm9ybSwgZmllbGQ6IGZpZWxkLCBpbmRleDogdGhpcy5wcm9wcy5pbmRleH0pLFxuICAgICAgICBwbHVnaW4uY29tcG9uZW50KCdsaXN0LWl0ZW0tY29udHJvbCcpKHtmaWVsZDogZmllbGQsIGluZGV4OiB0aGlzLnByb3BzLmluZGV4LCBudW1JdGVtczogdGhpcy5wcm9wcy5udW1JdGVtcywgb25Nb3ZlOiB0aGlzLnByb3BzLm9uTW92ZSwgb25SZW1vdmU6IHRoaXMucHJvcHMub25SZW1vdmV9KVxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQubGlzdFxuXG4vKlxuUmVuZGVyIGEgbGlzdC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBtaXhpbnM6IFtwbHVnaW4ucmVxdWlyZSgnbWl4aW4uZmllbGQnKV0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIG5leHRMb29rdXBJZDogMCxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICAvLyBOZWVkIHRvIGNyZWF0ZSBhcnRpZmljaWFsIGtleXMgZm9yIHRoZSBhcnJheS4gSW5kZXhlcyBhcmUgbm90IGdvb2Qga2V5cyxcbiAgICAgIC8vIHNpbmNlIHRoZXkgY2hhbmdlLiBTbywgbWFwIGVhY2ggcG9zaXRpb24gdG8gYW4gYXJ0aWZpY2lhbCBrZXlcbiAgICAgIHZhciBsb29rdXBzID0gW107XG4gICAgICB0aGlzLnByb3BzLmZpZWxkLmZpZWxkcygpLmZvckVhY2goZnVuY3Rpb24gKGZpZWxkLCBpKSB7XG4gICAgICAgIGxvb2t1cHNbaV0gPSAnXycgKyB0aGlzLm5leHRMb29rdXBJZDtcbiAgICAgICAgdGhpcy5uZXh0TG9va3VwSWQrKztcbiAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxvb2t1cHM6IGxvb2t1cHNcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXdQcm9wcykge1xuXG4gICAgICB2YXIgbG9va3VwcyA9IHRoaXMuc3RhdGUubG9va3VwcztcbiAgICAgIHZhciBmaWVsZHMgPSBuZXdQcm9wcy5maWVsZC5maWVsZHMoKTtcblxuICAgICAgLy8gTmVlZCB0byBzZXQgYXJ0aWZpY2lhbCBrZXlzIGZvciBuZXcgYXJyYXkgaXRlbXMuXG4gICAgICBpZiAoZmllbGRzLmxlbmd0aCA+IGxvb2t1cHMubGVuZ3RoKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSBsb29rdXBzLmxlbmd0aDsgaSA8IGZpZWxkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGxvb2t1cHNbaV0gPSAnXycgKyB0aGlzLm5leHRMb29rdXBJZDtcbiAgICAgICAgICB0aGlzLm5leHRMb29rdXBJZCsrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBsb29rdXBzOiBsb29rdXBzXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgb25BcHBlbmQ6IGZ1bmN0aW9uIChpdGVtSW5kZXgpIHtcbiAgICAgIHRoaXMucHJvcHMuZmllbGQuYXBwZW5kKGl0ZW1JbmRleCk7XG4gICAgfSxcbiAgICAvL1xuICAgIC8vIG9uQ2xpY2tMYWJlbDogZnVuY3Rpb24gKGkpIHtcbiAgICAvLyAgIGlmICh0aGlzLnByb3BzLmZpZWxkLmNvbGxhcHNhYmxlSXRlbXMpIHtcbiAgICAvLyAgICAgdmFyIGNvbGxhcHNlZDtcbiAgICAvLyAgICAgLy8gaWYgKCF0aGlzLnN0YXRlLmNvbGxhcHNlZFtpXSkge1xuICAgIC8vICAgICAvLyAgIGNvbGxhcHNlZCA9IHRoaXMuc3RhdGUuY29sbGFwc2VkO1xuICAgIC8vICAgICAvLyAgIGNvbGxhcHNlZFtpXSA9IHRydWU7XG4gICAgLy8gICAgIC8vICAgdGhpcy5zZXRTdGF0ZSh7Y29sbGFwc2VkOiBjb2xsYXBzZWR9KTtcbiAgICAvLyAgICAgLy8gfSBlbHNlIHtcbiAgICAvLyAgICAgLy8gICBjb2xsYXBzZWQgPSB0aGlzLnByb3BzLmZpZWxkLmZpZWxkcy5tYXAoZnVuY3Rpb24gKCkge1xuICAgIC8vICAgICAvLyAgICAgcmV0dXJuIHRydWU7XG4gICAgLy8gICAgIC8vICAgfSk7XG4gICAgLy8gICAgIC8vICAgY29sbGFwc2VkW2ldID0gZmFsc2U7XG4gICAgLy8gICAgIC8vICAgdGhpcy5zZXRTdGF0ZSh7Y29sbGFwc2VkOiBjb2xsYXBzZWR9KTtcbiAgICAvLyAgICAgLy8gfVxuICAgIC8vICAgICBjb2xsYXBzZWQgPSB0aGlzLnN0YXRlLmNvbGxhcHNlZDtcbiAgICAvLyAgICAgY29sbGFwc2VkW2ldID0gIWNvbGxhcHNlZFtpXTtcbiAgICAvLyAgICAgdGhpcy5zZXRTdGF0ZSh7Y29sbGFwc2VkOiBjb2xsYXBzZWR9KTtcbiAgICAvLyAgIH1cbiAgICAvLyB9LFxuICAgIC8vXG4gICAgb25SZW1vdmU6IGZ1bmN0aW9uIChpKSB7XG4gICAgICB2YXIgbG9va3VwcyA9IHRoaXMuc3RhdGUubG9va3VwcztcbiAgICAgIGxvb2t1cHMuc3BsaWNlKGksIDEpO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGxvb2t1cHM6IGxvb2t1cHNcbiAgICAgIH0pO1xuICAgICAgdGhpcy5wcm9wcy5maWVsZC5yZW1vdmUoaSk7XG4gICAgfSxcbiAgICAvL1xuICAgIG9uTW92ZTogZnVuY3Rpb24gKGZyb21JbmRleCwgdG9JbmRleCkge1xuICAgICAgdmFyIGxvb2t1cHMgPSB0aGlzLnN0YXRlLmxvb2t1cHM7XG4gICAgICB2YXIgZnJvbUlkID0gbG9va3Vwc1tmcm9tSW5kZXhdO1xuICAgICAgdmFyIHRvSWQgPSBsb29rdXBzW3RvSW5kZXhdO1xuICAgICAgbG9va3Vwc1tmcm9tSW5kZXhdID0gdG9JZDtcbiAgICAgIGxvb2t1cHNbdG9JbmRleF0gPSBmcm9tSWQ7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgbG9va3VwczogbG9va3Vwc1xuICAgICAgfSk7XG4gICAgICB0aGlzLnByb3BzLmZpZWxkLm1vdmUoZnJvbUluZGV4LCB0b0luZGV4KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG4gICAgICB2YXIgZmllbGRzID0gZmllbGQuZmllbGRzKCk7XG5cbiAgICAgIHZhciBudW1JdGVtcyA9IGZpZWxkcy5sZW5ndGg7XG4gICAgICByZXR1cm4gcGx1Z2luLmNvbXBvbmVudCgnZmllbGQnKSh7XG4gICAgICAgIGZpZWxkOiBmaWVsZFxuICAgICAgfSxcbiAgICAgICAgUi5kaXYoe2NsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWV9LFxuICAgICAgICAgIFJlYWN0LmFkZG9ucy5DU1NUcmFuc2l0aW9uR3JvdXAoe3RyYW5zaXRpb25OYW1lOiAncmV2ZWFsJ30sXG4gICAgICAgICAgICBmaWVsZHMubWFwKGZ1bmN0aW9uIChjaGlsZCwgaSkge1xuICAgICAgICAgICAgICByZXR1cm4gcGx1Z2luLmNvbXBvbmVudCgnbGlzdC1pdGVtJykoe1xuICAgICAgICAgICAgICAgIGtleTogdGhpcy5zdGF0ZS5sb29rdXBzW2ldLFxuICAgICAgICAgICAgICAgIGZvcm06IHRoaXMucHJvcHMuZm9ybSxcbiAgICAgICAgICAgICAgICBmaWVsZDogY2hpbGQsXG4gICAgICAgICAgICAgICAgcGFyZW50OiBmaWVsZCxcbiAgICAgICAgICAgICAgICBpbmRleDogaSxcbiAgICAgICAgICAgICAgICBudW1JdGVtczogbnVtSXRlbXMsXG4gICAgICAgICAgICAgICAgb25Nb3ZlOiB0aGlzLm9uTW92ZSxcbiAgICAgICAgICAgICAgICBvblJlbW92ZTogdGhpcy5vblJlbW92ZVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgICApLFxuICAgICAgICAgIHBsdWdpbi5jb21wb25lbnQoJ2xpc3QtY29udHJvbCcpKHtmaWVsZDogZmllbGQsIG9uQXBwZW5kOiB0aGlzLm9uQXBwZW5kfSlcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQubW92ZS1pdGVtLWJhY2tcblxuLypcbkJ1dHRvbiB0byBtb3ZlIGFuIGl0ZW0gYmFja3dhcmRzIGluIGxpc3QuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZGlzcGxheU5hbWU6IHBsdWdpbi5uYW1lLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lLFxuICAgICAgICBsYWJlbDogcGx1Z2luLmNvbmZpZ1ZhbHVlKCdsYWJlbCcsICdbdXBdJylcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIFIuc3Bhbih7Y2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZSwgb25DbGljazogdGhpcy5wcm9wcy5vbkNsaWNrfSwgdGhpcy5wcm9wcy5sYWJlbCk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50Lm1vdmUtaXRlbS1mb3J3YXJkXG5cbi8qXG5CdXR0b24gdG8gbW92ZSBhbiBpdGVtIGZvcndhcmQgaW4gYSBsaXN0LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGRpc3BsYXlOYW1lOiBwbHVnaW4ubmFtZSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZSxcbiAgICAgICAgbGFiZWw6IHBsdWdpbi5jb25maWdWYWx1ZSgnbGFiZWwnLCAnW2Rvd25dJylcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIFIuc3Bhbih7Y2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZSwgb25DbGljazogdGhpcy5wcm9wcy5vbkNsaWNrfSwgdGhpcy5wcm9wcy5sYWJlbCk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50LnByZXR0eS10ZXh0YXJlYVxuXG4vKlxuVGV4dGFyZWEgdGhhdCB3aWxsIGRpc3BsYXkgaGlnaGxpZ2h0cyBiZWhpbmQgXCJ0YWdzXCIuIFRhZ3MgY3VycmVudGx5IG1lYW4gdGV4dFxudGhhdCBpcyBlbmNsb3NlZCBpbiBicmFjZXMgbGlrZSBge3tmb299fWAuIFRhZ3MgYXJlIHJlcGxhY2VkIHdpdGggbGFiZWxzIGlmXG5hdmFpbGFibGUgb3IgaHVtYW5pemVkLlxuXG5UaGlzIGNvbXBvbmVudCBpcyBxdWl0ZSBjb21wbGljYXRlZCBiZWNhdXNlOlxuLSBXZSBhcmUgZGlzcGxheWluZyB0ZXh0IGluIHRoZSB0ZXh0YXJlYSBidXQgaGF2ZSB0byBrZWVwIHRyYWNrIG9mIHRoZSByZWFsXG4gIHRleHQgdmFsdWUgaW4gdGhlIGJhY2tncm91bmQuIFdlIGNhbid0IHVzZSBhIGRhdGEgYXR0cmlidXRlLCBiZWNhdXNlIGl0J3MgYVxuICB0ZXh0YXJlYSwgc28gd2UgY2FuJ3QgdXNlIGFueSBlbGVtZW50cyBhdCBhbGwhXG4tIEJlY2F1c2Ugb2YgdGhlIGhpZGRlbiBkYXRhLCB3ZSBhbHNvIGhhdmUgdG8gZG8gc29tZSBpbnRlcmNlcHRpb24gb2ZcbiAgY29weSwgd2hpY2ggaXMgYSBsaXR0bGUgd2VpcmQuIFdlIGludGVyY2VwdCBjb3B5IGFuZCBjb3B5IHRoZSByZWFsIHRleHRcbiAgdG8gdGhlIGVuZCBvZiB0aGUgdGV4dGFyZWEuIFRoZW4gd2UgZXJhc2UgdGhhdCB0ZXh0LCB3aGljaCBsZWF2ZXMgdGhlIGNvcGllZFxuICBkYXRhIGluIHRoZSBidWZmZXIuXG4tIFJlYWN0IGxvc2VzIHRoZSBjYXJldCBwb3NpdGlvbiB3aGVuIHlvdSB1cGRhdGUgdGhlIHZhbHVlIHRvIHNvbWV0aGluZ1xuICBkaWZmZXJlbnQgdGhhbiBiZWZvcmUuIFNvIHdlIGhhdmUgdG8gcmV0YWluIHRyYWNraW5nIGluZm9ybWF0aW9uIGZvciB3aGVuXG4gIHRoYXQgaGFwcGVucy5cbi0gQmVjYXVzZSB3ZSBtb25rZXkgd2l0aCBjb3B5LCB3ZSBhbHNvIGhhdmUgdG8gZG8gb3VyIG93biB1bmRvL3JlZG8uIE90aGVyd2lzZVxuICB0aGUgZGVmYXVsdCB1bmRvIHdpbGwgaGF2ZSB3ZWlyZCBzdGF0ZXMgaW4gaXQuXG5cblNvIGdvb2QgbHVjayFcbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG52YXIgbm9CcmVhayA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUucmVwbGFjZSgvIC9nLCAnXFx1MDBhMCcpO1xufTtcblxudmFyIExFRlRfUEFEID0gJ1xcdTAwYTBcXHUwMGEwJztcbnZhciBSSUdIVF9QQUQgPSAnXFx1MDBhMFxcdTAwYTAnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICB2YXIgdXRpbCA9IHBsdWdpbi5yZXF1aXJlKCd1dGlsJyk7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBtaXhpbnM6IFtwbHVnaW4ucmVxdWlyZSgnbWl4aW4uZmllbGQnKSwgcGx1Z2luLnJlcXVpcmUoJ21peGluLnVuZG8tc3RhY2snKSwgcGx1Z2luLnJlcXVpcmUoJ21peGluLnJlc2l6ZScpXSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB1bmRvRGVwdGg6IDEwMFxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAvLyBOb3QgcXVpdGUgc3RhdGUsIHRoaXMgaXMgZm9yIHRyYWNraW5nIHNlbGVjdGlvbiBpbmZvLlxuICAgICAgdGhpcy50cmFja2luZyA9IHt9O1xuXG4gICAgICB2YXIgcGFydHMgPSB1dGlsLnBhcnNlVGV4dFdpdGhUYWdzKHRoaXMucHJvcHMuZmllbGQudmFsdWUpO1xuICAgICAgdmFyIHRva2VucyA9IHRoaXMudG9rZW5zKHBhcnRzKTtcbiAgICAgIHZhciBpbmRleE1hcCA9IHRoaXMuaW5kZXhNYXAodG9rZW5zKTtcblxuICAgICAgdGhpcy50cmFja2luZy5wb3MgPSBpbmRleE1hcC5sZW5ndGg7XG4gICAgICB0aGlzLnRyYWNraW5nLnJhbmdlID0gMDtcbiAgICAgIHRoaXMudHJhY2tpbmcudG9rZW5zID0gdG9rZW5zO1xuICAgICAgdGhpcy50cmFja2luZy5pbmRleE1hcCA9IGluZGV4TWFwO1xuICAgIH0sXG5cbiAgICBnZXRTdGF0ZVNuYXBzaG90OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB2YWx1ZTogdGhpcy5wcm9wcy5maWVsZC52YWx1ZSxcbiAgICAgICAgcG9zOiB0aGlzLnRyYWNraW5nLnBvcyxcbiAgICAgICAgcmFuZ2U6IHRoaXMudHJhY2tpbmcucmFuZ2VcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHNldFN0YXRlU25hcHNob3Q6IGZ1bmN0aW9uIChzbmFwc2hvdCkge1xuICAgICAgdGhpcy50cmFja2luZy5wb3MgPSBzbmFwc2hvdC5wb3M7XG4gICAgICB0aGlzLnRyYWNraW5nLnJhbmdlID0gc25hcHNob3QucmFuZ2U7XG4gICAgICB0aGlzLnByb3BzLmZpZWxkLnZhbChzbmFwc2hvdC52YWx1ZSk7XG4gICAgfSxcblxuICAgIC8vIFR1cm4gaW50byBpbmRpdmlkdWFsIGNoYXJhY3RlcnMgYW5kIHRhZ3NcbiAgICB0b2tlbnM6IGZ1bmN0aW9uIChwYXJ0cykge1xuICAgICAgcmV0dXJuIFtdLmNvbmNhdC5hcHBseShbXSwgcGFydHMubWFwKGZ1bmN0aW9uIChwYXJ0KSB7XG4gICAgICAgIGlmIChwYXJ0LnR5cGUgPT09ICd0YWcnKSB7XG4gICAgICAgICAgcmV0dXJuIHBhcnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHBhcnQudmFsdWUuc3BsaXQoJycpO1xuICAgICAgICB9XG4gICAgICB9KSk7XG4gICAgfSxcblxuICAgIC8vIE1hcCBlYWNoIHRleHRhcmVhIGluZGV4IGJhY2sgdG8gYSB0b2tlblxuICAgIGluZGV4TWFwOiBmdW5jdGlvbiAodG9rZW5zKSB7XG4gICAgICB2YXIgaW5kZXhNYXAgPSBbXTtcbiAgICAgIF8uZWFjaCh0b2tlbnMsIGZ1bmN0aW9uICh0b2tlbiwgdG9rZW5JbmRleCkge1xuICAgICAgICBpZiAodG9rZW4udHlwZSA9PT0gJ3RhZycpIHtcbiAgICAgICAgICB2YXIgbGFiZWwgPSBMRUZUX1BBRCArIG5vQnJlYWsodGhpcy5wcmV0dHlMYWJlbCh0b2tlbi52YWx1ZSkpICsgUklHSFRfUEFEO1xuICAgICAgICAgIHZhciBsYWJlbENoYXJzID0gbGFiZWwuc3BsaXQoJycpO1xuICAgICAgICAgIF8uZWFjaChsYWJlbENoYXJzLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpbmRleE1hcC5wdXNoKHRva2VuSW5kZXgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGluZGV4TWFwLnB1c2godG9rZW5JbmRleCk7XG4gICAgICAgIH1cbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICByZXR1cm4gaW5kZXhNYXA7XG4gICAgfSxcblxuICAgIC8vIE1ha2UgaGlnaGxpZ2h0IHNjcm9sbCBtYXRjaCB0ZXh0YXJlYSBzY3JvbGxcbiAgICBvblNjcm9sbDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5yZWZzLmhpZ2hsaWdodC5nZXRET01Ob2RlKCkuc2Nyb2xsVG9wID0gdGhpcy5yZWZzLmNvbnRlbnQuZ2V0RE9NTm9kZSgpLnNjcm9sbFRvcDtcbiAgICAgIHRoaXMucmVmcy5oaWdobGlnaHQuZ2V0RE9NTm9kZSgpLnNjcm9sbExlZnQgPSB0aGlzLnJlZnMuY29udGVudC5nZXRET01Ob2RlKCkuc2Nyb2xsTGVmdDtcbiAgICB9LFxuXG4gICAgLy8gR2l2ZW4gc29tZSBwb3N0aW9uLCByZXR1cm4gdGhlIHRva2VuIGluZGV4IChwb3NpdGlvbiBjb3VsZCBiZSBpbiB0aGUgbWlkZGxlIG9mIGEgdG9rZW4pXG4gICAgdG9rZW5JbmRleDogZnVuY3Rpb24gKHBvcywgdG9rZW5zLCBpbmRleE1hcCkge1xuICAgICAgaWYgKHBvcyA8IDApIHtcbiAgICAgICAgcG9zID0gMDtcbiAgICAgIH0gZWxzZSBpZiAocG9zID49IGluZGV4TWFwLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gdG9rZW5zLmxlbmd0aDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpbmRleE1hcFtwb3NdO1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAvL2NvbnNvbGUubG9nKCdjaGFuZ2U6JywgZXZlbnQudGFyZ2V0LnZhbHVlKTtcblxuICAgICAgdmFyIG5vZGUgPSBldmVudC50YXJnZXQ7XG5cbiAgICAgIC8vIFRyYWNraW5nIGlzIGhvbGRpbmcgcHJldmlvdXMgcG9zaXRpb24gYW5kIHJhbmdlXG4gICAgICB2YXIgcHJldlBvcyA9IHRoaXMudHJhY2tpbmcucG9zO1xuICAgICAgdmFyIHByZXZSYW5nZSA9IHRoaXMudHJhY2tpbmcucmFuZ2U7XG5cbiAgICAgIC8vIE5ldyBwb3NpdGlvblxuICAgICAgdmFyIHBvcyA9IG5vZGUuc2VsZWN0aW9uU3RhcnQ7XG5cbiAgICAgIC8vIEdvaW5nIHRvIG11dGF0ZSB0aGUgdG9rZW5zLlxuICAgICAgdmFyIHRva2VucyA9IHRoaXMudHJhY2tpbmcudG9rZW5zO1xuXG4gICAgICAvLyBVc2luZyB0aGUgcHJldmlvdXMgcG9zaXRpb24gYW5kIHJhbmdlLCBnZXQgdGhlIHByZXZpb3VzIHRva2VuIHBvc2l0aW9uXG4gICAgICAvLyBhbmQgcmFuZ2VcbiAgICAgIHZhciBwcmV2VG9rZW5JbmRleCA9IHRoaXMudG9rZW5JbmRleChwcmV2UG9zLCB0b2tlbnMsIHRoaXMudHJhY2tpbmcuaW5kZXhNYXApO1xuICAgICAgdmFyIHByZXZUb2tlbkVuZEluZGV4ID0gdGhpcy50b2tlbkluZGV4KHByZXZQb3MgKyBwcmV2UmFuZ2UsIHRva2VucywgdGhpcy50cmFja2luZy5pbmRleE1hcCk7XG4gICAgICB2YXIgcHJldlRva2VuUmFuZ2UgPSBwcmV2VG9rZW5FbmRJbmRleCAtIHByZXZUb2tlbkluZGV4O1xuXG4gICAgICAvLyBXaXBlIG91dCBhbnkgdG9rZW5zIGluIHRoZSBzZWxlY3RlZCByYW5nZSBiZWNhdXNlIHRoZSBjaGFuZ2Ugd291bGQgaGF2ZVxuICAgICAgLy8gZXJhc2VkIHRoYXQgc2VsZWN0aW9uLlxuICAgICAgaWYgKHByZXZUb2tlblJhbmdlID4gMCkge1xuICAgICAgICB0b2tlbnMuc3BsaWNlKHByZXZUb2tlbkluZGV4LCBwcmV2VG9rZW5SYW5nZSk7XG4gICAgICAgIHRoaXMudHJhY2tpbmcuaW5kZXhNYXAgPSB0aGlzLmluZGV4TWFwKHRva2Vucyk7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIGN1cnNvciBoYXMgbW92ZWQgZm9yd2FyZCwgdGhlbiB0ZXh0IHdhcyBhZGRlZC5cbiAgICAgIGlmIChwb3MgPiBwcmV2UG9zKSB7XG4gICAgICAgIHZhciBhZGRlZFRleHQgPSBub2RlLnZhbHVlLnN1YnN0cmluZyhwcmV2UG9zLCBwb3MpO1xuICAgICAgICAvLyBJbnNlcnQgdGhlIHRleHQgaW50byB0aGUgdG9rZW5zLlxuICAgICAgICB0b2tlbnMuc3BsaWNlKHByZXZUb2tlbkluZGV4LCAwLCBhZGRlZFRleHQpO1xuICAgICAgLy8gSWYgY3Vyc29yIGhhcyBtb3ZlZCBiYWNrd2FyZCwgdGhlbiB3ZSBkZWxldGVkIChiYWNrc3BhY2VkKSB0ZXh0XG4gICAgICB9IGlmIChwb3MgPCBwcmV2UG9zKSB7XG4gICAgICAgIHZhciB0b2tlbiA9IHRoaXMudG9rZW5BdChwb3MpO1xuICAgICAgICB2YXIgdG9rZW5CZWZvcmUgPSB0aGlzLnRva2VuQmVmb3JlKHBvcyk7XG4gICAgICAgIC8vIElmIHdlIG1vdmVkIGJhY2sgb250byBhIHRva2VuLCB0aGVuIHdlIHNob3VsZCBtb3ZlIGJhY2sgdG8gYmVnaW5uaW5nXG4gICAgICAgIC8vIG9mIHRva2VuLlxuICAgICAgICBpZiAodG9rZW4gPT09IHRva2VuQmVmb3JlKSB7XG4gICAgICAgICAgcG9zID0gdGhpcy5tb3ZlT2ZmVGFnKHBvcywgdG9rZW5zLCB0aGlzLmluZGV4TWFwKHRva2VucyksIC0xKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdG9rZW5JbmRleCA9IHRoaXMudG9rZW5JbmRleChwb3MsIHRva2VucywgdGhpcy50cmFja2luZy5pbmRleE1hcCk7XG4gICAgICAgIC8vIE5vdyB3ZSBjYW4gcmVtb3ZlIHRoZSB0b2tlbnMgdGhhdCB3ZXJlIGRlbGV0ZWQuXG4gICAgICAgIHRva2Vucy5zcGxpY2UodG9rZW5JbmRleCwgcHJldlRva2VuSW5kZXggLSB0b2tlbkluZGV4KTtcbiAgICAgIH1cblxuICAgICAgLy8gQ29udmVydCB0b2tlbnMgYmFjayBpbnRvIHJhdyB2YWx1ZSB3aXRoIHRhZ3MuIE5ld2x5IGZvcm1lZCB0YWdzIHdpbGxcbiAgICAgIC8vIGJlY29tZSBwYXJ0IG9mIHRoZSByYXcgdmFsdWUuXG4gICAgICB2YXIgcmF3VmFsdWUgPSB0aGlzLnJhd1ZhbHVlKHRva2Vucyk7XG5cbiAgICAgIHRoaXMudHJhY2tpbmcucG9zID0gcG9zO1xuICAgICAgdGhpcy50cmFja2luZy5yYW5nZSA9IDA7XG5cbiAgICAgIC8vIFNldCB0aGUgdmFsdWUgdG8gdGhlIG5ldyByYXcgdmFsdWUuXG4gICAgICB0aGlzLnByb3BzLmZpZWxkLnZhbChyYXdWYWx1ZSk7XG5cbiAgICAgIHRoaXMuc25hcHNob3QoKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkVXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgdmFsdWUgPSB0aGlzLnByb3BzLmZpZWxkLnZhbHVlIHx8ICcnO1xuICAgICAgdmFyIHBhcnRzID0gdXRpbC5wYXJzZVRleHRXaXRoVGFncyh2YWx1ZSk7XG4gICAgICB0aGlzLnRyYWNraW5nLnRva2VucyA9IHRoaXMudG9rZW5zKHBhcnRzKTtcbiAgICAgIHRoaXMudHJhY2tpbmcuaW5kZXhNYXAgPSB0aGlzLmluZGV4TWFwKHRoaXMudHJhY2tpbmcudG9rZW5zKTtcblxuICAgICAgdmFyIHBvcyA9IHRoaXMubm9ybWFsaXplUG9zaXRpb24odGhpcy50cmFja2luZy5wb3MpO1xuICAgICAgdmFyIHJhbmdlID0gdGhpcy50cmFja2luZy5yYW5nZTtcbiAgICAgIHZhciBlbmRQb3MgPSB0aGlzLm5vcm1hbGl6ZVBvc2l0aW9uKHBvcyArIHJhbmdlKTtcbiAgICAgIHJhbmdlID0gZW5kUG9zIC0gcG9zO1xuXG4gICAgICB0aGlzLnRyYWNraW5nLnBvcyA9IHBvcztcbiAgICAgIHRoaXMudHJhY2tpbmcucmFuZ2UgPSByYW5nZTtcblxuICAgICAgaWYgKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgPT09IHRoaXMucmVmcy5jb250ZW50LmdldERPTU5vZGUoKSkge1xuICAgICAgICAvLyBSZWFjdCBjYW4gbG9zZSB0aGUgc2VsZWN0aW9uLCBzbyBwdXQgaXQgYmFjay5cbiAgICAgICAgdGhpcy5yZWZzLmNvbnRlbnQuZ2V0RE9NTm9kZSgpLnNldFNlbGVjdGlvblJhbmdlKHBvcywgcG9zICsgcmFuZ2UpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBHZXQgdGhlIGxhYmVsIGZvciBhIGtleS5cbiAgICBwcmV0dHlMYWJlbDogZnVuY3Rpb24gKGtleSkge1xuICAgICAgaWYgKHRoaXMucHJvcHMuZmllbGQuZGVmLnJlcGxhY2VDaG9pY2VzTGFiZWxzW2tleV0pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMuZmllbGQuZGVmLnJlcGxhY2VDaG9pY2VzTGFiZWxzW2tleV07XG4gICAgICB9XG4gICAgICByZXR1cm4gdXRpbC5odW1hbml6ZShrZXkpO1xuICAgIH0sXG5cbiAgICAvLyBHaXZlbiB0aGUgYWN0dWFsIHZhbHVlIG9mIHRoZSBmaWVsZCAod2l0aCB0YWdzKSwgZ2V0IHRoZSBwbGFpbiB0ZXh0IHRoYXRcbiAgICAvLyBzaG91bGQgc2hvdyBpbiB0aGUgdGV4dGFyZWEuXG4gICAgcGxhaW5WYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB2YXIgcGFydHMgPSB1dGlsLnBhcnNlVGV4dFdpdGhUYWdzKHZhbHVlKTtcbiAgICAgIHJldHVybiBwYXJ0cy5tYXAoZnVuY3Rpb24gKHBhcnQpIHtcbiAgICAgICAgaWYgKHBhcnQudHlwZSA9PT0gJ3RleHQnKSB7XG4gICAgICAgICAgcmV0dXJuIHBhcnQudmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIExFRlRfUEFEICsgbm9CcmVhayh0aGlzLnByZXR0eUxhYmVsKHBhcnQudmFsdWUpKSArIFJJR0hUX1BBRDtcbiAgICAgICAgfVxuICAgICAgfS5iaW5kKHRoaXMpKS5qb2luKCcnKTtcbiAgICB9LFxuXG4gICAgLy8gR2l2ZW4gdGhlIGFjdHVhbCB2YWx1ZSBvZiB0aGUgZmllbGQgKHdpdGggdGFncyksIGdldCB0aGUgaHRtbCB1c2VkIHRvXG4gICAgLy8gaGlnaGxpZ2h0IHRoZSBsYWJlbHMuXG4gICAgcHJldHR5VmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgdmFyIHBhcnRzID0gdXRpbC5wYXJzZVRleHRXaXRoVGFncyh2YWx1ZSk7XG4gICAgICByZXR1cm4gcGFydHMubWFwKGZ1bmN0aW9uIChwYXJ0LCBpKSB7XG4gICAgICAgIGlmIChwYXJ0LnR5cGUgPT09ICd0ZXh0Jykge1xuICAgICAgICAgIGlmIChpID09PSAocGFydHMubGVuZ3RoIC0gMSkpIHtcbiAgICAgICAgICAgIGlmIChwYXJ0LnZhbHVlW3BhcnQudmFsdWUubGVuZ3RoIC0gMV0gPT09ICdcXG4nKSB7XG4gICAgICAgICAgICAgIHJldHVybiBwYXJ0LnZhbHVlICsgJ1xcdTAwYTAnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcGFydC52YWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBNYWtlIGEgcGlsbFxuICAgICAgICAgIHJldHVybiBSLnNwYW4oe2tleTogaSwgY2xhc3NOYW1lOiAncHJldHR5LXBhcnQnfSxcbiAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAncHJldHR5LXBhcnQtbGVmdCd9LCBMRUZUX1BBRCksXG4gICAgICAgICAgICBSLnNwYW4oe2NsYXNzTmFtZTogJ3ByZXR0eS1wYXJ0LXRleHQnfSwgbm9CcmVhayh0aGlzLnByZXR0eUxhYmVsKHBhcnQudmFsdWUpKSksXG4gICAgICAgICAgICBSLnNwYW4oe2NsYXNzTmFtZTogJ3ByZXR0eS1wYXJ0LXJpZ2h0J30sIFJJR0hUX1BBRClcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0sXG5cbiAgICAvLyBHaXZlbiB0aGUgdG9rZW5zIGZvciBhIGZpZWxkLCBnZXQgdGhlIGFjdHVhbCB2YWx1ZSBvZiB0aGUgZmllbGQgKHdpdGhcbiAgICAvLyB0YWdzKVxuICAgIHJhd1ZhbHVlOiBmdW5jdGlvbiAodG9rZW5zKSB7XG4gICAgICByZXR1cm4gdG9rZW5zLm1hcChmdW5jdGlvbiAodG9rZW4pIHtcbiAgICAgICAgaWYgKHRva2VuLnR5cGUgPT09ICd0YWcnKSB7XG4gICAgICAgICAgcmV0dXJuICd7eycgKyB0b2tlbi52YWx1ZSArICd9fSc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRva2VuO1xuICAgICAgICB9XG4gICAgICB9KS5qb2luKCcnKTtcbiAgICB9LFxuXG4gICAgLy8gR2l2ZW4gYSBwb3NpdGlvbiwgaWYgaXQncyBvbiBhIGxhYmVsLCBnZXQgdGhlIHBvc2l0aW9uIGxlZnQgb3IgcmlnaHQgb2ZcbiAgICAvLyB0aGUgbGFiZWwsIGJhc2VkIG9uIGRpcmVjdGlvbiBhbmQvb3Igd2hpY2ggc2lkZSBpcyBjbG9zZXJcbiAgICBtb3ZlT2ZmVGFnOiBmdW5jdGlvbiAocG9zLCB0b2tlbnMsIGluZGV4TWFwLCBkaXIpIHtcbiAgICAgIGlmICh0eXBlb2YgZGlyID09PSAndW5kZWZpbmVkJyB8fCBkaXIgPiAwKSB7XG4gICAgICAgIGRpciA9IDE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkaXIgPSAtMTtcbiAgICAgIH1cbiAgICAgIHZhciB0b2tlbjtcbiAgICAgIGlmIChkaXIgPiAwKSB7XG4gICAgICAgIHRva2VuID0gdG9rZW5zW2luZGV4TWFwW3Bvc11dO1xuICAgICAgICB3aGlsZSAocG9zIDwgaW5kZXhNYXAubGVuZ3RoICYmIHRva2Vuc1tpbmRleE1hcFtwb3NdXS50eXBlID09PSAndGFnJyAmJiB0b2tlbnNbaW5kZXhNYXBbcG9zXV0gPT09IHRva2VuKSB7XG4gICAgICAgICAgcG9zKys7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRva2VuID0gdG9rZW5zW2luZGV4TWFwW3BvcyAtIDFdXTtcbiAgICAgICAgd2hpbGUgKHBvcyA+IDAgJiYgdG9rZW5zW2luZGV4TWFwW3BvcyAtIDFdXS50eXBlID09PSAndGFnJyAmJiB0b2tlbnNbaW5kZXhNYXBbcG9zIC0gMV1dID09PSB0b2tlbikge1xuICAgICAgICAgIHBvcy0tO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwb3M7XG4gICAgfSxcblxuICAgIC8vIEdldCB0aGUgdG9rZW4gYXQgc29tZSBwb3NpdGlvbi5cbiAgICB0b2tlbkF0OiBmdW5jdGlvbiAocG9zKSB7XG4gICAgICBpZiAocG9zID49IHRoaXMudHJhY2tpbmcuaW5kZXhNYXAubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgaWYgKHBvcyA8IDApIHtcbiAgICAgICAgcG9zID0gMDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnRyYWNraW5nLnRva2Vuc1t0aGlzLnRyYWNraW5nLmluZGV4TWFwW3Bvc11dO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgdGhlIHRva2VuIGltbWVkaWF0ZWx5IGJlZm9yZSBzb21lIHBvc2l0aW9uLlxuICAgIHRva2VuQmVmb3JlOiBmdW5jdGlvbiAocG9zKSB7XG4gICAgICBpZiAocG9zID49IHRoaXMudHJhY2tpbmcuaW5kZXhNYXAubGVuZ3RoKSB7XG4gICAgICAgIHBvcyA9IHRoaXMudHJhY2tpbmcuaW5kZXhNYXAubGVuZ3RoO1xuICAgICAgfVxuICAgICAgaWYgKHBvcyA8PSAwKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMudHJhY2tpbmcudG9rZW5zW3RoaXMudHJhY2tpbmcuaW5kZXhNYXBbcG9zIC0gMV1dO1xuICAgIH0sXG5cbiAgICAvLyBHaXZlbiBhIHBvc2l0aW9uLCBnZXQgYSBjb3JyZWN0ZWQgcG9zaXRpb24gKGlmIG5lY2Vzc2FyeSB0byBiZVxuICAgIC8vIGNvcnJlY3RlZCkuXG4gICAgbm9ybWFsaXplUG9zaXRpb246IGZ1bmN0aW9uIChwb3MsIHByZXZQb3MpIHtcbiAgICAgIGlmIChfLmlzVW5kZWZpbmVkKHByZXZQb3MpKSB7XG4gICAgICAgIHByZXZQb3MgPSBwb3M7XG4gICAgICB9XG4gICAgICAvLyBBdCBzdGFydCBvciBlbmQsIHNvIG9rYXkuXG4gICAgICBpZiAocG9zIDw9IDAgfHwgcG9zID49IHRoaXMudHJhY2tpbmcuaW5kZXhNYXAubGVuZ3RoKSB7XG4gICAgICAgIGlmIChwb3MgPCAwKSB7XG4gICAgICAgICAgcG9zID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAocG9zID4gdGhpcy50cmFja2luZy5pbmRleE1hcC5sZW5ndGgpIHtcbiAgICAgICAgICBwb3MgPSB0aGlzLnRyYWNraW5nLmluZGV4TWFwLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcG9zO1xuICAgICAgfVxuXG4gICAgICB2YXIgdG9rZW4gPSB0aGlzLnRva2VuQXQocG9zKTtcbiAgICAgIHZhciB0b2tlbkJlZm9yZSA9IHRoaXMudG9rZW5CZWZvcmUocG9zKTtcblxuICAgICAgLy8gQmV0d2VlbiB0d28gdG9rZW5zLCBzbyBva2F5LlxuICAgICAgaWYgKHRva2VuICE9PSB0b2tlbkJlZm9yZSkge1xuICAgICAgICByZXR1cm4gcG9zO1xuICAgICAgfVxuXG4gICAgICB2YXIgcHJldlRva2VuID0gdGhpcy50b2tlbkF0KHByZXZQb3MpO1xuICAgICAgdmFyIHByZXZUb2tlbkJlZm9yZSA9IHRoaXMudG9rZW5CZWZvcmUocHJldlBvcyk7XG5cbiAgICAgIHZhciByaWdodFBvcyA9IHRoaXMubW92ZU9mZlRhZyhwb3MsIHRoaXMudHJhY2tpbmcudG9rZW5zLCB0aGlzLnRyYWNraW5nLmluZGV4TWFwKTtcbiAgICAgIHZhciBsZWZ0UG9zID0gdGhpcy5tb3ZlT2ZmVGFnKHBvcywgdGhpcy50cmFja2luZy50b2tlbnMsIHRoaXMudHJhY2tpbmcuaW5kZXhNYXAsIC0xKTtcblxuICAgICAgaWYgKHByZXZUb2tlbiAhPT0gcHJldlRva2VuQmVmb3JlKSB7XG4gICAgICAgIC8vIE1vdmVkIGZyb20gbGVmdCBlZGdlLlxuICAgICAgICBpZiAocHJldlRva2VuID09PSB0b2tlbikge1xuICAgICAgICAgIHJldHVybiByaWdodFBvcztcbiAgICAgICAgfVxuICAgICAgICAvLyBNb3ZlZCBmcm9tIHJpZ2h0IGVkZ2UuXG4gICAgICAgIGlmIChwcmV2VG9rZW5CZWZvcmUgPT09IHRva2VuKSB7XG4gICAgICAgICAgcmV0dXJuIGxlZnRQb3M7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIG5ld1BvcyA9IHJpZ2h0UG9zO1xuXG4gICAgICBpZiAocG9zID09PSBwcmV2UG9zIHx8IHBvcyA8IHByZXZQb3MpIHtcbiAgICAgICAgaWYgKHJpZ2h0UG9zIC0gcG9zID4gcG9zIC0gbGVmdFBvcykge1xuICAgICAgICAgIG5ld1BvcyA9IGxlZnRQb3M7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXdQb3M7XG4gICAgfSxcblxuICAgIG9uU2VsZWN0OiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIHZhciBub2RlID0gZXZlbnQudGFyZ2V0O1xuXG4gICAgICB2YXIgcG9zID0gbm9kZS5zZWxlY3Rpb25TdGFydDtcbiAgICAgIHZhciBlbmRQb3MgPSBub2RlLnNlbGVjdGlvbkVuZDtcblxuICAgICAgcG9zID0gdGhpcy5ub3JtYWxpemVQb3NpdGlvbihwb3MsIHRoaXMudHJhY2tpbmcucG9zKTtcbiAgICAgIGVuZFBvcyA9IHRoaXMubm9ybWFsaXplUG9zaXRpb24oZW5kUG9zLCB0aGlzLnRyYWNraW5nLnBvcyArIHRoaXMudHJhY2tpbmcucmFuZ2UpO1xuXG4gICAgICB0aGlzLnRyYWNraW5nLnBvcyA9IHBvcztcbiAgICAgIHRoaXMudHJhY2tpbmcucmFuZ2UgPSBlbmRQb3MgLSBwb3M7XG5cbiAgICAgIG5vZGUuc2VsZWN0aW9uU3RhcnQgPSBwb3M7XG4gICAgICBub2RlLnNlbGVjdGlvbkVuZCA9IGVuZFBvcztcbiAgICB9LFxuXG4gICAgb25Db3B5OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgbm9kZSA9IHRoaXMucmVmcy5jb250ZW50LmdldERPTU5vZGUoKTtcbiAgICAgIHZhciBzdGFydCA9IG5vZGUuc2VsZWN0aW9uU3RhcnQ7XG4gICAgICB2YXIgZW5kID0gbm9kZS5zZWxlY3Rpb25FbmQ7XG4gICAgICB2YXIgdGV4dCA9IG5vZGUudmFsdWUuc3Vic3RyaW5nKHN0YXJ0LCBlbmQpO1xuICAgICAgdmFyIHJlYWxTdGFydEluZGV4ID0gdGhpcy50b2tlbkluZGV4KHN0YXJ0LCB0aGlzLnRyYWNraW5nLnRva2VucywgdGhpcy50cmFja2luZy5pbmRleE1hcCk7XG4gICAgICB2YXIgcmVhbEVuZEluZGV4ID0gdGhpcy50b2tlbkluZGV4KGVuZCwgdGhpcy50cmFja2luZy50b2tlbnMsIHRoaXMudHJhY2tpbmcuaW5kZXhNYXApO1xuICAgICAgdmFyIHRva2VucyA9IHRoaXMudHJhY2tpbmcudG9rZW5zLnNsaWNlKHJlYWxTdGFydEluZGV4LCByZWFsRW5kSW5kZXgpO1xuICAgICAgdGV4dCA9IHRoaXMucmF3VmFsdWUodG9rZW5zKTtcbiAgICAgIHZhciBvcmlnaW5hbFZhbHVlID0gbm9kZS52YWx1ZTtcbiAgICAgIG5vZGUudmFsdWUgPSBub2RlLnZhbHVlICsgdGV4dDtcbiAgICAgIG5vZGUuc2V0U2VsZWN0aW9uUmFuZ2Uob3JpZ2luYWxWYWx1ZS5sZW5ndGgsIG9yaWdpbmFsVmFsdWUubGVuZ3RoICsgdGV4dC5sZW5ndGgpO1xuICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIG5vZGUudmFsdWUgPSBvcmlnaW5hbFZhbHVlO1xuICAgICAgICBub2RlLnNldFNlbGVjdGlvblJhbmdlKHN0YXJ0LCBlbmQpO1xuICAgICAgfSwwKTtcbiAgICB9LFxuXG4gICAgb25LZXlEb3duOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIC8vIENtZC1aIG9yIEN0cmwtWlxuICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDkwICYmIChldmVudC5tZXRhS2V5IHx8IGV2ZW50LmN0cmxLZXkpICYmICFldmVudC5zaGlmdEtleSkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLnVuZG8oKTtcbiAgICAgIC8vIENtZC1TaGlmdC1aIG9yIEN0cmwtWVxuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgKGV2ZW50LmtleUNvZGUgPT09IDg5ICYmIGV2ZW50LmN0cmxLZXkgJiYgIWV2ZW50LnNoaWZ0S2V5KSB8fFxuICAgICAgICAoZXZlbnQua2V5Q29kZSA9PT0gOTAgJiYgZXZlbnQubWV0YUtleSAmJiBldmVudC5zaGlmdEtleSlcbiAgICAgICkge1xuICAgICAgICB0aGlzLnJlZG8oKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gS2VlcCB0aGUgaGlnaGxpZ2h0IHN0eWxlcyBpbiBzeW5jIHdpdGggdGhlIHRleHRhcmVhIHN0eWxlcy5cbiAgICBhZGp1c3RTdHlsZXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBvdmVybGF5ID0gdGhpcy5yZWZzLmhpZ2hsaWdodC5nZXRET01Ob2RlKCk7XG4gICAgICB2YXIgY29udGVudCA9IHRoaXMucmVmcy5jb250ZW50LmdldERPTU5vZGUoKTtcblxuICAgICAgdmFyIHN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoY29udGVudCk7XG5cbiAgICAgIHZhciBiYWNrZ3JvdW5kQ29sb3IgPSBzdHlsZS5iYWNrZ3JvdW5kQ29sb3I7XG5cbiAgICAgIHV0aWwuY29weUVsZW1lbnRTdHlsZShjb250ZW50LCBvdmVybGF5KTtcblxuICAgICAgb3ZlcmxheS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICBvdmVybGF5LnN0eWxlLndoaXRlU3BhY2UgPSAncHJlLXdyYXAnO1xuICAgICAgb3ZlcmxheS5zdHlsZS5jb2xvciA9ICdyZ2JhKDAsMCwwLDApJztcbiAgICAgIG92ZXJsYXkuc3R5bGUud2Via2l0VGV4dEZpbGxDb2xvciA9ICdyZ2JhKDAsMCwwLDApJztcbiAgICAgIG92ZXJsYXkuc3R5bGUucmVzaXplID0gJ25vbmUnO1xuICAgICAgb3ZlcmxheS5zdHlsZS5ib3JkZXJDb2xvciA9ICdyZ2JhKDAsMCwwLDApJztcblxuICAgICAgaWYgKHV0aWwuYnJvd3Nlci5pc01vemlsbGEpIHtcblxuICAgICAgICB2YXIgcGFkZGluZ1RvcCA9IHBhcnNlRmxvYXQoc3R5bGUucGFkZGluZ1RvcCk7XG4gICAgICAgIHZhciBwYWRkaW5nQm90dG9tID0gcGFyc2VGbG9hdChzdHlsZS5wYWRkaW5nQm90dG9tKTtcblxuICAgICAgICB2YXIgYm9yZGVyVG9wID0gcGFyc2VGbG9hdChzdHlsZS5ib3JkZXJUb3BXaWR0aCk7XG4gICAgICAgIHZhciBib3JkZXJCb3R0b20gPSBwYXJzZUZsb2F0KHN0eWxlLmJvcmRlckJvdHRvbVdpZHRoKTtcblxuICAgICAgICBvdmVybGF5LnN0eWxlLnBhZGRpbmdUb3AgPSAnMHB4JztcbiAgICAgICAgb3ZlcmxheS5zdHlsZS5wYWRkaW5nQm90dG9tID0gJzBweCc7XG5cbiAgICAgICAgb3ZlcmxheS5zdHlsZS5oZWlnaHQgPSAoY29udGVudC5jbGllbnRIZWlnaHQgLSBwYWRkaW5nVG9wIC0gcGFkZGluZ0JvdHRvbSArIGJvcmRlclRvcCArIGJvcmRlckJvdHRvbSkgKyAncHgnO1xuICAgICAgICBvdmVybGF5LnN0eWxlLnRvcCA9IHN0eWxlLnBhZGRpbmdUb3A7XG4gICAgICAgIG92ZXJsYXkuc3R5bGUuYm94U2hhZG93ID0gJ25vbmUnO1xuICAgICAgfVxuXG4gICAgICBvdmVybGF5LnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGJhY2tncm91bmRDb2xvcjtcbiAgICAgIGNvbnRlbnQuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3JnYmEoMCwwLDAsMCknO1xuICAgIH0sXG5cbiAgICAvLyBJZiB0aGUgdGV4dGFyZWEgaXMgcmVzaXplZCwgbmVlZCB0byByZS1zeW5jIHRoZSBzdHlsZXMuXG4gICAgb25SZXNpemU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuYWRqdXN0U3R5bGVzKCk7XG4gICAgfSxcblxuICAgIC8vIElmIHRoZSB3aW5kb3cgaXMgcmVzaXplZCwgbWF5IG5lZWQgdG8gcmUtc3luYyB0aGUgc3R5bGVzLlxuICAgIC8vIFByb2JhYmx5IG5vdCBuZWNlc3Nhcnkgd2l0aCBlbGVtZW50IHJlc2l6ZT9cbiAgICBvblJlc2l6ZVdpbmRvdzogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5hZGp1c3RTdHlsZXMoKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuYWRqdXN0U3R5bGVzKCk7XG4gICAgICB0aGlzLnNldE9uUmVzaXplKCdjb250ZW50JywgdGhpcy5vblJlc2l6ZSk7XG4gICAgfSxcblxuICAgIG9uSW5zZXJ0OiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIGlmIChldmVudC50YXJnZXQuc2VsZWN0ZWRJbmRleCA+IDApIHtcbiAgICAgICAgdmFyIHRhZyA9ICd7eycgKyBldmVudC50YXJnZXQudmFsdWUgKyAnfX0nO1xuICAgICAgICBldmVudC50YXJnZXQuc2VsZWN0ZWRJbmRleCA9IDA7XG4gICAgICAgIHZhciBwb3MgPSB0aGlzLnRyYWNraW5nLnBvcztcbiAgICAgICAgdmFyIGluc2VydFBvcyA9IHRoaXMubm9ybWFsaXplUG9zaXRpb24ocG9zKTtcbiAgICAgICAgdmFyIHRva2VucyA9IHRoaXMudHJhY2tpbmcudG9rZW5zO1xuICAgICAgICB2YXIgdG9rZW5JbmRleCA9IHRoaXMudG9rZW5JbmRleChpbnNlcnRQb3MsIHRva2VucywgdGhpcy50cmFja2luZy5pbmRleE1hcCk7XG4gICAgICAgIHRva2Vucy5zcGxpY2UodG9rZW5JbmRleCwgMCwgdGFnKTtcbiAgICAgICAgdGhpcy50cmFja2luZy5pbmRleE1hcCA9IHRoaXMuaW5kZXhNYXAodG9rZW5zKTtcbiAgICAgICAgdmFyIG5ld1ZhbHVlID0gdGhpcy5yYXdWYWx1ZSh0b2tlbnMpO1xuICAgICAgICB0aGlzLnByb3BzLmZpZWxkLnZhbChuZXdWYWx1ZSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgICAgdmFyIHJlcGxhY2VDaG9pY2VzID0gW3tcbiAgICAgICAgdmFsdWU6ICcnLFxuICAgICAgICBsYWJlbDogJ0luc2VydC4uLidcbiAgICAgIH1dLmNvbmNhdChmaWVsZC5kZWYucmVwbGFjZUNob2ljZXMpO1xuXG4gICAgICByZXR1cm4gcGx1Z2luLmNvbXBvbmVudCgnZmllbGQnKSh7XG4gICAgICAgIGZpZWxkOiBmaWVsZFxuICAgICAgfSwgUi5kaXYoe3N0eWxlOiB7cG9zaXRpb246ICdyZWxhdGl2ZSd9fSxcblxuICAgICAgICBSLnByZSh7XG4gICAgICAgICAgY2xhc3NOYW1lOiAncHJldHR5LWhpZ2hsaWdodCcsXG4gICAgICAgICAgcmVmOiAnaGlnaGxpZ2h0J1xuICAgICAgICB9LFxuICAgICAgICAgIHRoaXMucHJldHR5VmFsdWUoZmllbGQudmFsdWUpXG4gICAgICAgICksXG5cbiAgICAgICAgUi50ZXh0YXJlYShfLmV4dGVuZCh7XG4gICAgICAgICAgY2xhc3NOYW1lOiB1dGlsLmNsYXNzTmFtZSh0aGlzLnByb3BzLmNsYXNzTmFtZSwgJ3ByZXR0eS1jb250ZW50JyksXG4gICAgICAgICAgcmVmOiAnY29udGVudCcsXG4gICAgICAgICAgcm93czogZmllbGQuZGVmLnJvd3MgfHwgdGhpcy5wcm9wcy5yb3dzLFxuICAgICAgICAgIG5hbWU6IGZpZWxkLmtleSxcbiAgICAgICAgICB2YWx1ZTogdGhpcy5wbGFpblZhbHVlKGZpZWxkLnZhbHVlKSxcbiAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgICAgICBvblNjcm9sbDogdGhpcy5vblNjcm9sbCxcbiAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXG4gICAgICAgICAgICB0b3A6IDAsXG4gICAgICAgICAgICBsZWZ0OiAwXG4gICAgICAgICAgfSxcbiAgICAgICAgICBvbktleVByZXNzOiB0aGlzLm9uS2V5UHJlc3MsXG4gICAgICAgICAgb25LZXlEb3duOiB0aGlzLm9uS2V5RG93bixcbiAgICAgICAgICBvblNlbGVjdDogdGhpcy5vblNlbGVjdCxcbiAgICAgICAgICBvbkNvcHk6IHRoaXMub25Db3B5XG4gICAgICAgIH0sIHBsdWdpbi5jb25maWcuYXR0cmlidXRlcykpLFxuXG4gICAgICAgIFIuc2VsZWN0KHtvbkNoYW5nZTogdGhpcy5vbkluc2VydH0sXG4gICAgICAgICAgcmVwbGFjZUNob2ljZXMubWFwKGZ1bmN0aW9uIChjaG9pY2UsIGkpIHtcbiAgICAgICAgICAgIHJldHVybiBSLm9wdGlvbih7XG4gICAgICAgICAgICAgIGtleTogaSxcbiAgICAgICAgICAgICAgdmFsdWU6IGNob2ljZS52YWx1ZVxuICAgICAgICAgICAgfSwgY2hvaWNlLmxhYmVsKTtcbiAgICAgICAgICB9KVxuICAgICAgICApXG4gICAgICApKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQucmVtb3ZlLWl0ZW1cblxuLypcblJlbW92ZSBhbiBpdGVtLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGRpc3BsYXlOYW1lOiBwbHVnaW4ubmFtZSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZSxcbiAgICAgICAgbGFiZWw6IHBsdWdpbi5jb25maWdWYWx1ZSgnbGFiZWwnLCAnW3JlbW92ZV0nKVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gUi5zcGFuKHtjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lLCBvbkNsaWNrOiB0aGlzLnByb3BzLm9uQ2xpY2t9LCB0aGlzLnByb3BzLmxhYmVsKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQucm9vdFxuXG4vKlxuUm9vdCBjb21wb25lbnQganVzdCB1c2VkIHRvIHNwaXQgb3V0IGFsbCB0aGUgZmllbGRzIGZvciBhIGZvcm0uXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHZhciB1dGlsID0gcGx1Z2luLnJlcXVpcmUoJ3V0aWwnKTtcblxuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGRpc3BsYXlOYW1lOiBwbHVnaW4ubmFtZSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiB1dGlsLmNsYXNzTmFtZSgncm9vdCcsIHBsdWdpbi5jb25maWcuY2xhc3NOYW1lKVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgICByZXR1cm4gUi5kaXYoe1xuICAgICAgICBjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lXG4gICAgICB9LFxuICAgICAgICBmaWVsZC5maWVsZHMoKS5tYXAoZnVuY3Rpb24gKGZpZWxkLCBpKSB7XG4gICAgICAgICAgcmV0dXJuIGZpZWxkLmNvbXBvbmVudCh7a2V5OiBmaWVsZC5kZWYua2V5IHx8IGl9KTtcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50LmhlbHBcblxuLypcbkp1c3QgdGhlIGhlbHAgdGV4dCBibG9jay5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgY2hvaWNlID0gdGhpcy5wcm9wcy5jaG9pY2U7XG5cbiAgICAgIHJldHVybiBjaG9pY2Uuc2FtcGxlID9cbiAgICAgICAgUi5kaXYoe2NsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWV9LFxuICAgICAgICAgIGNob2ljZS5zYW1wbGVcbiAgICAgICAgKSA6XG4gICAgICAgIFIuc3BhbihudWxsKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQuc2VsZWN0XG5cbi8qXG5SZW5kZXIgc2VsZWN0IGVsZW1lbnQgdG8gZ2l2ZSBhIHVzZXIgY2hvaWNlcyBmb3IgdGhlIHZhbHVlIG9mIGEgZmllbGQuIE5vdGVcbml0IHNob3VsZCBzdXBwb3J0IHZhbHVlcyBvdGhlciB0aGFuIHN0cmluZ3MuIEN1cnJlbnRseSB0aGlzIGlzIG9ubHkgdGVzdGVkIGZvclxuYm9vbGVhbiB2YWx1ZXMsIGJ1dCBpdCBfc2hvdWxkXyB3b3JrIGZvciBvdGhlciB2YWx1ZXMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBtaXhpbnM6IFtwbHVnaW4ucmVxdWlyZSgnbWl4aW4uZmllbGQnKV0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIHZhciBjaG9pY2VWYWx1ZSA9IGV2ZW50LnRhcmdldC52YWx1ZTtcbiAgICAgIHZhciBjaG9pY2VUeXBlID0gY2hvaWNlVmFsdWUuc3Vic3RyaW5nKDAsIGNob2ljZVZhbHVlLmluZGV4T2YoJzonKSk7XG4gICAgICBpZiAoY2hvaWNlVHlwZSA9PT0gJ2Nob2ljZScpIHtcbiAgICAgICAgdmFyIGNob2ljZUluZGV4ID0gY2hvaWNlVmFsdWUuc3Vic3RyaW5nKGNob2ljZVZhbHVlLmluZGV4T2YoJzonKSArIDEpO1xuICAgICAgICBjaG9pY2VJbmRleCA9IHBhcnNlSW50KGNob2ljZUluZGV4KTtcbiAgICAgICAgdGhpcy5wcm9wcy5maWVsZC52YWwodGhpcy5wcm9wcy5maWVsZC5kZWYuY2hvaWNlc1tjaG9pY2VJbmRleF0udmFsdWUpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcbiAgICAgIHZhciBjaG9pY2VzID0gZmllbGQuZGVmLmNob2ljZXMgfHwgW107XG5cbiAgICAgIHZhciB2YWx1ZSA9IGZpZWxkLnZhbHVlICE9PSB1bmRlZmluZWQgPyBmaWVsZC52YWx1ZSA6ICcnO1xuXG4gICAgICBjaG9pY2VzID0gY2hvaWNlcy5tYXAoZnVuY3Rpb24gKGNob2ljZSwgaSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGNob2ljZVZhbHVlOiAnY2hvaWNlOicgKyBpLFxuICAgICAgICAgIHZhbHVlOiBjaG9pY2UudmFsdWUsXG4gICAgICAgICAgbGFiZWw6IGNob2ljZS5sYWJlbFxuICAgICAgICB9O1xuICAgICAgfSk7XG5cbiAgICAgIHZhciB2YWx1ZUNob2ljZSA9IF8uZmluZChjaG9pY2VzLCBmdW5jdGlvbiAoY2hvaWNlKSB7XG4gICAgICAgIHJldHVybiBjaG9pY2UudmFsdWUgPT09IHZhbHVlO1xuICAgICAgfSk7XG5cbiAgICAgIGlmICh2YWx1ZUNob2ljZSA9PT0gdW5kZWZpbmVkKSB7XG5cbiAgICAgICAgdmFyIGxhYmVsID0gdmFsdWU7XG4gICAgICAgIGlmICghXy5pc1N0cmluZyh2YWx1ZSkpIHtcbiAgICAgICAgICBsYWJlbCA9IEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICB2YWx1ZUNob2ljZSA9IHtcbiAgICAgICAgICBjaG9pY2VWYWx1ZTogJ3ZhbHVlOicsXG4gICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgIGxhYmVsOiBsYWJlbFxuICAgICAgICB9O1xuICAgICAgICBjaG9pY2VzID0gW3ZhbHVlQ2hvaWNlXS5jb25jYXQoY2hvaWNlcyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwbHVnaW4uY29tcG9uZW50KCdmaWVsZCcpKHtcbiAgICAgICAgZmllbGQ6IGZpZWxkXG4gICAgICB9LCBSLnNlbGVjdCh7XG4gICAgICAgIGNsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWUsXG4gICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgICB2YWx1ZTogdmFsdWVDaG9pY2UuY2hvaWNlVmFsdWVcbiAgICAgIH0sXG4gICAgICAgIGNob2ljZXMubWFwKGZ1bmN0aW9uIChjaG9pY2UsIGkpIHtcbiAgICAgICAgICByZXR1cm4gUi5vcHRpb24oe1xuICAgICAgICAgICAga2V5OiBpLFxuICAgICAgICAgICAgdmFsdWU6IGNob2ljZS5jaG9pY2VWYWx1ZVxuICAgICAgICAgIH0sIGNob2ljZS5sYWJlbCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICkpO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC50ZXh0XG5cbi8qXG5KdXN0IGEgc2ltcGxlIHRleHQgaW5wdXQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZGlzcGxheU5hbWU6IHBsdWdpbi5uYW1lLFxuXG4gICAgbWl4aW5zOiBbcGx1Z2luLnJlcXVpcmUoJ21peGluLmZpZWxkJyldLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICB2YXIgbmV3VmFsdWUgPSBldmVudC50YXJnZXQudmFsdWU7XG4gICAgICB0aGlzLnByb3BzLmZpZWxkLnZhbChuZXdWYWx1ZSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgICByZXR1cm4gcGx1Z2luLmNvbXBvbmVudCgnZmllbGQnKSh7XG4gICAgICAgIGZpZWxkOiBmaWVsZFxuICAgICAgfSwgUi5pbnB1dCh7XG4gICAgICAgIGNsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWUsXG4gICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgdmFsdWU6IGZpZWxkLnZhbHVlLFxuICAgICAgICByb3dzOiBmaWVsZC5kZWYucm93cyxcbiAgICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2VcbiAgICAgIH0pKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQudGV4dGFyZWFcblxuLypcbkp1c3QgYSBzaW1wbGUgbXVsdGktcm93IHRleHRhcmVhLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGRpc3BsYXlOYW1lOiBwbHVnaW4ubmFtZSxcblxuICAgIG1peGluczogW3BsdWdpbi5yZXF1aXJlKCdtaXhpbi5maWVsZCcpXSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZSxcbiAgICAgICAgcm93czogcGx1Z2luLmNvbmZpZy5yb3dzIHx8IDVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIHZhciBuZXdWYWx1ZSA9IGV2ZW50LnRhcmdldC52YWx1ZTtcbiAgICAgIHRoaXMucHJvcHMuZmllbGQudmFsKG5ld1ZhbHVlKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICAgIHJldHVybiBwbHVnaW4uY29tcG9uZW50KCdmaWVsZCcpKHtcbiAgICAgICAgZmllbGQ6IGZpZWxkXG4gICAgICB9LCBSLnRleHRhcmVhKHtcbiAgICAgICAgY2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZSxcbiAgICAgICAgdmFsdWU6IGZpZWxkLnZhbHVlLFxuICAgICAgICByb3dzOiBmaWVsZC5kZWYucm93cyB8fCB0aGlzLnByb3BzLnJvd3MsXG4gICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlXG4gICAgICB9KSk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29yZS5maWVsZFxuXG4vKlxuVGhlIGNvcmUgZmllbGQgcGx1Z2luIHByb3ZpZGVzIHRoZSBGaWVsZCBwcm90b3R5cGUuIEZpZWxkcyByZXByZXNlbnQgYVxucGFydGljdWxhciBzdGF0ZSBpbiB0aW1lIG9mIGEgZmllbGQgZGVmaW5pdGlvbiwgYW5kIHRoZXkgcHJvdmlkZSBoZWxwZXIgbWV0aG9kc1xudG8gbm90aWZ5IHRoZSBmb3JtIHN0b3JlIG9mIGNoYW5nZXMuXG5cbkZpZWxkcyBhcmUgbGF6aWx5IGNyZWF0ZWQgYW5kIGV2YWx1YXRlZCwgYnV0IG9uY2UgZXZhbHVhdGVkLCB0aGV5IHNob3VsZCBiZVxuY29uc2lkZXJlZCBpbW11dGFibGUuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICB2YXIgcm91dGVyID0gcGx1Z2luLnJlcXVpcmUoJ2ZpZWxkLXJvdXRlcicpO1xuICB2YXIgdXRpbCA9IHBsdWdpbi5yZXF1aXJlKCd1dGlsJyk7XG4gIHZhciBldmFsdWF0b3IgPSBwbHVnaW4ucmVxdWlyZSgnZXZhbCcpO1xuICB2YXIgY29tcGlsZXIgPSBwbHVnaW4ucmVxdWlyZSgnY29tcGlsZXInKTtcblxuICAvLyBUaGUgRmllbGQgY29uc3RydWN0b3IuXG4gIHZhciBGaWVsZCA9IGZ1bmN0aW9uIChmb3JtLCBkZWYsIHZhbHVlLCBwYXJlbnQpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzO1xuXG4gICAgZmllbGQuZm9ybSA9IGZvcm07XG4gICAgZmllbGQuZGVmID0gZGVmO1xuICAgIGZpZWxkLnZhbHVlID0gdmFsdWU7XG4gICAgZmllbGQucGFyZW50ID0gcGFyZW50O1xuICAgIGZpZWxkLmdyb3VwcyA9IHt9O1xuICB9O1xuXG4gIC8vIEF0dGFjaCBhIGZpZWxkIGZhY3RvcnkgdG8gdGhlIGZvcm0gcHJvdG90eXBlLlxuICBwbHVnaW4uZXhwb3J0cy5maWVsZCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZm9ybSA9IHRoaXM7XG5cbiAgICByZXR1cm4gbmV3IEZpZWxkKGZvcm0sIHtcbiAgICAgIHR5cGU6ICdyb290J1xuICAgIH0sIGZvcm0uc3RvcmUudmFsdWUpO1xuICB9O1xuXG4gIHZhciBwcm90byA9IEZpZWxkLnByb3RvdHlwZTtcblxuICAvLyBSZXR1cm4gdGhlIHR5cGUgcGx1Z2luIGZvciB0aGlzIGZpZWxkLlxuICBwcm90by50eXBlUGx1Z2luID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBmaWVsZCA9IHRoaXM7XG5cbiAgICBpZiAoIWZpZWxkLl90eXBlUGx1Z2luKSB7XG4gICAgICBmaWVsZC5fdHlwZVBsdWdpbiA9IHBsdWdpbi5yZXF1aXJlKCd0eXBlLicgKyBmaWVsZC5kZWYudHlwZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZpZWxkLl90eXBlUGx1Z2luO1xuICB9O1xuXG4gIC8vIEdldCBhIGNvbXBvbmVudCBmb3IgdGhpcyBmaWVsZC5cbiAgcHJvdG8uY29tcG9uZW50ID0gZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgdmFyIGZpZWxkID0gdGhpcztcbiAgICBwcm9wcyA9IF8uZXh0ZW5kKHt9LCBwcm9wcywge2ZpZWxkOiBmaWVsZH0pO1xuICAgIHZhciBjb21wb25lbnQgPSByb3V0ZXIuY29tcG9uZW50Rm9yRmllbGQoZmllbGQpO1xuICAgIHJldHVybiBjb21wb25lbnQocHJvcHMpO1xuICB9O1xuXG4gIC8vIEdldCB0aGUgY2hpbGQgZmllbGRzIGZvciB0aGlzIGZpZWxkLlxuICBwcm90by5maWVsZHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGZpZWxkID0gdGhpcztcblxuICAgIGlmICghZmllbGQuX2ZpZWxkcykge1xuICAgICAgdmFyIGZpZWxkcztcbiAgICAgIGlmIChmaWVsZC50eXBlUGx1Z2luKCkuZmllbGRzKSB7XG4gICAgICAgIGZpZWxkcyA9IGZpZWxkLnR5cGVQbHVnaW4oKS5maWVsZHMoZmllbGQpO1xuICAgICAgfSBlbHNlIGlmIChmaWVsZC5kZWYuZmllbGRzKSB7XG4gICAgICAgIGZpZWxkcyA9IGZpZWxkLmRlZi5maWVsZHMubWFwKGZ1bmN0aW9uIChkZWYpIHtcbiAgICAgICAgICByZXR1cm4gZmllbGQuY3JlYXRlQ2hpbGQoZGVmKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmaWVsZHMgPSBbXTtcbiAgICAgIH1cbiAgICAgIGZpZWxkLl9maWVsZHMgPSBmaWVsZHM7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZpZWxkLl9maWVsZHM7XG4gIH07XG5cbiAgLy8gR2V0IHRoZSBpdGVtcyAoY2hpbGQgZmllbGQgZGVmaW5pdGlvbnMpIGZvciB0aGlzIGZpZWxkLlxuICBwcm90by5pdGVtcyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzO1xuXG4gICAgaWYgKCFmaWVsZC5faXRlbXMpIHtcbiAgICAgIGlmIChfLmlzQXJyYXkoZmllbGQuZGVmLml0ZW1zKSkge1xuICAgICAgICBmaWVsZC5faXRlbXMgPSBmaWVsZC5kZWYuaXRlbXMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgcmV0dXJuIGZpZWxkLnJlc29sdmUoaXRlbSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZmllbGQuX2l0ZW1zID0gW107XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZpZWxkLl9pdGVtcztcbiAgfTtcblxuICAvLyBSZXNvbHZlIGEgZmllbGQgcmVmZXJlbmNlIGlmIG5lY2Vzc2FyeS5cbiAgcHJvdG8ucmVzb2x2ZSA9IGZ1bmN0aW9uIChkZWYpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzO1xuXG4gICAgaWYgKF8uaXNTdHJpbmcoZGVmKSkge1xuICAgICAgZGVmID0gZmllbGQuZm9ybS5maW5kRGVmKGRlZik7XG4gICAgICBpZiAoIWRlZikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBmaW5kIGZpZWxkOiAnICsgZGVmKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGVmO1xuICB9O1xuXG4gIC8vIEV2YWx1YXRlIGEgZmllbGQgZGVmaW5pdGlvbiBhbmQgcmV0dXJuIGEgbmV3IGZpZWxkIGRlZmluaXRpb24uXG4gIHByb3RvLmV2YWxEZWYgPSBmdW5jdGlvbiAoZGVmKSB7XG4gICAgdmFyIGZpZWxkID0gdGhpcztcblxuICAgIGlmIChkZWYuZXZhbCkge1xuXG4gICAgICB0cnkge1xuICAgICAgICB2YXIgZXh0RGVmID0gZmllbGQuZXZhbChkZWYuZXZhbCk7XG4gICAgICAgIGlmIChleHREZWYpIHtcbiAgICAgICAgICBkZWYgPSBfLmV4dGVuZCh7fSwgZGVmLCBleHREZWYpO1xuICAgICAgICAgIGRlZiA9IGNvbXBpbGVyLmNvbXBpbGVEZWYoZGVmKTtcbiAgICAgICAgICBpZiAoZGVmLmZpZWxkcykge1xuICAgICAgICAgICAgZGVmLmZpZWxkcyA9IGRlZi5maWVsZHMubWFwKGZ1bmN0aW9uIChjaGlsZERlZikge1xuICAgICAgICAgICAgICBjaGlsZERlZiA9IGNvbXBpbGVyLmV4cGFuZERlZihjaGlsZERlZiwgZmllbGQuZm9ybS5zdG9yZS50ZW1wbGF0ZU1hcCk7XG4gICAgICAgICAgICAgIHJldHVybiBjb21waWxlci5jb21waWxlRGVmKGNoaWxkRGVmKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmxvZygnUHJvYmxlbSBpbiBldmFsOiAnLCBKU09OLnN0cmluZ2lmeShkZWYuZXZhbCkpO1xuICAgICAgICBjb25zb2xlLmxvZyhlLm1lc3NhZ2UpO1xuICAgICAgICBjb25zb2xlLmxvZyhlLnN0YWNrKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGVmO1xuICB9O1xuXG4gIC8vIEV2YWx1YXRlIGFuIGV4cHJlc3Npb24gaW4gdGhlIGNvbnRleHQgb2YgYSBmaWVsZC5cbiAgcHJvdG8uZXZhbCA9IGZ1bmN0aW9uIChleHByZXNzaW9uLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIGV2YWx1YXRvci5ldmFsdWF0ZShleHByZXNzaW9uLCB0aGlzLCBjb250ZXh0KTtcbiAgfTtcblxuICAvLyBDcmVhdGUgYSBjaGlsZCBmaWVsZCBmcm9tIGEgZGVmaW5pdGlvbi5cbiAgcHJvdG8uY3JlYXRlQ2hpbGQgPSBmdW5jdGlvbiAoZGVmKSB7XG4gICAgdmFyIGZpZWxkID0gdGhpcztcblxuICAgIGRlZiA9IGZpZWxkLnJlc29sdmUoZGVmKTtcblxuICAgIHZhciB2YWx1ZSA9IGZpZWxkLnZhbHVlO1xuXG4gICAgZGVmID0gZmllbGQuZXZhbERlZihkZWYpO1xuXG4gICAgaWYgKCF1dGlsLmlzQmxhbmsoZGVmLmtleSkpIHtcbiAgICAgIGlmICh2YWx1ZSAmJiAhXy5pc1VuZGVmaW5lZCh2YWx1ZVtkZWYua2V5XSkpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZVtkZWYua2V5XTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSA9IGRlZi52YWx1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IEZpZWxkKGZpZWxkLmZvcm0sIGRlZiwgdmFsdWUsIGZpZWxkKTtcbiAgfTtcblxuICAvLyBHaXZlbiBhIHZhbHVlLCBmaW5kIGFuIGFwcHJvcHJpYXRlIGZpZWxkIGRlZmluaXRpb24gZm9yIHRoaXMgZmllbGQuXG4gIHByb3RvLml0ZW1Gb3JWYWx1ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHZhciBmaWVsZCA9IHRoaXM7XG5cbiAgICB2YXIgaXRlbSA9IF8uZmluZChmaWVsZC5pdGVtcygpLCBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgcmV0dXJuIHV0aWwuaXRlbU1hdGNoZXNWYWx1ZShpdGVtLCB2YWx1ZSk7XG4gICAgfSk7XG4gICAgaWYgKGl0ZW0pIHtcbiAgICAgIGl0ZW0gPSBfLmV4dGVuZCh7fSwgaXRlbSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGl0ZW0gPSB1dGlsLmZpZWxkRGVmRnJvbVZhbHVlKHZhbHVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gaXRlbTtcbiAgfTtcblxuICAvLyBHZXQgYWxsIHRoZSBmaWVsZHMgYmVsb25naW5nIHRvIGEgZ3JvdXAuXG4gIHByb3RvLmdyb3VwRmllbGRzID0gZnVuY3Rpb24gKGdyb3VwTmFtZSkge1xuICAgIHZhciBmaWVsZCA9IHRoaXM7XG5cbiAgICBpZiAoIWZpZWxkLmdyb3Vwc1tncm91cE5hbWVdKSB7XG4gICAgICBmaWVsZC5ncm91cHNbZ3JvdXBOYW1lXSA9IFtdO1xuICAgICAgaWYgKGZpZWxkLnBhcmVudCkge1xuICAgICAgICB2YXIgc2libGluZ3MgPSBmaWVsZC5wYXJlbnQuZmllbGRzKCk7XG4gICAgICAgIHNpYmxpbmdzLmZvckVhY2goZnVuY3Rpb24gKHNpYmxpbmcpIHtcbiAgICAgICAgICBpZiAoc2libGluZyAhPT0gZmllbGQgJiYgc2libGluZy5kZWYuZ3JvdXAgPT09IGdyb3VwTmFtZSkge1xuICAgICAgICAgICAgZmllbGQuZ3JvdXBzW2dyb3VwTmFtZV0ucHVzaChzaWJsaW5nKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgcGFyZW50R3JvdXBGaWVsZHMgPSBmaWVsZC5wYXJlbnQuZ3JvdXBGaWVsZHMoZ3JvdXBOYW1lKTtcbiAgICAgICAgZmllbGQuZ3JvdXBzW2dyb3VwTmFtZV0gPSBmaWVsZC5ncm91cHNbZ3JvdXBOYW1lXS5jb25jYXQocGFyZW50R3JvdXBGaWVsZHMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmaWVsZC5ncm91cHNbZ3JvdXBOYW1lXTtcbiAgfTtcblxuICAvLyBXYWxrIGJhY2t3YXJkcyB0aHJvdWdoIHBhcmVudHMgYW5kIGJ1aWxkIG91dCBhIHBhdGggYXJyYXkgdG8gdGhlIHZhbHVlLlxuICBwcm90by52YWx1ZVBhdGggPSBmdW5jdGlvbiAoY2hpbGRQYXRoKSB7XG4gICAgdmFyIGZpZWxkID0gdGhpcztcblxuICAgIHZhciBwYXRoID0gY2hpbGRQYXRoIHx8IFtdO1xuICAgIGlmICghdXRpbC5pc0JsYW5rKGZpZWxkLmRlZi5rZXkpKSB7XG4gICAgICBwYXRoID0gW2ZpZWxkLmRlZi5rZXldLmNvbmNhdChwYXRoKTtcbiAgICB9XG4gICAgaWYgKGZpZWxkLnBhcmVudCkge1xuICAgICAgcmV0dXJuIGZpZWxkLnBhcmVudC52YWx1ZVBhdGgocGF0aCk7XG4gICAgfVxuICAgIHJldHVybiBwYXRoO1xuICB9O1xuXG4gIC8vIFNldCB0aGUgdmFsdWUgZm9yIHRoaXMgZmllbGQuXG4gIHByb3RvLnZhbCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHZhciBmaWVsZCA9IHRoaXM7XG5cbiAgICBmaWVsZC5mb3JtLmFjdGlvbnMuc2V0VmFsdWUoZmllbGQudmFsdWVQYXRoKCksIHZhbHVlKTtcbiAgfTtcblxuICAvLyBSZW1vdmUgYSBjaGlsZCB2YWx1ZSBmcm9tIHRoaXMgZmllbGQuXG4gIHByb3RvLnJlbW92ZSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzO1xuXG4gICAgdmFyIHBhdGggPSBmaWVsZC52YWx1ZVBhdGgoKS5jb25jYXQoa2V5KTtcblxuICAgIGZpZWxkLmZvcm0uYWN0aW9ucy5yZW1vdmVWYWx1ZShwYXRoKTtcbiAgfTtcblxuICAvLyBNb3ZlIGEgY2hpbGQgdmFsdWUgZnJvbSBvbmUga2V5IHRvIGFub3RoZXIuXG4gIHByb3RvLm1vdmUgPSBmdW5jdGlvbiAoZnJvbUtleSwgdG9LZXkpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzO1xuXG4gICAgZmllbGQuZm9ybS5hY3Rpb25zLm1vdmVWYWx1ZShmaWVsZC52YWx1ZVBhdGgoKSwgZnJvbUtleSwgdG9LZXkpO1xuICB9O1xuXG4gIC8vIEdldCB0aGUgZGVmYXVsdCB2YWx1ZSBmb3IgdGhpcyBmaWVsZC5cbiAgcHJvdG8uZGVmYXVsdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzO1xuXG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKGZpZWxkLmRlZi52YWx1ZSkpIHtcbiAgICAgIHJldHVybiB1dGlsLmNvcHlWYWx1ZShmaWVsZC5kZWYudmFsdWUpO1xuICAgIH1cblxuICAgIGlmICghXy5pc1VuZGVmaW5lZChmaWVsZC5kZWYuZGVmYXVsdCkpIHtcbiAgICAgIHJldHVybiB1dGlsLmNvcHlWYWx1ZShmaWVsZC5kZWYuZGVmYXVsdCk7XG4gICAgfVxuXG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKGZpZWxkLnR5cGVQbHVnaW4oKS5kZWZhdWx0KSkge1xuICAgICAgcmV0dXJuIHV0aWwuY29weVZhbHVlKGZpZWxkLnR5cGVQbHVnaW4oKS5kZWZhdWx0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcblxuICAvLyBBcHBlbmQgYSBuZXcgdmFsdWUuIFVzZSB0aGUgYGl0ZW1JbmRleGAgdG8gZ2V0IGFuIGFwcHJvcHJpYXRlXG4gIC8vIGl0ZW0sIGluZmxhdGUgaXQsIGFuZCBjcmVhdGUgYSBkZWZhdWx0IHZhbHVlLlxuICBwcm90by5hcHBlbmQgPSBmdW5jdGlvbiAoaXRlbUluZGV4KSB7XG4gICAgdmFyIGZpZWxkID0gdGhpcztcblxuICAgIHZhciBpdGVtID0gZmllbGQuaXRlbXMoKVtpdGVtSW5kZXhdO1xuICAgIGl0ZW0gPSBfLmV4dGVuZChpdGVtKTtcblxuICAgIGl0ZW0ua2V5ID0gZmllbGQudmFsdWUubGVuZ3RoO1xuXG4gICAgdmFyIGNoaWxkID0gZmllbGQuY3JlYXRlQ2hpbGQoaXRlbSk7XG5cbiAgICB2YXIgb2JqID0gY2hpbGQuZGVmYXVsdCgpO1xuXG4gICAgaWYgKF8uaXNBcnJheShvYmopIHx8IF8uaXNPYmplY3Qob2JqKSkge1xuICAgICAgdmFyIGNob3AgPSBmaWVsZC52YWx1ZVBhdGgoKS5sZW5ndGggKyAxO1xuXG4gICAgICBjaGlsZC5pbmZsYXRlKGZ1bmN0aW9uIChwYXRoLCB2YWx1ZSkge1xuICAgICAgICBvYmogPSB1dGlsLnNldEluKG9iaiwgcGF0aC5zbGljZShjaG9wKSwgdmFsdWUpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZmllbGQuZm9ybS5hY3Rpb25zLmFwcGVuZFZhbHVlKGZpZWxkLnZhbHVlUGF0aCgpLCBvYmopO1xuICB9O1xuXG4gIC8vIERldGVybWluZSB3aGV0aGVyIHRoZSBmaWVsZCBpcyBoaWRkZW4uXG4gIHByb3RvLmhpZGRlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzO1xuXG4gICAgcmV0dXJuIGZpZWxkLmRlZi5oaWRkZW4gfHwgZmllbGQudHlwZVBsdWdpbigpLmhpZGRlbjtcbiAgfTtcblxuICAvLyBFeHBhbmQgYWxsIGNoaWxkIGZpZWxkcyBhbmQgY2FsbCB0aGUgc2V0dGVyIGZ1bmN0aW9uIHdpdGggdGhlIGRlZmF1bHRcbiAgLy8gdmFsdWVzIGF0IGVhY2ggcGF0aC5cbiAgcHJvdG8uaW5mbGF0ZSA9IGZ1bmN0aW9uIChvblNldFZhbHVlKSB7XG4gICAgdmFyIGZpZWxkID0gdGhpcztcblxuICAgIGlmICghdXRpbC5pc0JsYW5rKGZpZWxkLmRlZi5rZXkpICYmIF8uaXNVbmRlZmluZWQoZmllbGQudmFsdWUpKSB7XG4gICAgICBvblNldFZhbHVlKGZpZWxkLnZhbHVlUGF0aCgpLCBmaWVsZC5kZWZhdWx0KCkpO1xuICAgIH1cblxuICAgIHZhciBmaWVsZHMgPSBmaWVsZC5maWVsZHMoKTtcblxuICAgIGZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uIChjaGlsZCkge1xuICAgICAgY2hpbGQuaW5mbGF0ZShvblNldFZhbHVlKTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBDYWxsZWQgZnJvbSB1bm1vdW50LiBXaGVuIGZpZWxkcyBhcmUgcmVtb3ZlZCBmb3Igd2hhdGV2ZXIgcmVhc29uLCB3ZVxuICAvLyBzaG91bGQgZGVsZXRlIHRoZSBjb3JyZXNwb25kaW5nIHZhbHVlLlxuICBwcm90by5lcmFzZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzO1xuICAgIGlmICghdXRpbC5pc0JsYW5rKGZpZWxkLmRlZi5rZXkpICYmICFfLmlzVW5kZWZpbmVkKGZpZWxkLnZhbHVlKSkge1xuICAgICAgZmllbGQuZm9ybS5hY3Rpb25zLmVyYXNlVmFsdWUoZmllbGQudmFsdWVQYXRoKCksIHt9KTtcbiAgICB9XG4gIH07XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIvLyAjIGNvcmUuZm9ybS1pbml0XG5cbi8qXG5UaGlzIHBsdWdpbiBtYWtlcyBpdCBlYXN5IHRvIGhvb2sgaW50byBmb3JtIGluaXRpYWxpemF0aW9uLCB3aXRob3V0IGhhdmluZyB0b1xuY29uZmlndXJlIGFsbCB0aGUgb3RoZXIgY29yZSBwbHVnaW5zLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICB2YXIgaW5pdFBsdWdpbnMgPSBwbHVnaW4ucmVxdWlyZUFsbChwbHVnaW4uY29uZmlnLmluaXQpO1xuXG4gIHZhciBwcm90byA9IHBsdWdpbi5leHBvcnRzO1xuXG4gIHByb3RvLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGZvcm0gPSB0aGlzO1xuXG4gICAgaW5pdFBsdWdpbnMuZm9yRWFjaChmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgICBwbHVnaW4uYXBwbHkoZm9ybSwgYXJndW1lbnRzKTtcbiAgICB9KTtcbiAgfTtcbn07XG4iLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvcmUuZm9ybVxuXG4vKlxuVGhlIGNvcmUgZm9ybSBwbHVnaW4gc3VwcGxpZXMgbWV0aG9kcyB0aGF0IGdldCBhZGRlZCB0byB0aGUgRm9ybSBwcm90b3R5cGUuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xudmFyIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50ZW1pdHRlcjMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgdmFyIHByb3RvID0gcGx1Z2luLmV4cG9ydHM7XG5cbiAgLy8gR2V0IHRoZSBzdG9yZSBwbHVnaW4uXG4gIHZhciBjcmVhdGVTdG9yZSA9IHBsdWdpbi5yZXF1aXJlKHBsdWdpbi5jb25maWcuc3RvcmUpO1xuXG4gIHZhciB1dGlsID0gcGx1Z2luLnJlcXVpcmUoJ3V0aWwnKTtcbiAgdmFyIGxvYWRlciA9IHBsdWdpbi5yZXF1aXJlKCdsb2FkZXInKTtcblxuICAvLyBIZWxwZXIgdG8gY3JlYXRlIGFjdGlvbnMsIHdoaWNoIHdpbGwgdGVsbCB0aGUgc3RvcmUgdGhhdCBzb21ldGhpbmcgaGFzXG4gIC8vIGhhcHBlbmVkLiBOb3RlIHRoYXQgYWN0aW9ucyBnbyBzdHJhaWdodCB0byB0aGUgc3RvcmUuIE5vIGV2ZW50cyxcbiAgLy8gZGlzcGF0Y2hlciwgZXRjLlxuICB2YXIgY3JlYXRlU3luY0FjdGlvbnMgPSBmdW5jdGlvbiAoc3RvcmUsIG5hbWVzKSB7XG4gICAgdmFyIGFjdGlvbnMgPSB7fTtcbiAgICBuYW1lcy5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICBhY3Rpb25zW25hbWVdID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBzdG9yZVtuYW1lXS5hcHBseShzdG9yZSwgYXJndW1lbnRzKTtcbiAgICAgIH07XG4gICAgfSk7XG4gICAgcmV0dXJuIGFjdGlvbnM7XG4gIH07XG5cbiAgLy8gSW5pdGlhbGl6ZSB0aGUgZm9ybSBpbnN0YW5jZS5cbiAgcHJvdG8uaW5pdCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgdmFyIGZvcm0gPSB0aGlzO1xuXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICAvLyBOZWVkIGFuIGVtaXR0ZXIgdG8gZW1pdCBjaGFuZ2UgZXZlbnRzIGZyb20gdGhlIHN0b3JlLlxuICAgIHZhciBzdG9yZUVtaXR0ZXIgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgICAvLyBDcmVhdGUgYSBzdG9yZS5cbiAgICBmb3JtLnN0b3JlID0gY3JlYXRlU3RvcmUoZm9ybSwgc3RvcmVFbWl0dGVyLCBvcHRpb25zKTtcblxuICAgIC8vIENyZWF0ZSB0aGUgYWN0aW9ucyB0byBub3RpZnkgdGhlIHN0b3JlIG9mIGNoYW5nZXMuXG4gICAgZm9ybS5hY3Rpb25zID0gY3JlYXRlU3luY0FjdGlvbnMoZm9ybS5zdG9yZSwgWydzZXRWYWx1ZScsICdzZXRGaWVsZHMnLCAncmVtb3ZlVmFsdWUnLCAnYXBwZW5kVmFsdWUnLCAnbW92ZVZhbHVlJywgJ2VyYXNlVmFsdWUnLCAnc2V0TWV0YSddKTtcblxuICAgIC8vIFNlZWQgdGhlIHZhbHVlIGZyb20gYW55IGZpZWxkcy5cbiAgICBmb3JtLnN0b3JlLmluZmxhdGUoKTtcblxuICAgIC8vIEFkZCBvbi9vZmYgdG8gZ2V0IGNoYW5nZSBldmVudHMgZnJvbSBmb3JtLlxuICAgIGZvcm0ub24gPSBzdG9yZUVtaXR0ZXIub24uYmluZChzdG9yZUVtaXR0ZXIpO1xuICAgIGZvcm0ub2ZmID0gc3RvcmVFbWl0dGVyLm9mZi5iaW5kKHN0b3JlRW1pdHRlcik7XG4gIH07XG5cbiAgLy8gR2V0IHRoZSByb290IGNvbXBvbmVudCBmb3IgYSBmb3JtLlxuICBwcm90by5jb21wb25lbnQgPSBmdW5jdGlvbiAocHJvcHMpIHtcblxuICAgIHZhciBmb3JtID0gdGhpcztcblxuICAgIHByb3BzID0gXy5leHRlbmQoe30sIHByb3BzLCB7XG4gICAgICBmb3JtOiBmb3JtXG4gICAgfSk7XG5cbiAgICB2YXIgY29tcG9uZW50ID0gcGx1Z2luLmNvbXBvbmVudCgnZm9ybWF0aWMnKTtcblxuICAgIHJldHVybiBjb21wb25lbnQocHJvcHMpO1xuICB9O1xuXG4gIC8vIEdldCBvciBzZXQgdGhlIHZhbHVlIG9mIGEgZm9ybS5cbiAgcHJvdG8udmFsID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFyIGZvcm0gPSB0aGlzO1xuXG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGZvcm0uYWN0aW9ucy5zZXRWYWx1ZSh2YWx1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHV0aWwuY29weVZhbHVlKGZvcm0uc3RvcmUudmFsdWUpO1xuICB9O1xuXG4gIC8vIFNldC9jaGFuZ2UgdGhlIGZpZWxkcyBmb3IgYSBmb3JtLlxuICBwcm90by5maWVsZHMgPSBmdW5jdGlvbiAoZmllbGRzKSB7XG4gICAgdmFyIGZvcm0gPSB0aGlzO1xuXG4gICAgZm9ybS5hY3Rpb25zLnNldEZpZWxkcyhmaWVsZHMpO1xuICB9O1xuXG4gIC8vIEZpbmQgYSBmaWVsZCB0ZW1wbGF0ZSBnaXZlbiBhIGtleS5cbiAgcHJvdG8uZmluZERlZiA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICB2YXIgZm9ybSA9IHRoaXM7XG5cbiAgICByZXR1cm4gZm9ybS5zdG9yZS50ZW1wbGF0ZU1hcFtrZXldIHx8IG51bGw7XG4gIH07XG5cbiAgLy8gR2V0IG9yIHNldCBtZXRhZGF0YS5cbiAgcHJvdG8ubWV0YSA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgdmFyIGZvcm0gPSB0aGlzO1xuXG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGZvcm0uYWN0aW9ucy5zZXRNZXRhKGtleSwgdmFsdWUpO1xuICAgIH1cblxuICAgIHJldHVybiBmb3JtLnN0b3JlLm1ldGFba2V5XTtcbiAgfTtcblxuICAvLyBMb2FkIG1ldGFkYXRhLlxuICBwcm90by5sb2FkTWV0YSA9IGZ1bmN0aW9uIChzb3VyY2UsIHBhcmFtcykge1xuICAgIHBhcmFtcyA9IHBhcmFtcyB8fCB7fTtcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHBhcmFtcyk7XG4gICAgdmFyIHZhbGlkS2V5cyA9IGtleXMuZmlsdGVyKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHJldHVybiBwYXJhbXNba2V5XTtcbiAgICB9KTtcbiAgICBpZiAodmFsaWRLZXlzLmxlbmd0aCA8IGtleXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxvYWRlci5sb2FkTWV0YSh0aGlzLCBzb3VyY2UsIHBhcmFtcyk7XG4gIH07XG5cbiAgLy8gQWRkIGEgbWV0ZGF0YSBzb3VyY2UgZnVuY3Rpb24sIHZpYSB0aGUgbG9hZGVyIHBsdWdpbi5cbiAgcHJvdG8uc291cmNlID0gbG9hZGVyLnNvdXJjZTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29yZS5mb3JtYXRpY1xuXG4vKlxuVGhlIGNvcmUgZm9ybWF0aWMgcGx1Z2luIGFkZHMgbWV0aG9kcyB0byB0aGUgZm9ybWF0aWMgaW5zdGFuY2UuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICB2YXIgZiA9IHBsdWdpbi5leHBvcnRzO1xuXG4gIC8vIFVzZSB0aGUgZmllbGQtcm91dGVyIHBsdWdpbiBhcyB0aGUgcm91dGVyLlxuICB2YXIgcm91dGVyID0gcGx1Z2luLnJlcXVpcmUoJ2ZpZWxkLXJvdXRlcicpO1xuXG4gIC8vIFJvdXRlIGEgZmllbGQgdG8gYSBjb21wb25lbnQuXG4gIGYucm91dGUgPSByb3V0ZXIucm91dGU7XG5cbiAgLy8gUmVuZGVyIGEgY29tcG9uZW50IHRvIGEgbm9kZS5cbiAgZi5yZW5kZXIgPSBmdW5jdGlvbiAoY29tcG9uZW50LCBub2RlKSB7XG5cbiAgICBSZWFjdC5yZW5kZXJDb21wb25lbnQoY29tcG9uZW50LCBub2RlKTtcbiAgfTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcGlsZXJcblxuLy8gVGhlIGNvbXBpbGVyIHBsdWdpbiBrbm93cyBob3cgdG8gbm9ybWFsaXplIGZpZWxkIGRlZmluaXRpb25zIGludG8gc3RhbmRhcmRcbi8vIGZpZWxkIGRlZmluaXRpb25zIHRoYXQgY2FuIGJlIHVuZGVyc3Rvb2QgYmUgcm91dGVycyBhbmQgY29tcG9uZW50cy5cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgLy8gR3JhYiBhbGwgdGhlIGNvbXBpbGVyIHBsdWdpbnMgd2hpY2ggY2FuIGJlIHN0YWNrZWQuXG4gIHZhciBjb21waWxlclBsdWdpbnMgPSBwbHVnaW4ucmVxdWlyZUFsbChwbHVnaW4uY29uZmlnLmNvbXBpbGVycyk7XG5cbiAgdmFyIHV0aWwgPSBwbHVnaW4ucmVxdWlyZSgndXRpbCcpO1xuXG4gIHZhciBjb21waWxlciA9IHBsdWdpbi5leHBvcnRzO1xuXG4gIC8vIEZvciBhIHNldCBvZiBmaWVsZHMsIG1ha2UgYSBtYXAgb2YgdGVtcGxhdGUgbmFtZXMgdG8gZmllbGQgZGVmaW5pdGlvbnMuIEFsbFxuICAvLyBmaWVsZCBkZWZpbml0aW9ucyBjYW4gYmUgdXNlZCBhcyB0ZW1wbGF0ZXMsIHdoZXRoZXIgbWFya2VkIGFzIHRlbXBsYXRlcyBvclxuICAvLyBub3QuXG4gIGNvbXBpbGVyLnRlbXBsYXRlTWFwID0gZnVuY3Rpb24gKGZpZWxkcykge1xuICAgIHZhciBtYXAgPSB7fTtcbiAgICBmaWVsZHMuZm9yRWFjaChmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgIGlmIChmaWVsZC5rZXkpIHtcbiAgICAgICAgbWFwW2ZpZWxkLmtleV0gPSBmaWVsZDtcbiAgICAgIH1cbiAgICAgIGlmIChmaWVsZC5pZCkge1xuICAgICAgICBtYXBbZmllbGQuaWRdID0gZmllbGQ7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG1hcDtcbiAgfTtcblxuICAvLyBGaWVsZHMgYW5kIGl0ZW1zIGNhbiBleHRlbmQgb3RoZXIgZmllbGQgZGVmaW5pdGlvbnMuIEZpZWxkcyBjYW4gYWxzbyBoYXZlXG4gIC8vIGNoaWxkIGZpZWxkcyB0aGF0IHBvaW50IHRvIG90aGVyIGZpZWxkIGRlZmluaXRpb25zLiBIZXJlLCB3ZSBleHBhbmQgYWxsXG4gIC8vIHRob3NlIG91dCBzbyB0aGF0IGNvbXBvbmVudHMgZG9uJ3QgaGF2ZSB0byB3b3JyeSBhYm91dCB0aGlzLlxuICBjb21waWxlci5leHBhbmREZWYgPSBmdW5jdGlvbiAoZGVmLCB0ZW1wbGF0ZU1hcCkge1xuICAgIHZhciBpc1RlbXBsYXRlID0gZGVmLnRlbXBsYXRlO1xuICAgIHZhciBleHQgPSBkZWYuZXh0ZW5kcztcbiAgICBpZiAoXy5pc1N0cmluZyhleHQpKSB7XG4gICAgICBleHQgPSBbZXh0XTtcbiAgICB9XG4gICAgaWYgKGV4dCkge1xuICAgICAgdmFyIGJhc2VzID0gZXh0Lm1hcChmdW5jdGlvbiAoYmFzZSkge1xuICAgICAgICB2YXIgdGVtcGxhdGUgPSB0ZW1wbGF0ZU1hcFtiYXNlXTtcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGVtcGxhdGUgJyArIGJhc2UgKyAnIG5vdCBmb3VuZC4nKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGVtcGxhdGU7XG4gICAgICB9KTtcbiAgICAgIHZhciBjaGFpbiA9IFt7fV0uY29uY2F0KGJhc2VzLnJldmVyc2UoKS5jb25jYXQoW2RlZl0pKTtcbiAgICAgIGRlZiA9IF8uZXh0ZW5kLmFwcGx5KF8sIGNoYWluKTtcbiAgICB9XG4gICAgaWYgKGRlZi5maWVsZHMpIHtcbiAgICAgIGRlZi5maWVsZHMgPSBkZWYuZmllbGRzLm1hcChmdW5jdGlvbiAoY2hpbGREZWYpIHtcbiAgICAgICAgaWYgKCFfLmlzU3RyaW5nKGNoaWxkRGVmKSkge1xuICAgICAgICAgIHJldHVybiBjb21waWxlci5leHBhbmREZWYoY2hpbGREZWYsIHRlbXBsYXRlTWFwKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2hpbGREZWY7XG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKGRlZi5pdGVtcykge1xuICAgICAgZGVmLml0ZW1zID0gZGVmLml0ZW1zLm1hcChmdW5jdGlvbiAoaXRlbURlZikge1xuICAgICAgICBpZiAoIV8uaXNTdHJpbmcoaXRlbURlZikpIHtcbiAgICAgICAgICByZXR1cm4gY29tcGlsZXIuZXhwYW5kRGVmKGl0ZW1EZWYsIHRlbXBsYXRlTWFwKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaXRlbURlZjtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoIWlzVGVtcGxhdGUgJiYgZGVmLnRlbXBsYXRlKSB7XG4gICAgICBkZWxldGUgZGVmLnRlbXBsYXRlO1xuICAgIH1cbiAgICByZXR1cm4gZGVmO1xuICB9O1xuXG4gIC8vIEZvciBhbiBhcnJheSBvZiBmaWVsZCBkZWZpbml0aW9ucywgZXhwYW5kIGVhY2ggZmllbGQgZGVmaW5pdGlvbi5cbiAgY29tcGlsZXIuZXhwYW5kRmllbGRzID0gZnVuY3Rpb24gKGZpZWxkcykge1xuICAgIHZhciB0ZW1wbGF0ZU1hcCA9IGNvbXBpbGVyLnRlbXBsYXRlTWFwKGZpZWxkcyk7XG4gICAgcmV0dXJuIGZpZWxkcy5tYXAoZnVuY3Rpb24gKGRlZikge1xuICAgICAgcmV0dXJuIGNvbXBpbGVyLmV4cGFuZERlZihkZWYsIHRlbXBsYXRlTWFwKTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBSdW4gYSBmaWVsZCBkZWZpbml0aW9uIHRocm91Z2ggYWxsIGF2YWlsYWJsZSBjb21waWxlcnMuXG4gIGNvbXBpbGVyLmNvbXBpbGVEZWYgPSBmdW5jdGlvbiAoZGVmKSB7XG5cbiAgICBkZWYgPSB1dGlsLmRlZXBDb3B5KGRlZik7XG5cbiAgICB2YXIgcmVzdWx0O1xuICAgIGNvbXBpbGVyUGx1Z2lucy5mb3JFYWNoKGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICAgIHJlc3VsdCA9IHBsdWdpbi5jb21waWxlKGRlZik7XG4gICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgIGRlZiA9IHJlc3VsdDtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciB0eXBlUGx1Z2luID0gcGx1Z2luLnJlcXVpcmUoJ3R5cGUuJyArIGRlZi50eXBlKTtcblxuICAgIGlmICh0eXBlUGx1Z2luLmNvbXBpbGUpIHtcbiAgICAgIHJlc3VsdCA9IHR5cGVQbHVnaW4uY29tcGlsZShkZWYpO1xuICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICBkZWYgPSByZXN1bHQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRlZjtcbiAgfTtcblxuICAvLyBGb3IgYW4gYXJyYXkgb2YgZmllbGQgZGVmaW5pdGlvbnMsIGNvbXBpbGUgZWFjaCBmaWVsZCBkZWZpbml0aW9uLlxuICBjb21waWxlci5jb21waWxlRmllbGRzID0gZnVuY3Rpb24gKGZpZWxkcykge1xuICAgIHJldHVybiBmaWVsZHMubWFwKGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgcmV0dXJuIGNvbXBpbGVyLmNvbXBpbGVEZWYoZmllbGQpO1xuICAgIH0pO1xuICB9O1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiLy8gIyBjb21wb25lbnRcblxuLy8gQXQgaXRzIG1vc3QgYmFzaWMgbGV2ZWwsIHRoZSBjb21wb25lbnQgcGx1Z2luIHNpbXBseSBtYXBzIGNvbXBvbmVudCBuYW1lcyB0b1xuLy8gcGx1Z2luIG5hbWVzLCByZXR1cm5pbmcgdGhlIGNvbXBvbmVudCBmYWN0b3J5IGZvciB0aGF0IGNvbXBvbmVudC4gRm9yXG4vLyBleGFtcGxlLCBgcGx1Z2luLmNvbXBvbmVudCgndGV4dCcpYCBiZWNvbWVzXG4vLyBgcGx1Z2luLnJlcXVpcmUoJ2NvbXBvbmVudC50ZXh0JylgLiBUaGlzIGlzIGEgdXNlZnVsIHBsYWNob2xkZXIgaW4gY2FzZSB3ZVxuLy8gbGF0ZXIgd2FudCB0byBtYWtlIGZvcm1hdGljIGFibGUgdG8gZGVjaWRlIGNvbXBvbmVudHMgYXQgcnVudGltZS4gRm9yIG5vdyxcbi8vIGhvd2V2ZXIsIHRoaXMgYWxsb3dzIHVzIHRvIGluamVjdCBcInByb3AgbW9kaWZpZXJzXCIgd2hpY2ggYXJlIHBsdWdpbnMgdGhhdFxuLy8gbW9kaWZ5IGEgY29tcG9uZW50cyBwcm9wZXJ0aWVzIGJlZm9yZSBpdCByZWNlaXZlcyB0aGVtLlxuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIC8vIFJlZ2lzdHJ5IGZvciBwcm9wIG1vZGlmaWVycy5cbiAgdmFyIHByb3BNb2RpZmllcnMgPSB7fTtcblxuICAvLyBBZGQgYSBcInByb3AgbW9kaWZlclwiIHdoaWNoIGlzIGp1c3QgYSBmdW5jdGlvbiB0aGF0IG1vZGlmaWVzIGEgY29tcG9uZW50c1xuICAvLyBwcm9wZXJ0aWVzIGJlZm9yZSBpdCByZWNlaXZlcyB0aGVtLlxuICB2YXIgYWRkUHJvcE1vZGlmaWVyID0gZnVuY3Rpb24gKG5hbWUsIG1vZGlmeUZuKSB7XG4gICAgaWYgKCFwcm9wTW9kaWZpZXJzW25hbWVdKSB7XG4gICAgICBwcm9wTW9kaWZpZXJzW25hbWVdID0gW107XG4gICAgfVxuICAgIHByb3BNb2RpZmllcnNbbmFtZV0ucHVzaChtb2RpZnlGbik7XG4gIH07XG5cbiAgLy8gR3JhYiBhbGwgdGhlIHByb3AgbW9kaWZpZXIgcGx1Z2lucy5cbiAgdmFyIHByb3BzUGx1Z2lucyA9IHBsdWdpbi5yZXF1aXJlQWxsKHBsdWdpbi5jb25maWcucHJvcHMpO1xuXG4gIC8vIFJlZ2lzdGVyIGFsbCB0aGUgcHJvcCBtb2RpZmllciBwbHVnaW5zLlxuICBwcm9wc1BsdWdpbnMuZm9yRWFjaChmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgYWRkUHJvcE1vZGlmaWVyLmFwcGx5KG51bGwsIHBsdWdpbik7XG4gIH0pO1xuXG4gIC8vIFJlZ2lzdHJ5IGZvciBjb21wb25lbnQgZmFjdG9yaWVzLiBTaW5jZSB3ZSdsbCBiZSBtb2RpZnlpbmcgdGhlIHByb3BzIGdvaW5nXG4gIC8vIHRvIHRoZSBmYWN0b3JpZXMsIHdlJ2xsIHN0b3JlIG91ciBvd24gY29tcG9uZW50IGZhY3RvcmllcyBoZXJlLlxuICB2YXIgY29tcG9uZW50RmFjdG9yaWVzID0ge307XG5cbiAgLy8gUmV0cmlldmUgdGhlIGFwcHJvcHJpYXRlIGNvbXBvbmVudCBmYWN0b3J5LCB3aGljaCBtYXkgYmUgYSB3cmFwcGVyIHRoYXRcbiAgLy8gcnVucyB0aGUgY29tcG9uZW50IHByb3BlcnRpZXMgdGhyb3VnaCBwcm9wIG1vZGlmaWVyIGZ1bmN0aW9ucy5cbiAgcGx1Z2luLmV4cG9ydHMuY29tcG9uZW50ID0gZnVuY3Rpb24gKG5hbWUpIHtcblxuICAgIGlmICghY29tcG9uZW50RmFjdG9yaWVzW25hbWVdKSB7XG4gICAgICB2YXIgY29tcG9uZW50ID0gcGx1Z2luLnJlcXVpcmUoJ2NvbXBvbmVudC4nICsgbmFtZSk7XG4gICAgICBjb21wb25lbnRGYWN0b3JpZXNbbmFtZV0gPSBmdW5jdGlvbiAocHJvcHMsIGNoaWxkcmVuKSB7XG4gICAgICAgIGlmIChwcm9wTW9kaWZpZXJzW25hbWVdKSB7XG4gICAgICAgICAgcHJvcE1vZGlmaWVyc1tuYW1lXS5mb3JFYWNoKGZ1bmN0aW9uIChtb2RpZnkpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBtb2RpZnkocHJvcHMpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICBwcm9wcyA9IHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29tcG9uZW50KHByb3BzLCBjaGlsZHJlbik7XG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gY29tcG9uZW50RmFjdG9yaWVzW25hbWVdO1xuICB9O1xufTtcbiIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29yZVxuXG4vLyBUaGUgY29yZSBwbHVnaW4gZXhwb3J0cyBhIGZ1bmN0aW9uIHRoYXQgdGFrZXMgYSBmb3JtYXRpYyBpbnN0YW5jZSBhbmRcbi8vIGV4dGVuZHMgdGhlIGluc3RhbmNlIHdpdGggYWRkaXRpb25hbCBtZXRob2RzLlxuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IGZ1bmN0aW9uIChmb3JtYXRpYykge1xuXG4gICAgLy8gVGhlIGNvcmUgcGx1Z2luIHJlYWxseSBkb2Vzbid0IGRvIG11Y2guIEl0IGFjdHVhbGx5IHJlbGllcyBvbiBvdGhlclxuICAgIC8vIHBsdWdpbnMgdG8gZG8gdGhlIGRpcnR5IHdvcmsuIFRoaXMgd2F5LCB5b3UgY2FuIGVhc2lseSBhZGQgYWRkaXRpb25hbFxuICAgIC8vIHBsdWdpbnMgdG8gZG8gbW9yZSBkaXJ0eSB3b3JrLlxuICAgIHZhciBmb3JtYXRpY1BsdWdpbnMgPSBwbHVnaW4ucmVxdWlyZUFsbChwbHVnaW4uY29uZmlnLmZvcm1hdGljKTtcblxuICAgIC8vIFdlIGhhdmUgc3BlY2lhbCBmb3JtIHBsdWdpbnMgd2hpY2ggYXJlIGp1c3QgdXNlZCB0byBtb2RpZnkgdGhlIEZvcm1cbiAgICAvLyBwcm90b3R5cGUuXG4gICAgdmFyIGZvcm1QbHVnaW5zID0gcGx1Z2luLnJlcXVpcmVBbGwocGx1Z2luLmNvbmZpZy5mb3JtKTtcblxuICAgIC8vIFBhc3MgdGhlIGZvcm1hdGljIGluc3RhbmNlIG9mZiB0byBlYWNoIG9mIHRoZSBmb3JtYXRpYyBwbHVnaW5zLlxuICAgIGZvcm1hdGljUGx1Z2lucy5mb3JFYWNoKGZ1bmN0aW9uIChmKSB7XG4gICAgICBfLmtleXMoZikuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIGlmICghXy5pc1VuZGVmaW5lZChmb3JtYXRpY1trZXldKSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUHJvcGVydHkgYWxyZWFkeSBkZWZpbmVkIGZvciBmb3JtYXRpYzogJyArIGtleSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9ybWF0aWNba2V5XSA9IGZba2V5XTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gIyMgRm9ybSBwcm90b3R5cGVcblxuICAgIC8vIFRoZSBGb3JtIGNvbnN0cnVjdG9yIGNyZWF0ZXMgYSBmb3JtIGdpdmVuIGEgc2V0IG9mIG9wdGlvbnMuIE9wdGlvbnNcbiAgICAvLyBjYW4gaGF2ZSBgZmllbGRzYCBhbmQgYHZhbHVlYC5cbiAgICB2YXIgRm9ybSA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICBpZiAodGhpcy5pbml0KSB7XG4gICAgICAgIHRoaXMuaW5pdChvcHRpb25zKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gQWRkIHRoZSBmb3JtIGZhY3RvcnkgdG8gdGhlIGZvcm1hdGljIGluc3RhbmNlLlxuICAgIGZvcm1hdGljLmZvcm0gPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgcmV0dXJuIG5ldyBGb3JtKG9wdGlvbnMpO1xuICAgIH07XG5cbiAgICBGb3JtLnByb3RvdHlwZSA9IGZvcm1hdGljLmZvcm07XG5cbiAgICAvLyBLZWVwIGZvcm0gaW5pdCBtZXRob2RzIGhlcmUuXG4gICAgdmFyIGluaXRzID0gW107XG5cbiAgICAvLyBHbyB0aHJvdWdoIGZvcm0gcGx1Z2lucyBhbmQgYWRkIGVhY2ggcGx1Z2luJ3MgbWV0aG9kcyB0byB0aGUgZm9ybVxuICAgIC8vIHByb3RvdHlwZS5cbiAgICBmb3JtUGx1Z2lucy5mb3JFYWNoKGZ1bmN0aW9uIChwcm90bykge1xuICAgICAgXy5rZXlzKHByb3RvKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgLy8gSW5pdCBwbHVnaW5zIGNhbiBiZSBzdGFja2VkLlxuICAgICAgICBpZiAoa2V5ID09PSAnaW5pdCcpIHtcbiAgICAgICAgICBpbml0cy5wdXNoKHByb3RvW2tleV0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICghXy5pc1VuZGVmaW5lZChGb3JtLnByb3RvdHlwZVtrZXldKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQcm9wZXJ0eSBhbHJlYWR5IGRlZmluZWQgZm9yIGZvcm06ICcgKyBrZXkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBGb3JtLnByb3RvdHlwZVtrZXldID0gcHJvdG9ba2V5XTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgYW4gaW5pdCBtZXRob2QgZm9yIHRoZSBmb3JtIHByb3RvdHlwZSBiYXNlZCBvbiB0aGUgYXZhaWxhYmxlIGluaXRcbiAgICAvLyBtZXRob2RzLlxuICAgIGlmIChpbml0cy5sZW5ndGggPT09IDApIHtcbiAgICAgIEZvcm0ucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoKSB7fTtcbiAgICB9IGVsc2UgaWYgKGluaXRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgRm9ybS5wcm90b3R5cGUuaW5pdCA9IGluaXRzWzBdO1xuICAgIH0gZWxzZSB7XG4gICAgICBGb3JtLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgZm9ybSA9IHRoaXM7XG4gICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuXG4gICAgICAgIGluaXRzLmZvckVhY2goZnVuY3Rpb24gKGluaXQpIHtcbiAgICAgICAgICBpbml0LmFwcGx5KGZvcm0sIGFyZ3MpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfVxuICB9O1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBldmFsLWZ1bmN0aW9uc1xuXG4vKlxuRGVmYXVsdCBldmFsIGZ1bmN0aW9ucy4gRWFjaCBmdW5jdGlvbiBpcyBwYXJ0IG9mIGl0cyBvd24gcGx1Z2luLCBidXQgYWxsIGFyZVxua2VwdCB0b2dldGhlciBoZXJlIGFzIHBhcnQgb2YgYSBwbHVnaW4gYnVuZGxlLlxuXG5Ob3RlIHRoYXQgZXZhbCBmdW5jdGlvbnMgZGVjaWRlIHdoZW4gdGhlaXIgYXJndW1lbnRzIGdldCBldmFsdWF0ZWQuIFRoaXMgd2F5LFxueW91IGNhbiBjcmVhdGUgY29udHJvbCBzdHJ1Y3R1cmVzIChsaWtlIGlmKSB0aGF0IGNvbmRpdGlvbmFsbHkgZXZhbHVhdGVzIGl0c1xuYXJndW1lbnRzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxudmFyIHdyYXBGbiA9IGZ1bmN0aW9uIChmbikge1xuICByZXR1cm4gZnVuY3Rpb24gKHBsdWdpbikge1xuICAgIHBsdWdpbi5leHBvcnRzID0gZnVuY3Rpb24gKGFyZ3MsIGZpZWxkLCBjb250ZXh0KSB7XG4gICAgICBhcmdzID0gZmllbGQuZXZhbChhcmdzLCBjb250ZXh0KTtcbiAgICAgIHZhciByZXN1bHQgPSBmbi5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcbn07XG5cbnZhciBtZXRob2RDYWxsID0gZnVuY3Rpb24gKG1ldGhvZCkge1xuICByZXR1cm4gZnVuY3Rpb24gKHBsdWdpbikge1xuICAgIHBsdWdpbi5leHBvcnRzID0gZnVuY3Rpb24gKGFyZ3MsIGZpZWxkLCBjb250ZXh0KSB7XG4gICAgICBhcmdzID0gZmllbGQuZXZhbChhcmdzLCBjb250ZXh0KTtcbiAgICAgIGlmIChhcmdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIGFyZ3NbMF1bbWV0aG9kXS5hcHBseShhcmdzWzBdLCBhcmdzLnNsaWNlKDEpKTtcbiAgICAgIH1cbiAgICB9O1xuICB9O1xufTtcblxudmFyIHBsdWdpbnMgPSB7XG4gIGlmOiBmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgcGx1Z2luLmV4cG9ydHMgPSBmdW5jdGlvbiAoYXJncywgZmllbGQsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiBmaWVsZC5ldmFsKGFyZ3NbMF0sIGNvbnRleHQpID8gZmllbGQuZXZhbChhcmdzWzFdLCBjb250ZXh0KSA6IGZpZWxkLmV2YWwoYXJnc1syXSwgY29udGV4dCk7XG4gICAgfTtcbiAgfSxcblxuICBlcTogZnVuY3Rpb24gKHBsdWdpbikge1xuICAgIHBsdWdpbi5leHBvcnRzID0gZnVuY3Rpb24gKGFyZ3MsIGZpZWxkLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gZmllbGQuZXZhbChhcmdzWzBdLCBjb250ZXh0KSA9PT0gZmllbGQuZXZhbChhcmdzWzFdLCBjb250ZXh0KTtcbiAgICB9O1xuICB9LFxuXG4gIG5vdDogZnVuY3Rpb24gKHBsdWdpbikge1xuICAgIHBsdWdpbi5leHBvcnRzID0gZnVuY3Rpb24gKGFyZ3MsIGZpZWxkLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gIWZpZWxkLmV2YWwoYXJnc1swXSwgY29udGV4dCk7XG4gICAgfTtcbiAgfSxcblxuICBvcjogZnVuY3Rpb24gKHBsdWdpbikge1xuICAgIHBsdWdpbi5leHBvcnRzID0gZnVuY3Rpb24gKGFyZ3MsIGZpZWxkLCBjb250ZXh0KSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGFyZyA9IGZpZWxkLmV2YWwoYXJnc1tpXSwgY29udGV4dCk7XG4gICAgICAgIGlmIChhcmcpIHtcbiAgICAgICAgICByZXR1cm4gYXJnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gYXJnc1thcmdzLmxlbmd0aCAtIDFdO1xuICAgIH07XG4gIH0sXG5cbiAgYW5kOiBmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgcGx1Z2luLmV4cG9ydHMgPSBmdW5jdGlvbiAoYXJncywgZmllbGQsIGNvbnRleHQpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgYXJnID0gZmllbGQuZXZhbChhcmdzW2ldLCBjb250ZXh0KTtcbiAgICAgICAgaWYgKCFhcmcgfHwgaSA9PT0gKGFyZ3MubGVuZ3RoIC0gMSkpIHtcbiAgICAgICAgICByZXR1cm4gYXJnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH07XG4gIH0sXG5cbiAgZ2V0OiBmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgdmFyIGdldCA9IHBsdWdpbi5leHBvcnRzID0gZnVuY3Rpb24gKGFyZ3MsIGZpZWxkLCBjb250ZXh0KSB7XG4gICAgICB2YXIgdXRpbCA9IHBsdWdpbi5yZXF1aXJlKCd1dGlsJyk7XG4gICAgICB2YXIga2V5ID0gZmllbGQuZXZhbChhcmdzWzBdLCBjb250ZXh0KTtcbiAgICAgIHZhciBvYmo7XG4gICAgICBpZiAoY29udGV4dCAmJiBrZXkgaW4gY29udGV4dCkge1xuICAgICAgICBvYmogPSBjb250ZXh0W2tleV07XG4gICAgICB9IGVsc2UgaWYgKCFfLmlzVW5kZWZpbmVkKGZpZWxkLnZhbHVlKSAmJiBrZXkgaW4gZmllbGQudmFsdWUpIHtcbiAgICAgICAgb2JqID0gZmllbGQudmFsdWVba2V5XTtcbiAgICAgIH0gZWxzZSBpZiAoZmllbGQucGFyZW50KSB7XG4gICAgICAgIG9iaiA9IGdldChhcmdzLCBmaWVsZC5wYXJlbnQpO1xuICAgICAgfVxuICAgICAgaWYgKGFyZ3MubGVuZ3RoID4gMSkge1xuICAgICAgICB2YXIgZ2V0SW5LZXlzID0gZmllbGQuZXZhbChhcmdzLnNsaWNlKDEpLCBjb250ZXh0KTtcbiAgICAgICAgcmV0dXJuIHV0aWwuZ2V0SW4ob2JqLCBnZXRJbktleXMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG9iajtcbiAgICB9O1xuICB9LFxuXG4gIGdldEdyb3VwVmFsdWVzOiBmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgcGx1Z2luLmV4cG9ydHMgPSBmdW5jdGlvbiAoYXJncywgZmllbGQsIGNvbnRleHQpIHtcbiAgICAgIHZhciBncm91cE5hbWUgPSBmaWVsZC5ldmFsKGFyZ3NbMF0sIGNvbnRleHQpO1xuXG4gICAgICB2YXIgZ3JvdXBGaWVsZHMgPSBmaWVsZC5ncm91cEZpZWxkcyhncm91cE5hbWUpO1xuXG4gICAgICByZXR1cm4gZ3JvdXBGaWVsZHMubWFwKGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgICByZXR1cm4gZmllbGQudmFsdWU7XG4gICAgICB9KTtcbiAgICB9O1xuICB9LFxuXG4gIGdldE1ldGE6IGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICB2YXIgdXRpbCA9IHBsdWdpbi5yZXF1aXJlKCd1dGlsJyk7XG4gICAgcGx1Z2luLmV4cG9ydHMgPSBmdW5jdGlvbiAoYXJncywgZmllbGQsIGNvbnRleHQpIHtcbiAgICAgIGFyZ3MgPSBmaWVsZC5ldmFsKGFyZ3MsIGNvbnRleHQpO1xuICAgICAgdmFyIGNhY2hlS2V5ID0gdXRpbC5tZXRhQ2FjaGVLZXkoYXJnc1swXSwgYXJnc1sxXSk7XG4gICAgICByZXR1cm4gZmllbGQuZm9ybS5tZXRhKGNhY2hlS2V5KTtcbiAgICB9O1xuICB9LFxuXG4gIHN1bTogZnVuY3Rpb24gKHBsdWdpbikge1xuICAgIHBsdWdpbi5leHBvcnRzID0gZnVuY3Rpb24gKGFyZ3MsIGZpZWxkLCBjb250ZXh0KSB7XG4gICAgICB2YXIgc3VtID0gMDtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgICBzdW0gKz0gZmllbGQuZXZhbChhcmdzW2ldLCBjb250ZXh0KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdW07XG4gICAgfTtcbiAgfSxcblxuICBmb3JFYWNoOiBmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgcGx1Z2luLmV4cG9ydHMgPSBmdW5jdGlvbiAoYXJncywgZmllbGQsIGNvbnRleHQpIHtcbiAgICAgIHZhciBpdGVtTmFtZSA9IGFyZ3NbMF07XG4gICAgICB2YXIgYXJyYXkgPSBmaWVsZC5ldmFsKGFyZ3NbMV0sIGNvbnRleHQpO1xuICAgICAgdmFyIG1hcEV4cHIgPSBhcmdzWzJdO1xuICAgICAgdmFyIGZpbHRlckV4cHIgPSBhcmdzWzNdO1xuICAgICAgY29udGV4dCA9IE9iamVjdC5jcmVhdGUoY29udGV4dCB8fCB7fSk7XG5cbiAgICAgIHZhciByZXN1bHRzID0gW107XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGl0ZW0gPSBhcnJheVtpXTtcbiAgICAgICAgY29udGV4dFtpdGVtTmFtZV0gPSBpdGVtO1xuICAgICAgICBpZiAoXy5pc1VuZGVmaW5lZChmaWx0ZXJFeHByKSB8fCBmaWVsZC5ldmFsKGZpbHRlckV4cHIsIGNvbnRleHQpKSB7XG4gICAgICAgICAgcmVzdWx0cy5wdXNoKGZpZWxkLmV2YWwobWFwRXhwciwgY29udGV4dCkpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH07XG4gIH0sXG5cbiAgY29uY2F0OiBtZXRob2RDYWxsKCdjb25jYXQnKSxcbiAgc3BsaXQ6IG1ldGhvZENhbGwoJ3NwbGl0JyksXG4gIHJldmVyc2U6IG1ldGhvZENhbGwoJ3JldmVyc2UnKSxcbiAgam9pbjogbWV0aG9kQ2FsbCgnam9pbicpLFxuXG4gIGh1bWFuaXplOiBmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgdmFyIHV0aWwgPSBwbHVnaW4ucmVxdWlyZSgndXRpbCcpO1xuICAgIHBsdWdpbi5leHBvcnRzID0gZnVuY3Rpb24gKGFyZ3MsIGZpZWxkLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gdXRpbC5odW1hbml6ZShmaWVsZC5ldmFsKGFyZ3NbMF0sIGNvbnRleHQpKTtcbiAgICB9O1xuICB9LFxuXG4gIHBpY2s6IHdyYXBGbihfLnBpY2spLFxuICBwbHVjazogd3JhcEZuKF8ucGx1Y2spXG59O1xuXG4vLyBCdWlsZCBhIHBsdWdpbiBidW5kbGUuXG5fLmVhY2gocGx1Z2lucywgZnVuY3Rpb24gKGZuLCBuYW1lKSB7XG4gIG1vZHVsZS5leHBvcnRzWydldmFsLWZ1bmN0aW9uLicgKyBuYW1lXSA9IGZuO1xufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgZXZhbFxuXG4vKlxuVGhlIGV2YWwgcGx1Z2luIHdpbGwgZXZhbHVhdGUgYSBmaWVsZCdzIGBldmFsYCBwcm9wZXJ0eSAod2hpY2ggbXVzdCBiZSBhblxub2JqZWN0KSBhbmQgZXhjaGFuZ2UgdGhlIHByb3BlcnRpZXMgb2YgdGhhdCBvYmplY3QgZm9yIHdoYXRldmVyIHRoZVxuZXhwcmVzc2lvbiByZXR1cm5zLiBFeHByZXNzaW9ucyBhcmUganVzdCBKU09OIGV4Y2VwdCBpZiB0aGUgZmlyc3QgZWxlbWVudCBvZlxuYW4gYXJyYXkgaXMgYSBzdHJpbmcgdGhhdCBzdGFydHMgd2l0aCAnQCcuIEluIHRoYXQgY2FzZSwgdGhlIGFycmF5IGlzXG50cmVhdGVkIGFzIGEgTGlzcCBleHByZXNzaW9uIHdoZXJlIHRoZSBmaXJzdCBlbGVtZW50IHJlZmVycyB0byBhIGZ1bmN0aW9uXG50aGF0IGlzIGNhbGxlZCB3aXRoIHRoZSByZXN0IG9mIHRoZSBlbGVtZW50cyBhcyB0aGUgYXJndW1lbnRzLiBGb3IgZXhhbXBsZTpcblxuYGBganNcblsnQHN1bScsIDEsIDJdXG5gYGBcblxud2lsbCByZXR1cm4gdGhlIHZhbHVlIDMuIFRoZSBleHByZXNzaW9uIGNvdWxkIGJlIHVzZWQgaW4gYW4gYGV2YWxgIHByb3BlcnR5IG9mXG5hIGZpZWxkIGxpa2U6XG5cbmBgYGpzXG57XG4gIHR5cGU6ICdzdHJpbmcnLFxuICBrZXk6ICduYW1lJyxcbiAgZXZhbDoge1xuICAgIHJvd3M6IFsnQHN1bScsIDEsIDJdXG4gIH1cbn1cbmBgYFxuXG5UaGUgYHJvd3NgIHByb3BlcnR5IG9mIHRoZSBmaWVsZCB3b3VsZCBiZSBzZXQgdG8gMyBpbiB0aGlzIGNhc2UuXG5cbkFueSBwbHVnaW4gcmVnaXN0ZXJlZCB3aXRoIHRoZSBwcmVmaXggYGV2YWwtZnVuY3Rpb24uYCB3aWxsIGJlIGF2YWlsYWJsZSBhcyBhXG5mdW5jdGlvbiBpbiB0aGVzZSBleHByZXNzaW9ucy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIC8vIEdyYWIgYWxsIHRoZSBmdW5jdGlvbiBwbHVnaW5zLlxuICB2YXIgZXZhbEZ1bmN0aW9uUGx1Z2lucyA9IHBsdWdpbi5yZXF1aXJlQWxsT2YoJ2V2YWwtZnVuY3Rpb24nKTtcblxuICAvLyBKdXN0IHN0cmlwIG9mZiB0aGUgJ2V2YWwtZnVuY3Rpb25zLicgcHJlZml4IGFuZCBwdXQgaW4gYSBkaWZmZXJlbnQgb2JqZWN0LlxuICB2YXIgZnVuY3Rpb25zID0ge307XG4gIF8uZWFjaChldmFsRnVuY3Rpb25QbHVnaW5zLCBmdW5jdGlvbiAoZm4sIG5hbWUpIHtcbiAgICB2YXIgZm5OYW1lID0gbmFtZS5zdWJzdHJpbmcobmFtZS5pbmRleE9mKCcuJykgKyAxKTtcbiAgICBmdW5jdGlvbnNbZm5OYW1lXSA9IGZuO1xuICB9KTtcblxuICAvLyBDaGVjayBhbiBhcnJheSB0byBzZWUgaWYgaXQncyBhIGZ1bmN0aW9uIGV4cHJlc3Npb24uXG4gIHZhciBpc0Z1bmN0aW9uQXJyYXkgPSBmdW5jdGlvbiAoYXJyYXkpIHtcbiAgICByZXR1cm4gYXJyYXkubGVuZ3RoID4gMCAmJiBhcnJheVswXVswXSA9PT0gJ0AnO1xuICB9O1xuXG4gIC8vIEV2YWx1YXRlIGEgZnVuY3Rpb24gZXhwcmVzc2lvbiBhbmQgcmV0dXJuIHRoZSByZXN1bHQuXG4gIHZhciBldmFsRnVuY3Rpb24gPSBmdW5jdGlvbiAoZm5BcnJheSwgZmllbGQsIGNvbnRleHQpIHtcbiAgICB2YXIgZm5OYW1lID0gZm5BcnJheVswXS5zdWJzdHJpbmcoMSk7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBmdW5jdGlvbnNbZm5OYW1lXShmbkFycmF5LnNsaWNlKDEpLCBmaWVsZCwgY29udGV4dCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKCEoZm5OYW1lIGluIGZ1bmN0aW9ucykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFdmFsIGZ1bmN0aW9uICcgKyBmbk5hbWUgKyAnIG5vdCBkZWZpbmVkLicpO1xuICAgICAgfVxuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH07XG5cbiAgLy8gRXZhbHVhdGUgYW4gZXhwcmVzc2lvbiBpbiB0aGUgY29udGV4dCBvZiBhIGZpZWxkLlxuICB2YXIgZXZhbHVhdGUgPSBmdW5jdGlvbiAoZXhwcmVzc2lvbiwgZmllbGQsIGNvbnRleHQpIHtcbiAgICBpZiAoXy5pc0FycmF5KGV4cHJlc3Npb24pKSB7XG4gICAgICBpZiAoaXNGdW5jdGlvbkFycmF5KGV4cHJlc3Npb24pKSB7XG4gICAgICAgIHJldHVybiBldmFsRnVuY3Rpb24oZXhwcmVzc2lvbiwgZmllbGQsIGNvbnRleHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGV4cHJlc3Npb24ubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgcmV0dXJuIGV2YWx1YXRlKGl0ZW0sIGZpZWxkLCBjb250ZXh0KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChfLmlzT2JqZWN0KGV4cHJlc3Npb24pKSB7XG4gICAgICB2YXIgb2JqID0ge307XG4gICAgICBPYmplY3Qua2V5cyhleHByZXNzaW9uKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGV2YWx1YXRlKGV4cHJlc3Npb25ba2V5XSwgZmllbGQsIGNvbnRleHQpO1xuICAgICAgICBpZiAodHlwZW9mIHJlc3VsdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBvYmpba2V5XSA9IHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH0gZWxzZSBpZiAoXy5pc1N0cmluZyhleHByZXNzaW9uKSAmJiBleHByZXNzaW9uWzBdID09PSAnPScpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbnMuZ2V0KFtleHByZXNzaW9uLnN1YnN0cmluZygxKV0sIGZpZWxkLCBjb250ZXh0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGV4cHJlc3Npb247XG4gICAgfVxuICB9O1xuXG4gIHBsdWdpbi5leHBvcnRzLmV2YWx1YXRlID0gZXZhbHVhdGU7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGZpZWxkLXJvdXRlclxuXG4vKlxuRmllbGRzIGFuZCBjb21wb25lbnRzIGdldCBnbHVlZCB0b2dldGhlciB2aWEgcm91dGVzLiBUaGlzIGlzIHNpbWlsYXIgdG8gVVJMXG5yb3V0aW5nIHdoZXJlIGEgcmVxdWVzdCBnZXRzIGR5bmFtaWNhbGx5IHJvdXRlZCB0byBhIGhhbmRsZXIuIFRoaXMgZ2l2ZXMgYSBsb3Rcbm9mIGZsZXhpYmlsaXR5IGluIGludHJvZHVjaW5nIG5ldyB0eXBlcyBhbmQgY29tcG9uZW50cy4gWW91IGNhbiBjcmVhdGUgYSBuZXdcbnR5cGUgYW5kIHJvdXRlIGl0IHRvIGFuIGV4aXN0aW5nIGNvbXBvbmVudCwgb3IgeW91IGNhbiBjcmVhdGUgYSBuZXcgY29tcG9uZW50XG5hbmQgcm91dGUgZXhpc3RpbmcgdHlwZXMgdG8gaXQuIE9yIHlvdSBjYW4gY3JlYXRlIGJvdGggYW5kIHJvdXRlIHRoZSBuZXcgdHlwZVxudG8gdGhlIG5ldyBjb21wb25lbnQuIE5ldyByb3V0ZXMgYXJlIGFkZGVkIHZpYSByb3V0ZSBwbHVnaW5zLiBBIHJvdXRlIHBsdWdpblxuc2ltcGx5IGV4cG9ydHMgYW4gYXJyYXkgbGlrZTpcblxuYGBganNcbltcbiAgJ2NvbG9yJywgLy8gUm91dGUgdGhpcyB0eXBlXG4gICdjb2xvci1waWNrZXItd2l0aC1hbHBoYScsIC8vIFRvIHRoaXMgY29tcG9uZW50XG4gIGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIHJldHVybiB0eXBlb2YgZmllbGQuZGVmLmFscGhhICE9PSAndW5kZWZpbmVkJztcbiAgfVxuXVxuXG5Sb3V0ZSBwbHVnaW5zIGNhbiBiZSBzdGFja2VkIGFuZCBhcmUgc2Vuc2l0aXZlIHRvIG9yZGVyaW5nLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgdmFyIHJvdXRlcyA9IHt9O1xuXG4gIHZhciByb3V0ZXIgPSBwbHVnaW4uZXhwb3J0cztcblxuICAvLyBHZXQgYWxsIHRoZSByb3V0ZSBwbHVnaW5zLlxuICB2YXIgcm91dGVQbHVnaW5zID0gcGx1Z2luLnJlcXVpcmVBbGwocGx1Z2luLmNvbmZpZy5yb3V0ZXMpO1xuXG4gIC8vIFJlZ2lzdGVyIGEgcm91dGUuXG4gIHJvdXRlci5yb3V0ZSA9IGZ1bmN0aW9uICh0eXBlTmFtZSwgY29tcG9uZW50TmFtZSwgdGVzdEZuKSB7XG4gICAgaWYgKCFyb3V0ZXNbdHlwZU5hbWVdKSB7XG4gICAgICByb3V0ZXNbdHlwZU5hbWVdID0gW107XG4gICAgfVxuICAgIHJvdXRlc1t0eXBlTmFtZV0ucHVzaCh7XG4gICAgICBjb21wb25lbnQ6IGNvbXBvbmVudE5hbWUsXG4gICAgICB0ZXN0OiB0ZXN0Rm5cbiAgICB9KTtcbiAgfTtcblxuICAvLyBSZWdpc3RlciBlYWNoIG9mIHRoZSByb3V0ZXMgcHJvdmlkZWQgYnkgdGhlIHJvdXRlIHBsdWdpbnMuXG4gIHJvdXRlUGx1Z2lucy5mb3JFYWNoKGZ1bmN0aW9uIChyb3V0ZVBsdWdpbikge1xuXG4gICAgcm91dGVyLnJvdXRlLmFwcGx5KHJvdXRlciwgcm91dGVQbHVnaW4pO1xuICB9KTtcblxuICAvLyBEZXRlcm1pbmUgdGhlIGJlc3QgY29tcG9uZW50IGZvciBhIGZpZWxkLCBiYXNlZCBvbiB0aGUgcm91dGVzLlxuICByb3V0ZXIuY29tcG9uZW50Rm9yRmllbGQgPSBmdW5jdGlvbiAoZmllbGQpIHtcblxuICAgIHZhciB0eXBlTmFtZSA9IGZpZWxkLmRlZi50eXBlO1xuXG4gICAgaWYgKHJvdXRlc1t0eXBlTmFtZV0pIHtcbiAgICAgIHZhciByb3V0ZXNGb3JUeXBlID0gcm91dGVzW3R5cGVOYW1lXTtcbiAgICAgIHZhciByb3V0ZSA9IF8uZmluZChyb3V0ZXNGb3JUeXBlLCBmdW5jdGlvbiAocm91dGUpIHtcbiAgICAgICAgcmV0dXJuICFyb3V0ZS50ZXN0IHx8IHJvdXRlLnRlc3QoZmllbGQpO1xuICAgICAgfSk7XG4gICAgICBpZiAocm91dGUpIHtcbiAgICAgICAgcmV0dXJuIHBsdWdpbi5jb21wb25lbnQocm91dGUuY29tcG9uZW50KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocGx1Z2luLmhhc0NvbXBvbmVudCh0eXBlTmFtZSkpIHtcbiAgICAgIHJldHVybiBwbHVnaW4uY29tcG9uZW50KHR5cGVOYW1lKTtcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGNvbXBvbmVudCBmb3IgZmllbGQ6ICcgKyBKU09OLnN0cmluZ2lmeShmaWVsZC5kZWYpKTtcbiAgfTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgZmllbGQtcm91dGVzXG5cbi8qXG5EZWZhdWx0IHJvdXRlcy4gRWFjaCByb3V0ZSBpcyBwYXJ0IG9mIGl0cyBvd24gcGx1Z2luLCBidXQgYWxsIGFyZSBrZXB0IHRvZ2V0aGVyXG5oZXJlIGFzIHBhcnQgb2YgYSBwbHVnaW4gYnVuZGxlLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxudmFyIHJvdXRlcyA9IHtcblxuICAnb2JqZWN0LmRlZmF1bHQnOiBbXG4gICAgJ29iamVjdCcsXG4gICAgJ2ZpZWxkc2V0J1xuICBdLFxuXG4gICdzdHJpbmcuY2hvaWNlcyc6IFtcbiAgICAnc3RyaW5nJyxcbiAgICAnc2VsZWN0JyxcbiAgICBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgIHJldHVybiBmaWVsZC5kZWYuY2hvaWNlcyA/IHRydWUgOiBmYWxzZTtcbiAgICB9XG4gIF0sXG5cbiAgJ3N0cmluZy50YWdzJzogW1xuICAgICdzdHJpbmcnLFxuICAgICdwcmV0dHktdGV4dGFyZWEnLFxuICAgIGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgcmV0dXJuIGZpZWxkLmRlZi5yZXBsYWNlQ2hvaWNlcztcbiAgICB9XG4gIF0sXG5cbiAgJ3N0cmluZy5zaW5nbGUtbGluZSc6IFtcbiAgICAnc3RyaW5nJyxcbiAgICAndGV4dCcsXG4gICAgZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICByZXR1cm4gZmllbGQuZGVmLm1heFJvd3MgPT09IDE7XG4gICAgfVxuICBdLFxuXG4gICdzdHJpbmcuZGVmYXVsdCc6IFtcbiAgICAnc3RyaW5nJyxcbiAgICAndGV4dGFyZWEnXG4gIF0sXG5cbiAgJ2FycmF5LmNob2ljZXMnOiBbXG4gICAgJ2FycmF5JyxcbiAgICAnY2hlY2tib3gtbGlzdCcsXG4gICAgZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICByZXR1cm4gZmllbGQuZGVmLmNob2ljZXMgPyB0cnVlIDogZmFsc2U7XG4gICAgfVxuICBdLFxuXG4gICdhcnJheS5kZWZhdWx0JzogW1xuICAgICdhcnJheScsXG4gICAgJ2xpc3QnXG4gIF0sXG5cbiAgJ2Jvb2xlYW4uZGVmYXVsdCc6IFtcbiAgICAnYm9vbGVhbicsXG4gICAgJ3NlbGVjdCdcbiAgXSxcblxuICAnbnVtYmVyLmRlZmF1bHQnOiBbXG4gICAgJ251bWJlcicsXG4gICAgJ3RleHQnXG4gIF1cblxufTtcblxuLy8gQnVpbGQgYSBwbHVnaW4gYnVuZGxlLlxuXy5lYWNoKHJvdXRlcywgZnVuY3Rpb24gKHJvdXRlLCBuYW1lKSB7XG4gIG1vZHVsZS5leHBvcnRzWydmaWVsZC1yb3V0ZS4nICsgbmFtZV0gPSBmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgcGx1Z2luLmV4cG9ydHMgPSByb3V0ZTtcbiAgfTtcbn0pO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIvLyAjIGxvYWRlclxuXG4vKlxuV2hlbiBtZXRhZGF0YSBpc24ndCBhdmFpbGFibGUsIHdlIGFzayB0aGUgbG9hZGVyIHRvIGxvYWQgaXQuIFRoZSBsb2FkZXIgd2lsbFxudHJ5IHRvIGZpbmQgYW4gYXBwcm9wcmlhdGUgc291cmNlIGJhc2VkIG9uIHRoZSBtZXRhZGF0YSBrZXlzLlxuXG5Ob3RlIHRoYXQgd2UgYXNrIHRoZSBsb2FkZXIgdG8gbG9hZCBtZXRhZGF0YSB3aXRoIGEgc2V0IG9mIGtleXMgbGlrZVxuYFsnZm9vJywgJ2JhciddYCwgYnV0IHRob3NlIGFyZSBjb252ZXJ0ZWQgdG8gYSBzaW5nbGUga2V5IGxpa2UgYGZvbzo6YmFyYCBmb3JcbnRoZSBzYWtlIG9mIGNhY2hpbmcuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHZhciB1dGlsID0gcGx1Z2luLnJlcXVpcmUoJ3V0aWwnKTtcblxuICB2YXIgbG9hZGVyID0gcGx1Z2luLmV4cG9ydHM7XG5cbiAgdmFyIGlzTG9hZGluZyA9IHt9O1xuICB2YXIgc291cmNlcyA9IHt9O1xuXG4gIC8vIExvYWQgbWV0YWRhdGEgZm9yIGEgZ2l2ZW4gZm9ybSBhbmQgcGFyYW1zLlxuICBsb2FkZXIubG9hZE1ldGEgPSBmdW5jdGlvbiAoZm9ybSwgc291cmNlLCBwYXJhbXMpIHtcbiAgICB2YXIgY2FjaGVLZXkgPSB1dGlsLm1ldGFDYWNoZUtleShzb3VyY2UsIHBhcmFtcyk7XG5cbiAgICBpZiAoaXNMb2FkaW5nW2NhY2hlS2V5XSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlzTG9hZGluZ1tjYWNoZUtleV0gPSB0cnVlO1xuXG4gICAgbG9hZGVyLmxvYWRBc3luY0Zyb21Tb3VyY2UoZm9ybSwgc291cmNlLCBwYXJhbXMpO1xuICB9O1xuXG4gIC8vIE1ha2Ugc3VyZSB0byBsb2FkIG1ldGFkYXRhIGFzeW5jaHJvbm91c2x5LlxuICBsb2FkZXIubG9hZEFzeW5jRnJvbVNvdXJjZSA9IGZ1bmN0aW9uIChmb3JtLCBzb3VyY2UsIHBhcmFtcywgd2FpdFRpbWUpIHtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGxvYWRlci5sb2FkRnJvbVNvdXJjZShmb3JtLCBzb3VyY2UsIHBhcmFtcyk7XG4gICAgfSwgd2FpdFRpbWUgfHwgMCk7XG4gIH07XG5cbiAgLy8gTG9hZCBtZXRhZGF0YSBmb3IgYSBmb3JtIGFuZCBwYXJhbXMuXG4gIGxvYWRlci5sb2FkRnJvbVNvdXJjZSA9IGZ1bmN0aW9uIChmb3JtLCBzb3VyY2VOYW1lLCBwYXJhbXMpIHtcblxuICAgIC8vIEZpbmQgdGhlIGJlc3Qgc291cmNlIGZvciB0aGlzIGNhY2hlIGtleS5cbiAgICB2YXIgc291cmNlID0gc291cmNlc1tzb3VyY2VOYW1lXTtcbiAgICBpZiAoc291cmNlKSB7XG5cbiAgICAgIHZhciBjYWNoZUtleSA9IHV0aWwubWV0YUNhY2hlS2V5KHNvdXJjZU5hbWUsIHBhcmFtcyk7XG5cbiAgICAgIC8vIENhbGwgdGhlIHNvdXJjZSBmdW5jdGlvbi5cbiAgICAgIHZhciByZXN1bHQgPSBzb3VyY2UuY2FsbChudWxsLCBwYXJhbXMpO1xuXG4gICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgIC8vIFJlc3VsdCBjb3VsZCBiZSBhIHByb21pc2UuXG4gICAgICAgIGlmIChyZXN1bHQudGhlbikge1xuICAgICAgICAgIHZhciBwcm9taXNlID0gcmVzdWx0LnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgZm9ybS5tZXRhKGNhY2hlS2V5LCByZXN1bHQpO1xuICAgICAgICAgICAgaXNMb2FkaW5nW2NhY2hlS2V5XSA9IGZhbHNlO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgdmFyIG9uRXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpc0xvYWRpbmdbY2FjaGVLZXldID0gZmFsc2U7XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIGlmIChwcm9taXNlLmNhdGNoKSB7XG4gICAgICAgICAgICBwcm9taXNlLmNhdGNoKG9uRXJyb3IpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBzaWxseSBqUXVlcnkgcHJvbWlzZXNcbiAgICAgICAgICAgIHByb21pc2UuZmFpbChvbkVycm9yKTtcbiAgICAgICAgICB9XG4gICAgICAgIC8vIE9yIGl0IGNvdWxkIGJlIGEgdmFsdWUuIEluIHRoYXQgY2FzZSwgbWFrZSBzdXJlIHRvIGFzeW5jaWZ5IGl0LlxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZm9ybS5tZXRhKGNhY2hlS2V5LCByZXN1bHQpO1xuICAgICAgICAgICAgaXNMb2FkaW5nW2NhY2hlS2V5XSA9IGZhbHNlO1xuICAgICAgICAgIH0sIDApO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpc0xvYWRpbmdbY2FjaGVLZXldID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICB9IGVsc2Uge1xuICAgICAgaXNMb2FkaW5nW2NhY2hlS2V5XSA9IGZhbHNlO1xuICAgIH1cbiAgfTtcblxuICAvLyBSZWdpc3RlciBhIHNvdXJjZSBmdW5jdGlvbi5cbiAgbG9hZGVyLnNvdXJjZSA9IGZ1bmN0aW9uIChuYW1lLCBmbikge1xuXG4gICAgc291cmNlc1tuYW1lXSA9IGZuO1xuICB9O1xuXG59O1xuIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyB1dGlsXG5cbi8vIFNvbWUgdXRpbGl0eSBmdW5jdGlvbnMgdG8gYmUgdXNlZCBieSBvdGhlciBwbHVnaW5zLlxuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICB2YXIgdXRpbCA9IHBsdWdpbi5leHBvcnRzO1xuXG4gIC8vIENoZWNrIGlmIGEgdmFsdWUgaXMgXCJibGFua1wiLlxuICB1dGlsLmlzQmxhbmsgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gJyc7XG4gIH07XG5cbiAgLy8gU2V0IHZhbHVlIGF0IHNvbWUgcGF0aCBpbiBvYmplY3QuXG4gIHV0aWwuc2V0SW4gPSBmdW5jdGlvbiAob2JqLCBwYXRoLCB2YWx1ZSkge1xuICAgIGlmIChfLmlzU3RyaW5nKHBhdGgpKSB7XG4gICAgICBwYXRoID0gW3BhdGhdO1xuICAgIH1cbiAgICBpZiAocGF0aC5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgaWYgKHBhdGgubGVuZ3RoID09PSAxKSB7XG4gICAgICBvYmpbcGF0aFswXV0gPSB2YWx1ZTtcbiAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuICAgIGlmICghb2JqW3BhdGhbMF1dKSB7XG4gICAgICBvYmpbcGF0aFswXV0gPSB7fTtcbiAgICB9XG4gICAgdXRpbC5zZXRJbihvYmpbcGF0aFswXV0sIHBhdGguc2xpY2UoMSksIHZhbHVlKTtcbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIFJlbW92ZSB2YWx1ZSBhdCBwYXRoIGluIHNvbWUgb2JqZWN0LlxuICB1dGlsLnJlbW92ZUluID0gZnVuY3Rpb24gKG9iaiwgcGF0aCkge1xuICAgIGlmIChfLmlzU3RyaW5nKHBhdGgpKSB7XG4gICAgICBwYXRoID0gW3BhdGhdO1xuICAgIH1cbiAgICBpZiAocGF0aC5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAocGF0aC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGlmIChfLmlzQXJyYXkob2JqKSkge1xuICAgICAgICBpZiAoXy5pc051bWJlcihwYXRoWzBdKSkge1xuICAgICAgICAgIG9iai5zcGxpY2UocGF0aFswXSwgMSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoXy5pc09iamVjdChvYmopKSB7XG4gICAgICAgIGRlbGV0ZSBvYmpbcGF0aFswXV07XG4gICAgICB9XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH1cbiAgICBpZiAob2JqW3BhdGhbMF1dKSB7XG4gICAgICB1dGlsLnJlbW92ZUluKG9ialtwYXRoWzBdXSwgcGF0aC5zbGljZSgxKSk7XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gR2V0IHZhbHVlIGF0IHBhdGggaW4gc29tZSBvYmplY3QuXG4gIHV0aWwuZ2V0SW4gPSBmdW5jdGlvbiAob2JqLCBwYXRoKSB7XG4gICAgaWYgKF8uaXNTdHJpbmcocGF0aCkpIHtcbiAgICAgIHBhdGggPSBbcGF0aF07XG4gICAgfVxuICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG4gICAgaWYgKHBhdGhbMF0gaW4gb2JqKSB7XG4gICAgICByZXR1cm4gdXRpbC5nZXRJbihvYmpbcGF0aFswXV0sIHBhdGguc2xpY2UoMSkpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcblxuICAvLyBBcHBlbmQgdG8gYXJyYXkgYXQgcGF0aCBpbiBzb21lIG9iamVjdC5cbiAgdXRpbC5hcHBlbmRJbiA9IGZ1bmN0aW9uIChvYmosIHBhdGgsIHZhbHVlKSB7XG4gICAgdmFyIHN1Yk9iaiA9IHV0aWwuZ2V0SW4ob2JqLCBwYXRoKTtcbiAgICBpZiAoXy5pc0FycmF5KHN1Yk9iaikpIHtcbiAgICAgIHN1Yk9iai5wdXNoKHZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBTd2FwIHR3byBrZXlzIGF0IHBhdGggaW4gc29tZSBvYmplY3QuXG4gIHV0aWwubW92ZUluID0gZnVuY3Rpb24gKG9iaiwgcGF0aCwgZnJvbUtleSwgdG9LZXkpIHtcbiAgICB2YXIgc3ViT2JqID0gdXRpbC5nZXRJbihvYmosIHBhdGgpO1xuICAgIGlmIChfLmlzQXJyYXkoc3ViT2JqKSkge1xuICAgICAgaWYgKF8uaXNOdW1iZXIoZnJvbUtleSkgJiYgXy5pc051bWJlcih0b0tleSkpIHtcbiAgICAgICAgdmFyIGZyb21JbmRleCA9IGZyb21LZXk7XG4gICAgICAgIHZhciB0b0luZGV4ID0gdG9LZXk7XG4gICAgICAgIGlmIChmcm9tSW5kZXggIT09IHRvSW5kZXggJiZcbiAgICAgICAgICBmcm9tSW5kZXggPj0gMCAmJiBmcm9tSW5kZXggPCBzdWJPYmoubGVuZ3RoICYmXG4gICAgICAgICAgdG9JbmRleCA+PSAwICYmIHRvSW5kZXggPCBzdWJPYmoubGVuZ3RoXG4gICAgICAgICkge1xuICAgICAgICAgIHN1Yk9iai5zcGxpY2UodG9JbmRleCwgMCwgc3ViT2JqLnNwbGljZShmcm9tSW5kZXgsIDEpWzBdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZnJvbVZhbHVlID0gc3ViT2JqW2Zyb21LZXldO1xuICAgICAgc3ViT2JqW2Zyb21LZXldID0gc3ViT2JqW3RvS2V5XTtcbiAgICAgIHN1Yk9ialt0b0tleV0gPSBmcm9tVmFsdWU7XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gQ29weSBvYmosIGxlYXZpbmcgbm9uLUpTT04gYmVoaW5kLlxuICB1dGlsLmNvcHlWYWx1ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHZhbHVlKSk7XG4gIH07XG5cbiAgLy8gQ29weSBvYmogcmVjdXJzaW5nIGRlZXBseS5cbiAgdXRpbC5kZWVwQ29weSA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICBpZiAoXy5pc0FycmF5KG9iaikpIHtcbiAgICAgIHJldHVybiBvYmoubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgIHJldHVybiB1dGlsLmRlZXBDb3B5KGl0ZW0pO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChfLmlzT2JqZWN0KG9iaikpIHtcbiAgICAgIHZhciBjb3B5ID0ge307XG4gICAgICBfLmVhY2gob2JqLCBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgICBjb3B5W2tleV0gPSB1dGlsLmRlZXBDb3B5KHZhbHVlKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGNvcHk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuICB9O1xuXG4gIC8vIENoZWNrIGlmIGl0ZW0gbWF0Y2hlcyBzb21lIHZhbHVlLCBiYXNlZCBvbiB0aGUgaXRlbSdzIGBtYXRjaGAgcHJvcGVydHkuXG4gIHV0aWwuaXRlbU1hdGNoZXNWYWx1ZSA9IGZ1bmN0aW9uIChpdGVtLCB2YWx1ZSkge1xuICAgIHZhciBtYXRjaCA9IGl0ZW0ubWF0Y2g7XG4gICAgaWYgKCFtYXRjaCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBfLmV2ZXJ5KF8ua2V5cyhtYXRjaCksIGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHJldHVybiBfLmlzRXF1YWwobWF0Y2hba2V5XSwgdmFsdWVba2V5XSk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gQ3JlYXRlIGEgZmllbGQgZGVmaW5pdGlvbiBmcm9tIGEgdmFsdWUuXG4gIHV0aWwuZmllbGREZWZGcm9tVmFsdWUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YXIgZGVmID0ge1xuICAgICAgdHlwZTogJ2pzb24nXG4gICAgfTtcbiAgICBpZiAoXy5pc1N0cmluZyh2YWx1ZSkpIHtcbiAgICAgIGRlZiA9IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmIChfLmlzTnVtYmVyKHZhbHVlKSkge1xuICAgICAgZGVmID0ge1xuICAgICAgICB0eXBlOiAnbnVtYmVyJ1xuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKF8uaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgIHZhciBhcnJheUl0ZW1GaWVsZHMgPSB2YWx1ZS5tYXAoZnVuY3Rpb24gKHZhbHVlLCBpKSB7XG4gICAgICAgIHZhciBjaGlsZERlZiA9IHV0aWwuZmllbGREZWZGcm9tVmFsdWUodmFsdWUpO1xuICAgICAgICBjaGlsZERlZi5rZXkgPSBpO1xuICAgICAgICByZXR1cm4gY2hpbGREZWY7XG4gICAgICB9KTtcbiAgICAgIGRlZiA9IHtcbiAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgZmllbGRzOiBhcnJheUl0ZW1GaWVsZHNcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmIChfLmlzT2JqZWN0KHZhbHVlKSkge1xuICAgICAgdmFyIG9iamVjdEl0ZW1GaWVsZHMgPSBPYmplY3Qua2V5cyh2YWx1ZSkubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgdmFyIGNoaWxkRGVmID0gdXRpbC5maWVsZERlZkZyb21WYWx1ZSh2YWx1ZVtrZXldKTtcbiAgICAgICAgY2hpbGREZWYua2V5ID0ga2V5O1xuICAgICAgICBjaGlsZERlZi5sYWJlbCA9IHV0aWwuaHVtYW5pemUoa2V5KTtcbiAgICAgICAgcmV0dXJuIGNoaWxkRGVmO1xuICAgICAgfSk7XG4gICAgICBkZWYgPSB7XG4gICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICBmaWVsZHM6IG9iamVjdEl0ZW1GaWVsZHNcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmIChfLmlzTnVsbCh2YWx1ZSkpIHtcbiAgICAgIGRlZiA9IHtcbiAgICAgICAgdHlwZTogJ251bGwnXG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gZGVmO1xuICB9O1xuXG4gIGlmIChwbHVnaW4uY29uZmlnLmh1bWFuaXplKSB7XG4gICAgLy8gR2V0IHRoZSBodW1hbml6ZSBmdW5jdGlvbiBmcm9tIGEgcGx1Z2luIGlmIHByb3ZpZGVkLlxuICAgIHV0aWwuaHVtYW5pemUgPSBwbHVnaW4ucmVxdWlyZShwbHVnaW4uY29uZmlnLmh1bWFuaXplKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBDb252ZXJ0IHByb3BlcnR5IGtleXMgdG8gXCJodW1hblwiIGxhYmVscy4gRm9yIGV4YW1wbGUsICdmb28nIGJlY29tZXNcbiAgICAvLyAnRm9vJy5cbiAgICB1dGlsLmh1bWFuaXplID0gZnVuY3Rpb24ocHJvcGVydHkpIHtcbiAgICAgIHByb3BlcnR5ID0gcHJvcGVydHkucmVwbGFjZSgvXFx7XFx7L2csICcnKTtcbiAgICAgIHByb3BlcnR5ID0gcHJvcGVydHkucmVwbGFjZSgvXFx9XFx9L2csICcnKTtcbiAgICAgIHJldHVybiBwcm9wZXJ0eS5yZXBsYWNlKC9fL2csICcgJylcbiAgICAgICAgLnJlcGxhY2UoLyhcXHcrKS9nLCBmdW5jdGlvbihtYXRjaCkge1xuICAgICAgICAgIHJldHVybiBtYXRjaC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIG1hdGNoLnNsaWNlKDEpO1xuICAgICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgLy8gSm9pbiBtdWx0aXBsZSBDU1MgY2xhc3MgbmFtZXMgdG9nZXRoZXIsIGlnbm9yaW5nIGFueSB0aGF0IGFyZW4ndCB0aGVyZS5cbiAgdXRpbC5jbGFzc05hbWUgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY2xhc3NOYW1lcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCk7XG5cbiAgICBjbGFzc05hbWVzID0gY2xhc3NOYW1lcy5maWx0ZXIoZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgIHJldHVybiBuYW1lO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGNsYXNzTmFtZXMuam9pbignICcpO1xuICB9O1xuXG4gIC8vIEpvaW4ga2V5cyB0b2dldGhlciB0byBtYWtlIHNpbmdsZSBcIm1ldGFcIiBrZXkuIEZvciBsb29raW5nIHVwIG1ldGFkYXRhIGluXG4gIC8vIHRoZSBtZXRhZGF0YSBwYXJ0IG9mIHRoZSBzdG9yZS5cbiAgdXRpbC5qb2luTWV0YUtleXMgPSBmdW5jdGlvbiAoa2V5cykge1xuICAgIHJldHVybiBrZXlzLmpvaW4oJzo6Jyk7XG4gIH07XG5cbiAgLy8gU3BsaXQgYSBqb2luZWQga2V5IGludG8gc2VwYXJhdGUga2V5IHBhcnRzLlxuICB1dGlsLnNwbGl0TWV0YUtleSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4ga2V5LnNwbGl0KCc6OicpO1xuICB9O1xuXG4gIHV0aWwubWV0YUNhY2hlS2V5ID0gZnVuY3Rpb24gKHNvdXJjZSwgcGFyYW1zKSB7XG4gICAgcGFyYW1zID0gcGFyYW1zIHx8IHt9O1xuICAgIHJldHVybiBzb3VyY2UgKyAnOjpwYXJhbXMoJyArIEpTT04uc3RyaW5naWZ5KHBhcmFtcykgKyAnKSc7XG4gIH07XG5cbiAgLy8gV3JhcCBhIHRleHQgdmFsdWUgc28gaXQgaGFzIGEgdHlwZS4gRm9yIHBhcnNpbmcgdGV4dCB3aXRoIHRhZ3MuXG4gIHZhciB0ZXh0UGFydCA9IGZ1bmN0aW9uICh2YWx1ZSwgdHlwZSkge1xuICAgIHR5cGUgPSB0eXBlIHx8ICd0ZXh0JztcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogdHlwZSxcbiAgICAgIHZhbHVlOiB2YWx1ZVxuICAgIH07XG4gIH07XG5cbiAgLy8gUGFyc2UgdGV4dCB0aGF0IGhhcyB0YWdzIGxpa2Uge3t0YWd9fSBpbnRvIHRleHQgYW5kIHRhZ3MuXG4gIHV0aWwucGFyc2VUZXh0V2l0aFRhZ3MgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YWx1ZSA9IHZhbHVlIHx8ICcnO1xuICAgIHZhciBwYXJ0cyA9IHZhbHVlLnNwbGl0KC97eyg/IXspLyk7XG4gICAgdmFyIGZyb250UGFydCA9IFtdO1xuICAgIGlmIChwYXJ0c1swXSAhPT0gJycpIHtcbiAgICAgIGZyb250UGFydCA9IFtcbiAgICAgICAgdGV4dFBhcnQocGFydHNbMF0pXG4gICAgICBdO1xuICAgIH1cbiAgICBwYXJ0cyA9IGZyb250UGFydC5jb25jYXQoXG4gICAgICBwYXJ0cy5zbGljZSgxKS5tYXAoZnVuY3Rpb24gKHBhcnQpIHtcbiAgICAgICAgaWYgKHBhcnQuaW5kZXhPZignfX0nKSA+PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHRleHRQYXJ0KHBhcnQuc3Vic3RyaW5nKDAsIHBhcnQuaW5kZXhPZignfX0nKSksICd0YWcnKSxcbiAgICAgICAgICAgIHRleHRQYXJ0KHBhcnQuc3Vic3RyaW5nKHBhcnQuaW5kZXhPZignfX0nKSArIDIpKVxuICAgICAgICAgIF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRleHRQYXJ0KCd7eycgKyBwYXJ0LCAndGV4dCcpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICk7XG4gICAgcmV0dXJuIFtdLmNvbmNhdC5hcHBseShbXSwgcGFydHMpO1xuICB9O1xuXG4gIC8vIENvcHkgYWxsIGNvbXB1dGVkIHN0eWxlcyBmcm9tIG9uZSBET00gZWxlbWVudCB0byBhbm90aGVyLlxuICB1dGlsLmNvcHlFbGVtZW50U3R5bGUgPSBmdW5jdGlvbiAoZnJvbUVsZW1lbnQsIHRvRWxlbWVudCkge1xuICAgIHZhciBmcm9tU3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShmcm9tRWxlbWVudCwgJycpO1xuXG4gICAgaWYgKGZyb21TdHlsZS5jc3NUZXh0ICE9PSAnJykge1xuICAgICAgdG9FbGVtZW50LnN0eWxlLmNzc1RleHQgPSBmcm9tU3R5bGUuY3NzVGV4dDtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgY3NzUnVsZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZyb21TdHlsZS5sZW5ndGg7IGkrKykge1xuICAgICAgLy9jb25zb2xlLmxvZyhpLCBmcm9tU3R5bGVbaV0sIGZyb21TdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKGZyb21TdHlsZVtpXSkpXG4gICAgICAvL3RvRWxlbWVudC5zdHlsZVtmcm9tU3R5bGVbaV1dID0gZnJvbVN0eWxlLmdldFByb3BlcnR5VmFsdWUoZnJvbVN0eWxlW2ldKTtcbiAgICAgIGNzc1J1bGVzLnB1c2goZnJvbVN0eWxlW2ldICsgJzonICsgZnJvbVN0eWxlLmdldFByb3BlcnR5VmFsdWUoZnJvbVN0eWxlW2ldKSArICc7Jyk7XG4gICAgfVxuICAgIHZhciBjc3NUZXh0ID0gY3NzUnVsZXMuam9pbignJyk7XG5cbiAgICB0b0VsZW1lbnQuc3R5bGUuY3NzVGV4dCA9IGNzc1RleHQ7XG4gIH07XG5cbiAgLy8gT2JqZWN0IHRvIGhvbGQgYnJvd3NlciBzbmlmZmluZyBpbmZvLlxuICB2YXIgYnJvd3NlciA9IHtcbiAgICBpc0Nocm9tZTogZmFsc2UsXG4gICAgaXNNb3ppbGxhOiBmYWxzZSxcbiAgICBpc09wZXJhOiBmYWxzZSxcbiAgICBpc0llOiBmYWxzZSxcbiAgICBpc1NhZmFyaTogZmFsc2VcbiAgfTtcblxuICAvLyBTbmlmZiB0aGUgYnJvd3Nlci5cbiAgdmFyIHVhID0gbmF2aWdhdG9yLnVzZXJBZ2VudDtcbiAgaWYodWEuaW5kZXhPZignQ2hyb21lJykgPiAtMSkge1xuICAgIGJyb3dzZXIuaXNDaHJvbWUgPSB0cnVlO1xuICB9IGVsc2UgaWYgKHVhLmluZGV4T2YoJ1NhZmFyaScpID4gLTEpIHtcbiAgICBicm93c2VyLmlzU2FmYXJpID0gdHJ1ZTtcbiAgfSBlbHNlIGlmICh1YS5pbmRleE9mKCdPcGVyYScpID4gLTEpIHtcbiAgICBicm93c2VyLmlzT3BlcmEgPSB0cnVlO1xuICB9IGVsc2UgaWYgKHVhLmluZGV4T2YoJ0ZpcmVmb3gnKSA+IC0xKSB7XG4gICAgYnJvd3Nlci5pc01vemlsbGEgPSB0cnVlO1xuICB9IGVsc2UgaWYgKHVhLmluZGV4T2YoJ01TSUUnKSA+IC0xKSB7XG4gICAgYnJvd3Nlci5pc0llID0gdHJ1ZTtcbiAgfVxuXG4gIHV0aWwuYnJvd3NlciA9IGJyb3dzZXI7XG5cbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgRm9ybWF0aWMgcGx1Z2luIGNvcmVcblxuLy8gQXQgaXRzIGNvcmUsIEZvcm1hdGljIGlzIGp1c3QgYSBwbHVnaW4gaG9zdC4gQWxsIG9mIHRoZSBmdW5jdGlvbmFsaXR5IGl0IGhhc1xuLy8gb3V0IG9mIHRoZSBib3ggaXMgdmlhIHBsdWdpbnMuIFRoZXNlIHBsdWdpbnMgY2FuIGJlIHJlcGxhY2VkIG9yIGV4dGVuZGVkIGJ5XG4vLyBvdGhlciBwbHVnaW5zLlxuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG4vLyBUaGUgZ2xvYmFsIHBsdWdpbiByZWdpc3RyeSBob2xkcyByZWdpc3RlcmVkIChidXQgbm90IHlldCBpbnN0YW50aWF0ZWQpXG4vLyBwbHVnaW5zLlxudmFyIHBsdWdpblJlZ2lzdHJ5ID0ge307XG5cbi8vIEdyb3VwIHBsdWdpbnMgYnkgcHJlZml4LlxudmFyIHBsdWdpbkdyb3VwcyA9IHt9O1xuXG4vLyBGb3IgYW5vbnltb3VzIHBsdWdpbnMsIGluY3JlbWVudGluZyBudW1iZXIgZm9yIG5hbWVzLlxudmFyIHBsdWdpbklkID0gMDtcblxuLy8gUmVnaXN0ZXIgYSBwbHVnaW4gb3IgcGx1Z2luIGJ1bmRsZSAoYXJyYXkgb2YgcGx1Z2lucykgZ2xvYmFsbHkuXG52YXIgcmVnaXN0ZXJQbHVnaW4gPSBmdW5jdGlvbiAobmFtZSwgcGx1Z2luSW5pdEZuKSB7XG5cbiAgaWYgKHBsdWdpblJlZ2lzdHJ5W25hbWVdKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdQbHVnaW4gJyArIG5hbWUgKyAnIGlzIGFscmVhZHkgcmVnaXN0ZXJlZC4nKTtcbiAgfVxuXG4gIGlmIChfLmlzQXJyYXkocGx1Z2luSW5pdEZuKSkge1xuICAgIHBsdWdpblJlZ2lzdHJ5W25hbWVdID0gW107XG4gICAgcGx1Z2luSW5pdEZuLmZvckVhY2goZnVuY3Rpb24gKHBsdWdpblNwZWMpIHtcbiAgICAgIHJlZ2lzdGVyUGx1Z2luKHBsdWdpblNwZWMubmFtZSwgcGx1Z2luU3BlYy5wbHVnaW4pO1xuICAgICAgcGx1Z2luUmVnaXN0cnlbbmFtZV0ucHVzaChwbHVnaW5TcGVjLm5hbWUpO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKF8uaXNPYmplY3QocGx1Z2luSW5pdEZuKSAmJiAhXy5pc0Z1bmN0aW9uKHBsdWdpbkluaXRGbikpIHtcbiAgICB2YXIgYnVuZGxlTmFtZSA9IG5hbWU7XG4gICAgcGx1Z2luUmVnaXN0cnlbYnVuZGxlTmFtZV0gPSBbXTtcbiAgICBPYmplY3Qua2V5cyhwbHVnaW5Jbml0Rm4pLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgIHJlZ2lzdGVyUGx1Z2luKG5hbWUsIHBsdWdpbkluaXRGbltuYW1lXSk7XG4gICAgICBwbHVnaW5SZWdpc3RyeVtidW5kbGVOYW1lXS5wdXNoKG5hbWUpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHBsdWdpblJlZ2lzdHJ5W25hbWVdID0gcGx1Z2luSW5pdEZuO1xuICAgIC8vIEFkZCBwbHVnaW4gbmFtZSB0byBwbHVnaW4gZ3JvdXAgaWYgaXQgaGFzIGEgcHJlZml4LlxuICAgIGlmIChuYW1lLmluZGV4T2YoJy4nKSA+IDApIHtcbiAgICAgIHZhciBwcmVmaXggPSBuYW1lLnN1YnN0cmluZygwLCBuYW1lLmluZGV4T2YoJy4nKSk7XG4gICAgICBwbHVnaW5Hcm91cHNbcHJlZml4XSA9IHBsdWdpbkdyb3Vwc1twcmVmaXhdIHx8IFtdO1xuICAgICAgcGx1Z2luR3JvdXBzW3ByZWZpeF0ucHVzaChuYW1lKTtcbiAgICB9XG4gIH1cbn07XG5cbi8vIERlZmF1bHQgcGx1Z2luIGNvbmZpZy4gRWFjaCBrZXkgcmVwcmVzZW50cyBhIHBsdWdpbiBuYW1lLiBFYWNoIGtleSBvZiB0aGF0XG4vLyBwbHVnaW4gcmVwcmVzZW50cyBhIHNldHRpbmcgZm9yIHRoYXQgcGx1Z2luLiBQYXNzZWQtaW4gY29uZmlnIHdpbGwgb3ZlcnJpZGVcbi8vIGVhY2ggaW5kaXZpZHVhbCBzZXR0aW5nLlxudmFyIGRlZmF1bHRQbHVnaW5Db25maWcgPSB7XG4gIGNvcmU6IHtcbiAgICBmb3JtYXRpYzogWydjb3JlLmZvcm1hdGljJ10sXG4gICAgZm9ybTogWydjb3JlLmZvcm0taW5pdCcsICdjb3JlLmZvcm0nLCAnY29yZS5maWVsZCddXG4gIH0sXG4gICdjb3JlLmZvcm0nOiB7XG4gICAgc3RvcmU6ICdzdG9yZS5tZW1vcnknXG4gIH0sXG4gICdmaWVsZC1yb3V0ZXInOiB7XG4gICAgcm91dGVzOiBbJ2ZpZWxkLXJvdXRlcyddXG4gIH0sXG4gIGNvbXBpbGVyOiB7XG4gICAgY29tcGlsZXJzOiBbJ2NvbXBpbGVyLmNob2ljZXMnLCAnY29tcGlsZXIubG9va3VwJywgJ2NvbXBpbGVyLnR5cGVzJywgJ2NvbXBpbGVyLnByb3AtYWxpYXNlcyddXG4gIH0sXG4gIGNvbXBvbmVudDoge1xuICAgIHByb3BzOiBbJ2RlZmF1bHQtc3R5bGUnXVxuICB9XG59O1xuXG4vLyAjIyBGb3JtYXRpYyBmYWN0b3J5XG5cbi8vIENyZWF0ZSBhIG5ldyBmb3JtYXRpYyBpbnN0YW5jZS4gQSBmb3JtYXRpYyBpbnN0YW5jZSBpcyBhIGZ1bmN0aW9uIHRoYXQgY2FuXG4vLyBjcmVhdGUgZm9ybXMuIEl0IGFsc28gaGFzIGEgYC5jcmVhdGVgIG1ldGhvZCB0aGF0IGNhbiBjcmVhdGUgb3RoZXIgZm9ybWF0aWNcbi8vIGluc3RhbmNlcy5cbnZhciBGb3JtYXRpYyA9IGZ1bmN0aW9uIChjb25maWcpIHtcblxuICAvLyBNYWtlIGEgY29weSBvZiBjb25maWcgc28gd2UgY2FuIG1vbmtleSB3aXRoIGl0LlxuICBjb25maWcgPSBfLmV4dGVuZCh7fSwgY29uZmlnKTtcblxuICAvLyBBZGQgZGVmYXVsdCBjb25maWcgc2V0dGluZ3MgKHdoZXJlIG5vdCBvdmVycmlkZGVuKS5cbiAgXy5rZXlzKGRlZmF1bHRQbHVnaW5Db25maWcpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIGNvbmZpZ1trZXldID0gXy5leHRlbmQoe30sIGRlZmF1bHRQbHVnaW5Db25maWdba2V5XSwgY29uZmlnW2tleV0pO1xuICB9KTtcblxuICAvLyBUaGUgYGZvcm1hdGljYCB2YXJpYWJsZSB3aWxsIGhvbGQgdGhlIGZ1bmN0aW9uIHRoYXQgZ2V0cyByZXR1cm5lZCBmcm9tIHRoZVxuICAvLyBmYWN0b3J5LlxuICB2YXIgZm9ybWF0aWM7XG5cbiAgLy8gSW5zdGFudGlhdGVkIHBsdWdpbnMgYXJlIGNhY2hlZCBqdXN0IGxpa2UgQ29tbW9uSlMgbW9kdWxlcy5cbiAgdmFyIHBsdWdpbkNhY2hlID0ge307XG5cbiAgLy8gIyMgUGx1Z2luIHByb3RvdHlwZVxuXG4gIC8vIFRoZSBQbHVnaW4gcHJvdG90eXBlIGV4aXN0cyBpbnNpZGUgdGhlIEZvcm1hdGljIGZhY3RvcnkgZnVuY3Rpb24ganVzdCB0b1xuICAvLyBtYWtlIGl0IGVhc2llciB0byBncmFiIHZhbHVlcyBmcm9tIHRoZSBjbG9zdXJlLlxuXG4gIC8vIFBsdWdpbnMgYXJlIHNpbWlsYXIgdG8gQ29tbW9uSlMgbW9kdWxlcy4gRm9ybWF0aWMgdXNlcyBwbHVnaW5zIGFzIGEgc2xpZ2h0XG4gIC8vIHZhcmlhbnQgdGhvdWdoIGJlY2F1c2U6XG4gIC8vIC0gRm9ybWF0aWMgcGx1Z2lucyBhcmUgY29uZmlndXJhYmxlLlxuICAvLyAtIEZvcm1hdGljIHBsdWdpbnMgYXJlIGluc3RhbnRpYXRlZCBwZXIgZm9ybWF0aWMgaW5zdGFuY2UuIENvbW1vbkpTIG1vZHVsZXNcbiAgLy8gICBhcmUgY3JlYXRlZCBvbmNlIGFuZCB3b3VsZCBiZSBzaGFyZWQgYWNyb3NzIGFsbCBmb3JtYXRpYyBpbnN0YW5jZXMuXG4gIC8vIC0gRm9ybWF0aWMgcGx1Z2lucyBhcmUgZWFzaWx5IG92ZXJyaWRhYmxlIChhbHNvIHZpYSBjb25maWd1cmF0aW9uKS5cblxuICAvLyBXaGVuIGEgcGx1Z2luIGlzIGluc3RhbnRpYXRlZCwgd2UgY2FsbCB0aGUgYFBsdWdpbmAgY29uc3RydWN0b3IuIFRoZSBwbHVnaW5cbiAgLy8gaW5zdGFuY2UgaXMgdGhlbiBwYXNzZWQgdG8gdGhlIHBsdWdpbidzIGluaXRpYWxpemF0aW9uIGZ1bmN0aW9uLlxuICB2YXIgUGx1Z2luID0gZnVuY3Rpb24gKG5hbWUsIGNvbmZpZykge1xuICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBQbHVnaW4pKSB7XG4gICAgICByZXR1cm4gbmV3IFBsdWdpbihuYW1lLCBjb25maWcpO1xuICAgIH1cbiAgICAvLyBFeHBvcnRzIGFuYWxvZ291cyB0byBDb21tb25KUyBleHBvcnRzLlxuICAgIHRoaXMuZXhwb3J0cyA9IHt9O1xuICAgIC8vIENvbmZpZyB2YWx1ZXMgcGFzc2VkIGluIHZpYSBmYWN0b3J5IGFyZSByb3V0ZWQgdG8gdGhlIGFwcHJvcHJpYXRlXG4gICAgLy8gcGx1Z2luIGFuZCBhdmFpbGFibGUgdmlhIGAuY29uZmlnYC5cbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICB9O1xuXG4gIC8vIEdldCBhIGNvbmZpZyB2YWx1ZSBmb3IgYSBwbHVnaW4gb3IgcmV0dXJuIHRoZSBkZWZhdWx0IHZhbHVlLlxuICBQbHVnaW4ucHJvdG90eXBlLmNvbmZpZ1ZhbHVlID0gZnVuY3Rpb24gKGtleSwgZGVmYXVsdFZhbHVlKSB7XG5cbiAgICBpZiAodHlwZW9mIHRoaXMuY29uZmlnW2tleV0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb25maWdba2V5XTtcbiAgICB9XG4gICAgcmV0dXJuIGRlZmF1bHRWYWx1ZSB8fCAnJztcbiAgfTtcblxuICAvLyBSZXF1aXJlIGFub3RoZXIgcGx1Z2luIGJ5IG5hbWUuIFRoaXMgaXMgbXVjaCBsaWtlIGEgQ29tbW9uSlMgcmVxdWlyZVxuICBQbHVnaW4ucHJvdG90eXBlLnJlcXVpcmUgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHJldHVybiBmb3JtYXRpYy5wbHVnaW4obmFtZSk7XG4gIH07XG5cbiAgLy8gSGFuZGxlIGEgc3BlY2lhbCBwbHVnaW4sIHRoZSBgY29tcG9uZW50YCBwbHVnaW4gd2hpY2ggZmluZHMgY29tcG9uZW50cy5cbiAgdmFyIGNvbXBvbmVudFBsdWdpbjtcblxuICAvLyBKdXN0IGhlcmUgaW4gY2FzZSB3ZSB3YW50IHRvIGR5bmFtaWNhbGx5IGNob29zZSBjb21wb25lbnQgbGF0ZXIuXG4gIFBsdWdpbi5wcm90b3R5cGUuY29tcG9uZW50ID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICByZXR1cm4gY29tcG9uZW50UGx1Z2luLmNvbXBvbmVudChuYW1lKTtcbiAgfTtcblxuICAvLyBDaGVjayBpZiBhIHBsdWdpbiBleGlzdHMuXG4gIFBsdWdpbi5wcm90b3R5cGUuaGFzUGx1Z2luID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICByZXR1cm4gKG5hbWUgaW4gcGx1Z2luQ2FjaGUpIHx8IChuYW1lIGluIHBsdWdpblJlZ2lzdHJ5KTtcbiAgfTtcblxuICAvLyBDaGVjayBpZiBhIGNvbXBvbmVudCBleGlzdHMuIENvbXBvbmVudHMgYXJlIHJlYWxseSBqdXN0IHBsdWdpbnMgd2l0aFxuICAvLyBhIHBhcnRpY3VsYXIgcHJlZml4IHRvIHRoZWlyIG5hbWVzLlxuICBQbHVnaW4ucHJvdG90eXBlLmhhc0NvbXBvbmVudCA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuaGFzUGx1Z2luKCdjb21wb25lbnQuJyArIG5hbWUpO1xuICB9O1xuXG4gIC8vIEdpdmVuIGEgbGlzdCBvZiBwbHVnaW4gbmFtZXMsIHJlcXVpcmUgdGhlbSBhbGwgYW5kIHJldHVybiBhIGxpc3Qgb2ZcbiAgLy8gaW5zdGFudGlhdGVkIHBsdWdpbnMuXG4gIFBsdWdpbi5wcm90b3R5cGUucmVxdWlyZUFsbCA9IGZ1bmN0aW9uIChwbHVnaW5MaXN0KSB7XG4gICAgaWYgKCFwbHVnaW5MaXN0KSB7XG4gICAgICBwbHVnaW5MaXN0ID0gW107XG4gICAgfVxuICAgIGlmICghXy5pc0FycmF5KHBsdWdpbkxpc3QpKSB7XG4gICAgICBwbHVnaW5MaXN0ID0gW3BsdWdpbkxpc3RdO1xuICAgIH1cbiAgICAvLyBJbmZsYXRlIHJlZ2lzdGVyZWQgYnVuZGxlcy4gQSBidW5kbGUgaXMganVzdCBhIG5hbWUgdGhhdCBwb2ludHMgdG8gYW5cbiAgICAvLyBhcnJheSBvZiBvdGhlciBwbHVnaW4gbmFtZXMuXG4gICAgcGx1Z2luTGlzdCA9IHBsdWdpbkxpc3QubWFwKGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICAgIGlmIChfLmlzU3RyaW5nKHBsdWdpbikpIHtcbiAgICAgICAgaWYgKF8uaXNBcnJheShwbHVnaW5SZWdpc3RyeVtwbHVnaW5dKSkge1xuICAgICAgICAgIHJldHVybiBwbHVnaW5SZWdpc3RyeVtwbHVnaW5dO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcGx1Z2luO1xuICAgIH0pO1xuICAgIC8vIEZsYXR0ZW4gYW55IGJ1bmRsZXMsIHNvIHdlIGVuZCB1cCB3aXRoIGEgZmxhdCBhcnJheSBvZiBwbHVnaW4gbmFtZXMuXG4gICAgcGx1Z2luTGlzdCA9IF8uZmxhdHRlbihwbHVnaW5MaXN0KTtcbiAgICByZXR1cm4gcGx1Z2luTGlzdC5tYXAoZnVuY3Rpb24gKHBsdWdpbikge1xuICAgICAgcmV0dXJuIHRoaXMucmVxdWlyZShwbHVnaW4pO1xuICAgIH0uYmluZCh0aGlzKSk7XG4gIH07XG5cbiAgLy8gR2l2ZW4gYSBwcmVmaXgsIHJldHVybiBhIG1hcCBvZiBhbGwgaW5zdGFudGlhdGVkIHBsdWdpbnMgd2l0aCB0aGF0IHByZWZpeC5cbiAgUGx1Z2luLnByb3RvdHlwZS5yZXF1aXJlQWxsT2YgPSBmdW5jdGlvbiAocHJlZml4KSB7XG4gICAgdmFyIG1hcCA9IHt9O1xuXG4gICAgaWYgKHBsdWdpbkdyb3Vwc1twcmVmaXhdKSB7XG4gICAgICBwbHVnaW5Hcm91cHNbcHJlZml4XS5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgIG1hcFtuYW1lXSA9IHRoaXMucmVxdWlyZShuYW1lKTtcbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1hcDtcbiAgfTtcblxuICAvLyAjIyBGb3JtYXRpYyBmYWN0b3J5LCBjb250aW51ZWQuLi5cblxuICAvLyBHcmFiIGEgcGx1Z2luIGZyb20gdGhlIGNhY2hlLCBvciBsb2FkIGl0IGZyZXNoIGZyb20gdGhlIHJlZ2lzdHJ5LlxuICB2YXIgbG9hZFBsdWdpbiA9IGZ1bmN0aW9uIChuYW1lLCBwbHVnaW5Db25maWcpIHtcbiAgICB2YXIgcGx1Z2luO1xuXG4gICAgLy8gV2UgY2FuIGFsc28gbG9hZCBhbm9ueW1vdXMgcGx1Z2lucy5cbiAgICBpZiAoXy5pc0Z1bmN0aW9uKG5hbWUpKSB7XG5cbiAgICAgIHZhciBmYWN0b3J5ID0gbmFtZTtcblxuICAgICAgaWYgKF8uaXNVbmRlZmluZWQoZmFjdG9yeS5fX2V4cG9ydHNfXykpIHtcbiAgICAgICAgcGx1Z2luSWQrKztcbiAgICAgICAgcGx1Z2luID0gUGx1Z2luKCdhbm9ueW1vdXNfcGx1Z2luXycgKyBwbHVnaW5JZCwgcGx1Z2luQ29uZmlnIHx8IHt9KTtcbiAgICAgICAgZmFjdG9yeShwbHVnaW4pO1xuICAgICAgICAvLyBTdG9yZSB0aGUgZXhwb3J0cyBvbiB0aGUgYW5vbnltb3VzIGZ1bmN0aW9uIHNvIHdlIGtub3cgaXQncyBhbHJlYWR5XG4gICAgICAgIC8vIGJlZW4gaW5zdGFudGlhdGVkLCBhbmQgd2UgY2FuIGp1c3QgZ3JhYiB0aGUgZXhwb3J0cy5cbiAgICAgICAgZmFjdG9yeS5fX2V4cG9ydHNfXyA9IHBsdWdpbi5leHBvcnRzO1xuICAgICAgfVxuXG4gICAgICAvLyBMb2FkIHRoZSBjYWNoZWQgZXhwb3J0cy5cbiAgICAgIHJldHVybiBmYWN0b3J5Ll9fZXhwb3J0c19fO1xuXG4gICAgfSBlbHNlIGlmIChfLmlzVW5kZWZpbmVkKHBsdWdpbkNhY2hlW25hbWVdKSkge1xuXG4gICAgICBpZiAoIXBsdWdpbkNvbmZpZyAmJiBjb25maWdbbmFtZV0pIHtcbiAgICAgICAgaWYgKGNvbmZpZ1tuYW1lXS5wbHVnaW4pIHtcbiAgICAgICAgICByZXR1cm4gbG9hZFBsdWdpbihjb25maWdbbmFtZV0ucGx1Z2luLCBjb25maWdbbmFtZV0gfHwge30pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChwbHVnaW5SZWdpc3RyeVtuYW1lXSkge1xuICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKHBsdWdpblJlZ2lzdHJ5W25hbWVdKSkge1xuICAgICAgICAgIHBsdWdpbiA9IFBsdWdpbihuYW1lLCBwbHVnaW5Db25maWcgfHwgY29uZmlnW25hbWVdKTtcbiAgICAgICAgICBwbHVnaW5SZWdpc3RyeVtuYW1lXShwbHVnaW4pO1xuICAgICAgICAgIHBsdWdpbkNhY2hlW25hbWVdID0gcGx1Z2luLmV4cG9ydHM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQbHVnaW4gJyArIG5hbWUgKyAnIGlzIG5vdCBhIGZ1bmN0aW9uLicpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BsdWdpbiAnICsgbmFtZSArICcgbm90IGZvdW5kLicpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcGx1Z2luQ2FjaGVbbmFtZV07XG4gIH07XG5cbiAgLy8gQXNzaWduIGBmb3JtYXRpY2AgdG8gYSBmdW5jdGlvbiB0aGF0IHRha2VzIGZvcm0gb3B0aW9ucyBhbmQgcmV0dXJucyBhIGZvcm0uXG4gIGZvcm1hdGljID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gZm9ybWF0aWMuZm9ybShvcHRpb25zKTtcbiAgfTtcblxuICAvLyBBbGxvdyBnbG9iYWwgcGx1Z2luIHJlZ2lzdHJ5IGZyb20gdGhlIGZvcm1hdGljIGZ1bmN0aW9uIGluc3RhbmNlLlxuICBmb3JtYXRpYy5yZWdpc3RlciA9IGZ1bmN0aW9uIChuYW1lLCBwbHVnaW5Jbml0Rm4pIHtcbiAgICByZWdpc3RlclBsdWdpbihuYW1lLCBwbHVnaW5Jbml0Rm4pO1xuICAgIHJldHVybiBmb3JtYXRpYztcbiAgfTtcblxuICAvLyBBbGxvdyByZXRyaWV2aW5nIHBsdWdpbnMgZnJvbSB0aGUgZm9ybWF0aWMgZnVuY3Rpb24gaW5zdGFuY2UuXG4gIGZvcm1hdGljLnBsdWdpbiA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgcmV0dXJuIGxvYWRQbHVnaW4obmFtZSk7XG4gIH07XG5cbiAgLy8gQWxsb3cgY3JlYXRpbmcgYSBuZXcgZm9ybWF0aWMgaW5zdGFuY2UgZnJvbSBhIGZvcm1hdGljIGluc3RhbmNlLlxuICBmb3JtYXRpYy5jcmVhdGUgPSBGb3JtYXRpYztcblxuICAvLyBVc2UgdGhlIGNvcmUgcGx1Z2luIHRvIGFkZCBtZXRob2RzIHRvIHRoZSBmb3JtYXRpYyBpbnN0YW5jZS5cbiAgdmFyIGNvcmUgPSBsb2FkUGx1Z2luKCdjb3JlJyk7XG5cbiAgY29yZShmb3JtYXRpYyk7XG5cbiAgLy8gTm93IGJpbmQgdGhlIGNvbXBvbmVudCBwbHVnaW4uIFdlIHdhaXQgdGlsbCBub3csIHNvIHRoZSBjb3JlIGlzIGxvYWRlZFxuICAvLyBmaXJzdC5cbiAgY29tcG9uZW50UGx1Z2luID0gbG9hZFBsdWdpbignY29tcG9uZW50Jyk7XG5cbiAgLy8gUmV0dXJuIHRoZSBmb3JtYXRpYyBmdW5jdGlvbiBpbnN0YW5jZS5cbiAgcmV0dXJuIGZvcm1hdGljO1xufTtcblxuLy8gSnVzdCBhIGhlbHBlciB0byByZWdpc3RlciBhIGJ1bmNoIG9mIHBsdWdpbnMuXG52YXIgcmVnaXN0ZXJQbHVnaW5zID0gZnVuY3Rpb24gKCkge1xuICB2YXIgYXJnID0gXy50b0FycmF5KGFyZ3VtZW50cyk7XG4gIGFyZy5mb3JFYWNoKGZ1bmN0aW9uIChhcmcpIHtcbiAgICB2YXIgbmFtZSA9IGFyZ1swXTtcbiAgICB2YXIgcGx1Z2luID0gYXJnWzFdO1xuICAgIHJlZ2lzdGVyUGx1Z2luKG5hbWUsIHBsdWdpbik7XG4gIH0pO1xufTtcblxuLy8gUmVnaXN0ZXIgYWxsIHRoZSBidWlsdC1pbiBwbHVnaW5zLlxucmVnaXN0ZXJQbHVnaW5zKFxuICBbJ2NvcmUnLCByZXF1aXJlKCcuL2RlZmF1bHQvY29yZScpXSxcblxuICBbJ2NvcmUuZm9ybWF0aWMnLCByZXF1aXJlKCcuL2NvcmUvZm9ybWF0aWMnKV0sXG4gIFsnY29yZS5mb3JtLWluaXQnLCByZXF1aXJlKCcuL2NvcmUvZm9ybS1pbml0JyldLFxuICBbJ2NvcmUuZm9ybScsIHJlcXVpcmUoJy4vY29yZS9mb3JtJyldLFxuICBbJ2NvcmUuZmllbGQnLCByZXF1aXJlKCcuL2NvcmUvZmllbGQnKV0sXG5cbiAgWyd1dGlsJywgcmVxdWlyZSgnLi9kZWZhdWx0L3V0aWwnKV0sXG4gIFsnY29tcGlsZXInLCByZXF1aXJlKCcuL2RlZmF1bHQvY29tcGlsZXInKV0sXG4gIFsnZXZhbCcsIHJlcXVpcmUoJy4vZGVmYXVsdC9ldmFsJyldLFxuICBbJ2V2YWwtZnVuY3Rpb25zJywgcmVxdWlyZSgnLi9kZWZhdWx0L2V2YWwtZnVuY3Rpb25zJyldLFxuICBbJ2xvYWRlcicsIHJlcXVpcmUoJy4vZGVmYXVsdC9sb2FkZXInKV0sXG4gIFsnZmllbGQtcm91dGVyJywgcmVxdWlyZSgnLi9kZWZhdWx0L2ZpZWxkLXJvdXRlcicpXSxcbiAgWydmaWVsZC1yb3V0ZXMnLCByZXF1aXJlKCcuL2RlZmF1bHQvZmllbGQtcm91dGVzJyldLFxuXG4gIFsnY29tcGlsZXIuY2hvaWNlcycsIHJlcXVpcmUoJy4vY29tcGlsZXJzL2Nob2ljZXMnKV0sXG4gIFsnY29tcGlsZXIubG9va3VwJywgcmVxdWlyZSgnLi9jb21waWxlcnMvbG9va3VwJyldLFxuICBbJ2NvbXBpbGVyLnR5cGVzJywgcmVxdWlyZSgnLi9jb21waWxlcnMvdHlwZXMnKV0sXG4gIFsnY29tcGlsZXIucHJvcC1hbGlhc2VzJywgcmVxdWlyZSgnLi9jb21waWxlcnMvcHJvcC1hbGlhc2VzJyldLFxuXG4gIFsnc3RvcmUubWVtb3J5JywgcmVxdWlyZSgnLi9zdG9yZS9tZW1vcnknKV0sXG5cbiAgWyd0eXBlLnJvb3QnLCByZXF1aXJlKCcuL3R5cGVzL3Jvb3QnKV0sXG4gIFsndHlwZS5zdHJpbmcnLCByZXF1aXJlKCcuL3R5cGVzL3N0cmluZycpXSxcbiAgWyd0eXBlLm9iamVjdCcsIHJlcXVpcmUoJy4vdHlwZXMvb2JqZWN0JyldLFxuICBbJ3R5cGUuYm9vbGVhbicsIHJlcXVpcmUoJy4vdHlwZXMvYm9vbGVhbicpXSxcbiAgWyd0eXBlLmFycmF5JywgcmVxdWlyZSgnLi90eXBlcy9hcnJheScpXSxcbiAgWyd0eXBlLmpzb24nLCByZXF1aXJlKCcuL3R5cGVzL2pzb24nKV0sXG4gIFsndHlwZS5udW1iZXInLCByZXF1aXJlKCcuL3R5cGVzL251bWJlcicpXSxcblxuICBbJ2NvbXBvbmVudCcsIHJlcXVpcmUoJy4vZGVmYXVsdC9jb21wb25lbnQnKV0sXG5cbiAgWydjb21wb25lbnQuZm9ybWF0aWMnLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvZm9ybWF0aWMnKV0sXG4gIFsnY29tcG9uZW50LnJvb3QnLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvcm9vdCcpXSxcbiAgWydjb21wb25lbnQuZmllbGQnLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGQnKV0sXG4gIFsnY29tcG9uZW50LmxhYmVsJywgcmVxdWlyZSgnLi9jb21wb25lbnRzL2xhYmVsJyldLFxuICBbJ2NvbXBvbmVudC5oZWxwJywgcmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHAnKV0sXG4gIFsnY29tcG9uZW50LnNhbXBsZScsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9zYW1wbGUnKV0sXG4gIFsnY29tcG9uZW50LmZpZWxkc2V0JywgcmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkc2V0JyldLFxuICBbJ2NvbXBvbmVudC50ZXh0JywgcmVxdWlyZSgnLi9jb21wb25lbnRzL3RleHQnKV0sXG4gIFsnY29tcG9uZW50LnRleHRhcmVhJywgcmVxdWlyZSgnLi9jb21wb25lbnRzL3RleHRhcmVhJyldLFxuICBbJ2NvbXBvbmVudC5zZWxlY3QnLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvc2VsZWN0JyldLFxuICBbJ2NvbXBvbmVudC5saXN0JywgcmVxdWlyZSgnLi9jb21wb25lbnRzL2xpc3QnKV0sXG4gIFsnY29tcG9uZW50Lmxpc3QtY29udHJvbCcsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9saXN0LWNvbnRyb2wnKV0sXG4gIFsnY29tcG9uZW50Lmxpc3QtaXRlbScsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9saXN0LWl0ZW0nKV0sXG4gIFsnY29tcG9uZW50Lmxpc3QtaXRlbS12YWx1ZScsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9saXN0LWl0ZW0tdmFsdWUnKV0sXG4gIFsnY29tcG9uZW50Lmxpc3QtaXRlbS1jb250cm9sJywgcmVxdWlyZSgnLi9jb21wb25lbnRzL2xpc3QtaXRlbS1jb250cm9sJyldLFxuICBbJ2NvbXBvbmVudC5pdGVtLWNob2ljZXMnLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvaXRlbS1jaG9pY2VzJyldLFxuICBbJ2NvbXBvbmVudC5hZGQtaXRlbScsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9hZGQtaXRlbScpXSxcbiAgWydjb21wb25lbnQucmVtb3ZlLWl0ZW0nLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvcmVtb3ZlLWl0ZW0nKV0sXG4gIFsnY29tcG9uZW50Lm1vdmUtaXRlbS1iYWNrJywgcmVxdWlyZSgnLi9jb21wb25lbnRzL21vdmUtaXRlbS1iYWNrJyldLFxuICBbJ2NvbXBvbmVudC5tb3ZlLWl0ZW0tZm9yd2FyZCcsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9tb3ZlLWl0ZW0tZm9yd2FyZCcpXSxcbiAgWydjb21wb25lbnQuanNvbicsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9qc29uJyldLFxuICBbJ2NvbXBvbmVudC5jaGVja2JveC1saXN0JywgcmVxdWlyZSgnLi9jb21wb25lbnRzL2NoZWNrYm94LWxpc3QnKV0sXG4gIFsnY29tcG9uZW50LnByZXR0eS10ZXh0YXJlYScsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9wcmV0dHktdGV4dGFyZWEnKV0sXG5cbiAgWydtaXhpbi5jbGljay1vdXRzaWRlJywgcmVxdWlyZSgnLi9taXhpbnMvY2xpY2stb3V0c2lkZScpXSxcbiAgWydtaXhpbi5maWVsZCcsIHJlcXVpcmUoJy4vbWl4aW5zL2ZpZWxkJyldLFxuICBbJ21peGluLmlucHV0LWFjdGlvbnMnLCByZXF1aXJlKCcuL21peGlucy9pbnB1dC1hY3Rpb25zJyldLFxuICBbJ21peGluLnJlc2l6ZScsIHJlcXVpcmUoJy4vbWl4aW5zL3Jlc2l6ZScpXSxcbiAgWydtaXhpbi51bmRvLXN0YWNrJywgcmVxdWlyZSgnLi9taXhpbnMvdW5kby1zdGFjaycpXSxcblxuICBbJ2Jvb3RzdHJhcC1zdHlsZScsIHJlcXVpcmUoJy4vcGx1Z2lucy9ib290c3RyYXAtc3R5bGUnKV0sXG4gIFsnZGVmYXVsdC1zdHlsZScsIHJlcXVpcmUoJy4vcGx1Z2lucy9kZWZhdWx0LXN0eWxlJyldXG4pO1xuXG4vLyBDcmVhdGUgdGhlIGRlZmF1bHQgZm9ybWF0aWMgaW5zdGFuY2UuXG52YXIgZGVmYXVsdEZvcm1hdGljID0gRm9ybWF0aWMoKTtcblxuLy8gRXhwb3J0IGl0IVxubW9kdWxlLmV4cG9ydHMgPSBkZWZhdWx0Rm9ybWF0aWM7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIi8vICMgbWl4aW4uY2xpY2stb3V0c2lkZVxuXG4vKlxuVGhlcmUncyBubyBuYXRpdmUgUmVhY3Qgd2F5IHRvIGRldGVjdCBjbGlja2luZyBvdXRzaWRlIGFuIGVsZW1lbnQuIFNvbWV0aW1lc1xudGhpcyBpcyB1c2VmdWwsIHNvIHRoYXQncyB3aGF0IHRoaXMgbWl4aW4gZG9lcy4gVG8gdXNlIGl0LCBtaXggaXQgaW4gYW5kIHVzZSBpdFxuZnJvbSB5b3VyIGNvbXBvbmVudCBsaWtlIHRoaXM6XG5cbmBgYGpzXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBtaXhpbnM6IFtwbHVnaW4ucmVxdWlyZSgnbWl4aW4uY2xpY2stb3V0c2lkZScpXSxcblxuICAgIG9uQ2xpY2tPdXRzaWRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zb2xlLmxvZygnY2xpY2tlZCBvdXRzaWRlIScpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zZXRPbkNsaWNrT3V0c2lkZSgnbXlEaXYnLCB0aGlzLm9uQ2xpY2tPdXRzaWRlKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gUmVhY3QuRE9NLmRpdih7cmVmOiAnbXlEaXYnfSxcbiAgICAgICAgJ0hlbGxvISdcbiAgICAgIClcbiAgICB9XG4gIH0pO1xufTtcbmBgYFxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGFzQW5jZXN0b3IgPSBmdW5jdGlvbiAoY2hpbGQsIHBhcmVudCkge1xuICBpZiAoY2hpbGQucGFyZW50Tm9kZSA9PT0gcGFyZW50KSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgaWYgKGNoaWxkLnBhcmVudE5vZGUgPT09IGNoaWxkLnBhcmVudE5vZGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKGNoaWxkLnBhcmVudE5vZGUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIGhhc0FuY2VzdG9yKGNoaWxkLnBhcmVudE5vZGUsIHBhcmVudCk7XG59O1xuXG52YXIgaXNPdXRzaWRlID0gZnVuY3Rpb24gKG5vZGVPdXQsIG5vZGVJbikge1xuICBpZiAobm9kZU91dCA9PT0gbm9kZUluKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmIChoYXNBbmNlc3Rvcihub2RlT3V0LCBub2RlSW4pKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufTtcblxudmFyIG9uQ2xpY2tEb2N1bWVudCA9IGZ1bmN0aW9uIChldmVudCkge1xuICBPYmplY3Qua2V5cyh0aGlzLmNsaWNrT3V0c2lkZUhhbmRsZXJzKS5mb3JFYWNoKGZ1bmN0aW9uIChyZWYpIHtcbiAgICBpZiAodGhpcy5jbGlja091dHNpZGVIYW5kbGVyc1tyZWZdLmxlbmd0aCA+IDApIHtcbiAgICAgIGlmIChpc091dHNpZGUoZXZlbnQudGFyZ2V0LCB0aGlzLnJlZnNbcmVmXS5nZXRET01Ob2RlKCkpKSB7XG4gICAgICAgIHRoaXMuY2xpY2tPdXRzaWRlSGFuZGxlcnNbcmVmXS5mb3JFYWNoKGZ1bmN0aW9uIChmbikge1xuICAgICAgICAgIGZuLmNhbGwodGhpcywgcmVmKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgIH1cbiAgICB9XG4gIH0uYmluZCh0aGlzKSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IHtcblxuICAgIHNldE9uQ2xpY2tPdXRzaWRlOiBmdW5jdGlvbiAocmVmLCBmbikge1xuICAgICAgaWYgKCF0aGlzLmNsaWNrT3V0c2lkZUhhbmRsZXJzW3JlZl0pIHtcbiAgICAgICAgdGhpcy5jbGlja091dHNpZGVIYW5kbGVyc1tyZWZdID0gW107XG4gICAgICB9XG4gICAgICB0aGlzLmNsaWNrT3V0c2lkZUhhbmRsZXJzW3JlZl0ucHVzaChmbik7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmNsaWNrT3V0c2lkZUhhbmRsZXJzID0ge307XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIG9uQ2xpY2tEb2N1bWVudC5iaW5kKHRoaXMpKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuY2xpY2tPdXRzaWRlSGFuZGxlcnMgPSB7fTtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb25DbGlja0RvY3VtZW50LmJpbmQodGhpcykpO1xuICAgIH1cbiAgfTtcbn07XG4iLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIG1peGluLmZpZWxkXG5cbi8qXG5XcmFwIHVwIHlvdXIgZmllbGRzIHdpdGggdGhpcyBtaXhpbiB0byBnZXQ6XG4tIEF1dG9tYXRpYyBtZXRhZGF0YSBsb2FkaW5nLlxuLSBBbnl0aGluZyBlbHNlIGRlY2lkZWQgbGF0ZXIuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IHtcblxuICAgIGxvYWROZWVkZWRNZXRhOiBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgIGlmIChwcm9wcy5maWVsZCAmJiBwcm9wcy5maWVsZC5mb3JtKSB7XG4gICAgICAgIGlmIChwcm9wcy5maWVsZC5kZWYubmVlZHNNZXRhICYmIHByb3BzLmZpZWxkLmRlZi5uZWVkc01ldGEubGVuZ3RoID4gMCkge1xuXG4gICAgICAgICAgdmFyIG5lZWRzTWV0YSA9IFtdO1xuXG4gICAgICAgICAgcHJvcHMuZmllbGQuZGVmLm5lZWRzTWV0YS5mb3JFYWNoKGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICAgICAgICBpZiAoXy5pc0FycmF5KGFyZ3MpICYmIGFyZ3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICBpZiAoXy5pc0FycmF5KGFyZ3NbMF0pKSB7XG4gICAgICAgICAgICAgICAgYXJncy5mb3JFYWNoKGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICAgICAgICAgICAgICBuZWVkc01ldGEucHVzaChhcmdzKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZWVkc01ldGEucHVzaChhcmdzKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgaWYgKG5lZWRzTWV0YS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIC8vIE11c3QganVzdCBiZSBhIHNpbmdsZSBuZWVkLCBhbmQgbm90IGFuIGFycmF5LlxuICAgICAgICAgICAgbmVlZHNNZXRhID0gW3Byb3BzLmZpZWxkLmRlZi5uZWVkc01ldGFdO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIG5lZWRzTWV0YS5mb3JFYWNoKGZ1bmN0aW9uIChuZWVkcykge1xuICAgICAgICAgICAgaWYgKG5lZWRzKSB7XG4gICAgICAgICAgICAgIHByb3BzLmZpZWxkLmZvcm0ubG9hZE1ldGEuYXBwbHkocHJvcHMuZmllbGQuZm9ybSwgbmVlZHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmxvYWROZWVkZWRNZXRhKHRoaXMucHJvcHMpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV4dFByb3BzKSB7XG4gICAgICB0aGlzLmxvYWROZWVkZWRNZXRhKG5leHRQcm9wcyk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAvLyBSZW1vdmluZyB0aGlzIGFzIGl0J3MgYSBiYWQgaWRlYSwgYmVjYXVzZSB1bm1vdW50aW5nIGEgY29tcG9uZW50IGlzIG5vdFxuICAgICAgLy8gYWx3YXlzIGEgc2lnbmFsIHRvIHJlbW92ZSB0aGUgZmllbGQuIFdpbGwgaGF2ZSB0byBmaW5kIGEgYmV0dGVyIHdheS5cblxuICAgICAgLy8gaWYgKHRoaXMucHJvcHMuZmllbGQpIHtcbiAgICAgIC8vICAgdGhpcy5wcm9wcy5maWVsZC5lcmFzZSgpO1xuICAgICAgLy8gfVxuICAgIH1cbiAgfTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIi8vICMgbWl4aW4uaW5wdXQtYWN0aW9uc1xuXG4vKlxuQ3VycmVudGx5IHVudXNlZC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSB7XG5cbiAgICBvbkZvY3VzOiBmdW5jdGlvbiAoKSB7XG5cbiAgICB9LFxuXG4gICAgb25CbHVyOiBmdW5jdGlvbiAoKSB7XG5cbiAgICB9LFxuXG4gICAgb25DaGFuZ2U6IGZ1bmN0aW9uICgpIHtcblxuICAgIH1cbiAgfTtcbn07XG4iLCIvLyAjIG1peGluLnJlc2l6ZVxuXG4vKlxuWW91J2QgdGhpbmsgaXQgd291bGQgYmUgcHJldHR5IGVhc3kgdG8gZGV0ZWN0IHdoZW4gYSBET00gZWxlbWVudCBpcyByZXNpemVkLlxuQW5kIHlvdSdkIGJlIHdyb25nLiBUaGVyZSBhcmUgdmFyaW91cyB0cmlja3MsIGJ1dCBub25lIG9mIHRoZW0gd29yayB2ZXJ5IHdlbGwuXG5TbywgdXNpbmcgZ29vZCBvbCcgcG9sbGluZyBoZXJlLiBUbyB0cnkgdG8gYmUgYXMgZWZmaWNpZW50IGFzIHBvc3NpYmxlLCB0aGVyZVxuaXMgb25seSBhIHNpbmdsZSBzZXRJbnRlcnZhbCB1c2VkIGZvciBhbGwgZWxlbWVudHMuIFRvIHVzZTpcblxuYGBganNcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIG1peGluczogW3BsdWdpbi5yZXF1aXJlKCdtaXhpbi5yZXNpemUnKV0sXG5cbiAgICBvblJlc2l6ZTogZnVuY3Rpb24gKCkge1xuICAgICAgY29uc29sZS5sb2coJ3Jlc2l6ZWQhJyk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNldE9uUmVzaXplKCdteVRleHQnLCB0aGlzLm9uUmVzaXplKTtcbiAgICB9LFxuXG4gICAgb25DaGFuZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgIC4uLlxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBSZWFjdC5ET00udGV4dGFyZWEoe3JlZjogJ215VGV4dCcsIHZhbHVlOiB0aGlzLnByb3BzLnZhbHVlLCBvbkNoYW5nZTogLi4ufSlcbiAgICB9XG4gIH0pO1xufTtcbmBgYFxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgaWQgPSAwO1xuXG52YXIgcmVzaXplSW50ZXJ2YWxFbGVtZW50cyA9IHt9O1xudmFyIHJlc2l6ZUludGVydmFsRWxlbWVudHNDb3VudCA9IDA7XG52YXIgcmVzaXplSW50ZXJ2YWxUaW1lciA9IG51bGw7XG5cbnZhciBjaGVja0VsZW1lbnRzID0gZnVuY3Rpb24gKCkge1xuICBPYmplY3Qua2V5cyhyZXNpemVJbnRlcnZhbEVsZW1lbnRzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICB2YXIgZWxlbWVudCA9IHJlc2l6ZUludGVydmFsRWxlbWVudHNba2V5XTtcbiAgICBpZiAoZWxlbWVudC5jbGllbnRXaWR0aCAhPT0gZWxlbWVudC5fX3ByZXZDbGllbnRXaWR0aCB8fCBlbGVtZW50LmNsaWVudEhlaWdodCAhPT0gZWxlbWVudC5fX3ByZXZDbGllbnRIZWlnaHQpIHtcbiAgICAgIGVsZW1lbnQuX19wcmV2Q2xpZW50V2lkdGggPSBlbGVtZW50LmNsaWVudFdpZHRoO1xuICAgICAgZWxlbWVudC5fX3ByZXZDbGllbnRIZWlnaHQgPSBlbGVtZW50LmNsaWVudEhlaWdodDtcbiAgICAgIHZhciBoYW5kbGVycyA9IGVsZW1lbnQuX19yZXNpemVIYW5kbGVycztcbiAgICAgIGhhbmRsZXJzLmZvckVhY2goZnVuY3Rpb24gKGhhbmRsZXIpIHtcbiAgICAgICAgaGFuZGxlcigpO1xuICAgICAgfSk7XG4gICAgfVxuICB9LCAxMDApO1xufTtcblxudmFyIGFkZFJlc2l6ZUludGVydmFsSGFuZGxlciA9IGZ1bmN0aW9uIChlbGVtZW50LCBmbikge1xuICBpZiAocmVzaXplSW50ZXJ2YWxUaW1lciA9PT0gbnVsbCkge1xuICAgIHJlc2l6ZUludGVydmFsVGltZXIgPSBzZXRJbnRlcnZhbChjaGVja0VsZW1lbnRzLCAxMDApO1xuICB9XG4gIGlmICghKCdfX3Jlc2l6ZUlkJyBpbiBlbGVtZW50KSkge1xuICAgIGlkKys7XG4gICAgZWxlbWVudC5fX3ByZXZDbGllbnRXaWR0aCA9IGVsZW1lbnQuY2xpZW50V2lkdGg7XG4gICAgZWxlbWVudC5fX3ByZXZDbGllbnRIZWlnaHQgPSBlbGVtZW50LmNsaWVudEhlaWdodDtcbiAgICBlbGVtZW50Ll9fcmVzaXplSWQgPSBpZDtcbiAgICByZXNpemVJbnRlcnZhbEVsZW1lbnRzQ291bnQrKztcbiAgICByZXNpemVJbnRlcnZhbEVsZW1lbnRzW2lkXSA9IGVsZW1lbnQ7XG4gICAgZWxlbWVudC5fX3Jlc2l6ZUhhbmRsZXJzID0gW107XG4gIH1cbiAgZWxlbWVudC5fX3Jlc2l6ZUhhbmRsZXJzLnB1c2goZm4pO1xufTtcblxudmFyIHJlbW92ZVJlc2l6ZUludGVydmFsSGFuZGxlcnMgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICBpZiAoISgnX19yZXNpemVJZCcgaW4gZWxlbWVudCkpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIGlkID0gZWxlbWVudC5fX3Jlc2l6ZUlkO1xuICBkZWxldGUgZWxlbWVudC5fX3Jlc2l6ZUlkO1xuICBkZWxldGUgZWxlbWVudC5fX3Jlc2l6ZUhhbmRsZXJzO1xuICBkZWxldGUgcmVzaXplSW50ZXJ2YWxFbGVtZW50c1tpZF07XG4gIHJlc2l6ZUludGVydmFsRWxlbWVudHNDb3VudC0tO1xuICBpZiAocmVzaXplSW50ZXJ2YWxFbGVtZW50c0NvdW50IDwgMSkge1xuICAgIGNsZWFySW50ZXJ2YWwocmVzaXplSW50ZXJ2YWxUaW1lcik7XG4gIH1cbn07XG5cbnZhciBvblJlc2l6ZSA9IGZ1bmN0aW9uIChyZWYsIGZuKSB7XG4gIGZuKHJlZik7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IHtcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5vblJlc2l6ZVdpbmRvdykge1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5vblJlc2l6ZVdpbmRvdyk7XG4gICAgICB9XG4gICAgICB0aGlzLnJlc2l6ZUVsZW1lbnRSZWZzID0ge307XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5vblJlc2l6ZVdpbmRvdykge1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5vblJlc2l6ZVdpbmRvdyk7XG4gICAgICB9XG4gICAgICBPYmplY3Qua2V5cyh0aGlzLnJlc2l6ZUVsZW1lbnRSZWZzKS5mb3JFYWNoKGZ1bmN0aW9uIChyZWYpIHtcbiAgICAgICAgcmVtb3ZlUmVzaXplSW50ZXJ2YWxIYW5kbGVycyh0aGlzLnJlZnNbcmVmXS5nZXRET01Ob2RlKCkpO1xuICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuXG4gICAgc2V0T25SZXNpemU6IGZ1bmN0aW9uIChyZWYsIGZuKSB7XG4gICAgICBpZiAoIXRoaXMucmVzaXplRWxlbWVudFJlZnNbcmVmXSkge1xuICAgICAgICB0aGlzLnJlc2l6ZUVsZW1lbnRSZWZzW3JlZl0gPSB0cnVlO1xuICAgICAgfVxuICAgICAgYWRkUmVzaXplSW50ZXJ2YWxIYW5kbGVyKHRoaXMucmVmc1tyZWZdLmdldERPTU5vZGUoKSwgb25SZXNpemUuYmluZCh0aGlzLCByZWYsIGZuKSk7XG4gICAgfVxuICB9O1xufTtcbiIsIi8vICMgbWl4aW4udW5kby1zdGFja1xuXG4vKlxuR2l2ZXMgeW91ciBjb21wb25lbnQgYW4gdW5kbyBzdGFjay5cbiovXG5cbi8vIGh0dHA6Ly9wcm9tZXRoZXVzcmVzZWFyY2guZ2l0aHViLmlvL3JlYWN0LWZvcm1zL2V4YW1wbGVzL3VuZG8uaHRtbFxuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBVbmRvU3RhY2sgPSB7XG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHt1bmRvOiBbXSwgcmVkbzogW119O1xuICB9LFxuXG4gIHNuYXBzaG90OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdW5kbyA9IHRoaXMuc3RhdGUudW5kby5jb25jYXQodGhpcy5nZXRTdGF0ZVNuYXBzaG90KCkpO1xuICAgIGlmICh0eXBlb2YgdGhpcy5zdGF0ZS51bmRvRGVwdGggPT09ICdudW1iZXInKSB7XG4gICAgICBpZiAodW5kby5sZW5ndGggPiB0aGlzLnN0YXRlLnVuZG9EZXB0aCkge1xuICAgICAgICB1bmRvLnNoaWZ0KCk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuc2V0U3RhdGUoe3VuZG86IHVuZG8sIHJlZG86IFtdfSk7XG4gIH0sXG5cbiAgaGFzVW5kbzogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUudW5kby5sZW5ndGggPiAwO1xuICB9LFxuXG4gIGhhc1JlZG86IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnJlZG8ubGVuZ3RoID4gMDtcbiAgfSxcblxuICByZWRvOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl91bmRvSW1wbCh0cnVlKTtcbiAgfSxcblxuICB1bmRvOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl91bmRvSW1wbCgpO1xuICB9LFxuXG4gIF91bmRvSW1wbDogZnVuY3Rpb24oaXNSZWRvKSB7XG4gICAgdmFyIHVuZG8gPSB0aGlzLnN0YXRlLnVuZG8uc2xpY2UoMCk7XG4gICAgdmFyIHJlZG8gPSB0aGlzLnN0YXRlLnJlZG8uc2xpY2UoMCk7XG4gICAgdmFyIHNuYXBzaG90O1xuXG4gICAgaWYgKGlzUmVkbykge1xuICAgICAgaWYgKHJlZG8ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHNuYXBzaG90ID0gcmVkby5wb3AoKTtcbiAgICAgIHVuZG8ucHVzaCh0aGlzLmdldFN0YXRlU25hcHNob3QoKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh1bmRvLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBzbmFwc2hvdCA9IHVuZG8ucG9wKCk7XG4gICAgICByZWRvLnB1c2godGhpcy5nZXRTdGF0ZVNuYXBzaG90KCkpO1xuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGVTbmFwc2hvdChzbmFwc2hvdCk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7dW5kbzp1bmRvLCByZWRvOnJlZG99KTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG4gIHBsdWdpbi5leHBvcnRzID0gVW5kb1N0YWNrO1xufTtcbiIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgYm9vdHN0cmFwXG5cbi8qXG5UaGUgYm9vdHN0cmFwIHBsdWdpbiBidW5kbGUgZXhwb3J0cyBhIGJ1bmNoIG9mIFwicHJvcCBtb2RpZmllclwiIHBsdWdpbnMgd2hpY2hcbm1hbmlwdWxhdGUgdGhlIHByb3BzIGdvaW5nIGludG8gbWFueSBvZiB0aGUgY29tcG9uZW50cy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbnZhciBtb2RpZmllcnMgPSB7XG5cbiAgJ2ZpZWxkJzoge2NsYXNzTmFtZTogJ2Zvcm0tZ3JvdXAnfSxcbiAgJ2hlbHAnOiB7Y2xhc3NOYW1lOiAnaGVscC1ibG9jayd9LFxuICAnc2FtcGxlJzoge2NsYXNzTmFtZTogJ2hlbHAtYmxvY2snfSxcbiAgJ3RleHQnOiB7Y2xhc3NOYW1lOiAnZm9ybS1jb250cm9sJ30sXG4gICd0ZXh0YXJlYSc6IHtjbGFzc05hbWU6ICdmb3JtLWNvbnRyb2wnfSxcbiAgJ3ByZXR0eS10ZXh0YXJlYSc6IHtjbGFzc05hbWU6ICdmb3JtLWNvbnRyb2wnfSxcbiAgJ2pzb24nOiB7Y2xhc3NOYW1lOiAnZm9ybS1jb250cm9sJ30sXG4gICdzZWxlY3QnOiB7Y2xhc3NOYW1lOiAnZm9ybS1jb250cm9sJ30sXG4gIC8vJ2xpc3QnOiB7Y2xhc3NOYW1lOiAnd2VsbCd9LFxuICAnbGlzdC1jb250cm9sJzoge2NsYXNzTmFtZTogJ2Zvcm0taW5saW5lJ30sXG4gICdsaXN0LWl0ZW0nOiB7Y2xhc3NOYW1lOiAnd2VsbCd9LFxuICAnaXRlbS1jaG9pY2VzJzoge2NsYXNzTmFtZTogJ2Zvcm0tY29udHJvbCd9LFxuICAnYWRkLWl0ZW0nOiB7Y2xhc3NOYW1lOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1wbHVzJywgbGFiZWw6ICcnfSxcbiAgJ3JlbW92ZS1pdGVtJzoge2NsYXNzTmFtZTogJ2dseXBoaWNvbiBnbHlwaGljb24tcmVtb3ZlJywgbGFiZWw6ICcnfSxcbiAgJ21vdmUtaXRlbS1iYWNrJzoge2NsYXNzTmFtZTogJ2dseXBoaWNvbiBnbHlwaGljb24tYXJyb3ctdXAnLCBsYWJlbDogJyd9LFxuICAnbW92ZS1pdGVtLWZvcndhcmQnOiB7Y2xhc3NOYW1lOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1hcnJvdy1kb3duJywgbGFiZWw6ICcnfVxufTtcblxuLy8gQnVpbGQgdGhlIHBsdWdpbiBidW5kbGUuXG5fLmVhY2gobW9kaWZpZXJzLCBmdW5jdGlvbiAobW9kaWZpZXIsIG5hbWUpIHtcblxuICBleHBvcnRzWydjb21wb25lbnQtcHJvcHMuJyArIG5hbWUgKyAnLmJvb3RzdHJhcCddID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gICAgdmFyIHV0aWwgPSBwbHVnaW4ucmVxdWlyZSgndXRpbCcpO1xuXG4gICAgcGx1Z2luLmV4cG9ydHMgPSBbXG4gICAgICBuYW1lLFxuICAgICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIGlmICghXy5pc1VuZGVmaW5lZChtb2RpZmllci5jbGFzc05hbWUpKSB7XG4gICAgICAgICAgcHJvcHMuY2xhc3NOYW1lID0gdXRpbC5jbGFzc05hbWUocHJvcHMuY2xhc3NOYW1lLCBtb2RpZmllci5jbGFzc05hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghXy5pc1VuZGVmaW5lZChtb2RpZmllci5sYWJlbCkpIHtcbiAgICAgICAgICBwcm9wcy5sYWJlbCA9IG1vZGlmaWVyLmxhYmVsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgXTtcbiAgfTtcblxufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgZGVmYXVsdC1zdHlsZVxuXG4vKlxuVGhlIGRlZmF1bHQtc3R5bGUgcGx1Z2luIGJ1bmRsZSBleHBvcnRzIGEgYnVuY2ggb2YgXCJwcm9wIG1vZGlmaWVyXCIgcGx1Z2lucyB3aGljaFxubWFuaXB1bGF0ZSB0aGUgcHJvcHMgZ29pbmcgaW50byBtYW55IG9mIHRoZSBjb21wb25lbnRzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxudmFyIG1vZGlmaWVycyA9IHtcblxuICAnZmllbGQnOiB7fSxcbiAgJ2hlbHAnOiB7fSxcbiAgJ3NhbXBsZSc6IHt9LFxuICAndGV4dCc6IHt9LFxuICAndGV4dGFyZWEnOiB7fSxcbiAgJ3ByZXR0eS10ZXh0YXJlYSc6IHt9LFxuICAnanNvbic6IHt9LFxuICAnc2VsZWN0Jzoge30sXG4gICdsaXN0Jzoge30sXG4gICdsaXN0LWNvbnRyb2wnOiB7fSxcbiAgJ2xpc3QtaXRlbS1jb250cm9sJzoge30sXG4gICdsaXN0LWl0ZW0tdmFsdWUnOiB7fSxcbiAgJ2xpc3QtaXRlbSc6IHt9LFxuICAnaXRlbS1jaG9pY2VzJzoge30sXG4gICdhZGQtaXRlbSc6IHt9LFxuICAncmVtb3ZlLWl0ZW0nOiB7fSxcbiAgJ21vdmUtaXRlbS1iYWNrJzoge30sXG4gICdtb3ZlLWl0ZW0tZm9yd2FyZCc6IHt9XG59O1xuXG4vLyBCdWlsZCB0aGUgcGx1Z2luIGJ1bmRsZS5cbl8uZWFjaChtb2RpZmllcnMsIGZ1bmN0aW9uIChtb2RpZmllciwgbmFtZSkge1xuXG4gIGV4cG9ydHNbJ2NvbXBvbmVudC1wcm9wcy4nICsgbmFtZSArICcuZGVmYXVsdCddID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gICAgdmFyIHV0aWwgPSBwbHVnaW4ucmVxdWlyZSgndXRpbCcpO1xuXG4gICAgcGx1Z2luLmV4cG9ydHMgPSBbXG4gICAgICBuYW1lLFxuICAgICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIHByb3BzLmNsYXNzTmFtZSA9IHV0aWwuY2xhc3NOYW1lKHByb3BzLmNsYXNzTmFtZSwgbmFtZSk7XG4gICAgICB9XG4gICAgXTtcbiAgfTtcblxufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgc3RvcmUubWVtb3J5XG5cbi8qXG5UaGUgbWVtb3J5IHN0b3JlIHBsdWdpbiBrZWVwcyB0aGUgc3RhdGUgb2YgZmllbGRzLCBkYXRhLCBhbmQgbWV0YWRhdGEuIEl0XG5yZXNwb25kcyB0byBhY3Rpb25zIGFuZCBlbWl0cyBhIGNoYW5nZSBldmVudCBpZiB0aGVyZSBhcmUgYW55IGNoYW5nZXMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICB2YXIgY29tcGlsZXIgPSBwbHVnaW4ucmVxdWlyZSgnY29tcGlsZXInKTtcbiAgdmFyIHV0aWwgPSBwbHVnaW4ucmVxdWlyZSgndXRpbCcpO1xuXG4gIHBsdWdpbi5leHBvcnRzID0gZnVuY3Rpb24gKGZvcm0sIGVtaXR0ZXIsIG9wdGlvbnMpIHtcblxuICAgIHZhciBzdG9yZSA9IHt9O1xuXG4gICAgc3RvcmUuZmllbGRzID0gW107XG4gICAgc3RvcmUudGVtcGxhdGVNYXAgPSB7fTtcbiAgICBzdG9yZS52YWx1ZSA9IHt9O1xuICAgIHN0b3JlLm1ldGEgPSB7fTtcblxuICAgIC8vIEhlbHBlciB0byBzZXR1cCBmaWVsZHMuIEZpZWxkIGRlZmluaXRpb25zIG5lZWQgdG8gYmUgZXhwYW5kZWQsIGNvbXBpbGVkLFxuICAgIC8vIGV0Yy5cbiAgICB2YXIgc2V0dXBGaWVsZHMgPSBmdW5jdGlvbiAoZmllbGRzKSB7XG4gICAgICBzdG9yZS5maWVsZHMgPSBjb21waWxlci5leHBhbmRGaWVsZHMoZmllbGRzKTtcbiAgICAgIHN0b3JlLmZpZWxkcyA9IGNvbXBpbGVyLmNvbXBpbGVGaWVsZHMoc3RvcmUuZmllbGRzKTtcbiAgICAgIHN0b3JlLnRlbXBsYXRlTWFwID0gY29tcGlsZXIudGVtcGxhdGVNYXAoc3RvcmUuZmllbGRzKTtcbiAgICAgIHN0b3JlLmZpZWxkcyA9IHN0b3JlLmZpZWxkcy5maWx0ZXIoZnVuY3Rpb24gKGRlZikge1xuICAgICAgICByZXR1cm4gIWRlZi50ZW1wbGF0ZTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBpZiAob3B0aW9ucy5maWVsZHMpIHtcbiAgICAgIHNldHVwRmllbGRzKG9wdGlvbnMuZmllbGRzKTtcbiAgICB9XG5cbiAgICBpZiAoIV8uaXNVbmRlZmluZWQob3B0aW9ucy52YWx1ZSkpIHtcbiAgICAgIHN0b3JlLnZhbHVlID0gdXRpbC5jb3B5VmFsdWUob3B0aW9ucy52YWx1ZSk7XG4gICAgfVxuXG4gICAgLy8gQ3VycmVudGx5LCBqdXN0IGEgc2luZ2xlIGV2ZW50IGZvciBhbnkgY2hhbmdlLlxuICAgIHZhciB1cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBlbWl0dGVyLmVtaXQoJ2NoYW5nZScsIHtcbiAgICAgICAgdmFsdWU6IHN0b3JlLnZhbHVlLFxuICAgICAgICBtZXRhOiBzdG9yZS5tZXRhLFxuICAgICAgICBmaWVsZHM6IHN0b3JlLmZpZWxkc1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIFdoZW4gZmllbGRzIGNoYW5nZSwgd2UgbmVlZCB0byBcImluZmxhdGVcIiB0aGVtLCBtZWFuaW5nIGV4cGFuZCB0aGVtIGFuZFxuICAgIC8vIHJ1biBhbnkgZXZhbHVhdGlvbnMgaW4gb3JkZXIgdG8gZ2V0IHRoZSBkZWZhdWx0IHZhbHVlIG91dC5cbiAgICBzdG9yZS5pbmZsYXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGZpZWxkID0gZm9ybS5maWVsZCgpO1xuICAgICAgZmllbGQuaW5mbGF0ZShmdW5jdGlvbiAocGF0aCwgdmFsdWUpIHtcbiAgICAgICAgc3RvcmUudmFsdWUgPSB1dGlsLnNldEluKHN0b3JlLnZhbHVlLCBwYXRoLCB2YWx1ZSk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgdmFyIGFjdGlvbnMgPSB7XG5cbiAgICAgIC8vIFNldCB2YWx1ZSBhdCBhIHBhdGguXG4gICAgICBzZXRWYWx1ZTogZnVuY3Rpb24gKHBhdGgsIHZhbHVlKSB7XG5cbiAgICAgICAgaWYgKF8uaXNVbmRlZmluZWQodmFsdWUpKSB7XG4gICAgICAgICAgdmFsdWUgPSBwYXRoO1xuICAgICAgICAgIHBhdGggPSBbXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGF0aC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICBzdG9yZS52YWx1ZSA9IHV0aWwuY29weVZhbHVlKHZhbHVlKTtcbiAgICAgICAgICBzdG9yZS5pbmZsYXRlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RvcmUudmFsdWUgPSB1dGlsLnNldEluKHN0b3JlLnZhbHVlLCBwYXRoLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgdXBkYXRlKCk7XG4gICAgICB9LFxuXG4gICAgICAvLyBSZW1vdmUgYSB2YWx1ZSBhdCBhIHBhdGguXG4gICAgICByZW1vdmVWYWx1ZTogZnVuY3Rpb24gKHBhdGgpIHtcblxuICAgICAgICBzdG9yZS52YWx1ZSA9IHV0aWwucmVtb3ZlSW4oc3RvcmUudmFsdWUsIHBhdGgpO1xuXG4gICAgICAgIHVwZGF0ZSgpO1xuICAgICAgfSxcblxuICAgICAgLy8gRXJhc2UgYSB2YWx1ZS4gVXNlciBhY3Rpb25zIGNhbiByZW1vdmUgdmFsdWVzLCBidXQgbm9kZXMgY2FuIGFsc29cbiAgICAgIC8vIGRpc2FwcGVhciBkdWUgdG8gY2hhbmdpbmcgZXZhbHVhdGlvbnMuIFRoaXMgYWN0aW9uIG9jY3VycyBhdXRvbWF0aWNhbGx5XG4gICAgICAvLyAoYW5kIG1heSBiZSB1bm5lY2Vzc2FyeSBpZiB0aGUgdmFsdWUgd2FzIGFscmVhZHkgcmVtb3ZlZCkuXG4gICAgICBlcmFzZVZhbHVlOiBmdW5jdGlvbiAocGF0aCkge1xuXG4gICAgICAgIHN0b3JlLnZhbHVlID0gdXRpbC5yZW1vdmVJbihzdG9yZS52YWx1ZSwgcGF0aCk7XG5cbiAgICAgICAgdXBkYXRlKCk7XG4gICAgICB9LFxuXG4gICAgICAvLyBBcHBlbmQgYSB2YWx1ZSB0byBhbiBhcnJheSBhdCBhIHBhdGguXG4gICAgICBhcHBlbmRWYWx1ZTogZnVuY3Rpb24gKHBhdGgsIHZhbHVlKSB7XG4gICAgICAgIHN0b3JlLnZhbHVlID0gdXRpbC5hcHBlbmRJbihzdG9yZS52YWx1ZSwgcGF0aCwgdmFsdWUpO1xuXG4gICAgICAgIHVwZGF0ZSgpO1xuICAgICAgfSxcblxuICAgICAgLy8gU3dhcCB2YWx1ZXMgb2YgdHdvIGtleXMuXG4gICAgICBtb3ZlVmFsdWU6IGZ1bmN0aW9uIChwYXRoLCBmcm9tS2V5LCB0b0tleSkge1xuICAgICAgICBzdG9yZS52YWx1ZSA9IHV0aWwubW92ZUluKHN0b3JlLnZhbHVlLCBwYXRoLCBmcm9tS2V5LCB0b0tleSk7XG5cbiAgICAgICAgdXBkYXRlKCk7XG4gICAgICB9LFxuXG4gICAgICAvLyBDaGFuZ2UgYWxsIHRoZSBmaWVsZHMuXG4gICAgICBzZXRGaWVsZHM6IGZ1bmN0aW9uIChmaWVsZHMpIHtcbiAgICAgICAgc2V0dXBGaWVsZHMoZmllbGRzKTtcbiAgICAgICAgc3RvcmUuaW5mbGF0ZSgpO1xuXG4gICAgICAgIHVwZGF0ZSgpO1xuICAgICAgfSxcblxuICAgICAgLy8gU2V0IGEgbWV0YWRhdGEgdmFsdWUgZm9yIGEga2V5LlxuICAgICAgc2V0TWV0YTogZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgICAgc3RvcmUubWV0YVtrZXldID0gdmFsdWU7XG4gICAgICAgIHVwZGF0ZSgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBfLmV4dGVuZChzdG9yZSwgYWN0aW9ucyk7XG5cbiAgICByZXR1cm4gc3RvcmU7XG4gIH07XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIHR5cGUuYXJyYXlcblxuLypcblN1cHBvcnQgYXJyYXkgdHlwZSB3aGVyZSBjaGlsZCBmaWVsZHMgYXJlIGR5bmFtaWNhbGx5IGRldGVybWluZWQgYmFzZWQgb24gdGhlXG52YWx1ZXMgb2YgdGhlIGFycmF5LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMuZGVmYXVsdCA9IFtdO1xuXG4gIHBsdWdpbi5leHBvcnRzLmZpZWxkcyA9IGZ1bmN0aW9uIChmaWVsZCkge1xuXG4gICAgaWYgKF8uaXNBcnJheShmaWVsZC52YWx1ZSkpIHtcbiAgICAgIHJldHVybiBmaWVsZC52YWx1ZS5tYXAoZnVuY3Rpb24gKHZhbHVlLCBpKSB7XG4gICAgICAgIHZhciBpdGVtID0gZmllbGQuaXRlbUZvclZhbHVlKHZhbHVlKTtcbiAgICAgICAgaXRlbS5rZXkgPSBpO1xuICAgICAgICByZXR1cm4gZmllbGQuY3JlYXRlQ2hpbGQoaXRlbSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgfTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIi8vICMgdHlwZS5ib29sZWFuXG5cbi8qXG5TdXBwb3J0IGEgdHJ1ZS9mYWxzZSB2YWx1ZS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMuZGVmYXVsdCA9IGZhbHNlO1xuXG4gIHBsdWdpbi5leHBvcnRzLmNvbXBpbGUgPSBmdW5jdGlvbiAoZGVmKSB7XG4gICAgaWYgKCFkZWYuY2hvaWNlcykge1xuICAgICAgZGVmLmNob2ljZXMgPSBbXG4gICAgICAgIHt2YWx1ZTogdHJ1ZSwgbGFiZWw6ICdZZXMnfSxcbiAgICAgICAge3ZhbHVlOiBmYWxzZSwgbGFiZWw6ICdObyd9XG4gICAgICBdO1xuICAgIH1cbiAgfTtcbn07XG4iLCIvLyAjIHR5cGUuanNvblxuXG4vKlxuQXJiaXRyYXJ5IEpTT04gdmFsdWUuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzLmRlZmF1bHQgPSBudWxsO1xuXG59O1xuIiwiLy8gIyB0eXBlLm51bWJlclxuXG4vKlxuU3VwcG9ydCBudW1iZXIgdmFsdWVzLCBvZiBjb3Vyc2UuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzLmRlZmF1bHQgPSAwO1xuXG59O1xuIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyB0eXBlLm9iamVjdFxuXG4vKlxuU3VwcG9ydCBmb3Igb2JqZWN0IHR5cGVzLiBPYmplY3QgZmllbGRzIGNhbiBzdXBwbHkgc3RhdGljIGNoaWxkIGZpZWxkcywgb3IgaWZcbnRoZXJlIGFyZSBhZGRpdGlvbmFsIGNoaWxkIGtleXMsIGR5bmFtaWMgY2hpbGQgZmllbGRzIHdpbGwgYmUgY3JlYXRlZCBtdWNoXG5saWtlIGFuIGFycmF5LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgdmFyIHV0aWwgPSBwbHVnaW4ucmVxdWlyZSgndXRpbCcpO1xuXG4gIHBsdWdpbi5leHBvcnRzLmRlZmF1bHQgPSB7fTtcblxuICBwbHVnaW4uZXhwb3J0cy5maWVsZHMgPSBmdW5jdGlvbiAoZmllbGQpIHtcblxuICAgIHZhciBmaWVsZHMgPSBbXTtcbiAgICB2YXIgdmFsdWUgPSBmaWVsZC52YWx1ZTtcbiAgICB2YXIgdW51c2VkS2V5cyA9IF8ua2V5cyh2YWx1ZSk7XG5cbiAgICBpZiAoZmllbGQuZGVmLmZpZWxkcykge1xuXG4gICAgICBmaWVsZHMgPSBmaWVsZC5kZWYuZmllbGRzLm1hcChmdW5jdGlvbiAoZGVmKSB7XG4gICAgICAgIHZhciBjaGlsZCA9IGZpZWxkLmNyZWF0ZUNoaWxkKGRlZik7XG4gICAgICAgIGlmICghdXRpbC5pc0JsYW5rKGNoaWxkLmRlZi5rZXkpKSB7XG4gICAgICAgICAgdW51c2VkS2V5cyA9IF8ud2l0aG91dCh1bnVzZWRLZXlzLCBjaGlsZC5kZWYua2V5KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2hpbGQ7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodW51c2VkS2V5cy5sZW5ndGggPiAwKSB7XG4gICAgICB1bnVzZWRLZXlzLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICB2YXIgaXRlbSA9IGZpZWxkLml0ZW1Gb3JWYWx1ZSh2YWx1ZVtrZXldKTtcbiAgICAgICAgaXRlbS5sYWJlbCA9IHV0aWwuaHVtYW5pemUoa2V5KTtcbiAgICAgICAgaXRlbS5rZXkgPSBrZXk7XG4gICAgICAgIGZpZWxkcy5wdXNoKGZpZWxkLmNyZWF0ZUNoaWxkKGl0ZW0pKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBmaWVsZHM7XG4gIH07XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIvLyAjIHR5cGUucm9vdFxuXG4vKlxuU3BlY2lhbCB0eXBlIHJlcHJlc2VudGluZyB0aGUgcm9vdCBvZiB0aGUgZm9ybS4gR2V0cyB0aGUgZmllbGRzIGRpcmVjdGx5IGZyb21cbnRoZSBzdG9yZS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMuZmllbGRzID0gZnVuY3Rpb24gKGZpZWxkKSB7XG5cbiAgICByZXR1cm4gZmllbGQuZm9ybS5zdG9yZS5maWVsZHMubWFwKGZ1bmN0aW9uIChkZWYpIHtcbiAgICAgIHJldHVybiBmaWVsZC5jcmVhdGVDaGlsZChkZWYpO1xuICAgIH0pO1xuXG4gIH07XG59O1xuIiwiLy8gIyB0eXBlLnN0cmluZ1xuXG4vKlxuU3VwcG9ydCBzdHJpbmcgdmFsdWVzLCBvZiBjb3Vyc2UuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzLmRlZmF1bHQgPSAnJztcblxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBSZXByZXNlbnRhdGlvbiBvZiBhIHNpbmdsZSBFdmVudEVtaXR0ZXIgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gRXZlbnQgaGFuZGxlciB0byBiZSBjYWxsZWQuXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IENvbnRleHQgZm9yIGZ1bmN0aW9uIGV4ZWN1dGlvbi5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb25jZSBPbmx5IGVtaXQgb25jZVxuICogQGFwaSBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIEVFKGZuLCBjb250ZXh0LCBvbmNlKSB7XG4gIHRoaXMuZm4gPSBmbjtcbiAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbiAgdGhpcy5vbmNlID0gb25jZSB8fCBmYWxzZTtcbn1cblxuLyoqXG4gKiBNaW5pbWFsIEV2ZW50RW1pdHRlciBpbnRlcmZhY2UgdGhhdCBpcyBtb2xkZWQgYWdhaW5zdCB0aGUgTm9kZS5qc1xuICogRXZlbnRFbWl0dGVyIGludGVyZmFjZS5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBhcGkgcHVibGljXG4gKi9cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHsgLyogTm90aGluZyB0byBzZXQgKi8gfVxuXG4vKipcbiAqIEhvbGRzIHRoZSBhc3NpZ25lZCBFdmVudEVtaXR0ZXJzIGJ5IG5hbWUuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqIEBwcml2YXRlXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBSZXR1cm4gYSBsaXN0IG9mIGFzc2lnbmVkIGV2ZW50IGxpc3RlbmVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50cyB0aGF0IHNob3VsZCBiZSBsaXN0ZWQuXG4gKiBAcmV0dXJucyB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uIGxpc3RlbmVycyhldmVudCkge1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW2V2ZW50XSkgcmV0dXJuIFtdO1xuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5fZXZlbnRzW2V2ZW50XS5sZW5ndGgsIGVlID0gW107IGkgPCBsOyBpKyspIHtcbiAgICBlZS5wdXNoKHRoaXMuX2V2ZW50c1tldmVudF1baV0uZm4pO1xuICB9XG5cbiAgcmV0dXJuIGVlO1xufTtcblxuLyoqXG4gKiBFbWl0IGFuIGV2ZW50IHRvIGFsbCByZWdpc3RlcmVkIGV2ZW50IGxpc3RlbmVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIG5hbWUgb2YgdGhlIGV2ZW50LlxuICogQHJldHVybnMge0Jvb2xlYW59IEluZGljYXRpb24gaWYgd2UndmUgZW1pdHRlZCBhbiBldmVudC5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIGVtaXQoZXZlbnQsIGExLCBhMiwgYTMsIGE0LCBhNSkge1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW2V2ZW50XSkgcmV0dXJuIGZhbHNlO1xuXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbZXZlbnRdXG4gICAgLCBsZW5ndGggPSBsaXN0ZW5lcnMubGVuZ3RoXG4gICAgLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgLCBlZSA9IGxpc3RlbmVyc1swXVxuICAgICwgYXJnc1xuICAgICwgaSwgajtcblxuICBpZiAoMSA9PT0gbGVuZ3RoKSB7XG4gICAgaWYgKGVlLm9uY2UpIHRoaXMucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGVlLmZuLCB0cnVlKTtcblxuICAgIHN3aXRjaCAobGVuKSB7XG4gICAgICBjYXNlIDE6IHJldHVybiBlZS5mbi5jYWxsKGVlLmNvbnRleHQpLCB0cnVlO1xuICAgICAgY2FzZSAyOiByZXR1cm4gZWUuZm4uY2FsbChlZS5jb250ZXh0LCBhMSksIHRydWU7XG4gICAgICBjYXNlIDM6IHJldHVybiBlZS5mbi5jYWxsKGVlLmNvbnRleHQsIGExLCBhMiksIHRydWU7XG4gICAgICBjYXNlIDQ6IHJldHVybiBlZS5mbi5jYWxsKGVlLmNvbnRleHQsIGExLCBhMiwgYTMpLCB0cnVlO1xuICAgICAgY2FzZSA1OiByZXR1cm4gZWUuZm4uY2FsbChlZS5jb250ZXh0LCBhMSwgYTIsIGEzLCBhNCksIHRydWU7XG4gICAgICBjYXNlIDY6IHJldHVybiBlZS5mbi5jYWxsKGVlLmNvbnRleHQsIGExLCBhMiwgYTMsIGE0LCBhNSksIHRydWU7XG4gICAgfVxuXG4gICAgZm9yIChpID0gMSwgYXJncyA9IG5ldyBBcnJheShsZW4gLTEpOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgIH1cblxuICAgIGVlLmZuLmFwcGx5KGVlLmNvbnRleHQsIGFyZ3MpO1xuICB9IGVsc2Uge1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGxpc3RlbmVyc1tpXS5vbmNlKSB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcnNbaV0uZm4sIHRydWUpO1xuXG4gICAgICBzd2l0Y2ggKGxlbikge1xuICAgICAgICBjYXNlIDE6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0KTsgYnJlYWs7XG4gICAgICAgIGNhc2UgMjogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExKTsgYnJlYWs7XG4gICAgICAgIGNhc2UgMzogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExLCBhMik7IGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGlmICghYXJncykgZm9yIChqID0gMSwgYXJncyA9IG5ldyBBcnJheShsZW4gLTEpOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaiAtIDFdID0gYXJndW1lbnRzW2pdO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxpc3RlbmVyc1tpXS5mbi5hcHBseShsaXN0ZW5lcnNbaV0uY29udGV4dCwgYXJncyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vKipcbiAqIFJlZ2lzdGVyIGEgbmV3IEV2ZW50TGlzdGVuZXIgZm9yIHRoZSBnaXZlbiBldmVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgTmFtZSBvZiB0aGUgZXZlbnQuXG4gKiBAcGFyYW0ge0Z1bmN0b259IGZuIENhbGxiYWNrIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBUaGUgY29udGV4dCBvZiB0aGUgZnVuY3Rpb24uXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gb24oZXZlbnQsIGZuLCBjb250ZXh0KSB7XG4gIGlmICghdGhpcy5fZXZlbnRzKSB0aGlzLl9ldmVudHMgPSB7fTtcbiAgaWYgKCF0aGlzLl9ldmVudHNbZXZlbnRdKSB0aGlzLl9ldmVudHNbZXZlbnRdID0gW107XG4gIHRoaXMuX2V2ZW50c1tldmVudF0ucHVzaChuZXcgRUUoIGZuLCBjb250ZXh0IHx8IHRoaXMgKSk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZCBhbiBFdmVudExpc3RlbmVyIHRoYXQncyBvbmx5IGNhbGxlZCBvbmNlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBOYW1lIG9mIHRoZSBldmVudC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIENhbGxiYWNrIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBUaGUgY29udGV4dCBvZiB0aGUgZnVuY3Rpb24uXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbiBvbmNlKGV2ZW50LCBmbiwgY29udGV4dCkge1xuICBpZiAoIXRoaXMuX2V2ZW50cykgdGhpcy5fZXZlbnRzID0ge307XG4gIGlmICghdGhpcy5fZXZlbnRzW2V2ZW50XSkgdGhpcy5fZXZlbnRzW2V2ZW50XSA9IFtdO1xuICB0aGlzLl9ldmVudHNbZXZlbnRdLnB1c2gobmV3IEVFKGZuLCBjb250ZXh0IHx8IHRoaXMsIHRydWUgKSk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBldmVudCBsaXN0ZW5lcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCB3ZSB3YW50IHRvIHJlbW92ZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBsaXN0ZW5lciB0aGF0IHdlIG5lZWQgdG8gZmluZC5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb25jZSBPbmx5IHJlbW92ZSBvbmNlIGxpc3RlbmVycy5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcihldmVudCwgZm4sIG9uY2UpIHtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1tldmVudF0pIHJldHVybiB0aGlzO1xuXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbZXZlbnRdXG4gICAgLCBldmVudHMgPSBbXTtcblxuICBpZiAoZm4pIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBsaXN0ZW5lcnMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBpZiAobGlzdGVuZXJzW2ldLmZuICE9PSBmbiAmJiBsaXN0ZW5lcnNbaV0ub25jZSAhPT0gb25jZSkge1xuICAgICAgZXZlbnRzLnB1c2gobGlzdGVuZXJzW2ldKTtcbiAgICB9XG4gIH1cblxuICAvL1xuICAvLyBSZXNldCB0aGUgYXJyYXksIG9yIHJlbW92ZSBpdCBjb21wbGV0ZWx5IGlmIHdlIGhhdmUgbm8gbW9yZSBsaXN0ZW5lcnMuXG4gIC8vXG4gIGlmIChldmVudHMubGVuZ3RoKSB0aGlzLl9ldmVudHNbZXZlbnRdID0gZXZlbnRzO1xuICBlbHNlIHRoaXMuX2V2ZW50c1tldmVudF0gPSBudWxsO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYWxsIGxpc3RlbmVycyBvciBvbmx5IHRoZSBsaXN0ZW5lcnMgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCB3YW50IHRvIHJlbW92ZSBhbGwgbGlzdGVuZXJzIGZvci5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24gcmVtb3ZlQWxsTGlzdGVuZXJzKGV2ZW50KSB7XG4gIGlmICghdGhpcy5fZXZlbnRzKSByZXR1cm4gdGhpcztcblxuICBpZiAoZXZlbnQpIHRoaXMuX2V2ZW50c1tldmVudF0gPSBudWxsO1xuICBlbHNlIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy9cbi8vIEFsaWFzIG1ldGhvZHMgbmFtZXMgYmVjYXVzZSBwZW9wbGUgcm9sbCBsaWtlIHRoYXQuXG4vL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vZmYgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUub247XG5cbi8vXG4vLyBUaGlzIGZ1bmN0aW9uIGRvZXNuJ3QgYXBwbHkgYW55bW9yZS5cbi8vXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uIHNldE1heExpc3RlbmVycygpIHtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vL1xuLy8gRXhwb3NlIHRoZSBtb2R1bGUuXG4vL1xuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIyID0gRXZlbnRFbWl0dGVyO1xuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlcjMgPSBFdmVudEVtaXR0ZXI7XG5cbmlmICgnb2JqZWN0JyA9PT0gdHlwZW9mIG1vZHVsZSAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvZm9ybWF0aWMnKTtcbiJdfQ==
