const express = require("express");
const route = express.Router();

const { AuthMode, verify, isDoubleCookieValid } = require("../auth.js");
const { Analytics, Events, Link, Sheets, Attributes, sequelize } = require('../../models');

route.get('/admin/signin', (req, res, next) => {
    res.render("admin/signin", {
        client_id: process.env.CLIENT_ID,
        message: req.query.message
    });
});

function toSignIn(res, message=undefined) {
    if (message === undefined) {
        message = `Could not authenticate account, try logging in again!`;
    }
    res.redirect(`/admin/signin?${querystring.stringify({message})}`);
}

route.get('/admin/signout', (req, res, next) => {
    res.clearCookie('jid');
    res.redirect('/admin/signin');
}); 


// Loads all the data necessary for the admin panel
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

const querystring = require('querystring');

route.get(
    '/admin',

    // TODO: extract this middleware
    async (req, res, next) => {
        if (AuthMode.shouldSkip()) {
            next();
        } else {
            let { ok, _ } = await verify(req.cookies['jid']);

            if (ok) {
                next();
            } else {
                toSignIn(res);
            }
        }
    },

    async (req, res, next) => {
        res.render('admin/cms', { response: await getAllCmsData() });
    }
);

route.post(
    '/admin',

    async (req, res, next) => {
        try {
            await isDoubleCookieValid(req); // throws error if invalid for now
            let { ok, token } = await verify(req.body.credential);

            if (ok) {
                res.cookie('jid', token);
                res.redirect('/admin');
            } else {
                toSignIn(res);
            }
        } catch (err) {
            console.error(err);
            res.redirect("/admin/signin");
        }
    }
);

module.exports = route;
