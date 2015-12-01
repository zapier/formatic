'use strict';

var React = require('react');
var NavMain = require('./nav-main');
var Header = require('./header');
var Footer = require('./footer');
var Snippet = require('./snippet');
var ReactPlayground = require('./react-playground');
var Bootstrap = require('react-bootstrap');
var Affix = Bootstrap.Affix;
var Nav = Bootstrap.Nav;
var NavItem = Bootstrap.NavItem;
var fs = require('fs');
var path = require('path');

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
        <NavMain activePage="plugins" ref="topNav"/>
        <Header title="Plugins" subTitle="Extending Formatic"/>
        <div className="container bs-docs-container">
          <div className="row">
            <div className="col-md-9" role="main">
              <div className="bs-docs-section">
                <h2 id="config" className="page-header">Config</h2>

                <p>
                  Plugins are simply functions that help to create a configuration object that is
                  passed into Formatic, so first let's talk about the config.
                </p>

                <p>
                  Almost all of Formatic's behavior is passed in via the <code>config</code> property.
                  If you pass in no config, then Formatic uses it's
                  own <a href="annotated-source/default-config.html" target="formatic-annotated-source">default config plugin</a> to
                  create a config for you. To change Formatic's behavior, you simply pass in a config object with different methods.
                </p>

                <p>
                  Passing in no config:
                </p>

                <Snippet code={fs.readFileSync(path.join(__dirname, '../snippets/default-config.js'), 'utf8')}/>

                <p>
                  Is equivalent to this:
                </p>

                <Snippet code={fs.readFileSync(path.join(__dirname, '../snippets/default-config-same.js'), 'utf8')}/>


              </div>

              <div className="bs-docs-section">
                <h2 id="simple-plugin" className="page-header">A simple plugin example</h2>

                <p>
                  Plugins are just functions that help in the creation of a config. Here's a simple plugin that will
                  will use the key instead of the label of a field if the label is not present.
                </p>

                <Snippet code={fs.readFileSync(path.join(__dirname, '../snippets/simple-plugin.js'), 'utf8')}/>

                <p>
                  Note that plugin functions receive the <code>config</code> as a parameter, so you can delegate to other methods
                  on the config. Let's <code>humanize</code> our key.
                </p>

                <Snippet code={fs.readFileSync(path.join(__dirname, '../snippets/simple-plugin-delegate.js'), 'utf8')}/>

                <p>
                  Also note that at the point in time <code>config</code> is passed in, it's had all previous plugins applied. So you
                  can save any existing methods for wrapping. Here, we'll delegate back to the original <code>fieldLabel</code> method.
                </p>

                <Snippet code={fs.readFileSync(path.join(__dirname, '../snippets/simple-plugin-wrap.js'), 'utf8')}/>

                <p>
                  Here's a live example of this plugin.
                </p>

                <ReactPlayground code={fs.readFileSync(path.join(__dirname, '../examples/simple-plugin-wrap.js'), 'utf8')} />

              </div>

              <div className="bs-docs-section">
                <h2 id="using-plugins" className="page-header">Using plugins</h2>

                <p>
                  To use a plugin, just pass it in to <code>Formatic.createConfig</code>.
                </p>

                <Snippet code={fs.readFileSync(path.join(__dirname, '../snippets/use-plugin.js'), 'utf8')}/>

                <p>
                  You can pass in multiple plugins. If multiple plugins define the same method, the config will get
                  the method from the last plugin.
                </p>

                <Snippet code={fs.readFileSync(path.join(__dirname, '../snippets/use-plugins.js'), 'utf8')}/>

                <p>
                  Formatic provides some plugins out of the box. One of those is the bootstrap plugin. You can use
                  it like this:
                </p>

                <Snippet code={fs.readFileSync(path.join(__dirname, '../snippets/use-bootstrap-plugin.js'), 'utf8')}/>

              </div>

              <div className="bs-docs-section">
                <h2 id="adding-types" className="page-header">Adding field types</h2>

                <p>
                  Field types are handled by methods on the <code>config</code> object, so to add a new field type,
                  just create a plugin that provides the appropriate methods.
                </p>

                <p>
                  Here's an example of a "tweet" field type which turns the text red if we go over 140 characters.
                </p>

                <ReactPlayground code={fs.readFileSync(path.join(__dirname, '../examples/adding-field-type.js'), 'utf8')} />

              </div>

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
                  <NavItem href="#config" key="config">Config</NavItem>
                  <NavItem href="#simple-plugin" key="simple-plugin">A simple plugin</NavItem>
                  <NavItem href="#using-plugins" key="using-plugins">Using plugins</NavItem>
                  <NavItem href="#adding-types" key="adding-types">Adding field types</NavItem>
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
