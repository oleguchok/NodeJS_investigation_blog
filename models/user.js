'use strict';

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        UserID: {
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
        User.hasMany(models.Post, {
            foreignKey: 'OwnerID'
        });
        User.hasMany(models.Comment, {
            foreignKey: 'CommentOwnerID'
        });
        User.hasMany(models.Rate, {
            foreignKey: 'UserID'
        });
    }

    return User;
}