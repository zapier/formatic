# Formatic 3000

## Problems with the current version

- Deprecated patterns
  - Formatic uses mixins and `create-react-class` which have effectively been abandoned.
  - Formatic deeply passes a `config` object rather than relying on context. This is not exactly bad, but it can be cumbersome.
  - Formatic uses deprecated methods like `componentWillReceiveProps`.
- Build size
  - Even if you don't use all of Formatic, you have to import it all, because everything hangs off the main `Formatic` class. This includes mixins and plugins that you may not use and field and helper components that you may have completely overrridden.
- Performance
  - Every field is cloned, which means it's tricky to make any pure components.
  - Every field has access to its parent fields and values, which means it _impossible_ to make any pure components.
  - Aside from some hacky debounce logic in pretty text fields, there's no way to avoid having every keystroke change the whole tree of state.
- Complexity
  - There are too many available plugin methods. This makes it difficult to learn Formatic, and it makes it difficult to refactor Formatic, because there is a huge exposed API.
  - It's difficult to use parts of Formatic separately. For example, maybe a specific input would be useful on its own, or its form state management would be useful without actually using any of the view components.
  - Some of the plugin methods promote bad patterns: for example, the `renderComponent` methods allow poking directly into components, which exposes their implementation details.
  - Pretty text fields specifically have way too much complexity.
- Not enough tests, so refactoring can be a little scary. (There are now at least snapshot tests for all of the fields.)
- Some field components need to have "meta" state. For example, the object field component has to be able to keep the state of invalid (duplicate) keys. Right now, that can only exist as local state. But that state should be able to be bubbled up for validation.

## Things that work pretty good in the current version

- You can quickly create a form that edits arbitrary JSON data.
- Hierarchical fields and state management for those field values.
- Event bubbling works pretty well for that hierarchy of fields, including "action" events.
- The core plugin model is fairly simple and useful for creating "stacks" of plugins. Whether or not this is actually necessary is debatable.
- It's possible to use _most_ of a view while being able to just override a little piece of it. Of course, this is also a problem in that a potentially large API is exposed. But in practice, this has actually worked pretty well.
- Fields for auto-forms can be serizled as text-based JSON.

## Goals for a future version

- Modernize the code
  - Replace mixins with hooks.
  - Replace deep props passing with context.
  - Update all components to be function components with hooks.
- Reduce the build size
  - Break up Formatic and export with named exports so consumers can pick and choose.
  - Use userland composition and props passing to remove dependencies between modules.
  - Make sure we're not including any IE-specific Babel helpers.
- Improve performance
  - By default, fields should only have access to their own values so they only render when their values change. They should have to opt-in to parent or sibling values.
  - Fields passed in via a schema should remain immutable inside of a form. If any conversion has to be done, that should be done outside of a form.
  - Fields should have escape hatches so that slow fields can opt out of updating on every keystroke.
- Reduce complexity
  - Split auto-form components from the ability to use plain components directly.
  - Most plugin methods should either be removed or replaced by props passed into components. The auto-form component _may_ need its own separate plugins.
  - Formatic should be broken up into smaller modules that can be used separately.
  - Pretty text fields and any reliance on CodeMirror should be removed and put into userland or a separate package. Formatic should only contain relatively simple "reference" components.
- Add more tests!
- Allow components to send an envelope with onChange events, rather than just values. This way, components can bubble up invalid state (for example, an invalid blob of JSON being edited) for validation.
- With the above, avoid complex stateful components by keeping rendering metadata in form state. For example, remove the complex logic for determining array item order by instead using identifiers for each array item that are stored in form state.
- The `meta` plugin (and all need to pass along metadata for fields) should just be replaced by context and hooks.
- Ability to generate an ad-hoc form schema from a JSON value. This would enable quickly creating rough UIs for editing JSON data.
- Main stateless (with respect to form state) versions of all presentational components. Stateful versions should just use hooks along with their stateless counterparts.

## Basic hooks usage

Using hooks, you can easily create a fully custom and performant form that only renders fields when the value of those fields change. If we supply `defaultValue`, the form is uncontrolled, meaning you can't change the value again until you change the form's key or otherwise remount it.

```js
import { FormProvider, useField } from 'formatic';

const TextField = ({ fieldKey, label }) => {
  const { value, onChangeTargetValue } = useField(inputKey);
  return (
    <div>
      <label>{label}</label>
      <input type="text" value={value} onChange={onChangeTargetValue} />
    </div>
  );
};

const myValue = { firstName: '', lastName: '' };

const onChange = newValue => console.log(myValue);

React.render(
  <FormProvider defaultValue={myValue} onChange={onChange}>
    <form>
      <TextField fieldKey="firstName" label="First Name" />
      <TextField fieldKey="lastName" label="Last Name" />
      <input type="submit" />
    </form>
  </FormProvider>,
  document.getElementById('myForm')
);
```

## Controlled forms

If instead you supply a `value`, you'll get a form that acts like a controlled input, where you have to update the `value`.

```js
<FormProvider value={myValue} onChange={onChange}>
  <form>
    <TextField fieldKey="firstName" label="First Name" />
    <TextField fieldKey="lastName" label="Last Name" />
    <input type="submit" />
  </form>
</FormProvider>
```

However, to remain performant, new values will be checked against previous values. If nothing changes, the form will be more performant since it doesn't have to rebuild any internal state.

Note that any children of `FormProvider` will rerender (because that's just how React works), so you would probably want to make sure your field components are pure with something like:

```js
const PureTextField = React.memo(TextField);
```

In the above example though, note that the children of `FormProvider` don't actually change. If that's the case, you could avoid rerendering by applying `React.memo` to the entire content like:

```js
const FormBody = () => {
  return (
    <form>
      <TextField fieldKey="firstName" label="First Name" />
      <TextField fieldKey="lastName" label="Last Name" />
      <input type="submit" />
    </form>
  );
};

const PureFormBody = React.memo(FormBody);

React.render(
  <FormProvider defaultValue={myValue} onChange={onChange}>
    <PureFormBody />
  </FormProvider>,
  document.getElementById('myForm')
);
```

Now, only fields that actually change will be rerendered.

## Custom forms with container components

You can use Formatic's field container components to avoid the hook wiring and instead use render callbacks if you prefer.

```js
import { FormContainer, FieldContainer } from 'formatic';

const renderTextField = ({ label, value, onChangeTargetValue }) => {
  return (
    <div>
      <label>{label}</label>
      <input type="text" value={value} onChange={onChangeTargetValue} />
    </div>
  );
};

const myValue = { firstName: '', lastName: '' };

const onChange = newValue => console.log(myValue);

React.render(
  <FormContainer defaultValue={myValue} onChange={onChange}>
    <form>
      <FieldContainer fieldKey="firstName" label="First Name">
        {renderTextField}
      </FieldContainer>
      <FieldContainer fieldKey="lastName" label="Last Name">
        {renderTextField}
      </FieldContainer>
      <input type="submit" />
    </form>
  </FormContainer>,
  document.getElementById('myForm')
);
```

## Semi-custom forms

You can also avoid the custom hook wiring by using Formatic's built-in view components.

```js
import { FormContainer, TextInput } from 'formatic';

const TextField = ({ fieldKey, label }) => {
  return (
    <div>
      <label>{label}</label>
      <TextInput fieldKey={fieldKey} />
    </div>
  );
};

const myValue = { firstName: '', lastName: '' };

const onChange = newValue => console.log(myValue);

React.render(
  <FormContainer defaultValue={myValue} onChange={onChange}>
    <form>
      <TextField fieldKey="firstName" label="First Name" />
      <TextField fieldKey="lastName" label="Last Name" />
      <input type="submit" />
    </form>
  </FormContainer>,
  document.getElementById('myForm')
);
```

Formatic's build-in `TextInput`s are pure and will not re-render, but again, you would have to take care to make your own child components pure.

Note that by default, these inputs will be _completely_ unstyled.

## Non-custom forms

You can also use Formatic's fully baked field components to avoid wiring and rendering. You can still mix in other markup around the fields, for example to group fields.

```js
import { FormContainer, TextField } from 'formatic';

const myValue = { firstName: '', lastName: '' };

const onChange = newValue => console.log(myValue);

React.render(
  <FormContainer defaultValue={myValue} onChange={onChange}>
    <form>
      <TextField fieldKey="firstName" label="First Name" />
      <TextField fieldKey="lastName" label="Last Name" />
      <input type="submit" />
    </form>
  </FormContainer>,
  document.getElementById('myForm')
);
```

These `TextField` components are pure and will only rerender when the field values change. Still, if you have lots of static fields, you'll want to use the trick above to purify the whole body of the form.

Note that by default, these fields will be _completely_ unstyled.

## Customizing built-in components

To customize the styling (or other props) for Formatic components, you can pass in contextual render callbacks to the top-level `FormContainer`, and your render callbacks will be called when rendering any built-in components inside that container.

The `renderTag` callback can be used to override the rendering of any DOM element so you can add in custom `className`, `style`, and other props. Or you can change the DOM element or swap it out for a custom component, such as one using `styled-components`.

The `renderComponent` callback can be used to override the rendering of other components that don't directly render DOM elements.

Formatic's render keys are strings used to target specific elements. Userland render keys could be symbols to prevent collision.

```js
import { TextField } from 'formatic';

const renderTag = (renderKey, Tag, props) => {
  if (renderKey === 'TextInput') {
    return <Tag {...props} className="my-app-text-input" />;
  }
  return <Tag {...props} />;
};

const renderComponent = (renderKey, Component, props) => {
  if (renderKey === 'TextField') {
    return (
      <div className="my-app-field-wrapper">
        <Component {...props} label={props.fieldKey} />
      </div>
    );
  }
  return <Component {...props} />;
};

const myValue = { firstName: '', lastName: '' };

const onChange = newValue => console.log(myValue);

React.render(
  <FormContainer
    defaultValue={myValue}
    onChange={onChange}
    renderTag={renderTag}
    renderComponent={renderComponent}
  >
    <form>
      <TextField fieldKey="firstName" />
      <TextField fieldKey="lastName" />
      <input type="submit" />
    </form>
  </FormContainer>,
  document.getElementById('myForm')
);
```

## Nested values

You can nest into a particular property of the value to set the context for field keys.

```js
const myValue = { name: { firstName: '', lastName: '' }, age: 0 };

React.render(
  <FormContainer defaultValue={myValue} onChange={onChange}>
    <form>
      <FieldContainer fieldKey="name">
        <TextField label="First Name" fieldKey="firstName" />
        <TextField label="Last Name" fieldKey="lastName" />
      </FieldContainer>
      <TextField label="Age" fieldKey="age" />
      <input type="submit" />
    </form>
  </FormContainer>,
  document.getElementById('myForm')
);
```

The types of fields are determined from values and retained in internal state so that values can be coerced from strings in text inputs.

## Schemas

You can also provide a set of fields as a schema to properly coerce types.

```js
const myValue = { name: { firstName: '', lastName: '' }, age: 0 };

const fields = [
  {
    key: 'age',
    type: 'Integer',
  },
];

React.render(
  <FormContainer defaultValue={myValue} onChange={onChange} fields={fields}>
    <form>
      <FieldContainer fieldKey="name">
        <TextField label="First Name" fieldKey="firstName" />
        <TextField label="Last Name" fieldKey="lastName" />
      </FieldContainer>
      <TextField label="Age" fieldKey="age" />
      <input type="submit" />
    </form>
  </FormContainer>,
  document.getElementById('myForm')
);
```

Note that you don't have to supply a full schema. The rest of the schema can be inferred.

We could support JSON schemas as well, but because field schemas can also be used for auto-forms, we reuse them here. We can't rely solely on JSON schemas for auto-forms, because we want to be able to serialize schemas. Because JSON properties are not guaranteed to be retain ordering when serialized in some systems, the way properties are defined as objects in JSON schemas makes it unsuitable as a schema for ordered fields. Additionally, Formatic's field schemas are equally concerned with UI metadata around fields as much as values created by those fields. JSON schemas are more concerned with validation of data than the UI to edit that data.

## Dynamic forms

You now have most of the tools needed to generate dynamic forms.

```js
const myValue = { firstName: '', lastName: '' };

const fields = [
  {
    key: 'firstName',
    label: 'First Name',
    type: 'String',
  },
  {
    key: 'lastName',
    label: 'Last Name',
    type: 'String',
  },
];

React.render(
  <FormContainer defaultValue={myValue} onChange={onChange} fields={fields}>
    <form>
      {fields.map(field => (
        <TextField key={field.key} fieldKey={field.key} label={field.label} />
      ))}
      <input type="submit" />
    </form>
  </FormContainer>,
  document.getElementById('myForm')
);
```

In that example though, we're assuming everything is a `TextField`. We also don't account for nested fields. And a schema is required. There is a hook to help with all of that. Previously, we used `useField` to build a field for a specific key. We can use `useAutoFields` to build fields for a particular context.

```js
import { FormContainer, FieldContainer } from 'formatic';

import { MyStringield, MyIntegerField } from 'my-app';

const myValue = { name: { firstName: '', lastName: '' }, age: 0 };

const autoFieldComponents = {
  String: MyStringField,
  Integer: MyIntegerField,
};

const AutoFields = () => {
  const autoFields = useAutoFields();
  return (
    <div className="my-auto-fields">
      {autoFields.map(({ field, ...fieldProps }) => {
        if (field.type === 'Fields') {
          return (
            <FieldContainer fieldKey={field.key}>
              <AutoFields />
            </FieldContainer>
          );
        }
        const FieldComponent = autoFieldComponents[field.type];
        return <FieldComponent {...fieldProps} />;
      })}
    </div>
  );
};

React.render(
  <FormContainer defaultValue={myValue} onChange={onChange}>
    <form>
      <AutoFields />
      <input type="submit" />
    </form>
  </FormContainer>,
  document.getElementById('myForm')
);
```

Notice the schema is inferred from the value. Just like before, you could also supply the schema or part of the schema. Of course if you supply the whole schema, `useAutoFields` isn't doing much for you. But you can use `AutoFieldsContainer` to do more of the work.

```js
import { FormContainer, AutoFieldsContainer } from 'formatic';

import { MyStringield, MyIntegerField } from 'my-app';

const myValue = { name: { firstName: '', lastName: '' }, age: 0 };

const fields = [
  {
    key: 'name',
    label: 'Name',
    type: 'Fields',
    fields: [
      {
        key: 'firstName',
        label: 'First Name',
        type: 'String',
      },
      {
        key: 'lastName',
        label: 'Last Name',
        type: 'String',
      },
    ],
  },
  {
    key: 'age',
    label: 'Age',
    type: 'Integer',
  },
];

const Fields = ({ field }) => {
  return (
    <div className="my-nested-auto-fields">
      <FieldContainer fieldKey={field.key}>
        <AutoFieldsContainer />
      </FieldContainer>
    </div>
  );
};

const autoFieldComponents = {
  String: MyStringField,
  Integer: MyIntegerField,
  Fields,
};

React.render(
  <FormContainer defaultValue={myValue} onChange={onChange}>
    <form>
      <div className="my-auto-fields">
        <AutoFieldsContainer components={autoFieldComponents} />
      </div>
      <input type="submit" />
    </form>
  </FormContainer>,
  document.getElementById('myForm')
);
```

## Auto-generated fields

Just like with individual fields, you can also let Formatic use its built-in components for dynamic forms.

```js
import { FormContainer, AutoFields } from 'formatic';

const myValue = { name: { firstName: '', lastName: '' }, age: 0 };

React.render(
  <FormContainer defaultValue={myValue} onChange={onChange}>
    <form>
      <AutoFields />
      <input type="submit" />
    </form>
  </FormContainer>,
  document.getElementById('myForm')
);
```

`AutoFields` generates fields based on the current field context. You can mix it with other Formatic components to have partially auto-generated forms.

```js
<FormContainer defaultValue={myValue} onChange={onChange} fields={fields}>
  <form>
    <FieldContainer fieldKey="name">
      <AutoFields />
    </FieldContainer>
    <TextField label="Age" fieldKey="age" />
    <input type="submit" />
  </form>
</FormContainer>
```

## Customizing auto-generated fields

You can override auto-generated fields just like other Formatic components. Just pass in render callbacks to override the rendering.

```js
import { FormContainer, AutoFields } from 'formatic';

import { ChoicesProvider, useChoices } from 'my-app';

const classNames = {
  TextInput: 'my-auto-text-input',
  IntegerInput: 'my-auto-integer-input',
};

const renderTag = (renderKey, Tag, props) => {
  return <Tag {...props} className={classNames[renderKey]} />;
};

const DynamicSelectInput = ({ SelectInput, ...props }) => {
  const autoField = useAutoField();
  const { choices, loadChoices } = useChoices(autoField.field.endpoint);
  return (
    <SelectInput {...props} choices={choices} onLoadChoices={loadChoices} />
  );
};

const renderComponent = (renderKey, Component, props) => {
  if (renderKey === 'SelectInput') {
    return <DynamicSelectInput {...props} SelectInput={Component} />;
  }
  return <Component {...props} />;
};

const myValue = { name: { firstName: '', lastName: '' }, age: 0, country: '' };

const fields = [
  {
    type: 'Select',
    key: 'country',
    endpoint: 'http://example.com/choices',
  },
];

React.render(
  <FormContainer
    defaultValue={myValue}
    onChange={onChange}
    renderTag={renderTag}
  >
    <form>
      <ChoicesProvider>
        <AutoFields />
      </ChoicesProvider>
      <input type="submit" />
    </form>
  </FormContainer>,
  document.getElementById('myForm')
);
```

Note the use of `useAutoField` to get metadata about the current auto field out of context.

## Validation

The internal form state of a form can hold validation errors, and you can grab those errors just like values with `useField`.

```js
import {
  FormContainer,
  FieldContainer,
  TextField,
  actionTypes,
} from 'formatic';

const myValue = { name: { firstName: '', lastName: '' }, age: 0 };

const FieldError = ({ fieldKey }) => {
  const { error, value } = useField(fieldKey);
  return (
    <div>
      <div>{error}</div>
      <div>You entered: {value}</div>
    </div>
  );
};

const onValidateAction = ({ type, fieldKey, value }) => {
  if (type === actionTypes.set) {
    if (fieldKey === 'age') {
      if (value < 0) {
        return 'Age must be greater than zero.';
      }
    }
  }
};

React.render(
  <FormContainer
    defaultValue={myValue}
    onChange={onChange}
    onValidateAction={onValidateAction}
  >
    <form>
      <FieldContainer fieldKey="name">
        <TextField label="First Name" fieldKey="firstName" />
        <TextField label="Last Name" fieldKey="lastName" />
      </FieldContainer>
      <FieldError fieldKey="age" />
      <TextField label="Age" fieldKey="age" />
      <input type="submit" />
    </form>
  </FormContainer>,
  document.getElementById('myForm')
);
```
