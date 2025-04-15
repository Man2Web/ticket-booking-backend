const { where } = require("sequelize");
const Role = require("../modals/roles");
const UserRole = require("../modals/userRoles");
const User = require("../modals/users");

const createUser = async (phone) => {
  try {
    const role = await Role.findOne({
      where: {
        roleName: "USER",
      },
    });

    if (role === null || role === undefined) {
      return null;
    }

    const user = await User.create({
      phone: phone,
    });
    const userRole = await UserRole.create({
      userId: user.dataValues.userId,
      roleId: role.dataValues.roleId,
    });

    await User.update(
      {
        userRoleId: userRole.dataValues.userRoleId,
      },
      {
        where: {
          phone: phone,
        },
      }
    );

    return user.dataValues;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = { createUser };
