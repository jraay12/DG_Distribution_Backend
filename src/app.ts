import express from "express";
import { Request, Response } from "express";
import { errorHandler } from "./utils/middleware/error.middleware";
import userRoutes from "./modules/user/user.routes";
import authRoutes from "./modules/auth/auth.routes";
import brandRoutes from "./modules/brand/brand.routes";
import modelRoutes from "./modules/model/model.routes";
import productRoutes from "./modules/product/product.routes";
import { userController, authController, jwt, brandController, modelController, productController } from "./container";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();
app.use(cors({ origin: "http://localhost:5174" , credentials: true, methods: ["GET", "POST", "DELETE", "PUT", "PATCH"]}));
app.use(express.json());
app.use(cookieParser());
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "UP",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/users", userRoutes(userController, jwt));
app.use("/api/brand", brandRoutes(brandController, jwt));
app.use("/api/model", modelRoutes(modelController, jwt));
app.use("/api/product", productRoutes(productController, jwt));
app.use("/api/auth", authRoutes(authController));

app.use(errorHandler);

export default app;
