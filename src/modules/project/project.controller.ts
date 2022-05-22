import { ProjectService } from './project.service';
import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { ApiOK } from '../../common/responses/api-response';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { Auth } from '../../common/decorators/auth.decorator';
import { CreatProjectDto, GetProjectDetailDto, GetProjectDto } from './dto/project.dto';

import path = require('path');

@Auth()
@Controller('project')
@ApiTags('Project')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
  ) { }

  @Post('')
  @ApiOperation({ summary: 'Create project' })
  async create(@CurrentUser() user, @Body() data: CreatProjectDto) {
    return await this.projectService.create(user.id, data)
  }

  @Get('')
  @ApiOperation({ summary: 'Get list project' })
  async getList(@CurrentUser() user, @Query() data: GetProjectDto) {
    return await this.projectService.getList(user.id, data)
  }

  @Get('/projectDetail')
  @ApiOperation({ summary: 'Get project detail' })
  async getDetail(@CurrentUser() user, @Query() data: GetProjectDetailDto) {
    const result = await this.projectService.getDetail(user.id, data);
    return new ApiOK(result);
  }


}
