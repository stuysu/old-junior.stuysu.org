require('dotenv').config();
const path = require('path'); 

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

const staticServe = express.static(path.join(__dirname, 'public')); 

// Should be the last middleware before the error handler for a 404
function error404(req, res, next) {
    next({
        status: 404,
        body: `Could not ${req.method}/ on ${req._parsedUrl.pathname}`
    });
}

// Error handling routine (send json response for our application)
function errorHandler(err, req, res, next) {
    console.log(err);

    if (err)
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

const { sequelize } = require('./models');

// TODO: add function to by default populate the subs model

function setup(db) {
    return db.sync();
}

// ROUTES

const links = require('./routes/links.js');
const admin = require('./routes/admin.js');

// VIEW ENGINE

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/////////

app.use(staticServe);
app.use(logger);
app.use(cors);
app.use(parser);

app.use(links);
app.use(admin);

app.use(error404);
app.use(errorHandler);

const port = Number(process.env.PORT) || 3001;
setup(sequelize).then(() => {
    app.listen(port, () => {
        console.log(`Started application on port ${port}`);
    });
}).catch(err => {
    console.log(`Did not start due to database error: ${err}`);
});