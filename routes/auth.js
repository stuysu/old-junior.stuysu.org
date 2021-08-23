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

/**********************
 * VERIFY GOOGLE JWTS *
 **********************/

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

const { OAuth2Client } = require("google-auth-library");
const { Subs } = require('../models');
const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET);

async function verify(token) {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            CLIENT_ID: CLIENT_ID
        });

        // console.log(ticket);

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

        return { ok: true, token: token };
    } catch (err) {
        console.error(err);
        return { ok: false, token: token };
    }
}

module.exports.verify = verify;

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