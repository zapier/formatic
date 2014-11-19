# Formatic

[![travis](https://travis-ci.org/zapier/formatic.svg?branch=master)](https://travis-ci.org/zapier/formatic)

Automatic forms.

## Warning!

Formatic is currently early alpha and still in heavy development. Everything is
subject to change! You should probably just look away till this warning goes
away!

## Start hacking

```
git clone git@github.com:zapier/formatic.git
cd formatic
npm install
gulp live
```

Point your browser to `localhost:3000/index.html`. Hack away on the code, the
styles or the HTML in the demo directory, and the browser will automatically
reload with your changes.

__Note__: Don't mess with the files in the `live` directory. All those are copied
from elsewhere.

## Build

```
git clone git@github.com:zapier/formatic.git
cd formatic
npm install
gulp build
```

This will build two files in the build directory: formatic-min.js (minified) and
formatic-dev.js (not minified and includes source maps for development).

## What is formatic?

Formatic is a configurable, pluggable forms builder.

## Using formatic (quick version)

If you don't want to extend formatic, you'll use it like this:

```js
// Get the default formatic instance.
var formatic = require('formatic');

// Get a new form.
var form = formatic();

// Add some fields.
form.fields([
  {
    type: 'text',
    key: 'firstName'
  },
  {
    type: 'text',
    key: 'lastName'
  }
]);

// Give the form some data.
form.val({
  firstName: 'Joe',
  lastName: 'Foo'
});

// Get a React component
var component = form.component();

// Render the form to some node.
formatic.render(component, document.body)
```
