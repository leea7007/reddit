import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import BaseEntity from "./BaseEntity";
import User from "./User";
import Post from "./Post";

@Entity("votes")
export default class Vote extends BaseEntity {
  @Column()
  value!: number; // 1(좋아요), -1(싫어요)

  @ManyToOne(() => User, (user) => user.votes)
  @JoinColumn({ name: "username", referencedColumnName: "username" })
  user!: User;

  @Column()
  username!: string;

  @Column({ nullable: true })
  postId!: number;

  @ManyToOne(() => Post, (post) => post.votes, { onDelete: "CASCADE" })
  post!: Post;

  @Column({ nullable: true })
  commentId!: number;

  @ManyToOne(() => Comment)
  comment!: Comment;
}
