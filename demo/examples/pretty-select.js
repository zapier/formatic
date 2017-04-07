const fields = [
  {
    label: 'Size',
    type: 'pretty-select',
    key: 'size',
    default: 'S',
    choices: {
      S: 'Small',
      M: 'Medium',
      L: 'Large'
    }
  },
  {
    label: 'Readonly Size',
    type: 'pretty-select',
    key: 'readonlySize',
    default: 'S',
    readOnly: true,
    choices: {
      S: 'Small',
      M: 'Medium',
      L: 'Large'
    }
  },
  {
    label: 'Colors (R)',
    type: 'pretty-select',
    required: true,
    key: 'colors1',
    placeholder: 'Pick a color...',
    choices: 'red, green, yellow'
  },
  {
    label: 'Colors 2',
    type: 'pretty-select',
    key: 'colors2',
    choices: {
      r: 'Red',
      g: 'Green'
    }
  },
  {
    label: 'Colors 3',
    helpText: 'Tres colores',
    type: 'pretty-select',
    key: 'colors3',
    customField: {
      label: 'Custom Value',
      helpText: null
    },
    choices: [
      {
        value: 'r',
        label: 'Red',
        sample: 'cherry'
      },
      {
        value: 'g',
        label: 'Green',
        sample: 'lime'
      },
      {
        value: 'false',
        label: 'False',
        sample: false
      },
      {
        value: '',
        action: 'clear-current-choice',
        label: 'Clear Current Choice'
      },
      {
        action: 'enter-custom-value',
        label: 'Type a custom value'
      },
      {
        action: 'insert-field',
        label: 'Choose an available field'
      },
      {
        value: 'loadMore',
        label: 'Load more choices..',
        action: 'load-more-choices',
        isOpen: true
      }
    ],
    replaceChoices: [
      {
        value: 'yellow',
        label: 'Yellow',
        sample: 'lemon'
      },
      {
        value: 'purple',
        label: 'Purple',
        sample: 'grape'
      }
    ],
    default: 'some default value'
  },
  {
    label: 'Alphabet',
    type: 'pretty-select',
    key: 'alphabet',
    choices: [
      'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
      'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
      'w', 'x', 'y', 'z'
    ]
  },
  {
    label: 'Loading',
    key: 'loading',
    type: 'pretty-select',
    isLoading: true,
    isAccordion: true
  },
  {
    type: 'pretty-select',
    key: 'prettyBoolean',
    isAccordion: true,
    choices: [
      {
        label: 'yes',
        value: 'true'
      },
      {
        label: 'no',
        value: 'false'
      },
      {
        action: 'enter-custom-value',
        label: 'Use a Custom Value'
      },
      {
        value: '',
        action: 'clear-current-choice',
        label: 'Clear Current Choice'
      }
    ]
  },
  {
    label: 'Select with No Search',
    type: 'pretty-select',
    key: 'no-search',
    hasSearch: false,
    default: 'S',
    choices: {
      S: 'Small',
      M: 'Medium',
      L: 'Large'
    }
  }
];

export default {
  title: 'Pretty Select',
  notes: null,
  fields
};
