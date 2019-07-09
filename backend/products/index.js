const kafka = require('kafka-node'),
	Producer = kafka.Producer,
	Consumer = kafka.Consumer,
	KeyedMessage = kafka.KeyedMessage,
	client = new kafka.KafkaClient({ kafkaHost: '0.0.0.0:9092' }),
	producer = new Producer(client),
	km = new KeyedMessage('key', 'message'),
	payloads = [
		{
			topic: 'demo_topic',
			messages: ['hi'],
		},
	];

producer.on('ready', () => {
	producer.send(payloads, (err, data) => {
		console.log(data);
	});
});

producer.on('error', err => {
	console.log(err);
});
