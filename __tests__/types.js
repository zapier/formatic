/*global describe, it, expect*/
'use strict';

describe('types', function() {

  var React = require('react/addons');
  var TestUtils = React.addons.TestUtils;

  var mounted = function (component) {
    var rendered = TestUtils.renderIntoDocument(component);
    return rendered;
  };

  var testWithFormatic = function (formatic) {

    var unmapType = function (type) {

      var typeMap = formatic.options.typeMap || {};
      var types = Object.keys(typeMap).filter(function (key) {
        return typeMap[key] === type;
      }).map(function (key) {
        return key;
      });

      if (types.length === 0) {
        types.push(type);
      }

      return types;
    };

    var testValueType = function (field, tagName) {

      var types = unmapType(field.type);

      types.forEach(function (type) {

        field.type = type;

        it('should change data for ' + field.type, function () {
          var form = formatic();
          form.fields([
            field
          ]);

          var component = mounted(form.component());

          form.on('update', function (props) {
            component.setProps(props);
          });
          form.set('name', 'Joe');

          var node = component.getDOMNode().getElementsByTagName(tagName)[0];

          expect(node.value).toEqual('Joe');
          node.value = 'Mary';

          TestUtils.Simulate.change(node);
          expect(form.val()).toEqual({name: 'Mary'});
        });
      });
    };

    testValueType({
      type: 'text',
      key: 'name'
    }, 'input');

    testValueType({
      type: 'textarea',
      key: 'name'
    }, 'textarea');

    testValueType({
      type: 'select',
      key: 'name',
      choices: ['Joe', 'Mary']
    }, 'select');

    testValueType({
      type: 'password',
      key: 'name'
    }, 'input');
  };

  testWithFormatic(require('../')('react'));
  testWithFormatic(require('../')('zapier'));

});
