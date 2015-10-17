var _ = {};

_.assign = _.extend = require('object-assign');
_.isEqual = require('deep-equal');

// These are not necessarily complete implementations. They're just enough for
// what's used in formatic.

_.flatten = (arrays) => [].concat.apply([], arrays);

_.isString = value => typeof value === 'string';
_.isUndefined = value => typeof value === 'undefined';
_.isObject = value => typeof value === 'object';
_.isArray = value => Object.prototype.toString.call(value) === '[object Array]';
_.isNumber = value => typeof value === 'number';
_.isBoolean = value => typeof value === 'boolean';
_.isNull = value => value === null;
_.isFunction = value => typeof value === 'function';

_.clone = value => {
  if (!_.isObject(value)) {
    return value;
  }
  return _.isArray(value) ? value.slice() : _.assign({}, value);
};

_.find = (items, testFn) => {
  for (var i = 0; i < items.length; i++) {
    if (testFn(items[i])) {
      return items[i];
    }
  }
  return void 0;
};

_.every = (items, testFn) => {
  for (var i = 0; i < items.length; i++) {
    if (!testFn(items[i])) {
      return false;
    }
  }
  return true;
};

_.each = (obj, iterateFn) => {
  Object.keys(obj).forEach(key => {
    iterateFn(obj[key], key);
  });
};

_.object = (array) => {
  const obj = {};

  array.forEach(pair => {
    obj[pair[0]] = pair[1];
  });

  return obj;
};

module.exports = _;
