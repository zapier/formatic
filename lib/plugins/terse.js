'use strict';

var _ = require('underscore');
var funql = require('funql');

var compileTerse = funql.compiler({
  call: function (node, compile) {
    var type = compile(node.nodes[0]);
    var args = compile(node.nodes[1]);
    var field = {
      type: type
    };
    var props;
    if (args.length > 0) {
      if (_.isObject(args[0]) && !_.isArray(args[0]) && !args[0].type) {
        props = args[0];
        args.shift();
      } else {
        props = {};
      }
    }
    field.fields = args;
    if (props) {
      _.extend(field, props);
    }
    return field;
  },
  name: function (node) {
    return node.value;
  },
  arguments: function (node, compile) {
    return compile(node.nodes);
  },
  empty: function () {
    return null;
  },
  value: function (node, compile, context) {
    if (context.returnValue) {
      return node.value;
    }
    return {
      type: typeof node.value,
      value: node.value
    };
  },
  array: function (node, compile) {
    return compile(node.nodes);
  },
  object: function (node, compile) {
    var props = compile(node.nodes);
    var obj = {};
    _.each(props, function (prop) {
      obj[prop.key] = prop.value;
    });
    return obj;
  },
  property: function (node, compile) {
    var key = compile(node.nodes[0], {returnValue: true});
    var value = compile(node.nodes[1], {returnValue: true});
    return {
      key: key,
      value: value
    };
  }
});

module.exports = function (formatic) {

  formatic.form.wrap('compileField', function (next, field) {

    if (typeof field === 'string') {
      try {
        return next(compileTerse(field));
      } catch (e) {
        var parts = field.split(':');
        return next({
          type: parts[0],
          key: parts[1],
          value: parts[2]
        });
      }
    }

    return next();
  });
};
