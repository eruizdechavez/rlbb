var crypto = require('crypto'),
	_ = require('underscore');

var users = {};

function cleanupUser(user) {
	var cleanUser = _.extend({}, user);
	delete cleanUser.updated;
	delete cleanUser.password;
	delete cleanUser.token;

	var hash = crypto.createHash('md5');
	cleanUser.image = hash.update(user.email, 'utf8').digest('hex');


	return cleanUser;
}

exports.getUsers = function (req, res, next) {
	return res.send({
		status: 200,
		users: _.toArray(users).map(function (user) {
			return cleanupUser(user);
		})
	});
};

exports.getUser = function (req, res, next) {
	if (req.params.id === undefined) {
		req.params.id = req.request.email;
	}

	if (!users.hasOwnProperty(req.params.id)) {
		return res.send({
			status: 404,
			message: 'user not found'
		});
	}

	return res.send({
		status: 200,
		user: cleanupUser(users[req.params.id])
	});
};

exports.deleteUser = function (req, res, next) {
	delete users[req.request.email];

	return res.send({
		status: 200
	});
};

exports.postUsers = function (req, res, next) {
	var user = {
		email: req.request.email,
		password: req.request.password,
		firstName: '',
		lastName: '',
		updated: Date.now(),
		token: ''
	};

	var hash = crypto.createHash('md5');
	user.token = hash.update(JSON.stringify(user), 'utf8').digest('hex');

	users[req.request.email] = user;

	return res.send({
		status: 200,
		user: cleanupUser(user)
	});
};

exports.putUser = function (req, res, next) {
	var newUser = _.extend({}, users[req.request.email], req.request, {
		updated: Date.now(),
		token: req.request.token
	});

	var hash = crypto.createHash('md5');

	users[req.request.email] = newUser;

	return res.send({
		status: 200,
		user: cleanupUser(newUser)
	});
};

exports.auth = function (req, res, next) {
	var user = _.extend({}, users[req.request.email], {
		updated: Date.now(),
		token: ''
	});

	var hash = crypto.createHash('md5');
	user.token = hash.update(JSON.stringify(user), 'utf8').digest('hex');

	users[req.request.email] = user;

	return res.send({
		status: 200,
		user: cleanupUser(user),
		token: user.token
	});
};

exports.hasEmailPassword = function (req, res, next) {
	if (!req.request.email || !req.request.password) {
		return res.send({
			message: 'missing fields',
			status: 400
		});
	}

	return next();
};

exports.hasEmailToken = function (req, res, next) {
	if (!req.request.email || !req.request.token) {
		return res.send({
			message: 'missing fields',
			status: 400
		});
	}

	return next();
};

exports.userExists = function (req, res, next) {
	if (!users.hasOwnProperty(req.request.email)) {
		return res.send({
			message: 'user not found',
			status: 404
		});
	}

	return next();
};

exports.userNotPresent = function (req, res, next) {
	if (users.hasOwnProperty(req.request.email)) {
		return res.send({
			message: 'email already exist',
			status: 403
		});
	}

	return next();
};

exports.validEmailPassword = function (req, res, next) {
	if (users[req.request.email].password !== req.request.password) {
		return res.send({
			message: 'wrong credentials',
			status: 401
		});
	}

	return next();
};

exports.validEmailToken = function (req, res, next) {
	if (users[req.request.email].token !== req.request.token) {
		return res.send({
			message: 'wrong credentials',
			status: 401
		});
	}

	return next();
};

exports.request = function (req, res, next) {
	if (!req.request) {
		req.request = _.extend({}, req.query, req.body);
	}

	next();
};

