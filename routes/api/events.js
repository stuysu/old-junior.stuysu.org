const express = require('express');
const router = express.Router();

const { sequelize } = require('./../../models');
const Events = sequelize.models.Events;

const { CreateError } = require('../utils');
const { request } = require('express');

router.get(
    '/events',
    async (req, res, next) => {
        if (req.query.id) {

            
            try {
                let event = await Events.findByPk();
                res.status(200).json(event ? event : {});
            } catch (err) {
                next(CreateError(400, err));
            }
            
        } else {

            try {
                let events = await Event.findAll();
                res.status(200).json(events);
            } catch (err) {
                next(CreateError(400, err));
            }

        }
    }
);

router.post(
    '/events',
    (req, res, next) => {

        if (req.body.title === undefined || req.body.url   === undefined) {
            next(CreateError(400, 'Excpected title and url, only one or neither found'));
        } 

        Events.create({
            title: req.body.title,
            date: req.body.date,
            description: req.body.description,
            url: req.body.url,
            poster: req.body.poster
        }).then(instance => {
            
            res.status(200).json({
                created: true,
                title: req.body.title,
                date: req.body.date,
                description: req.body.description,
                url: req.body.url,
                poster: req.body.poster,
                id: instance.id
            });
            
        }).catch(err => {
            
            next(CreateError(400, err));

        });

    }
);

router.put(

    '/events',

    async (req, res, next) => {

        try {

            let event = await Events.findByPk(req.body.id);

            let result = {
                found: event !== null
            };

            if (result.found) {

                const options = { where: { id: req.body.id } };

                result.old = {
                    title: req.body.title !== undefined ? event.title : undefined,
                    date: req.body.date !== undefined ? event.date : undefined,
                    description: req.body.description !== undefined ? event.description : undefined,
                    url: req.body.url !== undefined ? event.url : undefined,
                    poster: req.body.poster !== undefined ? event.poster : undefined
                };

                await Events.update({
                    title: req.body.title,
                    date: req.body.date,
                    description: req.body.description,
                    url: req.body.url,
                    poster: req.body.poster
                }, options);

                result.title = req.body.title;
                result.date = req.body.date;
                result.description = req.body.description;
                result.url = req.body.url;
                result.poster = req.body.poster;
            }
            
            res.status(200).json(result);

        } catch (err) {

            next(CreateError(400, err));

        }

    }

);

router.delete(

    '/events/:id',

    async (req, res, next) => {

        try {
            let wasDeleted = await Events.destroy({ where: { id : req.params.id }});
            res.status(200).json({
                deleted: wasDeleted == 1,
                id: req.params.id
            });
        } catch (err) {
            next(CreateError(400, err));
        }

    }
    
);