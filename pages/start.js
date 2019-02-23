import React from 'react';
import 'isomorphic-unfetch';

import Formatic from '@/src/formatic';
import Page from '@/docs/components/Page';
import Section from '@/docs/components/Section';
import SubSection from '@/docs/components/SubSection';
import CodeBlock from '@/docs/components/CodeBlock';
import Example from '@/docs/components/Example';
import Sections from '@/docs/components/Sections';

import { loadSnippets } from '@/docs/utils';

const basicExampleFields = [
  {
    type: 'single-line-string',
    key: 'firstName',
    label: 'First Name',
  },
  {
    type: 'single-line-string',
    key: 'lastName',
    label: 'Last Name',
  },
];

const basicExampleValue = {
  firstName: 'Joe',
  lastName: 'Foo',
};

const Start = props => (
  <Page pageKey="start">
    <Sections>
      <Section title="Install">
        <SubSection title="npm">
          <CodeBlock language="bash">{`npm install formatic --save`}</CodeBlock>
        </SubSection>
        <SubSection title="yarn">
          <CodeBlock language="bash">{`yarn add formatic`}</CodeBlock>
        </SubSection>
      </Section>
      <Section title="Basic Usage">
        <p>
          Basic usage of Formatic is pretty simple. Formatic is just a React
          component. Pass in the fields as props to render your fields.
        </p>
        <CodeBlock language="javascript">
          {props.snippets['basic-example']}
        </CodeBlock>
        <p>That example gives us this form:</p>
        <Example>
          <Formatic fields={basicExampleFields} />
        </Example>
        <p>You can also pass a value for the fields.</p>
        <CodeBlock language="javascript">
          {props.snippets['basic-example-with-value']}
        </CodeBlock>
        <p>
          Used this way, Formatic is a controlled component. So if you try to
          edit the values in this form, you'll notice you can't.
        </p>
        <Example>
          <Formatic fields={basicExampleFields} value={basicExampleValue} />
        </Example>
        <p>
          That's because we're always setting it to a fixed value. We need to
          use the `onChange` handler to keep the value in sync with the changes,
          just like with an `input` element.
        </p>
        <CodeBlock language="javascript">
          {props.snippets['basic-example-with-on-change']}
        </CodeBlock>
        <p>
          Now above, when we didn't supply a value, we were using Formatic as an
          uncontrolled component. You can also pass a `defaultValue` and use
          Formatic as an uncontrolled component.
        </p>
        <CodeBlock language="javascript">
          {props.snippets['basic-example-uncontrolled']}
        </CodeBlock>
      </Section>
    </Sections>
  </Page>
);

const snippetKeys = [
  'basic-example',
  'basic-example-with-value',
  'basic-example-with-on-change',
  'basic-example-uncontrolled',
];

Start.getInitialProps = async () => {
  return { snippets: loadSnippets(snippetKeys) };
};

export default Start;
