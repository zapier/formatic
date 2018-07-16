const fields = [
  {
    label: 'Associative List',
    type: 'assoc-list',
    key: 'assoc-list',
    itemFields: [
      {
        type: 'pretty-text',
        hideLabel: true,
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
