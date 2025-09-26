import { Router } from "express";
import { UserController } from "../controllers/user.controller";

const router = Router();

router.get("/health", (_req, res) => res.json({ ok: true }));
router.post("/users", UserController.create);
router.get("/users", UserController.list);
router.get("/users/:id", UserController.get);

export default router;
