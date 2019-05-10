/*global describe, test, expect*/

import React, { useState } from 'react';
import { render, fireEvent, cleanup } from 'react-testing-library';

import {
  ReactiveValueContainer,
  ReactiveChildContainer,
  useReactiveValue,
  useReactiveValueAt,
  useReactiveValueMeta,
} from './ReactiveValue';

afterEach(cleanup);

function createPureReactiveComponent(name, key, renderSpy) {
  const PureReactiveComponent = React.memo(function PureReactiveComponent() {
    const { value, setValue } = useReactiveValueAt(key);
    if (renderSpy) {
      renderSpy();
    }
    function coerceSetValue(newValue) {
      if (typeof value === 'number') {
        return setValue(parseInt(newValue));
      }
      return setValue(newValue);
    }
    return (
      <input
        data-testid={key}
        onChange={event => coerceSetValue(event.target.value)}
        type="text"
        value={value}
      />
    );
  });
  PureReactiveComponent.displayName = name;
  return PureReactiveComponent;
}

test('should notify of a change to a property', () => {
  const onChangeSpy = jest.fn();
  const FirstName = createPureReactiveComponent('FirstName', 'firstName');
  const { getByTestId } = render(
    <ReactiveValueContainer
      onChange={onChangeSpy}
      value={{ firstName: '', lastName: '' }}
    >
      <FirstName />
    </ReactiveValueContainer>
  );
  fireEvent.change(getByTestId('firstName'), {
    target: { value: 'Joe' },
  });
  expect(onChangeSpy).toHaveBeenLastCalledWith({
    firstName: 'Joe',
    lastName: '',
  });
});

test(`should avoid signaling hook for properties that don't change`, () => {
  const onChangeSpy = jest.fn();
  const firstNameRenderSpy = jest.fn();
  const lastNameRenderSpy = jest.fn();
  const FirstName = createPureReactiveComponent(
    'FirstName',
    'firstName',
    firstNameRenderSpy
  );
  const LastName = createPureReactiveComponent(
    'LastName',
    'lastName',
    lastNameRenderSpy
  );
  const { getByTestId } = render(
    <ReactiveValueContainer
      onChange={onChangeSpy}
      value={{ firstName: '', lastName: '' }}
    >
      <FirstName />
      <LastName />
    </ReactiveValueContainer>
  );
  fireEvent.change(getByTestId('firstName'), {
    target: { value: 'Joe' },
  });
  expect(onChangeSpy).toHaveBeenLastCalledWith({
    firstName: 'Joe',
    lastName: '',
  });
  expect(firstNameRenderSpy).toHaveBeenCalledTimes(2);
  expect(lastNameRenderSpy).toHaveBeenCalledTimes(1);
});

test(`should avoid unnecessary renders as controlled component`, () => {
  const firstNameRenderSpy = jest.fn();
  const lastNameRenderSpy = jest.fn();
  const FirstName = createPureReactiveComponent(
    'FirstName',
    'firstName',
    firstNameRenderSpy
  );
  const LastName = createPureReactiveComponent(
    'LastName',
    'lastName',
    lastNameRenderSpy
  );
  function App() {
    const [rootValue, setRootValue] = useState({
      firstName: '',
      lastName: '',
    });
    function onUpperCase() {
      setRootValue({
        firstName: rootValue.firstName.toUpperCase(),
        lastName: rootValue.lastName.toUpperCase(),
      });
    }
    return (
      <div>
        <ReactiveValueContainer onChange={setRootValue} value={rootValue}>
          <FirstName />
          <LastName />
        </ReactiveValueContainer>
        <input data-testid="upperCase" onClick={onUpperCase} type="button" />
      </div>
    );
  }

  const { getByTestId } = render(<App />);
  fireEvent.change(getByTestId('firstName'), {
    target: { value: 'Joe' },
  });
  expect(firstNameRenderSpy).toHaveBeenCalledTimes(2);
  expect(lastNameRenderSpy).toHaveBeenCalledTimes(1);
  fireEvent.click(getByTestId('upperCase'));
  expect(firstNameRenderSpy).toHaveBeenCalledTimes(3);
  expect(lastNameRenderSpy).toHaveBeenCalledTimes(1);
});

test(`should work with nesting, with no wasted renders`, () => {
  const onChangeSpy = jest.fn();
  const firstNameRenderSpy = jest.fn();
  const lastNameRenderSpy = jest.fn();
  const nameRenderSpy = jest.fn();
  const ageRenderSpy = jest.fn();
  const FirstName = createPureReactiveComponent(
    'FirstName',
    'firstName',
    firstNameRenderSpy
  );
  const LastName = createPureReactiveComponent(
    'LastName',
    'lastName',
    lastNameRenderSpy
  );
  const Age = createPureReactiveComponent('Age', 'age', ageRenderSpy);
  function Name({ children }) {
    nameRenderSpy();
    return (
      <ReactiveChildContainer childKey="name">
        {children}
      </ReactiveChildContainer>
    );
  }
  const { getByTestId } = render(
    <ReactiveValueContainer
      onChange={onChangeSpy}
      value={{ name: { firstName: '', lastName: '' }, age: 50 }}
    >
      <Name>
        <FirstName />
        <LastName />
      </Name>
      <Age />
    </ReactiveValueContainer>
  );
  fireEvent.change(getByTestId('firstName'), {
    target: { value: 'Joe' },
  });
  expect(onChangeSpy).toHaveBeenLastCalledWith({
    name: {
      firstName: 'Joe',
      lastName: '',
    },
    age: 50,
  });
  expect(firstNameRenderSpy).toHaveBeenCalledTimes(2);
  expect(lastNameRenderSpy).toHaveBeenCalledTimes(1);
  expect(nameRenderSpy).toHaveBeenCalledTimes(1);
  expect(ageRenderSpy).toHaveBeenCalledTimes(1);
  fireEvent.change(getByTestId('age'), {
    // See above where we coerce value.
    target: { value: '51' },
  });
  expect(onChangeSpy).toHaveBeenLastCalledWith({
    name: {
      firstName: 'Joe',
      lastName: '',
    },
    age: 51,
  });
  expect(firstNameRenderSpy).toHaveBeenCalledTimes(2);
  expect(lastNameRenderSpy).toHaveBeenCalledTimes(1);
  expect(nameRenderSpy).toHaveBeenCalledTimes(1);
  expect(ageRenderSpy).toHaveBeenCalledTimes(2);
});

test(`should be able to subscribe to the whole value`, () => {
  const firstNameRenderSpy = jest.fn();
  const lastNameRenderSpy = jest.fn();
  const FirstName = createPureReactiveComponent(
    'FirstName',
    'firstName',
    firstNameRenderSpy
  );
  const LastName = createPureReactiveComponent(
    'LastName',
    'lastName',
    lastNameRenderSpy
  );
  function Name() {
    const { value, setValue } = useReactiveValue();
    return (
      <input
        data-testid="name"
        onChange={({ target }) => setValue(JSON.parse(target.value))}
        type="text"
        value={JSON.stringify(value)}
      />
    );
  }
  const { getByTestId } = render(
    <ReactiveValueContainer value={{ firstName: '', lastName: '' }}>
      <FirstName />
      <LastName />
      <Name />
    </ReactiveValueContainer>
  );
  expect(firstNameRenderSpy).toHaveBeenCalledTimes(1);
  expect(lastNameRenderSpy).toHaveBeenCalledTimes(1);
  fireEvent.change(getByTestId('firstName'), {
    target: { value: 'Joe' },
  });
  expect(firstNameRenderSpy).toHaveBeenCalledTimes(2);
  expect(lastNameRenderSpy).toHaveBeenCalledTimes(1);
  expect(getByTestId('name').value).toBe(
    JSON.stringify({
      firstName: 'Joe',
      lastName: '',
    })
  );
  fireEvent.change(getByTestId('name'), {
    target: {
      value: JSON.stringify({
        firstName: 'Joe',
        lastName: 'Foo',
      }),
    },
  });
  expect(firstNameRenderSpy).toHaveBeenCalledTimes(2);
  expect(lastNameRenderSpy).toHaveBeenCalledTimes(2);
});

test('should notify when property types change', () => {
  const onChangeSpy = jest.fn();
  const propertyTypesRenderSpy = jest.fn();
  const FirstName = createPureReactiveComponent('FirstName', 'firstName');
  function PropertyTypes() {
    const meta = useReactiveValueMeta();
    propertyTypesRenderSpy();
    return (
      <div data-testid="meta">
        {Object.keys(meta.propertyTypes)
          .map(key => `${key}:${meta.propertyTypes[key]}`)
          .join(',')}
      </div>
    );
  }
  function Age() {
    const { value = 0, setValue } = useReactiveValueAt('age');
    return (
      <input
        data-testid="age"
        onChange={event => setValue(parseInt(event.target.value))}
        type="text"
        value={value}
      />
    );
  }
  const { getByTestId } = render(
    <ReactiveValueContainer
      onChange={onChangeSpy}
      value={{ firstName: '', lastName: '' }}
    >
      <FirstName />
      <Age />
      <PropertyTypes />
    </ReactiveValueContainer>
  );
  expect(getByTestId('meta')).toHaveTextContent(
    'firstName:string,lastName:string'
  );
  fireEvent.change(getByTestId('firstName'), {
    target: { value: 'Joe' },
  });
  expect(onChangeSpy).toHaveBeenLastCalledWith({
    firstName: 'Joe',
    lastName: '',
  });
  expect(propertyTypesRenderSpy).toHaveBeenCalledTimes(1);
  fireEvent.change(getByTestId('age'), {
    target: { value: 50 },
  });
  expect(onChangeSpy).toHaveBeenLastCalledWith({
    firstName: 'Joe',
    lastName: '',
    age: 50,
  });
  expect(propertyTypesRenderSpy).toHaveBeenCalledTimes(2);
  expect(getByTestId('meta')).toHaveTextContent(
    'firstName:string,lastName:string,age:number'
  );
});

test('should notify when keys change', () => {
  function PropertyTypes() {
    const meta = useReactiveValueMeta();
    return (
      <div data-testid="meta">
        {Object.entries(meta.propertyTypes)
          .map(([key, type]) => `${key}:${type}`)
          .join(',')}
      </div>
    );
  }

  const { getByTestId, rerender } = render(
    <ReactiveValueContainer onChange={() => {}} value={{ firstName: 'Ron' }}>
      <PropertyTypes />
    </ReactiveValueContainer>
  );

  expect(getByTestId('meta')).toHaveTextContent('firstName:string');

  rerender(
    <ReactiveValueContainer
      onChange={() => {}}
      value={{ firstName: 'Ron', lastName: 'Burgundy' }}
    >
      <PropertyTypes />
    </ReactiveValueContainer>
  );

  expect(getByTestId('meta')).toHaveTextContent(
    'firstName:string,lastName:string'
  );
});
