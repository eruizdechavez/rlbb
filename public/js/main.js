(function () {
	// Application's namespace
	window.rlbb = {};

	// Main View class. Controlls all events and behaviors of the application.
	var MainView = Backbone.View.extend({

		// Symbolic Constants
		CLASS_LOG_IN: 'in',
		CLASS_LOG_OUT: 'out',
		PROFILE_IMAGE_PREPEND: 'http://www.gravatar.com/avatar/',
		PROFILE_IMAGE_APPEND: '?d=identicon&s=100',
		STORAGE_EMAIL: 'rlbb.email',
		STORAGE_TOKEN: 'rlbb.token',

		// Class used to instantiate new User Models internally
		UserModel: null,

		// Class used to instantiate new State Models internally
		StateModel: null,

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
			this.UserModel = this.options.UserModel;
			this.StateModel = this.options.StateModel;

			this.user = new this.UserModel();
			this.state = new this.StateModel();

			this.state.on('change', this.updateState);
			this.user.on('change', this.updateUser);
			this.recoverState();
			this.updateState();
		},

		// Try to recover user's session from browser storage.
		recoverState: function () {
			if (localStorage && localStorage.getItem(this.STORAGE_EMAIL) && localStorage.getItem(this.STORAGE_TOKEN)) {
				this.user.set({
					email: localStorage.getItem(this.STORAGE_EMAIL),
					token: localStorage.getItem(this.STORAGE_TOKEN)
				}).fetch({
					success: this.recoverStateSuccess
				});
			}
		},

		// Auto-login if browser storage data was correct, otherwise logout.
		recoverStateSuccess: function (model, data) {
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

			this.user.save({
				email: this.$('#register-email').val(),
				password: this.$('#register-password').val()
			}, {
				success: this.registerSuccess
			});
		},

		// Handle Registration service response.
		// 200 - Everything is good, proceed to login
		// 400 - Bad Request; Fields are missing
		// 403 - Forbidden; Email already exists (try to login?)
		registerSuccess: function (model, data) {
			switch (data.status) {
			case 200:
				this.user.set({
					email: this.$('#register-email').val(),
					password: this.$('#register-password').val()
				}).auth({
					success: this.loginSuccess
				});
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
			this.user.set({
				email: this.$('#login-email').val(),
				password: this.$('#login-password').val()
			}).auth({
				success: this.loginSuccess
			});
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

		// Logout current user.
		// Set an empty model instead of create a new one to avoid loosing
		// event bindings.
		// Set state to not logged in.
		logout: function () {
			if (localStorage) {
				localStorage.removeItem(this.STORAGE_EMAIL);
				localStorage.removeItem(this.STORAGE_TOKEN);
			}

			var empty = new this.UserModel();
			this.user.set(empty.toJSON());

			this.state.set('loggedIn', false);
		},

		// Open Profile (Settings) modal.
		profileModal: function () {
			this.$('#profile-first-name').val(this.user.get('firstName'));
			this.$('#profile-last-name').val(this.user.get('lastName'));
			this.$('#profile-image').val(this.user.get('image'));

			this.$('#profile-modal').modal();
		},

		// Execute service call to save user details.
		profileSave: function () {
			this.user.save({
				firstName: this.$('#profile-first-name').val(),
				lastName: this.$('#profile-last-name').val()
			}, {
				success: this.profileSaveSuccess
			});
		},

		// Handle Profile service response.
		profileSaveSuccess: function (model, data) {
			this.state.trigger('change');
		},

		// Open Cancel account modal.
		cancelModal: function () {
			this.$('#cancel-modal').modal();
		},

		// Execute Cancel account service.
		cancelAccount: function () {
			this.user.destroy({
				success: this.logout
			});
		}
	});

	// User Model class. Contains our user data as well as server side basic
	// logic to keep views clean of AJAX requests.
	var UserModel = Backbone.Model.extend({
		// Symbolic Constants
		SERVICE_URL: '/api/users',
		SERVICE_URL_AUTH: '/api/users/auth',
		SERVICE_URL_ME: '/api/users/me',

		// Default attributes for the model
		defaults: {
			email: '',
			password: '',
			firstName: '',
			lastName: '',
			image: '',
			token: ''
		},

		// Override default new check. We do not use "id" so, if the user has a token
		// then it not a new user.
		isNew: function () {
			return this.get('token') === '';
		},

		// Override default sync. We are using custom url for "me".
		sync: function (method, model, options) {
			switch (method) {
			case 'read':
				$.ajax(_.extend({
					url: this.SERVICE_URL_ME,
					data: {
						email: this.get('email'),
						token: this.get('token')
					}
				}, options));
				break;

			case 'create':
				$.ajax(_.extend({
					url: this.SERVICE_URL,
					type: 'post',
					data: {
						email: this.get('email'),
						password: this.get('password')
					}
				}, options));
				break;

			case 'update':
				$.ajax(_.extend({
					url: this.SERVICE_URL_ME,
					type: 'put',
					data: {
						email: this.get('email'),
						token: this.get('token'),
						firstName: this.get('firstName'),
						lastName: this.get('lastName')
					}
				}, options));
				break;

			case 'delete':
				$.ajax(_.extend({
					url: this.SERVICE_URL_ME,
					type: 'delete',
					data: {
						email: this.get('email'),
						token: this.get('token')
					}
				}, options));
				break;
			}
		},

		// Authorization service request. Used on registration and login process to
		// fetch a valid token for our user.
		auth: function (options) {
			$.ajax(_.extend({
				url: this.SERVICE_URL_AUTH,
				type: 'post',
				data: {
					email: this.get('email'),
					password: this.get('password')
				}
			}, options));
		},
	});

	// State Model class. Really simple, just for binding purposes.
	var StateModel = Backbone.Model.extend({
		defaults: {
			loggedIn: false
		}
	});

	// Initialize Main View and let it visible on our Application namespace.
	// Also, inject Model classes to keep Main View class clean.
	rlbb.mainView = new MainView({
		el: 'body',
		UserModel: UserModel,
		StateModel: StateModel
	});

}());
