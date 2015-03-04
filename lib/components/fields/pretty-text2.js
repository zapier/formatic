'use strict';

var React = require('react/addons');
var TaggedTextEditor = require('./tagged-text-editor');
var ChoicesDropdown = require('./choices-dropdown');

// TODO: temp hack, switch to use replaceChoices structure
// Convert replacmentChoices array to key / label map.
function tagToLabelMap(replaceChoices) {
  var map = {};
  replaceChoices.map(function (choice) {
    map[choice.value] = choice.label;
  });
  return map;
}

module.exports = React.createClass({
  displayName: 'TaggedText',

  mixins: [require('../../mixins/field'), require('../../mixins/undo-stack'), require('../../mixins/resize')],

  getInitialState: function() {
    return { value: this.props.field.initialValue };
  },

  handleSelection: function (key) {
    // TODO: appending to end for now but need to insert at last cursor position
    var tag = '{{' + key + '}}';
    var newValue = this.state.value + tag;

    this.setState({ value: newValue });
  },

  updateValue: function (newValue) {
    this.setState({ value: newValue });
  },

  render: function() {
    return this.renderWithConfig();
  },

  renderDefault: function () {
    var config = this.props.config;
    var field = this.props.field;
    var choices = tagToLabelMap(field.replaceChoices);

    var props = { field: field, plain: this.props.plain };

    var element = (
      <div>
        <TaggedTextEditor value={this.state.value} choices={choices} newValue={this.updateValue} />
        <ChoicesDropdown choices={choices} handleSelection={this.handleSelection} />
      </div>
    );

    return config.createElement('field', props, element);
  }
});
