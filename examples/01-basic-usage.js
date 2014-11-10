// # 1. Basic usage

// Grab the default formatic instance.
var formatic = require('formatic');

// Create a form.
var form = formatic({

  // Giving it some fields.
  fields: [
    {
      type: 'text',
      key: 'firstName'
    },
    {
      type: 'text',
      key: 'lastName'
    }
  ],

  // And a value.
  value: {
    firstName: 'Joe',
    lastName: 'Foo'
  }
});

// Get a React component.
var component = form.component({
  onChange: function (value) {
    // Do something interesting with the value.
    console.log(value);
  }
});

// Render the component to a DOM element.
formatic.render(component, document.body);
