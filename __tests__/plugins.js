/*global describe, it, expect*/
'use strict';

describe('plugins', function() {

  var Formatic = require('../');

  var pigLatin = function (word) {
    return word.substring(1) + word[0] + 'ay';
  };

  var greet = function (name) {
    return 'hello' + ' ' + name;
  };

  var upper = function (next) {
    return next().toUpperCase();
  };

  var upperPig = function (next, name) {
    return next(pigLatin(name)).toUpperCase();
  };

  it('can add method to formatic', function () {

    var plugin = function (formatic) {
      formatic.method('greet', greet);
    };

    var formatic = Formatic(plugin);

    expect(formatic.greet('joe')).toEqual('hello joe');

  });

  it('can wrap method on formatic, auto args', function () {

    var plugin = function (formatic) {
      formatic.method('greet', greet);
    };

    var upperPlugin = function (formatic) {
      formatic.wrap('greet', upper);
    };

    var formatic = Formatic(plugin, upperPlugin);

    expect(formatic.greet('joe')).toEqual('HELLO JOE');

  });

  it('can wrap method on formatic, change args', function () {

    var plugin = function (formatic) {
      formatic.method('greet', greet);
    };

    var upperPlugin = function (formatic) {
      formatic.wrap('greet', upperPig);
    };

    var formatic = Formatic(plugin, upperPlugin);

    expect(formatic.greet('joe')).toEqual('HELLO OEJAY');

  });

  it('can add method to form', function () {

    var plugin = function (formatic) {
      formatic.form.method('greet', greet);
    };

    var formatic = Formatic(plugin);

    var form = formatic();

    expect(form.greet('joe')).toEqual('hello joe');

  });

  it('can wrap method on form, auto args', function () {

    var plugin = function (formatic) {
      formatic.form.method('greet', greet);
    };

    var upperPlugin = function (formatic) {
      formatic.form.wrap('greet', upper);
    };

    var formatic = Formatic(plugin, upperPlugin);

    var form = formatic();

    expect(form.greet('joe')).toEqual('HELLO JOE');

  });

  it('can wrap method on form, change args', function () {

    var plugin = function (formatic) {
      formatic.form.method('greet', greet);
    };

    var upperPlugin = function (formatic) {
      formatic.form.wrap('greet', upperPig);
    };

    var formatic = Formatic(plugin, upperPlugin);

    var form = formatic();

    expect(form.greet('joe')).toEqual('HELLO OEJAY');

  });

  it('warns against replacing method', function () {

    var plugin = function (formatic) {
      formatic.form.method('greet', greet);
    };

    expect(function () {
      Formatic(plugin, plugin);
    }).toThrow();

  });

  it('allows replacing method', function () {

    var plugin = function (formatic) {
      formatic.form.method('greet', greet);
    };

    var spanishPlugin = function (formatic) {
      formatic.form.replaceMethod('greet', function (name) {
        return 'hola ' + name;
      });
    };

    var formatic = Formatic(plugin, spanishPlugin);

    var form = formatic();

    expect(form.greet('joe')).toEqual('hola joe');
  });

  it('allows init and this', function () {

    var plugin = function (formatic) {

      formatic.form.wrap('init', function (next) {
        this.words = [];
        this.badWords = [
          'shit'
        ];
      });

      formatic.form.method('addWord', function (word) {
        this.words.push(word);
      });

      formatic.form.wrap('addWord', function (next, word) {
        if (this.badWords.indexOf(word) >= 0) {
          return;
        }
        next(word);
      });
    };

    var formatic = Formatic(plugin);

    var form = formatic();

    form.addWord('foo');
    form.addWord('shit');
    form.addWord('bar');

    expect(form.words).toEqual(['foo', 'bar']);
  });

  it('should take parameters for a plugin', function () {

    var plugin = function (formatic, plugin) {

      formatic.method('ask', function () {
        return plugin.config.answer;
      });
    };

    var formatic = Formatic();

    formatic.plugin(plugin, {
      answer: 42
    });

    expect(formatic.ask()).toEqual(42);
  });

  it('should listen for plugin', function () {

    var formatic = Formatic();

    var foundPlugin = false;

    formatic.onPlugin(function (plugin) {
      if (plugin.tag === 'gotcha') {
        foundPlugin = true;
      }
    });

    formatic.plugin(function (formatic, plugin) {
      plugin.tag = 'gotcha';
    });

    expect(foundPlugin).toEqual(true);
  });

});
