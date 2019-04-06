import React, { useState } from 'react';

import Page from '@/docs/components/Page';
import Sections from '@/docs/components/Sections';
import Section from '@/docs/components/Section';

const requireContext = require.context('@/demo/future', true, /\.js$/);

const examples = requireContext.keys().map(key => {
  const example = requireContext(key);
  return {
    key,
    ...example,
    defaultValue:
      example.defaultValue === undefined ? example.value : example.defaultValue,
    isControlled: example.value === undefined ? false : true,
  };
});

function ChangeDisplay({ defaultValue, children }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div>
      {children({ value, onChange: setValue })}
      <pre>{JSON.stringify(value)}</pre>
    </div>
  );
}

const FuturePage = () => (
  <Page pageKey="future">
    <Sections>
      {examples.map(({ key, isControlled, defaultValue, ExampleForm }) => (
        <Section key={key} title={key}>
          <ChangeDisplay defaultValue={defaultValue}>
            {({ value, onChange }) => (
              <ExampleForm
                defaultValue={isControlled ? undefined : defaultValue}
                onChange={onChange}
                value={isControlled ? value : undefined}
              />
            )}
          </ChangeDisplay>
        </Section>
      ))}
    </Sections>
  </Page>
);

export default FuturePage;
