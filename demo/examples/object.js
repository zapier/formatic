const fields = [
  {
    label: 'Mapping Pretty Text',
    type: 'object',
    key: 'mapping',
    itemFields: [{
      type: 'pretty-text',
      hideLabel: true
    }],
    default: {
      key1: 'value1',
      key2: 'value2'
    }
  },
  {
    label: 'Dictionary',
    type: 'dict',
    key: 'dict',
    itemFields: [{
      type: 'pretty-text',
      hideLabel: true
    }],
    default: {
      key1: 'key1',
      key2: 'key2'
    }
  }
];

export default {
  title: 'Object',
  aliases: ['object', 'dict'],
  notes: null,
  fields
};
