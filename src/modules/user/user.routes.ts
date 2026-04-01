import { Router } from "express";
import { UserController } from "./user.controller";
import { AuthMiddleware } from "../../utils/middleware/authMiddleware";
import { Jwt } from "../../utils/jwt";
const userRoutes = (userController: UserController, jwtService: Jwt): Router => {
  const routes = Router();

  routes.post("/create", AuthMiddleware(jwtService, ["ADMIN"]), userController.createUser);
  routes.post("/change-password",  AuthMiddleware(jwtService, ["ADMIN"]), userController.updatePassword);
  routes.patch("/:user_id/activate",  AuthMiddleware(jwtService, ["ADMIN"]), userController.activateUser);
  routes.patch("/:user_id/deactivate",  AuthMiddleware(jwtService, ["ADMIN"]), userController.deactivateUser);
  routes.patch("/:user_id",  AuthMiddleware(jwtService), userController.update);
  return routes;
};

export default userRoutes;
