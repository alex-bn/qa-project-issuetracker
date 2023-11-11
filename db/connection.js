const mongoose = require("mongoose");
require("dotenv").config({ path: "../.env" });

module.exports = function () {
  const url = process.env.MONGO_DB;
  try {
    mongoose.connect(url);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
  const dbConnection = mongoose.connection;
  dbConnection.once("open", (_) => {
    console.log("Database is connected");
  });

  dbConnection.on("error", (err) => {
    console.error(`Connection error: ${err}`);
  });
  return;
};
