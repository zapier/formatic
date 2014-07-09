/*global describe, it, expect*/
'use strict';

describe('utils', function() {

  var utils = require('../lib/utils');

  it('should wrap function with no wrappers', function () {

    var greet = function () {
      return 'hello!';
    };

    var wrapped = utils.wrapFn(greet, []);

    expect(wrapped()).toEqual('hello!');

  });

  it('should wrap function with one wrapper', function () {

    var greet = function () {
      return 'hello!';
    };

    var upper = function (next) {
      return next().toUpperCase();
    };

    var wrapped = utils.wrapFn(greet, [upper]);

    expect(wrapped()).toEqual('HELLO!');

  });

  it('should wrap function with two wrappers', function () {

    var greet = function () {
      return 'hello!';
    };

    var upper = function (next) {
      return next().toUpperCase();
    };

    var j = function (next) {
      return next().replace('H', 'J');
    };

    var wrapped = utils.wrapFn(greet, [j, upper]);

    expect(wrapped()).toEqual('JELLO!');

  });

  it('should auto pass on arguments', function () {

    var addNumbers = function (array) {
      return array.reduce(function (prev, curr) {return prev + curr;});
    };

    var pushNumber = function (next, array) {
      array.push(array.length + 1);
      return next();
    };

    var wrapped = utils.wrapFn(addNumbers, [pushNumber, pushNumber]);

    expect(wrapped([1,2])).toEqual(10);

  });

  it('should manual pass on arguments', function () {

    var addNumbers = function (array) {
      return array.reduce(function (prev, curr) {return prev + curr;});
    };

    var pushNumber = function (next, array) {
      var newArray = array.slice(0);
      newArray.push(newArray.length + 1);
      return next(newArray);
    };

    var wrapped = utils.wrapFn(addNumbers, [pushNumber, pushNumber]);

    expect(wrapped([1,2])).toEqual(10);

  });

  it('should make an object pluggable', function () {

    var obj = {};

    utils.hookable(obj);

    obj.hook('greet', function () {
      return 'Hello';
    });

    obj.use('greet', function (next) {
      return next().toUpperCase();
    });

    obj.use('greet', function (next) {
      return next() + ', Bob!';
    });

    expect(obj.greet()).toEqual('HELLO, BOB!');

  });

});
