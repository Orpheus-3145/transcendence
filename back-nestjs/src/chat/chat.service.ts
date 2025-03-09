import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

import { Channel, ChannelMember, ChannelMemberType, ChannelType } from 'src/entities/chat.entity';
import { ChatDTO } from '../dto/chat.dto'
import { NotificationService } from 'src/notification/notification.service';
import User from 'src/entities/user.entity';
import { Message } from 'src/entities/message.entity';


@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(Channel)
		private readonly channelRepository: Repository<Channel>,

		@InjectRepository(ChannelMember)
		private readonly channelMemberRepository: Repository<ChannelMember>,

		@InjectRepository(Message)
		private readonly messageRepository: Repository<Message>,

		@InjectRepository(User)
		private readonly userRepository: Repository<User>,

		@Inject()
		private readonly notificationService: NotificationService,
	) {}

	async createChannel(chatDTO: ChatDTO): Promise<Channel> {

		const channelOwner: User = await this.userRepository.findOne({ where: { id: parseInt(chatDTO.ch_owner) }});
		const newChannel = this.channelRepository.create({
			channel_type: chatDTO.ch_type,
			channel_owner: channelOwner,
			isActive: chatDTO.isActive,
			isDirectMessage: chatDTO.isDirectMessage,
			password: chatDTO.password,
			title: chatDTO.title,
			created: new Date(),
			banned: chatDTO.banned,
			muted: chatDTO.muted,
		});

		await this.channelRepository.save(newChannel);

		for (const member of chatDTO.users)
			this.addUserToChannel(newChannel, member.id);

		await this.changeUserRole(channelOwner, newChannel, ChannelMemberType.owner);

		return newChannel;
	}
	  
	async addUserToChannel(channel: number | Channel, user: number | User) {

		if (typeof channel === 'number')
			channel = await this.channelRepository.findOne({ where: { channel_id: channel }});
		
		if (typeof user === 'number')
			user = await this.userRepository.findOne({ where: { id: user }});
	
		const newMember: ChannelMember = this.channelMemberRepository.create({
			channel: channel,
			member: user,
		});

		return (await this.channelMemberRepository.save(newMember));
	}

	async createMessage(channel: number | Channel, sender: number | User, content: string): Promise<Message> {

		if (typeof channel === 'number')
			channel = await this.channelRepository.findOne({ where: { channel_id: channel }});

		if (typeof sender === 'number')
			sender = await this.userRepository.findOne({ where: { id: sender }});
		
		const memberSender: ChannelMember = await this.channelMemberRepository.findOne({
			where: {
				channel: { channel_id: channel.channel_id },
				member: { id: sender.id }
			}
		});

		const newMessage: Message = this.messageRepository.create({
			channel: channel,
			sender: memberSender,
			content: content,
		});
		await this.messageRepository.save(newMessage);

		const receivers: ChannelMember[] = await this.channelMemberRepository.find({
			where: {
				channel: { channel_id: channel.channel_id },
				member: { id: Not(memberSender.member.id) }
			}
		});

		for (const receiver of receivers)
			await this.notificationService.createMessageNotification(newMessage, receiver);

		return newMessage;
	}

	async removeUserFromChannel(userToRemove: number | User, channel: number | Channel): Promise<void> {

		if (typeof userToRemove === 'number')
			userToRemove = await this.userRepository.findOne({ where: { id: userToRemove }});

		if (typeof channel === 'number')
			channel = await this.channelRepository.findOne({ where: { channel_id: channel }});

		const memberToRemove: ChannelMember = await this.channelMemberRepository.findOne({
			where: {
				channel: { channel_id: channel.channel_id },
				member: { id: userToRemove.id }
			}
		});

		if (memberToRemove.memberRole === ChannelMemberType.owner) {

			const otherMembers: ChannelMember[] = await this.channelMemberRepository.find({
				where: { 
					channel: { channel_id: memberToRemove.channel.channel_id },
					channelMemberId: Not(memberToRemove.channelMemberId) },
				order: { memberRole: 'ASC' },
			});

			// no other members, remove channel
			if (otherMembers.length === 0) {

				this.deleteChannel(memberToRemove.channel);
				return ;
			}
			this.changeUserRole(otherMembers[0].member, otherMembers[0].channel, ChannelMemberType.owner);
		}
		await this.channelMemberRepository.delete({ channelMemberId: memberToRemove.channelMemberId });
	}

	async getMembersFromChannel(channel: number | Channel): Promise<ChannelMember[]>
	{
		if (typeof channel === 'number')
			channel = await this.channelRepository.findOne({ where: { channel_id: channel }});
	
		return (channel.members);
	}

	async banUserFromChannel(userToBan: number | User, channel: number | Channel): Promise<void>
	{
		if (typeof userToBan === 'number')
			userToBan = await this.userRepository.findOne({ where: { id: userToBan }});

		if (typeof channel === 'number')
			channel = await this.channelRepository.findOne({ where: { channel_id: channel }});

		channel.banned.push(userToBan.id.toString());
		await Promise.all([
			this.channelRepository.save(channel),
			this.removeUserFromChannel(userToBan, channel)
		]);
	}

	async unbanUserFromChannel(userToUnban: number | User, channel: number | Channel): Promise<void>
	{
		if (typeof userToUnban === 'number')
			userToUnban = await this.userRepository.findOne({ where: { id: userToUnban }});

		if (typeof channel === 'number')
			channel = await this.channelRepository.findOne({ where: { channel_id: channel }});

		channel.banned = channel.banned.filter((item: string) => item !== userToUnban.id.toString());
		await Promise.all([
			this.channelRepository.save(channel),
			this.addUserToChannel(channel, userToUnban),
		]);
	}
	
	async muteUserFromChannel(userToMute: number | User, channel: number | Channel): Promise<void>
	{
		if (typeof userToMute === 'number')
			userToMute = await this.userRepository.findOne({ where: { id: userToMute }});

		if (typeof channel === 'number')
			channel = await this.channelRepository.findOne({ where: { channel_id: channel }});

		channel.muted.push(userToMute.id.toString());
		await this.channelRepository.save(channel);
	}
	
	async unmuteUserFromChannel(userToUnmute: number | User, channel: number | Channel): Promise<void>
	{
		if (typeof userToUnmute === 'number')
			userToUnmute = await this.userRepository.findOne({ where: { id: userToUnmute }});

		if (typeof channel === 'number')
			channel = await this.channelRepository.findOne({ where: { channel_id: channel }});

		// const channel: Channel = memberToUnmute.channel;
		channel.muted = channel.muted.filter((item: string) => item !== userToUnmute.id.toString());
		await this.channelRepository.save(channel);
	}

	async getMessagesForChannel(channel: number | Channel): Promise<Message[]> {

		if ( channel instanceof Channel)
			channel = channel.channel_id;
	
		return this.messageRepository.find({
		  	where: { channel: { channel_id: channel } },
		  	order: { created: 'ASC' },
		});
	}

	async getAllChannels(): Promise<Channel[]> {
		const channels: Channel[] = await this.channelRepository.find({
			select: [
				'channel_id',
				'channel_type',
				'title',
				'channel_owner',
				'password',
				'isDirectMessage',
				'banned',
				'muted'
			],
			relations: ['members', 'messages'], // Ensure messages are included
		});
		// console.log('Channels with messages:', JSON.stringify(channels, null, 2)); // Debugging log
		return channels;
	}

	async deleteChannel(channelToDelete: number | Channel): Promise<Channel> {

		if (typeof channelToDelete === 'number')
			channelToDelete = await this.channelRepository.findOne({ where: { channel_id: channelToDelete }});

		// because of the 'ON CASCADE' option, every message and every channel member
		// related to chis channel will be removed as well 
		await this.channelRepository.delete({ channel_id: channelToDelete.channel_id });

		return (channelToDelete);
	}

	async changePrivacy(channelToChange: number | Channel, channel_type: ChannelType, password: string | null): Promise<Channel> {
		
		if (typeof channelToChange === 'number')
			channelToChange = await this.channelRepository.findOne({ where: { channel_id: channelToChange }});

		channelToChange.channel_type = channel_type;
		channelToChange.password = password;

		return (await this.channelRepository.save(channelToChange));
	}

	async promoteToOwner(newOwner: number | User, channel: number | Channel): Promise<void> {

		if (typeof newOwner === 'number')
			newOwner = await this.userRepository.findOne({ where: { id: newOwner }});

		if (typeof channel === 'number')
			channel = await this.channelRepository.findOne({ where: { channel_id: channel }});
	
		const oldOwner: User = channel.channel_owner;
		channel.channel_owner = newOwner;

		await Promise.all([
			this.channelRepository.save(channel),
			this.changeUserRole(oldOwner, channel, ChannelMemberType.admin)])
	}
	
	async changeUserRole(userToChange: number | User, channel: number | Channel, newRole: ChannelMemberType): Promise<ChannelMember> {
		
		if (typeof userToChange === 'number')
			userToChange = await this.userRepository.findOne({ where: { id: userToChange }});

		if (typeof channel === 'number')
			channel = await this.channelRepository.findOne({ where: { channel_id: channel }});
	
		const memberToChange: ChannelMember = await this.channelMemberRepository.findOne({
			where: {
				member: { id: userToChange.id },
				channel: { channel_id: channel.channel_id }
			}
		});

		memberToChange.memberRole = newRole;
		await this.channelMemberRepository.save(memberToChange);
		
		if (newRole === ChannelMemberType.owner)
			this.promoteToOwner(userToChange, channel);

		return (memberToChange);
	}
}


