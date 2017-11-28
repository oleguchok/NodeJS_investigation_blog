'use strict';

module.exports = (sequelize, DataTypes) => {
    const PostDetail = sequelize.define('PostDetail', {
        PostDetailID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        PostBody: {
            type: DataTypes.STRING(4000)
        }
    }, { timestamps: false });

    PostDetail.associate = (models) => {
        PostDetail.hasMany(models.Comment, {
            foreignKey: 'PostDetailID'  // Consider to make Comment -> Post relationship
        });
    };

    return PostDetail;
};