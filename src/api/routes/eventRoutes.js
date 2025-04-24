const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  addEvent,
  editEvent,
  getEvent,
} = require("../controllers/eventController");
const { validateUserIsAdmin } = require("../middlewares/authMiddleware");
const {
  validateEvent,
  isEventOwner,
} = require("../middlewares/eventMiddleware");

const upload = multer({ storage: multer.memoryStorage() });

router.route("/:eventId").get(getEvent);

router.use(validateUserIsAdmin);

router.route("/create").post(
  upload.fields([
    { name: "galleryImages", minCount: 5, maxCount: 10 },
    { name: "mainImage", maxCount: 1 },
    { name: "bannerImage", maxCount: 1 },
  ]),
  validateEvent,
  addEvent
);

router.route("/:eventId/edit").post(
  upload.fields([
    { name: "galleryImages", minCount: 5, maxCount: 10 },
    { name: "mainImage", maxCount: 1 },
    { name: "bannerImage", maxCount: 1 },
  ]),
  validateEvent,
  isEventOwner,
  editEvent
);

module.exports = router;
