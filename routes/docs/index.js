const express = require("express");
const { CreateError, analyticsOn } = require("../utils");
const route = express.Router();

const { Events } = require("./../../models");

const MAX_EVENTS = 5;

route.get(
    "/",

    analyticsOn(
        "Home Page",

        async (req, res, next) => {
            
            let events = await Events.findAll();

            events.sort((a, b) => a.date - b.date);

            let upcomingEvents = [];
            let importantDates = [];

            const now = Date.now();
            for (let event of events) {

                // If difference > 0, event hasn't happened yet
                const difference = event.date - now;
                if (difference > 0) {

                    let list = upcomingEvents.length >= MAX_EVENTS ?
                        importantDates :
                        upcomingEvents;

                    list.push(event);

                }

            }

            res.render('docs/', {

                title: 'Home',
                isHomepage: true,
                page: 'index',

                events: upcomingEvents,
                otherEvents: importantDates

            });

        }
    )
);

module.exports = route;
