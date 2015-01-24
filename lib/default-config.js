// # default-config

/*
This is the default configuration for formatic. It's just an object with a bunch
of behavior functions that are passed into all the components. So to change
formatic's behavior, it's simple matter of cloning this object and overriding
the methods.
*/

'use strict';

var React = require('react/addons');
var R = React.DOM;
var _ = require('underscore');

var utils = require('./utils');

module.exports = {

  // Field element factories. Create field elements.

  createElement_Fields: React.createFactory(require('./components/fields/fields')),

  createElement_String: React.createFactory(require('./components/fields/string')),

  createElement_SingleLineString: React.createFactory(require('./components/fields/single-line-string')),

  createElement_Select: React.createFactory(require('./components/fields/select')),

  createElement_Boolean: React.createFactory(require('./components/fields/boolean')),

  createElement_PrettyText: React.createFactory(require('./components/fields/pretty-text')),

  createElement_Array: React.createFactory(require('./components/fields/array')),

  createElement_CheckboxArray: React.createFactory(require('./components/fields/checkbox-array')),

  createElement_Object: React.createFactory(require('./components/fields/object')),

  createElement_Json: React.createFactory(require('./components/fields/json')),

  createElement_UnknownField: React.createFactory(require('./components/fields/unknown')),

  createElement_Copy: React.createFactory(require('./components/fields/copy')),


  // Other element factories. Create helper elements used by field components.

  createElement_Field: React.createFactory(require('./components/helpers/field')),

  createElement_Label: React.createFactory(require('./components/helpers/label')),

  createElement_Help: React.createFactory(require('./components/helpers/help')),

  createElement_Choices: React.createFactory(require('./components/helpers/choices')),

  createElement_ArrayControl: React.createFactory(require('./components/helpers/array-control')),

  createElement_ArrayItemControl: React.createFactory(require('./components/helpers/array-item-control')),

  createElement_ArrayItemValue: React.createFactory(require('./components/helpers/array-item-value')),

  createElement_ArrayItem: React.createFactory(require('./components/helpers/array-item')),

  createElement_FieldTemplateChoices: React.createFactory(require('./components/helpers/field-template-choices')),

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

  createElement_Sample: React.createFactory(require('./components/helpers/sample')),


  // Field default value factories. Give a default value for a specific type.

  createDefaultValue_String: function (/* fieldTemplate */) {
    return '';
  },

  createDefaultValue_Object: function (/* fieldTemplate */) {
    return {};
  },

  createDefaultValue_Array: function (/* fieldTemplate */) {
    return [];
  },

  createDefaultValue_Boolean: function (/* fieldTemplate */) {
    return false;
  },

  createDefaultValue_Fields: utils.delegateTo('createDefaultValue_Object'),

  createDefaultValue_SingleLineString: utils.delegateTo('createDefaultValue_String'),

  createDefaultValue_Select: utils.delegateTo('createDefaultValue_String'),

  createDefaultValue_Json: utils.delegateTo('createDefaultValue_Object'),

  createDefaultValue_CheckboxArray: utils.delegateTo('createDefaultValue_Array'),


  // Field value coercers. Coerce a value into a value appropriate for a specific type.

  coerceValue_String: function (fieldTemplate, value) {
    if (_.isString(value)) {
      return value;
    }
    if (_.isUndefined(value) || value === null) {
      return '';
    }
    return JSON.stringify(value);
  },

  coerceValue_Object: function (fieldTemplate, value) {
    if (!_.isObject(value)) {
      return {};
    }
    return value;
  },

  coerceValue_Array: function (fieldTemplate, value) {
    if (!_.isArray(value)) {
      return [value];
    }
    return value;
  },

  coerceValue_Boolean: function (fieldTemplate, value) {
    return this.coerceValueToBoolean(value);
  },

  coerceValue_Fields: utils.delegateTo('coerceValue_Object'),

  coerceValue_SingleLineString: utils.delegateTo('coerceValue_String'),

  coerceValue_Select: utils.delegateTo('coerceValue_String'),

  coerceValue_Json: utils.delegateTo('coerceValue_Object'),

  coerceValue_CheckboxArray: utils.delegateTo('coerceValue_Array'),


  // Field child fields factories, so some types can have dynamic children.

  createChildFields_Array: function (field) {
    var config = this;

    return field.value.map(function (arrayItem, i) {
      var childFieldTemplate = config.childFieldTemplateForValue(field, arrayItem);

      var childField = config.createChildField(field, {
        fieldTemplate: childFieldTemplate, key: i, fieldIndex: i, value: arrayItem
      });

      return childField;
    });
  },

  createChildFields_Object: function (field) {
    var config = this;

    return Object.keys(field.value).map(function (key, i) {
      var childFieldTemplate = config.childFieldTemplateForValue(field, field.value[key]);

      var childField = config.createChildField(field, {
        fieldTemplate: childFieldTemplate, key: key, fieldIndex: i, value: field.value[key]
      });

      return childField;
    });
  },

  // Check if there is a factory for the name.
  hasElementFactory: function (name) {
    var config = this;

    return config['createElement_' + name] ? true : false;
  },

  // Create an element given a name, props, and children.
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

  // Create a field element given some props. Use context to determine name.
  createFieldElement: function (props) {
    var config = this;

    var name = config.fieldTypeName(props.field);

    if (config.hasElementFactory(name)) {
      return config.createElement(name, props);
    }

    return config.createElement('UnknownField', props);
  },

  // Render the root formatic component
  renderFormaticComponent: function (component) {
    var config = this;
    var props = component.props;

    var field = config.createRootField(props);

    return R.div({className: 'formatic'},
      config.createFieldElement({field: field, onChange: component.onChange, onAction: component.onAction})
    );
  },

  // Render any component.
  renderComponent: function (component) {
    var config = this;

    var name = component.constructor.displayName;

    if (config['renderComponent_' + name]) {
      return config['renderComponent_' + name](component);
    }

    return component.renderDefault();
  },

  // Render field components.
  renderFieldComponent: function (component) {
    var config = this;

    return config.renderComponent(component);
  },

  // Normalize an element name.
  elementName: function (name) {
    return utils.dashToPascal(name);
  },

  // Type aliases.

  alias_Dict: 'Object',

  alias_Bool: 'Boolean',

  alias_PrettyTextarea: 'PrettyText',

  alias_SingleLineString: function (fieldTemplate) {
    if (fieldTemplate.replaceChoices) {
      return 'PrettyText';
    } else if (fieldTemplate.choices) {
      return 'Select';
    }
    return 'SingleLineString';
  },

  alias_String: function (fieldTemplate) {
    var config = this;

    if (fieldTemplate.replaceChoices) {
      return 'PrettyText';
    } else if (fieldTemplate.choices) {
      return 'Select';
    } else if (config.fieldTemplateIsSingleLine(fieldTemplate)) {
      return 'SingleLineString';
    }
    return 'String';
  },

  alias_Text: utils.delegateTo('alias_String'),

  alias_Unicode: utils.delegateTo('alias_SingleLineString'),

  alias_Str: utils.delegateTo('alias_SingleLineString'),

  alias_List: 'Array',

  alias_CheckboxList: 'CheckboxArray',

  alias_Fieldset: 'Fields',

  // Field factory

  // Given a field, expand all child fields recursively to get the default
  // values of all fields.
  inflateFieldValue: function (field) {
    var config = this;

    if (config.fieldHasValueChildren(field)) {
      var value = _.clone(field.value);
      var childFields = config.createChildFields(field);
      childFields.forEach(function (childField) {
        if (config.isKey(childField.key)) {
          value[childField.key] = config.inflateFieldValue(childField);
        }
      });
      return value;
    } else {
      return field.value;
    }
  },

  // Initialize the root field.
  initRootField: function (/* field, props */) {
  },

  // Initialize every field.
  initField: function (/* field */) {
  },

  // If an array of field templates are passed in, this method is used to
  // wrap the fields inside a single root field template.
  wrapFieldTemplates: function (fieldTemplates) {
    return {
      type: 'fields',
      plain: true,
      fields: fieldTemplates
    };
  },

  // Given the props that are passed in, create the root field.
  createRootField: function (props) {
    var config = this;

    var fieldTemplate = props.fieldTemplate || props.fieldTemplates || props.field || props.fields;
    var value = props.value;

    if (!fieldTemplate) {
      fieldTemplate = config.createFieldTemplateFromValue(value);
    }

    if (_.isArray(fieldTemplate)) {
      fieldTemplate = config.wrapFieldTemplates(fieldTemplate);
    }

    var field = _.extend({}, fieldTemplate, {rawFieldTemplate: fieldTemplate});
    if (config.hasValue(fieldTemplate, value)) {
      field.value = config.coerceValue(fieldTemplate, value);
    } else {
      field.value = config.createDefaultValue(fieldTemplate);
    }

    config.initRootField(field, props);
    config.initField(field);

    if (value === null || config.isEmptyObject(value) || _.isUndefined(value)) {
      field.value = config.inflateFieldValue(field);
    }

    return field;
  },

  // Given the props that are passed in, create the value that will be displayed
  // by all the components.
  createRootValue: function (props) {
    var config = this;

    var field = config.createRootField(props);

    return config.inflateFieldValue(field);
  },

  // Create dynamic child fields for a field.
  createChildFields: function (field) {
    var config = this;

    var typeName = config.fieldTypeName(field);

    if (config['createChildFields_' + typeName]) {
      return config['createChildFields_' + typeName](field);
    }

    return config.fieldChildFieldTemplates(field).map(function (childField, i) {
      return config.createChildField(field, {
        fieldTemplate: childField, key: childField.key, fieldIndex: i, value: field.value[childField.key]
      });
    });
  },

  // Create a single child field for a parent field.
  createChildField: function (parentField, options) {
    var config = this;

    var childValue = options.value;

    var childField = _.extend({}, options.fieldTemplate, {
      key: options.key, parent: parentField, fieldIndex: options.fieldIndex,
      rawFieldTemplate: options.fieldTemplate
    });

    if (config.hasValue(options.fieldTemplate, childValue)) {
      childField.value = config.coerceValue(options.fieldTemplate, childValue);
    } else {
      childField.value = config.createDefaultValue(options.fieldTemplate);
    }

    config.initField(childField);

    return childField;
  },

  // Create a temporary field and extract its value.
  createNewChildFieldValue: function (parentField, itemFieldIndex) {
    var config = this;

    var childFieldTemplate = config.fieldItemFieldTemplates(parentField)[itemFieldIndex];

    var newValue = config.fieldTemplateValue(childFieldTemplate);

    // Just a placeholder key. Should not be important.
    var key = '__unknown_key__';

    if (_.isArray(parentField.value)) {
      // Just a placeholder position for an array.
      key = parentField.value.length;
    }

    // Just a placeholder field index. Should not be important.
    var fieldIndex = 0;
    if (_.isObject(parentField.value)) {
      fieldIndex = Object.keys(parentField.value).length;
    }

    var childField = config.createChildField(parentField, {
      fieldTemplate: childFieldTemplate, key: key, fieldIndex: fieldIndex, value: newValue
    });

    newValue = config.inflateFieldValue(childField);

    return newValue;
  },

  // Given a value, create a field template for that value.
  createFieldTemplateFromValue: function (value) {
    var config = this;

    var field = {
      type: 'json'
    };
    if (_.isString(value)) {
      field = {
        type: 'string'
      };
    } else if (_.isNumber(value)) {
      field = {
        type: 'number'
      };
    } else if (_.isBoolean(value)) {
      field = {
        type: 'boolean'
      };
    } else if (_.isArray(value)) {
      var arrayItemFields = value.map(function (value, i) {
        var childField = config.createFieldTemplateFromValue(value);
        childField.key = i;
        return childField;
      });
      field = {
        type: 'array',
        fields: arrayItemFields
      };
    } else if (_.isObject(value)) {
      var objectItemFields = Object.keys(value).map(function (key) {
        var childField = config.createFieldTemplateFromValue(value[key]);
        childField.key = key;
        childField.label = config.humanize(key);
        return childField;
      });
      field = {
        type: 'object',
        fields: objectItemFields
      };
    } else if (_.isNull(value)) {
      field = {
        type: 'json'
      };
    }
    return field;
  },

  // Default value factory

  createDefaultValue: function (fieldTemplate) {
    var config = this;

    var defaultValue = config.fieldTemplateDefaultValue(fieldTemplate);

    if (!_.isUndefined(defaultValue)) {
      return utils.deepCopy(defaultValue);
    }

    var typeName = config.fieldTypeName(fieldTemplate);

    if (config['createDefaultValue_' + typeName]) {
      return config['createDefaultValue_' + typeName](fieldTemplate);
    }

    return '';
  },

  // Field helpers

  // Determine if a value "exists".
  hasValue: function (fieldTemplate, value) {
    return value !== null && !_.isUndefined(value);
  },

  // Coerce a value to value appropriate for a field.
  coerceValue: function (field, value) {
    var config = this;

    var typeName = config.fieldTypeName(field);

    if (config['coerceValue_' + typeName]) {
      return config['coerceValue_' + typeName](field, value);
    }

    return value;
  },

  // Given a field and a child value, find the appropriate field template for
  // that child value.
  childFieldTemplateForValue: function (field, childValue) {
    var config = this;

    var fieldTemplate;

    var fieldTemplates = config.fieldItemFieldTemplates(field);

    fieldTemplate = _.find(fieldTemplates, function (fieldTemplate) {
      return config.matchesFieldTemplateToValue(fieldTemplate, childValue);
    });

    if (fieldTemplate) {
      return fieldTemplate;
    } else {
      return config.createFieldTemplateFromValue(childValue);
    }
  },

  // Determine if a value is a match for a field template.
  matchesFieldTemplateToValue: function (fieldTemplate, value) {
    var match = fieldTemplate.match;
    if (!match) {
      return true;
    }
    return _.every(_.keys(match), function (key) {
      return _.isEqual(match[key], value[key]);
    });
  },

  // Field template helpers

  // Normalized (PascalCase) type name for a field.
  fieldTemplateTypeName: function (fieldTemplate) {
    var config = this;

    var typeName = utils.dashToPascal(fieldTemplate.type || 'undefined');

    var alias = config['alias_' + typeName];

    if (alias) {
      if (_.isFunction(alias)) {
        return alias.call(config, fieldTemplate);
      } else {
        return alias;
      }
    }

    if (fieldTemplate.list) {
      typeName = 'Array';
    }

    return typeName;
  },

  // Default value for a field template.
  fieldTemplateDefaultValue: function (fieldTemplate) {

    return fieldTemplate.default;
  },

  // Value for a field template. Used to determine the value of a new child
  // field.
  fieldTemplateValue: function (fieldTemplate) {
    var config = this;

    // This logic might be brittle.

    var defaultValue = config.fieldTemplateDefaultValue(fieldTemplate);

    var match = config.fieldTemplateMatch(fieldTemplate);

    var value;

    if (_.isUndefined(defaultValue) && !_.isUndefined(match)) {
      return utils.deepCopy(match);
    } else {
      return config.createDefaultValue(fieldTemplate);
    }

    return value;
  },

  // Match rule for a field template.
  fieldTemplateMatch: function (fieldTemplate) {
    return fieldTemplate.match;
  },

  // Determine if a field template has a single-line value.
  fieldTemplateIsSingleLine: function (fieldTemplate) {
    return fieldTemplate.isSingleLine || fieldTemplate.is_single_line ||
            fieldTemplate.type === 'single-line-string' || fieldTemplate.type === 'SingleLineString';
  },

  // Field helpers

  // Get an array of keys representing the path to a value.
  fieldValuePath: function (field) {
    var config = this;

    var parentPath = [];

    if (field.parent) {
      parentPath = config.fieldValuePath(field.parent);
    }

    return parentPath.concat(field.key).filter(function (key) {
      return !_.isUndefined(key) && key !== '';
    });
  },

  // Clone a field with a different value.
  fieldWithValue: function (field, value) {
    return _.extend({}, field, {value: value});
  },

  fieldTypeName: utils.delegateTo('fieldTemplateTypeName'),

  // Get the choices for a dropdown field.
  fieldChoices: function (field) {
    var config = this;

    return config.normalizeChoices(field.choices);
  },

  // Get a set of boolean choices for a field.
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
        value: config.coerceValueToBoolean(choice.value)
      });
    });
  },

  // Get a set of replacement choices for a field.
  fieldReplaceChoices: function (field) {
    var config = this;

    return config.normalizeChoices(field.replaceChoices);
  },

  // Get a label for a field.
  fieldLabel: function (field) {
    return field.label;
  },

  // Get the help text for a field.
  fieldHelpText: function (field) {
    return field.help_text_html || field.help_text || field.helpText || field.helpTextHtml;
  },

  // Get whether or not a field is required.
  fieldIsRequired: function (field) {
    return field.required ? true : false;
  },

  // Determine if value for this field is not a leaf value.
  fieldHasValueChildren: function (field) {
    var config = this;

    var defaultValue = config.createDefaultValue(field);

    if (_.isObject(defaultValue) || _.isArray(defaultValue)) {
      return true;
    }

    return false;
  },

  // Get the child field templates for this field.
  fieldChildFieldTemplates: function (field) {
    return field.fields || [];
  },

  // Get the field templates for each item of this field. (For dynamic children,
  // like arrays.)
  fieldItemFieldTemplates: function (field) {
    if (!field.itemFields) {
      return [{type: 'text'}];
    }
    if (!_.isArray(field.itemFields)) {
      return [field.itemFields];
    }
    return field.itemFields;
  },

  fieldIsSingleLine: utils.delegateTo('fieldTemplateIsSingleLine'),

  // Get whether or not a field is collapsed.
  fieldIsCollapsed: function (field) {
    return field.collapsed ? true : false;
  },

  // Get wheter or not a field can be collapsed.
  fieldIsCollapsible: function (field) {
    return field.collapsible || !_.isUndefined(field.collapsed);
  },

  // Get the number of rows for a field.
  fieldRows: function (field) {
    return field.rows;
  },

  fieldMatch: utils.delegateTo('fieldTemplateMatch'),

  // Other helpers

  // Convert a key to a nice human-readable version.
  humanize: function(property) {
    property = property.replace(/\{\{/g, '');
    property = property.replace(/\}\}/g, '');
    return property.replace(/_/g, ' ')
    .replace(/(\w+)/g, function(match) {
      return match.charAt(0).toUpperCase() + match.slice(1);
    });
  },

  // Normalize some choices for a drop-down.
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

  // Coerce a value to a boolean
  coerceValueToBoolean: function (value) {
    if (!_.isString(value)) {
      // Just use the default truthiness.
      return value ? true : false;
    }
    value = value.toLowerCase();
    if (value === '' || value === 'no' || value === 'off' || value === 'false') {
      return false;
    }
    return true;
  },

  // Determine if a value is a valid key.
  isKey: function (key) {
    return (_.isNumber(key) && key >= 0) || (_.isString(key) && key !== '');
  },

  // Fast way to check for empty object.
  isEmptyObject: function (obj) {
    for(var key in obj) {
      if (obj.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  }
};
