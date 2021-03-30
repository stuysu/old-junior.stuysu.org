const express = require("express");
const { CreateError, analyticsOn } = require("../utils");
const route = express.Router();

function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

route.get(
    "/form-viewer",

    async (req, res, next) => {
        // let data = { code : req.url.query.url };
        let height = "750px";
        if (isNumeric(req.query.size)) 
            height = Math.abs((Number(req.query.size))) + "px";

        res.render("docs/form-viewer.ejs", { code : req.query.url, height: height });
    }
);

module.exports = route;
