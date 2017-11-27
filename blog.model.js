//blog.POSTS.getCurrentUserLatestPosts = () => {
// return dataBase(`     SELECT TOP ${DB.POST_NUMBER}
// ${DB.columns.BLOG.POSTS.TITLE}, ${DB.columns.BLOG.POSTS.POST_ID}     FROM
// ${DB.tables.BLOG.POSTS}     WHERE ${DB.columns.BLOG.POSTS.OWNER_ID} =
// ${global.User.id}     ORDER BY ${DB.columns.BLOG.POSTS.DATE} DESC`); }
// blog.POSTS.getOtherUsersLatestPosts = () => {   return dataBase(`     SELECT
// TOP ${DB.POST_NUMBER} ${DB.columns.BLOG.POSTS.TITLE},
// ${DB.columns.BLOG.POSTS.POST_ID}, ${DB.columns.BLOG.USERS.NAME}     FROM
// ${DB.tables.BLOG.POSTS}, ${DB.tables.BLOG.USERS}     WHERE
// ${DB.columns.BLOG.POSTS.OWNER_ID} <> ${global.User.id}     and
// ${DB.columns.BLOG.POSTS.OWNER_ID} = ${DB.columns.BLOG.USERS.USER_ID} ORDER BY
// ${DB.columns.BLOG.POSTS.DATE} DESC`); } 
// blog.COMMENTS.getCommentsForPostByDetailId = (id) => {   return dataBase(`
// SELECT ${DB.columns.BLOG.COMMENTS.COMMENT_CONTENT},
// ${DB.columns.BLOG.COMMENTS.DATE}, ${DB.columns.BLOG.USERS.NAME}       FROM
// ${DB.tables.BLOG.COMMENTS}, ${DB.tables.BLOG.USERS}       WHERE
// ${DB.tables.BLOG.COMMENTS}.${DB.columns.BLOG.COMMENTS.POST_DETAIL_ID} = ${id}
//       and ${DB.columns.BLOG.COMMENTS.COMMENT_OWNER_ID} =
// ${DB.columns.BLOG.USERS.USER_ID}`); } blog.RATES.getCurrentUsersRate = (postId, userId) => {   return dataBase(`
// SELECT ${DB.columns.BLOG.RATES.RATE}     FROM ${DB.tables.BLOG.RATES} WHERE
// ${DB.tables.BLOG.RATES}.${DB.columns.BLOG.RATES.POST_ID} = ${postId}  and
// ${DB.tables.BLOG.RATES}.${DB.columns.BLOG.RATES.USER_ID} = ${userId}`); }