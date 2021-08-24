const express = require('express');
const route = express.Router();

const {getRedirects, ResponseTypes} = require('../adminutil.js');
const {requireAuthAdmin} = require('../auth.js');

route.get(
    '/tab/:type', 

    requireAuthAdmin(), 
    
    async (req, res, next) => {
        const type = req.params.type;
        const typeData = ResponseTypes[type];

        res.render(
            'admin/',
            {
                // navbar data
                redirects: getRedirects(type),

                // chooses which ejs to render
                page: typeData.page,

                // loads data specific to response type
                data: await typeData.getData(),

                // loads scripts specific to response type
                scripts: typeData.scripts
            }
        );
    }
);

module.exports = route;