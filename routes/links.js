const express = require('express');
const router = express.Router();

const { sequelize } = require('./../models');
const Link = sequelize.models.Link;

const { CreateError } = require('./utils');


// Temporarily use this for post requests (which shouldn't return anything)
// Make this a global function
// have this function return nothing in production so POST, PUT, DELETE dont return anything
function localSuccess(__message) {
    return { message: __message };
}

// returns { id, url, alias, createdAt, updatedAt } or null
function getLinkById(id) {
    return new Promise((resolve, reject) => {
        Link.findByPk(id).then(linkById => {
            
            resolve(linkById);

        }).catch(err => {
            reject(err);
        });
    });
}

// returns [{ id, url, alias, createdAt, updatedAt }...] or []
function getLinks() {
    return new Promise((resolve, reject) => {
        Link.findAll().then(allLinks => {

            let tmp = [];

            allLinks.forEach(oneLink => {
                tmp.push(oneLink);
            });

            resolve(tmp);

        }).catch(err => {
            reject(err);
        });

    });
}

function getIntOr(n, other) {
    let parsed = parseInt(n);
    return (parsed.toString() === n) ? parsed : other;
}

router.get(
    '/links', 
    (req, res, next) => {
        if (req.query.id) {

            let n = getIntOr(req.query.id, req.query.id);
            getLinkById(n).then(back => {
                res.status(200).json(back ? back : {});
            }).catch(err => {
                next(CreateError(400, err));
            });
            
        } else {

            getLinks().then(linkList => {
                res.status(200).json(linkList);
            }).catch(err => {
                next(CreateError(400, err));
            });

        }
    }
);

router.post(
    '/links',
    (req, res, next) => {

        if (req.body.alias === undefined || req.body.url   === undefined) {
            next(CreateError(400, 'Excpected alias and url, only one or neither found'));
        } 

        Link.create({
            alias: req.body.alias,
            url: req.body.url
        }).then(() => {
            
            res.status(200).json({
                created: true,
                url: req.body.url,
                alias: req.body.alias
            });
            
        }).catch(err => {
            
            next(CreateError(400, err));

        });

    }
);

router.put(
    '/links/', 
    (req, res, next) => {
        
        if (req.body.id === undefined) {

            next(CreateError(400, 'Need a link id to process request'));
        
        }
        
        let n = getIntOr(req.body.id, req.body.id);
        let opts = { where: { id: n } };

        getLinkById(n).then(link => {

            let result = {
                found: link !== null,
            };

            if (result.found) {
                const hasAlias = req.body.alias !== undefined;
                const hasUrl = req.body.url !== undefined;

                result.old = {
                    url: hasUrl ? link.url : undefined,
                    alias: hasAlias ? link.alias : undefined
                };

                result.url = req.body.url;
                result.updatedUrl = hasUrl ? (result.url !== link.url) : undefined;

                result.alias = req.body.alias;
                result.updatedAlias = hasAlias ? (result.alias !== link.alias) : undefined;

                Link.update({
                    url: req.body.url || result.old.url,
                    alias: req.body.alias || result.old.alias
                }, opts).then(() => {
                    res.status(200).json(result);
                }).catch(err => {
                    next(CreateError(400, err));
                });

            } else {
                res.status(200).json(result);
            }

        }).catch(err => {
            next(CreateError(400, err));
        });

    }
);

router.delete(
    '/links/:id',
    (req, res, next) => {

        let n = getIntOr(req.params.id, req.params.id);
        Link.destroy({
            where: {
                id: n
            }
        }).then(wasDeleted => {
            res.status(200).json({
                deleted: wasDeleted==1?true:false,
                id: n
            });
        }).catch(err => {
            next(CreateError(400, err));
        });

    }
);

module.exports = router;