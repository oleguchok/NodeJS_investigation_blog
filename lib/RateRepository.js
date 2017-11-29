const Rate = require('../models/').Rate;

module.exports = {
    createRate: (rating, postID, ownerID) => {
        return Rate
            .create({
                Rate: rating,
                PostID: postID,
                UserID: ownerID
            })
    }
}