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
