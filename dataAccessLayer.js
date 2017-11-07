const blog = require('./models/blog.model.js'),
    posts = require('./models/post.model.js'),
    cache = require('./config/cache.js'), 
    {POST_MODEL, CACHE} = require('./config/constants'),
    config = require('config'),
    data = {};

function cacheUpdate(result, callback) {
    cache
        .event
        .emit(CACHE.EVENTS.UPDATE_DATA, result, () => {
            if (callback) {
                callback();
            }
        });
}

data.getProfileInfo = () => {
    function createResponseOptions(result) {
        return {
            myPostsCollection: posts.getCurrentUsersPosts(result),
            otherPostsCollection: posts.getOtherUsersPosts(result)
        }
    };

    return new Promise((resolve, reject) => {
        if (config.get('cache.shouldBeUsed')) {
            cache
                .getData()
                .then((result) => {
                    if (!result) {
                        blog
                            .POSTS
                            .getAllPostsInfo()
                            .spread((result, metadata) => {
                                cacheUpdate(result);
                                resolve(createResponseOptions(result));
                            });
                    } else {
                        resolve(createResponseOptions(JSON.parse(result)));
                    }
                })
        } else {
            blog
                .POSTS
                .getAllPostsInfo()
                .spread((result, metadata) => {
                    resolve(createResponseOptions(result));
                });
        }
    });
}

data.getPostById = (postId) => {
    function createResponseOptionsForThePost(postId, result) {
        let postInfo = posts.getPostInfoById(postId, result);
        return {
            currentPost: {
                id: postId,
                currentUsersRate: posts.isPostRatedByCurrentUser(postId, result),
                averageRate: postInfo[POST_MODEL.POST_RATE],
                Title: postInfo[POST_MODEL.POST_TITLE],
                Name: postInfo[POST_MODEL.POST_AUTHOR],
                Date: new Date(Date.parse(postInfo[POST_MODEL.POST_CREATION_DATE])),
                PostBody: postInfo[POST_MODEL.POST_CONTENT],
                detailID: postInfo[POST_MODEL.POST_DETAIL_ID]
            },
            postComments: posts.getPostCommentsByPostId(postId, result)
        };
    };

    return new Promise((resolve, reject) => {
        if (config.get('cache.shouldBeUsed')) {
            cache
                .getData()
                .then((result) => {
                    if (!result) {
                        blog
                            .POSTS
                            .getAllPostsInfo()
                            .spread((result, metadata) => {
                                cacheUpdate(result);
                                resolve(createResponseOptionsForThePost(postId, result));
                            })
                    } else {
                        resolve(createResponseOptionsForThePost(postId, JSON.parse(result)));
                    }
                })
        } else {
            blog
                .POSTS
                .getAllPostsInfo()
                .spread((result, metadata) => {
                    resolve(createResponseOptionsForThePost(postId, result));
                })
        }
    });
};

data.addCommentToThePost = (content, ownerId, detailId) => {
    return new Promise((resolve, reject) => {
        blog
            .COMMENTS
            .addComment(content, ownerId, detailId)
            .spread((result, metadata) => {
                // CACHE update on comment adding
                if (config.get('cache.shouldBeUsed')) {
                    blog
                        .POSTS
                        .getAllPostsInfo()
                        .spread((result, metadata) => {
                            cacheUpdate(result, resolve);
                        });
                } else {
                    resolve();
                }
            });
    });
}

data.setRateToThePost = (rating, postId, ownerId) => {

    return new Promise((resolve, reject) => {
        blog
            .RATES
            .setRate(rating, postId, ownerId)
            .spread((result, metadata) => {
                if (config.get('cache.shouldBeUsed')) {
                    blog
                        .POSTS
                        .getAllPostsInfo()
                        .spread((result, metadata) => {
                            cacheUpdate(result, resolve);
                        });
                } else {
                    resolve();
                }
            });
    });
}

data.addPost = (title, content) => {

    return new Promise((resolve, reject) => {
        blog
            .POSTS
            .addPost(title, content)
            .spread((result, metadata) => {
                if (config.get('cache.shouldBeUsed')) {
                    blog
                        .POSTS
                        .getAllPostsInfo()
                        .spread((info, metadata) => {
                            cacheUpdate(info, resolve);
                        });
                } else {
                    resolve()
                }
            });
    })
}

module.exports = data;
