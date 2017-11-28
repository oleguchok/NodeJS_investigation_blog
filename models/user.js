'use strict';

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('Users', {
        userID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Name: {
            type: DataTypes.STRING(255)
        },
        Password: {
            type: DataTypes.STRING(255)
        },
        Email: {
            type: DataTypes.STRING(255)
        }
    }, {
        timestamps: false,
        hooks: {
            beforeCreate: (a, b) => {
                console.log("beforeCreate");
            }
        }
    });

    User.associate = (models) => {
        User.hasMany(models.Posts, {
            foreignKey: 'OwnerID'
        });
        User.hasMany(models.Comments, {
            foreignKey: 'commentOwnerID'
        });
        User.hasMany(models.Rates, {
            foreignKey: 'userID'
        });
    }

    return User;
}