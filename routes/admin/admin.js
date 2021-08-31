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
    getAccessToken, // generate new access token
    TokenCookie, // where to store access token

    // page guards & redirects
    requireAuthAdmin, 
    requireUnauthAdmin, 
    toSignIn, 

    // sign in 
    SignInCookie // sign in errors uses cookies
} = require("../auth.js");

// Render the signin page
route.get(
    '/signin', 

    requireUnauthAdmin(),

    (req, res, _next) => {
        const message = SignInCookie.getAndClear(req, res);

        res.render("admin/signin", {
            client_id: process.env.CLIENT_ID,
            message: message
        });
    }
);

// Signout page (clears and then redirects)
route.get(
    '/signout', 
    requireAuthAdmin(),
    (_req, res, _next) => {
        TokenCookie.clear(res);
        toSignIn(res);
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
                TokenCookie.set(res, getAccessToken(verification.payload));
                
                res.redirect('/admin');
            }
        } catch (err) {
            console.error(err);
            toSignIn(res, err.message);
        }
    }
);

module.exports = route;
