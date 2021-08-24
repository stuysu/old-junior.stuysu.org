const express = require("express");
const route = express.Router();

const { verify, isDoubleCookieValid, requireAuthAdmin, requireUnauthAdmin, toSignIn } = require("../auth.js");
const { Analytics, Events, Link, Sheets, Attributes, sequelize } = require('../../models');

// Render the signin page
route.get(
    '/signin', 

    requireUnauthAdmin(),

    (req, res, next) => {
        res.render("admin/signin", {
            client_id: process.env.CLIENT_ID,
            message: req.query.message
        });
    }
);

// Signout page (clears and then redirects)
route.get(
    '/signout', 
    requireAuthAdmin(),
    (req, res, next) => {
        res.clearCookie('jid');
        res.redirect('/admin/signin');
    }
); 


// Loads all the data necessary for the cms panel
async function getAllCmsData() {
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

// Loads the cms (with proper authorization)
route.get(
    '/',

    requireAuthAdmin(),

    async (req, res, next) => {
        res.render('admin/cms', { response: await getAllCmsData() });
    }
);

// This request is sent a google token and double cookies for authentication
route.post(
    '/',

    requireUnauthAdmin(),
    
    async (req, res, next) => {
        try {
            await isDoubleCookieValid(req); // throws error if invalid for now
            let { ok, token } = await verify(req.body.credential);

            if (ok) {
                
                // may need expiration, but the token already has that
                // so this will just be regenerated
                res.cookie('jid', token, { 
                    httpOnly: true,
                    sameSite: true, 
                    // path: '/admin' 
                });

                res.redirect('/admin');
            } else {
                toSignIn(res);
            }
        } catch (err) {
            console.error(err);
            toSignIn(res);
        }
    }
);

module.exports = route;
