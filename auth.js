const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = mongoose.model('User');

function register(username, email, password, errorCallback, successCallback) {
	if(username.length >= 8 && password.length >= 8){
		User.findOne({username: username}, (err, user) => {
			if(!err && !user){
				bcrypt.hash(password, 10, function(err, hash){
					if(!err){
						const tempUser = new User({
							'username': username,
							'email': email,
							'password': hash,
                            'art': [],
                            'comments': []
						});
						tempUser.save(function (err) {
							if (!err){
								successCallback(tempUser);
							}
							else{
								errorCallback({'message': 'DOCUMENT SAVE ERROR'});
							}
						});
					}
					else{
						errorCallback({'message': 'PASSWORD HASH ERROR'});
					}
					
				});				
			}
			else if(err){
					errorCallback({'message': err});
				}
			else{
				errorCallback({'message': 'USERNAME ALREADY EXISTS'});
			}
		});
	}
	else{
		errorCallback({'message': 'USERNAME PASSWORD TOO SHORT'});
	}
	
}

function login(username, password, errorCallback, successCallback) {
	User.findOne({username: username}, (err, user, count) => {
		if (!err && user) {
			bcrypt.compare(password, user.password, (err, passwordMatch) => {
				if(passwordMatch){
					successCallback(user);
				}
				else{
					errorCallback({'message': 'PASSWORDS DO NOT MATCH'});
				}
			});
		}
		else{
			errorCallback({'message': 'USER NOT FOUND'});
		}
	});
}

function startAuthenticatedSession(req, user, cb) {
	console.log(req.session);
	req.session.regenerate((err) => {
		if (!err) {
			req.session.user = user;
		} 
		else {
			console.log(err);
		}
		cb();
	});
}

module.exports = {
  startAuthenticatedSession: startAuthenticatedSession,
  register: register,
  login: login
};


