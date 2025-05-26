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

// const upload = multer({ storage: multer.memoryStorage() });
const upload = multer({
  storage: multer.memoryStorage(), // Use memory storage for simplicity
  limits: { fileSize: 10 * 1024 * 1024 }, // 5MB file size limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

router.route("/:eventId").get(getEvent);

router.route("/all/:location").get(getEventsByLocation);

router.use(validateUserIsAdmin);

router.route("/create").post(
  upload.fields([
    { name: "galleryImages", maxCount: 10 },
    { name: "mainImage", maxCount: 1 },
    { name: "bannerImage", maxCount: 1 },
  ]),
  validateEvent,
  addEvent
);

router.route("/:eventId/edit").post(
  upload.fields([
    { name: "galleryImages", maxCount: 10 },
    { name: "mainImage", maxCount: 1 },
    { name: "bannerImage", maxCount: 1 },
  ]),
  validateEvent,
  isEventOwner,
  editEvent
);

router.route("/admin/all").get(getAdminEvents);

module.exports = router;
