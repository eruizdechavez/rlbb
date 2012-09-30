(function () {
	// Application's namespace
	window.rlbb = {};

	// Main View class. Controlls all events and behaviors of the application.
	var MainView = Backbone.View.extend({

		CLASS_LOG_IN: 'in',
		CLASS_LOG_OUT: 'out',
		PROFILE_IMAGE_PREPEND: 'http://www.gravatar.com/avatar/',
		PROFILE_IMAGE_APPEND: '?d=identicon&s=100',
		STORAGE_EMAIL: 'rlbb.email',
		STORAGE_TOKEN: 'rlbb.token',
		SERVICE_URL: '/api/users',
		SERVICE_URL_AUTH: '/api/users/auth',
		SERVICE_URL_ME: '/api/users/me',

		// A User Model instance
		user: null,

		// A State Model Instance
		state: null,

		// All our view events
		events: {
			'click .nav-link.register': 'registerModal',
			'click .nav-link.login': 'loginModal',
			'click .nav-link.profile': 'profileModal',
			'click .nav-link.cancel': 'cancelModal',
			'click .nav-link.logout': 'logout',
			'click .btn.register': 'register',
			'click .btn.inline-register': 'inlineRegister',
			'click .btn.login': 'login',
			'click .btn.inline-login': 'inlineLogin',
			'click .btn.profile-save': 'profileSave',
			'click .btn.cancel-account': 'cancelAccount'
		},

		// View's contructor.
		// Initialize event listeners, and update DOM elements state.
		initialize: function () {
			_.bindAll(this);
			this.user = this.options.user;
			this.state = this.options.state;

			this.state.on('change', this.updateState);
			this.user.on('change', this.updateUser);
			this.recoverState();
			this.updateState();
		},

		recoverState: function () {
			if (localStorage && localStorage.getItem(this.STORAGE_EMAIL) && localStorage.getItem(this.STORAGE_TOKEN)) {
				this.getUser(localStorage.getItem(this.STORAGE_EMAIL), localStorage.getItem(this.STORAGE_TOKEN), this.recoverStateSuccess);
			}
		},

		recoverStateSuccess: function (data) {
			switch (data.status) {
			case 200:
				this.loginSuccess({
					status: 200,
					user: data.user,
					token: localStorage.getItem(this.STORAGE_TOKEN)
				});
				break;

			default:
				this.logout();
				break;
			}
		},

		// Toggle DOM elements based on application state.
		updateState: function () {
			var className = this.state.get('loggedIn') ? this.CLASS_LOG_OUT : this.CLASS_LOG_IN;

			if (className === this.CLASS_LOG_IN) {
				this.$('.premium').hide();
				this.$('.nav-link.in').hide();
				this.$('.nav-link.out').show();
			} else {
				this.$('.premium').show();
				this.$('.nav-link.in').show();
				this.$('.nav-link.out').hide();
			}

			this.$('.modal-dialog').modal('hide');
		},

		// Update User's DOM references upon model change.
		updateUser: function () {
			this.$('.first-name').text(this.user.get('firstName'));
			this.$('.profile-image').attr('src', this.PROFILE_IMAGE_PREPEND + this.user.get('image') + this.PROFILE_IMAGE_APPEND);
		},

		// Open Registration modal.
		registerModal: function () {
			this.$('#register-email, #register-password').val('');
			this.$('#register-modal .alert').addClass('hide');
			this.$('#register-modal').modal();
		},

		// Open Registration modal from Login Modal.
		inlineRegister: function () {
			this.$('.modal-dialog').modal('hide');
			this.$('.nav-link.register').trigger('click');

			this.$('#register-email').val(this.$('#login-email').val());
			this.$('#register-password').val(this.$('#login-password').val());
		},

		// Execute Registration service.
		register: function () {
			this.$('#register-modal .alert').addClass('hide');

			$.ajax({
				url: this.SERVICE_URL,
				type: 'post',
				data: {
					email: this.$('#register-email').val(),
					password: this.$('#register-password').val()
				},
				success: this.registerSuccess
			});
		},

		// Handle Registration service response.
		// 200 - Everything is good, proceed to login
		// 400 - Bad Request; Fields are missing
		// 403 - Forbidden; Email already exists (try to login?)
		registerSuccess: function (data) {
			switch (data.status) {
			case 200:
				this.auth(this.$('#register-email').val(), this.$('#register-password').val(), this.loginSuccess, this.registerError);
				break;

			case 400:
				this.$('#register-modal .alert.missing').removeClass('hide');
				break;

			case 403:
				this.$('#register-modal .alert.duplicated').removeClass('hide');
				break;
			}
		},

		// Open Login modal.
		loginModal: function () {
			this.$('#login-email, #login-password').val('');
			this.$('#login-modal .alert').addClass('hide');
			this.$('#login-modal').modal();
		},

		// Open Login modal from Registration modal.
		inlineLogin: function () {
			this.$('.modal-dialog').modal('hide');
			this.$('.nav-link.login').trigger('click');

			this.$('#login-email').val(this.$('#register-email').val());
			this.$('#login-password').val(this.$('#register-password').val());
		},

		// Execute Login service
		login: function () {
			this.$('#login-modal .alert').addClass('hide');
			this.auth(this.$('#login-email').val(), this.$('#login-password').val(), this.loginSuccess, this.loginError);
		},

		// Handle Login service response.
		// 200 - Everything is good
		// 400 - Bad Request; Fields are missing
		// 401 - Unauthorized; Wrong email or password
		// 404 - Not Found; Email not found (try to register?)
		loginSuccess: function (data) {
			switch (data.status) {
			case 200:
				this.user.set(_.extend({}, data.user, {
					token: data.token
				}));

				this.state.set('loggedIn', true);

				if (localStorage) {
					localStorage.setItem(this.STORAGE_EMAIL, this.user.get('email'));
					localStorage.setItem(this.STORAGE_TOKEN, this.user.get('token'));
				}

				break;

			case 400:
				this.$('#login-modal .alert.missing').removeClass('hide');
				break;

			case 401:
				this.$('#login-modal .alert.wrong').removeClass('hide');
				break;

			case 404:
				this.$('#login-modal .alert.not-found').removeClass('hide');
				break;
			}
		},

		// Authorization service request. Used on registration and login process.
		auth: function (email, password, success) {
			$.ajax({
				url: this.SERVICE_URL_AUTH,
				type: 'post',
				data: {
					email: email,
					password: password
				},
				success: success
			});
		},

		getUser: function (email, token, success) {
			$.ajax({
				url: this.SERVICE_URL_ME,
				data: {
					email: email,
					token: token
				},
				success: success
			});
		},

		// Logout current user.
		// Set an empty model instead of create a new one to avoid loosing
		// event bindings.
		// Set state to not logged in.
		logout: function () {
			if (localStorage) {
				localStorage.removeItem(this.STORAGE_EMAIL);
				localStorage.removeItem(this.STORAGE_TOKEN);
			}

			var empty = new UserModel();
			this.user.set(empty.toJSON());

			this.state.set('loggedIn', false);
		},

		// Open Profile (Settings) Modal
		profileModal: function () {
			this.$('#profile-first-name').val(this.user.get('firstName'));
			this.$('#profile-last-name').val(this.user.get('lastName'));
			this.$('#profile-image').val(this.user.get('image'));

			this.$('#profile-modal').modal();
		},

		profileSave: function () {
			$.ajax({
				url: this.SERVICE_URL_ME,
				type: 'put',
				data: {
					email: this.user.get('email'),
					token: this.user.get('token'),
					firstName: this.$('#profile-first-name').val(),
					lastName: this.$('#profile-last-name').val()
				},
				success: this.profileSaveSuccess
			});
		},

		profileSaveSuccess: function (data) {
			this.user.set(data.user);
			this.state.trigger('change');
		},

		cancelModal: function () {
			this.$('#cancel-modal').modal();
		},

		cancelAccount: function () {
			$.ajax({
				url: this.SERVICE_URL_ME,
				type: 'delete',
				data: {
					email: this.user.get('email'),
					token: this.user.get('token')
				},
				success: this.cancelAccountSuccess
			});
		},

		cancelAccountSuccess: function (data) {
			this.logout();
		}
	});

	var UserModel = Backbone.Model.extend({
		defaults: {
			email: '',
			firstName: '',
			lastName: '',
			image: '',
			token: ''
		}
	});

	var StateModel = Backbone.Model.extend({
		defaults: {
			loggedIn: false
		}
	});

	rlbb.mainView = new MainView({
		el: 'body',
		user: new UserModel(),
		state: new StateModel()
	});

}());
