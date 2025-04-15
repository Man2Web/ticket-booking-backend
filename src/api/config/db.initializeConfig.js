const Role = require("../modals/roles");
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
