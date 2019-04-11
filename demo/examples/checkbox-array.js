const fields = [
  {
    id: 'checkbox-array-1',
    label: 'Colors',
    type: 'checkbox-array',
    key: 'colors',
    choices: ['red', 'green', 'blue'],
    default: 'green',
    readOnly: false,
  },
  {
    id: 'checkbox-array-2',
    label: 'Readonly Colors',
    type: 'checkbox-array',
    key: 'readonly-colors',
    choices: ['red', 'green', 'blue'],
    default: 'green',
    readOnly: true,
  },
  {
    id: 'checkbox-array-3',
    label: 'Colors',
    type: 'checkbox-list',
    key: 'colors-alt',
    choices: ['blue', 'yellow', 'purple'],
  },
];

export default {
  title: 'Checkbox Array',
  aliases: ['checkbox-array', 'checkbox-list'],
  notes: null,
  fields,
};
