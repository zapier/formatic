/*global describe, it, expect*/
'use strict';

const React = require('react');
const TestUtils = require('react-addons-test-utils');

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

describe('assoc-list field', () => {
  let doc;

  const render = value => {
    const fields = [
      {key: 'assocList', type: 'assoc-list'}
    ];
    const onChange = newValue => {
      doc = render(newValue);
    };
    const form = <Formatic config={Formatic.createConfig()}
                           fields={fields}
                           value={value}
                           onChange={onChange}/>;
    return TestUtils.renderIntoDocument(form);
  };

  it('should mark last duplicate key entered as invalid', () => {
    const initialValue = {
      assocList: [
        {key: 'key1', value: 'value1'},
        {key: 'key2', value: 'value2'}
      ]
    };

    doc = render(initialValue);

    expect(renderedKeys(doc)).toEqual(['key1', 'key2']);
    expect(renderedKeyClasses(doc)).toEqual(['', '']);
    expect(renderedValues(doc)).toEqual(['value1', 'value2']);

    let input = TestUtils.scryRenderedDOMComponentsWithTag(doc, 'input')[1];
    input.value = 'key1';
    TestUtils.Simulate.change(input);

    expect(renderedKeys(doc)).toEqual(['key1', 'key1']);
    expect(renderedValues(doc)).toEqual(['value1', 'value2']);
  });
});
