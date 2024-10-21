import cluster from 'cluster';
import os from 'os';
import process from 'node:process';
import http from 'http';
import { UserServer } from './user.server';
import { UserController } from './user.controller';
import { UserService } from './user.service';

const PORT: number = process.env.PORT ? Number(process.env.PORT) : 4000;
const cpus: number = os.cpus().length;

const delegateRequest = (request: http.IncomingMessage, response: http.ServerResponse, port: number) => {
  const delegateReq = http.request(
    {
      port,
      hostname: 'localhost',
      path: request.url,
      method: request.method,
      headers: request.headers,
    },
    (delegateRes) => {
      response.writeHead(delegateRes.statusCode, delegateRes.headers);
      delegateRes.pipe(response);
    },
  );
  request.pipe(delegateReq);
};

if (cluster.isPrimary) {
  console.log(`Number of CPU cores: ${cpus}`);

  for (let i = 0; i < cpus; i++) {
    cluster.fork({PORT: PORT + i + 1});
  }

  cluster.on('exit', (worker, code) => {
    if (code !== 0) {
      console.log(`Worker ${worker.id} crashed. Starting a new worker...`);
      cluster.fork({PORT: PORT + worker.id});
    }
  });

  let workerPort = PORT + 1;
  http
    .createServer((req, res) => {
      delegateRequest(req, res, workerPort);
      workerPort = (workerPort < PORT + cpus) ? (workerPort + 1) : (PORT + 1);
    })
    .listen(PORT, () => {
      console.log(`Main server listening on port ${PORT}`);
    });
} else {
  const workerPort: number = Number(process.env.PORT);
  const server = new UserServer(workerPort, new UserController(new UserService()));

  server.start(() => {
    console.log(`Worker ${cluster.worker!.id} started on port ${workerPort}`);
  });
}
