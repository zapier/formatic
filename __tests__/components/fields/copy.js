/*global describe, it, expect*/

import { renderFieldsToHtml } from '@/src/FormaticTestUtils';
import copyExample from '@/demo/examples/copy';

describe('copy field', () => {
  it('should render correctly', () => {
    expect(renderFieldsToHtml(copyExample.fields)).toMatchSnapshot();
  });
});
