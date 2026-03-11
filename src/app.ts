import express from "express";
import { Request, Response } from "express";
import { errorHandler } from "./utils/middleware/error.middleware";
import userRoutes from "./modules/user/user.routes";
import { userController } from "./container";
const app = express();

app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "UP",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/users", userRoutes(userController));

app.use(errorHandler);

export default app;
