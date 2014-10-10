'use strict';

module.exports = function (formatic) {

  //formatic.config('components.formatic..attributes', {role: 'form'});

  formatic.config('components.field', {className: 'form-group'});

  formatic.config('components.help', {className: 'help-block'});

  formatic.config('components.text', {className: 'form-control'});

  formatic.config('components.textarea', {className: 'form-control'});

  formatic.config('components.json', {className: 'form-control'});

  formatic.config('components.select', {className: 'form-control'});

  formatic.config('components.list', {className: 'well'});

  formatic.config('components.list-control', {className: 'form-inline'});

  formatic.config('components.list-item', {className: 'well'});

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

  formatic.config('components.item-choices', {
    className: 'form-control'
  });

  formatic.config('components.add-item', {
    className: 'glyphicon glyphicon-plus',
    label: ''
  });

  formatic.config('components.remove-item', {
    className: 'glyphicon glyphicon-remove',
    label: ''
  });

  formatic.config('components.move-item-back', {
    className: 'glyphicon glyphicon-arrow-up',
    label: ''
  });

  formatic.config('components.move-item-forward', {
    className: 'glyphicon glyphicon-arrow-down',
    label: ''
  });
};
