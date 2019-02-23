/*global describe, it, expect*/

import { renderFieldsToHtml } from '@/src/FormaticTestUtils';
import stringExample from '@/demo/examples/string';

describe('string field', () => {
  it('should render correctly', () => {
    expect(renderFieldsToHtml(stringExample.fields)).toMatchSnapshot();
  });
});
