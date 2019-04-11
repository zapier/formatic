const fields = [
  {
    id: 'array-1',
    label: 'Array',
    type: 'array',
    key: 'yoArray',
  },
  {
    id: 'array-robots',
    label: 'Robots (R)',
    type: 'list',
    key: 'robots',
    required: true,
    itemFields: [
      {
        label: 'Simple',
        match: {
          type: 'simple',
        },
        type: 'fields',
        fields: [
          {
            label: 'Name',
            type: 'unicode',
            key: 'name',
          },
        ],
      },
      {
        label: 'Complex',
        match: {
          type: 'complex',
        },
        type: 'fields',
        fields: [
          {
            label: 'Name',
            type: 'unicode',
            key: 'name',
          },
          {
            label: 'Description',
            type: 'text',
            key: 'description',
          },
        ],
      },
    ],
  },
  {
    id: 'array-pretty',
    label: 'Listing Pretty Text',
    type: 'list',
    key: 'listing',
    itemFields: [
      {
        type: 'pretty-text',
        hideLabel: true,
      },
    ],
  },
];

export default {
  title: 'Array',
  aliases: ['array', 'list'],
  notes: null,
  fields,
};
