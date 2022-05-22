import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiError } from '../../common/responses/api-error';
import { ApiOK } from '../../common/responses/api-response';
import * as _ from 'lodash'
import { Comment } from '../../database/entities/mysql/comment.entity';
import { UserService } from '../user/user.service';
import { User } from '../../database/entities/mysql/user.entity';
import { Notification, NotificationType } from '../../database/entities/mysql/notification.entity';
import { Project } from '../../database/entities/mysql/project.entity';
import { CreatProjectDto, GetProjectDetailDto, GetProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) { }

  async create(userId: number, data: CreatProjectDto, file?) {
    try {
      let project = this.projectRepository.create({
        userId: userId,
        title: data.title,
        description: data.description,
        member_join : data.member_join
      })

      await this.projectRepository.save(project);
      return new ApiOK(project)
    } catch (error) {
      throw new ApiError('SYSTEM_ERROR', 'System error', error)
    }
  }

  async getList(userId: number, data: GetProjectDto) {
    const offset = data.offset ? data.offset : 0;
    const limit = data.limit ? data.limit : 10;
    const idUserSearch = data.userId ?? null;
    const keyword = data.keyword ?? ''


    const query = this.projectRepository.createQueryBuilder('project')
      .select('project.id', 'id')
      .where(`project.title like '%${keyword}%' OR project.description like '%${keyword}%'`)



    if (idUserSearch) {
      query.where(`project.userId = '${idUserSearch}'`)
    }
    query.distinct(true)
      .addSelect('project.title', 'title')
      .addSelect('project.description', 'description')
      .addSelect('project.createdAt', 'createdAt')
      .addSelect('project.member_join', 'member_join')
      .addSelect('project.userId', 'userId')
      .leftJoinAndSelect("project.user", "user")
      .orderBy('project.createdAt', 'DESC')

    const result = await query.offset(offset)
      .limit(limit)
      .getRawMany();
    const total = await query.getCount();
    return { items: result, total: total }
  }

  async getDetail(userId, data: GetProjectDetailDto) {
    const queryUser = await this.projectRepository.createQueryBuilder('project')
      .select('project.id', 'id')
      .distinct(true)
      .addSelect('project.title', 'title')
      .addSelect('project.description', 'description')
      .addSelect('project.member_join', 'member_join')
      .addSelect('project.createdAt', 'createdAt')
      .leftJoinAndSelect("project.user", "user")
      .where(`project.id = ${data.projectId}`)
      .getRawMany()

    const newItems = _.reduce(queryUser, (data, item) => {
      data.push(item)
      return data
    }, [])


    const response = {
      ...newItems[0],
    }
    return response
  }

}

