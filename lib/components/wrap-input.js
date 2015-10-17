const React = require('react');
const u = require('../undash');

export default function wrapInput(InputComponent) {

  const WrapInput = React.createClass({

    mixins: [React.PureRenderMixin],

    getInitialState() {
      return {
        isControlled: !u.isUndefined(this.props.value),
        value: u.isUndefined(this.props.value) ? this.props.defaultValue : this.props.value
      };
    },

    componentWillReceiveProps (newProps) {
      if (this.state.isControlled) {
        if (!u.isUndefined(newProps.value)) {
          this.setState({
            value: newProps.value
          });
        }
      }
    },

    onChange (newValue, info) {

      if (InputComponent.hasEvent) {
        const event = newValue;
        newValue = event.target.value;
      }

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
        onChange={this.onChange}
      />;
    }
  });

  return WrapInput;
}
