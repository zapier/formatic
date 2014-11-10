// # bootstrap

/*
The bootstrap plugin bundle exports a bunch of "prop modifier" plugins which
manipulate the props going into many of the components.
*/

'use strict';

var _ = require('underscore');

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
