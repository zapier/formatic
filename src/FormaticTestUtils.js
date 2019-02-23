import React from 'react';
import { mount } from 'enzyme';

import Formatic from './formatic';

// Render some Formatic fields to HTML so we can do a snapshot test of them.
// Pass in a callback so you can do assertions on the components as well.
export const renderFieldsToHtml = (fields, handleComponent = () => {}) => {
  const config = Formatic.createConfig();
  const value = config.createRootValue({
    fields,
  });

  const component = mount(
    <Formatic
      config={config}
      fields={fields}
      onChange={() => {}}
      value={value}
    />
  );
  handleComponent(component);
  const html = component.html();
  component.unmount();
  return html;
};
