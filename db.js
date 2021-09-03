const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');

//A dialogue account. Allows the user to subscribe to artists, post their art, and comment on art posts
const UserSchema = new mongoose.Schema({ //each user will have their posted art and comments referenced with them
	username: {type: String, unique: true, required: true},
	email: {type: String, unique: true, required: true},
	password: {type: String, unique: true, required: true},
	art: Array, 
	comments: Array,
	favorites: Array,
	upvotes: Array
});

//An image post made on the page. Can be viewed by anyone, but can only be posted by a user
const ArtSchema = new mongoose.Schema({ //each art post will have its comments and posted user referenced with it
	title: String,
	description: String,
	img: //RESEARCH TOPIC, FILE UPLOAD: MULTER
    {
        data: Buffer,
        contentType: String,
		filename: String
    },
	datePosted: Date,
	milliseconds: Number,
	upvotes: Array,
	artistId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
	comments: Array 
});
ArtSchema.plugin(URLSlugs('title'));

//a comment on an art post. Can be viewed by anyone, but can only be posted by a user
const CommentSchema = new mongoose.Schema({ //each comment will have the art post it was made on and the user that wrote it referenced with it
	commentText: String,
	datePosted: Date,
	upvotes: Array,
	art: {type: mongoose.Schema.Types.ObjectId, ref: 'Art'},
	postedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

mongoose.model('User', UserSchema);
mongoose.model('Art', ArtSchema);
mongoose.model('Comment', CommentSchema);

// is the environment variable, NODE_ENV, set to PRODUCTION? 
let dbconf;
if (process.env.NODE_ENV === 'PRODUCTION') {
 // if we're in PRODUCTION mode, then read the configration from a file
 // use blocking file io to do this...
 const fs = require('fs');
 const path = require('path');
 const fn = path.join(__dirname, 'config.json');
 const data = fs.readFileSync(fn);

 // our configuration file will be in json, so parse it and set the
 // conenction string appropriately!
 const conf = JSON.parse(data);
 dbconf = conf.dbconf;
} else {
 // if we're not in PRODUCTION mode, then use
 dbconf = 'mongodb://localhost/mn2332';
}

mongoose.connect(dbconf);
