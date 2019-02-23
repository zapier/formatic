import React from 'react';
// Get the Formatic component.
import Formatic from 'formatic';

// Create some fields.
const fields = [
  {
    type: 'single-line-string',
    key: 'firstName',
    label: 'First Name',
  },
  {
    type: 'single-line-string',
    key: 'lastName',
    label: 'Last Name',
  },
];

class App extends React.Component {
  state = { firstName: 'Joe', lastName: 'Foo' };

  onChange = newValue => {
    this.setState(newValue);
  };

  render() {
    return (
      <Formatic fields={fields} onChange={this.onChange} value={this.state} />
    );
  }
}

React.render(<App />, document.getElementById('some-element'));
