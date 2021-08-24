const express = require("express");
const router = express.Router();

const { sequelize, Calendar } = require("./../../models");

const { CreateError } = require("../utils");
const { requireAuthApi } = require("../auth");

router.get("/calendar", async (req, res, next) => {

    try {

        let findByDate = true;
        for (let bodyData of [req.query.day, req.query.year, req.query.month]) {
            if (bodyData === undefined) {
                findByDate = false;
                break;
            }
        }

        if (findByDate) {
            res.status(200).json(await Calendar.findOne({
                where: {
                    day: req.query.day,
                    year: req.query.year,
                    month: req.query.month
                }
            }));
        }
        else if (req.query.id === undefined) {
            res.status(200).json(await Calendar.findByPk(req.query.id));
        }
        else {
            res.status(200).json(await Calendar.findAll());
        }
    } catch (e) {
        next(CreateError(400, e));
    }

});

async function createCalendarEntry(req, res, next) {
    for (let bodyData of [req.body.day, req.body.year, req.body.month]) {
        if (bodyData === undefined) {
            next(CreateError(400, "Request data for new calendar missing either day, year, or month"));
        }
    }

    try {

        let newDay = await Calendar.create(req.body);

        newDay.created = true;

        res.status(200).json(newDay);

    } catch (e) {
        next(CreateError(400, e));
    }
}

router.post(
    "/calendar",
    requireAuthApi(),
    createCalendarEntry
);

router.put("/calendar", requireAuthApi(), async (req, res, next) => {
    let where = {
        where: {
            day: req.body.day || -1,
            month: req.body.month || -1,
            year: req.body.year || -1
        }
    }

    try {
        let oldDay = await Calendar.findOne(where);

        if (oldDay === null) {
            createCalendarEntry(req, res, next);
            return;
        }

        for (let col in oldDay) {
            if (req.body[col] === undefined) {
                req.body[col] = oldDay[col];
            }
        }

        await Calendar.update(req.body, where);

        res.status(200).json({ updated: true });

    } catch (e) {
        next(CreateError(400, e));
    }

});


router.delete("/calendar/:id", requireAuthApi(), async (req, res, next) => {
    try {
        let wasDeleted = await Calendar.destroy({ where: { id: req.params.id } });
        res.status(200).json({ id: req.body.id, deleted: wasDeleted == 1 });
    } catch (e) {
        next(CreateError(400, e));
    }
});

module.exports = router;
