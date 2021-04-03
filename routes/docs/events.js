const express = require("express");
const { CreateError, analyticsOn, isMobile, addModule } = require("../utils");
const route = express.Router();

const marked = require('marked');

const { Events } = require("./../../models");

const datefuncs = require("../datefuncs.js");

route.get(
    "/events/:id",

    analyticsOn(
        "Events",

        async (req, res, next) => {
            try {

                let events = await Events.findAll({where: { id: req.params.id }});
                if (events.length === 0) {
                    next(CreateError(404, new Error(`Event with id ${req.params.id} does not exist`)));
                }

                let event = events[0];

                res.render('docs/', addModule({
                    title: event.title,
                    page: 'an-event',
                    event: event,
                    marked: marked,
                    
                    isMobile: isMobile(req)
                }, datefuncs));

            } catch (e) {
                next(CreateError(400, e));
            }
        }
    )
)

module.exports = route;
