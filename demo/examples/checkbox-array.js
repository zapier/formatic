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
  },
  {
    label: 'Colors',
    type: 'checkbox-list',
    key: 'colors-alt',
    choices: ['blue', 'yellow', 'purple']
  }
];

export default {
  title: 'Checkbox Array',
  notes: 'Checkbox Array can also be accessed using the alias `checkbox-list`',
  fields
};
