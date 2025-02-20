import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique } from 'typeorm';
import { IsAscii, Length, validateOrReject } from 'class-validator';

import { UserStatus } from 'src/dto/user.dto';

@Entity()
@Unique(['nameNick'])
export default class User {
	@PrimaryGeneratedColumn()
	user_id: number;

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

	@Column({
		type: 'enum',
		enum: UserStatus,
		default: UserStatus.Offline,
	})
	status: UserStatus;

	@Column({ nullable: false, default: false})
	twoFactorEnabled: boolean;

	@Column({ nullable: true, default: null})
	twoFactorSecret: string;

	@CreateDateColumn()
	createdAt: Date;

	async validate() {
		await validateOrReject(this);
	}
}
