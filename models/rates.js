'use strict';

module.exports = (sequelize, DataTypes) => {
    const Rates = sequelize.define('Rates', {
        rateID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        postID: {
            type: DataTypes.INTEGER
        },
        userID: {
            type: DataTypes.INTEGER
        },
        rate: {
            type: DataTypes.FLOAT
        }
    }, { timestamps: false });

    return Rates;
};