/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import Layout from './Layout';
import Head from 'next/head';

import Typography from '@/docs/styles/Typography';

import 'sanitize.css';
import 'codemirror/lib/codemirror.css';
import '@/static/css/app.css';
import '@/static/css/formatic.css';

const pages = {
  start: {
    url: '/start',
    title: 'Getting Started',
    subTitle: 'Installing and using Formatic',
  },
  demo: {
    url: '/demo',
    title: 'Field Types',
    subTitle: 'The whole kitchen sink',
  },
  plugins: {
    url: '/plugins',
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

const Page = props => {
  const title = pages[props.pageKey].title;
  return (
    <Layout pageKey={props.pageKey} pages={pages}>
      <Head>
        <title>
          Formatic
          {title ? ` | ${title}` : ''}
        </title>
      </Head>
      <div css={styles.body}>{props.children}</div>
    </Layout>
  );
};

export default Page;
