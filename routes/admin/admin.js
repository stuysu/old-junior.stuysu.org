/**
 * This file contains all the routes that 
 * are necessary for complete authentication
 */

const express = require("express");
const route = express.Router();

const { verify, isDoubleCookieValid, requireAuthAdmin, requireUnauthAdmin, toSignIn } = require("../auth.js");

// Render the signin page
route.get(
    '/signin', 

    requireUnauthAdmin(),

    (req, res, _next) => {
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
    (_req, res, _next) => {
        res.clearCookie('jid');
        res.redirect('/admin/signin');
    }
); 

// This request is sent a google token and double cookies for authentication
route.post(
    '/login',

    requireUnauthAdmin(),
    
    async (req, res, _next) => {
        try {
            await isDoubleCookieValid(req); // throws error if invalid for now
            let verification = await verify(req.body.credential);

            if (verification.ok) {
                
                // may need expiration, but the token already has that
                // so this will just be regenerated
                res.cookie('jid', req.body.credential, { 
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
