import express from "express";
import { Request, Response } from "express";
const app = express();

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "UP",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

app.use(express.json());

export default app;
