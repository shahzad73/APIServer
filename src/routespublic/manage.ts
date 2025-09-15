import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { AppDataSource } from "../data-source";
import { Admin } from "../entity/Admin";
import jwt from "jsonwebtoken";

const router = Router();
  
router.get("/generateAdminUserPassword", async (req: Request, res: Response) => {
try {
    const password = req.query.password as string; // Type assertion
    const hash = await bcrypt.hash(password, 10); // Ensure to await the hash function
    res.send({ hash });
} catch (error) {
    res.json({ error: "Error generating password hash: " + (error as Error).toString() });
}
});

// POST /admin/login
router.post("/adminlogin", async (req, res) => {
  const { username, password } = req.body;

  const adminRepo = AppDataSource.getRepository(Admin);

  try {
    const admin = await adminRepo.findOneBy({ username });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET!,
      { expiresIn: "6h" }
    );

    res.json({ token });
  } catch (err: any) {
    res.status(500).json({ message: "Internal server error " + err.toString() });
  }
});


export default router;