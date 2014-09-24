'use strict';

var _ = require('underscore');
var Immutable = require('immutable');

module.exports = function (formatic, plugin) {

  plugin.default = '';

  plugin.modifyField = function (root, current) {
    if (current.get('choices')) {
      var choices = current.deref('choices');
      if (_.isString(choices)) {
        choices = Immutable.fromJS(choices.split(','));
      }
      if (choices instanceof Immutable.Map) {
        choices = choices.keySeq().map(function (key) {
          return {
            value: key,
            label: choices.get(key)
          };
        });
      }
      choices = choices.withMutations(function (choices) {
        choices.forEach(function (choice, i) {
          if (_.isString(choice)) {
            choices.set(i, {
              value: choice,
              label: choice
            });
          }
        });
      });

      current.set('choices', choices);
    }
  };
};
