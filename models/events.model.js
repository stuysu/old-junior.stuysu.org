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
                type: DataTypes.INTEGER,
                allowNull: false
            },

            description : {
                type: DataTypes.TEXT,
            },

            url : {
                type: DataTypes.TEXT
            },

            poster : {
                type: DataTypes.TEXT
            }

        },

        {
            sequelize,
            modelName: 'Events'
        }

    );

    return Events;

};