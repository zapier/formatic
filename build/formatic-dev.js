!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Formatic=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

var CSSTransitionGroup = React.createFactory(React.addons.CSSTransitionGroup);

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
        CSSTransitionGroup({transitionName: 'reveal'},
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

var CSSTransitionGroup = React.createFactory(React.addons.CSSTransitionGroup);

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
          CSSTransitionGroup({transitionName: 'reveal'},
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
// Why this works, I'm not sure.
var RIGHT_PAD = '  '; //'\u00a0\u00a0';

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
    adjustStyles: function (isMount) {
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
    },

    onInsert: function (event) {
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
    field.tempChildren = [];
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

    var childField = new Field(field.form, def, value, field);

    field.tempChildren.push(childField);

    return childField;

    // if (def.eval) {
    //   def = childField.evalDef(def);
    //   if (util.isBlank(def.key)) {
    //     value = def.value;
    //   }
    //   childField = new Field(field.form, def, value, field);
    // }
    //
    // return childField;
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
  proto.groupFields = function (groupName, ignoreTempChildren) {
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
        var parentGroupFields = field.parent.groupFields(groupName, true);
        field.groups[groupName] = field.groups[groupName].concat(parentGroupFields);
      }
    }

    if (!ignoreTempChildren && field.groups[groupName].length === 0) {
      // looking at children so far
      var childGroupFields = [];
      field.tempChildren.forEach(function (child) {
        if (child.def.group === groupName) {
          childGroupFields.push(child);
        }
      });
      return childGroupFields;
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
    form.once = storeEmitter.once.bind(storeEmitter);
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
(function (global){
// # component

// At its most basic level, the component plugin simply maps component names to
// plugin names, returning the component factory for that component. For
// example, `plugin.component('text')` becomes
// `plugin.require('component.text')`. This is a useful placholder in case we
// later want to make formatic able to decide components at runtime. For now,
// however, this allows us to inject "prop modifiers" which are plugins that
// modify a components properties before it receives them.

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

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
      var component = React.createFactory(plugin.require('component.' + name));
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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
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
      } else if (_.isObject(field.value) && key in field.value) {
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
    if (_.isObject(obj) && path[0] in obj) {
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
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

// # Formatic plugin core

// At its core, Formatic is just a plugin host. All of the functionality it has
// out of the box is via plugins. These plugins can be replaced or extended by
// other plugins.

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
var createFormaticCore = function (config) {

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
  //formatic.create = Formatic;

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
//var defaultCore = Formatic();

// Export it!
//module.exports = defaultFormatic;

var createFormaticComponentClass = function (config) {

  var core = createFormaticCore(config);

  return React.createClass({

    displayName: 'Formatic',

    statics: {
      config: createFormaticComponentClass,
      form: core,
      plugin: core.plugin
    },

    getInitialState: function () {
      var form = this.props.form || this.props.defaultForm;
      return {
        form: form,
        field: form.field(),
        controlled: this.props.form ? true : false
      };
    },

    componentDidMount: function() {
      var form = this.state.form;
      if (!form) {
        throw new Error('Must supply a form or defaultForm.');
      }
      if (this.state.controlled) {
        form.once('change', this.onFormChanged);
      } else {
        form.on('change', this.onFormChanged);
      }
    },

    onFormChanged: function () {
      if (this.props.onChange) {
        this.props.onChange(this.props.form.val());
      }
      if (!this.state.controlled) {
        this.setState({
          field: this.state.form.field()
        });
      }
    },

    componentWillUnmount: function () {
      var form = this.state.form;
      if (form) {
        form.off('change', this.onFormChanged);
      }
    },

    componentWillReceiveProps: function (nextProps) {
      if (this.state.controlled) {
        if (!nextProps.form) {
          throw new Error('Must supply a new form for a controlled component.');
        }
        nextProps.form.once('change', this.onFormChanged);
        this.setState({
          form: nextProps.form,
          field: nextProps.form.field()
        });
      }
    },

    render: function () {
      return R.div({className: 'formatic'},
        this.state.field.component()
      );
    }
  });
};

module.exports = createFormaticComponentClass();

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvY29tcGlsZXJzL2Nob2ljZXMuanMiLCJsaWIvY29tcGlsZXJzL2xvb2t1cC5qcyIsImxpYi9jb21waWxlcnMvcHJvcC1hbGlhc2VzLmpzIiwibGliL2NvbXBpbGVycy90eXBlcy5qcyIsImxpYi9jb21wb25lbnRzL2FkZC1pdGVtLmpzIiwibGliL2NvbXBvbmVudHMvY2hlY2tib3gtbGlzdC5qcyIsImxpYi9jb21wb25lbnRzL2ZpZWxkLmpzIiwibGliL2NvbXBvbmVudHMvZmllbGRzZXQuanMiLCJsaWIvY29tcG9uZW50cy9mb3JtYXRpYy5qcyIsImxpYi9jb21wb25lbnRzL2hlbHAuanMiLCJsaWIvY29tcG9uZW50cy9pdGVtLWNob2ljZXMuanMiLCJsaWIvY29tcG9uZW50cy9qc29uLmpzIiwibGliL2NvbXBvbmVudHMvbGFiZWwuanMiLCJsaWIvY29tcG9uZW50cy9saXN0LWNvbnRyb2wuanMiLCJsaWIvY29tcG9uZW50cy9saXN0LWl0ZW0tY29udHJvbC5qcyIsImxpYi9jb21wb25lbnRzL2xpc3QtaXRlbS12YWx1ZS5qcyIsImxpYi9jb21wb25lbnRzL2xpc3QtaXRlbS5qcyIsImxpYi9jb21wb25lbnRzL2xpc3QuanMiLCJsaWIvY29tcG9uZW50cy9tb3ZlLWl0ZW0tYmFjay5qcyIsImxpYi9jb21wb25lbnRzL21vdmUtaXRlbS1mb3J3YXJkLmpzIiwibGliL2NvbXBvbmVudHMvcHJldHR5LXRleHRhcmVhLmpzIiwibGliL2NvbXBvbmVudHMvcmVtb3ZlLWl0ZW0uanMiLCJsaWIvY29tcG9uZW50cy9yb290LmpzIiwibGliL2NvbXBvbmVudHMvc2FtcGxlLmpzIiwibGliL2NvbXBvbmVudHMvc2VsZWN0LmpzIiwibGliL2NvbXBvbmVudHMvdGV4dC5qcyIsImxpYi9jb21wb25lbnRzL3RleHRhcmVhLmpzIiwibGliL2NvcmUvZmllbGQuanMiLCJsaWIvY29yZS9mb3JtLWluaXQuanMiLCJsaWIvY29yZS9mb3JtLmpzIiwibGliL2NvcmUvZm9ybWF0aWMuanMiLCJsaWIvZGVmYXVsdC9jb21waWxlci5qcyIsImxpYi9kZWZhdWx0L2NvbXBvbmVudC5qcyIsImxpYi9kZWZhdWx0L2NvcmUuanMiLCJsaWIvZGVmYXVsdC9ldmFsLWZ1bmN0aW9ucy5qcyIsImxpYi9kZWZhdWx0L2V2YWwuanMiLCJsaWIvZGVmYXVsdC9maWVsZC1yb3V0ZXIuanMiLCJsaWIvZGVmYXVsdC9maWVsZC1yb3V0ZXMuanMiLCJsaWIvZGVmYXVsdC9sb2FkZXIuanMiLCJsaWIvZGVmYXVsdC91dGlsLmpzIiwibGliL2Zvcm1hdGljLmpzIiwibGliL21peGlucy9jbGljay1vdXRzaWRlLmpzIiwibGliL21peGlucy9maWVsZC5qcyIsImxpYi9taXhpbnMvaW5wdXQtYWN0aW9ucy5qcyIsImxpYi9taXhpbnMvcmVzaXplLmpzIiwibGliL21peGlucy91bmRvLXN0YWNrLmpzIiwibGliL3BsdWdpbnMvYm9vdHN0cmFwLXN0eWxlLmpzIiwibGliL3BsdWdpbnMvZGVmYXVsdC1zdHlsZS5qcyIsImxpYi9zdG9yZS9tZW1vcnkuanMiLCJsaWIvdHlwZXMvYXJyYXkuanMiLCJsaWIvdHlwZXMvYm9vbGVhbi5qcyIsImxpYi90eXBlcy9qc29uLmpzIiwibGliL3R5cGVzL251bWJlci5qcyIsImxpYi90eXBlcy9vYmplY3QuanMiLCJsaWIvdHlwZXMvcm9vdC5qcyIsImxpYi90eXBlcy9zdHJpbmcuanMiLCJub2RlX21vZHVsZXMvZXZlbnRlbWl0dGVyMy9pbmRleC5qcyIsImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzloQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbFRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVNQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcGlsZXIuY2hvaWNlc1xuXG4vKlxuTm9ybWFsaXplcyB0aGUgY2hvaWNlcyBmb3IgYSBmaWVsZC4gU3VwcG9ydHMgdGhlIGZvbGxvd2luZyBmb3JtYXRzLlxuXG5gYGBqc1xuJ3JlZCwgYmx1ZSdcblxuWydyZWQnLCAnYmx1ZSddXG5cbntyZWQ6ICdSZWQnLCBibHVlOiAnQmx1ZSd9XG5cblt7dmFsdWU6ICdyZWQnLCBsYWJlbDogJ1JlZCd9LCB7dmFsdWU6ICdibHVlJywgbGFiZWw6ICdCbHVlJ31dXG5gYGBcblxuQWxsIG9mIHRob3NlIGZvcm1hdHMgYXJlIG5vcm1hbGl6ZWQgdG86XG5cbmBgYGpzXG5be3ZhbHVlOiAncmVkJywgbGFiZWw6ICdSZWQnfSwge3ZhbHVlOiAnYmx1ZScsIGxhYmVsOiAnQmx1ZSd9XVxuYGBgXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICB2YXIgdXRpbCA9IHBsdWdpbi5yZXF1aXJlKCd1dGlsJyk7XG5cbiAgdmFyIGNvbXBpbGVDaG9pY2VzID0gZnVuY3Rpb24gKGNob2ljZXMpIHtcblxuICAgIC8vIENvbnZlcnQgY29tbWEgc2VwYXJhdGVkIHN0cmluZyB0byBhcnJheSBvZiBzdHJpbmdzLlxuICAgIGlmIChfLmlzU3RyaW5nKGNob2ljZXMpKSB7XG4gICAgICBjaG9pY2VzID0gY2hvaWNlcy5zcGxpdCgnLCcpO1xuICAgIH1cblxuICAgIC8vIENvbnZlcnQgb2JqZWN0IHRvIGFycmF5IG9mIG9iamVjdHMgd2l0aCBgdmFsdWVgIGFuZCBgbGFiZWxgIHByb3BlcnRpZXMuXG4gICAgaWYgKCFfLmlzQXJyYXkoY2hvaWNlcykgJiYgXy5pc09iamVjdChjaG9pY2VzKSkge1xuICAgICAgY2hvaWNlcyA9IE9iamVjdC5rZXlzKGNob2ljZXMpLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdmFsdWU6IGtleSxcbiAgICAgICAgICBsYWJlbDogY2hvaWNlc1trZXldXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBDb3B5IHRoZSBhcnJheSBvZiBjaG9pY2VzIHNvIHdlIGNhbiBtYW5pcHVsYXRlIHRoZW0uXG4gICAgY2hvaWNlcyA9IGNob2ljZXMuc2xpY2UoMCk7XG5cbiAgICAvLyBBcnJheSBvZiBjaG9pY2UgYXJyYXlzIHNob3VsZCBiZSBmbGF0dGVuZWQuXG4gICAgY2hvaWNlcyA9IF8uZmxhdHRlbihjaG9pY2VzKTtcblxuICAgIGNob2ljZXMuZm9yRWFjaChmdW5jdGlvbiAoY2hvaWNlLCBpKSB7XG4gICAgICAvLyBDb252ZXJ0IGFueSBzdHJpbmcgY2hvaWNlcyB0byBvYmplY3RzIHdpdGggYHZhbHVlYCBhbmQgYGxhYmVsYFxuICAgICAgLy8gcHJvcGVydGllcy5cbiAgICAgIGlmIChfLmlzU3RyaW5nKGNob2ljZSkpIHtcbiAgICAgICAgY2hvaWNlc1tpXSA9IHtcbiAgICAgICAgICB2YWx1ZTogY2hvaWNlLFxuICAgICAgICAgIGxhYmVsOiB1dGlsLmh1bWFuaXplKGNob2ljZSlcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmICghY2hvaWNlc1tpXS5sYWJlbCkge1xuICAgICAgICBjaG9pY2VzW2ldLmxhYmVsID0gdXRpbC5odW1hbml6ZShjaG9pY2VzW2ldLnZhbHVlKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBjaG9pY2VzO1xuICB9O1xuXG4gIHBsdWdpbi5leHBvcnRzLmNvbXBpbGUgPSBmdW5jdGlvbiAoZGVmKSB7XG4gICAgaWYgKGRlZi5jaG9pY2VzID09PSAnJykge1xuICAgICAgZGVmLmNob2ljZXMgPSBbXTtcbiAgICB9IGVsc2UgaWYgKGRlZi5jaG9pY2VzKSB7XG5cbiAgICAgIGRlZi5jaG9pY2VzID0gY29tcGlsZUNob2ljZXMoZGVmLmNob2ljZXMpO1xuICAgIH1cblxuICAgIGlmIChkZWYucmVwbGFjZUNob2ljZXMgPT09ICcnKSB7XG4gICAgICBkZWYucmVwbGFjZUNob2ljZXMgPSBbXTtcbiAgICB9IGVsc2UgaWYgKGRlZi5yZXBsYWNlQ2hvaWNlcykge1xuXG4gICAgICBkZWYucmVwbGFjZUNob2ljZXMgPSBjb21waWxlQ2hvaWNlcyhkZWYucmVwbGFjZUNob2ljZXMpO1xuXG4gICAgICBkZWYucmVwbGFjZUNob2ljZXNMYWJlbHMgPSB7fTtcblxuICAgICAgZGVmLnJlcGxhY2VDaG9pY2VzLmZvckVhY2goZnVuY3Rpb24gKGNob2ljZSkge1xuICAgICAgICBkZWYucmVwbGFjZUNob2ljZXNMYWJlbHNbY2hvaWNlLnZhbHVlXSA9IGNob2ljZS5sYWJlbDtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIi8vICMgY29tcGlsZXIubG9va3VwXG5cbi8qXG5Db252ZXJ0IGEgbG9va3VwIGRlY2xhcmF0aW9uIHRvIGFuIGV2YWx1YXRpb24uIEEgbG9va3VwIHByb3BlcnR5IGlzIHVzZWQgbGlrZTpcblxuYGBganNcbntcbiAgdHlwZTogJ3N0cmluZycsXG4gIGtleTogJ3N0YXRlcycsXG4gIGxvb2t1cDoge3NvdXJjZTogJ2xvY2F0aW9ucycsIGtleXM6IFsnY291bnRyeSddfVxufVxuYGBgXG5cbkxvZ2ljYWxseSwgdGhlIGFib3ZlIHdpbGwgdXNlIHRoZSBgY291bnRyeWAga2V5IG9mIHRoZSB2YWx1ZSB0byBhc2sgdGhlXG5gbG9jYXRpb25zYCBzb3VyY2UgZm9yIHN0YXRlcyBjaG9pY2VzLiBUaGlzIHdvcmtzIGJ5IGNvbnZlcnRpbmcgdGhlIGxvb2t1cCB0b1xudGhlIGZvbGxvd2luZyBldmFsdWF0aW9uLlxuXG5gYGBqc1xue1xuICB0eXBlOiAnc3RyaW5nJyxcbiAga2V5OiAnc3RhdGVzJyxcbiAgY2hvaWNlczogW10sXG4gIGV2YWw6IHtcbiAgICBuZWVkc01ldGE6IFtcbiAgICAgIFsnQGlmJywgWydAZ2V0TWV0YScsICdsb2NhdGlvbnMnLCB7Y291bnRyeTogWydAZ2V0JywgJ2NvdW50cnknXX1dLCBudWxsLCBbJ2xvY2F0aW9ucycsIHtjb3VudHJ5OiBbJ0BnZXQnLCAnY291bnRyeSddfV1dXG4gICAgXSxcbiAgICBjaG9pY2VzOiBbJ0BnZXRNZXRhJywgJ2xvY2F0aW9ucycsIHtjb3VudHJ5OiBbJ0BnZXQnLCAnY291bnRyeSddfV1cbiAgfVxufVxuYGBgXG5cblRoZSBhYm92ZSBzYXlzIHRvIGFkZCBhIGBuZWVkc01ldGFgIHByb3BlcnR5IGlmIG5lY2Vzc2FyeSBhbmQgYWRkIGEgYGNob2ljZXNgXG5hcnJheSBpZiBpdCdzIGF2YWlsYWJsZS4gT3RoZXJ3aXNlLCBjaG9pY2VzIHdpbGwgZGVmYXVsdCB0byBhbiBlbXB0eSBhcnJheS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgdmFyIGFkZExvb2t1cCA9IGZ1bmN0aW9uIChkZWYsIGxvb2t1cFByb3BOYW1lLCBjaG9pY2VzUHJvcE5hbWUpIHtcbiAgICB2YXIgbG9va3VwID0gZGVmW2xvb2t1cFByb3BOYW1lXTtcblxuICAgIGlmIChsb29rdXApIHtcbiAgICAgIGlmICghZGVmW2Nob2ljZXNQcm9wTmFtZV0pIHtcbiAgICAgICAgZGVmW2Nob2ljZXNQcm9wTmFtZV0gPSBbXTtcbiAgICAgIH1cbiAgICAgIGlmICghZGVmLmV2YWwpIHtcbiAgICAgICAgZGVmLmV2YWwgPSB7fTtcbiAgICAgIH1cbiAgICAgIGlmICghZGVmLmV2YWwubmVlZHNNZXRhKSB7XG4gICAgICAgIGRlZi5ldmFsLm5lZWRzTWV0YSA9IFtdO1xuICAgICAgfVxuICAgICAgdmFyIGtleXMgPSBsb29rdXAua2V5cyB8fCBbXTtcbiAgICAgIHZhciBwYXJhbXMgPSB7fTtcbiAgICAgIHZhciBtZXRhQXJncywgbWV0YUdldDtcblxuICAgICAgaWYgKGxvb2t1cC5ncm91cCkge1xuXG4gICAgICAgIGtleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgcGFyYW1zW2tleV0gPSBbJ0BnZXQnLCAnaXRlbScsIGtleV07XG4gICAgICAgIH0pO1xuICAgICAgICBtZXRhQXJncyA9IFtsb29rdXAuc291cmNlXS5jb25jYXQocGFyYW1zKTtcbiAgICAgICAgbWV0YUdldCA9IFsnQGdldE1ldGEnXS5jb25jYXQobWV0YUFyZ3MpO1xuICAgICAgICB2YXIgbWV0YUZvckVhY2ggPSBbJ0Bmb3JFYWNoJywgJ2l0ZW0nLCBbJ0BnZXRHcm91cFZhbHVlcycsIGxvb2t1cC5ncm91cF1dO1xuICAgICAgICBkZWYuZXZhbC5uZWVkc01ldGEucHVzaChtZXRhRm9yRWFjaC5jb25jYXQoW1xuICAgICAgICAgIG1ldGFBcmdzLFxuICAgICAgICAgIFsnQG5vdCcsIG1ldGFHZXRdXG4gICAgICAgIF0pKTtcbiAgICAgICAgZGVmLmV2YWxbY2hvaWNlc1Byb3BOYW1lXSA9IG1ldGFGb3JFYWNoLmNvbmNhdChbXG4gICAgICAgICAgbWV0YUdldCxcbiAgICAgICAgICBtZXRhR2V0XG4gICAgICAgIF0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICBwYXJhbXNba2V5XSA9IFsnQGdldCcsIGtleV07XG4gICAgICAgIH0pO1xuICAgICAgICBtZXRhQXJncyA9IFtsb29rdXAuc291cmNlXS5jb25jYXQocGFyYW1zKTtcbiAgICAgICAgbWV0YUdldCA9IFsnQGdldE1ldGEnXS5jb25jYXQobWV0YUFyZ3MpO1xuICAgICAgICBkZWYuZXZhbC5uZWVkc01ldGEucHVzaChbJ0BpZicsIG1ldGFHZXQsIG51bGwsIG1ldGFBcmdzXSk7XG4gICAgICAgIGRlZi5ldmFsW2Nob2ljZXNQcm9wTmFtZV0gPSBtZXRhR2V0O1xuICAgICAgfVxuXG4gICAgICBkZWxldGUgZGVmW2xvb2t1cFByb3BOYW1lXTtcbiAgICB9XG4gIH07XG5cbiAgcGx1Z2luLmV4cG9ydHMuY29tcGlsZSA9IGZ1bmN0aW9uIChkZWYpIHtcblxuICAgIGFkZExvb2t1cChkZWYsICdsb29rdXAnLCAnY2hvaWNlcycpO1xuICAgIGFkZExvb2t1cChkZWYsICdsb29rdXBSZXBsYWNlbWVudHMnLCAncmVwbGFjZUNob2ljZXMnKTtcbiAgfTtcbn07XG4iLCIvLyAjIGNvbXBpbGVycy5wcm9wLWFsaWFzZXNcblxuLypcbkFsaWFzIHNvbWUgcHJvcGVydGllcyB0byBvdGhlciBwcm9wZXJ0aWVzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICB2YXIgcHJvcEFsaWFzZXMgPSB7XG4gICAgaGVscF90ZXh0OiAnaGVscFRleHQnXG4gIH07XG5cbiAgcGx1Z2luLmV4cG9ydHMuY29tcGlsZSA9IGZ1bmN0aW9uIChkZWYpIHtcbiAgICBPYmplY3Qua2V5cyhwcm9wQWxpYXNlcykuZm9yRWFjaChmdW5jdGlvbiAoYWxpYXMpIHtcbiAgICAgIHZhciBwcm9wTmFtZSA9IHByb3BBbGlhc2VzW2FsaWFzXTtcbiAgICAgIGlmICh0eXBlb2YgZGVmW3Byb3BOYW1lXSA9PT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGRlZlthbGlhc10gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGRlZltwcm9wTmFtZV0gPSBkZWZbYWxpYXNdO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xufTtcbiIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcGlsZXJzLnR5cGVzXG5cbi8qXG5Db252ZXJ0IHNvbWUgaGlnaC1sZXZlbCB0eXBlcyB0byBsb3ctbGV2ZWwgdHlwZXMgYW5kIHByb3BlcnRpZXMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICAvLyBNYXAgaGlnaC1sZXZlbCB0eXBlIHRvIGxvdy1sZXZlbCB0eXBlLiBJZiBhIGZ1bmN0aW9uIGlzIHN1cHBsaWVkLCBjYW5cbiAgLy8gbW9kaWZ5IHRoZSBmaWVsZCBkZWZpbml0aW9uLlxuICB2YXIgdHlwZUNvZXJjZSA9IHtcbiAgICB1bmljb2RlOiBmdW5jdGlvbiAoZGVmKSB7XG4gICAgICBkZWYudHlwZSA9ICdzdHJpbmcnO1xuICAgICAgZGVmLm1heFJvd3MgPSAxO1xuICAgIH0sXG4gICAgdGV4dDogJ3N0cmluZycsXG4gICAgc2VsZWN0OiBmdW5jdGlvbiAoZGVmKSB7XG4gICAgICBkZWYuY2hvaWNlcyA9IGRlZi5jaG9pY2VzIHx8IFtdO1xuICAgIH0sXG4gICAgYm9vbDogJ2Jvb2xlYW4nLFxuICAgIGRpY3Q6ICdvYmplY3QnLFxuICAgIGRlY2ltYWw6ICdudW1iZXInXG4gIH07XG5cbiAgdHlwZUNvZXJjZS5zdHIgPSB0eXBlQ29lcmNlLnVuaWNvZGU7XG5cblxuICBwbHVnaW4uZXhwb3J0cy5jb21waWxlID0gZnVuY3Rpb24gKGRlZikge1xuXG4gICAgdmFyIGNvZXJjZVR5cGUgPSB0eXBlQ29lcmNlW2RlZi50eXBlXTtcbiAgICBpZiAoY29lcmNlVHlwZSkge1xuICAgICAgaWYgKF8uaXNTdHJpbmcoY29lcmNlVHlwZSkpIHtcbiAgICAgICAgZGVmLnR5cGUgPSBjb2VyY2VUeXBlO1xuICAgICAgfSBlbHNlIGlmIChfLmlzRnVuY3Rpb24oY29lcmNlVHlwZSkpIHtcbiAgICAgICAgZGVmID0gY29lcmNlVHlwZShkZWYpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50LmFkZC1pdGVtXG5cbi8qXG5UaGUgYWRkIGJ1dHRvbiB0byBhcHBlbmQgYW4gaXRlbSB0byBhIGZpZWxkLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGRpc3BsYXlOYW1lOiBwbHVnaW4ubmFtZSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZSxcbiAgICAgICAgbGFiZWw6IHBsdWdpbi5jb25maWdWYWx1ZSgnbGFiZWwnLCAnW2FkZF0nKVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gUi5zcGFuKHtjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lLCBvbkNsaWNrOiB0aGlzLnByb3BzLm9uQ2xpY2t9LCB0aGlzLnByb3BzLmxhYmVsKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQuY2hlY2tib3gtbGlzdFxuXG4vKlxuVXNlZCB3aXRoIGFycmF5IHZhbHVlcyB0byBzdXBwbHkgbXVsdGlwbGUgY2hlY2tib3hlcyBmb3IgYWRkaW5nIG11bHRpcGxlXG5lbnVtZXJhdGVkIHZhbHVlcyB0byBhbiBhcnJheS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGRpc3BsYXlOYW1lOiBwbHVnaW4ubmFtZSxcblxuICAgIG1peGluczogW3BsdWdpbi5yZXF1aXJlKCdtaXhpbi5maWVsZCcpXSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgb25DaGFuZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vIEdldCBhbGwgdGhlIGNoZWNrZWQgY2hlY2tib3hlcyBhbmQgY29udmVydCB0byBhbiBhcnJheSBvZiB2YWx1ZXMuXG4gICAgICB2YXIgY2hvaWNlTm9kZXMgPSB0aGlzLnJlZnMuY2hvaWNlcy5nZXRET01Ob2RlKCkuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2lucHV0Jyk7XG4gICAgICBjaG9pY2VOb2RlcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGNob2ljZU5vZGVzLCAwKTtcbiAgICAgIHZhciB2YWx1ZXMgPSBjaG9pY2VOb2Rlcy5tYXAoZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgcmV0dXJuIG5vZGUuY2hlY2tlZCA/IG5vZGUudmFsdWUgOiBudWxsO1xuICAgICAgfSkuZmlsdGVyKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9KTtcbiAgICAgIHRoaXMucHJvcHMuZmllbGQudmFsKHZhbHVlcyk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgICB2YXIgY2hvaWNlcyA9IGZpZWxkLmRlZi5jaG9pY2VzIHx8IFtdO1xuXG4gICAgICB2YXIgaXNJbmxpbmUgPSAhXy5maW5kKGNob2ljZXMsIGZ1bmN0aW9uIChjaG9pY2UpIHtcbiAgICAgICAgcmV0dXJuIGNob2ljZS5zYW1wbGU7XG4gICAgICB9KTtcblxuICAgICAgdmFyIHZhbHVlID0gZmllbGQudmFsdWUgfHwgW107XG5cbiAgICAgIHJldHVybiBwbHVnaW4uY29tcG9uZW50KCdmaWVsZCcpKHtcbiAgICAgICAgZmllbGQ6IGZpZWxkXG4gICAgICB9LFxuICAgICAgICBSLmRpdih7Y2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZSwgcmVmOiAnY2hvaWNlcyd9LFxuICAgICAgICAgIGNob2ljZXMubWFwKGZ1bmN0aW9uIChjaG9pY2UsIGkpIHtcblxuICAgICAgICAgICAgdmFyIGlucHV0RmllbGQgPSBSLnNwYW4oe3N0eWxlOiB7d2hpdGVTcGFjZTogJ25vd3JhcCd9fSxcbiAgICAgICAgICAgICAgUi5pbnB1dCh7XG4gICAgICAgICAgICAgICAgbmFtZTogZmllbGQuZGVmLmtleSxcbiAgICAgICAgICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBjaG9pY2UudmFsdWUsXG4gICAgICAgICAgICAgICAgY2hlY2tlZDogdmFsdWUuaW5kZXhPZihjaG9pY2UudmFsdWUpID49IDAgPyB0cnVlIDogZmFsc2UsXG4gICAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2VcbiAgICAgICAgICAgICAgICAvL29uRm9jdXM6IHRoaXMucHJvcHMuYWN0aW9ucy5mb2N1c1xuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgJyAnLFxuICAgICAgICAgICAgICBSLnNwYW4oe2NsYXNzTmFtZTogJ2ZpZWxkLWNob2ljZS1sYWJlbCd9LFxuICAgICAgICAgICAgICAgIGNob2ljZS5sYWJlbFxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBpZiAoaXNJbmxpbmUpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFIuc3Bhbih7a2V5OiBpLCBjbGFzc05hbWU6ICdmaWVsZC1jaG9pY2UnfSxcbiAgICAgICAgICAgICAgICBpbnB1dEZpZWxkLCAnICdcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiBSLmRpdih7a2V5OiBpLCBjbGFzc05hbWU6ICdmaWVsZC1jaG9pY2UnfSxcbiAgICAgICAgICAgICAgICBpbnB1dEZpZWxkLCAnICcsXG4gICAgICAgICAgICAgICAgcGx1Z2luLmNvbXBvbmVudCgnc2FtcGxlJykoe2ZpZWxkOiBmaWVsZCwgY2hvaWNlOiBjaG9pY2V9KVxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQuZmllbGRcblxuLypcblVzZWQgYnkgYW55IGZpZWxkcyB0byBwdXQgdGhlIGxhYmVsIGFuZCBoZWxwIHRleHQgYXJvdW5kIHRoZSBmaWVsZC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG52YXIgQ1NTVHJhbnNpdGlvbkdyb3VwID0gUmVhY3QuY3JlYXRlRmFjdG9yeShSZWFjdC5hZGRvbnMuQ1NTVHJhbnNpdGlvbkdyb3VwKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY29sbGFwc2VkOiB0aGlzLnByb3BzLmZpZWxkLmRlZi5jb2xsYXBzZWQgPyB0cnVlIDogZmFsc2VcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGlzQ29sbGFwc2libGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICAgIHJldHVybiAhXy5pc1VuZGVmaW5lZChmaWVsZC5kZWYuY29sbGFwc2VkKSB8fCAhXy5pc1VuZGVmaW5lZChmaWVsZC5kZWYuY29sbGFwc2libGUpO1xuICAgIH0sXG5cbiAgICBvbkNsaWNrTGFiZWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBjb2xsYXBzZWQ6ICF0aGlzLnN0YXRlLmNvbGxhcHNlZFxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgICB2YXIgaW5kZXggPSB0aGlzLnByb3BzLmluZGV4O1xuICAgICAgaWYgKCFfLmlzTnVtYmVyKGluZGV4KSkge1xuICAgICAgICBpbmRleCA9IF8uaXNOdW1iZXIoZmllbGQuZGVmLmtleSkgPyBmaWVsZC5kZWYua2V5IDogdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWUsIHN0eWxlOiB7ZGlzcGxheTogKGZpZWxkLmhpZGRlbigpID8gJ25vbmUnIDogJycpfX0sXG4gICAgICAgIHBsdWdpbi5jb21wb25lbnQoJ2xhYmVsJykoe2ZpZWxkOiBmaWVsZCwgaW5kZXg6IGluZGV4LCBvbkNsaWNrOiB0aGlzLmlzQ29sbGFwc2libGUoKSA/IHRoaXMub25DbGlja0xhYmVsIDogbnVsbH0pLFxuICAgICAgICBDU1NUcmFuc2l0aW9uR3JvdXAoe3RyYW5zaXRpb25OYW1lOiAncmV2ZWFsJ30sXG4gICAgICAgICAgdGhpcy5zdGF0ZS5jb2xsYXBzZWQgPyBbXSA6IFtcbiAgICAgICAgICAgIHBsdWdpbi5jb21wb25lbnQoJ2hlbHAnKSh7a2V5OiAnaGVscCcsIGZpZWxkOiBmaWVsZH0pLFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5jaGlsZHJlblxuICAgICAgICAgIF1cbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQuZmllbGRzZXRcblxuLypcblJlbmRlciBtdWx0aXBsZSBjaGlsZCBmaWVsZHMgZm9yIGEgZmllbGQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZGlzcGxheU5hbWU6IHBsdWdpbi5uYW1lLFxuXG4gICAgbWl4aW5zOiBbcGx1Z2luLnJlcXVpcmUoJ21peGluLmZpZWxkJyldLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICAgIHJldHVybiBwbHVnaW4uY29tcG9uZW50KCdmaWVsZCcpKHtcbiAgICAgICAgZmllbGQ6IGZpZWxkXG4gICAgICB9LFxuICAgICAgICBSLmZpZWxkc2V0KHtjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lfSxcbiAgICAgICAgICBmaWVsZC5maWVsZHMoKS5tYXAoZnVuY3Rpb24gKGZpZWxkLCBpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmllbGQuY29tcG9uZW50KHtrZXk6IGZpZWxkLmRlZi5rZXkgfHwgaX0pO1xuICAgICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQuZm9ybWF0aWNcblxuLypcblRvcC1sZXZlbCBjb21wb25lbnQgd2hpY2ggZ2V0cyBhIGZvcm0gYW5kIHRoZW4gbGlzdGVucyB0byB0aGUgZm9ybSBmb3IgY2hhbmdlcy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGZpZWxkOiB0aGlzLnByb3BzLmZvcm0uZmllbGQoKVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGZvcm0gPSB0aGlzLnByb3BzLmZvcm07XG4gICAgICBmb3JtLm9uKCdjaGFuZ2UnLCB0aGlzLm9uRm9ybUNoYW5nZWQpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGZvcm0gPSB0aGlzLnByb3BzLmZvcm07XG4gICAgICBmb3JtLm9mZignY2hhbmdlJywgdGhpcy5vbkZvcm1DaGFuZ2VkKTtcbiAgICB9LFxuXG4gICAgb25Gb3JtQ2hhbmdlZDogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMucHJvcHMub25DaGFuZ2UpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZSh0aGlzLnByb3BzLmZvcm0udmFsKCkpO1xuICAgICAgfVxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGZpZWxkOiB0aGlzLnByb3BzLmZvcm0uZmllbGQoKVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6ICdmb3JtYXRpYyd9LFxuICAgICAgICB0aGlzLnN0YXRlLmZpZWxkLmNvbXBvbmVudCgpXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC5oZWxwXG5cbi8qXG5KdXN0IHRoZSBoZWxwIHRleHQgYmxvY2suXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZGlzcGxheU5hbWU6IHBsdWdpbi5uYW1lLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgICAgcmV0dXJuIGZpZWxkLmRlZi5oZWxwVGV4dCA/XG4gICAgICAgIFIuZGl2KHtjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lfSxcbiAgICAgICAgICBmaWVsZC5kZWYuaGVscFRleHRcbiAgICAgICAgKSA6XG4gICAgICAgIFIuc3BhbihudWxsKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQuaXRlbS1jaG9pY2VzXG5cbi8qXG5HaXZlIGEgbGlzdCBvZiBjaG9pY2VzIG9mIGl0ZW0gdHlwZXMgdG8gY3JlYXRlIGFzIGNoaWxkcmVuIG9mIGFuIGZpZWxkLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGRpc3BsYXlOYW1lOiBwbHVnaW4ubmFtZSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgdGhpcy5wcm9wcy5vblNlbGVjdChwYXJzZUludChldmVudC50YXJnZXQudmFsdWUpKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICAgIHZhciB0eXBlQ2hvaWNlcyA9IG51bGw7XG4gICAgICBpZiAoZmllbGQuaXRlbXMoKS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHR5cGVDaG9pY2VzID0gUi5zZWxlY3Qoe2NsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWUsIHZhbHVlOiB0aGlzLnZhbHVlLCBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZX0sXG4gICAgICAgICAgZmllbGQuaXRlbXMoKS5tYXAoZnVuY3Rpb24gKGl0ZW0sIGkpIHtcbiAgICAgICAgICAgIHJldHVybiBSLm9wdGlvbih7a2V5OiBpLCB2YWx1ZTogaX0sIGl0ZW0ubGFiZWwgfHwgaSk7XG4gICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHR5cGVDaG9pY2VzID8gdHlwZUNob2ljZXMgOiBSLnNwYW4obnVsbCk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50Lmpzb25cblxuLypcblRleHRhcmVhIGVkaXRvciBmb3IgSlNPTi4gV2lsbCB2YWxpZGF0ZSB0aGUgSlNPTiBiZWZvcmUgc2V0dGluZyB0aGUgdmFsdWUsIHNvXG53aGlsZSB0aGUgdmFsdWUgaXMgaW52YWxpZCwgbm8gZXh0ZXJuYWwgc3RhdGUgY2hhbmdlcyB3aWxsIG9jY3VyLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGRpc3BsYXlOYW1lOiBwbHVnaW4ubmFtZSxcblxuICAgIG1peGluczogW3BsdWdpbi5yZXF1aXJlKCdtaXhpbi5maWVsZCcpXSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZSxcbiAgICAgICAgcm93czogcGx1Z2luLmNvbmZpZy5yb3dzIHx8IDVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGlzVmFsaWRWYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIEpTT04ucGFyc2UodmFsdWUpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGlzVmFsaWQ6IHRydWUsXG4gICAgICAgIHZhbHVlOiBKU09OLnN0cmluZ2lmeSh0aGlzLnByb3BzLmZpZWxkLnZhbHVlKVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgdmFyIGlzVmFsaWQgPSB0aGlzLmlzVmFsaWRWYWx1ZShldmVudC50YXJnZXQudmFsdWUpO1xuXG4gICAgICBpZiAoaXNWYWxpZCkge1xuICAgICAgICAvLyBOZWVkIHRvIGhhbmRsZSB0aGlzIGJldHRlci4gTmVlZCB0byB0cmFjayBwb3NpdGlvbi5cbiAgICAgICAgdGhpcy5faXNDaGFuZ2luZyA9IHRydWU7XG4gICAgICAgIHRoaXMucHJvcHMuZmllbGQudmFsKEpTT04ucGFyc2UoZXZlbnQudGFyZ2V0LnZhbHVlKSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBpc1ZhbGlkOiBpc1ZhbGlkLFxuICAgICAgICB2YWx1ZTogZXZlbnQudGFyZ2V0LnZhbHVlXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gKG5leHRQcm9wcykge1xuICAgICAgaWYgKCF0aGlzLl9pc0NoYW5naW5nKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIGlzVmFsaWQ6IHRydWUsXG4gICAgICAgICAgdmFsdWU6IEpTT04uc3RyaW5naWZ5KG5leHRQcm9wcy5maWVsZC52YWx1ZSwgbnVsbCwgMilcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICB0aGlzLl9pc0NoYW5naW5nID0gZmFsc2U7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgICByZXR1cm4gcGx1Z2luLmNvbXBvbmVudCgnZmllbGQnKSh7XG4gICAgICAgIGZpZWxkOiBmaWVsZFxuICAgICAgfSwgUi50ZXh0YXJlYSh7XG4gICAgICAgICAgY2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZSxcbiAgICAgICAgICB2YWx1ZTogdGhpcy5zdGF0ZS52YWx1ZSxcbiAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgICAgICBzdHlsZToge2JhY2tncm91bmRDb2xvcjogdGhpcy5zdGF0ZS5pc1ZhbGlkID8gJycgOiAncmdiKDI1NSwyMDAsMjAwKSd9LFxuICAgICAgICAgIHJvd3M6IGZpZWxkLmRlZi5yb3dzIHx8IHRoaXMucHJvcHMucm93c1xuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQubGFiZWxcblxuLypcbkp1c3QgdGhlIGxhYmVsIGZvciBhIGZpZWxkLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGRpc3BsYXlOYW1lOiBwbHVnaW4ubmFtZSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICAgIHZhciBsYWJlbCA9IG51bGw7XG4gICAgICBpZiAodHlwZW9mIHRoaXMucHJvcHMuaW5kZXggPT09ICdudW1iZXInKSB7XG4gICAgICAgIGxhYmVsID0gJycgKyAodGhpcy5wcm9wcy5pbmRleCArIDEpICsgJy4nO1xuICAgICAgICBpZiAoZmllbGQuZGVmLmxhYmVsKSB7XG4gICAgICAgICAgbGFiZWwgPSBsYWJlbCArICcgJyArIGZpZWxkLmRlZi5sYWJlbDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZmllbGQuZGVmLmxhYmVsIHx8IGxhYmVsKSB7XG4gICAgICAgIHZhciB0ZXh0ID0gbGFiZWwgfHwgZmllbGQuZGVmLmxhYmVsO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkNsaWNrKSB7XG4gICAgICAgICAgdGV4dCA9IFIuYSh7aHJlZjogJ0phdmFTY3JpcHQnICsgJzonLCBvbkNsaWNrOiB0aGlzLnByb3BzLm9uQ2xpY2t9LCB0ZXh0KTtcbiAgICAgICAgfVxuICAgICAgICBsYWJlbCA9IFIubGFiZWwoe30sIHRleHQpO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVxdWlyZWQgPSBSLnNwYW4oe2NsYXNzTmFtZTogJ3JlcXVpcmVkLXRleHQnfSk7XG5cbiAgICAgIHJldHVybiBSLmRpdih7XG4gICAgICAgIGNsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWVcbiAgICAgIH0sXG4gICAgICAgIGxhYmVsLFxuICAgICAgICAnICcsXG4gICAgICAgIHJlcXVpcmVkXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC5saXN0LWNvbnRyb2xcblxuLypcblJlbmRlciB0aGUgaXRlbSB0eXBlIGNob2ljZXMgYW5kIHRoZSBhZGQgYnV0dG9uLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGRpc3BsYXlOYW1lOiBwbHVnaW4ubmFtZSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpdGVtSW5kZXg6IDBcbiAgICAgIH07XG4gICAgfSxcblxuICAgIG9uU2VsZWN0OiBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBpdGVtSW5kZXg6IGluZGV4XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgb25BcHBlbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMucHJvcHMub25BcHBlbmQodGhpcy5zdGF0ZS5pdGVtSW5kZXgpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgICAgdmFyIHR5cGVDaG9pY2VzID0gbnVsbDtcblxuICAgICAgaWYgKGZpZWxkLml0ZW1zKCkubGVuZ3RoID4gMCkge1xuICAgICAgICB0eXBlQ2hvaWNlcyA9IHBsdWdpbi5jb21wb25lbnQoJ2l0ZW0tY2hvaWNlcycpKHtmaWVsZDogZmllbGQsIHZhbHVlOiB0aGlzLnN0YXRlLml0ZW1JbmRleCwgb25TZWxlY3Q6IHRoaXMub25TZWxlY3R9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lfSxcbiAgICAgICAgdHlwZUNob2ljZXMsICcgJyxcbiAgICAgICAgcGx1Z2luLmNvbXBvbmVudCgnYWRkLWl0ZW0nKSh7b25DbGljazogdGhpcy5vbkFwcGVuZH0pXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC5saXN0LWl0ZW0tY29udHJvbFxuXG4vKlxuUmVuZGVyIHRoZSByZW1vdmUgYW5kIG1vdmUgYnV0dG9ucyBmb3IgYSBmaWVsZC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIG9uTW92ZUJhY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMucHJvcHMub25Nb3ZlKHRoaXMucHJvcHMuaW5kZXgsIHRoaXMucHJvcHMuaW5kZXggLSAxKTtcbiAgICB9LFxuXG4gICAgb25Nb3ZlRm9yd2FyZDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5wcm9wcy5vbk1vdmUodGhpcy5wcm9wcy5pbmRleCwgdGhpcy5wcm9wcy5pbmRleCArIDEpO1xuICAgIH0sXG5cbiAgICBvblJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5wcm9wcy5vblJlbW92ZSh0aGlzLnByb3BzLmluZGV4KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWV9LFxuICAgICAgICBwbHVnaW4uY29tcG9uZW50KCdyZW1vdmUtaXRlbScpKHtmaWVsZDogZmllbGQsIG9uQ2xpY2s6IHRoaXMub25SZW1vdmV9KSxcbiAgICAgICAgdGhpcy5wcm9wcy5pbmRleCA+IDAgPyBwbHVnaW4uY29tcG9uZW50KCdtb3ZlLWl0ZW0tYmFjaycpKHtvbkNsaWNrOiB0aGlzLm9uTW92ZUJhY2t9KSA6IG51bGwsXG4gICAgICAgIHRoaXMucHJvcHMuaW5kZXggPCAodGhpcy5wcm9wcy5udW1JdGVtcyAtIDEpID8gcGx1Z2luLmNvbXBvbmVudCgnbW92ZS1pdGVtLWZvcndhcmQnKSh7b25DbGljazogdGhpcy5vbk1vdmVGb3J3YXJkfSkgOiBudWxsXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC5saXN0LWl0ZW0tdmFsdWVcblxuLypcblJlbmRlciB0aGUgdmFsdWUgb2YgYSBsaXN0IGl0ZW0uXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZGlzcGxheU5hbWU6IHBsdWdpbi5uYW1lLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZX0sXG4gICAgICAgIGZpZWxkLmNvbXBvbmVudCgpXG4gICAgICAgIC8vIHBsdWdpbi5jb21wb25lbnQoJ2ZpZWxkJykoe1xuICAgICAgICAvLyAgIGZpZWxkOiBmaWVsZCxcbiAgICAgICAgLy8gICBpbmRleDogdGhpcy5wcm9wcy5pbmRleFxuICAgICAgICAvLyB9LFxuICAgICAgICAvLyAgIGZpZWxkLmNvbXBvbmVudCgpXG4gICAgICAgIC8vIClcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50Lmxpc3QtaXRlbVxuXG4vKlxuUmVuZGVyIGEgbGlzdCBpdGVtLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGRpc3BsYXlOYW1lOiBwbHVnaW4ubmFtZSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWV9LFxuICAgICAgICBwbHVnaW4uY29tcG9uZW50KCdsaXN0LWl0ZW0tdmFsdWUnKSh7Zm9ybTogdGhpcy5wcm9wcy5mb3JtLCBmaWVsZDogZmllbGQsIGluZGV4OiB0aGlzLnByb3BzLmluZGV4fSksXG4gICAgICAgIHBsdWdpbi5jb21wb25lbnQoJ2xpc3QtaXRlbS1jb250cm9sJykoe2ZpZWxkOiBmaWVsZCwgaW5kZXg6IHRoaXMucHJvcHMuaW5kZXgsIG51bUl0ZW1zOiB0aGlzLnByb3BzLm51bUl0ZW1zLCBvbk1vdmU6IHRoaXMucHJvcHMub25Nb3ZlLCBvblJlbW92ZTogdGhpcy5wcm9wcy5vblJlbW92ZX0pXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC5saXN0XG5cbi8qXG5SZW5kZXIgYSBsaXN0LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xuXG52YXIgQ1NTVHJhbnNpdGlvbkdyb3VwID0gUmVhY3QuY3JlYXRlRmFjdG9yeShSZWFjdC5hZGRvbnMuQ1NTVHJhbnNpdGlvbkdyb3VwKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBtaXhpbnM6IFtwbHVnaW4ucmVxdWlyZSgnbWl4aW4uZmllbGQnKV0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIG5leHRMb29rdXBJZDogMCxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICAvLyBOZWVkIHRvIGNyZWF0ZSBhcnRpZmljaWFsIGtleXMgZm9yIHRoZSBhcnJheS4gSW5kZXhlcyBhcmUgbm90IGdvb2Qga2V5cyxcbiAgICAgIC8vIHNpbmNlIHRoZXkgY2hhbmdlLiBTbywgbWFwIGVhY2ggcG9zaXRpb24gdG8gYW4gYXJ0aWZpY2lhbCBrZXlcbiAgICAgIHZhciBsb29rdXBzID0gW107XG4gICAgICB0aGlzLnByb3BzLmZpZWxkLmZpZWxkcygpLmZvckVhY2goZnVuY3Rpb24gKGZpZWxkLCBpKSB7XG4gICAgICAgIGxvb2t1cHNbaV0gPSAnXycgKyB0aGlzLm5leHRMb29rdXBJZDtcbiAgICAgICAgdGhpcy5uZXh0TG9va3VwSWQrKztcbiAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxvb2t1cHM6IGxvb2t1cHNcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXdQcm9wcykge1xuXG4gICAgICB2YXIgbG9va3VwcyA9IHRoaXMuc3RhdGUubG9va3VwcztcbiAgICAgIHZhciBmaWVsZHMgPSBuZXdQcm9wcy5maWVsZC5maWVsZHMoKTtcblxuICAgICAgLy8gTmVlZCB0byBzZXQgYXJ0aWZpY2lhbCBrZXlzIGZvciBuZXcgYXJyYXkgaXRlbXMuXG4gICAgICBpZiAoZmllbGRzLmxlbmd0aCA+IGxvb2t1cHMubGVuZ3RoKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSBsb29rdXBzLmxlbmd0aDsgaSA8IGZpZWxkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGxvb2t1cHNbaV0gPSAnXycgKyB0aGlzLm5leHRMb29rdXBJZDtcbiAgICAgICAgICB0aGlzLm5leHRMb29rdXBJZCsrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBsb29rdXBzOiBsb29rdXBzXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgb25BcHBlbmQ6IGZ1bmN0aW9uIChpdGVtSW5kZXgpIHtcbiAgICAgIHRoaXMucHJvcHMuZmllbGQuYXBwZW5kKGl0ZW1JbmRleCk7XG4gICAgfSxcbiAgICAvL1xuICAgIC8vIG9uQ2xpY2tMYWJlbDogZnVuY3Rpb24gKGkpIHtcbiAgICAvLyAgIGlmICh0aGlzLnByb3BzLmZpZWxkLmNvbGxhcHNhYmxlSXRlbXMpIHtcbiAgICAvLyAgICAgdmFyIGNvbGxhcHNlZDtcbiAgICAvLyAgICAgLy8gaWYgKCF0aGlzLnN0YXRlLmNvbGxhcHNlZFtpXSkge1xuICAgIC8vICAgICAvLyAgIGNvbGxhcHNlZCA9IHRoaXMuc3RhdGUuY29sbGFwc2VkO1xuICAgIC8vICAgICAvLyAgIGNvbGxhcHNlZFtpXSA9IHRydWU7XG4gICAgLy8gICAgIC8vICAgdGhpcy5zZXRTdGF0ZSh7Y29sbGFwc2VkOiBjb2xsYXBzZWR9KTtcbiAgICAvLyAgICAgLy8gfSBlbHNlIHtcbiAgICAvLyAgICAgLy8gICBjb2xsYXBzZWQgPSB0aGlzLnByb3BzLmZpZWxkLmZpZWxkcy5tYXAoZnVuY3Rpb24gKCkge1xuICAgIC8vICAgICAvLyAgICAgcmV0dXJuIHRydWU7XG4gICAgLy8gICAgIC8vICAgfSk7XG4gICAgLy8gICAgIC8vICAgY29sbGFwc2VkW2ldID0gZmFsc2U7XG4gICAgLy8gICAgIC8vICAgdGhpcy5zZXRTdGF0ZSh7Y29sbGFwc2VkOiBjb2xsYXBzZWR9KTtcbiAgICAvLyAgICAgLy8gfVxuICAgIC8vICAgICBjb2xsYXBzZWQgPSB0aGlzLnN0YXRlLmNvbGxhcHNlZDtcbiAgICAvLyAgICAgY29sbGFwc2VkW2ldID0gIWNvbGxhcHNlZFtpXTtcbiAgICAvLyAgICAgdGhpcy5zZXRTdGF0ZSh7Y29sbGFwc2VkOiBjb2xsYXBzZWR9KTtcbiAgICAvLyAgIH1cbiAgICAvLyB9LFxuICAgIC8vXG4gICAgb25SZW1vdmU6IGZ1bmN0aW9uIChpKSB7XG4gICAgICB2YXIgbG9va3VwcyA9IHRoaXMuc3RhdGUubG9va3VwcztcbiAgICAgIGxvb2t1cHMuc3BsaWNlKGksIDEpO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGxvb2t1cHM6IGxvb2t1cHNcbiAgICAgIH0pO1xuICAgICAgdGhpcy5wcm9wcy5maWVsZC5yZW1vdmUoaSk7XG4gICAgfSxcbiAgICAvL1xuICAgIG9uTW92ZTogZnVuY3Rpb24gKGZyb21JbmRleCwgdG9JbmRleCkge1xuICAgICAgdmFyIGxvb2t1cHMgPSB0aGlzLnN0YXRlLmxvb2t1cHM7XG4gICAgICB2YXIgZnJvbUlkID0gbG9va3Vwc1tmcm9tSW5kZXhdO1xuICAgICAgdmFyIHRvSWQgPSBsb29rdXBzW3RvSW5kZXhdO1xuICAgICAgbG9va3Vwc1tmcm9tSW5kZXhdID0gdG9JZDtcbiAgICAgIGxvb2t1cHNbdG9JbmRleF0gPSBmcm9tSWQ7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgbG9va3VwczogbG9va3Vwc1xuICAgICAgfSk7XG4gICAgICB0aGlzLnByb3BzLmZpZWxkLm1vdmUoZnJvbUluZGV4LCB0b0luZGV4KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG4gICAgICB2YXIgZmllbGRzID0gZmllbGQuZmllbGRzKCk7XG5cbiAgICAgIHZhciBudW1JdGVtcyA9IGZpZWxkcy5sZW5ndGg7XG4gICAgICByZXR1cm4gcGx1Z2luLmNvbXBvbmVudCgnZmllbGQnKSh7XG4gICAgICAgIGZpZWxkOiBmaWVsZFxuICAgICAgfSxcbiAgICAgICAgUi5kaXYoe2NsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWV9LFxuICAgICAgICAgIENTU1RyYW5zaXRpb25Hcm91cCh7dHJhbnNpdGlvbk5hbWU6ICdyZXZlYWwnfSxcbiAgICAgICAgICAgIGZpZWxkcy5tYXAoZnVuY3Rpb24gKGNoaWxkLCBpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBwbHVnaW4uY29tcG9uZW50KCdsaXN0LWl0ZW0nKSh7XG4gICAgICAgICAgICAgICAga2V5OiB0aGlzLnN0YXRlLmxvb2t1cHNbaV0sXG4gICAgICAgICAgICAgICAgZm9ybTogdGhpcy5wcm9wcy5mb3JtLFxuICAgICAgICAgICAgICAgIGZpZWxkOiBjaGlsZCxcbiAgICAgICAgICAgICAgICBwYXJlbnQ6IGZpZWxkLFxuICAgICAgICAgICAgICAgIGluZGV4OiBpLFxuICAgICAgICAgICAgICAgIG51bUl0ZW1zOiBudW1JdGVtcyxcbiAgICAgICAgICAgICAgICBvbk1vdmU6IHRoaXMub25Nb3ZlLFxuICAgICAgICAgICAgICAgIG9uUmVtb3ZlOiB0aGlzLm9uUmVtb3ZlXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICAgICksXG4gICAgICAgICAgcGx1Z2luLmNvbXBvbmVudCgnbGlzdC1jb250cm9sJykoe2ZpZWxkOiBmaWVsZCwgb25BcHBlbmQ6IHRoaXMub25BcHBlbmR9KVxuICAgICAgICApXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC5tb3ZlLWl0ZW0tYmFja1xuXG4vKlxuQnV0dG9uIHRvIG1vdmUgYW4gaXRlbSBiYWNrd2FyZHMgaW4gbGlzdC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWUsXG4gICAgICAgIGxhYmVsOiBwbHVnaW4uY29uZmlnVmFsdWUoJ2xhYmVsJywgJ1t1cF0nKVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gUi5zcGFuKHtjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lLCBvbkNsaWNrOiB0aGlzLnByb3BzLm9uQ2xpY2t9LCB0aGlzLnByb3BzLmxhYmVsKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQubW92ZS1pdGVtLWZvcndhcmRcblxuLypcbkJ1dHRvbiB0byBtb3ZlIGFuIGl0ZW0gZm9yd2FyZCBpbiBhIGxpc3QuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZGlzcGxheU5hbWU6IHBsdWdpbi5uYW1lLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lLFxuICAgICAgICBsYWJlbDogcGx1Z2luLmNvbmZpZ1ZhbHVlKCdsYWJlbCcsICdbZG93bl0nKVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gUi5zcGFuKHtjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lLCBvbkNsaWNrOiB0aGlzLnByb3BzLm9uQ2xpY2t9LCB0aGlzLnByb3BzLmxhYmVsKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQucHJldHR5LXRleHRhcmVhXG5cbi8qXG5UZXh0YXJlYSB0aGF0IHdpbGwgZGlzcGxheSBoaWdobGlnaHRzIGJlaGluZCBcInRhZ3NcIi4gVGFncyBjdXJyZW50bHkgbWVhbiB0ZXh0XG50aGF0IGlzIGVuY2xvc2VkIGluIGJyYWNlcyBsaWtlIGB7e2Zvb319YC4gVGFncyBhcmUgcmVwbGFjZWQgd2l0aCBsYWJlbHMgaWZcbmF2YWlsYWJsZSBvciBodW1hbml6ZWQuXG5cblRoaXMgY29tcG9uZW50IGlzIHF1aXRlIGNvbXBsaWNhdGVkIGJlY2F1c2U6XG4tIFdlIGFyZSBkaXNwbGF5aW5nIHRleHQgaW4gdGhlIHRleHRhcmVhIGJ1dCBoYXZlIHRvIGtlZXAgdHJhY2sgb2YgdGhlIHJlYWxcbiAgdGV4dCB2YWx1ZSBpbiB0aGUgYmFja2dyb3VuZC4gV2UgY2FuJ3QgdXNlIGEgZGF0YSBhdHRyaWJ1dGUsIGJlY2F1c2UgaXQncyBhXG4gIHRleHRhcmVhLCBzbyB3ZSBjYW4ndCB1c2UgYW55IGVsZW1lbnRzIGF0IGFsbCFcbi0gQmVjYXVzZSBvZiB0aGUgaGlkZGVuIGRhdGEsIHdlIGFsc28gaGF2ZSB0byBkbyBzb21lIGludGVyY2VwdGlvbiBvZlxuICBjb3B5LCB3aGljaCBpcyBhIGxpdHRsZSB3ZWlyZC4gV2UgaW50ZXJjZXB0IGNvcHkgYW5kIGNvcHkgdGhlIHJlYWwgdGV4dFxuICB0byB0aGUgZW5kIG9mIHRoZSB0ZXh0YXJlYS4gVGhlbiB3ZSBlcmFzZSB0aGF0IHRleHQsIHdoaWNoIGxlYXZlcyB0aGUgY29waWVkXG4gIGRhdGEgaW4gdGhlIGJ1ZmZlci5cbi0gUmVhY3QgbG9zZXMgdGhlIGNhcmV0IHBvc2l0aW9uIHdoZW4geW91IHVwZGF0ZSB0aGUgdmFsdWUgdG8gc29tZXRoaW5nXG4gIGRpZmZlcmVudCB0aGFuIGJlZm9yZS4gU28gd2UgaGF2ZSB0byByZXRhaW4gdHJhY2tpbmcgaW5mb3JtYXRpb24gZm9yIHdoZW5cbiAgdGhhdCBoYXBwZW5zLlxuLSBCZWNhdXNlIHdlIG1vbmtleSB3aXRoIGNvcHksIHdlIGFsc28gaGF2ZSB0byBkbyBvdXIgb3duIHVuZG8vcmVkby4gT3RoZXJ3aXNlXG4gIHRoZSBkZWZhdWx0IHVuZG8gd2lsbCBoYXZlIHdlaXJkIHN0YXRlcyBpbiBpdC5cblxuU28gZ29vZCBsdWNrIVxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbnZhciBub0JyZWFrID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZS5yZXBsYWNlKC8gL2csICdcXHUwMGEwJyk7XG59O1xuXG52YXIgTEVGVF9QQUQgPSAnXFx1MDBhMFxcdTAwYTAnO1xuLy8gV2h5IHRoaXMgd29ya3MsIEknbSBub3Qgc3VyZS5cbnZhciBSSUdIVF9QQUQgPSAnICAnOyAvLydcXHUwMGEwXFx1MDBhMCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHZhciB1dGlsID0gcGx1Z2luLnJlcXVpcmUoJ3V0aWwnKTtcblxuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGRpc3BsYXlOYW1lOiBwbHVnaW4ubmFtZSxcblxuICAgIG1peGluczogW3BsdWdpbi5yZXF1aXJlKCdtaXhpbi5maWVsZCcpLCBwbHVnaW4ucmVxdWlyZSgnbWl4aW4udW5kby1zdGFjaycpLCBwbHVnaW4ucmVxdWlyZSgnbWl4aW4ucmVzaXplJyldLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHVuZG9EZXB0aDogMTAwXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vIE5vdCBxdWl0ZSBzdGF0ZSwgdGhpcyBpcyBmb3IgdHJhY2tpbmcgc2VsZWN0aW9uIGluZm8uXG4gICAgICB0aGlzLnRyYWNraW5nID0ge307XG5cbiAgICAgIHZhciBwYXJ0cyA9IHV0aWwucGFyc2VUZXh0V2l0aFRhZ3ModGhpcy5wcm9wcy5maWVsZC52YWx1ZSk7XG4gICAgICB2YXIgdG9rZW5zID0gdGhpcy50b2tlbnMocGFydHMpO1xuICAgICAgdmFyIGluZGV4TWFwID0gdGhpcy5pbmRleE1hcCh0b2tlbnMpO1xuXG4gICAgICB0aGlzLnRyYWNraW5nLnBvcyA9IGluZGV4TWFwLmxlbmd0aDtcbiAgICAgIHRoaXMudHJhY2tpbmcucmFuZ2UgPSAwO1xuICAgICAgdGhpcy50cmFja2luZy50b2tlbnMgPSB0b2tlbnM7XG4gICAgICB0aGlzLnRyYWNraW5nLmluZGV4TWFwID0gaW5kZXhNYXA7XG4gICAgfSxcblxuICAgIGdldFN0YXRlU25hcHNob3Q6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbHVlOiB0aGlzLnByb3BzLmZpZWxkLnZhbHVlLFxuICAgICAgICBwb3M6IHRoaXMudHJhY2tpbmcucG9zLFxuICAgICAgICByYW5nZTogdGhpcy50cmFja2luZy5yYW5nZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgc2V0U3RhdGVTbmFwc2hvdDogZnVuY3Rpb24gKHNuYXBzaG90KSB7XG4gICAgICB0aGlzLnRyYWNraW5nLnBvcyA9IHNuYXBzaG90LnBvcztcbiAgICAgIHRoaXMudHJhY2tpbmcucmFuZ2UgPSBzbmFwc2hvdC5yYW5nZTtcbiAgICAgIHRoaXMucHJvcHMuZmllbGQudmFsKHNuYXBzaG90LnZhbHVlKTtcbiAgICB9LFxuXG4gICAgLy8gVHVybiBpbnRvIGluZGl2aWR1YWwgY2hhcmFjdGVycyBhbmQgdGFnc1xuICAgIHRva2VuczogZnVuY3Rpb24gKHBhcnRzKSB7XG4gICAgICByZXR1cm4gW10uY29uY2F0LmFwcGx5KFtdLCBwYXJ0cy5tYXAoZnVuY3Rpb24gKHBhcnQpIHtcbiAgICAgICAgaWYgKHBhcnQudHlwZSA9PT0gJ3RhZycpIHtcbiAgICAgICAgICByZXR1cm4gcGFydDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gcGFydC52YWx1ZS5zcGxpdCgnJyk7XG4gICAgICAgIH1cbiAgICAgIH0pKTtcbiAgICB9LFxuXG4gICAgLy8gTWFwIGVhY2ggdGV4dGFyZWEgaW5kZXggYmFjayB0byBhIHRva2VuXG4gICAgaW5kZXhNYXA6IGZ1bmN0aW9uICh0b2tlbnMpIHtcbiAgICAgIHZhciBpbmRleE1hcCA9IFtdO1xuICAgICAgXy5lYWNoKHRva2VucywgZnVuY3Rpb24gKHRva2VuLCB0b2tlbkluZGV4KSB7XG4gICAgICAgIGlmICh0b2tlbi50eXBlID09PSAndGFnJykge1xuICAgICAgICAgIHZhciBsYWJlbCA9IExFRlRfUEFEICsgbm9CcmVhayh0aGlzLnByZXR0eUxhYmVsKHRva2VuLnZhbHVlKSkgKyBSSUdIVF9QQUQ7XG4gICAgICAgICAgdmFyIGxhYmVsQ2hhcnMgPSBsYWJlbC5zcGxpdCgnJyk7XG4gICAgICAgICAgXy5lYWNoKGxhYmVsQ2hhcnMsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGluZGV4TWFwLnB1c2godG9rZW5JbmRleCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaW5kZXhNYXAucHVzaCh0b2tlbkluZGV4KTtcbiAgICAgICAgfVxuICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgIHJldHVybiBpbmRleE1hcDtcbiAgICB9LFxuXG4gICAgLy8gTWFrZSBoaWdobGlnaHQgc2Nyb2xsIG1hdGNoIHRleHRhcmVhIHNjcm9sbFxuICAgIG9uU2Nyb2xsOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnJlZnMuaGlnaGxpZ2h0LmdldERPTU5vZGUoKS5zY3JvbGxUb3AgPSB0aGlzLnJlZnMuY29udGVudC5nZXRET01Ob2RlKCkuc2Nyb2xsVG9wO1xuICAgICAgdGhpcy5yZWZzLmhpZ2hsaWdodC5nZXRET01Ob2RlKCkuc2Nyb2xsTGVmdCA9IHRoaXMucmVmcy5jb250ZW50LmdldERPTU5vZGUoKS5zY3JvbGxMZWZ0O1xuICAgIH0sXG5cbiAgICAvLyBHaXZlbiBzb21lIHBvc3Rpb24sIHJldHVybiB0aGUgdG9rZW4gaW5kZXggKHBvc2l0aW9uIGNvdWxkIGJlIGluIHRoZSBtaWRkbGUgb2YgYSB0b2tlbilcbiAgICB0b2tlbkluZGV4OiBmdW5jdGlvbiAocG9zLCB0b2tlbnMsIGluZGV4TWFwKSB7XG4gICAgICBpZiAocG9zIDwgMCkge1xuICAgICAgICBwb3MgPSAwO1xuICAgICAgfSBlbHNlIGlmIChwb3MgPj0gaW5kZXhNYXAubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiB0b2tlbnMubGVuZ3RoO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGluZGV4TWFwW3Bvc107XG4gICAgfSxcblxuICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIC8vY29uc29sZS5sb2coJ2NoYW5nZTonLCBldmVudC50YXJnZXQudmFsdWUpO1xuXG4gICAgICB2YXIgbm9kZSA9IGV2ZW50LnRhcmdldDtcblxuICAgICAgLy8gVHJhY2tpbmcgaXMgaG9sZGluZyBwcmV2aW91cyBwb3NpdGlvbiBhbmQgcmFuZ2VcbiAgICAgIHZhciBwcmV2UG9zID0gdGhpcy50cmFja2luZy5wb3M7XG4gICAgICB2YXIgcHJldlJhbmdlID0gdGhpcy50cmFja2luZy5yYW5nZTtcblxuICAgICAgLy8gTmV3IHBvc2l0aW9uXG4gICAgICB2YXIgcG9zID0gbm9kZS5zZWxlY3Rpb25TdGFydDtcblxuICAgICAgLy8gR29pbmcgdG8gbXV0YXRlIHRoZSB0b2tlbnMuXG4gICAgICB2YXIgdG9rZW5zID0gdGhpcy50cmFja2luZy50b2tlbnM7XG5cbiAgICAgIC8vIFVzaW5nIHRoZSBwcmV2aW91cyBwb3NpdGlvbiBhbmQgcmFuZ2UsIGdldCB0aGUgcHJldmlvdXMgdG9rZW4gcG9zaXRpb25cbiAgICAgIC8vIGFuZCByYW5nZVxuICAgICAgdmFyIHByZXZUb2tlbkluZGV4ID0gdGhpcy50b2tlbkluZGV4KHByZXZQb3MsIHRva2VucywgdGhpcy50cmFja2luZy5pbmRleE1hcCk7XG4gICAgICB2YXIgcHJldlRva2VuRW5kSW5kZXggPSB0aGlzLnRva2VuSW5kZXgocHJldlBvcyArIHByZXZSYW5nZSwgdG9rZW5zLCB0aGlzLnRyYWNraW5nLmluZGV4TWFwKTtcbiAgICAgIHZhciBwcmV2VG9rZW5SYW5nZSA9IHByZXZUb2tlbkVuZEluZGV4IC0gcHJldlRva2VuSW5kZXg7XG5cbiAgICAgIC8vIFdpcGUgb3V0IGFueSB0b2tlbnMgaW4gdGhlIHNlbGVjdGVkIHJhbmdlIGJlY2F1c2UgdGhlIGNoYW5nZSB3b3VsZCBoYXZlXG4gICAgICAvLyBlcmFzZWQgdGhhdCBzZWxlY3Rpb24uXG4gICAgICBpZiAocHJldlRva2VuUmFuZ2UgPiAwKSB7XG4gICAgICAgIHRva2Vucy5zcGxpY2UocHJldlRva2VuSW5kZXgsIHByZXZUb2tlblJhbmdlKTtcbiAgICAgICAgdGhpcy50cmFja2luZy5pbmRleE1hcCA9IHRoaXMuaW5kZXhNYXAodG9rZW5zKTtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgY3Vyc29yIGhhcyBtb3ZlZCBmb3J3YXJkLCB0aGVuIHRleHQgd2FzIGFkZGVkLlxuICAgICAgaWYgKHBvcyA+IHByZXZQb3MpIHtcbiAgICAgICAgdmFyIGFkZGVkVGV4dCA9IG5vZGUudmFsdWUuc3Vic3RyaW5nKHByZXZQb3MsIHBvcyk7XG4gICAgICAgIC8vIEluc2VydCB0aGUgdGV4dCBpbnRvIHRoZSB0b2tlbnMuXG4gICAgICAgIHRva2Vucy5zcGxpY2UocHJldlRva2VuSW5kZXgsIDAsIGFkZGVkVGV4dCk7XG4gICAgICAvLyBJZiBjdXJzb3IgaGFzIG1vdmVkIGJhY2t3YXJkLCB0aGVuIHdlIGRlbGV0ZWQgKGJhY2tzcGFjZWQpIHRleHRcbiAgICAgIH0gaWYgKHBvcyA8IHByZXZQb3MpIHtcbiAgICAgICAgdmFyIHRva2VuID0gdGhpcy50b2tlbkF0KHBvcyk7XG4gICAgICAgIHZhciB0b2tlbkJlZm9yZSA9IHRoaXMudG9rZW5CZWZvcmUocG9zKTtcbiAgICAgICAgLy8gSWYgd2UgbW92ZWQgYmFjayBvbnRvIGEgdG9rZW4sIHRoZW4gd2Ugc2hvdWxkIG1vdmUgYmFjayB0byBiZWdpbm5pbmdcbiAgICAgICAgLy8gb2YgdG9rZW4uXG4gICAgICAgIGlmICh0b2tlbiA9PT0gdG9rZW5CZWZvcmUpIHtcbiAgICAgICAgICBwb3MgPSB0aGlzLm1vdmVPZmZUYWcocG9zLCB0b2tlbnMsIHRoaXMuaW5kZXhNYXAodG9rZW5zKSwgLTEpO1xuICAgICAgICB9XG4gICAgICAgIHZhciB0b2tlbkluZGV4ID0gdGhpcy50b2tlbkluZGV4KHBvcywgdG9rZW5zLCB0aGlzLnRyYWNraW5nLmluZGV4TWFwKTtcbiAgICAgICAgLy8gTm93IHdlIGNhbiByZW1vdmUgdGhlIHRva2VucyB0aGF0IHdlcmUgZGVsZXRlZC5cbiAgICAgICAgdG9rZW5zLnNwbGljZSh0b2tlbkluZGV4LCBwcmV2VG9rZW5JbmRleCAtIHRva2VuSW5kZXgpO1xuICAgICAgfVxuXG4gICAgICAvLyBDb252ZXJ0IHRva2VucyBiYWNrIGludG8gcmF3IHZhbHVlIHdpdGggdGFncy4gTmV3bHkgZm9ybWVkIHRhZ3Mgd2lsbFxuICAgICAgLy8gYmVjb21lIHBhcnQgb2YgdGhlIHJhdyB2YWx1ZS5cbiAgICAgIHZhciByYXdWYWx1ZSA9IHRoaXMucmF3VmFsdWUodG9rZW5zKTtcblxuICAgICAgdGhpcy50cmFja2luZy5wb3MgPSBwb3M7XG4gICAgICB0aGlzLnRyYWNraW5nLnJhbmdlID0gMDtcblxuICAgICAgLy8gU2V0IHRoZSB2YWx1ZSB0byB0aGUgbmV3IHJhdyB2YWx1ZS5cbiAgICAgIHRoaXMucHJvcHMuZmllbGQudmFsKHJhd1ZhbHVlKTtcblxuICAgICAgdGhpcy5zbmFwc2hvdCgpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRVcGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciB2YWx1ZSA9IHRoaXMucHJvcHMuZmllbGQudmFsdWUgfHwgJyc7XG4gICAgICB2YXIgcGFydHMgPSB1dGlsLnBhcnNlVGV4dFdpdGhUYWdzKHZhbHVlKTtcbiAgICAgIHRoaXMudHJhY2tpbmcudG9rZW5zID0gdGhpcy50b2tlbnMocGFydHMpO1xuICAgICAgdGhpcy50cmFja2luZy5pbmRleE1hcCA9IHRoaXMuaW5kZXhNYXAodGhpcy50cmFja2luZy50b2tlbnMpO1xuXG4gICAgICB2YXIgcG9zID0gdGhpcy5ub3JtYWxpemVQb3NpdGlvbih0aGlzLnRyYWNraW5nLnBvcyk7XG4gICAgICB2YXIgcmFuZ2UgPSB0aGlzLnRyYWNraW5nLnJhbmdlO1xuICAgICAgdmFyIGVuZFBvcyA9IHRoaXMubm9ybWFsaXplUG9zaXRpb24ocG9zICsgcmFuZ2UpO1xuICAgICAgcmFuZ2UgPSBlbmRQb3MgLSBwb3M7XG5cbiAgICAgIHRoaXMudHJhY2tpbmcucG9zID0gcG9zO1xuICAgICAgdGhpcy50cmFja2luZy5yYW5nZSA9IHJhbmdlO1xuXG4gICAgICBpZiAoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCA9PT0gdGhpcy5yZWZzLmNvbnRlbnQuZ2V0RE9NTm9kZSgpKSB7XG4gICAgICAgIC8vIFJlYWN0IGNhbiBsb3NlIHRoZSBzZWxlY3Rpb24sIHNvIHB1dCBpdCBiYWNrLlxuICAgICAgICB0aGlzLnJlZnMuY29udGVudC5nZXRET01Ob2RlKCkuc2V0U2VsZWN0aW9uUmFuZ2UocG9zLCBwb3MgKyByYW5nZSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIEdldCB0aGUgbGFiZWwgZm9yIGEga2V5LlxuICAgIHByZXR0eUxhYmVsOiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICBpZiAodGhpcy5wcm9wcy5maWVsZC5kZWYucmVwbGFjZUNob2ljZXNMYWJlbHNba2V5XSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5maWVsZC5kZWYucmVwbGFjZUNob2ljZXNMYWJlbHNba2V5XTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB1dGlsLmh1bWFuaXplKGtleSk7XG4gICAgfSxcblxuICAgIC8vIEdpdmVuIHRoZSBhY3R1YWwgdmFsdWUgb2YgdGhlIGZpZWxkICh3aXRoIHRhZ3MpLCBnZXQgdGhlIHBsYWluIHRleHQgdGhhdFxuICAgIC8vIHNob3VsZCBzaG93IGluIHRoZSB0ZXh0YXJlYS5cbiAgICBwbGFpblZhbHVlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHZhciBwYXJ0cyA9IHV0aWwucGFyc2VUZXh0V2l0aFRhZ3ModmFsdWUpO1xuICAgICAgcmV0dXJuIHBhcnRzLm1hcChmdW5jdGlvbiAocGFydCkge1xuICAgICAgICBpZiAocGFydC50eXBlID09PSAndGV4dCcpIHtcbiAgICAgICAgICByZXR1cm4gcGFydC52YWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gTEVGVF9QQUQgKyBub0JyZWFrKHRoaXMucHJldHR5TGFiZWwocGFydC52YWx1ZSkpICsgUklHSFRfUEFEO1xuICAgICAgICB9XG4gICAgICB9LmJpbmQodGhpcykpLmpvaW4oJycpO1xuICAgIH0sXG5cbiAgICAvLyBHaXZlbiB0aGUgYWN0dWFsIHZhbHVlIG9mIHRoZSBmaWVsZCAod2l0aCB0YWdzKSwgZ2V0IHRoZSBodG1sIHVzZWQgdG9cbiAgICAvLyBoaWdobGlnaHQgdGhlIGxhYmVscy5cbiAgICBwcmV0dHlWYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB2YXIgcGFydHMgPSB1dGlsLnBhcnNlVGV4dFdpdGhUYWdzKHZhbHVlKTtcbiAgICAgIHJldHVybiBwYXJ0cy5tYXAoZnVuY3Rpb24gKHBhcnQsIGkpIHtcbiAgICAgICAgaWYgKHBhcnQudHlwZSA9PT0gJ3RleHQnKSB7XG4gICAgICAgICAgaWYgKGkgPT09IChwYXJ0cy5sZW5ndGggLSAxKSkge1xuICAgICAgICAgICAgaWYgKHBhcnQudmFsdWVbcGFydC52YWx1ZS5sZW5ndGggLSAxXSA9PT0gJ1xcbicpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHBhcnQudmFsdWUgKyAnXFx1MDBhMCc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBwYXJ0LnZhbHVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE1ha2UgYSBwaWxsXG4gICAgICAgICAgcmV0dXJuIFIuc3Bhbih7a2V5OiBpLCBjbGFzc05hbWU6ICdwcmV0dHktcGFydCd9LFxuICAgICAgICAgICAgUi5zcGFuKHtjbGFzc05hbWU6ICdwcmV0dHktcGFydC1sZWZ0J30sIExFRlRfUEFEKSxcbiAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAncHJldHR5LXBhcnQtdGV4dCd9LCBub0JyZWFrKHRoaXMucHJldHR5TGFiZWwocGFydC52YWx1ZSkpKSxcbiAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAncHJldHR5LXBhcnQtcmlnaHQnfSwgUklHSFRfUEFEKVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSxcblxuICAgIC8vIEdpdmVuIHRoZSB0b2tlbnMgZm9yIGEgZmllbGQsIGdldCB0aGUgYWN0dWFsIHZhbHVlIG9mIHRoZSBmaWVsZCAod2l0aFxuICAgIC8vIHRhZ3MpXG4gICAgcmF3VmFsdWU6IGZ1bmN0aW9uICh0b2tlbnMpIHtcbiAgICAgIHJldHVybiB0b2tlbnMubWFwKGZ1bmN0aW9uICh0b2tlbikge1xuICAgICAgICBpZiAodG9rZW4udHlwZSA9PT0gJ3RhZycpIHtcbiAgICAgICAgICByZXR1cm4gJ3t7JyArIHRva2VuLnZhbHVlICsgJ319JztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICAgIH1cbiAgICAgIH0pLmpvaW4oJycpO1xuICAgIH0sXG5cbiAgICAvLyBHaXZlbiBhIHBvc2l0aW9uLCBpZiBpdCdzIG9uIGEgbGFiZWwsIGdldCB0aGUgcG9zaXRpb24gbGVmdCBvciByaWdodCBvZlxuICAgIC8vIHRoZSBsYWJlbCwgYmFzZWQgb24gZGlyZWN0aW9uIGFuZC9vciB3aGljaCBzaWRlIGlzIGNsb3NlclxuICAgIG1vdmVPZmZUYWc6IGZ1bmN0aW9uIChwb3MsIHRva2VucywgaW5kZXhNYXAsIGRpcikge1xuICAgICAgaWYgKHR5cGVvZiBkaXIgPT09ICd1bmRlZmluZWQnIHx8IGRpciA+IDApIHtcbiAgICAgICAgZGlyID0gMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRpciA9IC0xO1xuICAgICAgfVxuICAgICAgdmFyIHRva2VuO1xuICAgICAgaWYgKGRpciA+IDApIHtcbiAgICAgICAgdG9rZW4gPSB0b2tlbnNbaW5kZXhNYXBbcG9zXV07XG4gICAgICAgIHdoaWxlIChwb3MgPCBpbmRleE1hcC5sZW5ndGggJiYgdG9rZW5zW2luZGV4TWFwW3Bvc11dLnR5cGUgPT09ICd0YWcnICYmIHRva2Vuc1tpbmRleE1hcFtwb3NdXSA9PT0gdG9rZW4pIHtcbiAgICAgICAgICBwb3MrKztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdG9rZW4gPSB0b2tlbnNbaW5kZXhNYXBbcG9zIC0gMV1dO1xuICAgICAgICB3aGlsZSAocG9zID4gMCAmJiB0b2tlbnNbaW5kZXhNYXBbcG9zIC0gMV1dLnR5cGUgPT09ICd0YWcnICYmIHRva2Vuc1tpbmRleE1hcFtwb3MgLSAxXV0gPT09IHRva2VuKSB7XG4gICAgICAgICAgcG9zLS07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHBvcztcbiAgICB9LFxuXG4gICAgLy8gR2V0IHRoZSB0b2tlbiBhdCBzb21lIHBvc2l0aW9uLlxuICAgIHRva2VuQXQ6IGZ1bmN0aW9uIChwb3MpIHtcbiAgICAgIGlmIChwb3MgPj0gdGhpcy50cmFja2luZy5pbmRleE1hcC5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICBpZiAocG9zIDwgMCkge1xuICAgICAgICBwb3MgPSAwO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMudHJhY2tpbmcudG9rZW5zW3RoaXMudHJhY2tpbmcuaW5kZXhNYXBbcG9zXV07XG4gICAgfSxcblxuICAgIC8vIEdldCB0aGUgdG9rZW4gaW1tZWRpYXRlbHkgYmVmb3JlIHNvbWUgcG9zaXRpb24uXG4gICAgdG9rZW5CZWZvcmU6IGZ1bmN0aW9uIChwb3MpIHtcbiAgICAgIGlmIChwb3MgPj0gdGhpcy50cmFja2luZy5pbmRleE1hcC5sZW5ndGgpIHtcbiAgICAgICAgcG9zID0gdGhpcy50cmFja2luZy5pbmRleE1hcC5sZW5ndGg7XG4gICAgICB9XG4gICAgICBpZiAocG9zIDw9IDApIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy50cmFja2luZy50b2tlbnNbdGhpcy50cmFja2luZy5pbmRleE1hcFtwb3MgLSAxXV07XG4gICAgfSxcblxuICAgIC8vIEdpdmVuIGEgcG9zaXRpb24sIGdldCBhIGNvcnJlY3RlZCBwb3NpdGlvbiAoaWYgbmVjZXNzYXJ5IHRvIGJlXG4gICAgLy8gY29ycmVjdGVkKS5cbiAgICBub3JtYWxpemVQb3NpdGlvbjogZnVuY3Rpb24gKHBvcywgcHJldlBvcykge1xuICAgICAgaWYgKF8uaXNVbmRlZmluZWQocHJldlBvcykpIHtcbiAgICAgICAgcHJldlBvcyA9IHBvcztcbiAgICAgIH1cbiAgICAgIC8vIEF0IHN0YXJ0IG9yIGVuZCwgc28gb2theS5cbiAgICAgIGlmIChwb3MgPD0gMCB8fCBwb3MgPj0gdGhpcy50cmFja2luZy5pbmRleE1hcC5sZW5ndGgpIHtcbiAgICAgICAgaWYgKHBvcyA8IDApIHtcbiAgICAgICAgICBwb3MgPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwb3MgPiB0aGlzLnRyYWNraW5nLmluZGV4TWFwLmxlbmd0aCkge1xuICAgICAgICAgIHBvcyA9IHRoaXMudHJhY2tpbmcuaW5kZXhNYXAubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwb3M7XG4gICAgICB9XG5cbiAgICAgIHZhciB0b2tlbiA9IHRoaXMudG9rZW5BdChwb3MpO1xuICAgICAgdmFyIHRva2VuQmVmb3JlID0gdGhpcy50b2tlbkJlZm9yZShwb3MpO1xuXG4gICAgICAvLyBCZXR3ZWVuIHR3byB0b2tlbnMsIHNvIG9rYXkuXG4gICAgICBpZiAodG9rZW4gIT09IHRva2VuQmVmb3JlKSB7XG4gICAgICAgIHJldHVybiBwb3M7XG4gICAgICB9XG5cbiAgICAgIHZhciBwcmV2VG9rZW4gPSB0aGlzLnRva2VuQXQocHJldlBvcyk7XG4gICAgICB2YXIgcHJldlRva2VuQmVmb3JlID0gdGhpcy50b2tlbkJlZm9yZShwcmV2UG9zKTtcblxuICAgICAgdmFyIHJpZ2h0UG9zID0gdGhpcy5tb3ZlT2ZmVGFnKHBvcywgdGhpcy50cmFja2luZy50b2tlbnMsIHRoaXMudHJhY2tpbmcuaW5kZXhNYXApO1xuICAgICAgdmFyIGxlZnRQb3MgPSB0aGlzLm1vdmVPZmZUYWcocG9zLCB0aGlzLnRyYWNraW5nLnRva2VucywgdGhpcy50cmFja2luZy5pbmRleE1hcCwgLTEpO1xuXG4gICAgICBpZiAocHJldlRva2VuICE9PSBwcmV2VG9rZW5CZWZvcmUpIHtcbiAgICAgICAgLy8gTW92ZWQgZnJvbSBsZWZ0IGVkZ2UuXG4gICAgICAgIGlmIChwcmV2VG9rZW4gPT09IHRva2VuKSB7XG4gICAgICAgICAgcmV0dXJuIHJpZ2h0UG9zO1xuICAgICAgICB9XG4gICAgICAgIC8vIE1vdmVkIGZyb20gcmlnaHQgZWRnZS5cbiAgICAgICAgaWYgKHByZXZUb2tlbkJlZm9yZSA9PT0gdG9rZW4pIHtcbiAgICAgICAgICByZXR1cm4gbGVmdFBvcztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgbmV3UG9zID0gcmlnaHRQb3M7XG5cbiAgICAgIGlmIChwb3MgPT09IHByZXZQb3MgfHwgcG9zIDwgcHJldlBvcykge1xuICAgICAgICBpZiAocmlnaHRQb3MgLSBwb3MgPiBwb3MgLSBsZWZ0UG9zKSB7XG4gICAgICAgICAgbmV3UG9zID0gbGVmdFBvcztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG5ld1BvcztcbiAgICB9LFxuXG4gICAgb25TZWxlY3Q6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgdmFyIG5vZGUgPSBldmVudC50YXJnZXQ7XG5cbiAgICAgIHZhciBwb3MgPSBub2RlLnNlbGVjdGlvblN0YXJ0O1xuICAgICAgdmFyIGVuZFBvcyA9IG5vZGUuc2VsZWN0aW9uRW5kO1xuXG4gICAgICBwb3MgPSB0aGlzLm5vcm1hbGl6ZVBvc2l0aW9uKHBvcywgdGhpcy50cmFja2luZy5wb3MpO1xuICAgICAgZW5kUG9zID0gdGhpcy5ub3JtYWxpemVQb3NpdGlvbihlbmRQb3MsIHRoaXMudHJhY2tpbmcucG9zICsgdGhpcy50cmFja2luZy5yYW5nZSk7XG5cbiAgICAgIHRoaXMudHJhY2tpbmcucG9zID0gcG9zO1xuICAgICAgdGhpcy50cmFja2luZy5yYW5nZSA9IGVuZFBvcyAtIHBvcztcblxuICAgICAgbm9kZS5zZWxlY3Rpb25TdGFydCA9IHBvcztcbiAgICAgIG5vZGUuc2VsZWN0aW9uRW5kID0gZW5kUG9zO1xuICAgIH0sXG5cbiAgICBvbkNvcHk6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBub2RlID0gdGhpcy5yZWZzLmNvbnRlbnQuZ2V0RE9NTm9kZSgpO1xuICAgICAgdmFyIHN0YXJ0ID0gbm9kZS5zZWxlY3Rpb25TdGFydDtcbiAgICAgIHZhciBlbmQgPSBub2RlLnNlbGVjdGlvbkVuZDtcbiAgICAgIHZhciB0ZXh0ID0gbm9kZS52YWx1ZS5zdWJzdHJpbmcoc3RhcnQsIGVuZCk7XG4gICAgICB2YXIgcmVhbFN0YXJ0SW5kZXggPSB0aGlzLnRva2VuSW5kZXgoc3RhcnQsIHRoaXMudHJhY2tpbmcudG9rZW5zLCB0aGlzLnRyYWNraW5nLmluZGV4TWFwKTtcbiAgICAgIHZhciByZWFsRW5kSW5kZXggPSB0aGlzLnRva2VuSW5kZXgoZW5kLCB0aGlzLnRyYWNraW5nLnRva2VucywgdGhpcy50cmFja2luZy5pbmRleE1hcCk7XG4gICAgICB2YXIgdG9rZW5zID0gdGhpcy50cmFja2luZy50b2tlbnMuc2xpY2UocmVhbFN0YXJ0SW5kZXgsIHJlYWxFbmRJbmRleCk7XG4gICAgICB0ZXh0ID0gdGhpcy5yYXdWYWx1ZSh0b2tlbnMpO1xuICAgICAgdmFyIG9yaWdpbmFsVmFsdWUgPSBub2RlLnZhbHVlO1xuICAgICAgbm9kZS52YWx1ZSA9IG5vZGUudmFsdWUgKyB0ZXh0O1xuICAgICAgbm9kZS5zZXRTZWxlY3Rpb25SYW5nZShvcmlnaW5hbFZhbHVlLmxlbmd0aCwgb3JpZ2luYWxWYWx1ZS5sZW5ndGggKyB0ZXh0Lmxlbmd0aCk7XG4gICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgbm9kZS52YWx1ZSA9IG9yaWdpbmFsVmFsdWU7XG4gICAgICAgIG5vZGUuc2V0U2VsZWN0aW9uUmFuZ2Uoc3RhcnQsIGVuZCk7XG4gICAgICB9LDApO1xuICAgIH0sXG5cbiAgICBvbktleURvd246IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgLy8gQ21kLVogb3IgQ3RybC1aXG4gICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gOTAgJiYgKGV2ZW50Lm1ldGFLZXkgfHwgZXZlbnQuY3RybEtleSkgJiYgIWV2ZW50LnNoaWZ0S2V5KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMudW5kbygpO1xuICAgICAgLy8gQ21kLVNoaWZ0LVogb3IgQ3RybC1ZXG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAoZXZlbnQua2V5Q29kZSA9PT0gODkgJiYgZXZlbnQuY3RybEtleSAmJiAhZXZlbnQuc2hpZnRLZXkpIHx8XG4gICAgICAgIChldmVudC5rZXlDb2RlID09PSA5MCAmJiBldmVudC5tZXRhS2V5ICYmIGV2ZW50LnNoaWZ0S2V5KVxuICAgICAgKSB7XG4gICAgICAgIHRoaXMucmVkbygpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBLZWVwIHRoZSBoaWdobGlnaHQgc3R5bGVzIGluIHN5bmMgd2l0aCB0aGUgdGV4dGFyZWEgc3R5bGVzLlxuICAgIGFkanVzdFN0eWxlczogZnVuY3Rpb24gKGlzTW91bnQpIHtcbiAgICAgIHZhciBvdmVybGF5ID0gdGhpcy5yZWZzLmhpZ2hsaWdodC5nZXRET01Ob2RlKCk7XG4gICAgICB2YXIgY29udGVudCA9IHRoaXMucmVmcy5jb250ZW50LmdldERPTU5vZGUoKTtcblxuICAgICAgdmFyIHN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoY29udGVudCk7XG5cbiAgICAgIHZhciBiYWNrZ3JvdW5kQ29sb3IgPSBzdHlsZS5iYWNrZ3JvdW5kQ29sb3I7XG5cbiAgICAgIHV0aWwuY29weUVsZW1lbnRTdHlsZShjb250ZW50LCBvdmVybGF5KTtcblxuICAgICAgb3ZlcmxheS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICBvdmVybGF5LnN0eWxlLndoaXRlU3BhY2UgPSAncHJlLXdyYXAnO1xuICAgICAgb3ZlcmxheS5zdHlsZS5jb2xvciA9ICdyZ2JhKDAsMCwwLDApJztcbiAgICAgIG92ZXJsYXkuc3R5bGUud2Via2l0VGV4dEZpbGxDb2xvciA9ICdyZ2JhKDAsMCwwLDApJztcbiAgICAgIG92ZXJsYXkuc3R5bGUucmVzaXplID0gJ25vbmUnO1xuICAgICAgb3ZlcmxheS5zdHlsZS5ib3JkZXJDb2xvciA9ICdyZ2JhKDAsMCwwLDApJztcblxuICAgICAgaWYgKHV0aWwuYnJvd3Nlci5pc01vemlsbGEpIHtcblxuICAgICAgICB2YXIgcGFkZGluZ1RvcCA9IHBhcnNlRmxvYXQoc3R5bGUucGFkZGluZ1RvcCk7XG4gICAgICAgIHZhciBwYWRkaW5nQm90dG9tID0gcGFyc2VGbG9hdChzdHlsZS5wYWRkaW5nQm90dG9tKTtcblxuICAgICAgICB2YXIgYm9yZGVyVG9wID0gcGFyc2VGbG9hdChzdHlsZS5ib3JkZXJUb3BXaWR0aCk7XG4gICAgICAgIHZhciBib3JkZXJCb3R0b20gPSBwYXJzZUZsb2F0KHN0eWxlLmJvcmRlckJvdHRvbVdpZHRoKTtcblxuICAgICAgICBvdmVybGF5LnN0eWxlLnBhZGRpbmdUb3AgPSAnMHB4JztcbiAgICAgICAgb3ZlcmxheS5zdHlsZS5wYWRkaW5nQm90dG9tID0gJzBweCc7XG5cbiAgICAgICAgb3ZlcmxheS5zdHlsZS5oZWlnaHQgPSAoY29udGVudC5jbGllbnRIZWlnaHQgLSBwYWRkaW5nVG9wIC0gcGFkZGluZ0JvdHRvbSArIGJvcmRlclRvcCArIGJvcmRlckJvdHRvbSkgKyAncHgnO1xuICAgICAgICBvdmVybGF5LnN0eWxlLnRvcCA9IHN0eWxlLnBhZGRpbmdUb3A7XG4gICAgICAgIG92ZXJsYXkuc3R5bGUuYm94U2hhZG93ID0gJ25vbmUnO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNNb3VudCkge1xuICAgICAgICB0aGlzLmJhY2tncm91bmRDb2xvciA9IGJhY2tncm91bmRDb2xvcjtcbiAgICAgIH1cbiAgICAgIG92ZXJsYXkuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gdGhpcy5iYWNrZ3JvdW5kQ29sb3I7XG4gICAgICBjb250ZW50LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdyZ2JhKDAsMCwwLDApJztcbiAgICB9LFxuXG4gICAgLy8gSWYgdGhlIHRleHRhcmVhIGlzIHJlc2l6ZWQsIG5lZWQgdG8gcmUtc3luYyB0aGUgc3R5bGVzLlxuICAgIG9uUmVzaXplOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmFkanVzdFN0eWxlcygpO1xuICAgIH0sXG5cbiAgICAvLyBJZiB0aGUgd2luZG93IGlzIHJlc2l6ZWQsIG1heSBuZWVkIHRvIHJlLXN5bmMgdGhlIHN0eWxlcy5cbiAgICAvLyBQcm9iYWJseSBub3QgbmVjZXNzYXJ5IHdpdGggZWxlbWVudCByZXNpemU/XG4gICAgb25SZXNpemVXaW5kb3c6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuYWRqdXN0U3R5bGVzKCk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmFkanVzdFN0eWxlcyh0cnVlKTtcbiAgICAgIHRoaXMuc2V0T25SZXNpemUoJ2NvbnRlbnQnLCB0aGlzLm9uUmVzaXplKTtcbiAgICB9LFxuXG4gICAgb25JbnNlcnQ6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgaWYgKGV2ZW50LnRhcmdldC5zZWxlY3RlZEluZGV4ID4gMCkge1xuICAgICAgICB2YXIgdGFnID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xuICAgICAgICBldmVudC50YXJnZXQuc2VsZWN0ZWRJbmRleCA9IDA7XG4gICAgICAgIHZhciBwb3MgPSB0aGlzLnRyYWNraW5nLnBvcztcbiAgICAgICAgdmFyIGluc2VydFBvcyA9IHRoaXMubm9ybWFsaXplUG9zaXRpb24ocG9zKTtcbiAgICAgICAgdmFyIHRva2VucyA9IHRoaXMudHJhY2tpbmcudG9rZW5zO1xuICAgICAgICB2YXIgdG9rZW5JbmRleCA9IHRoaXMudG9rZW5JbmRleChpbnNlcnRQb3MsIHRva2VucywgdGhpcy50cmFja2luZy5pbmRleE1hcCk7XG4gICAgICAgIHRva2Vucy5zcGxpY2UodG9rZW5JbmRleCwgMCwge1xuICAgICAgICAgIHR5cGU6ICd0YWcnLFxuICAgICAgICAgIHZhbHVlOiB0YWdcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudHJhY2tpbmcuaW5kZXhNYXAgPSB0aGlzLmluZGV4TWFwKHRva2Vucyk7XG4gICAgICAgIHZhciBuZXdWYWx1ZSA9IHRoaXMucmF3VmFsdWUodG9rZW5zKTtcbiAgICAgICAgdGhpcy50cmFja2luZy5wb3MgKz0gdGhpcy5wcmV0dHlMYWJlbCh0YWcpLmxlbmd0aDtcbiAgICAgICAgdGhpcy5wcm9wcy5maWVsZC52YWwobmV3VmFsdWUpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICAgIHZhciByZXBsYWNlQ2hvaWNlcyA9IFt7XG4gICAgICAgIHZhbHVlOiAnJyxcbiAgICAgICAgbGFiZWw6ICdJbnNlcnQuLi4nXG4gICAgICB9XS5jb25jYXQoZmllbGQuZGVmLnJlcGxhY2VDaG9pY2VzKTtcblxuICAgICAgcmV0dXJuIHBsdWdpbi5jb21wb25lbnQoJ2ZpZWxkJykoe1xuICAgICAgICBmaWVsZDogZmllbGRcbiAgICAgIH0sIFIuZGl2KHtzdHlsZToge3Bvc2l0aW9uOiAncmVsYXRpdmUnfX0sXG5cbiAgICAgICAgUi5wcmUoe1xuICAgICAgICAgIGNsYXNzTmFtZTogJ3ByZXR0eS1oaWdobGlnaHQnLFxuICAgICAgICAgIHJlZjogJ2hpZ2hsaWdodCdcbiAgICAgICAgfSxcbiAgICAgICAgICB0aGlzLnByZXR0eVZhbHVlKGZpZWxkLnZhbHVlKVxuICAgICAgICApLFxuXG4gICAgICAgIFIudGV4dGFyZWEoXy5leHRlbmQoe1xuICAgICAgICAgIGNsYXNzTmFtZTogdXRpbC5jbGFzc05hbWUodGhpcy5wcm9wcy5jbGFzc05hbWUsICdwcmV0dHktY29udGVudCcpLFxuICAgICAgICAgIHJlZjogJ2NvbnRlbnQnLFxuICAgICAgICAgIHJvd3M6IGZpZWxkLmRlZi5yb3dzIHx8IHRoaXMucHJvcHMucm93cyxcbiAgICAgICAgICBuYW1lOiBmaWVsZC5rZXksXG4gICAgICAgICAgdmFsdWU6IHRoaXMucGxhaW5WYWx1ZShmaWVsZC52YWx1ZSksXG4gICAgICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsXG4gICAgICAgICAgb25TY3JvbGw6IHRoaXMub25TY3JvbGwsXG4gICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnLFxuICAgICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgICAgbGVmdDogMFxuICAgICAgICAgIH0sXG4gICAgICAgICAgb25LZXlQcmVzczogdGhpcy5vbktleVByZXNzLFxuICAgICAgICAgIG9uS2V5RG93bjogdGhpcy5vbktleURvd24sXG4gICAgICAgICAgb25TZWxlY3Q6IHRoaXMub25TZWxlY3QsXG4gICAgICAgICAgb25Db3B5OiB0aGlzLm9uQ29weVxuICAgICAgICB9LCBwbHVnaW4uY29uZmlnLmF0dHJpYnV0ZXMpKSxcblxuICAgICAgICBSLnNlbGVjdCh7b25DaGFuZ2U6IHRoaXMub25JbnNlcnR9LFxuICAgICAgICAgIHJlcGxhY2VDaG9pY2VzLm1hcChmdW5jdGlvbiAoY2hvaWNlLCBpKSB7XG4gICAgICAgICAgICByZXR1cm4gUi5vcHRpb24oe1xuICAgICAgICAgICAgICBrZXk6IGksXG4gICAgICAgICAgICAgIHZhbHVlOiBjaG9pY2UudmFsdWVcbiAgICAgICAgICAgIH0sIGNob2ljZS5sYWJlbCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgKVxuICAgICAgKSk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50LnJlbW92ZS1pdGVtXG5cbi8qXG5SZW1vdmUgYW4gaXRlbS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWUsXG4gICAgICAgIGxhYmVsOiBwbHVnaW4uY29uZmlnVmFsdWUoJ2xhYmVsJywgJ1tyZW1vdmVdJylcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIFIuc3Bhbih7Y2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZSwgb25DbGljazogdGhpcy5wcm9wcy5vbkNsaWNrfSwgdGhpcy5wcm9wcy5sYWJlbCk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50LnJvb3RcblxuLypcblJvb3QgY29tcG9uZW50IGp1c3QgdXNlZCB0byBzcGl0IG91dCBhbGwgdGhlIGZpZWxkcyBmb3IgYSBmb3JtLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICB2YXIgdXRpbCA9IHBsdWdpbi5yZXF1aXJlKCd1dGlsJyk7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogdXRpbC5jbGFzc05hbWUoJ3Jvb3QnLCBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZSlcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgICAgcmV0dXJuIFIuZGl2KHtcbiAgICAgICAgY2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZVxuICAgICAgfSxcbiAgICAgICAgZmllbGQuZmllbGRzKCkubWFwKGZ1bmN0aW9uIChmaWVsZCwgaSkge1xuICAgICAgICAgIHJldHVybiBmaWVsZC5jb21wb25lbnQoe2tleTogZmllbGQuZGVmLmtleSB8fCBpfSk7XG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC5oZWxwXG5cbi8qXG5KdXN0IHRoZSBoZWxwIHRleHQgYmxvY2suXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZGlzcGxheU5hbWU6IHBsdWdpbi5uYW1lLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIGNob2ljZSA9IHRoaXMucHJvcHMuY2hvaWNlO1xuXG4gICAgICByZXR1cm4gY2hvaWNlLnNhbXBsZSA/XG4gICAgICAgIFIuZGl2KHtjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lfSxcbiAgICAgICAgICBjaG9pY2Uuc2FtcGxlXG4gICAgICAgICkgOlxuICAgICAgICBSLnNwYW4obnVsbCk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50LnNlbGVjdFxuXG4vKlxuUmVuZGVyIHNlbGVjdCBlbGVtZW50IHRvIGdpdmUgYSB1c2VyIGNob2ljZXMgZm9yIHRoZSB2YWx1ZSBvZiBhIGZpZWxkLiBOb3RlXG5pdCBzaG91bGQgc3VwcG9ydCB2YWx1ZXMgb3RoZXIgdGhhbiBzdHJpbmdzLiBDdXJyZW50bHkgdGhpcyBpcyBvbmx5IHRlc3RlZCBmb3JcbmJvb2xlYW4gdmFsdWVzLCBidXQgaXQgX3Nob3VsZF8gd29yayBmb3Igb3RoZXIgdmFsdWVzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZGlzcGxheU5hbWU6IHBsdWdpbi5uYW1lLFxuXG4gICAgbWl4aW5zOiBbcGx1Z2luLnJlcXVpcmUoJ21peGluLmZpZWxkJyldLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICB2YXIgY2hvaWNlVmFsdWUgPSBldmVudC50YXJnZXQudmFsdWU7XG4gICAgICB2YXIgY2hvaWNlVHlwZSA9IGNob2ljZVZhbHVlLnN1YnN0cmluZygwLCBjaG9pY2VWYWx1ZS5pbmRleE9mKCc6JykpO1xuICAgICAgaWYgKGNob2ljZVR5cGUgPT09ICdjaG9pY2UnKSB7XG4gICAgICAgIHZhciBjaG9pY2VJbmRleCA9IGNob2ljZVZhbHVlLnN1YnN0cmluZyhjaG9pY2VWYWx1ZS5pbmRleE9mKCc6JykgKyAxKTtcbiAgICAgICAgY2hvaWNlSW5kZXggPSBwYXJzZUludChjaG9pY2VJbmRleCk7XG4gICAgICAgIHRoaXMucHJvcHMuZmllbGQudmFsKHRoaXMucHJvcHMuZmllbGQuZGVmLmNob2ljZXNbY2hvaWNlSW5kZXhdLnZhbHVlKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG4gICAgICB2YXIgY2hvaWNlcyA9IGZpZWxkLmRlZi5jaG9pY2VzIHx8IFtdO1xuXG4gICAgICB2YXIgdmFsdWUgPSBmaWVsZC52YWx1ZSAhPT0gdW5kZWZpbmVkID8gZmllbGQudmFsdWUgOiAnJztcblxuICAgICAgY2hvaWNlcyA9IGNob2ljZXMubWFwKGZ1bmN0aW9uIChjaG9pY2UsIGkpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBjaG9pY2VWYWx1ZTogJ2Nob2ljZTonICsgaSxcbiAgICAgICAgICB2YWx1ZTogY2hvaWNlLnZhbHVlLFxuICAgICAgICAgIGxhYmVsOiBjaG9pY2UubGFiZWxcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgdmFsdWVDaG9pY2UgPSBfLmZpbmQoY2hvaWNlcywgZnVuY3Rpb24gKGNob2ljZSkge1xuICAgICAgICByZXR1cm4gY2hvaWNlLnZhbHVlID09PSB2YWx1ZTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAodmFsdWVDaG9pY2UgPT09IHVuZGVmaW5lZCkge1xuXG4gICAgICAgIHZhciBsYWJlbCA9IHZhbHVlO1xuICAgICAgICBpZiAoIV8uaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgICAgICAgbGFiZWwgPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFsdWVDaG9pY2UgPSB7XG4gICAgICAgICAgY2hvaWNlVmFsdWU6ICd2YWx1ZTonLFxuICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICBsYWJlbDogbGFiZWxcbiAgICAgICAgfTtcbiAgICAgICAgY2hvaWNlcyA9IFt2YWx1ZUNob2ljZV0uY29uY2F0KGNob2ljZXMpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcGx1Z2luLmNvbXBvbmVudCgnZmllbGQnKSh7XG4gICAgICAgIGZpZWxkOiBmaWVsZFxuICAgICAgfSwgUi5zZWxlY3Qoe1xuICAgICAgICBjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lLFxuICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgICAgdmFsdWU6IHZhbHVlQ2hvaWNlLmNob2ljZVZhbHVlXG4gICAgICB9LFxuICAgICAgICBjaG9pY2VzLm1hcChmdW5jdGlvbiAoY2hvaWNlLCBpKSB7XG4gICAgICAgICAgcmV0dXJuIFIub3B0aW9uKHtcbiAgICAgICAgICAgIGtleTogaSxcbiAgICAgICAgICAgIHZhbHVlOiBjaG9pY2UuY2hvaWNlVmFsdWVcbiAgICAgICAgICB9LCBjaG9pY2UubGFiZWwpO1xuICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICApKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQudGV4dFxuXG4vKlxuSnVzdCBhIHNpbXBsZSB0ZXh0IGlucHV0LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGRpc3BsYXlOYW1lOiBwbHVnaW4ubmFtZSxcblxuICAgIG1peGluczogW3BsdWdpbi5yZXF1aXJlKCdtaXhpbi5maWVsZCcpXSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgdmFyIG5ld1ZhbHVlID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xuICAgICAgdGhpcy5wcm9wcy5maWVsZC52YWwobmV3VmFsdWUpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgICAgcmV0dXJuIHBsdWdpbi5jb21wb25lbnQoJ2ZpZWxkJykoe1xuICAgICAgICBmaWVsZDogZmllbGRcbiAgICAgIH0sIFIuaW5wdXQoe1xuICAgICAgICBjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lLFxuICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgIHZhbHVlOiBmaWVsZC52YWx1ZSxcbiAgICAgICAgcm93czogZmllbGQuZGVmLnJvd3MsXG4gICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlXG4gICAgICB9KSk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50LnRleHRhcmVhXG5cbi8qXG5KdXN0IGEgc2ltcGxlIG11bHRpLXJvdyB0ZXh0YXJlYS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBtaXhpbnM6IFtwbHVnaW4ucmVxdWlyZSgnbWl4aW4uZmllbGQnKV0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWUsXG4gICAgICAgIHJvd3M6IHBsdWdpbi5jb25maWcucm93cyB8fCA1XG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICB2YXIgbmV3VmFsdWUgPSBldmVudC50YXJnZXQudmFsdWU7XG4gICAgICB0aGlzLnByb3BzLmZpZWxkLnZhbChuZXdWYWx1ZSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgICByZXR1cm4gcGx1Z2luLmNvbXBvbmVudCgnZmllbGQnKSh7XG4gICAgICAgIGZpZWxkOiBmaWVsZFxuICAgICAgfSwgUi50ZXh0YXJlYSh7XG4gICAgICAgIGNsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWUsXG4gICAgICAgIHZhbHVlOiBmaWVsZC52YWx1ZSxcbiAgICAgICAgcm93czogZmllbGQuZGVmLnJvd3MgfHwgdGhpcy5wcm9wcy5yb3dzLFxuICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZVxuICAgICAgfSkpO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvcmUuZmllbGRcblxuLypcblRoZSBjb3JlIGZpZWxkIHBsdWdpbiBwcm92aWRlcyB0aGUgRmllbGQgcHJvdG90eXBlLiBGaWVsZHMgcmVwcmVzZW50IGFcbnBhcnRpY3VsYXIgc3RhdGUgaW4gdGltZSBvZiBhIGZpZWxkIGRlZmluaXRpb24sIGFuZCB0aGV5IHByb3ZpZGUgaGVscGVyIG1ldGhvZHNcbnRvIG5vdGlmeSB0aGUgZm9ybSBzdG9yZSBvZiBjaGFuZ2VzLlxuXG5GaWVsZHMgYXJlIGxhemlseSBjcmVhdGVkIGFuZCBldmFsdWF0ZWQsIGJ1dCBvbmNlIGV2YWx1YXRlZCwgdGhleSBzaG91bGQgYmVcbmNvbnNpZGVyZWQgaW1tdXRhYmxlLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgdmFyIHJvdXRlciA9IHBsdWdpbi5yZXF1aXJlKCdmaWVsZC1yb3V0ZXInKTtcbiAgdmFyIHV0aWwgPSBwbHVnaW4ucmVxdWlyZSgndXRpbCcpO1xuICB2YXIgZXZhbHVhdG9yID0gcGx1Z2luLnJlcXVpcmUoJ2V2YWwnKTtcbiAgdmFyIGNvbXBpbGVyID0gcGx1Z2luLnJlcXVpcmUoJ2NvbXBpbGVyJyk7XG5cbiAgLy8gVGhlIEZpZWxkIGNvbnN0cnVjdG9yLlxuICB2YXIgRmllbGQgPSBmdW5jdGlvbiAoZm9ybSwgZGVmLCB2YWx1ZSwgcGFyZW50KSB7XG4gICAgdmFyIGZpZWxkID0gdGhpcztcblxuICAgIGZpZWxkLmZvcm0gPSBmb3JtO1xuICAgIGZpZWxkLmRlZiA9IGRlZjtcbiAgICBmaWVsZC52YWx1ZSA9IHZhbHVlO1xuICAgIGZpZWxkLnBhcmVudCA9IHBhcmVudDtcbiAgICBmaWVsZC5ncm91cHMgPSB7fTtcbiAgICBmaWVsZC50ZW1wQ2hpbGRyZW4gPSBbXTtcbiAgfTtcblxuICAvLyBBdHRhY2ggYSBmaWVsZCBmYWN0b3J5IHRvIHRoZSBmb3JtIHByb3RvdHlwZS5cbiAgcGx1Z2luLmV4cG9ydHMuZmllbGQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGZvcm0gPSB0aGlzO1xuXG4gICAgcmV0dXJuIG5ldyBGaWVsZChmb3JtLCB7XG4gICAgICB0eXBlOiAncm9vdCdcbiAgICB9LCBmb3JtLnN0b3JlLnZhbHVlKTtcbiAgfTtcblxuICB2YXIgcHJvdG8gPSBGaWVsZC5wcm90b3R5cGU7XG5cbiAgLy8gUmV0dXJuIHRoZSB0eXBlIHBsdWdpbiBmb3IgdGhpcyBmaWVsZC5cbiAgcHJvdG8udHlwZVBsdWdpbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzO1xuXG4gICAgaWYgKCFmaWVsZC5fdHlwZVBsdWdpbikge1xuICAgICAgZmllbGQuX3R5cGVQbHVnaW4gPSBwbHVnaW4ucmVxdWlyZSgndHlwZS4nICsgZmllbGQuZGVmLnR5cGUpO1xuICAgIH1cblxuICAgIHJldHVybiBmaWVsZC5fdHlwZVBsdWdpbjtcbiAgfTtcblxuICAvLyBHZXQgYSBjb21wb25lbnQgZm9yIHRoaXMgZmllbGQuXG4gIHByb3RvLmNvbXBvbmVudCA9IGZ1bmN0aW9uIChwcm9wcykge1xuICAgIHZhciBmaWVsZCA9IHRoaXM7XG4gICAgcHJvcHMgPSBfLmV4dGVuZCh7fSwgcHJvcHMsIHtmaWVsZDogZmllbGR9KTtcbiAgICB2YXIgY29tcG9uZW50ID0gcm91dGVyLmNvbXBvbmVudEZvckZpZWxkKGZpZWxkKTtcbiAgICByZXR1cm4gY29tcG9uZW50KHByb3BzKTtcbiAgfTtcblxuICAvLyBHZXQgdGhlIGNoaWxkIGZpZWxkcyBmb3IgdGhpcyBmaWVsZC5cbiAgcHJvdG8uZmllbGRzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBmaWVsZCA9IHRoaXM7XG5cbiAgICBpZiAoIWZpZWxkLl9maWVsZHMpIHtcbiAgICAgIHZhciBmaWVsZHM7XG4gICAgICBpZiAoZmllbGQudHlwZVBsdWdpbigpLmZpZWxkcykge1xuICAgICAgICBmaWVsZHMgPSBmaWVsZC50eXBlUGx1Z2luKCkuZmllbGRzKGZpZWxkKTtcbiAgICAgIH0gZWxzZSBpZiAoZmllbGQuZGVmLmZpZWxkcykge1xuICAgICAgICBmaWVsZHMgPSBmaWVsZC5kZWYuZmllbGRzLm1hcChmdW5jdGlvbiAoZGVmKSB7XG4gICAgICAgICAgcmV0dXJuIGZpZWxkLmNyZWF0ZUNoaWxkKGRlZik7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZmllbGRzID0gW107XG4gICAgICB9XG4gICAgICBmaWVsZC5fZmllbGRzID0gZmllbGRzO1xuICAgIH1cblxuICAgIHJldHVybiBmaWVsZC5fZmllbGRzO1xuICB9O1xuXG4gIC8vIEdldCB0aGUgaXRlbXMgKGNoaWxkIGZpZWxkIGRlZmluaXRpb25zKSBmb3IgdGhpcyBmaWVsZC5cbiAgcHJvdG8uaXRlbXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGZpZWxkID0gdGhpcztcblxuICAgIGlmICghZmllbGQuX2l0ZW1zKSB7XG4gICAgICBpZiAoXy5pc0FycmF5KGZpZWxkLmRlZi5pdGVtcykpIHtcbiAgICAgICAgZmllbGQuX2l0ZW1zID0gZmllbGQuZGVmLml0ZW1zLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgIHJldHVybiBmaWVsZC5yZXNvbHZlKGl0ZW0pO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZpZWxkLl9pdGVtcyA9IFtdO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmaWVsZC5faXRlbXM7XG4gIH07XG5cbiAgLy8gUmVzb2x2ZSBhIGZpZWxkIHJlZmVyZW5jZSBpZiBuZWNlc3NhcnkuXG4gIHByb3RvLnJlc29sdmUgPSBmdW5jdGlvbiAoZGVmKSB7XG4gICAgdmFyIGZpZWxkID0gdGhpcztcblxuICAgIGlmIChfLmlzU3RyaW5nKGRlZikpIHtcbiAgICAgIGRlZiA9IGZpZWxkLmZvcm0uZmluZERlZihkZWYpO1xuICAgICAgaWYgKCFkZWYpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZmluZCBmaWVsZDogJyArIGRlZik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRlZjtcbiAgfTtcblxuICAvLyBFdmFsdWF0ZSBhIGZpZWxkIGRlZmluaXRpb24gYW5kIHJldHVybiBhIG5ldyBmaWVsZCBkZWZpbml0aW9uLlxuICBwcm90by5ldmFsRGVmID0gZnVuY3Rpb24gKGRlZikge1xuICAgIHZhciBmaWVsZCA9IHRoaXM7XG5cbiAgICBpZiAoZGVmLmV2YWwpIHtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgdmFyIGV4dERlZiA9IGZpZWxkLmV2YWwoZGVmLmV2YWwpO1xuICAgICAgICBpZiAoZXh0RGVmKSB7XG4gICAgICAgICAgZGVmID0gXy5leHRlbmQoe30sIGRlZiwgZXh0RGVmKTtcbiAgICAgICAgICBkZWYgPSBjb21waWxlci5jb21waWxlRGVmKGRlZik7XG4gICAgICAgICAgaWYgKGRlZi5maWVsZHMpIHtcbiAgICAgICAgICAgIGRlZi5maWVsZHMgPSBkZWYuZmllbGRzLm1hcChmdW5jdGlvbiAoY2hpbGREZWYpIHtcbiAgICAgICAgICAgICAgY2hpbGREZWYgPSBjb21waWxlci5leHBhbmREZWYoY2hpbGREZWYsIGZpZWxkLmZvcm0uc3RvcmUudGVtcGxhdGVNYXApO1xuICAgICAgICAgICAgICByZXR1cm4gY29tcGlsZXIuY29tcGlsZURlZihjaGlsZERlZik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1Byb2JsZW0gaW4gZXZhbDogJywgSlNPTi5zdHJpbmdpZnkoZGVmLmV2YWwpKTtcbiAgICAgICAgY29uc29sZS5sb2coZS5tZXNzYWdlKTtcbiAgICAgICAgY29uc29sZS5sb2coZS5zdGFjayk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRlZjtcbiAgfTtcblxuICAvLyBFdmFsdWF0ZSBhbiBleHByZXNzaW9uIGluIHRoZSBjb250ZXh0IG9mIGEgZmllbGQuXG4gIHByb3RvLmV2YWwgPSBmdW5jdGlvbiAoZXhwcmVzc2lvbiwgY29udGV4dCkge1xuICAgIHJldHVybiBldmFsdWF0b3IuZXZhbHVhdGUoZXhwcmVzc2lvbiwgdGhpcywgY29udGV4dCk7XG4gIH07XG5cbiAgLy8gQ3JlYXRlIGEgY2hpbGQgZmllbGQgZnJvbSBhIGRlZmluaXRpb24uXG4gIHByb3RvLmNyZWF0ZUNoaWxkID0gZnVuY3Rpb24gKGRlZikge1xuICAgIHZhciBmaWVsZCA9IHRoaXM7XG5cbiAgICBkZWYgPSBmaWVsZC5yZXNvbHZlKGRlZik7XG5cbiAgICB2YXIgdmFsdWUgPSBmaWVsZC52YWx1ZTtcblxuICAgIGRlZiA9IGZpZWxkLmV2YWxEZWYoZGVmKTtcblxuICAgIGlmICghdXRpbC5pc0JsYW5rKGRlZi5rZXkpKSB7XG4gICAgICBpZiAodmFsdWUgJiYgIV8uaXNVbmRlZmluZWQodmFsdWVbZGVmLmtleV0pKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWVbZGVmLmtleV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgPSBkZWYudmFsdWU7XG4gICAgfVxuXG4gICAgdmFyIGNoaWxkRmllbGQgPSBuZXcgRmllbGQoZmllbGQuZm9ybSwgZGVmLCB2YWx1ZSwgZmllbGQpO1xuXG4gICAgZmllbGQudGVtcENoaWxkcmVuLnB1c2goY2hpbGRGaWVsZCk7XG5cbiAgICByZXR1cm4gY2hpbGRGaWVsZDtcblxuICAgIC8vIGlmIChkZWYuZXZhbCkge1xuICAgIC8vICAgZGVmID0gY2hpbGRGaWVsZC5ldmFsRGVmKGRlZik7XG4gICAgLy8gICBpZiAodXRpbC5pc0JsYW5rKGRlZi5rZXkpKSB7XG4gICAgLy8gICAgIHZhbHVlID0gZGVmLnZhbHVlO1xuICAgIC8vICAgfVxuICAgIC8vICAgY2hpbGRGaWVsZCA9IG5ldyBGaWVsZChmaWVsZC5mb3JtLCBkZWYsIHZhbHVlLCBmaWVsZCk7XG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gcmV0dXJuIGNoaWxkRmllbGQ7XG4gIH07XG5cbiAgLy8gR2l2ZW4gYSB2YWx1ZSwgZmluZCBhbiBhcHByb3ByaWF0ZSBmaWVsZCBkZWZpbml0aW9uIGZvciB0aGlzIGZpZWxkLlxuICBwcm90by5pdGVtRm9yVmFsdWUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzO1xuXG4gICAgdmFyIGl0ZW0gPSBfLmZpbmQoZmllbGQuaXRlbXMoKSwgZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHJldHVybiB1dGlsLml0ZW1NYXRjaGVzVmFsdWUoaXRlbSwgdmFsdWUpO1xuICAgIH0pO1xuICAgIGlmIChpdGVtKSB7XG4gICAgICBpdGVtID0gXy5leHRlbmQoe30sIGl0ZW0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBpdGVtID0gdXRpbC5maWVsZERlZkZyb21WYWx1ZSh2YWx1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGl0ZW07XG4gIH07XG5cbiAgLy8gR2V0IGFsbCB0aGUgZmllbGRzIGJlbG9uZ2luZyB0byBhIGdyb3VwLlxuICBwcm90by5ncm91cEZpZWxkcyA9IGZ1bmN0aW9uIChncm91cE5hbWUsIGlnbm9yZVRlbXBDaGlsZHJlbikge1xuICAgIHZhciBmaWVsZCA9IHRoaXM7XG5cbiAgICBpZiAoIWZpZWxkLmdyb3Vwc1tncm91cE5hbWVdKSB7XG4gICAgICBmaWVsZC5ncm91cHNbZ3JvdXBOYW1lXSA9IFtdO1xuXG4gICAgICBpZiAoZmllbGQucGFyZW50KSB7XG4gICAgICAgIHZhciBzaWJsaW5ncyA9IGZpZWxkLnBhcmVudC5maWVsZHMoKTtcbiAgICAgICAgc2libGluZ3MuZm9yRWFjaChmdW5jdGlvbiAoc2libGluZykge1xuICAgICAgICAgIGlmIChzaWJsaW5nICE9PSBmaWVsZCAmJiBzaWJsaW5nLmRlZi5ncm91cCA9PT0gZ3JvdXBOYW1lKSB7XG4gICAgICAgICAgICBmaWVsZC5ncm91cHNbZ3JvdXBOYW1lXS5wdXNoKHNpYmxpbmcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBwYXJlbnRHcm91cEZpZWxkcyA9IGZpZWxkLnBhcmVudC5ncm91cEZpZWxkcyhncm91cE5hbWUsIHRydWUpO1xuICAgICAgICBmaWVsZC5ncm91cHNbZ3JvdXBOYW1lXSA9IGZpZWxkLmdyb3Vwc1tncm91cE5hbWVdLmNvbmNhdChwYXJlbnRHcm91cEZpZWxkcyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFpZ25vcmVUZW1wQ2hpbGRyZW4gJiYgZmllbGQuZ3JvdXBzW2dyb3VwTmFtZV0ubGVuZ3RoID09PSAwKSB7XG4gICAgICAvLyBsb29raW5nIGF0IGNoaWxkcmVuIHNvIGZhclxuICAgICAgdmFyIGNoaWxkR3JvdXBGaWVsZHMgPSBbXTtcbiAgICAgIGZpZWxkLnRlbXBDaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uIChjaGlsZCkge1xuICAgICAgICBpZiAoY2hpbGQuZGVmLmdyb3VwID09PSBncm91cE5hbWUpIHtcbiAgICAgICAgICBjaGlsZEdyb3VwRmllbGRzLnB1c2goY2hpbGQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBjaGlsZEdyb3VwRmllbGRzO1xuICAgIH1cblxuICAgIHJldHVybiBmaWVsZC5ncm91cHNbZ3JvdXBOYW1lXTtcbiAgfTtcblxuICAvLyBXYWxrIGJhY2t3YXJkcyB0aHJvdWdoIHBhcmVudHMgYW5kIGJ1aWxkIG91dCBhIHBhdGggYXJyYXkgdG8gdGhlIHZhbHVlLlxuICBwcm90by52YWx1ZVBhdGggPSBmdW5jdGlvbiAoY2hpbGRQYXRoKSB7XG4gICAgdmFyIGZpZWxkID0gdGhpcztcblxuICAgIHZhciBwYXRoID0gY2hpbGRQYXRoIHx8IFtdO1xuICAgIGlmICghdXRpbC5pc0JsYW5rKGZpZWxkLmRlZi5rZXkpKSB7XG4gICAgICBwYXRoID0gW2ZpZWxkLmRlZi5rZXldLmNvbmNhdChwYXRoKTtcbiAgICB9XG4gICAgaWYgKGZpZWxkLnBhcmVudCkge1xuICAgICAgcmV0dXJuIGZpZWxkLnBhcmVudC52YWx1ZVBhdGgocGF0aCk7XG4gICAgfVxuICAgIHJldHVybiBwYXRoO1xuICB9O1xuXG4gIC8vIFNldCB0aGUgdmFsdWUgZm9yIHRoaXMgZmllbGQuXG4gIHByb3RvLnZhbCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHZhciBmaWVsZCA9IHRoaXM7XG5cbiAgICBmaWVsZC5mb3JtLmFjdGlvbnMuc2V0VmFsdWUoZmllbGQudmFsdWVQYXRoKCksIHZhbHVlKTtcbiAgfTtcblxuICAvLyBSZW1vdmUgYSBjaGlsZCB2YWx1ZSBmcm9tIHRoaXMgZmllbGQuXG4gIHByb3RvLnJlbW92ZSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzO1xuXG4gICAgdmFyIHBhdGggPSBmaWVsZC52YWx1ZVBhdGgoKS5jb25jYXQoa2V5KTtcblxuICAgIGZpZWxkLmZvcm0uYWN0aW9ucy5yZW1vdmVWYWx1ZShwYXRoKTtcbiAgfTtcblxuICAvLyBNb3ZlIGEgY2hpbGQgdmFsdWUgZnJvbSBvbmUga2V5IHRvIGFub3RoZXIuXG4gIHByb3RvLm1vdmUgPSBmdW5jdGlvbiAoZnJvbUtleSwgdG9LZXkpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzO1xuXG4gICAgZmllbGQuZm9ybS5hY3Rpb25zLm1vdmVWYWx1ZShmaWVsZC52YWx1ZVBhdGgoKSwgZnJvbUtleSwgdG9LZXkpO1xuICB9O1xuXG4gIC8vIEdldCB0aGUgZGVmYXVsdCB2YWx1ZSBmb3IgdGhpcyBmaWVsZC5cbiAgcHJvdG8uZGVmYXVsdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzO1xuXG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKGZpZWxkLmRlZi52YWx1ZSkpIHtcbiAgICAgIHJldHVybiB1dGlsLmNvcHlWYWx1ZShmaWVsZC5kZWYudmFsdWUpO1xuICAgIH1cblxuICAgIGlmICghXy5pc1VuZGVmaW5lZChmaWVsZC5kZWYuZGVmYXVsdCkpIHtcbiAgICAgIHJldHVybiB1dGlsLmNvcHlWYWx1ZShmaWVsZC5kZWYuZGVmYXVsdCk7XG4gICAgfVxuXG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKGZpZWxkLnR5cGVQbHVnaW4oKS5kZWZhdWx0KSkge1xuICAgICAgcmV0dXJuIHV0aWwuY29weVZhbHVlKGZpZWxkLnR5cGVQbHVnaW4oKS5kZWZhdWx0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcblxuICAvLyBBcHBlbmQgYSBuZXcgdmFsdWUuIFVzZSB0aGUgYGl0ZW1JbmRleGAgdG8gZ2V0IGFuIGFwcHJvcHJpYXRlXG4gIC8vIGl0ZW0sIGluZmxhdGUgaXQsIGFuZCBjcmVhdGUgYSBkZWZhdWx0IHZhbHVlLlxuICBwcm90by5hcHBlbmQgPSBmdW5jdGlvbiAoaXRlbUluZGV4KSB7XG4gICAgdmFyIGZpZWxkID0gdGhpcztcblxuICAgIHZhciBpdGVtID0gZmllbGQuaXRlbXMoKVtpdGVtSW5kZXhdO1xuICAgIGl0ZW0gPSBfLmV4dGVuZChpdGVtKTtcblxuICAgIGl0ZW0ua2V5ID0gZmllbGQudmFsdWUubGVuZ3RoO1xuXG4gICAgdmFyIGNoaWxkID0gZmllbGQuY3JlYXRlQ2hpbGQoaXRlbSk7XG5cbiAgICB2YXIgb2JqID0gY2hpbGQuZGVmYXVsdCgpO1xuXG4gICAgaWYgKF8uaXNBcnJheShvYmopIHx8IF8uaXNPYmplY3Qob2JqKSkge1xuICAgICAgdmFyIGNob3AgPSBmaWVsZC52YWx1ZVBhdGgoKS5sZW5ndGggKyAxO1xuXG4gICAgICBjaGlsZC5pbmZsYXRlKGZ1bmN0aW9uIChwYXRoLCB2YWx1ZSkge1xuICAgICAgICBvYmogPSB1dGlsLnNldEluKG9iaiwgcGF0aC5zbGljZShjaG9wKSwgdmFsdWUpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZmllbGQuZm9ybS5hY3Rpb25zLmFwcGVuZFZhbHVlKGZpZWxkLnZhbHVlUGF0aCgpLCBvYmopO1xuICB9O1xuXG4gIC8vIERldGVybWluZSB3aGV0aGVyIHRoZSBmaWVsZCBpcyBoaWRkZW4uXG4gIHByb3RvLmhpZGRlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzO1xuXG4gICAgcmV0dXJuIGZpZWxkLmRlZi5oaWRkZW4gfHwgZmllbGQudHlwZVBsdWdpbigpLmhpZGRlbjtcbiAgfTtcblxuICAvLyBFeHBhbmQgYWxsIGNoaWxkIGZpZWxkcyBhbmQgY2FsbCB0aGUgc2V0dGVyIGZ1bmN0aW9uIHdpdGggdGhlIGRlZmF1bHRcbiAgLy8gdmFsdWVzIGF0IGVhY2ggcGF0aC5cbiAgcHJvdG8uaW5mbGF0ZSA9IGZ1bmN0aW9uIChvblNldFZhbHVlKSB7XG4gICAgdmFyIGZpZWxkID0gdGhpcztcblxuICAgIGlmICghdXRpbC5pc0JsYW5rKGZpZWxkLmRlZi5rZXkpICYmIF8uaXNVbmRlZmluZWQoZmllbGQudmFsdWUpKSB7XG4gICAgICBvblNldFZhbHVlKGZpZWxkLnZhbHVlUGF0aCgpLCBmaWVsZC5kZWZhdWx0KCkpO1xuICAgIH1cblxuICAgIHZhciBmaWVsZHMgPSBmaWVsZC5maWVsZHMoKTtcblxuICAgIGZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uIChjaGlsZCkge1xuICAgICAgY2hpbGQuaW5mbGF0ZShvblNldFZhbHVlKTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBDYWxsZWQgZnJvbSB1bm1vdW50LiBXaGVuIGZpZWxkcyBhcmUgcmVtb3ZlZCBmb3Igd2hhdGV2ZXIgcmVhc29uLCB3ZVxuICAvLyBzaG91bGQgZGVsZXRlIHRoZSBjb3JyZXNwb25kaW5nIHZhbHVlLlxuICBwcm90by5lcmFzZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzO1xuICAgIGlmICghdXRpbC5pc0JsYW5rKGZpZWxkLmRlZi5rZXkpICYmICFfLmlzVW5kZWZpbmVkKGZpZWxkLnZhbHVlKSkge1xuICAgICAgZmllbGQuZm9ybS5hY3Rpb25zLmVyYXNlVmFsdWUoZmllbGQudmFsdWVQYXRoKCksIHt9KTtcbiAgICB9XG4gIH07XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIvLyAjIGNvcmUuZm9ybS1pbml0XG5cbi8qXG5UaGlzIHBsdWdpbiBtYWtlcyBpdCBlYXN5IHRvIGhvb2sgaW50byBmb3JtIGluaXRpYWxpemF0aW9uLCB3aXRob3V0IGhhdmluZyB0b1xuY29uZmlndXJlIGFsbCB0aGUgb3RoZXIgY29yZSBwbHVnaW5zLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICB2YXIgaW5pdFBsdWdpbnMgPSBwbHVnaW4ucmVxdWlyZUFsbChwbHVnaW4uY29uZmlnLmluaXQpO1xuXG4gIHZhciBwcm90byA9IHBsdWdpbi5leHBvcnRzO1xuXG4gIHByb3RvLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGZvcm0gPSB0aGlzO1xuXG4gICAgaW5pdFBsdWdpbnMuZm9yRWFjaChmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgICBwbHVnaW4uYXBwbHkoZm9ybSwgYXJndW1lbnRzKTtcbiAgICB9KTtcbiAgfTtcbn07XG4iLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvcmUuZm9ybVxuXG4vKlxuVGhlIGNvcmUgZm9ybSBwbHVnaW4gc3VwcGxpZXMgbWV0aG9kcyB0aGF0IGdldCBhZGRlZCB0byB0aGUgRm9ybSBwcm90b3R5cGUuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xudmFyIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50ZW1pdHRlcjMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgdmFyIHByb3RvID0gcGx1Z2luLmV4cG9ydHM7XG5cbiAgLy8gR2V0IHRoZSBzdG9yZSBwbHVnaW4uXG4gIHZhciBjcmVhdGVTdG9yZSA9IHBsdWdpbi5yZXF1aXJlKHBsdWdpbi5jb25maWcuc3RvcmUpO1xuXG4gIHZhciB1dGlsID0gcGx1Z2luLnJlcXVpcmUoJ3V0aWwnKTtcbiAgdmFyIGxvYWRlciA9IHBsdWdpbi5yZXF1aXJlKCdsb2FkZXInKTtcblxuICAvLyBIZWxwZXIgdG8gY3JlYXRlIGFjdGlvbnMsIHdoaWNoIHdpbGwgdGVsbCB0aGUgc3RvcmUgdGhhdCBzb21ldGhpbmcgaGFzXG4gIC8vIGhhcHBlbmVkLiBOb3RlIHRoYXQgYWN0aW9ucyBnbyBzdHJhaWdodCB0byB0aGUgc3RvcmUuIE5vIGV2ZW50cyxcbiAgLy8gZGlzcGF0Y2hlciwgZXRjLlxuICB2YXIgY3JlYXRlU3luY0FjdGlvbnMgPSBmdW5jdGlvbiAoc3RvcmUsIG5hbWVzKSB7XG4gICAgdmFyIGFjdGlvbnMgPSB7fTtcbiAgICBuYW1lcy5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICBhY3Rpb25zW25hbWVdID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBzdG9yZVtuYW1lXS5hcHBseShzdG9yZSwgYXJndW1lbnRzKTtcbiAgICAgIH07XG4gICAgfSk7XG4gICAgcmV0dXJuIGFjdGlvbnM7XG4gIH07XG5cbiAgLy8gSW5pdGlhbGl6ZSB0aGUgZm9ybSBpbnN0YW5jZS5cbiAgcHJvdG8uaW5pdCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgdmFyIGZvcm0gPSB0aGlzO1xuXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICAvLyBOZWVkIGFuIGVtaXR0ZXIgdG8gZW1pdCBjaGFuZ2UgZXZlbnRzIGZyb20gdGhlIHN0b3JlLlxuICAgIHZhciBzdG9yZUVtaXR0ZXIgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgICAvLyBDcmVhdGUgYSBzdG9yZS5cbiAgICBmb3JtLnN0b3JlID0gY3JlYXRlU3RvcmUoZm9ybSwgc3RvcmVFbWl0dGVyLCBvcHRpb25zKTtcblxuICAgIC8vIENyZWF0ZSB0aGUgYWN0aW9ucyB0byBub3RpZnkgdGhlIHN0b3JlIG9mIGNoYW5nZXMuXG4gICAgZm9ybS5hY3Rpb25zID0gY3JlYXRlU3luY0FjdGlvbnMoZm9ybS5zdG9yZSwgWydzZXRWYWx1ZScsICdzZXRGaWVsZHMnLCAncmVtb3ZlVmFsdWUnLCAnYXBwZW5kVmFsdWUnLCAnbW92ZVZhbHVlJywgJ2VyYXNlVmFsdWUnLCAnc2V0TWV0YSddKTtcblxuICAgIC8vIFNlZWQgdGhlIHZhbHVlIGZyb20gYW55IGZpZWxkcy5cbiAgICBmb3JtLnN0b3JlLmluZmxhdGUoKTtcblxuICAgIC8vIEFkZCBvbi9vZmYgdG8gZ2V0IGNoYW5nZSBldmVudHMgZnJvbSBmb3JtLlxuICAgIGZvcm0ub24gPSBzdG9yZUVtaXR0ZXIub24uYmluZChzdG9yZUVtaXR0ZXIpO1xuICAgIGZvcm0ub2ZmID0gc3RvcmVFbWl0dGVyLm9mZi5iaW5kKHN0b3JlRW1pdHRlcik7XG4gICAgZm9ybS5vbmNlID0gc3RvcmVFbWl0dGVyLm9uY2UuYmluZChzdG9yZUVtaXR0ZXIpO1xuICB9O1xuXG4gIC8vIEdldCB0aGUgcm9vdCBjb21wb25lbnQgZm9yIGEgZm9ybS5cbiAgcHJvdG8uY29tcG9uZW50ID0gZnVuY3Rpb24gKHByb3BzKSB7XG5cbiAgICB2YXIgZm9ybSA9IHRoaXM7XG5cbiAgICBwcm9wcyA9IF8uZXh0ZW5kKHt9LCBwcm9wcywge1xuICAgICAgZm9ybTogZm9ybVxuICAgIH0pO1xuXG4gICAgdmFyIGNvbXBvbmVudCA9IHBsdWdpbi5jb21wb25lbnQoJ2Zvcm1hdGljJyk7XG5cbiAgICByZXR1cm4gY29tcG9uZW50KHByb3BzKTtcbiAgfTtcblxuICAvLyBHZXQgb3Igc2V0IHRoZSB2YWx1ZSBvZiBhIGZvcm0uXG4gIHByb3RvLnZhbCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHZhciBmb3JtID0gdGhpcztcblxuICAgIGlmICghXy5pc1VuZGVmaW5lZCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBmb3JtLmFjdGlvbnMuc2V0VmFsdWUodmFsdWUpO1xuICAgIH1cblxuICAgIHJldHVybiB1dGlsLmNvcHlWYWx1ZShmb3JtLnN0b3JlLnZhbHVlKTtcbiAgfTtcblxuICAvLyBTZXQvY2hhbmdlIHRoZSBmaWVsZHMgZm9yIGEgZm9ybS5cbiAgcHJvdG8uZmllbGRzID0gZnVuY3Rpb24gKGZpZWxkcykge1xuICAgIHZhciBmb3JtID0gdGhpcztcblxuICAgIGZvcm0uYWN0aW9ucy5zZXRGaWVsZHMoZmllbGRzKTtcbiAgfTtcblxuICAvLyBGaW5kIGEgZmllbGQgdGVtcGxhdGUgZ2l2ZW4gYSBrZXkuXG4gIHByb3RvLmZpbmREZWYgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIGZvcm0gPSB0aGlzO1xuXG4gICAgcmV0dXJuIGZvcm0uc3RvcmUudGVtcGxhdGVNYXBba2V5XSB8fCBudWxsO1xuICB9O1xuXG4gIC8vIEdldCBvciBzZXQgbWV0YWRhdGEuXG4gIHByb3RvLm1ldGEgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgIHZhciBmb3JtID0gdGhpcztcblxuICAgIGlmICghXy5pc1VuZGVmaW5lZCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBmb3JtLmFjdGlvbnMuc2V0TWV0YShrZXksIHZhbHVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZm9ybS5zdG9yZS5tZXRhW2tleV07XG4gIH07XG5cbiAgLy8gTG9hZCBtZXRhZGF0YS5cbiAgcHJvdG8ubG9hZE1ldGEgPSBmdW5jdGlvbiAoc291cmNlLCBwYXJhbXMpIHtcbiAgICBwYXJhbXMgPSBwYXJhbXMgfHwge307XG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhwYXJhbXMpO1xuICAgIHZhciB2YWxpZEtleXMgPSBrZXlzLmZpbHRlcihmdW5jdGlvbiAoa2V5KSB7XG4gICAgICByZXR1cm4gcGFyYW1zW2tleV07XG4gICAgfSk7XG4gICAgaWYgKHZhbGlkS2V5cy5sZW5ndGggPCBrZXlzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsb2FkZXIubG9hZE1ldGEodGhpcywgc291cmNlLCBwYXJhbXMpO1xuICB9O1xuXG4gIC8vIEFkZCBhIG1ldGRhdGEgc291cmNlIGZ1bmN0aW9uLCB2aWEgdGhlIGxvYWRlciBwbHVnaW4uXG4gIHByb3RvLnNvdXJjZSA9IGxvYWRlci5zb3VyY2U7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvcmUuZm9ybWF0aWNcblxuLypcblRoZSBjb3JlIGZvcm1hdGljIHBsdWdpbiBhZGRzIG1ldGhvZHMgdG8gdGhlIGZvcm1hdGljIGluc3RhbmNlLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgdmFyIGYgPSBwbHVnaW4uZXhwb3J0cztcblxuICAvLyBVc2UgdGhlIGZpZWxkLXJvdXRlciBwbHVnaW4gYXMgdGhlIHJvdXRlci5cbiAgdmFyIHJvdXRlciA9IHBsdWdpbi5yZXF1aXJlKCdmaWVsZC1yb3V0ZXInKTtcblxuICAvLyBSb3V0ZSBhIGZpZWxkIHRvIGEgY29tcG9uZW50LlxuICBmLnJvdXRlID0gcm91dGVyLnJvdXRlO1xuXG4gIC8vIFJlbmRlciBhIGNvbXBvbmVudCB0byBhIG5vZGUuXG4gIGYucmVuZGVyID0gZnVuY3Rpb24gKGNvbXBvbmVudCwgbm9kZSkge1xuXG4gICAgUmVhY3QucmVuZGVyQ29tcG9uZW50KGNvbXBvbmVudCwgbm9kZSk7XG4gIH07XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBpbGVyXG5cbi8vIFRoZSBjb21waWxlciBwbHVnaW4ga25vd3MgaG93IHRvIG5vcm1hbGl6ZSBmaWVsZCBkZWZpbml0aW9ucyBpbnRvIHN0YW5kYXJkXG4vLyBmaWVsZCBkZWZpbml0aW9ucyB0aGF0IGNhbiBiZSB1bmRlcnN0b29kIGJlIHJvdXRlcnMgYW5kIGNvbXBvbmVudHMuXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIC8vIEdyYWIgYWxsIHRoZSBjb21waWxlciBwbHVnaW5zIHdoaWNoIGNhbiBiZSBzdGFja2VkLlxuICB2YXIgY29tcGlsZXJQbHVnaW5zID0gcGx1Z2luLnJlcXVpcmVBbGwocGx1Z2luLmNvbmZpZy5jb21waWxlcnMpO1xuXG4gIHZhciB1dGlsID0gcGx1Z2luLnJlcXVpcmUoJ3V0aWwnKTtcblxuICB2YXIgY29tcGlsZXIgPSBwbHVnaW4uZXhwb3J0cztcblxuICAvLyBGb3IgYSBzZXQgb2YgZmllbGRzLCBtYWtlIGEgbWFwIG9mIHRlbXBsYXRlIG5hbWVzIHRvIGZpZWxkIGRlZmluaXRpb25zLiBBbGxcbiAgLy8gZmllbGQgZGVmaW5pdGlvbnMgY2FuIGJlIHVzZWQgYXMgdGVtcGxhdGVzLCB3aGV0aGVyIG1hcmtlZCBhcyB0ZW1wbGF0ZXMgb3JcbiAgLy8gbm90LlxuICBjb21waWxlci50ZW1wbGF0ZU1hcCA9IGZ1bmN0aW9uIChmaWVsZHMpIHtcbiAgICB2YXIgbWFwID0ge307XG4gICAgZmllbGRzLmZvckVhY2goZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICBpZiAoZmllbGQua2V5KSB7XG4gICAgICAgIG1hcFtmaWVsZC5rZXldID0gZmllbGQ7XG4gICAgICB9XG4gICAgICBpZiAoZmllbGQuaWQpIHtcbiAgICAgICAgbWFwW2ZpZWxkLmlkXSA9IGZpZWxkO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBtYXA7XG4gIH07XG5cbiAgLy8gRmllbGRzIGFuZCBpdGVtcyBjYW4gZXh0ZW5kIG90aGVyIGZpZWxkIGRlZmluaXRpb25zLiBGaWVsZHMgY2FuIGFsc28gaGF2ZVxuICAvLyBjaGlsZCBmaWVsZHMgdGhhdCBwb2ludCB0byBvdGhlciBmaWVsZCBkZWZpbml0aW9ucy4gSGVyZSwgd2UgZXhwYW5kIGFsbFxuICAvLyB0aG9zZSBvdXQgc28gdGhhdCBjb21wb25lbnRzIGRvbid0IGhhdmUgdG8gd29ycnkgYWJvdXQgdGhpcy5cbiAgY29tcGlsZXIuZXhwYW5kRGVmID0gZnVuY3Rpb24gKGRlZiwgdGVtcGxhdGVNYXApIHtcbiAgICB2YXIgaXNUZW1wbGF0ZSA9IGRlZi50ZW1wbGF0ZTtcbiAgICB2YXIgZXh0ID0gZGVmLmV4dGVuZHM7XG4gICAgaWYgKF8uaXNTdHJpbmcoZXh0KSkge1xuICAgICAgZXh0ID0gW2V4dF07XG4gICAgfVxuICAgIGlmIChleHQpIHtcbiAgICAgIHZhciBiYXNlcyA9IGV4dC5tYXAoZnVuY3Rpb24gKGJhc2UpIHtcbiAgICAgICAgdmFyIHRlbXBsYXRlID0gdGVtcGxhdGVNYXBbYmFzZV07XG4gICAgICAgIGlmICghdGVtcGxhdGUpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RlbXBsYXRlICcgKyBiYXNlICsgJyBub3QgZm91bmQuJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlO1xuICAgICAgfSk7XG4gICAgICB2YXIgY2hhaW4gPSBbe31dLmNvbmNhdChiYXNlcy5yZXZlcnNlKCkuY29uY2F0KFtkZWZdKSk7XG4gICAgICBkZWYgPSBfLmV4dGVuZC5hcHBseShfLCBjaGFpbik7XG4gICAgfVxuICAgIGlmIChkZWYuZmllbGRzKSB7XG4gICAgICBkZWYuZmllbGRzID0gZGVmLmZpZWxkcy5tYXAoZnVuY3Rpb24gKGNoaWxkRGVmKSB7XG4gICAgICAgIGlmICghXy5pc1N0cmluZyhjaGlsZERlZikpIHtcbiAgICAgICAgICByZXR1cm4gY29tcGlsZXIuZXhwYW5kRGVmKGNoaWxkRGVmLCB0ZW1wbGF0ZU1hcCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNoaWxkRGVmO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChkZWYuaXRlbXMpIHtcbiAgICAgIGRlZi5pdGVtcyA9IGRlZi5pdGVtcy5tYXAoZnVuY3Rpb24gKGl0ZW1EZWYpIHtcbiAgICAgICAgaWYgKCFfLmlzU3RyaW5nKGl0ZW1EZWYpKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbXBpbGVyLmV4cGFuZERlZihpdGVtRGVmLCB0ZW1wbGF0ZU1hcCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGl0ZW1EZWY7XG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKCFpc1RlbXBsYXRlICYmIGRlZi50ZW1wbGF0ZSkge1xuICAgICAgZGVsZXRlIGRlZi50ZW1wbGF0ZTtcbiAgICB9XG4gICAgcmV0dXJuIGRlZjtcbiAgfTtcblxuICAvLyBGb3IgYW4gYXJyYXkgb2YgZmllbGQgZGVmaW5pdGlvbnMsIGV4cGFuZCBlYWNoIGZpZWxkIGRlZmluaXRpb24uXG4gIGNvbXBpbGVyLmV4cGFuZEZpZWxkcyA9IGZ1bmN0aW9uIChmaWVsZHMpIHtcbiAgICB2YXIgdGVtcGxhdGVNYXAgPSBjb21waWxlci50ZW1wbGF0ZU1hcChmaWVsZHMpO1xuICAgIHJldHVybiBmaWVsZHMubWFwKGZ1bmN0aW9uIChkZWYpIHtcbiAgICAgIHJldHVybiBjb21waWxlci5leHBhbmREZWYoZGVmLCB0ZW1wbGF0ZU1hcCk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gUnVuIGEgZmllbGQgZGVmaW5pdGlvbiB0aHJvdWdoIGFsbCBhdmFpbGFibGUgY29tcGlsZXJzLlxuICBjb21waWxlci5jb21waWxlRGVmID0gZnVuY3Rpb24gKGRlZikge1xuXG4gICAgZGVmID0gdXRpbC5kZWVwQ29weShkZWYpO1xuXG4gICAgdmFyIHJlc3VsdDtcbiAgICBjb21waWxlclBsdWdpbnMuZm9yRWFjaChmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgICByZXN1bHQgPSBwbHVnaW4uY29tcGlsZShkZWYpO1xuICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICBkZWYgPSByZXN1bHQ7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgdHlwZVBsdWdpbiA9IHBsdWdpbi5yZXF1aXJlKCd0eXBlLicgKyBkZWYudHlwZSk7XG5cbiAgICBpZiAodHlwZVBsdWdpbi5jb21waWxlKSB7XG4gICAgICByZXN1bHQgPSB0eXBlUGx1Z2luLmNvbXBpbGUoZGVmKTtcbiAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgZGVmID0gcmVzdWx0O1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBkZWY7XG4gIH07XG5cbiAgLy8gRm9yIGFuIGFycmF5IG9mIGZpZWxkIGRlZmluaXRpb25zLCBjb21waWxlIGVhY2ggZmllbGQgZGVmaW5pdGlvbi5cbiAgY29tcGlsZXIuY29tcGlsZUZpZWxkcyA9IGZ1bmN0aW9uIChmaWVsZHMpIHtcbiAgICByZXR1cm4gZmllbGRzLm1hcChmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgIHJldHVybiBjb21waWxlci5jb21waWxlRGVmKGZpZWxkKTtcbiAgICB9KTtcbiAgfTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50XG5cbi8vIEF0IGl0cyBtb3N0IGJhc2ljIGxldmVsLCB0aGUgY29tcG9uZW50IHBsdWdpbiBzaW1wbHkgbWFwcyBjb21wb25lbnQgbmFtZXMgdG9cbi8vIHBsdWdpbiBuYW1lcywgcmV0dXJuaW5nIHRoZSBjb21wb25lbnQgZmFjdG9yeSBmb3IgdGhhdCBjb21wb25lbnQuIEZvclxuLy8gZXhhbXBsZSwgYHBsdWdpbi5jb21wb25lbnQoJ3RleHQnKWAgYmVjb21lc1xuLy8gYHBsdWdpbi5yZXF1aXJlKCdjb21wb25lbnQudGV4dCcpYC4gVGhpcyBpcyBhIHVzZWZ1bCBwbGFjaG9sZGVyIGluIGNhc2Ugd2Vcbi8vIGxhdGVyIHdhbnQgdG8gbWFrZSBmb3JtYXRpYyBhYmxlIHRvIGRlY2lkZSBjb21wb25lbnRzIGF0IHJ1bnRpbWUuIEZvciBub3csXG4vLyBob3dldmVyLCB0aGlzIGFsbG93cyB1cyB0byBpbmplY3QgXCJwcm9wIG1vZGlmaWVyc1wiIHdoaWNoIGFyZSBwbHVnaW5zIHRoYXRcbi8vIG1vZGlmeSBhIGNvbXBvbmVudHMgcHJvcGVydGllcyBiZWZvcmUgaXQgcmVjZWl2ZXMgdGhlbS5cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgLy8gUmVnaXN0cnkgZm9yIHByb3AgbW9kaWZpZXJzLlxuICB2YXIgcHJvcE1vZGlmaWVycyA9IHt9O1xuXG4gIC8vIEFkZCBhIFwicHJvcCBtb2RpZmVyXCIgd2hpY2ggaXMganVzdCBhIGZ1bmN0aW9uIHRoYXQgbW9kaWZpZXMgYSBjb21wb25lbnRzXG4gIC8vIHByb3BlcnRpZXMgYmVmb3JlIGl0IHJlY2VpdmVzIHRoZW0uXG4gIHZhciBhZGRQcm9wTW9kaWZpZXIgPSBmdW5jdGlvbiAobmFtZSwgbW9kaWZ5Rm4pIHtcbiAgICBpZiAoIXByb3BNb2RpZmllcnNbbmFtZV0pIHtcbiAgICAgIHByb3BNb2RpZmllcnNbbmFtZV0gPSBbXTtcbiAgICB9XG4gICAgcHJvcE1vZGlmaWVyc1tuYW1lXS5wdXNoKG1vZGlmeUZuKTtcbiAgfTtcblxuICAvLyBHcmFiIGFsbCB0aGUgcHJvcCBtb2RpZmllciBwbHVnaW5zLlxuICB2YXIgcHJvcHNQbHVnaW5zID0gcGx1Z2luLnJlcXVpcmVBbGwocGx1Z2luLmNvbmZpZy5wcm9wcyk7XG5cbiAgLy8gUmVnaXN0ZXIgYWxsIHRoZSBwcm9wIG1vZGlmaWVyIHBsdWdpbnMuXG4gIHByb3BzUGx1Z2lucy5mb3JFYWNoKGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICBhZGRQcm9wTW9kaWZpZXIuYXBwbHkobnVsbCwgcGx1Z2luKTtcbiAgfSk7XG5cbiAgLy8gUmVnaXN0cnkgZm9yIGNvbXBvbmVudCBmYWN0b3JpZXMuIFNpbmNlIHdlJ2xsIGJlIG1vZGlmeWluZyB0aGUgcHJvcHMgZ29pbmdcbiAgLy8gdG8gdGhlIGZhY3Rvcmllcywgd2UnbGwgc3RvcmUgb3VyIG93biBjb21wb25lbnQgZmFjdG9yaWVzIGhlcmUuXG4gIHZhciBjb21wb25lbnRGYWN0b3JpZXMgPSB7fTtcblxuICAvLyBSZXRyaWV2ZSB0aGUgYXBwcm9wcmlhdGUgY29tcG9uZW50IGZhY3RvcnksIHdoaWNoIG1heSBiZSBhIHdyYXBwZXIgdGhhdFxuICAvLyBydW5zIHRoZSBjb21wb25lbnQgcHJvcGVydGllcyB0aHJvdWdoIHByb3AgbW9kaWZpZXIgZnVuY3Rpb25zLlxuICBwbHVnaW4uZXhwb3J0cy5jb21wb25lbnQgPSBmdW5jdGlvbiAobmFtZSkge1xuXG4gICAgaWYgKCFjb21wb25lbnRGYWN0b3JpZXNbbmFtZV0pIHtcbiAgICAgIHZhciBjb21wb25lbnQgPSBSZWFjdC5jcmVhdGVGYWN0b3J5KHBsdWdpbi5yZXF1aXJlKCdjb21wb25lbnQuJyArIG5hbWUpKTtcbiAgICAgIGNvbXBvbmVudEZhY3Rvcmllc1tuYW1lXSA9IGZ1bmN0aW9uIChwcm9wcywgY2hpbGRyZW4pIHtcbiAgICAgICAgaWYgKHByb3BNb2RpZmllcnNbbmFtZV0pIHtcbiAgICAgICAgICBwcm9wTW9kaWZpZXJzW25hbWVdLmZvckVhY2goZnVuY3Rpb24gKG1vZGlmeSkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IG1vZGlmeShwcm9wcyk7XG4gICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgIHByb3BzID0gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb21wb25lbnQocHJvcHMsIGNoaWxkcmVuKTtcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBjb21wb25lbnRGYWN0b3JpZXNbbmFtZV07XG4gIH07XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvcmVcblxuLy8gVGhlIGNvcmUgcGx1Z2luIGV4cG9ydHMgYSBmdW5jdGlvbiB0aGF0IHRha2VzIGEgZm9ybWF0aWMgaW5zdGFuY2UgYW5kXG4vLyBleHRlbmRzIHRoZSBpbnN0YW5jZSB3aXRoIGFkZGl0aW9uYWwgbWV0aG9kcy5cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBmdW5jdGlvbiAoZm9ybWF0aWMpIHtcblxuICAgIC8vIFRoZSBjb3JlIHBsdWdpbiByZWFsbHkgZG9lc24ndCBkbyBtdWNoLiBJdCBhY3R1YWxseSByZWxpZXMgb24gb3RoZXJcbiAgICAvLyBwbHVnaW5zIHRvIGRvIHRoZSBkaXJ0eSB3b3JrLiBUaGlzIHdheSwgeW91IGNhbiBlYXNpbHkgYWRkIGFkZGl0aW9uYWxcbiAgICAvLyBwbHVnaW5zIHRvIGRvIG1vcmUgZGlydHkgd29yay5cbiAgICB2YXIgZm9ybWF0aWNQbHVnaW5zID0gcGx1Z2luLnJlcXVpcmVBbGwocGx1Z2luLmNvbmZpZy5mb3JtYXRpYyk7XG5cbiAgICAvLyBXZSBoYXZlIHNwZWNpYWwgZm9ybSBwbHVnaW5zIHdoaWNoIGFyZSBqdXN0IHVzZWQgdG8gbW9kaWZ5IHRoZSBGb3JtXG4gICAgLy8gcHJvdG90eXBlLlxuICAgIHZhciBmb3JtUGx1Z2lucyA9IHBsdWdpbi5yZXF1aXJlQWxsKHBsdWdpbi5jb25maWcuZm9ybSk7XG5cbiAgICAvLyBQYXNzIHRoZSBmb3JtYXRpYyBpbnN0YW5jZSBvZmYgdG8gZWFjaCBvZiB0aGUgZm9ybWF0aWMgcGx1Z2lucy5cbiAgICBmb3JtYXRpY1BsdWdpbnMuZm9yRWFjaChmdW5jdGlvbiAoZikge1xuICAgICAgXy5rZXlzKGYpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQoZm9ybWF0aWNba2V5XSkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Byb3BlcnR5IGFscmVhZHkgZGVmaW5lZCBmb3IgZm9ybWF0aWM6ICcgKyBrZXkpO1xuICAgICAgICB9XG4gICAgICAgIGZvcm1hdGljW2tleV0gPSBmW2tleV07XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vICMjIEZvcm0gcHJvdG90eXBlXG5cbiAgICAvLyBUaGUgRm9ybSBjb25zdHJ1Y3RvciBjcmVhdGVzIGEgZm9ybSBnaXZlbiBhIHNldCBvZiBvcHRpb25zLiBPcHRpb25zXG4gICAgLy8gY2FuIGhhdmUgYGZpZWxkc2AgYW5kIGB2YWx1ZWAuXG4gICAgdmFyIEZvcm0gPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgaWYgKHRoaXMuaW5pdCkge1xuICAgICAgICB0aGlzLmluaXQob3B0aW9ucyk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vIEFkZCB0aGUgZm9ybSBmYWN0b3J5IHRvIHRoZSBmb3JtYXRpYyBpbnN0YW5jZS5cbiAgICBmb3JtYXRpYy5mb3JtID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgIHJldHVybiBuZXcgRm9ybShvcHRpb25zKTtcbiAgICB9O1xuXG4gICAgRm9ybS5wcm90b3R5cGUgPSBmb3JtYXRpYy5mb3JtO1xuXG4gICAgLy8gS2VlcCBmb3JtIGluaXQgbWV0aG9kcyBoZXJlLlxuICAgIHZhciBpbml0cyA9IFtdO1xuXG4gICAgLy8gR28gdGhyb3VnaCBmb3JtIHBsdWdpbnMgYW5kIGFkZCBlYWNoIHBsdWdpbidzIG1ldGhvZHMgdG8gdGhlIGZvcm1cbiAgICAvLyBwcm90b3R5cGUuXG4gICAgZm9ybVBsdWdpbnMuZm9yRWFjaChmdW5jdGlvbiAocHJvdG8pIHtcbiAgICAgIF8ua2V5cyhwcm90bykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIC8vIEluaXQgcGx1Z2lucyBjYW4gYmUgc3RhY2tlZC5cbiAgICAgICAgaWYgKGtleSA9PT0gJ2luaXQnKSB7XG4gICAgICAgICAgaW5pdHMucHVzaChwcm90b1trZXldKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQoRm9ybS5wcm90b3R5cGVba2V5XSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUHJvcGVydHkgYWxyZWFkeSBkZWZpbmVkIGZvciBmb3JtOiAnICsga2V5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgRm9ybS5wcm90b3R5cGVba2V5XSA9IHByb3RvW2tleV07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gQ3JlYXRlIGFuIGluaXQgbWV0aG9kIGZvciB0aGUgZm9ybSBwcm90b3R5cGUgYmFzZWQgb24gdGhlIGF2YWlsYWJsZSBpbml0XG4gICAgLy8gbWV0aG9kcy5cbiAgICBpZiAoaW5pdHMubGVuZ3RoID09PSAwKSB7XG4gICAgICBGb3JtLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKCkge307XG4gICAgfSBlbHNlIGlmIChpbml0cy5sZW5ndGggPT09IDEpIHtcbiAgICAgIEZvcm0ucHJvdG90eXBlLmluaXQgPSBpbml0c1swXTtcbiAgICB9IGVsc2Uge1xuICAgICAgRm9ybS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGZvcm0gPSB0aGlzO1xuICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcblxuICAgICAgICBpbml0cy5mb3JFYWNoKGZ1bmN0aW9uIChpbml0KSB7XG4gICAgICAgICAgaW5pdC5hcHBseShmb3JtLCBhcmdzKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH1cbiAgfTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgZXZhbC1mdW5jdGlvbnNcblxuLypcbkRlZmF1bHQgZXZhbCBmdW5jdGlvbnMuIEVhY2ggZnVuY3Rpb24gaXMgcGFydCBvZiBpdHMgb3duIHBsdWdpbiwgYnV0IGFsbCBhcmVcbmtlcHQgdG9nZXRoZXIgaGVyZSBhcyBwYXJ0IG9mIGEgcGx1Z2luIGJ1bmRsZS5cblxuTm90ZSB0aGF0IGV2YWwgZnVuY3Rpb25zIGRlY2lkZSB3aGVuIHRoZWlyIGFyZ3VtZW50cyBnZXQgZXZhbHVhdGVkLiBUaGlzIHdheSxcbnlvdSBjYW4gY3JlYXRlIGNvbnRyb2wgc3RydWN0dXJlcyAobGlrZSBpZikgdGhhdCBjb25kaXRpb25hbGx5IGV2YWx1YXRlcyBpdHNcbmFyZ3VtZW50cy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbnZhciB3cmFwRm4gPSBmdW5jdGlvbiAoZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICBwbHVnaW4uZXhwb3J0cyA9IGZ1bmN0aW9uIChhcmdzLCBmaWVsZCwgY29udGV4dCkge1xuICAgICAgYXJncyA9IGZpZWxkLmV2YWwoYXJncywgY29udGV4dCk7XG4gICAgICB2YXIgcmVzdWx0ID0gZm4uYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH07XG59O1xuXG52YXIgbWV0aG9kQ2FsbCA9IGZ1bmN0aW9uIChtZXRob2QpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICBwbHVnaW4uZXhwb3J0cyA9IGZ1bmN0aW9uIChhcmdzLCBmaWVsZCwgY29udGV4dCkge1xuICAgICAgYXJncyA9IGZpZWxkLmV2YWwoYXJncywgY29udGV4dCk7XG4gICAgICBpZiAoYXJncy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldHVybiBhcmdzWzBdW21ldGhvZF0uYXBwbHkoYXJnc1swXSwgYXJncy5zbGljZSgxKSk7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcbn07XG5cbnZhciBwbHVnaW5zID0ge1xuICBpZjogZnVuY3Rpb24gKHBsdWdpbikge1xuICAgIHBsdWdpbi5leHBvcnRzID0gZnVuY3Rpb24gKGFyZ3MsIGZpZWxkLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gZmllbGQuZXZhbChhcmdzWzBdLCBjb250ZXh0KSA/IGZpZWxkLmV2YWwoYXJnc1sxXSwgY29udGV4dCkgOiBmaWVsZC5ldmFsKGFyZ3NbMl0sIGNvbnRleHQpO1xuICAgIH07XG4gIH0sXG5cbiAgZXE6IGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICBwbHVnaW4uZXhwb3J0cyA9IGZ1bmN0aW9uIChhcmdzLCBmaWVsZCwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIGZpZWxkLmV2YWwoYXJnc1swXSwgY29udGV4dCkgPT09IGZpZWxkLmV2YWwoYXJnc1sxXSwgY29udGV4dCk7XG4gICAgfTtcbiAgfSxcblxuICBub3Q6IGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICBwbHVnaW4uZXhwb3J0cyA9IGZ1bmN0aW9uIChhcmdzLCBmaWVsZCwgY29udGV4dCkge1xuICAgICAgcmV0dXJuICFmaWVsZC5ldmFsKGFyZ3NbMF0sIGNvbnRleHQpO1xuICAgIH07XG4gIH0sXG5cbiAgb3I6IGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICBwbHVnaW4uZXhwb3J0cyA9IGZ1bmN0aW9uIChhcmdzLCBmaWVsZCwgY29udGV4dCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBhcmcgPSBmaWVsZC5ldmFsKGFyZ3NbaV0sIGNvbnRleHQpO1xuICAgICAgICBpZiAoYXJnKSB7XG4gICAgICAgICAgcmV0dXJuIGFyZztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGFyZ3NbYXJncy5sZW5ndGggLSAxXTtcbiAgICB9O1xuICB9LFxuXG4gIGFuZDogZnVuY3Rpb24gKHBsdWdpbikge1xuICAgIHBsdWdpbi5leHBvcnRzID0gZnVuY3Rpb24gKGFyZ3MsIGZpZWxkLCBjb250ZXh0KSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGFyZyA9IGZpZWxkLmV2YWwoYXJnc1tpXSwgY29udGV4dCk7XG4gICAgICAgIGlmICghYXJnIHx8IGkgPT09IChhcmdzLmxlbmd0aCAtIDEpKSB7XG4gICAgICAgICAgcmV0dXJuIGFyZztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9O1xuICB9LFxuXG4gIGdldDogZnVuY3Rpb24gKHBsdWdpbikge1xuICAgIHZhciBnZXQgPSBwbHVnaW4uZXhwb3J0cyA9IGZ1bmN0aW9uIChhcmdzLCBmaWVsZCwgY29udGV4dCkge1xuICAgICAgdmFyIHV0aWwgPSBwbHVnaW4ucmVxdWlyZSgndXRpbCcpO1xuICAgICAgdmFyIGtleSA9IGZpZWxkLmV2YWwoYXJnc1swXSwgY29udGV4dCk7XG4gICAgICB2YXIgb2JqO1xuICAgICAgaWYgKGNvbnRleHQgJiYga2V5IGluIGNvbnRleHQpIHtcbiAgICAgICAgb2JqID0gY29udGV4dFtrZXldO1xuICAgICAgfSBlbHNlIGlmIChfLmlzT2JqZWN0KGZpZWxkLnZhbHVlKSAmJiBrZXkgaW4gZmllbGQudmFsdWUpIHtcbiAgICAgICAgb2JqID0gZmllbGQudmFsdWVba2V5XTtcbiAgICAgIH0gZWxzZSBpZiAoZmllbGQucGFyZW50KSB7XG4gICAgICAgIG9iaiA9IGdldChhcmdzLCBmaWVsZC5wYXJlbnQpO1xuICAgICAgfVxuICAgICAgaWYgKGFyZ3MubGVuZ3RoID4gMSkge1xuICAgICAgICB2YXIgZ2V0SW5LZXlzID0gZmllbGQuZXZhbChhcmdzLnNsaWNlKDEpLCBjb250ZXh0KTtcbiAgICAgICAgcmV0dXJuIHV0aWwuZ2V0SW4ob2JqLCBnZXRJbktleXMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG9iajtcbiAgICB9O1xuICB9LFxuXG4gIGdldEdyb3VwVmFsdWVzOiBmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgcGx1Z2luLmV4cG9ydHMgPSBmdW5jdGlvbiAoYXJncywgZmllbGQsIGNvbnRleHQpIHtcblxuICAgICAgdmFyIGdyb3VwTmFtZSA9IGZpZWxkLmV2YWwoYXJnc1swXSwgY29udGV4dCk7XG5cbiAgICAgIHZhciBncm91cEZpZWxkcyA9IGZpZWxkLmdyb3VwRmllbGRzKGdyb3VwTmFtZSk7XG5cbiAgICAgIHJldHVybiBncm91cEZpZWxkcy5tYXAoZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICAgIHJldHVybiBmaWVsZC52YWx1ZTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH0sXG5cbiAgZ2V0TWV0YTogZnVuY3Rpb24gKHBsdWdpbikge1xuICAgIHZhciB1dGlsID0gcGx1Z2luLnJlcXVpcmUoJ3V0aWwnKTtcbiAgICBwbHVnaW4uZXhwb3J0cyA9IGZ1bmN0aW9uIChhcmdzLCBmaWVsZCwgY29udGV4dCkge1xuICAgICAgYXJncyA9IGZpZWxkLmV2YWwoYXJncywgY29udGV4dCk7XG4gICAgICB2YXIgY2FjaGVLZXkgPSB1dGlsLm1ldGFDYWNoZUtleShhcmdzWzBdLCBhcmdzWzFdKTtcbiAgICAgIHJldHVybiBmaWVsZC5mb3JtLm1ldGEoY2FjaGVLZXkpO1xuICAgIH07XG4gIH0sXG5cbiAgc3VtOiBmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgcGx1Z2luLmV4cG9ydHMgPSBmdW5jdGlvbiAoYXJncywgZmllbGQsIGNvbnRleHQpIHtcbiAgICAgIHZhciBzdW0gPSAwO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHN1bSArPSBmaWVsZC5ldmFsKGFyZ3NbaV0sIGNvbnRleHQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN1bTtcbiAgICB9O1xuICB9LFxuXG4gIGZvckVhY2g6IGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICBwbHVnaW4uZXhwb3J0cyA9IGZ1bmN0aW9uIChhcmdzLCBmaWVsZCwgY29udGV4dCkge1xuICAgICAgdmFyIGl0ZW1OYW1lID0gYXJnc1swXTtcbiAgICAgIHZhciBhcnJheSA9IGZpZWxkLmV2YWwoYXJnc1sxXSwgY29udGV4dCk7XG4gICAgICB2YXIgbWFwRXhwciA9IGFyZ3NbMl07XG4gICAgICB2YXIgZmlsdGVyRXhwciA9IGFyZ3NbM107XG4gICAgICBjb250ZXh0ID0gT2JqZWN0LmNyZWF0ZShjb250ZXh0IHx8IHt9KTtcblxuICAgICAgdmFyIHJlc3VsdHMgPSBbXTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgaXRlbSA9IGFycmF5W2ldO1xuICAgICAgICBjb250ZXh0W2l0ZW1OYW1lXSA9IGl0ZW07XG4gICAgICAgIGlmIChfLmlzVW5kZWZpbmVkKGZpbHRlckV4cHIpIHx8IGZpZWxkLmV2YWwoZmlsdGVyRXhwciwgY29udGV4dCkpIHtcbiAgICAgICAgICByZXN1bHRzLnB1c2goZmllbGQuZXZhbChtYXBFeHByLCBjb250ZXh0KSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfTtcbiAgfSxcblxuICBjb25jYXQ6IG1ldGhvZENhbGwoJ2NvbmNhdCcpLFxuICBzcGxpdDogbWV0aG9kQ2FsbCgnc3BsaXQnKSxcbiAgcmV2ZXJzZTogbWV0aG9kQ2FsbCgncmV2ZXJzZScpLFxuICBqb2luOiBtZXRob2RDYWxsKCdqb2luJyksXG5cbiAgaHVtYW5pemU6IGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICB2YXIgdXRpbCA9IHBsdWdpbi5yZXF1aXJlKCd1dGlsJyk7XG4gICAgcGx1Z2luLmV4cG9ydHMgPSBmdW5jdGlvbiAoYXJncywgZmllbGQsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiB1dGlsLmh1bWFuaXplKGZpZWxkLmV2YWwoYXJnc1swXSwgY29udGV4dCkpO1xuICAgIH07XG4gIH0sXG5cbiAgcGljazogd3JhcEZuKF8ucGljayksXG4gIHBsdWNrOiB3cmFwRm4oXy5wbHVjaylcbn07XG5cbi8vIEJ1aWxkIGEgcGx1Z2luIGJ1bmRsZS5cbl8uZWFjaChwbHVnaW5zLCBmdW5jdGlvbiAoZm4sIG5hbWUpIHtcbiAgbW9kdWxlLmV4cG9ydHNbJ2V2YWwtZnVuY3Rpb24uJyArIG5hbWVdID0gZm47XG59KTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBldmFsXG5cbi8qXG5UaGUgZXZhbCBwbHVnaW4gd2lsbCBldmFsdWF0ZSBhIGZpZWxkJ3MgYGV2YWxgIHByb3BlcnR5ICh3aGljaCBtdXN0IGJlIGFuXG5vYmplY3QpIGFuZCBleGNoYW5nZSB0aGUgcHJvcGVydGllcyBvZiB0aGF0IG9iamVjdCBmb3Igd2hhdGV2ZXIgdGhlXG5leHByZXNzaW9uIHJldHVybnMuIEV4cHJlc3Npb25zIGFyZSBqdXN0IEpTT04gZXhjZXB0IGlmIHRoZSBmaXJzdCBlbGVtZW50IG9mXG5hbiBhcnJheSBpcyBhIHN0cmluZyB0aGF0IHN0YXJ0cyB3aXRoICdAJy4gSW4gdGhhdCBjYXNlLCB0aGUgYXJyYXkgaXNcbnRyZWF0ZWQgYXMgYSBMaXNwIGV4cHJlc3Npb24gd2hlcmUgdGhlIGZpcnN0IGVsZW1lbnQgcmVmZXJzIHRvIGEgZnVuY3Rpb25cbnRoYXQgaXMgY2FsbGVkIHdpdGggdGhlIHJlc3Qgb2YgdGhlIGVsZW1lbnRzIGFzIHRoZSBhcmd1bWVudHMuIEZvciBleGFtcGxlOlxuXG5gYGBqc1xuWydAc3VtJywgMSwgMl1cbmBgYFxuXG53aWxsIHJldHVybiB0aGUgdmFsdWUgMy4gVGhlIGV4cHJlc3Npb24gY291bGQgYmUgdXNlZCBpbiBhbiBgZXZhbGAgcHJvcGVydHkgb2ZcbmEgZmllbGQgbGlrZTpcblxuYGBganNcbntcbiAgdHlwZTogJ3N0cmluZycsXG4gIGtleTogJ25hbWUnLFxuICBldmFsOiB7XG4gICAgcm93czogWydAc3VtJywgMSwgMl1cbiAgfVxufVxuYGBgXG5cblRoZSBgcm93c2AgcHJvcGVydHkgb2YgdGhlIGZpZWxkIHdvdWxkIGJlIHNldCB0byAzIGluIHRoaXMgY2FzZS5cblxuQW55IHBsdWdpbiByZWdpc3RlcmVkIHdpdGggdGhlIHByZWZpeCBgZXZhbC1mdW5jdGlvbi5gIHdpbGwgYmUgYXZhaWxhYmxlIGFzIGFcbmZ1bmN0aW9uIGluIHRoZXNlIGV4cHJlc3Npb25zLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgLy8gR3JhYiBhbGwgdGhlIGZ1bmN0aW9uIHBsdWdpbnMuXG4gIHZhciBldmFsRnVuY3Rpb25QbHVnaW5zID0gcGx1Z2luLnJlcXVpcmVBbGxPZignZXZhbC1mdW5jdGlvbicpO1xuXG4gIC8vIEp1c3Qgc3RyaXAgb2ZmIHRoZSAnZXZhbC1mdW5jdGlvbnMuJyBwcmVmaXggYW5kIHB1dCBpbiBhIGRpZmZlcmVudCBvYmplY3QuXG4gIHZhciBmdW5jdGlvbnMgPSB7fTtcbiAgXy5lYWNoKGV2YWxGdW5jdGlvblBsdWdpbnMsIGZ1bmN0aW9uIChmbiwgbmFtZSkge1xuICAgIHZhciBmbk5hbWUgPSBuYW1lLnN1YnN0cmluZyhuYW1lLmluZGV4T2YoJy4nKSArIDEpO1xuICAgIGZ1bmN0aW9uc1tmbk5hbWVdID0gZm47XG4gIH0pO1xuXG4gIC8vIENoZWNrIGFuIGFycmF5IHRvIHNlZSBpZiBpdCdzIGEgZnVuY3Rpb24gZXhwcmVzc2lvbi5cbiAgdmFyIGlzRnVuY3Rpb25BcnJheSA9IGZ1bmN0aW9uIChhcnJheSkge1xuICAgIHJldHVybiBhcnJheS5sZW5ndGggPiAwICYmIGFycmF5WzBdWzBdID09PSAnQCc7XG4gIH07XG5cbiAgLy8gRXZhbHVhdGUgYSBmdW5jdGlvbiBleHByZXNzaW9uIGFuZCByZXR1cm4gdGhlIHJlc3VsdC5cbiAgdmFyIGV2YWxGdW5jdGlvbiA9IGZ1bmN0aW9uIChmbkFycmF5LCBmaWVsZCwgY29udGV4dCkge1xuICAgIHZhciBmbk5hbWUgPSBmbkFycmF5WzBdLnN1YnN0cmluZygxKTtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uc1tmbk5hbWVdKGZuQXJyYXkuc2xpY2UoMSksIGZpZWxkLCBjb250ZXh0KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoIShmbk5hbWUgaW4gZnVuY3Rpb25zKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0V2YWwgZnVuY3Rpb24gJyArIGZuTmFtZSArICcgbm90IGRlZmluZWQuJyk7XG4gICAgICB9XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfTtcblxuICAvLyBFdmFsdWF0ZSBhbiBleHByZXNzaW9uIGluIHRoZSBjb250ZXh0IG9mIGEgZmllbGQuXG4gIHZhciBldmFsdWF0ZSA9IGZ1bmN0aW9uIChleHByZXNzaW9uLCBmaWVsZCwgY29udGV4dCkge1xuICAgIGlmIChfLmlzQXJyYXkoZXhwcmVzc2lvbikpIHtcbiAgICAgIGlmIChpc0Z1bmN0aW9uQXJyYXkoZXhwcmVzc2lvbikpIHtcbiAgICAgICAgcmV0dXJuIGV2YWxGdW5jdGlvbihleHByZXNzaW9uLCBmaWVsZCwgY29udGV4dCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZXhwcmVzc2lvbi5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICByZXR1cm4gZXZhbHVhdGUoaXRlbSwgZmllbGQsIGNvbnRleHQpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKF8uaXNPYmplY3QoZXhwcmVzc2lvbikpIHtcbiAgICAgIHZhciBvYmogPSB7fTtcbiAgICAgIE9iamVjdC5rZXlzKGV4cHJlc3Npb24pLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gZXZhbHVhdGUoZXhwcmVzc2lvbltrZXldLCBmaWVsZCwgY29udGV4dCk7XG4gICAgICAgIGlmICh0eXBlb2YgcmVzdWx0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIG9ialtrZXldID0gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBvYmo7XG4gICAgfSBlbHNlIGlmIChfLmlzU3RyaW5nKGV4cHJlc3Npb24pICYmIGV4cHJlc3Npb25bMF0gPT09ICc9Jykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9ucy5nZXQoW2V4cHJlc3Npb24uc3Vic3RyaW5nKDEpXSwgZmllbGQsIGNvbnRleHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZXhwcmVzc2lvbjtcbiAgICB9XG4gIH07XG5cbiAgcGx1Z2luLmV4cG9ydHMuZXZhbHVhdGUgPSBldmFsdWF0ZTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgZmllbGQtcm91dGVyXG5cbi8qXG5GaWVsZHMgYW5kIGNvbXBvbmVudHMgZ2V0IGdsdWVkIHRvZ2V0aGVyIHZpYSByb3V0ZXMuIFRoaXMgaXMgc2ltaWxhciB0byBVUkxcbnJvdXRpbmcgd2hlcmUgYSByZXF1ZXN0IGdldHMgZHluYW1pY2FsbHkgcm91dGVkIHRvIGEgaGFuZGxlci4gVGhpcyBnaXZlcyBhIGxvdFxub2YgZmxleGliaWxpdHkgaW4gaW50cm9kdWNpbmcgbmV3IHR5cGVzIGFuZCBjb21wb25lbnRzLiBZb3UgY2FuIGNyZWF0ZSBhIG5ld1xudHlwZSBhbmQgcm91dGUgaXQgdG8gYW4gZXhpc3RpbmcgY29tcG9uZW50LCBvciB5b3UgY2FuIGNyZWF0ZSBhIG5ldyBjb21wb25lbnRcbmFuZCByb3V0ZSBleGlzdGluZyB0eXBlcyB0byBpdC4gT3IgeW91IGNhbiBjcmVhdGUgYm90aCBhbmQgcm91dGUgdGhlIG5ldyB0eXBlXG50byB0aGUgbmV3IGNvbXBvbmVudC4gTmV3IHJvdXRlcyBhcmUgYWRkZWQgdmlhIHJvdXRlIHBsdWdpbnMuIEEgcm91dGUgcGx1Z2luXG5zaW1wbHkgZXhwb3J0cyBhbiBhcnJheSBsaWtlOlxuXG5gYGBqc1xuW1xuICAnY29sb3InLCAvLyBSb3V0ZSB0aGlzIHR5cGVcbiAgJ2NvbG9yLXBpY2tlci13aXRoLWFscGhhJywgLy8gVG8gdGhpcyBjb21wb25lbnRcbiAgZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBmaWVsZC5kZWYuYWxwaGEgIT09ICd1bmRlZmluZWQnO1xuICB9XG5dXG5cblJvdXRlIHBsdWdpbnMgY2FuIGJlIHN0YWNrZWQgYW5kIGFyZSBzZW5zaXRpdmUgdG8gb3JkZXJpbmcuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICB2YXIgcm91dGVzID0ge307XG5cbiAgdmFyIHJvdXRlciA9IHBsdWdpbi5leHBvcnRzO1xuXG4gIC8vIEdldCBhbGwgdGhlIHJvdXRlIHBsdWdpbnMuXG4gIHZhciByb3V0ZVBsdWdpbnMgPSBwbHVnaW4ucmVxdWlyZUFsbChwbHVnaW4uY29uZmlnLnJvdXRlcyk7XG5cbiAgLy8gUmVnaXN0ZXIgYSByb3V0ZS5cbiAgcm91dGVyLnJvdXRlID0gZnVuY3Rpb24gKHR5cGVOYW1lLCBjb21wb25lbnROYW1lLCB0ZXN0Rm4pIHtcbiAgICBpZiAoIXJvdXRlc1t0eXBlTmFtZV0pIHtcbiAgICAgIHJvdXRlc1t0eXBlTmFtZV0gPSBbXTtcbiAgICB9XG4gICAgcm91dGVzW3R5cGVOYW1lXS5wdXNoKHtcbiAgICAgIGNvbXBvbmVudDogY29tcG9uZW50TmFtZSxcbiAgICAgIHRlc3Q6IHRlc3RGblxuICAgIH0pO1xuICB9O1xuXG4gIC8vIFJlZ2lzdGVyIGVhY2ggb2YgdGhlIHJvdXRlcyBwcm92aWRlZCBieSB0aGUgcm91dGUgcGx1Z2lucy5cbiAgcm91dGVQbHVnaW5zLmZvckVhY2goZnVuY3Rpb24gKHJvdXRlUGx1Z2luKSB7XG5cbiAgICByb3V0ZXIucm91dGUuYXBwbHkocm91dGVyLCByb3V0ZVBsdWdpbik7XG4gIH0pO1xuXG4gIC8vIERldGVybWluZSB0aGUgYmVzdCBjb21wb25lbnQgZm9yIGEgZmllbGQsIGJhc2VkIG9uIHRoZSByb3V0ZXMuXG4gIHJvdXRlci5jb21wb25lbnRGb3JGaWVsZCA9IGZ1bmN0aW9uIChmaWVsZCkge1xuXG4gICAgdmFyIHR5cGVOYW1lID0gZmllbGQuZGVmLnR5cGU7XG5cbiAgICBpZiAocm91dGVzW3R5cGVOYW1lXSkge1xuICAgICAgdmFyIHJvdXRlc0ZvclR5cGUgPSByb3V0ZXNbdHlwZU5hbWVdO1xuICAgICAgdmFyIHJvdXRlID0gXy5maW5kKHJvdXRlc0ZvclR5cGUsIGZ1bmN0aW9uIChyb3V0ZSkge1xuICAgICAgICByZXR1cm4gIXJvdXRlLnRlc3QgfHwgcm91dGUudGVzdChmaWVsZCk7XG4gICAgICB9KTtcbiAgICAgIGlmIChyb3V0ZSkge1xuICAgICAgICByZXR1cm4gcGx1Z2luLmNvbXBvbmVudChyb3V0ZS5jb21wb25lbnQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwbHVnaW4uaGFzQ29tcG9uZW50KHR5cGVOYW1lKSkge1xuICAgICAgcmV0dXJuIHBsdWdpbi5jb21wb25lbnQodHlwZU5hbWUpO1xuICAgIH1cblxuICAgIHRocm93IG5ldyBFcnJvcignTm8gY29tcG9uZW50IGZvciBmaWVsZDogJyArIEpTT04uc3RyaW5naWZ5KGZpZWxkLmRlZikpO1xuICB9O1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBmaWVsZC1yb3V0ZXNcblxuLypcbkRlZmF1bHQgcm91dGVzLiBFYWNoIHJvdXRlIGlzIHBhcnQgb2YgaXRzIG93biBwbHVnaW4sIGJ1dCBhbGwgYXJlIGtlcHQgdG9nZXRoZXJcbmhlcmUgYXMgcGFydCBvZiBhIHBsdWdpbiBidW5kbGUuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG52YXIgcm91dGVzID0ge1xuXG4gICdvYmplY3QuZGVmYXVsdCc6IFtcbiAgICAnb2JqZWN0JyxcbiAgICAnZmllbGRzZXQnXG4gIF0sXG5cbiAgJ3N0cmluZy5jaG9pY2VzJzogW1xuICAgICdzdHJpbmcnLFxuICAgICdzZWxlY3QnLFxuICAgIGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgcmV0dXJuIGZpZWxkLmRlZi5jaG9pY2VzID8gdHJ1ZSA6IGZhbHNlO1xuICAgIH1cbiAgXSxcblxuICAnc3RyaW5nLnRhZ3MnOiBbXG4gICAgJ3N0cmluZycsXG4gICAgJ3ByZXR0eS10ZXh0YXJlYScsXG4gICAgZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICByZXR1cm4gZmllbGQuZGVmLnJlcGxhY2VDaG9pY2VzO1xuICAgIH1cbiAgXSxcblxuICAnc3RyaW5nLnNpbmdsZS1saW5lJzogW1xuICAgICdzdHJpbmcnLFxuICAgICd0ZXh0JyxcbiAgICBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgIHJldHVybiBmaWVsZC5kZWYubWF4Um93cyA9PT0gMTtcbiAgICB9XG4gIF0sXG5cbiAgJ3N0cmluZy5kZWZhdWx0JzogW1xuICAgICdzdHJpbmcnLFxuICAgICd0ZXh0YXJlYSdcbiAgXSxcblxuICAnYXJyYXkuY2hvaWNlcyc6IFtcbiAgICAnYXJyYXknLFxuICAgICdjaGVja2JveC1saXN0JyxcbiAgICBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgIHJldHVybiBmaWVsZC5kZWYuY2hvaWNlcyA/IHRydWUgOiBmYWxzZTtcbiAgICB9XG4gIF0sXG5cbiAgJ2FycmF5LmRlZmF1bHQnOiBbXG4gICAgJ2FycmF5JyxcbiAgICAnbGlzdCdcbiAgXSxcblxuICAnYm9vbGVhbi5kZWZhdWx0JzogW1xuICAgICdib29sZWFuJyxcbiAgICAnc2VsZWN0J1xuICBdLFxuXG4gICdudW1iZXIuZGVmYXVsdCc6IFtcbiAgICAnbnVtYmVyJyxcbiAgICAndGV4dCdcbiAgXVxuXG59O1xuXG4vLyBCdWlsZCBhIHBsdWdpbiBidW5kbGUuXG5fLmVhY2gocm91dGVzLCBmdW5jdGlvbiAocm91dGUsIG5hbWUpIHtcbiAgbW9kdWxlLmV4cG9ydHNbJ2ZpZWxkLXJvdXRlLicgKyBuYW1lXSA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICBwbHVnaW4uZXhwb3J0cyA9IHJvdXRlO1xuICB9O1xufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIi8vICMgbG9hZGVyXG5cbi8qXG5XaGVuIG1ldGFkYXRhIGlzbid0IGF2YWlsYWJsZSwgd2UgYXNrIHRoZSBsb2FkZXIgdG8gbG9hZCBpdC4gVGhlIGxvYWRlciB3aWxsXG50cnkgdG8gZmluZCBhbiBhcHByb3ByaWF0ZSBzb3VyY2UgYmFzZWQgb24gdGhlIG1ldGFkYXRhIGtleXMuXG5cbk5vdGUgdGhhdCB3ZSBhc2sgdGhlIGxvYWRlciB0byBsb2FkIG1ldGFkYXRhIHdpdGggYSBzZXQgb2Yga2V5cyBsaWtlXG5gWydmb28nLCAnYmFyJ11gLCBidXQgdGhvc2UgYXJlIGNvbnZlcnRlZCB0byBhIHNpbmdsZSBrZXkgbGlrZSBgZm9vOjpiYXJgIGZvclxudGhlIHNha2Ugb2YgY2FjaGluZy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgdmFyIHV0aWwgPSBwbHVnaW4ucmVxdWlyZSgndXRpbCcpO1xuXG4gIHZhciBsb2FkZXIgPSBwbHVnaW4uZXhwb3J0cztcblxuICB2YXIgaXNMb2FkaW5nID0ge307XG4gIHZhciBzb3VyY2VzID0ge307XG5cbiAgLy8gTG9hZCBtZXRhZGF0YSBmb3IgYSBnaXZlbiBmb3JtIGFuZCBwYXJhbXMuXG4gIGxvYWRlci5sb2FkTWV0YSA9IGZ1bmN0aW9uIChmb3JtLCBzb3VyY2UsIHBhcmFtcykge1xuICAgIHZhciBjYWNoZUtleSA9IHV0aWwubWV0YUNhY2hlS2V5KHNvdXJjZSwgcGFyYW1zKTtcblxuICAgIGlmIChpc0xvYWRpbmdbY2FjaGVLZXldKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaXNMb2FkaW5nW2NhY2hlS2V5XSA9IHRydWU7XG5cbiAgICBsb2FkZXIubG9hZEFzeW5jRnJvbVNvdXJjZShmb3JtLCBzb3VyY2UsIHBhcmFtcyk7XG4gIH07XG5cbiAgLy8gTWFrZSBzdXJlIHRvIGxvYWQgbWV0YWRhdGEgYXN5bmNocm9ub3VzbHkuXG4gIGxvYWRlci5sb2FkQXN5bmNGcm9tU291cmNlID0gZnVuY3Rpb24gKGZvcm0sIHNvdXJjZSwgcGFyYW1zLCB3YWl0VGltZSkge1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgbG9hZGVyLmxvYWRGcm9tU291cmNlKGZvcm0sIHNvdXJjZSwgcGFyYW1zKTtcbiAgICB9LCB3YWl0VGltZSB8fCAwKTtcbiAgfTtcblxuICAvLyBMb2FkIG1ldGFkYXRhIGZvciBhIGZvcm0gYW5kIHBhcmFtcy5cbiAgbG9hZGVyLmxvYWRGcm9tU291cmNlID0gZnVuY3Rpb24gKGZvcm0sIHNvdXJjZU5hbWUsIHBhcmFtcykge1xuXG4gICAgLy8gRmluZCB0aGUgYmVzdCBzb3VyY2UgZm9yIHRoaXMgY2FjaGUga2V5LlxuICAgIHZhciBzb3VyY2UgPSBzb3VyY2VzW3NvdXJjZU5hbWVdO1xuICAgIGlmIChzb3VyY2UpIHtcblxuICAgICAgdmFyIGNhY2hlS2V5ID0gdXRpbC5tZXRhQ2FjaGVLZXkoc291cmNlTmFtZSwgcGFyYW1zKTtcblxuICAgICAgLy8gQ2FsbCB0aGUgc291cmNlIGZ1bmN0aW9uLlxuICAgICAgdmFyIHJlc3VsdCA9IHNvdXJjZS5jYWxsKG51bGwsIHBhcmFtcyk7XG5cbiAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgLy8gUmVzdWx0IGNvdWxkIGJlIGEgcHJvbWlzZS5cbiAgICAgICAgaWYgKHJlc3VsdC50aGVuKSB7XG4gICAgICAgICAgdmFyIHByb21pc2UgPSByZXN1bHQudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICBmb3JtLm1ldGEoY2FjaGVLZXksIHJlc3VsdCk7XG4gICAgICAgICAgICBpc0xvYWRpbmdbY2FjaGVLZXldID0gZmFsc2U7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICB2YXIgb25FcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlzTG9hZGluZ1tjYWNoZUtleV0gPSBmYWxzZTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgaWYgKHByb21pc2UuY2F0Y2gpIHtcbiAgICAgICAgICAgIHByb21pc2UuY2F0Y2gob25FcnJvcik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHNpbGx5IGpRdWVyeSBwcm9taXNlc1xuICAgICAgICAgICAgcHJvbWlzZS5mYWlsKG9uRXJyb3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgLy8gT3IgaXQgY291bGQgYmUgYSB2YWx1ZS4gSW4gdGhhdCBjYXNlLCBtYWtlIHN1cmUgdG8gYXN5bmNpZnkgaXQuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmb3JtLm1ldGEoY2FjaGVLZXksIHJlc3VsdCk7XG4gICAgICAgICAgICBpc0xvYWRpbmdbY2FjaGVLZXldID0gZmFsc2U7XG4gICAgICAgICAgfSwgMCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlzTG9hZGluZ1tjYWNoZUtleV0gPSBmYWxzZTtcbiAgICAgIH1cblxuICAgIH0gZWxzZSB7XG4gICAgICBpc0xvYWRpbmdbY2FjaGVLZXldID0gZmFsc2U7XG4gICAgfVxuICB9O1xuXG4gIC8vIFJlZ2lzdGVyIGEgc291cmNlIGZ1bmN0aW9uLlxuICBsb2FkZXIuc291cmNlID0gZnVuY3Rpb24gKG5hbWUsIGZuKSB7XG5cbiAgICBzb3VyY2VzW25hbWVdID0gZm47XG4gIH07XG5cbn07XG4iLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIHV0aWxcblxuLy8gU29tZSB1dGlsaXR5IGZ1bmN0aW9ucyB0byBiZSB1c2VkIGJ5IG90aGVyIHBsdWdpbnMuXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHZhciB1dGlsID0gcGx1Z2luLmV4cG9ydHM7XG5cbiAgLy8gQ2hlY2sgaWYgYSB2YWx1ZSBpcyBcImJsYW5rXCIuXG4gIHV0aWwuaXNCbGFuayA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSAnJztcbiAgfTtcblxuICAvLyBTZXQgdmFsdWUgYXQgc29tZSBwYXRoIGluIG9iamVjdC5cbiAgdXRpbC5zZXRJbiA9IGZ1bmN0aW9uIChvYmosIHBhdGgsIHZhbHVlKSB7XG4gICAgaWYgKF8uaXNTdHJpbmcocGF0aCkpIHtcbiAgICAgIHBhdGggPSBbcGF0aF07XG4gICAgfVxuICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgICBpZiAocGF0aC5sZW5ndGggPT09IDEpIHtcbiAgICAgIG9ialtwYXRoWzBdXSA9IHZhbHVlO1xuICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG4gICAgaWYgKCFvYmpbcGF0aFswXV0pIHtcbiAgICAgIG9ialtwYXRoWzBdXSA9IHt9O1xuICAgIH1cbiAgICB1dGlsLnNldEluKG9ialtwYXRoWzBdXSwgcGF0aC5zbGljZSgxKSwgdmFsdWUpO1xuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gUmVtb3ZlIHZhbHVlIGF0IHBhdGggaW4gc29tZSBvYmplY3QuXG4gIHV0aWwucmVtb3ZlSW4gPSBmdW5jdGlvbiAob2JqLCBwYXRoKSB7XG4gICAgaWYgKF8uaXNTdHJpbmcocGF0aCkpIHtcbiAgICAgIHBhdGggPSBbcGF0aF07XG4gICAgfVxuICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMSkge1xuICAgICAgaWYgKF8uaXNBcnJheShvYmopKSB7XG4gICAgICAgIGlmIChfLmlzTnVtYmVyKHBhdGhbMF0pKSB7XG4gICAgICAgICAgb2JqLnNwbGljZShwYXRoWzBdLCAxKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChfLmlzT2JqZWN0KG9iaikpIHtcbiAgICAgICAgZGVsZXRlIG9ialtwYXRoWzBdXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuICAgIGlmIChvYmpbcGF0aFswXV0pIHtcbiAgICAgIHV0aWwucmVtb3ZlSW4ob2JqW3BhdGhbMF1dLCBwYXRoLnNsaWNlKDEpKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBHZXQgdmFsdWUgYXQgcGF0aCBpbiBzb21lIG9iamVjdC5cbiAgdXRpbC5nZXRJbiA9IGZ1bmN0aW9uIChvYmosIHBhdGgpIHtcbiAgICBpZiAoXy5pc1N0cmluZyhwYXRoKSkge1xuICAgICAgcGF0aCA9IFtwYXRoXTtcbiAgICB9XG4gICAgaWYgKHBhdGgubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH1cbiAgICBpZiAoXy5pc09iamVjdChvYmopICYmIHBhdGhbMF0gaW4gb2JqKSB7XG4gICAgICByZXR1cm4gdXRpbC5nZXRJbihvYmpbcGF0aFswXV0sIHBhdGguc2xpY2UoMSkpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcblxuICAvLyBBcHBlbmQgdG8gYXJyYXkgYXQgcGF0aCBpbiBzb21lIG9iamVjdC5cbiAgdXRpbC5hcHBlbmRJbiA9IGZ1bmN0aW9uIChvYmosIHBhdGgsIHZhbHVlKSB7XG4gICAgdmFyIHN1Yk9iaiA9IHV0aWwuZ2V0SW4ob2JqLCBwYXRoKTtcbiAgICBpZiAoXy5pc0FycmF5KHN1Yk9iaikpIHtcbiAgICAgIHN1Yk9iai5wdXNoKHZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBTd2FwIHR3byBrZXlzIGF0IHBhdGggaW4gc29tZSBvYmplY3QuXG4gIHV0aWwubW92ZUluID0gZnVuY3Rpb24gKG9iaiwgcGF0aCwgZnJvbUtleSwgdG9LZXkpIHtcbiAgICB2YXIgc3ViT2JqID0gdXRpbC5nZXRJbihvYmosIHBhdGgpO1xuICAgIGlmIChfLmlzQXJyYXkoc3ViT2JqKSkge1xuICAgICAgaWYgKF8uaXNOdW1iZXIoZnJvbUtleSkgJiYgXy5pc051bWJlcih0b0tleSkpIHtcbiAgICAgICAgdmFyIGZyb21JbmRleCA9IGZyb21LZXk7XG4gICAgICAgIHZhciB0b0luZGV4ID0gdG9LZXk7XG4gICAgICAgIGlmIChmcm9tSW5kZXggIT09IHRvSW5kZXggJiZcbiAgICAgICAgICBmcm9tSW5kZXggPj0gMCAmJiBmcm9tSW5kZXggPCBzdWJPYmoubGVuZ3RoICYmXG4gICAgICAgICAgdG9JbmRleCA+PSAwICYmIHRvSW5kZXggPCBzdWJPYmoubGVuZ3RoXG4gICAgICAgICkge1xuICAgICAgICAgIHN1Yk9iai5zcGxpY2UodG9JbmRleCwgMCwgc3ViT2JqLnNwbGljZShmcm9tSW5kZXgsIDEpWzBdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZnJvbVZhbHVlID0gc3ViT2JqW2Zyb21LZXldO1xuICAgICAgc3ViT2JqW2Zyb21LZXldID0gc3ViT2JqW3RvS2V5XTtcbiAgICAgIHN1Yk9ialt0b0tleV0gPSBmcm9tVmFsdWU7XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gQ29weSBvYmosIGxlYXZpbmcgbm9uLUpTT04gYmVoaW5kLlxuICB1dGlsLmNvcHlWYWx1ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHZhbHVlKSk7XG4gIH07XG5cbiAgLy8gQ29weSBvYmogcmVjdXJzaW5nIGRlZXBseS5cbiAgdXRpbC5kZWVwQ29weSA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICBpZiAoXy5pc0FycmF5KG9iaikpIHtcbiAgICAgIHJldHVybiBvYmoubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgIHJldHVybiB1dGlsLmRlZXBDb3B5KGl0ZW0pO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChfLmlzT2JqZWN0KG9iaikpIHtcbiAgICAgIHZhciBjb3B5ID0ge307XG4gICAgICBfLmVhY2gob2JqLCBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgICBjb3B5W2tleV0gPSB1dGlsLmRlZXBDb3B5KHZhbHVlKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGNvcHk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuICB9O1xuXG4gIC8vIENoZWNrIGlmIGl0ZW0gbWF0Y2hlcyBzb21lIHZhbHVlLCBiYXNlZCBvbiB0aGUgaXRlbSdzIGBtYXRjaGAgcHJvcGVydHkuXG4gIHV0aWwuaXRlbU1hdGNoZXNWYWx1ZSA9IGZ1bmN0aW9uIChpdGVtLCB2YWx1ZSkge1xuICAgIHZhciBtYXRjaCA9IGl0ZW0ubWF0Y2g7XG4gICAgaWYgKCFtYXRjaCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBfLmV2ZXJ5KF8ua2V5cyhtYXRjaCksIGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHJldHVybiBfLmlzRXF1YWwobWF0Y2hba2V5XSwgdmFsdWVba2V5XSk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gQ3JlYXRlIGEgZmllbGQgZGVmaW5pdGlvbiBmcm9tIGEgdmFsdWUuXG4gIHV0aWwuZmllbGREZWZGcm9tVmFsdWUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YXIgZGVmID0ge1xuICAgICAgdHlwZTogJ2pzb24nXG4gICAgfTtcbiAgICBpZiAoXy5pc1N0cmluZyh2YWx1ZSkpIHtcbiAgICAgIGRlZiA9IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmIChfLmlzTnVtYmVyKHZhbHVlKSkge1xuICAgICAgZGVmID0ge1xuICAgICAgICB0eXBlOiAnbnVtYmVyJ1xuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKF8uaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgIHZhciBhcnJheUl0ZW1GaWVsZHMgPSB2YWx1ZS5tYXAoZnVuY3Rpb24gKHZhbHVlLCBpKSB7XG4gICAgICAgIHZhciBjaGlsZERlZiA9IHV0aWwuZmllbGREZWZGcm9tVmFsdWUodmFsdWUpO1xuICAgICAgICBjaGlsZERlZi5rZXkgPSBpO1xuICAgICAgICByZXR1cm4gY2hpbGREZWY7XG4gICAgICB9KTtcbiAgICAgIGRlZiA9IHtcbiAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgZmllbGRzOiBhcnJheUl0ZW1GaWVsZHNcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmIChfLmlzT2JqZWN0KHZhbHVlKSkge1xuICAgICAgdmFyIG9iamVjdEl0ZW1GaWVsZHMgPSBPYmplY3Qua2V5cyh2YWx1ZSkubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgdmFyIGNoaWxkRGVmID0gdXRpbC5maWVsZERlZkZyb21WYWx1ZSh2YWx1ZVtrZXldKTtcbiAgICAgICAgY2hpbGREZWYua2V5ID0ga2V5O1xuICAgICAgICBjaGlsZERlZi5sYWJlbCA9IHV0aWwuaHVtYW5pemUoa2V5KTtcbiAgICAgICAgcmV0dXJuIGNoaWxkRGVmO1xuICAgICAgfSk7XG4gICAgICBkZWYgPSB7XG4gICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICBmaWVsZHM6IG9iamVjdEl0ZW1GaWVsZHNcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmIChfLmlzTnVsbCh2YWx1ZSkpIHtcbiAgICAgIGRlZiA9IHtcbiAgICAgICAgdHlwZTogJ251bGwnXG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gZGVmO1xuICB9O1xuXG4gIGlmIChwbHVnaW4uY29uZmlnLmh1bWFuaXplKSB7XG4gICAgLy8gR2V0IHRoZSBodW1hbml6ZSBmdW5jdGlvbiBmcm9tIGEgcGx1Z2luIGlmIHByb3ZpZGVkLlxuICAgIHV0aWwuaHVtYW5pemUgPSBwbHVnaW4ucmVxdWlyZShwbHVnaW4uY29uZmlnLmh1bWFuaXplKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBDb252ZXJ0IHByb3BlcnR5IGtleXMgdG8gXCJodW1hblwiIGxhYmVscy4gRm9yIGV4YW1wbGUsICdmb28nIGJlY29tZXNcbiAgICAvLyAnRm9vJy5cbiAgICB1dGlsLmh1bWFuaXplID0gZnVuY3Rpb24ocHJvcGVydHkpIHtcbiAgICAgIHByb3BlcnR5ID0gcHJvcGVydHkucmVwbGFjZSgvXFx7XFx7L2csICcnKTtcbiAgICAgIHByb3BlcnR5ID0gcHJvcGVydHkucmVwbGFjZSgvXFx9XFx9L2csICcnKTtcbiAgICAgIHJldHVybiBwcm9wZXJ0eS5yZXBsYWNlKC9fL2csICcgJylcbiAgICAgICAgLnJlcGxhY2UoLyhcXHcrKS9nLCBmdW5jdGlvbihtYXRjaCkge1xuICAgICAgICAgIHJldHVybiBtYXRjaC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIG1hdGNoLnNsaWNlKDEpO1xuICAgICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgLy8gSm9pbiBtdWx0aXBsZSBDU1MgY2xhc3MgbmFtZXMgdG9nZXRoZXIsIGlnbm9yaW5nIGFueSB0aGF0IGFyZW4ndCB0aGVyZS5cbiAgdXRpbC5jbGFzc05hbWUgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY2xhc3NOYW1lcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCk7XG5cbiAgICBjbGFzc05hbWVzID0gY2xhc3NOYW1lcy5maWx0ZXIoZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgIHJldHVybiBuYW1lO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGNsYXNzTmFtZXMuam9pbignICcpO1xuICB9O1xuXG4gIC8vIEpvaW4ga2V5cyB0b2dldGhlciB0byBtYWtlIHNpbmdsZSBcIm1ldGFcIiBrZXkuIEZvciBsb29raW5nIHVwIG1ldGFkYXRhIGluXG4gIC8vIHRoZSBtZXRhZGF0YSBwYXJ0IG9mIHRoZSBzdG9yZS5cbiAgdXRpbC5qb2luTWV0YUtleXMgPSBmdW5jdGlvbiAoa2V5cykge1xuICAgIHJldHVybiBrZXlzLmpvaW4oJzo6Jyk7XG4gIH07XG5cbiAgLy8gU3BsaXQgYSBqb2luZWQga2V5IGludG8gc2VwYXJhdGUga2V5IHBhcnRzLlxuICB1dGlsLnNwbGl0TWV0YUtleSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4ga2V5LnNwbGl0KCc6OicpO1xuICB9O1xuXG4gIHV0aWwubWV0YUNhY2hlS2V5ID0gZnVuY3Rpb24gKHNvdXJjZSwgcGFyYW1zKSB7XG4gICAgcGFyYW1zID0gcGFyYW1zIHx8IHt9O1xuICAgIHJldHVybiBzb3VyY2UgKyAnOjpwYXJhbXMoJyArIEpTT04uc3RyaW5naWZ5KHBhcmFtcykgKyAnKSc7XG4gIH07XG5cbiAgLy8gV3JhcCBhIHRleHQgdmFsdWUgc28gaXQgaGFzIGEgdHlwZS4gRm9yIHBhcnNpbmcgdGV4dCB3aXRoIHRhZ3MuXG4gIHZhciB0ZXh0UGFydCA9IGZ1bmN0aW9uICh2YWx1ZSwgdHlwZSkge1xuICAgIHR5cGUgPSB0eXBlIHx8ICd0ZXh0JztcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogdHlwZSxcbiAgICAgIHZhbHVlOiB2YWx1ZVxuICAgIH07XG4gIH07XG5cbiAgLy8gUGFyc2UgdGV4dCB0aGF0IGhhcyB0YWdzIGxpa2Uge3t0YWd9fSBpbnRvIHRleHQgYW5kIHRhZ3MuXG4gIHV0aWwucGFyc2VUZXh0V2l0aFRhZ3MgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YWx1ZSA9IHZhbHVlIHx8ICcnO1xuICAgIHZhciBwYXJ0cyA9IHZhbHVlLnNwbGl0KC97eyg/IXspLyk7XG4gICAgdmFyIGZyb250UGFydCA9IFtdO1xuICAgIGlmIChwYXJ0c1swXSAhPT0gJycpIHtcbiAgICAgIGZyb250UGFydCA9IFtcbiAgICAgICAgdGV4dFBhcnQocGFydHNbMF0pXG4gICAgICBdO1xuICAgIH1cbiAgICBwYXJ0cyA9IGZyb250UGFydC5jb25jYXQoXG4gICAgICBwYXJ0cy5zbGljZSgxKS5tYXAoZnVuY3Rpb24gKHBhcnQpIHtcbiAgICAgICAgaWYgKHBhcnQuaW5kZXhPZignfX0nKSA+PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHRleHRQYXJ0KHBhcnQuc3Vic3RyaW5nKDAsIHBhcnQuaW5kZXhPZignfX0nKSksICd0YWcnKSxcbiAgICAgICAgICAgIHRleHRQYXJ0KHBhcnQuc3Vic3RyaW5nKHBhcnQuaW5kZXhPZignfX0nKSArIDIpKVxuICAgICAgICAgIF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRleHRQYXJ0KCd7eycgKyBwYXJ0LCAndGV4dCcpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICk7XG4gICAgcmV0dXJuIFtdLmNvbmNhdC5hcHBseShbXSwgcGFydHMpO1xuICB9O1xuXG4gIC8vIENvcHkgYWxsIGNvbXB1dGVkIHN0eWxlcyBmcm9tIG9uZSBET00gZWxlbWVudCB0byBhbm90aGVyLlxuICB1dGlsLmNvcHlFbGVtZW50U3R5bGUgPSBmdW5jdGlvbiAoZnJvbUVsZW1lbnQsIHRvRWxlbWVudCkge1xuICAgIHZhciBmcm9tU3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShmcm9tRWxlbWVudCwgJycpO1xuXG4gICAgaWYgKGZyb21TdHlsZS5jc3NUZXh0ICE9PSAnJykge1xuICAgICAgdG9FbGVtZW50LnN0eWxlLmNzc1RleHQgPSBmcm9tU3R5bGUuY3NzVGV4dDtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgY3NzUnVsZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZyb21TdHlsZS5sZW5ndGg7IGkrKykge1xuICAgICAgLy9jb25zb2xlLmxvZyhpLCBmcm9tU3R5bGVbaV0sIGZyb21TdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKGZyb21TdHlsZVtpXSkpXG4gICAgICAvL3RvRWxlbWVudC5zdHlsZVtmcm9tU3R5bGVbaV1dID0gZnJvbVN0eWxlLmdldFByb3BlcnR5VmFsdWUoZnJvbVN0eWxlW2ldKTtcbiAgICAgIGNzc1J1bGVzLnB1c2goZnJvbVN0eWxlW2ldICsgJzonICsgZnJvbVN0eWxlLmdldFByb3BlcnR5VmFsdWUoZnJvbVN0eWxlW2ldKSArICc7Jyk7XG4gICAgfVxuICAgIHZhciBjc3NUZXh0ID0gY3NzUnVsZXMuam9pbignJyk7XG5cbiAgICB0b0VsZW1lbnQuc3R5bGUuY3NzVGV4dCA9IGNzc1RleHQ7XG4gIH07XG5cbiAgLy8gT2JqZWN0IHRvIGhvbGQgYnJvd3NlciBzbmlmZmluZyBpbmZvLlxuICB2YXIgYnJvd3NlciA9IHtcbiAgICBpc0Nocm9tZTogZmFsc2UsXG4gICAgaXNNb3ppbGxhOiBmYWxzZSxcbiAgICBpc09wZXJhOiBmYWxzZSxcbiAgICBpc0llOiBmYWxzZSxcbiAgICBpc1NhZmFyaTogZmFsc2VcbiAgfTtcblxuICAvLyBTbmlmZiB0aGUgYnJvd3Nlci5cbiAgdmFyIHVhID0gbmF2aWdhdG9yLnVzZXJBZ2VudDtcbiAgaWYodWEuaW5kZXhPZignQ2hyb21lJykgPiAtMSkge1xuICAgIGJyb3dzZXIuaXNDaHJvbWUgPSB0cnVlO1xuICB9IGVsc2UgaWYgKHVhLmluZGV4T2YoJ1NhZmFyaScpID4gLTEpIHtcbiAgICBicm93c2VyLmlzU2FmYXJpID0gdHJ1ZTtcbiAgfSBlbHNlIGlmICh1YS5pbmRleE9mKCdPcGVyYScpID4gLTEpIHtcbiAgICBicm93c2VyLmlzT3BlcmEgPSB0cnVlO1xuICB9IGVsc2UgaWYgKHVhLmluZGV4T2YoJ0ZpcmVmb3gnKSA+IC0xKSB7XG4gICAgYnJvd3Nlci5pc01vemlsbGEgPSB0cnVlO1xuICB9IGVsc2UgaWYgKHVhLmluZGV4T2YoJ01TSUUnKSA+IC0xKSB7XG4gICAgYnJvd3Nlci5pc0llID0gdHJ1ZTtcbiAgfVxuXG4gIHV0aWwuYnJvd3NlciA9IGJyb3dzZXI7XG5cbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG4vLyAjIEZvcm1hdGljIHBsdWdpbiBjb3JlXG5cbi8vIEF0IGl0cyBjb3JlLCBGb3JtYXRpYyBpcyBqdXN0IGEgcGx1Z2luIGhvc3QuIEFsbCBvZiB0aGUgZnVuY3Rpb25hbGl0eSBpdCBoYXNcbi8vIG91dCBvZiB0aGUgYm94IGlzIHZpYSBwbHVnaW5zLiBUaGVzZSBwbHVnaW5zIGNhbiBiZSByZXBsYWNlZCBvciBleHRlbmRlZCBieVxuLy8gb3RoZXIgcGx1Z2lucy5cblxuLy8gVGhlIGdsb2JhbCBwbHVnaW4gcmVnaXN0cnkgaG9sZHMgcmVnaXN0ZXJlZCAoYnV0IG5vdCB5ZXQgaW5zdGFudGlhdGVkKVxuLy8gcGx1Z2lucy5cbnZhciBwbHVnaW5SZWdpc3RyeSA9IHt9O1xuXG4vLyBHcm91cCBwbHVnaW5zIGJ5IHByZWZpeC5cbnZhciBwbHVnaW5Hcm91cHMgPSB7fTtcblxuLy8gRm9yIGFub255bW91cyBwbHVnaW5zLCBpbmNyZW1lbnRpbmcgbnVtYmVyIGZvciBuYW1lcy5cbnZhciBwbHVnaW5JZCA9IDA7XG5cbi8vIFJlZ2lzdGVyIGEgcGx1Z2luIG9yIHBsdWdpbiBidW5kbGUgKGFycmF5IG9mIHBsdWdpbnMpIGdsb2JhbGx5LlxudmFyIHJlZ2lzdGVyUGx1Z2luID0gZnVuY3Rpb24gKG5hbWUsIHBsdWdpbkluaXRGbikge1xuXG4gIGlmIChwbHVnaW5SZWdpc3RyeVtuYW1lXSkge1xuICAgIHRocm93IG5ldyBFcnJvcignUGx1Z2luICcgKyBuYW1lICsgJyBpcyBhbHJlYWR5IHJlZ2lzdGVyZWQuJyk7XG4gIH1cblxuICBpZiAoXy5pc0FycmF5KHBsdWdpbkluaXRGbikpIHtcbiAgICBwbHVnaW5SZWdpc3RyeVtuYW1lXSA9IFtdO1xuICAgIHBsdWdpbkluaXRGbi5mb3JFYWNoKGZ1bmN0aW9uIChwbHVnaW5TcGVjKSB7XG4gICAgICByZWdpc3RlclBsdWdpbihwbHVnaW5TcGVjLm5hbWUsIHBsdWdpblNwZWMucGx1Z2luKTtcbiAgICAgIHBsdWdpblJlZ2lzdHJ5W25hbWVdLnB1c2gocGx1Z2luU3BlYy5uYW1lKTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmIChfLmlzT2JqZWN0KHBsdWdpbkluaXRGbikgJiYgIV8uaXNGdW5jdGlvbihwbHVnaW5Jbml0Rm4pKSB7XG4gICAgdmFyIGJ1bmRsZU5hbWUgPSBuYW1lO1xuICAgIHBsdWdpblJlZ2lzdHJ5W2J1bmRsZU5hbWVdID0gW107XG4gICAgT2JqZWN0LmtleXMocGx1Z2luSW5pdEZuKS5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICByZWdpc3RlclBsdWdpbihuYW1lLCBwbHVnaW5Jbml0Rm5bbmFtZV0pO1xuICAgICAgcGx1Z2luUmVnaXN0cnlbYnVuZGxlTmFtZV0ucHVzaChuYW1lKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBwbHVnaW5SZWdpc3RyeVtuYW1lXSA9IHBsdWdpbkluaXRGbjtcbiAgICAvLyBBZGQgcGx1Z2luIG5hbWUgdG8gcGx1Z2luIGdyb3VwIGlmIGl0IGhhcyBhIHByZWZpeC5cbiAgICBpZiAobmFtZS5pbmRleE9mKCcuJykgPiAwKSB7XG4gICAgICB2YXIgcHJlZml4ID0gbmFtZS5zdWJzdHJpbmcoMCwgbmFtZS5pbmRleE9mKCcuJykpO1xuICAgICAgcGx1Z2luR3JvdXBzW3ByZWZpeF0gPSBwbHVnaW5Hcm91cHNbcHJlZml4XSB8fCBbXTtcbiAgICAgIHBsdWdpbkdyb3Vwc1twcmVmaXhdLnB1c2gobmFtZSk7XG4gICAgfVxuICB9XG59O1xuXG4vLyBEZWZhdWx0IHBsdWdpbiBjb25maWcuIEVhY2gga2V5IHJlcHJlc2VudHMgYSBwbHVnaW4gbmFtZS4gRWFjaCBrZXkgb2YgdGhhdFxuLy8gcGx1Z2luIHJlcHJlc2VudHMgYSBzZXR0aW5nIGZvciB0aGF0IHBsdWdpbi4gUGFzc2VkLWluIGNvbmZpZyB3aWxsIG92ZXJyaWRlXG4vLyBlYWNoIGluZGl2aWR1YWwgc2V0dGluZy5cbnZhciBkZWZhdWx0UGx1Z2luQ29uZmlnID0ge1xuICBjb3JlOiB7XG4gICAgZm9ybWF0aWM6IFsnY29yZS5mb3JtYXRpYyddLFxuICAgIGZvcm06IFsnY29yZS5mb3JtLWluaXQnLCAnY29yZS5mb3JtJywgJ2NvcmUuZmllbGQnXVxuICB9LFxuICAnY29yZS5mb3JtJzoge1xuICAgIHN0b3JlOiAnc3RvcmUubWVtb3J5J1xuICB9LFxuICAnZmllbGQtcm91dGVyJzoge1xuICAgIHJvdXRlczogWydmaWVsZC1yb3V0ZXMnXVxuICB9LFxuICBjb21waWxlcjoge1xuICAgIGNvbXBpbGVyczogWydjb21waWxlci5jaG9pY2VzJywgJ2NvbXBpbGVyLmxvb2t1cCcsICdjb21waWxlci50eXBlcycsICdjb21waWxlci5wcm9wLWFsaWFzZXMnXVxuICB9LFxuICBjb21wb25lbnQ6IHtcbiAgICBwcm9wczogWydkZWZhdWx0LXN0eWxlJ11cbiAgfVxufTtcblxuLy8gIyMgRm9ybWF0aWMgZmFjdG9yeVxuXG4vLyBDcmVhdGUgYSBuZXcgZm9ybWF0aWMgaW5zdGFuY2UuIEEgZm9ybWF0aWMgaW5zdGFuY2UgaXMgYSBmdW5jdGlvbiB0aGF0IGNhblxuLy8gY3JlYXRlIGZvcm1zLiBJdCBhbHNvIGhhcyBhIGAuY3JlYXRlYCBtZXRob2QgdGhhdCBjYW4gY3JlYXRlIG90aGVyIGZvcm1hdGljXG4vLyBpbnN0YW5jZXMuXG52YXIgY3JlYXRlRm9ybWF0aWNDb3JlID0gZnVuY3Rpb24gKGNvbmZpZykge1xuXG4gIC8vIE1ha2UgYSBjb3B5IG9mIGNvbmZpZyBzbyB3ZSBjYW4gbW9ua2V5IHdpdGggaXQuXG4gIGNvbmZpZyA9IF8uZXh0ZW5kKHt9LCBjb25maWcpO1xuXG4gIC8vIEFkZCBkZWZhdWx0IGNvbmZpZyBzZXR0aW5ncyAod2hlcmUgbm90IG92ZXJyaWRkZW4pLlxuICBfLmtleXMoZGVmYXVsdFBsdWdpbkNvbmZpZykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgY29uZmlnW2tleV0gPSBfLmV4dGVuZCh7fSwgZGVmYXVsdFBsdWdpbkNvbmZpZ1trZXldLCBjb25maWdba2V5XSk7XG4gIH0pO1xuXG4gIC8vIFRoZSBgZm9ybWF0aWNgIHZhcmlhYmxlIHdpbGwgaG9sZCB0aGUgZnVuY3Rpb24gdGhhdCBnZXRzIHJldHVybmVkIGZyb20gdGhlXG4gIC8vIGZhY3RvcnkuXG4gIHZhciBmb3JtYXRpYztcblxuICAvLyBJbnN0YW50aWF0ZWQgcGx1Z2lucyBhcmUgY2FjaGVkIGp1c3QgbGlrZSBDb21tb25KUyBtb2R1bGVzLlxuICB2YXIgcGx1Z2luQ2FjaGUgPSB7fTtcblxuICAvLyAjIyBQbHVnaW4gcHJvdG90eXBlXG5cbiAgLy8gVGhlIFBsdWdpbiBwcm90b3R5cGUgZXhpc3RzIGluc2lkZSB0aGUgRm9ybWF0aWMgZmFjdG9yeSBmdW5jdGlvbiBqdXN0IHRvXG4gIC8vIG1ha2UgaXQgZWFzaWVyIHRvIGdyYWIgdmFsdWVzIGZyb20gdGhlIGNsb3N1cmUuXG5cbiAgLy8gUGx1Z2lucyBhcmUgc2ltaWxhciB0byBDb21tb25KUyBtb2R1bGVzLiBGb3JtYXRpYyB1c2VzIHBsdWdpbnMgYXMgYSBzbGlnaHRcbiAgLy8gdmFyaWFudCB0aG91Z2ggYmVjYXVzZTpcbiAgLy8gLSBGb3JtYXRpYyBwbHVnaW5zIGFyZSBjb25maWd1cmFibGUuXG4gIC8vIC0gRm9ybWF0aWMgcGx1Z2lucyBhcmUgaW5zdGFudGlhdGVkIHBlciBmb3JtYXRpYyBpbnN0YW5jZS4gQ29tbW9uSlMgbW9kdWxlc1xuICAvLyAgIGFyZSBjcmVhdGVkIG9uY2UgYW5kIHdvdWxkIGJlIHNoYXJlZCBhY3Jvc3MgYWxsIGZvcm1hdGljIGluc3RhbmNlcy5cbiAgLy8gLSBGb3JtYXRpYyBwbHVnaW5zIGFyZSBlYXNpbHkgb3ZlcnJpZGFibGUgKGFsc28gdmlhIGNvbmZpZ3VyYXRpb24pLlxuXG4gIC8vIFdoZW4gYSBwbHVnaW4gaXMgaW5zdGFudGlhdGVkLCB3ZSBjYWxsIHRoZSBgUGx1Z2luYCBjb25zdHJ1Y3Rvci4gVGhlIHBsdWdpblxuICAvLyBpbnN0YW5jZSBpcyB0aGVuIHBhc3NlZCB0byB0aGUgcGx1Z2luJ3MgaW5pdGlhbGl6YXRpb24gZnVuY3Rpb24uXG4gIHZhciBQbHVnaW4gPSBmdW5jdGlvbiAobmFtZSwgY29uZmlnKSB7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFBsdWdpbikpIHtcbiAgICAgIHJldHVybiBuZXcgUGx1Z2luKG5hbWUsIGNvbmZpZyk7XG4gICAgfVxuICAgIC8vIEV4cG9ydHMgYW5hbG9nb3VzIHRvIENvbW1vbkpTIGV4cG9ydHMuXG4gICAgdGhpcy5leHBvcnRzID0ge307XG4gICAgLy8gQ29uZmlnIHZhbHVlcyBwYXNzZWQgaW4gdmlhIGZhY3RvcnkgYXJlIHJvdXRlZCB0byB0aGUgYXBwcm9wcmlhdGVcbiAgICAvLyBwbHVnaW4gYW5kIGF2YWlsYWJsZSB2aWEgYC5jb25maWdgLlxuICAgIHRoaXMuY29uZmlnID0gY29uZmlnIHx8IHt9O1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gIH07XG5cbiAgLy8gR2V0IGEgY29uZmlnIHZhbHVlIGZvciBhIHBsdWdpbiBvciByZXR1cm4gdGhlIGRlZmF1bHQgdmFsdWUuXG4gIFBsdWdpbi5wcm90b3R5cGUuY29uZmlnVmFsdWUgPSBmdW5jdGlvbiAoa2V5LCBkZWZhdWx0VmFsdWUpIHtcblxuICAgIGlmICh0eXBlb2YgdGhpcy5jb25maWdba2V5XSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbmZpZ1trZXldO1xuICAgIH1cbiAgICByZXR1cm4gZGVmYXVsdFZhbHVlIHx8ICcnO1xuICB9O1xuXG4gIC8vIFJlcXVpcmUgYW5vdGhlciBwbHVnaW4gYnkgbmFtZS4gVGhpcyBpcyBtdWNoIGxpa2UgYSBDb21tb25KUyByZXF1aXJlXG4gIFBsdWdpbi5wcm90b3R5cGUucmVxdWlyZSA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgcmV0dXJuIGZvcm1hdGljLnBsdWdpbihuYW1lKTtcbiAgfTtcblxuICAvLyBIYW5kbGUgYSBzcGVjaWFsIHBsdWdpbiwgdGhlIGBjb21wb25lbnRgIHBsdWdpbiB3aGljaCBmaW5kcyBjb21wb25lbnRzLlxuICB2YXIgY29tcG9uZW50UGx1Z2luO1xuXG4gIC8vIEp1c3QgaGVyZSBpbiBjYXNlIHdlIHdhbnQgdG8gZHluYW1pY2FsbHkgY2hvb3NlIGNvbXBvbmVudCBsYXRlci5cbiAgUGx1Z2luLnByb3RvdHlwZS5jb21wb25lbnQgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHJldHVybiBjb21wb25lbnRQbHVnaW4uY29tcG9uZW50KG5hbWUpO1xuICB9O1xuXG4gIC8vIENoZWNrIGlmIGEgcGx1Z2luIGV4aXN0cy5cbiAgUGx1Z2luLnByb3RvdHlwZS5oYXNQbHVnaW4gPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHJldHVybiAobmFtZSBpbiBwbHVnaW5DYWNoZSkgfHwgKG5hbWUgaW4gcGx1Z2luUmVnaXN0cnkpO1xuICB9O1xuXG4gIC8vIENoZWNrIGlmIGEgY29tcG9uZW50IGV4aXN0cy4gQ29tcG9uZW50cyBhcmUgcmVhbGx5IGp1c3QgcGx1Z2lucyB3aXRoXG4gIC8vIGEgcGFydGljdWxhciBwcmVmaXggdG8gdGhlaXIgbmFtZXMuXG4gIFBsdWdpbi5wcm90b3R5cGUuaGFzQ29tcG9uZW50ID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5oYXNQbHVnaW4oJ2NvbXBvbmVudC4nICsgbmFtZSk7XG4gIH07XG5cbiAgLy8gR2l2ZW4gYSBsaXN0IG9mIHBsdWdpbiBuYW1lcywgcmVxdWlyZSB0aGVtIGFsbCBhbmQgcmV0dXJuIGEgbGlzdCBvZlxuICAvLyBpbnN0YW50aWF0ZWQgcGx1Z2lucy5cbiAgUGx1Z2luLnByb3RvdHlwZS5yZXF1aXJlQWxsID0gZnVuY3Rpb24gKHBsdWdpbkxpc3QpIHtcbiAgICBpZiAoIXBsdWdpbkxpc3QpIHtcbiAgICAgIHBsdWdpbkxpc3QgPSBbXTtcbiAgICB9XG4gICAgaWYgKCFfLmlzQXJyYXkocGx1Z2luTGlzdCkpIHtcbiAgICAgIHBsdWdpbkxpc3QgPSBbcGx1Z2luTGlzdF07XG4gICAgfVxuICAgIC8vIEluZmxhdGUgcmVnaXN0ZXJlZCBidW5kbGVzLiBBIGJ1bmRsZSBpcyBqdXN0IGEgbmFtZSB0aGF0IHBvaW50cyB0byBhblxuICAgIC8vIGFycmF5IG9mIG90aGVyIHBsdWdpbiBuYW1lcy5cbiAgICBwbHVnaW5MaXN0ID0gcGx1Z2luTGlzdC5tYXAoZnVuY3Rpb24gKHBsdWdpbikge1xuICAgICAgaWYgKF8uaXNTdHJpbmcocGx1Z2luKSkge1xuICAgICAgICBpZiAoXy5pc0FycmF5KHBsdWdpblJlZ2lzdHJ5W3BsdWdpbl0pKSB7XG4gICAgICAgICAgcmV0dXJuIHBsdWdpblJlZ2lzdHJ5W3BsdWdpbl07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBwbHVnaW47XG4gICAgfSk7XG4gICAgLy8gRmxhdHRlbiBhbnkgYnVuZGxlcywgc28gd2UgZW5kIHVwIHdpdGggYSBmbGF0IGFycmF5IG9mIHBsdWdpbiBuYW1lcy5cbiAgICBwbHVnaW5MaXN0ID0gXy5mbGF0dGVuKHBsdWdpbkxpc3QpO1xuICAgIHJldHVybiBwbHVnaW5MaXN0Lm1hcChmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZXF1aXJlKHBsdWdpbik7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfTtcblxuICAvLyBHaXZlbiBhIHByZWZpeCwgcmV0dXJuIGEgbWFwIG9mIGFsbCBpbnN0YW50aWF0ZWQgcGx1Z2lucyB3aXRoIHRoYXQgcHJlZml4LlxuICBQbHVnaW4ucHJvdG90eXBlLnJlcXVpcmVBbGxPZiA9IGZ1bmN0aW9uIChwcmVmaXgpIHtcbiAgICB2YXIgbWFwID0ge307XG5cbiAgICBpZiAocGx1Z2luR3JvdXBzW3ByZWZpeF0pIHtcbiAgICAgIHBsdWdpbkdyb3Vwc1twcmVmaXhdLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgbWFwW25hbWVdID0gdGhpcy5yZXF1aXJlKG5hbWUpO1xuICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWFwO1xuICB9O1xuXG4gIC8vICMjIEZvcm1hdGljIGZhY3RvcnksIGNvbnRpbnVlZC4uLlxuXG4gIC8vIEdyYWIgYSBwbHVnaW4gZnJvbSB0aGUgY2FjaGUsIG9yIGxvYWQgaXQgZnJlc2ggZnJvbSB0aGUgcmVnaXN0cnkuXG4gIHZhciBsb2FkUGx1Z2luID0gZnVuY3Rpb24gKG5hbWUsIHBsdWdpbkNvbmZpZykge1xuICAgIHZhciBwbHVnaW47XG5cbiAgICAvLyBXZSBjYW4gYWxzbyBsb2FkIGFub255bW91cyBwbHVnaW5zLlxuICAgIGlmIChfLmlzRnVuY3Rpb24obmFtZSkpIHtcblxuICAgICAgdmFyIGZhY3RvcnkgPSBuYW1lO1xuXG4gICAgICBpZiAoXy5pc1VuZGVmaW5lZChmYWN0b3J5Ll9fZXhwb3J0c19fKSkge1xuICAgICAgICBwbHVnaW5JZCsrO1xuICAgICAgICBwbHVnaW4gPSBQbHVnaW4oJ2Fub255bW91c19wbHVnaW5fJyArIHBsdWdpbklkLCBwbHVnaW5Db25maWcgfHwge30pO1xuICAgICAgICBmYWN0b3J5KHBsdWdpbik7XG4gICAgICAgIC8vIFN0b3JlIHRoZSBleHBvcnRzIG9uIHRoZSBhbm9ueW1vdXMgZnVuY3Rpb24gc28gd2Uga25vdyBpdCdzIGFscmVhZHlcbiAgICAgICAgLy8gYmVlbiBpbnN0YW50aWF0ZWQsIGFuZCB3ZSBjYW4ganVzdCBncmFiIHRoZSBleHBvcnRzLlxuICAgICAgICBmYWN0b3J5Ll9fZXhwb3J0c19fID0gcGx1Z2luLmV4cG9ydHM7XG4gICAgICB9XG5cbiAgICAgIC8vIExvYWQgdGhlIGNhY2hlZCBleHBvcnRzLlxuICAgICAgcmV0dXJuIGZhY3RvcnkuX19leHBvcnRzX187XG5cbiAgICB9IGVsc2UgaWYgKF8uaXNVbmRlZmluZWQocGx1Z2luQ2FjaGVbbmFtZV0pKSB7XG5cbiAgICAgIGlmICghcGx1Z2luQ29uZmlnICYmIGNvbmZpZ1tuYW1lXSkge1xuICAgICAgICBpZiAoY29uZmlnW25hbWVdLnBsdWdpbikge1xuICAgICAgICAgIHJldHVybiBsb2FkUGx1Z2luKGNvbmZpZ1tuYW1lXS5wbHVnaW4sIGNvbmZpZ1tuYW1lXSB8fCB7fSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHBsdWdpblJlZ2lzdHJ5W25hbWVdKSB7XG4gICAgICAgIGlmIChfLmlzRnVuY3Rpb24ocGx1Z2luUmVnaXN0cnlbbmFtZV0pKSB7XG4gICAgICAgICAgcGx1Z2luID0gUGx1Z2luKG5hbWUsIHBsdWdpbkNvbmZpZyB8fCBjb25maWdbbmFtZV0pO1xuICAgICAgICAgIHBsdWdpblJlZ2lzdHJ5W25hbWVdKHBsdWdpbik7XG4gICAgICAgICAgcGx1Z2luQ2FjaGVbbmFtZV0gPSBwbHVnaW4uZXhwb3J0cztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BsdWdpbiAnICsgbmFtZSArICcgaXMgbm90IGEgZnVuY3Rpb24uJyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignUGx1Z2luICcgKyBuYW1lICsgJyBub3QgZm91bmQuJyk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBwbHVnaW5DYWNoZVtuYW1lXTtcbiAgfTtcblxuICAvLyBBc3NpZ24gYGZvcm1hdGljYCB0byBhIGZ1bmN0aW9uIHRoYXQgdGFrZXMgZm9ybSBvcHRpb25zIGFuZCByZXR1cm5zIGEgZm9ybS5cbiAgZm9ybWF0aWMgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIHJldHVybiBmb3JtYXRpYy5mb3JtKG9wdGlvbnMpO1xuICB9O1xuXG4gIC8vIEFsbG93IGdsb2JhbCBwbHVnaW4gcmVnaXN0cnkgZnJvbSB0aGUgZm9ybWF0aWMgZnVuY3Rpb24gaW5zdGFuY2UuXG4gIGZvcm1hdGljLnJlZ2lzdGVyID0gZnVuY3Rpb24gKG5hbWUsIHBsdWdpbkluaXRGbikge1xuICAgIHJlZ2lzdGVyUGx1Z2luKG5hbWUsIHBsdWdpbkluaXRGbik7XG4gICAgcmV0dXJuIGZvcm1hdGljO1xuICB9O1xuXG4gIC8vIEFsbG93IHJldHJpZXZpbmcgcGx1Z2lucyBmcm9tIHRoZSBmb3JtYXRpYyBmdW5jdGlvbiBpbnN0YW5jZS5cbiAgZm9ybWF0aWMucGx1Z2luID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICByZXR1cm4gbG9hZFBsdWdpbihuYW1lKTtcbiAgfTtcblxuICAvLyBBbGxvdyBjcmVhdGluZyBhIG5ldyBmb3JtYXRpYyBpbnN0YW5jZSBmcm9tIGEgZm9ybWF0aWMgaW5zdGFuY2UuXG4gIC8vZm9ybWF0aWMuY3JlYXRlID0gRm9ybWF0aWM7XG5cbiAgLy8gVXNlIHRoZSBjb3JlIHBsdWdpbiB0byBhZGQgbWV0aG9kcyB0byB0aGUgZm9ybWF0aWMgaW5zdGFuY2UuXG4gIHZhciBjb3JlID0gbG9hZFBsdWdpbignY29yZScpO1xuXG4gIGNvcmUoZm9ybWF0aWMpO1xuXG4gIC8vIE5vdyBiaW5kIHRoZSBjb21wb25lbnQgcGx1Z2luLiBXZSB3YWl0IHRpbGwgbm93LCBzbyB0aGUgY29yZSBpcyBsb2FkZWRcbiAgLy8gZmlyc3QuXG4gIGNvbXBvbmVudFBsdWdpbiA9IGxvYWRQbHVnaW4oJ2NvbXBvbmVudCcpO1xuXG4gIC8vIFJldHVybiB0aGUgZm9ybWF0aWMgZnVuY3Rpb24gaW5zdGFuY2UuXG4gIHJldHVybiBmb3JtYXRpYztcbn07XG5cbi8vIEp1c3QgYSBoZWxwZXIgdG8gcmVnaXN0ZXIgYSBidW5jaCBvZiBwbHVnaW5zLlxudmFyIHJlZ2lzdGVyUGx1Z2lucyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGFyZyA9IF8udG9BcnJheShhcmd1bWVudHMpO1xuICBhcmcuZm9yRWFjaChmdW5jdGlvbiAoYXJnKSB7XG4gICAgdmFyIG5hbWUgPSBhcmdbMF07XG4gICAgdmFyIHBsdWdpbiA9IGFyZ1sxXTtcbiAgICByZWdpc3RlclBsdWdpbihuYW1lLCBwbHVnaW4pO1xuICB9KTtcbn07XG5cbi8vIFJlZ2lzdGVyIGFsbCB0aGUgYnVpbHQtaW4gcGx1Z2lucy5cbnJlZ2lzdGVyUGx1Z2lucyhcbiAgWydjb3JlJywgcmVxdWlyZSgnLi9kZWZhdWx0L2NvcmUnKV0sXG5cbiAgWydjb3JlLmZvcm1hdGljJywgcmVxdWlyZSgnLi9jb3JlL2Zvcm1hdGljJyldLFxuICBbJ2NvcmUuZm9ybS1pbml0JywgcmVxdWlyZSgnLi9jb3JlL2Zvcm0taW5pdCcpXSxcbiAgWydjb3JlLmZvcm0nLCByZXF1aXJlKCcuL2NvcmUvZm9ybScpXSxcbiAgWydjb3JlLmZpZWxkJywgcmVxdWlyZSgnLi9jb3JlL2ZpZWxkJyldLFxuXG4gIFsndXRpbCcsIHJlcXVpcmUoJy4vZGVmYXVsdC91dGlsJyldLFxuICBbJ2NvbXBpbGVyJywgcmVxdWlyZSgnLi9kZWZhdWx0L2NvbXBpbGVyJyldLFxuICBbJ2V2YWwnLCByZXF1aXJlKCcuL2RlZmF1bHQvZXZhbCcpXSxcbiAgWydldmFsLWZ1bmN0aW9ucycsIHJlcXVpcmUoJy4vZGVmYXVsdC9ldmFsLWZ1bmN0aW9ucycpXSxcbiAgWydsb2FkZXInLCByZXF1aXJlKCcuL2RlZmF1bHQvbG9hZGVyJyldLFxuICBbJ2ZpZWxkLXJvdXRlcicsIHJlcXVpcmUoJy4vZGVmYXVsdC9maWVsZC1yb3V0ZXInKV0sXG4gIFsnZmllbGQtcm91dGVzJywgcmVxdWlyZSgnLi9kZWZhdWx0L2ZpZWxkLXJvdXRlcycpXSxcblxuICBbJ2NvbXBpbGVyLmNob2ljZXMnLCByZXF1aXJlKCcuL2NvbXBpbGVycy9jaG9pY2VzJyldLFxuICBbJ2NvbXBpbGVyLmxvb2t1cCcsIHJlcXVpcmUoJy4vY29tcGlsZXJzL2xvb2t1cCcpXSxcbiAgWydjb21waWxlci50eXBlcycsIHJlcXVpcmUoJy4vY29tcGlsZXJzL3R5cGVzJyldLFxuICBbJ2NvbXBpbGVyLnByb3AtYWxpYXNlcycsIHJlcXVpcmUoJy4vY29tcGlsZXJzL3Byb3AtYWxpYXNlcycpXSxcblxuICBbJ3N0b3JlLm1lbW9yeScsIHJlcXVpcmUoJy4vc3RvcmUvbWVtb3J5JyldLFxuXG4gIFsndHlwZS5yb290JywgcmVxdWlyZSgnLi90eXBlcy9yb290JyldLFxuICBbJ3R5cGUuc3RyaW5nJywgcmVxdWlyZSgnLi90eXBlcy9zdHJpbmcnKV0sXG4gIFsndHlwZS5vYmplY3QnLCByZXF1aXJlKCcuL3R5cGVzL29iamVjdCcpXSxcbiAgWyd0eXBlLmJvb2xlYW4nLCByZXF1aXJlKCcuL3R5cGVzL2Jvb2xlYW4nKV0sXG4gIFsndHlwZS5hcnJheScsIHJlcXVpcmUoJy4vdHlwZXMvYXJyYXknKV0sXG4gIFsndHlwZS5qc29uJywgcmVxdWlyZSgnLi90eXBlcy9qc29uJyldLFxuICBbJ3R5cGUubnVtYmVyJywgcmVxdWlyZSgnLi90eXBlcy9udW1iZXInKV0sXG5cbiAgWydjb21wb25lbnQnLCByZXF1aXJlKCcuL2RlZmF1bHQvY29tcG9uZW50JyldLFxuXG4gIFsnY29tcG9uZW50LmZvcm1hdGljJywgcmVxdWlyZSgnLi9jb21wb25lbnRzL2Zvcm1hdGljJyldLFxuICBbJ2NvbXBvbmVudC5yb290JywgcmVxdWlyZSgnLi9jb21wb25lbnRzL3Jvb3QnKV0sXG4gIFsnY29tcG9uZW50LmZpZWxkJywgcmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkJyldLFxuICBbJ2NvbXBvbmVudC5sYWJlbCcsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9sYWJlbCcpXSxcbiAgWydjb21wb25lbnQuaGVscCcsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwJyldLFxuICBbJ2NvbXBvbmVudC5zYW1wbGUnLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvc2FtcGxlJyldLFxuICBbJ2NvbXBvbmVudC5maWVsZHNldCcsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHNldCcpXSxcbiAgWydjb21wb25lbnQudGV4dCcsIHJlcXVpcmUoJy4vY29tcG9uZW50cy90ZXh0JyldLFxuICBbJ2NvbXBvbmVudC50ZXh0YXJlYScsIHJlcXVpcmUoJy4vY29tcG9uZW50cy90ZXh0YXJlYScpXSxcbiAgWydjb21wb25lbnQuc2VsZWN0JywgcmVxdWlyZSgnLi9jb21wb25lbnRzL3NlbGVjdCcpXSxcbiAgWydjb21wb25lbnQubGlzdCcsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9saXN0JyldLFxuICBbJ2NvbXBvbmVudC5saXN0LWNvbnRyb2wnLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvbGlzdC1jb250cm9sJyldLFxuICBbJ2NvbXBvbmVudC5saXN0LWl0ZW0nLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvbGlzdC1pdGVtJyldLFxuICBbJ2NvbXBvbmVudC5saXN0LWl0ZW0tdmFsdWUnLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvbGlzdC1pdGVtLXZhbHVlJyldLFxuICBbJ2NvbXBvbmVudC5saXN0LWl0ZW0tY29udHJvbCcsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9saXN0LWl0ZW0tY29udHJvbCcpXSxcbiAgWydjb21wb25lbnQuaXRlbS1jaG9pY2VzJywgcmVxdWlyZSgnLi9jb21wb25lbnRzL2l0ZW0tY2hvaWNlcycpXSxcbiAgWydjb21wb25lbnQuYWRkLWl0ZW0nLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvYWRkLWl0ZW0nKV0sXG4gIFsnY29tcG9uZW50LnJlbW92ZS1pdGVtJywgcmVxdWlyZSgnLi9jb21wb25lbnRzL3JlbW92ZS1pdGVtJyldLFxuICBbJ2NvbXBvbmVudC5tb3ZlLWl0ZW0tYmFjaycsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9tb3ZlLWl0ZW0tYmFjaycpXSxcbiAgWydjb21wb25lbnQubW92ZS1pdGVtLWZvcndhcmQnLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvbW92ZS1pdGVtLWZvcndhcmQnKV0sXG4gIFsnY29tcG9uZW50Lmpzb24nLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvanNvbicpXSxcbiAgWydjb21wb25lbnQuY2hlY2tib3gtbGlzdCcsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9jaGVja2JveC1saXN0JyldLFxuICBbJ2NvbXBvbmVudC5wcmV0dHktdGV4dGFyZWEnLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvcHJldHR5LXRleHRhcmVhJyldLFxuXG4gIFsnbWl4aW4uY2xpY2stb3V0c2lkZScsIHJlcXVpcmUoJy4vbWl4aW5zL2NsaWNrLW91dHNpZGUnKV0sXG4gIFsnbWl4aW4uZmllbGQnLCByZXF1aXJlKCcuL21peGlucy9maWVsZCcpXSxcbiAgWydtaXhpbi5pbnB1dC1hY3Rpb25zJywgcmVxdWlyZSgnLi9taXhpbnMvaW5wdXQtYWN0aW9ucycpXSxcbiAgWydtaXhpbi5yZXNpemUnLCByZXF1aXJlKCcuL21peGlucy9yZXNpemUnKV0sXG4gIFsnbWl4aW4udW5kby1zdGFjaycsIHJlcXVpcmUoJy4vbWl4aW5zL3VuZG8tc3RhY2snKV0sXG5cbiAgWydib290c3RyYXAtc3R5bGUnLCByZXF1aXJlKCcuL3BsdWdpbnMvYm9vdHN0cmFwLXN0eWxlJyldLFxuICBbJ2RlZmF1bHQtc3R5bGUnLCByZXF1aXJlKCcuL3BsdWdpbnMvZGVmYXVsdC1zdHlsZScpXVxuKTtcblxuLy8gQ3JlYXRlIHRoZSBkZWZhdWx0IGZvcm1hdGljIGluc3RhbmNlLlxuLy92YXIgZGVmYXVsdENvcmUgPSBGb3JtYXRpYygpO1xuXG4vLyBFeHBvcnQgaXQhXG4vL21vZHVsZS5leHBvcnRzID0gZGVmYXVsdEZvcm1hdGljO1xuXG52YXIgY3JlYXRlRm9ybWF0aWNDb21wb25lbnRDbGFzcyA9IGZ1bmN0aW9uIChjb25maWcpIHtcblxuICB2YXIgY29yZSA9IGNyZWF0ZUZvcm1hdGljQ29yZShjb25maWcpO1xuXG4gIHJldHVybiBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogJ0Zvcm1hdGljJyxcblxuICAgIHN0YXRpY3M6IHtcbiAgICAgIGNvbmZpZzogY3JlYXRlRm9ybWF0aWNDb21wb25lbnRDbGFzcyxcbiAgICAgIGZvcm06IGNvcmUsXG4gICAgICBwbHVnaW46IGNvcmUucGx1Z2luXG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGZvcm0gPSB0aGlzLnByb3BzLmZvcm0gfHwgdGhpcy5wcm9wcy5kZWZhdWx0Rm9ybTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGZvcm06IGZvcm0sXG4gICAgICAgIGZpZWxkOiBmb3JtLmZpZWxkKCksXG4gICAgICAgIGNvbnRyb2xsZWQ6IHRoaXMucHJvcHMuZm9ybSA/IHRydWUgOiBmYWxzZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGZvcm0gPSB0aGlzLnN0YXRlLmZvcm07XG4gICAgICBpZiAoIWZvcm0pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNdXN0IHN1cHBseSBhIGZvcm0gb3IgZGVmYXVsdEZvcm0uJyk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5zdGF0ZS5jb250cm9sbGVkKSB7XG4gICAgICAgIGZvcm0ub25jZSgnY2hhbmdlJywgdGhpcy5vbkZvcm1DaGFuZ2VkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvcm0ub24oJ2NoYW5nZScsIHRoaXMub25Gb3JtQ2hhbmdlZCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIG9uRm9ybUNoYW5nZWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4gICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UodGhpcy5wcm9wcy5mb3JtLnZhbCgpKTtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5zdGF0ZS5jb250cm9sbGVkKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIGZpZWxkOiB0aGlzLnN0YXRlLmZvcm0uZmllbGQoKVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBmb3JtID0gdGhpcy5zdGF0ZS5mb3JtO1xuICAgICAgaWYgKGZvcm0pIHtcbiAgICAgICAgZm9ybS5vZmYoJ2NoYW5nZScsIHRoaXMub25Gb3JtQ2hhbmdlZCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXh0UHJvcHMpIHtcbiAgICAgIGlmICh0aGlzLnN0YXRlLmNvbnRyb2xsZWQpIHtcbiAgICAgICAgaWYgKCFuZXh0UHJvcHMuZm9ybSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTXVzdCBzdXBwbHkgYSBuZXcgZm9ybSBmb3IgYSBjb250cm9sbGVkIGNvbXBvbmVudC4nKTtcbiAgICAgICAgfVxuICAgICAgICBuZXh0UHJvcHMuZm9ybS5vbmNlKCdjaGFuZ2UnLCB0aGlzLm9uRm9ybUNoYW5nZWQpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBmb3JtOiBuZXh0UHJvcHMuZm9ybSxcbiAgICAgICAgICBmaWVsZDogbmV4dFByb3BzLmZvcm0uZmllbGQoKVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogJ2Zvcm1hdGljJ30sXG4gICAgICAgIHRoaXMuc3RhdGUuZmllbGQuY29tcG9uZW50KClcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlRm9ybWF0aWNDb21wb25lbnRDbGFzcygpO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIvLyAjIG1peGluLmNsaWNrLW91dHNpZGVcblxuLypcblRoZXJlJ3Mgbm8gbmF0aXZlIFJlYWN0IHdheSB0byBkZXRlY3QgY2xpY2tpbmcgb3V0c2lkZSBhbiBlbGVtZW50LiBTb21ldGltZXNcbnRoaXMgaXMgdXNlZnVsLCBzbyB0aGF0J3Mgd2hhdCB0aGlzIG1peGluIGRvZXMuIFRvIHVzZSBpdCwgbWl4IGl0IGluIGFuZCB1c2UgaXRcbmZyb20geW91ciBjb21wb25lbnQgbGlrZSB0aGlzOlxuXG5gYGBqc1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgbWl4aW5zOiBbcGx1Z2luLnJlcXVpcmUoJ21peGluLmNsaWNrLW91dHNpZGUnKV0sXG5cbiAgICBvbkNsaWNrT3V0c2lkZTogZnVuY3Rpb24gKCkge1xuICAgICAgY29uc29sZS5sb2coJ2NsaWNrZWQgb3V0c2lkZSEnKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuc2V0T25DbGlja091dHNpZGUoJ215RGl2JywgdGhpcy5vbkNsaWNrT3V0c2lkZSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIFJlYWN0LkRPTS5kaXYoe3JlZjogJ215RGl2J30sXG4gICAgICAgICdIZWxsbyEnXG4gICAgICApXG4gICAgfVxuICB9KTtcbn07XG5gYGBcbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGhhc0FuY2VzdG9yID0gZnVuY3Rpb24gKGNoaWxkLCBwYXJlbnQpIHtcbiAgaWYgKGNoaWxkLnBhcmVudE5vZGUgPT09IHBhcmVudCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmIChjaGlsZC5wYXJlbnROb2RlID09PSBjaGlsZC5wYXJlbnROb2RlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmIChjaGlsZC5wYXJlbnROb2RlID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiBoYXNBbmNlc3RvcihjaGlsZC5wYXJlbnROb2RlLCBwYXJlbnQpO1xufTtcblxudmFyIGlzT3V0c2lkZSA9IGZ1bmN0aW9uIChub2RlT3V0LCBub2RlSW4pIHtcbiAgaWYgKG5vZGVPdXQgPT09IG5vZGVJbikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAoaGFzQW5jZXN0b3Iobm9kZU91dCwgbm9kZUluKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbnZhciBvbkNsaWNrRG9jdW1lbnQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgT2JqZWN0LmtleXModGhpcy5jbGlja091dHNpZGVIYW5kbGVycykuZm9yRWFjaChmdW5jdGlvbiAocmVmKSB7XG4gICAgaWYgKHRoaXMuY2xpY2tPdXRzaWRlSGFuZGxlcnNbcmVmXS5sZW5ndGggPiAwKSB7XG4gICAgICBpZiAoaXNPdXRzaWRlKGV2ZW50LnRhcmdldCwgdGhpcy5yZWZzW3JlZl0uZ2V0RE9NTm9kZSgpKSkge1xuICAgICAgICB0aGlzLmNsaWNrT3V0c2lkZUhhbmRsZXJzW3JlZl0uZm9yRWFjaChmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICBmbi5jYWxsKHRoaXMsIHJlZik7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICB9XG4gICAgfVxuICB9LmJpbmQodGhpcykpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSB7XG5cbiAgICBzZXRPbkNsaWNrT3V0c2lkZTogZnVuY3Rpb24gKHJlZiwgZm4pIHtcbiAgICAgIGlmICghdGhpcy5jbGlja091dHNpZGVIYW5kbGVyc1tyZWZdKSB7XG4gICAgICAgIHRoaXMuY2xpY2tPdXRzaWRlSGFuZGxlcnNbcmVmXSA9IFtdO1xuICAgICAgfVxuICAgICAgdGhpcy5jbGlja091dHNpZGVIYW5kbGVyc1tyZWZdLnB1c2goZm4pO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5jbGlja091dHNpZGVIYW5kbGVycyA9IHt9O1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBvbkNsaWNrRG9jdW1lbnQuYmluZCh0aGlzKSk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmNsaWNrT3V0c2lkZUhhbmRsZXJzID0ge307XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIG9uQ2xpY2tEb2N1bWVudC5iaW5kKHRoaXMpKTtcbiAgICB9XG4gIH07XG59O1xuIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBtaXhpbi5maWVsZFxuXG4vKlxuV3JhcCB1cCB5b3VyIGZpZWxkcyB3aXRoIHRoaXMgbWl4aW4gdG8gZ2V0OlxuLSBBdXRvbWF0aWMgbWV0YWRhdGEgbG9hZGluZy5cbi0gQW55dGhpbmcgZWxzZSBkZWNpZGVkIGxhdGVyLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSB7XG5cbiAgICBsb2FkTmVlZGVkTWV0YTogZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICBpZiAocHJvcHMuZmllbGQgJiYgcHJvcHMuZmllbGQuZm9ybSkge1xuICAgICAgICBpZiAocHJvcHMuZmllbGQuZGVmLm5lZWRzTWV0YSAmJiBwcm9wcy5maWVsZC5kZWYubmVlZHNNZXRhLmxlbmd0aCA+IDApIHtcblxuICAgICAgICAgIHZhciBuZWVkc01ldGEgPSBbXTtcblxuICAgICAgICAgIHByb3BzLmZpZWxkLmRlZi5uZWVkc01ldGEuZm9yRWFjaChmdW5jdGlvbiAoYXJncykge1xuICAgICAgICAgICAgaWYgKF8uaXNBcnJheShhcmdzKSAmJiBhcmdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgaWYgKF8uaXNBcnJheShhcmdzWzBdKSkge1xuICAgICAgICAgICAgICAgIGFyZ3MuZm9yRWFjaChmdW5jdGlvbiAoYXJncykge1xuICAgICAgICAgICAgICAgICAgbmVlZHNNZXRhLnB1c2goYXJncyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbmVlZHNNZXRhLnB1c2goYXJncyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGlmIChuZWVkc01ldGEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAvLyBNdXN0IGp1c3QgYmUgYSBzaW5nbGUgbmVlZCwgYW5kIG5vdCBhbiBhcnJheS5cbiAgICAgICAgICAgIG5lZWRzTWV0YSA9IFtwcm9wcy5maWVsZC5kZWYubmVlZHNNZXRhXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBuZWVkc01ldGEuZm9yRWFjaChmdW5jdGlvbiAobmVlZHMpIHtcbiAgICAgICAgICAgIGlmIChuZWVkcykge1xuICAgICAgICAgICAgICBwcm9wcy5maWVsZC5mb3JtLmxvYWRNZXRhLmFwcGx5KHByb3BzLmZpZWxkLmZvcm0sIG5lZWRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5sb2FkTmVlZGVkTWV0YSh0aGlzLnByb3BzKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gKG5leHRQcm9wcykge1xuICAgICAgdGhpcy5sb2FkTmVlZGVkTWV0YShuZXh0UHJvcHMpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgLy8gUmVtb3ZpbmcgdGhpcyBhcyBpdCdzIGEgYmFkIGlkZWEsIGJlY2F1c2UgdW5tb3VudGluZyBhIGNvbXBvbmVudCBpcyBub3RcbiAgICAgIC8vIGFsd2F5cyBhIHNpZ25hbCB0byByZW1vdmUgdGhlIGZpZWxkLiBXaWxsIGhhdmUgdG8gZmluZCBhIGJldHRlciB3YXkuXG5cbiAgICAgIC8vIGlmICh0aGlzLnByb3BzLmZpZWxkKSB7XG4gICAgICAvLyAgIHRoaXMucHJvcHMuZmllbGQuZXJhc2UoKTtcbiAgICAgIC8vIH1cbiAgICB9XG4gIH07XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIvLyAjIG1peGluLmlucHV0LWFjdGlvbnNcblxuLypcbkN1cnJlbnRseSB1bnVzZWQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0ge1xuXG4gICAgb25Gb2N1czogZnVuY3Rpb24gKCkge1xuXG4gICAgfSxcblxuICAgIG9uQmx1cjogZnVuY3Rpb24gKCkge1xuXG4gICAgfSxcblxuICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICB9XG4gIH07XG59O1xuIiwiLy8gIyBtaXhpbi5yZXNpemVcblxuLypcbllvdSdkIHRoaW5rIGl0IHdvdWxkIGJlIHByZXR0eSBlYXN5IHRvIGRldGVjdCB3aGVuIGEgRE9NIGVsZW1lbnQgaXMgcmVzaXplZC5cbkFuZCB5b3UnZCBiZSB3cm9uZy4gVGhlcmUgYXJlIHZhcmlvdXMgdHJpY2tzLCBidXQgbm9uZSBvZiB0aGVtIHdvcmsgdmVyeSB3ZWxsLlxuU28sIHVzaW5nIGdvb2Qgb2wnIHBvbGxpbmcgaGVyZS4gVG8gdHJ5IHRvIGJlIGFzIGVmZmljaWVudCBhcyBwb3NzaWJsZSwgdGhlcmVcbmlzIG9ubHkgYSBzaW5nbGUgc2V0SW50ZXJ2YWwgdXNlZCBmb3IgYWxsIGVsZW1lbnRzLiBUbyB1c2U6XG5cbmBgYGpzXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBtaXhpbnM6IFtwbHVnaW4ucmVxdWlyZSgnbWl4aW4ucmVzaXplJyldLFxuXG4gICAgb25SZXNpemU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdyZXNpemVkIScpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zZXRPblJlc2l6ZSgnbXlUZXh0JywgdGhpcy5vblJlc2l6ZSk7XG4gICAgfSxcblxuICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAuLi5cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gUmVhY3QuRE9NLnRleHRhcmVhKHtyZWY6ICdteVRleHQnLCB2YWx1ZTogdGhpcy5wcm9wcy52YWx1ZSwgb25DaGFuZ2U6IC4uLn0pXG4gICAgfVxuICB9KTtcbn07XG5gYGBcbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGlkID0gMDtcblxudmFyIHJlc2l6ZUludGVydmFsRWxlbWVudHMgPSB7fTtcbnZhciByZXNpemVJbnRlcnZhbEVsZW1lbnRzQ291bnQgPSAwO1xudmFyIHJlc2l6ZUludGVydmFsVGltZXIgPSBudWxsO1xuXG52YXIgY2hlY2tFbGVtZW50cyA9IGZ1bmN0aW9uICgpIHtcbiAgT2JqZWN0LmtleXMocmVzaXplSW50ZXJ2YWxFbGVtZW50cykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIGVsZW1lbnQgPSByZXNpemVJbnRlcnZhbEVsZW1lbnRzW2tleV07XG4gICAgaWYgKGVsZW1lbnQuY2xpZW50V2lkdGggIT09IGVsZW1lbnQuX19wcmV2Q2xpZW50V2lkdGggfHwgZWxlbWVudC5jbGllbnRIZWlnaHQgIT09IGVsZW1lbnQuX19wcmV2Q2xpZW50SGVpZ2h0KSB7XG4gICAgICBlbGVtZW50Ll9fcHJldkNsaWVudFdpZHRoID0gZWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICAgIGVsZW1lbnQuX19wcmV2Q2xpZW50SGVpZ2h0ID0gZWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgICB2YXIgaGFuZGxlcnMgPSBlbGVtZW50Ll9fcmVzaXplSGFuZGxlcnM7XG4gICAgICBoYW5kbGVycy5mb3JFYWNoKGZ1bmN0aW9uIChoYW5kbGVyKSB7XG4gICAgICAgIGhhbmRsZXIoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSwgMTAwKTtcbn07XG5cbnZhciBhZGRSZXNpemVJbnRlcnZhbEhhbmRsZXIgPSBmdW5jdGlvbiAoZWxlbWVudCwgZm4pIHtcbiAgaWYgKHJlc2l6ZUludGVydmFsVGltZXIgPT09IG51bGwpIHtcbiAgICByZXNpemVJbnRlcnZhbFRpbWVyID0gc2V0SW50ZXJ2YWwoY2hlY2tFbGVtZW50cywgMTAwKTtcbiAgfVxuICBpZiAoISgnX19yZXNpemVJZCcgaW4gZWxlbWVudCkpIHtcbiAgICBpZCsrO1xuICAgIGVsZW1lbnQuX19wcmV2Q2xpZW50V2lkdGggPSBlbGVtZW50LmNsaWVudFdpZHRoO1xuICAgIGVsZW1lbnQuX19wcmV2Q2xpZW50SGVpZ2h0ID0gZWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgZWxlbWVudC5fX3Jlc2l6ZUlkID0gaWQ7XG4gICAgcmVzaXplSW50ZXJ2YWxFbGVtZW50c0NvdW50Kys7XG4gICAgcmVzaXplSW50ZXJ2YWxFbGVtZW50c1tpZF0gPSBlbGVtZW50O1xuICAgIGVsZW1lbnQuX19yZXNpemVIYW5kbGVycyA9IFtdO1xuICB9XG4gIGVsZW1lbnQuX19yZXNpemVIYW5kbGVycy5wdXNoKGZuKTtcbn07XG5cbnZhciByZW1vdmVSZXNpemVJbnRlcnZhbEhhbmRsZXJzID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgaWYgKCEoJ19fcmVzaXplSWQnIGluIGVsZW1lbnQpKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBpZCA9IGVsZW1lbnQuX19yZXNpemVJZDtcbiAgZGVsZXRlIGVsZW1lbnQuX19yZXNpemVJZDtcbiAgZGVsZXRlIGVsZW1lbnQuX19yZXNpemVIYW5kbGVycztcbiAgZGVsZXRlIHJlc2l6ZUludGVydmFsRWxlbWVudHNbaWRdO1xuICByZXNpemVJbnRlcnZhbEVsZW1lbnRzQ291bnQtLTtcbiAgaWYgKHJlc2l6ZUludGVydmFsRWxlbWVudHNDb3VudCA8IDEpIHtcbiAgICBjbGVhckludGVydmFsKHJlc2l6ZUludGVydmFsVGltZXIpO1xuICB9XG59O1xuXG52YXIgb25SZXNpemUgPSBmdW5jdGlvbiAocmVmLCBmbikge1xuICBmbihyZWYpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSB7XG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMub25SZXNpemVXaW5kb3cpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMub25SZXNpemVXaW5kb3cpO1xuICAgICAgfVxuICAgICAgdGhpcy5yZXNpemVFbGVtZW50UmVmcyA9IHt9O1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMub25SZXNpemVXaW5kb3cpIHtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMub25SZXNpemVXaW5kb3cpO1xuICAgICAgfVxuICAgICAgT2JqZWN0LmtleXModGhpcy5yZXNpemVFbGVtZW50UmVmcykuZm9yRWFjaChmdW5jdGlvbiAocmVmKSB7XG4gICAgICAgIHJlbW92ZVJlc2l6ZUludGVydmFsSGFuZGxlcnModGhpcy5yZWZzW3JlZl0uZ2V0RE9NTm9kZSgpKTtcbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSxcblxuICAgIHNldE9uUmVzaXplOiBmdW5jdGlvbiAocmVmLCBmbikge1xuICAgICAgaWYgKCF0aGlzLnJlc2l6ZUVsZW1lbnRSZWZzW3JlZl0pIHtcbiAgICAgICAgdGhpcy5yZXNpemVFbGVtZW50UmVmc1tyZWZdID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGFkZFJlc2l6ZUludGVydmFsSGFuZGxlcih0aGlzLnJlZnNbcmVmXS5nZXRET01Ob2RlKCksIG9uUmVzaXplLmJpbmQodGhpcywgcmVmLCBmbikpO1xuICAgIH1cbiAgfTtcbn07XG4iLCIvLyAjIG1peGluLnVuZG8tc3RhY2tcblxuLypcbkdpdmVzIHlvdXIgY29tcG9uZW50IGFuIHVuZG8gc3RhY2suXG4qL1xuXG4vLyBodHRwOi8vcHJvbWV0aGV1c3Jlc2VhcmNoLmdpdGh1Yi5pby9yZWFjdC1mb3Jtcy9leGFtcGxlcy91bmRvLmh0bWxcblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgVW5kb1N0YWNrID0ge1xuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7dW5kbzogW10sIHJlZG86IFtdfTtcbiAgfSxcblxuICBzbmFwc2hvdDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHVuZG8gPSB0aGlzLnN0YXRlLnVuZG8uY29uY2F0KHRoaXMuZ2V0U3RhdGVTbmFwc2hvdCgpKTtcbiAgICBpZiAodHlwZW9mIHRoaXMuc3RhdGUudW5kb0RlcHRoID09PSAnbnVtYmVyJykge1xuICAgICAgaWYgKHVuZG8ubGVuZ3RoID4gdGhpcy5zdGF0ZS51bmRvRGVwdGgpIHtcbiAgICAgICAgdW5kby5zaGlmdCgpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnNldFN0YXRlKHt1bmRvOiB1bmRvLCByZWRvOiBbXX0pO1xuICB9LFxuXG4gIGhhc1VuZG86IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnVuZG8ubGVuZ3RoID4gMDtcbiAgfSxcblxuICBoYXNSZWRvOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5yZWRvLmxlbmd0aCA+IDA7XG4gIH0sXG5cbiAgcmVkbzogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fdW5kb0ltcGwodHJ1ZSk7XG4gIH0sXG5cbiAgdW5kbzogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fdW5kb0ltcGwoKTtcbiAgfSxcblxuICBfdW5kb0ltcGw6IGZ1bmN0aW9uKGlzUmVkbykge1xuICAgIHZhciB1bmRvID0gdGhpcy5zdGF0ZS51bmRvLnNsaWNlKDApO1xuICAgIHZhciByZWRvID0gdGhpcy5zdGF0ZS5yZWRvLnNsaWNlKDApO1xuICAgIHZhciBzbmFwc2hvdDtcblxuICAgIGlmIChpc1JlZG8pIHtcbiAgICAgIGlmIChyZWRvLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBzbmFwc2hvdCA9IHJlZG8ucG9wKCk7XG4gICAgICB1bmRvLnB1c2godGhpcy5nZXRTdGF0ZVNuYXBzaG90KCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodW5kby5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgc25hcHNob3QgPSB1bmRvLnBvcCgpO1xuICAgICAgcmVkby5wdXNoKHRoaXMuZ2V0U3RhdGVTbmFwc2hvdCgpKTtcbiAgICB9XG5cbiAgICB0aGlzLnNldFN0YXRlU25hcHNob3Qoc25hcHNob3QpO1xuICAgIHRoaXMuc2V0U3RhdGUoe3VuZG86dW5kbywgcmVkbzpyZWRvfSk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuICBwbHVnaW4uZXhwb3J0cyA9IFVuZG9TdGFjaztcbn07XG4iLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGJvb3RzdHJhcFxuXG4vKlxuVGhlIGJvb3RzdHJhcCBwbHVnaW4gYnVuZGxlIGV4cG9ydHMgYSBidW5jaCBvZiBcInByb3AgbW9kaWZpZXJcIiBwbHVnaW5zIHdoaWNoXG5tYW5pcHVsYXRlIHRoZSBwcm9wcyBnb2luZyBpbnRvIG1hbnkgb2YgdGhlIGNvbXBvbmVudHMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG52YXIgbW9kaWZpZXJzID0ge1xuXG4gICdmaWVsZCc6IHtjbGFzc05hbWU6ICdmb3JtLWdyb3VwJ30sXG4gICdoZWxwJzoge2NsYXNzTmFtZTogJ2hlbHAtYmxvY2snfSxcbiAgJ3NhbXBsZSc6IHtjbGFzc05hbWU6ICdoZWxwLWJsb2NrJ30sXG4gICd0ZXh0Jzoge2NsYXNzTmFtZTogJ2Zvcm0tY29udHJvbCd9LFxuICAndGV4dGFyZWEnOiB7Y2xhc3NOYW1lOiAnZm9ybS1jb250cm9sJ30sXG4gICdwcmV0dHktdGV4dGFyZWEnOiB7Y2xhc3NOYW1lOiAnZm9ybS1jb250cm9sJ30sXG4gICdqc29uJzoge2NsYXNzTmFtZTogJ2Zvcm0tY29udHJvbCd9LFxuICAnc2VsZWN0Jzoge2NsYXNzTmFtZTogJ2Zvcm0tY29udHJvbCd9LFxuICAvLydsaXN0Jzoge2NsYXNzTmFtZTogJ3dlbGwnfSxcbiAgJ2xpc3QtY29udHJvbCc6IHtjbGFzc05hbWU6ICdmb3JtLWlubGluZSd9LFxuICAnbGlzdC1pdGVtJzoge2NsYXNzTmFtZTogJ3dlbGwnfSxcbiAgJ2l0ZW0tY2hvaWNlcyc6IHtjbGFzc05hbWU6ICdmb3JtLWNvbnRyb2wnfSxcbiAgJ2FkZC1pdGVtJzoge2NsYXNzTmFtZTogJ2dseXBoaWNvbiBnbHlwaGljb24tcGx1cycsIGxhYmVsOiAnJ30sXG4gICdyZW1vdmUtaXRlbSc6IHtjbGFzc05hbWU6ICdnbHlwaGljb24gZ2x5cGhpY29uLXJlbW92ZScsIGxhYmVsOiAnJ30sXG4gICdtb3ZlLWl0ZW0tYmFjayc6IHtjbGFzc05hbWU6ICdnbHlwaGljb24gZ2x5cGhpY29uLWFycm93LXVwJywgbGFiZWw6ICcnfSxcbiAgJ21vdmUtaXRlbS1mb3J3YXJkJzoge2NsYXNzTmFtZTogJ2dseXBoaWNvbiBnbHlwaGljb24tYXJyb3ctZG93bicsIGxhYmVsOiAnJ31cbn07XG5cbi8vIEJ1aWxkIHRoZSBwbHVnaW4gYnVuZGxlLlxuXy5lYWNoKG1vZGlmaWVycywgZnVuY3Rpb24gKG1vZGlmaWVyLCBuYW1lKSB7XG5cbiAgZXhwb3J0c1snY29tcG9uZW50LXByb3BzLicgKyBuYW1lICsgJy5ib290c3RyYXAnXSA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICAgIHZhciB1dGlsID0gcGx1Z2luLnJlcXVpcmUoJ3V0aWwnKTtcblxuICAgIHBsdWdpbi5leHBvcnRzID0gW1xuICAgICAgbmFtZSxcbiAgICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQobW9kaWZpZXIuY2xhc3NOYW1lKSkge1xuICAgICAgICAgIHByb3BzLmNsYXNzTmFtZSA9IHV0aWwuY2xhc3NOYW1lKHByb3BzLmNsYXNzTmFtZSwgbW9kaWZpZXIuY2xhc3NOYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQobW9kaWZpZXIubGFiZWwpKSB7XG4gICAgICAgICAgcHJvcHMubGFiZWwgPSBtb2RpZmllci5sYWJlbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIF07XG4gIH07XG5cbn0pO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGRlZmF1bHQtc3R5bGVcblxuLypcblRoZSBkZWZhdWx0LXN0eWxlIHBsdWdpbiBidW5kbGUgZXhwb3J0cyBhIGJ1bmNoIG9mIFwicHJvcCBtb2RpZmllclwiIHBsdWdpbnMgd2hpY2hcbm1hbmlwdWxhdGUgdGhlIHByb3BzIGdvaW5nIGludG8gbWFueSBvZiB0aGUgY29tcG9uZW50cy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbnZhciBtb2RpZmllcnMgPSB7XG5cbiAgJ2ZpZWxkJzoge30sXG4gICdoZWxwJzoge30sXG4gICdzYW1wbGUnOiB7fSxcbiAgJ3RleHQnOiB7fSxcbiAgJ3RleHRhcmVhJzoge30sXG4gICdwcmV0dHktdGV4dGFyZWEnOiB7fSxcbiAgJ2pzb24nOiB7fSxcbiAgJ3NlbGVjdCc6IHt9LFxuICAnbGlzdCc6IHt9LFxuICAnbGlzdC1jb250cm9sJzoge30sXG4gICdsaXN0LWl0ZW0tY29udHJvbCc6IHt9LFxuICAnbGlzdC1pdGVtLXZhbHVlJzoge30sXG4gICdsaXN0LWl0ZW0nOiB7fSxcbiAgJ2l0ZW0tY2hvaWNlcyc6IHt9LFxuICAnYWRkLWl0ZW0nOiB7fSxcbiAgJ3JlbW92ZS1pdGVtJzoge30sXG4gICdtb3ZlLWl0ZW0tYmFjayc6IHt9LFxuICAnbW92ZS1pdGVtLWZvcndhcmQnOiB7fVxufTtcblxuLy8gQnVpbGQgdGhlIHBsdWdpbiBidW5kbGUuXG5fLmVhY2gobW9kaWZpZXJzLCBmdW5jdGlvbiAobW9kaWZpZXIsIG5hbWUpIHtcblxuICBleHBvcnRzWydjb21wb25lbnQtcHJvcHMuJyArIG5hbWUgKyAnLmRlZmF1bHQnXSA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICAgIHZhciB1dGlsID0gcGx1Z2luLnJlcXVpcmUoJ3V0aWwnKTtcblxuICAgIHBsdWdpbi5leHBvcnRzID0gW1xuICAgICAgbmFtZSxcbiAgICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICBwcm9wcy5jbGFzc05hbWUgPSB1dGlsLmNsYXNzTmFtZShwcm9wcy5jbGFzc05hbWUsIG5hbWUpO1xuICAgICAgfVxuICAgIF07XG4gIH07XG5cbn0pO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIHN0b3JlLm1lbW9yeVxuXG4vKlxuVGhlIG1lbW9yeSBzdG9yZSBwbHVnaW4ga2VlcHMgdGhlIHN0YXRlIG9mIGZpZWxkcywgZGF0YSwgYW5kIG1ldGFkYXRhLiBJdFxucmVzcG9uZHMgdG8gYWN0aW9ucyBhbmQgZW1pdHMgYSBjaGFuZ2UgZXZlbnQgaWYgdGhlcmUgYXJlIGFueSBjaGFuZ2VzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgdmFyIGNvbXBpbGVyID0gcGx1Z2luLnJlcXVpcmUoJ2NvbXBpbGVyJyk7XG4gIHZhciB1dGlsID0gcGx1Z2luLnJlcXVpcmUoJ3V0aWwnKTtcblxuICBwbHVnaW4uZXhwb3J0cyA9IGZ1bmN0aW9uIChmb3JtLCBlbWl0dGVyLCBvcHRpb25zKSB7XG5cbiAgICB2YXIgc3RvcmUgPSB7fTtcblxuICAgIHN0b3JlLmZpZWxkcyA9IFtdO1xuICAgIHN0b3JlLnRlbXBsYXRlTWFwID0ge307XG4gICAgc3RvcmUudmFsdWUgPSB7fTtcbiAgICBzdG9yZS5tZXRhID0ge307XG5cbiAgICAvLyBIZWxwZXIgdG8gc2V0dXAgZmllbGRzLiBGaWVsZCBkZWZpbml0aW9ucyBuZWVkIHRvIGJlIGV4cGFuZGVkLCBjb21waWxlZCxcbiAgICAvLyBldGMuXG5cbiAgICB2YXIgc2V0dXBGaWVsZHMgPSBmdW5jdGlvbiAoZmllbGRzKSB7XG4gICAgICBzdG9yZS5maWVsZHMgPSBjb21waWxlci5leHBhbmRGaWVsZHMoZmllbGRzKTtcbiAgICAgIHN0b3JlLmZpZWxkcyA9IGNvbXBpbGVyLmNvbXBpbGVGaWVsZHMoc3RvcmUuZmllbGRzKTtcbiAgICAgIHN0b3JlLnRlbXBsYXRlTWFwID0gY29tcGlsZXIudGVtcGxhdGVNYXAoc3RvcmUuZmllbGRzKTtcbiAgICAgIHN0b3JlLmZpZWxkcyA9IHN0b3JlLmZpZWxkcy5maWx0ZXIoZnVuY3Rpb24gKGRlZikge1xuICAgICAgICByZXR1cm4gIWRlZi50ZW1wbGF0ZTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBpZiAob3B0aW9ucy5maWVsZHMpIHtcbiAgICAgIHNldHVwRmllbGRzKG9wdGlvbnMuZmllbGRzKTtcbiAgICB9XG5cbiAgICBpZiAoIV8uaXNVbmRlZmluZWQob3B0aW9ucy52YWx1ZSkpIHtcbiAgICAgIHN0b3JlLnZhbHVlID0gdXRpbC5jb3B5VmFsdWUob3B0aW9ucy52YWx1ZSk7XG4gICAgfVxuXG4gICAgLy8gQ3VycmVudGx5LCBqdXN0IGEgc2luZ2xlIGV2ZW50IGZvciBhbnkgY2hhbmdlLlxuICAgIHZhciB1cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBlbWl0dGVyLmVtaXQoJ2NoYW5nZScsIHtcbiAgICAgICAgdmFsdWU6IHN0b3JlLnZhbHVlLFxuICAgICAgICBtZXRhOiBzdG9yZS5tZXRhLFxuICAgICAgICBmaWVsZHM6IHN0b3JlLmZpZWxkc1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIFdoZW4gZmllbGRzIGNoYW5nZSwgd2UgbmVlZCB0byBcImluZmxhdGVcIiB0aGVtLCBtZWFuaW5nIGV4cGFuZCB0aGVtIGFuZFxuICAgIC8vIHJ1biBhbnkgZXZhbHVhdGlvbnMgaW4gb3JkZXIgdG8gZ2V0IHRoZSBkZWZhdWx0IHZhbHVlIG91dC5cbiAgICBzdG9yZS5pbmZsYXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGZpZWxkID0gZm9ybS5maWVsZCgpO1xuICAgICAgZmllbGQuaW5mbGF0ZShmdW5jdGlvbiAocGF0aCwgdmFsdWUpIHtcbiAgICAgICAgc3RvcmUudmFsdWUgPSB1dGlsLnNldEluKHN0b3JlLnZhbHVlLCBwYXRoLCB2YWx1ZSk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgdmFyIGFjdGlvbnMgPSB7XG5cbiAgICAgIC8vIFNldCB2YWx1ZSBhdCBhIHBhdGguXG4gICAgICBzZXRWYWx1ZTogZnVuY3Rpb24gKHBhdGgsIHZhbHVlKSB7XG5cbiAgICAgICAgaWYgKF8uaXNVbmRlZmluZWQodmFsdWUpKSB7XG4gICAgICAgICAgdmFsdWUgPSBwYXRoO1xuICAgICAgICAgIHBhdGggPSBbXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGF0aC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICBzdG9yZS52YWx1ZSA9IHV0aWwuY29weVZhbHVlKHZhbHVlKTtcbiAgICAgICAgICBzdG9yZS5pbmZsYXRlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RvcmUudmFsdWUgPSB1dGlsLnNldEluKHN0b3JlLnZhbHVlLCBwYXRoLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgdXBkYXRlKCk7XG4gICAgICB9LFxuXG4gICAgICAvLyBSZW1vdmUgYSB2YWx1ZSBhdCBhIHBhdGguXG4gICAgICByZW1vdmVWYWx1ZTogZnVuY3Rpb24gKHBhdGgpIHtcblxuICAgICAgICBzdG9yZS52YWx1ZSA9IHV0aWwucmVtb3ZlSW4oc3RvcmUudmFsdWUsIHBhdGgpO1xuXG4gICAgICAgIHVwZGF0ZSgpO1xuICAgICAgfSxcblxuICAgICAgLy8gRXJhc2UgYSB2YWx1ZS4gVXNlciBhY3Rpb25zIGNhbiByZW1vdmUgdmFsdWVzLCBidXQgbm9kZXMgY2FuIGFsc29cbiAgICAgIC8vIGRpc2FwcGVhciBkdWUgdG8gY2hhbmdpbmcgZXZhbHVhdGlvbnMuIFRoaXMgYWN0aW9uIG9jY3VycyBhdXRvbWF0aWNhbGx5XG4gICAgICAvLyAoYW5kIG1heSBiZSB1bm5lY2Vzc2FyeSBpZiB0aGUgdmFsdWUgd2FzIGFscmVhZHkgcmVtb3ZlZCkuXG4gICAgICBlcmFzZVZhbHVlOiBmdW5jdGlvbiAocGF0aCkge1xuXG4gICAgICAgIHN0b3JlLnZhbHVlID0gdXRpbC5yZW1vdmVJbihzdG9yZS52YWx1ZSwgcGF0aCk7XG5cbiAgICAgICAgdXBkYXRlKCk7XG4gICAgICB9LFxuXG4gICAgICAvLyBBcHBlbmQgYSB2YWx1ZSB0byBhbiBhcnJheSBhdCBhIHBhdGguXG4gICAgICBhcHBlbmRWYWx1ZTogZnVuY3Rpb24gKHBhdGgsIHZhbHVlKSB7XG4gICAgICAgIHN0b3JlLnZhbHVlID0gdXRpbC5hcHBlbmRJbihzdG9yZS52YWx1ZSwgcGF0aCwgdmFsdWUpO1xuXG4gICAgICAgIHVwZGF0ZSgpO1xuICAgICAgfSxcblxuICAgICAgLy8gU3dhcCB2YWx1ZXMgb2YgdHdvIGtleXMuXG4gICAgICBtb3ZlVmFsdWU6IGZ1bmN0aW9uIChwYXRoLCBmcm9tS2V5LCB0b0tleSkge1xuICAgICAgICBzdG9yZS52YWx1ZSA9IHV0aWwubW92ZUluKHN0b3JlLnZhbHVlLCBwYXRoLCBmcm9tS2V5LCB0b0tleSk7XG5cbiAgICAgICAgdXBkYXRlKCk7XG4gICAgICB9LFxuXG4gICAgICAvLyBDaGFuZ2UgYWxsIHRoZSBmaWVsZHMuXG4gICAgICBzZXRGaWVsZHM6IGZ1bmN0aW9uIChmaWVsZHMpIHtcbiAgICAgICAgc2V0dXBGaWVsZHMoZmllbGRzKTtcbiAgICAgICAgc3RvcmUuaW5mbGF0ZSgpO1xuXG4gICAgICAgIHVwZGF0ZSgpO1xuICAgICAgfSxcblxuICAgICAgLy8gU2V0IGEgbWV0YWRhdGEgdmFsdWUgZm9yIGEga2V5LlxuICAgICAgc2V0TWV0YTogZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgICAgc3RvcmUubWV0YVtrZXldID0gdmFsdWU7XG4gICAgICAgIHVwZGF0ZSgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBfLmV4dGVuZChzdG9yZSwgYWN0aW9ucyk7XG5cbiAgICByZXR1cm4gc3RvcmU7XG4gIH07XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIHR5cGUuYXJyYXlcblxuLypcblN1cHBvcnQgYXJyYXkgdHlwZSB3aGVyZSBjaGlsZCBmaWVsZHMgYXJlIGR5bmFtaWNhbGx5IGRldGVybWluZWQgYmFzZWQgb24gdGhlXG52YWx1ZXMgb2YgdGhlIGFycmF5LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMuZGVmYXVsdCA9IFtdO1xuXG4gIHBsdWdpbi5leHBvcnRzLmZpZWxkcyA9IGZ1bmN0aW9uIChmaWVsZCkge1xuXG4gICAgaWYgKF8uaXNBcnJheShmaWVsZC52YWx1ZSkpIHtcbiAgICAgIHJldHVybiBmaWVsZC52YWx1ZS5tYXAoZnVuY3Rpb24gKHZhbHVlLCBpKSB7XG4gICAgICAgIHZhciBpdGVtID0gZmllbGQuaXRlbUZvclZhbHVlKHZhbHVlKTtcbiAgICAgICAgaXRlbS5rZXkgPSBpO1xuICAgICAgICByZXR1cm4gZmllbGQuY3JlYXRlQ2hpbGQoaXRlbSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgfTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIi8vICMgdHlwZS5ib29sZWFuXG5cbi8qXG5TdXBwb3J0IGEgdHJ1ZS9mYWxzZSB2YWx1ZS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMuZGVmYXVsdCA9IGZhbHNlO1xuXG4gIHBsdWdpbi5leHBvcnRzLmNvbXBpbGUgPSBmdW5jdGlvbiAoZGVmKSB7XG4gICAgaWYgKCFkZWYuY2hvaWNlcykge1xuICAgICAgZGVmLmNob2ljZXMgPSBbXG4gICAgICAgIHt2YWx1ZTogdHJ1ZSwgbGFiZWw6ICdZZXMnfSxcbiAgICAgICAge3ZhbHVlOiBmYWxzZSwgbGFiZWw6ICdObyd9XG4gICAgICBdO1xuICAgIH1cbiAgfTtcbn07XG4iLCIvLyAjIHR5cGUuanNvblxuXG4vKlxuQXJiaXRyYXJ5IEpTT04gdmFsdWUuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzLmRlZmF1bHQgPSBudWxsO1xuXG59O1xuIiwiLy8gIyB0eXBlLm51bWJlclxuXG4vKlxuU3VwcG9ydCBudW1iZXIgdmFsdWVzLCBvZiBjb3Vyc2UuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzLmRlZmF1bHQgPSAwO1xuXG59O1xuIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyB0eXBlLm9iamVjdFxuXG4vKlxuU3VwcG9ydCBmb3Igb2JqZWN0IHR5cGVzLiBPYmplY3QgZmllbGRzIGNhbiBzdXBwbHkgc3RhdGljIGNoaWxkIGZpZWxkcywgb3IgaWZcbnRoZXJlIGFyZSBhZGRpdGlvbmFsIGNoaWxkIGtleXMsIGR5bmFtaWMgY2hpbGQgZmllbGRzIHdpbGwgYmUgY3JlYXRlZCBtdWNoXG5saWtlIGFuIGFycmF5LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgdmFyIHV0aWwgPSBwbHVnaW4ucmVxdWlyZSgndXRpbCcpO1xuXG4gIHBsdWdpbi5leHBvcnRzLmRlZmF1bHQgPSB7fTtcblxuICBwbHVnaW4uZXhwb3J0cy5maWVsZHMgPSBmdW5jdGlvbiAoZmllbGQpIHtcblxuICAgIHZhciBmaWVsZHMgPSBbXTtcbiAgICB2YXIgdmFsdWUgPSBmaWVsZC52YWx1ZTtcbiAgICB2YXIgdW51c2VkS2V5cyA9IF8ua2V5cyh2YWx1ZSk7XG5cbiAgICBpZiAoZmllbGQuZGVmLmZpZWxkcykge1xuXG4gICAgICBmaWVsZHMgPSBmaWVsZC5kZWYuZmllbGRzLm1hcChmdW5jdGlvbiAoZGVmKSB7XG4gICAgICAgIHZhciBjaGlsZCA9IGZpZWxkLmNyZWF0ZUNoaWxkKGRlZik7XG4gICAgICAgIGlmICghdXRpbC5pc0JsYW5rKGNoaWxkLmRlZi5rZXkpKSB7XG4gICAgICAgICAgdW51c2VkS2V5cyA9IF8ud2l0aG91dCh1bnVzZWRLZXlzLCBjaGlsZC5kZWYua2V5KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2hpbGQ7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodW51c2VkS2V5cy5sZW5ndGggPiAwKSB7XG4gICAgICB1bnVzZWRLZXlzLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICB2YXIgaXRlbSA9IGZpZWxkLml0ZW1Gb3JWYWx1ZSh2YWx1ZVtrZXldKTtcbiAgICAgICAgaXRlbS5sYWJlbCA9IHV0aWwuaHVtYW5pemUoa2V5KTtcbiAgICAgICAgaXRlbS5rZXkgPSBrZXk7XG4gICAgICAgIGZpZWxkcy5wdXNoKGZpZWxkLmNyZWF0ZUNoaWxkKGl0ZW0pKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBmaWVsZHM7XG4gIH07XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIvLyAjIHR5cGUucm9vdFxuXG4vKlxuU3BlY2lhbCB0eXBlIHJlcHJlc2VudGluZyB0aGUgcm9vdCBvZiB0aGUgZm9ybS4gR2V0cyB0aGUgZmllbGRzIGRpcmVjdGx5IGZyb21cbnRoZSBzdG9yZS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMuZmllbGRzID0gZnVuY3Rpb24gKGZpZWxkKSB7XG5cbiAgICByZXR1cm4gZmllbGQuZm9ybS5zdG9yZS5maWVsZHMubWFwKGZ1bmN0aW9uIChkZWYpIHtcbiAgICAgIHJldHVybiBmaWVsZC5jcmVhdGVDaGlsZChkZWYpO1xuICAgIH0pO1xuXG4gIH07XG59O1xuIiwiLy8gIyB0eXBlLnN0cmluZ1xuXG4vKlxuU3VwcG9ydCBzdHJpbmcgdmFsdWVzLCBvZiBjb3Vyc2UuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzLmRlZmF1bHQgPSAnJztcblxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBSZXByZXNlbnRhdGlvbiBvZiBhIHNpbmdsZSBFdmVudEVtaXR0ZXIgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gRXZlbnQgaGFuZGxlciB0byBiZSBjYWxsZWQuXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IENvbnRleHQgZm9yIGZ1bmN0aW9uIGV4ZWN1dGlvbi5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb25jZSBPbmx5IGVtaXQgb25jZVxuICogQGFwaSBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIEVFKGZuLCBjb250ZXh0LCBvbmNlKSB7XG4gIHRoaXMuZm4gPSBmbjtcbiAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbiAgdGhpcy5vbmNlID0gb25jZSB8fCBmYWxzZTtcbn1cblxuLyoqXG4gKiBNaW5pbWFsIEV2ZW50RW1pdHRlciBpbnRlcmZhY2UgdGhhdCBpcyBtb2xkZWQgYWdhaW5zdCB0aGUgTm9kZS5qc1xuICogRXZlbnRFbWl0dGVyIGludGVyZmFjZS5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBhcGkgcHVibGljXG4gKi9cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHsgLyogTm90aGluZyB0byBzZXQgKi8gfVxuXG4vKipcbiAqIEhvbGRzIHRoZSBhc3NpZ25lZCBFdmVudEVtaXR0ZXJzIGJ5IG5hbWUuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqIEBwcml2YXRlXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBSZXR1cm4gYSBsaXN0IG9mIGFzc2lnbmVkIGV2ZW50IGxpc3RlbmVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50cyB0aGF0IHNob3VsZCBiZSBsaXN0ZWQuXG4gKiBAcmV0dXJucyB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uIGxpc3RlbmVycyhldmVudCkge1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW2V2ZW50XSkgcmV0dXJuIFtdO1xuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5fZXZlbnRzW2V2ZW50XS5sZW5ndGgsIGVlID0gW107IGkgPCBsOyBpKyspIHtcbiAgICBlZS5wdXNoKHRoaXMuX2V2ZW50c1tldmVudF1baV0uZm4pO1xuICB9XG5cbiAgcmV0dXJuIGVlO1xufTtcblxuLyoqXG4gKiBFbWl0IGFuIGV2ZW50IHRvIGFsbCByZWdpc3RlcmVkIGV2ZW50IGxpc3RlbmVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIG5hbWUgb2YgdGhlIGV2ZW50LlxuICogQHJldHVybnMge0Jvb2xlYW59IEluZGljYXRpb24gaWYgd2UndmUgZW1pdHRlZCBhbiBldmVudC5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIGVtaXQoZXZlbnQsIGExLCBhMiwgYTMsIGE0LCBhNSkge1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW2V2ZW50XSkgcmV0dXJuIGZhbHNlO1xuXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbZXZlbnRdXG4gICAgLCBsZW5ndGggPSBsaXN0ZW5lcnMubGVuZ3RoXG4gICAgLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgLCBlZSA9IGxpc3RlbmVyc1swXVxuICAgICwgYXJnc1xuICAgICwgaSwgajtcblxuICBpZiAoMSA9PT0gbGVuZ3RoKSB7XG4gICAgaWYgKGVlLm9uY2UpIHRoaXMucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGVlLmZuLCB0cnVlKTtcblxuICAgIHN3aXRjaCAobGVuKSB7XG4gICAgICBjYXNlIDE6IHJldHVybiBlZS5mbi5jYWxsKGVlLmNvbnRleHQpLCB0cnVlO1xuICAgICAgY2FzZSAyOiByZXR1cm4gZWUuZm4uY2FsbChlZS5jb250ZXh0LCBhMSksIHRydWU7XG4gICAgICBjYXNlIDM6IHJldHVybiBlZS5mbi5jYWxsKGVlLmNvbnRleHQsIGExLCBhMiksIHRydWU7XG4gICAgICBjYXNlIDQ6IHJldHVybiBlZS5mbi5jYWxsKGVlLmNvbnRleHQsIGExLCBhMiwgYTMpLCB0cnVlO1xuICAgICAgY2FzZSA1OiByZXR1cm4gZWUuZm4uY2FsbChlZS5jb250ZXh0LCBhMSwgYTIsIGEzLCBhNCksIHRydWU7XG4gICAgICBjYXNlIDY6IHJldHVybiBlZS5mbi5jYWxsKGVlLmNvbnRleHQsIGExLCBhMiwgYTMsIGE0LCBhNSksIHRydWU7XG4gICAgfVxuXG4gICAgZm9yIChpID0gMSwgYXJncyA9IG5ldyBBcnJheShsZW4gLTEpOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgIH1cblxuICAgIGVlLmZuLmFwcGx5KGVlLmNvbnRleHQsIGFyZ3MpO1xuICB9IGVsc2Uge1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGxpc3RlbmVyc1tpXS5vbmNlKSB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcnNbaV0uZm4sIHRydWUpO1xuXG4gICAgICBzd2l0Y2ggKGxlbikge1xuICAgICAgICBjYXNlIDE6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0KTsgYnJlYWs7XG4gICAgICAgIGNhc2UgMjogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExKTsgYnJlYWs7XG4gICAgICAgIGNhc2UgMzogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExLCBhMik7IGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGlmICghYXJncykgZm9yIChqID0gMSwgYXJncyA9IG5ldyBBcnJheShsZW4gLTEpOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaiAtIDFdID0gYXJndW1lbnRzW2pdO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxpc3RlbmVyc1tpXS5mbi5hcHBseShsaXN0ZW5lcnNbaV0uY29udGV4dCwgYXJncyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vKipcbiAqIFJlZ2lzdGVyIGEgbmV3IEV2ZW50TGlzdGVuZXIgZm9yIHRoZSBnaXZlbiBldmVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgTmFtZSBvZiB0aGUgZXZlbnQuXG4gKiBAcGFyYW0ge0Z1bmN0b259IGZuIENhbGxiYWNrIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBUaGUgY29udGV4dCBvZiB0aGUgZnVuY3Rpb24uXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gb24oZXZlbnQsIGZuLCBjb250ZXh0KSB7XG4gIGlmICghdGhpcy5fZXZlbnRzKSB0aGlzLl9ldmVudHMgPSB7fTtcbiAgaWYgKCF0aGlzLl9ldmVudHNbZXZlbnRdKSB0aGlzLl9ldmVudHNbZXZlbnRdID0gW107XG4gIHRoaXMuX2V2ZW50c1tldmVudF0ucHVzaChuZXcgRUUoIGZuLCBjb250ZXh0IHx8IHRoaXMgKSk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZCBhbiBFdmVudExpc3RlbmVyIHRoYXQncyBvbmx5IGNhbGxlZCBvbmNlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBOYW1lIG9mIHRoZSBldmVudC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIENhbGxiYWNrIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBUaGUgY29udGV4dCBvZiB0aGUgZnVuY3Rpb24uXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbiBvbmNlKGV2ZW50LCBmbiwgY29udGV4dCkge1xuICBpZiAoIXRoaXMuX2V2ZW50cykgdGhpcy5fZXZlbnRzID0ge307XG4gIGlmICghdGhpcy5fZXZlbnRzW2V2ZW50XSkgdGhpcy5fZXZlbnRzW2V2ZW50XSA9IFtdO1xuICB0aGlzLl9ldmVudHNbZXZlbnRdLnB1c2gobmV3IEVFKGZuLCBjb250ZXh0IHx8IHRoaXMsIHRydWUgKSk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBldmVudCBsaXN0ZW5lcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCB3ZSB3YW50IHRvIHJlbW92ZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBsaXN0ZW5lciB0aGF0IHdlIG5lZWQgdG8gZmluZC5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb25jZSBPbmx5IHJlbW92ZSBvbmNlIGxpc3RlbmVycy5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcihldmVudCwgZm4sIG9uY2UpIHtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1tldmVudF0pIHJldHVybiB0aGlzO1xuXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbZXZlbnRdXG4gICAgLCBldmVudHMgPSBbXTtcblxuICBpZiAoZm4pIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBsaXN0ZW5lcnMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBpZiAobGlzdGVuZXJzW2ldLmZuICE9PSBmbiAmJiBsaXN0ZW5lcnNbaV0ub25jZSAhPT0gb25jZSkge1xuICAgICAgZXZlbnRzLnB1c2gobGlzdGVuZXJzW2ldKTtcbiAgICB9XG4gIH1cblxuICAvL1xuICAvLyBSZXNldCB0aGUgYXJyYXksIG9yIHJlbW92ZSBpdCBjb21wbGV0ZWx5IGlmIHdlIGhhdmUgbm8gbW9yZSBsaXN0ZW5lcnMuXG4gIC8vXG4gIGlmIChldmVudHMubGVuZ3RoKSB0aGlzLl9ldmVudHNbZXZlbnRdID0gZXZlbnRzO1xuICBlbHNlIHRoaXMuX2V2ZW50c1tldmVudF0gPSBudWxsO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYWxsIGxpc3RlbmVycyBvciBvbmx5IHRoZSBsaXN0ZW5lcnMgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCB3YW50IHRvIHJlbW92ZSBhbGwgbGlzdGVuZXJzIGZvci5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24gcmVtb3ZlQWxsTGlzdGVuZXJzKGV2ZW50KSB7XG4gIGlmICghdGhpcy5fZXZlbnRzKSByZXR1cm4gdGhpcztcblxuICBpZiAoZXZlbnQpIHRoaXMuX2V2ZW50c1tldmVudF0gPSBudWxsO1xuICBlbHNlIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy9cbi8vIEFsaWFzIG1ldGhvZHMgbmFtZXMgYmVjYXVzZSBwZW9wbGUgcm9sbCBsaWtlIHRoYXQuXG4vL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vZmYgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUub247XG5cbi8vXG4vLyBUaGlzIGZ1bmN0aW9uIGRvZXNuJ3QgYXBwbHkgYW55bW9yZS5cbi8vXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uIHNldE1heExpc3RlbmVycygpIHtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vL1xuLy8gRXhwb3NlIHRoZSBtb2R1bGUuXG4vL1xuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIyID0gRXZlbnRFbWl0dGVyO1xuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlcjMgPSBFdmVudEVtaXR0ZXI7XG5cbmlmICgnb2JqZWN0JyA9PT0gdHlwZW9mIG1vZHVsZSAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvZm9ybWF0aWMnKTtcbiJdfQ==
