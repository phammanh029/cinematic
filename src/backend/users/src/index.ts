import { Process } from './global.d';

import fastify from 'fastify';

import DatabaseConnection from './databases/db';
import AuthenticationService from './authentication/authentication.service';
import { Server, IncomingMessage, ServerResponse } from 'http';
declare var process: Process;

const server: fastify.FastifyInstance<
  Server,
  IncomingMessage,
  ServerResponse
> = fastify({});

const db = new DatabaseConnection('mongodb://mongo/users');
db.connect().catch(err => {
  console.log(err);
  server.log.error('database connection error');
  process.exit(1);
});
const authService = new AuthenticationService();

server.route({
  method: 'POST',
  url: '/register',
  schema: {
    body: {
      type: 'object',
      required: ['email', 'name', 'password'],
      properties: {
        email: {
          type: 'string',
          format: 'email'
        },
        name: {
          type: 'string',
          minLength: 2
        },
        password: {
          type: 'string',
          minLength: 6
        }
      }
    }
  },
  handler: async (req, reply) => {
    try {
      await authService.register(req.body);
      reply.send('User created');
    } catch (error) {
      server.log.error(error);
      reply.status(500).send(error);
    }
  }
});

server.route({
  method: 'POST',
  url: '/login',
  schema: {
    body: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: {
          type: 'string',
          format: 'email'
        },
        password: {
          type: 'string',
          minLength: 6
        }
      }
    }
  },
  handler: async (req, reply) => {
    try {
      const token = await authService.login(req.body);
      reply.send({ token: token });
    } catch (error) {
      server.log.error(error);
      reply.status(500).send(error);
    }
  }
});

const start = async () => {
  try {
    const port = process.env.PORT || 3000;
    await server.listen(port, '0.0.0.0');
    server.log.info(`server listen on port: ${port}`);
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
};

process.on('SIGTERM', async () => {
  server.log.info('Close server');
  await server.close();
  console.log('Close mongodb connection');
  await db.disconnect();
  process.exit(0);
});

start();
