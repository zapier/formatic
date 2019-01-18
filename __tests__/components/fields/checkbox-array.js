/*global describe, it, expect*/

import { renderFieldsToHtml } from '../../../FormaticTestUtils';
import checkboxArrayExample from '../../../demo/examples/checkbox-array';

describe('checkbox-array field', () => {
  it('should render correctly', () => {
    expect(renderFieldsToHtml(checkboxArrayExample.fields)).toMatchSnapshot();
  });
});
