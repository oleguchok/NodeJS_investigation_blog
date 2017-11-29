'use strict';

module.exports = (sequelize, DataTypes) => {
    const Comment = sequelize.define('Comment', {
        CommentID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        CommentContent: {
            type: DataTypes.STRING(4000)
        },
        Date: {
            type: DataTypes.DATE
        }
    }, { timestamps: false });

    Comment.associate = (models) => {
        Comment.belongsTo(models.User, {
            foreignKey: 'CommentOwnerID'
        });
    }

    return Comment;
};