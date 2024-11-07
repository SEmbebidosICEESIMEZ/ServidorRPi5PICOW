const http = require('http'); // Importa el mï¿½dulo HTTP de Node.js para crear un servidor HTTP.
const fs = require('fs'); // Importa el mï¿½dulo de sistema de archivos para interactuar con el sistema de archivos.
const WebSocket = require('ws'); // Importa la biblioteca WebSocket para manejar conexiones WebSocket.
const net = require('net'); // Importa el mï¿½dulo de red de Node.js para crear un servidor TCP.
const path = require('path'); // Importa el mï¿½dulo de ruta para manejar y transformar rutas de archivos.

const hostname = 'IP'; // Define la direcciï¿½n IP del servidor.
const httpPort = 3000; // Define el puerto para el servidor HTTP.
const tcpPort = 3001; // Define el puerto para el servidor TCP.

// Crea un servidor HTTP
const server = http.createServer((req, res) => {
  if (req.url === '/') { // Si la URL solicitada es la raï¿½z
    fs.readFile(path.join(__dirname, 'index.html'), (err, data) => { // Lee el archivo index.html
      res.writeHead(err ? 500 : 200, { 'Content-Type': 'text/html' }); // Establece el cï¿½digo de estado y tipo de contenido
      res.end(err ? 'ERROR' : data); // Envï¿½a la respuesta, ya sea un error o los datos del archivo
    });
  } else { // Si la URL no es la raï¿½z
    res.writeHead(404).end('404 NOT FOUND'); // Envï¿½a un error 404
  }
});

// Crea un servidor WebSocket que usa el servidor HTTP
const wss = new WebSocket.Server({ server }); // Inicializa el servidor WebSocket
const tcpClients = []; // Array para almacenar los clientes TCP conectados

// Maneja las conexiones WebSocket
wss.on('connection', ws => { // Cuando un cliente se conecta
  ws.on('message', message => { // Cuando se recibe un mensaje
    tcpClients.forEach(client => client.write(message)); // Envï¿½a el mensaje a todos los clientes TCP conectados
  });
});

// Crea un servidor TCP
net.createServer(socket => { // Inicializa el servidor TCP
  tcpClients.push(socket); // Agrega el nuevo cliente al array
  socket.on('data', data => { // Cuando se recibe datos del cliente TCP
    const command = data.toString().trim(); // Convierte los datos a cadena y elimina espacios en blanco
    // Responde segï¿½n el comando recibido
    socket.write(command === 'on' ? 'LED encendido' : command === 'off' ? 'LED apagado' : 'Comando no reconocido');
  });
}).listen(tcpPort); // Escucha en el puerto TCP definido

// Inicia el servidor HTTP
server.listen(httpPort, hostname, () => console.log(`Servidor HTTP en http://${hostname}:${httpPort}/`)); // Imprime la URL del servidor HTTP al iniciar