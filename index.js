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
            .render('error',{error: err});
    }
}

function useRoutes(app, baseEndpoint, pathTo) {
    fs.readdirSync(pathTo).forEach(file => {
        app.use(baseEndpoint, require(path.join(pathTo, file)));
    });
}

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

// VIEW ENGINE

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

/////////

app.use(staticServe);
app.use(logger);
app.use(parser);
app.use(cookieParser());

useRoutes(app, "/api", path.join(__dirname, "routes/api"));
useRoutes(app, "/", path.join(__dirname, "routes/docs"));
useRoutes(app, "/admin", path.join(__dirname, "routes/admin"));
useRoutes(app, "/mobile", path.join(__dirname, "routes/docs"));

app.use(error404);
app.use(errorHandler);

const port = Number(process.env.PORT) || 3001;
(async () => {
    
    // setup database 
    try {
        await setup(sequelize);
    } 
    
    // if fails, reset app
    catch (err) {
        console.error(err);
        
        app = express();
        app.get("/*", (_, res) => {
            res.status(500).type('html').end(`
                <!DOCTYPE html>
                <html lang="en">
                <head><title>Database Error</title></head>
                <body>
                    <div>Couldn't start application</div>
                    <div>${err.name}</div>
                    <div>${err.message}</div>
                </body>
                </html>
            `);
        });
    }

    // run app (whether it's reset or not)
    finally {
        app.listen(port, () => {
            console.log(`Started application on port ${port}`);
        });
    }

})();