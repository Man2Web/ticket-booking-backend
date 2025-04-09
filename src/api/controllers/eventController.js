const Event = require("../modals/events");

const addEvent = async (req, res) => {
  try {
    const {
      name,
      description,
      bookingDate,
      startDate,
      endDate,
      category,
      type,
      faq,
      termsAndConditions,
    } = req.body;
    const files = req.files.images;
    const images = files.map((file) => file.name);

    await Event.create({
      adminId: req.user.userId,
      name,
      description,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      bookingDate: new Date(bookingDate).toISOString(),
      type,
      category,
      images,
      faq,
      termsAndConditions,
    });
    return res.status(200).json({ message: "Event Created" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { addEvent };
