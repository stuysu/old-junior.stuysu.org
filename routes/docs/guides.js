const express = require("express");
const { CreateError, analyticsOn } = require("../utils");
const route = express.Router();

const { Sheets } = require("./../../models");

route.get(
    "/study-guides",

    analyticsOn(
        async (req, res, next) => {
            // res.render('docs/guides.ejs');
            res.redirect("/");
        }
    )
);

module.exports = route;
