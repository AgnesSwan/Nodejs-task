const mongoose = require("mongoose");

const format = require("date-fns");
const Exercise = require("../models/exercise");
const User = require("../models/user");

//date handling

exports.postExercise = (req, res) => {
  const date = req.body.date
    ? req.body.date
    : format.format(new Date(), "yyyy-MM-dd");
  const newExercise = new Exercise({
    _id: new mongoose.Types.ObjectId(),
    userId: req.body._id,
    description: req.body.description,
    duration: req.body.duration,
    date: date,
  });

  User.findById({ _id: req.body._id }, (err, data) => {
    if (!data) {
      res.status(404);
      res.send("Unknown user id");
    } else {
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
            if (err.errors["duration"]?.kind === "Number") {
              return res.status(422).json({
                message: "Bad duration format. " + err,
              });
            } else if (err.errors["date"]?.kind === "user defined") {
              return res.status(422).json({
                message: "Bad date format. " + err,
              });
            } else {
              return res.status(422).json({
                message: "Fill all required: " + err,
              });
            }
          }
          return res.status(400).json({
            message: "Something goes wrong: " + err,
          });
        });
    }
  });
};

exports.getUserLogs = async (req, res) => {
  let id = req.params._id;

  let user;

  let { from, to, limit } = req.query;

  if (
    Object.hasOwn(req.query, "from") ||
    Object.hasOwn(req.query, "limit") ||
    Object.hasOwn(req.query, "to") ||
    !Object.keys(req.query).length
  ) {
    console.log("ok");
  } else {
    console.log(req.query);
    res.status(404);
    res.send("unknown query params");
    return;
  }

  function isValidDate(date) {
    var regEx = /^\d{4}-\d{2}-\d{2}$/;
    return date?.match(regEx) != null;
  }
  //limit handling
  if (!limit || Number.isInteger(limit) || limit < 0) {
    limit = null;
  }
  if (!from) from = null;
  if (from && !isValidDate(from)) {
    res.send("invalid from format");
    return;
  }
  if (!to) to = null;
  if (to && !isValidDate(to)) {
    res.send("invalid from format");
    return;
  }

  //finding user
  try {
    user = await User.findById(id);
    if (!user) {
      res?.status(404);
      res?.send("No user found");
      return;
    }
  } catch (e) {
    if (e instanceof mongoose.Error.CastError) {
      res?.status(404);
      res?.send("Invalid format of user id");
      return;
    }
    console.log(e);
  }

  //optional params checking
  let conditions = [{ userId: user._id }];
  if (!!from) {
    conditions.push({ date: { $gte: from } });
  }
  if (!!to) {
    conditions.push({ date: { $lte: to } });
  }
  let final_condition = conditions.length ? { $and: conditions } : {};

  //finding exercise
  Exercise.find(final_condition)
    .limit(+limit)
    .sort({
      date: 1, //sort by date ASC
    })
    .exec((err, data) => {
      try {
        let exerciseData = data?.map((exercise) => {
          let dateFormatted = new Date(exercise.date);
          return {
            description: exercise.description,
            duration: exercise.duration,
            date: dateFormatted,
          };
        });
        res.status(200);
        res.send({
          username: user.username,
          count: data.length,
          _id: user._id,
          log: exerciseData,
        });
      } catch (e) {
        res.status(400);
        res.send("Something goes wrong");
      }
    });
};
