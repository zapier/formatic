// # mixin.field

/*
Wrap up your fields with this mixin to get:
- Automatic metadata loading.
- Anything else decided later.
*/

'use strict';

var _ = require('underscore');

module.exports = function (plugin) {

  var normalizeMeta = function (meta) {
    var needsMeta = [];

    meta.forEach(function (args) {


      if (_.isArray(args) && args.length > 0) {
        if (_.isArray(args[0])) {
          args.forEach(function (args) {
            needsMeta.push(args);
          });
        } else {
          needsMeta.push(args);
        }
      }
    });

    if (needsMeta.length === 0) {
      // Must just be a single need, and not an array.
      needsMeta = [meta];
    }

    return needsMeta;
  };

  plugin.exports = {

    loadNeededMeta: function (props) {
      if (props.field && props.field.form) {
        if (props.field.def.needsMeta && props.field.def.needsMeta.length > 0) {

          var needsMeta = normalizeMeta(props.field.def.needsMeta);

          needsMeta.forEach(function (needs) {
            if (needs) {
              props.field.form.loadMeta.apply(props.field.form, needs);
            }
          });
        }
      }
    },

    // currently unused; will use to unload metadata on change
    unloadOtherMeta: function () {
      var props = this.props;
      if (props.field.def.refreshMeta) {
        var refreshMeta = normalizeMeta(props.field.def.refreshMeta);
        props.field.form.unloadOtherMeta(refreshMeta);
      }
    },

    componentDidMount: function () {
      this.loadNeededMeta(this.props);
    },

    componentWillReceiveProps: function (nextProps) {
      this.loadNeededMeta(nextProps);
    },

    componentWillUnmount: function () {
      // Removing this as it's a bad idea, because unmounting a component is not
      // always a signal to remove the field. Will have to find a better way.

      // if (this.props.field) {
      //   this.props.field.erase();
      // }
    },

    onFocus: function () {
      if (this.props.onFocus) {
        this.props.onFocus({path: this.props.field.valuePath()});
      }
    },

    onBlur: function () {
      if (this.props.onBlur) {
        this.props.onBlur({path: this.props.field.valuePath()});
      }
    }
  };
};
