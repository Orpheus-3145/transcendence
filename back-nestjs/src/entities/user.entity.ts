import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { IsAscii, Length, validateOrReject } from 'class-validator';

import { UserStatus } from 'src/dto/user.dto';

export interface matchData {
	player1: string;
	player2: string;
	player1Score: string;
	player2Score: string;
	whoWon: string;
	type: string;
}

export interface matchRatio {
	title: string;
	value: number;
	rate: number;
}

export interface leaderboardData {
	user: User;
	ratio: matchRatio[];
}

@Entity()
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

	@Column({ type: 'jsonb', default: () => "'[]'" })
	matchHistory: matchData[];

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
