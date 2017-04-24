// # choices-search component

/*
   Render a search box for choices.
 */

'use strict';

var React = require('react');

var createReactClass = require('create-react-class');

module.exports = createReactClass({

  displayName: 'ChoicesSearch',

  mixins: [require('../../mixins/helper')],

  focus() {
    this.refs.input.focus();
  },

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    return (
      <div className="choices-search">
        <input ref="input" type="text" placeholder="Search..." onChange={this.props.onChange}/>
      </div>
    );
  }

});
