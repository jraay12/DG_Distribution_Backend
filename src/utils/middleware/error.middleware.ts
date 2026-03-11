import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../error/BadRequestError";
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof BadRequestError) {
    return res.status(400).json({
      error: err.message,
    });
  }

  if ((err as any).code === "P2002") {
    res
      .status(409)
      .json({ success: false, message: "Unique constraint failed" });
    return;
  }

  console.log(err);
  res.status(500).json({ success: false, message: "Internal server error" });
};
