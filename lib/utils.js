'use strict';

var utils = {};

var nextWithAutoArgs = function (fn, fnArguments) {
  if (arguments.length === 2) {
    return fn.apply(this, fnArguments);
  } else {
    var args = Array.prototype.slice.call(arguments, 2);
    return fn.apply(this, args);
  }
};

utils.wrapFn = function (fn, wrappers) {
  wrappers = wrappers || [];

  if (typeof wrappers === 'function') {
    wrappers = [wrappers];
  }

  if (wrappers.length === 0) {
    return fn;
  }

  var nextFn = fn;
  if (wrappers.length > 1) {
    nextFn = utils.wrapFn(fn, wrappers.slice(1));
  }

  var wrappedFn = function () {

    var fnArguments = arguments;

    var next = nextWithAutoArgs.bind(this, nextFn, fnArguments);

    return wrappers[0].bind(this, next).apply(this, arguments);
  };

  return wrappedFn;
};

utils.wrappable = function (obj) {

  obj = obj || {};

  if (obj.wrap) {
    return obj;
  }

  var methods = {};

  obj.wrap = function (name, wrapFn) {

    if (!(name in obj)) {
      throw new Error('Method not defined to wrap: ' + name);
    }

    var method;

    if (name in methods) {
      // Check if method was replaced.
      if (!obj[name].isWrapped) {
        delete methods[name];
      }
    }

    if (name in methods) {
      method = methods[name];
    } else {
      method = {};
      methods[name] = method;
      method.wrappers = [];
      var fn = obj[name];
      if (typeof fn !== 'function') {
        throw new Error('Method not a function: ' + name)
      }
      method.fn = fn;
      obj[name] = function () {
        if (method.compiled === null) {
          method.compiled = utils.wrapFn(fn, method.wrappers);
        }
        return method.compiled.apply(this, arguments);
      };
      obj[name].isWrapped = true;
    }

    method.wrappers.push(wrapFn);
    method.compiled = null;
  };

  return obj;
};

var textPart = function (value, type) {
  type = type || 'text';
  return {
    type: type,
    value: value
  };
};

utils.parseTextWithTags = function (value) {
  value = value || '';
  var parts = value.split('{{');
  var frontPart = [];
  if (parts[0] !== '') {
    frontPart = [
      textPart(parts[0])
    ];
  }
  parts = frontPart.concat(
    parts.slice(1).map(function (part) {
      if (part.indexOf('}}') >= 0) {
        return [
          textPart(part.substring(0, part.indexOf('}}')), 'tag'),
          textPart(part.substring(part.indexOf('}}') + 2))
        ];
      } else {
        return textPart('{{' + part, 'text');
      }
    })
  );
  return [].concat.apply([], parts);
};

module.exports = utils;
