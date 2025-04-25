const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  processBooking,
  validateBooking,
} = require("../controllers/bookingController");
const { validateUser } = require("../middlewares/authMiddleware");
const { validateEventExists } = require("../middlewares/eventMiddleware");
const { validateTicketExists } = require("../middlewares/ticketMiddleware");

router.route("/validate/:transactionId").get(validateBooking);

router.use(validateUser);

router
  .route("/")
  .post(validateEventExists, validateTicketExists, processBooking);

module.exports = router;
