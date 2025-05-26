const express = require("express");
const router = express.Router();
const {
  generateOtp,
  validateOtp,
  generateRefreshToken,
  signUpUser,
} = require("../controllers/authController");
const {
  checkIfUserExists,
  validateUser,
} = require("../middlewares/authMiddleware");
const rateLimit = require("express-rate-limit");

const rateLimiter = rateLimit({
  windowMs: 15 * 6 * 1000,
  max: 3,
});

// router.use(rateLimiter);

router.route("/create-user").post(signUpUser, checkIfUserExists, generateOtp);

router.route("/generate-otp").post(checkIfUserExists, generateOtp);

router.route("/validate-otp").post(checkIfUserExists, validateOtp);

router.route("/refresh").post(validateUser, generateRefreshToken);

module.exports = router;
