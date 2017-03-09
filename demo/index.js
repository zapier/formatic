import React from 'react';
import ReactDOM from 'react-dom';
import Formatic from '../lib/formatic';

import '../style/formatic.css';

import customPlugin from './examples/custom-plugin';

var Form = React.createFactory(Formatic);

const config = Formatic.createConfig(
  Formatic.plugins.reference,
  Formatic.plugins.meta,
  Formatic.plugins.bootstrap,
  customPlugin,
);

import arrayExample from './examples/array';
import assocListExample from './examples/assoc-list';
import booleanExample from './examples/boolean';
import checkboxArrayExample from './examples/checkbox-array';
import checkboxBooleanExample from './examples/checkbox-boolean';
import checkboxListExample from './examples/checkbox-list';
import copyExample from './examples/copy';
import extendsExample from './examples/extends';
import fieldsExample from './examples/fields';
import groupedFieldsExample from './examples/grouped-fields';
import jsonExample from './examples/json';
import listExample from './examples/list';
import objectExample from './examples/object';
import passwordExample from './examples/password';
import prettyBooleanExample from './examples/pretty-boolean';
import prettySelectExample from './examples/pretty-select';
import prettyTextExample from './examples/pretty-text';
import selectExample from './examples/select';
import singleLineStringExample from './examples/single-line-string';
import textExample from './examples/text';
import unicodeExample from './examples/unicode';
import unknownExample from './examples/unknown';


const fields = [
  ...arrayExample,
  ...assocListExample,
  ...booleanExample,
  ...checkboxArrayExample,
  ...checkboxBooleanExample,
  ...checkboxListExample,
  ...copyExample,
  ...extendsExample,
  ...fieldsExample,
  ...groupedFieldsExample,
  ...jsonExample,
  ...listExample,
  ...objectExample,
  ...passwordExample,
  ...prettyBooleanExample,
  ...prettySelectExample,
  ...prettyTextExample,
  ...selectExample,
  ...singleLineStringExample,
  ...textExample,
  ...unicodeExample,
  ...unknownExample
];

let formValue = {};

const onFocus = (event) => console.info('onFocus:', event.path, event.field);
const onBlur = (event) => console.info('onBlur:', event.path, event.field);
const onOpenReplacements = (info) => console.info('onOpenReplacements:', info);
const onCloseReplacements = (info) => console.info('onCloseReplacements:', info);
const onClearCurrentChoice = (info) => console.info('onClearCurrentChoice:', info);
const onOrderGroceries = (info) => console.info('onOrderGroceries:', info);

const DisplayFormValue = (props) => (
  <div className="floating-debugger">
    <h3>Current Form State:</h3>
    <pre>{JSON.stringify(props.value, null, 2)}</pre>
  </div>
);

const renderForm = function (value) {
  window.value = value;

  ReactDOM.render(
    <div className="container-fluid">
      <div className="row">
        <div className="col-sm-8">
          <h1>Formatic Demo</h1>
          <hr />

          <Form
            meta={{ msg: "That's a fine name you have there!" }}
            config={config}
            fields={fields}
            value={value}
            onChange={(newValue, info) => {
              console.log('onChange:', newValue);
              console.log('Field Info:', info);

              formValue = newValue;
              renderForm(newValue);
            }}
            onFocus={onFocus}
            onBlur={onBlur}
            onOpenReplacements={onOpenReplacements}
            onCloseReplacements={onCloseReplacements}
            onClearCurrentChoice={onClearCurrentChoice}
            onOrderGroceries={onOrderGroceries}
            readOnly={false}
          />
        </div>
        <div className="col-sm-4">
          <DisplayFormValue value={value} />
        </div>
      </div>
    </div>,
    document.getElementById('main')
  );
};

const setValue = function (value) {
  formValue = value;
  renderForm(formValue);
};

window.setValue = setValue;

formValue.name = 'tom';

setValue(formValue);
