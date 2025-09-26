import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";

export const UserController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, role } = req.body;
      const user = await UserService.register(name, email, role);
      res.status(201).json(user);
    } catch (err) { next(err); }
  },
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.get(req.params.id);
      if (!user) return res.status(404).json({ error: "Not found" });
      res.json(user);
    } catch (err) { next(err); }
  },
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = Number(req.query.limit ?? 20);
      const skip = Number(req.query.skip ?? 0);
      const users = await UserService.list(limit, skip);
      res.json(users);
    } catch (err) { next(err); }
  }
};
