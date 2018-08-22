'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _undash = require('../../undash');

var _undash2 = _interopRequireDefault(_undash);

var _helper = require('../../mixins/helper');

var _helper2 = _interopRequireDefault(_helper);

var _utils = require('../../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
   Choices drop down component for picking pretty text tags.

   Properties:
   - handleSelection: choice selection callback, passed the selected tag key

   TODO: Implemented via Bootstrap dropdown for now but we
   want to remove that dependency.
 */
exports.default = (0, _createReactClass2.default)({

  displayName: 'ChoicesDropdown',

  mixins: [_helper2.default],

  propTypes: {
    handleSelection: _propTypes2.default.func.isRequired
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

    _undash2.default.each(choices, function (value, key) {
      index++;
      var clickHandler = self.handleClick.bind(self, key);

      items.push(_react2.default.createElement(
        'li',
        { key: key, onClick: clickHandler },
        _react2.default.createElement(
          'a',
          { tabIndex: '-1' },
          _react2.default.createElement(
            'span',
            null,
            _react2.default.createElement(
              'strong',
              null,
              value
            )
          ),
          ' | ',
          _react2.default.createElement(
            'span',
            null,
            _react2.default.createElement(
              'em',
              null,
              key
            )
          )
        )
      ));

      if (index < len) {
        var dividerKey = '_' + index; // squelch React warning about needing a key
        items.push(_react2.default.createElement('li', { key: dividerKey, role: 'presentation', className: 'divider' }));
      }
    });

    return items;
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var items = this.items();

    return _react2.default.createElement(
      'div',
      { className: 'dropdown' },
      _react2.default.createElement(
        'a',
        { ref: (0, _utils.ref)(this, 'dropdownToggle'), href: '#', className: 'dropdown-toggle', 'data-toggle': 'dropdown' },
        'Insert...'
      ),
      _react2.default.createElement(
        'ul',
        { className: 'dropdown-menu' },
        items
      )
    );
  }
});