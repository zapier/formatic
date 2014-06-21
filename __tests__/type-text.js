/*global describe, it, expect*/
'use strict';

describe('type:text', function() {

  var formatic = require('../');
  var React = require('react/addons');
  var TestUtils = React.addons.TestUtils;

  it('shoud change data', function () {

    var form = formatic();
    form.fields([
      {
        type: 'text',
        key: 'name'
      }
    ]);

    var component = form.component();

    TestUtils.renderIntoDocument(component);

    form.on('update', function (props) {
      component.setProps(props);
    });
    form.set('name', 'Joe');

    var input = TestUtils.findRenderedDOMComponentWithTag(component, 'input');
    expect(input.getDOMNode().value).toEqual('Joe');

    input.getDOMNode().value = 'Mary';
    TestUtils.Simulate.change(input);

    expect(form.val()).toEqual({name: 'Mary'});
  });
});
