"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/config.js")[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
    sequelize = new Sequelize(config.url, config);
}

if (process.platform === "win32") {
    var split = sequelize.options.storage.match(
        /(?<driveprefix>[A-Z]:\\):[A-Z]\\(?<filepath>.+)/
    );
    sequelize.options.storage = split[1] + split[2];
    sequelize.connectionManager.config.database = split[1] + split[2];
}

// must end with .model.js
function isModel(file) {
    return (
        file.indexOf(".") !== 0 &&
        file !== basename &&
        file.slice(-9) === ".model.js"
    );
}

fs.readdirSync(__dirname)
    .filter(isModel)
    .forEach((file) => {
        const mod = require(path.join(__dirname, file));
        const model = mod(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
    });

Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
