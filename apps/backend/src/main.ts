/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import {NestFactory} from '@nestjs/core';

import {AppModule} from './app/app.module';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {ValidationPipe} from "@nestjs/common";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);
    app.useGlobalPipes(new ValidationPipe());

    app.enableCors({
        origin: 'http://localhost:4200', // Allowed URL of the Angular frontend
    });

    const options = new DocumentBuilder()
        .setTitle('Your API Title')
        .setDescription('Your API description')
        .setVersion('1.0')
        .addServer('http://localhost:3000/', 'Local environment')
        .addTag('Your API Tag')
        .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api-docs', app, document);

    const port = process.env.PORT || 3000;
    await app.listen(port);
}

bootstrap();
