/****** Script for SelectTopNRows command from SSMS  ******/
select P.[postID] as postId, 
	   P.[Title] as postTitle, 
	   P.[Date] as postCreationDate,
	   PD.[PostBody] as postContent,
	   PD.[detailID] as postDetailId,
	   U1.[Name] as postAuthor,
	   C.[commentContent] as postCommentContent, 
	   C.[Date] as postCommentCreationDate, 
	   C.[commentOwnerID] as postCommentAuthorId,
	   U2.[Name] as postCommentAuthor ,
	   R1.[userID] as postRatingOwnerId,
	   R1.[rate] as postRate,
	   U3.[Name] as postRatingOwner

from	Posts P join PostDetails PD on P.[postId] = PD.[postID]
				join Users U1 on P.[ownerId] = U1.[userID]
				join Comments C on PD.[detailID] = C.[postDetailID] 
				left join Users U2 on C.[commentOwnerID] = U2.[userID]
				left join Rates R1 on P.[postID] = R1.[postID]
				left join Users U3 on R1.[userID] = U3.[userID]; 
