const express = require("express");
const router = express.Router();
const multer = require("multer");
const multerS3 = require("multer-s3");
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
const { S3Client } = require("@aws-sdk/client-s3");
const { generateS3Key } = require("../services/eventServices");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");

const s3 = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_USER_ACCESS_ID,
    secretAccessKey: process.env.S3_USER_SECRET_ACCESS_KEY,
  },
});

const uniqueKey = uuidv4();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    shouldTransform: true,
    transforms: [
      {
        id: "original",
        key: function (req, file, cb) {
          const fileType =
            file.fieldname === "mainImage"
              ? "main"
              : file.fieldname === "bannerImage"
              ? "banner"
              : "gallery";
          const s3Key = generateS3Key(
            req.user.userId,
            uniqueKey,
            fileType,
            file.originalname
          );
          cb(null, s3Key);
        },
        transform: function (req, file, cb) {
          const transformer = sharp()
            .toFormat("webp") // Explicitly set output format
            .withMetadata(); // Preserve image metadata

          if (file.fieldname === "bannerImage") {
            transformer
              .resize(1920, 1080, { fit: "cover" })
              .webp({ quality: 80 });
          } else if (file.fieldname === "mainImage") {
            transformer
              .resize(800, 600, { fit: "cover" })
              .webp({ quality: 85 });
          } else {
            transformer
              .resize(600, 400, { fit: "cover" })
              .webp({ quality: 75 });
          }
          cb(null, transformer);
        },
      },
    ],
    contentDisposition: "inline", // Make browser display image instead of downloading
    key: function (req, file, cb) {
      const fileType =
        file.fieldname === "mainImage"
          ? "main"
          : file.fieldname === "bannerImage"
          ? "banner"
          : "gallery";
      const s3Key = generateS3Key(
        req.user.userId,
        uniqueKey,
        fileType,
        file.originalname
      );
      cb(null, s3Key);
    },
  }),
  limits: {
    // fileSize: 5 * 1024 * 1024,
    files: 12,
  },
});

router.route("/:eventId").get(getEvent);

router.route("/:location").get(getEventsByLocation);

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
