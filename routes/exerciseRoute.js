const express = require("express");
const {
  postExercise,
  getUserLogs,
} = require("../controllers/exercise");
const router = express.Router();

router.route("/:id/exercises").post(postExercise);
router.route("/:_id/logs").get(getUserLogs);

module.exports = router;
