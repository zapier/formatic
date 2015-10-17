import React from 'react';
import u from '../undash';

const wrapChildInput = (Input, {defaultValue = ''} = {}) => {

  const WrapChildInput = React.createClass({

    mixins: [React.PureRenderMixin],

    propTypes: {
      parentValue: React.PropTypes.object.isRequired,
      childKey: React.PropTypes.string.isRequired,
      onChange: React.PropTypes.func.isRequired
    },

    childValue() {
      const {parentValue, childKey} = this.props;
      const childValue = parentValue[childKey];
      if (u.isUndefined(childValue)) {
        return defaultValue;
      }
      return childValue;
    },

    onChange(newValue) {
      const {onChange, childKey} = this.props;
      onChange(newValue, {
        path: [childKey]
      });
    },

    render() {
      const {childValue, onChange} = this;
      const value = childValue();
      return <Input {...this.props} value={value} onChange={onChange}/>;
    }
  });

  return WrapChildInput;
};

export default wrapChildInput;
