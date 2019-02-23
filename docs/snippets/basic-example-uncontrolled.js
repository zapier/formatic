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

const value = { firstName: 'Joe', lastName: 'Foo' };

// Render the form with a value.
React.render(
  <Formatic defaultValue={value} fields={fields} />,
  document.getElementById('some-element')
);
