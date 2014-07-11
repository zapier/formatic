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

utils.hookable = function (obj) {

  if (obj.hook) {
    return;
  }

  var hooks = {};

  obj.hook = function (name, fn, replace) {

    var hook;

    if (name in hooks) {

      if (!replace) {
        throw new Error('Hook already defined: ' + name);
      }

      hook = hooks[name];
    } else {
      hook = {};
      hooks[name] = hook;
      hook.wrappers = [];
    }

    hook.fn = fn;
    hook.compiled = null;

    obj[name] = function () {
      if (hook.compiled === null) {
        hook.compiled = utils.wrapFn(fn, hook.wrappers);
      }
      return hook.compiled.apply(this, arguments);
    };
  };

  obj.replaceHook = function (name, fn) {
    return obj.hook(name, fn, true);
  };

  obj.hasHook = function (name) {
    return name in hooks;
  };

  obj.use = function (name, wrapFn) {

    if (!(name in hooks)) {

      throw new Error('Hook not defined: ' + name);
    }

    var hook = hooks[name];

    hook.wrappers.push(wrapFn);
    hook.compiled = null;
  };

};

module.exports = utils;
