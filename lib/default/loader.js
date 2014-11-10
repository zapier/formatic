// # loader

/*
When metadata isn't available, we ask the loader to load it. The loader will
try to find an appropriate source based on the metadata keys.

Note that we ask the loader to load metadata with a set of keys like
`['foo', 'bar']`, but those are converted to a single key like `foo::bar` for
the sake of caching.
*/

'use strict';

var _ = require('underscore');

module.exports = function (plugin) {

  var util = plugin.require('util');

  var loader = plugin.exports;

  var isLoading = {};
  var sources = {};

  // Load metadata for a given form and set of keys.
  loader.loadMeta = function (form, keys) {
    loader.loadAsyncFromSource(form, util.joinMetaKeys(keys));
  };

  // Make sure to load metadata asynchronously.
  loader.loadAsyncFromSource = function (form, key, waitTime) {
    setTimeout(function () {
      loader.loadFromSource(form, key);
    }, waitTime || 0);
  };

  // Load metadata for a form and cache key.
  loader.loadFromSource = function (form, key) {

    // Find the best source for this cache key.
    var source = loader.bestSource(form, key);
    if (source) {

      // The cache key becomes the arguments to the source function.
      var args = util.splitMetaKey(key);
      args = args.slice(source.staticArgs.length);

      // Call the source function.
      var result = source.fn.apply(null, args);

      if (result) {
        // Result could be a promise.
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
        // Or it could be a value. In that case, make sure to asyncify it.
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

  // Get the best source function for a form and cache key.
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

  // Register a source function.
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
