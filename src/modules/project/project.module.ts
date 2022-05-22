import { ProjectController } from './project.controller';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { S3Module } from '../../s3/s3.module';
import { User } from '../../database/entities/mysql/user.entity';
import { Notification } from '../../database/entities/mysql/notification.entity';
import { ProjectService } from './project.service';
import { Project } from '../../database/entities/mysql/project.entity';

@Module({
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
  imports: [
    TypeOrmModule.forFeature([Project, User, Notification]),
    UserModule,
    S3Module,
  ]
})
export class ProjectModule { }
