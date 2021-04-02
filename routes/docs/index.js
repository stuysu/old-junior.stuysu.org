const express = require("express");
const { CreateError, analyticsOn } = require("../utils");
const route = express.Router();

route.get(
    "/",

    analyticsOn(
        "Home Page",

        async (req, res, next) => {
            
            res.render('docs/', { 
                title: 'Home',
                isHomepage: true
            });

        }
    )
);

module.exports = route;
