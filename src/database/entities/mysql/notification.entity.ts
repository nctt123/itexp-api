import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { Post } from "./post.entity";
import { User } from "./user.entity";

export enum NotificationType {
    SYSTEM = "SYSTEM",
    INVITED = "INVITED",
    FRIEND = "FRIEND",
    ACCEPTED_REQUEST = 'ACCEPTED_REQUEST',
    FOLLOWING_INFO = 'FOLLOWING_INFO',
    FRIEND_ACTIVITIES = 'FRIEND_ACTIVITIES',
    LIKE_POST = 'LIKE_POST',
    COMMENT_POST = 'COMMENT_POST'
}

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: number

    @Index()
    @Column({ type: 'bigint', unsigned: true })
    userId: number

    @JoinColumn({ name: "userId" })
    @ManyToOne(type => User)
    user: User

    @Index()
    @Column({ type: 'bigint', unsigned: true, nullable: true, default: null })
    senderId: number

    @JoinColumn({ name: "senderId" })
    @ManyToOne(type => User)
    sender: User

    @JoinColumn({ name: "refId" })
    @OneToOne(type => Post)
    post: Post

    @Column({ type: 'enum', enum: NotificationType, nullable: true, default: null })
    type: NotificationType

    @Column()
    body: string

    @Column({ nullable: true, default: null })
    title: string

    @Column({ type: 'json', nullable: true, default: null })
    metadata: string

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date

    @Column("timestamp", { precision: 6, default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updatedAt: Date

    @Column({ default: false })
    isRead: boolean

    @Column({ type: 'bigint', unsigned: true, nullable: true, default: null })
    refId: number

    @Column({ default: false })
    isDeleted: boolean
}