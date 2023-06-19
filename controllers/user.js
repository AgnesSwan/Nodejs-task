const mongoose = require("mongoose");
const User = require("../models/user");

exports.postUser = (req, res) => {
  const newUser = new User({
    _id: new mongoose.Types.ObjectId(),
    username: req.body.username,
  });
  newUser.save((err, data) => {
    if (err) console.error("Error in saving the user: \n" + err);
    if (!data) {
      res.send("Username is required");
    } else {
      res.redirect("http://localhost:3000/api/users");
    }
  });
};

exports.getUsers = (req, res) => {
  User.find({}, (err, data) => {
    if (!data) {
      res.send("No users");
    } else {
      res.json(data);
    }
  });
};
