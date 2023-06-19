const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const exerciseSchema = new Schema({
  _id: mongoose.Types.ObjectId,
  userId: String,
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  date: String,
});

module.exports = mongoose.model("Exercise", exerciseSchema);
