// # select component

/*
Render select element to give a user choices for the value of a field. Renders non-native
select drop down and supports fancier renderings.
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

  displayName: 'PrettySelect',

  mixins: [_field2.default],

  getInitialState: function getInitialState() {
    return {
      choices: this.props.config.fieldPrettyChoices(this.props.field)
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(newProps) {
    this.setState({
      choices: newProps.config.fieldPrettyChoices(newProps.field)
    });
  },

  render: function render() {
    return this.renderWithConfig();
  },

  onChange: function onChange(value, info) {
    if (info && info.isCustomValue) {
      this.props.onChange(value, {
        field: this.props.field,
        isCustomValue: true
      });
    } else {
      this.onChangeValue(value);
    }
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;
    var field = this.props.field;

    return config.createElement('field', {
      config: config, field: field, plain: this.props.plain, classes: this.props.classes
    }, config.createElement('pretty-select-value', {
      choices: this.state.choices, isAccordion: field.isAccordion, isAccordionAlwaysCollapsable: field.isAccordionAlwaysCollapsable, field: field, onChange: this.onChange, onAction: this.onBubbleAction
    }));
  }
});