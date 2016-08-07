/*global describe, it, expect*/
'use strict';

describe('actions', function() {

  var React = require('react');
  var ReactDOM = require('react-dom');
  var TestUtils = require('react-addons-test-utils');

  var mounted = function (element) {
    var rendered = TestUtils.renderIntoDocument(element);
    return rendered;
  };

  var Formatic = require('../lib/formatic');

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
