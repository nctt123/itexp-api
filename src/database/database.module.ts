import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        "type": "mysql",
        "host": '127.0.0.1',
        "port": 3306,
        "database": 'doan',
        "username": 'root',
        "password": 'root',
        "extra": {
          "charset": "utf8mb4_unicode_ci"
        },
        "entities": [__dirname + '/entities/mysql/*.entity.{ts,js}'],
        "logging": configService.dbConfigMySQL.log,
        "migrationsRun": configService.dbConfigMySQL.migrate,
        "migrationsTransactionMode": 'each',
        "migrations": [__dirname + '/migrations/mysql/*.{ts,js}'],
        "cache": true,
        // "synchronize": configService.dbConfigMySQL.sync,
        "synchronize": false,
      }),
    })
  ],
})
export class DatabaseModule { }
