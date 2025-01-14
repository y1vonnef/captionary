const app = require("express")();
const server = require("https").createServer(app);
const io = require("socket.io")(server);
const INDEX = "./pages/index.js";

const port = process.env.PORT || 8000;
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
  //this is undefined
  socket.on("prediction_done", (data) => {
    console.log("server received prediction done" + data.id);
    socket.to("guessing").emit("have_predicted", data);
  });
  socket.on("prediction_failed", () => {
    console.log("server received prediction failed");
    socket.to("guessing").emit("prediction_failed");
  });
  socket.on("submission", (data) => {
    console.log("submission count received" + data);
    socket.to("guessing").emit("submission_received", data);
  });
});
