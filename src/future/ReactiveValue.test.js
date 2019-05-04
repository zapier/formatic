/*global describe, test, expect*/

import React, { useState } from 'react';
import { render, fireEvent, cleanup } from 'react-testing-library';

import {
  ReactiveValueContainer,
  useReactiveValue,
  useReactiveValueAt,
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
  expect(onChangeSpy.mock.calls[0]).toEqual([
    {
      firstName: 'Joe',
      lastName: '',
    },
  ]);
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
  expect(onChangeSpy.mock.calls[0]).toEqual([
    {
      firstName: 'Joe',
      lastName: '',
    },
  ]);
  expect(firstNameRenderSpy.mock.calls.length).toBe(2);
  expect(lastNameRenderSpy.mock.calls.length).toBe(1);
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
  expect(firstNameRenderSpy.mock.calls.length).toBe(2);
  expect(lastNameRenderSpy.mock.calls.length).toBe(1);
  fireEvent.click(getByTestId('upperCase'));
  expect(firstNameRenderSpy.mock.calls.length).toBe(3);
  expect(lastNameRenderSpy.mock.calls.length).toBe(1);
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
    const { value, setValue } = useReactiveValueAt('name');
    nameRenderSpy();
    return (
      <ReactiveValueContainer onChange={setValue} value={value}>
        {children}
      </ReactiveValueContainer>
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
  expect(onChangeSpy.mock.calls[0]).toEqual([
    {
      name: {
        firstName: 'Joe',
        lastName: '',
      },
      age: 50,
    },
  ]);
  expect(firstNameRenderSpy.mock.calls.length).toBe(2);
  expect(lastNameRenderSpy.mock.calls.length).toBe(1);
  expect(nameRenderSpy.mock.calls.length).toBe(2);
  expect(ageRenderSpy.mock.calls.length).toBe(1);
  fireEvent.change(getByTestId('age'), {
    // See above where we coerce value.
    target: { value: '51' },
  });
  expect(onChangeSpy.mock.calls[1]).toEqual([
    {
      name: {
        firstName: 'Joe',
        lastName: '',
      },
      age: 51,
    },
  ]);
  expect(firstNameRenderSpy.mock.calls.length).toBe(2);
  expect(lastNameRenderSpy.mock.calls.length).toBe(1);
  expect(nameRenderSpy.mock.calls.length).toBe(2);
  expect(ageRenderSpy.mock.calls.length).toBe(2);
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
  expect(firstNameRenderSpy.mock.calls.length).toBe(1);
  expect(lastNameRenderSpy.mock.calls.length).toBe(1);
  fireEvent.change(getByTestId('firstName'), {
    target: { value: 'Joe' },
  });
  expect(firstNameRenderSpy.mock.calls.length).toBe(2);
  expect(lastNameRenderSpy.mock.calls.length).toBe(1);
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
  expect(firstNameRenderSpy.mock.calls.length).toBe(2);
  expect(lastNameRenderSpy.mock.calls.length).toBe(2);
});
