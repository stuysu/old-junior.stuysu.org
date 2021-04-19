const express = require("express");
const { CreateError, analyticsOn, isMobile } = require("../utils");
const route = express.Router();

route.get(
    "/our-team",

    analyticsOn(
        "Team Page",

        async (req, res, next) => {
            
            res.render('docs/', { 
                title: 'Our Team',
                page: 'our-team',

                isMobile: isMobile(req)
            });

        }
    )
);

module.exports = route;
