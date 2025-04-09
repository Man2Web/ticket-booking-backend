const express = require("express");
const router = express.Router();
const { addEvent } = require("../controllers/eventController");
const { validateUserIsAdmin } = require("../middlewares/authMiddleware");
const { validateEvent } = require("../middlewares/eventMiddleware");

router.use(validateUserIsAdmin);

router.route("/create").post(validateEvent, addEvent);

module.exports = router;
