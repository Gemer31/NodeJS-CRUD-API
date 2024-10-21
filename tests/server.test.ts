import supertest from 'supertest';
import { Messages } from '../src/enums';
import { IUserInput } from '../src/models';
import { RELATIVE_API_URL } from '../src/constants';
import { UserServer } from '../src/user.server';
import { UserService } from '../src/user.service';
import { UserController } from '../src/user.controller';
import { unlink } from 'fs'
import path from 'path';

const usersFile = 'mock-users.json';

unlink(path.join(process.cwd(), usersFile), () => {});

const userService = new UserService(usersFile);
const userController = new UserController(userService);
const userServer = new UserServer(4000, userController);

const request = supertest(userServer.server);

const mockUser: IUserInput = {
  username: 'Some username',
  age: 35,
  hobbies: [],
};
const updatedUser = {
  ...mockUser,
  hobbies: ['programming'],
};
let userId: string;

describe('UserServer users API', (): void => {
  beforeAll(() => {
    userServer.stop();
    userServer.start();
  });

  afterAll(() => userServer.stop());

  test('Create user. Should create and return a new user containing expected records', async () => {
    const response = await request
      .post(`${RELATIVE_API_URL}`)
      .send(mockUser)
      .set('Content-Type', 'application/json');
    userId = response.body.id;

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.username).toBe(mockUser.username);
    expect(response.body.age).toBe(mockUser.age);
    expect(response.body.hobbies).toStrictEqual(mockUser.hobbies);
  });

  test('Get user. Should return user by ID', async () => {
    const response = await request.get(`${RELATIVE_API_URL}/${userId}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', userId);
    expect(response.body.username).toBe(mockUser.username);
    expect(response.body.age).toBe(mockUser.age);
    expect(response.body.hobbies).toStrictEqual(mockUser.hobbies);
  });

  test('Update user. Should return updated user data by ID', async () => {
    const response = await request
      .put(`${RELATIVE_API_URL}/${userId}`)
      .send(updatedUser)
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', userId);
    expect(response.body.username).toBe(updatedUser.username);
    expect(response.body.age).toBe(updatedUser.age);
    expect(response.body.hobbies).toStrictEqual(updatedUser.hobbies);
  });

  test('Delete user. Should delete created user by ID', async () => {
    const response = await request.delete(`${RELATIVE_API_URL}/${userId}`);
    expect(response.status).toBe(204);
  });

  test('Get non existing user. Should return 404', async () => {
    const response = await request.get(`${RELATIVE_API_URL}/${userId}`);
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('errorMessage', Messages.USER_NOT_FOUND);
  });
});
