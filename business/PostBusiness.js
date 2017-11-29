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
    }).then((posts) => {
        return posts.map((post) => {
            let averageRate;
            if (post.Rates.length > 0) {
                var rates = post.Rates.map((rate) => {
                    return rate.Rate;
                });

                averageRate = rates.reduce((accumulator, currentRate) => accumulator + currentRate) / rates.length;
            }

            post.dataValues.AverageRate = averageRate;
            return post;
        });
    });
    // return Post.findAll({
    //     include: [{
    //         model: User,
    //         attributes: ['Name']
    //     }, {
    //         model: PostDetail,
    //         attributes: ['PostDetailID', 'PostBody'],
    //         include: [{
    //             model: Comment,
    //             attributes: ['CommentContent', 'Date', 'CommentOwnerID'],
    //             include: [{
    //                 model: User,
    //                 attributes: ['Name']
    //             }],
    //         }],
    //         raw: true
    //     }, {
    //         model: Rate,
    //         attributes: [[Sequelize.fn('AVG', Sequelize.col('Rate')), 'RateAvg']]            
    //     }],
    //     group: ['Post.PostID', 'Title', 'Post.Date', 'OwnerID', 'User.UserID', 'User.Name', 'PostDetail.PostDetailID', 'PostBody', 'CommentContent', 'PostDetail->Comments.Date', 'PostDetail->Comments.CommentOwnerID', 'PostDetail->Comments->User.UserID', 'PostDetail->Comments->User.Name'],
    //     raw: true
    // }).then((posts) => {
    //     return posts.map((post) => {
    //         post.User = {
    //             Name: post['User.Name']
    //         };

    //         post.PostDetail = {
    //             PostDetailID: post['PostDetail.PostDetailID'],
    //             PostBody: post['PostDetail.PostBody']
    //         }

    //         post.RateAvg = post['Rates.RateAvg'];

    //         delete post['User.Name'];
    //         delete post['PostDetail.PostDetailID'];
    //         delete post['PostDetail.PostBody'];
    //         delete post['Rates.RateAvg'];

    //         return post;
    //     });
    // });
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
    return new Promise((resolve, reject) => {
        if (config.cache.shouldBeUsed) {
            cache
                .getData()
                .then((result) => {
                    if (!result) {
                        getAllPostsInfo()
                            .then((result) => {
                                cacheUpdate(result);
                                resolve(_createResponseOptionsForThePost(postId, result));
                            })
                    } else {
                        resolve(_createResponseOptionsForThePost(postId, JSON.parse(result)));
                    }
                })
        } else {
            getAllPostsInfo()
                .then((result) => {
                    resolve(_createResponseOptionsForThePost(postId, result));
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

function _getPostInfoById(postId, posts) {
    let postInfo = {};
    postInfo[POST_MODEL.POST_TITLE] = null;
    postInfo[POST_MODEL.POST_AUTHOR] = null;
    postInfo[POST_MODEL.POST_CREATION_DATE] = null;

    for (let i = 0; i < posts.length; i++) {
        if (posts[i].PostID === +postId) {
            postInfo[POST_MODEL.POST_TITLE] = posts[i].Title;
            postInfo[POST_MODEL.POST_AUTHOR] = posts[i].User.Name;
            postInfo[POST_MODEL.POST_CREATION_DATE] = posts[i].Date;
            postInfo[POST_MODEL.POST_CONTENT] = posts[i].PostDetail.PostBody;
            postInfo[POST_MODEL.POST_DETAIL_ID] = posts[i].PostDetail.PostDetailID;
            postInfo[POST_MODEL.POST_RATE] = posts[i].AverageRate;
            break;
        }
    }
    return postInfo;
};

function _getPostCommentsByPostId(postId, posts) {
    var postWithComments = posts.find((element) => element.PostID === +postId && element.PostDetail !== null && element.PostDetail.Comments !== null && element.PostDetail.Comments.length > 0);

    if (!!postWithComments) {
        return postWithComments.PostDetail.Comments.map((comment) => {
            return {
                commentContent: comment.CommentContent,
                Date: new Date(Date.parse(comment.Date)),
                Name: comment.CommentOwnerID
            }
        }).sort((a, b) => {
            return (a.Date.getTime() - b.Date.getTime())
        });
    }

    return null;

    // let currentPostInfo = posts.filter((item) => {
    //     return (item[POST_MODEL.POST_ID] === +postId && !!item.PostDetail.Comments && item.PostDetail.Comments.length > 0);
    // });

    // return currentPostInfo.map((item) => {
    //     return {
    //         commentContent: item.PostDetail.Com,
    //         Date: new Date(Date.parse(item[POST_MODEL.POST_COMMENT_CREATION_DATE])),
    //         Name: item[POST_MODEL.POST_COMMENT_AUTHOR]
    //     }
    // }).sort((a, b) => {
    //     return (a.Date.getTime() - b.Date.getTime())
    // });
};

function _isPostRatedByCurrentUser(postId, posts) {
    let isRated = null;
    posts.forEach((post) => {
        if (post.PostID === +postId && post.Rates.length > 0) {
            var userRates = post.Rates.filter((rate) => {
                return rate.UserID == global.User.id;
            });
            isRated = userRates.length > 0;
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

function _createResponseOptionsForThePost(postId, result) {
    let postInfo = _getPostInfoById(postId, result);
    return {
        currentPost: {
            id: postId,
            currentUsersRate: _isPostRatedByCurrentUser(postId, result),
            averageRate: postInfo[POST_MODEL.POST_RATE],
            Title: postInfo[POST_MODEL.POST_TITLE],
            Name: postInfo[POST_MODEL.POST_AUTHOR],
            Date: new Date(Date.parse(postInfo[POST_MODEL.POST_CREATION_DATE])),
            PostBody: postInfo[POST_MODEL.POST_CONTENT],
            PostDetailID: postInfo[POST_MODEL.POST_DETAIL_ID]
        },
        postComments: _getPostCommentsByPostId(postId, result)
    };
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