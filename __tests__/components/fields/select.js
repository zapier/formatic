/*global describe, it, expect*/

import { renderFieldsToHtml } from '../../../FormaticTestUtils';
import selectExample from '../../../demo/examples/select';

describe('select field', () => {
  it('should render correctly', () => {
    expect(renderFieldsToHtml(selectExample.fields)).toMatchSnapshot();
  });
});
