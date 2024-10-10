import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { IsAscii, Length, validateOrReject } from 'class-validator';
import { UserStatus } from '../dto/user.dto';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  accessToken: string;
  
  @Column({ nullable: false })
  intraId: number;

  @Column({ nullable: true, length: 20 })
  @IsAscii()
  @Length(0, 20)
  nameNick: string | null;
  
  @Column({ nullable: false })
  nameFirst: string;
  
  @Column({ nullable: false })
  nameLast: string;
  
  @Column({ nullable: false })
  email: string;

  @Column({ nullable: true, default: 'default_profile_photo.png' })
  image: string | null;

  @Column({ nullable: true, default: 'Hello, I have just landed!', length: 100 })
  @IsAscii()
  @Length(0, 100)
  greeting: string | null;

  @Column({ nullable: true, default: null })
  auth2F: string | null;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.Offline,
  })
  status: UserStatus;

  @CreateDateColumn()
  createdAt: Date;

  async validate() {
    await validateOrReject(this);
  }
}