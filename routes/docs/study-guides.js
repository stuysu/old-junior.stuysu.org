const express = require("express");
const { CreateError, analyticsOn, isMobile } = require("../utils");
const route = express.Router();

route.get(
    "/study-guides",

    analyticsOn(
        "Study Guides",

        async (req, res, next) => {
            
            res.render('docs/', {
                title: 'Study Guides',
                page: 'study-guides',

                isMobile: isMobile(req)
            });
       
        }

    )
);

module.exports = route;
