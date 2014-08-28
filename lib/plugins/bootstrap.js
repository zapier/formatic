'use strict';

module.exports = function (formatic) {

  formatic.config('view-form.attributes', {role: 'form'});
  formatic.config('view-field.className', 'form-group');
  formatic.config('view-text.className', 'form-control');
  formatic.config('view-textarea.className', 'form-control');
  formatic.config('view-json.className', 'form-control');
};
