'use strict';

module.exports = function (formatic) {

  //formatic.config('views.formatic..attributes', {role: 'form'});

  formatic.config('views.field', {className: 'form-group'});

  formatic.config('views.help', {className: 'help-block'});

  formatic.config('views.text', {className: 'form-control'});

  formatic.config('views.textarea', {className: 'form-control'});
  //
  // formatic.config('view-json.className', 'form-control');
  //
  formatic.config('views.select', {className: 'form-control'});

  formatic.config('views.list', {className: 'well'});

  formatic.config('views.list-control', {className: 'form-inline'});

  formatic.config('views.list-item', {className: 'well'});

  //
  // formatic.config('view-list-item', {
  //   className: 'well',
  //   value_className: '',
  //   control_className: '',
  //   removeButton_className: 'glyphicon glyphicon-remove',
  //   removeButton_label: '',
  //   upButton_className: 'glyphicon glyphicon-arrow-up',
  //   upButton_label: '',
  //   downButton_className: 'glyphicon glyphicon-arrow-down',
  //   downButton_label: ''
  // });
  //
  // formatic.config('view-object', {
  //   className: 'well',
  //   addButton_className: 'glyphicon glyphicon-plus',
  //   addButton_label: ''
  // });
  //
  // formatic.config('view-object-item', {
  //   className: 'well',
  //   key_className: '',
  //   keyInput_className: 'form-control',
  //   keyChoice_className: 'form-control',
  //   value_className: '',
  //   control_className: '',
  //   removeButton_className: 'glyphicon glyphicon-remove',
  //   removeButton_label: ''
  // });

  formatic.config('views.item-choices', {
    className: 'form-control'
  });

  formatic.config('views.add-item', {
    className: 'glyphicon glyphicon-plus',
    label: ''
  });
};
