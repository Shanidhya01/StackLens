import { Router } from "express";
import { performanceHandler } from "../controllers/performance.controller";

const router = Router();

router.post("/", performanceHandler);

export default router;