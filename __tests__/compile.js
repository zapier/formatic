/*global describe, it, expect*/
'use strict';

var _ = require('underscore');

describe('form data', function() {

  var formatic = require('../')('react');

  var compile = function (field, props) {

    var form = formatic();

    form.fields([
      field
    ]);

    _.each(props, function (value, key) {
      expect(form.root.fields[0][key]).toEqual(value);
    });
  };

  it('should compile value with a field to a value', function () {

    compile({
      type: 'text',
      fields: [
        {
          type: 'string',
          value: 'foo'
        }
      ]
    }, {
      value: 'foo',
      fields: undefined
    });
  });

  it('should compile readonly field', function () {

    compile({
      type: 'text',
      value: 'foo'
    }, {
      value: 'foo',
      isReadOnly: true
    });
  });
});
