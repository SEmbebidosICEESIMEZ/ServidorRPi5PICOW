const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');
const net = require('net');
const path = require('path');

const hostname = '0.0.0.0';
const httpPort = 3000;
const tcpPort = 3001;

let rgbValues = { r: 0, g: 0, b: 0 };

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
      res.writeHead(err ? 500 : 200, { 'Content-Type': 'text/html' });
      res.end(err ? 'ERROR' : data);
    });
  } else {
    res.writeHead(404).end('404 NOT FOUND');
  }
});

const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
  ws.send(JSON.stringify(rgbValues));

  ws.on('message', message => {
    rgbValues = JSON.parse(message);
    console.log('Nuevos valores RGB:', rgbValues);
    
    // Enviar los nuevos valores a la Pico W
    tcpClients.forEach(client => {
      client.write(JSON.stringify(rgbValues));
    });
  });
});

const tcpClients = new Set();

net.createServer(socket => {
  console.log('Cliente TCP (Pico W) conectado');
  tcpClients.add(socket);

  socket.on('end', () => {
    console.log('Cliente TCP (Pico W) desconectado');
    tcpClients.delete(socket);
  });
}).listen(tcpPort);

server.listen(httpPort, hostname, () => console.log(`Servidor HTTP en http://${hostname}:${httpPort}/`));