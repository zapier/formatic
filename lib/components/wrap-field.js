const React = require('react');
const Config = require('../config');
const _ = require('../undash');

export default (FieldComponent) => {

  const WrapField = class extends React.Component {

    constructor(props, context) {
      super(props, context);

      this.state = {
        config: Config.forComponent(this),
        isControlled: !_.isUndefined(this.props.value),
        value: _.isUndefined(this.props.value) ? this.props.defaultValue : this.props.value,
        onChange: this.onChange.bind(this)
      };
    }

    componentWillReceiveProps (newProps) {
      if (this.state.isControlled) {
        if (!_.isUndefined(newProps.value)) {
          this.setState({
            value: newProps.value
          });
        }
      }
    }

    onChange (newValue) {
      if (!this.state.isControlled) {
        this.setState({
          value: newValue
        });
      }
      if (!this.props.onChange) {
        return;
      }
      this.props.onChange(newValue);
    }

    render() {
      return <FieldComponent {...this.props} {...this.state}/>;
    }

  };

  return WrapField;
};
