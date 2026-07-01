import { Server, type Socket } from "socket.io";
import { type Server as HTTPServer } from "http";
import { logger } from "./logger.js";

let io: Server | null = null;

export function initSocket(httpServer: HTTPServer): Server {
  io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST", "PATCH", "DELETE"] },
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
