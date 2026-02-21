import { Router } from "express";
import { reportHandler } from "../controllers/report.controller";

const router = Router();

router.post("/", reportHandler);

export default router;