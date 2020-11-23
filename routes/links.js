const express = require('express');
const router = express.Router();

const { sequelize } = require('./../models');
// typdef
const Link = sequelize.models.Link;

// Make this a global function
// i think creating an error object is the best way to get express
// to handle error because it'll bring it to the error handler
// only throw errors in your routes
function CreateError(__code, __error) {
    let tmp = new Error(__error);
    tmp.status = __code;
    tmp.statusCode = __code;
    return tmp;
}

// Temporarily use this for post requests (which shouldn't return anything)
// Make this a global function
function localSuccess(__message) {
    return {message: __message };
}

function getLinkById(id) {
    return new Promise((resolve, reject) => {
        Link.findByPk(id).then(linkById => {
            
            if (linkById === null) {
                reject(`Could not find a link by id ${id}`);
            }

            resolve({
                id: linkById.dataValues.id,
                alias: linkById.dataValues.alias,
                url: linkById.dataValues.url
            });

        }).catch(err => {
            reject(err);
        });
    });
}

function getLinks() {
    return new Promise((resolve, reject) => {
        Link.findAll().then(allLinks => {

            let tmp = [];

            allLinks.forEach(oneLink => {
                tmp.push({
                    id: oneLink.id,
                    alias: oneLink.alias,
                    url: oneLink.url
                });
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
    (req, res) => {
        if (req.query.id) {

            let n = getIntOr(req.query.id, req.query.id);
            getLinkById(n).then(back => {
                res.status(200).json(back);
            }).catch(err => {
                throw CreateError(400, err);
            })
            
        } else {

            getLinks().then(linkList => {
                res.status(200).json(linkList);
            }).catch(err => {
                throw CreateError(400, err);
            });

        }
    }
);

router.post(
    '/links',
    (req, res) => {

        if (req.body.alias === undefined || req.body.url   === undefined) {

            throw CreateError(400, 'Excpected alias and url, only one or neither found');

        } else {

            Link.create({
                alias: req.body.alias,
                url: req.body.url
            }).then(() => {
                
                res.status(200).json(localSuccess(
                    `Created new link with alias '${req.body.alias}' and url ${req.body.url}`
                ));
                
            }).catch(err => {
                
                throw CreateError(err);

            });
        }
    }
);

router.put(
    '/links/', 
    (req, res) => {
        
        if (req.body.id === undefined) {

            throw CreateError('Need a link id to process request');
        
        } else {
        
            let n = getIntOr(req.body.id, req.body.id);
            let opts = { where: { id: n }};

            getLinkById(n).then(link => {

                const hasAlias = req.body.alias !== undefined;
                const hasUrl = req.body.url !== undefined;
                
                // this is not technically necessary
                if (!hasAlias && !hasUrl) {
                    throw CreateError(400, "Provide one or both between alias and url");
                }

                const url = link.url;
                const alias = link.alias;

                console.log(url);
                console.log(alias);

                Link.update(updateTo, opts).then(() => {
                    res.status(200).json(localSuccess(`Updated ${alias} to ${updateTo.alias} and ${url} to ${updateTo.url} in link with id ${n}`));
                }).catch(err => {
                    throw CreateError(400, err);
                });

            }).catch(err => {
                throw CreateError(400, err);
            });

        }

    }
);

router.delete(
    '/links/:id',
    (req, res) => {

        let n = getIntOr(req.params.id, req.params.id);
        Link.destroy({
            where: {
                id: n
            }
        }).then(wasDeleted => {
            let message = wasDeleted ? `Deleted link with id ${n}` : `Could not find link with id ${n}`;
            res.status(200).json(localSuccess(message));
        }).catch(err => {
            throw CreateError(400, err);
        });

    }
);

module.exports = router;