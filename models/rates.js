'use strict';

module.exports = (sequelize, DataTypes) => {
    const Rate = sequelize.define('Rate', {
        RateID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Rate: {
            type: DataTypes.FLOAT
        }
    }, { timestamps: false });

    return Rate;
};