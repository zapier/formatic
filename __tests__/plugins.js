/*global describe, it, expect*/
'use strict';

describe('plugins', function() {

  var Formatic = require('../');

  it('can create a new default configuration', function () {

    var defaultConfig = require('../lib/default-config');

    var config = Formatic.createConfig();

    expect(config.isEmptyObject.toString()).toEqual(defaultConfig.isEmptyObject.toString());
  });

  it('can create a new configuration with plugin', function () {

    var plugin = function (config) {

      var isEmptyObject = config.isEmptyObject;

      config.isEmptyObject = function (obj) {
        if (obj === 'empty') {
          return true;
        }
        return isEmptyObject.apply(this, arguments);
      };
    };

    var config = Formatic.createConfig(
      plugin
    );

    expect(config.isEmptyObject('empty')).toEqual(true);
    expect(config.isEmptyObject({})).toEqual(true);
    expect(config.isEmptyObject('foo')).toEqual(false);
  });
});
