# Formatic

[![travis](https://travis-ci.org/zapier/formatic.svg?branch=master)](https://travis-ci.org/zapier/formatic)

Automatic forms. Find it on NPM - [https://www.npmjs.com/package/formatic](https://www.npmjs.com/package/formatic).

## Warning!

Formatic is currently in use in production, but the API will likely change significantly in the not-too-distant future.

## Start hacking

```
git clone git@github.com:zapier/formatic.git
cd formatic
npm install
npm start
```

Point your browser to `localhost:3000/demo/index.html`. Hack away on the code, the
styles or the HTML in the demo directory, and the browser will automatically
reload with your changes.

__Note__: Don't mess with the files in the `live` directory. All those are copied
from elsewhere.

## What is formatic?

Formatic is a configurable, pluggable forms library for React. Pass in JSON
fields that define your form, along with a value to be edited, and Formatic
gives you a form to edit your value.

## Using formatic

If you're happy with the default configuration, you can use it like this:

```js
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
    console.log(newValue);
  }
}), document.body);
```

This creates a simple form like this (assuming you're using formatic.css):

![simple-form](docs/assets/images/simple-form.png)

The above assumes you're using a CommonJS build tool like browserify or webpack.
If you use the standalone build, you can just the global `Formatic'.

## Documentation

The [documentation](http://zapier.github.io/formatic/) is a work in progress,
but there's already a lot of useful info there. **Currently, it's way out of date though.**
