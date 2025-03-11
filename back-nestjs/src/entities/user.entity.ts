import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, Unique } from 'typeorm';
import { validateOrReject } from 'class-validator';
import UserDTO, { UserStatus } from 'src/dto/user.dto';
import Game from './game.entity';
import { FriendRequest } from './friendRequest.entity';
import { GameInvitation } from './gameInvitation.entity';
import { ChannelMember } from './channel.entity';


@Entity('Users')
export default class User {

	constructor(user?: UserDTO) {
		if (!user)
			return;

		this.id = user.id;
		this.intraId = user.intraId;
		this.nameIntra = user.nameIntra;
		this.email = user.email;
		this.nameFirst = user.nameFirst;
		this.nameLast = user.nameLast;
		this.nameNick = user.nameNick;
		this.greeting = user.greeting;
		this.status = user.status;
		this.image = user.image;
		this.friends = user.friends;
		this.blocked = user.blocked;
	}

	@PrimaryGeneratedColumn({ name: 'user_id' })
	id: number;

	@Column({ name: 'intra_id' })
	intraId: number;

	@Column({ name: 'intra_name'})
	nameIntra: string;

	@Column({ name: 'intra_email' })
	email: string;

	@Column({ name: 'first_name'})
	nameFirst: string;

	@Column({ name: 'last_name'})
	nameLast: string;

	@Column({ name: 'nickname' })
	nameNick: string;

	@Column({ default: 'Hello, I have just landed!' })
	greeting: string;

	@Column({
		type: 'enum',
		enum: UserStatus,
		default: UserStatus.Offline,
	})
	status: UserStatus;

	@Column({
		name: 'profile_photo',
		default: 'default_profile_photo.png'
	})
	image: string;

	@Column({
		type: 'text',
		array: true,
		default: '{}'
	})
	friends: string[];

	@Column({
		type: 'text',
		array: true,
		default: '{}'
	})
	blocked: string[];

	@Column({ name: 'token' })
	accessToken: string;

	@Column({
		name: '2fa_secret',
		nullable: true,
		default: null
	})
	twoFactorSecret: string;

	@CreateDateColumn({ name: 'created_at' })
	created: Date;

	@OneToMany(
		() => Game,
		(game) => game.player1
	)
	player1Game: Game[];

	@OneToMany(
		() => Game,
		(game) => game.player2
	)
	player2Game: Game[];

	@OneToMany(
		() => FriendRequest,
		(friendRequest: FriendRequest) => friendRequest.sender
	)
	senderFriendRequests: FriendRequest[];

	@OneToMany(
		() => FriendRequest,
		(friendRequest: FriendRequest) => friendRequest.receiver
	)
	receiverFriendRequests: FriendRequest[];

	@OneToMany(
		() => GameInvitation,
		(gameInvitation: GameInvitation) => gameInvitation.sender
	)
	senderGameInvitations: GameInvitation[];

	@OneToMany(
		() => GameInvitation,
		(gameInvitation: GameInvitation) => gameInvitation.receiver
	)
	receiverGameInvitations: GameInvitation[];

	@OneToMany(
		() => ChannelMember,
		(channelMember: ChannelMember) => channelMember.user
	)
	channelMember: ChannelMember[];

	async validate() {
		await validateOrReject(this);
	}
}
