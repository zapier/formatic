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

var mixinRegistry = function (obj, config) {

  obj.types = _.extend({}, config.types || {});
  obj.views = _.extend({}, config.views || {});

  obj.type = function (name, type) {
    obj.types[name] = type;
    return obj;
  };

  obj.view = function (name, view) {
    obj.views[name] = view;
    return obj;
  };

  return obj;
};

var createForm = function (formatic) {

  var root = {
    type: 'form',
    fields: []
  };

  var emitter = new Emitter();

  var data = {};

  var form = {};
  mixinRegistry(form, formatic);

  var renders = [];

  var createField = function (field) {

    if (!form.types[field.type]) {
      throw new Error('No type: ' + field.type);
    }

    var type = form.types[field.type];

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

    field = field || contextify(root, data);

    if (!form.views[field.type]) {
      throw new Error('No view for type: ' + this.config.type);
    }

    var view = form.views[field.type];

    return view({form: form, field: field, onChange: onChange.bind(null, field)});
  };

  form.render = function (node, done) {

    var field = contextify(root, data);

    var component = form.component(field);

    var renderedComponent = React.renderComponent(component, node, done);

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
          React.unmountComponentAtNode(node);
          infoIndex = i;
          return;
        }
      });
      if (infoIndex >= 0) {
        renders.splice(infoIndex, 1);
      }
    } else {
      _.each(renders, function (info) {
        React.unmountComponentAtNode(info.node);
      });
      renders = [];
    }
  };

  var update = function () {

    var field = contextify(root, data);

    var props = {form: form, field: field};

    emitter.emit('update', props);

    if (renders.length > 0) {
      _.each(renders, function (info) {
        info.component.setProps(props);
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

  return form;
};

var createFormatic = function (config) {

  config = config || {};

  var formatic = {};
  mixinRegistry(formatic, config);

  var formaticFn = createForm.bind(null, formatic);

  _.each(formatic, function (value, key) {
    formaticFn[key] = value;
  });

  formaticFn.create = createFormatic;

  return formaticFn;
};

module.exports = createFormatic({
  types: defaultTypes,
  views: defaultViews
});
