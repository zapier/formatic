var _ = require('underscore');

module.exports = function (config) {

  var initField = config.initField;

  config.findFieldTemplate = function (field, name) {
    var config = this;

    if (field.templates[name]) {
      return field.templates[name];
    }

    if (field.parent) {
      return config.findFieldTemplate(field.parent, name);
    }

    return null;
  };

  config.initField = function (field) {

    var config = this;

    initField.apply(config, arguments);

    var templates = field.templates = {};

    var childFieldTemplates = config.fieldChildFieldTemplates(field);

    childFieldTemplates.forEach(function (fieldTemplate) {

      if (_.isString(fieldTemplate)) {
        return;
      }

      var key = fieldTemplate.key;
      var id = fieldTemplate.id;

      if (fieldTemplate.template) {
        fieldTemplate = _.extend({}, fieldTemplate, {template: false});
      }

      if (!_.isUndefined(key) && key !== '') {
        templates[key] = fieldTemplate;
      }

      if (!_.isUndefined(id) && id !== '') {
        templates[id] = fieldTemplate;
      }
    });

    if (childFieldTemplates.length > 0) {
      field.fields = childFieldTemplates.map(function (fieldTemplate) {
        if (_.isString(fieldTemplate)) {
          fieldTemplate = config.findFieldTemplate(field, fieldTemplate);
        }

        return fieldTemplate;
      });

      field.fields = childFieldTemplates.filter(function (fieldTemplate) {
        return !fieldTemplate.template;
      });
    }

    var itemFieldTemplates = config.fieldItemFieldTemplates(field);

    if (itemFieldTemplates.length > 0) {
      field.itemFields = itemFieldTemplates.map(function (itemFieldTemplate) {
        if (_.isString(itemFieldTemplate)) {
          itemFieldTemplate = config.findFieldTemplate(field, itemFieldTemplate);
        }

        return itemFieldTemplate;
      });
    }
  };

};
