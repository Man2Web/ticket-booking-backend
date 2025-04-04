const Role = require("../modals/roles");
const User = require("../modals/users");
const { createUser } = require("../services/userServices");

async function checkIfUserExists(req, res, next) {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    const phoneString = String(phone);

    let user = await User.findOne({
      where: { phone: phoneString },
    });

    if (!user) {
      user = await createUser(phone);
      console.log(user);
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Error finding user:", error);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = { checkIfUserExists };
