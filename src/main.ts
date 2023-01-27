import { HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface';
import { NestFactory } from '@nestjs/core';
import { readFileSync } from 'fs';
import { AppModule } from './app.module';
let httpsOptions: HttpsOptions;
if (process.env.NODE_ENV !== 'dev') {
  httpsOptions = {
    key: readFileSync(process.env.HTTPS_KEY),
    cert: readFileSync(process.env.HTTPS_CTF),
  };
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: { origin: '*' },
    httpsOptions,
  });
  await app.listen(3012);
}
bootstrap();
