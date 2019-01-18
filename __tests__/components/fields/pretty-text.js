/*global describe, it, expect*/

import { renderFieldsToHtml } from '../../../FormaticTestUtils';
import prettyBooleanExample from '../../../demo/examples/pretty-boolean';

describe('pretty-boolean field', () => {
  it('should render correctly', () => {
    expect(renderFieldsToHtml(prettyBooleanExample.fields)).toMatchSnapshot();
  });
});
