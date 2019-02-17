/* global __dirname */
import fs from 'mz/fs';

const cleanSnippet = snippet =>
  snippet.replace(/^\/\/CUT$((?!\/\/CUT)(.|\n))+^\/\/CUT$\n?/gm, '');

const getSnippet = async key => {
  try {
    const file = await fs.readFile(`${__dirname}/snippets/${key}.js`);
    return cleanSnippet(file.toString());
  } catch (e) {
    console.error(e);
  }
  return `File ${key} not found.`;
};

const getSnippets = async keys => {
  const snippets = await Promise.all(
    keys.map(async key => ({
      key,
      file: await getSnippet(key),
    }))
  );
  return snippets.reduce((result, snippet) => {
    result[snippet.key] = snippet.file;
    return result;
  }, {});
};

export default getSnippets;