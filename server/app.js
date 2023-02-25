const express = require("express");
const socket = require("socket.io");
const cors = require('cors');

const app = express();
app.use(cors());
app.options('*', cors());  
app.use(express.static("./public"));

app.all('*', function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
 }); 

const port = 5000;

// spinning server and socket
const server = app.listen(port);
const io = socket(server);
io.sockets.on("connection", (socket) => {
  console.log(`new connection: ${socket.id}`);
  socket.on("coordinates", (data) => {
    console.log(data);
    // Sending back the coordinates to the client, notice this way the
    // client sending the coordinates will not receive back what it already sent.
    // socket.broadcast.emit("coordinates", data);
  });
});