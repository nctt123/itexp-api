import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from "@nestjs/swagger";

export function setupSwagger(app: INestApplication) {

  const config = new DocumentBuilder()
    .setTitle('API DO AN')
    .setDescription('API DO AN')
    .setVersion('1.0')
    .addServer(process.env.APP_URL)
    .addBearerAuth()
    .build();

  const options: SwaggerDocumentOptions = {
    operationIdFactory: (
      controllerKey: string,
      methodKey: string
    ) => methodKey
  };

  const document = SwaggerModule.createDocument(app, config, options);
  SwaggerModule.setup('api', app, document);
}