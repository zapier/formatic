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
  }
];

export default fields;
