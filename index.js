if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development')
    require('dotenv').config();

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

// Should be the last middleware before the error handler for a 404
function createError(req, res, next) {
    next({
        status: 404,
        body: `Could not ${req.method}/ on ${req._parsedUrl.pathname}`
    });
}

// Error handling routine (send json response for our application)
function finalizeError(err, req, res, next) {
    console.log(err);
    err.error = err.error || true;
    res.status(err.status || 500).json( 
        err || 
        {
            error: true, 
            message: 'Server error'
        }
    );
}

// DATABASE

function setup(db) {
    return new Promise((resolve, reject) => {
        db.sync().then(() => {
            resolve();
        }).catch(err => {
            reject(err);
        });
    })

}

const { sequelize } = require('./models');

// ROUTES

const links = require('./routes/links.js');

/////////

app.use(logger);
app.use(cors);
app.use(parser);

app.use(links);
// app.use('/', links);

app.use(createError);
app.use(finalizeError);

const port = Number(process.env.PORT) || 3001;
setup(sequelize).then(() => {
    app.listen(port, () => {
        console.log(`Started application on port ${port}`);
    });
}).catch(err => {
    console.log(`Did not start due to database error: ${err}`);
});