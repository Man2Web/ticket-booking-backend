const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  addEvent,
  editEvent,
  getEvent,
  getEventsByLocation,
  getAdminEvents,
} = require("../controllers/eventController");
const { validateUserIsAdmin } = require("../middlewares/authMiddleware");
const {
  validateEvent,
  isEventOwner,
} = require("../middlewares/eventMiddleware");

const upload = multer({ storage: multer.memoryStorage() });

router.route("/:eventId").get(getEvent);

router.route("/all/:location").get(getEventsByLocation);

router.use(validateUserIsAdmin);

router.route("/create").post(
  upload.fields([
    { name: "galleryImages", minCount: 5, maxCount: 10 },
    { name: "mainImage", minCount: 1, maxCount: 1 },
    { name: "bannerImage", minCount: 1, maxCount: 1 },
  ]),
  validateEvent,
  addEvent
);

router.route("/:eventId/edit").post(
  upload.fields([
    { name: "galleryImages", minCount: 5, maxCount: 10 },
    { name: "mainImage", minCount: 1, maxCount: 1 },
    { name: "bannerImage", minCount: 1, maxCount: 1 },
  ]),
  validateEvent,
  isEventOwner,
  editEvent
);

router.route("/").get(getAdminEvents);

module.exports = router;
