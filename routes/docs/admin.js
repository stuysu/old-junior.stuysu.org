const express = require("express");
const route = express.Router();

const { AUTH_MODE, analyticsOn } = require("../utils.js");

route.get('/admin/signin', (req, res, next) => {
    res.render("admin/signin", {client_id: process.env.CLIENT_ID});
});

route.get(
    '/admin',

    // TODO: extract this middleware
    async (req, res, next) => {
        if (AUTH_MODE.shouldSkip()) {
            next();
        } else {
            
            if (req.cookies['jid'] !== undefined) {
                next();
            } else {
                res.redirect('/admin/signin');
            }
        }
    },

    async (req, res, next) => {
        // if (req.cookies.get(''))
        // res.json(req.cookies['jid']);

        res.type('html').send(`
            <h3>Aye bruh you good</h3>
            ${req.cookies['jid']}
        `);

        // res.render("admin/", { client_id: process.env.CLIENT_ID });

        // if (AUTH_MODE.shouldAsk())
        // else // if (AUTH_MODE.shouldSkip())
        //     res.type('html').send('<h3>You good bruh</h3>');
            // await withoutAuthentication(req, res, next);
    }
);

module.exports = route;
