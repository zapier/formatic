const fields = [
  {
    label: 'Name (R)',
    type: 'unicode',
    key: 'name',
    required: true,
    default: 'Unknown'
  },
  {
    label: 'Readonly Name',
    type: 'unicode',
    key: 'readonlyName',
    default: 'Bob',
    readOnly: true
  },
  {
    label: 'Path',
    type: 'unicode',
    key: 'path',
    replaceChoices: ['tacos', 'nachos', 'bread', 'milk', 'eggs']
  }
];

export default fields;
