const Role = require("../modals/roles");
const UserRole = require("../modals/userRoles");
const User = require("../modals/users");
const dbAssociations = require("./db.associationsConfig");
const { sequelize } = require("./db.config");

const initializeDbConfig = async () => {
  try {
    dbAssociations();

    await sequelize.authenticate();
    console.log("✓ Database connection authenticated");

    await sequelize.sync({ alter: true });
    console.log("✓ Database tables dropped and recreated");

    const defaultRoles = [
      { roleName: "SUPER_ADMIN" },
      { roleName: "ADMIN" },
      { roleName: "USER" },
      { roleName: "ORGANIZER" },
      { roleName: "TICKET_SCANNER" },
    ];

    await Promise.all(
      defaultRoles.map((role) => Role.upsert(role, { returning: true }))
    );

    const user = await User.findOrCreate({
      where: {
        phone: "8790877087",
      },
    });

    const role = await Role.findOne({
      where: {
        roleName: "SUPER_ADMIN",
      },
    });

    await UserRole.findOrCreate({
      where: {
        userId: user[0].userId,
        roleId: role.roleId,
      },
    });
  } catch (error) {
    console.error("Database initialization failed:");
    console.error("Error:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

module.exports = initializeDbConfig;
