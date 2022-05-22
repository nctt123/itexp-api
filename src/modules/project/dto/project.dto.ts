import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, Length } from "class-validator";
import { TrimStr } from "../../../common/decorators/transforms.decorator";

export class CreatProjectDto {
  @ApiProperty()
  @TrimStr()
  @IsNotEmpty({ message: 'MSG_2' })
  @Length(0, 60)
  title: string

  @ApiProperty()
  @IsOptional()
  description: string

  @ApiProperty()
  @IsOptional()
  member_join: number

  @ApiProperty()
  @IsOptional()
  percent_join: number
}

export class GetProjectDto {
  @ApiProperty({ required: false })
  @IsOptional()
  userId: number


  @ApiProperty({ required: false })
  @IsOptional()
  keyword: string

  @ApiProperty({ default: 0, required: false })
  offset: number

  @ApiProperty({ default: 10, required: false })
  limit: number
}

export class GetProjectDetailDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'MSG_2' })
  projectId: number
}
