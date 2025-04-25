const Ticket = require("../modals/tickets");

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

const validateTicketExists = async (req, res, next) => {
  try {
    const { ticketId, eventId } = req.params;
    if (!ticketId)
      return res.status(404).json({ message: "Ticket Id is not defined" });

    const ticketData = await Ticket.findByPk(ticketId);

    if (!ticketData) return res.status(404).json({ message: "Invalid Ticket" });

    if (
      new Date() > new Date(ticketData.bookingDate) ||
      new Date() > new Date(ticketData.endDate)
    )
      return res.status(404).json({ message: "Invalid Booking Out of Range" });

    if (ticketData.eventId !== Number(eventId))
      return res
        .status(404)
        .json({ message: "Ticket Does Not Belong To Event" });

    req.ticket = ticketData.dataValues;

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { validateTicket, validateTicketExists };
