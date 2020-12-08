const express = require('express');
const router = express.Router();

const { Sheets, Attributes } = require('./../models').sequelize.models;
const { CreateError } = require('./utils');

router.get(

    '/sheets',

    async (req, res, next) => {

        try {
            let sheets = await Sheets.findAll();
            res.status(200).json(sheets);
        } catch (err) {
            next(CreateError(400, err));
        }

    }
    
);

router.put(

    '/sheets',

    async (req, res, next) => {

        // should also expect id. 
        // update by id

        // an attribute will be undefined if not given by the user
        // if it is null, make it null in the database. null must 
        // be given by the user

        // console.log(req.body);
        let tmp = { 

            url: req.body.url,
            author: req.body.author,
            title: req.body.title,
            subject: req.body.subject

        };

        console.log(tmp);

        res.status(200).json({ 

            url: req.body.url,
            author: req.body.author,
            title: req.body.title,
            subject: req.body.subject

        });

    }

);

router.post(

    '/sheets',

    async (req, res, next) => {

        if (req.body.url === undefined) {

            next(CreateError(400, 'Sheet url not found, but is required'));

        }

        try {
            let instance = await Sheets.create({
                url: req.body.url,
                title: req.body.title,
                author: req.body.author,
                subject: req.body.subject
            });

            res.status(200).json({
                created: true,
                url: req.body.url,
                title: req.body.title,
                author: req.body.author,
                subject: req.body.subject
            });

        } catch (err) {
            next(CreateError(400, err));
        }

    }
    
);

module.exports = router;