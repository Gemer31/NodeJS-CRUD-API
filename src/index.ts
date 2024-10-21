import dotenv from 'dotenv';
import process from 'node:process';
import { UserServer } from './user.server';
import { UserController } from './user.controller';
import { UserService } from './user.service';

dotenv.config();

const PORT: number = process.env.PORT ? Number(process.env.PORT) : 3001;
const userService = new UserService();
const userController = new UserController(userService);
export const userServer = new UserServer(PORT, userController);

userServer.start();
