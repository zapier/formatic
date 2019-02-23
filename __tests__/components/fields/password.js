/*global describe, it, expect*/

import { renderFieldsToHtml } from '@/src/FormaticTestUtils';
import passwordExample from '@/demo/examples/password';

describe('password field', () => {
  it('should render correctly', () => {
    expect(renderFieldsToHtml(passwordExample.fields)).toMatchSnapshot();
  });
});
