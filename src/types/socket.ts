import type { NextApiResponse } from "next";
import type { Server as HTTPServer } from "http";
import type { Socket as NetSocket } from "net";
import type { Server as IOServer } from "socket.io";

type SocketServerWithIO = HTTPServer & {
  io?: IOServer;
};

type SocketWithServer = NetSocket & {
  server: SocketServerWithIO;
};

export type NextApiResponseServerIO = NextApiResponse & {
  socket: SocketWithServer;
};
