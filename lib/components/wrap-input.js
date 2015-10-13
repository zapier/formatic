const React = require('react');
const _ = require('../undash');

export default function wrapInput(InputComponent, {hasEvent}) {

  const WrapInput = React.createClass({

    contextTypes: {
      formaticComponents: React.ProptTypes.object.isRequired
    },

    getInitialState() {
      return {
        isControlled: !_.isUndefined(this.props.value),
        value: _.isUndefined(this.props.value) ? this.props.defaultValue : this.props.value
      };
    },

    componentWillReceiveProps (newProps) {
      if (this.state.isControlled) {
        if (!_.isUndefined(newProps.value)) {
          this.setState({
            value: newProps.value
          });
        }
      }
    },

    onChange (newValue, info) {
      if (!this.state.isControlled) {
        this.setState({
          value: newValue
        });
      }
      if (!this.props.onChange) {
        return;
      }
      this.props.onChange(newValue, info);
    },

    render() {
      return <InputComponent {...this.props}
        value={this.state.value}
        onChange={this.state.onChange}
        components={this.context.formaticComponents}
      />;
    }
  });

  return WrapInput;
}
