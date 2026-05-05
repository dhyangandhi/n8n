const { Server } = require("socket.io");

if (!global.io) {
  global.io = null;
}

const initSocket = (server) => {
  global.io = new Server(server, {
    cors: { origin: "*" },
  });

  global.io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
  });
};

const getIO = () => {
  if (!global.io) {
    throw new Error("Socket not initialized");
  }
  return global.io;
};

module.exports = { initSocket, getIO };