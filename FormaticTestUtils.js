import React from 'react';
import { mount } from 'enzyme';

import Formatic from './lib/formatic';

export const renderFieldsToHtml = fields => {
  const config = Formatic.createConfig();
  const value = config.createRootValue({
    fields,
  });

  const component = mount(
    <Formatic
      config={config}
      value={value}
      fields={fields}
      onChange={() => {}}
    />
  );
  const html = component.html();
  component.unmount();
  return html;
};
