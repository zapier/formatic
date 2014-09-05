'use strict';

module.exports = function (formatic) {

  formatic.config('view-form.attributes', {role: 'form'});

  formatic.config('view-field', {
    className: 'form-group',
    help_className: 'help-block'
  });

  formatic.config('view-text.className', 'form-control');

  formatic.config('view-textarea.className', 'form-control');

  formatic.config('view-json.className', 'form-control');

  formatic.config('view-select.className', 'form-control');

  formatic.config('view-list', {
    className: 'well',
    addButton_className: 'glyphicon glyphicon-plus',
    addButton_label: ''
  });

  formatic.config('view-list-item', {
    className: 'well',
    value_className: '',
    control_className: '',
    removeButton_className: 'glyphicon glyphicon-remove',
    removeButton_label: '',
    upButton_className: 'glyphicon glyphicon-arrow-up',
    upButton_label: '',
    downButton_className: 'glyphicon glyphicon-arrow-down',
    downButton_label: ''
  });

  formatic.config('view-object', {
    className: 'well',
    addButton_className: 'glyphicon glyphicon-plus',
    addButton_label: ''
  });

  formatic.config('view-object-item', {
    className: 'well',
    key_className: '',
    keyInput_className: 'form-control',
    keyChoice_className: 'form-control',
    value_className: '',
    control_className: '',
    removeButton_className: 'glyphicon glyphicon-remove',
    removeButton_label: ''
  });
};
