import { Router } from "express";
import { analyzeHandler } from "../controllers/analyze.controller";

const router = Router();

router.post("/", analyzeHandler);

export default router;