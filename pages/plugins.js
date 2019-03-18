import React from 'react';
import 'isomorphic-unfetch';

import Page from '@/docs/components/Page';
import Section from '@/docs/components/Section';
import CodeBlock from '@/docs/components/CodeBlock';
import Sections from '@/docs/components/Sections';
import Code from '@/docs/components/Code';

import { loadSnippets } from '@/docs/utils';

const Plugins = props => (
  <Page pageKey="plugins" title="Plugins">
    <Sections>
      <Section title="Config">
        <p>
          Plugins are simply functions that help to create a configuration
          object that is passed into Formatic, so first let's talk about the
          config.
        </p>
        <p>
          Almost all of Formatic's behavior is passed in via the{' '}
          <Code>config</Code> property. If you pass in no config, then Formatic
          uses it's own{' '}
          <a href="https://github.com/zapier/formatic/blob/master/src/default-config.js">
            default config plugin
          </a>{' '}
          to create a config for you. To change Formatic's behavior, you simply
          pass in a config object with different methods.
        </p>
        <p>Passing in no config:</p>
        <CodeBlock language="javascript">
          {props.snippets['plugin-no-config']}
        </CodeBlock>
        <p>Is equivalent to this:</p>
        <CodeBlock language="javascript">
          {props.snippets['plugin-default-config']}
        </CodeBlock>
      </Section>

      <Section title="A Simple Plugin Example">
        <p>
          Plugins are just functions that help in the creation of a config.
          Here's a simple plugin that will will use the key instead of the label
          of a field if the label is not present.
        </p>
        <CodeBlock language="javascript">
          {props.snippets['plugin-fieldLabel']}
        </CodeBlock>
        <p>
          Note that plugin functions receive the config as a parameter, so you
          can delegate to other methods on the config. Let's "humanize" our key
          by calling the <Code>config.humanize</Code> method on the config.
        </p>
        <CodeBlock language="javascript">
          {props.snippets['plugin-humanize']}
        </CodeBlock>
        <p>
          Also note that at the point in time config is passed in, it's had all
          previous plugins applied. So you can save any existing methods for
          wrapping. Here, we'll delegate back to the original{' '}
          <Code>fieldLabel</Code> method.
        </p>
        <CodeBlock language="javascript">
          {props.snippets['plugin-delegate']}
        </CodeBlock>
      </Section>

      <Section title="Using Plugins">
        <p>
          To use a plugin, just pass it in to <Code>Formatic.createConfig</Code>
          .
        </p>
        <CodeBlock language="javascript">
          {props.snippets['plugin-using']}
        </CodeBlock>
        <p>
          You can pass in multiple plugins. If multiple plugins define the same
          method, the config will get the method from the last plugin. As shown
          above though, each plugin's method can delegate to an earlier plugin's
          method.
        </p>
        <CodeBlock language="javascript">
          {props.snippets['plugin-using-multiple']}
        </CodeBlock>
      </Section>

      <Section title="Adding Field Types">
        <p>
          To add a new field type, you can use the `FieldContainer` component to
          create the field component, and you point to it with a plugin.
        </p>
        <CodeBlock language="jsx">
          {props.snippets['plugin-field-type']}
        </CodeBlock>
      </Section>
    </Sections>
  </Page>
);

const snippetKeys = [
  'plugin-no-config',
  'plugin-default-config',
  'plugin-fieldLabel',
  'plugin-humanize',
  'plugin-delegate',
  'plugin-using',
  'plugin-using-multiple',
  'plugin-field-type',
];

Plugins.getInitialProps = async () => {
  return { snippets: loadSnippets(snippetKeys) };
};

export default Plugins;
