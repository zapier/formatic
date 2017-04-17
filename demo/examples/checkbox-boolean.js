const fields = [
  {
    label: 'Enable Read-only',
    type: 'checkbox-boolean',
    key: 'readonly-checkbox-boolean',
    default: true,
    readOnly: true
  },
  {
    label: 'Is this checked?',
    type: 'checkbox-boolean',
    key: 'checkbox-boolean',
    default: true,
    readOnly: false
  },
  {
    label: 'Is this a checkbox?',
    type: 'checkbox',
    key: 'checkbox',
    default: true,
    readOnly: false
  }
];

export default {
  title: 'Checkbox Boolean',
  aliases: ['checkbox-boolean', 'checkbox'],
  notes: null,
  fields
};
