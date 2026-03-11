import { CreateUserDTO } from "./dto/CreateUserDTO";
import { UserService } from "./user.service";
import { Request, Response, NextFunction } from "express";
export class UserController {
  constructor(private userService: UserService) {}

  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input: CreateUserDTO = req.body;
      const result = await this.userService.createUser(input);
      res.status(201).json({
        message: "Successfully created new user",
        user: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
