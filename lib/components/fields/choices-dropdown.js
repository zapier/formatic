'use strict';

var React = require('react/addons');
var _ = require('underscore');

/*
   Choices drop down component for picking tags.
 */
var ChoicesDropdown = React.createClass({
  handleClick: function (key) {
    this.props.handleSelection(key);
  },

  render: function() {
    var self = this;

    var items = _.map(this.props.choices, function (value, key) {
      var clickHandler = self.handleClick.bind(self, key);
      return (
        <li key={key} onClick={clickHandler}>
          <a tabIndex="-1"><span><strong>{value}</strong></span> | <span><em>{key}</em></span></a>
        </li>
      );
    });

    return (
      <div className="dropdown">
        <button className="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown">
          <span>Insert...</span>
          <span className="caret"></span>
        </button>
        <ul className="dropdown-menu">
          {items}
        </ul>
      </div>
    );
  }
});

module.exports = ChoicesDropdown;
