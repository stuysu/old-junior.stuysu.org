const express = require("express");
const app = express();

// MIDDLEWARE

const morgan = require('morgan');
const logger = morgan('dev');

const parser = require('express').Router();
parser.use(express.json());
parser.use(express.urlencoded({ extended: false }));

const corsOptions = {
    origin: '*'
};
const cors = require('cors')(corsOptions);


function createError(req, res, next) {
    next({
        status: 404,
        error: `Could not ${req.method}/ on ${req._parsedUrl.pathname}`
    });
}

function finalizeError(err, req, res, next) {
    res.status(err.status || 500).json({
        success: false,
        error: err.error || 'Server error'
    })
}

// ROUTES

const links = require('./routes/links.js');

/////////

app.use(logger);
app.use(cors);
app.use(parser);

app.use(links);

app.use(createError);
app.use(finalizeError);

const port = 3001;
app.listen(port, () => {
    console.log(`Listening on ${port}!`);
})

