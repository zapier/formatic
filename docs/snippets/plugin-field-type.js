import React from 'react';
import Formatic, { FieldContainer } from 'formatic';

const config = Formatic.createConfig(() => ({
  createElement_Upper: props => (
    <FieldContainer {...props}>
      {({ onChangeValue, onFocus, onBlur }) => (
        <input
          onBlur={onBlur}
          onChange={event => onChangeValue(event.target.value.toUpperCase())}
          onFocus={onFocus}
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
        onChange={this.onChange}
        value={this.state}
      />
    );
  }
}

React.render(<App />, document.getElementById('some-element'));
