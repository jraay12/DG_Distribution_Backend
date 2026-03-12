import { Router } from "express";
import { UserController } from "./user.controller";

const userRoutes = (userController: UserController): Router => {
  const routes = Router();

  routes.post("/create", userController.createUser);
  routes.post("/change-password/:user_id", userController.updatePassword);
  return routes;
};

export default userRoutes;
