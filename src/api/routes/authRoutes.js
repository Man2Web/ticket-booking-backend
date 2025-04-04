const express = require("express");
const router = express.Router();
const { generateOtp, validateOtp } = require("../controllers/authController");
const { checkIfUserExists } = require("../middlewares/authMiddleware");
const rateLimit = require("express-rate-limit");

const otpLimiter = rateLimit({
  windowMs: 15 * 6 * 1000,
  max: 3,
});

router.route("/generate-otp").post(otpLimiter, checkIfUserExists, generateOtp);

router.route("/validate-otp").post(checkIfUserExists, validateOtp);

module.exports = router;
