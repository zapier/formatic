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
      var metaArgs, metaGet, hiddenTest;

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
        hiddenTest = ['@and'].concat(keys.map(function (key) {
          return ['@get', 'item', key];
        }));
        def.eval[choicesPropName] = metaForEach.concat([
          ['@or', metaGet, ['@if', hiddenTest, ['///loading///'], []]],
          ['@or', hiddenTest, metaGet]
        ]);
      } else {
        keys.forEach(function (key) {
          params[key] = ['@get', key];
        });
        metaArgs = [lookup.source].concat(params);
        metaGet = ['@getMeta'].concat(metaArgs);
        var metaGetOrLoading = ['@or', metaGet, ['///loading///']];
        def.eval.needsMeta.push(['@if', metaGet, null, metaArgs]);
        def.eval[choicesPropName] = metaGetOrLoading;
        if (keys.length > 0) {
          // Test that we have all needed keys.
          hiddenTest = ['@and'].concat(keys.map(function (key) {
            return ['@get', key];
          }));
          // Reverse test so we hide if don't have all keys.
          hiddenTest = ['@not', hiddenTest];
          if (!def.eval.hidden) {
            def.eval.hidden = hiddenTest;
          }
        }
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
    decimal: 'number',
    int: 'number'
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
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

var CSSTransitionGroup = React.createFactory(React.addons.CSSTransitionGroup);

module.exports = function (plugin) {

  plugin.exports = React.createClass({

    mixins: [
      //plugin.require('mixin.resize'),
      //plugin.require('mixin.scroll'),
      plugin.require('mixin.click-outside')
    ],

    getInitialState: function () {
      return {
        maxHeight: null,
        open: this.props.open
      };
    },
    //
    // onToggle: function () {
    //   this.setState({open: !this.state.open});
    // },
    //
    // onClose: function () {
    //   this.setState({open: false});
    // },
    //
    // fixChoicesWidth: function () {
    //   this.setState({
    //     choicesWidth: this.refs.active.getDOMNode().offsetWidth
    //   });
    // },
    //
    // onResizeWindow: function () {
    //   this.fixChoicesWidth();
    // },

    // componentDidMount: function () {
    //   this.fixChoicesWidth();
    //   this.setOnClickOutside('select', this.onClose);
    // },

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

    onScroll: function (event) {
      // console.log('stop that!')
      // event.preventDefault();
      // event.stopPropagation();
    },

    onWheel: function (event) {
      // event.preventDefault();
      // event.stopPropagation();
    },

    render: function () {

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


      // var className = formatic.className('dropdown-field', plugin.config.className, this.props.field.className);
      //
      // var selectedLabel = '';
      // var matchingLabels = this.props.field.choices.filter(function (choice) {
      //   return choice.value === this.props.field.value;
      // }.bind(this));
      // if (matchingLabels.length > 0) {
      //   selectedLabel = matchingLabels[0].label;
      // }
      // selectedLabel = selectedLabel || '\u00a0';
      //
      // return R.div(_.extend({className: className, ref: 'select'}, plugin.config.attributes),
      //   R.div({className: 'field-value', ref: 'active', onClick: this.onToggle}, selectedLabel),
      //   R.div({className: 'field-toggle ' + (this.state.open ? 'field-open' : 'field-closed'), onClick: this.onToggle}),
      //   React.addons.CSSTransitionGroup({transitionName: 'reveal'},
      //     R.div({className: 'field-choices-container'},
      //       this.state.open ? R.ul({ref: 'choices', className: 'field-choices', style: {width: this.state.choicesWidth}},
      //         this.props.field.choices.map(function (choice) {
      //           return R.li({
      //             className: 'field-choice',
      //             onClick: function () {
      //               this.setState({open: false});
      //               this.props.form.actions.change(this.props.field, choice.value);
      //             }.bind(this)
      //           }, choice.label);
      //         }.bind(this))
      //       ) : []
      //     )
      //   )
      // );
    }
  });
};


// componentDidMount: function () {
//   this.setOnClickOutside('choices', function (event) {
//
//     // Make sure we don't find any nodes to ignore.
//     if (!_.find(this.getIgnoreCloseNodes(), function (node) {
//       console.log(node, event.target)
//       return !this.isNodeOutside(node, event.target);
//     }.bind(this))) {
//       console.log("how???")
//       this.props.onClose();
//     }
//   }.bind(this));
// },
//
// onSelect: function (choice) {
//   this.props.onSelect(choice.value);
// },
//
// render: function () {
//
//   return R.div({ref: 'container', className: 'choices-container', style: {userSelect: 'none', WebkitUserSelect: 'none', position: 'absolute'}},
//     this.props.open ?
//       CSSTransitionGroup({transitionName: 'reveal'},
//         R.ul({ref: 'choices', className: 'choices'},
//           this.props.choices.map(function (choice, i) {
//             return R.li({key: i, className: 'choice'},
//               R.a({href: 'JavaScript:' + '', onClick: this.onSelect.bind(this, choice)},
//                 R.span({className: 'choice-label'},
//                   choice.label
//                 ),
//                 R.span({className: 'choice-sample'},
//                   choice.sample
//                 )
//               )
//             );
//           }.bind(this))
//         )
//       )
//       : null
//   );

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],8:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
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
},{}],10:[function(require,module,exports){
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

    onFormChanged: function (event) {
      if (this.props.onChange) {
        this.props.onChange(this.props.form.val(), event.changing);
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
},{}],11:[function(require,module,exports){
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
},{}],12:[function(require,module,exports){
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
},{}],13:[function(require,module,exports){
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
        value: JSON.stringify(this.props.field.value, null, 2)
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
},{}],14:[function(require,module,exports){
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
},{}],15:[function(require,module,exports){
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
},{}],16:[function(require,module,exports){
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
},{}],17:[function(require,module,exports){
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
},{}],18:[function(require,module,exports){
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
},{}],19:[function(require,module,exports){
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
},{}],20:[function(require,module,exports){
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
},{}],21:[function(require,module,exports){
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
},{}],22:[function(require,module,exports){
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
        undoDepth: 100,
        isChoicesOpen: false,
        hoverPillRef: null
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
      var cleaned = removeIdPrefix(key);
      return util.humanize(cleaned);
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

      if (pos === endPos && !this.leftArrowDown && !this.rightArrowDown) {
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
        this.props.field.val(rawValue);

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
        this.props.field.val(newValue);
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
      this.props.field.val(newValue);
      this.setState({
        isChoicesOpen: false
      });
    },

    onToggleChoices: function () {
      this.setState({
        isChoicesOpen: !this.state.isChoicesOpen
      });
    },

    onCloseChoices: function (event) {
      this.setState({
        isChoicesOpen: false
      });
    },

    getCloseIgnoreNodes: function () {
      return this.refs.toggle.getDOMNode();
    },

    onClickOutsideChoices: function (event) {
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
      var field = this.props.field;

      var replaceChoices = field.def.replaceChoices;

      // var selectReplaceChoices = [{
      //   value: '',
      //   label: 'Insert...'
      // }].concat(replaceChoices);

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
            left: 0,
            cursor: this.state.hoverPillRef ? 'pointer' : null
          },
          onKeyPress: this.onKeyPress,
          onKeyDown: this.onKeyDown,
          onKeyUp: this.onKeyUp,
          onSelect: this.onSelect,
          onCopy: this.onCopy,
          onCut: this.onCut,
          onMouseMove: this.onMouseMove
        }, plugin.config.attributes)),

        R.a({ref: 'toggle', href: 'JavaScript' + ':', onClick: this.onToggleChoices}, 'Insert...'),

        plugin.component('choices')({
          ref: 'choices',
          choices: replaceChoices, open: this.state.isChoicesOpen,
          onSelect: this.onInsert, onClose: this.onCloseChoices, ignoreCloseNodes: this.getCloseIgnoreNodes})
        //,

        // R.select({onChange: this.onInsertFromSelect},
        //   selectReplaceChoices.map(function (choice, i) {
        //     return R.option({
        //       key: i,
        //       value: choice.value
        //     }, choice.label);
        //   })
        // )
      ));
    }
  });
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],23:[function(require,module,exports){
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
},{}],24:[function(require,module,exports){
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
},{}],25:[function(require,module,exports){
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
},{}],26:[function(require,module,exports){
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

      var choicesOrLoading;

      if (choices.length === 1 && choices[0].value === '///loading///') {
        choicesOrLoading = R.div({},
          'Loading choices...'
        );
      } else {

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

        choicesOrLoading = R.select({
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
        );
      }

      return plugin.component('field')({
        field: field
      }, choicesOrLoading);
    }
  });
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],27:[function(require,module,exports){
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
},{}],28:[function(require,module,exports){
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
},{}],29:[function(require,module,exports){
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
          if (def.fields) {
            def.fields = def.fields.map(function (childDef) {
              childDef = compiler.expandDef(childDef, field.form.store.templateMap);
              return compiler.compileDef(childDef);
            });
          }
          def = compiler.compileDef(def);
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
},{}],30:[function(require,module,exports){
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

},{}],31:[function(require,module,exports){
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
},{"eventemitter3":59}],32:[function(require,module,exports){
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
},{}],33:[function(require,module,exports){
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

    //console.log('in:', JSON.stringify(def))

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

    if (def.fields) {
      // Compile any inline fields.
      def.fields = def.fields.map(function (childDef) {
        if (_.isObject(childDef)) {
          return compiler.compileDef(childDef);
        }
        return childDef;
      });
    }

    //console.log('out:', JSON.stringify(def))

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
},{}],34:[function(require,module,exports){
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
},{}],35:[function(require,module,exports){
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
},{}],36:[function(require,module,exports){
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
},{}],37:[function(require,module,exports){
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
},{}],38:[function(require,module,exports){
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
},{}],39:[function(require,module,exports){
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
},{}],40:[function(require,module,exports){
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

},{}],41:[function(require,module,exports){
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
},{}],42:[function(require,module,exports){
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
  ['component.choices', require('./components/choices')],

  ['mixin.click-outside', require('./mixins/click-outside')],
  ['mixin.field', require('./mixins/field')],
  ['mixin.input-actions', require('./mixins/input-actions')],
  ['mixin.resize', require('./mixins/resize')],
  ['mixin.scroll', require('./mixins/scroll')],
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
},{"./compilers/choices":1,"./compilers/lookup":2,"./compilers/prop-aliases":3,"./compilers/types":4,"./components/add-item":5,"./components/checkbox-list":6,"./components/choices":7,"./components/field":8,"./components/fieldset":9,"./components/formatic":10,"./components/help":11,"./components/item-choices":12,"./components/json":13,"./components/label":14,"./components/list":19,"./components/list-control":15,"./components/list-item":18,"./components/list-item-control":16,"./components/list-item-value":17,"./components/move-item-back":20,"./components/move-item-forward":21,"./components/pretty-textarea":22,"./components/remove-item":23,"./components/root":24,"./components/sample":25,"./components/select":26,"./components/text":27,"./components/textarea":28,"./core/field":29,"./core/form":31,"./core/form-init":30,"./core/formatic":32,"./default/compiler":33,"./default/component":34,"./default/core":35,"./default/eval":37,"./default/eval-functions":36,"./default/field-router":38,"./default/field-routes":39,"./default/loader":40,"./default/util":41,"./mixins/click-outside":43,"./mixins/field":44,"./mixins/input-actions":45,"./mixins/resize":46,"./mixins/scroll":47,"./mixins/undo-stack":48,"./plugins/bootstrap-style":49,"./plugins/default-style":50,"./store/memory":51,"./types/array":52,"./types/boolean":53,"./types/json":54,"./types/number":55,"./types/object":56,"./types/root":57,"./types/string":58}],43:[function(require,module,exports){
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

module.exports = function (plugin) {

  plugin.exports = {

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
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],44:[function(require,module,exports){
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
},{}],45:[function(require,module,exports){
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

},{}],46:[function(require,module,exports){
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

},{}],47:[function(require,module,exports){
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

},{}],48:[function(require,module,exports){
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

},{}],49:[function(require,module,exports){
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
},{}],50:[function(require,module,exports){
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
},{}],51:[function(require,module,exports){
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
    var update = function (changing) {
      emitter.emit('change', {
        value: store.value,
        meta: store.meta,
        fields: store.fields,
        changing: changing
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

        var oldValue = util.getIn(store.value, path);

        if (path.length === 0) {
          store.value = util.copyValue(value);
          store.inflate();
        } else {
          store.value = util.setIn(store.value, path, value);
        }
        update({'path': path, 'new': value, 'old': oldValue, 'action': 'set'});
      },

      // Remove a value at a path.
      removeValue: function (path) {
        var oldValue = util.getIn(store.value, path);
        store.value = util.removeIn(store.value, path);

        update({'path': path, 'old': oldValue, 'action': 'remove'});
      },

      // Erase a value. User actions can remove values, but nodes can also
      // disappear due to changing evaluations. This action occurs automatically
      // (and may be unnecessary if the value was already removed).
      eraseValue: function (path) {

        store.value = util.removeIn(store.value, path);

        update({});
      },

      // Append a value to an array at a path.
      appendValue: function (path, value) {
        var oldValue = util.getIn(store.value, path);
        store.value = util.appendIn(store.value, path, value);

        update({'path': path, 'new': value, 'old': oldValue, 'action': 'append'});
      },

      // Swap values of two keys.
      moveValue: function (path, fromKey, toKey) {
        var oldValue = util.getIn(store.value, path);
        store.value = util.moveIn(store.value, path, fromKey, toKey);

        update({'path': path, 'new': oldValue, 'old': oldValue, 'fromKey': fromKey, 'toKey': toKey, 'action': 'move'});
      },

      // Change all the fields.
      setFields: function (fields) {
        setupFields(fields);
        store.inflate();

        update({'action': 'setFields'});
      },

      // Set a metadata value for a key.
      setMeta: function (key, value) {
        store.meta[key] = value;
        update({'action': 'setMeta'});
      }
    };

    _.extend(store, actions);

    return store;
  };
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],52:[function(require,module,exports){
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
},{}],53:[function(require,module,exports){
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

},{}],54:[function(require,module,exports){
// # type.json

/*
Arbitrary JSON value.
*/

'use strict';

module.exports = function (plugin) {

  plugin.exports.default = null;

};

},{}],55:[function(require,module,exports){
// # type.number

/*
Support number values, of course.
*/

'use strict';

module.exports = function (plugin) {

  plugin.exports.default = 0;

};

},{}],56:[function(require,module,exports){
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
},{}],57:[function(require,module,exports){
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

},{}],58:[function(require,module,exports){
// # type.string

/*
Support string values, of course.
*/

'use strict';

module.exports = function (plugin) {

  plugin.exports.default = '';

};

},{}],59:[function(require,module,exports){
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

},{"./lib/formatic":42}]},{},[])("formatic")
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvY29tcGlsZXJzL2Nob2ljZXMuanMiLCJsaWIvY29tcGlsZXJzL2xvb2t1cC5qcyIsImxpYi9jb21waWxlcnMvcHJvcC1hbGlhc2VzLmpzIiwibGliL2NvbXBpbGVycy90eXBlcy5qcyIsImxpYi9jb21wb25lbnRzL2FkZC1pdGVtLmpzIiwibGliL2NvbXBvbmVudHMvY2hlY2tib3gtbGlzdC5qcyIsImxpYi9jb21wb25lbnRzL2Nob2ljZXMuanMiLCJsaWIvY29tcG9uZW50cy9maWVsZC5qcyIsImxpYi9jb21wb25lbnRzL2ZpZWxkc2V0LmpzIiwibGliL2NvbXBvbmVudHMvZm9ybWF0aWMuanMiLCJsaWIvY29tcG9uZW50cy9oZWxwLmpzIiwibGliL2NvbXBvbmVudHMvaXRlbS1jaG9pY2VzLmpzIiwibGliL2NvbXBvbmVudHMvanNvbi5qcyIsImxpYi9jb21wb25lbnRzL2xhYmVsLmpzIiwibGliL2NvbXBvbmVudHMvbGlzdC1jb250cm9sLmpzIiwibGliL2NvbXBvbmVudHMvbGlzdC1pdGVtLWNvbnRyb2wuanMiLCJsaWIvY29tcG9uZW50cy9saXN0LWl0ZW0tdmFsdWUuanMiLCJsaWIvY29tcG9uZW50cy9saXN0LWl0ZW0uanMiLCJsaWIvY29tcG9uZW50cy9saXN0LmpzIiwibGliL2NvbXBvbmVudHMvbW92ZS1pdGVtLWJhY2suanMiLCJsaWIvY29tcG9uZW50cy9tb3ZlLWl0ZW0tZm9yd2FyZC5qcyIsImxpYi9jb21wb25lbnRzL3ByZXR0eS10ZXh0YXJlYS5qcyIsImxpYi9jb21wb25lbnRzL3JlbW92ZS1pdGVtLmpzIiwibGliL2NvbXBvbmVudHMvcm9vdC5qcyIsImxpYi9jb21wb25lbnRzL3NhbXBsZS5qcyIsImxpYi9jb21wb25lbnRzL3NlbGVjdC5qcyIsImxpYi9jb21wb25lbnRzL3RleHQuanMiLCJsaWIvY29tcG9uZW50cy90ZXh0YXJlYS5qcyIsImxpYi9jb3JlL2ZpZWxkLmpzIiwibGliL2NvcmUvZm9ybS1pbml0LmpzIiwibGliL2NvcmUvZm9ybS5qcyIsImxpYi9jb3JlL2Zvcm1hdGljLmpzIiwibGliL2RlZmF1bHQvY29tcGlsZXIuanMiLCJsaWIvZGVmYXVsdC9jb21wb25lbnQuanMiLCJsaWIvZGVmYXVsdC9jb3JlLmpzIiwibGliL2RlZmF1bHQvZXZhbC1mdW5jdGlvbnMuanMiLCJsaWIvZGVmYXVsdC9ldmFsLmpzIiwibGliL2RlZmF1bHQvZmllbGQtcm91dGVyLmpzIiwibGliL2RlZmF1bHQvZmllbGQtcm91dGVzLmpzIiwibGliL2RlZmF1bHQvbG9hZGVyLmpzIiwibGliL2RlZmF1bHQvdXRpbC5qcyIsImxpYi9mb3JtYXRpYy5qcyIsImxpYi9taXhpbnMvY2xpY2stb3V0c2lkZS5qcyIsImxpYi9taXhpbnMvZmllbGQuanMiLCJsaWIvbWl4aW5zL2lucHV0LWFjdGlvbnMuanMiLCJsaWIvbWl4aW5zL3Jlc2l6ZS5qcyIsImxpYi9taXhpbnMvc2Nyb2xsLmpzIiwibGliL21peGlucy91bmRvLXN0YWNrLmpzIiwibGliL3BsdWdpbnMvYm9vdHN0cmFwLXN0eWxlLmpzIiwibGliL3BsdWdpbnMvZGVmYXVsdC1zdHlsZS5qcyIsImxpYi9zdG9yZS9tZW1vcnkuanMiLCJsaWIvdHlwZXMvYXJyYXkuanMiLCJsaWIvdHlwZXMvYm9vbGVhbi5qcyIsImxpYi90eXBlcy9qc29uLmpzIiwibGliL3R5cGVzL251bWJlci5qcyIsImxpYi90eXBlcy9vYmplY3QuanMiLCJsaWIvdHlwZXMvcm9vdC5qcyIsImxpYi90eXBlcy9zdHJpbmcuanMiLCJub2RlX21vZHVsZXMvZXZlbnRlbWl0dGVyMy9pbmRleC5qcyIsImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbFBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbFRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcGJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNU1BO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21waWxlci5jaG9pY2VzXG5cbi8qXG5Ob3JtYWxpemVzIHRoZSBjaG9pY2VzIGZvciBhIGZpZWxkLiBTdXBwb3J0cyB0aGUgZm9sbG93aW5nIGZvcm1hdHMuXG5cbmBgYGpzXG4ncmVkLCBibHVlJ1xuXG5bJ3JlZCcsICdibHVlJ11cblxue3JlZDogJ1JlZCcsIGJsdWU6ICdCbHVlJ31cblxuW3t2YWx1ZTogJ3JlZCcsIGxhYmVsOiAnUmVkJ30sIHt2YWx1ZTogJ2JsdWUnLCBsYWJlbDogJ0JsdWUnfV1cbmBgYFxuXG5BbGwgb2YgdGhvc2UgZm9ybWF0cyBhcmUgbm9ybWFsaXplZCB0bzpcblxuYGBganNcblt7dmFsdWU6ICdyZWQnLCBsYWJlbDogJ1JlZCd9LCB7dmFsdWU6ICdibHVlJywgbGFiZWw6ICdCbHVlJ31dXG5gYGBcbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHZhciB1dGlsID0gcGx1Z2luLnJlcXVpcmUoJ3V0aWwnKTtcblxuICB2YXIgY29tcGlsZUNob2ljZXMgPSBmdW5jdGlvbiAoY2hvaWNlcykge1xuXG4gICAgLy8gQ29udmVydCBjb21tYSBzZXBhcmF0ZWQgc3RyaW5nIHRvIGFycmF5IG9mIHN0cmluZ3MuXG4gICAgaWYgKF8uaXNTdHJpbmcoY2hvaWNlcykpIHtcbiAgICAgIGNob2ljZXMgPSBjaG9pY2VzLnNwbGl0KCcsJyk7XG4gICAgfVxuXG4gICAgLy8gQ29udmVydCBvYmplY3QgdG8gYXJyYXkgb2Ygb2JqZWN0cyB3aXRoIGB2YWx1ZWAgYW5kIGBsYWJlbGAgcHJvcGVydGllcy5cbiAgICBpZiAoIV8uaXNBcnJheShjaG9pY2VzKSAmJiBfLmlzT2JqZWN0KGNob2ljZXMpKSB7XG4gICAgICBjaG9pY2VzID0gT2JqZWN0LmtleXMoY2hvaWNlcykubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB2YWx1ZToga2V5LFxuICAgICAgICAgIGxhYmVsOiBjaG9pY2VzW2tleV1cbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIENvcHkgdGhlIGFycmF5IG9mIGNob2ljZXMgc28gd2UgY2FuIG1hbmlwdWxhdGUgdGhlbS5cbiAgICBjaG9pY2VzID0gY2hvaWNlcy5zbGljZSgwKTtcblxuICAgIC8vIEFycmF5IG9mIGNob2ljZSBhcnJheXMgc2hvdWxkIGJlIGZsYXR0ZW5lZC5cbiAgICBjaG9pY2VzID0gXy5mbGF0dGVuKGNob2ljZXMpO1xuXG4gICAgY2hvaWNlcy5mb3JFYWNoKGZ1bmN0aW9uIChjaG9pY2UsIGkpIHtcbiAgICAgIC8vIENvbnZlcnQgYW55IHN0cmluZyBjaG9pY2VzIHRvIG9iamVjdHMgd2l0aCBgdmFsdWVgIGFuZCBgbGFiZWxgXG4gICAgICAvLyBwcm9wZXJ0aWVzLlxuICAgICAgaWYgKF8uaXNTdHJpbmcoY2hvaWNlKSkge1xuICAgICAgICBjaG9pY2VzW2ldID0ge1xuICAgICAgICAgIHZhbHVlOiBjaG9pY2UsXG4gICAgICAgICAgbGFiZWw6IHV0aWwuaHVtYW5pemUoY2hvaWNlKVxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKCFjaG9pY2VzW2ldLmxhYmVsKSB7XG4gICAgICAgIGNob2ljZXNbaV0ubGFiZWwgPSB1dGlsLmh1bWFuaXplKGNob2ljZXNbaV0udmFsdWUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGNob2ljZXM7XG4gIH07XG5cbiAgcGx1Z2luLmV4cG9ydHMuY29tcGlsZSA9IGZ1bmN0aW9uIChkZWYpIHtcbiAgICBpZiAoZGVmLmNob2ljZXMgPT09ICcnKSB7XG4gICAgICBkZWYuY2hvaWNlcyA9IFtdO1xuICAgIH0gZWxzZSBpZiAoZGVmLmNob2ljZXMpIHtcblxuICAgICAgZGVmLmNob2ljZXMgPSBjb21waWxlQ2hvaWNlcyhkZWYuY2hvaWNlcyk7XG4gICAgfVxuXG4gICAgaWYgKGRlZi5yZXBsYWNlQ2hvaWNlcyA9PT0gJycpIHtcbiAgICAgIGRlZi5yZXBsYWNlQ2hvaWNlcyA9IFtdO1xuICAgIH0gZWxzZSBpZiAoZGVmLnJlcGxhY2VDaG9pY2VzKSB7XG5cbiAgICAgIGRlZi5yZXBsYWNlQ2hvaWNlcyA9IGNvbXBpbGVDaG9pY2VzKGRlZi5yZXBsYWNlQ2hvaWNlcyk7XG5cbiAgICAgIGRlZi5yZXBsYWNlQ2hvaWNlc0xhYmVscyA9IHt9O1xuXG4gICAgICBkZWYucmVwbGFjZUNob2ljZXMuZm9yRWFjaChmdW5jdGlvbiAoY2hvaWNlKSB7XG4gICAgICAgIGRlZi5yZXBsYWNlQ2hvaWNlc0xhYmVsc1tjaG9pY2UudmFsdWVdID0gY2hvaWNlLmxhYmVsO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiLy8gIyBjb21waWxlci5sb29rdXBcblxuLypcbkNvbnZlcnQgYSBsb29rdXAgZGVjbGFyYXRpb24gdG8gYW4gZXZhbHVhdGlvbi4gQSBsb29rdXAgcHJvcGVydHkgaXMgdXNlZCBsaWtlOlxuXG5gYGBqc1xue1xuICB0eXBlOiAnc3RyaW5nJyxcbiAga2V5OiAnc3RhdGVzJyxcbiAgbG9va3VwOiB7c291cmNlOiAnbG9jYXRpb25zJywga2V5czogWydjb3VudHJ5J119XG59XG5gYGBcblxuTG9naWNhbGx5LCB0aGUgYWJvdmUgd2lsbCB1c2UgdGhlIGBjb3VudHJ5YCBrZXkgb2YgdGhlIHZhbHVlIHRvIGFzayB0aGVcbmBsb2NhdGlvbnNgIHNvdXJjZSBmb3Igc3RhdGVzIGNob2ljZXMuIFRoaXMgd29ya3MgYnkgY29udmVydGluZyB0aGUgbG9va3VwIHRvXG50aGUgZm9sbG93aW5nIGV2YWx1YXRpb24uXG5cbmBgYGpzXG57XG4gIHR5cGU6ICdzdHJpbmcnLFxuICBrZXk6ICdzdGF0ZXMnLFxuICBjaG9pY2VzOiBbXSxcbiAgZXZhbDoge1xuICAgIG5lZWRzTWV0YTogW1xuICAgICAgWydAaWYnLCBbJ0BnZXRNZXRhJywgJ2xvY2F0aW9ucycsIHtjb3VudHJ5OiBbJ0BnZXQnLCAnY291bnRyeSddfV0sIG51bGwsIFsnbG9jYXRpb25zJywge2NvdW50cnk6IFsnQGdldCcsICdjb3VudHJ5J119XV1cbiAgICBdLFxuICAgIGNob2ljZXM6IFsnQGdldE1ldGEnLCAnbG9jYXRpb25zJywge2NvdW50cnk6IFsnQGdldCcsICdjb3VudHJ5J119XVxuICB9XG59XG5gYGBcblxuVGhlIGFib3ZlIHNheXMgdG8gYWRkIGEgYG5lZWRzTWV0YWAgcHJvcGVydHkgaWYgbmVjZXNzYXJ5IGFuZCBhZGQgYSBgY2hvaWNlc2BcbmFycmF5IGlmIGl0J3MgYXZhaWxhYmxlLiBPdGhlcndpc2UsIGNob2ljZXMgd2lsbCBkZWZhdWx0IHRvIGFuIGVtcHR5IGFycmF5LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICB2YXIgYWRkTG9va3VwID0gZnVuY3Rpb24gKGRlZiwgbG9va3VwUHJvcE5hbWUsIGNob2ljZXNQcm9wTmFtZSkge1xuICAgIHZhciBsb29rdXAgPSBkZWZbbG9va3VwUHJvcE5hbWVdO1xuXG4gICAgaWYgKGxvb2t1cCkge1xuICAgICAgaWYgKCFkZWZbY2hvaWNlc1Byb3BOYW1lXSkge1xuICAgICAgICBkZWZbY2hvaWNlc1Byb3BOYW1lXSA9IFtdO1xuICAgICAgfVxuICAgICAgaWYgKCFkZWYuZXZhbCkge1xuICAgICAgICBkZWYuZXZhbCA9IHt9O1xuICAgICAgfVxuICAgICAgaWYgKCFkZWYuZXZhbC5uZWVkc01ldGEpIHtcbiAgICAgICAgZGVmLmV2YWwubmVlZHNNZXRhID0gW107XG4gICAgICB9XG4gICAgICB2YXIga2V5cyA9IGxvb2t1cC5rZXlzIHx8IFtdO1xuICAgICAgdmFyIHBhcmFtcyA9IHt9O1xuICAgICAgdmFyIG1ldGFBcmdzLCBtZXRhR2V0LCBoaWRkZW5UZXN0O1xuXG4gICAgICBpZiAobG9va3VwLmdyb3VwKSB7XG5cbiAgICAgICAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICBwYXJhbXNba2V5XSA9IFsnQGdldCcsICdpdGVtJywga2V5XTtcbiAgICAgICAgfSk7XG4gICAgICAgIG1ldGFBcmdzID0gW2xvb2t1cC5zb3VyY2VdLmNvbmNhdChwYXJhbXMpO1xuICAgICAgICBtZXRhR2V0ID0gWydAZ2V0TWV0YSddLmNvbmNhdChtZXRhQXJncyk7XG4gICAgICAgIHZhciBtZXRhRm9yRWFjaCA9IFsnQGZvckVhY2gnLCAnaXRlbScsIFsnQGdldEdyb3VwVmFsdWVzJywgbG9va3VwLmdyb3VwXV07XG4gICAgICAgIGRlZi5ldmFsLm5lZWRzTWV0YS5wdXNoKG1ldGFGb3JFYWNoLmNvbmNhdChbXG4gICAgICAgICAgbWV0YUFyZ3MsXG4gICAgICAgICAgWydAbm90JywgbWV0YUdldF1cbiAgICAgICAgXSkpO1xuICAgICAgICBoaWRkZW5UZXN0ID0gWydAYW5kJ10uY29uY2F0KGtleXMubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICByZXR1cm4gWydAZ2V0JywgJ2l0ZW0nLCBrZXldO1xuICAgICAgICB9KSk7XG4gICAgICAgIGRlZi5ldmFsW2Nob2ljZXNQcm9wTmFtZV0gPSBtZXRhRm9yRWFjaC5jb25jYXQoW1xuICAgICAgICAgIFsnQG9yJywgbWV0YUdldCwgWydAaWYnLCBoaWRkZW5UZXN0LCBbJy8vL2xvYWRpbmcvLy8nXSwgW11dXSxcbiAgICAgICAgICBbJ0BvcicsIGhpZGRlblRlc3QsIG1ldGFHZXRdXG4gICAgICAgIF0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICBwYXJhbXNba2V5XSA9IFsnQGdldCcsIGtleV07XG4gICAgICAgIH0pO1xuICAgICAgICBtZXRhQXJncyA9IFtsb29rdXAuc291cmNlXS5jb25jYXQocGFyYW1zKTtcbiAgICAgICAgbWV0YUdldCA9IFsnQGdldE1ldGEnXS5jb25jYXQobWV0YUFyZ3MpO1xuICAgICAgICB2YXIgbWV0YUdldE9yTG9hZGluZyA9IFsnQG9yJywgbWV0YUdldCwgWycvLy9sb2FkaW5nLy8vJ11dO1xuICAgICAgICBkZWYuZXZhbC5uZWVkc01ldGEucHVzaChbJ0BpZicsIG1ldGFHZXQsIG51bGwsIG1ldGFBcmdzXSk7XG4gICAgICAgIGRlZi5ldmFsW2Nob2ljZXNQcm9wTmFtZV0gPSBtZXRhR2V0T3JMb2FkaW5nO1xuICAgICAgICBpZiAoa2V5cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgLy8gVGVzdCB0aGF0IHdlIGhhdmUgYWxsIG5lZWRlZCBrZXlzLlxuICAgICAgICAgIGhpZGRlblRlc3QgPSBbJ0BhbmQnXS5jb25jYXQoa2V5cy5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgcmV0dXJuIFsnQGdldCcsIGtleV07XG4gICAgICAgICAgfSkpO1xuICAgICAgICAgIC8vIFJldmVyc2UgdGVzdCBzbyB3ZSBoaWRlIGlmIGRvbid0IGhhdmUgYWxsIGtleXMuXG4gICAgICAgICAgaGlkZGVuVGVzdCA9IFsnQG5vdCcsIGhpZGRlblRlc3RdO1xuICAgICAgICAgIGlmICghZGVmLmV2YWwuaGlkZGVuKSB7XG4gICAgICAgICAgICBkZWYuZXZhbC5oaWRkZW4gPSBoaWRkZW5UZXN0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBkZWxldGUgZGVmW2xvb2t1cFByb3BOYW1lXTtcbiAgICB9XG4gIH07XG5cbiAgcGx1Z2luLmV4cG9ydHMuY29tcGlsZSA9IGZ1bmN0aW9uIChkZWYpIHtcblxuICAgIGFkZExvb2t1cChkZWYsICdsb29rdXAnLCAnY2hvaWNlcycpO1xuICAgIGFkZExvb2t1cChkZWYsICdsb29rdXBSZXBsYWNlbWVudHMnLCAncmVwbGFjZUNob2ljZXMnKTtcbiAgfTtcbn07XG4iLCIvLyAjIGNvbXBpbGVycy5wcm9wLWFsaWFzZXNcblxuLypcbkFsaWFzIHNvbWUgcHJvcGVydGllcyB0byBvdGhlciBwcm9wZXJ0aWVzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICB2YXIgcHJvcEFsaWFzZXMgPSB7XG4gICAgaGVscF90ZXh0OiAnaGVscFRleHQnXG4gIH07XG5cbiAgcGx1Z2luLmV4cG9ydHMuY29tcGlsZSA9IGZ1bmN0aW9uIChkZWYpIHtcbiAgICBPYmplY3Qua2V5cyhwcm9wQWxpYXNlcykuZm9yRWFjaChmdW5jdGlvbiAoYWxpYXMpIHtcbiAgICAgIHZhciBwcm9wTmFtZSA9IHByb3BBbGlhc2VzW2FsaWFzXTtcbiAgICAgIGlmICh0eXBlb2YgZGVmW3Byb3BOYW1lXSA9PT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGRlZlthbGlhc10gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGRlZltwcm9wTmFtZV0gPSBkZWZbYWxpYXNdO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xufTtcbiIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcGlsZXJzLnR5cGVzXG5cbi8qXG5Db252ZXJ0IHNvbWUgaGlnaC1sZXZlbCB0eXBlcyB0byBsb3ctbGV2ZWwgdHlwZXMgYW5kIHByb3BlcnRpZXMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICAvLyBNYXAgaGlnaC1sZXZlbCB0eXBlIHRvIGxvdy1sZXZlbCB0eXBlLiBJZiBhIGZ1bmN0aW9uIGlzIHN1cHBsaWVkLCBjYW5cbiAgLy8gbW9kaWZ5IHRoZSBmaWVsZCBkZWZpbml0aW9uLlxuICB2YXIgdHlwZUNvZXJjZSA9IHtcbiAgICB1bmljb2RlOiBmdW5jdGlvbiAoZGVmKSB7XG4gICAgICBkZWYudHlwZSA9ICdzdHJpbmcnO1xuICAgICAgZGVmLm1heFJvd3MgPSAxO1xuICAgIH0sXG4gICAgdGV4dDogJ3N0cmluZycsXG4gICAgc2VsZWN0OiBmdW5jdGlvbiAoZGVmKSB7XG4gICAgICBkZWYuY2hvaWNlcyA9IGRlZi5jaG9pY2VzIHx8IFtdO1xuICAgIH0sXG4gICAgYm9vbDogJ2Jvb2xlYW4nLFxuICAgIGRpY3Q6ICdvYmplY3QnLFxuICAgIGRlY2ltYWw6ICdudW1iZXInLFxuICAgIGludDogJ251bWJlcidcbiAgfTtcblxuICB0eXBlQ29lcmNlLnN0ciA9IHR5cGVDb2VyY2UudW5pY29kZTtcblxuXG4gIHBsdWdpbi5leHBvcnRzLmNvbXBpbGUgPSBmdW5jdGlvbiAoZGVmKSB7XG5cbiAgICB2YXIgY29lcmNlVHlwZSA9IHR5cGVDb2VyY2VbZGVmLnR5cGVdO1xuICAgIGlmIChjb2VyY2VUeXBlKSB7XG4gICAgICBpZiAoXy5pc1N0cmluZyhjb2VyY2VUeXBlKSkge1xuICAgICAgICBkZWYudHlwZSA9IGNvZXJjZVR5cGU7XG4gICAgICB9IGVsc2UgaWYgKF8uaXNGdW5jdGlvbihjb2VyY2VUeXBlKSkge1xuICAgICAgICBkZWYgPSBjb2VyY2VUeXBlKGRlZik7XG4gICAgICB9XG4gICAgfVxuICB9O1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQuYWRkLWl0ZW1cblxuLypcblRoZSBhZGQgYnV0dG9uIHRvIGFwcGVuZCBhbiBpdGVtIHRvIGEgZmllbGQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZGlzcGxheU5hbWU6IHBsdWdpbi5uYW1lLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lLFxuICAgICAgICBsYWJlbDogcGx1Z2luLmNvbmZpZ1ZhbHVlKCdsYWJlbCcsICdbYWRkXScpXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBSLnNwYW4oe2NsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWUsIG9uQ2xpY2s6IHRoaXMucHJvcHMub25DbGlja30sIHRoaXMucHJvcHMubGFiZWwpO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC5jaGVja2JveC1saXN0XG5cbi8qXG5Vc2VkIHdpdGggYXJyYXkgdmFsdWVzIHRvIHN1cHBseSBtdWx0aXBsZSBjaGVja2JveGVzIGZvciBhZGRpbmcgbXVsdGlwbGVcbmVudW1lcmF0ZWQgdmFsdWVzIHRvIGFuIGFycmF5LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZGlzcGxheU5hbWU6IHBsdWdpbi5uYW1lLFxuXG4gICAgbWl4aW5zOiBbcGx1Z2luLnJlcXVpcmUoJ21peGluLmZpZWxkJyldLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gKCkge1xuICAgICAgLy8gR2V0IGFsbCB0aGUgY2hlY2tlZCBjaGVja2JveGVzIGFuZCBjb252ZXJ0IHRvIGFuIGFycmF5IG9mIHZhbHVlcy5cbiAgICAgIHZhciBjaG9pY2VOb2RlcyA9IHRoaXMucmVmcy5jaG9pY2VzLmdldERPTU5vZGUoKS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW5wdXQnKTtcbiAgICAgIGNob2ljZU5vZGVzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoY2hvaWNlTm9kZXMsIDApO1xuICAgICAgdmFyIHZhbHVlcyA9IGNob2ljZU5vZGVzLm1hcChmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICByZXR1cm4gbm9kZS5jaGVja2VkID8gbm9kZS52YWx1ZSA6IG51bGw7XG4gICAgICB9KS5maWx0ZXIoZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5wcm9wcy5maWVsZC52YWwodmFsdWVzKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICAgIHZhciBjaG9pY2VzID0gZmllbGQuZGVmLmNob2ljZXMgfHwgW107XG5cbiAgICAgIHZhciBpc0lubGluZSA9ICFfLmZpbmQoY2hvaWNlcywgZnVuY3Rpb24gKGNob2ljZSkge1xuICAgICAgICByZXR1cm4gY2hvaWNlLnNhbXBsZTtcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgdmFsdWUgPSBmaWVsZC52YWx1ZSB8fCBbXTtcblxuICAgICAgcmV0dXJuIHBsdWdpbi5jb21wb25lbnQoJ2ZpZWxkJykoe1xuICAgICAgICBmaWVsZDogZmllbGRcbiAgICAgIH0sXG4gICAgICAgIFIuZGl2KHtjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lLCByZWY6ICdjaG9pY2VzJ30sXG4gICAgICAgICAgY2hvaWNlcy5tYXAoZnVuY3Rpb24gKGNob2ljZSwgaSkge1xuXG4gICAgICAgICAgICB2YXIgaW5wdXRGaWVsZCA9IFIuc3Bhbih7c3R5bGU6IHt3aGl0ZVNwYWNlOiAnbm93cmFwJ319LFxuICAgICAgICAgICAgICBSLmlucHV0KHtcbiAgICAgICAgICAgICAgICBuYW1lOiBmaWVsZC5kZWYua2V5LFxuICAgICAgICAgICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgICAgICAgICAgdmFsdWU6IGNob2ljZS52YWx1ZSxcbiAgICAgICAgICAgICAgICBjaGVja2VkOiB2YWx1ZS5pbmRleE9mKGNob2ljZS52YWx1ZSkgPj0gMCA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZVxuICAgICAgICAgICAgICAgIC8vb25Gb2N1czogdGhpcy5wcm9wcy5hY3Rpb25zLmZvY3VzXG4gICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAnICcsXG4gICAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAnZmllbGQtY2hvaWNlLWxhYmVsJ30sXG4gICAgICAgICAgICAgICAgY2hvaWNlLmxhYmVsXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGlmIChpc0lubGluZSkge1xuICAgICAgICAgICAgICByZXR1cm4gUi5zcGFuKHtrZXk6IGksIGNsYXNzTmFtZTogJ2ZpZWxkLWNob2ljZSd9LFxuICAgICAgICAgICAgICAgIGlucHV0RmllbGQsICcgJ1xuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFIuZGl2KHtrZXk6IGksIGNsYXNzTmFtZTogJ2ZpZWxkLWNob2ljZSd9LFxuICAgICAgICAgICAgICAgIGlucHV0RmllbGQsICcgJyxcbiAgICAgICAgICAgICAgICBwbHVnaW4uY29tcG9uZW50KCdzYW1wbGUnKSh7ZmllbGQ6IGZpZWxkLCBjaG9pY2U6IGNob2ljZX0pXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxudmFyIENTU1RyYW5zaXRpb25Hcm91cCA9IFJlYWN0LmNyZWF0ZUZhY3RvcnkoUmVhY3QuYWRkb25zLkNTU1RyYW5zaXRpb25Hcm91cCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgbWl4aW5zOiBbXG4gICAgICAvL3BsdWdpbi5yZXF1aXJlKCdtaXhpbi5yZXNpemUnKSxcbiAgICAgIC8vcGx1Z2luLnJlcXVpcmUoJ21peGluLnNjcm9sbCcpLFxuICAgICAgcGx1Z2luLnJlcXVpcmUoJ21peGluLmNsaWNrLW91dHNpZGUnKVxuICAgIF0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG1heEhlaWdodDogbnVsbCxcbiAgICAgICAgb3BlbjogdGhpcy5wcm9wcy5vcGVuXG4gICAgICB9O1xuICAgIH0sXG4gICAgLy9cbiAgICAvLyBvblRvZ2dsZTogZnVuY3Rpb24gKCkge1xuICAgIC8vICAgdGhpcy5zZXRTdGF0ZSh7b3BlbjogIXRoaXMuc3RhdGUub3Blbn0pO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyBvbkNsb3NlOiBmdW5jdGlvbiAoKSB7XG4gICAgLy8gICB0aGlzLnNldFN0YXRlKHtvcGVuOiBmYWxzZX0pO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyBmaXhDaG9pY2VzV2lkdGg6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyAgIHRoaXMuc2V0U3RhdGUoe1xuICAgIC8vICAgICBjaG9pY2VzV2lkdGg6IHRoaXMucmVmcy5hY3RpdmUuZ2V0RE9NTm9kZSgpLm9mZnNldFdpZHRoXG4gICAgLy8gICB9KTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gb25SZXNpemVXaW5kb3c6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyAgIHRoaXMuZml4Q2hvaWNlc1dpZHRoKCk7XG4gICAgLy8gfSxcblxuICAgIC8vIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgLy8gICB0aGlzLmZpeENob2ljZXNXaWR0aCgpO1xuICAgIC8vICAgdGhpcy5zZXRPbkNsaWNrT3V0c2lkZSgnc2VsZWN0JywgdGhpcy5vbkNsb3NlKTtcbiAgICAvLyB9LFxuXG4gICAgZ2V0SWdub3JlQ2xvc2VOb2RlczogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKCF0aGlzLnByb3BzLmlnbm9yZUNsb3NlTm9kZXMpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfVxuICAgICAgdmFyIG5vZGVzID0gdGhpcy5wcm9wcy5pZ25vcmVDbG9zZU5vZGVzKCk7XG4gICAgICBpZiAoIV8uaXNBcnJheShub2RlcykpIHtcbiAgICAgICAgbm9kZXMgPSBbbm9kZXNdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5vZGVzO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zZXRPbkNsaWNrT3V0c2lkZSgnY2hvaWNlcycsIGZ1bmN0aW9uIChldmVudCkge1xuXG4gICAgICAgIC8vIE1ha2Ugc3VyZSB3ZSBkb24ndCBmaW5kIGFueSBub2RlcyB0byBpZ25vcmUuXG4gICAgICAgIGlmICghXy5maW5kKHRoaXMuZ2V0SWdub3JlQ2xvc2VOb2RlcygpLCBmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmlzTm9kZUluc2lkZShldmVudC50YXJnZXQsIG5vZGUpO1xuICAgICAgICB9LmJpbmQodGhpcykpKSB7XG4gICAgICAgICAgdGhpcy5wcm9wcy5vbkNsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgIHRoaXMuYWRqdXN0U2l6ZSgpO1xuICAgIH0sXG5cbiAgICBvblNlbGVjdDogZnVuY3Rpb24gKGNob2ljZSkge1xuICAgICAgdGhpcy5wcm9wcy5vblNlbGVjdChjaG9pY2UudmFsdWUpO1xuICAgIH0sXG5cbiAgICBvblJlc2l6ZVdpbmRvdzogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5hZGp1c3RTaXplKCk7XG4gICAgfSxcblxuICAgIG9uU2Nyb2xsV2luZG93OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmFkanVzdFNpemUoKTtcbiAgICB9LFxuXG4gICAgYWRqdXN0U2l6ZTogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMucmVmcy5jaG9pY2VzKSB7XG4gICAgICAgIHZhciBub2RlID0gdGhpcy5yZWZzLmNob2ljZXMuZ2V0RE9NTm9kZSgpO1xuICAgICAgICB2YXIgcmVjdCA9IG5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIHZhciB0b3AgPSByZWN0LnRvcDtcbiAgICAgICAgdmFyIHdpbmRvd0hlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICAgICAgdmFyIGhlaWdodCA9IHdpbmRvd0hlaWdodCAtIHRvcDtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgbWF4SGVpZ2h0OiBoZWlnaHRcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXh0UHJvcHMpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe29wZW46IG5leHRQcm9wcy5vcGVufSwgZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmFkanVzdFNpemUoKTtcbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSxcblxuICAgIG9uU2Nyb2xsOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdzdG9wIHRoYXQhJylcbiAgICAgIC8vIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAvLyBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9LFxuXG4gICAgb25XaGVlbDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAvLyBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgLy8gZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgY2hvaWNlcyA9IHRoaXMucHJvcHMuY2hvaWNlcztcblxuICAgICAgaWYgKGNob2ljZXMgJiYgY2hvaWNlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgY2hvaWNlcyA9IFt7dmFsdWU6ICcvLy9lbXB0eS8vLyd9XTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIFIuZGl2KHtyZWY6ICdjb250YWluZXInLCBvbldoZWVsOiB0aGlzLm9uV2hlZWwsIG9uU2Nyb2xsOiB0aGlzLm9uU2Nyb2xsLCBjbGFzc05hbWU6ICdjaG9pY2VzLWNvbnRhaW5lcicsIHN0eWxlOiB7XG4gICAgICAgIHVzZXJTZWxlY3Q6ICdub25lJywgV2Via2l0VXNlclNlbGVjdDogJ25vbmUnLCBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgbWF4SGVpZ2h0OiB0aGlzLnN0YXRlLm1heEhlaWdodCA/IHRoaXMuc3RhdGUubWF4SGVpZ2h0IDogbnVsbFxuICAgICAgfX0sXG4gICAgICAgIENTU1RyYW5zaXRpb25Hcm91cCh7dHJhbnNpdGlvbk5hbWU6ICdyZXZlYWwnfSxcbiAgICAgICAgICB0aGlzLnByb3BzLm9wZW4gPyBSLnVsKHtyZWY6ICdjaG9pY2VzJywgY2xhc3NOYW1lOiAnY2hvaWNlcyd9LFxuICAgICAgICAgICAgY2hvaWNlcy5tYXAoZnVuY3Rpb24gKGNob2ljZSwgaSkge1xuXG4gICAgICAgICAgICAgIHZhciBjaG9pY2VFbGVtZW50ID0gbnVsbDtcblxuICAgICAgICAgICAgICBpZiAoY2hvaWNlLnZhbHVlID09PSAnLy8vbG9hZGluZy8vLycpIHtcbiAgICAgICAgICAgICAgICBjaG9pY2VFbGVtZW50ID0gUi5hKHtocmVmOiAnSmF2YVNjcmlwdCcgKyAnOicsIG9uQ2xpY2s6IHRoaXMucHJvcHMub25DbG9zZX0sXG4gICAgICAgICAgICAgICAgICBSLnNwYW4oe2NsYXNzTmFtZTogJ2Nob2ljZS1sYWJlbCd9LFxuICAgICAgICAgICAgICAgICAgICAnTG9hZGluZy4uLidcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNob2ljZS52YWx1ZSA9PT0gJy8vL2VtcHR5Ly8vJykge1xuICAgICAgICAgICAgICAgIGNob2ljZUVsZW1lbnQgPSBSLmEoe2hyZWY6ICdKYXZhU2NyaXB0JyArICc6Jywgb25DbGljazogdGhpcy5wcm9wcy5vbkNsb3NlfSxcbiAgICAgICAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAnY2hvaWNlLWxhYmVsJ30sXG4gICAgICAgICAgICAgICAgICAgICdObyBjaG9pY2VzIGF2YWlsYWJsZS4nXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjaG9pY2VFbGVtZW50ID0gUi5hKHtocmVmOiAnSmF2YVNjcmlwdCcgKyAnOicsIG9uQ2xpY2s6IHRoaXMub25TZWxlY3QuYmluZCh0aGlzLCBjaG9pY2UpfSxcbiAgICAgICAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAnY2hvaWNlLWxhYmVsJ30sXG4gICAgICAgICAgICAgICAgICAgIGNob2ljZS5sYWJlbFxuICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAnY2hvaWNlLXNhbXBsZSd9LFxuICAgICAgICAgICAgICAgICAgICBjaG9pY2Uuc2FtcGxlXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHJldHVybiBSLmxpKHtrZXk6IGksIGNsYXNzTmFtZTogJ2Nob2ljZSd9LFxuICAgICAgICAgICAgICAgIGNob2ljZUVsZW1lbnRcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgICApIDogbnVsbFxuICAgICAgICApXG4gICAgICApO1xuXG5cbiAgICAgIC8vIHZhciBjbGFzc05hbWUgPSBmb3JtYXRpYy5jbGFzc05hbWUoJ2Ryb3Bkb3duLWZpZWxkJywgcGx1Z2luLmNvbmZpZy5jbGFzc05hbWUsIHRoaXMucHJvcHMuZmllbGQuY2xhc3NOYW1lKTtcbiAgICAgIC8vXG4gICAgICAvLyB2YXIgc2VsZWN0ZWRMYWJlbCA9ICcnO1xuICAgICAgLy8gdmFyIG1hdGNoaW5nTGFiZWxzID0gdGhpcy5wcm9wcy5maWVsZC5jaG9pY2VzLmZpbHRlcihmdW5jdGlvbiAoY2hvaWNlKSB7XG4gICAgICAvLyAgIHJldHVybiBjaG9pY2UudmFsdWUgPT09IHRoaXMucHJvcHMuZmllbGQudmFsdWU7XG4gICAgICAvLyB9LmJpbmQodGhpcykpO1xuICAgICAgLy8gaWYgKG1hdGNoaW5nTGFiZWxzLmxlbmd0aCA+IDApIHtcbiAgICAgIC8vICAgc2VsZWN0ZWRMYWJlbCA9IG1hdGNoaW5nTGFiZWxzWzBdLmxhYmVsO1xuICAgICAgLy8gfVxuICAgICAgLy8gc2VsZWN0ZWRMYWJlbCA9IHNlbGVjdGVkTGFiZWwgfHwgJ1xcdTAwYTAnO1xuICAgICAgLy9cbiAgICAgIC8vIHJldHVybiBSLmRpdihfLmV4dGVuZCh7Y2xhc3NOYW1lOiBjbGFzc05hbWUsIHJlZjogJ3NlbGVjdCd9LCBwbHVnaW4uY29uZmlnLmF0dHJpYnV0ZXMpLFxuICAgICAgLy8gICBSLmRpdih7Y2xhc3NOYW1lOiAnZmllbGQtdmFsdWUnLCByZWY6ICdhY3RpdmUnLCBvbkNsaWNrOiB0aGlzLm9uVG9nZ2xlfSwgc2VsZWN0ZWRMYWJlbCksXG4gICAgICAvLyAgIFIuZGl2KHtjbGFzc05hbWU6ICdmaWVsZC10b2dnbGUgJyArICh0aGlzLnN0YXRlLm9wZW4gPyAnZmllbGQtb3BlbicgOiAnZmllbGQtY2xvc2VkJyksIG9uQ2xpY2s6IHRoaXMub25Ub2dnbGV9KSxcbiAgICAgIC8vICAgUmVhY3QuYWRkb25zLkNTU1RyYW5zaXRpb25Hcm91cCh7dHJhbnNpdGlvbk5hbWU6ICdyZXZlYWwnfSxcbiAgICAgIC8vICAgICBSLmRpdih7Y2xhc3NOYW1lOiAnZmllbGQtY2hvaWNlcy1jb250YWluZXInfSxcbiAgICAgIC8vICAgICAgIHRoaXMuc3RhdGUub3BlbiA/IFIudWwoe3JlZjogJ2Nob2ljZXMnLCBjbGFzc05hbWU6ICdmaWVsZC1jaG9pY2VzJywgc3R5bGU6IHt3aWR0aDogdGhpcy5zdGF0ZS5jaG9pY2VzV2lkdGh9fSxcbiAgICAgIC8vICAgICAgICAgdGhpcy5wcm9wcy5maWVsZC5jaG9pY2VzLm1hcChmdW5jdGlvbiAoY2hvaWNlKSB7XG4gICAgICAvLyAgICAgICAgICAgcmV0dXJuIFIubGkoe1xuICAgICAgLy8gICAgICAgICAgICAgY2xhc3NOYW1lOiAnZmllbGQtY2hvaWNlJyxcbiAgICAgIC8vICAgICAgICAgICAgIG9uQ2xpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7b3BlbjogZmFsc2V9KTtcbiAgICAgIC8vICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5mb3JtLmFjdGlvbnMuY2hhbmdlKHRoaXMucHJvcHMuZmllbGQsIGNob2ljZS52YWx1ZSk7XG4gICAgICAvLyAgICAgICAgICAgICB9LmJpbmQodGhpcylcbiAgICAgIC8vICAgICAgICAgICB9LCBjaG9pY2UubGFiZWwpO1xuICAgICAgLy8gICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAvLyAgICAgICApIDogW11cbiAgICAgIC8vICAgICApXG4gICAgICAvLyAgIClcbiAgICAgIC8vICk7XG4gICAgfVxuICB9KTtcbn07XG5cblxuLy8gY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbi8vICAgdGhpcy5zZXRPbkNsaWNrT3V0c2lkZSgnY2hvaWNlcycsIGZ1bmN0aW9uIChldmVudCkge1xuLy9cbi8vICAgICAvLyBNYWtlIHN1cmUgd2UgZG9uJ3QgZmluZCBhbnkgbm9kZXMgdG8gaWdub3JlLlxuLy8gICAgIGlmICghXy5maW5kKHRoaXMuZ2V0SWdub3JlQ2xvc2VOb2RlcygpLCBmdW5jdGlvbiAobm9kZSkge1xuLy8gICAgICAgY29uc29sZS5sb2cobm9kZSwgZXZlbnQudGFyZ2V0KVxuLy8gICAgICAgcmV0dXJuICF0aGlzLmlzTm9kZU91dHNpZGUobm9kZSwgZXZlbnQudGFyZ2V0KTtcbi8vICAgICB9LmJpbmQodGhpcykpKSB7XG4vLyAgICAgICBjb25zb2xlLmxvZyhcImhvdz8/P1wiKVxuLy8gICAgICAgdGhpcy5wcm9wcy5vbkNsb3NlKCk7XG4vLyAgICAgfVxuLy8gICB9LmJpbmQodGhpcykpO1xuLy8gfSxcbi8vXG4vLyBvblNlbGVjdDogZnVuY3Rpb24gKGNob2ljZSkge1xuLy8gICB0aGlzLnByb3BzLm9uU2VsZWN0KGNob2ljZS52YWx1ZSk7XG4vLyB9LFxuLy9cbi8vIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuLy9cbi8vICAgcmV0dXJuIFIuZGl2KHtyZWY6ICdjb250YWluZXInLCBjbGFzc05hbWU6ICdjaG9pY2VzLWNvbnRhaW5lcicsIHN0eWxlOiB7dXNlclNlbGVjdDogJ25vbmUnLCBXZWJraXRVc2VyU2VsZWN0OiAnbm9uZScsIHBvc2l0aW9uOiAnYWJzb2x1dGUnfX0sXG4vLyAgICAgdGhpcy5wcm9wcy5vcGVuID9cbi8vICAgICAgIENTU1RyYW5zaXRpb25Hcm91cCh7dHJhbnNpdGlvbk5hbWU6ICdyZXZlYWwnfSxcbi8vICAgICAgICAgUi51bCh7cmVmOiAnY2hvaWNlcycsIGNsYXNzTmFtZTogJ2Nob2ljZXMnfSxcbi8vICAgICAgICAgICB0aGlzLnByb3BzLmNob2ljZXMubWFwKGZ1bmN0aW9uIChjaG9pY2UsIGkpIHtcbi8vICAgICAgICAgICAgIHJldHVybiBSLmxpKHtrZXk6IGksIGNsYXNzTmFtZTogJ2Nob2ljZSd9LFxuLy8gICAgICAgICAgICAgICBSLmEoe2hyZWY6ICdKYXZhU2NyaXB0OicgKyAnJywgb25DbGljazogdGhpcy5vblNlbGVjdC5iaW5kKHRoaXMsIGNob2ljZSl9LFxuLy8gICAgICAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAnY2hvaWNlLWxhYmVsJ30sXG4vLyAgICAgICAgICAgICAgICAgICBjaG9pY2UubGFiZWxcbi8vICAgICAgICAgICAgICAgICApLFxuLy8gICAgICAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAnY2hvaWNlLXNhbXBsZSd9LFxuLy8gICAgICAgICAgICAgICAgICAgY2hvaWNlLnNhbXBsZVxuLy8gICAgICAgICAgICAgICAgIClcbi8vICAgICAgICAgICAgICAgKVxuLy8gICAgICAgICAgICAgKTtcbi8vICAgICAgICAgICB9LmJpbmQodGhpcykpXG4vLyAgICAgICAgIClcbi8vICAgICAgIClcbi8vICAgICAgIDogbnVsbFxuLy8gICApO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC5maWVsZFxuXG4vKlxuVXNlZCBieSBhbnkgZmllbGRzIHRvIHB1dCB0aGUgbGFiZWwgYW5kIGhlbHAgdGV4dCBhcm91bmQgdGhlIGZpZWxkLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbnZhciBDU1NUcmFuc2l0aW9uR3JvdXAgPSBSZWFjdC5jcmVhdGVGYWN0b3J5KFJlYWN0LmFkZG9ucy5DU1NUcmFuc2l0aW9uR3JvdXApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGRpc3BsYXlOYW1lOiBwbHVnaW4ubmFtZSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjb2xsYXBzZWQ6IHRoaXMucHJvcHMuZmllbGQuZGVmLmNvbGxhcHNlZCA/IHRydWUgOiBmYWxzZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgaXNDb2xsYXBzaWJsZTogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgICAgcmV0dXJuICFfLmlzVW5kZWZpbmVkKGZpZWxkLmRlZi5jb2xsYXBzZWQpIHx8ICFfLmlzVW5kZWZpbmVkKGZpZWxkLmRlZi5jb2xsYXBzaWJsZSk7XG4gICAgfSxcblxuICAgIG9uQ2xpY2tMYWJlbDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGNvbGxhcHNlZDogIXRoaXMuc3RhdGUuY29sbGFwc2VkXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICAgIHZhciBpbmRleCA9IHRoaXMucHJvcHMuaW5kZXg7XG4gICAgICBpZiAoIV8uaXNOdW1iZXIoaW5kZXgpKSB7XG4gICAgICAgIGluZGV4ID0gXy5pc051bWJlcihmaWVsZC5kZWYua2V5KSA/IGZpZWxkLmRlZi5rZXkgOiB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZSwgc3R5bGU6IHtkaXNwbGF5OiAoZmllbGQuaGlkZGVuKCkgPyAnbm9uZScgOiAnJyl9fSxcbiAgICAgICAgcGx1Z2luLmNvbXBvbmVudCgnbGFiZWwnKSh7ZmllbGQ6IGZpZWxkLCBpbmRleDogaW5kZXgsIG9uQ2xpY2s6IHRoaXMuaXNDb2xsYXBzaWJsZSgpID8gdGhpcy5vbkNsaWNrTGFiZWwgOiBudWxsfSksXG4gICAgICAgIENTU1RyYW5zaXRpb25Hcm91cCh7dHJhbnNpdGlvbk5hbWU6ICdyZXZlYWwnfSxcbiAgICAgICAgICB0aGlzLnN0YXRlLmNvbGxhcHNlZCA/IFtdIDogW1xuICAgICAgICAgICAgcGx1Z2luLmNvbXBvbmVudCgnaGVscCcpKHtrZXk6ICdoZWxwJywgZmllbGQ6IGZpZWxkfSksXG4gICAgICAgICAgICB0aGlzLnByb3BzLmNoaWxkcmVuXG4gICAgICAgICAgXVxuICAgICAgICApXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC5maWVsZHNldFxuXG4vKlxuUmVuZGVyIG11bHRpcGxlIGNoaWxkIGZpZWxkcyBmb3IgYSBmaWVsZC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBtaXhpbnM6IFtwbHVnaW4ucmVxdWlyZSgnbWl4aW4uZmllbGQnKV0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgICAgcmV0dXJuIHBsdWdpbi5jb21wb25lbnQoJ2ZpZWxkJykoe1xuICAgICAgICBmaWVsZDogZmllbGRcbiAgICAgIH0sXG4gICAgICAgIFIuZmllbGRzZXQoe2NsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWV9LFxuICAgICAgICAgIGZpZWxkLmZpZWxkcygpLm1hcChmdW5jdGlvbiAoZmllbGQsIGkpIHtcbiAgICAgICAgICAgIHJldHVybiBmaWVsZC5jb21wb25lbnQoe2tleTogZmllbGQuZGVmLmtleSB8fCBpfSk7XG4gICAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC5mb3JtYXRpY1xuXG4vKlxuVG9wLWxldmVsIGNvbXBvbmVudCB3aGljaCBnZXRzIGEgZm9ybSBhbmQgdGhlbiBsaXN0ZW5zIHRvIHRoZSBmb3JtIGZvciBjaGFuZ2VzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGRpc3BsYXlOYW1lOiBwbHVnaW4ubmFtZSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZmllbGQ6IHRoaXMucHJvcHMuZm9ybS5maWVsZCgpXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZm9ybSA9IHRoaXMucHJvcHMuZm9ybTtcbiAgICAgIGZvcm0ub24oJ2NoYW5nZScsIHRoaXMub25Gb3JtQ2hhbmdlZCk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZm9ybSA9IHRoaXMucHJvcHMuZm9ybTtcbiAgICAgIGZvcm0ub2ZmKCdjaGFuZ2UnLCB0aGlzLm9uRm9ybUNoYW5nZWQpO1xuICAgIH0sXG5cbiAgICBvbkZvcm1DaGFuZ2VkOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIGlmICh0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4gICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UodGhpcy5wcm9wcy5mb3JtLnZhbCgpLCBldmVudC5jaGFuZ2luZyk7XG4gICAgICB9XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgZmllbGQ6IHRoaXMucHJvcHMuZm9ybS5maWVsZCgpXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogJ2Zvcm1hdGljJ30sXG4gICAgICAgIHRoaXMuc3RhdGUuZmllbGQuY29tcG9uZW50KClcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50LmhlbHBcblxuLypcbkp1c3QgdGhlIGhlbHAgdGV4dCBibG9jay5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgICByZXR1cm4gZmllbGQuZGVmLmhlbHBUZXh0ID9cbiAgICAgICAgUi5kaXYoe2NsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWV9LFxuICAgICAgICAgIGZpZWxkLmRlZi5oZWxwVGV4dFxuICAgICAgICApIDpcbiAgICAgICAgUi5zcGFuKG51bGwpO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC5pdGVtLWNob2ljZXNcblxuLypcbkdpdmUgYSBsaXN0IG9mIGNob2ljZXMgb2YgaXRlbSB0eXBlcyB0byBjcmVhdGUgYXMgY2hpbGRyZW4gb2YgYW4gZmllbGQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZGlzcGxheU5hbWU6IHBsdWdpbi5uYW1lLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICB0aGlzLnByb3BzLm9uU2VsZWN0KHBhcnNlSW50KGV2ZW50LnRhcmdldC52YWx1ZSkpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgICAgdmFyIHR5cGVDaG9pY2VzID0gbnVsbDtcbiAgICAgIGlmIChmaWVsZC5pdGVtcygpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdHlwZUNob2ljZXMgPSBSLnNlbGVjdCh7Y2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZSwgdmFsdWU6IHRoaXMudmFsdWUsIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlfSxcbiAgICAgICAgICBmaWVsZC5pdGVtcygpLm1hcChmdW5jdGlvbiAoaXRlbSwgaSkge1xuICAgICAgICAgICAgcmV0dXJuIFIub3B0aW9uKHtrZXk6IGksIHZhbHVlOiBpfSwgaXRlbS5sYWJlbCB8fCBpKTtcbiAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHlwZUNob2ljZXMgPyB0eXBlQ2hvaWNlcyA6IFIuc3BhbihudWxsKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQuanNvblxuXG4vKlxuVGV4dGFyZWEgZWRpdG9yIGZvciBKU09OLiBXaWxsIHZhbGlkYXRlIHRoZSBKU09OIGJlZm9yZSBzZXR0aW5nIHRoZSB2YWx1ZSwgc29cbndoaWxlIHRoZSB2YWx1ZSBpcyBpbnZhbGlkLCBubyBleHRlcm5hbCBzdGF0ZSBjaGFuZ2VzIHdpbGwgb2NjdXIuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZGlzcGxheU5hbWU6IHBsdWdpbi5uYW1lLFxuXG4gICAgbWl4aW5zOiBbcGx1Z2luLnJlcXVpcmUoJ21peGluLmZpZWxkJyldLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lLFxuICAgICAgICByb3dzOiBwbHVnaW4uY29uZmlnLnJvd3MgfHwgNVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgaXNWYWxpZFZhbHVlOiBmdW5jdGlvbiAodmFsdWUpIHtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaXNWYWxpZDogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IEpTT04uc3RyaW5naWZ5KHRoaXMucHJvcHMuZmllbGQudmFsdWUsIG51bGwsIDIpXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICB2YXIgaXNWYWxpZCA9IHRoaXMuaXNWYWxpZFZhbHVlKGV2ZW50LnRhcmdldC52YWx1ZSk7XG5cbiAgICAgIGlmIChpc1ZhbGlkKSB7XG4gICAgICAgIC8vIE5lZWQgdG8gaGFuZGxlIHRoaXMgYmV0dGVyLiBOZWVkIHRvIHRyYWNrIHBvc2l0aW9uLlxuICAgICAgICB0aGlzLl9pc0NoYW5naW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5wcm9wcy5maWVsZC52YWwoSlNPTi5wYXJzZShldmVudC50YXJnZXQudmFsdWUpKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGlzVmFsaWQ6IGlzVmFsaWQsXG4gICAgICAgIHZhbHVlOiBldmVudC50YXJnZXQudmFsdWVcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV4dFByb3BzKSB7XG4gICAgICBpZiAoIXRoaXMuX2lzQ2hhbmdpbmcpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgaXNWYWxpZDogdHJ1ZSxcbiAgICAgICAgICB2YWx1ZTogSlNPTi5zdHJpbmdpZnkobmV4dFByb3BzLmZpZWxkLnZhbHVlLCBudWxsLCAyKVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2lzQ2hhbmdpbmcgPSBmYWxzZTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICAgIHJldHVybiBwbHVnaW4uY29tcG9uZW50KCdmaWVsZCcpKHtcbiAgICAgICAgZmllbGQ6IGZpZWxkXG4gICAgICB9LCBSLnRleHRhcmVhKHtcbiAgICAgICAgICBjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lLFxuICAgICAgICAgIHZhbHVlOiB0aGlzLnN0YXRlLnZhbHVlLFxuICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgICAgIHN0eWxlOiB7YmFja2dyb3VuZENvbG9yOiB0aGlzLnN0YXRlLmlzVmFsaWQgPyAnJyA6ICdyZ2IoMjU1LDIwMCwyMDApJ30sXG4gICAgICAgICAgcm93czogZmllbGQuZGVmLnJvd3MgfHwgdGhpcy5wcm9wcy5yb3dzXG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC5sYWJlbFxuXG4vKlxuSnVzdCB0aGUgbGFiZWwgZm9yIGEgZmllbGQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZGlzcGxheU5hbWU6IHBsdWdpbi5uYW1lLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgICAgdmFyIGxhYmVsID0gbnVsbDtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wcy5pbmRleCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgbGFiZWwgPSAnJyArICh0aGlzLnByb3BzLmluZGV4ICsgMSkgKyAnLic7XG4gICAgICAgIGlmIChmaWVsZC5kZWYubGFiZWwpIHtcbiAgICAgICAgICBsYWJlbCA9IGxhYmVsICsgJyAnICsgZmllbGQuZGVmLmxhYmVsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChmaWVsZC5kZWYubGFiZWwgfHwgbGFiZWwpIHtcbiAgICAgICAgdmFyIHRleHQgPSBsYWJlbCB8fCBmaWVsZC5kZWYubGFiZWw7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uQ2xpY2spIHtcbiAgICAgICAgICB0ZXh0ID0gUi5hKHtocmVmOiAnSmF2YVNjcmlwdCcgKyAnOicsIG9uQ2xpY2s6IHRoaXMucHJvcHMub25DbGlja30sIHRleHQpO1xuICAgICAgICB9XG4gICAgICAgIGxhYmVsID0gUi5sYWJlbCh7fSwgdGV4dCk7XG4gICAgICB9XG5cbiAgICAgIHZhciByZXF1aXJlZCA9IFIuc3Bhbih7Y2xhc3NOYW1lOiAncmVxdWlyZWQtdGV4dCd9KTtcblxuICAgICAgcmV0dXJuIFIuZGl2KHtcbiAgICAgICAgY2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZVxuICAgICAgfSxcbiAgICAgICAgbGFiZWwsXG4gICAgICAgICcgJyxcbiAgICAgICAgcmVxdWlyZWRcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50Lmxpc3QtY29udHJvbFxuXG4vKlxuUmVuZGVyIHRoZSBpdGVtIHR5cGUgY2hvaWNlcyBhbmQgdGhlIGFkZCBidXR0b24uXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZGlzcGxheU5hbWU6IHBsdWdpbi5uYW1lLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGl0ZW1JbmRleDogMFxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgb25TZWxlY3Q6IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGl0ZW1JbmRleDogaW5kZXhcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBvbkFwcGVuZDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5wcm9wcy5vbkFwcGVuZCh0aGlzLnN0YXRlLml0ZW1JbmRleCk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgICB2YXIgdHlwZUNob2ljZXMgPSBudWxsO1xuXG4gICAgICBpZiAoZmllbGQuaXRlbXMoKS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHR5cGVDaG9pY2VzID0gcGx1Z2luLmNvbXBvbmVudCgnaXRlbS1jaG9pY2VzJykoe2ZpZWxkOiBmaWVsZCwgdmFsdWU6IHRoaXMuc3RhdGUuaXRlbUluZGV4LCBvblNlbGVjdDogdGhpcy5vblNlbGVjdH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWV9LFxuICAgICAgICB0eXBlQ2hvaWNlcywgJyAnLFxuICAgICAgICBwbHVnaW4uY29tcG9uZW50KCdhZGQtaXRlbScpKHtvbkNsaWNrOiB0aGlzLm9uQXBwZW5kfSlcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50Lmxpc3QtaXRlbS1jb250cm9sXG5cbi8qXG5SZW5kZXIgdGhlIHJlbW92ZSBhbmQgbW92ZSBidXR0b25zIGZvciBhIGZpZWxkLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGRpc3BsYXlOYW1lOiBwbHVnaW4ubmFtZSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgb25Nb3ZlQmFjazogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5wcm9wcy5vbk1vdmUodGhpcy5wcm9wcy5pbmRleCwgdGhpcy5wcm9wcy5pbmRleCAtIDEpO1xuICAgIH0sXG5cbiAgICBvbk1vdmVGb3J3YXJkOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnByb3BzLm9uTW92ZSh0aGlzLnByb3BzLmluZGV4LCB0aGlzLnByb3BzLmluZGV4ICsgMSk7XG4gICAgfSxcblxuICAgIG9uUmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnByb3BzLm9uUmVtb3ZlKHRoaXMucHJvcHMuaW5kZXgpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZX0sXG4gICAgICAgIHBsdWdpbi5jb21wb25lbnQoJ3JlbW92ZS1pdGVtJykoe2ZpZWxkOiBmaWVsZCwgb25DbGljazogdGhpcy5vblJlbW92ZX0pLFxuICAgICAgICB0aGlzLnByb3BzLmluZGV4ID4gMCA/IHBsdWdpbi5jb21wb25lbnQoJ21vdmUtaXRlbS1iYWNrJykoe29uQ2xpY2s6IHRoaXMub25Nb3ZlQmFja30pIDogbnVsbCxcbiAgICAgICAgdGhpcy5wcm9wcy5pbmRleCA8ICh0aGlzLnByb3BzLm51bUl0ZW1zIC0gMSkgPyBwbHVnaW4uY29tcG9uZW50KCdtb3ZlLWl0ZW0tZm9yd2FyZCcpKHtvbkNsaWNrOiB0aGlzLm9uTW92ZUZvcndhcmR9KSA6IG51bGxcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50Lmxpc3QtaXRlbS12YWx1ZVxuXG4vKlxuUmVuZGVyIHRoZSB2YWx1ZSBvZiBhIGxpc3QgaXRlbS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lfSxcbiAgICAgICAgZmllbGQuY29tcG9uZW50KClcbiAgICAgICAgLy8gcGx1Z2luLmNvbXBvbmVudCgnZmllbGQnKSh7XG4gICAgICAgIC8vICAgZmllbGQ6IGZpZWxkLFxuICAgICAgICAvLyAgIGluZGV4OiB0aGlzLnByb3BzLmluZGV4XG4gICAgICAgIC8vIH0sXG4gICAgICAgIC8vICAgZmllbGQuY29tcG9uZW50KClcbiAgICAgICAgLy8gKVxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQubGlzdC1pdGVtXG5cbi8qXG5SZW5kZXIgYSBsaXN0IGl0ZW0uXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZGlzcGxheU5hbWU6IHBsdWdpbi5uYW1lLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZX0sXG4gICAgICAgIHBsdWdpbi5jb21wb25lbnQoJ2xpc3QtaXRlbS12YWx1ZScpKHtmb3JtOiB0aGlzLnByb3BzLmZvcm0sIGZpZWxkOiBmaWVsZCwgaW5kZXg6IHRoaXMucHJvcHMuaW5kZXh9KSxcbiAgICAgICAgcGx1Z2luLmNvbXBvbmVudCgnbGlzdC1pdGVtLWNvbnRyb2wnKSh7ZmllbGQ6IGZpZWxkLCBpbmRleDogdGhpcy5wcm9wcy5pbmRleCwgbnVtSXRlbXM6IHRoaXMucHJvcHMubnVtSXRlbXMsIG9uTW92ZTogdGhpcy5wcm9wcy5vbk1vdmUsIG9uUmVtb3ZlOiB0aGlzLnByb3BzLm9uUmVtb3ZlfSlcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50Lmxpc3RcblxuLypcblJlbmRlciBhIGxpc3QuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG5cbnZhciBDU1NUcmFuc2l0aW9uR3JvdXAgPSBSZWFjdC5jcmVhdGVGYWN0b3J5KFJlYWN0LmFkZG9ucy5DU1NUcmFuc2l0aW9uR3JvdXApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGRpc3BsYXlOYW1lOiBwbHVnaW4ubmFtZSxcblxuICAgIG1peGluczogW3BsdWdpbi5yZXF1aXJlKCdtaXhpbi5maWVsZCcpXSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgbmV4dExvb2t1cElkOiAwLFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIC8vIE5lZWQgdG8gY3JlYXRlIGFydGlmaWNpYWwga2V5cyBmb3IgdGhlIGFycmF5LiBJbmRleGVzIGFyZSBub3QgZ29vZCBrZXlzLFxuICAgICAgLy8gc2luY2UgdGhleSBjaGFuZ2UuIFNvLCBtYXAgZWFjaCBwb3NpdGlvbiB0byBhbiBhcnRpZmljaWFsIGtleVxuICAgICAgdmFyIGxvb2t1cHMgPSBbXTtcbiAgICAgIHRoaXMucHJvcHMuZmllbGQuZmllbGRzKCkuZm9yRWFjaChmdW5jdGlvbiAoZmllbGQsIGkpIHtcbiAgICAgICAgbG9va3Vwc1tpXSA9ICdfJyArIHRoaXMubmV4dExvb2t1cElkO1xuICAgICAgICB0aGlzLm5leHRMb29rdXBJZCsrO1xuICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbG9va3VwczogbG9va3Vwc1xuICAgICAgfTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gKG5ld1Byb3BzKSB7XG5cbiAgICAgIHZhciBsb29rdXBzID0gdGhpcy5zdGF0ZS5sb29rdXBzO1xuICAgICAgdmFyIGZpZWxkcyA9IG5ld1Byb3BzLmZpZWxkLmZpZWxkcygpO1xuXG4gICAgICAvLyBOZWVkIHRvIHNldCBhcnRpZmljaWFsIGtleXMgZm9yIG5ldyBhcnJheSBpdGVtcy5cbiAgICAgIGlmIChmaWVsZHMubGVuZ3RoID4gbG9va3Vwcy5sZW5ndGgpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IGxvb2t1cHMubGVuZ3RoOyBpIDwgZmllbGRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgbG9va3Vwc1tpXSA9ICdfJyArIHRoaXMubmV4dExvb2t1cElkO1xuICAgICAgICAgIHRoaXMubmV4dExvb2t1cElkKys7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGxvb2t1cHM6IGxvb2t1cHNcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBvbkFwcGVuZDogZnVuY3Rpb24gKGl0ZW1JbmRleCkge1xuICAgICAgdGhpcy5wcm9wcy5maWVsZC5hcHBlbmQoaXRlbUluZGV4KTtcbiAgICB9LFxuICAgIC8vXG4gICAgLy8gb25DbGlja0xhYmVsOiBmdW5jdGlvbiAoaSkge1xuICAgIC8vICAgaWYgKHRoaXMucHJvcHMuZmllbGQuY29sbGFwc2FibGVJdGVtcykge1xuICAgIC8vICAgICB2YXIgY29sbGFwc2VkO1xuICAgIC8vICAgICAvLyBpZiAoIXRoaXMuc3RhdGUuY29sbGFwc2VkW2ldKSB7XG4gICAgLy8gICAgIC8vICAgY29sbGFwc2VkID0gdGhpcy5zdGF0ZS5jb2xsYXBzZWQ7XG4gICAgLy8gICAgIC8vICAgY29sbGFwc2VkW2ldID0gdHJ1ZTtcbiAgICAvLyAgICAgLy8gICB0aGlzLnNldFN0YXRlKHtjb2xsYXBzZWQ6IGNvbGxhcHNlZH0pO1xuICAgIC8vICAgICAvLyB9IGVsc2Uge1xuICAgIC8vICAgICAvLyAgIGNvbGxhcHNlZCA9IHRoaXMucHJvcHMuZmllbGQuZmllbGRzLm1hcChmdW5jdGlvbiAoKSB7XG4gICAgLy8gICAgIC8vICAgICByZXR1cm4gdHJ1ZTtcbiAgICAvLyAgICAgLy8gICB9KTtcbiAgICAvLyAgICAgLy8gICBjb2xsYXBzZWRbaV0gPSBmYWxzZTtcbiAgICAvLyAgICAgLy8gICB0aGlzLnNldFN0YXRlKHtjb2xsYXBzZWQ6IGNvbGxhcHNlZH0pO1xuICAgIC8vICAgICAvLyB9XG4gICAgLy8gICAgIGNvbGxhcHNlZCA9IHRoaXMuc3RhdGUuY29sbGFwc2VkO1xuICAgIC8vICAgICBjb2xsYXBzZWRbaV0gPSAhY29sbGFwc2VkW2ldO1xuICAgIC8vICAgICB0aGlzLnNldFN0YXRlKHtjb2xsYXBzZWQ6IGNvbGxhcHNlZH0pO1xuICAgIC8vICAgfVxuICAgIC8vIH0sXG4gICAgLy9cbiAgICBvblJlbW92ZTogZnVuY3Rpb24gKGkpIHtcbiAgICAgIHZhciBsb29rdXBzID0gdGhpcy5zdGF0ZS5sb29rdXBzO1xuICAgICAgbG9va3Vwcy5zcGxpY2UoaSwgMSk7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgbG9va3VwczogbG9va3Vwc1xuICAgICAgfSk7XG4gICAgICB0aGlzLnByb3BzLmZpZWxkLnJlbW92ZShpKTtcbiAgICB9LFxuICAgIC8vXG4gICAgb25Nb3ZlOiBmdW5jdGlvbiAoZnJvbUluZGV4LCB0b0luZGV4KSB7XG4gICAgICB2YXIgbG9va3VwcyA9IHRoaXMuc3RhdGUubG9va3VwcztcbiAgICAgIHZhciBmcm9tSWQgPSBsb29rdXBzW2Zyb21JbmRleF07XG4gICAgICB2YXIgdG9JZCA9IGxvb2t1cHNbdG9JbmRleF07XG4gICAgICBsb29rdXBzW2Zyb21JbmRleF0gPSB0b0lkO1xuICAgICAgbG9va3Vwc1t0b0luZGV4XSA9IGZyb21JZDtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBsb29rdXBzOiBsb29rdXBzXG4gICAgICB9KTtcbiAgICAgIHRoaXMucHJvcHMuZmllbGQubW92ZShmcm9tSW5kZXgsIHRvSW5kZXgpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcbiAgICAgIHZhciBmaWVsZHMgPSBmaWVsZC5maWVsZHMoKTtcblxuICAgICAgdmFyIG51bUl0ZW1zID0gZmllbGRzLmxlbmd0aDtcbiAgICAgIHJldHVybiBwbHVnaW4uY29tcG9uZW50KCdmaWVsZCcpKHtcbiAgICAgICAgZmllbGQ6IGZpZWxkXG4gICAgICB9LFxuICAgICAgICBSLmRpdih7Y2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZX0sXG4gICAgICAgICAgQ1NTVHJhbnNpdGlvbkdyb3VwKHt0cmFuc2l0aW9uTmFtZTogJ3JldmVhbCd9LFxuICAgICAgICAgICAgZmllbGRzLm1hcChmdW5jdGlvbiAoY2hpbGQsIGkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHBsdWdpbi5jb21wb25lbnQoJ2xpc3QtaXRlbScpKHtcbiAgICAgICAgICAgICAgICBrZXk6IHRoaXMuc3RhdGUubG9va3Vwc1tpXSxcbiAgICAgICAgICAgICAgICBmb3JtOiB0aGlzLnByb3BzLmZvcm0sXG4gICAgICAgICAgICAgICAgZmllbGQ6IGNoaWxkLFxuICAgICAgICAgICAgICAgIHBhcmVudDogZmllbGQsXG4gICAgICAgICAgICAgICAgaW5kZXg6IGksXG4gICAgICAgICAgICAgICAgbnVtSXRlbXM6IG51bUl0ZW1zLFxuICAgICAgICAgICAgICAgIG9uTW92ZTogdGhpcy5vbk1vdmUsXG4gICAgICAgICAgICAgICAgb25SZW1vdmU6IHRoaXMub25SZW1vdmVcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgICAgKSxcbiAgICAgICAgICBwbHVnaW4uY29tcG9uZW50KCdsaXN0LWNvbnRyb2wnKSh7ZmllbGQ6IGZpZWxkLCBvbkFwcGVuZDogdGhpcy5vbkFwcGVuZH0pXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50Lm1vdmUtaXRlbS1iYWNrXG5cbi8qXG5CdXR0b24gdG8gbW92ZSBhbiBpdGVtIGJhY2t3YXJkcyBpbiBsaXN0LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGRpc3BsYXlOYW1lOiBwbHVnaW4ubmFtZSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZSxcbiAgICAgICAgbGFiZWw6IHBsdWdpbi5jb25maWdWYWx1ZSgnbGFiZWwnLCAnW3VwXScpXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBSLnNwYW4oe2NsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWUsIG9uQ2xpY2s6IHRoaXMucHJvcHMub25DbGlja30sIHRoaXMucHJvcHMubGFiZWwpO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC5tb3ZlLWl0ZW0tZm9yd2FyZFxuXG4vKlxuQnV0dG9uIHRvIG1vdmUgYW4gaXRlbSBmb3J3YXJkIGluIGEgbGlzdC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWUsXG4gICAgICAgIGxhYmVsOiBwbHVnaW4uY29uZmlnVmFsdWUoJ2xhYmVsJywgJ1tkb3duXScpXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBSLnNwYW4oe2NsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWUsIG9uQ2xpY2s6IHRoaXMucHJvcHMub25DbGlja30sIHRoaXMucHJvcHMubGFiZWwpO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC5wcmV0dHktdGV4dGFyZWFcblxuLypcblRleHRhcmVhIHRoYXQgd2lsbCBkaXNwbGF5IGhpZ2hsaWdodHMgYmVoaW5kIFwidGFnc1wiLiBUYWdzIGN1cnJlbnRseSBtZWFuIHRleHRcbnRoYXQgaXMgZW5jbG9zZWQgaW4gYnJhY2VzIGxpa2UgYHt7Zm9vfX1gLiBUYWdzIGFyZSByZXBsYWNlZCB3aXRoIGxhYmVscyBpZlxuYXZhaWxhYmxlIG9yIGh1bWFuaXplZC5cblxuVGhpcyBjb21wb25lbnQgaXMgcXVpdGUgY29tcGxpY2F0ZWQgYmVjYXVzZTpcbi0gV2UgYXJlIGRpc3BsYXlpbmcgdGV4dCBpbiB0aGUgdGV4dGFyZWEgYnV0IGhhdmUgdG8ga2VlcCB0cmFjayBvZiB0aGUgcmVhbFxuICB0ZXh0IHZhbHVlIGluIHRoZSBiYWNrZ3JvdW5kLiBXZSBjYW4ndCB1c2UgYSBkYXRhIGF0dHJpYnV0ZSwgYmVjYXVzZSBpdCdzIGFcbiAgdGV4dGFyZWEsIHNvIHdlIGNhbid0IHVzZSBhbnkgZWxlbWVudHMgYXQgYWxsIVxuLSBCZWNhdXNlIG9mIHRoZSBoaWRkZW4gZGF0YSwgd2UgYWxzbyBoYXZlIHRvIGRvIHNvbWUgaW50ZXJjZXB0aW9uIG9mXG4gIGNvcHksIHdoaWNoIGlzIGEgbGl0dGxlIHdlaXJkLiBXZSBpbnRlcmNlcHQgY29weSBhbmQgY29weSB0aGUgcmVhbCB0ZXh0XG4gIHRvIHRoZSBlbmQgb2YgdGhlIHRleHRhcmVhLiBUaGVuIHdlIGVyYXNlIHRoYXQgdGV4dCwgd2hpY2ggbGVhdmVzIHRoZSBjb3BpZWRcbiAgZGF0YSBpbiB0aGUgYnVmZmVyLlxuLSBSZWFjdCBsb3NlcyB0aGUgY2FyZXQgcG9zaXRpb24gd2hlbiB5b3UgdXBkYXRlIHRoZSB2YWx1ZSB0byBzb21ldGhpbmdcbiAgZGlmZmVyZW50IHRoYW4gYmVmb3JlLiBTbyB3ZSBoYXZlIHRvIHJldGFpbiB0cmFja2luZyBpbmZvcm1hdGlvbiBmb3Igd2hlblxuICB0aGF0IGhhcHBlbnMuXG4tIEJlY2F1c2Ugd2UgbW9ua2V5IHdpdGggY29weSwgd2UgYWxzbyBoYXZlIHRvIGRvIG91ciBvd24gdW5kby9yZWRvLiBPdGhlcndpc2VcbiAgdGhlIGRlZmF1bHQgdW5kbyB3aWxsIGhhdmUgd2VpcmQgc3RhdGVzIGluIGl0LlxuXG5TbyBnb29kIGx1Y2shXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxudmFyIG5vQnJlYWsgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoLyAvZywgJ1xcdTAwYTAnKTtcbn07XG5cbnZhciBMRUZUX1BBRCA9ICdcXHUwMGEwXFx1MDBhMCc7XG4vLyBXaHkgdGhpcyB3b3JrcywgSSdtIG5vdCBzdXJlLlxudmFyIFJJR0hUX1BBRCA9ICcgICc7IC8vJ1xcdTAwYTBcXHUwMGEwJztcblxudmFyIGlkUHJlZml4UmVnRXggPSAvXlswLTldK19fLztcblxuLy8gWmFwaWVyIHNwZWNpZmljIHN0dWZmLiBNYWtlIGEgcGx1Z2luIGZvciB0aGlzIGxhdGVyLlxudmFyIHJlbW92ZUlkUHJlZml4ID0gZnVuY3Rpb24gKGtleSkge1xuICBpZiAoaWRQcmVmaXhSZWdFeC50ZXN0KGtleSkpIHtcbiAgICByZXR1cm4ga2V5LnJlcGxhY2UoaWRQcmVmaXhSZWdFeCwgJycpO1xuICB9XG4gIHJldHVybiBrZXk7XG59O1xuXG52YXIgcG9zaXRpb25Jbk5vZGUgPSBmdW5jdGlvbiAocG9zaXRpb24sIG5vZGUpIHtcbiAgdmFyIHJlY3QgPSBub2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICBpZiAocG9zaXRpb24ueCA+PSByZWN0LmxlZnQgJiYgcG9zaXRpb24ueCA8PSByZWN0LnJpZ2h0KSB7XG4gICAgaWYgKHBvc2l0aW9uLnkgPj0gcmVjdC50b3AgJiYgcG9zaXRpb24ueSA8PSByZWN0LmJvdHRvbSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICB2YXIgdXRpbCA9IHBsdWdpbi5yZXF1aXJlKCd1dGlsJyk7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBtaXhpbnM6IFtwbHVnaW4ucmVxdWlyZSgnbWl4aW4uZmllbGQnKSwgcGx1Z2luLnJlcXVpcmUoJ21peGluLnVuZG8tc3RhY2snKSwgcGx1Z2luLnJlcXVpcmUoJ21peGluLnJlc2l6ZScpXSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB1bmRvRGVwdGg6IDEwMCxcbiAgICAgICAgaXNDaG9pY2VzT3BlbjogZmFsc2UsXG4gICAgICAgIGhvdmVyUGlsbFJlZjogbnVsbFxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAvLyBOb3QgcXVpdGUgc3RhdGUsIHRoaXMgaXMgZm9yIHRyYWNraW5nIHNlbGVjdGlvbiBpbmZvLlxuICAgICAgdGhpcy50cmFja2luZyA9IHt9O1xuXG4gICAgICB2YXIgcGFydHMgPSB1dGlsLnBhcnNlVGV4dFdpdGhUYWdzKHRoaXMucHJvcHMuZmllbGQudmFsdWUpO1xuICAgICAgdmFyIHRva2VucyA9IHRoaXMudG9rZW5zKHBhcnRzKTtcbiAgICAgIHZhciBpbmRleE1hcCA9IHRoaXMuaW5kZXhNYXAodG9rZW5zKTtcblxuICAgICAgdGhpcy50cmFja2luZy5wb3MgPSBpbmRleE1hcC5sZW5ndGg7XG4gICAgICB0aGlzLnRyYWNraW5nLnJhbmdlID0gMDtcbiAgICAgIHRoaXMudHJhY2tpbmcudG9rZW5zID0gdG9rZW5zO1xuICAgICAgdGhpcy50cmFja2luZy5pbmRleE1hcCA9IGluZGV4TWFwO1xuICAgIH0sXG5cbiAgICBnZXRTdGF0ZVNuYXBzaG90OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB2YWx1ZTogdGhpcy5wcm9wcy5maWVsZC52YWx1ZSxcbiAgICAgICAgcG9zOiB0aGlzLnRyYWNraW5nLnBvcyxcbiAgICAgICAgcmFuZ2U6IHRoaXMudHJhY2tpbmcucmFuZ2VcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHNldFN0YXRlU25hcHNob3Q6IGZ1bmN0aW9uIChzbmFwc2hvdCkge1xuICAgICAgdGhpcy50cmFja2luZy5wb3MgPSBzbmFwc2hvdC5wb3M7XG4gICAgICB0aGlzLnRyYWNraW5nLnJhbmdlID0gc25hcHNob3QucmFuZ2U7XG4gICAgICB0aGlzLnByb3BzLmZpZWxkLnZhbChzbmFwc2hvdC52YWx1ZSk7XG4gICAgfSxcblxuICAgIC8vIFR1cm4gaW50byBpbmRpdmlkdWFsIGNoYXJhY3RlcnMgYW5kIHRhZ3NcbiAgICB0b2tlbnM6IGZ1bmN0aW9uIChwYXJ0cykge1xuICAgICAgcmV0dXJuIFtdLmNvbmNhdC5hcHBseShbXSwgcGFydHMubWFwKGZ1bmN0aW9uIChwYXJ0KSB7XG4gICAgICAgIGlmIChwYXJ0LnR5cGUgPT09ICd0YWcnKSB7XG4gICAgICAgICAgcmV0dXJuIHBhcnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHBhcnQudmFsdWUuc3BsaXQoJycpO1xuICAgICAgICB9XG4gICAgICB9KSk7XG4gICAgfSxcblxuICAgIC8vIE1hcCBlYWNoIHRleHRhcmVhIGluZGV4IGJhY2sgdG8gYSB0b2tlblxuICAgIGluZGV4TWFwOiBmdW5jdGlvbiAodG9rZW5zKSB7XG4gICAgICB2YXIgaW5kZXhNYXAgPSBbXTtcbiAgICAgIF8uZWFjaCh0b2tlbnMsIGZ1bmN0aW9uICh0b2tlbiwgdG9rZW5JbmRleCkge1xuICAgICAgICBpZiAodG9rZW4udHlwZSA9PT0gJ3RhZycpIHtcbiAgICAgICAgICB2YXIgbGFiZWwgPSBMRUZUX1BBRCArIG5vQnJlYWsodGhpcy5wcmV0dHlMYWJlbCh0b2tlbi52YWx1ZSkpICsgUklHSFRfUEFEO1xuICAgICAgICAgIHZhciBsYWJlbENoYXJzID0gbGFiZWwuc3BsaXQoJycpO1xuICAgICAgICAgIF8uZWFjaChsYWJlbENoYXJzLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpbmRleE1hcC5wdXNoKHRva2VuSW5kZXgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGluZGV4TWFwLnB1c2godG9rZW5JbmRleCk7XG4gICAgICAgIH1cbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICByZXR1cm4gaW5kZXhNYXA7XG4gICAgfSxcblxuICAgIC8vIE1ha2UgaGlnaGxpZ2h0IHNjcm9sbCBtYXRjaCB0ZXh0YXJlYSBzY3JvbGxcbiAgICBvblNjcm9sbDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5yZWZzLmhpZ2hsaWdodC5nZXRET01Ob2RlKCkuc2Nyb2xsVG9wID0gdGhpcy5yZWZzLmNvbnRlbnQuZ2V0RE9NTm9kZSgpLnNjcm9sbFRvcDtcbiAgICAgIHRoaXMucmVmcy5oaWdobGlnaHQuZ2V0RE9NTm9kZSgpLnNjcm9sbExlZnQgPSB0aGlzLnJlZnMuY29udGVudC5nZXRET01Ob2RlKCkuc2Nyb2xsTGVmdDtcbiAgICB9LFxuXG4gICAgLy8gR2l2ZW4gc29tZSBwb3N0aW9uLCByZXR1cm4gdGhlIHRva2VuIGluZGV4IChwb3NpdGlvbiBjb3VsZCBiZSBpbiB0aGUgbWlkZGxlIG9mIGEgdG9rZW4pXG4gICAgdG9rZW5JbmRleDogZnVuY3Rpb24gKHBvcywgdG9rZW5zLCBpbmRleE1hcCkge1xuICAgICAgaWYgKHBvcyA8IDApIHtcbiAgICAgICAgcG9zID0gMDtcbiAgICAgIH0gZWxzZSBpZiAocG9zID49IGluZGV4TWFwLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gdG9rZW5zLmxlbmd0aDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpbmRleE1hcFtwb3NdO1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAvL2NvbnNvbGUubG9nKCdjaGFuZ2U6JywgZXZlbnQudGFyZ2V0LnZhbHVlKTtcblxuICAgICAgdmFyIG5vZGUgPSBldmVudC50YXJnZXQ7XG5cbiAgICAgIC8vIFRyYWNraW5nIGlzIGhvbGRpbmcgcHJldmlvdXMgcG9zaXRpb24gYW5kIHJhbmdlXG4gICAgICB2YXIgcHJldlBvcyA9IHRoaXMudHJhY2tpbmcucG9zO1xuICAgICAgdmFyIHByZXZSYW5nZSA9IHRoaXMudHJhY2tpbmcucmFuZ2U7XG5cbiAgICAgIC8vIE5ldyBwb3NpdGlvblxuICAgICAgdmFyIHBvcyA9IG5vZGUuc2VsZWN0aW9uU3RhcnQ7XG5cbiAgICAgIC8vIEdvaW5nIHRvIG11dGF0ZSB0aGUgdG9rZW5zLlxuICAgICAgdmFyIHRva2VucyA9IHRoaXMudHJhY2tpbmcudG9rZW5zO1xuXG4gICAgICAvLyBVc2luZyB0aGUgcHJldmlvdXMgcG9zaXRpb24gYW5kIHJhbmdlLCBnZXQgdGhlIHByZXZpb3VzIHRva2VuIHBvc2l0aW9uXG4gICAgICAvLyBhbmQgcmFuZ2VcbiAgICAgIHZhciBwcmV2VG9rZW5JbmRleCA9IHRoaXMudG9rZW5JbmRleChwcmV2UG9zLCB0b2tlbnMsIHRoaXMudHJhY2tpbmcuaW5kZXhNYXApO1xuICAgICAgdmFyIHByZXZUb2tlbkVuZEluZGV4ID0gdGhpcy50b2tlbkluZGV4KHByZXZQb3MgKyBwcmV2UmFuZ2UsIHRva2VucywgdGhpcy50cmFja2luZy5pbmRleE1hcCk7XG4gICAgICB2YXIgcHJldlRva2VuUmFuZ2UgPSBwcmV2VG9rZW5FbmRJbmRleCAtIHByZXZUb2tlbkluZGV4O1xuXG4gICAgICAvLyBXaXBlIG91dCBhbnkgdG9rZW5zIGluIHRoZSBzZWxlY3RlZCByYW5nZSBiZWNhdXNlIHRoZSBjaGFuZ2Ugd291bGQgaGF2ZVxuICAgICAgLy8gZXJhc2VkIHRoYXQgc2VsZWN0aW9uLlxuICAgICAgaWYgKHByZXZUb2tlblJhbmdlID4gMCkge1xuICAgICAgICB0b2tlbnMuc3BsaWNlKHByZXZUb2tlbkluZGV4LCBwcmV2VG9rZW5SYW5nZSk7XG4gICAgICAgIHRoaXMudHJhY2tpbmcuaW5kZXhNYXAgPSB0aGlzLmluZGV4TWFwKHRva2Vucyk7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIGN1cnNvciBoYXMgbW92ZWQgZm9yd2FyZCwgdGhlbiB0ZXh0IHdhcyBhZGRlZC5cbiAgICAgIGlmIChwb3MgPiBwcmV2UG9zKSB7XG4gICAgICAgIHZhciBhZGRlZFRleHQgPSBub2RlLnZhbHVlLnN1YnN0cmluZyhwcmV2UG9zLCBwb3MpO1xuICAgICAgICAvLyBJbnNlcnQgdGhlIHRleHQgaW50byB0aGUgdG9rZW5zLlxuICAgICAgICB0b2tlbnMuc3BsaWNlKHByZXZUb2tlbkluZGV4LCAwLCBhZGRlZFRleHQpO1xuICAgICAgLy8gSWYgY3Vyc29yIGhhcyBtb3ZlZCBiYWNrd2FyZCwgdGhlbiB3ZSBkZWxldGVkIChiYWNrc3BhY2VkKSB0ZXh0XG4gICAgICB9IGlmIChwb3MgPCBwcmV2UG9zKSB7XG4gICAgICAgIHZhciB0b2tlbiA9IHRoaXMudG9rZW5BdChwb3MpO1xuICAgICAgICB2YXIgdG9rZW5CZWZvcmUgPSB0aGlzLnRva2VuQmVmb3JlKHBvcyk7XG4gICAgICAgIC8vIElmIHdlIG1vdmVkIGJhY2sgb250byBhIHRva2VuLCB0aGVuIHdlIHNob3VsZCBtb3ZlIGJhY2sgdG8gYmVnaW5uaW5nXG4gICAgICAgIC8vIG9mIHRva2VuLlxuICAgICAgICBpZiAodG9rZW4gPT09IHRva2VuQmVmb3JlKSB7XG4gICAgICAgICAgcG9zID0gdGhpcy5tb3ZlT2ZmVGFnKHBvcywgdG9rZW5zLCB0aGlzLmluZGV4TWFwKHRva2VucyksIC0xKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdG9rZW5JbmRleCA9IHRoaXMudG9rZW5JbmRleChwb3MsIHRva2VucywgdGhpcy50cmFja2luZy5pbmRleE1hcCk7XG4gICAgICAgIC8vIE5vdyB3ZSBjYW4gcmVtb3ZlIHRoZSB0b2tlbnMgdGhhdCB3ZXJlIGRlbGV0ZWQuXG4gICAgICAgIHRva2Vucy5zcGxpY2UodG9rZW5JbmRleCwgcHJldlRva2VuSW5kZXggLSB0b2tlbkluZGV4KTtcbiAgICAgIH1cblxuICAgICAgLy8gQ29udmVydCB0b2tlbnMgYmFjayBpbnRvIHJhdyB2YWx1ZSB3aXRoIHRhZ3MuIE5ld2x5IGZvcm1lZCB0YWdzIHdpbGxcbiAgICAgIC8vIGJlY29tZSBwYXJ0IG9mIHRoZSByYXcgdmFsdWUuXG4gICAgICB2YXIgcmF3VmFsdWUgPSB0aGlzLnJhd1ZhbHVlKHRva2Vucyk7XG5cbiAgICAgIHRoaXMudHJhY2tpbmcucG9zID0gcG9zO1xuICAgICAgdGhpcy50cmFja2luZy5yYW5nZSA9IDA7XG5cbiAgICAgIC8vIFNldCB0aGUgdmFsdWUgdG8gdGhlIG5ldyByYXcgdmFsdWUuXG4gICAgICB0aGlzLnByb3BzLmZpZWxkLnZhbChyYXdWYWx1ZSk7XG5cbiAgICAgIHRoaXMuc25hcHNob3QoKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkVXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgdmFsdWUgPSB0aGlzLnByb3BzLmZpZWxkLnZhbHVlIHx8ICcnO1xuICAgICAgdmFyIHBhcnRzID0gdXRpbC5wYXJzZVRleHRXaXRoVGFncyh2YWx1ZSk7XG4gICAgICB0aGlzLnRyYWNraW5nLnRva2VucyA9IHRoaXMudG9rZW5zKHBhcnRzKTtcbiAgICAgIHRoaXMudHJhY2tpbmcuaW5kZXhNYXAgPSB0aGlzLmluZGV4TWFwKHRoaXMudHJhY2tpbmcudG9rZW5zKTtcblxuICAgICAgdmFyIHBvcyA9IHRoaXMubm9ybWFsaXplUG9zaXRpb24odGhpcy50cmFja2luZy5wb3MpO1xuICAgICAgdmFyIHJhbmdlID0gdGhpcy50cmFja2luZy5yYW5nZTtcbiAgICAgIHZhciBlbmRQb3MgPSB0aGlzLm5vcm1hbGl6ZVBvc2l0aW9uKHBvcyArIHJhbmdlKTtcbiAgICAgIHJhbmdlID0gZW5kUG9zIC0gcG9zO1xuXG4gICAgICB0aGlzLnRyYWNraW5nLnBvcyA9IHBvcztcbiAgICAgIHRoaXMudHJhY2tpbmcucmFuZ2UgPSByYW5nZTtcblxuICAgICAgaWYgKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgPT09IHRoaXMucmVmcy5jb250ZW50LmdldERPTU5vZGUoKSkge1xuICAgICAgICAvLyBSZWFjdCBjYW4gbG9zZSB0aGUgc2VsZWN0aW9uLCBzbyBwdXQgaXQgYmFjay5cbiAgICAgICAgdGhpcy5yZWZzLmNvbnRlbnQuZ2V0RE9NTm9kZSgpLnNldFNlbGVjdGlvblJhbmdlKHBvcywgcG9zICsgcmFuZ2UpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBHZXQgdGhlIGxhYmVsIGZvciBhIGtleS5cbiAgICBwcmV0dHlMYWJlbDogZnVuY3Rpb24gKGtleSkge1xuICAgICAgaWYgKHRoaXMucHJvcHMuZmllbGQuZGVmLnJlcGxhY2VDaG9pY2VzTGFiZWxzW2tleV0pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMuZmllbGQuZGVmLnJlcGxhY2VDaG9pY2VzTGFiZWxzW2tleV07XG4gICAgICB9XG4gICAgICB2YXIgY2xlYW5lZCA9IHJlbW92ZUlkUHJlZml4KGtleSk7XG4gICAgICByZXR1cm4gdXRpbC5odW1hbml6ZShjbGVhbmVkKTtcbiAgICB9LFxuXG4gICAgLy8gR2l2ZW4gdGhlIGFjdHVhbCB2YWx1ZSBvZiB0aGUgZmllbGQgKHdpdGggdGFncyksIGdldCB0aGUgcGxhaW4gdGV4dCB0aGF0XG4gICAgLy8gc2hvdWxkIHNob3cgaW4gdGhlIHRleHRhcmVhLlxuICAgIHBsYWluVmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgdmFyIHBhcnRzID0gdXRpbC5wYXJzZVRleHRXaXRoVGFncyh2YWx1ZSk7XG4gICAgICByZXR1cm4gcGFydHMubWFwKGZ1bmN0aW9uIChwYXJ0KSB7XG4gICAgICAgIGlmIChwYXJ0LnR5cGUgPT09ICd0ZXh0Jykge1xuICAgICAgICAgIHJldHVybiBwYXJ0LnZhbHVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBMRUZUX1BBRCArIG5vQnJlYWsodGhpcy5wcmV0dHlMYWJlbChwYXJ0LnZhbHVlKSkgKyBSSUdIVF9QQUQ7XG4gICAgICAgIH1cbiAgICAgIH0uYmluZCh0aGlzKSkuam9pbignJyk7XG4gICAgfSxcblxuICAgIC8vIEdpdmVuIHRoZSBhY3R1YWwgdmFsdWUgb2YgdGhlIGZpZWxkICh3aXRoIHRhZ3MpLCBnZXQgdGhlIGh0bWwgdXNlZCB0b1xuICAgIC8vIGhpZ2hsaWdodCB0aGUgbGFiZWxzLlxuICAgIHByZXR0eVZhbHVlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHZhciBwYXJ0cyA9IHV0aWwucGFyc2VUZXh0V2l0aFRhZ3ModmFsdWUpO1xuICAgICAgcmV0dXJuIHBhcnRzLm1hcChmdW5jdGlvbiAocGFydCwgaSkge1xuICAgICAgICBpZiAocGFydC50eXBlID09PSAndGV4dCcpIHtcbiAgICAgICAgICBpZiAoaSA9PT0gKHBhcnRzLmxlbmd0aCAtIDEpKSB7XG4gICAgICAgICAgICBpZiAocGFydC52YWx1ZVtwYXJ0LnZhbHVlLmxlbmd0aCAtIDFdID09PSAnXFxuJykge1xuICAgICAgICAgICAgICByZXR1cm4gcGFydC52YWx1ZSArICdcXHUwMGEwJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHBhcnQudmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gTWFrZSBhIHBpbGxcbiAgICAgICAgICB2YXIgcGlsbFJlZiA9ICdwcmV0dHlQYXJ0JyArIGk7XG4gICAgICAgICAgdmFyIGNsYXNzTmFtZSA9ICdwcmV0dHktcGFydCc7XG4gICAgICAgICAgaWYgKHRoaXMuc3RhdGUuaG92ZXJQaWxsUmVmICYmIHBpbGxSZWYgPT09IHRoaXMuc3RhdGUuaG92ZXJQaWxsUmVmKSB7XG4gICAgICAgICAgICBjbGFzc05hbWUgKz0gJyBwcmV0dHktcGFydC1ob3Zlcic7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBSLnNwYW4oe2tleTogaSwgY2xhc3NOYW1lOiBjbGFzc05hbWUsIHJlZjogcGlsbFJlZiwgJ2RhdGEtcHJldHR5JzogdHJ1ZSwgJ2RhdGEtcmVmJzogcGlsbFJlZn0sXG4gICAgICAgICAgICBSLnNwYW4oe2NsYXNzTmFtZTogJ3ByZXR0eS1wYXJ0LWxlZnQnfSwgTEVGVF9QQUQpLFxuICAgICAgICAgICAgUi5zcGFuKHtjbGFzc05hbWU6ICdwcmV0dHktcGFydC10ZXh0J30sIG5vQnJlYWsodGhpcy5wcmV0dHlMYWJlbChwYXJ0LnZhbHVlKSkpLFxuICAgICAgICAgICAgUi5zcGFuKHtjbGFzc05hbWU6ICdwcmV0dHktcGFydC1yaWdodCd9LCBSSUdIVF9QQUQpXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLy8gR2l2ZW4gdGhlIHRva2VucyBmb3IgYSBmaWVsZCwgZ2V0IHRoZSBhY3R1YWwgdmFsdWUgb2YgdGhlIGZpZWxkICh3aXRoXG4gICAgLy8gdGFncylcbiAgICByYXdWYWx1ZTogZnVuY3Rpb24gKHRva2Vucykge1xuICAgICAgcmV0dXJuIHRva2Vucy5tYXAoZnVuY3Rpb24gKHRva2VuKSB7XG4gICAgICAgIGlmICh0b2tlbi50eXBlID09PSAndGFnJykge1xuICAgICAgICAgIHJldHVybiAne3snICsgdG9rZW4udmFsdWUgKyAnfX0nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgICAgfVxuICAgICAgfSkuam9pbignJyk7XG4gICAgfSxcblxuICAgIC8vIEdpdmVuIGEgcG9zaXRpb24sIGlmIGl0J3Mgb24gYSBsYWJlbCwgZ2V0IHRoZSBwb3NpdGlvbiBsZWZ0IG9yIHJpZ2h0IG9mXG4gICAgLy8gdGhlIGxhYmVsLCBiYXNlZCBvbiBkaXJlY3Rpb24gYW5kL29yIHdoaWNoIHNpZGUgaXMgY2xvc2VyXG4gICAgbW92ZU9mZlRhZzogZnVuY3Rpb24gKHBvcywgdG9rZW5zLCBpbmRleE1hcCwgZGlyKSB7XG4gICAgICBpZiAodHlwZW9mIGRpciA9PT0gJ3VuZGVmaW5lZCcgfHwgZGlyID4gMCkge1xuICAgICAgICBkaXIgPSAxO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGlyID0gLTE7XG4gICAgICB9XG4gICAgICB2YXIgdG9rZW47XG4gICAgICBpZiAoZGlyID4gMCkge1xuICAgICAgICB0b2tlbiA9IHRva2Vuc1tpbmRleE1hcFtwb3NdXTtcbiAgICAgICAgd2hpbGUgKHBvcyA8IGluZGV4TWFwLmxlbmd0aCAmJiB0b2tlbnNbaW5kZXhNYXBbcG9zXV0udHlwZSA9PT0gJ3RhZycgJiYgdG9rZW5zW2luZGV4TWFwW3Bvc11dID09PSB0b2tlbikge1xuICAgICAgICAgIHBvcysrO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0b2tlbiA9IHRva2Vuc1tpbmRleE1hcFtwb3MgLSAxXV07XG4gICAgICAgIHdoaWxlIChwb3MgPiAwICYmIHRva2Vuc1tpbmRleE1hcFtwb3MgLSAxXV0udHlwZSA9PT0gJ3RhZycgJiYgdG9rZW5zW2luZGV4TWFwW3BvcyAtIDFdXSA9PT0gdG9rZW4pIHtcbiAgICAgICAgICBwb3MtLTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcG9zO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgdGhlIHRva2VuIGF0IHNvbWUgcG9zaXRpb24uXG4gICAgdG9rZW5BdDogZnVuY3Rpb24gKHBvcykge1xuICAgICAgaWYgKHBvcyA+PSB0aGlzLnRyYWNraW5nLmluZGV4TWFwLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIGlmIChwb3MgPCAwKSB7XG4gICAgICAgIHBvcyA9IDA7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy50cmFja2luZy50b2tlbnNbdGhpcy50cmFja2luZy5pbmRleE1hcFtwb3NdXTtcbiAgICB9LFxuXG4gICAgLy8gR2V0IHRoZSB0b2tlbiBpbW1lZGlhdGVseSBiZWZvcmUgc29tZSBwb3NpdGlvbi5cbiAgICB0b2tlbkJlZm9yZTogZnVuY3Rpb24gKHBvcykge1xuICAgICAgaWYgKHBvcyA+PSB0aGlzLnRyYWNraW5nLmluZGV4TWFwLmxlbmd0aCkge1xuICAgICAgICBwb3MgPSB0aGlzLnRyYWNraW5nLmluZGV4TWFwLmxlbmd0aDtcbiAgICAgIH1cbiAgICAgIGlmIChwb3MgPD0gMCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnRyYWNraW5nLnRva2Vuc1t0aGlzLnRyYWNraW5nLmluZGV4TWFwW3BvcyAtIDFdXTtcbiAgICB9LFxuXG4gICAgLy8gR2l2ZW4gYSBwb3NpdGlvbiwgZ2V0IGEgY29ycmVjdGVkIHBvc2l0aW9uIChpZiBuZWNlc3NhcnkgdG8gYmVcbiAgICAvLyBjb3JyZWN0ZWQpLlxuICAgIG5vcm1hbGl6ZVBvc2l0aW9uOiBmdW5jdGlvbiAocG9zLCBwcmV2UG9zKSB7XG4gICAgICBpZiAoXy5pc1VuZGVmaW5lZChwcmV2UG9zKSkge1xuICAgICAgICBwcmV2UG9zID0gcG9zO1xuICAgICAgfVxuICAgICAgLy8gQXQgc3RhcnQgb3IgZW5kLCBzbyBva2F5LlxuICAgICAgaWYgKHBvcyA8PSAwIHx8IHBvcyA+PSB0aGlzLnRyYWNraW5nLmluZGV4TWFwLmxlbmd0aCkge1xuICAgICAgICBpZiAocG9zIDwgMCkge1xuICAgICAgICAgIHBvcyA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBvcyA+IHRoaXMudHJhY2tpbmcuaW5kZXhNYXAubGVuZ3RoKSB7XG4gICAgICAgICAgcG9zID0gdGhpcy50cmFja2luZy5pbmRleE1hcC5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBvcztcbiAgICAgIH1cblxuICAgICAgdmFyIHRva2VuID0gdGhpcy50b2tlbkF0KHBvcyk7XG4gICAgICB2YXIgdG9rZW5CZWZvcmUgPSB0aGlzLnRva2VuQmVmb3JlKHBvcyk7XG5cbiAgICAgIC8vIEJldHdlZW4gdHdvIHRva2Vucywgc28gb2theS5cbiAgICAgIGlmICh0b2tlbiAhPT0gdG9rZW5CZWZvcmUpIHtcbiAgICAgICAgcmV0dXJuIHBvcztcbiAgICAgIH1cblxuICAgICAgdmFyIHByZXZUb2tlbiA9IHRoaXMudG9rZW5BdChwcmV2UG9zKTtcbiAgICAgIHZhciBwcmV2VG9rZW5CZWZvcmUgPSB0aGlzLnRva2VuQmVmb3JlKHByZXZQb3MpO1xuXG4gICAgICB2YXIgcmlnaHRQb3MgPSB0aGlzLm1vdmVPZmZUYWcocG9zLCB0aGlzLnRyYWNraW5nLnRva2VucywgdGhpcy50cmFja2luZy5pbmRleE1hcCk7XG4gICAgICB2YXIgbGVmdFBvcyA9IHRoaXMubW92ZU9mZlRhZyhwb3MsIHRoaXMudHJhY2tpbmcudG9rZW5zLCB0aGlzLnRyYWNraW5nLmluZGV4TWFwLCAtMSk7XG5cbiAgICAgIGlmIChwcmV2VG9rZW4gIT09IHByZXZUb2tlbkJlZm9yZSkge1xuICAgICAgICAvLyBNb3ZlZCBmcm9tIGxlZnQgZWRnZS5cbiAgICAgICAgaWYgKHByZXZUb2tlbiA9PT0gdG9rZW4pIHtcbiAgICAgICAgICByZXR1cm4gcmlnaHRQb3M7XG4gICAgICAgIH1cbiAgICAgICAgLy8gTW92ZWQgZnJvbSByaWdodCBlZGdlLlxuICAgICAgICBpZiAocHJldlRva2VuQmVmb3JlID09PSB0b2tlbikge1xuICAgICAgICAgIHJldHVybiBsZWZ0UG9zO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciBuZXdQb3MgPSByaWdodFBvcztcblxuICAgICAgaWYgKHBvcyA9PT0gcHJldlBvcyB8fCBwb3MgPCBwcmV2UG9zKSB7XG4gICAgICAgIGlmIChyaWdodFBvcyAtIHBvcyA+IHBvcyAtIGxlZnRQb3MpIHtcbiAgICAgICAgICBuZXdQb3MgPSBsZWZ0UG9zO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3UG9zO1xuICAgIH0sXG5cblxuXG4gICAgb25TZWxlY3Q6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgdmFyIG5vZGUgPSBldmVudC50YXJnZXQ7XG5cbiAgICAgIHZhciBwb3MgPSBub2RlLnNlbGVjdGlvblN0YXJ0O1xuICAgICAgdmFyIGVuZFBvcyA9IG5vZGUuc2VsZWN0aW9uRW5kO1xuXG4gICAgICBpZiAocG9zID09PSBlbmRQb3MgJiYgIXRoaXMubGVmdEFycm93RG93biAmJiAhdGhpcy5yaWdodEFycm93RG93bikge1xuICAgICAgICB2YXIgdG9rZW5BdCA9IHRoaXMudG9rZW5BdChwb3MpO1xuICAgICAgICB2YXIgdG9rZW5CZWZvcmUgPSB0aGlzLnRva2VuQmVmb3JlKHBvcyk7XG5cbiAgICAgICAgaWYgKHRva2VuQXQgJiYgdG9rZW5BdCA9PT0gdG9rZW5CZWZvcmUgJiYgdG9rZW5BdC50eXBlICYmIHRva2VuQXQudHlwZSA9PT0gJ3RhZycpIHtcbiAgICAgICAgICAvLyBDbGlja2VkIGEgdGFnLlxuICAgICAgICAgIHZhciByaWdodFBvcyA9IHRoaXMubW92ZU9mZlRhZyhwb3MsIHRoaXMudHJhY2tpbmcudG9rZW5zLCB0aGlzLnRyYWNraW5nLmluZGV4TWFwKTtcbiAgICAgICAgICB2YXIgbGVmdFBvcyA9IHRoaXMubW92ZU9mZlRhZyhwb3MsIHRoaXMudHJhY2tpbmcudG9rZW5zLCB0aGlzLnRyYWNraW5nLmluZGV4TWFwLCAtMSk7XG4gICAgICAgICAgdGhpcy50cmFja2luZy5wb3MgPSBsZWZ0UG9zO1xuICAgICAgICAgIHRoaXMudHJhY2tpbmcucmFuZ2UgPSByaWdodFBvcyAtIGxlZnRQb3M7XG4gICAgICAgICAgbm9kZS5zZWxlY3Rpb25TdGFydCA9IGxlZnRQb3M7XG4gICAgICAgICAgbm9kZS5zZWxlY3Rpb25FbmQgPSByaWdodFBvcztcblxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2lzQ2hvaWNlc09wZW46IHRydWV9KTtcblxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBwb3MgPSB0aGlzLm5vcm1hbGl6ZVBvc2l0aW9uKHBvcywgdGhpcy50cmFja2luZy5wb3MpO1xuICAgICAgZW5kUG9zID0gdGhpcy5ub3JtYWxpemVQb3NpdGlvbihlbmRQb3MsIHRoaXMudHJhY2tpbmcucG9zICsgdGhpcy50cmFja2luZy5yYW5nZSk7XG5cbiAgICAgIHRoaXMudHJhY2tpbmcucG9zID0gcG9zO1xuICAgICAgdGhpcy50cmFja2luZy5yYW5nZSA9IGVuZFBvcyAtIHBvcztcblxuICAgICAgbm9kZS5zZWxlY3Rpb25TdGFydCA9IHBvcztcbiAgICAgIG5vZGUuc2VsZWN0aW9uRW5kID0gZW5kUG9zO1xuICAgIH0sXG5cbiAgICBvbkNvcHk6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBub2RlID0gdGhpcy5yZWZzLmNvbnRlbnQuZ2V0RE9NTm9kZSgpO1xuICAgICAgdmFyIHN0YXJ0ID0gbm9kZS5zZWxlY3Rpb25TdGFydDtcbiAgICAgIHZhciBlbmQgPSBub2RlLnNlbGVjdGlvbkVuZDtcbiAgICAgIHZhciB0ZXh0ID0gbm9kZS52YWx1ZS5zdWJzdHJpbmcoc3RhcnQsIGVuZCk7XG4gICAgICB2YXIgcmVhbFN0YXJ0SW5kZXggPSB0aGlzLnRva2VuSW5kZXgoc3RhcnQsIHRoaXMudHJhY2tpbmcudG9rZW5zLCB0aGlzLnRyYWNraW5nLmluZGV4TWFwKTtcbiAgICAgIHZhciByZWFsRW5kSW5kZXggPSB0aGlzLnRva2VuSW5kZXgoZW5kLCB0aGlzLnRyYWNraW5nLnRva2VucywgdGhpcy50cmFja2luZy5pbmRleE1hcCk7XG4gICAgICB2YXIgdG9rZW5zID0gdGhpcy50cmFja2luZy50b2tlbnMuc2xpY2UocmVhbFN0YXJ0SW5kZXgsIHJlYWxFbmRJbmRleCk7XG4gICAgICB0ZXh0ID0gdGhpcy5yYXdWYWx1ZSh0b2tlbnMpO1xuICAgICAgdmFyIG9yaWdpbmFsVmFsdWUgPSBub2RlLnZhbHVlO1xuICAgICAgbm9kZS52YWx1ZSA9IG5vZGUudmFsdWUgKyB0ZXh0O1xuICAgICAgbm9kZS5zZXRTZWxlY3Rpb25SYW5nZShvcmlnaW5hbFZhbHVlLmxlbmd0aCwgb3JpZ2luYWxWYWx1ZS5sZW5ndGggKyB0ZXh0Lmxlbmd0aCk7XG4gICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgbm9kZS52YWx1ZSA9IG9yaWdpbmFsVmFsdWU7XG4gICAgICAgIG5vZGUuc2V0U2VsZWN0aW9uUmFuZ2Uoc3RhcnQsIGVuZCk7XG4gICAgICB9LDApO1xuICAgIH0sXG5cbiAgICBvbkN1dDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIG5vZGUgPSB0aGlzLnJlZnMuY29udGVudC5nZXRET01Ob2RlKCk7XG4gICAgICB2YXIgc3RhcnQgPSBub2RlLnNlbGVjdGlvblN0YXJ0O1xuICAgICAgdmFyIGVuZCA9IG5vZGUuc2VsZWN0aW9uRW5kO1xuICAgICAgdmFyIHRleHQgPSBub2RlLnZhbHVlLnN1YnN0cmluZyhzdGFydCwgZW5kKTtcbiAgICAgIHZhciByZWFsU3RhcnRJbmRleCA9IHRoaXMudG9rZW5JbmRleChzdGFydCwgdGhpcy50cmFja2luZy50b2tlbnMsIHRoaXMudHJhY2tpbmcuaW5kZXhNYXApO1xuICAgICAgdmFyIHJlYWxFbmRJbmRleCA9IHRoaXMudG9rZW5JbmRleChlbmQsIHRoaXMudHJhY2tpbmcudG9rZW5zLCB0aGlzLnRyYWNraW5nLmluZGV4TWFwKTtcbiAgICAgIHZhciB0b2tlbnMgPSB0aGlzLnRyYWNraW5nLnRva2Vucy5zbGljZShyZWFsU3RhcnRJbmRleCwgcmVhbEVuZEluZGV4KTtcbiAgICAgIHRleHQgPSB0aGlzLnJhd1ZhbHVlKHRva2Vucyk7XG4gICAgICB2YXIgb3JpZ2luYWxWYWx1ZSA9IG5vZGUudmFsdWU7XG4gICAgICB2YXIgY3V0VmFsdWUgPSBub2RlLnZhbHVlLnN1YnN0cmluZygwLCBzdGFydCkgKyBub2RlLnZhbHVlLnN1YnN0cmluZyhlbmQpO1xuICAgICAgbm9kZS52YWx1ZSA9IG5vZGUudmFsdWUgKyB0ZXh0O1xuICAgICAgbm9kZS5zZXRTZWxlY3Rpb25SYW5nZShvcmlnaW5hbFZhbHVlLmxlbmd0aCwgb3JpZ2luYWxWYWx1ZS5sZW5ndGggKyB0ZXh0Lmxlbmd0aCk7XG4gICAgICB2YXIgY3V0VG9rZW5zID0gdGhpcy50cmFja2luZy50b2tlbnMuc2xpY2UoMCwgcmVhbFN0YXJ0SW5kZXgpLmNvbmNhdCh0aGlzLnRyYWNraW5nLnRva2Vucy5zbGljZShyZWFsRW5kSW5kZXgpKTtcbiAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBub2RlLnZhbHVlID0gY3V0VmFsdWU7XG4gICAgICAgIG5vZGUuc2V0U2VsZWN0aW9uUmFuZ2Uoc3RhcnQsIHN0YXJ0KTtcbiAgICAgICAgdGhpcy50cmFja2luZy5wb3MgPSBzdGFydDtcbiAgICAgICAgdGhpcy50cmFja2luZy5yYW5nZSA9IDA7XG4gICAgICAgIHRoaXMudHJhY2tpbmcudG9rZW5zID0gY3V0VG9rZW5zO1xuICAgICAgICB0aGlzLnRyYWNraW5nLmluZGV4TWFwID0gdGhpcy5pbmRleE1hcCh0aGlzLnRyYWNraW5nLnRva2Vucyk7XG5cbiAgICAgICAgLy8gQ29udmVydCB0b2tlbnMgYmFjayBpbnRvIHJhdyB2YWx1ZSB3aXRoIHRhZ3MuIE5ld2x5IGZvcm1lZCB0YWdzIHdpbGxcbiAgICAgICAgLy8gYmVjb21lIHBhcnQgb2YgdGhlIHJhdyB2YWx1ZS5cbiAgICAgICAgdmFyIHJhd1ZhbHVlID0gdGhpcy5yYXdWYWx1ZSh0aGlzLnRyYWNraW5nLnRva2Vucyk7XG5cbiAgICAgICAgLy8gU2V0IHRoZSB2YWx1ZSB0byB0aGUgbmV3IHJhdyB2YWx1ZS5cbiAgICAgICAgdGhpcy5wcm9wcy5maWVsZC52YWwocmF3VmFsdWUpO1xuXG4gICAgICAgIHRoaXMuc25hcHNob3QoKTtcbiAgICAgIH0uYmluZCh0aGlzKSwwKTtcbiAgICB9LFxuXG4gICAgb25LZXlEb3duOiBmdW5jdGlvbiAoZXZlbnQpIHtcblxuICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDM3KSB7XG4gICAgICAgIHRoaXMubGVmdEFycm93RG93biA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKGV2ZW50LmtleUNvZGUgPT09IDM5KSB7XG4gICAgICAgIHRoaXMucmlnaHRBcnJvd0Rvd24gPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBDbWQtWiBvciBDdHJsLVpcbiAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSA5MCAmJiAoZXZlbnQubWV0YUtleSB8fCBldmVudC5jdHJsS2V5KSAmJiAhZXZlbnQuc2hpZnRLZXkpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy51bmRvKCk7XG4gICAgICAvLyBDbWQtU2hpZnQtWiBvciBDdHJsLVlcbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIChldmVudC5rZXlDb2RlID09PSA4OSAmJiBldmVudC5jdHJsS2V5ICYmICFldmVudC5zaGlmdEtleSkgfHxcbiAgICAgICAgKGV2ZW50LmtleUNvZGUgPT09IDkwICYmIGV2ZW50Lm1ldGFLZXkgJiYgZXZlbnQuc2hpZnRLZXkpXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5yZWRvKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIG9uS2V5VXA6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDM3KSB7XG4gICAgICAgIHRoaXMubGVmdEFycm93RG93biA9IGZhbHNlO1xuICAgICAgfSBlbHNlIGlmIChldmVudC5rZXlDb2RlID09PSAzOSkge1xuICAgICAgICB0aGlzLnJpZ2h0QXJyb3dEb3duID0gZmFsc2U7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIEtlZXAgdGhlIGhpZ2hsaWdodCBzdHlsZXMgaW4gc3luYyB3aXRoIHRoZSB0ZXh0YXJlYSBzdHlsZXMuXG4gICAgYWRqdXN0U3R5bGVzOiBmdW5jdGlvbiAoaXNNb3VudCkge1xuICAgICAgdmFyIG92ZXJsYXkgPSB0aGlzLnJlZnMuaGlnaGxpZ2h0LmdldERPTU5vZGUoKTtcbiAgICAgIHZhciBjb250ZW50ID0gdGhpcy5yZWZzLmNvbnRlbnQuZ2V0RE9NTm9kZSgpO1xuXG4gICAgICB2YXIgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShjb250ZW50KTtcblxuICAgICAgdmFyIGJhY2tncm91bmRDb2xvciA9IHN0eWxlLmJhY2tncm91bmRDb2xvcjtcblxuICAgICAgdXRpbC5jb3B5RWxlbWVudFN0eWxlKGNvbnRlbnQsIG92ZXJsYXkpO1xuXG4gICAgICBvdmVybGF5LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgIG92ZXJsYXkuc3R5bGUud2hpdGVTcGFjZSA9ICdwcmUtd3JhcCc7XG4gICAgICBvdmVybGF5LnN0eWxlLmNvbG9yID0gJ3JnYmEoMCwwLDAsMCknO1xuICAgICAgb3ZlcmxheS5zdHlsZS53ZWJraXRUZXh0RmlsbENvbG9yID0gJ3JnYmEoMCwwLDAsMCknO1xuICAgICAgb3ZlcmxheS5zdHlsZS5yZXNpemUgPSAnbm9uZSc7XG4gICAgICBvdmVybGF5LnN0eWxlLmJvcmRlckNvbG9yID0gJ3JnYmEoMCwwLDAsMCknO1xuXG4gICAgICBpZiAodXRpbC5icm93c2VyLmlzTW96aWxsYSkge1xuXG4gICAgICAgIHZhciBwYWRkaW5nVG9wID0gcGFyc2VGbG9hdChzdHlsZS5wYWRkaW5nVG9wKTtcbiAgICAgICAgdmFyIHBhZGRpbmdCb3R0b20gPSBwYXJzZUZsb2F0KHN0eWxlLnBhZGRpbmdCb3R0b20pO1xuXG4gICAgICAgIHZhciBib3JkZXJUb3AgPSBwYXJzZUZsb2F0KHN0eWxlLmJvcmRlclRvcFdpZHRoKTtcbiAgICAgICAgdmFyIGJvcmRlckJvdHRvbSA9IHBhcnNlRmxvYXQoc3R5bGUuYm9yZGVyQm90dG9tV2lkdGgpO1xuXG4gICAgICAgIG92ZXJsYXkuc3R5bGUucGFkZGluZ1RvcCA9ICcwcHgnO1xuICAgICAgICBvdmVybGF5LnN0eWxlLnBhZGRpbmdCb3R0b20gPSAnMHB4JztcblxuICAgICAgICBvdmVybGF5LnN0eWxlLmhlaWdodCA9IChjb250ZW50LmNsaWVudEhlaWdodCAtIHBhZGRpbmdUb3AgLSBwYWRkaW5nQm90dG9tICsgYm9yZGVyVG9wICsgYm9yZGVyQm90dG9tKSArICdweCc7XG4gICAgICAgIG92ZXJsYXkuc3R5bGUudG9wID0gc3R5bGUucGFkZGluZ1RvcDtcbiAgICAgICAgb3ZlcmxheS5zdHlsZS5ib3hTaGFkb3cgPSAnbm9uZSc7XG4gICAgICB9XG5cbiAgICAgIGlmIChpc01vdW50KSB7XG4gICAgICAgIHRoaXMuYmFja2dyb3VuZENvbG9yID0gYmFja2dyb3VuZENvbG9yO1xuICAgICAgfVxuICAgICAgb3ZlcmxheS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSB0aGlzLmJhY2tncm91bmRDb2xvcjtcbiAgICAgIGNvbnRlbnQuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3JnYmEoMCwwLDAsMCknO1xuICAgIH0sXG5cbiAgICAvLyBJZiB0aGUgdGV4dGFyZWEgaXMgcmVzaXplZCwgbmVlZCB0byByZS1zeW5jIHRoZSBzdHlsZXMuXG4gICAgb25SZXNpemU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuYWRqdXN0U3R5bGVzKCk7XG4gICAgfSxcblxuICAgIC8vIElmIHRoZSB3aW5kb3cgaXMgcmVzaXplZCwgbWF5IG5lZWQgdG8gcmUtc3luYyB0aGUgc3R5bGVzLlxuICAgIC8vIFByb2JhYmx5IG5vdCBuZWNlc3Nhcnkgd2l0aCBlbGVtZW50IHJlc2l6ZT9cbiAgICBvblJlc2l6ZVdpbmRvdzogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5hZGp1c3RTdHlsZXMoKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuYWRqdXN0U3R5bGVzKHRydWUpO1xuICAgICAgdGhpcy5zZXRPblJlc2l6ZSgnY29udGVudCcsIHRoaXMub25SZXNpemUpO1xuICAgICAgLy90aGlzLnNldE9uQ2xpY2tPdXRzaWRlKCdjaG9pY2VzJywgdGhpcy5vbkNsaWNrT3V0c2lkZUNob2ljZXMpO1xuICAgIH0sXG5cbiAgICBvbkluc2VydEZyb21TZWxlY3Q6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgaWYgKGV2ZW50LnRhcmdldC5zZWxlY3RlZEluZGV4ID4gMCkge1xuICAgICAgICB2YXIgdGFnID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xuICAgICAgICBldmVudC50YXJnZXQuc2VsZWN0ZWRJbmRleCA9IDA7XG4gICAgICAgIHZhciBwb3MgPSB0aGlzLnRyYWNraW5nLnBvcztcbiAgICAgICAgdmFyIGluc2VydFBvcyA9IHRoaXMubm9ybWFsaXplUG9zaXRpb24ocG9zKTtcbiAgICAgICAgdmFyIHRva2VucyA9IHRoaXMudHJhY2tpbmcudG9rZW5zO1xuICAgICAgICB2YXIgdG9rZW5JbmRleCA9IHRoaXMudG9rZW5JbmRleChpbnNlcnRQb3MsIHRva2VucywgdGhpcy50cmFja2luZy5pbmRleE1hcCk7XG4gICAgICAgIHRva2Vucy5zcGxpY2UodG9rZW5JbmRleCwgMCwge1xuICAgICAgICAgIHR5cGU6ICd0YWcnLFxuICAgICAgICAgIHZhbHVlOiB0YWdcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudHJhY2tpbmcuaW5kZXhNYXAgPSB0aGlzLmluZGV4TWFwKHRva2Vucyk7XG4gICAgICAgIHZhciBuZXdWYWx1ZSA9IHRoaXMucmF3VmFsdWUodG9rZW5zKTtcbiAgICAgICAgdGhpcy50cmFja2luZy5wb3MgKz0gdGhpcy5wcmV0dHlMYWJlbCh0YWcpLmxlbmd0aDtcbiAgICAgICAgdGhpcy5wcm9wcy5maWVsZC52YWwobmV3VmFsdWUpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBvbkluc2VydDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB2YXIgdGFnID0gdmFsdWU7XG4gICAgICB2YXIgcG9zID0gdGhpcy50cmFja2luZy5wb3M7XG4gICAgICB2YXIgZW5kUG9zID0gdGhpcy50cmFja2luZy5wb3MgKyB0aGlzLnRyYWNraW5nLnJhbmdlO1xuICAgICAgdmFyIGluc2VydFBvcyA9IHRoaXMubm9ybWFsaXplUG9zaXRpb24ocG9zKTtcbiAgICAgIHZhciBlbmRJbnNlcnRQb3MgPSB0aGlzLm5vcm1hbGl6ZVBvc2l0aW9uKGVuZFBvcyk7XG4gICAgICB2YXIgdG9rZW5zID0gdGhpcy50cmFja2luZy50b2tlbnM7XG4gICAgICB2YXIgdG9rZW5JbmRleCA9IHRoaXMudG9rZW5JbmRleChpbnNlcnRQb3MsIHRva2VucywgdGhpcy50cmFja2luZy5pbmRleE1hcCk7XG4gICAgICB2YXIgdG9rZW5FbmRJbmRleCA9IHRoaXMudG9rZW5JbmRleChlbmRJbnNlcnRQb3MsIHRva2VucywgdGhpcy50cmFja2luZy5pbmRleE1hcCk7XG4gICAgICB0b2tlbnMuc3BsaWNlKHRva2VuSW5kZXgsIHRva2VuRW5kSW5kZXggLSB0b2tlbkluZGV4LCB7XG4gICAgICAgIHR5cGU6ICd0YWcnLFxuICAgICAgICB2YWx1ZTogdGFnXG4gICAgICB9KTtcbiAgICAgIHRoaXMudHJhY2tpbmcuaW5kZXhNYXAgPSB0aGlzLmluZGV4TWFwKHRva2Vucyk7XG4gICAgICB2YXIgbmV3VmFsdWUgPSB0aGlzLnJhd1ZhbHVlKHRva2Vucyk7XG4gICAgICB0aGlzLnRyYWNraW5nLnBvcyArPSB0aGlzLnByZXR0eUxhYmVsKHRhZykubGVuZ3RoO1xuICAgICAgdGhpcy5wcm9wcy5maWVsZC52YWwobmV3VmFsdWUpO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGlzQ2hvaWNlc09wZW46IGZhbHNlXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgb25Ub2dnbGVDaG9pY2VzOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgaXNDaG9pY2VzT3BlbjogIXRoaXMuc3RhdGUuaXNDaG9pY2VzT3BlblxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIG9uQ2xvc2VDaG9pY2VzOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBpc0Nob2ljZXNPcGVuOiBmYWxzZVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGdldENsb3NlSWdub3JlTm9kZXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLnJlZnMudG9nZ2xlLmdldERPTU5vZGUoKTtcbiAgICB9LFxuXG4gICAgb25DbGlja091dHNpZGVDaG9pY2VzOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIC8vIC8vIElmIHdlIGRpZG4ndCBjbGljayBvbiB0aGUgdG9nZ2xlIGJ1dHRvbiwgY2xvc2UgdGhlIGNob2ljZXMuXG4gICAgICAvLyBpZiAodGhpcy5pc05vZGVPdXRzaWRlKHRoaXMucmVmcy50b2dnbGUuZ2V0RE9NTm9kZSgpLCBldmVudC50YXJnZXQpKSB7XG4gICAgICAvLyAgIGNvbnNvbGUubG9nKCdub3QgYSB0b2dnbGUgY2xpY2snKVxuICAgICAgLy8gICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIC8vICAgICBpc0Nob2ljZXNPcGVuOiBmYWxzZVxuICAgICAgLy8gICB9KTtcbiAgICAgIC8vIH1cbiAgICB9LFxuXG4gICAgb25Nb3VzZU1vdmU6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgLy8gUGxhY2Vob2xkZXIgdG8gZ2V0IGF0IHBpbGwgdW5kZXIgbW91c2UgcG9zaXRpb24uIEluZWZmaWNpZW50LCBidXQgbm90XG4gICAgICAvLyBzdXJlIHRoZXJlJ3MgYW5vdGhlciB3YXkuXG5cbiAgICAgIHZhciBwb3NpdGlvbiA9IHt4OiBldmVudC5jbGllbnRYLCB5OiBldmVudC5jbGllbnRZfTtcbiAgICAgIHZhciBub2RlcyA9IHRoaXMucmVmcy5oaWdobGlnaHQuZ2V0RE9NTm9kZSgpLmNoaWxkTm9kZXM7XG4gICAgICB2YXIgbWF0Y2hlZE5vZGUgPSBudWxsO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgbm9kZSA9IG5vZGVzW2ldO1xuICAgICAgICBpZiAobm9kZXNbaV0uZ2V0QXR0cmlidXRlKCdkYXRhLXByZXR0eScpKSB7XG4gICAgICAgICAgaWYgKHBvc2l0aW9uSW5Ob2RlKHBvc2l0aW9uLCBub2RlKSkge1xuICAgICAgICAgICAgbWF0Y2hlZE5vZGUgPSBub2RlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChtYXRjaGVkTm9kZSkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5ob3ZlclBpbGxSZWYgIT09IG1hdGNoZWROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1yZWYnKSkge1xuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgaG92ZXJQaWxsUmVmOiBtYXRjaGVkTm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtcmVmJylcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLmhvdmVyUGlsbFJlZikge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBob3ZlclBpbGxSZWY6IG51bGxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgICAgdmFyIHJlcGxhY2VDaG9pY2VzID0gZmllbGQuZGVmLnJlcGxhY2VDaG9pY2VzO1xuXG4gICAgICAvLyB2YXIgc2VsZWN0UmVwbGFjZUNob2ljZXMgPSBbe1xuICAgICAgLy8gICB2YWx1ZTogJycsXG4gICAgICAvLyAgIGxhYmVsOiAnSW5zZXJ0Li4uJ1xuICAgICAgLy8gfV0uY29uY2F0KHJlcGxhY2VDaG9pY2VzKTtcblxuICAgICAgcmV0dXJuIHBsdWdpbi5jb21wb25lbnQoJ2ZpZWxkJykoe1xuICAgICAgICBmaWVsZDogZmllbGRcbiAgICAgIH0sIFIuZGl2KHtzdHlsZToge3Bvc2l0aW9uOiAncmVsYXRpdmUnfX0sXG5cbiAgICAgICAgUi5wcmUoe1xuICAgICAgICAgIGNsYXNzTmFtZTogJ3ByZXR0eS1oaWdobGlnaHQnLFxuICAgICAgICAgIHJlZjogJ2hpZ2hsaWdodCdcbiAgICAgICAgfSxcbiAgICAgICAgICB0aGlzLnByZXR0eVZhbHVlKGZpZWxkLnZhbHVlKVxuICAgICAgICApLFxuXG4gICAgICAgIFIudGV4dGFyZWEoXy5leHRlbmQoe1xuICAgICAgICAgIGNsYXNzTmFtZTogdXRpbC5jbGFzc05hbWUodGhpcy5wcm9wcy5jbGFzc05hbWUsICdwcmV0dHktY29udGVudCcpLFxuICAgICAgICAgIHJlZjogJ2NvbnRlbnQnLFxuICAgICAgICAgIHJvd3M6IGZpZWxkLmRlZi5yb3dzIHx8IHRoaXMucHJvcHMucm93cyxcbiAgICAgICAgICBuYW1lOiBmaWVsZC5rZXksXG4gICAgICAgICAgdmFsdWU6IHRoaXMucGxhaW5WYWx1ZShmaWVsZC52YWx1ZSksXG4gICAgICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsXG4gICAgICAgICAgb25TY3JvbGw6IHRoaXMub25TY3JvbGwsXG4gICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnLFxuICAgICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICAgIGN1cnNvcjogdGhpcy5zdGF0ZS5ob3ZlclBpbGxSZWYgPyAncG9pbnRlcicgOiBudWxsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBvbktleVByZXNzOiB0aGlzLm9uS2V5UHJlc3MsXG4gICAgICAgICAgb25LZXlEb3duOiB0aGlzLm9uS2V5RG93bixcbiAgICAgICAgICBvbktleVVwOiB0aGlzLm9uS2V5VXAsXG4gICAgICAgICAgb25TZWxlY3Q6IHRoaXMub25TZWxlY3QsXG4gICAgICAgICAgb25Db3B5OiB0aGlzLm9uQ29weSxcbiAgICAgICAgICBvbkN1dDogdGhpcy5vbkN1dCxcbiAgICAgICAgICBvbk1vdXNlTW92ZTogdGhpcy5vbk1vdXNlTW92ZVxuICAgICAgICB9LCBwbHVnaW4uY29uZmlnLmF0dHJpYnV0ZXMpKSxcblxuICAgICAgICBSLmEoe3JlZjogJ3RvZ2dsZScsIGhyZWY6ICdKYXZhU2NyaXB0JyArICc6Jywgb25DbGljazogdGhpcy5vblRvZ2dsZUNob2ljZXN9LCAnSW5zZXJ0Li4uJyksXG5cbiAgICAgICAgcGx1Z2luLmNvbXBvbmVudCgnY2hvaWNlcycpKHtcbiAgICAgICAgICByZWY6ICdjaG9pY2VzJyxcbiAgICAgICAgICBjaG9pY2VzOiByZXBsYWNlQ2hvaWNlcywgb3BlbjogdGhpcy5zdGF0ZS5pc0Nob2ljZXNPcGVuLFxuICAgICAgICAgIG9uU2VsZWN0OiB0aGlzLm9uSW5zZXJ0LCBvbkNsb3NlOiB0aGlzLm9uQ2xvc2VDaG9pY2VzLCBpZ25vcmVDbG9zZU5vZGVzOiB0aGlzLmdldENsb3NlSWdub3JlTm9kZXN9KVxuICAgICAgICAvLyxcblxuICAgICAgICAvLyBSLnNlbGVjdCh7b25DaGFuZ2U6IHRoaXMub25JbnNlcnRGcm9tU2VsZWN0fSxcbiAgICAgICAgLy8gICBzZWxlY3RSZXBsYWNlQ2hvaWNlcy5tYXAoZnVuY3Rpb24gKGNob2ljZSwgaSkge1xuICAgICAgICAvLyAgICAgcmV0dXJuIFIub3B0aW9uKHtcbiAgICAgICAgLy8gICAgICAga2V5OiBpLFxuICAgICAgICAvLyAgICAgICB2YWx1ZTogY2hvaWNlLnZhbHVlXG4gICAgICAgIC8vICAgICB9LCBjaG9pY2UubGFiZWwpO1xuICAgICAgICAvLyAgIH0pXG4gICAgICAgIC8vIClcbiAgICAgICkpO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC5yZW1vdmUtaXRlbVxuXG4vKlxuUmVtb3ZlIGFuIGl0ZW0uXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZGlzcGxheU5hbWU6IHBsdWdpbi5uYW1lLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lLFxuICAgICAgICBsYWJlbDogcGx1Z2luLmNvbmZpZ1ZhbHVlKCdsYWJlbCcsICdbcmVtb3ZlXScpXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBSLnNwYW4oe2NsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWUsIG9uQ2xpY2s6IHRoaXMucHJvcHMub25DbGlja30sIHRoaXMucHJvcHMubGFiZWwpO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC5yb290XG5cbi8qXG5Sb290IGNvbXBvbmVudCBqdXN0IHVzZWQgdG8gc3BpdCBvdXQgYWxsIHRoZSBmaWVsZHMgZm9yIGEgZm9ybS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgdmFyIHV0aWwgPSBwbHVnaW4ucmVxdWlyZSgndXRpbCcpO1xuXG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZGlzcGxheU5hbWU6IHBsdWdpbi5uYW1lLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHV0aWwuY2xhc3NOYW1lKCdyb290JywgcGx1Z2luLmNvbmZpZy5jbGFzc05hbWUpXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICAgIHJldHVybiBSLmRpdih7XG4gICAgICAgIGNsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWVcbiAgICAgIH0sXG4gICAgICAgIGZpZWxkLmZpZWxkcygpLm1hcChmdW5jdGlvbiAoZmllbGQsIGkpIHtcbiAgICAgICAgICByZXR1cm4gZmllbGQuY29tcG9uZW50KHtrZXk6IGZpZWxkLmRlZi5rZXkgfHwgaX0pO1xuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQuaGVscFxuXG4vKlxuSnVzdCB0aGUgaGVscCB0ZXh0IGJsb2NrLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGRpc3BsYXlOYW1lOiBwbHVnaW4ubmFtZSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBjaG9pY2UgPSB0aGlzLnByb3BzLmNob2ljZTtcblxuICAgICAgcmV0dXJuIGNob2ljZS5zYW1wbGUgP1xuICAgICAgICBSLmRpdih7Y2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZX0sXG4gICAgICAgICAgY2hvaWNlLnNhbXBsZVxuICAgICAgICApIDpcbiAgICAgICAgUi5zcGFuKG51bGwpO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC5zZWxlY3RcblxuLypcblJlbmRlciBzZWxlY3QgZWxlbWVudCB0byBnaXZlIGEgdXNlciBjaG9pY2VzIGZvciB0aGUgdmFsdWUgb2YgYSBmaWVsZC4gTm90ZVxuaXQgc2hvdWxkIHN1cHBvcnQgdmFsdWVzIG90aGVyIHRoYW4gc3RyaW5ncy4gQ3VycmVudGx5IHRoaXMgaXMgb25seSB0ZXN0ZWQgZm9yXG5ib29sZWFuIHZhbHVlcywgYnV0IGl0IF9zaG91bGRfIHdvcmsgZm9yIG90aGVyIHZhbHVlcy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGRpc3BsYXlOYW1lOiBwbHVnaW4ubmFtZSxcblxuICAgIG1peGluczogW3BsdWdpbi5yZXF1aXJlKCdtaXhpbi5maWVsZCcpXSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgdmFyIGNob2ljZVZhbHVlID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xuICAgICAgdmFyIGNob2ljZVR5cGUgPSBjaG9pY2VWYWx1ZS5zdWJzdHJpbmcoMCwgY2hvaWNlVmFsdWUuaW5kZXhPZignOicpKTtcbiAgICAgIGlmIChjaG9pY2VUeXBlID09PSAnY2hvaWNlJykge1xuICAgICAgICB2YXIgY2hvaWNlSW5kZXggPSBjaG9pY2VWYWx1ZS5zdWJzdHJpbmcoY2hvaWNlVmFsdWUuaW5kZXhPZignOicpICsgMSk7XG4gICAgICAgIGNob2ljZUluZGV4ID0gcGFyc2VJbnQoY2hvaWNlSW5kZXgpO1xuICAgICAgICB0aGlzLnByb3BzLmZpZWxkLnZhbCh0aGlzLnByb3BzLmZpZWxkLmRlZi5jaG9pY2VzW2Nob2ljZUluZGV4XS52YWx1ZSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuICAgICAgdmFyIGNob2ljZXMgPSBmaWVsZC5kZWYuY2hvaWNlcyB8fCBbXTtcblxuICAgICAgdmFyIGNob2ljZXNPckxvYWRpbmc7XG5cbiAgICAgIGlmIChjaG9pY2VzLmxlbmd0aCA9PT0gMSAmJiBjaG9pY2VzWzBdLnZhbHVlID09PSAnLy8vbG9hZGluZy8vLycpIHtcbiAgICAgICAgY2hvaWNlc09yTG9hZGluZyA9IFIuZGl2KHt9LFxuICAgICAgICAgICdMb2FkaW5nIGNob2ljZXMuLi4nXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuXG4gICAgICAgIHZhciB2YWx1ZSA9IGZpZWxkLnZhbHVlICE9PSB1bmRlZmluZWQgPyBmaWVsZC52YWx1ZSA6ICcnO1xuXG4gICAgICAgIGNob2ljZXMgPSBjaG9pY2VzLm1hcChmdW5jdGlvbiAoY2hvaWNlLCBpKSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNob2ljZVZhbHVlOiAnY2hvaWNlOicgKyBpLFxuICAgICAgICAgICAgdmFsdWU6IGNob2ljZS52YWx1ZSxcbiAgICAgICAgICAgIGxhYmVsOiBjaG9pY2UubGFiZWxcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgdmFsdWVDaG9pY2UgPSBfLmZpbmQoY2hvaWNlcywgZnVuY3Rpb24gKGNob2ljZSkge1xuICAgICAgICAgIHJldHVybiBjaG9pY2UudmFsdWUgPT09IHZhbHVlO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAodmFsdWVDaG9pY2UgPT09IHVuZGVmaW5lZCkge1xuXG4gICAgICAgICAgdmFyIGxhYmVsID0gdmFsdWU7XG4gICAgICAgICAgaWYgKCFfLmlzU3RyaW5nKHZhbHVlKSkge1xuICAgICAgICAgICAgbGFiZWwgPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhbHVlQ2hvaWNlID0ge1xuICAgICAgICAgICAgY2hvaWNlVmFsdWU6ICd2YWx1ZTonLFxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgbGFiZWw6IGxhYmVsXG4gICAgICAgICAgfTtcbiAgICAgICAgICBjaG9pY2VzID0gW3ZhbHVlQ2hvaWNlXS5jb25jYXQoY2hvaWNlcyk7XG4gICAgICAgIH1cblxuICAgICAgICBjaG9pY2VzT3JMb2FkaW5nID0gUi5zZWxlY3Qoe1xuICAgICAgICAgIGNsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWUsXG4gICAgICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsXG4gICAgICAgICAgdmFsdWU6IHZhbHVlQ2hvaWNlLmNob2ljZVZhbHVlXG4gICAgICAgIH0sXG4gICAgICAgICAgY2hvaWNlcy5tYXAoZnVuY3Rpb24gKGNob2ljZSwgaSkge1xuICAgICAgICAgICAgcmV0dXJuIFIub3B0aW9uKHtcbiAgICAgICAgICAgICAga2V5OiBpLFxuICAgICAgICAgICAgICB2YWx1ZTogY2hvaWNlLmNob2ljZVZhbHVlXG4gICAgICAgICAgICB9LCBjaG9pY2UubGFiZWwpO1xuICAgICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHBsdWdpbi5jb21wb25lbnQoJ2ZpZWxkJykoe1xuICAgICAgICBmaWVsZDogZmllbGRcbiAgICAgIH0sIGNob2ljZXNPckxvYWRpbmcpO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC50ZXh0XG5cbi8qXG5KdXN0IGEgc2ltcGxlIHRleHQgaW5wdXQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZGlzcGxheU5hbWU6IHBsdWdpbi5uYW1lLFxuXG4gICAgbWl4aW5zOiBbcGx1Z2luLnJlcXVpcmUoJ21peGluLmZpZWxkJyldLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICB2YXIgbmV3VmFsdWUgPSBldmVudC50YXJnZXQudmFsdWU7XG4gICAgICB0aGlzLnByb3BzLmZpZWxkLnZhbChuZXdWYWx1ZSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgICByZXR1cm4gcGx1Z2luLmNvbXBvbmVudCgnZmllbGQnKSh7XG4gICAgICAgIGZpZWxkOiBmaWVsZFxuICAgICAgfSwgUi5pbnB1dCh7XG4gICAgICAgIGNsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWUsXG4gICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgdmFsdWU6IGZpZWxkLnZhbHVlLFxuICAgICAgICByb3dzOiBmaWVsZC5kZWYucm93cyxcbiAgICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2VcbiAgICAgIH0pKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQudGV4dGFyZWFcblxuLypcbkp1c3QgYSBzaW1wbGUgbXVsdGktcm93IHRleHRhcmVhLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGRpc3BsYXlOYW1lOiBwbHVnaW4ubmFtZSxcblxuICAgIG1peGluczogW3BsdWdpbi5yZXF1aXJlKCdtaXhpbi5maWVsZCcpXSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZSxcbiAgICAgICAgcm93czogcGx1Z2luLmNvbmZpZy5yb3dzIHx8IDVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIHZhciBuZXdWYWx1ZSA9IGV2ZW50LnRhcmdldC52YWx1ZTtcbiAgICAgIHRoaXMucHJvcHMuZmllbGQudmFsKG5ld1ZhbHVlKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICAgIHJldHVybiBwbHVnaW4uY29tcG9uZW50KCdmaWVsZCcpKHtcbiAgICAgICAgZmllbGQ6IGZpZWxkXG4gICAgICB9LCBSLnRleHRhcmVhKHtcbiAgICAgICAgY2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZSxcbiAgICAgICAgdmFsdWU6IGZpZWxkLnZhbHVlLFxuICAgICAgICByb3dzOiBmaWVsZC5kZWYucm93cyB8fCB0aGlzLnByb3BzLnJvd3MsXG4gICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlXG4gICAgICB9KSk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29yZS5maWVsZFxuXG4vKlxuVGhlIGNvcmUgZmllbGQgcGx1Z2luIHByb3ZpZGVzIHRoZSBGaWVsZCBwcm90b3R5cGUuIEZpZWxkcyByZXByZXNlbnQgYVxucGFydGljdWxhciBzdGF0ZSBpbiB0aW1lIG9mIGEgZmllbGQgZGVmaW5pdGlvbiwgYW5kIHRoZXkgcHJvdmlkZSBoZWxwZXIgbWV0aG9kc1xudG8gbm90aWZ5IHRoZSBmb3JtIHN0b3JlIG9mIGNoYW5nZXMuXG5cbkZpZWxkcyBhcmUgbGF6aWx5IGNyZWF0ZWQgYW5kIGV2YWx1YXRlZCwgYnV0IG9uY2UgZXZhbHVhdGVkLCB0aGV5IHNob3VsZCBiZVxuY29uc2lkZXJlZCBpbW11dGFibGUuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICB2YXIgcm91dGVyID0gcGx1Z2luLnJlcXVpcmUoJ2ZpZWxkLXJvdXRlcicpO1xuICB2YXIgdXRpbCA9IHBsdWdpbi5yZXF1aXJlKCd1dGlsJyk7XG4gIHZhciBldmFsdWF0b3IgPSBwbHVnaW4ucmVxdWlyZSgnZXZhbCcpO1xuICB2YXIgY29tcGlsZXIgPSBwbHVnaW4ucmVxdWlyZSgnY29tcGlsZXInKTtcblxuICAvLyBUaGUgRmllbGQgY29uc3RydWN0b3IuXG4gIHZhciBGaWVsZCA9IGZ1bmN0aW9uIChmb3JtLCBkZWYsIHZhbHVlLCBwYXJlbnQpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzO1xuXG4gICAgZmllbGQuZm9ybSA9IGZvcm07XG4gICAgZmllbGQuZGVmID0gZGVmO1xuICAgIGZpZWxkLnZhbHVlID0gdmFsdWU7XG4gICAgZmllbGQucGFyZW50ID0gcGFyZW50O1xuICAgIGZpZWxkLmdyb3VwcyA9IHt9O1xuICAgIGZpZWxkLnRlbXBDaGlsZHJlbiA9IFtdO1xuICB9O1xuXG4gIC8vIEF0dGFjaCBhIGZpZWxkIGZhY3RvcnkgdG8gdGhlIGZvcm0gcHJvdG90eXBlLlxuICBwbHVnaW4uZXhwb3J0cy5maWVsZCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZm9ybSA9IHRoaXM7XG5cbiAgICByZXR1cm4gbmV3IEZpZWxkKGZvcm0sIHtcbiAgICAgIHR5cGU6ICdyb290J1xuICAgIH0sIGZvcm0uc3RvcmUudmFsdWUpO1xuICB9O1xuXG4gIHZhciBwcm90byA9IEZpZWxkLnByb3RvdHlwZTtcblxuICAvLyBSZXR1cm4gdGhlIHR5cGUgcGx1Z2luIGZvciB0aGlzIGZpZWxkLlxuICBwcm90by50eXBlUGx1Z2luID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBmaWVsZCA9IHRoaXM7XG5cbiAgICBpZiAoIWZpZWxkLl90eXBlUGx1Z2luKSB7XG4gICAgICBmaWVsZC5fdHlwZVBsdWdpbiA9IHBsdWdpbi5yZXF1aXJlKCd0eXBlLicgKyBmaWVsZC5kZWYudHlwZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZpZWxkLl90eXBlUGx1Z2luO1xuICB9O1xuXG4gIC8vIEdldCBhIGNvbXBvbmVudCBmb3IgdGhpcyBmaWVsZC5cbiAgcHJvdG8uY29tcG9uZW50ID0gZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgdmFyIGZpZWxkID0gdGhpcztcbiAgICBwcm9wcyA9IF8uZXh0ZW5kKHt9LCBwcm9wcywge2ZpZWxkOiBmaWVsZH0pO1xuICAgIHZhciBjb21wb25lbnQgPSByb3V0ZXIuY29tcG9uZW50Rm9yRmllbGQoZmllbGQpO1xuICAgIHJldHVybiBjb21wb25lbnQocHJvcHMpO1xuICB9O1xuXG4gIC8vIEdldCB0aGUgY2hpbGQgZmllbGRzIGZvciB0aGlzIGZpZWxkLlxuICBwcm90by5maWVsZHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGZpZWxkID0gdGhpcztcblxuICAgIGlmICghZmllbGQuX2ZpZWxkcykge1xuICAgICAgdmFyIGZpZWxkcztcbiAgICAgIGlmIChmaWVsZC50eXBlUGx1Z2luKCkuZmllbGRzKSB7XG4gICAgICAgIGZpZWxkcyA9IGZpZWxkLnR5cGVQbHVnaW4oKS5maWVsZHMoZmllbGQpO1xuICAgICAgfSBlbHNlIGlmIChmaWVsZC5kZWYuZmllbGRzKSB7XG4gICAgICAgIGZpZWxkcyA9IGZpZWxkLmRlZi5maWVsZHMubWFwKGZ1bmN0aW9uIChkZWYpIHtcbiAgICAgICAgICByZXR1cm4gZmllbGQuY3JlYXRlQ2hpbGQoZGVmKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmaWVsZHMgPSBbXTtcbiAgICAgIH1cbiAgICAgIGZpZWxkLl9maWVsZHMgPSBmaWVsZHM7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZpZWxkLl9maWVsZHM7XG4gIH07XG5cbiAgLy8gR2V0IHRoZSBpdGVtcyAoY2hpbGQgZmllbGQgZGVmaW5pdGlvbnMpIGZvciB0aGlzIGZpZWxkLlxuICBwcm90by5pdGVtcyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzO1xuXG4gICAgaWYgKCFmaWVsZC5faXRlbXMpIHtcbiAgICAgIGlmIChfLmlzQXJyYXkoZmllbGQuZGVmLml0ZW1zKSkge1xuICAgICAgICBmaWVsZC5faXRlbXMgPSBmaWVsZC5kZWYuaXRlbXMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgcmV0dXJuIGZpZWxkLnJlc29sdmUoaXRlbSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZmllbGQuX2l0ZW1zID0gW107XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZpZWxkLl9pdGVtcztcbiAgfTtcblxuICAvLyBSZXNvbHZlIGEgZmllbGQgcmVmZXJlbmNlIGlmIG5lY2Vzc2FyeS5cbiAgcHJvdG8ucmVzb2x2ZSA9IGZ1bmN0aW9uIChkZWYpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzO1xuXG4gICAgaWYgKF8uaXNTdHJpbmcoZGVmKSkge1xuICAgICAgZGVmID0gZmllbGQuZm9ybS5maW5kRGVmKGRlZik7XG4gICAgICBpZiAoIWRlZikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBmaW5kIGZpZWxkOiAnICsgZGVmKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGVmO1xuICB9O1xuXG4gIC8vIEV2YWx1YXRlIGEgZmllbGQgZGVmaW5pdGlvbiBhbmQgcmV0dXJuIGEgbmV3IGZpZWxkIGRlZmluaXRpb24uXG4gIHByb3RvLmV2YWxEZWYgPSBmdW5jdGlvbiAoZGVmKSB7XG4gICAgdmFyIGZpZWxkID0gdGhpcztcblxuICAgIGlmIChkZWYuZXZhbCkge1xuXG4gICAgICB0cnkge1xuICAgICAgICB2YXIgZXh0RGVmID0gZmllbGQuZXZhbChkZWYuZXZhbCk7XG4gICAgICAgIGlmIChleHREZWYpIHtcbiAgICAgICAgICBkZWYgPSBfLmV4dGVuZCh7fSwgZGVmLCBleHREZWYpO1xuICAgICAgICAgIGlmIChkZWYuZmllbGRzKSB7XG4gICAgICAgICAgICBkZWYuZmllbGRzID0gZGVmLmZpZWxkcy5tYXAoZnVuY3Rpb24gKGNoaWxkRGVmKSB7XG4gICAgICAgICAgICAgIGNoaWxkRGVmID0gY29tcGlsZXIuZXhwYW5kRGVmKGNoaWxkRGVmLCBmaWVsZC5mb3JtLnN0b3JlLnRlbXBsYXRlTWFwKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGNvbXBpbGVyLmNvbXBpbGVEZWYoY2hpbGREZWYpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGRlZiA9IGNvbXBpbGVyLmNvbXBpbGVEZWYoZGVmKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmxvZygnUHJvYmxlbSBpbiBldmFsOiAnLCBKU09OLnN0cmluZ2lmeShkZWYuZXZhbCkpO1xuICAgICAgICBjb25zb2xlLmxvZyhlLm1lc3NhZ2UpO1xuICAgICAgICBjb25zb2xlLmxvZyhlLnN0YWNrKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGVmO1xuICB9O1xuXG4gIC8vIEV2YWx1YXRlIGFuIGV4cHJlc3Npb24gaW4gdGhlIGNvbnRleHQgb2YgYSBmaWVsZC5cbiAgcHJvdG8uZXZhbCA9IGZ1bmN0aW9uIChleHByZXNzaW9uLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIGV2YWx1YXRvci5ldmFsdWF0ZShleHByZXNzaW9uLCB0aGlzLCBjb250ZXh0KTtcbiAgfTtcblxuICAvLyBDcmVhdGUgYSBjaGlsZCBmaWVsZCBmcm9tIGEgZGVmaW5pdGlvbi5cbiAgcHJvdG8uY3JlYXRlQ2hpbGQgPSBmdW5jdGlvbiAoZGVmKSB7XG4gICAgdmFyIGZpZWxkID0gdGhpcztcblxuICAgIGRlZiA9IGZpZWxkLnJlc29sdmUoZGVmKTtcblxuICAgIHZhciB2YWx1ZSA9IGZpZWxkLnZhbHVlO1xuXG4gICAgZGVmID0gZmllbGQuZXZhbERlZihkZWYpO1xuXG4gICAgaWYgKCF1dGlsLmlzQmxhbmsoZGVmLmtleSkpIHtcbiAgICAgIGlmICh2YWx1ZSAmJiAhXy5pc1VuZGVmaW5lZCh2YWx1ZVtkZWYua2V5XSkpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZVtkZWYua2V5XTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSA9IGRlZi52YWx1ZTtcbiAgICB9XG5cbiAgICB2YXIgY2hpbGRGaWVsZCA9IG5ldyBGaWVsZChmaWVsZC5mb3JtLCBkZWYsIHZhbHVlLCBmaWVsZCk7XG5cbiAgICBmaWVsZC50ZW1wQ2hpbGRyZW4ucHVzaChjaGlsZEZpZWxkKTtcblxuICAgIHJldHVybiBjaGlsZEZpZWxkO1xuXG4gICAgLy8gaWYgKGRlZi5ldmFsKSB7XG4gICAgLy8gICBkZWYgPSBjaGlsZEZpZWxkLmV2YWxEZWYoZGVmKTtcbiAgICAvLyAgIGlmICh1dGlsLmlzQmxhbmsoZGVmLmtleSkpIHtcbiAgICAvLyAgICAgdmFsdWUgPSBkZWYudmFsdWU7XG4gICAgLy8gICB9XG4gICAgLy8gICBjaGlsZEZpZWxkID0gbmV3IEZpZWxkKGZpZWxkLmZvcm0sIGRlZiwgdmFsdWUsIGZpZWxkKTtcbiAgICAvLyB9XG4gICAgLy9cbiAgICAvLyByZXR1cm4gY2hpbGRGaWVsZDtcbiAgfTtcblxuICAvLyBHaXZlbiBhIHZhbHVlLCBmaW5kIGFuIGFwcHJvcHJpYXRlIGZpZWxkIGRlZmluaXRpb24gZm9yIHRoaXMgZmllbGQuXG4gIHByb3RvLml0ZW1Gb3JWYWx1ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHZhciBmaWVsZCA9IHRoaXM7XG5cbiAgICB2YXIgaXRlbSA9IF8uZmluZChmaWVsZC5pdGVtcygpLCBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgcmV0dXJuIHV0aWwuaXRlbU1hdGNoZXNWYWx1ZShpdGVtLCB2YWx1ZSk7XG4gICAgfSk7XG4gICAgaWYgKGl0ZW0pIHtcbiAgICAgIGl0ZW0gPSBfLmV4dGVuZCh7fSwgaXRlbSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGl0ZW0gPSB1dGlsLmZpZWxkRGVmRnJvbVZhbHVlKHZhbHVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gaXRlbTtcbiAgfTtcblxuICAvLyBHZXQgYWxsIHRoZSBmaWVsZHMgYmVsb25naW5nIHRvIGEgZ3JvdXAuXG4gIHByb3RvLmdyb3VwRmllbGRzID0gZnVuY3Rpb24gKGdyb3VwTmFtZSwgaWdub3JlVGVtcENoaWxkcmVuKSB7XG4gICAgdmFyIGZpZWxkID0gdGhpcztcblxuICAgIGlmICghZmllbGQuZ3JvdXBzW2dyb3VwTmFtZV0pIHtcbiAgICAgIGZpZWxkLmdyb3Vwc1tncm91cE5hbWVdID0gW107XG5cbiAgICAgIGlmIChmaWVsZC5wYXJlbnQpIHtcbiAgICAgICAgdmFyIHNpYmxpbmdzID0gZmllbGQucGFyZW50LmZpZWxkcygpO1xuICAgICAgICBzaWJsaW5ncy5mb3JFYWNoKGZ1bmN0aW9uIChzaWJsaW5nKSB7XG4gICAgICAgICAgaWYgKHNpYmxpbmcgIT09IGZpZWxkICYmIHNpYmxpbmcuZGVmLmdyb3VwID09PSBncm91cE5hbWUpIHtcbiAgICAgICAgICAgIGZpZWxkLmdyb3Vwc1tncm91cE5hbWVdLnB1c2goc2libGluZyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdmFyIHBhcmVudEdyb3VwRmllbGRzID0gZmllbGQucGFyZW50Lmdyb3VwRmllbGRzKGdyb3VwTmFtZSwgdHJ1ZSk7XG4gICAgICAgIGZpZWxkLmdyb3Vwc1tncm91cE5hbWVdID0gZmllbGQuZ3JvdXBzW2dyb3VwTmFtZV0uY29uY2F0KHBhcmVudEdyb3VwRmllbGRzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWlnbm9yZVRlbXBDaGlsZHJlbiAmJiBmaWVsZC5ncm91cHNbZ3JvdXBOYW1lXS5sZW5ndGggPT09IDApIHtcbiAgICAgIC8vIGxvb2tpbmcgYXQgY2hpbGRyZW4gc28gZmFyXG4gICAgICB2YXIgY2hpbGRHcm91cEZpZWxkcyA9IFtdO1xuICAgICAgZmllbGQudGVtcENoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24gKGNoaWxkKSB7XG4gICAgICAgIGlmIChjaGlsZC5kZWYuZ3JvdXAgPT09IGdyb3VwTmFtZSkge1xuICAgICAgICAgIGNoaWxkR3JvdXBGaWVsZHMucHVzaChjaGlsZCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGNoaWxkR3JvdXBGaWVsZHM7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZpZWxkLmdyb3Vwc1tncm91cE5hbWVdO1xuICB9O1xuXG4gIC8vIFdhbGsgYmFja3dhcmRzIHRocm91Z2ggcGFyZW50cyBhbmQgYnVpbGQgb3V0IGEgcGF0aCBhcnJheSB0byB0aGUgdmFsdWUuXG4gIHByb3RvLnZhbHVlUGF0aCA9IGZ1bmN0aW9uIChjaGlsZFBhdGgpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzO1xuXG4gICAgdmFyIHBhdGggPSBjaGlsZFBhdGggfHwgW107XG4gICAgaWYgKCF1dGlsLmlzQmxhbmsoZmllbGQuZGVmLmtleSkpIHtcbiAgICAgIHBhdGggPSBbZmllbGQuZGVmLmtleV0uY29uY2F0KHBhdGgpO1xuICAgIH1cbiAgICBpZiAoZmllbGQucGFyZW50KSB7XG4gICAgICByZXR1cm4gZmllbGQucGFyZW50LnZhbHVlUGF0aChwYXRoKTtcbiAgICB9XG4gICAgcmV0dXJuIHBhdGg7XG4gIH07XG5cbiAgLy8gU2V0IHRoZSB2YWx1ZSBmb3IgdGhpcyBmaWVsZC5cbiAgcHJvdG8udmFsID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFyIGZpZWxkID0gdGhpcztcblxuICAgIGZpZWxkLmZvcm0uYWN0aW9ucy5zZXRWYWx1ZShmaWVsZC52YWx1ZVBhdGgoKSwgdmFsdWUpO1xuICB9O1xuXG4gIC8vIFJlbW92ZSBhIGNoaWxkIHZhbHVlIGZyb20gdGhpcyBmaWVsZC5cbiAgcHJvdG8ucmVtb3ZlID0gZnVuY3Rpb24gKGtleSkge1xuICAgIHZhciBmaWVsZCA9IHRoaXM7XG5cbiAgICB2YXIgcGF0aCA9IGZpZWxkLnZhbHVlUGF0aCgpLmNvbmNhdChrZXkpO1xuXG4gICAgZmllbGQuZm9ybS5hY3Rpb25zLnJlbW92ZVZhbHVlKHBhdGgpO1xuICB9O1xuXG4gIC8vIE1vdmUgYSBjaGlsZCB2YWx1ZSBmcm9tIG9uZSBrZXkgdG8gYW5vdGhlci5cbiAgcHJvdG8ubW92ZSA9IGZ1bmN0aW9uIChmcm9tS2V5LCB0b0tleSkge1xuICAgIHZhciBmaWVsZCA9IHRoaXM7XG5cbiAgICBmaWVsZC5mb3JtLmFjdGlvbnMubW92ZVZhbHVlKGZpZWxkLnZhbHVlUGF0aCgpLCBmcm9tS2V5LCB0b0tleSk7XG4gIH07XG5cbiAgLy8gR2V0IHRoZSBkZWZhdWx0IHZhbHVlIGZvciB0aGlzIGZpZWxkLlxuICBwcm90by5kZWZhdWx0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBmaWVsZCA9IHRoaXM7XG5cbiAgICBpZiAoIV8uaXNVbmRlZmluZWQoZmllbGQuZGVmLnZhbHVlKSkge1xuICAgICAgcmV0dXJuIHV0aWwuY29weVZhbHVlKGZpZWxkLmRlZi52YWx1ZSk7XG4gICAgfVxuXG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKGZpZWxkLmRlZi5kZWZhdWx0KSkge1xuICAgICAgcmV0dXJuIHV0aWwuY29weVZhbHVlKGZpZWxkLmRlZi5kZWZhdWx0KTtcbiAgICB9XG5cbiAgICBpZiAoIV8uaXNVbmRlZmluZWQoZmllbGQudHlwZVBsdWdpbigpLmRlZmF1bHQpKSB7XG4gICAgICByZXR1cm4gdXRpbC5jb3B5VmFsdWUoZmllbGQudHlwZVBsdWdpbigpLmRlZmF1bHQpO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9O1xuXG4gIC8vIEFwcGVuZCBhIG5ldyB2YWx1ZS4gVXNlIHRoZSBgaXRlbUluZGV4YCB0byBnZXQgYW4gYXBwcm9wcmlhdGVcbiAgLy8gaXRlbSwgaW5mbGF0ZSBpdCwgYW5kIGNyZWF0ZSBhIGRlZmF1bHQgdmFsdWUuXG4gIHByb3RvLmFwcGVuZCA9IGZ1bmN0aW9uIChpdGVtSW5kZXgpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzO1xuXG4gICAgdmFyIGl0ZW0gPSBmaWVsZC5pdGVtcygpW2l0ZW1JbmRleF07XG4gICAgaXRlbSA9IF8uZXh0ZW5kKGl0ZW0pO1xuXG4gICAgaXRlbS5rZXkgPSBmaWVsZC52YWx1ZS5sZW5ndGg7XG5cbiAgICB2YXIgY2hpbGQgPSBmaWVsZC5jcmVhdGVDaGlsZChpdGVtKTtcblxuICAgIHZhciBvYmogPSBjaGlsZC5kZWZhdWx0KCk7XG5cbiAgICBpZiAoXy5pc0FycmF5KG9iaikgfHwgXy5pc09iamVjdChvYmopKSB7XG4gICAgICB2YXIgY2hvcCA9IGZpZWxkLnZhbHVlUGF0aCgpLmxlbmd0aCArIDE7XG5cbiAgICAgIGNoaWxkLmluZmxhdGUoZnVuY3Rpb24gKHBhdGgsIHZhbHVlKSB7XG4gICAgICAgIG9iaiA9IHV0aWwuc2V0SW4ob2JqLCBwYXRoLnNsaWNlKGNob3ApLCB2YWx1ZSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBmaWVsZC5mb3JtLmFjdGlvbnMuYXBwZW5kVmFsdWUoZmllbGQudmFsdWVQYXRoKCksIG9iaik7XG4gIH07XG5cbiAgLy8gRGV0ZXJtaW5lIHdoZXRoZXIgdGhlIGZpZWxkIGlzIGhpZGRlbi5cbiAgcHJvdG8uaGlkZGVuID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBmaWVsZCA9IHRoaXM7XG5cbiAgICByZXR1cm4gZmllbGQuZGVmLmhpZGRlbiB8fCBmaWVsZC50eXBlUGx1Z2luKCkuaGlkZGVuO1xuICB9O1xuXG4gIC8vIEV4cGFuZCBhbGwgY2hpbGQgZmllbGRzIGFuZCBjYWxsIHRoZSBzZXR0ZXIgZnVuY3Rpb24gd2l0aCB0aGUgZGVmYXVsdFxuICAvLyB2YWx1ZXMgYXQgZWFjaCBwYXRoLlxuICBwcm90by5pbmZsYXRlID0gZnVuY3Rpb24gKG9uU2V0VmFsdWUpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzO1xuXG4gICAgaWYgKCF1dGlsLmlzQmxhbmsoZmllbGQuZGVmLmtleSkgJiYgXy5pc1VuZGVmaW5lZChmaWVsZC52YWx1ZSkpIHtcbiAgICAgIG9uU2V0VmFsdWUoZmllbGQudmFsdWVQYXRoKCksIGZpZWxkLmRlZmF1bHQoKSk7XG4gICAgfVxuXG4gICAgdmFyIGZpZWxkcyA9IGZpZWxkLmZpZWxkcygpO1xuXG4gICAgZmllbGRzLmZvckVhY2goZnVuY3Rpb24gKGNoaWxkKSB7XG4gICAgICBjaGlsZC5pbmZsYXRlKG9uU2V0VmFsdWUpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIENhbGxlZCBmcm9tIHVubW91bnQuIFdoZW4gZmllbGRzIGFyZSByZW1vdmVkIGZvciB3aGF0ZXZlciByZWFzb24sIHdlXG4gIC8vIHNob3VsZCBkZWxldGUgdGhlIGNvcnJlc3BvbmRpbmcgdmFsdWUuXG4gIHByb3RvLmVyYXNlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBmaWVsZCA9IHRoaXM7XG4gICAgaWYgKCF1dGlsLmlzQmxhbmsoZmllbGQuZGVmLmtleSkgJiYgIV8uaXNVbmRlZmluZWQoZmllbGQudmFsdWUpKSB7XG4gICAgICBmaWVsZC5mb3JtLmFjdGlvbnMuZXJhc2VWYWx1ZShmaWVsZC52YWx1ZVBhdGgoKSwge30pO1xuICAgIH1cbiAgfTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIi8vICMgY29yZS5mb3JtLWluaXRcblxuLypcblRoaXMgcGx1Z2luIG1ha2VzIGl0IGVhc3kgdG8gaG9vayBpbnRvIGZvcm0gaW5pdGlhbGl6YXRpb24sIHdpdGhvdXQgaGF2aW5nIHRvXG5jb25maWd1cmUgYWxsIHRoZSBvdGhlciBjb3JlIHBsdWdpbnMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHZhciBpbml0UGx1Z2lucyA9IHBsdWdpbi5yZXF1aXJlQWxsKHBsdWdpbi5jb25maWcuaW5pdCk7XG5cbiAgdmFyIHByb3RvID0gcGx1Z2luLmV4cG9ydHM7XG5cbiAgcHJvdG8uaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZm9ybSA9IHRoaXM7XG5cbiAgICBpbml0UGx1Z2lucy5mb3JFYWNoKGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICAgIHBsdWdpbi5hcHBseShmb3JtLCBhcmd1bWVudHMpO1xuICAgIH0pO1xuICB9O1xufTtcbiIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29yZS5mb3JtXG5cbi8qXG5UaGUgY29yZSBmb3JtIHBsdWdpbiBzdXBwbGllcyBtZXRob2RzIHRoYXQgZ2V0IGFkZGVkIHRvIHRoZSBGb3JtIHByb3RvdHlwZS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG52YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRlbWl0dGVyMycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICB2YXIgcHJvdG8gPSBwbHVnaW4uZXhwb3J0cztcblxuICAvLyBHZXQgdGhlIHN0b3JlIHBsdWdpbi5cbiAgdmFyIGNyZWF0ZVN0b3JlID0gcGx1Z2luLnJlcXVpcmUocGx1Z2luLmNvbmZpZy5zdG9yZSk7XG5cbiAgdmFyIHV0aWwgPSBwbHVnaW4ucmVxdWlyZSgndXRpbCcpO1xuICB2YXIgbG9hZGVyID0gcGx1Z2luLnJlcXVpcmUoJ2xvYWRlcicpO1xuXG4gIC8vIEhlbHBlciB0byBjcmVhdGUgYWN0aW9ucywgd2hpY2ggd2lsbCB0ZWxsIHRoZSBzdG9yZSB0aGF0IHNvbWV0aGluZyBoYXNcbiAgLy8gaGFwcGVuZWQuIE5vdGUgdGhhdCBhY3Rpb25zIGdvIHN0cmFpZ2h0IHRvIHRoZSBzdG9yZS4gTm8gZXZlbnRzLFxuICAvLyBkaXNwYXRjaGVyLCBldGMuXG4gIHZhciBjcmVhdGVTeW5jQWN0aW9ucyA9IGZ1bmN0aW9uIChzdG9yZSwgbmFtZXMpIHtcbiAgICB2YXIgYWN0aW9ucyA9IHt9O1xuICAgIG5hbWVzLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgIGFjdGlvbnNbbmFtZV0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHN0b3JlW25hbWVdLmFwcGx5KHN0b3JlLCBhcmd1bWVudHMpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgICByZXR1cm4gYWN0aW9ucztcbiAgfTtcblxuICAvLyBJbml0aWFsaXplIHRoZSBmb3JtIGluc3RhbmNlLlxuICBwcm90by5pbml0ID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICB2YXIgZm9ybSA9IHRoaXM7XG5cbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIC8vIE5lZWQgYW4gZW1pdHRlciB0byBlbWl0IGNoYW5nZSBldmVudHMgZnJvbSB0aGUgc3RvcmUuXG4gICAgdmFyIHN0b3JlRW1pdHRlciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAgIC8vIENyZWF0ZSBhIHN0b3JlLlxuICAgIGZvcm0uc3RvcmUgPSBjcmVhdGVTdG9yZShmb3JtLCBzdG9yZUVtaXR0ZXIsIG9wdGlvbnMpO1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBhY3Rpb25zIHRvIG5vdGlmeSB0aGUgc3RvcmUgb2YgY2hhbmdlcy5cbiAgICBmb3JtLmFjdGlvbnMgPSBjcmVhdGVTeW5jQWN0aW9ucyhmb3JtLnN0b3JlLCBbJ3NldFZhbHVlJywgJ3NldEZpZWxkcycsICdyZW1vdmVWYWx1ZScsICdhcHBlbmRWYWx1ZScsICdtb3ZlVmFsdWUnLCAnZXJhc2VWYWx1ZScsICdzZXRNZXRhJ10pO1xuXG4gICAgLy8gU2VlZCB0aGUgdmFsdWUgZnJvbSBhbnkgZmllbGRzLlxuICAgIGZvcm0uc3RvcmUuaW5mbGF0ZSgpO1xuXG4gICAgLy8gQWRkIG9uL29mZiB0byBnZXQgY2hhbmdlIGV2ZW50cyBmcm9tIGZvcm0uXG4gICAgZm9ybS5vbiA9IHN0b3JlRW1pdHRlci5vbi5iaW5kKHN0b3JlRW1pdHRlcik7XG4gICAgZm9ybS5vZmYgPSBzdG9yZUVtaXR0ZXIub2ZmLmJpbmQoc3RvcmVFbWl0dGVyKTtcbiAgICBmb3JtLm9uY2UgPSBzdG9yZUVtaXR0ZXIub25jZS5iaW5kKHN0b3JlRW1pdHRlcik7XG4gIH07XG5cbiAgLy8gR2V0IHRoZSByb290IGNvbXBvbmVudCBmb3IgYSBmb3JtLlxuICBwcm90by5jb21wb25lbnQgPSBmdW5jdGlvbiAocHJvcHMpIHtcblxuICAgIHZhciBmb3JtID0gdGhpcztcblxuICAgIHByb3BzID0gXy5leHRlbmQoe30sIHByb3BzLCB7XG4gICAgICBmb3JtOiBmb3JtXG4gICAgfSk7XG5cbiAgICB2YXIgY29tcG9uZW50ID0gcGx1Z2luLmNvbXBvbmVudCgnZm9ybWF0aWMnKTtcblxuICAgIHJldHVybiBjb21wb25lbnQocHJvcHMpO1xuICB9O1xuXG4gIC8vIEdldCBvciBzZXQgdGhlIHZhbHVlIG9mIGEgZm9ybS5cbiAgcHJvdG8udmFsID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFyIGZvcm0gPSB0aGlzO1xuXG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGZvcm0uYWN0aW9ucy5zZXRWYWx1ZSh2YWx1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHV0aWwuY29weVZhbHVlKGZvcm0uc3RvcmUudmFsdWUpO1xuICB9O1xuXG4gIC8vIFNldC9jaGFuZ2UgdGhlIGZpZWxkcyBmb3IgYSBmb3JtLlxuICBwcm90by5maWVsZHMgPSBmdW5jdGlvbiAoZmllbGRzKSB7XG4gICAgdmFyIGZvcm0gPSB0aGlzO1xuXG4gICAgZm9ybS5hY3Rpb25zLnNldEZpZWxkcyhmaWVsZHMpO1xuICB9O1xuXG4gIC8vIEZpbmQgYSBmaWVsZCB0ZW1wbGF0ZSBnaXZlbiBhIGtleS5cbiAgcHJvdG8uZmluZERlZiA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICB2YXIgZm9ybSA9IHRoaXM7XG5cbiAgICByZXR1cm4gZm9ybS5zdG9yZS50ZW1wbGF0ZU1hcFtrZXldIHx8IG51bGw7XG4gIH07XG5cbiAgLy8gR2V0IG9yIHNldCBtZXRhZGF0YS5cbiAgcHJvdG8ubWV0YSA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgdmFyIGZvcm0gPSB0aGlzO1xuXG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGZvcm0uYWN0aW9ucy5zZXRNZXRhKGtleSwgdmFsdWUpO1xuICAgIH1cblxuICAgIHJldHVybiBmb3JtLnN0b3JlLm1ldGFba2V5XTtcbiAgfTtcblxuICAvLyBMb2FkIG1ldGFkYXRhLlxuICBwcm90by5sb2FkTWV0YSA9IGZ1bmN0aW9uIChzb3VyY2UsIHBhcmFtcykge1xuICAgIHBhcmFtcyA9IHBhcmFtcyB8fCB7fTtcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHBhcmFtcyk7XG4gICAgdmFyIHZhbGlkS2V5cyA9IGtleXMuZmlsdGVyKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHJldHVybiBwYXJhbXNba2V5XTtcbiAgICB9KTtcbiAgICBpZiAodmFsaWRLZXlzLmxlbmd0aCA8IGtleXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxvYWRlci5sb2FkTWV0YSh0aGlzLCBzb3VyY2UsIHBhcmFtcyk7XG4gIH07XG5cbiAgLy8gQWRkIGEgbWV0ZGF0YSBzb3VyY2UgZnVuY3Rpb24sIHZpYSB0aGUgbG9hZGVyIHBsdWdpbi5cbiAgcHJvdG8uc291cmNlID0gbG9hZGVyLnNvdXJjZTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29yZS5mb3JtYXRpY1xuXG4vKlxuVGhlIGNvcmUgZm9ybWF0aWMgcGx1Z2luIGFkZHMgbWV0aG9kcyB0byB0aGUgZm9ybWF0aWMgaW5zdGFuY2UuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICB2YXIgZiA9IHBsdWdpbi5leHBvcnRzO1xuXG4gIC8vIFVzZSB0aGUgZmllbGQtcm91dGVyIHBsdWdpbiBhcyB0aGUgcm91dGVyLlxuICB2YXIgcm91dGVyID0gcGx1Z2luLnJlcXVpcmUoJ2ZpZWxkLXJvdXRlcicpO1xuXG4gIC8vIFJvdXRlIGEgZmllbGQgdG8gYSBjb21wb25lbnQuXG4gIGYucm91dGUgPSByb3V0ZXIucm91dGU7XG5cbiAgLy8gUmVuZGVyIGEgY29tcG9uZW50IHRvIGEgbm9kZS5cbiAgZi5yZW5kZXIgPSBmdW5jdGlvbiAoY29tcG9uZW50LCBub2RlKSB7XG5cbiAgICBSZWFjdC5yZW5kZXJDb21wb25lbnQoY29tcG9uZW50LCBub2RlKTtcbiAgfTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcGlsZXJcblxuLy8gVGhlIGNvbXBpbGVyIHBsdWdpbiBrbm93cyBob3cgdG8gbm9ybWFsaXplIGZpZWxkIGRlZmluaXRpb25zIGludG8gc3RhbmRhcmRcbi8vIGZpZWxkIGRlZmluaXRpb25zIHRoYXQgY2FuIGJlIHVuZGVyc3Rvb2QgYmUgcm91dGVycyBhbmQgY29tcG9uZW50cy5cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgLy8gR3JhYiBhbGwgdGhlIGNvbXBpbGVyIHBsdWdpbnMgd2hpY2ggY2FuIGJlIHN0YWNrZWQuXG4gIHZhciBjb21waWxlclBsdWdpbnMgPSBwbHVnaW4ucmVxdWlyZUFsbChwbHVnaW4uY29uZmlnLmNvbXBpbGVycyk7XG5cbiAgdmFyIHV0aWwgPSBwbHVnaW4ucmVxdWlyZSgndXRpbCcpO1xuXG4gIHZhciBjb21waWxlciA9IHBsdWdpbi5leHBvcnRzO1xuXG4gIC8vIEZvciBhIHNldCBvZiBmaWVsZHMsIG1ha2UgYSBtYXAgb2YgdGVtcGxhdGUgbmFtZXMgdG8gZmllbGQgZGVmaW5pdGlvbnMuIEFsbFxuICAvLyBmaWVsZCBkZWZpbml0aW9ucyBjYW4gYmUgdXNlZCBhcyB0ZW1wbGF0ZXMsIHdoZXRoZXIgbWFya2VkIGFzIHRlbXBsYXRlcyBvclxuICAvLyBub3QuXG4gIGNvbXBpbGVyLnRlbXBsYXRlTWFwID0gZnVuY3Rpb24gKGZpZWxkcykge1xuICAgIHZhciBtYXAgPSB7fTtcbiAgICBmaWVsZHMuZm9yRWFjaChmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgIGlmIChmaWVsZC5rZXkpIHtcbiAgICAgICAgbWFwW2ZpZWxkLmtleV0gPSBmaWVsZDtcbiAgICAgIH1cbiAgICAgIGlmIChmaWVsZC5pZCkge1xuICAgICAgICBtYXBbZmllbGQuaWRdID0gZmllbGQ7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG1hcDtcbiAgfTtcblxuICAvLyBGaWVsZHMgYW5kIGl0ZW1zIGNhbiBleHRlbmQgb3RoZXIgZmllbGQgZGVmaW5pdGlvbnMuIEZpZWxkcyBjYW4gYWxzbyBoYXZlXG4gIC8vIGNoaWxkIGZpZWxkcyB0aGF0IHBvaW50IHRvIG90aGVyIGZpZWxkIGRlZmluaXRpb25zLiBIZXJlLCB3ZSBleHBhbmQgYWxsXG4gIC8vIHRob3NlIG91dCBzbyB0aGF0IGNvbXBvbmVudHMgZG9uJ3QgaGF2ZSB0byB3b3JyeSBhYm91dCB0aGlzLlxuICBjb21waWxlci5leHBhbmREZWYgPSBmdW5jdGlvbiAoZGVmLCB0ZW1wbGF0ZU1hcCkge1xuICAgIHZhciBpc1RlbXBsYXRlID0gZGVmLnRlbXBsYXRlO1xuICAgIHZhciBleHQgPSBkZWYuZXh0ZW5kcztcbiAgICBpZiAoXy5pc1N0cmluZyhleHQpKSB7XG4gICAgICBleHQgPSBbZXh0XTtcbiAgICB9XG4gICAgaWYgKGV4dCkge1xuICAgICAgdmFyIGJhc2VzID0gZXh0Lm1hcChmdW5jdGlvbiAoYmFzZSkge1xuICAgICAgICB2YXIgdGVtcGxhdGUgPSB0ZW1wbGF0ZU1hcFtiYXNlXTtcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGVtcGxhdGUgJyArIGJhc2UgKyAnIG5vdCBmb3VuZC4nKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGVtcGxhdGU7XG4gICAgICB9KTtcbiAgICAgIHZhciBjaGFpbiA9IFt7fV0uY29uY2F0KGJhc2VzLnJldmVyc2UoKS5jb25jYXQoW2RlZl0pKTtcbiAgICAgIGRlZiA9IF8uZXh0ZW5kLmFwcGx5KF8sIGNoYWluKTtcbiAgICB9XG4gICAgaWYgKGRlZi5maWVsZHMpIHtcbiAgICAgIGRlZi5maWVsZHMgPSBkZWYuZmllbGRzLm1hcChmdW5jdGlvbiAoY2hpbGREZWYpIHtcbiAgICAgICAgaWYgKCFfLmlzU3RyaW5nKGNoaWxkRGVmKSkge1xuICAgICAgICAgIHJldHVybiBjb21waWxlci5leHBhbmREZWYoY2hpbGREZWYsIHRlbXBsYXRlTWFwKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2hpbGREZWY7XG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKGRlZi5pdGVtcykge1xuICAgICAgZGVmLml0ZW1zID0gZGVmLml0ZW1zLm1hcChmdW5jdGlvbiAoaXRlbURlZikge1xuICAgICAgICBpZiAoIV8uaXNTdHJpbmcoaXRlbURlZikpIHtcbiAgICAgICAgICByZXR1cm4gY29tcGlsZXIuZXhwYW5kRGVmKGl0ZW1EZWYsIHRlbXBsYXRlTWFwKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaXRlbURlZjtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoIWlzVGVtcGxhdGUgJiYgZGVmLnRlbXBsYXRlKSB7XG4gICAgICBkZWxldGUgZGVmLnRlbXBsYXRlO1xuICAgIH1cbiAgICByZXR1cm4gZGVmO1xuICB9O1xuXG4gIC8vIEZvciBhbiBhcnJheSBvZiBmaWVsZCBkZWZpbml0aW9ucywgZXhwYW5kIGVhY2ggZmllbGQgZGVmaW5pdGlvbi5cbiAgY29tcGlsZXIuZXhwYW5kRmllbGRzID0gZnVuY3Rpb24gKGZpZWxkcykge1xuICAgIHZhciB0ZW1wbGF0ZU1hcCA9IGNvbXBpbGVyLnRlbXBsYXRlTWFwKGZpZWxkcyk7XG4gICAgcmV0dXJuIGZpZWxkcy5tYXAoZnVuY3Rpb24gKGRlZikge1xuICAgICAgcmV0dXJuIGNvbXBpbGVyLmV4cGFuZERlZihkZWYsIHRlbXBsYXRlTWFwKTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBSdW4gYSBmaWVsZCBkZWZpbml0aW9uIHRocm91Z2ggYWxsIGF2YWlsYWJsZSBjb21waWxlcnMuXG4gIGNvbXBpbGVyLmNvbXBpbGVEZWYgPSBmdW5jdGlvbiAoZGVmKSB7XG5cbiAgICAvL2NvbnNvbGUubG9nKCdpbjonLCBKU09OLnN0cmluZ2lmeShkZWYpKVxuXG4gICAgZGVmID0gdXRpbC5kZWVwQ29weShkZWYpO1xuXG4gICAgdmFyIHJlc3VsdDtcbiAgICBjb21waWxlclBsdWdpbnMuZm9yRWFjaChmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgICByZXN1bHQgPSBwbHVnaW4uY29tcGlsZShkZWYpO1xuICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICBkZWYgPSByZXN1bHQ7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgdHlwZVBsdWdpbiA9IHBsdWdpbi5yZXF1aXJlKCd0eXBlLicgKyBkZWYudHlwZSk7XG5cbiAgICBpZiAodHlwZVBsdWdpbi5jb21waWxlKSB7XG4gICAgICByZXN1bHQgPSB0eXBlUGx1Z2luLmNvbXBpbGUoZGVmKTtcbiAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgZGVmID0gcmVzdWx0O1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChkZWYuZmllbGRzKSB7XG4gICAgICAvLyBDb21waWxlIGFueSBpbmxpbmUgZmllbGRzLlxuICAgICAgZGVmLmZpZWxkcyA9IGRlZi5maWVsZHMubWFwKGZ1bmN0aW9uIChjaGlsZERlZikge1xuICAgICAgICBpZiAoXy5pc09iamVjdChjaGlsZERlZikpIHtcbiAgICAgICAgICByZXR1cm4gY29tcGlsZXIuY29tcGlsZURlZihjaGlsZERlZik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNoaWxkRGVmO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy9jb25zb2xlLmxvZygnb3V0OicsIEpTT04uc3RyaW5naWZ5KGRlZikpXG5cbiAgICByZXR1cm4gZGVmO1xuICB9O1xuXG4gIC8vIEZvciBhbiBhcnJheSBvZiBmaWVsZCBkZWZpbml0aW9ucywgY29tcGlsZSBlYWNoIGZpZWxkIGRlZmluaXRpb24uXG4gIGNvbXBpbGVyLmNvbXBpbGVGaWVsZHMgPSBmdW5jdGlvbiAoZmllbGRzKSB7XG4gICAgcmV0dXJuIGZpZWxkcy5tYXAoZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICByZXR1cm4gY29tcGlsZXIuY29tcGlsZURlZihmaWVsZCk7XG4gICAgfSk7XG4gIH07XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudFxuXG4vLyBBdCBpdHMgbW9zdCBiYXNpYyBsZXZlbCwgdGhlIGNvbXBvbmVudCBwbHVnaW4gc2ltcGx5IG1hcHMgY29tcG9uZW50IG5hbWVzIHRvXG4vLyBwbHVnaW4gbmFtZXMsIHJldHVybmluZyB0aGUgY29tcG9uZW50IGZhY3RvcnkgZm9yIHRoYXQgY29tcG9uZW50LiBGb3Jcbi8vIGV4YW1wbGUsIGBwbHVnaW4uY29tcG9uZW50KCd0ZXh0JylgIGJlY29tZXNcbi8vIGBwbHVnaW4ucmVxdWlyZSgnY29tcG9uZW50LnRleHQnKWAuIFRoaXMgaXMgYSB1c2VmdWwgcGxhY2hvbGRlciBpbiBjYXNlIHdlXG4vLyBsYXRlciB3YW50IHRvIG1ha2UgZm9ybWF0aWMgYWJsZSB0byBkZWNpZGUgY29tcG9uZW50cyBhdCBydW50aW1lLiBGb3Igbm93LFxuLy8gaG93ZXZlciwgdGhpcyBhbGxvd3MgdXMgdG8gaW5qZWN0IFwicHJvcCBtb2RpZmllcnNcIiB3aGljaCBhcmUgcGx1Z2lucyB0aGF0XG4vLyBtb2RpZnkgYSBjb21wb25lbnRzIHByb3BlcnRpZXMgYmVmb3JlIGl0IHJlY2VpdmVzIHRoZW0uXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIC8vIFJlZ2lzdHJ5IGZvciBwcm9wIG1vZGlmaWVycy5cbiAgdmFyIHByb3BNb2RpZmllcnMgPSB7fTtcblxuICAvLyBBZGQgYSBcInByb3AgbW9kaWZlclwiIHdoaWNoIGlzIGp1c3QgYSBmdW5jdGlvbiB0aGF0IG1vZGlmaWVzIGEgY29tcG9uZW50c1xuICAvLyBwcm9wZXJ0aWVzIGJlZm9yZSBpdCByZWNlaXZlcyB0aGVtLlxuICB2YXIgYWRkUHJvcE1vZGlmaWVyID0gZnVuY3Rpb24gKG5hbWUsIG1vZGlmeUZuKSB7XG4gICAgaWYgKCFwcm9wTW9kaWZpZXJzW25hbWVdKSB7XG4gICAgICBwcm9wTW9kaWZpZXJzW25hbWVdID0gW107XG4gICAgfVxuICAgIHByb3BNb2RpZmllcnNbbmFtZV0ucHVzaChtb2RpZnlGbik7XG4gIH07XG5cbiAgLy8gR3JhYiBhbGwgdGhlIHByb3AgbW9kaWZpZXIgcGx1Z2lucy5cbiAgdmFyIHByb3BzUGx1Z2lucyA9IHBsdWdpbi5yZXF1aXJlQWxsKHBsdWdpbi5jb25maWcucHJvcHMpO1xuXG4gIC8vIFJlZ2lzdGVyIGFsbCB0aGUgcHJvcCBtb2RpZmllciBwbHVnaW5zLlxuICBwcm9wc1BsdWdpbnMuZm9yRWFjaChmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgYWRkUHJvcE1vZGlmaWVyLmFwcGx5KG51bGwsIHBsdWdpbik7XG4gIH0pO1xuXG4gIC8vIFJlZ2lzdHJ5IGZvciBjb21wb25lbnQgZmFjdG9yaWVzLiBTaW5jZSB3ZSdsbCBiZSBtb2RpZnlpbmcgdGhlIHByb3BzIGdvaW5nXG4gIC8vIHRvIHRoZSBmYWN0b3JpZXMsIHdlJ2xsIHN0b3JlIG91ciBvd24gY29tcG9uZW50IGZhY3RvcmllcyBoZXJlLlxuICB2YXIgY29tcG9uZW50RmFjdG9yaWVzID0ge307XG5cbiAgLy8gUmV0cmlldmUgdGhlIGFwcHJvcHJpYXRlIGNvbXBvbmVudCBmYWN0b3J5LCB3aGljaCBtYXkgYmUgYSB3cmFwcGVyIHRoYXRcbiAgLy8gcnVucyB0aGUgY29tcG9uZW50IHByb3BlcnRpZXMgdGhyb3VnaCBwcm9wIG1vZGlmaWVyIGZ1bmN0aW9ucy5cbiAgcGx1Z2luLmV4cG9ydHMuY29tcG9uZW50ID0gZnVuY3Rpb24gKG5hbWUpIHtcblxuICAgIGlmICghY29tcG9uZW50RmFjdG9yaWVzW25hbWVdKSB7XG4gICAgICB2YXIgY29tcG9uZW50ID0gUmVhY3QuY3JlYXRlRmFjdG9yeShwbHVnaW4ucmVxdWlyZSgnY29tcG9uZW50LicgKyBuYW1lKSk7XG4gICAgICBjb21wb25lbnRGYWN0b3JpZXNbbmFtZV0gPSBmdW5jdGlvbiAocHJvcHMsIGNoaWxkcmVuKSB7XG4gICAgICAgIGlmIChwcm9wTW9kaWZpZXJzW25hbWVdKSB7XG4gICAgICAgICAgcHJvcE1vZGlmaWVyc1tuYW1lXS5mb3JFYWNoKGZ1bmN0aW9uIChtb2RpZnkpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBtb2RpZnkocHJvcHMpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICBwcm9wcyA9IHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29tcG9uZW50KHByb3BzLCBjaGlsZHJlbik7XG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gY29tcG9uZW50RmFjdG9yaWVzW25hbWVdO1xuICB9O1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb3JlXG5cbi8vIFRoZSBjb3JlIHBsdWdpbiBleHBvcnRzIGEgZnVuY3Rpb24gdGhhdCB0YWtlcyBhIGZvcm1hdGljIGluc3RhbmNlIGFuZFxuLy8gZXh0ZW5kcyB0aGUgaW5zdGFuY2Ugd2l0aCBhZGRpdGlvbmFsIG1ldGhvZHMuXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0gZnVuY3Rpb24gKGZvcm1hdGljKSB7XG5cbiAgICAvLyBUaGUgY29yZSBwbHVnaW4gcmVhbGx5IGRvZXNuJ3QgZG8gbXVjaC4gSXQgYWN0dWFsbHkgcmVsaWVzIG9uIG90aGVyXG4gICAgLy8gcGx1Z2lucyB0byBkbyB0aGUgZGlydHkgd29yay4gVGhpcyB3YXksIHlvdSBjYW4gZWFzaWx5IGFkZCBhZGRpdGlvbmFsXG4gICAgLy8gcGx1Z2lucyB0byBkbyBtb3JlIGRpcnR5IHdvcmsuXG4gICAgdmFyIGZvcm1hdGljUGx1Z2lucyA9IHBsdWdpbi5yZXF1aXJlQWxsKHBsdWdpbi5jb25maWcuZm9ybWF0aWMpO1xuXG4gICAgLy8gV2UgaGF2ZSBzcGVjaWFsIGZvcm0gcGx1Z2lucyB3aGljaCBhcmUganVzdCB1c2VkIHRvIG1vZGlmeSB0aGUgRm9ybVxuICAgIC8vIHByb3RvdHlwZS5cbiAgICB2YXIgZm9ybVBsdWdpbnMgPSBwbHVnaW4ucmVxdWlyZUFsbChwbHVnaW4uY29uZmlnLmZvcm0pO1xuXG4gICAgLy8gUGFzcyB0aGUgZm9ybWF0aWMgaW5zdGFuY2Ugb2ZmIHRvIGVhY2ggb2YgdGhlIGZvcm1hdGljIHBsdWdpbnMuXG4gICAgZm9ybWF0aWNQbHVnaW5zLmZvckVhY2goZnVuY3Rpb24gKGYpIHtcbiAgICAgIF8ua2V5cyhmKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKGZvcm1hdGljW2tleV0pKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQcm9wZXJ0eSBhbHJlYWR5IGRlZmluZWQgZm9yIGZvcm1hdGljOiAnICsga2V5KTtcbiAgICAgICAgfVxuICAgICAgICBmb3JtYXRpY1trZXldID0gZltrZXldO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyAjIyBGb3JtIHByb3RvdHlwZVxuXG4gICAgLy8gVGhlIEZvcm0gY29uc3RydWN0b3IgY3JlYXRlcyBhIGZvcm0gZ2l2ZW4gYSBzZXQgb2Ygb3B0aW9ucy4gT3B0aW9uc1xuICAgIC8vIGNhbiBoYXZlIGBmaWVsZHNgIGFuZCBgdmFsdWVgLlxuICAgIHZhciBGb3JtID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgIGlmICh0aGlzLmluaXQpIHtcbiAgICAgICAgdGhpcy5pbml0KG9wdGlvbnMpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBBZGQgdGhlIGZvcm0gZmFjdG9yeSB0byB0aGUgZm9ybWF0aWMgaW5zdGFuY2UuXG4gICAgZm9ybWF0aWMuZm9ybSA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICByZXR1cm4gbmV3IEZvcm0ob3B0aW9ucyk7XG4gICAgfTtcblxuICAgIEZvcm0ucHJvdG90eXBlID0gZm9ybWF0aWMuZm9ybTtcblxuICAgIC8vIEtlZXAgZm9ybSBpbml0IG1ldGhvZHMgaGVyZS5cbiAgICB2YXIgaW5pdHMgPSBbXTtcblxuICAgIC8vIEdvIHRocm91Z2ggZm9ybSBwbHVnaW5zIGFuZCBhZGQgZWFjaCBwbHVnaW4ncyBtZXRob2RzIHRvIHRoZSBmb3JtXG4gICAgLy8gcHJvdG90eXBlLlxuICAgIGZvcm1QbHVnaW5zLmZvckVhY2goZnVuY3Rpb24gKHByb3RvKSB7XG4gICAgICBfLmtleXMocHJvdG8pLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAvLyBJbml0IHBsdWdpbnMgY2FuIGJlIHN0YWNrZWQuXG4gICAgICAgIGlmIChrZXkgPT09ICdpbml0Jykge1xuICAgICAgICAgIGluaXRzLnB1c2gocHJvdG9ba2V5XSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKEZvcm0ucHJvdG90eXBlW2tleV0pKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Byb3BlcnR5IGFscmVhZHkgZGVmaW5lZCBmb3IgZm9ybTogJyArIGtleSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIEZvcm0ucHJvdG90eXBlW2tleV0gPSBwcm90b1trZXldO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBhbiBpbml0IG1ldGhvZCBmb3IgdGhlIGZvcm0gcHJvdG90eXBlIGJhc2VkIG9uIHRoZSBhdmFpbGFibGUgaW5pdFxuICAgIC8vIG1ldGhvZHMuXG4gICAgaWYgKGluaXRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgRm9ybS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHt9O1xuICAgIH0gZWxzZSBpZiAoaW5pdHMubGVuZ3RoID09PSAxKSB7XG4gICAgICBGb3JtLnByb3RvdHlwZS5pbml0ID0gaW5pdHNbMF07XG4gICAgfSBlbHNlIHtcbiAgICAgIEZvcm0ucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBmb3JtID0gdGhpcztcbiAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG5cbiAgICAgICAgaW5pdHMuZm9yRWFjaChmdW5jdGlvbiAoaW5pdCkge1xuICAgICAgICAgIGluaXQuYXBwbHkoZm9ybSwgYXJncyk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9XG4gIH07XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGV2YWwtZnVuY3Rpb25zXG5cbi8qXG5EZWZhdWx0IGV2YWwgZnVuY3Rpb25zLiBFYWNoIGZ1bmN0aW9uIGlzIHBhcnQgb2YgaXRzIG93biBwbHVnaW4sIGJ1dCBhbGwgYXJlXG5rZXB0IHRvZ2V0aGVyIGhlcmUgYXMgcGFydCBvZiBhIHBsdWdpbiBidW5kbGUuXG5cbk5vdGUgdGhhdCBldmFsIGZ1bmN0aW9ucyBkZWNpZGUgd2hlbiB0aGVpciBhcmd1bWVudHMgZ2V0IGV2YWx1YXRlZC4gVGhpcyB3YXksXG55b3UgY2FuIGNyZWF0ZSBjb250cm9sIHN0cnVjdHVyZXMgKGxpa2UgaWYpIHRoYXQgY29uZGl0aW9uYWxseSBldmFsdWF0ZXMgaXRzXG5hcmd1bWVudHMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG52YXIgd3JhcEZuID0gZnVuY3Rpb24gKGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgcGx1Z2luLmV4cG9ydHMgPSBmdW5jdGlvbiAoYXJncywgZmllbGQsIGNvbnRleHQpIHtcbiAgICAgIGFyZ3MgPSBmaWVsZC5ldmFsKGFyZ3MsIGNvbnRleHQpO1xuICAgICAgdmFyIHJlc3VsdCA9IGZuLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xufTtcblxudmFyIG1ldGhvZENhbGwgPSBmdW5jdGlvbiAobWV0aG9kKSB7XG4gIHJldHVybiBmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgcGx1Z2luLmV4cG9ydHMgPSBmdW5jdGlvbiAoYXJncywgZmllbGQsIGNvbnRleHQpIHtcbiAgICAgIGFyZ3MgPSBmaWVsZC5ldmFsKGFyZ3MsIGNvbnRleHQpO1xuICAgICAgaWYgKGFyZ3MubGVuZ3RoID4gMCkge1xuICAgICAgICByZXR1cm4gYXJnc1swXVttZXRob2RdLmFwcGx5KGFyZ3NbMF0sIGFyZ3Muc2xpY2UoMSkpO1xuICAgICAgfVxuICAgIH07XG4gIH07XG59O1xuXG52YXIgcGx1Z2lucyA9IHtcbiAgaWY6IGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICBwbHVnaW4uZXhwb3J0cyA9IGZ1bmN0aW9uIChhcmdzLCBmaWVsZCwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIGZpZWxkLmV2YWwoYXJnc1swXSwgY29udGV4dCkgPyBmaWVsZC5ldmFsKGFyZ3NbMV0sIGNvbnRleHQpIDogZmllbGQuZXZhbChhcmdzWzJdLCBjb250ZXh0KTtcbiAgICB9O1xuICB9LFxuXG4gIGVxOiBmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgcGx1Z2luLmV4cG9ydHMgPSBmdW5jdGlvbiAoYXJncywgZmllbGQsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiBmaWVsZC5ldmFsKGFyZ3NbMF0sIGNvbnRleHQpID09PSBmaWVsZC5ldmFsKGFyZ3NbMV0sIGNvbnRleHQpO1xuICAgIH07XG4gIH0sXG5cbiAgbm90OiBmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgcGx1Z2luLmV4cG9ydHMgPSBmdW5jdGlvbiAoYXJncywgZmllbGQsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiAhZmllbGQuZXZhbChhcmdzWzBdLCBjb250ZXh0KTtcbiAgICB9O1xuICB9LFxuXG4gIG9yOiBmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgcGx1Z2luLmV4cG9ydHMgPSBmdW5jdGlvbiAoYXJncywgZmllbGQsIGNvbnRleHQpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgYXJnID0gZmllbGQuZXZhbChhcmdzW2ldLCBjb250ZXh0KTtcbiAgICAgICAgaWYgKGFyZykge1xuICAgICAgICAgIHJldHVybiBhcmc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBhcmdzW2FyZ3MubGVuZ3RoIC0gMV07XG4gICAgfTtcbiAgfSxcblxuICBhbmQ6IGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICBwbHVnaW4uZXhwb3J0cyA9IGZ1bmN0aW9uIChhcmdzLCBmaWVsZCwgY29udGV4dCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBhcmcgPSBmaWVsZC5ldmFsKGFyZ3NbaV0sIGNvbnRleHQpO1xuICAgICAgICBpZiAoIWFyZyB8fCBpID09PSAoYXJncy5sZW5ndGggLSAxKSkge1xuICAgICAgICAgIHJldHVybiBhcmc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfTtcbiAgfSxcblxuICBnZXQ6IGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICB2YXIgZ2V0ID0gcGx1Z2luLmV4cG9ydHMgPSBmdW5jdGlvbiAoYXJncywgZmllbGQsIGNvbnRleHQpIHtcbiAgICAgIHZhciB1dGlsID0gcGx1Z2luLnJlcXVpcmUoJ3V0aWwnKTtcbiAgICAgIHZhciBrZXkgPSBmaWVsZC5ldmFsKGFyZ3NbMF0sIGNvbnRleHQpO1xuICAgICAgdmFyIG9iajtcbiAgICAgIGlmIChjb250ZXh0ICYmIGtleSBpbiBjb250ZXh0KSB7XG4gICAgICAgIG9iaiA9IGNvbnRleHRba2V5XTtcbiAgICAgIH0gZWxzZSBpZiAoXy5pc09iamVjdChmaWVsZC52YWx1ZSkgJiYga2V5IGluIGZpZWxkLnZhbHVlKSB7XG4gICAgICAgIG9iaiA9IGZpZWxkLnZhbHVlW2tleV07XG4gICAgICB9IGVsc2UgaWYgKGZpZWxkLnBhcmVudCkge1xuICAgICAgICBvYmogPSBnZXQoYXJncywgZmllbGQucGFyZW50KTtcbiAgICAgIH1cbiAgICAgIGlmIChhcmdzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgdmFyIGdldEluS2V5cyA9IGZpZWxkLmV2YWwoYXJncy5zbGljZSgxKSwgY29udGV4dCk7XG4gICAgICAgIHJldHVybiB1dGlsLmdldEluKG9iaiwgZ2V0SW5LZXlzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvYmo7XG4gICAgfTtcbiAgfSxcblxuICBnZXRHcm91cFZhbHVlczogZnVuY3Rpb24gKHBsdWdpbikge1xuICAgIHBsdWdpbi5leHBvcnRzID0gZnVuY3Rpb24gKGFyZ3MsIGZpZWxkLCBjb250ZXh0KSB7XG5cbiAgICAgIHZhciBncm91cE5hbWUgPSBmaWVsZC5ldmFsKGFyZ3NbMF0sIGNvbnRleHQpO1xuXG4gICAgICB2YXIgZ3JvdXBGaWVsZHMgPSBmaWVsZC5ncm91cEZpZWxkcyhncm91cE5hbWUpO1xuXG4gICAgICByZXR1cm4gZ3JvdXBGaWVsZHMubWFwKGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgICByZXR1cm4gZmllbGQudmFsdWU7XG4gICAgICB9KTtcbiAgICB9O1xuICB9LFxuXG4gIGdldE1ldGE6IGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICB2YXIgdXRpbCA9IHBsdWdpbi5yZXF1aXJlKCd1dGlsJyk7XG4gICAgcGx1Z2luLmV4cG9ydHMgPSBmdW5jdGlvbiAoYXJncywgZmllbGQsIGNvbnRleHQpIHtcbiAgICAgIGFyZ3MgPSBmaWVsZC5ldmFsKGFyZ3MsIGNvbnRleHQpO1xuICAgICAgdmFyIGNhY2hlS2V5ID0gdXRpbC5tZXRhQ2FjaGVLZXkoYXJnc1swXSwgYXJnc1sxXSk7XG4gICAgICByZXR1cm4gZmllbGQuZm9ybS5tZXRhKGNhY2hlS2V5KTtcbiAgICB9O1xuICB9LFxuXG4gIHN1bTogZnVuY3Rpb24gKHBsdWdpbikge1xuICAgIHBsdWdpbi5leHBvcnRzID0gZnVuY3Rpb24gKGFyZ3MsIGZpZWxkLCBjb250ZXh0KSB7XG4gICAgICB2YXIgc3VtID0gMDtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgICBzdW0gKz0gZmllbGQuZXZhbChhcmdzW2ldLCBjb250ZXh0KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdW07XG4gICAgfTtcbiAgfSxcblxuICBmb3JFYWNoOiBmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgcGx1Z2luLmV4cG9ydHMgPSBmdW5jdGlvbiAoYXJncywgZmllbGQsIGNvbnRleHQpIHtcbiAgICAgIHZhciBpdGVtTmFtZSA9IGFyZ3NbMF07XG4gICAgICB2YXIgYXJyYXkgPSBmaWVsZC5ldmFsKGFyZ3NbMV0sIGNvbnRleHQpO1xuICAgICAgdmFyIG1hcEV4cHIgPSBhcmdzWzJdO1xuICAgICAgdmFyIGZpbHRlckV4cHIgPSBhcmdzWzNdO1xuICAgICAgY29udGV4dCA9IE9iamVjdC5jcmVhdGUoY29udGV4dCB8fCB7fSk7XG5cbiAgICAgIHZhciByZXN1bHRzID0gW107XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGl0ZW0gPSBhcnJheVtpXTtcbiAgICAgICAgY29udGV4dFtpdGVtTmFtZV0gPSBpdGVtO1xuICAgICAgICBpZiAoXy5pc1VuZGVmaW5lZChmaWx0ZXJFeHByKSB8fCBmaWVsZC5ldmFsKGZpbHRlckV4cHIsIGNvbnRleHQpKSB7XG4gICAgICAgICAgcmVzdWx0cy5wdXNoKGZpZWxkLmV2YWwobWFwRXhwciwgY29udGV4dCkpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH07XG4gIH0sXG5cbiAgY29uY2F0OiBtZXRob2RDYWxsKCdjb25jYXQnKSxcbiAgc3BsaXQ6IG1ldGhvZENhbGwoJ3NwbGl0JyksXG4gIHJldmVyc2U6IG1ldGhvZENhbGwoJ3JldmVyc2UnKSxcbiAgam9pbjogbWV0aG9kQ2FsbCgnam9pbicpLFxuXG4gIGh1bWFuaXplOiBmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgdmFyIHV0aWwgPSBwbHVnaW4ucmVxdWlyZSgndXRpbCcpO1xuICAgIHBsdWdpbi5leHBvcnRzID0gZnVuY3Rpb24gKGFyZ3MsIGZpZWxkLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gdXRpbC5odW1hbml6ZShmaWVsZC5ldmFsKGFyZ3NbMF0sIGNvbnRleHQpKTtcbiAgICB9O1xuICB9LFxuXG4gIHBpY2s6IHdyYXBGbihfLnBpY2spLFxuICBwbHVjazogd3JhcEZuKF8ucGx1Y2spXG59O1xuXG4vLyBCdWlsZCBhIHBsdWdpbiBidW5kbGUuXG5fLmVhY2gocGx1Z2lucywgZnVuY3Rpb24gKGZuLCBuYW1lKSB7XG4gIG1vZHVsZS5leHBvcnRzWydldmFsLWZ1bmN0aW9uLicgKyBuYW1lXSA9IGZuO1xufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgZXZhbFxuXG4vKlxuVGhlIGV2YWwgcGx1Z2luIHdpbGwgZXZhbHVhdGUgYSBmaWVsZCdzIGBldmFsYCBwcm9wZXJ0eSAod2hpY2ggbXVzdCBiZSBhblxub2JqZWN0KSBhbmQgZXhjaGFuZ2UgdGhlIHByb3BlcnRpZXMgb2YgdGhhdCBvYmplY3QgZm9yIHdoYXRldmVyIHRoZVxuZXhwcmVzc2lvbiByZXR1cm5zLiBFeHByZXNzaW9ucyBhcmUganVzdCBKU09OIGV4Y2VwdCBpZiB0aGUgZmlyc3QgZWxlbWVudCBvZlxuYW4gYXJyYXkgaXMgYSBzdHJpbmcgdGhhdCBzdGFydHMgd2l0aCAnQCcuIEluIHRoYXQgY2FzZSwgdGhlIGFycmF5IGlzXG50cmVhdGVkIGFzIGEgTGlzcCBleHByZXNzaW9uIHdoZXJlIHRoZSBmaXJzdCBlbGVtZW50IHJlZmVycyB0byBhIGZ1bmN0aW9uXG50aGF0IGlzIGNhbGxlZCB3aXRoIHRoZSByZXN0IG9mIHRoZSBlbGVtZW50cyBhcyB0aGUgYXJndW1lbnRzLiBGb3IgZXhhbXBsZTpcblxuYGBganNcblsnQHN1bScsIDEsIDJdXG5gYGBcblxud2lsbCByZXR1cm4gdGhlIHZhbHVlIDMuIFRoZSBleHByZXNzaW9uIGNvdWxkIGJlIHVzZWQgaW4gYW4gYGV2YWxgIHByb3BlcnR5IG9mXG5hIGZpZWxkIGxpa2U6XG5cbmBgYGpzXG57XG4gIHR5cGU6ICdzdHJpbmcnLFxuICBrZXk6ICduYW1lJyxcbiAgZXZhbDoge1xuICAgIHJvd3M6IFsnQHN1bScsIDEsIDJdXG4gIH1cbn1cbmBgYFxuXG5UaGUgYHJvd3NgIHByb3BlcnR5IG9mIHRoZSBmaWVsZCB3b3VsZCBiZSBzZXQgdG8gMyBpbiB0aGlzIGNhc2UuXG5cbkFueSBwbHVnaW4gcmVnaXN0ZXJlZCB3aXRoIHRoZSBwcmVmaXggYGV2YWwtZnVuY3Rpb24uYCB3aWxsIGJlIGF2YWlsYWJsZSBhcyBhXG5mdW5jdGlvbiBpbiB0aGVzZSBleHByZXNzaW9ucy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIC8vIEdyYWIgYWxsIHRoZSBmdW5jdGlvbiBwbHVnaW5zLlxuICB2YXIgZXZhbEZ1bmN0aW9uUGx1Z2lucyA9IHBsdWdpbi5yZXF1aXJlQWxsT2YoJ2V2YWwtZnVuY3Rpb24nKTtcblxuICAvLyBKdXN0IHN0cmlwIG9mZiB0aGUgJ2V2YWwtZnVuY3Rpb25zLicgcHJlZml4IGFuZCBwdXQgaW4gYSBkaWZmZXJlbnQgb2JqZWN0LlxuICB2YXIgZnVuY3Rpb25zID0ge307XG4gIF8uZWFjaChldmFsRnVuY3Rpb25QbHVnaW5zLCBmdW5jdGlvbiAoZm4sIG5hbWUpIHtcbiAgICB2YXIgZm5OYW1lID0gbmFtZS5zdWJzdHJpbmcobmFtZS5pbmRleE9mKCcuJykgKyAxKTtcbiAgICBmdW5jdGlvbnNbZm5OYW1lXSA9IGZuO1xuICB9KTtcblxuICAvLyBDaGVjayBhbiBhcnJheSB0byBzZWUgaWYgaXQncyBhIGZ1bmN0aW9uIGV4cHJlc3Npb24uXG4gIHZhciBpc0Z1bmN0aW9uQXJyYXkgPSBmdW5jdGlvbiAoYXJyYXkpIHtcbiAgICByZXR1cm4gYXJyYXkubGVuZ3RoID4gMCAmJiBhcnJheVswXVswXSA9PT0gJ0AnO1xuICB9O1xuXG4gIC8vIEV2YWx1YXRlIGEgZnVuY3Rpb24gZXhwcmVzc2lvbiBhbmQgcmV0dXJuIHRoZSByZXN1bHQuXG4gIHZhciBldmFsRnVuY3Rpb24gPSBmdW5jdGlvbiAoZm5BcnJheSwgZmllbGQsIGNvbnRleHQpIHtcbiAgICB2YXIgZm5OYW1lID0gZm5BcnJheVswXS5zdWJzdHJpbmcoMSk7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBmdW5jdGlvbnNbZm5OYW1lXShmbkFycmF5LnNsaWNlKDEpLCBmaWVsZCwgY29udGV4dCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKCEoZm5OYW1lIGluIGZ1bmN0aW9ucykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFdmFsIGZ1bmN0aW9uICcgKyBmbk5hbWUgKyAnIG5vdCBkZWZpbmVkLicpO1xuICAgICAgfVxuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH07XG5cbiAgLy8gRXZhbHVhdGUgYW4gZXhwcmVzc2lvbiBpbiB0aGUgY29udGV4dCBvZiBhIGZpZWxkLlxuICB2YXIgZXZhbHVhdGUgPSBmdW5jdGlvbiAoZXhwcmVzc2lvbiwgZmllbGQsIGNvbnRleHQpIHtcbiAgICBpZiAoXy5pc0FycmF5KGV4cHJlc3Npb24pKSB7XG4gICAgICBpZiAoaXNGdW5jdGlvbkFycmF5KGV4cHJlc3Npb24pKSB7XG4gICAgICAgIHJldHVybiBldmFsRnVuY3Rpb24oZXhwcmVzc2lvbiwgZmllbGQsIGNvbnRleHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGV4cHJlc3Npb24ubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgcmV0dXJuIGV2YWx1YXRlKGl0ZW0sIGZpZWxkLCBjb250ZXh0KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChfLmlzT2JqZWN0KGV4cHJlc3Npb24pKSB7XG4gICAgICB2YXIgb2JqID0ge307XG4gICAgICBPYmplY3Qua2V5cyhleHByZXNzaW9uKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGV2YWx1YXRlKGV4cHJlc3Npb25ba2V5XSwgZmllbGQsIGNvbnRleHQpO1xuICAgICAgICBpZiAodHlwZW9mIHJlc3VsdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBvYmpba2V5XSA9IHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH0gZWxzZSBpZiAoXy5pc1N0cmluZyhleHByZXNzaW9uKSAmJiBleHByZXNzaW9uWzBdID09PSAnPScpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbnMuZ2V0KFtleHByZXNzaW9uLnN1YnN0cmluZygxKV0sIGZpZWxkLCBjb250ZXh0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGV4cHJlc3Npb247XG4gICAgfVxuICB9O1xuXG4gIHBsdWdpbi5leHBvcnRzLmV2YWx1YXRlID0gZXZhbHVhdGU7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGZpZWxkLXJvdXRlclxuXG4vKlxuRmllbGRzIGFuZCBjb21wb25lbnRzIGdldCBnbHVlZCB0b2dldGhlciB2aWEgcm91dGVzLiBUaGlzIGlzIHNpbWlsYXIgdG8gVVJMXG5yb3V0aW5nIHdoZXJlIGEgcmVxdWVzdCBnZXRzIGR5bmFtaWNhbGx5IHJvdXRlZCB0byBhIGhhbmRsZXIuIFRoaXMgZ2l2ZXMgYSBsb3Rcbm9mIGZsZXhpYmlsaXR5IGluIGludHJvZHVjaW5nIG5ldyB0eXBlcyBhbmQgY29tcG9uZW50cy4gWW91IGNhbiBjcmVhdGUgYSBuZXdcbnR5cGUgYW5kIHJvdXRlIGl0IHRvIGFuIGV4aXN0aW5nIGNvbXBvbmVudCwgb3IgeW91IGNhbiBjcmVhdGUgYSBuZXcgY29tcG9uZW50XG5hbmQgcm91dGUgZXhpc3RpbmcgdHlwZXMgdG8gaXQuIE9yIHlvdSBjYW4gY3JlYXRlIGJvdGggYW5kIHJvdXRlIHRoZSBuZXcgdHlwZVxudG8gdGhlIG5ldyBjb21wb25lbnQuIE5ldyByb3V0ZXMgYXJlIGFkZGVkIHZpYSByb3V0ZSBwbHVnaW5zLiBBIHJvdXRlIHBsdWdpblxuc2ltcGx5IGV4cG9ydHMgYW4gYXJyYXkgbGlrZTpcblxuYGBganNcbltcbiAgJ2NvbG9yJywgLy8gUm91dGUgdGhpcyB0eXBlXG4gICdjb2xvci1waWNrZXItd2l0aC1hbHBoYScsIC8vIFRvIHRoaXMgY29tcG9uZW50XG4gIGZ1bmN0aW9uIChmaWVsZCkge1xuICAgIHJldHVybiB0eXBlb2YgZmllbGQuZGVmLmFscGhhICE9PSAndW5kZWZpbmVkJztcbiAgfVxuXVxuXG5Sb3V0ZSBwbHVnaW5zIGNhbiBiZSBzdGFja2VkIGFuZCBhcmUgc2Vuc2l0aXZlIHRvIG9yZGVyaW5nLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgdmFyIHJvdXRlcyA9IHt9O1xuXG4gIHZhciByb3V0ZXIgPSBwbHVnaW4uZXhwb3J0cztcblxuICAvLyBHZXQgYWxsIHRoZSByb3V0ZSBwbHVnaW5zLlxuICB2YXIgcm91dGVQbHVnaW5zID0gcGx1Z2luLnJlcXVpcmVBbGwocGx1Z2luLmNvbmZpZy5yb3V0ZXMpO1xuXG4gIC8vIFJlZ2lzdGVyIGEgcm91dGUuXG4gIHJvdXRlci5yb3V0ZSA9IGZ1bmN0aW9uICh0eXBlTmFtZSwgY29tcG9uZW50TmFtZSwgdGVzdEZuKSB7XG4gICAgaWYgKCFyb3V0ZXNbdHlwZU5hbWVdKSB7XG4gICAgICByb3V0ZXNbdHlwZU5hbWVdID0gW107XG4gICAgfVxuICAgIHJvdXRlc1t0eXBlTmFtZV0ucHVzaCh7XG4gICAgICBjb21wb25lbnQ6IGNvbXBvbmVudE5hbWUsXG4gICAgICB0ZXN0OiB0ZXN0Rm5cbiAgICB9KTtcbiAgfTtcblxuICAvLyBSZWdpc3RlciBlYWNoIG9mIHRoZSByb3V0ZXMgcHJvdmlkZWQgYnkgdGhlIHJvdXRlIHBsdWdpbnMuXG4gIHJvdXRlUGx1Z2lucy5mb3JFYWNoKGZ1bmN0aW9uIChyb3V0ZVBsdWdpbikge1xuXG4gICAgcm91dGVyLnJvdXRlLmFwcGx5KHJvdXRlciwgcm91dGVQbHVnaW4pO1xuICB9KTtcblxuICAvLyBEZXRlcm1pbmUgdGhlIGJlc3QgY29tcG9uZW50IGZvciBhIGZpZWxkLCBiYXNlZCBvbiB0aGUgcm91dGVzLlxuICByb3V0ZXIuY29tcG9uZW50Rm9yRmllbGQgPSBmdW5jdGlvbiAoZmllbGQpIHtcblxuICAgIHZhciB0eXBlTmFtZSA9IGZpZWxkLmRlZi50eXBlO1xuXG4gICAgaWYgKHJvdXRlc1t0eXBlTmFtZV0pIHtcbiAgICAgIHZhciByb3V0ZXNGb3JUeXBlID0gcm91dGVzW3R5cGVOYW1lXTtcbiAgICAgIHZhciByb3V0ZSA9IF8uZmluZChyb3V0ZXNGb3JUeXBlLCBmdW5jdGlvbiAocm91dGUpIHtcbiAgICAgICAgcmV0dXJuICFyb3V0ZS50ZXN0IHx8IHJvdXRlLnRlc3QoZmllbGQpO1xuICAgICAgfSk7XG4gICAgICBpZiAocm91dGUpIHtcbiAgICAgICAgcmV0dXJuIHBsdWdpbi5jb21wb25lbnQocm91dGUuY29tcG9uZW50KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocGx1Z2luLmhhc0NvbXBvbmVudCh0eXBlTmFtZSkpIHtcbiAgICAgIHJldHVybiBwbHVnaW4uY29tcG9uZW50KHR5cGVOYW1lKTtcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGNvbXBvbmVudCBmb3IgZmllbGQ6ICcgKyBKU09OLnN0cmluZ2lmeShmaWVsZC5kZWYpKTtcbiAgfTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgZmllbGQtcm91dGVzXG5cbi8qXG5EZWZhdWx0IHJvdXRlcy4gRWFjaCByb3V0ZSBpcyBwYXJ0IG9mIGl0cyBvd24gcGx1Z2luLCBidXQgYWxsIGFyZSBrZXB0IHRvZ2V0aGVyXG5oZXJlIGFzIHBhcnQgb2YgYSBwbHVnaW4gYnVuZGxlLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxudmFyIHJvdXRlcyA9IHtcblxuICAnb2JqZWN0LmRlZmF1bHQnOiBbXG4gICAgJ29iamVjdCcsXG4gICAgJ2ZpZWxkc2V0J1xuICBdLFxuXG4gICdzdHJpbmcuY2hvaWNlcyc6IFtcbiAgICAnc3RyaW5nJyxcbiAgICAnc2VsZWN0JyxcbiAgICBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgIHJldHVybiBmaWVsZC5kZWYuY2hvaWNlcyA/IHRydWUgOiBmYWxzZTtcbiAgICB9XG4gIF0sXG5cbiAgJ3N0cmluZy50YWdzJzogW1xuICAgICdzdHJpbmcnLFxuICAgICdwcmV0dHktdGV4dGFyZWEnLFxuICAgIGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgcmV0dXJuIGZpZWxkLmRlZi5yZXBsYWNlQ2hvaWNlcztcbiAgICB9XG4gIF0sXG5cbiAgJ3N0cmluZy5zaW5nbGUtbGluZSc6IFtcbiAgICAnc3RyaW5nJyxcbiAgICAndGV4dCcsXG4gICAgZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICByZXR1cm4gZmllbGQuZGVmLm1heFJvd3MgPT09IDE7XG4gICAgfVxuICBdLFxuXG4gICdzdHJpbmcuZGVmYXVsdCc6IFtcbiAgICAnc3RyaW5nJyxcbiAgICAndGV4dGFyZWEnXG4gIF0sXG5cbiAgJ2FycmF5LmNob2ljZXMnOiBbXG4gICAgJ2FycmF5JyxcbiAgICAnY2hlY2tib3gtbGlzdCcsXG4gICAgZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICByZXR1cm4gZmllbGQuZGVmLmNob2ljZXMgPyB0cnVlIDogZmFsc2U7XG4gICAgfVxuICBdLFxuXG4gICdhcnJheS5kZWZhdWx0JzogW1xuICAgICdhcnJheScsXG4gICAgJ2xpc3QnXG4gIF0sXG5cbiAgJ2Jvb2xlYW4uZGVmYXVsdCc6IFtcbiAgICAnYm9vbGVhbicsXG4gICAgJ3NlbGVjdCdcbiAgXSxcblxuICAnbnVtYmVyLmRlZmF1bHQnOiBbXG4gICAgJ251bWJlcicsXG4gICAgJ3RleHQnXG4gIF1cblxufTtcblxuLy8gQnVpbGQgYSBwbHVnaW4gYnVuZGxlLlxuXy5lYWNoKHJvdXRlcywgZnVuY3Rpb24gKHJvdXRlLCBuYW1lKSB7XG4gIG1vZHVsZS5leHBvcnRzWydmaWVsZC1yb3V0ZS4nICsgbmFtZV0gPSBmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgcGx1Z2luLmV4cG9ydHMgPSByb3V0ZTtcbiAgfTtcbn0pO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIvLyAjIGxvYWRlclxuXG4vKlxuV2hlbiBtZXRhZGF0YSBpc24ndCBhdmFpbGFibGUsIHdlIGFzayB0aGUgbG9hZGVyIHRvIGxvYWQgaXQuIFRoZSBsb2FkZXIgd2lsbFxudHJ5IHRvIGZpbmQgYW4gYXBwcm9wcmlhdGUgc291cmNlIGJhc2VkIG9uIHRoZSBtZXRhZGF0YSBrZXlzLlxuXG5Ob3RlIHRoYXQgd2UgYXNrIHRoZSBsb2FkZXIgdG8gbG9hZCBtZXRhZGF0YSB3aXRoIGEgc2V0IG9mIGtleXMgbGlrZVxuYFsnZm9vJywgJ2JhciddYCwgYnV0IHRob3NlIGFyZSBjb252ZXJ0ZWQgdG8gYSBzaW5nbGUga2V5IGxpa2UgYGZvbzo6YmFyYCBmb3JcbnRoZSBzYWtlIG9mIGNhY2hpbmcuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHZhciB1dGlsID0gcGx1Z2luLnJlcXVpcmUoJ3V0aWwnKTtcblxuICB2YXIgbG9hZGVyID0gcGx1Z2luLmV4cG9ydHM7XG5cbiAgdmFyIGlzTG9hZGluZyA9IHt9O1xuICB2YXIgc291cmNlcyA9IHt9O1xuXG4gIC8vIExvYWQgbWV0YWRhdGEgZm9yIGEgZ2l2ZW4gZm9ybSBhbmQgcGFyYW1zLlxuICBsb2FkZXIubG9hZE1ldGEgPSBmdW5jdGlvbiAoZm9ybSwgc291cmNlLCBwYXJhbXMpIHtcbiAgICB2YXIgY2FjaGVLZXkgPSB1dGlsLm1ldGFDYWNoZUtleShzb3VyY2UsIHBhcmFtcyk7XG5cbiAgICBpZiAoaXNMb2FkaW5nW2NhY2hlS2V5XSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlzTG9hZGluZ1tjYWNoZUtleV0gPSB0cnVlO1xuXG4gICAgbG9hZGVyLmxvYWRBc3luY0Zyb21Tb3VyY2UoZm9ybSwgc291cmNlLCBwYXJhbXMpO1xuICB9O1xuXG4gIC8vIE1ha2Ugc3VyZSB0byBsb2FkIG1ldGFkYXRhIGFzeW5jaHJvbm91c2x5LlxuICBsb2FkZXIubG9hZEFzeW5jRnJvbVNvdXJjZSA9IGZ1bmN0aW9uIChmb3JtLCBzb3VyY2UsIHBhcmFtcywgd2FpdFRpbWUpIHtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGxvYWRlci5sb2FkRnJvbVNvdXJjZShmb3JtLCBzb3VyY2UsIHBhcmFtcyk7XG4gICAgfSwgd2FpdFRpbWUgfHwgMCk7XG4gIH07XG5cbiAgLy8gTG9hZCBtZXRhZGF0YSBmb3IgYSBmb3JtIGFuZCBwYXJhbXMuXG4gIGxvYWRlci5sb2FkRnJvbVNvdXJjZSA9IGZ1bmN0aW9uIChmb3JtLCBzb3VyY2VOYW1lLCBwYXJhbXMpIHtcblxuICAgIC8vIEZpbmQgdGhlIGJlc3Qgc291cmNlIGZvciB0aGlzIGNhY2hlIGtleS5cbiAgICB2YXIgc291cmNlID0gc291cmNlc1tzb3VyY2VOYW1lXTtcbiAgICBpZiAoc291cmNlKSB7XG5cbiAgICAgIHZhciBjYWNoZUtleSA9IHV0aWwubWV0YUNhY2hlS2V5KHNvdXJjZU5hbWUsIHBhcmFtcyk7XG5cbiAgICAgIC8vIENhbGwgdGhlIHNvdXJjZSBmdW5jdGlvbi5cbiAgICAgIHZhciByZXN1bHQgPSBzb3VyY2UuY2FsbChudWxsLCBwYXJhbXMpO1xuXG4gICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgIC8vIFJlc3VsdCBjb3VsZCBiZSBhIHByb21pc2UuXG4gICAgICAgIGlmIChyZXN1bHQudGhlbikge1xuICAgICAgICAgIHZhciBwcm9taXNlID0gcmVzdWx0LnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgZm9ybS5tZXRhKGNhY2hlS2V5LCByZXN1bHQpO1xuICAgICAgICAgICAgaXNMb2FkaW5nW2NhY2hlS2V5XSA9IGZhbHNlO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgdmFyIG9uRXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpc0xvYWRpbmdbY2FjaGVLZXldID0gZmFsc2U7XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIGlmIChwcm9taXNlLmNhdGNoKSB7XG4gICAgICAgICAgICBwcm9taXNlLmNhdGNoKG9uRXJyb3IpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBzaWxseSBqUXVlcnkgcHJvbWlzZXNcbiAgICAgICAgICAgIHByb21pc2UuZmFpbChvbkVycm9yKTtcbiAgICAgICAgICB9XG4gICAgICAgIC8vIE9yIGl0IGNvdWxkIGJlIGEgdmFsdWUuIEluIHRoYXQgY2FzZSwgbWFrZSBzdXJlIHRvIGFzeW5jaWZ5IGl0LlxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZm9ybS5tZXRhKGNhY2hlS2V5LCByZXN1bHQpO1xuICAgICAgICAgICAgaXNMb2FkaW5nW2NhY2hlS2V5XSA9IGZhbHNlO1xuICAgICAgICAgIH0sIDApO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpc0xvYWRpbmdbY2FjaGVLZXldID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICB9IGVsc2Uge1xuICAgICAgaXNMb2FkaW5nW2NhY2hlS2V5XSA9IGZhbHNlO1xuICAgIH1cbiAgfTtcblxuICAvLyBSZWdpc3RlciBhIHNvdXJjZSBmdW5jdGlvbi5cbiAgbG9hZGVyLnNvdXJjZSA9IGZ1bmN0aW9uIChuYW1lLCBmbikge1xuXG4gICAgc291cmNlc1tuYW1lXSA9IGZuO1xuICB9O1xuXG59O1xuIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyB1dGlsXG5cbi8vIFNvbWUgdXRpbGl0eSBmdW5jdGlvbnMgdG8gYmUgdXNlZCBieSBvdGhlciBwbHVnaW5zLlxuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICB2YXIgdXRpbCA9IHBsdWdpbi5leHBvcnRzO1xuXG4gIC8vIENoZWNrIGlmIGEgdmFsdWUgaXMgXCJibGFua1wiLlxuICB1dGlsLmlzQmxhbmsgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gJyc7XG4gIH07XG5cbiAgLy8gU2V0IHZhbHVlIGF0IHNvbWUgcGF0aCBpbiBvYmplY3QuXG4gIHV0aWwuc2V0SW4gPSBmdW5jdGlvbiAob2JqLCBwYXRoLCB2YWx1ZSkge1xuICAgIGlmIChfLmlzU3RyaW5nKHBhdGgpKSB7XG4gICAgICBwYXRoID0gW3BhdGhdO1xuICAgIH1cbiAgICBpZiAocGF0aC5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgaWYgKHBhdGgubGVuZ3RoID09PSAxKSB7XG4gICAgICBvYmpbcGF0aFswXV0gPSB2YWx1ZTtcbiAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuICAgIGlmICghb2JqW3BhdGhbMF1dKSB7XG4gICAgICBvYmpbcGF0aFswXV0gPSB7fTtcbiAgICB9XG4gICAgdXRpbC5zZXRJbihvYmpbcGF0aFswXV0sIHBhdGguc2xpY2UoMSksIHZhbHVlKTtcbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIFJlbW92ZSB2YWx1ZSBhdCBwYXRoIGluIHNvbWUgb2JqZWN0LlxuICB1dGlsLnJlbW92ZUluID0gZnVuY3Rpb24gKG9iaiwgcGF0aCkge1xuICAgIGlmIChfLmlzU3RyaW5nKHBhdGgpKSB7XG4gICAgICBwYXRoID0gW3BhdGhdO1xuICAgIH1cbiAgICBpZiAocGF0aC5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAocGF0aC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGlmIChfLmlzQXJyYXkob2JqKSkge1xuICAgICAgICBpZiAoXy5pc051bWJlcihwYXRoWzBdKSkge1xuICAgICAgICAgIG9iai5zcGxpY2UocGF0aFswXSwgMSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoXy5pc09iamVjdChvYmopKSB7XG4gICAgICAgIGRlbGV0ZSBvYmpbcGF0aFswXV07XG4gICAgICB9XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH1cbiAgICBpZiAob2JqW3BhdGhbMF1dKSB7XG4gICAgICB1dGlsLnJlbW92ZUluKG9ialtwYXRoWzBdXSwgcGF0aC5zbGljZSgxKSk7XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gR2V0IHZhbHVlIGF0IHBhdGggaW4gc29tZSBvYmplY3QuXG4gIHV0aWwuZ2V0SW4gPSBmdW5jdGlvbiAob2JqLCBwYXRoKSB7XG4gICAgaWYgKF8uaXNTdHJpbmcocGF0aCkpIHtcbiAgICAgIHBhdGggPSBbcGF0aF07XG4gICAgfVxuICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG4gICAgaWYgKF8uaXNPYmplY3Qob2JqKSAmJiBwYXRoWzBdIGluIG9iaikge1xuICAgICAgcmV0dXJuIHV0aWwuZ2V0SW4ob2JqW3BhdGhbMF1dLCBwYXRoLnNsaWNlKDEpKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG5cbiAgLy8gQXBwZW5kIHRvIGFycmF5IGF0IHBhdGggaW4gc29tZSBvYmplY3QuXG4gIHV0aWwuYXBwZW5kSW4gPSBmdW5jdGlvbiAob2JqLCBwYXRoLCB2YWx1ZSkge1xuICAgIHZhciBzdWJPYmogPSB1dGlsLmdldEluKG9iaiwgcGF0aCk7XG4gICAgaWYgKF8uaXNBcnJheShzdWJPYmopKSB7XG4gICAgICBzdWJPYmoucHVzaCh2YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gU3dhcCB0d28ga2V5cyBhdCBwYXRoIGluIHNvbWUgb2JqZWN0LlxuICB1dGlsLm1vdmVJbiA9IGZ1bmN0aW9uIChvYmosIHBhdGgsIGZyb21LZXksIHRvS2V5KSB7XG4gICAgdmFyIHN1Yk9iaiA9IHV0aWwuZ2V0SW4ob2JqLCBwYXRoKTtcbiAgICBpZiAoXy5pc0FycmF5KHN1Yk9iaikpIHtcbiAgICAgIGlmIChfLmlzTnVtYmVyKGZyb21LZXkpICYmIF8uaXNOdW1iZXIodG9LZXkpKSB7XG4gICAgICAgIHZhciBmcm9tSW5kZXggPSBmcm9tS2V5O1xuICAgICAgICB2YXIgdG9JbmRleCA9IHRvS2V5O1xuICAgICAgICBpZiAoZnJvbUluZGV4ICE9PSB0b0luZGV4ICYmXG4gICAgICAgICAgZnJvbUluZGV4ID49IDAgJiYgZnJvbUluZGV4IDwgc3ViT2JqLmxlbmd0aCAmJlxuICAgICAgICAgIHRvSW5kZXggPj0gMCAmJiB0b0luZGV4IDwgc3ViT2JqLmxlbmd0aFxuICAgICAgICApIHtcbiAgICAgICAgICBzdWJPYmouc3BsaWNlKHRvSW5kZXgsIDAsIHN1Yk9iai5zcGxpY2UoZnJvbUluZGV4LCAxKVswXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGZyb21WYWx1ZSA9IHN1Yk9ialtmcm9tS2V5XTtcbiAgICAgIHN1Yk9ialtmcm9tS2V5XSA9IHN1Yk9ialt0b0tleV07XG4gICAgICBzdWJPYmpbdG9LZXldID0gZnJvbVZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIENvcHkgb2JqLCBsZWF2aW5nIG5vbi1KU09OIGJlaGluZC5cbiAgdXRpbC5jb3B5VmFsdWUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh2YWx1ZSkpO1xuICB9O1xuXG4gIC8vIENvcHkgb2JqIHJlY3Vyc2luZyBkZWVwbHkuXG4gIHV0aWwuZGVlcENvcHkgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgaWYgKF8uaXNBcnJheShvYmopKSB7XG4gICAgICByZXR1cm4gb2JqLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICByZXR1cm4gdXRpbC5kZWVwQ29weShpdGVtKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoXy5pc09iamVjdChvYmopKSB7XG4gICAgICB2YXIgY29weSA9IHt9O1xuICAgICAgXy5lYWNoKG9iaiwgZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgY29weVtrZXldID0gdXRpbC5kZWVwQ29weSh2YWx1ZSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBjb3B5O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH1cbiAgfTtcblxuICAvLyBDaGVjayBpZiBpdGVtIG1hdGNoZXMgc29tZSB2YWx1ZSwgYmFzZWQgb24gdGhlIGl0ZW0ncyBgbWF0Y2hgIHByb3BlcnR5LlxuICB1dGlsLml0ZW1NYXRjaGVzVmFsdWUgPSBmdW5jdGlvbiAoaXRlbSwgdmFsdWUpIHtcbiAgICB2YXIgbWF0Y2ggPSBpdGVtLm1hdGNoO1xuICAgIGlmICghbWF0Y2gpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gXy5ldmVyeShfLmtleXMobWF0Y2gpLCBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICByZXR1cm4gXy5pc0VxdWFsKG1hdGNoW2tleV0sIHZhbHVlW2tleV0pO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIENyZWF0ZSBhIGZpZWxkIGRlZmluaXRpb24gZnJvbSBhIHZhbHVlLlxuICB1dGlsLmZpZWxkRGVmRnJvbVZhbHVlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFyIGRlZiA9IHtcbiAgICAgIHR5cGU6ICdqc29uJ1xuICAgIH07XG4gICAgaWYgKF8uaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgICBkZWYgPSB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAoXy5pc051bWJlcih2YWx1ZSkpIHtcbiAgICAgIGRlZiA9IHtcbiAgICAgICAgdHlwZTogJ251bWJlcidcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmIChfLmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICB2YXIgYXJyYXlJdGVtRmllbGRzID0gdmFsdWUubWFwKGZ1bmN0aW9uICh2YWx1ZSwgaSkge1xuICAgICAgICB2YXIgY2hpbGREZWYgPSB1dGlsLmZpZWxkRGVmRnJvbVZhbHVlKHZhbHVlKTtcbiAgICAgICAgY2hpbGREZWYua2V5ID0gaTtcbiAgICAgICAgcmV0dXJuIGNoaWxkRGVmO1xuICAgICAgfSk7XG4gICAgICBkZWYgPSB7XG4gICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgIGZpZWxkczogYXJyYXlJdGVtRmllbGRzXG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAoXy5pc09iamVjdCh2YWx1ZSkpIHtcbiAgICAgIHZhciBvYmplY3RJdGVtRmllbGRzID0gT2JqZWN0LmtleXModmFsdWUpLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIHZhciBjaGlsZERlZiA9IHV0aWwuZmllbGREZWZGcm9tVmFsdWUodmFsdWVba2V5XSk7XG4gICAgICAgIGNoaWxkRGVmLmtleSA9IGtleTtcbiAgICAgICAgY2hpbGREZWYubGFiZWwgPSB1dGlsLmh1bWFuaXplKGtleSk7XG4gICAgICAgIHJldHVybiBjaGlsZERlZjtcbiAgICAgIH0pO1xuICAgICAgZGVmID0ge1xuICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgZmllbGRzOiBvYmplY3RJdGVtRmllbGRzXG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAoXy5pc051bGwodmFsdWUpKSB7XG4gICAgICBkZWYgPSB7XG4gICAgICAgIHR5cGU6ICdudWxsJ1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIGRlZjtcbiAgfTtcblxuICBpZiAocGx1Z2luLmNvbmZpZy5odW1hbml6ZSkge1xuICAgIC8vIEdldCB0aGUgaHVtYW5pemUgZnVuY3Rpb24gZnJvbSBhIHBsdWdpbiBpZiBwcm92aWRlZC5cbiAgICB1dGlsLmh1bWFuaXplID0gcGx1Z2luLnJlcXVpcmUocGx1Z2luLmNvbmZpZy5odW1hbml6ZSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gQ29udmVydCBwcm9wZXJ0eSBrZXlzIHRvIFwiaHVtYW5cIiBsYWJlbHMuIEZvciBleGFtcGxlLCAnZm9vJyBiZWNvbWVzXG4gICAgLy8gJ0ZvbycuXG4gICAgdXRpbC5odW1hbml6ZSA9IGZ1bmN0aW9uKHByb3BlcnR5KSB7XG4gICAgICBwcm9wZXJ0eSA9IHByb3BlcnR5LnJlcGxhY2UoL1xce1xcey9nLCAnJyk7XG4gICAgICBwcm9wZXJ0eSA9IHByb3BlcnR5LnJlcGxhY2UoL1xcfVxcfS9nLCAnJyk7XG4gICAgICByZXR1cm4gcHJvcGVydHkucmVwbGFjZSgvXy9nLCAnICcpXG4gICAgICAgIC5yZXBsYWNlKC8oXFx3KykvZywgZnVuY3Rpb24obWF0Y2gpIHtcbiAgICAgICAgICByZXR1cm4gbWF0Y2guY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBtYXRjaC5zbGljZSgxKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG4gIC8vIEpvaW4gbXVsdGlwbGUgQ1NTIGNsYXNzIG5hbWVzIHRvZ2V0aGVyLCBpZ25vcmluZyBhbnkgdGhhdCBhcmVuJ3QgdGhlcmUuXG4gIHV0aWwuY2xhc3NOYW1lID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNsYXNzTmFtZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuXG4gICAgY2xhc3NOYW1lcyA9IGNsYXNzTmFtZXMuZmlsdGVyKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICByZXR1cm4gbmFtZTtcbiAgICB9KTtcblxuICAgIHJldHVybiBjbGFzc05hbWVzLmpvaW4oJyAnKTtcbiAgfTtcblxuICAvLyBKb2luIGtleXMgdG9nZXRoZXIgdG8gbWFrZSBzaW5nbGUgXCJtZXRhXCIga2V5LiBGb3IgbG9va2luZyB1cCBtZXRhZGF0YSBpblxuICAvLyB0aGUgbWV0YWRhdGEgcGFydCBvZiB0aGUgc3RvcmUuXG4gIHV0aWwuam9pbk1ldGFLZXlzID0gZnVuY3Rpb24gKGtleXMpIHtcbiAgICByZXR1cm4ga2V5cy5qb2luKCc6OicpO1xuICB9O1xuXG4gIC8vIFNwbGl0IGEgam9pbmVkIGtleSBpbnRvIHNlcGFyYXRlIGtleSBwYXJ0cy5cbiAgdXRpbC5zcGxpdE1ldGFLZXkgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgcmV0dXJuIGtleS5zcGxpdCgnOjonKTtcbiAgfTtcblxuICB1dGlsLm1ldGFDYWNoZUtleSA9IGZ1bmN0aW9uIChzb3VyY2UsIHBhcmFtcykge1xuICAgIHBhcmFtcyA9IHBhcmFtcyB8fCB7fTtcbiAgICByZXR1cm4gc291cmNlICsgJzo6cGFyYW1zKCcgKyBKU09OLnN0cmluZ2lmeShwYXJhbXMpICsgJyknO1xuICB9O1xuXG4gIC8vIFdyYXAgYSB0ZXh0IHZhbHVlIHNvIGl0IGhhcyBhIHR5cGUuIEZvciBwYXJzaW5nIHRleHQgd2l0aCB0YWdzLlxuICB2YXIgdGV4dFBhcnQgPSBmdW5jdGlvbiAodmFsdWUsIHR5cGUpIHtcbiAgICB0eXBlID0gdHlwZSB8fCAndGV4dCc7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IHR5cGUsXG4gICAgICB2YWx1ZTogdmFsdWVcbiAgICB9O1xuICB9O1xuXG4gIC8vIFBhcnNlIHRleHQgdGhhdCBoYXMgdGFncyBsaWtlIHt7dGFnfX0gaW50byB0ZXh0IGFuZCB0YWdzLlxuICB1dGlsLnBhcnNlVGV4dFdpdGhUYWdzID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFsdWUgPSB2YWx1ZSB8fCAnJztcbiAgICB2YXIgcGFydHMgPSB2YWx1ZS5zcGxpdCgve3soPyF7KS8pO1xuICAgIHZhciBmcm9udFBhcnQgPSBbXTtcbiAgICBpZiAocGFydHNbMF0gIT09ICcnKSB7XG4gICAgICBmcm9udFBhcnQgPSBbXG4gICAgICAgIHRleHRQYXJ0KHBhcnRzWzBdKVxuICAgICAgXTtcbiAgICB9XG4gICAgcGFydHMgPSBmcm9udFBhcnQuY29uY2F0KFxuICAgICAgcGFydHMuc2xpY2UoMSkubWFwKGZ1bmN0aW9uIChwYXJ0KSB7XG4gICAgICAgIGlmIChwYXJ0LmluZGV4T2YoJ319JykgPj0gMCkge1xuICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICB0ZXh0UGFydChwYXJ0LnN1YnN0cmluZygwLCBwYXJ0LmluZGV4T2YoJ319JykpLCAndGFnJyksXG4gICAgICAgICAgICB0ZXh0UGFydChwYXJ0LnN1YnN0cmluZyhwYXJ0LmluZGV4T2YoJ319JykgKyAyKSlcbiAgICAgICAgICBdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0ZXh0UGFydCgne3snICsgcGFydCwgJ3RleHQnKTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICApO1xuICAgIHJldHVybiBbXS5jb25jYXQuYXBwbHkoW10sIHBhcnRzKTtcbiAgfTtcblxuICAvLyBDb3B5IGFsbCBjb21wdXRlZCBzdHlsZXMgZnJvbSBvbmUgRE9NIGVsZW1lbnQgdG8gYW5vdGhlci5cbiAgdXRpbC5jb3B5RWxlbWVudFN0eWxlID0gZnVuY3Rpb24gKGZyb21FbGVtZW50LCB0b0VsZW1lbnQpIHtcbiAgICB2YXIgZnJvbVN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZnJvbUVsZW1lbnQsICcnKTtcblxuICAgIGlmIChmcm9tU3R5bGUuY3NzVGV4dCAhPT0gJycpIHtcbiAgICAgIHRvRWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gZnJvbVN0eWxlLmNzc1RleHQ7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGNzc1J1bGVzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmcm9tU3R5bGUubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vY29uc29sZS5sb2coaSwgZnJvbVN0eWxlW2ldLCBmcm9tU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShmcm9tU3R5bGVbaV0pKVxuICAgICAgLy90b0VsZW1lbnQuc3R5bGVbZnJvbVN0eWxlW2ldXSA9IGZyb21TdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKGZyb21TdHlsZVtpXSk7XG4gICAgICBjc3NSdWxlcy5wdXNoKGZyb21TdHlsZVtpXSArICc6JyArIGZyb21TdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKGZyb21TdHlsZVtpXSkgKyAnOycpO1xuICAgIH1cbiAgICB2YXIgY3NzVGV4dCA9IGNzc1J1bGVzLmpvaW4oJycpO1xuXG4gICAgdG9FbGVtZW50LnN0eWxlLmNzc1RleHQgPSBjc3NUZXh0O1xuICB9O1xuXG4gIC8vIE9iamVjdCB0byBob2xkIGJyb3dzZXIgc25pZmZpbmcgaW5mby5cbiAgdmFyIGJyb3dzZXIgPSB7XG4gICAgaXNDaHJvbWU6IGZhbHNlLFxuICAgIGlzTW96aWxsYTogZmFsc2UsXG4gICAgaXNPcGVyYTogZmFsc2UsXG4gICAgaXNJZTogZmFsc2UsXG4gICAgaXNTYWZhcmk6IGZhbHNlXG4gIH07XG5cbiAgLy8gU25pZmYgdGhlIGJyb3dzZXIuXG4gIHZhciB1YSA9IG5hdmlnYXRvci51c2VyQWdlbnQ7XG4gIGlmKHVhLmluZGV4T2YoJ0Nocm9tZScpID4gLTEpIHtcbiAgICBicm93c2VyLmlzQ2hyb21lID0gdHJ1ZTtcbiAgfSBlbHNlIGlmICh1YS5pbmRleE9mKCdTYWZhcmknKSA+IC0xKSB7XG4gICAgYnJvd3Nlci5pc1NhZmFyaSA9IHRydWU7XG4gIH0gZWxzZSBpZiAodWEuaW5kZXhPZignT3BlcmEnKSA+IC0xKSB7XG4gICAgYnJvd3Nlci5pc09wZXJhID0gdHJ1ZTtcbiAgfSBlbHNlIGlmICh1YS5pbmRleE9mKCdGaXJlZm94JykgPiAtMSkge1xuICAgIGJyb3dzZXIuaXNNb3ppbGxhID0gdHJ1ZTtcbiAgfSBlbHNlIGlmICh1YS5pbmRleE9mKCdNU0lFJykgPiAtMSkge1xuICAgIGJyb3dzZXIuaXNJZSA9IHRydWU7XG4gIH1cblxuICB1dGlsLmJyb3dzZXIgPSBicm93c2VyO1xuXG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxuLy8gIyBGb3JtYXRpYyBwbHVnaW4gY29yZVxuXG4vLyBBdCBpdHMgY29yZSwgRm9ybWF0aWMgaXMganVzdCBhIHBsdWdpbiBob3N0LiBBbGwgb2YgdGhlIGZ1bmN0aW9uYWxpdHkgaXQgaGFzXG4vLyBvdXQgb2YgdGhlIGJveCBpcyB2aWEgcGx1Z2lucy4gVGhlc2UgcGx1Z2lucyBjYW4gYmUgcmVwbGFjZWQgb3IgZXh0ZW5kZWQgYnlcbi8vIG90aGVyIHBsdWdpbnMuXG5cbi8vIFRoZSBnbG9iYWwgcGx1Z2luIHJlZ2lzdHJ5IGhvbGRzIHJlZ2lzdGVyZWQgKGJ1dCBub3QgeWV0IGluc3RhbnRpYXRlZClcbi8vIHBsdWdpbnMuXG52YXIgcGx1Z2luUmVnaXN0cnkgPSB7fTtcblxuLy8gR3JvdXAgcGx1Z2lucyBieSBwcmVmaXguXG52YXIgcGx1Z2luR3JvdXBzID0ge307XG5cbi8vIEZvciBhbm9ueW1vdXMgcGx1Z2lucywgaW5jcmVtZW50aW5nIG51bWJlciBmb3IgbmFtZXMuXG52YXIgcGx1Z2luSWQgPSAwO1xuXG4vLyBSZWdpc3RlciBhIHBsdWdpbiBvciBwbHVnaW4gYnVuZGxlIChhcnJheSBvZiBwbHVnaW5zKSBnbG9iYWxseS5cbnZhciByZWdpc3RlclBsdWdpbiA9IGZ1bmN0aW9uIChuYW1lLCBwbHVnaW5Jbml0Rm4pIHtcblxuICBpZiAocGx1Z2luUmVnaXN0cnlbbmFtZV0pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1BsdWdpbiAnICsgbmFtZSArICcgaXMgYWxyZWFkeSByZWdpc3RlcmVkLicpO1xuICB9XG5cbiAgaWYgKF8uaXNBcnJheShwbHVnaW5Jbml0Rm4pKSB7XG4gICAgcGx1Z2luUmVnaXN0cnlbbmFtZV0gPSBbXTtcbiAgICBwbHVnaW5Jbml0Rm4uZm9yRWFjaChmdW5jdGlvbiAocGx1Z2luU3BlYykge1xuICAgICAgcmVnaXN0ZXJQbHVnaW4ocGx1Z2luU3BlYy5uYW1lLCBwbHVnaW5TcGVjLnBsdWdpbik7XG4gICAgICBwbHVnaW5SZWdpc3RyeVtuYW1lXS5wdXNoKHBsdWdpblNwZWMubmFtZSk7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAoXy5pc09iamVjdChwbHVnaW5Jbml0Rm4pICYmICFfLmlzRnVuY3Rpb24ocGx1Z2luSW5pdEZuKSkge1xuICAgIHZhciBidW5kbGVOYW1lID0gbmFtZTtcbiAgICBwbHVnaW5SZWdpc3RyeVtidW5kbGVOYW1lXSA9IFtdO1xuICAgIE9iamVjdC5rZXlzKHBsdWdpbkluaXRGbikuZm9yRWFjaChmdW5jdGlvbiAobmFtZSkge1xuICAgICAgcmVnaXN0ZXJQbHVnaW4obmFtZSwgcGx1Z2luSW5pdEZuW25hbWVdKTtcbiAgICAgIHBsdWdpblJlZ2lzdHJ5W2J1bmRsZU5hbWVdLnB1c2gobmFtZSk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgcGx1Z2luUmVnaXN0cnlbbmFtZV0gPSBwbHVnaW5Jbml0Rm47XG4gICAgLy8gQWRkIHBsdWdpbiBuYW1lIHRvIHBsdWdpbiBncm91cCBpZiBpdCBoYXMgYSBwcmVmaXguXG4gICAgaWYgKG5hbWUuaW5kZXhPZignLicpID4gMCkge1xuICAgICAgdmFyIHByZWZpeCA9IG5hbWUuc3Vic3RyaW5nKDAsIG5hbWUuaW5kZXhPZignLicpKTtcbiAgICAgIHBsdWdpbkdyb3Vwc1twcmVmaXhdID0gcGx1Z2luR3JvdXBzW3ByZWZpeF0gfHwgW107XG4gICAgICBwbHVnaW5Hcm91cHNbcHJlZml4XS5wdXNoKG5hbWUpO1xuICAgIH1cbiAgfVxufTtcblxuLy8gRGVmYXVsdCBwbHVnaW4gY29uZmlnLiBFYWNoIGtleSByZXByZXNlbnRzIGEgcGx1Z2luIG5hbWUuIEVhY2gga2V5IG9mIHRoYXRcbi8vIHBsdWdpbiByZXByZXNlbnRzIGEgc2V0dGluZyBmb3IgdGhhdCBwbHVnaW4uIFBhc3NlZC1pbiBjb25maWcgd2lsbCBvdmVycmlkZVxuLy8gZWFjaCBpbmRpdmlkdWFsIHNldHRpbmcuXG52YXIgZGVmYXVsdFBsdWdpbkNvbmZpZyA9IHtcbiAgY29yZToge1xuICAgIGZvcm1hdGljOiBbJ2NvcmUuZm9ybWF0aWMnXSxcbiAgICBmb3JtOiBbJ2NvcmUuZm9ybS1pbml0JywgJ2NvcmUuZm9ybScsICdjb3JlLmZpZWxkJ11cbiAgfSxcbiAgJ2NvcmUuZm9ybSc6IHtcbiAgICBzdG9yZTogJ3N0b3JlLm1lbW9yeSdcbiAgfSxcbiAgJ2ZpZWxkLXJvdXRlcic6IHtcbiAgICByb3V0ZXM6IFsnZmllbGQtcm91dGVzJ11cbiAgfSxcbiAgY29tcGlsZXI6IHtcbiAgICBjb21waWxlcnM6IFsnY29tcGlsZXIuY2hvaWNlcycsICdjb21waWxlci5sb29rdXAnLCAnY29tcGlsZXIudHlwZXMnLCAnY29tcGlsZXIucHJvcC1hbGlhc2VzJ11cbiAgfSxcbiAgY29tcG9uZW50OiB7XG4gICAgcHJvcHM6IFsnZGVmYXVsdC1zdHlsZSddXG4gIH1cbn07XG5cbi8vICMjIEZvcm1hdGljIGZhY3RvcnlcblxuLy8gQ3JlYXRlIGEgbmV3IGZvcm1hdGljIGluc3RhbmNlLiBBIGZvcm1hdGljIGluc3RhbmNlIGlzIGEgZnVuY3Rpb24gdGhhdCBjYW5cbi8vIGNyZWF0ZSBmb3Jtcy4gSXQgYWxzbyBoYXMgYSBgLmNyZWF0ZWAgbWV0aG9kIHRoYXQgY2FuIGNyZWF0ZSBvdGhlciBmb3JtYXRpY1xuLy8gaW5zdGFuY2VzLlxudmFyIGNyZWF0ZUZvcm1hdGljQ29yZSA9IGZ1bmN0aW9uIChjb25maWcpIHtcblxuICAvLyBNYWtlIGEgY29weSBvZiBjb25maWcgc28gd2UgY2FuIG1vbmtleSB3aXRoIGl0LlxuICBjb25maWcgPSBfLmV4dGVuZCh7fSwgY29uZmlnKTtcblxuICAvLyBBZGQgZGVmYXVsdCBjb25maWcgc2V0dGluZ3MgKHdoZXJlIG5vdCBvdmVycmlkZGVuKS5cbiAgXy5rZXlzKGRlZmF1bHRQbHVnaW5Db25maWcpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIGNvbmZpZ1trZXldID0gXy5leHRlbmQoe30sIGRlZmF1bHRQbHVnaW5Db25maWdba2V5XSwgY29uZmlnW2tleV0pO1xuICB9KTtcblxuICAvLyBUaGUgYGZvcm1hdGljYCB2YXJpYWJsZSB3aWxsIGhvbGQgdGhlIGZ1bmN0aW9uIHRoYXQgZ2V0cyByZXR1cm5lZCBmcm9tIHRoZVxuICAvLyBmYWN0b3J5LlxuICB2YXIgZm9ybWF0aWM7XG5cbiAgLy8gSW5zdGFudGlhdGVkIHBsdWdpbnMgYXJlIGNhY2hlZCBqdXN0IGxpa2UgQ29tbW9uSlMgbW9kdWxlcy5cbiAgdmFyIHBsdWdpbkNhY2hlID0ge307XG5cbiAgLy8gIyMgUGx1Z2luIHByb3RvdHlwZVxuXG4gIC8vIFRoZSBQbHVnaW4gcHJvdG90eXBlIGV4aXN0cyBpbnNpZGUgdGhlIEZvcm1hdGljIGZhY3RvcnkgZnVuY3Rpb24ganVzdCB0b1xuICAvLyBtYWtlIGl0IGVhc2llciB0byBncmFiIHZhbHVlcyBmcm9tIHRoZSBjbG9zdXJlLlxuXG4gIC8vIFBsdWdpbnMgYXJlIHNpbWlsYXIgdG8gQ29tbW9uSlMgbW9kdWxlcy4gRm9ybWF0aWMgdXNlcyBwbHVnaW5zIGFzIGEgc2xpZ2h0XG4gIC8vIHZhcmlhbnQgdGhvdWdoIGJlY2F1c2U6XG4gIC8vIC0gRm9ybWF0aWMgcGx1Z2lucyBhcmUgY29uZmlndXJhYmxlLlxuICAvLyAtIEZvcm1hdGljIHBsdWdpbnMgYXJlIGluc3RhbnRpYXRlZCBwZXIgZm9ybWF0aWMgaW5zdGFuY2UuIENvbW1vbkpTIG1vZHVsZXNcbiAgLy8gICBhcmUgY3JlYXRlZCBvbmNlIGFuZCB3b3VsZCBiZSBzaGFyZWQgYWNyb3NzIGFsbCBmb3JtYXRpYyBpbnN0YW5jZXMuXG4gIC8vIC0gRm9ybWF0aWMgcGx1Z2lucyBhcmUgZWFzaWx5IG92ZXJyaWRhYmxlIChhbHNvIHZpYSBjb25maWd1cmF0aW9uKS5cblxuICAvLyBXaGVuIGEgcGx1Z2luIGlzIGluc3RhbnRpYXRlZCwgd2UgY2FsbCB0aGUgYFBsdWdpbmAgY29uc3RydWN0b3IuIFRoZSBwbHVnaW5cbiAgLy8gaW5zdGFuY2UgaXMgdGhlbiBwYXNzZWQgdG8gdGhlIHBsdWdpbidzIGluaXRpYWxpemF0aW9uIGZ1bmN0aW9uLlxuICB2YXIgUGx1Z2luID0gZnVuY3Rpb24gKG5hbWUsIGNvbmZpZykge1xuICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBQbHVnaW4pKSB7XG4gICAgICByZXR1cm4gbmV3IFBsdWdpbihuYW1lLCBjb25maWcpO1xuICAgIH1cbiAgICAvLyBFeHBvcnRzIGFuYWxvZ291cyB0byBDb21tb25KUyBleHBvcnRzLlxuICAgIHRoaXMuZXhwb3J0cyA9IHt9O1xuICAgIC8vIENvbmZpZyB2YWx1ZXMgcGFzc2VkIGluIHZpYSBmYWN0b3J5IGFyZSByb3V0ZWQgdG8gdGhlIGFwcHJvcHJpYXRlXG4gICAgLy8gcGx1Z2luIGFuZCBhdmFpbGFibGUgdmlhIGAuY29uZmlnYC5cbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICB9O1xuXG4gIC8vIEdldCBhIGNvbmZpZyB2YWx1ZSBmb3IgYSBwbHVnaW4gb3IgcmV0dXJuIHRoZSBkZWZhdWx0IHZhbHVlLlxuICBQbHVnaW4ucHJvdG90eXBlLmNvbmZpZ1ZhbHVlID0gZnVuY3Rpb24gKGtleSwgZGVmYXVsdFZhbHVlKSB7XG5cbiAgICBpZiAodHlwZW9mIHRoaXMuY29uZmlnW2tleV0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb25maWdba2V5XTtcbiAgICB9XG4gICAgcmV0dXJuIGRlZmF1bHRWYWx1ZSB8fCAnJztcbiAgfTtcblxuICAvLyBSZXF1aXJlIGFub3RoZXIgcGx1Z2luIGJ5IG5hbWUuIFRoaXMgaXMgbXVjaCBsaWtlIGEgQ29tbW9uSlMgcmVxdWlyZVxuICBQbHVnaW4ucHJvdG90eXBlLnJlcXVpcmUgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHJldHVybiBmb3JtYXRpYy5wbHVnaW4obmFtZSk7XG4gIH07XG5cbiAgLy8gSGFuZGxlIGEgc3BlY2lhbCBwbHVnaW4sIHRoZSBgY29tcG9uZW50YCBwbHVnaW4gd2hpY2ggZmluZHMgY29tcG9uZW50cy5cbiAgdmFyIGNvbXBvbmVudFBsdWdpbjtcblxuICAvLyBKdXN0IGhlcmUgaW4gY2FzZSB3ZSB3YW50IHRvIGR5bmFtaWNhbGx5IGNob29zZSBjb21wb25lbnQgbGF0ZXIuXG4gIFBsdWdpbi5wcm90b3R5cGUuY29tcG9uZW50ID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICByZXR1cm4gY29tcG9uZW50UGx1Z2luLmNvbXBvbmVudChuYW1lKTtcbiAgfTtcblxuICAvLyBDaGVjayBpZiBhIHBsdWdpbiBleGlzdHMuXG4gIFBsdWdpbi5wcm90b3R5cGUuaGFzUGx1Z2luID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICByZXR1cm4gKG5hbWUgaW4gcGx1Z2luQ2FjaGUpIHx8IChuYW1lIGluIHBsdWdpblJlZ2lzdHJ5KTtcbiAgfTtcblxuICAvLyBDaGVjayBpZiBhIGNvbXBvbmVudCBleGlzdHMuIENvbXBvbmVudHMgYXJlIHJlYWxseSBqdXN0IHBsdWdpbnMgd2l0aFxuICAvLyBhIHBhcnRpY3VsYXIgcHJlZml4IHRvIHRoZWlyIG5hbWVzLlxuICBQbHVnaW4ucHJvdG90eXBlLmhhc0NvbXBvbmVudCA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuaGFzUGx1Z2luKCdjb21wb25lbnQuJyArIG5hbWUpO1xuICB9O1xuXG4gIC8vIEdpdmVuIGEgbGlzdCBvZiBwbHVnaW4gbmFtZXMsIHJlcXVpcmUgdGhlbSBhbGwgYW5kIHJldHVybiBhIGxpc3Qgb2ZcbiAgLy8gaW5zdGFudGlhdGVkIHBsdWdpbnMuXG4gIFBsdWdpbi5wcm90b3R5cGUucmVxdWlyZUFsbCA9IGZ1bmN0aW9uIChwbHVnaW5MaXN0KSB7XG4gICAgaWYgKCFwbHVnaW5MaXN0KSB7XG4gICAgICBwbHVnaW5MaXN0ID0gW107XG4gICAgfVxuICAgIGlmICghXy5pc0FycmF5KHBsdWdpbkxpc3QpKSB7XG4gICAgICBwbHVnaW5MaXN0ID0gW3BsdWdpbkxpc3RdO1xuICAgIH1cbiAgICAvLyBJbmZsYXRlIHJlZ2lzdGVyZWQgYnVuZGxlcy4gQSBidW5kbGUgaXMganVzdCBhIG5hbWUgdGhhdCBwb2ludHMgdG8gYW5cbiAgICAvLyBhcnJheSBvZiBvdGhlciBwbHVnaW4gbmFtZXMuXG4gICAgcGx1Z2luTGlzdCA9IHBsdWdpbkxpc3QubWFwKGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICAgIGlmIChfLmlzU3RyaW5nKHBsdWdpbikpIHtcbiAgICAgICAgaWYgKF8uaXNBcnJheShwbHVnaW5SZWdpc3RyeVtwbHVnaW5dKSkge1xuICAgICAgICAgIHJldHVybiBwbHVnaW5SZWdpc3RyeVtwbHVnaW5dO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcGx1Z2luO1xuICAgIH0pO1xuICAgIC8vIEZsYXR0ZW4gYW55IGJ1bmRsZXMsIHNvIHdlIGVuZCB1cCB3aXRoIGEgZmxhdCBhcnJheSBvZiBwbHVnaW4gbmFtZXMuXG4gICAgcGx1Z2luTGlzdCA9IF8uZmxhdHRlbihwbHVnaW5MaXN0KTtcbiAgICByZXR1cm4gcGx1Z2luTGlzdC5tYXAoZnVuY3Rpb24gKHBsdWdpbikge1xuICAgICAgcmV0dXJuIHRoaXMucmVxdWlyZShwbHVnaW4pO1xuICAgIH0uYmluZCh0aGlzKSk7XG4gIH07XG5cbiAgLy8gR2l2ZW4gYSBwcmVmaXgsIHJldHVybiBhIG1hcCBvZiBhbGwgaW5zdGFudGlhdGVkIHBsdWdpbnMgd2l0aCB0aGF0IHByZWZpeC5cbiAgUGx1Z2luLnByb3RvdHlwZS5yZXF1aXJlQWxsT2YgPSBmdW5jdGlvbiAocHJlZml4KSB7XG4gICAgdmFyIG1hcCA9IHt9O1xuXG4gICAgaWYgKHBsdWdpbkdyb3Vwc1twcmVmaXhdKSB7XG4gICAgICBwbHVnaW5Hcm91cHNbcHJlZml4XS5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgIG1hcFtuYW1lXSA9IHRoaXMucmVxdWlyZShuYW1lKTtcbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1hcDtcbiAgfTtcblxuICAvLyAjIyBGb3JtYXRpYyBmYWN0b3J5LCBjb250aW51ZWQuLi5cblxuICAvLyBHcmFiIGEgcGx1Z2luIGZyb20gdGhlIGNhY2hlLCBvciBsb2FkIGl0IGZyZXNoIGZyb20gdGhlIHJlZ2lzdHJ5LlxuICB2YXIgbG9hZFBsdWdpbiA9IGZ1bmN0aW9uIChuYW1lLCBwbHVnaW5Db25maWcpIHtcbiAgICB2YXIgcGx1Z2luO1xuXG4gICAgLy8gV2UgY2FuIGFsc28gbG9hZCBhbm9ueW1vdXMgcGx1Z2lucy5cbiAgICBpZiAoXy5pc0Z1bmN0aW9uKG5hbWUpKSB7XG5cbiAgICAgIHZhciBmYWN0b3J5ID0gbmFtZTtcblxuICAgICAgaWYgKF8uaXNVbmRlZmluZWQoZmFjdG9yeS5fX2V4cG9ydHNfXykpIHtcbiAgICAgICAgcGx1Z2luSWQrKztcbiAgICAgICAgcGx1Z2luID0gUGx1Z2luKCdhbm9ueW1vdXNfcGx1Z2luXycgKyBwbHVnaW5JZCwgcGx1Z2luQ29uZmlnIHx8IHt9KTtcbiAgICAgICAgZmFjdG9yeShwbHVnaW4pO1xuICAgICAgICAvLyBTdG9yZSB0aGUgZXhwb3J0cyBvbiB0aGUgYW5vbnltb3VzIGZ1bmN0aW9uIHNvIHdlIGtub3cgaXQncyBhbHJlYWR5XG4gICAgICAgIC8vIGJlZW4gaW5zdGFudGlhdGVkLCBhbmQgd2UgY2FuIGp1c3QgZ3JhYiB0aGUgZXhwb3J0cy5cbiAgICAgICAgZmFjdG9yeS5fX2V4cG9ydHNfXyA9IHBsdWdpbi5leHBvcnRzO1xuICAgICAgfVxuXG4gICAgICAvLyBMb2FkIHRoZSBjYWNoZWQgZXhwb3J0cy5cbiAgICAgIHJldHVybiBmYWN0b3J5Ll9fZXhwb3J0c19fO1xuXG4gICAgfSBlbHNlIGlmIChfLmlzVW5kZWZpbmVkKHBsdWdpbkNhY2hlW25hbWVdKSkge1xuXG4gICAgICBpZiAoIXBsdWdpbkNvbmZpZyAmJiBjb25maWdbbmFtZV0pIHtcbiAgICAgICAgaWYgKGNvbmZpZ1tuYW1lXS5wbHVnaW4pIHtcbiAgICAgICAgICByZXR1cm4gbG9hZFBsdWdpbihjb25maWdbbmFtZV0ucGx1Z2luLCBjb25maWdbbmFtZV0gfHwge30pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChwbHVnaW5SZWdpc3RyeVtuYW1lXSkge1xuICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKHBsdWdpblJlZ2lzdHJ5W25hbWVdKSkge1xuICAgICAgICAgIHBsdWdpbiA9IFBsdWdpbihuYW1lLCBwbHVnaW5Db25maWcgfHwgY29uZmlnW25hbWVdKTtcbiAgICAgICAgICBwbHVnaW5SZWdpc3RyeVtuYW1lXShwbHVnaW4pO1xuICAgICAgICAgIHBsdWdpbkNhY2hlW25hbWVdID0gcGx1Z2luLmV4cG9ydHM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQbHVnaW4gJyArIG5hbWUgKyAnIGlzIG5vdCBhIGZ1bmN0aW9uLicpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BsdWdpbiAnICsgbmFtZSArICcgbm90IGZvdW5kLicpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcGx1Z2luQ2FjaGVbbmFtZV07XG4gIH07XG5cbiAgLy8gQXNzaWduIGBmb3JtYXRpY2AgdG8gYSBmdW5jdGlvbiB0aGF0IHRha2VzIGZvcm0gb3B0aW9ucyBhbmQgcmV0dXJucyBhIGZvcm0uXG4gIGZvcm1hdGljID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gZm9ybWF0aWMuZm9ybShvcHRpb25zKTtcbiAgfTtcblxuICAvLyBBbGxvdyBnbG9iYWwgcGx1Z2luIHJlZ2lzdHJ5IGZyb20gdGhlIGZvcm1hdGljIGZ1bmN0aW9uIGluc3RhbmNlLlxuICBmb3JtYXRpYy5yZWdpc3RlciA9IGZ1bmN0aW9uIChuYW1lLCBwbHVnaW5Jbml0Rm4pIHtcbiAgICByZWdpc3RlclBsdWdpbihuYW1lLCBwbHVnaW5Jbml0Rm4pO1xuICAgIHJldHVybiBmb3JtYXRpYztcbiAgfTtcblxuICAvLyBBbGxvdyByZXRyaWV2aW5nIHBsdWdpbnMgZnJvbSB0aGUgZm9ybWF0aWMgZnVuY3Rpb24gaW5zdGFuY2UuXG4gIGZvcm1hdGljLnBsdWdpbiA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgcmV0dXJuIGxvYWRQbHVnaW4obmFtZSk7XG4gIH07XG5cbiAgLy8gQWxsb3cgY3JlYXRpbmcgYSBuZXcgZm9ybWF0aWMgaW5zdGFuY2UgZnJvbSBhIGZvcm1hdGljIGluc3RhbmNlLlxuICAvL2Zvcm1hdGljLmNyZWF0ZSA9IEZvcm1hdGljO1xuXG4gIC8vIFVzZSB0aGUgY29yZSBwbHVnaW4gdG8gYWRkIG1ldGhvZHMgdG8gdGhlIGZvcm1hdGljIGluc3RhbmNlLlxuICB2YXIgY29yZSA9IGxvYWRQbHVnaW4oJ2NvcmUnKTtcblxuICBjb3JlKGZvcm1hdGljKTtcblxuICAvLyBOb3cgYmluZCB0aGUgY29tcG9uZW50IHBsdWdpbi4gV2Ugd2FpdCB0aWxsIG5vdywgc28gdGhlIGNvcmUgaXMgbG9hZGVkXG4gIC8vIGZpcnN0LlxuICBjb21wb25lbnRQbHVnaW4gPSBsb2FkUGx1Z2luKCdjb21wb25lbnQnKTtcblxuICAvLyBSZXR1cm4gdGhlIGZvcm1hdGljIGZ1bmN0aW9uIGluc3RhbmNlLlxuICByZXR1cm4gZm9ybWF0aWM7XG59O1xuXG4vLyBKdXN0IGEgaGVscGVyIHRvIHJlZ2lzdGVyIGEgYnVuY2ggb2YgcGx1Z2lucy5cbnZhciByZWdpc3RlclBsdWdpbnMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBhcmcgPSBfLnRvQXJyYXkoYXJndW1lbnRzKTtcbiAgYXJnLmZvckVhY2goZnVuY3Rpb24gKGFyZykge1xuICAgIHZhciBuYW1lID0gYXJnWzBdO1xuICAgIHZhciBwbHVnaW4gPSBhcmdbMV07XG4gICAgcmVnaXN0ZXJQbHVnaW4obmFtZSwgcGx1Z2luKTtcbiAgfSk7XG59O1xuXG4vLyBSZWdpc3RlciBhbGwgdGhlIGJ1aWx0LWluIHBsdWdpbnMuXG5yZWdpc3RlclBsdWdpbnMoXG4gIFsnY29yZScsIHJlcXVpcmUoJy4vZGVmYXVsdC9jb3JlJyldLFxuXG4gIFsnY29yZS5mb3JtYXRpYycsIHJlcXVpcmUoJy4vY29yZS9mb3JtYXRpYycpXSxcbiAgWydjb3JlLmZvcm0taW5pdCcsIHJlcXVpcmUoJy4vY29yZS9mb3JtLWluaXQnKV0sXG4gIFsnY29yZS5mb3JtJywgcmVxdWlyZSgnLi9jb3JlL2Zvcm0nKV0sXG4gIFsnY29yZS5maWVsZCcsIHJlcXVpcmUoJy4vY29yZS9maWVsZCcpXSxcblxuICBbJ3V0aWwnLCByZXF1aXJlKCcuL2RlZmF1bHQvdXRpbCcpXSxcbiAgWydjb21waWxlcicsIHJlcXVpcmUoJy4vZGVmYXVsdC9jb21waWxlcicpXSxcbiAgWydldmFsJywgcmVxdWlyZSgnLi9kZWZhdWx0L2V2YWwnKV0sXG4gIFsnZXZhbC1mdW5jdGlvbnMnLCByZXF1aXJlKCcuL2RlZmF1bHQvZXZhbC1mdW5jdGlvbnMnKV0sXG4gIFsnbG9hZGVyJywgcmVxdWlyZSgnLi9kZWZhdWx0L2xvYWRlcicpXSxcbiAgWydmaWVsZC1yb3V0ZXInLCByZXF1aXJlKCcuL2RlZmF1bHQvZmllbGQtcm91dGVyJyldLFxuICBbJ2ZpZWxkLXJvdXRlcycsIHJlcXVpcmUoJy4vZGVmYXVsdC9maWVsZC1yb3V0ZXMnKV0sXG5cbiAgWydjb21waWxlci5jaG9pY2VzJywgcmVxdWlyZSgnLi9jb21waWxlcnMvY2hvaWNlcycpXSxcbiAgWydjb21waWxlci5sb29rdXAnLCByZXF1aXJlKCcuL2NvbXBpbGVycy9sb29rdXAnKV0sXG4gIFsnY29tcGlsZXIudHlwZXMnLCByZXF1aXJlKCcuL2NvbXBpbGVycy90eXBlcycpXSxcbiAgWydjb21waWxlci5wcm9wLWFsaWFzZXMnLCByZXF1aXJlKCcuL2NvbXBpbGVycy9wcm9wLWFsaWFzZXMnKV0sXG5cbiAgWydzdG9yZS5tZW1vcnknLCByZXF1aXJlKCcuL3N0b3JlL21lbW9yeScpXSxcblxuICBbJ3R5cGUucm9vdCcsIHJlcXVpcmUoJy4vdHlwZXMvcm9vdCcpXSxcbiAgWyd0eXBlLnN0cmluZycsIHJlcXVpcmUoJy4vdHlwZXMvc3RyaW5nJyldLFxuICBbJ3R5cGUub2JqZWN0JywgcmVxdWlyZSgnLi90eXBlcy9vYmplY3QnKV0sXG4gIFsndHlwZS5ib29sZWFuJywgcmVxdWlyZSgnLi90eXBlcy9ib29sZWFuJyldLFxuICBbJ3R5cGUuYXJyYXknLCByZXF1aXJlKCcuL3R5cGVzL2FycmF5JyldLFxuICBbJ3R5cGUuanNvbicsIHJlcXVpcmUoJy4vdHlwZXMvanNvbicpXSxcbiAgWyd0eXBlLm51bWJlcicsIHJlcXVpcmUoJy4vdHlwZXMvbnVtYmVyJyldLFxuXG4gIFsnY29tcG9uZW50JywgcmVxdWlyZSgnLi9kZWZhdWx0L2NvbXBvbmVudCcpXSxcblxuICBbJ2NvbXBvbmVudC5mb3JtYXRpYycsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9mb3JtYXRpYycpXSxcbiAgWydjb21wb25lbnQucm9vdCcsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9yb290JyldLFxuICBbJ2NvbXBvbmVudC5maWVsZCcsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZCcpXSxcbiAgWydjb21wb25lbnQubGFiZWwnLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvbGFiZWwnKV0sXG4gIFsnY29tcG9uZW50LmhlbHAnLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscCcpXSxcbiAgWydjb21wb25lbnQuc2FtcGxlJywgcmVxdWlyZSgnLi9jb21wb25lbnRzL3NhbXBsZScpXSxcbiAgWydjb21wb25lbnQuZmllbGRzZXQnLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzZXQnKV0sXG4gIFsnY29tcG9uZW50LnRleHQnLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvdGV4dCcpXSxcbiAgWydjb21wb25lbnQudGV4dGFyZWEnLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvdGV4dGFyZWEnKV0sXG4gIFsnY29tcG9uZW50LnNlbGVjdCcsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9zZWxlY3QnKV0sXG4gIFsnY29tcG9uZW50Lmxpc3QnLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvbGlzdCcpXSxcbiAgWydjb21wb25lbnQubGlzdC1jb250cm9sJywgcmVxdWlyZSgnLi9jb21wb25lbnRzL2xpc3QtY29udHJvbCcpXSxcbiAgWydjb21wb25lbnQubGlzdC1pdGVtJywgcmVxdWlyZSgnLi9jb21wb25lbnRzL2xpc3QtaXRlbScpXSxcbiAgWydjb21wb25lbnQubGlzdC1pdGVtLXZhbHVlJywgcmVxdWlyZSgnLi9jb21wb25lbnRzL2xpc3QtaXRlbS12YWx1ZScpXSxcbiAgWydjb21wb25lbnQubGlzdC1pdGVtLWNvbnRyb2wnLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvbGlzdC1pdGVtLWNvbnRyb2wnKV0sXG4gIFsnY29tcG9uZW50Lml0ZW0tY2hvaWNlcycsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9pdGVtLWNob2ljZXMnKV0sXG4gIFsnY29tcG9uZW50LmFkZC1pdGVtJywgcmVxdWlyZSgnLi9jb21wb25lbnRzL2FkZC1pdGVtJyldLFxuICBbJ2NvbXBvbmVudC5yZW1vdmUtaXRlbScsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9yZW1vdmUtaXRlbScpXSxcbiAgWydjb21wb25lbnQubW92ZS1pdGVtLWJhY2snLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvbW92ZS1pdGVtLWJhY2snKV0sXG4gIFsnY29tcG9uZW50Lm1vdmUtaXRlbS1mb3J3YXJkJywgcmVxdWlyZSgnLi9jb21wb25lbnRzL21vdmUtaXRlbS1mb3J3YXJkJyldLFxuICBbJ2NvbXBvbmVudC5qc29uJywgcmVxdWlyZSgnLi9jb21wb25lbnRzL2pzb24nKV0sXG4gIFsnY29tcG9uZW50LmNoZWNrYm94LWxpc3QnLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvY2hlY2tib3gtbGlzdCcpXSxcbiAgWydjb21wb25lbnQucHJldHR5LXRleHRhcmVhJywgcmVxdWlyZSgnLi9jb21wb25lbnRzL3ByZXR0eS10ZXh0YXJlYScpXSxcbiAgWydjb21wb25lbnQuY2hvaWNlcycsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9jaG9pY2VzJyldLFxuXG4gIFsnbWl4aW4uY2xpY2stb3V0c2lkZScsIHJlcXVpcmUoJy4vbWl4aW5zL2NsaWNrLW91dHNpZGUnKV0sXG4gIFsnbWl4aW4uZmllbGQnLCByZXF1aXJlKCcuL21peGlucy9maWVsZCcpXSxcbiAgWydtaXhpbi5pbnB1dC1hY3Rpb25zJywgcmVxdWlyZSgnLi9taXhpbnMvaW5wdXQtYWN0aW9ucycpXSxcbiAgWydtaXhpbi5yZXNpemUnLCByZXF1aXJlKCcuL21peGlucy9yZXNpemUnKV0sXG4gIFsnbWl4aW4uc2Nyb2xsJywgcmVxdWlyZSgnLi9taXhpbnMvc2Nyb2xsJyldLFxuICBbJ21peGluLnVuZG8tc3RhY2snLCByZXF1aXJlKCcuL21peGlucy91bmRvLXN0YWNrJyldLFxuXG4gIFsnYm9vdHN0cmFwLXN0eWxlJywgcmVxdWlyZSgnLi9wbHVnaW5zL2Jvb3RzdHJhcC1zdHlsZScpXSxcbiAgWydkZWZhdWx0LXN0eWxlJywgcmVxdWlyZSgnLi9wbHVnaW5zL2RlZmF1bHQtc3R5bGUnKV1cbik7XG5cbi8vIENyZWF0ZSB0aGUgZGVmYXVsdCBmb3JtYXRpYyBpbnN0YW5jZS5cbi8vdmFyIGRlZmF1bHRDb3JlID0gRm9ybWF0aWMoKTtcblxuLy8gRXhwb3J0IGl0IVxuLy9tb2R1bGUuZXhwb3J0cyA9IGRlZmF1bHRGb3JtYXRpYztcblxudmFyIGNyZWF0ZUZvcm1hdGljQ29tcG9uZW50Q2xhc3MgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgdmFyIGNvcmUgPSBjcmVhdGVGb3JtYXRpY0NvcmUoY29uZmlnKTtcblxuICByZXR1cm4gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZGlzcGxheU5hbWU6ICdGb3JtYXRpYycsXG5cbiAgICBzdGF0aWNzOiB7XG4gICAgICBjb25maWc6IGNyZWF0ZUZvcm1hdGljQ29tcG9uZW50Q2xhc3MsXG4gICAgICBmb3JtOiBjb3JlLFxuICAgICAgcGx1Z2luOiBjb3JlLnBsdWdpblxuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBmb3JtID0gdGhpcy5wcm9wcy5mb3JtIHx8IHRoaXMucHJvcHMuZGVmYXVsdEZvcm07XG4gICAgICByZXR1cm4ge1xuICAgICAgICBmb3JtOiBmb3JtLFxuICAgICAgICBmaWVsZDogZm9ybS5maWVsZCgpLFxuICAgICAgICBjb250cm9sbGVkOiB0aGlzLnByb3BzLmZvcm0gPyB0cnVlIDogZmFsc2VcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBmb3JtID0gdGhpcy5zdGF0ZS5mb3JtO1xuICAgICAgaWYgKCFmb3JtKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTXVzdCBzdXBwbHkgYSBmb3JtIG9yIGRlZmF1bHRGb3JtLicpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuc3RhdGUuY29udHJvbGxlZCkge1xuICAgICAgICBmb3JtLm9uY2UoJ2NoYW5nZScsIHRoaXMub25Gb3JtQ2hhbmdlZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3JtLm9uKCdjaGFuZ2UnLCB0aGlzLm9uRm9ybUNoYW5nZWQpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBvbkZvcm1DaGFuZ2VkOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHRoaXMucHJvcHMuZm9ybS52YWwoKSk7XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMuc3RhdGUuY29udHJvbGxlZCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBmaWVsZDogdGhpcy5zdGF0ZS5mb3JtLmZpZWxkKClcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZm9ybSA9IHRoaXMuc3RhdGUuZm9ybTtcbiAgICAgIGlmIChmb3JtKSB7XG4gICAgICAgIGZvcm0ub2ZmKCdjaGFuZ2UnLCB0aGlzLm9uRm9ybUNoYW5nZWQpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV4dFByb3BzKSB7XG4gICAgICBpZiAodGhpcy5zdGF0ZS5jb250cm9sbGVkKSB7XG4gICAgICAgIGlmICghbmV4dFByb3BzLmZvcm0pIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ011c3Qgc3VwcGx5IGEgbmV3IGZvcm0gZm9yIGEgY29udHJvbGxlZCBjb21wb25lbnQuJyk7XG4gICAgICAgIH1cbiAgICAgICAgbmV4dFByb3BzLmZvcm0ub25jZSgnY2hhbmdlJywgdGhpcy5vbkZvcm1DaGFuZ2VkKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgZm9ybTogbmV4dFByb3BzLmZvcm0sXG4gICAgICAgICAgZmllbGQ6IG5leHRQcm9wcy5mb3JtLmZpZWxkKClcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6ICdmb3JtYXRpYyd9LFxuICAgICAgICB0aGlzLnN0YXRlLmZpZWxkLmNvbXBvbmVudCgpXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUZvcm1hdGljQ29tcG9uZW50Q2xhc3MoKTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBtaXhpbi5jbGljay1vdXRzaWRlXG5cbi8qXG5UaGVyZSdzIG5vIG5hdGl2ZSBSZWFjdCB3YXkgdG8gZGV0ZWN0IGNsaWNraW5nIG91dHNpZGUgYW4gZWxlbWVudC4gU29tZXRpbWVzXG50aGlzIGlzIHVzZWZ1bCwgc28gdGhhdCdzIHdoYXQgdGhpcyBtaXhpbiBkb2VzLiBUbyB1c2UgaXQsIG1peCBpdCBpbiBhbmQgdXNlIGl0XG5mcm9tIHlvdXIgY29tcG9uZW50IGxpa2UgdGhpczpcblxuYGBganNcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIG1peGluczogW3BsdWdpbi5yZXF1aXJlKCdtaXhpbi5jbGljay1vdXRzaWRlJyldLFxuXG4gICAgb25DbGlja091dHNpZGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdjbGlja2VkIG91dHNpZGUhJyk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNldE9uQ2xpY2tPdXRzaWRlKCdteURpdicsIHRoaXMub25DbGlja091dHNpZGUpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBSZWFjdC5ET00uZGl2KHtyZWY6ICdteURpdid9LFxuICAgICAgICAnSGVsbG8hJ1xuICAgICAgKVxuICAgIH1cbiAgfSk7XG59O1xuYGBgXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG52YXIgaGFzQW5jZXN0b3IgPSBmdW5jdGlvbiAoY2hpbGQsIHBhcmVudCkge1xuICBpZiAoY2hpbGQucGFyZW50Tm9kZSA9PT0gcGFyZW50KSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgaWYgKGNoaWxkLnBhcmVudE5vZGUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIGhhc0FuY2VzdG9yKGNoaWxkLnBhcmVudE5vZGUsIHBhcmVudCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IHtcblxuICAgIC8vIF9vbkNsaWNrRG9jdW1lbnQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgLy8gICBjb25zb2xlLmxvZygnY2xpY2sgZG9jJylcbiAgICAvLyAgIGlmICh0aGlzLl9kaWRNb3VzZURvd24pIHtcbiAgICAvLyAgICAgXy5lYWNoKHRoaXMuY2xpY2tPdXRzaWRlSGFuZGxlcnMsIGZ1bmN0aW9uIChmdW5jcywgcmVmKSB7XG4gICAgLy8gICAgICAgaWYgKGlzT3V0c2lkZShldmVudC50YXJnZXQsIHRoaXMucmVmc1tyZWZdLmdldERPTU5vZGUoKSkpIHtcbiAgICAvLyAgICAgICAgIGZ1bmNzLmZvckVhY2goZnVuY3Rpb24gKGZuKSB7XG4gICAgLy8gICAgICAgICAgIGZuLmNhbGwodGhpcyk7XG4gICAgLy8gICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIC8vICAgICAgIH1cbiAgICAvLyAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAvLyAgIH1cbiAgICAvLyB9LFxuXG4gICAgaXNOb2RlT3V0c2lkZTogZnVuY3Rpb24gKG5vZGVPdXQsIG5vZGVJbikge1xuICAgICAgaWYgKG5vZGVPdXQgPT09IG5vZGVJbikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAoaGFzQW5jZXN0b3Iobm9kZU91dCwgbm9kZUluKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuXG4gICAgaXNOb2RlSW5zaWRlOiBmdW5jdGlvbiAobm9kZUluLCBub2RlT3V0KSB7XG4gICAgICByZXR1cm4gIXRoaXMuaXNOb2RlT3V0c2lkZShub2RlSW4sIG5vZGVPdXQpO1xuICAgIH0sXG5cbiAgICBfb25DbGlja01vdXNlZG93bjogZnVuY3Rpb24oKSB7XG4gICAgICAvL3RoaXMuX2RpZE1vdXNlRG93biA9IHRydWU7XG4gICAgICBfLmVhY2godGhpcy5jbGlja091dHNpZGVIYW5kbGVycywgZnVuY3Rpb24gKGZ1bmNzLCByZWYpIHtcbiAgICAgICAgaWYgKHRoaXMucmVmc1tyZWZdKSB7XG4gICAgICAgICAgdGhpcy5fbW91c2Vkb3duUmVmc1tyZWZdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuXG4gICAgX29uQ2xpY2tNb3VzZXVwOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIF8uZWFjaCh0aGlzLmNsaWNrT3V0c2lkZUhhbmRsZXJzLCBmdW5jdGlvbiAoZnVuY3MsIHJlZikge1xuICAgICAgICBpZiAodGhpcy5yZWZzW3JlZl0gJiYgdGhpcy5fbW91c2Vkb3duUmVmc1tyZWZdKSB7XG4gICAgICAgICAgaWYgKHRoaXMuaXNOb2RlT3V0c2lkZShldmVudC50YXJnZXQsIHRoaXMucmVmc1tyZWZdLmdldERPTU5vZGUoKSkpIHtcbiAgICAgICAgICAgIGZ1bmNzLmZvckVhY2goZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICAgIGZuLmNhbGwodGhpcywgZXZlbnQpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fbW91c2Vkb3duUmVmc1tyZWZdID0gZmFsc2U7XG4gICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0sXG5cbiAgICAvLyBfb25DbGlja0RvY3VtZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgLy8gICBjb25zb2xlLmxvZygnY2xpY2tldHknKVxuICAgIC8vICAgXy5lYWNoKHRoaXMuY2xpY2tPdXRzaWRlSGFuZGxlcnMsIGZ1bmN0aW9uIChmdW5jcywgcmVmKSB7XG4gICAgLy8gICAgIGNvbnNvbGUubG9nKCdjbGlja2V0eScsIHJlZiwgdGhpcy5yZWZzW3JlZl0pXG4gICAgLy8gICB9LmJpbmQodGhpcykpO1xuICAgIC8vIH0sXG5cbiAgICBzZXRPbkNsaWNrT3V0c2lkZTogZnVuY3Rpb24gKHJlZiwgZm4pIHtcbiAgICAgIGlmICghdGhpcy5jbGlja091dHNpZGVIYW5kbGVyc1tyZWZdKSB7XG4gICAgICAgIHRoaXMuY2xpY2tPdXRzaWRlSGFuZGxlcnNbcmVmXSA9IFtdO1xuICAgICAgfVxuICAgICAgdGhpcy5jbGlja091dHNpZGVIYW5kbGVyc1tyZWZdLnB1c2goZm4pO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5jbGlja091dHNpZGVIYW5kbGVycyA9IHt9O1xuICAgICAgdGhpcy5fZGlkTW91c2VEb3duID0gZmFsc2U7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9vbkNsaWNrTW91c2Vkb3duKTtcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9vbkNsaWNrTW91c2V1cCk7XG4gICAgICAvL2RvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fb25DbGlja0RvY3VtZW50KTtcbiAgICAgIHRoaXMuX21vdXNlZG93blJlZnMgPSB7fTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuY2xpY2tPdXRzaWRlSGFuZGxlcnMgPSB7fTtcbiAgICAgIC8vZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkNsaWNrRG9jdW1lbnQpO1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX29uQ2xpY2tNb3VzZXVwKTtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX29uQ2xpY2tNb3VzZWRvd24pO1xuICAgIH1cbiAgfTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgbWl4aW4uZmllbGRcblxuLypcbldyYXAgdXAgeW91ciBmaWVsZHMgd2l0aCB0aGlzIG1peGluIHRvIGdldDpcbi0gQXV0b21hdGljIG1ldGFkYXRhIGxvYWRpbmcuXG4tIEFueXRoaW5nIGVsc2UgZGVjaWRlZCBsYXRlci5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0ge1xuXG4gICAgbG9hZE5lZWRlZE1ldGE6IGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgaWYgKHByb3BzLmZpZWxkICYmIHByb3BzLmZpZWxkLmZvcm0pIHtcbiAgICAgICAgaWYgKHByb3BzLmZpZWxkLmRlZi5uZWVkc01ldGEgJiYgcHJvcHMuZmllbGQuZGVmLm5lZWRzTWV0YS5sZW5ndGggPiAwKSB7XG5cbiAgICAgICAgICB2YXIgbmVlZHNNZXRhID0gW107XG5cbiAgICAgICAgICBwcm9wcy5maWVsZC5kZWYubmVlZHNNZXRhLmZvckVhY2goZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICAgICAgICAgIGlmIChfLmlzQXJyYXkoYXJncykgJiYgYXJncy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgIGlmIChfLmlzQXJyYXkoYXJnc1swXSkpIHtcbiAgICAgICAgICAgICAgICBhcmdzLmZvckVhY2goZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICAgIG5lZWRzTWV0YS5wdXNoKGFyZ3MpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5lZWRzTWV0YS5wdXNoKGFyZ3MpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBpZiAobmVlZHNNZXRhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgLy8gTXVzdCBqdXN0IGJlIGEgc2luZ2xlIG5lZWQsIGFuZCBub3QgYW4gYXJyYXkuXG4gICAgICAgICAgICBuZWVkc01ldGEgPSBbcHJvcHMuZmllbGQuZGVmLm5lZWRzTWV0YV07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbmVlZHNNZXRhLmZvckVhY2goZnVuY3Rpb24gKG5lZWRzKSB7XG4gICAgICAgICAgICBpZiAobmVlZHMpIHtcbiAgICAgICAgICAgICAgcHJvcHMuZmllbGQuZm9ybS5sb2FkTWV0YS5hcHBseShwcm9wcy5maWVsZC5mb3JtLCBuZWVkcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMubG9hZE5lZWRlZE1ldGEodGhpcy5wcm9wcyk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXh0UHJvcHMpIHtcbiAgICAgIHRoaXMubG9hZE5lZWRlZE1ldGEobmV4dFByb3BzKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vIFJlbW92aW5nIHRoaXMgYXMgaXQncyBhIGJhZCBpZGVhLCBiZWNhdXNlIHVubW91bnRpbmcgYSBjb21wb25lbnQgaXMgbm90XG4gICAgICAvLyBhbHdheXMgYSBzaWduYWwgdG8gcmVtb3ZlIHRoZSBmaWVsZC4gV2lsbCBoYXZlIHRvIGZpbmQgYSBiZXR0ZXIgd2F5LlxuXG4gICAgICAvLyBpZiAodGhpcy5wcm9wcy5maWVsZCkge1xuICAgICAgLy8gICB0aGlzLnByb3BzLmZpZWxkLmVyYXNlKCk7XG4gICAgICAvLyB9XG4gICAgfVxuICB9O1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiLy8gIyBtaXhpbi5pbnB1dC1hY3Rpb25zXG5cbi8qXG5DdXJyZW50bHkgdW51c2VkLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IHtcblxuICAgIG9uRm9jdXM6IGZ1bmN0aW9uICgpIHtcblxuICAgIH0sXG5cbiAgICBvbkJsdXI6IGZ1bmN0aW9uICgpIHtcblxuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gKCkge1xuXG4gICAgfVxuICB9O1xufTtcbiIsIi8vICMgbWl4aW4ucmVzaXplXG5cbi8qXG5Zb3UnZCB0aGluayBpdCB3b3VsZCBiZSBwcmV0dHkgZWFzeSB0byBkZXRlY3Qgd2hlbiBhIERPTSBlbGVtZW50IGlzIHJlc2l6ZWQuXG5BbmQgeW91J2QgYmUgd3JvbmcuIFRoZXJlIGFyZSB2YXJpb3VzIHRyaWNrcywgYnV0IG5vbmUgb2YgdGhlbSB3b3JrIHZlcnkgd2VsbC5cblNvLCB1c2luZyBnb29kIG9sJyBwb2xsaW5nIGhlcmUuIFRvIHRyeSB0byBiZSBhcyBlZmZpY2llbnQgYXMgcG9zc2libGUsIHRoZXJlXG5pcyBvbmx5IGEgc2luZ2xlIHNldEludGVydmFsIHVzZWQgZm9yIGFsbCBlbGVtZW50cy4gVG8gdXNlOlxuXG5gYGBqc1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgbWl4aW5zOiBbcGx1Z2luLnJlcXVpcmUoJ21peGluLnJlc2l6ZScpXSxcblxuICAgIG9uUmVzaXplOiBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zb2xlLmxvZygncmVzaXplZCEnKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuc2V0T25SZXNpemUoJ215VGV4dCcsIHRoaXMub25SZXNpemUpO1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gKCkge1xuICAgICAgLi4uXG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIFJlYWN0LkRPTS50ZXh0YXJlYSh7cmVmOiAnbXlUZXh0JywgdmFsdWU6IHRoaXMucHJvcHMudmFsdWUsIG9uQ2hhbmdlOiAuLi59KVxuICAgIH1cbiAgfSk7XG59O1xuYGBgXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBpZCA9IDA7XG5cbnZhciByZXNpemVJbnRlcnZhbEVsZW1lbnRzID0ge307XG52YXIgcmVzaXplSW50ZXJ2YWxFbGVtZW50c0NvdW50ID0gMDtcbnZhciByZXNpemVJbnRlcnZhbFRpbWVyID0gbnVsbDtcblxudmFyIGNoZWNrRWxlbWVudHMgPSBmdW5jdGlvbiAoKSB7XG4gIE9iamVjdC5rZXlzKHJlc2l6ZUludGVydmFsRWxlbWVudHMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIHZhciBlbGVtZW50ID0gcmVzaXplSW50ZXJ2YWxFbGVtZW50c1trZXldO1xuICAgIGlmIChlbGVtZW50LmNsaWVudFdpZHRoICE9PSBlbGVtZW50Ll9fcHJldkNsaWVudFdpZHRoIHx8IGVsZW1lbnQuY2xpZW50SGVpZ2h0ICE9PSBlbGVtZW50Ll9fcHJldkNsaWVudEhlaWdodCkge1xuICAgICAgZWxlbWVudC5fX3ByZXZDbGllbnRXaWR0aCA9IGVsZW1lbnQuY2xpZW50V2lkdGg7XG4gICAgICBlbGVtZW50Ll9fcHJldkNsaWVudEhlaWdodCA9IGVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgICAgdmFyIGhhbmRsZXJzID0gZWxlbWVudC5fX3Jlc2l6ZUhhbmRsZXJzO1xuICAgICAgaGFuZGxlcnMuZm9yRWFjaChmdW5jdGlvbiAoaGFuZGxlcikge1xuICAgICAgICBoYW5kbGVyKCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sIDEwMCk7XG59O1xuXG52YXIgYWRkUmVzaXplSW50ZXJ2YWxIYW5kbGVyID0gZnVuY3Rpb24gKGVsZW1lbnQsIGZuKSB7XG4gIGlmIChyZXNpemVJbnRlcnZhbFRpbWVyID09PSBudWxsKSB7XG4gICAgcmVzaXplSW50ZXJ2YWxUaW1lciA9IHNldEludGVydmFsKGNoZWNrRWxlbWVudHMsIDEwMCk7XG4gIH1cbiAgaWYgKCEoJ19fcmVzaXplSWQnIGluIGVsZW1lbnQpKSB7XG4gICAgaWQrKztcbiAgICBlbGVtZW50Ll9fcHJldkNsaWVudFdpZHRoID0gZWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICBlbGVtZW50Ll9fcHJldkNsaWVudEhlaWdodCA9IGVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgIGVsZW1lbnQuX19yZXNpemVJZCA9IGlkO1xuICAgIHJlc2l6ZUludGVydmFsRWxlbWVudHNDb3VudCsrO1xuICAgIHJlc2l6ZUludGVydmFsRWxlbWVudHNbaWRdID0gZWxlbWVudDtcbiAgICBlbGVtZW50Ll9fcmVzaXplSGFuZGxlcnMgPSBbXTtcbiAgfVxuICBlbGVtZW50Ll9fcmVzaXplSGFuZGxlcnMucHVzaChmbik7XG59O1xuXG52YXIgcmVtb3ZlUmVzaXplSW50ZXJ2YWxIYW5kbGVycyA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIGlmICghKCdfX3Jlc2l6ZUlkJyBpbiBlbGVtZW50KSkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgaWQgPSBlbGVtZW50Ll9fcmVzaXplSWQ7XG4gIGRlbGV0ZSBlbGVtZW50Ll9fcmVzaXplSWQ7XG4gIGRlbGV0ZSBlbGVtZW50Ll9fcmVzaXplSGFuZGxlcnM7XG4gIGRlbGV0ZSByZXNpemVJbnRlcnZhbEVsZW1lbnRzW2lkXTtcbiAgcmVzaXplSW50ZXJ2YWxFbGVtZW50c0NvdW50LS07XG4gIGlmIChyZXNpemVJbnRlcnZhbEVsZW1lbnRzQ291bnQgPCAxKSB7XG4gICAgY2xlYXJJbnRlcnZhbChyZXNpemVJbnRlcnZhbFRpbWVyKTtcbiAgICByZXNpemVJbnRlcnZhbFRpbWVyID0gbnVsbDtcbiAgfVxufTtcblxudmFyIG9uUmVzaXplID0gZnVuY3Rpb24gKHJlZiwgZm4pIHtcbiAgZm4ocmVmKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0ge1xuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLm9uUmVzaXplV2luZG93KSB7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLm9uUmVzaXplV2luZG93KTtcbiAgICAgIH1cbiAgICAgIHRoaXMucmVzaXplRWxlbWVudFJlZnMgPSB7fTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLm9uUmVzaXplV2luZG93KSB7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLm9uUmVzaXplV2luZG93KTtcbiAgICAgIH1cbiAgICAgIE9iamVjdC5rZXlzKHRoaXMucmVzaXplRWxlbWVudFJlZnMpLmZvckVhY2goZnVuY3Rpb24gKHJlZikge1xuICAgICAgICByZW1vdmVSZXNpemVJbnRlcnZhbEhhbmRsZXJzKHRoaXMucmVmc1tyZWZdLmdldERPTU5vZGUoKSk7XG4gICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0sXG5cbiAgICBzZXRPblJlc2l6ZTogZnVuY3Rpb24gKHJlZiwgZm4pIHtcbiAgICAgIGlmICghdGhpcy5yZXNpemVFbGVtZW50UmVmc1tyZWZdKSB7XG4gICAgICAgIHRoaXMucmVzaXplRWxlbWVudFJlZnNbcmVmXSA9IHRydWU7XG4gICAgICB9XG4gICAgICBhZGRSZXNpemVJbnRlcnZhbEhhbmRsZXIodGhpcy5yZWZzW3JlZl0uZ2V0RE9NTm9kZSgpLCBvblJlc2l6ZS5iaW5kKHRoaXMsIHJlZiwgZm4pKTtcbiAgICB9XG4gIH07XG59O1xuIiwiLy8gIyBtaXhpbi5zY3JvbGxcblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IHtcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5vblNjcm9sbFdpbmRvdykge1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdGhpcy5vblNjcm9sbFdpbmRvdyk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5vblNjcm9sbFdpbmRvdykge1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdGhpcy5vblNjcm9sbFdpbmRvdyk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufTtcbiIsIi8vICMgbWl4aW4udW5kby1zdGFja1xuXG4vKlxuR2l2ZXMgeW91ciBjb21wb25lbnQgYW4gdW5kbyBzdGFjay5cbiovXG5cbi8vIGh0dHA6Ly9wcm9tZXRoZXVzcmVzZWFyY2guZ2l0aHViLmlvL3JlYWN0LWZvcm1zL2V4YW1wbGVzL3VuZG8uaHRtbFxuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBVbmRvU3RhY2sgPSB7XG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHt1bmRvOiBbXSwgcmVkbzogW119O1xuICB9LFxuXG4gIHNuYXBzaG90OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdW5kbyA9IHRoaXMuc3RhdGUudW5kby5jb25jYXQodGhpcy5nZXRTdGF0ZVNuYXBzaG90KCkpO1xuICAgIGlmICh0eXBlb2YgdGhpcy5zdGF0ZS51bmRvRGVwdGggPT09ICdudW1iZXInKSB7XG4gICAgICBpZiAodW5kby5sZW5ndGggPiB0aGlzLnN0YXRlLnVuZG9EZXB0aCkge1xuICAgICAgICB1bmRvLnNoaWZ0KCk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuc2V0U3RhdGUoe3VuZG86IHVuZG8sIHJlZG86IFtdfSk7XG4gIH0sXG5cbiAgaGFzVW5kbzogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUudW5kby5sZW5ndGggPiAwO1xuICB9LFxuXG4gIGhhc1JlZG86IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnJlZG8ubGVuZ3RoID4gMDtcbiAgfSxcblxuICByZWRvOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl91bmRvSW1wbCh0cnVlKTtcbiAgfSxcblxuICB1bmRvOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl91bmRvSW1wbCgpO1xuICB9LFxuXG4gIF91bmRvSW1wbDogZnVuY3Rpb24oaXNSZWRvKSB7XG4gICAgdmFyIHVuZG8gPSB0aGlzLnN0YXRlLnVuZG8uc2xpY2UoMCk7XG4gICAgdmFyIHJlZG8gPSB0aGlzLnN0YXRlLnJlZG8uc2xpY2UoMCk7XG4gICAgdmFyIHNuYXBzaG90O1xuXG4gICAgaWYgKGlzUmVkbykge1xuICAgICAgaWYgKHJlZG8ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHNuYXBzaG90ID0gcmVkby5wb3AoKTtcbiAgICAgIHVuZG8ucHVzaCh0aGlzLmdldFN0YXRlU25hcHNob3QoKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh1bmRvLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBzbmFwc2hvdCA9IHVuZG8ucG9wKCk7XG4gICAgICByZWRvLnB1c2godGhpcy5nZXRTdGF0ZVNuYXBzaG90KCkpO1xuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGVTbmFwc2hvdChzbmFwc2hvdCk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7dW5kbzp1bmRvLCByZWRvOnJlZG99KTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG4gIHBsdWdpbi5leHBvcnRzID0gVW5kb1N0YWNrO1xufTtcbiIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgYm9vdHN0cmFwXG5cbi8qXG5UaGUgYm9vdHN0cmFwIHBsdWdpbiBidW5kbGUgZXhwb3J0cyBhIGJ1bmNoIG9mIFwicHJvcCBtb2RpZmllclwiIHBsdWdpbnMgd2hpY2hcbm1hbmlwdWxhdGUgdGhlIHByb3BzIGdvaW5nIGludG8gbWFueSBvZiB0aGUgY29tcG9uZW50cy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbnZhciBtb2RpZmllcnMgPSB7XG5cbiAgJ2ZpZWxkJzoge2NsYXNzTmFtZTogJ2Zvcm0tZ3JvdXAnfSxcbiAgJ2hlbHAnOiB7Y2xhc3NOYW1lOiAnaGVscC1ibG9jayd9LFxuICAnc2FtcGxlJzoge2NsYXNzTmFtZTogJ2hlbHAtYmxvY2snfSxcbiAgJ3RleHQnOiB7Y2xhc3NOYW1lOiAnZm9ybS1jb250cm9sJ30sXG4gICd0ZXh0YXJlYSc6IHtjbGFzc05hbWU6ICdmb3JtLWNvbnRyb2wnfSxcbiAgJ3ByZXR0eS10ZXh0YXJlYSc6IHtjbGFzc05hbWU6ICdmb3JtLWNvbnRyb2wnfSxcbiAgJ2pzb24nOiB7Y2xhc3NOYW1lOiAnZm9ybS1jb250cm9sJ30sXG4gICdzZWxlY3QnOiB7Y2xhc3NOYW1lOiAnZm9ybS1jb250cm9sJ30sXG4gIC8vJ2xpc3QnOiB7Y2xhc3NOYW1lOiAnd2VsbCd9LFxuICAnbGlzdC1jb250cm9sJzoge2NsYXNzTmFtZTogJ2Zvcm0taW5saW5lJ30sXG4gICdsaXN0LWl0ZW0nOiB7Y2xhc3NOYW1lOiAnd2VsbCd9LFxuICAnaXRlbS1jaG9pY2VzJzoge2NsYXNzTmFtZTogJ2Zvcm0tY29udHJvbCd9LFxuICAnYWRkLWl0ZW0nOiB7Y2xhc3NOYW1lOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1wbHVzJywgbGFiZWw6ICcnfSxcbiAgJ3JlbW92ZS1pdGVtJzoge2NsYXNzTmFtZTogJ2dseXBoaWNvbiBnbHlwaGljb24tcmVtb3ZlJywgbGFiZWw6ICcnfSxcbiAgJ21vdmUtaXRlbS1iYWNrJzoge2NsYXNzTmFtZTogJ2dseXBoaWNvbiBnbHlwaGljb24tYXJyb3ctdXAnLCBsYWJlbDogJyd9LFxuICAnbW92ZS1pdGVtLWZvcndhcmQnOiB7Y2xhc3NOYW1lOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1hcnJvdy1kb3duJywgbGFiZWw6ICcnfVxufTtcblxuLy8gQnVpbGQgdGhlIHBsdWdpbiBidW5kbGUuXG5fLmVhY2gobW9kaWZpZXJzLCBmdW5jdGlvbiAobW9kaWZpZXIsIG5hbWUpIHtcblxuICBleHBvcnRzWydjb21wb25lbnQtcHJvcHMuJyArIG5hbWUgKyAnLmJvb3RzdHJhcCddID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gICAgdmFyIHV0aWwgPSBwbHVnaW4ucmVxdWlyZSgndXRpbCcpO1xuXG4gICAgcGx1Z2luLmV4cG9ydHMgPSBbXG4gICAgICBuYW1lLFxuICAgICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIGlmICghXy5pc1VuZGVmaW5lZChtb2RpZmllci5jbGFzc05hbWUpKSB7XG4gICAgICAgICAgcHJvcHMuY2xhc3NOYW1lID0gdXRpbC5jbGFzc05hbWUocHJvcHMuY2xhc3NOYW1lLCBtb2RpZmllci5jbGFzc05hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghXy5pc1VuZGVmaW5lZChtb2RpZmllci5sYWJlbCkpIHtcbiAgICAgICAgICBwcm9wcy5sYWJlbCA9IG1vZGlmaWVyLmxhYmVsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgXTtcbiAgfTtcblxufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgZGVmYXVsdC1zdHlsZVxuXG4vKlxuVGhlIGRlZmF1bHQtc3R5bGUgcGx1Z2luIGJ1bmRsZSBleHBvcnRzIGEgYnVuY2ggb2YgXCJwcm9wIG1vZGlmaWVyXCIgcGx1Z2lucyB3aGljaFxubWFuaXB1bGF0ZSB0aGUgcHJvcHMgZ29pbmcgaW50byBtYW55IG9mIHRoZSBjb21wb25lbnRzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxudmFyIG1vZGlmaWVycyA9IHtcblxuICAnZmllbGQnOiB7fSxcbiAgJ2hlbHAnOiB7fSxcbiAgJ3NhbXBsZSc6IHt9LFxuICAndGV4dCc6IHt9LFxuICAndGV4dGFyZWEnOiB7fSxcbiAgJ3ByZXR0eS10ZXh0YXJlYSc6IHt9LFxuICAnanNvbic6IHt9LFxuICAnc2VsZWN0Jzoge30sXG4gICdsaXN0Jzoge30sXG4gICdsaXN0LWNvbnRyb2wnOiB7fSxcbiAgJ2xpc3QtaXRlbS1jb250cm9sJzoge30sXG4gICdsaXN0LWl0ZW0tdmFsdWUnOiB7fSxcbiAgJ2xpc3QtaXRlbSc6IHt9LFxuICAnaXRlbS1jaG9pY2VzJzoge30sXG4gICdhZGQtaXRlbSc6IHt9LFxuICAncmVtb3ZlLWl0ZW0nOiB7fSxcbiAgJ21vdmUtaXRlbS1iYWNrJzoge30sXG4gICdtb3ZlLWl0ZW0tZm9yd2FyZCc6IHt9XG59O1xuXG4vLyBCdWlsZCB0aGUgcGx1Z2luIGJ1bmRsZS5cbl8uZWFjaChtb2RpZmllcnMsIGZ1bmN0aW9uIChtb2RpZmllciwgbmFtZSkge1xuXG4gIGV4cG9ydHNbJ2NvbXBvbmVudC1wcm9wcy4nICsgbmFtZSArICcuZGVmYXVsdCddID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gICAgdmFyIHV0aWwgPSBwbHVnaW4ucmVxdWlyZSgndXRpbCcpO1xuXG4gICAgcGx1Z2luLmV4cG9ydHMgPSBbXG4gICAgICBuYW1lLFxuICAgICAgZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgIHByb3BzLmNsYXNzTmFtZSA9IHV0aWwuY2xhc3NOYW1lKHByb3BzLmNsYXNzTmFtZSwgbmFtZSk7XG4gICAgICB9XG4gICAgXTtcbiAgfTtcblxufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgc3RvcmUubWVtb3J5XG5cbi8qXG5UaGUgbWVtb3J5IHN0b3JlIHBsdWdpbiBrZWVwcyB0aGUgc3RhdGUgb2YgZmllbGRzLCBkYXRhLCBhbmQgbWV0YWRhdGEuIEl0XG5yZXNwb25kcyB0byBhY3Rpb25zIGFuZCBlbWl0cyBhIGNoYW5nZSBldmVudCBpZiB0aGVyZSBhcmUgYW55IGNoYW5nZXMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICB2YXIgY29tcGlsZXIgPSBwbHVnaW4ucmVxdWlyZSgnY29tcGlsZXInKTtcbiAgdmFyIHV0aWwgPSBwbHVnaW4ucmVxdWlyZSgndXRpbCcpO1xuXG4gIHBsdWdpbi5leHBvcnRzID0gZnVuY3Rpb24gKGZvcm0sIGVtaXR0ZXIsIG9wdGlvbnMpIHtcblxuICAgIHZhciBzdG9yZSA9IHt9O1xuXG4gICAgc3RvcmUuZmllbGRzID0gW107XG4gICAgc3RvcmUudGVtcGxhdGVNYXAgPSB7fTtcbiAgICBzdG9yZS52YWx1ZSA9IHt9O1xuICAgIHN0b3JlLm1ldGEgPSB7fTtcblxuICAgIC8vIEhlbHBlciB0byBzZXR1cCBmaWVsZHMuIEZpZWxkIGRlZmluaXRpb25zIG5lZWQgdG8gYmUgZXhwYW5kZWQsIGNvbXBpbGVkLFxuICAgIC8vIGV0Yy5cblxuICAgIHZhciBzZXR1cEZpZWxkcyA9IGZ1bmN0aW9uIChmaWVsZHMpIHtcbiAgICAgIHN0b3JlLmZpZWxkcyA9IGNvbXBpbGVyLmV4cGFuZEZpZWxkcyhmaWVsZHMpO1xuICAgICAgc3RvcmUuZmllbGRzID0gY29tcGlsZXIuY29tcGlsZUZpZWxkcyhzdG9yZS5maWVsZHMpO1xuICAgICAgc3RvcmUudGVtcGxhdGVNYXAgPSBjb21waWxlci50ZW1wbGF0ZU1hcChzdG9yZS5maWVsZHMpO1xuICAgICAgc3RvcmUuZmllbGRzID0gc3RvcmUuZmllbGRzLmZpbHRlcihmdW5jdGlvbiAoZGVmKSB7XG4gICAgICAgIHJldHVybiAhZGVmLnRlbXBsYXRlO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIGlmIChvcHRpb25zLmZpZWxkcykge1xuICAgICAgc2V0dXBGaWVsZHMob3B0aW9ucy5maWVsZHMpO1xuICAgIH1cblxuICAgIGlmICghXy5pc1VuZGVmaW5lZChvcHRpb25zLnZhbHVlKSkge1xuICAgICAgc3RvcmUudmFsdWUgPSB1dGlsLmNvcHlWYWx1ZShvcHRpb25zLnZhbHVlKTtcbiAgICB9XG5cbiAgICAvLyBDdXJyZW50bHksIGp1c3QgYSBzaW5nbGUgZXZlbnQgZm9yIGFueSBjaGFuZ2UuXG4gICAgdmFyIHVwZGF0ZSA9IGZ1bmN0aW9uIChjaGFuZ2luZykge1xuICAgICAgZW1pdHRlci5lbWl0KCdjaGFuZ2UnLCB7XG4gICAgICAgIHZhbHVlOiBzdG9yZS52YWx1ZSxcbiAgICAgICAgbWV0YTogc3RvcmUubWV0YSxcbiAgICAgICAgZmllbGRzOiBzdG9yZS5maWVsZHMsXG4gICAgICAgIGNoYW5naW5nOiBjaGFuZ2luZ1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIFdoZW4gZmllbGRzIGNoYW5nZSwgd2UgbmVlZCB0byBcImluZmxhdGVcIiB0aGVtLCBtZWFuaW5nIGV4cGFuZCB0aGVtIGFuZFxuICAgIC8vIHJ1biBhbnkgZXZhbHVhdGlvbnMgaW4gb3JkZXIgdG8gZ2V0IHRoZSBkZWZhdWx0IHZhbHVlIG91dC5cbiAgICBzdG9yZS5pbmZsYXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGZpZWxkID0gZm9ybS5maWVsZCgpO1xuICAgICAgZmllbGQuaW5mbGF0ZShmdW5jdGlvbiAocGF0aCwgdmFsdWUpIHtcbiAgICAgICAgc3RvcmUudmFsdWUgPSB1dGlsLnNldEluKHN0b3JlLnZhbHVlLCBwYXRoLCB2YWx1ZSk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgdmFyIGFjdGlvbnMgPSB7XG5cbiAgICAgIC8vIFNldCB2YWx1ZSBhdCBhIHBhdGguXG4gICAgICBzZXRWYWx1ZTogZnVuY3Rpb24gKHBhdGgsIHZhbHVlKSB7XG5cbiAgICAgICAgaWYgKF8uaXNVbmRlZmluZWQodmFsdWUpKSB7XG4gICAgICAgICAgdmFsdWUgPSBwYXRoO1xuICAgICAgICAgIHBhdGggPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBvbGRWYWx1ZSA9IHV0aWwuZ2V0SW4oc3RvcmUudmFsdWUsIHBhdGgpO1xuXG4gICAgICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHN0b3JlLnZhbHVlID0gdXRpbC5jb3B5VmFsdWUodmFsdWUpO1xuICAgICAgICAgIHN0b3JlLmluZmxhdGUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdG9yZS52YWx1ZSA9IHV0aWwuc2V0SW4oc3RvcmUudmFsdWUsIHBhdGgsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICB1cGRhdGUoeydwYXRoJzogcGF0aCwgJ25ldyc6IHZhbHVlLCAnb2xkJzogb2xkVmFsdWUsICdhY3Rpb24nOiAnc2V0J30pO1xuICAgICAgfSxcblxuICAgICAgLy8gUmVtb3ZlIGEgdmFsdWUgYXQgYSBwYXRoLlxuICAgICAgcmVtb3ZlVmFsdWU6IGZ1bmN0aW9uIChwYXRoKSB7XG4gICAgICAgIHZhciBvbGRWYWx1ZSA9IHV0aWwuZ2V0SW4oc3RvcmUudmFsdWUsIHBhdGgpO1xuICAgICAgICBzdG9yZS52YWx1ZSA9IHV0aWwucmVtb3ZlSW4oc3RvcmUudmFsdWUsIHBhdGgpO1xuXG4gICAgICAgIHVwZGF0ZSh7J3BhdGgnOiBwYXRoLCAnb2xkJzogb2xkVmFsdWUsICdhY3Rpb24nOiAncmVtb3ZlJ30pO1xuICAgICAgfSxcblxuICAgICAgLy8gRXJhc2UgYSB2YWx1ZS4gVXNlciBhY3Rpb25zIGNhbiByZW1vdmUgdmFsdWVzLCBidXQgbm9kZXMgY2FuIGFsc29cbiAgICAgIC8vIGRpc2FwcGVhciBkdWUgdG8gY2hhbmdpbmcgZXZhbHVhdGlvbnMuIFRoaXMgYWN0aW9uIG9jY3VycyBhdXRvbWF0aWNhbGx5XG4gICAgICAvLyAoYW5kIG1heSBiZSB1bm5lY2Vzc2FyeSBpZiB0aGUgdmFsdWUgd2FzIGFscmVhZHkgcmVtb3ZlZCkuXG4gICAgICBlcmFzZVZhbHVlOiBmdW5jdGlvbiAocGF0aCkge1xuXG4gICAgICAgIHN0b3JlLnZhbHVlID0gdXRpbC5yZW1vdmVJbihzdG9yZS52YWx1ZSwgcGF0aCk7XG5cbiAgICAgICAgdXBkYXRlKHt9KTtcbiAgICAgIH0sXG5cbiAgICAgIC8vIEFwcGVuZCBhIHZhbHVlIHRvIGFuIGFycmF5IGF0IGEgcGF0aC5cbiAgICAgIGFwcGVuZFZhbHVlOiBmdW5jdGlvbiAocGF0aCwgdmFsdWUpIHtcbiAgICAgICAgdmFyIG9sZFZhbHVlID0gdXRpbC5nZXRJbihzdG9yZS52YWx1ZSwgcGF0aCk7XG4gICAgICAgIHN0b3JlLnZhbHVlID0gdXRpbC5hcHBlbmRJbihzdG9yZS52YWx1ZSwgcGF0aCwgdmFsdWUpO1xuXG4gICAgICAgIHVwZGF0ZSh7J3BhdGgnOiBwYXRoLCAnbmV3JzogdmFsdWUsICdvbGQnOiBvbGRWYWx1ZSwgJ2FjdGlvbic6ICdhcHBlbmQnfSk7XG4gICAgICB9LFxuXG4gICAgICAvLyBTd2FwIHZhbHVlcyBvZiB0d28ga2V5cy5cbiAgICAgIG1vdmVWYWx1ZTogZnVuY3Rpb24gKHBhdGgsIGZyb21LZXksIHRvS2V5KSB7XG4gICAgICAgIHZhciBvbGRWYWx1ZSA9IHV0aWwuZ2V0SW4oc3RvcmUudmFsdWUsIHBhdGgpO1xuICAgICAgICBzdG9yZS52YWx1ZSA9IHV0aWwubW92ZUluKHN0b3JlLnZhbHVlLCBwYXRoLCBmcm9tS2V5LCB0b0tleSk7XG5cbiAgICAgICAgdXBkYXRlKHsncGF0aCc6IHBhdGgsICduZXcnOiBvbGRWYWx1ZSwgJ29sZCc6IG9sZFZhbHVlLCAnZnJvbUtleSc6IGZyb21LZXksICd0b0tleSc6IHRvS2V5LCAnYWN0aW9uJzogJ21vdmUnfSk7XG4gICAgICB9LFxuXG4gICAgICAvLyBDaGFuZ2UgYWxsIHRoZSBmaWVsZHMuXG4gICAgICBzZXRGaWVsZHM6IGZ1bmN0aW9uIChmaWVsZHMpIHtcbiAgICAgICAgc2V0dXBGaWVsZHMoZmllbGRzKTtcbiAgICAgICAgc3RvcmUuaW5mbGF0ZSgpO1xuXG4gICAgICAgIHVwZGF0ZSh7J2FjdGlvbic6ICdzZXRGaWVsZHMnfSk7XG4gICAgICB9LFxuXG4gICAgICAvLyBTZXQgYSBtZXRhZGF0YSB2YWx1ZSBmb3IgYSBrZXkuXG4gICAgICBzZXRNZXRhOiBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgICBzdG9yZS5tZXRhW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgdXBkYXRlKHsnYWN0aW9uJzogJ3NldE1ldGEnfSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIF8uZXh0ZW5kKHN0b3JlLCBhY3Rpb25zKTtcblxuICAgIHJldHVybiBzdG9yZTtcbiAgfTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgdHlwZS5hcnJheVxuXG4vKlxuU3VwcG9ydCBhcnJheSB0eXBlIHdoZXJlIGNoaWxkIGZpZWxkcyBhcmUgZHluYW1pY2FsbHkgZGV0ZXJtaW5lZCBiYXNlZCBvbiB0aGVcbnZhbHVlcyBvZiB0aGUgYXJyYXkuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cy5kZWZhdWx0ID0gW107XG5cbiAgcGx1Z2luLmV4cG9ydHMuZmllbGRzID0gZnVuY3Rpb24gKGZpZWxkKSB7XG5cbiAgICBpZiAoXy5pc0FycmF5KGZpZWxkLnZhbHVlKSkge1xuICAgICAgcmV0dXJuIGZpZWxkLnZhbHVlLm1hcChmdW5jdGlvbiAodmFsdWUsIGkpIHtcbiAgICAgICAgdmFyIGl0ZW0gPSBmaWVsZC5pdGVtRm9yVmFsdWUodmFsdWUpO1xuICAgICAgICBpdGVtLmtleSA9IGk7XG4gICAgICAgIHJldHVybiBmaWVsZC5jcmVhdGVDaGlsZChpdGVtKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICB9O1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiLy8gIyB0eXBlLmJvb2xlYW5cblxuLypcblN1cHBvcnQgYSB0cnVlL2ZhbHNlIHZhbHVlLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cy5kZWZhdWx0ID0gZmFsc2U7XG5cbiAgcGx1Z2luLmV4cG9ydHMuY29tcGlsZSA9IGZ1bmN0aW9uIChkZWYpIHtcbiAgICBpZiAoIWRlZi5jaG9pY2VzKSB7XG4gICAgICBkZWYuY2hvaWNlcyA9IFtcbiAgICAgICAge3ZhbHVlOiB0cnVlLCBsYWJlbDogJ1llcyd9LFxuICAgICAgICB7dmFsdWU6IGZhbHNlLCBsYWJlbDogJ05vJ31cbiAgICAgIF07XG4gICAgfVxuICB9O1xufTtcbiIsIi8vICMgdHlwZS5qc29uXG5cbi8qXG5BcmJpdHJhcnkgSlNPTiB2YWx1ZS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMuZGVmYXVsdCA9IG51bGw7XG5cbn07XG4iLCIvLyAjIHR5cGUubnVtYmVyXG5cbi8qXG5TdXBwb3J0IG51bWJlciB2YWx1ZXMsIG9mIGNvdXJzZS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMuZGVmYXVsdCA9IDA7XG5cbn07XG4iLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIHR5cGUub2JqZWN0XG5cbi8qXG5TdXBwb3J0IGZvciBvYmplY3QgdHlwZXMuIE9iamVjdCBmaWVsZHMgY2FuIHN1cHBseSBzdGF0aWMgY2hpbGQgZmllbGRzLCBvciBpZlxudGhlcmUgYXJlIGFkZGl0aW9uYWwgY2hpbGQga2V5cywgZHluYW1pYyBjaGlsZCBmaWVsZHMgd2lsbCBiZSBjcmVhdGVkIG11Y2hcbmxpa2UgYW4gYXJyYXkuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICB2YXIgdXRpbCA9IHBsdWdpbi5yZXF1aXJlKCd1dGlsJyk7XG5cbiAgcGx1Z2luLmV4cG9ydHMuZGVmYXVsdCA9IHt9O1xuXG4gIHBsdWdpbi5leHBvcnRzLmZpZWxkcyA9IGZ1bmN0aW9uIChmaWVsZCkge1xuXG4gICAgdmFyIGZpZWxkcyA9IFtdO1xuICAgIHZhciB2YWx1ZSA9IGZpZWxkLnZhbHVlO1xuICAgIHZhciB1bnVzZWRLZXlzID0gXy5rZXlzKHZhbHVlKTtcblxuICAgIGlmIChmaWVsZC5kZWYuZmllbGRzKSB7XG5cbiAgICAgIGZpZWxkcyA9IGZpZWxkLmRlZi5maWVsZHMubWFwKGZ1bmN0aW9uIChkZWYpIHtcbiAgICAgICAgdmFyIGNoaWxkID0gZmllbGQuY3JlYXRlQ2hpbGQoZGVmKTtcbiAgICAgICAgaWYgKCF1dGlsLmlzQmxhbmsoY2hpbGQuZGVmLmtleSkpIHtcbiAgICAgICAgICB1bnVzZWRLZXlzID0gXy53aXRob3V0KHVudXNlZEtleXMsIGNoaWxkLmRlZi5rZXkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjaGlsZDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICh1bnVzZWRLZXlzLmxlbmd0aCA+IDApIHtcbiAgICAgIHVudXNlZEtleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIHZhciBpdGVtID0gZmllbGQuaXRlbUZvclZhbHVlKHZhbHVlW2tleV0pO1xuICAgICAgICBpdGVtLmxhYmVsID0gdXRpbC5odW1hbml6ZShrZXkpO1xuICAgICAgICBpdGVtLmtleSA9IGtleTtcbiAgICAgICAgZmllbGRzLnB1c2goZmllbGQuY3JlYXRlQ2hpbGQoaXRlbSkpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZpZWxkcztcbiAgfTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIi8vICMgdHlwZS5yb290XG5cbi8qXG5TcGVjaWFsIHR5cGUgcmVwcmVzZW50aW5nIHRoZSByb290IG9mIHRoZSBmb3JtLiBHZXRzIHRoZSBmaWVsZHMgZGlyZWN0bHkgZnJvbVxudGhlIHN0b3JlLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cy5maWVsZHMgPSBmdW5jdGlvbiAoZmllbGQpIHtcblxuICAgIHJldHVybiBmaWVsZC5mb3JtLnN0b3JlLmZpZWxkcy5tYXAoZnVuY3Rpb24gKGRlZikge1xuICAgICAgcmV0dXJuIGZpZWxkLmNyZWF0ZUNoaWxkKGRlZik7XG4gICAgfSk7XG5cbiAgfTtcbn07XG4iLCIvLyAjIHR5cGUuc3RyaW5nXG5cbi8qXG5TdXBwb3J0IHN0cmluZyB2YWx1ZXMsIG9mIGNvdXJzZS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMuZGVmYXVsdCA9ICcnO1xuXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFJlcHJlc2VudGF0aW9uIG9mIGEgc2luZ2xlIEV2ZW50RW1pdHRlciBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBFdmVudCBoYW5kbGVyIHRvIGJlIGNhbGxlZC5cbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgQ29udGV4dCBmb3IgZnVuY3Rpb24gZXhlY3V0aW9uLlxuICogQHBhcmFtIHtCb29sZWFufSBvbmNlIE9ubHkgZW1pdCBvbmNlXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gRUUoZm4sIGNvbnRleHQsIG9uY2UpIHtcbiAgdGhpcy5mbiA9IGZuO1xuICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuICB0aGlzLm9uY2UgPSBvbmNlIHx8IGZhbHNlO1xufVxuXG4vKipcbiAqIE1pbmltYWwgRXZlbnRFbWl0dGVyIGludGVyZmFjZSB0aGF0IGlzIG1vbGRlZCBhZ2FpbnN0IHRoZSBOb2RlLmpzXG4gKiBFdmVudEVtaXR0ZXIgaW50ZXJmYWNlLlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQGFwaSBwdWJsaWNcbiAqL1xuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkgeyAvKiBOb3RoaW5nIHRvIHNldCAqLyB9XG5cbi8qKlxuICogSG9sZHMgdGhlIGFzc2lnbmVkIEV2ZW50RW1pdHRlcnMgYnkgbmFtZS5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICogQHByaXZhdGVcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuXG4vKipcbiAqIFJldHVybiBhIGxpc3Qgb2YgYXNzaWduZWQgZXZlbnQgbGlzdGVuZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnRzIHRoYXQgc2hvdWxkIGJlIGxpc3RlZC5cbiAqIEByZXR1cm5zIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24gbGlzdGVuZXJzKGV2ZW50KSB7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbZXZlbnRdKSByZXR1cm4gW107XG5cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLl9ldmVudHNbZXZlbnRdLmxlbmd0aCwgZWUgPSBbXTsgaSA8IGw7IGkrKykge1xuICAgIGVlLnB1c2godGhpcy5fZXZlbnRzW2V2ZW50XVtpXS5mbik7XG4gIH1cblxuICByZXR1cm4gZWU7XG59O1xuXG4vKipcbiAqIEVtaXQgYW4gZXZlbnQgdG8gYWxsIHJlZ2lzdGVyZWQgZXZlbnQgbGlzdGVuZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgbmFtZSBvZiB0aGUgZXZlbnQuXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gSW5kaWNhdGlvbiBpZiB3ZSd2ZSBlbWl0dGVkIGFuIGV2ZW50LlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gZW1pdChldmVudCwgYTEsIGEyLCBhMywgYTQsIGE1KSB7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbZXZlbnRdKSByZXR1cm4gZmFsc2U7XG5cbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldmVudF1cbiAgICAsIGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGhcbiAgICAsIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICAsIGVlID0gbGlzdGVuZXJzWzBdXG4gICAgLCBhcmdzXG4gICAgLCBpLCBqO1xuXG4gIGlmICgxID09PSBsZW5ndGgpIHtcbiAgICBpZiAoZWUub25jZSkgdGhpcy5yZW1vdmVMaXN0ZW5lcihldmVudCwgZWUuZm4sIHRydWUpO1xuXG4gICAgc3dpdGNoIChsZW4pIHtcbiAgICAgIGNhc2UgMTogcmV0dXJuIGVlLmZuLmNhbGwoZWUuY29udGV4dCksIHRydWU7XG4gICAgICBjYXNlIDI6IHJldHVybiBlZS5mbi5jYWxsKGVlLmNvbnRleHQsIGExKSwgdHJ1ZTtcbiAgICAgIGNhc2UgMzogcmV0dXJuIGVlLmZuLmNhbGwoZWUuY29udGV4dCwgYTEsIGEyKSwgdHJ1ZTtcbiAgICAgIGNhc2UgNDogcmV0dXJuIGVlLmZuLmNhbGwoZWUuY29udGV4dCwgYTEsIGEyLCBhMyksIHRydWU7XG4gICAgICBjYXNlIDU6IHJldHVybiBlZS5mbi5jYWxsKGVlLmNvbnRleHQsIGExLCBhMiwgYTMsIGE0KSwgdHJ1ZTtcbiAgICAgIGNhc2UgNjogcmV0dXJuIGVlLmZuLmNhbGwoZWUuY29udGV4dCwgYTEsIGEyLCBhMywgYTQsIGE1KSwgdHJ1ZTtcbiAgICB9XG5cbiAgICBmb3IgKGkgPSAxLCBhcmdzID0gbmV3IEFycmF5KGxlbiAtMSk7IGkgPCBsZW47IGkrKykge1xuICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuXG4gICAgZWUuZm4uYXBwbHkoZWUuY29udGV4dCwgYXJncyk7XG4gIH0gZWxzZSB7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAobGlzdGVuZXJzW2ldLm9uY2UpIHRoaXMucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyc1tpXS5mbiwgdHJ1ZSk7XG5cbiAgICAgIHN3aXRjaCAobGVuKSB7XG4gICAgICAgIGNhc2UgMTogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQpOyBicmVhaztcbiAgICAgICAgY2FzZSAyOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgYTEpOyBicmVhaztcbiAgICAgICAgY2FzZSAzOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgYTEsIGEyKTsgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgaWYgKCFhcmdzKSBmb3IgKGogPSAxLCBhcmdzID0gbmV3IEFycmF5KGxlbiAtMSk7IGogPCBsZW47IGorKykge1xuICAgICAgICAgICAgYXJnc1tqIC0gMV0gPSBhcmd1bWVudHNbal07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGlzdGVuZXJzW2ldLmZuLmFwcGx5KGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhcmdzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbi8qKlxuICogUmVnaXN0ZXIgYSBuZXcgRXZlbnRMaXN0ZW5lciBmb3IgdGhlIGdpdmVuIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBOYW1lIG9mIHRoZSBldmVudC5cbiAqIEBwYXJhbSB7RnVuY3Rvbn0gZm4gQ2FsbGJhY2sgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IFRoZSBjb250ZXh0IG9mIHRoZSBmdW5jdGlvbi5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBmdW5jdGlvbiBvbihldmVudCwgZm4sIGNvbnRleHQpIHtcbiAgaWYgKCF0aGlzLl9ldmVudHMpIHRoaXMuX2V2ZW50cyA9IHt9O1xuICBpZiAoIXRoaXMuX2V2ZW50c1tldmVudF0pIHRoaXMuX2V2ZW50c1tldmVudF0gPSBbXTtcbiAgdGhpcy5fZXZlbnRzW2V2ZW50XS5wdXNoKG5ldyBFRSggZm4sIGNvbnRleHQgfHwgdGhpcyApKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWRkIGFuIEV2ZW50TGlzdGVuZXIgdGhhdCdzIG9ubHkgY2FsbGVkIG9uY2UuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IE5hbWUgb2YgdGhlIGV2ZW50LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gQ2FsbGJhY2sgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IFRoZSBjb250ZXh0IG9mIHRoZSBmdW5jdGlvbi5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uIG9uY2UoZXZlbnQsIGZuLCBjb250ZXh0KSB7XG4gIGlmICghdGhpcy5fZXZlbnRzKSB0aGlzLl9ldmVudHMgPSB7fTtcbiAgaWYgKCF0aGlzLl9ldmVudHNbZXZlbnRdKSB0aGlzLl9ldmVudHNbZXZlbnRdID0gW107XG4gIHRoaXMuX2V2ZW50c1tldmVudF0ucHVzaChuZXcgRUUoZm4sIGNvbnRleHQgfHwgdGhpcywgdHJ1ZSApKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGV2ZW50IGxpc3RlbmVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IHdlIHdhbnQgdG8gcmVtb3ZlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGxpc3RlbmVyIHRoYXQgd2UgbmVlZCB0byBmaW5kLlxuICogQHBhcmFtIHtCb29sZWFufSBvbmNlIE9ubHkgcmVtb3ZlIG9uY2UgbGlzdGVuZXJzLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKGV2ZW50LCBmbiwgb25jZSkge1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW2V2ZW50XSkgcmV0dXJuIHRoaXM7XG5cbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldmVudF1cbiAgICAsIGV2ZW50cyA9IFtdO1xuXG4gIGlmIChmbikgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGlmIChsaXN0ZW5lcnNbaV0uZm4gIT09IGZuICYmIGxpc3RlbmVyc1tpXS5vbmNlICE9PSBvbmNlKSB7XG4gICAgICBldmVudHMucHVzaChsaXN0ZW5lcnNbaV0pO1xuICAgIH1cbiAgfVxuXG4gIC8vXG4gIC8vIFJlc2V0IHRoZSBhcnJheSwgb3IgcmVtb3ZlIGl0IGNvbXBsZXRlbHkgaWYgd2UgaGF2ZSBubyBtb3JlIGxpc3RlbmVycy5cbiAgLy9cbiAgaWYgKGV2ZW50cy5sZW5ndGgpIHRoaXMuX2V2ZW50c1tldmVudF0gPSBldmVudHM7XG4gIGVsc2UgdGhpcy5fZXZlbnRzW2V2ZW50XSA9IG51bGw7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbGwgbGlzdGVuZXJzIG9yIG9ubHkgdGhlIGxpc3RlbmVycyBmb3IgdGhlIHNwZWNpZmllZCBldmVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IHdhbnQgdG8gcmVtb3ZlIGFsbCBsaXN0ZW5lcnMgZm9yLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbiByZW1vdmVBbGxMaXN0ZW5lcnMoZXZlbnQpIHtcbiAgaWYgKCF0aGlzLl9ldmVudHMpIHJldHVybiB0aGlzO1xuXG4gIGlmIChldmVudCkgdGhpcy5fZXZlbnRzW2V2ZW50XSA9IG51bGw7XG4gIGVsc2UgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vL1xuLy8gQWxpYXMgbWV0aG9kcyBuYW1lcyBiZWNhdXNlIHBlb3BsZSByb2xsIGxpa2UgdGhhdC5cbi8vXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9mZiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXI7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbjtcblxuLy9cbi8vIFRoaXMgZnVuY3Rpb24gZG9lc24ndCBhcHBseSBhbnltb3JlLlxuLy9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24gc2V0TWF4TGlzdGVuZXJzKCkge1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8vXG4vLyBFeHBvc2UgdGhlIG1vZHVsZS5cbi8vXG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlcjIgPSBFdmVudEVtaXR0ZXI7XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyMyA9IEV2ZW50RW1pdHRlcjtcblxuaWYgKCdvYmplY3QnID09PSB0eXBlb2YgbW9kdWxlICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9mb3JtYXRpYycpO1xuIl19
