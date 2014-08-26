/*global describe, it, expect*/
'use strict';

var _ = require('underscore');

describe('form data', function() {

  var formatic = require('../').create('react');

  var testValid = function (field, data, isValid) {

    var form = formatic();
    form.fields(field);
    form.set(data);

    expect(form.isValid()).toEqual(isValid);
  };

  it('should be valid if not required', function () {
    testValid({
      type: 'text',
      key: 'name'
    }, {}, true);
  });

  it('should be invalid if required', function () {
    testValid({
      type: 'text',
      key: 'name',
      required: true
    }, {}, false);
  });

  it('should be valid if required and has value', function () {
    testValid({
      type: 'text',
      key: 'name',
      required: true
    }, {
      name: 'Joe'
    }, true);
  });


});
