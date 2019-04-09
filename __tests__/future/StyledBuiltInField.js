/*global jest, describe, test, expect, afterEach*/
import React from 'react';
import { render, fireEvent, cleanup } from 'react-testing-library';

import { ExampleForm, defaultValue } from '@/demo/future/StyledBuiltInField';

afterEach(cleanup);

describe('styled built-in field', () => {
  test('should use emotion to override styling', () => {
    const onChangeSpy = jest.fn();
    const { getByLabelText } = render(
      <ExampleForm defaultValue={defaultValue} onChange={onChangeSpy} />
    );
    // Emotion generates a class with "css-" in it, so look for that.
    expect(
      getByLabelText('First Name')
        .getAttribute('class')
        .indexOf('css-')
    ).toBeGreaterThan(-1);
    expect(
      getByLabelText('Last Name')
        .getAttribute('class')
        .indexOf('css-')
    ).toBeGreaterThan(-1);
  });
});
