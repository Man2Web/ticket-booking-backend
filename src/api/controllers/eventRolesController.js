const { Op, Model } = require("sequelize");
const Role = require("../modals/roles");
const User = require("../modals/users");
const EventUserRole = require("../modals/eventUserRoles");
const { v4: uuidv4 } = require("uuid");

const getAvailableRoles = async (req, res) => {
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

const getAvailableRolesForEvent = async (req, res) => {
  const { eventId } = req.params;
  try {
    const eventRolesData = await EventUserRole.findAll({
      include: [
        {
          model: User,
        },
        {
          model: Role,
        },
      ],
      where: {
        eventId: eventId,
      },
    });

    if (!eventRolesData.length)
      return res
        .status(404)
        .json({ message: "No Roles Assigned For This Event" });

    return res.status(200).json({ data: eventRolesData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const assignStaff = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userPhone, roleId } = req.body;
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

    const token = uuidv4();

    await EventUserRole.create({
      userId: userExists.dataValues.userId,
      roleId,
      eventId,
      invitationToken: token,
    });
    const magicLink = `${process.env.URL}/event-staff/invitations/${token}`;

    return res
      .status(200)
      .json({ message: "User Role Assigned Successfully", magicLink });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const acceptInvitation = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token)
      return res.status(400).json({ message: "Missing Required Parameters" });

    const existingRole = await EventUserRole.findOne({
      where: { invitationToken: token, accepted: true },
    });

    if (existingRole)
      return res.status(409).json({ message: "User Already Has This Role" });

    await EventUserRole.update(
      { accepted: true },
      {
        where: {
          invitationToken: token,
        },
      }
    );

    return res.status(200).json({ message: "User Role Updated Successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const removeStaff = async (req, res) => {
  try {
    const { eventId, userRoleId } = req.params;

    if (!eventId || !userRoleId) {
      return res.status(400).json({
        message: "Required Parameters Missing",
      });
    }

    const roleAssignment = await EventUserRole.findByPk(userRoleId);

    if (!roleAssignment)
      return res.status(404).json({ message: "Role assignment not found" });

    await roleAssignment.destroy();

    return res.status(200).json({ message: "User Role Deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  assignStaff,
  getAvailableRoles,
  acceptInvitation,
  removeStaff,
  getAvailableRolesForEvent,
};
