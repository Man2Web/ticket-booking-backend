const Otp = require("../modals/otps");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

const generateOtp = async (req, res) => {
  const existingOtp = await Otp.findOne({
    where: {
      userId: req.user.userId,
      expiresAt: {
        [Op.gt]: new Date(),
      },
      isUsed: false,
    },
  });
  if (existingOtp) {
    return res.status(200).json({
      message: "Existing OTP Sent",
      otp: existingOtp.otp,
    });
  }

  const expiresAt = new Date().setMinutes(new Date().getMinutes() + 5);
  const otp = otpGenerator.generate(4, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  await Otp.create({
    userId: req.user.userId,
    otp: otp,
    expiresAt: expiresAt,
  });

  res.status(200).json({
    message: "OTP Generated",
    otp: otp,
  });
};

const validateOtp = async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp)
    return res
      .status(400)
      .json({ message: "Phone Number and Otp is Required" });

  const otpData = await Otp.findOne({
    where: {
      userId: req.user.userId,
      otp: String(otp),
      isUsed: false,
    },
  });
  if (!otpData) return res.status(404).json({ message: "Invalid OTP" });

  const otpExpired =
    new Date().getTime() < new Date(otpData.expiresAt).getTime();

  if (!otpExpired) return res.status(400).json({ message: "OTP Expired" });

  const jwtSecret = process.env.JWT_SECRET;

  const token = jwt.sign({ ...req.user.dataValues }, jwtSecret, {
    expiresIn: "24h",
  });

  res.json({
    token,
  });
};

module.exports = { generateOtp, validateOtp };
