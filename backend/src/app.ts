import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";

const app: Express = express();

// In production, set FRONTEND_URL to your Vercel URL (e.g. https://your-app.vercel.app)
// Local dev origins are always allowed so `npm run dev` keeps working unchanged.
const allowedOrigins = [
  process.env.FRONTEND_URL?.replace(/\/+$/, ""),
  "http://localhost:3000",
].filter((origin): origin is string => Boolean(origin));

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);
app.use(
  cors({
    // Falls back to allowing all origins only if FRONTEND_URL was never set,
    // so a forgotten env var doesn't fail closed and take the API down.
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", router);

export default app;