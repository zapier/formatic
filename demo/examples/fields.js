const fields = [
  {
    id: 'fields-1',
    label: 'Folder',
    type: 'fields',
    key: 'folder',
    match: {
      type: 'folder',
    },
    fields: [
      {
        id: 'fields-1-1',
        type: 'unicode',
        key: 'type',
        hidden: true,
        default: 'folder',
      },
      {
        id: 'fields-1-2',
        label: 'Name',
        type: 'unicode',
        key: 'name',
      },
      {
        id: 'fields-1-3',
        label: 'Children',
        type: 'array',
        key: 'children',
        itemFields: [
          {
            id: 'fields-1-3-1',
            label: 'File',
            type: 'fields',
            match: {
              type: 'file',
            },
            fields: [
              {
                id: 'fields-1-3-1-1',
                type: 'unicode',
                key: 'type',
                hidden: true,
                default: 'file',
              },
              {
                id: 'fields-1-3-1-2',
                label: 'Name',
                type: 'unicode',
                key: 'name',
              },
              {
                id: 'fields-1-3-1-3',
                label: 'Content',
                type: 'text',
                key: 'content',
              },
            ],
          },
          'folder',
        ],
      },
    ],
  },
  {
    id: 'fields-2',
    label: 'Grouped Fields Classic',
    helpTextHtml: 'Grouped fields are the bestest!',
    key: 'groupedFieldsClassic',
    type: 'fields',
    fields: [
      {
        id: 'fields-2-1',
        label: 'Section 1',
        type: 'fields',
        helpTextHtml: 'Section 1 is the best',
        fields: [
          {
            id: 'fields-2-1-1',
            label: 'Section 1 field 1',
            type: 'unicode',
            key: 'section1Field1',
          },
          {
            id: 'fields-2-1-2',
            label: 'Section 1 field 2',
            type: 'unicode',
            key: 'section1Field2',
          },
        ],
      },
      {
        id: 'fields-2-2',
        label: 'Section 2',
        type: 'fields',
        helpTextHtml: 'Section 2 is the best',
        fields: [
          {
            id: 'fields-2-2-1',
            label: 'Section 2 field 1',
            helpText: 'Help for section 2 field 1',
            type: 'unicode',
            key: 'section2Field1',
          },
          {
            id: 'fields-2-2-2',
            label: 'Section 2 field 2',
            helpText: 'Help for section 2 field 2',
            type: 'unicode',
            key: 'section2Field2',
          },
        ],
      },
    ],
  },
];

export default {
  title: 'Fields',
  aliases: ['fields', 'fieldset'],
  notes: null,
  fields,
};
