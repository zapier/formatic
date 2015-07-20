const React = require('react');
const ComponentContainer = require('../component-container');

export default (Component) => {

  const Wrap = class extends React.Component {

    constructor(props, context) {
      super(props, context);

      this.component = this.component.bind(this);
    }

    component(name) {
      const componentClass = this.props.components && this.props.components[name];
      if (componentClass) {
        return componentClass;
      }
      return ComponentContainer.component(name);
    }

    render() {
      return <Component {...this.props} {...this.state} component={this.component}/>;
    }

  };

  return Wrap;
};
