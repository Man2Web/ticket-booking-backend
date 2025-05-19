const express = require("express");
const router = express();

const { validateUser } = require("../middlewares/authMiddleware");
const {
  getUserBookings,
  getUserDetails,
  updateUserDetails,
} = require("../controllers/userController");

router.use(validateUser);

router.route("/me").get(getUserDetails);

router.route("/bookings").get(getUserBookings);

router.route("/me/update").post(updateUserDetails);

module.exports = router;
