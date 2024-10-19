export interface IUser extends IUserInput {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
}

export type IUserInput = Omit<IUser, 'id'>;
