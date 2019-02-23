/*global jest, describe, it, expect */

import React from 'react';
import createReactClass from 'create-react-class';
import { mount } from 'enzyme';

import FieldMixin from '@/src/mixins/field';
import HelperMixin from '@/src/mixins/helper';

const MyHelper = createReactClass({
  displayName: 'MyHelper',

  mixins: [HelperMixin],

  render() {
    return (
      <button
        onBlur={this.onBlurAction}
        onClick={() => this.onStartAction('click-me')}
        onFocus={this.onFocusAction}
      />
    );
  },
});

const MyField = createReactClass({
  displayName: 'Array',

  mixins: [FieldMixin],

  render() {
    return <MyHelper field={this.props.field} onAction={this.onBubbleAction} />;
  },
});

const field = {
  type: 'Text',
  key: 'name',
};

describe('shared mixin', () => {
  it('should start action', () => {
    const onActionSpy = jest.fn();
    const component = mount(<MyField field={field} onAction={onActionSpy} />);
    const button = component.find('button');
    button.simulate('click');
    const actionCall = onActionSpy.mock.calls[0];
    expect(actionCall[0].action).toBe('click-me');
    expect(actionCall[0].field.key).toBe('name');
  });
  it('should send focus and blur actions', () => {
    const onActionSpy = jest.fn();
    const component = mount(<MyField field={field} onAction={onActionSpy} />);
    const button = component.find('button');
    button.simulate('focus');
    const focusCall = onActionSpy.mock.calls[0];
    expect(focusCall[0].action).toBe('focus');
    expect(focusCall[0].field.key).toBe('name');
    button.simulate('blur');
    const blurCall = onActionSpy.mock.calls[1];
    expect(blurCall[0].action).toBe('blur');
    expect(blurCall[0].field.key).toBe('name');
  });
});
