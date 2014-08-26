/*global describe, it, expect*/
'use strict';

describe('form data', function() {

  var formatic = require('../').create('react');

  it('form can hold data', function () {

    var form = formatic();
    form.fields([
      {
        type: 'text',
        key: 'name'
      }
    ]);
    form.set('name', 'Joe');

    expect(form.val()).toEqual({name: 'Joe'});
  });

  it('form should signal change', function () {

    var form = formatic();
    var signal = false;
    form.fields([
      {
        type: 'text',
        key: 'name'
      }
    ]);
    form.on('update', function () {
      signal = true;
    });
    form.set('name', 'Joe');

    expect(signal).toEqual(true);
  });

});
