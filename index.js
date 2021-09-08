require("dotenv").config();
const path = require("path");
const fs = require("fs");

const express = require("express");
let app = express();

// MIDDLEWARE

const morgan = require("morgan");
const logger = morgan("dev");

const parser = require("express").Router();
parser.use(express.json());
parser.use(express.urlencoded({ extended: false }));

const cookieParser = require('cookie-parser');

const staticServe = express.static(path.join(__dirname, "public"));

// Should be the last middleware before the error handler for a 404
function error404(req, res, next) {
    next({
        status: 404,
        message: `Could not ${req.method}/ on ${req._parsedUrl.pathname}`,
    });
}

// Error handling routine (send json response for our application)
function errorHandler(err, req, res, next) {
    console.log(err);

    const apiError = req.url.startsWith("/api");

    if (apiError) {
        if (err) err.error = err.error || true;
        res.status(err.status || 500).json(
            err || {
                error: true,
                message: "Server error",
            }
        );
    } else {
        res.status(err.status || 500)
            .render('error', { error: err });
    }
}

function useRoutes(app, baseEndpoint, pathTo) {
    fs.readdirSync(pathTo).forEach(file => {
        app.use(baseEndpoint, require(path.join(pathTo, file)));
    });
}

// SETUP 

const { sequelize } = require("./models");

function setup(db) {
    if (process.env.DATABASE_LOAD === 'force') {
        return db.sync({ force: true });
    }

    if (process.env.DATABASE_LOAD === 'alter') {
        return db.sync({ alter: true });
    }

    return db.sync();
}
// ejs template (for render.js)
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Global middlewares
app.use(staticServe);
app.use(logger);
app.use(parser);
app.use(cookieParser());

// All endpoints
useRoutes(app, "/api", path.join(__dirname, "routes/api"));
useRoutes(app, "/", path.join(__dirname, "routes/docs"));
useRoutes(app, "/mobile", path.join(__dirname, "routes/docs"));
useRoutes(app, "/admin", path.join(__dirname, "routes/admin"));

// Error handlers
app.use(error404);
app.use(errorHandler);

(async () => {
    await setup(sequelize);
    const port = Number(process.env.PORT) || 3001;
    app.listen(port, () => console.log(`Listening on ${port}`));
})();