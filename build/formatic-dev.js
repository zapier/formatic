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
        isChoicesOpen: false
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
        this.tracking.tokens = cutTokens
        this.tracking.indexMap = this.indexMap(this.tracking.tokens);
      }.bind(this),0);
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
            left: 0
          },
          onKeyPress: this.onKeyPress,
          onKeyDown: this.onKeyDown,
          onSelect: this.onSelect,
          onCopy: this.onCopy,
          onCut: this.onCut
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvY29tcGlsZXJzL2Nob2ljZXMuanMiLCJsaWIvY29tcGlsZXJzL2xvb2t1cC5qcyIsImxpYi9jb21waWxlcnMvcHJvcC1hbGlhc2VzLmpzIiwibGliL2NvbXBpbGVycy90eXBlcy5qcyIsImxpYi9jb21wb25lbnRzL2FkZC1pdGVtLmpzIiwibGliL2NvbXBvbmVudHMvY2hlY2tib3gtbGlzdC5qcyIsImxpYi9jb21wb25lbnRzL2Nob2ljZXMuanMiLCJsaWIvY29tcG9uZW50cy9maWVsZC5qcyIsImxpYi9jb21wb25lbnRzL2ZpZWxkc2V0LmpzIiwibGliL2NvbXBvbmVudHMvZm9ybWF0aWMuanMiLCJsaWIvY29tcG9uZW50cy9oZWxwLmpzIiwibGliL2NvbXBvbmVudHMvaXRlbS1jaG9pY2VzLmpzIiwibGliL2NvbXBvbmVudHMvanNvbi5qcyIsImxpYi9jb21wb25lbnRzL2xhYmVsLmpzIiwibGliL2NvbXBvbmVudHMvbGlzdC1jb250cm9sLmpzIiwibGliL2NvbXBvbmVudHMvbGlzdC1pdGVtLWNvbnRyb2wuanMiLCJsaWIvY29tcG9uZW50cy9saXN0LWl0ZW0tdmFsdWUuanMiLCJsaWIvY29tcG9uZW50cy9saXN0LWl0ZW0uanMiLCJsaWIvY29tcG9uZW50cy9saXN0LmpzIiwibGliL2NvbXBvbmVudHMvbW92ZS1pdGVtLWJhY2suanMiLCJsaWIvY29tcG9uZW50cy9tb3ZlLWl0ZW0tZm9yd2FyZC5qcyIsImxpYi9jb21wb25lbnRzL3ByZXR0eS10ZXh0YXJlYS5qcyIsImxpYi9jb21wb25lbnRzL3JlbW92ZS1pdGVtLmpzIiwibGliL2NvbXBvbmVudHMvcm9vdC5qcyIsImxpYi9jb21wb25lbnRzL3NhbXBsZS5qcyIsImxpYi9jb21wb25lbnRzL3NlbGVjdC5qcyIsImxpYi9jb21wb25lbnRzL3RleHQuanMiLCJsaWIvY29tcG9uZW50cy90ZXh0YXJlYS5qcyIsImxpYi9jb3JlL2ZpZWxkLmpzIiwibGliL2NvcmUvZm9ybS1pbml0LmpzIiwibGliL2NvcmUvZm9ybS5qcyIsImxpYi9jb3JlL2Zvcm1hdGljLmpzIiwibGliL2RlZmF1bHQvY29tcGlsZXIuanMiLCJsaWIvZGVmYXVsdC9jb21wb25lbnQuanMiLCJsaWIvZGVmYXVsdC9jb3JlLmpzIiwibGliL2RlZmF1bHQvZXZhbC1mdW5jdGlvbnMuanMiLCJsaWIvZGVmYXVsdC9ldmFsLmpzIiwibGliL2RlZmF1bHQvZmllbGQtcm91dGVyLmpzIiwibGliL2RlZmF1bHQvZmllbGQtcm91dGVzLmpzIiwibGliL2RlZmF1bHQvbG9hZGVyLmpzIiwibGliL2RlZmF1bHQvdXRpbC5qcyIsImxpYi9mb3JtYXRpYy5qcyIsImxpYi9taXhpbnMvY2xpY2stb3V0c2lkZS5qcyIsImxpYi9taXhpbnMvZmllbGQuanMiLCJsaWIvbWl4aW5zL2lucHV0LWFjdGlvbnMuanMiLCJsaWIvbWl4aW5zL3Jlc2l6ZS5qcyIsImxpYi9taXhpbnMvc2Nyb2xsLmpzIiwibGliL21peGlucy91bmRvLXN0YWNrLmpzIiwibGliL3BsdWdpbnMvYm9vdHN0cmFwLXN0eWxlLmpzIiwibGliL3BsdWdpbnMvZGVmYXVsdC1zdHlsZS5qcyIsImxpYi9zdG9yZS9tZW1vcnkuanMiLCJsaWIvdHlwZXMvYXJyYXkuanMiLCJsaWIvdHlwZXMvYm9vbGVhbi5qcyIsImxpYi90eXBlcy9qc29uLmpzIiwibGliL3R5cGVzL251bWJlci5qcyIsImxpYi90eXBlcy9vYmplY3QuanMiLCJsaWIvdHlwZXMvcm9vdC5qcyIsImxpYi90eXBlcy9zdHJpbmcuanMiLCJub2RlX21vZHVsZXMvZXZlbnRlbWl0dGVyMy9pbmRleC5qcyIsImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbFBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbFRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcGJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNU1BO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21waWxlci5jaG9pY2VzXG5cbi8qXG5Ob3JtYWxpemVzIHRoZSBjaG9pY2VzIGZvciBhIGZpZWxkLiBTdXBwb3J0cyB0aGUgZm9sbG93aW5nIGZvcm1hdHMuXG5cbmBgYGpzXG4ncmVkLCBibHVlJ1xuXG5bJ3JlZCcsICdibHVlJ11cblxue3JlZDogJ1JlZCcsIGJsdWU6ICdCbHVlJ31cblxuW3t2YWx1ZTogJ3JlZCcsIGxhYmVsOiAnUmVkJ30sIHt2YWx1ZTogJ2JsdWUnLCBsYWJlbDogJ0JsdWUnfV1cbmBgYFxuXG5BbGwgb2YgdGhvc2UgZm9ybWF0cyBhcmUgbm9ybWFsaXplZCB0bzpcblxuYGBganNcblt7dmFsdWU6ICdyZWQnLCBsYWJlbDogJ1JlZCd9LCB7dmFsdWU6ICdibHVlJywgbGFiZWw6ICdCbHVlJ31dXG5gYGBcbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHZhciB1dGlsID0gcGx1Z2luLnJlcXVpcmUoJ3V0aWwnKTtcblxuICB2YXIgY29tcGlsZUNob2ljZXMgPSBmdW5jdGlvbiAoY2hvaWNlcykge1xuXG4gICAgLy8gQ29udmVydCBjb21tYSBzZXBhcmF0ZWQgc3RyaW5nIHRvIGFycmF5IG9mIHN0cmluZ3MuXG4gICAgaWYgKF8uaXNTdHJpbmcoY2hvaWNlcykpIHtcbiAgICAgIGNob2ljZXMgPSBjaG9pY2VzLnNwbGl0KCcsJyk7XG4gICAgfVxuXG4gICAgLy8gQ29udmVydCBvYmplY3QgdG8gYXJyYXkgb2Ygb2JqZWN0cyB3aXRoIGB2YWx1ZWAgYW5kIGBsYWJlbGAgcHJvcGVydGllcy5cbiAgICBpZiAoIV8uaXNBcnJheShjaG9pY2VzKSAmJiBfLmlzT2JqZWN0KGNob2ljZXMpKSB7XG4gICAgICBjaG9pY2VzID0gT2JqZWN0LmtleXMoY2hvaWNlcykubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB2YWx1ZToga2V5LFxuICAgICAgICAgIGxhYmVsOiBjaG9pY2VzW2tleV1cbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIENvcHkgdGhlIGFycmF5IG9mIGNob2ljZXMgc28gd2UgY2FuIG1hbmlwdWxhdGUgdGhlbS5cbiAgICBjaG9pY2VzID0gY2hvaWNlcy5zbGljZSgwKTtcblxuICAgIC8vIEFycmF5IG9mIGNob2ljZSBhcnJheXMgc2hvdWxkIGJlIGZsYXR0ZW5lZC5cbiAgICBjaG9pY2VzID0gXy5mbGF0dGVuKGNob2ljZXMpO1xuXG4gICAgY2hvaWNlcy5mb3JFYWNoKGZ1bmN0aW9uIChjaG9pY2UsIGkpIHtcbiAgICAgIC8vIENvbnZlcnQgYW55IHN0cmluZyBjaG9pY2VzIHRvIG9iamVjdHMgd2l0aCBgdmFsdWVgIGFuZCBgbGFiZWxgXG4gICAgICAvLyBwcm9wZXJ0aWVzLlxuICAgICAgaWYgKF8uaXNTdHJpbmcoY2hvaWNlKSkge1xuICAgICAgICBjaG9pY2VzW2ldID0ge1xuICAgICAgICAgIHZhbHVlOiBjaG9pY2UsXG4gICAgICAgICAgbGFiZWw6IHV0aWwuaHVtYW5pemUoY2hvaWNlKVxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKCFjaG9pY2VzW2ldLmxhYmVsKSB7XG4gICAgICAgIGNob2ljZXNbaV0ubGFiZWwgPSB1dGlsLmh1bWFuaXplKGNob2ljZXNbaV0udmFsdWUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGNob2ljZXM7XG4gIH07XG5cbiAgcGx1Z2luLmV4cG9ydHMuY29tcGlsZSA9IGZ1bmN0aW9uIChkZWYpIHtcbiAgICBpZiAoZGVmLmNob2ljZXMgPT09ICcnKSB7XG4gICAgICBkZWYuY2hvaWNlcyA9IFtdO1xuICAgIH0gZWxzZSBpZiAoZGVmLmNob2ljZXMpIHtcblxuICAgICAgZGVmLmNob2ljZXMgPSBjb21waWxlQ2hvaWNlcyhkZWYuY2hvaWNlcyk7XG4gICAgfVxuXG4gICAgaWYgKGRlZi5yZXBsYWNlQ2hvaWNlcyA9PT0gJycpIHtcbiAgICAgIGRlZi5yZXBsYWNlQ2hvaWNlcyA9IFtdO1xuICAgIH0gZWxzZSBpZiAoZGVmLnJlcGxhY2VDaG9pY2VzKSB7XG5cbiAgICAgIGRlZi5yZXBsYWNlQ2hvaWNlcyA9IGNvbXBpbGVDaG9pY2VzKGRlZi5yZXBsYWNlQ2hvaWNlcyk7XG5cbiAgICAgIGRlZi5yZXBsYWNlQ2hvaWNlc0xhYmVscyA9IHt9O1xuXG4gICAgICBkZWYucmVwbGFjZUNob2ljZXMuZm9yRWFjaChmdW5jdGlvbiAoY2hvaWNlKSB7XG4gICAgICAgIGRlZi5yZXBsYWNlQ2hvaWNlc0xhYmVsc1tjaG9pY2UudmFsdWVdID0gY2hvaWNlLmxhYmVsO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiLy8gIyBjb21waWxlci5sb29rdXBcblxuLypcbkNvbnZlcnQgYSBsb29rdXAgZGVjbGFyYXRpb24gdG8gYW4gZXZhbHVhdGlvbi4gQSBsb29rdXAgcHJvcGVydHkgaXMgdXNlZCBsaWtlOlxuXG5gYGBqc1xue1xuICB0eXBlOiAnc3RyaW5nJyxcbiAga2V5OiAnc3RhdGVzJyxcbiAgbG9va3VwOiB7c291cmNlOiAnbG9jYXRpb25zJywga2V5czogWydjb3VudHJ5J119XG59XG5gYGBcblxuTG9naWNhbGx5LCB0aGUgYWJvdmUgd2lsbCB1c2UgdGhlIGBjb3VudHJ5YCBrZXkgb2YgdGhlIHZhbHVlIHRvIGFzayB0aGVcbmBsb2NhdGlvbnNgIHNvdXJjZSBmb3Igc3RhdGVzIGNob2ljZXMuIFRoaXMgd29ya3MgYnkgY29udmVydGluZyB0aGUgbG9va3VwIHRvXG50aGUgZm9sbG93aW5nIGV2YWx1YXRpb24uXG5cbmBgYGpzXG57XG4gIHR5cGU6ICdzdHJpbmcnLFxuICBrZXk6ICdzdGF0ZXMnLFxuICBjaG9pY2VzOiBbXSxcbiAgZXZhbDoge1xuICAgIG5lZWRzTWV0YTogW1xuICAgICAgWydAaWYnLCBbJ0BnZXRNZXRhJywgJ2xvY2F0aW9ucycsIHtjb3VudHJ5OiBbJ0BnZXQnLCAnY291bnRyeSddfV0sIG51bGwsIFsnbG9jYXRpb25zJywge2NvdW50cnk6IFsnQGdldCcsICdjb3VudHJ5J119XV1cbiAgICBdLFxuICAgIGNob2ljZXM6IFsnQGdldE1ldGEnLCAnbG9jYXRpb25zJywge2NvdW50cnk6IFsnQGdldCcsICdjb3VudHJ5J119XVxuICB9XG59XG5gYGBcblxuVGhlIGFib3ZlIHNheXMgdG8gYWRkIGEgYG5lZWRzTWV0YWAgcHJvcGVydHkgaWYgbmVjZXNzYXJ5IGFuZCBhZGQgYSBgY2hvaWNlc2BcbmFycmF5IGlmIGl0J3MgYXZhaWxhYmxlLiBPdGhlcndpc2UsIGNob2ljZXMgd2lsbCBkZWZhdWx0IHRvIGFuIGVtcHR5IGFycmF5LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICB2YXIgYWRkTG9va3VwID0gZnVuY3Rpb24gKGRlZiwgbG9va3VwUHJvcE5hbWUsIGNob2ljZXNQcm9wTmFtZSkge1xuICAgIHZhciBsb29rdXAgPSBkZWZbbG9va3VwUHJvcE5hbWVdO1xuXG4gICAgaWYgKGxvb2t1cCkge1xuICAgICAgaWYgKCFkZWZbY2hvaWNlc1Byb3BOYW1lXSkge1xuICAgICAgICBkZWZbY2hvaWNlc1Byb3BOYW1lXSA9IFtdO1xuICAgICAgfVxuICAgICAgaWYgKCFkZWYuZXZhbCkge1xuICAgICAgICBkZWYuZXZhbCA9IHt9O1xuICAgICAgfVxuICAgICAgaWYgKCFkZWYuZXZhbC5uZWVkc01ldGEpIHtcbiAgICAgICAgZGVmLmV2YWwubmVlZHNNZXRhID0gW107XG4gICAgICB9XG4gICAgICB2YXIga2V5cyA9IGxvb2t1cC5rZXlzIHx8IFtdO1xuICAgICAgdmFyIHBhcmFtcyA9IHt9O1xuICAgICAgdmFyIG1ldGFBcmdzLCBtZXRhR2V0LCBoaWRkZW5UZXN0O1xuXG4gICAgICBpZiAobG9va3VwLmdyb3VwKSB7XG5cbiAgICAgICAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICBwYXJhbXNba2V5XSA9IFsnQGdldCcsICdpdGVtJywga2V5XTtcbiAgICAgICAgfSk7XG4gICAgICAgIG1ldGFBcmdzID0gW2xvb2t1cC5zb3VyY2VdLmNvbmNhdChwYXJhbXMpO1xuICAgICAgICBtZXRhR2V0ID0gWydAZ2V0TWV0YSddLmNvbmNhdChtZXRhQXJncyk7XG4gICAgICAgIHZhciBtZXRhRm9yRWFjaCA9IFsnQGZvckVhY2gnLCAnaXRlbScsIFsnQGdldEdyb3VwVmFsdWVzJywgbG9va3VwLmdyb3VwXV07XG4gICAgICAgIGRlZi5ldmFsLm5lZWRzTWV0YS5wdXNoKG1ldGFGb3JFYWNoLmNvbmNhdChbXG4gICAgICAgICAgbWV0YUFyZ3MsXG4gICAgICAgICAgWydAbm90JywgbWV0YUdldF1cbiAgICAgICAgXSkpO1xuICAgICAgICBoaWRkZW5UZXN0ID0gWydAYW5kJ10uY29uY2F0KGtleXMubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICByZXR1cm4gWydAZ2V0JywgJ2l0ZW0nLCBrZXldO1xuICAgICAgICB9KSk7XG4gICAgICAgIGRlZi5ldmFsW2Nob2ljZXNQcm9wTmFtZV0gPSBtZXRhRm9yRWFjaC5jb25jYXQoW1xuICAgICAgICAgIFsnQG9yJywgbWV0YUdldCwgWydAaWYnLCBoaWRkZW5UZXN0LCBbJy8vL2xvYWRpbmcvLy8nXSwgW11dXSxcbiAgICAgICAgICBbJ0BvcicsIGhpZGRlblRlc3QsIG1ldGFHZXRdXG4gICAgICAgIF0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICBwYXJhbXNba2V5XSA9IFsnQGdldCcsIGtleV07XG4gICAgICAgIH0pO1xuICAgICAgICBtZXRhQXJncyA9IFtsb29rdXAuc291cmNlXS5jb25jYXQocGFyYW1zKTtcbiAgICAgICAgbWV0YUdldCA9IFsnQGdldE1ldGEnXS5jb25jYXQobWV0YUFyZ3MpO1xuICAgICAgICB2YXIgbWV0YUdldE9yTG9hZGluZyA9IFsnQG9yJywgbWV0YUdldCwgWycvLy9sb2FkaW5nLy8vJ11dO1xuICAgICAgICBkZWYuZXZhbC5uZWVkc01ldGEucHVzaChbJ0BpZicsIG1ldGFHZXQsIG51bGwsIG1ldGFBcmdzXSk7XG4gICAgICAgIGRlZi5ldmFsW2Nob2ljZXNQcm9wTmFtZV0gPSBtZXRhR2V0T3JMb2FkaW5nO1xuICAgICAgICBpZiAoa2V5cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgLy8gVGVzdCB0aGF0IHdlIGhhdmUgYWxsIG5lZWRlZCBrZXlzLlxuICAgICAgICAgIGhpZGRlblRlc3QgPSBbJ0BhbmQnXS5jb25jYXQoa2V5cy5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgcmV0dXJuIFsnQGdldCcsIGtleV07XG4gICAgICAgICAgfSkpO1xuICAgICAgICAgIC8vIFJldmVyc2UgdGVzdCBzbyB3ZSBoaWRlIGlmIGRvbid0IGhhdmUgYWxsIGtleXMuXG4gICAgICAgICAgaGlkZGVuVGVzdCA9IFsnQG5vdCcsIGhpZGRlblRlc3RdO1xuICAgICAgICAgIGlmICghZGVmLmV2YWwuaGlkZGVuKSB7XG4gICAgICAgICAgICBkZWYuZXZhbC5oaWRkZW4gPSBoaWRkZW5UZXN0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBkZWxldGUgZGVmW2xvb2t1cFByb3BOYW1lXTtcbiAgICB9XG4gIH07XG5cbiAgcGx1Z2luLmV4cG9ydHMuY29tcGlsZSA9IGZ1bmN0aW9uIChkZWYpIHtcblxuICAgIGFkZExvb2t1cChkZWYsICdsb29rdXAnLCAnY2hvaWNlcycpO1xuICAgIGFkZExvb2t1cChkZWYsICdsb29rdXBSZXBsYWNlbWVudHMnLCAncmVwbGFjZUNob2ljZXMnKTtcbiAgfTtcbn07XG4iLCIvLyAjIGNvbXBpbGVycy5wcm9wLWFsaWFzZXNcblxuLypcbkFsaWFzIHNvbWUgcHJvcGVydGllcyB0byBvdGhlciBwcm9wZXJ0aWVzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICB2YXIgcHJvcEFsaWFzZXMgPSB7XG4gICAgaGVscF90ZXh0OiAnaGVscFRleHQnXG4gIH07XG5cbiAgcGx1Z2luLmV4cG9ydHMuY29tcGlsZSA9IGZ1bmN0aW9uIChkZWYpIHtcbiAgICBPYmplY3Qua2V5cyhwcm9wQWxpYXNlcykuZm9yRWFjaChmdW5jdGlvbiAoYWxpYXMpIHtcbiAgICAgIHZhciBwcm9wTmFtZSA9IHByb3BBbGlhc2VzW2FsaWFzXTtcbiAgICAgIGlmICh0eXBlb2YgZGVmW3Byb3BOYW1lXSA9PT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGRlZlthbGlhc10gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGRlZltwcm9wTmFtZV0gPSBkZWZbYWxpYXNdO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xufTtcbiIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcGlsZXJzLnR5cGVzXG5cbi8qXG5Db252ZXJ0IHNvbWUgaGlnaC1sZXZlbCB0eXBlcyB0byBsb3ctbGV2ZWwgdHlwZXMgYW5kIHByb3BlcnRpZXMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICAvLyBNYXAgaGlnaC1sZXZlbCB0eXBlIHRvIGxvdy1sZXZlbCB0eXBlLiBJZiBhIGZ1bmN0aW9uIGlzIHN1cHBsaWVkLCBjYW5cbiAgLy8gbW9kaWZ5IHRoZSBmaWVsZCBkZWZpbml0aW9uLlxuICB2YXIgdHlwZUNvZXJjZSA9IHtcbiAgICB1bmljb2RlOiBmdW5jdGlvbiAoZGVmKSB7XG4gICAgICBkZWYudHlwZSA9ICdzdHJpbmcnO1xuICAgICAgZGVmLm1heFJvd3MgPSAxO1xuICAgIH0sXG4gICAgdGV4dDogJ3N0cmluZycsXG4gICAgc2VsZWN0OiBmdW5jdGlvbiAoZGVmKSB7XG4gICAgICBkZWYuY2hvaWNlcyA9IGRlZi5jaG9pY2VzIHx8IFtdO1xuICAgIH0sXG4gICAgYm9vbDogJ2Jvb2xlYW4nLFxuICAgIGRpY3Q6ICdvYmplY3QnLFxuICAgIGRlY2ltYWw6ICdudW1iZXInLFxuICAgIGludDogJ251bWJlcidcbiAgfTtcblxuICB0eXBlQ29lcmNlLnN0ciA9IHR5cGVDb2VyY2UudW5pY29kZTtcblxuXG4gIHBsdWdpbi5leHBvcnRzLmNvbXBpbGUgPSBmdW5jdGlvbiAoZGVmKSB7XG5cbiAgICB2YXIgY29lcmNlVHlwZSA9IHR5cGVDb2VyY2VbZGVmLnR5cGVdO1xuICAgIGlmIChjb2VyY2VUeXBlKSB7XG4gICAgICBpZiAoXy5pc1N0cmluZyhjb2VyY2VUeXBlKSkge1xuICAgICAgICBkZWYudHlwZSA9IGNvZXJjZVR5cGU7XG4gICAgICB9IGVsc2UgaWYgKF8uaXNGdW5jdGlvbihjb2VyY2VUeXBlKSkge1xuICAgICAgICBkZWYgPSBjb2VyY2VUeXBlKGRlZik7XG4gICAgICB9XG4gICAgfVxuICB9O1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQuYWRkLWl0ZW1cblxuLypcblRoZSBhZGQgYnV0dG9uIHRvIGFwcGVuZCBhbiBpdGVtIHRvIGEgZmllbGQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZGlzcGxheU5hbWU6IHBsdWdpbi5uYW1lLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lLFxuICAgICAgICBsYWJlbDogcGx1Z2luLmNvbmZpZ1ZhbHVlKCdsYWJlbCcsICdbYWRkXScpXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBSLnNwYW4oe2NsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWUsIG9uQ2xpY2s6IHRoaXMucHJvcHMub25DbGlja30sIHRoaXMucHJvcHMubGFiZWwpO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC5jaGVja2JveC1saXN0XG5cbi8qXG5Vc2VkIHdpdGggYXJyYXkgdmFsdWVzIHRvIHN1cHBseSBtdWx0aXBsZSBjaGVja2JveGVzIGZvciBhZGRpbmcgbXVsdGlwbGVcbmVudW1lcmF0ZWQgdmFsdWVzIHRvIGFuIGFycmF5LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZGlzcGxheU5hbWU6IHBsdWdpbi5uYW1lLFxuXG4gICAgbWl4aW5zOiBbcGx1Z2luLnJlcXVpcmUoJ21peGluLmZpZWxkJyldLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gKCkge1xuICAgICAgLy8gR2V0IGFsbCB0aGUgY2hlY2tlZCBjaGVja2JveGVzIGFuZCBjb252ZXJ0IHRvIGFuIGFycmF5IG9mIHZhbHVlcy5cbiAgICAgIHZhciBjaG9pY2VOb2RlcyA9IHRoaXMucmVmcy5jaG9pY2VzLmdldERPTU5vZGUoKS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW5wdXQnKTtcbiAgICAgIGNob2ljZU5vZGVzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoY2hvaWNlTm9kZXMsIDApO1xuICAgICAgdmFyIHZhbHVlcyA9IGNob2ljZU5vZGVzLm1hcChmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICByZXR1cm4gbm9kZS5jaGVja2VkID8gbm9kZS52YWx1ZSA6IG51bGw7XG4gICAgICB9KS5maWx0ZXIoZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5wcm9wcy5maWVsZC52YWwodmFsdWVzKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICAgIHZhciBjaG9pY2VzID0gZmllbGQuZGVmLmNob2ljZXMgfHwgW107XG5cbiAgICAgIHZhciBpc0lubGluZSA9ICFfLmZpbmQoY2hvaWNlcywgZnVuY3Rpb24gKGNob2ljZSkge1xuICAgICAgICByZXR1cm4gY2hvaWNlLnNhbXBsZTtcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgdmFsdWUgPSBmaWVsZC52YWx1ZSB8fCBbXTtcblxuICAgICAgcmV0dXJuIHBsdWdpbi5jb21wb25lbnQoJ2ZpZWxkJykoe1xuICAgICAgICBmaWVsZDogZmllbGRcbiAgICAgIH0sXG4gICAgICAgIFIuZGl2KHtjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lLCByZWY6ICdjaG9pY2VzJ30sXG4gICAgICAgICAgY2hvaWNlcy5tYXAoZnVuY3Rpb24gKGNob2ljZSwgaSkge1xuXG4gICAgICAgICAgICB2YXIgaW5wdXRGaWVsZCA9IFIuc3Bhbih7c3R5bGU6IHt3aGl0ZVNwYWNlOiAnbm93cmFwJ319LFxuICAgICAgICAgICAgICBSLmlucHV0KHtcbiAgICAgICAgICAgICAgICBuYW1lOiBmaWVsZC5kZWYua2V5LFxuICAgICAgICAgICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgICAgICAgICAgdmFsdWU6IGNob2ljZS52YWx1ZSxcbiAgICAgICAgICAgICAgICBjaGVja2VkOiB2YWx1ZS5pbmRleE9mKGNob2ljZS52YWx1ZSkgPj0gMCA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZVxuICAgICAgICAgICAgICAgIC8vb25Gb2N1czogdGhpcy5wcm9wcy5hY3Rpb25zLmZvY3VzXG4gICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAnICcsXG4gICAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAnZmllbGQtY2hvaWNlLWxhYmVsJ30sXG4gICAgICAgICAgICAgICAgY2hvaWNlLmxhYmVsXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGlmIChpc0lubGluZSkge1xuICAgICAgICAgICAgICByZXR1cm4gUi5zcGFuKHtrZXk6IGksIGNsYXNzTmFtZTogJ2ZpZWxkLWNob2ljZSd9LFxuICAgICAgICAgICAgICAgIGlucHV0RmllbGQsICcgJ1xuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFIuZGl2KHtrZXk6IGksIGNsYXNzTmFtZTogJ2ZpZWxkLWNob2ljZSd9LFxuICAgICAgICAgICAgICAgIGlucHV0RmllbGQsICcgJyxcbiAgICAgICAgICAgICAgICBwbHVnaW4uY29tcG9uZW50KCdzYW1wbGUnKSh7ZmllbGQ6IGZpZWxkLCBjaG9pY2U6IGNob2ljZX0pXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxudmFyIENTU1RyYW5zaXRpb25Hcm91cCA9IFJlYWN0LmNyZWF0ZUZhY3RvcnkoUmVhY3QuYWRkb25zLkNTU1RyYW5zaXRpb25Hcm91cCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgbWl4aW5zOiBbXG4gICAgICAvL3BsdWdpbi5yZXF1aXJlKCdtaXhpbi5yZXNpemUnKSxcbiAgICAgIC8vcGx1Z2luLnJlcXVpcmUoJ21peGluLnNjcm9sbCcpLFxuICAgICAgcGx1Z2luLnJlcXVpcmUoJ21peGluLmNsaWNrLW91dHNpZGUnKVxuICAgIF0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG1heEhlaWdodDogbnVsbCxcbiAgICAgICAgb3BlbjogdGhpcy5wcm9wcy5vcGVuXG4gICAgICB9O1xuICAgIH0sXG4gICAgLy9cbiAgICAvLyBvblRvZ2dsZTogZnVuY3Rpb24gKCkge1xuICAgIC8vICAgdGhpcy5zZXRTdGF0ZSh7b3BlbjogIXRoaXMuc3RhdGUub3Blbn0pO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyBvbkNsb3NlOiBmdW5jdGlvbiAoKSB7XG4gICAgLy8gICB0aGlzLnNldFN0YXRlKHtvcGVuOiBmYWxzZX0pO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyBmaXhDaG9pY2VzV2lkdGg6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyAgIHRoaXMuc2V0U3RhdGUoe1xuICAgIC8vICAgICBjaG9pY2VzV2lkdGg6IHRoaXMucmVmcy5hY3RpdmUuZ2V0RE9NTm9kZSgpLm9mZnNldFdpZHRoXG4gICAgLy8gICB9KTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gb25SZXNpemVXaW5kb3c6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyAgIHRoaXMuZml4Q2hvaWNlc1dpZHRoKCk7XG4gICAgLy8gfSxcblxuICAgIC8vIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgLy8gICB0aGlzLmZpeENob2ljZXNXaWR0aCgpO1xuICAgIC8vICAgdGhpcy5zZXRPbkNsaWNrT3V0c2lkZSgnc2VsZWN0JywgdGhpcy5vbkNsb3NlKTtcbiAgICAvLyB9LFxuXG4gICAgZ2V0SWdub3JlQ2xvc2VOb2RlczogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKCF0aGlzLnByb3BzLmlnbm9yZUNsb3NlTm9kZXMpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfVxuICAgICAgdmFyIG5vZGVzID0gdGhpcy5wcm9wcy5pZ25vcmVDbG9zZU5vZGVzKCk7XG4gICAgICBpZiAoIV8uaXNBcnJheShub2RlcykpIHtcbiAgICAgICAgbm9kZXMgPSBbbm9kZXNdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5vZGVzO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zZXRPbkNsaWNrT3V0c2lkZSgnY2hvaWNlcycsIGZ1bmN0aW9uIChldmVudCkge1xuXG4gICAgICAgIC8vIE1ha2Ugc3VyZSB3ZSBkb24ndCBmaW5kIGFueSBub2RlcyB0byBpZ25vcmUuXG4gICAgICAgIGlmICghXy5maW5kKHRoaXMuZ2V0SWdub3JlQ2xvc2VOb2RlcygpLCBmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmlzTm9kZUluc2lkZShldmVudC50YXJnZXQsIG5vZGUpO1xuICAgICAgICB9LmJpbmQodGhpcykpKSB7XG4gICAgICAgICAgdGhpcy5wcm9wcy5vbkNsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgIHRoaXMuYWRqdXN0U2l6ZSgpO1xuICAgIH0sXG5cbiAgICBvblNlbGVjdDogZnVuY3Rpb24gKGNob2ljZSkge1xuICAgICAgdGhpcy5wcm9wcy5vblNlbGVjdChjaG9pY2UudmFsdWUpO1xuICAgIH0sXG5cbiAgICBvblJlc2l6ZVdpbmRvdzogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5hZGp1c3RTaXplKCk7XG4gICAgfSxcblxuICAgIG9uU2Nyb2xsV2luZG93OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmFkanVzdFNpemUoKTtcbiAgICB9LFxuXG4gICAgYWRqdXN0U2l6ZTogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMucmVmcy5jaG9pY2VzKSB7XG4gICAgICAgIHZhciBub2RlID0gdGhpcy5yZWZzLmNob2ljZXMuZ2V0RE9NTm9kZSgpO1xuICAgICAgICB2YXIgcmVjdCA9IG5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIHZhciB0b3AgPSByZWN0LnRvcDtcbiAgICAgICAgdmFyIHdpbmRvd0hlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICAgICAgdmFyIGhlaWdodCA9IHdpbmRvd0hlaWdodCAtIHRvcDtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgbWF4SGVpZ2h0OiBoZWlnaHRcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXh0UHJvcHMpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe29wZW46IG5leHRQcm9wcy5vcGVufSwgZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmFkanVzdFNpemUoKTtcbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSxcblxuICAgIG9uU2Nyb2xsOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdzdG9wIHRoYXQhJylcbiAgICAgIC8vIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAvLyBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9LFxuXG4gICAgb25XaGVlbDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAvLyBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgLy8gZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgY2hvaWNlcyA9IHRoaXMucHJvcHMuY2hvaWNlcztcblxuICAgICAgaWYgKGNob2ljZXMgJiYgY2hvaWNlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgY2hvaWNlcyA9IFt7dmFsdWU6ICcvLy9lbXB0eS8vLyd9XTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIFIuZGl2KHtyZWY6ICdjb250YWluZXInLCBvbldoZWVsOiB0aGlzLm9uV2hlZWwsIG9uU2Nyb2xsOiB0aGlzLm9uU2Nyb2xsLCBjbGFzc05hbWU6ICdjaG9pY2VzLWNvbnRhaW5lcicsIHN0eWxlOiB7XG4gICAgICAgIHVzZXJTZWxlY3Q6ICdub25lJywgV2Via2l0VXNlclNlbGVjdDogJ25vbmUnLCBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgbWF4SGVpZ2h0OiB0aGlzLnN0YXRlLm1heEhlaWdodCA/IHRoaXMuc3RhdGUubWF4SGVpZ2h0IDogbnVsbFxuICAgICAgfX0sXG4gICAgICAgIENTU1RyYW5zaXRpb25Hcm91cCh7dHJhbnNpdGlvbk5hbWU6ICdyZXZlYWwnfSxcbiAgICAgICAgICB0aGlzLnByb3BzLm9wZW4gPyBSLnVsKHtyZWY6ICdjaG9pY2VzJywgY2xhc3NOYW1lOiAnY2hvaWNlcyd9LFxuICAgICAgICAgICAgY2hvaWNlcy5tYXAoZnVuY3Rpb24gKGNob2ljZSwgaSkge1xuXG4gICAgICAgICAgICAgIHZhciBjaG9pY2VFbGVtZW50ID0gbnVsbDtcblxuICAgICAgICAgICAgICBpZiAoY2hvaWNlLnZhbHVlID09PSAnLy8vbG9hZGluZy8vLycpIHtcbiAgICAgICAgICAgICAgICBjaG9pY2VFbGVtZW50ID0gUi5hKHtocmVmOiAnSmF2YVNjcmlwdCcgKyAnOicsIG9uQ2xpY2s6IHRoaXMucHJvcHMub25DbG9zZX0sXG4gICAgICAgICAgICAgICAgICBSLnNwYW4oe2NsYXNzTmFtZTogJ2Nob2ljZS1sYWJlbCd9LFxuICAgICAgICAgICAgICAgICAgICAnTG9hZGluZy4uLidcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNob2ljZS52YWx1ZSA9PT0gJy8vL2VtcHR5Ly8vJykge1xuICAgICAgICAgICAgICAgIGNob2ljZUVsZW1lbnQgPSBSLmEoe2hyZWY6ICdKYXZhU2NyaXB0JyArICc6Jywgb25DbGljazogdGhpcy5wcm9wcy5vbkNsb3NlfSxcbiAgICAgICAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAnY2hvaWNlLWxhYmVsJ30sXG4gICAgICAgICAgICAgICAgICAgICdObyBjaG9pY2VzIGF2YWlsYWJsZS4nXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjaG9pY2VFbGVtZW50ID0gUi5hKHtocmVmOiAnSmF2YVNjcmlwdCcgKyAnOicsIG9uQ2xpY2s6IHRoaXMub25TZWxlY3QuYmluZCh0aGlzLCBjaG9pY2UpfSxcbiAgICAgICAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAnY2hvaWNlLWxhYmVsJ30sXG4gICAgICAgICAgICAgICAgICAgIGNob2ljZS5sYWJlbFxuICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAnY2hvaWNlLXNhbXBsZSd9LFxuICAgICAgICAgICAgICAgICAgICBjaG9pY2Uuc2FtcGxlXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHJldHVybiBSLmxpKHtrZXk6IGksIGNsYXNzTmFtZTogJ2Nob2ljZSd9LFxuICAgICAgICAgICAgICAgIGNob2ljZUVsZW1lbnRcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgICApIDogbnVsbFxuICAgICAgICApXG4gICAgICApO1xuXG5cbiAgICAgIC8vIHZhciBjbGFzc05hbWUgPSBmb3JtYXRpYy5jbGFzc05hbWUoJ2Ryb3Bkb3duLWZpZWxkJywgcGx1Z2luLmNvbmZpZy5jbGFzc05hbWUsIHRoaXMucHJvcHMuZmllbGQuY2xhc3NOYW1lKTtcbiAgICAgIC8vXG4gICAgICAvLyB2YXIgc2VsZWN0ZWRMYWJlbCA9ICcnO1xuICAgICAgLy8gdmFyIG1hdGNoaW5nTGFiZWxzID0gdGhpcy5wcm9wcy5maWVsZC5jaG9pY2VzLmZpbHRlcihmdW5jdGlvbiAoY2hvaWNlKSB7XG4gICAgICAvLyAgIHJldHVybiBjaG9pY2UudmFsdWUgPT09IHRoaXMucHJvcHMuZmllbGQudmFsdWU7XG4gICAgICAvLyB9LmJpbmQodGhpcykpO1xuICAgICAgLy8gaWYgKG1hdGNoaW5nTGFiZWxzLmxlbmd0aCA+IDApIHtcbiAgICAgIC8vICAgc2VsZWN0ZWRMYWJlbCA9IG1hdGNoaW5nTGFiZWxzWzBdLmxhYmVsO1xuICAgICAgLy8gfVxuICAgICAgLy8gc2VsZWN0ZWRMYWJlbCA9IHNlbGVjdGVkTGFiZWwgfHwgJ1xcdTAwYTAnO1xuICAgICAgLy9cbiAgICAgIC8vIHJldHVybiBSLmRpdihfLmV4dGVuZCh7Y2xhc3NOYW1lOiBjbGFzc05hbWUsIHJlZjogJ3NlbGVjdCd9LCBwbHVnaW4uY29uZmlnLmF0dHJpYnV0ZXMpLFxuICAgICAgLy8gICBSLmRpdih7Y2xhc3NOYW1lOiAnZmllbGQtdmFsdWUnLCByZWY6ICdhY3RpdmUnLCBvbkNsaWNrOiB0aGlzLm9uVG9nZ2xlfSwgc2VsZWN0ZWRMYWJlbCksXG4gICAgICAvLyAgIFIuZGl2KHtjbGFzc05hbWU6ICdmaWVsZC10b2dnbGUgJyArICh0aGlzLnN0YXRlLm9wZW4gPyAnZmllbGQtb3BlbicgOiAnZmllbGQtY2xvc2VkJyksIG9uQ2xpY2s6IHRoaXMub25Ub2dnbGV9KSxcbiAgICAgIC8vICAgUmVhY3QuYWRkb25zLkNTU1RyYW5zaXRpb25Hcm91cCh7dHJhbnNpdGlvbk5hbWU6ICdyZXZlYWwnfSxcbiAgICAgIC8vICAgICBSLmRpdih7Y2xhc3NOYW1lOiAnZmllbGQtY2hvaWNlcy1jb250YWluZXInfSxcbiAgICAgIC8vICAgICAgIHRoaXMuc3RhdGUub3BlbiA/IFIudWwoe3JlZjogJ2Nob2ljZXMnLCBjbGFzc05hbWU6ICdmaWVsZC1jaG9pY2VzJywgc3R5bGU6IHt3aWR0aDogdGhpcy5zdGF0ZS5jaG9pY2VzV2lkdGh9fSxcbiAgICAgIC8vICAgICAgICAgdGhpcy5wcm9wcy5maWVsZC5jaG9pY2VzLm1hcChmdW5jdGlvbiAoY2hvaWNlKSB7XG4gICAgICAvLyAgICAgICAgICAgcmV0dXJuIFIubGkoe1xuICAgICAgLy8gICAgICAgICAgICAgY2xhc3NOYW1lOiAnZmllbGQtY2hvaWNlJyxcbiAgICAgIC8vICAgICAgICAgICAgIG9uQ2xpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7b3BlbjogZmFsc2V9KTtcbiAgICAgIC8vICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5mb3JtLmFjdGlvbnMuY2hhbmdlKHRoaXMucHJvcHMuZmllbGQsIGNob2ljZS52YWx1ZSk7XG4gICAgICAvLyAgICAgICAgICAgICB9LmJpbmQodGhpcylcbiAgICAgIC8vICAgICAgICAgICB9LCBjaG9pY2UubGFiZWwpO1xuICAgICAgLy8gICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAvLyAgICAgICApIDogW11cbiAgICAgIC8vICAgICApXG4gICAgICAvLyAgIClcbiAgICAgIC8vICk7XG4gICAgfVxuICB9KTtcbn07XG5cblxuLy8gY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbi8vICAgdGhpcy5zZXRPbkNsaWNrT3V0c2lkZSgnY2hvaWNlcycsIGZ1bmN0aW9uIChldmVudCkge1xuLy9cbi8vICAgICAvLyBNYWtlIHN1cmUgd2UgZG9uJ3QgZmluZCBhbnkgbm9kZXMgdG8gaWdub3JlLlxuLy8gICAgIGlmICghXy5maW5kKHRoaXMuZ2V0SWdub3JlQ2xvc2VOb2RlcygpLCBmdW5jdGlvbiAobm9kZSkge1xuLy8gICAgICAgY29uc29sZS5sb2cobm9kZSwgZXZlbnQudGFyZ2V0KVxuLy8gICAgICAgcmV0dXJuICF0aGlzLmlzTm9kZU91dHNpZGUobm9kZSwgZXZlbnQudGFyZ2V0KTtcbi8vICAgICB9LmJpbmQodGhpcykpKSB7XG4vLyAgICAgICBjb25zb2xlLmxvZyhcImhvdz8/P1wiKVxuLy8gICAgICAgdGhpcy5wcm9wcy5vbkNsb3NlKCk7XG4vLyAgICAgfVxuLy8gICB9LmJpbmQodGhpcykpO1xuLy8gfSxcbi8vXG4vLyBvblNlbGVjdDogZnVuY3Rpb24gKGNob2ljZSkge1xuLy8gICB0aGlzLnByb3BzLm9uU2VsZWN0KGNob2ljZS52YWx1ZSk7XG4vLyB9LFxuLy9cbi8vIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuLy9cbi8vICAgcmV0dXJuIFIuZGl2KHtyZWY6ICdjb250YWluZXInLCBjbGFzc05hbWU6ICdjaG9pY2VzLWNvbnRhaW5lcicsIHN0eWxlOiB7dXNlclNlbGVjdDogJ25vbmUnLCBXZWJraXRVc2VyU2VsZWN0OiAnbm9uZScsIHBvc2l0aW9uOiAnYWJzb2x1dGUnfX0sXG4vLyAgICAgdGhpcy5wcm9wcy5vcGVuID9cbi8vICAgICAgIENTU1RyYW5zaXRpb25Hcm91cCh7dHJhbnNpdGlvbk5hbWU6ICdyZXZlYWwnfSxcbi8vICAgICAgICAgUi51bCh7cmVmOiAnY2hvaWNlcycsIGNsYXNzTmFtZTogJ2Nob2ljZXMnfSxcbi8vICAgICAgICAgICB0aGlzLnByb3BzLmNob2ljZXMubWFwKGZ1bmN0aW9uIChjaG9pY2UsIGkpIHtcbi8vICAgICAgICAgICAgIHJldHVybiBSLmxpKHtrZXk6IGksIGNsYXNzTmFtZTogJ2Nob2ljZSd9LFxuLy8gICAgICAgICAgICAgICBSLmEoe2hyZWY6ICdKYXZhU2NyaXB0OicgKyAnJywgb25DbGljazogdGhpcy5vblNlbGVjdC5iaW5kKHRoaXMsIGNob2ljZSl9LFxuLy8gICAgICAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAnY2hvaWNlLWxhYmVsJ30sXG4vLyAgICAgICAgICAgICAgICAgICBjaG9pY2UubGFiZWxcbi8vICAgICAgICAgICAgICAgICApLFxuLy8gICAgICAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAnY2hvaWNlLXNhbXBsZSd9LFxuLy8gICAgICAgICAgICAgICAgICAgY2hvaWNlLnNhbXBsZVxuLy8gICAgICAgICAgICAgICAgIClcbi8vICAgICAgICAgICAgICAgKVxuLy8gICAgICAgICAgICAgKTtcbi8vICAgICAgICAgICB9LmJpbmQodGhpcykpXG4vLyAgICAgICAgIClcbi8vICAgICAgIClcbi8vICAgICAgIDogbnVsbFxuLy8gICApO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC5maWVsZFxuXG4vKlxuVXNlZCBieSBhbnkgZmllbGRzIHRvIHB1dCB0aGUgbGFiZWwgYW5kIGhlbHAgdGV4dCBhcm91bmQgdGhlIGZpZWxkLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbnZhciBDU1NUcmFuc2l0aW9uR3JvdXAgPSBSZWFjdC5jcmVhdGVGYWN0b3J5KFJlYWN0LmFkZG9ucy5DU1NUcmFuc2l0aW9uR3JvdXApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGRpc3BsYXlOYW1lOiBwbHVnaW4ubmFtZSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjb2xsYXBzZWQ6IHRoaXMucHJvcHMuZmllbGQuZGVmLmNvbGxhcHNlZCA/IHRydWUgOiBmYWxzZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgaXNDb2xsYXBzaWJsZTogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgICAgcmV0dXJuICFfLmlzVW5kZWZpbmVkKGZpZWxkLmRlZi5jb2xsYXBzZWQpIHx8ICFfLmlzVW5kZWZpbmVkKGZpZWxkLmRlZi5jb2xsYXBzaWJsZSk7XG4gICAgfSxcblxuICAgIG9uQ2xpY2tMYWJlbDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGNvbGxhcHNlZDogIXRoaXMuc3RhdGUuY29sbGFwc2VkXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICAgIHZhciBpbmRleCA9IHRoaXMucHJvcHMuaW5kZXg7XG4gICAgICBpZiAoIV8uaXNOdW1iZXIoaW5kZXgpKSB7XG4gICAgICAgIGluZGV4ID0gXy5pc051bWJlcihmaWVsZC5kZWYua2V5KSA/IGZpZWxkLmRlZi5rZXkgOiB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZSwgc3R5bGU6IHtkaXNwbGF5OiAoZmllbGQuaGlkZGVuKCkgPyAnbm9uZScgOiAnJyl9fSxcbiAgICAgICAgcGx1Z2luLmNvbXBvbmVudCgnbGFiZWwnKSh7ZmllbGQ6IGZpZWxkLCBpbmRleDogaW5kZXgsIG9uQ2xpY2s6IHRoaXMuaXNDb2xsYXBzaWJsZSgpID8gdGhpcy5vbkNsaWNrTGFiZWwgOiBudWxsfSksXG4gICAgICAgIENTU1RyYW5zaXRpb25Hcm91cCh7dHJhbnNpdGlvbk5hbWU6ICdyZXZlYWwnfSxcbiAgICAgICAgICB0aGlzLnN0YXRlLmNvbGxhcHNlZCA/IFtdIDogW1xuICAgICAgICAgICAgcGx1Z2luLmNvbXBvbmVudCgnaGVscCcpKHtrZXk6ICdoZWxwJywgZmllbGQ6IGZpZWxkfSksXG4gICAgICAgICAgICB0aGlzLnByb3BzLmNoaWxkcmVuXG4gICAgICAgICAgXVxuICAgICAgICApXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC5maWVsZHNldFxuXG4vKlxuUmVuZGVyIG11bHRpcGxlIGNoaWxkIGZpZWxkcyBmb3IgYSBmaWVsZC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBtaXhpbnM6IFtwbHVnaW4ucmVxdWlyZSgnbWl4aW4uZmllbGQnKV0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgICAgcmV0dXJuIHBsdWdpbi5jb21wb25lbnQoJ2ZpZWxkJykoe1xuICAgICAgICBmaWVsZDogZmllbGRcbiAgICAgIH0sXG4gICAgICAgIFIuZmllbGRzZXQoe2NsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWV9LFxuICAgICAgICAgIGZpZWxkLmZpZWxkcygpLm1hcChmdW5jdGlvbiAoZmllbGQsIGkpIHtcbiAgICAgICAgICAgIHJldHVybiBmaWVsZC5jb21wb25lbnQoe2tleTogZmllbGQuZGVmLmtleSB8fCBpfSk7XG4gICAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC5mb3JtYXRpY1xuXG4vKlxuVG9wLWxldmVsIGNvbXBvbmVudCB3aGljaCBnZXRzIGEgZm9ybSBhbmQgdGhlbiBsaXN0ZW5zIHRvIHRoZSBmb3JtIGZvciBjaGFuZ2VzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGRpc3BsYXlOYW1lOiBwbHVnaW4ubmFtZSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZmllbGQ6IHRoaXMucHJvcHMuZm9ybS5maWVsZCgpXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZm9ybSA9IHRoaXMucHJvcHMuZm9ybTtcbiAgICAgIGZvcm0ub24oJ2NoYW5nZScsIHRoaXMub25Gb3JtQ2hhbmdlZCk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZm9ybSA9IHRoaXMucHJvcHMuZm9ybTtcbiAgICAgIGZvcm0ub2ZmKCdjaGFuZ2UnLCB0aGlzLm9uRm9ybUNoYW5nZWQpO1xuICAgIH0sXG5cbiAgICBvbkZvcm1DaGFuZ2VkOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIGlmICh0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4gICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UodGhpcy5wcm9wcy5mb3JtLnZhbCgpLCBldmVudC5jaGFuZ2luZyk7XG4gICAgICB9XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgZmllbGQ6IHRoaXMucHJvcHMuZm9ybS5maWVsZCgpXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogJ2Zvcm1hdGljJ30sXG4gICAgICAgIHRoaXMuc3RhdGUuZmllbGQuY29tcG9uZW50KClcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50LmhlbHBcblxuLypcbkp1c3QgdGhlIGhlbHAgdGV4dCBibG9jay5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgICByZXR1cm4gZmllbGQuZGVmLmhlbHBUZXh0ID9cbiAgICAgICAgUi5kaXYoe2NsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWV9LFxuICAgICAgICAgIGZpZWxkLmRlZi5oZWxwVGV4dFxuICAgICAgICApIDpcbiAgICAgICAgUi5zcGFuKG51bGwpO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC5pdGVtLWNob2ljZXNcblxuLypcbkdpdmUgYSBsaXN0IG9mIGNob2ljZXMgb2YgaXRlbSB0eXBlcyB0byBjcmVhdGUgYXMgY2hpbGRyZW4gb2YgYW4gZmllbGQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZGlzcGxheU5hbWU6IHBsdWdpbi5uYW1lLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICB0aGlzLnByb3BzLm9uU2VsZWN0KHBhcnNlSW50KGV2ZW50LnRhcmdldC52YWx1ZSkpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgICAgdmFyIHR5cGVDaG9pY2VzID0gbnVsbDtcbiAgICAgIGlmIChmaWVsZC5pdGVtcygpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdHlwZUNob2ljZXMgPSBSLnNlbGVjdCh7Y2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZSwgdmFsdWU6IHRoaXMudmFsdWUsIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlfSxcbiAgICAgICAgICBmaWVsZC5pdGVtcygpLm1hcChmdW5jdGlvbiAoaXRlbSwgaSkge1xuICAgICAgICAgICAgcmV0dXJuIFIub3B0aW9uKHtrZXk6IGksIHZhbHVlOiBpfSwgaXRlbS5sYWJlbCB8fCBpKTtcbiAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHlwZUNob2ljZXMgPyB0eXBlQ2hvaWNlcyA6IFIuc3BhbihudWxsKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQuanNvblxuXG4vKlxuVGV4dGFyZWEgZWRpdG9yIGZvciBKU09OLiBXaWxsIHZhbGlkYXRlIHRoZSBKU09OIGJlZm9yZSBzZXR0aW5nIHRoZSB2YWx1ZSwgc29cbndoaWxlIHRoZSB2YWx1ZSBpcyBpbnZhbGlkLCBubyBleHRlcm5hbCBzdGF0ZSBjaGFuZ2VzIHdpbGwgb2NjdXIuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZGlzcGxheU5hbWU6IHBsdWdpbi5uYW1lLFxuXG4gICAgbWl4aW5zOiBbcGx1Z2luLnJlcXVpcmUoJ21peGluLmZpZWxkJyldLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lLFxuICAgICAgICByb3dzOiBwbHVnaW4uY29uZmlnLnJvd3MgfHwgNVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgaXNWYWxpZFZhbHVlOiBmdW5jdGlvbiAodmFsdWUpIHtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaXNWYWxpZDogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IEpTT04uc3RyaW5naWZ5KHRoaXMucHJvcHMuZmllbGQudmFsdWUsIG51bGwsIDIpXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICB2YXIgaXNWYWxpZCA9IHRoaXMuaXNWYWxpZFZhbHVlKGV2ZW50LnRhcmdldC52YWx1ZSk7XG5cbiAgICAgIGlmIChpc1ZhbGlkKSB7XG4gICAgICAgIC8vIE5lZWQgdG8gaGFuZGxlIHRoaXMgYmV0dGVyLiBOZWVkIHRvIHRyYWNrIHBvc2l0aW9uLlxuICAgICAgICB0aGlzLl9pc0NoYW5naW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5wcm9wcy5maWVsZC52YWwoSlNPTi5wYXJzZShldmVudC50YXJnZXQudmFsdWUpKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGlzVmFsaWQ6IGlzVmFsaWQsXG4gICAgICAgIHZhbHVlOiBldmVudC50YXJnZXQudmFsdWVcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV4dFByb3BzKSB7XG4gICAgICBpZiAoIXRoaXMuX2lzQ2hhbmdpbmcpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgaXNWYWxpZDogdHJ1ZSxcbiAgICAgICAgICB2YWx1ZTogSlNPTi5zdHJpbmdpZnkobmV4dFByb3BzLmZpZWxkLnZhbHVlLCBudWxsLCAyKVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2lzQ2hhbmdpbmcgPSBmYWxzZTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICAgIHJldHVybiBwbHVnaW4uY29tcG9uZW50KCdmaWVsZCcpKHtcbiAgICAgICAgZmllbGQ6IGZpZWxkXG4gICAgICB9LCBSLnRleHRhcmVhKHtcbiAgICAgICAgICBjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lLFxuICAgICAgICAgIHZhbHVlOiB0aGlzLnN0YXRlLnZhbHVlLFxuICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgICAgIHN0eWxlOiB7YmFja2dyb3VuZENvbG9yOiB0aGlzLnN0YXRlLmlzVmFsaWQgPyAnJyA6ICdyZ2IoMjU1LDIwMCwyMDApJ30sXG4gICAgICAgICAgcm93czogZmllbGQuZGVmLnJvd3MgfHwgdGhpcy5wcm9wcy5yb3dzXG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC5sYWJlbFxuXG4vKlxuSnVzdCB0aGUgbGFiZWwgZm9yIGEgZmllbGQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZGlzcGxheU5hbWU6IHBsdWdpbi5uYW1lLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgICAgdmFyIGxhYmVsID0gbnVsbDtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5wcm9wcy5pbmRleCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgbGFiZWwgPSAnJyArICh0aGlzLnByb3BzLmluZGV4ICsgMSkgKyAnLic7XG4gICAgICAgIGlmIChmaWVsZC5kZWYubGFiZWwpIHtcbiAgICAgICAgICBsYWJlbCA9IGxhYmVsICsgJyAnICsgZmllbGQuZGVmLmxhYmVsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChmaWVsZC5kZWYubGFiZWwgfHwgbGFiZWwpIHtcbiAgICAgICAgdmFyIHRleHQgPSBsYWJlbCB8fCBmaWVsZC5kZWYubGFiZWw7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uQ2xpY2spIHtcbiAgICAgICAgICB0ZXh0ID0gUi5hKHtocmVmOiAnSmF2YVNjcmlwdCcgKyAnOicsIG9uQ2xpY2s6IHRoaXMucHJvcHMub25DbGlja30sIHRleHQpO1xuICAgICAgICB9XG4gICAgICAgIGxhYmVsID0gUi5sYWJlbCh7fSwgdGV4dCk7XG4gICAgICB9XG5cbiAgICAgIHZhciByZXF1aXJlZCA9IFIuc3Bhbih7Y2xhc3NOYW1lOiAncmVxdWlyZWQtdGV4dCd9KTtcblxuICAgICAgcmV0dXJuIFIuZGl2KHtcbiAgICAgICAgY2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZVxuICAgICAgfSxcbiAgICAgICAgbGFiZWwsXG4gICAgICAgICcgJyxcbiAgICAgICAgcmVxdWlyZWRcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50Lmxpc3QtY29udHJvbFxuXG4vKlxuUmVuZGVyIHRoZSBpdGVtIHR5cGUgY2hvaWNlcyBhbmQgdGhlIGFkZCBidXR0b24uXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZGlzcGxheU5hbWU6IHBsdWdpbi5uYW1lLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGl0ZW1JbmRleDogMFxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgb25TZWxlY3Q6IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGl0ZW1JbmRleDogaW5kZXhcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBvbkFwcGVuZDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5wcm9wcy5vbkFwcGVuZCh0aGlzLnN0YXRlLml0ZW1JbmRleCk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgICB2YXIgdHlwZUNob2ljZXMgPSBudWxsO1xuXG4gICAgICBpZiAoZmllbGQuaXRlbXMoKS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHR5cGVDaG9pY2VzID0gcGx1Z2luLmNvbXBvbmVudCgnaXRlbS1jaG9pY2VzJykoe2ZpZWxkOiBmaWVsZCwgdmFsdWU6IHRoaXMuc3RhdGUuaXRlbUluZGV4LCBvblNlbGVjdDogdGhpcy5vblNlbGVjdH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWV9LFxuICAgICAgICB0eXBlQ2hvaWNlcywgJyAnLFxuICAgICAgICBwbHVnaW4uY29tcG9uZW50KCdhZGQtaXRlbScpKHtvbkNsaWNrOiB0aGlzLm9uQXBwZW5kfSlcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50Lmxpc3QtaXRlbS1jb250cm9sXG5cbi8qXG5SZW5kZXIgdGhlIHJlbW92ZSBhbmQgbW92ZSBidXR0b25zIGZvciBhIGZpZWxkLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGRpc3BsYXlOYW1lOiBwbHVnaW4ubmFtZSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgb25Nb3ZlQmFjazogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5wcm9wcy5vbk1vdmUodGhpcy5wcm9wcy5pbmRleCwgdGhpcy5wcm9wcy5pbmRleCAtIDEpO1xuICAgIH0sXG5cbiAgICBvbk1vdmVGb3J3YXJkOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnByb3BzLm9uTW92ZSh0aGlzLnByb3BzLmluZGV4LCB0aGlzLnByb3BzLmluZGV4ICsgMSk7XG4gICAgfSxcblxuICAgIG9uUmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnByb3BzLm9uUmVtb3ZlKHRoaXMucHJvcHMuaW5kZXgpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZX0sXG4gICAgICAgIHBsdWdpbi5jb21wb25lbnQoJ3JlbW92ZS1pdGVtJykoe2ZpZWxkOiBmaWVsZCwgb25DbGljazogdGhpcy5vblJlbW92ZX0pLFxuICAgICAgICB0aGlzLnByb3BzLmluZGV4ID4gMCA/IHBsdWdpbi5jb21wb25lbnQoJ21vdmUtaXRlbS1iYWNrJykoe29uQ2xpY2s6IHRoaXMub25Nb3ZlQmFja30pIDogbnVsbCxcbiAgICAgICAgdGhpcy5wcm9wcy5pbmRleCA8ICh0aGlzLnByb3BzLm51bUl0ZW1zIC0gMSkgPyBwbHVnaW4uY29tcG9uZW50KCdtb3ZlLWl0ZW0tZm9yd2FyZCcpKHtvbkNsaWNrOiB0aGlzLm9uTW92ZUZvcndhcmR9KSA6IG51bGxcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50Lmxpc3QtaXRlbS12YWx1ZVxuXG4vKlxuUmVuZGVyIHRoZSB2YWx1ZSBvZiBhIGxpc3QgaXRlbS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lfSxcbiAgICAgICAgZmllbGQuY29tcG9uZW50KClcbiAgICAgICAgLy8gcGx1Z2luLmNvbXBvbmVudCgnZmllbGQnKSh7XG4gICAgICAgIC8vICAgZmllbGQ6IGZpZWxkLFxuICAgICAgICAvLyAgIGluZGV4OiB0aGlzLnByb3BzLmluZGV4XG4gICAgICAgIC8vIH0sXG4gICAgICAgIC8vICAgZmllbGQuY29tcG9uZW50KClcbiAgICAgICAgLy8gKVxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQubGlzdC1pdGVtXG5cbi8qXG5SZW5kZXIgYSBsaXN0IGl0ZW0uXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZGlzcGxheU5hbWU6IHBsdWdpbi5uYW1lLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZX0sXG4gICAgICAgIHBsdWdpbi5jb21wb25lbnQoJ2xpc3QtaXRlbS12YWx1ZScpKHtmb3JtOiB0aGlzLnByb3BzLmZvcm0sIGZpZWxkOiBmaWVsZCwgaW5kZXg6IHRoaXMucHJvcHMuaW5kZXh9KSxcbiAgICAgICAgcGx1Z2luLmNvbXBvbmVudCgnbGlzdC1pdGVtLWNvbnRyb2wnKSh7ZmllbGQ6IGZpZWxkLCBpbmRleDogdGhpcy5wcm9wcy5pbmRleCwgbnVtSXRlbXM6IHRoaXMucHJvcHMubnVtSXRlbXMsIG9uTW92ZTogdGhpcy5wcm9wcy5vbk1vdmUsIG9uUmVtb3ZlOiB0aGlzLnByb3BzLm9uUmVtb3ZlfSlcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50Lmxpc3RcblxuLypcblJlbmRlciBhIGxpc3QuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG5cbnZhciBDU1NUcmFuc2l0aW9uR3JvdXAgPSBSZWFjdC5jcmVhdGVGYWN0b3J5KFJlYWN0LmFkZG9ucy5DU1NUcmFuc2l0aW9uR3JvdXApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGRpc3BsYXlOYW1lOiBwbHVnaW4ubmFtZSxcblxuICAgIG1peGluczogW3BsdWdpbi5yZXF1aXJlKCdtaXhpbi5maWVsZCcpXSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgbmV4dExvb2t1cElkOiAwLFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIC8vIE5lZWQgdG8gY3JlYXRlIGFydGlmaWNpYWwga2V5cyBmb3IgdGhlIGFycmF5LiBJbmRleGVzIGFyZSBub3QgZ29vZCBrZXlzLFxuICAgICAgLy8gc2luY2UgdGhleSBjaGFuZ2UuIFNvLCBtYXAgZWFjaCBwb3NpdGlvbiB0byBhbiBhcnRpZmljaWFsIGtleVxuICAgICAgdmFyIGxvb2t1cHMgPSBbXTtcbiAgICAgIHRoaXMucHJvcHMuZmllbGQuZmllbGRzKCkuZm9yRWFjaChmdW5jdGlvbiAoZmllbGQsIGkpIHtcbiAgICAgICAgbG9va3Vwc1tpXSA9ICdfJyArIHRoaXMubmV4dExvb2t1cElkO1xuICAgICAgICB0aGlzLm5leHRMb29rdXBJZCsrO1xuICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbG9va3VwczogbG9va3Vwc1xuICAgICAgfTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gKG5ld1Byb3BzKSB7XG5cbiAgICAgIHZhciBsb29rdXBzID0gdGhpcy5zdGF0ZS5sb29rdXBzO1xuICAgICAgdmFyIGZpZWxkcyA9IG5ld1Byb3BzLmZpZWxkLmZpZWxkcygpO1xuXG4gICAgICAvLyBOZWVkIHRvIHNldCBhcnRpZmljaWFsIGtleXMgZm9yIG5ldyBhcnJheSBpdGVtcy5cbiAgICAgIGlmIChmaWVsZHMubGVuZ3RoID4gbG9va3Vwcy5sZW5ndGgpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IGxvb2t1cHMubGVuZ3RoOyBpIDwgZmllbGRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgbG9va3Vwc1tpXSA9ICdfJyArIHRoaXMubmV4dExvb2t1cElkO1xuICAgICAgICAgIHRoaXMubmV4dExvb2t1cElkKys7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGxvb2t1cHM6IGxvb2t1cHNcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBvbkFwcGVuZDogZnVuY3Rpb24gKGl0ZW1JbmRleCkge1xuICAgICAgdGhpcy5wcm9wcy5maWVsZC5hcHBlbmQoaXRlbUluZGV4KTtcbiAgICB9LFxuICAgIC8vXG4gICAgLy8gb25DbGlja0xhYmVsOiBmdW5jdGlvbiAoaSkge1xuICAgIC8vICAgaWYgKHRoaXMucHJvcHMuZmllbGQuY29sbGFwc2FibGVJdGVtcykge1xuICAgIC8vICAgICB2YXIgY29sbGFwc2VkO1xuICAgIC8vICAgICAvLyBpZiAoIXRoaXMuc3RhdGUuY29sbGFwc2VkW2ldKSB7XG4gICAgLy8gICAgIC8vICAgY29sbGFwc2VkID0gdGhpcy5zdGF0ZS5jb2xsYXBzZWQ7XG4gICAgLy8gICAgIC8vICAgY29sbGFwc2VkW2ldID0gdHJ1ZTtcbiAgICAvLyAgICAgLy8gICB0aGlzLnNldFN0YXRlKHtjb2xsYXBzZWQ6IGNvbGxhcHNlZH0pO1xuICAgIC8vICAgICAvLyB9IGVsc2Uge1xuICAgIC8vICAgICAvLyAgIGNvbGxhcHNlZCA9IHRoaXMucHJvcHMuZmllbGQuZmllbGRzLm1hcChmdW5jdGlvbiAoKSB7XG4gICAgLy8gICAgIC8vICAgICByZXR1cm4gdHJ1ZTtcbiAgICAvLyAgICAgLy8gICB9KTtcbiAgICAvLyAgICAgLy8gICBjb2xsYXBzZWRbaV0gPSBmYWxzZTtcbiAgICAvLyAgICAgLy8gICB0aGlzLnNldFN0YXRlKHtjb2xsYXBzZWQ6IGNvbGxhcHNlZH0pO1xuICAgIC8vICAgICAvLyB9XG4gICAgLy8gICAgIGNvbGxhcHNlZCA9IHRoaXMuc3RhdGUuY29sbGFwc2VkO1xuICAgIC8vICAgICBjb2xsYXBzZWRbaV0gPSAhY29sbGFwc2VkW2ldO1xuICAgIC8vICAgICB0aGlzLnNldFN0YXRlKHtjb2xsYXBzZWQ6IGNvbGxhcHNlZH0pO1xuICAgIC8vICAgfVxuICAgIC8vIH0sXG4gICAgLy9cbiAgICBvblJlbW92ZTogZnVuY3Rpb24gKGkpIHtcbiAgICAgIHZhciBsb29rdXBzID0gdGhpcy5zdGF0ZS5sb29rdXBzO1xuICAgICAgbG9va3Vwcy5zcGxpY2UoaSwgMSk7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgbG9va3VwczogbG9va3Vwc1xuICAgICAgfSk7XG4gICAgICB0aGlzLnByb3BzLmZpZWxkLnJlbW92ZShpKTtcbiAgICB9LFxuICAgIC8vXG4gICAgb25Nb3ZlOiBmdW5jdGlvbiAoZnJvbUluZGV4LCB0b0luZGV4KSB7XG4gICAgICB2YXIgbG9va3VwcyA9IHRoaXMuc3RhdGUubG9va3VwcztcbiAgICAgIHZhciBmcm9tSWQgPSBsb29rdXBzW2Zyb21JbmRleF07XG4gICAgICB2YXIgdG9JZCA9IGxvb2t1cHNbdG9JbmRleF07XG4gICAgICBsb29rdXBzW2Zyb21JbmRleF0gPSB0b0lkO1xuICAgICAgbG9va3Vwc1t0b0luZGV4XSA9IGZyb21JZDtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBsb29rdXBzOiBsb29rdXBzXG4gICAgICB9KTtcbiAgICAgIHRoaXMucHJvcHMuZmllbGQubW92ZShmcm9tSW5kZXgsIHRvSW5kZXgpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcbiAgICAgIHZhciBmaWVsZHMgPSBmaWVsZC5maWVsZHMoKTtcblxuICAgICAgdmFyIG51bUl0ZW1zID0gZmllbGRzLmxlbmd0aDtcbiAgICAgIHJldHVybiBwbHVnaW4uY29tcG9uZW50KCdmaWVsZCcpKHtcbiAgICAgICAgZmllbGQ6IGZpZWxkXG4gICAgICB9LFxuICAgICAgICBSLmRpdih7Y2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZX0sXG4gICAgICAgICAgQ1NTVHJhbnNpdGlvbkdyb3VwKHt0cmFuc2l0aW9uTmFtZTogJ3JldmVhbCd9LFxuICAgICAgICAgICAgZmllbGRzLm1hcChmdW5jdGlvbiAoY2hpbGQsIGkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHBsdWdpbi5jb21wb25lbnQoJ2xpc3QtaXRlbScpKHtcbiAgICAgICAgICAgICAgICBrZXk6IHRoaXMuc3RhdGUubG9va3Vwc1tpXSxcbiAgICAgICAgICAgICAgICBmb3JtOiB0aGlzLnByb3BzLmZvcm0sXG4gICAgICAgICAgICAgICAgZmllbGQ6IGNoaWxkLFxuICAgICAgICAgICAgICAgIHBhcmVudDogZmllbGQsXG4gICAgICAgICAgICAgICAgaW5kZXg6IGksXG4gICAgICAgICAgICAgICAgbnVtSXRlbXM6IG51bUl0ZW1zLFxuICAgICAgICAgICAgICAgIG9uTW92ZTogdGhpcy5vbk1vdmUsXG4gICAgICAgICAgICAgICAgb25SZW1vdmU6IHRoaXMub25SZW1vdmVcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgICAgKSxcbiAgICAgICAgICBwbHVnaW4uY29tcG9uZW50KCdsaXN0LWNvbnRyb2wnKSh7ZmllbGQ6IGZpZWxkLCBvbkFwcGVuZDogdGhpcy5vbkFwcGVuZH0pXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50Lm1vdmUtaXRlbS1iYWNrXG5cbi8qXG5CdXR0b24gdG8gbW92ZSBhbiBpdGVtIGJhY2t3YXJkcyBpbiBsaXN0LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGRpc3BsYXlOYW1lOiBwbHVnaW4ubmFtZSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZSxcbiAgICAgICAgbGFiZWw6IHBsdWdpbi5jb25maWdWYWx1ZSgnbGFiZWwnLCAnW3VwXScpXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBSLnNwYW4oe2NsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWUsIG9uQ2xpY2s6IHRoaXMucHJvcHMub25DbGlja30sIHRoaXMucHJvcHMubGFiZWwpO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC5tb3ZlLWl0ZW0tZm9yd2FyZFxuXG4vKlxuQnV0dG9uIHRvIG1vdmUgYW4gaXRlbSBmb3J3YXJkIGluIGEgbGlzdC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWUsXG4gICAgICAgIGxhYmVsOiBwbHVnaW4uY29uZmlnVmFsdWUoJ2xhYmVsJywgJ1tkb3duXScpXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBSLnNwYW4oe2NsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWUsIG9uQ2xpY2s6IHRoaXMucHJvcHMub25DbGlja30sIHRoaXMucHJvcHMubGFiZWwpO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC5wcmV0dHktdGV4dGFyZWFcblxuLypcblRleHRhcmVhIHRoYXQgd2lsbCBkaXNwbGF5IGhpZ2hsaWdodHMgYmVoaW5kIFwidGFnc1wiLiBUYWdzIGN1cnJlbnRseSBtZWFuIHRleHRcbnRoYXQgaXMgZW5jbG9zZWQgaW4gYnJhY2VzIGxpa2UgYHt7Zm9vfX1gLiBUYWdzIGFyZSByZXBsYWNlZCB3aXRoIGxhYmVscyBpZlxuYXZhaWxhYmxlIG9yIGh1bWFuaXplZC5cblxuVGhpcyBjb21wb25lbnQgaXMgcXVpdGUgY29tcGxpY2F0ZWQgYmVjYXVzZTpcbi0gV2UgYXJlIGRpc3BsYXlpbmcgdGV4dCBpbiB0aGUgdGV4dGFyZWEgYnV0IGhhdmUgdG8ga2VlcCB0cmFjayBvZiB0aGUgcmVhbFxuICB0ZXh0IHZhbHVlIGluIHRoZSBiYWNrZ3JvdW5kLiBXZSBjYW4ndCB1c2UgYSBkYXRhIGF0dHJpYnV0ZSwgYmVjYXVzZSBpdCdzIGFcbiAgdGV4dGFyZWEsIHNvIHdlIGNhbid0IHVzZSBhbnkgZWxlbWVudHMgYXQgYWxsIVxuLSBCZWNhdXNlIG9mIHRoZSBoaWRkZW4gZGF0YSwgd2UgYWxzbyBoYXZlIHRvIGRvIHNvbWUgaW50ZXJjZXB0aW9uIG9mXG4gIGNvcHksIHdoaWNoIGlzIGEgbGl0dGxlIHdlaXJkLiBXZSBpbnRlcmNlcHQgY29weSBhbmQgY29weSB0aGUgcmVhbCB0ZXh0XG4gIHRvIHRoZSBlbmQgb2YgdGhlIHRleHRhcmVhLiBUaGVuIHdlIGVyYXNlIHRoYXQgdGV4dCwgd2hpY2ggbGVhdmVzIHRoZSBjb3BpZWRcbiAgZGF0YSBpbiB0aGUgYnVmZmVyLlxuLSBSZWFjdCBsb3NlcyB0aGUgY2FyZXQgcG9zaXRpb24gd2hlbiB5b3UgdXBkYXRlIHRoZSB2YWx1ZSB0byBzb21ldGhpbmdcbiAgZGlmZmVyZW50IHRoYW4gYmVmb3JlLiBTbyB3ZSBoYXZlIHRvIHJldGFpbiB0cmFja2luZyBpbmZvcm1hdGlvbiBmb3Igd2hlblxuICB0aGF0IGhhcHBlbnMuXG4tIEJlY2F1c2Ugd2UgbW9ua2V5IHdpdGggY29weSwgd2UgYWxzbyBoYXZlIHRvIGRvIG91ciBvd24gdW5kby9yZWRvLiBPdGhlcndpc2VcbiAgdGhlIGRlZmF1bHQgdW5kbyB3aWxsIGhhdmUgd2VpcmQgc3RhdGVzIGluIGl0LlxuXG5TbyBnb29kIGx1Y2shXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxudmFyIG5vQnJlYWsgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoLyAvZywgJ1xcdTAwYTAnKTtcbn07XG5cbnZhciBMRUZUX1BBRCA9ICdcXHUwMGEwXFx1MDBhMCc7XG4vLyBXaHkgdGhpcyB3b3JrcywgSSdtIG5vdCBzdXJlLlxudmFyIFJJR0hUX1BBRCA9ICcgICc7IC8vJ1xcdTAwYTBcXHUwMGEwJztcblxudmFyIGlkUHJlZml4UmVnRXggPSAvXlswLTldK19fLztcblxuLy8gWmFwaWVyIHNwZWNpZmljIHN0dWZmLiBNYWtlIGEgcGx1Z2luIGZvciB0aGlzIGxhdGVyLlxudmFyIHJlbW92ZUlkUHJlZml4ID0gZnVuY3Rpb24gKGtleSkge1xuICBpZiAoaWRQcmVmaXhSZWdFeC50ZXN0KGtleSkpIHtcbiAgICByZXR1cm4ga2V5LnJlcGxhY2UoaWRQcmVmaXhSZWdFeCwgJycpO1xuICB9XG4gIHJldHVybiBrZXk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICB2YXIgdXRpbCA9IHBsdWdpbi5yZXF1aXJlKCd1dGlsJyk7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBtaXhpbnM6IFtwbHVnaW4ucmVxdWlyZSgnbWl4aW4uZmllbGQnKSwgcGx1Z2luLnJlcXVpcmUoJ21peGluLnVuZG8tc3RhY2snKSwgcGx1Z2luLnJlcXVpcmUoJ21peGluLnJlc2l6ZScpXSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB1bmRvRGVwdGg6IDEwMCxcbiAgICAgICAgaXNDaG9pY2VzT3BlbjogZmFsc2VcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgLy8gTm90IHF1aXRlIHN0YXRlLCB0aGlzIGlzIGZvciB0cmFja2luZyBzZWxlY3Rpb24gaW5mby5cbiAgICAgIHRoaXMudHJhY2tpbmcgPSB7fTtcblxuICAgICAgdmFyIHBhcnRzID0gdXRpbC5wYXJzZVRleHRXaXRoVGFncyh0aGlzLnByb3BzLmZpZWxkLnZhbHVlKTtcbiAgICAgIHZhciB0b2tlbnMgPSB0aGlzLnRva2VucyhwYXJ0cyk7XG4gICAgICB2YXIgaW5kZXhNYXAgPSB0aGlzLmluZGV4TWFwKHRva2Vucyk7XG5cbiAgICAgIHRoaXMudHJhY2tpbmcucG9zID0gaW5kZXhNYXAubGVuZ3RoO1xuICAgICAgdGhpcy50cmFja2luZy5yYW5nZSA9IDA7XG4gICAgICB0aGlzLnRyYWNraW5nLnRva2VucyA9IHRva2VucztcbiAgICAgIHRoaXMudHJhY2tpbmcuaW5kZXhNYXAgPSBpbmRleE1hcDtcbiAgICB9LFxuXG4gICAgZ2V0U3RhdGVTbmFwc2hvdDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdmFsdWU6IHRoaXMucHJvcHMuZmllbGQudmFsdWUsXG4gICAgICAgIHBvczogdGhpcy50cmFja2luZy5wb3MsXG4gICAgICAgIHJhbmdlOiB0aGlzLnRyYWNraW5nLnJhbmdlXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBzZXRTdGF0ZVNuYXBzaG90OiBmdW5jdGlvbiAoc25hcHNob3QpIHtcbiAgICAgIHRoaXMudHJhY2tpbmcucG9zID0gc25hcHNob3QucG9zO1xuICAgICAgdGhpcy50cmFja2luZy5yYW5nZSA9IHNuYXBzaG90LnJhbmdlO1xuICAgICAgdGhpcy5wcm9wcy5maWVsZC52YWwoc25hcHNob3QudmFsdWUpO1xuICAgIH0sXG5cbiAgICAvLyBUdXJuIGludG8gaW5kaXZpZHVhbCBjaGFyYWN0ZXJzIGFuZCB0YWdzXG4gICAgdG9rZW5zOiBmdW5jdGlvbiAocGFydHMpIHtcbiAgICAgIHJldHVybiBbXS5jb25jYXQuYXBwbHkoW10sIHBhcnRzLm1hcChmdW5jdGlvbiAocGFydCkge1xuICAgICAgICBpZiAocGFydC50eXBlID09PSAndGFnJykge1xuICAgICAgICAgIHJldHVybiBwYXJ0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBwYXJ0LnZhbHVlLnNwbGl0KCcnKTtcbiAgICAgICAgfVxuICAgICAgfSkpO1xuICAgIH0sXG5cbiAgICAvLyBNYXAgZWFjaCB0ZXh0YXJlYSBpbmRleCBiYWNrIHRvIGEgdG9rZW5cbiAgICBpbmRleE1hcDogZnVuY3Rpb24gKHRva2Vucykge1xuICAgICAgdmFyIGluZGV4TWFwID0gW107XG4gICAgICBfLmVhY2godG9rZW5zLCBmdW5jdGlvbiAodG9rZW4sIHRva2VuSW5kZXgpIHtcbiAgICAgICAgaWYgKHRva2VuLnR5cGUgPT09ICd0YWcnKSB7XG4gICAgICAgICAgdmFyIGxhYmVsID0gTEVGVF9QQUQgKyBub0JyZWFrKHRoaXMucHJldHR5TGFiZWwodG9rZW4udmFsdWUpKSArIFJJR0hUX1BBRDtcbiAgICAgICAgICB2YXIgbGFiZWxDaGFycyA9IGxhYmVsLnNwbGl0KCcnKTtcbiAgICAgICAgICBfLmVhY2gobGFiZWxDaGFycywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaW5kZXhNYXAucHVzaCh0b2tlbkluZGV4KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpbmRleE1hcC5wdXNoKHRva2VuSW5kZXgpO1xuICAgICAgICB9XG4gICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgcmV0dXJuIGluZGV4TWFwO1xuICAgIH0sXG5cbiAgICAvLyBNYWtlIGhpZ2hsaWdodCBzY3JvbGwgbWF0Y2ggdGV4dGFyZWEgc2Nyb2xsXG4gICAgb25TY3JvbGw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMucmVmcy5oaWdobGlnaHQuZ2V0RE9NTm9kZSgpLnNjcm9sbFRvcCA9IHRoaXMucmVmcy5jb250ZW50LmdldERPTU5vZGUoKS5zY3JvbGxUb3A7XG4gICAgICB0aGlzLnJlZnMuaGlnaGxpZ2h0LmdldERPTU5vZGUoKS5zY3JvbGxMZWZ0ID0gdGhpcy5yZWZzLmNvbnRlbnQuZ2V0RE9NTm9kZSgpLnNjcm9sbExlZnQ7XG4gICAgfSxcblxuICAgIC8vIEdpdmVuIHNvbWUgcG9zdGlvbiwgcmV0dXJuIHRoZSB0b2tlbiBpbmRleCAocG9zaXRpb24gY291bGQgYmUgaW4gdGhlIG1pZGRsZSBvZiBhIHRva2VuKVxuICAgIHRva2VuSW5kZXg6IGZ1bmN0aW9uIChwb3MsIHRva2VucywgaW5kZXhNYXApIHtcbiAgICAgIGlmIChwb3MgPCAwKSB7XG4gICAgICAgIHBvcyA9IDA7XG4gICAgICB9IGVsc2UgaWYgKHBvcyA+PSBpbmRleE1hcC5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHRva2Vucy5sZW5ndGg7XG4gICAgICB9XG4gICAgICByZXR1cm4gaW5kZXhNYXBbcG9zXTtcbiAgICB9LFxuXG4gICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgLy9jb25zb2xlLmxvZygnY2hhbmdlOicsIGV2ZW50LnRhcmdldC52YWx1ZSk7XG5cbiAgICAgIHZhciBub2RlID0gZXZlbnQudGFyZ2V0O1xuXG4gICAgICAvLyBUcmFja2luZyBpcyBob2xkaW5nIHByZXZpb3VzIHBvc2l0aW9uIGFuZCByYW5nZVxuICAgICAgdmFyIHByZXZQb3MgPSB0aGlzLnRyYWNraW5nLnBvcztcbiAgICAgIHZhciBwcmV2UmFuZ2UgPSB0aGlzLnRyYWNraW5nLnJhbmdlO1xuXG4gICAgICAvLyBOZXcgcG9zaXRpb25cbiAgICAgIHZhciBwb3MgPSBub2RlLnNlbGVjdGlvblN0YXJ0O1xuXG4gICAgICAvLyBHb2luZyB0byBtdXRhdGUgdGhlIHRva2Vucy5cbiAgICAgIHZhciB0b2tlbnMgPSB0aGlzLnRyYWNraW5nLnRva2VucztcblxuICAgICAgLy8gVXNpbmcgdGhlIHByZXZpb3VzIHBvc2l0aW9uIGFuZCByYW5nZSwgZ2V0IHRoZSBwcmV2aW91cyB0b2tlbiBwb3NpdGlvblxuICAgICAgLy8gYW5kIHJhbmdlXG4gICAgICB2YXIgcHJldlRva2VuSW5kZXggPSB0aGlzLnRva2VuSW5kZXgocHJldlBvcywgdG9rZW5zLCB0aGlzLnRyYWNraW5nLmluZGV4TWFwKTtcbiAgICAgIHZhciBwcmV2VG9rZW5FbmRJbmRleCA9IHRoaXMudG9rZW5JbmRleChwcmV2UG9zICsgcHJldlJhbmdlLCB0b2tlbnMsIHRoaXMudHJhY2tpbmcuaW5kZXhNYXApO1xuICAgICAgdmFyIHByZXZUb2tlblJhbmdlID0gcHJldlRva2VuRW5kSW5kZXggLSBwcmV2VG9rZW5JbmRleDtcblxuICAgICAgLy8gV2lwZSBvdXQgYW55IHRva2VucyBpbiB0aGUgc2VsZWN0ZWQgcmFuZ2UgYmVjYXVzZSB0aGUgY2hhbmdlIHdvdWxkIGhhdmVcbiAgICAgIC8vIGVyYXNlZCB0aGF0IHNlbGVjdGlvbi5cbiAgICAgIGlmIChwcmV2VG9rZW5SYW5nZSA+IDApIHtcbiAgICAgICAgdG9rZW5zLnNwbGljZShwcmV2VG9rZW5JbmRleCwgcHJldlRva2VuUmFuZ2UpO1xuICAgICAgICB0aGlzLnRyYWNraW5nLmluZGV4TWFwID0gdGhpcy5pbmRleE1hcCh0b2tlbnMpO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiBjdXJzb3IgaGFzIG1vdmVkIGZvcndhcmQsIHRoZW4gdGV4dCB3YXMgYWRkZWQuXG4gICAgICBpZiAocG9zID4gcHJldlBvcykge1xuICAgICAgICB2YXIgYWRkZWRUZXh0ID0gbm9kZS52YWx1ZS5zdWJzdHJpbmcocHJldlBvcywgcG9zKTtcbiAgICAgICAgLy8gSW5zZXJ0IHRoZSB0ZXh0IGludG8gdGhlIHRva2Vucy5cbiAgICAgICAgdG9rZW5zLnNwbGljZShwcmV2VG9rZW5JbmRleCwgMCwgYWRkZWRUZXh0KTtcbiAgICAgIC8vIElmIGN1cnNvciBoYXMgbW92ZWQgYmFja3dhcmQsIHRoZW4gd2UgZGVsZXRlZCAoYmFja3NwYWNlZCkgdGV4dFxuICAgICAgfSBpZiAocG9zIDwgcHJldlBvcykge1xuICAgICAgICB2YXIgdG9rZW4gPSB0aGlzLnRva2VuQXQocG9zKTtcbiAgICAgICAgdmFyIHRva2VuQmVmb3JlID0gdGhpcy50b2tlbkJlZm9yZShwb3MpO1xuICAgICAgICAvLyBJZiB3ZSBtb3ZlZCBiYWNrIG9udG8gYSB0b2tlbiwgdGhlbiB3ZSBzaG91bGQgbW92ZSBiYWNrIHRvIGJlZ2lubmluZ1xuICAgICAgICAvLyBvZiB0b2tlbi5cbiAgICAgICAgaWYgKHRva2VuID09PSB0b2tlbkJlZm9yZSkge1xuICAgICAgICAgIHBvcyA9IHRoaXMubW92ZU9mZlRhZyhwb3MsIHRva2VucywgdGhpcy5pbmRleE1hcCh0b2tlbnMpLCAtMSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHRva2VuSW5kZXggPSB0aGlzLnRva2VuSW5kZXgocG9zLCB0b2tlbnMsIHRoaXMudHJhY2tpbmcuaW5kZXhNYXApO1xuICAgICAgICAvLyBOb3cgd2UgY2FuIHJlbW92ZSB0aGUgdG9rZW5zIHRoYXQgd2VyZSBkZWxldGVkLlxuICAgICAgICB0b2tlbnMuc3BsaWNlKHRva2VuSW5kZXgsIHByZXZUb2tlbkluZGV4IC0gdG9rZW5JbmRleCk7XG4gICAgICB9XG5cbiAgICAgIC8vIENvbnZlcnQgdG9rZW5zIGJhY2sgaW50byByYXcgdmFsdWUgd2l0aCB0YWdzLiBOZXdseSBmb3JtZWQgdGFncyB3aWxsXG4gICAgICAvLyBiZWNvbWUgcGFydCBvZiB0aGUgcmF3IHZhbHVlLlxuICAgICAgdmFyIHJhd1ZhbHVlID0gdGhpcy5yYXdWYWx1ZSh0b2tlbnMpO1xuXG4gICAgICB0aGlzLnRyYWNraW5nLnBvcyA9IHBvcztcbiAgICAgIHRoaXMudHJhY2tpbmcucmFuZ2UgPSAwO1xuXG4gICAgICAvLyBTZXQgdGhlIHZhbHVlIHRvIHRoZSBuZXcgcmF3IHZhbHVlLlxuICAgICAgdGhpcy5wcm9wcy5maWVsZC52YWwocmF3VmFsdWUpO1xuXG4gICAgICB0aGlzLnNuYXBzaG90KCk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZFVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHZhbHVlID0gdGhpcy5wcm9wcy5maWVsZC52YWx1ZSB8fCAnJztcbiAgICAgIHZhciBwYXJ0cyA9IHV0aWwucGFyc2VUZXh0V2l0aFRhZ3ModmFsdWUpO1xuICAgICAgdGhpcy50cmFja2luZy50b2tlbnMgPSB0aGlzLnRva2VucyhwYXJ0cyk7XG4gICAgICB0aGlzLnRyYWNraW5nLmluZGV4TWFwID0gdGhpcy5pbmRleE1hcCh0aGlzLnRyYWNraW5nLnRva2Vucyk7XG5cbiAgICAgIHZhciBwb3MgPSB0aGlzLm5vcm1hbGl6ZVBvc2l0aW9uKHRoaXMudHJhY2tpbmcucG9zKTtcbiAgICAgIHZhciByYW5nZSA9IHRoaXMudHJhY2tpbmcucmFuZ2U7XG4gICAgICB2YXIgZW5kUG9zID0gdGhpcy5ub3JtYWxpemVQb3NpdGlvbihwb3MgKyByYW5nZSk7XG4gICAgICByYW5nZSA9IGVuZFBvcyAtIHBvcztcblxuICAgICAgdGhpcy50cmFja2luZy5wb3MgPSBwb3M7XG4gICAgICB0aGlzLnRyYWNraW5nLnJhbmdlID0gcmFuZ2U7XG5cbiAgICAgIGlmIChkb2N1bWVudC5hY3RpdmVFbGVtZW50ID09PSB0aGlzLnJlZnMuY29udGVudC5nZXRET01Ob2RlKCkpIHtcbiAgICAgICAgLy8gUmVhY3QgY2FuIGxvc2UgdGhlIHNlbGVjdGlvbiwgc28gcHV0IGl0IGJhY2suXG4gICAgICAgIHRoaXMucmVmcy5jb250ZW50LmdldERPTU5vZGUoKS5zZXRTZWxlY3Rpb25SYW5nZShwb3MsIHBvcyArIHJhbmdlKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gR2V0IHRoZSBsYWJlbCBmb3IgYSBrZXkuXG4gICAgcHJldHR5TGFiZWw6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIGlmICh0aGlzLnByb3BzLmZpZWxkLmRlZi5yZXBsYWNlQ2hvaWNlc0xhYmVsc1trZXldKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BzLmZpZWxkLmRlZi5yZXBsYWNlQ2hvaWNlc0xhYmVsc1trZXldO1xuICAgICAgfVxuICAgICAgdmFyIGNsZWFuZWQgPSByZW1vdmVJZFByZWZpeChrZXkpO1xuICAgICAgcmV0dXJuIHV0aWwuaHVtYW5pemUoY2xlYW5lZCk7XG4gICAgfSxcblxuICAgIC8vIEdpdmVuIHRoZSBhY3R1YWwgdmFsdWUgb2YgdGhlIGZpZWxkICh3aXRoIHRhZ3MpLCBnZXQgdGhlIHBsYWluIHRleHQgdGhhdFxuICAgIC8vIHNob3VsZCBzaG93IGluIHRoZSB0ZXh0YXJlYS5cbiAgICBwbGFpblZhbHVlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHZhciBwYXJ0cyA9IHV0aWwucGFyc2VUZXh0V2l0aFRhZ3ModmFsdWUpO1xuICAgICAgcmV0dXJuIHBhcnRzLm1hcChmdW5jdGlvbiAocGFydCkge1xuICAgICAgICBpZiAocGFydC50eXBlID09PSAndGV4dCcpIHtcbiAgICAgICAgICByZXR1cm4gcGFydC52YWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gTEVGVF9QQUQgKyBub0JyZWFrKHRoaXMucHJldHR5TGFiZWwocGFydC52YWx1ZSkpICsgUklHSFRfUEFEO1xuICAgICAgICB9XG4gICAgICB9LmJpbmQodGhpcykpLmpvaW4oJycpO1xuICAgIH0sXG5cbiAgICAvLyBHaXZlbiB0aGUgYWN0dWFsIHZhbHVlIG9mIHRoZSBmaWVsZCAod2l0aCB0YWdzKSwgZ2V0IHRoZSBodG1sIHVzZWQgdG9cbiAgICAvLyBoaWdobGlnaHQgdGhlIGxhYmVscy5cbiAgICBwcmV0dHlWYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB2YXIgcGFydHMgPSB1dGlsLnBhcnNlVGV4dFdpdGhUYWdzKHZhbHVlKTtcbiAgICAgIHJldHVybiBwYXJ0cy5tYXAoZnVuY3Rpb24gKHBhcnQsIGkpIHtcbiAgICAgICAgaWYgKHBhcnQudHlwZSA9PT0gJ3RleHQnKSB7XG4gICAgICAgICAgaWYgKGkgPT09IChwYXJ0cy5sZW5ndGggLSAxKSkge1xuICAgICAgICAgICAgaWYgKHBhcnQudmFsdWVbcGFydC52YWx1ZS5sZW5ndGggLSAxXSA9PT0gJ1xcbicpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHBhcnQudmFsdWUgKyAnXFx1MDBhMCc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBwYXJ0LnZhbHVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE1ha2UgYSBwaWxsXG4gICAgICAgICAgcmV0dXJuIFIuc3Bhbih7a2V5OiBpLCBjbGFzc05hbWU6ICdwcmV0dHktcGFydCd9LFxuICAgICAgICAgICAgUi5zcGFuKHtjbGFzc05hbWU6ICdwcmV0dHktcGFydC1sZWZ0J30sIExFRlRfUEFEKSxcbiAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAncHJldHR5LXBhcnQtdGV4dCd9LCBub0JyZWFrKHRoaXMucHJldHR5TGFiZWwocGFydC52YWx1ZSkpKSxcbiAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAncHJldHR5LXBhcnQtcmlnaHQnfSwgUklHSFRfUEFEKVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSxcblxuICAgIC8vIEdpdmVuIHRoZSB0b2tlbnMgZm9yIGEgZmllbGQsIGdldCB0aGUgYWN0dWFsIHZhbHVlIG9mIHRoZSBmaWVsZCAod2l0aFxuICAgIC8vIHRhZ3MpXG4gICAgcmF3VmFsdWU6IGZ1bmN0aW9uICh0b2tlbnMpIHtcbiAgICAgIHJldHVybiB0b2tlbnMubWFwKGZ1bmN0aW9uICh0b2tlbikge1xuICAgICAgICBpZiAodG9rZW4udHlwZSA9PT0gJ3RhZycpIHtcbiAgICAgICAgICByZXR1cm4gJ3t7JyArIHRva2VuLnZhbHVlICsgJ319JztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICAgIH1cbiAgICAgIH0pLmpvaW4oJycpO1xuICAgIH0sXG5cbiAgICAvLyBHaXZlbiBhIHBvc2l0aW9uLCBpZiBpdCdzIG9uIGEgbGFiZWwsIGdldCB0aGUgcG9zaXRpb24gbGVmdCBvciByaWdodCBvZlxuICAgIC8vIHRoZSBsYWJlbCwgYmFzZWQgb24gZGlyZWN0aW9uIGFuZC9vciB3aGljaCBzaWRlIGlzIGNsb3NlclxuICAgIG1vdmVPZmZUYWc6IGZ1bmN0aW9uIChwb3MsIHRva2VucywgaW5kZXhNYXAsIGRpcikge1xuICAgICAgaWYgKHR5cGVvZiBkaXIgPT09ICd1bmRlZmluZWQnIHx8IGRpciA+IDApIHtcbiAgICAgICAgZGlyID0gMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRpciA9IC0xO1xuICAgICAgfVxuICAgICAgdmFyIHRva2VuO1xuICAgICAgaWYgKGRpciA+IDApIHtcbiAgICAgICAgdG9rZW4gPSB0b2tlbnNbaW5kZXhNYXBbcG9zXV07XG4gICAgICAgIHdoaWxlIChwb3MgPCBpbmRleE1hcC5sZW5ndGggJiYgdG9rZW5zW2luZGV4TWFwW3Bvc11dLnR5cGUgPT09ICd0YWcnICYmIHRva2Vuc1tpbmRleE1hcFtwb3NdXSA9PT0gdG9rZW4pIHtcbiAgICAgICAgICBwb3MrKztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdG9rZW4gPSB0b2tlbnNbaW5kZXhNYXBbcG9zIC0gMV1dO1xuICAgICAgICB3aGlsZSAocG9zID4gMCAmJiB0b2tlbnNbaW5kZXhNYXBbcG9zIC0gMV1dLnR5cGUgPT09ICd0YWcnICYmIHRva2Vuc1tpbmRleE1hcFtwb3MgLSAxXV0gPT09IHRva2VuKSB7XG4gICAgICAgICAgcG9zLS07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHBvcztcbiAgICB9LFxuXG4gICAgLy8gR2V0IHRoZSB0b2tlbiBhdCBzb21lIHBvc2l0aW9uLlxuICAgIHRva2VuQXQ6IGZ1bmN0aW9uIChwb3MpIHtcbiAgICAgIGlmIChwb3MgPj0gdGhpcy50cmFja2luZy5pbmRleE1hcC5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICBpZiAocG9zIDwgMCkge1xuICAgICAgICBwb3MgPSAwO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMudHJhY2tpbmcudG9rZW5zW3RoaXMudHJhY2tpbmcuaW5kZXhNYXBbcG9zXV07XG4gICAgfSxcblxuICAgIC8vIEdldCB0aGUgdG9rZW4gaW1tZWRpYXRlbHkgYmVmb3JlIHNvbWUgcG9zaXRpb24uXG4gICAgdG9rZW5CZWZvcmU6IGZ1bmN0aW9uIChwb3MpIHtcbiAgICAgIGlmIChwb3MgPj0gdGhpcy50cmFja2luZy5pbmRleE1hcC5sZW5ndGgpIHtcbiAgICAgICAgcG9zID0gdGhpcy50cmFja2luZy5pbmRleE1hcC5sZW5ndGg7XG4gICAgICB9XG4gICAgICBpZiAocG9zIDw9IDApIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy50cmFja2luZy50b2tlbnNbdGhpcy50cmFja2luZy5pbmRleE1hcFtwb3MgLSAxXV07XG4gICAgfSxcblxuICAgIC8vIEdpdmVuIGEgcG9zaXRpb24sIGdldCBhIGNvcnJlY3RlZCBwb3NpdGlvbiAoaWYgbmVjZXNzYXJ5IHRvIGJlXG4gICAgLy8gY29ycmVjdGVkKS5cbiAgICBub3JtYWxpemVQb3NpdGlvbjogZnVuY3Rpb24gKHBvcywgcHJldlBvcykge1xuICAgICAgaWYgKF8uaXNVbmRlZmluZWQocHJldlBvcykpIHtcbiAgICAgICAgcHJldlBvcyA9IHBvcztcbiAgICAgIH1cbiAgICAgIC8vIEF0IHN0YXJ0IG9yIGVuZCwgc28gb2theS5cbiAgICAgIGlmIChwb3MgPD0gMCB8fCBwb3MgPj0gdGhpcy50cmFja2luZy5pbmRleE1hcC5sZW5ndGgpIHtcbiAgICAgICAgaWYgKHBvcyA8IDApIHtcbiAgICAgICAgICBwb3MgPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwb3MgPiB0aGlzLnRyYWNraW5nLmluZGV4TWFwLmxlbmd0aCkge1xuICAgICAgICAgIHBvcyA9IHRoaXMudHJhY2tpbmcuaW5kZXhNYXAubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwb3M7XG4gICAgICB9XG5cbiAgICAgIHZhciB0b2tlbiA9IHRoaXMudG9rZW5BdChwb3MpO1xuICAgICAgdmFyIHRva2VuQmVmb3JlID0gdGhpcy50b2tlbkJlZm9yZShwb3MpO1xuXG4gICAgICAvLyBCZXR3ZWVuIHR3byB0b2tlbnMsIHNvIG9rYXkuXG4gICAgICBpZiAodG9rZW4gIT09IHRva2VuQmVmb3JlKSB7XG4gICAgICAgIHJldHVybiBwb3M7XG4gICAgICB9XG5cbiAgICAgIHZhciBwcmV2VG9rZW4gPSB0aGlzLnRva2VuQXQocHJldlBvcyk7XG4gICAgICB2YXIgcHJldlRva2VuQmVmb3JlID0gdGhpcy50b2tlbkJlZm9yZShwcmV2UG9zKTtcblxuICAgICAgdmFyIHJpZ2h0UG9zID0gdGhpcy5tb3ZlT2ZmVGFnKHBvcywgdGhpcy50cmFja2luZy50b2tlbnMsIHRoaXMudHJhY2tpbmcuaW5kZXhNYXApO1xuICAgICAgdmFyIGxlZnRQb3MgPSB0aGlzLm1vdmVPZmZUYWcocG9zLCB0aGlzLnRyYWNraW5nLnRva2VucywgdGhpcy50cmFja2luZy5pbmRleE1hcCwgLTEpO1xuXG4gICAgICBpZiAocHJldlRva2VuICE9PSBwcmV2VG9rZW5CZWZvcmUpIHtcbiAgICAgICAgLy8gTW92ZWQgZnJvbSBsZWZ0IGVkZ2UuXG4gICAgICAgIGlmIChwcmV2VG9rZW4gPT09IHRva2VuKSB7XG4gICAgICAgICAgcmV0dXJuIHJpZ2h0UG9zO1xuICAgICAgICB9XG4gICAgICAgIC8vIE1vdmVkIGZyb20gcmlnaHQgZWRnZS5cbiAgICAgICAgaWYgKHByZXZUb2tlbkJlZm9yZSA9PT0gdG9rZW4pIHtcbiAgICAgICAgICByZXR1cm4gbGVmdFBvcztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgbmV3UG9zID0gcmlnaHRQb3M7XG5cbiAgICAgIGlmIChwb3MgPT09IHByZXZQb3MgfHwgcG9zIDwgcHJldlBvcykge1xuICAgICAgICBpZiAocmlnaHRQb3MgLSBwb3MgPiBwb3MgLSBsZWZ0UG9zKSB7XG4gICAgICAgICAgbmV3UG9zID0gbGVmdFBvcztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG5ld1BvcztcbiAgICB9LFxuXG4gICAgb25TZWxlY3Q6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgdmFyIG5vZGUgPSBldmVudC50YXJnZXQ7XG5cbiAgICAgIHZhciBwb3MgPSBub2RlLnNlbGVjdGlvblN0YXJ0O1xuICAgICAgdmFyIGVuZFBvcyA9IG5vZGUuc2VsZWN0aW9uRW5kO1xuXG4gICAgICBwb3MgPSB0aGlzLm5vcm1hbGl6ZVBvc2l0aW9uKHBvcywgdGhpcy50cmFja2luZy5wb3MpO1xuICAgICAgZW5kUG9zID0gdGhpcy5ub3JtYWxpemVQb3NpdGlvbihlbmRQb3MsIHRoaXMudHJhY2tpbmcucG9zICsgdGhpcy50cmFja2luZy5yYW5nZSk7XG5cbiAgICAgIHRoaXMudHJhY2tpbmcucG9zID0gcG9zO1xuICAgICAgdGhpcy50cmFja2luZy5yYW5nZSA9IGVuZFBvcyAtIHBvcztcblxuICAgICAgbm9kZS5zZWxlY3Rpb25TdGFydCA9IHBvcztcbiAgICAgIG5vZGUuc2VsZWN0aW9uRW5kID0gZW5kUG9zO1xuICAgIH0sXG5cbiAgICBvbkNvcHk6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBub2RlID0gdGhpcy5yZWZzLmNvbnRlbnQuZ2V0RE9NTm9kZSgpO1xuICAgICAgdmFyIHN0YXJ0ID0gbm9kZS5zZWxlY3Rpb25TdGFydDtcbiAgICAgIHZhciBlbmQgPSBub2RlLnNlbGVjdGlvbkVuZDtcbiAgICAgIHZhciB0ZXh0ID0gbm9kZS52YWx1ZS5zdWJzdHJpbmcoc3RhcnQsIGVuZCk7XG4gICAgICB2YXIgcmVhbFN0YXJ0SW5kZXggPSB0aGlzLnRva2VuSW5kZXgoc3RhcnQsIHRoaXMudHJhY2tpbmcudG9rZW5zLCB0aGlzLnRyYWNraW5nLmluZGV4TWFwKTtcbiAgICAgIHZhciByZWFsRW5kSW5kZXggPSB0aGlzLnRva2VuSW5kZXgoZW5kLCB0aGlzLnRyYWNraW5nLnRva2VucywgdGhpcy50cmFja2luZy5pbmRleE1hcCk7XG4gICAgICB2YXIgdG9rZW5zID0gdGhpcy50cmFja2luZy50b2tlbnMuc2xpY2UocmVhbFN0YXJ0SW5kZXgsIHJlYWxFbmRJbmRleCk7XG4gICAgICB0ZXh0ID0gdGhpcy5yYXdWYWx1ZSh0b2tlbnMpO1xuICAgICAgdmFyIG9yaWdpbmFsVmFsdWUgPSBub2RlLnZhbHVlO1xuICAgICAgbm9kZS52YWx1ZSA9IG5vZGUudmFsdWUgKyB0ZXh0O1xuICAgICAgbm9kZS5zZXRTZWxlY3Rpb25SYW5nZShvcmlnaW5hbFZhbHVlLmxlbmd0aCwgb3JpZ2luYWxWYWx1ZS5sZW5ndGggKyB0ZXh0Lmxlbmd0aCk7XG4gICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgbm9kZS52YWx1ZSA9IG9yaWdpbmFsVmFsdWU7XG4gICAgICAgIG5vZGUuc2V0U2VsZWN0aW9uUmFuZ2Uoc3RhcnQsIGVuZCk7XG4gICAgICB9LDApO1xuICAgIH0sXG5cbiAgICBvbkN1dDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIG5vZGUgPSB0aGlzLnJlZnMuY29udGVudC5nZXRET01Ob2RlKCk7XG4gICAgICB2YXIgc3RhcnQgPSBub2RlLnNlbGVjdGlvblN0YXJ0O1xuICAgICAgdmFyIGVuZCA9IG5vZGUuc2VsZWN0aW9uRW5kO1xuICAgICAgdmFyIHRleHQgPSBub2RlLnZhbHVlLnN1YnN0cmluZyhzdGFydCwgZW5kKTtcbiAgICAgIHZhciByZWFsU3RhcnRJbmRleCA9IHRoaXMudG9rZW5JbmRleChzdGFydCwgdGhpcy50cmFja2luZy50b2tlbnMsIHRoaXMudHJhY2tpbmcuaW5kZXhNYXApO1xuICAgICAgdmFyIHJlYWxFbmRJbmRleCA9IHRoaXMudG9rZW5JbmRleChlbmQsIHRoaXMudHJhY2tpbmcudG9rZW5zLCB0aGlzLnRyYWNraW5nLmluZGV4TWFwKTtcbiAgICAgIHZhciB0b2tlbnMgPSB0aGlzLnRyYWNraW5nLnRva2Vucy5zbGljZShyZWFsU3RhcnRJbmRleCwgcmVhbEVuZEluZGV4KTtcbiAgICAgIHRleHQgPSB0aGlzLnJhd1ZhbHVlKHRva2Vucyk7XG4gICAgICB2YXIgb3JpZ2luYWxWYWx1ZSA9IG5vZGUudmFsdWU7XG4gICAgICB2YXIgY3V0VmFsdWUgPSBub2RlLnZhbHVlLnN1YnN0cmluZygwLCBzdGFydCkgKyBub2RlLnZhbHVlLnN1YnN0cmluZyhlbmQpO1xuICAgICAgbm9kZS52YWx1ZSA9IG5vZGUudmFsdWUgKyB0ZXh0O1xuICAgICAgbm9kZS5zZXRTZWxlY3Rpb25SYW5nZShvcmlnaW5hbFZhbHVlLmxlbmd0aCwgb3JpZ2luYWxWYWx1ZS5sZW5ndGggKyB0ZXh0Lmxlbmd0aCk7XG4gICAgICB2YXIgY3V0VG9rZW5zID0gdGhpcy50cmFja2luZy50b2tlbnMuc2xpY2UoMCwgcmVhbFN0YXJ0SW5kZXgpLmNvbmNhdCh0aGlzLnRyYWNraW5nLnRva2Vucy5zbGljZShyZWFsRW5kSW5kZXgpKTtcbiAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBub2RlLnZhbHVlID0gY3V0VmFsdWU7XG4gICAgICAgIG5vZGUuc2V0U2VsZWN0aW9uUmFuZ2Uoc3RhcnQsIHN0YXJ0KTtcbiAgICAgICAgdGhpcy50cmFja2luZy5wb3MgPSBzdGFydDtcbiAgICAgICAgdGhpcy50cmFja2luZy5yYW5nZSA9IDA7XG4gICAgICAgIHRoaXMudHJhY2tpbmcudG9rZW5zID0gY3V0VG9rZW5zXG4gICAgICAgIHRoaXMudHJhY2tpbmcuaW5kZXhNYXAgPSB0aGlzLmluZGV4TWFwKHRoaXMudHJhY2tpbmcudG9rZW5zKTtcbiAgICAgIH0uYmluZCh0aGlzKSwwKTtcbiAgICB9LFxuXG4gICAgb25LZXlEb3duOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIC8vIENtZC1aIG9yIEN0cmwtWlxuICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDkwICYmIChldmVudC5tZXRhS2V5IHx8IGV2ZW50LmN0cmxLZXkpICYmICFldmVudC5zaGlmdEtleSkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLnVuZG8oKTtcbiAgICAgIC8vIENtZC1TaGlmdC1aIG9yIEN0cmwtWVxuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgKGV2ZW50LmtleUNvZGUgPT09IDg5ICYmIGV2ZW50LmN0cmxLZXkgJiYgIWV2ZW50LnNoaWZ0S2V5KSB8fFxuICAgICAgICAoZXZlbnQua2V5Q29kZSA9PT0gOTAgJiYgZXZlbnQubWV0YUtleSAmJiBldmVudC5zaGlmdEtleSlcbiAgICAgICkge1xuICAgICAgICB0aGlzLnJlZG8oKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gS2VlcCB0aGUgaGlnaGxpZ2h0IHN0eWxlcyBpbiBzeW5jIHdpdGggdGhlIHRleHRhcmVhIHN0eWxlcy5cbiAgICBhZGp1c3RTdHlsZXM6IGZ1bmN0aW9uIChpc01vdW50KSB7XG4gICAgICB2YXIgb3ZlcmxheSA9IHRoaXMucmVmcy5oaWdobGlnaHQuZ2V0RE9NTm9kZSgpO1xuICAgICAgdmFyIGNvbnRlbnQgPSB0aGlzLnJlZnMuY29udGVudC5nZXRET01Ob2RlKCk7XG5cbiAgICAgIHZhciBzdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGNvbnRlbnQpO1xuXG4gICAgICB2YXIgYmFja2dyb3VuZENvbG9yID0gc3R5bGUuYmFja2dyb3VuZENvbG9yO1xuXG4gICAgICB1dGlsLmNvcHlFbGVtZW50U3R5bGUoY29udGVudCwgb3ZlcmxheSk7XG5cbiAgICAgIG92ZXJsYXkuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgb3ZlcmxheS5zdHlsZS53aGl0ZVNwYWNlID0gJ3ByZS13cmFwJztcbiAgICAgIG92ZXJsYXkuc3R5bGUuY29sb3IgPSAncmdiYSgwLDAsMCwwKSc7XG4gICAgICBvdmVybGF5LnN0eWxlLndlYmtpdFRleHRGaWxsQ29sb3IgPSAncmdiYSgwLDAsMCwwKSc7XG4gICAgICBvdmVybGF5LnN0eWxlLnJlc2l6ZSA9ICdub25lJztcbiAgICAgIG92ZXJsYXkuc3R5bGUuYm9yZGVyQ29sb3IgPSAncmdiYSgwLDAsMCwwKSc7XG5cbiAgICAgIGlmICh1dGlsLmJyb3dzZXIuaXNNb3ppbGxhKSB7XG5cbiAgICAgICAgdmFyIHBhZGRpbmdUb3AgPSBwYXJzZUZsb2F0KHN0eWxlLnBhZGRpbmdUb3ApO1xuICAgICAgICB2YXIgcGFkZGluZ0JvdHRvbSA9IHBhcnNlRmxvYXQoc3R5bGUucGFkZGluZ0JvdHRvbSk7XG5cbiAgICAgICAgdmFyIGJvcmRlclRvcCA9IHBhcnNlRmxvYXQoc3R5bGUuYm9yZGVyVG9wV2lkdGgpO1xuICAgICAgICB2YXIgYm9yZGVyQm90dG9tID0gcGFyc2VGbG9hdChzdHlsZS5ib3JkZXJCb3R0b21XaWR0aCk7XG5cbiAgICAgICAgb3ZlcmxheS5zdHlsZS5wYWRkaW5nVG9wID0gJzBweCc7XG4gICAgICAgIG92ZXJsYXkuc3R5bGUucGFkZGluZ0JvdHRvbSA9ICcwcHgnO1xuXG4gICAgICAgIG92ZXJsYXkuc3R5bGUuaGVpZ2h0ID0gKGNvbnRlbnQuY2xpZW50SGVpZ2h0IC0gcGFkZGluZ1RvcCAtIHBhZGRpbmdCb3R0b20gKyBib3JkZXJUb3AgKyBib3JkZXJCb3R0b20pICsgJ3B4JztcbiAgICAgICAgb3ZlcmxheS5zdHlsZS50b3AgPSBzdHlsZS5wYWRkaW5nVG9wO1xuICAgICAgICBvdmVybGF5LnN0eWxlLmJveFNoYWRvdyA9ICdub25lJztcbiAgICAgIH1cblxuICAgICAgaWYgKGlzTW91bnQpIHtcbiAgICAgICAgdGhpcy5iYWNrZ3JvdW5kQ29sb3IgPSBiYWNrZ3JvdW5kQ29sb3I7XG4gICAgICB9XG4gICAgICBvdmVybGF5LnN0eWxlLmJhY2tncm91bmRDb2xvciA9IHRoaXMuYmFja2dyb3VuZENvbG9yO1xuICAgICAgY29udGVudC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAncmdiYSgwLDAsMCwwKSc7XG4gICAgfSxcblxuICAgIC8vIElmIHRoZSB0ZXh0YXJlYSBpcyByZXNpemVkLCBuZWVkIHRvIHJlLXN5bmMgdGhlIHN0eWxlcy5cbiAgICBvblJlc2l6ZTogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5hZGp1c3RTdHlsZXMoKTtcbiAgICB9LFxuXG4gICAgLy8gSWYgdGhlIHdpbmRvdyBpcyByZXNpemVkLCBtYXkgbmVlZCB0byByZS1zeW5jIHRoZSBzdHlsZXMuXG4gICAgLy8gUHJvYmFibHkgbm90IG5lY2Vzc2FyeSB3aXRoIGVsZW1lbnQgcmVzaXplP1xuICAgIG9uUmVzaXplV2luZG93OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmFkanVzdFN0eWxlcygpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5hZGp1c3RTdHlsZXModHJ1ZSk7XG4gICAgICB0aGlzLnNldE9uUmVzaXplKCdjb250ZW50JywgdGhpcy5vblJlc2l6ZSk7XG4gICAgICAvL3RoaXMuc2V0T25DbGlja091dHNpZGUoJ2Nob2ljZXMnLCB0aGlzLm9uQ2xpY2tPdXRzaWRlQ2hvaWNlcyk7XG4gICAgfSxcblxuICAgIG9uSW5zZXJ0RnJvbVNlbGVjdDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICBpZiAoZXZlbnQudGFyZ2V0LnNlbGVjdGVkSW5kZXggPiAwKSB7XG4gICAgICAgIHZhciB0YWcgPSBldmVudC50YXJnZXQudmFsdWU7XG4gICAgICAgIGV2ZW50LnRhcmdldC5zZWxlY3RlZEluZGV4ID0gMDtcbiAgICAgICAgdmFyIHBvcyA9IHRoaXMudHJhY2tpbmcucG9zO1xuICAgICAgICB2YXIgaW5zZXJ0UG9zID0gdGhpcy5ub3JtYWxpemVQb3NpdGlvbihwb3MpO1xuICAgICAgICB2YXIgdG9rZW5zID0gdGhpcy50cmFja2luZy50b2tlbnM7XG4gICAgICAgIHZhciB0b2tlbkluZGV4ID0gdGhpcy50b2tlbkluZGV4KGluc2VydFBvcywgdG9rZW5zLCB0aGlzLnRyYWNraW5nLmluZGV4TWFwKTtcbiAgICAgICAgdG9rZW5zLnNwbGljZSh0b2tlbkluZGV4LCAwLCB7XG4gICAgICAgICAgdHlwZTogJ3RhZycsXG4gICAgICAgICAgdmFsdWU6IHRhZ1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy50cmFja2luZy5pbmRleE1hcCA9IHRoaXMuaW5kZXhNYXAodG9rZW5zKTtcbiAgICAgICAgdmFyIG5ld1ZhbHVlID0gdGhpcy5yYXdWYWx1ZSh0b2tlbnMpO1xuICAgICAgICB0aGlzLnRyYWNraW5nLnBvcyArPSB0aGlzLnByZXR0eUxhYmVsKHRhZykubGVuZ3RoO1xuICAgICAgICB0aGlzLnByb3BzLmZpZWxkLnZhbChuZXdWYWx1ZSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIG9uSW5zZXJ0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHZhciB0YWcgPSB2YWx1ZTtcbiAgICAgIHZhciBwb3MgPSB0aGlzLnRyYWNraW5nLnBvcztcbiAgICAgIHZhciBpbnNlcnRQb3MgPSB0aGlzLm5vcm1hbGl6ZVBvc2l0aW9uKHBvcyk7XG4gICAgICB2YXIgdG9rZW5zID0gdGhpcy50cmFja2luZy50b2tlbnM7XG4gICAgICB2YXIgdG9rZW5JbmRleCA9IHRoaXMudG9rZW5JbmRleChpbnNlcnRQb3MsIHRva2VucywgdGhpcy50cmFja2luZy5pbmRleE1hcCk7XG4gICAgICB0b2tlbnMuc3BsaWNlKHRva2VuSW5kZXgsIDAsIHtcbiAgICAgICAgdHlwZTogJ3RhZycsXG4gICAgICAgIHZhbHVlOiB0YWdcbiAgICAgIH0pO1xuICAgICAgdGhpcy50cmFja2luZy5pbmRleE1hcCA9IHRoaXMuaW5kZXhNYXAodG9rZW5zKTtcbiAgICAgIHZhciBuZXdWYWx1ZSA9IHRoaXMucmF3VmFsdWUodG9rZW5zKTtcbiAgICAgIHRoaXMudHJhY2tpbmcucG9zICs9IHRoaXMucHJldHR5TGFiZWwodGFnKS5sZW5ndGg7XG4gICAgICB0aGlzLnByb3BzLmZpZWxkLnZhbChuZXdWYWx1ZSk7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgaXNDaG9pY2VzT3BlbjogZmFsc2VcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBvblRvZ2dsZUNob2ljZXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBpc0Nob2ljZXNPcGVuOiAhdGhpcy5zdGF0ZS5pc0Nob2ljZXNPcGVuXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgb25DbG9zZUNob2ljZXM6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGlzQ2hvaWNlc09wZW46IGZhbHNlXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgZ2V0Q2xvc2VJZ25vcmVOb2RlczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMucmVmcy50b2dnbGUuZ2V0RE9NTm9kZSgpO1xuICAgIH0sXG5cbiAgICBvbkNsaWNrT3V0c2lkZUNob2ljZXM6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgLy8gLy8gSWYgd2UgZGlkbid0IGNsaWNrIG9uIHRoZSB0b2dnbGUgYnV0dG9uLCBjbG9zZSB0aGUgY2hvaWNlcy5cbiAgICAgIC8vIGlmICh0aGlzLmlzTm9kZU91dHNpZGUodGhpcy5yZWZzLnRvZ2dsZS5nZXRET01Ob2RlKCksIGV2ZW50LnRhcmdldCkpIHtcbiAgICAgIC8vICAgY29uc29sZS5sb2coJ25vdCBhIHRvZ2dsZSBjbGljaycpXG4gICAgICAvLyAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgLy8gICAgIGlzQ2hvaWNlc09wZW46IGZhbHNlXG4gICAgICAvLyAgIH0pO1xuICAgICAgLy8gfVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICAgIHZhciByZXBsYWNlQ2hvaWNlcyA9IGZpZWxkLmRlZi5yZXBsYWNlQ2hvaWNlcztcblxuICAgICAgLy8gdmFyIHNlbGVjdFJlcGxhY2VDaG9pY2VzID0gW3tcbiAgICAgIC8vICAgdmFsdWU6ICcnLFxuICAgICAgLy8gICBsYWJlbDogJ0luc2VydC4uLidcbiAgICAgIC8vIH1dLmNvbmNhdChyZXBsYWNlQ2hvaWNlcyk7XG5cbiAgICAgIHJldHVybiBwbHVnaW4uY29tcG9uZW50KCdmaWVsZCcpKHtcbiAgICAgICAgZmllbGQ6IGZpZWxkXG4gICAgICB9LCBSLmRpdih7c3R5bGU6IHtwb3NpdGlvbjogJ3JlbGF0aXZlJ319LFxuXG4gICAgICAgIFIucHJlKHtcbiAgICAgICAgICBjbGFzc05hbWU6ICdwcmV0dHktaGlnaGxpZ2h0JyxcbiAgICAgICAgICByZWY6ICdoaWdobGlnaHQnXG4gICAgICAgIH0sXG4gICAgICAgICAgdGhpcy5wcmV0dHlWYWx1ZShmaWVsZC52YWx1ZSlcbiAgICAgICAgKSxcblxuICAgICAgICBSLnRleHRhcmVhKF8uZXh0ZW5kKHtcbiAgICAgICAgICBjbGFzc05hbWU6IHV0aWwuY2xhc3NOYW1lKHRoaXMucHJvcHMuY2xhc3NOYW1lLCAncHJldHR5LWNvbnRlbnQnKSxcbiAgICAgICAgICByZWY6ICdjb250ZW50JyxcbiAgICAgICAgICByb3dzOiBmaWVsZC5kZWYucm93cyB8fCB0aGlzLnByb3BzLnJvd3MsXG4gICAgICAgICAgbmFtZTogZmllbGQua2V5LFxuICAgICAgICAgIHZhbHVlOiB0aGlzLnBsYWluVmFsdWUoZmllbGQudmFsdWUpLFxuICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgICAgIG9uU2Nyb2xsOiB0aGlzLm9uU2Nyb2xsLFxuICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJyxcbiAgICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICAgIGxlZnQ6IDBcbiAgICAgICAgICB9LFxuICAgICAgICAgIG9uS2V5UHJlc3M6IHRoaXMub25LZXlQcmVzcyxcbiAgICAgICAgICBvbktleURvd246IHRoaXMub25LZXlEb3duLFxuICAgICAgICAgIG9uU2VsZWN0OiB0aGlzLm9uU2VsZWN0LFxuICAgICAgICAgIG9uQ29weTogdGhpcy5vbkNvcHksXG4gICAgICAgICAgb25DdXQ6IHRoaXMub25DdXRcbiAgICAgICAgfSwgcGx1Z2luLmNvbmZpZy5hdHRyaWJ1dGVzKSksXG5cbiAgICAgICAgUi5hKHtyZWY6ICd0b2dnbGUnLCBocmVmOiAnSmF2YVNjcmlwdCcgKyAnOicsIG9uQ2xpY2s6IHRoaXMub25Ub2dnbGVDaG9pY2VzfSwgJ0luc2VydC4uLicpLFxuXG4gICAgICAgIHBsdWdpbi5jb21wb25lbnQoJ2Nob2ljZXMnKSh7XG4gICAgICAgICAgcmVmOiAnY2hvaWNlcycsXG4gICAgICAgICAgY2hvaWNlczogcmVwbGFjZUNob2ljZXMsIG9wZW46IHRoaXMuc3RhdGUuaXNDaG9pY2VzT3BlbixcbiAgICAgICAgICBvblNlbGVjdDogdGhpcy5vbkluc2VydCwgb25DbG9zZTogdGhpcy5vbkNsb3NlQ2hvaWNlcywgaWdub3JlQ2xvc2VOb2RlczogdGhpcy5nZXRDbG9zZUlnbm9yZU5vZGVzfSlcbiAgICAgICAgLy8sXG5cbiAgICAgICAgLy8gUi5zZWxlY3Qoe29uQ2hhbmdlOiB0aGlzLm9uSW5zZXJ0RnJvbVNlbGVjdH0sXG4gICAgICAgIC8vICAgc2VsZWN0UmVwbGFjZUNob2ljZXMubWFwKGZ1bmN0aW9uIChjaG9pY2UsIGkpIHtcbiAgICAgICAgLy8gICAgIHJldHVybiBSLm9wdGlvbih7XG4gICAgICAgIC8vICAgICAgIGtleTogaSxcbiAgICAgICAgLy8gICAgICAgdmFsdWU6IGNob2ljZS52YWx1ZVxuICAgICAgICAvLyAgICAgfSwgY2hvaWNlLmxhYmVsKTtcbiAgICAgICAgLy8gICB9KVxuICAgICAgICAvLyApXG4gICAgICApKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQucmVtb3ZlLWl0ZW1cblxuLypcblJlbW92ZSBhbiBpdGVtLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGRpc3BsYXlOYW1lOiBwbHVnaW4ubmFtZSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZSxcbiAgICAgICAgbGFiZWw6IHBsdWdpbi5jb25maWdWYWx1ZSgnbGFiZWwnLCAnW3JlbW92ZV0nKVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gUi5zcGFuKHtjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lLCBvbkNsaWNrOiB0aGlzLnByb3BzLm9uQ2xpY2t9LCB0aGlzLnByb3BzLmxhYmVsKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQucm9vdFxuXG4vKlxuUm9vdCBjb21wb25lbnQganVzdCB1c2VkIHRvIHNwaXQgb3V0IGFsbCB0aGUgZmllbGRzIGZvciBhIGZvcm0uXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHZhciB1dGlsID0gcGx1Z2luLnJlcXVpcmUoJ3V0aWwnKTtcblxuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGRpc3BsYXlOYW1lOiBwbHVnaW4ubmFtZSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiB1dGlsLmNsYXNzTmFtZSgncm9vdCcsIHBsdWdpbi5jb25maWcuY2xhc3NOYW1lKVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgICByZXR1cm4gUi5kaXYoe1xuICAgICAgICBjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lXG4gICAgICB9LFxuICAgICAgICBmaWVsZC5maWVsZHMoKS5tYXAoZnVuY3Rpb24gKGZpZWxkLCBpKSB7XG4gICAgICAgICAgcmV0dXJuIGZpZWxkLmNvbXBvbmVudCh7a2V5OiBmaWVsZC5kZWYua2V5IHx8IGl9KTtcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50LmhlbHBcblxuLypcbkp1c3QgdGhlIGhlbHAgdGV4dCBibG9jay5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgY2hvaWNlID0gdGhpcy5wcm9wcy5jaG9pY2U7XG5cbiAgICAgIHJldHVybiBjaG9pY2Uuc2FtcGxlID9cbiAgICAgICAgUi5kaXYoe2NsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWV9LFxuICAgICAgICAgIGNob2ljZS5zYW1wbGVcbiAgICAgICAgKSA6XG4gICAgICAgIFIuc3BhbihudWxsKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQuc2VsZWN0XG5cbi8qXG5SZW5kZXIgc2VsZWN0IGVsZW1lbnQgdG8gZ2l2ZSBhIHVzZXIgY2hvaWNlcyBmb3IgdGhlIHZhbHVlIG9mIGEgZmllbGQuIE5vdGVcbml0IHNob3VsZCBzdXBwb3J0IHZhbHVlcyBvdGhlciB0aGFuIHN0cmluZ3MuIEN1cnJlbnRseSB0aGlzIGlzIG9ubHkgdGVzdGVkIGZvclxuYm9vbGVhbiB2YWx1ZXMsIGJ1dCBpdCBfc2hvdWxkXyB3b3JrIGZvciBvdGhlciB2YWx1ZXMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBtaXhpbnM6IFtwbHVnaW4ucmVxdWlyZSgnbWl4aW4uZmllbGQnKV0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIHZhciBjaG9pY2VWYWx1ZSA9IGV2ZW50LnRhcmdldC52YWx1ZTtcbiAgICAgIHZhciBjaG9pY2VUeXBlID0gY2hvaWNlVmFsdWUuc3Vic3RyaW5nKDAsIGNob2ljZVZhbHVlLmluZGV4T2YoJzonKSk7XG4gICAgICBpZiAoY2hvaWNlVHlwZSA9PT0gJ2Nob2ljZScpIHtcbiAgICAgICAgdmFyIGNob2ljZUluZGV4ID0gY2hvaWNlVmFsdWUuc3Vic3RyaW5nKGNob2ljZVZhbHVlLmluZGV4T2YoJzonKSArIDEpO1xuICAgICAgICBjaG9pY2VJbmRleCA9IHBhcnNlSW50KGNob2ljZUluZGV4KTtcbiAgICAgICAgdGhpcy5wcm9wcy5maWVsZC52YWwodGhpcy5wcm9wcy5maWVsZC5kZWYuY2hvaWNlc1tjaG9pY2VJbmRleF0udmFsdWUpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcbiAgICAgIHZhciBjaG9pY2VzID0gZmllbGQuZGVmLmNob2ljZXMgfHwgW107XG5cbiAgICAgIHZhciBjaG9pY2VzT3JMb2FkaW5nO1xuXG4gICAgICBpZiAoY2hvaWNlcy5sZW5ndGggPT09IDEgJiYgY2hvaWNlc1swXS52YWx1ZSA9PT0gJy8vL2xvYWRpbmcvLy8nKSB7XG4gICAgICAgIGNob2ljZXNPckxvYWRpbmcgPSBSLmRpdih7fSxcbiAgICAgICAgICAnTG9hZGluZyBjaG9pY2VzLi4uJ1xuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcblxuICAgICAgICB2YXIgdmFsdWUgPSBmaWVsZC52YWx1ZSAhPT0gdW5kZWZpbmVkID8gZmllbGQudmFsdWUgOiAnJztcblxuICAgICAgICBjaG9pY2VzID0gY2hvaWNlcy5tYXAoZnVuY3Rpb24gKGNob2ljZSwgaSkge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjaG9pY2VWYWx1ZTogJ2Nob2ljZTonICsgaSxcbiAgICAgICAgICAgIHZhbHVlOiBjaG9pY2UudmFsdWUsXG4gICAgICAgICAgICBsYWJlbDogY2hvaWNlLmxhYmVsXG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIHZhbHVlQ2hvaWNlID0gXy5maW5kKGNob2ljZXMsIGZ1bmN0aW9uIChjaG9pY2UpIHtcbiAgICAgICAgICByZXR1cm4gY2hvaWNlLnZhbHVlID09PSB2YWx1ZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHZhbHVlQ2hvaWNlID09PSB1bmRlZmluZWQpIHtcblxuICAgICAgICAgIHZhciBsYWJlbCA9IHZhbHVlO1xuICAgICAgICAgIGlmICghXy5pc1N0cmluZyh2YWx1ZSkpIHtcbiAgICAgICAgICAgIGxhYmVsID0gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YWx1ZUNob2ljZSA9IHtcbiAgICAgICAgICAgIGNob2ljZVZhbHVlOiAndmFsdWU6JyxcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgIGxhYmVsOiBsYWJlbFxuICAgICAgICAgIH07XG4gICAgICAgICAgY2hvaWNlcyA9IFt2YWx1ZUNob2ljZV0uY29uY2F0KGNob2ljZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgY2hvaWNlc09yTG9hZGluZyA9IFIuc2VsZWN0KHtcbiAgICAgICAgICBjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lLFxuICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgICAgIHZhbHVlOiB2YWx1ZUNob2ljZS5jaG9pY2VWYWx1ZVxuICAgICAgICB9LFxuICAgICAgICAgIGNob2ljZXMubWFwKGZ1bmN0aW9uIChjaG9pY2UsIGkpIHtcbiAgICAgICAgICAgIHJldHVybiBSLm9wdGlvbih7XG4gICAgICAgICAgICAgIGtleTogaSxcbiAgICAgICAgICAgICAgdmFsdWU6IGNob2ljZS5jaG9pY2VWYWx1ZVxuICAgICAgICAgICAgfSwgY2hvaWNlLmxhYmVsKTtcbiAgICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwbHVnaW4uY29tcG9uZW50KCdmaWVsZCcpKHtcbiAgICAgICAgZmllbGQ6IGZpZWxkXG4gICAgICB9LCBjaG9pY2VzT3JMb2FkaW5nKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQudGV4dFxuXG4vKlxuSnVzdCBhIHNpbXBsZSB0ZXh0IGlucHV0LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGRpc3BsYXlOYW1lOiBwbHVnaW4ubmFtZSxcblxuICAgIG1peGluczogW3BsdWdpbi5yZXF1aXJlKCdtaXhpbi5maWVsZCcpXSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgdmFyIG5ld1ZhbHVlID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xuICAgICAgdGhpcy5wcm9wcy5maWVsZC52YWwobmV3VmFsdWUpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgICAgcmV0dXJuIHBsdWdpbi5jb21wb25lbnQoJ2ZpZWxkJykoe1xuICAgICAgICBmaWVsZDogZmllbGRcbiAgICAgIH0sIFIuaW5wdXQoe1xuICAgICAgICBjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lLFxuICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgIHZhbHVlOiBmaWVsZC52YWx1ZSxcbiAgICAgICAgcm93czogZmllbGQuZGVmLnJvd3MsXG4gICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlXG4gICAgICB9KSk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50LnRleHRhcmVhXG5cbi8qXG5KdXN0IGEgc2ltcGxlIG11bHRpLXJvdyB0ZXh0YXJlYS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBtaXhpbnM6IFtwbHVnaW4ucmVxdWlyZSgnbWl4aW4uZmllbGQnKV0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWUsXG4gICAgICAgIHJvd3M6IHBsdWdpbi5jb25maWcucm93cyB8fCA1XG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICB2YXIgbmV3VmFsdWUgPSBldmVudC50YXJnZXQudmFsdWU7XG4gICAgICB0aGlzLnByb3BzLmZpZWxkLnZhbChuZXdWYWx1ZSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgICByZXR1cm4gcGx1Z2luLmNvbXBvbmVudCgnZmllbGQnKSh7XG4gICAgICAgIGZpZWxkOiBmaWVsZFxuICAgICAgfSwgUi50ZXh0YXJlYSh7XG4gICAgICAgIGNsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWUsXG4gICAgICAgIHZhbHVlOiBmaWVsZC52YWx1ZSxcbiAgICAgICAgcm93czogZmllbGQuZGVmLnJvd3MgfHwgdGhpcy5wcm9wcy5yb3dzLFxuICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZVxuICAgICAgfSkpO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvcmUuZmllbGRcblxuLypcblRoZSBjb3JlIGZpZWxkIHBsdWdpbiBwcm92aWRlcyB0aGUgRmllbGQgcHJvdG90eXBlLiBGaWVsZHMgcmVwcmVzZW50IGFcbnBhcnRpY3VsYXIgc3RhdGUgaW4gdGltZSBvZiBhIGZpZWxkIGRlZmluaXRpb24sIGFuZCB0aGV5IHByb3ZpZGUgaGVscGVyIG1ldGhvZHNcbnRvIG5vdGlmeSB0aGUgZm9ybSBzdG9yZSBvZiBjaGFuZ2VzLlxuXG5GaWVsZHMgYXJlIGxhemlseSBjcmVhdGVkIGFuZCBldmFsdWF0ZWQsIGJ1dCBvbmNlIGV2YWx1YXRlZCwgdGhleSBzaG91bGQgYmVcbmNvbnNpZGVyZWQgaW1tdXRhYmxlLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgdmFyIHJvdXRlciA9IHBsdWdpbi5yZXF1aXJlKCdmaWVsZC1yb3V0ZXInKTtcbiAgdmFyIHV0aWwgPSBwbHVnaW4ucmVxdWlyZSgndXRpbCcpO1xuICB2YXIgZXZhbHVhdG9yID0gcGx1Z2luLnJlcXVpcmUoJ2V2YWwnKTtcbiAgdmFyIGNvbXBpbGVyID0gcGx1Z2luLnJlcXVpcmUoJ2NvbXBpbGVyJyk7XG5cbiAgLy8gVGhlIEZpZWxkIGNvbnN0cnVjdG9yLlxuICB2YXIgRmllbGQgPSBmdW5jdGlvbiAoZm9ybSwgZGVmLCB2YWx1ZSwgcGFyZW50KSB7XG4gICAgdmFyIGZpZWxkID0gdGhpcztcblxuICAgIGZpZWxkLmZvcm0gPSBmb3JtO1xuICAgIGZpZWxkLmRlZiA9IGRlZjtcbiAgICBmaWVsZC52YWx1ZSA9IHZhbHVlO1xuICAgIGZpZWxkLnBhcmVudCA9IHBhcmVudDtcbiAgICBmaWVsZC5ncm91cHMgPSB7fTtcbiAgICBmaWVsZC50ZW1wQ2hpbGRyZW4gPSBbXTtcbiAgfTtcblxuICAvLyBBdHRhY2ggYSBmaWVsZCBmYWN0b3J5IHRvIHRoZSBmb3JtIHByb3RvdHlwZS5cbiAgcGx1Z2luLmV4cG9ydHMuZmllbGQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGZvcm0gPSB0aGlzO1xuXG4gICAgcmV0dXJuIG5ldyBGaWVsZChmb3JtLCB7XG4gICAgICB0eXBlOiAncm9vdCdcbiAgICB9LCBmb3JtLnN0b3JlLnZhbHVlKTtcbiAgfTtcblxuICB2YXIgcHJvdG8gPSBGaWVsZC5wcm90b3R5cGU7XG5cbiAgLy8gUmV0dXJuIHRoZSB0eXBlIHBsdWdpbiBmb3IgdGhpcyBmaWVsZC5cbiAgcHJvdG8udHlwZVBsdWdpbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzO1xuXG4gICAgaWYgKCFmaWVsZC5fdHlwZVBsdWdpbikge1xuICAgICAgZmllbGQuX3R5cGVQbHVnaW4gPSBwbHVnaW4ucmVxdWlyZSgndHlwZS4nICsgZmllbGQuZGVmLnR5cGUpO1xuICAgIH1cblxuICAgIHJldHVybiBmaWVsZC5fdHlwZVBsdWdpbjtcbiAgfTtcblxuICAvLyBHZXQgYSBjb21wb25lbnQgZm9yIHRoaXMgZmllbGQuXG4gIHByb3RvLmNvbXBvbmVudCA9IGZ1bmN0aW9uIChwcm9wcykge1xuICAgIHZhciBmaWVsZCA9IHRoaXM7XG4gICAgcHJvcHMgPSBfLmV4dGVuZCh7fSwgcHJvcHMsIHtmaWVsZDogZmllbGR9KTtcbiAgICB2YXIgY29tcG9uZW50ID0gcm91dGVyLmNvbXBvbmVudEZvckZpZWxkKGZpZWxkKTtcbiAgICByZXR1cm4gY29tcG9uZW50KHByb3BzKTtcbiAgfTtcblxuICAvLyBHZXQgdGhlIGNoaWxkIGZpZWxkcyBmb3IgdGhpcyBmaWVsZC5cbiAgcHJvdG8uZmllbGRzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBmaWVsZCA9IHRoaXM7XG5cbiAgICBpZiAoIWZpZWxkLl9maWVsZHMpIHtcbiAgICAgIHZhciBmaWVsZHM7XG4gICAgICBpZiAoZmllbGQudHlwZVBsdWdpbigpLmZpZWxkcykge1xuICAgICAgICBmaWVsZHMgPSBmaWVsZC50eXBlUGx1Z2luKCkuZmllbGRzKGZpZWxkKTtcbiAgICAgIH0gZWxzZSBpZiAoZmllbGQuZGVmLmZpZWxkcykge1xuICAgICAgICBmaWVsZHMgPSBmaWVsZC5kZWYuZmllbGRzLm1hcChmdW5jdGlvbiAoZGVmKSB7XG4gICAgICAgICAgcmV0dXJuIGZpZWxkLmNyZWF0ZUNoaWxkKGRlZik7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZmllbGRzID0gW107XG4gICAgICB9XG4gICAgICBmaWVsZC5fZmllbGRzID0gZmllbGRzO1xuICAgIH1cblxuICAgIHJldHVybiBmaWVsZC5fZmllbGRzO1xuICB9O1xuXG4gIC8vIEdldCB0aGUgaXRlbXMgKGNoaWxkIGZpZWxkIGRlZmluaXRpb25zKSBmb3IgdGhpcyBmaWVsZC5cbiAgcHJvdG8uaXRlbXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGZpZWxkID0gdGhpcztcblxuICAgIGlmICghZmllbGQuX2l0ZW1zKSB7XG4gICAgICBpZiAoXy5pc0FycmF5KGZpZWxkLmRlZi5pdGVtcykpIHtcbiAgICAgICAgZmllbGQuX2l0ZW1zID0gZmllbGQuZGVmLml0ZW1zLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgIHJldHVybiBmaWVsZC5yZXNvbHZlKGl0ZW0pO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZpZWxkLl9pdGVtcyA9IFtdO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmaWVsZC5faXRlbXM7XG4gIH07XG5cbiAgLy8gUmVzb2x2ZSBhIGZpZWxkIHJlZmVyZW5jZSBpZiBuZWNlc3NhcnkuXG4gIHByb3RvLnJlc29sdmUgPSBmdW5jdGlvbiAoZGVmKSB7XG4gICAgdmFyIGZpZWxkID0gdGhpcztcblxuICAgIGlmIChfLmlzU3RyaW5nKGRlZikpIHtcbiAgICAgIGRlZiA9IGZpZWxkLmZvcm0uZmluZERlZihkZWYpO1xuICAgICAgaWYgKCFkZWYpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZmluZCBmaWVsZDogJyArIGRlZik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRlZjtcbiAgfTtcblxuICAvLyBFdmFsdWF0ZSBhIGZpZWxkIGRlZmluaXRpb24gYW5kIHJldHVybiBhIG5ldyBmaWVsZCBkZWZpbml0aW9uLlxuICBwcm90by5ldmFsRGVmID0gZnVuY3Rpb24gKGRlZikge1xuICAgIHZhciBmaWVsZCA9IHRoaXM7XG5cbiAgICBpZiAoZGVmLmV2YWwpIHtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgdmFyIGV4dERlZiA9IGZpZWxkLmV2YWwoZGVmLmV2YWwpO1xuICAgICAgICBpZiAoZXh0RGVmKSB7XG4gICAgICAgICAgZGVmID0gXy5leHRlbmQoe30sIGRlZiwgZXh0RGVmKTtcbiAgICAgICAgICBpZiAoZGVmLmZpZWxkcykge1xuICAgICAgICAgICAgZGVmLmZpZWxkcyA9IGRlZi5maWVsZHMubWFwKGZ1bmN0aW9uIChjaGlsZERlZikge1xuICAgICAgICAgICAgICBjaGlsZERlZiA9IGNvbXBpbGVyLmV4cGFuZERlZihjaGlsZERlZiwgZmllbGQuZm9ybS5zdG9yZS50ZW1wbGF0ZU1hcCk7XG4gICAgICAgICAgICAgIHJldHVybiBjb21waWxlci5jb21waWxlRGVmKGNoaWxkRGVmKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBkZWYgPSBjb21waWxlci5jb21waWxlRGVmKGRlZik7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1Byb2JsZW0gaW4gZXZhbDogJywgSlNPTi5zdHJpbmdpZnkoZGVmLmV2YWwpKTtcbiAgICAgICAgY29uc29sZS5sb2coZS5tZXNzYWdlKTtcbiAgICAgICAgY29uc29sZS5sb2coZS5zdGFjayk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRlZjtcbiAgfTtcblxuICAvLyBFdmFsdWF0ZSBhbiBleHByZXNzaW9uIGluIHRoZSBjb250ZXh0IG9mIGEgZmllbGQuXG4gIHByb3RvLmV2YWwgPSBmdW5jdGlvbiAoZXhwcmVzc2lvbiwgY29udGV4dCkge1xuICAgIHJldHVybiBldmFsdWF0b3IuZXZhbHVhdGUoZXhwcmVzc2lvbiwgdGhpcywgY29udGV4dCk7XG4gIH07XG5cbiAgLy8gQ3JlYXRlIGEgY2hpbGQgZmllbGQgZnJvbSBhIGRlZmluaXRpb24uXG4gIHByb3RvLmNyZWF0ZUNoaWxkID0gZnVuY3Rpb24gKGRlZikge1xuICAgIHZhciBmaWVsZCA9IHRoaXM7XG5cbiAgICBkZWYgPSBmaWVsZC5yZXNvbHZlKGRlZik7XG5cbiAgICB2YXIgdmFsdWUgPSBmaWVsZC52YWx1ZTtcblxuICAgIGRlZiA9IGZpZWxkLmV2YWxEZWYoZGVmKTtcblxuICAgIGlmICghdXRpbC5pc0JsYW5rKGRlZi5rZXkpKSB7XG4gICAgICBpZiAodmFsdWUgJiYgIV8uaXNVbmRlZmluZWQodmFsdWVbZGVmLmtleV0pKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWVbZGVmLmtleV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgPSBkZWYudmFsdWU7XG4gICAgfVxuXG4gICAgdmFyIGNoaWxkRmllbGQgPSBuZXcgRmllbGQoZmllbGQuZm9ybSwgZGVmLCB2YWx1ZSwgZmllbGQpO1xuXG4gICAgZmllbGQudGVtcENoaWxkcmVuLnB1c2goY2hpbGRGaWVsZCk7XG5cbiAgICByZXR1cm4gY2hpbGRGaWVsZDtcblxuICAgIC8vIGlmIChkZWYuZXZhbCkge1xuICAgIC8vICAgZGVmID0gY2hpbGRGaWVsZC5ldmFsRGVmKGRlZik7XG4gICAgLy8gICBpZiAodXRpbC5pc0JsYW5rKGRlZi5rZXkpKSB7XG4gICAgLy8gICAgIHZhbHVlID0gZGVmLnZhbHVlO1xuICAgIC8vICAgfVxuICAgIC8vICAgY2hpbGRGaWVsZCA9IG5ldyBGaWVsZChmaWVsZC5mb3JtLCBkZWYsIHZhbHVlLCBmaWVsZCk7XG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gcmV0dXJuIGNoaWxkRmllbGQ7XG4gIH07XG5cbiAgLy8gR2l2ZW4gYSB2YWx1ZSwgZmluZCBhbiBhcHByb3ByaWF0ZSBmaWVsZCBkZWZpbml0aW9uIGZvciB0aGlzIGZpZWxkLlxuICBwcm90by5pdGVtRm9yVmFsdWUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzO1xuXG4gICAgdmFyIGl0ZW0gPSBfLmZpbmQoZmllbGQuaXRlbXMoKSwgZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHJldHVybiB1dGlsLml0ZW1NYXRjaGVzVmFsdWUoaXRlbSwgdmFsdWUpO1xuICAgIH0pO1xuICAgIGlmIChpdGVtKSB7XG4gICAgICBpdGVtID0gXy5leHRlbmQoe30sIGl0ZW0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBpdGVtID0gdXRpbC5maWVsZERlZkZyb21WYWx1ZSh2YWx1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGl0ZW07XG4gIH07XG5cbiAgLy8gR2V0IGFsbCB0aGUgZmllbGRzIGJlbG9uZ2luZyB0byBhIGdyb3VwLlxuICBwcm90by5ncm91cEZpZWxkcyA9IGZ1bmN0aW9uIChncm91cE5hbWUsIGlnbm9yZVRlbXBDaGlsZHJlbikge1xuICAgIHZhciBmaWVsZCA9IHRoaXM7XG5cbiAgICBpZiAoIWZpZWxkLmdyb3Vwc1tncm91cE5hbWVdKSB7XG4gICAgICBmaWVsZC5ncm91cHNbZ3JvdXBOYW1lXSA9IFtdO1xuXG4gICAgICBpZiAoZmllbGQucGFyZW50KSB7XG4gICAgICAgIHZhciBzaWJsaW5ncyA9IGZpZWxkLnBhcmVudC5maWVsZHMoKTtcbiAgICAgICAgc2libGluZ3MuZm9yRWFjaChmdW5jdGlvbiAoc2libGluZykge1xuICAgICAgICAgIGlmIChzaWJsaW5nICE9PSBmaWVsZCAmJiBzaWJsaW5nLmRlZi5ncm91cCA9PT0gZ3JvdXBOYW1lKSB7XG4gICAgICAgICAgICBmaWVsZC5ncm91cHNbZ3JvdXBOYW1lXS5wdXNoKHNpYmxpbmcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBwYXJlbnRHcm91cEZpZWxkcyA9IGZpZWxkLnBhcmVudC5ncm91cEZpZWxkcyhncm91cE5hbWUsIHRydWUpO1xuICAgICAgICBmaWVsZC5ncm91cHNbZ3JvdXBOYW1lXSA9IGZpZWxkLmdyb3Vwc1tncm91cE5hbWVdLmNvbmNhdChwYXJlbnRHcm91cEZpZWxkcyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFpZ25vcmVUZW1wQ2hpbGRyZW4gJiYgZmllbGQuZ3JvdXBzW2dyb3VwTmFtZV0ubGVuZ3RoID09PSAwKSB7XG4gICAgICAvLyBsb29raW5nIGF0IGNoaWxkcmVuIHNvIGZhclxuICAgICAgdmFyIGNoaWxkR3JvdXBGaWVsZHMgPSBbXTtcbiAgICAgIGZpZWxkLnRlbXBDaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uIChjaGlsZCkge1xuICAgICAgICBpZiAoY2hpbGQuZGVmLmdyb3VwID09PSBncm91cE5hbWUpIHtcbiAgICAgICAgICBjaGlsZEdyb3VwRmllbGRzLnB1c2goY2hpbGQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBjaGlsZEdyb3VwRmllbGRzO1xuICAgIH1cblxuICAgIHJldHVybiBmaWVsZC5ncm91cHNbZ3JvdXBOYW1lXTtcbiAgfTtcblxuICAvLyBXYWxrIGJhY2t3YXJkcyB0aHJvdWdoIHBhcmVudHMgYW5kIGJ1aWxkIG91dCBhIHBhdGggYXJyYXkgdG8gdGhlIHZhbHVlLlxuICBwcm90by52YWx1ZVBhdGggPSBmdW5jdGlvbiAoY2hpbGRQYXRoKSB7XG4gICAgdmFyIGZpZWxkID0gdGhpcztcblxuICAgIHZhciBwYXRoID0gY2hpbGRQYXRoIHx8IFtdO1xuICAgIGlmICghdXRpbC5pc0JsYW5rKGZpZWxkLmRlZi5rZXkpKSB7XG4gICAgICBwYXRoID0gW2ZpZWxkLmRlZi5rZXldLmNvbmNhdChwYXRoKTtcbiAgICB9XG4gICAgaWYgKGZpZWxkLnBhcmVudCkge1xuICAgICAgcmV0dXJuIGZpZWxkLnBhcmVudC52YWx1ZVBhdGgocGF0aCk7XG4gICAgfVxuICAgIHJldHVybiBwYXRoO1xuICB9O1xuXG4gIC8vIFNldCB0aGUgdmFsdWUgZm9yIHRoaXMgZmllbGQuXG4gIHByb3RvLnZhbCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHZhciBmaWVsZCA9IHRoaXM7XG5cbiAgICBmaWVsZC5mb3JtLmFjdGlvbnMuc2V0VmFsdWUoZmllbGQudmFsdWVQYXRoKCksIHZhbHVlKTtcbiAgfTtcblxuICAvLyBSZW1vdmUgYSBjaGlsZCB2YWx1ZSBmcm9tIHRoaXMgZmllbGQuXG4gIHByb3RvLnJlbW92ZSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzO1xuXG4gICAgdmFyIHBhdGggPSBmaWVsZC52YWx1ZVBhdGgoKS5jb25jYXQoa2V5KTtcblxuICAgIGZpZWxkLmZvcm0uYWN0aW9ucy5yZW1vdmVWYWx1ZShwYXRoKTtcbiAgfTtcblxuICAvLyBNb3ZlIGEgY2hpbGQgdmFsdWUgZnJvbSBvbmUga2V5IHRvIGFub3RoZXIuXG4gIHByb3RvLm1vdmUgPSBmdW5jdGlvbiAoZnJvbUtleSwgdG9LZXkpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzO1xuXG4gICAgZmllbGQuZm9ybS5hY3Rpb25zLm1vdmVWYWx1ZShmaWVsZC52YWx1ZVBhdGgoKSwgZnJvbUtleSwgdG9LZXkpO1xuICB9O1xuXG4gIC8vIEdldCB0aGUgZGVmYXVsdCB2YWx1ZSBmb3IgdGhpcyBmaWVsZC5cbiAgcHJvdG8uZGVmYXVsdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzO1xuXG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKGZpZWxkLmRlZi52YWx1ZSkpIHtcbiAgICAgIHJldHVybiB1dGlsLmNvcHlWYWx1ZShmaWVsZC5kZWYudmFsdWUpO1xuICAgIH1cblxuICAgIGlmICghXy5pc1VuZGVmaW5lZChmaWVsZC5kZWYuZGVmYXVsdCkpIHtcbiAgICAgIHJldHVybiB1dGlsLmNvcHlWYWx1ZShmaWVsZC5kZWYuZGVmYXVsdCk7XG4gICAgfVxuXG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKGZpZWxkLnR5cGVQbHVnaW4oKS5kZWZhdWx0KSkge1xuICAgICAgcmV0dXJuIHV0aWwuY29weVZhbHVlKGZpZWxkLnR5cGVQbHVnaW4oKS5kZWZhdWx0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcblxuICAvLyBBcHBlbmQgYSBuZXcgdmFsdWUuIFVzZSB0aGUgYGl0ZW1JbmRleGAgdG8gZ2V0IGFuIGFwcHJvcHJpYXRlXG4gIC8vIGl0ZW0sIGluZmxhdGUgaXQsIGFuZCBjcmVhdGUgYSBkZWZhdWx0IHZhbHVlLlxuICBwcm90by5hcHBlbmQgPSBmdW5jdGlvbiAoaXRlbUluZGV4KSB7XG4gICAgdmFyIGZpZWxkID0gdGhpcztcblxuICAgIHZhciBpdGVtID0gZmllbGQuaXRlbXMoKVtpdGVtSW5kZXhdO1xuICAgIGl0ZW0gPSBfLmV4dGVuZChpdGVtKTtcblxuICAgIGl0ZW0ua2V5ID0gZmllbGQudmFsdWUubGVuZ3RoO1xuXG4gICAgdmFyIGNoaWxkID0gZmllbGQuY3JlYXRlQ2hpbGQoaXRlbSk7XG5cbiAgICB2YXIgb2JqID0gY2hpbGQuZGVmYXVsdCgpO1xuXG4gICAgaWYgKF8uaXNBcnJheShvYmopIHx8IF8uaXNPYmplY3Qob2JqKSkge1xuICAgICAgdmFyIGNob3AgPSBmaWVsZC52YWx1ZVBhdGgoKS5sZW5ndGggKyAxO1xuXG4gICAgICBjaGlsZC5pbmZsYXRlKGZ1bmN0aW9uIChwYXRoLCB2YWx1ZSkge1xuICAgICAgICBvYmogPSB1dGlsLnNldEluKG9iaiwgcGF0aC5zbGljZShjaG9wKSwgdmFsdWUpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZmllbGQuZm9ybS5hY3Rpb25zLmFwcGVuZFZhbHVlKGZpZWxkLnZhbHVlUGF0aCgpLCBvYmopO1xuICB9O1xuXG4gIC8vIERldGVybWluZSB3aGV0aGVyIHRoZSBmaWVsZCBpcyBoaWRkZW4uXG4gIHByb3RvLmhpZGRlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzO1xuXG4gICAgcmV0dXJuIGZpZWxkLmRlZi5oaWRkZW4gfHwgZmllbGQudHlwZVBsdWdpbigpLmhpZGRlbjtcbiAgfTtcblxuICAvLyBFeHBhbmQgYWxsIGNoaWxkIGZpZWxkcyBhbmQgY2FsbCB0aGUgc2V0dGVyIGZ1bmN0aW9uIHdpdGggdGhlIGRlZmF1bHRcbiAgLy8gdmFsdWVzIGF0IGVhY2ggcGF0aC5cbiAgcHJvdG8uaW5mbGF0ZSA9IGZ1bmN0aW9uIChvblNldFZhbHVlKSB7XG4gICAgdmFyIGZpZWxkID0gdGhpcztcblxuICAgIGlmICghdXRpbC5pc0JsYW5rKGZpZWxkLmRlZi5rZXkpICYmIF8uaXNVbmRlZmluZWQoZmllbGQudmFsdWUpKSB7XG4gICAgICBvblNldFZhbHVlKGZpZWxkLnZhbHVlUGF0aCgpLCBmaWVsZC5kZWZhdWx0KCkpO1xuICAgIH1cblxuICAgIHZhciBmaWVsZHMgPSBmaWVsZC5maWVsZHMoKTtcblxuICAgIGZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uIChjaGlsZCkge1xuICAgICAgY2hpbGQuaW5mbGF0ZShvblNldFZhbHVlKTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBDYWxsZWQgZnJvbSB1bm1vdW50LiBXaGVuIGZpZWxkcyBhcmUgcmVtb3ZlZCBmb3Igd2hhdGV2ZXIgcmVhc29uLCB3ZVxuICAvLyBzaG91bGQgZGVsZXRlIHRoZSBjb3JyZXNwb25kaW5nIHZhbHVlLlxuICBwcm90by5lcmFzZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzO1xuICAgIGlmICghdXRpbC5pc0JsYW5rKGZpZWxkLmRlZi5rZXkpICYmICFfLmlzVW5kZWZpbmVkKGZpZWxkLnZhbHVlKSkge1xuICAgICAgZmllbGQuZm9ybS5hY3Rpb25zLmVyYXNlVmFsdWUoZmllbGQudmFsdWVQYXRoKCksIHt9KTtcbiAgICB9XG4gIH07XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIvLyAjIGNvcmUuZm9ybS1pbml0XG5cbi8qXG5UaGlzIHBsdWdpbiBtYWtlcyBpdCBlYXN5IHRvIGhvb2sgaW50byBmb3JtIGluaXRpYWxpemF0aW9uLCB3aXRob3V0IGhhdmluZyB0b1xuY29uZmlndXJlIGFsbCB0aGUgb3RoZXIgY29yZSBwbHVnaW5zLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICB2YXIgaW5pdFBsdWdpbnMgPSBwbHVnaW4ucmVxdWlyZUFsbChwbHVnaW4uY29uZmlnLmluaXQpO1xuXG4gIHZhciBwcm90byA9IHBsdWdpbi5leHBvcnRzO1xuXG4gIHByb3RvLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGZvcm0gPSB0aGlzO1xuXG4gICAgaW5pdFBsdWdpbnMuZm9yRWFjaChmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgICBwbHVnaW4uYXBwbHkoZm9ybSwgYXJndW1lbnRzKTtcbiAgICB9KTtcbiAgfTtcbn07XG4iLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvcmUuZm9ybVxuXG4vKlxuVGhlIGNvcmUgZm9ybSBwbHVnaW4gc3VwcGxpZXMgbWV0aG9kcyB0aGF0IGdldCBhZGRlZCB0byB0aGUgRm9ybSBwcm90b3R5cGUuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xudmFyIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50ZW1pdHRlcjMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgdmFyIHByb3RvID0gcGx1Z2luLmV4cG9ydHM7XG5cbiAgLy8gR2V0IHRoZSBzdG9yZSBwbHVnaW4uXG4gIHZhciBjcmVhdGVTdG9yZSA9IHBsdWdpbi5yZXF1aXJlKHBsdWdpbi5jb25maWcuc3RvcmUpO1xuXG4gIHZhciB1dGlsID0gcGx1Z2luLnJlcXVpcmUoJ3V0aWwnKTtcbiAgdmFyIGxvYWRlciA9IHBsdWdpbi5yZXF1aXJlKCdsb2FkZXInKTtcblxuICAvLyBIZWxwZXIgdG8gY3JlYXRlIGFjdGlvbnMsIHdoaWNoIHdpbGwgdGVsbCB0aGUgc3RvcmUgdGhhdCBzb21ldGhpbmcgaGFzXG4gIC8vIGhhcHBlbmVkLiBOb3RlIHRoYXQgYWN0aW9ucyBnbyBzdHJhaWdodCB0byB0aGUgc3RvcmUuIE5vIGV2ZW50cyxcbiAgLy8gZGlzcGF0Y2hlciwgZXRjLlxuICB2YXIgY3JlYXRlU3luY0FjdGlvbnMgPSBmdW5jdGlvbiAoc3RvcmUsIG5hbWVzKSB7XG4gICAgdmFyIGFjdGlvbnMgPSB7fTtcbiAgICBuYW1lcy5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICBhY3Rpb25zW25hbWVdID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBzdG9yZVtuYW1lXS5hcHBseShzdG9yZSwgYXJndW1lbnRzKTtcbiAgICAgIH07XG4gICAgfSk7XG4gICAgcmV0dXJuIGFjdGlvbnM7XG4gIH07XG5cbiAgLy8gSW5pdGlhbGl6ZSB0aGUgZm9ybSBpbnN0YW5jZS5cbiAgcHJvdG8uaW5pdCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgdmFyIGZvcm0gPSB0aGlzO1xuXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICAvLyBOZWVkIGFuIGVtaXR0ZXIgdG8gZW1pdCBjaGFuZ2UgZXZlbnRzIGZyb20gdGhlIHN0b3JlLlxuICAgIHZhciBzdG9yZUVtaXR0ZXIgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgICAvLyBDcmVhdGUgYSBzdG9yZS5cbiAgICBmb3JtLnN0b3JlID0gY3JlYXRlU3RvcmUoZm9ybSwgc3RvcmVFbWl0dGVyLCBvcHRpb25zKTtcblxuICAgIC8vIENyZWF0ZSB0aGUgYWN0aW9ucyB0byBub3RpZnkgdGhlIHN0b3JlIG9mIGNoYW5nZXMuXG4gICAgZm9ybS5hY3Rpb25zID0gY3JlYXRlU3luY0FjdGlvbnMoZm9ybS5zdG9yZSwgWydzZXRWYWx1ZScsICdzZXRGaWVsZHMnLCAncmVtb3ZlVmFsdWUnLCAnYXBwZW5kVmFsdWUnLCAnbW92ZVZhbHVlJywgJ2VyYXNlVmFsdWUnLCAnc2V0TWV0YSddKTtcblxuICAgIC8vIFNlZWQgdGhlIHZhbHVlIGZyb20gYW55IGZpZWxkcy5cbiAgICBmb3JtLnN0b3JlLmluZmxhdGUoKTtcblxuICAgIC8vIEFkZCBvbi9vZmYgdG8gZ2V0IGNoYW5nZSBldmVudHMgZnJvbSBmb3JtLlxuICAgIGZvcm0ub24gPSBzdG9yZUVtaXR0ZXIub24uYmluZChzdG9yZUVtaXR0ZXIpO1xuICAgIGZvcm0ub2ZmID0gc3RvcmVFbWl0dGVyLm9mZi5iaW5kKHN0b3JlRW1pdHRlcik7XG4gICAgZm9ybS5vbmNlID0gc3RvcmVFbWl0dGVyLm9uY2UuYmluZChzdG9yZUVtaXR0ZXIpO1xuICB9O1xuXG4gIC8vIEdldCB0aGUgcm9vdCBjb21wb25lbnQgZm9yIGEgZm9ybS5cbiAgcHJvdG8uY29tcG9uZW50ID0gZnVuY3Rpb24gKHByb3BzKSB7XG5cbiAgICB2YXIgZm9ybSA9IHRoaXM7XG5cbiAgICBwcm9wcyA9IF8uZXh0ZW5kKHt9LCBwcm9wcywge1xuICAgICAgZm9ybTogZm9ybVxuICAgIH0pO1xuXG4gICAgdmFyIGNvbXBvbmVudCA9IHBsdWdpbi5jb21wb25lbnQoJ2Zvcm1hdGljJyk7XG5cbiAgICByZXR1cm4gY29tcG9uZW50KHByb3BzKTtcbiAgfTtcblxuICAvLyBHZXQgb3Igc2V0IHRoZSB2YWx1ZSBvZiBhIGZvcm0uXG4gIHByb3RvLnZhbCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHZhciBmb3JtID0gdGhpcztcblxuICAgIGlmICghXy5pc1VuZGVmaW5lZCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBmb3JtLmFjdGlvbnMuc2V0VmFsdWUodmFsdWUpO1xuICAgIH1cblxuICAgIHJldHVybiB1dGlsLmNvcHlWYWx1ZShmb3JtLnN0b3JlLnZhbHVlKTtcbiAgfTtcblxuICAvLyBTZXQvY2hhbmdlIHRoZSBmaWVsZHMgZm9yIGEgZm9ybS5cbiAgcHJvdG8uZmllbGRzID0gZnVuY3Rpb24gKGZpZWxkcykge1xuICAgIHZhciBmb3JtID0gdGhpcztcblxuICAgIGZvcm0uYWN0aW9ucy5zZXRGaWVsZHMoZmllbGRzKTtcbiAgfTtcblxuICAvLyBGaW5kIGEgZmllbGQgdGVtcGxhdGUgZ2l2ZW4gYSBrZXkuXG4gIHByb3RvLmZpbmREZWYgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIGZvcm0gPSB0aGlzO1xuXG4gICAgcmV0dXJuIGZvcm0uc3RvcmUudGVtcGxhdGVNYXBba2V5XSB8fCBudWxsO1xuICB9O1xuXG4gIC8vIEdldCBvciBzZXQgbWV0YWRhdGEuXG4gIHByb3RvLm1ldGEgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgIHZhciBmb3JtID0gdGhpcztcblxuICAgIGlmICghXy5pc1VuZGVmaW5lZCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBmb3JtLmFjdGlvbnMuc2V0TWV0YShrZXksIHZhbHVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZm9ybS5zdG9yZS5tZXRhW2tleV07XG4gIH07XG5cbiAgLy8gTG9hZCBtZXRhZGF0YS5cbiAgcHJvdG8ubG9hZE1ldGEgPSBmdW5jdGlvbiAoc291cmNlLCBwYXJhbXMpIHtcbiAgICBwYXJhbXMgPSBwYXJhbXMgfHwge307XG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhwYXJhbXMpO1xuICAgIHZhciB2YWxpZEtleXMgPSBrZXlzLmZpbHRlcihmdW5jdGlvbiAoa2V5KSB7XG4gICAgICByZXR1cm4gcGFyYW1zW2tleV07XG4gICAgfSk7XG4gICAgaWYgKHZhbGlkS2V5cy5sZW5ndGggPCBrZXlzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsb2FkZXIubG9hZE1ldGEodGhpcywgc291cmNlLCBwYXJhbXMpO1xuICB9O1xuXG4gIC8vIEFkZCBhIG1ldGRhdGEgc291cmNlIGZ1bmN0aW9uLCB2aWEgdGhlIGxvYWRlciBwbHVnaW4uXG4gIHByb3RvLnNvdXJjZSA9IGxvYWRlci5zb3VyY2U7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvcmUuZm9ybWF0aWNcblxuLypcblRoZSBjb3JlIGZvcm1hdGljIHBsdWdpbiBhZGRzIG1ldGhvZHMgdG8gdGhlIGZvcm1hdGljIGluc3RhbmNlLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgdmFyIGYgPSBwbHVnaW4uZXhwb3J0cztcblxuICAvLyBVc2UgdGhlIGZpZWxkLXJvdXRlciBwbHVnaW4gYXMgdGhlIHJvdXRlci5cbiAgdmFyIHJvdXRlciA9IHBsdWdpbi5yZXF1aXJlKCdmaWVsZC1yb3V0ZXInKTtcblxuICAvLyBSb3V0ZSBhIGZpZWxkIHRvIGEgY29tcG9uZW50LlxuICBmLnJvdXRlID0gcm91dGVyLnJvdXRlO1xuXG4gIC8vIFJlbmRlciBhIGNvbXBvbmVudCB0byBhIG5vZGUuXG4gIGYucmVuZGVyID0gZnVuY3Rpb24gKGNvbXBvbmVudCwgbm9kZSkge1xuXG4gICAgUmVhY3QucmVuZGVyQ29tcG9uZW50KGNvbXBvbmVudCwgbm9kZSk7XG4gIH07XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBpbGVyXG5cbi8vIFRoZSBjb21waWxlciBwbHVnaW4ga25vd3MgaG93IHRvIG5vcm1hbGl6ZSBmaWVsZCBkZWZpbml0aW9ucyBpbnRvIHN0YW5kYXJkXG4vLyBmaWVsZCBkZWZpbml0aW9ucyB0aGF0IGNhbiBiZSB1bmRlcnN0b29kIGJlIHJvdXRlcnMgYW5kIGNvbXBvbmVudHMuXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIC8vIEdyYWIgYWxsIHRoZSBjb21waWxlciBwbHVnaW5zIHdoaWNoIGNhbiBiZSBzdGFja2VkLlxuICB2YXIgY29tcGlsZXJQbHVnaW5zID0gcGx1Z2luLnJlcXVpcmVBbGwocGx1Z2luLmNvbmZpZy5jb21waWxlcnMpO1xuXG4gIHZhciB1dGlsID0gcGx1Z2luLnJlcXVpcmUoJ3V0aWwnKTtcblxuICB2YXIgY29tcGlsZXIgPSBwbHVnaW4uZXhwb3J0cztcblxuICAvLyBGb3IgYSBzZXQgb2YgZmllbGRzLCBtYWtlIGEgbWFwIG9mIHRlbXBsYXRlIG5hbWVzIHRvIGZpZWxkIGRlZmluaXRpb25zLiBBbGxcbiAgLy8gZmllbGQgZGVmaW5pdGlvbnMgY2FuIGJlIHVzZWQgYXMgdGVtcGxhdGVzLCB3aGV0aGVyIG1hcmtlZCBhcyB0ZW1wbGF0ZXMgb3JcbiAgLy8gbm90LlxuICBjb21waWxlci50ZW1wbGF0ZU1hcCA9IGZ1bmN0aW9uIChmaWVsZHMpIHtcbiAgICB2YXIgbWFwID0ge307XG4gICAgZmllbGRzLmZvckVhY2goZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICBpZiAoZmllbGQua2V5KSB7XG4gICAgICAgIG1hcFtmaWVsZC5rZXldID0gZmllbGQ7XG4gICAgICB9XG4gICAgICBpZiAoZmllbGQuaWQpIHtcbiAgICAgICAgbWFwW2ZpZWxkLmlkXSA9IGZpZWxkO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBtYXA7XG4gIH07XG5cbiAgLy8gRmllbGRzIGFuZCBpdGVtcyBjYW4gZXh0ZW5kIG90aGVyIGZpZWxkIGRlZmluaXRpb25zLiBGaWVsZHMgY2FuIGFsc28gaGF2ZVxuICAvLyBjaGlsZCBmaWVsZHMgdGhhdCBwb2ludCB0byBvdGhlciBmaWVsZCBkZWZpbml0aW9ucy4gSGVyZSwgd2UgZXhwYW5kIGFsbFxuICAvLyB0aG9zZSBvdXQgc28gdGhhdCBjb21wb25lbnRzIGRvbid0IGhhdmUgdG8gd29ycnkgYWJvdXQgdGhpcy5cbiAgY29tcGlsZXIuZXhwYW5kRGVmID0gZnVuY3Rpb24gKGRlZiwgdGVtcGxhdGVNYXApIHtcbiAgICB2YXIgaXNUZW1wbGF0ZSA9IGRlZi50ZW1wbGF0ZTtcbiAgICB2YXIgZXh0ID0gZGVmLmV4dGVuZHM7XG4gICAgaWYgKF8uaXNTdHJpbmcoZXh0KSkge1xuICAgICAgZXh0ID0gW2V4dF07XG4gICAgfVxuICAgIGlmIChleHQpIHtcbiAgICAgIHZhciBiYXNlcyA9IGV4dC5tYXAoZnVuY3Rpb24gKGJhc2UpIHtcbiAgICAgICAgdmFyIHRlbXBsYXRlID0gdGVtcGxhdGVNYXBbYmFzZV07XG4gICAgICAgIGlmICghdGVtcGxhdGUpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RlbXBsYXRlICcgKyBiYXNlICsgJyBub3QgZm91bmQuJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlO1xuICAgICAgfSk7XG4gICAgICB2YXIgY2hhaW4gPSBbe31dLmNvbmNhdChiYXNlcy5yZXZlcnNlKCkuY29uY2F0KFtkZWZdKSk7XG4gICAgICBkZWYgPSBfLmV4dGVuZC5hcHBseShfLCBjaGFpbik7XG4gICAgfVxuICAgIGlmIChkZWYuZmllbGRzKSB7XG4gICAgICBkZWYuZmllbGRzID0gZGVmLmZpZWxkcy5tYXAoZnVuY3Rpb24gKGNoaWxkRGVmKSB7XG4gICAgICAgIGlmICghXy5pc1N0cmluZyhjaGlsZERlZikpIHtcbiAgICAgICAgICByZXR1cm4gY29tcGlsZXIuZXhwYW5kRGVmKGNoaWxkRGVmLCB0ZW1wbGF0ZU1hcCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNoaWxkRGVmO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChkZWYuaXRlbXMpIHtcbiAgICAgIGRlZi5pdGVtcyA9IGRlZi5pdGVtcy5tYXAoZnVuY3Rpb24gKGl0ZW1EZWYpIHtcbiAgICAgICAgaWYgKCFfLmlzU3RyaW5nKGl0ZW1EZWYpKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbXBpbGVyLmV4cGFuZERlZihpdGVtRGVmLCB0ZW1wbGF0ZU1hcCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGl0ZW1EZWY7XG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKCFpc1RlbXBsYXRlICYmIGRlZi50ZW1wbGF0ZSkge1xuICAgICAgZGVsZXRlIGRlZi50ZW1wbGF0ZTtcbiAgICB9XG4gICAgcmV0dXJuIGRlZjtcbiAgfTtcblxuICAvLyBGb3IgYW4gYXJyYXkgb2YgZmllbGQgZGVmaW5pdGlvbnMsIGV4cGFuZCBlYWNoIGZpZWxkIGRlZmluaXRpb24uXG4gIGNvbXBpbGVyLmV4cGFuZEZpZWxkcyA9IGZ1bmN0aW9uIChmaWVsZHMpIHtcbiAgICB2YXIgdGVtcGxhdGVNYXAgPSBjb21waWxlci50ZW1wbGF0ZU1hcChmaWVsZHMpO1xuICAgIHJldHVybiBmaWVsZHMubWFwKGZ1bmN0aW9uIChkZWYpIHtcbiAgICAgIHJldHVybiBjb21waWxlci5leHBhbmREZWYoZGVmLCB0ZW1wbGF0ZU1hcCk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gUnVuIGEgZmllbGQgZGVmaW5pdGlvbiB0aHJvdWdoIGFsbCBhdmFpbGFibGUgY29tcGlsZXJzLlxuICBjb21waWxlci5jb21waWxlRGVmID0gZnVuY3Rpb24gKGRlZikge1xuXG4gICAgLy9jb25zb2xlLmxvZygnaW46JywgSlNPTi5zdHJpbmdpZnkoZGVmKSlcblxuICAgIGRlZiA9IHV0aWwuZGVlcENvcHkoZGVmKTtcblxuICAgIHZhciByZXN1bHQ7XG4gICAgY29tcGlsZXJQbHVnaW5zLmZvckVhY2goZnVuY3Rpb24gKHBsdWdpbikge1xuICAgICAgcmVzdWx0ID0gcGx1Z2luLmNvbXBpbGUoZGVmKTtcbiAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgZGVmID0gcmVzdWx0O1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIHR5cGVQbHVnaW4gPSBwbHVnaW4ucmVxdWlyZSgndHlwZS4nICsgZGVmLnR5cGUpO1xuXG4gICAgaWYgKHR5cGVQbHVnaW4uY29tcGlsZSkge1xuICAgICAgcmVzdWx0ID0gdHlwZVBsdWdpbi5jb21waWxlKGRlZik7XG4gICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgIGRlZiA9IHJlc3VsdDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZGVmLmZpZWxkcykge1xuICAgICAgLy8gQ29tcGlsZSBhbnkgaW5saW5lIGZpZWxkcy5cbiAgICAgIGRlZi5maWVsZHMgPSBkZWYuZmllbGRzLm1hcChmdW5jdGlvbiAoY2hpbGREZWYpIHtcbiAgICAgICAgaWYgKF8uaXNPYmplY3QoY2hpbGREZWYpKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbXBpbGVyLmNvbXBpbGVEZWYoY2hpbGREZWYpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjaGlsZERlZjtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vY29uc29sZS5sb2coJ291dDonLCBKU09OLnN0cmluZ2lmeShkZWYpKVxuXG4gICAgcmV0dXJuIGRlZjtcbiAgfTtcblxuICAvLyBGb3IgYW4gYXJyYXkgb2YgZmllbGQgZGVmaW5pdGlvbnMsIGNvbXBpbGUgZWFjaCBmaWVsZCBkZWZpbml0aW9uLlxuICBjb21waWxlci5jb21waWxlRmllbGRzID0gZnVuY3Rpb24gKGZpZWxkcykge1xuICAgIHJldHVybiBmaWVsZHMubWFwKGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgcmV0dXJuIGNvbXBpbGVyLmNvbXBpbGVEZWYoZmllbGQpO1xuICAgIH0pO1xuICB9O1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnRcblxuLy8gQXQgaXRzIG1vc3QgYmFzaWMgbGV2ZWwsIHRoZSBjb21wb25lbnQgcGx1Z2luIHNpbXBseSBtYXBzIGNvbXBvbmVudCBuYW1lcyB0b1xuLy8gcGx1Z2luIG5hbWVzLCByZXR1cm5pbmcgdGhlIGNvbXBvbmVudCBmYWN0b3J5IGZvciB0aGF0IGNvbXBvbmVudC4gRm9yXG4vLyBleGFtcGxlLCBgcGx1Z2luLmNvbXBvbmVudCgndGV4dCcpYCBiZWNvbWVzXG4vLyBgcGx1Z2luLnJlcXVpcmUoJ2NvbXBvbmVudC50ZXh0JylgLiBUaGlzIGlzIGEgdXNlZnVsIHBsYWNob2xkZXIgaW4gY2FzZSB3ZVxuLy8gbGF0ZXIgd2FudCB0byBtYWtlIGZvcm1hdGljIGFibGUgdG8gZGVjaWRlIGNvbXBvbmVudHMgYXQgcnVudGltZS4gRm9yIG5vdyxcbi8vIGhvd2V2ZXIsIHRoaXMgYWxsb3dzIHVzIHRvIGluamVjdCBcInByb3AgbW9kaWZpZXJzXCIgd2hpY2ggYXJlIHBsdWdpbnMgdGhhdFxuLy8gbW9kaWZ5IGEgY29tcG9uZW50cyBwcm9wZXJ0aWVzIGJlZm9yZSBpdCByZWNlaXZlcyB0aGVtLlxuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICAvLyBSZWdpc3RyeSBmb3IgcHJvcCBtb2RpZmllcnMuXG4gIHZhciBwcm9wTW9kaWZpZXJzID0ge307XG5cbiAgLy8gQWRkIGEgXCJwcm9wIG1vZGlmZXJcIiB3aGljaCBpcyBqdXN0IGEgZnVuY3Rpb24gdGhhdCBtb2RpZmllcyBhIGNvbXBvbmVudHNcbiAgLy8gcHJvcGVydGllcyBiZWZvcmUgaXQgcmVjZWl2ZXMgdGhlbS5cbiAgdmFyIGFkZFByb3BNb2RpZmllciA9IGZ1bmN0aW9uIChuYW1lLCBtb2RpZnlGbikge1xuICAgIGlmICghcHJvcE1vZGlmaWVyc1tuYW1lXSkge1xuICAgICAgcHJvcE1vZGlmaWVyc1tuYW1lXSA9IFtdO1xuICAgIH1cbiAgICBwcm9wTW9kaWZpZXJzW25hbWVdLnB1c2gobW9kaWZ5Rm4pO1xuICB9O1xuXG4gIC8vIEdyYWIgYWxsIHRoZSBwcm9wIG1vZGlmaWVyIHBsdWdpbnMuXG4gIHZhciBwcm9wc1BsdWdpbnMgPSBwbHVnaW4ucmVxdWlyZUFsbChwbHVnaW4uY29uZmlnLnByb3BzKTtcblxuICAvLyBSZWdpc3RlciBhbGwgdGhlIHByb3AgbW9kaWZpZXIgcGx1Z2lucy5cbiAgcHJvcHNQbHVnaW5zLmZvckVhY2goZnVuY3Rpb24gKHBsdWdpbikge1xuICAgIGFkZFByb3BNb2RpZmllci5hcHBseShudWxsLCBwbHVnaW4pO1xuICB9KTtcblxuICAvLyBSZWdpc3RyeSBmb3IgY29tcG9uZW50IGZhY3Rvcmllcy4gU2luY2Ugd2UnbGwgYmUgbW9kaWZ5aW5nIHRoZSBwcm9wcyBnb2luZ1xuICAvLyB0byB0aGUgZmFjdG9yaWVzLCB3ZSdsbCBzdG9yZSBvdXIgb3duIGNvbXBvbmVudCBmYWN0b3JpZXMgaGVyZS5cbiAgdmFyIGNvbXBvbmVudEZhY3RvcmllcyA9IHt9O1xuXG4gIC8vIFJldHJpZXZlIHRoZSBhcHByb3ByaWF0ZSBjb21wb25lbnQgZmFjdG9yeSwgd2hpY2ggbWF5IGJlIGEgd3JhcHBlciB0aGF0XG4gIC8vIHJ1bnMgdGhlIGNvbXBvbmVudCBwcm9wZXJ0aWVzIHRocm91Z2ggcHJvcCBtb2RpZmllciBmdW5jdGlvbnMuXG4gIHBsdWdpbi5leHBvcnRzLmNvbXBvbmVudCA9IGZ1bmN0aW9uIChuYW1lKSB7XG5cbiAgICBpZiAoIWNvbXBvbmVudEZhY3Rvcmllc1tuYW1lXSkge1xuICAgICAgdmFyIGNvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUZhY3RvcnkocGx1Z2luLnJlcXVpcmUoJ2NvbXBvbmVudC4nICsgbmFtZSkpO1xuICAgICAgY29tcG9uZW50RmFjdG9yaWVzW25hbWVdID0gZnVuY3Rpb24gKHByb3BzLCBjaGlsZHJlbikge1xuICAgICAgICBpZiAocHJvcE1vZGlmaWVyc1tuYW1lXSkge1xuICAgICAgICAgIHByb3BNb2RpZmllcnNbbmFtZV0uZm9yRWFjaChmdW5jdGlvbiAobW9kaWZ5KSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gbW9kaWZ5KHByb3BzKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgcHJvcHMgPSByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudChwcm9wcywgY2hpbGRyZW4pO1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbXBvbmVudEZhY3Rvcmllc1tuYW1lXTtcbiAgfTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29yZVxuXG4vLyBUaGUgY29yZSBwbHVnaW4gZXhwb3J0cyBhIGZ1bmN0aW9uIHRoYXQgdGFrZXMgYSBmb3JtYXRpYyBpbnN0YW5jZSBhbmRcbi8vIGV4dGVuZHMgdGhlIGluc3RhbmNlIHdpdGggYWRkaXRpb25hbCBtZXRob2RzLlxuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IGZ1bmN0aW9uIChmb3JtYXRpYykge1xuXG4gICAgLy8gVGhlIGNvcmUgcGx1Z2luIHJlYWxseSBkb2Vzbid0IGRvIG11Y2guIEl0IGFjdHVhbGx5IHJlbGllcyBvbiBvdGhlclxuICAgIC8vIHBsdWdpbnMgdG8gZG8gdGhlIGRpcnR5IHdvcmsuIFRoaXMgd2F5LCB5b3UgY2FuIGVhc2lseSBhZGQgYWRkaXRpb25hbFxuICAgIC8vIHBsdWdpbnMgdG8gZG8gbW9yZSBkaXJ0eSB3b3JrLlxuICAgIHZhciBmb3JtYXRpY1BsdWdpbnMgPSBwbHVnaW4ucmVxdWlyZUFsbChwbHVnaW4uY29uZmlnLmZvcm1hdGljKTtcblxuICAgIC8vIFdlIGhhdmUgc3BlY2lhbCBmb3JtIHBsdWdpbnMgd2hpY2ggYXJlIGp1c3QgdXNlZCB0byBtb2RpZnkgdGhlIEZvcm1cbiAgICAvLyBwcm90b3R5cGUuXG4gICAgdmFyIGZvcm1QbHVnaW5zID0gcGx1Z2luLnJlcXVpcmVBbGwocGx1Z2luLmNvbmZpZy5mb3JtKTtcblxuICAgIC8vIFBhc3MgdGhlIGZvcm1hdGljIGluc3RhbmNlIG9mZiB0byBlYWNoIG9mIHRoZSBmb3JtYXRpYyBwbHVnaW5zLlxuICAgIGZvcm1hdGljUGx1Z2lucy5mb3JFYWNoKGZ1bmN0aW9uIChmKSB7XG4gICAgICBfLmtleXMoZikuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIGlmICghXy5pc1VuZGVmaW5lZChmb3JtYXRpY1trZXldKSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUHJvcGVydHkgYWxyZWFkeSBkZWZpbmVkIGZvciBmb3JtYXRpYzogJyArIGtleSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9ybWF0aWNba2V5XSA9IGZba2V5XTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gIyMgRm9ybSBwcm90b3R5cGVcblxuICAgIC8vIFRoZSBGb3JtIGNvbnN0cnVjdG9yIGNyZWF0ZXMgYSBmb3JtIGdpdmVuIGEgc2V0IG9mIG9wdGlvbnMuIE9wdGlvbnNcbiAgICAvLyBjYW4gaGF2ZSBgZmllbGRzYCBhbmQgYHZhbHVlYC5cbiAgICB2YXIgRm9ybSA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICBpZiAodGhpcy5pbml0KSB7XG4gICAgICAgIHRoaXMuaW5pdChvcHRpb25zKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gQWRkIHRoZSBmb3JtIGZhY3RvcnkgdG8gdGhlIGZvcm1hdGljIGluc3RhbmNlLlxuICAgIGZvcm1hdGljLmZvcm0gPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgcmV0dXJuIG5ldyBGb3JtKG9wdGlvbnMpO1xuICAgIH07XG5cbiAgICBGb3JtLnByb3RvdHlwZSA9IGZvcm1hdGljLmZvcm07XG5cbiAgICAvLyBLZWVwIGZvcm0gaW5pdCBtZXRob2RzIGhlcmUuXG4gICAgdmFyIGluaXRzID0gW107XG5cbiAgICAvLyBHbyB0aHJvdWdoIGZvcm0gcGx1Z2lucyBhbmQgYWRkIGVhY2ggcGx1Z2luJ3MgbWV0aG9kcyB0byB0aGUgZm9ybVxuICAgIC8vIHByb3RvdHlwZS5cbiAgICBmb3JtUGx1Z2lucy5mb3JFYWNoKGZ1bmN0aW9uIChwcm90bykge1xuICAgICAgXy5rZXlzKHByb3RvKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgLy8gSW5pdCBwbHVnaW5zIGNhbiBiZSBzdGFja2VkLlxuICAgICAgICBpZiAoa2V5ID09PSAnaW5pdCcpIHtcbiAgICAgICAgICBpbml0cy5wdXNoKHByb3RvW2tleV0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICghXy5pc1VuZGVmaW5lZChGb3JtLnByb3RvdHlwZVtrZXldKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQcm9wZXJ0eSBhbHJlYWR5IGRlZmluZWQgZm9yIGZvcm06ICcgKyBrZXkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBGb3JtLnByb3RvdHlwZVtrZXldID0gcHJvdG9ba2V5XTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgYW4gaW5pdCBtZXRob2QgZm9yIHRoZSBmb3JtIHByb3RvdHlwZSBiYXNlZCBvbiB0aGUgYXZhaWxhYmxlIGluaXRcbiAgICAvLyBtZXRob2RzLlxuICAgIGlmIChpbml0cy5sZW5ndGggPT09IDApIHtcbiAgICAgIEZvcm0ucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoKSB7fTtcbiAgICB9IGVsc2UgaWYgKGluaXRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgRm9ybS5wcm90b3R5cGUuaW5pdCA9IGluaXRzWzBdO1xuICAgIH0gZWxzZSB7XG4gICAgICBGb3JtLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgZm9ybSA9IHRoaXM7XG4gICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuXG4gICAgICAgIGluaXRzLmZvckVhY2goZnVuY3Rpb24gKGluaXQpIHtcbiAgICAgICAgICBpbml0LmFwcGx5KGZvcm0sIGFyZ3MpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfVxuICB9O1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBldmFsLWZ1bmN0aW9uc1xuXG4vKlxuRGVmYXVsdCBldmFsIGZ1bmN0aW9ucy4gRWFjaCBmdW5jdGlvbiBpcyBwYXJ0IG9mIGl0cyBvd24gcGx1Z2luLCBidXQgYWxsIGFyZVxua2VwdCB0b2dldGhlciBoZXJlIGFzIHBhcnQgb2YgYSBwbHVnaW4gYnVuZGxlLlxuXG5Ob3RlIHRoYXQgZXZhbCBmdW5jdGlvbnMgZGVjaWRlIHdoZW4gdGhlaXIgYXJndW1lbnRzIGdldCBldmFsdWF0ZWQuIFRoaXMgd2F5LFxueW91IGNhbiBjcmVhdGUgY29udHJvbCBzdHJ1Y3R1cmVzIChsaWtlIGlmKSB0aGF0IGNvbmRpdGlvbmFsbHkgZXZhbHVhdGVzIGl0c1xuYXJndW1lbnRzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxudmFyIHdyYXBGbiA9IGZ1bmN0aW9uIChmbikge1xuICByZXR1cm4gZnVuY3Rpb24gKHBsdWdpbikge1xuICAgIHBsdWdpbi5leHBvcnRzID0gZnVuY3Rpb24gKGFyZ3MsIGZpZWxkLCBjb250ZXh0KSB7XG4gICAgICBhcmdzID0gZmllbGQuZXZhbChhcmdzLCBjb250ZXh0KTtcbiAgICAgIHZhciByZXN1bHQgPSBmbi5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcbn07XG5cbnZhciBtZXRob2RDYWxsID0gZnVuY3Rpb24gKG1ldGhvZCkge1xuICByZXR1cm4gZnVuY3Rpb24gKHBsdWdpbikge1xuICAgIHBsdWdpbi5leHBvcnRzID0gZnVuY3Rpb24gKGFyZ3MsIGZpZWxkLCBjb250ZXh0KSB7XG4gICAgICBhcmdzID0gZmllbGQuZXZhbChhcmdzLCBjb250ZXh0KTtcbiAgICAgIGlmIChhcmdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIGFyZ3NbMF1bbWV0aG9kXS5hcHBseShhcmdzWzBdLCBhcmdzLnNsaWNlKDEpKTtcbiAgICAgIH1cbiAgICB9O1xuICB9O1xufTtcblxudmFyIHBsdWdpbnMgPSB7XG4gIGlmOiBmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgcGx1Z2luLmV4cG9ydHMgPSBmdW5jdGlvbiAoYXJncywgZmllbGQsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiBmaWVsZC5ldmFsKGFyZ3NbMF0sIGNvbnRleHQpID8gZmllbGQuZXZhbChhcmdzWzFdLCBjb250ZXh0KSA6IGZpZWxkLmV2YWwoYXJnc1syXSwgY29udGV4dCk7XG4gICAgfTtcbiAgfSxcblxuICBlcTogZnVuY3Rpb24gKHBsdWdpbikge1xuICAgIHBsdWdpbi5leHBvcnRzID0gZnVuY3Rpb24gKGFyZ3MsIGZpZWxkLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gZmllbGQuZXZhbChhcmdzWzBdLCBjb250ZXh0KSA9PT0gZmllbGQuZXZhbChhcmdzWzFdLCBjb250ZXh0KTtcbiAgICB9O1xuICB9LFxuXG4gIG5vdDogZnVuY3Rpb24gKHBsdWdpbikge1xuICAgIHBsdWdpbi5leHBvcnRzID0gZnVuY3Rpb24gKGFyZ3MsIGZpZWxkLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gIWZpZWxkLmV2YWwoYXJnc1swXSwgY29udGV4dCk7XG4gICAgfTtcbiAgfSxcblxuICBvcjogZnVuY3Rpb24gKHBsdWdpbikge1xuICAgIHBsdWdpbi5leHBvcnRzID0gZnVuY3Rpb24gKGFyZ3MsIGZpZWxkLCBjb250ZXh0KSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGFyZyA9IGZpZWxkLmV2YWwoYXJnc1tpXSwgY29udGV4dCk7XG4gICAgICAgIGlmIChhcmcpIHtcbiAgICAgICAgICByZXR1cm4gYXJnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gYXJnc1thcmdzLmxlbmd0aCAtIDFdO1xuICAgIH07XG4gIH0sXG5cbiAgYW5kOiBmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgcGx1Z2luLmV4cG9ydHMgPSBmdW5jdGlvbiAoYXJncywgZmllbGQsIGNvbnRleHQpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgYXJnID0gZmllbGQuZXZhbChhcmdzW2ldLCBjb250ZXh0KTtcbiAgICAgICAgaWYgKCFhcmcgfHwgaSA9PT0gKGFyZ3MubGVuZ3RoIC0gMSkpIHtcbiAgICAgICAgICByZXR1cm4gYXJnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH07XG4gIH0sXG5cbiAgZ2V0OiBmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgdmFyIGdldCA9IHBsdWdpbi5leHBvcnRzID0gZnVuY3Rpb24gKGFyZ3MsIGZpZWxkLCBjb250ZXh0KSB7XG4gICAgICB2YXIgdXRpbCA9IHBsdWdpbi5yZXF1aXJlKCd1dGlsJyk7XG4gICAgICB2YXIga2V5ID0gZmllbGQuZXZhbChhcmdzWzBdLCBjb250ZXh0KTtcbiAgICAgIHZhciBvYmo7XG4gICAgICBpZiAoY29udGV4dCAmJiBrZXkgaW4gY29udGV4dCkge1xuICAgICAgICBvYmogPSBjb250ZXh0W2tleV07XG4gICAgICB9IGVsc2UgaWYgKF8uaXNPYmplY3QoZmllbGQudmFsdWUpICYmIGtleSBpbiBmaWVsZC52YWx1ZSkge1xuICAgICAgICBvYmogPSBmaWVsZC52YWx1ZVtrZXldO1xuICAgICAgfSBlbHNlIGlmIChmaWVsZC5wYXJlbnQpIHtcbiAgICAgICAgb2JqID0gZ2V0KGFyZ3MsIGZpZWxkLnBhcmVudCk7XG4gICAgICB9XG4gICAgICBpZiAoYXJncy5sZW5ndGggPiAxKSB7XG4gICAgICAgIHZhciBnZXRJbktleXMgPSBmaWVsZC5ldmFsKGFyZ3Muc2xpY2UoMSksIGNvbnRleHQpO1xuICAgICAgICByZXR1cm4gdXRpbC5nZXRJbihvYmosIGdldEluS2V5cyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH07XG4gIH0sXG5cbiAgZ2V0R3JvdXBWYWx1ZXM6IGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICBwbHVnaW4uZXhwb3J0cyA9IGZ1bmN0aW9uIChhcmdzLCBmaWVsZCwgY29udGV4dCkge1xuXG4gICAgICB2YXIgZ3JvdXBOYW1lID0gZmllbGQuZXZhbChhcmdzWzBdLCBjb250ZXh0KTtcblxuICAgICAgdmFyIGdyb3VwRmllbGRzID0gZmllbGQuZ3JvdXBGaWVsZHMoZ3JvdXBOYW1lKTtcblxuICAgICAgcmV0dXJuIGdyb3VwRmllbGRzLm1hcChmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgICAgcmV0dXJuIGZpZWxkLnZhbHVlO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfSxcblxuICBnZXRNZXRhOiBmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgdmFyIHV0aWwgPSBwbHVnaW4ucmVxdWlyZSgndXRpbCcpO1xuICAgIHBsdWdpbi5leHBvcnRzID0gZnVuY3Rpb24gKGFyZ3MsIGZpZWxkLCBjb250ZXh0KSB7XG4gICAgICBhcmdzID0gZmllbGQuZXZhbChhcmdzLCBjb250ZXh0KTtcbiAgICAgIHZhciBjYWNoZUtleSA9IHV0aWwubWV0YUNhY2hlS2V5KGFyZ3NbMF0sIGFyZ3NbMV0pO1xuICAgICAgcmV0dXJuIGZpZWxkLmZvcm0ubWV0YShjYWNoZUtleSk7XG4gICAgfTtcbiAgfSxcblxuICBzdW06IGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICBwbHVnaW4uZXhwb3J0cyA9IGZ1bmN0aW9uIChhcmdzLCBmaWVsZCwgY29udGV4dCkge1xuICAgICAgdmFyIHN1bSA9IDA7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgc3VtICs9IGZpZWxkLmV2YWwoYXJnc1tpXSwgY29udGV4dCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc3VtO1xuICAgIH07XG4gIH0sXG5cbiAgZm9yRWFjaDogZnVuY3Rpb24gKHBsdWdpbikge1xuICAgIHBsdWdpbi5leHBvcnRzID0gZnVuY3Rpb24gKGFyZ3MsIGZpZWxkLCBjb250ZXh0KSB7XG4gICAgICB2YXIgaXRlbU5hbWUgPSBhcmdzWzBdO1xuICAgICAgdmFyIGFycmF5ID0gZmllbGQuZXZhbChhcmdzWzFdLCBjb250ZXh0KTtcbiAgICAgIHZhciBtYXBFeHByID0gYXJnc1syXTtcbiAgICAgIHZhciBmaWx0ZXJFeHByID0gYXJnc1szXTtcbiAgICAgIGNvbnRleHQgPSBPYmplY3QuY3JlYXRlKGNvbnRleHQgfHwge30pO1xuXG4gICAgICB2YXIgcmVzdWx0cyA9IFtdO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBpdGVtID0gYXJyYXlbaV07XG4gICAgICAgIGNvbnRleHRbaXRlbU5hbWVdID0gaXRlbTtcbiAgICAgICAgaWYgKF8uaXNVbmRlZmluZWQoZmlsdGVyRXhwcikgfHwgZmllbGQuZXZhbChmaWx0ZXJFeHByLCBjb250ZXh0KSkge1xuICAgICAgICAgIHJlc3VsdHMucHVzaChmaWVsZC5ldmFsKG1hcEV4cHIsIGNvbnRleHQpKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9O1xuICB9LFxuXG4gIGNvbmNhdDogbWV0aG9kQ2FsbCgnY29uY2F0JyksXG4gIHNwbGl0OiBtZXRob2RDYWxsKCdzcGxpdCcpLFxuICByZXZlcnNlOiBtZXRob2RDYWxsKCdyZXZlcnNlJyksXG4gIGpvaW46IG1ldGhvZENhbGwoJ2pvaW4nKSxcblxuICBodW1hbml6ZTogZnVuY3Rpb24gKHBsdWdpbikge1xuICAgIHZhciB1dGlsID0gcGx1Z2luLnJlcXVpcmUoJ3V0aWwnKTtcbiAgICBwbHVnaW4uZXhwb3J0cyA9IGZ1bmN0aW9uIChhcmdzLCBmaWVsZCwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIHV0aWwuaHVtYW5pemUoZmllbGQuZXZhbChhcmdzWzBdLCBjb250ZXh0KSk7XG4gICAgfTtcbiAgfSxcblxuICBwaWNrOiB3cmFwRm4oXy5waWNrKSxcbiAgcGx1Y2s6IHdyYXBGbihfLnBsdWNrKVxufTtcblxuLy8gQnVpbGQgYSBwbHVnaW4gYnVuZGxlLlxuXy5lYWNoKHBsdWdpbnMsIGZ1bmN0aW9uIChmbiwgbmFtZSkge1xuICBtb2R1bGUuZXhwb3J0c1snZXZhbC1mdW5jdGlvbi4nICsgbmFtZV0gPSBmbjtcbn0pO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGV2YWxcblxuLypcblRoZSBldmFsIHBsdWdpbiB3aWxsIGV2YWx1YXRlIGEgZmllbGQncyBgZXZhbGAgcHJvcGVydHkgKHdoaWNoIG11c3QgYmUgYW5cbm9iamVjdCkgYW5kIGV4Y2hhbmdlIHRoZSBwcm9wZXJ0aWVzIG9mIHRoYXQgb2JqZWN0IGZvciB3aGF0ZXZlciB0aGVcbmV4cHJlc3Npb24gcmV0dXJucy4gRXhwcmVzc2lvbnMgYXJlIGp1c3QgSlNPTiBleGNlcHQgaWYgdGhlIGZpcnN0IGVsZW1lbnQgb2ZcbmFuIGFycmF5IGlzIGEgc3RyaW5nIHRoYXQgc3RhcnRzIHdpdGggJ0AnLiBJbiB0aGF0IGNhc2UsIHRoZSBhcnJheSBpc1xudHJlYXRlZCBhcyBhIExpc3AgZXhwcmVzc2lvbiB3aGVyZSB0aGUgZmlyc3QgZWxlbWVudCByZWZlcnMgdG8gYSBmdW5jdGlvblxudGhhdCBpcyBjYWxsZWQgd2l0aCB0aGUgcmVzdCBvZiB0aGUgZWxlbWVudHMgYXMgdGhlIGFyZ3VtZW50cy4gRm9yIGV4YW1wbGU6XG5cbmBgYGpzXG5bJ0BzdW0nLCAxLCAyXVxuYGBgXG5cbndpbGwgcmV0dXJuIHRoZSB2YWx1ZSAzLiBUaGUgZXhwcmVzc2lvbiBjb3VsZCBiZSB1c2VkIGluIGFuIGBldmFsYCBwcm9wZXJ0eSBvZlxuYSBmaWVsZCBsaWtlOlxuXG5gYGBqc1xue1xuICB0eXBlOiAnc3RyaW5nJyxcbiAga2V5OiAnbmFtZScsXG4gIGV2YWw6IHtcbiAgICByb3dzOiBbJ0BzdW0nLCAxLCAyXVxuICB9XG59XG5gYGBcblxuVGhlIGByb3dzYCBwcm9wZXJ0eSBvZiB0aGUgZmllbGQgd291bGQgYmUgc2V0IHRvIDMgaW4gdGhpcyBjYXNlLlxuXG5BbnkgcGx1Z2luIHJlZ2lzdGVyZWQgd2l0aCB0aGUgcHJlZml4IGBldmFsLWZ1bmN0aW9uLmAgd2lsbCBiZSBhdmFpbGFibGUgYXMgYVxuZnVuY3Rpb24gaW4gdGhlc2UgZXhwcmVzc2lvbnMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICAvLyBHcmFiIGFsbCB0aGUgZnVuY3Rpb24gcGx1Z2lucy5cbiAgdmFyIGV2YWxGdW5jdGlvblBsdWdpbnMgPSBwbHVnaW4ucmVxdWlyZUFsbE9mKCdldmFsLWZ1bmN0aW9uJyk7XG5cbiAgLy8gSnVzdCBzdHJpcCBvZmYgdGhlICdldmFsLWZ1bmN0aW9ucy4nIHByZWZpeCBhbmQgcHV0IGluIGEgZGlmZmVyZW50IG9iamVjdC5cbiAgdmFyIGZ1bmN0aW9ucyA9IHt9O1xuICBfLmVhY2goZXZhbEZ1bmN0aW9uUGx1Z2lucywgZnVuY3Rpb24gKGZuLCBuYW1lKSB7XG4gICAgdmFyIGZuTmFtZSA9IG5hbWUuc3Vic3RyaW5nKG5hbWUuaW5kZXhPZignLicpICsgMSk7XG4gICAgZnVuY3Rpb25zW2ZuTmFtZV0gPSBmbjtcbiAgfSk7XG5cbiAgLy8gQ2hlY2sgYW4gYXJyYXkgdG8gc2VlIGlmIGl0J3MgYSBmdW5jdGlvbiBleHByZXNzaW9uLlxuICB2YXIgaXNGdW5jdGlvbkFycmF5ID0gZnVuY3Rpb24gKGFycmF5KSB7XG4gICAgcmV0dXJuIGFycmF5Lmxlbmd0aCA+IDAgJiYgYXJyYXlbMF1bMF0gPT09ICdAJztcbiAgfTtcblxuICAvLyBFdmFsdWF0ZSBhIGZ1bmN0aW9uIGV4cHJlc3Npb24gYW5kIHJldHVybiB0aGUgcmVzdWx0LlxuICB2YXIgZXZhbEZ1bmN0aW9uID0gZnVuY3Rpb24gKGZuQXJyYXksIGZpZWxkLCBjb250ZXh0KSB7XG4gICAgdmFyIGZuTmFtZSA9IGZuQXJyYXlbMF0uc3Vic3RyaW5nKDEpO1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb25zW2ZuTmFtZV0oZm5BcnJheS5zbGljZSgxKSwgZmllbGQsIGNvbnRleHQpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmICghKGZuTmFtZSBpbiBmdW5jdGlvbnMpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRXZhbCBmdW5jdGlvbiAnICsgZm5OYW1lICsgJyBub3QgZGVmaW5lZC4nKTtcbiAgICAgIH1cbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9O1xuXG4gIC8vIEV2YWx1YXRlIGFuIGV4cHJlc3Npb24gaW4gdGhlIGNvbnRleHQgb2YgYSBmaWVsZC5cbiAgdmFyIGV2YWx1YXRlID0gZnVuY3Rpb24gKGV4cHJlc3Npb24sIGZpZWxkLCBjb250ZXh0KSB7XG4gICAgaWYgKF8uaXNBcnJheShleHByZXNzaW9uKSkge1xuICAgICAgaWYgKGlzRnVuY3Rpb25BcnJheShleHByZXNzaW9uKSkge1xuICAgICAgICByZXR1cm4gZXZhbEZ1bmN0aW9uKGV4cHJlc3Npb24sIGZpZWxkLCBjb250ZXh0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBleHByZXNzaW9uLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgIHJldHVybiBldmFsdWF0ZShpdGVtLCBmaWVsZCwgY29udGV4dCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoXy5pc09iamVjdChleHByZXNzaW9uKSkge1xuICAgICAgdmFyIG9iaiA9IHt9O1xuICAgICAgT2JqZWN0LmtleXMoZXhwcmVzc2lvbikuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBldmFsdWF0ZShleHByZXNzaW9uW2tleV0sIGZpZWxkLCBjb250ZXh0KTtcbiAgICAgICAgaWYgKHR5cGVvZiByZXN1bHQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgb2JqW2tleV0gPSByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIG9iajtcbiAgICB9IGVsc2UgaWYgKF8uaXNTdHJpbmcoZXhwcmVzc2lvbikgJiYgZXhwcmVzc2lvblswXSA9PT0gJz0nKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb25zLmdldChbZXhwcmVzc2lvbi5zdWJzdHJpbmcoMSldLCBmaWVsZCwgY29udGV4dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBleHByZXNzaW9uO1xuICAgIH1cbiAgfTtcblxuICBwbHVnaW4uZXhwb3J0cy5ldmFsdWF0ZSA9IGV2YWx1YXRlO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBmaWVsZC1yb3V0ZXJcblxuLypcbkZpZWxkcyBhbmQgY29tcG9uZW50cyBnZXQgZ2x1ZWQgdG9nZXRoZXIgdmlhIHJvdXRlcy4gVGhpcyBpcyBzaW1pbGFyIHRvIFVSTFxucm91dGluZyB3aGVyZSBhIHJlcXVlc3QgZ2V0cyBkeW5hbWljYWxseSByb3V0ZWQgdG8gYSBoYW5kbGVyLiBUaGlzIGdpdmVzIGEgbG90XG5vZiBmbGV4aWJpbGl0eSBpbiBpbnRyb2R1Y2luZyBuZXcgdHlwZXMgYW5kIGNvbXBvbmVudHMuIFlvdSBjYW4gY3JlYXRlIGEgbmV3XG50eXBlIGFuZCByb3V0ZSBpdCB0byBhbiBleGlzdGluZyBjb21wb25lbnQsIG9yIHlvdSBjYW4gY3JlYXRlIGEgbmV3IGNvbXBvbmVudFxuYW5kIHJvdXRlIGV4aXN0aW5nIHR5cGVzIHRvIGl0LiBPciB5b3UgY2FuIGNyZWF0ZSBib3RoIGFuZCByb3V0ZSB0aGUgbmV3IHR5cGVcbnRvIHRoZSBuZXcgY29tcG9uZW50LiBOZXcgcm91dGVzIGFyZSBhZGRlZCB2aWEgcm91dGUgcGx1Z2lucy4gQSByb3V0ZSBwbHVnaW5cbnNpbXBseSBleHBvcnRzIGFuIGFycmF5IGxpa2U6XG5cbmBgYGpzXG5bXG4gICdjb2xvcicsIC8vIFJvdXRlIHRoaXMgdHlwZVxuICAnY29sb3ItcGlja2VyLXdpdGgtYWxwaGEnLCAvLyBUbyB0aGlzIGNvbXBvbmVudFxuICBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICByZXR1cm4gdHlwZW9mIGZpZWxkLmRlZi5hbHBoYSAhPT0gJ3VuZGVmaW5lZCc7XG4gIH1cbl1cblxuUm91dGUgcGx1Z2lucyBjYW4gYmUgc3RhY2tlZCBhbmQgYXJlIHNlbnNpdGl2ZSB0byBvcmRlcmluZy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHZhciByb3V0ZXMgPSB7fTtcblxuICB2YXIgcm91dGVyID0gcGx1Z2luLmV4cG9ydHM7XG5cbiAgLy8gR2V0IGFsbCB0aGUgcm91dGUgcGx1Z2lucy5cbiAgdmFyIHJvdXRlUGx1Z2lucyA9IHBsdWdpbi5yZXF1aXJlQWxsKHBsdWdpbi5jb25maWcucm91dGVzKTtcblxuICAvLyBSZWdpc3RlciBhIHJvdXRlLlxuICByb3V0ZXIucm91dGUgPSBmdW5jdGlvbiAodHlwZU5hbWUsIGNvbXBvbmVudE5hbWUsIHRlc3RGbikge1xuICAgIGlmICghcm91dGVzW3R5cGVOYW1lXSkge1xuICAgICAgcm91dGVzW3R5cGVOYW1lXSA9IFtdO1xuICAgIH1cbiAgICByb3V0ZXNbdHlwZU5hbWVdLnB1c2goe1xuICAgICAgY29tcG9uZW50OiBjb21wb25lbnROYW1lLFxuICAgICAgdGVzdDogdGVzdEZuXG4gICAgfSk7XG4gIH07XG5cbiAgLy8gUmVnaXN0ZXIgZWFjaCBvZiB0aGUgcm91dGVzIHByb3ZpZGVkIGJ5IHRoZSByb3V0ZSBwbHVnaW5zLlxuICByb3V0ZVBsdWdpbnMuZm9yRWFjaChmdW5jdGlvbiAocm91dGVQbHVnaW4pIHtcblxuICAgIHJvdXRlci5yb3V0ZS5hcHBseShyb3V0ZXIsIHJvdXRlUGx1Z2luKTtcbiAgfSk7XG5cbiAgLy8gRGV0ZXJtaW5lIHRoZSBiZXN0IGNvbXBvbmVudCBmb3IgYSBmaWVsZCwgYmFzZWQgb24gdGhlIHJvdXRlcy5cbiAgcm91dGVyLmNvbXBvbmVudEZvckZpZWxkID0gZnVuY3Rpb24gKGZpZWxkKSB7XG5cbiAgICB2YXIgdHlwZU5hbWUgPSBmaWVsZC5kZWYudHlwZTtcblxuICAgIGlmIChyb3V0ZXNbdHlwZU5hbWVdKSB7XG4gICAgICB2YXIgcm91dGVzRm9yVHlwZSA9IHJvdXRlc1t0eXBlTmFtZV07XG4gICAgICB2YXIgcm91dGUgPSBfLmZpbmQocm91dGVzRm9yVHlwZSwgZnVuY3Rpb24gKHJvdXRlKSB7XG4gICAgICAgIHJldHVybiAhcm91dGUudGVzdCB8fCByb3V0ZS50ZXN0KGZpZWxkKTtcbiAgICAgIH0pO1xuICAgICAgaWYgKHJvdXRlKSB7XG4gICAgICAgIHJldHVybiBwbHVnaW4uY29tcG9uZW50KHJvdXRlLmNvbXBvbmVudCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBsdWdpbi5oYXNDb21wb25lbnQodHlwZU5hbWUpKSB7XG4gICAgICByZXR1cm4gcGx1Z2luLmNvbXBvbmVudCh0eXBlTmFtZSk7XG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKCdObyBjb21wb25lbnQgZm9yIGZpZWxkOiAnICsgSlNPTi5zdHJpbmdpZnkoZmllbGQuZGVmKSk7XG4gIH07XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGZpZWxkLXJvdXRlc1xuXG4vKlxuRGVmYXVsdCByb3V0ZXMuIEVhY2ggcm91dGUgaXMgcGFydCBvZiBpdHMgb3duIHBsdWdpbiwgYnV0IGFsbCBhcmUga2VwdCB0b2dldGhlclxuaGVyZSBhcyBwYXJ0IG9mIGEgcGx1Z2luIGJ1bmRsZS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbnZhciByb3V0ZXMgPSB7XG5cbiAgJ29iamVjdC5kZWZhdWx0JzogW1xuICAgICdvYmplY3QnLFxuICAgICdmaWVsZHNldCdcbiAgXSxcblxuICAnc3RyaW5nLmNob2ljZXMnOiBbXG4gICAgJ3N0cmluZycsXG4gICAgJ3NlbGVjdCcsXG4gICAgZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICByZXR1cm4gZmllbGQuZGVmLmNob2ljZXMgPyB0cnVlIDogZmFsc2U7XG4gICAgfVxuICBdLFxuXG4gICdzdHJpbmcudGFncyc6IFtcbiAgICAnc3RyaW5nJyxcbiAgICAncHJldHR5LXRleHRhcmVhJyxcbiAgICBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgIHJldHVybiBmaWVsZC5kZWYucmVwbGFjZUNob2ljZXM7XG4gICAgfVxuICBdLFxuXG4gICdzdHJpbmcuc2luZ2xlLWxpbmUnOiBbXG4gICAgJ3N0cmluZycsXG4gICAgJ3RleHQnLFxuICAgIGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgcmV0dXJuIGZpZWxkLmRlZi5tYXhSb3dzID09PSAxO1xuICAgIH1cbiAgXSxcblxuICAnc3RyaW5nLmRlZmF1bHQnOiBbXG4gICAgJ3N0cmluZycsXG4gICAgJ3RleHRhcmVhJ1xuICBdLFxuXG4gICdhcnJheS5jaG9pY2VzJzogW1xuICAgICdhcnJheScsXG4gICAgJ2NoZWNrYm94LWxpc3QnLFxuICAgIGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgcmV0dXJuIGZpZWxkLmRlZi5jaG9pY2VzID8gdHJ1ZSA6IGZhbHNlO1xuICAgIH1cbiAgXSxcblxuICAnYXJyYXkuZGVmYXVsdCc6IFtcbiAgICAnYXJyYXknLFxuICAgICdsaXN0J1xuICBdLFxuXG4gICdib29sZWFuLmRlZmF1bHQnOiBbXG4gICAgJ2Jvb2xlYW4nLFxuICAgICdzZWxlY3QnXG4gIF0sXG5cbiAgJ251bWJlci5kZWZhdWx0JzogW1xuICAgICdudW1iZXInLFxuICAgICd0ZXh0J1xuICBdXG5cbn07XG5cbi8vIEJ1aWxkIGEgcGx1Z2luIGJ1bmRsZS5cbl8uZWFjaChyb3V0ZXMsIGZ1bmN0aW9uIChyb3V0ZSwgbmFtZSkge1xuICBtb2R1bGUuZXhwb3J0c1snZmllbGQtcm91dGUuJyArIG5hbWVdID0gZnVuY3Rpb24gKHBsdWdpbikge1xuICAgIHBsdWdpbi5leHBvcnRzID0gcm91dGU7XG4gIH07XG59KTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiLy8gIyBsb2FkZXJcblxuLypcbldoZW4gbWV0YWRhdGEgaXNuJ3QgYXZhaWxhYmxlLCB3ZSBhc2sgdGhlIGxvYWRlciB0byBsb2FkIGl0LiBUaGUgbG9hZGVyIHdpbGxcbnRyeSB0byBmaW5kIGFuIGFwcHJvcHJpYXRlIHNvdXJjZSBiYXNlZCBvbiB0aGUgbWV0YWRhdGEga2V5cy5cblxuTm90ZSB0aGF0IHdlIGFzayB0aGUgbG9hZGVyIHRvIGxvYWQgbWV0YWRhdGEgd2l0aCBhIHNldCBvZiBrZXlzIGxpa2VcbmBbJ2ZvbycsICdiYXInXWAsIGJ1dCB0aG9zZSBhcmUgY29udmVydGVkIHRvIGEgc2luZ2xlIGtleSBsaWtlIGBmb286OmJhcmAgZm9yXG50aGUgc2FrZSBvZiBjYWNoaW5nLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICB2YXIgdXRpbCA9IHBsdWdpbi5yZXF1aXJlKCd1dGlsJyk7XG5cbiAgdmFyIGxvYWRlciA9IHBsdWdpbi5leHBvcnRzO1xuXG4gIHZhciBpc0xvYWRpbmcgPSB7fTtcbiAgdmFyIHNvdXJjZXMgPSB7fTtcblxuICAvLyBMb2FkIG1ldGFkYXRhIGZvciBhIGdpdmVuIGZvcm0gYW5kIHBhcmFtcy5cbiAgbG9hZGVyLmxvYWRNZXRhID0gZnVuY3Rpb24gKGZvcm0sIHNvdXJjZSwgcGFyYW1zKSB7XG4gICAgdmFyIGNhY2hlS2V5ID0gdXRpbC5tZXRhQ2FjaGVLZXkoc291cmNlLCBwYXJhbXMpO1xuXG4gICAgaWYgKGlzTG9hZGluZ1tjYWNoZUtleV0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpc0xvYWRpbmdbY2FjaGVLZXldID0gdHJ1ZTtcblxuICAgIGxvYWRlci5sb2FkQXN5bmNGcm9tU291cmNlKGZvcm0sIHNvdXJjZSwgcGFyYW1zKTtcbiAgfTtcblxuICAvLyBNYWtlIHN1cmUgdG8gbG9hZCBtZXRhZGF0YSBhc3luY2hyb25vdXNseS5cbiAgbG9hZGVyLmxvYWRBc3luY0Zyb21Tb3VyY2UgPSBmdW5jdGlvbiAoZm9ybSwgc291cmNlLCBwYXJhbXMsIHdhaXRUaW1lKSB7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBsb2FkZXIubG9hZEZyb21Tb3VyY2UoZm9ybSwgc291cmNlLCBwYXJhbXMpO1xuICAgIH0sIHdhaXRUaW1lIHx8IDApO1xuICB9O1xuXG4gIC8vIExvYWQgbWV0YWRhdGEgZm9yIGEgZm9ybSBhbmQgcGFyYW1zLlxuICBsb2FkZXIubG9hZEZyb21Tb3VyY2UgPSBmdW5jdGlvbiAoZm9ybSwgc291cmNlTmFtZSwgcGFyYW1zKSB7XG5cbiAgICAvLyBGaW5kIHRoZSBiZXN0IHNvdXJjZSBmb3IgdGhpcyBjYWNoZSBrZXkuXG4gICAgdmFyIHNvdXJjZSA9IHNvdXJjZXNbc291cmNlTmFtZV07XG4gICAgaWYgKHNvdXJjZSkge1xuXG4gICAgICB2YXIgY2FjaGVLZXkgPSB1dGlsLm1ldGFDYWNoZUtleShzb3VyY2VOYW1lLCBwYXJhbXMpO1xuXG4gICAgICAvLyBDYWxsIHRoZSBzb3VyY2UgZnVuY3Rpb24uXG4gICAgICB2YXIgcmVzdWx0ID0gc291cmNlLmNhbGwobnVsbCwgcGFyYW1zKTtcblxuICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAvLyBSZXN1bHQgY291bGQgYmUgYSBwcm9taXNlLlxuICAgICAgICBpZiAocmVzdWx0LnRoZW4pIHtcbiAgICAgICAgICB2YXIgcHJvbWlzZSA9IHJlc3VsdC50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgIGZvcm0ubWV0YShjYWNoZUtleSwgcmVzdWx0KTtcbiAgICAgICAgICAgIGlzTG9hZGluZ1tjYWNoZUtleV0gPSBmYWxzZTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHZhciBvbkVycm9yID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaXNMb2FkaW5nW2NhY2hlS2V5XSA9IGZhbHNlO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICBpZiAocHJvbWlzZS5jYXRjaCkge1xuICAgICAgICAgICAgcHJvbWlzZS5jYXRjaChvbkVycm9yKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gc2lsbHkgalF1ZXJ5IHByb21pc2VzXG4gICAgICAgICAgICBwcm9taXNlLmZhaWwob25FcnJvcik7XG4gICAgICAgICAgfVxuICAgICAgICAvLyBPciBpdCBjb3VsZCBiZSBhIHZhbHVlLiBJbiB0aGF0IGNhc2UsIG1ha2Ugc3VyZSB0byBhc3luY2lmeSBpdC5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZvcm0ubWV0YShjYWNoZUtleSwgcmVzdWx0KTtcbiAgICAgICAgICAgIGlzTG9hZGluZ1tjYWNoZUtleV0gPSBmYWxzZTtcbiAgICAgICAgICB9LCAwKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaXNMb2FkaW5nW2NhY2hlS2V5XSA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgfSBlbHNlIHtcbiAgICAgIGlzTG9hZGluZ1tjYWNoZUtleV0gPSBmYWxzZTtcbiAgICB9XG4gIH07XG5cbiAgLy8gUmVnaXN0ZXIgYSBzb3VyY2UgZnVuY3Rpb24uXG4gIGxvYWRlci5zb3VyY2UgPSBmdW5jdGlvbiAobmFtZSwgZm4pIHtcblxuICAgIHNvdXJjZXNbbmFtZV0gPSBmbjtcbiAgfTtcblxufTtcbiIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgdXRpbFxuXG4vLyBTb21lIHV0aWxpdHkgZnVuY3Rpb25zIHRvIGJlIHVzZWQgYnkgb3RoZXIgcGx1Z2lucy5cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgdmFyIHV0aWwgPSBwbHVnaW4uZXhwb3J0cztcblxuICAvLyBDaGVjayBpZiBhIHZhbHVlIGlzIFwiYmxhbmtcIi5cbiAgdXRpbC5pc0JsYW5rID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09ICcnO1xuICB9O1xuXG4gIC8vIFNldCB2YWx1ZSBhdCBzb21lIHBhdGggaW4gb2JqZWN0LlxuICB1dGlsLnNldEluID0gZnVuY3Rpb24gKG9iaiwgcGF0aCwgdmFsdWUpIHtcbiAgICBpZiAoXy5pc1N0cmluZyhwYXRoKSkge1xuICAgICAgcGF0aCA9IFtwYXRoXTtcbiAgICB9XG4gICAgaWYgKHBhdGgubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMSkge1xuICAgICAgb2JqW3BhdGhbMF1dID0gdmFsdWU7XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH1cbiAgICBpZiAoIW9ialtwYXRoWzBdXSkge1xuICAgICAgb2JqW3BhdGhbMF1dID0ge307XG4gICAgfVxuICAgIHV0aWwuc2V0SW4ob2JqW3BhdGhbMF1dLCBwYXRoLnNsaWNlKDEpLCB2YWx1ZSk7XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBSZW1vdmUgdmFsdWUgYXQgcGF0aCBpbiBzb21lIG9iamVjdC5cbiAgdXRpbC5yZW1vdmVJbiA9IGZ1bmN0aW9uIChvYmosIHBhdGgpIHtcbiAgICBpZiAoXy5pc1N0cmluZyhwYXRoKSkge1xuICAgICAgcGF0aCA9IFtwYXRoXTtcbiAgICB9XG4gICAgaWYgKHBhdGgubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKHBhdGgubGVuZ3RoID09PSAxKSB7XG4gICAgICBpZiAoXy5pc0FycmF5KG9iaikpIHtcbiAgICAgICAgaWYgKF8uaXNOdW1iZXIocGF0aFswXSkpIHtcbiAgICAgICAgICBvYmouc3BsaWNlKHBhdGhbMF0sIDEpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKF8uaXNPYmplY3Qob2JqKSkge1xuICAgICAgICBkZWxldGUgb2JqW3BhdGhbMF1dO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG4gICAgaWYgKG9ialtwYXRoWzBdXSkge1xuICAgICAgdXRpbC5yZW1vdmVJbihvYmpbcGF0aFswXV0sIHBhdGguc2xpY2UoMSkpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIEdldCB2YWx1ZSBhdCBwYXRoIGluIHNvbWUgb2JqZWN0LlxuICB1dGlsLmdldEluID0gZnVuY3Rpb24gKG9iaiwgcGF0aCkge1xuICAgIGlmIChfLmlzU3RyaW5nKHBhdGgpKSB7XG4gICAgICBwYXRoID0gW3BhdGhdO1xuICAgIH1cbiAgICBpZiAocGF0aC5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuICAgIGlmIChfLmlzT2JqZWN0KG9iaikgJiYgcGF0aFswXSBpbiBvYmopIHtcbiAgICAgIHJldHVybiB1dGlsLmdldEluKG9ialtwYXRoWzBdXSwgcGF0aC5zbGljZSgxKSk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9O1xuXG4gIC8vIEFwcGVuZCB0byBhcnJheSBhdCBwYXRoIGluIHNvbWUgb2JqZWN0LlxuICB1dGlsLmFwcGVuZEluID0gZnVuY3Rpb24gKG9iaiwgcGF0aCwgdmFsdWUpIHtcbiAgICB2YXIgc3ViT2JqID0gdXRpbC5nZXRJbihvYmosIHBhdGgpO1xuICAgIGlmIChfLmlzQXJyYXkoc3ViT2JqKSkge1xuICAgICAgc3ViT2JqLnB1c2godmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIFN3YXAgdHdvIGtleXMgYXQgcGF0aCBpbiBzb21lIG9iamVjdC5cbiAgdXRpbC5tb3ZlSW4gPSBmdW5jdGlvbiAob2JqLCBwYXRoLCBmcm9tS2V5LCB0b0tleSkge1xuICAgIHZhciBzdWJPYmogPSB1dGlsLmdldEluKG9iaiwgcGF0aCk7XG4gICAgaWYgKF8uaXNBcnJheShzdWJPYmopKSB7XG4gICAgICBpZiAoXy5pc051bWJlcihmcm9tS2V5KSAmJiBfLmlzTnVtYmVyKHRvS2V5KSkge1xuICAgICAgICB2YXIgZnJvbUluZGV4ID0gZnJvbUtleTtcbiAgICAgICAgdmFyIHRvSW5kZXggPSB0b0tleTtcbiAgICAgICAgaWYgKGZyb21JbmRleCAhPT0gdG9JbmRleCAmJlxuICAgICAgICAgIGZyb21JbmRleCA+PSAwICYmIGZyb21JbmRleCA8IHN1Yk9iai5sZW5ndGggJiZcbiAgICAgICAgICB0b0luZGV4ID49IDAgJiYgdG9JbmRleCA8IHN1Yk9iai5sZW5ndGhcbiAgICAgICAgKSB7XG4gICAgICAgICAgc3ViT2JqLnNwbGljZSh0b0luZGV4LCAwLCBzdWJPYmouc3BsaWNlKGZyb21JbmRleCwgMSlbMF0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBmcm9tVmFsdWUgPSBzdWJPYmpbZnJvbUtleV07XG4gICAgICBzdWJPYmpbZnJvbUtleV0gPSBzdWJPYmpbdG9LZXldO1xuICAgICAgc3ViT2JqW3RvS2V5XSA9IGZyb21WYWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBDb3B5IG9iaiwgbGVhdmluZyBub24tSlNPTiBiZWhpbmQuXG4gIHV0aWwuY29weVZhbHVlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodmFsdWUpKTtcbiAgfTtcblxuICAvLyBDb3B5IG9iaiByZWN1cnNpbmcgZGVlcGx5LlxuICB1dGlsLmRlZXBDb3B5ID0gZnVuY3Rpb24gKG9iaikge1xuICAgIGlmIChfLmlzQXJyYXkob2JqKSkge1xuICAgICAgcmV0dXJuIG9iai5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIHV0aWwuZGVlcENvcHkoaXRlbSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKF8uaXNPYmplY3Qob2JqKSkge1xuICAgICAgdmFyIGNvcHkgPSB7fTtcbiAgICAgIF8uZWFjaChvYmosIGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICAgIGNvcHlba2V5XSA9IHV0aWwuZGVlcENvcHkodmFsdWUpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gY29weTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG4gIH07XG5cbiAgLy8gQ2hlY2sgaWYgaXRlbSBtYXRjaGVzIHNvbWUgdmFsdWUsIGJhc2VkIG9uIHRoZSBpdGVtJ3MgYG1hdGNoYCBwcm9wZXJ0eS5cbiAgdXRpbC5pdGVtTWF0Y2hlc1ZhbHVlID0gZnVuY3Rpb24gKGl0ZW0sIHZhbHVlKSB7XG4gICAgdmFyIG1hdGNoID0gaXRlbS5tYXRjaDtcbiAgICBpZiAoIW1hdGNoKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIF8uZXZlcnkoXy5rZXlzKG1hdGNoKSwgZnVuY3Rpb24gKGtleSkge1xuICAgICAgcmV0dXJuIF8uaXNFcXVhbChtYXRjaFtrZXldLCB2YWx1ZVtrZXldKTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBDcmVhdGUgYSBmaWVsZCBkZWZpbml0aW9uIGZyb20gYSB2YWx1ZS5cbiAgdXRpbC5maWVsZERlZkZyb21WYWx1ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHZhciBkZWYgPSB7XG4gICAgICB0eXBlOiAnanNvbidcbiAgICB9O1xuICAgIGlmIChfLmlzU3RyaW5nKHZhbHVlKSkge1xuICAgICAgZGVmID0ge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKF8uaXNOdW1iZXIodmFsdWUpKSB7XG4gICAgICBkZWYgPSB7XG4gICAgICAgIHR5cGU6ICdudW1iZXInXG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAoXy5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgdmFyIGFycmF5SXRlbUZpZWxkcyA9IHZhbHVlLm1hcChmdW5jdGlvbiAodmFsdWUsIGkpIHtcbiAgICAgICAgdmFyIGNoaWxkRGVmID0gdXRpbC5maWVsZERlZkZyb21WYWx1ZSh2YWx1ZSk7XG4gICAgICAgIGNoaWxkRGVmLmtleSA9IGk7XG4gICAgICAgIHJldHVybiBjaGlsZERlZjtcbiAgICAgIH0pO1xuICAgICAgZGVmID0ge1xuICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICBmaWVsZHM6IGFycmF5SXRlbUZpZWxkc1xuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKF8uaXNPYmplY3QodmFsdWUpKSB7XG4gICAgICB2YXIgb2JqZWN0SXRlbUZpZWxkcyA9IE9iamVjdC5rZXlzKHZhbHVlKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgICB2YXIgY2hpbGREZWYgPSB1dGlsLmZpZWxkRGVmRnJvbVZhbHVlKHZhbHVlW2tleV0pO1xuICAgICAgICBjaGlsZERlZi5rZXkgPSBrZXk7XG4gICAgICAgIGNoaWxkRGVmLmxhYmVsID0gdXRpbC5odW1hbml6ZShrZXkpO1xuICAgICAgICByZXR1cm4gY2hpbGREZWY7XG4gICAgICB9KTtcbiAgICAgIGRlZiA9IHtcbiAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgIGZpZWxkczogb2JqZWN0SXRlbUZpZWxkc1xuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKF8uaXNOdWxsKHZhbHVlKSkge1xuICAgICAgZGVmID0ge1xuICAgICAgICB0eXBlOiAnbnVsbCdcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBkZWY7XG4gIH07XG5cbiAgaWYgKHBsdWdpbi5jb25maWcuaHVtYW5pemUpIHtcbiAgICAvLyBHZXQgdGhlIGh1bWFuaXplIGZ1bmN0aW9uIGZyb20gYSBwbHVnaW4gaWYgcHJvdmlkZWQuXG4gICAgdXRpbC5odW1hbml6ZSA9IHBsdWdpbi5yZXF1aXJlKHBsdWdpbi5jb25maWcuaHVtYW5pemUpO1xuICB9IGVsc2Uge1xuICAgIC8vIENvbnZlcnQgcHJvcGVydHkga2V5cyB0byBcImh1bWFuXCIgbGFiZWxzLiBGb3IgZXhhbXBsZSwgJ2ZvbycgYmVjb21lc1xuICAgIC8vICdGb28nLlxuICAgIHV0aWwuaHVtYW5pemUgPSBmdW5jdGlvbihwcm9wZXJ0eSkge1xuICAgICAgcHJvcGVydHkgPSBwcm9wZXJ0eS5yZXBsYWNlKC9cXHtcXHsvZywgJycpO1xuICAgICAgcHJvcGVydHkgPSBwcm9wZXJ0eS5yZXBsYWNlKC9cXH1cXH0vZywgJycpO1xuICAgICAgcmV0dXJuIHByb3BlcnR5LnJlcGxhY2UoL18vZywgJyAnKVxuICAgICAgICAucmVwbGFjZSgvKFxcdyspL2csIGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgICAgICAgcmV0dXJuIG1hdGNoLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgbWF0Y2guc2xpY2UoMSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gIH1cblxuICAvLyBKb2luIG11bHRpcGxlIENTUyBjbGFzcyBuYW1lcyB0b2dldGhlciwgaWdub3JpbmcgYW55IHRoYXQgYXJlbid0IHRoZXJlLlxuICB1dGlsLmNsYXNzTmFtZSA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjbGFzc05hbWVzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKTtcblxuICAgIGNsYXNzTmFtZXMgPSBjbGFzc05hbWVzLmZpbHRlcihmdW5jdGlvbiAobmFtZSkge1xuICAgICAgcmV0dXJuIG5hbWU7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY2xhc3NOYW1lcy5qb2luKCcgJyk7XG4gIH07XG5cbiAgLy8gSm9pbiBrZXlzIHRvZ2V0aGVyIHRvIG1ha2Ugc2luZ2xlIFwibWV0YVwiIGtleS4gRm9yIGxvb2tpbmcgdXAgbWV0YWRhdGEgaW5cbiAgLy8gdGhlIG1ldGFkYXRhIHBhcnQgb2YgdGhlIHN0b3JlLlxuICB1dGlsLmpvaW5NZXRhS2V5cyA9IGZ1bmN0aW9uIChrZXlzKSB7XG4gICAgcmV0dXJuIGtleXMuam9pbignOjonKTtcbiAgfTtcblxuICAvLyBTcGxpdCBhIGpvaW5lZCBrZXkgaW50byBzZXBhcmF0ZSBrZXkgcGFydHMuXG4gIHV0aWwuc3BsaXRNZXRhS2V5ID0gZnVuY3Rpb24gKGtleSkge1xuICAgIHJldHVybiBrZXkuc3BsaXQoJzo6Jyk7XG4gIH07XG5cbiAgdXRpbC5tZXRhQ2FjaGVLZXkgPSBmdW5jdGlvbiAoc291cmNlLCBwYXJhbXMpIHtcbiAgICBwYXJhbXMgPSBwYXJhbXMgfHwge307XG4gICAgcmV0dXJuIHNvdXJjZSArICc6OnBhcmFtcygnICsgSlNPTi5zdHJpbmdpZnkocGFyYW1zKSArICcpJztcbiAgfTtcblxuICAvLyBXcmFwIGEgdGV4dCB2YWx1ZSBzbyBpdCBoYXMgYSB0eXBlLiBGb3IgcGFyc2luZyB0ZXh0IHdpdGggdGFncy5cbiAgdmFyIHRleHRQYXJ0ID0gZnVuY3Rpb24gKHZhbHVlLCB0eXBlKSB7XG4gICAgdHlwZSA9IHR5cGUgfHwgJ3RleHQnO1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiB0eXBlLFxuICAgICAgdmFsdWU6IHZhbHVlXG4gICAgfTtcbiAgfTtcblxuICAvLyBQYXJzZSB0ZXh0IHRoYXQgaGFzIHRhZ3MgbGlrZSB7e3RhZ319IGludG8gdGV4dCBhbmQgdGFncy5cbiAgdXRpbC5wYXJzZVRleHRXaXRoVGFncyA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHZhbHVlID0gdmFsdWUgfHwgJyc7XG4gICAgdmFyIHBhcnRzID0gdmFsdWUuc3BsaXQoL3t7KD8heykvKTtcbiAgICB2YXIgZnJvbnRQYXJ0ID0gW107XG4gICAgaWYgKHBhcnRzWzBdICE9PSAnJykge1xuICAgICAgZnJvbnRQYXJ0ID0gW1xuICAgICAgICB0ZXh0UGFydChwYXJ0c1swXSlcbiAgICAgIF07XG4gICAgfVxuICAgIHBhcnRzID0gZnJvbnRQYXJ0LmNvbmNhdChcbiAgICAgIHBhcnRzLnNsaWNlKDEpLm1hcChmdW5jdGlvbiAocGFydCkge1xuICAgICAgICBpZiAocGFydC5pbmRleE9mKCd9fScpID49IDApIHtcbiAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgdGV4dFBhcnQocGFydC5zdWJzdHJpbmcoMCwgcGFydC5pbmRleE9mKCd9fScpKSwgJ3RhZycpLFxuICAgICAgICAgICAgdGV4dFBhcnQocGFydC5zdWJzdHJpbmcocGFydC5pbmRleE9mKCd9fScpICsgMikpXG4gICAgICAgICAgXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGV4dFBhcnQoJ3t7JyArIHBhcnQsICd0ZXh0Jyk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgKTtcbiAgICByZXR1cm4gW10uY29uY2F0LmFwcGx5KFtdLCBwYXJ0cyk7XG4gIH07XG5cbiAgLy8gQ29weSBhbGwgY29tcHV0ZWQgc3R5bGVzIGZyb20gb25lIERPTSBlbGVtZW50IHRvIGFub3RoZXIuXG4gIHV0aWwuY29weUVsZW1lbnRTdHlsZSA9IGZ1bmN0aW9uIChmcm9tRWxlbWVudCwgdG9FbGVtZW50KSB7XG4gICAgdmFyIGZyb21TdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGZyb21FbGVtZW50LCAnJyk7XG5cbiAgICBpZiAoZnJvbVN0eWxlLmNzc1RleHQgIT09ICcnKSB7XG4gICAgICB0b0VsZW1lbnQuc3R5bGUuY3NzVGV4dCA9IGZyb21TdHlsZS5jc3NUZXh0O1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBjc3NSdWxlcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZnJvbVN0eWxlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAvL2NvbnNvbGUubG9nKGksIGZyb21TdHlsZVtpXSwgZnJvbVN0eWxlLmdldFByb3BlcnR5VmFsdWUoZnJvbVN0eWxlW2ldKSlcbiAgICAgIC8vdG9FbGVtZW50LnN0eWxlW2Zyb21TdHlsZVtpXV0gPSBmcm9tU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShmcm9tU3R5bGVbaV0pO1xuICAgICAgY3NzUnVsZXMucHVzaChmcm9tU3R5bGVbaV0gKyAnOicgKyBmcm9tU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShmcm9tU3R5bGVbaV0pICsgJzsnKTtcbiAgICB9XG4gICAgdmFyIGNzc1RleHQgPSBjc3NSdWxlcy5qb2luKCcnKTtcblxuICAgIHRvRWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gY3NzVGV4dDtcbiAgfTtcblxuICAvLyBPYmplY3QgdG8gaG9sZCBicm93c2VyIHNuaWZmaW5nIGluZm8uXG4gIHZhciBicm93c2VyID0ge1xuICAgIGlzQ2hyb21lOiBmYWxzZSxcbiAgICBpc01vemlsbGE6IGZhbHNlLFxuICAgIGlzT3BlcmE6IGZhbHNlLFxuICAgIGlzSWU6IGZhbHNlLFxuICAgIGlzU2FmYXJpOiBmYWxzZVxuICB9O1xuXG4gIC8vIFNuaWZmIHRoZSBicm93c2VyLlxuICB2YXIgdWEgPSBuYXZpZ2F0b3IudXNlckFnZW50O1xuICBpZih1YS5pbmRleE9mKCdDaHJvbWUnKSA+IC0xKSB7XG4gICAgYnJvd3Nlci5pc0Nocm9tZSA9IHRydWU7XG4gIH0gZWxzZSBpZiAodWEuaW5kZXhPZignU2FmYXJpJykgPiAtMSkge1xuICAgIGJyb3dzZXIuaXNTYWZhcmkgPSB0cnVlO1xuICB9IGVsc2UgaWYgKHVhLmluZGV4T2YoJ09wZXJhJykgPiAtMSkge1xuICAgIGJyb3dzZXIuaXNPcGVyYSA9IHRydWU7XG4gIH0gZWxzZSBpZiAodWEuaW5kZXhPZignRmlyZWZveCcpID4gLTEpIHtcbiAgICBicm93c2VyLmlzTW96aWxsYSA9IHRydWU7XG4gIH0gZWxzZSBpZiAodWEuaW5kZXhPZignTVNJRScpID4gLTEpIHtcbiAgICBicm93c2VyLmlzSWUgPSB0cnVlO1xuICB9XG5cbiAgdXRpbC5icm93c2VyID0gYnJvd3NlcjtcblxufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbi8vICMgRm9ybWF0aWMgcGx1Z2luIGNvcmVcblxuLy8gQXQgaXRzIGNvcmUsIEZvcm1hdGljIGlzIGp1c3QgYSBwbHVnaW4gaG9zdC4gQWxsIG9mIHRoZSBmdW5jdGlvbmFsaXR5IGl0IGhhc1xuLy8gb3V0IG9mIHRoZSBib3ggaXMgdmlhIHBsdWdpbnMuIFRoZXNlIHBsdWdpbnMgY2FuIGJlIHJlcGxhY2VkIG9yIGV4dGVuZGVkIGJ5XG4vLyBvdGhlciBwbHVnaW5zLlxuXG4vLyBUaGUgZ2xvYmFsIHBsdWdpbiByZWdpc3RyeSBob2xkcyByZWdpc3RlcmVkIChidXQgbm90IHlldCBpbnN0YW50aWF0ZWQpXG4vLyBwbHVnaW5zLlxudmFyIHBsdWdpblJlZ2lzdHJ5ID0ge307XG5cbi8vIEdyb3VwIHBsdWdpbnMgYnkgcHJlZml4LlxudmFyIHBsdWdpbkdyb3VwcyA9IHt9O1xuXG4vLyBGb3IgYW5vbnltb3VzIHBsdWdpbnMsIGluY3JlbWVudGluZyBudW1iZXIgZm9yIG5hbWVzLlxudmFyIHBsdWdpbklkID0gMDtcblxuLy8gUmVnaXN0ZXIgYSBwbHVnaW4gb3IgcGx1Z2luIGJ1bmRsZSAoYXJyYXkgb2YgcGx1Z2lucykgZ2xvYmFsbHkuXG52YXIgcmVnaXN0ZXJQbHVnaW4gPSBmdW5jdGlvbiAobmFtZSwgcGx1Z2luSW5pdEZuKSB7XG5cbiAgaWYgKHBsdWdpblJlZ2lzdHJ5W25hbWVdKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdQbHVnaW4gJyArIG5hbWUgKyAnIGlzIGFscmVhZHkgcmVnaXN0ZXJlZC4nKTtcbiAgfVxuXG4gIGlmIChfLmlzQXJyYXkocGx1Z2luSW5pdEZuKSkge1xuICAgIHBsdWdpblJlZ2lzdHJ5W25hbWVdID0gW107XG4gICAgcGx1Z2luSW5pdEZuLmZvckVhY2goZnVuY3Rpb24gKHBsdWdpblNwZWMpIHtcbiAgICAgIHJlZ2lzdGVyUGx1Z2luKHBsdWdpblNwZWMubmFtZSwgcGx1Z2luU3BlYy5wbHVnaW4pO1xuICAgICAgcGx1Z2luUmVnaXN0cnlbbmFtZV0ucHVzaChwbHVnaW5TcGVjLm5hbWUpO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKF8uaXNPYmplY3QocGx1Z2luSW5pdEZuKSAmJiAhXy5pc0Z1bmN0aW9uKHBsdWdpbkluaXRGbikpIHtcbiAgICB2YXIgYnVuZGxlTmFtZSA9IG5hbWU7XG4gICAgcGx1Z2luUmVnaXN0cnlbYnVuZGxlTmFtZV0gPSBbXTtcbiAgICBPYmplY3Qua2V5cyhwbHVnaW5Jbml0Rm4pLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgIHJlZ2lzdGVyUGx1Z2luKG5hbWUsIHBsdWdpbkluaXRGbltuYW1lXSk7XG4gICAgICBwbHVnaW5SZWdpc3RyeVtidW5kbGVOYW1lXS5wdXNoKG5hbWUpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHBsdWdpblJlZ2lzdHJ5W25hbWVdID0gcGx1Z2luSW5pdEZuO1xuICAgIC8vIEFkZCBwbHVnaW4gbmFtZSB0byBwbHVnaW4gZ3JvdXAgaWYgaXQgaGFzIGEgcHJlZml4LlxuICAgIGlmIChuYW1lLmluZGV4T2YoJy4nKSA+IDApIHtcbiAgICAgIHZhciBwcmVmaXggPSBuYW1lLnN1YnN0cmluZygwLCBuYW1lLmluZGV4T2YoJy4nKSk7XG4gICAgICBwbHVnaW5Hcm91cHNbcHJlZml4XSA9IHBsdWdpbkdyb3Vwc1twcmVmaXhdIHx8IFtdO1xuICAgICAgcGx1Z2luR3JvdXBzW3ByZWZpeF0ucHVzaChuYW1lKTtcbiAgICB9XG4gIH1cbn07XG5cbi8vIERlZmF1bHQgcGx1Z2luIGNvbmZpZy4gRWFjaCBrZXkgcmVwcmVzZW50cyBhIHBsdWdpbiBuYW1lLiBFYWNoIGtleSBvZiB0aGF0XG4vLyBwbHVnaW4gcmVwcmVzZW50cyBhIHNldHRpbmcgZm9yIHRoYXQgcGx1Z2luLiBQYXNzZWQtaW4gY29uZmlnIHdpbGwgb3ZlcnJpZGVcbi8vIGVhY2ggaW5kaXZpZHVhbCBzZXR0aW5nLlxudmFyIGRlZmF1bHRQbHVnaW5Db25maWcgPSB7XG4gIGNvcmU6IHtcbiAgICBmb3JtYXRpYzogWydjb3JlLmZvcm1hdGljJ10sXG4gICAgZm9ybTogWydjb3JlLmZvcm0taW5pdCcsICdjb3JlLmZvcm0nLCAnY29yZS5maWVsZCddXG4gIH0sXG4gICdjb3JlLmZvcm0nOiB7XG4gICAgc3RvcmU6ICdzdG9yZS5tZW1vcnknXG4gIH0sXG4gICdmaWVsZC1yb3V0ZXInOiB7XG4gICAgcm91dGVzOiBbJ2ZpZWxkLXJvdXRlcyddXG4gIH0sXG4gIGNvbXBpbGVyOiB7XG4gICAgY29tcGlsZXJzOiBbJ2NvbXBpbGVyLmNob2ljZXMnLCAnY29tcGlsZXIubG9va3VwJywgJ2NvbXBpbGVyLnR5cGVzJywgJ2NvbXBpbGVyLnByb3AtYWxpYXNlcyddXG4gIH0sXG4gIGNvbXBvbmVudDoge1xuICAgIHByb3BzOiBbJ2RlZmF1bHQtc3R5bGUnXVxuICB9XG59O1xuXG4vLyAjIyBGb3JtYXRpYyBmYWN0b3J5XG5cbi8vIENyZWF0ZSBhIG5ldyBmb3JtYXRpYyBpbnN0YW5jZS4gQSBmb3JtYXRpYyBpbnN0YW5jZSBpcyBhIGZ1bmN0aW9uIHRoYXQgY2FuXG4vLyBjcmVhdGUgZm9ybXMuIEl0IGFsc28gaGFzIGEgYC5jcmVhdGVgIG1ldGhvZCB0aGF0IGNhbiBjcmVhdGUgb3RoZXIgZm9ybWF0aWNcbi8vIGluc3RhbmNlcy5cbnZhciBjcmVhdGVGb3JtYXRpY0NvcmUgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgLy8gTWFrZSBhIGNvcHkgb2YgY29uZmlnIHNvIHdlIGNhbiBtb25rZXkgd2l0aCBpdC5cbiAgY29uZmlnID0gXy5leHRlbmQoe30sIGNvbmZpZyk7XG5cbiAgLy8gQWRkIGRlZmF1bHQgY29uZmlnIHNldHRpbmdzICh3aGVyZSBub3Qgb3ZlcnJpZGRlbikuXG4gIF8ua2V5cyhkZWZhdWx0UGx1Z2luQ29uZmlnKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICBjb25maWdba2V5XSA9IF8uZXh0ZW5kKHt9LCBkZWZhdWx0UGx1Z2luQ29uZmlnW2tleV0sIGNvbmZpZ1trZXldKTtcbiAgfSk7XG5cbiAgLy8gVGhlIGBmb3JtYXRpY2AgdmFyaWFibGUgd2lsbCBob2xkIHRoZSBmdW5jdGlvbiB0aGF0IGdldHMgcmV0dXJuZWQgZnJvbSB0aGVcbiAgLy8gZmFjdG9yeS5cbiAgdmFyIGZvcm1hdGljO1xuXG4gIC8vIEluc3RhbnRpYXRlZCBwbHVnaW5zIGFyZSBjYWNoZWQganVzdCBsaWtlIENvbW1vbkpTIG1vZHVsZXMuXG4gIHZhciBwbHVnaW5DYWNoZSA9IHt9O1xuXG4gIC8vICMjIFBsdWdpbiBwcm90b3R5cGVcblxuICAvLyBUaGUgUGx1Z2luIHByb3RvdHlwZSBleGlzdHMgaW5zaWRlIHRoZSBGb3JtYXRpYyBmYWN0b3J5IGZ1bmN0aW9uIGp1c3QgdG9cbiAgLy8gbWFrZSBpdCBlYXNpZXIgdG8gZ3JhYiB2YWx1ZXMgZnJvbSB0aGUgY2xvc3VyZS5cblxuICAvLyBQbHVnaW5zIGFyZSBzaW1pbGFyIHRvIENvbW1vbkpTIG1vZHVsZXMuIEZvcm1hdGljIHVzZXMgcGx1Z2lucyBhcyBhIHNsaWdodFxuICAvLyB2YXJpYW50IHRob3VnaCBiZWNhdXNlOlxuICAvLyAtIEZvcm1hdGljIHBsdWdpbnMgYXJlIGNvbmZpZ3VyYWJsZS5cbiAgLy8gLSBGb3JtYXRpYyBwbHVnaW5zIGFyZSBpbnN0YW50aWF0ZWQgcGVyIGZvcm1hdGljIGluc3RhbmNlLiBDb21tb25KUyBtb2R1bGVzXG4gIC8vICAgYXJlIGNyZWF0ZWQgb25jZSBhbmQgd291bGQgYmUgc2hhcmVkIGFjcm9zcyBhbGwgZm9ybWF0aWMgaW5zdGFuY2VzLlxuICAvLyAtIEZvcm1hdGljIHBsdWdpbnMgYXJlIGVhc2lseSBvdmVycmlkYWJsZSAoYWxzbyB2aWEgY29uZmlndXJhdGlvbikuXG5cbiAgLy8gV2hlbiBhIHBsdWdpbiBpcyBpbnN0YW50aWF0ZWQsIHdlIGNhbGwgdGhlIGBQbHVnaW5gIGNvbnN0cnVjdG9yLiBUaGUgcGx1Z2luXG4gIC8vIGluc3RhbmNlIGlzIHRoZW4gcGFzc2VkIHRvIHRoZSBwbHVnaW4ncyBpbml0aWFsaXphdGlvbiBmdW5jdGlvbi5cbiAgdmFyIFBsdWdpbiA9IGZ1bmN0aW9uIChuYW1lLCBjb25maWcpIHtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgUGx1Z2luKSkge1xuICAgICAgcmV0dXJuIG5ldyBQbHVnaW4obmFtZSwgY29uZmlnKTtcbiAgICB9XG4gICAgLy8gRXhwb3J0cyBhbmFsb2dvdXMgdG8gQ29tbW9uSlMgZXhwb3J0cy5cbiAgICB0aGlzLmV4cG9ydHMgPSB7fTtcbiAgICAvLyBDb25maWcgdmFsdWVzIHBhc3NlZCBpbiB2aWEgZmFjdG9yeSBhcmUgcm91dGVkIHRvIHRoZSBhcHByb3ByaWF0ZVxuICAgIC8vIHBsdWdpbiBhbmQgYXZhaWxhYmxlIHZpYSBgLmNvbmZpZ2AuXG4gICAgdGhpcy5jb25maWcgPSBjb25maWcgfHwge307XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgfTtcblxuICAvLyBHZXQgYSBjb25maWcgdmFsdWUgZm9yIGEgcGx1Z2luIG9yIHJldHVybiB0aGUgZGVmYXVsdCB2YWx1ZS5cbiAgUGx1Z2luLnByb3RvdHlwZS5jb25maWdWYWx1ZSA9IGZ1bmN0aW9uIChrZXksIGRlZmF1bHRWYWx1ZSkge1xuXG4gICAgaWYgKHR5cGVvZiB0aGlzLmNvbmZpZ1trZXldICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuIHRoaXMuY29uZmlnW2tleV07XG4gICAgfVxuICAgIHJldHVybiBkZWZhdWx0VmFsdWUgfHwgJyc7XG4gIH07XG5cbiAgLy8gUmVxdWlyZSBhbm90aGVyIHBsdWdpbiBieSBuYW1lLiBUaGlzIGlzIG11Y2ggbGlrZSBhIENvbW1vbkpTIHJlcXVpcmVcbiAgUGx1Z2luLnByb3RvdHlwZS5yZXF1aXJlID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICByZXR1cm4gZm9ybWF0aWMucGx1Z2luKG5hbWUpO1xuICB9O1xuXG4gIC8vIEhhbmRsZSBhIHNwZWNpYWwgcGx1Z2luLCB0aGUgYGNvbXBvbmVudGAgcGx1Z2luIHdoaWNoIGZpbmRzIGNvbXBvbmVudHMuXG4gIHZhciBjb21wb25lbnRQbHVnaW47XG5cbiAgLy8gSnVzdCBoZXJlIGluIGNhc2Ugd2Ugd2FudCB0byBkeW5hbWljYWxseSBjaG9vc2UgY29tcG9uZW50IGxhdGVyLlxuICBQbHVnaW4ucHJvdG90eXBlLmNvbXBvbmVudCA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgcmV0dXJuIGNvbXBvbmVudFBsdWdpbi5jb21wb25lbnQobmFtZSk7XG4gIH07XG5cbiAgLy8gQ2hlY2sgaWYgYSBwbHVnaW4gZXhpc3RzLlxuICBQbHVnaW4ucHJvdG90eXBlLmhhc1BsdWdpbiA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgcmV0dXJuIChuYW1lIGluIHBsdWdpbkNhY2hlKSB8fCAobmFtZSBpbiBwbHVnaW5SZWdpc3RyeSk7XG4gIH07XG5cbiAgLy8gQ2hlY2sgaWYgYSBjb21wb25lbnQgZXhpc3RzLiBDb21wb25lbnRzIGFyZSByZWFsbHkganVzdCBwbHVnaW5zIHdpdGhcbiAgLy8gYSBwYXJ0aWN1bGFyIHByZWZpeCB0byB0aGVpciBuYW1lcy5cbiAgUGx1Z2luLnByb3RvdHlwZS5oYXNDb21wb25lbnQgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHJldHVybiB0aGlzLmhhc1BsdWdpbignY29tcG9uZW50LicgKyBuYW1lKTtcbiAgfTtcblxuICAvLyBHaXZlbiBhIGxpc3Qgb2YgcGx1Z2luIG5hbWVzLCByZXF1aXJlIHRoZW0gYWxsIGFuZCByZXR1cm4gYSBsaXN0IG9mXG4gIC8vIGluc3RhbnRpYXRlZCBwbHVnaW5zLlxuICBQbHVnaW4ucHJvdG90eXBlLnJlcXVpcmVBbGwgPSBmdW5jdGlvbiAocGx1Z2luTGlzdCkge1xuICAgIGlmICghcGx1Z2luTGlzdCkge1xuICAgICAgcGx1Z2luTGlzdCA9IFtdO1xuICAgIH1cbiAgICBpZiAoIV8uaXNBcnJheShwbHVnaW5MaXN0KSkge1xuICAgICAgcGx1Z2luTGlzdCA9IFtwbHVnaW5MaXN0XTtcbiAgICB9XG4gICAgLy8gSW5mbGF0ZSByZWdpc3RlcmVkIGJ1bmRsZXMuIEEgYnVuZGxlIGlzIGp1c3QgYSBuYW1lIHRoYXQgcG9pbnRzIHRvIGFuXG4gICAgLy8gYXJyYXkgb2Ygb3RoZXIgcGx1Z2luIG5hbWVzLlxuICAgIHBsdWdpbkxpc3QgPSBwbHVnaW5MaXN0Lm1hcChmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgICBpZiAoXy5pc1N0cmluZyhwbHVnaW4pKSB7XG4gICAgICAgIGlmIChfLmlzQXJyYXkocGx1Z2luUmVnaXN0cnlbcGx1Z2luXSkpIHtcbiAgICAgICAgICByZXR1cm4gcGx1Z2luUmVnaXN0cnlbcGx1Z2luXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHBsdWdpbjtcbiAgICB9KTtcbiAgICAvLyBGbGF0dGVuIGFueSBidW5kbGVzLCBzbyB3ZSBlbmQgdXAgd2l0aCBhIGZsYXQgYXJyYXkgb2YgcGx1Z2luIG5hbWVzLlxuICAgIHBsdWdpbkxpc3QgPSBfLmZsYXR0ZW4ocGx1Z2luTGlzdCk7XG4gICAgcmV0dXJuIHBsdWdpbkxpc3QubWFwKGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICAgIHJldHVybiB0aGlzLnJlcXVpcmUocGx1Z2luKTtcbiAgICB9LmJpbmQodGhpcykpO1xuICB9O1xuXG4gIC8vIEdpdmVuIGEgcHJlZml4LCByZXR1cm4gYSBtYXAgb2YgYWxsIGluc3RhbnRpYXRlZCBwbHVnaW5zIHdpdGggdGhhdCBwcmVmaXguXG4gIFBsdWdpbi5wcm90b3R5cGUucmVxdWlyZUFsbE9mID0gZnVuY3Rpb24gKHByZWZpeCkge1xuICAgIHZhciBtYXAgPSB7fTtcblxuICAgIGlmIChwbHVnaW5Hcm91cHNbcHJlZml4XSkge1xuICAgICAgcGx1Z2luR3JvdXBzW3ByZWZpeF0uZm9yRWFjaChmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICBtYXBbbmFtZV0gPSB0aGlzLnJlcXVpcmUobmFtZSk7XG4gICAgICB9LmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIHJldHVybiBtYXA7XG4gIH07XG5cbiAgLy8gIyMgRm9ybWF0aWMgZmFjdG9yeSwgY29udGludWVkLi4uXG5cbiAgLy8gR3JhYiBhIHBsdWdpbiBmcm9tIHRoZSBjYWNoZSwgb3IgbG9hZCBpdCBmcmVzaCBmcm9tIHRoZSByZWdpc3RyeS5cbiAgdmFyIGxvYWRQbHVnaW4gPSBmdW5jdGlvbiAobmFtZSwgcGx1Z2luQ29uZmlnKSB7XG4gICAgdmFyIHBsdWdpbjtcblxuICAgIC8vIFdlIGNhbiBhbHNvIGxvYWQgYW5vbnltb3VzIHBsdWdpbnMuXG4gICAgaWYgKF8uaXNGdW5jdGlvbihuYW1lKSkge1xuXG4gICAgICB2YXIgZmFjdG9yeSA9IG5hbWU7XG5cbiAgICAgIGlmIChfLmlzVW5kZWZpbmVkKGZhY3RvcnkuX19leHBvcnRzX18pKSB7XG4gICAgICAgIHBsdWdpbklkKys7XG4gICAgICAgIHBsdWdpbiA9IFBsdWdpbignYW5vbnltb3VzX3BsdWdpbl8nICsgcGx1Z2luSWQsIHBsdWdpbkNvbmZpZyB8fCB7fSk7XG4gICAgICAgIGZhY3RvcnkocGx1Z2luKTtcbiAgICAgICAgLy8gU3RvcmUgdGhlIGV4cG9ydHMgb24gdGhlIGFub255bW91cyBmdW5jdGlvbiBzbyB3ZSBrbm93IGl0J3MgYWxyZWFkeVxuICAgICAgICAvLyBiZWVuIGluc3RhbnRpYXRlZCwgYW5kIHdlIGNhbiBqdXN0IGdyYWIgdGhlIGV4cG9ydHMuXG4gICAgICAgIGZhY3RvcnkuX19leHBvcnRzX18gPSBwbHVnaW4uZXhwb3J0cztcbiAgICAgIH1cblxuICAgICAgLy8gTG9hZCB0aGUgY2FjaGVkIGV4cG9ydHMuXG4gICAgICByZXR1cm4gZmFjdG9yeS5fX2V4cG9ydHNfXztcblxuICAgIH0gZWxzZSBpZiAoXy5pc1VuZGVmaW5lZChwbHVnaW5DYWNoZVtuYW1lXSkpIHtcblxuICAgICAgaWYgKCFwbHVnaW5Db25maWcgJiYgY29uZmlnW25hbWVdKSB7XG4gICAgICAgIGlmIChjb25maWdbbmFtZV0ucGx1Z2luKSB7XG4gICAgICAgICAgcmV0dXJuIGxvYWRQbHVnaW4oY29uZmlnW25hbWVdLnBsdWdpbiwgY29uZmlnW25hbWVdIHx8IHt9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAocGx1Z2luUmVnaXN0cnlbbmFtZV0pIHtcbiAgICAgICAgaWYgKF8uaXNGdW5jdGlvbihwbHVnaW5SZWdpc3RyeVtuYW1lXSkpIHtcbiAgICAgICAgICBwbHVnaW4gPSBQbHVnaW4obmFtZSwgcGx1Z2luQ29uZmlnIHx8IGNvbmZpZ1tuYW1lXSk7XG4gICAgICAgICAgcGx1Z2luUmVnaXN0cnlbbmFtZV0ocGx1Z2luKTtcbiAgICAgICAgICBwbHVnaW5DYWNoZVtuYW1lXSA9IHBsdWdpbi5leHBvcnRzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUGx1Z2luICcgKyBuYW1lICsgJyBpcyBub3QgYSBmdW5jdGlvbi4nKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQbHVnaW4gJyArIG5hbWUgKyAnIG5vdCBmb3VuZC4nKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHBsdWdpbkNhY2hlW25hbWVdO1xuICB9O1xuXG4gIC8vIEFzc2lnbiBgZm9ybWF0aWNgIHRvIGEgZnVuY3Rpb24gdGhhdCB0YWtlcyBmb3JtIG9wdGlvbnMgYW5kIHJldHVybnMgYSBmb3JtLlxuICBmb3JtYXRpYyA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgcmV0dXJuIGZvcm1hdGljLmZvcm0ob3B0aW9ucyk7XG4gIH07XG5cbiAgLy8gQWxsb3cgZ2xvYmFsIHBsdWdpbiByZWdpc3RyeSBmcm9tIHRoZSBmb3JtYXRpYyBmdW5jdGlvbiBpbnN0YW5jZS5cbiAgZm9ybWF0aWMucmVnaXN0ZXIgPSBmdW5jdGlvbiAobmFtZSwgcGx1Z2luSW5pdEZuKSB7XG4gICAgcmVnaXN0ZXJQbHVnaW4obmFtZSwgcGx1Z2luSW5pdEZuKTtcbiAgICByZXR1cm4gZm9ybWF0aWM7XG4gIH07XG5cbiAgLy8gQWxsb3cgcmV0cmlldmluZyBwbHVnaW5zIGZyb20gdGhlIGZvcm1hdGljIGZ1bmN0aW9uIGluc3RhbmNlLlxuICBmb3JtYXRpYy5wbHVnaW4gPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHJldHVybiBsb2FkUGx1Z2luKG5hbWUpO1xuICB9O1xuXG4gIC8vIEFsbG93IGNyZWF0aW5nIGEgbmV3IGZvcm1hdGljIGluc3RhbmNlIGZyb20gYSBmb3JtYXRpYyBpbnN0YW5jZS5cbiAgLy9mb3JtYXRpYy5jcmVhdGUgPSBGb3JtYXRpYztcblxuICAvLyBVc2UgdGhlIGNvcmUgcGx1Z2luIHRvIGFkZCBtZXRob2RzIHRvIHRoZSBmb3JtYXRpYyBpbnN0YW5jZS5cbiAgdmFyIGNvcmUgPSBsb2FkUGx1Z2luKCdjb3JlJyk7XG5cbiAgY29yZShmb3JtYXRpYyk7XG5cbiAgLy8gTm93IGJpbmQgdGhlIGNvbXBvbmVudCBwbHVnaW4uIFdlIHdhaXQgdGlsbCBub3csIHNvIHRoZSBjb3JlIGlzIGxvYWRlZFxuICAvLyBmaXJzdC5cbiAgY29tcG9uZW50UGx1Z2luID0gbG9hZFBsdWdpbignY29tcG9uZW50Jyk7XG5cbiAgLy8gUmV0dXJuIHRoZSBmb3JtYXRpYyBmdW5jdGlvbiBpbnN0YW5jZS5cbiAgcmV0dXJuIGZvcm1hdGljO1xufTtcblxuLy8gSnVzdCBhIGhlbHBlciB0byByZWdpc3RlciBhIGJ1bmNoIG9mIHBsdWdpbnMuXG52YXIgcmVnaXN0ZXJQbHVnaW5zID0gZnVuY3Rpb24gKCkge1xuICB2YXIgYXJnID0gXy50b0FycmF5KGFyZ3VtZW50cyk7XG4gIGFyZy5mb3JFYWNoKGZ1bmN0aW9uIChhcmcpIHtcbiAgICB2YXIgbmFtZSA9IGFyZ1swXTtcbiAgICB2YXIgcGx1Z2luID0gYXJnWzFdO1xuICAgIHJlZ2lzdGVyUGx1Z2luKG5hbWUsIHBsdWdpbik7XG4gIH0pO1xufTtcblxuLy8gUmVnaXN0ZXIgYWxsIHRoZSBidWlsdC1pbiBwbHVnaW5zLlxucmVnaXN0ZXJQbHVnaW5zKFxuICBbJ2NvcmUnLCByZXF1aXJlKCcuL2RlZmF1bHQvY29yZScpXSxcblxuICBbJ2NvcmUuZm9ybWF0aWMnLCByZXF1aXJlKCcuL2NvcmUvZm9ybWF0aWMnKV0sXG4gIFsnY29yZS5mb3JtLWluaXQnLCByZXF1aXJlKCcuL2NvcmUvZm9ybS1pbml0JyldLFxuICBbJ2NvcmUuZm9ybScsIHJlcXVpcmUoJy4vY29yZS9mb3JtJyldLFxuICBbJ2NvcmUuZmllbGQnLCByZXF1aXJlKCcuL2NvcmUvZmllbGQnKV0sXG5cbiAgWyd1dGlsJywgcmVxdWlyZSgnLi9kZWZhdWx0L3V0aWwnKV0sXG4gIFsnY29tcGlsZXInLCByZXF1aXJlKCcuL2RlZmF1bHQvY29tcGlsZXInKV0sXG4gIFsnZXZhbCcsIHJlcXVpcmUoJy4vZGVmYXVsdC9ldmFsJyldLFxuICBbJ2V2YWwtZnVuY3Rpb25zJywgcmVxdWlyZSgnLi9kZWZhdWx0L2V2YWwtZnVuY3Rpb25zJyldLFxuICBbJ2xvYWRlcicsIHJlcXVpcmUoJy4vZGVmYXVsdC9sb2FkZXInKV0sXG4gIFsnZmllbGQtcm91dGVyJywgcmVxdWlyZSgnLi9kZWZhdWx0L2ZpZWxkLXJvdXRlcicpXSxcbiAgWydmaWVsZC1yb3V0ZXMnLCByZXF1aXJlKCcuL2RlZmF1bHQvZmllbGQtcm91dGVzJyldLFxuXG4gIFsnY29tcGlsZXIuY2hvaWNlcycsIHJlcXVpcmUoJy4vY29tcGlsZXJzL2Nob2ljZXMnKV0sXG4gIFsnY29tcGlsZXIubG9va3VwJywgcmVxdWlyZSgnLi9jb21waWxlcnMvbG9va3VwJyldLFxuICBbJ2NvbXBpbGVyLnR5cGVzJywgcmVxdWlyZSgnLi9jb21waWxlcnMvdHlwZXMnKV0sXG4gIFsnY29tcGlsZXIucHJvcC1hbGlhc2VzJywgcmVxdWlyZSgnLi9jb21waWxlcnMvcHJvcC1hbGlhc2VzJyldLFxuXG4gIFsnc3RvcmUubWVtb3J5JywgcmVxdWlyZSgnLi9zdG9yZS9tZW1vcnknKV0sXG5cbiAgWyd0eXBlLnJvb3QnLCByZXF1aXJlKCcuL3R5cGVzL3Jvb3QnKV0sXG4gIFsndHlwZS5zdHJpbmcnLCByZXF1aXJlKCcuL3R5cGVzL3N0cmluZycpXSxcbiAgWyd0eXBlLm9iamVjdCcsIHJlcXVpcmUoJy4vdHlwZXMvb2JqZWN0JyldLFxuICBbJ3R5cGUuYm9vbGVhbicsIHJlcXVpcmUoJy4vdHlwZXMvYm9vbGVhbicpXSxcbiAgWyd0eXBlLmFycmF5JywgcmVxdWlyZSgnLi90eXBlcy9hcnJheScpXSxcbiAgWyd0eXBlLmpzb24nLCByZXF1aXJlKCcuL3R5cGVzL2pzb24nKV0sXG4gIFsndHlwZS5udW1iZXInLCByZXF1aXJlKCcuL3R5cGVzL251bWJlcicpXSxcblxuICBbJ2NvbXBvbmVudCcsIHJlcXVpcmUoJy4vZGVmYXVsdC9jb21wb25lbnQnKV0sXG5cbiAgWydjb21wb25lbnQuZm9ybWF0aWMnLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvZm9ybWF0aWMnKV0sXG4gIFsnY29tcG9uZW50LnJvb3QnLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvcm9vdCcpXSxcbiAgWydjb21wb25lbnQuZmllbGQnLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGQnKV0sXG4gIFsnY29tcG9uZW50LmxhYmVsJywgcmVxdWlyZSgnLi9jb21wb25lbnRzL2xhYmVsJyldLFxuICBbJ2NvbXBvbmVudC5oZWxwJywgcmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHAnKV0sXG4gIFsnY29tcG9uZW50LnNhbXBsZScsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9zYW1wbGUnKV0sXG4gIFsnY29tcG9uZW50LmZpZWxkc2V0JywgcmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkc2V0JyldLFxuICBbJ2NvbXBvbmVudC50ZXh0JywgcmVxdWlyZSgnLi9jb21wb25lbnRzL3RleHQnKV0sXG4gIFsnY29tcG9uZW50LnRleHRhcmVhJywgcmVxdWlyZSgnLi9jb21wb25lbnRzL3RleHRhcmVhJyldLFxuICBbJ2NvbXBvbmVudC5zZWxlY3QnLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvc2VsZWN0JyldLFxuICBbJ2NvbXBvbmVudC5saXN0JywgcmVxdWlyZSgnLi9jb21wb25lbnRzL2xpc3QnKV0sXG4gIFsnY29tcG9uZW50Lmxpc3QtY29udHJvbCcsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9saXN0LWNvbnRyb2wnKV0sXG4gIFsnY29tcG9uZW50Lmxpc3QtaXRlbScsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9saXN0LWl0ZW0nKV0sXG4gIFsnY29tcG9uZW50Lmxpc3QtaXRlbS12YWx1ZScsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9saXN0LWl0ZW0tdmFsdWUnKV0sXG4gIFsnY29tcG9uZW50Lmxpc3QtaXRlbS1jb250cm9sJywgcmVxdWlyZSgnLi9jb21wb25lbnRzL2xpc3QtaXRlbS1jb250cm9sJyldLFxuICBbJ2NvbXBvbmVudC5pdGVtLWNob2ljZXMnLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvaXRlbS1jaG9pY2VzJyldLFxuICBbJ2NvbXBvbmVudC5hZGQtaXRlbScsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9hZGQtaXRlbScpXSxcbiAgWydjb21wb25lbnQucmVtb3ZlLWl0ZW0nLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvcmVtb3ZlLWl0ZW0nKV0sXG4gIFsnY29tcG9uZW50Lm1vdmUtaXRlbS1iYWNrJywgcmVxdWlyZSgnLi9jb21wb25lbnRzL21vdmUtaXRlbS1iYWNrJyldLFxuICBbJ2NvbXBvbmVudC5tb3ZlLWl0ZW0tZm9yd2FyZCcsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9tb3ZlLWl0ZW0tZm9yd2FyZCcpXSxcbiAgWydjb21wb25lbnQuanNvbicsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9qc29uJyldLFxuICBbJ2NvbXBvbmVudC5jaGVja2JveC1saXN0JywgcmVxdWlyZSgnLi9jb21wb25lbnRzL2NoZWNrYm94LWxpc3QnKV0sXG4gIFsnY29tcG9uZW50LnByZXR0eS10ZXh0YXJlYScsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9wcmV0dHktdGV4dGFyZWEnKV0sXG4gIFsnY29tcG9uZW50LmNob2ljZXMnLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvY2hvaWNlcycpXSxcblxuICBbJ21peGluLmNsaWNrLW91dHNpZGUnLCByZXF1aXJlKCcuL21peGlucy9jbGljay1vdXRzaWRlJyldLFxuICBbJ21peGluLmZpZWxkJywgcmVxdWlyZSgnLi9taXhpbnMvZmllbGQnKV0sXG4gIFsnbWl4aW4uaW5wdXQtYWN0aW9ucycsIHJlcXVpcmUoJy4vbWl4aW5zL2lucHV0LWFjdGlvbnMnKV0sXG4gIFsnbWl4aW4ucmVzaXplJywgcmVxdWlyZSgnLi9taXhpbnMvcmVzaXplJyldLFxuICBbJ21peGluLnNjcm9sbCcsIHJlcXVpcmUoJy4vbWl4aW5zL3Njcm9sbCcpXSxcbiAgWydtaXhpbi51bmRvLXN0YWNrJywgcmVxdWlyZSgnLi9taXhpbnMvdW5kby1zdGFjaycpXSxcblxuICBbJ2Jvb3RzdHJhcC1zdHlsZScsIHJlcXVpcmUoJy4vcGx1Z2lucy9ib290c3RyYXAtc3R5bGUnKV0sXG4gIFsnZGVmYXVsdC1zdHlsZScsIHJlcXVpcmUoJy4vcGx1Z2lucy9kZWZhdWx0LXN0eWxlJyldXG4pO1xuXG4vLyBDcmVhdGUgdGhlIGRlZmF1bHQgZm9ybWF0aWMgaW5zdGFuY2UuXG4vL3ZhciBkZWZhdWx0Q29yZSA9IEZvcm1hdGljKCk7XG5cbi8vIEV4cG9ydCBpdCFcbi8vbW9kdWxlLmV4cG9ydHMgPSBkZWZhdWx0Rm9ybWF0aWM7XG5cbnZhciBjcmVhdGVGb3JtYXRpY0NvbXBvbmVudENsYXNzID0gZnVuY3Rpb24gKGNvbmZpZykge1xuXG4gIHZhciBjb3JlID0gY3JlYXRlRm9ybWF0aWNDb3JlKGNvbmZpZyk7XG5cbiAgcmV0dXJuIFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGRpc3BsYXlOYW1lOiAnRm9ybWF0aWMnLFxuXG4gICAgc3RhdGljczoge1xuICAgICAgY29uZmlnOiBjcmVhdGVGb3JtYXRpY0NvbXBvbmVudENsYXNzLFxuICAgICAgZm9ybTogY29yZSxcbiAgICAgIHBsdWdpbjogY29yZS5wbHVnaW5cbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZm9ybSA9IHRoaXMucHJvcHMuZm9ybSB8fCB0aGlzLnByb3BzLmRlZmF1bHRGb3JtO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZm9ybTogZm9ybSxcbiAgICAgICAgZmllbGQ6IGZvcm0uZmllbGQoKSxcbiAgICAgICAgY29udHJvbGxlZDogdGhpcy5wcm9wcy5mb3JtID8gdHJ1ZSA6IGZhbHNlXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZm9ybSA9IHRoaXMuc3RhdGUuZm9ybTtcbiAgICAgIGlmICghZm9ybSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ011c3Qgc3VwcGx5IGEgZm9ybSBvciBkZWZhdWx0Rm9ybS4nKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnN0YXRlLmNvbnRyb2xsZWQpIHtcbiAgICAgICAgZm9ybS5vbmNlKCdjaGFuZ2UnLCB0aGlzLm9uRm9ybUNoYW5nZWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9ybS5vbignY2hhbmdlJywgdGhpcy5vbkZvcm1DaGFuZ2VkKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgb25Gb3JtQ2hhbmdlZDogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMucHJvcHMub25DaGFuZ2UpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZSh0aGlzLnByb3BzLmZvcm0udmFsKCkpO1xuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLnN0YXRlLmNvbnRyb2xsZWQpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgZmllbGQ6IHRoaXMuc3RhdGUuZm9ybS5maWVsZCgpXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGZvcm0gPSB0aGlzLnN0YXRlLmZvcm07XG4gICAgICBpZiAoZm9ybSkge1xuICAgICAgICBmb3JtLm9mZignY2hhbmdlJywgdGhpcy5vbkZvcm1DaGFuZ2VkKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gKG5leHRQcm9wcykge1xuICAgICAgaWYgKHRoaXMuc3RhdGUuY29udHJvbGxlZCkge1xuICAgICAgICBpZiAoIW5leHRQcm9wcy5mb3JtKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNdXN0IHN1cHBseSBhIG5ldyBmb3JtIGZvciBhIGNvbnRyb2xsZWQgY29tcG9uZW50LicpO1xuICAgICAgICB9XG4gICAgICAgIG5leHRQcm9wcy5mb3JtLm9uY2UoJ2NoYW5nZScsIHRoaXMub25Gb3JtQ2hhbmdlZCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIGZvcm06IG5leHRQcm9wcy5mb3JtLFxuICAgICAgICAgIGZpZWxkOiBuZXh0UHJvcHMuZm9ybS5maWVsZCgpXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiAnZm9ybWF0aWMnfSxcbiAgICAgICAgdGhpcy5zdGF0ZS5maWVsZC5jb21wb25lbnQoKVxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVGb3JtYXRpY0NvbXBvbmVudENsYXNzKCk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgbWl4aW4uY2xpY2stb3V0c2lkZVxuXG4vKlxuVGhlcmUncyBubyBuYXRpdmUgUmVhY3Qgd2F5IHRvIGRldGVjdCBjbGlja2luZyBvdXRzaWRlIGFuIGVsZW1lbnQuIFNvbWV0aW1lc1xudGhpcyBpcyB1c2VmdWwsIHNvIHRoYXQncyB3aGF0IHRoaXMgbWl4aW4gZG9lcy4gVG8gdXNlIGl0LCBtaXggaXQgaW4gYW5kIHVzZSBpdFxuZnJvbSB5b3VyIGNvbXBvbmVudCBsaWtlIHRoaXM6XG5cbmBgYGpzXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBtaXhpbnM6IFtwbHVnaW4ucmVxdWlyZSgnbWl4aW4uY2xpY2stb3V0c2lkZScpXSxcblxuICAgIG9uQ2xpY2tPdXRzaWRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zb2xlLmxvZygnY2xpY2tlZCBvdXRzaWRlIScpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zZXRPbkNsaWNrT3V0c2lkZSgnbXlEaXYnLCB0aGlzLm9uQ2xpY2tPdXRzaWRlKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gUmVhY3QuRE9NLmRpdih7cmVmOiAnbXlEaXYnfSxcbiAgICAgICAgJ0hlbGxvISdcbiAgICAgIClcbiAgICB9XG4gIH0pO1xufTtcbmBgYFxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxudmFyIGhhc0FuY2VzdG9yID0gZnVuY3Rpb24gKGNoaWxkLCBwYXJlbnQpIHtcbiAgaWYgKGNoaWxkLnBhcmVudE5vZGUgPT09IHBhcmVudCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmIChjaGlsZC5wYXJlbnROb2RlID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiBoYXNBbmNlc3RvcihjaGlsZC5wYXJlbnROb2RlLCBwYXJlbnQpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSB7XG5cbiAgICAvLyBfb25DbGlja0RvY3VtZW50OiBmdW5jdGlvbihldmVudCkge1xuICAgIC8vICAgY29uc29sZS5sb2coJ2NsaWNrIGRvYycpXG4gICAgLy8gICBpZiAodGhpcy5fZGlkTW91c2VEb3duKSB7XG4gICAgLy8gICAgIF8uZWFjaCh0aGlzLmNsaWNrT3V0c2lkZUhhbmRsZXJzLCBmdW5jdGlvbiAoZnVuY3MsIHJlZikge1xuICAgIC8vICAgICAgIGlmIChpc091dHNpZGUoZXZlbnQudGFyZ2V0LCB0aGlzLnJlZnNbcmVmXS5nZXRET01Ob2RlKCkpKSB7XG4gICAgLy8gICAgICAgICBmdW5jcy5mb3JFYWNoKGZ1bmN0aW9uIChmbikge1xuICAgIC8vICAgICAgICAgICBmbi5jYWxsKHRoaXMpO1xuICAgIC8vICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAvLyAgICAgICB9XG4gICAgLy8gICAgIH0uYmluZCh0aGlzKSk7XG4gICAgLy8gICB9XG4gICAgLy8gfSxcblxuICAgIGlzTm9kZU91dHNpZGU6IGZ1bmN0aW9uIChub2RlT3V0LCBub2RlSW4pIHtcbiAgICAgIGlmIChub2RlT3V0ID09PSBub2RlSW4pIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKGhhc0FuY2VzdG9yKG5vZGVPdXQsIG5vZGVJbikpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcblxuICAgIGlzTm9kZUluc2lkZTogZnVuY3Rpb24gKG5vZGVJbiwgbm9kZU91dCkge1xuICAgICAgcmV0dXJuICF0aGlzLmlzTm9kZU91dHNpZGUobm9kZUluLCBub2RlT3V0KTtcbiAgICB9LFxuXG4gICAgX29uQ2xpY2tNb3VzZWRvd246IGZ1bmN0aW9uKCkge1xuICAgICAgLy90aGlzLl9kaWRNb3VzZURvd24gPSB0cnVlO1xuICAgICAgXy5lYWNoKHRoaXMuY2xpY2tPdXRzaWRlSGFuZGxlcnMsIGZ1bmN0aW9uIChmdW5jcywgcmVmKSB7XG4gICAgICAgIGlmICh0aGlzLnJlZnNbcmVmXSkge1xuICAgICAgICAgIHRoaXMuX21vdXNlZG93blJlZnNbcmVmXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSxcblxuICAgIF9vbkNsaWNrTW91c2V1cDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICBfLmVhY2godGhpcy5jbGlja091dHNpZGVIYW5kbGVycywgZnVuY3Rpb24gKGZ1bmNzLCByZWYpIHtcbiAgICAgICAgaWYgKHRoaXMucmVmc1tyZWZdICYmIHRoaXMuX21vdXNlZG93blJlZnNbcmVmXSkge1xuICAgICAgICAgIGlmICh0aGlzLmlzTm9kZU91dHNpZGUoZXZlbnQudGFyZ2V0LCB0aGlzLnJlZnNbcmVmXS5nZXRET01Ob2RlKCkpKSB7XG4gICAgICAgICAgICBmdW5jcy5mb3JFYWNoKGZ1bmN0aW9uIChmbikge1xuICAgICAgICAgICAgICBmbi5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuX21vdXNlZG93blJlZnNbcmVmXSA9IGZhbHNlO1xuICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLy8gX29uQ2xpY2tEb2N1bWVudDogZnVuY3Rpb24gKCkge1xuICAgIC8vICAgY29uc29sZS5sb2coJ2NsaWNrZXR5JylcbiAgICAvLyAgIF8uZWFjaCh0aGlzLmNsaWNrT3V0c2lkZUhhbmRsZXJzLCBmdW5jdGlvbiAoZnVuY3MsIHJlZikge1xuICAgIC8vICAgICBjb25zb2xlLmxvZygnY2xpY2tldHknLCByZWYsIHRoaXMucmVmc1tyZWZdKVxuICAgIC8vICAgfS5iaW5kKHRoaXMpKTtcbiAgICAvLyB9LFxuXG4gICAgc2V0T25DbGlja091dHNpZGU6IGZ1bmN0aW9uIChyZWYsIGZuKSB7XG4gICAgICBpZiAoIXRoaXMuY2xpY2tPdXRzaWRlSGFuZGxlcnNbcmVmXSkge1xuICAgICAgICB0aGlzLmNsaWNrT3V0c2lkZUhhbmRsZXJzW3JlZl0gPSBbXTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY2xpY2tPdXRzaWRlSGFuZGxlcnNbcmVmXS5wdXNoKGZuKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuY2xpY2tPdXRzaWRlSGFuZGxlcnMgPSB7fTtcbiAgICAgIHRoaXMuX2RpZE1vdXNlRG93biA9IGZhbHNlO1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5fb25DbGlja01vdXNlZG93bik7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5fb25DbGlja01vdXNldXApO1xuICAgICAgLy9kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uQ2xpY2tEb2N1bWVudCk7XG4gICAgICB0aGlzLl9tb3VzZWRvd25SZWZzID0ge307XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmNsaWNrT3V0c2lkZUhhbmRsZXJzID0ge307XG4gICAgICAvL2RvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fb25DbGlja0RvY3VtZW50KTtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9vbkNsaWNrTW91c2V1cCk7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9vbkNsaWNrTW91c2Vkb3duKTtcbiAgICB9XG4gIH07XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIG1peGluLmZpZWxkXG5cbi8qXG5XcmFwIHVwIHlvdXIgZmllbGRzIHdpdGggdGhpcyBtaXhpbiB0byBnZXQ6XG4tIEF1dG9tYXRpYyBtZXRhZGF0YSBsb2FkaW5nLlxuLSBBbnl0aGluZyBlbHNlIGRlY2lkZWQgbGF0ZXIuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IHtcblxuICAgIGxvYWROZWVkZWRNZXRhOiBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgIGlmIChwcm9wcy5maWVsZCAmJiBwcm9wcy5maWVsZC5mb3JtKSB7XG4gICAgICAgIGlmIChwcm9wcy5maWVsZC5kZWYubmVlZHNNZXRhICYmIHByb3BzLmZpZWxkLmRlZi5uZWVkc01ldGEubGVuZ3RoID4gMCkge1xuXG4gICAgICAgICAgdmFyIG5lZWRzTWV0YSA9IFtdO1xuXG4gICAgICAgICAgcHJvcHMuZmllbGQuZGVmLm5lZWRzTWV0YS5mb3JFYWNoKGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICAgICAgICBpZiAoXy5pc0FycmF5KGFyZ3MpICYmIGFyZ3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICBpZiAoXy5pc0FycmF5KGFyZ3NbMF0pKSB7XG4gICAgICAgICAgICAgICAgYXJncy5mb3JFYWNoKGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICAgICAgICAgICAgICBuZWVkc01ldGEucHVzaChhcmdzKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZWVkc01ldGEucHVzaChhcmdzKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgaWYgKG5lZWRzTWV0YS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIC8vIE11c3QganVzdCBiZSBhIHNpbmdsZSBuZWVkLCBhbmQgbm90IGFuIGFycmF5LlxuICAgICAgICAgICAgbmVlZHNNZXRhID0gW3Byb3BzLmZpZWxkLmRlZi5uZWVkc01ldGFdO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIG5lZWRzTWV0YS5mb3JFYWNoKGZ1bmN0aW9uIChuZWVkcykge1xuICAgICAgICAgICAgaWYgKG5lZWRzKSB7XG4gICAgICAgICAgICAgIHByb3BzLmZpZWxkLmZvcm0ubG9hZE1ldGEuYXBwbHkocHJvcHMuZmllbGQuZm9ybSwgbmVlZHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmxvYWROZWVkZWRNZXRhKHRoaXMucHJvcHMpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV4dFByb3BzKSB7XG4gICAgICB0aGlzLmxvYWROZWVkZWRNZXRhKG5leHRQcm9wcyk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAvLyBSZW1vdmluZyB0aGlzIGFzIGl0J3MgYSBiYWQgaWRlYSwgYmVjYXVzZSB1bm1vdW50aW5nIGEgY29tcG9uZW50IGlzIG5vdFxuICAgICAgLy8gYWx3YXlzIGEgc2lnbmFsIHRvIHJlbW92ZSB0aGUgZmllbGQuIFdpbGwgaGF2ZSB0byBmaW5kIGEgYmV0dGVyIHdheS5cblxuICAgICAgLy8gaWYgKHRoaXMucHJvcHMuZmllbGQpIHtcbiAgICAgIC8vICAgdGhpcy5wcm9wcy5maWVsZC5lcmFzZSgpO1xuICAgICAgLy8gfVxuICAgIH1cbiAgfTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIi8vICMgbWl4aW4uaW5wdXQtYWN0aW9uc1xuXG4vKlxuQ3VycmVudGx5IHVudXNlZC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSB7XG5cbiAgICBvbkZvY3VzOiBmdW5jdGlvbiAoKSB7XG5cbiAgICB9LFxuXG4gICAgb25CbHVyOiBmdW5jdGlvbiAoKSB7XG5cbiAgICB9LFxuXG4gICAgb25DaGFuZ2U6IGZ1bmN0aW9uICgpIHtcblxuICAgIH1cbiAgfTtcbn07XG4iLCIvLyAjIG1peGluLnJlc2l6ZVxuXG4vKlxuWW91J2QgdGhpbmsgaXQgd291bGQgYmUgcHJldHR5IGVhc3kgdG8gZGV0ZWN0IHdoZW4gYSBET00gZWxlbWVudCBpcyByZXNpemVkLlxuQW5kIHlvdSdkIGJlIHdyb25nLiBUaGVyZSBhcmUgdmFyaW91cyB0cmlja3MsIGJ1dCBub25lIG9mIHRoZW0gd29yayB2ZXJ5IHdlbGwuXG5TbywgdXNpbmcgZ29vZCBvbCcgcG9sbGluZyBoZXJlLiBUbyB0cnkgdG8gYmUgYXMgZWZmaWNpZW50IGFzIHBvc3NpYmxlLCB0aGVyZVxuaXMgb25seSBhIHNpbmdsZSBzZXRJbnRlcnZhbCB1c2VkIGZvciBhbGwgZWxlbWVudHMuIFRvIHVzZTpcblxuYGBganNcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIG1peGluczogW3BsdWdpbi5yZXF1aXJlKCdtaXhpbi5yZXNpemUnKV0sXG5cbiAgICBvblJlc2l6ZTogZnVuY3Rpb24gKCkge1xuICAgICAgY29uc29sZS5sb2coJ3Jlc2l6ZWQhJyk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNldE9uUmVzaXplKCdteVRleHQnLCB0aGlzLm9uUmVzaXplKTtcbiAgICB9LFxuXG4gICAgb25DaGFuZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgIC4uLlxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBSZWFjdC5ET00udGV4dGFyZWEoe3JlZjogJ215VGV4dCcsIHZhbHVlOiB0aGlzLnByb3BzLnZhbHVlLCBvbkNoYW5nZTogLi4ufSlcbiAgICB9XG4gIH0pO1xufTtcbmBgYFxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgaWQgPSAwO1xuXG52YXIgcmVzaXplSW50ZXJ2YWxFbGVtZW50cyA9IHt9O1xudmFyIHJlc2l6ZUludGVydmFsRWxlbWVudHNDb3VudCA9IDA7XG52YXIgcmVzaXplSW50ZXJ2YWxUaW1lciA9IG51bGw7XG5cbnZhciBjaGVja0VsZW1lbnRzID0gZnVuY3Rpb24gKCkge1xuICBPYmplY3Qua2V5cyhyZXNpemVJbnRlcnZhbEVsZW1lbnRzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICB2YXIgZWxlbWVudCA9IHJlc2l6ZUludGVydmFsRWxlbWVudHNba2V5XTtcbiAgICBpZiAoZWxlbWVudC5jbGllbnRXaWR0aCAhPT0gZWxlbWVudC5fX3ByZXZDbGllbnRXaWR0aCB8fCBlbGVtZW50LmNsaWVudEhlaWdodCAhPT0gZWxlbWVudC5fX3ByZXZDbGllbnRIZWlnaHQpIHtcbiAgICAgIGVsZW1lbnQuX19wcmV2Q2xpZW50V2lkdGggPSBlbGVtZW50LmNsaWVudFdpZHRoO1xuICAgICAgZWxlbWVudC5fX3ByZXZDbGllbnRIZWlnaHQgPSBlbGVtZW50LmNsaWVudEhlaWdodDtcbiAgICAgIHZhciBoYW5kbGVycyA9IGVsZW1lbnQuX19yZXNpemVIYW5kbGVycztcbiAgICAgIGhhbmRsZXJzLmZvckVhY2goZnVuY3Rpb24gKGhhbmRsZXIpIHtcbiAgICAgICAgaGFuZGxlcigpO1xuICAgICAgfSk7XG4gICAgfVxuICB9LCAxMDApO1xufTtcblxudmFyIGFkZFJlc2l6ZUludGVydmFsSGFuZGxlciA9IGZ1bmN0aW9uIChlbGVtZW50LCBmbikge1xuICBpZiAocmVzaXplSW50ZXJ2YWxUaW1lciA9PT0gbnVsbCkge1xuICAgIHJlc2l6ZUludGVydmFsVGltZXIgPSBzZXRJbnRlcnZhbChjaGVja0VsZW1lbnRzLCAxMDApO1xuICB9XG4gIGlmICghKCdfX3Jlc2l6ZUlkJyBpbiBlbGVtZW50KSkge1xuICAgIGlkKys7XG4gICAgZWxlbWVudC5fX3ByZXZDbGllbnRXaWR0aCA9IGVsZW1lbnQuY2xpZW50V2lkdGg7XG4gICAgZWxlbWVudC5fX3ByZXZDbGllbnRIZWlnaHQgPSBlbGVtZW50LmNsaWVudEhlaWdodDtcbiAgICBlbGVtZW50Ll9fcmVzaXplSWQgPSBpZDtcbiAgICByZXNpemVJbnRlcnZhbEVsZW1lbnRzQ291bnQrKztcbiAgICByZXNpemVJbnRlcnZhbEVsZW1lbnRzW2lkXSA9IGVsZW1lbnQ7XG4gICAgZWxlbWVudC5fX3Jlc2l6ZUhhbmRsZXJzID0gW107XG4gIH1cbiAgZWxlbWVudC5fX3Jlc2l6ZUhhbmRsZXJzLnB1c2goZm4pO1xufTtcblxudmFyIHJlbW92ZVJlc2l6ZUludGVydmFsSGFuZGxlcnMgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICBpZiAoISgnX19yZXNpemVJZCcgaW4gZWxlbWVudCkpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIGlkID0gZWxlbWVudC5fX3Jlc2l6ZUlkO1xuICBkZWxldGUgZWxlbWVudC5fX3Jlc2l6ZUlkO1xuICBkZWxldGUgZWxlbWVudC5fX3Jlc2l6ZUhhbmRsZXJzO1xuICBkZWxldGUgcmVzaXplSW50ZXJ2YWxFbGVtZW50c1tpZF07XG4gIHJlc2l6ZUludGVydmFsRWxlbWVudHNDb3VudC0tO1xuICBpZiAocmVzaXplSW50ZXJ2YWxFbGVtZW50c0NvdW50IDwgMSkge1xuICAgIGNsZWFySW50ZXJ2YWwocmVzaXplSW50ZXJ2YWxUaW1lcik7XG4gICAgcmVzaXplSW50ZXJ2YWxUaW1lciA9IG51bGw7XG4gIH1cbn07XG5cbnZhciBvblJlc2l6ZSA9IGZ1bmN0aW9uIChyZWYsIGZuKSB7XG4gIGZuKHJlZik7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IHtcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5vblJlc2l6ZVdpbmRvdykge1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5vblJlc2l6ZVdpbmRvdyk7XG4gICAgICB9XG4gICAgICB0aGlzLnJlc2l6ZUVsZW1lbnRSZWZzID0ge307XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5vblJlc2l6ZVdpbmRvdykge1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5vblJlc2l6ZVdpbmRvdyk7XG4gICAgICB9XG4gICAgICBPYmplY3Qua2V5cyh0aGlzLnJlc2l6ZUVsZW1lbnRSZWZzKS5mb3JFYWNoKGZ1bmN0aW9uIChyZWYpIHtcbiAgICAgICAgcmVtb3ZlUmVzaXplSW50ZXJ2YWxIYW5kbGVycyh0aGlzLnJlZnNbcmVmXS5nZXRET01Ob2RlKCkpO1xuICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuXG4gICAgc2V0T25SZXNpemU6IGZ1bmN0aW9uIChyZWYsIGZuKSB7XG4gICAgICBpZiAoIXRoaXMucmVzaXplRWxlbWVudFJlZnNbcmVmXSkge1xuICAgICAgICB0aGlzLnJlc2l6ZUVsZW1lbnRSZWZzW3JlZl0gPSB0cnVlO1xuICAgICAgfVxuICAgICAgYWRkUmVzaXplSW50ZXJ2YWxIYW5kbGVyKHRoaXMucmVmc1tyZWZdLmdldERPTU5vZGUoKSwgb25SZXNpemUuYmluZCh0aGlzLCByZWYsIGZuKSk7XG4gICAgfVxuICB9O1xufTtcbiIsIi8vICMgbWl4aW4uc2Nyb2xsXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSB7XG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMub25TY3JvbGxXaW5kb3cpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHRoaXMub25TY3JvbGxXaW5kb3cpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMub25TY3JvbGxXaW5kb3cpIHtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHRoaXMub25TY3JvbGxXaW5kb3cpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn07XG4iLCIvLyAjIG1peGluLnVuZG8tc3RhY2tcblxuLypcbkdpdmVzIHlvdXIgY29tcG9uZW50IGFuIHVuZG8gc3RhY2suXG4qL1xuXG4vLyBodHRwOi8vcHJvbWV0aGV1c3Jlc2VhcmNoLmdpdGh1Yi5pby9yZWFjdC1mb3Jtcy9leGFtcGxlcy91bmRvLmh0bWxcblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgVW5kb1N0YWNrID0ge1xuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7dW5kbzogW10sIHJlZG86IFtdfTtcbiAgfSxcblxuICBzbmFwc2hvdDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHVuZG8gPSB0aGlzLnN0YXRlLnVuZG8uY29uY2F0KHRoaXMuZ2V0U3RhdGVTbmFwc2hvdCgpKTtcbiAgICBpZiAodHlwZW9mIHRoaXMuc3RhdGUudW5kb0RlcHRoID09PSAnbnVtYmVyJykge1xuICAgICAgaWYgKHVuZG8ubGVuZ3RoID4gdGhpcy5zdGF0ZS51bmRvRGVwdGgpIHtcbiAgICAgICAgdW5kby5zaGlmdCgpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnNldFN0YXRlKHt1bmRvOiB1bmRvLCByZWRvOiBbXX0pO1xuICB9LFxuXG4gIGhhc1VuZG86IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnVuZG8ubGVuZ3RoID4gMDtcbiAgfSxcblxuICBoYXNSZWRvOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5yZWRvLmxlbmd0aCA+IDA7XG4gIH0sXG5cbiAgcmVkbzogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fdW5kb0ltcGwodHJ1ZSk7XG4gIH0sXG5cbiAgdW5kbzogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fdW5kb0ltcGwoKTtcbiAgfSxcblxuICBfdW5kb0ltcGw6IGZ1bmN0aW9uKGlzUmVkbykge1xuICAgIHZhciB1bmRvID0gdGhpcy5zdGF0ZS51bmRvLnNsaWNlKDApO1xuICAgIHZhciByZWRvID0gdGhpcy5zdGF0ZS5yZWRvLnNsaWNlKDApO1xuICAgIHZhciBzbmFwc2hvdDtcblxuICAgIGlmIChpc1JlZG8pIHtcbiAgICAgIGlmIChyZWRvLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBzbmFwc2hvdCA9IHJlZG8ucG9wKCk7XG4gICAgICB1bmRvLnB1c2godGhpcy5nZXRTdGF0ZVNuYXBzaG90KCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodW5kby5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgc25hcHNob3QgPSB1bmRvLnBvcCgpO1xuICAgICAgcmVkby5wdXNoKHRoaXMuZ2V0U3RhdGVTbmFwc2hvdCgpKTtcbiAgICB9XG5cbiAgICB0aGlzLnNldFN0YXRlU25hcHNob3Qoc25hcHNob3QpO1xuICAgIHRoaXMuc2V0U3RhdGUoe3VuZG86dW5kbywgcmVkbzpyZWRvfSk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuICBwbHVnaW4uZXhwb3J0cyA9IFVuZG9TdGFjaztcbn07XG4iLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGJvb3RzdHJhcFxuXG4vKlxuVGhlIGJvb3RzdHJhcCBwbHVnaW4gYnVuZGxlIGV4cG9ydHMgYSBidW5jaCBvZiBcInByb3AgbW9kaWZpZXJcIiBwbHVnaW5zIHdoaWNoXG5tYW5pcHVsYXRlIHRoZSBwcm9wcyBnb2luZyBpbnRvIG1hbnkgb2YgdGhlIGNvbXBvbmVudHMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG52YXIgbW9kaWZpZXJzID0ge1xuXG4gICdmaWVsZCc6IHtjbGFzc05hbWU6ICdmb3JtLWdyb3VwJ30sXG4gICdoZWxwJzoge2NsYXNzTmFtZTogJ2hlbHAtYmxvY2snfSxcbiAgJ3NhbXBsZSc6IHtjbGFzc05hbWU6ICdoZWxwLWJsb2NrJ30sXG4gICd0ZXh0Jzoge2NsYXNzTmFtZTogJ2Zvcm0tY29udHJvbCd9LFxuICAndGV4dGFyZWEnOiB7Y2xhc3NOYW1lOiAnZm9ybS1jb250cm9sJ30sXG4gICdwcmV0dHktdGV4dGFyZWEnOiB7Y2xhc3NOYW1lOiAnZm9ybS1jb250cm9sJ30sXG4gICdqc29uJzoge2NsYXNzTmFtZTogJ2Zvcm0tY29udHJvbCd9LFxuICAnc2VsZWN0Jzoge2NsYXNzTmFtZTogJ2Zvcm0tY29udHJvbCd9LFxuICAvLydsaXN0Jzoge2NsYXNzTmFtZTogJ3dlbGwnfSxcbiAgJ2xpc3QtY29udHJvbCc6IHtjbGFzc05hbWU6ICdmb3JtLWlubGluZSd9LFxuICAnbGlzdC1pdGVtJzoge2NsYXNzTmFtZTogJ3dlbGwnfSxcbiAgJ2l0ZW0tY2hvaWNlcyc6IHtjbGFzc05hbWU6ICdmb3JtLWNvbnRyb2wnfSxcbiAgJ2FkZC1pdGVtJzoge2NsYXNzTmFtZTogJ2dseXBoaWNvbiBnbHlwaGljb24tcGx1cycsIGxhYmVsOiAnJ30sXG4gICdyZW1vdmUtaXRlbSc6IHtjbGFzc05hbWU6ICdnbHlwaGljb24gZ2x5cGhpY29uLXJlbW92ZScsIGxhYmVsOiAnJ30sXG4gICdtb3ZlLWl0ZW0tYmFjayc6IHtjbGFzc05hbWU6ICdnbHlwaGljb24gZ2x5cGhpY29uLWFycm93LXVwJywgbGFiZWw6ICcnfSxcbiAgJ21vdmUtaXRlbS1mb3J3YXJkJzoge2NsYXNzTmFtZTogJ2dseXBoaWNvbiBnbHlwaGljb24tYXJyb3ctZG93bicsIGxhYmVsOiAnJ31cbn07XG5cbi8vIEJ1aWxkIHRoZSBwbHVnaW4gYnVuZGxlLlxuXy5lYWNoKG1vZGlmaWVycywgZnVuY3Rpb24gKG1vZGlmaWVyLCBuYW1lKSB7XG5cbiAgZXhwb3J0c1snY29tcG9uZW50LXByb3BzLicgKyBuYW1lICsgJy5ib290c3RyYXAnXSA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICAgIHZhciB1dGlsID0gcGx1Z2luLnJlcXVpcmUoJ3V0aWwnKTtcblxuICAgIHBsdWdpbi5leHBvcnRzID0gW1xuICAgICAgbmFtZSxcbiAgICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQobW9kaWZpZXIuY2xhc3NOYW1lKSkge1xuICAgICAgICAgIHByb3BzLmNsYXNzTmFtZSA9IHV0aWwuY2xhc3NOYW1lKHByb3BzLmNsYXNzTmFtZSwgbW9kaWZpZXIuY2xhc3NOYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQobW9kaWZpZXIubGFiZWwpKSB7XG4gICAgICAgICAgcHJvcHMubGFiZWwgPSBtb2RpZmllci5sYWJlbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIF07XG4gIH07XG5cbn0pO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGRlZmF1bHQtc3R5bGVcblxuLypcblRoZSBkZWZhdWx0LXN0eWxlIHBsdWdpbiBidW5kbGUgZXhwb3J0cyBhIGJ1bmNoIG9mIFwicHJvcCBtb2RpZmllclwiIHBsdWdpbnMgd2hpY2hcbm1hbmlwdWxhdGUgdGhlIHByb3BzIGdvaW5nIGludG8gbWFueSBvZiB0aGUgY29tcG9uZW50cy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbnZhciBtb2RpZmllcnMgPSB7XG5cbiAgJ2ZpZWxkJzoge30sXG4gICdoZWxwJzoge30sXG4gICdzYW1wbGUnOiB7fSxcbiAgJ3RleHQnOiB7fSxcbiAgJ3RleHRhcmVhJzoge30sXG4gICdwcmV0dHktdGV4dGFyZWEnOiB7fSxcbiAgJ2pzb24nOiB7fSxcbiAgJ3NlbGVjdCc6IHt9LFxuICAnbGlzdCc6IHt9LFxuICAnbGlzdC1jb250cm9sJzoge30sXG4gICdsaXN0LWl0ZW0tY29udHJvbCc6IHt9LFxuICAnbGlzdC1pdGVtLXZhbHVlJzoge30sXG4gICdsaXN0LWl0ZW0nOiB7fSxcbiAgJ2l0ZW0tY2hvaWNlcyc6IHt9LFxuICAnYWRkLWl0ZW0nOiB7fSxcbiAgJ3JlbW92ZS1pdGVtJzoge30sXG4gICdtb3ZlLWl0ZW0tYmFjayc6IHt9LFxuICAnbW92ZS1pdGVtLWZvcndhcmQnOiB7fVxufTtcblxuLy8gQnVpbGQgdGhlIHBsdWdpbiBidW5kbGUuXG5fLmVhY2gobW9kaWZpZXJzLCBmdW5jdGlvbiAobW9kaWZpZXIsIG5hbWUpIHtcblxuICBleHBvcnRzWydjb21wb25lbnQtcHJvcHMuJyArIG5hbWUgKyAnLmRlZmF1bHQnXSA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICAgIHZhciB1dGlsID0gcGx1Z2luLnJlcXVpcmUoJ3V0aWwnKTtcblxuICAgIHBsdWdpbi5leHBvcnRzID0gW1xuICAgICAgbmFtZSxcbiAgICAgIGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICBwcm9wcy5jbGFzc05hbWUgPSB1dGlsLmNsYXNzTmFtZShwcm9wcy5jbGFzc05hbWUsIG5hbWUpO1xuICAgICAgfVxuICAgIF07XG4gIH07XG5cbn0pO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIHN0b3JlLm1lbW9yeVxuXG4vKlxuVGhlIG1lbW9yeSBzdG9yZSBwbHVnaW4ga2VlcHMgdGhlIHN0YXRlIG9mIGZpZWxkcywgZGF0YSwgYW5kIG1ldGFkYXRhLiBJdFxucmVzcG9uZHMgdG8gYWN0aW9ucyBhbmQgZW1pdHMgYSBjaGFuZ2UgZXZlbnQgaWYgdGhlcmUgYXJlIGFueSBjaGFuZ2VzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgdmFyIGNvbXBpbGVyID0gcGx1Z2luLnJlcXVpcmUoJ2NvbXBpbGVyJyk7XG4gIHZhciB1dGlsID0gcGx1Z2luLnJlcXVpcmUoJ3V0aWwnKTtcblxuICBwbHVnaW4uZXhwb3J0cyA9IGZ1bmN0aW9uIChmb3JtLCBlbWl0dGVyLCBvcHRpb25zKSB7XG5cbiAgICB2YXIgc3RvcmUgPSB7fTtcblxuICAgIHN0b3JlLmZpZWxkcyA9IFtdO1xuICAgIHN0b3JlLnRlbXBsYXRlTWFwID0ge307XG4gICAgc3RvcmUudmFsdWUgPSB7fTtcbiAgICBzdG9yZS5tZXRhID0ge307XG5cbiAgICAvLyBIZWxwZXIgdG8gc2V0dXAgZmllbGRzLiBGaWVsZCBkZWZpbml0aW9ucyBuZWVkIHRvIGJlIGV4cGFuZGVkLCBjb21waWxlZCxcbiAgICAvLyBldGMuXG5cbiAgICB2YXIgc2V0dXBGaWVsZHMgPSBmdW5jdGlvbiAoZmllbGRzKSB7XG4gICAgICBzdG9yZS5maWVsZHMgPSBjb21waWxlci5leHBhbmRGaWVsZHMoZmllbGRzKTtcbiAgICAgIHN0b3JlLmZpZWxkcyA9IGNvbXBpbGVyLmNvbXBpbGVGaWVsZHMoc3RvcmUuZmllbGRzKTtcbiAgICAgIHN0b3JlLnRlbXBsYXRlTWFwID0gY29tcGlsZXIudGVtcGxhdGVNYXAoc3RvcmUuZmllbGRzKTtcbiAgICAgIHN0b3JlLmZpZWxkcyA9IHN0b3JlLmZpZWxkcy5maWx0ZXIoZnVuY3Rpb24gKGRlZikge1xuICAgICAgICByZXR1cm4gIWRlZi50ZW1wbGF0ZTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBpZiAob3B0aW9ucy5maWVsZHMpIHtcbiAgICAgIHNldHVwRmllbGRzKG9wdGlvbnMuZmllbGRzKTtcbiAgICB9XG5cbiAgICBpZiAoIV8uaXNVbmRlZmluZWQob3B0aW9ucy52YWx1ZSkpIHtcbiAgICAgIHN0b3JlLnZhbHVlID0gdXRpbC5jb3B5VmFsdWUob3B0aW9ucy52YWx1ZSk7XG4gICAgfVxuXG4gICAgLy8gQ3VycmVudGx5LCBqdXN0IGEgc2luZ2xlIGV2ZW50IGZvciBhbnkgY2hhbmdlLlxuICAgIHZhciB1cGRhdGUgPSBmdW5jdGlvbiAoY2hhbmdpbmcpIHtcbiAgICAgIGVtaXR0ZXIuZW1pdCgnY2hhbmdlJywge1xuICAgICAgICB2YWx1ZTogc3RvcmUudmFsdWUsXG4gICAgICAgIG1ldGE6IHN0b3JlLm1ldGEsXG4gICAgICAgIGZpZWxkczogc3RvcmUuZmllbGRzLFxuICAgICAgICBjaGFuZ2luZzogY2hhbmdpbmdcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBXaGVuIGZpZWxkcyBjaGFuZ2UsIHdlIG5lZWQgdG8gXCJpbmZsYXRlXCIgdGhlbSwgbWVhbmluZyBleHBhbmQgdGhlbSBhbmRcbiAgICAvLyBydW4gYW55IGV2YWx1YXRpb25zIGluIG9yZGVyIHRvIGdldCB0aGUgZGVmYXVsdCB2YWx1ZSBvdXQuXG4gICAgc3RvcmUuaW5mbGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBmaWVsZCA9IGZvcm0uZmllbGQoKTtcbiAgICAgIGZpZWxkLmluZmxhdGUoZnVuY3Rpb24gKHBhdGgsIHZhbHVlKSB7XG4gICAgICAgIHN0b3JlLnZhbHVlID0gdXRpbC5zZXRJbihzdG9yZS52YWx1ZSwgcGF0aCwgdmFsdWUpO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHZhciBhY3Rpb25zID0ge1xuXG4gICAgICAvLyBTZXQgdmFsdWUgYXQgYSBwYXRoLlxuICAgICAgc2V0VmFsdWU6IGZ1bmN0aW9uIChwYXRoLCB2YWx1ZSkge1xuXG4gICAgICAgIGlmIChfLmlzVW5kZWZpbmVkKHZhbHVlKSkge1xuICAgICAgICAgIHZhbHVlID0gcGF0aDtcbiAgICAgICAgICBwYXRoID0gW107XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgb2xkVmFsdWUgPSB1dGlsLmdldEluKHN0b3JlLnZhbHVlLCBwYXRoKTtcblxuICAgICAgICBpZiAocGF0aC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICBzdG9yZS52YWx1ZSA9IHV0aWwuY29weVZhbHVlKHZhbHVlKTtcbiAgICAgICAgICBzdG9yZS5pbmZsYXRlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RvcmUudmFsdWUgPSB1dGlsLnNldEluKHN0b3JlLnZhbHVlLCBwYXRoLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgdXBkYXRlKHsncGF0aCc6IHBhdGgsICduZXcnOiB2YWx1ZSwgJ29sZCc6IG9sZFZhbHVlLCAnYWN0aW9uJzogJ3NldCd9KTtcbiAgICAgIH0sXG5cbiAgICAgIC8vIFJlbW92ZSBhIHZhbHVlIGF0IGEgcGF0aC5cbiAgICAgIHJlbW92ZVZhbHVlOiBmdW5jdGlvbiAocGF0aCkge1xuICAgICAgICB2YXIgb2xkVmFsdWUgPSB1dGlsLmdldEluKHN0b3JlLnZhbHVlLCBwYXRoKTtcbiAgICAgICAgc3RvcmUudmFsdWUgPSB1dGlsLnJlbW92ZUluKHN0b3JlLnZhbHVlLCBwYXRoKTtcblxuICAgICAgICB1cGRhdGUoeydwYXRoJzogcGF0aCwgJ29sZCc6IG9sZFZhbHVlLCAnYWN0aW9uJzogJ3JlbW92ZSd9KTtcbiAgICAgIH0sXG5cbiAgICAgIC8vIEVyYXNlIGEgdmFsdWUuIFVzZXIgYWN0aW9ucyBjYW4gcmVtb3ZlIHZhbHVlcywgYnV0IG5vZGVzIGNhbiBhbHNvXG4gICAgICAvLyBkaXNhcHBlYXIgZHVlIHRvIGNoYW5naW5nIGV2YWx1YXRpb25zLiBUaGlzIGFjdGlvbiBvY2N1cnMgYXV0b21hdGljYWxseVxuICAgICAgLy8gKGFuZCBtYXkgYmUgdW5uZWNlc3NhcnkgaWYgdGhlIHZhbHVlIHdhcyBhbHJlYWR5IHJlbW92ZWQpLlxuICAgICAgZXJhc2VWYWx1ZTogZnVuY3Rpb24gKHBhdGgpIHtcblxuICAgICAgICBzdG9yZS52YWx1ZSA9IHV0aWwucmVtb3ZlSW4oc3RvcmUudmFsdWUsIHBhdGgpO1xuXG4gICAgICAgIHVwZGF0ZSh7fSk7XG4gICAgICB9LFxuXG4gICAgICAvLyBBcHBlbmQgYSB2YWx1ZSB0byBhbiBhcnJheSBhdCBhIHBhdGguXG4gICAgICBhcHBlbmRWYWx1ZTogZnVuY3Rpb24gKHBhdGgsIHZhbHVlKSB7XG4gICAgICAgIHZhciBvbGRWYWx1ZSA9IHV0aWwuZ2V0SW4oc3RvcmUudmFsdWUsIHBhdGgpO1xuICAgICAgICBzdG9yZS52YWx1ZSA9IHV0aWwuYXBwZW5kSW4oc3RvcmUudmFsdWUsIHBhdGgsIHZhbHVlKTtcblxuICAgICAgICB1cGRhdGUoeydwYXRoJzogcGF0aCwgJ25ldyc6IHZhbHVlLCAnb2xkJzogb2xkVmFsdWUsICdhY3Rpb24nOiAnYXBwZW5kJ30pO1xuICAgICAgfSxcblxuICAgICAgLy8gU3dhcCB2YWx1ZXMgb2YgdHdvIGtleXMuXG4gICAgICBtb3ZlVmFsdWU6IGZ1bmN0aW9uIChwYXRoLCBmcm9tS2V5LCB0b0tleSkge1xuICAgICAgICB2YXIgb2xkVmFsdWUgPSB1dGlsLmdldEluKHN0b3JlLnZhbHVlLCBwYXRoKTtcbiAgICAgICAgc3RvcmUudmFsdWUgPSB1dGlsLm1vdmVJbihzdG9yZS52YWx1ZSwgcGF0aCwgZnJvbUtleSwgdG9LZXkpO1xuXG4gICAgICAgIHVwZGF0ZSh7J3BhdGgnOiBwYXRoLCAnbmV3Jzogb2xkVmFsdWUsICdvbGQnOiBvbGRWYWx1ZSwgJ2Zyb21LZXknOiBmcm9tS2V5LCAndG9LZXknOiB0b0tleSwgJ2FjdGlvbic6ICdtb3ZlJ30pO1xuICAgICAgfSxcblxuICAgICAgLy8gQ2hhbmdlIGFsbCB0aGUgZmllbGRzLlxuICAgICAgc2V0RmllbGRzOiBmdW5jdGlvbiAoZmllbGRzKSB7XG4gICAgICAgIHNldHVwRmllbGRzKGZpZWxkcyk7XG4gICAgICAgIHN0b3JlLmluZmxhdGUoKTtcblxuICAgICAgICB1cGRhdGUoeydhY3Rpb24nOiAnc2V0RmllbGRzJ30pO1xuICAgICAgfSxcblxuICAgICAgLy8gU2V0IGEgbWV0YWRhdGEgdmFsdWUgZm9yIGEga2V5LlxuICAgICAgc2V0TWV0YTogZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgICAgc3RvcmUubWV0YVtrZXldID0gdmFsdWU7XG4gICAgICAgIHVwZGF0ZSh7J2FjdGlvbic6ICdzZXRNZXRhJ30pO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBfLmV4dGVuZChzdG9yZSwgYWN0aW9ucyk7XG5cbiAgICByZXR1cm4gc3RvcmU7XG4gIH07XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIHR5cGUuYXJyYXlcblxuLypcblN1cHBvcnQgYXJyYXkgdHlwZSB3aGVyZSBjaGlsZCBmaWVsZHMgYXJlIGR5bmFtaWNhbGx5IGRldGVybWluZWQgYmFzZWQgb24gdGhlXG52YWx1ZXMgb2YgdGhlIGFycmF5LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMuZGVmYXVsdCA9IFtdO1xuXG4gIHBsdWdpbi5leHBvcnRzLmZpZWxkcyA9IGZ1bmN0aW9uIChmaWVsZCkge1xuXG4gICAgaWYgKF8uaXNBcnJheShmaWVsZC52YWx1ZSkpIHtcbiAgICAgIHJldHVybiBmaWVsZC52YWx1ZS5tYXAoZnVuY3Rpb24gKHZhbHVlLCBpKSB7XG4gICAgICAgIHZhciBpdGVtID0gZmllbGQuaXRlbUZvclZhbHVlKHZhbHVlKTtcbiAgICAgICAgaXRlbS5rZXkgPSBpO1xuICAgICAgICByZXR1cm4gZmllbGQuY3JlYXRlQ2hpbGQoaXRlbSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgfTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIi8vICMgdHlwZS5ib29sZWFuXG5cbi8qXG5TdXBwb3J0IGEgdHJ1ZS9mYWxzZSB2YWx1ZS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMuZGVmYXVsdCA9IGZhbHNlO1xuXG4gIHBsdWdpbi5leHBvcnRzLmNvbXBpbGUgPSBmdW5jdGlvbiAoZGVmKSB7XG4gICAgaWYgKCFkZWYuY2hvaWNlcykge1xuICAgICAgZGVmLmNob2ljZXMgPSBbXG4gICAgICAgIHt2YWx1ZTogdHJ1ZSwgbGFiZWw6ICdZZXMnfSxcbiAgICAgICAge3ZhbHVlOiBmYWxzZSwgbGFiZWw6ICdObyd9XG4gICAgICBdO1xuICAgIH1cbiAgfTtcbn07XG4iLCIvLyAjIHR5cGUuanNvblxuXG4vKlxuQXJiaXRyYXJ5IEpTT04gdmFsdWUuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzLmRlZmF1bHQgPSBudWxsO1xuXG59O1xuIiwiLy8gIyB0eXBlLm51bWJlclxuXG4vKlxuU3VwcG9ydCBudW1iZXIgdmFsdWVzLCBvZiBjb3Vyc2UuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzLmRlZmF1bHQgPSAwO1xuXG59O1xuIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyB0eXBlLm9iamVjdFxuXG4vKlxuU3VwcG9ydCBmb3Igb2JqZWN0IHR5cGVzLiBPYmplY3QgZmllbGRzIGNhbiBzdXBwbHkgc3RhdGljIGNoaWxkIGZpZWxkcywgb3IgaWZcbnRoZXJlIGFyZSBhZGRpdGlvbmFsIGNoaWxkIGtleXMsIGR5bmFtaWMgY2hpbGQgZmllbGRzIHdpbGwgYmUgY3JlYXRlZCBtdWNoXG5saWtlIGFuIGFycmF5LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgdmFyIHV0aWwgPSBwbHVnaW4ucmVxdWlyZSgndXRpbCcpO1xuXG4gIHBsdWdpbi5leHBvcnRzLmRlZmF1bHQgPSB7fTtcblxuICBwbHVnaW4uZXhwb3J0cy5maWVsZHMgPSBmdW5jdGlvbiAoZmllbGQpIHtcblxuICAgIHZhciBmaWVsZHMgPSBbXTtcbiAgICB2YXIgdmFsdWUgPSBmaWVsZC52YWx1ZTtcbiAgICB2YXIgdW51c2VkS2V5cyA9IF8ua2V5cyh2YWx1ZSk7XG5cbiAgICBpZiAoZmllbGQuZGVmLmZpZWxkcykge1xuXG4gICAgICBmaWVsZHMgPSBmaWVsZC5kZWYuZmllbGRzLm1hcChmdW5jdGlvbiAoZGVmKSB7XG4gICAgICAgIHZhciBjaGlsZCA9IGZpZWxkLmNyZWF0ZUNoaWxkKGRlZik7XG4gICAgICAgIGlmICghdXRpbC5pc0JsYW5rKGNoaWxkLmRlZi5rZXkpKSB7XG4gICAgICAgICAgdW51c2VkS2V5cyA9IF8ud2l0aG91dCh1bnVzZWRLZXlzLCBjaGlsZC5kZWYua2V5KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2hpbGQ7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodW51c2VkS2V5cy5sZW5ndGggPiAwKSB7XG4gICAgICB1bnVzZWRLZXlzLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICB2YXIgaXRlbSA9IGZpZWxkLml0ZW1Gb3JWYWx1ZSh2YWx1ZVtrZXldKTtcbiAgICAgICAgaXRlbS5sYWJlbCA9IHV0aWwuaHVtYW5pemUoa2V5KTtcbiAgICAgICAgaXRlbS5rZXkgPSBrZXk7XG4gICAgICAgIGZpZWxkcy5wdXNoKGZpZWxkLmNyZWF0ZUNoaWxkKGl0ZW0pKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBmaWVsZHM7XG4gIH07XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIvLyAjIHR5cGUucm9vdFxuXG4vKlxuU3BlY2lhbCB0eXBlIHJlcHJlc2VudGluZyB0aGUgcm9vdCBvZiB0aGUgZm9ybS4gR2V0cyB0aGUgZmllbGRzIGRpcmVjdGx5IGZyb21cbnRoZSBzdG9yZS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMuZmllbGRzID0gZnVuY3Rpb24gKGZpZWxkKSB7XG5cbiAgICByZXR1cm4gZmllbGQuZm9ybS5zdG9yZS5maWVsZHMubWFwKGZ1bmN0aW9uIChkZWYpIHtcbiAgICAgIHJldHVybiBmaWVsZC5jcmVhdGVDaGlsZChkZWYpO1xuICAgIH0pO1xuXG4gIH07XG59O1xuIiwiLy8gIyB0eXBlLnN0cmluZ1xuXG4vKlxuU3VwcG9ydCBzdHJpbmcgdmFsdWVzLCBvZiBjb3Vyc2UuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzLmRlZmF1bHQgPSAnJztcblxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBSZXByZXNlbnRhdGlvbiBvZiBhIHNpbmdsZSBFdmVudEVtaXR0ZXIgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gRXZlbnQgaGFuZGxlciB0byBiZSBjYWxsZWQuXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IENvbnRleHQgZm9yIGZ1bmN0aW9uIGV4ZWN1dGlvbi5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb25jZSBPbmx5IGVtaXQgb25jZVxuICogQGFwaSBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIEVFKGZuLCBjb250ZXh0LCBvbmNlKSB7XG4gIHRoaXMuZm4gPSBmbjtcbiAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbiAgdGhpcy5vbmNlID0gb25jZSB8fCBmYWxzZTtcbn1cblxuLyoqXG4gKiBNaW5pbWFsIEV2ZW50RW1pdHRlciBpbnRlcmZhY2UgdGhhdCBpcyBtb2xkZWQgYWdhaW5zdCB0aGUgTm9kZS5qc1xuICogRXZlbnRFbWl0dGVyIGludGVyZmFjZS5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBhcGkgcHVibGljXG4gKi9cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHsgLyogTm90aGluZyB0byBzZXQgKi8gfVxuXG4vKipcbiAqIEhvbGRzIHRoZSBhc3NpZ25lZCBFdmVudEVtaXR0ZXJzIGJ5IG5hbWUuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqIEBwcml2YXRlXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBSZXR1cm4gYSBsaXN0IG9mIGFzc2lnbmVkIGV2ZW50IGxpc3RlbmVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50cyB0aGF0IHNob3VsZCBiZSBsaXN0ZWQuXG4gKiBAcmV0dXJucyB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uIGxpc3RlbmVycyhldmVudCkge1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW2V2ZW50XSkgcmV0dXJuIFtdO1xuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5fZXZlbnRzW2V2ZW50XS5sZW5ndGgsIGVlID0gW107IGkgPCBsOyBpKyspIHtcbiAgICBlZS5wdXNoKHRoaXMuX2V2ZW50c1tldmVudF1baV0uZm4pO1xuICB9XG5cbiAgcmV0dXJuIGVlO1xufTtcblxuLyoqXG4gKiBFbWl0IGFuIGV2ZW50IHRvIGFsbCByZWdpc3RlcmVkIGV2ZW50IGxpc3RlbmVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIG5hbWUgb2YgdGhlIGV2ZW50LlxuICogQHJldHVybnMge0Jvb2xlYW59IEluZGljYXRpb24gaWYgd2UndmUgZW1pdHRlZCBhbiBldmVudC5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIGVtaXQoZXZlbnQsIGExLCBhMiwgYTMsIGE0LCBhNSkge1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW2V2ZW50XSkgcmV0dXJuIGZhbHNlO1xuXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbZXZlbnRdXG4gICAgLCBsZW5ndGggPSBsaXN0ZW5lcnMubGVuZ3RoXG4gICAgLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgLCBlZSA9IGxpc3RlbmVyc1swXVxuICAgICwgYXJnc1xuICAgICwgaSwgajtcblxuICBpZiAoMSA9PT0gbGVuZ3RoKSB7XG4gICAgaWYgKGVlLm9uY2UpIHRoaXMucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGVlLmZuLCB0cnVlKTtcblxuICAgIHN3aXRjaCAobGVuKSB7XG4gICAgICBjYXNlIDE6IHJldHVybiBlZS5mbi5jYWxsKGVlLmNvbnRleHQpLCB0cnVlO1xuICAgICAgY2FzZSAyOiByZXR1cm4gZWUuZm4uY2FsbChlZS5jb250ZXh0LCBhMSksIHRydWU7XG4gICAgICBjYXNlIDM6IHJldHVybiBlZS5mbi5jYWxsKGVlLmNvbnRleHQsIGExLCBhMiksIHRydWU7XG4gICAgICBjYXNlIDQ6IHJldHVybiBlZS5mbi5jYWxsKGVlLmNvbnRleHQsIGExLCBhMiwgYTMpLCB0cnVlO1xuICAgICAgY2FzZSA1OiByZXR1cm4gZWUuZm4uY2FsbChlZS5jb250ZXh0LCBhMSwgYTIsIGEzLCBhNCksIHRydWU7XG4gICAgICBjYXNlIDY6IHJldHVybiBlZS5mbi5jYWxsKGVlLmNvbnRleHQsIGExLCBhMiwgYTMsIGE0LCBhNSksIHRydWU7XG4gICAgfVxuXG4gICAgZm9yIChpID0gMSwgYXJncyA9IG5ldyBBcnJheShsZW4gLTEpOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgIH1cblxuICAgIGVlLmZuLmFwcGx5KGVlLmNvbnRleHQsIGFyZ3MpO1xuICB9IGVsc2Uge1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGxpc3RlbmVyc1tpXS5vbmNlKSB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcnNbaV0uZm4sIHRydWUpO1xuXG4gICAgICBzd2l0Y2ggKGxlbikge1xuICAgICAgICBjYXNlIDE6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0KTsgYnJlYWs7XG4gICAgICAgIGNhc2UgMjogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExKTsgYnJlYWs7XG4gICAgICAgIGNhc2UgMzogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExLCBhMik7IGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGlmICghYXJncykgZm9yIChqID0gMSwgYXJncyA9IG5ldyBBcnJheShsZW4gLTEpOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaiAtIDFdID0gYXJndW1lbnRzW2pdO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxpc3RlbmVyc1tpXS5mbi5hcHBseShsaXN0ZW5lcnNbaV0uY29udGV4dCwgYXJncyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vKipcbiAqIFJlZ2lzdGVyIGEgbmV3IEV2ZW50TGlzdGVuZXIgZm9yIHRoZSBnaXZlbiBldmVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgTmFtZSBvZiB0aGUgZXZlbnQuXG4gKiBAcGFyYW0ge0Z1bmN0b259IGZuIENhbGxiYWNrIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBUaGUgY29udGV4dCBvZiB0aGUgZnVuY3Rpb24uXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gb24oZXZlbnQsIGZuLCBjb250ZXh0KSB7XG4gIGlmICghdGhpcy5fZXZlbnRzKSB0aGlzLl9ldmVudHMgPSB7fTtcbiAgaWYgKCF0aGlzLl9ldmVudHNbZXZlbnRdKSB0aGlzLl9ldmVudHNbZXZlbnRdID0gW107XG4gIHRoaXMuX2V2ZW50c1tldmVudF0ucHVzaChuZXcgRUUoIGZuLCBjb250ZXh0IHx8IHRoaXMgKSk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZCBhbiBFdmVudExpc3RlbmVyIHRoYXQncyBvbmx5IGNhbGxlZCBvbmNlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBOYW1lIG9mIHRoZSBldmVudC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIENhbGxiYWNrIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBUaGUgY29udGV4dCBvZiB0aGUgZnVuY3Rpb24uXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbiBvbmNlKGV2ZW50LCBmbiwgY29udGV4dCkge1xuICBpZiAoIXRoaXMuX2V2ZW50cykgdGhpcy5fZXZlbnRzID0ge307XG4gIGlmICghdGhpcy5fZXZlbnRzW2V2ZW50XSkgdGhpcy5fZXZlbnRzW2V2ZW50XSA9IFtdO1xuICB0aGlzLl9ldmVudHNbZXZlbnRdLnB1c2gobmV3IEVFKGZuLCBjb250ZXh0IHx8IHRoaXMsIHRydWUgKSk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBldmVudCBsaXN0ZW5lcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCB3ZSB3YW50IHRvIHJlbW92ZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBsaXN0ZW5lciB0aGF0IHdlIG5lZWQgdG8gZmluZC5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb25jZSBPbmx5IHJlbW92ZSBvbmNlIGxpc3RlbmVycy5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcihldmVudCwgZm4sIG9uY2UpIHtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1tldmVudF0pIHJldHVybiB0aGlzO1xuXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbZXZlbnRdXG4gICAgLCBldmVudHMgPSBbXTtcblxuICBpZiAoZm4pIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBsaXN0ZW5lcnMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBpZiAobGlzdGVuZXJzW2ldLmZuICE9PSBmbiAmJiBsaXN0ZW5lcnNbaV0ub25jZSAhPT0gb25jZSkge1xuICAgICAgZXZlbnRzLnB1c2gobGlzdGVuZXJzW2ldKTtcbiAgICB9XG4gIH1cblxuICAvL1xuICAvLyBSZXNldCB0aGUgYXJyYXksIG9yIHJlbW92ZSBpdCBjb21wbGV0ZWx5IGlmIHdlIGhhdmUgbm8gbW9yZSBsaXN0ZW5lcnMuXG4gIC8vXG4gIGlmIChldmVudHMubGVuZ3RoKSB0aGlzLl9ldmVudHNbZXZlbnRdID0gZXZlbnRzO1xuICBlbHNlIHRoaXMuX2V2ZW50c1tldmVudF0gPSBudWxsO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYWxsIGxpc3RlbmVycyBvciBvbmx5IHRoZSBsaXN0ZW5lcnMgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCB3YW50IHRvIHJlbW92ZSBhbGwgbGlzdGVuZXJzIGZvci5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24gcmVtb3ZlQWxsTGlzdGVuZXJzKGV2ZW50KSB7XG4gIGlmICghdGhpcy5fZXZlbnRzKSByZXR1cm4gdGhpcztcblxuICBpZiAoZXZlbnQpIHRoaXMuX2V2ZW50c1tldmVudF0gPSBudWxsO1xuICBlbHNlIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy9cbi8vIEFsaWFzIG1ldGhvZHMgbmFtZXMgYmVjYXVzZSBwZW9wbGUgcm9sbCBsaWtlIHRoYXQuXG4vL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vZmYgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUub247XG5cbi8vXG4vLyBUaGlzIGZ1bmN0aW9uIGRvZXNuJ3QgYXBwbHkgYW55bW9yZS5cbi8vXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uIHNldE1heExpc3RlbmVycygpIHtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vL1xuLy8gRXhwb3NlIHRoZSBtb2R1bGUuXG4vL1xuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIyID0gRXZlbnRFbWl0dGVyO1xuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlcjMgPSBFdmVudEVtaXR0ZXI7XG5cbmlmICgnb2JqZWN0JyA9PT0gdHlwZW9mIG1vZHVsZSAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvZm9ybWF0aWMnKTtcbiJdfQ==
