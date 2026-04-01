import { Router } from "express";
import { AuthMiddleware } from "../../utils/middleware/authMiddleware";
import { Jwt } from "../../utils/jwt";
import { ProductController } from "./product.controller";

const productRoutes = (productController: ProductController, jwtService: Jwt): Router => {
  const routes = Router();

  routes.post("/", AuthMiddleware(jwtService, ["ADMIN"]), productController.save)
  routes.delete('/:product_id', AuthMiddleware(jwtService, ["ADMIN"]), productController.softDelete)
  routes.patch('/:product_id/restore', AuthMiddleware(jwtService, ["ADMIN"]), productController.restore)
  routes.get("/", AuthMiddleware(jwtService), productController.getProduct)
  routes.patch("/:product_id", AuthMiddleware(jwtService, ["ADMIN"]), productController.update)
  return routes;
};

export default productRoutes;
