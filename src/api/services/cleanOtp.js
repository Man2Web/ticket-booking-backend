const { Op } = require("sequelize");
const Otp = require("../modals/otps");

const clearExpiredOtps = async (req, res) => {
  try {
    await Otp.destroy({
      where: {
        expiresAt: {
          [Op.lt]: new Date(),
        },
      },
    });
    return true;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = clearExpiredOtps;
