'use strict';

var _ = require('underscore');

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
