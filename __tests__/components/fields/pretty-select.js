/*global describe, it, expect*/

import { renderFieldsToHtml } from '@/src/FormaticTestUtils';
import prettySelectExample from '@/demo/examples/pretty-select';

describe('pretty-select field', () => {
  it('should render correctly', () => {
    expect(renderFieldsToHtml(prettySelectExample.fields)).toMatchSnapshot();
  });
  prettySelectExample.fields.forEach(field => {
    it(`should render open choices correctly (${field.label})`, () => {
      expect(
        renderFieldsToHtml([field], component => {
          const wrapper = component.find('.pretty-text-click-wrapper');
          wrapper.simulate('click');
        })
      ).toMatchSnapshot();
    });
  });
});
