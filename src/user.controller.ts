import { ServerResponse } from 'node:http';
import { validate as isUuid } from 'uuid';
import { IUser, IUserInput } from './models';
import { getRequestBody, isUserDataValid, responseErrorData, setResponse } from './helpers';
import { IncomingMessage } from 'http';
import { Messages } from './enums';
import { UserService } from './user.service';

export class UserController {
  private _userService: UserService;

  constructor(private userService: UserService) {
    this._userService = userService;
  }

  public async getAllUsers(res: ServerResponse): Promise<void> {
    const users = await this.userService.getAllUsers()
    setResponse(res, users, 200);
  }

  public async getUserById(res: ServerResponse, userId: string): Promise<void> {
    if (!isUuid(userId)) {
      return setResponse(
        res,
        responseErrorData(Messages.INVALID_USER_ID),
        400,
      );
    }

    const user: IUser = await this.userService.getUserById(userId);
    if (!user) {
      return setResponse(
        res,
        responseErrorData(Messages.USER_NOT_FOUND),
        404,
      );
    }

    setResponse(res, user, 200);
  }

  public async createUser(req: IncomingMessage, res: ServerResponse): Promise<void> {
    try {
      const body: IUserInput = await getRequestBody(req);

      if (isUserDataValid(body)) {
        return setResponse(
          res,
          responseErrorData(Messages.INVALID_REQUEST_BODY),
          400,
        );
      }

      const newUser: IUser = await this.userService.createUser(body);

      setResponse(res, newUser, 201);
    } catch (error) {
      console.error(error);
      setResponse(res, responseErrorData(Messages.INTERNAL_SERVER_ERROR), 500);
    }
  }

  public async updateUser(req: IncomingMessage, res: ServerResponse, userId: string): Promise<void> {
    if (!isUuid(userId)) {
      return setResponse(
        res,
        responseErrorData(Messages.INVALID_USER_ID),
        400,
      );
    }

    try {
      const updatedData: IUserInput = await getRequestBody(req);
      const user: IUser = await this.userService.updateUser(userId, updatedData);
      if (!user) {
        return setResponse(res, responseErrorData(Messages.USER_NOT_FOUND), 404);
      }

      setResponse(res, user, 200);
    } catch (error) {
      console.error(error);
      setResponse(res, responseErrorData(Messages.INTERNAL_SERVER_ERROR), 500);
    }
  };

public async deleteUser(res: ServerResponse, userId: string): Promise<void> {
    if (!isUuid(userId)) {
      return setResponse(
        res,
        responseErrorData(Messages.INVALID_USER_ID),
        400,
      );
    }

    const success = await this.userService.deleteUser(userId)
    if (!success) {
      return setResponse(
        res,
        responseErrorData(Messages.USER_NOT_FOUND),
        404,
      );
    }

    setResponse(res, {success: true}, 204);
  }
}
