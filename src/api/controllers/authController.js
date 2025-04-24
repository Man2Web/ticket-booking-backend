const Otp = require("../modals/otps");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { sendOtp } = require("../services/authServices");

const generateOtp = async (req, res) => {
  try {
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

    await sendOtp(req.user.phone, otp);

    res.status(200).json({
      message: "OTP Generated",
      otp: otp,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const validateOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res
        .status(400)
        .json({ message: "Phone Number and Otp is Required" });
    }

    const otpData = await Otp.findOne({
      where: {
        userId: req.user.userId,
        otp: String(otp),
        isUsed: false,
      },
    });

    if (!otpData) {
      return res.status(404).json({ message: "Invalid OTP" });
    }

    const otpExpired =
      new Date().getTime() > new Date(otpData.expiresAt).getTime();
    if (otpExpired) {
      return res.status(400).json({ message: "OTP Expired" });
    }

    const jwtSecret = process.env.JWT_SECRET;

    const access_token = jwt.sign(
      {
        userId: req.user.userId,
        userRoleId: req.user.userRoleId,
        phone: req.user.phone,
      },
      jwtSecret,
      { expiresIn: "1h" }
    );

    const refresh_token = jwt.sign({ userId: req.user.userId }, jwtSecret, {
      expiresIn: "30d",
    });

    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    res.cookie("access_token", access_token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 1000,
    });

    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    await otpData.update({ isUsed: true });

    return res.status(200).json({
      success: true,
      message: "User authenticated successfully",
      debug: {
        cookiesSet: {
          access: true,
          refresh: true,
        },
      },
    });
  } catch (error) {
    console.error("Authentication error:", error);
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    return res.status(500).json({ message: error.message });
  }
};

const generateRefreshToken = async (req, res) => {
  try {
    const refresh_token = req.cookies.refresh_token;
    if (!refresh_token)
      return res.status(401).json({ message: "No refresh token provided" });
    const user = jwt.verify(refresh_token, process.env.JWT_SECRET);
    const token = jwt.sign(
      { userId: user.userId, userRoleId: user.userRoleId, phone: user.phone },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000,
      path: "/",
    });
    return res.status(200).json({ message: "Token retrieval success" });
  } catch (error) {
    console.error(error);
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { generateOtp, validateOtp, generateRefreshToken };
