const validateTicket = async (req, res, next) => {
  try {
    const { ticketName, price, keyPoints, availableQuantity } = req.body;
    if (!ticketName || !price || !availableQuantity || !keyPoints)
      return res
        .status(403)
        .json({ message: "Required Parameters are missing" });
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { validateTicket };
