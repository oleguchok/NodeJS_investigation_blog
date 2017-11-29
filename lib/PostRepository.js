const Post = require('../models/').Post,
    PostDetail = require('../models/').PostDetail,
    Comment = require('../models/').Comment,
    Rate = require('../models/').Rate,
    User = require('../models').User;

module.exports = {
    getAllPostsWithInfo: function() {
        return Post.findAll({
            include: [{
                model: User,
                attributes: ['Name']
            }, {
                model: PostDetail,
                attributes: ['PostDetailID', 'PostBody'],
                include: [{
                    model: Comment,
                    attributes: ['CommentContent', 'Date', 'CommentOwnerID'],
                    include: [{
                        model: User,
                        attributes: ['Name']
                    }]
                }]
            }, {
                model: Rate,
                attributes: ['Rate', 'UserID']
            }]
        });
    },

    createPost: (title, content, ownerID) => {
        return Post.create({
            Title: title,
            Date: new Date(),
            OwnerID: ownerID,
            PostDetail: {
                PostBody: content
            }
        }, {
            include: [PostDetail]
        })
    }
}