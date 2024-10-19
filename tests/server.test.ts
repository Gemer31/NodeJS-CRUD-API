import supertest from 'supertest';
import { RELATIVE_API_URL, server } from '../src/server';
import { Messages } from '../src/enums';
import { IUserInput } from '../src/models';

const request = supertest(server);
const mockUser: IUserInput = {
  username: 'John Smith',
  age: 35,
  hobbies: [],
};
const updatedUser = {
  ...mockUser,
  hobbies: ['programming'],
};
let userId: string;

describe('Server users API', (): void => {
  beforeAll(() => {
    server.close();
    server.listen(4000);
  });

  afterAll(() => server.close());


  test('Get all users. Should return an empty array', async () => {
    const response = await request.get(`${RELATIVE_API_URL}`);
    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual([]);
  });

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
