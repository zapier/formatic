// # select component

/*
Render select element to give a user choices for the value of a field. Note
it should support values other than strings. Currently this is only tested for
boolean values, but it _should_ work for other values.
*/

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _field = require('../../mixins/field');

var _field2 = _interopRequireDefault(_field);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _createReactClass2.default)({

  displayName: 'Select',

  mixins: [_field2.default],

  getInitialState: function getInitialState() {
    return {
      choices: this.props.config.fieldChoices(this.props.field)
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(newProps) {
    this.setState({
      choices: newProps.config.fieldChoices(newProps.field)
    });
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;
    var field = this.props.field;

    return config.createElement('field', {
      config: config, field: field, plain: this.props.plain
    }, config.createElement('select-value', {
      choices: this.state.choices, field: field, onChange: this.onChangeValue, onAction: this.onBubbleAction
    }));
  }
});