import { Entity, PrimaryGeneratedColumn, PrimaryColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn} from 'typeorm';
import { IsBoolean } from 'class-validator';
import { Message } from './message.entity';
import User from './user.entity';
import { MessageNotification } from './messageNotification.entity';


export enum ChannelTypes {
	public = 'public',
	protected = 'protected',
	private = 'private',
	chat = 'chat',
}

export enum ChannelMemberTypes {
	owner = 'owner',
	admin = 'admin',
	member = 'member',
}

// Channel entity
@Entity('Channels')
export class Channel {
	@PrimaryGeneratedColumn()
	channel_id: number;

	@Column({
		type: 'enum',
		enum: ChannelTypes,
		default: 'public',
	})
	ch_type: ChannelTypes;

	// @Column({ nullable: true })
	// isDirectMessage: string;

	@IsBoolean()
	@Column({ name: 'is_active', type: 'boolean', default: true })
	isActive: boolean;

	@IsBoolean()
	@Column({ name: 'is_direct', type: 'boolean', default: false })
	isDirectMessage: boolean;

	// @Column({ type: 'varchar', nullable: false })
	// ch_owner: string;

	@ManyToOne(() => User, (user: User) => user.channelMember, {
		nullable: false,
		eager: true
	})
	@JoinColumn({name: 'ch_owner'})
	ch_owner: User;

	@Column({ type: 'varchar', nullable: true, default: null })
	password: string | null;

	@Column({ type: 'varchar', length: 50, default: 'Welcome to my Channel!' })
	title: string;

	@Column({ type: 'varchar', length: 50, default: 'default_channel_photo.png' })
	channel_photo: string;

	@CreateDateColumn()
	created: Date;

	@Column("text", { array: true, default: '{}' })		// NB should move this info into channel member?
	banned: string[];

	@Column("text", { array: true, default: '{}' })		// NB should move this info into channel member?
	muted: string[];

	@OneToMany(() => Message, (message: Message) => message.channel)
	messages: Message[];

	@OneToMany(() => ChannelMember, (channelMember: ChannelMember) => channelMember.channel)
	members: ChannelMember[];
}

// Channel_Members entity
@Entity('Channel_Members')
export class ChannelMember {

	@PrimaryGeneratedColumn( {name: 'channel_member_id'} )
	channel_members_id: number

	@ManyToOne(() => Channel, (channel: Channel) => channel.members, {
		nullable: false,
		eager: true})
	@JoinColumn({ name: 'channel_id' })
	channel: Channel;

	@ManyToOne(() => User, (user: User) => user.channelMember, {
		nullable: false,
		eager: true})
	@JoinColumn({ name: 'user_id' })
	member: User;

	@Column({ nullable: true })		// NB what is it?
	name: string;

	@Column({
		type: 'enum',
		enum: ChannelMemberTypes,
		default: ChannelMemberTypes.member,
	})
	member_role: ChannelMemberTypes;
	
	@OneToMany(() => Message, (message: Message) => message.sender)
	sender: Message[];

	@OneToMany(() => MessageNotification, (chatNotification: MessageNotification) => chatNotification.receiver)
	chatNotification: MessageNotification[];
}
