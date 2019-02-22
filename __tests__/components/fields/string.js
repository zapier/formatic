/*global describe, it, expect*/

import { renderFieldsToHtml } from '../../../FormaticTestUtils';
import stringExample from '../../../demo/examples/string';

describe('string field', () => {
  it('should render correctly', () => {
    expect(renderFieldsToHtml(stringExample.fields)).toMatchSnapshot();
  });
});
