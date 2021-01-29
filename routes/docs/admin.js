const express = require("express");
const route = express.Router();

const IS_ADMIN_ROUTE =
    process.env.ADMIN_ROUTE !== undefined && process.env.ADMIN_ROUTE.length > 0;

const ADMIN_ROUTE = process.env.ADMIN_ROUTE;

route.get(
    IS_ADMIN_ROUTE ? `/admin/${ADMIN_ROUTE}` : `/admin`,

    (req, res, next) => {
        res.render("admin/", { client_id: process.env.CLIENT_ID });
    }
);

module.exports = route;
