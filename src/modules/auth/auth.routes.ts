import { Router } from "express";
import { AuthController } from "./auth.controller";

const authRoutes = (authContoller: AuthController): Router => {
  const routes = Router();

  routes.post("/login", authContoller.login);

  return routes
};

export default authRoutes;
