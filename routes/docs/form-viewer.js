const express = require("express");
const { CreateError, analyticsOn, isMobile } = require("../utils");
const route = express.Router();

route.get(
    "/form-viewer",

    analyticsOn(
        "Form Viewer",

        async (req, res, next) => {
            
            res.render('docs/', { 
                title: 'Form Viewer',
                page: 'form-viewer',
                url: 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSfXV_B4Th5-P_VOyEISl2rxbC05BrzZVOP3jxkrs5BAwF9KEQ/formResponse',

                isMobile: isMobile(req)
            });

        }
    )
);

module.exports = route;
