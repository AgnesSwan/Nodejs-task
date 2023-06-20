const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const exerciseSchema = new Schema({
  _id: mongoose.Types.ObjectId,
  userId: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  date: {
    type: String,
    validate: function(date) {
      var regEx = /^\d{4}-\d{2}-\d{2}$/;
      return date.match(regEx) != null;
  },
  message: 'bad date format',
  },
});

module.exports = mongoose.model("Exercise", exerciseSchema);
