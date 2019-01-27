/*global jasmine, describe, it, expect */

import React from 'react';
import createReactClass from 'create-react-class';
import { mount } from 'enzyme';

import FieldMixin from '../../../lib/mixins/field';
import HelperMixin from '../../../lib/mixins/helper';

const MyHelper = createReactClass({
  displayName: 'MyHelper',

  mixins: [HelperMixin],

  render() {
    return (
      <button
        onClick={() => this.onStartAction('click-me')}
        onFocus={this.onFocusAction}
        onBlur={this.onBlurAction}
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
    const onActionSpy = jasmine.createSpy('onAction');
    const component = mount(<MyField field={field} onAction={onActionSpy} />);
    const button = component.find('button');
    button.simulate('click');
    const actionCall = onActionSpy.calls.mostRecent();
    expect(actionCall.args[0].action).toBe('click-me');
    expect(actionCall.args[0].field.key).toBe('name');
  });
  it('should send focus and blur actions', () => {
    const onActionSpy = jasmine.createSpy('onAction');
    const component = mount(<MyField field={field} onAction={onActionSpy} />);
    const button = component.find('button');
    button.simulate('focus');
    const focusCall = onActionSpy.calls.mostRecent();
    expect(focusCall.args[0].action).toBe('focus');
    expect(focusCall.args[0].field.key).toBe('name');
    button.simulate('blur');
    const blurCall = onActionSpy.calls.mostRecent();
    expect(blurCall.args[0].action).toBe('blur');
    expect(blurCall.args[0].field.key).toBe('name');
  });
});
