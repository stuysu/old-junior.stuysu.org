const express = require('express');
const router = express.Router();

const { sequelize } = require('./../../models');
const Events = sequelize.models.Events;

const { CreateError } = require('../utils');
const { requireAuthApi } = require('../auth');

router.get(
    '/events',
    async (req, res, next) => {
        if (req.query.id) {
            
            try {
                let event = await Events.findByPk(req.query.id);
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
    requireAuthApi(), 
    (req, res, next) => {

        if (req.body.title === undefined || req.body.date   === undefined) {
            next(CreateError(400, 'Excpected title and date, only one or neither found'));
        } 

        Events.create({
            title: req.body.title,
            date: req.body.date,
            description: req.body.description,
            url: req.body.url,
            poster: req.body.poster,
            isImportant: req.body.isImportant,
            isHidden: req.body.isHidden
        }).then(instance => {
            
            res.status(200).json({
                created: true,
                title: req.body.title,
                date: req.body.date,
                description: req.body.description,
                url: req.body.url,
                poster: req.body.poster,
                isImportant: req.body.isImportant,
                isHidden: req.body.isHidden,
                id: instance.id
            });
            
        }).catch(err => {
            
            next(CreateError(400, err));

        });

    }
);

router.put(

    '/events',

    requireAuthApi(),

    async (req, res, next) => {

        try {

            let event = await Events.findByPk(req.body.id);

            let result = {
                found: event !== null
            };

            if (result.found) {
                const hasTitle = req.body.title !== undefined;
                const hasDate = req.body.date !== undefined;
                const hasDescription = req.body.description !== undefined;
                const hasUrl = req.body.url !== undefined;
                const hasPoster = req.body.poster !== undefined;
                const hasIsImportant = req.body.isImportant !== undefined;
                const hasIsHidden = req.body.isHidden !== undefined;

                const options = { where: { id: req.body.id } };

                result.old = {
                    title: req.body.title !== undefined ? event.title : undefined,
                    date: req.body.date !== undefined ? event.date : undefined,
                    description: req.body.description !== undefined ? event.description : undefined,
                    url: req.body.url !== undefined ? event.url : undefined,
                    poster: req.body.poster !== undefined ? event.poster : undefined,
                    isImportant: req.body.isImportant !== undefined ? event.isImportant : undefined,
                    isHidden: req.body.isHidden !== undefined ? event.isHidden : undefined,
                };

                await Events.update({
                    title: req.body.title,
                    date: req.body.date,
                    description: req.body.description,
                    url: req.body.url,
                    poster: req.body.poster,
                    isImportant: req.body.isImportant,
                    isHidden: req.body.isHidden
                }, options);

                result.title = req.body.title;
                result.date = req.body.date;
                result.description = req.body.description;
                result.url = req.body.url;
                result.poster = req.body.poster;
                result.isImportant = req.body.isImportant;
                result.isHidden = req.body.isHidden;

                result.updatedTitle = hasTitle ? (result.title !== event.title) : undefined;
                result.updatedDate = hasDate ? (result.date !== event.date) : undefined;
                result.updatedDescription = hasDescription ? (result.description !== event.description) : undefined;
                result.updatedUrl = hasUrl ? (result.url !== event.url) : undefined;
                result.updatedPoster = hasPoster ? (result.poster !== event.poster) : undefined;
                result.updatedIsImportant = hasIsImportant ? (result.isImportant !== event.isImportant) : undefined;
                result.updatedIsHidden = hasIsHidden ? (result.isHidden !== event.isHidden) : undefined;
            }
            
            res.status(200).json(result);

        } catch (err) {

            next(CreateError(400, err));

        }

    }

);

router.delete(

    '/events/:id',

    requireAuthApi(),

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

module.exports = router;