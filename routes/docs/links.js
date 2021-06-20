const express = require("express");
const { CreateError, analyticsOn } = require("../utils");
const route = express.Router();

// Sequlize models
const { Link, sequelize } = require("../../models");

route.get(
    "/links",

    analyticsOn(
        "Links Page",

        async (req, res, next) => {

            try {
                let links = await Link.findAll({ order: sequelize.col('ordering') });
                res.render("links", { links: links });
            } catch (err) {
                next(CreateError(400, err));
            }

        }
    )
);

module.exports = route;
