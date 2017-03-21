import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import Formatic from '../lib/formatic';

import '../style/formatic.css';

import examples from './examples';
import customPlugin from './examples/custom-plugin';

var Form = React.createFactory(Formatic);

const config = Formatic.createConfig(
  Formatic.plugins.reference,
  Formatic.plugins.meta,
  Formatic.plugins.bootstrap,
  customPlugin,
);

const convertTitleToId = (title) => title.toLowerCase().replace(/ /g, '-');

const DisplayFormValue = (props) => (
  <div>
    <h5>{props.title} Form State:</h5>
    <pre>{JSON.stringify(props.value, null, 2)}</pre>
  </div>
);

class FormDemo extends Component {
  constructor(props) {
    super();

    this.state = {
      formState: config.createRootValue(props)
    };
  }

  onChange(newValue, info) {
    console.info('onChange:', newValue);
    console.info('Field Info:', info);

    this.setState({
      formState: newValue
    });
  }

  onEvent(eventName, event) {
    console.info(eventName, event.path, event.field);
  }

  onCustomEvent(eventName, info) {
    console.info(eventName, info);
  }

  render() {
    const { title } = this.props;

    return (
      <div id={convertTitleToId(title)}>
        <div className="row">
          <div className="col-sm-12">
            <h3>
              {title}
              <a className="form-link" href={`#${convertTitleToId(title)}`}>
                <span className="glyphicon glyphicon-link" />
              </a>
            </h3>
            <hr />
          </div>
        </div>
        <div className="row">
          <div className="col-sm-8">
            <div className="form-example">
              <Form
                config={config}
                fields={this.props.fields}
                value={this.state.formState}
                onChange={this.onChange.bind(this)}
                onFocus={(e) => this.onEvent('onFocus', e)}
                onBlur={(e) => this.onEvent('onBlur', e)}
                onOpenReplacements={(info) => this.onCustomEvent('onOpenReplacements', info)}
                onCloseReplacements={(info) => this.onCustomEvent('onCloseReplacements', info)}
                onClearCurrentChoice={(info) => this.onCustomEvent('onClearCurrentChoice', info)}
                onOrderGroceries={(info) => this.onCustomEvent('onOrderGroceries', info)}
                readOnly={false} />
            </div>
          </div>
          <div className="col-sm-4">
            <DisplayFormValue
              title={title}
              value={this.state.formState} />
          </div>
        </div>
      </div>
    );
  }
}

const sortedExamples = _.sortBy(examples, ['title']);

ReactDOM.render(
  <div className="container">
    <div className="row">
      <div className="col-sm-9">
        <h1>Formatic Demo</h1>
        <hr />

        {
          sortedExamples.map((form, idx) => (
            <FormDemo
              key={idx}
              fields={form.fields}
              title={form.title} />
          ))
        }
      </div>
      <div className="col-sm-3">
        <div className="floating-menu">
          <h6>Examples</h6>

          <ul>
            {
              sortedExamples.map((form, idx) => (
                <li key={idx}>
                  <a href={`#${convertTitleToId(form.title)}`}>{form.title}</a>
                </li>
              ))
            }
          </ul>
        </div>
      </div>
    </div>
  </div>,
  document.getElementById('main')
);
