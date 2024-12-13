const jsonServer = require('json-server');
const server = jsonServer.create();
const middlewares = jsonServer.defaults();

server.use(middlewares);

// Custom routes for each JSON file
server.get('/A', (req, res) => {
  res.json(require('./A.json'));
});

server.get('/B', (req, res) => {
  res.json(require('./B.json'));
});

server.get('/C', (req, res) => {
  res.json(require('./C.json'));
});

server.listen(3000, () => {
  console.log('JSON Server is running on port 3000');
});
