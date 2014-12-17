'use strict';

var React = require('react/addons');
var _ = require('underscore');

var utils = require('./utils');

var createString = function () {
  return '';
};

var createObject = function () {
  return {};
};

var createArray = function () {
  return [];
};

var createBoolean = function () {
  return false;
};

module.exports = {

  // Field element factories
  createElement_Fields: React.createFactory(require('./components/fields/fields')),
  createElement_Text: React.createFactory(require('./components/fields/text')),
  createElement_Unicode: React.createFactory(require('./components/fields/unicode')),
  createElement_Select: React.createFactory(require('./components/fields/select')),
  createElement_Boolean: React.createFactory(require('./components/fields/boolean')),
  createElement_PrettyText: React.createFactory(require('./components/fields/pretty-text')),
  createElement_List: React.createFactory(require('./components/fields/list')),
  createElement_CheckboxList: React.createFactory(require('./components/fields/checkbox-list')),
  createElement_Object: React.createFactory(require('./components/fields/object')),
  createElement_Json: React.createFactory(require('./components/fields/json')),
  createElement_UnknownField: React.createFactory(require('./components/fields/unknown')),
  createElement_Copy: React.createFactory(require('./components/fields/copy')),

  // Other element factories
  createElement_Field: React.createFactory(require('./components/helpers/field')),
  createElement_Label: React.createFactory(require('./components/helpers/label')),
  createElement_Help: React.createFactory(require('./components/helpers/help')),
  createElement_Choices: React.createFactory(require('./components/helpers/choices')),
  createElement_ListControl: React.createFactory(require('./components/helpers/list-control')),
  createElement_ListItemControl: React.createFactory(require('./components/helpers/list-item-control')),
  createElement_ListItemValue: React.createFactory(require('./components/helpers/list-item-value')),
  createElement_ListItem: React.createFactory(require('./components/helpers/list-item')),
  createElement_ItemChoices: React.createFactory(require('./components/helpers/item-choices')),
  createElement_AddItem: React.createFactory(require('./components/helpers/add-item')),
  createElement_RemoveItem: React.createFactory(require('./components/helpers/remove-item')),
  createElement_MoveItemForward: React.createFactory(require('./components/helpers/move-item-forward')),
  createElement_MoveItemBack: React.createFactory(require('./components/helpers/move-item-back')),
  createElement_ObjectControl: React.createFactory(require('./components/helpers/object-control')),
  createElement_ObjectItemControl: React.createFactory(require('./components/helpers/object-item-control')),
  createElement_ObjectItemValue: React.createFactory(require('./components/helpers/object-item-value')),
  createElement_ObjectItemKey: React.createFactory(require('./components/helpers/object-item-key')),
  createElement_ObjectItem: React.createFactory(require('./components/helpers/object-item')),
  createElement_SelectValue: React.createFactory(require('./components/helpers/select-value')),

  // Field default values
  defaultValue_Fields: createObject,
  defaultValue_Text: createString,
  defaultValue_Unicode: createString,
  defaultValue_Select: createString,
  defaultValue_List: createArray,
  defaultValue_Object: createObject,
  defaultValue_Json: createObject,
  defaultValue_Boolean: createBoolean,
  defaultValue_CheckboxList: createArray,

  hasElementFactory: function (name) {
    var config = this;

    return config['createElement_' + name] ? true : false;
  },

  createElement: function (name, props, children) {
    var config = this;

    if (!props.config) {
      props = _.extend({}, props, {config: config});
    }

    name = config.elementName(name);

    if (config['createElement_' + name]) {
      return config['createElement_' + name](props, children);
    }

    if (name !== 'Unknown') {
      if (config.hasElementFactory('Unknown')) {
        return config.createElement('Unknown', props, children);
      }
    }

    throw new Error('Factory not found for: ' + name);
  },

  createField: function (props) {
    var config = this;

    var name = config.fieldTypeName(props.field);

    if (config.hasElementFactory(name)) {
      return config.createElement(name, props);
    }

    return config.createElement('UnknownField', props);
  },

  renderComponent: function (component) {
    var config = this;

    var name = component.constructor.displayName;

    if (config['renderComponent_' + name]) {
      return config['renderComponent_' + name](component);
    }

    return component.renderDefault();
  },

  renderFieldComponent: function (component) {
    var config = this;

    return config.renderComponent(component);
  },

  elementName: function (name) {
    return utils.dashToPascal(name);
  },

  alias_Dict: 'Object',
  alias_Bool: 'Boolean',
  alias_PrettyTextarea: 'PrettyText',
  alias_Unicode: function (field) {
    if (field.replaceChoices) {
      return 'PrettyText';
    }
    return 'Unicode';
  },
  alias_Text: function (field) {
    if (field.replaceChoices) {
      return 'PrettyText';
    }
    return 'Text';
  },

  // Field helpers
  fieldTypeName: function (field) {
    var config = this;

    var fieldType = utils.dashToPascal(field.type);

    var alias = config['alias_' + fieldType];

    if (alias) {
      if (_.isFunction(alias)) {
        return alias(field);
      } else {
        return alias;
      }
    }

    if (field.list) {
      fieldType = 'List';
    }

    return fieldType;
  },
  fieldKey: function (field) {
    return field.key;
  },
  fieldDefaultValue: function (field) {
    var config = this;

    if (!_.isUndefined(field.default)) {
      return utils.deepCopy(field.default);
    }

    var typeName = config.fieldTypeName(field);

    if (config['defaultValue_' + typeName]) {
      return config['defaultValue_' + typeName](field);
    }

    return '';
  },
  fieldChoices: function (field) {
    var config = this;

    return config.normalizeChoices(field.choices);
  },
  fieldBooleanChoices: function (field) {
    var config = this;

    var choices = config.fieldChoices(field);

    if (choices.length === 0) {
      return [{
        label: 'Yes',
        value: true
      },{
        label: 'No',
        value: false
      }];
    }

    return choices.map(function (choice) {
      if (_.isBoolean(choice.value)) {
        return choice;
      }
      return _.extend({}, choice, {
        value: config.stringToBoolean(choice.value)
      });
    });
  },
  fieldReplaceChoices: function (field) {
    var config = this;

    return config.normalizeChoices(field.replaceChoices);
  },
  fieldLabel: function (field) {
    return field.label;
  },
  fieldHelpText: function (field) {
    return field.help_text_html || field.help_text || field.helpText || field.helpTextHtml;
  },
  fieldItems: function (field) {
    if (!field.items) {
      return [];
    }
    if (!_.isArray(field.items)) {
      return [field.items];
    }
    return field.items;
  },

  fieldItemForValue: function (field, value) {
    var config = this;

    var item;

    if (field.items) {
      if (!_.isArray(field.items)) {
        item = field.items;
      } else if (field.items.length === 0) {
        item = field.items[0];
      } else {
        item = _.find(field.items, function (item) {
          return config.itemMatchesValue(item, value);
        });
      }
    }

    if (item) {
      return item;
    } else {
      return config.fieldForValue(value);
    }
  },
  fieldItemValue: function (field, itemIndex) {
    var config = this;

    var item = config.fieldItems(field)[itemIndex];

    if (item) {

      if (_.isUndefined(item.default) && !_.isUndefined(item.match)) {
        return utils.deepCopy(item.match);
      } else {
        return config.fieldDefaultValue(item);
      }

    } else {
      // Fallback to a text value.
      return '';
    }
  },
  fieldIsSingleLine: function (field) {
    return field.isSingleLine || field.is_single_line || field.type === 'unicode' || field.type === 'Unicode';
  },

  itemMatchesValue: function (item, value) {
    var match = item.match;
    if (!match) {
      return true;
    }
    return _.every(_.keys(match), function (key) {
      return _.isEqual(match[key], value[key]);
    });
  },

  fieldForValue: function (value) {
    var config = this;

    var def = {
      type: 'json'
    };
    if (_.isString(value)) {
      def = {
        type: 'text'
      };
    } else if (_.isNumber(value)) {
      def = {
        type: 'number'
      };
    } else if (_.isBoolean(value)) {
      def = {
        type: 'boolean'
      };
    } else if (_.isArray(value)) {
      var arrayItemFields = value.map(function (value, i) {
        var childDef = config.fieldForValue(value);
        childDef.key = i;
        return childDef;
      });
      def = {
        type: 'list',
        fields: arrayItemFields
      };
    } else if (_.isObject(value)) {
      var objectItemFields = Object.keys(value).map(function (key) {
        var childDef = config.fieldForValue(value[key]);
        childDef.key = key;
        childDef.label = config.humanize(key);
        return childDef;
      });
      def = {
        type: 'object',
        fields: objectItemFields
      };
    } else if (_.isNull(value)) {
      def = {
        type: 'json'
      };
    }
    return def;
  },

  // Other helpers
  humanize: function(property) {
    property = property.replace(/\{\{/g, '');
    property = property.replace(/\}\}/g, '');
    return property.replace(/_/g, ' ')
    .replace(/(\w+)/g, function(match) {
      return match.charAt(0).toUpperCase() + match.slice(1);
    });
  },

  normalizeChoices: function (choices) {
    var config = this;

    if (!choices) {
      return [];
    }

    // Convert comma separated string to array of strings.
    if (_.isString(choices)) {
      choices = choices.split(',');
    }

    // Convert object to array of objects with `value` and `label` properties.
    if (!_.isArray(choices) && _.isObject(choices)) {
      choices = Object.keys(choices).map(function (key) {
        return {
          value: key,
          label: choices[key]
        };
      });
    }

    // Copy the array of choices so we can manipulate them.
    choices = choices.slice(0);

    // Array of choice arrays should be flattened.
    choices = _.flatten(choices);

    choices.forEach(function (choice, i) {
      // Convert any string choices to objects with `value` and `label`
      // properties.
      if (_.isString(choice)) {
        choices[i] = {
          value: choice,
          label: config.humanize(choice)
        };
      }
      if (!choices[i].label) {
        choices[i].label = config.humanize(choices[i].value);
      }
    });

    return choices;
  },

  // Coerce a string representation of a boolean to a boolean
  stringToBoolean: function (s) {
    if (!_.isString(s)) {
      // Just use the default truthiness.
      return s ? true : false;
    }
    s = s.toLowerCase();
    if (s === '' || s === 'no' || s === 'off' || s === 'false') {
      return false;
    }
    return true;
  }
};
