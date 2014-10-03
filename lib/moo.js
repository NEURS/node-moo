var restler		= require('restler'),
	OAuth		= require('oauth').OAuth,
	urlBase		= 'https://secure.moo.com',
	requestPath	= urlBase + '/oauth/request_token.php',
	tokenPath	= urlBase + '/oauth/access_token.php';

function Moo(key, secret) {
	this.basePath	= '/api/service/';
	this.oauth		= new OAuth(requestPath, tokenPath, key, secret, '1.0', null, 'HMAC-SHA1');
}

Moo.prototype = {
	setLanguage: function (lang) {
		if (lang !== 'en') {
			this.basePath = '/' + lang + '/api/service';
		}
	},
	get: function (data, cb) {
		var query = Object.keys(data).map(function (key) {
			return key + '=' + data[key];
		}).join('&');

		this.oauth.get(urlBase + this.basePath + '?' + query, '', '', cb);
	},
	post: function (data, cb) {
		var query = Object.keys(data).map(function (key) {
			return key + '=' + data[key];
		}).join('&');

		this.oauth.post(urlBase + this.basePath + '?' + query, '', '', data, cb);
	},
	form: function (data, cb) {
		var query,
			imageFile = data.imageFile;

		data.imageFile = undefined;
		delete data.imageFile;

		query = Object.keys(data).map(function (key) {
			return key + '=' + data[key];
		}).join('&');

		restler.post(urlBase + this.basePath + '?' + query, {
			multipart: true,
			rejectUnauthorized: false,
			data: {
				imageFile: imageFile
			}
		}).on('success', function (data) {
			cb(null, data);
		}).on('error', function (err) {
			cb(err);
		}).on('fail', function (err) {
			cb(err);
		}).on('timeout', function (err) {
			cb(err);
		});
	},
	file: function (path, filename, fileSize, encoding, contentType) {
		return restler.file(path, filename, fileSize, encoding, contentType);
	},
	get Pack() {
		if (!this._pack) {
			this._pack = new MooPack(this);
		}

		return this._pack;
	},
	get Template() {
		if (!this._template) {
			this._template = new MooTemplate(this);
		}

		return this._template;
	},
	get Image() {
		if (!this._image) {
			this._image = new MooImage(this);
		}

		return this._image;
	},
	get Text() {
		if (!this._text) {
			this._text = new MooText(this);
		}

		return this._text;
	}
};

function _setup(httpMethod, mooMethod) {
	return function (data, cb) {
		var reject	= process.env['NODE_TLS_REJECT_UNAUTHORIZED'];
		data.method	= mooMethod;

		process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
		this._moo[httpMethod].call(this._moo, data, cb);
		process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = reject;
	};
}

function MooPack(moo) {
	this._moo = moo;
}

MooPack.prototype = {
	createPack: _setup('post', 'moo.pack.createPack'),
	createTrialPartnerPack: _setup('post', 'moo.pack.createTrialPartnerPack'),
	getPack: _setup('get', 'moo.pack.getPack'),
	getPhysicalSpec: _setup('get', 'moo.pack.getPhysicalSpec'),
	updatePack: _setup('post', 'moo.pack.updatePack'),
	updatePhysicalSpec: _setup('post', 'moo.pack.updatePhysicalSpec'),
	renderSide: _setup('post', 'moo.pack.renderSide'),
	renderSideUrl: _setup('post', 'moo.pack.renderSideUrl')
};

function MooTemplate(moo) {
	this._moo = moo;
}

MooTemplate.prototype = {
	getTemplate: _setup('get', 'moo.template.getTemplate')
};

function MooImage(moo) {
	this._moo = moo;
}

MooImage.prototype = {
	uploadImage: _setup('form', 'moo.image.uploadImage'),
	importImage: _setup('post', 'moo.image.importImage')
};

function MooText(moo) {
	this._moo = moo;
}

MooText.prototype = {
	measure: _setup('get', 'moo.text.measure')
};

module.exports = Moo;
