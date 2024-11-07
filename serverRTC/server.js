const http = require('http'); // Importa el módulo HTTP de Node.js para crear un servidor HTTP.
const fs = require('fs'); // Importa el módulo de sistema de archivos para interactuar con el sistema de archivos.
const WebSocket = require('ws'); // Importa la biblioteca WebSocket para manejar conexiones WebSocket.
const net = require('net'); // Importa el módulo de red de Node.js para crear un servidor TCP.
const path = require('path'); // Importa el módulo de ruta para manejar y transformar rutas de archivos.

const hostname = '0.0.0.0'; // Escucha en todas las interfaces.
const httpPort = 3000; // Define el puerto para el servidor HTTP.
const tcpPort = 3001; // Define el puerto para el servidor TCP.

let count = 0; // Inicializar el conteo

// Crea un servidor HTTP
const server = http.createServer((req, res) => {
  if (req.url === '/') { // Si la URL solicitada es la raíz
    fs.readFile(path.join(__dirname, 'index.html'), (err, data) => { // Lee el archivo index.html
      res.writeHead(err ? 500 : 200, { 'Content-Type': 'text/html' }); // Establece el código de estado y tipo de contenido
      res.end(err ? 'ERROR' : data); // Envía la respuesta, ya sea un error o los datos del archivo
    });
  } else { // Si la URL no es la raíz
    res.writeHead(404).end('404 NOT FOUND'); // Envía un error 404
  }
});

// Crea un servidor WebSocket que usa el servidor HTTP
const wss = new WebSocket.Server({ server }); // Inicializa el servidor WebSocket

// Maneja las conexiones WebSocket
wss.on('connection', ws => { // Cuando un cliente se conecta
  ws.send(JSON.stringify({ count })); // Enviar el conteo inicial

  // Enviar actualizaciones del conteo a los clientes
  const interval = setInterval(() => {
    ws.send(JSON.stringify({ count }));
  }, 1000); // Enviar cada segundo

  ws.on('close', () => {
    clearInterval(interval); // Limpiar el intervalo al cerrar la conexión
  });
});

// Crea un servidor TCP
net.createServer(socket => { // Inicializa el servidor TCP
  console.log('Cliente TCP conectado');
  
  socket.on('data', data => { // Cuando se recibe datos del cliente TCP
    count = parseInt(data.toString().trim(), 10); // Actualiza el conteo desde la Pico W
    console.log('Conteo recibido:', count);
    
    // Notificar a todos los clientes WebSocket sobre el nuevo conteo
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ count }));
      }
    });
  });

  socket.on('end', () => {
    console.log('Cliente TCP desconectado');
  });
}).listen(tcpPort); // Escucha en el puerto TCP definido

// Inicia el servidor HTTP
server.listen(httpPort, hostname, () => console.log(`Servidor HTTP en http://${hostname}:${httpPort}/`)); // Imprime la URL del servidor HTTP al iniciar