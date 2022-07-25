const http = require('http');
const app = require('./app');

/**
 * Parsing the port string value to an integer.
 * @param val the string to be normalized.
 * @return val if can not be parsed to integer
 * @return port if port superior or equal to 0
 */
const normalizePort = val => {
  const port = parseInt(val, 10);
  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};

const port = normalizePort(process.env.PORT || '3000');//environment variable PORT or 3000
app.set('port', port);

/**
 * Handling server errors.
 * @param error the error to be handled.
 * @throws error
 * @exit if no permission or port already used
 */
const errorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);// exit with uncaught exception
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1);// exit with uncaught exception
      break;
    default:
      throw error;
  }
};

const server = http.createServer(app);

//setting callbacks on server errors and listening
server.on('error', errorHandler);
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});

server.listen(port);