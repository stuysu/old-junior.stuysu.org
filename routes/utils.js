const CreateError = (__code, __error) => {
    return {
        status: Number(__code),
        error: true,
        message: __error,
    };
};

const { Analytics } = require("../models");

const analytics = async (name) => {
    let entry = await Analytics.findByPk(name);

    if (entry === null) {
        Analytics.create({ url: name, views: 1, tracking: true });
    }

    else {

        if (entry.tracking)
            Analytics.increment('views', { where: { url: name } });

    }
};

const analyticsOn = (name, handler) => {

    return async (req, res, next) => {
        try {
            analytics(name);
            handler(req, res, next);
        } catch (err) {
            next(CreateError(500, err.message));
        }
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

module.exports = {
    CreateError: CreateError,
    analyticsOn: analyticsOn,
    isMobile: isMobile,
    addModule: addModule
};
