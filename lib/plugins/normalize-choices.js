'use strict';

var _ = require('underscore');
var Immutable = require('immutable');

module.exports = function (formatic) {

  formatic.wrap('normalizeField', function (next, fieldState) {

    if (fieldState.get('choices')) {

      var choices = fieldState.get('choices');

      if (_.isString(choices)) {
        choices = formatic.fromJS(choices.split(','));
      }

      if (choices instanceof Immutable.Map) {
        choices = choices.keySeq().map(function (key) {
          return formatic.fromJS({
            value: key,
            label: choices.get(key)
          });
        }).toVector();
      }

      choices = choices.withMutations(function (choices) {
        choices.forEach(function (choice, i) {
          if (_.isString(choice)) {
            choices.set(i, formatic.fromJS({
              value: choice,
              label: choice
            }));
          }
        });
      });

      return next(fieldState.set('choices', choices));
    }

    return next();
  });

  // formatic.wrap('modifyField', function (next, field) {
  //
  //   if (field.choices) {
  //
  //     var choices = field.choices;
  //
  //     if (_.isString(choices)) {
  //       choices = choices.split(',');
  //     }
  //
  //     if (!_.isArray(choices) && _.isObject(choices)) {
  //       choices = Object.keys(choices).map(function (key) {
  //         return {
  //           value: key,
  //           label: choices[key]
  //         };
  //       });
  //     }
  //
  //     choices.forEach(function (choice, i) {
  //       if (_.isString(choice)) {
  //         choices[i] = {
  //           value: choice,
  //           label: choice
  //         };
  //       }
  //     });
  //
  //     field.choices = choices;
  //   }
  //
  //   return next();
  // });
};
