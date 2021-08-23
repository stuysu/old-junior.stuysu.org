const express = require("express");
const route = express.Router();

const { AUTH_MODE } = require('../utils');

// Sequlize models
const { Analytics, Events, Link, Subs, Sheets, Attributes, sequelize } = require('../../models');

// Loads all the data necessary for the admin panel
async function forceLoad() {
    let events = await Events.findAll();
                    
    // Get the study sheets
    let sheets = await Sheets.findAll();
    for (let sheet of sheets) 
        sheet['keywords'] = await Attributes.findAll({ where: { SheetId: sheet.id }});;

    // Get all the links
    let links = await Link.findAll({ order: sequelize.col('ordering') });

    // Get the analytics
    let analytics = await Analytics.findAll({ order: [ ['views', 'DESC'] ] });

    // Return the object with all the admin data
    return { 
        links : links,
        sheets : sheets,
        analytics : analytics,
        events : events
    };
}

// Renders the admin response with no authentication 
async function withoutAuthentication(req, res, next) {
    try {
        res.render('admin/cms', {response: await forceLoad()});
    } catch(err) {
        res.type('html').end('<h3>Error: Could not load data</h3>');
    }
}

/*
This code handles authentication with google and verifies 
a token from the authentication frontend
*/

// Google OAuth
const CLIENT_ID = process.env.CLIENT_ID;

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(CLIENT_ID);

async function verifyToken(token) {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (process.env.NODE_ENV !== 'production') {
            console.log(`${payload.given_name} ${payload.family_name} (${payload.email}) has sub token ${payload.sub}`);
        }

        if (AUTH_MODE.shouldAuth()) {
            const { sub } = ticket.getPayload();
            const usr = await Subs.findOne({ where: { sub: sub } });

            let ok = (usr !== null);

            if (AUTH_MODE.shouldAuth()) 
                console.log(`They are ${ok?'':'not'} in the database.`);

            return { ok: ok, token: token };
        } else {
            return { ok: true, token: token };
        }
    } catch (err) {
        console.error(err);
        return { ok: false, token: token };
    }
}


async function checkDoubleCookies(req) {
    // Check if double cookies are working
    let g_csrf_token = req.cookies['g_csrf_token'];
    if (g_csrf_token === undefined)
        throw new Error('No CSRF token in Cookie');
    
    let g_csrf_body = req.body['g_csrf_token'];
    if (g_csrf_body === undefined)
        throw new Error('No CSRF token in body');
    
    if (g_csrf_body != g_csrf_token)
        throw new Error('Failed to verify double CSRF tokens');

    return true;
}

// This code wraps the google authentication around 
// no-auth verification 

async function withAuthentication(req, res, next) {
    try {
        await checkDoubleCookies(req);
        let { ok, token } = await verifyToken(req.body.credential);

        if (ok) {
            res.cookie('jid', token, {
                httpOnly: true, 
                sameSite: true, 
                // path: '/admin'
            });
            await withoutAuthentication(req, res, next);
        } else {
            res.type('html').end("<h3>Error: Could not authenticate</h3>");
        }
    } catch (err) {
        console.error(err);
        // res.status(400).json(err);
        res.type('html').end("<h3>GET THE FUCK OUT OF HERE</h3>");
    }
}

// This function decides which authentication to use
route.post(
    "/admin",

    async (req, res, next) => {
        if (AUTH_MODE.shouldAsk())
            await withAuthentication(req, res, next);
        else // if (AUTH_MODE.shouldSkip())
            await withoutAuthentication(req, res, next);
    }
);

module.exports = route;
