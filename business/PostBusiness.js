const PostRepository = require('../lib/PostRepository'),
    CommentRepository = require('../lib/CommentRepository'),
    RateRepository = require('../lib/RateRepository'),
    cache = require('../config/cache.js'),
    { POST_MODEL, CACHE, columns } = require('../config/constants'),
    shouldCacheBeUsed = require('../config/config.js')[process.env.NODE_ENV].cache.shouldBeUsed;

function getAllPostsInfo() {
    return PostRepository.getAllPostsWithInfo()
        .then((posts) => {
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
};

function getProfileInfo() {
    return new Promise((resolve, reject) => {
        if (shouldCacheBeUsed) { // remove if by using DI
            cache
                .getData()
                .then((result) => {
                    if (!result) {
                        getAllPostsInfo()
                            .then((result) => {
                                _cacheUpdate(result);
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
        PostRepository.createPost(title, content, global.User.id)
            .then((result) => {
                if (shouldCacheBeUsed) {
                    return getAllPostsInfo()
                        .then((result) => {
                            _cacheUpdate(result, resolve);
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
        if (shouldCacheBeUsed) {
            cache
                .getData()
                .then((result) => {
                    if (!result) {
                        getAllPostsInfo()
                            .then((result) => {
                                _cacheUpdate(result);
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
        CommentRepository.createComment(content, ownerId, detailId)
            .then((result) => {
                // CACHE update on comment adding
                if (shouldCacheBeUsed) {
                    getAllPostsInfo()
                        .then((result) => {
                            _cacheUpdate(result, resolve);
                        });
                } else {
                    resolve();
                }
            });
    });
}

function setRateToThePost(rating, postId, ownerId) {
    return new Promise((resolve, reject) => {
        RateRepository.createRate(rating, postId, ownerId)
            .then((result) => {
                if (shouldCacheBeUsed) {
                    getAllPostsInfo()
                        .then((result) => {
                            _cacheUpdate(result, resolve);
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

    return [];

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

function _cacheUpdate(result, callback) {
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