import { Router, Request, Response } from "express";


const router = Router();


// Routes 
router.get("/", (req: Request, res: Response) => {
  res.send({ message: "API Response" });
});

import manageRouter from "./manage";
router.use("/", manageRouter);

import plaidRouter from "./plaid";
router.use("/plaid", plaidRouter);


export default router;