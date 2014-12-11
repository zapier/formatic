'use strict';

var React = require('react/addons');

var utils = require('./utils');

var createString = function () {
  return '';
};

var createObject = function () {
  return {};
};

module.exports = {

  // Field element factories
  createElement_Fields: React.createFactory(require('./components/fields-field')),
  createElement_Text: React.createFactory(require('./components/text-field')),
  createElement_Unicode: React.createFactory(require('./components/unicode-field')),
  createElement_Unknown: React.createFactory(require('./components/unknown-field')),
  createElement_Copy: React.createFactory(require('./components/copy-field')),

  // Other element factories
  createElement_Field: React.createFactory(require('./components/field')),
  createElement_Label: React.createFactory(require('./components/label')),
  createElement_Help: React.createFactory(require('./components/help')),

  // Field default values
  getDefaultValue_Fields: createObject,
  getDefaultValue_Text: createString,
  getDefaultValue_Unicode: createString,

  hasElementFactory: function (name) {
    var config = this;

    return config['createElement_' + name] ? true : false;
  },

  createElement: function (name, props, children) {
    var config = this;

    if (!props.config) {
      throw new Error('Must pass config in props for: ' + name);
    }

    name = config.getElementName(name);

    if (config['createElement_' + name]) {
      return config['createElement_' + name](props, children);
    }

    if (name !== 'Unknown') {
      return config.createElement('Unknown', props, children);
    }

    throw new Error('Factory not found for: ' + name);
  },

  createField: function (props) {
    var config = this;

    var name = config.getFieldTypeName(props.field);

    if (config.hasElementFactory(name)) {
      return config.createElement(name, props);
    }

    return config.createElement('UnknownField', props);
  },

  getElementName: function (name) {
    return utils.dashToPascal(name);
  },

  aliases: {
  },

  // Field helpers
  getFieldTypeName: function (field) {
    var config = this;

    var fieldType = field.type;

    if (config.aliases[fieldType]) {
      fieldType = config.aliases[fieldType];
    }

    return utils.dashToPascal(fieldType);
  },
  getFieldDefaultValue: function (field) {
    var config = this;

    var typeName = config.getFieldTypeName(field);

    if (config['getDefaultValue_' + typeName]) {
      return config['getDefaultValue_' + typeName](field);
    }

    return '';
  },
  getFieldChoices: function (field) {

  },
  getFieldLabel: function (field) {
    return field.label;
  },
  getFieldHelpText: function (field) {
    return field.help_text_html || field.help_text || field.helpText || field.helpTextHtml;
  }
};
