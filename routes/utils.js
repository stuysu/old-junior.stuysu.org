const { Analytics } = require("../models");

const analytics = async (name) => {
   
    try {
        let entry = await Analytics.findByPk(name);

        if (entry === null) {
            Analytics.create({ url: name, views: 1, tracking: true});
        }

        else {

            if (entry.tracking)
                Analytics.increment('views', { where: { url: name }});

        }

    } catch (error) {
        console.log(`Missed a view in the analytics middleware because of error: ${error}`);
    }

};

const analyticsOn = (name, handler) => {
    
    return async (req, res, next) => {
        analytics(name);
        handler(req, res, next);
    };

};

const isMobile = req => {
    return req.originalUrl.startsWith('/mobile');
};

const addModule = (object, m) => {
    for (let func in m) 
        object[func] = m[func];
    return object;
};

class AuthMode {

    static clean(text) {
        if (text === undefined)
            return text;
        return text.trim().toLowerCase();
    }

    constructor(production, mode) {
        if (AuthMode.clean(production) !== 'production')
            this.mode = AuthMode.clean(mode);
        else
            this.mode = "full"; // <-- in production, use full
    }

    shouldAuth() {
        // Should auth means to do full authentication
        return this.mode === undefined || this.mode === "full";
    }

    shouldAsk() {
        // To show means to load google page without checking for a 
        // valid account
        return this.mode === "show" || this.shouldAuth();
    }

    shouldSkip() {
        // Skipping means to not render google page at all, force load
        // the admin panel
        return !this.shouldAsk();
    }

}

module.exports = {
    CreateError: (__code, __error) => {
        return {
            status: Number(__code),
            error: true,
            message: __error,
        };
    },

    analyticsOn : analyticsOn,
    isMobile : isMobile,
    addModule : addModule,

    AUTH_MODE: new AuthMode(
        process.env.NODE_ENV, 
        process.env.AUTH_MODE
    )
};
