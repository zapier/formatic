const fields = [
  {
    id: 'object-1',
    label: 'Mapping Pretty Text',
    type: 'object',
    key: 'mapping',
    itemFields: [
      {
        type: 'pretty-text',
        isSingleLine: true,
        hideLabel: true,
        id: 'object-1-1',
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
    id: 'object-2',
    label: 'Dictionary',
    type: 'dict',
    key: 'dict',
    itemFields: [
      {
        id: 'object-2-1',
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
