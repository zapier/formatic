/*global describe, it, expect*/
'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import _ from 'lodash';
import Formatic from '@/src/formatic';

const printTree = function(node, indent) {
  indent = indent || '';
  if (node && node.childNodes) {
    for (let i = 0; i < node.childNodes.length; i++) {
      const childNode = node.childNodes[i];
      console.info(indent + node.tagName);
      printTree(childNode, indent + '  ');
    }
  }
};

describe('types and value changes', function() {
  const mounted = function(element) {
    const rendered = TestUtils.renderIntoDocument(element);
    return rendered;
  };

  const formaticConfig = Formatic.createConfig(
    Formatic.plugins.elementClasses,
    function(config) {
      config.addElementClass('single-line-string', 'single-line-string');
      config.addElementClass('string', 'string');
      config.addElementClass('copy', 'copy');
      config.addElementClass('assoc-list-item-key', 'assoc-list-item-key');
    }
  );

  const Form = React.createFactory(Formatic);

  const testValueType = function(options) {
    let types = options.type;

    if (!_.isArray(types)) {
      types = [types];
    }

    types.forEach(function(type) {
      it('should change value of ' + type + ' field', function() {
        let formValue;

        const component = mounted(
          Form({
            fields: [
              {
                type,
                key: 'myValue',
              },
            ],
            defaultValue: {
              myValue: options.from,
            },
            onChange: function(newValue) {
              formValue = newValue;
            },
          })
        );

        const node = ReactDOM.findDOMNode(component).getElementsByTagName(
          options.tagName
        )[0];

        let nodeValue = node.value;

        if (options.getNodeValue) {
          nodeValue = options.getNodeValue(node);
        }
        // Something changed in a React 0.13.x, and now textarea has extra newline in front of it.
        if (typeof nodeValue === 'string') {
          nodeValue = nodeValue.replace(/^\n/, '');
        }
        expect(nodeValue).toEqual(options.from);

        if (options.setNodeValue) {
          options.setNodeValue(node, options.to);
        } else {
          node.value = options.to;
        }

        TestUtils.Simulate.change(node);

        expect(formValue.myValue).toEqual(options.to);
      });
    });
  };

  testValueType({
    type: ['string', 'text'],
    from: 'hello\ngood-bye',
    to: 'hello\ngood-day',
    tagName: 'textarea',
  });

  testValueType({
    type: ['single-line-string', 'str', 'unicode'],
    from: 'Joe',
    to: 'Mary',
    tagName: 'input',
  });

  testValueType({
    type: 'json',
    from: { foo: 'bar' },
    getNodeValue: function(node) {
      return JSON.parse(node.value);
    },
    to: { foo: 'baz' },
    setNodeValue: function(node, value) {
      node.value = JSON.stringify(value);
    },
    tagName: 'textarea',
  });

  testValueType({
    type: 'boolean',
    from: false,
    getNodeValue: function(node) {
      const optionNode = node.childNodes[node.selectedIndex];
      return formaticConfig.coerceValueToBoolean(optionNode.textContent);
    },
    to: true,
    setNodeValue: function(node, value) {
      const optionNodes = node.childNodes;
      for (let i = 0; i < optionNodes.length; i++) {
        const optionValue = formaticConfig.coerceValueToBoolean(
          optionNodes[i].textContent
        );
        if (optionValue === value) {
          node.selectedIndex = i;
        }
      }
    },
    tagName: 'select',
  });

  testValueType({
    type: ['checkbox-boolean', 'checkbox'],
    from: false,
    getNodeValue: function(node) {
      return node.checked;
    },
    to: true,
    setNodeValue: function(node, value) {
      node.checked = value;
    },
    tagName: 'input',
  });

  it('should set value for copy field', function() {
    const msg = 'Just something to read.';

    const component = mounted(
      Form({
        fields: [
          {
            type: 'copy',
            help_text: msg,
          },
        ],
        config: formaticConfig,
      })
    );

    const node = ReactDOM.findDOMNode(component).getElementsByClassName(
      'copy'
    )[0];

    expect(node.textContent).toEqual(msg);
  });

  ['array', 'list'].forEach(function(type) {
    it('should set value for an ' + type, function() {
      let formValue;

      const component = mounted(
        Form({
          fields: [
            {
              type,
              key: 'myArray',
              itemFields: [
                {
                  type: 'single-line-string',
                },
              ],
            },
          ],
          defaultValue: { myArray: ['red', 'green'] },
          config: formaticConfig,
          onChange: function(newValue) {
            formValue = newValue;
          },
        })
      );

      const node = ReactDOM.findDOMNode(component).getElementsByClassName(
        'single-line-string'
      )[0];

      expect(node.value).toEqual('red');

      node.value = 'blue';

      TestUtils.Simulate.change(node);

      expect(formValue.myArray).toEqual(['blue', 'green']);
    });
  });

  ['object', 'dict'].forEach(function(type) {
    it('should set value and key for an ' + type, function() {
      let formValue;

      const component = mounted(
        Form({
          fields: [
            {
              type,
              key: 'myObject',
              itemFields: [
                {
                  type: 'single-line-string',
                },
              ],
            },
          ],
          defaultValue: { myObject: { x: 'foo', y: 'bar' } },
          config: formaticConfig,
          onChange: function(newValue) {
            formValue = newValue;
          },
        })
      );

      let node = ReactDOM.findDOMNode(component).getElementsByClassName(
        'single-line-string'
      )[0];

      expect(node.value).toEqual('foo');

      node.value = 'baz';

      TestUtils.Simulate.change(node);

      expect(formValue.myObject).toEqual({ x: 'baz', y: 'bar' });

      node = ReactDOM.findDOMNode(component).getElementsByClassName(
        'assoc-list-item-key'
      )[0];

      node.value = 'z';

      TestUtils.Simulate.change(node);

      expect(formValue.myObject).toEqual({ z: 'baz', y: 'bar' });
    });
  });
});
