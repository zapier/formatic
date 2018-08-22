// # choice component

/*
A single choice in a list of choices.
*/

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _helper = require('../../mixins/helper');

var _helper2 = _interopRequireDefault(_helper);

var _utils = require('../../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _createReactClass2.default)({

  displayName: 'Choice',

  mixins: [_helper2.default],

  render: function render() {
    return this.renderWithConfig();
  },
  onSelect: function onSelect() {
    this.props.onSelect(this.props.choice);
  },
  sampleString: function sampleString(sample) {
    if (typeof sample === 'boolean') {
      return String(sample);
    }
    return sample;
  },


  renderDefault: function renderDefault() {
    var choice = this.props.choice;


    return _react2.default.createElement(
      'a',
      { style: { cursor: 'pointer' }, onClick: this.onSelect },
      _react2.default.createElement(
        'span',
        { ref: (0, _utils.ref)(this, 'label'), className: 'choice-label' },
        choice.label
      ),
      _react2.default.createElement(
        'span',
        { className: 'choice-sample' },
        this.sampleString(choice.sample)
      )
    );
  }
});