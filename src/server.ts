import process from 'node:process';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { createUser, deleteUser, getAllUsers, getUserById, updateUser } from './user.controller';
import { Messages, MethodTypes } from './enums';
import { responseErrorData, setResponse } from './helpers';
import dotenv from 'dotenv';

dotenv.config();

export const RELATIVE_API_URL: string = '/api/users';
const PORT: number = process.env.PORT ? Number(process.env.PORT) : 3001;

export async function requestHandler(req: IncomingMessage, res: ServerResponse) {
  try {
    if (req.url.startsWith(RELATIVE_API_URL)) {
      let userId = req.url.replace(RELATIVE_API_URL, '');

      if (userId.startsWith('/')) {
        userId = userId.replace('/', '');
      }

      switch (req.method) {
        case MethodTypes.GET: {
          userId ? getUserById(res, userId) : getAllUsers(res);
          break;
        }
        case MethodTypes.POST: {
          await createUser(req, res);
          break;
        }
        case MethodTypes.PUT: {
          await updateUser(req, res, userId);
          break;
        }
        case MethodTypes.DELETE: {
          await deleteUser(res, userId);
          break;
        }
        default: {
          setResponse(
            res,
            responseErrorData(Messages.METHOD_IS_NOT_FOUND),
            404,
          );
          break;
        }
      }
    } else {
      setResponse(
        res,
        responseErrorData(Messages.API_IS_NOT_FOUND),
        404,
      );
    }
  } catch (e) {
    console.error(e);
    setResponse(res, responseErrorData(Messages.INTERNAL_SERVER_ERROR), 500);
  }
}

export const server = createServer(requestHandler);

server.listen(
  PORT,
  () => console.log(`Server is running on PORT: ${PORT}`),
);
