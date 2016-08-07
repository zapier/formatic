/*global describe, it, expect*/
'use strict';

describe('types and value changes', function() {

  var Formatic = require('../lib/formatic');

  var config = Formatic.createConfig();

  it('should validate a form with no required value', function () {

    var fields = [
      {
        type: 'string',
        key: 'greeting'
      }
    ];

    var isValid = config.isValidRootValue({
      fields: fields
    });

    expect(isValid).toEqual(true);
  });

  it('should invalidate a form with required value', function () {

    var fields = [
      {
        type: 'string',
        key: 'greeting',
        required: true
      }
    ];

    var isValid = config.isValidRootValue({
      fields: fields
    });

    expect(isValid).toEqual(false);
  });

  it('should validate a form with a required/default value', function () {

    var fields = [
      {
        type: 'string',
        key: 'greeting',
        default: 'hello',
        required: true
      }
    ];

    var isValid = config.isValidRootValue({
      fields: fields
    });

    expect(isValid).toEqual(true);
  });
});
