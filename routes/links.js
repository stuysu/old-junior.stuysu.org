const express = require('express');
const router = express.Router();

/*
Don't do too much here yet, 
needs to work with sequelize and sqlite
*/

router.get(
    '/links', 
    (req, res) => {
        const makeLink = (alias, url) => {
            return { alias: alias, url: url };
        };

        res.json([
            makeLink("facebook link", "https://www.facebook.com"),
            makeLink("instagram link", "https://www.instagram.com"),
            makeLink("youtube link", "https://www.youtube.com")
        ]);
    }
);

module.exports = router;