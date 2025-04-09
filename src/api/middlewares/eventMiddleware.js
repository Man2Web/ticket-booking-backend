const validateEvent = (req, res, next) => {
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
    const images = req.files;
    if (
      !name ||
      !description ||
      !bookingDate ||
      !startDate ||
      !endDate ||
      !category ||
      !termsAndConditions ||
      !type ||
      !faq
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

module.exports = { validateEvent };
