/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import Layout from './Layout';

import Typography from '../styles/Typography';

import 'codemirror/lib/codemirror.css';
import '../../static/css/app.css';
import '../../static/css/formatic.css';
import 'sanitize.css';

const pages = {
  start: {
    url: 'start',
    title: 'Getting Started',
    subTitle: 'Installing and using Formatic',
  },
  demo: {
    url: 'demo',
    title: 'Field Types',
    subTitle: 'The whole kitchen sink',
  },
  plugins: {
    url: 'plugins',
    navTitle: 'Plugins',
    title: 'Extending Formatic',
  },
  github: {
    url: 'http://github.com/zapier/formatic',
    title: 'GitHub',
  },
};

const styles = {
  body: css({
    ...Typography['body-large'],
  }),
};

const Page = props => (
  <Layout pages={pages} pageKey={props.pageKey}>
    <div css={styles.body}>{props.children}</div>
  </Layout>
);

export default Page;
