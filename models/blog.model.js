const DB = require('../config/constants'),
  config = require("config");
const dataBase = require('../database/database')(DB.BLOG, config.get("database.login"), config.get("database.password"), config.get("database.options")),
  blog = {
    USERS: {},
    POSTS: {},
    COMMENTS: {},
    RATES: {}
  };

blog.USERS.getUserByCredentials = (username, password) => {
  return dataBase(`SELECT ${DB.columns.BLOG.USERS.USER_ID},
                    ${DB.columns.BLOG.USERS.NAME},
                    ${DB.columns.BLOG.USERS.EMAIL},
                    ${DB.columns.BLOG.USERS.PASSWORD}
            FROM ${DB.tables.BLOG.USERS}
            WHERE ${DB.columns.BLOG.USERS.NAME}='${username}'
                  and ${DB.columns.BLOG.USERS.PASSWORD}='${password}'`);
}

blog.POSTS.addPost = (title, content) => {
  return dataBase(`DECLARE @TranName VARCHAR(20);
            SELECT @TranName = 'AddPost';
            BEGIN TRANSACTION @TranName
                DECLARE @CurrentPostID int;
                INSERT INTO [${DB.tables.BLOG.POSTS}] (${DB.columns.BLOG.POSTS.TITLE},
                   [${DB.columns.BLOG.POSTS.DATE}],
                   ${DB.columns.BLOG.POSTS.OWNER_ID})
                VALUES (
                   '${title}',
                   GETDATE(),
                   ${global.User.id});
                SELECT @CurrentPostID = SCOPE_IDENTITY();
                INSERT INTO [${DB.tables.BLOG.POST_DETAILS}] (${DB.columns.BLOG.POST_DETAILS.POST_ID},
                   ${DB.columns.BLOG.POST_DETAILS.CONTENT})
                VALUES (
                  @CurrentPostID,
                  '${content}'
                );
            COMMIT TRANSACTION @TranName`);
}

blog.POSTS.getCurrentUserLatestPosts = () => {
  return dataBase(`
    SELECT TOP ${DB.POST_NUMBER} ${DB.columns.BLOG.POSTS.TITLE}, ${DB.columns.BLOG.POSTS.POST_ID}
    FROM ${DB.tables.BLOG.POSTS}
    WHERE ${DB.columns.BLOG.POSTS.OWNER_ID} = ${global.User.id}
    ORDER BY ${DB.columns.BLOG.POSTS.DATE} DESC`);
}

blog.POSTS.getOtherUsersLatestPosts = () => {
  return dataBase(`
    SELECT TOP ${DB.POST_NUMBER} ${DB.columns.BLOG.POSTS.TITLE}, ${DB.columns.BLOG.POSTS.POST_ID}, ${DB.columns.BLOG.USERS.NAME}
    FROM ${DB.tables.BLOG.POSTS}, ${DB.tables.BLOG.USERS}
    WHERE ${DB.columns.BLOG.POSTS.OWNER_ID} <> ${global.User.id}
    and ${DB.columns.BLOG.POSTS.OWNER_ID} = ${DB.columns.BLOG.USERS.USER_ID}
    ORDER BY ${DB.columns.BLOG.POSTS.DATE} DESC`);
}

blog.POSTS.getPostById = (id) => {
  return dataBase(`
      SELECT ${DB.columns.BLOG.POSTS.TITLE}, ${DB.columns.BLOG.POSTS.DATE}, ${DB.columns.BLOG.POST_DETAILS.CONTENT}, ${DB.columns.BLOG.POST_DETAILS.DETAIL_ID}, ${DB.columns.BLOG.USERS.NAME}
      FROM ${DB.tables.BLOG.POSTS}, ${DB.tables.BLOG.POST_DETAILS}, ${DB.tables.BLOG.USERS}
      WHERE ${DB.tables.BLOG.POSTS}.${DB.columns.BLOG.POSTS.POST_ID} = ${id}
      and ${DB.tables.BLOG.POST_DETAILS}.${DB.columns.BLOG.POST_DETAILS.POST_ID} = ${id}
      and ${DB.tables.BLOG.POSTS}.${DB.columns.BLOG.POSTS.OWNER_ID} = ${DB.columns.BLOG.USERS.USER_ID}`);
}

blog.POSTS.getAllPostsInfo = () => {
  return dataBase(`
    SELECT P.[${DB.columns.BLOG.POSTS.POST_ID}] as postId,
           P.[${DB.columns.BLOG.POSTS.TITLE}] as postTitle,
           P.[${DB.columns.BLOG.POSTS.DATE}] as postCreationDate,
           P.[${DB.columns.BLOG.POSTS.OWNER_ID}] as postAuthorId,
           PD.[${DB.columns.BLOG.POST_DETAILS.CONTENT}] as postContent,
           PD.[${DB.columns.BLOG.POST_DETAILS.DETAIL_ID}] as postDetailId,
           U1.[${DB.columns.BLOG.USERS.NAME}] as postAuthor,
           C.[${DB.columns.BLOG.COMMENTS.COMMENT_CONTENT}] as postCommentContent,
           C.[${DB.columns.BLOG.COMMENTS.DATE}] as postCommentCreationDate,
           C.[${DB.columns.BLOG.COMMENTS.COMMENT_OWNER_ID}] as postCommentAuthorId,
           U2.[${DB.columns.BLOG.USERS.NAME}] as postCommentAuthor,
           AVG(R1.[${DB.columns.BLOG.RATES.RATE}]) as postRate, 
           (SELECT ${DB.tables.BLOG.RATES}.[${DB.columns.BLOG.RATES.RATE}] FROM ${DB.tables.BLOG.RATES} WHERE ${DB.tables.BLOG.RATES}.[${DB.columns.BLOG.RATES.POST_ID}] = P.[${DB.columns.BLOG.POSTS.POST_ID}] and ${DB.tables.BLOG.RATES}.[${DB.columns.BLOG.RATES.USER_ID}] = ${global.User.id}) as currentUsersRate    
    FROM ${DB.tables.BLOG.POSTS} P join ${DB.tables.BLOG.POST_DETAILS} PD on P.[${DB.columns.BLOG.POSTS.POST_ID}] = PD.[${DB.columns.BLOG.POST_DETAILS.POST_ID}]
                                   join ${DB.tables.BLOG.USERS} U1 on P.[${DB.columns.BLOG.POSTS.OWNER_ID}] = U1.[${DB.columns.BLOG.USERS.USER_ID}]
                                   left join ${DB.tables.BLOG.COMMENTS} C on PD.[${DB.columns.BLOG.POST_DETAILS.DETAIL_ID}] = C.[${DB.columns.BLOG.COMMENTS.POST_DETAIL_ID}]
                                   left join ${DB.tables.BLOG.USERS} U2 on C.[${DB.columns.BLOG.COMMENTS.COMMENT_OWNER_ID}] = U2.[${DB.columns.BLOG.USERS.USER_ID}]
                                   left join ${DB.tables.BLOG.RATES} R1 on P.[${DB.columns.BLOG.POSTS.POST_ID}] = R1.[${DB.columns.BLOG.RATES.POST_ID}]
                                   GROUP BY P.[${DB.columns.BLOG.POSTS.POST_ID}],
                                   P.[${DB.columns.BLOG.POSTS.TITLE}], 
                                   P.[${DB.columns.BLOG.POSTS.DATE}], 
                                   P.[${DB.columns.BLOG.POSTS.OWNER_ID}],
                                   PD.[${DB.columns.BLOG.POST_DETAILS.CONTENT}], 
                                   PD.[${DB.columns.BLOG.POST_DETAILS.DETAIL_ID}], 
                                   U1.[${DB.columns.BLOG.USERS.NAME}], 
                                   C.[${DB.columns.BLOG.COMMENTS.COMMENT_CONTENT}], 
                                   C.[${DB.columns.BLOG.COMMENTS.DATE}], 
                                   C.[${DB.columns.BLOG.COMMENTS.COMMENT_OWNER_ID}], 
                                   U2.[${DB.columns.BLOG.USERS.NAME}]`);

}

blog.COMMENTS.getCommentsForPostByDetailId = (id) => {
  return dataBase(`
      SELECT ${DB.columns.BLOG.COMMENTS.COMMENT_CONTENT}, ${DB.columns.BLOG.COMMENTS.DATE}, ${DB.columns.BLOG.USERS.NAME}
      FROM ${DB.tables.BLOG.COMMENTS}, ${DB.tables.BLOG.USERS}
      WHERE ${DB.tables.BLOG.COMMENTS}.${DB.columns.BLOG.COMMENTS.POST_DETAIL_ID} = ${id}
      and ${DB.columns.BLOG.COMMENTS.COMMENT_OWNER_ID} = ${DB.columns.BLOG.USERS.USER_ID}`);
}

blog.COMMENTS.addComment = (comment, ownerId, detailId) => {
  return dataBase(`
      INSERT INTO ${DB.tables.BLOG.COMMENTS} (${DB.columns.BLOG.COMMENTS.COMMENT_CONTENT},
       ${DB.columns.BLOG.COMMENTS.DATE},
       ${DB.columns.BLOG.COMMENTS.COMMENT_OWNER_ID},
       ${DB.columns.BLOG.COMMENTS.POST_DETAIL_ID})
      VALUES ('${comment}', GETDATE(),${ownerId},${detailId})`);
}

blog.RATES.setRate = (rate, postId, userId) => {
  return dataBase(`
    INSERT INTO ${DB.tables.BLOG.RATES} (${DB.columns.BLOG.RATES.RATE},
    ${DB.columns.BLOG.RATES.POST_ID},
    ${DB.columns.BLOG.RATES.USER_ID})
    VALUES (${rate},${postId},${userId})`);
}

blog.RATES.getCurrentUsersRate = (postId, userId) => {
  return dataBase(`
    SELECT ${DB.columns.BLOG.RATES.RATE}
    FROM ${DB.tables.BLOG.RATES}
    WHERE ${DB.tables.BLOG.RATES}.${DB.columns.BLOG.RATES.POST_ID} = ${postId}
    and ${DB.tables.BLOG.RATES}.${DB.columns.BLOG.RATES.USER_ID} = ${userId}`);
}

module.exports = blog;

// blog.USERS.getUserByFacebookId = (id) => {   return dataBase(`SELECT
// userID,Name, facebookId FROM Users WHERE facebookId='${id}'`); }
//
// blog.USERS.addNewFacebookUser = (facebookId) => {   dataBase(`INSERT INTO
// Users (facebookId) VALUES (${facebookId})`); }