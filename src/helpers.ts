import { IUserInput } from './models';
import { IncomingMessage, ServerResponse } from 'node:http';
import { Messages } from './enums';

export function isUserDataValid({username, hobbies, age}: IUserInput): boolean {
  return !username || !age || !Array.isArray(hobbies);
}

export function setResponse(res: ServerResponse, data: unknown, status: number) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

export function responseErrorData(errorMessage: string) {
  return { errorMessage };
}

export async function getRequestBody<T>(req: IncomingMessage): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(body) as T);
      } catch {
        reject(new Error(Messages.INVALID_JSON));
      }
    });
    req.on('error', reject);
  });
}
