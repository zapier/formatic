'use strict';

module.exports = function (formatic) {

  //formatic.config('component.formatic..attributes', {role: 'form'});

  formatic.config('component.field', {className: 'form-group'});

  formatic.config('component.help', {className: 'help-block'});

  formatic.config('component.text', {className: 'form-control'});

  formatic.config('component.textarea', {className: 'form-control'});

  formatic.config('component.json', {className: 'form-control'});

  formatic.config('component.select', {className: 'form-control'});

  formatic.config('component.list', {className: 'well'});

  formatic.config('component.list-control', {className: 'form-inline'});

  formatic.config('component.list-item', {className: 'well'});

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

  formatic.config('component.item-choices', {
    className: 'form-control'
  });

  formatic.config('component.add-item', {
    className: 'glyphicon glyphicon-plus',
    label: ''
  });

  formatic.config('component.remove-item', {
    className: 'glyphicon glyphicon-remove',
    label: ''
  });

  formatic.config('component.move-item-back', {
    className: 'glyphicon glyphicon-arrow-up',
    label: ''
  });

  formatic.config('component.move-item-forward', {
    className: 'glyphicon glyphicon-arrow-down',
    label: ''
  });
};
