import { Router, Request, Response } from "express";
import { Customer } from "../entity/Customers";
import { AppDataSource } from "../data-source";
import { Params } from "../entity/Params";


const router = Router();

// Routes
router.get("/ping", async (req: Request, res: Response) => {
  const paramsRepo = AppDataSource.getRepository(Params);
  const paramRec = await paramsRepo.find({ where: { id: 1 } }); 
  return res.json( { "value" : paramRec[0]?.stringvalue || "pong"   });
});


router.get("/customers", async (req: Request, res: Response) => {
  const customerRepo = AppDataSource.getRepository(Customer);
  const customers = await customerRepo.find(); 
  return res.json(customers);
})

export default router;
