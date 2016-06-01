var _ = {};

_.assign = _.extend = require('object-assign');
_.isEqual = require('deep-equal');

// These are not necessarily complete implementations. They're just enough for
// what's used in formatic.

_.flatten = (arrays) => [].concat.apply([], arrays);

_.isString = value => typeof value === 'string';
_.isUndefined = value => typeof value === 'undefined';
_.isArray = value => Object.prototype.toString.call(value) === '[object Array]';
_.isNumber = value => typeof value === 'number';
_.isBoolean = value => typeof value === 'boolean';
_.isNull = value => value === null;
_.isFunction = value => typeof value === 'function';

_.isObject = value => {
  const type = typeof value;
  return !!value && (type === 'object' || type === 'function');
};

_.clone = value => {
  if (!_.isObject(value)) {
    return value;
  }
  return _.isArray(value) ? value.slice() : _.assign({}, value);
};

_.find = (items, testFn) => {
  for (var i = 0; i < items.length; i++) {
    if (testFn(items[i], i)) {
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

_.any = (items, testFn) => {
  for (var i = 0; i < items.length; i++) {
    if (testFn(items[i])) {
      return true;
    }
  }
  return false;
};

_.each = (obj, iterateFn) => {
  Object.keys(obj).forEach(key => {
    iterateFn(obj[key], key);
  });
};

_.now = Date.now || function() {
  return new Date().getTime();
};

_.debounce = function(func, wait, immediate) {
  var timeout, args, context, timestamp, result;

  var later = function() {
    var last = _.now() - timestamp;

    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) {
          context = args = null;
        }
      }
    }
  };

  return function() {
    context = this;
    args = arguments;
    timestamp = _.now();
    var callNow = immediate && !timeout;
    if (!timeout) {
      timeout = setTimeout(later, wait);
    }
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };
};

module.exports = _;
