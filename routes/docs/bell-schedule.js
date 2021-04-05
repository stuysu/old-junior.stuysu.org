const express = require("express");
const { CreateError, analyticsOn, isMobile } = require("../utils");
const route = express.Router();

route.get(
    "/bell-schedule",

    analyticsOn(
        "Bell Schedule",

        async (req, res, next) => {
            
            res.render('docs/', { 
                title: 'Bell Schedule',
                page: 'bell-schedule',

                isMobile: isMobile(req)
            });

        }
    )
);

module.exports = route;
