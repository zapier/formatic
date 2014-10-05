'use strict';

var _ = require('underscore');
var Emitter = require('component-emitter');
var objectpath = require('objectpath');
var Immutable = require('immutable');

module.exports = function (formatic) {

  formatic.form.wrap('init', function (next) {
    this._isLoading = {};
    this._sources = {};

    return next();
  });

  formatic.needKeys = function (data, keys) {
    keys = keys || [];
    if (data) {
      if (data.get('needLookupKey')) {
        keys.push(data.get('needLookupKey'));
      }
      if (data.get('fields')) {
        data.get('fields').forEach(function (field) {
          formatic.needKeys(field, keys);
        });
      }
    }
    return _.unique(keys);
  };

  formatic.loadNeededData = function (form) {

    var keys = formatic.needKeys(form._formState);

    keys.forEach(function (key) {
      if (!form._isLoading[key]) {
        form._isLoading[key] = true;
        formatic.loadAsyncFromSource(form, key);
      }
    });
  };

  formatic.loadAsyncFromSource = function (form, key, waitTime) {
    setTimeout(function () {
      formatic.loadFromSource(form, key);
    }, waitTime || 0);
  };

  formatic.loadFromSource = function (form, key) {

    var source = formatic.bestSource(form, key);
    if (source) {
      var args = key.split('::');
      args = args.slice(source.staticArgs.length);

      var result = source.fn.apply(null, args);

      if (result) {
        if (result.then) {
          var promise = result.then(function (result) {
            form.meta(key, result);
            form._isLoading[key] = false;
          });

          var onError = function () {
            form._isLoading[key] = false;
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
            form._isLoading[key] = false;
          }, 0);
        }
      } else {
        form._isLoading[key] = false;
      }

    } else {
      form._isLoading[key] = false;
    }
  };

  formatic.bestSource = function (form, key) {
    if (form._sources[key]) {
      return {
        staticArgs: key.split('::'),
        fn: form._sources[key]
      };
    } else {
      var args = key.split('::');
      if (args.length > 1) {
        args = args.slice(0, args.length - 1);
        return formatic.bestSource(form, args.join('::'));
      } else if (form._sources.__default__) {
        return {
          staticArgs: [],
          fn: form._sources.__default__
        };
      } else {
        return null;
      }
    }
  };

  formatic.form.source = function () {
    var args = _.toArray(arguments);

    if (args.length > 0 && _.isFunction(args[args.length - 1])) {
      var fn = args[args.length - 1];
      var sourceKey = '__default__';
      if (args.length > 1) {
        sourceKey = args.slice(0, args.length - 1).join('::');
      }
      this._sources[sourceKey] = fn;
    }
  };
};
