/*global jest, describe, it, expect*/
import React from 'react';
import { mount } from 'enzyme';

import Formatic from '@/src/formatic';
import FieldContainer from '@/src/components/field-container';

describe('FieldContainer', () => {
  it('should pass in onChangeValue', () => {
    const config = Formatic.createConfig(() => ({
      createElement_Upper: props => (
        <FieldContainer {...props}>
          {({ onChangeValue }) => (
            <input
              onChange={event =>
                onChangeValue(event.target.value.toUpperCase())
              }
              value={props.field.value}
            />
          )}
        </FieldContainer>
      ),
    }));
    const fields = [{ type: 'upper', key: 'name' }];
    const value = { name: 'foo' };
    const onChangeFormSpy = jest.fn();
    const component = mount(
      <Formatic
        config={config}
        fields={fields}
        onChange={onChangeFormSpy}
        value={value}
      />
    );
    const input = component.find('input');
    const props = input.props();
    expect(props.value).toBe('foo');
    input.simulate('change', { target: { value: 'fooz' } });
    expect(onChangeFormSpy.mock.calls[0][0]).toEqual({
      name: 'FOOZ',
    });
  });
});
