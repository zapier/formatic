import '../style/formatic.css';
import React from 'react';
import ReactDOM from 'react-dom';
import Formatic from '../lib/formatic';

let render;
let formValue = 'red';

const onChange = value => {
  formValue = value;
  console.log('new value:', formValue);
  render();
};

render = () => {
  ReactDOM.render(
    <Formatic.JsonInput value={formValue} options={{red: 'Red', blue: 'Blue'}} onChange={onChange}/>,
    document.getElementById('example')
  );
};

render();
