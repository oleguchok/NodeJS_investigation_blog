const Posts = require('../models/').Posts,
    PostDetails = require('../models/').PostDetails,
    cache = require('../config/cache.js'),
    { POST_MODEL, CACHE } = require('../config/constants'),
    config = require('../config/config.js')[process.env.NODE_ENV];

function getAllPostsInfo() {
    return Posts.findAll();
};

function getProfileInfo() {
    function createResponseOptions(result) {
        return {
            myPostsCollection: getCurrentUsersPosts(result),
            otherPostsCollection: getOtherUsersPosts(result)
        }
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
                                resolve(createResponseOptions(result));
                            });
                    } else {
                        resolve(createResponseOptions(JSON.parse(result)));
                    }
                })
        } else {
            getAllPostsInfo()
                .then((result) => {
                    resolve(createResponseOptions(result));
                });
        }
    });
};

function addPost(title, content) {

    return new Promise((resolve, reject) => {
        Posts.create({
            Title: title,
            Date: new Date(),
            PostDetail: {
                PostBody: content
            }
        }, {
            include: [ PostDetails ]
        }).then((result) => {
            if (config.cache.shouldBeUsed) {
                getAllPostsInfo()
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

function getCurrentUsersPosts(posts) {
    let cachedIds = {},
        currentUsersPosts = posts.filter((item) => {
            if (!cachedIds[JSON.stringify(item[POST_MODEL.POST_ID])]) {
                cachedIds[JSON.stringify(item[POST_MODEL.POST_ID])] = true;
                return item[POST_MODEL.POST_AUTHOR_ID] === global.User.id;
            }
            return;
        });
    return currentUsersPosts.map((item) => {
        return {
            postId: item[POST_MODEL.POST_ID],
            Title: item[POST_MODEL.POST_TITLE]
        }
    });
};

function getOtherUsersPosts(posts) {
    let cachedIds = {},
        otherUsersPosts = posts.filter((item) => {
            if (!cachedIds[JSON.stringify(item[POST_MODEL.POST_ID])]) {
                cachedIds[JSON.stringify(item[POST_MODEL.POST_ID])] = true;
                return item[POST_MODEL.POST_AUTHOR_ID] !== global.User.id;
            }
            return;
        });
    return otherUsersPosts.map((item) => {
        return {
            postId: item[POST_MODEL.POST_ID],
            Title: item[POST_MODEL.POST_TITLE],
            Name: item[POST_MODEL.POST_AUTHOR]
        }
    });
};

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
    addPost: addPost,
    getCurrentUsersPosts: getCurrentUsersPosts,
    getProfileInfo: getProfileInfo
}