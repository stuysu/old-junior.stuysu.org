const { Link } = require('./../models').sequelize.models;

module.exports = {

    CreateError: (__code, __error) => {
        return {
            status : Number(__code),
            error: __error || true
        };
    }

}