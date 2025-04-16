const express = require("express");
const router = express.Router({ mergeParams: true });
const { validateUserIsAdmin } = require("../middlewares/authMiddleware");
const { isEventOwner } = require("../middlewares/eventMiddleware");
const {
  createTicket,
  getTickets,
  updateTicket,
  deleteTicket,
} = require("../controllers/ticketController");
const { validateTicket } = require("../middlewares/ticketMiddleware");

router.route("/").get(getTickets);

router.use(validateUserIsAdmin);

router.route("/").post(isEventOwner, validateTicket, createTicket);

router.route("/:ticketId").put(isEventOwner, updateTicket);

module.exports = router;
