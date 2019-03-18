const fields = [
  {
    id: 'pretty-text-1',
    label: 'Pretty Text',
    key: 'prettyText',
    type: 'pretty-text',
    default: 'Hi there {{firstName}} {{lastName}} {{middleName}}.',
    replaceChoices: [
      {
        value: 'firstName',
        label: 'First Name',
        sample: 'Bob',
        tagClasses: {
          special: true,
        },
      },
      {
        value: 'lastName',
        label: 'Last Name',
        sample: 'Smith',
      },
      {
        value: 'middleName',
        label:
          'A really long label that should break somewhere in the middle and then definitely fill up all the space.',
      },
    ],
  },
  {
    id: 'pretty-text-2',
    label: 'Pretty Text with integer default',
    key: 'integerPrettyText',
    type: 'pretty-text',
    default: 1,
    placeholder: 1,
  },
  {
    id: 'pretty-text-3',
    label: 'Group',
    type: 'fields',
    fields: [
      {
        label: 'Pretty Text with integer default',
        key: 'integerPrettyTextGrouped',
        type: 'pretty-text',
        default: 1,
        placeholder: 1,
      },
    ],
  },
  {
    id: 'pretty-text-4',
    label: 'Readonly pretty text',
    key: 'readonlyPrettyText',
    type: 'pretty-text',
    default: "Nah nah you can't edit me",
    readOnly: true,
  },
  {
    id: 'pretty-text-5',
    label: 'Accordion Names',
    key: 'nestedPrettyText',
    type: 'pretty-text',
    isAccordion: true,
    default: 'Hi there {{firstName}} {{lastName}} {{middleName}}.',
    isLoading: true,
    replaceChoices: [
      {
        label: 'Name',
        value: 'name',
      },
      {
        label: 'Hi Class People',
        sectionKey: 'hiClass',
      },
      {
        value: 'givenName',
        label: 'Given Name',
        sample: 'Sir Duke',
        tagClasses: {
          special: true,
        },
      },
      {
        value: 'surname',
        label: 'Surname',
        sample: 'Ellington',
      },
      {
        label: 'Lo Class People',
        sectionKey: 'loClass',
      },
      {
        value: 'firstName',
        label: 'First Name',
        sample: 'Peasant',
      },
      {
        value: 'lastName',
        label: 'Last Name',
        sample: 'Brown',
      },
      {
        sectionKey: null,
        value: 'extraName',
        label: 'Extra Name',
        sample: 'Extra',
      },
    ],
  },
  {
    id: 'pretty-text-6',
    label: 'Pretty Text with Dynamic Fields',
    key: 'prettyTextDynamic',
    type: 'pretty-text',
    // Not a built-in, just for testing dynamic things.
    dynamicReplaceChoices: [
      {
        value: 'something',
        label: 'Something',
      },
      {
        value: 'something-else',
        label: 'Something Else',
      },
    ],
  },
];

export default {
  title: 'Pretty Text',
  aliases: ['pretty-text', 'pretty-textarea'],
  notes: null,
  fields,
};
