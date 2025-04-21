const sharp = require("sharp");
const { sequelize } = require("../config/db.config");
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const Event = require("../modals/events");
const Venue = require("../modals/venues");
const { generateS3Key } = require("../services/eventServices");

const s3 = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_USER_ACCESS_ID,
    secretAccessKey: process.env.S3_USER_SECRET_ACCESS_KEY,
  },
});

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

    const files = [
      ...req.files.galleryImages,
      ...req.files.mainImage,
      ...req.files.bannerImage,
    ];

    const s3 = new S3Client({
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.S3_USER_ACCESS_ID,
        secretAccessKey: process.env.S3_USER_SECRET_ACCESS_KEY,
      },
    });

    const imageUploadPromises = files.map(async (file) => {
      const fileType =
        file.fieldname === "mainImage"
          ? "main"
          : file.fieldname === "bannerImage"
          ? "banner"
          : "gallery";

      const s3Key = generateS3Key(req.user.userId, fileType, file.originalname);

      const uploadParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: s3Key,
        Body: await sharp(file.buffer).webp({ quality: 80 }).toBuffer(),
        ContentType: "image/webp",
      };

      await s3.send(new PutObjectCommand(uploadParams));
      return { type: file.fieldname, key: s3Key };
    });

    const uploadResult = await Promise.all(imageUploadPromises);

    const uploadedImages = [];
    let mainImage = "";
    let bannerImage = "";

    uploadResult.forEach(({ type, key }) => {
      if (type === "mainImage") {
        mainImage = key;
      } else if (type === "bannerImage") bannerImage = key;
      else {
        uploadedImages.push(key);
      }
    });

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
          galleryImages: uploadedImages,
          mainImage: mainImage,
          bannerImage: bannerImage,
          faq: JSON.parse(JSON.parse(faq)),
          termsAndConditions: Array(termsAndConditions),
        });
      })
      .catch((error) => {
        console.error(error);
        return res.status(400).json({ message: error.message });
      });

    return res.status(200).json({ message: "Event Created Successfully" });
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

    const { adminId, eventId, galleryImages, bannerImage, mainImage, venueId } =
      req.eventDetails;

    const prevFiles = [...galleryImages, bannerImage, mainImage];

    const files = [
      ...req.files.galleryImages,
      ...req.files.mainImage,
      ...req.files.bannerImage,
    ];

    const prevImages = [];
    for (const image of prevFiles) {
      const imageTimestamp = `${image.split("/")[2].split("-")[0]}-`;
      const imageNameWithoutTimestamp = image
        .replace(new RegExp(imageTimestamp, "gi"), "")
        .split("/")[2]
        .split(".")[0];
      prevImages.push(imageNameWithoutTimestamp);
    }

    const imagesCount = new Map();
    const newImages = [];

    for (const image of prevImages) {
      imagesCount.set(image, 0);
    }

    for (const file of files) {
      const fileName = file.originalname.split(".")[0].toLowerCase();
      const count = imagesCount.get(fileName);
      if (count === undefined || count === null) newImages.push(fileName);
      if (count !== undefined) imagesCount.set(fileName, count + 1);
    }

    const deletedImages = [];
    const uploadedImages = [];
    let mainImageFileName = "";
    let bannerImageFileName = "";

    for (const [image, count] of imagesCount) {
      for (const prevImage of prevFiles) {
        const timestamp = `${prevImage.split("/")[2].split("-")[0]}-`;
        const imageNameWithoutTimestamp = prevImage
          .replace(new RegExp(timestamp, "gi"), "")
          .split("/")[2]
          .split(".")[0];
        if (image === imageNameWithoutTimestamp) {
          if (count === 0) {
            deletedImages.push(prevImage);
          } else {
            uploadedImages.push(prevImage);
          }
        }
      }
    }

    for (const image of deletedImages) {
      const uploadParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: image,
      };
      await s3.send(new DeleteObjectCommand(uploadParams));
    }

    const imageUploadPromises = files.map(async (file) => {
      const fileType =
        file.fieldname === "mainImage"
          ? "main"
          : file.fieldname === "bannerImage"
          ? "banner"
          : "gallery";

      const s3Key = generateS3Key(req.user.userId, fileType, file.originalname);

      const uploadParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: s3Key,
        Body: await sharp(file.buffer).webp({ quality: 80 }).toBuffer(),
        ContentType: "image/webp",
      };

      await s3.send(new PutObjectCommand(uploadParams));
      return { type: file.fieldname, key: s3Key };
    });

    const uploadResult = await Promise.all(imageUploadPromises);

    uploadResult.forEach(({ type, key }) => {
      if (type === "mainImage") {
        mainImageFileName = key;
      } else if (type === "bannerImage") bannerImageFileName = key;
      else {
        uploadedImages.push(key);
      }
    });

    sequelize
      .transaction(async () => {
        await Venue.update(
          {
            name: venueName,
            address,
            city,
            state,
            zip,
            country,
          },
          {
            where: {
              venueId,
            },
          }
        );

        await Event.update(
          {
            name,
            description,
            startDate,
            endDate,
            bookingDate,
            isOnline,
            category,
            galleryImages: uploadedImages,
            mainImage: mainImageFileName,
            bannerImage: bannerImageFileName,
            faq: JSON.parse(JSON.parse(faq)),
            termsAndConditions: Array(termsAndConditions),
          },
          {
            where: {
              adminId,
              eventId,
            },
          }
        );
      })
      .catch((error) => {
        console.error(error);
        return res.status(400).json({ message: error.message });
      });

    return res.status(200).json({ message: "Event Updated Successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const getEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const eventData = await Event.findByPk(eventId);
    if (!eventData) return res.status(404).json({ message: "Invalid Event" });
    return res.status(200).json({ eventData: eventData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { addEvent, editEvent, getEvent };
