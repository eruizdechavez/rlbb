var main = require('./controllers/main_controller'),
	api = require('./controllers/api_controller');

module.exports = function (app) {
	app.get('/', main.index);
	app.get('/register', main.register);
	app.post('/register', main.saveRegister);
	app.get('/login', main.login);
	app.post('/login', main.saveLogin);
	app.get('/logout', main.logout);
	app.get('/profile', main.inSession, main.profile);

	app.get('/api/users', api.getUsers);
	app.post('/api/users', api.hasEmailPassword, api.userNotPresent, api.postUsers);
	app.post('/api/users/auth', api.hasEmailPassword, api.userExists, api.validEmailPassword, api.auth);

	// app.get('/api/users/:id');
	app.put('/api/users', api.hasEmailToken, api.userExists, api.validEmailToken, api.putUser);
	// app.delete('/api/users/:id');
};
