// # mixin.field

/*
Wrap up your fields with this mixin to get:
- Automatic metadata loading.
- Automatic erasing of values when the field disappears.
- Anything else decided later.
*/

'use strict';

module.exports = function (plugin) {

  plugin.exports = {

    loadNeededMeta: function (props) {
      if (props.field && props.field.form) {
        if (props.field.def.needsMeta && props.field.def.needsMeta.length > 0) {
          props.field.def.needsMeta.forEach(function (args) {
            if (args) {
              props.field.form.loadMeta.apply(props.field.form, args);
            }
          });
        }
      }
    },

    componentDidMount: function () {
      this.loadNeededMeta(this.props);
    },

    componentWillReceiveProps: function (nextProps) {
      this.loadNeededMeta(nextProps);
    },

    componentWillUnmount: function () {
      if (this.props.field) {
        this.props.field.erase();
      }
    }
  };
};
