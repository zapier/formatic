// # type.root

/*
Special type representing the root of the form. Gets the fields directly from
the store.
*/

'use strict';

module.exports = function (plugin) {

  plugin.exports.fields = function (field) {

    return field.form.store.fields.map(function (def) {
      return field.createChild(def);
    });

  };
};
