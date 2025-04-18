const { clearExpiredOtps } = require("../services/authServices");

const cleanOtpHandler = async (req, res) => {
  try {
    await clearExpiredOtps();
    return res.status(200).json({
      message: "OTP Cleanup Successful",
    });
  } catch (error) {
    console.error(error);
    return res.status(200).json({
      message: "Failed OTP Cleanup Successful",
    });
  }
};

module.exports = { cleanOtpHandler };
