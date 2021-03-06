import { Like } from './../../database/entities/mysql/like.entity';
import { Post } from './../../database/entities/mysql/post.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiError } from '../../common/responses/api-error';
import { ApiOK } from '../../common/responses/api-response';
import * as _ from 'lodash'
import { AddCommentDto, CreatPostDto, DeleteCommentDto, GetPostDetailDto, GetPostDto, LikeDto } from './dto/post.dto';
import { Comment } from '../../database/entities/mysql/comment.entity';
import { AsyncAction } from 'rxjs/internal/scheduler/AsyncAction';
import { UserService } from '../user/user.service';
import { User } from '../../database/entities/mysql/user.entity';
import { Notification, NotificationType } from '../../database/entities/mysql/notification.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly userService: UserService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) { }

  async createPost(userId: number, data: CreatPostDto, file?) {
    try {
      let post = await this.postRepository.create({
        userId: userId,
        title: data.title,
        description: data.description,
        category: data.category,
        image: file || ''
      })

      await this.postRepository.save(post);
      return new ApiOK(post)
    } catch (error) {
      throw new ApiError('SYSTEM_ERROR', 'System error', error)
    }
  }

  async getPost(userId: number, data: GetPostDto) {
    const offset = data.offset ? data.offset : 0;
    const limit = data.limit ? data.limit : 10;
    const idUserSearch = data.userId ?? null;
    const keyword = data.keyword ?? ''


    const query = this.postRepository.createQueryBuilder('post')
      .select('post.id', 'id')
      .where(`post.category like '%${keyword}%' OR post.title like '%${keyword}%' OR post.description like '%${keyword}%'`)



    if (idUserSearch) {
      query.where(`post.userId = '${idUserSearch}'`)
    }
    query.distinct(true)
      .addSelect('post.title', 'title')
      .addSelect('post.description', 'description')
      .addSelect('post.category', 'category')
      .addSelect('post.createdAt', 'createdAt')
      .addSelect('post.image', 'image')
      .addSelect('post.userId', 'userId')
      .leftJoinAndSelect("post.user", "user")
      // .addSelect('users.id', 'hostId')
      // .addSelect('users.avatar', 'avatar')
      // .addSelect('users.name', 'name')
      .addSelect(`case when like.postId is not null then true else false end`, 'isLiked')
      // .innerJoin('users', 'users', 'users.id = post.userId')
      .leftJoin('like', 'like', `like.postId = post.id AND like.isDeleted = 0 AND like.userId = ${userId}`)
      .leftJoin('comment', 'comment', 'comment.postId = post.id')
      .orderBy('post.createdAt', 'DESC')

    const result = await query.offset(offset)
      .limit(limit)
      .getRawMany();

    // const members = await this.postRepository.createQueryBuilder('post')
    //   .innerJoinAndSelect('comment', 'comment', 'comment.postId = post.id')
    //   .innerJoinAndSelect('users', 'users', 'comment.postId = users.id')
    //   .where(`post.id in (:...postIds)`, { postIds: result.map(item => item.id) })
    //   .getRawMany()

    // const membersCustom = _.map(members, (item) => {
    //   return (
    //     {
    //       postId: item.post_id,
    //       userId: item.users_id,
    //       name: item.users_name,
    //       avatar: item.users_avatar,
    //       comment: item.comment_content
    //     }
    //   )
    // })

    // const newResult = _.map(result, (items) => {
    //   let members = []
    //   _.map(membersCustom, item => {
    //     if (item.postId === items.id) {
    //       members.push(item)
    //     }
    //   })
    //   items.members = members
    //   return items;
    // }, [])

    // const newItems = _.reduce(result, (data, item) => {
    //   if (item.isLiked.toString() === '1') {
    //     item.isLiked = true
    //   } else {
    //     item.isLiked = false
    //   }
    //   data.push(item)
    //   return data
    // }, [])

    const total = await query.getCount();
    return { items: result, total: total }
  }


  async useLike(data: LikeDto) {
    let like = await this.likeRepository.findOne({
      userId: data.userId,
      postId: data.postId,

    });

    const status = like ? !like.isDeleted : false;
    if (!like) {
      like = await this.likeRepository.create({
        userId: data.userId,
        postId: data.postId,
      });
      const users = await this.userRepository.createQueryBuilder('user')
        .select('user.id', 'id')
        .addSelect('user.avatar', 'avatar')
        .addSelect('user.name', 'name')
        .where(`user.id = ${data.userId}`)
        .getRawMany();
      const queryUser = await this.postRepository.createQueryBuilder('post')
        .select('post.id', 'id')
        .distinct(true)
        .addSelect('post.userId', 'userId')
        .where(`post.id = ${data.postId}`)
        .getRawMany()

      if (users && queryUser) {
        let newNotification = {
          body: users[0]?.name + ' ???? th??ch b??i vi???t c???a b???n',
          title: users[0]?.name + ' ???? th??ch b??i vi???t c???a b???n',
          senderId: data.userId,
          userId: queryUser[0]?.userId,
          type: NotificationType.LIKE_POST,
          metadata: null,
          refId: data.postId,
          isDeleted: false
        }
        const notifications = this.notificationRepository.create(newNotification)
        await this.notificationRepository.save(notifications)
      }
    }
    like.isDeleted = status;
    this.likeRepository.save(like);
    return like;
  }

  async addComment(userId, data: AddCommentDto) {
    const comment = this.commentRepository.create({
      postId: data.postId,
      userId,
      content: data.content
    });
    this.commentRepository.save(comment)
    const user = await this.userRepository.createQueryBuilder('user')
      .select('user.id', 'id')
      .addSelect('user.avatar', 'avatar')
      .addSelect('user.name', 'name')
      .where(`user.id = ${userId}`)
      .getRawMany();


    const queryUser = await this.postRepository.createQueryBuilder('post')
      .select('post.id', 'id')
      .distinct(true)
      .addSelect('post.userId', 'userId')
      .where(`post.id = ${data.postId}`)
      .getRawMany()

    if (user && queryUser) {
      let newNotification = {
        body: user[0]?.name + ' ???? b??nh lu???n b??i vi???t c???a b???n',
        title: user[0]?.name + ' ???? b??nh lu???n b??i vi???t c???a b???n',
        senderId: userId,
        userId: queryUser[0]?.userId,
        type: NotificationType.LIKE_POST,
        metadata: null,
        refId: data.postId,
        isDeleted: false
      }
      const notifications = this.notificationRepository.create(newNotification)
      await this.notificationRepository.save(notifications)
    }
    const response = {
      ...user[0],
      ...comment
    }

    return response;
  }

  async deleteComment(data: DeleteCommentDto) {
    await this.commentRepository.delete({
      id: data.idComment
    })
    return data.idComment
  }
  async getPostDetail(userId, data: GetPostDetailDto) {
    const queryUser = await this.postRepository.createQueryBuilder('post')
      .select('post.id', 'id')
      .distinct(true)
      .addSelect('post.title', 'title')
      .addSelect('post.image', 'image')
      .addSelect('post.description', 'description')
      .addSelect('post.category', 'category')
      // .addSelect('users.id', 'hostId')
      // .addSelect('users.avatar', 'hostAvatar')
      // .addSelect('users.name', 'hostName')
      .leftJoinAndSelect("post.user", "user")
      .addSelect(`case when like.postId is not null then true else false end`, 'isLiked')
      // .innerJoin('users', 'users', 'users.id = post.userId')
      .leftJoin('like', 'like', `like.postId = post.id AND like.isDeleted = 0 AND like.userId = ${userId}`)
      .where(`post.id = ${data.postId}`)
      .getRawMany()

    const newItems = _.reduce(queryUser, (data, item) => {
      if (item.isLiked.toString() === '1') {
        item.isLiked = true
      } else {
        item.isLiked = false
      }
      data.push(item)
      return data
    }, [])

    const queryLike = await this.likeRepository.createQueryBuilder('like')
      .select('users.id', 'userId')
      .addSelect('users.avatar', 'avatar')
      .addSelect('users.name', 'name')
      .innerJoin('users', 'users', 'users.id = like.userId')
      .where(`like.postId = ${data?.postId}`)
      .getRawMany()

    const totalLike = queryLike?.length

    const queryComment = await this.commentRepository.createQueryBuilder('comment')
      .select('users.id', 'userId')
      .addSelect('comment.id', 'id')
      .addSelect('users.avatar', 'avatar')
      .addSelect('users.name', 'name')
      .addSelect('comment.content', 'content')
      .innerJoin('users', 'users', 'users.id = comment.userId')
      .where(`comment.postId = ${data?.postId}`)
      .getRawMany()
    const totalComment = queryComment?.length

    const response = {
      ...newItems[0],
      membersLike: queryLike,
      totalLike,
      memberComment: queryComment,
      totalComment: totalComment
    }
    return response
  }

  async getListLike(userId: number, data: GetPostDetailDto) {
    const queryLike = await this.likeRepository.createQueryBuilder('like')
      .select('users.id', 'id')
      .addSelect('users.avatar', 'avatar')
      .addSelect('users.name', 'name')
      .addSelect(`fr.status`, 'friendStatus')
      .addSelect(`case when fr.isFollowed is not null and fr.isFollowed = true then true else false end`, 'isFollowed')
      .innerJoin('users', 'users', 'users.id = like.userId')
      .where(`like.postId = ${data?.postId}`)
      .leftJoin('friends', 'fr', 'fr.userId = :userId and fr.isDeleted = false', { userId: userId })
      .getRawMany()

    const newItems = _.reduce(queryLike, (data, item) => {
      if (item.isFollowed.toString() === '1') {
        item.isFollowed = true
      } else {
        item.isFollowed = false
      }
      data.push(item)
      return data
    }, [])

    return { items: newItems }
  }
}

