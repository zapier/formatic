const fields = [
  {
    label: 'Folder',
    type: 'fields',
    key: 'folder',
    match: {
      type: 'folder',
    },
    readOnly: true,
    fields: [
      {
        type: 'unicode',
        key: 'type',
        hidden: true,
        default: 'folder',
      },
      {
        label: 'Name',
        type: 'unicode',
        key: 'name',
      },
      {
        label: 'Children',
        type: 'array',
        key: 'children',
        itemFields: [
          {
            label: 'File',
            type: 'fields',
            match: {
              type: 'file',
            },
            fields: [
              {
                type: 'unicode',
                key: 'type',
                hidden: true,
                default: 'file',
              },
              {
                label: 'Name',
                type: 'unicode',
                key: 'name',
              },
              {
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
    label: 'Grouped Fields Classic',
    helpTextHtml: 'Grouped fields are the bestest!',
    key: 'groupedFieldsClassic',
    type: 'fields',
    fields: [
      {
        label: 'Section 1',
        type: 'fields',
        helpTextHtml: 'Section 1 is the best',
        fields: [
          {
            label: 'Section 1 field 1',
            type: 'unicode',
            key: 'section1Field1',
          },
          {
            label: 'Section 1 field 2',
            type: 'unicode',
            key: 'section1Field2',
          },
        ],
      },
      {
        label: 'Section 2',
        type: 'fields',
        helpTextHtml: 'Section 2 is the best',
        fields: [
          {
            label: 'Section 2 field 1',
            helpText: 'Help for section 2 field 1',
            helpTextPlacement: 'after',
            type: 'unicode',
            key: 'section2Field1',
          },
          {
            label: 'Section 2 field 2',
            helpText: 'Help for section 2 field 2',
            helpTextPlacement: 'after',
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
