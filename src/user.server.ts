import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import { Messages, MethodTypes } from './enums';
import { getUserIdFromUrl, responseErrorData, setResponse } from './helpers';
import { UserController } from './user.controller';
import { RELATIVE_API_URL } from './constants';

export class UserServer {
  private _server: Server;

  get server() {
    return this._server;
  }

  constructor(private _port: number, private _userController: UserController) {
    this._server = createServer(this.requestHandler);
  }

  public start(callback?: () => void) {
    if (!this._server?.listening) {
      this._server.listen(this._port, callback || (() => console.log(`Server is running on PORT: ${this._port}`)));
    }
  }

  public stop() {
    this._server?.close(() => {
      console.log(`Server with port ${this._port} stopped`);
    });
  }

  public requestHandler = async (req: IncomingMessage, res: ServerResponse) => {
    try {
      if (req.url.startsWith(RELATIVE_API_URL)) {
        let userId = getUserIdFromUrl(req.url);

        switch (req.method) {
          case MethodTypes.GET: {
            userId ? await this._userController.getUserById(res, userId) : await this._userController.getAllUsers(res);
            break;
          }
          case MethodTypes.POST: {
            await this._userController.createUser(req, res);
            break;
          }
          case MethodTypes.PUT: {
            await this._userController.updateUser(req, res, userId);
            break;
          }
          case MethodTypes.DELETE: {
            await this._userController.deleteUser(res, userId);
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
}
