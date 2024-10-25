import path from 'node:path';
import express from 'express';
import favicon from 'serve-favicon';
import parseUrl from 'parseurl';
import liveReload from 'livereload';
import renderMarkdown from './render.js';
import renderMarkdownFileListing from './listing.js';
import {
  getInitialDir,
  getInitialPath,
  getAssetsDir,
  getHost,
  getPort,
  getWatch,
  // getFaviconPath,
  revealBasePath,
  mermaidBasePath,
  highlightThemePath
} from './config.js';
import { getDefaultFavIcon } from './config.defaults.js' with { type: 'macro' };

const staticDir = express.static;
const assetsDir = getAssetsDir();
const host = getHost();
const port = getPort();
const isLiveReload = getWatch();

// Exports ---------------------------------------------------------------------

export default async () => {
  const app = express();
  const initialDir = await getInitialDir();
  const initialPath = await getInitialPath();

  app.use((req, res, next) => {
    if (parseUrl(req).pathname !== '/favicon.ico') {
      next()
      return
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.statusCode = req.method === 'OPTIONS' ? 200 : 405
      res.setHeader('Allow', 'GET, HEAD, OPTIONS')
      res.setHeader('Content-Length', '0')
      res.end()
      return
    }

    send(req, res, getDefaultFavIcon())
  });
  // const faviconPath = await getFaviconPath();
  // app.use(favicon(faviconPath));

  app.use('/plugin', staticDir(path.join(revealBasePath, 'plugin')));
  app.use('/dist', staticDir(path.join(revealBasePath, 'dist')));
  console.log(`Serving reveal.js from ${revealBasePath}`);

  app.use('/mermaid', staticDir(path.join(mermaidBasePath)));

  app.use('/css/highlight', staticDir(highlightThemePath));

  if (isLiveReload) {
    const liveReloadServer = liveReload.createServer({
      /* Live Reload defaults + 'md' */
      exts: ['html', 'css', 'js', 'png', 'gif', 'jpg', 'php', 'php5', 'py', 'rb', 'erb', 'coffee', 'md']
    });
    liveReloadServer.watch(initialDir);
  }

  app.get(/(\w+\.md)/, renderMarkdown);

  app.use(`/${assetsDir}`, staticDir(process.cwd(), { fallthrough: false }));
  app.use('/', staticDir(initialDir));

  app.get('/*', renderMarkdownFileListing);

  const server = app.listen(port);

  console.log(`Reveal-server started at http://${host}:${port}`);

  return [server, `http://${host}:${port}/${initialPath}`];
};
