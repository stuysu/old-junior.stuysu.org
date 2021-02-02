const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Analytics extends Model {}

    Analytics.init(
        {

            url: {
                type: DataTypes.STRING,
                primaryKey: true,
            },

            views: {
                type: DataTypes.STRING
            },

            tracking: {
                type: DataTypes.BOOLEAN
            }

        },

        {
            sequelize,
            modelName: "Analytics",
        }
    );

    return Analytics;
};
