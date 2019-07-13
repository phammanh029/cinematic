const fastify = require('fastify')({ logger: true });
const mongoose = require('mongoose');
const User = require('./model/users');
const Bcrypt = require('bcryptjs');
const request = require('request');
const jwt = require('jsonwebtoken');

var getKongJWTs = async id => {
	return new Promise((resolve, reject) => {
		request.get(`http://kong:8001/consumers/${id}/jwt`, (err, response, body) => {
			if (err) {
				reject(err);
			} else {
				resolve(JSON.parse(body));
			}
		});
	});
};

var createKongJwts = async (id) => {
	return new Promise((resolve, reject) => {
		request.post(
			{
				url: `http://kong:8001/consumers/${id}/jwt`,
				formData: {},
			},
			async (err, response, body) => {
				if (err) {
					reject(err);
				} else {
					// parse consumer info
					resolve(JSON.parse(body));
				}
			}
		);
	});
};

// connect to database
mongoose.connect('mongodb://mongo/users', { useNewUrlParser: true }).catch(error => {
	fastify.log.error(error);
	process.exit(1);
});

mongoose.connection.on('error', error => {
	fastify.log.error(error);
});

fastify.route({
	method: 'POST',
	url: '/register',
	schema: {
		body: {
			type: 'object',
			required: ['email', 'name', 'password'],
			properties: {
				email: {
					type: 'string',
					format: 'email',
				},
				name: {
					type: 'string',
					minLength: 2,
				},
				password: {
					type: 'string',
					minLength: 6,
				},
			},
		},
	},
	handler: async (req, reply) => {
		try {
			let user = await User.findOne({
				email: req.body.email,
			}).exec();
			if (user) {
				reply.status(409).send('User already exists');
				return;
			}

			// insert new user
			user = new User({
				email: req.body.email,
				name: req.body.name,
				password: await Bcrypt.hash(req.body.password, 10),
			});

			// create consumer
			request.post(
				{
					url: 'http://kong:8001/consumers',
					formData: {
						username: user.email,
					},
				},
				async (err, response, body) => {
					if (err) {
						console.log(err);
						reply.status(500).send('Can not create user');
						return;
					}
					// parse consumer info
					let consumerInfo = JSON.parse(body);
					console.log(consumerInfo);
					// save user
					await user.save();
					reply.status(201).send('User created');
				}
			);
		} catch (error) {
			fastify.log.error(error);
			reply.status(500).send(error);
		}
	},
});

fastify.route({
	method: 'POST',
	url: '/login',
	schema: {
		body: {
			type: 'object',
			required: ['email', 'password'],
			properties: {
				email: {
					type: 'string',
					format: 'email',
				},
				password: {
					type: 'string',
					minLength: 6,
				},
			},
		},
	},
	handler: async (req, reply) => {
		try {
			let user = await User.findOne({
				email: req.body.email,
			}).exec();
			if (!user || !(await Bcrypt.compare(req.body.password, user.password))) {
				reply.status(401).send('Invalid user email or password');
				return;
			}
			let jWtToken = null;
			let jwts = await getKongJWTs(user.email);
			if (!jwts || jwts.data.length < 1) {
				jWtToken = await createKongJwts(user.email);
			} else {
				jWtToken = jwts.data[0];
			}

			// generate jwt
			let token = jwt.sign({ iss: jWtToken.key }, jWtToken.secret, { expiresIn: 60 * 60 });
			//console.log(token);
			reply.send({ token: token });
		} catch (error) {
			fastify.log.error(error);
			reply.status(500).send(error);
		}
	},
});

const start = async () => {
	try {
		await fastify.listen(process.env.PORT || 3000, '0.0.0.0');
	} catch (error) {
		fastify.log.error(error);
		process.exit(1);
	}
};

process.on('SIGTERM', async () =>{
    fastify.log.info('Close server');
    await fastify.close();
    console.log('Close mongodb connection');
    await mongoose.connection.close(false);
    process.exit(0);
});

start();
