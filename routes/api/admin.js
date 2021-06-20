const express = require("express");
const route = express.Router();

const { NO_AUTH } = require('../utils');

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
        res.render('admin/response', await forceLoad());
    } catch {
        res.end('<h3>Error: Could not load data</h3>');
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

const verifyToken = async (id_token) => {
    const ticket = await client.verifyIdToken({
        idToken: id_token,
        audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (
        payload["aud"] === CLIENT_ID &&
        (payload["iss"] === "accounts.google.com" ||
            payload["iss"] === "https://accounts.google.com")
    ) {
        return payload;
    } else {
        throw new Error("Cannot verify audience and/or issuer");
    }
};

// This code wraps the google authentication around 
// no-auth verification 
async function withAuthentication(req, res, next) {
    const id_token = req.body.id_token;

    try {
        let payload = await verifyToken(id_token);

        const { sub } = payload;
        let validated = await Subs.findOne({ where: { sub: sub } });
        validated =
            validated !== null ||
            (process.env.NODE_ENV !== "production" &&
                process.env.AUTH_ADMIN === "always");

        if (process.env.NODE_ENV !== 'production') {
            console.log(`${payload.given_name} ${payload.family_name} (${payload.email}) has sub token ${payload.sub}`);
        }

        if (validated) {
            await withoutAuthentication(req, res, next);
        } else {
            res.end("<h3>Error: Could not authenticate</h3>");
        }
    
    } catch (err) {
        err.error = err.error || true;
        res.status(400).json(err);
    }
}

// This function decides which authentication to use
route.post(
    "/admin",

    async (req, res, next) => {
        if (NO_AUTH)
            await withoutAuthentication(req, res, next);
        else
            await withAuthentication(req, res, next);
    }
);

module.exports = route;
