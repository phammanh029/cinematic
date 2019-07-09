const kafka = require('kafka-node'),
	Consumer = kafka.Consumer,
	KeyedMessage = kafka.KeyedMessage,
	client = new kafka.KafkaClient({ kafkaHost: '0.0.0.0:9092' }),
	consumer = new Consumer(client, [{ topic: 'demo_topic' }]);

consumer.on('message', (msg) => {
	console.log(msg);
});

consumer.on('error', err => {
	console.log(err);
});
