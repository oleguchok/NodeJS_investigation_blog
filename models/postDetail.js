'use strict';

module.exports = (sequelize, DataTypes) => {
    const PostDetail = sequelize.define('PostDetails', {
        detailID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        PostBody: {
            type: DataTypes.STRING(4000)
        }
    }, { timestamps: false });

    PostDetail.associate = (models) => {
        PostDetail.hasMany(models.Comments, {
            foreignKey: 'postDetailID'
        });
    };

    return PostDetail;
};