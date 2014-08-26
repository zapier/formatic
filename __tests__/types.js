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
        // If this type maps to itself, make sure that type doesn't map to
        // something else.
        if (!(type in typeMap)) {
          types.push(type);
        }
      }

      return types;
    };

    var testType = function (field, fn) {

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

          fn(form, component);
        });
      });
    };

    var testValueType = function (field, selector, setter) {

      testType(field, function (form, component) {
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
    };

    var testValuesType = function (field, selector, setter) {

      testType(field, function (form, component) {

        form.set('colors', ['red', 'green']);

        var value = selector(component.getDOMNode());

        expect(value).toEqual(['red', 'green']);

        setter(component.getDOMNode(), ['red']);

        expect(form.val()).toEqual({colors: ['red']});
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
      type: 'dropdown',
      key: 'name',
      choices: ['Joe', 'Mary']
    }, function (node) {
      return node.getElementsByClassName('field-value')[0].innerHTML;
    }, function (node, value) {
      var arrowNode = node.getElementsByClassName('field-toggle')[0];
      TestUtils.Simulate.click(arrowNode);
      var choiceNodes = node.getElementsByClassName('field-choice');
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

    testValuesType({
      type: 'checkbox',
      key: 'colors',
      choices: ['red', 'blue', 'green']
    }, function (node) {
      var choiceNodes = node.getElementsByTagName('input');
      choiceNodes = Array.prototype.slice.call(choiceNodes, 0);
      return choiceNodes.filter(function (choiceNode) {
        return choiceNode.checked;
      }).map(function (choiceNode) {
        return choiceNode.value;
      });
    }, function (node, value) {
      var choiceNodes = node.getElementsByTagName('input');
      choiceNodes = Array.prototype.slice.call(choiceNodes, 0);
      choiceNodes.forEach(function (choiceNode) {

        if (value.indexOf(choiceNode.value) >= 0) {
          if (!choiceNode.checked) {
            choiceNode.checked = true;
            TestUtils.Simulate.change(choiceNode);
          }
        } else {
          if (choiceNode.checked) {
            choiceNode.checked = false;
            TestUtils.Simulate.change(choiceNode);
          }
        }
      });
    });

    testType({
      type: 'checkbox',
      key: 'optIn'
    }, function (form, component) {
      form.set('optIn', true);

      var node = component.getDOMNode().getElementsByTagName('input')[0];

      expect(node.checked).toEqual(true);

      node.checked = false;
      TestUtils.Simulate.change(node);

      expect(form.val()).toEqual({optIn: false});
    });
  };

  testWithFormatic(require('../').create('react'));
  testWithFormatic(require('../').create('zapier'));

});
