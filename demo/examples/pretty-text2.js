import _ from 'lodash';

const fields = _.range(2).map((idx) => ({
  label: 'Pretty Text 2',
  key: 'prettyText2-' + idx,
  type: 'pretty-text',
  default: 'Hi there {{firstName}} {{lastName}} {{middleName}}.',
  replaceChoices: [
    {
      value: 'firstName',
      label: 'First Name',
      sample: 'Bob',
      tagClasses: {
        special: true
      }
    },
    {
      value: 'lastName',
      label: 'Last Name',
      sample: 'Smith'
    },
    {
      value: 'middleName',
      label: 'A really long label that should break somewhere in the middle and then definitely fill up all the space.'
    }
  ]
}));

export default fields;
