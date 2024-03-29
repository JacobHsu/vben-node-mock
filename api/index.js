"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const compression_1 = tslib_1.__importDefault(require("compression"));
const morgan_1 = tslib_1.__importDefault(require("morgan"));
const cors_1 = tslib_1.__importDefault(require("cors"));
const http_1 = tslib_1.__importDefault(require("http"));
const path_1 = tslib_1.__importDefault(require("path"));
const yamljs_1 = tslib_1.__importDefault(require("yamljs"));
const api = tslib_1.__importStar(require("./api"));
const security_1 = require("./security");
const swagger_routes_express_1 = require("swagger-routes-express");
const app = express_1.default();
const port = 6580;
// Compression
app.use(compression_1.default());
// Logger
app.use(morgan_1.default('dev'));
// Enable CORS
app.use(cors_1.default());
// POST, PUT, DELETE body parser
app.use(express_1.default.json({ limit: '20mb' }));
app.use(express_1.default.urlencoded({
    limit: '20mb',
    extended: false
}));
// No cache
app.use((req, res, next) => {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '-1');
  next();
});
// Read and swagger config file
const apiDefinition = yamljs_1.default.load(path_1.default.resolve(__dirname, 'swagger.yml'));
// Create mock functions based on swaggerConfig
const options = {
    security: {
        AccessTokenAuth: security_1.accessTokenAuth
    }
};
const connectSwagger = swagger_routes_express_1.connector(api, apiDefinition, options);
connectSwagger(app);
// Print swagger router api summary
const apiSummary = swagger_routes_express_1.summarise(apiDefinition);
console.log(apiSummary);
// Catch 404 error
app.use((req, res) => {
  const err = new Error('Not Found');
  res.status(404).json({
      message: err.message,
      error: err
  });
});
// Create HTTP server.
const server = http_1.default.createServer(app);
// Listen on provided port, on all network interfaces.
server.listen(port);
server.on('error', onError);
console.log('http://localhost:' + port + '/mock-api/login');
console.log('http://localhost:' + port + '/mock-api/getUserInfo');
console.log('http://localhost:' + port + '/mock-api/getStockInfo');
console.log('http://localhost:' + port + '/mock-api/logout');
console.log('http://localhost:' + port + '/mock-api/user');
console.log('http://localhost:' + port + '/mock-api/users');
console.log('http://localhost:' + port + '/mock-api/users/login');

// Event listener for HTTP server "error" event.
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error('Express ERROR (app) : %s requires elevated privileges', bind);
      process.exit(1);
    case 'EADDRINUSE':
      console.error('Express ERROR (app) : %s is already in use', bind);
      process.exit(1);
    default:
      throw error;
  }
}
