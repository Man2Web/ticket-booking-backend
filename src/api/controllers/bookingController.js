const Booking = require("../modals/bookings");
const {
  getAuthToken,
  initiate,
  status,
} = require("../services/bookingServices");
const { v4: uuidv4 } = require("uuid");

const processBooking = async (req, res) => {
  const { event, ticket, user } = req;
  const transactionId = uuidv4();
  try {
    if (ticket.soldQuantity >= ticket.availableQuantity)
      return req.status(404).json({ message: "Ticket Sold Out Already" });

    await Booking.create({
      userId: user.userId,
      eventId: event.eventId,
      ticketId: ticket.ticketId,
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
      ticket
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
      await Booking.update(
        {
          paymentStatus: "SUCCESS",
        },
        {
          where: {
            transactionId,
          },
        }
      );
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
