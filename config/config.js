const path = require("path");

const SQLITE_PATH = path.resolve(__dirname, "../app.db");
const SQLITE_URL = `sqlite::${SQLITE_PATH}`;
const SEQUELIZE_URL = process.env.DATABASE_URL || SQLITE_URL

const LOGGING = process.env.LOG || false;

module.exports = {
    development: {
        url: SEQUELIZE_URL,
        define: {
            charset: "utf8",
            collate: "utf8_unicode_ci",
        },
        ssl: true,
        native: true,
        logging: LOGGING
    },
    production: {
        url: SEQUELIZE_URL,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        define: {
            charset: "utf8",
            collate: "utf8_unicode_ci",
        },
        native: true,
        ssl: true,
        logging: LOGGING
    },
};
