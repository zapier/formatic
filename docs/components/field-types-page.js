'use strict';

var React = require('react');
var R = React.DOM;
var E = React.createElement;
var NavMain = require('./nav-main');
var Header = require('./header');
var Footer = require('./footer');
var ReactPlayground = require('./react-playground');
var fs = require('fs');
var path = require('path');
var Snippet = require('./snippet');
var FieldType = require('./field-type');
var Bootstrap = require('react-bootstrap');
var Affix = Bootstrap.Affix;
var Nav = Bootstrap.Nav;
var NavItem = Bootstrap.NavItem;
var SubNav = Bootstrap.SubNav;

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
        <NavMain activePage='field-types' ref='topNav'/>
        <Header title='Field types'/>

        <div className="container bs-docs-container">
          <div className="row">
            <div className="col-md-9" role="main">

              <FieldType title="String" type="string" aliases={['text']} codeText={fs.readFileSync(path.join(__dirname, '../examples/string.js'), 'utf8')}>
                String fields can be used to edit multi-line text, i.e. a textarea. Use the optional <code>rows</code> property to set the number of rows.
              </FieldType>

              <FieldType title="Single Line String" type="single-line-string" aliases={['unicode', 'str', 'string[isSingleLine=true]']}
                codeText={fs.readFileSync(path.join(__dirname, '../examples/single-line-string.js'), 'utf8')}>
                A single-line string is for editing a single line of text, i.e. an input with type="text".
                  You can also use the property <code>isSingleLine</code> with the string type as an alias for this type.
              </FieldType>

              <FieldType title="Select" type="select" aliases={['string[choices]', 'single-line-string[choices]']}
                codeText={fs.readFileSync(path.join(__dirname, '../examples/select.js'), 'utf8')}>
                Select fields give you a dropdown set of choices. If you add <code>choices</code> to a string or single-line-string type, it will become
                a select type.
              </FieldType>

              <FieldType title="Boolean" type="boolean" codeText={fs.readFileSync(path.join(__dirname, '../examples/boolean.js'), 'utf8')}>
                Boolean fields are for true/false values.
              </FieldType>

              <FieldType title="Checkbox Boolean" type="checkbox-boolean" codeText={fs.readFileSync(path.join(__dirname, '../examples/checkbox-boolean.js'), 'utf8')}>
                Checkbox Boolean fields are simple checkboxes for true/false values.
              </FieldType>

              <FieldType title="Pretty Text" type="pretty-text" codeText={fs.readFileSync(path.join(__dirname, '../examples/pretty-text.js'), 'utf8')}>
                Pretty Text fields show pretty pills with labels in place of their actual values.
              </FieldType>

              <FieldType title="Array" type="array" aliases={['list']} codeText={fs.readFileSync(path.join(__dirname, '../examples/array.js'), 'utf8')}>
                Array fields allow you to create sorted lists of values. The <code>itemFields</code> property lets you
                define the type of child fields.
              </FieldType>

              <FieldType title="Checkbox Array" type="checkbox-array" codeText={fs.readFileSync(path.join(__dirname, '../examples/checkbox-array.js'), 'utf8')}>
                Checkbox Array fields provide a checkbox for each item of an array. Each checked item is added to the array.
              </FieldType>

              <FieldType title="Object" type="object" aliases={['dict']} codeText={fs.readFileSync(path.join(__dirname, '../examples/object.js'), 'utf8')}>
                Object fields allow you to create sets of key/value pairs. The <code>itemFields</code> property lets you
                define the type of child fields.
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
