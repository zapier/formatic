/*global describe, it, expect*/

import { renderFieldsToHtml } from '../../../FormaticTestUtils';
import checkboxBooleanExample from '../../../demo/examples/checkbox-boolean';

describe('checkbox-boolean field', () => {
  it('should render correctly', () => {
    expect(renderFieldsToHtml(checkboxBooleanExample.fields)).toMatchSnapshot();
  });
});
