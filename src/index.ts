import process from 'node:process';
import { createServer, IncomingMessage, ServerResponse } from 'http';

const RELATIVE_API_URL: string = '/api/users';
const PORT: number = process.env.PORT ? Number(process.env.PORT) : 3001;

function requestHandler(req: IncomingMessage, res: ServerResponse) {
  switch (req.method) {
    case 'GET': {
      res.writeHead(200, { 'Content-Type': 'application/json'});
      res.end(JSON.stringify({ message: req.url}));
      break;
    }
    case 'POST': {
      res.writeHead(201, { 'Content-Type': 'application/json'});
      res.end(JSON.stringify({ message: req.url}));
      break;
    }
    default: {
      res.writeHead(404, { 'Content-Type': 'application/json'});
      res.end(JSON.stringify({ message: req.url}));
    }
  }
}

const server = createServer(requestHandler);

server.listen(
  PORT,
  () => console.log(`Server is running on PORT: ${PORT}`)
)
