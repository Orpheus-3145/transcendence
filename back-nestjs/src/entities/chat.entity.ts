import {Entity,	PrimaryGeneratedColumn, PrimaryColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn} from 'typeorm';

// Channel entity
@Entity('Channels')
export class Channel {
	@PrimaryGeneratedColumn()
	channel_id: number;

	@Column({
		type: 'enum',
		enum: ['public', 'protected', 'private', 'chat'],
		default: 'public',
	})

	ch_type: string;

	ch_owner: string;

	password: string | null;

	@Column({ type: 'varchar', length: 50, default: 'Welcome to my Channel!' })
	title: string;

	@Column({ type: 'varchar', length: 50, default: 'default_channel_photo.png' })
	channel_photo: string;

	@CreateDateColumn()
	created: Date;

	@OneToMany(() => ChannelMember, (channelMember: ChannelMember) => channelMember.channel)
	members: ChannelMember[];
}

// Channel_Members entity
@Entity('Channel_Members')
export class ChannelMember {
	@PrimaryColumn()
	user_id: number;

	@PrimaryColumn()
	channel_id: number;

	@Column({
		type: 'enum',
		enum: ['owner', 'admin', 'member'],
		default: 'member',
	})
	member_role: string;

	@ManyToOne(() => Channel, (channel: Channel) => channel.members)
	@JoinColumn({ name: 'channel_id' })
	channel: Channel;
}

// Messages entity
@Entity('Messages')
export class Message {
	@PrimaryGeneratedColumn()
	msg_id: number;

	@Column()
	sender_id: number;

	@Column()
	receiver_id: number;

	@Column('text')
	content: string;

	@CreateDateColumn()
	send_time: Date;
}

