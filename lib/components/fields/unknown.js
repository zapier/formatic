'use strict';

var React = require('react/addons');
var R = React.DOM;

module.exports = React.createClass({

  displayName: 'Unknown',

  mixins: [require('../../mixins/field')],

  render: function () {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    return R.div({},
      R.div({}, 'Component not found for: '),
      R.pre({}, JSON.stringify(this.props.field.rawFieldTemplate, null, 2))
    );
  }

});
