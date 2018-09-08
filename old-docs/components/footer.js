'use strict';

var React = require('react');
var createReactClass = require('create-react-class');
var R = React.DOM;
var pkg = require('../../package.json');

module.exports = createReactClass({
  render: function () {
    return (
      R.footer({className: 'bs-docs-footer', role: 'contentinfo'},
        R.div({className: 'container'},
          R.div({className: 'bs-docs-social'},
            R.ul({className: 'bs-docs-social-buttons'},
              R.li({},
                R.iframe({className: 'github-btn', src: 'http://ghbtns.com/github-btn.html?user=zapier&repo=formatic&type=watch&count=true', width: 95, height: 20, title: 'Star on GitHub'})
              ),
              R.li({},
                R.iframe({className: 'github-btn', src: 'http://ghbtns.com/github-btn.html?user=zapier&repo=formatic&type=fork&count=true', width: 92, height: 20, title: 'Fork on GitHub'})
              )
            )
          ),
          R.p({},
            'Code licensed by ',
            R.a({href: 'https://github.com/zapier/formatic/blob/master/LICENSE', target: '_blank'}, 'Zapier, Inc.'),
            '.'
          ),
          R.ul({className: 'bs-docs-footer-links muted'},
            R.li({}, 'Currently v', pkg.version),
            R.li({}, '·'),
            R.li({}, R.a({href: 'https://github.com/zapier/formatic/'}, 'GitHub')),
            R.li({}, '·'),
            R.li({}, R.a({href: 'https://github.com/zapier/formatic/issues?state=open'}, 'Issues')),
            R.li({}, '·'),
            R.li({}, R.a({href: 'https://github.com/zapier/formatic/releases'}, 'Releases'))
          )
        )
      )
    );
  }
});
