const fields = [
  {
    id: 'string-1',
    label: 'String',
    key: 'string-example',
    type: 'string',
  },
  {
    id: 'string-2',
    label: 'Note',
    type: 'text',
    key: 'note',
    required: true,
  },
  {
    id: 'string-3',
    label: 'Groceries',
    type: 'text',
    key: 'groceries',
    selectedReplaceChoices: [
      {
        value: 'secret',
        label: 'KFC',
      },
    ],
    replaceChoices: [
      'tacos',
      'nachos',
      'bread',
      'milk',
      'eggs',
      {
        label: 'Order Groceries',
        action: 'order-groceries',
      },
    ],
  },
];

export default {
  title: 'String',
  aliases: ['string', 'text'],
  notes: null,
  fields,
};
