/*global describe, it, expect*/
'use strict';

describe('actions', function() {

  var React = require('react/addons');
  var TestUtils = React.addons.TestUtils;
  var _ = require('underscore');

  var mounted = function (element) {
    var rendered = TestUtils.renderIntoDocument(element);
    return rendered;
  };

  var Formatic = require('../');

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

    var node = component.getDOMNode().getElementsByClassName('string')[0];

    TestUtils.Simulate.focus(node);

    expect(wasFocused).toEqual(true);

    TestUtils.Simulate.blur(node);

    expect(wasBlurred).toEqual(true);
  });
});
