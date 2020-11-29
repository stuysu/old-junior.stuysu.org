const { Link } = require('./../models').sequelize.models;

module.exports = {

    CreateError: (__code, __error) => {
        return {
            status : Number(__code),
            error: __error || true
        };
    },

    // returns [{ id, url, alias, createdAt, updatedAt }...] or []
    getLinks: () => {
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
    

}