// # default-config

/*
This is the default configuration plugin for formatic. To change formatic's
behavior, just create your own plugin function that returns an object with
methods you want to add or override.
*/

'use strict';

import React from 'react';
import _ from '@/src/undash';
import utils, { argumentsToArray } from '@/src/utils';

import FieldsField from './components/fields/fields';
import GroupedFieldsField from './components/fields/grouped-fields';
import StringField from './components/fields/string';
import SingleLineStringField from './components/fields/single-line-string';
import PasswordField from './components/fields/password';
import SelectField from './components/fields/select';
import PrettySelectField from './components/fields/pretty-select';
import BooleanField from './components/fields/boolean';
import PrettyBooleanField from './components/fields/pretty-boolean';
import CheckboxBooleanField from './components/fields/checkbox-boolean';
import CodeField from './components/fields/code';
import PrettyTextField from './components/fields/pretty-text';
import PrettyTagField from './components/helpers/pretty-tag';
import ArrayField from './components/fields/array';
import CheckboxArrayField from './components/fields/checkbox-array';
import ObjectField from './components/fields/object';
import AssocListField from './components/fields/assoc-list';
import JsonField from './components/fields/json';
import UnknownFieldField from './components/fields/unknown';
import CopyField from './components/fields/copy';

import FieldHelper from './components/helpers/field';
import FieldBody from './components/helpers/field-body';
import LabelHelper from './components/helpers/label';
import RequiredLabelHelper from './components/helpers/required-label';
import HelpHelper from './components/helpers/help';
import ChoicesHelper from './components/helpers/choices';
import ChoicesItemHelper from './components/helpers/choices-item';
import ChoiceHelper from './components/helpers/choice';
import ChoicesSearchHelper from './components/helpers/choices-search';
import LoadingChoicesHelper from './components/helpers/loading-choices';
import LoadingChoiceHelper from './components/helpers/loading-choice';
import ArrayControlHelper from './components/helpers/array-control';
import ArrayItemControlHelper from './components/helpers/array-item-control';
import ArrayItemValueHelper from './components/helpers/array-item-value';
import ArrayItemHelper from './components/helpers/array-item';
import FieldTemplateChoicesHelper from './components/helpers/field-template-choices';
import AddItemHelper from './components/helpers/add-item';
import RemoveItemHelper from './components/helpers/remove-item';
import MoveItemForwardHelper from './components/helpers/move-item-forward';
import MoveItemBackHelper from './components/helpers/move-item-back';
import AssocListControlHelper from './components/helpers/assoc-list-control';
import AssocListItemControlHelper from './components/helpers/assoc-list-item-control';
import AssocListItemValueHelper from './components/helpers/assoc-list-item-value';
import AssocListItemKeyHelper from './components/helpers/assoc-list-item-key';
import AssocListItemHelper from './components/helpers/assoc-list-item';
import SelectValueHelper from './components/helpers/select-value';
import PrettySelectValueHelper from './components/helpers/pretty-select-value';
import PrettySelectInputHelper from './components/helpers/pretty-select-input';
import SampleHelper from './components/helpers/sample';
import InsertButtonHelper from './components/helpers/insert-button';
import ChoiceSectionHeaderHelper from './components/helpers/choice-section-header';
import PrettyTextInputHelper from './components/helpers/pretty-text-input';

const canHostCodeMirror = typeof window !== 'undefined';

export default function(config) {
  const delegateTo = utils.delegator(config);

  const createElement_String = React.createFactory(StringField);
  const createElement_Select = React.createFactory(SelectField);

  return {
    // Field element factories. Create field elements.

    createElement_Fields: React.createFactory(FieldsField),

    createElement_FieldBody: React.createFactory(FieldBody),

    createElement_GroupedFields: React.createFactory(GroupedFieldsField),

    createElement_String,

    createElement_SingleLineString: React.createFactory(SingleLineStringField),

    createElement_Password: React.createFactory(PasswordField),

    createElement_Select,

    createElement_PrettySelect: React.createFactory(PrettySelectField),

    createElement_Boolean: React.createFactory(BooleanField),

    createElement_PrettyBoolean: React.createFactory(PrettyBooleanField),

    createElement_CheckboxBoolean: React.createFactory(CheckboxBooleanField),

    createElement_Code: canHostCodeMirror
      ? React.createFactory(CodeField)
      : props => createElement_String({ ...props, typeName: 'Code' }),

    createElement_PrettyText: React.createFactory(PrettyTextField),

    createElement_PrettyTag: React.createFactory(PrettyTagField),

    createElement_Array: React.createFactory(ArrayField),

    createElement_CheckboxArray: React.createFactory(CheckboxArrayField),

    createElement_Object: React.createFactory(ObjectField),

    createElement_AssocList: React.createFactory(AssocListField),

    createElement_Json: React.createFactory(JsonField),

    createElement_UnknownField: React.createFactory(UnknownFieldField),

    createElement_Copy: React.createFactory(CopyField),

    // Other element factories. Create helper elements used by field components.

    createElement_Field: React.createFactory(FieldHelper),

    createElement_Label: React.createFactory(LabelHelper),

    createElement_RequiredLabel: React.createFactory(RequiredLabelHelper),

    createElement_Help: React.createFactory(HelpHelper),

    createElement_Choices: React.createFactory(ChoicesHelper),

    createElement_ChoicesItem: React.createFactory(ChoicesItemHelper),

    createElement_ChoiceActionSample: () => null,

    createElement_Choice: React.createFactory(ChoiceHelper),

    createElement_InfoChoice: React.createFactory(ChoiceHelper),

    createElement_ActionChoice: React.createFactory(ChoiceHelper),

    createElement_SectionChoice: React.createFactory(ChoiceHelper),

    createElement_ChoicesSearch: React.createFactory(ChoicesSearchHelper),

    createElement_LoadingChoices: React.createFactory(LoadingChoicesHelper),

    createElement_LoadingChoice: React.createFactory(LoadingChoiceHelper),

    createElement_ArrayControl: React.createFactory(ArrayControlHelper),

    createElement_ArrayItemControl: React.createFactory(ArrayItemControlHelper),

    createElement_ArrayItemValue: React.createFactory(ArrayItemValueHelper),

    createElement_ArrayItem: React.createFactory(ArrayItemHelper),

    createElement_FieldTemplateChoices: React.createFactory(
      FieldTemplateChoicesHelper
    ),

    createElement_AddItem: React.createFactory(AddItemHelper),

    createElement_RemoveItem: React.createFactory(RemoveItemHelper),

    createElement_MoveItemForward: React.createFactory(MoveItemForwardHelper),

    createElement_MoveItemBack: React.createFactory(MoveItemBackHelper),

    createElement_AssocListControl: React.createFactory(AssocListControlHelper),

    createElement_AssocListItemControl: React.createFactory(
      AssocListItemControlHelper
    ),

    createElement_AssocListItemValue: React.createFactory(
      AssocListItemValueHelper
    ),

    createElement_AssocListItemKey: React.createFactory(AssocListItemKeyHelper),

    createElement_AssocListItem: React.createFactory(AssocListItemHelper),

    createElement_SelectValue: React.createFactory(SelectValueHelper),

    createElement_PrettySelectValue: React.createFactory(
      PrettySelectValueHelper
    ),

    createElement_PrettySelectInput: React.createFactory(
      PrettySelectInputHelper
    ),

    createElement_Sample: React.createFactory(SampleHelper),

    createElement_InsertButton: React.createFactory(InsertButtonHelper),

    createElement_ChoiceSectionHeader: React.createFactory(
      ChoiceSectionHeaderHelper
    ),

    createElement_PrettyTextInput: React.createFactory(PrettyTextInputHelper),

    // Field default value factories. Give a default value for a specific type.

    createDefaultValue_String: function(/* fieldTemplate */) {
      return '';
    },

    createDefaultValue_Object: function(/* fieldTemplate */) {
      return {};
    },

    createDefaultValue_Array: function(/* fieldTemplate */) {
      return [];
    },

    createDefaultValue_Boolean: function(/* fieldTemplate */) {
      return false;
    },

    createDefaultValue_AssocList: delegateTo('createDefaultValue_Array'),

    createDefaultValue_Fields: delegateTo('createDefaultValue_Object'),

    createDefaultValue_SingleLineString: delegateTo(
      'createDefaultValue_String'
    ),

    createDefaultValue_Select: delegateTo('createDefaultValue_String'),

    createDefaultValue_Json: delegateTo('createDefaultValue_Object'),

    createDefaultValue_CheckboxArray: delegateTo('createDefaultValue_Array'),

    createDefaultValue_CheckboxBoolean: delegateTo(
      'createDefaultValue_Boolean'
    ),

    // Field value coercers. Coerce a value into a value appropriate for a specific type.

    coerceValue_String: function(fieldTemplate, value) {
      if (_.isString(value)) {
        return value;
      }
      if (_.isUndefined(value) || value === null) {
        return '';
      }
      return JSON.stringify(value);
    },

    coerceValue_Object: function(fieldTemplate, value) {
      if (!_.isObject(value)) {
        return {};
      }
      return value;
    },

    coerceValue_AssocList: function(fieldTemplate, value) {
      if (_.isArray(value)) {
        return value;
      }
      if (_.isObject(value)) {
        return config.objectToAssocList(value);
      }
      return [value];
    },

    coerceValue_Array: function(fieldTemplate, value) {
      if (!_.isArray(value)) {
        return [value];
      }
      return value;
    },

    coerceValue_Boolean: function(fieldTemplate, value) {
      return config.coerceValueToBoolean(value);
    },

    coerceValue_Fields: delegateTo('coerceValue_Object'),

    coerceValue_SingleLineString: delegateTo('coerceValue_String'),

    coerceValue_Select: delegateTo('coerceValue_String'),

    coerceValue_PrettySelect: delegateTo('coerceValue_String'),

    coerceValue_Json: delegateTo('coerceValue_Object'),

    coerceValue_CheckboxArray: delegateTo('coerceValue_Array'),

    coerceValue_CheckboxBoolean: delegateTo('coerceValue_Boolean'),

    coerceValue_PrettyBoolean: delegateTo('coerceValue_Boolean'),

    // Field child fields factories, so some types can have dynamic children.

    createChildFields_Array: function(field) {
      return field.value.map(function(arrayItem, i) {
        const childFieldTemplate = config.childFieldTemplateForValue(
          field,
          arrayItem
        );

        const childField = config.createChildField(field, {
          fieldTemplate: childFieldTemplate,
          key: i,
          fieldIndex: i,
          value: arrayItem,
        });

        return childField;
      });
    },

    createChildFields_AssocList: function(field) {
      return field.value.map(function(row, i) {
        const childFieldTemplate = config.childFieldTemplateForValue(
          field,
          row.value
        );

        const childField = config.createChildField(field, {
          fieldTemplate: childFieldTemplate,
          key: i,
          fieldIndex: i,
          value: row.value,
        });

        return childField;
      });
    },

    createChildFields_Object: function(field) {
      return Object.keys(field.value).map(function(key, i) {
        const childFieldTemplate = config.childFieldTemplateForValue(
          field,
          field.value[key]
        );

        const childField = config.createChildField(field, {
          fieldTemplate: childFieldTemplate,
          key,
          fieldIndex: i,
          value: field.value[key],
        });

        return childField;
      });
    },

    // Check if there is a factory for the name.
    hasElementFactory: function(name) {
      return config['createElement_' + name] ? true : false;
    },

    // Create an element given a name, props, and children.
    createElement: function(name, props, children) {
      if (!props.config) {
        props = _.extend({}, props, { config });
      }

      name = config.elementName(name);

      const createElement = config['createElement_' + name];

      if (createElement) {
        if (children && createElement.length === 1) {
          return createElement({
            ...props,
            children,
          });
        }
        return createElement(props, children);
      }

      if (name !== 'Unknown') {
        if (config.hasElementFactory('Unknown')) {
          return config.createElement('Unknown', props, children);
        }
      }

      throw new Error('Factory not found for: ' + name);
    },

    // Create a field element given some props. Use context to determine name.
    createFieldElement: function(props) {
      const name = config.fieldTypeName(props.field);

      if (config.hasElementFactory(name)) {
        return config.createElement(name, props);
      }

      return config.createElement('UnknownField', props);
    },

    // Render the root formatic component
    renderFormaticComponent: function(component) {
      const props = component.props;
      const field = config.createRootField(props);

      return (
        <div className="formatic">
          {config.createFieldElement({
            field,
            onChange: component.onChange,
            onAction: component.onAction,
          })}
        </div>
      );
    },

    // Render any component.
    renderComponent: function(component) {
      const name = component.constructor.displayName;

      if (config['renderComponent_' + name]) {
        return config['renderComponent_' + name](component);
      }

      return component.renderDefault();
    },

    // Render field components.
    renderFieldComponent: function(component) {
      return config.renderComponent(component);
    },

    // Normalize an element name.
    elementName: function(name) {
      return utils.dashToPascal(name);
    },

    renderTag: function(tagName, tagProps, metaProps, children) {
      if (arguments.length < 5) {
        return React.createElement(tagName, tagProps, children);
      } else {
        return React.createElement.apply(
          null,
          argumentsToArray(arguments, 3, [tagName, tagProps])
        );
      }
    },

    // Type aliases.

    alias_Dict: 'Object',

    alias_Bool: 'Boolean',

    alias_PrettyTextarea: 'PrettyText',

    alias_SingleLineString: function(fieldTemplate) {
      if (fieldTemplate.replaceChoices) {
        return 'PrettyText';
      } else if (fieldTemplate.choices) {
        return 'Select';
      }
      return 'SingleLineString';
    },

    alias_String: function(fieldTemplate) {
      if (fieldTemplate.replaceChoices) {
        return 'PrettyText';
      } else if (fieldTemplate.choices) {
        return 'Select';
      } else if (config.fieldTemplateIsSingleLine(fieldTemplate)) {
        return 'SingleLineString';
      }
      return 'String';
    },

    alias_Text: delegateTo('alias_String'),

    alias_Unicode: delegateTo('alias_SingleLineString'),

    alias_Str: delegateTo('alias_SingleLineString'),

    alias_List: 'Array',

    alias_CheckboxList: 'CheckboxArray',

    alias_Fieldset: 'Fields',

    alias_Checkbox: 'CheckboxBoolean',

    // Field factory

    // Given a field, expand all child fields recursively to get the default
    // values of all fields.
    inflateFieldValue: function(field, fieldHandler) {
      if (fieldHandler) {
        const stop = fieldHandler(field);
        if (stop === false) {
          return undefined;
        }
      }

      if (config.fieldHasValueChildren(field)) {
        const value = _.clone(field.value);
        const childFields = config.createChildFields(field);
        childFields.forEach(function(childField) {
          if (config.isKey(childField.key)) {
            value[childField.key] = config.inflateFieldValue(
              childField,
              fieldHandler
            );
          } else {
            // a child with no key might have sub-children with keys
            const obj = config.inflateFieldValue(childField, fieldHandler);
            _.extend(value, obj);
          }
        });
        return value;
      } else {
        return field.value;
      }
    },

    // Initialize the root field.
    initRootField: function(/* field, props */) {},

    // Initialize every field.
    initField: function(/* field */) {},

    // If an array of field templates are passed in, this method is used to
    // wrap the fields inside a single root field template.
    wrapFieldTemplates: function(fieldTemplates) {
      return {
        type: 'fields',
        plain: true,
        fields: fieldTemplates,
      };
    },

    // Given the props that are passed in, create the root field.
    createRootField: function(props) {
      let fieldTemplate =
        props.fieldTemplate ||
        props.fieldTemplates ||
        props.field ||
        props.fields;
      const value = props.value;

      if (!fieldTemplate) {
        fieldTemplate = config.createFieldTemplateFromValue(value);
      }

      if (_.isArray(fieldTemplate)) {
        fieldTemplate = config.wrapFieldTemplates(fieldTemplate);
      }

      const field = _.extend({}, fieldTemplate, {
        rawFieldTemplate: fieldTemplate,
      });
      if (config.hasValue(fieldTemplate, value)) {
        field.value = config.coerceValue(fieldTemplate, value);
      } else {
        field.value = config.createDefaultValue(fieldTemplate);
      }

      config.initRootField(field, props);
      config.initField(field);

      if (
        value === null ||
        config.isEmptyObject(value) ||
        _.isUndefined(value)
      ) {
        field.value = config.inflateFieldValue(field);
      }

      if (props.readOnly) {
        field.readOnly = true;
      }

      return field;
    },

    // Given the props that are passed in, create the value that will be displayed
    // by all the components.
    createRootValue: function(props, fieldHandler) {
      const field = config.createRootField(props);

      return config.inflateFieldValue(field, fieldHandler);
    },

    validateRootValue: function(props) {
      const errors = [];

      config.createRootValue(props, function(field) {
        const fieldErrors = config.fieldErrors(field);
        if (fieldErrors.length > 0) {
          errors.push({
            path: config.fieldValuePath(field),
            errors: fieldErrors,
          });
        }
      });

      return errors;
    },

    isValidRootValue: function(props) {
      let isValid = true;

      config.createRootValue(props, function(field) {
        if (config.fieldErrors(field).length > 0) {
          isValid = false;
          return false;
        }

        return undefined;
      });

      return isValid;
    },

    validateField: function(field, errors) {
      if (field.value === undefined || field.value === '') {
        if (config.fieldIsRequired(field)) {
          errors.push({
            type: 'required',
          });
        }
      }
    },

    cssTransitionWrapper: function(...children) {
      return React.createElement(React.Fragment, {}, ...children);
    },

    // Create dynamic child fields for a field.
    createChildFields: function(field) {
      const typeName = config.fieldTypeName(field);

      if (config['createChildFields_' + typeName]) {
        return config['createChildFields_' + typeName](field);
      }

      return config
        .fieldChildFieldTemplates(field)
        .map(function(childField, i) {
          let childValue = field.value;
          if (config.isKey(childField.key)) {
            childValue = field.value[childField.key];
          }
          return config.createChildField(field, {
            fieldTemplate: childField,
            key: childField.key,
            fieldIndex: i,
            value: childValue,
          });
        });
    },

    // Create a single child field for a parent field.
    createChildField: function(parentField, options) {
      const childValue = options.value;

      const childField = _.extend({}, options.fieldTemplate, {
        key: options.key,
        parent: parentField,
        fieldIndex: options.fieldIndex,
        rawFieldTemplate: options.fieldTemplate,
      });

      if (config.hasValue(options.fieldTemplate, childValue)) {
        childField.value = config.coerceValue(
          options.fieldTemplate,
          childValue
        );
      } else {
        childField.value = config.createDefaultValue(options.fieldTemplate);
      }

      config.initField(childField);

      return childField;
    },

    // Create a temporary field and extract its value.
    createNewChildFieldValue: function(parentField, itemFieldIndex) {
      const childFieldTemplate = config.fieldItemFieldTemplates(parentField)[
        itemFieldIndex
      ];

      let newValue = config.fieldTemplateValue(childFieldTemplate);

      // Just a placeholder key. Should not be important.
      let key = '__unknown_key__';

      if (_.isArray(parentField.value)) {
        // Just a placeholder position for an array.
        key = parentField.value.length;
      }

      // Just a placeholder field index. Should not be important.
      let fieldIndex = 0;
      if (_.isObject(parentField.value)) {
        fieldIndex = Object.keys(parentField.value).length;
      }

      const childField = config.createChildField(parentField, {
        fieldTemplate: childFieldTemplate,
        key,
        fieldIndex,
        value: newValue,
      });

      newValue = config.inflateFieldValue(childField);

      return newValue;
    },

    // Given a value, create a field template for that value.
    createFieldTemplateFromValue: function(value) {
      let field = {
        type: 'json',
      };
      if (_.isString(value)) {
        field = {
          type: 'string',
        };
      } else if (_.isNumber(value)) {
        field = {
          type: 'number',
        };
      } else if (_.isBoolean(value)) {
        field = {
          type: 'boolean',
        };
      } else if (_.isArray(value)) {
        const arrayItemFields = value.map(function(childValue, i) {
          const childField = config.createFieldTemplateFromValue(childValue);
          childField.key = i;
          return childField;
        });
        field = {
          type: 'array',
          fields: arrayItemFields,
        };
      } else if (_.isObject(value)) {
        const objectItemFields = Object.keys(value).map(function(key) {
          const childField = config.createFieldTemplateFromValue(value[key]);
          childField.key = key;
          childField.label = config.humanize(key);
          return childField;
        });
        field = {
          type: 'object',
          fields: objectItemFields,
        };
      } else if (_.isNull(value)) {
        field = {
          type: 'json',
        };
      }
      return field;
    },

    // Default value factory

    createDefaultValue: function(fieldTemplate) {
      const defaultValue = config.fieldTemplateDefaultValue(fieldTemplate);

      if (!_.isUndefined(defaultValue)) {
        return utils.deepCopy(defaultValue);
      }

      const typeName = config.fieldTypeName(fieldTemplate);

      if (config['createDefaultValue_' + typeName]) {
        return config['createDefaultValue_' + typeName](fieldTemplate);
      }

      return '';
    },

    // Field helpers

    // Determine if a value "exists".
    hasValue: function(fieldTemplate, value) {
      return value !== null && !_.isUndefined(value);
    },

    // Coerce a value to value appropriate for a field.
    coerceValue: function(field, value) {
      const typeName = config.fieldTypeName(field);

      if (config['coerceValue_' + typeName]) {
        return config['coerceValue_' + typeName](field, value);
      }

      return value;
    },

    // Given a field and a child value, find the appropriate field template for
    // that child value.
    childFieldTemplateForValue: function(field, childValue) {
      const fieldTemplates = config.fieldItemFieldTemplates(field);

      const fieldTemplate = _.find(fieldTemplates, function(itemFieldTemplate) {
        return config.matchesFieldTemplateToValue(
          itemFieldTemplate,
          childValue
        );
      });

      if (fieldTemplate) {
        return fieldTemplate;
      } else {
        return config.createFieldTemplateFromValue(childValue);
      }
    },

    // Determine if a value is a match for a field template.
    matchesFieldTemplateToValue: function(fieldTemplate, value) {
      const match = fieldTemplate.match;
      if (!match) {
        return true;
      }
      return _.every(Object.keys(match), function(key) {
        return _.isEqual(match[key], value[key]);
      });
    },

    // Field template helpers

    // Normalized (PascalCase) type name for a field.
    fieldTemplateTypeName: function(fieldTemplate) {
      let typeName = utils.dashToPascal(fieldTemplate.type || 'undefined');

      const alias = config['alias_' + typeName];

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
    fieldTemplateDefaultValue: function(fieldTemplate) {
      if (!_.isUndefined(fieldTemplate.default)) {
        return config.coerceValue(fieldTemplate, fieldTemplate.default);
      }

      return fieldTemplate.default;
    },

    // Value for a field template. Used to determine the value of a new child
    // field.
    fieldTemplateValue: function(fieldTemplate) {
      // This logic might be brittle.

      const defaultValue = config.fieldTemplateDefaultValue(fieldTemplate);

      const match = config.fieldTemplateMatch(fieldTemplate);

      if (_.isUndefined(defaultValue) && !_.isUndefined(match)) {
        return utils.deepCopy(match);
      }

      return config.createDefaultValue(fieldTemplate);
    },

    // Match rule for a field template.
    fieldTemplateMatch: function(fieldTemplate) {
      return fieldTemplate.match;
    },

    // Determine if a field template has a single-line value.
    fieldTemplateIsSingleLine: function(fieldTemplate) {
      return (
        fieldTemplate.isSingleLine ||
        fieldTemplate.is_single_line ||
        fieldTemplate.type === 'single-line-string' ||
        fieldTemplate.type === 'SingleLineString'
      );
    },

    // Field helpers

    // Get an array of keys representing the path to a value.
    fieldValuePath: function(field) {
      let parentPath = [];

      if (field.parent) {
        parentPath = config.fieldValuePath(field.parent);
      }

      return parentPath.concat(field.key).filter(function(key) {
        return !_.isUndefined(key) && key !== '';
      });
    },

    // Clone a field with a different value.
    fieldWithValue: function(field, value) {
      return _.extend({}, field, { value });
    },

    fieldTypeName: delegateTo('fieldTemplateTypeName'),

    // Field is loading choices.
    fieldIsLoading: function(field) {
      return field.isLoading;
    },

    // Get the choices for a dropdown field.
    fieldChoices: function(field) {
      return config.normalizeChoices(field.choices);
    },

    // Get the choices for a pretty dropdown field.
    fieldPrettyChoices: function(field) {
      return config.normalizePrettyChoices(field.choices);
    },

    // Get a set of boolean choices for a field.
    fieldBooleanChoices: function(field) {
      const choices = config.fieldChoices(field);

      if (choices.length === 0) {
        return [
          {
            label: 'yes',
            value: true,
          },
          {
            label: 'no',
            value: false,
          },
        ];
      }

      return choices.map(function(choice) {
        if (_.isBoolean(choice.value)) {
          return choice;
        }
        return _.extend({}, choice, {
          value: config.coerceValueToBoolean(choice.value),
        });
      });
    },

    // Get a set of replacement choices for a field.
    fieldReplaceChoices: function(field) {
      return config.normalizeChoices(field.replaceChoices);
    },

    // The active selected choice could be unavailable in the current list of
    // choices. This provides the selected choice in that case.
    fieldSelectedChoice: function(field) {
      return field.selectedChoice || null;
    },

    // The active replace labels could be unavilable in the current list of
    // replace choices. This provides the currently used replace labels in
    // that case.
    fieldSelectedReplaceChoices: function(field) {
      return config.normalizeChoices(field.selectedReplaceChoices);
    },

    // Get a label for a field.
    fieldLabel: function(field) {
      return field.label;
    },

    // Get a placeholder (just a default display value, not a default value) for a field.
    fieldPlaceholder: function(field) {
      return field.placeholder;
    },

    // Get the help text for a field.
    fieldHelpText: function(field) {
      return (
        field.help_text_html ||
        field.help_text ||
        field.helpText ||
        field.helpTextHtml
      );
    },

    // Get whether or not a field is required.
    fieldIsRequired: function(field) {
      return field.required ? true : false;
    },

    fieldHasSearch: function(field) {
      return _.isUndefined(field.hasSearch) ? true : field.hasSearch;
    },

    // Determine if value for this field is not a leaf value.
    fieldHasValueChildren: function(field) {
      const defaultValue = config.createDefaultValue(field);

      if (_.isObject(defaultValue) || _.isArray(defaultValue)) {
        return true;
      }

      return false;
    },

    // Get the child field templates for this field.
    fieldChildFieldTemplates: function(field) {
      return field.fields || [];
    },

    // Get the field templates for each item of this field. (For dynamic children,
    // like arrays.)
    fieldItemFieldTemplates: function(field) {
      if (!field.itemFields) {
        return [{ type: 'text' }];
      }
      if (!_.isArray(field.itemFields)) {
        return [field.itemFields];
      }
      return field.itemFields;
    },

    // Template for a custom field for a dropdown.
    fieldCustomFieldTemplate: function(field) {
      return field.customField;
    },

    fieldIsSingleLine: delegateTo('fieldTemplateIsSingleLine'),

    // Get whether or not a field is collapsed.
    fieldIsCollapsed: function(field) {
      return field.collapsed ? true : false;
    },

    // Get wheter or not a field can be collapsed.
    fieldIsCollapsible: function(field) {
      return field.collapsible || !_.isUndefined(field.collapsed);
    },

    // Get the number of rows for a field.
    fieldRows: function(field) {
      return field.rows;
    },

    fieldErrors: function(field) {
      const errors = [];

      if (config.isKey(field.key)) {
        config.validateField(field, errors);
      }

      return errors;
    },

    fieldMatch: delegateTo('fieldTemplateMatch'),

    // Return true if field is read-only, or is a descendant of a read-only field
    fieldIsReadOnly: function(field) {
      if (field.readOnly) {
        return true;
      } else if (field.parent) {
        return config.fieldIsReadOnly(field.parent);
      } else {
        return false;
      }
    },

    // Return true if field is disabled, or is a descendant of a disabled field
    fieldIsDisabled: function(field) {
      if (field.disabled) {
        return true;
      } else if (field.parent) {
        return config.fieldIsDisabled(field.parent);
      } else {
        return false;
      }
    },

    // Return true if field has read-only controls. Useful for read-only controls used
    // in demo screenshot type effects, where you want it to look just like the real
    // thing, but read-only.
    fieldHasReadOnlyControls(field) {
      if (field.hasReadOnlyControls) {
        return true;
      } else if (field.parent) {
        return config.fieldHasReadOnlyControls(field.parent);
      } else {
        return false;
      }
    },

    // Other helpers

    // Convert an object into an array of key / value objects
    objectToAssocList(obj) {
      const array = [];
      _.each(Object.keys(obj), key => {
        array.push({ key, value: obj[key] });
      });
      return array;
    },

    // Convert an array of key / value objects to an object
    assocListToObject(assocList) {
      const obj = {};
      _.each(assocList, row => {
        obj[row.key] = row.value;
      });
      return obj;
    },

    // Convert a key to a nice human-readable version.
    humanize: function(property = '') {
      property = String(property).replace(/\{\{/g, '');
      property = property.replace(/\}\}/g, '');
      return property.replace(/_/g, ' ').replace(/(\w+)/g, function(match) {
        return match.charAt(0).toUpperCase() + match.slice(1);
      });
    },

    tokenize(text) {
      text = String(text);
      if (text === '') {
        return [];
      }

      const regexp = /(\{\{|\}\})/;
      const parts = text.split(regexp);

      const tokens = [];
      let inTag = false;
      parts.forEach(function(part) {
        if (part === '{{') {
          inTag = true;
        } else if (part === '}}') {
          inTag = false;
        } else if (inTag) {
          tokens.push({ type: 'tag', value: part });
        } else {
          tokens.push({ type: 'string', value: part });
        }
      });
      return tokens;
    },

    // Normalize some choices for a drop-down.
    normalizeChoices: function(choices) {
      if (!choices) {
        return [];
      }

      // Convert comma separated string to array of strings.
      if (_.isString(choices)) {
        choices = choices.split(',');
      }

      // Convert object to array of objects with `value` and `label` properties.
      if (!_.isArray(choices) && _.isObject(choices)) {
        choices = Object.keys(choices).map(function(key) {
          return {
            value: key,
            label: choices[key],
          };
        });
      }

      // Copy the array of choices so we can manipulate them.
      choices = choices.slice(0);

      // Array of choice arrays should be flattened.
      choices = _.compact(_.flatten(choices));

      const choicesWithLabels = choices.map(function(choice) {
        // Convert any string choices to objects with `value` and `label`
        // properties.
        const maybeStringChoice = _.isString(choice)
          ? {
              value: choice,
              label: config.humanize(choice),
            }
          : choice;

        return !maybeStringChoice.label
          ? Object.assign({}, maybeStringChoice, {
              label: config.humanize(choice.value),
            })
          : maybeStringChoice;
      });

      return choicesWithLabels;
    },

    // Normalize choices for a pretty drop down, with 'sample' values
    normalizePrettyChoices: function(choices) {
      if (!_.isArray(choices) && _.isObject(choices)) {
        choices = Object.keys(choices).map(function(key) {
          return {
            value: key,
            label: choices[key],
            sample: key,
          };
        });
      }

      return config.normalizeChoices(choices);
    },

    // Coerce a value to a boolean
    coerceValueToBoolean: function(value) {
      if (!_.isString(value)) {
        // Just use the default truthiness.
        return value ? true : false;
      }
      value = value.toLowerCase();
      if (
        value === '' ||
        value === 'no' ||
        value === 'off' ||
        value === 'false' ||
        value === '0'
      ) {
        return false;
      }
      return true;
    },

    // Determine if a value is a valid key.
    isKey: function(key) {
      return (_.isNumber(key) && key >= 0) || (_.isString(key) && key !== '');
    },

    // Fast way to check for empty object.
    isEmptyObject: function(obj) {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          return false;
        }
      }
      return true;
    },

    actionChoiceLabel: function(action) {
      return utils.capitalize(action).replace(/[-]/g, ' ');
    },

    customChoiceDisplayValue: function(customChoice) {
      return customChoice && customChoice.label;
    },

    sortChoices: function(choices) {
      return choices;
    },

    isSearchStringInChoice: function(searchString, choice) {
      return (
        choice.label &&
        choice.label.toLowerCase().indexOf(searchString.toLowerCase()) > -1
      );
    },

    isRemovalOfLastArrayItemAllowed(/* field */) {
      return true;
    },

    isRemovalOfLastAssocListItemAllowed(/* field */) {
      return true;
    },

    codeMirror() {
      if (typeof window.CodeMirror !== 'undefined') {
        return window.CodeMirror;
      }
      return require('codemirror');
    },

    getChoicesMaxHeightRatio() {
      return 1;
    },
  };
}
