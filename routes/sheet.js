const express = require('express');
const router = express.Router();

const { Op } = require('sequelize');

const { Sheets, Attributes } = require('./../models').sequelize.models;
const { CreateError } = require('./utils');

/**
 * GET STUDY SHEETS
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

                const addMatch = (query, column, toMatch) => {
                    if (toMatch)
                        query[column] = { [Op.like]: `%${toMatch}%` }; 
                };

                let query = {};
                addMatch(query, 'title', req.query.title);
                addMatch(query, 'author', req.query.author);
                addMatch(query, 'teacher', req.query.teacher);
                if (req.query.subject) query.subject = req.query.subject;

                let sheets = await Sheets.findAll({ where: query });

                if (req.query.keyword) {

                    let sheetIds = new Set();
                    sheets.forEach(sheet => {
                        sheetIds.add(sheet.id); 
                    });

                    const keywordQuery = {};
                    addMatch(keywordQuery, 'keyword', req.query.keyword);

                    let associatedSheets = await Attributes.findAll({ 
                        where: keywordQuery, 
                        include: Sheets 
                    });

                    let finalSheets = [];

                    associatedSheets.forEach(attribute => {
                        if (sheetIds.has(attribute.Sheet.id))
                            finalSheets.push(attribute.Sheet);
                    });

                    res.status(200).json(finalSheets);

                } else {
                    res.status(200).json(sheets);
                }

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

        console.log("Fuckfuckfuck???");

        try {
            // get by id first
            if (req.query.id) {

                console.log('getting by id');

                let attribute = await Attributes.findOne({ where: { id: req.query.id }});
                res.status(200).json(attribute ? attribute : {});

            } 
            else {

                console.log("getting by idfk");

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

module.exports = router;