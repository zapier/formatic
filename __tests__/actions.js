/*global describe, it, expect*/
'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import Formatic from '@/src/formatic';

describe('actions', function() {
  const mounted = function(element) {
    const rendered = TestUtils.renderIntoDocument(element);
    return rendered;
  };

  const formaticConfig = Formatic.createConfig(
    Formatic.plugins.elementClasses,
    function(config) {
      config.addElementClass('string', 'string');
    }
  );

  const Form = React.createFactory(Formatic);

  it('should send action on focus and blur', function() {
    let wasFocused = false;
    let wasBlurred = false;

    const component = mounted(
      Form({
        fields: [
          {
            type: 'text',
            key: 'firstName',
          },
        ],
        onFocus: function() {
          wasFocused = true;
        },
        onBlur: function() {
          wasBlurred = true;
        },
        config: formaticConfig,
      })
    );

    const node = ReactDOM.findDOMNode(component).getElementsByClassName(
      'string'
    )[0];

    TestUtils.Simulate.focus(node);

    expect(wasFocused).toEqual(true);

    TestUtils.Simulate.blur(node);

    expect(wasBlurred).toEqual(true);
  });
});
