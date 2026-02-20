import { Router } from "express";
import { crawlHandler } from "../controllers/crawl.controller";

const router = Router();

router.post("/", crawlHandler);

export default router;