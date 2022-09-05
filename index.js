const http = require('http') // require node.js built-in module to transfer data over http
const app = require('./app')
const logger = require('./utils/logger')
const config = require('./utils/config')

const server = http.createServer(app) // assign createServer http module to the variable server and call the app

server.listen(config.PORT, () => { // Bind and listen for connections on the given host and port
  logger.info(`Server running on port ${config.PORT}`)
})
