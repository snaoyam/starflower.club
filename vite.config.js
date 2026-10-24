import { defineConfig } from 'vite';
import path from 'node:path';
import { generateContent } from './scripts/build-content.mjs';
export default defineConfig({
  base: process.env.SITE_BASE_PATH || './',
  plugins: [{
    name: 'starflower-content',
    async configureServer(server) {
      await generateContent();
      server.middlewares.use((req, res, next) => {
        if (/\/admin\/?$/.test((req.url || '').split('?')[0])) {
          res.statusCode = 302;
          res.setHeader('Location', (req.url || '').split('?')[0].replace(/admin\/?$/, '#/admin'));
          res.end();
        } else next();
      });
      const contentPath = path.resolve('content');
      server.watcher.add(contentPath);
      let timer; let running = false; let pending = false;
      async function refresh() {
        if (running) { pending = true; return; }
        running = true;
        try { await generateContent(); server.ws.send({ type: 'full-reload' }); }
        catch (error) { server.config.logger.error(error.message); server.ws.send({ type: 'error', err: { message: error.message, stack: '', plugin: '콘텐츠 파일 확인' } }); }
        finally { running = false; if (pending) { pending = false; refresh(); } }
      }
      server.watcher.on('all', (_, file) => {
        if (file.startsWith(contentPath + path.sep)) { clearTimeout(timer); timer = setTimeout(refresh, 250); }
      });
    },
  }],
});
