const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // URL에서 public/ 경로 처리
  let filePath;
  if (req.url.startsWith('/public/')) {
    filePath = path.join(__dirname, req.url);
  } else if (req.url === '/check-modified') {
    filePath = path.join(__dirname, 'public/js/index.js');
    fs.stat(filePath, (err, stats) => {
      if (err) {
        res.writeHead(404);
        res.end('{}');
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ modified: stats.mtime.getTime() }));
      }
    });
    return;
  } else {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  
  // 파일 확장자에 따른 Content-Type 설정
  const ext = path.extname(filePath);
  let contentType = 'text/plain';
  if (ext === '.js') contentType = 'application/javascript';
  else if (ext === '.css') contentType = 'text/css';
  else if (ext === '.html') contentType = 'text/html';
  
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Use this in other sites:');
  console.log(`<script src="http://localhost:${PORT}/index.js"></script>`);
});