USE [Blog]
GO

/****** Object:  Table [dbo].[Posts]    Script Date: 15.05.2017 10:55:05 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Posts](
	[postID] [int] IDENTITY(1,1) NOT NULL,
	[Title] [varchar](255) NULL,
	[Date] [date] NULL,
	[OwnerID] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[postID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

ALTER TABLE [dbo].[Posts]  WITH CHECK ADD FOREIGN KEY([OwnerID])
REFERENCES [dbo].[Users] ([userID])
GO


