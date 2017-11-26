'use strict';

module.exports = (sequelize, DataTypes) => {
    const Post = sequelize.define('Posts', {
        postID: {
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
      }, {timestamps: false});

    Post.associate = (models) => {
        Post.hasOne(models.PostDetails, {
            foreignKey: 'postID'
        });
        Post.hasMany(models.Rates, {
            foreignKey: 'postID'
        });
    };

    return Post;
};