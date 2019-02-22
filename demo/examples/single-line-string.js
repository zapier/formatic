const fields = [
  {
    label: 'single line string',
    helpText: 'help for the single line string field',
    type: 'single-line-string',
    key: 'single-line-string',
    placeholder: 'type something...',
    autoComplete: 'on',
  },
  {
    label: 'Name (R)',
    type: 'string',
    isSingleLine: true,
    helpText: 'help for the required name field',
    key: 'name',
    required: true,
    default: 'Unknown',
  },
  {
    label: 'Readonly Name',
    type: 'single-line-string',
    key: 'readonlyName',
    default: 'Bob',
    readOnly: true,
  },
  {
    label: 'Path',
    type: 'single-line-string',
    key: 'path',
    replaceChoices: ['tacos', 'nachos', 'bread', 'milk', 'eggs'],
  },
];

export default {
  title: 'Single Line String',
  aliases: ['single-line-string', 'string'],
  notes: null,
  fields,
};
