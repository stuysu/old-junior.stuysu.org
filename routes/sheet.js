const express = require('express');
const router = express.Router();

const { Op } = require('sequelize');

const { Sheets, Attributes } = require('./../models').sequelize.models;
const { CreateError } = require('./utils');

/**
 * CONVERT STUDY SHEET INTEGER INTO TEXT
 * 
 * TODO: this can also be replaced by just having strings
 * for subject in the database. 
 */
router.get(

    '/sheets/subjects',

    async (req, res, next) => {


        res.status(200).json({ subject: 'math' });

    }

);

/**
 * GET STUDY SHEETS
 * 
 * if id is given, get post by that id
 * 
 * if id is not given, look for study sheeet with any of
 * the following matching:
 *  - title
 *  - author
 *  - teacher
 *  - subject
 *  - keyword
 * 
 */
router.get(

    '/sheets',

    async (req, res, next) => {

        try {
        // if id is present, give sheet with that id
            if (req.query.id) {

                    let sheet = await Sheets.findByPk(req.query.id);
                    res.status(200).json(sheet ? sheet : {});
                
            }
            
            else {

                // create an or query for title, author, teacher, subject
                let orQuery = [];

                // look away
                if (req.query.title) orQuery.push({ title: { [Op.like]: `%${req.query.title}%` } });
                if (req.query.author) orQuery.push({ author: { [Op.like]: `%${req.query.author}%` }});
                if (req.query.teacher) orQuery.push({ teacher: { [Op.like]: `%${req.query.teacher}` }});
                if (req.query.subject) orQuery.push({ subject: req.query.subject});

                let sheets = await Sheets.findAll({
                    where: {
                        [Op.or]: query
                    }
                });

                // if a keyword is present, add it to th sheets (avoid duplicates)
                if (req.query.keyword) {

                    let sheetIds = new Set();
                    // go by sheet id's because javascript equality is idk
                    sheets.forEach(sheet => { sheetIds.add(sheet.id); });

                    // look up keywords 
                    let associatedSheets = await Attributes.findAll({ 
                        where: { 
                            keyword: { 
                                [Op.like]: `%${req.query.keyword}%` 
                            } 
                        }
                    });

                    // if the sheet hasn't been used yet, add it
                    associatedSheets.forEach(attribute => {
                        if (!sheetIds.has(attribute.Sheet.id))
                            sheets.push(attribute.getSheet());
                    });


                }
                
                res.status(200).json(sheets);

            }

        } catch (err) {

            next(CreateError(400, err));

        }

    }
    
);

/**
 * GET SHEET KEYWORDS
 */
router.get(

    '/sheets/keywords',

    async (req, res, next) => {

        try {
            // get by id first
            if (req.query.id) {

                let attribute = await Attributes.findOne({ where: { id: req.query.id }});
                res.status(200).json(attribute ? attribute : {});

            } 
            else {

                let query = {};
                
                if (req.query.sheetId) query.SheetId = req.query.sheetId;
                if (req.query.keyword) query.keyword = { [Op.like]: `%${req.query.keyword}%` };

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
// put request for altering a keyword on /sheets/keywords

/**
 * UPDATE A SHEET
 */
router.put(

    '/sheets',

    async (req, res, next) => {

        try {

            let instance = await Sheets.findByPk(req.body.id);

            let result = {
                found: instance !== null
            };
            
            if (result.found) {

                const options = { where: { id: req.body.id } };

                result.old = {
                    url : req.body.url !== undefined ? instance.url : undefined,
                    subject : req.body.subject !== undefined ? instance.subject : undefined,
                    title : req.body.title !== undefined ? instance.title : undefined,
                    author : req.body.author !== undefined ? instance.author : undefined,
                    teacher : req.body.teacher !== undefined ? instance.teacher : undefined
                };

                await Sheets.update({
                    url: req.body.url,
                    author: req.body.author,
                    title: req.body.title,
                    subject: req.body.subject,
                    teacher : req.body.subject
                }, options);

                result.url = req.body.url;
                result.subject = req.body.subject;
                result.title = req.body.title;
                result.author = req.body.author;
                result.teacher = req.body.teacher;                
                
                res.status(200).json(result);
            
            } else {
                res.status(200).json(result);
            }

        } catch (err) {

            next(CreateError(400, err));
        
        }

    }

);

/**
 * ADD A KEYWORD TO A SHEET
 */
router.post(

    '/sheets/keywords',

    async (req, res, next) => {

        if (req.body.id === undefined) {
            next(CreateError(400, `Sheet id not found, but is required`))
        }

        try {

            let attribute = await Attributes.create({
                keyword: req.body.keyword,
                SheetId: req.body.id
            });

            res.status(200).json({
                created: true,
                keyword: req.body.keyword,
                id: req.body.id
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

    '/sheets',

    async (req, res, next) => {

        if (req.body.url === undefined) {

            next(CreateError(400, 'Sheet url not found, but is required'));

        }

        try {
            let instance = await Sheets.create({
                url: req.body.url,
                title: req.body.title,
                author: req.body.author,
                subject: req.body.subject
            });

            res.status(200).json({
                created: true,
                url: req.body.url,
                title: req.body.title,
                author: req.body.author,
                subject: req.body.subject
            });

        } catch (err) {
            next(CreateError(400, err));
        }

    }
    
);

/**
 * DELETE A SHEET 
 * 
 * TODO: does this delete associated study sheetes?
 */
// deleete reqeuest on /sheets/
 
 /**
  * DELETE A KEYWORD
  */
 // delete request on /sheets/keywords

module.exports = router;