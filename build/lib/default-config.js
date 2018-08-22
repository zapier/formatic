// # default-config

/*
This is the default configuration plugin for formatic. To change formatic's
behavior, just create your own plugin function that returns an object with
methods you want to add or override.
*/

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (config) {

  var delegateTo = _utils2.default.delegator(config);

  return {

    // Field element factories. Create field elements.

    createElement_Fields: _react2.default.createFactory(_fields2.default),

    createElement_GroupedFields: _react2.default.createFactory(_groupedFields2.default),

    createElement_String: _react2.default.createFactory(_string2.default),

    createElement_SingleLineString: _react2.default.createFactory(_singleLineString2.default),

    createElement_Password: _react2.default.createFactory(_password2.default),

    createElement_Select: _react2.default.createFactory(_select2.default),

    createElement_PrettySelect: _react2.default.createFactory(_prettySelect2.default),

    createElement_Boolean: _react2.default.createFactory(_boolean2.default),

    createElement_PrettyBoolean: _react2.default.createFactory(_prettyBoolean2.default),

    createElement_CheckboxBoolean: _react2.default.createFactory(_checkboxBoolean2.default),

    createElement_Code: _react2.default.createFactory(_code2.default),

    createElement_PrettyText: _react2.default.createFactory(_prettyText2.default),

    createElement_PrettyTag: _react2.default.createFactory(_prettyTag2.default),

    createElement_Array: _react2.default.createFactory(_array2.default),

    createElement_CheckboxArray: _react2.default.createFactory(_checkboxArray2.default),

    createElement_Object: _react2.default.createFactory(_object2.default),

    createElement_AssocList: _react2.default.createFactory(_assocList2.default),

    createElement_Json: _react2.default.createFactory(_json2.default),

    createElement_UnknownField: _react2.default.createFactory(_unknown2.default),

    createElement_Copy: _react2.default.createFactory(_copy2.default),

    // Other element factories. Create helper elements used by field components.

    createElement_Field: _react2.default.createFactory(_field2.default),

    createElement_Label: _react2.default.createFactory(_label2.default),

    createElement_Help: _react2.default.createFactory(_help2.default),

    createElement_Choices: _react2.default.createFactory(_choices2.default),

    createElement_ChoicesItem: _react2.default.createFactory(_choicesItem2.default),

    createElement_Choice: _react2.default.createFactory(_choice2.default),

    createElement_ChoicesSearch: _react2.default.createFactory(_choicesSearch2.default),

    createElement_LoadingChoices: _react2.default.createFactory(_loadingChoices2.default),

    createElement_LoadingChoice: _react2.default.createFactory(_loadingChoice2.default),

    createElement_ArrayControl: _react2.default.createFactory(_arrayControl2.default),

    createElement_ArrayItemControl: _react2.default.createFactory(_arrayItemControl2.default),

    createElement_ArrayItemValue: _react2.default.createFactory(_arrayItemValue2.default),

    createElement_ArrayItem: _react2.default.createFactory(_arrayItem2.default),

    createElement_FieldTemplateChoices: _react2.default.createFactory(_fieldTemplateChoices2.default),

    createElement_AddItem: _react2.default.createFactory(_addItem2.default),

    createElement_RemoveItem: _react2.default.createFactory(_removeItem2.default),

    createElement_MoveItemForward: _react2.default.createFactory(_moveItemForward2.default),

    createElement_MoveItemBack: _react2.default.createFactory(_moveItemBack2.default),

    createElement_AssocListControl: _react2.default.createFactory(_assocListControl2.default),

    createElement_AssocListItemControl: _react2.default.createFactory(_assocListItemControl2.default),

    createElement_AssocListItemValue: _react2.default.createFactory(_assocListItemValue2.default),

    createElement_AssocListItemKey: _react2.default.createFactory(_assocListItemKey2.default),

    createElement_AssocListItem: _react2.default.createFactory(_assocListItem2.default),

    createElement_SelectValue: _react2.default.createFactory(_selectValue2.default),

    createElement_PrettySelectValue: _react2.default.createFactory(_prettySelectValue2.default),

    createElement_PrettySelectInput: _react2.default.createFactory(_prettySelectInput2.default),

    createElement_Sample: _react2.default.createFactory(_sample2.default),

    createElement_InsertButton: _react2.default.createFactory(_insertButton2.default),

    createElement_ChoiceSectionHeader: _react2.default.createFactory(_choiceSectionHeader2.default),

    createElement_PrettyTextInput: _react2.default.createFactory(_prettyTextInputDraftJs2.default),

    // Field default value factories. Give a default value for a specific type.

    createDefaultValue_String: function createDefaultValue_String() /* fieldTemplate */{
      return '';
    },

    createDefaultValue_Object: function createDefaultValue_Object() /* fieldTemplate */{
      return {};
    },

    createDefaultValue_Array: function createDefaultValue_Array() /* fieldTemplate */{
      return [];
    },

    createDefaultValue_Boolean: function createDefaultValue_Boolean() /* fieldTemplate */{
      return false;
    },

    createDefaultValue_AssocList: delegateTo('createDefaultValue_Array'),

    createDefaultValue_Fields: delegateTo('createDefaultValue_Object'),

    createDefaultValue_SingleLineString: delegateTo('createDefaultValue_String'),

    createDefaultValue_Select: delegateTo('createDefaultValue_String'),

    createDefaultValue_Json: delegateTo('createDefaultValue_Object'),

    createDefaultValue_CheckboxArray: delegateTo('createDefaultValue_Array'),

    createDefaultValue_CheckboxBoolean: delegateTo('createDefaultValue_Boolean'),

    // Field value coercers. Coerce a value into a value appropriate for a specific type.

    coerceValue_String: function coerceValue_String(fieldTemplate, value) {
      if (_undash2.default.isString(value)) {
        return value;
      }
      if (_undash2.default.isUndefined(value) || value === null) {
        return '';
      }
      return JSON.stringify(value);
    },

    coerceValue_Object: function coerceValue_Object(fieldTemplate, value) {
      if (!_undash2.default.isObject(value)) {
        return {};
      }
      return value;
    },

    coerceValue_AssocList: function coerceValue_AssocList(fieldTemplate, value) {
      if (_undash2.default.isArray(value)) {
        return value;
      }
      if (_undash2.default.isObject(value)) {
        return config.objectToAssocList(value);
      }
      return [value];
    },

    coerceValue_Array: function coerceValue_Array(fieldTemplate, value) {
      if (!_undash2.default.isArray(value)) {
        return [value];
      }
      return value;
    },

    coerceValue_Boolean: function coerceValue_Boolean(fieldTemplate, value) {
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

    createChildFields_Array: function createChildFields_Array(field) {

      return field.value.map(function (arrayItem, i) {
        var childFieldTemplate = config.childFieldTemplateForValue(field, arrayItem);

        var childField = config.createChildField(field, {
          fieldTemplate: childFieldTemplate, key: i, fieldIndex: i, value: arrayItem
        });

        return childField;
      });
    },

    createChildFields_AssocList: function createChildFields_AssocList(field) {

      return field.value.map(function (row, i) {
        var childFieldTemplate = config.childFieldTemplateForValue(field, row.value);

        var childField = config.createChildField(field, {
          fieldTemplate: childFieldTemplate, key: i, fieldIndex: i, value: row.value
        });

        return childField;
      });
    },

    createChildFields_Object: function createChildFields_Object(field) {

      return Object.keys(field.value).map(function (key, i) {
        var childFieldTemplate = config.childFieldTemplateForValue(field, field.value[key]);

        var childField = config.createChildField(field, {
          fieldTemplate: childFieldTemplate, key: key, fieldIndex: i, value: field.value[key]
        });

        return childField;
      });
    },

    // Check if there is a factory for the name.
    hasElementFactory: function hasElementFactory(name) {

      return config['createElement_' + name] ? true : false;
    },

    // Create an element given a name, props, and children.
    createElement: function createElement(name, props, children) {

      if (!props.config) {
        props = _undash2.default.extend({}, props, { config: config });
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
    createFieldElement: function createFieldElement(props) {

      var name = config.fieldTypeName(props.field);

      if (config.hasElementFactory(name)) {
        return config.createElement(name, props);
      }

      return config.createElement('UnknownField', props);
    },

    // Render the root formatic component
    renderFormaticComponent: function renderFormaticComponent(component) {

      var props = component.props;
      var field = config.createRootField(props);

      return _react2.default.createElement(
        'div',
        { className: 'formatic' },
        config.createFieldElement({ field: field, onChange: component.onChange, onAction: component.onAction })
      );
    },

    // Render any component.
    renderComponent: function renderComponent(component) {

      var name = component.constructor.displayName;

      if (config['renderComponent_' + name]) {
        return config['renderComponent_' + name](component);
      }

      return component.renderDefault();
    },

    // Render field components.
    renderFieldComponent: function renderFieldComponent(component) {

      return config.renderComponent(component);
    },

    // Normalize an element name.
    elementName: function elementName(name) {
      return _utils2.default.dashToPascal(name);
    },

    // Type aliases.

    alias_Dict: 'Object',

    alias_Bool: 'Boolean',

    alias_PrettyTextarea: 'PrettyText',

    alias_SingleLineString: function alias_SingleLineString(fieldTemplate) {
      if (fieldTemplate.replaceChoices) {
        return 'PrettyText';
      } else if (fieldTemplate.choices) {
        return 'Select';
      }
      return 'SingleLineString';
    },

    alias_String: function alias_String(fieldTemplate) {

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
    inflateFieldValue: function inflateFieldValue(field, fieldHandler) {

      if (fieldHandler) {
        var stop = fieldHandler(field);
        if (stop === false) {
          return undefined;
        }
      }

      if (config.fieldHasValueChildren(field)) {
        var value = _undash2.default.clone(field.value);
        var childFields = config.createChildFields(field);
        childFields.forEach(function (childField) {
          if (config.isKey(childField.key)) {
            value[childField.key] = config.inflateFieldValue(childField, fieldHandler);
          } else {
            // a child with no key might have sub-children with keys
            var obj = config.inflateFieldValue(childField, fieldHandler);
            _undash2.default.extend(value, obj);
          }
        });
        return value;
      } else {
        return field.value;
      }
    },

    // Initialize the root field.
    initRootField: function initRootField() /* field, props */{},

    // Initialize every field.
    initField: function initField() /* field */{},

    // If an array of field templates are passed in, this method is used to
    // wrap the fields inside a single root field template.
    wrapFieldTemplates: function wrapFieldTemplates(fieldTemplates) {
      return {
        type: 'fields',
        plain: true,
        fields: fieldTemplates
      };
    },

    // Given the props that are passed in, create the root field.
    createRootField: function createRootField(props) {

      var fieldTemplate = props.fieldTemplate || props.fieldTemplates || props.field || props.fields;
      var value = props.value;

      if (!fieldTemplate) {
        fieldTemplate = config.createFieldTemplateFromValue(value);
      }

      if (_undash2.default.isArray(fieldTemplate)) {
        fieldTemplate = config.wrapFieldTemplates(fieldTemplate);
      }

      var field = _undash2.default.extend({}, fieldTemplate, { rawFieldTemplate: fieldTemplate });
      if (config.hasValue(fieldTemplate, value)) {
        field.value = config.coerceValue(fieldTemplate, value);
      } else {
        field.value = config.createDefaultValue(fieldTemplate);
      }

      config.initRootField(field, props);
      config.initField(field);

      if (value === null || config.isEmptyObject(value) || _undash2.default.isUndefined(value)) {
        field.value = config.inflateFieldValue(field);
      }

      if (props.readOnly) {
        field.readOnly = true;
      }

      return field;
    },

    // Given the props that are passed in, create the value that will be displayed
    // by all the components.
    createRootValue: function createRootValue(props, fieldHandler) {

      var field = config.createRootField(props);

      return config.inflateFieldValue(field, fieldHandler);
    },

    validateRootValue: function validateRootValue(props) {

      var errors = [];

      config.createRootValue(props, function (field) {
        var fieldErrors = config.fieldErrors(field);
        if (fieldErrors.length > 0) {
          errors.push({
            path: config.fieldValuePath(field),
            errors: fieldErrors
          });
        }
      });

      return errors;
    },

    isValidRootValue: function isValidRootValue(props) {

      var isValid = true;

      config.createRootValue(props, function (field) {
        if (config.fieldErrors(field).length > 0) {
          isValid = false;
          return false;
        }

        return undefined;
      });

      return isValid;
    },

    validateField: function validateField(field, errors) {

      if (field.value === undefined || field.value === '') {
        if (config.fieldIsRequired(field)) {
          errors.push({
            type: 'required'
          });
        }
      }
    },

    cssTransitionWrapper: function cssTransitionWrapper() {
      for (var _len = arguments.length, children = Array(_len), _key = 0; _key < _len; _key++) {
        children[_key] = arguments[_key];
      }

      return _react2.default.createElement(
        _reactTransitionGroup.CSSTransitionGroup,
        {
          transitionName: 'reveal',
          transitionEnterTimeout: 100,
          transitionLeaveTimeout: 100
        },
        children
      );
    },

    // Create dynamic child fields for a field.
    createChildFields: function createChildFields(field) {

      var typeName = config.fieldTypeName(field);

      if (config['createChildFields_' + typeName]) {
        return config['createChildFields_' + typeName](field);
      }

      return config.fieldChildFieldTemplates(field).map(function (childField, i) {
        var childValue = field.value;
        if (config.isKey(childField.key)) {
          childValue = field.value[childField.key];
        }
        return config.createChildField(field, {
          fieldTemplate: childField, key: childField.key, fieldIndex: i, value: childValue
        });
      });
    },

    // Create a single child field for a parent field.
    createChildField: function createChildField(parentField, options) {

      var childValue = options.value;

      var childField = _undash2.default.extend({}, options.fieldTemplate, {
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
    createNewChildFieldValue: function createNewChildFieldValue(parentField, itemFieldIndex) {

      var childFieldTemplate = config.fieldItemFieldTemplates(parentField)[itemFieldIndex];

      var newValue = config.fieldTemplateValue(childFieldTemplate);

      // Just a placeholder key. Should not be important.
      var key = '__unknown_key__';

      if (_undash2.default.isArray(parentField.value)) {
        // Just a placeholder position for an array.
        key = parentField.value.length;
      }

      // Just a placeholder field index. Should not be important.
      var fieldIndex = 0;
      if (_undash2.default.isObject(parentField.value)) {
        fieldIndex = Object.keys(parentField.value).length;
      }

      var childField = config.createChildField(parentField, {
        fieldTemplate: childFieldTemplate, key: key, fieldIndex: fieldIndex, value: newValue
      });

      newValue = config.inflateFieldValue(childField);

      return newValue;
    },

    // Given a value, create a field template for that value.
    createFieldTemplateFromValue: function createFieldTemplateFromValue(value) {

      var field = {
        type: 'json'
      };
      if (_undash2.default.isString(value)) {
        field = {
          type: 'string'
        };
      } else if (_undash2.default.isNumber(value)) {
        field = {
          type: 'number'
        };
      } else if (_undash2.default.isBoolean(value)) {
        field = {
          type: 'boolean'
        };
      } else if (_undash2.default.isArray(value)) {
        var arrayItemFields = value.map(function (childValue, i) {
          var childField = config.createFieldTemplateFromValue(childValue);
          childField.key = i;
          return childField;
        });
        field = {
          type: 'array',
          fields: arrayItemFields
        };
      } else if (_undash2.default.isObject(value)) {
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
      } else if (_undash2.default.isNull(value)) {
        field = {
          type: 'json'
        };
      }
      return field;
    },

    // Default value factory

    createDefaultValue: function createDefaultValue(fieldTemplate) {

      var defaultValue = config.fieldTemplateDefaultValue(fieldTemplate);

      if (!_undash2.default.isUndefined(defaultValue)) {
        return _utils2.default.deepCopy(defaultValue);
      }

      var typeName = config.fieldTypeName(fieldTemplate);

      if (config['createDefaultValue_' + typeName]) {
        return config['createDefaultValue_' + typeName](fieldTemplate);
      }

      return '';
    },

    // Field helpers

    // Determine if a value "exists".
    hasValue: function hasValue(fieldTemplate, value) {
      return value !== null && !_undash2.default.isUndefined(value);
    },

    // Coerce a value to value appropriate for a field.
    coerceValue: function coerceValue(field, value) {

      var typeName = config.fieldTypeName(field);

      if (config['coerceValue_' + typeName]) {
        return config['coerceValue_' + typeName](field, value);
      }

      return value;
    },

    // Given a field and a child value, find the appropriate field template for
    // that child value.
    childFieldTemplateForValue: function childFieldTemplateForValue(field, childValue) {

      var fieldTemplate;

      var fieldTemplates = config.fieldItemFieldTemplates(field);

      fieldTemplate = _undash2.default.find(fieldTemplates, function (itemFieldTemplate) {
        return config.matchesFieldTemplateToValue(itemFieldTemplate, childValue);
      });

      if (fieldTemplate) {
        return fieldTemplate;
      } else {
        return config.createFieldTemplateFromValue(childValue);
      }
    },

    // Determine if a value is a match for a field template.
    matchesFieldTemplateToValue: function matchesFieldTemplateToValue(fieldTemplate, value) {
      var match = fieldTemplate.match;
      if (!match) {
        return true;
      }
      return _undash2.default.every(Object.keys(match), function (key) {
        return _undash2.default.isEqual(match[key], value[key]);
      });
    },

    // Field template helpers

    // Normalized (PascalCase) type name for a field.
    fieldTemplateTypeName: function fieldTemplateTypeName(fieldTemplate) {

      var typeName = _utils2.default.dashToPascal(fieldTemplate.type || 'undefined');

      var alias = config['alias_' + typeName];

      if (alias) {
        if (_undash2.default.isFunction(alias)) {
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
    fieldTemplateDefaultValue: function fieldTemplateDefaultValue(fieldTemplate) {

      if (!_undash2.default.isUndefined(fieldTemplate.default)) {
        return config.coerceValue(fieldTemplate, fieldTemplate.default);
      }

      return fieldTemplate.default;
    },

    // Value for a field template. Used to determine the value of a new child
    // field.
    fieldTemplateValue: function fieldTemplateValue(fieldTemplate) {

      // This logic might be brittle.

      var defaultValue = config.fieldTemplateDefaultValue(fieldTemplate);

      var match = config.fieldTemplateMatch(fieldTemplate);

      if (_undash2.default.isUndefined(defaultValue) && !_undash2.default.isUndefined(match)) {
        return _utils2.default.deepCopy(match);
      }

      return config.createDefaultValue(fieldTemplate);
    },

    // Match rule for a field template.
    fieldTemplateMatch: function fieldTemplateMatch(fieldTemplate) {
      return fieldTemplate.match;
    },

    // Determine if a field template has a single-line value.
    fieldTemplateIsSingleLine: function fieldTemplateIsSingleLine(fieldTemplate) {
      return fieldTemplate.isSingleLine || fieldTemplate.is_single_line || fieldTemplate.type === 'single-line-string' || fieldTemplate.type === 'SingleLineString';
    },

    // Field helpers

    // Get an array of keys representing the path to a value.
    fieldValuePath: function fieldValuePath(field) {

      var parentPath = [];

      if (field.parent) {
        parentPath = config.fieldValuePath(field.parent);
      }

      return parentPath.concat(field.key).filter(function (key) {
        return !_undash2.default.isUndefined(key) && key !== '';
      });
    },

    // Clone a field with a different value.
    fieldWithValue: function fieldWithValue(field, value) {
      return _undash2.default.extend({}, field, { value: value });
    },

    fieldTypeName: delegateTo('fieldTemplateTypeName'),

    // Field is loading choices.
    fieldIsLoading: function fieldIsLoading(field) {
      return field.isLoading;
    },

    // Get the choices for a dropdown field.
    fieldChoices: function fieldChoices(field) {

      return config.normalizeChoices(field.choices);
    },

    // Get the choices for a pretty dropdown field.
    fieldPrettyChoices: function fieldPrettyChoices(field) {

      return config.normalizePrettyChoices(field.choices);
    },

    // Get a set of boolean choices for a field.
    fieldBooleanChoices: function fieldBooleanChoices(field) {

      var choices = config.fieldChoices(field);

      if (choices.length === 0) {
        return [{
          label: 'yes',
          value: true
        }, {
          label: 'no',
          value: false
        }];
      }

      return choices.map(function (choice) {
        if (_undash2.default.isBoolean(choice.value)) {
          return choice;
        }
        return _undash2.default.extend({}, choice, {
          value: config.coerceValueToBoolean(choice.value)
        });
      });
    },

    // Get a set of replacement choices for a field.
    fieldReplaceChoices: function fieldReplaceChoices(field) {

      return config.normalizeChoices(field.replaceChoices);
    },

    // The active selected choice could be unavailable in the current list of
    // choices. This provides the selected choice in that case.
    fieldSelectedChoice: function fieldSelectedChoice(field) {

      return field.selectedChoice || null;
    },

    // The active replace labels could be unavilable in the current list of
    // replace choices. This provides the currently used replace labels in
    // that case.
    fieldSelectedReplaceChoices: function fieldSelectedReplaceChoices(field) {

      return config.normalizeChoices(field.selectedReplaceChoices);
    },

    // Get a label for a field.
    fieldLabel: function fieldLabel(field) {
      return field.label;
    },

    // Get a placeholder (just a default display value, not a default value) for a field.
    fieldPlaceholder: function fieldPlaceholder(field) {
      return field.placeholder;
    },

    // Get the help text for a field.
    fieldHelpText: function fieldHelpText(field) {
      return field.help_text_html || field.help_text || field.helpText || field.helpTextHtml;
    },

    // Get whether or not a field is required.
    fieldIsRequired: function fieldIsRequired(field) {
      return field.required ? true : false;
    },

    fieldHasSearch: function fieldHasSearch(field) {
      return _undash2.default.isUndefined(field.hasSearch) ? true : field.hasSearch;
    },

    // Determine if value for this field is not a leaf value.
    fieldHasValueChildren: function fieldHasValueChildren(field) {

      var defaultValue = config.createDefaultValue(field);

      if (_undash2.default.isObject(defaultValue) || _undash2.default.isArray(defaultValue)) {
        return true;
      }

      return false;
    },

    // Get the child field templates for this field.
    fieldChildFieldTemplates: function fieldChildFieldTemplates(field) {
      return field.fields || [];
    },

    // Get the field templates for each item of this field. (For dynamic children,
    // like arrays.)
    fieldItemFieldTemplates: function fieldItemFieldTemplates(field) {
      if (!field.itemFields) {
        return [{ type: 'text' }];
      }
      if (!_undash2.default.isArray(field.itemFields)) {
        return [field.itemFields];
      }
      return field.itemFields;
    },

    // Template for a custom field for a dropdown.
    fieldCustomFieldTemplate: function fieldCustomFieldTemplate(field) {
      return field.customField;
    },

    fieldIsSingleLine: delegateTo('fieldTemplateIsSingleLine'),

    // Get whether or not a field is collapsed.
    fieldIsCollapsed: function fieldIsCollapsed(field) {
      return field.collapsed ? true : false;
    },

    // Get wheter or not a field can be collapsed.
    fieldIsCollapsible: function fieldIsCollapsible(field) {
      return field.collapsible || !_undash2.default.isUndefined(field.collapsed);
    },

    // Get the number of rows for a field.
    fieldRows: function fieldRows(field) {
      return field.rows;
    },

    fieldErrors: function fieldErrors(field) {

      var errors = [];

      if (config.isKey(field.key)) {
        config.validateField(field, errors);
      }

      return errors;
    },

    fieldMatch: delegateTo('fieldTemplateMatch'),

    // Return true if field is read-only, or is a descendant of a read-only field
    fieldIsReadOnly: function fieldIsReadOnly(field) {
      if (field.readOnly) {
        return true;
      } else if (field.parent) {
        return config.fieldIsReadOnly(field.parent);
      } else {
        return false;
      }
    },

    // Return true if field has read-only controls. Useful for read-only controls used
    // in demo screenshot type effects, where you want it to look just like the real
    // thing, but read-only.
    fieldHasReadOnlyControls: function fieldHasReadOnlyControls(field) {
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
    objectToAssocList: function objectToAssocList(obj) {
      var array = [];
      _undash2.default.each(Object.keys(obj), function (key) {
        array.push({ key: key, value: obj[key] });
      });
      return array;
    },


    // Convert an array of key / value objects to an object
    assocListToObject: function assocListToObject(assocList) {
      var obj = {};
      _undash2.default.each(assocList, function (row) {
        obj[row.key] = row.value;
      });
      return obj;
    },


    // Convert a key to a nice human-readable version.
    humanize: function humanize() {
      var property = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      property = String(property).replace(/\{\{/g, '');
      property = property.replace(/\}\}/g, '');
      return property.replace(/_/g, ' ').replace(/(\w+)/g, function (match) {
        return match.charAt(0).toUpperCase() + match.slice(1);
      });
    },

    tokenize: function tokenize(text) {
      text = String(text);
      if (text === '') {
        return [];
      }

      var regexp = /(\{\{|\}\})/;
      var parts = text.split(regexp);

      var tokens = [];
      var inTag = false;
      parts.forEach(function (part) {
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
    normalizeChoices: function normalizeChoices(choices) {

      if (!choices) {
        return [];
      }

      // Convert comma separated string to array of strings.
      if (_undash2.default.isString(choices)) {
        choices = choices.split(',');
      }

      // Convert object to array of objects with `value` and `label` properties.
      if (!_undash2.default.isArray(choices) && _undash2.default.isObject(choices)) {
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
      choices = _undash2.default.compact(_undash2.default.flatten(choices));

      var choicesWithLabels = choices.map(function (choice) {
        // Convert any string choices to objects with `value` and `label`
        // properties.
        var maybeStringChoice = _undash2.default.isString(choice) ? {
          value: choice,
          label: config.humanize(choice)
        } : choice;

        return !maybeStringChoice.label ? Object.assign({}, maybeStringChoice, { label: config.humanize(choice.value) }) : maybeStringChoice;
      });

      return choicesWithLabels;
    },

    // Normalize choices for a pretty drop down, with 'sample' values
    normalizePrettyChoices: function normalizePrettyChoices(choices) {
      if (!_undash2.default.isArray(choices) && _undash2.default.isObject(choices)) {
        choices = Object.keys(choices).map(function (key) {
          return {
            value: key,
            label: choices[key],
            sample: key
          };
        });
      }

      return config.normalizeChoices(choices);
    },

    // Coerce a value to a boolean
    coerceValueToBoolean: function coerceValueToBoolean(value) {
      if (!_undash2.default.isString(value)) {
        // Just use the default truthiness.
        return value ? true : false;
      }
      value = value.toLowerCase();
      if (value === '' || value === 'no' || value === 'off' || value === 'false' || value === '0') {
        return false;
      }
      return true;
    },

    // Determine if a value is a valid key.
    isKey: function isKey(key) {
      return _undash2.default.isNumber(key) && key >= 0 || _undash2.default.isString(key) && key !== '';
    },

    // Fast way to check for empty object.
    isEmptyObject: function isEmptyObject(obj) {
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          return false;
        }
      }
      return true;
    },

    actionChoiceLabel: function actionChoiceLabel(action) {
      return _utils2.default.capitalize(action).replace(/[-]/g, ' ');
    },

    sortChoices: function sortChoices(choices) {
      return choices;
    },

    isSearchStringInChoice: function isSearchStringInChoice(searchString, choice) {
      return choice.label && choice.label.toLowerCase().indexOf(searchString.toLowerCase()) > -1;
    },

    isRemovalOfLastArrayItemAllowed: function isRemovalOfLastArrayItemAllowed() /* field */{
      return true;
    },
    isRemovalOfLastAssocListItemAllowed: function isRemovalOfLastAssocListItemAllowed() /* field */{
      return true;
    }
  };
};

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactTransitionGroup = require('react-transition-group');

var _undash = require('./undash');

var _undash2 = _interopRequireDefault(_undash);

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _fields = require('./components/fields/fields');

var _fields2 = _interopRequireDefault(_fields);

var _groupedFields = require('./components/fields/grouped-fields');

var _groupedFields2 = _interopRequireDefault(_groupedFields);

var _string = require('./components/fields/string');

var _string2 = _interopRequireDefault(_string);

var _singleLineString = require('./components/fields/single-line-string');

var _singleLineString2 = _interopRequireDefault(_singleLineString);

var _password = require('./components/fields/password');

var _password2 = _interopRequireDefault(_password);

var _select = require('./components/fields/select');

var _select2 = _interopRequireDefault(_select);

var _prettySelect = require('./components/fields/pretty-select');

var _prettySelect2 = _interopRequireDefault(_prettySelect);

var _boolean = require('./components/fields/boolean');

var _boolean2 = _interopRequireDefault(_boolean);

var _prettyBoolean = require('./components/fields/pretty-boolean');

var _prettyBoolean2 = _interopRequireDefault(_prettyBoolean);

var _checkboxBoolean = require('./components/fields/checkbox-boolean');

var _checkboxBoolean2 = _interopRequireDefault(_checkboxBoolean);

var _code = require('./components/fields/code');

var _code2 = _interopRequireDefault(_code);

var _prettyText = require('./components/fields/pretty-text2');

var _prettyText2 = _interopRequireDefault(_prettyText);

var _prettyTag = require('./components/helpers/pretty-tag');

var _prettyTag2 = _interopRequireDefault(_prettyTag);

var _array = require('./components/fields/array');

var _array2 = _interopRequireDefault(_array);

var _checkboxArray = require('./components/fields/checkbox-array');

var _checkboxArray2 = _interopRequireDefault(_checkboxArray);

var _object = require('./components/fields/object');

var _object2 = _interopRequireDefault(_object);

var _assocList = require('./components/fields/assoc-list');

var _assocList2 = _interopRequireDefault(_assocList);

var _json = require('./components/fields/json');

var _json2 = _interopRequireDefault(_json);

var _unknown = require('./components/fields/unknown');

var _unknown2 = _interopRequireDefault(_unknown);

var _copy = require('./components/fields/copy');

var _copy2 = _interopRequireDefault(_copy);

var _field = require('./components/helpers/field');

var _field2 = _interopRequireDefault(_field);

var _label = require('./components/helpers/label');

var _label2 = _interopRequireDefault(_label);

var _help = require('./components/helpers/help');

var _help2 = _interopRequireDefault(_help);

var _choices = require('./components/helpers/choices');

var _choices2 = _interopRequireDefault(_choices);

var _choicesItem = require('./components/helpers/choices-item');

var _choicesItem2 = _interopRequireDefault(_choicesItem);

var _choice = require('./components/helpers/choice');

var _choice2 = _interopRequireDefault(_choice);

var _choicesSearch = require('./components/helpers/choices-search');

var _choicesSearch2 = _interopRequireDefault(_choicesSearch);

var _loadingChoices = require('./components/helpers/loading-choices');

var _loadingChoices2 = _interopRequireDefault(_loadingChoices);

var _loadingChoice = require('./components/helpers/loading-choice');

var _loadingChoice2 = _interopRequireDefault(_loadingChoice);

var _arrayControl = require('./components/helpers/array-control');

var _arrayControl2 = _interopRequireDefault(_arrayControl);

var _arrayItemControl = require('./components/helpers/array-item-control');

var _arrayItemControl2 = _interopRequireDefault(_arrayItemControl);

var _arrayItemValue = require('./components/helpers/array-item-value');

var _arrayItemValue2 = _interopRequireDefault(_arrayItemValue);

var _arrayItem = require('./components/helpers/array-item');

var _arrayItem2 = _interopRequireDefault(_arrayItem);

var _fieldTemplateChoices = require('./components/helpers/field-template-choices');

var _fieldTemplateChoices2 = _interopRequireDefault(_fieldTemplateChoices);

var _addItem = require('./components/helpers/add-item');

var _addItem2 = _interopRequireDefault(_addItem);

var _removeItem = require('./components/helpers/remove-item');

var _removeItem2 = _interopRequireDefault(_removeItem);

var _moveItemForward = require('./components/helpers/move-item-forward');

var _moveItemForward2 = _interopRequireDefault(_moveItemForward);

var _moveItemBack = require('./components/helpers/move-item-back');

var _moveItemBack2 = _interopRequireDefault(_moveItemBack);

var _assocListControl = require('./components/helpers/assoc-list-control');

var _assocListControl2 = _interopRequireDefault(_assocListControl);

var _assocListItemControl = require('./components/helpers/assoc-list-item-control');

var _assocListItemControl2 = _interopRequireDefault(_assocListItemControl);

var _assocListItemValue = require('./components/helpers/assoc-list-item-value');

var _assocListItemValue2 = _interopRequireDefault(_assocListItemValue);

var _assocListItemKey = require('./components/helpers/assoc-list-item-key');

var _assocListItemKey2 = _interopRequireDefault(_assocListItemKey);

var _assocListItem = require('./components/helpers/assoc-list-item');

var _assocListItem2 = _interopRequireDefault(_assocListItem);

var _selectValue = require('./components/helpers/select-value');

var _selectValue2 = _interopRequireDefault(_selectValue);

var _prettySelectValue = require('./components/helpers/pretty-select-value');

var _prettySelectValue2 = _interopRequireDefault(_prettySelectValue);

var _prettySelectInput = require('./components/helpers/pretty-select-input');

var _prettySelectInput2 = _interopRequireDefault(_prettySelectInput);

var _sample = require('./components/helpers/sample');

var _sample2 = _interopRequireDefault(_sample);

var _insertButton = require('./components/helpers/insert-button');

var _insertButton2 = _interopRequireDefault(_insertButton);

var _choiceSectionHeader = require('./components/helpers/choice-section-header');

var _choiceSectionHeader2 = _interopRequireDefault(_choiceSectionHeader);

var _prettyTextInputDraftJs = require('./components/helpers/pretty-text-input-draft-js');

var _prettyTextInputDraftJs2 = _interopRequireDefault(_prettyTextInputDraftJs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }