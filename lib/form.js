'use strict';

var _ = require('underscore');
var Emitter = require('component-emitter');

var utils = require('./utils');

var createForm = function (formatic) {

  var root = {
    type: 'form',
    fields: []
  };

  var emitter = new Emitter();

  var data = {};

  var plugins = [];

  var renders = [];

  var createField = function (field) {

    field = _.extend({}, field);

    for (var i = 0; i < plugins.length; i++) {

      var plugin = plugins[i];

      var result = plugin(field);

      if (result === null) {
        field = null;
        break;
      }

      if (typeof result !== 'undefined') {
        field = result;
      }
    }

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

  var form = function (fields, data, node) {
    form.fields(fields);
    form.set(data);
    form.render(node);
  };

  var update = function () {

    var field = contextify(root, data);

    var props = {form: form, field: field};

    emitter.emit('update', props);

    if (renders.length > 0) {
      _.each(renders, function (info) {
        formatic.viewer.update(info.component, props);
      });
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

  form.render = function (node, done) {

    var field = contextify(root, data);

    var component = form.component(field);

    var renderedComponent = formatic.viewer.render(component, node, done);

    var renderInfo = _.find(renders, function (info) {
      return info.node === node;
    });

    if (renderInfo) {
      renderInfo.component = renderedComponent;
    } else {
      renders.push({
        component: renderedComponent,
        node: node
      });
    }

    return renderedComponent;
  };

  form.detach = function (node) {

    if (node) {
      var infoIndex = -1;
      _.find(renders, function (info, i) {
        if (info.node === node) {
          formatic.viewer.detach(node);
          infoIndex = i;
          return;
        }
      });
      if (infoIndex >= 0) {
        renders.splice(infoIndex, 1);
      }
    } else {
      _.each(renders, function (info) {
        formatic.viewer.detach(info.node);
      });
      renders = [];
    }
  };

  var onChange = function (field, value) {
    form.set(field.key, value);
  };

  form.component = function (field) {

    field = field || contextify(root, data);

    if (!formatic.views[field.type]) {
      throw new Error('No view for type: ' + this.config.type);
    }

    var view = formatic.views[field.type];

    return view({form: form, field: field, onChange: formatic.viewer.onChange.bind(null, onChange.bind(null, field))});
  };

  _.each(formatic.plugins, function (plugin) {
    plugins.push(plugin(form));
  });

  return form;
};

module.exports = createForm;
