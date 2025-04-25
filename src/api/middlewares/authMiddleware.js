const Role = require("../modals/roles");
const UserRole = require("../modals/userRoles");
const User = require("../modals/users");
const jwt = require("jsonwebtoken");

async function checkIfUserExists(req, res, next) {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    const phoneString = String(phone);

    const user = await User.findOrCreate({
      where: { phone: phoneString },
    });

    const role = await Role.findOne({
      where: { roleName: "USER" },
    });

    await UserRole.findOrCreate({
      where: {
        userId: user[0].dataValues.userId,
        roleId: role.dataValues.roleId,
      },
    });

    req.user = user[0].dataValues;

    next();
  } catch (error) {
    console.error("Error finding user:", error);
    res.status(500).json({ error: "Server error" });
  }
}

async function validateUserIsAdmin(req, res, next) {
  try {
    const token = req.cookies?.access_token;
    if (!token) return res.status(401).json({ message: "Access Denied" });
    const user = jwt.decode(token, process.env.JWT_SECRET);
    if (user.exp < Date.now() / 1000) {
      return res.status(401).json({ message: "Token Expired" });
    }
    const isAdmin = await UserRole.findOne({
      where: {
        userId: user.userId,
      },
      include: [
        {
          model: Role,
          where: {
            roleName: "ADMIN",
          },
        },
        {
          model: User,
        },
      ],
    });
    if (
      !isAdmin ||
      !isAdmin.dataValues ||
      !isAdmin.dataValues.User ||
      !isAdmin.dataValues.Role
    )
      return res.status(401).json({ message: "User is not admin" });
    req.user = isAdmin.dataValues.User.dataValues;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Error validating user admin" });
  }
}

async function validateUser(req, res, next) {
  try {
    const access_token = req.cookies?.access_token;

    if (!access_token) {
      return res.status(401).json({
        success: false,
        message: "Access token not found",
      });
    }
    const user = jwt.verify(access_token, process.env.JWT_SECRET);

    const userData = await User.findByPk(user.userId);

    if (!userData)
      return res.status(401).json({ message: "Invalid User Booking Request" });

    req.user = userData.dataValues;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
}

module.exports = { checkIfUserExists, validateUserIsAdmin, validateUser };
