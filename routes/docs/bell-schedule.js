const express = require("express");
const { CreateError, analyticsOn, isMobile } = require("../utils");
const { getDayInfo } = require("../scheduleutils");
const route = express.Router();


route.get(
    "/bell-schedule",

    analyticsOn(
        "Bell Schedule",

        async (req, res, next) => {
            
            let dayInfo = await getDayInfo();

            res.render('docs/', { 
                title: 'Bell Schedule',
                page: 'bell-schedule',

                dayInfo: dayInfo,
                isMobile: isMobile(req)
            });

        }
    )
);

module.exports = route;
