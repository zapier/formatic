import '../style/formatic.css';
import React from 'react';
import ReactDOM from 'react-dom';
import Formatic from '../lib/formatic';
import _ from 'lodash';

const R = React.DOM;

var Form = React.createFactory(Formatic);

var plugin = function (config) {

  var initField = config.initField;
  var origCreatePrettyTag = config.createElement_PrettyTag;

  config.createElement_PrettyTag = function (props, children) {
    //var choice = _.find(this.props.replaceChoices, (c) => c.value === tag);
    var tag = props.tag;
    var choice = _.find(props.replaceChoices, function(c) { return c.value === tag; });
    var classes = choice && choice.tagClasses || {};
    var newProps = _.extend({}, props, {classes: classes});

    return origCreatePrettyTag(newProps, children);
  };

  return {

    createElement_ChoiceActionSample: function (/*action*/) {
      return R.span({}, 'X');
    },

    initField: function (field) {

      initField(field);

      if (field.id === 'silly') {

        if ((field.parent.value.name || '').toLowerCase() === 'joe') {
          field.help_text_html = field.meta.msg;
        }
      }
    },

    isRemovalOfLastArrayItemAllowed(/*field*/) {
      return false;
    },

    isRemovalOfLastAssocListItemAllowed(/*field*/) {
      return false;
    }
  };
};

var config = Formatic.createConfig(
  Formatic.plugins.reference,
  Formatic.plugins.meta,
  Formatic.plugins.bootstrap,
  plugin
);

var fields = [
  {label: 'Array', type: 'array', key: 'yoArray'},
  {label: 'single line string', type: 'single-line-string', key: 'single-line-string',
   autoFocus: true, placeholder: 'type something...', autoComplete: 'on'}
  //{label: 'Code', type: 'code', key: 'somecode', language: 'javascript'},
  //{label: 'Readonly Code', type: 'code', key: 'readonlyCode', language: 'javascript', readOnly: true, default: 'x = 3;'},
  //{label: 'Code Python', type: 'code', key: 'somepycode', language: 'python'}
];

var prettyNum = 2;
_.each(_.range(prettyNum), function(x){
  fields.push({
    label: 'Pretty Text 2', key: 'prettyText2-' + x, type: 'pretty-text',
    default: 'Hi there {{firstName}} {{lastName}} {{middleName}}.',
    //tabIndex: x + 1,
    replaceChoices: [
      {
        value: 'firstName',
        label: 'First Name',
        sample: 'Bob',
        tagClasses: {special: true}
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
  });
});

fields = fields.concat([
  {
    label: 'Pretty Text with integer default',
    key: 'integerPrettyText',
    type: 'pretty-text',
    default: 1,
    placeholder: 1
  },
  {
    label: 'Group',
    type: 'fields',
    fields: [
      {
        label: 'Pretty Text with integer default',
        key: 'integerPrettyTextGrouped',
        type: 'pretty-text',
        default: 1,
        placeholder: 1
      }
    ]
  },
  {
    label: 'Readonly pretty text',
    key: 'readonlyPrettyText',
    type: 'pretty-text',
    default: "Nah nah you can't edit me",
    readOnly: true
  },
  {
    label: 'Accordion Names', key: 'nestedPrettyText', type: 'pretty-text',
    isAccordion: true,
    default: 'Hi there {{firstName}} {{lastName}} {{middleName}}.',
    //tabIndex: prettyNum + 1,
    isLoading: true,
    replaceChoices: [
      {
        label: 'Name',
        value: 'name'
      },
      {
        label: 'Hi Class People',
        sectionKey: 'hiClass'
      },
      {
        value: 'givenName',
        label: 'Given Name',
        sample: 'Sir Duke',
        tagClasses: {special: true}
      },
      {
        value: 'surname',
        label: 'Surname',
        sample: 'Ellington'
      },
      {
        label: 'Lo Class People',
        sectionKey: 'loClass'
      },
      {
        value: 'firstName',
        label: 'First Name',
        sample: 'Peasant'
      },
      {
        value: 'lastName',
        label: 'Last Name',
        sample: 'Brown'
      },
      {
        sectionKey: null,
        value: 'extraName',
        label: 'Extra Name',
        sample: 'Extra'
      }
    ]
  },
  {label: 'Size', type: 'pretty-select', key: 'size', default: 'S',
   choices: { S: 'Small', M: 'Medium', L: 'Large' }
  },
  {label: 'Readonly Size', type: 'pretty-select', key: 'readonlySize', default: 'S', readOnly: true,
   choices: { S: 'Small', M: 'Medium', L: 'Large' }
  },
  {label: 'Colors (R)', type: 'pretty-select', required: true, key: 'colors1', placeholder: 'Pick a color...', choices: 'red, green, yellow'},
  {label: 'Colors 2', type: 'pretty-select', key: 'colors2', choices: {r: 'Red', g: 'Green'}},
  {label: 'Colors 3', helpText: 'Tres colores', type: 'pretty-select', key: 'colors3', customField: {label: 'Custom Value', helpText: null}, choices: [
    { value: 'r', label: 'Red', sample: 'cherry'},
    { value: 'g', label: 'Green', sample: 'lime'},
    { value: 'false', label: 'False', sample: false},
    { value: '', action: 'clear-current-choice', label: 'Clear Current Choice'},
    { action: 'enter-custom-value', label: 'Type a custom value' },
    { action: 'insert-field', label: 'Choose an available field' },
    { value: 'loadMore', label: 'Load more choices..', action: 'load-more-choices', isOpen: true}
  ], replaceChoices: [
    {value: 'yellow', label: 'Yellow', sample: 'lemon'},
    {value: 'purple', label: 'Purple', sample: 'grape'}
  ], default: 'some default value'},
  {label: 'Alphabet', type: 'pretty-select', key: 'alphabet', choices: [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
    'w', 'x', 'y', 'z'
  ]},
  {label: 'Name (R)', type: 'unicode', key: 'name', required: true, default: 'Unknown'},
  {label: 'Readonly Name', type: 'unicode', key: 'readonlyName', default: 'Bob', readOnly: true},
  {label: 'Password (R)', type: 'password', key: 'password', required: true, placeholder: 'type something secret...'},
  {id: 'silly', type: 'copy', help_text_html: 'What the hey? <b>Seriously?</b>'},
  {label: 'Note', type: 'text', key: 'note', required: true},
  {label: 'Mood', type: 'select', key: 'mood', choices: ['happy', 'sad']},
  {
    label: 'Groceries', type: 'text', key: 'groceries', selectedReplaceChoices: [{value: 'secret', label: 'KFC'}],
    replaceChoices: [
      'tacos', 'nachos', 'bread', 'milk', 'eggs',
      {
        label: 'Order Groceries',
        action: 'order-groceries'
      }
    ]
  },
  {label: 'Path', type: 'unicode', key: 'path', replaceChoices: ['tacos', 'nachos', 'bread', 'milk', 'eggs']},
  {
    label: 'Robots (R)', type: 'list', key: 'robots', required: true,
    itemFields: [
      {
        label: 'Simple',
        match: {type: 'simple'},
        type: 'fields',
        fields: [
          {label: 'Name', type: 'unicode', key: 'name'}
        ]
      },
      {
        label: 'Complex',
        match: {type: 'complex'},
        type: 'fields',
        fields: [
          {label: 'Name', type: 'unicode', key: 'name'},
          {label: 'Description', type: 'text', key: 'description'}
        ]
      }
    ]
  },
  {
    label: 'Listing Pretty Text', type: 'list', key: 'listing',
    itemFields: [{
      type: 'pretty-text',
      hideLabel: true
    }]
  },
  {
    label: 'Mapping Pretty Text', type: 'object', key: 'mapping',
    itemFields: [{
      type: 'pretty-text',
      hideLabel: true
    }],
    default: {key1: 'value1', key2: 'value2'}
  },
  {
    label: 'Associative List', type: 'assoc-list', key: 'assoc-list',
    itemFields: [{
      type: 'pretty-text',
      hideLabel: true
    }],
    default: [{key: 'key1', value: 'value1'}, {key: 'key2', value: 'value2'}]
  },
  /* {
     label: 'Mapping Pretty Text (R)', type: 'object', key: 'mapping2', required: true,
     itemFields: [{
     type: 'pretty-text',
     hideLabel: true
     }]
     }, */
  {label: 'The Blob', type: 'json', key: 'blob', readOnly: true},
  {label: 'Do you like cookies?', type: 'boolean', key: 'likesCookies', readOnly: true},
  {label: 'Do you like pretty cookies with sprinkles?', type: 'pretty-boolean', key: 'likesPrettyCookies', default: 'no'},
  {label: 'Colors', type: 'checkbox-list', key: 'colors', choices: ['red', 'green', 'blue']},
  {label: 'Readonly Colors', type: 'checkbox-array', key: 'readonly-colors', choices: ['red', 'green', 'blue'],
   default: 'green', readOnly: true},
  {label: 'Junk', type: 'junk'},
  {
    label: 'Folder',
    type: 'fields',
    key: 'folder',
    match: {type: 'folder'},
    readOnly: true,
    fields: [
      {type: 'unicode', key: 'type', hidden: true, default: 'folder'},
      {label: 'Name', type: 'unicode', key: 'name'},
      {
        label: 'Children',
        type: 'array',
        key: 'children',
        itemFields: [
          {
            label: 'File',
            type: 'fields',
            match: {type: 'file'},
            fields: [
              {type: 'unicode', key: 'type', hidden: true, default: 'file'},
              {label: 'Name', type: 'unicode', key: 'name'},
              {label: 'Content', type: 'text', key: 'content'}
            ]
          },
          'folder'
        ]
      }
    ]
  },
  {label: 'More colors', key: 'moreColors', extends: 'colors'},
  {label: "I'm alive!", type: 'checkbox-boolean', key: 'isAlive', default: true, readOnly: true},
  {label: 'Loading', key: 'loading', type: 'pretty-select', isLoading: true, isAccordion: true},
  {
    label: 'Grouped Fields', key: 'groupedFields', type: 'grouped-fields',
    helpTextHtml: 'Grouped fields are the best!',
    fields: [
      {label: 'Top Level', key: 'topLevel', type: 'unicode'},
      {label: 'Section 1 field 1', type: 'unicode', key: 'section1Field1', groupKey: 'section1'},
      {label: 'Section 1 field 2', type: 'unicode', key: 'section1Field2', groupKey: 'section1'},
      {label: 'Section 2 field 1', type: 'unicode', key: 'section2Field1', groupKey: 'section2'},
      {label: 'Section 2 field 2', type: 'unicode', key: 'section2Field2', groupKey: 'section2'}
    ]
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
          {label: 'Section 1 field 1', type: 'unicode', key: 'section1Field1'},
          {label: 'Section 1 field 2', type: 'unicode', key: 'section1Field2'}
        ]
      },
      {
        label: 'Section 2',
        type: 'fields',
        helpTextHtml: 'Section 2 is the best',
        fields: [
          {label: 'Section 2 field 1', type: 'unicode', key: 'section2Field1'},
          {label: 'Section 2 field 2', type: 'unicode', key: 'section2Field2'}
        ]
      }
    ]
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
  }
]);

var formValue = {};

var onFocus = function (event) {
  console.log('focus:', event.path, event.field);
};

var onBlur = function (event) {
  console.log('blur:', event.path, event.field);
};

var onOpenReplacements = function (info) {
  console.log('opening replacements:', info);
};

var onCloseReplacements = function (info) {
  console.log('closing replacements:', info);
};

var onClearCurrentChoice = function (info) {
  console.log('on clear current choice', info);
};

var onOrderGroceries = function (info) {
  console.log('ordering...', info);
};

//fields = [
//{type: 'pretty-text', key: 'a', label: 'pretty'},
//{type: 'pretty-text', key: 'b', label: 'pretty'},
//{type: 'pretty-text', key: 'c', label: 'pretty'}
//];

// Controlled version:

var render = function (value) {
  window.value = value;
  ReactDOM.render(Form({
    meta: {msg: "That's a fine name you have there!"},
    config: config,
    fields: fields,
    value: value,
    onChange: function (newValue, info) {
      console.log('new value:', newValue);
      console.log('info:', info);
      formValue = newValue;
      render(newValue);
    },
    onFocus: onFocus,
    onBlur: onBlur,
    onOpenReplacements: onOpenReplacements,
    onCloseReplacements: onCloseReplacements,
    onClearCurrentChoice: onClearCurrentChoice,
    onOrderGroceries: onOrderGroceries,
    readOnly: false
  }), document.getElementById('user'));
};

var setValue = function (value) {
  formValue = value;
  render(formValue);
};

window.setValue = setValue;

formValue.name = 'tom';
//formValue.colors3 = 'custom';
console.log('formValue');
setValue(formValue);
