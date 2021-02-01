const express = require("express");
const route = express.Router();

// Sequlize models
const { Link, Subs, Sheets, Attributes, sequelize } = require('../../models');

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

// authenticate email
route.post(
    "/admin",

    async (req, res, next) => {
        const id_token = req.body.id_token;
        try {
            let payload = await verifyToken(id_token);

            const { sub } = payload;
            let validated = await Subs.findOne({ where: { sub: sub } });
            validated =
                validated !== null ||
                (process.env.NODE_ENV !== "production" &&
                    process.env.AUTH_ADMIN === "always");

            if (process.env.NODE_ENV !== 'production')
                console.log(payload);

            if (validated) {
                try {

                    // Get the study sheets
                    let sheets = await Sheets.findAll();
                    for (let sheet of sheets) 
                        sheet['keywords'] = await Attributes.findAll({ where: { SheetId: sheet.id }});;

                    // Get all the links
                    let links = await Link.findAll({ order: sequelize.col('ordering') });

                    // Render the full admin panel
                    res.render('admin/response', { 
                        links : links,
                        sheets : sheets
                    });
                    
                } catch {
                    res.end("<h3>Error: Could not load data</h3>");
                }
            } else {
                res.end("<h3>Error: Could not authenticate</h3>");
            }
        } catch (err) {
            err.error = err.error || true;
            res.status(400).json(err);
        }
    }
);

module.exports = route;
