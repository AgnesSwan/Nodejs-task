const mongoose = require("mongoose");
const Exercise = require("../models/exercise");
const User = require("../models/user");

exports.postExercise = (req, res) => {
  const date = req.body.date ? new Date(req.body.date) : new Date();
  const newExercise = new Exercise({
    _id: new mongoose.Types.ObjectId(),
    userId: req.body._id,
    description: req.body.description,
    duration: req.body.duration,
    date: date,
  });
 
  newExercise.save((err, data) => {
    if (err) {
        res.send("Error in saving the exercise: " + err);
    }
    if (!data) {
      res.send("Exercise was unable to be saved. Fill all required fields (description, duration)");
    } else {
      res.redirect("http://localhost:3000/api/users");
    }
  });
};

exports.getExercisesByUserId = (req, res) => {
  const { id } = req.params;
  Exercise.findOne({ userId: id }, (err, data) => {
    if (!data) {
      res.send("No exercises");
    } else {
      res.json(data);
    }
  });
};

exports.getUserLogs = (req, res) => {
  const id = req.params.id;
  var { from, to, limit } = req.query;
  //limit handling
  if (!limit || Number.isInteger(limit) || limit < 0) {
    limit = null;
  }
  //date handling
  function isValidDate(dateString) {
    var regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regEx)) return false; // Invalid format
  }

  if (!from || !isValidDate(from)) from = null;
  if (!to || !isValidDate(to)) to = null;

  User.findById(id, (err, data) => {
    if (!data) {
      console.log(err);
      res.send("Unknown user id");
    } else {
      const userName = data.username;
      Exercise.find(
        { userId: id },
        { date: { $gte: new Date(from), $lte: new Date(to) } }
      )
        .select(["username", "description", "duration", "date", "userId"])
        .limit(+limit)
        .exec((err, data) => {
          if (!data) {
            res.json({
              _id: id,
              username: userName,
              count: 0,
              log: [],
            });
          } else {
            let exerciseData = [];
            try {
              data.map((exercise) => {
                let dateFormatted = new Date(exercise.date).toDateString();
                return {
                  description: exercise.description,
                  duration: exercise.duration,
                  date: dateFormatted,
                };
              });
              res.json({
                username: userName,
                count: data.length,
                _id: id,
                log: exerciseData,
              });
            } catch (e) {
              console.log(e.message);
            }
          }
        });
    }
  });
};
