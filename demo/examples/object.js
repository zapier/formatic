const fields = [
  {
    label: 'Mapping Pretty Text',
    type: 'object',
    key: 'mapping',
    itemFields: [
      {
        type: 'pretty-text',
        isSingleLine: true,
        hideLabel: true,
        replaceChoices: [
          {
            label: 'Red',
            value: 'red',
          },
          {
            label: 'Green',
            value: 'green',
          },
          {
            label: 'Blue',
            value: 'blue',
          },
        ],
      },
    ],
    default: {
      key1: 'value1',
      key2: 'value2',
    },
  },
  {
    label: 'Dictionary',
    type: 'dict',
    key: 'dict',
    itemFields: [
      {
        type: 'single-line-string',
        hideLabel: true,
      },
    ],
    default: {
      key1: 'key1',
      key2: 'key2',
    },
  },
];

export default {
  title: 'Object',
  aliases: ['object', 'dict'],
  notes: null,
  fields,
};
