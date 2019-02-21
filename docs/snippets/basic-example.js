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

// Render the form.
React.render(
  <Formatic fields={fields} />,
  document.getElementById('some-element')
);
