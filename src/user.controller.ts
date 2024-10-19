import * as userService from './user.service';
import { ServerResponse } from 'node:http';
import { validate as isUuid } from 'uuid';
import { IUser, IUserInput } from './models';
import { getRequestBody, isUserDataValid, responseErrorData, setResponse } from './helpers';
import { IncomingMessage } from 'http';
import { Messages } from './enums';

export function getAllUsers(res: ServerResponse): void {
  setResponse(res, userService.getAllUsers(), 200);
}

export function getUserById(res: ServerResponse, userId: string): void {
  if (!isUuid(userId)) {
    return setResponse(
      res,
      responseErrorData(Messages.INVALID_USER_ID),
      400,
    );
  }

  const user: IUser = userService.getUserById(userId);
  if (!user) {
    return setResponse(
      res,
      responseErrorData(Messages.USER_NOT_FOUND),
      404,
    );
  }

  setResponse(res, user, 200);
}

export async function createUser(req: IncomingMessage, res: ServerResponse) {
  try {
    const body: IUserInput = await getRequestBody(req);

    if (isUserDataValid(body)) {
      return setResponse(
        res,
        responseErrorData(Messages.INVALID_REQUEST_BODY),
        400,
      );
    }

    const newUser: IUser = userService.createUser(body);

    setResponse(res, newUser, 201);
  } catch (error) {
    console.error(error);
    setResponse(res, responseErrorData(Messages.INTERNAL_SERVER_ERROR), 500);
  }
}

export async function updateUser(req: IncomingMessage, res: ServerResponse, userId: string) {
  if (!isUuid(userId)) {
    return setResponse(
      res,
      responseErrorData(Messages.INVALID_USER_ID),
      400,
    );
  }

  try {
    const updatedData: IUserInput = await getRequestBody(req);
    const user: IUser = userService.updateUser(userId, updatedData);
    if (!user) {
      return setResponse(res, responseErrorData(Messages.USER_NOT_FOUND), 404);
    }

    setResponse(res, user, 200);
  } catch (error) {
    console.error(error);
    setResponse(res, responseErrorData(Messages.INTERNAL_SERVER_ERROR), 500);
  }
};

export function deleteUser(res: ServerResponse, userId: string): void {
  if (!isUuid(userId)) {
    return setResponse(
      res,
      responseErrorData(Messages.INVALID_USER_ID),
      400,
    );
  }

  if (!userService.deleteUser(userId)) {
    return setResponse(
      res,
      responseErrorData(Messages.USER_NOT_FOUND),
      404,
    );
  }

  setResponse(res, {success: true}, 204);
}

