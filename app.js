const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const db = require('./db');
const Handlebars = require('handlebars');
const exphbs = require('express-handlebars');
const path = require('path');
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });
const auth = require('./auth.js');
var fs = require('fs');
const app = express();
const Art = mongoose.model('Art');
const Comment = mongoose.model('Comment');
const User = mongoose.model('User');
let s = undefined;

app.engine('hbs', exphbs({
    defaultLayout: path.join(__dirname, '/views/layout'),
    extname: '.hbs',
}));
app.set('view engine', 'hbs');
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads'));
app.use((req, res, next) => {
	if(s !== undefined){
		res.locals.user = {
            'username': s.user.username,
            '_id': s.user._id
        }
	}
	next();
});
app.use(session({
    secret: 'add session secret here!',
    resave: false,
    saveUninitialized: true,
}));

app.get('/', (req, res) => {
	res.redirect('/home');
});

app.get('/home', (req, res) => {
    let recent = false;
    let param = {};
    if(req.query.filter === 'recent'){
        recent = true;
    }
    if(req.query.filter === 'favorites'){
        param = {_id: {$in: s.user.favorites}};
    }
    if(req.query.filter === 'user'){
        param = {'artistId': req.query.user};
    }
    let posts = [];
    Art.find(param, function(err, result){
        if(!err && result.length > 0){
            const total = result.length;
            result.forEach(art => {
                const comments = [];
                Comment.find({'_id': {$in:art.comments}}, function(err, result){
                    for(let i = 0; i < result.length; i++){
                        const datePosted = String(result[i].datePosted).split(' ');
                        User.findById(result[i].postedBy, function(err, user){
                            comments.push({
                                commentText: result[i].commentText,
                                postedBy: user.username,
                                posterId: user._id,
                                datePosted: (datePosted[2] + " " + datePosted[1] + " " + datePosted[3]),
                                upvotes: result[i].upvotes
                            });
                        });  
                    }
                    const datePosted = String(art.datePosted).split(' ');
                    User.findOne({'_id': art.artistId}, function(err, artist){
                        posts.push({
                            img: art.img,
                            title: art.title,
                            milliseconds: art.milliseconds,
                            date: (datePosted[2] + " " + datePosted[1] + " " + datePosted[3]),
                            upvotes: art.upvotes.length,
                            comments: comments,
                            artist: artist.username,
                            artistId: art.artistId,
                            _id: art._id
                        });
                        if(posts.length === total){
                            if(recent){
                                const sorted = posts.sort(function(first, second){
                                    if(first.milliseconds > second.milliseconds){
                                        return -1;
                                    }
                                    else{
                                        return 1;
                                    }
                                });
                                res.render('home', {'art': sorted});
                            }
                            else{
                                const sorted = posts.sort(function(first, second){
                                    if(first.upvotes > second.upvotes){
                                        return -1;
                                    }
                                    else{
                                        return 1;
                                    }
                                });
                                res.render('home', {'art': sorted});
                            }
                            
                        }
                    });                    
                });  
            });        
        }
        else{
            res.render('home');
        }
    });	
});

app.get('/login', (req, res) => {
	res.render('login');
});

app.post('/login', (req, res) => {
	const body = req.body;
	function success(user){
		auth.startAuthenticatedSession(req, user, function cb(){
			s = req.session;
			res.redirect('/home');
		});
	}
	function error(message){
		res.render('login', {'message': message.message});
	}
	auth.login(body.username, body.password, error, success);
});

app.get('/register', (req, res) => {
	res.render('register');
});

app.post('/register', (req, res) => {
	const body = req.body;
	function success(user){
		auth.startAuthenticatedSession(req, user, function cb(){
			s = req.session;
			res.redirect('/home');
		});
	}
	function error(message){
		res.render('register', {'message': message.message});
	}
	auth.register(body.username, body.email, body.password, error, success);
});
    
app.get('/art/upload', (req, res) => {
    if(s !== undefined){
        res.render('post'); 
    }
    else{
        res.redirect('/login');
    }
});

app.post('/art/upload', upload.single('art'), (req, res) => {
    const body = req.body;
    const art = new Art({
        img: {//RESEARCH TOPIC, FILE UPLOAD: MULTER
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: 'image/png',
            filename: path.join('/uploads/' + req.file.filename)
        },
        title: body.title,
        datePosted: new Date().toJSON().slice(0,10).replace(/-/g,'/'),
        milliseconds: parseInt(new Date().getDate()),
        upvotes: [],
        _id: mongoose.Types.ObjectId(),
        artistId: s.user._id,
        comments: []
    });
    art.save((err, result) => {
        if(!err){
            User.findByIdAndUpdate(s.user._id, {
                "$push": {
                    art: result._id
                }
                }, {
                    "new": true
                },
                (err, docs) => {
                    if (err) {
                        console.log(err);
                        res.redirect('/home');
                    }
                    else{
                        res.redirect('/home');
                    }
                }
            );
        }
        else{
            console.log(err)
            res.redirect('/');
        }
    });
});

app.post('/comment/:id/', (req, res) => {
    const comment = new Comment({
        commentText: req.body.commentText,
        datePosted: new Date().toJSON().slice(0,10).replace(/-/g,'/'),
        upvotes: 1,
        art: req.params["id"].split(':')[1],
        postedBy: s.user._id
    });
    comment.save((err, com) => {
        if(!err){
            Art.findByIdAndUpdate(req.params["id"].split(':')[1], {
                "$push": {
                    comments: comment._id
                }
                }, {
                    "new": true
                },
                (err, docs) => {
                    if (err) {
                        console.log(err);
                        res.json({
                            "error": err
                        });
                    }
                    else{
                        res.json({
                            "message": "Change was successful",
                            "docs": com,
                        });
                    }
                }
            );
        }
        else{
            res.json({'error': err});
        }
    });
});

app.post('/upvote/:id', function(req, res){
    if(s !== undefined){
        Art.findOne({'_id': req.params["id"].split(':')[1]}, function(err, result){
            if(!err){
                if(!result.upvotes.includes(s.user.id)){
                    Art.findByIdAndUpdate(req.params["id"].split(':')[1], {
                        "$push": {
                            upvotes: s.user._id
                        }
                        }, {
                            "new": true
                        },
                        (err, docs) => {
                            if (err) {
                                console.log(err);
                                res.json({
                                    "error": err
                                });
                            }
                            else{
                                User.findByIdAndUpdate(s.user._id, {
                                    "$push": {
                                        upvotes: req.params["id"].split(':')[1]
                                    }
                                    }, {
                                        "new": true
                                    },
                                    (err, docs) => {
                                        if (err) {
                                            console.log(err);
                                            res.json({
                                                "error": err
                                            });
                                        }
                                        else{
                                            res.json({
                                                "message": "Change was successful",
                                            });
                                        }
                                    }
                                );
                                
                            }
                        }
                    );
                }
            }
        });
    }
    else{
        res.json({
            "error": 'must be logged in to upvote'
        });
    }
});

app.post('/favorite/:id', function(req, res){
    if(s !== undefined){
        Art.findOne({'_id': req.params["id"].split(':')[1]}, function(err, result){
            if(!err){
                if(!s.user.favorites.includes(result._id)){
                    s.user.favorites.push(result._id);
                    User.findByIdAndUpdate(s.user._id, {
                        "$push": {
                            favorites: result._id
                        }
                        }, {
                            "new": true
                        },
                        (err, docs) => {
                            if (err) {
                                console.log(err);
                                res.json({
                                    "error": err
                                });
                            }
                            else{
                                res.json({
                                    "message": "Change was successful",
                                });
                            }
                        }
                    );
                }
                else{
                    res.json({
                        "error": 'already in favorites'
                    });
                }
            }
        });
    }
    else{
        res.json({
            "error": 'must be a user to favorite'
        });
    }
});

app.get('/u/:id', function(req, res){
    User.findById(req.params["id"].split(':')[1], function(err, user){
        if(!err){
            res.json({
                'user': user
            });
        }
        else{
            res.json({
                "error": err
            });
        }
    })
});

// app.connect(10885);
app.listen(process.env.PORT || 3000);