(function () {
	window.rlbb = {};

	var MainView = Backbone.View.extend({
		user: null,
		state: null,

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

		initialize: function () {
			_.bindAll(this);
			this.user = this.options.user;
			this.state = this.options.state;

			this.state.on('change', this.updateState);
			this.user.on('change', this.updateUser);
			this.updateState();
		},

		updateState: function () {
			var className = this.state.get('loggedIn') ? 'out' : 'in';

			if (className === 'in') {
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

		updateUser: function () {
			this.$('.firstName').text(this.user.get('firstName'));
		},

		registerModal: function () {
			this.$('#register-email, #register-password').val('');
			this.$('#register-modal .alert').addClass('hide');
			this.$('#register-modal').modal();
		},

		inlineRegister: function () {
			this.$('.modal-dialog').modal('hide');
			this.$('.nav-link.register').trigger('click');

			this.$('#register-email').val(this.$('#login-email').val());
			this.$('#register-password').val(this.$('#login-password').val());
		},

		register: function () {
			this.$('#register-modal .alert').addClass('hide');

			$.ajax({
				url: '/api/users',
				type: 'post',
				data: {
					email: this.$('#register-email').val(),
					password: this.$('#register-password').val()
				},
				success: this.registerSuccess
			});
		},

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

		loginModal: function () {
			this.$('#login-email, #login-password').val('');
			this.$('#login-modal .alert').addClass('hide');
			this.$('#login-modal').modal();
		},

		inlineLogin: function () {
			this.$('.modal-dialog').modal('hide');
			this.$('.nav-link.login').trigger('click');

			this.$('#login-email').val(this.$('#register-email').val());
			this.$('#login-password').val(this.$('#register-password').val());
		},

		login: function () {
			this.$('#login-modal .alert').addClass('hide');
			this.auth(this.$('#login-email').val(), this.$('#login-password').val(), this.loginSuccess, this.loginError);
		},

		loginSuccess: function (data) {
			switch (data.status) {
			case 200:
				this.user.set(_.extend({}, data.user, {
					token: data.token
				}));
				this.state.set('loggedIn', true);
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

		auth: function (email, password, success) {
			$.ajax({
				url: '/api/users/auth',
				type: 'post',
				data: {
					email: email,
					password: password
				},
				success: success
			});
		},

		logout: function () {
			var empty = new UserModel();
			this.user.set(empty.toJSON());

			this.state.set('loggedIn', false);
		},

		profileModal: function () {
			this.$('#profile-first-name').val(this.user.get('firstName'));
			this.$('#profile-last-name').val(this.user.get('lastName'));
			this.$('#profile-image').val(this.user.get('image'));

			this.$('#profile-modal').modal();
		},

		profileSave: function () {
			$.ajax({
				url: '/api/users/me',
				type: 'put',
				data: {
					email: this.user.get('email'),
					token: this.user.get('token'),
					firstName: this.$('#profile-first-name').val(),
					lastName: this.$('#profile-last-name').val(),
					image: this.$('#profile-image').val()
				},
				success: this.profileSaveSuccess
			});
		},

		profileSaveSuccess: function (data) {
			this.user.set(data.user);
			this.state.trigger('change');
		},

		cancelModal: function () {
			$('#cancel-modal').modal();
		},

		cancelAccount: function () {
			$.ajax({
				url: '/api/users/me',
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
		},

		cancelAccountError: function () {

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
