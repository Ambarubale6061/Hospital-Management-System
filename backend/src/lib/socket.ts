import { Server, type Socket } from "socket.io";
import { type Server as HTTPServer } from "http";
import { logger } from "./logger.js";

let io: Server | null = null;

// Same origin logic as app.ts, kept in sync manually since Socket.IO
// configures CORS separately from Express's cors() middleware.
const allowedOrigins = [
  process.env.FRONTEND_URL?.replace(/\/+$/, ""),
  "http://localhost:3000",
].filter((origin): origin is string => Boolean(origin));

export function initSocket(httpServer: HTTPServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins.length > 0 ? allowedOrigins : "*",
      methods: ["GET", "POST", "PATCH", "DELETE"],
    },
    path: "/api/socket.io",
    transports: ["polling", "websocket"],
  });

  io.on("connection", (socket: Socket) => {
    logger.info({ socketId: socket.id }, "Client connected");
    socket.on("disconnect", () => {
      logger.info({ socketId: socket.id }, "Client disconnected");
    });
  });

  return io;
}

export function emitEvent(event: string, data: unknown): void {
  if (io) {
    io.emit(event, data);
  }
}