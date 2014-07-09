# Formatic

Automatic forms.

## Get started:

```
git clone git@github.com:zapier/formatic.git
cd formatic
npm install
gulp build
```

Then open `index.html` in your browser.

## What is formatic?

Formatic is a forms builder builder. Thats not a typo. Formatic can't build
anything until you tell it how to build something. You tell it how to build
things by providing plugins that configure it.

## Using formatic (quick version)

If you don't want to extend formatic, you'll use it with an included plugin
like this:

```js
// Get a formatic instance configured with the react plugin.
var formatic = require('formatic')('react');

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
form.set({
  firstName: 'Joe',
  lastName: 'Foo'
});

// Render the form to some node.
form.attach(document.body);

// Watch for changes.
form.on('update', function () {
  // Get the data back out of the form.
  console.log(JSON.stringify(form.val()));
});

// Later on, change some data, and the form will update.
form.set('firstName', 'Joseph');
```

## Vanilla formatic

If you require formatic:

```js
var Formatic = require('formatic');
```

You get the daddy Formatic function that can create formatic instances. If you
call that function with no arguments:

```js
var formatic = Formatic();
```

You'll get a formatic instance that can create new forms:

```js
var form = formatic();
```

What can that form do? Well, pretty much nothing. If you don't provide any
plugins, formatic and the forms it creates don't know how do do anything. To
make formatic useful, you have to give it some plugins. (We'll get to plugins in
a bit.)

```js
var basePlugin = require('./base-plugin');
var magicPlugin = require('./magic-plugin');
var happyPlugin = require('./happy-plugin');

var formatic = Formatic(basePlugin, magicPlugin, happyPlugin);
```

Formatic also provides some plugins out of the box, and you can use
those by passing their names as arguments:

```js
var formatic = Formatic('react');
```

You can of course mix your own plugins in with included plugins.

```js
var tweakPlugin = require('./tweak-plugin');

var formatic = Formatic('react', tweakPlugin);
```

## Plugins

A formatic plugin is just a function which configures a formatic instance a
certain way. In other words, plugins are really just sugar over manually
configuring a formatic instance. Let's use vanilla formatic and make it do
something.

```js
var Formatic = require('formatic');

var helloPlugin = function (formatic) {

  var name;

  formatic.hook('setName', function (myName) {
    name = myName;
  });

  formatic.hook('getName', function () {
    return name;
  });

  formatic.form.hook('greet', function () {
    return 'Hello, ' + name;
  });
};

var worldPlugin = function (formatic) {

  formatic.setName('World');
};

var formatic = Formatic(helloPlugin, worldPlugin);

var form = formatic();

console.log(form.greet());

// => Hello, world!
```

Yay, our form can say hello! Hey, what does that have to do with forms?
Well, vanilla formatic doesn't know anything about forms. It's the job of
plugins to teach formatic about forms. We're just hear to learn about
plugins, but the same principles can be used to extend an already functional
formatic.

The above shows:

1. Hooks can be added to the formatic instance or to the forms that your
formatic instance creates. More about hooks below.
2. You can call a hook just like you would any other method.
3. Plugins can be stacked and run in the order that they are stacked. So, later
plugins can depend on earlier plugins.

### Hooks

At a basic level, a hook is just a method attached to a formatic instance or the
form that a formatic instance creates. You saw that above. The `hook` sugar is
there to warn you if you accidentally stomp on an existing hook. You can choose
to override any hook implementation like this:

```js
// ... continued from above

var spanishPlugin = function (formatic) {

  formatic.form.replaceHook('greet', function () {
    return 'Hola, ' + this.getName();
  });
};

var formatic = Formatic(helloPlugin, worldPlugin, spanishPlugin);

var form = formatic();

console.log(form.greet());

// => Hola, world!
```

This is pretty brute force though. Obviously, multiple plugins can't cooperate
like this. This is useful only in cases where a plugin needs to take over the
underlying implementation. Hooks offer a more composable extension mechanism
though, in the form of hook middleware.

### Hook middleware

You can leave the underlying hook implementation alone and simply modify what
goes into or comes out of the hook via hook middleware.

```js
// ... continued from above

var upperPlugin = function (formatic) {

  formatic.form.use('greet', function (next) {
    return next().toUpperCase();
  });
};

var formatic = Formatic(helloPlugin, worldPlugin, upperPlugin);

var form = formatic();

console.log(form.greet());

// => HELLO, WORLD!
```

This is the way good plugins should work. The `upperPlugin` attaches some
middleware to the `greet` hook. It doesn't change the underlying implementation
but simply changes the result of the underlying implementation.

Note that hook middleware runs in the order in which it is attached. The first
middleware receives the arguments first and must call the next function in the
chain. The middleware attached last will call the hook itself. The return path
is reversed. So the middleware attached last will receive the result of the hook
first and return to the previous middleware in the chain. The middleware
attached first will return the final result of the hook.

## Plugins in your plugins

![yo-dawg](http://i.imgur.com/LR2jW89.jpg)

You can easily create higher-order plugins simply by creating a plugin that
adds plugins to the formatic instance.

```js
// ... continued from above

var bigPlugin = function (formatic) {

  formatic.plugin(helloPlugin);
  formatic.plugin(worldPlugin);
  formatic.plugin(upperPlugin);
};

var formatic = Formatic(bigPlugin);

var form = formatic();

console.log(form.greet());

// => HELLO, WORLD!
```

## Seriously, what about forms?

Yeah, yeah. Look at the plugins in `/lib/plugins` to see how plugins are used
to build a formatic instance that can do, you guessed it, forms!

Forms are currently a work in progress though. So far, the effort has gone
toward getting the plugin system working so we can build form stuff on top
of that. In fact, the types plugin is a plugin that adds in "mini plugins" to
support various form elements and cool dynamic stuff.
