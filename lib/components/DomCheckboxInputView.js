import React from 'react';

const DomCheckboxInputView = props => (
  <input type="checkbox" {...props} checked={Boolean(props.value)}/>
);

export default DomCheckboxInputView;
