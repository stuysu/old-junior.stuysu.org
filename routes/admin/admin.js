/**
 * This file contains all the routes that 
 * are necessary for complete authentication
 */

const express = require("express");
const route = express.Router();

const { 
    // authentication
    verifySignInToken, 
    isDoubleCookieValid, 

    // authorization
    setTokenCookie,
    clearTokenCookie,

    // page guards & redirects
    requireAuthAdmin, 
    requireUnauthAdmin, 
    toSignIn 
} = require("../auth.js");

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
        clearTokenCookie(res);
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
            let verification = await verifySignInToken(req.body.credential);

            // should always be ok, it throws an error
            if (verification.ok) {
                // uses default options
                setTokenCookie(res, verification.payload);
                
                res.redirect('/admin');
            }
        } catch (err) {
            console.error(err);
            toSignIn(res, err.message);
        }
    }
);

module.exports = route;
