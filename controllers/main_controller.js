var users = {};

exports.inSession = function (req, res, next) {
	if (req.session && req.session.userId) {
		return next();
	}

	return res.send('error');
};

exports.index = function (req, res, next) {
	res.render('index');
};

exports.register = function (req, res, next) {
	res.render('form', {button:'Register'});
};

exports.saveRegister = function (req, res, next) {
	if (!req.body.email || !req.body.password) {
		return res.send('error');
	}

	if (users.hasOwnProperty(req.body.email)) {
		return res.send('error');
	}

	users[req.body.email] = {
		userId: req.body.email,
		email: req.body.email,
		password: req.body.password,
		firstName: '',
		lastName: '',
		pic: ''
	};

	req.session.userId = req.body.email;

	res.redirect('/profile');
};

exports.login = function (req, res, next) {
	res.render('form', {button:'Login'});
};

exports.saveLogin = function (req, res, next) {
	if (!req.body.email || !req.body.password) {
		return res.send('error');
	}

	if (!users.hasOwnProperty(req.body.email) || users[req.body.email].password != req.body.password) {
		return res.send('error');
	}

	req.session.userId = req.body.email;

	res.redirect('/profile');
};

exports.logout = function (req, res, next) {
	delete req.session.userId;
	res.redirect('/');
};

exports.profile = function (req, res, next) {
	res.send('profile');
};
