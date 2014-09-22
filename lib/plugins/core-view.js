'use strict';

var _ = require('underscore');
var React = require('react');

module.exports = function (formatic) {

  formatic.form.wrap('init', function (next) {

    this._attachedNodes = [];

    return next();
  });

  var views = {};

  formatic.form.view = function (name, viewFn) {
    views[name] = viewFn;
  };

  formatic.onPlugin(function (plugin) {
    if (plugin.name.indexOf('views.') === 0) {
      var name = plugin.name.substring('views.'.length);
      if (plugin.view) {
        views[name] = plugin.view;
      } else {
        throw new Error('View created without view property: ' + plugin.name);
      }
    }
  });

  var routes = {};

  formatic.route = function (typeName, viewName, testFn) {
    if (!routes[typeName]) {
      routes[typeName] = [];
    }
    routes[typeName].push({
      view: viewName,
      test: testFn
    });
  };

  formatic.viewForField = function (field) {
    var typeName = field.type();

    if (routes[typeName]) {
      var routesForType = routes[typeName];
      var route = _.find(routesForType, function (route) {
        return !route.test || route.test(field);
      });
      if (route) {
        return views[route.view];
      }
    }

    throw new Error('No view for field: ' + field.id() + ':' + field.props().type);
  };

  formatic.form.attach = function (node) {
    if (!_.find(this._attachedNodes, function (attachedNode) {
      return attachedNode === node;
    })) {
      this._attachedNodes.push(node);
      formatic.renderFieldToNode(this, node);
    }
  };

  formatic.form.detach = function (node) {
    var i = this._attachedNodes.indexOf(node);
    if (i >= 0) {
      this._attachedNodes.splice(i, 1);
    }
  };

  formatic.form.render = function () {
    this._attachedNodes.forEach(function (node) {
      formatic.renderFieldToNode(this, node);
    }.bind(this));
  };

  formatic.renderFieldToNode = function (field, node) {
    React.renderComponent(field.component(), node);
  };

  formatic.component = function (field) {
    var view = formatic.viewForField(field);
    var props = _.extend({}, field.props());
    if (field._type.visibleField) {
      field = field._type.visibleField(field);
    }
    if (!field) {
      return React.DOM.div();
    }
    props.field = field;
    props.fields = field.visibleChildren();
    return view(props);
  };

  formatic.form.visibleChildren = function () {
    return this.children().map(function (field) {
      if (field._type.visibleField) {
        return field._type.visibleField(field);
      }
      return field;
    }).filter(function (field) {
      return field && !field.props().hidden && !field._type.hidden;
    });
  };

  formatic.form.component = function () {
    return formatic.component(this);
  };
};
