// # meta plugin

/*
The meta plugin lets you pass in a meta prop to formatic. The prop then gets
passed through as a property for every field. You can then wrap `initField` to
get your meta values.
*/

'use strict';

export default function(config) {
  const initRootField = config.initRootField;
  const initField = config.initField;

  return {
    initRootField: function(field, props) {
      field.meta = props.meta || {};

      initRootField(field, props);
    },

    initField: function(field) {
      if (field.parent && field.parent.meta) {
        field.meta = field.parent.meta;
      }

      initField(field);
    },
  };
}
