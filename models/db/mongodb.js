const mongoose = require("mongoose");
const keys = require("./../../config/keys");
const mongodb = mongoose.connect(
  keys.mongoDB.local.uri,
  {
    useNewUrlParser: true
  }
);

module.exports = {
  mongodb
};
