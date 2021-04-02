const express = require("express");
const { CreateError, analyticsOn } = require("../utils");
const route = express.Router();

const { Events } = require("./../../models");

route.get(
    "/events",

    analyticsOn(
        "Events",

        async (req, res, next) => {
            try {
                let events = await Events.findAll();

                res.render('docs-old/events.ejs', { events : events });

            } catch (e) {
                next(CreateError(400, err));
            }
        }
    )
);

route.get(
    "/events/:eventTitle",

    analyticsOn(
        "Events",

        async (req, res, next) => {
            console.log(`query parameters: ${req.params.eventTitle}`);

            try {
                let events = await Events.findAll({where: { title: req.params.eventTitle }});

                res.render('docs-old/one-event.ejs', { event : events[0] });

            } catch (e) {
                next(CreateError(400, err));
            }
        }
    )
)

module.exports = route;
