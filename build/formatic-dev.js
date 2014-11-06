require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = require('./lib/formatic');

},{"./lib/formatic":43}],2:[function(require,module,exports){
(function (global){
'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = function (plugin) {

  plugin.exports.compile = function (def) {
    if (def.choices) {

      var choices = def.choices;

      if (_.isString(choices)) {
        choices = choices.split(',');
      }

      if (!_.isArray(choices) && _.isObject(choices)) {
        choices = Object.keys(choices).map(function (key) {
          return {
            value: key,
            label: choices[key]
          };
        });
      }

      choices = choices.slice(0);

      choices.forEach(function (choice, i) {
        if (_.isString(choice)) {
          choices[i] = {
            value: choice,
            label: choice
          };
        }
      });

      def.choices = choices;
    }
  };
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(require,module,exports){
'use strict';

module.exports = function (plugin) {

  plugin.exports.compile = function (def) {
    if (def.lookup) {
      if (!def.eval) {
        def.eval = {};
      }
      if (!def.eval.needsMeta) {
        def.eval.needsMeta = [];
      }
      var keys = def.lookup.keys || [];
      var metaKeys = keys.map(function (key) {
        return ['@get', key];
      });
      metaKeys = [def.lookup.source].concat(metaKeys);
      var metaGet = ['@getMeta'].concat(metaKeys);
      def.eval.needsMeta.push(['@if', metaGet, null, metaKeys]);
      def.eval.choices = metaGet;
      delete def.lookup;
    }
  };
};

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
(function (global){
'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = function (plugin) {

  var typeCoerce = {
    unicode: function (def) {
      def.type = 'string';
      def.maxRows = 1;
    },
    text: 'string',
    select: function (def) {
      def.choices = def.choices || [];
    },
    bool: 'boolean'
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
},{}],6:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports.component = React.createClass({

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
},{}],7:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports.component = React.createClass({

    mixins: [require('./mixins/field')],

    getDefaultProps: function () {
      return {
        className: plugin.config.className
      };
    },

    onChange: function () {
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

      var value = field.value || [];

      return plugin.component('field')({
        field: field
      },
        R.div({className: this.props.className, ref: 'choices'},
          choices.map(function (choice, i) {
            return R.span({key: i, className: 'field-choice'},
              R.span({style: {whiteSpace: 'nowrap'}},
                R.input({
                  name: field.def.key,
                  type: 'checkbox',
                  value: choice.value,
                  checked: value.indexOf(choice.value) >= 0 ? true : false,
                  onChange: this.onChange
                  //onFocus: this.props.actions.focus
                }),
                R.span({className: 'field-choice-label'},
                  choice.label
                )
              ),
              ' '
            );
          }.bind(this))
        )
      );
    }
  });
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixins/field":20}],8:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports.component = React.createClass({

    getDefaultProps: function () {
      return {
        className: plugin.config.className
      };
    },

    render: function () {

      var field = this.props.field;

      return R.div({className: this.props.className, style: {display: (field.hidden() ? 'none' : '')}},
        plugin.component('label')({field: field, index: this.props.index}),
        React.addons.CSSTransitionGroup({transitionName: 'reveal'},
          field.collapsed ? [] : [
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
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports.component = React.createClass({

    mixins: [require('./mixins/field')],

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
          field.fields().map(function (field) {
            return field.component();
          }.bind(this))
        )
      );
    }
  });
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixins/field":20}],10:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var Reflux = require('reflux');

module.exports = function (plugin) {

  plugin.exports.component = React.createClass({

    mixins: [Reflux.ListenerMixin],

    getInitialState: function () {
      return {
        field: this.props.form.field()
      };
    },

    componentDidMount: function() {
      var form = this.props.form;
      this.listenTo(form.store, this.onFormChanged);
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
},{"reflux":62}],11:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports.component = React.createClass({

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
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports.component = React.createClass({

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
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports.component = React.createClass({

    mixins: [require('./mixins/field')],

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
},{"./mixins/field":20}],14:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports.component = React.createClass({

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
        // if (this.state.collapsable) {
        //   text = R.a({href: 'JavaScript' + ':', onClick: this.props.onClickLabel || this.onClickLabel}, text);
        // }
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
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports.component = React.createClass({

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
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports.component = React.createClass({

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
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports.component = React.createClass({

    getDefaultProps: function () {
      return {
        className: plugin.config.className
      };
    },
    //
    // getInitialState: function () {
    //   return {
    //     maybeDelete: false
    //   };
    // },
    //
    // onDelete: function () {
    //   var parent = this.props.field.parent;
    //   if (this.props.onDelete) {
    //     this.props.onDelete(this.props.field.index);
    //   }
    //   this.props.form.actions.delete(parent, this.props.field.index);
    // },
    //
    // onMoveUp: function () {
    //   var parent = this.props.field.parent;
    //   if (this.props.onMove) {
    //     this.props.onMove(this.props.field.index, this.props.field.index - 1);
    //   }
    //   this.props.form.actions.move(parent, this.props.field.index, this.props.field.index - 1);
    // },
    //
    // onMoveDown: function () {
    //   var parent = this.props.field.parent;
    //   if (this.props.onMove) {
    //     this.props.onMove(this.props.field.index, this.props.field.index + 1);
    //   }
    //   this.props.form.actions.move(parent, this.props.field.index, this.props.field.index + 1);
    // },
    //
    // onMouseOver: function () {
    //   this.setState({
    //     maybeDelete: true
    //   });
    // },
    //
    // onMouseOut: function () {
    //   this.setState({
    //     maybeDelete: false
    //   });
    // },

    render: function () {
      var field = this.props.field;

      return R.div({className: this.props.className},
        plugin.component('field')({
          field: field,
          index: this.props.index
        },
          field.component()
        )
      );
    }
  });
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],18:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports.component = React.createClass({

    getDefaultProps: function () {
      return {
        className: plugin.config.className
      };
    },
    //
    // getInitialState: function () {
    //   return {
    //     maybeDelete: false
    //   };
    // },
    //
    // onDelete: function () {
    //   var parent = this.props.field.parent;
    //   if (this.props.onDelete) {
    //     this.props.onDelete(this.props.field.index);
    //   }
    //   this.props.form.actions.delete(parent, this.props.field.index);
    // },
    //
    // onMoveUp: function () {
    //   var parent = this.props.field.parent;
    //   if (this.props.onMove) {
    //     this.props.onMove(this.props.field.index, this.props.field.index - 1);
    //   }
    //   this.props.form.actions.move(parent, this.props.field.index, this.props.field.index - 1);
    // },
    //
    // onMoveDown: function () {
    //   var parent = this.props.field.parent;
    //   if (this.props.onMove) {
    //     this.props.onMove(this.props.field.index, this.props.field.index + 1);
    //   }
    //   this.props.form.actions.move(parent, this.props.field.index, this.props.field.index + 1);
    // },
    //
    // onMouseOver: function () {
    //   this.setState({
    //     maybeDelete: true
    //   });
    // },
    //
    // onMouseOut: function () {
    //   this.setState({
    //     maybeDelete: false
    //   });
    // },

    render: function () {
      var field = this.props.field;

      //var parent = this.props.parent;
      //var item = field.field;
      //var form = this.props.form;

      //var className = formatic.className('list-item', plugin.config.className, field.className);

      // var valueClassName = formatic.className('object-value', plugin.config.value_className, field.value_className);
      // var controlClassName = formatic.className('list-control', plugin.config.control_className, field.control_className);
      // var removeClassName = formatic.className('list-control-remove', plugin.config.removeButton_className, field.removeButton_className);
      // var upClassName = formatic.className('list-control-up', plugin.config.upButton_className, field.upButton_className);
      // var downClassName = formatic.className('list-control-down', plugin.config.downButton_className, field.downButton_className);
      //
      // var removeLabel = plugin.configValue('removeButton_label', '[remove]');
      // var upLabel = plugin.configValue('upButton_label', '[up]');
      // var downLabel = plugin.configValue('downButton_label', '[down]');
      return R.div({className: this.props.className},
        plugin.component('list-item-value')({form: this.props.form, field: field, index: this.props.index}),
        plugin.component('list-item-control')({field: field, index: this.props.index, numItems: this.props.numItems, onMove: this.props.onMove, onRemove: this.props.onRemove})
        //,
        // R.div({className: controlClassName},
        //   R.span({className: removeClassName, onMouseOver: this.onMouseOver, onMouseOut: this.onMouseOut, onClick: this.onDelete}, removeLabel),
        //   this.props.field.index > 0 ? R.span({className: upClassName, onClick: this.onMoveUp}, upLabel) : null,
        //   this.props.field.index < (this.props.field.numItems - 1) ? R.span({className: downClassName, onClick: this.onMoveDown}, downLabel) : null
        // )
      );
    }
  });
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],19:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports.component = React.createClass({

    mixins: [require('./mixins/field')],

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
    //   var field = this.props.field;
    //   var item = null;
    //   if (this.refs.typeSelect) {
    //     var index = parseInt(this.refs.typeSelect.getDOMNode().value);
    //     item = field.itemTypes[index].item;
    //   }
    //   this.props.form.actions.insert(this.props.field, null, item);
    //   if (this.props.field.collapsableItems) {
    //     // var collapsed = this.props.field.fields.map(function () {
    //     //   return true;
    //     // }.bind(this));
    //     var collapsed = this.state.collapsed;
    //     collapsed = collapsed.concat(false);
    //     this.setState({
    //       collapsed: collapsed
    //     });
    //   }
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
},{"./mixins/field":20}],20:[function(require,module,exports){
'use strict';

module.exports = {

  loadNeededMeta: function (props) {
    if (props.field && props.field.form) {
      if (props.field.def.needsMeta && props.field.def.needsMeta.length > 0) {
        props.field.def.needsMeta.forEach(function (keys) {
          if (keys) {
            props.field.form.loadMeta(keys);
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
    if (this.props.field) {
      this.props.field.erase();
    }
  }
};

},{}],21:[function(require,module,exports){
'use strict';

module.exports = {

  componentDidMount: function () {
    if (this.onResizeWindow) {
      window.addEventListener('resize', this.onResizeWindow);
    }
  },

  componentWillUnmount: function () {
    if (this.onResizeWindow) {
      window.removeEventListener('resize', this.onResizeWindow);
    }
  }
};

},{}],22:[function(require,module,exports){
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

module.exports = UndoStack;

},{}],23:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports.component = React.createClass({

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
},{}],24:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports.component = React.createClass({

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
},{}],25:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var Resizable = require('react-component-resizable');

var noBreak = function (value) {
  return value.replace(/ /g, '\u00a0');
};

var LEFT_PAD = '\u00a0\u00a0';
var RIGHT_PAD = '\u00a0\u00a0';

module.exports = function (plugin) {

  var util = plugin.require('util');

  plugin.exports.component = React.createClass({

    mixins: [require('./mixins/undo-stack'), require('./mixins/resize')],

    getDefaultProps: function () {
      return {
        className: plugin.config.className
      };
    },

    getInitialState: function () {
      var value = this.props.field.value || '';
      var parts = util.parseTextWithTags(value);
      var tokens = this.tokens(parts);
      var indexMap = this.indexMap(tokens);

      return {
        tokens: tokens,
        indexMap: indexMap,
        value: value,
        plainValue: this.plainValue(value),
        pos: indexMap.length,
        range: 0,
        undoDepth: 100
      };
    },

    getStateSnapshot: function () {
      return {
        value: this.state.value,
        pos: this.state.pos
      };
    },

    setStateSnapshot: function (snapshot) {
      this.props.field.val(snapshot.value);
      this.setState({
        pos: snapshot.pos
      });
    },

    componentWillReceiveProps: function (props) {
      var value = props.field.value || '';
      var parts = util.parseTextWithTags(value);
      var tokens = this.tokens(parts);
      var indexMap = this.indexMap(tokens);

      this.setState({
        value: value,
        plainValue: this.plainValue(value),
        tokens: tokens,
        indexMap: indexMap
      });
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
      tokens = tokens || this.state.tokens;
      indexMap = indexMap || this.state.indexMap;
      if (pos < 0) {
        pos = 0;
      } else if (pos >= indexMap.length) {
        return tokens.length;
      }
      return indexMap[pos];
    },

    onChange: function (event) {

      //console.log('change');
      //console.log(event);

      var node = this.refs.content.getDOMNode();

      var prevPos = this.state.pos;
      var prevRange = this.state.range;
      var pos = node.selectionStart;

      var tokens = this.state.tokens;
      var realPrevIndex = this.tokenIndex(prevPos);
      var realPrevEndIndex = this.tokenIndex(prevPos + prevRange);
      var realPrevRange = realPrevEndIndex - realPrevIndex;

      //console.log(prevPos + ',' + prevRange + ',' + pos);
      //console.log(realPrevIndex + ',' + realPrevEndIndex + ',' + realPrevRange);
      //console.log(node.value);

      if (realPrevRange > 0) {
        tokens.splice(realPrevIndex, realPrevRange);
      }

      if (pos > prevPos) {
        var addedText = node.value.substring(prevPos, pos);
        tokens.splice(realPrevIndex, 0, addedText);
      } else if ((node.value.length + 1) === this.state.plainValue.length) {
        var token = this.tokenAt(pos);
        var tokenBefore = this.tokenBefore(pos);
        if (token === tokenBefore) {
          pos = this.moveOffTag(pos, tokens, this.indexMap(tokens), -1);
        }
        tokens.splice(realPrevIndex - 1, 1);
        node.setSelectionRange(pos, pos);
      }

      var rawValue = this.rawValue(tokens);

      this.props.field.val(rawValue);

      this.snapshot();

      this.setState({
        range: 0,
        pos: pos
      });
    },
    //
    componentDidUpdate: function () {
      if (document.activeElement === this.refs.content.getDOMNode()) {
      //   this.refs.content.getDOMNode().setSelectionRange(this.state.pos, this.state.pos + this.state.range);
        this.refs.content.getDOMNode().setSelectionRange(this.state.pos, this.state.pos + this.state.range);
      }
    },

    prettyLabel: function (key) {
      if (this.props.field.def.replaceTags[key]) {
        return this.props.field.def.replaceTags[key];
      }
      return util.humanize(key);
    },

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
          return R.span({className: 'pretty-part'},
            R.span({className: 'pretty-part-left'}, LEFT_PAD),
            R.span({className: 'pretty-part-text'}, noBreak(this.prettyLabel(part.value))),
            R.span({className: 'pretty-part-right'}, RIGHT_PAD)
          );
        }
      }.bind(this));
    },

    rawValue: function (tokens) {
      return tokens.map(function (token) {
        if (token.type === 'tag') {
          return '{{' + token.value + '}}';
        } else {
          return token;
        }
      }).join('');
    },

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

    tokenAt: function (pos) {
      if (pos >= this.state.indexMap.length) {
        return null;
      }
      if (pos < 0) {
        pos = 0;
      }
      return this.state.tokens[this.state.indexMap[pos]];
    },

    tokenBefore: function (pos) {
      if (pos >= this.state.indexMap.length) {
        pos = this.state.indexMap.length;
      }
      if (pos <= 0) {
        return null;
      }
      return this.state.tokens[this.state.indexMap[pos - 1]];
    },

    normalizePosition: function (pos, selectDir) {
      // At start or end, so okay.
      if (pos <= 0 || pos >= this.state.indexMap.length) {
        if (pos < 0) {
          pos = 0;
        }
        if (pos > this.state.indexMap.length) {
          pos = this.state.indexMap.length;
        }
        return pos;
      }

      var token = this.tokenAt(pos);
      var tokenBefore = this.tokenBefore(pos);

      // Between two tokens, so okay.
      if (token !== tokenBefore) {
        return pos;
      }

      var prevToken = this.tokenAt(this.state.pos);
      var prevTokenBefore = this.tokenBefore(this.state.pos);

      var rightPos = this.moveOffTag(pos, this.state.tokens, this.state.indexMap);
      var leftPos = this.moveOffTag(pos, this.state.tokens, this.state.indexMap, -1);

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
      if (typeof selectDir === 'undefined' || selectDir === -1) {
        if (rightPos - pos > pos - leftPos) {
          newPos = leftPos;
        }
      }
      return newPos;
    },

    onSelect: function () {
      //console.log('select');
      var node = this.refs.content.getDOMNode();

      var start = node.selectionStart;
      var pos = this.normalizePosition(start);


      var end = node.selectionEnd;
      var range = 0;
      //console.log(start + ',' + pos + ',' + end + ',' + range);
      //console.log(node.value);

      if (node.value !== this.state.value) {
        //console.log(node.value + ' != ' + this.state.value);
        return;
      }

      if (end > start) {
        var selectDir = 1;
        if (end === this.state.pos) {
          selectDir = -1;
        }
        //console.log(this.state.pos + ', selDir: ' + selectDir);
        var endPos = this.normalizePosition(end, selectDir);
        //console.log('endPos:' + endPos);
        if (endPos > pos) {
          range = endPos - pos;
        }
      }

      this.setState({
        pos: pos,
        range: range
      });
    },

    onCopy: function () {
      var node = this.refs.content.getDOMNode();
      var start = node.selectionStart;
      var end = node.selectionEnd;
      var text = node.value.substring(start, end);
      var realStartIndex = this.tokenIndex(start);
      var realEndIndex = this.tokenIndex(end);
      var tokens = this.state.tokens.slice(realStartIndex, realEndIndex);
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
      if (event.keyCode === 90 && (event.metaKey || event.ctrlKey) && !event.shiftKey) {
        event.preventDefault();
        this.undo();
      } else if (
        (event.keyCode === 89 && event.ctrlKey && !event.shiftKey) ||
        (event.keyCode === 90 && event.metaKey && event.shiftKey)
      ) {
        this.redo();
      }
    },

    adjustStyles: function () {
      var overlay = this.refs.highlight.getDOMNode();
      var content = this.refs.content.getDOMNode();
      overlay.style.cssText = document.defaultView.getComputedStyle(content, '').cssText;
      overlay.style.position = 'absolute';
    },

    onResize: function () {
      this.adjustStyles();
    },

    onResizeWindow: function () {
      this.adjustStyles();
    },

    componentDidMount: function () {
      this.adjustStyles();
    },

    render: function () {
      var field = this.props.field;
      return Resizable({}, R.div({style: {position: 'relative'}},

        R.div({
          className: 'pretty-highlight',
          ref: 'highlight',
          style: {
            position: 'absolute'
          }
        },
          this.prettyValue(this.state.value)
        ),

        R.textarea(_.extend({
          className: util.className(this.props.className, 'pretty-content'),
          ref: 'content',
          rows: 5,
          name: field.key,
          value: this.state.plainValue,
          onChange: this.onChange,
          onFocus: this.onFocus,
          onBlur: this.onBlur,
          onScroll: this.onScroll,
          style: {
            backgroundColor: 'rgba(0,0,0,0)',
            position: 'relative',
            top: 0,
            left: 0
          },
          onKeyPress: this.onKeyPress,
          onKeyDown: this.onKeyDown,
          onSelect: this.onSelect,
          onCopy: this.onCopy
        }, plugin.config.attributes))
      ));
    }
  });
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixins/resize":21,"./mixins/undo-stack":22,"react-component-resizable":52}],26:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports.component = React.createClass({

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
},{}],27:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = function (plugin) {

  var util = plugin.require('util');

  plugin.exports.component = React.createClass({

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
        field.fields().map(function (field) {
          return field.component();
        })
      );
    }
  });
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],28:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = function (plugin) {

  plugin.exports.component = React.createClass({

    mixins: [require('./mixins/field')],

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
},{"./mixins/field":20}],29:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports.component = React.createClass({

    mixins: [require('./mixins/field')],

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
},{"./mixins/field":20}],30:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = function (plugin) {

  plugin.exports.component = React.createClass({

    mixins: [require('./mixins/field')],

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
},{"./mixins/field":20}],31:[function(require,module,exports){
(function (global){
'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = function (plugin) {

  var router = plugin.require('field-router');
  var util = plugin.require('util');
  var evaluator = plugin.require('eval');
  var compiler = plugin.require('compiler');

  var Field = function (form, def, value, parent) {
    var field = this;

    field.form = form;
    field.def = def;
    field.value = value;
    field.parent = parent;
  };

  plugin.exports.field = function () {
    var form = this;

    return new Field(form, {
      type: 'root'
    }, form.store.value);
  };

  var proto = Field.prototype;

  proto.typePlugin = function () {
    var field = this;

    if (!field._typePlugin) {
      field._typePlugin = plugin.require('type.' + field.def.type);
    }

    return field._typePlugin;
  };

  proto.component = function () {
    var field = this;
    var component = router.componentForField(field);
    return component({
      field: field
    });
  };

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

  proto.evalDef = function (def) {
    var field = this;

    if (def.eval) {

      try {
        var extDef = field.eval(def.eval);
        if (extDef) {
          def = _.extend({}, def, extDef);
          def = compiler.compileDef(def);
        }
      } catch (e) {
        console.log('Problem in eval: ', JSON.stringify(def.eval));
        console.log(e.message);
      }
    }

    return def;
  };

  proto.eval = function (expression) {
    return evaluator.evaluate(expression, this);
  };

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

  proto.val = function (value) {
    var field = this;

    field.form.actions.setValue(field.valuePath(), value);
  };

  proto.remove = function (key) {
    var field = this;

    var path = field.valuePath().concat(key);

    field.form.actions.removeValue(path);
  };

  proto.move = function (fromKey, toKey) {
    var field = this;

    field.form.actions.moveValue(field.valuePath(), fromKey, toKey);
  };

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

  proto.hidden = function () {
    var field = this;

    return field.def.hidden || field.typePlugin().hidden;
  };

  // expand all fields and seed values if necessary
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

  // Called from unmount.
  proto.erase = function () {
    var field = this;
    if (!util.isBlank(field.def.key) && !_.isUndefined(field.value)) {
      field.form.actions.eraseValue(field.valuePath(), {});
    }
  };
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],32:[function(require,module,exports){
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

},{}],33:[function(require,module,exports){
(function (global){
'use strict';

var Reflux = require('reflux');
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = function (plugin) {

  var proto = plugin.exports;

  var storePlugin = plugin.require(plugin.config.store);
  var util = plugin.require('util');
  var loader = plugin.require('loader');

  var createSyncActions = function (names) {
    var actions = {};
    names.forEach(function (name) {
      actions[name] = Reflux.createAction({sync: true});
    });
    return actions;
  };

  proto.init = function (options) {
    var form = this;

    options = options || {};

    //form.actions = Reflux.createActions(['setValue', 'setFields', 'removeValue', 'appendValue', 'moveValue']);
    form.actions = createSyncActions(['setValue', 'setFields', 'removeValue', 'appendValue', 'moveValue', 'eraseValue', 'setMeta']);
    form.store = storePlugin.create(form.actions, form, options);
    form.store.inflate();

    form.contextifiers = {};
  };

  proto.component = function (props) {

    var form = this;

    props = _.extend({}, props, {
      form: form
    });

    var component = plugin.component('formatic');

    return component(props);
  };

  proto.val = function (value) {
    var form = this;

    if (!_.isUndefined(value)) {
      return form.actions.setValue(value);
    }

    return util.copyValue(form.store.value);
  };

  proto.fields = function (fields) {
    var form = this;

    form.actions.setFields(fields);
  };

  proto.findDef = function (key) {
    var form = this;

    return form.store.templateMap[key] || null;
  };

  proto.contextifier = function (key, contextify) {
    var form = this;

    form.contextifiers[key] = contextify;
  };

  proto.meta = function (key, value) {
    var form = this;

    if (!_.isUndefined(value)) {
      return form.actions.setMeta(key, value);
    }

    return form.store.meta[key];
  };

  proto.loadMeta = function (keys) {
    var validKeys = keys.filter(function (key) {
      return key;
    });
    if (validKeys.length < keys.length) {
      return;
    }
    loader.loadMeta(this, keys);
  };

  proto.source = loader.source;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"reflux":62}],34:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

module.exports = function (plugin) {

  var f = plugin.exports;

  var router = plugin.require('field-router');

  f.route = router.route;

  f.render = function (component, node) {

    React.renderComponent(component, node);
  };
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],35:[function(require,module,exports){
(function (global){
'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = function (plugin) {

  var compilerPlugins = plugin.requireAll(plugin.config.compilers);
  var util = plugin.require('util');

  var compiler = plugin.exports;

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

  compiler.expandFields = function (fields) {
    var templateMap = compiler.templateMap(fields);
    return fields.map(function (def) {
      return compiler.expandDef(def, templateMap);
    });
  };

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

  compiler.compileFields = function (fields) {
    return fields.map(function (field) {
      return compiler.compileDef(field);
    });
  };
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],36:[function(require,module,exports){
'use strict';

module.exports = function (plugin) {

  var propModifiers = {};

  var addPropModifier = function (name, modifyFn) {
    if (!propModifiers[name]) {
      propModifiers[name] = [];
    }
    propModifiers[name].push(modifyFn);
  };

  var propsPlugins = plugin.requireAll(plugin.config.props);

  propsPlugins.forEach(function (plugin) {
    addPropModifier.apply(null, plugin);
  });

  var componentFactories = {};

  plugin.exports.component = function (name) {

    if (!componentFactories[name]) {
      var component = plugin.require('component.' + name).component;
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

},{}],37:[function(require,module,exports){
(function (global){
'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = function (plugin) {

  plugin.exports = function (formatic) {

    var formaticPlugins = plugin.requireAll(plugin.config.formatic);
    var formPlugins = plugin.requireAll(plugin.config.form);

    formaticPlugins.forEach(function (f) {
      _.keys(f).forEach(function (key) {
        if (!_.isUndefined(formatic[key])) {
          throw new Error('Property already defined for formatic: ' + key);
        }
        formatic[key] = f[key];
      });
    });

    var Form = function (options) {
      if (this.init) {
        this.init(options);
      }
    };

    formatic.form = function (options) {
      return new Form(options);
    };

    Form.prototype = formatic.form;

    var inits = [];

    formPlugins.forEach(function (proto) {
      _.keys(proto).forEach(function (key) {
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

  //formatic.plugin('core.base');

  // formatic.filterPluginsInRegistry(function (plugin) {
  //   return plugin.name.indexOf('component.') === 0;
  // }).forEach(function (plugin) {
  //   formatic.plugin(plugin.name);
  // });
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],38:[function(require,module,exports){
(function (global){
'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = function (plugin) {

  var util = plugin.require('util');

  var functions = {};

  var isFunctionArray = function (array) {
    return array.length > 0 && array[0][0] === '@';
  };

  var evalFunction = function (fnArray, field) {
    var fnName = fnArray[0].substring(1);
    try {
      return functions[fnName](fnArray.slice(1), field);
    } catch (e) {
      if (!(fnName in functions)) {
        throw new Error('Eval function ' + fnName + ' not defined.');
      }
      throw e;
    }
  };

  var evaluate = function (expression, field) {
    if (_.isArray(expression)) {
      if (isFunctionArray(expression)) {
        return evalFunction(expression, field);
      } else {
        return expression.map(function (item) {
          return evaluate(item, field);
        });
      }
    } else if (_.isObject(expression)) {
      var obj = {};
      Object.keys(expression).forEach(function (key) {
        var result = evaluate(expression[key], field);
        if (typeof result !== 'undefined') {
          obj[key] = result;
        }
      });
      return obj;
    } else {
      return expression;
    }
  };

  functions.if = function (args, field) {
    return field.eval(args[0]) ? field.eval(args[1]) : field.eval(args[2]);
  };

  functions.eq = function (args, field) {
    return field.eval(args[0]) === field.eval(args[1]);
  };

  functions.not = function (args, field) {
    return !field.eval(args[0]);
  };

  functions.get = function (args, field) {
    var key = field.eval(args[0]);
    if (!_.isUndefined(field.value)) {
      if (key in field.value) {
        return field.value[key];
      }
    }
    if (field.parent) {
      return functions.get(args, field.parent);
    }
    return undefined;
  };

  functions.getMeta = function (args, field) {
    var keys = args.map(function (arg) {
      return field.eval(arg);
    });
    var key = util.joinMetaKeys(keys);
    return field.form.meta(key);
  };

  functions.sum = function (args, field) {
    var sum = 0;
    for (var i = 0; i < args.length; i++) {
      sum += field.eval(args[i]);
    }
    return sum;
  };

  plugin.exports.evaluate = evaluate;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],39:[function(require,module,exports){
(function (global){
'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = function (plugin) {

  var routes = {};

  var router = plugin.exports;

  var routePlugins = plugin.requireAll(plugin.config.routes);

  router.route = function (typeName, componentName, testFn) {
    if (!routes[typeName]) {
      routes[typeName] = [];
    }
    routes[typeName].push({
      component: componentName,
      test: testFn
    });
  };

  routePlugins.forEach(function (routePlugin) {

    router.route.apply(router, routePlugin);
  });

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

  router.component = function (name) {
    return plugin.component(name);
  };
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],40:[function(require,module,exports){
(function (global){
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
      return field.def.replaceTags;
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
  ]

};

// Build a plugin bundle.
_.each(routes, function (route, name) {
  module.exports['field-route.' + name] = function (plugin) {
    plugin.exports = route;
  };
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],41:[function(require,module,exports){
(function (global){
'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = function (plugin) {

  var util = plugin.require('util');

  var loader = plugin.exports;

  var isLoading = {};
  var sources = {};

  // loader.pushNeedsKey = function (key) {
  //   if (this._needsKeys.indexOf(key) < 0) {
  //     this._needsKeys.push(key);
  //   }
  // };
  //
  // loader.nextNeedsKey = function () {
  //   return this._needsKeys.shift();
  // };

  // loader.loadNeededMetadata = function (form) {
  //
  //   var key = loader.nextNeedsKey();
  //
  //   while (key) {
  //     if (!isLoading[key]) {
  //       isLoading[key] = true;
  //       loader.loadAsyncFromSource(form, key);
  //     }
  //     key = loader.nextNeedsKey();
  //   }
  // };

  loader.loadMeta = function (form, keys) {
    loader.loadAsyncFromSource(form, util.joinMetaKeys(keys));
  };

  loader.loadAsyncFromSource = function (form, key, waitTime) {
    setTimeout(function () {
      loader.loadFromSource(form, key);
    }, waitTime || 0);
  };

  loader.loadFromSource = function (form, key) {

    var source = loader.bestSource(form, key);
    if (source) {
      var args = util.splitMetaKey(key);
      args = args.slice(source.staticArgs.length);

      var result = source.fn.apply(null, args);

      if (result) {
        if (result.then) {
          var promise = result.then(function (result) {
            form.meta(key, result);
            isLoading[key] = false;
          });

          var onError = function () {
            isLoading[key] = false;
          };

          if (promise.catch) {
            promise.catch(onError);
          } else {
            // silly jQuery promises
            promise.fail(onError);
          }

        } else {
          setTimeout(function () {
            form.meta(key, result);
            isLoading[key] = false;
          }, 0);
        }
      } else {
        isLoading[key] = false;
      }

    } else {
      isLoading[key] = false;
    }
  };

  loader.bestSource = function (form, key) {
    if (sources[key]) {
      return {
        staticArgs: util.splitMetaKey(key),
        fn: sources[key]
      };
    } else {
      var args = util.splitMetaKey(key);
      if (args.length > 1) {
        args = args.slice(0, args.length - 1);
        return loader.bestSource(form, util.joinMetaKeys(args));
      } else if (sources.__default__) {
        return {
          staticArgs: [],
          fn: sources.__default__
        };
      } else {
        return null;
      }
    }
  };

  loader.source = function () {
    var args = _.toArray(arguments);

    if (args.length > 0 && _.isFunction(args[args.length - 1])) {
      var fn = args[args.length - 1];
      var sourceKey = '__default__';
      if (args.length > 1) {
        sourceKey = util.joinMetaKeys(args.slice(0, args.length - 1));
      }
      sources[sourceKey] = fn;
    }
  };

};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],42:[function(require,module,exports){
(function (global){
'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = function (plugin) {

  var util = plugin.exports;

  util.isBlank = function (value) {
    return value === undefined || value === null && value === '';
  };

  util.setIn = function (obj, path, value) {
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

  util.removeIn = function (obj, path) {
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

  util.getIn = function (obj, path) {
    if (path.length === 0) {
      return obj;
    }
    if (obj[path[0]]) {
      return util.getIn(obj[path[0]], path.slice(1));
    }
    return null;
  };

  util.appendIn = function (obj, path, value) {
    var subObj = util.getIn(obj, path);
    if (_.isArray(subObj)) {
      subObj.push(value);
    }
    return obj;
  };

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

  util.copyValue = function (value) {
    return JSON.parse(JSON.stringify(value));
  };

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

  util.itemMatchesValue = function (item, value) {
    var match = item.match;
    if (!match) {
      return true;
    }
    return _.every(_.keys(match), function (key) {
      return _.isEqual(match[key], value[key]);
    });
  };

  util.fieldDefFromValue = function (value) {
    var def = {
      type: 'json'
    };
    if (_.isString(value)) {
      def = {
        type: 'string'
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

  util.humanize = function(property) {
    property = property.replace(/\{\{/g, '');
    property = property.replace(/\}\}/g, '');
    return property.replace(/_/g, ' ')
      .replace(/(\w+)/g, function(match) {
        return match.charAt(0).toUpperCase() + match.slice(1);
      });
  };

  util.className = function () {

    var classNames = Array.prototype.slice.call(arguments, 0);

    classNames = classNames.filter(function (name) {
      return name;
    });

    return classNames.join(' ');
  };

  util.joinMetaKeys = function (keys) {
    return keys.join('::');
  };

  util.splitMetaKey = function (key) {
    return key.split('::');
  };

  var textPart = function (value, type) {
    type = type || 'text';
    return {
      type: type,
      value: value
    };
  };

  util.parseTextWithTags = function (value) {
    value = value || '';
    var parts = value.split('{{');
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

};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],43:[function(require,module,exports){
(function (global){
'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

var pluginRegistry = {};

var registerPlugin = function (name, pluginFactory) {

  if (pluginRegistry[name]) {
    throw new Error('Plugin ' + name + ' is already registered.');
  }

  if (_.isArray(pluginFactory)) {
    pluginRegistry[name] = [];
    pluginFactory.forEach(function (pluginSpec) {
      registerPlugin(pluginSpec.name, pluginSpec.plugin);
      pluginRegistry[name].push(pluginSpec.name);
    });
  } else if (_.isObject(pluginFactory) && !_.isFunction(pluginFactory)) {
    var bundleName = name;
    pluginRegistry[bundleName] = [];
    Object.keys(pluginFactory).forEach(function (name) {
      registerPlugin(name, pluginFactory[name]);
      pluginRegistry[bundleName].push(name);
    });
  } else {
    pluginRegistry[name] = pluginFactory;
  }
};

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
  }
};

var Formatic = function (config) {

  config = _.extend({}, config);

  _.keys(defaultPluginConfig).forEach(function (key) {
    config[key] = _.extend({}, defaultPluginConfig[key], config[key]);
  });

  var formatic, Plugin;

  var pluginCache = {};

  // Plugin

  Plugin = function (config) {
    if (!(this instanceof Plugin)) {
      return new Plugin(config);
    }
    this.exports = {};
    this.config = config || {};
  };

  Plugin.prototype.configValue = function (key, defaultValue) {

    if (typeof this.config[key] !== 'undefined') {
      return this.config[key];
    }
    return defaultValue || '';
  };

  Plugin.prototype.require = function (name) {
    return formatic.plugin(name);
  };

  var componentPlugin;

  // Just here in case we want to dynamically choose component later.
  Plugin.prototype.component = function (name) {
    return componentPlugin.component(name);
  };

  Plugin.prototype.hasPlugin = function (name) {
    return (name in pluginCache) || (name in pluginRegistry);
  };

  Plugin.prototype.hasComponent = function (name) {
    return this.hasPlugin('component.' + name);
  };

  Plugin.prototype.requireAll = function (pluginList) {
    if (!pluginList) {
      pluginList = [];
    }
    if (!_.isArray(pluginList)) {
      pluginList = [pluginList];
    }
    // Inflate registered bundles.
    pluginList = pluginList.map(function (plugin) {
      if (_.isString(plugin)) {
        if (_.isArray(pluginRegistry[plugin])) {
          return pluginRegistry[plugin];
        }
      }
      return plugin;
    });
    // Flatten bundles.
    pluginList = _.flatten(pluginList);
    return pluginList.map(function (plugin) {
      return this.require(plugin);
    }.bind(this));
  };

  var loadPlugin = function (name, pluginConfig) {
    var plugin;

    if (_.isFunction(name)) {

      var factory = name;

      if (_.isUndefined(factory.__exports__)) {
        plugin = Plugin(pluginConfig || {});
        factory(plugin);
        factory.__exports__ = plugin.exports;
      }

      return factory.__exports__;

    } else if (_.isUndefined(pluginCache[name])) {

      if (!pluginConfig && config[name]) {
        if (config[name].plugin) {
          return loadPlugin(config[name].plugin, config[name] || {});
        }
      }

      if (pluginRegistry[name]) {
        if (_.isFunction(pluginRegistry[name])) {
          plugin = Plugin(pluginConfig || config[name]);
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

  formatic = function (options) {
    return formatic.form(options);
  };

  formatic.register = function (name, pluginFactory) {
    registerPlugin(name, pluginFactory);
    return formatic;
  };

  formatic.plugin = function (name) {
    return loadPlugin(name);
  };

  formatic.create = Formatic;

  var core = loadPlugin('core');

  core(formatic);

  // Binding the component plugin late so it can load plugins after core is
  // loaded.
  componentPlugin = loadPlugin('component');

  return formatic;
};

var registerPlugins = function () {
  var arg = _.toArray(arguments);
  arg.forEach(function (arg) {
    var name = arg[0];
    var plugin = arg[1];
    registerPlugin(name, plugin);
  });
};

registerPlugins(
  ['core', require('./default/core')],

  ['core.formatic', require('./core/formatic')],
  ['core.form-init', require('./core/form-init')],
  ['core.form', require('./core/form')],
  ['core.field', require('./core/field')],

  ['util', require('./default/util')],
  ['compiler', require('./default/compiler')],
  ['eval', require('./default/eval')],
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

  ['component', require('./default/component')],

  ['component.formatic', require('./components/formatic')],
  ['component.root', require('./components/root')],
  ['component.field', require('./components/field')],
  ['component.label', require('./components/label')],
  ['component.help', require('./components/help')],
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

  ['bootstrap', require('./plugins/bootstrap')]
);

var defaultFormatic = Formatic();

module.exports = defaultFormatic;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./compilers/choices":2,"./compilers/lookup":3,"./compilers/prop-aliases":4,"./compilers/types":5,"./components/add-item":6,"./components/checkbox-list":7,"./components/field":8,"./components/fieldset":9,"./components/formatic":10,"./components/help":11,"./components/item-choices":12,"./components/json":13,"./components/label":14,"./components/list":19,"./components/list-control":15,"./components/list-item":18,"./components/list-item-control":16,"./components/list-item-value":17,"./components/move-item-back":23,"./components/move-item-forward":24,"./components/pretty-textarea":25,"./components/remove-item":26,"./components/root":27,"./components/select":28,"./components/text":29,"./components/textarea":30,"./core/field":31,"./core/form":33,"./core/form-init":32,"./core/formatic":34,"./default/compiler":35,"./default/component":36,"./default/core":37,"./default/eval":38,"./default/field-router":39,"./default/field-routes":40,"./default/loader":41,"./default/util":42,"./plugins/bootstrap":44,"./store/memory":45,"./types/array":46,"./types/boolean":47,"./types/json":48,"./types/object":49,"./types/root":50,"./types/string":51}],44:[function(require,module,exports){
(function (global){
'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

var modifiers = {

  'field': {className: 'form-group'},
  'help': {className: 'help-block'},
  'text': {className: 'form-control'},
  'textarea': {className: 'form-control'},
  'pretty-textarea': {className: 'form-control'},
  'json': {className: 'form-control'},
  'select': {className: 'form-control'},
  'list': {className: 'well'},
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

//formatic.config('component.formatic..attributes', {role: 'form'});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],45:[function(require,module,exports){
(function (global){
'use strict';

var Reflux = require('reflux');
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = function (plugin) {

  var compiler = plugin.require('compiler');
  var util = plugin.require('util');

  plugin.exports.create = function (actions, form, options) {

    return Reflux.createStore({

      init: function () {
        var store = this;

        store.fields = [];
        store.templateMap = {};
        if (options.fields) {
          store.fields = compiler.expandFields(options.fields);
          store.fields = compiler.compileFields(store.fields);
          store.templateMap = compiler.templateMap(store.fields);
          store.fields = store.fields.filter(function (def) {
            return !def.template;
          });
        }
        if (!_.isUndefined(options.value)) {
          store.value = util.copyValue(options.value);
        } else {
          store.value = {};
        }
        store.meta = {};
        store.listenToMany(actions);
      },

      inflate: function () {
        var store = this;

        var field = form.field();
        field.inflate(function (path, value) {
          store.value = util.setIn(store.value, path, value);
        });
      },

      setValue: function (path, value) {
        var store = this;

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
        store.update();
      },

      removeValue: function (path) {

        var store = this;

        store.value = util.removeIn(store.value, path);

        store.update();
      },

      // Happens when component is unmounted. Don't want to trigger update for
      // this.
      eraseValue: function (path) {

        var store = this;

        store.value = util.removeIn(store.value, path);
      },

      appendValue: function (path, value) {
        var store = this;

        store.value = util.appendIn(store.value, path, value);

        store.update();
      },

      moveValue: function (path, fromKey, toKey) {
        var store = this;

        store.value = util.moveIn(store.value, path, fromKey, toKey);

        store.update();
      },

      setFields: function (fields) {
        var store = this;

        store.fields = fields;
        store.inflate();

        store.update();
      },

      setMeta: function (key, value) {
        var store = this;

        store.meta[key] = value;
        store.update();
      },

      update: function () {
        this.trigger({
          value: this.value,
          meta: this.meta,
          fields: this.fields
        });
      }
    });
  };
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"reflux":62}],46:[function(require,module,exports){
(function (global){
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
},{}],47:[function(require,module,exports){
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

},{}],48:[function(require,module,exports){
'use strict';

module.exports = function (plugin) {

  plugin.exports.default = null;

};

},{}],49:[function(require,module,exports){
(function (global){
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
        item.key = key;
        fields.push(field.createChild(item));
      });
    }

    return fields;
  };
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],50:[function(require,module,exports){
'use strict';

module.exports = function (plugin) {

  plugin.exports.fields = function (field) {

    return field.form.store.fields.map(function (def) {
      return field.createChild(def);
    });

  };
};

},{}],51:[function(require,module,exports){
'use strict';

module.exports = function (plugin) {

  plugin.exports.default = '';

};

},{}],52:[function(require,module,exports){
module.exports = require('./src/component');

},{"./src/component":53}],53:[function(require,module,exports){
/**
 * @jsx React.DOM
 */

var React = require('react');

var Resizeable = React.createClass({
  propTypes: {
    triggersClass: React.PropTypes.string,
    expandClass: React.PropTypes.string,
    contractClass: React.PropTypes.string,
    embedCss: React.PropTypes.bool,
    onResize: React.PropTypes.func.isRequired
  },
  getDefaultProps: function () {
    return {
      triggersClass: 'resize-triggers',
      expandClass: 'expand-trigger',
      contractClass: 'contract-trigger',
      embedCss: true
    };
  },

  requestFrame: function (fn) {
    return (window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || function(fn){ return window.setTimeout(fn, 20); })(fn);
  },

  cancelFrame: function (id) {
    return (window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.clearTimeout)(id);
  },

  componentDidMount: function () {
    this.resetTriggers();
  },
  componentDidUpdate: function () {
    this.resetTriggers();
  },

  resetTriggers: function () {
    var contract = this.refs.contract.getDOMNode();
    var expandChild = this.refs.expandChild.getDOMNode();
    var expand = this.refs.expandChild.getDOMNode();

    contract.scrollLeft      = contract.scrollWidth;
    contract.scrollTop       = contract.scrollHeight;
    expandChild.style.width  = expand.offsetWidth + 1 + 'px';
    expandChild.style.height = expand.offsetHeight + 1 + 'px';
    expand.scrollLeft        = expand.scrollWidth;
    expand.scrollTop         = expand.scrollHeight;
  },

  checkTriggers: function () {
    var element = this.refs.resizable.getDOMNode();
    return element.offsetWidth != this.lastWidth || element.offsetHeight != this.lastHeight;
  },

  onScroll: function () {
    if (this.r) this.cancelFrame(this.r);
    this.r = this.requestFrame(function () {
      if (!this.checkTriggers())
        return;

      var el = this.refs.resizable.getDOMNode();

      this.lastWidth = el.offsetWidth;
      this.lastHeight = el.offsetHeight;

      this.props.onResize({
        width: this.lastWidth,
        height: this.lastHeight
      });

    }.bind(this));
  },

  render: function() {

    return this.transferPropsTo(
      React.DOM.div({onScroll: this.onScroll, ref: 'resizable'},
        [
          this.props.children,
          React.DOM.div({className: this.props.triggersClass},
            [
              React.DOM.div({className: this.props.expandClass, ref: 'expand'}, React.DOM.div({ref: 'expandChild'})),
              React.DOM.div({className: this.props.contractClass, ref: 'contract'})
            ]
          ),
          this.props.embedCss ? React.DOM.style({}, '.resize-triggers { visibility: hidden; } .resize-triggers, .resize-triggers > div, .contract-trigger:before { content: \" \"; display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; } .resize-triggers > div { background: #eee; overflow: auto; } .contract-trigger:before { width: 200%; height: 200%; }') : null
        ]
      )
    );
  }

});

module.exports = Resizeable;

},{"react":"react"}],54:[function(require,module,exports){
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

},{}],55:[function(require,module,exports){
exports.createdStores = [];

exports.createdActions = [];

exports.reset = function() {
    while(exports.createdStores.length) {
        exports.createdStores.pop();
    }
    while(exports.createdActions.length) {
        exports.createdActions.pop();
    }
};

},{}],56:[function(require,module,exports){
var _ = require('./utils'),
    maker = require('./joins').instanceJoinCreator;

/**
 * A module of methods related to listening.
 */
module.exports = {

    /**
     * An internal utility function used by `validateListening`
     *
     * @param {Action|Store} listenable The listenable we want to search for
     * @returns {Boolean} The result of a recursive search among `this.subscriptions`
     */
    hasListener: function(listenable) {
        var i = 0,
            listener;
        for (;i < (this.subscriptions||[]).length; ++i) {
            listener = this.subscriptions[i].listenable;
            if (listener === listenable || listener.hasListener && listener.hasListener(listenable)) {
                return true;
            }
        }
        return false;
    },

    /**
     * A convenience method that listens to all listenables in the given object.
     *
     * @param {Object} listenables An object of listenables. Keys will be used as callback method names.
     */
    listenToMany: function(listenables){
        for(var key in listenables){
            var cbname = _.callbackName(key),
                localname = this[cbname] ? cbname : this[key] ? key : undefined;
            if (localname){
                this.listenTo(listenables[key],localname,this[cbname+"Default"]||this[localname+"Default"]||localname);
            }
        }
    },

    /**
     * Checks if the current context can listen to the supplied listenable
     *
     * @param {Action|Store} listenable An Action or Store that should be
     *  listened to.
     * @returns {String|Undefined} An error message, or undefined if there was no problem.
     */
    validateListening: function(listenable){
        if (listenable === this) {
            return "Listener is not able to listen to itself";
        }
        if (!_.isFunction(listenable.listen)) {
            return listenable + " is missing a listen method";
        }
        if (listenable.hasListener && listenable.hasListener(this)) {
            return "Listener cannot listen to this listenable because of circular loop";
        }
    },

    /**
     * Sets up a subscription to the given listenable for the context object
     *
     * @param {Action|Store} listenable An Action or Store that should be
     *  listened to.
     * @param {Function|String} callback The callback to register as event handler
     * @param {Function|String} defaultCallback The callback to register as default handler
     * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is the object being listened to
     */
    listenTo: function(listenable, callback, defaultCallback) {
        var desub, unsubscriber, subscriptionobj, subs = this.subscriptions = this.subscriptions || [];
        _.throwIf(this.validateListening(listenable));
        this.fetchDefaultData(listenable, defaultCallback);
        desub = listenable.listen(this[callback]||callback, this);
        unsubscriber = function() {
            var index = subs.indexOf(subscriptionobj);
            _.throwIf(index === -1,'Tried to remove listen already gone from subscriptions list!');
            subs.splice(index, 1);
            desub();
        };
        subscriptionobj = {
            stop: unsubscriber,
            listenable: listenable
        };
        subs.push(subscriptionobj);
        return subscriptionobj;
    },

    /**
     * Stops listening to a single listenable
     *
     * @param {Action|Store} listenable The action or store we no longer want to listen to
     * @returns {Boolean} True if a subscription was found and removed, otherwise false.
     */
    stopListeningTo: function(listenable){
        var sub, i = 0, subs = this.subscriptions || [];
        for(;i < subs.length; i++){
            sub = subs[i];
            if (sub.listenable === listenable){
                sub.stop();
                _.throwIf(subs.indexOf(sub)!==-1,'Failed to remove listen from subscriptions list!');
                return true;
            }
        }
        return false;
    },

    /**
     * Stops all subscriptions and empties subscriptions array
     */
    stopListeningToAll: function(){
        var remaining, subs = this.subscriptions || [];
        while((remaining=subs.length)){
            subs[0].stop();
            _.throwIf(subs.length!==remaining-1,'Failed to remove listen from subscriptions list!');
        }
    },

    /**
     * Used in `listenTo`. Fetches initial data from a publisher if it has a `getDefaultData` method.
     * @param {Action|Store} listenable The publisher we want to get default data from
     * @param {Function|String} defaultCallback The method to receive the data
     */
    fetchDefaultData: function (listenable, defaultCallback) {
        defaultCallback = (defaultCallback && this[defaultCallback]) || defaultCallback;
        var me = this;
        if (_.isFunction(defaultCallback) && _.isFunction(listenable.getDefaultData)) {
            data = listenable.getDefaultData();
            if (data && _.isFunction(data.then)) {
                data.then(function() {
                    defaultCallback.apply(me, arguments);
                });
            } else {
                defaultCallback.call(this, data);
            }
        }
    },

    /**
     * The callback will be called once all listenables have triggered at least once.
     * It will be invoked with the last emission from each listenable.
     * @param {...Publishers} publishers Publishers that should be tracked.
     * @param {Function|String} callback The method to call when all publishers have emitted
     */
    joinTrailing: maker("last"),

    /**
     * The callback will be called once all listenables have triggered at least once.
     * It will be invoked with the first emission from each listenable.
     * @param {...Publishers} publishers Publishers that should be tracked.
     * @param {Function|String} callback The method to call when all publishers have emitted
     */
    joinLeading: maker("first"),

    /**
     * The callback will be called once all listenables have triggered at least once.
     * It will be invoked with all emission from each listenable.
     * @param {...Publishers} publishers Publishers that should be tracked.
     * @param {Function|String} callback The method to call when all publishers have emitted
     */
    joinConcat: maker("all"),

    /**
     * The callback will be called once all listenables have triggered.
     * If a callback triggers twice before that happens, an error is thrown.
     * @param {...Publishers} publishers Publishers that should be tracked.
     * @param {Function|String} callback The method to call when all publishers have emitted
     */
    joinStrict: maker("strict"),
};


},{"./joins":63,"./utils":66}],57:[function(require,module,exports){
var _ = require('./utils'),
    ListenerMethods = require('./ListenerMethods');

/**
 * A module meant to be consumed as a mixin by a React component. Supplies the methods from
 * `ListenerMethods` mixin and takes care of teardown of subscriptions.
 */
module.exports = _.extend({

    /**
     * Cleans up all listener previously registered.
     */
    componentWillUnmount: ListenerMethods.stopListeningToAll

}, ListenerMethods);

},{"./ListenerMethods":56,"./utils":66}],58:[function(require,module,exports){
var _ = require('./utils');

/**
 * A module of methods for object that you want to be able to listen to.
 * This module is consumed by `createStore` and `createAction`
 */
module.exports = {

    /**
     * Hook used by the publisher that is invoked before emitting
     * and before `shouldEmit`. The arguments are the ones that the action
     * is invoked with. If this function returns something other than
     * undefined, that will be passed on as arguments for shouldEmit and
     * emission.
     */
    preEmit: function() {},

    /**
     * Hook used by the publisher after `preEmit` to determine if the
     * event should be emitted with given arguments. This may be overridden
     * in your application, default implementation always returns true.
     *
     * @returns {Boolean} true if event should be emitted
     */
    shouldEmit: function() { return true; },

    /**
     * Subscribes the given callback for action triggered
     *
     * @param {Function} callback The callback to register as event handler
     * @param {Mixed} [optional] bindContext The context to bind the callback with
     * @returns {Function} Callback that unsubscribes the registered event handler
     */
    listen: function(callback, bindContext) {
        var eventHandler = function(args) {
            callback.apply(bindContext, args);
        }, me = this;
        this.emitter.addListener(this.eventLabel, eventHandler);
        return function() {
            me.emitter.removeListener(me.eventLabel, eventHandler);
        };
    },

    /**
     * Publishes an event using `this.emitter` (if `shouldEmit` agrees)
     */
    trigger: function() {
        var args = arguments,
            pre = this.preEmit.apply(this, args);
        args = pre === undefined ? args : _.isArguments(pre) ? pre : [].concat(pre);
        if (this.shouldEmit.apply(this, args)) {
            this.emitter.emit(this.eventLabel, args);
        }
    },

    /**
     * Tries to publish the event on the next tick
     */
    triggerAsync: function(){
        var args = arguments,me = this;
        _.nextTick(function() {
            me.trigger.apply(me, args);
        });
    }
};

},{"./utils":66}],59:[function(require,module,exports){
var Reflux = require('../src'),
    _ = require('./utils');

module.exports = function(listenable,key){
    return {
        componentDidMount: function(){
            for(var m in Reflux.ListenerMethods){
                if (this[m] !== Reflux.ListenerMethods[m]){
                    if (this[m]){
                        throw "Can't have other property '"+m+"' when using Reflux.listenTo!";
                    }
                    this[m] = Reflux.ListenerMethods[m];
                }
            }
            var me = this, cb = (key === undefined ? this.setState : function(v){me.setState(_.object([key],[v]));});
            this.listenTo(listenable,cb,cb);
        },
        componentWillUnmount: Reflux.ListenerMixin.componentWillUnmount
    };
};

},{"../src":62,"./utils":66}],60:[function(require,module,exports){
var _ = require('./utils'),
    Reflux = require('../src'),
    Keep = require('./Keep'),
    allowed = {preEmit:1,shouldEmit:1};

/**
 * Creates an action functor object. It is mixed in with functions
 * from the `PublisherMethods` mixin. `preEmit` and `shouldEmit` may
 * be overridden in the definition object.
 *
 * @param {Object} definition The action object definition
 */
module.exports = function(definition) {

    definition = definition || {};

    for(var d in definition){
        if (!allowed[d] && Reflux.PublisherMethods[d]) {
            throw new Error("Cannot override API method " + d +
                " in action creation. Use another method name or override it on Reflux.PublisherMethods instead."
            );
        }
    }

    var context = _.extend({
        eventLabel: "action",
        emitter: new _.EventEmitter(),
        _isAction: true
    },Reflux.PublisherMethods,definition);

    var functor = function() {
        functor[functor.sync?"trigger":"triggerAsync"].apply(functor, arguments);
    };

    _.extend(functor,context);

    Keep.createdActions.push(functor);

    return functor;

};

},{"../src":62,"./Keep":55,"./utils":66}],61:[function(require,module,exports){
var _ = require('./utils'),
    Reflux = require('../src'),
    Keep = require('./Keep'),
    allowed = {preEmit:1,shouldEmit:1};

/**
 * Creates an event emitting Data Store. It is mixed in with functions
 * from the `ListenerMethods` and `PublisherMethods` mixins. `preEmit`
 * and `shouldEmit` may be overridden in the definition object.
 *
 * @param {Object} definition The data store object definition
 * @returns {Store} A data store instance
 */
module.exports = function(definition) {

    definition = definition || {};

    for(var d in definition){
        if (!allowed[d] && (Reflux.PublisherMethods[d] || Reflux.ListenerMethods[d])){
            throw new Error("Cannot override API method " + d + 
                " in store creation. Use another method name or override it on Reflux.PublisherMethods / Reflux.ListenerMethods instead."
            );
        }
    }

    function Store() {
        var i=0, arr;
        this.subscriptions = [];
        this.emitter = new _.EventEmitter();
        this.eventLabel = "change";
        if (this.init && _.isFunction(this.init)) {
            this.init();
        }
        if (this.listenables){
            arr = [].concat(this.listenables);
            for(;i < arr.length;i++){
                this.listenToMany(arr[i]);
            }
        }
    }

    _.extend(Store.prototype, Reflux.ListenerMethods, Reflux.PublisherMethods, definition);

    var store = new Store();
    Keep.createdStores.push(store);

    return store;
};

},{"../src":62,"./Keep":55,"./utils":66}],62:[function(require,module,exports){
exports.ListenerMethods = require('./ListenerMethods');

exports.PublisherMethods = require('./PublisherMethods');

exports.createAction = require('./createAction');

exports.createStore = require('./createStore');

exports.connect = require('./connect');

exports.ListenerMixin = require('./ListenerMixin');

exports.listenTo = require('./listenTo');

exports.listenToMany = require('./listenToMany');


var maker = require('./joins').staticJoinCreator;

exports.joinTrailing = exports.all = maker("last"); // Reflux.all alias for backward compatibility

exports.joinLeading = maker("first");

exports.joinStrict = maker("strict");

exports.joinConcat = maker("all");


/**
 * Convenience function for creating a set of actions
 *
 * @param actionNames the names for the actions to be created
 * @returns an object with actions of corresponding action names
 */
exports.createActions = function(actionNames) {
    var i = 0, actions = {};
    for (; i < actionNames.length; i++) {
        actions[actionNames[i]] = exports.createAction();
    }
    return actions;
};

/**
 * Sets the eventmitter that Reflux uses
 */
exports.setEventEmitter = function(ctx) {
    var _ = require('./utils');
    _.EventEmitter = ctx;
};

/**
 * Sets the method used for deferring actions and stores
 */
exports.nextTick = function(nextTick) {
    var _ = require('./utils');
    _.nextTick = nextTick;
};

/**
 * Provides the set of created actions and stores for introspection
 */
exports.__keep = require('./Keep');

},{"./Keep":55,"./ListenerMethods":56,"./ListenerMixin":57,"./PublisherMethods":58,"./connect":59,"./createAction":60,"./createStore":61,"./joins":63,"./listenTo":64,"./listenToMany":65,"./utils":66}],63:[function(require,module,exports){
/**
 * Internal module used to create static and instance join methods
 */

var slice = Array.prototype.slice,
    createStore = require("./createStore"),
    strategyMethodNames = {
        strict: "joinStrict",
        first: "joinLeading",
        last: "joinTrailing",
        all: "joinConcat"
    };

/**
 * Used in `index.js` to create the static join methods
 * @param {String} strategy Which strategy to use when tracking listenable trigger arguments
 * @returns {Function} A static function which returns a store with a join listen on the given listenables using the given strategy
 */
exports.staticJoinCreator = function(strategy){
    return function(/* listenables... */) {
        var listenables = slice.call(arguments);
        return createStore({
            init: function(){
                this[strategyMethodNames[strategy]].apply(this,listenables.concat("triggerAsync"));
            }
        });
    };
};

/**
 * Used in `ListenerMethods.js` to create the instance join methods
 * @param {String} strategy Which strategy to use when tracking listenable trigger arguments
 * @returns {Function} An instance method which sets up a join listen on the given listenables using the given strategy
 */
exports.instanceJoinCreator = function(strategy){
    return function(/* listenables..., callback*/){
        var listenables = slice.call(arguments),
            callback = listenables.pop(),
            numberOfListenables = listenables.length,
            join = {
                numberOfListenables: numberOfListenables,
                callback: this[callback]||callback,
                listener: this,
                strategy: strategy
            };
        for (var i = 0; i < numberOfListenables; i++) {
            this.listenTo(listenables[i],newListener(i,join));
        }
        reset(join);
    };
};

// ---- internal join functions ----

function reset(join) {
    join.listenablesEmitted = new Array(join.numberOfListenables);
    join.args = new Array(join.numberOfListenables);
}

function newListener(i,join) {
    return function() {
        var callargs = slice.call(arguments);
        if (join.listenablesEmitted[i]){
            switch(join.strategy){
                case "strict": throw new Error("Strict join failed because listener triggered twice.");
                case "last": join.args[i] = callargs; break;
                case "all": join.args[i].push(callargs);
            }
        } else {
            join.listenablesEmitted[i] = true;
            join.args[i] = (join.strategy==="all"?[callargs]:callargs);
        }
        emitIfAllListenablesEmitted(join);
    };
}

function emitIfAllListenablesEmitted(join) {
    for (var i = 0; i < join.numberOfListenables; i++) {
        if (!join.listenablesEmitted[i]) {
            return;
        }
    }
    join.callback.apply(join.listener,join.args);
    reset(join);
}

},{"./createStore":61}],64:[function(require,module,exports){
var Reflux = require('../src');


/**
 * A mixin factory for a React component. Meant as a more convenient way of using the `ListenerMixin`,
 * without having to manually set listeners in the `componentDidMount` method.
 *
 * @param {Action|Store} listenable An Action or Store that should be
 *  listened to.
 * @param {Function|String} callback The callback to register as event handler
 * @param {Function|String} defaultCallback The callback to register as default handler
 * @returns {Object} An object to be used as a mixin, which sets up the listener for the given listenable.
 */
module.exports = function(listenable,callback,initial){
    return {
        /**
         * Set up the mixin before the initial rendering occurs. Import methods from `ListenerMethods`
         * and then make the call to `listenTo` with the arguments provided to the factory function
         */
        componentDidMount: function() {
            for(var m in Reflux.ListenerMethods){
                if (this[m] !== Reflux.ListenerMethods[m]){
                    if (this[m]){
                        throw "Can't have other property '"+m+"' when using Reflux.listenTo!";
                    }
                    this[m] = Reflux.ListenerMethods[m];
                }
            }
            this.listenTo(listenable,callback,initial);
        },
        /**
         * Cleans up all listener previously registered.
         */
        componentWillUnmount: Reflux.ListenerMethods.stopListeningToAll
    };
};

},{"../src":62}],65:[function(require,module,exports){
var Reflux = require('../src');

/**
 * A mixin factory for a React component. Meant as a more convenient way of using the `listenerMixin`,
 * without having to manually set listeners in the `componentDidMount` method. This version is used
 * to automatically set up a `listenToMany` call.
 *
 * @param {Object} listenables An object of listenables
 * @returns {Object} An object to be used as a mixin, which sets up the listeners for the given listenables.
 */
module.exports = function(listenables){
    return {
        /**
         * Set up the mixin before the initial rendering occurs. Import methods from `ListenerMethods`
         * and then make the call to `listenTo` with the arguments provided to the factory function
         */
        componentDidMount: function() {
            for(var m in Reflux.ListenerMethods){
                if (this[m] !== Reflux.ListenerMethods[m]){
                    if (this[m]){
                        throw "Can't have other property '"+m+"' when using Reflux.listenToMany!";
                    }
                    this[m] = Reflux.ListenerMethods[m];
                }
            }
            this.listenToMany(listenables);
        },
        /**
         * Cleans up all listener previously registered.
         */
        componentWillUnmount: Reflux.ListenerMethods.stopListeningToAll
    };
};

},{"../src":62}],66:[function(require,module,exports){
/*
 * isObject, extend, isFunction, isArguments are taken from undescore/lodash in
 * order to remove the dependency
 */
var isObject = exports.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
};

exports.extend = function(obj) {
    if (!isObject(obj)) {
        return obj;
    }
    var source, prop;
    for (var i = 1, length = arguments.length; i < length; i++) {
        source = arguments[i];
        for (prop in source) {
            obj[prop] = source[prop];
        }
    }
    return obj;
};

exports.isFunction = function(value) {
    return typeof value === 'function';
};

exports.EventEmitter = require('eventemitter3');

exports.nextTick = function(callback) {
    setTimeout(callback, 0);
};

exports.callbackName = function(string){
    return "on"+string.charAt(0).toUpperCase()+string.slice(1);
};

exports.object = function(keys,vals){
    var o={}, i=0;
    for(;i<keys.length;i++){
        o[keys[i]] = vals[i];
    }
    return o;
};

exports.isArguments = function(value) {
    return value && typeof value == 'object' && typeof value.length == 'number' &&
      (toString.call(value) === '[object Arguments]' || (hasOwnProperty.call(value, 'callee' && !propertyIsEnumerable.call(value, 'callee')))) || false;
};

exports.throwIf = function(val,msg){
    if (val){
        throw Error(msg||val);
    }
};

},{"eventemitter3":54}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsImxpYi9jb21waWxlcnMvY2hvaWNlcy5qcyIsImxpYi9jb21waWxlcnMvbG9va3VwLmpzIiwibGliL2NvbXBpbGVycy9wcm9wLWFsaWFzZXMuanMiLCJsaWIvY29tcGlsZXJzL3R5cGVzLmpzIiwibGliL2NvbXBvbmVudHMvYWRkLWl0ZW0uanMiLCJsaWIvY29tcG9uZW50cy9jaGVja2JveC1saXN0LmpzIiwibGliL2NvbXBvbmVudHMvZmllbGQuanMiLCJsaWIvY29tcG9uZW50cy9maWVsZHNldC5qcyIsImxpYi9jb21wb25lbnRzL2Zvcm1hdGljLmpzIiwibGliL2NvbXBvbmVudHMvaGVscC5qcyIsImxpYi9jb21wb25lbnRzL2l0ZW0tY2hvaWNlcy5qcyIsImxpYi9jb21wb25lbnRzL2pzb24uanMiLCJsaWIvY29tcG9uZW50cy9sYWJlbC5qcyIsImxpYi9jb21wb25lbnRzL2xpc3QtY29udHJvbC5qcyIsImxpYi9jb21wb25lbnRzL2xpc3QtaXRlbS1jb250cm9sLmpzIiwibGliL2NvbXBvbmVudHMvbGlzdC1pdGVtLXZhbHVlLmpzIiwibGliL2NvbXBvbmVudHMvbGlzdC1pdGVtLmpzIiwibGliL2NvbXBvbmVudHMvbGlzdC5qcyIsImxpYi9jb21wb25lbnRzL21peGlucy9maWVsZC5qcyIsImxpYi9jb21wb25lbnRzL21peGlucy9yZXNpemUuanMiLCJsaWIvY29tcG9uZW50cy9taXhpbnMvdW5kby1zdGFjay5qcyIsImxpYi9jb21wb25lbnRzL21vdmUtaXRlbS1iYWNrLmpzIiwibGliL2NvbXBvbmVudHMvbW92ZS1pdGVtLWZvcndhcmQuanMiLCJsaWIvY29tcG9uZW50cy9wcmV0dHktdGV4dGFyZWEuanMiLCJsaWIvY29tcG9uZW50cy9yZW1vdmUtaXRlbS5qcyIsImxpYi9jb21wb25lbnRzL3Jvb3QuanMiLCJsaWIvY29tcG9uZW50cy9zZWxlY3QuanMiLCJsaWIvY29tcG9uZW50cy90ZXh0LmpzIiwibGliL2NvbXBvbmVudHMvdGV4dGFyZWEuanMiLCJsaWIvY29yZS9maWVsZC5qcyIsImxpYi9jb3JlL2Zvcm0taW5pdC5qcyIsImxpYi9jb3JlL2Zvcm0uanMiLCJsaWIvY29yZS9mb3JtYXRpYy5qcyIsImxpYi9kZWZhdWx0L2NvbXBpbGVyLmpzIiwibGliL2RlZmF1bHQvY29tcG9uZW50LmpzIiwibGliL2RlZmF1bHQvY29yZS5qcyIsImxpYi9kZWZhdWx0L2V2YWwuanMiLCJsaWIvZGVmYXVsdC9maWVsZC1yb3V0ZXIuanMiLCJsaWIvZGVmYXVsdC9maWVsZC1yb3V0ZXMuanMiLCJsaWIvZGVmYXVsdC9sb2FkZXIuanMiLCJsaWIvZGVmYXVsdC91dGlsLmpzIiwibGliL2Zvcm1hdGljLmpzIiwibGliL3BsdWdpbnMvYm9vdHN0cmFwLmpzIiwibGliL3N0b3JlL21lbW9yeS5qcyIsImxpYi90eXBlcy9hcnJheS5qcyIsImxpYi90eXBlcy9ib29sZWFuLmpzIiwibGliL3R5cGVzL2pzb24uanMiLCJsaWIvdHlwZXMvb2JqZWN0LmpzIiwibGliL3R5cGVzL3Jvb3QuanMiLCJsaWIvdHlwZXMvc3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL3JlYWN0LWNvbXBvbmVudC1yZXNpemFibGUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcmVhY3QtY29tcG9uZW50LXJlc2l6YWJsZS9zcmMvY29tcG9uZW50LmpzIiwibm9kZV9tb2R1bGVzL3JlZmx1eC9ub2RlX21vZHVsZXMvZXZlbnRlbWl0dGVyMy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZWZsdXgvc3JjL0tlZXAuanMiLCJub2RlX21vZHVsZXMvcmVmbHV4L3NyYy9MaXN0ZW5lck1ldGhvZHMuanMiLCJub2RlX21vZHVsZXMvcmVmbHV4L3NyYy9MaXN0ZW5lck1peGluLmpzIiwibm9kZV9tb2R1bGVzL3JlZmx1eC9zcmMvUHVibGlzaGVyTWV0aG9kcy5qcyIsIm5vZGVfbW9kdWxlcy9yZWZsdXgvc3JjL2Nvbm5lY3QuanMiLCJub2RlX21vZHVsZXMvcmVmbHV4L3NyYy9jcmVhdGVBY3Rpb24uanMiLCJub2RlX21vZHVsZXMvcmVmbHV4L3NyYy9jcmVhdGVTdG9yZS5qcyIsIm5vZGVfbW9kdWxlcy9yZWZsdXgvc3JjL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3JlZmx1eC9zcmMvam9pbnMuanMiLCJub2RlX21vZHVsZXMvcmVmbHV4L3NyYy9saXN0ZW5Uby5qcyIsIm5vZGVfbW9kdWxlcy9yZWZsdXgvc3JjL2xpc3RlblRvTWFueS5qcyIsIm5vZGVfbW9kdWxlcy9yZWZsdXgvc3JjL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvZm9ybWF0aWMnKTtcbiIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzLmNvbXBpbGUgPSBmdW5jdGlvbiAoZGVmKSB7XG4gICAgaWYgKGRlZi5jaG9pY2VzKSB7XG5cbiAgICAgIHZhciBjaG9pY2VzID0gZGVmLmNob2ljZXM7XG5cbiAgICAgIGlmIChfLmlzU3RyaW5nKGNob2ljZXMpKSB7XG4gICAgICAgIGNob2ljZXMgPSBjaG9pY2VzLnNwbGl0KCcsJyk7XG4gICAgICB9XG5cbiAgICAgIGlmICghXy5pc0FycmF5KGNob2ljZXMpICYmIF8uaXNPYmplY3QoY2hvaWNlcykpIHtcbiAgICAgICAgY2hvaWNlcyA9IE9iamVjdC5rZXlzKGNob2ljZXMpLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbHVlOiBrZXksXG4gICAgICAgICAgICBsYWJlbDogY2hvaWNlc1trZXldXG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGNob2ljZXMgPSBjaG9pY2VzLnNsaWNlKDApO1xuXG4gICAgICBjaG9pY2VzLmZvckVhY2goZnVuY3Rpb24gKGNob2ljZSwgaSkge1xuICAgICAgICBpZiAoXy5pc1N0cmluZyhjaG9pY2UpKSB7XG4gICAgICAgICAgY2hvaWNlc1tpXSA9IHtcbiAgICAgICAgICAgIHZhbHVlOiBjaG9pY2UsXG4gICAgICAgICAgICBsYWJlbDogY2hvaWNlXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGRlZi5jaG9pY2VzID0gY2hvaWNlcztcbiAgICB9XG4gIH07XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzLmNvbXBpbGUgPSBmdW5jdGlvbiAoZGVmKSB7XG4gICAgaWYgKGRlZi5sb29rdXApIHtcbiAgICAgIGlmICghZGVmLmV2YWwpIHtcbiAgICAgICAgZGVmLmV2YWwgPSB7fTtcbiAgICAgIH1cbiAgICAgIGlmICghZGVmLmV2YWwubmVlZHNNZXRhKSB7XG4gICAgICAgIGRlZi5ldmFsLm5lZWRzTWV0YSA9IFtdO1xuICAgICAgfVxuICAgICAgdmFyIGtleXMgPSBkZWYubG9va3VwLmtleXMgfHwgW107XG4gICAgICB2YXIgbWV0YUtleXMgPSBrZXlzLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIHJldHVybiBbJ0BnZXQnLCBrZXldO1xuICAgICAgfSk7XG4gICAgICBtZXRhS2V5cyA9IFtkZWYubG9va3VwLnNvdXJjZV0uY29uY2F0KG1ldGFLZXlzKTtcbiAgICAgIHZhciBtZXRhR2V0ID0gWydAZ2V0TWV0YSddLmNvbmNhdChtZXRhS2V5cyk7XG4gICAgICBkZWYuZXZhbC5uZWVkc01ldGEucHVzaChbJ0BpZicsIG1ldGFHZXQsIG51bGwsIG1ldGFLZXlzXSk7XG4gICAgICBkZWYuZXZhbC5jaG9pY2VzID0gbWV0YUdldDtcbiAgICAgIGRlbGV0ZSBkZWYubG9va3VwO1xuICAgIH1cbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHZhciBwcm9wQWxpYXNlcyA9IHtcbiAgICBoZWxwX3RleHQ6ICdoZWxwVGV4dCdcbiAgfTtcblxuICBwbHVnaW4uZXhwb3J0cy5jb21waWxlID0gZnVuY3Rpb24gKGRlZikge1xuICAgIE9iamVjdC5rZXlzKHByb3BBbGlhc2VzKS5mb3JFYWNoKGZ1bmN0aW9uIChhbGlhcykge1xuICAgICAgdmFyIHByb3BOYW1lID0gcHJvcEFsaWFzZXNbYWxpYXNdO1xuICAgICAgaWYgKHR5cGVvZiBkZWZbcHJvcE5hbWVdID09PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgZGVmW2FsaWFzXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgZGVmW3Byb3BOYW1lXSA9IGRlZlthbGlhc107XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG59O1xuIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgdmFyIHR5cGVDb2VyY2UgPSB7XG4gICAgdW5pY29kZTogZnVuY3Rpb24gKGRlZikge1xuICAgICAgZGVmLnR5cGUgPSAnc3RyaW5nJztcbiAgICAgIGRlZi5tYXhSb3dzID0gMTtcbiAgICB9LFxuICAgIHRleHQ6ICdzdHJpbmcnLFxuICAgIHNlbGVjdDogZnVuY3Rpb24gKGRlZikge1xuICAgICAgZGVmLmNob2ljZXMgPSBkZWYuY2hvaWNlcyB8fCBbXTtcbiAgICB9LFxuICAgIGJvb2w6ICdib29sZWFuJ1xuICB9O1xuXG4gIHR5cGVDb2VyY2Uuc3RyID0gdHlwZUNvZXJjZS51bmljb2RlO1xuXG5cbiAgcGx1Z2luLmV4cG9ydHMuY29tcGlsZSA9IGZ1bmN0aW9uIChkZWYpIHtcbiAgICB2YXIgY29lcmNlVHlwZSA9IHR5cGVDb2VyY2VbZGVmLnR5cGVdO1xuICAgIGlmIChjb2VyY2VUeXBlKSB7XG4gICAgICBpZiAoXy5pc1N0cmluZyhjb2VyY2VUeXBlKSkge1xuICAgICAgICBkZWYudHlwZSA9IGNvZXJjZVR5cGU7XG4gICAgICB9IGVsc2UgaWYgKF8uaXNGdW5jdGlvbihjb2VyY2VUeXBlKSkge1xuICAgICAgICBkZWYgPSBjb2VyY2VUeXBlKGRlZik7XG4gICAgICB9XG4gICAgfVxuICB9O1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cy5jb21wb25lbnQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWUsXG4gICAgICAgIGxhYmVsOiBwbHVnaW4uY29uZmlnVmFsdWUoJ2xhYmVsJywgJ1thZGRdJylcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIFIuc3Bhbih7Y2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZSwgb25DbGljazogdGhpcy5wcm9wcy5vbkNsaWNrfSwgdGhpcy5wcm9wcy5sYWJlbCk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMuY29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgbWl4aW5zOiBbcmVxdWlyZSgnLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgY2hvaWNlTm9kZXMgPSB0aGlzLnJlZnMuY2hvaWNlcy5nZXRET01Ob2RlKCkuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2lucHV0Jyk7XG4gICAgICBjaG9pY2VOb2RlcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGNob2ljZU5vZGVzLCAwKTtcbiAgICAgIHZhciB2YWx1ZXMgPSBjaG9pY2VOb2Rlcy5tYXAoZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgcmV0dXJuIG5vZGUuY2hlY2tlZCA/IG5vZGUudmFsdWUgOiBudWxsO1xuICAgICAgfSkuZmlsdGVyKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9KTtcbiAgICAgIHRoaXMucHJvcHMuZmllbGQudmFsKHZhbHVlcyk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgICB2YXIgY2hvaWNlcyA9IGZpZWxkLmRlZi5jaG9pY2VzIHx8IFtdO1xuXG4gICAgICB2YXIgdmFsdWUgPSBmaWVsZC52YWx1ZSB8fCBbXTtcblxuICAgICAgcmV0dXJuIHBsdWdpbi5jb21wb25lbnQoJ2ZpZWxkJykoe1xuICAgICAgICBmaWVsZDogZmllbGRcbiAgICAgIH0sXG4gICAgICAgIFIuZGl2KHtjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lLCByZWY6ICdjaG9pY2VzJ30sXG4gICAgICAgICAgY2hvaWNlcy5tYXAoZnVuY3Rpb24gKGNob2ljZSwgaSkge1xuICAgICAgICAgICAgcmV0dXJuIFIuc3Bhbih7a2V5OiBpLCBjbGFzc05hbWU6ICdmaWVsZC1jaG9pY2UnfSxcbiAgICAgICAgICAgICAgUi5zcGFuKHtzdHlsZToge3doaXRlU3BhY2U6ICdub3dyYXAnfX0sXG4gICAgICAgICAgICAgICAgUi5pbnB1dCh7XG4gICAgICAgICAgICAgICAgICBuYW1lOiBmaWVsZC5kZWYua2V5LFxuICAgICAgICAgICAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgICAgICAgICAgIHZhbHVlOiBjaG9pY2UudmFsdWUsXG4gICAgICAgICAgICAgICAgICBjaGVja2VkOiB2YWx1ZS5pbmRleE9mKGNob2ljZS52YWx1ZSkgPj0gMCA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlXG4gICAgICAgICAgICAgICAgICAvL29uRm9jdXM6IHRoaXMucHJvcHMuYWN0aW9ucy5mb2N1c1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAnZmllbGQtY2hvaWNlLWxhYmVsJ30sXG4gICAgICAgICAgICAgICAgICBjaG9pY2UubGFiZWxcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICcgJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMuY29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lLCBzdHlsZToge2Rpc3BsYXk6IChmaWVsZC5oaWRkZW4oKSA/ICdub25lJyA6ICcnKX19LFxuICAgICAgICBwbHVnaW4uY29tcG9uZW50KCdsYWJlbCcpKHtmaWVsZDogZmllbGQsIGluZGV4OiB0aGlzLnByb3BzLmluZGV4fSksXG4gICAgICAgIFJlYWN0LmFkZG9ucy5DU1NUcmFuc2l0aW9uR3JvdXAoe3RyYW5zaXRpb25OYW1lOiAncmV2ZWFsJ30sXG4gICAgICAgICAgZmllbGQuY29sbGFwc2VkID8gW10gOiBbXG4gICAgICAgICAgICBwbHVnaW4uY29tcG9uZW50KCdoZWxwJykoe2tleTogJ2hlbHAnLCBmaWVsZDogZmllbGR9KSxcbiAgICAgICAgICAgIHRoaXMucHJvcHMuY2hpbGRyZW5cbiAgICAgICAgICBdXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMuY29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgbWl4aW5zOiBbcmVxdWlyZSgnLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgICAgcmV0dXJuIHBsdWdpbi5jb21wb25lbnQoJ2ZpZWxkJykoe1xuICAgICAgICBmaWVsZDogZmllbGRcbiAgICAgIH0sXG4gICAgICAgIFIuZmllbGRzZXQoe2NsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWV9LFxuICAgICAgICAgIGZpZWxkLmZpZWxkcygpLm1hcChmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgICAgICAgIHJldHVybiBmaWVsZC5jb21wb25lbnQoKTtcbiAgICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBSZWZsdXggPSByZXF1aXJlKCdyZWZsdXgnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMuY29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgbWl4aW5zOiBbUmVmbHV4Lkxpc3RlbmVyTWl4aW5dLFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBmaWVsZDogdGhpcy5wcm9wcy5mb3JtLmZpZWxkKClcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBmb3JtID0gdGhpcy5wcm9wcy5mb3JtO1xuICAgICAgdGhpcy5saXN0ZW5Ubyhmb3JtLnN0b3JlLCB0aGlzLm9uRm9ybUNoYW5nZWQpO1xuICAgIH0sXG5cbiAgICBvbkZvcm1DaGFuZ2VkOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHRoaXMucHJvcHMuZm9ybS52YWwoKSk7XG4gICAgICB9XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgZmllbGQ6IHRoaXMucHJvcHMuZm9ybS5maWVsZCgpXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogJ2Zvcm1hdGljJ30sXG4gICAgICAgIHRoaXMuc3RhdGUuZmllbGQuY29tcG9uZW50KClcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMuY29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgICAgcmV0dXJuIGZpZWxkLmRlZi5oZWxwVGV4dCA/XG4gICAgICAgIFIuZGl2KHtjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lfSxcbiAgICAgICAgICBmaWVsZC5kZWYuaGVscFRleHRcbiAgICAgICAgKSA6XG4gICAgICAgIFIuc3BhbihudWxsKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cy5jb21wb25lbnQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIHRoaXMucHJvcHMub25TZWxlY3QocGFyc2VJbnQoZXZlbnQudGFyZ2V0LnZhbHVlKSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgICB2YXIgdHlwZUNob2ljZXMgPSBudWxsO1xuICAgICAgaWYgKGZpZWxkLml0ZW1zKCkubGVuZ3RoID4gMCkge1xuICAgICAgICB0eXBlQ2hvaWNlcyA9IFIuc2VsZWN0KHtjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lLCB2YWx1ZTogdGhpcy52YWx1ZSwgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2V9LFxuICAgICAgICAgIGZpZWxkLml0ZW1zKCkubWFwKGZ1bmN0aW9uIChpdGVtLCBpKSB7XG4gICAgICAgICAgICByZXR1cm4gUi5vcHRpb24oe2tleTogaSwgdmFsdWU6IGl9LCBpdGVtLmxhYmVsIHx8IGkpO1xuICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0eXBlQ2hvaWNlcyA/IHR5cGVDaG9pY2VzIDogUi5zcGFuKG51bGwpO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzLmNvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIG1peGluczogW3JlcXVpcmUoJy4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lLFxuICAgICAgICByb3dzOiBwbHVnaW4uY29uZmlnLnJvd3MgfHwgNVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgaXNWYWxpZFZhbHVlOiBmdW5jdGlvbiAodmFsdWUpIHtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaXNWYWxpZDogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IEpTT04uc3RyaW5naWZ5KHRoaXMucHJvcHMuZmllbGQudmFsdWUpXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICB2YXIgaXNWYWxpZCA9IHRoaXMuaXNWYWxpZFZhbHVlKGV2ZW50LnRhcmdldC52YWx1ZSk7XG5cbiAgICAgIGlmIChpc1ZhbGlkKSB7XG4gICAgICAgIC8vIE5lZWQgdG8gaGFuZGxlIHRoaXMgYmV0dGVyLiBOZWVkIHRvIHRyYWNrIHBvc2l0aW9uLlxuICAgICAgICB0aGlzLl9pc0NoYW5naW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5wcm9wcy5maWVsZC52YWwoSlNPTi5wYXJzZShldmVudC50YXJnZXQudmFsdWUpKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGlzVmFsaWQ6IGlzVmFsaWQsXG4gICAgICAgIHZhbHVlOiBldmVudC50YXJnZXQudmFsdWVcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV4dFByb3BzKSB7XG4gICAgICBpZiAoIXRoaXMuX2lzQ2hhbmdpbmcpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgaXNWYWxpZDogdHJ1ZSxcbiAgICAgICAgICB2YWx1ZTogSlNPTi5zdHJpbmdpZnkobmV4dFByb3BzLmZpZWxkLnZhbHVlLCBudWxsLCAyKVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2lzQ2hhbmdpbmcgPSBmYWxzZTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICAgIHJldHVybiBwbHVnaW4uY29tcG9uZW50KCdmaWVsZCcpKHtcbiAgICAgICAgZmllbGQ6IGZpZWxkXG4gICAgICB9LCBSLnRleHRhcmVhKHtcbiAgICAgICAgICBjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lLFxuICAgICAgICAgIHZhbHVlOiB0aGlzLnN0YXRlLnZhbHVlLFxuICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgICAgIHN0eWxlOiB7YmFja2dyb3VuZENvbG9yOiB0aGlzLnN0YXRlLmlzVmFsaWQgPyAnJyA6ICdyZ2IoMjU1LDIwMCwyMDApJ30sXG4gICAgICAgICAgcm93czogZmllbGQuZGVmLnJvd3MgfHwgdGhpcy5wcm9wcy5yb3dzXG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzLmNvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICAgIHZhciBsYWJlbCA9IG51bGw7XG4gICAgICBpZiAodHlwZW9mIHRoaXMucHJvcHMuaW5kZXggPT09ICdudW1iZXInKSB7XG4gICAgICAgIGxhYmVsID0gJycgKyAodGhpcy5wcm9wcy5pbmRleCArIDEpICsgJy4nO1xuICAgICAgICBpZiAoZmllbGQuZGVmLmxhYmVsKSB7XG4gICAgICAgICAgbGFiZWwgPSBsYWJlbCArICcgJyArIGZpZWxkLmRlZi5sYWJlbDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZmllbGQuZGVmLmxhYmVsIHx8IGxhYmVsKSB7XG4gICAgICAgIHZhciB0ZXh0ID0gbGFiZWwgfHwgZmllbGQuZGVmLmxhYmVsO1xuICAgICAgICAvLyBpZiAodGhpcy5zdGF0ZS5jb2xsYXBzYWJsZSkge1xuICAgICAgICAvLyAgIHRleHQgPSBSLmEoe2hyZWY6ICdKYXZhU2NyaXB0JyArICc6Jywgb25DbGljazogdGhpcy5wcm9wcy5vbkNsaWNrTGFiZWwgfHwgdGhpcy5vbkNsaWNrTGFiZWx9LCB0ZXh0KTtcbiAgICAgICAgLy8gfVxuICAgICAgICBsYWJlbCA9IFIubGFiZWwoe30sIHRleHQpO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVxdWlyZWQgPSBSLnNwYW4oe2NsYXNzTmFtZTogJ3JlcXVpcmVkLXRleHQnfSk7XG5cbiAgICAgIHJldHVybiBSLmRpdih7XG4gICAgICAgIGNsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWVcbiAgICAgIH0sXG4gICAgICAgIGxhYmVsLFxuICAgICAgICAnICcsXG4gICAgICAgIHJlcXVpcmVkXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzLmNvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpdGVtSW5kZXg6IDBcbiAgICAgIH07XG4gICAgfSxcblxuICAgIG9uU2VsZWN0OiBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBpdGVtSW5kZXg6IGluZGV4XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgb25BcHBlbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMucHJvcHMub25BcHBlbmQodGhpcy5zdGF0ZS5pdGVtSW5kZXgpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgICAgdmFyIHR5cGVDaG9pY2VzID0gbnVsbDtcblxuICAgICAgaWYgKGZpZWxkLml0ZW1zKCkubGVuZ3RoID4gMCkge1xuICAgICAgICB0eXBlQ2hvaWNlcyA9IHBsdWdpbi5jb21wb25lbnQoJ2l0ZW0tY2hvaWNlcycpKHtmaWVsZDogZmllbGQsIHZhbHVlOiB0aGlzLnN0YXRlLml0ZW1JbmRleCwgb25TZWxlY3Q6IHRoaXMub25TZWxlY3R9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lfSxcbiAgICAgICAgdHlwZUNob2ljZXMsICcgJyxcbiAgICAgICAgcGx1Z2luLmNvbXBvbmVudCgnYWRkLWl0ZW0nKSh7b25DbGljazogdGhpcy5vbkFwcGVuZH0pXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzLmNvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgb25Nb3ZlQmFjazogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5wcm9wcy5vbk1vdmUodGhpcy5wcm9wcy5pbmRleCwgdGhpcy5wcm9wcy5pbmRleCAtIDEpO1xuICAgIH0sXG5cbiAgICBvbk1vdmVGb3J3YXJkOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnByb3BzLm9uTW92ZSh0aGlzLnByb3BzLmluZGV4LCB0aGlzLnByb3BzLmluZGV4ICsgMSk7XG4gICAgfSxcblxuICAgIG9uUmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnByb3BzLm9uUmVtb3ZlKHRoaXMucHJvcHMuaW5kZXgpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZX0sXG4gICAgICAgIHBsdWdpbi5jb21wb25lbnQoJ3JlbW92ZS1pdGVtJykoe2ZpZWxkOiBmaWVsZCwgb25DbGljazogdGhpcy5vblJlbW92ZX0pLFxuICAgICAgICB0aGlzLnByb3BzLmluZGV4ID4gMCA/IHBsdWdpbi5jb21wb25lbnQoJ21vdmUtaXRlbS1iYWNrJykoe29uQ2xpY2s6IHRoaXMub25Nb3ZlQmFja30pIDogbnVsbCxcbiAgICAgICAgdGhpcy5wcm9wcy5pbmRleCA8ICh0aGlzLnByb3BzLm51bUl0ZW1zIC0gMSkgPyBwbHVnaW4uY29tcG9uZW50KCdtb3ZlLWl0ZW0tZm9yd2FyZCcpKHtvbkNsaWNrOiB0aGlzLm9uTW92ZUZvcndhcmR9KSA6IG51bGxcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMuY29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lXG4gICAgICB9O1xuICAgIH0sXG4gICAgLy9cbiAgICAvLyBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyAgIHJldHVybiB7XG4gICAgLy8gICAgIG1heWJlRGVsZXRlOiBmYWxzZVxuICAgIC8vICAgfTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gb25EZWxldGU6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyAgIHZhciBwYXJlbnQgPSB0aGlzLnByb3BzLmZpZWxkLnBhcmVudDtcbiAgICAvLyAgIGlmICh0aGlzLnByb3BzLm9uRGVsZXRlKSB7XG4gICAgLy8gICAgIHRoaXMucHJvcHMub25EZWxldGUodGhpcy5wcm9wcy5maWVsZC5pbmRleCk7XG4gICAgLy8gICB9XG4gICAgLy8gICB0aGlzLnByb3BzLmZvcm0uYWN0aW9ucy5kZWxldGUocGFyZW50LCB0aGlzLnByb3BzLmZpZWxkLmluZGV4KTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gb25Nb3ZlVXA6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyAgIHZhciBwYXJlbnQgPSB0aGlzLnByb3BzLmZpZWxkLnBhcmVudDtcbiAgICAvLyAgIGlmICh0aGlzLnByb3BzLm9uTW92ZSkge1xuICAgIC8vICAgICB0aGlzLnByb3BzLm9uTW92ZSh0aGlzLnByb3BzLmZpZWxkLmluZGV4LCB0aGlzLnByb3BzLmZpZWxkLmluZGV4IC0gMSk7XG4gICAgLy8gICB9XG4gICAgLy8gICB0aGlzLnByb3BzLmZvcm0uYWN0aW9ucy5tb3ZlKHBhcmVudCwgdGhpcy5wcm9wcy5maWVsZC5pbmRleCwgdGhpcy5wcm9wcy5maWVsZC5pbmRleCAtIDEpO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyBvbk1vdmVEb3duOiBmdW5jdGlvbiAoKSB7XG4gICAgLy8gICB2YXIgcGFyZW50ID0gdGhpcy5wcm9wcy5maWVsZC5wYXJlbnQ7XG4gICAgLy8gICBpZiAodGhpcy5wcm9wcy5vbk1vdmUpIHtcbiAgICAvLyAgICAgdGhpcy5wcm9wcy5vbk1vdmUodGhpcy5wcm9wcy5maWVsZC5pbmRleCwgdGhpcy5wcm9wcy5maWVsZC5pbmRleCArIDEpO1xuICAgIC8vICAgfVxuICAgIC8vICAgdGhpcy5wcm9wcy5mb3JtLmFjdGlvbnMubW92ZShwYXJlbnQsIHRoaXMucHJvcHMuZmllbGQuaW5kZXgsIHRoaXMucHJvcHMuZmllbGQuaW5kZXggKyAxKTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gb25Nb3VzZU92ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyAgIHRoaXMuc2V0U3RhdGUoe1xuICAgIC8vICAgICBtYXliZURlbGV0ZTogdHJ1ZVxuICAgIC8vICAgfSk7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIG9uTW91c2VPdXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyAgIHRoaXMuc2V0U3RhdGUoe1xuICAgIC8vICAgICBtYXliZURlbGV0ZTogZmFsc2VcbiAgICAvLyAgIH0pO1xuICAgIC8vIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZX0sXG4gICAgICAgIHBsdWdpbi5jb21wb25lbnQoJ2ZpZWxkJykoe1xuICAgICAgICAgIGZpZWxkOiBmaWVsZCxcbiAgICAgICAgICBpbmRleDogdGhpcy5wcm9wcy5pbmRleFxuICAgICAgICB9LFxuICAgICAgICAgIGZpZWxkLmNvbXBvbmVudCgpXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMuY29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lXG4gICAgICB9O1xuICAgIH0sXG4gICAgLy9cbiAgICAvLyBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyAgIHJldHVybiB7XG4gICAgLy8gICAgIG1heWJlRGVsZXRlOiBmYWxzZVxuICAgIC8vICAgfTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gb25EZWxldGU6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyAgIHZhciBwYXJlbnQgPSB0aGlzLnByb3BzLmZpZWxkLnBhcmVudDtcbiAgICAvLyAgIGlmICh0aGlzLnByb3BzLm9uRGVsZXRlKSB7XG4gICAgLy8gICAgIHRoaXMucHJvcHMub25EZWxldGUodGhpcy5wcm9wcy5maWVsZC5pbmRleCk7XG4gICAgLy8gICB9XG4gICAgLy8gICB0aGlzLnByb3BzLmZvcm0uYWN0aW9ucy5kZWxldGUocGFyZW50LCB0aGlzLnByb3BzLmZpZWxkLmluZGV4KTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gb25Nb3ZlVXA6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyAgIHZhciBwYXJlbnQgPSB0aGlzLnByb3BzLmZpZWxkLnBhcmVudDtcbiAgICAvLyAgIGlmICh0aGlzLnByb3BzLm9uTW92ZSkge1xuICAgIC8vICAgICB0aGlzLnByb3BzLm9uTW92ZSh0aGlzLnByb3BzLmZpZWxkLmluZGV4LCB0aGlzLnByb3BzLmZpZWxkLmluZGV4IC0gMSk7XG4gICAgLy8gICB9XG4gICAgLy8gICB0aGlzLnByb3BzLmZvcm0uYWN0aW9ucy5tb3ZlKHBhcmVudCwgdGhpcy5wcm9wcy5maWVsZC5pbmRleCwgdGhpcy5wcm9wcy5maWVsZC5pbmRleCAtIDEpO1xuICAgIC8vIH0sXG4gICAgLy9cbiAgICAvLyBvbk1vdmVEb3duOiBmdW5jdGlvbiAoKSB7XG4gICAgLy8gICB2YXIgcGFyZW50ID0gdGhpcy5wcm9wcy5maWVsZC5wYXJlbnQ7XG4gICAgLy8gICBpZiAodGhpcy5wcm9wcy5vbk1vdmUpIHtcbiAgICAvLyAgICAgdGhpcy5wcm9wcy5vbk1vdmUodGhpcy5wcm9wcy5maWVsZC5pbmRleCwgdGhpcy5wcm9wcy5maWVsZC5pbmRleCArIDEpO1xuICAgIC8vICAgfVxuICAgIC8vICAgdGhpcy5wcm9wcy5mb3JtLmFjdGlvbnMubW92ZShwYXJlbnQsIHRoaXMucHJvcHMuZmllbGQuaW5kZXgsIHRoaXMucHJvcHMuZmllbGQuaW5kZXggKyAxKTtcbiAgICAvLyB9LFxuICAgIC8vXG4gICAgLy8gb25Nb3VzZU92ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyAgIHRoaXMuc2V0U3RhdGUoe1xuICAgIC8vICAgICBtYXliZURlbGV0ZTogdHJ1ZVxuICAgIC8vICAgfSk7XG4gICAgLy8gfSxcbiAgICAvL1xuICAgIC8vIG9uTW91c2VPdXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyAgIHRoaXMuc2V0U3RhdGUoe1xuICAgIC8vICAgICBtYXliZURlbGV0ZTogZmFsc2VcbiAgICAvLyAgIH0pO1xuICAgIC8vIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICAgIC8vdmFyIHBhcmVudCA9IHRoaXMucHJvcHMucGFyZW50O1xuICAgICAgLy92YXIgaXRlbSA9IGZpZWxkLmZpZWxkO1xuICAgICAgLy92YXIgZm9ybSA9IHRoaXMucHJvcHMuZm9ybTtcblxuICAgICAgLy92YXIgY2xhc3NOYW1lID0gZm9ybWF0aWMuY2xhc3NOYW1lKCdsaXN0LWl0ZW0nLCBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZSwgZmllbGQuY2xhc3NOYW1lKTtcblxuICAgICAgLy8gdmFyIHZhbHVlQ2xhc3NOYW1lID0gZm9ybWF0aWMuY2xhc3NOYW1lKCdvYmplY3QtdmFsdWUnLCBwbHVnaW4uY29uZmlnLnZhbHVlX2NsYXNzTmFtZSwgZmllbGQudmFsdWVfY2xhc3NOYW1lKTtcbiAgICAgIC8vIHZhciBjb250cm9sQ2xhc3NOYW1lID0gZm9ybWF0aWMuY2xhc3NOYW1lKCdsaXN0LWNvbnRyb2wnLCBwbHVnaW4uY29uZmlnLmNvbnRyb2xfY2xhc3NOYW1lLCBmaWVsZC5jb250cm9sX2NsYXNzTmFtZSk7XG4gICAgICAvLyB2YXIgcmVtb3ZlQ2xhc3NOYW1lID0gZm9ybWF0aWMuY2xhc3NOYW1lKCdsaXN0LWNvbnRyb2wtcmVtb3ZlJywgcGx1Z2luLmNvbmZpZy5yZW1vdmVCdXR0b25fY2xhc3NOYW1lLCBmaWVsZC5yZW1vdmVCdXR0b25fY2xhc3NOYW1lKTtcbiAgICAgIC8vIHZhciB1cENsYXNzTmFtZSA9IGZvcm1hdGljLmNsYXNzTmFtZSgnbGlzdC1jb250cm9sLXVwJywgcGx1Z2luLmNvbmZpZy51cEJ1dHRvbl9jbGFzc05hbWUsIGZpZWxkLnVwQnV0dG9uX2NsYXNzTmFtZSk7XG4gICAgICAvLyB2YXIgZG93bkNsYXNzTmFtZSA9IGZvcm1hdGljLmNsYXNzTmFtZSgnbGlzdC1jb250cm9sLWRvd24nLCBwbHVnaW4uY29uZmlnLmRvd25CdXR0b25fY2xhc3NOYW1lLCBmaWVsZC5kb3duQnV0dG9uX2NsYXNzTmFtZSk7XG4gICAgICAvL1xuICAgICAgLy8gdmFyIHJlbW92ZUxhYmVsID0gcGx1Z2luLmNvbmZpZ1ZhbHVlKCdyZW1vdmVCdXR0b25fbGFiZWwnLCAnW3JlbW92ZV0nKTtcbiAgICAgIC8vIHZhciB1cExhYmVsID0gcGx1Z2luLmNvbmZpZ1ZhbHVlKCd1cEJ1dHRvbl9sYWJlbCcsICdbdXBdJyk7XG4gICAgICAvLyB2YXIgZG93bkxhYmVsID0gcGx1Z2luLmNvbmZpZ1ZhbHVlKCdkb3duQnV0dG9uX2xhYmVsJywgJ1tkb3duXScpO1xuICAgICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lfSxcbiAgICAgICAgcGx1Z2luLmNvbXBvbmVudCgnbGlzdC1pdGVtLXZhbHVlJykoe2Zvcm06IHRoaXMucHJvcHMuZm9ybSwgZmllbGQ6IGZpZWxkLCBpbmRleDogdGhpcy5wcm9wcy5pbmRleH0pLFxuICAgICAgICBwbHVnaW4uY29tcG9uZW50KCdsaXN0LWl0ZW0tY29udHJvbCcpKHtmaWVsZDogZmllbGQsIGluZGV4OiB0aGlzLnByb3BzLmluZGV4LCBudW1JdGVtczogdGhpcy5wcm9wcy5udW1JdGVtcywgb25Nb3ZlOiB0aGlzLnByb3BzLm9uTW92ZSwgb25SZW1vdmU6IHRoaXMucHJvcHMub25SZW1vdmV9KVxuICAgICAgICAvLyxcbiAgICAgICAgLy8gUi5kaXYoe2NsYXNzTmFtZTogY29udHJvbENsYXNzTmFtZX0sXG4gICAgICAgIC8vICAgUi5zcGFuKHtjbGFzc05hbWU6IHJlbW92ZUNsYXNzTmFtZSwgb25Nb3VzZU92ZXI6IHRoaXMub25Nb3VzZU92ZXIsIG9uTW91c2VPdXQ6IHRoaXMub25Nb3VzZU91dCwgb25DbGljazogdGhpcy5vbkRlbGV0ZX0sIHJlbW92ZUxhYmVsKSxcbiAgICAgICAgLy8gICB0aGlzLnByb3BzLmZpZWxkLmluZGV4ID4gMCA/IFIuc3Bhbih7Y2xhc3NOYW1lOiB1cENsYXNzTmFtZSwgb25DbGljazogdGhpcy5vbk1vdmVVcH0sIHVwTGFiZWwpIDogbnVsbCxcbiAgICAgICAgLy8gICB0aGlzLnByb3BzLmZpZWxkLmluZGV4IDwgKHRoaXMucHJvcHMuZmllbGQubnVtSXRlbXMgLSAxKSA/IFIuc3Bhbih7Y2xhc3NOYW1lOiBkb3duQ2xhc3NOYW1lLCBvbkNsaWNrOiB0aGlzLm9uTW92ZURvd259LCBkb3duTGFiZWwpIDogbnVsbFxuICAgICAgICAvLyApXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzLmNvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIG1peGluczogW3JlcXVpcmUoJy4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBuZXh0TG9va3VwSWQ6IDAsXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgLy8gTmVlZCB0byBjcmVhdGUgYXJ0aWZpY2lhbCBrZXlzIGZvciB0aGUgYXJyYXkuIEluZGV4ZXMgYXJlIG5vdCBnb29kIGtleXMsXG4gICAgICAvLyBzaW5jZSB0aGV5IGNoYW5nZS4gU28sIG1hcCBlYWNoIHBvc2l0aW9uIHRvIGFuIGFydGlmaWNpYWwga2V5XG4gICAgICB2YXIgbG9va3VwcyA9IFtdO1xuICAgICAgdGhpcy5wcm9wcy5maWVsZC5maWVsZHMoKS5mb3JFYWNoKGZ1bmN0aW9uIChmaWVsZCwgaSkge1xuICAgICAgICBsb29rdXBzW2ldID0gJ18nICsgdGhpcy5uZXh0TG9va3VwSWQ7XG4gICAgICAgIHRoaXMubmV4dExvb2t1cElkKys7XG4gICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBsb29rdXBzOiBsb29rdXBzXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV3UHJvcHMpIHtcblxuICAgICAgdmFyIGxvb2t1cHMgPSB0aGlzLnN0YXRlLmxvb2t1cHM7XG4gICAgICB2YXIgZmllbGRzID0gbmV3UHJvcHMuZmllbGQuZmllbGRzKCk7XG5cbiAgICAgIC8vIE5lZWQgdG8gc2V0IGFydGlmaWNpYWwga2V5cyBmb3IgbmV3IGFycmF5IGl0ZW1zLlxuICAgICAgaWYgKGZpZWxkcy5sZW5ndGggPiBsb29rdXBzLmxlbmd0aCkge1xuICAgICAgICBmb3IgKHZhciBpID0gbG9va3Vwcy5sZW5ndGg7IGkgPCBmaWVsZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBsb29rdXBzW2ldID0gJ18nICsgdGhpcy5uZXh0TG9va3VwSWQ7XG4gICAgICAgICAgdGhpcy5uZXh0TG9va3VwSWQrKztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgbG9va3VwczogbG9va3Vwc1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIG9uQXBwZW5kOiBmdW5jdGlvbiAoaXRlbUluZGV4KSB7XG4gICAgICB0aGlzLnByb3BzLmZpZWxkLmFwcGVuZChpdGVtSW5kZXgpO1xuICAgIC8vICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcbiAgICAvLyAgIHZhciBpdGVtID0gbnVsbDtcbiAgICAvLyAgIGlmICh0aGlzLnJlZnMudHlwZVNlbGVjdCkge1xuICAgIC8vICAgICB2YXIgaW5kZXggPSBwYXJzZUludCh0aGlzLnJlZnMudHlwZVNlbGVjdC5nZXRET01Ob2RlKCkudmFsdWUpO1xuICAgIC8vICAgICBpdGVtID0gZmllbGQuaXRlbVR5cGVzW2luZGV4XS5pdGVtO1xuICAgIC8vICAgfVxuICAgIC8vICAgdGhpcy5wcm9wcy5mb3JtLmFjdGlvbnMuaW5zZXJ0KHRoaXMucHJvcHMuZmllbGQsIG51bGwsIGl0ZW0pO1xuICAgIC8vICAgaWYgKHRoaXMucHJvcHMuZmllbGQuY29sbGFwc2FibGVJdGVtcykge1xuICAgIC8vICAgICAvLyB2YXIgY29sbGFwc2VkID0gdGhpcy5wcm9wcy5maWVsZC5maWVsZHMubWFwKGZ1bmN0aW9uICgpIHtcbiAgICAvLyAgICAgLy8gICByZXR1cm4gdHJ1ZTtcbiAgICAvLyAgICAgLy8gfS5iaW5kKHRoaXMpKTtcbiAgICAvLyAgICAgdmFyIGNvbGxhcHNlZCA9IHRoaXMuc3RhdGUuY29sbGFwc2VkO1xuICAgIC8vICAgICBjb2xsYXBzZWQgPSBjb2xsYXBzZWQuY29uY2F0KGZhbHNlKTtcbiAgICAvLyAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgLy8gICAgICAgY29sbGFwc2VkOiBjb2xsYXBzZWRcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gICB9XG4gICAgfSxcbiAgICAvL1xuICAgIC8vIG9uQ2xpY2tMYWJlbDogZnVuY3Rpb24gKGkpIHtcbiAgICAvLyAgIGlmICh0aGlzLnByb3BzLmZpZWxkLmNvbGxhcHNhYmxlSXRlbXMpIHtcbiAgICAvLyAgICAgdmFyIGNvbGxhcHNlZDtcbiAgICAvLyAgICAgLy8gaWYgKCF0aGlzLnN0YXRlLmNvbGxhcHNlZFtpXSkge1xuICAgIC8vICAgICAvLyAgIGNvbGxhcHNlZCA9IHRoaXMuc3RhdGUuY29sbGFwc2VkO1xuICAgIC8vICAgICAvLyAgIGNvbGxhcHNlZFtpXSA9IHRydWU7XG4gICAgLy8gICAgIC8vICAgdGhpcy5zZXRTdGF0ZSh7Y29sbGFwc2VkOiBjb2xsYXBzZWR9KTtcbiAgICAvLyAgICAgLy8gfSBlbHNlIHtcbiAgICAvLyAgICAgLy8gICBjb2xsYXBzZWQgPSB0aGlzLnByb3BzLmZpZWxkLmZpZWxkcy5tYXAoZnVuY3Rpb24gKCkge1xuICAgIC8vICAgICAvLyAgICAgcmV0dXJuIHRydWU7XG4gICAgLy8gICAgIC8vICAgfSk7XG4gICAgLy8gICAgIC8vICAgY29sbGFwc2VkW2ldID0gZmFsc2U7XG4gICAgLy8gICAgIC8vICAgdGhpcy5zZXRTdGF0ZSh7Y29sbGFwc2VkOiBjb2xsYXBzZWR9KTtcbiAgICAvLyAgICAgLy8gfVxuICAgIC8vICAgICBjb2xsYXBzZWQgPSB0aGlzLnN0YXRlLmNvbGxhcHNlZDtcbiAgICAvLyAgICAgY29sbGFwc2VkW2ldID0gIWNvbGxhcHNlZFtpXTtcbiAgICAvLyAgICAgdGhpcy5zZXRTdGF0ZSh7Y29sbGFwc2VkOiBjb2xsYXBzZWR9KTtcbiAgICAvLyAgIH1cbiAgICAvLyB9LFxuICAgIC8vXG4gICAgb25SZW1vdmU6IGZ1bmN0aW9uIChpKSB7XG4gICAgICB2YXIgbG9va3VwcyA9IHRoaXMuc3RhdGUubG9va3VwcztcbiAgICAgIGxvb2t1cHMuc3BsaWNlKGksIDEpO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGxvb2t1cHM6IGxvb2t1cHNcbiAgICAgIH0pO1xuICAgICAgdGhpcy5wcm9wcy5maWVsZC5yZW1vdmUoaSk7XG4gICAgfSxcbiAgICAvL1xuICAgIG9uTW92ZTogZnVuY3Rpb24gKGZyb21JbmRleCwgdG9JbmRleCkge1xuICAgICAgdmFyIGxvb2t1cHMgPSB0aGlzLnN0YXRlLmxvb2t1cHM7XG4gICAgICB2YXIgZnJvbUlkID0gbG9va3Vwc1tmcm9tSW5kZXhdO1xuICAgICAgdmFyIHRvSWQgPSBsb29rdXBzW3RvSW5kZXhdO1xuICAgICAgbG9va3Vwc1tmcm9tSW5kZXhdID0gdG9JZDtcbiAgICAgIGxvb2t1cHNbdG9JbmRleF0gPSBmcm9tSWQ7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgbG9va3VwczogbG9va3Vwc1xuICAgICAgfSk7XG4gICAgICB0aGlzLnByb3BzLmZpZWxkLm1vdmUoZnJvbUluZGV4LCB0b0luZGV4KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG4gICAgICB2YXIgZmllbGRzID0gZmllbGQuZmllbGRzKCk7XG5cbiAgICAgIHZhciBudW1JdGVtcyA9IGZpZWxkcy5sZW5ndGg7XG5cbiAgICAgIHJldHVybiBwbHVnaW4uY29tcG9uZW50KCdmaWVsZCcpKHtcbiAgICAgICAgZmllbGQ6IGZpZWxkXG4gICAgICB9LFxuICAgICAgICBSLmRpdih7Y2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZX0sXG4gICAgICAgICAgUmVhY3QuYWRkb25zLkNTU1RyYW5zaXRpb25Hcm91cCh7dHJhbnNpdGlvbk5hbWU6ICdyZXZlYWwnfSxcbiAgICAgICAgICAgIGZpZWxkcy5tYXAoZnVuY3Rpb24gKGNoaWxkLCBpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBwbHVnaW4uY29tcG9uZW50KCdsaXN0LWl0ZW0nKSh7XG4gICAgICAgICAgICAgICAga2V5OiB0aGlzLnN0YXRlLmxvb2t1cHNbaV0sXG4gICAgICAgICAgICAgICAgZm9ybTogdGhpcy5wcm9wcy5mb3JtLFxuICAgICAgICAgICAgICAgIGZpZWxkOiBjaGlsZCxcbiAgICAgICAgICAgICAgICBwYXJlbnQ6IGZpZWxkLFxuICAgICAgICAgICAgICAgIGluZGV4OiBpLFxuICAgICAgICAgICAgICAgIG51bUl0ZW1zOiBudW1JdGVtcyxcbiAgICAgICAgICAgICAgICBvbk1vdmU6IHRoaXMub25Nb3ZlLFxuICAgICAgICAgICAgICAgIG9uUmVtb3ZlOiB0aGlzLm9uUmVtb3ZlXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICAgICksXG4gICAgICAgICAgcGx1Z2luLmNvbXBvbmVudCgnbGlzdC1jb250cm9sJykoe2ZpZWxkOiBmaWVsZCwgb25BcHBlbmQ6IHRoaXMub25BcHBlbmR9KVxuICAgICAgICApXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGxvYWROZWVkZWRNZXRhOiBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICBpZiAocHJvcHMuZmllbGQgJiYgcHJvcHMuZmllbGQuZm9ybSkge1xuICAgICAgaWYgKHByb3BzLmZpZWxkLmRlZi5uZWVkc01ldGEgJiYgcHJvcHMuZmllbGQuZGVmLm5lZWRzTWV0YS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHByb3BzLmZpZWxkLmRlZi5uZWVkc01ldGEuZm9yRWFjaChmdW5jdGlvbiAoa2V5cykge1xuICAgICAgICAgIGlmIChrZXlzKSB7XG4gICAgICAgICAgICBwcm9wcy5maWVsZC5mb3JtLmxvYWRNZXRhKGtleXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5sb2FkTmVlZGVkTWV0YSh0aGlzLnByb3BzKTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV4dFByb3BzKSB7XG4gICAgdGhpcy5sb2FkTmVlZGVkTWV0YShuZXh0UHJvcHMpO1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMucHJvcHMuZmllbGQpIHtcbiAgICAgIHRoaXMucHJvcHMuZmllbGQuZXJhc2UoKTtcbiAgICB9XG4gIH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMub25SZXNpemVXaW5kb3cpIHtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLm9uUmVzaXplV2luZG93KTtcbiAgICB9XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5vblJlc2l6ZVdpbmRvdykge1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMub25SZXNpemVXaW5kb3cpO1xuICAgIH1cbiAgfVxufTtcbiIsIi8vIGh0dHA6Ly9wcm9tZXRoZXVzcmVzZWFyY2guZ2l0aHViLmlvL3JlYWN0LWZvcm1zL2V4YW1wbGVzL3VuZG8uaHRtbFxuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBVbmRvU3RhY2sgPSB7XG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHt1bmRvOiBbXSwgcmVkbzogW119O1xuICB9LFxuXG4gIHNuYXBzaG90OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdW5kbyA9IHRoaXMuc3RhdGUudW5kby5jb25jYXQodGhpcy5nZXRTdGF0ZVNuYXBzaG90KCkpO1xuICAgIGlmICh0eXBlb2YgdGhpcy5zdGF0ZS51bmRvRGVwdGggPT09ICdudW1iZXInKSB7XG4gICAgICBpZiAodW5kby5sZW5ndGggPiB0aGlzLnN0YXRlLnVuZG9EZXB0aCkge1xuICAgICAgICB1bmRvLnNoaWZ0KCk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuc2V0U3RhdGUoe3VuZG86IHVuZG8sIHJlZG86IFtdfSk7XG4gIH0sXG5cbiAgaGFzVW5kbzogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUudW5kby5sZW5ndGggPiAwO1xuICB9LFxuXG4gIGhhc1JlZG86IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnJlZG8ubGVuZ3RoID4gMDtcbiAgfSxcblxuICByZWRvOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl91bmRvSW1wbCh0cnVlKTtcbiAgfSxcblxuICB1bmRvOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl91bmRvSW1wbCgpO1xuICB9LFxuXG4gIF91bmRvSW1wbDogZnVuY3Rpb24oaXNSZWRvKSB7XG4gICAgdmFyIHVuZG8gPSB0aGlzLnN0YXRlLnVuZG8uc2xpY2UoMCk7XG4gICAgdmFyIHJlZG8gPSB0aGlzLnN0YXRlLnJlZG8uc2xpY2UoMCk7XG4gICAgdmFyIHNuYXBzaG90O1xuXG4gICAgaWYgKGlzUmVkbykge1xuICAgICAgaWYgKHJlZG8ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHNuYXBzaG90ID0gcmVkby5wb3AoKTtcbiAgICAgIHVuZG8ucHVzaCh0aGlzLmdldFN0YXRlU25hcHNob3QoKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh1bmRvLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBzbmFwc2hvdCA9IHVuZG8ucG9wKCk7XG4gICAgICByZWRvLnB1c2godGhpcy5nZXRTdGF0ZVNuYXBzaG90KCkpO1xuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGVTbmFwc2hvdChzbmFwc2hvdCk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7dW5kbzp1bmRvLCByZWRvOnJlZG99KTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBVbmRvU3RhY2s7XG4iLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzLmNvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZSxcbiAgICAgICAgbGFiZWw6IHBsdWdpbi5jb25maWdWYWx1ZSgnbGFiZWwnLCAnW3VwXScpXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBSLnNwYW4oe2NsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWUsIG9uQ2xpY2s6IHRoaXMucHJvcHMub25DbGlja30sIHRoaXMucHJvcHMubGFiZWwpO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LlJlYWN0IDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5SZWFjdCA6IG51bGwpO1xudmFyIFIgPSBSZWFjdC5ET007XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzLmNvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZSxcbiAgICAgICAgbGFiZWw6IHBsdWdpbi5jb25maWdWYWx1ZSgnbGFiZWwnLCAnW2Rvd25dJylcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIFIuc3Bhbih7Y2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZSwgb25DbGljazogdGhpcy5wcm9wcy5vbkNsaWNrfSwgdGhpcy5wcm9wcy5sYWJlbCk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xudmFyIFJlc2l6YWJsZSA9IHJlcXVpcmUoJ3JlYWN0LWNvbXBvbmVudC1yZXNpemFibGUnKTtcblxudmFyIG5vQnJlYWsgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoLyAvZywgJ1xcdTAwYTAnKTtcbn07XG5cbnZhciBMRUZUX1BBRCA9ICdcXHUwMGEwXFx1MDBhMCc7XG52YXIgUklHSFRfUEFEID0gJ1xcdTAwYTBcXHUwMGEwJztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgdmFyIHV0aWwgPSBwbHVnaW4ucmVxdWlyZSgndXRpbCcpO1xuXG4gIHBsdWdpbi5leHBvcnRzLmNvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIG1peGluczogW3JlcXVpcmUoJy4vbWl4aW5zL3VuZG8tc3RhY2snKSwgcmVxdWlyZSgnLi9taXhpbnMvcmVzaXplJyldLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciB2YWx1ZSA9IHRoaXMucHJvcHMuZmllbGQudmFsdWUgfHwgJyc7XG4gICAgICB2YXIgcGFydHMgPSB1dGlsLnBhcnNlVGV4dFdpdGhUYWdzKHZhbHVlKTtcbiAgICAgIHZhciB0b2tlbnMgPSB0aGlzLnRva2VucyhwYXJ0cyk7XG4gICAgICB2YXIgaW5kZXhNYXAgPSB0aGlzLmluZGV4TWFwKHRva2Vucyk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRva2VuczogdG9rZW5zLFxuICAgICAgICBpbmRleE1hcDogaW5kZXhNYXAsXG4gICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgcGxhaW5WYWx1ZTogdGhpcy5wbGFpblZhbHVlKHZhbHVlKSxcbiAgICAgICAgcG9zOiBpbmRleE1hcC5sZW5ndGgsXG4gICAgICAgIHJhbmdlOiAwLFxuICAgICAgICB1bmRvRGVwdGg6IDEwMFxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgZ2V0U3RhdGVTbmFwc2hvdDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdmFsdWU6IHRoaXMuc3RhdGUudmFsdWUsXG4gICAgICAgIHBvczogdGhpcy5zdGF0ZS5wb3NcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHNldFN0YXRlU25hcHNob3Q6IGZ1bmN0aW9uIChzbmFwc2hvdCkge1xuICAgICAgdGhpcy5wcm9wcy5maWVsZC52YWwoc25hcHNob3QudmFsdWUpO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHBvczogc25hcHNob3QucG9zXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICB2YXIgdmFsdWUgPSBwcm9wcy5maWVsZC52YWx1ZSB8fCAnJztcbiAgICAgIHZhciBwYXJ0cyA9IHV0aWwucGFyc2VUZXh0V2l0aFRhZ3ModmFsdWUpO1xuICAgICAgdmFyIHRva2VucyA9IHRoaXMudG9rZW5zKHBhcnRzKTtcbiAgICAgIHZhciBpbmRleE1hcCA9IHRoaXMuaW5kZXhNYXAodG9rZW5zKTtcblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgcGxhaW5WYWx1ZTogdGhpcy5wbGFpblZhbHVlKHZhbHVlKSxcbiAgICAgICAgdG9rZW5zOiB0b2tlbnMsXG4gICAgICAgIGluZGV4TWFwOiBpbmRleE1hcFxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8vIFR1cm4gaW50byBpbmRpdmlkdWFsIGNoYXJhY3RlcnMgYW5kIHRhZ3NcbiAgICB0b2tlbnM6IGZ1bmN0aW9uIChwYXJ0cykge1xuICAgICAgcmV0dXJuIFtdLmNvbmNhdC5hcHBseShbXSwgcGFydHMubWFwKGZ1bmN0aW9uIChwYXJ0KSB7XG4gICAgICAgIGlmIChwYXJ0LnR5cGUgPT09ICd0YWcnKSB7XG4gICAgICAgICAgcmV0dXJuIHBhcnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHBhcnQudmFsdWUuc3BsaXQoJycpO1xuICAgICAgICB9XG4gICAgICB9KSk7XG4gICAgfSxcblxuICAgIC8vIE1hcCBlYWNoIHRleHRhcmVhIGluZGV4IGJhY2sgdG8gYSB0b2tlblxuICAgIGluZGV4TWFwOiBmdW5jdGlvbiAodG9rZW5zKSB7XG4gICAgICB2YXIgaW5kZXhNYXAgPSBbXTtcbiAgICAgIF8uZWFjaCh0b2tlbnMsIGZ1bmN0aW9uICh0b2tlbiwgdG9rZW5JbmRleCkge1xuICAgICAgICBpZiAodG9rZW4udHlwZSA9PT0gJ3RhZycpIHtcbiAgICAgICAgICB2YXIgbGFiZWwgPSBMRUZUX1BBRCArIG5vQnJlYWsodGhpcy5wcmV0dHlMYWJlbCh0b2tlbi52YWx1ZSkpICsgUklHSFRfUEFEO1xuICAgICAgICAgIHZhciBsYWJlbENoYXJzID0gbGFiZWwuc3BsaXQoJycpO1xuICAgICAgICAgIF8uZWFjaChsYWJlbENoYXJzLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpbmRleE1hcC5wdXNoKHRva2VuSW5kZXgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGluZGV4TWFwLnB1c2godG9rZW5JbmRleCk7XG4gICAgICAgIH1cbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICByZXR1cm4gaW5kZXhNYXA7XG4gICAgfSxcblxuICAgIC8vIE1ha2UgaGlnaGxpZ2h0IHNjcm9sbCBtYXRjaCB0ZXh0YXJlYSBzY3JvbGxcbiAgICBvblNjcm9sbDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5yZWZzLmhpZ2hsaWdodC5nZXRET01Ob2RlKCkuc2Nyb2xsVG9wID0gdGhpcy5yZWZzLmNvbnRlbnQuZ2V0RE9NTm9kZSgpLnNjcm9sbFRvcDtcbiAgICAgIHRoaXMucmVmcy5oaWdobGlnaHQuZ2V0RE9NTm9kZSgpLnNjcm9sbExlZnQgPSB0aGlzLnJlZnMuY29udGVudC5nZXRET01Ob2RlKCkuc2Nyb2xsTGVmdDtcbiAgICB9LFxuXG4gICAgLy8gR2l2ZW4gc29tZSBwb3N0aW9uLCByZXR1cm4gdGhlIHRva2VuIGluZGV4IChwb3NpdGlvbiBjb3VsZCBiZSBpbiB0aGUgbWlkZGxlIG9mIGEgdG9rZW4pXG4gICAgdG9rZW5JbmRleDogZnVuY3Rpb24gKHBvcywgdG9rZW5zLCBpbmRleE1hcCkge1xuICAgICAgdG9rZW5zID0gdG9rZW5zIHx8IHRoaXMuc3RhdGUudG9rZW5zO1xuICAgICAgaW5kZXhNYXAgPSBpbmRleE1hcCB8fCB0aGlzLnN0YXRlLmluZGV4TWFwO1xuICAgICAgaWYgKHBvcyA8IDApIHtcbiAgICAgICAgcG9zID0gMDtcbiAgICAgIH0gZWxzZSBpZiAocG9zID49IGluZGV4TWFwLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gdG9rZW5zLmxlbmd0aDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpbmRleE1hcFtwb3NdO1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGV2ZW50KSB7XG5cbiAgICAgIC8vY29uc29sZS5sb2coJ2NoYW5nZScpO1xuICAgICAgLy9jb25zb2xlLmxvZyhldmVudCk7XG5cbiAgICAgIHZhciBub2RlID0gdGhpcy5yZWZzLmNvbnRlbnQuZ2V0RE9NTm9kZSgpO1xuXG4gICAgICB2YXIgcHJldlBvcyA9IHRoaXMuc3RhdGUucG9zO1xuICAgICAgdmFyIHByZXZSYW5nZSA9IHRoaXMuc3RhdGUucmFuZ2U7XG4gICAgICB2YXIgcG9zID0gbm9kZS5zZWxlY3Rpb25TdGFydDtcblxuICAgICAgdmFyIHRva2VucyA9IHRoaXMuc3RhdGUudG9rZW5zO1xuICAgICAgdmFyIHJlYWxQcmV2SW5kZXggPSB0aGlzLnRva2VuSW5kZXgocHJldlBvcyk7XG4gICAgICB2YXIgcmVhbFByZXZFbmRJbmRleCA9IHRoaXMudG9rZW5JbmRleChwcmV2UG9zICsgcHJldlJhbmdlKTtcbiAgICAgIHZhciByZWFsUHJldlJhbmdlID0gcmVhbFByZXZFbmRJbmRleCAtIHJlYWxQcmV2SW5kZXg7XG5cbiAgICAgIC8vY29uc29sZS5sb2cocHJldlBvcyArICcsJyArIHByZXZSYW5nZSArICcsJyArIHBvcyk7XG4gICAgICAvL2NvbnNvbGUubG9nKHJlYWxQcmV2SW5kZXggKyAnLCcgKyByZWFsUHJldkVuZEluZGV4ICsgJywnICsgcmVhbFByZXZSYW5nZSk7XG4gICAgICAvL2NvbnNvbGUubG9nKG5vZGUudmFsdWUpO1xuXG4gICAgICBpZiAocmVhbFByZXZSYW5nZSA+IDApIHtcbiAgICAgICAgdG9rZW5zLnNwbGljZShyZWFsUHJldkluZGV4LCByZWFsUHJldlJhbmdlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHBvcyA+IHByZXZQb3MpIHtcbiAgICAgICAgdmFyIGFkZGVkVGV4dCA9IG5vZGUudmFsdWUuc3Vic3RyaW5nKHByZXZQb3MsIHBvcyk7XG4gICAgICAgIHRva2Vucy5zcGxpY2UocmVhbFByZXZJbmRleCwgMCwgYWRkZWRUZXh0KTtcbiAgICAgIH0gZWxzZSBpZiAoKG5vZGUudmFsdWUubGVuZ3RoICsgMSkgPT09IHRoaXMuc3RhdGUucGxhaW5WYWx1ZS5sZW5ndGgpIHtcbiAgICAgICAgdmFyIHRva2VuID0gdGhpcy50b2tlbkF0KHBvcyk7XG4gICAgICAgIHZhciB0b2tlbkJlZm9yZSA9IHRoaXMudG9rZW5CZWZvcmUocG9zKTtcbiAgICAgICAgaWYgKHRva2VuID09PSB0b2tlbkJlZm9yZSkge1xuICAgICAgICAgIHBvcyA9IHRoaXMubW92ZU9mZlRhZyhwb3MsIHRva2VucywgdGhpcy5pbmRleE1hcCh0b2tlbnMpLCAtMSk7XG4gICAgICAgIH1cbiAgICAgICAgdG9rZW5zLnNwbGljZShyZWFsUHJldkluZGV4IC0gMSwgMSk7XG4gICAgICAgIG5vZGUuc2V0U2VsZWN0aW9uUmFuZ2UocG9zLCBwb3MpO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmF3VmFsdWUgPSB0aGlzLnJhd1ZhbHVlKHRva2Vucyk7XG5cbiAgICAgIHRoaXMucHJvcHMuZmllbGQudmFsKHJhd1ZhbHVlKTtcblxuICAgICAgdGhpcy5zbmFwc2hvdCgpO1xuXG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgcmFuZ2U6IDAsXG4gICAgICAgIHBvczogcG9zXG4gICAgICB9KTtcbiAgICB9LFxuICAgIC8vXG4gICAgY29tcG9uZW50RGlkVXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCA9PT0gdGhpcy5yZWZzLmNvbnRlbnQuZ2V0RE9NTm9kZSgpKSB7XG4gICAgICAvLyAgIHRoaXMucmVmcy5jb250ZW50LmdldERPTU5vZGUoKS5zZXRTZWxlY3Rpb25SYW5nZSh0aGlzLnN0YXRlLnBvcywgdGhpcy5zdGF0ZS5wb3MgKyB0aGlzLnN0YXRlLnJhbmdlKTtcbiAgICAgICAgdGhpcy5yZWZzLmNvbnRlbnQuZ2V0RE9NTm9kZSgpLnNldFNlbGVjdGlvblJhbmdlKHRoaXMuc3RhdGUucG9zLCB0aGlzLnN0YXRlLnBvcyArIHRoaXMuc3RhdGUucmFuZ2UpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBwcmV0dHlMYWJlbDogZnVuY3Rpb24gKGtleSkge1xuICAgICAgaWYgKHRoaXMucHJvcHMuZmllbGQuZGVmLnJlcGxhY2VUYWdzW2tleV0pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMuZmllbGQuZGVmLnJlcGxhY2VUYWdzW2tleV07XG4gICAgICB9XG4gICAgICByZXR1cm4gdXRpbC5odW1hbml6ZShrZXkpO1xuICAgIH0sXG5cbiAgICBwbGFpblZhbHVlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHZhciBwYXJ0cyA9IHV0aWwucGFyc2VUZXh0V2l0aFRhZ3ModmFsdWUpO1xuICAgICAgcmV0dXJuIHBhcnRzLm1hcChmdW5jdGlvbiAocGFydCkge1xuICAgICAgICBpZiAocGFydC50eXBlID09PSAndGV4dCcpIHtcbiAgICAgICAgICByZXR1cm4gcGFydC52YWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gTEVGVF9QQUQgKyBub0JyZWFrKHRoaXMucHJldHR5TGFiZWwocGFydC52YWx1ZSkpICsgUklHSFRfUEFEO1xuICAgICAgICB9XG4gICAgICB9LmJpbmQodGhpcykpLmpvaW4oJycpO1xuICAgIH0sXG5cbiAgICBwcmV0dHlWYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB2YXIgcGFydHMgPSB1dGlsLnBhcnNlVGV4dFdpdGhUYWdzKHZhbHVlKTtcbiAgICAgIHJldHVybiBwYXJ0cy5tYXAoZnVuY3Rpb24gKHBhcnQsIGkpIHtcbiAgICAgICAgaWYgKHBhcnQudHlwZSA9PT0gJ3RleHQnKSB7XG4gICAgICAgICAgaWYgKGkgPT09IChwYXJ0cy5sZW5ndGggLSAxKSkge1xuICAgICAgICAgICAgaWYgKHBhcnQudmFsdWVbcGFydC52YWx1ZS5sZW5ndGggLSAxXSA9PT0gJ1xcbicpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHBhcnQudmFsdWUgKyAnXFx1MDBhMCc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBwYXJ0LnZhbHVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBSLnNwYW4oe2NsYXNzTmFtZTogJ3ByZXR0eS1wYXJ0J30sXG4gICAgICAgICAgICBSLnNwYW4oe2NsYXNzTmFtZTogJ3ByZXR0eS1wYXJ0LWxlZnQnfSwgTEVGVF9QQUQpLFxuICAgICAgICAgICAgUi5zcGFuKHtjbGFzc05hbWU6ICdwcmV0dHktcGFydC10ZXh0J30sIG5vQnJlYWsodGhpcy5wcmV0dHlMYWJlbChwYXJ0LnZhbHVlKSkpLFxuICAgICAgICAgICAgUi5zcGFuKHtjbGFzc05hbWU6ICdwcmV0dHktcGFydC1yaWdodCd9LCBSSUdIVF9QQUQpXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuXG4gICAgcmF3VmFsdWU6IGZ1bmN0aW9uICh0b2tlbnMpIHtcbiAgICAgIHJldHVybiB0b2tlbnMubWFwKGZ1bmN0aW9uICh0b2tlbikge1xuICAgICAgICBpZiAodG9rZW4udHlwZSA9PT0gJ3RhZycpIHtcbiAgICAgICAgICByZXR1cm4gJ3t7JyArIHRva2VuLnZhbHVlICsgJ319JztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICAgIH1cbiAgICAgIH0pLmpvaW4oJycpO1xuICAgIH0sXG5cbiAgICBtb3ZlT2ZmVGFnOiBmdW5jdGlvbiAocG9zLCB0b2tlbnMsIGluZGV4TWFwLCBkaXIpIHtcbiAgICAgIGlmICh0eXBlb2YgZGlyID09PSAndW5kZWZpbmVkJyB8fCBkaXIgPiAwKSB7XG4gICAgICAgIGRpciA9IDE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkaXIgPSAtMTtcbiAgICAgIH1cbiAgICAgIHZhciB0b2tlbjtcbiAgICAgIGlmIChkaXIgPiAwKSB7XG4gICAgICAgIHRva2VuID0gdG9rZW5zW2luZGV4TWFwW3Bvc11dO1xuICAgICAgICB3aGlsZSAocG9zIDwgaW5kZXhNYXAubGVuZ3RoICYmIHRva2Vuc1tpbmRleE1hcFtwb3NdXS50eXBlID09PSAndGFnJyAmJiB0b2tlbnNbaW5kZXhNYXBbcG9zXV0gPT09IHRva2VuKSB7XG4gICAgICAgICAgcG9zKys7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRva2VuID0gdG9rZW5zW2luZGV4TWFwW3BvcyAtIDFdXTtcbiAgICAgICAgd2hpbGUgKHBvcyA+IDAgJiYgdG9rZW5zW2luZGV4TWFwW3BvcyAtIDFdXS50eXBlID09PSAndGFnJyAmJiB0b2tlbnNbaW5kZXhNYXBbcG9zIC0gMV1dID09PSB0b2tlbikge1xuICAgICAgICAgIHBvcy0tO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwb3M7XG4gICAgfSxcblxuICAgIHRva2VuQXQ6IGZ1bmN0aW9uIChwb3MpIHtcbiAgICAgIGlmIChwb3MgPj0gdGhpcy5zdGF0ZS5pbmRleE1hcC5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICBpZiAocG9zIDwgMCkge1xuICAgICAgICBwb3MgPSAwO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuc3RhdGUudG9rZW5zW3RoaXMuc3RhdGUuaW5kZXhNYXBbcG9zXV07XG4gICAgfSxcblxuICAgIHRva2VuQmVmb3JlOiBmdW5jdGlvbiAocG9zKSB7XG4gICAgICBpZiAocG9zID49IHRoaXMuc3RhdGUuaW5kZXhNYXAubGVuZ3RoKSB7XG4gICAgICAgIHBvcyA9IHRoaXMuc3RhdGUuaW5kZXhNYXAubGVuZ3RoO1xuICAgICAgfVxuICAgICAgaWYgKHBvcyA8PSAwKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuc3RhdGUudG9rZW5zW3RoaXMuc3RhdGUuaW5kZXhNYXBbcG9zIC0gMV1dO1xuICAgIH0sXG5cbiAgICBub3JtYWxpemVQb3NpdGlvbjogZnVuY3Rpb24gKHBvcywgc2VsZWN0RGlyKSB7XG4gICAgICAvLyBBdCBzdGFydCBvciBlbmQsIHNvIG9rYXkuXG4gICAgICBpZiAocG9zIDw9IDAgfHwgcG9zID49IHRoaXMuc3RhdGUuaW5kZXhNYXAubGVuZ3RoKSB7XG4gICAgICAgIGlmIChwb3MgPCAwKSB7XG4gICAgICAgICAgcG9zID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAocG9zID4gdGhpcy5zdGF0ZS5pbmRleE1hcC5sZW5ndGgpIHtcbiAgICAgICAgICBwb3MgPSB0aGlzLnN0YXRlLmluZGV4TWFwLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcG9zO1xuICAgICAgfVxuXG4gICAgICB2YXIgdG9rZW4gPSB0aGlzLnRva2VuQXQocG9zKTtcbiAgICAgIHZhciB0b2tlbkJlZm9yZSA9IHRoaXMudG9rZW5CZWZvcmUocG9zKTtcblxuICAgICAgLy8gQmV0d2VlbiB0d28gdG9rZW5zLCBzbyBva2F5LlxuICAgICAgaWYgKHRva2VuICE9PSB0b2tlbkJlZm9yZSkge1xuICAgICAgICByZXR1cm4gcG9zO1xuICAgICAgfVxuXG4gICAgICB2YXIgcHJldlRva2VuID0gdGhpcy50b2tlbkF0KHRoaXMuc3RhdGUucG9zKTtcbiAgICAgIHZhciBwcmV2VG9rZW5CZWZvcmUgPSB0aGlzLnRva2VuQmVmb3JlKHRoaXMuc3RhdGUucG9zKTtcblxuICAgICAgdmFyIHJpZ2h0UG9zID0gdGhpcy5tb3ZlT2ZmVGFnKHBvcywgdGhpcy5zdGF0ZS50b2tlbnMsIHRoaXMuc3RhdGUuaW5kZXhNYXApO1xuICAgICAgdmFyIGxlZnRQb3MgPSB0aGlzLm1vdmVPZmZUYWcocG9zLCB0aGlzLnN0YXRlLnRva2VucywgdGhpcy5zdGF0ZS5pbmRleE1hcCwgLTEpO1xuXG4gICAgICBpZiAocHJldlRva2VuICE9PSBwcmV2VG9rZW5CZWZvcmUpIHtcbiAgICAgICAgLy8gTW92ZWQgZnJvbSBsZWZ0IGVkZ2UuXG4gICAgICAgIGlmIChwcmV2VG9rZW4gPT09IHRva2VuKSB7XG4gICAgICAgICAgcmV0dXJuIHJpZ2h0UG9zO1xuICAgICAgICB9XG4gICAgICAgIC8vIE1vdmVkIGZyb20gcmlnaHQgZWRnZS5cbiAgICAgICAgaWYgKHByZXZUb2tlbkJlZm9yZSA9PT0gdG9rZW4pIHtcbiAgICAgICAgICByZXR1cm4gbGVmdFBvcztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgbmV3UG9zID0gcmlnaHRQb3M7XG4gICAgICBpZiAodHlwZW9mIHNlbGVjdERpciA9PT0gJ3VuZGVmaW5lZCcgfHwgc2VsZWN0RGlyID09PSAtMSkge1xuICAgICAgICBpZiAocmlnaHRQb3MgLSBwb3MgPiBwb3MgLSBsZWZ0UG9zKSB7XG4gICAgICAgICAgbmV3UG9zID0gbGVmdFBvcztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG5ld1BvcztcbiAgICB9LFxuXG4gICAgb25TZWxlY3Q6IGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vY29uc29sZS5sb2coJ3NlbGVjdCcpO1xuICAgICAgdmFyIG5vZGUgPSB0aGlzLnJlZnMuY29udGVudC5nZXRET01Ob2RlKCk7XG5cbiAgICAgIHZhciBzdGFydCA9IG5vZGUuc2VsZWN0aW9uU3RhcnQ7XG4gICAgICB2YXIgcG9zID0gdGhpcy5ub3JtYWxpemVQb3NpdGlvbihzdGFydCk7XG5cblxuICAgICAgdmFyIGVuZCA9IG5vZGUuc2VsZWN0aW9uRW5kO1xuICAgICAgdmFyIHJhbmdlID0gMDtcbiAgICAgIC8vY29uc29sZS5sb2coc3RhcnQgKyAnLCcgKyBwb3MgKyAnLCcgKyBlbmQgKyAnLCcgKyByYW5nZSk7XG4gICAgICAvL2NvbnNvbGUubG9nKG5vZGUudmFsdWUpO1xuXG4gICAgICBpZiAobm9kZS52YWx1ZSAhPT0gdGhpcy5zdGF0ZS52YWx1ZSkge1xuICAgICAgICAvL2NvbnNvbGUubG9nKG5vZGUudmFsdWUgKyAnICE9ICcgKyB0aGlzLnN0YXRlLnZhbHVlKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoZW5kID4gc3RhcnQpIHtcbiAgICAgICAgdmFyIHNlbGVjdERpciA9IDE7XG4gICAgICAgIGlmIChlbmQgPT09IHRoaXMuc3RhdGUucG9zKSB7XG4gICAgICAgICAgc2VsZWN0RGlyID0gLTE7XG4gICAgICAgIH1cbiAgICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLnN0YXRlLnBvcyArICcsIHNlbERpcjogJyArIHNlbGVjdERpcik7XG4gICAgICAgIHZhciBlbmRQb3MgPSB0aGlzLm5vcm1hbGl6ZVBvc2l0aW9uKGVuZCwgc2VsZWN0RGlyKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnZW5kUG9zOicgKyBlbmRQb3MpO1xuICAgICAgICBpZiAoZW5kUG9zID4gcG9zKSB7XG4gICAgICAgICAgcmFuZ2UgPSBlbmRQb3MgLSBwb3M7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHBvczogcG9zLFxuICAgICAgICByYW5nZTogcmFuZ2VcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBvbkNvcHk6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBub2RlID0gdGhpcy5yZWZzLmNvbnRlbnQuZ2V0RE9NTm9kZSgpO1xuICAgICAgdmFyIHN0YXJ0ID0gbm9kZS5zZWxlY3Rpb25TdGFydDtcbiAgICAgIHZhciBlbmQgPSBub2RlLnNlbGVjdGlvbkVuZDtcbiAgICAgIHZhciB0ZXh0ID0gbm9kZS52YWx1ZS5zdWJzdHJpbmcoc3RhcnQsIGVuZCk7XG4gICAgICB2YXIgcmVhbFN0YXJ0SW5kZXggPSB0aGlzLnRva2VuSW5kZXgoc3RhcnQpO1xuICAgICAgdmFyIHJlYWxFbmRJbmRleCA9IHRoaXMudG9rZW5JbmRleChlbmQpO1xuICAgICAgdmFyIHRva2VucyA9IHRoaXMuc3RhdGUudG9rZW5zLnNsaWNlKHJlYWxTdGFydEluZGV4LCByZWFsRW5kSW5kZXgpO1xuICAgICAgdGV4dCA9IHRoaXMucmF3VmFsdWUodG9rZW5zKTtcbiAgICAgIHZhciBvcmlnaW5hbFZhbHVlID0gbm9kZS52YWx1ZTtcbiAgICAgIG5vZGUudmFsdWUgPSBub2RlLnZhbHVlICsgdGV4dDtcbiAgICAgIG5vZGUuc2V0U2VsZWN0aW9uUmFuZ2Uob3JpZ2luYWxWYWx1ZS5sZW5ndGgsIG9yaWdpbmFsVmFsdWUubGVuZ3RoICsgdGV4dC5sZW5ndGgpO1xuICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIG5vZGUudmFsdWUgPSBvcmlnaW5hbFZhbHVlO1xuICAgICAgICBub2RlLnNldFNlbGVjdGlvblJhbmdlKHN0YXJ0LCBlbmQpO1xuICAgICAgfSwwKTtcbiAgICB9LFxuXG4gICAgb25LZXlEb3duOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSA5MCAmJiAoZXZlbnQubWV0YUtleSB8fCBldmVudC5jdHJsS2V5KSAmJiAhZXZlbnQuc2hpZnRLZXkpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy51bmRvKCk7XG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAoZXZlbnQua2V5Q29kZSA9PT0gODkgJiYgZXZlbnQuY3RybEtleSAmJiAhZXZlbnQuc2hpZnRLZXkpIHx8XG4gICAgICAgIChldmVudC5rZXlDb2RlID09PSA5MCAmJiBldmVudC5tZXRhS2V5ICYmIGV2ZW50LnNoaWZ0S2V5KVxuICAgICAgKSB7XG4gICAgICAgIHRoaXMucmVkbygpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBhZGp1c3RTdHlsZXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBvdmVybGF5ID0gdGhpcy5yZWZzLmhpZ2hsaWdodC5nZXRET01Ob2RlKCk7XG4gICAgICB2YXIgY29udGVudCA9IHRoaXMucmVmcy5jb250ZW50LmdldERPTU5vZGUoKTtcbiAgICAgIG92ZXJsYXkuc3R5bGUuY3NzVGV4dCA9IGRvY3VtZW50LmRlZmF1bHRWaWV3LmdldENvbXB1dGVkU3R5bGUoY29udGVudCwgJycpLmNzc1RleHQ7XG4gICAgICBvdmVybGF5LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICB9LFxuXG4gICAgb25SZXNpemU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuYWRqdXN0U3R5bGVzKCk7XG4gICAgfSxcblxuICAgIG9uUmVzaXplV2luZG93OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmFkanVzdFN0eWxlcygpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5hZGp1c3RTdHlsZXMoKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuICAgICAgcmV0dXJuIFJlc2l6YWJsZSh7fSwgUi5kaXYoe3N0eWxlOiB7cG9zaXRpb246ICdyZWxhdGl2ZSd9fSxcblxuICAgICAgICBSLmRpdih7XG4gICAgICAgICAgY2xhc3NOYW1lOiAncHJldHR5LWhpZ2hsaWdodCcsXG4gICAgICAgICAgcmVmOiAnaGlnaGxpZ2h0JyxcbiAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZSdcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgICAgdGhpcy5wcmV0dHlWYWx1ZSh0aGlzLnN0YXRlLnZhbHVlKVxuICAgICAgICApLFxuXG4gICAgICAgIFIudGV4dGFyZWEoXy5leHRlbmQoe1xuICAgICAgICAgIGNsYXNzTmFtZTogdXRpbC5jbGFzc05hbWUodGhpcy5wcm9wcy5jbGFzc05hbWUsICdwcmV0dHktY29udGVudCcpLFxuICAgICAgICAgIHJlZjogJ2NvbnRlbnQnLFxuICAgICAgICAgIHJvd3M6IDUsXG4gICAgICAgICAgbmFtZTogZmllbGQua2V5LFxuICAgICAgICAgIHZhbHVlOiB0aGlzLnN0YXRlLnBsYWluVmFsdWUsXG4gICAgICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsXG4gICAgICAgICAgb25Gb2N1czogdGhpcy5vbkZvY3VzLFxuICAgICAgICAgIG9uQmx1cjogdGhpcy5vbkJsdXIsXG4gICAgICAgICAgb25TY3JvbGw6IHRoaXMub25TY3JvbGwsXG4gICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3JnYmEoMCwwLDAsMCknLFxuICAgICAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXG4gICAgICAgICAgICB0b3A6IDAsXG4gICAgICAgICAgICBsZWZ0OiAwXG4gICAgICAgICAgfSxcbiAgICAgICAgICBvbktleVByZXNzOiB0aGlzLm9uS2V5UHJlc3MsXG4gICAgICAgICAgb25LZXlEb3duOiB0aGlzLm9uS2V5RG93bixcbiAgICAgICAgICBvblNlbGVjdDogdGhpcy5vblNlbGVjdCxcbiAgICAgICAgICBvbkNvcHk6IHRoaXMub25Db3B5XG4gICAgICAgIH0sIHBsdWdpbi5jb25maWcuYXR0cmlidXRlcykpXG4gICAgICApKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cy5jb21wb25lbnQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWUsXG4gICAgICAgIGxhYmVsOiBwbHVnaW4uY29uZmlnVmFsdWUoJ2xhYmVsJywgJ1tyZW1vdmVdJylcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIFIuc3Bhbih7Y2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZSwgb25DbGljazogdGhpcy5wcm9wcy5vbkNsaWNrfSwgdGhpcy5wcm9wcy5sYWJlbCk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgdmFyIHV0aWwgPSBwbHVnaW4ucmVxdWlyZSgndXRpbCcpO1xuXG4gIHBsdWdpbi5leHBvcnRzLmNvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiB1dGlsLmNsYXNzTmFtZSgncm9vdCcsIHBsdWdpbi5jb25maWcuY2xhc3NOYW1lKVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgICByZXR1cm4gUi5kaXYoe1xuICAgICAgICBjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lXG4gICAgICB9LFxuICAgICAgICBmaWVsZC5maWVsZHMoKS5tYXAoZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICAgICAgcmV0dXJuIGZpZWxkLmNvbXBvbmVudCgpO1xuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzLmNvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIG1peGluczogW3JlcXVpcmUoJy4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGFzc05hbWU6IHBsdWdpbi5jb25maWcuY2xhc3NOYW1lXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICB2YXIgY2hvaWNlVmFsdWUgPSBldmVudC50YXJnZXQudmFsdWU7XG4gICAgICB2YXIgY2hvaWNlVHlwZSA9IGNob2ljZVZhbHVlLnN1YnN0cmluZygwLCBjaG9pY2VWYWx1ZS5pbmRleE9mKCc6JykpO1xuICAgICAgaWYgKGNob2ljZVR5cGUgPT09ICdjaG9pY2UnKSB7XG4gICAgICAgIHZhciBjaG9pY2VJbmRleCA9IGNob2ljZVZhbHVlLnN1YnN0cmluZyhjaG9pY2VWYWx1ZS5pbmRleE9mKCc6JykgKyAxKTtcbiAgICAgICAgY2hvaWNlSW5kZXggPSBwYXJzZUludChjaG9pY2VJbmRleCk7XG4gICAgICAgIHRoaXMucHJvcHMuZmllbGQudmFsKHRoaXMucHJvcHMuZmllbGQuZGVmLmNob2ljZXNbY2hvaWNlSW5kZXhdLnZhbHVlKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG4gICAgICB2YXIgY2hvaWNlcyA9IGZpZWxkLmRlZi5jaG9pY2VzIHx8IFtdO1xuXG4gICAgICB2YXIgdmFsdWUgPSBmaWVsZC52YWx1ZSAhPT0gdW5kZWZpbmVkID8gZmllbGQudmFsdWUgOiAnJztcblxuICAgICAgY2hvaWNlcyA9IGNob2ljZXMubWFwKGZ1bmN0aW9uIChjaG9pY2UsIGkpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBjaG9pY2VWYWx1ZTogJ2Nob2ljZTonICsgaSxcbiAgICAgICAgICB2YWx1ZTogY2hvaWNlLnZhbHVlLFxuICAgICAgICAgIGxhYmVsOiBjaG9pY2UubGFiZWxcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgdmFsdWVDaG9pY2UgPSBfLmZpbmQoY2hvaWNlcywgZnVuY3Rpb24gKGNob2ljZSkge1xuICAgICAgICByZXR1cm4gY2hvaWNlLnZhbHVlID09PSB2YWx1ZTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAodmFsdWVDaG9pY2UgPT09IHVuZGVmaW5lZCkge1xuXG4gICAgICAgIHZhciBsYWJlbCA9IHZhbHVlO1xuICAgICAgICBpZiAoIV8uaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgICAgICAgbGFiZWwgPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFsdWVDaG9pY2UgPSB7XG4gICAgICAgICAgY2hvaWNlVmFsdWU6ICd2YWx1ZTonLFxuICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICBsYWJlbDogbGFiZWxcbiAgICAgICAgfTtcbiAgICAgICAgY2hvaWNlcyA9IFt2YWx1ZUNob2ljZV0uY29uY2F0KGNob2ljZXMpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcGx1Z2luLmNvbXBvbmVudCgnZmllbGQnKSh7XG4gICAgICAgIGZpZWxkOiBmaWVsZFxuICAgICAgfSwgUi5zZWxlY3Qoe1xuICAgICAgICBjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lLFxuICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgICAgdmFsdWU6IHZhbHVlQ2hvaWNlLmNob2ljZVZhbHVlXG4gICAgICB9LFxuICAgICAgICBjaG9pY2VzLm1hcChmdW5jdGlvbiAoY2hvaWNlLCBpKSB7XG4gICAgICAgICAgcmV0dXJuIFIub3B0aW9uKHtcbiAgICAgICAgICAgIGtleTogaSxcbiAgICAgICAgICAgIHZhbHVlOiBjaG9pY2UuY2hvaWNlVmFsdWVcbiAgICAgICAgICB9LCBjaG9pY2UubGFiZWwpO1xuICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICApKTtcbiAgICB9XG4gIH0pO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcbnZhciBSID0gUmVhY3QuRE9NO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cy5jb21wb25lbnQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBtaXhpbnM6IFtyZXF1aXJlKCcuL21peGlucy9maWVsZCcpXSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2xhc3NOYW1lOiBwbHVnaW4uY29uZmlnLmNsYXNzTmFtZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgdmFyIG5ld1ZhbHVlID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xuICAgICAgdGhpcy5wcm9wcy5maWVsZC52YWwobmV3VmFsdWUpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgICAgcmV0dXJuIHBsdWdpbi5jb21wb25lbnQoJ2ZpZWxkJykoe1xuICAgICAgICBmaWVsZDogZmllbGRcbiAgICAgIH0sIFIuaW5wdXQoe1xuICAgICAgICBjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lLFxuICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgIHZhbHVlOiBmaWVsZC52YWx1ZSxcbiAgICAgICAgcm93czogZmllbGQuZGVmLnJvd3MsXG4gICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlXG4gICAgICB9KSk7XG4gICAgfVxuICB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuUmVhY3QgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLlJlYWN0IDogbnVsbCk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMuY29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgbWl4aW5zOiBbcmVxdWlyZSgnLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWUsXG4gICAgICAgIHJvd3M6IHBsdWdpbi5jb25maWcucm93cyB8fCA1XG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICB2YXIgbmV3VmFsdWUgPSBldmVudC50YXJnZXQudmFsdWU7XG4gICAgICB0aGlzLnByb3BzLmZpZWxkLnZhbChuZXdWYWx1ZSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgICByZXR1cm4gcGx1Z2luLmNvbXBvbmVudCgnZmllbGQnKSh7XG4gICAgICAgIGZpZWxkOiBmaWVsZFxuICAgICAgfSwgUi50ZXh0YXJlYSh7XG4gICAgICAgIGNsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWUsXG4gICAgICAgIHZhbHVlOiBmaWVsZC52YWx1ZSxcbiAgICAgICAgcm93czogZmllbGQuZGVmLnJvd3MgfHwgdGhpcy5wcm9wcy5yb3dzLFxuICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZVxuICAgICAgfSkpO1xuICAgIH1cbiAgfSk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICB2YXIgcm91dGVyID0gcGx1Z2luLnJlcXVpcmUoJ2ZpZWxkLXJvdXRlcicpO1xuICB2YXIgdXRpbCA9IHBsdWdpbi5yZXF1aXJlKCd1dGlsJyk7XG4gIHZhciBldmFsdWF0b3IgPSBwbHVnaW4ucmVxdWlyZSgnZXZhbCcpO1xuICB2YXIgY29tcGlsZXIgPSBwbHVnaW4ucmVxdWlyZSgnY29tcGlsZXInKTtcblxuICB2YXIgRmllbGQgPSBmdW5jdGlvbiAoZm9ybSwgZGVmLCB2YWx1ZSwgcGFyZW50KSB7XG4gICAgdmFyIGZpZWxkID0gdGhpcztcblxuICAgIGZpZWxkLmZvcm0gPSBmb3JtO1xuICAgIGZpZWxkLmRlZiA9IGRlZjtcbiAgICBmaWVsZC52YWx1ZSA9IHZhbHVlO1xuICAgIGZpZWxkLnBhcmVudCA9IHBhcmVudDtcbiAgfTtcblxuICBwbHVnaW4uZXhwb3J0cy5maWVsZCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZm9ybSA9IHRoaXM7XG5cbiAgICByZXR1cm4gbmV3IEZpZWxkKGZvcm0sIHtcbiAgICAgIHR5cGU6ICdyb290J1xuICAgIH0sIGZvcm0uc3RvcmUudmFsdWUpO1xuICB9O1xuXG4gIHZhciBwcm90byA9IEZpZWxkLnByb3RvdHlwZTtcblxuICBwcm90by50eXBlUGx1Z2luID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBmaWVsZCA9IHRoaXM7XG5cbiAgICBpZiAoIWZpZWxkLl90eXBlUGx1Z2luKSB7XG4gICAgICBmaWVsZC5fdHlwZVBsdWdpbiA9IHBsdWdpbi5yZXF1aXJlKCd0eXBlLicgKyBmaWVsZC5kZWYudHlwZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZpZWxkLl90eXBlUGx1Z2luO1xuICB9O1xuXG4gIHByb3RvLmNvbXBvbmVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzO1xuICAgIHZhciBjb21wb25lbnQgPSByb3V0ZXIuY29tcG9uZW50Rm9yRmllbGQoZmllbGQpO1xuICAgIHJldHVybiBjb21wb25lbnQoe1xuICAgICAgZmllbGQ6IGZpZWxkXG4gICAgfSk7XG4gIH07XG5cbiAgcHJvdG8uZmllbGRzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBmaWVsZCA9IHRoaXM7XG5cbiAgICBpZiAoIWZpZWxkLl9maWVsZHMpIHtcbiAgICAgIHZhciBmaWVsZHM7XG4gICAgICBpZiAoZmllbGQudHlwZVBsdWdpbigpLmZpZWxkcykge1xuICAgICAgICBmaWVsZHMgPSBmaWVsZC50eXBlUGx1Z2luKCkuZmllbGRzKGZpZWxkKTtcbiAgICAgIH0gZWxzZSBpZiAoZmllbGQuZGVmLmZpZWxkcykge1xuICAgICAgICBmaWVsZHMgPSBmaWVsZC5kZWYuZmllbGRzLm1hcChmdW5jdGlvbiAoZGVmKSB7XG4gICAgICAgICAgcmV0dXJuIGZpZWxkLmNyZWF0ZUNoaWxkKGRlZik7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZmllbGRzID0gW107XG4gICAgICB9XG4gICAgICBmaWVsZC5fZmllbGRzID0gZmllbGRzO1xuICAgIH1cblxuICAgIHJldHVybiBmaWVsZC5fZmllbGRzO1xuICB9O1xuXG4gIHByb3RvLml0ZW1zID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBmaWVsZCA9IHRoaXM7XG5cbiAgICBpZiAoIWZpZWxkLl9pdGVtcykge1xuICAgICAgaWYgKF8uaXNBcnJheShmaWVsZC5kZWYuaXRlbXMpKSB7XG4gICAgICAgIGZpZWxkLl9pdGVtcyA9IGZpZWxkLmRlZi5pdGVtcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICByZXR1cm4gZmllbGQucmVzb2x2ZShpdGVtKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmaWVsZC5faXRlbXMgPSBbXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmllbGQuX2l0ZW1zO1xuICB9O1xuXG4gIHByb3RvLnJlc29sdmUgPSBmdW5jdGlvbiAoZGVmKSB7XG4gICAgdmFyIGZpZWxkID0gdGhpcztcblxuICAgIGlmIChfLmlzU3RyaW5nKGRlZikpIHtcbiAgICAgIGRlZiA9IGZpZWxkLmZvcm0uZmluZERlZihkZWYpO1xuICAgICAgaWYgKCFkZWYpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZmluZCBmaWVsZDogJyArIGRlZik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRlZjtcbiAgfTtcblxuICBwcm90by5ldmFsRGVmID0gZnVuY3Rpb24gKGRlZikge1xuICAgIHZhciBmaWVsZCA9IHRoaXM7XG5cbiAgICBpZiAoZGVmLmV2YWwpIHtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgdmFyIGV4dERlZiA9IGZpZWxkLmV2YWwoZGVmLmV2YWwpO1xuICAgICAgICBpZiAoZXh0RGVmKSB7XG4gICAgICAgICAgZGVmID0gXy5leHRlbmQoe30sIGRlZiwgZXh0RGVmKTtcbiAgICAgICAgICBkZWYgPSBjb21waWxlci5jb21waWxlRGVmKGRlZik7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1Byb2JsZW0gaW4gZXZhbDogJywgSlNPTi5zdHJpbmdpZnkoZGVmLmV2YWwpKTtcbiAgICAgICAgY29uc29sZS5sb2coZS5tZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGVmO1xuICB9O1xuXG4gIHByb3RvLmV2YWwgPSBmdW5jdGlvbiAoZXhwcmVzc2lvbikge1xuICAgIHJldHVybiBldmFsdWF0b3IuZXZhbHVhdGUoZXhwcmVzc2lvbiwgdGhpcyk7XG4gIH07XG5cbiAgcHJvdG8uY3JlYXRlQ2hpbGQgPSBmdW5jdGlvbiAoZGVmKSB7XG4gICAgdmFyIGZpZWxkID0gdGhpcztcblxuICAgIGRlZiA9IGZpZWxkLnJlc29sdmUoZGVmKTtcblxuICAgIHZhciB2YWx1ZSA9IGZpZWxkLnZhbHVlO1xuXG4gICAgZGVmID0gZmllbGQuZXZhbERlZihkZWYpO1xuXG4gICAgaWYgKCF1dGlsLmlzQmxhbmsoZGVmLmtleSkpIHtcbiAgICAgIGlmICh2YWx1ZSAmJiAhXy5pc1VuZGVmaW5lZCh2YWx1ZVtkZWYua2V5XSkpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZVtkZWYua2V5XTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSA9IGRlZi52YWx1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IEZpZWxkKGZpZWxkLmZvcm0sIGRlZiwgdmFsdWUsIGZpZWxkKTtcbiAgfTtcblxuICBwcm90by5pdGVtRm9yVmFsdWUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzO1xuXG4gICAgdmFyIGl0ZW0gPSBfLmZpbmQoZmllbGQuaXRlbXMoKSwgZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHJldHVybiB1dGlsLml0ZW1NYXRjaGVzVmFsdWUoaXRlbSwgdmFsdWUpO1xuICAgIH0pO1xuICAgIGlmIChpdGVtKSB7XG4gICAgICBpdGVtID0gXy5leHRlbmQoe30sIGl0ZW0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBpdGVtID0gdXRpbC5maWVsZERlZkZyb21WYWx1ZSh2YWx1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGl0ZW07XG4gIH07XG5cbiAgcHJvdG8udmFsdWVQYXRoID0gZnVuY3Rpb24gKGNoaWxkUGF0aCkge1xuICAgIHZhciBmaWVsZCA9IHRoaXM7XG5cbiAgICB2YXIgcGF0aCA9IGNoaWxkUGF0aCB8fCBbXTtcbiAgICBpZiAoIXV0aWwuaXNCbGFuayhmaWVsZC5kZWYua2V5KSkge1xuICAgICAgcGF0aCA9IFtmaWVsZC5kZWYua2V5XS5jb25jYXQocGF0aCk7XG4gICAgfVxuICAgIGlmIChmaWVsZC5wYXJlbnQpIHtcbiAgICAgIHJldHVybiBmaWVsZC5wYXJlbnQudmFsdWVQYXRoKHBhdGgpO1xuICAgIH1cbiAgICByZXR1cm4gcGF0aDtcbiAgfTtcblxuICBwcm90by52YWwgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzO1xuXG4gICAgZmllbGQuZm9ybS5hY3Rpb25zLnNldFZhbHVlKGZpZWxkLnZhbHVlUGF0aCgpLCB2YWx1ZSk7XG4gIH07XG5cbiAgcHJvdG8ucmVtb3ZlID0gZnVuY3Rpb24gKGtleSkge1xuICAgIHZhciBmaWVsZCA9IHRoaXM7XG5cbiAgICB2YXIgcGF0aCA9IGZpZWxkLnZhbHVlUGF0aCgpLmNvbmNhdChrZXkpO1xuXG4gICAgZmllbGQuZm9ybS5hY3Rpb25zLnJlbW92ZVZhbHVlKHBhdGgpO1xuICB9O1xuXG4gIHByb3RvLm1vdmUgPSBmdW5jdGlvbiAoZnJvbUtleSwgdG9LZXkpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzO1xuXG4gICAgZmllbGQuZm9ybS5hY3Rpb25zLm1vdmVWYWx1ZShmaWVsZC52YWx1ZVBhdGgoKSwgZnJvbUtleSwgdG9LZXkpO1xuICB9O1xuXG4gIHByb3RvLmRlZmF1bHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGZpZWxkID0gdGhpcztcblxuICAgIGlmICghXy5pc1VuZGVmaW5lZChmaWVsZC5kZWYudmFsdWUpKSB7XG4gICAgICByZXR1cm4gdXRpbC5jb3B5VmFsdWUoZmllbGQuZGVmLnZhbHVlKTtcbiAgICB9XG5cbiAgICBpZiAoIV8uaXNVbmRlZmluZWQoZmllbGQuZGVmLmRlZmF1bHQpKSB7XG4gICAgICByZXR1cm4gdXRpbC5jb3B5VmFsdWUoZmllbGQuZGVmLmRlZmF1bHQpO1xuICAgIH1cblxuICAgIGlmICghXy5pc1VuZGVmaW5lZChmaWVsZC50eXBlUGx1Z2luKCkuZGVmYXVsdCkpIHtcbiAgICAgIHJldHVybiB1dGlsLmNvcHlWYWx1ZShmaWVsZC50eXBlUGx1Z2luKCkuZGVmYXVsdCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG5cbiAgcHJvdG8uYXBwZW5kID0gZnVuY3Rpb24gKGl0ZW1JbmRleCkge1xuICAgIHZhciBmaWVsZCA9IHRoaXM7XG5cbiAgICB2YXIgaXRlbSA9IGZpZWxkLml0ZW1zKClbaXRlbUluZGV4XTtcbiAgICBpdGVtID0gXy5leHRlbmQoaXRlbSk7XG5cbiAgICBpdGVtLmtleSA9IGZpZWxkLnZhbHVlLmxlbmd0aDtcblxuICAgIHZhciBjaGlsZCA9IGZpZWxkLmNyZWF0ZUNoaWxkKGl0ZW0pO1xuXG4gICAgdmFyIG9iaiA9IGNoaWxkLmRlZmF1bHQoKTtcblxuICAgIGlmIChfLmlzQXJyYXkob2JqKSB8fCBfLmlzT2JqZWN0KG9iaikpIHtcbiAgICAgIHZhciBjaG9wID0gZmllbGQudmFsdWVQYXRoKCkubGVuZ3RoICsgMTtcblxuICAgICAgY2hpbGQuaW5mbGF0ZShmdW5jdGlvbiAocGF0aCwgdmFsdWUpIHtcbiAgICAgICAgb2JqID0gdXRpbC5zZXRJbihvYmosIHBhdGguc2xpY2UoY2hvcCksIHZhbHVlKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZpZWxkLmZvcm0uYWN0aW9ucy5hcHBlbmRWYWx1ZShmaWVsZC52YWx1ZVBhdGgoKSwgb2JqKTtcbiAgfTtcblxuICBwcm90by5oaWRkZW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGZpZWxkID0gdGhpcztcblxuICAgIHJldHVybiBmaWVsZC5kZWYuaGlkZGVuIHx8IGZpZWxkLnR5cGVQbHVnaW4oKS5oaWRkZW47XG4gIH07XG5cbiAgLy8gZXhwYW5kIGFsbCBmaWVsZHMgYW5kIHNlZWQgdmFsdWVzIGlmIG5lY2Vzc2FyeVxuICBwcm90by5pbmZsYXRlID0gZnVuY3Rpb24gKG9uU2V0VmFsdWUpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzO1xuXG4gICAgaWYgKCF1dGlsLmlzQmxhbmsoZmllbGQuZGVmLmtleSkgJiYgXy5pc1VuZGVmaW5lZChmaWVsZC52YWx1ZSkpIHtcbiAgICAgIG9uU2V0VmFsdWUoZmllbGQudmFsdWVQYXRoKCksIGZpZWxkLmRlZmF1bHQoKSk7XG4gICAgfVxuXG4gICAgdmFyIGZpZWxkcyA9IGZpZWxkLmZpZWxkcygpO1xuXG4gICAgZmllbGRzLmZvckVhY2goZnVuY3Rpb24gKGNoaWxkKSB7XG4gICAgICBjaGlsZC5pbmZsYXRlKG9uU2V0VmFsdWUpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIENhbGxlZCBmcm9tIHVubW91bnQuXG4gIHByb3RvLmVyYXNlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBmaWVsZCA9IHRoaXM7XG4gICAgaWYgKCF1dGlsLmlzQmxhbmsoZmllbGQuZGVmLmtleSkgJiYgIV8uaXNVbmRlZmluZWQoZmllbGQudmFsdWUpKSB7XG4gICAgICBmaWVsZC5mb3JtLmFjdGlvbnMuZXJhc2VWYWx1ZShmaWVsZC52YWx1ZVBhdGgoKSwge30pO1xuICAgIH1cbiAgfTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgdmFyIGluaXRQbHVnaW5zID0gcGx1Z2luLnJlcXVpcmVBbGwocGx1Z2luLmNvbmZpZy5pbml0KTtcblxuICB2YXIgcHJvdG8gPSBwbHVnaW4uZXhwb3J0cztcblxuICBwcm90by5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBmb3JtID0gdGhpcztcblxuICAgIGluaXRQbHVnaW5zLmZvckVhY2goZnVuY3Rpb24gKHBsdWdpbikge1xuICAgICAgcGx1Z2luLmFwcGx5KGZvcm0sIGFyZ3VtZW50cyk7XG4gICAgfSk7XG4gIH07XG59O1xuIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVmbHV4ID0gcmVxdWlyZSgncmVmbHV4Jyk7XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgdmFyIHByb3RvID0gcGx1Z2luLmV4cG9ydHM7XG5cbiAgdmFyIHN0b3JlUGx1Z2luID0gcGx1Z2luLnJlcXVpcmUocGx1Z2luLmNvbmZpZy5zdG9yZSk7XG4gIHZhciB1dGlsID0gcGx1Z2luLnJlcXVpcmUoJ3V0aWwnKTtcbiAgdmFyIGxvYWRlciA9IHBsdWdpbi5yZXF1aXJlKCdsb2FkZXInKTtcblxuICB2YXIgY3JlYXRlU3luY0FjdGlvbnMgPSBmdW5jdGlvbiAobmFtZXMpIHtcbiAgICB2YXIgYWN0aW9ucyA9IHt9O1xuICAgIG5hbWVzLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgIGFjdGlvbnNbbmFtZV0gPSBSZWZsdXguY3JlYXRlQWN0aW9uKHtzeW5jOiB0cnVlfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGFjdGlvbnM7XG4gIH07XG5cbiAgcHJvdG8uaW5pdCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgdmFyIGZvcm0gPSB0aGlzO1xuXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICAvL2Zvcm0uYWN0aW9ucyA9IFJlZmx1eC5jcmVhdGVBY3Rpb25zKFsnc2V0VmFsdWUnLCAnc2V0RmllbGRzJywgJ3JlbW92ZVZhbHVlJywgJ2FwcGVuZFZhbHVlJywgJ21vdmVWYWx1ZSddKTtcbiAgICBmb3JtLmFjdGlvbnMgPSBjcmVhdGVTeW5jQWN0aW9ucyhbJ3NldFZhbHVlJywgJ3NldEZpZWxkcycsICdyZW1vdmVWYWx1ZScsICdhcHBlbmRWYWx1ZScsICdtb3ZlVmFsdWUnLCAnZXJhc2VWYWx1ZScsICdzZXRNZXRhJ10pO1xuICAgIGZvcm0uc3RvcmUgPSBzdG9yZVBsdWdpbi5jcmVhdGUoZm9ybS5hY3Rpb25zLCBmb3JtLCBvcHRpb25zKTtcbiAgICBmb3JtLnN0b3JlLmluZmxhdGUoKTtcblxuICAgIGZvcm0uY29udGV4dGlmaWVycyA9IHt9O1xuICB9O1xuXG4gIHByb3RvLmNvbXBvbmVudCA9IGZ1bmN0aW9uIChwcm9wcykge1xuXG4gICAgdmFyIGZvcm0gPSB0aGlzO1xuXG4gICAgcHJvcHMgPSBfLmV4dGVuZCh7fSwgcHJvcHMsIHtcbiAgICAgIGZvcm06IGZvcm1cbiAgICB9KTtcblxuICAgIHZhciBjb21wb25lbnQgPSBwbHVnaW4uY29tcG9uZW50KCdmb3JtYXRpYycpO1xuXG4gICAgcmV0dXJuIGNvbXBvbmVudChwcm9wcyk7XG4gIH07XG5cbiAgcHJvdG8udmFsID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFyIGZvcm0gPSB0aGlzO1xuXG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGZvcm0uYWN0aW9ucy5zZXRWYWx1ZSh2YWx1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHV0aWwuY29weVZhbHVlKGZvcm0uc3RvcmUudmFsdWUpO1xuICB9O1xuXG4gIHByb3RvLmZpZWxkcyA9IGZ1bmN0aW9uIChmaWVsZHMpIHtcbiAgICB2YXIgZm9ybSA9IHRoaXM7XG5cbiAgICBmb3JtLmFjdGlvbnMuc2V0RmllbGRzKGZpZWxkcyk7XG4gIH07XG5cbiAgcHJvdG8uZmluZERlZiA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICB2YXIgZm9ybSA9IHRoaXM7XG5cbiAgICByZXR1cm4gZm9ybS5zdG9yZS50ZW1wbGF0ZU1hcFtrZXldIHx8IG51bGw7XG4gIH07XG5cbiAgcHJvdG8uY29udGV4dGlmaWVyID0gZnVuY3Rpb24gKGtleSwgY29udGV4dGlmeSkge1xuICAgIHZhciBmb3JtID0gdGhpcztcblxuICAgIGZvcm0uY29udGV4dGlmaWVyc1trZXldID0gY29udGV4dGlmeTtcbiAgfTtcblxuICBwcm90by5tZXRhID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICB2YXIgZm9ybSA9IHRoaXM7XG5cbiAgICBpZiAoIV8uaXNVbmRlZmluZWQodmFsdWUpKSB7XG4gICAgICByZXR1cm4gZm9ybS5hY3Rpb25zLnNldE1ldGEoa2V5LCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZvcm0uc3RvcmUubWV0YVtrZXldO1xuICB9O1xuXG4gIHByb3RvLmxvYWRNZXRhID0gZnVuY3Rpb24gKGtleXMpIHtcbiAgICB2YXIgdmFsaWRLZXlzID0ga2V5cy5maWx0ZXIoZnVuY3Rpb24gKGtleSkge1xuICAgICAgcmV0dXJuIGtleTtcbiAgICB9KTtcbiAgICBpZiAodmFsaWRLZXlzLmxlbmd0aCA8IGtleXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxvYWRlci5sb2FkTWV0YSh0aGlzLCBrZXlzKTtcbiAgfTtcblxuICBwcm90by5zb3VyY2UgPSBsb2FkZXIuc291cmNlO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5SZWFjdCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuUmVhY3QgOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgdmFyIGYgPSBwbHVnaW4uZXhwb3J0cztcblxuICB2YXIgcm91dGVyID0gcGx1Z2luLnJlcXVpcmUoJ2ZpZWxkLXJvdXRlcicpO1xuXG4gIGYucm91dGUgPSByb3V0ZXIucm91dGU7XG5cbiAgZi5yZW5kZXIgPSBmdW5jdGlvbiAoY29tcG9uZW50LCBub2RlKSB7XG5cbiAgICBSZWFjdC5yZW5kZXJDb21wb25lbnQoY29tcG9uZW50LCBub2RlKTtcbiAgfTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHZhciBjb21waWxlclBsdWdpbnMgPSBwbHVnaW4ucmVxdWlyZUFsbChwbHVnaW4uY29uZmlnLmNvbXBpbGVycyk7XG4gIHZhciB1dGlsID0gcGx1Z2luLnJlcXVpcmUoJ3V0aWwnKTtcblxuICB2YXIgY29tcGlsZXIgPSBwbHVnaW4uZXhwb3J0cztcblxuICBjb21waWxlci50ZW1wbGF0ZU1hcCA9IGZ1bmN0aW9uIChmaWVsZHMpIHtcbiAgICB2YXIgbWFwID0ge307XG4gICAgZmllbGRzLmZvckVhY2goZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICBpZiAoZmllbGQua2V5KSB7XG4gICAgICAgIG1hcFtmaWVsZC5rZXldID0gZmllbGQ7XG4gICAgICB9XG4gICAgICBpZiAoZmllbGQuaWQpIHtcbiAgICAgICAgbWFwW2ZpZWxkLmlkXSA9IGZpZWxkO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBtYXA7XG4gIH07XG5cbiAgY29tcGlsZXIuZXhwYW5kRGVmID0gZnVuY3Rpb24gKGRlZiwgdGVtcGxhdGVNYXApIHtcbiAgICB2YXIgaXNUZW1wbGF0ZSA9IGRlZi50ZW1wbGF0ZTtcbiAgICB2YXIgZXh0ID0gZGVmLmV4dGVuZHM7XG4gICAgaWYgKF8uaXNTdHJpbmcoZXh0KSkge1xuICAgICAgZXh0ID0gW2V4dF07XG4gICAgfVxuICAgIGlmIChleHQpIHtcbiAgICAgIHZhciBiYXNlcyA9IGV4dC5tYXAoZnVuY3Rpb24gKGJhc2UpIHtcbiAgICAgICAgdmFyIHRlbXBsYXRlID0gdGVtcGxhdGVNYXBbYmFzZV07XG4gICAgICAgIGlmICghdGVtcGxhdGUpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RlbXBsYXRlICcgKyBiYXNlICsgJyBub3QgZm91bmQuJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlO1xuICAgICAgfSk7XG4gICAgICB2YXIgY2hhaW4gPSBbe31dLmNvbmNhdChiYXNlcy5yZXZlcnNlKCkuY29uY2F0KFtkZWZdKSk7XG4gICAgICBkZWYgPSBfLmV4dGVuZC5hcHBseShfLCBjaGFpbik7XG4gICAgfVxuICAgIGlmIChkZWYuZmllbGRzKSB7XG4gICAgICBkZWYuZmllbGRzID0gZGVmLmZpZWxkcy5tYXAoZnVuY3Rpb24gKGNoaWxkRGVmKSB7XG4gICAgICAgIGlmICghXy5pc1N0cmluZyhjaGlsZERlZikpIHtcbiAgICAgICAgICByZXR1cm4gY29tcGlsZXIuZXhwYW5kRGVmKGNoaWxkRGVmLCB0ZW1wbGF0ZU1hcCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNoaWxkRGVmO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChkZWYuaXRlbXMpIHtcbiAgICAgIGRlZi5pdGVtcyA9IGRlZi5pdGVtcy5tYXAoZnVuY3Rpb24gKGl0ZW1EZWYpIHtcbiAgICAgICAgaWYgKCFfLmlzU3RyaW5nKGl0ZW1EZWYpKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbXBpbGVyLmV4cGFuZERlZihpdGVtRGVmLCB0ZW1wbGF0ZU1hcCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGl0ZW1EZWY7XG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKCFpc1RlbXBsYXRlICYmIGRlZi50ZW1wbGF0ZSkge1xuICAgICAgZGVsZXRlIGRlZi50ZW1wbGF0ZTtcbiAgICB9XG4gICAgcmV0dXJuIGRlZjtcbiAgfTtcblxuICBjb21waWxlci5leHBhbmRGaWVsZHMgPSBmdW5jdGlvbiAoZmllbGRzKSB7XG4gICAgdmFyIHRlbXBsYXRlTWFwID0gY29tcGlsZXIudGVtcGxhdGVNYXAoZmllbGRzKTtcbiAgICByZXR1cm4gZmllbGRzLm1hcChmdW5jdGlvbiAoZGVmKSB7XG4gICAgICByZXR1cm4gY29tcGlsZXIuZXhwYW5kRGVmKGRlZiwgdGVtcGxhdGVNYXApO1xuICAgIH0pO1xuICB9O1xuXG4gIGNvbXBpbGVyLmNvbXBpbGVEZWYgPSBmdW5jdGlvbiAoZGVmKSB7XG5cbiAgICBkZWYgPSB1dGlsLmRlZXBDb3B5KGRlZik7XG5cbiAgICB2YXIgcmVzdWx0O1xuICAgIGNvbXBpbGVyUGx1Z2lucy5mb3JFYWNoKGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICAgIHJlc3VsdCA9IHBsdWdpbi5jb21waWxlKGRlZik7XG4gICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgIGRlZiA9IHJlc3VsdDtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciB0eXBlUGx1Z2luID0gcGx1Z2luLnJlcXVpcmUoJ3R5cGUuJyArIGRlZi50eXBlKTtcblxuICAgIGlmICh0eXBlUGx1Z2luLmNvbXBpbGUpIHtcbiAgICAgIHJlc3VsdCA9IHR5cGVQbHVnaW4uY29tcGlsZShkZWYpO1xuICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICBkZWYgPSByZXN1bHQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRlZjtcbiAgfTtcblxuICBjb21waWxlci5jb21waWxlRmllbGRzID0gZnVuY3Rpb24gKGZpZWxkcykge1xuICAgIHJldHVybiBmaWVsZHMubWFwKGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgcmV0dXJuIGNvbXBpbGVyLmNvbXBpbGVEZWYoZmllbGQpO1xuICAgIH0pO1xuICB9O1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICB2YXIgcHJvcE1vZGlmaWVycyA9IHt9O1xuXG4gIHZhciBhZGRQcm9wTW9kaWZpZXIgPSBmdW5jdGlvbiAobmFtZSwgbW9kaWZ5Rm4pIHtcbiAgICBpZiAoIXByb3BNb2RpZmllcnNbbmFtZV0pIHtcbiAgICAgIHByb3BNb2RpZmllcnNbbmFtZV0gPSBbXTtcbiAgICB9XG4gICAgcHJvcE1vZGlmaWVyc1tuYW1lXS5wdXNoKG1vZGlmeUZuKTtcbiAgfTtcblxuICB2YXIgcHJvcHNQbHVnaW5zID0gcGx1Z2luLnJlcXVpcmVBbGwocGx1Z2luLmNvbmZpZy5wcm9wcyk7XG5cbiAgcHJvcHNQbHVnaW5zLmZvckVhY2goZnVuY3Rpb24gKHBsdWdpbikge1xuICAgIGFkZFByb3BNb2RpZmllci5hcHBseShudWxsLCBwbHVnaW4pO1xuICB9KTtcblxuICB2YXIgY29tcG9uZW50RmFjdG9yaWVzID0ge307XG5cbiAgcGx1Z2luLmV4cG9ydHMuY29tcG9uZW50ID0gZnVuY3Rpb24gKG5hbWUpIHtcblxuICAgIGlmICghY29tcG9uZW50RmFjdG9yaWVzW25hbWVdKSB7XG4gICAgICB2YXIgY29tcG9uZW50ID0gcGx1Z2luLnJlcXVpcmUoJ2NvbXBvbmVudC4nICsgbmFtZSkuY29tcG9uZW50O1xuICAgICAgY29tcG9uZW50RmFjdG9yaWVzW25hbWVdID0gZnVuY3Rpb24gKHByb3BzLCBjaGlsZHJlbikge1xuICAgICAgICBpZiAocHJvcE1vZGlmaWVyc1tuYW1lXSkge1xuICAgICAgICAgIHByb3BNb2RpZmllcnNbbmFtZV0uZm9yRWFjaChmdW5jdGlvbiAobW9kaWZ5KSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gbW9kaWZ5KHByb3BzKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgcHJvcHMgPSByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudChwcm9wcywgY2hpbGRyZW4pO1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbXBvbmVudEZhY3Rvcmllc1tuYW1lXTtcbiAgfTtcbn07XG4iLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICBwbHVnaW4uZXhwb3J0cyA9IGZ1bmN0aW9uIChmb3JtYXRpYykge1xuXG4gICAgdmFyIGZvcm1hdGljUGx1Z2lucyA9IHBsdWdpbi5yZXF1aXJlQWxsKHBsdWdpbi5jb25maWcuZm9ybWF0aWMpO1xuICAgIHZhciBmb3JtUGx1Z2lucyA9IHBsdWdpbi5yZXF1aXJlQWxsKHBsdWdpbi5jb25maWcuZm9ybSk7XG5cbiAgICBmb3JtYXRpY1BsdWdpbnMuZm9yRWFjaChmdW5jdGlvbiAoZikge1xuICAgICAgXy5rZXlzKGYpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQoZm9ybWF0aWNba2V5XSkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Byb3BlcnR5IGFscmVhZHkgZGVmaW5lZCBmb3IgZm9ybWF0aWM6ICcgKyBrZXkpO1xuICAgICAgICB9XG4gICAgICAgIGZvcm1hdGljW2tleV0gPSBmW2tleV07XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHZhciBGb3JtID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgIGlmICh0aGlzLmluaXQpIHtcbiAgICAgICAgdGhpcy5pbml0KG9wdGlvbnMpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBmb3JtYXRpYy5mb3JtID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgIHJldHVybiBuZXcgRm9ybShvcHRpb25zKTtcbiAgICB9O1xuXG4gICAgRm9ybS5wcm90b3R5cGUgPSBmb3JtYXRpYy5mb3JtO1xuXG4gICAgdmFyIGluaXRzID0gW107XG5cbiAgICBmb3JtUGx1Z2lucy5mb3JFYWNoKGZ1bmN0aW9uIChwcm90bykge1xuICAgICAgXy5rZXlzKHByb3RvKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJ2luaXQnKSB7XG4gICAgICAgICAgaW5pdHMucHVzaChwcm90b1trZXldKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQoRm9ybS5wcm90b3R5cGVba2V5XSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUHJvcGVydHkgYWxyZWFkeSBkZWZpbmVkIGZvciBmb3JtOiAnICsga2V5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgRm9ybS5wcm90b3R5cGVba2V5XSA9IHByb3RvW2tleV07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaWYgKGluaXRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgRm9ybS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHt9O1xuICAgIH0gZWxzZSBpZiAoaW5pdHMubGVuZ3RoID09PSAxKSB7XG4gICAgICBGb3JtLnByb3RvdHlwZS5pbml0ID0gaW5pdHNbMF07XG4gICAgfSBlbHNlIHtcbiAgICAgIEZvcm0ucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBmb3JtID0gdGhpcztcbiAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG5cbiAgICAgICAgaW5pdHMuZm9yRWFjaChmdW5jdGlvbiAoaW5pdCkge1xuICAgICAgICAgIGluaXQuYXBwbHkoZm9ybSwgYXJncyk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9XG4gIH07XG5cbiAgLy9mb3JtYXRpYy5wbHVnaW4oJ2NvcmUuYmFzZScpO1xuXG4gIC8vIGZvcm1hdGljLmZpbHRlclBsdWdpbnNJblJlZ2lzdHJ5KGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgLy8gICByZXR1cm4gcGx1Z2luLm5hbWUuaW5kZXhPZignY29tcG9uZW50LicpID09PSAwO1xuICAvLyB9KS5mb3JFYWNoKGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgLy8gICBmb3JtYXRpYy5wbHVnaW4ocGx1Z2luLm5hbWUpO1xuICAvLyB9KTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHZhciB1dGlsID0gcGx1Z2luLnJlcXVpcmUoJ3V0aWwnKTtcblxuICB2YXIgZnVuY3Rpb25zID0ge307XG5cbiAgdmFyIGlzRnVuY3Rpb25BcnJheSA9IGZ1bmN0aW9uIChhcnJheSkge1xuICAgIHJldHVybiBhcnJheS5sZW5ndGggPiAwICYmIGFycmF5WzBdWzBdID09PSAnQCc7XG4gIH07XG5cbiAgdmFyIGV2YWxGdW5jdGlvbiA9IGZ1bmN0aW9uIChmbkFycmF5LCBmaWVsZCkge1xuICAgIHZhciBmbk5hbWUgPSBmbkFycmF5WzBdLnN1YnN0cmluZygxKTtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uc1tmbk5hbWVdKGZuQXJyYXkuc2xpY2UoMSksIGZpZWxkKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoIShmbk5hbWUgaW4gZnVuY3Rpb25zKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0V2YWwgZnVuY3Rpb24gJyArIGZuTmFtZSArICcgbm90IGRlZmluZWQuJyk7XG4gICAgICB9XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfTtcblxuICB2YXIgZXZhbHVhdGUgPSBmdW5jdGlvbiAoZXhwcmVzc2lvbiwgZmllbGQpIHtcbiAgICBpZiAoXy5pc0FycmF5KGV4cHJlc3Npb24pKSB7XG4gICAgICBpZiAoaXNGdW5jdGlvbkFycmF5KGV4cHJlc3Npb24pKSB7XG4gICAgICAgIHJldHVybiBldmFsRnVuY3Rpb24oZXhwcmVzc2lvbiwgZmllbGQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGV4cHJlc3Npb24ubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgcmV0dXJuIGV2YWx1YXRlKGl0ZW0sIGZpZWxkKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChfLmlzT2JqZWN0KGV4cHJlc3Npb24pKSB7XG4gICAgICB2YXIgb2JqID0ge307XG4gICAgICBPYmplY3Qua2V5cyhleHByZXNzaW9uKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGV2YWx1YXRlKGV4cHJlc3Npb25ba2V5XSwgZmllbGQpO1xuICAgICAgICBpZiAodHlwZW9mIHJlc3VsdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBvYmpba2V5XSA9IHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZXhwcmVzc2lvbjtcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb25zLmlmID0gZnVuY3Rpb24gKGFyZ3MsIGZpZWxkKSB7XG4gICAgcmV0dXJuIGZpZWxkLmV2YWwoYXJnc1swXSkgPyBmaWVsZC5ldmFsKGFyZ3NbMV0pIDogZmllbGQuZXZhbChhcmdzWzJdKTtcbiAgfTtcblxuICBmdW5jdGlvbnMuZXEgPSBmdW5jdGlvbiAoYXJncywgZmllbGQpIHtcbiAgICByZXR1cm4gZmllbGQuZXZhbChhcmdzWzBdKSA9PT0gZmllbGQuZXZhbChhcmdzWzFdKTtcbiAgfTtcblxuICBmdW5jdGlvbnMubm90ID0gZnVuY3Rpb24gKGFyZ3MsIGZpZWxkKSB7XG4gICAgcmV0dXJuICFmaWVsZC5ldmFsKGFyZ3NbMF0pO1xuICB9O1xuXG4gIGZ1bmN0aW9ucy5nZXQgPSBmdW5jdGlvbiAoYXJncywgZmllbGQpIHtcbiAgICB2YXIga2V5ID0gZmllbGQuZXZhbChhcmdzWzBdKTtcbiAgICBpZiAoIV8uaXNVbmRlZmluZWQoZmllbGQudmFsdWUpKSB7XG4gICAgICBpZiAoa2V5IGluIGZpZWxkLnZhbHVlKSB7XG4gICAgICAgIHJldHVybiBmaWVsZC52YWx1ZVtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZmllbGQucGFyZW50KSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb25zLmdldChhcmdzLCBmaWVsZC5wYXJlbnQpO1xuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9O1xuXG4gIGZ1bmN0aW9ucy5nZXRNZXRhID0gZnVuY3Rpb24gKGFyZ3MsIGZpZWxkKSB7XG4gICAgdmFyIGtleXMgPSBhcmdzLm1hcChmdW5jdGlvbiAoYXJnKSB7XG4gICAgICByZXR1cm4gZmllbGQuZXZhbChhcmcpO1xuICAgIH0pO1xuICAgIHZhciBrZXkgPSB1dGlsLmpvaW5NZXRhS2V5cyhrZXlzKTtcbiAgICByZXR1cm4gZmllbGQuZm9ybS5tZXRhKGtleSk7XG4gIH07XG5cbiAgZnVuY3Rpb25zLnN1bSA9IGZ1bmN0aW9uIChhcmdzLCBmaWVsZCkge1xuICAgIHZhciBzdW0gPSAwO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgc3VtICs9IGZpZWxkLmV2YWwoYXJnc1tpXSk7XG4gICAgfVxuICAgIHJldHVybiBzdW07XG4gIH07XG5cbiAgcGx1Z2luLmV4cG9ydHMuZXZhbHVhdGUgPSBldmFsdWF0ZTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHZhciByb3V0ZXMgPSB7fTtcblxuICB2YXIgcm91dGVyID0gcGx1Z2luLmV4cG9ydHM7XG5cbiAgdmFyIHJvdXRlUGx1Z2lucyA9IHBsdWdpbi5yZXF1aXJlQWxsKHBsdWdpbi5jb25maWcucm91dGVzKTtcblxuICByb3V0ZXIucm91dGUgPSBmdW5jdGlvbiAodHlwZU5hbWUsIGNvbXBvbmVudE5hbWUsIHRlc3RGbikge1xuICAgIGlmICghcm91dGVzW3R5cGVOYW1lXSkge1xuICAgICAgcm91dGVzW3R5cGVOYW1lXSA9IFtdO1xuICAgIH1cbiAgICByb3V0ZXNbdHlwZU5hbWVdLnB1c2goe1xuICAgICAgY29tcG9uZW50OiBjb21wb25lbnROYW1lLFxuICAgICAgdGVzdDogdGVzdEZuXG4gICAgfSk7XG4gIH07XG5cbiAgcm91dGVQbHVnaW5zLmZvckVhY2goZnVuY3Rpb24gKHJvdXRlUGx1Z2luKSB7XG5cbiAgICByb3V0ZXIucm91dGUuYXBwbHkocm91dGVyLCByb3V0ZVBsdWdpbik7XG4gIH0pO1xuXG4gIHJvdXRlci5jb21wb25lbnRGb3JGaWVsZCA9IGZ1bmN0aW9uIChmaWVsZCkge1xuXG4gICAgdmFyIHR5cGVOYW1lID0gZmllbGQuZGVmLnR5cGU7XG5cbiAgICBpZiAocm91dGVzW3R5cGVOYW1lXSkge1xuICAgICAgdmFyIHJvdXRlc0ZvclR5cGUgPSByb3V0ZXNbdHlwZU5hbWVdO1xuICAgICAgdmFyIHJvdXRlID0gXy5maW5kKHJvdXRlc0ZvclR5cGUsIGZ1bmN0aW9uIChyb3V0ZSkge1xuICAgICAgICByZXR1cm4gIXJvdXRlLnRlc3QgfHwgcm91dGUudGVzdChmaWVsZCk7XG4gICAgICB9KTtcbiAgICAgIGlmIChyb3V0ZSkge1xuICAgICAgICByZXR1cm4gcGx1Z2luLmNvbXBvbmVudChyb3V0ZS5jb21wb25lbnQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwbHVnaW4uaGFzQ29tcG9uZW50KHR5cGVOYW1lKSkge1xuICAgICAgcmV0dXJuIHBsdWdpbi5jb21wb25lbnQodHlwZU5hbWUpO1xuICAgIH1cblxuICAgIHRocm93IG5ldyBFcnJvcignTm8gY29tcG9uZW50IGZvciBmaWVsZDogJyArIEpTT04uc3RyaW5naWZ5KGZpZWxkLmRlZikpO1xuICB9O1xuXG4gIHJvdXRlci5jb21wb25lbnQgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHJldHVybiBwbHVnaW4uY29tcG9uZW50KG5hbWUpO1xuICB9O1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxudmFyIHJvdXRlcyA9IHtcblxuICAnb2JqZWN0LmRlZmF1bHQnOiBbXG4gICAgJ29iamVjdCcsXG4gICAgJ2ZpZWxkc2V0J1xuICBdLFxuXG4gICdzdHJpbmcuY2hvaWNlcyc6IFtcbiAgICAnc3RyaW5nJyxcbiAgICAnc2VsZWN0JyxcbiAgICBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgIHJldHVybiBmaWVsZC5kZWYuY2hvaWNlcyA/IHRydWUgOiBmYWxzZTtcbiAgICB9XG4gIF0sXG5cbiAgJ3N0cmluZy50YWdzJzogW1xuICAgICdzdHJpbmcnLFxuICAgICdwcmV0dHktdGV4dGFyZWEnLFxuICAgIGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgcmV0dXJuIGZpZWxkLmRlZi5yZXBsYWNlVGFncztcbiAgICB9XG4gIF0sXG5cbiAgJ3N0cmluZy5zaW5nbGUtbGluZSc6IFtcbiAgICAnc3RyaW5nJyxcbiAgICAndGV4dCcsXG4gICAgZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICByZXR1cm4gZmllbGQuZGVmLm1heFJvd3MgPT09IDE7XG4gICAgfVxuICBdLFxuXG4gICdzdHJpbmcuZGVmYXVsdCc6IFtcbiAgICAnc3RyaW5nJyxcbiAgICAndGV4dGFyZWEnXG4gIF0sXG5cbiAgJ2FycmF5LmNob2ljZXMnOiBbXG4gICAgJ2FycmF5JyxcbiAgICAnY2hlY2tib3gtbGlzdCcsXG4gICAgZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICByZXR1cm4gZmllbGQuZGVmLmNob2ljZXMgPyB0cnVlIDogZmFsc2U7XG4gICAgfVxuICBdLFxuXG4gICdhcnJheS5kZWZhdWx0JzogW1xuICAgICdhcnJheScsXG4gICAgJ2xpc3QnXG4gIF0sXG5cbiAgJ2Jvb2xlYW4uZGVmYXVsdCc6IFtcbiAgICAnYm9vbGVhbicsXG4gICAgJ3NlbGVjdCdcbiAgXVxuXG59O1xuXG4vLyBCdWlsZCBhIHBsdWdpbiBidW5kbGUuXG5fLmVhY2gocm91dGVzLCBmdW5jdGlvbiAocm91dGUsIG5hbWUpIHtcbiAgbW9kdWxlLmV4cG9ydHNbJ2ZpZWxkLXJvdXRlLicgKyBuYW1lXSA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICBwbHVnaW4uZXhwb3J0cyA9IHJvdXRlO1xuICB9O1xufSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHZhciB1dGlsID0gcGx1Z2luLnJlcXVpcmUoJ3V0aWwnKTtcblxuICB2YXIgbG9hZGVyID0gcGx1Z2luLmV4cG9ydHM7XG5cbiAgdmFyIGlzTG9hZGluZyA9IHt9O1xuICB2YXIgc291cmNlcyA9IHt9O1xuXG4gIC8vIGxvYWRlci5wdXNoTmVlZHNLZXkgPSBmdW5jdGlvbiAoa2V5KSB7XG4gIC8vICAgaWYgKHRoaXMuX25lZWRzS2V5cy5pbmRleE9mKGtleSkgPCAwKSB7XG4gIC8vICAgICB0aGlzLl9uZWVkc0tleXMucHVzaChrZXkpO1xuICAvLyAgIH1cbiAgLy8gfTtcbiAgLy9cbiAgLy8gbG9hZGVyLm5leHROZWVkc0tleSA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gICByZXR1cm4gdGhpcy5fbmVlZHNLZXlzLnNoaWZ0KCk7XG4gIC8vIH07XG5cbiAgLy8gbG9hZGVyLmxvYWROZWVkZWRNZXRhZGF0YSA9IGZ1bmN0aW9uIChmb3JtKSB7XG4gIC8vXG4gIC8vICAgdmFyIGtleSA9IGxvYWRlci5uZXh0TmVlZHNLZXkoKTtcbiAgLy9cbiAgLy8gICB3aGlsZSAoa2V5KSB7XG4gIC8vICAgICBpZiAoIWlzTG9hZGluZ1trZXldKSB7XG4gIC8vICAgICAgIGlzTG9hZGluZ1trZXldID0gdHJ1ZTtcbiAgLy8gICAgICAgbG9hZGVyLmxvYWRBc3luY0Zyb21Tb3VyY2UoZm9ybSwga2V5KTtcbiAgLy8gICAgIH1cbiAgLy8gICAgIGtleSA9IGxvYWRlci5uZXh0TmVlZHNLZXkoKTtcbiAgLy8gICB9XG4gIC8vIH07XG5cbiAgbG9hZGVyLmxvYWRNZXRhID0gZnVuY3Rpb24gKGZvcm0sIGtleXMpIHtcbiAgICBsb2FkZXIubG9hZEFzeW5jRnJvbVNvdXJjZShmb3JtLCB1dGlsLmpvaW5NZXRhS2V5cyhrZXlzKSk7XG4gIH07XG5cbiAgbG9hZGVyLmxvYWRBc3luY0Zyb21Tb3VyY2UgPSBmdW5jdGlvbiAoZm9ybSwga2V5LCB3YWl0VGltZSkge1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgbG9hZGVyLmxvYWRGcm9tU291cmNlKGZvcm0sIGtleSk7XG4gICAgfSwgd2FpdFRpbWUgfHwgMCk7XG4gIH07XG5cbiAgbG9hZGVyLmxvYWRGcm9tU291cmNlID0gZnVuY3Rpb24gKGZvcm0sIGtleSkge1xuXG4gICAgdmFyIHNvdXJjZSA9IGxvYWRlci5iZXN0U291cmNlKGZvcm0sIGtleSk7XG4gICAgaWYgKHNvdXJjZSkge1xuICAgICAgdmFyIGFyZ3MgPSB1dGlsLnNwbGl0TWV0YUtleShrZXkpO1xuICAgICAgYXJncyA9IGFyZ3Muc2xpY2Uoc291cmNlLnN0YXRpY0FyZ3MubGVuZ3RoKTtcblxuICAgICAgdmFyIHJlc3VsdCA9IHNvdXJjZS5mbi5hcHBseShudWxsLCBhcmdzKTtcblxuICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICBpZiAocmVzdWx0LnRoZW4pIHtcbiAgICAgICAgICB2YXIgcHJvbWlzZSA9IHJlc3VsdC50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgIGZvcm0ubWV0YShrZXksIHJlc3VsdCk7XG4gICAgICAgICAgICBpc0xvYWRpbmdba2V5XSA9IGZhbHNlO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgdmFyIG9uRXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpc0xvYWRpbmdba2V5XSA9IGZhbHNlO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICBpZiAocHJvbWlzZS5jYXRjaCkge1xuICAgICAgICAgICAgcHJvbWlzZS5jYXRjaChvbkVycm9yKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gc2lsbHkgalF1ZXJ5IHByb21pc2VzXG4gICAgICAgICAgICBwcm9taXNlLmZhaWwob25FcnJvcik7XG4gICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmb3JtLm1ldGEoa2V5LCByZXN1bHQpO1xuICAgICAgICAgICAgaXNMb2FkaW5nW2tleV0gPSBmYWxzZTtcbiAgICAgICAgICB9LCAwKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaXNMb2FkaW5nW2tleV0gPSBmYWxzZTtcbiAgICAgIH1cblxuICAgIH0gZWxzZSB7XG4gICAgICBpc0xvYWRpbmdba2V5XSA9IGZhbHNlO1xuICAgIH1cbiAgfTtcblxuICBsb2FkZXIuYmVzdFNvdXJjZSA9IGZ1bmN0aW9uIChmb3JtLCBrZXkpIHtcbiAgICBpZiAoc291cmNlc1trZXldKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdGF0aWNBcmdzOiB1dGlsLnNwbGl0TWV0YUtleShrZXkpLFxuICAgICAgICBmbjogc291cmNlc1trZXldXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgYXJncyA9IHV0aWwuc3BsaXRNZXRhS2V5KGtleSk7XG4gICAgICBpZiAoYXJncy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGFyZ3MgPSBhcmdzLnNsaWNlKDAsIGFyZ3MubGVuZ3RoIC0gMSk7XG4gICAgICAgIHJldHVybiBsb2FkZXIuYmVzdFNvdXJjZShmb3JtLCB1dGlsLmpvaW5NZXRhS2V5cyhhcmdzKSk7XG4gICAgICB9IGVsc2UgaWYgKHNvdXJjZXMuX19kZWZhdWx0X18pIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzdGF0aWNBcmdzOiBbXSxcbiAgICAgICAgICBmbjogc291cmNlcy5fX2RlZmF1bHRfX1xuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGxvYWRlci5zb3VyY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGFyZ3MgPSBfLnRvQXJyYXkoYXJndW1lbnRzKTtcblxuICAgIGlmIChhcmdzLmxlbmd0aCA+IDAgJiYgXy5pc0Z1bmN0aW9uKGFyZ3NbYXJncy5sZW5ndGggLSAxXSkpIHtcbiAgICAgIHZhciBmbiA9IGFyZ3NbYXJncy5sZW5ndGggLSAxXTtcbiAgICAgIHZhciBzb3VyY2VLZXkgPSAnX19kZWZhdWx0X18nO1xuICAgICAgaWYgKGFyZ3MubGVuZ3RoID4gMSkge1xuICAgICAgICBzb3VyY2VLZXkgPSB1dGlsLmpvaW5NZXRhS2V5cyhhcmdzLnNsaWNlKDAsIGFyZ3MubGVuZ3RoIC0gMSkpO1xuICAgICAgfVxuICAgICAgc291cmNlc1tzb3VyY2VLZXldID0gZm47XG4gICAgfVxuICB9O1xuXG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcblxuICB2YXIgdXRpbCA9IHBsdWdpbi5leHBvcnRzO1xuXG4gIHV0aWwuaXNCbGFuayA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsICYmIHZhbHVlID09PSAnJztcbiAgfTtcblxuICB1dGlsLnNldEluID0gZnVuY3Rpb24gKG9iaiwgcGF0aCwgdmFsdWUpIHtcbiAgICBpZiAocGF0aC5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgaWYgKHBhdGgubGVuZ3RoID09PSAxKSB7XG4gICAgICBvYmpbcGF0aFswXV0gPSB2YWx1ZTtcbiAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuICAgIGlmICghb2JqW3BhdGhbMF1dKSB7XG4gICAgICBvYmpbcGF0aFswXV0gPSB7fTtcbiAgICB9XG4gICAgdXRpbC5zZXRJbihvYmpbcGF0aFswXV0sIHBhdGguc2xpY2UoMSksIHZhbHVlKTtcbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIHV0aWwucmVtb3ZlSW4gPSBmdW5jdGlvbiAob2JqLCBwYXRoKSB7XG4gICAgaWYgKHBhdGgubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKHBhdGgubGVuZ3RoID09PSAxKSB7XG4gICAgICBpZiAoXy5pc0FycmF5KG9iaikpIHtcbiAgICAgICAgaWYgKF8uaXNOdW1iZXIocGF0aFswXSkpIHtcbiAgICAgICAgICBvYmouc3BsaWNlKHBhdGhbMF0sIDEpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKF8uaXNPYmplY3Qob2JqKSkge1xuICAgICAgICBkZWxldGUgb2JqW3BhdGhbMF1dO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG4gICAgaWYgKG9ialtwYXRoWzBdXSkge1xuICAgICAgdXRpbC5yZW1vdmVJbihvYmpbcGF0aFswXV0sIHBhdGguc2xpY2UoMSkpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIHV0aWwuZ2V0SW4gPSBmdW5jdGlvbiAob2JqLCBwYXRoKSB7XG4gICAgaWYgKHBhdGgubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH1cbiAgICBpZiAob2JqW3BhdGhbMF1dKSB7XG4gICAgICByZXR1cm4gdXRpbC5nZXRJbihvYmpbcGF0aFswXV0sIHBhdGguc2xpY2UoMSkpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcblxuICB1dGlsLmFwcGVuZEluID0gZnVuY3Rpb24gKG9iaiwgcGF0aCwgdmFsdWUpIHtcbiAgICB2YXIgc3ViT2JqID0gdXRpbC5nZXRJbihvYmosIHBhdGgpO1xuICAgIGlmIChfLmlzQXJyYXkoc3ViT2JqKSkge1xuICAgICAgc3ViT2JqLnB1c2godmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIHV0aWwubW92ZUluID0gZnVuY3Rpb24gKG9iaiwgcGF0aCwgZnJvbUtleSwgdG9LZXkpIHtcbiAgICB2YXIgc3ViT2JqID0gdXRpbC5nZXRJbihvYmosIHBhdGgpO1xuICAgIGlmIChfLmlzQXJyYXkoc3ViT2JqKSkge1xuICAgICAgaWYgKF8uaXNOdW1iZXIoZnJvbUtleSkgJiYgXy5pc051bWJlcih0b0tleSkpIHtcbiAgICAgICAgdmFyIGZyb21JbmRleCA9IGZyb21LZXk7XG4gICAgICAgIHZhciB0b0luZGV4ID0gdG9LZXk7XG4gICAgICAgIGlmIChmcm9tSW5kZXggIT09IHRvSW5kZXggJiZcbiAgICAgICAgICBmcm9tSW5kZXggPj0gMCAmJiBmcm9tSW5kZXggPCBzdWJPYmoubGVuZ3RoICYmXG4gICAgICAgICAgdG9JbmRleCA+PSAwICYmIHRvSW5kZXggPCBzdWJPYmoubGVuZ3RoXG4gICAgICAgICkge1xuICAgICAgICAgIHN1Yk9iai5zcGxpY2UodG9JbmRleCwgMCwgc3ViT2JqLnNwbGljZShmcm9tSW5kZXgsIDEpWzBdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZnJvbVZhbHVlID0gc3ViT2JqW2Zyb21LZXldO1xuICAgICAgc3ViT2JqW2Zyb21LZXldID0gc3ViT2JqW3RvS2V5XTtcbiAgICAgIHN1Yk9ialt0b0tleV0gPSBmcm9tVmFsdWU7XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgdXRpbC5jb3B5VmFsdWUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh2YWx1ZSkpO1xuICB9O1xuXG4gIHV0aWwuZGVlcENvcHkgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgaWYgKF8uaXNBcnJheShvYmopKSB7XG4gICAgICByZXR1cm4gb2JqLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICByZXR1cm4gdXRpbC5kZWVwQ29weShpdGVtKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoXy5pc09iamVjdChvYmopKSB7XG4gICAgICB2YXIgY29weSA9IHt9O1xuICAgICAgXy5lYWNoKG9iaiwgZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgY29weVtrZXldID0gdXRpbC5kZWVwQ29weSh2YWx1ZSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBjb3B5O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH1cbiAgfTtcblxuICB1dGlsLml0ZW1NYXRjaGVzVmFsdWUgPSBmdW5jdGlvbiAoaXRlbSwgdmFsdWUpIHtcbiAgICB2YXIgbWF0Y2ggPSBpdGVtLm1hdGNoO1xuICAgIGlmICghbWF0Y2gpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gXy5ldmVyeShfLmtleXMobWF0Y2gpLCBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICByZXR1cm4gXy5pc0VxdWFsKG1hdGNoW2tleV0sIHZhbHVlW2tleV0pO1xuICAgIH0pO1xuICB9O1xuXG4gIHV0aWwuZmllbGREZWZGcm9tVmFsdWUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YXIgZGVmID0ge1xuICAgICAgdHlwZTogJ2pzb24nXG4gICAgfTtcbiAgICBpZiAoXy5pc1N0cmluZyh2YWx1ZSkpIHtcbiAgICAgIGRlZiA9IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmIChfLmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICB2YXIgYXJyYXlJdGVtRmllbGRzID0gdmFsdWUubWFwKGZ1bmN0aW9uICh2YWx1ZSwgaSkge1xuICAgICAgICB2YXIgY2hpbGREZWYgPSB1dGlsLmZpZWxkRGVmRnJvbVZhbHVlKHZhbHVlKTtcbiAgICAgICAgY2hpbGREZWYua2V5ID0gaTtcbiAgICAgICAgcmV0dXJuIGNoaWxkRGVmO1xuICAgICAgfSk7XG4gICAgICBkZWYgPSB7XG4gICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgIGZpZWxkczogYXJyYXlJdGVtRmllbGRzXG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAoXy5pc09iamVjdCh2YWx1ZSkpIHtcbiAgICAgIHZhciBvYmplY3RJdGVtRmllbGRzID0gT2JqZWN0LmtleXModmFsdWUpLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIHZhciBjaGlsZERlZiA9IHV0aWwuZmllbGREZWZGcm9tVmFsdWUodmFsdWVba2V5XSk7XG4gICAgICAgIGNoaWxkRGVmLmtleSA9IGtleTtcbiAgICAgICAgY2hpbGREZWYubGFiZWwgPSB1dGlsLmh1bWFuaXplKGtleSk7XG4gICAgICAgIHJldHVybiBjaGlsZERlZjtcbiAgICAgIH0pO1xuICAgICAgZGVmID0ge1xuICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgZmllbGRzOiBvYmplY3RJdGVtRmllbGRzXG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAoXy5pc051bGwodmFsdWUpKSB7XG4gICAgICBkZWYgPSB7XG4gICAgICAgIHR5cGU6ICdudWxsJ1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIGRlZjtcbiAgfTtcblxuICB1dGlsLmh1bWFuaXplID0gZnVuY3Rpb24ocHJvcGVydHkpIHtcbiAgICBwcm9wZXJ0eSA9IHByb3BlcnR5LnJlcGxhY2UoL1xce1xcey9nLCAnJyk7XG4gICAgcHJvcGVydHkgPSBwcm9wZXJ0eS5yZXBsYWNlKC9cXH1cXH0vZywgJycpO1xuICAgIHJldHVybiBwcm9wZXJ0eS5yZXBsYWNlKC9fL2csICcgJylcbiAgICAgIC5yZXBsYWNlKC8oXFx3KykvZywgZnVuY3Rpb24obWF0Y2gpIHtcbiAgICAgICAgcmV0dXJuIG1hdGNoLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgbWF0Y2guc2xpY2UoMSk7XG4gICAgICB9KTtcbiAgfTtcblxuICB1dGlsLmNsYXNzTmFtZSA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjbGFzc05hbWVzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKTtcblxuICAgIGNsYXNzTmFtZXMgPSBjbGFzc05hbWVzLmZpbHRlcihmdW5jdGlvbiAobmFtZSkge1xuICAgICAgcmV0dXJuIG5hbWU7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY2xhc3NOYW1lcy5qb2luKCcgJyk7XG4gIH07XG5cbiAgdXRpbC5qb2luTWV0YUtleXMgPSBmdW5jdGlvbiAoa2V5cykge1xuICAgIHJldHVybiBrZXlzLmpvaW4oJzo6Jyk7XG4gIH07XG5cbiAgdXRpbC5zcGxpdE1ldGFLZXkgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgcmV0dXJuIGtleS5zcGxpdCgnOjonKTtcbiAgfTtcblxuICB2YXIgdGV4dFBhcnQgPSBmdW5jdGlvbiAodmFsdWUsIHR5cGUpIHtcbiAgICB0eXBlID0gdHlwZSB8fCAndGV4dCc7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IHR5cGUsXG4gICAgICB2YWx1ZTogdmFsdWVcbiAgICB9O1xuICB9O1xuXG4gIHV0aWwucGFyc2VUZXh0V2l0aFRhZ3MgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YWx1ZSA9IHZhbHVlIHx8ICcnO1xuICAgIHZhciBwYXJ0cyA9IHZhbHVlLnNwbGl0KCd7eycpO1xuICAgIHZhciBmcm9udFBhcnQgPSBbXTtcbiAgICBpZiAocGFydHNbMF0gIT09ICcnKSB7XG4gICAgICBmcm9udFBhcnQgPSBbXG4gICAgICAgIHRleHRQYXJ0KHBhcnRzWzBdKVxuICAgICAgXTtcbiAgICB9XG4gICAgcGFydHMgPSBmcm9udFBhcnQuY29uY2F0KFxuICAgICAgcGFydHMuc2xpY2UoMSkubWFwKGZ1bmN0aW9uIChwYXJ0KSB7XG4gICAgICAgIGlmIChwYXJ0LmluZGV4T2YoJ319JykgPj0gMCkge1xuICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICB0ZXh0UGFydChwYXJ0LnN1YnN0cmluZygwLCBwYXJ0LmluZGV4T2YoJ319JykpLCAndGFnJyksXG4gICAgICAgICAgICB0ZXh0UGFydChwYXJ0LnN1YnN0cmluZyhwYXJ0LmluZGV4T2YoJ319JykgKyAyKSlcbiAgICAgICAgICBdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0ZXh0UGFydCgne3snICsgcGFydCwgJ3RleHQnKTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICApO1xuICAgIHJldHVybiBbXS5jb25jYXQuYXBwbHkoW10sIHBhcnRzKTtcbiAgfTtcblxufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxudmFyIHBsdWdpblJlZ2lzdHJ5ID0ge307XG5cbnZhciByZWdpc3RlclBsdWdpbiA9IGZ1bmN0aW9uIChuYW1lLCBwbHVnaW5GYWN0b3J5KSB7XG5cbiAgaWYgKHBsdWdpblJlZ2lzdHJ5W25hbWVdKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdQbHVnaW4gJyArIG5hbWUgKyAnIGlzIGFscmVhZHkgcmVnaXN0ZXJlZC4nKTtcbiAgfVxuXG4gIGlmIChfLmlzQXJyYXkocGx1Z2luRmFjdG9yeSkpIHtcbiAgICBwbHVnaW5SZWdpc3RyeVtuYW1lXSA9IFtdO1xuICAgIHBsdWdpbkZhY3RvcnkuZm9yRWFjaChmdW5jdGlvbiAocGx1Z2luU3BlYykge1xuICAgICAgcmVnaXN0ZXJQbHVnaW4ocGx1Z2luU3BlYy5uYW1lLCBwbHVnaW5TcGVjLnBsdWdpbik7XG4gICAgICBwbHVnaW5SZWdpc3RyeVtuYW1lXS5wdXNoKHBsdWdpblNwZWMubmFtZSk7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAoXy5pc09iamVjdChwbHVnaW5GYWN0b3J5KSAmJiAhXy5pc0Z1bmN0aW9uKHBsdWdpbkZhY3RvcnkpKSB7XG4gICAgdmFyIGJ1bmRsZU5hbWUgPSBuYW1lO1xuICAgIHBsdWdpblJlZ2lzdHJ5W2J1bmRsZU5hbWVdID0gW107XG4gICAgT2JqZWN0LmtleXMocGx1Z2luRmFjdG9yeSkuZm9yRWFjaChmdW5jdGlvbiAobmFtZSkge1xuICAgICAgcmVnaXN0ZXJQbHVnaW4obmFtZSwgcGx1Z2luRmFjdG9yeVtuYW1lXSk7XG4gICAgICBwbHVnaW5SZWdpc3RyeVtidW5kbGVOYW1lXS5wdXNoKG5hbWUpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHBsdWdpblJlZ2lzdHJ5W25hbWVdID0gcGx1Z2luRmFjdG9yeTtcbiAgfVxufTtcblxudmFyIGRlZmF1bHRQbHVnaW5Db25maWcgPSB7XG4gIGNvcmU6IHtcbiAgICBmb3JtYXRpYzogWydjb3JlLmZvcm1hdGljJ10sXG4gICAgZm9ybTogWydjb3JlLmZvcm0taW5pdCcsICdjb3JlLmZvcm0nLCAnY29yZS5maWVsZCddXG4gIH0sXG4gICdjb3JlLmZvcm0nOiB7XG4gICAgc3RvcmU6ICdzdG9yZS5tZW1vcnknXG4gIH0sXG4gICdmaWVsZC1yb3V0ZXInOiB7XG4gICAgcm91dGVzOiBbJ2ZpZWxkLXJvdXRlcyddXG4gIH0sXG4gIGNvbXBpbGVyOiB7XG4gICAgY29tcGlsZXJzOiBbJ2NvbXBpbGVyLmNob2ljZXMnLCAnY29tcGlsZXIubG9va3VwJywgJ2NvbXBpbGVyLnR5cGVzJywgJ2NvbXBpbGVyLnByb3AtYWxpYXNlcyddXG4gIH1cbn07XG5cbnZhciBGb3JtYXRpYyA9IGZ1bmN0aW9uIChjb25maWcpIHtcblxuICBjb25maWcgPSBfLmV4dGVuZCh7fSwgY29uZmlnKTtcblxuICBfLmtleXMoZGVmYXVsdFBsdWdpbkNvbmZpZykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgY29uZmlnW2tleV0gPSBfLmV4dGVuZCh7fSwgZGVmYXVsdFBsdWdpbkNvbmZpZ1trZXldLCBjb25maWdba2V5XSk7XG4gIH0pO1xuXG4gIHZhciBmb3JtYXRpYywgUGx1Z2luO1xuXG4gIHZhciBwbHVnaW5DYWNoZSA9IHt9O1xuXG4gIC8vIFBsdWdpblxuXG4gIFBsdWdpbiA9IGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgUGx1Z2luKSkge1xuICAgICAgcmV0dXJuIG5ldyBQbHVnaW4oY29uZmlnKTtcbiAgICB9XG4gICAgdGhpcy5leHBvcnRzID0ge307XG4gICAgdGhpcy5jb25maWcgPSBjb25maWcgfHwge307XG4gIH07XG5cbiAgUGx1Z2luLnByb3RvdHlwZS5jb25maWdWYWx1ZSA9IGZ1bmN0aW9uIChrZXksIGRlZmF1bHRWYWx1ZSkge1xuXG4gICAgaWYgKHR5cGVvZiB0aGlzLmNvbmZpZ1trZXldICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuIHRoaXMuY29uZmlnW2tleV07XG4gICAgfVxuICAgIHJldHVybiBkZWZhdWx0VmFsdWUgfHwgJyc7XG4gIH07XG5cbiAgUGx1Z2luLnByb3RvdHlwZS5yZXF1aXJlID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICByZXR1cm4gZm9ybWF0aWMucGx1Z2luKG5hbWUpO1xuICB9O1xuXG4gIHZhciBjb21wb25lbnRQbHVnaW47XG5cbiAgLy8gSnVzdCBoZXJlIGluIGNhc2Ugd2Ugd2FudCB0byBkeW5hbWljYWxseSBjaG9vc2UgY29tcG9uZW50IGxhdGVyLlxuICBQbHVnaW4ucHJvdG90eXBlLmNvbXBvbmVudCA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgcmV0dXJuIGNvbXBvbmVudFBsdWdpbi5jb21wb25lbnQobmFtZSk7XG4gIH07XG5cbiAgUGx1Z2luLnByb3RvdHlwZS5oYXNQbHVnaW4gPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHJldHVybiAobmFtZSBpbiBwbHVnaW5DYWNoZSkgfHwgKG5hbWUgaW4gcGx1Z2luUmVnaXN0cnkpO1xuICB9O1xuXG4gIFBsdWdpbi5wcm90b3R5cGUuaGFzQ29tcG9uZW50ID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5oYXNQbHVnaW4oJ2NvbXBvbmVudC4nICsgbmFtZSk7XG4gIH07XG5cbiAgUGx1Z2luLnByb3RvdHlwZS5yZXF1aXJlQWxsID0gZnVuY3Rpb24gKHBsdWdpbkxpc3QpIHtcbiAgICBpZiAoIXBsdWdpbkxpc3QpIHtcbiAgICAgIHBsdWdpbkxpc3QgPSBbXTtcbiAgICB9XG4gICAgaWYgKCFfLmlzQXJyYXkocGx1Z2luTGlzdCkpIHtcbiAgICAgIHBsdWdpbkxpc3QgPSBbcGx1Z2luTGlzdF07XG4gICAgfVxuICAgIC8vIEluZmxhdGUgcmVnaXN0ZXJlZCBidW5kbGVzLlxuICAgIHBsdWdpbkxpc3QgPSBwbHVnaW5MaXN0Lm1hcChmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgICBpZiAoXy5pc1N0cmluZyhwbHVnaW4pKSB7XG4gICAgICAgIGlmIChfLmlzQXJyYXkocGx1Z2luUmVnaXN0cnlbcGx1Z2luXSkpIHtcbiAgICAgICAgICByZXR1cm4gcGx1Z2luUmVnaXN0cnlbcGx1Z2luXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHBsdWdpbjtcbiAgICB9KTtcbiAgICAvLyBGbGF0dGVuIGJ1bmRsZXMuXG4gICAgcGx1Z2luTGlzdCA9IF8uZmxhdHRlbihwbHVnaW5MaXN0KTtcbiAgICByZXR1cm4gcGx1Z2luTGlzdC5tYXAoZnVuY3Rpb24gKHBsdWdpbikge1xuICAgICAgcmV0dXJuIHRoaXMucmVxdWlyZShwbHVnaW4pO1xuICAgIH0uYmluZCh0aGlzKSk7XG4gIH07XG5cbiAgdmFyIGxvYWRQbHVnaW4gPSBmdW5jdGlvbiAobmFtZSwgcGx1Z2luQ29uZmlnKSB7XG4gICAgdmFyIHBsdWdpbjtcblxuICAgIGlmIChfLmlzRnVuY3Rpb24obmFtZSkpIHtcblxuICAgICAgdmFyIGZhY3RvcnkgPSBuYW1lO1xuXG4gICAgICBpZiAoXy5pc1VuZGVmaW5lZChmYWN0b3J5Ll9fZXhwb3J0c19fKSkge1xuICAgICAgICBwbHVnaW4gPSBQbHVnaW4ocGx1Z2luQ29uZmlnIHx8IHt9KTtcbiAgICAgICAgZmFjdG9yeShwbHVnaW4pO1xuICAgICAgICBmYWN0b3J5Ll9fZXhwb3J0c19fID0gcGx1Z2luLmV4cG9ydHM7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWN0b3J5Ll9fZXhwb3J0c19fO1xuXG4gICAgfSBlbHNlIGlmIChfLmlzVW5kZWZpbmVkKHBsdWdpbkNhY2hlW25hbWVdKSkge1xuXG4gICAgICBpZiAoIXBsdWdpbkNvbmZpZyAmJiBjb25maWdbbmFtZV0pIHtcbiAgICAgICAgaWYgKGNvbmZpZ1tuYW1lXS5wbHVnaW4pIHtcbiAgICAgICAgICByZXR1cm4gbG9hZFBsdWdpbihjb25maWdbbmFtZV0ucGx1Z2luLCBjb25maWdbbmFtZV0gfHwge30pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChwbHVnaW5SZWdpc3RyeVtuYW1lXSkge1xuICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKHBsdWdpblJlZ2lzdHJ5W25hbWVdKSkge1xuICAgICAgICAgIHBsdWdpbiA9IFBsdWdpbihwbHVnaW5Db25maWcgfHwgY29uZmlnW25hbWVdKTtcbiAgICAgICAgICBwbHVnaW5SZWdpc3RyeVtuYW1lXShwbHVnaW4pO1xuICAgICAgICAgIHBsdWdpbkNhY2hlW25hbWVdID0gcGx1Z2luLmV4cG9ydHM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQbHVnaW4gJyArIG5hbWUgKyAnIGlzIG5vdCBhIGZ1bmN0aW9uLicpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BsdWdpbiAnICsgbmFtZSArICcgbm90IGZvdW5kLicpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcGx1Z2luQ2FjaGVbbmFtZV07XG4gIH07XG5cbiAgZm9ybWF0aWMgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIHJldHVybiBmb3JtYXRpYy5mb3JtKG9wdGlvbnMpO1xuICB9O1xuXG4gIGZvcm1hdGljLnJlZ2lzdGVyID0gZnVuY3Rpb24gKG5hbWUsIHBsdWdpbkZhY3RvcnkpIHtcbiAgICByZWdpc3RlclBsdWdpbihuYW1lLCBwbHVnaW5GYWN0b3J5KTtcbiAgICByZXR1cm4gZm9ybWF0aWM7XG4gIH07XG5cbiAgZm9ybWF0aWMucGx1Z2luID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICByZXR1cm4gbG9hZFBsdWdpbihuYW1lKTtcbiAgfTtcblxuICBmb3JtYXRpYy5jcmVhdGUgPSBGb3JtYXRpYztcblxuICB2YXIgY29yZSA9IGxvYWRQbHVnaW4oJ2NvcmUnKTtcblxuICBjb3JlKGZvcm1hdGljKTtcblxuICAvLyBCaW5kaW5nIHRoZSBjb21wb25lbnQgcGx1Z2luIGxhdGUgc28gaXQgY2FuIGxvYWQgcGx1Z2lucyBhZnRlciBjb3JlIGlzXG4gIC8vIGxvYWRlZC5cbiAgY29tcG9uZW50UGx1Z2luID0gbG9hZFBsdWdpbignY29tcG9uZW50Jyk7XG5cbiAgcmV0dXJuIGZvcm1hdGljO1xufTtcblxudmFyIHJlZ2lzdGVyUGx1Z2lucyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGFyZyA9IF8udG9BcnJheShhcmd1bWVudHMpO1xuICBhcmcuZm9yRWFjaChmdW5jdGlvbiAoYXJnKSB7XG4gICAgdmFyIG5hbWUgPSBhcmdbMF07XG4gICAgdmFyIHBsdWdpbiA9IGFyZ1sxXTtcbiAgICByZWdpc3RlclBsdWdpbihuYW1lLCBwbHVnaW4pO1xuICB9KTtcbn07XG5cbnJlZ2lzdGVyUGx1Z2lucyhcbiAgWydjb3JlJywgcmVxdWlyZSgnLi9kZWZhdWx0L2NvcmUnKV0sXG5cbiAgWydjb3JlLmZvcm1hdGljJywgcmVxdWlyZSgnLi9jb3JlL2Zvcm1hdGljJyldLFxuICBbJ2NvcmUuZm9ybS1pbml0JywgcmVxdWlyZSgnLi9jb3JlL2Zvcm0taW5pdCcpXSxcbiAgWydjb3JlLmZvcm0nLCByZXF1aXJlKCcuL2NvcmUvZm9ybScpXSxcbiAgWydjb3JlLmZpZWxkJywgcmVxdWlyZSgnLi9jb3JlL2ZpZWxkJyldLFxuXG4gIFsndXRpbCcsIHJlcXVpcmUoJy4vZGVmYXVsdC91dGlsJyldLFxuICBbJ2NvbXBpbGVyJywgcmVxdWlyZSgnLi9kZWZhdWx0L2NvbXBpbGVyJyldLFxuICBbJ2V2YWwnLCByZXF1aXJlKCcuL2RlZmF1bHQvZXZhbCcpXSxcbiAgWydsb2FkZXInLCByZXF1aXJlKCcuL2RlZmF1bHQvbG9hZGVyJyldLFxuICBbJ2ZpZWxkLXJvdXRlcicsIHJlcXVpcmUoJy4vZGVmYXVsdC9maWVsZC1yb3V0ZXInKV0sXG4gIFsnZmllbGQtcm91dGVzJywgcmVxdWlyZSgnLi9kZWZhdWx0L2ZpZWxkLXJvdXRlcycpXSxcblxuICBbJ2NvbXBpbGVyLmNob2ljZXMnLCByZXF1aXJlKCcuL2NvbXBpbGVycy9jaG9pY2VzJyldLFxuICBbJ2NvbXBpbGVyLmxvb2t1cCcsIHJlcXVpcmUoJy4vY29tcGlsZXJzL2xvb2t1cCcpXSxcbiAgWydjb21waWxlci50eXBlcycsIHJlcXVpcmUoJy4vY29tcGlsZXJzL3R5cGVzJyldLFxuICBbJ2NvbXBpbGVyLnByb3AtYWxpYXNlcycsIHJlcXVpcmUoJy4vY29tcGlsZXJzL3Byb3AtYWxpYXNlcycpXSxcblxuICBbJ3N0b3JlLm1lbW9yeScsIHJlcXVpcmUoJy4vc3RvcmUvbWVtb3J5JyldLFxuXG4gIFsndHlwZS5yb290JywgcmVxdWlyZSgnLi90eXBlcy9yb290JyldLFxuICBbJ3R5cGUuc3RyaW5nJywgcmVxdWlyZSgnLi90eXBlcy9zdHJpbmcnKV0sXG4gIFsndHlwZS5vYmplY3QnLCByZXF1aXJlKCcuL3R5cGVzL29iamVjdCcpXSxcbiAgWyd0eXBlLmJvb2xlYW4nLCByZXF1aXJlKCcuL3R5cGVzL2Jvb2xlYW4nKV0sXG4gIFsndHlwZS5hcnJheScsIHJlcXVpcmUoJy4vdHlwZXMvYXJyYXknKV0sXG4gIFsndHlwZS5qc29uJywgcmVxdWlyZSgnLi90eXBlcy9qc29uJyldLFxuXG4gIFsnY29tcG9uZW50JywgcmVxdWlyZSgnLi9kZWZhdWx0L2NvbXBvbmVudCcpXSxcblxuICBbJ2NvbXBvbmVudC5mb3JtYXRpYycsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9mb3JtYXRpYycpXSxcbiAgWydjb21wb25lbnQucm9vdCcsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9yb290JyldLFxuICBbJ2NvbXBvbmVudC5maWVsZCcsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZCcpXSxcbiAgWydjb21wb25lbnQubGFiZWwnLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvbGFiZWwnKV0sXG4gIFsnY29tcG9uZW50LmhlbHAnLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscCcpXSxcbiAgWydjb21wb25lbnQuZmllbGRzZXQnLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzZXQnKV0sXG4gIFsnY29tcG9uZW50LnRleHQnLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvdGV4dCcpXSxcbiAgWydjb21wb25lbnQudGV4dGFyZWEnLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvdGV4dGFyZWEnKV0sXG4gIFsnY29tcG9uZW50LnNlbGVjdCcsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9zZWxlY3QnKV0sXG4gIFsnY29tcG9uZW50Lmxpc3QnLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvbGlzdCcpXSxcbiAgWydjb21wb25lbnQubGlzdC1jb250cm9sJywgcmVxdWlyZSgnLi9jb21wb25lbnRzL2xpc3QtY29udHJvbCcpXSxcbiAgWydjb21wb25lbnQubGlzdC1pdGVtJywgcmVxdWlyZSgnLi9jb21wb25lbnRzL2xpc3QtaXRlbScpXSxcbiAgWydjb21wb25lbnQubGlzdC1pdGVtLXZhbHVlJywgcmVxdWlyZSgnLi9jb21wb25lbnRzL2xpc3QtaXRlbS12YWx1ZScpXSxcbiAgWydjb21wb25lbnQubGlzdC1pdGVtLWNvbnRyb2wnLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvbGlzdC1pdGVtLWNvbnRyb2wnKV0sXG4gIFsnY29tcG9uZW50Lml0ZW0tY2hvaWNlcycsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9pdGVtLWNob2ljZXMnKV0sXG4gIFsnY29tcG9uZW50LmFkZC1pdGVtJywgcmVxdWlyZSgnLi9jb21wb25lbnRzL2FkZC1pdGVtJyldLFxuICBbJ2NvbXBvbmVudC5yZW1vdmUtaXRlbScsIHJlcXVpcmUoJy4vY29tcG9uZW50cy9yZW1vdmUtaXRlbScpXSxcbiAgWydjb21wb25lbnQubW92ZS1pdGVtLWJhY2snLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvbW92ZS1pdGVtLWJhY2snKV0sXG4gIFsnY29tcG9uZW50Lm1vdmUtaXRlbS1mb3J3YXJkJywgcmVxdWlyZSgnLi9jb21wb25lbnRzL21vdmUtaXRlbS1mb3J3YXJkJyldLFxuICBbJ2NvbXBvbmVudC5qc29uJywgcmVxdWlyZSgnLi9jb21wb25lbnRzL2pzb24nKV0sXG4gIFsnY29tcG9uZW50LmNoZWNrYm94LWxpc3QnLCByZXF1aXJlKCcuL2NvbXBvbmVudHMvY2hlY2tib3gtbGlzdCcpXSxcbiAgWydjb21wb25lbnQucHJldHR5LXRleHRhcmVhJywgcmVxdWlyZSgnLi9jb21wb25lbnRzL3ByZXR0eS10ZXh0YXJlYScpXSxcblxuICBbJ2Jvb3RzdHJhcCcsIHJlcXVpcmUoJy4vcGx1Z2lucy9ib290c3RyYXAnKV1cbik7XG5cbnZhciBkZWZhdWx0Rm9ybWF0aWMgPSBGb3JtYXRpYygpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmF1bHRGb3JtYXRpYztcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxudmFyIG1vZGlmaWVycyA9IHtcblxuICAnZmllbGQnOiB7Y2xhc3NOYW1lOiAnZm9ybS1ncm91cCd9LFxuICAnaGVscCc6IHtjbGFzc05hbWU6ICdoZWxwLWJsb2NrJ30sXG4gICd0ZXh0Jzoge2NsYXNzTmFtZTogJ2Zvcm0tY29udHJvbCd9LFxuICAndGV4dGFyZWEnOiB7Y2xhc3NOYW1lOiAnZm9ybS1jb250cm9sJ30sXG4gICdwcmV0dHktdGV4dGFyZWEnOiB7Y2xhc3NOYW1lOiAnZm9ybS1jb250cm9sJ30sXG4gICdqc29uJzoge2NsYXNzTmFtZTogJ2Zvcm0tY29udHJvbCd9LFxuICAnc2VsZWN0Jzoge2NsYXNzTmFtZTogJ2Zvcm0tY29udHJvbCd9LFxuICAnbGlzdCc6IHtjbGFzc05hbWU6ICd3ZWxsJ30sXG4gICdsaXN0LWNvbnRyb2wnOiB7Y2xhc3NOYW1lOiAnZm9ybS1pbmxpbmUnfSxcbiAgJ2xpc3QtaXRlbSc6IHtjbGFzc05hbWU6ICd3ZWxsJ30sXG4gICdpdGVtLWNob2ljZXMnOiB7Y2xhc3NOYW1lOiAnZm9ybS1jb250cm9sJ30sXG4gICdhZGQtaXRlbSc6IHtjbGFzc05hbWU6ICdnbHlwaGljb24gZ2x5cGhpY29uLXBsdXMnLCBsYWJlbDogJyd9LFxuICAncmVtb3ZlLWl0ZW0nOiB7Y2xhc3NOYW1lOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1yZW1vdmUnLCBsYWJlbDogJyd9LFxuICAnbW92ZS1pdGVtLWJhY2snOiB7Y2xhc3NOYW1lOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1hcnJvdy11cCcsIGxhYmVsOiAnJ30sXG4gICdtb3ZlLWl0ZW0tZm9yd2FyZCc6IHtjbGFzc05hbWU6ICdnbHlwaGljb24gZ2x5cGhpY29uLWFycm93LWRvd24nLCBsYWJlbDogJyd9XG59O1xuXG4vLyBCdWlsZCB0aGUgcGx1Z2luIGJ1bmRsZS5cbl8uZWFjaChtb2RpZmllcnMsIGZ1bmN0aW9uIChtb2RpZmllciwgbmFtZSkge1xuXG4gIGV4cG9ydHNbJ2NvbXBvbmVudC1wcm9wcy4nICsgbmFtZSArICcuYm9vdHN0cmFwJ10gPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgICB2YXIgdXRpbCA9IHBsdWdpbi5yZXF1aXJlKCd1dGlsJyk7XG5cbiAgICBwbHVnaW4uZXhwb3J0cyA9IFtcbiAgICAgIG5hbWUsXG4gICAgICBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKG1vZGlmaWVyLmNsYXNzTmFtZSkpIHtcbiAgICAgICAgICBwcm9wcy5jbGFzc05hbWUgPSB1dGlsLmNsYXNzTmFtZShwcm9wcy5jbGFzc05hbWUsIG1vZGlmaWVyLmNsYXNzTmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKG1vZGlmaWVyLmxhYmVsKSkge1xuICAgICAgICAgIHByb3BzLmxhYmVsID0gbW9kaWZpZXIubGFiZWw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBdO1xuICB9O1xuXG59KTtcblxuLy9mb3JtYXRpYy5jb25maWcoJ2NvbXBvbmVudC5mb3JtYXRpYy4uYXR0cmlidXRlcycsIHtyb2xlOiAnZm9ybSd9KTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVmbHV4ID0gcmVxdWlyZSgncmVmbHV4Jyk7XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgdmFyIGNvbXBpbGVyID0gcGx1Z2luLnJlcXVpcmUoJ2NvbXBpbGVyJyk7XG4gIHZhciB1dGlsID0gcGx1Z2luLnJlcXVpcmUoJ3V0aWwnKTtcblxuICBwbHVnaW4uZXhwb3J0cy5jcmVhdGUgPSBmdW5jdGlvbiAoYWN0aW9ucywgZm9ybSwgb3B0aW9ucykge1xuXG4gICAgcmV0dXJuIFJlZmx1eC5jcmVhdGVTdG9yZSh7XG5cbiAgICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHN0b3JlID0gdGhpcztcblxuICAgICAgICBzdG9yZS5maWVsZHMgPSBbXTtcbiAgICAgICAgc3RvcmUudGVtcGxhdGVNYXAgPSB7fTtcbiAgICAgICAgaWYgKG9wdGlvbnMuZmllbGRzKSB7XG4gICAgICAgICAgc3RvcmUuZmllbGRzID0gY29tcGlsZXIuZXhwYW5kRmllbGRzKG9wdGlvbnMuZmllbGRzKTtcbiAgICAgICAgICBzdG9yZS5maWVsZHMgPSBjb21waWxlci5jb21waWxlRmllbGRzKHN0b3JlLmZpZWxkcyk7XG4gICAgICAgICAgc3RvcmUudGVtcGxhdGVNYXAgPSBjb21waWxlci50ZW1wbGF0ZU1hcChzdG9yZS5maWVsZHMpO1xuICAgICAgICAgIHN0b3JlLmZpZWxkcyA9IHN0b3JlLmZpZWxkcy5maWx0ZXIoZnVuY3Rpb24gKGRlZikge1xuICAgICAgICAgICAgcmV0dXJuICFkZWYudGVtcGxhdGU7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKG9wdGlvbnMudmFsdWUpKSB7XG4gICAgICAgICAgc3RvcmUudmFsdWUgPSB1dGlsLmNvcHlWYWx1ZShvcHRpb25zLnZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdG9yZS52YWx1ZSA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIHN0b3JlLm1ldGEgPSB7fTtcbiAgICAgICAgc3RvcmUubGlzdGVuVG9NYW55KGFjdGlvbnMpO1xuICAgICAgfSxcblxuICAgICAgaW5mbGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc3RvcmUgPSB0aGlzO1xuXG4gICAgICAgIHZhciBmaWVsZCA9IGZvcm0uZmllbGQoKTtcbiAgICAgICAgZmllbGQuaW5mbGF0ZShmdW5jdGlvbiAocGF0aCwgdmFsdWUpIHtcbiAgICAgICAgICBzdG9yZS52YWx1ZSA9IHV0aWwuc2V0SW4oc3RvcmUudmFsdWUsIHBhdGgsIHZhbHVlKTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuXG4gICAgICBzZXRWYWx1ZTogZnVuY3Rpb24gKHBhdGgsIHZhbHVlKSB7XG4gICAgICAgIHZhciBzdG9yZSA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8uaXNVbmRlZmluZWQodmFsdWUpKSB7XG4gICAgICAgICAgdmFsdWUgPSBwYXRoO1xuICAgICAgICAgIHBhdGggPSBbXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGF0aC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICBzdG9yZS52YWx1ZSA9IHV0aWwuY29weVZhbHVlKHZhbHVlKTtcbiAgICAgICAgICBzdG9yZS5pbmZsYXRlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RvcmUudmFsdWUgPSB1dGlsLnNldEluKHN0b3JlLnZhbHVlLCBwYXRoLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgc3RvcmUudXBkYXRlKCk7XG4gICAgICB9LFxuXG4gICAgICByZW1vdmVWYWx1ZTogZnVuY3Rpb24gKHBhdGgpIHtcblxuICAgICAgICB2YXIgc3RvcmUgPSB0aGlzO1xuXG4gICAgICAgIHN0b3JlLnZhbHVlID0gdXRpbC5yZW1vdmVJbihzdG9yZS52YWx1ZSwgcGF0aCk7XG5cbiAgICAgICAgc3RvcmUudXBkYXRlKCk7XG4gICAgICB9LFxuXG4gICAgICAvLyBIYXBwZW5zIHdoZW4gY29tcG9uZW50IGlzIHVubW91bnRlZC4gRG9uJ3Qgd2FudCB0byB0cmlnZ2VyIHVwZGF0ZSBmb3JcbiAgICAgIC8vIHRoaXMuXG4gICAgICBlcmFzZVZhbHVlOiBmdW5jdGlvbiAocGF0aCkge1xuXG4gICAgICAgIHZhciBzdG9yZSA9IHRoaXM7XG5cbiAgICAgICAgc3RvcmUudmFsdWUgPSB1dGlsLnJlbW92ZUluKHN0b3JlLnZhbHVlLCBwYXRoKTtcbiAgICAgIH0sXG5cbiAgICAgIGFwcGVuZFZhbHVlOiBmdW5jdGlvbiAocGF0aCwgdmFsdWUpIHtcbiAgICAgICAgdmFyIHN0b3JlID0gdGhpcztcblxuICAgICAgICBzdG9yZS52YWx1ZSA9IHV0aWwuYXBwZW5kSW4oc3RvcmUudmFsdWUsIHBhdGgsIHZhbHVlKTtcblxuICAgICAgICBzdG9yZS51cGRhdGUoKTtcbiAgICAgIH0sXG5cbiAgICAgIG1vdmVWYWx1ZTogZnVuY3Rpb24gKHBhdGgsIGZyb21LZXksIHRvS2V5KSB7XG4gICAgICAgIHZhciBzdG9yZSA9IHRoaXM7XG5cbiAgICAgICAgc3RvcmUudmFsdWUgPSB1dGlsLm1vdmVJbihzdG9yZS52YWx1ZSwgcGF0aCwgZnJvbUtleSwgdG9LZXkpO1xuXG4gICAgICAgIHN0b3JlLnVwZGF0ZSgpO1xuICAgICAgfSxcblxuICAgICAgc2V0RmllbGRzOiBmdW5jdGlvbiAoZmllbGRzKSB7XG4gICAgICAgIHZhciBzdG9yZSA9IHRoaXM7XG5cbiAgICAgICAgc3RvcmUuZmllbGRzID0gZmllbGRzO1xuICAgICAgICBzdG9yZS5pbmZsYXRlKCk7XG5cbiAgICAgICAgc3RvcmUudXBkYXRlKCk7XG4gICAgICB9LFxuXG4gICAgICBzZXRNZXRhOiBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgICB2YXIgc3RvcmUgPSB0aGlzO1xuXG4gICAgICAgIHN0b3JlLm1ldGFba2V5XSA9IHZhbHVlO1xuICAgICAgICBzdG9yZS51cGRhdGUoKTtcbiAgICAgIH0sXG5cbiAgICAgIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnRyaWdnZXIoe1xuICAgICAgICAgIHZhbHVlOiB0aGlzLnZhbHVlLFxuICAgICAgICAgIG1ldGE6IHRoaXMubWV0YSxcbiAgICAgICAgICBmaWVsZHM6IHRoaXMuZmllbGRzXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMuZGVmYXVsdCA9IFtdO1xuXG4gIHBsdWdpbi5leHBvcnRzLmZpZWxkcyA9IGZ1bmN0aW9uIChmaWVsZCkge1xuXG4gICAgaWYgKF8uaXNBcnJheShmaWVsZC52YWx1ZSkpIHtcbiAgICAgIHJldHVybiBmaWVsZC52YWx1ZS5tYXAoZnVuY3Rpb24gKHZhbHVlLCBpKSB7XG4gICAgICAgIHZhciBpdGVtID0gZmllbGQuaXRlbUZvclZhbHVlKHZhbHVlKTtcbiAgICAgICAgaXRlbS5rZXkgPSBpO1xuICAgICAgICByZXR1cm4gZmllbGQuY3JlYXRlQ2hpbGQoaXRlbSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgfTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMuZGVmYXVsdCA9IGZhbHNlO1xuXG4gIHBsdWdpbi5leHBvcnRzLmNvbXBpbGUgPSBmdW5jdGlvbiAoZGVmKSB7XG4gICAgaWYgKCFkZWYuY2hvaWNlcykge1xuICAgICAgZGVmLmNob2ljZXMgPSBbXG4gICAgICAgIHt2YWx1ZTogdHJ1ZSwgbGFiZWw6ICdZZXMnfSxcbiAgICAgICAge3ZhbHVlOiBmYWxzZSwgbGFiZWw6ICdObyd9XG4gICAgICBdO1xuICAgIH1cbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzLmRlZmF1bHQgPSBudWxsO1xuXG59O1xuIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgdmFyIHV0aWwgPSBwbHVnaW4ucmVxdWlyZSgndXRpbCcpO1xuXG4gIHBsdWdpbi5leHBvcnRzLmRlZmF1bHQgPSB7fTtcblxuICBwbHVnaW4uZXhwb3J0cy5maWVsZHMgPSBmdW5jdGlvbiAoZmllbGQpIHtcblxuICAgIHZhciBmaWVsZHMgPSBbXTtcbiAgICB2YXIgdmFsdWUgPSBmaWVsZC52YWx1ZTtcbiAgICB2YXIgdW51c2VkS2V5cyA9IF8ua2V5cyh2YWx1ZSk7XG5cbiAgICBpZiAoZmllbGQuZGVmLmZpZWxkcykge1xuXG4gICAgICBmaWVsZHMgPSBmaWVsZC5kZWYuZmllbGRzLm1hcChmdW5jdGlvbiAoZGVmKSB7XG4gICAgICAgIHZhciBjaGlsZCA9IGZpZWxkLmNyZWF0ZUNoaWxkKGRlZik7XG4gICAgICAgIGlmICghdXRpbC5pc0JsYW5rKGNoaWxkLmRlZi5rZXkpKSB7XG4gICAgICAgICAgdW51c2VkS2V5cyA9IF8ud2l0aG91dCh1bnVzZWRLZXlzLCBjaGlsZC5kZWYua2V5KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2hpbGQ7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodW51c2VkS2V5cy5sZW5ndGggPiAwKSB7XG4gICAgICB1bnVzZWRLZXlzLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICB2YXIgaXRlbSA9IGZpZWxkLml0ZW1Gb3JWYWx1ZSh2YWx1ZVtrZXldKTtcbiAgICAgICAgaXRlbS5rZXkgPSBrZXk7XG4gICAgICAgIGZpZWxkcy5wdXNoKGZpZWxkLmNyZWF0ZUNoaWxkKGl0ZW0pKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBmaWVsZHM7XG4gIH07XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBsdWdpbikge1xuXG4gIHBsdWdpbi5leHBvcnRzLmZpZWxkcyA9IGZ1bmN0aW9uIChmaWVsZCkge1xuXG4gICAgcmV0dXJuIGZpZWxkLmZvcm0uc3RvcmUuZmllbGRzLm1hcChmdW5jdGlvbiAoZGVmKSB7XG4gICAgICByZXR1cm4gZmllbGQuY3JlYXRlQ2hpbGQoZGVmKTtcbiAgICB9KTtcblxuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMuZGVmYXVsdCA9ICcnO1xuXG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL3NyYy9jb21wb25lbnQnKTtcbiIsIi8qKlxuICogQGpzeCBSZWFjdC5ET01cbiAqL1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgUmVzaXplYWJsZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgcHJvcFR5cGVzOiB7XG4gICAgdHJpZ2dlcnNDbGFzczogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcbiAgICBleHBhbmRDbGFzczogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcbiAgICBjb250cmFjdENsYXNzOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuICAgIGVtYmVkQ3NzOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCxcbiAgICBvblJlc2l6ZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZFxuICB9LFxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdHJpZ2dlcnNDbGFzczogJ3Jlc2l6ZS10cmlnZ2VycycsXG4gICAgICBleHBhbmRDbGFzczogJ2V4cGFuZC10cmlnZ2VyJyxcbiAgICAgIGNvbnRyYWN0Q2xhc3M6ICdjb250cmFjdC10cmlnZ2VyJyxcbiAgICAgIGVtYmVkQ3NzOiB0cnVlXG4gICAgfTtcbiAgfSxcblxuICByZXF1ZXN0RnJhbWU6IGZ1bmN0aW9uIChmbikge1xuICAgIHJldHVybiAod2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgZnVuY3Rpb24oZm4peyByZXR1cm4gd2luZG93LnNldFRpbWVvdXQoZm4sIDIwKTsgfSkoZm4pO1xuICB9LFxuXG4gIGNhbmNlbEZyYW1lOiBmdW5jdGlvbiAoaWQpIHtcbiAgICByZXR1cm4gKHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cubW96Q2FuY2VsQW5pbWF0aW9uRnJhbWUgfHwgd2luZG93LndlYmtpdENhbmNlbEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy5jbGVhclRpbWVvdXQpKGlkKTtcbiAgfSxcblxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucmVzZXRUcmlnZ2VycygpO1xuICB9LFxuICBjb21wb25lbnREaWRVcGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnJlc2V0VHJpZ2dlcnMoKTtcbiAgfSxcblxuICByZXNldFRyaWdnZXJzOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbnRyYWN0ID0gdGhpcy5yZWZzLmNvbnRyYWN0LmdldERPTU5vZGUoKTtcbiAgICB2YXIgZXhwYW5kQ2hpbGQgPSB0aGlzLnJlZnMuZXhwYW5kQ2hpbGQuZ2V0RE9NTm9kZSgpO1xuICAgIHZhciBleHBhbmQgPSB0aGlzLnJlZnMuZXhwYW5kQ2hpbGQuZ2V0RE9NTm9kZSgpO1xuXG4gICAgY29udHJhY3Quc2Nyb2xsTGVmdCAgICAgID0gY29udHJhY3Quc2Nyb2xsV2lkdGg7XG4gICAgY29udHJhY3Quc2Nyb2xsVG9wICAgICAgID0gY29udHJhY3Quc2Nyb2xsSGVpZ2h0O1xuICAgIGV4cGFuZENoaWxkLnN0eWxlLndpZHRoICA9IGV4cGFuZC5vZmZzZXRXaWR0aCArIDEgKyAncHgnO1xuICAgIGV4cGFuZENoaWxkLnN0eWxlLmhlaWdodCA9IGV4cGFuZC5vZmZzZXRIZWlnaHQgKyAxICsgJ3B4JztcbiAgICBleHBhbmQuc2Nyb2xsTGVmdCAgICAgICAgPSBleHBhbmQuc2Nyb2xsV2lkdGg7XG4gICAgZXhwYW5kLnNjcm9sbFRvcCAgICAgICAgID0gZXhwYW5kLnNjcm9sbEhlaWdodDtcbiAgfSxcblxuICBjaGVja1RyaWdnZXJzOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGVsZW1lbnQgPSB0aGlzLnJlZnMucmVzaXphYmxlLmdldERPTU5vZGUoKTtcbiAgICByZXR1cm4gZWxlbWVudC5vZmZzZXRXaWR0aCAhPSB0aGlzLmxhc3RXaWR0aCB8fCBlbGVtZW50Lm9mZnNldEhlaWdodCAhPSB0aGlzLmxhc3RIZWlnaHQ7XG4gIH0sXG5cbiAgb25TY3JvbGw6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5yKSB0aGlzLmNhbmNlbEZyYW1lKHRoaXMucik7XG4gICAgdGhpcy5yID0gdGhpcy5yZXF1ZXN0RnJhbWUoZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKCF0aGlzLmNoZWNrVHJpZ2dlcnMoKSlcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgICB2YXIgZWwgPSB0aGlzLnJlZnMucmVzaXphYmxlLmdldERPTU5vZGUoKTtcblxuICAgICAgdGhpcy5sYXN0V2lkdGggPSBlbC5vZmZzZXRXaWR0aDtcbiAgICAgIHRoaXMubGFzdEhlaWdodCA9IGVsLm9mZnNldEhlaWdodDtcblxuICAgICAgdGhpcy5wcm9wcy5vblJlc2l6ZSh7XG4gICAgICAgIHdpZHRoOiB0aGlzLmxhc3RXaWR0aCxcbiAgICAgICAgaGVpZ2h0OiB0aGlzLmxhc3RIZWlnaHRcbiAgICAgIH0pO1xuXG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuXG4gICAgcmV0dXJuIHRoaXMudHJhbnNmZXJQcm9wc1RvKFxuICAgICAgUmVhY3QuRE9NLmRpdih7b25TY3JvbGw6IHRoaXMub25TY3JvbGwsIHJlZjogJ3Jlc2l6YWJsZSd9LFxuICAgICAgICBbXG4gICAgICAgICAgdGhpcy5wcm9wcy5jaGlsZHJlbixcbiAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IHRoaXMucHJvcHMudHJpZ2dlcnNDbGFzc30sXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogdGhpcy5wcm9wcy5leHBhbmRDbGFzcywgcmVmOiAnZXhwYW5kJ30sIFJlYWN0LkRPTS5kaXYoe3JlZjogJ2V4cGFuZENoaWxkJ30pKSxcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiB0aGlzLnByb3BzLmNvbnRyYWN0Q2xhc3MsIHJlZjogJ2NvbnRyYWN0J30pXG4gICAgICAgICAgICBdXG4gICAgICAgICAgKSxcbiAgICAgICAgICB0aGlzLnByb3BzLmVtYmVkQ3NzID8gUmVhY3QuRE9NLnN0eWxlKHt9LCAnLnJlc2l6ZS10cmlnZ2VycyB7IHZpc2liaWxpdHk6IGhpZGRlbjsgfSAucmVzaXplLXRyaWdnZXJzLCAucmVzaXplLXRyaWdnZXJzID4gZGl2LCAuY29udHJhY3QtdHJpZ2dlcjpiZWZvcmUgeyBjb250ZW50OiBcXFwiIFxcXCI7IGRpc3BsYXk6IGJsb2NrOyBwb3NpdGlvbjogYWJzb2x1dGU7IHRvcDogMDsgbGVmdDogMDsgaGVpZ2h0OiAxMDAlOyB3aWR0aDogMTAwJTsgb3ZlcmZsb3c6IGhpZGRlbjsgfSAucmVzaXplLXRyaWdnZXJzID4gZGl2IHsgYmFja2dyb3VuZDogI2VlZTsgb3ZlcmZsb3c6IGF1dG87IH0gLmNvbnRyYWN0LXRyaWdnZXI6YmVmb3JlIHsgd2lkdGg6IDIwMCU7IGhlaWdodDogMjAwJTsgfScpIDogbnVsbFxuICAgICAgICBdXG4gICAgICApXG4gICAgKTtcbiAgfVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZXNpemVhYmxlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFJlcHJlc2VudGF0aW9uIG9mIGEgc2luZ2xlIEV2ZW50RW1pdHRlciBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBFdmVudCBoYW5kbGVyIHRvIGJlIGNhbGxlZC5cbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgQ29udGV4dCBmb3IgZnVuY3Rpb24gZXhlY3V0aW9uLlxuICogQHBhcmFtIHtCb29sZWFufSBvbmNlIE9ubHkgZW1pdCBvbmNlXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gRUUoZm4sIGNvbnRleHQsIG9uY2UpIHtcbiAgdGhpcy5mbiA9IGZuO1xuICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuICB0aGlzLm9uY2UgPSBvbmNlIHx8IGZhbHNlO1xufVxuXG4vKipcbiAqIE1pbmltYWwgRXZlbnRFbWl0dGVyIGludGVyZmFjZSB0aGF0IGlzIG1vbGRlZCBhZ2FpbnN0IHRoZSBOb2RlLmpzXG4gKiBFdmVudEVtaXR0ZXIgaW50ZXJmYWNlLlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQGFwaSBwdWJsaWNcbiAqL1xuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkgeyAvKiBOb3RoaW5nIHRvIHNldCAqLyB9XG5cbi8qKlxuICogSG9sZHMgdGhlIGFzc2lnbmVkIEV2ZW50RW1pdHRlcnMgYnkgbmFtZS5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICogQHByaXZhdGVcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuXG4vKipcbiAqIFJldHVybiBhIGxpc3Qgb2YgYXNzaWduZWQgZXZlbnQgbGlzdGVuZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnRzIHRoYXQgc2hvdWxkIGJlIGxpc3RlZC5cbiAqIEByZXR1cm5zIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24gbGlzdGVuZXJzKGV2ZW50KSB7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbZXZlbnRdKSByZXR1cm4gW107XG5cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLl9ldmVudHNbZXZlbnRdLmxlbmd0aCwgZWUgPSBbXTsgaSA8IGw7IGkrKykge1xuICAgIGVlLnB1c2godGhpcy5fZXZlbnRzW2V2ZW50XVtpXS5mbik7XG4gIH1cblxuICByZXR1cm4gZWU7XG59O1xuXG4vKipcbiAqIEVtaXQgYW4gZXZlbnQgdG8gYWxsIHJlZ2lzdGVyZWQgZXZlbnQgbGlzdGVuZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgbmFtZSBvZiB0aGUgZXZlbnQuXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gSW5kaWNhdGlvbiBpZiB3ZSd2ZSBlbWl0dGVkIGFuIGV2ZW50LlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gZW1pdChldmVudCwgYTEsIGEyLCBhMywgYTQsIGE1KSB7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbZXZlbnRdKSByZXR1cm4gZmFsc2U7XG5cbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldmVudF1cbiAgICAsIGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGhcbiAgICAsIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICAsIGVlID0gbGlzdGVuZXJzWzBdXG4gICAgLCBhcmdzXG4gICAgLCBpLCBqO1xuXG4gIGlmICgxID09PSBsZW5ndGgpIHtcbiAgICBpZiAoZWUub25jZSkgdGhpcy5yZW1vdmVMaXN0ZW5lcihldmVudCwgZWUuZm4sIHRydWUpO1xuXG4gICAgc3dpdGNoIChsZW4pIHtcbiAgICAgIGNhc2UgMTogcmV0dXJuIGVlLmZuLmNhbGwoZWUuY29udGV4dCksIHRydWU7XG4gICAgICBjYXNlIDI6IHJldHVybiBlZS5mbi5jYWxsKGVlLmNvbnRleHQsIGExKSwgdHJ1ZTtcbiAgICAgIGNhc2UgMzogcmV0dXJuIGVlLmZuLmNhbGwoZWUuY29udGV4dCwgYTEsIGEyKSwgdHJ1ZTtcbiAgICAgIGNhc2UgNDogcmV0dXJuIGVlLmZuLmNhbGwoZWUuY29udGV4dCwgYTEsIGEyLCBhMyksIHRydWU7XG4gICAgICBjYXNlIDU6IHJldHVybiBlZS5mbi5jYWxsKGVlLmNvbnRleHQsIGExLCBhMiwgYTMsIGE0KSwgdHJ1ZTtcbiAgICAgIGNhc2UgNjogcmV0dXJuIGVlLmZuLmNhbGwoZWUuY29udGV4dCwgYTEsIGEyLCBhMywgYTQsIGE1KSwgdHJ1ZTtcbiAgICB9XG5cbiAgICBmb3IgKGkgPSAxLCBhcmdzID0gbmV3IEFycmF5KGxlbiAtMSk7IGkgPCBsZW47IGkrKykge1xuICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuXG4gICAgZWUuZm4uYXBwbHkoZWUuY29udGV4dCwgYXJncyk7XG4gIH0gZWxzZSB7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAobGlzdGVuZXJzW2ldLm9uY2UpIHRoaXMucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyc1tpXS5mbiwgdHJ1ZSk7XG5cbiAgICAgIHN3aXRjaCAobGVuKSB7XG4gICAgICAgIGNhc2UgMTogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQpOyBicmVhaztcbiAgICAgICAgY2FzZSAyOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgYTEpOyBicmVhaztcbiAgICAgICAgY2FzZSAzOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgYTEsIGEyKTsgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgaWYgKCFhcmdzKSBmb3IgKGogPSAxLCBhcmdzID0gbmV3IEFycmF5KGxlbiAtMSk7IGogPCBsZW47IGorKykge1xuICAgICAgICAgICAgYXJnc1tqIC0gMV0gPSBhcmd1bWVudHNbal07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGlzdGVuZXJzW2ldLmZuLmFwcGx5KGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhcmdzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbi8qKlxuICogUmVnaXN0ZXIgYSBuZXcgRXZlbnRMaXN0ZW5lciBmb3IgdGhlIGdpdmVuIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBOYW1lIG9mIHRoZSBldmVudC5cbiAqIEBwYXJhbSB7RnVuY3Rvbn0gZm4gQ2FsbGJhY2sgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IFRoZSBjb250ZXh0IG9mIHRoZSBmdW5jdGlvbi5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBmdW5jdGlvbiBvbihldmVudCwgZm4sIGNvbnRleHQpIHtcbiAgaWYgKCF0aGlzLl9ldmVudHMpIHRoaXMuX2V2ZW50cyA9IHt9O1xuICBpZiAoIXRoaXMuX2V2ZW50c1tldmVudF0pIHRoaXMuX2V2ZW50c1tldmVudF0gPSBbXTtcbiAgdGhpcy5fZXZlbnRzW2V2ZW50XS5wdXNoKG5ldyBFRSggZm4sIGNvbnRleHQgfHwgdGhpcyApKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWRkIGFuIEV2ZW50TGlzdGVuZXIgdGhhdCdzIG9ubHkgY2FsbGVkIG9uY2UuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IE5hbWUgb2YgdGhlIGV2ZW50LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gQ2FsbGJhY2sgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IFRoZSBjb250ZXh0IG9mIHRoZSBmdW5jdGlvbi5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uIG9uY2UoZXZlbnQsIGZuLCBjb250ZXh0KSB7XG4gIGlmICghdGhpcy5fZXZlbnRzKSB0aGlzLl9ldmVudHMgPSB7fTtcbiAgaWYgKCF0aGlzLl9ldmVudHNbZXZlbnRdKSB0aGlzLl9ldmVudHNbZXZlbnRdID0gW107XG4gIHRoaXMuX2V2ZW50c1tldmVudF0ucHVzaChuZXcgRUUoZm4sIGNvbnRleHQgfHwgdGhpcywgdHJ1ZSApKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGV2ZW50IGxpc3RlbmVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IHdlIHdhbnQgdG8gcmVtb3ZlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGxpc3RlbmVyIHRoYXQgd2UgbmVlZCB0byBmaW5kLlxuICogQHBhcmFtIHtCb29sZWFufSBvbmNlIE9ubHkgcmVtb3ZlIG9uY2UgbGlzdGVuZXJzLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKGV2ZW50LCBmbiwgb25jZSkge1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW2V2ZW50XSkgcmV0dXJuIHRoaXM7XG5cbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldmVudF1cbiAgICAsIGV2ZW50cyA9IFtdO1xuXG4gIGlmIChmbikgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGlmIChsaXN0ZW5lcnNbaV0uZm4gIT09IGZuICYmIGxpc3RlbmVyc1tpXS5vbmNlICE9PSBvbmNlKSB7XG4gICAgICBldmVudHMucHVzaChsaXN0ZW5lcnNbaV0pO1xuICAgIH1cbiAgfVxuXG4gIC8vXG4gIC8vIFJlc2V0IHRoZSBhcnJheSwgb3IgcmVtb3ZlIGl0IGNvbXBsZXRlbHkgaWYgd2UgaGF2ZSBubyBtb3JlIGxpc3RlbmVycy5cbiAgLy9cbiAgaWYgKGV2ZW50cy5sZW5ndGgpIHRoaXMuX2V2ZW50c1tldmVudF0gPSBldmVudHM7XG4gIGVsc2UgdGhpcy5fZXZlbnRzW2V2ZW50XSA9IG51bGw7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbGwgbGlzdGVuZXJzIG9yIG9ubHkgdGhlIGxpc3RlbmVycyBmb3IgdGhlIHNwZWNpZmllZCBldmVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IHdhbnQgdG8gcmVtb3ZlIGFsbCBsaXN0ZW5lcnMgZm9yLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbiByZW1vdmVBbGxMaXN0ZW5lcnMoZXZlbnQpIHtcbiAgaWYgKCF0aGlzLl9ldmVudHMpIHJldHVybiB0aGlzO1xuXG4gIGlmIChldmVudCkgdGhpcy5fZXZlbnRzW2V2ZW50XSA9IG51bGw7XG4gIGVsc2UgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vL1xuLy8gQWxpYXMgbWV0aG9kcyBuYW1lcyBiZWNhdXNlIHBlb3BsZSByb2xsIGxpa2UgdGhhdC5cbi8vXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9mZiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXI7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbjtcblxuLy9cbi8vIFRoaXMgZnVuY3Rpb24gZG9lc24ndCBhcHBseSBhbnltb3JlLlxuLy9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24gc2V0TWF4TGlzdGVuZXJzKCkge1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8vXG4vLyBFeHBvc2UgdGhlIG1vZHVsZS5cbi8vXG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlcjIgPSBFdmVudEVtaXR0ZXI7XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyMyA9IEV2ZW50RW1pdHRlcjtcblxuaWYgKCdvYmplY3QnID09PSB0eXBlb2YgbW9kdWxlICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xufVxuIiwiZXhwb3J0cy5jcmVhdGVkU3RvcmVzID0gW107XG5cbmV4cG9ydHMuY3JlYXRlZEFjdGlvbnMgPSBbXTtcblxuZXhwb3J0cy5yZXNldCA9IGZ1bmN0aW9uKCkge1xuICAgIHdoaWxlKGV4cG9ydHMuY3JlYXRlZFN0b3Jlcy5sZW5ndGgpIHtcbiAgICAgICAgZXhwb3J0cy5jcmVhdGVkU3RvcmVzLnBvcCgpO1xuICAgIH1cbiAgICB3aGlsZShleHBvcnRzLmNyZWF0ZWRBY3Rpb25zLmxlbmd0aCkge1xuICAgICAgICBleHBvcnRzLmNyZWF0ZWRBY3Rpb25zLnBvcCgpO1xuICAgIH1cbn07XG4iLCJ2YXIgXyA9IHJlcXVpcmUoJy4vdXRpbHMnKSxcbiAgICBtYWtlciA9IHJlcXVpcmUoJy4vam9pbnMnKS5pbnN0YW5jZUpvaW5DcmVhdG9yO1xuXG4vKipcbiAqIEEgbW9kdWxlIG9mIG1ldGhvZHMgcmVsYXRlZCB0byBsaXN0ZW5pbmcuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gICAgLyoqXG4gICAgICogQW4gaW50ZXJuYWwgdXRpbGl0eSBmdW5jdGlvbiB1c2VkIGJ5IGB2YWxpZGF0ZUxpc3RlbmluZ2BcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7QWN0aW9ufFN0b3JlfSBsaXN0ZW5hYmxlIFRoZSBsaXN0ZW5hYmxlIHdlIHdhbnQgdG8gc2VhcmNoIGZvclxuICAgICAqIEByZXR1cm5zIHtCb29sZWFufSBUaGUgcmVzdWx0IG9mIGEgcmVjdXJzaXZlIHNlYXJjaCBhbW9uZyBgdGhpcy5zdWJzY3JpcHRpb25zYFxuICAgICAqL1xuICAgIGhhc0xpc3RlbmVyOiBmdW5jdGlvbihsaXN0ZW5hYmxlKSB7XG4gICAgICAgIHZhciBpID0gMCxcbiAgICAgICAgICAgIGxpc3RlbmVyO1xuICAgICAgICBmb3IgKDtpIDwgKHRoaXMuc3Vic2NyaXB0aW9uc3x8W10pLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBsaXN0ZW5lciA9IHRoaXMuc3Vic2NyaXB0aW9uc1tpXS5saXN0ZW5hYmxlO1xuICAgICAgICAgICAgaWYgKGxpc3RlbmVyID09PSBsaXN0ZW5hYmxlIHx8IGxpc3RlbmVyLmhhc0xpc3RlbmVyICYmIGxpc3RlbmVyLmhhc0xpc3RlbmVyKGxpc3RlbmFibGUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBIGNvbnZlbmllbmNlIG1ldGhvZCB0aGF0IGxpc3RlbnMgdG8gYWxsIGxpc3RlbmFibGVzIGluIHRoZSBnaXZlbiBvYmplY3QuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gbGlzdGVuYWJsZXMgQW4gb2JqZWN0IG9mIGxpc3RlbmFibGVzLiBLZXlzIHdpbGwgYmUgdXNlZCBhcyBjYWxsYmFjayBtZXRob2QgbmFtZXMuXG4gICAgICovXG4gICAgbGlzdGVuVG9NYW55OiBmdW5jdGlvbihsaXN0ZW5hYmxlcyl7XG4gICAgICAgIGZvcih2YXIga2V5IGluIGxpc3RlbmFibGVzKXtcbiAgICAgICAgICAgIHZhciBjYm5hbWUgPSBfLmNhbGxiYWNrTmFtZShrZXkpLFxuICAgICAgICAgICAgICAgIGxvY2FsbmFtZSA9IHRoaXNbY2JuYW1lXSA/IGNibmFtZSA6IHRoaXNba2V5XSA/IGtleSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmIChsb2NhbG5hbWUpe1xuICAgICAgICAgICAgICAgIHRoaXMubGlzdGVuVG8obGlzdGVuYWJsZXNba2V5XSxsb2NhbG5hbWUsdGhpc1tjYm5hbWUrXCJEZWZhdWx0XCJdfHx0aGlzW2xvY2FsbmFtZStcIkRlZmF1bHRcIl18fGxvY2FsbmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IGNvbnRleHQgY2FuIGxpc3RlbiB0byB0aGUgc3VwcGxpZWQgbGlzdGVuYWJsZVxuICAgICAqXG4gICAgICogQHBhcmFtIHtBY3Rpb258U3RvcmV9IGxpc3RlbmFibGUgQW4gQWN0aW9uIG9yIFN0b3JlIHRoYXQgc2hvdWxkIGJlXG4gICAgICogIGxpc3RlbmVkIHRvLlxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd8VW5kZWZpbmVkfSBBbiBlcnJvciBtZXNzYWdlLCBvciB1bmRlZmluZWQgaWYgdGhlcmUgd2FzIG5vIHByb2JsZW0uXG4gICAgICovXG4gICAgdmFsaWRhdGVMaXN0ZW5pbmc6IGZ1bmN0aW9uKGxpc3RlbmFibGUpe1xuICAgICAgICBpZiAobGlzdGVuYWJsZSA9PT0gdGhpcykge1xuICAgICAgICAgICAgcmV0dXJuIFwiTGlzdGVuZXIgaXMgbm90IGFibGUgdG8gbGlzdGVuIHRvIGl0c2VsZlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICghXy5pc0Z1bmN0aW9uKGxpc3RlbmFibGUubGlzdGVuKSkge1xuICAgICAgICAgICAgcmV0dXJuIGxpc3RlbmFibGUgKyBcIiBpcyBtaXNzaW5nIGEgbGlzdGVuIG1ldGhvZFwiO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsaXN0ZW5hYmxlLmhhc0xpc3RlbmVyICYmIGxpc3RlbmFibGUuaGFzTGlzdGVuZXIodGhpcykpIHtcbiAgICAgICAgICAgIHJldHVybiBcIkxpc3RlbmVyIGNhbm5vdCBsaXN0ZW4gdG8gdGhpcyBsaXN0ZW5hYmxlIGJlY2F1c2Ugb2YgY2lyY3VsYXIgbG9vcFwiO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldHMgdXAgYSBzdWJzY3JpcHRpb24gdG8gdGhlIGdpdmVuIGxpc3RlbmFibGUgZm9yIHRoZSBjb250ZXh0IG9iamVjdFxuICAgICAqXG4gICAgICogQHBhcmFtIHtBY3Rpb258U3RvcmV9IGxpc3RlbmFibGUgQW4gQWN0aW9uIG9yIFN0b3JlIHRoYXQgc2hvdWxkIGJlXG4gICAgICogIGxpc3RlbmVkIHRvLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258U3RyaW5nfSBjYWxsYmFjayBUaGUgY2FsbGJhY2sgdG8gcmVnaXN0ZXIgYXMgZXZlbnQgaGFuZGxlclxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258U3RyaW5nfSBkZWZhdWx0Q2FsbGJhY2sgVGhlIGNhbGxiYWNrIHRvIHJlZ2lzdGVyIGFzIGRlZmF1bHQgaGFuZGxlclxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IEEgc3Vic2NyaXB0aW9uIG9iaiB3aGVyZSBgc3RvcGAgaXMgYW4gdW5zdWIgZnVuY3Rpb24gYW5kIGBsaXN0ZW5hYmxlYCBpcyB0aGUgb2JqZWN0IGJlaW5nIGxpc3RlbmVkIHRvXG4gICAgICovXG4gICAgbGlzdGVuVG86IGZ1bmN0aW9uKGxpc3RlbmFibGUsIGNhbGxiYWNrLCBkZWZhdWx0Q2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGRlc3ViLCB1bnN1YnNjcmliZXIsIHN1YnNjcmlwdGlvbm9iaiwgc3VicyA9IHRoaXMuc3Vic2NyaXB0aW9ucyA9IHRoaXMuc3Vic2NyaXB0aW9ucyB8fCBbXTtcbiAgICAgICAgXy50aHJvd0lmKHRoaXMudmFsaWRhdGVMaXN0ZW5pbmcobGlzdGVuYWJsZSkpO1xuICAgICAgICB0aGlzLmZldGNoRGVmYXVsdERhdGEobGlzdGVuYWJsZSwgZGVmYXVsdENhbGxiYWNrKTtcbiAgICAgICAgZGVzdWIgPSBsaXN0ZW5hYmxlLmxpc3Rlbih0aGlzW2NhbGxiYWNrXXx8Y2FsbGJhY2ssIHRoaXMpO1xuICAgICAgICB1bnN1YnNjcmliZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IHN1YnMuaW5kZXhPZihzdWJzY3JpcHRpb25vYmopO1xuICAgICAgICAgICAgXy50aHJvd0lmKGluZGV4ID09PSAtMSwnVHJpZWQgdG8gcmVtb3ZlIGxpc3RlbiBhbHJlYWR5IGdvbmUgZnJvbSBzdWJzY3JpcHRpb25zIGxpc3QhJyk7XG4gICAgICAgICAgICBzdWJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICBkZXN1YigpO1xuICAgICAgICB9O1xuICAgICAgICBzdWJzY3JpcHRpb25vYmogPSB7XG4gICAgICAgICAgICBzdG9wOiB1bnN1YnNjcmliZXIsXG4gICAgICAgICAgICBsaXN0ZW5hYmxlOiBsaXN0ZW5hYmxlXG4gICAgICAgIH07XG4gICAgICAgIHN1YnMucHVzaChzdWJzY3JpcHRpb25vYmopO1xuICAgICAgICByZXR1cm4gc3Vic2NyaXB0aW9ub2JqO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTdG9wcyBsaXN0ZW5pbmcgdG8gYSBzaW5nbGUgbGlzdGVuYWJsZVxuICAgICAqXG4gICAgICogQHBhcmFtIHtBY3Rpb258U3RvcmV9IGxpc3RlbmFibGUgVGhlIGFjdGlvbiBvciBzdG9yZSB3ZSBubyBsb25nZXIgd2FudCB0byBsaXN0ZW4gdG9cbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiBhIHN1YnNjcmlwdGlvbiB3YXMgZm91bmQgYW5kIHJlbW92ZWQsIG90aGVyd2lzZSBmYWxzZS5cbiAgICAgKi9cbiAgICBzdG9wTGlzdGVuaW5nVG86IGZ1bmN0aW9uKGxpc3RlbmFibGUpe1xuICAgICAgICB2YXIgc3ViLCBpID0gMCwgc3VicyA9IHRoaXMuc3Vic2NyaXB0aW9ucyB8fCBbXTtcbiAgICAgICAgZm9yKDtpIDwgc3Vicy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICBzdWIgPSBzdWJzW2ldO1xuICAgICAgICAgICAgaWYgKHN1Yi5saXN0ZW5hYmxlID09PSBsaXN0ZW5hYmxlKXtcbiAgICAgICAgICAgICAgICBzdWIuc3RvcCgpO1xuICAgICAgICAgICAgICAgIF8udGhyb3dJZihzdWJzLmluZGV4T2Yoc3ViKSE9PS0xLCdGYWlsZWQgdG8gcmVtb3ZlIGxpc3RlbiBmcm9tIHN1YnNjcmlwdGlvbnMgbGlzdCEnKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFN0b3BzIGFsbCBzdWJzY3JpcHRpb25zIGFuZCBlbXB0aWVzIHN1YnNjcmlwdGlvbnMgYXJyYXlcbiAgICAgKi9cbiAgICBzdG9wTGlzdGVuaW5nVG9BbGw6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciByZW1haW5pbmcsIHN1YnMgPSB0aGlzLnN1YnNjcmlwdGlvbnMgfHwgW107XG4gICAgICAgIHdoaWxlKChyZW1haW5pbmc9c3Vicy5sZW5ndGgpKXtcbiAgICAgICAgICAgIHN1YnNbMF0uc3RvcCgpO1xuICAgICAgICAgICAgXy50aHJvd0lmKHN1YnMubGVuZ3RoIT09cmVtYWluaW5nLTEsJ0ZhaWxlZCB0byByZW1vdmUgbGlzdGVuIGZyb20gc3Vic2NyaXB0aW9ucyBsaXN0IScpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVzZWQgaW4gYGxpc3RlblRvYC4gRmV0Y2hlcyBpbml0aWFsIGRhdGEgZnJvbSBhIHB1Ymxpc2hlciBpZiBpdCBoYXMgYSBgZ2V0RGVmYXVsdERhdGFgIG1ldGhvZC5cbiAgICAgKiBAcGFyYW0ge0FjdGlvbnxTdG9yZX0gbGlzdGVuYWJsZSBUaGUgcHVibGlzaGVyIHdlIHdhbnQgdG8gZ2V0IGRlZmF1bHQgZGF0YSBmcm9tXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbnxTdHJpbmd9IGRlZmF1bHRDYWxsYmFjayBUaGUgbWV0aG9kIHRvIHJlY2VpdmUgdGhlIGRhdGFcbiAgICAgKi9cbiAgICBmZXRjaERlZmF1bHREYXRhOiBmdW5jdGlvbiAobGlzdGVuYWJsZSwgZGVmYXVsdENhbGxiYWNrKSB7XG4gICAgICAgIGRlZmF1bHRDYWxsYmFjayA9IChkZWZhdWx0Q2FsbGJhY2sgJiYgdGhpc1tkZWZhdWx0Q2FsbGJhY2tdKSB8fCBkZWZhdWx0Q2FsbGJhY2s7XG4gICAgICAgIHZhciBtZSA9IHRoaXM7XG4gICAgICAgIGlmIChfLmlzRnVuY3Rpb24oZGVmYXVsdENhbGxiYWNrKSAmJiBfLmlzRnVuY3Rpb24obGlzdGVuYWJsZS5nZXREZWZhdWx0RGF0YSkpIHtcbiAgICAgICAgICAgIGRhdGEgPSBsaXN0ZW5hYmxlLmdldERlZmF1bHREYXRhKCk7XG4gICAgICAgICAgICBpZiAoZGF0YSAmJiBfLmlzRnVuY3Rpb24oZGF0YS50aGVuKSkge1xuICAgICAgICAgICAgICAgIGRhdGEudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdENhbGxiYWNrLmFwcGx5KG1lLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0Q2FsbGJhY2suY2FsbCh0aGlzLCBkYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUaGUgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgb25jZSBhbGwgbGlzdGVuYWJsZXMgaGF2ZSB0cmlnZ2VyZWQgYXQgbGVhc3Qgb25jZS5cbiAgICAgKiBJdCB3aWxsIGJlIGludm9rZWQgd2l0aCB0aGUgbGFzdCBlbWlzc2lvbiBmcm9tIGVhY2ggbGlzdGVuYWJsZS5cbiAgICAgKiBAcGFyYW0gey4uLlB1Ymxpc2hlcnN9IHB1Ymxpc2hlcnMgUHVibGlzaGVycyB0aGF0IHNob3VsZCBiZSB0cmFja2VkLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258U3RyaW5nfSBjYWxsYmFjayBUaGUgbWV0aG9kIHRvIGNhbGwgd2hlbiBhbGwgcHVibGlzaGVycyBoYXZlIGVtaXR0ZWRcbiAgICAgKi9cbiAgICBqb2luVHJhaWxpbmc6IG1ha2VyKFwibGFzdFwiKSxcblxuICAgIC8qKlxuICAgICAqIFRoZSBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBvbmNlIGFsbCBsaXN0ZW5hYmxlcyBoYXZlIHRyaWdnZXJlZCBhdCBsZWFzdCBvbmNlLlxuICAgICAqIEl0IHdpbGwgYmUgaW52b2tlZCB3aXRoIHRoZSBmaXJzdCBlbWlzc2lvbiBmcm9tIGVhY2ggbGlzdGVuYWJsZS5cbiAgICAgKiBAcGFyYW0gey4uLlB1Ymxpc2hlcnN9IHB1Ymxpc2hlcnMgUHVibGlzaGVycyB0aGF0IHNob3VsZCBiZSB0cmFja2VkLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258U3RyaW5nfSBjYWxsYmFjayBUaGUgbWV0aG9kIHRvIGNhbGwgd2hlbiBhbGwgcHVibGlzaGVycyBoYXZlIGVtaXR0ZWRcbiAgICAgKi9cbiAgICBqb2luTGVhZGluZzogbWFrZXIoXCJmaXJzdFwiKSxcblxuICAgIC8qKlxuICAgICAqIFRoZSBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBvbmNlIGFsbCBsaXN0ZW5hYmxlcyBoYXZlIHRyaWdnZXJlZCBhdCBsZWFzdCBvbmNlLlxuICAgICAqIEl0IHdpbGwgYmUgaW52b2tlZCB3aXRoIGFsbCBlbWlzc2lvbiBmcm9tIGVhY2ggbGlzdGVuYWJsZS5cbiAgICAgKiBAcGFyYW0gey4uLlB1Ymxpc2hlcnN9IHB1Ymxpc2hlcnMgUHVibGlzaGVycyB0aGF0IHNob3VsZCBiZSB0cmFja2VkLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258U3RyaW5nfSBjYWxsYmFjayBUaGUgbWV0aG9kIHRvIGNhbGwgd2hlbiBhbGwgcHVibGlzaGVycyBoYXZlIGVtaXR0ZWRcbiAgICAgKi9cbiAgICBqb2luQ29uY2F0OiBtYWtlcihcImFsbFwiKSxcblxuICAgIC8qKlxuICAgICAqIFRoZSBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBvbmNlIGFsbCBsaXN0ZW5hYmxlcyBoYXZlIHRyaWdnZXJlZC5cbiAgICAgKiBJZiBhIGNhbGxiYWNrIHRyaWdnZXJzIHR3aWNlIGJlZm9yZSB0aGF0IGhhcHBlbnMsIGFuIGVycm9yIGlzIHRocm93bi5cbiAgICAgKiBAcGFyYW0gey4uLlB1Ymxpc2hlcnN9IHB1Ymxpc2hlcnMgUHVibGlzaGVycyB0aGF0IHNob3VsZCBiZSB0cmFja2VkLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258U3RyaW5nfSBjYWxsYmFjayBUaGUgbWV0aG9kIHRvIGNhbGwgd2hlbiBhbGwgcHVibGlzaGVycyBoYXZlIGVtaXR0ZWRcbiAgICAgKi9cbiAgICBqb2luU3RyaWN0OiBtYWtlcihcInN0cmljdFwiKSxcbn07XG5cbiIsInZhciBfID0gcmVxdWlyZSgnLi91dGlscycpLFxuICAgIExpc3RlbmVyTWV0aG9kcyA9IHJlcXVpcmUoJy4vTGlzdGVuZXJNZXRob2RzJyk7XG5cbi8qKlxuICogQSBtb2R1bGUgbWVhbnQgdG8gYmUgY29uc3VtZWQgYXMgYSBtaXhpbiBieSBhIFJlYWN0IGNvbXBvbmVudC4gU3VwcGxpZXMgdGhlIG1ldGhvZHMgZnJvbVxuICogYExpc3RlbmVyTWV0aG9kc2AgbWl4aW4gYW5kIHRha2VzIGNhcmUgb2YgdGVhcmRvd24gb2Ygc3Vic2NyaXB0aW9ucy5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBfLmV4dGVuZCh7XG5cbiAgICAvKipcbiAgICAgKiBDbGVhbnMgdXAgYWxsIGxpc3RlbmVyIHByZXZpb3VzbHkgcmVnaXN0ZXJlZC5cbiAgICAgKi9cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogTGlzdGVuZXJNZXRob2RzLnN0b3BMaXN0ZW5pbmdUb0FsbFxuXG59LCBMaXN0ZW5lck1ldGhvZHMpO1xuIiwidmFyIF8gPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbi8qKlxuICogQSBtb2R1bGUgb2YgbWV0aG9kcyBmb3Igb2JqZWN0IHRoYXQgeW91IHdhbnQgdG8gYmUgYWJsZSB0byBsaXN0ZW4gdG8uXG4gKiBUaGlzIG1vZHVsZSBpcyBjb25zdW1lZCBieSBgY3JlYXRlU3RvcmVgIGFuZCBgY3JlYXRlQWN0aW9uYFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICAgIC8qKlxuICAgICAqIEhvb2sgdXNlZCBieSB0aGUgcHVibGlzaGVyIHRoYXQgaXMgaW52b2tlZCBiZWZvcmUgZW1pdHRpbmdcbiAgICAgKiBhbmQgYmVmb3JlIGBzaG91bGRFbWl0YC4gVGhlIGFyZ3VtZW50cyBhcmUgdGhlIG9uZXMgdGhhdCB0aGUgYWN0aW9uXG4gICAgICogaXMgaW52b2tlZCB3aXRoLiBJZiB0aGlzIGZ1bmN0aW9uIHJldHVybnMgc29tZXRoaW5nIG90aGVyIHRoYW5cbiAgICAgKiB1bmRlZmluZWQsIHRoYXQgd2lsbCBiZSBwYXNzZWQgb24gYXMgYXJndW1lbnRzIGZvciBzaG91bGRFbWl0IGFuZFxuICAgICAqIGVtaXNzaW9uLlxuICAgICAqL1xuICAgIHByZUVtaXQ6IGZ1bmN0aW9uKCkge30sXG5cbiAgICAvKipcbiAgICAgKiBIb29rIHVzZWQgYnkgdGhlIHB1Ymxpc2hlciBhZnRlciBgcHJlRW1pdGAgdG8gZGV0ZXJtaW5lIGlmIHRoZVxuICAgICAqIGV2ZW50IHNob3VsZCBiZSBlbWl0dGVkIHdpdGggZ2l2ZW4gYXJndW1lbnRzLiBUaGlzIG1heSBiZSBvdmVycmlkZGVuXG4gICAgICogaW4geW91ciBhcHBsaWNhdGlvbiwgZGVmYXVsdCBpbXBsZW1lbnRhdGlvbiBhbHdheXMgcmV0dXJucyB0cnVlLlxuICAgICAqXG4gICAgICogQHJldHVybnMge0Jvb2xlYW59IHRydWUgaWYgZXZlbnQgc2hvdWxkIGJlIGVtaXR0ZWRcbiAgICAgKi9cbiAgICBzaG91bGRFbWl0OiBmdW5jdGlvbigpIHsgcmV0dXJuIHRydWU7IH0sXG5cbiAgICAvKipcbiAgICAgKiBTdWJzY3JpYmVzIHRoZSBnaXZlbiBjYWxsYmFjayBmb3IgYWN0aW9uIHRyaWdnZXJlZFxuICAgICAqXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGNhbGxiYWNrIHRvIHJlZ2lzdGVyIGFzIGV2ZW50IGhhbmRsZXJcbiAgICAgKiBAcGFyYW0ge01peGVkfSBbb3B0aW9uYWxdIGJpbmRDb250ZXh0IFRoZSBjb250ZXh0IHRvIGJpbmQgdGhlIGNhbGxiYWNrIHdpdGhcbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IENhbGxiYWNrIHRoYXQgdW5zdWJzY3JpYmVzIHRoZSByZWdpc3RlcmVkIGV2ZW50IGhhbmRsZXJcbiAgICAgKi9cbiAgICBsaXN0ZW46IGZ1bmN0aW9uKGNhbGxiYWNrLCBiaW5kQ29udGV4dCkge1xuICAgICAgICB2YXIgZXZlbnRIYW5kbGVyID0gZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkoYmluZENvbnRleHQsIGFyZ3MpO1xuICAgICAgICB9LCBtZSA9IHRoaXM7XG4gICAgICAgIHRoaXMuZW1pdHRlci5hZGRMaXN0ZW5lcih0aGlzLmV2ZW50TGFiZWwsIGV2ZW50SGFuZGxlcik7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIG1lLmVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIobWUuZXZlbnRMYWJlbCwgZXZlbnRIYW5kbGVyKTtcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUHVibGlzaGVzIGFuIGV2ZW50IHVzaW5nIGB0aGlzLmVtaXR0ZXJgIChpZiBgc2hvdWxkRW1pdGAgYWdyZWVzKVxuICAgICAqL1xuICAgIHRyaWdnZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cyxcbiAgICAgICAgICAgIHByZSA9IHRoaXMucHJlRW1pdC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgYXJncyA9IHByZSA9PT0gdW5kZWZpbmVkID8gYXJncyA6IF8uaXNBcmd1bWVudHMocHJlKSA/IHByZSA6IFtdLmNvbmNhdChwcmUpO1xuICAgICAgICBpZiAodGhpcy5zaG91bGRFbWl0LmFwcGx5KHRoaXMsIGFyZ3MpKSB7XG4gICAgICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdCh0aGlzLmV2ZW50TGFiZWwsIGFyZ3MpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRyaWVzIHRvIHB1Ymxpc2ggdGhlIGV2ZW50IG9uIHRoZSBuZXh0IHRpY2tcbiAgICAgKi9cbiAgICB0cmlnZ2VyQXN5bmM6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzLG1lID0gdGhpcztcbiAgICAgICAgXy5uZXh0VGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIG1lLnRyaWdnZXIuYXBwbHkobWUsIGFyZ3MpO1xuICAgICAgICB9KTtcbiAgICB9XG59O1xuIiwidmFyIFJlZmx1eCA9IHJlcXVpcmUoJy4uL3NyYycpLFxuICAgIF8gPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obGlzdGVuYWJsZSxrZXkpe1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgZm9yKHZhciBtIGluIFJlZmx1eC5MaXN0ZW5lck1ldGhvZHMpe1xuICAgICAgICAgICAgICAgIGlmICh0aGlzW21dICE9PSBSZWZsdXguTGlzdGVuZXJNZXRob2RzW21dKXtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXNbbV0pe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgXCJDYW4ndCBoYXZlIG90aGVyIHByb3BlcnR5ICdcIittK1wiJyB3aGVuIHVzaW5nIFJlZmx1eC5saXN0ZW5UbyFcIjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzW21dID0gUmVmbHV4Lkxpc3RlbmVyTWV0aG9kc1ttXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgbWUgPSB0aGlzLCBjYiA9IChrZXkgPT09IHVuZGVmaW5lZCA/IHRoaXMuc2V0U3RhdGUgOiBmdW5jdGlvbih2KXttZS5zZXRTdGF0ZShfLm9iamVjdChba2V5XSxbdl0pKTt9KTtcbiAgICAgICAgICAgIHRoaXMubGlzdGVuVG8obGlzdGVuYWJsZSxjYixjYik7XG4gICAgICAgIH0sXG4gICAgICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBSZWZsdXguTGlzdGVuZXJNaXhpbi5jb21wb25lbnRXaWxsVW5tb3VudFxuICAgIH07XG59O1xuIiwidmFyIF8gPSByZXF1aXJlKCcuL3V0aWxzJyksXG4gICAgUmVmbHV4ID0gcmVxdWlyZSgnLi4vc3JjJyksXG4gICAgS2VlcCA9IHJlcXVpcmUoJy4vS2VlcCcpLFxuICAgIGFsbG93ZWQgPSB7cHJlRW1pdDoxLHNob3VsZEVtaXQ6MX07XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhY3Rpb24gZnVuY3RvciBvYmplY3QuIEl0IGlzIG1peGVkIGluIHdpdGggZnVuY3Rpb25zXG4gKiBmcm9tIHRoZSBgUHVibGlzaGVyTWV0aG9kc2AgbWl4aW4uIGBwcmVFbWl0YCBhbmQgYHNob3VsZEVtaXRgIG1heVxuICogYmUgb3ZlcnJpZGRlbiBpbiB0aGUgZGVmaW5pdGlvbiBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRlZmluaXRpb24gVGhlIGFjdGlvbiBvYmplY3QgZGVmaW5pdGlvblxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRlZmluaXRpb24pIHtcblxuICAgIGRlZmluaXRpb24gPSBkZWZpbml0aW9uIHx8IHt9O1xuXG4gICAgZm9yKHZhciBkIGluIGRlZmluaXRpb24pe1xuICAgICAgICBpZiAoIWFsbG93ZWRbZF0gJiYgUmVmbHV4LlB1Ymxpc2hlck1ldGhvZHNbZF0pIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBvdmVycmlkZSBBUEkgbWV0aG9kIFwiICsgZCArXG4gICAgICAgICAgICAgICAgXCIgaW4gYWN0aW9uIGNyZWF0aW9uLiBVc2UgYW5vdGhlciBtZXRob2QgbmFtZSBvciBvdmVycmlkZSBpdCBvbiBSZWZsdXguUHVibGlzaGVyTWV0aG9kcyBpbnN0ZWFkLlwiXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGNvbnRleHQgPSBfLmV4dGVuZCh7XG4gICAgICAgIGV2ZW50TGFiZWw6IFwiYWN0aW9uXCIsXG4gICAgICAgIGVtaXR0ZXI6IG5ldyBfLkV2ZW50RW1pdHRlcigpLFxuICAgICAgICBfaXNBY3Rpb246IHRydWVcbiAgICB9LFJlZmx1eC5QdWJsaXNoZXJNZXRob2RzLGRlZmluaXRpb24pO1xuXG4gICAgdmFyIGZ1bmN0b3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgZnVuY3RvcltmdW5jdG9yLnN5bmM/XCJ0cmlnZ2VyXCI6XCJ0cmlnZ2VyQXN5bmNcIl0uYXBwbHkoZnVuY3RvciwgYXJndW1lbnRzKTtcbiAgICB9O1xuXG4gICAgXy5leHRlbmQoZnVuY3Rvcixjb250ZXh0KTtcblxuICAgIEtlZXAuY3JlYXRlZEFjdGlvbnMucHVzaChmdW5jdG9yKTtcblxuICAgIHJldHVybiBmdW5jdG9yO1xuXG59O1xuIiwidmFyIF8gPSByZXF1aXJlKCcuL3V0aWxzJyksXG4gICAgUmVmbHV4ID0gcmVxdWlyZSgnLi4vc3JjJyksXG4gICAgS2VlcCA9IHJlcXVpcmUoJy4vS2VlcCcpLFxuICAgIGFsbG93ZWQgPSB7cHJlRW1pdDoxLHNob3VsZEVtaXQ6MX07XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBldmVudCBlbWl0dGluZyBEYXRhIFN0b3JlLiBJdCBpcyBtaXhlZCBpbiB3aXRoIGZ1bmN0aW9uc1xuICogZnJvbSB0aGUgYExpc3RlbmVyTWV0aG9kc2AgYW5kIGBQdWJsaXNoZXJNZXRob2RzYCBtaXhpbnMuIGBwcmVFbWl0YFxuICogYW5kIGBzaG91bGRFbWl0YCBtYXkgYmUgb3ZlcnJpZGRlbiBpbiB0aGUgZGVmaW5pdGlvbiBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRlZmluaXRpb24gVGhlIGRhdGEgc3RvcmUgb2JqZWN0IGRlZmluaXRpb25cbiAqIEByZXR1cm5zIHtTdG9yZX0gQSBkYXRhIHN0b3JlIGluc3RhbmNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZGVmaW5pdGlvbikge1xuXG4gICAgZGVmaW5pdGlvbiA9IGRlZmluaXRpb24gfHwge307XG5cbiAgICBmb3IodmFyIGQgaW4gZGVmaW5pdGlvbil7XG4gICAgICAgIGlmICghYWxsb3dlZFtkXSAmJiAoUmVmbHV4LlB1Ymxpc2hlck1ldGhvZHNbZF0gfHwgUmVmbHV4Lkxpc3RlbmVyTWV0aG9kc1tkXSkpe1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IG92ZXJyaWRlIEFQSSBtZXRob2QgXCIgKyBkICsgXG4gICAgICAgICAgICAgICAgXCIgaW4gc3RvcmUgY3JlYXRpb24uIFVzZSBhbm90aGVyIG1ldGhvZCBuYW1lIG9yIG92ZXJyaWRlIGl0IG9uIFJlZmx1eC5QdWJsaXNoZXJNZXRob2RzIC8gUmVmbHV4Lkxpc3RlbmVyTWV0aG9kcyBpbnN0ZWFkLlwiXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gU3RvcmUoKSB7XG4gICAgICAgIHZhciBpPTAsIGFycjtcbiAgICAgICAgdGhpcy5zdWJzY3JpcHRpb25zID0gW107XG4gICAgICAgIHRoaXMuZW1pdHRlciA9IG5ldyBfLkV2ZW50RW1pdHRlcigpO1xuICAgICAgICB0aGlzLmV2ZW50TGFiZWwgPSBcImNoYW5nZVwiO1xuICAgICAgICBpZiAodGhpcy5pbml0ICYmIF8uaXNGdW5jdGlvbih0aGlzLmluaXQpKSB7XG4gICAgICAgICAgICB0aGlzLmluaXQoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5saXN0ZW5hYmxlcyl7XG4gICAgICAgICAgICBhcnIgPSBbXS5jb25jYXQodGhpcy5saXN0ZW5hYmxlcyk7XG4gICAgICAgICAgICBmb3IoO2kgPCBhcnIubGVuZ3RoO2krKyl7XG4gICAgICAgICAgICAgICAgdGhpcy5saXN0ZW5Ub01hbnkoYXJyW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIF8uZXh0ZW5kKFN0b3JlLnByb3RvdHlwZSwgUmVmbHV4Lkxpc3RlbmVyTWV0aG9kcywgUmVmbHV4LlB1Ymxpc2hlck1ldGhvZHMsIGRlZmluaXRpb24pO1xuXG4gICAgdmFyIHN0b3JlID0gbmV3IFN0b3JlKCk7XG4gICAgS2VlcC5jcmVhdGVkU3RvcmVzLnB1c2goc3RvcmUpO1xuXG4gICAgcmV0dXJuIHN0b3JlO1xufTtcbiIsImV4cG9ydHMuTGlzdGVuZXJNZXRob2RzID0gcmVxdWlyZSgnLi9MaXN0ZW5lck1ldGhvZHMnKTtcblxuZXhwb3J0cy5QdWJsaXNoZXJNZXRob2RzID0gcmVxdWlyZSgnLi9QdWJsaXNoZXJNZXRob2RzJyk7XG5cbmV4cG9ydHMuY3JlYXRlQWN0aW9uID0gcmVxdWlyZSgnLi9jcmVhdGVBY3Rpb24nKTtcblxuZXhwb3J0cy5jcmVhdGVTdG9yZSA9IHJlcXVpcmUoJy4vY3JlYXRlU3RvcmUnKTtcblxuZXhwb3J0cy5jb25uZWN0ID0gcmVxdWlyZSgnLi9jb25uZWN0Jyk7XG5cbmV4cG9ydHMuTGlzdGVuZXJNaXhpbiA9IHJlcXVpcmUoJy4vTGlzdGVuZXJNaXhpbicpO1xuXG5leHBvcnRzLmxpc3RlblRvID0gcmVxdWlyZSgnLi9saXN0ZW5UbycpO1xuXG5leHBvcnRzLmxpc3RlblRvTWFueSA9IHJlcXVpcmUoJy4vbGlzdGVuVG9NYW55Jyk7XG5cblxudmFyIG1ha2VyID0gcmVxdWlyZSgnLi9qb2lucycpLnN0YXRpY0pvaW5DcmVhdG9yO1xuXG5leHBvcnRzLmpvaW5UcmFpbGluZyA9IGV4cG9ydHMuYWxsID0gbWFrZXIoXCJsYXN0XCIpOyAvLyBSZWZsdXguYWxsIGFsaWFzIGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5XG5cbmV4cG9ydHMuam9pbkxlYWRpbmcgPSBtYWtlcihcImZpcnN0XCIpO1xuXG5leHBvcnRzLmpvaW5TdHJpY3QgPSBtYWtlcihcInN0cmljdFwiKTtcblxuZXhwb3J0cy5qb2luQ29uY2F0ID0gbWFrZXIoXCJhbGxcIik7XG5cblxuLyoqXG4gKiBDb252ZW5pZW5jZSBmdW5jdGlvbiBmb3IgY3JlYXRpbmcgYSBzZXQgb2YgYWN0aW9uc1xuICpcbiAqIEBwYXJhbSBhY3Rpb25OYW1lcyB0aGUgbmFtZXMgZm9yIHRoZSBhY3Rpb25zIHRvIGJlIGNyZWF0ZWRcbiAqIEByZXR1cm5zIGFuIG9iamVjdCB3aXRoIGFjdGlvbnMgb2YgY29ycmVzcG9uZGluZyBhY3Rpb24gbmFtZXNcbiAqL1xuZXhwb3J0cy5jcmVhdGVBY3Rpb25zID0gZnVuY3Rpb24oYWN0aW9uTmFtZXMpIHtcbiAgICB2YXIgaSA9IDAsIGFjdGlvbnMgPSB7fTtcbiAgICBmb3IgKDsgaSA8IGFjdGlvbk5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGFjdGlvbnNbYWN0aW9uTmFtZXNbaV1dID0gZXhwb3J0cy5jcmVhdGVBY3Rpb24oKTtcbiAgICB9XG4gICAgcmV0dXJuIGFjdGlvbnM7XG59O1xuXG4vKipcbiAqIFNldHMgdGhlIGV2ZW50bWl0dGVyIHRoYXQgUmVmbHV4IHVzZXNcbiAqL1xuZXhwb3J0cy5zZXRFdmVudEVtaXR0ZXIgPSBmdW5jdGlvbihjdHgpIHtcbiAgICB2YXIgXyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbiAgICBfLkV2ZW50RW1pdHRlciA9IGN0eDtcbn07XG5cbi8qKlxuICogU2V0cyB0aGUgbWV0aG9kIHVzZWQgZm9yIGRlZmVycmluZyBhY3Rpb25zIGFuZCBzdG9yZXNcbiAqL1xuZXhwb3J0cy5uZXh0VGljayA9IGZ1bmN0aW9uKG5leHRUaWNrKSB7XG4gICAgdmFyIF8gPSByZXF1aXJlKCcuL3V0aWxzJyk7XG4gICAgXy5uZXh0VGljayA9IG5leHRUaWNrO1xufTtcblxuLyoqXG4gKiBQcm92aWRlcyB0aGUgc2V0IG9mIGNyZWF0ZWQgYWN0aW9ucyBhbmQgc3RvcmVzIGZvciBpbnRyb3NwZWN0aW9uXG4gKi9cbmV4cG9ydHMuX19rZWVwID0gcmVxdWlyZSgnLi9LZWVwJyk7XG4iLCIvKipcbiAqIEludGVybmFsIG1vZHVsZSB1c2VkIHRvIGNyZWF0ZSBzdGF0aWMgYW5kIGluc3RhbmNlIGpvaW4gbWV0aG9kc1xuICovXG5cbnZhciBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZSxcbiAgICBjcmVhdGVTdG9yZSA9IHJlcXVpcmUoXCIuL2NyZWF0ZVN0b3JlXCIpLFxuICAgIHN0cmF0ZWd5TWV0aG9kTmFtZXMgPSB7XG4gICAgICAgIHN0cmljdDogXCJqb2luU3RyaWN0XCIsXG4gICAgICAgIGZpcnN0OiBcImpvaW5MZWFkaW5nXCIsXG4gICAgICAgIGxhc3Q6IFwiam9pblRyYWlsaW5nXCIsXG4gICAgICAgIGFsbDogXCJqb2luQ29uY2F0XCJcbiAgICB9O1xuXG4vKipcbiAqIFVzZWQgaW4gYGluZGV4LmpzYCB0byBjcmVhdGUgdGhlIHN0YXRpYyBqb2luIG1ldGhvZHNcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJhdGVneSBXaGljaCBzdHJhdGVneSB0byB1c2Ugd2hlbiB0cmFja2luZyBsaXN0ZW5hYmxlIHRyaWdnZXIgYXJndW1lbnRzXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IEEgc3RhdGljIGZ1bmN0aW9uIHdoaWNoIHJldHVybnMgYSBzdG9yZSB3aXRoIGEgam9pbiBsaXN0ZW4gb24gdGhlIGdpdmVuIGxpc3RlbmFibGVzIHVzaW5nIHRoZSBnaXZlbiBzdHJhdGVneVxuICovXG5leHBvcnRzLnN0YXRpY0pvaW5DcmVhdG9yID0gZnVuY3Rpb24oc3RyYXRlZ3kpe1xuICAgIHJldHVybiBmdW5jdGlvbigvKiBsaXN0ZW5hYmxlcy4uLiAqLykge1xuICAgICAgICB2YXIgbGlzdGVuYWJsZXMgPSBzbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICAgIHJldHVybiBjcmVhdGVTdG9yZSh7XG4gICAgICAgICAgICBpbml0OiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHRoaXNbc3RyYXRlZ3lNZXRob2ROYW1lc1tzdHJhdGVneV1dLmFwcGx5KHRoaXMsbGlzdGVuYWJsZXMuY29uY2F0KFwidHJpZ2dlckFzeW5jXCIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcbn07XG5cbi8qKlxuICogVXNlZCBpbiBgTGlzdGVuZXJNZXRob2RzLmpzYCB0byBjcmVhdGUgdGhlIGluc3RhbmNlIGpvaW4gbWV0aG9kc1xuICogQHBhcmFtIHtTdHJpbmd9IHN0cmF0ZWd5IFdoaWNoIHN0cmF0ZWd5IHRvIHVzZSB3aGVuIHRyYWNraW5nIGxpc3RlbmFibGUgdHJpZ2dlciBhcmd1bWVudHNcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gQW4gaW5zdGFuY2UgbWV0aG9kIHdoaWNoIHNldHMgdXAgYSBqb2luIGxpc3RlbiBvbiB0aGUgZ2l2ZW4gbGlzdGVuYWJsZXMgdXNpbmcgdGhlIGdpdmVuIHN0cmF0ZWd5XG4gKi9cbmV4cG9ydHMuaW5zdGFuY2VKb2luQ3JlYXRvciA9IGZ1bmN0aW9uKHN0cmF0ZWd5KXtcbiAgICByZXR1cm4gZnVuY3Rpb24oLyogbGlzdGVuYWJsZXMuLi4sIGNhbGxiYWNrKi8pe1xuICAgICAgICB2YXIgbGlzdGVuYWJsZXMgPSBzbGljZS5jYWxsKGFyZ3VtZW50cyksXG4gICAgICAgICAgICBjYWxsYmFjayA9IGxpc3RlbmFibGVzLnBvcCgpLFxuICAgICAgICAgICAgbnVtYmVyT2ZMaXN0ZW5hYmxlcyA9IGxpc3RlbmFibGVzLmxlbmd0aCxcbiAgICAgICAgICAgIGpvaW4gPSB7XG4gICAgICAgICAgICAgICAgbnVtYmVyT2ZMaXN0ZW5hYmxlczogbnVtYmVyT2ZMaXN0ZW5hYmxlcyxcbiAgICAgICAgICAgICAgICBjYWxsYmFjazogdGhpc1tjYWxsYmFja118fGNhbGxiYWNrLFxuICAgICAgICAgICAgICAgIGxpc3RlbmVyOiB0aGlzLFxuICAgICAgICAgICAgICAgIHN0cmF0ZWd5OiBzdHJhdGVneVxuICAgICAgICAgICAgfTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW1iZXJPZkxpc3RlbmFibGVzOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMubGlzdGVuVG8obGlzdGVuYWJsZXNbaV0sbmV3TGlzdGVuZXIoaSxqb2luKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzZXQoam9pbik7XG4gICAgfTtcbn07XG5cbi8vIC0tLS0gaW50ZXJuYWwgam9pbiBmdW5jdGlvbnMgLS0tLVxuXG5mdW5jdGlvbiByZXNldChqb2luKSB7XG4gICAgam9pbi5saXN0ZW5hYmxlc0VtaXR0ZWQgPSBuZXcgQXJyYXkoam9pbi5udW1iZXJPZkxpc3RlbmFibGVzKTtcbiAgICBqb2luLmFyZ3MgPSBuZXcgQXJyYXkoam9pbi5udW1iZXJPZkxpc3RlbmFibGVzKTtcbn1cblxuZnVuY3Rpb24gbmV3TGlzdGVuZXIoaSxqb2luKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2FsbGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICAgIGlmIChqb2luLmxpc3RlbmFibGVzRW1pdHRlZFtpXSl7XG4gICAgICAgICAgICBzd2l0Y2goam9pbi5zdHJhdGVneSl7XG4gICAgICAgICAgICAgICAgY2FzZSBcInN0cmljdFwiOiB0aHJvdyBuZXcgRXJyb3IoXCJTdHJpY3Qgam9pbiBmYWlsZWQgYmVjYXVzZSBsaXN0ZW5lciB0cmlnZ2VyZWQgdHdpY2UuXCIpO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJsYXN0XCI6IGpvaW4uYXJnc1tpXSA9IGNhbGxhcmdzOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiYWxsXCI6IGpvaW4uYXJnc1tpXS5wdXNoKGNhbGxhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGpvaW4ubGlzdGVuYWJsZXNFbWl0dGVkW2ldID0gdHJ1ZTtcbiAgICAgICAgICAgIGpvaW4uYXJnc1tpXSA9IChqb2luLnN0cmF0ZWd5PT09XCJhbGxcIj9bY2FsbGFyZ3NdOmNhbGxhcmdzKTtcbiAgICAgICAgfVxuICAgICAgICBlbWl0SWZBbGxMaXN0ZW5hYmxlc0VtaXR0ZWQoam9pbik7XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gZW1pdElmQWxsTGlzdGVuYWJsZXNFbWl0dGVkKGpvaW4pIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGpvaW4ubnVtYmVyT2ZMaXN0ZW5hYmxlczsgaSsrKSB7XG4gICAgICAgIGlmICgham9pbi5saXN0ZW5hYmxlc0VtaXR0ZWRbaV0pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBqb2luLmNhbGxiYWNrLmFwcGx5KGpvaW4ubGlzdGVuZXIsam9pbi5hcmdzKTtcbiAgICByZXNldChqb2luKTtcbn1cbiIsInZhciBSZWZsdXggPSByZXF1aXJlKCcuLi9zcmMnKTtcblxuXG4vKipcbiAqIEEgbWl4aW4gZmFjdG9yeSBmb3IgYSBSZWFjdCBjb21wb25lbnQuIE1lYW50IGFzIGEgbW9yZSBjb252ZW5pZW50IHdheSBvZiB1c2luZyB0aGUgYExpc3RlbmVyTWl4aW5gLFxuICogd2l0aG91dCBoYXZpbmcgdG8gbWFudWFsbHkgc2V0IGxpc3RlbmVycyBpbiB0aGUgYGNvbXBvbmVudERpZE1vdW50YCBtZXRob2QuXG4gKlxuICogQHBhcmFtIHtBY3Rpb258U3RvcmV9IGxpc3RlbmFibGUgQW4gQWN0aW9uIG9yIFN0b3JlIHRoYXQgc2hvdWxkIGJlXG4gKiAgbGlzdGVuZWQgdG8uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufFN0cmluZ30gY2FsbGJhY2sgVGhlIGNhbGxiYWNrIHRvIHJlZ2lzdGVyIGFzIGV2ZW50IGhhbmRsZXJcbiAqIEBwYXJhbSB7RnVuY3Rpb258U3RyaW5nfSBkZWZhdWx0Q2FsbGJhY2sgVGhlIGNhbGxiYWNrIHRvIHJlZ2lzdGVyIGFzIGRlZmF1bHQgaGFuZGxlclxuICogQHJldHVybnMge09iamVjdH0gQW4gb2JqZWN0IHRvIGJlIHVzZWQgYXMgYSBtaXhpbiwgd2hpY2ggc2V0cyB1cCB0aGUgbGlzdGVuZXIgZm9yIHRoZSBnaXZlbiBsaXN0ZW5hYmxlLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGxpc3RlbmFibGUsY2FsbGJhY2ssaW5pdGlhbCl7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNldCB1cCB0aGUgbWl4aW4gYmVmb3JlIHRoZSBpbml0aWFsIHJlbmRlcmluZyBvY2N1cnMuIEltcG9ydCBtZXRob2RzIGZyb20gYExpc3RlbmVyTWV0aG9kc2BcbiAgICAgICAgICogYW5kIHRoZW4gbWFrZSB0aGUgY2FsbCB0byBgbGlzdGVuVG9gIHdpdGggdGhlIGFyZ3VtZW50cyBwcm92aWRlZCB0byB0aGUgZmFjdG9yeSBmdW5jdGlvblxuICAgICAgICAgKi9cbiAgICAgICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgZm9yKHZhciBtIGluIFJlZmx1eC5MaXN0ZW5lck1ldGhvZHMpe1xuICAgICAgICAgICAgICAgIGlmICh0aGlzW21dICE9PSBSZWZsdXguTGlzdGVuZXJNZXRob2RzW21dKXtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXNbbV0pe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgXCJDYW4ndCBoYXZlIG90aGVyIHByb3BlcnR5ICdcIittK1wiJyB3aGVuIHVzaW5nIFJlZmx1eC5saXN0ZW5UbyFcIjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzW21dID0gUmVmbHV4Lkxpc3RlbmVyTWV0aG9kc1ttXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmxpc3RlblRvKGxpc3RlbmFibGUsY2FsbGJhY2ssaW5pdGlhbCk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDbGVhbnMgdXAgYWxsIGxpc3RlbmVyIHByZXZpb3VzbHkgcmVnaXN0ZXJlZC5cbiAgICAgICAgICovXG4gICAgICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBSZWZsdXguTGlzdGVuZXJNZXRob2RzLnN0b3BMaXN0ZW5pbmdUb0FsbFxuICAgIH07XG59O1xuIiwidmFyIFJlZmx1eCA9IHJlcXVpcmUoJy4uL3NyYycpO1xuXG4vKipcbiAqIEEgbWl4aW4gZmFjdG9yeSBmb3IgYSBSZWFjdCBjb21wb25lbnQuIE1lYW50IGFzIGEgbW9yZSBjb252ZW5pZW50IHdheSBvZiB1c2luZyB0aGUgYGxpc3RlbmVyTWl4aW5gLFxuICogd2l0aG91dCBoYXZpbmcgdG8gbWFudWFsbHkgc2V0IGxpc3RlbmVycyBpbiB0aGUgYGNvbXBvbmVudERpZE1vdW50YCBtZXRob2QuIFRoaXMgdmVyc2lvbiBpcyB1c2VkXG4gKiB0byBhdXRvbWF0aWNhbGx5IHNldCB1cCBhIGBsaXN0ZW5Ub01hbnlgIGNhbGwuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGxpc3RlbmFibGVzIEFuIG9iamVjdCBvZiBsaXN0ZW5hYmxlc1xuICogQHJldHVybnMge09iamVjdH0gQW4gb2JqZWN0IHRvIGJlIHVzZWQgYXMgYSBtaXhpbiwgd2hpY2ggc2V0cyB1cCB0aGUgbGlzdGVuZXJzIGZvciB0aGUgZ2l2ZW4gbGlzdGVuYWJsZXMuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obGlzdGVuYWJsZXMpe1xuICAgIHJldHVybiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZXQgdXAgdGhlIG1peGluIGJlZm9yZSB0aGUgaW5pdGlhbCByZW5kZXJpbmcgb2NjdXJzLiBJbXBvcnQgbWV0aG9kcyBmcm9tIGBMaXN0ZW5lck1ldGhvZHNgXG4gICAgICAgICAqIGFuZCB0aGVuIG1ha2UgdGhlIGNhbGwgdG8gYGxpc3RlblRvYCB3aXRoIHRoZSBhcmd1bWVudHMgcHJvdmlkZWQgdG8gdGhlIGZhY3RvcnkgZnVuY3Rpb25cbiAgICAgICAgICovXG4gICAgICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGZvcih2YXIgbSBpbiBSZWZsdXguTGlzdGVuZXJNZXRob2RzKXtcbiAgICAgICAgICAgICAgICBpZiAodGhpc1ttXSAhPT0gUmVmbHV4Lkxpc3RlbmVyTWV0aG9kc1ttXSl7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzW21dKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IFwiQ2FuJ3QgaGF2ZSBvdGhlciBwcm9wZXJ0eSAnXCIrbStcIicgd2hlbiB1c2luZyBSZWZsdXgubGlzdGVuVG9NYW55IVwiO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXNbbV0gPSBSZWZsdXguTGlzdGVuZXJNZXRob2RzW21dO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubGlzdGVuVG9NYW55KGxpc3RlbmFibGVzKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENsZWFucyB1cCBhbGwgbGlzdGVuZXIgcHJldmlvdXNseSByZWdpc3RlcmVkLlxuICAgICAgICAgKi9cbiAgICAgICAgY29tcG9uZW50V2lsbFVubW91bnQ6IFJlZmx1eC5MaXN0ZW5lck1ldGhvZHMuc3RvcExpc3RlbmluZ1RvQWxsXG4gICAgfTtcbn07XG4iLCIvKlxuICogaXNPYmplY3QsIGV4dGVuZCwgaXNGdW5jdGlvbiwgaXNBcmd1bWVudHMgYXJlIHRha2VuIGZyb20gdW5kZXNjb3JlL2xvZGFzaCBpblxuICogb3JkZXIgdG8gcmVtb3ZlIHRoZSBkZXBlbmRlbmN5XG4gKi9cbnZhciBpc09iamVjdCA9IGV4cG9ydHMuaXNPYmplY3QgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgdHlwZSA9IHR5cGVvZiBvYmo7XG4gICAgcmV0dXJuIHR5cGUgPT09ICdmdW5jdGlvbicgfHwgdHlwZSA9PT0gJ29iamVjdCcgJiYgISFvYmo7XG59O1xuXG5leHBvcnRzLmV4dGVuZCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICghaXNPYmplY3Qob2JqKSkge1xuICAgICAgICByZXR1cm4gb2JqO1xuICAgIH1cbiAgICB2YXIgc291cmNlLCBwcm9wO1xuICAgIGZvciAodmFyIGkgPSAxLCBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgc291cmNlID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBmb3IgKHByb3AgaW4gc291cmNlKSB7XG4gICAgICAgICAgICBvYmpbcHJvcF0gPSBzb3VyY2VbcHJvcF07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbn07XG5cbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJztcbn07XG5cbmV4cG9ydHMuRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRlbWl0dGVyMycpO1xuXG5leHBvcnRzLm5leHRUaWNrID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICBzZXRUaW1lb3V0KGNhbGxiYWNrLCAwKTtcbn07XG5cbmV4cG9ydHMuY2FsbGJhY2tOYW1lID0gZnVuY3Rpb24oc3RyaW5nKXtcbiAgICByZXR1cm4gXCJvblwiK3N0cmluZy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKStzdHJpbmcuc2xpY2UoMSk7XG59O1xuXG5leHBvcnRzLm9iamVjdCA9IGZ1bmN0aW9uKGtleXMsdmFscyl7XG4gICAgdmFyIG89e30sIGk9MDtcbiAgICBmb3IoO2k8a2V5cy5sZW5ndGg7aSsrKXtcbiAgICAgICAgb1trZXlzW2ldXSA9IHZhbHNbaV07XG4gICAgfVxuICAgIHJldHVybiBvO1xufTtcblxuZXhwb3J0cy5pc0FyZ3VtZW50cyA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0JyAmJiB0eXBlb2YgdmFsdWUubGVuZ3RoID09ICdudW1iZXInICYmXG4gICAgICAodG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IEFyZ3VtZW50c10nIHx8IChoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCAnY2FsbGVlJyAmJiAhcHJvcGVydHlJc0VudW1lcmFibGUuY2FsbCh2YWx1ZSwgJ2NhbGxlZScpKSkpIHx8IGZhbHNlO1xufTtcblxuZXhwb3J0cy50aHJvd0lmID0gZnVuY3Rpb24odmFsLG1zZyl7XG4gICAgaWYgKHZhbCl7XG4gICAgICAgIHRocm93IEVycm9yKG1zZ3x8dmFsKTtcbiAgICB9XG59O1xuIl19
