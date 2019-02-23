/*global describe, it, expect*/

import { renderFieldsToHtml } from '@/src/FormaticTestUtils';
import selectExample from '@/demo/examples/select';

describe('select field', () => {
  it('should render correctly', () => {
    expect(renderFieldsToHtml(selectExample.fields)).toMatchSnapshot();
  });
});
