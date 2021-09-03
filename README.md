Dialogue, a website where artists can share and discuss their art:
A website which archives artists' work. A user can create and account which will
allow them to post their own art (as jpegs/pngs), and 
upvote/comment on/favorite posted work. The default homepage for both logged in and unlogged 
in visitors will be the top rated/recent posts, but users will also have a favorites
page where they will see posts they've favorited.
Users also have their own pages full of all their posted art

*************************

USER STORIES:
1) I am an aspiring artist. I want to post my art somewhere other artist's can
see it and share their thoughts. I can make a Dialogue account and post images 
of my art as well as a description of each piece. Now I also have a repository/
portfolio of all my work.

2) I am very interested in up-and-coming neo-realist digital artists. Since my interest 
is very niche, I can find artists on Dialogue that are making the kind I like and favorite
to their posts.

3) I am a Dialogue user and art enthusiast. I think user @Xxpicasso_sux69xX is doing
something very new and original and want to let them know. So I leave a comment on their
latest work, "🔥". 

*************************

MODULES/CONCEPTS/RESEARCH TOPICS:
jQuery Upvote: https://www.npmjs.com/package/upvote
	=> A plugin that generates a voting widget like on Stack Overflow or Reddit to vote on art.
	Frontend would be the plugin and then backend would be the comments/art Mongoose Objects. 

Commenting on Art Posts saving comments, upvoting comments, comment chains
	=> Linking everything: Comments and Art Posts as an object which are the properties of an Artist 
	mongoose Schema, Artists and Posts referenced in comments, and comments and artists referenced in 
	Art Posts. Comments can be replied to, allowing the user to create a comment thread to allow for 
	a deeper discussion and analysis. 
