import React from 'react';
import Document, { Head, Main, NextScript } from 'next/document';
export default class MyDocument extends Document {
  render() {
    const prefixHref = href => {
      if (href && href[0] === '/' && this.props.__NEXT_DATA__.assetPrefix) {
        return `${this.props.__NEXT_DATA__.assetPrefix}${href}`;
      }
      return href;
    };

    return (
      <html>
        <Head>
          <meta name="viewport" content="initial-scale=1.0" />
          <link
            rel="apple-touch-icon"
            sizes="57x57"
            href={prefixHref('/static/favicons/apple-touch-icon-57x57.png')}
            data-reactid=".2bkozp1wjk0.0.8"
          />
          <link
            rel="apple-touch-icon"
            sizes="60x60"
            href={prefixHref('/static/favicons/apple-touch-icon-60x60.png')}
            data-reactid=".2bkozp1wjk0.0.9"
          />
          <link
            rel="apple-touch-icon"
            sizes="72x72"
            href={prefixHref('/static/favicons/apple-touch-icon-72x72.png')}
            data-reactid=".2bkozp1wjk0.0.a"
          />
          <link
            rel="apple-touch-icon"
            sizes="76x76"
            href={prefixHref('/static/favicons/apple-touch-icon-76x76.png')}
            data-reactid=".2bkozp1wjk0.0.b"
          />
          <link
            rel="apple-touch-icon"
            sizes="114x114"
            href={prefixHref('/static/favicons/apple-touch-icon-114x114.png')}
            data-reactid=".2bkozp1wjk0.0.c"
          />
          <link
            rel="apple-touch-icon"
            sizes="120x120"
            href={prefixHref('/static/favicons/apple-touch-icon-120x120.png')}
            data-reactid=".2bkozp1wjk0.0.d"
          />
          <link
            rel="apple-touch-icon"
            sizes="144x144"
            href={prefixHref('/static/favicons/apple-touch-icon-144x144.png')}
            data-reactid=".2bkozp1wjk0.0.e"
          />
          <link
            rel="apple-touch-icon"
            sizes="152x152"
            href={prefixHref('/static/favicons/apple-touch-icon-152x152.png')}
            data-reactid=".2bkozp1wjk0.0.f"
          />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href={prefixHref('/static/favicons/apple-touch-icon-180x180.png')}
            data-reactid=".2bkozp1wjk0.0.g"
          />
          <link
            rel="icon"
            type="image/png"
            href={prefixHref('/static/favicons/favicon-32x32.png')}
            sizes="32x32"
            data-reactid=".2bkozp1wjk0.0.h"
          />
          <link
            rel="icon"
            type="image/png"
            href={prefixHref('/static/favicons/android-chrome-192x192.png')}
            sizes="192x192"
            data-reactid=".2bkozp1wjk0.0.i"
          />
          <link
            rel="icon"
            type="image/png"
            href={prefixHref('/static/favicons/favicon-96x96.png')}
            sizes="96x96"
            data-reactid=".2bkozp1wjk0.0.j"
          />
          <link
            rel="icon"
            type="image/png"
            href={prefixHref('/static/favicons/favicon-16x16.png')}
            sizes="16x16"
            data-reactid=".2bkozp1wjk0.0.k"
          />
          <link
            rel="manifest"
            href={prefixHref('/static/favicons/manifest.json')}
            data-reactid=".2bkozp1wjk0.0.l"
          />
          <link
            href="https://fonts.googleapis.com/css?family=Open+Sans"
            rel="stylesheet"
          />
          {process.env.NODE_ENV === 'production' && (
            <>
              <link rel="stylesheet" href={prefixHref('/static/css/app.css')} />
              <link
                rel="stylesheet"
                href={prefixHref('/static/css/formatic.css')}
              />
            </>
          )}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}
