const fields = [
  {
    label: 'Grouped Fields',
    key: 'groupedFields',
    type: 'grouped-fields',
    helpTextHtml: 'Grouped fields are the best!',
    fields: [
      {
        label: 'Top Level',
        key: 'topLevel',
        type: 'unicode'
      },
      {
        label: 'Section 1 field 1',
        type: 'unicode',
        key: 'section1Field1',
        groupKey: 'section1'
      },
      {
        label: 'Section 1 field 2',
        type: 'unicode',
        key: 'section1Field2',
        groupKey: 'section1'
      },
      {
        label: 'Section 2 field 1',
        type: 'unicode',
        key: 'section2Field1',
        groupKey: 'section2'
      },
      {
        label: 'Section 2 field 2',
        type: 'unicode',
        key: 'section2Field2',
        groupKey: 'section2'
      }
    ]
  }
];

export default {
  title: 'Grouped Fields',
  notes: null,
  fields
};
