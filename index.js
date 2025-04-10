const serverless = require("serverless-http");
// const createApp = require("./src/app");

// let cachedApp;

// module.exports.handler = async (event, context) => {
//   if (!cachedApp) {
//     const app = await createApp();
//     cachedApp = serverless(app);
//   }
//   return cachedApp(event, context);
// };
const app = require("./src/app");
serverless.exports = app;
