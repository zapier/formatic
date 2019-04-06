import React, { useState } from 'react';

import Page from '@/docs/components/Page';
import Sections from '@/docs/components/Sections';
import Section from '@/docs/components/Section';

const requireContext = require.context('@/demo/future', true, /\.js$/);

const examples = requireContext.keys().map(key => {
  return {
    key,
    ...requireContext(key),
  };
});

function ChangeDisplay({ children }) {
  const [lastChange, setLastChange] = useState(null);
  return (
    <div>
      {children({ onChange: setLastChange })}
      <pre>{JSON.stringify(lastChange)}</pre>
    </div>
  );
}

const FuturePage = () => (
  <Page pageKey="future">
    <Sections>
      {examples.map(({ key, defaultValue, ExampleForm }) => (
        <Section key={key} title={key}>
          <ChangeDisplay>
            {({ onChange }) => (
              <ExampleForm defaultValue={defaultValue} onChange={onChange} />
            )}
          </ChangeDisplay>
        </Section>
      ))}
    </Sections>
  </Page>
);

export default FuturePage;
