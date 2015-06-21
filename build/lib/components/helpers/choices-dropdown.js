'use strict';

var React = require('react/addons');
var _ = require('../../undash');

/*
   Choices drop down component for picking pretty text tags.

   Properties:
   - handleSelection: choice selection callback, passed the selected tag key

   TODO: Implemented via Bootstrap dropdown for now but we
   want to remove that dependency.
 */
module.exports = React.createClass({

  displayName: 'ChoicesDropdown',

  mixins: [require('../../mixins/helper')],

  propTypes: {
    handleSelection: React.PropTypes.func.isRequired
  },

  handleClick: function handleClick(key) {
    this.props.handleSelection(key);
  },

  items: function items() {
    var self = this;
    var items = [];
    var index = 0;
    var choices = this.props.choices;
    var len = Object.keys(choices).length;

    _.each(choices, function (value, key) {
      index++;
      var clickHandler = self.handleClick.bind(self, key);

      items.push(React.createElement(
        'li',
        { key: key, onClick: clickHandler },
        React.createElement(
          'a',
          { tabIndex: '-1' },
          React.createElement(
            'span',
            null,
            React.createElement(
              'strong',
              null,
              value
            )
          ),
          ' | ',
          React.createElement(
            'span',
            null,
            React.createElement(
              'em',
              null,
              key
            )
          )
        )
      ));

      if (index < len) {
        var dividerKey = '_' + index; // squelch React warning about needing a key
        items.push(React.createElement('li', { key: dividerKey, role: 'presentation', className: 'divider' }));
      }
    });

    return items;
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var items = this.items();

    return React.createElement(
      'div',
      { className: 'dropdown' },
      React.createElement(
        'a',
        { ref: 'dropdownToggle', href: '#', className: 'dropdown-toggle', 'data-toggle': 'dropdown' },
        'Insert...'
      ),
      React.createElement(
        'ul',
        { className: 'dropdown-menu' },
        items
      )
    );
  }
});