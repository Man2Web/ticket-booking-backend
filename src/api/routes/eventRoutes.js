const express = require("express");
const router = express.Router();
const multer = require("multer");
const { addEvent, editEvent } = require("../controllers/eventController");
const { validateUserIsAdmin } = require("../middlewares/authMiddleware");
const {
  validateEvent,
  isEventOwner,
} = require("../middlewares/eventMiddleware");

const upload = multer({ storage: multer.memoryStorage() });

router.use(validateUserIsAdmin);

router.route("/create").post(upload.array("images"), validateEvent, addEvent);

router
  .route("/edit")
  .post(upload.array("images"), validateEvent, isEventOwner, editEvent);

module.exports = router;
