const express = require("express");
const { CreateError, analyticsOn } = require("../utils");
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
                let event = events[0];

                res.render('docs/', {
                    title: event.title,
                    page: 'an-event',
                    event: event,
                    marked: marked
                });

            } catch (e) {
                next(CreateError(400, err));
            }
        }
    )
)

module.exports = route;
