const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Sheets extends Model {
        static associate(models) {
            Sheets.hasMany(models.Attributes);
        }
    }

    Sheets.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                validate: { min: 0 },
            },

            url: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    isUrl: true,
                },
            },

            title: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            author: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            teacher: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            subject: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },

        {
            sequelize,
            modelName: "Sheets",
        }
    );

    return Sheets;
};
