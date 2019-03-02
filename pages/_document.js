import React from 'react';
import Document, { Head as NextHead, Main, NextScript } from 'next/document';

const STYLES_CHUNK_HREF = '/_next/static/css/styles.chunk.css';

// This is weird, but Next.js doesn't seem to be adding styles.chunk.css to the
// static build. So we'll just sneak it in by extending Head and overriding the
// getCssLinks method. Kind of yucky, but it gets the job done.
class Head extends NextHead {
  getCssLinks() {
    const cssLinks = super.getCssLinks();
    const stylesChunkLink = cssLinks.find(
      link =>
        link && link.props.href && link.props.href.includes(STYLES_CHUNK_HREF)
    );
    if (stylesChunkLink) {
      return cssLinks;
    }
    return cssLinks.concat(
      <link
        href={this.props.prefixHref(STYLES_CHUNK_HREF)}
        key="static/chunks/"
        rel="stylesheet"
      />
    );
  }
}

export default class MyDocument extends Document {
  render() {
    const prefixHref = href => {
      if (href && href[0] === '/' && this.props.__NEXT_DATA__.assetPrefix) {
        return `${this.props.__NEXT_DATA__.assetPrefix}${href}`;
      }
      return href;
    };

    return (
      <html lang="en">
        <Head prefixHref={prefixHref}>
          <meta content="initial-scale=1.0" name="viewport" />
          <link
            data-reactid=".2bkozp1wjk0.0.8"
            href={prefixHref('/static/favicons/apple-touch-icon-57x57.png')}
            rel="apple-touch-icon"
            sizes="57x57"
          />
          <link
            data-reactid=".2bkozp1wjk0.0.9"
            href={prefixHref('/static/favicons/apple-touch-icon-60x60.png')}
            rel="apple-touch-icon"
            sizes="60x60"
          />
          <link
            data-reactid=".2bkozp1wjk0.0.a"
            href={prefixHref('/static/favicons/apple-touch-icon-72x72.png')}
            rel="apple-touch-icon"
            sizes="72x72"
          />
          <link
            data-reactid=".2bkozp1wjk0.0.b"
            href={prefixHref('/static/favicons/apple-touch-icon-76x76.png')}
            rel="apple-touch-icon"
            sizes="76x76"
          />
          <link
            data-reactid=".2bkozp1wjk0.0.c"
            href={prefixHref('/static/favicons/apple-touch-icon-114x114.png')}
            rel="apple-touch-icon"
            sizes="114x114"
          />
          <link
            data-reactid=".2bkozp1wjk0.0.d"
            href={prefixHref('/static/favicons/apple-touch-icon-120x120.png')}
            rel="apple-touch-icon"
            sizes="120x120"
          />
          <link
            data-reactid=".2bkozp1wjk0.0.e"
            href={prefixHref('/static/favicons/apple-touch-icon-144x144.png')}
            rel="apple-touch-icon"
            sizes="144x144"
          />
          <link
            data-reactid=".2bkozp1wjk0.0.f"
            href={prefixHref('/static/favicons/apple-touch-icon-152x152.png')}
            rel="apple-touch-icon"
            sizes="152x152"
          />
          <link
            data-reactid=".2bkozp1wjk0.0.g"
            href={prefixHref('/static/favicons/apple-touch-icon-180x180.png')}
            rel="apple-touch-icon"
            sizes="180x180"
          />
          <link
            data-reactid=".2bkozp1wjk0.0.h"
            href={prefixHref('/static/favicons/favicon-32x32.png')}
            rel="icon"
            sizes="32x32"
            type="image/png"
          />
          <link
            data-reactid=".2bkozp1wjk0.0.i"
            href={prefixHref('/static/favicons/android-chrome-192x192.png')}
            rel="icon"
            sizes="192x192"
            type="image/png"
          />
          <link
            data-reactid=".2bkozp1wjk0.0.j"
            href={prefixHref('/static/favicons/favicon-96x96.png')}
            rel="icon"
            sizes="96x96"
            type="image/png"
          />
          <link
            data-reactid=".2bkozp1wjk0.0.k"
            href={prefixHref('/static/favicons/favicon-16x16.png')}
            rel="icon"
            sizes="16x16"
            type="image/png"
          />
          <link
            data-reactid=".2bkozp1wjk0.0.l"
            href={prefixHref('/static/favicons/manifest.json')}
            rel="manifest"
          />
          <link
            href="https://fonts.googleapis.com/css?family=Open+Sans"
            rel="stylesheet"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}
