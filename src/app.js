const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");

require("dotenv").config();

const { sequelize, client } = require("./api/config/db.config");
const middlewares = require("./middlewares");
const api = require("./api");
const authRoutes = require("./api/routes/authRoutes");
const serviceRoutes = require("./api/routes/serviceRoutes");
const eventRoutes = require("./api/routes/eventRoutes");
const dbAssociations = require("./api/config/db.associationsConfig");

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/services", serviceRoutes);
app.use("/event", eventRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄",
  });
});

app.use("/api/v1", api);

sequelize
  .authenticate()
  .then(() => console.log("Sequelize Connected to DB"))
  .catch((error) =>
    console.error("Error Connecting to Database" + error.message)
  );
sequelize.sync({ force: false }).then(() => {
  console.log("Database synced");
});

dbAssociations();

client
  .connect()
  .then(() => console.log("Connected to DB"))
  .catch((error) =>
    console.error("Error Connecting to Database" + error.message)
  );

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
