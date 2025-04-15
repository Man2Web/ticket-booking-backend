const { Op } = require("sequelize");
const Role = require("../modals/roles");
const User = require("../modals/users");
const EventUserRole = require("../modals/eventUserRoles");

const getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      attributes: ["roleId", "roleName"],
      where: {
        roleName: {
          [Op.notIn]: ["USER", "ADMIN", "SUPER_ADMIN"],
        },
      },
    });

    if (!roles.length)
      return res.status(404).json({ message: "No Roles Found" });

    return res
      .status(200)
      .json({ message: "Fetching Roles Successfull", roles });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const assignRole = async (req, res) => {
  try {
    const { eventId, userPhone, roleId } = req.body;
    if (!eventId || !userPhone || !roleId) {
      return res.status(400).json({
        message: "Required Parameters Missing",
      });
    }

    const userExists = await User.findOne({
      where: {
        phone: String(userPhone),
      },
    });
    if (!userExists)
      return res.status(404).json({ message: "User Does Not Exist" });

    const roleExists = await Role.findByPk(roleId);

    if (!roleExists)
      return res.status(404).json({ message: "Role Does Not Exist" });

    await EventUserRole.create({
      userId: userExists.dataValues.userId,
      roleId,
      eventId,
    });

    const magicLink = `http://${process.env.URL}/event-roles/invitations/accept?eventId=${eventId}&roleId=${roleId}&userId=${userExists.dataValues.userId}`;

    return res
      .status(200)
      .json({ message: "User Role Assigned Successfully", magicLink });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const acceptRole = async (req, res) => {
  try {
    const { eventId, userId, roleId } = req.query;
    if (!eventId || !userId || !roleId)
      return res.status(400).json({ message: "Missing Required Parameters" });

    const existingRole = await EventUserRole.findOne({
      where: { eventId, userId, roleId, accepted: true },
    });

    if (existingRole)
      return res.status(409).json({ message: "User Already Has This Role" });

    await EventUserRole.update(
      { accepted: true },
      {
        where: {
          eventId,
          userId,
          roleId,
        },
      }
    );

    return res.status(200).json({ message: "User Role Updated Successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const removeRole = async (req, res) => {
  try {
    const { eventId, roleId } = req.body;

    if (!eventId || !roleId) {
      return res.status(400).json({
        message: "Required Parameters Missing",
      });
    }

    const roleAssignment = await EventUserRole.findByPk(roleId);

    if (!roleAssignment)
      return res.status(404).json({ message: "Role assignment not found" });

    await roleAssignment.destroy();

    return res.status(200).json({ message: "User Role Deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { assignRole, getRoles, acceptRole, removeRole };
