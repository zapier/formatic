// Get the Formatic class.
var Formatic = require('formatic');

// Create some fields.
var fields = [
  {
    type: 'single-line-string',
    key: 'firstName',
    label: 'First Name'
  },
  {
    type: 'single-line-string',
    key: 'lastName',
    label: 'Last Name'
  }
];

// Render the form.
React.render(React.createElement(Formatic, {fields: fields}), document.body);
