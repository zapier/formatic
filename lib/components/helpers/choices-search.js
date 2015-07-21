// # choices-search component

/*
   Render a search box for choices.
 */

'use strict';

var React = require('react/addons');

module.exports = React.createClass({

  displayName: 'ChoicesSearch',

  mixins: [require('../../mixins/helper')],

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    return <div className="choices-search">
      <input type="text" placeholder="Search..." onChange={this.props.onChange}/>
    </div>;
  }

});
