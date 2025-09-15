import { Router, Request, Response } from "express";

const router = Router();

import apiKeysRouter from "./apikeys";
router.use("/", apiKeysRouter);

export default router;