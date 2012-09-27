var main = require('./controllers/main_controller');

module.exports = function (app) {
	app.get('/', main.index);
	app.get('/register', main.register);
	app.post('/register', main.saveRegister);
	app.get('/login', main.login);
	app.post('/login', main.saveLogin);
	app.get('/logout', main.logout);
	app.get('/profile', main.inSession, main.profile);
};
