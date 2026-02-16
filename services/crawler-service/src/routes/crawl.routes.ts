import { Router } from "express";
import {crawHandler} from "../controllers/crawl.controller";

const router = Router();

router.post("/", crawHandler);

export default router;