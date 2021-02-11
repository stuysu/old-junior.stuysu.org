require("dotenv").config();
const path = require("path");

const express = require("express");
const app = express();

// MIDDLEWARE

const morgan = require("morgan");
const logger = morgan("dev");

const parser = require("express").Router();
parser.use(express.json());
parser.use(express.urlencoded({ extended: false }));

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
            .render('docs/error',{error: err});
            // .redirect("/");
    }
}

// Analytics middleware

const { analytics } = require("./routes/utils.js");

// DATABASE

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

// ROUTES

const apiLinks = require("./routes/api/links.js");
const apiAdmin = require("./routes/api/admin.js");
const apiSheet = require("./routes/api/sheet.js");
const apiEvents = require("./routes/api/events.js");
const apiAnalytics = require("./routes/api/analytics.js");

const admin = require("./routes/docs/admin.js");
const index = require("./routes/docs/index.js");
const links = require("./routes/docs/links.js");
const guides = require("./routes/docs/guides.js");

// VIEW ENGINE

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

/////////

app.use(staticServe);
app.use(logger);
app.use(parser);

app.use("/api", apiLinks);
app.use("/api", apiAdmin);
app.use("/api", apiSheet);
app.use("/api", apiAnalytics);
app.use("/api", apiEvents);

app.use("/", index);
app.use("/", admin);
app.use("/", links);
app.use("/", guides);

app.use(error404);
app.use(errorHandler);

const port = Number(process.env.PORT) || 3001;
setup(sequelize)
    .then(() => {
        app.listen(port, () => {
            console.log(`Started application on port ${port}`);
        });
    })
    .catch((err) => {
        console.log(`Did not start due to database error: ${err}`);
    });
