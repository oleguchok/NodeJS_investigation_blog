const Post = require('../models/').Post,
    PostDetail = require('../models/').PostDetail,
    Comment = require('../models/').Comment,
    Rate = require('../models/').Rate,
    User = require('../models').User,
    Sequelize = require('../models/').Sequelize,
    cache = require('../config/cache.js'),
    { POST_MODEL, CACHE, columns } = require('../config/constants'),
    config = require('../config/config.js')[process.env.NODE_ENV];

function getAllPostsInfo() {
    return Post.findAll({
        include: [{
            model: User,
            attributes: ['Name']
        }, {
            model: PostDetail,
            attributes: ['PostBody']
        }, {
            model: Rate,
            attributes: [
                [Sequelize.fn('AVG', Sequelize.col('Rate')), 'RateAvg']
            ]
        }],
        group: ['Post.PostID', 'Title', 'Date', 'OwnerID', 'User.UserID', 'Name', 'PostDetailID', 'PostBody', 'RateID']
    });
};

function getProfileInfo() {

    return new Promise((resolve, reject) => {
        if (config.cache.shouldBeUsed) { // remove if by using DI
            cache
                .getData()
                .then((result) => {
                    if (!result) {
                        getAllPostsInfo()
                            .then((result) => {
                                cacheUpdate(result);
                                resolve(_createResponseOptions(result));
                            });
                    } else {
                        resolve(_createResponseOptions(JSON.parse(result)));
                    }
                })
        } else {
            getAllPostsInfo()
                .then((result) => {
                    resolve(_createResponseOptions(result));
                });
        }
    });
};

function addPost(title, content) {

    return new Promise((resolve, reject) => {
        Post.create({
            Title: title,
            Date: new Date(),
            OwnerID: global.User.id,
            PostDetail: {
                PostBody: content
            }
        }, {
            include: [PostDetail]
        }).then((result) => {
            if (config.cache.shouldBeUsed) {
                return getAllPostsInfo()
                    .then((result) => {
                        cacheUpdate(result, resolve);
                    });
            } else {
                resolve();
            }
        }).catch((error) => {
            console.log(error);
        });
    });
};

function getPostById(postId) {
    function createResponseOptionsForThePost(postId, result) {
        let postInfo = getPostInfoById(postId, result);
        return {
            currentPost: {
                id: postId,
                currentUsersRate: isPostRatedByCurrentUser(postId, result),
                averageRate: postInfo[POST_MODEL.POST_RATE],
                Title: postInfo[POST_MODEL.POST_TITLE],
                Name: postInfo[POST_MODEL.POST_AUTHOR],
                Date: new Date(Date.parse(postInfo[POST_MODEL.POST_CREATION_DATE])),
                PostBody: postInfo[POST_MODEL.POST_CONTENT],
                PostDetailID: postInfo[POST_MODEL.POST_DETAIL_ID]
            },
            postComments: getPostCommentsByPostId(postId, result)
        };
    };

    return new Promise((resolve, reject) => {
        if (config.cache.shouldBeUsed) {
            cache
                .getData()
                .then((result) => {
                    if (!result) {
                        getAllPostsInfo()
                            .then((result) => {
                                cacheUpdate(result);
                                resolve(createResponseOptionsForThePost(postId, result));
                            })
                    } else {
                        resolve(createResponseOptionsForThePost(postId, JSON.parse(result)));
                    }
                })
        } else {
            getAllPostsInfo()
                .then((result) => {
                    resolve(createResponseOptionsForThePost(postId, result));
                })
        }
    });
};

function addCommentToThePost(content, ownerId, detailId) {
    return new Promise((resolve, reject) => {
        Comment
            .create({
                CommentContent: content,
                Date: new Date(),
                PostDetailID: detailId, //refactor to check if post detail and owner are exist
                CommentOwnerID: ownerId
            }).then((result) => {
                // CACHE update on comment adding
                if (config.cache.shouldBeUsed) {
                    getAllPostsInfo()
                        .then((result) => {
                            cacheUpdate(result, resolve);
                        });
                } else {
                    resolve();
                }
            });
    });
}

function getPostInfoById(postId, posts) {
    let postInfo = {};
    postInfo[POST_MODEL.POST_TITLE] = null;
    postInfo[POST_MODEL.POST_AUTHOR] = null;
    postInfo[POST_MODEL.POST_CREATION_DATE] = null;

    for (let i = 0; i < posts.length; i++) {
        if (posts[i][columns.BLOG.POSTS.POST_ID] === +postId) {
            postInfo[POST_MODEL.POST_TITLE] = posts[i][columns.BLOG.POSTS.TITLE];
            postInfo[POST_MODEL.POST_AUTHOR] = posts[i].User.Name;
            postInfo[POST_MODEL.POST_CREATION_DATE] = posts[i][columns.BLOG.POSTS.DATE];
            postInfo[POST_MODEL.POST_CONTENT] = posts[i].PostDetail.PostBody;
            postInfo[POST_MODEL.POST_DETAIL_ID] = posts[i].PostDetail.PostDetailID;
            postInfo[POST_MODEL.POST_RATE] = posts[i][POST_MODEL.POST_RATE]; // count average (sum / count)
            break;
        }
    }
    return postInfo;
};

function getPostCommentsByPostId(postId, posts) {
    let currentPostInfo = posts.filter((item) => {
        return (item[POST_MODEL.POST_ID] === +postId && !!item[POST_MODEL.POST_COMMENT_AUTHOR_ID]);
    });

    return currentPostInfo.map((item) => {
        return {
            commentContent: item[POST_MODEL.POST_COMMENT_CONTENT],
            Date: new Date(Date.parse(item[POST_MODEL.POST_COMMENT_CREATION_DATE])),
            Name: item[POST_MODEL.POST_COMMENT_AUTHOR]
        }
    }).sort((a, b) => {
        return (a.Date.getTime() - b.Date.getTime())
    });
};

function isPostRatedByCurrentUser(postId, posts) {
    let isRated = null;
    posts.forEach((item) => {
        if (item[POST_MODEL.POST_ID] === +postId) {
            isRated = !!item[POST_MODEL.CURRENT_USERS_RATE];
        }
    });
    return isRated;
}

function _createResponseOptions(result) {
    return {
        myPostsCollection: _getCurrentUsersPosts(result),
        otherPostsCollection: _getOtherUsersPosts(result)
    }
};

function _getCurrentUsersPosts(posts) {
    let currentUsersPosts = posts.filter((post) => post.OwnerID === global.User.id);
    return currentUsersPosts.map((post) => {
        return {
            postId: post.PostID,
            Title: post.Title
        }
    });
};

function _getOtherUsersPosts(posts) {
    let otherUsersPosts = posts.filter((post) => post.OwnerID !== global.User.id);
    return otherUsersPosts.map((post) => {
        return {
            postId: post.PostID,
            Title: post.Title,
            Name: post.User.Name
        }
    });
};

function setRateToThePost(rating, postId, ownerId) {

    return new Promise((resolve, reject) => {
        Rate
            .create({
                Rate: rating,
                PostID: postId,
                UserID: ownerId
            })
            .then((result) => {
                if (config.cache.shouldBeUsed) {
                    getAllPostsInfo()
                        .then((result) => {
                            cacheUpdate(result, resolve);
                        });
                } else {
                    resolve();
                }
            });
    });
}

function cacheUpdate(result, callback) {
    cache
        .event
        .emit(CACHE.EVENTS.UPDATE_DATA, result, () => {
            if (callback) {
                callback();
            }
        });
}

module.exports = {
    addCommentToThePost: addCommentToThePost,
    addPost: addPost,
    getPostById: getPostById,
    getProfileInfo: getProfileInfo,
    setRateToThePost: setRateToThePost
}