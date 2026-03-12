import { UserService } from "./modules/user/user.service";
import { UserController } from "./modules/user/user.controller";
import { UserRepository } from "./modules/user/user.repository";
import { Bcrypt } from "./utils/bcrypt";
import { prisma } from "./config/prisma";
import { Jwt } from "./utils/jwt";
import { AuthService } from "./modules/auth/auth.service";
import { AuthController } from "./modules/auth/auth.controller";


const access_token_secret = process.env.ACCESS_TOKEN_SECRET!;
const refresh_token_secret = process.env.REFRESH_TOKEN_SECRET!;

// Other services
const bcrypt = new Bcrypt();
export const jwt = new Jwt(access_token_secret, refresh_token_secret);

// repository
const userRepository = new UserRepository(prisma);

// service
const userService = new UserService(userRepository, bcrypt);
const authService = new AuthService(userRepository, jwt, bcrypt);

// controller
export const userController = new UserController(userService);
export const authController = new AuthController(authService)