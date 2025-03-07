import { IsEmail, Length } from "class-validator";
import { Entity, Column, Index, OneToMany, BeforeInsert } from "typeorm";
import bcrypt from "bcryptjs";
import BaseEntity from "./BaseEntity";
import Post from "./Post";
import Vote from "./Vote";

@Entity("users") //엔티티 이름
export default class User extends BaseEntity {
  @Index()
  @IsEmail(undefined, { message: "wrong Email" })
  @Length(1, 255, { message: "1~255 letters" })
  @Column({ unique: true })
  email!: string;

  @Index()
  @Length(3, 32, { message: "name must be longer than 3 letters" })
  @Column()
  username!: string;

  @Column()
  @Length(5, 255, { message: "Password should be longer than 6 letters" })
  password!: string;

  @OneToMany(() => Post, (post) => post.user)
  posts!: Post[];

  @OneToMany(() => Vote, (vote) => vote.user)
  votes!: Vote[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 6);
  }
}
