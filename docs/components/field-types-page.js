'use strict';

var React = require('react');
var NavMain = require('./nav-main');
var Header = require('./header');
var Footer = require('./footer');
var Snippet = require('./snippet');
var fs = require('fs');
var path = require('path');
var FieldType = require('./field-type');
var Bootstrap = require('react-bootstrap');
var Affix = Bootstrap.Affix;
var Nav = Bootstrap.Nav;
var NavItem = Bootstrap.NavItem;
//var SubNav = Bootstrap.SubNav;

module.exports = React.createClass({

  getInitialState: function () {
    return {
      activeNavItemHref: null,
      navOffsetTop: null
    };
  },

  handleNavItemSelect: function (key, href) {
    this.setState({
      activeNavItemHref: href
    });

    window.location = href;
  },

  componentDidMount: function () {
    var elem = this.refs.sideNav.getDOMNode(),
      domUtils = Affix.domUtils,
      sideNavOffsetTop = domUtils.getOffset(elem).top,
      sideNavMarginTop = parseInt(domUtils.getComputedStyles(elem.firstChild).marginTop, 10),
      topNavHeight = this.refs.topNav.getDOMNode().offsetHeight;

    this.setState({
      navOffsetTop: sideNavOffsetTop - topNavHeight - sideNavMarginTop,
      navOffsetBottom: this.refs.footer.getDOMNode().offsetHeight
    });
  },

  render: function () {

    return (
      <div>
        <NavMain activePage="field-types" ref="topNav"/>
        <Header title="Field types"/>

        <div className="container bs-docs-container">
          <div className="row">
            <div className="col-md-9" role="main">

              <FieldType title="String" type="string" aliases={['text']}
                field={{
                  type: 'string',
                  key: 'message',
                  label: 'Message',
                  rows: 5
                }}
                code={fs.readFileSync(path.join(__dirname, '../examples/string.js'), 'utf8')}>
                String fields can be used to edit multi-line text, i.e. a textarea. Use the optional <code>rows</code> property to set the number of rows.
              </FieldType>

              <FieldType title="Single Line String" type="single-line-string" aliases={['unicode', 'str', 'string[isSingleLine=true]']}
                field={{
                  type: 'single-line-string',
                  key: 'name',
                  label: 'Name'
                }}
                code={fs.readFileSync(path.join(__dirname, '../examples/single-line-string.js'), 'utf8')}>
                A single-line string is for editing a single line of text, i.e. an input with type="text".
                  You can also use the property <code>isSingleLine</code> with the string type as an alias for this type.
              </FieldType>

              <FieldType title="Select" type="select" aliases={['string[choices]', 'single-line-string[choices]']}
                field={{
                  type: 'select',
                  key: 'country',
                  label: 'Country',
                  choices: [
                    {
                      value: 'us',
                      label: 'United States'
                    },
                    {
                      value: 'ca',
                      label: 'Canada'
                    }
                  ]
                }}
                moreFields=<div>
                  The canonical form for <code>choices</code> is an array of objects with
                  each object having a <code>value</code> and <code>label</code> property.
                  Two shorter forms are also available.
                  You can use an object, where each key is the value, and each value
                  is the label. For example:
                  <Snippet json={{
                    type: 'select',
                    key: 'country',
                    label: 'Country',
                    choices: {
                      us: 'United States',
                      ca: 'Canada'
                    }
                  }}/>
                  You can also use an array of strings. Each string will be a value, and
                  the values will be "humanized" to be used for the labels. For example:
                  <Snippet json={{
                    type: 'select',
                    key: 'favoriteColor',
                    label: 'Favorite Color of the Rainbow',
                    choices: ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet']
                  }}/>
                  In this case, the labels would be "Red", "Orange", etc.
                </div>
                code={fs.readFileSync(path.join(__dirname, '../examples/select.js'), 'utf8')}>
                Select fields give you a dropdown set of choices. If you add <code>choices</code> to a string or single-line-string type, it will become
                a select type.
              </FieldType>

              <FieldType title="Boolean" type="boolean"
                field={{
                  type: 'boolean',
                  key: 'isOptIn',
                  label: 'Subscribe to our newsletter?',
                  choices: [
                    {
                      value: true,
                      label: 'Absolutely!'
                    },
                    {
                      value: false,
                      label: 'No way!'
                    }
                  ]
                }}
                code={fs.readFileSync(path.join(__dirname, '../examples/boolean.js'), 'utf8')}>
                Boolean fields are for true/false values. The <code>choices</code> property is optional, and by default,
                the choices are "Yes" and "No", but you can override the labels for choices.
              </FieldType>

              <FieldType title="Checkbox Boolean" type="checkbox-boolean"
                field={{
                  type: 'checkbox-boolean',
                  key: 'isOptIn',
                  label: 'Subscribe to our newsletter?'
                }}
                code={fs.readFileSync(path.join(__dirname, '../examples/checkbox-boolean.js'), 'utf8')}>
                Checkbox Boolean fields are simple checkboxes for true/false values.
              </FieldType>

              <FieldType title="Pretty Text" type="pretty-text"
                field={{
                  type: 'pretty-textarea',
                  key: 'emailBody',
                  label: 'Email Body',
                  replaceChoices: [
                    {
                      value: 'email',
                      label: 'Email Address',
                      sample: 'joe@foo.com'
                    },
                    {
                      value: 'firstName',
                      label: 'First Name',
                      sample: 'Joe'
                    },
                    {
                      value: 'lastName',
                      label: 'Last Name',
                      sample: 'Foo'
                    }
                  ]
                }}
                code={fs.readFileSync(path.join(__dirname, '../examples/pretty-text.js'), 'utf8')}>
                Pretty Text fields show pretty pills with labels in place of their actual values. Actual values are enclosed
                in braces like {'{{'}someValue{'}}'}. Any labels provided in the <code>replaceChoices</code> are shown in place of
                the actual values.
              </FieldType>

              <FieldType title="Array" type="array" aliases={['list']}
                field={{
                  type: 'array',
                  key: 'names',
                  label: 'Names',
                  itemFields: {
                    type: 'single-line-string'
                  }
                }}
                code={fs.readFileSync(path.join(__dirname, '../examples/array.js'), 'utf8')}>
                Array fields allow you to create sorted lists of values. The <code>itemFields</code> property lets you
                define the type of child fields.
              </FieldType>

              <FieldType title="Checkbox Array" type="checkbox-array"
                field={{
                  type: 'checkbox-array',
                  key: 'colors',
                  label: 'Colors',
                  choices: ['red', 'green', 'blue']
                }}
                code={fs.readFileSync(path.join(__dirname, '../examples/checkbox-array.js'), 'utf8')}>
                Checkbox Array fields provide a checkbox for each item of an array. Each checked item is added to the array.
              </FieldType>

              <FieldType title="Object" type="object" aliases={['dict']}
                field={{
                  type: 'object',
                  key: 'data',
                  label: 'Data',
                  itemFields: {
                    type: 'single-line-string'
                  }
                }}
                code={fs.readFileSync(path.join(__dirname, '../examples/object.js'), 'utf8')}>
                Object fields allow you to create sets of key/value pairs. The <code>itemFields</code> property lets you
                define the type of child fields.
              </FieldType>

              <FieldType title="JSON" type="json"
                field={{
                  type: 'json',
                  key: 'blob',
                  label: 'JSON Blob',
                  rows: 10
                }}
                code={fs.readFileSync(path.join(__dirname, '../examples/json.js'), 'utf8')}>
                JSON fields allow you to edit raw JSON. The optional <code>rows</code> property sets the
                number of rows for the field.
              </FieldType>

              <FieldType title="Fields" type="fields" aliases={['fieldset']}
                field={{
                  type: 'fields',
                  key: 'address',
                  label: 'Address',
                  fields: [
                    {
                      type: 'single-line-string',
                      key: 'street',
                      label: 'Street'
                    },
                    {
                      type: 'single-line-string',
                      key: 'city',
                      label: 'City'
                    },
                    {
                      type: 'single-line-string',
                      key: 'state',
                      label: 'State'
                    }
                  ]
                }}
                code={fs.readFileSync(path.join(__dirname, '../examples/fields.js'), 'utf8')}>
                The Fields field allows you to nest fields inside a parent object. Note this is different
                from an Object field. The Fields field has static child fields, whereas an Object field
                has dynamic child fields.
              </FieldType>


              <FieldType title="Copy" type="copy"
                field={{
                  type: 'copy',
                  helpTextHtml: 'Be sure to get lots of sleep.'
                }}
                code={fs.readFileSync(path.join(__dirname, '../examples/copy.js'), 'utf8')}>
                Copy fields are readonly fields that simply copy the help text into the field.
              </FieldType>

            </div>

            <div className="col-md-3">
              <Affix
                className="bs-docs-sidebar hidden-print"
                role="complementary"
                offsetTop={this.state.navOffsetTop}
                offsetBottom={this.state.navOffsetBottom}>
                <Nav
                  className="bs-docs-sidenav"
                  activeHref={this.state.activeNavItemHref}
                  onSelect={this.handleNavItemSelect}
                  ref="sideNav">
                  <NavItem href="#string" key="string">String</NavItem>
                  <NavItem href="#single-line-string" key="single-line-string">Single Line String</NavItem>
                  <NavItem href="#select" key="select">Select</NavItem>
                  <NavItem href="#boolean" key="boolean">Boolean</NavItem>
                  <NavItem href="#checkbox-boolean" key="checkbox-boolean">Checkbox Boolean</NavItem>
                  <NavItem href="#pretty-text" key="pretty-text">Pretty Text</NavItem>
                  <NavItem href="#array" key="array">Array</NavItem>
                  <NavItem href="#checkbox-array" key="checkbox-array">Checkbox Array</NavItem>
                  <NavItem href="#object" key="object">Object</NavItem>
                  <NavItem href="#json" key="json">JSON</NavItem>
                  <NavItem href="#fields" key="fields">Fields</NavItem>
                  <NavItem href="#copy" key="copy">Copy</NavItem>
                </Nav>
                <a className="back-to-top" href="#top">
                Back to top
                </a>
              </Affix>
            </div>

          </div>
        </div>

        <Footer ref="footer"/>
      </div>
    );
  }

});
