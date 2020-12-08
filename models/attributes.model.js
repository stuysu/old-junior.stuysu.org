/*
Sheet attributes
*/

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {

    class Attributes extends Model {

        static associate(models) {
            Attributes.belongsTo(models.Sheets);
        }

    }

    Attributes.init(
    
        {
            keyword : {
                type: DataTypes.TEXT,
                allowNull: false,
            }
    
        },
    
        {
            sequelize,
            modelName: 'Attributes'
        }
    
    );

    return Attributes;

};