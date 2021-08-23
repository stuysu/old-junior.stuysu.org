const express = require("express");
const route = express.Router();

const { AUTH_MODE, analyticsOn } = require("../utils.js");

route.get('/admin/signin', (req, res, next) => {
    res.render("admin/", {client_id: process.env.CLIENT_ID});
});

route.get(
    '/admin',

    async (req, res, next) => {
        console.log('HELLO');

        if (AUTH_MODE.shouldSkip()) {
            next();
        } else {
            res.redirect('/admin/signin');
        }
    },

    async (req, res, next) => {
        // if (req.cookies.get(''))
        res.json(req.cookies['jid']);

        // if (AUTH_MODE.shouldAsk())
        //     res.render("admin/", { client_id: process.env.CLIENT_ID });
        // else // if (AUTH_MODE.shouldSkip())
        //     res.type('html').send('<h3>You good bruh</h3>');
            // await withoutAuthentication(req, res, next);
    }
);

module.exports = route;
