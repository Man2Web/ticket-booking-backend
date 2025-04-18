const { Op } = require("sequelize");
const Otp = require("../modals/otps");
const axios = require("axios");

const sendOtp = async (phone, otp) => {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.PHONE_NUMBER_ID;
  const templateName = process.env.MESSAGE_TEMPLATE_ID;
  const languageCode = "en_US";

  const templateParams = [
    {
      type: "body",
      parameters: [
        {
          type: "text",
          text: otp,
        },
      ],
    },
    {
      type: "button",
      sub_type: "url",
      index: "0",
      parameters: [
        {
          type: "text",
          text: otp,
        },
      ],
    },
  ];

  const data = {
    messaging_product: "whatsapp",
    to: phone,
    type: "template",
    template: {
      name: templateName,
      language: {
        code: languageCode,
      },
      components: templateParams,
    },
  };

  try {
    await axios.post(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(error.message);
  }
};

const clearExpiredOtps = async () => {
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

module.exports = { sendOtp, clearExpiredOtps };
