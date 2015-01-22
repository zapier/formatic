// # 1. Basic usage

// Get the formatic class.
var Formatic = require('formatic');

// Create an element factory.
var Form = React.createFactory(Formatic);

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
React.render(Form({
  fields: fields,
  onChange: function (newValue) {
    // Recieve new values.
    console.log(newValue);
  }
}), document.body);
