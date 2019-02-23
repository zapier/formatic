/*global describe, it, expect*/

import { renderFieldsToHtml } from '@/src/FormaticTestUtils';
import singleLineStringExample from '@/demo/examples/single-line-string';

describe('single-line-string field', () => {
  it('should render correctly', () => {
    expect(
      renderFieldsToHtml(singleLineStringExample.fields)
    ).toMatchSnapshot();
  });
});
