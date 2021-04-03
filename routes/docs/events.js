const express = require("express");
const { CreateError, analyticsOn, isMobile } = require("../utils");
const route = express.Router();

const marked = require('marked');

const { Events } = require("./../../models");

route.get(
    "/events/:id",

    analyticsOn(
        "Events",

        async (req, res, next) => {
            try {

                let events = await Events.findAll({where: { id: req.params.id }});
                if (events.length === 0) {
                    // the error handler should do this but whatever
                    res.render('docs-old/error',{ error: {
                        status: 400, 
                        message: `Event with ${req.params.id} does not exist`
                    }});
                }

                let event = events[0];

                res.render('docs/', {
                    title: event.title,
                    page: 'an-event',
                    event: event,
                    marked: marked,
                    
                    isMobile: isMobile(req)
                });

            } catch (e) {
                next(CreateError(400, err));
            }
        }
    )
)

module.exports = route;
