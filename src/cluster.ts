import cluster from 'cluster';
import os from 'os';
import process from 'node:process';
import http from 'http';
import { UserServer } from './user.server';
import { UserController } from './user.controller';
import { UserService } from './user.service';

const PORT: number = process.env.PORT ? Number(process.env.PORT) : 4000;
const cpus = os.cpus().length;

const createProxyRequest = (
  request: http.IncomingMessage,
  response: http.ServerResponse,
  port: number,
) => {
  const proxyReq = http.request(
    {
      hostname: 'localhost',
      port,
      path: request.url,
      method: request.method,
      headers: request.headers,
    },
    (proxyRes) => {
      response.writeHead(proxyRes.statusCode!, proxyRes.headers);
      proxyRes.pipe(response);
    },
  );
  request.pipe(proxyReq);
};

if (cluster.isPrimary) {
  console.log(`Master process started. Number of CPU cores: ${cpus}`);

  for (let i = 0; i < cpus; i++) {
    cluster.fork({PORT: PORT + i + 1});
  }

  cluster.on('exit', (worker, code) => {
    if (code !== 0) {
      console.log(`Worker ${worker.id} crashed. Starting a new worker...`);
      cluster.fork({PORT: PORT + worker.id});
    }
  });

  let currentWorkerPort = PORT + 1;
  http
    .createServer((req, res) => {
      createProxyRequest(req, res, currentWorkerPort);
      currentWorkerPort =
        currentWorkerPort < PORT + cpus ? currentWorkerPort + 1 : PORT + 1;
    })
    .listen(PORT, () => {
      console.log(`Main server listening on port ${PORT}`);
    });
} else {
  const workerPort = Number(process.env.PORT);
  const server = new UserServer(workerPort, new UserController(new UserService()));

  server.start(() => {
    console.log(
      `Worker ${cluster.worker!.id} started on port ${workerPort}`,
    );
  });
}
