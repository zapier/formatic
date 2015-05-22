// # meta plugin

/*
The meta plugin lets you pass in a meta prop to formatic. The prop then gets
passed through as a property for every field. You can then wrap `initField` to
get your meta values.
*/

'use strict';

module.exports = function (config) {

  var _initRootField = config.initRootField;
  var _initField = config.initField;

  return {
    initRootField: function initRootField(field, props) {

      field.meta = props.meta || {};

      _initRootField(field, props);
    },

    initField: function initField(field) {

      if (field.parent && field.parent.meta) {
        field.meta = field.parent.meta;
      }

      _initField(field);
    }
  };
};