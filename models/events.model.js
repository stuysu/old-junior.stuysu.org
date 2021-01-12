const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {

    class Events extends Model {}

    Events.init(

        {
            id : {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                validate: {
                    min: 0
                }
            },

            title : {
                type: DataTypes.TEXT,
                allowNull: false
            },

            date : {
                type: DataTypes.DATE
            },

            description : {
                type: DataTypes.TEXT,
                allowNull: false
            },

            url : {
                type: DataTypes.TEXT,
                allowNull: false,
                validate : {
                    isUrl: true
                }
            },

            poster : {
                type: DataTypes.TEXT,
                allowNull: false,
                validate : {
                    isUrl: true
                }
            }

        },

        {
            sequelize,
            modelName: 'Events'
        }

    );

    return Events;

};