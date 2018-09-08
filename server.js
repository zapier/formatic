/* global __dirname */
import express from 'express';
import next from 'next';
import _ from 'lodash';

import getSnippets from './docs/server/getSnippets';

const port = parseInt(process.env.PORT, 10) || 3333;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.use('/node_modules', express.static(__dirname + '/node_modules'));

  server.get('/api/snippets', async (req, res) => {
    const snippets = await getSnippets(
      _.compact((req.query.keys || '').split(','))
    );
    res.json(snippets);
  });

  server.get('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, err => {
    if (err) throw err;
    console.info(`> Ready on http://localhost:${port}`);
  });
});
