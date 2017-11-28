'use strict';

module.exports = (sequelize, DataTypes) => {
    const Post = sequelize.define('Post', {
        PostID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Title: {
            type: DataTypes.STRING(255)
        },
        Date: {
            type: DataTypes.DATE
        }
    }, { timestamps: false });

    Post.associate = (models) => {
        Post.hasOne(models.PostDetail, {
            foreignKey: 'PostID'
        });
        Post.hasMany(models.Rate, {
            foreignKey: 'PostID'
        });
        Post.belongsTo(models.User, {
            foreignKey: 'OwnerID'
        });
    };

    return Post;
};