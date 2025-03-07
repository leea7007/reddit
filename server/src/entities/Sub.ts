import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import BaseEntity from "./BaseEntity";
import { Expose } from "class-transformer";
import Post from "./Post";
import Vote from "./Vote";
import User from "./User";

@Entity("subs")
export default class Sub extends BaseEntity {
  @Index()
  @Column({ unique: true })
  name!: string;

  @Column()
  title!: string;

  @Column({ type: "text", nullable: true })
  description!: string;

  @Column({ nullable: true })
  imageUrn!: string;

  @Column({ nullable: true })
  bannerUrn!: string;

  @Column()
  username!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "username", referencedColumnName: "username" })
  user!: User;

  @OneToMany(() => Post, (post) => post.sub)
  posts!: Post[];

  @Expose()
  get imageUrl(): string {
    return this.imageUrn
      ? `${process.env.APP_URL}/images/${this.imageUrn}`
      : "https://www.gravatar.com/avatar?d=mp&f=y";
  }
}

//name: 외래키의 속성명, name이 없을 시 propertyName + referencedColumnName(참조 엔티티의 참조 속성명, id가 default)이 사용 됨
// 둘 다 없을 시 FK필드는 FK 속성명 + Id (user_id)
