const express = require("express");
const { getUsers, postUser } = require("../controllers/user");
const router = express.Router();

router.route("/").get(getUsers).post(postUser);

module.exports = router;
