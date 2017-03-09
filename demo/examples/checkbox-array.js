const fields = [
  {
    label: 'Colors',
    type: 'checkbox-array',
    key: 'colors',
    choices: ['red', 'green', 'blue'],
    default: 'green',
    readOnly: false
  },
  {
    label: 'Readonly Colors',
    type: 'checkbox-array',
    key: 'readonly-colors',
    choices: ['red', 'green', 'blue'],
    default: 'green',
    readOnly: true
  }
];

export default fields;
