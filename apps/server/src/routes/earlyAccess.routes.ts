import { Router } from "express";
import { EarlyAccessController } from "../controllers/earlyAccess.controller";

const router = Router();

router.post("/", EarlyAccessController.submitRequest);

export default router;