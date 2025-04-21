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
    const {
      name: venueName,
      address,
      city,
      state,
      zip,
      country,
    } = JSON.parse(JSON.parse(req.body.venueDetails));
    const galleryImages = req.files.galleryImages;
    const mainImage = req.files.mainImage;
    const bannerImage = req.files.bannerImage;
    if (
      !name ||
      !description ||
      !bookingDate ||
      !startDate ||
      !endDate ||
      !category ||
      !termsAndConditions ||
      !isOnline ||
      !faq ||
      faq.length === 0 ||
      !venueName ||
      !address ||
      !city ||
      !state ||
      !zip ||
      !country
    )
      return res
        .status(403)
        .json({ message: "Required Parameters Are Missing" });

    if (
      !galleryImages ||
      galleryImages.length <= 0 ||
      !mainImage ||
      !bannerImage
    )
      return res.status(401).json({ message: "Event Images are missing" });
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
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
    return res.status(401).json({ message: error.message });
  }
};

module.exports = { validateEvent, isEventOwner };
