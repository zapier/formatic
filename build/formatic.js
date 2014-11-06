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

},{"eventemitter3":54}]},{},[1]);
