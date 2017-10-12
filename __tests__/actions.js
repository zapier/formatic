/*global describe, it, expect*/
'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import Formatic from '../lib/formatic';

describe('actions', function() {

  var mounted = function (element) {
    var rendered = TestUtils.renderIntoDocument(element);
    return rendered;
  };

  var formaticConfig = Formatic.createConfig(
    Formatic.plugins.elementClasses,
    function (config) {
      config.addElementClass('string', 'string');
    }
  );

  var Form = React.createFactory(Formatic);

  it('should send action on focus and blur', function () {

    var wasFocused = false;
    var wasBlurred = false;

    var component = mounted(Form({
      fields: [
        {
          type: 'text',
          key: 'firstName'
        }
      ],
      onFocus: function () {
        wasFocused = true;
      },
      onBlur: function () {
        wasBlurred = true;
      },
      config: formaticConfig
    }));

    var node = ReactDOM.findDOMNode(component).getElementsByClassName('string')[0];

    TestUtils.Simulate.focus(node);

    expect(wasFocused).toEqual(true);

    TestUtils.Simulate.blur(node);

    expect(wasBlurred).toEqual(true);
  });
});
