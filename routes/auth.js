/************************************************
 * Authentication and Authorization helper file *
 ***********************************************/

/*********************** 
 * AUTHENTICATION TYPE *
 ***********************/

class AuthMode {

    static clean(text) {
        if (text === undefined)
            return text;
        return text.trim().toLowerCase();
    }

    static Mode = AuthMode.clean(process.env.NODE_ENV) !== 'production' ?
        AuthMode.clean(process.env.AUTHENTICATION_MODE) :
        "full";

    static shouldAuth() {
        // Should auth means to do full authentication
        return AuthMode.Mode === undefined || AuthMode.Mode === "full";
    }

    static shouldAsk() {
        // To show means to load google page without checking for a 
        // valid account
        return AuthMode.Mode === "show" || AuthMode.shouldAuth();
    }

    static shouldSkip() {
        // Skipping means to not render google page at all, force load
        // the admin panel
        return !AuthMode.shouldAsk();
    }

}

module.exports.AuthMode = AuthMode;

/******************************
 * VERIFY AUTHENTICATION JWTS *
 ******************************/

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

const { OAuth2Client } = require("google-auth-library");
const { Subs } = require('../models');
const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET);

async function verifySignInToken(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        CLIENT_ID: CLIENT_ID
    });

    const payload = ticket.getPayload();

    if (AuthMode.shouldAuth()) {
        let usr = await Subs.findOne({
            where: {
                sub: payload['sub']
            }
        });

        if (usr === null) {
            throw new Error(`${payload['sub']} of email ${payload['email']} is not whitelisted`);
        }
    }

    return { ok: true, payload: payload };
}

module.exports.verifySignInToken = verifySignInToken;

/*********************************
 * VERIFY AUTHENTICATION COOKIES *
 *********************************/

async function isDoubleCookieValid(req) {
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

module.exports.isDoubleCookieValid = isDoubleCookieValid;

/************************
 * AUTHORIZATION TOKENS *
 ************************/

const jwt = require('jsonwebtoken');

// Web Token Options
const SECRET = process.env.ACCESS_TOKEN_SECRET;
const ACCESS_TOKEN_OPTIONS = {
    "expiresIn": "15m"
};

// Web Cookie Options

const { Cookie } = require('./cookie');

const TOKEN_COOKIE = new Cookie(
    'jid',
    {
        httpOnly: true,
        sameSite: true,
        secure: process.env.NODE_ENV !== "development",
        path: '/', // shoudl really be /admin and /api but not possible (could change /api to /admin/api)
        maxAge: 604800000
    }
)

// Token Helpers

// takes only relevant information from google jwt payload
// this is necessary (as opposed to just a userid or sub) because there's no database of users
function getAccessTokenPayload(payload) {
    return {
        sub: payload.sub,
        name: payload.name,
        picture: payload.picture,
        email: payload.payload
    };
}

function getAccessToken(payload) {
    return jwt.sign(
        getAccessTokenPayload(payload), // the only thing we need to store for now
        SECRET,
        ACCESS_TOKEN_OPTIONS
    );
}

function verifyAccessToken(token) {
    return jwt.verify(
        token,
        SECRET
    );
}

function verifyRequest(req, res) {
    const token = TOKEN_COOKIE.get(req);

    try {
        const payload = verifyAccessToken(token);
        return { ok: true, payload, error: undefined };

    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            console.log('Token expired, regenerating');

            // Get the expired payload
            let rawPayload = jwt.decode(token);

            // Remove timestamp in payload (this is kinda hacky)
            delete rawPayload.iat;
            delete rawPayload.exp;

            // Update cookie (generates new payload)
            const newToken = getAccessToken(rawPayload)
            TOKEN_COOKIE.set(res, newToken);

            // Retrieve most up-to-date payload
            rawPayload = jwt.decode(newToken);
            return { ok: true, payload: rawPayload };
        }
        console.error(err);

        return { ok: false, payload: undefined, error: err };
    }
}

module.exports.getAccessToken = getAccessToken;
module.exports.TokenCookie = TOKEN_COOKIE;

/**************************** 
 * AUTHORIZATION MIDDLEWARE *
 ****************************/

// create a authorization middleware by providing two other middlewares
function authed(options) {

    async function middleware(req, res, next) {
        if (AuthMode.shouldSkip()) {
            res.locals.payload = getAccessTokenPayload({
                sub: 0,
                email: 'john@doe.com',
                name: 'John Doe',
                picture: 'https://i.stack.imgur.com/34AD2.jpg'
            });

            if (options.allowSkip) {
                return next();
            } else {
                return res.redirect('/admin');
            }
        }

        let { ok, payload, error } = verifyRequest(req, res);

        if (ok) {
            res.locals.payload = payload;
            options.authorized(req, res, next);
        } else {
            options.unauthorized(error, req, res, next);
        }
    }

    return middleware;
}

// A redirect to the signin page with a default message
const SIGN_IN_COOKIE = new Cookie(
    'signinfail',
    {
        path: '/admin/signin',
        httpOnly: true,
        sameSite: true
    }
);

function toSignIn(res, message=undefined) {
    if (message !== undefined && process.env.NODE_ENV !== "development") {
        message = 'Could not authenticate account. Try again later.';
    }

    if (message) {
        SIGN_IN_COOKIE.set(res, message);
    } else {
        SIGN_IN_COOKIE.clear(res);
    }

    res.redirect('/admin/signin');
}

// middleware for auth-only admin pages
function requireAuthAdmin() {
    return authed({
        authorized: (_req, _res, next) => next(), // pass through
        unauthorized: (error, _req, res, _next) => toSignIn(res, error.message), // go back to sign in page
        allowSkip: true // this is for when the auth mode is skip
    })
}

// middleware for unauth-only admin pages
function requireUnauthAdmin() {
    return authed({
        authorized: (_req, res, _next) => res.redirect('/admin'), // go back to admin page 
        unauthorized: (_e, _req, _res, next) => next(), // pass through
        allowSkip: false // do not allow any signout/signin pages in skip mode
    })
}

// middleware for auth-only api routes (no need for UnauthApi i think)
function requireAuthApi() {
    return authed({
        authorized: (_req, _res, next) => next(),
        unauthorized: (e, _req, res, _next) => res.status(401).json({ error: e.name, message: e.message }),
        allowSkip: true // allow authorization in skip mode
    })
}

module.exports.requireAuthAdmin = requireAuthAdmin;
module.exports.requireUnauthAdmin = requireUnauthAdmin;
module.exports.requireAuthApi = requireAuthApi;
module.exports.authed = authed;
module.exports.toSignIn = toSignIn;
module.exports.SignInCookie = SIGN_IN_COOKIE;
