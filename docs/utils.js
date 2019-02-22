export const dashify = s => s.split(' ').join('-');

// This allows us to store examples that are linted, but then we can "cut" out
// the section of the snippet we actually want to use in the docs.
const cleanSnippet = snippet =>
  snippet.replace(/^\/\/CUT$((?!\/\/CUT)(.|\n))+^\/\/CUT$\n?/gm, '');

// Clean all the snippets in an object.
export const cleanSnippets = snippets =>
  Object.keys(snippets).reduce((cleaned, key) => {
    cleaned[key] = cleanSnippet(snippets[key]);
    return cleaned;
  }, {});

// Given an array of snippet keys, load all those snippets into an object.
export const loadSnippets = snippets =>
  snippets.reduce((cleaned, key) => {
    const rawSnippet = require(`!!raw-loader!./snippets/${key}.js`);
    cleaned[key] = cleanSnippet(rawSnippet);
    return cleaned;
  }, {});

const assetPrefix = process.env.NODE_ENV === 'production' ? '/formatic' : '';

// If we're in production, it means we're building for GitHub Pages, and we
// need to prefix hrefs. If we wanted to build for different prefixes, we'd need
// to make this more flexible with external input.
export const prefixHref = href => {
  if (href && href[0] === '/' && assetPrefix) {
    return `${assetPrefix}${href}`;
  }
  return href;
};
