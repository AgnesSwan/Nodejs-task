const mongoose = require("mongoose");
const Exercise = require("../models/exercise");
const User = require("../models/user");
var ObjectId = require("mongoose").Types.ObjectId;

//date handling
function isValidDate(dateString) {
  var regEx = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateString.match(regEx)) return false; // Invalid format
}
//userId format handling
function isValidObjectId(id) {
  if (ObjectId.isValid(id)) {
    if (String(new ObjectId(id)) === id) return true;
    return false;
  }
  return false;
}

exports.postExercise = (req, res) => {
  const date = req.body.date ? new Date(req.body.date) : new Date();
  const newExercise = new Exercise({
    _id: new mongoose.Types.ObjectId(),
    userId: req.body._id,
    description: req.body.description,
    duration: req.body.duration,
    date: date,
  });

  if (!isValidObjectId(req.body._id)) {
    res.status(404);
    res.send("Invalid format of userId. UserId not found");
  }

  User.findOne({ userId: req.body._id }).then((user) => {
    if (!user) {
      res.status(404);
      res.send("UserId not found");
    }
  });

  if (!isValidDate(req.body.date)) {
    res.status(400);
    res.send("Invalid date format");
  }

  newExercise
    .save()
    .then((data) => {
      if (!data) {
        return res.status(400).json({
          message: "Fill all required fields",
        });
      }
      return res.status(201).json({
        message: "Success",
        data: data,
      });
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        res.status(422);
        if (err.errors["duration"].kind === "Number") {
          res.send("Invalid format of duration");
        } else {
          res.send("Fill required fields " + err);
        }
      }
      return res.status(400).json({
        message: "Something goes wrong: " + err,
      });
    });
};

exports.getExercisesByUserId = (req, res) => {
  const { id } = req.params;
  Exercise.findOne({ userId: id }, (err, data) => {
    if (!data) {
      res.send("No exercises");
    } else {
      res.status(201);
      res.json({ message: "success", data });
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
  if (!from || !isValidDate(from)) from = null;
  if (!to || !isValidDate(to)) to = null;

  User.findById(id, (err, data) => {
    if (!data) {
      res.status(404);
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
