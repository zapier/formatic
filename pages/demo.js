import React, { Component } from 'react';
import _ from 'lodash';
import Formatic from '@/src/formatic';

import Page from '@/docs/components/Page';
import Sections from '@/docs/components/Sections';
import Section from '@/docs/components/Section';
import Button from '@/docs/components/Button';

import examples from '@/demo/examples';

import customPlugin from '@/demo/examples/custom-plugin';
import cssPlugin from '@/src/plugins/css-plugin';

const Form = React.createFactory(Formatic);

// Draws a hint box around each component.
const HintBox = props => (
  <div
    style={{
      padding: '1px',
      margin: '1px',
      border: '1px solid black',
      display: 'inline-block',
    }}
  >
    <span style={{ fontStyle: 'italic', fontSize: '12px' }}>{props.name}</span>
    {props.children}
  </div>
);

// Inject a HintBox into each createElement_ hook to show hints
// for plugin methods.
const hintPlugin = config => {
  const prevConfig = _.extend({}, config);
  return Object.keys(config).reduce(
    (newConfig, key) => {
      if (key.startsWith('createElement_')) {
        newConfig[key] = props => (
          <HintBox key={props.key} name={key}>
            {prevConfig[key](props)}
          </HintBox>
        );
      }
      return newConfig;
    },
    {
      renderTag: (tag, tagProps, metaProps, ...children) => {
        return (
          <HintBox
            name={`renderTag:(${tag}:${metaProps.typeName}:${
              metaProps.elementName
            })`}
          >
            {prevConfig.renderTag(tag, tagProps, metaProps, ...children)}
          </HintBox>
        );
      },
    }
  );
};

const dynamicReplaceChoices = {};

const loadDynamicReplaceChoices = (field, onLoaded) => {
  if (field.dynamicReplaceChoices && !dynamicReplaceChoices[field.key]) {
    console.info(`loading choices for ${field.key}...`);
    setTimeout(() => {
      dynamicReplaceChoices[field.key] = field.dynamicReplaceChoices;
      console.info('loaded:', field.dynamicReplaceChoices);
      onLoaded();
    }, 2000);
  }
};

// Simulate dynamic replace choices.
const fakeDynamicPlugin = ({ fieldReplaceChoices }) => ({
  fieldReplaceChoices: field => {
    if (field.dynamicReplaceChoices) {
      if (dynamicReplaceChoices[field.key]) {
        return dynamicReplaceChoices[field.key];
      }
      return [
        {
          value: '///loading///',
        },
      ];
    }
    return fieldReplaceChoices(field);
  },
});

const config = Formatic.createConfig(
  cssPlugin,
  Formatic.plugins.reference,
  Formatic.plugins.meta,
  customPlugin,
  fakeDynamicPlugin
);

const hintConfig = Formatic.createConfig(
  cssPlugin,
  Formatic.plugins.reference,
  Formatic.plugins.meta,
  customPlugin,
  fakeDynamicPlugin,
  hintPlugin
);

const convertTitleToId = title => title.toLowerCase().replace(/ /g, '-');

const DisplayFormValue = props => (
  <div>
    <h5>{props.title} Form State:</h5>
    <pre>{JSON.stringify(props.value, null, 2)}</pre>
  </div>
);

const generateAliases = aliases =>
  aliases
    .map((alias, idx) => (
      <span className="code" key={idx}>
        {alias}
      </span>
    ))
    .reduce(
      (acc, elem) => (acc === null ? [elem] : [...acc, ', ', elem]),
      null
    );

class FormDemo extends Component {
  constructor(props) {
    super();

    this.state = {
      formState: config.createRootValue(props),
      fields: props.fields,
      hints: {},
    };
  }

  onChange(newValue, info) {
    console.info('onChange:', newValue);
    console.info('Field Info:', info);

    this.setState({
      formState: newValue,
    });
  }

  onChangeFields(newValue) {
    this.setState({
      fields: newValue.source,
    });
  }

  onChangeHint(id) {
    const hints = _.extend({}, this.state.hints);
    hints[id] = !hints[id];
    this.setState({
      hints,
    });
  }

  onEvent(eventName, event) {
    console.info(eventName, event.path, event.field);
  }

  onCustomEvent(eventName, info) {
    console.info(eventName, info);
  }

  render() {
    const { title, notes, aliases } = this.props;

    const aliasContent = !aliases ? null : (
      <p>Aliases: {generateAliases(aliases)}</p>
    );

    const typeName = convertTitleToId(title);

    const typeContent =
      typeName === 'unknown-field' ? null : (
        <p>
          Type: <span className="code">{convertTitleToId(title)}</span>
        </p>
      );

    const id = convertTitleToId(title);

    return (
      <div id={id}>
        <div className="row">
          <div className="col-sm-12">
            {/* <h3>
              {title}
              <a className="form-link" href={`#${convertTitleToId(title)}`}>
                <span className="glyphicon glyphicon-link" />
              </a>
            </h3> */}
            <hr />
            {typeContent}
            {aliasContent}
            <p>
              <Button onClick={() => this.onChangeHint(id)}>
                Toggle Plugin Hints
              </Button>
            </p>
            <p>{notes}</p>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-8">
            <div className="form-example">
              <Form
                config={this.state.hints[id] ? hintConfig : config}
                fields={this.state.fields}
                onBlur={e => this.onEvent('onBlur', e)}
                onChange={this.onChange.bind(this)}
                onClearCurrentChoice={info =>
                  this.onCustomEvent('onClearCurrentChoice', info)
                }
                onCloseReplacements={info =>
                  this.onCustomEvent('onCloseReplacements', info)
                }
                onFocus={e => this.onEvent('onFocus', e)}
                onOpenReplacements={info => {
                  loadDynamicReplaceChoices(info.field, () => {
                    this.setState({});
                  });
                  this.onCustomEvent('onOpenReplacements', info);
                }}
                onOrderGroceries={info =>
                  this.onCustomEvent('onOrderGroceries', info)
                }
                readOnly={false}
                value={this.state.formState}
              />
            </div>
          </div>
          <div className="col-sm-4">
            <DisplayFormValue title={title} value={this.state.formState} />
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12">
            <Form
              config={config}
              fields={{
                type: 'fieldset',
                collapsed: true,
                label: 'Example JSON',
                fields: [
                  {
                    key: 'source',
                    type: 'json',
                    default: this.state.fields,
                  },
                ],
              }}
              onChange={this.onChangeFields.bind(this)}
            />
          </div>
        </div>
      </div>
    );
  }
}

const sortedExamples = _.sortBy(examples, ['title']);

const DemoPage = () => (
  <Page pageKey="demo">
    <Sections>
      {sortedExamples.map((form, idx) => (
        <Section key={form.title} title={form.title}>
          <FormDemo key={idx} {...form} />
        </Section>
      ))}
    </Sections>
  </Page>
);

export default DemoPage;
