const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');
/*
Database to store admin panel keys.
May be replaced with google authentication.
*/

module.exports = (sequelize, DataTypes) => {

    class Keys extends Model {}

    Keys.init(
    
        {
            id : {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                validate: {
                    min: 0
                }
            },
    
            secureKey : {
                type: DataTypes.TEXT,
                allowNull: false,
                set(value) {
                    Keys.hash(value).then(hashed => {
                        this.setDataValue('secureKey', hashed);
                    }).catch(err => {
                        this.setDataValue('secureKey', value);
                    });
                },
                // validate: {
                    // min: {
                        // args: [6],

                    // }
                // }
            }
    
        },
    
        {
            sequelize,
            modelName: 'Keys'
        }
    
    );

    Keys.hash = (password) => {
        // maybe add env variables here
        return bcrypt.hash(password, 10);
    }

    return Keys;

};