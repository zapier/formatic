/*global describe, it, expect*/

import { renderFieldsToHtml } from '../../../FormaticTestUtils';
import prettySelectExample from '../../../demo/examples/pretty-select';

describe('pretty-select field', () => {
  it('should render correctly', () => {
    expect(renderFieldsToHtml(prettySelectExample.fields)).toMatchSnapshot();
  });
});
