(function () {
	window.rlbb = {};

	var MainView = Backbone.View.extend({
		user: null,
		state: null,

		events: {
			'click .nav-link.register': 'registerModal',
			'click .nav-link.login': 'loginModal',
			'click .nav-link.profile': 'profileModal',
			'click .nav-link.logout': 'logout',
			'click .btn.register': 'register',
			'click .btn.login': 'login'
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
			this.$('#register-modal').modal();
		},

		register: function () {
			$.ajax({
				url: '/api/users',
				type: 'post',
				data: {
					email: this.$('#register-email').val(),
					password: this.$('#register-password').val()
				},
				success: this.registerSuccess,
				error: this.registerError
			});
		},

		registerSuccess: function (data) {
			if (data.status === 200) {
				this.auth(this.$('#register-email').val(), this.$('#register-password').val(), this.loginSuccess, this.registerError);
			}
		},

		registerError: function (data) {

		},

		loginModal: function () {
			this.$('#login-modal').modal();
		},

		login: function () {
			this.auth(this.$('#login-email').val(), this.$('#login-password').val(), this.loginSuccess, this.loginError);
		},

		loginSuccess: function (data) {
			this.user.set(_.extend({}, data.user, {
				token: data.token
			}));

			this.state.set('loggedIn', true);
		},

		loginError: function () {

		},

		auth: function (email, password, success, error) {
			$.ajax({
				url: '/api/users/auth',
				type: 'post',
				data: {
					email: email,
					password: password
				},
				success: success,
				error: error
			});
		},

		logout: function () {
			var empty = new UserModel();
			this.user.set(empty.toJSON());

			this.state.set('loggedIn', false);
		},

		profileModal: function () {
			this.$('#profile-first-name').val(this.user.get('firstName'));
			this.$('#progile-last-name').val(this.user.get('lastName'));
			this.$('#profile-image').val(this.user.get('image'));

			this.$('#profile-modal').modal();
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
