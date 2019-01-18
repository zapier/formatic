/*global describe, it, expect*/

import { renderFieldsToHtml } from '../../../FormaticTestUtils';
import jsonExample from '../../../demo/examples/json';

describe('json field', () => {
  it('should render correctly', () => {
    expect(renderFieldsToHtml(jsonExample.fields)).toMatchSnapshot();
  });
});
