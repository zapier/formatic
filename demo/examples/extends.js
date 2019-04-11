const fields = [
  {
    id: 'extends-1',
    label: 'Colors',
    type: 'checkbox-list',
    key: 'colors',
    choices: ['red', 'green', 'blue'],
  },
  {
    id: 'extends-2',
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
