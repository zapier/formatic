'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

var _deepEqual = require('deep-equal');

var _deepEqual2 = _interopRequireDefault(_deepEqual);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _ = {};

_.assign = _.extend = _objectAssign2.default;
_.isEqual = _deepEqual2.default;

// These are not necessarily complete implementations. They're just enough for
// what's used in formatic.

_.flatten = function (arrays) {
  return [].concat.apply([], arrays);
};
_.compact = function (array) {
  return (array || []).filter(Boolean);
};

_.isString = function (value) {
  return typeof value === 'string';
};
_.isUndefined = function (value) {
  return typeof value === 'undefined';
};
_.isArray = function (value) {
  return Object.prototype.toString.call(value) === '[object Array]';
};
_.isNumber = function (value) {
  return typeof value === 'number';
};
_.isBoolean = function (value) {
  return typeof value === 'boolean';
};
_.isNull = function (value) {
  return value === null;
};
_.isFunction = function (value) {
  return typeof value === 'function';
};

_.isObject = function (value) {
  var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);
  return !!value && (type === 'object' || type === 'function');
};

_.clone = function (value) {
  if (!_.isObject(value)) {
    return value;
  }
  return _.isArray(value) ? value.slice() : _.assign({}, value);
};

_.find = function (items, testFn) {
  for (var i = 0; i < items.length; i++) {
    if (testFn(items[i], i)) {
      return items[i];
    }
  }
  return void 0;
};

_.every = function (items, testFn) {
  for (var i = 0; i < items.length; i++) {
    if (!testFn(items[i])) {
      return false;
    }
  }
  return true;
};

_.any = function (items, testFn) {
  for (var i = 0; i < items.length; i++) {
    if (testFn(items[i])) {
      return true;
    }
  }
  return false;
};

_.each = function (obj, iterateFn) {
  Object.keys(obj).forEach(function (key) {
    iterateFn(obj[key], key);
  });
};

_.now = Date.now || function () {
  return new Date().getTime();
};

_.debounce = function (func, wait, immediate) {
  var timeout, args, context, timestamp, result;

  var later = function later() {
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

  return function () {
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

exports.default = _;