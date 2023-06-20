const mongoose = require("mongoose");
const User = require("../models/user");

exports.postUser = (req, res) => {
  const newUser = new User({
    _id: new mongoose.Types.ObjectId(),
    username: req.body.username,
  });
  newUser
    .save()
    .then((data) => {
      return res.status(201).json({
        message: "Success",
        data: data,
      });
    })
    .catch((err) => {
      if (err.name === "MongoServerError" && err.code === 11000) {
        return res.status(422).json({
          message: "Username already exists",
        });
      }
      return res.status(422).json({
        message: "Username is required",
      });
    });
};
exports.getUsers = (req, res) => {
  User.find({}, (err, data) => {
    if (err) {
      res.status(400);
      res.send(err);
    }
    if (!data) {
      res.status(404);
      res.send("No users");
    } else {
      res.status(200);
      res.json(data);
    }
  });
};
