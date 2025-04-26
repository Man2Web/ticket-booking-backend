const { Op, where } = require("sequelize");
const Role = require("../modals/roles");
const UserRole = require("../modals/userRoles");
const User = require("../modals/users");

const addAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(404).json({ message: "User Id Not Found" });
    const isUserAdmin = await UserRole.findOne({
      include: [
        {
          model: Role,
          where: {
            role_name: "ADMIN",
          },
          attributes: ["role_name"],
        },
      ],
      where: {
        userId: userId,
      },
    });

    if (isUserAdmin)
      return res.status(404).json({ message: "User Is Already Admin" });

    const roleData = await Role.findOne({
      where: {
        roleName: "ADMIN",
      },
    });

    await UserRole.create({
      userId: userId,
      roleId: roleData.dataValues.roleId,
    });

    return res.status(200).json({ message: "User Updated To Admin Role" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const removeAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(404).json({ message: "User Id Not Found" });
    const isUserAdmin = await UserRole.findOne({
      include: [
        {
          model: Role,
          where: {
            role_name: "ADMIN",
          },
          attributes: ["role_name"],
        },
      ],
      where: {
        userId: userId,
      },
    });

    if (!isUserAdmin)
      return res.status(404).json({ message: "User Not An Admin" });

    const roleData = await Role.findOne({
      where: {
        roleName: "ADMIN",
      },
    });

    await UserRole.destroy({
      where: { userId: userId, roleId: roleData.dataValues.roleId },
    });

    return res.status(200).json({ message: "User Role Admin Removed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const getAllAdmins = async (req, res) => {
  const { limit, offset } = req.query;
  try {
    const { count, rows: admins } = await UserRole.findAndCountAll({
      include: [
        {
          model: Role,
          where: {
            role_name: {
              [Op.in]: ["ADMIN"],
            },
          },
          attributes: ["roleName"],
        },
        {
          model: User,
        },
      ],
      limit: Number(limit),
      offset: Number(offset),
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json({ admins, count });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const getAdmin = async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(404).json({ message: "User Id Not Found" });
  try {
    const adminData = await UserRole.findOne(
      {
        include: [
          {
            model: Role,
            where: {
              role_name: {
                [Op.in]: ["ADMIN"],
              },
            },
          },
          {
            model: User,
          },
        ],
      },
      {
        where: {
          userId: userId,
        },
      }
    );
    if (!adminData)
      return res.status(404).json({ message: "User Is Not Admin" });
    return res.status(200).json({ adminData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { addAdmin, getAllAdmins, getAdmin, removeAdmin };
