const express = require('express');
const route = express.Router();

const { sequelize } = require('./../models');
const Keys = sequelize.models.Keys;
const { CreateError } = require('./utils');

const bcrypt = require('bcryptjs');

route.post(
    '/admin',
    async (req, res, next) => 
    
    {
    
        if (!req.body.password) {
            next(CreateError(400, `Expected password, none found`));
        } else {

            if (!process.env.ADMIN_KEY) {
                next(CreateError(500, `No admin key at this time`));
            }

            // load from database here
            const pwdHash = await bcrypt.hash(process.env.ADMIN_KEY, 10);

            bcrypt.compare(req.body.password, pwdHash, (err, result) => {
                if (err)
                    next(CreateError(400, err));

                res.status(200).json({
                    authenticated: result
                });

            });

        }

    }
)

module.exports = route;