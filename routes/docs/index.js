const express = require("express");
const { CreateError } = require("../utils");
const route = express.Router();

// Sequlize models
const { Link, sequelize } = require("../../models");

route.get(
    "/",

    async (req, res, next) => {
        try {
            let links = await Link.findAll({ order: sequelize.col('ordering') });
            res.render("docs/links", { links: links });
        } catch (err) {
            next(CreateError(400, err));
        }
    }
);

module.exports = route;


// const express = require("express");
// const { CreateError } = require("../utils");
// const route = express.Router();

// route.get(
//     "/",

//     async (req, res, next) => {
//         res.redirect("/links");
//     }
// );

// module.exports = route;
