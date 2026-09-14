const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.join(process.cwd(), 'dist');
const port = 3000;
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};
http.createServer((req, res) => {
  let url = req.url === '/' ? '/index.html' : req.url;
  let safe = decodeURIComponent(url.split('?')[0]);
  let filePath = path.join(root, safe);
  if (!filePath.startsWith(root)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      filePath = path.join(root, 'index.html');
    }
    fs.readFile(filePath, (e, data) => {
      if (e) {
        res.writeHead(404); res.end('Not found'); return;
      }
      const ext = path.extname(filePath);
      // never cache — always serve the latest build
      res.writeHead(200, {
        'Content-Type': mime[ext] || 'application/octet-stream',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      });
      res.end(data);
    });
  });
}).listen(port, '0.0.0.0', () => {
  console.log('Server running at http://localhost:' + port);
});
