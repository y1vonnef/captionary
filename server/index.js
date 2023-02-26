
const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const port = process.env.PORT || 5000;
server.listen(port);

io.sockets.on("connection", (socket) => {
  console.log(`new connection: ${socket.id}`);
  socket.on("is_scribbler", (data) => {
    socket.join("scribbling");
    console.log("scribbling");
    // Sending back the coordinates to the client, notice this way the
    // client sending the coordinates will not receive back what it already sent.
    // socket.broadcast.emit("coordinates", data);
  });
  socket.on("is_guesser", (data) => {
    socket.join("guessing");
    console.log("guessing");
    // Sending back the coordinates to the client, notice this way the
    // client sending the coordinates will not receive back what it already sent.
    // socket.broadcast.emit("coordinates", data);
  });
  socket.on("guess", (data) => {
    console.log(data);
    socket.to("scribbling").emit("have_guessed", data);
  });
});