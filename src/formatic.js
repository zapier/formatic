// # formatic

/*
The root formatic component.

The root formatic component is actually two components. The main component is
a controlled component where you must pass the value in with each render. This
is actually wrapped in another component which allows you to use formatic as
an uncontrolled component where it retains the state of the value. The wrapper
is what is actually exported.
*/

'use strict';

import React from 'react';
import createReactClass from 'create-react-class';
import _ from '@/src/undash';
import utils from '@/src/utils';
import defaultConfigPlugin from './default-config';

import ClickOutsideMixin from '@/src/mixins/click-outside.js';
import FieldMixin from '@/src/mixins/field.js';
import HelperMixin from '@/src/mixins/helper.js';
import ResizeMixin from '@/src/mixins/resize.js';
import ScrollMixin from '@/src/mixins/scroll.js';
import UndoStackMixin from '@/src/mixins/undo-stack.js';

import bootstrapPlugin from './plugins/bootstrap';
import cssPlugin from './plugins/css-plugin';
import elementClassesPlugin from './plugins/element-classes';
import helpTextPlacementPlugin from './plugins/help-text-placement';
import metaPlugin from './plugins/meta';
import referencePlugin from './plugins/reference';

export { default as FieldContainer } from './components/field-container';

export {
  bootstrapPlugin,
  cssPlugin,
  elementClassesPlugin,
  helpTextPlacementPlugin,
  metaPlugin,
  referencePlugin,
};

export {
  ClickOutsideMixin,
  FieldMixin,
  HelperMixin,
  ResizeMixin,
  ScrollMixin,
  UndoStackMixin,
};

const createConfig = function(...args) {
  const plugins = [defaultConfigPlugin].concat(args);

  return plugins.reduce(function(config, plugin) {
    if (_.isFunction(plugin)) {
      const extensions = plugin(config);
      if (extensions) {
        _.extend(config, extensions);
      }
    } else {
      _.extend(config, plugin);
    }

    return config;
  }, {});
};

const defaultConfig = createConfig();

// The main formatic component that renders the form.
const FormaticControlledClass = createReactClass({
  displayName: 'FormaticControlled',

  // Respond to any value changes.
  onChange: function(newValue, info) {
    if (!this.props.onChange) {
      return;
    }
    info = _.extend({}, info);
    info.path = this.props.config.fieldValuePath(info.field);
    this.props.onChange(newValue, info);
  },

  // Respond to any actions other than value changes. (For example, focus and
  // blur.)
  onAction: function(info) {
    if (!this.props.onAction) {
      return;
    }
    info = _.extend({}, info);
    info.path = this.props.config.fieldValuePath(info.field);
    this.props.onAction(info);
  },

  // Render the root component by delegating to the config.
  render: function() {
    const config = this.props.config;

    return config.renderFormaticComponent(this);
  },
});

const FormaticControlled = React.createFactory(FormaticControlledClass);

// A wrapper component that is actually exported and can allow formatic to be
// used in an "uncontrolled" manner. (See uncontrolled components in the React
// documentation for an explanation of the difference.)
export default createReactClass({
  displayName: 'Formatic',

  // Export some stuff as statics.
  statics: {
    createConfig,
    availableMixins: {
      clickOutside: ClickOutsideMixin,
      field: FieldMixin,
      helper: HelperMixin,
      resize: ResizeMixin,
      scroll: ScrollMixin,
      undoStack: UndoStackMixin,
    },
    plugins: {
      bootstrap: bootstrapPlugin,
      meta: metaPlugin,
      reference: referencePlugin,
      elementClasses: elementClassesPlugin,
      helpTextPlacement: helpTextPlacementPlugin,
    },
    utils,
  },

  // If we got a value, treat this component as controlled. Either way, retain
  // the value in the state.
  getInitialState: function() {
    return {
      isControlled: !_.isUndefined(this.props.value),
      value: _.isUndefined(this.props.value)
        ? this.props.defaultValue
        : this.props.value,
    };
  },

  // If this is a controlled component, change our state to reflect the new
  // value. For uncontrolled components, ignore any value changes.
  componentWillReceiveProps: function(newProps) {
    if (this.state.isControlled) {
      if (!_.isUndefined(newProps.value)) {
        this.setState({
          value: newProps.value,
        });
      }
    }
  },

  // If this is an uncontrolled component, set our state to reflect the new
  // value. Either way, call the onChange callback.
  onChange: function(newValue, info) {
    if (!this.state.isControlled) {
      this.setState({
        value: newValue,
      });
    }
    if (!this.props.onChange) {
      return;
    }
    this.props.onChange(newValue, info);
  },

  // Any actions should be sent to the generic onAction callback but also split
  // into discreet callbacks per action.
  onAction: function(info) {
    if (this.props.onAction) {
      this.props.onAction(info);
    }
    const action = utils.dashToPascal(info.action);
    if (this.props['on' + action]) {
      this.props['on' + action](info);
    }
  },

  // Render the wrapper component (by just delegating to the main component).
  render: function() {
    const config = this.props.config || defaultConfig;
    const value = this.state.value;

    if (this.state.isControlled) {
      if (!this.props.onChange) {
        console.info(
          'You should supply an onChange handler if you supply a value.'
        );
      }
    }

    const props = {
      config,
      // Allow field templates to be passed in as `field` or `fields`. After this, stop
      // calling them fields.
      fieldTemplate: this.props.field,
      fieldTemplates: this.props.fields,
      value,
      onChange: this.onChange,
      onAction: this.onAction,
    };

    _.each(this.props, function(propValue, key) {
      if (!(key in props)) {
        props[key] = propValue;
      }
    });

    return FormaticControlled(props);
  },
});
