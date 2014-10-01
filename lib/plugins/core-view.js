'use strict';

var _ = require('underscore');
var React = require('react');

module.exports = function (formatic) {

  formatic.form.wrap('init', function (next) {

    this._attachedNodes = [];

    return next();
  });

  var views = {};

  formatic.view = function (name, viewFn) {
    if (typeof viewFn === 'undefined') {
      return views[name];
    }
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
    var typeName = field.type;

    if (routes[typeName]) {
      var routesForType = routes[typeName];
      var route = _.find(routesForType, function (route) {
        return !route.test || route.test(field);
      });
      if (route) {
        return views[route.view];
      }
    }

    if (views[typeName]) {
      return views[typeName];
    }

    throw new Error('No view for field: ' + field.id + ':' + field.type);
  };

  formatic.attach = function (form, node) {
    if (!_.find(form._attachedNodes, function (attachedNode) {
      return attachedNode === node;
    })) {
      form._attachedNodes.push(node);
      formatic.renderFormToNode(form, node);
    }
  };

  formatic.form.attach = function (node) {
    return formatic.attach(this, node);
  };

  formatic.detach = function (form, node) {
    var i = form._attachedNodes.indexOf(node);
    if (i >= 0) {
      form._attachedNodes.splice(i, 1);
    }
  };

  formatic.form.detach = function (node) {
    return formatic.detach(this, node);
  };

  formatic.render = function (form) {
    if (!form._attachedNodes) {
      return;
    }
    form._attachedNodes.forEach(function (node) {
      formatic.renderFormToNode(form, node);
    });
  };

  // formatic.createField = function (formState) {
  //   var field = formState.toJS();
  //   formatic.modifyFieldPaths(field);
  //   return field;
  // };
  //
  // formatic.modifyFieldPaths = function (field, parent, index) {
  //   if (!parent) {
  //     field._path = [];
  //   } else {
  //     field._path = parent._path.concat(index);
  //   }
  //   if (field.fields) {
  //     field.fields.forEach(function (child, i) {
  //       formatic.modifyFieldPaths(child, field, i);
  //     });
  //   }
  // };

  formatic.renderFormToNode = function (form, node) {
    var field = formatic.createModifiedFieldFromFormState(form._formState);
    var component = formatic.component(form, field);
    React.renderComponent(formatic.view('formatic')({}, component), node);
  };

  formatic.component = function (form, field, props) {

    if (!field) {
      field = formatic.createModifiedFieldFromFormState(form._formState);
    }

    props = _.extend({}, props);

    var view = formatic.viewForField(field);

    if (field.fields) {
      props.fields = field.fields;
    }

    props.field = field;
    props.actions = form._formActions;
    props.form = form;

    return view(props);
  };

  formatic.form.component = function (field, props) {

    return formatic.component(this, field, props);
  };

  //
  // formatic.renderFieldToNode = function (field, node) {
  //   var component = field.component();
  //   React.renderComponent(formatic.view('formatic')({foo:'bar'}, component), node);
  // };
  //
  // formatic.component = function (field, props) {
  //   props = _.extend({}, props);
  //   var view = formatic.viewForField(field);
  //   if (field.typePlugin().visibleField) {
  //     field = field.typePlugin().visibleField(field);
  //   }
  //   if (!field) {
  //     return React.DOM.div();
  //   }
  //   props.field = field;
  //   props.fields = field.visibleChildren().toArray();
  //   return view(props);
  // };
  //
  // formatic.form.visibleChildren = function () {
  //   return this.children().map(function (field) {
  //     if (field.typePlugin().visibleField) {
  //       return field.Plugin().visibleField(field);
  //     }
  //     return field;
  //   }).filter(function (field) {
  //     return field && !field.get('hidden') && !field.typePlugin().hidden;
  //   });
  // };
  //
  // formatic.form.component = function (props) {
  //   return formatic.component(this, props);
  // };
  //
  // formatic.className = function () {
  //
  //   var classNames = Array.prototype.slice.call(arguments, 0);
  //
  //   classNames = classNames.filter(function (name) {
  //     return name;
  //   });
  //
  //   return classNames.join(' ');
  // };
};
