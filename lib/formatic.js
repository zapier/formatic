'use strict';

var _ = require('underscore');
var React = require('react');
var Emitter = require('component-emitter');

var utils = require('./utils');

var defaultTypes = {
  form: require('./types/form'),
  text: require('./types/text'),
  textarea: require('./types/text'),
  select: require('./types/select'),
  code: require('./types/code')
};

var defaultViews = {
  form: require('./views/form'),
  text: require('./views/text'),
  textarea: require('./views/textarea'),
  select: require('./views/select'),
  code: require('./views/code')
};

var createForm = function () {

  var root = {
    type: 'form',
    fields: []
  };

  var emitter = new Emitter();

  var data = {};

  var types = _.extend({}, defaultTypes);
  var views = _.extend({}, defaultViews);

  var form = {};

  var rootComponent = null;

  form.type = function (name, type) {
    types[name] = type;
    return form;
  };

  form.view = function (name, view) {
    views[name] = view;
    return form;
  };

  var createField = function (field) {

    if (!types[field.type]) {
      throw new Error('No type: ' + field.type);
    }

    var type = types[field.type];

    field = _.extend({}, field);

    type.init(field);

    return field;
  };

  var contextify = function (field) {
    field = field || root;

    field = createField(field);

    if (field.key) {
      var value = utils.getObject(data, field.key);
      if (typeof value !== 'undefined') {
        field.value = value;
      }
    }

    var children = field.fields;

    if (children) {
      field.fields = [];

      _.each(children, function (child) {
        field.fields.push(contextify(child));
      });
    }

    return field;
  };

  var onChange = function (field, event) {

    form.set(field.key, event.target.value);
  };

  form.component = function (field) {

    if (!views[field.type]) {
      throw new Error('No view for type: ' + this.config.type);
    }

    var view = views[field.type];

    return view({form: form, field: field, onChange: onChange.bind(null, field)});
  };

  form.render = function (node) {

    var field = contextify(root, data);



    var component = form.component(field);

    rootComponent = React.renderComponent(component, node);
  };

  var update = function () {

    emitter.emit('update');

    if (rootComponent) {
      var field = contextify(root, data);

      rootComponent.setProps({form: form, field: field});
    }
  };

  form.fields = function (fields) {
    if (_.isArray(fields)) {
      root.fields = fields;
    } else {
      var field = fields;
      if (field.type === 'form') {
        root = field;
      } else {
        root.fields = [field];
      }
    }
    update();
  };

  form.on = emitter.on.bind(emitter);

  form.set = function (key, value) {
    if (typeof value === 'undefined') {
      value = key;
      data = value;
    } else {
      utils.setObject(data, key, value);
    }
    update();
  };

  form.val = function (obj, field) {

    obj = obj || {};
    field = field || contextify();

    if (field.key) {
      utils.setObject(obj, field.key, field.value);
    }
    if (field.fields) {
      _.each(field.fields, function (field) {
        form.val(obj, field);
      });
    }

    return obj;
  };

  return form;
};

module.exports = createForm;
