// Get the Formatic class.
var Formatic = require('formatic');

// Create some fields.
var fields = [
  {
    type: 'string',
    isSingleLine: true,
    key: 'firstName',
    label: 'First Name'
  },
  {
    type: 'str',
    isSingleLine: true,
    key: 'lastName',
    label: 'Last Name'
  }
];

// Render the form.
React.render(React.createElement(Formatic, {
  fields: fields,
  onChange: function (newValue) {
    console.log(newValue);
  }
}), document.body);
