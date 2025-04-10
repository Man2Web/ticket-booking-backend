const { Client } = require("pg");
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    timezone: "+05:30",
    dialectOptions: {
      useUTC: false,
      // ssl: {
      //   require: false,
      //   rejectUnauthorized: false,
      // },
    },
  }
);

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  // ssl: {
  //   require: false,
  //   rejectUnauthorized: false,
  // },
});

module.exports = { client, sequelize };
