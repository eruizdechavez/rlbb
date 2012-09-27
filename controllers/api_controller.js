var crypto = require('crypto'),
	_ = require('underscore');

var users = {};

exports.getUsers = function (req, res, next) {
	return res.send({
		status: 200,
		users: _.toArray(users).map(function (user) {
			return cleanupUser(user);
		})
	});
};

exports.postUsers = function (req, res, next) {
	var user = {
		email: req.body.email,
		password: req.body.password,
		firstName: '',
		lastName: '',
		image: '',
		updated: Date.now(),
		token: ''
	};

	var hash = crypto.createHash('md5');
	user.token = hash.update(JSON.stringify(user), 'utf8').digest('base64');

	users[req.body.email] = user;

	return res.send({
		status: 200,
		user: cleanupUser(user)
	});
};

exports.putUser = function (req, res, next) {
	var newUser = _.extend({}, users[req.body.email], req.body, {
		updated: Date.now(),
		token: req.body.token
	});

	var hash = crypto.createHash('md5');

	users[req.body.email] = newUser;

	return res.send({
		status: 200,
		user: cleanupUser(newUser)
	});
};

exports.auth = function (req, res, next) {
	var user = _.extend({}, users[req.body.email], {
		updated: Date.now(),
		token: ''
	});

	var hash = crypto.createHash('md5');
	user.token = hash.update(JSON.stringify(user), 'utf8').digest('base64');

	users[req.body.email] = user;

	return res.send({
		status: 200,
		token: user.token
	});
};

exports.hasEmailPassword = function (req, res, next) {
	if (!req.body.email || !req.body.password) {
		return res.send({
			message: 'missing fields',
			status: 400
		}, 400);
	}

	return next();
};

exports.hasEmailToken = function (req, res, next) {
	if (!req.body.email || !req.body.token) {
		return res.send({
			message: 'missing fields',
			status: 400
		}, 400);
	}

	return next();
};

exports.userExists = function (req, res, next) {
	if (!users.hasOwnProperty(req.body.email)) {
		return res.send({
			message: 'user not found',
			status: 404
		}, 404);
	}

	return next();
}

exports.userNotPresent = function (req, res, next) {
	if (users.hasOwnProperty(req.body.email)) {
		return res.send({
			message: 'email already exist',
			status: 403
		}, 403);
	}

	return next();
};

exports.validEmailPassword = function (req, res, next) {
	if (users[req.body.email].password !== req.body.password) {
		return res.send({
			message: 'wrong credentials',
			status: 401
		}, 401);
	}

	return next();
};

exports.validEmailToken = function (req, res, next) {
	if (users[req.body.email].token !== req.body.token) {
		return res.send({
			message: 'wrong credentials',
			status: 401
		}, 401);
	}

	return next();
};


function cleanupUser(user) {
	var cleanUser = _.extend({}, user);
	delete cleanUser.updated;
	delete cleanUser.password;
	delete cleanUser.token;

	return cleanUser;
}
