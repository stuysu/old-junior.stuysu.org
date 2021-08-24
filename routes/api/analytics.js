const express = require("express");
const router = express.Router();

const { sequelize, Analytics } = require("./../../models");

const { CreateError } = require("../utils");
const { requireAuthApi } = require("../auth");

router.get(
    '/analytics',

    async (req, res, next) => {

        try {
            res.status(200).json(await Analytics.findAll());
        } catch (err) {
            next(CreateError(400, err));
        }

    }

);

router.put(
    '/analytics/reset',

    requireAuthApi(),

    async (req, res, next) => {

        try {

            let result = await Analytics.update(
                { views: 0 },
                {where : { url : req.body.url }}
            );

            res.status(200).json({
                reset: (result[0] > 0),
                url: req.body.url
            });

        } catch (error) {
            next(CreateError(400, error));
        }

    }
    
);

router.put(
    '/analytics/toggle',

    requireAuthApi(),

    async (req, res, next) => {

        try {

            let entry = await Analytics.findByPk(req.body.url);

            if (entry === null)
                next(CreateError(400, 'Could not find entry by url ' + req.body.url));

            let newState = !entry.tracking;

            let result = await Analytics.update({ tracking: newState }, {where: { url : req.body.url }});
            
            res.status(200).json({
                worked: (result[0] > 0),
                url: req.body.url,
                tracking: newState
            });


        } catch (error) {
            next(CreateError(400, error));
        }

    }
);

module.exports = router;