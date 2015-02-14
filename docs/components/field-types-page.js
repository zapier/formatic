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

module.exports = React.createClass({

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
                This type is for a dropdown set of choices. If you add <code>choices</code> to a string or single-line-string type, it will become
                a select type.
              </FieldType>

            </div>
          </div>
        </div>

        <Footer/>
      </div>
    );
  }

});
