/*global describe, it, expect*/
'use strict';

describe('plugins', function() {

  var Formatic = require('../lib/formatic');

  it('can create a new default configuration', function () {

    var config = Formatic.createConfig();

    expect(config.humanize('foo')).toEqual('Foo');
  });

  it('can create a new configuration with plugin', function () {

    var plugin = function (config) {

      var isEmptyObject = config.isEmptyObject;

      return {
        isEmptyObject: function (obj) {
          if (obj === 'empty') {
            return true;
          }
          return isEmptyObject(obj);
        }
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
