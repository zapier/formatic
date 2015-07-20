const React = require('react');
const _ = require('../undash');
const ComponentContainer = require('../../component-container');
const Wrapper = require('./wrapper');

export default (FieldComponent) => {

  const WrapField = class extends React.Component {

    constructor(props, context) {
      super(props, context);

      this.wrapper = Wrapper.create();

      this.state = {
        isControlled: !_.isUndefined(this.props.value),
        value: _.isUndefined(this.props.value) ? this.props.defaultValue : this.props.value,
        onChange: this.onChange.bind(this),
        components: this.props.components,
        combinedComponents: ComponentContainer.components(this.props.components)
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
      if (this.state.components !== newProps.components) {
        this.setState({
          components: newProps.components,
          combinedComponents: ComponentContainer.components(this.props.components)
        });
      }
    }

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
    }

    render() {
      return <FieldComponent {...this.props}
        value={this.state.value}
        onChange={this.state.onChange}
        components={this.state.combinedComponents}
      />;
    }

  };

  return WrapField;
};
