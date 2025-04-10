const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const Event = require("../modals/events");
const sharp = require("sharp");
const { sequelize } = require("../config/db.config");
const Venue = require("../modals/venues");

const addEvent = async (req, res) => {
  try {
    const {
      name,
      description,
      bookingDate,
      startDate,
      endDate,
      category,
      isOnline,
      faq,
      termsAndConditions,
    } = req.body;

    const {
      name: venueName,
      address,
      city,
      state,
      zip,
      country,
    } = JSON.parse(JSON.parse(req.body.venueDetails));

    const files = req.files;

    const s3 = new S3Client({
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.S3_USER_ACCESS_ID,
        secretAccessKey: process.env.S3_USER_SECRET_ACCESS_KEY,
      },
    });

    const uploadedImages = [];
    for (const file of files) {
      const uniqueFileName = `${Date.now()}-${
        file.originalname.split(".")[0]
      }.webp`;
      const uploadParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: uniqueFileName,
        Body: await sharp(file.buffer).webp({ quality: 80 }).toBuffer(),
        ContentType: "image/webp",
      };

      await s3.send(new PutObjectCommand(uploadParams));
      uploadedImages.push(uniqueFileName);
    }

    sequelize
      .transaction(async () => {
        const venueDetails = await Venue.create({
          name: venueName,
          address,
          city,
          state,
          zip,
          country,
        });

        await Event.create({
          adminId: req.user.userId,
          venueId: venueDetails.dataValues.venueId,
          name,
          description,
          startDate,
          endDate,
          bookingDate,
          isOnline,
          category,
          images: uploadedImages,
          faq: JSON.parse(JSON.parse(faq)),
          termsAndConditions: Array(termsAndConditions),
        });
      })
      .catch((error) => {
        console.error(error);
        return res.status(400).json({ message: error.message });
      });

    return res.status(200).json({ message: "Event Created" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const editEvent = async (req, res) => {
  try {
    const {
      name,
      description,
      bookingDate,
      startDate,
      endDate,
      category,
      isOnline,
      faq,
      termsAndConditions,
    } = req.body;

    const {
      name: venueName,
      address,
      city,
      state,
      zip,
      country,
    } = JSON.parse(JSON.parse(req.body.venueDetails));

    const files = req.files;

    const s3 = new S3Client({
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.S3_USER_ACCESS_ID,
        secretAccessKey: process.env.S3_USER_SECRET_ACCESS_KEY,
      },
    });

    const uploadedImages = [];
    for (const file of files) {
      const uniqueFileName = `${Date.now()}-${
        file.originalname.split(".")[0]
      }.webp`;
      const uploadParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: uniqueFileName,
        Body: await sharp(file.buffer).webp({ quality: 80 }).toBuffer(),
        ContentType: "image/webp",
      };

      await s3.send(new PutObjectCommand(uploadParams));
      uploadedImages.push(uniqueFileName);
    }

    sequelize
      .transaction(async () => {
        const venueDetails = await Venue.create({
          name: venueName,
          address,
          city,
          state,
          zip,
          country,
        });

        await Event.create({
          adminId: req.user.userId,
          venueId: venueDetails.dataValues.venueId,
          name,
          description,
          startDate,
          endDate,
          bookingDate,
          isOnline,
          category,
          images: uploadedImages,
          faq: JSON.parse(JSON.parse(faq)),
          termsAndConditions: Array(termsAndConditions),
        });
      })
      .catch((error) => {
        console.error(error);
        return res.status(400).json({ message: error.message });
      });

    return res.status(200).json({ message: "Event Created" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { addEvent, editEvent };
