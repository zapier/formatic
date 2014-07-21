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

    var testValueType = function (field, selector, setter) {

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

          var value;
          var node;

          if (typeof selector === 'function') {
            value = selector(component.getDOMNode());
          } else {
            if (selector[0] === '.') {
              node = component.getDOMNode().getElementsByClassName(selector)[0];
            } else {
              node = component.getDOMNode().getElementsByTagName(selector)[0];
            }
            value = node.value;
          }

          expect(value).toEqual('Joe');

          if (typeof setter === 'function') {
            setter(component.getDOMNode(), 'Mary');
          } else {
            node.value = 'Mary';
            TestUtils.Simulate.change(node);
          }

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
    }, function (node) {
      return node.getElementsByClassName('zf-select-active')[0].innerHTML;
    }, function (node, value) {
      var arrowNode = node.getElementsByClassName('zf-select-arrow')[0];
      TestUtils.Simulate.click(arrowNode);
      var choiceNodes = node.getElementsByClassName('zf-select-choice');
      choiceNodes = Array.prototype.slice.call(choiceNodes, 0);
      var matchingNodes = choiceNodes.filter(function (node) {
        return node.innerHTML === value;
      });
      TestUtils.Simulate.click(matchingNodes[0]);
    });

    testValueType({
      type: 'password',
      key: 'name'
    }, 'input');
  };

  testWithFormatic(require('../')('react'));
  testWithFormatic(require('../')('zapier'));

});
