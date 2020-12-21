const express = require('express');
const route = express.Router();

route.get(
    
    '/admin',

    (req, res, next) => 
    
    {

        res.render('admin/', { client_id: process.env.CLIENT_ID });

    }

);

module.exports = route;