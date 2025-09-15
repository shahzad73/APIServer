import express, { Request, Response, NextFunction } from "express";
import { AppDataSource } from "./data-source";
import cors from "cors";
import rateLimit, { ipKeyGenerator }  from "express-rate-limit";
import { logger } from "./logger";
import helmet from "helmet";

const app = express();
const PORT = process.env.PORT || 5321;




// Middleware
app.use(express.json());
app.use(helmet()); // secure HTTP headers
app.use(cors({ origin: "*" })); // adjust origin in production


const APIRatelimiter = rateLimit({
  windowMs: Number(process.env.API_RATE_LIMIT_WINDOW_MS || 60000),
  max: Number(process.env.API_RATE_LIMIT_MAX || 600),
  keyGenerator: (req) => {
    const auth = (req.header("authorization") || "").replace(/^ApiKey\s+/i, "");
    const kid = auth.split(".")[0];

    // ✅ ipKeyGenerator expects a string (the IP), not the whole request
    return kid || ipKeyGenerator(req.ip || "");
  },
  handler: (req, res) => res.status(429).json({ error: "Too many requests" }),
});



// Simple request logger (before Winston)
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next();
});


import publicrouter from "./routespublic";
app.use("/public", publicrouter);

import router from "./routesapi";
import { apiKeyAuth } from "./middleware/apiKeyAuth";
app.use("/api", APIRatelimiter, apiKeyAuth, router);

import adminrouter from "./routesadmin";
import { adminAuth } from "./middleware/adminAuth";
app.use("/admin", adminAuth, adminrouter);



// Start server
app.listen(PORT, async () => {

  AppDataSource.initialize().then( async() => {
      console.log('Data Source has been initialized!');
      console.log(`Server running on http://localhost:${PORT}`);

       // 👉 Run typeorm migrations here
      await AppDataSource.runMigrations();
      logger.info("✅ Migrations have been run successfully!");

      logger.info('Data Source has been initialized!');
      logger.info(`Server running on http://localhost:${PORT}`);
  })
  .catch((err) => {
      console.error('Error during Data Source initialization:', err);
  });

});

export default app;

