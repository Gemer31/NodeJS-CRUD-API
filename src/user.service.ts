import { IUser, IUserInput } from './models';
import { v4 } from 'uuid';

const users: IUser[] = [];

export function getAllUsers(): IUser[] { return users; }

export function getUserById(id: string): IUser {
  return users.find((user: IUser) => user.id === id);
}

export function createUser(input: IUserInput): IUser {
  const user: IUser = { id: v4(), ...input };
  users.push(user);
  return user;
}

export function updateUser(id: string, input: IUserInput): IUser {
  const userIndex: number = users.findIndex((user: IUser) => (user.id === id));

  if (userIndex === -1) return null;

  users[userIndex] = { ...users[userIndex], ...input };

  return users[userIndex];
}

export function deleteUser(id: string): boolean {
  const userIndex: number = users.findIndex((user: IUser) => (user.id === id));

  if (userIndex === -1) return false;

  users.splice(userIndex, 1);

  return true;
}
