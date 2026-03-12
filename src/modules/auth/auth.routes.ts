import { Router } from "express";
import { AuthController } from "./auth.controller";

const authRoutes = (authContoller: AuthController): Router => {
  const routes = Router();

  routes.post("/login", authContoller.login);
  routes.post("/logout", authContoller.logout);
  routes.post("/refresh", authContoller.refresh);
  return routes;
};

export default authRoutes;
