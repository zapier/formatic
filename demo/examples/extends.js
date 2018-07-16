const fields = [
  {
    label: 'Colors',
    type: 'checkbox-list',
    key: 'colors',
    choices: ['red', 'green', 'blue'],
  },
  {
    label: 'More colors (extended)',
    key: 'moreColors',
    extends: 'colors',
  },
];

export default {
  title: 'Extends',
  notes: null,
  fields,
};
