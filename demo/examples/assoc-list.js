const fields = [
  {
    id: 'assoc-list-1',
    label: 'Associative List',
    type: 'assoc-list',
    key: 'assoc-list',
    itemFields: [
      {
        type: 'single-line-string',
        hideLabel: true,
        id: 'assoc-list-1-1',
      },
    ],
    default: [
      {
        key: 'key1',
        value: 'value1',
      },
      {
        key: 'key2',
        value: 'value2',
      },
    ],
  },
];

export default {
  title: 'Associative List',
  notes: null,
  fields,
};
