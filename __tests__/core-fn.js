/*global describe, it, expect*/
'use strict';

describe('form data', function() {

  var formatic = require('../');

  var getIds = function (fieldDefs) {
    return fieldDefs.map(function (fieldDef) {
      return fieldDef.id;
    });
  };

  it('can make ids from keys', function () {

    var fieldDefs = formatic.fillInFormDefIds([
      {
        type: 'string',
        key: 'name'
      }
    ]);

    expect(getIds(fieldDefs)).toEqual(['name']);
  });

  it('can make fake ids', function () {

    var fieldDefs = formatic.fillInFormDefIds([
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

    expect(getIds(fieldDefs)).toEqual(['name', '__name__string__0', '__name__string__1']);
  });

  it('can get id of field', function () {

    expect(formatic.idOfFieldDef({id:'foo'})).toEqual('foo');
    expect(formatic.idOfFieldDef({key:'foo'})).toEqual('foo');
    expect(formatic.idOfFieldDef({id:'foo', key: 'bar'})).toEqual('foo');
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
