import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import BaseEntity from "./BaseEntity";
import User from "./User";
import Post from "./Post";
import { Exclude } from "class-transformer";
import Vote from "./Vote";
import { makeId } from "../utils/helpers";

@Entity("comments")
export default class Comment extends BaseEntity {
  @Index()
  @Column()
  identifier!: string;

  @Column()
  body!: string;

  @Column()
  username!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "username", referencedColumnName: "username" })
  user!: User;

  @Column()
  postId!: number;

  @ManyToOne(() => Post, (post) => post.comments, { nullable: false })
  post!: Post;

  @Exclude()
  @OneToMany(() => Vote, (vote) => vote.comment)
  votes!: Vote[];

  protected userVote!: number; // 1 or -1 or null

  setUserVote(user: User) {
    const index = this.votes?.findIndex((v) => v.username === user.username);
    this.userVote = index > -1 ? this.votes[index].value : 0;
  }
  // one person can only vote once, -1 for downvote, 1 for upvote
  // if the user has not voted, the value is 0
  // setUserVote is a method that sets the userVote property of the post or comment
  // findIndex : returns the index of the first element in the array that satisfies the provided testing function. Otherwise, it returns -1, indicating that no element passed the test.
  // if the user has voted, the value is the value of the vote

  @Exclude() get voteScore(): number {
    const initialValue = 0;
    return this.votes?.reduce(
      (previouseValue, currentValue) =>
        previouseValue + (currentValue.value || 0),
      initialValue
    );
  }
  // voteScore is a getter that calculates the vote score of the post or comment
  // reduce: executes a reducer function (that you provide) on each element of the array, resulting in a single output value.

  @BeforeInsert()
  makeId() {
    this.identifier = makeId(8);
  }
  // BeforeInsert: A method that is called before the entity is inserted into the database
}
