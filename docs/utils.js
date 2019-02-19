export const dashify = s => s.split(' ').join('-');

export const getBaseUrl = req => {
  if (!req) {
    return '';
  }
  if (req) {
    if (req.protocol) {
      return `${req.protocol}://${req.get('Host')}`;
    }
    if (process.env.API_PORT) {
      return `http://localhost:${process.env.API_PORT}`;
    }
  }
  return '';
};

export const fetchSnippets = async (req, snippetKeys) => {
  const keysParam = snippetKeys.join(',');
  const baseUrl = getBaseUrl(req);
  const res = await fetch(`${baseUrl}/api/snippets?keys=${keysParam}`);
  const snippets = await res.json();
  return snippets;
};
