const http = require("http");
const app = require("./app");
const { Server } = require("socket.io");

const normalizePort = (val) => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};
const port = normalizePort(process.env.PORT || "4000");
app.set("port", port);

const errorHandler = (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }
  const address = server.address();
  const bind =
    typeof address === "string" ? "pipe " + address : "port: " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges.");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use.");
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const server = http.createServer(app);

// Configuration Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Gestion des connexions Socket.IO
io.on("connection", (socket) => {
  console.log("Un client s'est connecté");

  socket.on("disconnect", () => {
    console.log("Un client s'est déconnecté");
  });
});

// Rendre io accessible globalement
app.set("io", io);

server.on("error", errorHandler);
server.on("listening", () => {
  const address = server.address();
  const bind = typeof address === "string" ? "pipe " + address : "port " + port;
  console.log("Listening on " + bind);
});

// En mode standalone (développement local)
if (require.main === module) {
  server.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
  });
}

// Pour Passenger
module.exports = app;
