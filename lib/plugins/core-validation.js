'use strict';

module.exports = function (formatic) {

  formatic.form.wrap('evalField', function (next, field) {

    field.errors = {};

    return next();
  });

  formatic.form.invalidFields = function (field) {

    field = field || this.run(this.root, this.data);

    if (field) {
      var fields = [];

      if (Object.keys(field.errors).length > 0) {
        fields.push(field);
      }

      var children = field.fields || [];

      var childrenFields = children.map(function (child) {
        return this.invalidFields(child);
      }.bind(this));

      childrenFields = [].concat.apply([], childrenFields);

      return fields.concat(
        childrenFields
      );
    } else {
      return [];
    }
  };

  formatic.form.isValid = function () {
    return this.invalidFields().length === 0;
  };
};
