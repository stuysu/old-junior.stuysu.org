const express = require("express");
const { CreateError, analyticsOn, isMobile, addModule }  = require("../utils");
const route = express.Router();

const { Events, sequelize } = require("./../../models");

const datefuncs = require("../datefuncs");

const MAX_EVENTS = 5;

route.get(
    "/",

    analyticsOn(
        "Home Page",

        async (req, res, next) => {
            
            let events = await Events.findAll({ order: sequelize.col('date') });

            let upcomingEvents = [];
            let importantDates = [];

            let now = new Date(Date.now());
            // now.setHours(now.getHours() - 4);
            // now = now.getTime();

            for (let event of events) {

                // If difference > 0, event hasn't happened yet
                const difference = event.date - now;
                if (!event.isHidden && difference > 0) {

                    let list = event.isImportant ?
                        importantDates :
                        upcomingEvents;

                    list.push(event);

                }

            }

            res.render('docs/', addModule({

                title: 'Home',
                isHomepage: true,
                page: 'index',

                events: upcomingEvents,
                otherEvents: importantDates,

                isMobile: isMobile(req)

            }, datefuncs));

        }
    )
);

module.exports = route;
