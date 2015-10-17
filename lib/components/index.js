import React from 'react';

import u from '../undash';
import wrapInput from './wrap-input';
import wrapPure from './wrap-pure';
import wrapChildInput from './wrap-child-input';
import createField from './create-field';
import useContext from './use-context';

import StringInput from './inputs/string';

import ObjectContainer from './containers/object';

import Field from './helpers/field';
import Help from './helpers/help';
import Label from './helpers/label';

const rawInputComponents = {
  StringInput
};

const components = {
  WithContext: {}
};

const useContextParam = {
  contextTypes: {
    onChangeChild: React.PropTypes.func.isRequired,
    components: React.PropTypes.object.isRequired
  },
  contextToProps: {onChangeChild: 'onChange', components: 'components'}
};

Object.keys(rawInputComponents).forEach(key => {
  const RawInputComponent = rawInputComponents[key];
  const PureComponent = wrapPure(RawInputComponent);
  PureComponent.hasEvent = RawInputComponent.hasEvent;
  const InputComponent = wrapInput(PureComponent);
  components[key] = InputComponent;
  const ChildInputComponent = wrapChildInput(InputComponent);
  components[`Child${key}`] = ChildInputComponent;
  components.WithContext[`Child${key}`] = useContext(ChildInputComponent, useContextParam);
});

const inputTypes = ['String'];

inputTypes.forEach(inputType => {
  const InputComponent = components[`${inputType}Input`];
  const FieldComponent = createField(InputComponent);
  components[`${inputType}Field`] = FieldComponent;
  const ChildFieldComponent = wrapChildInput(FieldComponent);
  components[`Child${inputType}Field`] = ChildFieldComponent;
  components.WithContext[`Child${inputType}Field`] = useContext(ChildFieldComponent, useContextParam);
});

console.log(components);

u.extend(components, {
  ObjectContainer,
  Field,
  Help,
  Label
});

export default components;
