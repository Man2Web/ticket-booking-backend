const Booking = require("../modals/bookings");
const Tickets = require("../modals/tickets");
const {
  getAuthToken,
  initiate,
  status,
} = require("../services/bookingServices");
const { v4: uuidv4 } = require("uuid");

const processBooking = async (req, res) => {
  const { event, eventTicket, user } = req;
  const transactionId = uuidv4();
  try {
    if (eventTicket.soldQuantity >= eventTicket.availableQuantity)
      return req.status(404).json({ message: "Ticket Sold Out Already" });

    await Booking.create({
      userId: user.userId,
      eventId: event.eventId,
      ticketId: eventTicket.eventTicketId,
      transactionId: transactionId,
      quantity: 10, // need to update later
      totalAmount: 100, // need to update later
      paymentStatus: "PENDING",
    });

    const amount = Number((1 * 100).toFixed(2));
    const authToken = await getAuthToken();

    const data = await initiate(
      authToken,
      transactionId,
      amount,
      event,
      eventTicket
    );

    return res.status(200).json({
      message: "Booking Successfull",
      data: { ...data },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

const validateBooking = async (req, res) => {
  const { transactionId } = req.params;

  if (!transactionId)
    return res.status(400).json({ message: "Transaction Id missing" });

  try {
    const data = await status(transactionId);
    const { state } = data;
    if (data && state === "COMPLETED") {
      const [query, bookingData] = await Booking.update(
        {
          paymentStatus: "SUCCESS",
        },
        {
          where: {
            transactionId,
          },
          returning: true,
        }
      );
      const { bookingId, eventId, eventTicketId, quantity, userId } =
        bookingData[0];
      const alreadyTickets = await Tickets.findAll({
        where: {
          bookingId,
          userId,
        },
      });

      if (!alreadyTickets || alreadyTickets.length === 0) {
        for (let i = 0; i < quantity; i++) {
          const code = uuidv4();
          await Tickets.create({
            bookingId,
            userId,
            ticketCode: code,
            ticketStatus: "VALID",
          });
        }
      }
      return res.status(200).json({ message: "Payment Successful" });
    } else if (data && state === "FAILED") {
      await Booking.update(
        {
          paymentStatus: "FAILED",
        },
        {
          where: {
            transactionId,
          },
        }
      );
      return res.status(404).json({ message: "Payment Failed" });
    } else if (data && state === "PENDING") {
      await Booking.update(
        {
          paymentStatus: "PENDING",
        },
        {
          where: {
            transactionId,
          },
        }
      );
      return res.status(404).json({ message: "Payment Pending" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { processBooking, validateBooking };
