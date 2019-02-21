import React from 'react';
import Formatic, { FieldContainer } from 'formatic';

const config = Formatic.createConfig(() => ({
  createElement_Upper: props => (
    <FieldContainer {...props}>
      {({ onChangeValue, onFocus, onBlur }) => (
        <input
          onChange={event => onChangeValue(event.target.value.toUpperCase())}
          onFocus={onFocus}
          onBlur={onBlur}
          value={props.field.value}
        />
      )}
    </FieldContainer>
  ),
}));

const fields = [{ type: 'upper', key: 'name' }];

class App extends React.Component {
  state = { name: '' };

  onChange = newValue => {
    // newValue.name will always be upper-cased
    this.setState(newValue);
  };

  render() {
    return (
      <Formatic
        config={config}
        fields={fields}
        value={this.state}
        onChange={this.onChange}
      />
    );
  }
}

React.render(<App />, document.getElementById('some-element'));
