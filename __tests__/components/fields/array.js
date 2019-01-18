/*global describe, it, expect*/

import { renderFieldsToHtml } from '../../../FormaticTestUtils';
import arrayExample from '../../../demo/examples/array';

describe('array field', () => {
  it('should render correctly', () => {
    expect(renderFieldsToHtml(arrayExample.fields)).toMatchSnapshot();
  });
});
