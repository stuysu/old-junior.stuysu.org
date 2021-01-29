/*
Sheet attributes
*/

const { Model } = require("sequelize");

/*

THIS NEEDS TO BE TESTEED FOR WHAT HAPPENS
TO AN ATTRIBUTE WHEN ITS ASSOCIATED 
STUDY SHEET IS DELETED

*/

module.exports = (sequelize, DataTypes) => {
    class Attributes extends Model {
        static associate(models) {
            Attributes.belongsTo(models.Sheets, {
                foreignKey: {
                    allowNull: false,
                },
            });
        }
    }

    Attributes.init(
        {
            keyword: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
        },

        {
            sequelize,
            modelName: "Attributes",
        }
    );

    return Attributes;
};
