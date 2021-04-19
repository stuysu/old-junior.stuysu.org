const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {

    class Calendar extends Model {}

    Calendar.init(

        {
            id : {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            
            // date information

            day : {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    min: 1,
                    max: 31
                }
            },

            month: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    min: 1,
                    max: 12
                }
            },

            year : {
                type: DataTypes.INTEGER,
                allowNull: false,
            },

            // information

            dayLetter: {
                type: DataTypes.TEXT
            },

            firstPeriod: {
                type: DataTypes.INTEGER
            },

            remoteGroup: {
                type: DataTypes.TEXT
            },

            note: {
                type: DataTypes.TEXT
            }

        },

        {
            sequelize,
            modelName: 'Calendar'
        }

    );

    return Calendar;

};