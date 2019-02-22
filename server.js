/* global __dirname */
import express from 'express';
import next from 'next';
import { argv } from 'yargs';
import openBrowser from 'react-dev-utils/openBrowser';

const port = parseInt(argv.port, 10) || parseInt(process.env.PORT, 10) || 3333;
const dev = process.env.NODE_ENV !== 'production';

const createServer = (name = 'Server', modifyServer = () => {}) => {
  const server = express();

  server.get('/api/alive', async (req, res) => {
    res.json(true);
  });

  modifyServer(server);

  server.listen(port, err => {
    if (err) throw err;
    console.info(`> ${name} ready on http://localhost:${port}`);
    if (argv.open) {
      openBrowser(`http://localhost:${port}/demo`);
    }
  });
};

const app = next({ dev });
const handle = app.getRequestHandler();
app.prepare().then(() => {
  createServer('Server', server => {
    server.use('/node_modules', express.static(__dirname + '/node_modules'));

    server.get('*', (req, res) => {
      return handle(req, res);
    });
  });
});
