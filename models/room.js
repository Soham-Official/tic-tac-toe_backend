const mongoose = require("mongoose");
var roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: [true, "Room id must be unique"],
  },
  noOfPlayers: {
    type: Number,
    required: true,
  },
  Player1Name: {
    type: String,
  },
  Player2Name: {
    type: String,
  },
});
const Room = mongoose.model("Room", roomSchema);
module.exports = Room;
