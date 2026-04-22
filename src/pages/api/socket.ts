import type { NextApiRequest } from "next";
import type { NextApiResponseServerIO } from "../../types/socket";
import { Server as IOServer } from "socket.io";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(_req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    const io = new IOServer(res.socket.server, {
      path: "/api/socket/io",
      addTrailingSlash: false,
    });

    io.on("connection", (socket) => {
      socket.on("notifications:subscribe", (userId: string) => {
        if (!userId) return;
        socket.join(`user:${userId}`);
      });
    });

    res.socket.server.io = io;
    (globalThis as { __io?: IOServer }).__io = io;
  }

  res.end();
}
