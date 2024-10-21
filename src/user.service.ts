import { IUser, IUserInput } from './models';
import { v4 } from 'uuid';
import path from 'path';
import { readFile, writeFile } from 'fs/promises';

export class UserService {
  private _usersFilePath: string;

  constructor() {
    this._usersFilePath = path.join(process.cwd(), "users.json");
  }

  private async readData(): Promise<IUser[]> {
    try {
      const data = await readFile(this._usersFilePath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  private async writeData(users: IUser[]): Promise<void> {
    const data = JSON.stringify(users);
    await writeFile(this._usersFilePath, data);
  }

  public async getAllUsers(): Promise<IUser[]> { return await this.readData(); }

  public async getUserById(id: string): Promise<IUser> {
    const users = await this.getAllUsers();
    return users.find((user: IUser) => user.id === id);
  }

  public async createUser(input: IUserInput): Promise<IUser> {
    const user: IUser = { id: v4(), ...input };
    const users = await this.getAllUsers();
    users.push(user);
    await this.writeData(users);
    return user;
  }

  public async updateUser(id: string, input: IUserInput): Promise<IUser> {
    const users = await this.getAllUsers();
    const userIndex: number = users.findIndex((user: IUser) => (user.id === id));

    if (userIndex === -1) return null;

    users[userIndex] = { ...users[userIndex], ...input };
    await this.writeData(users);

    return users[userIndex];
  }

  public async deleteUser(id: string): Promise<boolean> {
    const users = await this.getAllUsers();
    const userIndex: number = users.findIndex((user: IUser) => (user.id === id));

    if (userIndex === -1) return false;

    users.splice(userIndex, 1);
    await this.writeData(users);

    return true;
  }
}
