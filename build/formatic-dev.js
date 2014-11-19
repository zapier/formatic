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

      return R.div({ref: 'container', onWheel: this.onWheel, onScroll: this.onScroll, className: 'choices-container', style: {
        userSelect: 'none', WebkitUserSelect: 'none', position: 'absolute',
        maxHeight: this.state.maxHeight ? this.state.maxHeight : null
      }},
        CSSTransitionGroup({transitionName: 'reveal'},
          this.props.open ? R.ul({ref: 'choices', className: 'choices'},
            this.props.choices.map(function (choice, i) {
              return R.li({key: i, className: 'choice'},
                choice.value === '///loading///' ?
                  R.a({href: 'JavaScript' + ':', onClick: this.props.onClose},
                    R.span({className: 'choice-label'},
                      'Loading...'
                    )
                  ) :
                  R.a({href: 'JavaScript' + ':', onClick: this.onSelect.bind(this, choice)},
                    R.span({className: 'choice-label'},
                      choice.label
                    ),
                    R.span({className: 'choice-sample'},
                      choice.sample
                    )
                  )
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
          onCopy: this.onCopy
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvY29tcGlsZXJzL2Nob2ljZXMuanMiLCJsaWIvY29tcGlsZXJzL2xvb2t1cC5qcyIsImxpYi9jb21waWxlcnMvcHJvcC1hbGlhc2VzLmpzIiwibGliL2NvbXBpbGVycy90eXBlcy5qcyIsImxpYi9jb21wb25lbnRzL2FkZC1pdGVtLmpzIiwibGliL2NvbXBvbmVudHMvY2hlY2tib3gtbGlzdC5qcyIsImxpYi9jb21wb25lbnRzL2Nob2ljZXMuanMiLCJsaWIvY29tcG9uZW50cy9maWVsZC5qcyIsImxpYi9jb21wb25lbnRzL2ZpZWxkc2V0LmpzIiwibGliL2NvbXBvbmVudHMvZm9ybWF0aWMuanMiLCJsaWIvY29tcG9uZW50cy9oZWxwLmpzIiwibGliL2NvbXBvbmVudHMvaXRlbS1jaG9pY2VzLmpzIiwibGliL2NvbXBvbmVudHMvanNvbi5qcyIsImxpYi9jb21wb25lbnRzL2xhYmVsLmpzIiwibGliL2NvbXBvbmVudHMvbGlzdC1jb250cm9sLmpzIiwibGliL2NvbXBvbmVudHMvbGlzdC1pdGVtLWNvbnRyb2wuanMiLCJsaWIvY29tcG9uZW50cy9saXN0LWl0ZW0tdmFsdWUuanMiLCJsaWIvY29tcG9uZW50cy9saXN0LWl0ZW0uanMiLCJsaWIvY29tcG9uZW50cy9saXN0LmpzIiwibGliL2NvbXBvbmVudHMvbW92ZS1pdGVtLWJhY2suanMiLCJsaWIvY29tcG9uZW50cy9tb3ZlLWl0ZW0tZm9yd2FyZC5qcyIsImxpYi9jb21wb25lbnRzL3ByZXR0eS10ZXh0YXJlYS5qcyIsImxpYi9jb21wb25lbnRzL3JlbW92ZS1pdGVtLmpzIiwibGliL2NvbXBvbmVudHMvcm9vdC5qcyIsImxpYi9jb21wb25lbnRzL3NhbXBsZS5qcyIsImxpYi9jb21wb25lbnRzL3NlbGVjdC5qcyIsImxpYi9jb21wb25lbnRzL3RleHQuanMiLCJsaWIvY29tcG9uZW50cy90ZXh0YXJlYS5qcyIsImxpYi9jb3JlL2ZpZWxkLmpzIiwibGliL2NvcmUvZm9ybS1pbml0LmpzIiwibGliL2NvcmUvZm9ybS5qcyIsImxpYi9jb3JlL2Zvcm1hdGljLmpzIiwibGliL2RlZmF1bHQvY29tcGlsZXIuanMiLCJsaWIvZGVmYXVsdC9jb21wb25lbnQuanMiLCJsaWIvZGVmYXVsdC9jb3JlLmpzIiwibGliL2RlZmF1bHQvZXZhbC1mdW5jdGlvbnMuanMiLCJsaWIvZGVmYXVsdC9ldmFsLmpzIiwibGliL2RlZmF1bHQvZmllbGQtcm91dGVyLmpzIiwibGliL2RlZmF1bHQvZmllbGQtcm91dGVzLmpzIiwibGliL2RlZmF1bHQvbG9hZGVyLmpzIiwibGliL2RlZmF1bHQvdXRpbC5qcyIsImxpYi9mb3JtYXRpYy5qcyIsImxpYi9taXhpbnMvY2xpY2stb3V0c2lkZS5qcyIsImxpYi9taXhpbnMvZmllbGQuanMiLCJsaWIvbWl4aW5zL2lucHV0LWFjdGlvbnMuanMiLCJsaWIvbWl4aW5zL3Jlc2l6ZS5qcyIsImxpYi9taXhpbnMvc2Nyb2xsLmpzIiwibGliL21peGlucy91bmRvLXN0YWNrLmpzIiwibGliL3BsdWdpbnMvYm9vdHN0cmFwLXN0eWxlLmpzIiwibGliL3BsdWdpbnMvZGVmYXVsdC1zdHlsZS5qcyIsImxpYi9zdG9yZS9tZW1vcnkuanMiLCJsaWIvdHlwZXMvYXJyYXkuanMiLCJsaWIvdHlwZXMvYm9vbGVhbi5qcyIsImxpYi90eXBlcy9qc29uLmpzIiwibGliL3R5cGVzL251bWJlci5qcyIsImxpYi90eXBlcy9vYmplY3QuanMiLCJsaWIvdHlwZXMvcm9vdC5qcyIsImxpYi90eXBlcy9zdHJpbmcuanMiLCJub2RlX21vZHVsZXMvZXZlbnRlbWl0dGVyMy9pbmRleC5qcyIsImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9OQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdmxCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVNQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcGlsZXIuY2hvaWNlc1xuXG4vKlxuTm9ybWFsaXplcyB0aGUgY2hvaWNlcyBmb3IgYSBmaWVsZC4gU3VwcG9ydHMgdGhlIGZvbGxvd2luZyBmb3JtYXRzLlxuXG5gYGBqc1xuJ3JlZCwgYmx1ZSdcblxuWydyZWQnLCAnYmx1ZSddXG5cbntyZWQ6ICdSZWQnLCBibHVlOiAnQmx1ZSd9XG5cblt7dmFsdWU6ICdyZWQnLCBsYWJlbDogJ1JlZCd9LCB7dmFsdWU6ICdibHVlJywgbGFiZWw6ICdCbHVlJ31dXG5gYGBcblxuQWxsIG9mIHRob3NlIGZvcm1hdHMgYXJlIG5vcm1hbGl6ZWQgdG86XG5cbmBgYGpzXG5be3ZhbHVlOiAncmVkJywgbGFiZWw6ICdSZWQnfSwge3ZhbHVlOiAnYmx1ZScsIGxhYmVsOiAnQmx1ZSd9XVxuYGBgXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICB2YXIgdXRpbCA9IHBsdWdpbi5yZXF1aXJlKCd1dGlsJyk7XG5cbiAgdmFyIGNvbXBpbGVDaG9pY2VzID0gZnVuY3Rpb24gKGNob2ljZXMpIHtcblxuICAgIC8vIENvbnZlcnQgY29tbWEgc2VwYXJhdGVkIHN0cmluZyB0byBhcnJheSBvZiBzdHJpbmdzLlxuICAgIGlmIChfLmlzU3RyaW5nKGNob2ljZXMpKSB7XG4gICAgICBjaG9pY2VzID0gY2hvaWNlcy5zcGxpdCgnLCcpO1xuICAgIH1cblxuICAgIC8vIENvbnZlcnQgb2JqZWN0IHRvIGFycmF5IG9mIG9iamVjdHMgd2l0aCBgdmFsdWVgIGFuZCBgbGFiZWxgIHByb3BlcnRpZXMuXG4gICAgaWYgKCFfLmlzQXJyYXkoY2hvaWNlcykgJiYgXy5pc09iamVjdChjaG9pY2VzKSkge1xuICAgICAgY2hvaWNlcyA9IE9iamVjdC5rZXlzKGNob2ljZXMpLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdmFsdWU6IGtleSxcbiAgICAgICAgICBsYWJlbDogY2hvaWNlc1trZXldXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBDb3B5IHRoZSBhcnJheSBvZiBjaG9pY2VzIHNvIHdlIGNhbiBtYW5pcHVsYXRlIHRoZW0uXG4gICAgY2hvaWNlcyA9IGNob2ljZXMuc2xpY2UoMCk7XG5cbiAgICAvLyBBcnJheSBvZiBjaG9pY2UgYXJyYXlzIHNob3VsZCBiZSBmbGF0dGVuZWQuXG4gICAgY2hvaWNlcyA9IF8uZmxhdHRlbihjaG9pY2VzKTtcblxuICAgIGNob2ljZXMuZm9yRWFjaChmdW5jdGlvbiAoY2hvaWNlLCBpKSB7XG4gICAgICAvLyBDb252ZXJ0IGFueSBzdHJpbmcgY2hvaWNlcyB0byBvYmplY3RzIHdpdGggYHZhbHVlYCBhbmQgYGxhYmVsYFxuICAgICAgLy8gcHJvcGVydGllcy5cbiAgICAgIGlmIChfLmlzU3RyaW5nKGNob2ljZSkpIHtcbiAgICAgICAgY2hvaWNlc1tpXSA9IHtcbiAgICAgICAgICB2YWx1ZTogY2hvaWNlLFxuICAgICAgICAgIGxhYmVsOiB1dGlsLmh1bWFuaXplKGNob2ljZSlcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmICghY2hvaWNlc1tpXS5sYWJlbCkge1xuICAgICAgICBjaG9pY2VzW2ldLmxhYmVsID0gdXRpbC5odW1hbml6ZShjaG9pY2VzW2ldLnZhbHVlKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBjaG9pY2VzO1xuICB9O1xuXG4gIHBsdWdpbi5leHBvcnRzLmNvbXBpbGUgPSBmdW5jdGlvbiAoZGVmKSB7XG4gICAgaWYgKGRlZi5jaG9pY2VzID09PSAnJykge1xuICAgICAgZGVmLmNob2ljZXMgPSBbXTtcbiAgICB9IGVsc2UgaWYgKGRlZi5jaG9pY2VzKSB7XG5cbiAgICAgIGRlZi5jaG9pY2VzID0gY29tcGlsZUNob2ljZXMoZGVmLmNob2ljZXMpO1xuICAgIH1cblxuICAgIGlmIChkZWYucmVwbGFjZUNob2ljZXMgPT09ICcnKSB7XG4gICAgICBkZWYucmVwbGFjZUNob2ljZXMgPSBbXTtcbiAgICB9IGVsc2UgaWYgKGRlZi5yZXBsYWNlQ2hvaWNlcykge1xuXG4gICAgICBkZWYucmVwbGFjZUNob2ljZXMgPSBjb21waWxlQ2hvaWNlcyhkZWYucmVwbGFjZUNob2ljZXMpO1xuXG4gICAgICBkZWYucmVwbGFjZUNob2ljZXNMYWJlbHMgPSB7fTtcblxuICAgICAgZGVmLnJlcGxhY2VDaG9pY2VzLmZvckVhY2goZnVuY3Rpb24gKGNob2ljZSkge1xuICAgICAgICBkZWYucmVwbGFjZUNob2ljZXNMYWJlbHNbY2hvaWNlLnZhbHVlXSA9IGNob2ljZS5sYWJlbDtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIi8vICMgY29tcGlsZXIubG9va3VwXG5cbi8qXG5Db252ZXJ0IGEgbG9va3VwIGRlY2xhcmF0aW9uIHRvIGFuIGV2YWx1YXRpb24uIEEgbG9va3VwIHByb3BlcnR5IGlzIHVzZWQgbGlrZTpcblxuYGBganNcbntcbiAgdHlwZTogJ3N0cmluZycsXG4gIGtleTogJ3N0YXRlcycsXG4gIGxvb2t1cDoge3NvdXJjZTogJ2xvY2F0aW9ucycsIGtleXM6IFsnY291bnRyeSddfVxufVxuYGBgXG5cbkxvZ2ljYWxseSwgdGhlIGFib3ZlIHdpbGwgdXNlIHRoZSBgY291bnRyeWAga2V5IG9mIHRoZSB2YWx1ZSB0byBhc2sgdGhlXG5gbG9jYXRpb25zYCBzb3VyY2UgZm9yIHN0YXRlcyBjaG9pY2VzLiBUaGlzIHdvcmtzIGJ5IGNvbnZlcnRpbmcgdGhlIGxvb2t1cCB0b1xudGhlIGZvbGxvd2luZyBldmFsdWF0aW9uLlxuXG5gYGBqc1xue1xuICB0eXBlOiAnc3RyaW5nJyxcbiAga2V5OiAnc3RhdGVzJyxcbiAgY2hvaWNlczogW10sXG4gIGV2YWw6IHtcbiAgICBuZWVkc01ldGE6IFtcbiAgICAgIFsnQGlmJywgWydAZ2V0TWV0YScsICdsb2NhdGlvbnMnLCB7Y291bnRyeTogWydAZ2V0JywgJ2NvdW50cnknXX1dLCBudWxsLCBbJ2xvY2F0aW9ucycsIHtjb3VudHJ5OiBbJ0BnZXQnLCAnY291bnRyeSddfV1dXG4gICAgXSxcbiAgICBjaG9pY2VzOiBbJ0BnZXRNZXRhJywgJ2xvY2F0aW9ucycsIHtjb3VudHJ5OiBbJ0BnZXQnLCAnY291bnRyeSddfV1cbiAgfVxufVxuYGBgXG5cblRoZSBhYm92ZSBzYXlzIHRvIGFkZCBhIGBuZWVkc01ldGFgIHByb3BlcnR5IGlmIG5lY2Vzc2FyeSBhbmQgYWRkIGEgYGNob2ljZXNgXG5hcnJheSBpZiBpdCdzIGF2YWlsYWJsZS4gT3RoZXJ3aXNlLCBjaG9pY2VzIHdpbGwgZGVmYXVsdCB0byBhbiBlbXB0eSBhcnJheS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgdmFyIGFkZExvb2t1cCA9IGZ1bmN0aW9uIChkZWYsIGxvb2t1cFByb3BOYW1lLCBjaG9pY2VzUHJvcE5hbWUpIHtcbiAgICB2YXIgbG9va3VwID0gZGVmW2xvb2t1cFByb3BOYW1lXTtcblxuICAgIGlmIChsb29rdXApIHtcbiAgICAgIGlmICghZGVmW2Nob2ljZXNQcm9wTmFtZV0pIHtcbiAgICAgICAgZGVmW2Nob2ljZXNQcm9wTmFtZV0gPSBbXTtcbiAgICAgIH1cbiAgICAgIGlmICghZGVmLmV2YWwpIHtcbiAgICAgICAgZGVmLmV2YWwgPSB7fTtcbiAgICAgIH1cbiAgICAgIGlmICghZGVmLmV2YWwubmVlZHNNZXRhKSB7XG4gICAgICAgIGRlZi5ldmFsLm5lZWRzTWV0YSA9IFtdO1xuICAgICAgfVxuICAgICAgdmFyIGtleXMgPSBsb29rdXAua2V5cyB8fCBbXTtcbiAgICAgIHZhciBwYXJhbXMgPSB7fTtcbiAgICAgIHZhciBtZXRhQXJncywgbWV0YUdldCwgaGlkZGVuVGVzdDtcblxuICAgICAgaWYgKGxvb2t1cC5ncm91cCkge1xuXG4gICAgICAgIGtleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgcGFyYW1zW2tleV0gPSBbJ0BnZXQnLCAnaXRlbScsIGtleV07XG4gICAgICAgIH0pO1xuICAgICAgICBtZXRhQXJncyA9IFtsb29rdXAuc291cmNlXS5jb25jYXQocGFyYW1zKTtcbiAgICAgICAgbWV0YUdldCA9IFsnQGdldE1ldGEnXS5jb25jYXQobWV0YUFyZ3MpO1xuICAgICAgICB2YXIgbWV0YUZvckVhY2ggPSBbJ0Bmb3JFYWNoJywgJ2l0ZW0nLCBbJ0BnZXRHcm91cFZhbHVlcycsIGxvb2t1cC5ncm91cF1dO1xuICAgICAgICBkZWYuZXZhbC5uZWVkc01ldGEucHVzaChtZXRhRm9yRWFjaC5jb25jYXQoW1xuICAgICAgICAgIG1ldGFBcmdzLFxuICAgICAgICAgIFsnQG5vdCcsIG1ldGFHZXRdXG4gICAgICAgIF0pKTtcbiAgICAgICAgaGlkZGVuVGVzdCA9IFsnQGFuZCddLmNvbmNhdChrZXlzLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgcmV0dXJuIFsnQGdldCcsICdpdGVtJywga2V5XTtcbiAgICAgICAgfSkpO1xuICAgICAgICBkZWYuZXZhbFtjaG9pY2VzUHJvcE5hbWVdID0gbWV0YUZvckVhY2guY29uY2F0KFtcbiAgICAgICAgICBbJ0BvcicsIG1ldGFHZXQsIFsnQGlmJywgaGlkZGVuVGVzdCwgWycvLy9sb2FkaW5nLy8vJ10sIFtdXV0sXG4gICAgICAgICAgWydAb3InLCBoaWRkZW5UZXN0LCBtZXRhR2V0XVxuICAgICAgICBdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGtleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgcGFyYW1zW2tleV0gPSBbJ0BnZXQnLCBrZXldO1xuICAgICAgICB9KTtcbiAgICAgICAgbWV0YUFyZ3MgPSBbbG9va3VwLnNvdXJjZV0uY29uY2F0KHBhcmFtcyk7XG4gICAgICAgIG1ldGFHZXQgPSBbJ0BnZXRNZXRhJ10uY29uY2F0KG1ldGFBcmdzKTtcbiAgICAgICAgdmFyIG1ldGFHZXRPckxvYWRpbmcgPSBbJ0BvcicsIG1ldGFHZXQsIFsnLy8vbG9hZGluZy8vLyddXTtcbiAgICAgICAgZGVmLmV2YWwubmVlZHNNZXRhLnB1c2goWydAaWYnLCBtZXRhR2V0LCBudWxsLCBtZXRhQXJnc10pO1xuICAgICAgICBkZWYuZXZhbFtjaG9pY2VzUHJvcE5hbWVdID0gbWV0YUdldE9yTG9hZGluZztcbiAgICAgICAgaWYgKGtleXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIC8vIFRlc3QgdGhhdCB3ZSBoYXZlIGFsbCBuZWVkZWQga2V5cy5cbiAgICAgICAgICBoaWRkZW5UZXN0ID0gWydAYW5kJ10uY29uY2F0KGtleXMubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIHJldHVybiBbJ0BnZXQnLCBrZXldO1xuICAgICAgICAgIH0pKTtcbiAgICAgICAgICAvLyBSZXZlcnNlIHRlc3Qgc28gd2UgaGlkZSBpZiBkb24ndCBoYXZlIGFsbCBrZXlzLlxuICAgICAgICAgIGhpZGRlblRlc3QgPSBbJ0Bub3QnLCBoaWRkZW5UZXN0XTtcbiAgICAgICAgICBpZiAoIWRlZi5ldmFsLmhpZGRlbikge1xuICAgICAgICAgICAgZGVmLmV2YWwuaGlkZGVuID0gaGlkZGVuVGVzdDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZGVsZXRlIGRlZltsb29rdXBQcm9wTmFtZV07XG4gICAgfVxuICB9O1xuXG4gIHBsdWdpbi5leHBvcnRzLmNvbXBpbGUgPSBmdW5jdGlvbiAoZGVmKSB7XG5cbiAgICBhZGRMb29rdXAoZGVmLCAnbG9va3VwJywgJ2Nob2ljZXMnKTtcbiAgICBhZGRMb29rdXAoZGVmLCAnbG9va3VwUmVwbGFjZW1lbnRzJywgJ3JlcGxhY2VDaG9pY2VzJyk7XG4gIH07XG59O1xuIiwiLy8gIyBjb21waWxlcnMucHJvcC1hbGlhc2VzXG5cbi8qXG5BbGlhcyBzb21lIHByb3BlcnRpZXMgdG8gb3RoZXIgcHJvcGVydGllcy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgdmFyIHByb3BBbGlhc2VzID0ge1xuICAgIGhlbHBfdGV4dDogJ2hlbHBUZXh0J1xuICB9O1xuXG4gIHBsdWdpbi5leHBvcnRzLmNvbXBpbGUgPSBmdW5jdGlvbiAoZGVmKSB7XG4gICAgT2JqZWN0LmtleXMocHJvcEFsaWFzZXMpLmZvckVhY2goZnVuY3Rpb24gKGFsaWFzKSB7XG4gICAgICB2YXIgcHJvcE5hbWUgPSBwcm9wQWxpYXNlc1thbGlhc107XG4gICAgICBpZiAodHlwZW9mIGRlZltwcm9wTmFtZV0gPT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBkZWZbYWxpYXNdICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBkZWZbcHJvcE5hbWVdID0gZGVmW2FsaWFzXTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbn07XG4iLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBpbGVycy50eXBlc1xuXG4vKlxuQ29udmVydCBzb21lIGhpZ2gtbGV2ZWwgdHlwZXMgdG8gbG93LWxldmVsIHR5cGVzIGFuZCBwcm9wZXJ0aWVzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgLy8gTWFwIGhpZ2gtbGV2ZWwgdHlwZSB0byBsb3ctbGV2ZWwgdHlwZS4gSWYgYSBmdW5jdGlvbiBpcyBzdXBwbGllZCwgY2FuXG4gIC8vIG1vZGlmeSB0aGUgZmllbGQgZGVmaW5pdGlvbi5cbiAgdmFyIHR5cGVDb2VyY2UgPSB7XG4gICAgdW5pY29kZTogZnVuY3Rpb24gKGRlZikge1xuICAgICAgZGVmLnR5cGUgPSAnc3RyaW5nJztcbiAgICAgIGRlZi5tYXhSb3dzID0gMTtcbiAgICB9LFxuICAgIHRleHQ6ICdzdHJpbmcnLFxuICAgIHNlbGVjdDogZnVuY3Rpb24gKGRlZikge1xuICAgICAgZGVmLmNob2ljZXMgPSBkZWYuY2hvaWNlcyB8fCBbXTtcbiAgICB9LFxuICAgIGJvb2w6ICdib29sZWFuJyxcbiAgICBkaWN0OiAnb2JqZWN0JyxcbiAgICBkZWNpbWFsOiAnbnVtYmVyJyxcbiAgICBpbnQ6ICdudW1iZXInXG4gIH07XG5cbiAgdHlwZUNvZXJjZS5zdHIgPSB0eXBlQ29lcmNlLnVuaWNvZGU7XG5cblxuICBwbHVnaW4uZXhwb3J0cy5jb21waWxlID0gZnVuY3Rpb24gKGRlZikge1xuXG4gICAgdmFyIGNvZXJjZVR5cGUgPSB0eXBlQ29lcmNlW2RlZi50eXBlXTtcbiAgICBpZiAoY29lcmNlVHlwZSkge1xuICAgICAgaWYgKF8uaXNTdHJpbmcoY29lcmNlVHlwZSkpIHtcbiAgICAgICAgZGVmLnR5cGUgPSBjb2VyY2VUeXBlO1xuICAgICAgfSBlbHNlIGlmIChfLmlzRnVuY3Rpb24oY29lcmNlVHlwZSkpIHtcbiAgICAgICAgZGVmID0gY29lcmNlVHlwZShkZWYpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50LmFkZC1pdGVtXG5cbi8qXG5UaGUgYWRkIGJ1dHRvbiB0byBhcHBlbmQgYW4gaXRlbSB0byBhIGZpZWxkLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGRpc3BsYXlOYW1lOiBwbHVnaW4ubmFtZSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZSxcbiAgICAgICAgbGFiZWw6IHBsdWdpbi5jb25maWdWYWx1ZSgnbGFiZWwnLCAnW2FkZF0nKVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gUi5zcGFuKHtjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lLCBvbkNsaWNrOiB0aGlzLnByb3BzLm9uQ2xpY2t9LCB0aGlzLnByb3BzLmxhYmVsKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQuY2hlY2tib3gtbGlzdFxuXG4vKlxuVXNlZCB3aXRoIGFycmF5IHZhbHVlcyB0byBzdXBwbHkgbXVsdGlwbGUgY2hlY2tib3hlcyBmb3IgYWRkaW5nIG11bHRpcGxlXG5lbnVtZXJhdGVkIHZhbHVlcyB0byBhbiBhcnJheS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGRpc3BsYXlOYW1lOiBwbHVnaW4ubmFtZSxcblxuICAgIG1peGluczogW3BsdWdpbi5yZXF1aXJlKCdtaXhpbi5maWVsZCcpXSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgb25DaGFuZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vIEdldCBhbGwgdGhlIGNoZWNrZWQgY2hlY2tib3hlcyBhbmQgY29udmVydCB0byBhbiBhcnJheSBvZiB2YWx1ZXMuXG4gICAgICB2YXIgY2hvaWNlTm9kZXMgPSB0aGlzLnJlZnMuY2hvaWNlcy5nZXRET01Ob2RlKCkuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2lucHV0Jyk7XG4gICAgICBjaG9pY2VOb2RlcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGNob2ljZU5vZGVzLCAwKTtcbiAgICAgIHZhciB2YWx1ZXMgPSBjaG9pY2VOb2Rlcy5tYXAoZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgcmV0dXJuIG5vZGUuY2hlY2tlZCA/IG5vZGUudmFsdWUgOiBudWxsO1xuICAgICAgfSkuZmlsdGVyKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9KTtcbiAgICAgIHRoaXMucHJvcHMuZmllbGQudmFsKHZhbHVlcyk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgICB2YXIgY2hvaWNlcyA9IGZpZWxkLmRlZi5jaG9pY2VzIHx8IFtdO1xuXG4gICAgICB2YXIgaXNJbmxpbmUgPSAhXy5maW5kKGNob2ljZXMsIGZ1bmN0aW9uIChjaG9pY2UpIHtcbiAgICAgICAgcmV0dXJuIGNob2ljZS5zYW1wbGU7XG4gICAgICB9KTtcblxuICAgICAgdmFyIHZhbHVlID0gZmllbGQudmFsdWUgfHwgW107XG5cbiAgICAgIHJldHVybiBwbHVnaW4uY29tcG9uZW50KCdmaWVsZCcpKHtcbiAgICAgICAgZmllbGQ6IGZpZWxkXG4gICAgICB9LFxuICAgICAgICBSLmRpdih7Y2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZSwgcmVmOiAnY2hvaWNlcyd9LFxuICAgICAgICAgIGNob2ljZXMubWFwKGZ1bmN0aW9uIChjaG9pY2UsIGkpIHtcblxuICAgICAgICAgICAgdmFyIGlucHV0RmllbGQgPSBSLnNwYW4oe3N0eWxlOiB7d2hpdGVTcGFjZTogJ25vd3JhcCd9fSxcbiAgICAgICAgICAgICAgUi5pbnB1dCh7XG4gICAgICAgICAgICAgICAgbmFtZTogZmllbGQuZGVmLmtleSxcbiAgICAgICAgICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBjaG9pY2UudmFsdWUsXG4gICAgICAgICAgICAgICAgY2hlY2tlZDogdmFsdWUuaW5kZXhPZihjaG9pY2UudmFsdWUpID49IDAgPyB0cnVlIDogZmFsc2UsXG4gICAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2VcbiAgICAgICAgICAgICAgICAvL29uRm9jdXM6IHRoaXMucHJvcHMuYWN0aW9ucy5mb2N1c1xuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgJyAnLFxuICAgICAgICAgICAgICBSLnNwYW4oe2NsYXNzTmFtZTogJ2ZpZWxkLWNob2ljZS1sYWJlbCd9LFxuICAgICAgICAgICAgICAgIGNob2ljZS5sYWJlbFxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBpZiAoaXNJbmxpbmUpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFIuc3Bhbih7a2V5OiBpLCBjbGFzc05hbWU6ICdmaWVsZC1jaG9pY2UnfSxcbiAgICAgICAgICAgICAgICBpbnB1dEZpZWxkLCAnICdcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiBSLmRpdih7a2V5OiBpLCBjbGFzc05hbWU6ICdmaWVsZC1jaG9pY2UnfSxcbiAgICAgICAgICAgICAgICBpbnB1dEZpZWxkLCAnICcsXG4gICAgICAgICAgICAgICAgcGx1Z2luLmNvbXBvbmVudCgnc2FtcGxlJykoe2ZpZWxkOiBmaWVsZCwgY2hvaWNlOiBjaG9pY2V9KVxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbnZhciBDU1NUcmFuc2l0aW9uR3JvdXAgPSBSZWFjdC5jcmVhdGVGYWN0b3J5KFJlYWN0LmFkZG9ucy5DU1NUcmFuc2l0aW9uR3JvdXApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIG1peGluczogW1xuICAgICAgLy9wbHVnaW4ucmVxdWlyZSgnbWl4aW4ucmVzaXplJyksXG4gICAgICAvL3BsdWdpbi5yZXF1aXJlKCdtaXhpbi5zY3JvbGwnKSxcbiAgICAgIHBsdWdpbi5yZXF1aXJlKCdtaXhpbi5jbGljay1vdXRzaWRlJylcbiAgICBdLFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBtYXhIZWlnaHQ6IG51bGwsXG4gICAgICAgIG9wZW46IHRoaXMucHJvcHMub3BlblxuICAgICAgfTtcbiAgICB9LFxuICAgIC8vXG4gICAgLy8gb25Ub2dnbGU6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyAgIHRoaXMuc2V0U3RhdGUoe29wZW46ICF0aGlzLnN0YXRlLm9wZW59KTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gb25DbG9zZTogZnVuY3Rpb24gKCkge1xuICAgIC8vICAgdGhpcy5zZXRTdGF0ZSh7b3BlbjogZmFsc2V9KTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gZml4Q2hvaWNlc1dpZHRoOiBmdW5jdGlvbiAoKSB7XG4gICAgLy8gICB0aGlzLnNldFN0YXRlKHtcbiAgICAvLyAgICAgY2hvaWNlc1dpZHRoOiB0aGlzLnJlZnMuYWN0aXZlLmdldERPTU5vZGUoKS5vZmZzZXRXaWR0aFxuICAgIC8vICAgfSk7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIG9uUmVzaXplV2luZG93OiBmdW5jdGlvbiAoKSB7XG4gICAgLy8gICB0aGlzLmZpeENob2ljZXNXaWR0aCgpO1xuICAgIC8vIH0sXG5cbiAgICAvLyBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgIC8vICAgdGhpcy5maXhDaG9pY2VzV2lkdGgoKTtcbiAgICAvLyAgIHRoaXMuc2V0T25DbGlja091dHNpZGUoJ3NlbGVjdCcsIHRoaXMub25DbG9zZSk7XG4gICAgLy8gfSxcblxuICAgIGdldElnbm9yZUNsb3NlTm9kZXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICghdGhpcy5wcm9wcy5pZ25vcmVDbG9zZU5vZGVzKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH1cbiAgICAgIHZhciBub2RlcyA9IHRoaXMucHJvcHMuaWdub3JlQ2xvc2VOb2RlcygpO1xuICAgICAgaWYgKCFfLmlzQXJyYXkobm9kZXMpKSB7XG4gICAgICAgIG5vZGVzID0gW25vZGVzXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBub2RlcztcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuc2V0T25DbGlja091dHNpZGUoJ2Nob2ljZXMnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblxuICAgICAgICAvLyBNYWtlIHN1cmUgd2UgZG9uJ3QgZmluZCBhbnkgbm9kZXMgdG8gaWdub3JlLlxuICAgICAgICBpZiAoIV8uZmluZCh0aGlzLmdldElnbm9yZUNsb3NlTm9kZXMoKSwgZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5pc05vZGVJbnNpZGUoZXZlbnQudGFyZ2V0LCBub2RlKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKSkge1xuICAgICAgICAgIHRoaXMucHJvcHMub25DbG9zZSgpO1xuICAgICAgICB9XG4gICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICB0aGlzLmFkanVzdFNpemUoKTtcbiAgICB9LFxuXG4gICAgb25TZWxlY3Q6IGZ1bmN0aW9uIChjaG9pY2UpIHtcbiAgICAgIHRoaXMucHJvcHMub25TZWxlY3QoY2hvaWNlLnZhbHVlKTtcbiAgICB9LFxuXG4gICAgb25SZXNpemVXaW5kb3c6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuYWRqdXN0U2l6ZSgpO1xuICAgIH0sXG5cbiAgICBvblNjcm9sbFdpbmRvdzogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5hZGp1c3RTaXplKCk7XG4gICAgfSxcblxuICAgIGFkanVzdFNpemU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLnJlZnMuY2hvaWNlcykge1xuICAgICAgICB2YXIgbm9kZSA9IHRoaXMucmVmcy5jaG9pY2VzLmdldERPTU5vZGUoKTtcbiAgICAgICAgdmFyIHJlY3QgPSBub2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICB2YXIgdG9wID0gcmVjdC50b3A7XG4gICAgICAgIHZhciB3aW5kb3dIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgICAgIHZhciBoZWlnaHQgPSB3aW5kb3dIZWlnaHQgLSB0b3A7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIG1heEhlaWdodDogaGVpZ2h0XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV4dFByb3BzKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtvcGVuOiBuZXh0UHJvcHMub3Blbn0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5hZGp1c3RTaXplKCk7XG4gICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0sXG5cbiAgICBvblNjcm9sbDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAvLyBjb25zb2xlLmxvZygnc3RvcCB0aGF0IScpXG4gICAgICAvLyBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgLy8gZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgfSxcblxuICAgIG9uV2hlZWw6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgLy8gZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIC8vIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgcmV0dXJuIFIuZGl2KHtyZWY6ICdjb250YWluZXInLCBvbldoZWVsOiB0aGlzLm9uV2hlZWwsIG9uU2Nyb2xsOiB0aGlzLm9uU2Nyb2xsLCBjbGFzc05hbWU6ICdjaG9pY2VzLWNvbnRhaW5lcicsIHN0eWxlOiB7XG4gICAgICAgIHVzZXJTZWxlY3Q6ICdub25lJywgV2Via2l0VXNlclNlbGVjdDogJ25vbmUnLCBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgbWF4SGVpZ2h0OiB0aGlzLnN0YXRlLm1heEhlaWdodCA/IHRoaXMuc3RhdGUubWF4SGVpZ2h0IDogbnVsbFxuICAgICAgfX0sXG4gICAgICAgIENTU1RyYW5zaXRpb25Hcm91cCh7dHJhbnNpdGlvbk5hbWU6ICdyZXZlYWwnfSxcbiAgICAgICAgICB0aGlzLnByb3BzLm9wZW4gPyBSLnVsKHtyZWY6ICdjaG9pY2VzJywgY2xhc3NOYW1lOiAnY2hvaWNlcyd9LFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5jaG9pY2VzLm1hcChmdW5jdGlvbiAoY2hvaWNlLCBpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBSLmxpKHtrZXk6IGksIGNsYXNzTmFtZTogJ2Nob2ljZSd9LFxuICAgICAgICAgICAgICAgIGNob2ljZS52YWx1ZSA9PT0gJy8vL2xvYWRpbmcvLy8nID9cbiAgICAgICAgICAgICAgICAgIFIuYSh7aHJlZjogJ0phdmFTY3JpcHQnICsgJzonLCBvbkNsaWNrOiB0aGlzLnByb3BzLm9uQ2xvc2V9LFxuICAgICAgICAgICAgICAgICAgICBSLnNwYW4oe2NsYXNzTmFtZTogJ2Nob2ljZS1sYWJlbCd9LFxuICAgICAgICAgICAgICAgICAgICAgICdMb2FkaW5nLi4uJ1xuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICApIDpcbiAgICAgICAgICAgICAgICAgIFIuYSh7aHJlZjogJ0phdmFTY3JpcHQnICsgJzonLCBvbkNsaWNrOiB0aGlzLm9uU2VsZWN0LmJpbmQodGhpcywgY2hvaWNlKX0sXG4gICAgICAgICAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAnY2hvaWNlLWxhYmVsJ30sXG4gICAgICAgICAgICAgICAgICAgICAgY2hvaWNlLmxhYmVsXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAnY2hvaWNlLXNhbXBsZSd9LFxuICAgICAgICAgICAgICAgICAgICAgIGNob2ljZS5zYW1wbGVcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICAgICkgOiBudWxsXG4gICAgICAgIClcbiAgICAgICk7XG5cblxuICAgICAgLy8gdmFyIGNsYXNzTmFtZSA9IGZvcm1hdGljLmNsYXNzTmFtZSgnZHJvcGRvd24tZmllbGQnLCBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZSwgdGhpcy5wcm9wcy5maWVsZC5jbGFzc05hbWUpO1xuICAgICAgLy9cbiAgICAgIC8vIHZhciBzZWxlY3RlZExhYmVsID0gJyc7XG4gICAgICAvLyB2YXIgbWF0Y2hpbmdMYWJlbHMgPSB0aGlzLnByb3BzLmZpZWxkLmNob2ljZXMuZmlsdGVyKGZ1bmN0aW9uIChjaG9pY2UpIHtcbiAgICAgIC8vICAgcmV0dXJuIGNob2ljZS52YWx1ZSA9PT0gdGhpcy5wcm9wcy5maWVsZC52YWx1ZTtcbiAgICAgIC8vIH0uYmluZCh0aGlzKSk7XG4gICAgICAvLyBpZiAobWF0Y2hpbmdMYWJlbHMubGVuZ3RoID4gMCkge1xuICAgICAgLy8gICBzZWxlY3RlZExhYmVsID0gbWF0Y2hpbmdMYWJlbHNbMF0ubGFiZWw7XG4gICAgICAvLyB9XG4gICAgICAvLyBzZWxlY3RlZExhYmVsID0gc2VsZWN0ZWRMYWJlbCB8fCAnXFx1MDBhMCc7XG4gICAgICAvL1xuICAgICAgLy8gcmV0dXJuIFIuZGl2KF8uZXh0ZW5kKHtjbGFzc05hbWU6IGNsYXNzTmFtZSwgcmVmOiAnc2VsZWN0J30sIHBsdWdpbi5jb25maWcuYXR0cmlidXRlcyksXG4gICAgICAvLyAgIFIuZGl2KHtjbGFzc05hbWU6ICdmaWVsZC12YWx1ZScsIHJlZjogJ2FjdGl2ZScsIG9uQ2xpY2s6IHRoaXMub25Ub2dnbGV9LCBzZWxlY3RlZExhYmVsKSxcbiAgICAgIC8vICAgUi5kaXYoe2NsYXNzTmFtZTogJ2ZpZWxkLXRvZ2dsZSAnICsgKHRoaXMuc3RhdGUub3BlbiA/ICdmaWVsZC1vcGVuJyA6ICdmaWVsZC1jbG9zZWQnKSwgb25DbGljazogdGhpcy5vblRvZ2dsZX0pLFxuICAgICAgLy8gICBSZWFjdC5hZGRvbnMuQ1NTVHJhbnNpdGlvbkdyb3VwKHt0cmFuc2l0aW9uTmFtZTogJ3JldmVhbCd9LFxuICAgICAgLy8gICAgIFIuZGl2KHtjbGFzc05hbWU6ICdmaWVsZC1jaG9pY2VzLWNvbnRhaW5lcid9LFxuICAgICAgLy8gICAgICAgdGhpcy5zdGF0ZS5vcGVuID8gUi51bCh7cmVmOiAnY2hvaWNlcycsIGNsYXNzTmFtZTogJ2ZpZWxkLWNob2ljZXMnLCBzdHlsZToge3dpZHRoOiB0aGlzLnN0YXRlLmNob2ljZXNXaWR0aH19LFxuICAgICAgLy8gICAgICAgICB0aGlzLnByb3BzLmZpZWxkLmNob2ljZXMubWFwKGZ1bmN0aW9uIChjaG9pY2UpIHtcbiAgICAgIC8vICAgICAgICAgICByZXR1cm4gUi5saSh7XG4gICAgICAvLyAgICAgICAgICAgICBjbGFzc05hbWU6ICdmaWVsZC1jaG9pY2UnLFxuICAgICAgLy8gICAgICAgICAgICAgb25DbGljazogZnVuY3Rpb24gKCkge1xuICAgICAgLy8gICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtvcGVuOiBmYWxzZX0pO1xuICAgICAgLy8gICAgICAgICAgICAgICB0aGlzLnByb3BzLmZvcm0uYWN0aW9ucy5jaGFuZ2UodGhpcy5wcm9wcy5maWVsZCwgY2hvaWNlLnZhbHVlKTtcbiAgICAgIC8vICAgICAgICAgICAgIH0uYmluZCh0aGlzKVxuICAgICAgLy8gICAgICAgICAgIH0sIGNob2ljZS5sYWJlbCk7XG4gICAgICAvLyAgICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgIC8vICAgICAgICkgOiBbXVxuICAgICAgLy8gICAgIClcbiAgICAgIC8vICAgKVxuICAgICAgLy8gKTtcbiAgICB9XG4gIH0pO1xufTtcblxuXG4vLyBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuLy8gICB0aGlzLnNldE9uQ2xpY2tPdXRzaWRlKCdjaG9pY2VzJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4vL1xuLy8gICAgIC8vIE1ha2Ugc3VyZSB3ZSBkb24ndCBmaW5kIGFueSBub2RlcyB0byBpZ25vcmUuXG4vLyAgICAgaWYgKCFfLmZpbmQodGhpcy5nZXRJZ25vcmVDbG9zZU5vZGVzKCksIGZ1bmN0aW9uIChub2RlKSB7XG4vLyAgICAgICBjb25zb2xlLmxvZyhub2RlLCBldmVudC50YXJnZXQpXG4vLyAgICAgICByZXR1cm4gIXRoaXMuaXNOb2RlT3V0c2lkZShub2RlLCBldmVudC50YXJnZXQpO1xuLy8gICAgIH0uYmluZCh0aGlzKSkpIHtcbi8vICAgICAgIGNvbnNvbGUubG9nKFwiaG93Pz8/XCIpXG4vLyAgICAgICB0aGlzLnByb3BzLm9uQ2xvc2UoKTtcbi8vICAgICB9XG4vLyAgIH0uYmluZCh0aGlzKSk7XG4vLyB9LFxuLy9cbi8vIG9uU2VsZWN0OiBmdW5jdGlvbiAoY2hvaWNlKSB7XG4vLyAgIHRoaXMucHJvcHMub25TZWxlY3QoY2hvaWNlLnZhbHVlKTtcbi8vIH0sXG4vL1xuLy8gcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4vL1xuLy8gICByZXR1cm4gUi5kaXYoe3JlZjogJ2NvbnRhaW5lcicsIGNsYXNzTmFtZTogJ2Nob2ljZXMtY29udGFpbmVyJywgc3R5bGU6IHt1c2VyU2VsZWN0OiAnbm9uZScsIFdlYmtpdFVzZXJTZWxlY3Q6ICdub25lJywgcG9zaXRpb246ICdhYnNvbHV0ZSd9fSxcbi8vICAgICB0aGlzLnByb3BzLm9wZW4gP1xuLy8gICAgICAgQ1NTVHJhbnNpdGlvbkdyb3VwKHt0cmFuc2l0aW9uTmFtZTogJ3JldmVhbCd9LFxuLy8gICAgICAgICBSLnVsKHtyZWY6ICdjaG9pY2VzJywgY2xhc3NOYW1lOiAnY2hvaWNlcyd9LFxuLy8gICAgICAgICAgIHRoaXMucHJvcHMuY2hvaWNlcy5tYXAoZnVuY3Rpb24gKGNob2ljZSwgaSkge1xuLy8gICAgICAgICAgICAgcmV0dXJuIFIubGkoe2tleTogaSwgY2xhc3NOYW1lOiAnY2hvaWNlJ30sXG4vLyAgICAgICAgICAgICAgIFIuYSh7aHJlZjogJ0phdmFTY3JpcHQ6JyArICcnLCBvbkNsaWNrOiB0aGlzLm9uU2VsZWN0LmJpbmQodGhpcywgY2hvaWNlKX0sXG4vLyAgICAgICAgICAgICAgICAgUi5zcGFuKHtjbGFzc05hbWU6ICdjaG9pY2UtbGFiZWwnfSxcbi8vICAgICAgICAgICAgICAgICAgIGNob2ljZS5sYWJlbFxuLy8gICAgICAgICAgICAgICAgICksXG4vLyAgICAgICAgICAgICAgICAgUi5zcGFuKHtjbGFzc05hbWU6ICdjaG9pY2Utc2FtcGxlJ30sXG4vLyAgICAgICAgICAgICAgICAgICBjaG9pY2Uuc2FtcGxlXG4vLyAgICAgICAgICAgICAgICAgKVxuLy8gICAgICAgICAgICAgICApXG4vLyAgICAgICAgICAgICApO1xuLy8gICAgICAgICAgIH0uYmluZCh0aGlzKSlcbi8vICAgICAgICAgKVxuLy8gICAgICAgKVxuLy8gICAgICAgOiBudWxsXG4vLyAgICk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50LmZpZWxkXG5cbi8qXG5Vc2VkIGJ5IGFueSBmaWVsZHMgdG8gcHV0IHRoZSBsYWJlbCBhbmQgaGVscCB0ZXh0IGFyb3VuZCB0aGUgZmllbGQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxudmFyIENTU1RyYW5zaXRpb25Hcm91cCA9IFJlYWN0LmNyZWF0ZUZhY3RvcnkoUmVhY3QuYWRkb25zLkNTU1RyYW5zaXRpb25Hcm91cCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZGlzcGxheU5hbWU6IHBsdWdpbi5uYW1lLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNvbGxhcHNlZDogdGhpcy5wcm9wcy5maWVsZC5kZWYuY29sbGFwc2VkID8gdHJ1ZSA6IGZhbHNlXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBpc0NvbGxhcHNpYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgICByZXR1cm4gIV8uaXNVbmRlZmluZWQoZmllbGQuZGVmLmNvbGxhcHNlZCkgfHwgIV8uaXNVbmRlZmluZWQoZmllbGQuZGVmLmNvbGxhcHNpYmxlKTtcbiAgICB9LFxuXG4gICAgb25DbGlja0xhYmVsOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgY29sbGFwc2VkOiAhdGhpcy5zdGF0ZS5jb2xsYXBzZWRcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgICAgdmFyIGluZGV4ID0gdGhpcy5wcm9wcy5pbmRleDtcbiAgICAgIGlmICghXy5pc051bWJlcihpbmRleCkpIHtcbiAgICAgICAgaW5kZXggPSBfLmlzTnVtYmVyKGZpZWxkLmRlZi5rZXkpID8gZmllbGQuZGVmLmtleSA6IHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lLCBzdHlsZToge2Rpc3BsYXk6IChmaWVsZC5oaWRkZW4oKSA/ICdub25lJyA6ICcnKX19LFxuICAgICAgICBwbHVnaW4uY29tcG9uZW50KCdsYWJlbCcpKHtmaWVsZDogZmllbGQsIGluZGV4OiBpbmRleCwgb25DbGljazogdGhpcy5pc0NvbGxhcHNpYmxlKCkgPyB0aGlzLm9uQ2xpY2tMYWJlbCA6IG51bGx9KSxcbiAgICAgICAgQ1NTVHJhbnNpdGlvbkdyb3VwKHt0cmFuc2l0aW9uTmFtZTogJ3JldmVhbCd9LFxuICAgICAgICAgIHRoaXMuc3RhdGUuY29sbGFwc2VkID8gW10gOiBbXG4gICAgICAgICAgICBwbHVnaW4uY29tcG9uZW50KCdoZWxwJykoe2tleTogJ2hlbHAnLCBmaWVsZDogZmllbGR9KSxcbiAgICAgICAgICAgIHRoaXMucHJvcHMuY2hpbGRyZW5cbiAgICAgICAgICBdXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50LmZpZWxkc2V0XG5cbi8qXG5SZW5kZXIgbXVsdGlwbGUgY2hpbGQgZmllbGRzIGZvciBhIGZpZWxkLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGRpc3BsYXlOYW1lOiBwbHVnaW4ubmFtZSxcblxuICAgIG1peGluczogW3BsdWdpbi5yZXF1aXJlKCdtaXhpbi5maWVsZCcpXSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgICByZXR1cm4gcGx1Z2luLmNvbXBvbmVudCgnZmllbGQnKSh7XG4gICAgICAgIGZpZWxkOiBmaWVsZFxuICAgICAgfSxcbiAgICAgICAgUi5maWVsZHNldCh7Y2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZX0sXG4gICAgICAgICAgZmllbGQuZmllbGRzKCkubWFwKGZ1bmN0aW9uIChmaWVsZCwgaSkge1xuICAgICAgICAgICAgcmV0dXJuIGZpZWxkLmNvbXBvbmVudCh7a2V5OiBmaWVsZC5kZWYua2V5IHx8IGl9KTtcbiAgICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50LmZvcm1hdGljXG5cbi8qXG5Ub3AtbGV2ZWwgY29tcG9uZW50IHdoaWNoIGdldHMgYSBmb3JtIGFuZCB0aGVuIGxpc3RlbnMgdG8gdGhlIGZvcm0gZm9yIGNoYW5nZXMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZGlzcGxheU5hbWU6IHBsdWdpbi5uYW1lLFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBmaWVsZDogdGhpcy5wcm9wcy5mb3JtLmZpZWxkKClcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBmb3JtID0gdGhpcy5wcm9wcy5mb3JtO1xuICAgICAgZm9ybS5vbignY2hhbmdlJywgdGhpcy5vbkZvcm1DaGFuZ2VkKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBmb3JtID0gdGhpcy5wcm9wcy5mb3JtO1xuICAgICAgZm9ybS5vZmYoJ2NoYW5nZScsIHRoaXMub25Gb3JtQ2hhbmdlZCk7XG4gICAgfSxcblxuICAgIG9uRm9ybUNoYW5nZWQ6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgaWYgKHRoaXMucHJvcHMub25DaGFuZ2UpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZSh0aGlzLnByb3BzLmZvcm0udmFsKCksIGV2ZW50LmNoYW5naW5nKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBmaWVsZDogdGhpcy5wcm9wcy5mb3JtLmZpZWxkKClcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiAnZm9ybWF0aWMnfSxcbiAgICAgICAgdGhpcy5zdGF0ZS5maWVsZC5jb21wb25lbnQoKVxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQuaGVscFxuXG4vKlxuSnVzdCB0aGUgaGVscCB0ZXh0IGJsb2NrLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGRpc3BsYXlOYW1lOiBwbHVnaW4ubmFtZSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICAgIHJldHVybiBmaWVsZC5kZWYuaGVscFRleHQgP1xuICAgICAgICBSLmRpdih7Y2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZX0sXG4gICAgICAgICAgZmllbGQuZGVmLmhlbHBUZXh0XG4gICAgICAgICkgOlxuICAgICAgICBSLnNwYW4obnVsbCk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50Lml0ZW0tY2hvaWNlc1xuXG4vKlxuR2l2ZSBhIGxpc3Qgb2YgY2hvaWNlcyBvZiBpdGVtIHR5cGVzIHRvIGNyZWF0ZSBhcyBjaGlsZHJlbiBvZiBhbiBmaWVsZC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIHRoaXMucHJvcHMub25TZWxlY3QocGFyc2VJbnQoZXZlbnQudGFyZ2V0LnZhbHVlKSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgICB2YXIgdHlwZUNob2ljZXMgPSBudWxsO1xuICAgICAgaWYgKGZpZWxkLml0ZW1zKCkubGVuZ3RoID4gMCkge1xuICAgICAgICB0eXBlQ2hvaWNlcyA9IFIuc2VsZWN0KHtjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lLCB2YWx1ZTogdGhpcy52YWx1ZSwgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2V9LFxuICAgICAgICAgIGZpZWxkLml0ZW1zKCkubWFwKGZ1bmN0aW9uIChpdGVtLCBpKSB7XG4gICAgICAgICAgICByZXR1cm4gUi5vcHRpb24oe2tleTogaSwgdmFsdWU6IGl9LCBpdGVtLmxhYmVsIHx8IGkpO1xuICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0eXBlQ2hvaWNlcyA/IHR5cGVDaG9pY2VzIDogUi5zcGFuKG51bGwpO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC5qc29uXG5cbi8qXG5UZXh0YXJlYSBlZGl0b3IgZm9yIEpTT04uIFdpbGwgdmFsaWRhdGUgdGhlIEpTT04gYmVmb3JlIHNldHRpbmcgdGhlIHZhbHVlLCBzb1xud2hpbGUgdGhlIHZhbHVlIGlzIGludmFsaWQsIG5vIGV4dGVybmFsIHN0YXRlIGNoYW5nZXMgd2lsbCBvY2N1ci5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBtaXhpbnM6IFtwbHVnaW4ucmVxdWlyZSgnbWl4aW4uZmllbGQnKV0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWUsXG4gICAgICAgIHJvd3M6IHBsdWdpbi5jb25maWcucm93cyB8fCA1XG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBpc1ZhbGlkVmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuXG4gICAgICB0cnkge1xuICAgICAgICBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpc1ZhbGlkOiB0cnVlLFxuICAgICAgICB2YWx1ZTogSlNPTi5zdHJpbmdpZnkodGhpcy5wcm9wcy5maWVsZC52YWx1ZSwgbnVsbCwgMilcbiAgICAgIH07XG4gICAgfSxcblxuICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIHZhciBpc1ZhbGlkID0gdGhpcy5pc1ZhbGlkVmFsdWUoZXZlbnQudGFyZ2V0LnZhbHVlKTtcblxuICAgICAgaWYgKGlzVmFsaWQpIHtcbiAgICAgICAgLy8gTmVlZCB0byBoYW5kbGUgdGhpcyBiZXR0ZXIuIE5lZWQgdG8gdHJhY2sgcG9zaXRpb24uXG4gICAgICAgIHRoaXMuX2lzQ2hhbmdpbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLnByb3BzLmZpZWxkLnZhbChKU09OLnBhcnNlKGV2ZW50LnRhcmdldC52YWx1ZSkpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgaXNWYWxpZDogaXNWYWxpZCxcbiAgICAgICAgdmFsdWU6IGV2ZW50LnRhcmdldC52YWx1ZVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXh0UHJvcHMpIHtcbiAgICAgIGlmICghdGhpcy5faXNDaGFuZ2luZykge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBpc1ZhbGlkOiB0cnVlLFxuICAgICAgICAgIHZhbHVlOiBKU09OLnN0cmluZ2lmeShuZXh0UHJvcHMuZmllbGQudmFsdWUsIG51bGwsIDIpXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgdGhpcy5faXNDaGFuZ2luZyA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgICAgcmV0dXJuIHBsdWdpbi5jb21wb25lbnQoJ2ZpZWxkJykoe1xuICAgICAgICBmaWVsZDogZmllbGRcbiAgICAgIH0sIFIudGV4dGFyZWEoe1xuICAgICAgICAgIGNsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWUsXG4gICAgICAgICAgdmFsdWU6IHRoaXMuc3RhdGUudmFsdWUsXG4gICAgICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsXG4gICAgICAgICAgc3R5bGU6IHtiYWNrZ3JvdW5kQ29sb3I6IHRoaXMuc3RhdGUuaXNWYWxpZCA/ICcnIDogJ3JnYigyNTUsMjAwLDIwMCknfSxcbiAgICAgICAgICByb3dzOiBmaWVsZC5kZWYucm93cyB8fCB0aGlzLnByb3BzLnJvd3NcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50LmxhYmVsXG5cbi8qXG5KdXN0IHRoZSBsYWJlbCBmb3IgYSBmaWVsZC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgICB2YXIgbGFiZWwgPSBudWxsO1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLnByb3BzLmluZGV4ID09PSAnbnVtYmVyJykge1xuICAgICAgICBsYWJlbCA9ICcnICsgKHRoaXMucHJvcHMuaW5kZXggKyAxKSArICcuJztcbiAgICAgICAgaWYgKGZpZWxkLmRlZi5sYWJlbCkge1xuICAgICAgICAgIGxhYmVsID0gbGFiZWwgKyAnICcgKyBmaWVsZC5kZWYubGFiZWw7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGZpZWxkLmRlZi5sYWJlbCB8fCBsYWJlbCkge1xuICAgICAgICB2YXIgdGV4dCA9IGxhYmVsIHx8IGZpZWxkLmRlZi5sYWJlbDtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25DbGljaykge1xuICAgICAgICAgIHRleHQgPSBSLmEoe2hyZWY6ICdKYXZhU2NyaXB0JyArICc6Jywgb25DbGljazogdGhpcy5wcm9wcy5vbkNsaWNrfSwgdGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgbGFiZWwgPSBSLmxhYmVsKHt9LCB0ZXh0KTtcbiAgICAgIH1cblxuICAgICAgdmFyIHJlcXVpcmVkID0gUi5zcGFuKHtjbGFzc05hbWU6ICdyZXF1aXJlZC10ZXh0J30pO1xuXG4gICAgICByZXR1cm4gUi5kaXYoe1xuICAgICAgICBjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lXG4gICAgICB9LFxuICAgICAgICBsYWJlbCxcbiAgICAgICAgJyAnLFxuICAgICAgICByZXF1aXJlZFxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQubGlzdC1jb250cm9sXG5cbi8qXG5SZW5kZXIgdGhlIGl0ZW0gdHlwZSBjaG9pY2VzIGFuZCB0aGUgYWRkIGJ1dHRvbi5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaXRlbUluZGV4OiAwXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBvblNlbGVjdDogZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgaXRlbUluZGV4OiBpbmRleFxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIG9uQXBwZW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnByb3BzLm9uQXBwZW5kKHRoaXMuc3RhdGUuaXRlbUluZGV4KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICAgIHZhciB0eXBlQ2hvaWNlcyA9IG51bGw7XG5cbiAgICAgIGlmIChmaWVsZC5pdGVtcygpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdHlwZUNob2ljZXMgPSBwbHVnaW4uY29tcG9uZW50KCdpdGVtLWNob2ljZXMnKSh7ZmllbGQ6IGZpZWxkLCB2YWx1ZTogdGhpcy5zdGF0ZS5pdGVtSW5kZXgsIG9uU2VsZWN0OiB0aGlzLm9uU2VsZWN0fSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZX0sXG4gICAgICAgIHR5cGVDaG9pY2VzLCAnICcsXG4gICAgICAgIHBsdWdpbi5jb21wb25lbnQoJ2FkZC1pdGVtJykoe29uQ2xpY2s6IHRoaXMub25BcHBlbmR9KVxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQubGlzdC1pdGVtLWNvbnRyb2xcblxuLypcblJlbmRlciB0aGUgcmVtb3ZlIGFuZCBtb3ZlIGJ1dHRvbnMgZm9yIGEgZmllbGQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZGlzcGxheU5hbWU6IHBsdWdpbi5uYW1lLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBvbk1vdmVCYWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnByb3BzLm9uTW92ZSh0aGlzLnByb3BzLmluZGV4LCB0aGlzLnByb3BzLmluZGV4IC0gMSk7XG4gICAgfSxcblxuICAgIG9uTW92ZUZvcndhcmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMucHJvcHMub25Nb3ZlKHRoaXMucHJvcHMuaW5kZXgsIHRoaXMucHJvcHMuaW5kZXggKyAxKTtcbiAgICB9LFxuXG4gICAgb25SZW1vdmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMucHJvcHMub25SZW1vdmUodGhpcy5wcm9wcy5pbmRleCk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lfSxcbiAgICAgICAgcGx1Z2luLmNvbXBvbmVudCgncmVtb3ZlLWl0ZW0nKSh7ZmllbGQ6IGZpZWxkLCBvbkNsaWNrOiB0aGlzLm9uUmVtb3ZlfSksXG4gICAgICAgIHRoaXMucHJvcHMuaW5kZXggPiAwID8gcGx1Z2luLmNvbXBvbmVudCgnbW92ZS1pdGVtLWJhY2snKSh7b25DbGljazogdGhpcy5vbk1vdmVCYWNrfSkgOiBudWxsLFxuICAgICAgICB0aGlzLnByb3BzLmluZGV4IDwgKHRoaXMucHJvcHMubnVtSXRlbXMgLSAxKSA/IHBsdWdpbi5jb21wb25lbnQoJ21vdmUtaXRlbS1mb3J3YXJkJykoe29uQ2xpY2s6IHRoaXMub25Nb3ZlRm9yd2FyZH0pIDogbnVsbFxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQubGlzdC1pdGVtLXZhbHVlXG5cbi8qXG5SZW5kZXIgdGhlIHZhbHVlIG9mIGEgbGlzdCBpdGVtLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGRpc3BsYXlOYW1lOiBwbHVnaW4ubmFtZSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWV9LFxuICAgICAgICBmaWVsZC5jb21wb25lbnQoKVxuICAgICAgICAvLyBwbHVnaW4uY29tcG9uZW50KCdmaWVsZCcpKHtcbiAgICAgICAgLy8gICBmaWVsZDogZmllbGQsXG4gICAgICAgIC8vICAgaW5kZXg6IHRoaXMucHJvcHMuaW5kZXhcbiAgICAgICAgLy8gfSxcbiAgICAgICAgLy8gICBmaWVsZC5jb21wb25lbnQoKVxuICAgICAgICAvLyApXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC5saXN0LWl0ZW1cblxuLypcblJlbmRlciBhIGxpc3QgaXRlbS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lfSxcbiAgICAgICAgcGx1Z2luLmNvbXBvbmVudCgnbGlzdC1pdGVtLXZhbHVlJykoe2Zvcm06IHRoaXMucHJvcHMuZm9ybSwgZmllbGQ6IGZpZWxkLCBpbmRleDogdGhpcy5wcm9wcy5pbmRleH0pLFxuICAgICAgICBwbHVnaW4uY29tcG9uZW50KCdsaXN0LWl0ZW0tY29udHJvbCcpKHtmaWVsZDogZmllbGQsIGluZGV4OiB0aGlzLnByb3BzLmluZGV4LCBudW1JdGVtczogdGhpcy5wcm9wcy5udW1JdGVtcywgb25Nb3ZlOiB0aGlzLnByb3BzLm9uTW92ZSwgb25SZW1vdmU6IHRoaXMucHJvcHMub25SZW1vdmV9KVxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQubGlzdFxuXG4vKlxuUmVuZGVyIGEgbGlzdC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxudmFyIENTU1RyYW5zaXRpb25Hcm91cCA9IFJlYWN0LmNyZWF0ZUZhY3RvcnkoUmVhY3QuYWRkb25zLkNTU1RyYW5zaXRpb25Hcm91cCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZGlzcGxheU5hbWU6IHBsdWdpbi5uYW1lLFxuXG4gICAgbWl4aW5zOiBbcGx1Z2luLnJlcXVpcmUoJ21peGluLmZpZWxkJyldLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBuZXh0TG9va3VwSWQ6IDAsXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgLy8gTmVlZCB0byBjcmVhdGUgYXJ0aWZpY2lhbCBrZXlzIGZvciB0aGUgYXJyYXkuIEluZGV4ZXMgYXJlIG5vdCBnb29kIGtleXMsXG4gICAgICAvLyBzaW5jZSB0aGV5IGNoYW5nZS4gU28sIG1hcCBlYWNoIHBvc2l0aW9uIHRvIGFuIGFydGlmaWNpYWwga2V5XG4gICAgICB2YXIgbG9va3VwcyA9IFtdO1xuICAgICAgdGhpcy5wcm9wcy5maWVsZC5maWVsZHMoKS5mb3JFYWNoKGZ1bmN0aW9uIChmaWVsZCwgaSkge1xuICAgICAgICBsb29rdXBzW2ldID0gJ18nICsgdGhpcy5uZXh0TG9va3VwSWQ7XG4gICAgICAgIHRoaXMubmV4dExvb2t1cElkKys7XG4gICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBsb29rdXBzOiBsb29rdXBzXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV3UHJvcHMpIHtcblxuICAgICAgdmFyIGxvb2t1cHMgPSB0aGlzLnN0YXRlLmxvb2t1cHM7XG4gICAgICB2YXIgZmllbGRzID0gbmV3UHJvcHMuZmllbGQuZmllbGRzKCk7XG5cbiAgICAgIC8vIE5lZWQgdG8gc2V0IGFydGlmaWNpYWwga2V5cyBmb3IgbmV3IGFycmF5IGl0ZW1zLlxuICAgICAgaWYgKGZpZWxkcy5sZW5ndGggPiBsb29rdXBzLmxlbmd0aCkge1xuICAgICAgICBmb3IgKHZhciBpID0gbG9va3Vwcy5sZW5ndGg7IGkgPCBmaWVsZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBsb29rdXBzW2ldID0gJ18nICsgdGhpcy5uZXh0TG9va3VwSWQ7XG4gICAgICAgICAgdGhpcy5uZXh0TG9va3VwSWQrKztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgbG9va3VwczogbG9va3Vwc1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIG9uQXBwZW5kOiBmdW5jdGlvbiAoaXRlbUluZGV4KSB7XG4gICAgICB0aGlzLnByb3BzLmZpZWxkLmFwcGVuZChpdGVtSW5kZXgpO1xuICAgIH0sXG4gICAgLy9cbiAgICAvLyBvbkNsaWNrTGFiZWw6IGZ1bmN0aW9uIChpKSB7XG4gICAgLy8gICBpZiAodGhpcy5wcm9wcy5maWVsZC5jb2xsYXBzYWJsZUl0ZW1zKSB7XG4gICAgLy8gICAgIHZhciBjb2xsYXBzZWQ7XG4gICAgLy8gICAgIC8vIGlmICghdGhpcy5zdGF0ZS5jb2xsYXBzZWRbaV0pIHtcbiAgICAvLyAgICAgLy8gICBjb2xsYXBzZWQgPSB0aGlzLnN0YXRlLmNvbGxhcHNlZDtcbiAgICAvLyAgICAgLy8gICBjb2xsYXBzZWRbaV0gPSB0cnVlO1xuICAgIC8vICAgICAvLyAgIHRoaXMuc2V0U3RhdGUoe2NvbGxhcHNlZDogY29sbGFwc2VkfSk7XG4gICAgLy8gICAgIC8vIH0gZWxzZSB7XG4gICAgLy8gICAgIC8vICAgY29sbGFwc2VkID0gdGhpcy5wcm9wcy5maWVsZC5maWVsZHMubWFwKGZ1bmN0aW9uICgpIHtcbiAgICAvLyAgICAgLy8gICAgIHJldHVybiB0cnVlO1xuICAgIC8vICAgICAvLyAgIH0pO1xuICAgIC8vICAgICAvLyAgIGNvbGxhcHNlZFtpXSA9IGZhbHNlO1xuICAgIC8vICAgICAvLyAgIHRoaXMuc2V0U3RhdGUoe2NvbGxhcHNlZDogY29sbGFwc2VkfSk7XG4gICAgLy8gICAgIC8vIH1cbiAgICAvLyAgICAgY29sbGFwc2VkID0gdGhpcy5zdGF0ZS5jb2xsYXBzZWQ7XG4gICAgLy8gICAgIGNvbGxhcHNlZFtpXSA9ICFjb2xsYXBzZWRbaV07XG4gICAgLy8gICAgIHRoaXMuc2V0U3RhdGUoe2NvbGxhcHNlZDogY29sbGFwc2VkfSk7XG4gICAgLy8gICB9XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIG9uUmVtb3ZlOiBmdW5jdGlvbiAoaSkge1xuICAgICAgdmFyIGxvb2t1cHMgPSB0aGlzLnN0YXRlLmxvb2t1cHM7XG4gICAgICBsb29rdXBzLnNwbGljZShpLCAxKTtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBsb29rdXBzOiBsb29rdXBzXG4gICAgICB9KTtcbiAgICAgIHRoaXMucHJvcHMuZmllbGQucmVtb3ZlKGkpO1xuICAgIH0sXG4gICAgLy9cbiAgICBvbk1vdmU6IGZ1bmN0aW9uIChmcm9tSW5kZXgsIHRvSW5kZXgpIHtcbiAgICAgIHZhciBsb29rdXBzID0gdGhpcy5zdGF0ZS5sb29rdXBzO1xuICAgICAgdmFyIGZyb21JZCA9IGxvb2t1cHNbZnJvbUluZGV4XTtcbiAgICAgIHZhciB0b0lkID0gbG9va3Vwc1t0b0luZGV4XTtcbiAgICAgIGxvb2t1cHNbZnJvbUluZGV4XSA9IHRvSWQ7XG4gICAgICBsb29rdXBzW3RvSW5kZXhdID0gZnJvbUlkO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGxvb2t1cHM6IGxvb2t1cHNcbiAgICAgIH0pO1xuICAgICAgdGhpcy5wcm9wcy5maWVsZC5tb3ZlKGZyb21JbmRleCwgdG9JbmRleCk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuICAgICAgdmFyIGZpZWxkcyA9IGZpZWxkLmZpZWxkcygpO1xuXG4gICAgICB2YXIgbnVtSXRlbXMgPSBmaWVsZHMubGVuZ3RoO1xuICAgICAgcmV0dXJuIHBsdWdpbi5jb21wb25lbnQoJ2ZpZWxkJykoe1xuICAgICAgICBmaWVsZDogZmllbGRcbiAgICAgIH0sXG4gICAgICAgIFIuZGl2KHtjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lfSxcbiAgICAgICAgICBDU1NUcmFuc2l0aW9uR3JvdXAoe3RyYW5zaXRpb25OYW1lOiAncmV2ZWFsJ30sXG4gICAgICAgICAgICBmaWVsZHMubWFwKGZ1bmN0aW9uIChjaGlsZCwgaSkge1xuICAgICAgICAgICAgICByZXR1cm4gcGx1Z2luLmNvbXBvbmVudCgnbGlzdC1pdGVtJykoe1xuICAgICAgICAgICAgICAgIGtleTogdGhpcy5zdGF0ZS5sb29rdXBzW2ldLFxuICAgICAgICAgICAgICAgIGZvcm06IHRoaXMucHJvcHMuZm9ybSxcbiAgICAgICAgICAgICAgICBmaWVsZDogY2hpbGQsXG4gICAgICAgICAgICAgICAgcGFyZW50OiBmaWVsZCxcbiAgICAgICAgICAgICAgICBpbmRleDogaSxcbiAgICAgICAgICAgICAgICBudW1JdGVtczogbnVtSXRlbXMsXG4gICAgICAgICAgICAgICAgb25Nb3ZlOiB0aGlzLm9uTW92ZSxcbiAgICAgICAgICAgICAgICBvblJlbW92ZTogdGhpcy5vblJlbW92ZVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgICApLFxuICAgICAgICAgIHBsdWdpbi5jb21wb25lbnQoJ2xpc3QtY29udHJvbCcpKHtmaWVsZDogZmllbGQsIG9uQXBwZW5kOiB0aGlzLm9uQXBwZW5kfSlcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21wb25lbnQubW92ZS1pdGVtLWJhY2tcblxuLypcbkJ1dHRvbiB0byBtb3ZlIGFuIGl0ZW0gYmFja3dhcmRzIGluIGxpc3QuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZGlzcGxheU5hbWU6IHBsdWdpbi5uYW1lLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lLFxuICAgICAgICBsYWJlbDogcGx1Z2luLmNvbmZpZ1ZhbHVlKCdsYWJlbCcsICdbdXBdJylcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIFIuc3Bhbih7Y2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZSwgb25DbGljazogdGhpcy5wcm9wcy5vbkNsaWNrfSwgdGhpcy5wcm9wcy5sYWJlbCk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50Lm1vdmUtaXRlbS1mb3J3YXJkXG5cbi8qXG5CdXR0b24gdG8gbW92ZSBhbiBpdGVtIGZvcndhcmQgaW4gYSBsaXN0LlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGRpc3BsYXlOYW1lOiBwbHVnaW4ubmFtZSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZSxcbiAgICAgICAgbGFiZWw6IHBsdWdpbi5jb25maWdWYWx1ZSgnbGFiZWwnLCAnW2Rvd25dJylcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIFIuc3Bhbih7Y2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZSwgb25DbGljazogdGhpcy5wcm9wcy5vbkNsaWNrfSwgdGhpcy5wcm9wcy5sYWJlbCk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50LnByZXR0eS10ZXh0YXJlYVxuXG4vKlxuVGV4dGFyZWEgdGhhdCB3aWxsIGRpc3BsYXkgaGlnaGxpZ2h0cyBiZWhpbmQgXCJ0YWdzXCIuIFRhZ3MgY3VycmVudGx5IG1lYW4gdGV4dFxudGhhdCBpcyBlbmNsb3NlZCBpbiBicmFjZXMgbGlrZSBge3tmb299fWAuIFRhZ3MgYXJlIHJlcGxhY2VkIHdpdGggbGFiZWxzIGlmXG5hdmFpbGFibGUgb3IgaHVtYW5pemVkLlxuXG5UaGlzIGNvbXBvbmVudCBpcyBxdWl0ZSBjb21wbGljYXRlZCBiZWNhdXNlOlxuLSBXZSBhcmUgZGlzcGxheWluZyB0ZXh0IGluIHRoZSB0ZXh0YXJlYSBidXQgaGF2ZSB0byBrZWVwIHRyYWNrIG9mIHRoZSByZWFsXG4gIHRleHQgdmFsdWUgaW4gdGhlIGJhY2tncm91bmQuIFdlIGNhbid0IHVzZSBhIGRhdGEgYXR0cmlidXRlLCBiZWNhdXNlIGl0J3MgYVxuICB0ZXh0YXJlYSwgc28gd2UgY2FuJ3QgdXNlIGFueSBlbGVtZW50cyBhdCBhbGwhXG4tIEJlY2F1c2Ugb2YgdGhlIGhpZGRlbiBkYXRhLCB3ZSBhbHNvIGhhdmUgdG8gZG8gc29tZSBpbnRlcmNlcHRpb24gb2ZcbiAgY29weSwgd2hpY2ggaXMgYSBsaXR0bGUgd2VpcmQuIFdlIGludGVyY2VwdCBjb3B5IGFuZCBjb3B5IHRoZSByZWFsIHRleHRcbiAgdG8gdGhlIGVuZCBvZiB0aGUgdGV4dGFyZWEuIFRoZW4gd2UgZXJhc2UgdGhhdCB0ZXh0LCB3aGljaCBsZWF2ZXMgdGhlIGNvcGllZFxuICBkYXRhIGluIHRoZSBidWZmZXIuXG4tIFJlYWN0IGxvc2VzIHRoZSBjYXJldCBwb3NpdGlvbiB3aGVuIHlvdSB1cGRhdGUgdGhlIHZhbHVlIHRvIHNvbWV0aGluZ1xuICBkaWZmZXJlbnQgdGhhbiBiZWZvcmUuIFNvIHdlIGhhdmUgdG8gcmV0YWluIHRyYWNraW5nIGluZm9ybWF0aW9uIGZvciB3aGVuXG4gIHRoYXQgaGFwcGVucy5cbi0gQmVjYXVzZSB3ZSBtb25rZXkgd2l0aCBjb3B5LCB3ZSBhbHNvIGhhdmUgdG8gZG8gb3VyIG93biB1bmRvL3JlZG8uIE90aGVyd2lzZVxuICB0aGUgZGVmYXVsdCB1bmRvIHdpbGwgaGF2ZSB3ZWlyZCBzdGF0ZXMgaW4gaXQuXG5cblNvIGdvb2QgbHVjayFcbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG52YXIgbm9CcmVhayA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUucmVwbGFjZSgvIC9nLCAnXFx1MDBhMCcpO1xufTtcblxudmFyIExFRlRfUEFEID0gJ1xcdTAwYTBcXHUwMGEwJztcbi8vIFdoeSB0aGlzIHdvcmtzLCBJJ20gbm90IHN1cmUuXG52YXIgUklHSFRfUEFEID0gJyAgJzsgLy8nXFx1MDBhMFxcdTAwYTAnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICB2YXIgdXRpbCA9IHBsdWdpbi5yZXF1aXJlKCd1dGlsJyk7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBtaXhpbnM6IFtwbHVnaW4ucmVxdWlyZSgnbWl4aW4uZmllbGQnKSwgcGx1Z2luLnJlcXVpcmUoJ21peGluLnVuZG8tc3RhY2snKSwgcGx1Z2luLnJlcXVpcmUoJ21peGluLnJlc2l6ZScpXSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB1bmRvRGVwdGg6IDEwMCxcbiAgICAgICAgaXNDaG9pY2VzT3BlbjogZmFsc2VcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgLy8gTm90IHF1aXRlIHN0YXRlLCB0aGlzIGlzIGZvciB0cmFja2luZyBzZWxlY3Rpb24gaW5mby5cbiAgICAgIHRoaXMudHJhY2tpbmcgPSB7fTtcblxuICAgICAgdmFyIHBhcnRzID0gdXRpbC5wYXJzZVRleHRXaXRoVGFncyh0aGlzLnByb3BzLmZpZWxkLnZhbHVlKTtcbiAgICAgIHZhciB0b2tlbnMgPSB0aGlzLnRva2VucyhwYXJ0cyk7XG4gICAgICB2YXIgaW5kZXhNYXAgPSB0aGlzLmluZGV4TWFwKHRva2Vucyk7XG5cbiAgICAgIHRoaXMudHJhY2tpbmcucG9zID0gaW5kZXhNYXAubGVuZ3RoO1xuICAgICAgdGhpcy50cmFja2luZy5yYW5nZSA9IDA7XG4gICAgICB0aGlzLnRyYWNraW5nLnRva2VucyA9IHRva2VucztcbiAgICAgIHRoaXMudHJhY2tpbmcuaW5kZXhNYXAgPSBpbmRleE1hcDtcbiAgICB9LFxuXG4gICAgZ2V0U3RhdGVTbmFwc2hvdDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdmFsdWU6IHRoaXMucHJvcHMuZmllbGQudmFsdWUsXG4gICAgICAgIHBvczogdGhpcy50cmFja2luZy5wb3MsXG4gICAgICAgIHJhbmdlOiB0aGlzLnRyYWNraW5nLnJhbmdlXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBzZXRTdGF0ZVNuYXBzaG90OiBmdW5jdGlvbiAoc25hcHNob3QpIHtcbiAgICAgIHRoaXMudHJhY2tpbmcucG9zID0gc25hcHNob3QucG9zO1xuICAgICAgdGhpcy50cmFja2luZy5yYW5nZSA9IHNuYXBzaG90LnJhbmdlO1xuICAgICAgdGhpcy5wcm9wcy5maWVsZC52YWwoc25hcHNob3QudmFsdWUpO1xuICAgIH0sXG5cbiAgICAvLyBUdXJuIGludG8gaW5kaXZpZHVhbCBjaGFyYWN0ZXJzIGFuZCB0YWdzXG4gICAgdG9rZW5zOiBmdW5jdGlvbiAocGFydHMpIHtcbiAgICAgIHJldHVybiBbXS5jb25jYXQuYXBwbHkoW10sIHBhcnRzLm1hcChmdW5jdGlvbiAocGFydCkge1xuICAgICAgICBpZiAocGFydC50eXBlID09PSAndGFnJykge1xuICAgICAgICAgIHJldHVybiBwYXJ0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBwYXJ0LnZhbHVlLnNwbGl0KCcnKTtcbiAgICAgICAgfVxuICAgICAgfSkpO1xuICAgIH0sXG5cbiAgICAvLyBNYXAgZWFjaCB0ZXh0YXJlYSBpbmRleCBiYWNrIHRvIGEgdG9rZW5cbiAgICBpbmRleE1hcDogZnVuY3Rpb24gKHRva2Vucykge1xuICAgICAgdmFyIGluZGV4TWFwID0gW107XG4gICAgICBfLmVhY2godG9rZW5zLCBmdW5jdGlvbiAodG9rZW4sIHRva2VuSW5kZXgpIHtcbiAgICAgICAgaWYgKHRva2VuLnR5cGUgPT09ICd0YWcnKSB7XG4gICAgICAgICAgdmFyIGxhYmVsID0gTEVGVF9QQUQgKyBub0JyZWFrKHRoaXMucHJldHR5TGFiZWwodG9rZW4udmFsdWUpKSArIFJJR0hUX1BBRDtcbiAgICAgICAgICB2YXIgbGFiZWxDaGFycyA9IGxhYmVsLnNwbGl0KCcnKTtcbiAgICAgICAgICBfLmVhY2gobGFiZWxDaGFycywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaW5kZXhNYXAucHVzaCh0b2tlbkluZGV4KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpbmRleE1hcC5wdXNoKHRva2VuSW5kZXgpO1xuICAgICAgICB9XG4gICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgcmV0dXJuIGluZGV4TWFwO1xuICAgIH0sXG5cbiAgICAvLyBNYWtlIGhpZ2hsaWdodCBzY3JvbGwgbWF0Y2ggdGV4dGFyZWEgc2Nyb2xsXG4gICAgb25TY3JvbGw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMucmVmcy5oaWdobGlnaHQuZ2V0RE9NTm9kZSgpLnNjcm9sbFRvcCA9IHRoaXMucmVmcy5jb250ZW50LmdldERPTU5vZGUoKS5zY3JvbGxUb3A7XG4gICAgICB0aGlzLnJlZnMuaGlnaGxpZ2h0LmdldERPTU5vZGUoKS5zY3JvbGxMZWZ0ID0gdGhpcy5yZWZzLmNvbnRlbnQuZ2V0RE9NTm9kZSgpLnNjcm9sbExlZnQ7XG4gICAgfSxcblxuICAgIC8vIEdpdmVuIHNvbWUgcG9zdGlvbiwgcmV0dXJuIHRoZSB0b2tlbiBpbmRleCAocG9zaXRpb24gY291bGQgYmUgaW4gdGhlIG1pZGRsZSBvZiBhIHRva2VuKVxuICAgIHRva2VuSW5kZXg6IGZ1bmN0aW9uIChwb3MsIHRva2VucywgaW5kZXhNYXApIHtcbiAgICAgIGlmIChwb3MgPCAwKSB7XG4gICAgICAgIHBvcyA9IDA7XG4gICAgICB9IGVsc2UgaWYgKHBvcyA+PSBpbmRleE1hcC5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHRva2Vucy5sZW5ndGg7XG4gICAgICB9XG4gICAgICByZXR1cm4gaW5kZXhNYXBbcG9zXTtcbiAgICB9LFxuXG4gICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgLy9jb25zb2xlLmxvZygnY2hhbmdlOicsIGV2ZW50LnRhcmdldC52YWx1ZSk7XG5cbiAgICAgIHZhciBub2RlID0gZXZlbnQudGFyZ2V0O1xuXG4gICAgICAvLyBUcmFja2luZyBpcyBob2xkaW5nIHByZXZpb3VzIHBvc2l0aW9uIGFuZCByYW5nZVxuICAgICAgdmFyIHByZXZQb3MgPSB0aGlzLnRyYWNraW5nLnBvcztcbiAgICAgIHZhciBwcmV2UmFuZ2UgPSB0aGlzLnRyYWNraW5nLnJhbmdlO1xuXG4gICAgICAvLyBOZXcgcG9zaXRpb25cbiAgICAgIHZhciBwb3MgPSBub2RlLnNlbGVjdGlvblN0YXJ0O1xuXG4gICAgICAvLyBHb2luZyB0byBtdXRhdGUgdGhlIHRva2Vucy5cbiAgICAgIHZhciB0b2tlbnMgPSB0aGlzLnRyYWNraW5nLnRva2VucztcblxuICAgICAgLy8gVXNpbmcgdGhlIHByZXZpb3VzIHBvc2l0aW9uIGFuZCByYW5nZSwgZ2V0IHRoZSBwcmV2aW91cyB0b2tlbiBwb3NpdGlvblxuICAgICAgLy8gYW5kIHJhbmdlXG4gICAgICB2YXIgcHJldlRva2VuSW5kZXggPSB0aGlzLnRva2VuSW5kZXgocHJldlBvcywgdG9rZW5zLCB0aGlzLnRyYWNraW5nLmluZGV4TWFwKTtcbiAgICAgIHZhciBwcmV2VG9rZW5FbmRJbmRleCA9IHRoaXMudG9rZW5JbmRleChwcmV2UG9zICsgcHJldlJhbmdlLCB0b2tlbnMsIHRoaXMudHJhY2tpbmcuaW5kZXhNYXApO1xuICAgICAgdmFyIHByZXZUb2tlblJhbmdlID0gcHJldlRva2VuRW5kSW5kZXggLSBwcmV2VG9rZW5JbmRleDtcblxuICAgICAgLy8gV2lwZSBvdXQgYW55IHRva2VucyBpbiB0aGUgc2VsZWN0ZWQgcmFuZ2UgYmVjYXVzZSB0aGUgY2hhbmdlIHdvdWxkIGhhdmVcbiAgICAgIC8vIGVyYXNlZCB0aGF0IHNlbGVjdGlvbi5cbiAgICAgIGlmIChwcmV2VG9rZW5SYW5nZSA+IDApIHtcbiAgICAgICAgdG9rZW5zLnNwbGljZShwcmV2VG9rZW5JbmRleCwgcHJldlRva2VuUmFuZ2UpO1xuICAgICAgICB0aGlzLnRyYWNraW5nLmluZGV4TWFwID0gdGhpcy5pbmRleE1hcCh0b2tlbnMpO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiBjdXJzb3IgaGFzIG1vdmVkIGZvcndhcmQsIHRoZW4gdGV4dCB3YXMgYWRkZWQuXG4gICAgICBpZiAocG9zID4gcHJldlBvcykge1xuICAgICAgICB2YXIgYWRkZWRUZXh0ID0gbm9kZS52YWx1ZS5zdWJzdHJpbmcocHJldlBvcywgcG9zKTtcbiAgICAgICAgLy8gSW5zZXJ0IHRoZSB0ZXh0IGludG8gdGhlIHRva2Vucy5cbiAgICAgICAgdG9rZW5zLnNwbGljZShwcmV2VG9rZW5JbmRleCwgMCwgYWRkZWRUZXh0KTtcbiAgICAgIC8vIElmIGN1cnNvciBoYXMgbW92ZWQgYmFja3dhcmQsIHRoZW4gd2UgZGVsZXRlZCAoYmFja3NwYWNlZCkgdGV4dFxuICAgICAgfSBpZiAocG9zIDwgcHJldlBvcykge1xuICAgICAgICB2YXIgdG9rZW4gPSB0aGlzLnRva2VuQXQocG9zKTtcbiAgICAgICAgdmFyIHRva2VuQmVmb3JlID0gdGhpcy50b2tlbkJlZm9yZShwb3MpO1xuICAgICAgICAvLyBJZiB3ZSBtb3ZlZCBiYWNrIG9udG8gYSB0b2tlbiwgdGhlbiB3ZSBzaG91bGQgbW92ZSBiYWNrIHRvIGJlZ2lubmluZ1xuICAgICAgICAvLyBvZiB0b2tlbi5cbiAgICAgICAgaWYgKHRva2VuID09PSB0b2tlbkJlZm9yZSkge1xuICAgICAgICAgIHBvcyA9IHRoaXMubW92ZU9mZlRhZyhwb3MsIHRva2VucywgdGhpcy5pbmRleE1hcCh0b2tlbnMpLCAtMSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHRva2VuSW5kZXggPSB0aGlzLnRva2VuSW5kZXgocG9zLCB0b2tlbnMsIHRoaXMudHJhY2tpbmcuaW5kZXhNYXApO1xuICAgICAgICAvLyBOb3cgd2UgY2FuIHJlbW92ZSB0aGUgdG9rZW5zIHRoYXQgd2VyZSBkZWxldGVkLlxuICAgICAgICB0b2tlbnMuc3BsaWNlKHRva2VuSW5kZXgsIHByZXZUb2tlbkluZGV4IC0gdG9rZW5JbmRleCk7XG4gICAgICB9XG5cbiAgICAgIC8vIENvbnZlcnQgdG9rZW5zIGJhY2sgaW50byByYXcgdmFsdWUgd2l0aCB0YWdzLiBOZXdseSBmb3JtZWQgdGFncyB3aWxsXG4gICAgICAvLyBiZWNvbWUgcGFydCBvZiB0aGUgcmF3IHZhbHVlLlxuICAgICAgdmFyIHJhd1ZhbHVlID0gdGhpcy5yYXdWYWx1ZSh0b2tlbnMpO1xuXG4gICAgICB0aGlzLnRyYWNraW5nLnBvcyA9IHBvcztcbiAgICAgIHRoaXMudHJhY2tpbmcucmFuZ2UgPSAwO1xuXG4gICAgICAvLyBTZXQgdGhlIHZhbHVlIHRvIHRoZSBuZXcgcmF3IHZhbHVlLlxuICAgICAgdGhpcy5wcm9wcy5maWVsZC52YWwocmF3VmFsdWUpO1xuXG4gICAgICB0aGlzLnNuYXBzaG90KCk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZFVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHZhbHVlID0gdGhpcy5wcm9wcy5maWVsZC52YWx1ZSB8fCAnJztcbiAgICAgIHZhciBwYXJ0cyA9IHV0aWwucGFyc2VUZXh0V2l0aFRhZ3ModmFsdWUpO1xuICAgICAgdGhpcy50cmFja2luZy50b2tlbnMgPSB0aGlzLnRva2VucyhwYXJ0cyk7XG4gICAgICB0aGlzLnRyYWNraW5nLmluZGV4TWFwID0gdGhpcy5pbmRleE1hcCh0aGlzLnRyYWNraW5nLnRva2Vucyk7XG5cbiAgICAgIHZhciBwb3MgPSB0aGlzLm5vcm1hbGl6ZVBvc2l0aW9uKHRoaXMudHJhY2tpbmcucG9zKTtcbiAgICAgIHZhciByYW5nZSA9IHRoaXMudHJhY2tpbmcucmFuZ2U7XG4gICAgICB2YXIgZW5kUG9zID0gdGhpcy5ub3JtYWxpemVQb3NpdGlvbihwb3MgKyByYW5nZSk7XG4gICAgICByYW5nZSA9IGVuZFBvcyAtIHBvcztcblxuICAgICAgdGhpcy50cmFja2luZy5wb3MgPSBwb3M7XG4gICAgICB0aGlzLnRyYWNraW5nLnJhbmdlID0gcmFuZ2U7XG5cbiAgICAgIGlmIChkb2N1bWVudC5hY3RpdmVFbGVtZW50ID09PSB0aGlzLnJlZnMuY29udGVudC5nZXRET01Ob2RlKCkpIHtcbiAgICAgICAgLy8gUmVhY3QgY2FuIGxvc2UgdGhlIHNlbGVjdGlvbiwgc28gcHV0IGl0IGJhY2suXG4gICAgICAgIHRoaXMucmVmcy5jb250ZW50LmdldERPTU5vZGUoKS5zZXRTZWxlY3Rpb25SYW5nZShwb3MsIHBvcyArIHJhbmdlKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gR2V0IHRoZSBsYWJlbCBmb3IgYSBrZXkuXG4gICAgcHJldHR5TGFiZWw6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIGlmICh0aGlzLnByb3BzLmZpZWxkLmRlZi5yZXBsYWNlQ2hvaWNlc0xhYmVsc1trZXldKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BzLmZpZWxkLmRlZi5yZXBsYWNlQ2hvaWNlc0xhYmVsc1trZXldO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHV0aWwuaHVtYW5pemUoa2V5KTtcbiAgICB9LFxuXG4gICAgLy8gR2l2ZW4gdGhlIGFjdHVhbCB2YWx1ZSBvZiB0aGUgZmllbGQgKHdpdGggdGFncyksIGdldCB0aGUgcGxhaW4gdGV4dCB0aGF0XG4gICAgLy8gc2hvdWxkIHNob3cgaW4gdGhlIHRleHRhcmVhLlxuICAgIHBsYWluVmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgdmFyIHBhcnRzID0gdXRpbC5wYXJzZVRleHRXaXRoVGFncyh2YWx1ZSk7XG4gICAgICByZXR1cm4gcGFydHMubWFwKGZ1bmN0aW9uIChwYXJ0KSB7XG4gICAgICAgIGlmIChwYXJ0LnR5cGUgPT09ICd0ZXh0Jykge1xuICAgICAgICAgIHJldHVybiBwYXJ0LnZhbHVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBMRUZUX1BBRCArIG5vQnJlYWsodGhpcy5wcmV0dHlMYWJlbChwYXJ0LnZhbHVlKSkgKyBSSUdIVF9QQUQ7XG4gICAgICAgIH1cbiAgICAgIH0uYmluZCh0aGlzKSkuam9pbignJyk7XG4gICAgfSxcblxuICAgIC8vIEdpdmVuIHRoZSBhY3R1YWwgdmFsdWUgb2YgdGhlIGZpZWxkICh3aXRoIHRhZ3MpLCBnZXQgdGhlIGh0bWwgdXNlZCB0b1xuICAgIC8vIGhpZ2hsaWdodCB0aGUgbGFiZWxzLlxuICAgIHByZXR0eVZhbHVlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHZhciBwYXJ0cyA9IHV0aWwucGFyc2VUZXh0V2l0aFRhZ3ModmFsdWUpO1xuICAgICAgcmV0dXJuIHBhcnRzLm1hcChmdW5jdGlvbiAocGFydCwgaSkge1xuICAgICAgICBpZiAocGFydC50eXBlID09PSAndGV4dCcpIHtcbiAgICAgICAgICBpZiAoaSA9PT0gKHBhcnRzLmxlbmd0aCAtIDEpKSB7XG4gICAgICAgICAgICBpZiAocGFydC52YWx1ZVtwYXJ0LnZhbHVlLmxlbmd0aCAtIDFdID09PSAnXFxuJykge1xuICAgICAgICAgICAgICByZXR1cm4gcGFydC52YWx1ZSArICdcXHUwMGEwJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHBhcnQudmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gTWFrZSBhIHBpbGxcbiAgICAgICAgICByZXR1cm4gUi5zcGFuKHtrZXk6IGksIGNsYXNzTmFtZTogJ3ByZXR0eS1wYXJ0J30sXG4gICAgICAgICAgICBSLnNwYW4oe2NsYXNzTmFtZTogJ3ByZXR0eS1wYXJ0LWxlZnQnfSwgTEVGVF9QQUQpLFxuICAgICAgICAgICAgUi5zcGFuKHtjbGFzc05hbWU6ICdwcmV0dHktcGFydC10ZXh0J30sIG5vQnJlYWsodGhpcy5wcmV0dHlMYWJlbChwYXJ0LnZhbHVlKSkpLFxuICAgICAgICAgICAgUi5zcGFuKHtjbGFzc05hbWU6ICdwcmV0dHktcGFydC1yaWdodCd9LCBSSUdIVF9QQUQpXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLy8gR2l2ZW4gdGhlIHRva2VucyBmb3IgYSBmaWVsZCwgZ2V0IHRoZSBhY3R1YWwgdmFsdWUgb2YgdGhlIGZpZWxkICh3aXRoXG4gICAgLy8gdGFncylcbiAgICByYXdWYWx1ZTogZnVuY3Rpb24gKHRva2Vucykge1xuICAgICAgcmV0dXJuIHRva2Vucy5tYXAoZnVuY3Rpb24gKHRva2VuKSB7XG4gICAgICAgIGlmICh0b2tlbi50eXBlID09PSAndGFnJykge1xuICAgICAgICAgIHJldHVybiAne3snICsgdG9rZW4udmFsdWUgKyAnfX0nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgICAgfVxuICAgICAgfSkuam9pbignJyk7XG4gICAgfSxcblxuICAgIC8vIEdpdmVuIGEgcG9zaXRpb24sIGlmIGl0J3Mgb24gYSBsYWJlbCwgZ2V0IHRoZSBwb3NpdGlvbiBsZWZ0IG9yIHJpZ2h0IG9mXG4gICAgLy8gdGhlIGxhYmVsLCBiYXNlZCBvbiBkaXJlY3Rpb24gYW5kL29yIHdoaWNoIHNpZGUgaXMgY2xvc2VyXG4gICAgbW92ZU9mZlRhZzogZnVuY3Rpb24gKHBvcywgdG9rZW5zLCBpbmRleE1hcCwgZGlyKSB7XG4gICAgICBpZiAodHlwZW9mIGRpciA9PT0gJ3VuZGVmaW5lZCcgfHwgZGlyID4gMCkge1xuICAgICAgICBkaXIgPSAxO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGlyID0gLTE7XG4gICAgICB9XG4gICAgICB2YXIgdG9rZW47XG4gICAgICBpZiAoZGlyID4gMCkge1xuICAgICAgICB0b2tlbiA9IHRva2Vuc1tpbmRleE1hcFtwb3NdXTtcbiAgICAgICAgd2hpbGUgKHBvcyA8IGluZGV4TWFwLmxlbmd0aCAmJiB0b2tlbnNbaW5kZXhNYXBbcG9zXV0udHlwZSA9PT0gJ3RhZycgJiYgdG9rZW5zW2luZGV4TWFwW3Bvc11dID09PSB0b2tlbikge1xuICAgICAgICAgIHBvcysrO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0b2tlbiA9IHRva2Vuc1tpbmRleE1hcFtwb3MgLSAxXV07XG4gICAgICAgIHdoaWxlIChwb3MgPiAwICYmIHRva2Vuc1tpbmRleE1hcFtwb3MgLSAxXV0udHlwZSA9PT0gJ3RhZycgJiYgdG9rZW5zW2luZGV4TWFwW3BvcyAtIDFdXSA9PT0gdG9rZW4pIHtcbiAgICAgICAgICBwb3MtLTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcG9zO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgdGhlIHRva2VuIGF0IHNvbWUgcG9zaXRpb24uXG4gICAgdG9rZW5BdDogZnVuY3Rpb24gKHBvcykge1xuICAgICAgaWYgKHBvcyA+PSB0aGlzLnRyYWNraW5nLmluZGV4TWFwLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIGlmIChwb3MgPCAwKSB7XG4gICAgICAgIHBvcyA9IDA7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy50cmFja2luZy50b2tlbnNbdGhpcy50cmFja2luZy5pbmRleE1hcFtwb3NdXTtcbiAgICB9LFxuXG4gICAgLy8gR2V0IHRoZSB0b2tlbiBpbW1lZGlhdGVseSBiZWZvcmUgc29tZSBwb3NpdGlvbi5cbiAgICB0b2tlbkJlZm9yZTogZnVuY3Rpb24gKHBvcykge1xuICAgICAgaWYgKHBvcyA+PSB0aGlzLnRyYWNraW5nLmluZGV4TWFwLmxlbmd0aCkge1xuICAgICAgICBwb3MgPSB0aGlzLnRyYWNraW5nLmluZGV4TWFwLmxlbmd0aDtcbiAgICAgIH1cbiAgICAgIGlmIChwb3MgPD0gMCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnRyYWNraW5nLnRva2Vuc1t0aGlzLnRyYWNraW5nLmluZGV4TWFwW3BvcyAtIDFdXTtcbiAgICB9LFxuXG4gICAgLy8gR2l2ZW4gYSBwb3NpdGlvbiwgZ2V0IGEgY29ycmVjdGVkIHBvc2l0aW9uIChpZiBuZWNlc3NhcnkgdG8gYmVcbiAgICAvLyBjb3JyZWN0ZWQpLlxuICAgIG5vcm1hbGl6ZVBvc2l0aW9uOiBmdW5jdGlvbiAocG9zLCBwcmV2UG9zKSB7XG4gICAgICBpZiAoXy5pc1VuZGVmaW5lZChwcmV2UG9zKSkge1xuICAgICAgICBwcmV2UG9zID0gcG9zO1xuICAgICAgfVxuICAgICAgLy8gQXQgc3RhcnQgb3IgZW5kLCBzbyBva2F5LlxuICAgICAgaWYgKHBvcyA8PSAwIHx8IHBvcyA+PSB0aGlzLnRyYWNraW5nLmluZGV4TWFwLmxlbmd0aCkge1xuICAgICAgICBpZiAocG9zIDwgMCkge1xuICAgICAgICAgIHBvcyA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBvcyA+IHRoaXMudHJhY2tpbmcuaW5kZXhNYXAubGVuZ3RoKSB7XG4gICAgICAgICAgcG9zID0gdGhpcy50cmFja2luZy5pbmRleE1hcC5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBvcztcbiAgICAgIH1cblxuICAgICAgdmFyIHRva2VuID0gdGhpcy50b2tlbkF0KHBvcyk7XG4gICAgICB2YXIgdG9rZW5CZWZvcmUgPSB0aGlzLnRva2VuQmVmb3JlKHBvcyk7XG5cbiAgICAgIC8vIEJldHdlZW4gdHdvIHRva2Vucywgc28gb2theS5cbiAgICAgIGlmICh0b2tlbiAhPT0gdG9rZW5CZWZvcmUpIHtcbiAgICAgICAgcmV0dXJuIHBvcztcbiAgICAgIH1cblxuICAgICAgdmFyIHByZXZUb2tlbiA9IHRoaXMudG9rZW5BdChwcmV2UG9zKTtcbiAgICAgIHZhciBwcmV2VG9rZW5CZWZvcmUgPSB0aGlzLnRva2VuQmVmb3JlKHByZXZQb3MpO1xuXG4gICAgICB2YXIgcmlnaHRQb3MgPSB0aGlzLm1vdmVPZmZUYWcocG9zLCB0aGlzLnRyYWNraW5nLnRva2VucywgdGhpcy50cmFja2luZy5pbmRleE1hcCk7XG4gICAgICB2YXIgbGVmdFBvcyA9IHRoaXMubW92ZU9mZlRhZyhwb3MsIHRoaXMudHJhY2tpbmcudG9rZW5zLCB0aGlzLnRyYWNraW5nLmluZGV4TWFwLCAtMSk7XG5cbiAgICAgIGlmIChwcmV2VG9rZW4gIT09IHByZXZUb2tlbkJlZm9yZSkge1xuICAgICAgICAvLyBNb3ZlZCBmcm9tIGxlZnQgZWRnZS5cbiAgICAgICAgaWYgKHByZXZUb2tlbiA9PT0gdG9rZW4pIHtcbiAgICAgICAgICByZXR1cm4gcmlnaHRQb3M7XG4gICAgICAgIH1cbiAgICAgICAgLy8gTW92ZWQgZnJvbSByaWdodCBlZGdlLlxuICAgICAgICBpZiAocHJldlRva2VuQmVmb3JlID09PSB0b2tlbikge1xuICAgICAgICAgIHJldHVybiBsZWZ0UG9zO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciBuZXdQb3MgPSByaWdodFBvcztcblxuICAgICAgaWYgKHBvcyA9PT0gcHJldlBvcyB8fCBwb3MgPCBwcmV2UG9zKSB7XG4gICAgICAgIGlmIChyaWdodFBvcyAtIHBvcyA+IHBvcyAtIGxlZnRQb3MpIHtcbiAgICAgICAgICBuZXdQb3MgPSBsZWZ0UG9zO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3UG9zO1xuICAgIH0sXG5cbiAgICBvblNlbGVjdDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICB2YXIgbm9kZSA9IGV2ZW50LnRhcmdldDtcblxuICAgICAgdmFyIHBvcyA9IG5vZGUuc2VsZWN0aW9uU3RhcnQ7XG4gICAgICB2YXIgZW5kUG9zID0gbm9kZS5zZWxlY3Rpb25FbmQ7XG5cbiAgICAgIHBvcyA9IHRoaXMubm9ybWFsaXplUG9zaXRpb24ocG9zLCB0aGlzLnRyYWNraW5nLnBvcyk7XG4gICAgICBlbmRQb3MgPSB0aGlzLm5vcm1hbGl6ZVBvc2l0aW9uKGVuZFBvcywgdGhpcy50cmFja2luZy5wb3MgKyB0aGlzLnRyYWNraW5nLnJhbmdlKTtcblxuICAgICAgdGhpcy50cmFja2luZy5wb3MgPSBwb3M7XG4gICAgICB0aGlzLnRyYWNraW5nLnJhbmdlID0gZW5kUG9zIC0gcG9zO1xuXG4gICAgICBub2RlLnNlbGVjdGlvblN0YXJ0ID0gcG9zO1xuICAgICAgbm9kZS5zZWxlY3Rpb25FbmQgPSBlbmRQb3M7XG4gICAgfSxcblxuICAgIG9uQ29weTogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIG5vZGUgPSB0aGlzLnJlZnMuY29udGVudC5nZXRET01Ob2RlKCk7XG4gICAgICB2YXIgc3RhcnQgPSBub2RlLnNlbGVjdGlvblN0YXJ0O1xuICAgICAgdmFyIGVuZCA9IG5vZGUuc2VsZWN0aW9uRW5kO1xuICAgICAgdmFyIHRleHQgPSBub2RlLnZhbHVlLnN1YnN0cmluZyhzdGFydCwgZW5kKTtcbiAgICAgIHZhciByZWFsU3RhcnRJbmRleCA9IHRoaXMudG9rZW5JbmRleChzdGFydCwgdGhpcy50cmFja2luZy50b2tlbnMsIHRoaXMudHJhY2tpbmcuaW5kZXhNYXApO1xuICAgICAgdmFyIHJlYWxFbmRJbmRleCA9IHRoaXMudG9rZW5JbmRleChlbmQsIHRoaXMudHJhY2tpbmcudG9rZW5zLCB0aGlzLnRyYWNraW5nLmluZGV4TWFwKTtcbiAgICAgIHZhciB0b2tlbnMgPSB0aGlzLnRyYWNraW5nLnRva2Vucy5zbGljZShyZWFsU3RhcnRJbmRleCwgcmVhbEVuZEluZGV4KTtcbiAgICAgIHRleHQgPSB0aGlzLnJhd1ZhbHVlKHRva2Vucyk7XG4gICAgICB2YXIgb3JpZ2luYWxWYWx1ZSA9IG5vZGUudmFsdWU7XG4gICAgICBub2RlLnZhbHVlID0gbm9kZS52YWx1ZSArIHRleHQ7XG4gICAgICBub2RlLnNldFNlbGVjdGlvblJhbmdlKG9yaWdpbmFsVmFsdWUubGVuZ3RoLCBvcmlnaW5hbFZhbHVlLmxlbmd0aCArIHRleHQubGVuZ3RoKTtcbiAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBub2RlLnZhbHVlID0gb3JpZ2luYWxWYWx1ZTtcbiAgICAgICAgbm9kZS5zZXRTZWxlY3Rpb25SYW5nZShzdGFydCwgZW5kKTtcbiAgICAgIH0sMCk7XG4gICAgfSxcblxuICAgIG9uS2V5RG93bjogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAvLyBDbWQtWiBvciBDdHJsLVpcbiAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSA5MCAmJiAoZXZlbnQubWV0YUtleSB8fCBldmVudC5jdHJsS2V5KSAmJiAhZXZlbnQuc2hpZnRLZXkpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy51bmRvKCk7XG4gICAgICAvLyBDbWQtU2hpZnQtWiBvciBDdHJsLVlcbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIChldmVudC5rZXlDb2RlID09PSA4OSAmJiBldmVudC5jdHJsS2V5ICYmICFldmVudC5zaGlmdEtleSkgfHxcbiAgICAgICAgKGV2ZW50LmtleUNvZGUgPT09IDkwICYmIGV2ZW50Lm1ldGFLZXkgJiYgZXZlbnQuc2hpZnRLZXkpXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5yZWRvKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIEtlZXAgdGhlIGhpZ2hsaWdodCBzdHlsZXMgaW4gc3luYyB3aXRoIHRoZSB0ZXh0YXJlYSBzdHlsZXMuXG4gICAgYWRqdXN0U3R5bGVzOiBmdW5jdGlvbiAoaXNNb3VudCkge1xuICAgICAgdmFyIG92ZXJsYXkgPSB0aGlzLnJlZnMuaGlnaGxpZ2h0LmdldERPTU5vZGUoKTtcbiAgICAgIHZhciBjb250ZW50ID0gdGhpcy5yZWZzLmNvbnRlbnQuZ2V0RE9NTm9kZSgpO1xuXG4gICAgICB2YXIgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShjb250ZW50KTtcblxuICAgICAgdmFyIGJhY2tncm91bmRDb2xvciA9IHN0eWxlLmJhY2tncm91bmRDb2xvcjtcblxuICAgICAgdXRpbC5jb3B5RWxlbWVudFN0eWxlKGNvbnRlbnQsIG92ZXJsYXkpO1xuXG4gICAgICBvdmVybGF5LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgIG92ZXJsYXkuc3R5bGUud2hpdGVTcGFjZSA9ICdwcmUtd3JhcCc7XG4gICAgICBvdmVybGF5LnN0eWxlLmNvbG9yID0gJ3JnYmEoMCwwLDAsMCknO1xuICAgICAgb3ZlcmxheS5zdHlsZS53ZWJraXRUZXh0RmlsbENvbG9yID0gJ3JnYmEoMCwwLDAsMCknO1xuICAgICAgb3ZlcmxheS5zdHlsZS5yZXNpemUgPSAnbm9uZSc7XG4gICAgICBvdmVybGF5LnN0eWxlLmJvcmRlckNvbG9yID0gJ3JnYmEoMCwwLDAsMCknO1xuXG4gICAgICBpZiAodXRpbC5icm93c2VyLmlzTW96aWxsYSkge1xuXG4gICAgICAgIHZhciBwYWRkaW5nVG9wID0gcGFyc2VGbG9hdChzdHlsZS5wYWRkaW5nVG9wKTtcbiAgICAgICAgdmFyIHBhZGRpbmdCb3R0b20gPSBwYXJzZUZsb2F0KHN0eWxlLnBhZGRpbmdCb3R0b20pO1xuXG4gICAgICAgIHZhciBib3JkZXJUb3AgPSBwYXJzZUZsb2F0KHN0eWxlLmJvcmRlclRvcFdpZHRoKTtcbiAgICAgICAgdmFyIGJvcmRlckJvdHRvbSA9IHBhcnNlRmxvYXQoc3R5bGUuYm9yZGVyQm90dG9tV2lkdGgpO1xuXG4gICAgICAgIG92ZXJsYXkuc3R5bGUucGFkZGluZ1RvcCA9ICcwcHgnO1xuICAgICAgICBvdmVybGF5LnN0eWxlLnBhZGRpbmdCb3R0b20gPSAnMHB4JztcblxuICAgICAgICBvdmVybGF5LnN0eWxlLmhlaWdodCA9IChjb250ZW50LmNsaWVudEhlaWdodCAtIHBhZGRpbmdUb3AgLSBwYWRkaW5nQm90dG9tICsgYm9yZGVyVG9wICsgYm9yZGVyQm90dG9tKSArICdweCc7XG4gICAgICAgIG92ZXJsYXkuc3R5bGUudG9wID0gc3R5bGUucGFkZGluZ1RvcDtcbiAgICAgICAgb3ZlcmxheS5zdHlsZS5ib3hTaGFkb3cgPSAnbm9uZSc7XG4gICAgICB9XG5cbiAgICAgIGlmIChpc01vdW50KSB7XG4gICAgICAgIHRoaXMuYmFja2dyb3VuZENvbG9yID0gYmFja2dyb3VuZENvbG9yO1xuICAgICAgfVxuICAgICAgb3ZlcmxheS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSB0aGlzLmJhY2tncm91bmRDb2xvcjtcbiAgICAgIGNvbnRlbnQuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3JnYmEoMCwwLDAsMCknO1xuICAgIH0sXG5cbiAgICAvLyBJZiB0aGUgdGV4dGFyZWEgaXMgcmVzaXplZCwgbmVlZCB0byByZS1zeW5jIHRoZSBzdHlsZXMuXG4gICAgb25SZXNpemU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuYWRqdXN0U3R5bGVzKCk7XG4gICAgfSxcblxuICAgIC8vIElmIHRoZSB3aW5kb3cgaXMgcmVzaXplZCwgbWF5IG5lZWQgdG8gcmUtc3luYyB0aGUgc3R5bGVzLlxuICAgIC8vIFByb2JhYmx5IG5vdCBuZWNlc3Nhcnkgd2l0aCBlbGVtZW50IHJlc2l6ZT9cbiAgICBvblJlc2l6ZVdpbmRvdzogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5hZGp1c3RTdHlsZXMoKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuYWRqdXN0U3R5bGVzKHRydWUpO1xuICAgICAgdGhpcy5zZXRPblJlc2l6ZSgnY29udGVudCcsIHRoaXMub25SZXNpemUpO1xuICAgICAgLy90aGlzLnNldE9uQ2xpY2tPdXRzaWRlKCdjaG9pY2VzJywgdGhpcy5vbkNsaWNrT3V0c2lkZUNob2ljZXMpO1xuICAgIH0sXG5cbiAgICBvbkluc2VydEZyb21TZWxlY3Q6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgaWYgKGV2ZW50LnRhcmdldC5zZWxlY3RlZEluZGV4ID4gMCkge1xuICAgICAgICB2YXIgdGFnID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xuICAgICAgICBldmVudC50YXJnZXQuc2VsZWN0ZWRJbmRleCA9IDA7XG4gICAgICAgIHZhciBwb3MgPSB0aGlzLnRyYWNraW5nLnBvcztcbiAgICAgICAgdmFyIGluc2VydFBvcyA9IHRoaXMubm9ybWFsaXplUG9zaXRpb24ocG9zKTtcbiAgICAgICAgdmFyIHRva2VucyA9IHRoaXMudHJhY2tpbmcudG9rZW5zO1xuICAgICAgICB2YXIgdG9rZW5JbmRleCA9IHRoaXMudG9rZW5JbmRleChpbnNlcnRQb3MsIHRva2VucywgdGhpcy50cmFja2luZy5pbmRleE1hcCk7XG4gICAgICAgIHRva2Vucy5zcGxpY2UodG9rZW5JbmRleCwgMCwge1xuICAgICAgICAgIHR5cGU6ICd0YWcnLFxuICAgICAgICAgIHZhbHVlOiB0YWdcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudHJhY2tpbmcuaW5kZXhNYXAgPSB0aGlzLmluZGV4TWFwKHRva2Vucyk7XG4gICAgICAgIHZhciBuZXdWYWx1ZSA9IHRoaXMucmF3VmFsdWUodG9rZW5zKTtcbiAgICAgICAgdGhpcy50cmFja2luZy5wb3MgKz0gdGhpcy5wcmV0dHlMYWJlbCh0YWcpLmxlbmd0aDtcbiAgICAgICAgdGhpcy5wcm9wcy5maWVsZC52YWwobmV3VmFsdWUpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBvbkluc2VydDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB2YXIgdGFnID0gdmFsdWU7XG4gICAgICB2YXIgcG9zID0gdGhpcy50cmFja2luZy5wb3M7XG4gICAgICB2YXIgaW5zZXJ0UG9zID0gdGhpcy5ub3JtYWxpemVQb3NpdGlvbihwb3MpO1xuICAgICAgdmFyIHRva2VucyA9IHRoaXMudHJhY2tpbmcudG9rZW5zO1xuICAgICAgdmFyIHRva2VuSW5kZXggPSB0aGlzLnRva2VuSW5kZXgoaW5zZXJ0UG9zLCB0b2tlbnMsIHRoaXMudHJhY2tpbmcuaW5kZXhNYXApO1xuICAgICAgdG9rZW5zLnNwbGljZSh0b2tlbkluZGV4LCAwLCB7XG4gICAgICAgIHR5cGU6ICd0YWcnLFxuICAgICAgICB2YWx1ZTogdGFnXG4gICAgICB9KTtcbiAgICAgIHRoaXMudHJhY2tpbmcuaW5kZXhNYXAgPSB0aGlzLmluZGV4TWFwKHRva2Vucyk7XG4gICAgICB2YXIgbmV3VmFsdWUgPSB0aGlzLnJhd1ZhbHVlKHRva2Vucyk7XG4gICAgICB0aGlzLnRyYWNraW5nLnBvcyArPSB0aGlzLnByZXR0eUxhYmVsKHRhZykubGVuZ3RoO1xuICAgICAgdGhpcy5wcm9wcy5maWVsZC52YWwobmV3VmFsdWUpO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGlzQ2hvaWNlc09wZW46IGZhbHNlXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgb25Ub2dnbGVDaG9pY2VzOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgaXNDaG9pY2VzT3BlbjogIXRoaXMuc3RhdGUuaXNDaG9pY2VzT3BlblxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIG9uQ2xvc2VDaG9pY2VzOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBpc0Nob2ljZXNPcGVuOiBmYWxzZVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGdldENsb3NlSWdub3JlTm9kZXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLnJlZnMudG9nZ2xlLmdldERPTU5vZGUoKTtcbiAgICB9LFxuXG4gICAgb25DbGlja091dHNpZGVDaG9pY2VzOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIC8vIC8vIElmIHdlIGRpZG4ndCBjbGljayBvbiB0aGUgdG9nZ2xlIGJ1dHRvbiwgY2xvc2UgdGhlIGNob2ljZXMuXG4gICAgICAvLyBpZiAodGhpcy5pc05vZGVPdXRzaWRlKHRoaXMucmVmcy50b2dnbGUuZ2V0RE9NTm9kZSgpLCBldmVudC50YXJnZXQpKSB7XG4gICAgICAvLyAgIGNvbnNvbGUubG9nKCdub3QgYSB0b2dnbGUgY2xpY2snKVxuICAgICAgLy8gICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIC8vICAgICBpc0Nob2ljZXNPcGVuOiBmYWxzZVxuICAgICAgLy8gICB9KTtcbiAgICAgIC8vIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgICB2YXIgcmVwbGFjZUNob2ljZXMgPSBmaWVsZC5kZWYucmVwbGFjZUNob2ljZXM7XG5cbiAgICAgIC8vIHZhciBzZWxlY3RSZXBsYWNlQ2hvaWNlcyA9IFt7XG4gICAgICAvLyAgIHZhbHVlOiAnJyxcbiAgICAgIC8vICAgbGFiZWw6ICdJbnNlcnQuLi4nXG4gICAgICAvLyB9XS5jb25jYXQocmVwbGFjZUNob2ljZXMpO1xuXG4gICAgICByZXR1cm4gcGx1Z2luLmNvbXBvbmVudCgnZmllbGQnKSh7XG4gICAgICAgIGZpZWxkOiBmaWVsZFxuICAgICAgfSwgUi5kaXYoe3N0eWxlOiB7cG9zaXRpb246ICdyZWxhdGl2ZSd9fSxcblxuICAgICAgICBSLnByZSh7XG4gICAgICAgICAgY2xhc3NOYW1lOiAncHJldHR5LWhpZ2hsaWdodCcsXG4gICAgICAgICAgcmVmOiAnaGlnaGxpZ2h0J1xuICAgICAgICB9LFxuICAgICAgICAgIHRoaXMucHJldHR5VmFsdWUoZmllbGQudmFsdWUpXG4gICAgICAgICksXG5cbiAgICAgICAgUi50ZXh0YXJlYShfLmV4dGVuZCh7XG4gICAgICAgICAgY2xhc3NOYW1lOiB1dGlsLmNsYXNzTmFtZSh0aGlzLnByb3BzLmNsYXNzTmFtZSwgJ3ByZXR0eS1jb250ZW50JyksXG4gICAgICAgICAgcmVmOiAnY29udGVudCcsXG4gICAgICAgICAgcm93czogZmllbGQuZGVmLnJvd3MgfHwgdGhpcy5wcm9wcy5yb3dzLFxuICAgICAgICAgIG5hbWU6IGZpZWxkLmtleSxcbiAgICAgICAgICB2YWx1ZTogdGhpcy5wbGFpblZhbHVlKGZpZWxkLnZhbHVlKSxcbiAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgICAgICBvblNjcm9sbDogdGhpcy5vblNjcm9sbCxcbiAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXG4gICAgICAgICAgICB0b3A6IDAsXG4gICAgICAgICAgICBsZWZ0OiAwXG4gICAgICAgICAgfSxcbiAgICAgICAgICBvbktleVByZXNzOiB0aGlzLm9uS2V5UHJlc3MsXG4gICAgICAgICAgb25LZXlEb3duOiB0aGlzLm9uS2V5RG93bixcbiAgICAgICAgICBvblNlbGVjdDogdGhpcy5vblNlbGVjdCxcbiAgICAgICAgICBvbkNvcHk6IHRoaXMub25Db3B5XG4gICAgICAgIH0sIHBsdWdpbi5jb25maWcuYXR0cmlidXRlcykpLFxuXG4gICAgICAgIFIuYSh7cmVmOiAndG9nZ2xlJywgaHJlZjogJ0phdmFTY3JpcHQnICsgJzonLCBvbkNsaWNrOiB0aGlzLm9uVG9nZ2xlQ2hvaWNlc30sICdJbnNlcnQuLi4nKSxcblxuICAgICAgICBwbHVnaW4uY29tcG9uZW50KCdjaG9pY2VzJykoe1xuICAgICAgICAgIHJlZjogJ2Nob2ljZXMnLFxuICAgICAgICAgIGNob2ljZXM6IHJlcGxhY2VDaG9pY2VzLCBvcGVuOiB0aGlzLnN0YXRlLmlzQ2hvaWNlc09wZW4sXG4gICAgICAgICAgb25TZWxlY3Q6IHRoaXMub25JbnNlcnQsIG9uQ2xvc2U6IHRoaXMub25DbG9zZUNob2ljZXMsIGlnbm9yZUNsb3NlTm9kZXM6IHRoaXMuZ2V0Q2xvc2VJZ25vcmVOb2Rlc30pXG4gICAgICAgIC8vLFxuXG4gICAgICAgIC8vIFIuc2VsZWN0KHtvbkNoYW5nZTogdGhpcy5vbkluc2VydEZyb21TZWxlY3R9LFxuICAgICAgICAvLyAgIHNlbGVjdFJlcGxhY2VDaG9pY2VzLm1hcChmdW5jdGlvbiAoY2hvaWNlLCBpKSB7XG4gICAgICAgIC8vICAgICByZXR1cm4gUi5vcHRpb24oe1xuICAgICAgICAvLyAgICAgICBrZXk6IGksXG4gICAgICAgIC8vICAgICAgIHZhbHVlOiBjaG9pY2UudmFsdWVcbiAgICAgICAgLy8gICAgIH0sIGNob2ljZS5sYWJlbCk7XG4gICAgICAgIC8vICAgfSlcbiAgICAgICAgLy8gKVxuICAgICAgKSk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50LnJlbW92ZS1pdGVtXG5cbi8qXG5SZW1vdmUgYW4gaXRlbS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWUsXG4gICAgICAgIGxhYmVsOiBwbHVnaW4uY29uZmlnVmFsdWUoJ2xhYmVsJywgJ1tyZW1vdmVdJylcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIFIuc3Bhbih7Y2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZSwgb25DbGljazogdGhpcy5wcm9wcy5vbkNsaWNrfSwgdGhpcy5wcm9wcy5sYWJlbCk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50LnJvb3RcblxuLypcblJvb3QgY29tcG9uZW50IGp1c3QgdXNlZCB0byBzcGl0IG91dCBhbGwgdGhlIGZpZWxkcyBmb3IgYSBmb3JtLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICB2YXIgdXRpbCA9IHBsdWdpbi5yZXF1aXJlKCd1dGlsJyk7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogdXRpbC5jbGFzc05hbWUoJ3Jvb3QnLCBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZSlcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgICAgcmV0dXJuIFIuZGl2KHtcbiAgICAgICAgY2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZVxuICAgICAgfSxcbiAgICAgICAgZmllbGQuZmllbGRzKCkubWFwKGZ1bmN0aW9uIChmaWVsZCwgaSkge1xuICAgICAgICAgIHJldHVybiBmaWVsZC5jb21wb25lbnQoe2tleTogZmllbGQuZGVmLmtleSB8fCBpfSk7XG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC5oZWxwXG5cbi8qXG5KdXN0IHRoZSBoZWxwIHRleHQgYmxvY2suXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZGlzcGxheU5hbWU6IHBsdWdpbi5uYW1lLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIGNob2ljZSA9IHRoaXMucHJvcHMuY2hvaWNlO1xuXG4gICAgICByZXR1cm4gY2hvaWNlLnNhbXBsZSA/XG4gICAgICAgIFIuZGl2KHtjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lfSxcbiAgICAgICAgICBjaG9pY2Uuc2FtcGxlXG4gICAgICAgICkgOlxuICAgICAgICBSLnNwYW4obnVsbCk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50LnNlbGVjdFxuXG4vKlxuUmVuZGVyIHNlbGVjdCBlbGVtZW50IHRvIGdpdmUgYSB1c2VyIGNob2ljZXMgZm9yIHRoZSB2YWx1ZSBvZiBhIGZpZWxkLiBOb3RlXG5pdCBzaG91bGQgc3VwcG9ydCB2YWx1ZXMgb3RoZXIgdGhhbiBzdHJpbmdzLiBDdXJyZW50bHkgdGhpcyBpcyBvbmx5IHRlc3RlZCBmb3JcbmJvb2xlYW4gdmFsdWVzLCBidXQgaXQgX3Nob3VsZF8gd29yayBmb3Igb3RoZXIgdmFsdWVzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZGlzcGxheU5hbWU6IHBsdWdpbi5uYW1lLFxuXG4gICAgbWl4aW5zOiBbcGx1Z2luLnJlcXVpcmUoJ21peGluLmZpZWxkJyldLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICB2YXIgY2hvaWNlVmFsdWUgPSBldmVudC50YXJnZXQudmFsdWU7XG4gICAgICB2YXIgY2hvaWNlVHlwZSA9IGNob2ljZVZhbHVlLnN1YnN0cmluZygwLCBjaG9pY2VWYWx1ZS5pbmRleE9mKCc6JykpO1xuICAgICAgaWYgKGNob2ljZVR5cGUgPT09ICdjaG9pY2UnKSB7XG4gICAgICAgIHZhciBjaG9pY2VJbmRleCA9IGNob2ljZVZhbHVlLnN1YnN0cmluZyhjaG9pY2VWYWx1ZS5pbmRleE9mKCc6JykgKyAxKTtcbiAgICAgICAgY2hvaWNlSW5kZXggPSBwYXJzZUludChjaG9pY2VJbmRleCk7XG4gICAgICAgIHRoaXMucHJvcHMuZmllbGQudmFsKHRoaXMucHJvcHMuZmllbGQuZGVmLmNob2ljZXNbY2hvaWNlSW5kZXhdLnZhbHVlKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG4gICAgICB2YXIgY2hvaWNlcyA9IGZpZWxkLmRlZi5jaG9pY2VzIHx8IFtdO1xuXG4gICAgICB2YXIgY2hvaWNlc09yTG9hZGluZztcblxuICAgICAgaWYgKGNob2ljZXMubGVuZ3RoID09PSAxICYmIGNob2ljZXNbMF0udmFsdWUgPT09ICcvLy9sb2FkaW5nLy8vJykge1xuICAgICAgICBjaG9pY2VzT3JMb2FkaW5nID0gUi5kaXYoe30sXG4gICAgICAgICAgJ0xvYWRpbmcgY2hvaWNlcy4uLidcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgdmFyIHZhbHVlID0gZmllbGQudmFsdWUgIT09IHVuZGVmaW5lZCA/IGZpZWxkLnZhbHVlIDogJyc7XG5cbiAgICAgICAgY2hvaWNlcyA9IGNob2ljZXMubWFwKGZ1bmN0aW9uIChjaG9pY2UsIGkpIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY2hvaWNlVmFsdWU6ICdjaG9pY2U6JyArIGksXG4gICAgICAgICAgICB2YWx1ZTogY2hvaWNlLnZhbHVlLFxuICAgICAgICAgICAgbGFiZWw6IGNob2ljZS5sYWJlbFxuICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciB2YWx1ZUNob2ljZSA9IF8uZmluZChjaG9pY2VzLCBmdW5jdGlvbiAoY2hvaWNlKSB7XG4gICAgICAgICAgcmV0dXJuIGNob2ljZS52YWx1ZSA9PT0gdmFsdWU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICh2YWx1ZUNob2ljZSA9PT0gdW5kZWZpbmVkKSB7XG5cbiAgICAgICAgICB2YXIgbGFiZWwgPSB2YWx1ZTtcbiAgICAgICAgICBpZiAoIV8uaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgICAgICAgICBsYWJlbCA9IEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFsdWVDaG9pY2UgPSB7XG4gICAgICAgICAgICBjaG9pY2VWYWx1ZTogJ3ZhbHVlOicsXG4gICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICBsYWJlbDogbGFiZWxcbiAgICAgICAgICB9O1xuICAgICAgICAgIGNob2ljZXMgPSBbdmFsdWVDaG9pY2VdLmNvbmNhdChjaG9pY2VzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNob2ljZXNPckxvYWRpbmcgPSBSLnNlbGVjdCh7XG4gICAgICAgICAgY2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZSxcbiAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgICAgICB2YWx1ZTogdmFsdWVDaG9pY2UuY2hvaWNlVmFsdWVcbiAgICAgICAgfSxcbiAgICAgICAgICBjaG9pY2VzLm1hcChmdW5jdGlvbiAoY2hvaWNlLCBpKSB7XG4gICAgICAgICAgICByZXR1cm4gUi5vcHRpb24oe1xuICAgICAgICAgICAgICBrZXk6IGksXG4gICAgICAgICAgICAgIHZhbHVlOiBjaG9pY2UuY2hvaWNlVmFsdWVcbiAgICAgICAgICAgIH0sIGNob2ljZS5sYWJlbCk7XG4gICAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcGx1Z2luLmNvbXBvbmVudCgnZmllbGQnKSh7XG4gICAgICAgIGZpZWxkOiBmaWVsZFxuICAgICAgfSwgY2hvaWNlc09yTG9hZGluZyk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50LnRleHRcblxuLypcbkp1c3QgYSBzaW1wbGUgdGV4dCBpbnB1dC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogcGx1Z2luLm5hbWUsXG5cbiAgICBtaXhpbnM6IFtwbHVnaW4ucmVxdWlyZSgnbWl4aW4uZmllbGQnKV0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIHZhciBuZXdWYWx1ZSA9IGV2ZW50LnRhcmdldC52YWx1ZTtcbiAgICAgIHRoaXMucHJvcHMuZmllbGQudmFsKG5ld1ZhbHVlKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICAgIHJldHVybiBwbHVnaW4uY29tcG9uZW50KCdmaWVsZCcpKHtcbiAgICAgICAgZmllbGQ6IGZpZWxkXG4gICAgICB9LCBSLmlucHV0KHtcbiAgICAgICAgY2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZSxcbiAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICB2YWx1ZTogZmllbGQudmFsdWUsXG4gICAgICAgIHJvd3M6IGZpZWxkLmRlZi5yb3dzLFxuICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZVxuICAgICAgfSkpO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvbXBvbmVudC50ZXh0YXJlYVxuXG4vKlxuSnVzdCBhIHNpbXBsZSBtdWx0aS1yb3cgdGV4dGFyZWEuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZGlzcGxheU5hbWU6IHBsdWdpbi5uYW1lLFxuXG4gICAgbWl4aW5zOiBbcGx1Z2luLnJlcXVpcmUoJ21peGluLmZpZWxkJyldLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lLFxuICAgICAgICByb3dzOiBwbHVnaW4uY29uZmlnLnJvd3MgfHwgNVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgdmFyIG5ld1ZhbHVlID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xuICAgICAgdGhpcy5wcm9wcy5maWVsZC52YWwobmV3VmFsdWUpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgICAgcmV0dXJuIHBsdWdpbi5jb21wb25lbnQoJ2ZpZWxkJykoe1xuICAgICAgICBmaWVsZDogZmllbGRcbiAgICAgIH0sIFIudGV4dGFyZWEoe1xuICAgICAgICBjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lLFxuICAgICAgICB2YWx1ZTogZmllbGQudmFsdWUsXG4gICAgICAgIHJvd3M6IGZpZWxkLmRlZi5yb3dzIHx8IHRoaXMucHJvcHMucm93cyxcbiAgICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2VcbiAgICAgIH0pKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb3JlLmZpZWxkXG5cbi8qXG5UaGUgY29yZSBmaWVsZCBwbHVnaW4gcHJvdmlkZXMgdGhlIEZpZWxkIHByb3RvdHlwZS4gRmllbGRzIHJlcHJlc2VudCBhXG5wYXJ0aWN1bGFyIHN0YXRlIGluIHRpbWUgb2YgYSBmaWVsZCBkZWZpbml0aW9uLCBhbmQgdGhleSBwcm92aWRlIGhlbHBlciBtZXRob2RzXG50byBub3RpZnkgdGhlIGZvcm0gc3RvcmUgb2YgY2hhbmdlcy5cblxuRmllbGRzIGFyZSBsYXppbHkgY3JlYXRlZCBhbmQgZXZhbHVhdGVkLCBidXQgb25jZSBldmFsdWF0ZWQsIHRoZXkgc2hvdWxkIGJlXG5jb25zaWRlcmVkIGltbXV0YWJsZS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHZhciByb3V0ZXIgPSBwbHVnaW4ucmVxdWlyZSgnZmllbGQtcm91dGVyJyk7XG4gIHZhciB1dGlsID0gcGx1Z2luLnJlcXVpcmUoJ3V0aWwnKTtcbiAgdmFyIGV2YWx1YXRvciA9IHBsdWdpbi5yZXF1aXJlKCdldmFsJyk7XG4gIHZhciBjb21waWxlciA9IHBsdWdpbi5yZXF1aXJlKCdjb21waWxlcicpO1xuXG4gIC8vIFRoZSBGaWVsZCBjb25zdHJ1Y3Rvci5cbiAgdmFyIEZpZWxkID0gZnVuY3Rpb24gKGZvcm0sIGRlZiwgdmFsdWUsIHBhcmVudCkge1xuICAgIHZhciBmaWVsZCA9IHRoaXM7XG5cbiAgICBmaWVsZC5mb3JtID0gZm9ybTtcbiAgICBmaWVsZC5kZWYgPSBkZWY7XG4gICAgZmllbGQudmFsdWUgPSB2YWx1ZTtcbiAgICBmaWVsZC5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgZmllbGQuZ3JvdXBzID0ge307XG4gICAgZmllbGQudGVtcENoaWxkcmVuID0gW107XG4gIH07XG5cbiAgLy8gQXR0YWNoIGEgZmllbGQgZmFjdG9yeSB0byB0aGUgZm9ybSBwcm90b3R5cGUuXG4gIHBsdWdpbi5leHBvcnRzLmZpZWxkID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBmb3JtID0gdGhpcztcblxuICAgIHJldHVybiBuZXcgRmllbGQoZm9ybSwge1xuICAgICAgdHlwZTogJ3Jvb3QnXG4gICAgfSwgZm9ybS5zdG9yZS52YWx1ZSk7XG4gIH07XG5cbiAgdmFyIHByb3RvID0gRmllbGQucHJvdG90eXBlO1xuXG4gIC8vIFJldHVybiB0aGUgdHlwZSBwbHVnaW4gZm9yIHRoaXMgZmllbGQuXG4gIHByb3RvLnR5cGVQbHVnaW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGZpZWxkID0gdGhpcztcblxuICAgIGlmICghZmllbGQuX3R5cGVQbHVnaW4pIHtcbiAgICAgIGZpZWxkLl90eXBlUGx1Z2luID0gcGx1Z2luLnJlcXVpcmUoJ3R5cGUuJyArIGZpZWxkLmRlZi50eXBlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmllbGQuX3R5cGVQbHVnaW47XG4gIH07XG5cbiAgLy8gR2V0IGEgY29tcG9uZW50IGZvciB0aGlzIGZpZWxkLlxuICBwcm90by5jb21wb25lbnQgPSBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzO1xuICAgIHByb3BzID0gXy5leHRlbmQoe30sIHByb3BzLCB7ZmllbGQ6IGZpZWxkfSk7XG4gICAgdmFyIGNvbXBvbmVudCA9IHJvdXRlci5jb21wb25lbnRGb3JGaWVsZChmaWVsZCk7XG4gICAgcmV0dXJuIGNvbXBvbmVudChwcm9wcyk7XG4gIH07XG5cbiAgLy8gR2V0IHRoZSBjaGlsZCBmaWVsZHMgZm9yIHRoaXMgZmllbGQuXG4gIHByb3RvLmZpZWxkcyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzO1xuXG4gICAgaWYgKCFmaWVsZC5fZmllbGRzKSB7XG4gICAgICB2YXIgZmllbGRzO1xuICAgICAgaWYgKGZpZWxkLnR5cGVQbHVnaW4oKS5maWVsZHMpIHtcbiAgICAgICAgZmllbGRzID0gZmllbGQudHlwZVBsdWdpbigpLmZpZWxkcyhmaWVsZCk7XG4gICAgICB9IGVsc2UgaWYgKGZpZWxkLmRlZi5maWVsZHMpIHtcbiAgICAgICAgZmllbGRzID0gZmllbGQuZGVmLmZpZWxkcy5tYXAoZnVuY3Rpb24gKGRlZikge1xuICAgICAgICAgIHJldHVybiBmaWVsZC5jcmVhdGVDaGlsZChkZWYpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZpZWxkcyA9IFtdO1xuICAgICAgfVxuICAgICAgZmllbGQuX2ZpZWxkcyA9IGZpZWxkcztcbiAgICB9XG5cbiAgICByZXR1cm4gZmllbGQuX2ZpZWxkcztcbiAgfTtcblxuICAvLyBHZXQgdGhlIGl0ZW1zIChjaGlsZCBmaWVsZCBkZWZpbml0aW9ucykgZm9yIHRoaXMgZmllbGQuXG4gIHByb3RvLml0ZW1zID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBmaWVsZCA9IHRoaXM7XG5cbiAgICBpZiAoIWZpZWxkLl9pdGVtcykge1xuICAgICAgaWYgKF8uaXNBcnJheShmaWVsZC5kZWYuaXRlbXMpKSB7XG4gICAgICAgIGZpZWxkLl9pdGVtcyA9IGZpZWxkLmRlZi5pdGVtcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICByZXR1cm4gZmllbGQucmVzb2x2ZShpdGVtKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmaWVsZC5faXRlbXMgPSBbXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmllbGQuX2l0ZW1zO1xuICB9O1xuXG4gIC8vIFJlc29sdmUgYSBmaWVsZCByZWZlcmVuY2UgaWYgbmVjZXNzYXJ5LlxuICBwcm90by5yZXNvbHZlID0gZnVuY3Rpb24gKGRlZikge1xuICAgIHZhciBmaWVsZCA9IHRoaXM7XG5cbiAgICBpZiAoXy5pc1N0cmluZyhkZWYpKSB7XG4gICAgICBkZWYgPSBmaWVsZC5mb3JtLmZpbmREZWYoZGVmKTtcbiAgICAgIGlmICghZGVmKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGZpbmQgZmllbGQ6ICcgKyBkZWYpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBkZWY7XG4gIH07XG5cbiAgLy8gRXZhbHVhdGUgYSBmaWVsZCBkZWZpbml0aW9uIGFuZCByZXR1cm4gYSBuZXcgZmllbGQgZGVmaW5pdGlvbi5cbiAgcHJvdG8uZXZhbERlZiA9IGZ1bmN0aW9uIChkZWYpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzO1xuXG4gICAgaWYgKGRlZi5ldmFsKSB7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIHZhciBleHREZWYgPSBmaWVsZC5ldmFsKGRlZi5ldmFsKTtcbiAgICAgICAgaWYgKGV4dERlZikge1xuICAgICAgICAgIGRlZiA9IF8uZXh0ZW5kKHt9LCBkZWYsIGV4dERlZik7XG4gICAgICAgICAgaWYgKGRlZi5maWVsZHMpIHtcbiAgICAgICAgICAgIGRlZi5maWVsZHMgPSBkZWYuZmllbGRzLm1hcChmdW5jdGlvbiAoY2hpbGREZWYpIHtcbiAgICAgICAgICAgICAgY2hpbGREZWYgPSBjb21waWxlci5leHBhbmREZWYoY2hpbGREZWYsIGZpZWxkLmZvcm0uc3RvcmUudGVtcGxhdGVNYXApO1xuICAgICAgICAgICAgICByZXR1cm4gY29tcGlsZXIuY29tcGlsZURlZihjaGlsZERlZik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZGVmID0gY29tcGlsZXIuY29tcGlsZURlZihkZWYpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdQcm9ibGVtIGluIGV2YWw6ICcsIEpTT04uc3RyaW5naWZ5KGRlZi5ldmFsKSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGUubWVzc2FnZSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGUuc3RhY2spO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBkZWY7XG4gIH07XG5cbiAgLy8gRXZhbHVhdGUgYW4gZXhwcmVzc2lvbiBpbiB0aGUgY29udGV4dCBvZiBhIGZpZWxkLlxuICBwcm90by5ldmFsID0gZnVuY3Rpb24gKGV4cHJlc3Npb24sIGNvbnRleHQpIHtcbiAgICByZXR1cm4gZXZhbHVhdG9yLmV2YWx1YXRlKGV4cHJlc3Npb24sIHRoaXMsIGNvbnRleHQpO1xuICB9O1xuXG4gIC8vIENyZWF0ZSBhIGNoaWxkIGZpZWxkIGZyb20gYSBkZWZpbml0aW9uLlxuICBwcm90by5jcmVhdGVDaGlsZCA9IGZ1bmN0aW9uIChkZWYpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzO1xuXG4gICAgZGVmID0gZmllbGQucmVzb2x2ZShkZWYpO1xuXG4gICAgdmFyIHZhbHVlID0gZmllbGQudmFsdWU7XG5cbiAgICBkZWYgPSBmaWVsZC5ldmFsRGVmKGRlZik7XG5cbiAgICBpZiAoIXV0aWwuaXNCbGFuayhkZWYua2V5KSkge1xuICAgICAgaWYgKHZhbHVlICYmICFfLmlzVW5kZWZpbmVkKHZhbHVlW2RlZi5rZXldKSkge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlW2RlZi5rZXldO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlID0gZGVmLnZhbHVlO1xuICAgIH1cblxuICAgIHZhciBjaGlsZEZpZWxkID0gbmV3IEZpZWxkKGZpZWxkLmZvcm0sIGRlZiwgdmFsdWUsIGZpZWxkKTtcblxuICAgIGZpZWxkLnRlbXBDaGlsZHJlbi5wdXNoKGNoaWxkRmllbGQpO1xuXG4gICAgcmV0dXJuIGNoaWxkRmllbGQ7XG5cbiAgICAvLyBpZiAoZGVmLmV2YWwpIHtcbiAgICAvLyAgIGRlZiA9IGNoaWxkRmllbGQuZXZhbERlZihkZWYpO1xuICAgIC8vICAgaWYgKHV0aWwuaXNCbGFuayhkZWYua2V5KSkge1xuICAgIC8vICAgICB2YWx1ZSA9IGRlZi52YWx1ZTtcbiAgICAvLyAgIH1cbiAgICAvLyAgIGNoaWxkRmllbGQgPSBuZXcgRmllbGQoZmllbGQuZm9ybSwgZGVmLCB2YWx1ZSwgZmllbGQpO1xuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIHJldHVybiBjaGlsZEZpZWxkO1xuICB9O1xuXG4gIC8vIEdpdmVuIGEgdmFsdWUsIGZpbmQgYW4gYXBwcm9wcmlhdGUgZmllbGQgZGVmaW5pdGlvbiBmb3IgdGhpcyBmaWVsZC5cbiAgcHJvdG8uaXRlbUZvclZhbHVlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFyIGZpZWxkID0gdGhpcztcblxuICAgIHZhciBpdGVtID0gXy5maW5kKGZpZWxkLml0ZW1zKCksIGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICByZXR1cm4gdXRpbC5pdGVtTWF0Y2hlc1ZhbHVlKGl0ZW0sIHZhbHVlKTtcbiAgICB9KTtcbiAgICBpZiAoaXRlbSkge1xuICAgICAgaXRlbSA9IF8uZXh0ZW5kKHt9LCBpdGVtKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaXRlbSA9IHV0aWwuZmllbGREZWZGcm9tVmFsdWUodmFsdWUpO1xuICAgIH1cblxuICAgIHJldHVybiBpdGVtO1xuICB9O1xuXG4gIC8vIEdldCBhbGwgdGhlIGZpZWxkcyBiZWxvbmdpbmcgdG8gYSBncm91cC5cbiAgcHJvdG8uZ3JvdXBGaWVsZHMgPSBmdW5jdGlvbiAoZ3JvdXBOYW1lLCBpZ25vcmVUZW1wQ2hpbGRyZW4pIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzO1xuXG4gICAgaWYgKCFmaWVsZC5ncm91cHNbZ3JvdXBOYW1lXSkge1xuICAgICAgZmllbGQuZ3JvdXBzW2dyb3VwTmFtZV0gPSBbXTtcblxuICAgICAgaWYgKGZpZWxkLnBhcmVudCkge1xuICAgICAgICB2YXIgc2libGluZ3MgPSBmaWVsZC5wYXJlbnQuZmllbGRzKCk7XG4gICAgICAgIHNpYmxpbmdzLmZvckVhY2goZnVuY3Rpb24gKHNpYmxpbmcpIHtcbiAgICAgICAgICBpZiAoc2libGluZyAhPT0gZmllbGQgJiYgc2libGluZy5kZWYuZ3JvdXAgPT09IGdyb3VwTmFtZSkge1xuICAgICAgICAgICAgZmllbGQuZ3JvdXBzW2dyb3VwTmFtZV0ucHVzaChzaWJsaW5nKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgcGFyZW50R3JvdXBGaWVsZHMgPSBmaWVsZC5wYXJlbnQuZ3JvdXBGaWVsZHMoZ3JvdXBOYW1lLCB0cnVlKTtcbiAgICAgICAgZmllbGQuZ3JvdXBzW2dyb3VwTmFtZV0gPSBmaWVsZC5ncm91cHNbZ3JvdXBOYW1lXS5jb25jYXQocGFyZW50R3JvdXBGaWVsZHMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghaWdub3JlVGVtcENoaWxkcmVuICYmIGZpZWxkLmdyb3Vwc1tncm91cE5hbWVdLmxlbmd0aCA9PT0gMCkge1xuICAgICAgLy8gbG9va2luZyBhdCBjaGlsZHJlbiBzbyBmYXJcbiAgICAgIHZhciBjaGlsZEdyb3VwRmllbGRzID0gW107XG4gICAgICBmaWVsZC50ZW1wQ2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbiAoY2hpbGQpIHtcbiAgICAgICAgaWYgKGNoaWxkLmRlZi5ncm91cCA9PT0gZ3JvdXBOYW1lKSB7XG4gICAgICAgICAgY2hpbGRHcm91cEZpZWxkcy5wdXNoKGNoaWxkKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gY2hpbGRHcm91cEZpZWxkcztcbiAgICB9XG5cbiAgICByZXR1cm4gZmllbGQuZ3JvdXBzW2dyb3VwTmFtZV07XG4gIH07XG5cbiAgLy8gV2FsayBiYWNrd2FyZHMgdGhyb3VnaCBwYXJlbnRzIGFuZCBidWlsZCBvdXQgYSBwYXRoIGFycmF5IHRvIHRoZSB2YWx1ZS5cbiAgcHJvdG8udmFsdWVQYXRoID0gZnVuY3Rpb24gKGNoaWxkUGF0aCkge1xuICAgIHZhciBmaWVsZCA9IHRoaXM7XG5cbiAgICB2YXIgcGF0aCA9IGNoaWxkUGF0aCB8fCBbXTtcbiAgICBpZiAoIXV0aWwuaXNCbGFuayhmaWVsZC5kZWYua2V5KSkge1xuICAgICAgcGF0aCA9IFtmaWVsZC5kZWYua2V5XS5jb25jYXQocGF0aCk7XG4gICAgfVxuICAgIGlmIChmaWVsZC5wYXJlbnQpIHtcbiAgICAgIHJldHVybiBmaWVsZC5wYXJlbnQudmFsdWVQYXRoKHBhdGgpO1xuICAgIH1cbiAgICByZXR1cm4gcGF0aDtcbiAgfTtcblxuICAvLyBTZXQgdGhlIHZhbHVlIGZvciB0aGlzIGZpZWxkLlxuICBwcm90by52YWwgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzO1xuXG4gICAgZmllbGQuZm9ybS5hY3Rpb25zLnNldFZhbHVlKGZpZWxkLnZhbHVlUGF0aCgpLCB2YWx1ZSk7XG4gIH07XG5cbiAgLy8gUmVtb3ZlIGEgY2hpbGQgdmFsdWUgZnJvbSB0aGlzIGZpZWxkLlxuICBwcm90by5yZW1vdmUgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIGZpZWxkID0gdGhpcztcblxuICAgIHZhciBwYXRoID0gZmllbGQudmFsdWVQYXRoKCkuY29uY2F0KGtleSk7XG5cbiAgICBmaWVsZC5mb3JtLmFjdGlvbnMucmVtb3ZlVmFsdWUocGF0aCk7XG4gIH07XG5cbiAgLy8gTW92ZSBhIGNoaWxkIHZhbHVlIGZyb20gb25lIGtleSB0byBhbm90aGVyLlxuICBwcm90by5tb3ZlID0gZnVuY3Rpb24gKGZyb21LZXksIHRvS2V5KSB7XG4gICAgdmFyIGZpZWxkID0gdGhpcztcblxuICAgIGZpZWxkLmZvcm0uYWN0aW9ucy5tb3ZlVmFsdWUoZmllbGQudmFsdWVQYXRoKCksIGZyb21LZXksIHRvS2V5KTtcbiAgfTtcblxuICAvLyBHZXQgdGhlIGRlZmF1bHQgdmFsdWUgZm9yIHRoaXMgZmllbGQuXG4gIHByb3RvLmRlZmF1bHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGZpZWxkID0gdGhpcztcblxuICAgIGlmICghXy5pc1VuZGVmaW5lZChmaWVsZC5kZWYudmFsdWUpKSB7XG4gICAgICByZXR1cm4gdXRpbC5jb3B5VmFsdWUoZmllbGQuZGVmLnZhbHVlKTtcbiAgICB9XG5cbiAgICBpZiAoIV8uaXNVbmRlZmluZWQoZmllbGQuZGVmLmRlZmF1bHQpKSB7XG4gICAgICByZXR1cm4gdXRpbC5jb3B5VmFsdWUoZmllbGQuZGVmLmRlZmF1bHQpO1xuICAgIH1cblxuICAgIGlmICghXy5pc1VuZGVmaW5lZChmaWVsZC50eXBlUGx1Z2luKCkuZGVmYXVsdCkpIHtcbiAgICAgIHJldHVybiB1dGlsLmNvcHlWYWx1ZShmaWVsZC50eXBlUGx1Z2luKCkuZGVmYXVsdCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG5cbiAgLy8gQXBwZW5kIGEgbmV3IHZhbHVlLiBVc2UgdGhlIGBpdGVtSW5kZXhgIHRvIGdldCBhbiBhcHByb3ByaWF0ZVxuICAvLyBpdGVtLCBpbmZsYXRlIGl0LCBhbmQgY3JlYXRlIGEgZGVmYXVsdCB2YWx1ZS5cbiAgcHJvdG8uYXBwZW5kID0gZnVuY3Rpb24gKGl0ZW1JbmRleCkge1xuICAgIHZhciBmaWVsZCA9IHRoaXM7XG5cbiAgICB2YXIgaXRlbSA9IGZpZWxkLml0ZW1zKClbaXRlbUluZGV4XTtcbiAgICBpdGVtID0gXy5leHRlbmQoaXRlbSk7XG5cbiAgICBpdGVtLmtleSA9IGZpZWxkLnZhbHVlLmxlbmd0aDtcblxuICAgIHZhciBjaGlsZCA9IGZpZWxkLmNyZWF0ZUNoaWxkKGl0ZW0pO1xuXG4gICAgdmFyIG9iaiA9IGNoaWxkLmRlZmF1bHQoKTtcblxuICAgIGlmIChfLmlzQXJyYXkob2JqKSB8fCBfLmlzT2JqZWN0KG9iaikpIHtcbiAgICAgIHZhciBjaG9wID0gZmllbGQudmFsdWVQYXRoKCkubGVuZ3RoICsgMTtcblxuICAgICAgY2hpbGQuaW5mbGF0ZShmdW5jdGlvbiAocGF0aCwgdmFsdWUpIHtcbiAgICAgICAgb2JqID0gdXRpbC5zZXRJbihvYmosIHBhdGguc2xpY2UoY2hvcCksIHZhbHVlKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZpZWxkLmZvcm0uYWN0aW9ucy5hcHBlbmRWYWx1ZShmaWVsZC52YWx1ZVBhdGgoKSwgb2JqKTtcbiAgfTtcblxuICAvLyBEZXRlcm1pbmUgd2hldGhlciB0aGUgZmllbGQgaXMgaGlkZGVuLlxuICBwcm90by5oaWRkZW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGZpZWxkID0gdGhpcztcblxuICAgIHJldHVybiBmaWVsZC5kZWYuaGlkZGVuIHx8IGZpZWxkLnR5cGVQbHVnaW4oKS5oaWRkZW47XG4gIH07XG5cbiAgLy8gRXhwYW5kIGFsbCBjaGlsZCBmaWVsZHMgYW5kIGNhbGwgdGhlIHNldHRlciBmdW5jdGlvbiB3aXRoIHRoZSBkZWZhdWx0XG4gIC8vIHZhbHVlcyBhdCBlYWNoIHBhdGguXG4gIHByb3RvLmluZmxhdGUgPSBmdW5jdGlvbiAob25TZXRWYWx1ZSkge1xuICAgIHZhciBmaWVsZCA9IHRoaXM7XG5cbiAgICBpZiAoIXV0aWwuaXNCbGFuayhmaWVsZC5kZWYua2V5KSAmJiBfLmlzVW5kZWZpbmVkKGZpZWxkLnZhbHVlKSkge1xuICAgICAgb25TZXRWYWx1ZShmaWVsZC52YWx1ZVBhdGgoKSwgZmllbGQuZGVmYXVsdCgpKTtcbiAgICB9XG5cbiAgICB2YXIgZmllbGRzID0gZmllbGQuZmllbGRzKCk7XG5cbiAgICBmaWVsZHMuZm9yRWFjaChmdW5jdGlvbiAoY2hpbGQpIHtcbiAgICAgIGNoaWxkLmluZmxhdGUob25TZXRWYWx1ZSk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gQ2FsbGVkIGZyb20gdW5tb3VudC4gV2hlbiBmaWVsZHMgYXJlIHJlbW92ZWQgZm9yIHdoYXRldmVyIHJlYXNvbiwgd2VcbiAgLy8gc2hvdWxkIGRlbGV0ZSB0aGUgY29ycmVzcG9uZGluZyB2YWx1ZS5cbiAgcHJvdG8uZXJhc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGZpZWxkID0gdGhpcztcbiAgICBpZiAoIXV0aWwuaXNCbGFuayhmaWVsZC5kZWYua2V5KSAmJiAhXy5pc1VuZGVmaW5lZChmaWVsZC52YWx1ZSkpIHtcbiAgICAgIGZpZWxkLmZvcm0uYWN0aW9ucy5lcmFzZVZhbHVlKGZpZWxkLnZhbHVlUGF0aCgpLCB7fSk7XG4gICAgfVxuICB9O1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiLy8gIyBjb3JlLmZvcm0taW5pdFxuXG4vKlxuVGhpcyBwbHVnaW4gbWFrZXMgaXQgZWFzeSB0byBob29rIGludG8gZm9ybSBpbml0aWFsaXphdGlvbiwgd2l0aG91dCBoYXZpbmcgdG9cbmNvbmZpZ3VyZSBhbGwgdGhlIG90aGVyIGNvcmUgcGx1Z2lucy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgdmFyIGluaXRQbHVnaW5zID0gcGx1Z2luLnJlcXVpcmVBbGwocGx1Z2luLmNvbmZpZy5pbml0KTtcblxuICB2YXIgcHJvdG8gPSBwbHVnaW4uZXhwb3J0cztcblxuICBwcm90by5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBmb3JtID0gdGhpcztcblxuICAgIGluaXRQbHVnaW5zLmZvckVhY2goZnVuY3Rpb24gKHBsdWdpbikge1xuICAgICAgcGx1Z2luLmFwcGx5KGZvcm0sIGFyZ3VtZW50cyk7XG4gICAgfSk7XG4gIH07XG59O1xuIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb3JlLmZvcm1cblxuLypcblRoZSBjb3JlIGZvcm0gcGx1Z2luIHN1cHBsaWVzIG1ldGhvZHMgdGhhdCBnZXQgYWRkZWQgdG8gdGhlIEZvcm0gcHJvdG90eXBlLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcbnZhciBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudGVtaXR0ZXIzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHZhciBwcm90byA9IHBsdWdpbi5leHBvcnRzO1xuXG4gIC8vIEdldCB0aGUgc3RvcmUgcGx1Z2luLlxuICB2YXIgY3JlYXRlU3RvcmUgPSBwbHVnaW4ucmVxdWlyZShwbHVnaW4uY29uZmlnLnN0b3JlKTtcblxuICB2YXIgdXRpbCA9IHBsdWdpbi5yZXF1aXJlKCd1dGlsJyk7XG4gIHZhciBsb2FkZXIgPSBwbHVnaW4ucmVxdWlyZSgnbG9hZGVyJyk7XG5cbiAgLy8gSGVscGVyIHRvIGNyZWF0ZSBhY3Rpb25zLCB3aGljaCB3aWxsIHRlbGwgdGhlIHN0b3JlIHRoYXQgc29tZXRoaW5nIGhhc1xuICAvLyBoYXBwZW5lZC4gTm90ZSB0aGF0IGFjdGlvbnMgZ28gc3RyYWlnaHQgdG8gdGhlIHN0b3JlLiBObyBldmVudHMsXG4gIC8vIGRpc3BhdGNoZXIsIGV0Yy5cbiAgdmFyIGNyZWF0ZVN5bmNBY3Rpb25zID0gZnVuY3Rpb24gKHN0b3JlLCBuYW1lcykge1xuICAgIHZhciBhY3Rpb25zID0ge307XG4gICAgbmFtZXMuZm9yRWFjaChmdW5jdGlvbiAobmFtZSkge1xuICAgICAgYWN0aW9uc1tuYW1lXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc3RvcmVbbmFtZV0uYXBwbHkoc3RvcmUsIGFyZ3VtZW50cyk7XG4gICAgICB9O1xuICAgIH0pO1xuICAgIHJldHVybiBhY3Rpb25zO1xuICB9O1xuXG4gIC8vIEluaXRpYWxpemUgdGhlIGZvcm0gaW5zdGFuY2UuXG4gIHByb3RvLmluaXQgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIHZhciBmb3JtID0gdGhpcztcblxuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgLy8gTmVlZCBhbiBlbWl0dGVyIHRvIGVtaXQgY2hhbmdlIGV2ZW50cyBmcm9tIHRoZSBzdG9yZS5cbiAgICB2YXIgc3RvcmVFbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gICAgLy8gQ3JlYXRlIGEgc3RvcmUuXG4gICAgZm9ybS5zdG9yZSA9IGNyZWF0ZVN0b3JlKGZvcm0sIHN0b3JlRW1pdHRlciwgb3B0aW9ucyk7XG5cbiAgICAvLyBDcmVhdGUgdGhlIGFjdGlvbnMgdG8gbm90aWZ5IHRoZSBzdG9yZSBvZiBjaGFuZ2VzLlxuICAgIGZvcm0uYWN0aW9ucyA9IGNyZWF0ZVN5bmNBY3Rpb25zKGZvcm0uc3RvcmUsIFsnc2V0VmFsdWUnLCAnc2V0RmllbGRzJywgJ3JlbW92ZVZhbHVlJywgJ2FwcGVuZFZhbHVlJywgJ21vdmVWYWx1ZScsICdlcmFzZVZhbHVlJywgJ3NldE1ldGEnXSk7XG5cbiAgICAvLyBTZWVkIHRoZSB2YWx1ZSBmcm9tIGFueSBmaWVsZHMuXG4gICAgZm9ybS5zdG9yZS5pbmZsYXRlKCk7XG5cbiAgICAvLyBBZGQgb24vb2ZmIHRvIGdldCBjaGFuZ2UgZXZlbnRzIGZyb20gZm9ybS5cbiAgICBmb3JtLm9uID0gc3RvcmVFbWl0dGVyLm9uLmJpbmQoc3RvcmVFbWl0dGVyKTtcbiAgICBmb3JtLm9mZiA9IHN0b3JlRW1pdHRlci5vZmYuYmluZChzdG9yZUVtaXR0ZXIpO1xuICAgIGZvcm0ub25jZSA9IHN0b3JlRW1pdHRlci5vbmNlLmJpbmQoc3RvcmVFbWl0dGVyKTtcbiAgfTtcblxuICAvLyBHZXQgdGhlIHJvb3QgY29tcG9uZW50IGZvciBhIGZvcm0uXG4gIHByb3RvLmNvbXBvbmVudCA9IGZ1bmN0aW9uIChwcm9wcykge1xuXG4gICAgdmFyIGZvcm0gPSB0aGlzO1xuXG4gICAgcHJvcHMgPSBfLmV4dGVuZCh7fSwgcHJvcHMsIHtcbiAgICAgIGZvcm06IGZvcm1cbiAgICB9KTtcblxuICAgIHZhciBjb21wb25lbnQgPSBwbHVnaW4uY29tcG9uZW50KCdmb3JtYXRpYycpO1xuXG4gICAgcmV0dXJuIGNvbXBvbmVudChwcm9wcyk7XG4gIH07XG5cbiAgLy8gR2V0IG9yIHNldCB0aGUgdmFsdWUgb2YgYSBmb3JtLlxuICBwcm90by52YWwgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YXIgZm9ybSA9IHRoaXM7XG5cbiAgICBpZiAoIV8uaXNVbmRlZmluZWQodmFsdWUpKSB7XG4gICAgICByZXR1cm4gZm9ybS5hY3Rpb25zLnNldFZhbHVlKHZhbHVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdXRpbC5jb3B5VmFsdWUoZm9ybS5zdG9yZS52YWx1ZSk7XG4gIH07XG5cbiAgLy8gU2V0L2NoYW5nZSB0aGUgZmllbGRzIGZvciBhIGZvcm0uXG4gIHByb3RvLmZpZWxkcyA9IGZ1bmN0aW9uIChmaWVsZHMpIHtcbiAgICB2YXIgZm9ybSA9IHRoaXM7XG5cbiAgICBmb3JtLmFjdGlvbnMuc2V0RmllbGRzKGZpZWxkcyk7XG4gIH07XG5cbiAgLy8gRmluZCBhIGZpZWxkIHRlbXBsYXRlIGdpdmVuIGEga2V5LlxuICBwcm90by5maW5kRGVmID0gZnVuY3Rpb24gKGtleSkge1xuICAgIHZhciBmb3JtID0gdGhpcztcblxuICAgIHJldHVybiBmb3JtLnN0b3JlLnRlbXBsYXRlTWFwW2tleV0gfHwgbnVsbDtcbiAgfTtcblxuICAvLyBHZXQgb3Igc2V0IG1ldGFkYXRhLlxuICBwcm90by5tZXRhID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICB2YXIgZm9ybSA9IHRoaXM7XG5cbiAgICBpZiAoIV8uaXNVbmRlZmluZWQodmFsdWUpKSB7XG4gICAgICByZXR1cm4gZm9ybS5hY3Rpb25zLnNldE1ldGEoa2V5LCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZvcm0uc3RvcmUubWV0YVtrZXldO1xuICB9O1xuXG4gIC8vIExvYWQgbWV0YWRhdGEuXG4gIHByb3RvLmxvYWRNZXRhID0gZnVuY3Rpb24gKHNvdXJjZSwgcGFyYW1zKSB7XG4gICAgcGFyYW1zID0gcGFyYW1zIHx8IHt9O1xuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMocGFyYW1zKTtcbiAgICB2YXIgdmFsaWRLZXlzID0ga2V5cy5maWx0ZXIoZnVuY3Rpb24gKGtleSkge1xuICAgICAgcmV0dXJuIHBhcmFtc1trZXldO1xuICAgIH0pO1xuICAgIGlmICh2YWxpZEtleXMubGVuZ3RoIDwga2V5cy5sZW5ndGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbG9hZGVyLmxvYWRNZXRhKHRoaXMsIHNvdXJjZSwgcGFyYW1zKTtcbiAgfTtcblxuICAvLyBBZGQgYSBtZXRkYXRhIHNvdXJjZSBmdW5jdGlvbiwgdmlhIHRoZSBsb2FkZXIgcGx1Z2luLlxuICBwcm90by5zb3VyY2UgPSBsb2FkZXIuc291cmNlO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb3JlLmZvcm1hdGljXG5cbi8qXG5UaGUgY29yZSBmb3JtYXRpYyBwbHVnaW4gYWRkcyBtZXRob2RzIHRvIHRoZSBmb3JtYXRpYyBpbnN0YW5jZS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHZhciBmID0gcGx1Z2luLmV4cG9ydHM7XG5cbiAgLy8gVXNlIHRoZSBmaWVsZC1yb3V0ZXIgcGx1Z2luIGFzIHRoZSByb3V0ZXIuXG4gIHZhciByb3V0ZXIgPSBwbHVnaW4ucmVxdWlyZSgnZmllbGQtcm91dGVyJyk7XG5cbiAgLy8gUm91dGUgYSBmaWVsZCB0byBhIGNvbXBvbmVudC5cbiAgZi5yb3V0ZSA9IHJvdXRlci5yb3V0ZTtcblxuICAvLyBSZW5kZXIgYSBjb21wb25lbnQgdG8gYSBub2RlLlxuICBmLnJlbmRlciA9IGZ1bmN0aW9uIChjb21wb25lbnQsIG5vZGUpIHtcblxuICAgIFJlYWN0LnJlbmRlckNvbXBvbmVudChjb21wb25lbnQsIG5vZGUpO1xuICB9O1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBjb21waWxlclxuXG4vLyBUaGUgY29tcGlsZXIgcGx1Z2luIGtub3dzIGhvdyB0byBub3JtYWxpemUgZmllbGQgZGVmaW5pdGlvbnMgaW50byBzdGFuZGFyZFxuLy8gZmllbGQgZGVmaW5pdGlvbnMgdGhhdCBjYW4gYmUgdW5kZXJzdG9vZCBiZSByb3V0ZXJzIGFuZCBjb21wb25lbnRzLlxuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICAvLyBHcmFiIGFsbCB0aGUgY29tcGlsZXIgcGx1Z2lucyB3aGljaCBjYW4gYmUgc3RhY2tlZC5cbiAgdmFyIGNvbXBpbGVyUGx1Z2lucyA9IHBsdWdpbi5yZXF1aXJlQWxsKHBsdWdpbi5jb25maWcuY29tcGlsZXJzKTtcblxuICB2YXIgdXRpbCA9IHBsdWdpbi5yZXF1aXJlKCd1dGlsJyk7XG5cbiAgdmFyIGNvbXBpbGVyID0gcGx1Z2luLmV4cG9ydHM7XG5cbiAgLy8gRm9yIGEgc2V0IG9mIGZpZWxkcywgbWFrZSBhIG1hcCBvZiB0ZW1wbGF0ZSBuYW1lcyB0byBmaWVsZCBkZWZpbml0aW9ucy4gQWxsXG4gIC8vIGZpZWxkIGRlZmluaXRpb25zIGNhbiBiZSB1c2VkIGFzIHRlbXBsYXRlcywgd2hldGhlciBtYXJrZWQgYXMgdGVtcGxhdGVzIG9yXG4gIC8vIG5vdC5cbiAgY29tcGlsZXIudGVtcGxhdGVNYXAgPSBmdW5jdGlvbiAoZmllbGRzKSB7XG4gICAgdmFyIG1hcCA9IHt9O1xuICAgIGZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgaWYgKGZpZWxkLmtleSkge1xuICAgICAgICBtYXBbZmllbGQua2V5XSA9IGZpZWxkO1xuICAgICAgfVxuICAgICAgaWYgKGZpZWxkLmlkKSB7XG4gICAgICAgIG1hcFtmaWVsZC5pZF0gPSBmaWVsZDtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gbWFwO1xuICB9O1xuXG4gIC8vIEZpZWxkcyBhbmQgaXRlbXMgY2FuIGV4dGVuZCBvdGhlciBmaWVsZCBkZWZpbml0aW9ucy4gRmllbGRzIGNhbiBhbHNvIGhhdmVcbiAgLy8gY2hpbGQgZmllbGRzIHRoYXQgcG9pbnQgdG8gb3RoZXIgZmllbGQgZGVmaW5pdGlvbnMuIEhlcmUsIHdlIGV4cGFuZCBhbGxcbiAgLy8gdGhvc2Ugb3V0IHNvIHRoYXQgY29tcG9uZW50cyBkb24ndCBoYXZlIHRvIHdvcnJ5IGFib3V0IHRoaXMuXG4gIGNvbXBpbGVyLmV4cGFuZERlZiA9IGZ1bmN0aW9uIChkZWYsIHRlbXBsYXRlTWFwKSB7XG4gICAgdmFyIGlzVGVtcGxhdGUgPSBkZWYudGVtcGxhdGU7XG4gICAgdmFyIGV4dCA9IGRlZi5leHRlbmRzO1xuICAgIGlmIChfLmlzU3RyaW5nKGV4dCkpIHtcbiAgICAgIGV4dCA9IFtleHRdO1xuICAgIH1cbiAgICBpZiAoZXh0KSB7XG4gICAgICB2YXIgYmFzZXMgPSBleHQubWFwKGZ1bmN0aW9uIChiYXNlKSB7XG4gICAgICAgIHZhciB0ZW1wbGF0ZSA9IHRlbXBsYXRlTWFwW2Jhc2VdO1xuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUZW1wbGF0ZSAnICsgYmFzZSArICcgbm90IGZvdW5kLicpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgICAgIH0pO1xuICAgICAgdmFyIGNoYWluID0gW3t9XS5jb25jYXQoYmFzZXMucmV2ZXJzZSgpLmNvbmNhdChbZGVmXSkpO1xuICAgICAgZGVmID0gXy5leHRlbmQuYXBwbHkoXywgY2hhaW4pO1xuICAgIH1cbiAgICBpZiAoZGVmLmZpZWxkcykge1xuICAgICAgZGVmLmZpZWxkcyA9IGRlZi5maWVsZHMubWFwKGZ1bmN0aW9uIChjaGlsZERlZikge1xuICAgICAgICBpZiAoIV8uaXNTdHJpbmcoY2hpbGREZWYpKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbXBpbGVyLmV4cGFuZERlZihjaGlsZERlZiwgdGVtcGxhdGVNYXApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjaGlsZERlZjtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoZGVmLml0ZW1zKSB7XG4gICAgICBkZWYuaXRlbXMgPSBkZWYuaXRlbXMubWFwKGZ1bmN0aW9uIChpdGVtRGVmKSB7XG4gICAgICAgIGlmICghXy5pc1N0cmluZyhpdGVtRGVmKSkge1xuICAgICAgICAgIHJldHVybiBjb21waWxlci5leHBhbmREZWYoaXRlbURlZiwgdGVtcGxhdGVNYXApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpdGVtRGVmO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGlmICghaXNUZW1wbGF0ZSAmJiBkZWYudGVtcGxhdGUpIHtcbiAgICAgIGRlbGV0ZSBkZWYudGVtcGxhdGU7XG4gICAgfVxuICAgIHJldHVybiBkZWY7XG4gIH07XG5cbiAgLy8gRm9yIGFuIGFycmF5IG9mIGZpZWxkIGRlZmluaXRpb25zLCBleHBhbmQgZWFjaCBmaWVsZCBkZWZpbml0aW9uLlxuICBjb21waWxlci5leHBhbmRGaWVsZHMgPSBmdW5jdGlvbiAoZmllbGRzKSB7XG4gICAgdmFyIHRlbXBsYXRlTWFwID0gY29tcGlsZXIudGVtcGxhdGVNYXAoZmllbGRzKTtcbiAgICByZXR1cm4gZmllbGRzLm1hcChmdW5jdGlvbiAoZGVmKSB7XG4gICAgICByZXR1cm4gY29tcGlsZXIuZXhwYW5kRGVmKGRlZiwgdGVtcGxhdGVNYXApO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIFJ1biBhIGZpZWxkIGRlZmluaXRpb24gdGhyb3VnaCBhbGwgYXZhaWxhYmxlIGNvbXBpbGVycy5cbiAgY29tcGlsZXIuY29tcGlsZURlZiA9IGZ1bmN0aW9uIChkZWYpIHtcblxuICAgIC8vY29uc29sZS5sb2coJ2luOicsIEpTT04uc3RyaW5naWZ5KGRlZikpXG5cbiAgICBkZWYgPSB1dGlsLmRlZXBDb3B5KGRlZik7XG5cbiAgICB2YXIgcmVzdWx0O1xuICAgIGNvbXBpbGVyUGx1Z2lucy5mb3JFYWNoKGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICAgIHJlc3VsdCA9IHBsdWdpbi5jb21waWxlKGRlZik7XG4gICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgIGRlZiA9IHJlc3VsdDtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciB0eXBlUGx1Z2luID0gcGx1Z2luLnJlcXVpcmUoJ3R5cGUuJyArIGRlZi50eXBlKTtcblxuICAgIGlmICh0eXBlUGx1Z2luLmNvbXBpbGUpIHtcbiAgICAgIHJlc3VsdCA9IHR5cGVQbHVnaW4uY29tcGlsZShkZWYpO1xuICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICBkZWYgPSByZXN1bHQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGRlZi5maWVsZHMpIHtcbiAgICAgIC8vIENvbXBpbGUgYW55IGlubGluZSBmaWVsZHMuXG4gICAgICBkZWYuZmllbGRzID0gZGVmLmZpZWxkcy5tYXAoZnVuY3Rpb24gKGNoaWxkRGVmKSB7XG4gICAgICAgIGlmIChfLmlzT2JqZWN0KGNoaWxkRGVmKSkge1xuICAgICAgICAgIHJldHVybiBjb21waWxlci5jb21waWxlRGVmKGNoaWxkRGVmKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2hpbGREZWY7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvL2NvbnNvbGUubG9nKCdvdXQ6JywgSlNPTi5zdHJpbmdpZnkoZGVmKSlcblxuICAgIHJldHVybiBkZWY7XG4gIH07XG5cbiAgLy8gRm9yIGFuIGFycmF5IG9mIGZpZWxkIGRlZmluaXRpb25zLCBjb21waWxlIGVhY2ggZmllbGQgZGVmaW5pdGlvbi5cbiAgY29tcGlsZXIuY29tcGlsZUZpZWxkcyA9IGZ1bmN0aW9uIChmaWVsZHMpIHtcbiAgICByZXR1cm4gZmllbGRzLm1hcChmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgIHJldHVybiBjb21waWxlci5jb21waWxlRGVmKGZpZWxkKTtcbiAgICB9KTtcbiAgfTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgY29tcG9uZW50XG5cbi8vIEF0IGl0cyBtb3N0IGJhc2ljIGxldmVsLCB0aGUgY29tcG9uZW50IHBsdWdpbiBzaW1wbHkgbWFwcyBjb21wb25lbnQgbmFtZXMgdG9cbi8vIHBsdWdpbiBuYW1lcywgcmV0dXJuaW5nIHRoZSBjb21wb25lbnQgZmFjdG9yeSBmb3IgdGhhdCBjb21wb25lbnQuIEZvclxuLy8gZXhhbXBsZSwgYHBsdWdpbi5jb21wb25lbnQoJ3RleHQnKWAgYmVjb21lc1xuLy8gYHBsdWdpbi5yZXF1aXJlKCdjb21wb25lbnQudGV4dCcpYC4gVGhpcyBpcyBhIHVzZWZ1bCBwbGFjaG9sZGVyIGluIGNhc2Ugd2Vcbi8vIGxhdGVyIHdhbnQgdG8gbWFrZSBmb3JtYXRpYyBhYmxlIHRvIGRlY2lkZSBjb21wb25lbnRzIGF0IHJ1bnRpbWUuIEZvciBub3csXG4vLyBob3dldmVyLCB0aGlzIGFsbG93cyB1cyB0byBpbmplY3QgXCJwcm9wIG1vZGlmaWVyc1wiIHdoaWNoIGFyZSBwbHVnaW5zIHRoYXRcbi8vIG1vZGlmeSBhIGNvbXBvbmVudHMgcHJvcGVydGllcyBiZWZvcmUgaXQgcmVjZWl2ZXMgdGhlbS5cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgLy8gUmVnaXN0cnkgZm9yIHByb3AgbW9kaWZpZXJzLlxuICB2YXIgcHJvcE1vZGlmaWVycyA9IHt9O1xuXG4gIC8vIEFkZCBhIFwicHJvcCBtb2RpZmVyXCIgd2hpY2ggaXMganVzdCBhIGZ1bmN0aW9uIHRoYXQgbW9kaWZpZXMgYSBjb21wb25lbnRzXG4gIC8vIHByb3BlcnRpZXMgYmVmb3JlIGl0IHJlY2VpdmVzIHRoZW0uXG4gIHZhciBhZGRQcm9wTW9kaWZpZXIgPSBmdW5jdGlvbiAobmFtZSwgbW9kaWZ5Rm4pIHtcbiAgICBpZiAoIXByb3BNb2RpZmllcnNbbmFtZV0pIHtcbiAgICAgIHByb3BNb2RpZmllcnNbbmFtZV0gPSBbXTtcbiAgICB9XG4gICAgcHJvcE1vZGlmaWVyc1tuYW1lXS5wdXNoKG1vZGlmeUZuKTtcbiAgfTtcblxuICAvLyBHcmFiIGFsbCB0aGUgcHJvcCBtb2RpZmllciBwbHVnaW5zLlxuICB2YXIgcHJvcHNQbHVnaW5zID0gcGx1Z2luLnJlcXVpcmVBbGwocGx1Z2luLmNvbmZpZy5wcm9wcyk7XG5cbiAgLy8gUmVnaXN0ZXIgYWxsIHRoZSBwcm9wIG1vZGlmaWVyIHBsdWdpbnMuXG4gIHByb3BzUGx1Z2lucy5mb3JFYWNoKGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICBhZGRQcm9wTW9kaWZpZXIuYXBwbHkobnVsbCwgcGx1Z2luKTtcbiAgfSk7XG5cbiAgLy8gUmVnaXN0cnkgZm9yIGNvbXBvbmVudCBmYWN0b3JpZXMuIFNpbmNlIHdlJ2xsIGJlIG1vZGlmeWluZyB0aGUgcHJvcHMgZ29pbmdcbiAgLy8gdG8gdGhlIGZhY3Rvcmllcywgd2UnbGwgc3RvcmUgb3VyIG93biBjb21wb25lbnQgZmFjdG9yaWVzIGhlcmUuXG4gIHZhciBjb21wb25lbnRGYWN0b3JpZXMgPSB7fTtcblxuICAvLyBSZXRyaWV2ZSB0aGUgYXBwcm9wcmlhdGUgY29tcG9uZW50IGZhY3RvcnksIHdoaWNoIG1heSBiZSBhIHdyYXBwZXIgdGhhdFxuICAvLyBydW5zIHRoZSBjb21wb25lbnQgcHJvcGVydGllcyB0aHJvdWdoIHByb3AgbW9kaWZpZXIgZnVuY3Rpb25zLlxuICBwbHVnaW4uZXhwb3J0cy5jb21wb25lbnQgPSBmdW5jdGlvbiAobmFtZSkge1xuXG4gICAgaWYgKCFjb21wb25lbnRGYWN0b3JpZXNbbmFtZV0pIHtcbiAgICAgIHZhciBjb21wb25lbnQgPSBSZWFjdC5jcmVhdGVGYWN0b3J5KHBsdWdpbi5yZXF1aXJlKCdjb21wb25lbnQuJyArIG5hbWUpKTtcbiAgICAgIGNvbXBvbmVudEZhY3Rvcmllc1tuYW1lXSA9IGZ1bmN0aW9uIChwcm9wcywgY2hpbGRyZW4pIHtcbiAgICAgICAgaWYgKHByb3BNb2RpZmllcnNbbmFtZV0pIHtcbiAgICAgICAgICBwcm9wTW9kaWZpZXJzW25hbWVdLmZvckVhY2goZnVuY3Rpb24gKG1vZGlmeSkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IG1vZGlmeShwcm9wcyk7XG4gICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgIHByb3BzID0gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb21wb25lbnQocHJvcHMsIGNoaWxkcmVuKTtcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBjb21wb25lbnRGYWN0b3JpZXNbbmFtZV07XG4gIH07XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIGNvcmVcblxuLy8gVGhlIGNvcmUgcGx1Z2luIGV4cG9ydHMgYSBmdW5jdGlvbiB0aGF0IHRha2VzIGEgZm9ybWF0aWMgaW5zdGFuY2UgYW5kXG4vLyBleHRlbmRzIHRoZSBpbnN0YW5jZSB3aXRoIGFkZGl0aW9uYWwgbWV0aG9kcy5cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBmdW5jdGlvbiAoZm9ybWF0aWMpIHtcblxuICAgIC8vIFRoZSBjb3JlIHBsdWdpbiByZWFsbHkgZG9lc24ndCBkbyBtdWNoLiBJdCBhY3R1YWxseSByZWxpZXMgb24gb3RoZXJcbiAgICAvLyBwbHVnaW5zIHRvIGRvIHRoZSBkaXJ0eSB3b3JrLiBUaGlzIHdheSwgeW91IGNhbiBlYXNpbHkgYWRkIGFkZGl0aW9uYWxcbiAgICAvLyBwbHVnaW5zIHRvIGRvIG1vcmUgZGlydHkgd29yay5cbiAgICB2YXIgZm9ybWF0aWNQbHVnaW5zID0gcGx1Z2luLnJlcXVpcmVBbGwocGx1Z2luLmNvbmZpZy5mb3JtYXRpYyk7XG5cbiAgICAvLyBXZSBoYXZlIHNwZWNpYWwgZm9ybSBwbHVnaW5zIHdoaWNoIGFyZSBqdXN0IHVzZWQgdG8gbW9kaWZ5IHRoZSBGb3JtXG4gICAgLy8gcHJvdG90eXBlLlxuICAgIHZhciBmb3JtUGx1Z2lucyA9IHBsdWdpbi5yZXF1aXJlQWxsKHBsdWdpbi5jb25maWcuZm9ybSk7XG5cbiAgICAvLyBQYXNzIHRoZSBmb3JtYXRpYyBpbnN0YW5jZSBvZmYgdG8gZWFjaCBvZiB0aGUgZm9ybWF0aWMgcGx1Z2lucy5cbiAgICBmb3JtYXRpY1BsdWdpbnMuZm9yRWFjaChmdW5jdGlvbiAoZikge1xuICAgICAgXy5rZXlzKGYpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQoZm9ybWF0aWNba2V5XSkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Byb3BlcnR5IGFscmVhZHkgZGVmaW5lZCBmb3IgZm9ybWF0aWM6ICcgKyBrZXkpO1xuICAgICAgICB9XG4gICAgICAgIGZvcm1hdGljW2tleV0gPSBmW2tleV07XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vICMjIEZvcm0gcHJvdG90eXBlXG5cbiAgICAvLyBUaGUgRm9ybSBjb25zdHJ1Y3RvciBjcmVhdGVzIGEgZm9ybSBnaXZlbiBhIHNldCBvZiBvcHRpb25zLiBPcHRpb25zXG4gICAgLy8gY2FuIGhhdmUgYGZpZWxkc2AgYW5kIGB2YWx1ZWAuXG4gICAgdmFyIEZvcm0gPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgaWYgKHRoaXMuaW5pdCkge1xuICAgICAgICB0aGlzLmluaXQob3B0aW9ucyk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vIEFkZCB0aGUgZm9ybSBmYWN0b3J5IHRvIHRoZSBmb3JtYXRpYyBpbnN0YW5jZS5cbiAgICBmb3JtYXRpYy5mb3JtID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgIHJldHVybiBuZXcgRm9ybShvcHRpb25zKTtcbiAgICB9O1xuXG4gICAgRm9ybS5wcm90b3R5cGUgPSBmb3JtYXRpYy5mb3JtO1xuXG4gICAgLy8gS2VlcCBmb3JtIGluaXQgbWV0aG9kcyBoZXJlLlxuICAgIHZhciBpbml0cyA9IFtdO1xuXG4gICAgLy8gR28gdGhyb3VnaCBmb3JtIHBsdWdpbnMgYW5kIGFkZCBlYWNoIHBsdWdpbidzIG1ldGhvZHMgdG8gdGhlIGZvcm1cbiAgICAvLyBwcm90b3R5cGUuXG4gICAgZm9ybVBsdWdpbnMuZm9yRWFjaChmdW5jdGlvbiAocHJvdG8pIHtcbiAgICAgIF8ua2V5cyhwcm90bykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIC8vIEluaXQgcGx1Z2lucyBjYW4gYmUgc3RhY2tlZC5cbiAgICAgICAgaWYgKGtleSA9PT0gJ2luaXQnKSB7XG4gICAgICAgICAgaW5pdHMucHVzaChwcm90b1trZXldKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQoRm9ybS5wcm90b3R5cGVba2V5XSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUHJvcGVydHkgYWxyZWFkeSBkZWZpbmVkIGZvciBmb3JtOiAnICsga2V5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgRm9ybS5wcm90b3R5cGVba2V5XSA9IHByb3RvW2tleV07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gQ3JlYXRlIGFuIGluaXQgbWV0aG9kIGZvciB0aGUgZm9ybSBwcm90b3R5cGUgYmFzZWQgb24gdGhlIGF2YWlsYWJsZSBpbml0XG4gICAgLy8gbWV0aG9kcy5cbiAgICBpZiAoaW5pdHMubGVuZ3RoID09PSAwKSB7XG4gICAgICBGb3JtLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKCkge307XG4gICAgfSBlbHNlIGlmIChpbml0cy5sZW5ndGggPT09IDEpIHtcbiAgICAgIEZvcm0ucHJvdG90eXBlLmluaXQgPSBpbml0c1swXTtcbiAgICB9IGVsc2Uge1xuICAgICAgRm9ybS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGZvcm0gPSB0aGlzO1xuICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcblxuICAgICAgICBpbml0cy5mb3JFYWNoKGZ1bmN0aW9uIChpbml0KSB7XG4gICAgICAgICAgaW5pdC5hcHBseShmb3JtLCBhcmdzKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH1cbiAgfTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgZXZhbC1mdW5jdGlvbnNcblxuLypcbkRlZmF1bHQgZXZhbCBmdW5jdGlvbnMuIEVhY2ggZnVuY3Rpb24gaXMgcGFydCBvZiBpdHMgb3duIHBsdWdpbiwgYnV0IGFsbCBhcmVcbmtlcHQgdG9nZXRoZXIgaGVyZSBhcyBwYXJ0IG9mIGEgcGx1Z2luIGJ1bmRsZS5cblxuTm90ZSB0aGF0IGV2YWwgZnVuY3Rpb25zIGRlY2lkZSB3aGVuIHRoZWlyIGFyZ3VtZW50cyBnZXQgZXZhbHVhdGVkLiBUaGlzIHdheSxcbnlvdSBjYW4gY3JlYXRlIGNvbnRyb2wgc3RydWN0dXJlcyAobGlrZSBpZikgdGhhdCBjb25kaXRpb25hbGx5IGV2YWx1YXRlcyBpdHNcbmFyZ3VtZW50cy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbnZhciB3cmFwRm4gPSBmdW5jdGlvbiAoZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICBwbHVnaW4uZXhwb3J0cyA9IGZ1bmN0aW9uIChhcmdzLCBmaWVsZCwgY29udGV4dCkge1xuICAgICAgYXJncyA9IGZpZWxkLmV2YWwoYXJncywgY29udGV4dCk7XG4gICAgICB2YXIgcmVzdWx0ID0gZm4uYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH07XG59O1xuXG52YXIgbWV0aG9kQ2FsbCA9IGZ1bmN0aW9uIChtZXRob2QpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICBwbHVnaW4uZXhwb3J0cyA9IGZ1bmN0aW9uIChhcmdzLCBmaWVsZCwgY29udGV4dCkge1xuICAgICAgYXJncyA9IGZpZWxkLmV2YWwoYXJncywgY29udGV4dCk7XG4gICAgICBpZiAoYXJncy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldHVybiBhcmdzWzBdW21ldGhvZF0uYXBwbHkoYXJnc1swXSwgYXJncy5zbGljZSgxKSk7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcbn07XG5cbnZhciBwbHVnaW5zID0ge1xuICBpZjogZnVuY3Rpb24gKHBsdWdpbikge1xuICAgIHBsdWdpbi5leHBvcnRzID0gZnVuY3Rpb24gKGFyZ3MsIGZpZWxkLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gZmllbGQuZXZhbChhcmdzWzBdLCBjb250ZXh0KSA/IGZpZWxkLmV2YWwoYXJnc1sxXSwgY29udGV4dCkgOiBmaWVsZC5ldmFsKGFyZ3NbMl0sIGNvbnRleHQpO1xuICAgIH07XG4gIH0sXG5cbiAgZXE6IGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICBwbHVnaW4uZXhwb3J0cyA9IGZ1bmN0aW9uIChhcmdzLCBmaWVsZCwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIGZpZWxkLmV2YWwoYXJnc1swXSwgY29udGV4dCkgPT09IGZpZWxkLmV2YWwoYXJnc1sxXSwgY29udGV4dCk7XG4gICAgfTtcbiAgfSxcblxuICBub3Q6IGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICBwbHVnaW4uZXhwb3J0cyA9IGZ1bmN0aW9uIChhcmdzLCBmaWVsZCwgY29udGV4dCkge1xuICAgICAgcmV0dXJuICFmaWVsZC5ldmFsKGFyZ3NbMF0sIGNvbnRleHQpO1xuICAgIH07XG4gIH0sXG5cbiAgb3I6IGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICBwbHVnaW4uZXhwb3J0cyA9IGZ1bmN0aW9uIChhcmdzLCBmaWVsZCwgY29udGV4dCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBhcmcgPSBmaWVsZC5ldmFsKGFyZ3NbaV0sIGNvbnRleHQpO1xuICAgICAgICBpZiAoYXJnKSB7XG4gICAgICAgICAgcmV0dXJuIGFyZztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGFyZ3NbYXJncy5sZW5ndGggLSAxXTtcbiAgICB9O1xuICB9LFxuXG4gIGFuZDogZnVuY3Rpb24gKHBsdWdpbikge1xuICAgIHBsdWdpbi5leHBvcnRzID0gZnVuY3Rpb24gKGFyZ3MsIGZpZWxkLCBjb250ZXh0KSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGFyZyA9IGZpZWxkLmV2YWwoYXJnc1tpXSwgY29udGV4dCk7XG4gICAgICAgIGlmICghYXJnIHx8IGkgPT09IChhcmdzLmxlbmd0aCAtIDEpKSB7XG4gICAgICAgICAgcmV0dXJuIGFyZztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9O1xuICB9LFxuXG4gIGdldDogZnVuY3Rpb24gKHBsdWdpbikge1xuICAgIHZhciBnZXQgPSBwbHVnaW4uZXhwb3J0cyA9IGZ1bmN0aW9uIChhcmdzLCBmaWVsZCwgY29udGV4dCkge1xuICAgICAgdmFyIHV0aWwgPSBwbHVnaW4ucmVxdWlyZSgndXRpbCcpO1xuICAgICAgdmFyIGtleSA9IGZpZWxkLmV2YWwoYXJnc1swXSwgY29udGV4dCk7XG4gICAgICB2YXIgb2JqO1xuICAgICAgaWYgKGNvbnRleHQgJiYga2V5IGluIGNvbnRleHQpIHtcbiAgICAgICAgb2JqID0gY29udGV4dFtrZXldO1xuICAgICAgfSBlbHNlIGlmIChfLmlzT2JqZWN0KGZpZWxkLnZhbHVlKSAmJiBrZXkgaW4gZmllbGQudmFsdWUpIHtcbiAgICAgICAgb2JqID0gZmllbGQudmFsdWVba2V5XTtcbiAgICAgIH0gZWxzZSBpZiAoZmllbGQucGFyZW50KSB7XG4gICAgICAgIG9iaiA9IGdldChhcmdzLCBmaWVsZC5wYXJlbnQpO1xuICAgICAgfVxuICAgICAgaWYgKGFyZ3MubGVuZ3RoID4gMSkge1xuICAgICAgICB2YXIgZ2V0SW5LZXlzID0gZmllbGQuZXZhbChhcmdzLnNsaWNlKDEpLCBjb250ZXh0KTtcbiAgICAgICAgcmV0dXJuIHV0aWwuZ2V0SW4ob2JqLCBnZXRJbktleXMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG9iajtcbiAgICB9O1xuICB9LFxuXG4gIGdldEdyb3VwVmFsdWVzOiBmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgcGx1Z2luLmV4cG9ydHMgPSBmdW5jdGlvbiAoYXJncywgZmllbGQsIGNvbnRleHQpIHtcblxuICAgICAgdmFyIGdyb3VwTmFtZSA9IGZpZWxkLmV2YWwoYXJnc1swXSwgY29udGV4dCk7XG5cbiAgICAgIHZhciBncm91cEZpZWxkcyA9IGZpZWxkLmdyb3VwRmllbGRzKGdyb3VwTmFtZSk7XG5cbiAgICAgIHJldHVybiBncm91cEZpZWxkcy5tYXAoZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICAgIHJldHVybiBmaWVsZC52YWx1ZTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH0sXG5cbiAgZ2V0TWV0YTogZnVuY3Rpb24gKHBsdWdpbikge1xuICAgIHZhciB1dGlsID0gcGx1Z2luLnJlcXVpcmUoJ3V0aWwnKTtcbiAgICBwbHVnaW4uZXhwb3J0cyA9IGZ1bmN0aW9uIChhcmdzLCBmaWVsZCwgY29udGV4dCkge1xuICAgICAgYXJncyA9IGZpZWxkLmV2YWwoYXJncywgY29udGV4dCk7XG4gICAgICB2YXIgY2FjaGVLZXkgPSB1dGlsLm1ldGFDYWNoZUtleShhcmdzWzBdLCBhcmdzWzFdKTtcbiAgICAgIHJldHVybiBmaWVsZC5mb3JtLm1ldGEoY2FjaGVLZXkpO1xuICAgIH07XG4gIH0sXG5cbiAgc3VtOiBmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgcGx1Z2luLmV4cG9ydHMgPSBmdW5jdGlvbiAoYXJncywgZmllbGQsIGNvbnRleHQpIHtcbiAgICAgIHZhciBzdW0gPSAwO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHN1bSArPSBmaWVsZC5ldmFsKGFyZ3NbaV0sIGNvbnRleHQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN1bTtcbiAgICB9O1xuICB9LFxuXG4gIGZvckVhY2g6IGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICBwbHVnaW4uZXhwb3J0cyA9IGZ1bmN0aW9uIChhcmdzLCBmaWVsZCwgY29udGV4dCkge1xuICAgICAgdmFyIGl0ZW1OYW1lID0gYXJnc1swXTtcbiAgICAgIHZhciBhcnJheSA9IGZpZWxkLmV2YWwoYXJnc1sxXSwgY29udGV4dCk7XG4gICAgICB2YXIgbWFwRXhwciA9IGFyZ3NbMl07XG4gICAgICB2YXIgZmlsdGVyRXhwciA9IGFyZ3NbM107XG4gICAgICBjb250ZXh0ID0gT2JqZWN0LmNyZWF0ZShjb250ZXh0IHx8IHt9KTtcblxuICAgICAgdmFyIHJlc3VsdHMgPSBbXTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgaXRlbSA9IGFycmF5W2ldO1xuICAgICAgICBjb250ZXh0W2l0ZW1OYW1lXSA9IGl0ZW07XG4gICAgICAgIGlmIChfLmlzVW5kZWZpbmVkKGZpbHRlckV4cHIpIHx8IGZpZWxkLmV2YWwoZmlsdGVyRXhwciwgY29udGV4dCkpIHtcbiAgICAgICAgICByZXN1bHRzLnB1c2goZmllbGQuZXZhbChtYXBFeHByLCBjb250ZXh0KSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfTtcbiAgfSxcblxuICBjb25jYXQ6IG1ldGhvZENhbGwoJ2NvbmNhdCcpLFxuICBzcGxpdDogbWV0aG9kQ2FsbCgnc3BsaXQnKSxcbiAgcmV2ZXJzZTogbWV0aG9kQ2FsbCgncmV2ZXJzZScpLFxuICBqb2luOiBtZXRob2RDYWxsKCdqb2luJyksXG5cbiAgaHVtYW5pemU6IGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICB2YXIgdXRpbCA9IHBsdWdpbi5yZXF1aXJlKCd1dGlsJyk7XG4gICAgcGx1Z2luLmV4cG9ydHMgPSBmdW5jdGlvbiAoYXJncywgZmllbGQsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiB1dGlsLmh1bWFuaXplKGZpZWxkLmV2YWwoYXJnc1swXSwgY29udGV4dCkpO1xuICAgIH07XG4gIH0sXG5cbiAgcGljazogd3JhcEZuKF8ucGljayksXG4gIHBsdWNrOiB3cmFwRm4oXy5wbHVjaylcbn07XG5cbi8vIEJ1aWxkIGEgcGx1Z2luIGJ1bmRsZS5cbl8uZWFjaChwbHVnaW5zLCBmdW5jdGlvbiAoZm4sIG5hbWUpIHtcbiAgbW9kdWxlLmV4cG9ydHNbJ2V2YWwtZnVuY3Rpb24uJyArIG5hbWVdID0gZm47XG59KTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBldmFsXG5cbi8qXG5UaGUgZXZhbCBwbHVnaW4gd2lsbCBldmFsdWF0ZSBhIGZpZWxkJ3MgYGV2YWxgIHByb3BlcnR5ICh3aGljaCBtdXN0IGJlIGFuXG5vYmplY3QpIGFuZCBleGNoYW5nZSB0aGUgcHJvcGVydGllcyBvZiB0aGF0IG9iamVjdCBmb3Igd2hhdGV2ZXIgdGhlXG5leHByZXNzaW9uIHJldHVybnMuIEV4cHJlc3Npb25zIGFyZSBqdXN0IEpTT04gZXhjZXB0IGlmIHRoZSBmaXJzdCBlbGVtZW50IG9mXG5hbiBhcnJheSBpcyBhIHN0cmluZyB0aGF0IHN0YXJ0cyB3aXRoICdAJy4gSW4gdGhhdCBjYXNlLCB0aGUgYXJyYXkgaXNcbnRyZWF0ZWQgYXMgYSBMaXNwIGV4cHJlc3Npb24gd2hlcmUgdGhlIGZpcnN0IGVsZW1lbnQgcmVmZXJzIHRvIGEgZnVuY3Rpb25cbnRoYXQgaXMgY2FsbGVkIHdpdGggdGhlIHJlc3Qgb2YgdGhlIGVsZW1lbnRzIGFzIHRoZSBhcmd1bWVudHMuIEZvciBleGFtcGxlOlxuXG5gYGBqc1xuWydAc3VtJywgMSwgMl1cbmBgYFxuXG53aWxsIHJldHVybiB0aGUgdmFsdWUgMy4gVGhlIGV4cHJlc3Npb24gY291bGQgYmUgdXNlZCBpbiBhbiBgZXZhbGAgcHJvcGVydHkgb2ZcbmEgZmllbGQgbGlrZTpcblxuYGBganNcbntcbiAgdHlwZTogJ3N0cmluZycsXG4gIGtleTogJ25hbWUnLFxuICBldmFsOiB7XG4gICAgcm93czogWydAc3VtJywgMSwgMl1cbiAgfVxufVxuYGBgXG5cblRoZSBgcm93c2AgcHJvcGVydHkgb2YgdGhlIGZpZWxkIHdvdWxkIGJlIHNldCB0byAzIGluIHRoaXMgY2FzZS5cblxuQW55IHBsdWdpbiByZWdpc3RlcmVkIHdpdGggdGhlIHByZWZpeCBgZXZhbC1mdW5jdGlvbi5gIHdpbGwgYmUgYXZhaWxhYmxlIGFzIGFcbmZ1bmN0aW9uIGluIHRoZXNlIGV4cHJlc3Npb25zLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgLy8gR3JhYiBhbGwgdGhlIGZ1bmN0aW9uIHBsdWdpbnMuXG4gIHZhciBldmFsRnVuY3Rpb25QbHVnaW5zID0gcGx1Z2luLnJlcXVpcmVBbGxPZignZXZhbC1mdW5jdGlvbicpO1xuXG4gIC8vIEp1c3Qgc3RyaXAgb2ZmIHRoZSAnZXZhbC1mdW5jdGlvbnMuJyBwcmVmaXggYW5kIHB1dCBpbiBhIGRpZmZlcmVudCBvYmplY3QuXG4gIHZhciBmdW5jdGlvbnMgPSB7fTtcbiAgXy5lYWNoKGV2YWxGdW5jdGlvblBsdWdpbnMsIGZ1bmN0aW9uIChmbiwgbmFtZSkge1xuICAgIHZhciBmbk5hbWUgPSBuYW1lLnN1YnN0cmluZyhuYW1lLmluZGV4T2YoJy4nKSArIDEpO1xuICAgIGZ1bmN0aW9uc1tmbk5hbWVdID0gZm47XG4gIH0pO1xuXG4gIC8vIENoZWNrIGFuIGFycmF5IHRvIHNlZSBpZiBpdCdzIGEgZnVuY3Rpb24gZXhwcmVzc2lvbi5cbiAgdmFyIGlzRnVuY3Rpb25BcnJheSA9IGZ1bmN0aW9uIChhcnJheSkge1xuICAgIHJldHVybiBhcnJheS5sZW5ndGggPiAwICYmIGFycmF5WzBdWzBdID09PSAnQCc7XG4gIH07XG5cbiAgLy8gRXZhbHVhdGUgYSBmdW5jdGlvbiBleHByZXNzaW9uIGFuZCByZXR1cm4gdGhlIHJlc3VsdC5cbiAgdmFyIGV2YWxGdW5jdGlvbiA9IGZ1bmN0aW9uIChmbkFycmF5LCBmaWVsZCwgY29udGV4dCkge1xuICAgIHZhciBmbk5hbWUgPSBmbkFycmF5WzBdLnN1YnN0cmluZygxKTtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uc1tmbk5hbWVdKGZuQXJyYXkuc2xpY2UoMSksIGZpZWxkLCBjb250ZXh0KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoIShmbk5hbWUgaW4gZnVuY3Rpb25zKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0V2YWwgZnVuY3Rpb24gJyArIGZuTmFtZSArICcgbm90IGRlZmluZWQuJyk7XG4gICAgICB9XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfTtcblxuICAvLyBFdmFsdWF0ZSBhbiBleHByZXNzaW9uIGluIHRoZSBjb250ZXh0IG9mIGEgZmllbGQuXG4gIHZhciBldmFsdWF0ZSA9IGZ1bmN0aW9uIChleHByZXNzaW9uLCBmaWVsZCwgY29udGV4dCkge1xuICAgIGlmIChfLmlzQXJyYXkoZXhwcmVzc2lvbikpIHtcbiAgICAgIGlmIChpc0Z1bmN0aW9uQXJyYXkoZXhwcmVzc2lvbikpIHtcbiAgICAgICAgcmV0dXJuIGV2YWxGdW5jdGlvbihleHByZXNzaW9uLCBmaWVsZCwgY29udGV4dCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZXhwcmVzc2lvbi5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICByZXR1cm4gZXZhbHVhdGUoaXRlbSwgZmllbGQsIGNvbnRleHQpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKF8uaXNPYmplY3QoZXhwcmVzc2lvbikpIHtcbiAgICAgIHZhciBvYmogPSB7fTtcbiAgICAgIE9iamVjdC5rZXlzKGV4cHJlc3Npb24pLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gZXZhbHVhdGUoZXhwcmVzc2lvbltrZXldLCBmaWVsZCwgY29udGV4dCk7XG4gICAgICAgIGlmICh0eXBlb2YgcmVzdWx0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIG9ialtrZXldID0gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBvYmo7XG4gICAgfSBlbHNlIGlmIChfLmlzU3RyaW5nKGV4cHJlc3Npb24pICYmIGV4cHJlc3Npb25bMF0gPT09ICc9Jykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9ucy5nZXQoW2V4cHJlc3Npb24uc3Vic3RyaW5nKDEpXSwgZmllbGQsIGNvbnRleHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZXhwcmVzc2lvbjtcbiAgICB9XG4gIH07XG5cbiAgcGx1Z2luLmV4cG9ydHMuZXZhbHVhdGUgPSBldmFsdWF0ZTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgZmllbGQtcm91dGVyXG5cbi8qXG5GaWVsZHMgYW5kIGNvbXBvbmVudHMgZ2V0IGdsdWVkIHRvZ2V0aGVyIHZpYSByb3V0ZXMuIFRoaXMgaXMgc2ltaWxhciB0byBVUkxcbnJvdXRpbmcgd2hlcmUgYSByZXF1ZXN0IGdldHMgZHluYW1pY2FsbHkgcm91dGVkIHRvIGEgaGFuZGxlci4gVGhpcyBnaXZlcyBhIGxvdFxub2YgZmxleGliaWxpdHkgaW4gaW50cm9kdWNpbmcgbmV3IHR5cGVzIGFuZCBjb21wb25lbnRzLiBZb3UgY2FuIGNyZWF0ZSBhIG5ld1xudHlwZSBhbmQgcm91dGUgaXQgdG8gYW4gZXhpc3RpbmcgY29tcG9uZW50LCBvciB5b3UgY2FuIGNyZWF0ZSBhIG5ldyBjb21wb25lbnRcbmFuZCByb3V0ZSBleGlzdGluZyB0eXBlcyB0byBpdC4gT3IgeW91IGNhbiBjcmVhdGUgYm90aCBhbmQgcm91dGUgdGhlIG5ldyB0eXBlXG50byB0aGUgbmV3IGNvbXBvbmVudC4gTmV3IHJvdXRlcyBhcmUgYWRkZWQgdmlhIHJvdXRlIHBsdWdpbnMuIEEgcm91dGUgcGx1Z2luXG5zaW1wbHkgZXhwb3J0cyBhbiBhcnJheSBsaWtlOlxuXG5gYGBqc1xuW1xuICAnY29sb3InLCAvLyBSb3V0ZSB0aGlzIHR5cGVcbiAgJ2NvbG9yLXBpY2tlci13aXRoLWFscGhhJywgLy8gVG8gdGhpcyBjb21wb25lbnRcbiAgZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBmaWVsZC5kZWYuYWxwaGEgIT09ICd1bmRlZmluZWQnO1xuICB9XG5dXG5cblJvdXRlIHBsdWdpbnMgY2FuIGJlIHN0YWNrZWQgYW5kIGFyZSBzZW5zaXRpdmUgdG8gb3JkZXJpbmcuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICB2YXIgcm91dGVzID0ge307XG5cbiAgdmFyIHJvdXRlciA9IHBsdWdpbi5leHBvcnRzO1xuXG4gIC8vIEdldCBhbGwgdGhlIHJvdXRlIHBsdWdpbnMuXG4gIHZhciByb3V0ZVBsdWdpbnMgPSBwbHVnaW4ucmVxdWlyZUFsbChwbHVnaW4uY29uZmlnLnJvdXRlcyk7XG5cbiAgLy8gUmVnaXN0ZXIgYSByb3V0ZS5cbiAgcm91dGVyLnJvdXRlID0gZnVuY3Rpb24gKHR5cGVOYW1lLCBjb21wb25lbnROYW1lLCB0ZXN0Rm4pIHtcbiAgICBpZiAoIXJvdXRlc1t0eXBlTmFtZV0pIHtcbiAgICAgIHJvdXRlc1t0eXBlTmFtZV0gPSBbXTtcbiAgICB9XG4gICAgcm91dGVzW3R5cGVOYW1lXS5wdXNoKHtcbiAgICAgIGNvbXBvbmVudDogY29tcG9uZW50TmFtZSxcbiAgICAgIHRlc3Q6IHRlc3RGblxuICAgIH0pO1xuICB9O1xuXG4gIC8vIFJlZ2lzdGVyIGVhY2ggb2YgdGhlIHJvdXRlcyBwcm92aWRlZCBieSB0aGUgcm91dGUgcGx1Z2lucy5cbiAgcm91dGVQbHVnaW5zLmZvckVhY2goZnVuY3Rpb24gKHJvdXRlUGx1Z2luKSB7XG5cbiAgICByb3V0ZXIucm91dGUuYXBwbHkocm91dGVyLCByb3V0ZVBsdWdpbik7XG4gIH0pO1xuXG4gIC8vIERldGVybWluZSB0aGUgYmVzdCBjb21wb25lbnQgZm9yIGEgZmllbGQsIGJhc2VkIG9uIHRoZSByb3V0ZXMuXG4gIHJvdXRlci5jb21wb25lbnRGb3JGaWVsZCA9IGZ1bmN0aW9uIChmaWVsZCkge1xuXG4gICAgdmFyIHR5cGVOYW1lID0gZmllbGQuZGVmLnR5cGU7XG5cbiAgICBpZiAocm91dGVzW3R5cGVOYW1lXSkge1xuICAgICAgdmFyIHJvdXRlc0ZvclR5cGUgPSByb3V0ZXNbdHlwZU5hbWVdO1xuICAgICAgdmFyIHJvdXRlID0gXy5maW5kKHJvdXRlc0ZvclR5cGUsIGZ1bmN0aW9uIChyb3V0ZSkge1xuICAgICAgICByZXR1cm4gIXJvdXRlLnRlc3QgfHwgcm91dGUudGVzdChmaWVsZCk7XG4gICAgICB9KTtcbiAgICAgIGlmIChyb3V0ZSkge1xuICAgICAgICByZXR1cm4gcGx1Z2luLmNvbXBvbmVudChyb3V0ZS5jb21wb25lbnQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwbHVnaW4uaGFzQ29tcG9uZW50KHR5cGVOYW1lKSkge1xuICAgICAgcmV0dXJuIHBsdWdpbi5jb21wb25lbnQodHlwZU5hbWUpO1xuICAgIH1cblxuICAgIHRocm93IG5ldyBFcnJvcignTm8gY29tcG9uZW50IGZvciBmaWVsZDogJyArIEpTT04uc3RyaW5naWZ5KGZpZWxkLmRlZikpO1xuICB9O1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBmaWVsZC1yb3V0ZXNcblxuLypcbkRlZmF1bHQgcm91dGVzLiBFYWNoIHJvdXRlIGlzIHBhcnQgb2YgaXRzIG93biBwbHVnaW4sIGJ1dCBhbGwgYXJlIGtlcHQgdG9nZXRoZXJcbmhlcmUgYXMgcGFydCBvZiBhIHBsdWdpbiBidW5kbGUuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG52YXIgcm91dGVzID0ge1xuXG4gICdvYmplY3QuZGVmYXVsdCc6IFtcbiAgICAnb2JqZWN0JyxcbiAgICAnZmllbGRzZXQnXG4gIF0sXG5cbiAgJ3N0cmluZy5jaG9pY2VzJzogW1xuICAgICdzdHJpbmcnLFxuICAgICdzZWxlY3QnLFxuICAgIGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgcmV0dXJuIGZpZWxkLmRlZi5jaG9pY2VzID8gdHJ1ZSA6IGZhbHNlO1xuICAgIH1cbiAgXSxcblxuICAnc3RyaW5nLnRhZ3MnOiBbXG4gICAgJ3N0cmluZycsXG4gICAgJ3ByZXR0eS10ZXh0YXJlYScsXG4gICAgZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICByZXR1cm4gZmllbGQuZGVmLnJlcGxhY2VDaG9pY2VzO1xuICAgIH1cbiAgXSxcblxuICAnc3RyaW5nLnNpbmdsZS1saW5lJzogW1xuICAgICdzdHJpbmcnLFxuICAgICd0ZXh0JyxcbiAgICBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgIHJldHVybiBmaWVsZC5kZWYubWF4Um93cyA9PT0gMTtcbiAgICB9XG4gIF0sXG5cbiAgJ3N0cmluZy5kZWZhdWx0JzogW1xuICAgICdzdHJpbmcnLFxuICAgICd0ZXh0YXJlYSdcbiAgXSxcblxuICAnYXJyYXkuY2hvaWNlcyc6IFtcbiAgICAnYXJyYXknLFxuICAgICdjaGVja2JveC1saXN0JyxcbiAgICBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgIHJldHVybiBmaWVsZC5kZWYuY2hvaWNlcyA/IHRydWUgOiBmYWxzZTtcbiAgICB9XG4gIF0sXG5cbiAgJ2FycmF5LmRlZmF1bHQnOiBbXG4gICAgJ2FycmF5JyxcbiAgICAnbGlzdCdcbiAgXSxcblxuICAnYm9vbGVhbi5kZWZhdWx0JzogW1xuICAgICdib29sZWFuJyxcbiAgICAnc2VsZWN0J1xuICBdLFxuXG4gICdudW1iZXIuZGVmYXVsdCc6IFtcbiAgICAnbnVtYmVyJyxcbiAgICAndGV4dCdcbiAgXVxuXG59O1xuXG4vLyBCdWlsZCBhIHBsdWdpbiBidW5kbGUuXG5fLmVhY2gocm91dGVzLCBmdW5jdGlvbiAocm91dGUsIG5hbWUpIHtcbiAgbW9kdWxlLmV4cG9ydHNbJ2ZpZWxkLXJvdXRlLicgKyBuYW1lXSA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICBwbHVnaW4uZXhwb3J0cyA9IHJvdXRlO1xuICB9O1xufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIi8vICMgbG9hZGVyXG5cbi8qXG5XaGVuIG1ldGFkYXRhIGlzbid0IGF2YWlsYWJsZSwgd2UgYXNrIHRoZSBsb2FkZXIgdG8gbG9hZCBpdC4gVGhlIGxvYWRlciB3aWxsXG50cnkgdG8gZmluZCBhbiBhcHByb3ByaWF0ZSBzb3VyY2UgYmFzZWQgb24gdGhlIG1ldGFkYXRhIGtleXMuXG5cbk5vdGUgdGhhdCB3ZSBhc2sgdGhlIGxvYWRlciB0byBsb2FkIG1ldGFkYXRhIHdpdGggYSBzZXQgb2Yga2V5cyBsaWtlXG5gWydmb28nLCAnYmFyJ11gLCBidXQgdGhvc2UgYXJlIGNvbnZlcnRlZCB0byBhIHNpbmdsZSBrZXkgbGlrZSBgZm9vOjpiYXJgIGZvclxudGhlIHNha2Ugb2YgY2FjaGluZy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgdmFyIHV0aWwgPSBwbHVnaW4ucmVxdWlyZSgndXRpbCcpO1xuXG4gIHZhciBsb2FkZXIgPSBwbHVnaW4uZXhwb3J0cztcblxuICB2YXIgaXNMb2FkaW5nID0ge307XG4gIHZhciBzb3VyY2VzID0ge307XG5cbiAgLy8gTG9hZCBtZXRhZGF0YSBmb3IgYSBnaXZlbiBmb3JtIGFuZCBwYXJhbXMuXG4gIGxvYWRlci5sb2FkTWV0YSA9IGZ1bmN0aW9uIChmb3JtLCBzb3VyY2UsIHBhcmFtcykge1xuICAgIHZhciBjYWNoZUtleSA9IHV0aWwubWV0YUNhY2hlS2V5KHNvdXJjZSwgcGFyYW1zKTtcblxuICAgIGlmIChpc0xvYWRpbmdbY2FjaGVLZXldKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaXNMb2FkaW5nW2NhY2hlS2V5XSA9IHRydWU7XG5cbiAgICBsb2FkZXIubG9hZEFzeW5jRnJvbVNvdXJjZShmb3JtLCBzb3VyY2UsIHBhcmFtcyk7XG4gIH07XG5cbiAgLy8gTWFrZSBzdXJlIHRvIGxvYWQgbWV0YWRhdGEgYXN5bmNocm9ub3VzbHkuXG4gIGxvYWRlci5sb2FkQXN5bmNGcm9tU291cmNlID0gZnVuY3Rpb24gKGZvcm0sIHNvdXJjZSwgcGFyYW1zLCB3YWl0VGltZSkge1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgbG9hZGVyLmxvYWRGcm9tU291cmNlKGZvcm0sIHNvdXJjZSwgcGFyYW1zKTtcbiAgICB9LCB3YWl0VGltZSB8fCAwKTtcbiAgfTtcblxuICAvLyBMb2FkIG1ldGFkYXRhIGZvciBhIGZvcm0gYW5kIHBhcmFtcy5cbiAgbG9hZGVyLmxvYWRGcm9tU291cmNlID0gZnVuY3Rpb24gKGZvcm0sIHNvdXJjZU5hbWUsIHBhcmFtcykge1xuXG4gICAgLy8gRmluZCB0aGUgYmVzdCBzb3VyY2UgZm9yIHRoaXMgY2FjaGUga2V5LlxuICAgIHZhciBzb3VyY2UgPSBzb3VyY2VzW3NvdXJjZU5hbWVdO1xuICAgIGlmIChzb3VyY2UpIHtcblxuICAgICAgdmFyIGNhY2hlS2V5ID0gdXRpbC5tZXRhQ2FjaGVLZXkoc291cmNlTmFtZSwgcGFyYW1zKTtcblxuICAgICAgLy8gQ2FsbCB0aGUgc291cmNlIGZ1bmN0aW9uLlxuICAgICAgdmFyIHJlc3VsdCA9IHNvdXJjZS5jYWxsKG51bGwsIHBhcmFtcyk7XG5cbiAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgLy8gUmVzdWx0IGNvdWxkIGJlIGEgcHJvbWlzZS5cbiAgICAgICAgaWYgKHJlc3VsdC50aGVuKSB7XG4gICAgICAgICAgdmFyIHByb21pc2UgPSByZXN1bHQudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICBmb3JtLm1ldGEoY2FjaGVLZXksIHJlc3VsdCk7XG4gICAgICAgICAgICBpc0xvYWRpbmdbY2FjaGVLZXldID0gZmFsc2U7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICB2YXIgb25FcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlzTG9hZGluZ1tjYWNoZUtleV0gPSBmYWxzZTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgaWYgKHByb21pc2UuY2F0Y2gpIHtcbiAgICAgICAgICAgIHByb21pc2UuY2F0Y2gob25FcnJvcik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHNpbGx5IGpRdWVyeSBwcm9taXNlc1xuICAgICAgICAgICAgcHJvbWlzZS5mYWlsKG9uRXJyb3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgLy8gT3IgaXQgY291bGQgYmUgYSB2YWx1ZS4gSW4gdGhhdCBjYXNlLCBtYWtlIHN1cmUgdG8gYXN5bmNpZnkgaXQuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmb3JtLm1ldGEoY2FjaGVLZXksIHJlc3VsdCk7XG4gICAgICAgICAgICBpc0xvYWRpbmdbY2FjaGVLZXldID0gZmFsc2U7XG4gICAgICAgICAgfSwgMCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlzTG9hZGluZ1tjYWNoZUtleV0gPSBmYWxzZTtcbiAgICAgIH1cblxuICAgIH0gZWxzZSB7XG4gICAgICBpc0xvYWRpbmdbY2FjaGVLZXldID0gZmFsc2U7XG4gICAgfVxuICB9O1xuXG4gIC8vIFJlZ2lzdGVyIGEgc291cmNlIGZ1bmN0aW9uLlxuICBsb2FkZXIuc291cmNlID0gZnVuY3Rpb24gKG5hbWUsIGZuKSB7XG5cbiAgICBzb3VyY2VzW25hbWVdID0gZm47XG4gIH07XG5cbn07XG4iLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIHV0aWxcblxuLy8gU29tZSB1dGlsaXR5IGZ1bmN0aW9ucyB0byBiZSB1c2VkIGJ5IG90aGVyIHBsdWdpbnMuXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHZhciB1dGlsID0gcGx1Z2luLmV4cG9ydHM7XG5cbiAgLy8gQ2hlY2sgaWYgYSB2YWx1ZSBpcyBcImJsYW5rXCIuXG4gIHV0aWwuaXNCbGFuayA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSAnJztcbiAgfTtcblxuICAvLyBTZXQgdmFsdWUgYXQgc29tZSBwYXRoIGluIG9iamVjdC5cbiAgdXRpbC5zZXRJbiA9IGZ1bmN0aW9uIChvYmosIHBhdGgsIHZhbHVlKSB7XG4gICAgaWYgKF8uaXNTdHJpbmcocGF0aCkpIHtcbiAgICAgIHBhdGggPSBbcGF0aF07XG4gICAgfVxuICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgICBpZiAocGF0aC5sZW5ndGggPT09IDEpIHtcbiAgICAgIG9ialtwYXRoWzBdXSA9IHZhbHVlO1xuICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG4gICAgaWYgKCFvYmpbcGF0aFswXV0pIHtcbiAgICAgIG9ialtwYXRoWzBdXSA9IHt9O1xuICAgIH1cbiAgICB1dGlsLnNldEluKG9ialtwYXRoWzBdXSwgcGF0aC5zbGljZSgxKSwgdmFsdWUpO1xuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gUmVtb3ZlIHZhbHVlIGF0IHBhdGggaW4gc29tZSBvYmplY3QuXG4gIHV0aWwucmVtb3ZlSW4gPSBmdW5jdGlvbiAob2JqLCBwYXRoKSB7XG4gICAgaWYgKF8uaXNTdHJpbmcocGF0aCkpIHtcbiAgICAgIHBhdGggPSBbcGF0aF07XG4gICAgfVxuICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMSkge1xuICAgICAgaWYgKF8uaXNBcnJheShvYmopKSB7XG4gICAgICAgIGlmIChfLmlzTnVtYmVyKHBhdGhbMF0pKSB7XG4gICAgICAgICAgb2JqLnNwbGljZShwYXRoWzBdLCAxKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChfLmlzT2JqZWN0KG9iaikpIHtcbiAgICAgICAgZGVsZXRlIG9ialtwYXRoWzBdXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuICAgIGlmIChvYmpbcGF0aFswXV0pIHtcbiAgICAgIHV0aWwucmVtb3ZlSW4ob2JqW3BhdGhbMF1dLCBwYXRoLnNsaWNlKDEpKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBHZXQgdmFsdWUgYXQgcGF0aCBpbiBzb21lIG9iamVjdC5cbiAgdXRpbC5nZXRJbiA9IGZ1bmN0aW9uIChvYmosIHBhdGgpIHtcbiAgICBpZiAoXy5pc1N0cmluZyhwYXRoKSkge1xuICAgICAgcGF0aCA9IFtwYXRoXTtcbiAgICB9XG4gICAgaWYgKHBhdGgubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH1cbiAgICBpZiAoXy5pc09iamVjdChvYmopICYmIHBhdGhbMF0gaW4gb2JqKSB7XG4gICAgICByZXR1cm4gdXRpbC5nZXRJbihvYmpbcGF0aFswXV0sIHBhdGguc2xpY2UoMSkpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcblxuICAvLyBBcHBlbmQgdG8gYXJyYXkgYXQgcGF0aCBpbiBzb21lIG9iamVjdC5cbiAgdXRpbC5hcHBlbmRJbiA9IGZ1bmN0aW9uIChvYmosIHBhdGgsIHZhbHVlKSB7XG4gICAgdmFyIHN1Yk9iaiA9IHV0aWwuZ2V0SW4ob2JqLCBwYXRoKTtcbiAgICBpZiAoXy5pc0FycmF5KHN1Yk9iaikpIHtcbiAgICAgIHN1Yk9iai5wdXNoKHZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBTd2FwIHR3byBrZXlzIGF0IHBhdGggaW4gc29tZSBvYmplY3QuXG4gIHV0aWwubW92ZUluID0gZnVuY3Rpb24gKG9iaiwgcGF0aCwgZnJvbUtleSwgdG9LZXkpIHtcbiAgICB2YXIgc3ViT2JqID0gdXRpbC5nZXRJbihvYmosIHBhdGgpO1xuICAgIGlmIChfLmlzQXJyYXkoc3ViT2JqKSkge1xuICAgICAgaWYgKF8uaXNOdW1iZXIoZnJvbUtleSkgJiYgXy5pc051bWJlcih0b0tleSkpIHtcbiAgICAgICAgdmFyIGZyb21JbmRleCA9IGZyb21LZXk7XG4gICAgICAgIHZhciB0b0luZGV4ID0gdG9LZXk7XG4gICAgICAgIGlmIChmcm9tSW5kZXggIT09IHRvSW5kZXggJiZcbiAgICAgICAgICBmcm9tSW5kZXggPj0gMCAmJiBmcm9tSW5kZXggPCBzdWJPYmoubGVuZ3RoICYmXG4gICAgICAgICAgdG9JbmRleCA+PSAwICYmIHRvSW5kZXggPCBzdWJPYmoubGVuZ3RoXG4gICAgICAgICkge1xuICAgICAgICAgIHN1Yk9iai5zcGxpY2UodG9JbmRleCwgMCwgc3ViT2JqLnNwbGljZShmcm9tSW5kZXgsIDEpWzBdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZnJvbVZhbHVlID0gc3ViT2JqW2Zyb21LZXldO1xuICAgICAgc3ViT2JqW2Zyb21LZXldID0gc3ViT2JqW3RvS2V5XTtcbiAgICAgIHN1Yk9ialt0b0tleV0gPSBmcm9tVmFsdWU7XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gQ29weSBvYmosIGxlYXZpbmcgbm9uLUpTT04gYmVoaW5kLlxuICB1dGlsLmNvcHlWYWx1ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHZhbHVlKSk7XG4gIH07XG5cbiAgLy8gQ29weSBvYmogcmVjdXJzaW5nIGRlZXBseS5cbiAgdXRpbC5kZWVwQ29weSA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICBpZiAoXy5pc0FycmF5KG9iaikpIHtcbiAgICAgIHJldHVybiBvYmoubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgIHJldHVybiB1dGlsLmRlZXBDb3B5KGl0ZW0pO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChfLmlzT2JqZWN0KG9iaikpIHtcbiAgICAgIHZhciBjb3B5ID0ge307XG4gICAgICBfLmVhY2gob2JqLCBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgICBjb3B5W2tleV0gPSB1dGlsLmRlZXBDb3B5KHZhbHVlKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGNvcHk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuICB9O1xuXG4gIC8vIENoZWNrIGlmIGl0ZW0gbWF0Y2hlcyBzb21lIHZhbHVlLCBiYXNlZCBvbiB0aGUgaXRlbSdzIGBtYXRjaGAgcHJvcGVydHkuXG4gIHV0aWwuaXRlbU1hdGNoZXNWYWx1ZSA9IGZ1bmN0aW9uIChpdGVtLCB2YWx1ZSkge1xuICAgIHZhciBtYXRjaCA9IGl0ZW0ubWF0Y2g7XG4gICAgaWYgKCFtYXRjaCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBfLmV2ZXJ5KF8ua2V5cyhtYXRjaCksIGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHJldHVybiBfLmlzRXF1YWwobWF0Y2hba2V5XSwgdmFsdWVba2V5XSk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gQ3JlYXRlIGEgZmllbGQgZGVmaW5pdGlvbiBmcm9tIGEgdmFsdWUuXG4gIHV0aWwuZmllbGREZWZGcm9tVmFsdWUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YXIgZGVmID0ge1xuICAgICAgdHlwZTogJ2pzb24nXG4gICAgfTtcbiAgICBpZiAoXy5pc1N0cmluZyh2YWx1ZSkpIHtcbiAgICAgIGRlZiA9IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmIChfLmlzTnVtYmVyKHZhbHVlKSkge1xuICAgICAgZGVmID0ge1xuICAgICAgICB0eXBlOiAnbnVtYmVyJ1xuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKF8uaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgIHZhciBhcnJheUl0ZW1GaWVsZHMgPSB2YWx1ZS5tYXAoZnVuY3Rpb24gKHZhbHVlLCBpKSB7XG4gICAgICAgIHZhciBjaGlsZERlZiA9IHV0aWwuZmllbGREZWZGcm9tVmFsdWUodmFsdWUpO1xuICAgICAgICBjaGlsZERlZi5rZXkgPSBpO1xuICAgICAgICByZXR1cm4gY2hpbGREZWY7XG4gICAgICB9KTtcbiAgICAgIGRlZiA9IHtcbiAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgZmllbGRzOiBhcnJheUl0ZW1GaWVsZHNcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmIChfLmlzT2JqZWN0KHZhbHVlKSkge1xuICAgICAgdmFyIG9iamVjdEl0ZW1GaWVsZHMgPSBPYmplY3Qua2V5cyh2YWx1ZSkubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgdmFyIGNoaWxkRGVmID0gdXRpbC5maWVsZERlZkZyb21WYWx1ZSh2YWx1ZVtrZXldKTtcbiAgICAgICAgY2hpbGREZWYua2V5ID0ga2V5O1xuICAgICAgICBjaGlsZERlZi5sYWJlbCA9IHV0aWwuaHVtYW5pemUoa2V5KTtcbiAgICAgICAgcmV0dXJuIGNoaWxkRGVmO1xuICAgICAgfSk7XG4gICAgICBkZWYgPSB7XG4gICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICBmaWVsZHM6IG9iamVjdEl0ZW1GaWVsZHNcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmIChfLmlzTnVsbCh2YWx1ZSkpIHtcbiAgICAgIGRlZiA9IHtcbiAgICAgICAgdHlwZTogJ251bGwnXG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gZGVmO1xuICB9O1xuXG4gIGlmIChwbHVnaW4uY29uZmlnLmh1bWFuaXplKSB7XG4gICAgLy8gR2V0IHRoZSBodW1hbml6ZSBmdW5jdGlvbiBmcm9tIGEgcGx1Z2luIGlmIHByb3ZpZGVkLlxuICAgIHV0aWwuaHVtYW5pemUgPSBwbHVnaW4ucmVxdWlyZShwbHVnaW4uY29uZmlnLmh1bWFuaXplKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBDb252ZXJ0IHByb3BlcnR5IGtleXMgdG8gXCJodW1hblwiIGxhYmVscy4gRm9yIGV4YW1wbGUsICdmb28nIGJlY29tZXNcbiAgICAvLyAnRm9vJy5cbiAgICB1dGlsLmh1bWFuaXplID0gZnVuY3Rpb24ocHJvcGVydHkpIHtcbiAgICAgIHByb3BlcnR5ID0gcHJvcGVydHkucmVwbGFjZSgvXFx7XFx7L2csICcnKTtcbiAgICAgIHByb3BlcnR5ID0gcHJvcGVydHkucmVwbGFjZSgvXFx9XFx9L2csICcnKTtcbiAgICAgIHJldHVybiBwcm9wZXJ0eS5yZXBsYWNlKC9fL2csICcgJylcbiAgICAgICAgLnJlcGxhY2UoLyhcXHcrKS9nLCBmdW5jdGlvbihtYXRjaCkge1xuICAgICAgICAgIHJldHVybiBtYXRjaC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIG1hdGNoLnNsaWNlKDEpO1xuICAgICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgLy8gSm9pbiBtdWx0aXBsZSBDU1MgY2xhc3MgbmFtZXMgdG9nZXRoZXIsIGlnbm9yaW5nIGFueSB0aGF0IGFyZW4ndCB0aGVyZS5cbiAgdXRpbC5jbGFzc05hbWUgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY2xhc3NOYW1lcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCk7XG5cbiAgICBjbGFzc05hbWVzID0gY2xhc3NOYW1lcy5maWx0ZXIoZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgIHJldHVybiBuYW1lO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGNsYXNzTmFtZXMuam9pbignICcpO1xuICB9O1xuXG4gIC8vIEpvaW4ga2V5cyB0b2dldGhlciB0byBtYWtlIHNpbmdsZSBcIm1ldGFcIiBrZXkuIEZvciBsb29raW5nIHVwIG1ldGFkYXRhIGluXG4gIC8vIHRoZSBtZXRhZGF0YSBwYXJ0IG9mIHRoZSBzdG9yZS5cbiAgdXRpbC5qb2luTWV0YUtleXMgPSBmdW5jdGlvbiAoa2V5cykge1xuICAgIHJldHVybiBrZXlzLmpvaW4oJzo6Jyk7XG4gIH07XG5cbiAgLy8gU3BsaXQgYSBqb2luZWQga2V5IGludG8gc2VwYXJhdGUga2V5IHBhcnRzLlxuICB1dGlsLnNwbGl0TWV0YUtleSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4ga2V5LnNwbGl0KCc6OicpO1xuICB9O1xuXG4gIHV0aWwubWV0YUNhY2hlS2V5ID0gZnVuY3Rpb24gKHNvdXJjZSwgcGFyYW1zKSB7XG4gICAgcGFyYW1zID0gcGFyYW1zIHx8IHt9O1xuICAgIHJldHVybiBzb3VyY2UgKyAnOjpwYXJhbXMoJyArIEpTT04uc3RyaW5naWZ5KHBhcmFtcykgKyAnKSc7XG4gIH07XG5cbiAgLy8gV3JhcCBhIHRleHQgdmFsdWUgc28gaXQgaGFzIGEgdHlwZS4gRm9yIHBhcnNpbmcgdGV4dCB3aXRoIHRhZ3MuXG4gIHZhciB0ZXh0UGFydCA9IGZ1bmN0aW9uICh2YWx1ZSwgdHlwZSkge1xuICAgIHR5cGUgPSB0eXBlIHx8ICd0ZXh0JztcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogdHlwZSxcbiAgICAgIHZhbHVlOiB2YWx1ZVxuICAgIH07XG4gIH07XG5cbiAgLy8gUGFyc2UgdGV4dCB0aGF0IGhhcyB0YWdzIGxpa2Uge3t0YWd9fSBpbnRvIHRleHQgYW5kIHRhZ3MuXG4gIHV0aWwucGFyc2VUZXh0V2l0aFRhZ3MgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YWx1ZSA9IHZhbHVlIHx8ICcnO1xuICAgIHZhciBwYXJ0cyA9IHZhbHVlLnNwbGl0KC97eyg/IXspLyk7XG4gICAgdmFyIGZyb250UGFydCA9IFtdO1xuICAgIGlmIChwYXJ0c1swXSAhPT0gJycpIHtcbiAgICAgIGZyb250UGFydCA9IFtcbiAgICAgICAgdGV4dFBhcnQocGFydHNbMF0pXG4gICAgICBdO1xuICAgIH1cbiAgICBwYXJ0cyA9IGZyb250UGFydC5jb25jYXQoXG4gICAgICBwYXJ0cy5zbGljZSgxKS5tYXAoZnVuY3Rpb24gKHBhcnQpIHtcbiAgICAgICAgaWYgKHBhcnQuaW5kZXhPZignfX0nKSA+PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHRleHRQYXJ0KHBhcnQuc3Vic3RyaW5nKDAsIHBhcnQuaW5kZXhPZignfX0nKSksICd0YWcnKSxcbiAgICAgICAgICAgIHRleHRQYXJ0KHBhcnQuc3Vic3RyaW5nKHBhcnQuaW5kZXhPZignfX0nKSArIDIpKVxuICAgICAgICAgIF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRleHRQYXJ0KCd7eycgKyBwYXJ0LCAndGV4dCcpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICk7XG4gICAgcmV0dXJuIFtdLmNvbmNhdC5hcHBseShbXSwgcGFydHMpO1xuICB9O1xuXG4gIC8vIENvcHkgYWxsIGNvbXB1dGVkIHN0eWxlcyBmcm9tIG9uZSBET00gZWxlbWVudCB0byBhbm90aGVyLlxuICB1dGlsLmNvcHlFbGVtZW50U3R5bGUgPSBmdW5jdGlvbiAoZnJvbUVsZW1lbnQsIHRvRWxlbWVudCkge1xuICAgIHZhciBmcm9tU3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShmcm9tRWxlbWVudCwgJycpO1xuXG4gICAgaWYgKGZyb21TdHlsZS5jc3NUZXh0ICE9PSAnJykge1xuICAgICAgdG9FbGVtZW50LnN0eWxlLmNzc1RleHQgPSBmcm9tU3R5bGUuY3NzVGV4dDtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgY3NzUnVsZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZyb21TdHlsZS5sZW5ndGg7IGkrKykge1xuICAgICAgLy9jb25zb2xlLmxvZyhpLCBmcm9tU3R5bGVbaV0sIGZyb21TdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKGZyb21TdHlsZVtpXSkpXG4gICAgICAvL3RvRWxlbWVudC5zdHlsZVtmcm9tU3R5bGVbaV1dID0gZnJvbVN0eWxlLmdldFByb3BlcnR5VmFsdWUoZnJvbVN0eWxlW2ldKTtcbiAgICAgIGNzc1J1bGVzLnB1c2goZnJvbVN0eWxlW2ldICsgJzonICsgZnJvbVN0eWxlLmdldFByb3BlcnR5VmFsdWUoZnJvbVN0eWxlW2ldKSArICc7Jyk7XG4gICAgfVxuICAgIHZhciBjc3NUZXh0ID0gY3NzUnVsZXMuam9pbignJyk7XG5cbiAgICB0b0VsZW1lbnQuc3R5bGUuY3NzVGV4dCA9IGNzc1RleHQ7XG4gIH07XG5cbiAgLy8gT2JqZWN0IHRvIGhvbGQgYnJvd3NlciBzbmlmZmluZyBpbmZvLlxuICB2YXIgYnJvd3NlciA9IHtcbiAgICBpc0Nocm9tZTogZmFsc2UsXG4gICAgaXNNb3ppbGxhOiBmYWxzZSxcbiAgICBpc09wZXJhOiBmYWxzZSxcbiAgICBpc0llOiBmYWxzZSxcbiAgICBpc1NhZmFyaTogZmFsc2VcbiAgfTtcblxuICAvLyBTbmlmZiB0aGUgYnJvd3Nlci5cbiAgdmFyIHVhID0gbmF2aWdhdG9yLnVzZXJBZ2VudDtcbiAgaWYodWEuaW5kZXhPZignQ2hyb21lJykgPiAtMSkge1xuICAgIGJyb3dzZXIuaXNDaHJvbWUgPSB0cnVlO1xuICB9IGVsc2UgaWYgKHVhLmluZGV4T2YoJ1NhZmFyaScpID4gLTEpIHtcbiAgICBicm93c2VyLmlzU2FmYXJpID0gdHJ1ZTtcbiAgfSBlbHNlIGlmICh1YS5pbmRleE9mKCdPcGVyYScpID4gLTEpIHtcbiAgICBicm93c2VyLmlzT3BlcmEgPSB0cnVlO1xuICB9IGVsc2UgaWYgKHVhLmluZGV4T2YoJ0ZpcmVmb3gnKSA+IC0xKSB7XG4gICAgYnJvd3Nlci5pc01vemlsbGEgPSB0cnVlO1xuICB9IGVsc2UgaWYgKHVhLmluZGV4T2YoJ01TSUUnKSA+IC0xKSB7XG4gICAgYnJvd3Nlci5pc0llID0gdHJ1ZTtcbiAgfVxuXG4gIHV0aWwuYnJvd3NlciA9IGJyb3dzZXI7XG5cbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG4vLyAjIEZvcm1hdGljIHBsdWdpbiBjb3JlXG5cbi8vIEF0IGl0cyBjb3JlLCBGb3JtYXRpYyBpcyBqdXN0IGEgcGx1Z2luIGhvc3QuIEFsbCBvZiB0aGUgZnVuY3Rpb25hbGl0eSBpdCBoYXNcbi8vIG91dCBvZiB0aGUgYm94IGlzIHZpYSBwbHVnaW5zLiBUaGVzZSBwbHVnaW5zIGNhbiBiZSByZXBsYWNlZCBvciBleHRlbmRlZCBieVxuLy8gb3RoZXIgcGx1Z2lucy5cblxuLy8gVGhlIGdsb2JhbCBwbHVnaW4gcmVnaXN0cnkgaG9sZHMgcmVnaXN0ZXJlZCAoYnV0IG5vdCB5ZXQgaW5zdGFudGlhdGVkKVxuLy8gcGx1Z2lucy5cbnZhciBwbHVnaW5SZWdpc3RyeSA9IHt9O1xuXG4vLyBHcm91cCBwbHVnaW5zIGJ5IHByZWZpeC5cbnZhciBwbHVnaW5Hcm91cHMgPSB7fTtcblxuLy8gRm9yIGFub255bW91cyBwbHVnaW5zLCBpbmNyZW1lbnRpbmcgbnVtYmVyIGZvciBuYW1lcy5cbnZhciBwbHVnaW5JZCA9IDA7XG5cbi8vIFJlZ2lzdGVyIGEgcGx1Z2luIG9yIHBsdWdpbiBidW5kbGUgKGFycmF5IG9mIHBsdWdpbnMpIGdsb2JhbGx5LlxudmFyIHJlZ2lzdGVyUGx1Z2luID0gZnVuY3Rpb24gKG5hbWUsIHBsdWdpbkluaXRGbikge1xuXG4gIGlmIChwbHVnaW5SZWdpc3RyeVtuYW1lXSkge1xuICAgIHRocm93IG5ldyBFcnJvcignUGx1Z2luICcgKyBuYW1lICsgJyBpcyBhbHJlYWR5IHJlZ2lzdGVyZWQuJyk7XG4gIH1cblxuICBpZiAoXy5pc0FycmF5KHBsdWdpbkluaXRGbikpIHtcbiAgICBwbHVnaW5SZWdpc3RyeVtuYW1lXSA9IFtdO1xuICAgIHBsdWdpbkluaXRGbi5mb3JFYWNoKGZ1bmN0aW9uIChwbHVnaW5TcGVjKSB7XG4gICAgICByZWdpc3RlclBsdWdpbihwbHVnaW5TcGVjLm5hbWUsIHBsdWdpblNwZWMucGx1Z2luKTtcbiAgICAgIHBsdWdpblJlZ2lzdHJ5W25hbWVdLnB1c2gocGx1Z2luU3BlYy5uYW1lKTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmIChfLmlzT2JqZWN0KHBsdWdpbkluaXRGbikgJiYgIV8uaXNGdW5jdGlvbihwbHVnaW5Jbml0Rm4pKSB7XG4gICAgdmFyIGJ1bmRsZU5hbWUgPSBuYW1lO1xuICAgIHBsdWdpblJlZ2lzdHJ5W2J1bmRsZU5hbWVdID0gW107XG4gICAgT2JqZWN0LmtleXMocGx1Z2luSW5pdEZuKS5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICByZWdpc3RlclBsdWdpbihuYW1lLCBwbHVnaW5Jbml0Rm5bbmFtZV0pO1xuICAgICAgcGx1Z2luUmVnaXN0cnlbYnVuZGxlTmFtZV0ucHVzaChuYW1lKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBwbHVnaW5SZWdpc3RyeVtuYW1lXSA9IHBsdWdpbkluaXRGbjtcbiAgICAvLyBBZGQgcGx1Z2luIG5hbWUgdG8gcGx1Z2luIGdyb3VwIGlmIGl0IGhhcyBhIHByZWZpeC5cbiAgICBpZiAobmFtZS5pbmRleE9mKCcuJykgPiAwKSB7XG4gICAgICB2YXIgcHJlZml4ID0gbmFtZS5zdWJzdHJpbmcoMCwgbmFtZS5pbmRleE9mKCcuJykpO1xuICAgICAgcGx1Z2luR3JvdXBzW3ByZWZpeF0gPSBwbHVnaW5Hcm91cHNbcHJlZml4XSB8fCBbXTtcbiAgICAgIHBsdWdpbkdyb3Vwc1twcmVmaXhdLnB1c2gobmFtZSk7XG4gICAgfVxuICB9XG59O1xuXG4vLyBEZWZhdWx0IHBsdWdpbiBjb25maWcuIEVhY2gga2V5IHJlcHJlc2VudHMgYSBwbHVnaW4gbmFtZS4gRWFjaCBrZXkgb2YgdGhhdFxuLy8gcGx1Z2luIHJlcHJlc2VudHMgYSBzZXR0aW5nIGZvciB0aGF0IHBsdWdpbi4gUGFzc2VkLWluIGNvbmZpZyB3aWxsIG92ZXJyaWRlXG4vLyBlYWNoIGluZGl2aWR1YWwgc2V0dGluZy5cbnZhciBkZWZhdWx0UGx1Z2luQ29uZmlnID0ge1xuICBjb3JlOiB7XG4gICAgZm9ybWF0aWM6IFsnY29yZS5mb3JtYXRpYyddLFxuICAgIGZvcm06IFsnY29yZS5mb3JtLWluaXQnLCAnY29yZS5mb3JtJywgJ2NvcmUuZmllbGQnXVxuICB9LFxuICAnY29yZS5mb3JtJzoge1xuICAgIHN0b3JlOiAnc3RvcmUubWVtb3J5J1xuICB9LFxuICAnZmllbGQtcm91dGVyJzoge1xuICAgIHJvdXRlczogWydmaWVsZC1yb3V0ZXMnXVxuICB9LFxuICBjb21waWxlcjoge1xuICAgIGNvbXBpbGVyczogWydjb21waWxlci5jaG9pY2VzJywgJ2NvbXBpbGVyLmxvb2t1cCcsICdjb21waWxlci50eXBlcycsICdjb21waWxlci5wcm9wLWFsaWFzZXMnXVxuICB9LFxuICBjb21wb25lbnQ6IHtcbiAgICBwcm9wczogWydkZWZhdWx0LXN0eWxlJ11cbiAgfVxufTtcblxuLy8gIyMgRm9ybWF0aWMgZmFjdG9yeVxuXG4vLyBDcmVhdGUgYSBuZXcgZm9ybWF0aWMgaW5zdGFuY2UuIEEgZm9ybWF0aWMgaW5zdGFuY2UgaXMgYSBmdW5jdGlvbiB0aGF0IGNhblxuLy8gY3JlYXRlIGZvcm1zLiBJdCBhbHNvIGhhcyBhIGAuY3JlYXRlYCBtZXRob2QgdGhhdCBjYW4gY3JlYXRlIG90aGVyIGZvcm1hdGljXG4vLyBpbnN0YW5jZXMuXG52YXIgY3JlYXRlRm9ybWF0aWNDb3JlID0gZnVuY3Rpb24gKGNvbmZpZykge1xuXG4gIC8vIE1ha2UgYSBjb3B5IG9mIGNvbmZpZyBzbyB3ZSBjYW4gbW9ua2V5IHdpdGggaXQuXG4gIGNvbmZpZyA9IF8uZXh0ZW5kKHt9LCBjb25maWcpO1xuXG4gIC8vIEFkZCBkZWZhdWx0IGNvbmZpZyBzZXR0aW5ncyAod2hlcmUgbm90IG92ZXJyaWRkZW4pLlxuICBfLmtleXMoZGVmYXVsdFBsdWdpbkNvbmZpZykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgY29uZmlnW2tleV0gPSBfLmV4dGVuZCh7fSwgZGVmYXVsdFBsdWdpbkNvbmZpZ1trZXldLCBjb25maWdba2V5XSk7XG4gIH0pO1xuXG4gIC8vIFRoZSBgZm9ybWF0aWNgIHZhcmlhYmxlIHdpbGwgaG9sZCB0aGUgZnVuY3Rpb24gdGhhdCBnZXRzIHJldHVybmVkIGZyb20gdGhlXG4gIC8vIGZhY3RvcnkuXG4gIHZhciBmb3JtYXRpYztcblxuICAvLyBJbnN0YW50aWF0ZWQgcGx1Z2lucyBhcmUgY2FjaGVkIGp1c3QgbGlrZSBDb21tb25KUyBtb2R1bGVzLlxuICB2YXIgcGx1Z2luQ2FjaGUgPSB7fTtcblxuICAvLyAjIyBQbHVnaW4gcHJvdG90eXBlXG5cbiAgLy8gVGhlIFBsdWdpbiBwcm90b3R5cGUgZXhpc3RzIGluc2lkZSB0aGUgRm9ybWF0aWMgZmFjdG9yeSBmdW5jdGlvbiBqdXN0IHRvXG4gIC8vIG1ha2UgaXQgZWFzaWVyIHRvIGdyYWIgdmFsdWVzIGZyb20gdGhlIGNsb3N1cmUuXG5cbiAgLy8gUGx1Z2lucyBhcmUgc2ltaWxhciB0byBDb21tb25KUyBtb2R1bGVzLiBGb3JtYXRpYyB1c2VzIHBsdWdpbnMgYXMgYSBzbGlnaHRcbiAgLy8gdmFyaWFudCB0aG91Z2ggYmVjYXVzZTpcbiAgLy8gLSBGb3JtYXRpYyBwbHVnaW5zIGFyZSBjb25maWd1cmFibGUuXG4gIC8vIC0gRm9ybWF0aWMgcGx1Z2lucyBhcmUgaW5zdGFudGlhdGVkIHBlciBmb3JtYXRpYyBpbnN0YW5jZS4gQ29tbW9uSlMgbW9kdWxlc1xuICAvLyAgIGFyZSBjcmVhdGVkIG9uY2UgYW5kIHdvdWxkIGJlIHNoYXJlZCBhY3Jvc3MgYWxsIGZvcm1hdGljIGluc3RhbmNlcy5cbiAgLy8gLSBGb3JtYXRpYyBwbHVnaW5zIGFyZSBlYXNpbHkgb3ZlcnJpZGFibGUgKGFsc28gdmlhIGNvbmZpZ3VyYXRpb24pLlxuXG4gIC8vIFdoZW4gYSBwbHVnaW4gaXMgaW5zdGFudGlhdGVkLCB3ZSBjYWxsIHRoZSBgUGx1Z2luYCBjb25zdHJ1Y3Rvci4gVGhlIHBsdWdpblxuICAvLyBpbnN0YW5jZSBpcyB0aGVuIHBhc3NlZCB0byB0aGUgcGx1Z2luJ3MgaW5pdGlhbGl6YXRpb24gZnVuY3Rpb24uXG4gIHZhciBQbHVnaW4gPSBmdW5jdGlvbiAobmFtZSwgY29uZmlnKSB7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFBsdWdpbikpIHtcbiAgICAgIHJldHVybiBuZXcgUGx1Z2luKG5hbWUsIGNvbmZpZyk7XG4gICAgfVxuICAgIC8vIEV4cG9ydHMgYW5hbG9nb3VzIHRvIENvbW1vbkpTIGV4cG9ydHMuXG4gICAgdGhpcy5leHBvcnRzID0ge307XG4gICAgLy8gQ29uZmlnIHZhbHVlcyBwYXNzZWQgaW4gdmlhIGZhY3RvcnkgYXJlIHJvdXRlZCB0byB0aGUgYXBwcm9wcmlhdGVcbiAgICAvLyBwbHVnaW4gYW5kIGF2YWlsYWJsZSB2aWEgYC5jb25maWdgLlxuICAgIHRoaXMuY29uZmlnID0gY29uZmlnIHx8IHt9O1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gIH07XG5cbiAgLy8gR2V0IGEgY29uZmlnIHZhbHVlIGZvciBhIHBsdWdpbiBvciByZXR1cm4gdGhlIGRlZmF1bHQgdmFsdWUuXG4gIFBsdWdpbi5wcm90b3R5cGUuY29uZmlnVmFsdWUgPSBmdW5jdGlvbiAoa2V5LCBkZWZhdWx0VmFsdWUpIHtcblxuICAgIGlmICh0eXBlb2YgdGhpcy5jb25maWdba2V5XSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbmZpZ1trZXldO1xuICAgIH1cbiAgICByZXR1cm4gZGVmYXVsdFZhbHVlIHx8ICcnO1xuICB9O1xuXG4gIC8vIFJlcXVpcmUgYW5vdGhlciBwbHVnaW4gYnkgbmFtZS4gVGhpcyBpcyBtdWNoIGxpa2UgYSBDb21tb25KUyByZXF1aXJlXG4gIFBsdWdpbi5wcm90b3R5cGUucmVxdWlyZSA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgcmV0dXJuIGZvcm1hdGljLnBsdWdpbihuYW1lKTtcbiAgfTtcblxuICAvLyBIYW5kbGUgYSBzcGVjaWFsIHBsdWdpbiwgdGhlIGBjb21wb25lbnRgIHBsdWdpbiB3aGljaCBmaW5kcyBjb21wb25lbnRzLlxuICB2YXIgY29tcG9uZW50UGx1Z2luO1xuXG4gIC8vIEp1c3QgaGVyZSBpbiBjYXNlIHdlIHdhbnQgdG8gZHluYW1pY2FsbHkgY2hvb3NlIGNvbXBvbmVudCBsYXRlci5cbiAgUGx1Z2luLnByb3RvdHlwZS5jb21wb25lbnQgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHJldHVybiBjb21wb25lbnRQbHVnaW4uY29tcG9uZW50KG5hbWUpO1xuICB9O1xuXG4gIC8vIENoZWNrIGlmIGEgcGx1Z2luIGV4aXN0cy5cbiAgUGx1Z2luLnByb3RvdHlwZS5oYXNQbHVnaW4gPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHJldHVybiAobmFtZSBpbiBwbHVnaW5DYWNoZSkgfHwgKG5hbWUgaW4gcGx1Z2luUmVnaXN0cnkpO1xuICB9O1xuXG4gIC8vIENoZWNrIGlmIGEgY29tcG9uZW50IGV4aXN0cy4gQ29tcG9uZW50cyBhcmUgcmVhbGx5IGp1c3QgcGx1Z2lucyB3aXRoXG4gIC8vIGEgcGFydGljdWxhciBwcmVmaXggdG8gdGhlaXIgbmFtZXMuXG4gIFBsdWdpbi5wcm90b3R5cGUuaGFzQ29tcG9uZW50ID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5oYXNQbHVnaW4oJ2NvbXBvbmVudC4nICsgbmFtZSk7XG4gIH07XG5cbiAgLy8gR2l2ZW4gYSBsaXN0IG9mIHBsdWdpbiBuYW1lcywgcmVxdWlyZSB0aGVtIGFsbCBhbmQgcmV0dXJuIGEgbGlzdCBvZlxuICAvLyBpbnN0YW50aWF0ZWQgcGx1Z2lucy5cbiAgUGx1Z2luLnByb3RvdHlwZS5yZXF1aXJlQWxsID0gZnVuY3Rpb24gKHBsdWdpbkxpc3QpIHtcbiAgICBpZiAoIXBsdWdpbkxpc3QpIHtcbiAgICAgIHBsdWdpbkxpc3QgPSBbXTtcbiAgICB9XG4gICAgaWYgKCFfLmlzQXJyYXkocGx1Z2luTGlzdCkpIHtcbiAgICAgIHBsdWdpbkxpc3QgPSBbcGx1Z2luTGlzdF07XG4gICAgfVxuICAgIC8vIEluZmxhdGUgcmVnaXN0ZXJlZCBidW5kbGVzLiBBIGJ1bmRsZSBpcyBqdXN0IGEgbmFtZSB0aGF0IHBvaW50cyB0byBhblxuICAgIC8vIGFycmF5IG9mIG90aGVyIHBsdWdpbiBuYW1lcy5cbiAgICBwbHVnaW5MaXN0ID0gcGx1Z2luTGlzdC5tYXAoZnVuY3Rpb24gKHBsdWdpbikge1xuICAgICAgaWYgKF8uaXNTdHJpbmcocGx1Z2luKSkge1xuICAgICAgICBpZiAoXy5pc0FycmF5KHBsdWdpblJlZ2lzdHJ5W3BsdWdpbl0pKSB7XG4gICAgICAgICAgcmV0dXJuIHBsdWdpblJlZ2lzdHJ5W3BsdWdpbl07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBwbHVnaW47XG4gICAgfSk7XG4gICAgLy8gRmxhdHRlbiBhbnkgYnVuZGxlcywgc28gd2UgZW5kIHVwIHdpdGggYSBmbGF0IGFycmF5IG9mIHBsdWdpbiBuYW1lcy5cbiAgICBwbHVnaW5MaXN0ID0gXy5mbGF0dGVuKHBsdWdpbkxpc3QpO1xuICAgIHJldHVybiBwbHVnaW5MaXN0Lm1hcChmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZXF1aXJlKHBsdWdpbik7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfTtcblxuICAvLyBHaXZlbiBhIHByZWZpeCwgcmV0dXJuIGEgbWFwIG9mIGFsbCBpbnN0YW50aWF0ZWQgcGx1Z2lucyB3aXRoIHRoYXQgcHJlZml4LlxuICBQbHVnaW4ucHJvdG90eXBlLnJlcXVpcmVBbGxPZiA9IGZ1bmN0aW9uIChwcmVmaXgpIHtcbiAgICB2YXIgbWFwID0ge307XG5cbiAgICBpZiAocGx1Z2luR3JvdXBzW3ByZWZpeF0pIHtcbiAgICAgIHBsdWdpbkdyb3Vwc1twcmVmaXhdLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgbWFwW25hbWVdID0gdGhpcy5yZXF1aXJlKG5hbWUpO1xuICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWFwO1xuICB9O1xuXG4gIC8vICMjIEZvcm1hdGljIGZhY3RvcnksIGNvbnRpbnVlZC4uLlxuXG4gIC8vIEdyYWIgYSBwbHVnaW4gZnJvbSB0aGUgY2FjaGUsIG9yIGxvYWQgaXQgZnJlc2ggZnJvbSB0aGUgcmVnaXN0cnkuXG4gIHZhciBsb2FkUGx1Z2luID0gZnVuY3Rpb24gKG5hbWUsIHBsdWdpbkNvbmZpZykge1xuICAgIHZhciBwbHVnaW47XG5cbiAgICAvLyBXZSBjYW4gYWxzbyBsb2FkIGFub255bW91cyBwbHVnaW5zLlxuICAgIGlmIChfLmlzRnVuY3Rpb24obmFtZSkpIHtcblxuICAgICAgdmFyIGZhY3RvcnkgPSBuYW1lO1xuXG4gICAgICBpZiAoXy5pc1VuZGVmaW5lZChmYWN0b3J5Ll9fZXhwb3J0c19fKSkge1xuICAgICAgICBwbHVnaW5JZCsrO1xuICAgICAgICBwbHVnaW4gPSBQbHVnaW4oJ2Fub255bW91c19wbHVnaW5fJyArIHBsdWdpbklkLCBwbHVnaW5Db25maWcgfHwge30pO1xuICAgICAgICBmYWN0b3J5KHBsdWdpbik7XG4gICAgICAgIC8vIFN0b3JlIHRoZSBleHBvcnRzIG9uIHRoZSBhbm9ueW1vdXMgZnVuY3Rpb24gc28gd2Uga25vdyBpdCdzIGFscmVhZHlcbiAgICAgICAgLy8gYmVlbiBpbnN0YW50aWF0ZWQsIGFuZCB3ZSBjYW4ganVzdCBncmFiIHRoZSBleHBvcnRzLlxuICAgICAgICBmYWN0b3J5Ll9fZXhwb3J0c19fID0gcGx1Z2luLmV4cG9ydHM7XG4gICAgICB9XG5cbiAgICAgIC8vIExvYWQgdGhlIGNhY2hlZCBleHBvcnRzLlxuICAgICAgcmV0dXJuIGZhY3RvcnkuX19leHBvcnRzX187XG5cbiAgICB9IGVsc2UgaWYgKF8uaXNVbmRlZmluZWQocGx1Z2luQ2FjaGVbbmFtZV0pKSB7XG5cbiAgICAgIGlmICghcGx1Z2luQ29uZmlnICYmIGNvbmZpZ1tuYW1lXSkge1xuICAgICAgICBpZiAoY29uZmlnW25hbWVdLnBsdWdpbikge1xuICAgICAgICAgIHJldHVybiBsb2FkUGx1Z2luKGNvbmZpZ1tuYW1lXS5wbHVnaW4sIGNvbmZpZ1tuYW1lXSB8fCB7fSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHBsdWdpblJlZ2lzdHJ5W25hbWVdKSB7XG4gICAgICAgIGlmIChfLmlzRnVuY3Rpb24ocGx1Z2luUmVnaXN0cnlbbmFtZV0pKSB7XG4gICAgICAgICAgcGx1Z2luID0gUGx1Z2luKG5hbWUsIHBsdWdpbkNvbmZpZyB8fCBjb25maWdbbmFtZV0pO1xuICAgICAgICAgIHBsdWdpblJlZ2lzdHJ5W25hbWVdKHBsdWdpbik7XG4gICAgICAgICAgcGx1Z2luQ2FjaGVbbmFtZV0gPSBwbHVnaW4uZXhwb3J0cztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BsdWdpbiAnICsgbmFtZSArICcgaXMgbm90IGEgZnVuY3Rpb24uJyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignUGx1Z2luICcgKyBuYW1lICsgJyBub3QgZm91bmQuJyk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBwbHVnaW5DYWNoZVtuYW1lXTtcbiAgfTtcblxuICAvLyBBc3NpZ24gYGZvcm1hdGljYCB0byBhIGZ1bmN0aW9uIHRoYXQgdGFrZXMgZm9ybSBvcHRpb25zIGFuZCByZXR1cm5zIGEgZm9ybS5cbiAgZm9ybWF0aWMgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIHJldHVybiBmb3JtYXRpYy5mb3JtKG9wdGlvbnMpO1xuICB9O1xuXG4gIC8vIEFsbG93IGdsb2JhbCBwbHVnaW4gcmVnaXN0cnkgZnJvbSB0aGUgZm9ybWF0aWMgZnVuY3Rpb24gaW5zdGFuY2UuXG4gIGZvcm1hdGljLnJlZ2lzdGVyID0gZnVuY3Rpb24gKG5hbWUsIHBsdWdpbkluaXRGbikge1xuICAgIHJlZ2lzdGVyUGx1Z2luKG5hbWUsIHBsdWdpbkluaXRGbik7XG4gICAgcmV0dXJuIGZvcm1hdGljO1xuICB9O1xuXG4gIC8vIEFsbG93IHJldHJpZXZpbmcgcGx1Z2lucyBmcm9tIHRoZSBmb3JtYXRpYyBmdW5jdGlvbiBpbnN0YW5jZS5cbiAgZm9ybWF0aWMucGx1Z2luID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICByZXR1cm4gbG9hZFBsdWdpbihuYW1lKTtcbiAgfTtcblxuICAvLyBBbGxvdyBjcmVhdGluZyBhIG5ldyBmb3JtYXRpYyBpbnN0YW5jZSBmcm9tIGEgZm9ybWF0aWMgaW5zdGFuY2UuXG4gIC8vZm9ybWF0aWMuY3JlYXRlID0gRm9ybWF0aWM7XG5cbiAgLy8gVXNlIHRoZSBjb3JlIHBsdWdpbiB0byBhZGQgbWV0aG9kcyB0byB0aGUgZm9ybWF0aWMgaW5zdGFuY2UuXG4gIHZhciBjb3JlID0gbG9hZFBsdWdpbignY29yZScpO1xuXG4gIGNvcmUoZm9ybWF0aWMpO1xuXG4gIC8vIE5vdyBiaW5kIHRoZSBjb21wb25lbnQgcGx1Z2luLiBXZSB3YWl0IHRpbGwgbm93LCBzbyB0aGUgY29yZSBpcyBsb2FkZWRcbiAgLy8gZmlyc3QuXG4gIGNvbXBvbmVudFBsdWdpbiA9IGxvYWRQbHVnaW4oJ2NvbXBvbmVudCcpO1xuXG4gIC8vIFJldHVybiB0aGUgZm9ybWF0aWMgZnVuY3Rpb24gaW5zdGFuY2UuXG4gIHJldHVybiBmb3JtYXRpYztcbn07XG5cbi8vIEp1c3QgYSBoZWxwZXIgdG8gcmVnaXN0ZXIgYSBidW5jaCBvZiBwbHVnaW5zLlxudmFyIHJlZ2lzdGVyUGx1Z2lucyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGFyZyA9IF8udG9BcnJheShhcmd1bWVudHMpO1xuICBhcmcuZm9yRWFjaChmdW5jdGlvbiAoYXJnKSB7XG4gICAgdmFyIG5hbWUgPSBhcmdbMF07XG4gICAgdmFyIHBsdWdpbiA9IGFyZ1sxXTtcbiAgICByZWdpc3RlclBsdWdpbihuYW1lLCBwbHVnaW4pO1xuICB9KTtcbn07XG5cbi8vIFJlZ2lzdGVyIGFsbCB0aGUgYnVpbHQtaW4gcGx1Z2lucy5cbnJlZ2lzdGVyUGx1Z2lucyhcbiAgWydjb3JlJywgcmVxdWlyZSgnLi9kZWZhdWx0L2NvcmUnKV0sXG5cbiAgWydjb3JlLmZvcm1hdGljJywgcmVxdWlyZSgnLi9jb3JlL2Zvcm1hdGljJyldLFxuICBbJ2NvcmUuZm9ybS1pbml0JywgcmVxdWlyZSgnLi9jb3JlL2Zvcm0taW5pdCcpXSxcbiAgWydjb3JlLmZvcm0nLCByZXF1aXJlKCcuL2NvcmUvZm9ybScpXSxcbiAgWydjb3JlLmZpZWxkJywgcmVxdWlyZSgnLi9jb3JlL2ZpZWxkJyldLFxuXG4gIFsndXRpbCcsIHJlcXVpcmUoJy4vZGVmYXVsdC91dGlsJyldLFxuICBbJ2NvbXBpbGVyJywgcmVxdWlyZSgnLi9kZWZhdWx0L2NvbXBpbGVyJyldLFxuICBbJ2V2YWwnLCByZXF1aXJlKCcuL2RlZmF1bHQvZXZhbCcpXSxcbiAgWydldmFsLWZ1bmN0aW9ucycsIHJlcXVpcmUoJy4vZGVmYXVsdC9ldmFsLWZ1bmN0aW9ucycpXSxcbiAgWydsb2FkZXInLCByZXF1aXJlKCcuL2RlZmF1bHQvbG9hZGVyJyldLFxuICBbJ2ZpZWxkLXJvdXRlcicsIHJlcXVpcmUoJy4vZGVmYXVsdC9maWVsZC1yb3V0ZXInKV0sXG4gIFsnZmllbGQtcm91dGVzJywgcmVxdWlyZSgnLi9kZWZhdWx0L2ZpZWxkLXJvdXRlcycpXSxcblxuICBbJ2NvbXBpbGVyLmNob2ljZXMnLCByZXF1aXJlKCcuL2NvbXBpbGVycy9jaG9pY2VzJyldLFxuICBbJ2NvbXBpbGVyLmxvb2t1cCcsIHJlcXVpcmUoJy4vY29tcGlsZXJzL2xvb2t1cCcpXSxcbiAgWydjb21waWxlci50eXBlcycsIHJlcXVpcmUoJy4vY29tcGlsZXJzL3R5cGVzJyldLFxuICBbJ2NvbXBpbGVyLnByb3AtYWxpYXNlcycsIHJlcXVpcmUoJy4vY29tcGlsZXJzL3Byb3AtYWxpYXNlcycpXSxcblxuICBbJ3N0b3JlLm1lbW9yeScsIHJlcXVpcmUoJy4vc3RvcmUvbWVtb3J5JyldLFxuXG4gIFsndHlwZS5yb290JywgcmVxdWlyZSgnLi90eXBlcy9yb290JyldLFxuICBbJ3R5cGUuc3RyaW5nJywgcmVxdWlyZSgnLi90eXBlcy9zdHJpbmcnKV0sXG4gIFsndHlwZS5vYmplY3QnLCByZXF1aXJlKCcuL3R5cGVzL29iamVjdCcpXSxcbiAgWyd0eXBlLmJvb2xlYW4nLCByZXF1aXJlKCcuL3R5cGVzL2Jvb2xlYW4nKV0sXG4gIFsndHlwZS5hcnJheScsIHJlcXVpcmUoJy4vdHlwZXMvYXJyYXknKV0sXG4gIFsndHlwZS5qc29uJywgcmVxdWlyZSgnLi90eXBlcy9qc29uJyldLFxuICBbJ3R5cGUubnVtYmVyJywgcmVxdWlyZSgnLi90eXBlcy9udW1iZXInKV0sXG5cbiAgWydjb21wb25lbnQnLCByZXF1aXJlKCcuL2RlZmF1bHQvY29tcG9uZW50JyldLFxuXG4gIFsnY29tcG9uZW50LmZvcm1hdGljJywgcmVxdWlyZSgnLi9jb21wb25lbnRzL2Zvcm1hdGljJyldLFxuICBbJ2NvbXBvbmVudC5yb290JywgcmVxdWlyZSgnLi9jb21wb25lbnRzL3Jvb3QnKV0sXG4gIFsnY29tcG9uZW50LmZpZWxkJywgcmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkJyldLFxuICBbJ2NvbXBvbmVudC5sYWJlbCcsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9sYWJlbCcpXSxcbiAgWydjb21wb25lbnQuaGVscCcsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwJyldLFxuICBbJ2NvbXBvbmVudC5zYW1wbGUnLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvc2FtcGxlJyldLFxuICBbJ2NvbXBvbmVudC5maWVsZHNldCcsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHNldCcpXSxcbiAgWydjb21wb25lbnQudGV4dCcsIHJlcXVpcmUoJy4vY29tcG9uZW50cy90ZXh0JyldLFxuICBbJ2NvbXBvbmVudC50ZXh0YXJlYScsIHJlcXVpcmUoJy4vY29tcG9uZW50cy90ZXh0YXJlYScpXSxcbiAgWydjb21wb25lbnQuc2VsZWN0JywgcmVxdWlyZSgnLi9jb21wb25lbnRzL3NlbGVjdCcpXSxcbiAgWydjb21wb25lbnQubGlzdCcsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9saXN0JyldLFxuICBbJ2NvbXBvbmVudC5saXN0LWNvbnRyb2wnLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvbGlzdC1jb250cm9sJyldLFxuICBbJ2NvbXBvbmVudC5saXN0LWl0ZW0nLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvbGlzdC1pdGVtJyldLFxuICBbJ2NvbXBvbmVudC5saXN0LWl0ZW0tdmFsdWUnLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvbGlzdC1pdGVtLXZhbHVlJyldLFxuICBbJ2NvbXBvbmVudC5saXN0LWl0ZW0tY29udHJvbCcsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9saXN0LWl0ZW0tY29udHJvbCcpXSxcbiAgWydjb21wb25lbnQuaXRlbS1jaG9pY2VzJywgcmVxdWlyZSgnLi9jb21wb25lbnRzL2l0ZW0tY2hvaWNlcycpXSxcbiAgWydjb21wb25lbnQuYWRkLWl0ZW0nLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvYWRkLWl0ZW0nKV0sXG4gIFsnY29tcG9uZW50LnJlbW92ZS1pdGVtJywgcmVxdWlyZSgnLi9jb21wb25lbnRzL3JlbW92ZS1pdGVtJyldLFxuICBbJ2NvbXBvbmVudC5tb3ZlLWl0ZW0tYmFjaycsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9tb3ZlLWl0ZW0tYmFjaycpXSxcbiAgWydjb21wb25lbnQubW92ZS1pdGVtLWZvcndhcmQnLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvbW92ZS1pdGVtLWZvcndhcmQnKV0sXG4gIFsnY29tcG9uZW50Lmpzb24nLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvanNvbicpXSxcbiAgWydjb21wb25lbnQuY2hlY2tib3gtbGlzdCcsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9jaGVja2JveC1saXN0JyldLFxuICBbJ2NvbXBvbmVudC5wcmV0dHktdGV4dGFyZWEnLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvcHJldHR5LXRleHRhcmVhJyldLFxuICBbJ2NvbXBvbmVudC5jaG9pY2VzJywgcmVxdWlyZSgnLi9jb21wb25lbnRzL2Nob2ljZXMnKV0sXG5cbiAgWydtaXhpbi5jbGljay1vdXRzaWRlJywgcmVxdWlyZSgnLi9taXhpbnMvY2xpY2stb3V0c2lkZScpXSxcbiAgWydtaXhpbi5maWVsZCcsIHJlcXVpcmUoJy4vbWl4aW5zL2ZpZWxkJyldLFxuICBbJ21peGluLmlucHV0LWFjdGlvbnMnLCByZXF1aXJlKCcuL21peGlucy9pbnB1dC1hY3Rpb25zJyldLFxuICBbJ21peGluLnJlc2l6ZScsIHJlcXVpcmUoJy4vbWl4aW5zL3Jlc2l6ZScpXSxcbiAgWydtaXhpbi5zY3JvbGwnLCByZXF1aXJlKCcuL21peGlucy9zY3JvbGwnKV0sXG4gIFsnbWl4aW4udW5kby1zdGFjaycsIHJlcXVpcmUoJy4vbWl4aW5zL3VuZG8tc3RhY2snKV0sXG5cbiAgWydib290c3RyYXAtc3R5bGUnLCByZXF1aXJlKCcuL3BsdWdpbnMvYm9vdHN0cmFwLXN0eWxlJyldLFxuICBbJ2RlZmF1bHQtc3R5bGUnLCByZXF1aXJlKCcuL3BsdWdpbnMvZGVmYXVsdC1zdHlsZScpXVxuKTtcblxuLy8gQ3JlYXRlIHRoZSBkZWZhdWx0IGZvcm1hdGljIGluc3RhbmNlLlxuLy92YXIgZGVmYXVsdENvcmUgPSBGb3JtYXRpYygpO1xuXG4vLyBFeHBvcnQgaXQhXG4vL21vZHVsZS5leHBvcnRzID0gZGVmYXVsdEZvcm1hdGljO1xuXG52YXIgY3JlYXRlRm9ybWF0aWNDb21wb25lbnRDbGFzcyA9IGZ1bmN0aW9uIChjb25maWcpIHtcblxuICB2YXIgY29yZSA9IGNyZWF0ZUZvcm1hdGljQ29yZShjb25maWcpO1xuXG4gIHJldHVybiBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBkaXNwbGF5TmFtZTogJ0Zvcm1hdGljJyxcblxuICAgIHN0YXRpY3M6IHtcbiAgICAgIGNvbmZpZzogY3JlYXRlRm9ybWF0aWNDb21wb25lbnRDbGFzcyxcbiAgICAgIGZvcm06IGNvcmUsXG4gICAgICBwbHVnaW46IGNvcmUucGx1Z2luXG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGZvcm0gPSB0aGlzLnByb3BzLmZvcm0gfHwgdGhpcy5wcm9wcy5kZWZhdWx0Rm9ybTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGZvcm06IGZvcm0sXG4gICAgICAgIGZpZWxkOiBmb3JtLmZpZWxkKCksXG4gICAgICAgIGNvbnRyb2xsZWQ6IHRoaXMucHJvcHMuZm9ybSA/IHRydWUgOiBmYWxzZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGZvcm0gPSB0aGlzLnN0YXRlLmZvcm07XG4gICAgICBpZiAoIWZvcm0pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNdXN0IHN1cHBseSBhIGZvcm0gb3IgZGVmYXVsdEZvcm0uJyk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5zdGF0ZS5jb250cm9sbGVkKSB7XG4gICAgICAgIGZvcm0ub25jZSgnY2hhbmdlJywgdGhpcy5vbkZvcm1DaGFuZ2VkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvcm0ub24oJ2NoYW5nZScsIHRoaXMub25Gb3JtQ2hhbmdlZCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIG9uRm9ybUNoYW5nZWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4gICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UodGhpcy5wcm9wcy5mb3JtLnZhbCgpKTtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5zdGF0ZS5jb250cm9sbGVkKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIGZpZWxkOiB0aGlzLnN0YXRlLmZvcm0uZmllbGQoKVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBmb3JtID0gdGhpcy5zdGF0ZS5mb3JtO1xuICAgICAgaWYgKGZvcm0pIHtcbiAgICAgICAgZm9ybS5vZmYoJ2NoYW5nZScsIHRoaXMub25Gb3JtQ2hhbmdlZCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXh0UHJvcHMpIHtcbiAgICAgIGlmICh0aGlzLnN0YXRlLmNvbnRyb2xsZWQpIHtcbiAgICAgICAgaWYgKCFuZXh0UHJvcHMuZm9ybSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTXVzdCBzdXBwbHkgYSBuZXcgZm9ybSBmb3IgYSBjb250cm9sbGVkIGNvbXBvbmVudC4nKTtcbiAgICAgICAgfVxuICAgICAgICBuZXh0UHJvcHMuZm9ybS5vbmNlKCdjaGFuZ2UnLCB0aGlzLm9uRm9ybUNoYW5nZWQpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBmb3JtOiBuZXh0UHJvcHMuZm9ybSxcbiAgICAgICAgICBmaWVsZDogbmV4dFByb3BzLmZvcm0uZmllbGQoKVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogJ2Zvcm1hdGljJ30sXG4gICAgICAgIHRoaXMuc3RhdGUuZmllbGQuY29tcG9uZW50KClcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlRm9ybWF0aWNDb21wb25lbnRDbGFzcygpO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyAjIG1peGluLmNsaWNrLW91dHNpZGVcblxuLypcblRoZXJlJ3Mgbm8gbmF0aXZlIFJlYWN0IHdheSB0byBkZXRlY3QgY2xpY2tpbmcgb3V0c2lkZSBhbiBlbGVtZW50LiBTb21ldGltZXNcbnRoaXMgaXMgdXNlZnVsLCBzbyB0aGF0J3Mgd2hhdCB0aGlzIG1peGluIGRvZXMuIFRvIHVzZSBpdCwgbWl4IGl0IGluIGFuZCB1c2UgaXRcbmZyb20geW91ciBjb21wb25lbnQgbGlrZSB0aGlzOlxuXG5gYGBqc1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG4gIHBsdWdpbi5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgbWl4aW5zOiBbcGx1Z2luLnJlcXVpcmUoJ21peGluLmNsaWNrLW91dHNpZGUnKV0sXG5cbiAgICBvbkNsaWNrT3V0c2lkZTogZnVuY3Rpb24gKCkge1xuICAgICAgY29uc29sZS5sb2coJ2NsaWNrZWQgb3V0c2lkZSEnKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuc2V0T25DbGlja091dHNpZGUoJ215RGl2JywgdGhpcy5vbkNsaWNrT3V0c2lkZSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIFJlYWN0LkRPTS5kaXYoe3JlZjogJ215RGl2J30sXG4gICAgICAgICdIZWxsbyEnXG4gICAgICApXG4gICAgfVxuICB9KTtcbn07XG5gYGBcbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbnZhciBoYXNBbmNlc3RvciA9IGZ1bmN0aW9uIChjaGlsZCwgcGFyZW50KSB7XG4gIGlmIChjaGlsZC5wYXJlbnROb2RlID09PSBwYXJlbnQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBpZiAoY2hpbGQucGFyZW50Tm9kZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gaGFzQW5jZXN0b3IoY2hpbGQucGFyZW50Tm9kZSwgcGFyZW50KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0ge1xuXG4gICAgLy8gX29uQ2xpY2tEb2N1bWVudDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAvLyAgIGNvbnNvbGUubG9nKCdjbGljayBkb2MnKVxuICAgIC8vICAgaWYgKHRoaXMuX2RpZE1vdXNlRG93bikge1xuICAgIC8vICAgICBfLmVhY2godGhpcy5jbGlja091dHNpZGVIYW5kbGVycywgZnVuY3Rpb24gKGZ1bmNzLCByZWYpIHtcbiAgICAvLyAgICAgICBpZiAoaXNPdXRzaWRlKGV2ZW50LnRhcmdldCwgdGhpcy5yZWZzW3JlZl0uZ2V0RE9NTm9kZSgpKSkge1xuICAgIC8vICAgICAgICAgZnVuY3MuZm9yRWFjaChmdW5jdGlvbiAoZm4pIHtcbiAgICAvLyAgICAgICAgICAgZm4uY2FsbCh0aGlzKTtcbiAgICAvLyAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgLy8gICAgICAgfVxuICAgIC8vICAgICB9LmJpbmQodGhpcykpO1xuICAgIC8vICAgfVxuICAgIC8vIH0sXG5cbiAgICBpc05vZGVPdXRzaWRlOiBmdW5jdGlvbiAobm9kZU91dCwgbm9kZUluKSB7XG4gICAgICBpZiAobm9kZU91dCA9PT0gbm9kZUluKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmIChoYXNBbmNlc3Rvcihub2RlT3V0LCBub2RlSW4pKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cbiAgICBpc05vZGVJbnNpZGU6IGZ1bmN0aW9uIChub2RlSW4sIG5vZGVPdXQpIHtcbiAgICAgIHJldHVybiAhdGhpcy5pc05vZGVPdXRzaWRlKG5vZGVJbiwgbm9kZU91dCk7XG4gICAgfSxcblxuICAgIF9vbkNsaWNrTW91c2Vkb3duOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vdGhpcy5fZGlkTW91c2VEb3duID0gdHJ1ZTtcbiAgICAgIF8uZWFjaCh0aGlzLmNsaWNrT3V0c2lkZUhhbmRsZXJzLCBmdW5jdGlvbiAoZnVuY3MsIHJlZikge1xuICAgICAgICBpZiAodGhpcy5yZWZzW3JlZl0pIHtcbiAgICAgICAgICB0aGlzLl9tb3VzZWRvd25SZWZzW3JlZl0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0sXG5cbiAgICBfb25DbGlja01vdXNldXA6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgXy5lYWNoKHRoaXMuY2xpY2tPdXRzaWRlSGFuZGxlcnMsIGZ1bmN0aW9uIChmdW5jcywgcmVmKSB7XG4gICAgICAgIGlmICh0aGlzLnJlZnNbcmVmXSAmJiB0aGlzLl9tb3VzZWRvd25SZWZzW3JlZl0pIHtcbiAgICAgICAgICBpZiAodGhpcy5pc05vZGVPdXRzaWRlKGV2ZW50LnRhcmdldCwgdGhpcy5yZWZzW3JlZl0uZ2V0RE9NTm9kZSgpKSkge1xuICAgICAgICAgICAgZnVuY3MuZm9yRWFjaChmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICAgICAgZm4uY2FsbCh0aGlzLCBldmVudCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9tb3VzZWRvd25SZWZzW3JlZl0gPSBmYWxzZTtcbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSxcblxuICAgIC8vIF9vbkNsaWNrRG9jdW1lbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyAgIGNvbnNvbGUubG9nKCdjbGlja2V0eScpXG4gICAgLy8gICBfLmVhY2godGhpcy5jbGlja091dHNpZGVIYW5kbGVycywgZnVuY3Rpb24gKGZ1bmNzLCByZWYpIHtcbiAgICAvLyAgICAgY29uc29sZS5sb2coJ2NsaWNrZXR5JywgcmVmLCB0aGlzLnJlZnNbcmVmXSlcbiAgICAvLyAgIH0uYmluZCh0aGlzKSk7XG4gICAgLy8gfSxcblxuICAgIHNldE9uQ2xpY2tPdXRzaWRlOiBmdW5jdGlvbiAocmVmLCBmbikge1xuICAgICAgaWYgKCF0aGlzLmNsaWNrT3V0c2lkZUhhbmRsZXJzW3JlZl0pIHtcbiAgICAgICAgdGhpcy5jbGlja091dHNpZGVIYW5kbGVyc1tyZWZdID0gW107XG4gICAgICB9XG4gICAgICB0aGlzLmNsaWNrT3V0c2lkZUhhbmRsZXJzW3JlZl0ucHVzaChmbik7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmNsaWNrT3V0c2lkZUhhbmRsZXJzID0ge307XG4gICAgICB0aGlzLl9kaWRNb3VzZURvd24gPSBmYWxzZTtcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX29uQ2xpY2tNb3VzZWRvd24pO1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX29uQ2xpY2tNb3VzZXVwKTtcbiAgICAgIC8vZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkNsaWNrRG9jdW1lbnQpO1xuICAgICAgdGhpcy5fbW91c2Vkb3duUmVmcyA9IHt9O1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5jbGlja091dHNpZGVIYW5kbGVycyA9IHt9O1xuICAgICAgLy9kb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uQ2xpY2tEb2N1bWVudCk7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5fb25DbGlja01vdXNldXApO1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5fb25DbGlja01vdXNlZG93bik7XG4gICAgfVxuICB9O1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBtaXhpbi5maWVsZFxuXG4vKlxuV3JhcCB1cCB5b3VyIGZpZWxkcyB3aXRoIHRoaXMgbWl4aW4gdG8gZ2V0OlxuLSBBdXRvbWF0aWMgbWV0YWRhdGEgbG9hZGluZy5cbi0gQW55dGhpbmcgZWxzZSBkZWNpZGVkIGxhdGVyLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSB7XG5cbiAgICBsb2FkTmVlZGVkTWV0YTogZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICBpZiAocHJvcHMuZmllbGQgJiYgcHJvcHMuZmllbGQuZm9ybSkge1xuICAgICAgICBpZiAocHJvcHMuZmllbGQuZGVmLm5lZWRzTWV0YSAmJiBwcm9wcy5maWVsZC5kZWYubmVlZHNNZXRhLmxlbmd0aCA+IDApIHtcblxuICAgICAgICAgIHZhciBuZWVkc01ldGEgPSBbXTtcblxuICAgICAgICAgIHByb3BzLmZpZWxkLmRlZi5uZWVkc01ldGEuZm9yRWFjaChmdW5jdGlvbiAoYXJncykge1xuICAgICAgICAgICAgaWYgKF8uaXNBcnJheShhcmdzKSAmJiBhcmdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgaWYgKF8uaXNBcnJheShhcmdzWzBdKSkge1xuICAgICAgICAgICAgICAgIGFyZ3MuZm9yRWFjaChmdW5jdGlvbiAoYXJncykge1xuICAgICAgICAgICAgICAgICAgbmVlZHNNZXRhLnB1c2goYXJncyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbmVlZHNNZXRhLnB1c2goYXJncyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGlmIChuZWVkc01ldGEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAvLyBNdXN0IGp1c3QgYmUgYSBzaW5nbGUgbmVlZCwgYW5kIG5vdCBhbiBhcnJheS5cbiAgICAgICAgICAgIG5lZWRzTWV0YSA9IFtwcm9wcy5maWVsZC5kZWYubmVlZHNNZXRhXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBuZWVkc01ldGEuZm9yRWFjaChmdW5jdGlvbiAobmVlZHMpIHtcbiAgICAgICAgICAgIGlmIChuZWVkcykge1xuICAgICAgICAgICAgICBwcm9wcy5maWVsZC5mb3JtLmxvYWRNZXRhLmFwcGx5KHByb3BzLmZpZWxkLmZvcm0sIG5lZWRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5sb2FkTmVlZGVkTWV0YSh0aGlzLnByb3BzKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gKG5leHRQcm9wcykge1xuICAgICAgdGhpcy5sb2FkTmVlZGVkTWV0YShuZXh0UHJvcHMpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgLy8gUmVtb3ZpbmcgdGhpcyBhcyBpdCdzIGEgYmFkIGlkZWEsIGJlY2F1c2UgdW5tb3VudGluZyBhIGNvbXBvbmVudCBpcyBub3RcbiAgICAgIC8vIGFsd2F5cyBhIHNpZ25hbCB0byByZW1vdmUgdGhlIGZpZWxkLiBXaWxsIGhhdmUgdG8gZmluZCBhIGJldHRlciB3YXkuXG5cbiAgICAgIC8vIGlmICh0aGlzLnByb3BzLmZpZWxkKSB7XG4gICAgICAvLyAgIHRoaXMucHJvcHMuZmllbGQuZXJhc2UoKTtcbiAgICAgIC8vIH1cbiAgICB9XG4gIH07XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIvLyAjIG1peGluLmlucHV0LWFjdGlvbnNcblxuLypcbkN1cnJlbnRseSB1bnVzZWQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0ge1xuXG4gICAgb25Gb2N1czogZnVuY3Rpb24gKCkge1xuXG4gICAgfSxcblxuICAgIG9uQmx1cjogZnVuY3Rpb24gKCkge1xuXG4gICAgfSxcblxuICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICB9XG4gIH07XG59O1xuIiwiLy8gIyBtaXhpbi5yZXNpemVcblxuLypcbllvdSdkIHRoaW5rIGl0IHdvdWxkIGJlIHByZXR0eSBlYXN5IHRvIGRldGVjdCB3aGVuIGEgRE9NIGVsZW1lbnQgaXMgcmVzaXplZC5cbkFuZCB5b3UnZCBiZSB3cm9uZy4gVGhlcmUgYXJlIHZhcmlvdXMgdHJpY2tzLCBidXQgbm9uZSBvZiB0aGVtIHdvcmsgdmVyeSB3ZWxsLlxuU28sIHVzaW5nIGdvb2Qgb2wnIHBvbGxpbmcgaGVyZS4gVG8gdHJ5IHRvIGJlIGFzIGVmZmljaWVudCBhcyBwb3NzaWJsZSwgdGhlcmVcbmlzIG9ubHkgYSBzaW5nbGUgc2V0SW50ZXJ2YWwgdXNlZCBmb3IgYWxsIGVsZW1lbnRzLiBUbyB1c2U6XG5cbmBgYGpzXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgcGx1Z2luLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBtaXhpbnM6IFtwbHVnaW4ucmVxdWlyZSgnbWl4aW4ucmVzaXplJyldLFxuXG4gICAgb25SZXNpemU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdyZXNpemVkIScpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zZXRPblJlc2l6ZSgnbXlUZXh0JywgdGhpcy5vblJlc2l6ZSk7XG4gICAgfSxcblxuICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAuLi5cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gUmVhY3QuRE9NLnRleHRhcmVhKHtyZWY6ICdteVRleHQnLCB2YWx1ZTogdGhpcy5wcm9wcy52YWx1ZSwgb25DaGFuZ2U6IC4uLn0pXG4gICAgfVxuICB9KTtcbn07XG5gYGBcbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGlkID0gMDtcblxudmFyIHJlc2l6ZUludGVydmFsRWxlbWVudHMgPSB7fTtcbnZhciByZXNpemVJbnRlcnZhbEVsZW1lbnRzQ291bnQgPSAwO1xudmFyIHJlc2l6ZUludGVydmFsVGltZXIgPSBudWxsO1xuXG52YXIgY2hlY2tFbGVtZW50cyA9IGZ1bmN0aW9uICgpIHtcbiAgT2JqZWN0LmtleXMocmVzaXplSW50ZXJ2YWxFbGVtZW50cykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIGVsZW1lbnQgPSByZXNpemVJbnRlcnZhbEVsZW1lbnRzW2tleV07XG4gICAgaWYgKGVsZW1lbnQuY2xpZW50V2lkdGggIT09IGVsZW1lbnQuX19wcmV2Q2xpZW50V2lkdGggfHwgZWxlbWVudC5jbGllbnRIZWlnaHQgIT09IGVsZW1lbnQuX19wcmV2Q2xpZW50SGVpZ2h0KSB7XG4gICAgICBlbGVtZW50Ll9fcHJldkNsaWVudFdpZHRoID0gZWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICAgIGVsZW1lbnQuX19wcmV2Q2xpZW50SGVpZ2h0ID0gZWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgICB2YXIgaGFuZGxlcnMgPSBlbGVtZW50Ll9fcmVzaXplSGFuZGxlcnM7XG4gICAgICBoYW5kbGVycy5mb3JFYWNoKGZ1bmN0aW9uIChoYW5kbGVyKSB7XG4gICAgICAgIGhhbmRsZXIoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSwgMTAwKTtcbn07XG5cbnZhciBhZGRSZXNpemVJbnRlcnZhbEhhbmRsZXIgPSBmdW5jdGlvbiAoZWxlbWVudCwgZm4pIHtcbiAgaWYgKHJlc2l6ZUludGVydmFsVGltZXIgPT09IG51bGwpIHtcbiAgICByZXNpemVJbnRlcnZhbFRpbWVyID0gc2V0SW50ZXJ2YWwoY2hlY2tFbGVtZW50cywgMTAwKTtcbiAgfVxuICBpZiAoISgnX19yZXNpemVJZCcgaW4gZWxlbWVudCkpIHtcbiAgICBpZCsrO1xuICAgIGVsZW1lbnQuX19wcmV2Q2xpZW50V2lkdGggPSBlbGVtZW50LmNsaWVudFdpZHRoO1xuICAgIGVsZW1lbnQuX19wcmV2Q2xpZW50SGVpZ2h0ID0gZWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgZWxlbWVudC5fX3Jlc2l6ZUlkID0gaWQ7XG4gICAgcmVzaXplSW50ZXJ2YWxFbGVtZW50c0NvdW50Kys7XG4gICAgcmVzaXplSW50ZXJ2YWxFbGVtZW50c1tpZF0gPSBlbGVtZW50O1xuICAgIGVsZW1lbnQuX19yZXNpemVIYW5kbGVycyA9IFtdO1xuICB9XG4gIGVsZW1lbnQuX19yZXNpemVIYW5kbGVycy5wdXNoKGZuKTtcbn07XG5cbnZhciByZW1vdmVSZXNpemVJbnRlcnZhbEhhbmRsZXJzID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgaWYgKCEoJ19fcmVzaXplSWQnIGluIGVsZW1lbnQpKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBpZCA9IGVsZW1lbnQuX19yZXNpemVJZDtcbiAgZGVsZXRlIGVsZW1lbnQuX19yZXNpemVJZDtcbiAgZGVsZXRlIGVsZW1lbnQuX19yZXNpemVIYW5kbGVycztcbiAgZGVsZXRlIHJlc2l6ZUludGVydmFsRWxlbWVudHNbaWRdO1xuICByZXNpemVJbnRlcnZhbEVsZW1lbnRzQ291bnQtLTtcbiAgaWYgKHJlc2l6ZUludGVydmFsRWxlbWVudHNDb3VudCA8IDEpIHtcbiAgICBjbGVhckludGVydmFsKHJlc2l6ZUludGVydmFsVGltZXIpO1xuICAgIHJlc2l6ZUludGVydmFsVGltZXIgPSBudWxsO1xuICB9XG59O1xuXG52YXIgb25SZXNpemUgPSBmdW5jdGlvbiAocmVmLCBmbikge1xuICBmbihyZWYpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSB7XG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMub25SZXNpemVXaW5kb3cpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMub25SZXNpemVXaW5kb3cpO1xuICAgICAgfVxuICAgICAgdGhpcy5yZXNpemVFbGVtZW50UmVmcyA9IHt9O1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMub25SZXNpemVXaW5kb3cpIHtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMub25SZXNpemVXaW5kb3cpO1xuICAgICAgfVxuICAgICAgT2JqZWN0LmtleXModGhpcy5yZXNpemVFbGVtZW50UmVmcykuZm9yRWFjaChmdW5jdGlvbiAocmVmKSB7XG4gICAgICAgIHJlbW92ZVJlc2l6ZUludGVydmFsSGFuZGxlcnModGhpcy5yZWZzW3JlZl0uZ2V0RE9NTm9kZSgpKTtcbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSxcblxuICAgIHNldE9uUmVzaXplOiBmdW5jdGlvbiAocmVmLCBmbikge1xuICAgICAgaWYgKCF0aGlzLnJlc2l6ZUVsZW1lbnRSZWZzW3JlZl0pIHtcbiAgICAgICAgdGhpcy5yZXNpemVFbGVtZW50UmVmc1tyZWZdID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGFkZFJlc2l6ZUludGVydmFsSGFuZGxlcih0aGlzLnJlZnNbcmVmXS5nZXRET01Ob2RlKCksIG9uUmVzaXplLmJpbmQodGhpcywgcmVmLCBmbikpO1xuICAgIH1cbiAgfTtcbn07XG4iLCIvLyAjIG1peGluLnNjcm9sbFxuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzID0ge1xuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLm9uU2Nyb2xsV2luZG93KSB7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCB0aGlzLm9uU2Nyb2xsV2luZG93KTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLm9uU2Nyb2xsV2luZG93KSB7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCB0aGlzLm9uU2Nyb2xsV2luZG93KTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59O1xuIiwiLy8gIyBtaXhpbi51bmRvLXN0YWNrXG5cbi8qXG5HaXZlcyB5b3VyIGNvbXBvbmVudCBhbiB1bmRvIHN0YWNrLlxuKi9cblxuLy8gaHR0cDovL3Byb21ldGhldXNyZXNlYXJjaC5naXRodWIuaW8vcmVhY3QtZm9ybXMvZXhhbXBsZXMvdW5kby5odG1sXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFVuZG9TdGFjayA9IHtcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge3VuZG86IFtdLCByZWRvOiBbXX07XG4gIH0sXG5cbiAgc25hcHNob3Q6IGZ1bmN0aW9uKCkge1xuICAgIHZhciB1bmRvID0gdGhpcy5zdGF0ZS51bmRvLmNvbmNhdCh0aGlzLmdldFN0YXRlU25hcHNob3QoKSk7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnN0YXRlLnVuZG9EZXB0aCA9PT0gJ251bWJlcicpIHtcbiAgICAgIGlmICh1bmRvLmxlbmd0aCA+IHRoaXMuc3RhdGUudW5kb0RlcHRoKSB7XG4gICAgICAgIHVuZG8uc2hpZnQoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5zZXRTdGF0ZSh7dW5kbzogdW5kbywgcmVkbzogW119KTtcbiAgfSxcblxuICBoYXNVbmRvOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS51bmRvLmxlbmd0aCA+IDA7XG4gIH0sXG5cbiAgaGFzUmVkbzogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUucmVkby5sZW5ndGggPiAwO1xuICB9LFxuXG4gIHJlZG86IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3VuZG9JbXBsKHRydWUpO1xuICB9LFxuXG4gIHVuZG86IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3VuZG9JbXBsKCk7XG4gIH0sXG5cbiAgX3VuZG9JbXBsOiBmdW5jdGlvbihpc1JlZG8pIHtcbiAgICB2YXIgdW5kbyA9IHRoaXMuc3RhdGUudW5kby5zbGljZSgwKTtcbiAgICB2YXIgcmVkbyA9IHRoaXMuc3RhdGUucmVkby5zbGljZSgwKTtcbiAgICB2YXIgc25hcHNob3Q7XG5cbiAgICBpZiAoaXNSZWRvKSB7XG4gICAgICBpZiAocmVkby5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgc25hcHNob3QgPSByZWRvLnBvcCgpO1xuICAgICAgdW5kby5wdXNoKHRoaXMuZ2V0U3RhdGVTbmFwc2hvdCgpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHVuZG8ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHNuYXBzaG90ID0gdW5kby5wb3AoKTtcbiAgICAgIHJlZG8ucHVzaCh0aGlzLmdldFN0YXRlU25hcHNob3QoKSk7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZVNuYXBzaG90KHNuYXBzaG90KTtcbiAgICB0aGlzLnNldFN0YXRlKHt1bmRvOnVuZG8sIHJlZG86cmVkb30pO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgcGx1Z2luLmV4cG9ydHMgPSBVbmRvU3RhY2s7XG59O1xuIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBib290c3RyYXBcblxuLypcblRoZSBib290c3RyYXAgcGx1Z2luIGJ1bmRsZSBleHBvcnRzIGEgYnVuY2ggb2YgXCJwcm9wIG1vZGlmaWVyXCIgcGx1Z2lucyB3aGljaFxubWFuaXB1bGF0ZSB0aGUgcHJvcHMgZ29pbmcgaW50byBtYW55IG9mIHRoZSBjb21wb25lbnRzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxudmFyIG1vZGlmaWVycyA9IHtcblxuICAnZmllbGQnOiB7Y2xhc3NOYW1lOiAnZm9ybS1ncm91cCd9LFxuICAnaGVscCc6IHtjbGFzc05hbWU6ICdoZWxwLWJsb2NrJ30sXG4gICdzYW1wbGUnOiB7Y2xhc3NOYW1lOiAnaGVscC1ibG9jayd9LFxuICAndGV4dCc6IHtjbGFzc05hbWU6ICdmb3JtLWNvbnRyb2wnfSxcbiAgJ3RleHRhcmVhJzoge2NsYXNzTmFtZTogJ2Zvcm0tY29udHJvbCd9LFxuICAncHJldHR5LXRleHRhcmVhJzoge2NsYXNzTmFtZTogJ2Zvcm0tY29udHJvbCd9LFxuICAnanNvbic6IHtjbGFzc05hbWU6ICdmb3JtLWNvbnRyb2wnfSxcbiAgJ3NlbGVjdCc6IHtjbGFzc05hbWU6ICdmb3JtLWNvbnRyb2wnfSxcbiAgLy8nbGlzdCc6IHtjbGFzc05hbWU6ICd3ZWxsJ30sXG4gICdsaXN0LWNvbnRyb2wnOiB7Y2xhc3NOYW1lOiAnZm9ybS1pbmxpbmUnfSxcbiAgJ2xpc3QtaXRlbSc6IHtjbGFzc05hbWU6ICd3ZWxsJ30sXG4gICdpdGVtLWNob2ljZXMnOiB7Y2xhc3NOYW1lOiAnZm9ybS1jb250cm9sJ30sXG4gICdhZGQtaXRlbSc6IHtjbGFzc05hbWU6ICdnbHlwaGljb24gZ2x5cGhpY29uLXBsdXMnLCBsYWJlbDogJyd9LFxuICAncmVtb3ZlLWl0ZW0nOiB7Y2xhc3NOYW1lOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1yZW1vdmUnLCBsYWJlbDogJyd9LFxuICAnbW92ZS1pdGVtLWJhY2snOiB7Y2xhc3NOYW1lOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1hcnJvdy11cCcsIGxhYmVsOiAnJ30sXG4gICdtb3ZlLWl0ZW0tZm9yd2FyZCc6IHtjbGFzc05hbWU6ICdnbHlwaGljb24gZ2x5cGhpY29uLWFycm93LWRvd24nLCBsYWJlbDogJyd9XG59O1xuXG4vLyBCdWlsZCB0aGUgcGx1Z2luIGJ1bmRsZS5cbl8uZWFjaChtb2RpZmllcnMsIGZ1bmN0aW9uIChtb2RpZmllciwgbmFtZSkge1xuXG4gIGV4cG9ydHNbJ2NvbXBvbmVudC1wcm9wcy4nICsgbmFtZSArICcuYm9vdHN0cmFwJ10gPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgICB2YXIgdXRpbCA9IHBsdWdpbi5yZXF1aXJlKCd1dGlsJyk7XG5cbiAgICBwbHVnaW4uZXhwb3J0cyA9IFtcbiAgICAgIG5hbWUsXG4gICAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKG1vZGlmaWVyLmNsYXNzTmFtZSkpIHtcbiAgICAgICAgICBwcm9wcy5jbGFzc05hbWUgPSB1dGlsLmNsYXNzTmFtZShwcm9wcy5jbGFzc05hbWUsIG1vZGlmaWVyLmNsYXNzTmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKG1vZGlmaWVyLmxhYmVsKSkge1xuICAgICAgICAgIHByb3BzLmxhYmVsID0gbW9kaWZpZXIubGFiZWw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBdO1xuICB9O1xuXG59KTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBkZWZhdWx0LXN0eWxlXG5cbi8qXG5UaGUgZGVmYXVsdC1zdHlsZSBwbHVnaW4gYnVuZGxlIGV4cG9ydHMgYSBidW5jaCBvZiBcInByb3AgbW9kaWZpZXJcIiBwbHVnaW5zIHdoaWNoXG5tYW5pcHVsYXRlIHRoZSBwcm9wcyBnb2luZyBpbnRvIG1hbnkgb2YgdGhlIGNvbXBvbmVudHMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG52YXIgbW9kaWZpZXJzID0ge1xuXG4gICdmaWVsZCc6IHt9LFxuICAnaGVscCc6IHt9LFxuICAnc2FtcGxlJzoge30sXG4gICd0ZXh0Jzoge30sXG4gICd0ZXh0YXJlYSc6IHt9LFxuICAncHJldHR5LXRleHRhcmVhJzoge30sXG4gICdqc29uJzoge30sXG4gICdzZWxlY3QnOiB7fSxcbiAgJ2xpc3QnOiB7fSxcbiAgJ2xpc3QtY29udHJvbCc6IHt9LFxuICAnbGlzdC1pdGVtLWNvbnRyb2wnOiB7fSxcbiAgJ2xpc3QtaXRlbS12YWx1ZSc6IHt9LFxuICAnbGlzdC1pdGVtJzoge30sXG4gICdpdGVtLWNob2ljZXMnOiB7fSxcbiAgJ2FkZC1pdGVtJzoge30sXG4gICdyZW1vdmUtaXRlbSc6IHt9LFxuICAnbW92ZS1pdGVtLWJhY2snOiB7fSxcbiAgJ21vdmUtaXRlbS1mb3J3YXJkJzoge31cbn07XG5cbi8vIEJ1aWxkIHRoZSBwbHVnaW4gYnVuZGxlLlxuXy5lYWNoKG1vZGlmaWVycywgZnVuY3Rpb24gKG1vZGlmaWVyLCBuYW1lKSB7XG5cbiAgZXhwb3J0c1snY29tcG9uZW50LXByb3BzLicgKyBuYW1lICsgJy5kZWZhdWx0J10gPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgICB2YXIgdXRpbCA9IHBsdWdpbi5yZXF1aXJlKCd1dGlsJyk7XG5cbiAgICBwbHVnaW4uZXhwb3J0cyA9IFtcbiAgICAgIG5hbWUsXG4gICAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgcHJvcHMuY2xhc3NOYW1lID0gdXRpbC5jbGFzc05hbWUocHJvcHMuY2xhc3NOYW1lLCBuYW1lKTtcbiAgICAgIH1cbiAgICBdO1xuICB9O1xuXG59KTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyBzdG9yZS5tZW1vcnlcblxuLypcblRoZSBtZW1vcnkgc3RvcmUgcGx1Z2luIGtlZXBzIHRoZSBzdGF0ZSBvZiBmaWVsZHMsIGRhdGEsIGFuZCBtZXRhZGF0YS4gSXRcbnJlc3BvbmRzIHRvIGFjdGlvbnMgYW5kIGVtaXRzIGEgY2hhbmdlIGV2ZW50IGlmIHRoZXJlIGFyZSBhbnkgY2hhbmdlcy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHZhciBjb21waWxlciA9IHBsdWdpbi5yZXF1aXJlKCdjb21waWxlcicpO1xuICB2YXIgdXRpbCA9IHBsdWdpbi5yZXF1aXJlKCd1dGlsJyk7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSBmdW5jdGlvbiAoZm9ybSwgZW1pdHRlciwgb3B0aW9ucykge1xuXG4gICAgdmFyIHN0b3JlID0ge307XG5cbiAgICBzdG9yZS5maWVsZHMgPSBbXTtcbiAgICBzdG9yZS50ZW1wbGF0ZU1hcCA9IHt9O1xuICAgIHN0b3JlLnZhbHVlID0ge307XG4gICAgc3RvcmUubWV0YSA9IHt9O1xuXG4gICAgLy8gSGVscGVyIHRvIHNldHVwIGZpZWxkcy4gRmllbGQgZGVmaW5pdGlvbnMgbmVlZCB0byBiZSBleHBhbmRlZCwgY29tcGlsZWQsXG4gICAgLy8gZXRjLlxuXG4gICAgdmFyIHNldHVwRmllbGRzID0gZnVuY3Rpb24gKGZpZWxkcykge1xuICAgICAgc3RvcmUuZmllbGRzID0gY29tcGlsZXIuZXhwYW5kRmllbGRzKGZpZWxkcyk7XG4gICAgICBzdG9yZS5maWVsZHMgPSBjb21waWxlci5jb21waWxlRmllbGRzKHN0b3JlLmZpZWxkcyk7XG4gICAgICBzdG9yZS50ZW1wbGF0ZU1hcCA9IGNvbXBpbGVyLnRlbXBsYXRlTWFwKHN0b3JlLmZpZWxkcyk7XG4gICAgICBzdG9yZS5maWVsZHMgPSBzdG9yZS5maWVsZHMuZmlsdGVyKGZ1bmN0aW9uIChkZWYpIHtcbiAgICAgICAgcmV0dXJuICFkZWYudGVtcGxhdGU7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgaWYgKG9wdGlvbnMuZmllbGRzKSB7XG4gICAgICBzZXR1cEZpZWxkcyhvcHRpb25zLmZpZWxkcyk7XG4gICAgfVxuXG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKG9wdGlvbnMudmFsdWUpKSB7XG4gICAgICBzdG9yZS52YWx1ZSA9IHV0aWwuY29weVZhbHVlKG9wdGlvbnMudmFsdWUpO1xuICAgIH1cblxuICAgIC8vIEN1cnJlbnRseSwganVzdCBhIHNpbmdsZSBldmVudCBmb3IgYW55IGNoYW5nZS5cbiAgICB2YXIgdXBkYXRlID0gZnVuY3Rpb24gKGNoYW5naW5nKSB7XG4gICAgICBlbWl0dGVyLmVtaXQoJ2NoYW5nZScsIHtcbiAgICAgICAgdmFsdWU6IHN0b3JlLnZhbHVlLFxuICAgICAgICBtZXRhOiBzdG9yZS5tZXRhLFxuICAgICAgICBmaWVsZHM6IHN0b3JlLmZpZWxkcyxcbiAgICAgICAgY2hhbmdpbmc6IGNoYW5naW5nXG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8gV2hlbiBmaWVsZHMgY2hhbmdlLCB3ZSBuZWVkIHRvIFwiaW5mbGF0ZVwiIHRoZW0sIG1lYW5pbmcgZXhwYW5kIHRoZW0gYW5kXG4gICAgLy8gcnVuIGFueSBldmFsdWF0aW9ucyBpbiBvcmRlciB0byBnZXQgdGhlIGRlZmF1bHQgdmFsdWUgb3V0LlxuICAgIHN0b3JlLmluZmxhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZmllbGQgPSBmb3JtLmZpZWxkKCk7XG4gICAgICBmaWVsZC5pbmZsYXRlKGZ1bmN0aW9uIChwYXRoLCB2YWx1ZSkge1xuICAgICAgICBzdG9yZS52YWx1ZSA9IHV0aWwuc2V0SW4oc3RvcmUudmFsdWUsIHBhdGgsIHZhbHVlKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICB2YXIgYWN0aW9ucyA9IHtcblxuICAgICAgLy8gU2V0IHZhbHVlIGF0IGEgcGF0aC5cbiAgICAgIHNldFZhbHVlOiBmdW5jdGlvbiAocGF0aCwgdmFsdWUpIHtcblxuICAgICAgICBpZiAoXy5pc1VuZGVmaW5lZCh2YWx1ZSkpIHtcbiAgICAgICAgICB2YWx1ZSA9IHBhdGg7XG4gICAgICAgICAgcGF0aCA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG9sZFZhbHVlID0gdXRpbC5nZXRJbihzdG9yZS52YWx1ZSwgcGF0aCk7XG5cbiAgICAgICAgaWYgKHBhdGgubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgc3RvcmUudmFsdWUgPSB1dGlsLmNvcHlWYWx1ZSh2YWx1ZSk7XG4gICAgICAgICAgc3RvcmUuaW5mbGF0ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0b3JlLnZhbHVlID0gdXRpbC5zZXRJbihzdG9yZS52YWx1ZSwgcGF0aCwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHVwZGF0ZSh7J3BhdGgnOiBwYXRoLCAnbmV3JzogdmFsdWUsICdvbGQnOiBvbGRWYWx1ZSwgJ2FjdGlvbic6ICdzZXQnfSk7XG4gICAgICB9LFxuXG4gICAgICAvLyBSZW1vdmUgYSB2YWx1ZSBhdCBhIHBhdGguXG4gICAgICByZW1vdmVWYWx1ZTogZnVuY3Rpb24gKHBhdGgpIHtcbiAgICAgICAgdmFyIG9sZFZhbHVlID0gdXRpbC5nZXRJbihzdG9yZS52YWx1ZSwgcGF0aCk7XG4gICAgICAgIHN0b3JlLnZhbHVlID0gdXRpbC5yZW1vdmVJbihzdG9yZS52YWx1ZSwgcGF0aCk7XG5cbiAgICAgICAgdXBkYXRlKHsncGF0aCc6IHBhdGgsICdvbGQnOiBvbGRWYWx1ZSwgJ2FjdGlvbic6ICdyZW1vdmUnfSk7XG4gICAgICB9LFxuXG4gICAgICAvLyBFcmFzZSBhIHZhbHVlLiBVc2VyIGFjdGlvbnMgY2FuIHJlbW92ZSB2YWx1ZXMsIGJ1dCBub2RlcyBjYW4gYWxzb1xuICAgICAgLy8gZGlzYXBwZWFyIGR1ZSB0byBjaGFuZ2luZyBldmFsdWF0aW9ucy4gVGhpcyBhY3Rpb24gb2NjdXJzIGF1dG9tYXRpY2FsbHlcbiAgICAgIC8vIChhbmQgbWF5IGJlIHVubmVjZXNzYXJ5IGlmIHRoZSB2YWx1ZSB3YXMgYWxyZWFkeSByZW1vdmVkKS5cbiAgICAgIGVyYXNlVmFsdWU6IGZ1bmN0aW9uIChwYXRoKSB7XG5cbiAgICAgICAgc3RvcmUudmFsdWUgPSB1dGlsLnJlbW92ZUluKHN0b3JlLnZhbHVlLCBwYXRoKTtcblxuICAgICAgICB1cGRhdGUoe30pO1xuICAgICAgfSxcblxuICAgICAgLy8gQXBwZW5kIGEgdmFsdWUgdG8gYW4gYXJyYXkgYXQgYSBwYXRoLlxuICAgICAgYXBwZW5kVmFsdWU6IGZ1bmN0aW9uIChwYXRoLCB2YWx1ZSkge1xuICAgICAgICB2YXIgb2xkVmFsdWUgPSB1dGlsLmdldEluKHN0b3JlLnZhbHVlLCBwYXRoKTtcbiAgICAgICAgc3RvcmUudmFsdWUgPSB1dGlsLmFwcGVuZEluKHN0b3JlLnZhbHVlLCBwYXRoLCB2YWx1ZSk7XG5cbiAgICAgICAgdXBkYXRlKHsncGF0aCc6IHBhdGgsICduZXcnOiB2YWx1ZSwgJ29sZCc6IG9sZFZhbHVlLCAnYWN0aW9uJzogJ2FwcGVuZCd9KTtcbiAgICAgIH0sXG5cbiAgICAgIC8vIFN3YXAgdmFsdWVzIG9mIHR3byBrZXlzLlxuICAgICAgbW92ZVZhbHVlOiBmdW5jdGlvbiAocGF0aCwgZnJvbUtleSwgdG9LZXkpIHtcbiAgICAgICAgdmFyIG9sZFZhbHVlID0gdXRpbC5nZXRJbihzdG9yZS52YWx1ZSwgcGF0aCk7XG4gICAgICAgIHN0b3JlLnZhbHVlID0gdXRpbC5tb3ZlSW4oc3RvcmUudmFsdWUsIHBhdGgsIGZyb21LZXksIHRvS2V5KTtcblxuICAgICAgICB1cGRhdGUoeydwYXRoJzogcGF0aCwgJ25ldyc6IG9sZFZhbHVlLCAnb2xkJzogb2xkVmFsdWUsICdmcm9tS2V5JzogZnJvbUtleSwgJ3RvS2V5JzogdG9LZXksICdhY3Rpb24nOiAnbW92ZSd9KTtcbiAgICAgIH0sXG5cbiAgICAgIC8vIENoYW5nZSBhbGwgdGhlIGZpZWxkcy5cbiAgICAgIHNldEZpZWxkczogZnVuY3Rpb24gKGZpZWxkcykge1xuICAgICAgICBzZXR1cEZpZWxkcyhmaWVsZHMpO1xuICAgICAgICBzdG9yZS5pbmZsYXRlKCk7XG5cbiAgICAgICAgdXBkYXRlKHsnYWN0aW9uJzogJ3NldEZpZWxkcyd9KTtcbiAgICAgIH0sXG5cbiAgICAgIC8vIFNldCBhIG1ldGFkYXRhIHZhbHVlIGZvciBhIGtleS5cbiAgICAgIHNldE1ldGE6IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICAgIHN0b3JlLm1ldGFba2V5XSA9IHZhbHVlO1xuICAgICAgICB1cGRhdGUoeydhY3Rpb24nOiAnc2V0TWV0YSd9KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgXy5leHRlbmQoc3RvcmUsIGFjdGlvbnMpO1xuXG4gICAgcmV0dXJuIHN0b3JlO1xuICB9O1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8gIyB0eXBlLmFycmF5XG5cbi8qXG5TdXBwb3J0IGFycmF5IHR5cGUgd2hlcmUgY2hpbGQgZmllbGRzIGFyZSBkeW5hbWljYWxseSBkZXRlcm1pbmVkIGJhc2VkIG9uIHRoZVxudmFsdWVzIG9mIHRoZSBhcnJheS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzLmRlZmF1bHQgPSBbXTtcblxuICBwbHVnaW4uZXhwb3J0cy5maWVsZHMgPSBmdW5jdGlvbiAoZmllbGQpIHtcblxuICAgIGlmIChfLmlzQXJyYXkoZmllbGQudmFsdWUpKSB7XG4gICAgICByZXR1cm4gZmllbGQudmFsdWUubWFwKGZ1bmN0aW9uICh2YWx1ZSwgaSkge1xuICAgICAgICB2YXIgaXRlbSA9IGZpZWxkLml0ZW1Gb3JWYWx1ZSh2YWx1ZSk7XG4gICAgICAgIGl0ZW0ua2V5ID0gaTtcbiAgICAgICAgcmV0dXJuIGZpZWxkLmNyZWF0ZUNoaWxkKGl0ZW0pO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gIH07XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIvLyAjIHR5cGUuYm9vbGVhblxuXG4vKlxuU3VwcG9ydCBhIHRydWUvZmFsc2UgdmFsdWUuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzLmRlZmF1bHQgPSBmYWxzZTtcblxuICBwbHVnaW4uZXhwb3J0cy5jb21waWxlID0gZnVuY3Rpb24gKGRlZikge1xuICAgIGlmICghZGVmLmNob2ljZXMpIHtcbiAgICAgIGRlZi5jaG9pY2VzID0gW1xuICAgICAgICB7dmFsdWU6IHRydWUsIGxhYmVsOiAnWWVzJ30sXG4gICAgICAgIHt2YWx1ZTogZmFsc2UsIGxhYmVsOiAnTm8nfVxuICAgICAgXTtcbiAgICB9XG4gIH07XG59O1xuIiwiLy8gIyB0eXBlLmpzb25cblxuLypcbkFyYml0cmFyeSBKU09OIHZhbHVlLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cy5kZWZhdWx0ID0gbnVsbDtcblxufTtcbiIsIi8vICMgdHlwZS5udW1iZXJcblxuLypcblN1cHBvcnQgbnVtYmVyIHZhbHVlcywgb2YgY291cnNlLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cy5kZWZhdWx0ID0gMDtcblxufTtcbiIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vICMgdHlwZS5vYmplY3RcblxuLypcblN1cHBvcnQgZm9yIG9iamVjdCB0eXBlcy4gT2JqZWN0IGZpZWxkcyBjYW4gc3VwcGx5IHN0YXRpYyBjaGlsZCBmaWVsZHMsIG9yIGlmXG50aGVyZSBhcmUgYWRkaXRpb25hbCBjaGlsZCBrZXlzLCBkeW5hbWljIGNoaWxkIGZpZWxkcyB3aWxsIGJlIGNyZWF0ZWQgbXVjaFxubGlrZSBhbiBhcnJheS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHZhciB1dGlsID0gcGx1Z2luLnJlcXVpcmUoJ3V0aWwnKTtcblxuICBwbHVnaW4uZXhwb3J0cy5kZWZhdWx0ID0ge307XG5cbiAgcGx1Z2luLmV4cG9ydHMuZmllbGRzID0gZnVuY3Rpb24gKGZpZWxkKSB7XG5cbiAgICB2YXIgZmllbGRzID0gW107XG4gICAgdmFyIHZhbHVlID0gZmllbGQudmFsdWU7XG4gICAgdmFyIHVudXNlZEtleXMgPSBfLmtleXModmFsdWUpO1xuXG4gICAgaWYgKGZpZWxkLmRlZi5maWVsZHMpIHtcblxuICAgICAgZmllbGRzID0gZmllbGQuZGVmLmZpZWxkcy5tYXAoZnVuY3Rpb24gKGRlZikge1xuICAgICAgICB2YXIgY2hpbGQgPSBmaWVsZC5jcmVhdGVDaGlsZChkZWYpO1xuICAgICAgICBpZiAoIXV0aWwuaXNCbGFuayhjaGlsZC5kZWYua2V5KSkge1xuICAgICAgICAgIHVudXNlZEtleXMgPSBfLndpdGhvdXQodW51c2VkS2V5cywgY2hpbGQuZGVmLmtleSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNoaWxkO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHVudXNlZEtleXMubGVuZ3RoID4gMCkge1xuICAgICAgdW51c2VkS2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgdmFyIGl0ZW0gPSBmaWVsZC5pdGVtRm9yVmFsdWUodmFsdWVba2V5XSk7XG4gICAgICAgIGl0ZW0ubGFiZWwgPSB1dGlsLmh1bWFuaXplKGtleSk7XG4gICAgICAgIGl0ZW0ua2V5ID0ga2V5O1xuICAgICAgICBmaWVsZHMucHVzaChmaWVsZC5jcmVhdGVDaGlsZChpdGVtKSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmllbGRzO1xuICB9O1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiLy8gIyB0eXBlLnJvb3RcblxuLypcblNwZWNpYWwgdHlwZSByZXByZXNlbnRpbmcgdGhlIHJvb3Qgb2YgdGhlIGZvcm0uIEdldHMgdGhlIGZpZWxkcyBkaXJlY3RseSBmcm9tXG50aGUgc3RvcmUuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzLmZpZWxkcyA9IGZ1bmN0aW9uIChmaWVsZCkge1xuXG4gICAgcmV0dXJuIGZpZWxkLmZvcm0uc3RvcmUuZmllbGRzLm1hcChmdW5jdGlvbiAoZGVmKSB7XG4gICAgICByZXR1cm4gZmllbGQuY3JlYXRlQ2hpbGQoZGVmKTtcbiAgICB9KTtcblxuICB9O1xufTtcbiIsIi8vICMgdHlwZS5zdHJpbmdcblxuLypcblN1cHBvcnQgc3RyaW5nIHZhbHVlcywgb2YgY291cnNlLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cy5kZWZhdWx0ID0gJyc7XG5cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogUmVwcmVzZW50YXRpb24gb2YgYSBzaW5nbGUgRXZlbnRFbWl0dGVyIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEV2ZW50IGhhbmRsZXIgdG8gYmUgY2FsbGVkLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBDb250ZXh0IGZvciBmdW5jdGlvbiBleGVjdXRpb24uXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG9uY2UgT25seSBlbWl0IG9uY2VcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBFRShmbiwgY29udGV4dCwgb25jZSkge1xuICB0aGlzLmZuID0gZm47XG4gIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG4gIHRoaXMub25jZSA9IG9uY2UgfHwgZmFsc2U7XG59XG5cbi8qKlxuICogTWluaW1hbCBFdmVudEVtaXR0ZXIgaW50ZXJmYWNlIHRoYXQgaXMgbW9sZGVkIGFnYWluc3QgdGhlIE5vZGUuanNcbiAqIEV2ZW50RW1pdHRlciBpbnRlcmZhY2UuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAYXBpIHB1YmxpY1xuICovXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7IC8qIE5vdGhpbmcgdG8gc2V0ICovIH1cblxuLyoqXG4gKiBIb2xkcyB0aGUgYXNzaWduZWQgRXZlbnRFbWl0dGVycyBieSBuYW1lLlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKiBAcHJpdmF0ZVxuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5cbi8qKlxuICogUmV0dXJuIGEgbGlzdCBvZiBhc3NpZ25lZCBldmVudCBsaXN0ZW5lcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudHMgdGhhdCBzaG91bGQgYmUgbGlzdGVkLlxuICogQHJldHVybnMge0FycmF5fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbiBsaXN0ZW5lcnMoZXZlbnQpIHtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1tldmVudF0pIHJldHVybiBbXTtcblxuICBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMuX2V2ZW50c1tldmVudF0ubGVuZ3RoLCBlZSA9IFtdOyBpIDwgbDsgaSsrKSB7XG4gICAgZWUucHVzaCh0aGlzLl9ldmVudHNbZXZlbnRdW2ldLmZuKTtcbiAgfVxuXG4gIHJldHVybiBlZTtcbn07XG5cbi8qKlxuICogRW1pdCBhbiBldmVudCB0byBhbGwgcmVnaXN0ZXJlZCBldmVudCBsaXN0ZW5lcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBuYW1lIG9mIHRoZSBldmVudC5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBJbmRpY2F0aW9uIGlmIHdlJ3ZlIGVtaXR0ZWQgYW4gZXZlbnQuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiBlbWl0KGV2ZW50LCBhMSwgYTIsIGEzLCBhNCwgYTUpIHtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1tldmVudF0pIHJldHVybiBmYWxzZTtcblxuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW2V2ZW50XVxuICAgICwgbGVuZ3RoID0gbGlzdGVuZXJzLmxlbmd0aFxuICAgICwgbGVuID0gYXJndW1lbnRzLmxlbmd0aFxuICAgICwgZWUgPSBsaXN0ZW5lcnNbMF1cbiAgICAsIGFyZ3NcbiAgICAsIGksIGo7XG5cbiAgaWYgKDEgPT09IGxlbmd0aCkge1xuICAgIGlmIChlZS5vbmNlKSB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBlZS5mbiwgdHJ1ZSk7XG5cbiAgICBzd2l0Y2ggKGxlbikge1xuICAgICAgY2FzZSAxOiByZXR1cm4gZWUuZm4uY2FsbChlZS5jb250ZXh0KSwgdHJ1ZTtcbiAgICAgIGNhc2UgMjogcmV0dXJuIGVlLmZuLmNhbGwoZWUuY29udGV4dCwgYTEpLCB0cnVlO1xuICAgICAgY2FzZSAzOiByZXR1cm4gZWUuZm4uY2FsbChlZS5jb250ZXh0LCBhMSwgYTIpLCB0cnVlO1xuICAgICAgY2FzZSA0OiByZXR1cm4gZWUuZm4uY2FsbChlZS5jb250ZXh0LCBhMSwgYTIsIGEzKSwgdHJ1ZTtcbiAgICAgIGNhc2UgNTogcmV0dXJuIGVlLmZuLmNhbGwoZWUuY29udGV4dCwgYTEsIGEyLCBhMywgYTQpLCB0cnVlO1xuICAgICAgY2FzZSA2OiByZXR1cm4gZWUuZm4uY2FsbChlZS5jb250ZXh0LCBhMSwgYTIsIGEzLCBhNCwgYTUpLCB0cnVlO1xuICAgIH1cblxuICAgIGZvciAoaSA9IDEsIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0xKTsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG5cbiAgICBlZS5mbi5hcHBseShlZS5jb250ZXh0LCBhcmdzKTtcbiAgfSBlbHNlIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChsaXN0ZW5lcnNbaV0ub25jZSkgdGhpcy5yZW1vdmVMaXN0ZW5lcihldmVudCwgbGlzdGVuZXJzW2ldLmZuLCB0cnVlKTtcblxuICAgICAgc3dpdGNoIChsZW4pIHtcbiAgICAgICAgY2FzZSAxOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCk7IGJyZWFrO1xuICAgICAgICBjYXNlIDI6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhMSk7IGJyZWFrO1xuICAgICAgICBjYXNlIDM6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhMSwgYTIpOyBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBpZiAoIWFyZ3MpIGZvciAoaiA9IDEsIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0xKTsgaiA8IGxlbjsgaisrKSB7XG4gICAgICAgICAgICBhcmdzW2ogLSAxXSA9IGFyZ3VtZW50c1tqXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsaXN0ZW5lcnNbaV0uZm4uYXBwbHkobGlzdGVuZXJzW2ldLmNvbnRleHQsIGFyZ3MpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuLyoqXG4gKiBSZWdpc3RlciBhIG5ldyBFdmVudExpc3RlbmVyIGZvciB0aGUgZ2l2ZW4gZXZlbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IE5hbWUgb2YgdGhlIGV2ZW50LlxuICogQHBhcmFtIHtGdW5jdG9ufSBmbiBDYWxsYmFjayBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgVGhlIGNvbnRleHQgb2YgdGhlIGZ1bmN0aW9uLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIG9uKGV2ZW50LCBmbiwgY29udGV4dCkge1xuICBpZiAoIXRoaXMuX2V2ZW50cykgdGhpcy5fZXZlbnRzID0ge307XG4gIGlmICghdGhpcy5fZXZlbnRzW2V2ZW50XSkgdGhpcy5fZXZlbnRzW2V2ZW50XSA9IFtdO1xuICB0aGlzLl9ldmVudHNbZXZlbnRdLnB1c2gobmV3IEVFKCBmbiwgY29udGV4dCB8fCB0aGlzICkpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBZGQgYW4gRXZlbnRMaXN0ZW5lciB0aGF0J3Mgb25seSBjYWxsZWQgb25jZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgTmFtZSBvZiB0aGUgZXZlbnQuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBDYWxsYmFjayBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgVGhlIGNvbnRleHQgb2YgdGhlIGZ1bmN0aW9uLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24gb25jZShldmVudCwgZm4sIGNvbnRleHQpIHtcbiAgaWYgKCF0aGlzLl9ldmVudHMpIHRoaXMuX2V2ZW50cyA9IHt9O1xuICBpZiAoIXRoaXMuX2V2ZW50c1tldmVudF0pIHRoaXMuX2V2ZW50c1tldmVudF0gPSBbXTtcbiAgdGhpcy5fZXZlbnRzW2V2ZW50XS5wdXNoKG5ldyBFRShmbiwgY29udGV4dCB8fCB0aGlzLCB0cnVlICkpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgZXZlbnQgbGlzdGVuZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgd2Ugd2FudCB0byByZW1vdmUuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgbGlzdGVuZXIgdGhhdCB3ZSBuZWVkIHRvIGZpbmQuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG9uY2UgT25seSByZW1vdmUgb25jZSBsaXN0ZW5lcnMuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGZuLCBvbmNlKSB7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbZXZlbnRdKSByZXR1cm4gdGhpcztcblxuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW2V2ZW50XVxuICAgICwgZXZlbnRzID0gW107XG5cbiAgaWYgKGZuKSBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gbGlzdGVuZXJzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGxpc3RlbmVyc1tpXS5mbiAhPT0gZm4gJiYgbGlzdGVuZXJzW2ldLm9uY2UgIT09IG9uY2UpIHtcbiAgICAgIGV2ZW50cy5wdXNoKGxpc3RlbmVyc1tpXSk7XG4gICAgfVxuICB9XG5cbiAgLy9cbiAgLy8gUmVzZXQgdGhlIGFycmF5LCBvciByZW1vdmUgaXQgY29tcGxldGVseSBpZiB3ZSBoYXZlIG5vIG1vcmUgbGlzdGVuZXJzLlxuICAvL1xuICBpZiAoZXZlbnRzLmxlbmd0aCkgdGhpcy5fZXZlbnRzW2V2ZW50XSA9IGV2ZW50cztcbiAgZWxzZSB0aGlzLl9ldmVudHNbZXZlbnRdID0gbnVsbDtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGFsbCBsaXN0ZW5lcnMgb3Igb25seSB0aGUgbGlzdGVuZXJzIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgd2FudCB0byByZW1vdmUgYWxsIGxpc3RlbmVycyBmb3IuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uIHJlbW92ZUFsbExpc3RlbmVycyhldmVudCkge1xuICBpZiAoIXRoaXMuX2V2ZW50cykgcmV0dXJuIHRoaXM7XG5cbiAgaWYgKGV2ZW50KSB0aGlzLl9ldmVudHNbZXZlbnRdID0gbnVsbDtcbiAgZWxzZSB0aGlzLl9ldmVudHMgPSB7fTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vXG4vLyBBbGlhcyBtZXRob2RzIG5hbWVzIGJlY2F1c2UgcGVvcGxlIHJvbGwgbGlrZSB0aGF0LlxuLy9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub2ZmID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lcjtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uO1xuXG4vL1xuLy8gVGhpcyBmdW5jdGlvbiBkb2Vzbid0IGFwcGx5IGFueW1vcmUuXG4vL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbiBzZXRNYXhMaXN0ZW5lcnMoKSB7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLy9cbi8vIEV4cG9zZSB0aGUgbW9kdWxlLlxuLy9cbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyMiA9IEV2ZW50RW1pdHRlcjtcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIzID0gRXZlbnRFbWl0dGVyO1xuXG5pZiAoJ29iamVjdCcgPT09IHR5cGVvZiBtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL2Zvcm1hdGljJyk7XG4iXX0=
