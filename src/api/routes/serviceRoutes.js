const express = require("express");
const { cleanOtpHandler } = require("../controllers/servicesController");
const router = express();
require("../crons/otpCleanup");

router.route("/clean-otp").get(cleanOtpHandler);

module.exports = router;
