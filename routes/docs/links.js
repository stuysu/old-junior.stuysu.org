const express = require('express');
const { CreateError } = require('../utils');
const route = express.Router();

// Sequlize models
const { Link } = require('../../models').sequelize.models;

route.get(
    '/links',

    async (req, res, next) => {

        try {
            let links = await Link.findAll();
            res.render('docs/links', { links : links });
        } catch (err) {
            next(CreateError(400, err));
        }
    }
)

module.exports = route;