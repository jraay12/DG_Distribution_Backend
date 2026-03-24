import { Router } from "express";
import { AuthMiddleware } from "../../utils/middleware/authMiddleware";
import { Jwt } from "../../utils/jwt";
import { ProductController } from "./product.controller";

const productRoutes = (productController: ProductController, jwtService: Jwt): Router => {
  const routes = Router();

  routes.post("/", AuthMiddleware(jwtService, ["ADMIN"]), productController.save)

  return routes;
};

export default productRoutes;
