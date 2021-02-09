const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Link extends Model {}

    Link.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                validate: {
                    min: 0,
                },
            },

            ordering: {
                type: DataTypes.INTEGER
            },

            // data necessary for link
            alias: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            url: {
                type: DataTypes.TEXT,
                allowNull: false,
                validate: {
                    isUrl: true,
                },
            },
        },

        {
            sequelize,
            modelName: "Link",
        }
    );

    return Link;
};
