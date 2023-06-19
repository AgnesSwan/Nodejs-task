const express = require("express");
const {
  getExercisesByUserId,
  postExercise,
  getUserLogs,
} = require("../controllers/exercise");
const router = express.Router();

router.route("/:id/exercises").get(getExercisesByUserId).post(postExercise);
router.route("/:id/logs").get(getUserLogs);
module.exports = router;
