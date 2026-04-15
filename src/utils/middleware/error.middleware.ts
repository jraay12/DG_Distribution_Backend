import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../error/BadRequestError";
import { NotFoundError } from "../error/NotFoundError";
import { UnAuthorizedError } from "../error/UnAuthorizedError";
import { ConflictError } from "../error/ConflictError";
import { ForbiddenError } from "../error/ForbiddenError";
import multer from "multer";
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

  if (err instanceof NotFoundError) {
    return res.status(404).json({
      error: err.message,
    });
  }

  if (err instanceof UnAuthorizedError) {
    return res.status(401).json({
      error: err.message,
    });
  }

  if (err instanceof ConflictError){
    return res.status(409).json({
      error: err.message
    })
  }

  if (err instanceof ForbiddenError){
    return res.status(403).json({
      error: err.message
    })
  }

  if ((err as any).code === "P2002") {
    res
      .status(409)
      .json({ success: false, message: "Unique constraint failed" });
    return;
  }

  if(err instanceof multer.MulterError){
    if(err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File too large. Maximum size allowed is 5MB."
      });
    }
  }

  console.log(err);
  res.status(500).json({ success: false, message: "Internal server error" });
};
