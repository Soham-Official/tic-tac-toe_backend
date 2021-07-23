require("dotenv").config();
const express = require("express");
const port = process.env.PORT || 5000;
const cors = require("cors");
const mongoose = require("mongoose");
const str = require("@supercharge/strings");
const app = express();
const Room = require("./models/room");
const bodyParser = require("body-parser");
const router = express.Router();
const http = require("http");
app.use(cors());
app.use(bodyParser.json());
// const port1 = process.env.PORT || 8000;
const corsOptions = {
  origin:
    "https://60fa827057c49395415a5769--competent-bhaskara-c2519a.netlify.app/",
  credentials: true,
  optionSuccessStatus: 200,
};
// app.use(cors(corsOptions));
const port1 = http.createServer(app);
const io = require("socket.io")(port1, corsOptions);
router.get("/", (req, res) => {
  res.send("Server is Running");
});
io.on("connection", (socket) => {
  socket.on("join", async (roomId) => {
    console.log("Player Joined", roomId);
    socket.join(roomId);
    await Room.findOne({ roomId: roomId }, (err, user) => {
      if (err || !user) {
        console.log(err);
      } else {
        if (user.noOfPlayers === 2) {
          io.to(roomId).emit("ready");
        }
      }
    });
  });
  socket.on("clicked", ({ i, playerName, id, roomId }) => {
    const click = { i, playerName, id, roomId };
    console.log(i, playerName, id, roomId);
    io.to(roomId).emit("clickRecieved", click);
  });
  socket.on("playAgain", (roomId) => {
    io.to(roomId).emit("playAgainRecieved");
  });
  socket.on("quitgame", (roomId) => {
    io.to(roomId).emit("quitgameRecieved");
  });
  // socket.on('disconnect', () => {
  //   const user = removeUser(socket.id);
  // })
});

app.post("/join", (req, res) => {
  const roomId = req.body.roomId;
  const PlayerName = req.body.PlayerName;
  Room.findOne(
    {
      roomId: roomId,
    },
    (err, user) => {
      if (err || !user) {
        return res.json({ err: "Invalid Room Id." });
      }
      if (user.noOfPlayers < 2) {
        user.noOfPlayers++;
        user.Player2Name = PlayerName;
        user.save();
        res.json(user);
      } else {
        res.json({ err: "Room is Full" });
      }
    }
  ).catch((err) => console.log(err));
});
app.post("/getnames", (req, res) => {
  const roomId = req.body.roomId;
  Room.findOne(
    {
      roomId: roomId,
    },
    (err, user) => {
      if (err || !user) {
        return res.json({ err: "Invalid Room Id." });
      } else {
        const names = {
          Player1Name: user.Player1Name,
          Player2Name: user.Player2Name,
        };
        res.json(names);
      }
    }
  ).catch((err) => console.log(err));
});
app.post("/create", (req, res) => {
  const roomId = str.random(5);
  const PlayerName = req.body.PlayerName;
  const room = new Room({
    roomId: roomId,
    noOfPlayers: 1,
    Player1Name: PlayerName,
  });
  room
    .save()
    .then(() => {
      console.log("New Room Created", roomId);
      res.json(roomId);
    })
    .catch((err) => console.log(err));
});
app.post("/quit", (req, res) => {
  const roomId = req.body.roomId;
  Room.remove({ roomId: roomId }, (err, user) => {
    if (err || !user) {
      return res.json({ err: "Invalid Room Id." });
    } else {
      res.json(user);
    }
  });
  //  Room.findOne(
  //   {
  //     roomId: roomId,
  //   },
  //   (err, user) => {
  //     if (err || !user) {
  //       return res.json({ err: "Invalid Room Id." });
  //     } else {
});

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("Database Connected");
  });
app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
