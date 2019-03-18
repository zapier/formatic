const fields = [
  {
    id: 'checkbox-boolean-1',
    label: 'Enable Read-only',
    type: 'checkbox-boolean',
    key: 'readonly-checkbox-boolean',
    default: true,
    readOnly: true,
  },
  {
    id: 'checkbox-boolean-2',
    label: 'Is this checked?',
    type: 'checkbox-boolean',
    key: 'checkbox-boolean',
    default: true,
    readOnly: false,
  },
  {
    id: 'checkbox-boolean-3',
    label: 'Is this a checkbox?',
    type: 'checkbox',
    key: 'checkbox',
    default: true,
    readOnly: false,
  },
];

export default {
  title: 'Checkbox Boolean',
  aliases: ['checkbox-boolean', 'checkbox'],
  notes: null,
  fields,
};
