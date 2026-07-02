import { createServer } from "http";
import app from "./app.js";
import { initSocket } from "./lib/socket.js";
import { logger } from "./lib/logger.js";

const port = Number(process.env.PORT || 5000);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${process.env.PORT}"`);
}

const httpServer = createServer(app);
initSocket(httpServer);

httpServer.listen(port, "0.0.0.0", () => {
  logger.info({ port }, "Server listening with Socket.IO");
});