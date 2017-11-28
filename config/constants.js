exports.BLOG = "Blog";

exports.tables = {
  BLOG: {
    USERS: "Users",
    POSTS: "Posts",
    POST_DETAILS: "PostDetails",
    COMMENTS: "Comments",
    RATES: "Rates"
  }
}

exports.columns = {
  BLOG: {
    USERS: {
      USER_ID: 'UserID',
      NAME: 'Name',
      EMAIL: 'Email',
      PASSWORD: 'Password'
    },
    POSTS: {
      POST_ID: 'PostID',
      TITLE: 'Title',
      DATE: 'Date',
      OWNER_ID: 'OwnerID'
    },
    POST_DETAILS: {
      DETAIL_ID: 'PostDetailID',
      POST_ID: 'PostID',
      CONTENT: 'PostBody'
    },
    COMMENTS: {
      COMMENT_ID: 'CommentID',
      COMMENT_CONTENT: 'CommentContent',
      DATE: 'Date',
      COMMENT_OWNER_ID: 'CommentOwnerID',
      POST_DETAIL_ID: 'PostDetailId'
    },
    RATES: {
      RATE_ID: "RateID",
      POST_ID: "PostID",
      USER_ID: "UserID",
      RATE: "Rate"
    }
  }
}

exports.POST_NUMBER = 20;

exports.POST_MODEL = {
  POST_ID: "postId",
  POST_TITLE: "postTitle",
  POST_CREATION_DATE: "postCreationDate",
  POST_CONTENT: "postContent",
  POST_DETAIL_ID: "postDetailId",
  POST_AUTHOR: "postAuthor",
  POST_AUTHOR_ID: "postAuthorId",
  POST_COMMENT_CONTENT: "postCommentContent",
  POST_COMMENT_CREATION_DATE: "postCommentCreationDate",
  POST_COMMENT_AUTHOR_ID: "postCommentAuthorId",
  POST_COMMENT_AUTHOR: "postCommentAuthor",
  POST_RATING_OWNER_ID: "postRatingOwnerId",
  POST_RATING_OWNER_NAME: "postRatingOwnerName",
  POST_RATE: "postRate",
  CURRENT_USERS_RATE: "currentUsersRate"
}

exports.CACHE = {
  STORAGE:{
    APP_DATA:"appData"
  },
  EVENTS:{
    UPDATE_DATA:"update-data"
  }
};