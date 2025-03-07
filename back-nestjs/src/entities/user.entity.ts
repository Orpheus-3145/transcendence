import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, Unique } from 'typeorm';
import { IsAscii, Length, validateOrReject } from 'class-validator';
import { UserStatus } from 'src/dto/user.dto';
import Game from './game.entity';
import { FriendRequest } from './friendRequest.entity';
import { GameInvitation } from './gameInvitation.entity';
import { ChannelMember } from './chat.entity';
import { Message } from './message.entity';
import { MessageNotification } from './messageNotification.entity';


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

	@OneToMany(() => FriendRequest, (friendRequest: FriendRequest) => friendRequest.sender)
	senderFriendRequests: FriendRequest[];

	@OneToMany(() => FriendRequest, (friendRequest: FriendRequest) => friendRequest.receiver)
	receiverFriendRequests: FriendRequest[];

	@OneToMany(() => GameInvitation, (gameInvitation: GameInvitation) => gameInvitation.sender)
	senderGameInvitations: GameInvitation[];

	@OneToMany(() => GameInvitation, (gameInvitation: GameInvitation) => gameInvitation.receiver)
	receiverGameInvitations: GameInvitation[];

	// @OneToMany(() => MessageNotification, (messNotification: MessageNotification) => messNotification.receiver)
	// receiverMessageNotifications: MessageNotification[];

	// @OneToMany(() => Message, (message: Message) => message.sender)
	// senderMessage: Message[];

	@OneToMany(() => ChannelMember, (channelMember: ChannelMember) => channelMember.member)
	channelMember: ChannelMember[];

	async validate() {
		await validateOrReject(this);
	}
}
