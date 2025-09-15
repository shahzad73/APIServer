import { Router, Request, Response } from "express";


const router = Router();


// Routes 
router.get("/", (req: Request, res: Response) => {
  res.send({ message: "API Response" });
});

import manageRouter from "./manage";
router.use("/", manageRouter);


export default router;