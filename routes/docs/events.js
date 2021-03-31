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
                console.log(events);

                res.render('docs/events.ejs', { events : events });

            } catch (e) {
                next(CreateError(400, err));
            }
        }
    )
);

module.exports = route;
