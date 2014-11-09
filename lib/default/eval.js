// # Eval plugin (eval)

/*
The eval plugin will evaluate a field's `eval` property and exchange those
properties for whatever the expression returns. Expressions are just JSON
except if the first element of an array is a string that starts with '@'. In
that case, the array is treated as a Lisp expression where the first element
refers to a function that is called with the rest of the elements as the
arguments. For example:

```js
['@sum', 1, 2]
```

will return the value 3.
*/

'use strict';

var _ = require('underscore');

module.exports = function (plugin) {

  var evalFunctionPlugins = plugin.requireAllOf('eval-function');
  var functions = {};
  _.each(evalFunctionPlugins, function (fn, name) {
    var fnName = name.substring(name.indexOf('.') + 1);
    functions[fnName] = fn;
  });

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

  plugin.exports.evaluate = evaluate;
};
