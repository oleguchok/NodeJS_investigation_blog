const Comment = require('../models/').Comment;

module.exports = {
    createComment: (content, ownerID, detailID) => {
        return Comment
            .create({
                CommentContent: content,
                Date: new Date(),
                PostDetailID: detailID, //refactor to check if post detail and owner are exist
                CommentOwnerID: ownerID
            })
    }
}