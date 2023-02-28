const express = require("express");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

const port = process.env.PORT || 5000;

nextApp
  .prepare()
  .then(() => {
    const app = express();
    const server = require("http").createServer(app);
    const io = require("socket.io")(server, {
      cors: {
        origin: "*",
      },
    });

    app.all("*", (req, res) => {
      return nextHandler(req, res);
    });

    server.listen(port, (err) => {
      if (err) throw err;
      console.log("> Ready on http://localhost:" + port);
    });

    io.sockets.on("connection", (socket) => {
      console.log(`new connection: ${socket.id}`);
      socket.on("is_scribbler", (data) => {
        socket.join("scribbling");
        console.log("scribbling");
      });
      socket.on("is_guesser", (data) => {
        socket.join("guessing");
        console.log("guessing");
      });
      socket.on("guess", (data) => {
        console.log(data);
        socket.to("scribbling").emit("have_guessed", data);
      });
      socket.on("prediction_done", (data) => {
        console.log("server received prediction done");
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
      socket.on("sketch_score", (data) => {
        console.log("sketch score received" + data);
        socket.to("guessing").emit("score_received", data);
      });
    });
  })
  .catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
  });
