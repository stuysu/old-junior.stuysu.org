const express = require('express');
const { CreateError } = require('../utils');
const route = express.Router();

const { Sheets } = require('./../../models');

route.get(

    '/guides',

    async (req, res, next) => {

        res.render(
            
            'docs/guides'
        
        );        
        
    }
)

module.exports = route;