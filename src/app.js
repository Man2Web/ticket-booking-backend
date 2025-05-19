const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const { sequelize, client } = require("./api/config/db.config");
const middlewares = require("./middlewares");
const api = require("./api");
const authRoutes = require("./api/routes/authRoutes");
const serviceRoutes = require("./api/routes/serviceRoutes");
const eventRoutes = require("./api/routes/eventRoutes");
const eventRolesRoutes = require("./api/routes/eventRolesRoutes");
const ticketRoutes = require("./api/routes/eventTicketRoutes");
const couponRoutes = require("./api/routes/couponRoutes");
const bookingRoutes = require("./api/routes/bookingRoutes");
const adminRoutes = require("./api/routes/adminRoutes");
const userRoutes = require("./api/routes/userRoutes");
// const dbAssociations = require("./api/config/db.associationsConfig");
const initializeDbConfig = require("./api/config/db.initializeConfig");

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(
  cors({
    origin: process.env.URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Access-Control-Allow-Credentials",
    ],
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/events/:eventId/tickets", ticketRoutes);
app.use("/events/:eventId/coupons", couponRoutes);
app.use("/events/:eventId/:ticketId/booking", bookingRoutes);
app.use("/events", eventRoutes);
app.use("/event-staff", eventRolesRoutes);
app.use("/services", serviceRoutes);
app.use("/admins", adminRoutes);
app.use("/user", userRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄",
  });
});

app.use("/api/v1", api);

const initializeDB = async () => {
  try {
    await initializeDbConfig();
    await client.connect();
  } catch (error) {
    console.error("Error to intialize DB:", error);
  }
};

initializeDB();

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
