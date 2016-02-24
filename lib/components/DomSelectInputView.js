import React from 'react';

const toDomOption = (option, index) => (
  <option key={option.value || index} value={option.value}>{option.label}</option>
);

const DomSelectInputView = ({options, ...props}) => (
  <select {...props}>
  {
    options.map(toDomOption)
  }
  </select>
);

export default DomSelectInputView;
