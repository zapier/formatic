const fields = [
  {
    label: 'String',
    id: 'string',
    key: 'string-example',
    type: 'string'
  },
  {
    label: 'Note',
    type: 'text',
    key: 'note',
    required: true
  },
  {
    label: 'Groceries',
    type: 'text',
    key: 'groceries',
    selectedReplaceChoices: [{
      value: 'secret',
      label: 'KFC'
    }],
    replaceChoices: [
      'tacos', 'nachos', 'bread', 'milk', 'eggs',
      {
        label: 'Order Groceries',
        action: 'order-groceries'
      }
    ]
  }
];

export default {
  title: 'String',
  aliases: ['string', 'text'],
  notes: null,
  fields
};
