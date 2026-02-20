import { Router } from "express";
import { detectHandler } from "../controllers/detect.controller";

const router = Router();

router.post("/", detectHandler);

export default router;