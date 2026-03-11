import { UserService } from "./modules/user/user.service";
import { UserController } from "./modules/user/user.controller";
import { UserRepository } from "./modules/user/user.repository";
import { prisma } from "./config/prisma";

// repository
const userRepository = new UserRepository(prisma);

// service
const userService = new UserService(userRepository);

// controller
export const userController = new UserController(userService);
