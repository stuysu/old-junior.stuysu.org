const express = require("express");
const router = express.Router();

const { sequelize, Link } = require("./../../models");

const { CreateError } = require("../utils");
const { requireAuthApi } = require("../auth");

function getIntOr(n, other) {
    let parsed = parseInt(n);
    return parsed.toString() === n ? parsed : other;
}

router.put("/links/ordering", requireAuthApi(), async (req, res, next) => {

    if (req.body.id === undefined || req.body.ordering === undefined) {
        next(CreateError(400, "Expected both an id and an order integer"));
    }
    try {
        let result = await Link.update(
            // the new ordering value
            { ordering: req.body.ordering },
            
            // the link to update
            { where: { id: Number(req.body.id) }}
        );

        console.log(result);

        res.status(200).json({ 
            id: req.body.id, 
            ordering: req.body.ordering 
        });
    } catch (e) {
        next(CreateError(400, e));
    }


});

router.get("/links", async (req, res, next) => {
    if (req.query.id) {
        let n = getIntOr(req.query.id, req.query.id);

        try {
            let link = await Link.findByPk(n);
            res.status(200).json(link ? link : {});
        } catch (err) {
            next(CreateError(400, err));
        }
    } else {
        try {
            let links = await Link.findAll();
            res.status(200).json(links);
        } catch (err) {
            next(CreateError(400, err));
        }
    }
});

router.post("/links", requireAuthApi(), (req, res, next) => {
    if (req.body.alias === undefined || req.body.url === undefined) {
        next(
            CreateError(
                400,
                "Excpected alias and url, only one or neither found"
            )
        );
    }

    Link.create({
        alias: req.body.alias,
        url: req.body.url,
    })
        .then((instance) => {
            res.status(200).json({
                created: true,
                url: req.body.url,
                alias: req.body.alias,
                id: instance.id,
            });
        })
        .catch((err) => {
            next(CreateError(400, err));
        });
});

router.put("/links/", requireAuthApi(), async (req, res, next) => {
    if (req.body.id === undefined) {
        next(CreateError(400, "Need a link id to process request"));
    }
        
    let n = getIntOr(req.body.id, req.body.id);
    let opts = { where: { id: n } };
    try {
            
        let link = await Link.findByPk(n);

        let result = {
            found: link !== null,
        };

        if (result.found) {
            const hasAlias = req.body.alias !== undefined;
            const hasUrl = req.body.url !== undefined;

            result.old = {
                url: hasUrl ? link.url : undefined,
                alias: hasAlias ? link.alias : undefined,
            };

            result.url = req.body.url;
            result.updatedUrl = hasUrl ? result.url !== link.url : undefined;

            result.alias = req.body.alias;
            result.updatedAlias = hasAlias
                ? result.alias !== link.alias
                : undefined;

            Link.update(
                {
                    url: req.body.url || result.old.url,
                    alias: req.body.alias || result.old.alias,
                },
                opts
            )
                .then(() => {
                    res.status(200).json(result);
                })
                .catch((err) => {
                    next(CreateError(400, err));
                });
        } else {
            res.status(200).json(result);
        }
    } catch (err) {
        next(CreateError(400, err));
    }
    
});

router.delete("/links/:id", requireAuthApi(), (req, res, next) => {
    let n = getIntOr(req.params.id, req.params.id);
    Link.destroy({
        where: {
            id: n,
        },
    })
        .then((wasDeleted) => {
            res.status(200).json({
                deleted: wasDeleted == 1 ? true : false,
                id: n,
            });
        })
        .catch((err) => {
            next(CreateError(400, err));
        });
});

module.exports = router;
