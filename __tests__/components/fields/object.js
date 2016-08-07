/*global describe, it, beforeEach, expect*/
'use strict';

const React = require('react');
const TestUtils = require('react-addons-test-utils');
const ReactDOM = require('react-dom');

const Formatic = require('../../../lib/formatic');

const renderedKeys = doc => {
  const inputs = TestUtils.scryRenderedDOMComponentsWithTag(doc, 'input');
  return inputs.map(i => i.value);
};

const renderedKeyClasses = doc => {
  const inputs = TestUtils.scryRenderedDOMComponentsWithTag(doc, 'input');
  return inputs.map(i => i.getAttribute('class'));
};

const renderedValues = doc => {
  const textBoxes = TestUtils.scryRenderedDOMComponentsWithTag(doc, 'textarea');
  return textBoxes.map(b => b.textContent);
};

describe('object field', () => {
  let doc;

  const initialValue = {
    object: {
      key1: 'value1',
      key2: 'value2'
    }
  };

  const fields = [
    {key: 'object', type: 'object'}
  ];

  let newValue;
  let node;

  const render = value => {
    const onChange = val => {
      newValue = val;
      doc = render(newValue);
    };
    const form = <Formatic config={Formatic.createConfig()}
                           fields={fields}
                           value={value}
                           onChange={onChange}/>;
    return TestUtils.renderIntoDocument(form);
  };

  const renderToNode = value => {
    const onChange = () => {};

    if (!node) {
      node = document.createElement('div');
    }
    const form = <Formatic config={Formatic.createConfig()}
                           fields={fields}
                           value={value}
                           onChange={onChange}/>;
    return ReactDOM.render(form, node);
  };

  beforeEach(() => {
    newValue = undefined;
    node = undefined;
  });

  it('should create an assoc-list field component from the object value', () => {
    doc = render(initialValue);

    expect(renderedKeys(doc)).toEqual(['key1', 'key2']);
    expect(renderedKeyClasses(doc)).toEqual(['', '']);
    expect(renderedValues(doc)).toEqual(['value1', 'value2']);
  });

  it('should trigger onChange when no duplicate keys', () => {
    doc = render(initialValue);
    const input = TestUtils.scryRenderedDOMComponentsWithTag(doc, 'input')[1];
    input.value = 'key3';

    TestUtils.Simulate.change(input);

    expect(newValue).toEqual({
      object: {
        key1: 'value1',
        key3: 'value2'
      }
    });

    expect(renderedKeyClasses(doc)).toEqual(['', '']);
    expect(renderedKeys(doc)).toEqual(['key1', 'key3']);
    expect(renderedValues(doc)).toEqual(['value1', 'value2']);
  });

  it('should flag duplicate keys, and not trigger onChange', () => {
    doc = render(initialValue);
    const input = TestUtils.scryRenderedDOMComponentsWithTag(doc, 'input')[1];
    input.value = 'key1';

    TestUtils.Simulate.change(input);

    expect(newValue).toBeUndefined(); // should not have fired on change
    expect(renderedKeyClasses(doc)).toEqual(['validation-error-duplicate-key', 'validation-error-duplicate-key']);
    expect(renderedKeys(doc)).toEqual(['key1', 'key1']);
    expect(renderedValues(doc)).toEqual(['value1', 'value2']);
  });

  it('should render changes from outside', () => {
    let value = {
      object: {
        key1: 'value1',
        key2: 'value2'
      }
    };

    renderToNode(value);
    const formatic = renderToNode(value);

    const ObjectClass = require('../../../lib/components/fields/object');

    const object = TestUtils.findRenderedComponentWithType(formatic, ObjectClass);

    expect(object.state).toEqual({
      assocList: [
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' }
      ]
    });

    value = {
      object: {
        keyNew: 'value1',
        key2: 'value2'
      }
    };

    renderToNode(value);

    expect(object.state).toEqual({
      assocList: [
        { key: 'key2', value: 'value2' },
        { key: 'keyNew', value: 'value1' }
      ]
    });
  });

  it('should ignore changes from outside when there are duplicate keys', () => {
    let value = {
      object: {
        key1: 'value1',
        key2: 'value2'
      }
    };

    renderToNode(value);
    const formatic = renderToNode(value);

    const ObjectClass = require('../../../lib/components/fields/object');

    const object = TestUtils.findRenderedComponentWithType(formatic, ObjectClass);

    expect(object.state).toEqual({
      assocList: [
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' }
      ]
    });

    renderToNode(value);

    const input = TestUtils.scryRenderedDOMComponentsWithTag(formatic, 'input')[1];
    input.value = 'key1';
    TestUtils.Simulate.change(input);

    // dups
    expect(object.state).toEqual({
      assocList: [
        { key: 'key1', value: 'value1' },
        { key: 'key1', value: 'value2' }
      ]
    });

    value = {
      object: {
        key99: 'value99'
      }
    };

    renderToNode(value);

    // no change:
    expect(object.state).toEqual({
      assocList: [
        { key: 'key1', value: 'value1' },
        { key: 'key1', value: 'value2' }
      ]
    });
  });
});
