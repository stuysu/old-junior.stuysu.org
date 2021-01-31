const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Subs extends Model {}

    Subs.init(
        {
            sub: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
        },

        {
            sequelize,
            modelName: "Subs",
        }
    );

    return Subs;
};
