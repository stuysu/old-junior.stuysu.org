const express = require("express");
const route = express.Router();

const { AUTH_MODE, analyticsOn } = require("../utils.js");

const HAS_ADMIN_ROUTE =
    process.env.ADMIN_ROUTE !== undefined && process.env.ADMIN_ROUTE.length > 0;

const ADMIN_ROUTE = process.env.ADMIN_ROUTE;

route.get(
    HAS_ADMIN_ROUTE ? `/admin/${ADMIN_ROUTE}` : `/admin`,

    analyticsOn(
        "Admin Homepage",

        (req, res, next) => {

            if (AUTH_MODE.shouldAsk())
                res.render("admin/", { client_id: process.env.CLIENT_ID });
            else // if (AUTH_MODE.shouldSkip())
                res.render("admin/no-auth");

        }
    )
);

module.exports = route;
