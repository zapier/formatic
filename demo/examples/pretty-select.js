const fields = [
  {
    id: 'pretty-select-1',
    label: 'Size',
    type: 'pretty-select',
    key: 'size',
    default: 'S',
    choices: {
      S: 'Small',
      M: 'Medium',
      L: 'Large',
    },
  },
  {
    id: 'pretty-select-2',
    label: 'Readonly Size',
    type: 'pretty-select',
    key: 'readonlySize',
    default: 'S',
    readOnly: true,
    choices: {
      S: 'Small',
      M: 'Medium',
      L: 'Large',
    },
  },
  {
    id: 'pretty-select-3',
    label: 'Colors (R)',
    type: 'pretty-select',
    required: true,
    key: 'colors1',
    placeholder: 'Pick a color...',
    choices: 'red, green, yellow',
  },
  {
    id: 'pretty-select-4',
    label: 'Colors 2',
    type: 'pretty-select',
    key: 'colors2',
    choices: {
      r: 'Red',
      g: 'Green',
    },
  },
  {
    id: 'pretty-select-5',
    label: 'Colors 3',
    helpText: 'Tres colores',
    type: 'pretty-select',
    key: 'colors3',
    customField: {
      label: 'Custom Value',
      helpText: null,
      replaceChoices: [
        {
          value: 'yellow',
          label: 'Yellow',
          sample: 'lemon',
        },
        {
          value: 'purple',
          label: 'Purple',
          sample: 'grape',
        },
      ],
    },
    choices: [
      {
        value: 'r',
        label: 'Red',
        sample: 'cherry',
      },
      {
        value: 'g',
        label: 'Green',
        sample: 'lime',
      },
      {
        value: 'false',
        label: 'False',
        sample: false,
      },
      {
        value: '',
        action: 'clear-current-choice',
        label: 'Clear Current Choice',
      },
      {
        action: 'enter-custom-value',
        label: 'Type a custom value',
      },
      {
        action: 'insert-field',
        label: 'Choose an available field',
      },
      {
        value: 'loadMore',
        label: 'Load more choices..',
        action: 'load-more-choices',
        isOpen: true,
      },
    ],

    default: 'some default value',
  },
  {
    id: 'pretty-select-6',
    label: 'Alphabet',
    type: 'pretty-select',
    key: 'alphabet',
    choices: [
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
      'g',
      'h',
      'i',
      'j',
      'k',
      'l',
      'm',
      'n',
      'o',
      'p',
      'q',
      'r',
      's',
      't',
      'u',
      'v',
      'w',
      'x',
      'y',
      'z',
    ],
  },
  {
    id: 'pretty-select-7',
    label: 'Loading',
    key: 'loading',
    type: 'pretty-select',
    isLoading: true,
    isAccordion: true,
  },
  {
    id: 'pretty-select-8',
    label: 'Empty',
    key: 'empty',
    type: 'pretty-select',
    choices: [],
  },
  {
    id: 'pretty-select-9',
    label: 'Yes/No',
    type: 'pretty-select',
    key: 'prettyBoolean',
    isAccordion: true,
    choices: [
      {
        label: 'yes',
        value: 'true',
      },
      {
        label: 'no',
        value: 'false',
      },
      {
        action: 'enter-custom-value',
        label: 'Use a Custom Value',
      },
      {
        value: '',
        action: 'clear-current-choice',
        label: 'Clear Current Choice',
      },
    ],
  },
  {
    id: 'pretty-select-10',
    label: 'Select with No Search',
    type: 'pretty-select',
    key: 'no-search',
    hasSearch: false,
    default: 'S',
    choices: {
      S: 'Small',
      M: 'Medium',
      L: 'Large',
    },
  },
  {
    id: 'pretty-select-11',
    label: 'Select with Sections',
    type: 'pretty-select',
    key: 'section-select',
    choices: [
      {
        sectionKey: 'size',
        label: 'Size',
      },
      {
        label: 'Large',
        value: 'large',
      },
      {
        label: 'Medium',
        value: 'medium',
      },
      {
        label: 'Small',
        value: 'small',
      },
      {
        sectionKey: 'color',
        label: 'Color',
      },
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
];

export default {
  title: 'Pretty Select',
  notes: null,
  fields,
};
