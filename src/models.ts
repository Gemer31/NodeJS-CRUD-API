export interface IUser extends IUserInput {
  id: string;
}

export type IUserInput = {
  username: string;
  age: number;
  hobbies: string[];
}
