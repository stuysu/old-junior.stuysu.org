const express = require('express');
const route = express.Router();

const CLIENT_ID = process.env.CLIENT_ID;

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

const verifyToken =  async (id_token) => {

    const ticket = await client.verifyIdToken({
        idToken: id_token,
        audience: CLIENT_ID
    });
    const payload = ticket.getPayload();

    console.log(payload);

    if (payload['aud'] === CLIENT_ID && (
        payload['iss'] === 'accounts.google.com' ||
        payload['iss'] === 'https://accounts.google.com'
    )) {
        return payload;
    } else {
        throw new Error('Cannot verify audience and/or issuer');
    }
  
}

const { getLinks } = require('./utils');

// const { sequelize } = require('./../models');
// get a sequelize model with google email ids

// go to the admin sign in page
route.get(
    
    '/admin',

    (req, res, next) => 
    
    {

        res.render('admin/', { client_id: CLIENT_ID });

    }

);

// authenticate email
route.post(
    
    '/admin',

    async (req, res, next) => 
    
    {
        const id_token = req.body.id_token;
        try {
            console.log('trying to token');
            let payload = await verifyToken(id_token);
            console.log('verifying token');

            const { sub } = payload;

            console.log(`${payload.email} has unique token ${sub}`);

            // find out your email sub and replace it for testing
            
            /// THIS IS WHERE YOU WOULD PULL FROM SEQUELIZE DATABASE FOR SUB VALUES
            let validated = false; // sub === '';

            if (validated) {
                let links = await getLinks();
                
                res.render('admin/response', { links : links });
            } else {
                res.end('<h3>Error: Could not authenticate</h3>');
            }

        } catch (err) {
            err.error = err.error || true;
            res.status(400).json(err);
        }

    }
)

module.exports = route;