const dbAssociations = require("./db.associationsConfig");
const { sequelize } = require("./db.config");

const initializeDbConfig = async () => {
  try {
    dbAssociations();
    sequelize
      .authenticate()
      .then(() => console.log("Sequelize Connected to DB"))
      .catch((error) =>
        console.error("Error Connecting to Database" + error.message)
      );
    sequelize
      .sync({
        force: true,
        sync: {
          order: ["roles", "users", "user_roles", "venues", "events"],
        },
      })
      .then(() => {
        console.log("Database synced");
      });
  } catch (error) {
    console.error(error);
  }
};

module.exports = initializeDbConfig;
