const fields = [
  {
    id: 'single-line-string-1',
    label: 'single line string',
    helpText: 'help for the single line string field',
    type: 'single-line-string',
    key: 'single-line-string',
    placeholder: 'type something...',
    autoComplete: 'on',
  },
  {
    id: 'single-line-string-2',
    label: 'Name (R)',
    type: 'string',
    isSingleLine: true,
    helpText: 'help for the required name field',
    key: 'name',
    required: true,
    default: 'Unknown',
  },
  {
    id: 'single-line-string-3',
    label: 'Readonly Name',
    type: 'single-line-string',
    key: 'readonlyName',
    default: 'Bob',
    readOnly: true,
  },
  {
    id: 'single-line-string-4',
    label: 'Disabled Name',
    type: 'single-line-string',
    key: 'disabledName',
    default: 'Robert',
    disabled: true,
  },
  {
    id: 'single-line-string-5',
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
