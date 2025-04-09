const Role = require("../modals/roles");
const UserRole = require("../modals/userRoles");
const User = require("../modals/users");
const { createUser } = require("../services/userServices");
const jwt = require("jsonwebtoken");

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
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Error finding user:", error);
    res.status(500).json({ error: "Server error" });
  }
}

async function validateUserIsAdmin(req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Access Denied" });
    const user = jwt.decode(token, process.env.JWT_SECRET);
    if (user.exp < Date.now() / 1000) {
      return res.status(401).json({ message: "Token Expired" });
    }
    const isAdmin = await UserRole.findAll({
      where: {
        userId: user.userId,
      },
      include: [
        {
          model: Role,
          where: {
            roleName: "admin",
          },
        },
      ],
    });
    if (isAdmin.length === 0)
      return res.status(401).json({ message: "User is not admin" });
    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Error validating user admin" });
  }
}

module.exports = { checkIfUserExists, validateUserIsAdmin };
