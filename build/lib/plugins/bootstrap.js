// # bootstrap plugin

/*
The bootstrap plugin sneaks in some classes to elements so that it plays well
with Twitter Bootstrap.
*/

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (config) {

  var _createElement = config.createElement;

  return {
    createElement: function createElement(name, props, children) {

      name = config.elementName(name);

      var modifier = modifiers[name];

      if (modifier) {
        // If there is a modifier for this element, add the classes and label.
        props = _undash2.default.extend({}, props);
        props.classes = _undash2.default.extend({}, props.classes, modifier.classes);
        if ('label' in modifier) {
          props.label = modifier.label;
        }
      }

      return _createElement(name, props, children);
    }
  };
};

var _undash = require('../undash');

var _undash2 = _interopRequireDefault(_undash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Declare some classes and labels for each element.
var modifiers = {

  'Field': { classes: { 'form-group': true } },
  'Help': { classes: { 'help-block': true } },
  'Sample': { classes: { 'help-block': true } },
  'ArrayControl': { classes: { 'form-inline': true } },
  'ArrayItem': { classes: { 'well': true } },
  'AssocListItem': { classes: { 'well': true } },
  'FieldTemplateChoices': { classes: { 'form-control': true } },
  'AddItem': { classes: { 'glyphicon glyphicon-plus': true }, label: '' },
  'RemoveItem': { classes: { 'glyphicon glyphicon-remove': true }, label: '' },
  'MoveItemBack': { classes: { 'glyphicon glyphicon-arrow-up': true }, label: '' },
  'MoveItemForward': { classes: { 'glyphicon glyphicon-arrow-down': true }, label: '' },
  'AssocListItemKey': { classes: { 'form-control': true } },

  'SingleLineString': { classes: { 'form-control': true } },
  'String': { classes: { 'form-control': true } },
  'PrettyText': { classes: { 'form-control': true } },
  'Json': { classes: { 'form-control': true } },
  'SelectValue': { classes: { 'form-control': true } }
};