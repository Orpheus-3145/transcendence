import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, Unique } from 'typeorm';
import { IsAscii, Length, validateOrReject } from 'class-validator';
import { UserStatus } from 'src/dto/user.dto';
import Game from './game.entity';



@Entity('Users')
export default class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: false })
	intraId: number;

	@Column({ nullable: false })
	accessToken: string;

	@Column({ nullable: true})
	@IsAscii()
	nameNick: string | null;

	@Column({ nullable: true, length: 20 })
	@IsAscii()
	nameIntra: string | null;

	@Column({ nullable: false })
	nameFirst: string;

	@Column({ nullable: false })
	nameLast: string;

	@Column({ nullable: false })
	email: string;

	@Column({ nullable: true, default: 'default_profile_photo.png' })
	image: string | null;

	@Column("text", { array: true, default: '{}' })
	friends: string[];

	@Column("text", { array: true, default: '{}' })
	blocked: string[];

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

	@Column({ nullable: true, default: null})
	twoFactorSecret: string;

	@CreateDateColumn()
	createdAt: Date;

	@OneToMany(() => Game, (game) => game.player1)
	player1Game: Game[];

	@OneToMany(() => Game, (game) => game.player2)
	player2Game: Game[];

	async validate() {
		await validateOrReject(this);
	}
}
