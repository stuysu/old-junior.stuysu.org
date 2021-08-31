// Encapsulates common functionality of a cookie

class Cookie {
    constructor(name, options) {
        this.name = name;
        this.options = options;
    }

    isSigned() {
        return this.options.signed;
    }

    get(req) {
        if (this.isSigned()) {
            return req.signedCookies[this.name];
        }
        return req.cookies[this.name];
    }

    set(res, value) {
        res.cookie(this.name, value, this.options);
    }

    clear(res) {
        res.clearCookie(this.name, { 
            path: this.options.path
            // domain: ??? 
        });
    }

    getAndClear(req, res) {
        const message = this.get(req);
        this.clear(res);
        return message;
    }
};

module.exports = { Cookie };