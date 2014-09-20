/*global describe, it, expect*/
'use strict';

describe('form data', function() {

  var formatic = require('../').create('react');

  it('can make ids from keys', function () {

    var result = formatic.buildFieldIds([
      {
        type: 'string',
        key: 'name'
      }
    ]);

    expect(result).toEqual({
      map: {
        name: {
          id: 'name',
          key: 'name',
          type: 'string'
        }
      },
      list: [
        {
          id: 'name',
          key: 'name',
          type: 'string'
        }
      ]
    });
  });

  it('can make fake ids', function () {

    var result = formatic.buildFieldIds([
      {
        type: 'string',
        key: 'name'
      },
      {
        type: 'string'
      },
      {
        type: 'string'
      }
    ]);

    expect(result).toEqual({
      map: {
        name: {
          id: 'name',
          key: 'name',
          type: 'string'
        },
        __name__string__0: {
          id: '__name__string__0',
          type: 'string'
        },
        __name__string__1: {
          id: '__name__string__1',
          type: 'string'
        }
      },
      list: [
        {
          id: 'name',
          key: 'name',
          type: 'string'
        },
        {
          id: '__name__string__0',
          type: 'string'
        },
        {
          id: '__name__string__1',
          type: 'string'
        }
      ]
    });
  });


  // it('form can hold data', function () {
  //
  //   var form = formatic();
  //   form.fields([
  //     {
  //       type: 'text',
  //       key: 'name'
  //     }
  //   ]);
  //   form.set('name', 'Joe');
  //
  //   expect(form.val()).toEqual({name: 'Joe'});
  // });
  //
  // it('form should signal change', function () {
  //
  //   var form = formatic();
  //   var signal = false;
  //   form.fields([
  //     {
  //       type: 'text',
  //       key: 'name'
  //     }
  //   ]);
  //   form.on('update', function () {
  //     signal = true;
  //   });
  //   form.set('name', 'Joe');
  //
  //   expect(signal).toEqual(true);
  // });

});
