const cron = require("node-cron");
const { clearExpiredOtps } = require("../services/authServices");

cron.schedule("*/5 * * * *", async () => {
  try {
    await clearExpiredOtps();
    console.log("OTP Cleanup Successful");
  } catch (error) {
    console.error("OTP Cleanup Failed");
  }
});
