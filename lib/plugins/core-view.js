'use strict';

var _ = require('underscore');

module.exports = function (formatic) {

  var views = {};

  formatic.method('view', function (name, view) {

    views[name] = view;
  });

  formatic.form.wrap('init', function (next) {

    this.attached = [];

    next();
  });

  formatic.form.method('attach', function (node, done) {

    var field = this.run(this.root, this.data);
    var component = this.component(field);
    var attachedComponent = formatic.attachComponent(component, node, done);

    var info = _.find(this.attached, function (info) {
      return info.node === node;
    });

    if (info) {
      info.component = attachedComponent;
    } else {
      this.attached.push({
        component: attachedComponent,
        node: node
      });
    }

    return attachedComponent;
  });

  formatic.form.method('detach', function (node) {

    if (node) {
      var infoIndex = -1;
      _.find(this.attached, function (info, i) {
        if (info.node === node) {
          formatic.detachComponent(node);
          infoIndex = i;
          return;
        }
      });
      if (infoIndex >= 0) {
        this.attached.splice(infoIndex, 1);
      }
    } else {
      _.each(this.attached, function (info) {
        formatic.detachComponent(info.node);
      });
      this.attached = [];
    }
  });

  formatic.form.method('onAction', function (name, field, msg) {
    this.emitter.emit(name, field, msg);
  });

  formatic.form.method('component', function (field) {

    var self = this;

    field = field || this.run(this.root, this.data);

    var view = views[field.type];

    if (!view) {
      throw new Error('No view for type: ' + field.type);
    }

    var props = {
      form: this,
      field: field
    };

    if (field.key) {
      var onChange = function () {
        throw new Error('No onChange hook defined.');
      };


      if (formatic.hasMethod('onChangeComponent')) {
        onChange = formatic.onChangeComponent.bind(null, this.onChange.bind(this, field));
      }

      props.onChange = onChange;
    }

    var createAction = function () {
      throw new Error('No onAction hook defined');
    };

    if (formatic.hasMethod('onActionOfComponent')) {
      createAction = function (name) {
        return formatic.onActionOfComponent.bind(null, self.onAction.bind(self, name, field));
      };
    }

    props.action = createAction;

    return view(props);
  });

  formatic.form.method('updateView', function (props) {
    _.each(this.attached, function (info) {
      formatic.updateComponent(info.component, props);
    }.bind(this));
  });
};
