/*global describe, it, expect*/
'use strict';

describe('util', function() {

  var formatic = require('../');

  var util = formatic.plugin('util');

  it('should see an empty string as a blank', function () {

    expect(util.isBlank('')).toEqual(true);
  });

  it('should see a non-empty string as not blank', function () {

    expect(util.isBlank('foo')).toEqual(false);
  });

  it('should see a null as a blank', function () {

    expect(util.isBlank(null)).toEqual(true);
  });

  it('should see undefined as a blank', function () {

    expect(util.isBlank(undefined)).toEqual(true);
  });

  it('should set prop in obj with string key', function () {

    var obj = {name: 'joe'};

    util.setIn(obj, 'name', 'bob');

    expect(obj.name).toEqual('bob');
  });

  it('should set prop in obj with array key', function () {

    var obj = {name: {first: 'joe'}};

    util.setIn(obj, ['name', 'first'], 'bob');

    expect(obj.name.first).toEqual('bob');
  });

  it('should set prop in obj with array key and index', function () {

    var obj = {cars: ['mustang', 'corvette']};

    util.setIn(obj, ['cars', 1], 'ferrari');

    expect(obj.cars[1]).toEqual('ferrari');
  });

  it('should remove prop in obj with string key', function () {

    var obj = {x: 1, y: 2};

    util.removeIn(obj, 'y');

    expect(obj).toEqual({x: 1});
  });

  it('should remove prop in obj with array key', function () {

    var obj = {x: {y: 1, z: 2}};

    util.removeIn(obj, ['x', 'z']);

    expect(obj).toEqual({x: {y: 1}});
  });

  it('should get prop in obj with string key', function () {

    var obj = {x: 1};

    expect(util.getIn(obj, 'x')).toEqual(1);
  });

  it('should get prop in obj with array key', function () {

    var obj = {x: {y: 1}};

    expect(util.getIn(obj, ['x', 'y'])).toEqual(1);
  });

  it('should get prop in obj with array and index key', function () {

    var obj = {x: [1]};

    expect(util.getIn(obj, ['x', 0])).toEqual(1);
  });

  it('should append in obj with string key', function () {

    var obj = {x: ['a']};

    expect(util.appendIn(obj, 'x', 'b')).toEqual({x: ['a', 'b']});
  });

  it('should append in obj with array key', function () {

    var obj = {x: {y: ['a']}};

    expect(util.appendIn(obj, ['x', 'y'], 'b')).toEqual({x: {y: ['a', 'b']}});
  });

  it('should move in obj', function () {

    var obj = {x: ['a', 'b']};

    expect(util.moveIn(obj, ['x'], 0, 1)).toEqual({x: ['b', 'a']});
    expect(util.moveIn(obj, ['x'], 1, 0)).toEqual({x: ['a', 'b']});
  });

  it('should copy json', function () {

    var obj = {x: {y: 1}};

    var copy = util.copyValue(obj);

    obj.x.y = 2;

    expect(copy).toEqual({x: {y: 1}});
  });

  it('should deep copy obj', function () {

    var obj = {x: {y: 1}};

    var copy = util.deepCopy(obj);

    obj.x.y = 2;

    expect(copy).toEqual({x: {y: 1}});
  });

  it('should match item to value', function () {

    var obj = {type: 'foo'};

    var item = {match: {type: 'foo'}};

    expect(util.itemMatchesValue(item, obj)).toEqual(true);
  });

  it('should not match item to value', function () {

    var obj = {type: 'foo'};

    var item = {match: {type: 'bar'}};

    expect(util.itemMatchesValue(item, obj)).toEqual(false);
  });

  it('should create string field from string', function () {

    var def = util.fieldDefFromValue('foo');

    expect(def).toEqual({type: 'string'});
  });

  it('should create object field from object', function () {

    var def = util.fieldDefFromValue({foo: 'bar'});

    expect(def).toEqual({type: 'object', fields: [{type: 'string', label: 'Foo', key: 'foo'}]});
  });

  it('should create array field from array', function () {

    var def = util.fieldDefFromValue(['foo']);

    expect(def).toEqual({type: 'array', fields: [{type: 'string', key: 0}]});
  });

  it('should humanize a string', function () {

    expect(util.humanize('foo')).toEqual('Foo');
  });

  it('should add class names togeter', function () {

    expect(util.className('foo', null, 'bar')).toEqual('foo bar');
  });

  it('should parse blank text', function () {

    expect(util.parseTextWithTags('')).toEqual([]);
  });

  it('should parse plain text', function () {

    expect(util.parseTextWithTags('foo')).toEqual([{type: 'text', value: 'foo'}]);
  });

  it('should parse text with tag in middle', function () {

    expect(util.parseTextWithTags('foo {{bar}} baz')).toEqual([
      {type: 'text', value: 'foo '},
      {type: 'tag', value: 'bar'},
      {type: 'text', value: ' baz'}
    ]);
  });

  it('should parse text with tag at front', function () {

    expect(util.parseTextWithTags('{{bar}} baz')).toEqual([
      {type: 'tag', value: 'bar'},
      {type: 'text', value: ' baz'}
    ]);
  });

  it('should parse text with tag at back', function () {

    expect(util.parseTextWithTags('{{bar}} baz')).toEqual([
      {type: 'tag', value: 'bar'},
      {type: 'text', value: ' baz'}
    ]);
  });

  it('should parse text with tags with extra braces', function () {
    expect(util.parseTextWithTags('foo {{{bar}} baz')).toEqual([
      {type: 'text', value: 'foo {'},
      {type: 'tag', value: 'bar'},
      {type: 'text', value: ' baz'}
    ]);
  });
});
