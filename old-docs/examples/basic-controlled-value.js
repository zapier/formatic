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
React.render(
  <Formatic fields={fields} value={{firstName: 'Joe', lastName: 'Foo'}}/>
, mountNode);
