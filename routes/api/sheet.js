const express = require("express");
const router = express.Router();

const { Op } = require("sequelize");

const { Sheets, Attributes } = require("./../../models").sequelize.models;
const { CreateError } = require("../utils");
const { requireAuthApi } = require('../auth');

/**
 * GET STUDY SHEETS
 */

// function kinda messy af
router.get(
    "/sheets",

    // i think i was on crack when i made this cause it's literally 3 
    // very similar operations and i wrote all of them out for some reason
    async (req, res, next) => {

        try {
            if (req.query.id) {
                
                let sheet = await Sheets.findByPk(req.query.id);
                if (req.query.with_keywords === "true") {
                    let keywords = await Attributes.findAll({
                        where: { SheetId: sheet.id },
                    });
                    // keywords = keywords.map(foo => foo.keyword);
                    sheet.dataValues.keywords = keywords;
                    sheet.keywords = keywords;
                }

                res.status(200).json(sheet ? sheet : {});
            
            } else if (req.query.any) {

                let orQuery = [];

                // look away
                orQuery.push({ title: { [Op.like]: `%${req.query.any}%` } });
                orQuery.push({ author: { [Op.like]: `%${req.query.any}%` } });
                orQuery.push({ teacher: { [Op.like]: `%${req.query.any}%` } });
                orQuery.push({ subject: { [Op.like]: `%${req.query.any}%` } });

                let sheets = await Sheets.findAll({
                    where: { [Op.or]: orQuery },
                });

                let sheetIds = new Set();
                // go by sheet id's because javascript equality is idk
                sheets.forEach((sheet) => {
                    sheetIds.add(sheet.id);
                });

                // look up keywords
                let associatedSheets = await Attributes.findAll({
                    where: {
                        keyword: {
                            [Op.like]: `%${req.query.any}%`,
                        },
                    },
                    include: Sheets,
                });

                associatedSheets.forEach((attribute) => {
                    if (!sheetIds.has(attribute.Sheet.id))
                        sheets.push(attribute.Sheet);
                });

                if (req.query.with_keywords === "true") {
                    for (let sheet of sheets) {
                        let keywords = await Attributes.findAll({
                            where: { SheetId: sheet.id },
                        });
                        // keywords = keywords.map(foo => foo.keyword);
                        sheet.dataValues.keywords = keywords;
                        sheet.keywords = keywords;
                    }
                }

                res.status(200).json(sheets);
            
            } else {
                // build up a where clause based on what was in the get request
                let where = {};

                // look away

                for (let searchType in req.query) {
                    // everything else in req.query is a searchType 
                    // or an error :D
                    if (searchType !== 'with_keywords')
                        where[searchType] = { [Op.like]: `%${req.query[searchType]}%` };              
                }

                let sheets = await Sheets.findAll({
                    where: where,
                });

                // if a keyword is present, add it to th sheets (avoid duplicates)
                if (req.query.keyword) {

                    let sheetIds = new Set();
                    // go by sheet id's because javascript equality is idk
                    sheets.forEach((sheet) => {
                        sheetIds.add(sheet.id);
                    });

                    // look up keywords
                    let associatedSheets = await Attributes.findAll({
                        where: {
                            keyword: {
                                [Op.like]: `%${req.query.keyword}%`,
                            },
                        },
                        include: Sheets,
                    });

                    let outSheets = [];

                    // if the sheet is ALSO in the set of keywords, add it
                    associatedSheets.forEach((attribute) => {
                        if (sheetIds.has(attribute.Sheet.id))
                            outSheets.push(attribute.Sheet);
                    });
                }

                if (req.query.with_keywords === "true") {
                    for (let sheet of sheets) {
                        let keywords = await Attributes.findAll({
                            where: { SheetId: sheet.id },
                        });
                        // keywords = keywords.map(foo => foo.keyword);
                        sheet.dataValues.keywords = keywords;
                        sheet.keywords = keywords;
                    }
                }

                res.status(200).json(sheets);
            }

        } catch (err) {
            console.log("HELLO YOU LITTLE PIECE OF SHIT " + err);
            next(CreateError(400, err));
        }
    }
);

/**
 * GET SHEET KEYWORDS
 */
router.get(
    "/sheets/keywords",

    async (req, res, next) => {
        try {
            // get by id first
            if (req.query.id) {
                let attribute = await Attributes.findOne({
                    where: { id: req.query.id },
                });
                res.status(200).json(attribute ? attribute : {});
            } else {
                let query = {};

                if (req.query.sheetId) query.SheetId = req.query.sheetId;
                if (req.query.keyword)
                    query.keyword = { [Op.like]: `%${req.query.keyword}%` };

                let keywords = await Attributes.findAll({ where: query });
                res.status(200).json(keywords);
            }
        } catch (err) {
            next(CreateError(400, err));
        }
    }
);

/**
 * UPDATE A SHEET KEYWORD
 */
router.put(
    "/sheets/keywords",

    requireAuthApi(),

    async (req, res, next) => {
        if (req.body.id === undefined) {
            next(CreateError(400, "Need an attribute id to process request"));
        }

        try {
            let instance = await Attributes.findByPk(req.body.id);

            let result = {
                found: instance !== null,
            };

            if (result.found) {
                const options = { where: { id: req.body.id } };

                result.old = {
                    keyword:
                        req.body.keyword !== undefined
                            ? instance.keyword
                            : undefined,
                };

                await Attributes.update(
                    {
                        keyword: req.body.keyword,
                    },
                    options
                );

                result.keyword = req.body.keyword;
            }

            res.status(200).json(result);
        } catch (err) {
            next(CreateError(400, err));
        }
    }
);

/**
 * UPDATE A SHEET
 */
router.put(
    "/sheets",

    requireAuthApi(),

    async (req, res, next) => {
        try {
            let instance = await Sheets.findByPk(req.body.id);

            let result = {
                found: instance !== null,
            };

            if (result.found) {
                const options = { where: { id: req.body.id } };

                result.old = {
                    url: req.body.url !== undefined ? instance.url : undefined,
                    subject:
                        req.body.subject !== undefined
                            ? instance.subject
                            : undefined,
                    title:
                        req.body.title !== undefined
                            ? instance.title
                            : undefined,
                    author:
                        req.body.author !== undefined
                            ? instance.author
                            : undefined,
                    teacher:
                        req.body.teacher !== undefined
                            ? instance.teacher
                            : undefined,
                };

                await Sheets.update(
                    {
                        url: req.body.url,
                        author: req.body.author,
                        title: req.body.title,
                        subject: req.body.subject,
                        teacher: req.body.teacher,
                    },
                    options
                );

                result.url = req.body.url;
                result.subject = req.body.subject;
                result.title = req.body.title;
                result.author = req.body.author;
                result.teacher = req.body.teacher;
            }

            res.status(200).json(result);
        } catch (err) {
            next(CreateError(400, err));
        }
    }
);

/**
 * ADD A KEYWORD TO A SHEET
 */
router.post(
    "/sheets/keywords",

    requireAuthApi(),

    async (req, res, next) => {
        if (req.body.id === undefined) {
            next(CreateError(400, `Sheet id not found, but is required`));
        }

        try {
            let attribute = await Attributes.create({
                keyword: req.body.keyword,
                SheetId: req.body.id,
            });

            res.status(200).json({
                created: true,
                keyword: req.body.keyword,
                id: attribute.id,
                sheetId: req.body.id
            });
        } catch (err) {
            next(CreateError(400, err));
        }
    }
);

/**
 * ADD A SHEET
 */
router.post(
    "/sheets",

    requireAuthApi(),

    async (req, res, next) => {
        if (req.body.url === undefined) {
            next(CreateError(400, "Sheet url not found, but is required"));
        }

        try {
            let instance = await Sheets.create({
                url: req.body.url,
                title: req.body.title,
                author: req.body.author,
                subject: req.body.subject,
                teacher: req.body.teacher,
            });

            res.status(200).json({
                created: true,
                id: instance.id,
                url: req.body.url,
                title: req.body.title,
                author: req.body.author,
                subject: req.body.subject,
                teacher: req.body.teacher,
            });
        } catch (err) {
            next(CreateError(400, err));
        }
    }
);

/**
 * DELETE A SHEET
 */
router.delete(
    "/sheets/:id",

    requireAuthApi(),

    async (req, res, next) => {
        try {
            let wasDeleted = await Sheets.destroy({
                where: { id: req.params.id },
            });
            res.status(200).json({
                deleted: wasDeleted == 1,
                id: req.params.id,
            });
        } catch (err) {
            next(CreateError(400, err));
        }
    }
);
// delete reqeuest on /sheets/

/**
 * DELETE A KEYWORD
 */
router.delete(
    "/sheets/keywords/:id",
    
    requireAuthApi(),

    async (req, res, next) => {
        try {
            let wasDeleted = await Attributes.destroy({
                where: { id: req.params.id },
            });
            res.status(200).json({
                deleted: wasDeleted == 1,
                id: req.params.id,
            });
        } catch (err) {
            next(CreateError(400, err));
        }
    }
);
// delete request on /sheets/keywords

module.exports = router;
