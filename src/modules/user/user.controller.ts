import { ChangePasswordDTO } from "./dto/ChangePasswordDTO";
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
      const {email, name} = req.body as {name: string, email: string}
      const result = await this.userService.updateUser({email, name, user_id})
      res.status(200).json({
        message: "Successfully update",
        data: result
      })
    } catch (error) {
      next(error)
    }
  }
}
