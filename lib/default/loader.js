'use strict';

var _ = require('underscore');

module.exports = function (plugin) {

  var util = plugin.require('util');

  var loader = plugin.exports;

  var isLoading = {};
  var sources = {};

  loader.loadMeta = function (form, keys) {
    loader.loadAsyncFromSource(form, util.joinMetaKeys(keys));
  };

  loader.loadAsyncFromSource = function (form, key, waitTime) {
    setTimeout(function () {
      loader.loadFromSource(form, key);
    }, waitTime || 0);
  };

  loader.loadFromSource = function (form, key) {

    var source = loader.bestSource(form, key);
    if (source) {
      var args = util.splitMetaKey(key);
      args = args.slice(source.staticArgs.length);

      var result = source.fn.apply(null, args);

      if (result) {
        if (result.then) {
          var promise = result.then(function (result) {
            form.meta(key, result);
            isLoading[key] = false;
          });

          var onError = function () {
            isLoading[key] = false;
          };

          if (promise.catch) {
            promise.catch(onError);
          } else {
            // silly jQuery promises
            promise.fail(onError);
          }

        } else {
          setTimeout(function () {
            form.meta(key, result);
            isLoading[key] = false;
          }, 0);
        }
      } else {
        isLoading[key] = false;
      }

    } else {
      isLoading[key] = false;
    }
  };

  loader.bestSource = function (form, key) {
    if (sources[key]) {
      return {
        staticArgs: util.splitMetaKey(key),
        fn: sources[key]
      };
    } else {
      var args = util.splitMetaKey(key);
      if (args.length > 1) {
        args = args.slice(0, args.length - 1);
        return loader.bestSource(form, util.joinMetaKeys(args));
      } else if (sources.__default__) {
        return {
          staticArgs: [],
          fn: sources.__default__
        };
      } else {
        return null;
      }
    }
  };

  loader.source = function () {
    var args = _.toArray(arguments);

    if (args.length > 0 && _.isFunction(args[args.length - 1])) {
      var fn = args[args.length - 1];
      var sourceKey = '__default__';
      if (args.length > 1) {
        sourceKey = util.joinMetaKeys(args.slice(0, args.length - 1));
      }
      sources[sourceKey] = fn;
    }
  };

};
