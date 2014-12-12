// # bootstrap

'use strict';

var _ = require('underscore');

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

//
// // Build the plugin bundle.
// _.each(modifiers, function (modifier, name) {
//
//   exports['component-props.' + name + '.bootstrap'] = function (plugin) {
//
//     var util = plugin.require('util');
//
//     plugin.exports = [
//       name,
//       function (props) {
//         if (!_.isUndefined(modifier.className)) {
//           props.className = util.className(props.className, modifier.className);
//         }
//         if (!_.isUndefined(modifier.label)) {
//           props.label = modifier.label;
//         }
//       }
//     ];
//   };
//
// });
