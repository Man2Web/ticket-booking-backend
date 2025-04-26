const EventTickets = require("../modals/eventTickets");

const createTicket = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { ticketName, price, keyPoints, availableQuantity } = req.body;

    await EventTickets.create({
      eventId,
      ticketName,
      price,
      keyPoints,
      availableQuantity,
    });

    return res.status(200).json({ message: "Ticket Created Successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const updateTicket = async (req, res) => {
  try {
    const { eventId, ticketId } = req.params;
    const { ticketName, price, availableQuantity, keyPoints, isActive } =
      req.body;

    const existingTicket = await EventTickets.findByPk(ticketId);

    if (!existingTicket)
      return res.status(404).json({ message: "Ticket Does Not Exist" });

    await EventTickets.update(
      {
        ticketName,
        price,
        availableQuantity,
        keyPoints: keyPoints || keyPoints.length > 0 ? keyPoints : [],
        isActive: isActive,
      },
      {
        where: {
          eventId,
          eventTicketId,
        },
      }
    );
    return res.status(200).json({ message: "Ticket Updated Successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// Invalid Feature
const deleteTicket = async (req, res) => {
  // Will get back to this feat later on...
  try {
    const { eventId, ticketId } = req.params;
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const getTickets = async (req, res) => {
  try {
    const { eventId } = req.params;
    const ticketsData = await EventTickets.findAll({
      where: {
        eventId,
      },
      order: [["ticketId", "ASC"]],
    });
    return res
      .status(200)
      .json({ message: "Tickets Retrival Successfull", ticketsData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { createTicket, updateTicket, deleteTicket, getTickets };
