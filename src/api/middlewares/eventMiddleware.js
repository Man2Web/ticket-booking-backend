const Event = require("../modals/events");

const validateEvent = (req, res, next) => {
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

    // Basic field presence validation
    const requiredFields = {
      name,
      description,
      bookingDate,
      startDate,
      endDate,
      category,
      termsAndConditions,
      isOnline,
      faq,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Missing required fields",
        fields: missingFields,
      });
    }

    // String length validations
    if (name.length < 3 || name.length > 100) {
      return res.status(400).json({
        message: "Event name must be between 3 and 100 characters",
      });
    }

    if (description.length < 10 || description.length > 2000) {
      return res.status(400).json({
        message: "Description must be between 10 and 2000 characters",
      });
    }

    // Date validations
    const now = new Date();
    const bookingDateObj = new Date(bookingDate);
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (
      isNaN(bookingDateObj.getTime()) ||
      isNaN(startDateObj.getTime()) ||
      isNaN(endDateObj.getTime())
    ) {
      return res.status(400).json({
        message:
          "Invalid date format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)",
      });
    }

    if (bookingDateObj < now) {
      return res.status(400).json({
        message: "Booking date cannot be in the past",
      });
    }

    if (startDateObj <= bookingDateObj) {
      return res.status(400).json({
        message: "Start date must be after booking date",
      });
    }

    if (endDateObj <= startDateObj) {
      return res.status(400).json({
        message: "End date must be after start date",
      });
    }

    // FAQ validation
    // if (!Array.isArray(faq) || faq.length === 0) {
    //   return res.status(400).json({
    //     message: "FAQ must be a non-empty array",
    //   });
    // }

    // for (const item of JSON.parse(faq)) {
    //   if (
    //     !item.question ||
    //     !item.answer ||
    //     typeof item.question !== "string" ||
    //     typeof item.answer !== "string"
    //   ) {
    //     return res.status(400).json({
    //       message: "Each FAQ item must have a question and answer as strings",
    //     });
    //   }
    // }

    // Venue validation
    try {
      const {
        name: venueName,
        address,
        city,
        state,
        zip,
        country,
      } = JSON.parse(req.body.venueDetails);

      if (!venueName || !address || !city || !state || !zip || !country) {
        return res.status(400).json({
          message: "All venue details are required",
        });
      }

      // Zip/Postal code validation (basic pattern)
      const zipPattern = /^[0-9]{5,10}$/;
      if (!zipPattern.test(zip)) {
        return res.status(400).json({
          message: "Invalid postal/zip code format",
        });
      }
    } catch (error) {
      return res.status(400).json({
        message: "Invalid venue details format",
      });
    }

    // Image validations
    const { galleryImages, mainImage, bannerImage } = req.files || {};

    if (
      !galleryImages ||
      !Array.isArray(galleryImages) ||
      galleryImages.length === 0
    ) {
      return res.status(400).json({
        message: "At least one gallery image is required",
      });
    }

    if (!mainImage || !bannerImage) {
      return res.status(400).json({
        message: "Main image and banner image are required",
      });
    }

    // Validate image types
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    const validateImage = (image, fieldName) => {
      if (!allowedMimeTypes.includes(image.mimetype)) {
        return res.status(400).json({
          message: `Invalid file type for ${fieldName}. Allowed types: JPG, PNG, WebP`,
        });
      }
      // Add size limit (e.g., 5MB)
      if (image.size > 10 * 1024 * 1024) {
        return res.status(400).json({
          message: `${fieldName} size must be less than 10MB`,
        });
      }
    };

    validateImage(mainImage[0], "Main image");
    validateImage(bannerImage[0], "Banner image");

    for (const image of galleryImages) {
      validateImage(image, "Gallery image");
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error during event validation",
      error: error.message,
    });
  }
};

const isEventOwner = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    if (!eventId)
      return res.status(401).json({ message: "Event ID Is Missing" });
    const eventDetails = await Event.findOne({
      where: {
        eventId,
        adminId: req.user.userId,
      },
      attributes: [
        "eventId",
        "adminId",
        "name",
        "galleryImages",
        "mainImage",
        "bannerImage",
        "venueId",
      ],
    });
    if (!eventDetails)
      return res
        .status(403)
        .json({ message: "Event does not belong to admin" });
    req.eventDetails = eventDetails.dataValues;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const validateEventExists = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    if (!eventId)
      return res.status(404).json({ message: "Event Id is not defined" });

    const eventData = await Event.findByPk(eventId);

    if (!eventData) return res.status(404).json({ message: "Invalid Event" });

    const now = new Date().toISOString();

    if (
      now > new Date(eventData.bookingDate) ||
      now > new Date(eventData.endDate)
    )
      return res.status(404).json({ message: "Invalid Booking Out of Range" });

    req.event = eventData.dataValues;

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { validateEvent, isEventOwner, validateEventExists };
