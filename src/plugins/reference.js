// # reference plugin

/*
This plugin allows fields to be strings and reference other fields by key or
id. It also allows a field to extend another field with
extends: ['foo', 'bar'] where 'foo' and 'bar' refer to other keys or ids.
*/

'use strict';

import _ from '@/src/undash';

export default function(config) {
  const initField = config.initField;

  return {
    // Look for a template in this field or any of its parents.
    findFieldTemplate: function(field, name) {
      if (field.templates[name]) {
        return field.templates[name];
      }

      if (field.parent) {
        return config.findFieldTemplate(field.parent, name);
      }

      return null;
    },

    // Inherit from any field templates that this field template
    // extends.
    resolveFieldTemplate: function(field, fieldTemplate) {
      if (!fieldTemplate.extends) {
        return fieldTemplate;
      }

      let ext = fieldTemplate.extends;

      if (!_.isArray(ext)) {
        ext = [ext];
      }

      const bases = ext.map(function(base) {
        const template = config.findFieldTemplate(field, base);
        if (!template) {
          throw new Error('Template ' + base + ' not found.');
        }
        return template;
      });

      const chain = [{}].concat(bases.reverse().concat([fieldTemplate]));
      fieldTemplate = _.extend.apply(_, chain);

      return fieldTemplate;
    },

    // Wrap the initField method.
    initField: function(field) {
      const templates = (field.templates = {});

      const childFieldTemplates = config.fieldChildFieldTemplates(field);

      // Add each of the child field templates to our template map.
      childFieldTemplates.forEach(function(fieldTemplate) {
        if (_.isString(fieldTemplate)) {
          return;
        }

        const key = fieldTemplate.key;
        const id = fieldTemplate.id;

        if (fieldTemplate.template) {
          fieldTemplate = _.extend({}, fieldTemplate, { template: false });
        }

        if (!_.isUndefined(key) && key !== '') {
          templates[key] = fieldTemplate;
        }

        if (!_.isUndefined(id) && id !== '') {
          templates[id] = fieldTemplate;
        }
      });

      // Resolve any references to other field templates.
      if (childFieldTemplates.length > 0) {
        field.fields = childFieldTemplates.map(function(fieldTemplate) {
          if (_.isString(fieldTemplate)) {
            fieldTemplate = config.findFieldTemplate(field, fieldTemplate);
          }

          return config.resolveFieldTemplate(field, fieldTemplate);
        });

        field.fields = field.fields.filter(function(fieldTemplate) {
          return !fieldTemplate.template;
        });
      }

      const itemFieldTemplates = config.fieldItemFieldTemplates(field);

      // Resolve any of our item field templates. (Field templates for dynamic
      // child fields.)
      if (itemFieldTemplates.length > 0) {
        field.itemFields = itemFieldTemplates.map(function(itemFieldTemplate) {
          if (_.isString(itemFieldTemplate)) {
            itemFieldTemplate = config.findFieldTemplate(
              field,
              itemFieldTemplate
            );
          }

          return config.resolveFieldTemplate(field, itemFieldTemplate);
        });
      }

      initField(field);
    },
  };
}
