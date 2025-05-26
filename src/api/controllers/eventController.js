const { sequelize } = require("../config/db.config");
const { Op } = require("sequelize");
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { generateS3Key, processImage } = require("../services/eventServices");
const Event = require("../modals/events");
const Venue = require("../modals/venues");
const EventTickets = require("../modals/eventTickets");

process.env.UV_THREADPOOL_SIZE = 10;

const s3 = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_USER_ACCESS_ID,
    secretAccessKey: process.env.S3_USER_SECRET_ACCESS_KEY,
  },
});

const addEvent = async (req, res) => {
  const transaction = await sequelize.transaction();
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
      eventParticipants,
      eventGuide,
      prohibitedItems,
    } = req.body;

    const {
      name: venueName,
      address,
      city,
      state,
      zip,
      country,
    } = JSON.parse(req.body.venueDetails);

    const venueDetails = await Venue.create(
      {
        name: venueName,
        address,
        city,
        state,
        zip,
        country,
      },
      { transaction }
    );

    const event = await Event.create(
      {
        adminId: req.user.userId,
        venueId: venueDetails.dataValues.venueId,
        name,
        description,
        startDate,
        endDate,
        bookingDate,
        isOnline,
        category,
        galleryImages: [],
        mainImage: "",
        bannerImage: "",
        faq: JSON.parse(Array(faq)),
        termsAndConditions: JSON.parse(Array(termsAndConditions)),
        eventParticipants: JSON.parse(Array(eventParticipants)),
        eventGuide: JSON.parse(Array(eventGuide)),
        prohibitedItems: JSON.parse(Array(prohibitedItems)),
      },
      { transaction }
    );

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

      const s3Key = generateS3Key(
        1,
        event.eventId,
        fileType,
        file.originalname
      );

      const uploadParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: s3Key,
        Body: await processImage(file.buffer, fileType),
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

    await Event.update(
      {
        galleryImages: uploadedImages,
        mainImage,
        bannerImage,
      },
      {
        where: { eventId: event.eventId },
        transaction,
      }
    );
    await transaction.commit();
    return res.status(200).json({ message: "Event Created Successfully" });
  } catch (error) {
    await transaction.rollback();
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
      eventParticipants,
      eventGuide,
      prohibitedItems,
    } = req.body;

    const {
      name: venueName,
      address,
      city,
      state,
      zip,
      country,
    } = JSON.parse(req.body.venueDetails);

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
      const imageTimestamp = `${image.split("/")[3].split("-")[0]}-`;
      const imageNameWithoutTimestamp = image
        .replace(new RegExp(imageTimestamp, "gi"), "")
        .split("/")[3]
        .split(".")[0];
      prevImages.push(imageNameWithoutTimestamp);
    }

    const imagesCount = new Map();
    const newImages = [];

    for (const image of prevImages) {
      imagesCount.set(image, 0);
    }

    for (const file of files) {
      const fileName = file.originalname
        .split(".")[0]
        .toLowerCase()
        .replace(/\s+/g, "-");
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
        const timestamp = `${prevImage.split("/")[3].split("-")[0]}`;
        const imageNameWithoutTimestamp = prevImage
          .replace(new RegExp(timestamp, "gi"), "")
          .split("/")[3]
          .split(".")[0]
          .replace(/^[-]+/, "");
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

      const s3Key = generateS3Key(
        req.user.userId,
        req.eventDetails.eventId,
        fileType,
        file.originalname
      );

      const uploadParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: s3Key,
        Body: await processImage(file.buffer, fileType),
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
    const transaction = await sequelize.transaction();
    try {
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
          transaction,
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
          faq: Array.isArray(faq) ? faq : JSON.parse(faq),
          termsAndConditions: Array.isArray(termsAndConditions)
            ? termsAndConditions
            : JSON.parse(termsAndConditions),
          eventParticipants: Array.isArray(eventParticipants)
            ? eventParticipants
            : JSON.parse(eventParticipants),
          eventGuide: Array.isArray(eventGuide)
            ? eventGuide
            : JSON.parse(eventGuide),
          prohibitedItems: Array.isArray(prohibitedItems)
            ? prohibitedItems
            : JSON.parse(prohibitedItems),
        },
        {
          where: {
            adminId,
            eventId,
          },
          transaction,
        }
      );
      await transaction.commit();
      return res.status(200).json({ message: "Event Updated Successfully" });
    } catch (error) {
      await transaction.rollback();
      return res.status(500).json({ message: error.message });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const getEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const eventData = await Event.findByPk(eventId, {
      include: [
        {
          model: Venue,
          as: "venue",
        },
        {
          model: EventTickets,
          as: "eventTickets",
        },
      ],
    });
    if (!eventData) return res.status(404).json({ message: "Invalid Event" });
    return res.status(200).json({ data: eventData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const getEventsByLocation = async (req, res) => {
  try {
    const { location } = req.params;

    if (!location) {
      return res.status(400).json({
        message: "Location parameter is required",
      });
    }

    const events = await Event.findAll({
      include: [
        {
          model: Venue,
          as: "venue",
          where: {
            [Op.or]: [
              { city: { [Op.iLike]: `%${location}%` } },
              { state: { [Op.iLike]: `%${location}%` } },
              { country: { [Op.iLike]: `%${location}%` } },
            ],
          },
          attributes: ["name", "address", "city", "state", "country", "zip"],
        },
      ],
      where: {
        endDate: {
          [Op.gte]: new Date(),
        },
      },
      attributes: [
        "eventId",
        "name",
        "description",
        "startDate",
        "endDate",
        "bookingDate",
        "category",
        "mainImage",
        "bannerImage",
        "isOnline",
      ],
      order: [["startDate", "ASC"]],
    });

    if (!events.length) {
      return res.status(404).json({
        message: `No events found in location: ${location}`,
      });
    }

    return res.status(200).json({
      data: events,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const getAdminEvents = async (req, res) => {
  try {
    const adminId = req.user.userId;
    if (!adminId) return res.status(404).json({ message: "User Id Required" });

    const eventsData = await Event.findAll({
      where: {
        adminId: adminId,
      },
      attributes: [
        "eventId",
        "name",
        "description",
        "startDate",
        "endDate",
        "bookingDate",
        "category",
        "isOnline",
      ],
      include: [
        {
          model: Venue,
          as: "venue",
          attributes: ["name", "city", "state", "country"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ data: eventsData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addEvent,
  editEvent,
  getEvent,
  getEventsByLocation,
  getAdminEvents,
};
