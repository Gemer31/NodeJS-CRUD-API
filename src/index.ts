import process from 'node:process';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { createUser, deleteUser, getAllUsers, getUserById, updateUser } from './user.controller';
import { Messages, MethodTypes } from './enums';
import { responseErrorData, setResponse } from './helpers';

const RELATIVE_API_URL: string = '/api/users';
const PORT: number = process.env.PORT ? Number(process.env.PORT) : 3001;

async function requestHandler(req: IncomingMessage, res: ServerResponse) {
  try {
    if (req.url.startsWith(RELATIVE_API_URL)) {
      const userId = req.method.replace(RELATIVE_API_URL, '');

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
          break;
        }
      }
    } else {
      console.log(req.method);
      setResponse(
        res,
        responseErrorData(Messages.API_IS_NOT_FOUND),
        404,
      );
    }
  } catch (e) {
    setResponse(
      res,
      responseErrorData(Messages.API_IS_NOT_FOUND),
      404,
    );
  }
}

const server = createServer(requestHandler);

server.listen(
  PORT,
  () => console.log(`Server is running on PORT: ${PORT}`),
);
