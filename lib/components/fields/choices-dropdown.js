'use strict';

var React = require('react/addons');
var _ = require('underscore');

/*
   Choices drop down component for picking pretty text tags.
 */
var ChoicesDropdown = React.createClass({
  handleClick: function (key) {
    this.props.handleSelection(key);
  },

  items: function () {
    var self = this;
    var items = [];
    var index = 0;
    var choices = this.props.choices;
    var len = Object.keys(choices).length;

    _.each(choices, function (value, key) {
      index++;
      var clickHandler = self.handleClick.bind(self, key);

      items.push(
        <li key={key} onClick={clickHandler}>
          <a tabIndex="-1"><span><strong>{value}</strong></span> | <span><em>{key}</em></span></a>
        </li>
      );

      if (index < len) {
        var dividerKey = '_' + index; // squelch React warning about needing a key
        items.push(<li key={dividerKey} role="presentation" className="divider" />);
      }
    });

    return items;
  },

  render: function() {
    var items = this.items();

    return (
      <div className="dropdown">
        <a href="#" className="dropdown-toggle" data-toggle="dropdown">Insert...</a>
        <ul className="dropdown-menu">
          {items}
        </ul>
      </div>
    );
  }
});

module.exports = ChoicesDropdown;
