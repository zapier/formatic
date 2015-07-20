const React = require('react');
const wrap = require('./wrap-component');

export default (name) => {

  const FieldClass = class extends React.Component {

    constructor(props, context) {
      super(props, context);

      this.onChange = this.onChange.bind(this);
    }

    onChange(value) {
      this.props.onChange(value, {key: this.props.fieldKey});
    }

    render() {
      const Field = this.props.component('Field');
      const InputType = this.props.component(name + 'Input');

      return (
        <Field {...this.props}>
          <InputType {...this.props} onChange={this.onChange} type={name}/>
        </Field>
      );
    }

  };

  FieldClass.prototype.displayName = name + 'Field';

  return wrap(FieldClass);
};
