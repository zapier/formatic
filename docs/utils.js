export const dashify = s => s.split(' ').join('-');

const cleanSnippet = snippet =>
  snippet.replace(/^\/\/CUT$((?!\/\/CUT)(.|\n))+^\/\/CUT$\n?/gm, '');

export const cleanSnippets = snippets =>
  Object.keys(snippets).reduce((cleaned, key) => {
    cleaned[key] = cleanSnippet(snippets[key]);
    return cleaned;
  }, {});

export const loadSnippets = snippets =>
  snippets.reduce((cleaned, key) => {
    const rawSnippet = require(`!!raw-loader!./snippets/${key}.js`);
    cleaned[key] = cleanSnippet(rawSnippet);
    return cleaned;
  }, {});
