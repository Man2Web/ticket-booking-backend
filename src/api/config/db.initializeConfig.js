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

    const [user] = await User.findOrCreate({
      where: {
        fName: "Oni",
        lName: "Chan",
        email: "javvajiharshavardhan.24@gmail.com",
        phone: "8790877087",
        address: "Ramanapeta 1st line, Koritipadu",
        city: "guntur",
        pincode: "522007",
        state: "andhra pradesh",
        country: "IN",
      },
    });

    // Fetch all required roles in one query
    const roles = await Role.findAll({
      where: {
        roleName: ["SUPER_ADMIN", "ADMIN", "USER"],
      },
    });

    // Create user roles in parallel
    await Promise.all(
      roles.map((role) =>
        UserRole.findOrCreate({
          where: {
            userId: user.userId,
            roleId: role.roleId,
          },
        })
      )
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
