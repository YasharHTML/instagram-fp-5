import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import { createClient } from 'redis';
import RedisStore from 'connect-redis';

const REDIS_CONNECTION =
  process.env.REDIS_CONNECTION ?? 'redis://localhost:6379';

const client = createClient({ url: REDIS_CONNECTION });
client.connect().catch(console.error);

const redisStore = new RedisStore({
  client,
  prefix: 'myapp:',
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    session({
      secret: process.env.SESSION_SECRET ?? 'keyboard cat',
      cookie: {
        httpOnly: true,
        maxAge: +(process.env.MAX_AGE ?? 7 * 24 * 60 * 60 * 1000),
        secure: process.env.NODE_ENV === 'production',
      },
      name: '__session',
      resave: false,
      saveUninitialized: false,
      store: redisStore,
    }),
  );
  await app.listen(3000);
}
bootstrap();
