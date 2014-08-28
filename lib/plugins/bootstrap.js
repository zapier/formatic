'use strict';

module.exports = function (formatic) {

  formatic.config('view-form.attributes', {role: 'form'});

  formatic.config('view-field.className', 'form-group');

  formatic.config('view-text.className', 'form-control');

  formatic.config('view-textarea.className', 'form-control');

  formatic.config('view-json.className', 'form-control');

  formatic.config('view-select.className', 'form-control');

  formatic.config('view-list.className', 'well');
  formatic.config('view-list.addButton_className', 'glyphicon glyphicon-plus');
  formatic.config('view-list.addButton_label', '');

  formatic.config('view-list-item.className', 'well');
  formatic.config('view-list-item.removeButton_className', 'glyphicon glyphicon-remove');
  formatic.config('view-list-item.removeButton_label', '');
  formatic.config('view-list-item.upButton_className', 'glyphicon glyphicon-arrow-up');
  formatic.config('view-list-item.upButton_label', '');
  formatic.config('view-list-item.downButton_className', 'glyphicon glyphicon-arrow-down');
  formatic.config('view-list-item.downButton_label', '');

  formatic.config('view-object.className', 'well');
  formatic.config('view-object.addButton_className', 'glyphicon glyphicon-plus');
  formatic.config('view-object.addButton_label', '');

  formatic.config('view-object-item.className', 'well');
  formatic.config('view-object-item.removeButton_className', 'glyphicon glyphicon-remove');
  formatic.config('view-object-item.removeButton_label', '');
};
