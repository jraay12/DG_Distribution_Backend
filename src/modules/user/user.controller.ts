import { ChangePasswordDTO } from "./dto/ChangePasswordDTO";
import { CreateUserDTO } from "./dto/CreateUserDTO";
import { UserService } from "./user.service";
import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../../utils/error/BadRequestError";
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

  updatePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input: ChangePasswordDTO = req.body;
      const user_id = req.user?.user_id
      await this.userService.updatePassword(user_id, input);
      res.status(200).json({
        message: "successfully change the password"
      })
    } catch (error) {
      next(error);
    }
  };

  activateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {user_id} = req.params as {user_id: string}
      const result = await this.userService.activateUser({user_id})
      res.status(200).json({
        message: "Successfully activate user",
        data:result
      })
    } catch (error) {
      next(error)
    }
  }

  deactivateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {user_id} = req.params as {user_id: string}
      const result = await this.userService.deactivateUser({user_id})
      res.status(200).json({
        message: "Successfully deactivate user",
        data:result
      })
    } catch (error) {
      next(error)
    }
  }

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {user_id} = req.params as {user_id: string}
      const {email, name, role} = req.body as {name: string, email: string, role?: "ADMIN" | "USER"}
      const result = await this.userService.updateUser({email, name, role, user_id})
      res.status(200).json({
        message: "Successfully update",
        data: result
      })
    } catch (error) {
      next(error)
    }
  }

  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const requestedStatus = (req.query.status as string | undefined)?.toLowerCase() ?? "all";

      if (!["active", "inactive", "all"].includes(requestedStatus)) {
        throw new BadRequestError("Status must be active, inactive, or all");
      }

      const result = await this.userService.getUsers(
        page,
        limit,
        requestedStatus as "active" | "inactive" | "all",
      );
      res.status(200).json({
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  };
}
