/**
 * Web server sederhana dengan library http bawaan NodeJS.
 *  - GET /            -> "hello world"
 *  - GET /<file>      -> static file server (folder ./public)
 * Berjalan di http://localhost:8000
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8'
};

/** Mengirim respons teks sederhana. */
function kirim(res, status, body, type) {
  if (res.headersSent) return res.end();
  res.writeHead(status, { 'Content-Type': type || 'text/plain; charset=utf-8' });
  res.end(body);
}

const server = http.createServer((req, res) => {
  try {
    // Hanya mengizinkan GET
    if (req.method !== 'GET') {
      return kirim(res, 405, '405 Method Not Allowed');
    }

    const url = new URL(req.url, 'http://' + (req.headers.host || 'localhost'));
    let pathname;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch (e) {
      return kirim(res, 400, '400 Bad Request');
    }

    // Endpoint "/" -> hello world
    if (pathname === '/') {
      return kirim(res, 200, 'hello world');
    }

    // Static file server (cegah path traversal)
    const filePath = path.normalize(path.join(PUBLIC_DIR, pathname));
    if (filePath.indexOf(PUBLIC_DIR) !== 0) {
      return kirim(res, 403, '403 Forbidden');
    }

    fs.stat(filePath, (err, stat) => {
      if (err || !stat.isFile()) {
        return kirim(res, 404, '404 Not Found');
      }
      const type = MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
      const stream = fs.createReadStream(filePath);
      stream.on('error', () => kirim(res, 500, '500 Internal Server Error'));
      res.writeHead(200, { 'Content-Type': type });
      stream.pipe(res);
    });
  } catch (err) {
    console.error('Error pada request:', err);
    kirim(res, 500, '500 Internal Server Error');
  }
});

// Penanganan error server (mis. port sudah dipakai)
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('Port ' + PORT + ' sudah digunakan program lain.');
  } else {
    console.error('Server error:', err.message);
  }
  process.exit(1);
});

server.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

// Jaga agar aplikasi tidak crash karena error yang tidak tertangkap
process.on('uncaughtException', (err) => console.error('uncaughtException:', err));
process.on('unhandledRejection', (err) => console.error('unhandledRejection:', err));

server.listen(PORT, () => {
  console.log('Server berjalan di http://localhost:' + PORT);
});
