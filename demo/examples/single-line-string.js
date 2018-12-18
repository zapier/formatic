const fields = [
  {
    label: 'single line string',
    helpText: 'help for the single line string field',
    helpTextPlacement: 'after',
    type: 'single-line-string',
    key: 'single-line-string',
    placeholder: 'type something...',
    autoComplete: 'on',
  },
  {
    label: 'Name (R)',
    helpText: 'help for the required name field',
    type: 'unicode',
    key: 'name',
    required: true,
    default: 'Unknown',
  },
  {
    label: 'Readonly Name',
    type: 'unicode',
    key: 'readonlyName',
    default: 'Bob',
    readOnly: true,
  },
  {
    label: 'Path',
    type: 'unicode',
    key: 'path',
    replaceChoices: ['tacos', 'nachos', 'bread', 'milk', 'eggs'],
  },
];

export default {
  title: 'Single Line String',
  aliases: ['single-line-string', 'unicode', 'string'],
  notes: null,
  fields,
};
