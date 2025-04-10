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
    const images = req.files;
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
        .status(401)
        .json({ message: "Required Parameters Are Missing" });

    if (!images || images.length <= 0)
      return res.status(401).json({ message: "Event Images are missing" });
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const isEventOwner = async (req, res, next) => {
  try {
    const eventId = req.body.eventId;
    if (!eventId)
      return res.status(401).json({ message: "Event Parameter is missing" });
    const eventDetails = await Event.findOne({
      where: {
        eventId,
        adminId: req.user.userId,
      },
      attributes: ["eventId", "adminId", "name", "images"],
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
