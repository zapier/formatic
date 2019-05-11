import React from 'react';
import 'isomorphic-unfetch';

import Page from '@/docs/components/Page';
import SubSection from '@/docs/components/SubSection';
import Section from '@/docs/components/Section';
import CodeBlock from '@/docs/components/CodeBlock';
import Sections from '@/docs/components/Sections';
import Code from '@/docs/components/Code';

import { loadSnippets } from '@/docs/utils';

const Plugins = props => (
  <Page pageKey="plugins">
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

      <Section title="Plugin API">
        <SubSection title="createElement( name, props, children) )">
          <p>
            You can override the rendering of every component using the{' '}
            <Code>createElement</Code> method. This is useful for wrapping
            components or injecting props into many components based on the
            names of those components.
          </p>
        </SubSection>
        <SubSection title="createElement_* ( props, children) )">
          <p>
            You can override the rendering of a specific component using the{' '}
            <Code>createElement_</Code> methods. This way, you can change the
            props or completely replace that component with a custom component.
          </p>
          <p>
            See <a href="#Adding-Field-Types">Adding Field Types</a> above for
            an example.
          </p>
        </SubSection>
        <SubSection title="renderTag( tagName, tagProps, metaProps, children )">
          <p>
            The <Code>renderTag</Code> method allows you to override the
            rendering of any element of any component. This is useful for adding
            custom styling to components.
          </p>
          <p>
            Here's a simple example where we add a custom <Code>style</Code>{' '}
            attribute.
          </p>
          <CodeBlock language="jsx">
            {props.snippets['plugin-api-renderTag-simple']}
          </CodeBlock>
          <p>
            Ultimately, the default <Code>renderTag</Code> will call
            <Code>React.createElement</Code>, so you have complete control over
            rendering. That does mean you have to handle the{' '}
            <Code>children</Code> properly though. If you render{' '}
            <Code>children</Code>, and it happens to be an array, then you will
            likely get a key warning.{' '}
          </p>
          <p>
            Here's an example using <a href="https://emotion.sh">Emotion</a> for
            CSS in various ways and proper handling of <Code>children</Code>.
          </p>
          <CodeBlock language="jsx">
            {props.snippets['plugin-api-renderTag']}
          </CodeBlock>
        </SubSection>
        <p>
          Lots of other plugin methods can be found in the{' '}
          <a href="https://github.com/zapier/formatic/blob/master/src/default-config.js">
            default config
          </a>
          .
        </p>
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
  'plugin-api-renderTag',
  'plugin-api-renderTag-simple',
];

Plugins.getInitialProps = async () => {
  return { snippets: loadSnippets(snippetKeys) };
};

export default Plugins;
