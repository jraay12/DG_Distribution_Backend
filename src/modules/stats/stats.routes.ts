import { Router } from "express";
import { StatsController } from "./stats.controller";
import { Jwt } from "../../utils/jwt";
import { AuthMiddleware } from "../../utils/middleware/authMiddleware";

const statsRoutes = (statsController: StatsController, jwtService: Jwt): Router => {
  const routes = Router()

  routes.get('/', AuthMiddleware(jwtService), statsController.getDashboardStats)

  return routes
}

export default statsRoutes