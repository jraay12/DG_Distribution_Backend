import multer from "multer";
import path from "path";
import { BadRequestError } from "./error/BadRequestError";

export const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const uniqueName = `${Date.now()}-${Math.random()}${ext}`;
      cb(null, uniqueName);
    }
  }),

  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;

    const extName = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    const mimeType = allowedTypes.test(file.mimetype);

    if (extName && mimeType) {
      cb(null, true); // accept file
    } else {
      cb(new BadRequestError("Only image files are allowed!"));
    }
  }
});