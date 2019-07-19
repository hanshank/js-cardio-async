const http = require('http');
// import HTTP Node module
const server = http.createServer(); // Create the server

const port = 5000; // create the port
const handleRoutes = require('./router');

// listens for the request event on our server
// event will be fired anytime a client makes a
// request
// takes a callback with request and response,
// request is what the client sent to us
// response is what we send back
server.on('request', handleRoutes);

// opens up our server up on our port 5000 for connections
server.listen(port, console.log(`server listening on port ${port}`));
