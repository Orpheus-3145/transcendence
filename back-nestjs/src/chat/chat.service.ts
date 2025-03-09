import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Channel, ChannelMember, ChannelMemberType, ChannelType } from 'src/entities/chat.entity';
import {ChatDTO } from '../dto/chat.dto'
// import { NotificationService } from 'src/notification/notification.service';
// import { UsersService } from 'src/users/users.service';
import User from 'src/entities/user.entity';
// import { Notification } from 'src/entities/notification.entity'
// import { NotificationGateway } from 'src/notification/notification.gateway';
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

		// @Inject(forwardRef(() => UsersService))
		// private readonly userService: UsersService,

		// @Inject(forwardRef(() => NotificationService))
		// private readonly notificationService: NotificationService,

		// private readonly notificationGateway: NotificationGateway,
	) {}

	// // Create or find a channel
	// async findOrCreateChannel(channelData: Partial<Channel>): Promise<Channel> {
	// 	let channel = await this.channelRepository.findOneBy({
	// 		title: channelData.title,
	// 	});
	// 	if (!channel) {
	// 		channel = this.channelRepository.create(channelData);
	// 		await this.channelRepository.save(channel);
	// 	}
	// 	return channel;
	// }

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
	  
	// Add user to a channel
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

	// async createMessage(sender_id: number, receiver_id: number, content: string): Promise<Message> {
	// 	const message = this.messageRepository.create({
	// 		sender_id,
	// 		receiver_id,
	// 		content,
	// 	});
	
	// 	const savedMessage = await this.messageRepository.save(message);
	// 	console.log('Saved Message in service', savedMessage);
	
	// 	return savedMessage;
	// }
	
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
		await this.messageRepository.save(newMessage)

		// NB create notification for the non-blocked channel members
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

	// Remove user to a channel
	// async removeUserFromChannel(user_id: number, channel_id: number, role: string) {
	//   // Find the user's membership in the channel
	//   const membership = await this.channelMemberRepository.findOne({
	// 	where: { user_id, channel_id },
	//   });
	//   console.log('Membership:', membership.memberRole);
	//
	//   if (!membership) {
	// 	throw new Error('User is not a member of the channel');
	//   }
	//   // Check if the user is the owner of the channel
	//   if (membership.memberRole === 'owner') {
	// 		// Transfer ownership to another admin or member
	// 		const otherMembers = await this.channelMemberRepository.find({
	// 			where: { channel_id },
	// 			order: { memberRole: 'ASC' }, // Admins will appear before members
	// 		});
	//
	// 		if (otherMembers.length > 1) {
	// 			// Assign the first non-owner member as the new owner
	// 			const newOwner = otherMembers.find(
	// 				(member: ChannelMember) => member.user_id !== user_id
	// 			);
	// 			console.log(newOwner);
	// 			if (newOwner) {
	// 				newOwner.memberRole = 'owner';
	// 				await this.channelMemberRepository.save(newOwner);
	// 			}
	//
	// 			this.changeOwner(channel_id, newOwner.name);
	//
	// 		} else {
	// 			console.log('Channel empty!');
	// 			// If the channel is empty, delete the channel
	// 			await this.channelMemberRepository.delete({ channel_id });
	// 			await this.channelRepository.delete({ channel_id });
	// 			return;
	// 		}
	//   	}
	//   await this.channelMemberRepository.delete({ user_id, channel_id });
	// }

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

	// Send a message
	// async sendMessage( sender_id: number, receiver_id: number, content: string ,
	// ): Promise<Message> {
	// 	const message = this.messageRepository.create({
	// 		sender_id,
	// 		receiver_id,
	// 		content,
	// 	});

	// 	// const updatedMessages = await this.messageRepository.find({
	// 	// 	where: { receiver_id },
	// 	// 	relations: ['sender'],
	// 	// });

	// 	return this.messageRepository.save(message);
	// }

	// async saveMessage(sender_id: number, receiver_id: number, content: string): Promise<Message> {	
	// 	const channel: Channel = await this.channelRepository.findOne({
	// 	  where: { channel_id: receiver_id },
	// 	});

	// 	if (!channel) {
	// 	  throw new Error(`Channel with id ${receiver_id} not found`);
	// 	}
		
	// 	if (!channel.muted.find((item: string) => item === sender_id.toString()))
	// 	{
	// 		var members: ChannelMember[] = await this.channelMemberRepository.find({where: {channel_id: channel.channel_id}});		
	// 		members.map(async (member: ChannelMember) =>
	// 		{
	// 			if (member.user_id != sender_id)
	// 			{
	// 				var user: User = await this.userService.findOneId(member.user_id);
	// 				if (user != null)
	// 				{
	// 					var noti: Notification = await this.notificationService.initGroupMessage(channel, user, content);
	// 					this.notificationGateway.sendNotiToFrontend(noti);
	// 				}
	// 			}
	// 		});
	// 	}

	// 	const message = this.messageRepository.create({
	// 	  sender_id,
	// 	  content,
	// 	  channel,
	// 	});

	// 	const savedMessage = await this.messageRepository.save(message);
	// 	// console.log('Saved Mdessage->>', savedMessage);  // Log the saved message for debugging
	  
	// 	return savedMessage;
	// }
	  
	// async getMessagesForChannel(channel_id: number): Promise<Message[]> {
	// 	// Fetch all messages for the channel, including sender details if necessary
	// 	return this.messageRepository.find({
	// 	  	where: { channel: { channel_id } },
	// 	  	relations: ['channel'],
	// 	  	order: { created: 'ASC' },
	// 	});
	// }
	
	async getMessagesForChannel(channel: number | Channel): Promise<Message[]> {

		if ( channel instanceof Channel)
			channel = channel.channel_id;
	
		return this.messageRepository.find({
		  	where: { channel: { channel_id: channel } },
		  	order: { created: 'ASC' },
		});
	}
	
	// // Get messages for a channel
	// async getChannelMessages(channel_id: number): Promise<Message[]> {
	// 	return this.messageRepository.find({ where: { receiver_id: channel_id } });
	// }

 	// Fetch channel by ID
 	// async getChannelById(channel_id: number): Promise<Channel | null> {
	// 	return this.channelRepository.findOne({
	// 		where: { channel_id: channel_id },
	// 	});
 	// }

 	// Fetch channel user
 	// async getUserById(user_id: number, channel_id: number): Promise<ChannelMember | null> {
	// 	return this.channelMemberRepository.findOne({
	// 		where: { user_id, channel_id },  
	// 	});
 	// }

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
	
	// async deleteChannel(channel_id: number): Promise<Channel | null> {
	// 	try {
	// 		const channel = await this.getChannelById(channel_id);
	// 		if (!channel) {
	// 			return null;
	// 		}
	// 		// Delete associated messages if necessary
	// 		await this.messageRepository.delete({ channel: { channel_id } });
	// 		// Delete associated channel members if necessary
	// 		await this.channelMemberRepository.delete({ channel_id });
	// 		// Delete the channel itself
	// 		await this.channelRepository.remove(channel);
	// 		// console.log('Channel service', channel);
	// 		return channel;
	// 	} catch (error) {
	// 		console.error('Error in deleting channel:', error);
	// 		throw new Error('Error deleting channel');
	// 	}
	// }

	async deleteChannel(channelToDelete: number | Channel): Promise<Channel> {

		if (typeof channelToDelete === 'number')
			channelToDelete = await this.channelRepository.findOne({ where: { channel_id: channelToDelete }});

		// because of the 'ON CASCADE' option, every message and every channel member
		// related to chis channel will be removed as well 
		await this.channelRepository.delete({ channel_id: channelToDelete.channel_id });

		return (channelToDelete);
	}

	// async changePrivacy(channel_type: string, channel_id: number, password: string) : Promise<Channel | null> {
	// 	try {
	// 		const channel = await this.getChannelById(channel_id);
	// 		if (!channel) {
	// 			return null;
	// 		}
	// 		channel.channel_type = channel_type;
	// 		channel.password = password;
	// 		await this.channelRepository.save(channel);
	// 		return channel;
	// 	} catch (error) {
	// 		console.error(`Error changing channel privacy: ${error}`);
	// 		return null;
	// 	}
	// }

	async changePrivacy(channelToChange: number | Channel, channel_type: ChannelType, password: string | null): Promise<Channel> {
		
		if (typeof channelToChange === 'number')
			channelToChange = await this.channelRepository.findOne({ where: { channel_id: channelToChange }});

		channelToChange.channel_type = channel_type;
		channelToChange.password = password;

		return (await this.channelRepository.save(channelToChange));
	}

	// async changeOwner(channel_id: number, new_owner: string) : Promise<void> {
	// 	const channel = await this.getChannelById(channel_id);
	// 	if (!channel) {
	// 		throw new Error(`Channel with ID ${channel_id} not found`);
	// 	}
	// 	channel.channel_owner = new_owner;
	// 	await this.channelRepository.save(channel);
	// }

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

	// async changeUserRole(user_id: number, channel_id: number, new_role: string) : Promise<boolean> {
	// 	const user = await this.getUserById(user_id, channel_id);
	// 	if (!user) {
	// 		return false;
	// 	}
	// 	user.memberRole = new_role;
	// 	await this.channelMemberRepository.save(user);
	// 	return true;
	// }

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


