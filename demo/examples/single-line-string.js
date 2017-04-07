const fields = [
  {
    label: 'single line string',
    type: 'single-line-string',
    key: 'single-line-string',
    autoFocus: true,
    placeholder: 'type something...',
    autoComplete: 'on'
  },
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

export default {
  title: 'Single Line String',
  notes: 'Single List String can also be accessed under the alias of `unicode` and `string`',
  fields
};
