const fields = [
  {
    id: 'grouped-fields-1',
    label: 'Grouped Fields',
    key: 'groupedFields',
    type: 'grouped-fields',
    helpTextHtml: 'Grouped fields are the best!',
    fields: [
      {
        id: 'grouped-fields-1-1',
        label: 'Top Level',
        key: 'topLevel',
        type: 'unicode',
      },
      {
        id: 'grouped-fields-1-2',
        label: 'Section 1 field 1',
        type: 'unicode',
        key: 'section1Field1',
        groupKey: 'section1',
      },
      {
        id: 'grouped-fields-1-3',
        label: 'Section 1 field 2',
        type: 'unicode',
        key: 'section1Field2',
        groupKey: 'section1',
      },
      {
        id: 'grouped-fields-1-4',
        label: 'Section 2 field 1',
        type: 'unicode',
        key: 'section2Field1',
        groupKey: 'section2',
      },
      {
        id: 'grouped-fields-1-5',
        label: 'Section 2 field 2',
        type: 'unicode',
        key: 'section2Field2',
        groupKey: 'section2',
      },
    ],
  },
];

export default {
  title: 'Grouped Fields',
  notes: null,
  fields,
};
