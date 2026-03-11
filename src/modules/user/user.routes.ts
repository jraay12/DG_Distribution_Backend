import { Router } from "express";
import { UserController } from "./user.controller";

const userRoutes = (userController: UserController): Router => {
  const routes = Router();

  routes.post("/create", userController.createUser);

  return routes
};

export default userRoutes;
