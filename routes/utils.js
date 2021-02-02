const { Analytics } = require("../models");

const analytics = async (req) => {
    const url = req.url;
    
    try {
        let entry = await Analytics.findByPk(url);

        if (entry === null) {
            Analytics.create({ url: url, views: 1, tracking: true});
        }

        else {

            if (entry.tracking)
                Analytics.increment('views', { where: { url: url }});

        }

    } catch (error) {
        console.log(`Missed a view in the analytics middleware because of error: ${error}`);
    }

};

const analyticsOn = (handler) => {
    
    return async (req, res, next) => {
        analytics(req);
        handler(req, res, next);
    };

};


module.exports = {
    CreateError: (__code, __error) => {
        return {
            status: Number(__code),
            error: true,
            message: __error,
        };
    },

    analyticsOn : analyticsOn,
};
