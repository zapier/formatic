import App from 'next/app';
import React from 'react';

export default class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    return Component.getInitialProps
      ? { pageProps: await Component.getInitialProps(ctx) }
      : { pageProps: {} };
  }

  render() {
    const { Component, pageProps } = this.props;
    if (Component.name.startsWith('render')) {
      return Component(pageProps);
    }
    return <Component {...pageProps} />;
  }
}
