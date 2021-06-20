const express = require("express");
const route = express.Router();

const { analyticsOn, NO_AUTH } = require("../utils.js");

const HAS_ADMIN_ROUTE =
    process.env.ADMIN_ROUTE !== undefined && process.env.ADMIN_ROUTE.length > 0;

const ADMIN_ROUTE = process.env.ADMIN_ROUTE;

route.get(
    HAS_ADMIN_ROUTE ? `/admin/${ADMIN_ROUTE}` : `/admin`,

    analyticsOn(
        "Admin Homepage",

        (req, res, next) => {

            if (NO_AUTH)
                res.render("admin/no-auth");
            else
                res.render("admin/", { client_id: process.env.CLIENT_ID });

        }
    )
);

module.exports = route;
