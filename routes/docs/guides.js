const express = require("express");
const { CreateError, analyticsOn } = require("../utils");
const route = express.Router();

const { Sheets } = require("./../../models");

route.get(
    "/study-guides",

    analyticsOn(
        "Study Guides",

        async (req, res, next) => {
            res.render('docs-old/guides.ejs');
        }
    )
);

module.exports = route;
