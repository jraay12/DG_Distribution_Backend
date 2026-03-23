import { Router } from "express";
import { UserController } from "./user.controller";
import { AuthMiddleware } from "../../utils/middleware/authMiddleware";
import { Jwt } from "../../utils/jwt";
const userRoutes = (userController: UserController, jwtService: Jwt): Router => {
  const routes = Router();

  routes.post("/create", userController.createUser);
  routes.post("/change-password",  AuthMiddleware(jwtService), userController.updatePassword);
  return routes;
};

export default userRoutes;
