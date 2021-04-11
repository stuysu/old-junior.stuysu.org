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

            // events.sort((a, b) => a.date - b.date);

            let upcomingEvents = [];
            let importantDates = [];

            const now = Date.now();
            for (let event of events) {

                console.log(event.isHidden + " <-> " + event.isImportant);

                // If difference > 0, event hasn't happened yet
                const difference = event.date - now;
                if (!event.isHidden && difference > 0) {

                    let list = event.isImportant ?
                        importantDates :
                        upcomingEvents;

                    list.push(event);

                }

            }

            console.log(importantDates);

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
