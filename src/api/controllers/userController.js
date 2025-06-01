const jwt = require("jsonwebtoken");
const User = require("../modals/users");
const UserRole = require("../modals/userRoles");
const Role = require("../modals/roles");
const Booking = require("../modals/bookings");
const Event = require("../modals/events");
const { Op } = require("sequelize");

const getUserDetails = async (req, res) => {
  try {
    const refresh_token = req.cookies.access_token;
    if (!refresh_token)
      return res.status(401).json({ message: "No auth token provided" });
    const user = jwt.verify(refresh_token, process.env.JWT_SECRET);
    const userWithRoles = await User.findByPk(user.userId, {
      include: [
        {
          model: UserRole,
          as: "userRoles",
          attributes: ["userRoleId"],
          include: [
            {
              model: Role,
              as: "Role",
              attributes: ["roleName"],
            },
          ],
        },
      ],
    });
    const formattedResponse = {
      user: {
        userId: userWithRoles.userId,
        name: userWithRoles.name,
        email: userWithRoles.email,
        phone: userWithRoles.phone,
        createdAt: userWithRoles.createdAt,
      },
      roles: userWithRoles.userRoles.map((role) => ({
        userRoleId: role.userRoleId,
        roleName: role.Role.roleName,
      })),
    };
    return res.status(200).json({ data: formattedResponse });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const updateUserDetails = async (req, res) => {
  const { fName, lName, email, address, city, pincode, state, country } =
    req.body;
  try {
    if (
      !fName ||
      !lName ||
      !email ||
      !address ||
      !city ||
      !pincode ||
      !state ||
      !country
    )
      return res
        .status(404)
        .json({ message: "Required parameters are missing" });

    await User.update(
      {
        fName,
        lName,
        email,
        address,
        city,
        pincode,
        state,
        country,
      },
      {
        where: {
          userId: req.user.userId,
        },
      }
    );
    return res
      .status(200)
      .json({ message: "User details updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const getUserBookings = async (req, res) => {
  const { limit, offset } = req.query;
  if ((!limit, !offset)) {
    return res.status(404).json({ message: "Required Parameters are missing" });
  }
  try {
    const { count, rows: bookingData } = await Booking.findAndCountAll({
      where: {
        userId: req.user.userId,
      },
      limit: Number(limit),
      offset: Number(offset),
      include: [
        {
          model: Event,
          as: "Event",
          attributes: ["name", "startDate", "endDate", "mainImage"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json({ count, data: bookingData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getUserBookings, getUserDetails, updateUserDetails };
