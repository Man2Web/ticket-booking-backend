const express = require("express");
const router = express();

const { validateUser } = require("../middlewares/authMiddleware");
const {
  getUserBookings,
  getUserDetails,
} = require("../controllers/userController");

router.use(validateUser);

router.route("/me").get(getUserDetails);

router.route("/bookings").get(getUserBookings);

// router.route("/users").get(getAllUsers);

// router.route("/:userId").get(getAdmin);

// router.route("/add/:userId").post(addAdmin);

// router.route("/remove/:userId").put(removeAdmin);

module.exports = router;
